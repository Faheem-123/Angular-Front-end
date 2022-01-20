import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from "../providers/app-config.module";
import { SearchCriteria } from "../models/common/search-criteria";


@Injectable()
export class PHSService {
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    constructor(private http: HttpClient,
        @Inject(APP_CONFIG) private config: AppConfig) {
    }

    GenerateSyndromicSurveillanceMessage(searchCriteria: SearchCriteria) {
        return this.http.post(
            this.config.apiEndpoint + 'phs/GenerateSyndromicSurveillanceMessage', searchCriteria, this.httpOptions);
    }
    
}