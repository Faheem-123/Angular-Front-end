import { Component, EventEmitter, Inject, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { AppConfig, APP_CONFIG } from 'src/app/providers/app-config.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { PatientSearchObservable } from 'src/app/services/observable/patient-search-observable';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { SearchCriteria } from "../../../models/common/search-criteria";
import { ORMDeleteRecord } from '../../../models/general/orm-delete-record';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { WrapperObjectSave } from '../../../models/general/wrapper-object-save';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { PatientService } from '../../../services/patient/patient.service';
import { DateTimeUtil } from '../../../shared/date-time-util';
import { AlertTypeEnum, CallingFromEnum, PatientSubTabsEnum, PromptResponseEnum, ServiceResponseStatusEnum } from '../../../shared/enum-util';
import { GeneralOperation } from '../../../shared/generalOperation';
import { LogMessage } from '../../../shared/log-message';
import { PatientDeleteNotesComponent } from '../patient-delete-notes/patient-delete-notes.component';
import { OperationData, OperationDataOptionEnum } from '../patient-main/operation-data';
import { TimelyAccessComponent } from '../timely-access/timely-access.component';
import { OpenModuleService } from 'src/app/services/general/openModule.service';

@Component({
  selector: 'patient-search',
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.css']
})
export class PatientSearchComponent implements OnInit {

  @Output() performAction = new EventEmitter<any>();

  recordType: string;
  searchOption: string;
  //addNewPatientFlag: boolean = false;
  isLoading: boolean = false;
  lstPatient: Array<any>;
  //isShowFlexApp = false;

  patSearchForm: FormGroup;
  patAdvanceSearchForm: FormGroup;
  total: number = 0;
  saveObjectWrapper: WrapperObjectSave;

  scheduledPatientsOption: string = '';
  scheduledLocationId: string = '';
  scheduledProviderId: string = '';

  popupScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
  };
  inactiveScreen: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
    , size: 'lg'
  };

  constructor(private formBuilder: FormBuilder,
    private patientService: PatientService,
    private logMessage: LogMessage, private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private modalService: NgbModal,
    public generalOperation: GeneralOperation,
    private patientSearchObservable: PatientSearchObservable,
    private sortFilterPaginationService: SortFilterPaginationService, @Inject(APP_CONFIG) private config: AppConfig
    , private domSanitizer: DomSanitizer, private generalService: GeneralService,
    private openModuleService: OpenModuleService) { }

  ngOnInit() {
    this.buildForm();

    this.onSearchLatestOpenedPatients();


    this.patientSearchObservable.performSearch.subscribe(
      value => {

        this.total = 0;
        this.lstPatient = undefined;
        this.isLoading = true;

        debugger;
        if (value != undefined) // patient_id
        {
          this.patSearchForm.get("ctrlPatientSearchAdvance").setValue(value);
          this.patSearchForm.get("ctrlPatientSearchAdvanceOption").setValue("PATIENT_ID");

          let paramList = [{ name: 'PATIENT_ID', value: value, option: undefined }];
          this.searchPatient("ADVANCE", paramList);
        }
        else if (this.searchOption == "DEFAULT") {
          let paramList = [{ name: 'criteria', value: this.patSearchForm.get("ctrlPatientSearch").value, option: undefined }];
          this.searchPatient("DEFAULT", paramList);

        }
        else if (this.searchOption == "ADVANCE") {
          let paramList = [{ name: this.patAdvanceSearchForm.get("ctrlPatientSearchAdvanceOption").value, value: this.patAdvanceSearchForm.get("ctrlPatientSearchAdvance").value, option: undefined }];
          this.searchPatient("ADVANCE", paramList);
        }
        else if (this.searchOption == "LATEST_OPENED") {
          this.loadLatestViewedPaients();
        }
        else if (this.searchOption == "TODAY_SCHEDULED") {
          this.loadTodayScheduledPatients(this.scheduledLocationId, this.scheduledProviderId, this.scheduledPatientsOption);
        }
      }
    );
  }

  buildForm() {
    this.patSearchForm = this.formBuilder.group({
      ctrlPatientSearch: this.formBuilder.control('', Validators.required)
    })

    this.patAdvanceSearchForm = this.formBuilder.group({
      ctrlPatientSearchAdvance: this.formBuilder.control('', Validators.required),
      ctrlPatientSearchAdvanceOption: this.formBuilder.control('CLAIM_ID', Validators.required)
    })

  }

  onSearchLatestOpenedPatients() {
    this.loadLatestViewedPaients();
  }

  onSearchPatient(criteriaForm: any) {


    let paramList = [{ name: 'criteria', value: criteriaForm.ctrlPatientSearch, option: undefined }];
    this.searchPatient("DEFAULT", paramList);
  }

  onSearchPatientAdvance(criteriaForm: any) {
    debugger;
    let paramList = [{ name: criteriaForm.ctrlPatientSearchAdvanceOption, value: criteriaForm.ctrlPatientSearchAdvance, option: undefined }];
    this.searchPatient("ADVANCE", paramList);

  }

  searchPatient(searchOption: string, paramList: Array<any>) {

    debugger;
    if (!this.lookupList.UserRights.patient_view)
      return;
    this.total = 0;
    this.lstPatient = undefined;
    this.isLoading = true;

    this.searchOption = searchOption;//"ADVANCE";

    this.recordType = 'PATIENT';

    switch (this.searchOption) {
      case 'TODAY_SCHEDULED':
        this.recordType = 'APPOINTMENT';
        break;
      case 'ADVANCE':
        this.scheduledPatientsOption = "";
        if (paramList[0].name == 'CLAIM_ID') {
          this.recordType = 'CLAIM';
        }
        break;
      default:
        this.scheduledPatientsOption = "";
        this.scheduledProviderId = '';
        this.scheduledLocationId = '';
        break;
    }



    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.option = searchOption;
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = paramList
    //if (feildName != '' && feildValue != '') {
    // searchCriteria.param_list = [{ name: feildName, value: feildValue, option: undefined }];
    //}

    this.patientService.searchPatient(searchCriteria).subscribe(
      data => {
        console.log(data)
        this.lstPatient = data as Array<any>;;
        this.isLoading = false;
        this.total = this.lstPatient.length;
      },
      error => {
        this.isLoading = false;
        this.SearchPatientError(error);
      }
    );
  }

  SearchPatientError(error: string) {
    this.logMessage.log("onSearchPatientAdvance Error." + error);
  }
  onMenuClick(pat, option) {
    pat.childName = "tab-encounter";
    switch (option) {
      case "modify":
        this.OnModifyPatient(pat);
        break;
      case "delete":
        this.onDeletePatient(pat);
        break;
      case "encounter":
        this.openPatientClick(pat, PatientSubTabsEnum.ENCOUNTER);
        break;
      case "claim":
        this.openPatientClick(pat, PatientSubTabsEnum.CLAIM);
        break;
      case "document":
        this.openPatientClick(pat, PatientSubTabsEnum.DOCUMENTS);
        break;
      case "referral":
        this.openPatientClick(pat, PatientSubTabsEnum.REFERRAL);
        break;
      case "appointment":
        this.openPatientClick(pat, PatientSubTabsEnum.APPOINTMENTS);
        break;
      case "TimelyAccess":
        const modalRef = this.modalService.open(TimelyAccessComponent, this.poupUpOptionslg);
        modalRef.componentInstance.patientName = pat.name;
        modalRef.componentInstance.patientId = pat.patient_id;
        modalRef.componentInstance.callingFrom = CallingFromEnum.PATIENT;
        break;
      case "patient_log":
        this.openAuditLog(pat, option);
        break;

    }
  }
  openPatientClick(pat: any, childModule: string) {

    debugger;
    let patientToOpen: PatientToOpen = new PatientToOpen();
    patientToOpen.patient_id = pat.patient_id;
    patientToOpen.patient_name = pat.name;
    patientToOpen.child_module = childModule as PatientSubTabsEnum;
    patientToOpen.pid = pat.alternate_account;
    this.doAction(OperationDataOptionEnum.OPEN, patientToOpen);

  }
  poupUpOptionslg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };


  onDeletePatient(pat: any) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.popupScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to delete selected Patient ?<br>' + pat.name;
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;

    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {
        this.patientService.confirmPatientDel(pat.patient_id)
          .subscribe(
            data => this.confirmPatientDel_Result(data, pat),
            error => alert(error)

          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  confirmPatientDel_Result(data: any, pat: any) {
    if (data.length > 0) {
      var msg: String = "";
      if (data[0].appointment_id > 0)
        msg = msg + " Appointment";
      if (data[0].claim_id > 0)
        if (msg != "")
          msg = msg + ", Claim";
        else
          msg = " Claim";
      if (data[0].patient_payment_id > 0)
        if (msg != "")
          msg = msg + ", Payment";
        else
          msg = " Payment";
      if (data[0].chart_id > 0)
        if (msg != "")
          msg = msg + ", Chart";
        else
          msg = " Chart";
      if (msg == "") {
        const modalRef = this.modalService.open(PatientDeleteNotesComponent, this.inactiveScreen);
        modalRef.componentInstance.title = " (" + pat.name + " )";
        let closeResult;
        modalRef.result.then((result) => {
          if (result != '') {
            let deleteRecordData = new ORMDeleteRecord();
            deleteRecordData.column_id = pat.patient_id;
            deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
            deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
            deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
            this.saveObjectWrapper = new WrapperObjectSave();
            this.saveObjectWrapper.ormSave = deleteRecordData;
            this.saveObjectWrapper.lstKeyValue = [];
            this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("notes", result));


            this.patientService.deletePatient(this.saveObjectWrapper)
              .subscribe(
                data => this.onDeleteSuccessfully(data, pat),
                error => alert(error),
                () => this.logMessage.log("confirmPatientDel_Result.")
              );
          }
        }, (reason) => {
        });
      }
      else {
        const modalRef = this.modalService.open(AlertPopupComponent, this.popupScreenOptions);
        modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
        modalRef.componentInstance.promptMessage = 'This patient has information of' + msg + '.\nUnable to delete this patient';
        modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      }
    }
  }
  onDeleteSuccessfully(data: any, pat: any) {
    var index = this.generalOperation.getElementIndex(this.lstPatient, pat);
    if (index > -1) {
      this.lstPatient.splice(index, 1);
    }
    this.generalService.auditLog(
      this.generalOperation.moduleAccessLog("Delete", 'Patient', pat.patient_id, ""))
      .subscribe(
        data => {
        });
  }

  OnCreatePatient() {
    this.doAction(OperationDataOptionEnum.ADD, undefined);
  }
  OnModifyPatient(pat) {
    this.doAction(OperationDataOptionEnum.EDIT, pat.patient_id);
  }

  loadLatestViewedPaients() {

    let paramList = [{ name: 'user_name', value: this.lookupList.logedInUser.user_name, option: undefined }];
    this.searchPatient("LATEST_OPENED", paramList);

  }

  loadTodayScheduledPatients(locationId: string, providerId: string, optionName: string) {

    this.scheduledPatientsOption = optionName;
    this.scheduledProviderId = providerId;
    this.scheduledLocationId = locationId;

    let paramList = [{ name: 'location_id', value: locationId, option: undefined },
    { name: 'provider_id', value: providerId, option: undefined }];
    this.searchPatient("TODAY_SCHEDULED", paramList);
  }


  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstPatient, this.headers, this.sortEvent, null, null, '');
    this.lstPatient = sortFilterPaginationResult.list;
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
    , size: 'lg'
  };

  /*
  changeAdvanceOpt() {
    this.patAdvanceSearchForm.get("ctrlPatientSearchAdvance").setValue('');
  }
  */

  OnMergePatient() {
    this.doAction(OperationDataOptionEnum.MERGE_PATIENT, undefined);
  }

  onShowFlexApp(value: string) {

    let flexURL: SafeUrl;
    let strLink = "";
    strLink = this.config.flexApplink;
    strLink += "user_id=" + this.lookupList.logedInUser.userId;
    strLink += "&user_name=" + this.lookupList.logedInUser.user_name;
    strLink += "&practice_id=" + this.lookupList.practiceInfo.practiceId;
    strLink += "&calling_from=" + value;
    flexURL = this.domSanitizer.bypassSecurityTrustResourceUrl(strLink)

    this.doAction(OperationDataOptionEnum.SHOW_FLEX_APP, flexURL);
  }


  openAuditLog(pat: any, moduleName: string) {

    let patientToOpen: PatientToOpen = new PatientToOpen();
    patientToOpen.patient_id = pat.patient_id;
    patientToOpen.pid = pat.alternate_account;
    patientToOpen.patient_name = pat.name;
    //patientToOpen.child_module = childModule as PatientSubTabsEnum;
    patientToOpen.other_option = moduleName;
    this.doAction(OperationDataOptionEnum.SHOW_AUDIT_LOG, patientToOpen);


  }
  doAction(action: string, value: any) {

    debugger;

    let operation: OperationDataOptionEnum = action as OperationDataOptionEnum;
    let operationData: OperationData;

    switch (operation) {
      case OperationDataOptionEnum.OPEN:
        operationData = new OperationData(OperationDataOptionEnum.OPEN, value);
        break;
      case OperationDataOptionEnum.EDIT:
        operationData = new OperationData(OperationDataOptionEnum.EDIT, value);
        break;
      case OperationDataOptionEnum.ADD:
        operationData = new OperationData(OperationDataOptionEnum.ADD, undefined);
        break;
      case OperationDataOptionEnum.MERGE_PATIENT:
        operationData = new OperationData(OperationDataOptionEnum.MERGE_PATIENT, undefined);
        break;
      case OperationDataOptionEnum.SHOW_FLEX_APP:
        operationData = new OperationData(OperationDataOptionEnum.SHOW_FLEX_APP, value);
        break;
      case OperationDataOptionEnum.SHOW_AUDIT_LOG:
        operationData = new OperationData(OperationDataOptionEnum.SHOW_AUDIT_LOG, value);
        break;

      default:
        break;
    }

    this.performAction.emit(operationData);

  }
  /*
  isPaste = false;
  onPaste(event: ClipboardEvent) {
    this.isPaste = true;

    // this.patSearchForm.get("ctrlPatientSearch").setValue(event.clipboardData.getData('text').replace(/\D/g, ''));
    // //this.patSearchForm.get("ctrlPatientSearch").setValue(event.currentTarget['value'].replace(/\D/g, ''));
    // event.stopPropagation();
    // event.clipboardData.clearData();
    // //event.preventdefault();
  }
  */

  /*
  onPatientSearchInputChange(value) {
    if (this.isPaste) {
      this.patSearchForm.get("ctrlPatientSearch").setValue(value.trim())
      // /^[^ ][\w\W ]*[^ ]/
      this.isPaste = false;
    }
  }
  */

  /*
  onPatientAdvanceSearchInputChange(value) {
    if (this.isPaste) {
      this.patAdvanceSearchForm.get("ctrlPatientSearchAdvance").setValue(value.trim())
      this.isPaste = false;
    }
  }
  */


  onPaste(event: ClipboardEvent, controlName: string) {
    debugger;
    event.preventDefault();

    var pastedText = '';

    if (event.clipboardData && event.clipboardData.getData) {// Standards Compliant FIRST!
      pastedText = event.clipboardData.getData('text/plain');
    }
    //else if (window.clipboardData && window.clipboardData.getData)
    //{// IE
    //    pastedText = window.clipboardData.getData('Text');
    //}

    if (controlName == 'ctrlPatientSearchAdvance') {
      this.patAdvanceSearchForm.get(controlName).setValue(pastedText.trim());
    }
    else {
      this.patSearchForm.get(controlName).setValue(pastedText.trim());
    }
  }

  getTooltipIcdsCptsAsList(icdsCpts: any) {
    let lst: Array<string> = [];

    if (icdsCpts != undefined && icdsCpts != '' && icdsCpts != null) {
      lst = icdsCpts.split(':');
    }

    return lst;
  }

  openClaim(pat: any) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = pat.patient_id;
    obj.patient_name = pat.name;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = pat.claim_id;
    this.openModuleService.openPatient.emit(obj);
  }

}


