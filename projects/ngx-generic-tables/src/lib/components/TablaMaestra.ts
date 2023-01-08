import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, EventEmitter, HostListener, Input, Output, Renderer2, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, filter, fromEvent, Subscription, take } from 'rxjs';
import { GT_Action } from '../classes/Accion';
import { SharedService } from '../shared.service';
import { GTSearcherComponent } from './searcher/searcher.component';



/** Tabla Maestra de la que partirán las demás implementando sus atributos y funciones comunes */
@Component({
    selector: 'gt-TablaMaestra',
    template: ''
})
export abstract class GTTableBase {
    public static commonInputs: string[] = ['data', 'visual', 'model', 'actions', 'conditionalActions', 'search',
        'formats', 'form', 'primaryKey', 'asyncPagination', 'selectable', 'paginator',
        'preselectedElement', 'objects', 'masterSelects', 'subjectLoaded', 'advancedFilter', 'checkboxMode', 'actionMenu', 'fxFlexes', 'order', 'updateRequest', 'customSort'];
    /** Visibility of the search component*/
    @ViewChild(GTSearcherComponent, { static: false }) searchApp!: GTSearcherComponent;
    /**Visibility of the paginator*/
    @ViewChild(MatPaginator, { static: false }) paginatorC!: MatPaginator;
    //Context menu
    @ViewChild('menuContextual') protected menuContextual!: TemplateRef<any>;
    /**Attribute with the collection of data to show*/
    @Input() data: any[] = [];
    /**Columns to display in the table*/
    @Input() visual: string[] = [];
    /**Columns of the model of the collection that is received*/
    @Input() model: string[] = [];
    /**Actions that should be available*/
    @Input() catalogActions!: string[];
    /**List of actions with conditions*/
    @Input() actions!: GT_Action[];
    /**Enables or disables the search of the table*/
    @Input() search: boolean = false;
    /**Primary key that the table will have. It will be used in insertions by method and edition*/
    @Input() primaryKey: string | null = null;
    /**Allows you to click on the table to select an element and send it*/
    @Input() selectable: boolean = false;
    /**Control of pagination*/
    @Input() paginator: boolean = true;
    /**Receives an element to be preselected and send the event when the table is loaded. It is searched by its primaryKey*/
    @Input() preselectedElement: { data: any, primaryKey: string } | null = null;
    /**In the case of being a child table, it will emit a value when loaded*/
    @Input() subjectLoaded: BehaviorSubject<any> | null = null;
    /**Mode to activate the checkbox mode of the table. With checkbox*/
    @Input() checkboxMode: boolean = false;
    /**Mode to activate the compression of actions in a menu*/
    @Input() actionMenu: boolean = false;
    /**Forces some sizes to the table, depending on the number of columns it has. It is used as a [fxFlex]*/
    @Input() fxFlexes: number[] | null = null;
    /** Element to notify the component that invokes the table */
    @Output() notify: EventEmitter<any> = new EventEmitter<any>();
    /** Element to notify the component that invokes the table */
    @Output() sorted: EventEmitter<Sort> = new EventEmitter<Sort>();
    /** Reference to the table itself, filled later */
    protected matTableRef;
    /** Unique identifier of the table */
    protected idTabla: string | null = null;
    /** Possible options for pagination */
    protected pageSizeOptions: number[] = [5, 10, 25, 100];
    /** Control of pagination configuration */
    protected pageEvent: PageEvent = { length: 0, pageSize: 5, pageIndex: 0 };
    /** To keep track of what order is currently being taken */
    protected actualSort: Sort | null = null;
    /** Search string updated by the gt-search */
    protected searchString: string | null = null;
    /** Data to display in the table */
    dataToShow: any[] = this.data;
    /** Auxiliary attribute to keep track of which element has been selected */
    selectedElement: any;
    /** Control of the master checkbox */
    public casillaMaestra: { all: boolean, indeterminate: boolean } = { all: false, indeterminate: false };
    /** Relationship between columns and their size */
    protected columnasTamanio: { field: string, width: number, index?: number }[] = [];
    /** To control that resizing has been pressed */
    protected isPulsado = false;
    /** To keep track of which column is currently being resized */
    protected posicionActualRedimension: number = 0;
    /** To control the start of the resizing */
    protected startX: number = 0;
    /** To control the initial size from which the column starts */
    protected startWidth: number = 0;
    /** To know if it is resizing to the left (true) if not (false) */
    protected isDireccionDerecha: boolean = false;
    /** To assign the mouse movement event */
    protected resizableMousemove!: () => void;
    /** To empty the mouse movement event later */
    protected resizableMouseup!: () => void;
    /** Attribute to keep track of why the field is being sorted */
    protected ordenActual: { modelo?: string | null, direccion?: string | null } = {};
    /** Will save record of the initial size of the table. This helps us know if it was hidden before and had 0PX, when trying to resize it will recalculate to leave it clean */
    protected tamanioInicial: number = 0;
    /** Overlay of the context menu */
    protected overlayRef: OverlayRef | null = null;
    /** Suscription of the menu */
    protected subMenu: Subscription | null = null;
    /** EventEmitter to control that even in several tables, only one menu can be open */
    protected subscriptionMenuService: Subscription | null = null;


