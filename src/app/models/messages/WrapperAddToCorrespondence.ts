import { ORMHealthInformationCapture } from "./ORMHealthInformationCapture";
import { ORMHealthInformationCaptureAttachments } from "./ORMHealthInformationCaptureAttachments";
import { ORMKeyValue } from "../general/orm-key-value";

export class WrapperAddToCorrespondence {
    lstHealthInfoCapture:ORMHealthInformationCapture;
    lstHealthInfoAttachments:Array<ORMHealthInformationCaptureAttachments>;
    lstOther:Array<ORMKeyValue>;
    constructor(){
    }
}