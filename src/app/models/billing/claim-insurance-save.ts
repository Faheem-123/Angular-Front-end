export class ClaimInsuranceSave {
    claiminsurance_id:number;
    insurance_id:number;
    claim_id:number;
    patient_id:number;
    
    insurace_type:string;
    policy_number:string;
    group_number:string;
    copay:number;
    start_date:string;
    end_date:string;
    guarantor_id:number;
    guarantor_relationship:string;
    created_user:string;
    client_date_created:string;
    modified_user:string;
    client_date_modified:string;
    date_created:string;
    date_modified:string;
   
    workercomp_name:string;
    workercomp_address:string;
    workercomp_city:string;
    workercomp_state:string;
    workercomp_zip:string;
    auth_no:string;
    auth_no_type:string;
    claim_no:string;
    elig_date:string;
    elig_status:string;
    elig_response:string;
}