import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../providers/app-config.module';
import { SearchCriteria } from "../../models/common/search-criteria";
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ORMSaveAppointment } from '../../models/scheduler/orm-save-appointment';
import { WrapperObjectSave } from '../../models/general/wrapper-object-save';
import { ORMDeleteRecord } from '../../models/general/orm-delete-record';
import { ORMUpdatePatientContactInfo } from '../../models/patient/orm-update-patient_contact-info';
import { ORMKeyValue } from '../../models/general/orm-key-value';
import { ORMSaveProviderTiming } from '../../models/scheduler/orm-save-provider-timing';
import { ORMSaveProviderTempTiming } from '../../models/scheduler/orm-save-provider-temp-timing';
import { ORMSaveLocationProviders } from '../../models/scheduler/orm-save-location-providers';
import { ORMSaveAppointmentSource } from '../../models/scheduler/orm-save-appointment-source';
import { ORMSaveAppointmentType } from '../../models/scheduler/orm-save-appointment-type';
import { ORMSaveAppointmentStatus } from '../../models/scheduler/orm-save-appointment-status';
import { ORMSaveLocationRooms } from '../../models/scheduler/orm-save-location-rooms';
import { ORMSaveAppointmentRules } from '../../models/scheduler/orm-save-appointment-rules';

