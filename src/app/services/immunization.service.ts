import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig, APP_CONFIG } from "../providers/app-config.module";
import { ORMPracticeImmunizationSave } from "../models/setting/Immunization/orm-practice-immunization-save";
import { ORMDeleteRecord } from "../models/general/orm-delete-record";
import { SearchCriteria } from "../models/common/search-criteria";
import { ORMImmInventorySave } from "../models/setting/Immunization/orm-imm-inventory-save";
import { ImmRegVXUCriteria } from "../ehr-modules/immunization-registry/imm-reg-vxu-criteria";
import { ImmRegQBPCriteria } from "../ehr-modules/immunization-registry/Imm-reg-qbp-criteria";
import { UpdateRecordModel } from "../models/general/update-record-model";


@Injectable()
export class ImmunizationService {
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    constructor(private http: HttpClient,
        @Inject(APP_CONFIG) private config: AppConfig) {
    }


    getImmunizationPracticeSearchList(practice_id: string, location_id: string) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmPracticeSearchList/' + practice_id + '/' + location_id, this.httpOptions);
    }

    getImmunizationTradeNameSearchList(practice_id: number) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmTradeNameSearchList/' + practice_id, this.httpOptions);
    }

    getSetupImmAllList(practiceId: number) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getSetupImmAllList/' + practiceId, this.httpOptions);
    }

    getSetupImmPracticeList(practiceId: number) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getSetupImmPracticeList/' + practiceId, this.httpOptions);
    }


    savePracticeImmmunization(ormPracticeImmunizationSave: ORMPracticeImmunizationSave) {
        return this.http.post(
            this.config.apiEndpoint + 'immunization/savePracticeImmunization', ormPracticeImmunizationSave, this.httpOptions);
    }
    deletePracticeImmmunization(ormDeleteRecord: ORMDeleteRecord) {
        return this.http.post(
            this.config.apiEndpoint + 'immunization/deletePracticeImmunization', ormDeleteRecord, this.httpOptions);
    }

    getImmManufacturer(cvxCode: string) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmManufacturer/' + cvxCode, this.httpOptions);
    }
    getImmTradeName(cvxCode: string) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmTradeName/' + cvxCode, this.httpOptions);
    }
    getImmProcedure(cvxCode: string) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmProcedure/' + cvxCode, this.httpOptions);
    }

    getImmNDC(cvxCode: string) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmNDC/' + cvxCode, this.httpOptions);
    }

    getImmVIS(cvxCode: string) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmVIS/' + cvxCode, this.httpOptions);
    }


    getImmRouteList() {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmRouteList', this.httpOptions);
    }
    getImmSiteList() {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmSiteList', this.httpOptions);
    }
    getImmCodeSet() {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmCodeSet', this.httpOptions);
    }


    getInventoryVaccineList(searchCriteria: SearchCriteria) {
        return this.http.post(
            this.config.apiEndpoint + 'immunization/getInventoryVaccineList', searchCriteria, this.httpOptions);
    }
    getInventoryVaccineDetails(searchCriteria: SearchCriteria) {
        return this.http.post(
            this.config.apiEndpoint + 'immunization/getInventoryVaccineDetails', searchCriteria, this.httpOptions);
    }


    saveImmmunizationInentory(ormImmunizationInventorySave: ORMImmInventorySave) {
        return this.http.post(
            this.config.apiEndpoint + 'immunization/saveImmInventory', ormImmunizationInventorySave, this.httpOptions);
    }
    deleteImmmunizationInventory(ormDeleteRecord: ORMDeleteRecord) {
        return this.http.post(
            this.config.apiEndpoint + 'immunization/deleteImmInventory', ormDeleteRecord, this.httpOptions);
    }


    getRegistryClinics(practiceId: number) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getClinics/' + practiceId, this.httpOptions);
    }



    getImmunizationInventoryUsage(inventoryId: number) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmInventoryUsage/' + inventoryId, this.httpOptions);
    }

    getImmRegMessages(searchCriteria: SearchCriteria) {
        return this.http.post(
            this.config.apiEndpoint + 'immunization/getImmRegMessages', searchCriteria, this.httpOptions);
    }

    getImmRegMsgImmunizations(messageId: number) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmRegMsgImmunizations/' + messageId, this.httpOptions);
    }
    getImmRegMsgErrors(messageId: number) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmRegMsgErrors/' + messageId, this.httpOptions);
    }

    getImmRegEvaluationHistoryForecastMessageDetails(registryCode:string, messageId: number) {
        return this.http.get(this.config.apiEndpoint + 'immunization/getImmRegEvaluationHistoryForecastMessageDetails/'+registryCode+'/' + messageId, this.httpOptions);
    }


    generateRegistryVXU_HL7(immRegVXUCriteria: ImmRegVXUCriteria) {
        return this.http.post(
            this.config.apiEndpoint + 'immunization/generateVXUFile', immRegVXUCriteria, this.httpOptions);

    }

    generateQBPFile_HL7_File(immRegQBPCriteria: ImmRegQBPCriteria) {
        return this.http.post(
            this.config.apiEndpoint + 'immunization/generateQBPFile', immRegQBPCriteria, this.httpOptions);

    }
    processAcknowledgementMessageFromFileData(formData: FormData) {
        return this.http
            .post(this.config.apiEndpoint + 'immunization/processAcknowledgementMessageFromFileData/', formData)
    }
    processAcknowledgementMessageFromDirectory(searchCriteria: SearchCriteria) {
        return this.http
            .post(this.config.apiEndpoint + 'immunization/processAcknowledgementMessageFromDirectory/', searchCriteria)
    }

    getPatientImmRegInfo(patientId) {
        return this.http.get(
            this.config.apiEndpoint + 'immunization/getPatientImmRegInfo/' + patientId, this.httpOptions);

    }
    markRegistryMessageAsResolved(updateRecordModel: UpdateRecordModel) {
        return this.http
            .post(this.config.apiEndpoint + 'immunization/markRegistryMessageAsResolved/', updateRecordModel)
    }


}