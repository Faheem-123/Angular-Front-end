import { ORMSavePatientImmRegInfo } from "./orm-save-imm-reg-info";

export class ImmRegQBPCriteria {
    practice_id: number;
    patient_id: number; 
    clinic_id: string;
    registry_code: string;
    user_name: string;
    client_ip: string;
    submit_after_geneation: boolean;
    
    constructor(practicId: number,patId:number,clientId: string, 
        regCode: string, user: string, ip: string, submitAfterGenerate: boolean) {

        this.practice_id = practicId;
        this.patient_id=patId;     
        this.clinic_id = clientId;
        this.registry_code = regCode;
        this.user_name = user;
        this.client_ip = ip;
        this.submit_after_geneation = submitAfterGenerate;
    }
}