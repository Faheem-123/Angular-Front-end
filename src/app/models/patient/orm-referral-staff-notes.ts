export class ORMReferralStaffNotes {
    id:number;
    referral_id:number;
    patient_id:string;
    notes:string;
    practice_id:number;
    created_user:string;
    date_created:string;
    client_date_created:string;
    deleted:boolean;    
}