import { Injectable, Inject } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { APP_CONFIG, AppConfig } from "../providers/app-config.module";
import { ORMChartModuleSettingSave } from "../models/setting/ORMChartModuleSettingSave";
import { ORMChartModuleTempSettingSave } from "../models/setting/ORMChartModuleTempSettingSave";
import { ORMDeleteRecord } from "../models/general/orm-delete-record";
import { ORMSaveReferral } from "../models/setting/ORMSaveReferral";
import { ORMRSaveoleAdministrationModule } from "../models/setting/ORMRSaveoleAdministrationModule";
import { ORMRoleCDSRules } from "../models/setting/ORMRoleCDSRules";
import { SearchCriteria } from "../models/common/search-criteria";
import { ORMinsurancesetup } from "../models/setting/orm-insurance-setup";
import { ORMSaveSetupFacility } from "../models/setting/ORMSaveSetupFacility";
import { ORMSaveSetupLocation } from "../models/setting/ORMSaveSetupLocation";
import { ORMSaveSetupBillingProvider } from "../models/setting/ORMSaveSetupBillingProvider";
import { ORMSaveSetupProvider } from "../models/setting/ORMSaveSetupProvider";
import { ORMSaveSetupLabCategoryDetail } from "../models/setting/ORMSaveSetupLabCategoryDetail";
import { ORMSaveSetupSubLabCategory } from "../models/setting/ORMSaveSetupSubLabCategory";
import { ORMSaveSetupLabCategory } from "../models/setting/ORMSaveSetupLabCategory";
import { ORMSaveSuperBillCategoryDetail } from "../models/setting/ORMSaveSuperBillCategoryDetail";
import { ORMSaveSuperBillCategory } from "../models/setting/ORMSaveSuperBillCategory";
import { ORMSaveSuperBill } from "../models/setting/ORMSaveSuperBill";
import { ORMSaveGuarantor } from "../models/setting/ORMSaveGuarantor";
import { ORMTemplate } from "../models/setting/ORMTemplate";
import { ORMtemplateprovider } from "../models/setting/ORMtemplateprovider";
import { ORMMyListICD } from "../models/setting/ORMMyListICD";
import { ORMMyListCPT } from "../models/setting/ORMMyListCPT";
import { ORMAppSettingsSave } from "../models/setting/orm-app-settings-save";
import { ORMRestrictedCode } from "../models/billing/ORMRestrictedCode";
import { ORMAdjustmentReasonCodes } from "../models/billing/ORMAdjustmentReasonCodes";
import { ORMProcedureSetup } from "../models/setting/ORMProcedureSetup";
import { ORMDiagnosis } from "../models/setting/ORMDiagnosis";
import { ORMWriteOffCodes } from "../models/billing/ORMWriteOffCodes";
import { ORMPractice } from "../models/setting/ORMPractice";
import { ORMPracticeServices } from "../models/setting/ORMPracticeServices";
import { ORMProviderTemplateSave } from "../models/setting/ORMProviderTemplateSave";
import { ORM_template_provider } from "../models/setting/ORM_template_provider";

@Injectable()
export class SetupService {
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    constructor(private http: HttpClient,
        @Inject(APP_CONFIG) private config: AppConfig) { }

