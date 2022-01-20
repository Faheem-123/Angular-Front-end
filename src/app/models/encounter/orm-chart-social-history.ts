export class ORMChartSocialHistory {
    socialhistory_id:number;
	patient_id:number;
	chart_id:number;
	marital_status:string;	
	marital_status_code:string;
	sexual_orientation:string;	
	sexual_orientation_code:string;
	gender_identity:string;	
	gender_identity_code:string;
	children:string;
	education:string;
	occupation:string;
	diet_education:string;
	home_environment:string;
	
	smoking_status:string;
	smoking_snomed:string;	
	tobacco_type:string;
	packs_per_day:string;
	year_started:string;	
	smoking_start_date:string;
	smoking_end_date:string;
	tobacco_cessation:string;
	
	alcohol_per_day:string;
	caffeine_per_day:string;
	etoh:string;
	
	drug_use:string;
	quit_date:string;	
	exercise:string;
	seatbelt:string;
	exposure:string;		
	
	lmp:string;
	cycle:string;
	flow:string;
	gravida:string;
	para:string;
	dysmenomhea:string;	
	age_at_menarche:string;
	year_of_menopause:string;
	pregnant:boolean;
	edd:string;	
	
	comment:string;
	
	practice_id:number;
	modified_user:string;
	created_user:string;
	client_date_created:string;	
	client_date_modified:string;
	date_modified:string;
	date_created:string;	
	system_ip:string;
}