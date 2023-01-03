import { trigger, transition, style, animate } from '@angular/animations';
import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject } from 'rxjs';
import { GT_Action } from '../../classes/Accion';
import { GT_APIRequest } from '../../classes/APIRequest';
import { SharedService } from '../../shared.service';
import { GTSearcherComponent } from '../searcher/searcher.component';
import { GTTableComponent } from '../tabla/tabla.component';
import { GTTableBase } from '../TablaMaestra';
import { GTTableActionComponent } from '../table-action/table-action.component';
import { GTTableElementComponent } from '../table-element/table-element.component';

/** Componente de la Tabla encargada del listado y tratado de elementos */
@Component({
    selector: 'gt-infinite-table',
    templateUrl: './tabla-infinita.component.html',
    styleUrls: ['./tabla-infinita.component.scss'],
    animations: [
        trigger('inOutAnimation',
            [transition(':enter',
                [
                    style({ opacity: 0 }),
                    animate('0.1s ease-out',
                        style({ opacity: 1 }))
                ]),
            transition(':leave',
                [
                    style({ opacity: 1 }),
                    animate('0.1s ease-in',
                        style({ opacity: 0 }))
                ]
            )])
    ],
    inputs: GTTableBase.commonInputs,
    standalone:true,
    imports:[CommonModule, GTSearcherComponent, GTTableElementComponent, GTTableActionComponent, MatCheckboxModule, MatPaginatorModule, MatMenuModule, MatTooltipModule, GTTableComponent]
})
export class GTInfiniteTableComponent extends GTTableBase implements OnInit, AfterViewInit {
    /** Child Table instance */
    @ViewChild(GTTableComponent, { static: false }) childTable!: GTTableComponent;
    /** Instance of the Child Infinite Table */
    @ViewChild(GTInfiniteTableComponent, { static: false }) childInfiniteTable!: GTInfiniteTableComponent;
    /** Actions with conditions */
    @Input() actionLevels!: GT_Action[][];
    /** Actions that will be added to the child tables */
    @Input() catalogActionsLevels!: Array<string[]>;
    /** Columns to show in the table*/
    @Input() visuals!: string[][];
    /** Model columns of the collection being received*/
    @Input() models!: string[][];
    /** Collection to know the names of the attributes from which to extract the nesting*/
    @Input() levels!: string[];
    /** Collection to know the titles of the next tables*/
    @Input() levelTitles!: string[];
    /** Request that will be executed when expanding the table*/
    @Input() expansionRequest!: GT_APIRequest;
    /** Attribute to keep track of which step of the nesting we are in, starts at 0*/
    @Input() nestingIndex: number = 0;
    /** Collection of expansion requests to nest*/
    @Input() infiniteRequests!: GT_APIRequest[];
    /** Flag that will indicate if the children will always be the same as the parent*/
    @Input() inheritance!: boolean;
    /** If activated, the expansion request will only be loaded the first time it is opened, it is intended to save the contents in block*/
    @Input() coldReload: boolean = false;
    /** To indicate the fxFlex levels of the infinite table*/
    @Input() levelFxFlexes!: number[][];
    /** Emits an event when a child table has been loaded*/
    @Output() childLoaded: EventEmitter<any> = new EventEmitter<any>();
    /** Title used to provide information about the child tables*/
    childTitle: string | null = null;
    /** Attribute to keep track of what the next nesting will be*/
    nextTable: string = '';
    /** If true, it means that the next nesting is another expansion table*/
    nextTableInfinite: boolean = false;
    /** Subject to control when the child table has been loaded */
    childrenLoaded: BehaviorSubject<any> = new BehaviorSubject(0);

    constructor(
        public override sharedService: SharedService,
        public override renderer: Renderer2,
        public override overlay: Overlay,
        public override viewContainerRef: ViewContainerRef,
        private elRef: ElementRef,

    ) {
        super(sharedService, renderer, overlay, viewContainerRef);
    }

