import { log } from 'util';
import { GeneralService } from './../general/general.service';
import { LOOKUP_LIST, LookupList } from './../../providers/lookupList.module';
import { Injectable, Inject } from '@angular/core';
import { LogMessage } from '../../shared/log-message';
import { ormpatientimplantabledevice } from 'src/app/models/encounter/ormpatientimplantabledevice';
import { ORMLoginVerify } from 'src/app/models/general/ORMLoginVerify';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Injectable()
export class LoadStartupService {
  waitForLogin = 1;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalService: GeneralService, private logMessage: LogMessage,
    private generalOperation: GeneralOperation) {

  }

  loadAppData() {
    debugger;
    this.waitForLogin = 14;
    if (this.lookupList.loginWithOverrideRigts) {
      this.waitForLogin = 16;
      this.getOverrideSecuritySettings();
      this.getAllModules();
    }
    this.getLocation();
    this.getPracticeUserName();
    this.getUserEncounterSetting();
    this.getDocumentCategories();
    this.getDocumentCategoriesList();
    this.getDocumentPath();
    this.getUserRights();
    this.getPracticeLab();
    this.getAppSetting();
    this.getUserAllRoles();
    this.getProvider();
    this.getBillingProviderList();
    this.getUnReadMessagesCount();
    this.getChartAllPrintModule();

  }
  isDataLoadCompleted() {
    this.waitForLogin--;
    //Login Success 
    if (this.waitForLogin == 0)
      this.lookupList.isEhrDataLoad = true;
  }


  getBillingProviderList() {
    this.generalService.getBillingProviderList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lookupList.billingProviderList = data as Array<any>;
        this.isDataLoadCompleted();

      },
      error => {
        this.logMessage.log("getBillingProviderList: " + error);
      }
    );
  }
  getAllModules() {
    this.generalService.getAllModules(this.lookupList.practiceInfo.practiceId).subscribe(

      data => {
        this.lookupList.lstAllModulesList = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getAllModules: " + error);
      }
    );
  }
  getOverrideSecuritySettings() {
    this.generalService.getOverrideSecuritySettings(this.lookupList.practiceInfo.practiceId, this.lookupList.logedInUser.userRole).subscribe(

      data => {
        this.lookupList.lstOverrideSecurityRights = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getOverrideSecuritySettings: " + error);
      }
    );
  }
  getAppSetting() {
    this.generalService.getAppSetting(this.lookupList.practiceInfo.practiceId).subscribe(

      data => {
        this.lookupList.appSettings = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getAppSetting: " + error);
      }
    );
  }
  getProvider() {
    //Load Provider
    this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(

      data => {
        this.lookupList.providerList = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getProvider: " + error);
      }
    );
  }
  getLocation() {
    //Load Location
    this.generalService.getLocation(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.locationList = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getLocation: " + error);
      }
    );
  }
  getPracticeUserName() {
    //Practice Users
    this.generalService.getPracticeUserName(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.listpracticeUserName = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getPracticeUserName:" + error);
      }
    );
  }
  getUserEncounterSetting() {
    //Encounter Setting
    let chartSettingID;
    if (this.lookupList.logedInUser.defaultChartSetting != null && this.lookupList.logedInUser.defaultChartSetting > 0)
      chartSettingID = this.lookupList.logedInUser.defaultChartSetting;
    else
      chartSettingID = "50010111";         // if default not assign

    this.generalService.getUserChartModuleSetting(chartSettingID).subscribe(
      data => {
        this.lookupList.lstUserChartModuleSetting = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getUserEncounterSetting:" + error);
      }
    );
  }
  
  getDocumentCategories() {
    //getDocCategories
    this.generalService.getDocCategories(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.lstDocumentCategory = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getDocumentCategories:" + error);
      }
    );
  }
  getDocumentCategoriesList() {
    //getDocCategories
    this.generalService.getDocCategoriesList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.lstDocumentCategoryList = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getDocumentCategoriesList:" + error);
      }
    );
  }
  getDocumentPath() {
    //getDocumentPaths
    this.generalService.getDocumentPaths(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.lstdocumentPath = data as Array<any>;



        if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {

          this.lookupList.lstdocumentPath.forEach(path => {
            if (path.category_name == "PracticeLogo" && path.category_name != undefined && path.category_name != null && path.category_name != '') {
              debugger;
              this.lookupList.practiceInfo.logo = path.download_path + "/" + this.lookupList.practiceInfo.practiceId + "/PracticeLogo/logo-small.png";
            }
          });


        }



        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getDocumentPath:" + error);
      }
    );
  }
  getPracticeLab() {
    this.generalService.getPracticeLab(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.lstPracticeLab = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getDocumentPath:" + error);
      }
    );
  }
  getUserRights() {
    //getUserRights
    this.generalService.getUserRights(this.lookupList.logedInUser.userId).subscribe(
      data => {
        this.lookupList.lstUserRights = data as Array<any>;
        this.setUserRights(this.lookupList.lstUserRights);
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getUserRights:" + error);
      }
    );
  }
  prepareEmergencyRights(data) {
    debugger;
    for (let i = 0; i < this.lookupList.lstAllModulesList.length; i++) {
      let acfiltered = new ListFilterPipe().transform(data, "actual_name", this.lookupList.lstAllModulesList[i].actual_name);
      if (acfiltered.length < 1) {
        for (let j = 0; j < this.lookupList.lstOverrideSecurityRights.length; j++) {
          if (this.lookupList.lstAllModulesList[i].name != "Administration" && this.lookupList.lstAllModulesList[i].name != "Document Portal") {
            if (this.lookupList.lstOverrideSecurityRights[j].col3 == "add") {
              if ((this.lookupList.lstAllModulesList[i].operation as String).toLowerCase().indexOf("add") >= 0
                || (this.lookupList.lstAllModulesList[i].operation as String).toLowerCase().indexOf("new") >= 0) {

                this.lookupList.lstUserRights.push({
                  "module_role_detail_id": "", "module_id": this.lookupList.lstAllModulesList[i].module_id,
                  "name": this.lookupList.lstAllModulesList[i].name, "actual_name": this.lookupList.lstAllModulesList[i].actual_name,
                  "operation": this.lookupList.lstAllModulesList[i].operation
                });
              }
            }
            else if (this.lookupList.lstOverrideSecurityRights[j].col3 == "modify") {
              if ((this.lookupList.lstAllModulesList[i].operation as String).toLowerCase().indexOf("modify") >= 0
                || (this.lookupList.lstAllModulesList[i].operation as String).toLowerCase().indexOf("edit") >= 0) {

                this.lookupList.lstUserRights.push({
                  "module_role_detail_id": "", "module_id": this.lookupList.lstAllModulesList[i].module_id,
                  "name": this.lookupList.lstAllModulesList[i].name, "actual_name": this.lookupList.lstAllModulesList[i].actual_name,
                  "operation": this.lookupList.lstAllModulesList[i].operation
                });
              }
            }
            else if ((this.lookupList.lstAllModulesList[i].operation as String).toLowerCase().indexOf(this.lookupList.lstOverrideSecurityRights[j].col3) >= 0) {

              this.lookupList.lstUserRights.push({
                "module_role_detail_id": "", "module_id": this.lookupList.lstAllModulesList[i].module_id,
                "name": this.lookupList.lstAllModulesList[i].name, "actual_name": this.lookupList.lstAllModulesList[i].actual_name,
                "operation": this.lookupList.lstAllModulesList[i].operation
              });
            }
          }
        }
      }
    }
  }
  setUserRights(data) {
    try {
      debugger;
      if (this.lookupList.loginWithOverrideRigts)
        this.prepareEmergencyRights(this.lookupList.lstUserRights);
      for (let r = 0; r < this.lookupList.lstUserRights.length; r++) {
        switch (this.lookupList.lstUserRights[r].actual_name) {
          case "show_billing":
            this.lookupList.UserRights.view_billing = true;
            break;
          // Lab Order----------------------------------------------------------------
          case "lab_order_search":
            this.lookupList.UserRights.lab_order_search = true;
            break;
          case "lab_result_search":
            this.lookupList.UserRights.lab_result_search = true;
            break;
          case "lab_order_view":
            this.lookupList.UserRights.lab_order_view = true;
            break;
          case "lab_order_add_modify":
            this.lookupList.UserRights.lab_order_add_modify = true;
            break;
          case "lab_order_delete":
            this.lookupList.UserRights.lab_order_delete = true;
            break;
          case "lab_order_sign":
            this.lookupList.UserRights.lab_order_sign = true;
            break;
          case "lab_result_view":
            this.lookupList.UserRights.lab_result_view = true;
            break;
          case "lab_result_add_modify":
            this.lookupList.UserRights.lab_result_add_modify = true;
            break;
          case "lab_result_delete":
            this.lookupList.UserRights.lab_result_delete = true;
            break;
          case "lab_results_modify_signed":
            this.lookupList.UserRights.lab_results_modify_signed = true;
            break;
          case "lab_attachments_view_upload":
            this.lookupList.UserRights.lab_attachments_view_upload = true;
            break;
          case "lab_result_sign":
            this.lookupList.UserRights.lab_result_sign = true;
            break;
          case "lab_result_cummulative":
            this.lookupList.UserRights.lab_result_cummulative = true;
            break;
          case "lab_order_add_modify_test":
            this.lookupList.UserRights.lab_order_add_test = true;
            break;
          case "lab_order_modify_info":
            this.lookupList.UserRights.lab_order_modify_info = true;
            break;
          case "lab_attachment_view":
            this.lookupList.UserRights.lab_attachment_view = true;
            break;
          case "lab_attachment_edit":
            this.lookupList.UserRights.lab_attachment_edit = true;
            break;
          //---------------------------------------------------------------------------

          case "progress_notes_view":
            this.lookupList.UserRights.ViewProgressNote = true;
            break;
          case "progress_notes_addmodify":
            this.lookupList.UserRights.AddModifyProgressNote = true;
            break;
          case "charts_pmh_view":
            this.lookupList.UserRights.ViewPMH = true;
            break;
          case "charts_pmh_add":
            this.lookupList.UserRights.AddModifyPMH = true;
            break;
          case "cognitive_view":
            this.lookupList.UserRights.ViewCognitive = true;
            break;
          case "cognitive_addmodify":
            this.lookupList.UserRights.AddModifyCognitive = true;
            break;
          case "chart_assessment_view":
            this.lookupList.UserRights.ViewAssessment = true;
            break;
          case "chart_assessment_edit":
            this.lookupList.UserRights.AddModifyAssessment = true;
            break;
          case "careplan_view":
            this.lookupList.UserRights.ViewCarePlan = true;
            break;
          case "careplan_addmodify":
            this.lookupList.UserRights.AddModifyCarePlan = true;
            break;
          case "discharge_disposition_view":
            this.lookupList.UserRights.ViewDischargeDisposition = true;
            break;
          case "discharge_disposition_edit":
            this.lookupList.UserRights.AddModifyDischargeDisposition = true;
            break;
          case "charts_rfv_view":
            this.lookupList.UserRights.ViewReasonforVisit = true;
            break;
          case "charts_rfv_add":
            this.lookupList.UserRights.AddModifyReasonforVisit = true;
            break;
          case "charts_vital_view":
            this.lookupList.UserRights.ViewVitalSigns = true;
            break;
          case "charts_vital_Quick":
            this.lookupList.UserRights.QuickVitalDefault = true;
            break;
          case "charts_vital_add":
            this.lookupList.UserRights.AddModifyVitalSign = true;
            break;
          case "charts_surgeries_view":
            this.lookupList.UserRights.ViewSurgeries = true;
            break;
          case "charts_surgeries_add":
            this.lookupList.UserRights.AddModifySurgeries = true;
            break;
          case "charts_immunization_view":
            this.lookupList.UserRights.ViewImmunization = true;
            break;
          case "charts_immunization_add":
            this.lookupList.UserRights.AddModifyImmunization = true;
            break;
          case "charts_allergies_view":
            this.lookupList.UserRights.ViewAllergies = true;
            break;
          case "charts_allergies_add":
            this.lookupList.UserRights.AddModifyAllergies = true;
            break;
          case "charts_problemlist_view":
            this.lookupList.UserRights.ViewProblemList = true;
            break;
          case "charts_problemlist_add":
            this.lookupList.UserRights.AddModifyProblemList = true;
            break;
          case "charts_familyhx_view":
            this.lookupList.UserRights.ViewFamilyHx = true;
            break;
          case "charts_familyhx_add":
            this.lookupList.UserRights.AddModifyFamilyHx = true;
            break;
          case "charts_social_view":
            this.lookupList.UserRights.ViewSocialHx = true;
            break;
          case "charts_social_add":
            this.lookupList.UserRights.AddModifySocialHx = true;
            break;
          case "charts_annotations_view":
            this.lookupList.UserRights.ViewAnnotation = true;
            break;
          case "charts_annotations_add":
            this.lookupList.UserRights.AddModifyAnnotation = true;
            break;
          case "charts_medication_all_view":
            this.lookupList.UserRights.ViewMedication = true;
            break;
          case "charts_medication_all_add":
            this.lookupList.UserRights.AddModifyMedication = true;
            break;
          case "charts_ros_view":
            this.lookupList.UserRights.ViewROS = true;
            break;
          case "charts_ros_add":
            this.lookupList.UserRights.AddModifyROS = true;
            break;
          case "charts_pe_view":
            this.lookupList.UserRights.ViewPE = true;
            break;
          case "charts_pe_add":
            this.lookupList.UserRights.AddModifyPE = true;
            break;
          case "amendment_view":
            this.lookupList.UserRights.ViewAmendments = true;
            break;
          case "amendment_edit":
            this.lookupList.UserRights.AddModifyAmendments = true;
            break;
          case "chart_add":
            this.lookupList.UserRights.CanAddChart = true;
            break;
          case "chart_view":
            this.lookupList.UserRights.canViewChart = true;
            break;
          case "chart_print":
            this.lookupList.UserRights.CanPrintChart = true;
            break;
          case "chart_delete":
            this.lookupList.UserRights.CanDeleteChart = true;
            break;
          case "charts_sign":
            this.lookupList.UserRights.CanSignChart = true;
            break;
          case "chart_unsign":
            this.lookupList.UserRights.CanUnSignChart = true;
            break;
          case "charts_modify_sign":
            this.lookupList.UserRights.CanModifySignChart = true;
            break;
          case "charts_cosign":
            this.lookupList.UserRights.CanCosign = true;
            break;
          case "createchart":
            this.lookupList.UserRights.createchart = true;
            break;
          case "scheduler_view":
            this.lookupList.UserRights.scheduler_view = true;
            break;
          case "scheduler_edit":
            this.lookupList.UserRights.scheduler_edit = true;
            break;
          case "scheduler_delete":
            this.lookupList.UserRights.scheduler_delete = true;
            break;
          case "scheduler_view_settings":
            this.lookupList.UserRights.scheduler_view_settings = true;
            break;
          case "claim_view":
            this.lookupList.UserRights.claim_view = true;
            break;
          case "claim_edit":
            this.lookupList.UserRights.claim_edit = true;
            break;
          case "claim_delete":
            this.lookupList.UserRights.claim_delete = true;
            break;
          case "claim_draft_edit":
            this.lookupList.UserRights.claim_draft_edit = true;
            break;
          case "claim_edit_billed":
            this.lookupList.UserRights.claim_edit_billed = true;
            break;
          case "claim_status_edit":
            this.lookupList.UserRights.claim_status_edit = true;
            break;

          case "view_patient_claim":
            this.lookupList.UserRights.view_patient_claim = true;
            break;
          case "payment_view":
            this.lookupList.UserRights.payment_view = true;
            break;
          case "payment_add":
            this.lookupList.UserRights.payment_add = true;
            break;
          case "payment_refund":
            this.lookupList.UserRights.payment_refund = true;
            break;
          case "patient_eob_payment":
            this.lookupList.UserRights.patient_eob_payment = true;
            break;

          case "claim_batch_new_batch":
            this.lookupList.UserRights.claim_batch_new_batch = true;
            break;
          case "claim_batch_addin_batch":
            this.lookupList.UserRights.claim_batch_addin_batch = true;
            break;
          case "claim_batch_upload":
            this.lookupList.UserRights.claim_batch_upload = true;
            break;
          case "claim_batch_getresponse":
            this.lookupList.UserRights.claim_batch_getresponse = true;
            break;
          case "era_import":
            this.lookupList.UserRights.era_import = true;
            break;
          case "era_delete":
            this.lookupList.UserRights.era_delete = true;
            break;
          case "post_full_era":
            debugger;
            this.lookupList.UserRights.post_full_era = true;
            break;
          case "mark_era_as_posted":
            this.lookupList.UserRights.mark_era_as_posted = true;
            break;
          case "eob_new":
            this.lookupList.UserRights.eob_new = true;
            break;
          case "eob_edit":
            this.lookupList.UserRights.eob_edit = true;
            break;
          case "eob_delete":
            this.lookupList.UserRights.eob_delete = true;
            break;
          case "eob_markas_posted":
            this.lookupList.UserRights.eob_markas_posted = true;
            break;
          //Patient
          case "patient_view":
            this.lookupList.UserRights.patient_view = true;
            break;
          case "patient_edit":
            this.lookupList.UserRights.patient_edit = true;
            break;
          case "patient_delete":
            this.lookupList.UserRights.patient_delete = true;
            break;
          case "phr_access":
            this.lookupList.UserRights.phr_access = true;
            break;
          case "patient_ins_view":
            this.lookupList.UserRights.patient_ins_view = true;
            break;
          case "patient_ins_edit":
            this.lookupList.UserRights.patient_ins_edit = true;
            break;
          case "patient_ins_delete":
            this.lookupList.UserRights.patient_ins_delete = true;
            break;
          case "patient_ins_add":
            this.lookupList.UserRights.patient_ins_add = true;
            break;
          case "document_view":
            this.lookupList.UserRights.document_view = true;
            break;
          case "document_edit":
            this.lookupList.UserRights.document_edit = true;
            break;
          case "document_delete":
            this.lookupList.UserRights.document_delete = true;
            break;
          case "document_add":
            this.lookupList.UserRights.document_add = true;
            break;
          case "message_delete":
            this.lookupList.UserRights.message_delete = true;
            break;
          case "message_new":
            this.lookupList.UserRights.message_send = true;
            break;
          case "message_view":
            this.lookupList.UserRights.message_view = true;
            break;
          case "plan_of_care_notes_view":
            this.lookupList.UserRights.viewPlanOfCareNotes = true;
            break;
          case "plan_of_care_notes_addmodify":
            this.lookupList.UserRights.AddModifyPlanOfCareNotes = true;
            break;
          case "view_chart_amendments":
            this.lookupList.UserRights.viewChartAmendments = true;
            break;
          case "amend_chart":
            this.lookupList.UserRights.AmendCharts = true;
            break;
          case "charts_medication_del":
            this.lookupList.UserRights.deleteMedication = true;
            break;
          case "view_setting":
            this.lookupList.UserRights.setting = true;
            break;
          case "dashboard_result":
            this.lookupList.UserRights.dashboard_result = true;
            break;
          case "dashboard_checkedin":
            this.lookupList.UserRights.dashboard_checkedin = true;
            break;
          case "dashboard_cashregster":
            this.lookupList.UserRights.dashboard_cashregster = true;
            break;
          case "dashboard_claim":
            this.lookupList.UserRights.dashboard_claim = true;
            break;
          case "dashboard_message":
            this.lookupList.UserRights.dashboard_message = true;
            break;
          case "dashboard_fax":
            this.lookupList.UserRights.dashboard_fax = true;
            break;
          case "dashboard_prescription":
            this.lookupList.UserRights.dashboard_prescription = true;
            break;

          case "cashregister_view":
            this.lookupList.UserRights.cashregister_view = true;
            break;
          case "cashregister_add":
            this.lookupList.UserRights.cashregister_add = true;
            break;
          case "cashregister_modify":
            this.lookupList.UserRights.cashregister_modify = true;
            break;
          case "cashregister_delete":
            this.lookupList.UserRights.cashregister_delete = true;
            break;
          case "cashregister_void":
            this.lookupList.UserRights.cashregister_void = true;
            break;
          case "cashregister_check_bounce":
            this.lookupList.UserRights.cashregister_check_bounce = true;
            break;
          case "Administration":
            this.lookupList.UserRights.administration = true;
            break;
          case "PortialMapDocument":
            this.lookupList.UserRights.documentPoral = true;
            break;
          //doc category
          case "document_category_add":
            this.lookupList.UserRights.documentCategory_Add = true;
            break;
          case "document_category_modify":
            this.lookupList.UserRights.documentCategory_Modify = true;
            break;
          case "document_category_delete":
            this.lookupList.UserRights.documentCategory_Delete = true;
            break;
          case "downloadfax":
            this.lookupList.UserRights.fax_Download = true;
            break;
          case "fax_new":
            this.lookupList.UserRights.fax_new = true;
            break;
          case "fax_enable":
            this.lookupList.UserRights.fax_enable = true;
            break;
          case "fax_sent":
            this.lookupList.UserRights.fax_sent = true;
            break;
          case "fax_other_users":
            this.lookupList.UserRights.fax_other_users = true;
            break;
          case "add_patient_alerts":
            this.lookupList.UserRights.add_patient_alerts = true;
            break;
          case "edit_patient_alerts":
            this.lookupList.UserRights.edit_patient_alerts = true;
            break;
          case "letter_view":
            this.lookupList.UserRights.letter_view = true;
            break;
          case "letter_add_modify":
            this.lookupList.UserRights.letter_addmodify = true;
            break;
          case "temp_add_modify":
            this.lookupList.UserRights.template_addmodify = true;
            break;
          case "temp_delete":
            this.lookupList.UserRights.template_delete = true;
            break;
          case "letter_delete":
            this.lookupList.UserRights.letter_delete = true;
            break;
          case "patient_log_view":
            this.lookupList.UserRights.patient_log_view = true;
            break;
          case "reports_view":
            this.lookupList.UserRights.view_reports = true;
            break;
          case "user_adminstration":
            this.lookupList.UserRights.user_adminstration = true;
            break;
          //--Patient Notes
          case "pat_staffnotes":
            this.lookupList.UserRights.pat_staffnotes = true;
            break;
          case "pat_phynotes":
            this.lookupList.UserRights.pat_phynotes = true;
            break;
          case "pat_delnotes":
            this.lookupList.UserRights.pat_delnotes = true;
            break;
          //reports
          case "NQF":
            this.lookupList.UserRights.rptnqf = true;
            break;
          case "rptPatientList":
            this.lookupList.UserRights.rptpatientlist = true;
            break;
          case "PHS_LOG":
            this.lookupList.UserRights.rptphslog = true;
            break;
          case "DynamicRpt":
            this.lookupList.UserRights.rptdymanic = true;
            break;
          case "MuCalculator":
            this.lookupList.UserRights.rptautomeasure = true;
            break;
          case "CPTReport_Amount":
            this.lookupList.UserRights.rptcptamt = true;
            break;
          case "rptencounter":
            this.lookupList.UserRights.rptencounter = true;
            break;
          case "rptdiagnostic":
            this.lookupList.UserRights.rptdiagnostic = true;
            break;
          case "rptCashRegister":
            this.lookupList.UserRights.rptCashRegister = true;
            break;
          case "rptappointment":
            this.lookupList.UserRights.rptappointment = true;
            break;
          case "rptworkreport":
            this.lookupList.UserRights.rptworkReport = true;
            break;
          case "rpthcfa":
            this.lookupList.UserRights.rptHcfa = true;
            break;
          case "rptPatientEligibility":
            this.lookupList.UserRights.rptPatientEligibility = true;
            break;
          case "rptpayroll":
            this.lookupList.UserRights.rptpayroll = true;
            break;
          case "rptclaimDetail":
            this.lookupList.UserRights.rptclaimDetail = true;
            break;
          case "rptcrossReport":
            this.lookupList.UserRights.rptCrossreport = true;
            break;
          case "rptEncounterCount":
            this.lookupList.UserRights.rptEncounterCount = true;
            break;
          case "rptPaymentCateogry":
            this.lookupList.UserRights.rptPaymentCateogry = true;
            break;
          case "rptPatientLastVisit":
            this.lookupList.UserRights.rptPatientLastVisit = true;
            break;
          case "rptNotPaidReason":
            this.lookupList.UserRights.rptNotPaidReason = true;
            break;
          case "rptNewPatient":
            this.lookupList.UserRights.rptNewPatient = true;
            break;
          case "rptReminderCall":
            this.lookupList.UserRights.rptReminderCall = true;
            break;
          case "rptGynMissedVisit":
            this.lookupList.UserRights.rptGynMissedVisit = true;
            break;
          case "rptPregnencyRegister":
            this.lookupList.UserRights.rptPregnencyRegister = true;
            break;
          case "rptPayerWisePatient":
            this.lookupList.UserRights.rptPayerWisePatient = true;
            break;
          case "rptACO":
            this.lookupList.UserRights.rptACO = true;
            break;
          case "ClaimSummaryReport":
            this.lookupList.UserRights.ClaimSummaryReport = true;
            break;
          case "GeneralReport":
            this.lookupList.UserRights.GeneralReport = true;
            break;
          case "CorrespondenceReport":
            this.lookupList.UserRights.CorrespondenceReport = true;
            break;
            
          //---
          case "OvrSecButtonView":
            this.lookupList.UserRights.canViewOverSecurityButton = true;
            break;
          case "patient_messages":
            this.lookupList.UserRights.view_patient_messages = true;
            break;
          case "healthcheck_view":
            this.lookupList.UserRights.ViewHealthCheck = true;
            break;
          case "healthcheck_edit":
            this.lookupList.UserRights.AddModifyHealthCheck = true;
            break;
          case "childhoodexam_view":
            this.lookupList.UserRights.ViewChildhoodExam = true;
            break;
          case "childhoodexam_edit":
            this.lookupList.UserRights.AddModifyChildhoodExam = true;
            break;
          case "sessioninfo_view":
            this.lookupList.UserRights.ViewSessionInfo = true;
            break;
          case "sessioninfo_edit":
            this.lookupList.UserRights.AddModifySessionInfo = true;
            break;
          case "annualwellness_view":
            this.lookupList.UserRights.ViewAnnualWellness = true;
            break;
          case "annualwellness_edit":
            this.lookupList.UserRights.AddModifyAnnualWellness = true;
            break;
          case "patient_referral_view":
            this.lookupList.UserRights.ViewReferral = true;
            break;
          case "patient_referral_edit":
            this.lookupList.UserRights.AddModifyReferral = true;
            break;
          case "health_maintenance_view":
            this.lookupList.UserRights.ViewHealthMaint = true;
            break;
          case "health_maintenance_edit":
            this.lookupList.UserRights.AddModifyHealthMaint = true;
            break;
          case "depressions_screening_view":
            this.lookupList.UserRights.ViewDepressionScreening = true;
            break;
          case "depressions_screening_edit":
            this.lookupList.UserRights.AddModifyDepressionScreening = true;
            break;


          case "AddNewInsurance":
            this.lookupList.UserRights.Add_insurance = true;
            break;
          case "EditInsurance":
            this.lookupList.UserRights.Edit_insurance = true;
            break;
          case "insurance_delete":
            this.lookupList.UserRights.insurance_delete = true;
            break;

          case "insurance_payer_type_add":
            this.lookupList.UserRights.insurance_payer_type_add = true;
            break;
          case "insurance_payer_type_edit":
            this.lookupList.UserRights.insurance_payer_type_edit = true;
            break;
          case "insurance_payer_type_delete":
            this.lookupList.UserRights.insurance_payer_type_delete = true;
            break;

          case "insurance_payer_add":
            this.lookupList.UserRights.insurance_payer_add = true;
            break;
          case "insurance_payer_edit":
            this.lookupList.UserRights.insurance_payer_edit = true;
            break;
          case "insurance_payer_delete":
            this.lookupList.UserRights.insurance_payer_delete = true;
            break;

          case "provider_payer_add":
            this.lookupList.UserRights.provider_payer_add = true;
            break;
          case "provider_payer_edit":
            this.lookupList.UserRights.provider_payer_edit = true;
            break;
          case "provider_payer_delete":
            this.lookupList.UserRights.provider_payer_delete = true;
            break;

          case "provider_add":
            this.lookupList.UserRights.provider_add = true;
            break;
          case "provider_edit":
            this.lookupList.UserRights.provider_edit = true;
            break;
          case "provider_delete":
            this.lookupList.UserRights.provider_delete = true;
            break;

          case "billing_provider_add":
            this.lookupList.UserRights.billing_provider_add = true;
            break;
          case "billing_provider_edit":
            this.lookupList.UserRights.billing_provider_edit = true;
            break;
          case "billing_provider_delete":
            this.lookupList.UserRights.billing_provider_delete = true;
            break;

          case "refferring_provider_add":
            this.lookupList.UserRights.refferring_provider_add = true;
            break;
          case "refferring_provider_edit":
            this.lookupList.UserRights.refferring_provider_edit = true;
            break;
          case "refferring_provider_delete":
            this.lookupList.UserRights.refferring_provider_delete = true;
            break;

          case "location_add":
            this.lookupList.UserRights.location_add = true;
            break;
          case "location_edit":
            this.lookupList.UserRights.location_edit = true;
            break;
          case "location_delete":
            this.lookupList.UserRights.location_delete = true;
            break;

          case "guarantor_add":
            this.lookupList.UserRights.guarantor_add = true;
            break;
          case "guarantor_edit":
            this.lookupList.UserRights.guarantor_edit = true;
            break;
          case "guarantor_delete":
            this.lookupList.UserRights.guarantor_delete = true;
            break;

          case "superbill_add":
            this.lookupList.UserRights.superbill_add = true;
            break;
          case "superbill_edit":
            this.lookupList.UserRights.superbill_edit = true;
            break;
          case "superbill_delete":
            this.lookupList.UserRights.superbill_delete = true;
            break;

          case "facility_add":
            this.lookupList.UserRights.facility_add = true;
            break;
          case "facility_edit":
            this.lookupList.UserRights.facility_edit = true;
            break;
          case "facility_delete":
            this.lookupList.UserRights.facility_delete = true;
            break;

          case "patient_insurance_restore":
            this.lookupList.UserRights.active_pat_ins = true;
            break;
          case "patient_insurance_edit":
            this.lookupList.UserRights.patient_ins_edit = true;
            break;

          case "denial_resolve":
            debugger;
            this.lookupList.UserRights.denial_resolve = true;
            break;

          case "pat_statement_view":
            this.lookupList.UserRights.patient_statement_view = true;
            break;
          case "pat_statement_generate":
            this.lookupList.UserRights.patient_statement_generate = true;
            break;
          case "pat_statement_download":
            this.lookupList.UserRights.patient_statement_download = true;
            break;
          case "cds_edit":
            this.lookupList.UserRights.cds_edit = true;
            break;
          case "view_ticket":
            this.lookupList.UserRights.view_ticket = true;
            break;
          case "add_ticket":
            this.lookupList.UserRights.add_ticket = true;
            break;
          case "payroll_setting":
            this.lookupList.UserRights.payroll_setting = true;
            break;
          case "mark_as_created":
            this.lookupList.UserRights.mark_as_created = true;
            break;
          case "view_rpt_bankdeposit":
            this.lookupList.UserRights.ViewrptBankDeposit = true;
            break;
          case "view_rpt_billingaging":
            this.lookupList.UserRights.ViewrptBillingAging = true;
            break;
          case "view_rpt_claimbatch":
            this.lookupList.UserRights.ViewrptClaimBatch = true;
            break;
          case "view_rpt_cptwisepayment":
            this.lookupList.UserRights.ViewrptCPTWisePayment = true;
            break;
          case "view_rpt_dailydeposit":
            this.lookupList.UserRights.ViewrptDailyDeposit = true;
            break;
          case "view_rpt_denial":
            this.lookupList.UserRights.ViewrptDenial = true;
            break;
          case "view_rpt_elgibilityverification":
            this.lookupList.UserRights.ViewrptEligibilityVerification = true;
            break;
          case "view_rpt_paymentsummary":
            this.lookupList.UserRights.ViewrptPaymentSummary = true;
            break;
          case "view_rpt_sourcewisecollection":
            this.lookupList.UserRights.rptSourceWiseCollection = true;
            break;

          case "view_correspondence":
            this.lookupList.UserRights.view_correspondence = true;
            break;
          case "view_personal_injury":
            this.lookupList.UserRights.view_personal_injury = true;
            break;
          case "view_consults":
            this.lookupList.UserRights.view_consults = true;
            break;
          case "immunization_registry":
            this.lookupList.UserRights.immunization_registry = true;
            break;
          case "add_edit_immunization_inventory":
            this.lookupList.UserRights.add_edit_immunization_inventory = true;
            break;
          case "Template_setup":
            this.lookupList.UserRights.Template_setup = true;
            break;
          case "referral_delete":
            this.lookupList.UserRights.delete_referral = true;
            break;

          case "officetest_view":
            this.lookupList.UserRights.ViewOfficeTest = true;
            break;

          case "officetest_edit":
            this.lookupList.UserRights.AddModifyOfficeTest = true;
            break;
          
          case "extender_notes_view":
            this.lookupList.UserRights.extender_notes_view = true;
          break;
          case "extender_notes_edit":
            this.lookupList.UserRights.extender_notes_edit = true;
          break;
          case "extender_view":
            this.lookupList.UserRights.extender_template_view = true;
          break;
          case "extender_add":
            this.lookupList.UserRights.extender_template_edit = true;
          break;
          case "drug_abuse_view":
            this.lookupList.UserRights.ViewDrugAbuse = true;
            break;
          case "drug_abuse_edit":
            this.lookupList.UserRights.AddModifyDrugAbuse = true;
            break;
          
        }
      }
    }
    catch (e) {
    }
  }
  getUserAllRoles() {
    debugger;
    this.generalService.getUserAllRoles(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.roleList = data as Array<any>;
        this.isDataLoadCompleted();
      },
      error => {
        this.logMessage.log("getUserRole: " + error);
      }
    );
  }

  getUnReadMessagesCount() {


    this.generalService.getUnReadMessagesCount(this.lookupList.logedInUser.userId)
      .subscribe(
        data => {
          debugger;
          this.lookupList.unReadmessageCount = Number(data);
          this.isDataLoadCompleted();
        },
        error => {

          this.logMessage.log("getUnReadMessages." + error);
        }
      );
  }
  getChartAllPrintModule() {
    debugger;
    this.generalService.getAllChartPrintModule("1")
      .subscribe(
        data => {
          debugger;
          this.lookupList.lstChartAllModulePrint = data as Array<any>;
          this.isDataLoadCompleted();
        },
        error => {

          this.logMessage.log("getChartAllPrintModule." + error);
        }
      );
  }
  
}