    constructor(
        public sharedService: SharedService,
        public renderer: Renderer2,
        public overlay: Overlay,
        public viewContainerRef: ViewContainerRef
    ) {
    }


    /**
     * Pagination logic
     *
     * @param page Página recibida y a asignar
     */
    protected pagination(page?: PageEvent): void {
        this.pageEvent = page ?? this.pageEvent;
        if (this.selectedElement) this.deselect();
        if (!this.paginator) this.pageEvent.pageSize = 99999;

    }

    /** Restar the pagination */
    protected restartPagination(): void {
        this.pageEvent.pageIndex = 0;
        this.pageEvent.length = this.dataToShow.length;
    }

    /**
     * Lógica para la ordenación de los datos
     *
     * @param ordena
     */
    protected sorting(ordena: Sort): void {
        this.actualSort = ordena;
        this.sorted.emit(ordena);
        if (this.actualSort) {
            if (!this.searchString) {
                if (ordena.direction === 'asc') this.dataToShow = this.data.sort((a, b) => (a[ordena.active] > b[ordena.active]) ? 1 : -1);
                else this.dataToShow = this.data.sort((a, b) => (a[ordena.active] < b[ordena.active]) ? 1 : -1);
            } else {
                if (ordena.direction === 'asc') this.dataToShow.sort((a, b) => (a[ordena.active] > b[ordena.active]) ? 1 : -1);
                else this.dataToShow.sort((a, b) => (a[ordena.active] < b[ordena.active]) ? 1 : -1);
            }
        }
    }

    /**
     * Logic for the data filter. Creates a copy of the original to convert it in json so can filter in a better way
     *
     * @param toFilter Valor sobre el que filtrar
     */
    protected toSearch(toFilter: any): void {
        this.searchString = toFilter;
        this.dataToShow = this.data.filter((data) => JSON.stringify(data).toLowerCase().includes(this.searchString as string));
        this.restartPagination();
        if (this.selectedElement) {
            this.selectedElement = null;
            this.notify.emit({ action: 'select', elemento: null });
        }
    }

    /**
     * Replace two elements.
     * 
     *
     * @param oldElement Old element to replace
     * @param newElement New element to be added
     */
    public replaceElement(oldElement: any, newElement: any): void {
        const index: number = this.data.indexOf(oldElement);
        if (index !== -1) {
            this.data[index] = newElement;
            this.dataToShow = this.data.slice();
        } else {
            this.sharedService.openSnackBar('The element to replace couldnt be found', 3);
        }
    }

    /**
     * Logic to add a new element to the table, if this table has primary key, will try to restrict it
     * @param element Element to add
     */
    public addNewElement(element: any): void {
        if (this.primaryKey) {
            if (!this.sharedService.findRepeatRecursivo(this.data.slice(), this.primaryKey, element)) {
                this.add(element);
            }
        } else {
            this.add(element);
        }
    }

    /**
     * Add a new element
     *
     * @param elemento Elemento a addr
     */
    protected add(elemento: any): void {
        this.data.push(elemento);
        this.dataToShow = this.data.slice();
        this.pageEvent.length = this.data.length;
        this.sorting(this.actualSort as Sort);
    }

    /**
     * Deletes an element from the table
     *
     * @param element Element to delete
     */
    public deleteElement(element: any): void {
        const result = this.dataToShow.splice(this.dataToShow.indexOf(element), 1);
        if (result) {
            this.data.splice(this.data.indexOf(element), 1);
            this.pageEvent.length--;
        }
        const isEmpty: boolean = (this.pageEvent.pageIndex * this.pageEvent.pageSize) >= this.pageEvent.length;
        if (isEmpty) {
            if (this.pageEvent.pageIndex > 0) this.pageEvent.pageIndex--;
            this.pagination(this.pageEvent);
        }
    }

