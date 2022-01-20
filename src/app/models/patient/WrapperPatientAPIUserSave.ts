import { ORMHealthInformationCapture } from "./orm-healthinformationcapture";
import { ORMKeyValue } from "../general/orm-key-value";
import { ORM_HealthInformationCaptureAttachments } from "./orm-healthinformationcaptureattachments";
import { ORMAPIUserSave } from "./orm-patient-api-user-save";
import { ORMAPIUserPatientSave } from "./orm-patient-api-user-patients-save";

export class WrapperPatientAPIUserSave {

    api_user_save:ORMAPIUserSave;
    lst_api_user_patients:Array<ORMAPIUserPatientSave>;
    lst_user_patient_ids_deleted:Array<number>;

    constructor(user:ORMAPIUserSave,lstUserPatient:Array<ORMAPIUserPatientSave>,deletedIds:Array<number>){
        this.api_user_save=user;
        this.lst_api_user_patients=lstUserPatient;
        this.lst_user_patient_ids_deleted=deletedIds;
    }
}