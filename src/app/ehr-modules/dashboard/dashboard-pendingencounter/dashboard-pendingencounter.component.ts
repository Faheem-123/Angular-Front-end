import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { OpenModuleService } from '../../../services/general/openModule.service';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { LogMessage } from '../../../shared/log-message';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { Chartreport_Print } from 'src/app/models/encounter/Chartreport_Print';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum } from 'src/app/shared/enum-util';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ProviderAuthenticationPopupComponent } from 'src/app/general-modules/provider-authentication-popup/provider-authentication-popup.component';

@Component({
  selector: 'dashboard-pendingencounter',
  templateUrl: './dashboard-pendingencounter.component.html',
  styleUrls: ['./dashboard-pendingencounter.component.css']
})
export class DashboardPendingencounterComponent implements OnInit {
  @Output() widgetUpdate = new EventEmitter<any>();
  listPendingEncounterResult;
  pendingchartscount;
  strChartId: String = "";
  signALL: String = "";
  filterForm: FormGroup;
  showHideSearch = true;
  isLoading: boolean = false;
  constructor(private dashboardService: DashboardService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    private openModuleService: OpenModuleService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private modalService: NgbModal,
    private encounterService: EncounterService,
    private formBuilder: FormBuilder, @Inject(Chartreport_Print) private objchartReport: Chartreport_Print, ) {
  }

