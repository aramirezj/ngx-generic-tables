import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { GT_Action } from '../../classes/Accion';
import { GT_ConditionAction, GT_ConditionLogic, GT_ConditionType } from '../../classes/ConditionAction';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
/** Componente encargado de la lógica de acciones con condiciones */
@Component({
    selector: 'gt-table-action',
    templateUrl: './table-action.component.html',
    styleUrls: ['./table-action.component.scss'],
    standalone:true,
    imports:[CommonModule,MatIconModule,MatTooltipModule, MatButtonModule]
})

export class GTTableActionComponent implements OnInit {
    /** Acción con la que se trabaja */
    @Input() action!: GT_Action;
    /** Elemento sobre el que se evalua */
    @Input() element: any;
    /** Para saber si se van a pintar en un menú o no */
    @Input() actionMenu: boolean = false;
    /** Evento de notificación de la acción */
    @Output() clicked: EventEmitter<string> = new EventEmitter<string>();
    /** Para saber si está deshabilitado o no */
    disabled:boolean = true;
    constructor(
        private cdRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        if (this.action.conditionObserver) {
            this.action.conditionObserver.subscribe(() => this.checkConditions());
        } else {
            this.disabled = this.action.disabled;
        }
    }
    ngAfterViewChecked(): void {
        this.cdRef.detectChanges();
    }

    /** Check all the conditions, in case all the conditions results in true, the action is enabled */
    checkConditions() {

        let condicionesCumplidas: boolean = true;

        //Primero nos aseguramos de que la acción tenga condiciones
        if (this.action.conditions) {
            //Recorremos todas sus condiciones
            for (const condicion of this.action.conditions) {
                condicionesCumplidas = condicionesCumplidas && this.checkSingleCondition(condicion);
            }
            //Si las condiciones no se cumplen, y la acción tiene asignada una sustituta, la intercambiamos
            if (!condicionesCumplidas && this.action.replaceAction) {
                //La acción original pasará a ser la nueva sustituta.
                const reemplazoSustituta = Object.assign({}, this.action);
                //Intercambiamos las acciones
                this.action = Object.assign({}, this.action.replaceAction);
                this.action.replaceAction = reemplazoSustituta;
                this.disabled = this.action.disabled;
                this.checkConditions();
                //Si las condiciones se cumplen, habilitamos la acción
            } else if (condicionesCumplidas && this.action.replaceAction) {
                this.disabled = this.action.disabled;

                //Las condiciones no fueron cumplidas
            } else if (condicionesCumplidas) {
                this.disabled = false;
            }
            else {
                this.disabled = true;
            }
            //Si no tiene condiciones, habilitamos la acción
        } else {
            this.disabled = this.action.disabled;
        }

    }

    /**
     * Lógica para comprobar una condición
     * @param condicion Condición a comprobar
     * @returns Si la comprobación ha sido satisfactoria
     */
    checkSingleCondition(condicion: GT_ConditionAction): boolean {
        let seCumple: boolean = false;
        const valor: any = this.preparaValor(condicion.property);
        switch (condicion.conditionType) {
            case GT_ConditionType.BOOLEAN:
                switch (condicion.conditionLogic) {
                    case GT_ConditionLogic.REQUIRED:
                        seCumple = valor ? true : false;
                        break;
                    case GT_ConditionLogic.MISSING:
                        seCumple = valor ? false : true;
                        break;
                }
                break;
            case GT_ConditionType.EQUAL:
                seCumple = valor?.toLowerCase() === condicion.conditionLogic?.toLowerCase() ? true : false;
                break;
            case GT_ConditionType.DIFFERENT:
                seCumple = valor?.toLowerCase() !== condicion.conditionLogic?.toLowerCase() ? true : false;
                break;
        }
        return seCumple;
    }


    /**
     * Prepare the element to be evaluated, recovering from the nesting
     * @param property Property where it should retrieve the element
     * @returns Final value to evaluate
     */
    preparaValor(property: string): any {
        const spllited: string[] = property.split('.');
        if (spllited.length === 1) return this.element[property];

        let eleFinal = Object.assign({}, this.element);
        for (let i = 0; i < spllited.length; i++) {
            eleFinal = eleFinal[spllited[i]];
            if (!eleFinal) break;
        }
        return eleFinal;

    }


}
