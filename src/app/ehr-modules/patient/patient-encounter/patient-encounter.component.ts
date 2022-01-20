import { DischargeSummary } from './../../../models/encounter/DischargeSummary';
import { ConfirmationPopupComponent } from './../../../general-modules/confirmation-popup/confirmation-popup.component';
import { EncounterSnapshotComponent } from './../../encounter/encounter-snapshot/encounter-snapshot.component';
import { LookupList, LOOKUP_LIST } from './../../../providers/lookupList.module';
import { ORMPatientChart } from './../../../models/encounter/ORMPatientChart';
import { GeneralOperation } from './../../../shared/generalOperation';
import { LogMessage } from './../../../shared/log-message';
import { Component, OnInit, Input, Inject, Output, EventEmitter, ViewChildren, QueryList, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { EncounterToOpen } from '../../../models/encounter/EncounterToOpen';
import { Chartreport_Print } from './../../../models/encounter/Chartreport_Print';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { PromptResponseEnum, CallingFromEnum, OperationType, ServiceResponseStatusEnum, AlertTypeEnum, FaxAttachemntsTypeEnum } from '../../../shared/enum-util';
import { OpenedPatientInfo } from '../../../models/common/patientInfo';
import { TemplateMainComponent } from '../../encounter/chart-template/template-main/template-main.component';
import { AmendmentsComponent } from '../../encounter/amendments/amendments.component';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { GenerateSyndromicSurveillanceMessageComponent } from '../../phs/generate-syndromic-surveillance-message/generate-syndromic-surveillance-message.component';
import { NgbdSortableHeader, SortEvent, FilterOptions, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { EncounterFaxObservable } from 'src/app/services/observable/encounter-fax-observable';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { PatientService } from 'src/app/services/patient/patient.service';
import { ORMCCDRequest } from 'src/app/models/encounter/ORMCCDRequest';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
import { AppConfig, APP_CONFIG } from 'src/app/providers/app-config.module';
import { ChartClosingSummaryComponent } from 'src/app/ehr-modules/encounter/chart-closing-summary/chart-closing-summary.component';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { GeneralService } from 'src/app/services/general/general.service';
import { PatientTaskDataComponent } from '../patient-task-data/patient-task-data.component';
import { FollowUpTaskComponent } from '../../encounter/follow-up-task/follow-up-task.component';
import { EncounterHTMLModel } from 'src/app/models/encounter/encounter-html-model';
import { SendFaxAttachmentsFromClient } from 'src/app/models/fax/send-fax-attachments-from-client';
import { Subscription } from 'rxjs';
import { NewFaxComponent } from '../../fax/new-fax/new-fax.component';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ProviderAuthenticationPopupComponent } from 'src/app/general-modules/provider-authentication-popup/provider-authentication-popup.component';
import { FaxParam } from '../../fax/new-fax/fax-parm';
import { AddTaskComponent } from '../../tasks/add-task/add-task.component';
import { patientTemplateData } from 'src/app/models/encounter/patientTemplateData';
import { EncounterPrintViewerComponent } from 'src/app/general-modules/encounter-print-viewer/encounter-print-viewer.component';

@Component({
  selector: 'patient-encounter',
  templateUrl: './patient-encounter.component.html',
  styleUrls: ['./patient-encounter.component.css'],
})
export class PatientEncounterComponent implements OnInit {
  @Input() patientId: number;
  @Input() openPatientInfo: OpenedPatientInfo;
  @Input() patientToOpen: PatientToOpen;
  @Output() showGrowthChart = new EventEmitter<any>()


  openedClaimInfo: OpenedClaimInfo;
  objormpatientchart: ORMPatientChart;
  objEncounterToOpen: EncounterToOpen;
  objpatientTemplateData: patientTemplateData;
  printSettingSelectedModuleId = 1;
  printSettingSelectedModuleRow: number = 0;
  chartId = '';
  lstEncounter;
  lstEncounterFromDB;
  @ViewChild("frm", { read: ViewContainerRef }) frm: ViewContainerRef;
  lstAppDates;
  lstPatientFollowUp;
  isOpenClick: Boolean = false;
  isLoading: boolean = false;

  openEncounterFromOtherModule: Boolean = true;

  //isGrowthChartClick: Boolean = false;
  private objchartReport: Chartreport_Print
  acPrintSetting;
  acPrintSettingAll;
  selectedSignedDate = '';
  selectedSignedProvider = '';
  selectedCoSignedProvider = '';
  openExternalModule = ''
  isSessionOpen = '';
  frmNoKnown: FormGroup;

  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };



  constructor(private encounterService: EncounterService,
    private generalService: GeneralService,
    private generalOperation: GeneralOperation
    , private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    // @Inject(Chartreport_Print) private objchartReport: Chartreport_Print,
    private objdischarge: DischargeSummary,
    private ngbModal: NgbModal,
    private sortFilterPaginationService: SortFilterPaginationService,
    private encounterFaxObservable: EncounterFaxObservable,
    private hostElement: ElementRef, private formBuilder: FormBuilder,
    private domSanitizer: DomSanitizer, private patientService: PatientService,
    @Inject(APP_CONFIG) private config: AppConfig) {

  }

  ngOnInit() {
    debugger;
    this.acPrintSetting = this.lookupList.lstUserChartModuleSetting.slice();
    this.acPrintSettingAll = this.lookupList.lstChartAllModulePrint.slice();
    this.getChartSummary();
    this.getAppointmentDates();
  }

  getAllChartPrintModule
  buildNoKnownForm() {
    this.frmNoKnown = this.formBuilder.group({
      chknoAllergy: this.formBuilder.control(false, null),
      chknoMedication: this.formBuilder.control(false, null),
      chknoProblem: this.formBuilder.control(false, null),
      chkEducation: this.formBuilder.control(false, null),
      chkMedicationReviewed: this.formBuilder.control(false, null),
    })
  }
  openChart(enc) {
    debugger;
    this.objEncounterToOpen = new EncounterToOpen;
    this.objEncounterToOpen.chart_id = enc.chart_id;
    this.objEncounterToOpen.appointment_id = enc.appointment_id;
    this.objEncounterToOpen.patient_id = enc.patient_id;
    this.objEncounterToOpen.provider_id = enc.provider_id;
    this.objEncounterToOpen.location_id = enc.location_id;
    this.objEncounterToOpen.visit_date = enc.visit_date;
    this.objEncounterToOpen.provider_name = enc.provider_name;
    this.objEncounterToOpen.location_name = enc.location_name;

    this.objEncounterToOpen.signed = enc.signed;//=== '1' ? true : false;
    this.objEncounterToOpen.co_signed = enc.co_signed;// === '1' ? true : false;
    this.objEncounterToOpen.openPatientInfo = new OpenedPatientInfo();
    this.objEncounterToOpen.openPatientInfo = this.openPatientInfo;

    this.objEncounterToOpen.patient_name = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
    this.objEncounterToOpen.openPatientInfo.patient_age = this.openPatientInfo.patient_age;
    this.objEncounterToOpen.openPatientInfo.patient_dob_101 = this.openPatientInfo.patient_dob_101;
    this.objEncounterToOpen.openPatientInfo.patient_gender = this.openPatientInfo.patient_gender;

    this.objEncounterToOpen.external_education = enc.external_education;
    this.objEncounterToOpen.medication_reviewed = enc.med_reviewed;
    this.isOpenClick = true;
    this.selectedSignedProvider = enc.signed_provider;
    this.selectedSignedDate = enc.signed_date;
    this.selectedCoSignedProvider = enc.co_signed_provider;
    this.objEncounterToOpen.primary_diag = enc.primary_diag.split("  ")[0];
    this.objEncounterToOpen.controlUniqueId = enc.patient_id + "_enc_" + enc.chart_id;

    this.getNoKnownData();
    this.getChartVital();
    this.generalService.auditLog(
      this.generalOperation.moduleAccessLog("Access", 'Encounter', enc.patient_id, enc.chart_id))
      .subscribe(
        data => {
        });
  }
  lstnoKnownData = new Array<any>();
  getNoKnownData() {
    this.buildNoKnownForm();

    this.encounterService.spGetNoKnown(this.patientId, this.chartId).subscribe(
      data => {
        debugger;
        this.lstnoKnownData = data as Array<any>;
        if (this.lstnoKnownData != null && this.lstnoKnownData.length > 0) {
          if (this.lstnoKnownData[0].col2 > 0) {
            (this.frmNoKnown.get("chknoAllergy") as FormControl).setValue(false);
            this.frmNoKnown.get("chknoAllergy").disable();
          }
          else
            (this.frmNoKnown.get("chknoAllergy") as FormControl).setValue(true);

          if (this.lstnoKnownData[1].col2 > 0) {
            (this.frmNoKnown.get("chknoMedication") as FormControl).setValue(false);
            this.frmNoKnown.get("chknoMedication").disable();
          }
          else
            (this.frmNoKnown.get("chknoMedication") as FormControl).setValue(true);
        }

        if (this.lstnoKnownData[2].col2 > 0) {
          (this.frmNoKnown.get("chknoProblem") as FormControl).setValue(false);
          this.frmNoKnown.get("chknoProblem").disable();
        }
        else
          (this.frmNoKnown.get("chknoProblem") as FormControl).setValue(true);

        //Update on main Chart Table
        let searchcrit: SearchCriteria = new SearchCriteria();
        searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
        searchcrit.param_list = [
          { name: "chart_id", value: this.chartId, option: "" },
          { name: "no_allergy", value: (this.frmNoKnown.get('chknoAllergy') as FormControl).value, option: "" },
          { name: "no_med", value: (this.frmNoKnown.get('chknoMedication') as FormControl).value, option: "" },
          { name: "no_problem", value: (this.frmNoKnown.get('chknoProblem') as FormControl).value, option: "" }
        ];
        this.encounterService.updateNoKnownData(searchcrit).subscribe(
          data => {
          },
          error => {
            this.logMessage.log("getNoKnownData " + error);
          }
        );
      },
      error => {
        this.logMessage.log("getNoKnownData " + error);
      }
    );
    if (this.objEncounterToOpen.external_education == true)
      (this.frmNoKnown.get("chkEducation") as FormControl).setValue(true);
    else
      (this.frmNoKnown.get("chkEducation") as FormControl).setValue(false);
    if (this.objEncounterToOpen.medication_reviewed == true)
      (this.frmNoKnown.get("chkMedicationReviewed") as FormControl).setValue(true);
    else
      (this.frmNoKnown.get("chkMedicationReviewed") as FormControl).setValue(false);


  }
  navigateBackToSSummary() {
    this.isOpenClick = false;
    this.isLoading = false;
    this.getChartSummary();
  }
  getChartSummary() {
    this.isLoading = true;
    this.lstSelectedEncounters = new Array<any>();
    this.encounterService.getChartSummary(this.patientId).subscribe(
      data => {
        debugger;
        //this.lstEncounter = data;
        this.lstEncounterFromDB = data;
        this.search();
        if (this.lstEncounter.length > 0) {
          this.chartId = this.lstEncounter[0].chart_id;
        }
        this.isLoading = false;
        if (this.openEncounterFromOtherModule) {
          let encToOpen: any;
          if (this.patientToOpen != undefined && (this.patientToOpen.callingFrom == CallingFromEnum.SCHEDULER || this.patientToOpen.callingFrom == CallingFromEnum.TASK || this.patientToOpen.callingFrom == CallingFromEnum.REPORTS) && this.patientToOpen.child_module_id != undefined) {

            for (let i: number = 0; i < this.lstEncounter.length; i++) {
              if (Number(this.lstEncounter[i].chart_id) == Number(this.patientToOpen.child_module_id)) {
                encToOpen = this.lstEncounter[i];
                break;
              }
            }
          }

          if (encToOpen != undefined) {
            this.openChart(encToOpen);
          }

          this.openEncounterFromOtherModule = false;

        }
      },
      error => {
        this.isLoading = false;
        this.logMessage.log("getChartSummary " + error);
      }
    );
  }
  getAppointmentDates() {
    this.encounterService.getAppointmentDates(this.patientId).subscribe(
      data => {
        this.lstAppDates = data;
      },
      error => {
        this.logMessage.log("getAppointmentDates " + error);
      }
    );
  }


  printEncounterFromGrid(patient) {
    debugger;
    //let objReport:Chartreport_Print=new Chartreport_Print(patient.chart_id,patient.patient_id);
    this.objchartReport = new Chartreport_Print(this.encounterService, this.generalOperation, this.logMessage,
      this.dateTimeUtil, this.lookupList, this.ngbModal, this.encounterFaxObservable);
    this.objchartReport.chartId = patient.chart_id;
    this.objchartReport.patientId = patient.patient_id;
    this.objchartReport.acPrintSetting = this.acPrintSetting;
    this.objchartReport.callingFrom = 'chart';
    // objReport.chartId=this.chartId;
    // objReport.patientId=this.patientId;
    this.objchartReport.getReportData();
    // var myWindow = window.open('', '', 'width=810,height=600,resizable=1');
    // myWindow.document.write("<html><body><p>New Window'"+patient.patient_id+ "'}</p></body></html>");
    // myWindow.focus();
  }

  isNewInProgress: boolean = false;
  newchart(drp) {
    debugger;

    if (this.dateTimeUtil.checkIfFutureDate(this.lstAppDates[drp.selectedIndex - 1].appointment_date_time, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a)) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Encounter Validation', "Sorry, you can't create future date Encounter", 'warning');
      return;
    }

    this.isNewInProgress = true;

    if (drp.selectedIndex > 0) {
      this.objormpatientchart = new ORMPatientChart;
      this.objormpatientchart.patient_id = this.patientId.toString();
      this.objormpatientchart.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      this.objormpatientchart.location_id = this.lstAppDates[drp.selectedIndex - 1].location_id;
      this.objormpatientchart.provider_id = this.lstAppDates[drp.selectedIndex - 1].provider_id;
      this.objormpatientchart.visit_date = this.lstAppDates[drp.selectedIndex - 1].appointment_date_time;
      this.objormpatientchart.appointment_id = this.lstAppDates[drp.selectedIndex - 1].appointment_id;
      this.objormpatientchart.modified_user = this.lookupList.logedInUser.user_name;
      this.objormpatientchart.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.objormpatientchart.no_allergy = false;
      this.objormpatientchart.no_problem = false;
      this.objormpatientchart.no_med = false;
      this.objormpatientchart.external_education = false;
      this.objormpatientchart.med_reviewed = false;
      this.objormpatientchart.created_user = this.lookupList.logedInUser.user_name;
      this.objormpatientchart.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      this.encounterService.createNewChart(this.objormpatientchart).subscribe(

        data => {


          debugger;
          this.isNewInProgress = false;
          if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {



            this.objormpatientchart.chart_id = data['result'];
            this.openChart(this.objormpatientchart);
          }
          else if (data['status'] === ServiceResponseStatusEnum.ERROR) {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'Create Encounter', data['response'], AlertTypeEnum.DANGER)
          }

        },
        error => {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'Create Encounter', error.message, AlertTypeEnum.DANGER)
          //this.logMessage.log("newchart " + error);
          this.isNewInProgress = false;
        }
      );
    }
    else {
      debugger;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Encounter Validation', 'Please select the appointment date from the list.', 'warning');
      this.isNewInProgress = false;
    }
  }
  IsPrintSettingSelectAll(value) {
    for (var i = 0; i < this.acPrintSettingAll.length; i++) {
      this.acPrintSettingAll[i].in_print = value;
    }
  }
  IsPrintSettingSelect(value, seting) {
    debugger;
    this.acPrintSettingAll[this.generalOperation.getElementIndex(this.acPrintSettingAll, seting)].in_print = value;
  }
  testSelected() {
    debugger;
    // var i = 0;
    // var j = 0;
    // for (var a = 0; a < this.acPrintSettingAll.length; a++) {
    //   if (this.acPrintSettingAll[a].in_print == true)
    //     i = i + 1;
    //   else
    //     j = j + 1;

    // }

    this.objchartReport = new Chartreport_Print(this.encounterService, this.generalOperation, this.logMessage, this.dateTimeUtil, this.lookupList, this.ngbModal, this.encounterFaxObservable);
    this.objchartReport.chartId = this.objEncounterToOpen.chart_id;
    this.objchartReport.patientId = this.objEncounterToOpen.patient_id;
    this.objchartReport.acPrintSetting = this.acPrintSettingAll;
    this.objchartReport.isFromPrintSetting = true;
    this.objchartReport.callingFrom = 'chart';
    this.objchartReport.getReportData();

    //alert('True: ' + i + 'And False: ' + j)
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,

  };
  popUpOptionslarge: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',

  };

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

  openSnapShot(data) {
    data.appointment_id = "";
    const modalRef = this.ngbModal.open(EncounterSnapshotComponent, this.poupUpOptions);
    modalRef.componentInstance.getPatientVisitSnapShot(data);

  }
  openAmendments(data) {
    debugger;
    const modalRef = this.ngbModal.open(AmendmentsComponent, this.popUpOptionslarge);
    modalRef.componentInstance.chart_id = data.chart_id;
  }
  onTemplateClick() {
    debugger;
    // this.objpatientTemplateData=new patientTemplateData();
    // this.objpatientTemplateData.patient_name=this.objEncounterToOpen.patient_name;
    // this.objpatientTemplateData.patient_age=this.openPatientInfo.patient_age;
    // this.objpatientTemplateData.patient_dob_101=this.openPatientInfo.patient_dob_101;
    // this.objpatientTemplateData.patient_gender=this.openPatientInfo.patient_gender;

    // this.objpatientTemplateData.provider_name=this.objEncounterToOpen.provider_name;
    // this.objpatientTemplateData.location_name=this.objEncounterToOpen.location_name;
    // this.objpatientTemplateData.visit_date=this.objEncounterToOpen.visit_date;

    // {
    //   if (this.chartVital.height_feet != undefined && this.chartVital.height_feet != "") {
    //     this.objpatientTemplateData.height = this.chartVital.height_feet.toString().split(".")[0];
    //     //this.height_inc = this.chartVital.height_feet.toString().split(".")[1];
    //   }
    //   else{
    //     this.objpatientTemplateData.height="";
    //   }

    //   if (this.chartVital.weight_lbs != undefined && this.chartVital.weight_lbs != "") {
    //     this.objpatientTemplateData.weight= this.chartVital.weight_lbs.toString().split(".")[0];//lbs
    //     //this.weight_ozs = this.chartVital.weight_lbs.toString().split(".")[1];
    //   }
    //   else{
    //     this.objpatientTemplateData.weight="";
    //   }
    //   this.objpatientTemplateData.bmi = this.chartVital.bmi;
    //   this.objpatientTemplateData.blood_pressure= this.chartVital.systolic_bp1+'/'+this.chartVital.diastolic_bp1;
    //   this.objpatientTemplateData.oxygen_saturation= this.chartVital.oxygen_saturation;
    //   this.objpatientTemplateData.pulse= this.chartVital.pulse;
    //   this.objpatientTemplateData.pulse= this.chartVital.pulse;
    //   this.objpatientTemplateData.smoking_status="";
    // }


    const modalRef = this.ngbModal.open(TemplateMainComponent, { size: 'lg', windowClass: 'modal-adaptive', backdrop: 'static' });
    modalRef.componentInstance.objencounterToOpen = this.objEncounterToOpen;
    //modalRef.componentInstance.objpatientTemplateData = this.objpatientTemplateData;
    modalRef.componentInstance.callingFrom = 'All';
    // this.isOpenClick = false;
    modalRef.result.then((result) => {
      debugger;
      if (result === "OK") {
        debugger;
        this.isOpenClick = false;
        //Refresh the encounter screen
        (async () => {
          // Do something before delay
          console.log('before delay')
          await this.delay(100);
          // Do something after
          console.log('after delay')
          this.isOpenClick = true;
        })();
        //this.delay(3000)


      }
    }
      , (reason) => {
      });
  }
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  DeleteEncounter(enc) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Confirm Deletion !"
    modalRef.componentInstance.promptMessage = "Are you sure you want to delete selected chart ?";
    modalRef.componentInstance.alertType = "danger";
    let closeResult;

    modalRef.result.then((result) => {


      //alert(result);
      if (result === PromptResponseEnum.YES) {
        debugger;
        let searchcrit: SearchCriteria = new SearchCriteria();
        searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
        searchcrit.param_list = [
          { name: "chart_id", value: enc.chart_id, option: "" },
          { name: "patient_id", value: enc.patient_id, option: "" },
          { name: "loginUser", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "Datetime", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" }
        ];
        this.encounterService.DeleteChart(searchcrit).subscribe(
          data => {
            this.onDeleteSuccessfully(data, enc);
          },
          error => {
            this.logMessage.log(error);
          }
        );
      }
    }
      , (reason) => {

        //alert(reason);
      });
  }
  onDeleteSuccessfully(result, element) {
    if (result > 0) {
      var index = this.generalOperation.getElementIndex(this.lstEncounterFromDB, element);
      if (index > -1) {
        this.lstEncounterFromDB.splice(index, 1);
      }
      this.search();
    }
  }
  PrintDischargeSummary() {
    if (this.chartId == undefined || this.chartId == null || this.chartId == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Discharge Summary', 'Please Select Encounter First.', 'warning');
      return;
    }
    this.objdischarge.chartId = this.chartId;
    this.objdischarge.patientId = this.patientId;
    //this.objdischarge.visitDate = enc.visit_date;
    this.objdischarge.getData();
  }
  printEncounter() {
    this.objchartReport = new Chartreport_Print(this.encounterService, this.generalOperation, this.logMessage, this.dateTimeUtil, this.lookupList, this.ngbModal, this.encounterFaxObservable);
    this.objchartReport.chartId = this.objEncounterToOpen.chart_id;
    this.objchartReport.patientId = this.objEncounterToOpen.patient_id;
    this.objchartReport.acPrintSetting = this.acPrintSetting;
    this.objchartReport.callingFrom = 'chart';
    this.objchartReport.getReportData();
  }

  onChartSign() {
    debugger;
    let sign_type = '';
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    if (this.lookupList.logedInUser.loginProviderId != 0 && this.lookupList.logedInUser.loginProviderId != null) {
      if (this.objEncounterToOpen.signed == false || this.objEncounterToOpen.signed == null) {
        modalRef.componentInstance.promptHeading = 'Confirm Sign !';
        modalRef.componentInstance.promptMessage = 'Are you sure you want to Sign the selected Encounter ?';
        modalRef.componentInstance.alertType = 'info';
        sign_type = 'sign';
      }
      else {
        modalRef.componentInstance.promptHeading = 'Confirm Co-Sign !';
        modalRef.componentInstance.promptMessage = 'Encounter is already Signed, Do you want to Co-Sign the selected Encounter ?';
        modalRef.componentInstance.alertType = 'info';
        sign_type = 'co-sign';
      }

      let closeResult;

      modalRef.result.then((result) => {

        if (result == PromptResponseEnum.YES) {
          this.signEncounterWithoutAuth(sign_type);
        }
      }, (reason) => {

      });
    } else {
      if (this.objEncounterToOpen.signed == true) {
        modalRef.componentInstance.promptHeading = 'Confirm Co-Sign !';
        modalRef.componentInstance.promptMessage = 'Encounter is already Signed, Do you want to Co-Sign the selected Encounter ?';
        modalRef.componentInstance.alertType = 'info';
        sign_type = 'co-sign';
        let closeResult;

        modalRef.result.then((result) => {

          if (result == PromptResponseEnum.YES) {
            this.coSignEncounterWithAuth(sign_type);
          }
        }, (reason) => {

        });
      } else {
        modalRef.componentInstance.promptHeading = 'Confirm Sign !';
        modalRef.componentInstance.promptMessage = 'Are you sure you want to Sign the selected Encounter ?';
        modalRef.componentInstance.alertType = 'info';
        sign_type = 'sign';
        let closeResult;

        modalRef.result.then((result) => {

          if (result == PromptResponseEnum.YES) {
            this.coSignEncounterWithAuth(sign_type);
          }
        }, (reason) => {

        });
      }
    }
  }
  coSignEncounterWithAuth(sign_type) {
    const modalRef = this.ngbModal.open(ProviderAuthenticationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.headerTitle = "Confirm Encounter(s) Sign";
    modalRef.componentInstance.provider_id = this.objEncounterToOpen.provider_id;
    modalRef.result.then((result) => {
      debugger;
      if (result) {
        debugger;
        this.signWithAuth(sign_type, result);
      }
    }, (reason) => {
      //alert(reason);
    });

  }
  signWithAuth(sign_type, result) {
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "sign_type", value: sign_type, option: "" },
      { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "system_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
      { name: "chart_id", value: this.objEncounterToOpen.chart_id, option: "" },
      { name: "patient_id", value: this.objEncounterToOpen.patient_id, option: "" },
      { name: "signed_provider_id", value: result.user_id, option: "" },//prov id
      { name: "signed_provider_name", value: result.user_name, option: "" }//prov name
      // { name: "signed_provider_id", value: this.lookupList.logedInUser.loginProviderId, option: "" },
      // { name: "signed_provider_name", value: this.lookupList.logedInUser.loginProviderName, option: "" }
    ];
    this.encounterService.signEncounter(searchCriteria).subscribe
      (
        data => {
          // this.selectedSignedProvider = this.objEncounterToOpen.provider_name;
          // this.selectedSignedDate = this.dateTimeUtil.getDateTimeFromString(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_MM_DD_YYYY).toString();
          // this.objEncounterToOpen.signed = true;
          // this.isOpenClick = false;
          this.navigateBackToSSummary();
        },
        error => {
          this.logMessage.log("signEncounter " + error);
        }
      );
  }
  signEncounterWithoutAuth(sign_type) {
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "sign_type", value: sign_type, option: "" },
      { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "system_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
      { name: "chart_id", value: this.objEncounterToOpen.chart_id, option: "" },
      { name: "patient_id", value: this.objEncounterToOpen.patient_id, option: "" },
      { name: "signed_provider_id", value: this.lookupList.logedInUser.loginProviderId, option: "" },
      { name: "signed_provider_name", value: this.lookupList.logedInUser.loginProviderName, option: "" }
    ];
    this.encounterService.signEncounter(searchCriteria).subscribe
      (
        data => {
          this.navigateBackToSSummary();
          // this.selectedSignedProvider = this.objEncounterToOpen.provider_name;
          // this.selectedSignedDate = this.dateTimeUtil.getDateTimeFromString(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_MM_DD_YYYY).toString();
          // this.objEncounterToOpen.signed = true;
          // this.isOpenClick = false;
        },
        error => {
          this.logMessage.log("signEncounter " + error);
        }
      );
  }

  // onUnsignChart(obj) {
  //   const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
  //   modalRef.componentInstance.promptHeading = 'Confirm Sign !';
  //   modalRef.componentInstance.promptMessage = 'Are you sure you want to Un-Sign the selected Encounter ?';
  //   modalRef.componentInstance.alertType = 'info';

  //   let closeResult;

  //   modalRef.result.then((result) => {

  //     if (result == PromptResponseEnum.YES) {
  //       let searchCriteria: SearchCriteria = new SearchCriteria();
  //       searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
  //       searchCriteria.param_list = [
  //         { name: "sign_type", value: 'unsign', option: "" },
  //         { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
  //         { name: "system_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
  //         { name: "chart_id", value: obj.chart_id, option: "" },
  //         { name: "patient_id", value: obj.patient_id, option: "" }
  //         //{ name: "signed_provider_id", value: this.lookupList.logedInUser.loginProviderId ,option: "" },
  //         //{ name: "signed_provider_name", value: this.lookupList.logedInUser.loginProviderName ,option: "" }
  //       ];
  //       this.encounterService.signEncounter(searchCriteria).subscribe
  //         (
  //           data => {
  //             this.selectedSignedProvider = '';
  //             this.selectedSignedDate = '';
  //             this.objEncounterToOpen.signed = true;
  //             this.isOpenClick = false;
  //           },
  //           error => {
  //             this.logMessage.log("signEncounter " + error);
  //           }
  //         );
  //     }
  //   }, (reason) => {

  //   });
  // }
  openGrowthChart() {
    debugger;
    this.generalService.auditLog(
      this.generalOperation.moduleAccessLog("Access", 'Patient Growth Chart', this.patientId, ""))
      .subscribe(
        data => {
        });
    //this.openExternalModule = 'GC';
    this.openExternalModule = '';
    this.showGrowthChart.emit('');
    //this.isGrowthChartClick=true;
  }
  openClaim() {

    debugger;

    let dos: string = this.dateTimeUtil.convertDateTimeFormat(this.objEncounterToOpen.visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

    this.openedClaimInfo = new OpenedClaimInfo(undefined, Number(this.objEncounterToOpen.patient_id),
      this.objEncounterToOpen.provider_id, this.objEncounterToOpen.location_id, dos,
      OperationType.ADD, false,
      CallingFromEnum.ENCOUNTER, this.objEncounterToOpen.provider_name, undefined, undefined, undefined, undefined, undefined);
    this.openExternalModule = 'claim';
  }
  onClaimSaved(claimId: number) {
    this.backFromExternalModule()
  }
  backFromExternalModule() {
    //this.isGrowthChartClick = false;
    this.openExternalModule = '';
  }



  generatePHSSyndromicSurveillanceMessage() {

    const modalRef = this.ngbModal.open(GenerateSyndromicSurveillanceMessageComponent, this.popUpOptionslarge);

    modalRef.componentInstance.patientId = Number(this.objEncounterToOpen.patient_id);
    modalRef.componentInstance.chartId = Number(this.objEncounterToOpen.chart_id);

    /*
    modalRef.result.then((result) => {
      if (result) {
        
      }
    }, (reason) => {

    });
    */
  }



  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;

  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }

  private search() {

    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstEncounterFromDB, this.headers, this.sortEvent, null, null, '');
    debugger;
    this.lstEncounter = sortFilterPaginationResult.list;
  }


  lstSelectedEncounters = new Array<any>();
  onEncounterSelection(event: any, enc: any) {

    debugger;
    if (event.target.checked) {

      if (this.lstSelectedEncounters == undefined)
        this.lstSelectedEncounters = new Array<string>();

      this.lstSelectedEncounters.push(enc);

    }
    else if (!event.target.checked) {

      if (this.lstSelectedEncounters != undefined) {

        for (let i: number = this.lstSelectedEncounters.length - 1; i >= 0; i--) {

          if (this.lstSelectedEncounters[i].chart_id == enc.chart_id) {
            this.lstSelectedEncounters.splice(i, 1);
          }
        }
      }
    }
  }


  selectedVisitIndex = 0;
  //strVisitsHTMLComplete = "";
  //lstEncounterHTML: Array<EncounterHTMLModel>;

  lstFaxAttachments: Array<SendFaxAttachmentsFromClient>;
  private encounterFaxSubscription: Subscription;
  faxEncounter() {
    debugger;
    if (this.lstSelectedEncounters == undefined || this.lstSelectedEncounters.length == 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Send Fax', "Please select at least one encounter.", AlertTypeEnum.DANGER)
    }
    else {
      debugger;
      this.isLoading = true;
      this.lstFaxAttachments = new Array<any>();

      //this.encounterFaxObservable=new EncounterFaxObservable();
      this.encounterFaxSubscription = this.encounterFaxObservable.getHtml.subscribe(
        value => {
          debugger;

          let encounterHTMLModel: EncounterHTMLModel = value;
          let sendFaxAttachmentsFromClient: SendFaxAttachmentsFromClient = new SendFaxAttachmentsFromClient();
          sendFaxAttachmentsFromClient.read_only = true;
          sendFaxAttachmentsFromClient.html_string = encounterHTMLModel.htmlString;
          sendFaxAttachmentsFromClient.document_source = FaxAttachemntsTypeEnum.HTML_STRING;
          sendFaxAttachmentsFromClient.document_name = "Encounter " + encounterHTMLModel.visitDate;


          this.lstFaxAttachments.push(sendFaxAttachmentsFromClient);

          this.selectedVisitIndex++;
          this.getNextVisitHTML(this.selectedVisitIndex);
        });
      this.selectedVisitIndex = 0;
      this.getNextVisitHTML(this.selectedVisitIndex);
    }
  }
  getNextVisitHTML(index: number) {
    debugger;

    /*
    if (index > 0) {
      this.strVisitsHTMLComplete += "<div style='height:15px;width=100%'></div>";
    }
    */

    if (this.lstSelectedEncounters != null && this.lstSelectedEncounters.length > index) {
      this.objchartReport = new Chartreport_Print(this.encounterService, this.generalOperation, this.logMessage, this.dateTimeUtil, this.lookupList, this.ngbModal, this.encounterFaxObservable);
      this.objchartReport.strHtmlString = "";
      this.objchartReport.chartId = this.lstSelectedEncounters[index].chart_id;
      this.objchartReport.patientId = this.patientId;
      this.acPrintSetting = this.lookupList.lstUserChartModuleSetting.slice();
      this.objchartReport.acPrintSetting = this.lookupList.lstUserChartModuleSetting;
      this.objchartReport.callingFrom = "fax";
      //objChartReport.PdfCallBackToReferral = PdfCallBackToReferral;
      this.objchartReport.visitDateTime_yyyymmddhh_mm_a = this.dateTimeUtil.convertDateTimeFormat(this.lstSelectedEncounters[index].visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a, DateTimeFormat.DATEFORMAT_YYYY_MM_DD_hh_mm_a);
      this.objchartReport.file_name = this.dateTimeUtil.convertDateTimeFormat(this.lstSelectedEncounters[index].visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a, DateTimeFormat.DATEFORMAT_YYYY_MM_DD_hh_mm_a);
      this.objchartReport.getReportData();
    }
    else {
      debugger;
      this.isLoading = false;

      let faxParam: FaxParam = new FaxParam();
      faxParam.patientId = this.patientId;


      const modalRef = this.ngbModal.open(NewFaxComponent, this.lgPopUpOptions);
      modalRef.componentInstance.lstAttachments = this.lstFaxAttachments;
      modalRef.componentInstance.callingFrom = CallingFromEnum.ENCOUNTER;
      modalRef.componentInstance.operation = "new_fax";
      modalRef.componentInstance.faxParam = faxParam;
      //this.encounterFaxObservable.getHtml.unsubscribe();
      this.encounterFaxSubscription.unsubscribe();

    }

  }

  //showFax = false;
  //current_url: SafeUrl;
  //onFaxclick() {


  /*
  this.showFax = true;
  let c_id = "";
  for (let i = 0; i < this.lstSelectedChartIds.length; i++) {
   
    if (c_id == "")
      c_id = this.lstSelectedChartIds[i];
    else
      c_id += "," + this.lstSelectedChartIds[i];
  }
  let strLink = "";
  strLink = this.config.flexApplink;
  strLink += "user_id=" + this.lookupList.logedInUser.userId;
  strLink += "&user_name=" + this.lookupList.logedInUser.user_name;
  strLink += "&practice_id=" + this.lookupList.practiceInfo.practiceId;
  strLink += "&calling_from=FaxSend";
  strLink += "&chart_id=" + c_id;
  strLink += "&patient_id=" + this.patientId;
  debugger;
 
  this.updateSrc(strLink);
  */
  //}
  /*
  updateSrc(url) {
    this.current_url = this.domSanitizer.bypassSecurityTrustResourceUrl(url)
  }
  navigateBackFromFax() {
    this.showFax = false;
  }
  */
  onCCDExport() {
    debugger;
    let objccdReq: ORMCCDRequest = new ORMCCDRequest;
    objccdReq.patient_id = this.objEncounterToOpen.patient_id.toString();
    objccdReq.chart_id = this.objEncounterToOpen.chart_id.toString();
    objccdReq.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    objccdReq.provider_id = this.objEncounterToOpen.provider_id.toString();
    objccdReq.isReferal = false;
    objccdReq.ccd_Version = "0";
    objccdReq.ccd_type = "0";

    this.patientService.GenerateCCDA(objccdReq).subscribe(
      data => {
        debugger;
        // = data["result"].split("~")[0];
        const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
        modalRef.componentInstance.path_doc = data["result"].split("~")[0];
        modalRef.componentInstance.width = '800px';
      },
      error => {
        this.logMessage.log("newchart " + error);
      }
    );
  }

  closeEncounterSession(value) {
    debugger;
    if (value.encounter_closing_id == "0") {
      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = 'Session Close !';
      //modalRef.componentInstance.promptMessage = 'Are you sure you want to Close all Previous Encounters?';
      modalRef.componentInstance.promptMessage = ' Close all Previous Encounters?';
      modalRef.componentInstance.alertType = 'warning';
      let closeResult;

      modalRef.result.then((result) => {
        if (result == PromptResponseEnum.YES) {

          const modalRef = this.ngbModal.open(ChartClosingSummaryComponent, this.poupUpOptions);

          modalRef.componentInstance.patientID = value.patient_id;
          modalRef.componentInstance.chartID = value.chart_id;
          modalRef.componentInstance.session_id = value.encounter_closing_id;
        }
        if (result === ServiceResponseStatusEnum.SUCCESS) {

        }
      }, (reason) => {

        //alert(reason);
      });
    }
    else if (value.encounter_closing_id != "0") {
      debugger;
      const modalRef = this.ngbModal.open(ChartClosingSummaryComponent, this.poupUpOptions);
      modalRef.componentInstance.patientID = value.patient_id;
      modalRef.componentInstance.chartID = value.chart_id;
      modalRef.componentInstance.session_id = value.encounter_closing_id;
    }

  }

  EncounterSelectionChanged(enc) {
    this.chartId = enc.chart_id;
  }
  lstTaskData;
  onTaskClick() {
    debugger;
    let arr = this.generalOperation.filterArray(this.lstEncounter, "chart_id", this.chartId);
    if (arr.length > 0) {
      let searchcrit: SearchCriteria = new SearchCriteria();
      searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
      searchcrit.param_list = [
        { name: "patient_id", value: arr[0].patient_id, option: "" },
        { name: "visit_date", value: arr[0].visit_date, option: "" },
        { name: "appointment_id", value: arr[0].appointment_id, option: "" }
      ];
      this.patientService.getPatientTaskData(searchcrit).subscribe(
        data => {
          debugger;
          this.lstTaskData = data;
          if (this.lstTaskData.length == 0) {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Followup Notes', 'No Followup Task Found.', 'warning');
            return;
          }
          const modalRef = this.ngbModal.open(PatientTaskDataComponent, this.poupUpOptions);
          modalRef.componentInstance.lstData = this.lstTaskData;
        },
        error => {
          this.logMessage.log(error);
        }
      );
    }
  }
  onFollowUpClick() {
    const modalRef = this.ngbModal.open(FollowUpTaskComponent, this.poupUpOptions);
    modalRef.componentInstance.chart_id = this.objEncounterToOpen.chart_id;
    modalRef.componentInstance.patient_id = this.objEncounterToOpen.patient_id;
    modalRef.componentInstance.appointment_id = this.objEncounterToOpen.appointment_id;
  }
  chkEducation(value: boolean) {
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "chart_id", value: this.chartId, option: "" },
      { name: "education", value: (this.frmNoKnown.get('chkEducation') as FormControl).value, option: "" },
    ];
    this.encounterService.updateEncounterEducationProvided(searchcrit).subscribe(
      data => {
      },
      error => {
        this.logMessage.log("chkEducation " + error);
      }
    );
  }
  chkMedicationReviewed(value: boolean) {
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "chart_id", value: this.chartId, option: "" },
      { name: "med_reviewed", value: (this.frmNoKnown.get('chkMedicationReviewed') as FormControl).value, option: "" },
    ];
    this.encounterService.updateEncounterMedicationReviewed(searchcrit).subscribe(
      data => {
      },
      error => {
        this.logMessage.log("chkMedicationReviewed " + error);
      }
    );
  }
  onEncounterEducationClick() {
    //var strName:String = StringUtil.trim(dg_ChartSummary.selectedItem.primary_diag.toString().split("  ")[1].toString()).split(" ")[0];
    let URL1 = "http://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3aproject=medlineplus&v%3asources=medlineplus-bundle&query=" + this.objEncounterToOpen.primary_diag + "&"
    window.open(URL1, '_blank');
  }


  addToTask() {

    const modalRef = this.ngbModal.open(AddTaskComponent, this.poupUpOptions);

    modalRef.componentInstance.opertaionType = 'new';
    modalRef.componentInstance.callingFrom = CallingFromEnum.ENCOUNTER;

    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.chartId = this.objEncounterToOpen.chart_id;
    modalRef.componentInstance.patientName = this.patientToOpen.patient_name;
    modalRef.componentInstance.encounterDate = this.objEncounterToOpen.visit_date;

    modalRef.result.then((result) => {
      if (result != undefined) {
        //this.getTasks();
      }
    }
      , (reason) => {

        //alert(reason);
      });

  }
  onUnsignChart() {

    let arr = this.generalOperation.filterArray(this.lstEncounter, "chart_id", this.chartId);
    if (arr.length > 0) {
      if (arr[0].signed == false) {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Confirm UnSign Encounter', "Encounter is already Unsign.", 'warning');
        return;
      }
    }
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Confirm UnSign Encounter !"
    modalRef.componentInstance.promptMessage = "Are you sure you want to UnSign the selected Encounter ?";
    modalRef.componentInstance.alertType = "warning";

    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "sign_type", value: 'unsign', option: "" },
          { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "system_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
          { name: "chart_id", value: this.chartId, option: "" },
          { name: "patient_id", value: this.patientId, option: "" }
        ];
        this.encounterService.signEncounter(searchCriteria).subscribe
          (
            data => {
              this.isOpenClick = false;
              this.isLoading = false;
              this.getChartSummary();
            },
            error => {
              this.logMessage.log("signEncounter " + error);
            }
          );
      }
    }, (reason) => {

    });
  }
  chartVital;
  getChartVital() {
    this.encounterService.getChartVital(Number(this.chartId))
      .subscribe(
        data => {
          debugger;
          this.chartVital = data;
        },
        error => alert(error),
        () => this.logMessage.log("get vitals Successfull.")
      );
  }
  showFollowupDetail(pat) {
    debugger;
    let lst: Array<string> = [];
    if (this.lstPatientFollowUp != null && this.lstPatientFollowUp != undefined) {
      var isFound = false;
      for (var i = 0; i < this.lstPatientFollowUp.length; i++) {
        if (this.lstPatientFollowUp[i].chart_id == pat.chart_id) {
          isFound = true;
          if (this.lstPatientFollowUp[i].day != "" || this.lstPatientFollowUp[i].week != "" || this.lstPatientFollowUp[i].month != "") {
            var message = "";
            if (this.lstPatientFollowUp[i].month != "") {
              message = this.lstPatientFollowUp[i].month + " Month(s)";
            }
            if (this.lstPatientFollowUp[i].week != "") {
              if (message != "") {
                message += ", " + this.lstPatientFollowUp[i].week + " Week(s)";
              } else {
                message += this.lstPatientFollowUp[i].week + " Week(s)";
              }

            }
            if (this.lstPatientFollowUp[i].day != "") {
              if (message != "") {
                message += ", " + this.lstPatientFollowUp[i].day + " Days(s)";
              } else {
                message += this.lstPatientFollowUp[i].day + " Days(s)";
              }
            }
          }
          lst[0] = message;
          break;
        }

      }
      if (isFound == false) {
        lst[0] = message;
      }
    }
    else {
      lst[0] = message;
    }
    return lst;
  }
  onprintSettingClick(id) {
    this.printSettingSelectedModuleId = id;
    for (let i: number = 0; i < this.acPrintSettingAll.length; i++) {
      if (this.acPrintSettingAll[i].module_id == id) {
        this.printSettingSelectedModuleRow = i;
      }
    }
  }
  moveDiagnosis(option: string) {


    if (this.printSettingSelectedModuleRow != undefined && this.acPrintSettingAll != undefined && this.acPrintSettingAll.length > 0) {
      switch (option) {
        case "down":
          if ((this.printSettingSelectedModuleRow + 1) < this.acPrintSettingAll.length) {
            var source = this.acPrintSettingAll[this.printSettingSelectedModuleRow];
            var toBeSwaped = this.acPrintSettingAll[this.printSettingSelectedModuleRow + 1];

            source.diag_sequence = this.printSettingSelectedModuleRow + 2;
            source.add_edit_flag = true;
            toBeSwaped.diag_sequence = this.printSettingSelectedModuleRow + 1;
            toBeSwaped.add_edit_flag = true;

            this.acPrintSettingAll[this.printSettingSelectedModuleRow] = toBeSwaped;
            this.acPrintSettingAll[this.printSettingSelectedModuleRow + 1] = source

            this.printSettingSelectedModuleRow++;

            //this.arrangeDiagnosis();
          }

          break;
        case "up":
          if ((this.printSettingSelectedModuleRow) > 0) {

            var source = this.acPrintSettingAll[this.printSettingSelectedModuleRow];
            var toBeSwaped = this.acPrintSettingAll[this.printSettingSelectedModuleRow - 1];

            source.diag_sequence = this.printSettingSelectedModuleRow;
            source.add_edit_flag = true;
            toBeSwaped.diag_sequence = this.printSettingSelectedModuleRow + 1;
            toBeSwaped.add_edit_flag = true;

            this.acPrintSettingAll[this.printSettingSelectedModuleRow] = toBeSwaped;
            this.acPrintSettingAll[this.printSettingSelectedModuleRow - 1] = source

            this.printSettingSelectedModuleRow--;

            //this.arrangeDiagnosis();
          }
          break;

        default:
          break;
      }
    }

  }


  private encounterPrintSubscription: Subscription;
  strVisitsHTMLComplete = "";
  isProcessing: boolean = false;
  printMultipleCharts() {
    debugger;
    if (this.lstSelectedEncounters == undefined || this.lstSelectedEncounters.length == 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Print Encounter', "Please select at least one encounter.", AlertTypeEnum.DANGER)
    }
    else {
      debugger;
      this.isLoading = true;
      //this.lstFaxAttachments = new Array<any>();
      this.encounterPrintSubscription = this.encounterFaxObservable.getHtml.subscribe(
        value => {
          debugger;
          let encounterHTMLModel: EncounterHTMLModel = value;
          this.strVisitsHTMLComplete += encounterHTMLModel.htmlString, '<br>', '<br></br>';
          this.selectedVisitIndex++;
          this.getNextVisitPrintHTML(this.selectedVisitIndex);
        });
      this.selectedVisitIndex = 0;
      //this.isProcessing = true;
      this.getNextVisitPrintHTML(this.selectedVisitIndex);
    }
  }
  getNextVisitPrintHTML(index: number) {
    debugger;

    if (this.lstSelectedEncounters != null && this.lstSelectedEncounters.length > index) {
      if (index > 0) {
        /*this.strVisitsHTMLComplete += "<div style='height:15px;width=100%'></div>";*/
        this.strVisitsHTMLComplete += "<div class='pagebreak'> </div>";
      }
      debugger;
      this.objchartReport = new Chartreport_Print(this.encounterService, this.generalOperation, this.logMessage, this.dateTimeUtil, this.lookupList, this.ngbModal, this.encounterFaxObservable);
      this.objchartReport.strHtmlString = "";
      this.objchartReport.chartId = this.lstSelectedEncounters[index].chart_id;
      this.objchartReport.patientId = this.patientId;
      this.acPrintSetting = this.lookupList.lstUserChartModuleSetting.slice();
      this.objchartReport.acPrintSetting = this.lookupList.lstUserChartModuleSetting;
      this.objchartReport.callingFrom = "encounter_multiple_print";
      this.objchartReport.file_name = "multi_encounter_print";//dgreport.selectedItem.name;
      this.objchartReport.getReportData();
    }
    else {
      this.isLoading = false;
      this.encounterPrintSubscription.unsubscribe();
      //this.getData();
      const modalRef = this.ngbModal.open(EncounterPrintViewerComponent, this.xLgPopUpOptions);
      modalRef.componentInstance.print_html = this.strVisitsHTMLComplete;
      modalRef.componentInstance.print_style = this.objchartReport.style;
    }
  }

}