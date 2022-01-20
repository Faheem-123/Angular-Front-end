import { FaxServerEnum } from "src/app/shared/enum-util";

export class FaxResendModel {
	faxReferenceId:string;
	faxSentIdMain:number;
	clientFaxNo:string;
	clientFaxServer:FaxServerEnum;
	practiceId:number;
	logedInUser:string;
	clientDateTime:string;
	systemIp:string;
}
