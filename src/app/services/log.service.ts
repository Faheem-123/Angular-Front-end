import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../providers/app-config.module';
import { SearchCriteria } from "../models/common/search-criteria";
import { ORMAppointmentCallsLogSave } from '../models/log/orm-appointment-calls-log-save';

@Injectable()
export class LogService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) { }

  getAppointmentsCallLog(searchCriteria: SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint + 'log/getAppointmentCallsLog/', searchCriteria, this.httpOptions);
  }
  saveAppointmentCallsLog(obj: ORMAppointmentCallsLogSave) {
    return this.http.post(this.config.apiEndpoint + 'log/saveAppointmentCallsLog', obj, this.httpOptions);
  }

  getACUCallsLog(searchCriteria: SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint + 'log/getACUCallsLog/', searchCriteria, this.httpOptions);
  }
  getPatientAccessLog(searchCriteria: SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint + 'log/getPatientAccessLog/', searchCriteria, this.httpOptions);
  }
  getEncounterAccessLog(searchCriteria: SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint + 'log/getEncounterAccessLog/', searchCriteria, this.httpOptions);
  }

  getAuditLog(moduleName:string, searchCriteria: SearchCriteria){
    return this.http.post(
      this.config.apiEndpoint + 'log/getAuditLog/'+moduleName, searchCriteria, this.httpOptions);
  }

  getLogList(logCategory: string){          
      return this.http.get(this.config.apiEndpoint + 'log/getLogList/' + logCategory, this.httpOptions);
  }
}