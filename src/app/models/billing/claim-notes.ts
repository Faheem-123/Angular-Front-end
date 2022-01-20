export class ClaimNotes {
    notes_id: number;
    claim_id: number;
    patient_id: number;
    notes: string;
    date_created: string;
    created_user: string;
    date_modified: string;
    modified_user: string;
    practice_id: number;

    client_date_modified: string;
    client_date_created: string;

    is_auto:boolean;
}