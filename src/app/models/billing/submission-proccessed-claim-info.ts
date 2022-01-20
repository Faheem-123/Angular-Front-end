import { SubmissionMethodEnum } from "src/app/shared/enum-util";

export class SubmissionProccessedClaimInfo{
   
    claim_id:number;
    insurance_name:string;    
    has_primary_ins:boolean;
    has_secondary_ins:boolean;
    has_oth_ins:boolean;
    is_resubmitted:boolean;
    is_bill_to_secondary:boolean;
    submission_method:SubmissionMethodEnum; // hcfa|electronic
    user_name:string; 
    client_date_time:string;
    practice_id:number;   
    add_claim_note:boolean=false;
}