    getSetupAttorney(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupAttorney/' + practice_id, this.httpOptions);
    }
    getSetupReferringPhysician(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupRefferingPhysician/' + practice_id, this.httpOptions);
    }
    getSetupGuarantor(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupGuarantor/' + practice_id, this.httpOptions);
    }
    saveGuarantor(obj: ORMSaveGuarantor) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/saveGuarantor', obj, this.httpOptions);
    }
    deleteGuarantor(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteGuarantor', obj, this.httpOptions);
    }
    getSuperBillSetup(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSuperBillSetup/' + practice_id, this.httpOptions);
    }
    getSuperBillCategorySetup(bill_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSuperBillCategorySetup/' + bill_id, this.httpOptions);
    }
    getSuperBillCategoryDetailSetup(category_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSuperBillCategoryDetailSetup/' + category_id, this.httpOptions);
    }
    getSetupChartModuleSetting(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupChartModuleSetting/' + practice_id, this.httpOptions);
    }
    getSetupChartModuleSettingsDetail(setting_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupChartModuleSettingsDetail/' + setting_id, this.httpOptions);
    }
    getSetupChartModuleAll() {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupChartModuleAll/', this.httpOptions);
    }
    saveEncounterSetting(objSettingSave: ORMChartModuleSettingSave) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveEncounterSetting/', objSettingSave, this.httpOptions);
    }
    saveEncounterSettingDetail(lstSave: Array<ORMChartModuleTempSettingSave>) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveEncounterSettingDetail/', lstSave, this.httpOptions);
    }
    deleteEncounterSetting(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteEncounterSetting', obj, this.httpOptions);
    }
    deleteEncounterSettingModule(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteEncounterSettingModule', obj, this.httpOptions);
    }
    deleteEncounterSettingPage(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteEncounterSettingPage', obj, this.httpOptions);
    }

    saveReferral(obj: ORMSaveReferral) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/saveReferral', obj, this.httpOptions);
    }
    deleteReferral(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteReferral', obj, this.httpOptions);
    }
    getRoleAdministrationModules(practice_id: string, role_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getRoleAdministrationModules/' + practice_id + '/' + role_id, this.httpOptions);
    }
    SaveRoleAdministrationModules(lstSave: Array<ORMRSaveoleAdministrationModule>) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/SaveRoleAdministrationModules', lstSave, this.httpOptions);
    }
    getPracticeRoleCDSRules(practice_id: string, role_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getPracticeRoleCDSRules/' + practice_id + '/' + role_id, this.httpOptions);
    }
    SaveRoleCDS(lstSave: Array<ORMRoleCDSRules>) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/SaveRoleCDS', lstSave, this.httpOptions);
    }
    getClientPayerId(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getClientPayerId/' + practice_id, this.httpOptions);
    }
    getInsurances(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/getInsurances/', searchCriteria, this.httpOptions);
    }
    saveInsurance(obj: ORMinsurancesetup) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveInsurance', obj, this.httpOptions);
    }
    getPayerType(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getPayerType/' + practice_id, this.httpOptions);
    }
    searchInsuranceSetup(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/searchInsuranceSetup/', searchCriteria, this.httpOptions);
    }
    editWebsite(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/editWebsite', searchCriteria, this.httpOptions);
    }
    saveSuperBill(obj: ORMSaveSuperBill) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSuperBill', obj, this.httpOptions);
    }
    deleteSuperBill(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSuperBill', obj, this.httpOptions);
    }
    saveSuperBillCategory(obj: ORMSaveSuperBillCategory) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSuperBillCategory', obj, this.httpOptions);
    }
    deleteSuperBillCategory(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSuperBillCategory', obj, this.httpOptions);
    }
    saveSuperBillCategoryDetail(lstSave: Array<ORMSaveSuperBillCategoryDetail>) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSuperBillCategoryDetail', lstSave, this.httpOptions);
    }
    deleteSuperBillCategoryDetail(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSuperBillCategoryDetail', obj, this.httpOptions);
    }
    getSetupLabCategory(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupLabCategory/' + practice_id, this.httpOptions);
    }
    saveSetupLabCategory(obj: ORMSaveSetupLabCategory) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSetupLabCategory', obj, this.httpOptions);
    }
    deleteSetupLabCategory(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSetupLabCategory', obj, this.httpOptions);
    }

    getSetupSubLabCategory(category_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupSubLabCategory/' + category_id, this.httpOptions);
    }
    saveSetupSubLabCategory(obj: ORMSaveSetupSubLabCategory) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSetupSubLabCategory', obj, this.httpOptions);
    }
    deleteSetupLabCategorysub(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSetupLabCategorysub', obj, this.httpOptions);
    }
    getSetupLabCategoryDetail(category_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupLabCategoryDetail/' + category_id, this.httpOptions);
    }
    saveSetupLabCategoryDetail(lstSave: Array<ORMSaveSetupLabCategoryDetail>) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSetupLabCategoryDetail', lstSave, this.httpOptions);
    }
    deleteSetupLabCategoryDetail(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSetupLabCategoryDetail', obj, this.httpOptions);
    }
    getSetupProvider(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupProvider/' + practice_id, this.httpOptions);
    }
    saveSetupProvider(objSave: ORMSaveSetupProvider) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSetupProvider', objSave, this.httpOptions);
    }
    deleteSetupProvider(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSetupProvider', obj, this.httpOptions);
    }
    getSetupBillingProvider(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupBillingProvider/' + practice_id, this.httpOptions);
    }
    saveSetupBillingProvider(objSave: ORMSaveSetupBillingProvider) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSetupBillingProvider', objSave, this.httpOptions);
    }
    deleteSetupBillingProvider(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSetupBillingProvider', obj, this.httpOptions);
    }

    getSetupLocation(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupLocation/' + practice_id, this.httpOptions);
    }
    saveSetupLocation(objSave: ORMSaveSetupLocation) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSetupLocation', objSave, this.httpOptions);
    }
    deleteSetupLocation(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSetupLocation', obj, this.httpOptions);
    }
    getSetupFacility(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupFacility/' + practice_id, this.httpOptions);
    }
    saveSetupFacility(objSave: ORMSaveSetupFacility) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSetupFacility', objSave, this.httpOptions);
    }
    deleteSetupFacility(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSetupFacility', obj, this.httpOptions);
    }
    getTemplate(practice_id: string, type: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getTemplate/' + practice_id + '/' + type, this.httpOptions);
    }
    saveTemplateSetup(obj: ORMTemplate) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveTemplateSetup', obj, this.httpOptions);
    }
    DeleteTemplateProvider(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/DeleteTemplateProvider', searchCriteria, this.httpOptions);
    }
    saveSelectedProvider(obj: ORMtemplateprovider) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSelectedProvider', obj, this.httpOptions);
    }
    getSetupMyListICD(practice_id: string, provider_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupMyListICD/' + practice_id + '/' + provider_id, this.httpOptions);
    }
    saveSetupMyListICD(lstSave: Array<ORMMyListICD>) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSetupMyListICD', lstSave, this.httpOptions);
    }
    deleteSetupMyListICD(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSetupMyListICD', obj, this.httpOptions);
    }
    getSetupMyListCPT(practice_id: string, provider_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getSetupMyListCPT/' + practice_id + '/' + provider_id, this.httpOptions);
    }
    saveSetupMyListCPT(lstSave: Array<ORMMyListCPT>) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveSetupMyListCPT', lstSave, this.httpOptions);
    }
    deleteSetupMyListCPT(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteSetupMyListCPT', obj, this.httpOptions);
    }
    getTemplateDetails(practice_id: string, template_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/getTemplateDetails/' + practice_id + '/' + template_id, this.httpOptions);
    }
    getUserConfigurableAppSettings(practice_id: number) {
        return this.http.get(this.config.apiEndpoint + 'setup/getUserConfigurableAppSettings/' + practice_id, this.httpOptions);
    }

    saveAppSettings(lstSave: Array<ORMAppSettingsSave>) {
        return this.http.post(this.config.apiEndpoint + 'setup/savetConfigurableAppSettings', lstSave, this.httpOptions);
    }
    deleteSeletedTemplate(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/deleteSeletedTemplate', searchCriteria, this.httpOptions);
    }
    updateCategoryCodeType(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/updateCategoryCodeType', searchCriteria, this.httpOptions);
    }
    getRestrictedcode(practice_id: number) {
        return this.http.get(this.config.apiEndpoint + 'setup/getRestrictedcode/' + practice_id, this.httpOptions);
    }
    saveRestrictedCode(objSave: ORMRestrictedCode) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveRestrictedCode', objSave, this.httpOptions);
    }
    deleteRestrictedCode(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteRestrictedCode', obj, this.httpOptions);
    }
    getAdjustcode(practice_id: number) {
        return this.http.get(this.config.apiEndpoint + 'setup/getAdjustcode/' + practice_id, this.httpOptions);
    }
    saveAdjustCode(objSave: ORMAdjustmentReasonCodes) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveAdjustCode', objSave, this.httpOptions);
    }
    deleteAdjustCode(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteAdjustCode', obj, this.httpOptions);
    }
    getprocedures(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/getprocedures', searchCriteria, this.httpOptions);
    }
    addProcedure(ormProc: ORMProcedureSetup) {
        return this.http.post(this.config.apiEndpoint + 'setup/addProcedure', ormProc, this.httpOptions);
    }
    updateProcedure(ormProc: ORMProcedureSetup) {
        return this.http.post(this.config.apiEndpoint + 'setup/updateProcedure', ormProc, this.httpOptions);
    }
    deleteProcedure(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteProcedure', obj, this.httpOptions);
    }
    getDiagnosis(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/getDiagnosis', searchCriteria, this.httpOptions);
    }
    addDiagnosis(ormProc: ORMDiagnosis) {
        return this.http.post(this.config.apiEndpoint + 'setup/addDiagnosis', ormProc, this.httpOptions);
    }
    updateDiagnosis(ormProc: ORMDiagnosis) {
        return this.http.post(this.config.apiEndpoint + 'setup/updateDiagnosis', ormProc, this.httpOptions);
    }
    deleteDiagnosis(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteDiagnosis', obj, this.httpOptions);
    }
    getWriteOffcode(practice_id: number) {
        return this.http.get(this.config.apiEndpoint + 'setup/getWriteOffcode/' + practice_id, this.httpOptions);
    }
    saveWriteOffcode(objSave: ORMWriteOffCodes) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveWriteOffcode', objSave, this.httpOptions);
    }
    deleteWriteOffcode(obj: ORMDeleteRecord) {
        return this.http
            .post(this.config.apiEndpoint + 'setup/deleteWriteOffcode', obj, this.httpOptions);
    }
    getAllPractices() {
        return this.http.get(this.config.apiEndpoint + 'setup/getAllPractices/', this.httpOptions);
    }
    GetPracticeServices(practice_id: string) {
        return this.http.get(this.config.apiEndpoint + 'setup/GetPracticeServices/' + practice_id, this.httpOptions);
    }
    saveupdatePractices(obj: ORMPractice) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveupdatePractices', obj, this.httpOptions);
    }
    saveupdatePracticesServices(obj: Array<ORMPracticeServices>) {
        return this.http.post(this.config.apiEndpoint + 'setup/saveupdatePracticesServices', obj, this.httpOptions);
    }
    getTemplateProvider(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/getTemplateProvider', searchCriteria, this.httpOptions);
    }
    saveProvTemplateSetup(obj: ORMProviderTemplateSave){
        return this.http.post(this.config.apiEndpoint + 'setup/saveProvTemplateSetup', obj, this.httpOptions);
    }
    addEditProvTemplateSetup(obj: ORM_template_provider){
        return this.http.post(this.config.apiEndpoint + 'setup/addEditProvTemplateSetup', obj, this.httpOptions);
    }
    deleteSeletedProvTemplate(searchCriteria: SearchCriteria) {
        return this.http.post(this.config.apiEndpoint + 'setup/deleteSeletedProvTemplate', searchCriteria, this.httpOptions);
    }
}