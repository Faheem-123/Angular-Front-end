import { Injectable, Inject } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../providers/app-config.module';
import { SearchCriteria } from '../models/common/search-criteria';

@Injectable()
export class SearchService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http:HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) { }

    searchDiagnosis(searchCriteria:SearchCriteria){
      return this.http
      .post(this.config.apiEndpoint+'search/diagnosis', searchCriteria);          
    }
    searchProcedures(searchCriteria:SearchCriteria){
      return this.http
      .post(this.config.apiEndpoint+'search/procedure', searchCriteria);          
    }

    searchPatient(searchCriteria:SearchCriteria){
    
      return this.http.post(
        this.config.apiEndpoint+'search/patient',searchCriteria,this.httpOptions);      
    }
    PHRsearchPatient(searchCriteria:SearchCriteria){
      return this.http.post(this.config.apiEndpoint+'search/PHRsearchPatient',searchCriteria,this.httpOptions);      
    }
    searchLabTest(searchCriteria:SearchCriteria){
    
      return this.http.post(
        this.config.apiEndpoint+'search/searchLabTest',searchCriteria,this.httpOptions);      
    }
    searchLabMappingTest(searchCriteria:SearchCriteria){
    
      return this.http.post(
        this.config.apiEndpoint+'search/searchLabMappingTest',searchCriteria,this.httpOptions);      
    }
    
    searchRace(searchCriteria:SearchCriteria){    
      return this.http.post(
        this.config.apiEndpoint+'search/race',searchCriteria,this.httpOptions);      
    }
    searchEthnicity(searchCriteria:SearchCriteria){    
      return this.http.post(
        this.config.apiEndpoint+'search/ethnicity',searchCriteria,this.httpOptions);      
    }
    searchInsurance(searchCriteria:SearchCriteria){    
      return this.http.post(
        this.config.apiEndpoint+'search/insurance',searchCriteria,this.httpOptions);      
    }
    searchGurantor(searchCriteria:SearchCriteria){    
      return this.http.post(
        this.config.apiEndpoint+'search/guarantor',searchCriteria,this.httpOptions);      
    }
    searchRefPhysician(searchCriteria:SearchCriteria){    
      return this.http.post(
        this.config.apiEndpoint+'search/refphysician',searchCriteria,this.httpOptions);      
    }   
    searchSpeciality(searchCriteria:SearchCriteria){    
      return this.http.post(
        this.config.apiEndpoint+'search/speciality',searchCriteria,this.httpOptions);      
    }
    searchPayer(searchCriteria:SearchCriteria){    
      return this.http.post(
        this.config.apiEndpoint+'search/payer',searchCriteria,this.httpOptions);      
    }
    getChartDiagnosis(patient_id:string,chart_id:string)//pass chart id if not have, java set get latest chart id itself
    {
      return this.http.get(
        this.config.apiEndpoint+'search/getChartDiagnosis/'+patient_id+'/'+chart_id,this.httpOptions);      
    }
    getLoinCode(searchCriteria:SearchCriteria){    
      return this.http.post(
        this.config.apiEndpoint+'search/getLoinCode',searchCriteria,this.httpOptions);      
    }
    searchFirm(searchCriteria:SearchCriteria){
      return this.http.post(this.config.apiEndpoint+'search/searchFirm',searchCriteria,this.httpOptions);      
    }
    searchCarePlan(searchCriteria:SearchCriteria){
      return this.http
      .post(this.config.apiEndpoint+'search/getAllChartPlan', searchCriteria);          
    }    
    
}
