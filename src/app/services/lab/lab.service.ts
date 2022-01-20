import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from 'src/app/providers/app-config.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { OrderSaveObjectWrapper } from 'src/app/models/lab/LabOrderSaveWrapper';
import { ORMLabSpecimenSave } from 'src/app/models/lab/ORMLabSpecimenSave';
import { ORMLabOrderResult } from 'src/app/models/lab/ORMLabOrderResult';
import { ORMLabOrderAttachment } from 'src/app/models/lab/ORMLabOrderAttachment';
import { WrapperObjectSave } from 'src/app/models/general/wrapper-object-save';
import { ORMLabResultNotes } from 'src/app/models/lab/ORMLabResultNotes';
import { ORMLabOrderAttachmentComments } from 'src/app/models/lab/ORMLabOrderAttachmentComments';
import { WrapperLabResultSave } from 'src/app/models/lab/WrapperLabResultSave';

@Injectable()
export class LabService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http:HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) { }

    getLabCategoy(practiceId:string)
  {
    return this.http.get(
      this.config.apiEndpoint+'general/getLabCategory/'+ practiceId, this.httpOptions);
  }
  getSearchLabOrder(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'lab/getSearchLabOrder',searchCriteria,this.httpOptions);
  }
  getPendingResults(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'lab/getPendingResults',searchCriteria,this.httpOptions); 
  }
  getPendingAttachments(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'lab/getPendingAttachments',searchCriteria,this.httpOptions);
  }  
  getSignedResults(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'lab/getSignedResults',searchCriteria,this.httpOptions); 
  }
  getSignedAttachments(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'lab/getSignedAttachments',searchCriteria,this.httpOptions);
  } 
  getCumulativeRpt(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'lab/getCumulativeRpt',searchCriteria,this.httpOptions);
  } 
  
  getSearchTest(order_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getSearchTest/'+order_id,this.httpOptions);
  }  

  getpatientOrderSummaryView(patient_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getpatientOrderSummaryView/'+patient_id,this.httpOptions);
  }  
  getPatientOrderDetail(order_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getPatientOrderDetail/'+order_id,this.httpOptions);
  }    
  getLabGroupTest(practice_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getLabGroupTest/'+practice_id,this.httpOptions);
  }  
  getLabFacility(practice_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getLabFacility/'+practice_id,this.httpOptions);
  }  
  saveLabOrder(OrderData:OrderSaveObjectWrapper){
    return this.http
    .post(this.config.apiEndpoint+'lab/saveLabOrder/', OrderData,)
  }
  deleteLabOrder(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'lab/deleteLabOrder', obj, this.httpOptions);
  }
  deleteSpecimen(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'lab/deleteSpecimen', obj, this.httpOptions);
  }
  deleteResults(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'lab/deleteResults', obj, this.httpOptions);
  }  
  deleteAttachment(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'lab/deleteAttachment', obj, this.httpOptions);
  }  
  getOrderTest(practice_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getOrderTest/'+practice_id,this.httpOptions);
  }
  getOrderICD(practice_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getOrderICD/'+practice_id,this.httpOptions);
  }
  getOrderComments(order_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getOrderComments/'+order_id,this.httpOptions);
  }
  getTestSpecimen(test_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getSpecimenInfo/'+test_id,this.httpOptions);
  }
  saveLabSpecimen(obj: ORMLabSpecimenSave) {
    return this.http.post(this.config.apiEndpoint + 'lab/saveSpecimen', obj, this.httpOptions);
  }
  getResultTest(order_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getResultTest/'+order_id,this.httpOptions);
  }
  getTestResult(test_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getTestResult/'+test_id,this.httpOptions);
  }
  getAttachments(test_id:string,order_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getTestAttachments/'+test_id+'/'+order_id,this.httpOptions);
  }
  getResultUnits(){
    return this.http.get(
      this.config.apiEndpoint+'lab/getResultUnits',this.httpOptions);
  }
  getResultStatus(){
    return this.http.get(
      this.config.apiEndpoint+'lab/getResultStatus',this.httpOptions);
  }
  getResultAbnormalRange(){
    return this.http.get(
      this.config.apiEndpoint+'lab/getResultAbnormalRange',this.httpOptions);
  }
  getResultStafNotes(order_id:string){
    return this.http.get(
      this.config.apiEndpoint+'lab/getResultStafNotes/'+order_id,this.httpOptions);
  }
  saveResultData(wrapperLabResultSave: WrapperLabResultSave){
    return this.http
    .post(this.config.apiEndpoint+'lab/saveResultData/', wrapperLabResultSave)
  } 
  saveResults(ormResult:ORMLabOrderResult){
    return this.http
    .post(this.config.apiEndpoint+'lab/saveResults/', ormResult)
  }  
  saveAttachment(ormResult:ORMLabOrderAttachment){
    return this.http
    .post(this.config.apiEndpoint+'lab/saveLabAttachment/', ormResult)
  }  
  saveLabAttachment(formData: FormData){
    return this.http
    .post(this.config.apiEndpoint+'lab/saveLabAttachment/', formData)
  }  
  signLabOrder(searchcrit: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'lab/signLabOrder', searchcrit, this.httpOptions);
  }
  updateCommentStatus(saveObjectWrapper: WrapperObjectSave)
  {
    return this.http.post(this.config.apiEndpoint + 'lab/updateCommentStatus', saveObjectWrapper, this.httpOptions);
  }

  //#region  LAB REPORT PRINT
  getLabResultRptHeader(Order_ID: string) {
    return this.http.get(this.config.apiEndpoint + 'phr/getLabResultRptHeader/' + Order_ID, this.httpOptions);
  }
  getLabRptOrderTest(Order_ID: string) {
    return this.http.get(this.config.apiEndpoint + 'phr/getLabRptOrderTest/' + Order_ID, this.httpOptions);
  }
  getLabOrderResult(orderID: String){
    return this.http.post(this.config.apiEndpoint + 'phr/getLabOrderResult/' + orderID , this.httpOptions);
  }
  getLabRptOrderDir(Order_ID: string) {
    return this.http.get(this.config.apiEndpoint + 'phr/getLabRptOrderDir/' + Order_ID, this.httpOptions);
  }
  getLabRptOrderSourceVolume(Order_ID: string) {
    return this.http.get(this.config.apiEndpoint + 'phr/getLabRptOrderSourceVolume/' + Order_ID, this.httpOptions);
  }
  //#endregion LAB REPORT PRINT

  saveAttachmentComments(obj: ORMLabOrderAttachmentComments)
  {
    return this.http.post(this.config.apiEndpoint + 'lab/saveAttachmentComments', obj, this.httpOptions);
  }
  saveResultComments(obj: ORMLabResultNotes)
  {
    return this.http.post(this.config.apiEndpoint + 'lab/saveResultComments', obj, this.httpOptions);
  }  
  getReqReport(Order_ID: string) {
    return this.http.get(this.config.apiEndpoint + 'lab/getReqReport/' + Order_ID, this.httpOptions);
  }
  getReqReportIns(patient_ID: string) {
    return this.http.get(this.config.apiEndpoint + 'lab/getReqReportIns/' + patient_ID, this.httpOptions);
  }
  getReqReportLabCode(Order_ID: string) {
    return this.http.get(this.config.apiEndpoint + 'lab/getReqReportLabCode/' + Order_ID, this.httpOptions);
  }
  updateOrderFollowup(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'lab/updateOrderFollowup',searchCriteria,this.httpOptions);
  }
  GetOrderFollowUpNotes(Order_ID: string){
    return this.http.post(
      this.config.apiEndpoint+'lab/GetOrderFollowUpNotes/' + Order_ID,this.httpOptions);
  }
  getLabFollowupPatients(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'lab/getLabFollowupPatients',searchCriteria,this.httpOptions);
  }
  getLabFollowupPatientTestDetail(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'lab/getLabFollowupPatientTestDetail',searchCriteria,this.httpOptions);
  }
  getPatientLabsStaffNotes(Order_ID: string){
    return this.http.post(
      this.config.apiEndpoint+'lab/getPatientLabsStaffNotes/' + Order_ID,this.httpOptions);
  }
  getPatientLabsPhysicianNotes(Order_ID: string){
    return this.http.post(
      this.config.apiEndpoint+'lab/getPatientLabsPhysicianNotes/' + Order_ID,this.httpOptions);
  }
  sendDrugAbuse(searchCriteria:SearchCriteria){
    return this.http.post(this.config.apiEndpoint+'lab/sendDrugAbuse',searchCriteria,this.httpOptions);
  }
}
