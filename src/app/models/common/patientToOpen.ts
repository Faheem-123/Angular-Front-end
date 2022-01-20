import { PatientSubTabsEnum, CallingFromEnum } from "src/app/shared/enum-util";
import { AppointmentOperationData } from "src/app/ehr-modules/scheduler/appointment-operation-data";

export class PatientToOpen {
    patient_id: number;
    pid:string;
    patient_name: string;
    child_module:PatientSubTabsEnum;    
    child_module_id: number;
    callingFrom:CallingFromEnum;
    other_option:string;
}