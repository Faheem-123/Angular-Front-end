export class ORMAddDocument {
	patient_document_id: number;
	patient_id: number;
	practice_id: number;
	document_date: string;
	name: string;
	original_file_name: string;
	link: string;
	doc_size: string;
	require_sign_off: boolean;
	sign_off: boolean;
	sign_off_by: string;
	sign_off_date: string;
	comment: string;
	doc_categories_id: number;
	doc_type: string;
	doc_type_id: string;
	deleted: boolean;
	created_user: string;
	client_date_created: string;
	modified_user: string;
	client_date_modified: string;
	date_created: string;
	date_modified: string;
	system_ip: string;
}