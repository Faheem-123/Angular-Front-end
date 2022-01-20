export class ORMDenialMessagesSave {
    denial_id: number;
    claim_id: number;
    patient_id: number;
    eob_era_id: number;
    eob_era_id_type: string;
    era_claim_id: string;
    message: string;
    status: string;
    created_user: string;
    date_created: string;
    modified_user: string;
    client_date_created: string;
    date_modified: string;
    client_date_modified: string;
    resolved_message: string;
    resolved_user: string;
    date_resolved: string;
    is_era_auto_denial: boolean;
    remarks_codes_details: string;
    practice_id: number;
    system_ip: string;
    policy_number: string;
    insurance_id: number;
}