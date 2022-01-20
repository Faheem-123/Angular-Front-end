import { ORMSavePatientImmRegInfo } from "./orm-save-imm-reg-info";

export class ImmRegVXUCriteria {
    practice_id: number;
    patient_id: number;
    chart_id: number;
    clinic_id: string;
    registry_code: string;
    user_name: string;
    client_ip: string;
    submit_after_geneation: boolean;
    lst_chart_immunization_ids: Array<number>;
    patient_imm_registry_info:ORMSavePatientImmRegInfo;
    constructor(practicId: number,patId:number,chartId:number ,clientId: string, 
        regCode: string, user: string, ip: string, submitAfterGenerate: boolean, 
        lstImmIds: Array<number>,patRegInfo:ORMSavePatientImmRegInfo) {

        this.practice_id = practicId;
        this.patient_id=patId;
        this.chart_id=chartId;
        this.clinic_id = clientId;
        this.registry_code = regCode;
        this.user_name = user;
        this.client_ip = ip;
        this.submit_after_geneation = submitAfterGenerate;
        this.lst_chart_immunization_ids = lstImmIds;
        this.patient_imm_registry_info=patRegInfo;

    }
}