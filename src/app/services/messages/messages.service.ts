import { Injectable, Inject } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { APP_CONFIG, AppConfig } from "src/app/providers/app-config.module";
import { ORMMessage } from "src/app/models/messages/ORMMessage";
import { ORMMessageDetail } from "src/app/models/messages/ORMMessageDetail";
import { WrapperMessageSave } from "src/app/models/messages/WrapperMessageSave";
import { ORMDeleteRecord } from "src/app/models/general/orm-delete-record";
import { SearchCriteria } from "src/app/models/common/search-criteria";
import { ORMKeyValue } from "src/app/models/general/orm-key-value";
import { WrapperAddToCorrespondence } from "src/app/models/messages/WrapperAddToCorrespondence";

@Injectable()
export class MessagesService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) { }

  getMessagesCount(user_id: String) {
    return this.http.post(
      this.config.apiEndpoint + 'messages/getMessagesCount/' + user_id, this.httpOptions);
  }
  getPatientMessagesCount(patient_id: String) {
    return this.http.post(
      this.config.apiEndpoint + 'messages/getPatientMessagesCount/' + patient_id, this.httpOptions);
  }
  
  getMessageslist(user_id: String, mes_type: string) {
    return this.http.post(
      this.config.apiEndpoint + 'messages/getMessagesListt/' + user_id + '/' + mes_type, this.httpOptions);
  }
  getPatientMessagesListt(patient_id: String, mes_type: string) {
    return this.http.post(
      this.config.apiEndpoint + 'messages/getPatientMessagesListt/' + patient_id + '/' + mes_type, this.httpOptions);
  }
  getMessageDetail(message_id: string, user_id: String, mes_type: string) {
    return this.http.post(
      this.config.apiEndpoint + 'messages/getMessageDetail/' + message_id + '/' + user_id + '/' + mes_type, this.httpOptions);
  }
  getPatientMessageDetail(message_id: string, patient_id: String, mes_type: string) {
    return this.http.post(
      this.config.apiEndpoint + 'messages/getPatientMessageDetail/' + message_id + '/' + patient_id + '/' + mes_type, this.httpOptions);
  }
  // saveMessage(objMessage:ORMMessage, objDetails: ORMMessageDetail[]) {
  //   return this.http.post(
  //     this.config.apiEndpoint + 'messages/saveMessage/'+objMessage+'/' + objDetails, this.httpOptions);
  // }
  saveMessage(WrapperMessagesSave: WrapperMessageSave) {
    return this.http.post(
      this.config.apiEndpoint + 'messages/saveMessage', WrapperMessagesSave, this.httpOptions);
  }

  deleteSelectedMessage(searchcrit: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'messages/deleteSelectedMessage', searchcrit, this.httpOptions);
  }
  archiveSelectedMessage(searchcrit: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'messages/archiveSelectedMessage', searchcrit, this.httpOptions);
  }
  getToCcData(message_id: string) {
    return this.http.post(
      this.config.apiEndpoint + 'messages/getToCcData/' + message_id, this.httpOptions);
  }
  onGetPatientMessage(user_id: string, practice_id: String) {
    debugger;
    return this.http.post(
      this.config.apiEndpoint + 'messages/onGetPatientMessage/' + user_id + '/' + practice_id, this.httpOptions);
  }
  searchPatientMSG(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'messages/searchPatientMSG/', searchCriteria, this.httpOptions);
  }
  updateToReaded(patientMessageStatus: Array<ORMKeyValue>) {
    return this.http.post(this.config.apiEndpoint + 'messages/updateToReaded', patientMessageStatus, this.httpOptions);
  }
  getMessagesAttachments(message_ID: string, practice_id: String) {
    debugger;
    return this.http.get(this.config.apiEndpoint + 'messages/getMessagesAttachments/' + message_ID + '/' + practice_id, this.httpOptions);
  }
  getMessagesLinks(message_ID: string, practice_id: String) {
    debugger;
    return this.http.post(this.config.apiEndpoint + 'messages/getMessagesLinks/' + message_ID + '/' + practice_id, this.httpOptions);
  }
  // searchPatientMsg(searchCriteria: SearchCriteria) {
  //   return this.http.post(this.config.apiEndpoint + 'messages/searchPatientMsg/', searchCriteria, this.httpOptions);
  // }
  SaveCorrespondence(WrapperAddToCorrSave: WrapperAddToCorrespondence) {
    return this.http.post(this.config.apiEndpoint + 'messages/SaveCorrespondence', WrapperAddToCorrSave, this.httpOptions);
  }
  onGetDirectMessages(practice_id:number){
    return this.http.get(this.config.apiEndpoint+'messages/onGetDirectMessages/'+ practice_id,this.httpOptions);
  } 
  importCCDA(searchCriteria: SearchCriteria){
    debugger;
    return this.http.post(this.config.apiEndpoint+'messages/importCCDA', searchCriteria,this.httpOptions);
  } 
  importCCR(searchCriteria: SearchCriteria){
    debugger;
    return this.http.post(this.config.apiEndpoint+'messages/importCCR', searchCriteria,this.httpOptions);
  } 
  saveupdatePatientMessages(formData: FormData) {
    debugger;
    return this.http.post(this.config.apiEndpoint + 'messages/saveupdatePatientMessages', formData);
  }
  deletePatMsg(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'messages/deletePatMsg', searchCriteria, this.httpOptions);
  }
  getPatMsgUsersRecipient(patient_id: String) {
    return this.http.post(this.config.apiEndpoint + 'messages/getPatMsgUsersRecipient/' + patient_id, this.httpOptions);
  }
}