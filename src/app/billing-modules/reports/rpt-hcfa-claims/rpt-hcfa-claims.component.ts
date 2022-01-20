import { Component, OnInit, Inject, ViewChildren, QueryList, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { LogMessage } from 'src/app/shared/log-message';
import { ReportsService } from 'src/app/services/reports.service';
import { BillingService } from 'src/app/services/billing/billing.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { excelService } from 'src/app/shared/excelService';
import { SortFilterPaginationService, NgbdSortableHeader, SortEvent, SortFilterPaginationResult } from 'src/app/services/sort-filter-pagination.service';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { AlertTypeEnum, PatientSubTabsEnum, PromptResponseEnum, ServiceResponseStatusEnum, SubmissionMethodEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { ExcelColumn } from 'src/app/models/general/excel-column';
import { SubmissionProccessedClaimInfo } from 'src/app/models/billing/submission-proccessed-claim-info';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { GeneralService } from 'src/app/services/general/general.service';
import { HcfaViewerComponent } from '../../hcfa/hcfa-viewer/hcfa-viewer.component';
import { HcfaPrintOptionPopupComponent } from '../../hcfa/hcfa-print-option-popup/hcfa-print-option-popup.component';

@Component({
  selector: 'rpt-hcfa-claims',
  templateUrl: './rpt-hcfa-claims.component.html',
  styleUrls: ['./rpt-hcfa-claims.component.css']
})
export class RptHcfaClaimsComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  
  searchFormGroup: FormGroup;
  dateType: string = "dos";
  totalRecords: number = 0;

  uniqueId: string;

  lstHcfaClaims: Array<any>;
  isLoading: boolean = false;
  isProcessing: boolean = false;

  HCFAPrintForSecondary: boolean = false;

  showHcfa: boolean = false;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  popUpOptionsLarge: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
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
    private sortFilterPaginationService: SortFilterPaginationService,
    private generalService: GeneralService) { }

  ngOnInit() {

    this.uniqueId = Math.random().toString(36).substr(2, 9);
    this.buildSearchForm();
  }

  buildSearchForm() {

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

      ddLocation: this.formBuilder.control(''),
      ddProvider: this.formBuilder.control(''),

      ddClaimType: this.formBuilder.control({ value: 'P', disabled: true }),
      ddStatus: this.formBuilder.control('0'),

      txtClaimId: this.formBuilder.control(''),
      ddInsuranceType: this.formBuilder.control('Primary')
    }
    );
  }

  onDateTypeChange(type: string) {
    this.dateType = type;
  }

  validateSearchData(formData: any): boolean {
    let strMsg: string = '';

    if (formData.dateType == undefined || formData.dateType == '') {
      strMsg = "Please select Date Range Type.";
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
      GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA Claims', strMsg, AlertTypeEnum.DANGER)
      return false;
    }

    return true;
  }

  onClearSearch() {
    this.totalRecords = 0;
    this.lstHcfaClaims = undefined;

    this.searchFormGroup.get("dpFrom").setValue(this.dateTimeUtil.getCurrentDateModel());
    this.searchFormGroup.get("dpTo").setValue(this.dateTimeUtil.getCurrentDateModel());
    this.searchFormGroup.get("ddLocation").setValue('');
    this.searchFormGroup.get("ddProvider").setValue('');
    this.searchFormGroup.get("ddStatus").setValue('0');
    this.searchFormGroup.get("txtClaimId").setValue('');
    this.searchFormGroup.get("ddInsuranceType").setValue('Primary');
  }

  onSearch(formData: any) {

    this.HCFAPrintForSecondary = false;
    this.totalRecords = 0;
    this.lstHcfaClaims = undefined;

    if (!this.validateSearchData(formData)) {
      return;
    }


    let searchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];

    if (formData.dpFrom != undefined && formData.dpFrom != '') {
      searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpFrom, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: formData.dateType });
    }
    if (formData.dpTo != undefined && formData.dpTo != '') {
      searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpTo, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: formData.dateType });
    }

    if (formData.ddLocation != undefined && formData.ddLocation != '') {
      searchCriteria.param_list.push({ name: "location_id", value: formData.ddLocation, option: "" });
    }
    if (formData.ddProvider != undefined && formData.ddProvider != '') {
      searchCriteria.param_list.push({ name: "providedr_id", value: formData.ddProvider, option: "" });
    }

    if (formData.txtClaimId != undefined && formData.txtClaimId != '') {
      searchCriteria.param_list.push({ name: "claim_id", value: formData.txtClaimId, option: "" });
    }

    if (formData.ddStatus != undefined && formData.ddStatus != '') {
      searchCriteria.param_list.push({ name: "hcfa_printed", value: formData.ddStatus, option: "" });
    }

    if (formData.ddInsuranceType != undefined && formData.ddInsuranceType != '') {
      searchCriteria.param_list.push({ name: "insurance_type", value: formData.ddInsuranceType, option: "" });

      if (formData.ddInsuranceType == 'Secondary') {
        this.HCFAPrintForSecondary = true;
      }
    }

    if (formData.ddClaimType != undefined && formData.ddClaimType != '') {
      searchCriteria.param_list.push({ name: "claim_type", value: formData.ddClaimType, option: "" });
    }
    else {
      searchCriteria.param_list.push({ name: "claim_type", value: "P", option: "" });
    }

    this.isLoading = true;
    this.reportsService.getHcfaClaims(searchCriteria).subscribe(
      data => {

        this.lstHcfaClaims = data as Array<any>;

        if (this.lstHcfaClaims != undefined && this.lstHcfaClaims.length > 0) {
          this.totalRecords = this.lstHcfaClaims.length;
        }
        this.isLoading = false;


      },
      error => {
        this.isLoading = false;
        this.getHcfaClaimsError(error);
      }
    );
  }

  getHcfaClaimsError(error) {
    this.logMessage.log("getHcfaClaims Error." + error);

    GeneralOperation
  }

  selectedRow = 0;
  onSelectionChange(index: number) {
    this.selectedRow = index;
  }


  selectAll(option: boolean) {
    debugger;

    this.lstHcfaClaims.forEach(claim => {
      claim.selected = option;
    });
  }

  selectClaim(option: boolean, index: number) {
    debugger;
    this.lstHcfaClaims[index].selected = option;
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

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    debugger;
    this.sortEvent = sortEvent;
    this.sort();
  }
  private sort() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstHcfaClaims, this.headers, this.sortEvent, null, null, 'hcfaClaims');
    this.lstHcfaClaims = sortFilterPaginationResult.list;
  }

  exportAsXLSX() {

    if (this.lstHcfaClaims == undefined || this.lstHcfaClaims.length == 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', "There is no record to export.", AlertTypeEnum.INFO)
    }
    else {
      let lstColumns: Array<any> = new Array<any>();
      lstColumns = [
        new ExcelColumn('claim_id', 'Claim Id'),
        new ExcelColumn('dos', 'DOS'),
        new ExcelColumn('alternate_account', 'PID'),
        new ExcelColumn('patient_name', 'Patient Name'),
        new ExcelColumn('insurance_name', 'Insurance'),
        new ExcelColumn('facility_name', 'Facility Name'),
        new ExcelColumn('provider', 'Provider'),
        new ExcelColumn('location', 'Location'),
        new ExcelColumn('cptlist', 'CPT List'),
        new ExcelColumn('listicd', 'ICD List'),
        new ExcelColumn('claim_total', 'Claim Total'),
        new ExcelColumn('hcfa_printed', 'HCFA Printed')
      ]

      this.excel.exportAsExcelFileWithHeaders(this.lstHcfaClaims, lstColumns, 'HCFA Claims');
    }
  }

  lstSubmissionProccessedClaimInfo: Array<SubmissionProccessedClaimInfo>;
  updateAsProcessed() {

    this.lstSubmissionProccessedClaimInfo = new Array<any>();

    let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeString();

    if (this.lstHcfaClaims != undefined && this.lstHcfaClaims.length > 0) {

      this.lstHcfaClaims.forEach(claim => {

        if (claim.selected != undefined && claim.selected == true) {

          let submissionProccessedClaimInfo: SubmissionProccessedClaimInfo = new SubmissionProccessedClaimInfo();
          submissionProccessedClaimInfo.claim_id = claim.claim_id;
          submissionProccessedClaimInfo.is_resubmitted = claim.is_resubmitted;
          if (claim.insurance_name != undefined && claim.insurance_name != '') {
            submissionProccessedClaimInfo.has_primary_ins = true;
            submissionProccessedClaimInfo.insurance_name = claim.insurance_name;
          }
          if (claim.sec_insurance != undefined && claim.sec_insurance != '') {
            submissionProccessedClaimInfo.has_secondary_ins = true;
          }
          if (claim.sec_insurance != undefined && claim.sec_insurance != '') {
            submissionProccessedClaimInfo.has_secondary_ins = true;
          }
          submissionProccessedClaimInfo.user_name = this.lookupList.logedInUser.user_name;
          submissionProccessedClaimInfo.submission_method = SubmissionMethodEnum.HCFA;
          submissionProccessedClaimInfo.is_bill_to_secondary = this.HCFAPrintForSecondary;
          submissionProccessedClaimInfo.practice_id = this.lookupList.practiceInfo.practiceId;
          submissionProccessedClaimInfo.client_date_time = clientDateTime;
          submissionProccessedClaimInfo.add_claim_note = true;



          this.lstSubmissionProccessedClaimInfo.push(submissionProccessedClaimInfo);
        }

      });
    }


    if (this.lstSubmissionProccessedClaimInfo == undefined || this.lstSubmissionProccessedClaimInfo.length == 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA Claim', "Please select claim.", AlertTypeEnum.WARNING)
    }
    else {

      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Claim Status!';
      modalRef.componentInstance.promptMessage = 'Do you want to mark selected claim(s) as Processed?';
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      let closeResult;

      modalRef.result.then((result) => {
        debugger;
        if (result == PromptResponseEnum.YES) {
          this.isProcessing = true;
          this.billingService.updateProcessedClaims(this.lstSubmissionProccessedClaimInfo).subscribe(
            data => {
              if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {

                this.lstHcfaClaims.forEach(claim => {
                  if (claim.selected != undefined && claim.selected == true) {
                    claim.hcfa_printed = true;
                  }
                });
              }
              else
                if (data['status'] === ServiceResponseStatusEnum.ERROR) {
                  this.isProcessing = false;
                  GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', data['response'], AlertTypeEnum.DANGER)
                }
              this.isProcessing = false;
            },
            error => {
              debugger;
              this.isProcessing = false;
              GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', "An Error Occured saving record..", AlertTypeEnum.DANGER)
            }
          );
        }
      }, (reason) => {
        //alert(reason);
      });
    }

  }

  printHCFA() {

    let claimIds: string = '';
    let printWithBg: boolean = false;

    if (this.lstHcfaClaims != undefined && this.lstHcfaClaims.length > 0) {

      this.lstHcfaClaims.forEach(claim => {

        if (claim.selected != undefined && claim.selected == true) {

          if (claimIds != '') {
            claimIds += ',';
          }
          claimIds += claim.claim_id;
        }

      });
    }


    if (claimIds == undefined || claimIds == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA Claim', "Please select claim.", AlertTypeEnum.WARNING)
    }
    else {

      const modalRef = this.ngbModal.open(HcfaPrintOptionPopupComponent, this.popUpOptions);
      let closeResult;

      modalRef.result.then((result) => {
        debugger;

        if (result != null) {

          if (result.confirmation == PromptResponseEnum.OK) {
            printWithBg = result.printWithBg;

            this.lstSubmissionProccessedClaimInfo = undefined;
            this.isProcessing = true;
            let searchCriteria: SearchCriteria = new SearchCriteria();
            searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
            searchCriteria.param_list = [
              { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" },
              { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: "" },
              { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
              { name: "claim_ids", value: claimIds, option: "" },
              { name: "bill_to_insurance_type", value: this.HCFAPrintForSecondary == true ? 'Secondary' : 'Primary', option: "" },
              { name: "with_bg", value: printWithBg, option: "" }
            ];

            this.billingService.generateHCFA(searchCriteria).subscribe(
              data => {
                this.printHCFASuccess(data);
              },
              error => {
                this.printHCFAError(error);
              }
            );


          }
        }

      }, (reason) => {
        //alert(reason);
      });
    }
  }


  printHCFASuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.isProcessing = false;
      this.openHcfa(data.response);
      this.lstSubmissionProccessedClaimInfo = data.response_list;
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isProcessing = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', data.response, AlertTypeEnum.DANGER)
    }
  }

  printHCFAError(error: any) {
    this.isProcessing = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', "An Error Occured while generating HCFA.", AlertTypeEnum.DANGER)
  }

  openHcfa(hcfaLink: string) {

    debugger;

    this.isProcessing = true;
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    //searchCriteria.criteria = this.downloadPath + "/" + document.link;    
    searchCriteria.param_list = [
      { name: "category", value: 'HCFA', option: "" },
      { name: "link", value: hcfaLink, option: "" }
    ];

    this.generalService.getDocumentBytes(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.isProcessing = false;
          if (data != null && data != undefined) {
            this.openHcfaResponse(data);
          }
          else {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', "HCFA File not found.", AlertTypeEnum.DANGER)
          }
        },
        error => {
          alert(error);
          this.isProcessing = false;
        }
      );

  }

  openHcfaResponse(data: any) {

    this.isProcessing = false;
    var file = new Blob([data], { type: 'application/pdf' });//, {type: 'application/pdf'}
    let fileUrl = URL.createObjectURL(file);

    const modalRef = this.ngbModal.open(HcfaViewerComponent, this.popUpOptionsLarge);
    modalRef.componentInstance.url = fileUrl;

    modalRef.result.then((result) => {
      //this.updateProcessedClaims();
    }
      , (reason) => {
        //this.updateProcessedClaims();
      });

  }

}
