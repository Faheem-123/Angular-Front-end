import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../providers/app-config.module';
import { SearchCriteria } from "../models/common/search-criteria";
import { ORMDeleteRecord } from '../models/general/orm-delete-record';
import { ORMpaymentcategories } from '../models/reports/ORMpaymentcategories';
import { ORMpaymentcategoryprocedures } from '../models/reports/ORMpaymentcategoryprocedures';
import { List } from 'lodash';
import { ORMPayrollCategories } from '../models/reports/ORMPayrollCategories';
import { ORMPayrollCategoryProcedures } from '../models/reports/ORMPayrollCategoryProcedures';
import { ORMProviderPayrollCategories } from '../models/reports/ORMProviderPayrollCategories';

@Injectable()
export class ReportsService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) { }

  getAppointments(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getappointments/', searchCriteria, this.httpOptions);
  }
  getEligibilityVerification(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getEligibilityVerification/', searchCriteria, this.httpOptions);
  }
  getcssCallLog(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getcssCallLog/', searchCriteria, this.httpOptions);
  }

  getEncounterProcDiag(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getEncounterProcDiag/', searchCriteria, this.httpOptions);
  }

  getEncounterReport(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getEncounterReport/', searchCriteria, this.httpOptions);
  }
  getClaimwithUnsignedEncounter(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getClaimwithUnsignedEncounter/', searchCriteria, this.httpOptions);
  }
  getMissingClaims(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getMissingClaims/', searchCriteria, this.httpOptions);
  }
  getMissingClaimsReport(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getMissingClaimsReport/', searchCriteria, this.httpOptions);
  }
  getOrderCross_False(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getOrderCross_False/', searchCriteria, this.httpOptions);
  }
  getOrderCross_True(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getOrderCross_True/', searchCriteria, this.httpOptions);
  }
  getDiagnReport(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getDiagnReport/', searchCriteria, this.httpOptions);
  }
  getCallsData(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getCallsData/', searchCriteria, this.httpOptions);
  }
  getAppointmentsms(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getAppointmentsms/', searchCriteria, this.httpOptions);
  }

  getPatEligReport(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getPatEligReport/', searchCriteria, this.httpOptions);
  }
  /*
  getPatientEligibility(obj: ORMEligibilityDetail) {
    return this.http
      .post(this.config.apiEndpoint + 'reports/getPatientEligibility', obj, this.httpOptions);
  }
  */
  getDayWiseRpt(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getDayWiseRpt/', searchCriteria, this.httpOptions);
  }
  getProviderWiseRpt(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getProviderWiseRpt/', searchCriteria, this.httpOptions);
  }
  getLocationWiseRpt(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getLocationWiseRpt/', searchCriteria, this.httpOptions);
  }
  // saveupdateDailyDeposit(obj: ORMDailyDeposit) {
  //   return this.http.post(this.config.apiEndpoint + 'reports/saveupdateDailyDeposit', obj, this.httpOptions);
  // }
  saveupdateDailyDeposit(formData: FormData) {
    return this.http.post(this.config.apiEndpoint + 'reports/saveupdateDailyDeposit', formData);
  }
  getDailyDeposit(searchCriteria: SearchCriteria) {
    debugger;
    return this.http.post(
      this.config.apiEndpoint + 'reports/getDailyDeposit/', searchCriteria, this.httpOptions);
  }
  deleteDailyDeposit(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'reports/deleteDailyDeposit', obj, this.httpOptions);
  }
  searchByMonthYear(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/searchByMonthYear/', searchCriteria, this.httpOptions);
  }
  getCashPaymentDetails(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getCashPaymentDetails/', searchCriteria, this.httpOptions);
  }
  getPatientPaymentDetails(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getPatientPaymentDetails/', searchCriteria, this.httpOptions);
  }
  getCollectPaymentDetails(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getCollectPaymentDetails/', searchCriteria, this.httpOptions);
  }
  getYearlyCollectionDetails(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getYearlyCollectionDetails/', searchCriteria, this.httpOptions);
  }

  getgynMissedVisit(practiceId: string) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getgynMissedVisit/' + practiceId, this.httpOptions);
  }

  getPregData(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getPregnancyData/', searchCriteria, this.httpOptions);
  }

  getPatientPayer(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getPatientPayer/', searchCriteria, this.httpOptions);
  }

  getPatientPayerDetails(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getPatientPayerDetails/', searchCriteria, this.httpOptions);
  }

  getClaimdetails(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getClaimdetails/', searchCriteria, this.httpOptions);
  }
  getReportClaimdetailFooter(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getReportClaimdetailFooter/', searchCriteria, this.httpOptions);
  }


  getCrossReport(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getCrossReport/', searchCriteria, this.httpOptions);
  }

  getLabCompRpt(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getLabCompRpt/', searchCriteria, this.httpOptions);
  }

  getPatCreation(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getPatCreation/', searchCriteria, this.httpOptions);
  }
  getPaymentCategoriesDetails(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getPaymentCategoriesDetails/', searchCriteria, this.httpOptions);
  }
  getPaymentCategories(practiceId: number) {
    return this.http.get(this.config.apiEndpoint + 'reports/getPaymentCategories/' + practiceId, this.httpOptions);
  }
  getPaymentcategories_Procedures(category_id: number) {
    return this.http.get(this.config.apiEndpoint + 'reports/getPaymentcategories_Procedures/' + category_id, this.httpOptions);
  }
  saveupdatePaymentCategory(obj: ORMpaymentcategories) {
    return this.http.post(this.config.apiEndpoint + 'reports/saveupdatePaymentCategory', obj, this.httpOptions);
  }
  deleteCategory(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'reports/deleteCategory', obj, this.httpOptions);
  }
  deleteProcedure(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'reports/deleteProcedure', obj, this.httpOptions);
  }
  saveProcedures(obj: List<ORMpaymentcategoryprocedures>) {
    return this.http.post(this.config.apiEndpoint + 'reports/saveProcedures', obj, this.httpOptions);
  }

  getAppointmentsCallLog(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/getAppointmentCallsLog/', searchCriteria, this.httpOptions);
  }
  getusermodules(role_id: String, practice_id: String) {
    return this.http.get(this.config.apiEndpoint + 'reports/getusermodules/' + role_id + '/' + practice_id, this.httpOptions);
  }
  searchPayRoll(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'reports/searchPayRoll/', searchCriteria, this.httpOptions);
  }
  GetPayrollCategories(practiceId: number) {
    return this.http.get(this.config.apiEndpoint + 'reports/GetPayrollCategories/' + practiceId, this.httpOptions);
  }
  getPayRollCategoryProviders(category_id: String, practice_id: String) {
    return this.http.get(this.config.apiEndpoint + 'reports/getPayRollCategoryProviders/' + category_id + '/' + practice_id, this.httpOptions);
  }
  getPayRollCategoryProcedures(category_id: string) {
    return this.http.get(this.config.apiEndpoint + 'reports/getPayRollCategoryProcedures/' + category_id, this.httpOptions);
  }
  saveupdateCategories(obj: ORMPayrollCategories) {
    return this.http.post(this.config.apiEndpoint + 'reports/saveupdateCategories', obj, this.httpOptions);
  }
  deleteSeletedCategory(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'reports/deleteSeletedCategory', obj, this.httpOptions);
  }
  getProviderPayrollVisits(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getProviderPayrollVisits', searchCriteria, this.httpOptions);
  }
  getProviderPayrollCharges(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getProviderPayrollCharges', searchCriteria, this.httpOptions);
  }
  getProviderPayrollPayments(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getProviderPayrollPayments', searchCriteria, this.httpOptions);
  }
  SavePayRollCategoryProcedures(saveWrapper: Array<ORMPayrollCategoryProcedures>) {
    return this.http.post(this.config.apiEndpoint + 'reports/SavePayRollCategoryProcedures', saveWrapper, this.httpOptions);
  }
  deleteSeletedProcedures(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'reports/deleteSeletedProcedures', obj, this.httpOptions);
  }
  SavePayRollCategoryProviders(saveWrapper: Array<ORMProviderPayrollCategories>) {
    return this.http.post(this.config.apiEndpoint + 'reports/SavePayRollCategoryProviders', saveWrapper, this.httpOptions);
  }
  CheckIfCPTExists(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/CheckIfCPTExists', searchCriteria, this.httpOptions);
  }
  getPaymentCollectionSummaryProviderWise(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getPaymentCollectionSummaryProviderWise', searchCriteria, this.httpOptions);
  }
  getDenialMessageRptPayers(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getDenialMessageRptPayers', searchCriteria, this.httpOptions);
  }
  getDenialMessages(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getDenialMessages', searchCriteria, this.httpOptions);
  }
  getSourceWiseCollection(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getSourceWiseCollection', searchCriteria, this.httpOptions);
  }
  getBillingTrackSheetFreez(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getBillingTrackSheetFreez', searchCriteria, this.httpOptions);
  }
  getBillingAgingPayerWiseSummary(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getBillingAgingPayerWiseSummary', searchCriteria, this.httpOptions);
  }
  getBankDepositReportCheckSummary(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getBankDepositReportCheckSummary', searchCriteria, this.httpOptions);
  }
  getCheckPostedPayments(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getCheckPostedPayments', searchCriteria, this.httpOptions);
  }
  getClaimBatchReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getClaimBatchReport', searchCriteria, this.httpOptions);
  }
  getCPTWisePaymentReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getCPTWisePaymentReport ', searchCriteria, this.httpOptions);
  }
  getPayerWisePayment(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getPayerWisePayment ', searchCriteria, this.httpOptions);
  }
  getPayerWisePaymentDetails(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getPayerWisePaymentDetails ', searchCriteria, this.httpOptions);
  }
  getClaimSummaryReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getClaimSummaryReport ', searchCriteria, this.httpOptions);
  }
  getCashRegisterReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getCashRegisterReport ', searchCriteria, this.httpOptions);
  }
  getInvoiceReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getInvoiceReport ', searchCriteria, this.httpOptions);
  }
  getUserPerformanceReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getUserPerformanceReport ', searchCriteria, this.httpOptions);
  }
  getPaymentCollectionSummaryLocationWise(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getPaymentCollectionSummaryLocationWise ', searchCriteria, this.httpOptions);
  }
  getProcedureSummaryReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getProcedureSummaryReport', searchCriteria, this.httpOptions);
  }
  getProviderWork(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getProviderWork/', searchCriteria, this.httpOptions);
  }
  getAuthorizationUsers(practiceId: number) {
    return this.http.get(this.config.apiEndpoint + 'reports/getAuthorizationUsers/' + practiceId, this.httpOptions);
  }
  getNotPaidReasonData(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getNotPaidReasonData/', searchCriteria, this.httpOptions);
  }
  getMonthorYearWiseRpt(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getMonthorYearWiseRpt/', searchCriteria, this.httpOptions);
  }
  searchReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/searchReport/', searchCriteria, this.httpOptions);
  }
  getHcfaClaims(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getHcfaClaims/', searchCriteria, this.httpOptions);
  }
  getPatientNotSeen(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getPatientNotSeen/', searchCriteria, this.httpOptions);
  }
  getGeneralReportOptions(practice_id: string) {
    return this.http.get(this.config.apiEndpoint + 'reports/getGeneralReportOptions/' + practice_id, this.httpOptions);
  }
  searchGeneralReport(spname: String, practice_id: String) {
    return this.http.get(this.config.apiEndpoint + 'reports/searchGeneralReport/' + spname + '/' + practice_id, this.httpOptions);
  }
  getCorrespondenceReportData(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getCorrespondenceReportData/', searchCriteria, this.httpOptions);
  }
  getExportResult(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getExportResult/', searchCriteria, { responseType: 'arraybuffer' });
  }
  getMonthWiseChargesPaymentReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getMonthWiseChargesPaymentReport', searchCriteria, this.httpOptions);
  }
  getLaggedCollectionReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getLaggedCollectionReport', searchCriteria, this.httpOptions);
  }
  getDailyChargesPaymentSummaryReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getDailyChargesPaymentSummaryReport', searchCriteria, this.httpOptions);
  }
  getDailyPaymentSummaryReport(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getDailyPaymentSummaryReport', searchCriteria, this.httpOptions);
  }
  getProcedureAnalysis(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'reports/getProcedureAnalysis', searchCriteria, this.httpOptions);
  }

  getClaimReceiptDetail(claimId: number) {
    return this.http.get(this.config.apiEndpoint + 'reports/getClaimReceiptDetail/' + claimId, this.httpOptions);
  }
}