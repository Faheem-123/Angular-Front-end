export class ORMChartImmunizationSave {
   
	chart_immunization_id:number;
	patient_id:number;
	chart_id:number;
	provider_id:number;

	datetime_administered:string;

	immunization_name:string;
	trade_name:string;
	trade_description:string;
	trade_coding_system:string;

	mvx_code:string;
	manufacturer:string;
	manufacturer_detail:string;

	cvx_code:string;
	ndc_code:string;
	lot_number:string;
	expiration_date:string;

	dose:string;
	units:string;

	site_code:string;
	site_description:string;

	route_code:string;
	route_description:string;
	route_code_system:string;

	completion_status_code:string;
	reason_type:string;
	reason_code_snomed:string;
	reason_code_cdc:string;
	reason_description:string;

	billable:boolean;
	proc_code:string;
	proc_description:string;
	amount:number;

	vfc_code:string;
	vfc_description:string;
	funding_code:string;
	funding_description:string;
	funding_coding_system:string;

	entry_type:string;
	administered_code:string;
	administered_code_description:string;
	action_code:string;

	registry_status:string;
	registry_date:string;
	administering_user_info:string;
	entered_by_user_info:string;

	adverse_reaction:string;
	comments:string;

	practice_id:number;

	deleted:boolean;

	created_user:string;
	client_date_created:string;
	modified_user:string;
	client_date_modified:string;
	date_created:string;
	date_modified:string;
	system_ip:string;
}