import { ORMPatientMessageDetail } from "../messages/ORMPatientMessageDetail";
import { ORMPatientMessage } from "../messages/ORMPatientMessage";
import { ORMMessageAttachment } from "../messages/ORMMessageAttachment";

export class WrapperPatientMessage {
    objPatMsg:ORMPatientMessage;
    //objPatMsgDetail: ORMPatientMessageDetail;
    objPatMsgDetail:Array<ORMPatientMessageDetail>;
    objMsgAttach: ORMMessageAttachment;
    
    constructor(){
    }
}