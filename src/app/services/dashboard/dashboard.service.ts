import { Injectable,Inject } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../providers/app-config.module';
import {SearchCriteria} from "../../models/common/search-criteria";
import { Observable } from 'rxjs';
import { map ,  filter } from 'rxjs/operators';
import { GetPrescriptionAllergies } from 'src/app/models/encounter/GetPrescriptionAllergies';
import { ORMDashBoardSetting } from 'src/app/models/dashboard/ORMDashBoardSetting';

@Injectable()
export class DashboardService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http:HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {    
   }
   getDashBoardModule(user_id, practice_id){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getDashBoardModule/' + user_id + '/' + practice_id , this.httpOptions);
  }
   getCheckInPatient(searchCriteria:SearchCriteria)
   {
    return this.http.post(
      this.config.apiEndpoint+'dashboard/getCheckInPatient',searchCriteria,this.httpOptions); 
  }
  getCheckInPatient_Widget(searchCriteria:SearchCriteria)
   {
    return this.http.post(
      this.config.apiEndpoint+'dashboard/getCheckInPatient_Widget',searchCriteria,this.httpOptions); 
  }
  //dashboard lab pending results
  /*getPendingLabResults(ProviderID, locationID, type, LoginUserID){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getPendingLabResults/' + ProviderID + '/' + locationID + '/' + type + '/' + LoginUserID,this.httpOptions);
  }*/
  getLabPendingResults(ProviderID, locationID, type, LoginUserID){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getLabPendingResults/' + ProviderID + '/' + locationID + '/' + type + '/' + LoginUserID , this.httpOptions);
  }
  getLabPendingResults_Widget(ProviderID, locationID, type, LoginUserID){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getLabPendingResults_Widget/' + ProviderID + '/' + locationID + '/' + type + '/' + LoginUserID , this.httpOptions);
  }
  
  getPendingEncounter(provider_id, location_id, searchCriteria){
    //return this.http.post(this.config.apiEndpoint + 'dashboard/getPendingEncounter1', searchCriteria , this.httpOptions);
    return this.http.post(this.config.apiEndpoint + 'dashboard/getPendingEncounter/' + provider_id + '/' + location_id,  searchCriteria , this.httpOptions);
  }
  //messagesrow.message_detail_id, this.lookupList.practiceInfo.logedInUser, clientdatetime
  markAsRead(id, loginuser, datetime, ip){
    return this.http.post(this.config.apiEndpoint + 'dashboard/markAsRead/' + id + '/' + loginuser + '/' + datetime + '/' + ip , this.httpOptions);
  }
  //dashboard unread msg
  getUnReadMessages(ReciverID){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getUnReadMessages/' + ReciverID ,this.httpOptions);
  }
  //dashboard unread faxes
  getUnReadFaxes(userID, practice_id){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getUnReadFaxes/' + userID + '/' + practice_id ,this.httpOptions);
  }
  getUnReadFaxes_Widget(userID, practice_id){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getUnReadFaxes_Widget/' + userID + '/' + practice_id ,this.httpOptions);
  }
  //edd
  getgynEDD(practice_id){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getgynEDD/' + practice_id ,this.httpOptions);
  }
  /////////////////
  getMissingClaims(searchCriteria){
    return this.http.post(this.config.apiEndpoint + 'dashboard/getMissingClaims/' , searchCriteria ,this.httpOptions);
  }
  getPendingClaims_Widget(searchCriteria){
    return this.http.post(this.config.apiEndpoint + 'dashboard/getPendingClaims_Widget/' , searchCriteria ,this.httpOptions);
  }
  //communication

  getRefillsData(prescripXML: GetPrescriptionAllergies): any {
    return this.http.post(this.config.apiEndpoint + 'dashboard/getRefills', prescripXML, this.httpOptions);
  }

  getAllDashBoardModule(user_id,practice_id){
    return this.http.get(this.config.apiEndpoint + 'setup/getAllDashBoardModule/'+user_id +'/'+ practice_id ,this.httpOptions);
  }
  getUserDashBoardModule(user_id,practice_id){
    return this.http.get(this.config.apiEndpoint + 'setup/getUserDashBoardModule/'+user_id +'/'+ practice_id ,this.httpOptions);
  }
  saveDashboardSetting(ormSave:Array<ORMDashBoardSetting>){
    return this.http.post(this.config.apiEndpoint + 'setup/saveDashboardSetting/' , ormSave ,this.httpOptions);
  }
  getCashRegisterLastWeekDayWisePayment( searchCriteria:SearchCriteria){    
    return this.http.post(
      this.config.apiEndpoint+'dashboard/getCashRegisterLastWeekDayWisePayment',searchCriteria,this.httpOptions);
    
  }
  getCashRegister_Widget( searchCriteria:SearchCriteria){    
    return this.http.post(
      this.config.apiEndpoint+'dashboard/getCashRegister_Widget',searchCriteria,this.httpOptions);
  }
  
  //cash register details
  getCashPaymentDetails(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'dashboard/getCashPaymentDetails',searchCriteria,this.httpOptions);    
  }
  updateOrderAssignedTo(search:SearchCriteria)
  {
    return this.http.post(
      this.config.apiEndpoint+'dashboard/updateOrderAssignedTo',search,this.httpOptions);    
  }
   
  faxMarkasRead(searchCri:SearchCriteria)
  {
    return this.http.post(
      this.config.apiEndpoint+'dashboard/faxMarkasRead',searchCri,this.httpOptions);    
  }
  getPaymentSummary(practice_id){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getPaymentSummary/'+ practice_id ,this.httpOptions);
  }
  getDashBoardDenial(practice_id){
    return this.http.get(this.config.apiEndpoint + 'dashboard/getDashBoardDenial/'+ practice_id ,this.httpOptions);
  }
  // getDashBoardClaimAging(practice_id){
  //   return this.http.get(this.config.apiEndpoint + 'dashboard/getDashBoardClaimAging/'+ practice_id ,this.httpOptions);
  // }
  
  getDashBoardClaimAging(searchCri:SearchCriteria)
  {
    return this.http.post(this.config.apiEndpoint+'dashboard/getDashBoardClaimAging',searchCri,this.httpOptions);    
  }
  getDashBoardClaimCount(searchCri:SearchCriteria)
  {
    return this.http.post(
      this.config.apiEndpoint+'dashboard/getDashBoardClaimCount',searchCri,this.httpOptions);    
  }
  
  
}
