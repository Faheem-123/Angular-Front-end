import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '../../providers/app-config.module';
import { SearchCriteria } from '../../models/common/search-criteria';
import { WrapperTwoObjectsSave } from '../../models/general/wrapper-two-objects-save';
import { WrapperPatientRefundSave } from 'src/app/models/billing/wrapper-patient-refund-save';
import { WrapperClaimPaymentSave } from 'src/app/models/billing/wrapper-claim-payment-save';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ORMCashRegisterModify } from 'src/app/models/billing/orm-cash-register-modify';

@Injectable()
export class PaymentService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {
  }

  getWriteOffCodes(practiceId: number) {

    return this.http.post(
      this.config.apiEndpoint + 'cashregister/getwriteoffcodes/' + practiceId, this.httpOptions);

  }


  getPaymentPlan(patientId: number) {

    return this.http.post(
      this.config.apiEndpoint + 'cashregister/getpaymentplan/' + patientId, this.httpOptions);

  }

  /*
  getPatientBalance(patientId:number){
    
    return this.http.post(
      this.config.apiEndpoint+'cashregister/getpatientbalance/'+patientId,this.httpOptions);
    
  }
  */

  getCashregisterInfo(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/getcashregisterinfo', searchCriteria, this.httpOptions);

  }

  getCashRegister(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/getcashregister', searchCriteria, this.httpOptions);

  }

  addCashRegister(saveTwoObjectWrapper: WrapperTwoObjectsSave) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/addCashRegisterPayment', saveTwoObjectWrapper, this.httpOptions);
  }

  modifyCashRegister(ormCashRegisterModify: ORMCashRegisterModify) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/modifyCashRegisterPayment', ormCashRegisterModify, this.httpOptions);
  }


  getNotPaidReason(patientId: number) {

    return this.http.post(
      this.config.apiEndpoint + 'cashregister/getnotpaidreason/' + patientId, this.httpOptions);

  }

  getPatientRefund(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/getpatientrefund', searchCriteria, this.httpOptions);

  }


  refundPatientPayment(wrapperPatientRefundSave: WrapperPatientRefundSave) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/savePatientRefund', wrapperPatientRefundSave, this.httpOptions);

  }

  getProceduresForPosting(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getProceduresForPosting', searchCriteria, this.httpOptions);

  }
  getPaymentInsurances(claimId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getPaymentInsurances/' + claimId, this.httpOptions);

  }
  getClaimPayment(claimId: number,showDeleted) {
    return this.http.get(this.config.apiEndpoint + 'claim/getClaimPayment/' + claimId+'/'+showDeleted, this.httpOptions);

  }
  getClaimPaymentAdjustments(claimId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getClaimPaymentAdjustments/' + claimId, this.httpOptions);

  }
  getEobEraCheckDetailsById(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getEobEraCheckDetailsById', searchCriteria, this.httpOptions);
  }
  saveClaimPayment(wrapperClaimPaymentSave: WrapperClaimPaymentSave) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/saveClaimPayment', wrapperClaimPaymentSave, this.httpOptions);
  }

  rectifyPayment(objKeyValue: Array<ORMKeyValue>) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/rectifyPayment', objKeyValue, this.httpOptions);
  }


  getClaimAdjustmentGroupCodesList(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getClaimAdjustmentGroupCodesList', searchCriteria, this.httpOptions);

  }
  
  getClaimAdjustmentReasonCodesList() {
    return this.http.get(this.config.apiEndpoint + 'claim/getClaimAdjustmentReasonCodesList', this.httpOptions);

  }


  getClaimPostedPayment(eobEraId: number, eobEraIdType: string) {
    return this.http.get(this.config.apiEndpoint + 'claim/getClaimPostedPayment/' + eobEraId + "/" + eobEraIdType, this.httpOptions);

  }



  voidCashRegisterEntry(objKeyValue: Array<ORMKeyValue>) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/voidCashRegisterEntry', objKeyValue, this.httpOptions);
  }

  checkBounceCashRegisterEntry(objKeyValue: Array<ORMKeyValue>) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/checkBounceCashRegisterEntry', objKeyValue, this.httpOptions);
  }

  markAsResolvedCashRegisterEntry(objKeyValue: Array<ORMKeyValue>) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/markAsResolvedCashRegisterEntry', objKeyValue, this.httpOptions);
  }


  getUnResolvedCashRegisterPayments(objKeyValue: Array<ORMKeyValue>) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/getUnResolvedCashRegisterPayments', objKeyValue, this.httpOptions);
  }


  getEOBInfoByClaimId(claimId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getEOBInfoByClaimId/' + claimId, this.httpOptions);

  }

  getERAPaymentInfoByClaimId(claimId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getERAPaymentInfoByClaimId/' + claimId, this.httpOptions);

  }

  savePatientPaymentPlan(lstKV: Array<ORMKeyValue>) {
    return this.http.post(
      this.config.apiEndpoint + 'cashregister/savePaymentPlan', lstKV, this.httpOptions);
  }

  getProceduresForPatientRefund(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'claim/getProceduresForPatientRefund', searchCriteria, this.httpOptions);
  }

}
