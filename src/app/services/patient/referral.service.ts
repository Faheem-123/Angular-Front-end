import { WrapperObjectSave } from './../../models/general/wrapper-object-save';
import { ORMReferralStaffNotes } from './../../models/patient/orm-referral-staff-notes';
import { ORMDeleteRecord } from './../../models/general/orm-delete-record';
import { Injectable,Inject } from '@angular/core';
import { HttpClient,HttpHeaders,HttpParams  } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../providers/app-config.module';
import {SearchCriteria} from "../../models/common/search-criteria";
import { Observable } from 'rxjs';
import { map ,  filter } from 'rxjs/operators';
import { ORMPatientReferral } from '../../models/patient/orm-patient-referral';


@Injectable()
export class ReferralService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http:HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {    
   }

  getPatientReferral(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'referral/getPatientReferrals',searchCriteria,this.httpOptions);
  }
  getReferralSearch(searchCriteria:SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint+'general/searchReferringProvider',searchCriteria,this.httpOptions);
  }
  getConsultType(practice_id){
    return this.http.get(
      this.config.apiEndpoint+'referral/getConsultType/'+practice_id,this.httpOptions);
  }
  getChartReferralsView(patient_id){
    return this.http.get(
      this.config.apiEndpoint+'referral/getChartReferralsView/'+patient_id,this.httpOptions);
  }
  getChartReferralsDetail(referral_id){
    return this.http.get(
      this.config.apiEndpoint+'referral/getChartReferralsDetail/'+referral_id,this.httpOptions);
  }
  savePatientReferralRequest(obj:ORMPatientReferral){
    return this.http
    .post(this.config.apiEndpoint+'referral/savePatientReferralRequest', obj ,this.httpOptions);
  }
  savePatientReferral(obj:WrapperObjectSave){
    return this.http
    .post(this.config.apiEndpoint+'referral/savePatientReferral', obj ,this.httpOptions);
  }

  deletePatientReferralRequest(obj:ORMDeleteRecord){
    debugger;
    return this.http
    .post(this.config.apiEndpoint+'referral/deletePatientReferralRequest', obj ,this.httpOptions);
  }
  UpdateReferralRequestStatus(saveObjectWrapper:WrapperObjectSave){
    debugger;
    return this.http
    .post(this.config.apiEndpoint+'referral/UpdateReferralRequestStatus', saveObjectWrapper ,this.httpOptions);
  }
  //get Visits
  getReferralChartSummary(patient_id:String)
   {
    return this.http.get(this.config.apiEndpoint + 'referral/getReferralChartSummary/' + patient_id,this.httpOptions );
  }
  getPatientLabOrders(patient_id:String)
   {
    return this.http.get(this.config.apiEndpoint + 'referral/getPatientLabOrders/' + patient_id,this.httpOptions );
  }
  getReferralsFaxDetails(referral_id:String)
  {
   return this.http.get(this.config.apiEndpoint + 'referral/getReferralsFaxDetails/' + referral_id,this.httpOptions );
 }
 getReferralsEmailDetails(referral_id:String)
 {
  return this.http.get(this.config.apiEndpoint + 'referral/getReferralsEmailDetails/' + referral_id,this.httpOptions );
}

getPatientOrderResults(searchCriteria:SearchCriteria){
  return this.http.post(
    this.config.apiEndpoint+'referral/getPatientOrderResults',searchCriteria,this.httpOptions);
}
GenerateTempLetter(searchCriteria:SearchCriteria){
  return this.http.post(
    this.config.apiEndpoint+'referral/GenerateTempLetter',searchCriteria,this.httpOptions);
}


}