  ngOnInit() {
    this.buildForm();


    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = 0;
    searchCriteria.criteria = "and convert(date,po.visit_date) between convert(date,'" + this.dateTimeUtil.getStringDateFromDateModel(this.filterForm.get('datefrom').value) + "') and convert(date,'" + this.dateTimeUtil.getStringDateFromDateModel(this.filterForm.get('dateto').value) + "')";
    searchCriteria.option = '';

    debugger
    this.getPendingEncounterResults(this.filterForm.get('ctrlproviderSearch').value, this.filterForm.get('ctrllocationSearch').value, searchCriteria);
  }
  getPendingEncounterResults(provider_id, location_id, searchCriteria) {
    this.isLoading = true;
    this.listPendingEncounterResult = null;
    this.pendingchartscount = 0;
    this.dashboardService.getPendingEncounter(provider_id, location_id, searchCriteria)
      .subscribe(
        data => {
          if (data != null && data != undefined) {
            this.listPendingEncounterResult = data
            this.pendingchartscount = this.listPendingEncounterResult.length;
            this.isLoading = false;
          }
          else {
            this.isLoading = false;
            this.pendingchartscount = 0;
          }
        },
        error => {
          this.isLoading = false;
          this.logMessage.log("pending encounter Successfull" + error);
        }
      );
  }
  openPatientSummary(patient) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }
  buildForm() {

    this.filterForm = this.formBuilder.group({
      ctrlproviderSearch: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider.toString() == '' ? 'all' : this.lookupList.logedInUser.defaultProvider, Validators.required),
      ctrllocationSearch: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation.toString() == '' ? 'all' : this.lookupList.logedInUser.defaultLocation, Validators.required),
      datefrom: this.formBuilder.control(this.dateTimeUtil.getDateModelFromDateString("04/01/2016", DateTimeFormat.DATEFORMAT_MM_DD_YYYY), Validators.required),
      dateto: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required)

    })

  }
  onFilter(criteria) {
    debugger;
    this.showHideSearch = true;
    let selectedProvider: String = "";
    let selectedLocation: String = "";
    let selectedDateTo: String = "";
    let selectedDateFrom: String = "";
    if (criteria.ctrlproviderSearch != 'all') {
      selectedProvider = criteria.ctrlproviderSearch;
    } else {
      selectedProvider = '-1';
    }
    if (criteria.ctrllocationSearch != 'all') {
      selectedLocation = criteria.ctrllocationSearch;
    } else {
      selectedLocation = '-1';
    }
    if (!criteria.datefrom) {
      alert("Please enter a date From.");
      return false;
    }
    if (!criteria.dateto) {
      alert("Please enter a date To.");
      return false;
    }
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = 0;
    searchCriteria.criteria = "and convert(date,po.visit_date) between convert(date,'" + this.dateTimeUtil.getStringDateFromDateModel(criteria.datefrom) + "') and convert(date,'" + this.dateTimeUtil.getStringDateFromDateModel(criteria.dateto) + "')";
    searchCriteria.option = '';
    this.getPendingEncounterResults(selectedProvider, selectedLocation, searchCriteria);
    //this.getPendingLabResults('50010112','','ALL','50010114');
    //this.getPendingLabResults(selectedProvider, selectedLocation, criteria.rdobtn,'5001015');
  }
  openPrint(obj) {
    this.objchartReport.chartId = obj.chart_id;
    this.objchartReport.patientId = obj.patient_id;
    this.objchartReport.acPrintSetting = this.lookupList.lstUserChartModuleSetting.slice();
    this.objchartReport.callingFrom = 'chart';
    this.objchartReport.getReportData();
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  onEncounterSign(obj) {
    this.strChartId='';
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Sign !';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to Sign the selected chart ?';
    modalRef.componentInstance.alertType = 'info';
    let closeResult;
    debugger;
    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        this.strChartId=obj.chart_id;
        if (this.lookupList.logedInUser.loginProviderId != 0 && this.lookupList.logedInUser.loginProviderId != null) {
          let searchCriteria: SearchCriteria = new SearchCriteria();
          searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
          searchCriteria.param_list = [
            { name: "sign_type", value: 'sign', option: "" },
            { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
            { name: "system_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
            { name: "chart_id", value: obj.chart_id, option: "" },
            { name: "patient_id", value: obj.patient_id, option: "" },
            { name: "signed_provider_id", value: this.lookupList.logedInUser.loginProviderId, option: "" },
            { name: "signed_provider_name", value: this.lookupList.logedInUser.loginProviderName, option: "" }
          ];
          this.encounterService.signEncounter(searchCriteria).subscribe(
            data => {
              let searchCriteria: SearchCriteria = new SearchCriteria();
              searchCriteria.practice_id = 0;
              searchCriteria.criteria = "and convert(date,po.visit_date) between convert(date,'" + this.dateTimeUtil.getStringDateFromDateModel(this.filterForm.get('datefrom').value) + "') and convert(date,'" + this.dateTimeUtil.getStringDateFromDateModel(this.filterForm.get('dateto').value) + "')";
              searchCriteria.option = '';
              this.getPendingEncounterResults(this.filterForm.get('ctrlproviderSearch').value, this.filterForm.get('ctrllocationSearch').value, searchCriteria);
              // this.selectedSignedProvider=this.objEncounterToOpen.provider_name;
              // this.objEncounterToOpen.signed=true;
              // this.isOpenClick = false;
            },
            error => {
              this.logMessage.log("signEncounter " + error);
            }
          );
        } else {
          this.signChartWithAuth(obj.provider_id);
        }
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  signChartWithAuth(prov_id) {
    debugger;
    const modalRef = this.modalService.open(ProviderAuthenticationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.headerTitle = "Confirm Encounter(s) Sign";
    modalRef.componentInstance.provider_id=prov_id
    modalRef.result.then((result) => {
      if (result) {
        debugger;
          this.signEncounterCall(result);
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  checkAllPendingEncounters(value) {
    for (var i = 0; i < this.listPendingEncounterResult.length; i++) {
      this.listPendingEncounterResult[i].isSign = value;
    }
    this.signALL = "sign";
  }
  checkEncounter(value, seting) {
    this.listPendingEncounterResult[this.generalOperation.getElementIndex(this.listPendingEncounterResult, seting)].isSign = value;
    this.signALL = "sign";
  }
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  signSelected() {
    debugger;
    this.strChartId = "";
    for (var i = 0; i < this.listPendingEncounterResult.length; i++) {
      if (this.listPendingEncounterResult[i].isSign != undefined || this.listPendingEncounterResult[i].isSign != null) {
        if (this.listPendingEncounterResult[i].isSign == true) {
          if (this.strChartId == "")
            this.strChartId = this.listPendingEncounterResult[i].chart_id;
          else
            this.strChartId += "," + this.listPendingEncounterResult[i].chart_id;
        }
      }
    }
    if (this.strChartId == "") {
      alert("Please select encounter to sign.");
      return;
    }

    if (this.signALL == "sign") {
      //
      const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Sign !';
      modalRef.componentInstance.promptMessage = 'Are you sure you want to Sign the selected chart(s) ?';
      modalRef.componentInstance.alertType = 'info';
      let closeResult;
      modalRef.result.then((result) => {
        if (result == PromptResponseEnum.YES) {
          if (this.lookupList.logedInUser.loginProviderId != 0 && this.lookupList.logedInUser.loginProviderId != null) {
            let authResponse: any = { user_id: this.lookupList.logedInUser.loginProviderId, user_name: this.lookupList.logedInUser.loginProviderName };
            this.signEncounterCall(authResponse);
          }else{
            this.signChartWithAuth(this.listPendingEncounterResult[0].provider_id);
          }
        }
      }, (reason) => {
        //alert(reason);
      });
    }
  }
  signEncounterCall(result) {
    debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "complete_by", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "complete_date", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" },
      { name: "signed_by", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "signed_date", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" },
      { name: "signed_provider_id", value: result.user_id, option: "" },//provider id
      { name: "signed_provider_name", value: result.user_name, option: "" },//provider name
      { name: "chart_id", value: this.strChartId, option: "" },
      { name: "system_ip", value: this.lookupList.logedInUser.systemIp, option: "" }
    ];
    this.encounterService.signSelectedEncounter(searchCriteria).subscribe
      (
        data => {
          let searchCriteria: SearchCriteria = new SearchCriteria();
          searchCriteria.practice_id = 0;
          searchCriteria.criteria = "and convert(date,po.visit_date) between convert(date,'" + this.dateTimeUtil.getStringDateFromDateModel(this.filterForm.get('datefrom').value) + "') and convert(date,'" + this.dateTimeUtil.getStringDateFromDateModel(this.filterForm.get('dateto').value) + "')";
          searchCriteria.option = '';
          this.strChartId='';
          debugger
          this.getPendingEncounterResults(this.filterForm.get('ctrlproviderSearch').value, this.filterForm.get('ctrllocationSearch').value, searchCriteria);
        },
        error => {
          this.logMessage.log("signEncounter " + error);
        }
      );
  }
  showHidetoggle(){
    this.showHideSearch = false;
  }
}