    /** Check again all the conditions of the actions */
    public checkConditions(): void {
        if (this.actions) {
            this.actions.forEach(action => { if (action.conditionObserver) action.conditionObserver.next(1) });
        }
    }


    /** Deselect an element and send the notification */
    public deselect(): void {
        this.selectedElement = null;
        this.notify.emit({ action: 'select', elemento: this.selectedElement });
    }

    /**
     * Get an element from the table
     *
     * @param field Field to filter
     * @param value Value of that field in the element
     * @returns Element
     */
    public getElement(field: string, value: any): any {
        const elemento: any = this.dataToShow.find(dato => dato[field] === value);
        if (elemento) return elemento;
        else this.sharedService.openSnackBar('The element to get was not found', 3);
    }

    /**
    * Cambia el orden actual, recibe para que campo se trata, ejecuta la logica pertinente y llama al evento original
    * de ordenación que teniamos con un objeto de tipo Sort
    *
    * @param modelo Campo a ordenar
    */
    protected changeSort(modelo: string): void {
        if (this.ordenActual.modelo && this.ordenActual.modelo !== modelo) {
            this.ordenActual.direccion = null;
        }
        this.ordenActual.modelo = this.ordenActual.modelo && this.ordenActual.modelo !== modelo ? null : modelo;
        this.ordenActual.direccion = this.ordenActual.direccion ? this.ordenActual.direccion === 'DESC' ? null : 'DESC' : 'ASC';
        this.ordenActual.modelo = this.ordenActual.direccion ? modelo : null;
        const objSort = { active: this.ordenActual.modelo, direction: this.ordenActual.direccion?.toLowerCase() };
        this.sorting(objSort as Sort);
    }


    /**
     * Se encarga de establecer calcular el width que deberá tener cada columna, luego al haber actualizado el columns,
     * llama a otra función que lo aplica en el HTML
     *
     * @param anchuraTabla Anchura actual de la tabla
     */
    protected seteaColumnasTamanios(anchuraTabla: number): void {
        //Si no se ha detectado el tamaño de la tabla por la razón que sea, la seteamos a 5000 para que tenga de sobra
        this.tamanioInicial = anchuraTabla;
        let iTotal: number = 0;
        let numeroColumnas = this.model.length;
        if (this.actions || (!this.fxFlexes)) numeroColumnas += 0.5;
        const widthBase: number = 100 / numeroColumnas;
        for (let i = 0; i < this.model.length; i++) {
            this.columnasTamanio.push({ field: this.model[i], width: this.fxFlexes ? this.fxFlexes[i] : widthBase });
            iTotal++;
        }



        if (this.actions) this.columnasTamanio.push({ field: 'acciones', width: this.fxFlexes ? this.fxFlexes.pop() as number : widthBase / 2 });
        let totWidth = 0;
        this.columnasTamanio.forEach((column) => {
            totWidth += column.width;
        });
        const scale = (anchuraTabla - 5) / totWidth;
        this.columnasTamanio.forEach((column) => {
            column.width *= scale;
            this.seteaColumnaTamanioHTML(column);
        });
    }

    /**
     * Función que comienza a recoger información sobre la columna que se está redimensionando ahora mismo
     *
     * @param event Evento JS
     * @param index Posición de la columna
     */
    protected onRedimensionarColumna(event: any, index: number): void {
        this.compruebaDireccion(event, index);
        this.posicionActualRedimension = index;
        this.isPulsado = true;
        this.startX = event.pageX;
        this.startWidth = event.target.parentElement.clientWidth;
        event.preventDefault();
        this.seteaEventosRaton(index);
    }
    /**
     * Lógica para averiguar si está redimensionando a la izquierda o a la derecha
     *
     * @param event Evento JS
     * @param index Posición de la columna
     */
    protected compruebaDireccion(event: any, index: number): void {
        const cellData: DOMRect = this.recuperaCeldaCabecera(index);
        if ((index === 0) || (Math.abs(event.pageX - cellData.right) < cellData.width / 2 && index !== this.columnasTamanio.length - 1)) {
            this.isDireccionDerecha = true;
        } else {
            this.isDireccionDerecha = false;
        }
    }

