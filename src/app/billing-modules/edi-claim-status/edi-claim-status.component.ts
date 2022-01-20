import { Component, OnInit, Inject, ViewChild, Input } from '@angular/core';
import { BillingService } from 'src/app/services/billing/billing.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { excelService } from 'src/app/shared/excelService';
import { AlertTypeEnum, CallingFromEnum, PatientSubTabsEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { ExcelColumn } from 'src/app/models/general/excel-column';
import { EdiClaimStatusDetailPopupComponent } from './edi-claim-status-detail-popup/edi-claim-status-detail-popup.component';

@Component({
  selector: 'edi-claim-status',
  templateUrl: './edi-claim-status.component.html',
  styleUrls: ['./edi-claim-status.component.css']
})
export class EdiClaimStatusComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  @Input() claimIdIdSearch: number;

  @ViewChild('inlinePatientSearch') inlinePatientSearch: InlinePatientSearchComponent;


  isLoading: boolean = false;
  isProcessing: boolean = false;

  searchFormGroup: FormGroup;
  dateRangeType: string = 'date_created';  // date_created|status_date|dos
  patientIdSearched = ''
  patientNameSearched: string = '';
  lstClaimStatus: Array<any>;
  selectedSummaryRow: number = 0;

  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private generaloperation: GeneralOperation,
    private formBuilder: FormBuilder,
    private ngbModal: NgbModal,
    private billingService: BillingService,
    private openModuleService: OpenModuleService,
    private excel: excelService) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.searchFormGroup = this.formBuilder.group({
      dateRangeType: this.formBuilder.control(this.dateRangeType),
      dpFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      txtPayerSearch: this.formBuilder.control(''),
      txtPatientSearch: this.formBuilder.control(""),
      txtClaimId: this.formBuilder.control(''),

      ddStatus: this.formBuilder.control('rejected_pending'),
      ddLocation: this.formBuilder.control(''),
      ddProvider: this.formBuilder.control('')
    });
  }


  showPatientSearch = false;

  onPatientSearchInputChange(newValue) {

    if (newValue !== this.patientNameSearched) {
      this.patientIdSearched = undefined;
    }

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
    this.inlinePatientSearch.focusFirstIndex();
  }

  openSelectPatient(patObject) {
    this.patientIdSearched = patObject.patient_id;
    this.searchFormGroup.get("txtPatientSearch").setValue(patObject.name);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  onPatientSearchBlur() {
    if ((this.patientIdSearched == undefined || this.patientIdSearched == '') && this.showPatientSearch == false) {
      this.patientNameSearched = '';
      this.searchFormGroup.get("txtPatientSearch").setValue('');
    }
  }


  onDateTypeChange(type: string) {
    this.dateRangeType = type;
  }


  downloadClaimStatus() {

    this.isProcessing = true;
    debugger;
    let strRootUrl: string = window.location.hostname;

    let searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "root_url", value: strRootUrl, option: "" },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
      { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
      { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
    ];

    this.billingService.downloadClaimResponse(searchCriteria).subscribe(
      data => {
        debugger;
        this.isProcessing = false;
        this.downloadClaimResponseSuccess(data);
      },
      error => {
        this.isProcessing = false;
        this.downloadClaimResponseError(error);
      }
    );
  }

  downloadClaimResponseSuccess(data: any) {
    debugger;

    if (data.status == 'ERROR') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Status', data.response, AlertTypeEnum.DANGER)
    }
    else if (data.status == 'SUCCESS') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Status', data.response, AlertTypeEnum.SUCCESS)
    }
    else if (data.status == 'INFO') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Status', data.response, AlertTypeEnum.INFO)
    }

  }

  downloadClaimResponseError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Status', "An Error Occured while getting Claim Status from Gateway EDI.", AlertTypeEnum.DANGER)
  }


  searchCriteria: SearchCriteria;
  onSearchClicked(frm: any) {
    debugger;
    if ((this.searchFormGroup.get('dpFrom') as FormControl).value == "" || (this.searchFormGroup.get('dpFrom') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter From Date", 'warning')
      return;
    }
    if ((this.searchFormGroup.get('dpTo') as FormControl).value == "" || (this.searchFormGroup.get('dpTo') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter To Date", 'warning')
      return;
    }

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "date_range_type", value: this.dateRangeType, option: "" });
    this.searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpFrom), option: "" });
    this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpTo), option: "" });

    this.searchCriteria.param_list.push({ name: "claim_id", value: frm.txtClaimId, option: "" });
    if (this.patientIdSearched != '' && frm.txtPatientSearch != null && frm.txtPatientSearch != '') {
      this.searchCriteria.param_list.push({ name: "patient_id", value: this.patientIdSearched, option: "" });
    }

    this.searchCriteria.param_list.push({ name: "status", value: frm.ddStatus, option: "" });

    this.searchCriteria.param_list.push({ name: "location_id", value: frm.ddLocation, option: "" });
    this.searchCriteria.param_list.push({ name: "provider_id", value: frm.ddProvider, option: "" });
    this.getEdiClaimStatus();

  }

  getEdiClaimStatus() {
    debugger;
    this.isLoading = true;
    this.lstClaimStatus = [];
    this.billingService.getEdiClaimStatus(this.searchCriteria).subscribe(
      data => {
        this.lstClaimStatus = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        alert(error);
        this.isLoading = false;
      }
    );

  }

  onselectionChange(i) {
    this.selectedSummaryRow = i;
  }


  openPatient(data) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = data.patient_id;
    obj.patient_name = data.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }

  openClaim(data) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = data.patient_id;
    obj.patient_name = data.patient_name;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = data.claim_id;
    this.openModuleService.openPatient.emit(obj);
  }

  viewClaimLevelStatus(ediStatus: any) {

    debugger;
    const modalRef = this.ngbModal.open(EdiClaimStatusDetailPopupComponent, this.popUpOptionsLg);
    modalRef.componentInstance.ediStatus = ediStatus;

  }

  markAsWorked(id: number) {

    this.isProcessing = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "id", value: id, option: "" },
      { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
      { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
    ];

    this.billingService.markEdiClaimStatusAsWorked(searchCriteria).subscribe(
      data => {
        this.isProcessing = false;
        this.markAsWorkedSuccess(data);
      },
      error => {
        this.isProcessing = false;
        this.markAsWorkedError(error);
      }
    );
  }

  markAsWorkedSuccess(data: any) {
    
    debugger;

    if (data.status == ServiceResponseStatusEnum.SUCCESS) {
      this.lstClaimStatus[this.selectedSummaryRow].worked=true;
    }
    else if (data.status == ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Mark EDI Claim Status As Worked', data.response, AlertTypeEnum.DANGER)
    }
  }

  markAsWorkedError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Mark EDI Claim Status As Worked', "An Error Occured while saving record.", AlertTypeEnum.DANGER)
  }

  exportAsXLSX() {

    if (this.lstClaimStatus == undefined || this.lstClaimStatus.length == 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'EDI Claim Status', "There is no record to export.", AlertTypeEnum.INFO)
    }
    else {
      let lstColumns: Array<any> = new Array<any>();
      lstColumns = [
        new ExcelColumn('date_created', 'Date Created'),
        new ExcelColumn('claim_id', 'Claim Id','number'),
        new ExcelColumn('dos', 'DOS'),

        new ExcelColumn('pid', 'PID'),
        new ExcelColumn('patient_name', 'Patient Name'),

        new ExcelColumn('location_name', 'Location'),
        new ExcelColumn('billing_provider_name', 'Billing Physician'),
        
        new ExcelColumn('status', 'Status'),

        new ExcelColumn('status_effective_date', 'Status Date'),
        new ExcelColumn('status_description', 'Status Description'),
        
        new ExcelColumn('worked', 'Worked'),
        new ExcelColumn('worked_by', 'Worked By'),
        new ExcelColumn('date_worked', 'Date Worked'),
      ]

      this.excel.exportAsExcelFileWithHeaders(this.lstClaimStatus, lstColumns, 'Claim Status');
    }
  }

}
