export class ORMSavePatient {

    patient_id: number;
    alternate_account: string;
    pic: string;
    first_name: string;
    mname: string;
    last_name: string;
    suffix: string;
    preffix: string;
    previous_name: string;
    gender: string;
    gender_code: string;
    dob: string;
    ssn: string;
    marital_status_code:string;
    marital_status: string;
    language: string;
    language_code: string; 
    interpreter_req: boolean;
    gender_identity: string;
    gender_identity_code: string;
    sexual_orientation: string;
    sexual_orientation_code: string;
    race_code: string;
    race: string;
    ethnicity_code: string;
    ethnicity: string;   

    mother_maiden_last_name: string;
    mother_maiden_first_name: string;   

    address: string;
    address2: string;
    zip: string;
    city: string;
    state: string;
    county_code: string;

    primary_contact_type: string;
    home_phone: string;
    work_phone: string;
    cell_phone: string;
    email: string;
    
      
    comment: string;
    
    emrg_contact: string;
    emrg_contact_name: string;
    emrg_contact_relation: string;
    access_restricted: boolean;
    
    confid_contact_type: string;
    confid_contact: string;
    
    patient_expired: boolean;
    expired_date: string;
    death_cause: string;
    patient_disabled: boolean;
    disabled_date: string;
    
    primary_provider: number;
    location_id: number;
    guarantor_id: number;
    referral_id: number;    
    
    practice_id: number;
    
    self_pay: boolean;
    acu: boolean;
    pat_statement: boolean;    
    multi_birth: string;
    birth_order: number;
    advance_directive: string;
    family_size: string;
    annual_income: string;
   
    
    is_transition_of_care: boolean;
    id_card: string;
    driving_license: string;
    patient_agreement: string;    
    amendment_request_id: number;

    patient_status: string;
    
    
    system_ip: string;
    created_user: string;
    client_date_created: string;
    modified_user: string;
    client_date_modified: string;
    date_created: string;
    date_modified: string;   
    
    is_dental: boolean;
}