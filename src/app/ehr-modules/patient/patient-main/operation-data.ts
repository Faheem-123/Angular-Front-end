export enum OperationDataOptionEnum {
    OPEN = "open",
    ADD = "add",
    EDIT = "edit",
    MERGE_PATIENT = "merge_patient",
    SHOW_FLEX_APP = "show_flex_app",
    SHOW_AUDIT_LOG="show_audit_log"
}

export class OperationData {
    operation: OperationDataOptionEnum;
    data: any;

    constructor(option: OperationDataOptionEnum, value: any) {
        this.operation = option;
        this.data = value;
    }
}