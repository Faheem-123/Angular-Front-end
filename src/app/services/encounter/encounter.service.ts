
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../providers/app-config.module';
import { SearchCriteria } from "../../models/common/search-criteria";
import { ORMChartReasonForVisitHPI } from '../../models/encounter/orm-chart-reason-for-visit-hpi';
import { ORMPatientChart } from '../../models/encounter/ORMPatientChart';
import { ORMChartAnnotation } from '../../models/encounter/orm-chart-annotation';
import { ORMDeleteRecord } from '../../models/general/orm-delete-record';
import { ORMCognitiveFunctional } from '../../models/encounter/orm-cognitive-functional';
import { ORMPhysiciansCare } from '../../models/encounter/orm-physicians-care';
import { WrapperObjectSave } from '../../models/general/wrapper-object-save';
import { ORMSaveChartProblem } from '../../models/encounter/orm-save-chart-problem';
import { ORMChartProcedures } from '../../models/encounter/orm-chart-procedures';
import { ORMChartSocialHistory } from '../../models/encounter/orm-chart-social-history';
import { ORMChartVitals } from '../../models/encounter/orm-chart-vitals';
import { ORMSaveAssessments } from 'src/app/models/encounter/orm-save-assessmens';
import { ORMSavePlanOfCare } from 'src/app/models/encounter/orm-save-chart-planofcare';
import { ORMSavePatientPhysicalExam } from 'src/app/models/encounter/ORMSavePatientPhysicalExam';
import { ORMSaveSurgery } from 'src/app/models/encounter/ORMSaveSurgery';
import { ORMSaveChartFamilyHx } from 'src/app/models/encounter/orm-save-familyhx';
import { ORMROSSave } from 'src/app/models/encounter/ORMROSSave';
import { ORMSavePMH } from 'src/app/models/encounter/ORMSavePMH';
import { ORMOfficeTestSave } from 'src/app/models/encounter/ORMOfficeTestSave';
import { ORM_HealthMaintenanceDetail } from 'src/app/models/encounter/ORMHealthMaintenanceDetail';
import { ORM_HealthMaintenance } from 'src/app/models/encounter/ORMHealthMaintenance';
import { PrescriptionXml } from 'src/app/models/encounter/PrescriptionXml';
import { GetPrescriptionAllergies } from 'src/app/models/encounter/GetPrescriptionAllergies';
import { ormpatientimplantabledevice } from 'src/app/models/encounter/ormpatientimplantabledevice';
import { ORMChartAmendmentsSave } from 'src/app/models/encounter/ORMChartAmendmentsSave';
import { WrapperImmunizationSave } from 'src/app/models/encounter/immunization/wrapper-chart-immunization-save';
import { ORMPatientDischargeDisposition } from 'src/app/models/encounter/orm-patient-discharge-disposition';
import { ORMCarePlan } from 'src/app/models/encounter/ORMCarePlan';
import { HealthConcernSaveWrapper } from 'src/app/models/encounter/HealthConcernSaveWrapper';
import { WrapperAssessPlanSave } from 'src/app/models/encounter/assess-plan/wrapper-assess-plan-save';
import { ORMChartTemplateApply } from 'src/app/models/encounter/orm-chartTemplateApply';
import { ORMCCDRequest } from 'src/app/models/encounter/ORMCCDRequest';
import { ORMCCDSetting } from 'src/app/models/encounter/ORMCCDSetting';
import { ORMSessionInfo } from 'src/app/models/encounter/ORM_SessionInfo';
import { ORMClosingSummary } from 'src/app/models/encounter/ORM-Closing-Summary';
import { ORMPatient_Followup } from 'src/app/models/encounter/ORMPatient_Followup';
import { WrapperOfficeTestSave } from 'src/app/models/encounter/WrapperOfficeTestSave';
import { ORMProblemBasedTemplate } from 'src/app/models/encounter/ORMProblemBasedTemplate';
import { ORMSaveLocalPrescription } from 'src/app/models/encounter/orm-save-local-prescription';
import { UpdateRecordModel } from 'src/app/models/general/update-record-model';
import { ORMSaveLocalAllergy } from 'src/app/models/encounter/orm-save-local-allergy';

