export class ORMSaveLocalPrescription
{
    chart_prescription_id:number;
	drug_name:string;	
	drug_info:string;
	start_date:string;
	end_date:string;
	issued_date:string;	
	sig_text:string;	
    archive:string;
    pharmacist_notes:string;
	provider_name:string;
	location_name:string;	
	provider_id:string;
	created_user:string;
	date_created:string;
	client_date_created:string;
	modified_user:string;
	date_modified:string;
	client_date_modified:string;
	practice_id:number;
	chart_id:number;
	patient_id:number;
    system_ip:string;
    is_eprescription:boolean=false;
    num_of_refills_allowed:number;    
}