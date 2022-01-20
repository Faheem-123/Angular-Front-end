import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from "../providers/app-config.module";
import { ORMDeleteRecord } from "../models/general/orm-delete-record";
import { SearchCriteria } from "../models/common/search-criteria";
import { ORMFaxContactSave } from "../models/fax/orm-fax-contact-save";
import { FaxResendModel } from "../models/fax/fax-resend-model";
import { WrapperObjectSave } from "../models/general/wrapper-object-save";
import { WrapperListWithOneObjectSave } from "../models/general/wrapper-list-with-one-object";
import { ORMKeyValue } from "../models/general/orm-key-value";


@Injectable()
export class FaxService {
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    constructor(private http: HttpClient,
        @Inject(APP_CONFIG) private config: AppConfig) {
    }

    getFaxContactList(practice_id: number) {
        return this.http.get(this.config.apiEndpoint + 'fax/getFaxContactList/' + practice_id, this.httpOptions);
    }
    getFaxContactDetailById(contactId: number) {
        return this.http.get(this.config.apiEndpoint + 'fax/getFaxContactDetailById/' + contactId, this.httpOptions);
    }
    saveFaxContact(ormFaxContactSave: ORMFaxContactSave) {
        return this.http.post(
            this.config.apiEndpoint + 'fax/saveFaxContact', ormFaxContactSave, this.httpOptions);
    }

    deleteFaxContact(ormDeleteRecord: ORMDeleteRecord) {
        return this.http.post(
            this.config.apiEndpoint + 'fax/deleteFaxContact', ormDeleteRecord, this.httpOptions);
    }


    getFaxConfigFaxNumbersList(practiceId: number, faxServer: string) {
        return this.http.get(this.config.apiEndpoint + 'fax/getFaxConfigFaxNumbersList/' + practiceId + "/" + faxServer, this.httpOptions);
    }

    sendFax(formData: FormData) {
        debugger;
        return this.http.post(this.config.apiEndpoint + 'fax/sendFax', formData);
    }
    reSendFax(faxResendModel: FaxResendModel) {
        debugger;
        return this.http.post(this.config.apiEndpoint + 'fax/resendFax', faxResendModel);
    }


    updateFaxSendingStatus(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'fax/updateFaxSendingStatus', searchCriteria);
    }


    getSentFaxes(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'fax/getSentFaxes', searchCriteria);
    }
    getSentFaxAttachments(faxSentId: Number) {
        return this.http.get(this.config.apiEndpoint + 'fax/getSentFaxAttachments/' + faxSentId, this.httpOptions);
    }
    getFaxSendingAttempts(faxSentId: Number) {
        return this.http.get(this.config.apiEndpoint + 'fax/getFaxSendingAttempts/' + faxSentId, this.httpOptions);
    }

    deleteFaxSent(obj: ORMDeleteRecord) {
        return this.http.post(this.config.apiEndpoint + 'fax/deleteFaxSent', obj, this.httpOptions);
    }

    getReceivedFaxes(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'fax/getReceivedFaxes', searchCriteria);
    }
    getUserAssignedReceivedFaxes(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'fax/getUserAssignedReceivedFaxes', searchCriteria);
    }

    downloadFaxesFromServer(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'fax/downloadFaxesFromServer', searchCriteria);
    }

    addFaxReceivedToPatientDocument(wrapperObjectSave: WrapperObjectSave) {
        return this.http.post(this.config.apiEndpoint + 'fax/addFaxReceivedToPatientDocument', wrapperObjectSave);
    }

    getAssignedToUsersList(practiceId: Number) {
        return this.http.get(this.config.apiEndpoint + 'fax/getAssignedToUsersList/' + practiceId, this.httpOptions);
    }

    assignFaxToUsers(wrapperListWithOneObjectSave: WrapperListWithOneObjectSave) {
        return this.http.post(this.config.apiEndpoint + 'fax/assignFaxToUsers', wrapperListWithOneObjectSave);
    }

    deleteReceivedFax(wrapperObjectSave: WrapperObjectSave) {
        return this.http.post(this.config.apiEndpoint + 'fax/deleteReceivedFax', wrapperObjectSave, this.httpOptions);
    }


    updateReceivedUserFaxStatus(lstKV: Array<ORMKeyValue>) {
        return this.http.post(this.config.apiEndpoint + 'fax/updateReceivedUserFaxStatus', lstKV, this.httpOptions);
    }




}