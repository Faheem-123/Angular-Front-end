import { ORMSavePatient } from "./orm-save-patient";
import { ORMSavePatientRaceEthnicity } from "./orm-save-patient-race-ethnicity";
import { ORMSavePatientInsurance } from "./orm-save-patient-insurance";
import { ORMSavePatientNextOfKin } from "./orm-save-next-of-kin";
//import { ORMSavePatientImmRegInfo } from "./orm-save-imm-reg-info";
import { ORMSavePatientCareTeam } from "./orm-save-care-team";
import { ORMSavePatientCareTeamMember } from "./orm-save-care-team-member";
import { ORMKeyValue } from "../general/orm-key-value";

export class PatientSaveObjectWrapper {

    patient_id: number;
    practice_id: number;
    client_date: string;
    system_ip: string;
    loged_in_user: string;
    lst_deleted_ids: Array<ORMKeyValue>;
    patient:ORMSavePatient;
    lst_race_ethnicity:Array<ORMSavePatientRaceEthnicity>;
    lst_patient_insurance:Array<ORMSavePatientInsurance>;
    lst_next_of_kin:Array<ORMSavePatientNextOfKin>;
    //imm_reg_info:ORMSavePatientImmRegInfo;
    lst_care_team:Array<ORMSavePatientCareTeam>;
    lst_care_team_member:Array<ORMSavePatientCareTeamMember>;

}