@Injectable()
export class SchedulerService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {
  }

  getAppointment(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getappointments', searchCriteria, this.httpOptions);

  }
  getAppointmentsWithTiming(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getappointmentswithtiming', searchCriteria, this.httpOptions);

  }


  getLocationProviders(practiceId) {

    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getlocationproviders/' + practiceId, this.httpOptions);

  }

  /*
  getProviderTiming(searchCriteria:SearchCriteria){
    
    return this.http.post(
      this.config.apiEndpoint+'scheduler/getprovidertimings',searchCriteria,this.httpOptions);
    
  }
  */


  getSchedulerTiming(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getschedulertiming', searchCriteria, this.httpOptions);

  }

  /*
  getProviderTempTiming(searchCriteria:SearchCriteria){
    
    return this.http.post(
      this.config.apiEndpoint+'scheduler/getprovidertemptimings',searchCriteria,this.httpOptions);
    
  }
*/

  getAppSources(practiceId) {

    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getsources/' + practiceId, this.httpOptions);

  }


  getAppStatus(practiceId) {

    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getstatus/' + practiceId, this.httpOptions);

  }

  getAppTypes(practiceId) {

    return this.http.get(
      this.config.apiEndpoint + 'scheduler/gettypes/' + practiceId, this.httpOptions);

  }

  getAppReasons(practiceId) {

    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getreasons/' + practiceId, this.httpOptions);

  }

  getAppointmentDetails(appointmentId) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getappointmentdetails/' + appointmentId, this.httpOptions);
  }

  saveAppointments(saveObjectWrapper: WrapperObjectSave) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/saveappointment', saveObjectWrapper, this.httpOptions);
  }

  deleteAppointments(ormDeleteRecord: ORMDeleteRecord) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/deleteappointment', ormDeleteRecord, this.httpOptions);
  }

  getRooms(practiceId, locationId) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getrooms/' + practiceId + "/" + locationId, this.httpOptions);
  }
  getSuperBillcodes(practiceId, superbill, patientId) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getSuperBillcodes/' + practiceId + "/" + superbill + "/" + patientId, this.httpOptions);
  }
  getSuperbillHeaddertDetails(appointmentid) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getSuperbillHeaddertDetails/' + appointmentid, this.httpOptions);
  }

  getCheckInOutInfo(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getcheckinoutinfo', searchCriteria, this.httpOptions);

  }


  updatePatientContactInfo(ormUpdatePatientContactInfo: ORMUpdatePatientContactInfo) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/updatepatientcontactinfo', ormUpdatePatientContactInfo, this.httpOptions);
  }

  updateCheckInCheckOutRoom(lstORMKeyValue: Array<ORMKeyValue>) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/updatecheckinoutroom', lstORMKeyValue, this.httpOptions);
  }

  /**** Settings */
  getProviderTimingSettings(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getprovidertimingsettings', searchCriteria, this.httpOptions);
  }

  saveprovidertimingsettings(lstProviderTiming: Array<ORMSaveProviderTiming>) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/saveprovidertimingsettings', lstProviderTiming, this.httpOptions);
  }

  getProviderTempTimingSettings(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getprovidertemptimingsettings', searchCriteria, this.httpOptions);
  }

  saveProviderTempTimingSettings(ormSaveProviderTempTiming: ORMSaveProviderTempTiming) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/saveprovidertemptimingsettings', ormSaveProviderTempTiming, this.httpOptions);
  }

  deleteTempTiming(ormDeleteRecord: ORMDeleteRecord) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/deletetemptiming', ormDeleteRecord, this.httpOptions);
  }

  getLocationProviderSettings(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getlocationprovidersettings', searchCriteria, this.httpOptions);
  }
  saveLocationProviderSettings(lstSave: Array<ORMSaveLocationProviders>) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/savelocationprovidersettings', lstSave, this.httpOptions);
  }


  getAppointmentSourceSettings(practiceId) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getappointmentsourcesettings/' + practiceId, this.httpOptions);
  }

  saveAppointmentSource(ormSave: ORMSaveAppointmentSource) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/saveappointmentsourcesettings', ormSave, this.httpOptions);
  }

  deleteAppointmentSource(ormDeleteRecord: ORMDeleteRecord) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/deleteappointmentsourcesettings', ormDeleteRecord, this.httpOptions);
  }


  getAppointmentTypeSettings(practiceId) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getappointmenttypesettings/' + practiceId, this.httpOptions);
  }

  saveAppointmentType(ormSave: ORMSaveAppointmentType) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/saveappointmenttypesettings', ormSave, this.httpOptions);
  }

  deleteAppointmentType(ormDeleteRecord: ORMDeleteRecord) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/deleteappointmenttypesettings', ormDeleteRecord, this.httpOptions);
  }


  getAppointmentStatusSettings(practiceId) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getappointmentstatussettings/' + practiceId, this.httpOptions);
  }

  saveAppointmentStatus(ormSave: ORMSaveAppointmentStatus) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/saveappointmentstatussettings', ormSave, this.httpOptions);
  }

  deleteAppointmentStatus(ormDeleteRecord: ORMDeleteRecord) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/deleteappointmentstatussettings', ormDeleteRecord, this.httpOptions);
  }

  getLocationRoomsSettings(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getlocationroomssettings', searchCriteria, this.httpOptions);
  }

  saveLocationRoom(ormSave: ORMSaveLocationRooms) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/savelocationroomssettings', ormSave, this.httpOptions);
  }

  deleteLocationRoom(ormDeleteRecord: ORMDeleteRecord) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/deletealocationroomssettings', ormDeleteRecord, this.httpOptions);
  }

  getDistinctLocationProviders(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getdistinctlocationproviders/' + practiceId, this.httpOptions);
  }

  getAppointmentRules(providerId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getappointmentrules/' + providerId, this.httpOptions);
  }
  saveAppointmentRules(lstSave: Array<ORMSaveAppointmentRules>) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/saveappointmentrules', lstSave, this.httpOptions);
  }
  /************************************ */

  getAppointmentsByLocation(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getAppointmentsByLocation', searchCriteria, this.httpOptions);

  }

  getAppointmentsByProvider(searchCriteria: SearchCriteria) {

    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getAppointmentsByProvider', searchCriteria, this.httpOptions);

  }

  getAppointmentsMonthView(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getAppointmentsMonthView', searchCriteria, this.httpOptions);
  }
  getPatientDataonCheckedIn(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'scheduler/getPatientDataonCheckedIn', searchCriteria, this.httpOptions);
  }
  
}
