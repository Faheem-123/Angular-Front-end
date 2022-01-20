import { FaxAttachemntsTypeEnum } from "src/app/shared/enum-util";
import { ORMKeyValue } from "../general/orm-key-value";

export class SendFaxAttachmentsFromClient {
    document_id: number;
    document_name: string;
    document_link: string;
    patient_document_id: string;
    document_source: FaxAttachemntsTypeEnum;
    html_string: string;
    multipart_index: number;
    read_only: boolean = false;
}

