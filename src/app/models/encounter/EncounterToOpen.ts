import { OpenedPatientInfo } from "../common/patientInfo";

export class EncounterToOpen {
    patient_id: number;
    chart_id:number;
    appointment_id:number;

    patient_name: string;    
    
    provider_id:number;
    provider_name:string;
    location_id:number;
    location_name:string;
    visit_date:string;
    signed:boolean;

    co_signed:boolean;
    external_education:boolean;
    medication_reviewed:boolean;
    primary_diag:string;
    openPatientInfo:OpenedPatientInfo;

    controlUniqueId:string;

}