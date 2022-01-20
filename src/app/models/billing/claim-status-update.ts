import { ClaimNotes } from "./claim-notes";

export class ClaimStatusUpdate {
	claim_id:number;
	patient_id:number;
	practice_id:number;
	pri_status:string;
	sec_status:string;
	oth_status:string;
	pat_status:string;
	submission_status:string;
	user_name:string;
	client_date_time:string;
	system_ip:string;

	claim_notes:ClaimNotes;
}