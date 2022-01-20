import { SendFaxAttachmentsFromClient } from "./send-fax-attachments-from-client";
import { FaxServerEnum } from "src/app/shared/enum-util";

export class WrapperSendFax {

	fax_server:FaxServerEnum;
	
    practice_id:number;
	patient_id:number;
	
	recipientFaxNo:string;
	recipientName:string;
	recipientOrganization:string;
	recipientPhoneNo:string;
	
	senderFaxNo:string;
	senderName:string;
	senderOrganization:string;
	senderPhoneNo:string;
	
	faxSubject:string;
	faxNotes:string;
	//coverPage:string;
	
	userName:string;
	moduleName:string;
	moduleReferenceId:string;
	faxSentIdMain:number;
	sentDate:string;
    
    lstAttachments:Array<SendFaxAttachmentsFromClient>;
}

