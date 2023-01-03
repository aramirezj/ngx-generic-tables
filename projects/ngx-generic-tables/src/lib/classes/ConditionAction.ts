
/** List of conditions available */
export enum GT_ConditionType {
    BOOLEAN = 'boolean',
    EQUAL = 'equal',
    DIFFERENT = 'different',
}

/** Logic of the condition */
export enum GT_ConditionLogic {
    REQUIRED = 'required',
    MISSING = 'missing'
}


/** Condition of the action */
export class GT_ConditionAction {
    /** The final result of the condition.  */
    result: boolean = false;
    constructor(
        /** Property that will be evaluated  */
        public property: string,
        /** Condition type that will determine how the condition will be evaluated */
        public conditionType: GT_ConditionType,
        /** Condition logic, if the type was boolean, has to be required or missing, if it was equal or different, this will represent the value that with the property
         * has to be different or equal
         */
        public conditionLogic: GT_ConditionLogic | any
    ) {
    }
}
