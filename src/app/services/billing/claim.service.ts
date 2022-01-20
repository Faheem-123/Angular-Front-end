import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../providers/app-config.module';
import { SearchCriteria } from "../../models/common/search-criteria";
import { ClaimNotes } from 'src/app/models/billing/claim-notes';
import { WrapperClaimSavePro } from 'src/app/models/billing/wrapper-claim-save-pro';
import { WrapperClaimPaymentSave } from 'src/app/models/billing/wrapper-claim-payment-save';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { WrapperPatientRefundSave } from 'src/app/models/billing/wrapper-patient-refund-save';
import { ClaimStatusUpdate } from 'src/app/models/billing/claim-status-update';
import { ORMSavePatientStatement_log } from 'src/app/models/billing/ORMSavePatientStatement_log';
import { ORMSavePatientAttorney_log } from 'src/app/models/billing/ORMSavePatientAttorney_log';
import { ORMPatientStatementNotes } from 'src/app/models/billing/ORMPatientStatementNotes';
import { ORMStatementPDF } from 'src/app/models/billing/ORMStatementPDF';
import { ORMspGetPatientClaims } from 'src/app/models/billing/ORMspGetPatientClaims';

@Injectable()
export class ClaimService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {
  }
  getClaimSummary(patientId: number, dueOnly: boolean, showdeleted: boolean) {
    return this.http.get(this.config.apiEndpoint + 'claim/getClaimSummary/' + patientId + '/' + dueOnly + '/' + showdeleted, this.httpOptions);
  }

  getFacilityList(practiceId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getFacilityList/' + practiceId, this.httpOptions);
  }
  getPracticePOSList(practiceId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getPracticePOSList/' + practiceId, this.httpOptions);
  }
  getModifierList() {
    return this.http.get(this.config.apiEndpoint + 'claim/getModifierList', this.httpOptions);
  }

  getClaim(claimId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getClaim/' + claimId, this.httpOptions);
  }

  getProClaimDiagnosis(claimId: number,showDeleted:boolean) {
    return this.http.get(this.config.apiEndpoint + 'claim/getProClaimDiagnosis/' + claimId+'/'+showDeleted, this.httpOptions);
  }

  getProClaimProcedures(claimId: number,showDeleted:boolean) {
    return this.http.get(this.config.apiEndpoint + 'claim/getProClaimProcedures/' + claimId+'/'+showDeleted, this.httpOptions);
  }

  getClaimInsurance(claimId: number,showDeleted:boolean) {
    return this.http.get(this.config.apiEndpoint + 'claim/getClaimInsurance/' + claimId+'/'+showDeleted, this.httpOptions);
  }

  getClaimRulePatientInfo(patientId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getClaimRulePatientInfo/' + patientId, this.httpOptions);
  }

  getClaimImportLabOrders(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getClaimImportLabOrders', searchCriteria, this.httpOptions);

  }
  getPreviousCalimImport(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getPreviousCalimImport', searchCriteria, this.httpOptions);

  }
  
  getClaimImportProc(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getClaimImportProc', searchCriteria, this.httpOptions);

  }
  getClaimImportDiag(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getClaimImportDiag', searchCriteria, this.httpOptions);

  }
  getSuperBillList(practiceId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getSuperBillList/' + practiceId, this.httpOptions);

  }

  getSuperBillCatList(billId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getSuperBillCatList/' + billId, this.httpOptions);

  }

  getSuperBillDetails(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getSuperBillDetails', searchCriteria, this.httpOptions);

  }

  getClaimNotes(claimId: number, user: string, editableOnly: string) {
    return this.http.get(this.config.apiEndpoint + 'claim/getClaimNotes/' + claimId + '/' + user + '/' + editableOnly, this.httpOptions);

  }

  saveClaimNotes(claimNotes: ClaimNotes, addToPatientNotes: boolean) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/saveClaimNotes/' + addToPatientNotes, claimNotes, this.httpOptions);

  }

  saveClaimPro(wrapperClaimSavePro: WrapperClaimSavePro) {

    return this.http.post(
      this.config.apiEndpoint + 'claim/saveClaimPro', wrapperClaimSavePro, this.httpOptions);

  }

  getChartFollowUpDiagnosis(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getChartFollowUpDiagnosis', searchCriteria, this.httpOptions);

  }
  getChartFollowUpProcedures(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getChartFollowUpProcedures', searchCriteria, this.httpOptions);

  }

  deleteClaim(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/deleteClaim', searchCriteria, this.httpOptions);

  }

  updateClaimStatus(claimStatusUpdate: ClaimStatusUpdate) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/updateClaimStatus', claimStatusUpdate, this.httpOptions);

  }
  getSuperBillEncounterList(practiceId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getSuperBillEncounterList/' + practiceId, this.httpOptions);
  }
  getPatientStatement(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getPatientStatement', searchCriteria, this.httpOptions);
  }
  getStatementDetail(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getStatementDetail', searchCriteria, this.httpOptions);
  }
  getStatementPDF(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getStatementPDF', searchCriteria, this.httpOptions);
  }  
  saveStatementLog(ormSave: Array<ORMSavePatientStatement_log>) {
    return this.http.post(this.config.apiEndpoint + 'claim/saveStatementLog/', ormSave, this.httpOptions);
  }
  saveAttorneyLog(ormSave: Array<ORMSavePatientAttorney_log>) {
    return this.http.post(this.config.apiEndpoint + 'claim/saveAttorneyLog/', ormSave, this.httpOptions);
  }
  getPrintAttorneyDetail(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getPrintAttorneyDetail', searchCriteria, this.httpOptions);
  }
  getPatientSelfPay(patientId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getPatientSelfPay/' + patientId, this.httpOptions);
  }

  saveStatementNotes(lstNotes: Array<ORMPatientStatementNotes>){
    return this.http.post(this.config.apiEndpoint + 'claim/saveStatementNotes', lstNotes, this.httpOptions);
  }
  getPatientStatementSavedNotes(searchCriteria: SearchCriteria)
  {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getPatientStatementSavedNotes', searchCriteria, this.httpOptions);
  }
  generatePDFStatement(lstNotes: Array<ORMStatementPDF>){
    return this.http.post(this.config.apiEndpoint + 'claim/generatePDFStatement', lstNotes, this.httpOptions);
  }
  generateStatement(lstNotes: Array<ORMspGetPatientClaims>){
    return this.http.post(this.config.apiEndpoint + 'claim/generateStatement', lstNotes, this.httpOptions);
  }
  getPatientStatementLog(patientId: number) {
    return this.http.get(this.config.apiEndpoint + 'claim/getPatientStatementLog/' + patientId, this.httpOptions);
  }
  getCPTsWithBalance(searchCriteria: SearchCriteria)
  {
    return this.http.post(
      this.config.apiEndpoint + 'claim/getCPTsWithBalance', searchCriteria, this.httpOptions);
  }

  GetBillingProviderTaxonomyList(practiceId: number,billingProviderId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'claim/GetBillingProviderTaxonomyList/' +practiceId+'/'+ billingProviderId, this.httpOptions);
  }

  
  
}