    ngOnInit(): void {
        this.selectable = this.selectable === false ? false : true;
        this.idTabla = `tabla${this.sharedService.getTableId()}`;
        this.sharedService.tableIdCounter++;
        this.preparaTabla();
    }

    ngAfterViewInit(): void {
        if (this.preselectedElement) this.select(this.preselectedElement.data);
        this.matTableRef = this.elRef.nativeElement.querySelector(`#${this.idTabla}`);
        this.seteaColumnasTamanios(this.matTableRef.clientWidth);

    }

    /** Preparación inicial de herramientas necesarias para la tabla */
    preparaTabla(): void {
        this.data = this.data ? this.data : [];
        this.dataToShow = this.data.slice();

        this.pageEvent.length = this.dataToShow?.length;
        this.pageEvent.pageIndex = 0;
        this.pagination(this.pageEvent);


        this.model = this.models[this.nestingIndex].slice();
        this.visual = this.visuals[this.nestingIndex].slice();
        this.catalogActionsLevels = this.catalogActionsLevels ?? [];
        this.actions = [];

        this.actions = this.actionLevels ? this.actionLevels[this.nestingIndex] : GT_Action.parseActions(this.catalogActionsLevels[this.nestingIndex]);
        this.nextTable = this.levels?.[this.nestingIndex];
        this.childTitle = this.levelTitles[this.nestingIndex];
        this.fxFlexes = this.levelFxFlexes ? this.levelFxFlexes[this.nestingIndex] : null;
        if (this.infiniteRequests) this.expansionRequest = this.infiniteRequests[this.nestingIndex]
        if (!this.inheritance) this.nestingIndex++;
        if (this.levels?.[this.nestingIndex]) this.nextTableInfinite = true;
        if (this.checkboxMode) this.refrescaCasillas();

    }
    /**
     * Lógica para el refresco de la tabla entera según datos que haya recibido
     *
     * @param datos Datos nuevos
     */
    refreshData(datos: any): void {
        this.data = datos ? datos : [];
        this.dataToShow = this.data.slice();
        if (this.searchApp) this.searchApp.control.reset();
        this.restartPagination();
        this.refreshChildTables();
    }

    /** Refresca las tablas hijas que tengan */
    refreshChildTables(): void {
        if (this.childTable) this.childTable.refreshData(this.childTable.data);
        if (this.childInfiniteTable) this.childInfiniteTable.refreshData(this.childInfiniteTable.data);
    }

    /**
     * Evento de notificación de cuando se ha realizado una acción
     *
     * @param elemento Elemento sobre el cual se va a realizar la acción
     * @param accion Acción a realizar y devolver
     */
    doAction(elemento: any, accion: string): void {
        if (accion === 'deleteAuto') {
            this.notify.emit({ accion, elemento });
        } else {
            switch (accion) {
                case 'eliminarT':
                    this.sharedService.showConfirmation(this.prepareMessage(elemento, this.model[0], this.visual[0])).subscribe(accept => {
                        if (accept) {
                            this.deleteElement(elemento)
                            this.sendNotification({ accion, elemento });
                        }
                    });
                    break;
                case 'eliminar':
                    this.sharedService.showConfirmation(this.prepareMessage(elemento, this.model[0], this.visual[0])).subscribe(accept => {
                        if (accept) {
                            this.sendNotification({ accion, elemento });
                        }
                    });
                    break;
            }
        }
        if (this.overlayRef) this.close();
    }


    /**
     * Realiza insercciones a elementos hijos
     *
     * @param raiz Elemento padre
     * @param elementoNuevo Elemento a añadir
     */
    addNewChildrenElement(raiz: any, elementoNuevo: any): void {
        const pos = this.data.indexOf(raiz);
        if (pos !== -1) {
            this.data[pos][this.nextTable] ? this.data[pos][this.nextTable].push(elementoNuevo) : this.data[pos][this.nextTable] = [elementoNuevo];
            this.refreshChildTables();
        }
        else {
            if (this.childInfiniteTable) this.childInfiniteTable.addNewChildrenElement(raiz, elementoNuevo);
        }
    }

