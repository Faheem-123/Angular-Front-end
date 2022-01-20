import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from "../providers/app-config.module";
import { SearchCriteria } from "../models/common/search-criteria";
import { ORMCDSSave } from "../models/setting/orm-cds-save";
import { ORMDeleteRecord } from "../models/general/orm-delete-record";


@Injectable()
export class CDSService {
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    constructor(private http: HttpClient,
        @Inject(APP_CONFIG) private config: AppConfig) {
    }


    RunCDSRules(searchCriteria: SearchCriteria) {
        return this.http.post(
            this.config.apiEndpoint + 'cds/RunCDSRules', searchCriteria, this.httpOptions);
    }


    getCDCRulesList(pracitceId: number) {
        return this.http.get(this.config.apiEndpoint + 'cds/getCDCRulesList/' + pracitceId, this.httpOptions);
    }

    getCDSRuleById(ruleId: number) {
        return this.http.get(this.config.apiEndpoint + 'cds/getCDSRuleById/' + ruleId, this.httpOptions);
    }

    saveCDSRule(ormCDSSave: ORMCDSSave) {
        return this.http.post(
            this.config.apiEndpoint + 'cds/saveCDSRule', ormCDSSave, this.httpOptions);
    }

    deleteCDSRule(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'cds/deleteCDSRule', obj, this.httpOptions);
    }


}