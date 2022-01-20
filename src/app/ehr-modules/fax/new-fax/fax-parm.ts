export class FaxParam {
    
    patientId:number;    
    faxReferenceId:string;
    moduleReferenceId:string;
	faxSentId:number;
    resendAttempts:number=1;
    recepientFaxNo:string;
    recepientName:string;
    recepientOrganization:string;
    recepientPhone:string;
    senderFaxNo:string;
    senderName:string;
    senderOrganization:string;
    senderPhone:string;
	faxSubject:string;
    faxNotes:string;    
}