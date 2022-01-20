import { CallingFromEnum } from "src/app/shared/enum-util";

export class OpenedPatientInfo {
    patient_id: number;
    pid: string;// alternate_account
    patient_gender: string;
    last_name: string;
    first_name: String;
    calling_from: CallingFromEnum;
    patient_dob: string;
    patient_dob_101: string;
    patient_age: string;
    patient_address: string;
    patient_address_line2: string;
    Patient_zip_city_state: string;
    zip:string;
    state:string;
    city:string
    ssn:string;
    phone:string;    
}