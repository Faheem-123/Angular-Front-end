import { ORMLabOrderResult } from "./ORMLabOrderResult";
import { ORMLabResultNotes } from "./ORMLabResultNotes";

export class WrapperLabResultSave {

    objLabResultSave: ORMLabOrderResult;
    labNotes: ORMLabResultNotes;
    followUpDetails: string='';
    constructor() {

    }
}