    /**
     * Lógica de selección de un elemento
     *
     * @param elemento Elemento a seleccionar
     * @param forzado Si está a true, fuerza la ejecución de la lógica de selección aunque ya estuviera
     */
    select(elemento: any, forzado?: boolean): void {
        if (this.selectable) {
            if (this.expansionRequest && (!this.coldReload || !elemento[this.nextTable])) {
                if (this.selectedElement === elemento && !forzado) {
                    this.selectedElement = null;
                    this.sendNotification({ accion: 'configurar', elemento: this.selectedElement });
                } else {
                    // Lógica de expansión asincrona
                    const valoresPeticion: any[] = this.expansionRequest.prepareParams(elemento);
                    try {
                        this.expansionRequest.request(...valoresPeticion).subscribe(result => {
                            this.selectedElement = elemento;
                            elemento[this.nextTable] = result;
                            this.sendNotification({ accion: 'configurar', elemento: this.selectedElement });
                            this.childrenLoaded.subscribe(tabla => {
                                if (tabla !== 0) this.childTable = tabla;
                                this.childLoaded.emit(this.childTable);
                            });

                            if (result?.length === 0 || !result) {
                                this.sharedService.openSnackBar(`No se han recuperado ${this.childTitle}`, 1);
                            }
                        });
                    } catch (error) {
                        //Si da un error, es posiblemente porque la petición pedía un parametro obligatorio y no ha sido satisfecho
                        this.sharedService.openSnackBar(`No se ha podido recuperar ${this.childTitle}`, 1);
                    }



                }
            } else {
                this.selectedElement = this.selectedElement === elemento ? null : elemento;
                this.childrenLoaded.subscribe(tabla => {
                    this.sendNotification({ accion: 'configurar', elemento: this.selectedElement });
                    if (this.coldReload) this.childTable = tabla;
                    this.childLoaded.emit(this.childTable);
                })
            }
        }
    }


    /**
     * Prepara el envío de datos al componente que haya invocado la tabla
     *
     * @param event Información a enviar
     * @param nivel Si procede de una tabla hija
     */
    sendNotification(event: { accion: string, elemento: any }, nivel?: string, isExpansion?: boolean): void {
        const envio: object = Object.assign({}, event);
        envio['raiz'] = nivel ? this.selectedElement : event.elemento;
        if (nivel) envio[nivel] = event.elemento;
        if (isExpansion) envio[nivel as string] = event['raiz'];
        /** Si es una tabla de recursión infinita, dejamos el atributo elemento para no perderlo */
        if (!this.inheritance) delete envio['elemento'];
        this.notify.emit(envio);
    }

    /**
     * Prepara el envío de datos a la tabla hija
     *
     * @param event Información a enviar
     * @param nivel nivel de anidación
     * @param isExpansion Si es expansión
     * @param elementoPadre elementoPadre del que parte la tabla
     */
    notifyChildTable(event: { accion: string, elemento: any }, nivel: string, isExpansion: boolean, elementoPadre: any): void {
        if (this.checkboxMode) {
            if (event.accion === 'marcados' || event.accion === 'desmarcados') {
                const evento = { accion: event.accion, raiz: elementoPadre };
                evento[this.nextTable] = event.elemento;
                this.notify.emit(evento);
                const marcadosHijos: any[] = elementoPadre[this.nextTable].filter(dato => dato.tSeleccionado === true);
                elementoPadre.tSeleccionado = marcadosHijos.length === elementoPadre[this.nextTable].length;
                elementoPadre.tIndeterminate = marcadosHijos.length > 0 && elementoPadre.tSeleccionado === false;
            } else {
                const dataToShowHijos: any[] = elementoPadre[this.nextTable] ?? [];
                const marcadosHijos: any[] = dataToShowHijos.filter(dato => dato.tSeleccionado === true);
                if (this.selectedElement) {
                    this.selectedElement.tSeleccionado = marcadosHijos.length === dataToShowHijos.length;
                    this.selectedElement.tIndeterminate = marcadosHijos.length > 0 && marcadosHijos.length < dataToShowHijos.length;
                }
                const marcados: any[] = this.dataToShow.filter(dato => dato.tSeleccionado === true);
                this.casillaMaestra.all = marcados.length === this.dataToShow.length;
                this.casillaMaestra.indeterminate = !this.casillaMaestra.all ? marcados.length > 0 : false;
                this.sendNotification(event, nivel, isExpansion);
            }
        } else {
            this.sendNotification(event, nivel, isExpansion);
        }

    }

