import { ORMHealthInformationCapture } from "./orm-healthinformationcapture";
import { ORMKeyValue } from "../general/orm-key-value";
import { ORM_HealthInformationCaptureAttachments } from "./orm-healthinformationcaptureattachments";

export class WrapperPatientInfoCapture {

    objHealthInfoCapture:ORMHealthInformationCapture;
    arrHealthInfoAttachmentsLinks:Array<ORM_HealthInformationCaptureAttachments>;
    path: String; //for path
    constructor(){
    }
}