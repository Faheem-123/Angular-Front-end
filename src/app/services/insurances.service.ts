import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from "../providers/app-config.module";
import { ORMSaveInsurancePayerTypes } from "../models/setting/ORMSaveInsurancePayerTypes";
import { ORMDeleteRecord } from "../models/general/orm-delete-record";
import { ORMSaveInsurance_Payers } from "../models/billing/ORMSaveInsurance_Payers";
import { ORMinsurancesetup } from "../models/setting/orm-insurance-setup";
import { ORMSaveProvider_Payers } from "../models/billing/ORMSaveProvider_Payers";
import { ORMPracticeInsurance } from "../models/setting/ORMPracticeInsurance";

@Injectable()
export class InsurancesService {
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    constructor(private http: HttpClient,
        @Inject(APP_CONFIG) private config: AppConfig) {
    }
    getInsurancePayerTypes() {
        return this.http.get(this.config.apiEndpoint + 'insurances/getInsurancePayerTypes/', this.httpOptions);
    }
    saveInsurancePayerTypes(ormSave: ORMSaveInsurancePayerTypes) {
        return this.http.post(
            this.config.apiEndpoint + 'insurances/saveInsurancePayerTypes', ormSave, this.httpOptions);
    }
    deleteInsurancePayerTypes(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'insurances/deleteInsurancePayerTypes', obj, this.httpOptions);
    }
    getPayerTypePayer(id: string) {
        return this.http.get(this.config.apiEndpoint + 'insurances/getPayerTypePayer/' + id, this.httpOptions);
    }
    saveInsurancePayer(ormSave: ORMSaveInsurance_Payers) {
        return this.http.post(
            this.config.apiEndpoint + 'insurances/saveInsurancePayer', ormSave, this.httpOptions);
    }
    deleteInsurancePayer(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'insurances/deleteInsurancePayer', obj, this.httpOptions);
    }
    getPayerInsurances(id: string) {
        return this.http.get(this.config.apiEndpoint + 'insurances/getPayerInsurances/' + id, this.httpOptions);
    }
    saveInsurances(ormSave: ORMinsurancesetup) {
        return this.http.post(
            this.config.apiEndpoint + 'insurances/saveInsurances', ormSave, this.httpOptions);
    }
    saveInsuranceslist(ormSave:Array<ORMinsurancesetup>) {
        return this.http.post(
            this.config.apiEndpoint + 'insurances/saveInsuranceslist', ormSave, this.httpOptions);
    }
    
    deleteInsurance(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'insurances/deleteInsurance', obj, this.httpOptions);
    }
    getProviderPayer(id) {
        debugger;
        return this.http.get(this.config.apiEndpoint + 'insurances/getProviderPayer/' + id, this.httpOptions);
    }
    saveProviderPayer(ormSave: ORMSaveProvider_Payers) {
        return this.http.post(
            this.config.apiEndpoint + 'insurances/saveProviderPayer', ormSave, this.httpOptions);
    }
    deleteProviderPayer(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'insurances/deleteProviderPayer', obj, this.httpOptions);
    }
    getProviderModifier() {
        return this.http.get(this.config.apiEndpoint + 'insurances/getProviderModifier', this.httpOptions);
    }
    getClient_Insurances(id) {
        return this.http.get(this.config.apiEndpoint + 'insurances/getClient_Insurances/'+id, this.httpOptions);
    }
    getUnMappedPracticeInsurances(practice_id,is_mapped,payerid){
        return this.http.get(this.config.apiEndpoint + 'insurances/getUnMappedPracticeInsurances/'+practice_id+'/'+is_mapped+'/'+payerid, this.httpOptions);
    }
    deletePracticeInsurance(obj){
        return this.http
        .post(this.config.apiEndpoint + 'insurances/deletePracticeInsurance', obj, this.httpOptions);
}
savePracticeInsurance(ormSave:Array<ORMPracticeInsurance>)
{
    return this.http
        .post(this.config.apiEndpoint + 'insurances/savePracticeInsurance', ormSave, this.httpOptions);
}
    
}