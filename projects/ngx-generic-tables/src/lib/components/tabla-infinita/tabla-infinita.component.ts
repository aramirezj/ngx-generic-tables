import { trigger, transition, style, animate } from '@angular/animations';
import { Overlay } from '@angular/cdk/overlay';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { GT_Action } from '../../classes/Accion';
import { GT_APIRequest } from '../../classes/APIRequest';
import { GTTranslatePipe } from '../../directives/translate.directive';
import { SharedService } from '../../shared.service';
import { GTSearcherComponent } from '../searcher/searcher.component';
import { GTTableComponent } from '../tabla/tabla.component';
import { GTTableBase } from '../TablaMaestra';
import { GTTableActionComponent } from '../table-action/table-action.component';
import { GTTableElementComponent } from '../table-element/table-element.component';

/** Componente de la Tabla encargada del listado y tratado de entitys */
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
    standalone: true,
    imports: [NgIf, NgFor, NgSwitch, NgSwitchCase, NgTemplateOutlet, GTTranslatePipe, GTSearcherComponent, GTTableElementComponent, GTTableActionComponent, MatCheckboxModule, MatPaginatorModule, MatMenuModule, MatTooltipModule, GTTableComponent]
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
    @Input() levelTitles: string[] = [];
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
    childrenLoaded: Subject<any> = new Subject();

    suscriptionChildren: Subscription | null = null;

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
    protected preparaTabla(): void {
        this.selectable = true;
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
     * Updates the data of the table and also the child tables
     *
     * @param data New data to show
     */
    public refreshData(data: any): void {
        this.data = data ?? [];
        this.dataToShow = this.data.slice();
        if (this.searchApp) this.searchApp.control.reset();
        this.restartPagination();
        this.refreshChildTables();
    }


    /** Refresh the data of the child tables */
    public refreshChildTables(): void {
        if (this.childTable) this.childTable.refreshData(this.childTable.data);
        if (this.childInfiniteTable) this.childInfiniteTable.refreshData(this.childInfiniteTable.data);
    }




    /**
     * Insert a new children entity to an especific entity
     *
     * @param rootEntity entity root
     * @param childrenEntity children entity to add
     */
    public addNewChildrenElement(rootEntity: any, childrenEntity: any): void {
        const pos = this.data.indexOf(rootEntity);
        if (pos !== -1) {
            this.data[pos][this.nextTable] ? this.data[pos][this.nextTable].push(childrenEntity) : this.data[pos][this.nextTable] = [childrenEntity];
            this.refreshChildTables();
        }
        else {
            if (this.childInfiniteTable) this.childInfiniteTable.addNewChildrenElement(rootEntity, childrenEntity);
        }
    }

    /**
     * Get the last instance of the tables that is open
     *
     * @returns The last table
     */
    public getLastTable(): GTInfiniteTableComponent | GTTableComponent {
        if (this.childTable) return this.childTable
        else if (this.childInfiniteTable) return this.childInfiniteTable.getLastTable();
        else return this;
    }

    /**
     * Logic of selection an entity
     *
     * @param entity Entity to select
     * @param force Even if it was selected, forces the code
     */
    public select(entity: any, force?: boolean): void {
        if (this.selectable) {
            if (this.expansionRequest && (!this.coldReload || !entity[this.nextTable])) {
                if (this.selectedElement === entity && !force) {
                    this.selectedElement = null;
                    this.sendNotification({ action: 'configurar', entity: this.selectedElement });
                } else {
                    // Lógica de expansión asincrona
                    const valoresPeticion: any[] = this.expansionRequest.prepareParams(entity);
                    try {
                        this.expansionRequest.request(...valoresPeticion).subscribe(result => {
                            this.selectedElement = entity;
                            entity[this.nextTable] = result;
                            this.sendNotification({ action: 'configurar', entity: this.selectedElement });
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
                this.selectedElement = this.selectedElement === entity ? null : entity;
                console.log('quien?')
                this.sendNotification({ action: 'select', entity: this.selectedElement });
            }
        }
    }


        /**
     * Evento de notificación de cuando se ha realizado una acción
     *
     * @param entity entity sobre el cual se va a realizar la acción
     * @param accion Acción a realizar y devolver
     */
        protected doAction(entity: any, action: string): void {
            if (action === 'autoDelete') {
                this.notify.emit({ action, entity });
            } else {
                switch (action) {
                    case 'autoDelete':
                        this.sharedService.showConfirmation(this.prepareMessage(entity, this.model[0], this.visual[0])).subscribe(accept => {
                            if (accept) {
                                this.deleteElement(entity)
                                this.sendNotification({ action, entity });
                            }
                        });
                        break;
                    case 'eliminar':
                        this.sharedService.showConfirmation(this.prepareMessage(entity, this.model[0], this.visual[0])).subscribe(accept => {
                            if (accept) {
                                this.sendNotification({ action, entity });
                            }
                        });
                        break;
                    default:
                        this.sendNotification({ action, entity });
                }
            }
            if (this.overlayRef) this.close();
        }


    /**
     * Prepara el envío de datos al componente que haya invocado la tabla
     *
     * @param event Información a enviar
     * @param nivel Si procede de una tabla hija
     */
    protected sendNotification(event: { action: string, entity: any }, nivel?: string, isExpansion?: boolean): void {
        const envio: object = Object.assign({}, event);
        envio['root'] = nivel ? this.selectedElement : event.entity;
        if (nivel) envio[nivel] = event.entity;
        if (isExpansion) envio[nivel as string] = event['root'];
        /** Si es una tabla de recursión infinita, dejamos el atributo entity para no perderlo */
        if (!this.inheritance) delete envio['entity'];
        this.notify.emit(envio);
    }

    /**
     * Prepara el envío de datos a la tabla hija
     *
     * @param event Información a enviar
     * @param nivel nivel de anidación
     * @param isExpansion Si es expansión
     * @param entityPadre entityPadre del que parte la tabla
     */
    protected notifyChildTable(event: { action: string, entity: any }, nivel: string, isExpansion: boolean, entityPadre: any): void {
        if (this.checkboxMode) {
            if (event.action === 'marcados' || event.action === 'desmarcados') {
                const evento = { action: event.action, root: entityPadre };
                evento[this.nextTable] = event.entity;
                this.notify.emit(evento);
                const marcadosHijos: any[] = entityPadre[this.nextTable].filter(dato => dato.tSeleccionado === true);
                entityPadre.tSeleccionado = marcadosHijos.length === entityPadre[this.nextTable].length;
                entityPadre.tIndeterminate = marcadosHijos.length > 0 && entityPadre.tSeleccionado === false;
            } else {
                const dataToShowHijos: any[] = entityPadre[this.nextTable] ?? [];
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



    /** Recorre todas las casillas buscando los marcados, de ahí filtra los que tienen hijos
     * y si los hijos no tienen todos marcados, cambía el estado a indeterminate
     */
    protected refrescaCasillas(): void {
        const marcados: any[] = this.dataToShow.filter(dato => dato.tSeleccionado === true);
        this.casillaMaestra.all = marcados.length === this.dataToShow.length;
        this.casillaMaestra.indeterminate = !this.casillaMaestra.all ? marcados.length > 0 : false;
    }


    /**
     * Recoge la acción de clicado de la casillaMaestra y pone todas al nuevo estado
     *
     * @param event Evento del checkbox
     */
    protected clickTodasCasillas(event: MatCheckboxChange): void {
        this.dataToShow.forEach(dato => {
            if (event.checked !== dato.tSeleccionado) this.clickCasilla(dato, event)
        });
        this.casillaMaestra.all = event.checked;
        this.casillaMaestra.indeterminate = false;

    }
    /**
     * Recoge la acción de clicado de una casilla, asigna el nuevo valor al entity, y si todas
     * estan marcadas, marca la casilla maestra
     *
     * @param entity entity clicado
     * @param event Evento del checkbox
     */
    protected clickCasilla(entity: any, event: MatCheckboxChange): void {
        const accion: string = event.checked ? 'marcado' : 'desmarcado';
        entity.tSeleccionado = event.checked;
        const marcados: any[] = this.dataToShow.filter(dato => dato.tSeleccionado === true);
        this.casillaMaestra.all = marcados.length === this.dataToShow.length;
        this.casillaMaestra.indeterminate = !this.casillaMaestra.all ? marcados.length > 0 : false;

        if (!entity[this.nextTable]?.length) {
            this.notify.emit({ root: entity, accion });
        } else {
            const agrupacionEventos: any[] = [];
            entity[this.nextTable].forEach(dato => {
                // Si ya estaba marcado o desmarcado el hijo, no añado su valor
                if (dato.tSeleccionado !== event.checked) {
                    dato.tSeleccionado = event.checked;
                    agrupacionEventos.push(dato);
                }
            });
            const evento = { action: accion + 's', root: entity };
            evento[this.nextTable] = agrupacionEventos;
            const marcadosHijos = entity[this.nextTable].filter(dato => dato.tSeleccionado === true);
            entity.tIndeterminate = marcadosHijos > 0 && marcadosHijos < entity[this.nextTable].length;
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
