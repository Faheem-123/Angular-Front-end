import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from '../../providers/app-config.module';
import { SearchCriteria } from '../../models/common/search-criteria';

@Injectable()
export class EligibilityService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http:HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {    
   }

   getPatientElibility(searchCriteria:SearchCriteria){
    
    return this.http.post(
      this.config.apiEndpoint+'eligibility/getpatientelibility',searchCriteria,this.httpOptions);
    
  }
  getClaimElibility(searchCriteria:SearchCriteria){
    
    return this.http.post(
      this.config.apiEndpoint+'eligibility/getClaimElibility',searchCriteria,this.httpOptions);
    
  }


}
