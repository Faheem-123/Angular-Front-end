import { FaxAttachemntsTypeEnum } from "src/app/shared/enum-util";

export class SendFaxAttachemnts {
    document_id:number;
    document_name:string;
	document_path:string;    		
	document_link:string;
	file_directory:string;	
	patient_document_id:string;
    document_source:FaxAttachemntsTypeEnum;
    multipart_index:number;
}

