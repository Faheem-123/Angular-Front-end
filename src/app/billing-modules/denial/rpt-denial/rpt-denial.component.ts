import { Component, OnInit, Inject, ViewChild, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { InlineInsuranceSearchComponent } from 'src/app/general-modules/insurance/inline-insurance-search/inline-insurance-search.component';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { LogMessage } from 'src/app/shared/log-message';
import { ReportsService } from 'src/app/services/reports.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertTypeEnum, CallingFromEnum, PatientSubTabsEnum, PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { BillingService } from 'src/app/services/billing/billing.service';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { AddEditDenialComponent } from '../add-edit-denial/add-edit-denial.component';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { excelService } from 'src/app/shared/excelService';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';

@Component({
  selector: 'rpt-denial',
  templateUrl: './rpt-denial.component.html',
  styleUrls: ['./rpt-denial.component.css']
})
export class RptDenialComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  @Input() openedClaimInfo: OpenedClaimInfo;
  @Input() eraId: number;

  @Output() callBack = new EventEmitter<any>();


  @ViewChild('inlineSearchDenialPatient') inlineSearchDenialPatient: InlinePatientSearchComponent;
  @ViewChild('inlineSearchDenialInsurance') inlineSearchDenialInsurance: InlineInsuranceSearchComponent;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEventPayer: SortEvent;
  sortEventDenials: SortEvent;

  searchFormGroup: FormGroup;

  showPatientSearch: boolean = false;
  showInsuranceSearch: boolean = false;

  dateType: string = "dos";

  patientIdSearch: number;
  insIdSearch: number;

  lstStatus: Array<string> = ['All', 'Active', 'Resolved'];

  lstDenialPayers: Array<any>;
  lstDenialMessages: Array<any>;

  isLoading: boolean = false;

  selectedPayerRow: number = 0;

  denialCountPayerWise: number = 0;
  denialCountTotal: number = 0;

  collapsePayer: boolean = false;

  expandMessages: boolean = true;

  uniqueModuleId: string = "";

  showEra: boolean = false;
  showEob: boolean = false;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,

  };


  constructor(private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private paymentService: PaymentService,
    private logMessage: LogMessage,
    private reportsService: ReportsService,
    private billingService: BillingService,
    private ngbModal: NgbModal,
    private openModuleService: OpenModuleService,
    private excel: excelService,
    private sortFilterPaginationService: SortFilterPaginationService) { }

  ngOnInit() {


    if (this.callingFrom == CallingFromEnum.BILLING_REPORTS) {
      this.uniqueModuleId = this.callingFrom;
      this.buildForm();
      if (this.lookupList.claimAdjustmentGroupCodesList == undefined || this.lookupList.claimAdjustmentGroupCodesList.length == 0) {

        this.getClaimAdjustmentGroupCodesList();
      }

      if (this.lookupList.claimAdjustmentReasonCodesList == undefined || this.lookupList.claimAdjustmentReasonCodesList.length == 0) {

        this.getClaimAdjustmentReasonCodesList();
      }
    }
    else if (this.callingFrom == CallingFromEnum.PATIENT_CLAIM) {

      this.uniqueModuleId = this.callingFrom + "_" + this.openedClaimInfo.claimId;

      this.denialCountTotal = 0;
      this.denialCountPayerWise = 0;
      this.lstDenialPayers = undefined;
      this.lstDenialMessages = undefined;

      this.searchCriteriaMain = new SearchCriteria();

      this.searchCriteriaMain.practice_id = this.lookupList.practiceInfo.practiceId;
      this.searchCriteriaMain.param_list = [];

      this.searchCriteriaMain.param_list.push({ name: "patient_id", value: this.openedClaimInfo.patientId, option: "" });
      this.searchCriteriaMain.param_list.push({ name: "claim_id", value: this.openedClaimInfo.claimId, option: "" });

      this.getDenialMessageRptPayers();

    }
    else if (this.callingFrom == CallingFromEnum.ERA) {
      this.uniqueModuleId = this.callingFrom + "_" + this.eraId;

      this.searchCriteriaMain = new SearchCriteria();

      this.searchCriteriaMain.practice_id = this.lookupList.practiceInfo.practiceId;
      this.searchCriteriaMain.param_list = [];

      this.searchCriteriaMain.param_list.push({ name: "era_id", value: this.eraId, option: "" });
      this.getDenialMessageRptPayers();
    }

  }

  buildForm() {

    let currentDateModel = this.dateTimeUtil.getCurrentDateModel();

    this.searchFormGroup = this.formBuilder.group({
      dateType: this.formBuilder.control(this.dateType),
      dpFrom: this.formBuilder.control(currentDateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpTo: this.formBuilder.control(currentDateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtPatientSearch: this.formBuilder.control(''),
      txtInsuranceNameSearch: this.formBuilder.control(''),

      txtClaimId: this.formBuilder.control(''),
      txtEobId: this.formBuilder.control(''),
      ddGroupCode: this.formBuilder.control(''),
      ddReasonCode: this.formBuilder.control(''),
      ddStatus: this.formBuilder.control('All')
    }
    );
  }

  getClaimAdjustmentGroupCodesList() {

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.param_list = [
      { name: "group_codes", value: "", option: "" }
    ];

    this.paymentService.getClaimAdjustmentGroupCodesList(searchCriteria).subscribe(
      data => {
        this.lookupList.claimAdjustmentGroupCodesList = data as Array<any>;
      },
      error => {
        this.getClaimAdjustmentGroupCodesListError(error);
      }
    );
  }

  getClaimAdjustmentGroupCodesListError(error) {
    this.logMessage.log("getClaimAdjustmentGroupCodesList Error." + error);
  }


  getClaimAdjustmentReasonCodesList() {
    this.paymentService.getClaimAdjustmentReasonCodesList().subscribe(
      data => {
        this.lookupList.claimAdjustmentReasonCodesList = data as Array<any>;
      },
      error => {
        this.getClaimAdjustmentReasonCodesListError(error);
      }
    );
  }

  getClaimAdjustmentReasonCodesListError(error) {
    this.logMessage.log("getClaimAdjustmentReasonCodesList Error." + error);
  }


  onDateTypeChange(type: string) {
    this.dateType = type;
  }

  onPatientSearchKeydown(event) {

    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else if (event.key == 'ArrowDown') {
      debugger;
      this.shiftFocusToPatSearch();
    }
    else {
      this.showPatientSearch = false;
    }
  }

  shiftFocusToPatSearch() {
    this.inlineSearchDenialPatient.focusFirstIndex();
  }

  onPatientSearchInputChange() {
    this.patientIdSearch = undefined;
  }
  onPatientSearchBlur() {
    if (this.patientIdSearch == undefined && this.showPatientSearch == false) {
      this.searchFormGroup.get("txtPatientSearch").setValue('');
    }
  }

  openSelectPatient(patObject) {
    this.patientIdSearch = patObject.patient_id;
    this.searchFormGroup.get("txtPatientSearch").setValue(patObject.name);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }


  onInsuranceSearchKeydown(event) {

    if (event.key === "Enter") {
      this.showInsuranceSearch = true;
    }
    else if (event.key == 'ArrowDown') {
      this.shiftFocusToInsSearch();
    }
    else {
      this.showInsuranceSearch = false;
    }
  }

  shiftFocusToInsSearch() {
    this.inlineSearchDenialInsurance.focusFirstIndex();
  }

  addInsurance(obj) {
    let insObject = obj.insurance;
    this.insIdSearch = insObject.insurance_id;
    this.searchFormGroup.get("txtInsuranceNameSearch").setValue(insObject.insurance_name);

    this.showInsuranceSearch = false;
  }

  onInsuranceSearchInputChange() {
    this.insIdSearch = undefined;
  }

  closeInsuranceSearch() {
    this.showInsuranceSearch = false;
  }


  onInsuranceSearchFocusOut() {
    if (this.insIdSearch == undefined && this.showInsuranceSearch == false) {
      this.searchFormGroup.get("txtInsuranceNameSearch").setValue('');
    }
  }

  onClearSearch() {
    this.patientIdSearch = undefined;
    this.insIdSearch = undefined;

    this.searchFormGroup.get("txtPatientSearch").setValue('');
    this.searchFormGroup.get("txtInsuranceNameSearch").setValue('');
    this.searchFormGroup.get("dpFrom").setValue(this.dateTimeUtil.getCurrentDateModel());
    this.searchFormGroup.get("dpTo").setValue(this.dateTimeUtil.getCurrentDateModel());
    this.searchFormGroup.get("txtClaimId").setValue('');
    this.searchFormGroup.get("txtEobId").setValue('');
    this.searchFormGroup.get("ddGroupCode").setValue('');
    this.searchFormGroup.get("ddReasonCode").setValue('');
    this.searchFormGroup.get("ddStatus").setValue('All');

    this.lstDenialPayers = undefined;
    this.lstDenialMessages = undefined;
  }

  validateSearchData(formData: any): boolean {
    let strMsg: string = '';

    if (formData.dateType == undefined || formData.dateType == '') {
      strMsg = "Please select Date Range Type.";
    }
    else if (
      ((formData.dpFrom == undefined || formData.dpFrom == '') || (formData.dpTo == undefined || formData.dpTo == ''))
      && (formData.txtPatientSearch == undefined || formData.txtPatientSearch == '')
      && (formData.txtClaimId == undefined || formData.txtClaimId == '')
      && (formData.txtEobId == undefined || formData.txtEobId == '')
    ) {
      strMsg = "Please select Search Criteria.";
    }

    else if (formData.dpFrom != undefined && formData.dpFrom != '' && strMsg == '' && !this.dateTimeUtil.isValidDateTime(formData.dpFrom, DateTimeFormat.DATE_MODEL)) {
      strMsg = "Date From is not in correct formate.";
    }
    else if (formData.dpTo != undefined && formData.dpTo != '' && strMsg == '' && !this.dateTimeUtil.isValidDateTime(formData.dpTo, DateTimeFormat.DATE_MODEL)) {
      strMsg = "Date To is not in correct formate.";
    }
    else if (formData.dpFrom != undefined && formData.dpFrom != '' && formData.dpTo != undefined && formData.dpTo != '') {
      strMsg = this.dateTimeUtil.validateDateFromDateTo(formData.dpFrom, formData.dpTo, DateTimeFormat.DATE_MODEL, false, true);
    }


    if (strMsg != '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Denial Messages', strMsg, AlertTypeEnum.DANGER)
      return false;
    }

    return true;
  }

  searchCriteriaMain: SearchCriteria = new SearchCriteria();

  onSearch(formData: any) {

    this.denialCountPayerWise = 0;
    this.denialCountTotal = 0;
    this.lstDenialPayers = undefined;
    this.lstDenialMessages = undefined;

    if (!this.validateSearchData(formData)) {
      return;
    }


    this.searchCriteriaMain = new SearchCriteria();

    this.searchCriteriaMain.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteriaMain.param_list = [];
    //{ name: "group_codes", value: "", option: "" }
    //];

    if (formData.dpFrom != undefined && formData.dpFrom != '') {
      this.searchCriteriaMain.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpFrom, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: formData.dateType });
    }
    if (formData.dpTo != undefined && formData.dpTo != '') {
      this.searchCriteriaMain.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpTo, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: formData.dateType });
    }
    if (this.patientIdSearch != undefined) {
      this.searchCriteriaMain.param_list.push({ name: "patient_id", value: this.patientIdSearch, option: "" });
    }
    if (this.insIdSearch != undefined) {
      this.searchCriteriaMain.param_list.push({ name: "insurance_id", value: this.insIdSearch, option: "" });
    }
    if (formData.txtClaimId != undefined && formData.txtClaimId != '') {
      this.searchCriteriaMain.param_list.push({ name: "claim_id", value: formData.txtClaimId, option: "" });
    }
    if (formData.txtEobId != undefined && formData.txtEobId != '') {
      this.searchCriteriaMain.param_list.push({ name: "eob_id", value: formData.txtEobId, option: "" });
    }
    if (formData.ddStatus != undefined && formData.ddStatus != '') {
      this.searchCriteriaMain.param_list.push({ name: "status", value: formData.ddStatus, option: "" });
    }
    if (formData.ddGroupCode != undefined && formData.ddGroupCode != ''
      && formData.ddReasonCode != undefined && formData.ddReasonCode != ''
    ) {
      this.searchCriteriaMain.param_list.push({ name: "adjust_reason_code", value: formData.ddGroupCode + '-' + formData.ddReasonCode, option: "" });
    }
    else if (formData.ddGroupCode != undefined && formData.ddGroupCode != '') {
      this.searchCriteriaMain.param_list.push({ name: "adjust_reason_code", value: formData.ddGroupCode, option: "" });
    }
    else if (formData.ddReasonCode != undefined && formData.ddReasonCode != ''
    ) {
      this.searchCriteriaMain.param_list.push({ name: "adjust_reason_code", value: formData.ddReasonCode, option: "" });
    }


    this.searchCriteriaMain.param_list.push({ name: "group_codes", value: "", option: "" });

    this.getDenialMessageRptPayers();
  }

  getDenialMessageRptPayers() {
    this.isLoading = true;
    this.reportsService.getDenialMessageRptPayers(this.searchCriteriaMain).subscribe(
      data => {
        this.lstDenialPayers = data as Array<any>;

        if (this.lstDenialPayers != undefined && this.lstDenialPayers.length > 0) {

          this.denialCountTotal = 0;
          this.lstDenialPayers.forEach(payerWise => {
            this.denialCountTotal += Number(payerWise.count);
          });

          this.onPayerRowClick(0, true);
        }
        else {
          this.isLoading = false;

        }
      },
      error => {
        this.isLoading = false;
        this.getDenialMessageRptPayersError(error);
      }
    );
  }

  getDenialMessageRptPayersError(error) {
    this.logMessage.log("getDenialMessageRptPayers Error." + error);
  }

  onPayerRowClick(i: number, forceFetch: boolean) {

    debugger;

    if (this.selectedPayerRow != i || forceFetch) {
      this.denialCountPayerWise = 0;
      this.isLoading = true;
      this.lstDenialMessages = undefined;
      this.selectedPayerRow = i;
      let searchCriteria: SearchCriteria = this.searchCriteriaMain;
      searchCriteria.param_list.push({ name: 'payer_name', value: this.lstDenialPayers[i].name, option: '' });
      /*
      if (this.callingFrom == CallingFromEnum.PATIENT_CLAIM) {
        searchCriteria.param_list.push({ name: 'patient_id', value: this.openedClaimInfo.patientId, option: '' });
        searchCriteria.param_list.push({ name: 'patient_id', value: this.openedClaimInfo.claimId, option: '' });

      }
      else if (this.callingFrom == CallingFromEnum.ERA) {
        searchCriteria.param_list.push({ name: 'era_id', value: this.eraId, option: '' });
      }
      */

      this.reportsService.getDenialMessages(searchCriteria).subscribe(
        data => {
          this.lstDenialMessages = data as Array<any>;
          this.denialCountPayerWise = this.lstDenialMessages.length;
          this.lstDenialPayers[this.selectedPayerRow].count = this.denialCountPayerWise;
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          this.getDenialMessagesError(error);
        }
      );
    }

  }

  getDenialMessagesError(error) {
    this.logMessage.log("getDenialMessages Error." + error);
  }

  selectAll(option: boolean) {
    debugger;

    this.lstDenialMessages.forEach(msg => {
      if (msg.status.toString().toLowerCase() == 'active') {
        msg.selected = option;
      }
    });
  }

  selectMessage(option: boolean, index: number) {
    debugger;
    this.lstDenialMessages[index].selected = option;
  }


  openPatient(message: any) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = message.patient_id;
    obj.patient_name = message.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }

  openClaim(message: any) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = message.patient_id;
    obj.patient_name = message.patient_name;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = message.claim_id;
    this.openModuleService.openPatient.emit(obj);
  }

  onDeleteDenialMessage(msg: any) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = "Confirm Deletion !"
    modalRef.componentInstance.promptMessage = "Are you sure you want to delete selected denial message ?";
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;


    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = msg.denial_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.billingService.deleteDenialMessage(deleteRecordData)
          .subscribe(
            data => {
              if (data > 0) {
                if (this.denialCountTotal > 0) {
                  this.denialCountTotal--;
                }
                this.onPayerRowClick(this.selectedPayerRow, true);
              }
              else {
                GeneralOperation.showAlertPopUp(this.ngbModal, 'Denial Messages', "An Error Occured while deleting denial message.", AlertTypeEnum.DANGER)
              }
            },
            error => alert(error),
            () => this.logMessage.log("Denial message has benn deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }


  denialOperationType: string = '';
  onAddEditDenialMessage(objDenial: any, denialIds: string, operationType: string) {

    this.denialOperationType = operationType;
    const modalRef = this.ngbModal.open(AddEditDenialComponent, this.popUpOptions);
    modalRef.componentInstance.objDenial = objDenial;
    modalRef.componentInstance.denialIds = denialIds;
    modalRef.componentInstance.patientId= this.openedClaimInfo != undefined ? this.openedClaimInfo.patientId : undefined;
    modalRef.componentInstance.claimId = this.openedClaimInfo != undefined ? this.openedClaimInfo.claimId : undefined;
    modalRef.componentInstance.operationType = operationType;

    modalRef.result.then((result) => {
      debugger;
      if (result == true) {
        if (this.denialOperationType == 'new') {
          this.getDenialMessageRptPayers();
        }
        else {
          this.onPayerRowClick(this.selectedPayerRow, true);
        }
        //this.getClaimNotes();
      }
    }, (reason) => {
      //alert(reason);
    });
  }


  denialIds: string = "";
  onResolveMultipleDenials() {

    debugger;

    this.denialIds = "";
    this.lstDenialMessages.forEach(msg => {
      if (msg.selected == true) {
        if (this.denialIds != '') {
          this.denialIds += ",";
        }
        this.denialIds += msg.denial_id;
      }
    });

    if (this.denialIds == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Denial Messages', "Please select atleast one active denial to resolve.", AlertTypeEnum.WARNING)
    }
    else {
      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Action!';
      modalRef.componentInstance.promptMessage = 'Do you want to resolved selected denials?';
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;

      modalRef.result.then((result) => {
        debugger;
        if (result == PromptResponseEnum.YES) {
          this.onAddEditDenialMessage(undefined, this.denialIds, 'multiple');
        }
      }, (reason) => {

      });
    }
  }


  onRefersh() {
    if (this.lstDenialPayers != undefined && this.lstDenialPayers.length > 0) {
      this.onPayerRowClick(this.selectedPayerRow, true);
    }
  }

  exportAsXLSX() {
    this.excel.exportAsExcelFile(this.lstDenialMessages, 'claim_id,dos,patient_name,payer_name,insurance_name,policy_no,message,remarks_codes_details,status,resolved_message,resolved_user,date_resolved,eob_era_id,eob_era_id_type,no_of_days', 'Denial Messages');
  }
  selectedRow = 0;
  onSelectionChange(index) {
    this.selectedRow = index;
  }

  onSortPayer(sortEvent: SortEvent) {
    debugger;
    this.sortEventPayer = sortEvent;
    this.sortPayer();
  }
  private sortPayer() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstDenialPayers, this.headers, this.sortEventPayer, null, null, 'denial_payer');
    this.lstDenialPayers = sortFilterPaginationResult.list;

    this.onPayerRowClick(0, true)
  }

  onSortDenial(sortEvent: SortEvent) {
    debugger;
    this.sortEventDenials = sortEvent;
    this.sortDenial();
  }
  private sortDenial() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstDenialMessages, this.headers, this.sortEventDenials, null, null, 'denials');
    this.lstDenialMessages = sortFilterPaginationResult.list;
    this.onSelectionChange(0);
  }

  eraIdToView: number;
  eraClaimIdToView: number;
  backFromEobEra() {
    this.showEra = false;
    this.showEob = false;
  }
  openEOB_ERA(denial: any) {

    debugger;
    this.eraIdToView = undefined;
    this.eraClaimIdToView = undefined;
    if (denial.eob_era_id_type == 'ERA') {
      this.eraIdToView = denial.eob_era_id;
      this.eraClaimIdToView = denial.claim_id;
      this.showEra = true;
    }
    else if (denial.eob_era_id_type == 'EOB') {
      this.eraIdToView = denial.eob_era_id;
      this.showEob = true;
    }

  }
}
