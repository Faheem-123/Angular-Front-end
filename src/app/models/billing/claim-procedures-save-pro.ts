export class ClaimProceduresSavePro {
    claim_procedures_id: number;
    proc_sequence: number;

    patient_id: number;
    claim_id: number;
    practice_id: number;

    proc_code: string;
    description: string;
    
    pos: string;
    pos_detail: string;
    charges: number;
    units: number;
    total_charges: number;

    dos_from: string;
    dos_to: string;

    mod1: string;
    mod2: string;
    mod3: string;
    mod4: string;

    dx_pointer1: number;
    dx_pointer2: number;
    dx_pointer3: number;
    dx_pointer4: number;

    ndc_code: string;
    ndc_price: number;
    ndc_qty: string;
    ndc_measure: string;

    is_resubmitted: boolean;
    created_user: string;
    client_date_created: string;
    modified_user: string;
    client_date_modified: string;
    date_created: string;
    date_modified: string;

    notes:string;
}