    /**
     * Obtiene la ultima tabla que esté abierta
     *
     * @returns La instancia de la última tabla
     */
    obtenUltimaTabla(): GTInfiniteTableComponent | GTTableComponent {
        if (this.childTable) return this.childTable
        else if (this.childInfiniteTable) return this.childInfiniteTable.obtenUltimaTabla();
        else return this;
    }

    /** Recorre todas las casillas buscando los marcados, de ahí filtra los que tienen hijos
     * y si los hijos no tienen todos marcados, cambía el estado a indeterminate
     */
    refrescaCasillas(): void {
        const marcados: any[] = this.dataToShow.filter(dato => dato.tSeleccionado === true);
        this.casillaMaestra.all = marcados.length === this.dataToShow.length;
        this.casillaMaestra.indeterminate = !this.casillaMaestra.all ? marcados.length > 0 : false;
    }


    /**
     * Recoge la acción de clicado de la casillaMaestra y pone todas al nuevo estado
     *
     * @param event Evento del checkbox
     */
    clickTodasCasillas(event: MatCheckboxChange): void {
        this.dataToShow.forEach(dato => {
            if (event.checked !== dato.tSeleccionado) this.clickCasilla(dato, event)
        });
        this.casillaMaestra.all = event.checked;
        this.casillaMaestra.indeterminate = false;

    }
    /**
     * Recoge la acción de clicado de una casilla, asigna el nuevo valor al elemento, y si todas
     * estan marcadas, marca la casilla maestra
     *
     * @param elemento Elemento clicado
     * @param event Evento del checkbox
     */
    clickCasilla(elemento: any, event: MatCheckboxChange): void {
        const accion: string = event.checked ? 'marcado' : 'desmarcado';
        elemento.tSeleccionado = event.checked;
        const marcados: any[] = this.dataToShow.filter(dato => dato.tSeleccionado === true);
        this.casillaMaestra.all = marcados.length === this.dataToShow.length;
        this.casillaMaestra.indeterminate = !this.casillaMaestra.all ? marcados.length > 0 : false;

        if (!elemento[this.nextTable]?.length) {
            this.notify.emit({ raiz: elemento, accion });
        } else {
            const agrupacionEventos: any[] = [];
            elemento[this.nextTable].forEach(dato => {
                // Si ya estaba marcado o desmarcado el hijo, no añado su valor
                if (dato.tSeleccionado !== event.checked) {
                    dato.tSeleccionado = event.checked;
                    agrupacionEventos.push(dato);
                }
            });
            const evento = { accion: accion + 's', raiz: elemento };
            evento[this.nextTable] = agrupacionEventos;
            const marcadosHijos = elemento[this.nextTable].filter(dato => dato.tSeleccionado === true);
            elemento.tIndeterminate = marcadosHijos > 0 && marcadosHijos < elemento[this.nextTable].length;
            this.notify.emit(evento);

            // Si tiene childTable actualmente abierta, actualizo su casilla maestra
            const childTable = this.childTable ?? this.childInfiniteTable;
            if (childTable) {
                childTable.casillaMaestra.all = event.checked;
                childTable.casillaMaestra.indeterminate = false;
            }
        }
    }
}
