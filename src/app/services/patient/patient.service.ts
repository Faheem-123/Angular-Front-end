import { ORMPatientConsultant } from './../../models/patient/orm-patient-consultant';
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../providers/app-config.module';
import { SearchCriteria } from "../../models/common/search-criteria";
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ORMDeleteRecord } from '../../models/general/orm-delete-record';
import { ORMPatientCommunication } from '../../models/patient/orm-patient-communication';
import { ORMPatientInjury } from '../../models/patient/orm-patient-injury';
import { WrapperObjectSave } from '../../models/general/wrapper-object-save';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { WrapperPatientInfoCapture } from 'src/app/models/patient/WrapperPatientInfoCapture';
import { ormpatientnotes } from 'src/app/models/patient/orm-patient-notes';
import { WrapperPatientAPIUserSave } from 'src/app/models/patient/WrapperPatientAPIUserSave';
import { ORMCCDRequest } from 'src/app/models/encounter/ORMCCDRequest';
import { ORMSaveDocCategory } from 'src/app/models/patient/orm-save-doc-category';

@Injectable()
export class PatientService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {
  }

  searchPatient(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'search/patient', searchCriteria, this.httpOptions);

  }

  getPatient(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getbyid/' + patientId, this.httpOptions);

  }

  savePatient(formData: FormData) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/savePatient/', formData)
  }

  getPatientInsurance(patientId: number, status: string) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientInsurance/' + patientId + '/' + status, this.httpOptions);

  }
  getPatientInsuranceView(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientInsuranceView/' + patientId, this.httpOptions);

  }

  getPatientRaceEthnicty(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientRaceEthnicty/ALL/' + patientId, this.httpOptions);

  }
  getPatientEthnicity(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientRaceEthnicty/Ethnicity/' + patientId, this.httpOptions);

  }

  getPatientNextOfKin(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientNextOfKin/' + patientId, this.httpOptions);

  }

  /*
  getPatientImmRegInfo(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientImmRegInfo/' + patientId, this.httpOptions);
  }
  */

  getPatientCareTeamSummary(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientCareTeamSummary/' + patientId, this.httpOptions);

  }

  getPatientCareTeams(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientCareTeams/' + patientId, this.httpOptions);

  }

  getPatientCareTeamMembers(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientCareTeamMembers/' + patientId, this.httpOptions);

  }

  getPatientHeader(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getheaderinfo/' + patientId, this.httpOptions);

  }
  getPatientHeaderVitals(patientId) {

    return this.http.get(
      this.config.apiEndpoint + 'patient/getheadervitals/' + patientId, this.httpOptions);

  }

  getPatientScannedCards(patientId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientScannedCards/' + patientId, this.httpOptions);
  }

  getVitalGraphData(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getvitalgraph/' + patientId, this.httpOptions);
  }

  getMedicationSummary(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getmedicationsummary/' + patientId, this.httpOptions);
  }

  getAllergiesSummary(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getallergiesummary/' + patientId, this.httpOptions);
  }
  getProblemsSummary(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getproblemsummary/' + patientId, this.httpOptions);
  }

  getAssessmentSummary(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getassessmentsummary/' + patientId, this.httpOptions);
  }

  //getImmunizationSummary(searchCriteria: SearchCriteria) {
  //    return this.http.post(this.config.apiEndpoint + 'encounter/getPatientImmunizationSummary', searchCriteria, this.httpOptions);
  //  }

  getSuregeriesProceduresSummary(patientId, type) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getsuregeriesproceduressummary/' + patientId + '/' + type, this.httpOptions);
  }

  getHealthMaintenanceSummary(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/gethealthmaintenancesummary/' + patientId, this.httpOptions);
  }

  getConceptionOutcomesSummary(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getconeptionoutcomesummary/' + patientId, this.httpOptions);
  }

  getEDD(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getedd/' + patientId, this.httpOptions);
  }

  getConsultSummary(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getconsultsummary/' + patientId, this.httpOptions);
  }

  getReferralSummary(patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getreferralsummary/' + patientId, this.httpOptions);
  }

  //Consultant
  getSpeciality(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getSpeciality/' + practice_id, this.httpOptions);
  }
  getPatientConsultant(patient_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientConsultant/' + patient_id, this.httpOptions);
  }

  // savePatientConsultant(obj:ORMPatientConsultant){
  //   return this.http
  //   .post(this.config.apiEndpoint+'patient/savePatientConsultant', obj ,this.httpOptions);
  // }
  savePatientConsultant(formData: FormData) {
    return this.http.post(this.config.apiEndpoint + 'patient/savePatientConsultant', formData);
  }
  deletePatientConsultant(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/deletePatientConsultant', obj, this.httpOptions);
  }

  //communcation
  getCommunications(patient_id) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getCommunications/' + patient_id, this.httpOptions);
  }
  //patient injury
  getPatInjury(patient_id) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatInjury/' + patient_id, this.httpOptions);
  }
  deletePatientInjury(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/deletePatientInjury', obj, this.httpOptions);
  }
  //search firm 
  getFirmList(searchCriteria: String) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getFirmList/' + searchCriteria, this.httpOptions);
  }
  //ins search
  getInsList(value: String) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getInsList/' + value, this.httpOptions);
  }
  //inj save
  saveEditPatInjury(obj: ORMPatientInjury) {
    return this.http.post(this.config.apiEndpoint + 'patient/saveEditPatInjury', obj, this.httpOptions);
  }
  getPatientDocuments(patient_id: number, practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientDocuments/' + patient_id + '/' + practice_id, this.httpOptions);
  }
  deletePatientDocument(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/deletePatientDocument', obj, this.httpOptions);
  }
  confirmPatientDel(patientId: string) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/confirmPatientDel/' + patientId, this.httpOptions);
  }
  deletePatient(saveObjectWrapper: WrapperObjectSave) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/deletePatient', saveObjectWrapper, this.httpOptions);
  }
  saveeditCorrespondence(formData: FormData) {
    return this.http.post(this.config.apiEndpoint + 'patient/saveeditCorrespondence', formData);
  }

  saveOpenedPatient(objKeyValue: Array<ORMKeyValue>) {
    return this.http.post(
      this.config.apiEndpoint + 'patient/saveOpenedPatient', objKeyValue, this.httpOptions);
  }
  getCheckInPatient(patient_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getCheckInPatient/' + patient_id, this.httpOptions);
  }
  getPatientCheckedInInfo(patient_id) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientCheckedInInfo/' + patient_id, this.httpOptions);
  }

  getHealthInfoCapture(patient_id: number, practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getHealthInfoCapture/' + patient_id + '/' + practice_id, this.httpOptions);
  }
  // getHealthInfoCaptureAttach(health_info_id:string,recType:string){
  //   debugger;
  //   return this.http.get(this.config.apiEndpoint + 'patient/getHealthInfoCaptureAttach/' + health_info_id + '/' + recType, this.httpOptions);
  // }
  // getHealthInfoCaptureLinks(health_info_id:string,recType:string){
  //   debugger;
  //   return this.http.get(this.config.apiEndpoint + 'patient/getHealthInfoCaptureLinks/' + health_info_id + '/' + recType, this.httpOptions);
  // }
  getHealthInfoCaptureAttach(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'patient/getHealthInfoCaptureAttach', searchCriteria, this.httpOptions);
  }
  getHealthInfoCaptureLinks(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'patient/getHealthInfoCaptureLinks', searchCriteria, this.httpOptions);
  }
  getPatientNotes(patient_id) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientNotes/' + patient_id, this.httpOptions);
  }
  getStaffNoteAlert(patient_id) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getStaffNoteAlert/' + patient_id, this.httpOptions);
  }


  deleteNotes(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/deleteNotes', obj, this.httpOptions);
  }
  deleteResultStaffNotes(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/deleteResultStaffNotes', obj, this.httpOptions);
  }
  deleteAttabhmentStaffNotes(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/deleteAttabhmentStaffNotes', obj, this.httpOptions);
  }

  savePatientNotes(obj: ormpatientnotes) {
    debugger;
    return this.http.post(this.config.apiEndpoint + 'patient/savePatientNotes', obj, this.httpOptions);
  }
  // AddEditNewHealthInformation(WrapperPatientInfoCapture: WrapperPatientInfoCapture) {
  //   debugger;
  //   return this.http.post(
  //     this.config.apiEndpoint + 'patient/AddEditNewHealthInformation', WrapperPatientInfoCapture, this.httpOptions);
  // }
  AddEditNewHealthInformation(formData: FormData) {
    debugger;
    return this.http.post(this.config.apiEndpoint + 'patient/AddEditNewHealthInformation', formData);
  }
  QrdaImport(formData: FormData) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/qrdaImport', formData);
  }

  getAPIUsers(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'patient/getAPIUsers', searchCriteria, this.httpOptions);
  }
  getAPIUserPatients(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'patient/getAPIUserPatients', searchCriteria, this.httpOptions);
  }
  saveAPIUser(wrapperSave: WrapperPatientAPIUserSave) {
    return this.http.post(this.config.apiEndpoint + 'patient/saveAPIUser', wrapperSave, this.httpOptions);
  }

  deleteAPIUser(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'patient/deleteAPIUser', obj, this.httpOptions);
  }
  GenerateCCDA(obj: ORMCCDRequest) {
    return this.http.post(this.config.apiEndpoint + 'patient/GenerateCCDA', obj, this.httpOptions);
  }
  getPatientInsuranceToMerge(patientIds: string) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientInsuranceToMerge/' + patientIds, this.httpOptions);
  }
  mergePatients(lstParam: Array<ORMKeyValue>) {
    return this.http.post(this.config.apiEndpoint + 'patient/mergePatients', lstParam, this.httpOptions);
  }
  // deleteDocumentCategory(obj: ORMDeleteRecord) {
  //   return this.http.post(this.config.apiEndpoint + 'patient/deleteDocumentCategory', obj, this.httpOptions);
  // }
  deleteDocumentCategory(obj: ORMSaveDocCategory) {
    return this.http.post(this.config.apiEndpoint + 'patient/deleteDocumentCategory', obj, this.httpOptions);
  }
  addEditDocCategory(obj: ORMSaveDocCategory) {
    return this.http.post(this.config.apiEndpoint + 'patient/addEditDocCategory', obj, this.httpOptions);
  }
  getPatientTaskData(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'patient/getPatientTaskData', searchCriteria, this.httpOptions);
  }
  deleteInfoCapture(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'patient/deleteInfoCapture', obj, this.httpOptions);
  }

  checkIfPatientExists(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'patient/checkIfPatientExists', searchCriteria, this.httpOptions);
  }

  savePatientPic(formData: FormData) {
    return this.http
      .post(this.config.apiEndpoint + 'patient/savePatientPic/', formData)
  }

  getPatientPhrUsersNames(practiceId: number, patientId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'patient/getPatientPhrUsersNames/' + practiceId + '/' + patientId, this.httpOptions);
  }


}