    /**
     * Obtiene la información de la cabecera de la tabla, que columna en concreto
     *
     * @param index Celda en concreto
     * @returns El tamaño y posición actual de la celda
     */
    protected recuperaCeldaCabecera(index: number): DOMRect {
        const headerRow = this.matTableRef.children[0];
        const cell = headerRow.children[index];
        return cell.getBoundingClientRect();
    }

    /**
     * En el momento de clic de una de las paredes de redimensionamiento, asigna los eventos de movimiento de ratón y clic liberado para con
     * el primero hacer ejecutar el seteo de tamaño de columna, y con el segúndo, limpiar todo
     *
     * @param index Posición de la columna
     */
    protected seteaEventosRaton(index: number): void {
        this.resizableMousemove = this.renderer.listen('document', 'mousemove', (event) => {
            if (this.isPulsado && event.buttons) {
                const dx = (this.isDireccionDerecha) ? (event.pageX - this.startX) : (-event.pageX + this.startX);
                const width = this.startWidth + dx;
                if (this.posicionActualRedimension === index && width > 50) {
                    this.seteaNuevasColumnasTamanio(index, width);
                }
            }
        });

        // Para limpiar los eventos
        this.resizableMouseup = this.renderer.listen('document', 'mouseup', (event) => {
            if (this.isPulsado) {
                this.isPulsado = false;
                this.posicionActualRedimension = -1;
                this.resizableMousemove();
                this.resizableMouseup();
            }
        });
    }

    /**
     * Calcula y setea en el array el nuevo tamaño que tendrá la columna
     *
     * @param index Posición de la columna
     * @param width Tamaño nuevo
     */
    protected seteaNuevasColumnasTamanio(index: number, width: number): void {
        const orgWidth: number = this.columnasTamanio[index].width;
        const dx: number = width - orgWidth;
        if (dx !== 0) {
            const j: number = this.isDireccionDerecha ? index + 1 : index - 1;
            const newWidth: number = this.columnasTamanio[j].width - dx;
            if (newWidth > 50) {
                this.columnasTamanio[index].width = width;
                this.seteaColumnaTamanioHTML(this.columnasTamanio[index]);
                this.columnasTamanio[j].width = newWidth;
                this.seteaColumnaTamanioHTML(this.columnasTamanio[j]);
            }
        }
    }
    /**
     * Setea en la columna HTML el nuevo tamaño a través de la clase
     *
     * @param column Columna a modificar
     */
    protected seteaColumnaTamanioHTML(column: any): void {
        const columnEls = Array.from(this.matTableRef.getElementsByClassName(`${this.idTabla}-columna-${column.field}`));
        columnEls.forEach((el: any) => el.style.width = column.width + 'px');
    }



    //Menu contextual
    /**
     * 
     * @param param0 Posición clicada
     * @param elemento Elemento clicado
     */
    protected open({ x, y }: MouseEvent, elemento: any) {
        this.close();
        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo({ x, y })
            .withPositions([{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }]);

        this.overlayRef = this.overlay.create({ positionStrategy, scrollStrategy: this.overlay.scrollStrategies.close() });
        this.overlayRef.attach(new TemplatePortal(this.menuContextual, this.viewContainerRef, { $implicit: elemento }));

        this.subMenu = fromEvent<MouseEvent>(document, 'click').pipe(filter(event => {
            const clickTarget = event.target as HTMLElement;
            return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
        }), take(1)
        ).subscribe(() => this.close());

        //Emito un valor para que todas las demás tablas se cierren
        this.sharedService.menuContextualAbierto.emit(true);
        this.subscriptionMenuService = this.sharedService.menuContextualAbierto.subscribe(() => this.close());

    }
    /** Cierra el menú */
    protected close() {
        this.subMenu && this.subMenu.unsubscribe();
        //Si estoy suscrito, me desuscribo porque al abrir no me interesa autocerrarme
        if (this.subscriptionMenuService) {
            this.subscriptionMenuService.unsubscribe();
            this.subscriptionMenuService = null;
        }
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }


    /**
    * Escucha del evento de resize de la ventana para recalcular los tamaños de la tabla
    *
    * @param event Evento de redimensión
    */
    @HostListener('window:resize', ['$event'])
    onResize(): void {
        this.seteaColumnasTamanios(this.matTableRef.clientWidth);
    }


    /**
     * Prepare the message for deleting
     * @param element Element to delete
     * @param model From where should it take the information
     * @param visual How should it show it to the user
     * @returns The message
     */
    protected prepareMessage(element: any, model: string, visual: string): string {
        return `Are you sure about deleting the element with the ${visual} : ${element[model]}?`;
    }





}