@Injectable()
export class EncounterService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {
  }
  getChartSummary(patient_id: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartSummary/' + patient_id, this.httpOptions);
  }
  getAppointmentDates(patient_id: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getAppointmentDates/' + patient_id, this.httpOptions);
  }
  getChartReasonForVisit_HPI(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartReasonForVisit_HPI/' + chartID, this.httpOptions);
  }
  //save hpi 
  saveupdateChartRFV_HPI(obj: ORMChartReasonForVisitHPI) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveupdateChartRFV_HPI', obj, this.httpOptions);
  }
  createNewChart(obj: ORMPatientChart) {
    return this.http.post(this.config.apiEndpoint + 'encounter/createNewChart', obj, this.httpOptions);
  }
  signEncounter(searchcrit: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/signEncounter', searchcrit, this.httpOptions);
  }
  getChartReportDetails(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartReportDetails/' + chartID, this.httpOptions);
  }
  getChartVital(chartID: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartVital/' + chartID, this.httpOptions);
  }
  getChartSurgery(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartSurgery/' + chartID, this.httpOptions);
  }
  getChartProcedures(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartProcedures/' + chartID, this.httpOptions);
  }




  //social history
  // getSexualOrientDDL() {
  //   return this.http.get(this.config.apiEndpoint + 'encounter/getSexualOrientDDL/', this.httpOptions);
  // }
  // getGenderIdentityDDL() {
  //   return this.http.get(this.config.apiEndpoint + 'encounter/getGenderIdentityDDL/', this.httpOptions);
  // }
  getChartSocialHistDisplay(chartID: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartSocialHistDisplay/' + chartID, this.httpOptions);
  }
  getChartSocialHistDetailById(SocialhistoryId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartSocialHistDetailById/' + SocialhistoryId, this.httpOptions);
  }
  getChartSocialHistory(chartid: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartSocialHistory/' + chartid, this.httpOptions);
  }
  saveSocialHistory(obj: ORMChartSocialHistory) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveSocialHistory', obj, this.httpOptions);
  }
  getChartFamilyHis(criteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getChartFamilyHis', criteria, this.httpOptions);
  }
  getPatPrescription(criteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getPatPrescription', criteria, this.httpOptions);
  }
  getPatAllergies(criteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getPatAllergies', criteria, this.httpOptions);
  }
  getPatROS(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatROS/' + chartID, this.httpOptions);
  }
  getPatProgressNotes(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartProgressNotes/' + chartID, this.httpOptions);
  }
  getPatAnnotation(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartAnnotation/' + chartID, this.httpOptions);
  }
  getPatCarePlan(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatCarePlan/' + chartID, this.httpOptions);
  }
  //annotations
  getChartAnnotation(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartAnnotation/' + chartID, this.httpOptions);
  }
  saveupdateChartAnnotation(obj: ORMChartAnnotation) {
    // debugger;
    return this.http.post(this.config.apiEndpoint + 'encounter/saveupdateChartAnnotation', obj, this.httpOptions);
  }
  //del annotation
  deletePatientAnnotation(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deletePatientAnnotation', obj, this.httpOptions);
  }
  //cognative history
  //ddl values
  getCognitiveValues(chart_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getCognitiveValues/' + chart_id, this.httpOptions);
  }
  //congnative data
  getChartCognitiveFunctional(chart_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartCognitiveFunctional/' + chart_id, this.httpOptions);
  }
  //del cognative
  deleteCognitivefunct(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deleteCognitivefunct', obj, this.httpOptions);
  }
  CognitiveAddUpdate(obj: ORMCognitiveFunctional) {
    return this.http.post(this.config.apiEndpoint + 'encounter/CognitiveAddUpdate', obj, this.httpOptions);
  }
  //physicians care
  GetPhyCare(practice_id: string, patient_id: string, chart_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/GetPhyCare/' + practice_id + '/' + patient_id + '/' + chart_id, this.httpOptions);
  }
  saveEditPhyCare(obj: ORMPhysiciansCare) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveEditPhyCare', obj, this.httpOptions);
  }
  deletePhysCare(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deletePhysCare', obj, this.httpOptions);
  }
  //HPI history.. 
  LoadChartModuleHistory(practice_id: string, moduleName: string, searchCriteria: SearchCriteria) {

    debugger;
    return this.http.post(this.config.apiEndpoint + 'encounter/LoadChartModuleHistory/' + practice_id + '/' + moduleName, searchCriteria, this.httpOptions);
  }
  //history headder
  LoadChartModuleHistoryHeader(moduleName: string) {
    debugger;
    return this.http.post(this.config.apiEndpoint + 'encounter/LoadChartModuleHistoryHeader/' + moduleName, this.httpOptions);

  }


  getPatCognitive(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartCognitiveFunctional/' + chartID, this.httpOptions);
  }
  getPatPhysicalExam(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatPhysicalExam/' + chartID, this.httpOptions);
  }
  getPatInjuryNotes(patientid: string, chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatInjuryNotes/' + patientid + '/' + chartID, this.httpOptions);
  }
  getChartFollowUpProblem(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartFollowUpProblem/' + chartID, this.httpOptions);
  }
  getNQFPlan() {
    return this.http.get(this.config.apiEndpoint + 'encounter/getNQFPlan/', this.httpOptions);
  }
  getNQFPlanDetail() {
    return this.http.get(this.config.apiEndpoint + 'encounter/getNQFPlanDetail/', this.httpOptions);
  }
  deleteProblem(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteProblem', obj, this.httpOptions);
  }
  deleteSurgery(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteSurgery', obj, this.httpOptions);
  }
  //

  saveChartProcedure(ormSave: Array<ORMSaveSurgery>) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveChartProcedure/', ormSave, this.httpOptions);
  }
  saveProcedure(obj: ORMChartProcedures) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveProcedure', obj, this.httpOptions);
  }
  /////
  getPastMedHistory(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPastMedHistory/' + chartID, this.httpOptions);
  }
  getAssessments(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getAssessments/' + chartID, this.httpOptions);
  }
  getPatient_AWVPrint(patientId: string, chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatientAWVPrint/' + patientId + '/' + chartID, this.httpOptions);
  }
  getHealthMaint_Print(patientId: string, chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getHealthMaintPrint/' + patientId + '/' + chartID, this.httpOptions);
  }

  getLabOrderTest_Print(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getLabOrderTestPrint/' + chartID, this.httpOptions);
  }
  getOfficeTestPrint(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getOfficeTest/' + chartID, this.httpOptions);
  }
  getAmendments_Print(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getAmendmentsPrint/' + chartID, this.httpOptions);
  }
  getPatientVisitSnapShot(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getPatientVisitSnapShot', searchCriteria, this.httpOptions);
  }
  DeleteChart(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/DeleteChart', searchCriteria, this.httpOptions);
  }
  getFutureAppointments(patientId: string, chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getFutureAppointments/' + patientId + '/' + chartID, this.httpOptions);
  }
  openPrescription(data, link) {
    return this.http.post(link, data, this.httpOptions);
  }
  getPatientHealthCheckSummary(searchobj: SearchCriteria) {
    //debugger;
    return this.http.post(this.config.apiEndpoint + 'encounter/getPatientHealthCheckSummary', searchobj, this.httpOptions);
  }
  getHealthCheckFormsList(searchobj: SearchCriteria) {

    //debugger;
    return this.http.post(this.config.apiEndpoint + 'encounter/getHealthCheckFormsList', searchobj, this.httpOptions);
  }
  getHealthCheckFormFromId(searchobj: SearchCriteria) {

    //debugger;
    return this.http.post(this.config.apiEndpoint + 'encounter/getHealthCheckFormFromId', searchobj, this.httpOptions);
  }

  getPatientHealthCheckForm(searchcrit: SearchCriteria) {

    // debugger;
    return this.http.post(this.config.apiEndpoint + 'encounter/getPatientHealthCheckForm', searchcrit, this.httpOptions);
  }
  SavePatientHealthExamToFile(saveObjectWrapper: WrapperObjectSave) {

    // debugger;
    return this.http.post(this.config.apiEndpoint + 'encounter/SavePatientHealthExamToFile', saveObjectWrapper, this.httpOptions);
  }
  SignHealthCheckForm(searchcrit: SearchCriteria) {

    // debugger;
    return this.http.post(this.config.apiEndpoint + 'encounter/SignHealthCheckForm', searchcrit, this.httpOptions);
  }
  DeletePatientHealthCheck(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/DeletePatientHealthCheck', obj, this.httpOptions);
  }
  getChartModuleHistCriteria(query: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartModuleHistCriteria/' + query, this.httpOptions);
  }
  saveEditVitals(obj_ORMChartVitals: ORMChartVitals) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveupdateChartVital', obj_ORMChartVitals, this.httpOptions);
  }
  getCummulativeVitals(patientId: number, unitType: string) {
    return this.http.get(
      this.config.apiEndpoint + 'encounter/getCummulativeVitals/' + patientId + '/' + unitType, this.httpOptions);
  }
  getOfficeTest(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getOfficeTest/' + chartID, this.httpOptions);
  }
  // saveOfficeTest(obj: ORMOfficeTestSave) {
  //   return this.http.post(this.config.apiEndpoint + 'encounter/saveOfficeTest', obj, this.httpOptions);
  // }
  saveOfficeTest(WrapperSaveOfficeTest: WrapperOfficeTestSave) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveOfficeTest', WrapperSaveOfficeTest, this.httpOptions);
  }
  // IU    
  getChartProblem(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getChartProblem', searchCriteria, this.httpOptions);
  }
  getChartProblemDetail(problemId) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getchartproblemdetail/' + problemId, this.httpOptions);
  }
  savePatientProblem(obj: ORMSaveChartProblem) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveproblem', obj, this.httpOptions);
  }

  // END IU
  //***Encounter Module View Methods**** */
  getChartAssessmentsView(chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartAssessmentView/' + chartID, this.httpOptions);
  }
  getChartAssessmentDetail(Id) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartAssessmentDetail/' + Id, this.httpOptions);
  }
  savePatientAssessments(obj: ORMSaveAssessments) {
    return this.http.post(this.config.apiEndpoint + 'encounter/savePatientAssessments', obj, this.httpOptions);
  }

  deleteAssessment(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteAssessment', obj, this.httpOptions);
  }
  getChartPMHView(patientId: string, chartID: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartPMHView/' + patientId + '/' + chartID, this.httpOptions);
  }
  getChartPMHDetail(Id) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartPMHDetail/' + Id, this.httpOptions);
  }
  savePMH(obj: ORMSavePMH) {
    return this.http.post(this.config.apiEndpoint + 'encounter/savePMH', obj, this.httpOptions);
  }
  deletePMH(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deletePMH', obj, this.httpOptions);
  }
  getChartPrescriptionView(patientId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartPrescriptionView/' + patientId, this.httpOptions);
  }
  getChartAllergyView(patientId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartAllergyView/' + patientId, this.httpOptions);
  }
  getChartProgressNoteListView(patientId: string, chartid: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartProgressNoteListView/' + patientId + '/' + chartid, this.httpOptions);
  }
  getChartProgressNoteTextView(noteid: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartProgressNoteTextView/' + noteid, this.httpOptions);
  }
  saveChartProgressNotes(obj: ORMSavePlanOfCare) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveChartProgressNotes', obj, this.httpOptions);
  }
  // deleteProgressNotes(obj: ORMDeleteRecord) {
  //   return this.http.post(this.config.apiEndpoint + 'encounter/deleteProgressNotes', obj, this.httpOptions);
  // }
  deleteProgressNotes(searchcrit: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteProgressNotes', searchcrit, this.httpOptions);
  }
  getChartSurgeryView(chartId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartSurgeryView/' + chartId, this.httpOptions);
  }
  getChartProcedureView(chartId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartProcedureView/' + chartId, this.httpOptions);
  }
  getChartSurgeryDetail(id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartSurgeryDetail/' + id, this.httpOptions);
  }
  saveChartSurgery(obj: ORMSaveSurgery) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveChartSurgery', obj, this.httpOptions);
  }
  getChartFamilyHxView(chartId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartFamilyHxView/' + chartId, this.httpOptions);
  }
  getChartFamilyHxDetail(id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartFamilyHxDetail/' + id, this.httpOptions);
  }
  saveFamilyHx(obj: ORMSaveChartFamilyHx) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveFamilyHx', obj, this.httpOptions);
  }
  deleteFamilyHx(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteFamilyHx', obj, this.httpOptions);
  }

  getPatPhysicalExamView(chart_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatPhysicalExamView/' + chart_id, this.httpOptions);
  }
  getPatPhysicalExamDetail(id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatPhysicalExamDetail/' + id, this.httpOptions);
  }
  savePatientPhysicalExam(obj: ORMSavePatientPhysicalExam) {
    return this.http.post(this.config.apiEndpoint + 'encounter/savePatientPhysicalExam', obj, this.httpOptions);
  }
  deletePatientPhysicalExam(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deletePhysicalExam', obj, this.httpOptions);
  }
  getChartROS(chart_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartROS/' + chart_id, this.httpOptions);
  }
  saveChartRos(obj: ORMROSSave) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveChartRos', obj, this.httpOptions);
  }
  getChartHealthMainList(patient_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartHealthMainList/' + patient_id, this.httpOptions);
  }
  getChartHealthMainDetail_View(patient_id: string, maint_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartHealthMainDetail_View/' + patient_id + '/' + maint_id, this.httpOptions);
  }
  saveHealthMaint(saveWrapper: ORM_HealthMaintenance) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveHealthMaint', saveWrapper, this.httpOptions);
  }
  saveHealthMaintDetail(saveWrapper: Array<ORM_HealthMaintenanceDetail>) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveHealthMaintDetail', saveWrapper, this.httpOptions);
  }

  deleteHealthMaint(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteHealthMaint', obj, this.httpOptions);
  }

  deleteHealthMaintDetail(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteHealthMaintDetail', obj, this.httpOptions);
  }

  //#region IMPLANTABLE DEVICE

  getDeviceDetailFromGlobalUDIDB(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getDeviceDetailFromGlobalUDIDB/', searchCriteria, this.httpOptions);
  }

  getPatImplantableDevicesSummary(patientId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatImplantableDevicesSummary/' + patientId, this.httpOptions);
  }


  getPatImplantableDeviceDetailById(implantableDeviceId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatImplantableDeviceDetailById/' + implantableDeviceId, this.httpOptions);
  }

  savePatImplantDevice(obj: ormpatientimplantabledevice) {
    return this.http.post(this.config.apiEndpoint + 'encounter/savePatImplantDevice', obj, this.httpOptions);
  }

  deletePatImplantableDevice(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deletePatImplantableDevice', obj, this.httpOptions);
  }

  //#endregion IMPLANTABLE DEVICE


  getChartAmendmentsView(chart_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartAmendmentsView/' + chart_id, this.httpOptions);
  }
  getChartAmendmentsDetail(id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartAmendmentsDetail/' + id, this.httpOptions);
  }
  saveChartAmendments(obj: ORMChartAmendmentsSave) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveChartAmendments', obj, this.httpOptions);
  }
  deleteAmendments(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deleteAmendments', obj, this.httpOptions);
  }
  getPrescriptionXml(prescriptionXml: PrescriptionXml) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getPrescriptionXml', prescriptionXml, this.httpOptions);
  }

  getPatientAllergys(getprescriptionallergies: GetPrescriptionAllergies) {
    return this.http.post(this.config.apiEndpoint + 'encounter/GetPrescriptionAllergies', getprescriptionallergies, this.httpOptions);
  }

  getPatPrescriptionServer(getPrescriptionNCrop: GetPrescriptionAllergies): any {
    return this.http.post(this.config.apiEndpoint + 'encounter/getPatPrescriptionServer', getPrescriptionNCrop, this.httpOptions);

  }

  getGrowthChartData(practice_id: string, patient_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getGrowthChartData/' + practice_id + '/' + patient_id, this.httpOptions);
  }

  // Immunization  
  getChartImmunizationSummary(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getChartImmunizationSummary', searchCriteria, this.httpOptions);
  }

  /*
  getChartImmunizationSummary(patientId: string, chartID: string) {
      return this.http.get(this.config.apiEndpoint + 'encounter/getChartImmunizationSummary/' + patientId + '/' + chartID, this.httpOptions);
  }
  */
  /*
    getPatientImmunizationSummary(searchCriteria: SearchCriteria) {
      return this.http.post(this.config.apiEndpoint + 'encounter/getPatientImmunizationSummary', searchCriteria, this.httpOptions);
    }
    
    getImmunizationVIS(cvxCode: string) {
      return this.http.get(this.config.apiEndpoint + 'encounter/getImmunizationVIS/' + cvxCode, this.httpOptions);
    }
    */
  getChartImmunizationVIS(chartImmId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartImmunizationVIS/' + chartImmId, this.httpOptions);
  }
  getChartImmunizationById(chartImmId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartImmunizationById/' + chartImmId, this.httpOptions);
  }
  saveChartImmunization(wrapperImmunizationSave: WrapperImmunizationSave) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveChartImmunization', wrapperImmunizationSave, this.httpOptions);
  }
  deleteChartImmunization(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteChartImmunization', obj, this.httpOptions);
  }

  getPatientImmunization(patientId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatientImmunization/' + patientId, this.httpOptions);
  }
  // End Immunization

  getChartCarePlan(chart_id: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatCarePlan/' + chart_id, this.httpOptions);
  }
  saveCarePlan(obj: ORMCarePlan) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveCarePlan', obj, this.httpOptions);
  }
  deleteCarePlan(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteCarePlan', obj, this.httpOptions);
  }

  getDischargeDispositionSummary(chartId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatientDischargeDispositionSummary/' + chartId, this.httpOptions);
  }

  getDischargeDispositionDetailById(dischargeId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatientDischargeDispositionDetail/' + dischargeId, this.httpOptions);
  }
  saveDischargeDisposition(ormPatientDischargeDisposition: ORMPatientDischargeDisposition) {
    return this.http.post(this.config.apiEndpoint + 'encounter/savePatientDischargeDisposition', ormPatientDischargeDisposition, this.httpOptions);
  }

  deleteDischargeDisposition(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deleteDischargeDisposition', obj, this.httpOptions);
  }

  getChartHealthConcernView(chartId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartHealthConcernView/' + chartId, this.httpOptions);
  }

  getChartHealthConcernViewDetail(chartId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartHealthConcernViewDetail/' + chartId, this.httpOptions);
  }

  SaveHealthConcern(saveObjectWrapper: HealthConcernSaveWrapper) {
    return this.http.post(this.config.apiEndpoint + 'encounter/SaveHealthConcern', saveObjectWrapper, this.httpOptions);
  }
  deleteHealthConcern(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deleteHealthConcern', obj, this.httpOptions);
  }
  deleteHealthConcernDetail(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deleteHealthConcernDetail', obj, this.httpOptions);
  }


  getPatientAssessmentPlan(patientId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatientAssessmentPlan/' + patientId, this.httpOptions);
  }
  getAssessPlanAssessment(patientId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getAssessPlanAssessment/' + patientId, this.httpOptions);
  }
  getAssessPlanPOT(patientId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getAssessPlanPOT/' + patientId, this.httpOptions);
  }

  saveAssessPlan(wrapperAssessPlanSave: WrapperAssessPlanSave) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveAssessPlan', wrapperAssessPlanSave, this.httpOptions);
  }
  deleteAssessPlan(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deleteAssessPlan', obj, this.httpOptions);
  }
  getTemlplateText(practice_id: String, provider_id: String, type: String) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getTemlplateText/' + practice_id + '/' + provider_id + '/' + type, this.httpOptions);
  }
  getCurrentEncounterTemplate(chart_id: String) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getCurrentEncounterTemplate/' + chart_id, this.httpOptions);
  }

  ApplyChartTemplate(obj: ORMChartTemplateApply) {
    return this.http.post(this.config.apiEndpoint + 'encounter/ApplyChartTemplate', obj, this.httpOptions);
  }

  getTemplateEncSummary(patient_id: String, chart_id: String) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getTemplateEncSummary/' + patient_id + '/' + chart_id, this.httpOptions);
  }
  getPatientVisit_CCD(patient_id: String) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatientVisit_CCD/' + patient_id, this.httpOptions);
  }
  getCCDSetting(practice_id: String) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getCCDSetting/' + practice_id, this.httpOptions);
  }

  saveCCD_Setting(obj: Array<ORMCCDSetting>) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveCCD_Setting', obj, this.httpOptions);
  }
  resolveProblem(searchcrit: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/resolveProblem', searchcrit, this.httpOptions);
  }
  getChartDiagnosis(patient_id: String, chart_id: String) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartDiagnosis/' + patient_id + '/' + chart_id, this.httpOptions);
  }
  saveSessionInfo(obj: ORMSessionInfo) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveSessionInfo', obj, this.httpOptions);
  }
  getSessionInformation(chartID: number, patientID: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getSessionInformation/' + chartID + '/' + patientID, this.httpOptions);
  }
  getClosingSummary(chartID: String, patientID: String, session_id: String) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getClosingSummary/' + chartID + '/' + patientID + '/' + session_id, this.httpOptions);
  }
  saveClosingSummary(obj: ORMClosingSummary) {
    return this.http.post(this.config.apiEndpoint + 'encounter/saveClosingSummary', obj, this.httpOptions);
  }
  getDepressionScreening(searchobj: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getDepressionScreening', searchobj, this.httpOptions);
  }
  SaveDepressionScreeningToFile(saveObjectWrapper: WrapperObjectSave) {
    return this.http.post(this.config.apiEndpoint + 'encounter/SaveDepressionScreeningToFile', saveObjectWrapper, this.httpOptions);
  }
  deleteDepressionScreening(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteDepressionScreening', obj, this.httpOptions);
  }
  getChartPreviousData(type, patient_id, chart_id) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getChartPreviousData/' + type + '/' + patient_id + '/' + chart_id, this.httpOptions);
  }
  getPatientFollowup(chartId) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatientFollowup/' + chartId, this.httpOptions);
  }
  savePatientFollowupTask(obj: ORMPatient_Followup) {
    return this.http.post(this.config.apiEndpoint + 'encounter/savePatientFollowupTask', obj, this.httpOptions);
  }

  getOfficeCpts(practiceId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getOfficeCpts/' + practiceId, this.httpOptions);
  }
  spGetNoKnown(patient_id, chart_id) {
    return this.http.get(this.config.apiEndpoint + 'encounter/spGetNoKnown/' + patient_id + '/' + chart_id, this.httpOptions);
  }
  updateNoKnownData(searchobj: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/updateNoKnownData', searchobj, this.httpOptions);
  }
  updateEncounterEducationProvided(searchobj: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/updateEncounterEducationProvided', searchobj, this.httpOptions);
  }
  updateEncounterMedicationReviewed(searchobj: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/updateEncounterMedicationReviewed', searchobj, this.httpOptions);
  }
  getChartOfficeTestCodeAmt(chart_id) {
    return this.http.get(this.config.apiEndpoint + 'encounter/GetChartOfficeTestCodeAmt/' + chart_id, this.httpOptions);
  }
  MoveProblemToCurrent(searchCri: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/MoveProblemToCurrent', searchCri, this.httpOptions);
  }
  signSelectedEncounter(searchcrit: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/signSelectedEncounter', searchcrit, this.httpOptions);
  }
  MarkEncounterAsClaimCreated(searchcrit: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/MarkEncounterAsClaimCreated', searchcrit, this.httpOptions);
  }
  getProblemBasedChartTemplate(practice_id) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getProblemBasedChartTemplate/' + practice_id, this.httpOptions);
  }
  getProviderOfProblemBasedTemplate(practice_id, temp_id) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getProviderOfProblemBasedTemplate/' + practice_id + '/' + temp_id, this.httpOptions);
  }
  getProblemBasedTemplateEncounter(practice_id, provider_id) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getProblemBasedTemplateEncounter/' + practice_id + '/' + provider_id, this.httpOptions);
  }
  deleteProblemBasedTemplate(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/deleteProblemBasedTemplate', obj, this.httpOptions);
  }
  saveProblemBasedTemplateSetup(obj: ORMProblemBasedTemplate) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/saveProblemBasedTemplateSetup', obj, this.httpOptions);
  }

  getLocalPrescriptionById(prescriptionId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getLocalPrescriptionById/' + prescriptionId, this.httpOptions);
  }

  saveLocalPrescription(obj: ORMSaveLocalPrescription) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/saveLocalPrescription', obj, this.httpOptions);
  }

  deletePrescription(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deletePrescription', obj, this.httpOptions);
  }

  markPrescriptionAsInactive(obj: UpdateRecordModel) {
    return this.http.post(this.config.apiEndpoint + 'encounter/markPrescriptionAsInactive', obj, this.httpOptions);
  }

  getLocalAllergyById(allergyId: number) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getLocalAllergyById/' + allergyId, this.httpOptions);
  }

  saveLocalAllergy(obj: ORMSaveLocalAllergy) {
    return this.http
      .post(this.config.apiEndpoint + 'encounter/saveLocalAllergy', obj, this.httpOptions);
  }

  deleteAllergy(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteAllergy', obj, this.httpOptions);
  }

  markAllergyAsInactive(obj: UpdateRecordModel) {
    return this.http.post(this.config.apiEndpoint + 'encounter/markAllergyAsInactive', obj, this.httpOptions);
  }
  getPatientFullFollowup(patientId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getPatientFullFollowup/' + patientId, this.httpOptions);
  }
  getDrugAbuse(searchobj: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getDrugAbuse', searchobj, this.httpOptions);
  }  
  deleteDrugAbuse(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'encounter/deleteDrugAbuse', obj, this.httpOptions);
  }  
  getPreviewDrigAbuse(searchobj: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getPreviewDrigAbuse', searchobj, this.httpOptions);
  }
  getPatientDrugAbuseSummary(searchobj: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'encounter/getPatientDrugAbuseSummary', searchobj, this.httpOptions);
  }
}
