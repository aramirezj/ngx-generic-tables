import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { GT_Action } from '../../classes/Accion';
import { SharedService } from '../../shared.service';
import { GTSearcherComponent } from '../searcher/searcher.component';
import { GTTableBase } from '../TablaMaestra';
import { GTTableActionComponent } from '../table-action/table-action.component';
import { GTTableElementComponent } from '../table-element/table-element.component';
import { MatMenuModule } from '@angular/material/menu';
/** Componente de la Tabla encargada del listado y tratado de elementos */
@Component({
    selector: 'gt-table',
    templateUrl: './tabla.component.html',
    styleUrls: ['./tabla.component.scss'],
    inputs: GTTableBase.commonInputs,
    standalone: true,
    imports: [CommonModule, GTSearcherComponent, GTTableElementComponent, GTTableActionComponent, MatCheckboxModule, MatPaginatorModule, MatMenuModule]
})
export class GTTableComponent extends GTTableBase implements OnInit, AfterViewInit {
    /** Referencia a la propia tabla */
    override matTableRef: any;
    constructor(
        public override sharedService: SharedService,
        public override renderer: Renderer2,
        private elRef: ElementRef,
        public override overlay: Overlay,
        public override viewContainerRef: ViewContainerRef

    ) {
        super(sharedService, renderer, overlay, viewContainerRef);
    }


    ngOnInit(): void {
        this.preparaTabla();
        this.idTabla = `tabla${this.sharedService.getTableId()}`;
        this.sharedService.tableIdCounter++;
    }

    ngAfterViewInit(): void {
        if (this.preselectedElement) this.select(this.preselectedElement.data, this.preselectedElement.primaryKey, true);
        if (this.subjectLoaded) this.subjectLoaded.next(this);

        this.matTableRef = this.elRef.nativeElement.querySelector(`#${this.idTabla}`);
        this.seteaColumnasTamanios(this.matTableRef.clientWidth);
    }

    /** Preparación inicial de herramientas necesarias para la tabla */
    protected preparaTabla(): void {
        this.data = this.data ? this.data : [];
        this.dataToShow = this.data.slice();
        this.actions = this.actions ?? GT_Action.parseActions(this.catalogActions);

        //Si contiene la acción de configurar, se debe permitir la selección, usado por las tablas infinitas
        const index = this.actions.findIndex(accion => accion.purpose === 'select');
        if (index !== -1) this.selectable = true;

        this.pageEvent.length = this.dataToShow?.length;
        this.pageEvent.pageIndex = 0;
        if (!this.paginator) this.pageEvent.pageSize = 99999;
        this.pagination(this.pageEvent);
        if (this.checkboxMode) {
            const marcados: any[] = this.dataToShow.filter(dato => dato.tSeleccionado === true);
            this.casillaMaestra.all = marcados.length === this.dataToShow.length;
            this.casillaMaestra.indeterminate = !this.casillaMaestra.all ? marcados.length > 0 : false;
        }

    }
    /**
     * Forces a refresh of the data showed in the table
     *
     * @param data New data
     * @param blockPage If true, it will not send a pagination event
     */
    public refreshData(data: any[], blockPage?: boolean): void {
        this.data = data ?? [];
        this.dataToShow = this.data.slice();
        if (this.searchApp) this.searchApp.control.reset();
        if (!blockPage) this.restartPagination();
    }
    /**
     * Evento de notificación de cuando se ha realizado una acción
     *
     * @param elemento Elemento sobre el cual se va a realizar la acción
     * @param accion Acción a realizar y devolver
     */
    protected doAction(elemento: any, accion: string): void {
        if (accion === 'deleteAuto') {
            this.notify.emit({ accion, elemento });
        } else {
            switch (accion) {
                case 'eliminarT':
                    this.sharedService.showConfirmation(this.prepareMessage(elemento, this.model[0], this.visual[0])).subscribe(accept => {
                        if (accept) {
                            this.data.splice(this.data.indexOf(elemento), 1);
                            this.dataToShow.splice(this.dataToShow.indexOf(elemento), 1);
                            this.notify.emit({ accion, elemento });
                        }
                    });
                    break;
                case 'eliminar':
                    console.log(this.prepareMessage(elemento, this.model[0], this.visual[0]))
                    this.sharedService.showConfirmation(this.prepareMessage(elemento, this.model[0], this.visual[0])).subscribe(accept => {
                        if (accept) {
                            this.notify.emit({ accion, elemento });
                        }
                    });
                    break;
            }
        }
        if (this.overlayRef) this.close();
    }




    /**
     * Selects an element. If the property its pass, it will try to find it, and if preSelect is true, it will set the value of the first model to the searcher
     *
     * @param element Element to select
     * @param property Property to filter
     * @param preSelect If true, will write in the searcher the model
     */
    public select(element: any, property?: string, preSelect?: boolean): void {
        if (this.selectable) {
            if (property) {
                const elementEncontrado: any = this.dataToShow.find(dato => dato[property] === element[property]);
                this.selectedElement = elementEncontrado;
            } else {
                this.selectedElement = this.selectedElement === element ? null : element;
            }
            if (preSelect) this.searchApp.control.setValue(element[this.model[0]])

            this.notify.emit({ accion: 'select', element: this.selectedElement });
        }
    }

    /**
     * Recoge la acción de clicado de la casillaMaestra y pone todas al nuevo estado
     *
     * @param event
     */
    protected clickTodasCasillas(event: MatCheckboxChange): void {
        this.casillaMaestra.all = event.checked;
        this.casillaMaestra.indeterminate = false;

        const accion: string = event.checked ? 'marcado' : 'desmarcado';
        const agrupacionEventos: any[] = [];
        this.dataToShow.forEach(dato => {
            if (dato.tSeleccionado !== event.checked) {
                dato.tSeleccionado = event.checked;
                // En el caso de ser una tabla hija, agrupa todos los elementos y los envia
                if (this.subjectLoaded) agrupacionEventos.push(dato);
                else this.doAction(dato, accion);
            }
        });
        if (this.subjectLoaded) this.notify.emit({ elemento: agrupacionEventos, accion: accion + 's' });

    }

    /**
     * Recoge la acción de clicado de una casilla, asigna el nuevo valor al elemento, y si todas
     * estan marcadas, marca la casilla maestra
     *
     * @param elemento Elemento clicado
     * @param event Evento del checkbox
     */
    protected clickCasilla(elemento: any, event: MatCheckboxChange): void {
        elemento.tSeleccionado = event.checked;
        const marcados: any[] = this.dataToShow.filter(dato => dato.tSeleccionado === true);
        this.casillaMaestra.all = marcados.length === this.dataToShow.length;
        this.casillaMaestra.indeterminate = !this.casillaMaestra.all ? marcados.length > 0 : false;

        this.doAction(elemento, event.checked ? 'marcado' : 'desmarcado');

    }
}
