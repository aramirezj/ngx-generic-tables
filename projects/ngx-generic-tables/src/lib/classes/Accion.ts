import { BehaviorSubject } from 'rxjs';
import { GT_ConditionAction } from './ConditionAction';

/** Class used in the tables for the actions */
export class GT_Action {
    /** Catálogo de acciones predefinidas con su descripción e icono */
    static catalog: object =
        {
            delete: { description: 'Delete element', icon: 'clear' },
            deleteAuto: { description: 'Delete element', icon: 'clear' },
            edit: { description: 'Edit elemento', icon: 'edit' },
            inspect: { description: 'Inspect element', icon: 'remove_red_eye' },
            search: { description: 'Search element', icon: 'search' },
            emptySpot: { description: '', icon: '' },
        };

    /** Observer so the actionElement can subscribe it */
    conditionObserver: BehaviorSubject<number> | null = null;
    /** Condiciones que puede tener una GTAccion */
    conditions: GT_ConditionAction[] = [];
    /** In case the action has condition, to replace it for this one */
    replaceAction?: GT_Action;
    constructor(
        public purpose: string,
        public description?: string,
        public icon?: string,
        public disabled: boolean = false

    ) {
        this.description = GT_Action.catalog[this.purpose].description;
        this.icon = GT_Action.catalog[this.purpose].icon;
        this.disabled = disabled ?? false;
    }


    /**
     * Add a list of conditions to a list of actions
     *
     * @param conditions Condition to bind
     * @param acciones Actions that will receive the conditions
     */
    static addConditionToActions(conditions: GT_ConditionAction[], acciones: GT_Action[]): void {
        conditions.forEach(condicion => {
            const behaviour = new BehaviorSubject(0);
            acciones.forEach(accion => {
                accion.conditionObserver = accion.conditionObserver ?? behaviour;
                accion.conditions = accion.conditions ?? [];
                accion.conditions.push(condicion);
            });
        });
    }

    /**
    * Functions that receives a list of purposes of the actions, look in the catalogo and return the transformation
    *
    * @param purposes List of purposes of the actions.
    * @returns List of actions
    */
    static parseActions(purposes: string[]): GT_Action[] {
        if (purposes) {
            const parsedActions: GT_Action[] = [];
            for (const purpose of purposes) {
                const accionParsed = new GT_Action(purpose);
                parsedActions.push(accionParsed);
            }
            return parsedActions;
        } else {
            return [];
        }
    }


}
