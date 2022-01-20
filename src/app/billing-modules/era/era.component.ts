import { Component, OnInit, Inject, Input, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { LogMessage } from 'src/app/shared/log-message';
import { BillingService } from 'src/app/services/billing/billing.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { CallingFromEnum, AlertTypeEnum, PatientSubTabsEnum, ServiceResponseStatusEnum, PaymentPostingOptionEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { AdjustmentCodesGlossarayComponent } from '../payment/adjustment-codes-glossaray/adjustment-codes-glossaray.component';
import { ListFilterContainsAnyGeneral } from 'src/app/shared/filter-pipe-contains-any-general';
import { EraProviderAdjustmentComponent } from './era-provider-adjustment/era-provider-adjustment.component';
import { GeneralService } from 'src/app/services/general/general.service';
import * as FileSaver from 'file-saver';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';

@Component({
  selector: 'era',
  templateUrl: './era.component.html',
  styleUrls: ['./era.component.css']
})
export class EraComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  @Input() eraIdSearch: number;
  @Input() patientIdSearch: number;
  @Input() claimIdSearch: number;

  @ViewChild('inlineSearchDenialPatient') inlineSearchDenialPatient: InlinePatientSearchComponent;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  //headersEra: QueryList<NgbdSortableHeader>;
  //headersEraClaim: QueryList<NgbdSortableHeader>;
  sortEventEra: SortEvent;
  sortEventEraClaim: SortEvent;

  isLoading: boolean = false;
  showPatientSearch: boolean = false;
  isProcessing: boolean = false;

  showDenials: boolean = false;
  showImportERAFromText: boolean = false;

  selectedEraClaimStatus: string = "Pending";

  searchFormGroup: FormGroup;

  lstStatus: Array<string> = ['All', 'Pending', 'Posted'];
  lstERAAmountOperator: Array<string> = ["=", ">=", "<="];

  controlUniqueId: string = "";

  lstEra: Array<any>;
  lstEraClaim: Array<any>;
  lstEraClaimFiltered: Array<any>;
  lstEraClaimService: Array<any>;

  objEraDetail: any;
  objEraClaimDetail: any;


  eraCount: number = 0;
  eraClaimCount: number = 0;
  eraClaimServiceCount: number = 0;


  loadingCount: number = 0;

  eraId: number;
  eraClaimId: number;
  ehrClaimDOS: string;
  ehrClaimDue: number;

  ehrClaimInsuranceType: string = "";
  ehrClaimInsuranceName: string = "";
  ehrClaimInsurancePolicyNo: string = "";

  ehrPatientId: number;
  ehrClaimId: number;
  ehrPriStatus: string = "";
  ehrSecStatus: string = "";
  ehrOthStatus: string = "";
  ehrPayerId: string = "";
  ehrInsuranceId: number;
  ehrPatientName: string = "";


  mappedInsurance: string = "";// primary|secondary|other

  priInsId: number;
  secInsId: number;
  OthInsId: number;
  priInsName: string = '';
  secInsName: string = '';
  OthInsName: string = '';
  priInsPolicyNo: string = '';
  secInsPolicyNo: string = '';
  OthInsPolicyNo: string = '';


  claimNotfound: boolean;

  //Payer Variables
  strPayerName: string = "";
  strPayerID: string = "";
  strPayerAddress: string = "";
  strPayerCity: string = "";
  strPayerZip: string = "";
  strPayerState: string = "";


  //Payee Variables			
  strPayeeName: string = "";
  strPayeeID: string = "";
  strPayeeAdditionalID: string = "";
  strPayeeAddress: string = "";
  strPayeeCity: string = "";
  strPayeeZip: string = "";
  strPayeeState: string = "";

  strPayeeIDQualifier: string = "";
  strPayeeAdditionalIDQualifier: string = "";



  //Check Varialbes.			
  strCheckNo: string = "";
  checkAmount: number = 0;
  strCheckDate: string = "";
  strProductionDate: string = "";
  providerAdjustmentAmount: number = 0;



  //Claim Detail			
  amtBilled: number;
  amtPaid: number;
  claimInterest: number;
  claimAdjustedAmt: number;
  patResponsibiltiy: number;

  claimIdFromEra: string = '';
  earClaimStatus: string = '';
  earClaimStatusCode: string = '';
  payerClaimControlNo: string = '';
  claimStartDate: string = '';
  claimEndDate: string = '';

  eraPatientName: string = '';
  patientIdentification: string = '';
  patientIdentificationQualifier: string = '';
  subscriberName: string = '';
  subscriberNameCorrected: string = '';
  subscriberIdentification: string = '';
  subscriberIdentificationQualifier: string = '';
  subscriberIdentificationCorrected: string = '';
  subscriberIdentificationCorrectedQualifier: string = '';

  renderingProviderName: string = '';
  renderingProviderIdentification: string = '';
  renderingProviderIdentificationQualifier: string = '';

  adjustCodes: string = '';
  remarksCodes: string = '';
  patReasonCode: string = '';

  isEraPosted: boolean = false;
  isEraClaimPosted: boolean = false;
  isEhrClaimSelfPay: boolean = false;

  isBillingAdmin: boolean = false;

  eraError: string = '';
  eraFileLink: string = '';


  isEraListExpanded: boolean = true;

  duplicateEOBId: string = '';

  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private paymentService: PaymentService,
    private logMessage: LogMessage,
    private billingService: BillingService,
    private ngbModal: NgbModal,
    private openModuleService: OpenModuleService,
    private claimService: ClaimService,
    private generalService: GeneralService,
    private sortFilterPaginationService: SortFilterPaginationService) { }

  ngOnInit() {


    debugger;
    /*
    try {

      if (this.headers != undefined) {

        let eraHeaderTemp: Array<any> = new Array<any>();
        let eraClaimHeaderTemp: Array<any> = new Array<any>();

        this.headers.forEach(header => {
          if (header.table == 'era') {
            eraHeaderTemp.push(header);
          }
          else if (header.table == 'era_claim') {
            eraClaimHeaderTemp.push(header);
          }
        });

        this.headersEra.reset(eraHeaderTemp);
        this.headersEraClaim.reset(eraClaimHeaderTemp);
      }


    } catch (error) {

    }
    */

    debugger;
    this.buildForm();

    if (this.lookupList.logedInUser.user_name.toUpperCase() == "BILL@IHC"
      || this.lookupList.logedInUser.user_name.toUpperCase() == "FS@IHC"
      || this.lookupList.logedInUser.user_name.toUpperCase() == "ABASIT@IHC"
      || this.lookupList.logedInUser.user_name.toUpperCase() == "JAWAD@IHC") {
      this.isBillingAdmin = true;
    }

    if (this.callingFrom == CallingFromEnum.ERA) {
      this.loadPendingEra();
    }
    else if (this.callingFrom == CallingFromEnum.CLAIM_PAYMENT || this.callingFrom == CallingFromEnum.DENIAL) {
      this.selectedEraClaimStatus = 'All';
      this.loadERAByEraId();
    }
  }

  buildForm() {

    this.controlUniqueId = this.callingFrom;

    let currentDateModel = this.dateTimeUtil.getCurrentDateModel();

    this.searchFormGroup = this.formBuilder.group({
      ddStatus: this.formBuilder.control(this.callingFrom == 'era' ? 'Pending' : 'All'),
      txtEraId: this.formBuilder.control(''),
      txtClaimId: this.formBuilder.control(''),
      txtPayerId: this.formBuilder.control(''),
      txtCheckNumber: this.formBuilder.control(''),
      txtCheckAmount: this.formBuilder.control(''),
      ddCheckAmountOperator: this.formBuilder.control(''),


      dpCheckFrom: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpCheckTo: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),

      dpDOSFrom: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpDOSTo: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),

      dpCreatedFrom: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpCreatedTo: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),

      txtPatientSearch: this.formBuilder.control(''),
      txtICN: this.formBuilder.control(''),

      chkFileWithError: this.formBuilder.control(false),
      chkFileNotProccessed: this.formBuilder.control(false),
      chkNotificationOnly: this.formBuilder.control(false)

    }
    );
  }

  onPatientSearchKeydown(event) {

    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else if (event.key == 'ArrowDown') {

      this.shiftFocusToPatSearch();
      // event.preventDefault();
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


  validateSearchData(formData: any): boolean {

    debugger;
    let strMsg: string = '';

    if (strMsg == '') {
      if (formData.dpCheckFrom != undefined && formData.dpCheckFrom != '' && !this.dateTimeUtil.isValidDateTime(formData.dpCheckFrom, DateTimeFormat.DATE_MODEL)) {
        strMsg = "Check Date From is not in correct formate.";
      }
      else if (formData.dpCheckTo != undefined && formData.dpCheckTo != '' && !this.dateTimeUtil.isValidDateTime(formData.dpCheckTo, DateTimeFormat.DATE_MODEL)) {
        strMsg = "Check Date To is not in correct formate.";
      }
      else if (formData.dpCheckFrom != undefined && formData.dpCheckFrom != '' && formData.dpCheckTo != undefined && formData.dpCheckTo != '') {
        strMsg = this.dateTimeUtil.validateDateFromDateTo(formData.dpCheckFrom, formData.dpCheckTo, DateTimeFormat.DATE_MODEL, true, true);
      }
    }
    if (strMsg == '') {
      if (formData.dpDOSFrom != undefined && formData.dpDOSFrom != '' && !this.dateTimeUtil.isValidDateTime(formData.dpDOSFrom, DateTimeFormat.DATE_MODEL)) {
        strMsg = "DOS From is not in correct formate.";
      }
      else if (formData.dpDOSTo != undefined && formData.dpDOSTo != '' && !this.dateTimeUtil.isValidDateTime(formData.dpDOSTo, DateTimeFormat.DATE_MODEL)) {
        strMsg = "DOS To is not in correct formate.";
      }
      else if (formData.dpDOSFrom != undefined && formData.dpDOSFrom != '' && formData.dpDOSTo != undefined && formData.dpDOSTo != '') {
        strMsg = this.dateTimeUtil.validateDateFromDateTo(formData.dpDOSFrom, formData.dpDOSTo, DateTimeFormat.DATE_MODEL, false, true);
      }
    }

    if (strMsg == '') {
      if (formData.dpCreatedFrom != undefined && formData.dpCreatedFrom != '' && !this.dateTimeUtil.isValidDateTime(formData.dpCreatedFrom, DateTimeFormat.DATE_MODEL)) {
        strMsg = "Date Created From is not in correct formate.";
      }
      else if (formData.dpCreatedTo != undefined && formData.dpCreatedTo != '' && !this.dateTimeUtil.isValidDateTime(formData.dpCreatedTo, DateTimeFormat.DATE_MODEL)) {
        strMsg = "Date Created To is not in correct formate.";
      }
      else if (formData.dpCreatedFrom != undefined && formData.dpCreatedFrom != '' && formData.dpCreatedTo != undefined && formData.dpCreatedTo != '') {
        strMsg = this.dateTimeUtil.validateDateFromDateTo(formData.dpCreatedFrom, formData.dpCreatedTo, DateTimeFormat.DATE_MODEL, false, true);
      }
    }
    if (strMsg == '') {

      if (formData.txtCheckAmount != undefined && formData.txtCheckAmount != '' && (formData.ddCheckAmountOperator == undefined && formData.ddCheckAmountOperator == '')) {
        strMsg = "Please select criteria for check amount.";
      }
    }

    if (strMsg == '' && (formData.ddStatus == 'All' || formData.ddStatus == 'Posted')) {

      let isAdditionalRequiredDataProvided: boolean = false;

      if (formData.dpCheckFrom != undefined && formData.dpCheckFrom != '' && formData.dpCheckTo != undefined && formData.dpCheckTo != '') {
        isAdditionalRequiredDataProvided = true;
      }
      else if (formData.dpDOSFrom != undefined && formData.dpDOSFrom != '' && formData.dpDOSTo != undefined && formData.dpDOSTo != '') {
        isAdditionalRequiredDataProvided = true;
      }
      else if (formData.dpCreatedFrom != undefined && formData.dpCreatedFrom != '' && formData.dpCreatedTo != undefined && formData.dpCreatedTo != '') {
        isAdditionalRequiredDataProvided = true;
      }
      else if ((formData.txtEraId != undefined && formData.txtEraId != '')
        || (formData.txtClaimId != undefined && formData.txtClaimId != '')
        || (formData.txtCheckNumber != undefined && formData.txtCheckNumber != '')
        || (formData.txtCheckAmount != undefined && formData.txtCheckAmount != '' && formData.ddCheckAmountOperator != undefined && formData.ddCheckAmountOperator != '')
        || (this.patientIdSearch != undefined && this.patientIdSearch > 0)
        || (formData.txtICN != undefined && formData.txtICN != '')
        || (formData.chkFileWithError != undefined && formData.chkFileWithError != '')
        || (formData.chkFileNotProccessed != undefined && formData.chkFileNotProccessed != '')
        || (formData.chkNotificationOnly != undefined && formData.chkNotificationOnly != '')
      ) {
        isAdditionalRequiredDataProvided = true;
      }

      if (!isAdditionalRequiredDataProvided) {
        strMsg = "Please enter at least one additional search criteria";
      }
    }
    if (strMsg != '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', strMsg, AlertTypeEnum.DANGER)
      return false;
    }
    return true;
  }

  eraSearchCriteria: SearchCriteria;
  loadPendingEra() {

    this.clearAll();
    //this.eraError = '';
    //this.eraId = undefined;
    //this.patientId = undefined;
    //this.claimId = undefined;

    this.eraSearchCriteria = new SearchCriteria();

    this.eraSearchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.eraSearchCriteria.param_list = [{ name: "status", value: 'Pending', option: "" }];

    this.getERAList();
  }

  loadERAByEraId() {

    this.clearAll();
    this.eraSearchCriteria = new SearchCriteria();

    this.eraSearchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.eraSearchCriteria.param_list = [{ name: "era_id", value: this.eraIdSearch, option: "" }];

    if (this.claimIdSearch != undefined) {
      this.eraSearchCriteria.param_list.push({ name: "claim_id", value: this.claimIdSearch, option: "" });
    }

    this.getERAList();
  }

  //eraSearchClaimCriteriaMain: SearchCriteria;

  clearAll() {

    this.eraError = '';
    this.lstEra = undefined;
    this.lstEraClaim = undefined;
    this.lstEraClaimFiltered = undefined;
    this.lstEraClaimService = undefined;

    this.objEraDetail = undefined;
    this.objEraClaimDetail = undefined;
    //this.lstAdjustmentCodesGlossary = undefined;

    this.eraCount = 0;
    this.eraClaimCount = 0;
    this.eraClaimServiceCount = 0;


    this.clearEraDetail();
    this.clearEraClaimDetail();
    this.clearInsuranceInfo();
  }


  onSearch(formData: any) {

    this.clearAll();

    this.eraIdSearch = undefined;
    this.claimIdSearch = undefined;

    //this.patientIdSearch = undefined;


    if (!this.validateSearchData(formData)) {
      return;
    }


    this.eraSearchCriteria = new SearchCriteria();
    //this.eraSearchClaimCriteriaMain = new SearchCriteria();

    this.eraSearchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.eraSearchCriteria.param_list = [];

    if (formData.ddStatus != undefined && formData.ddStatus != '') {
      this.eraSearchCriteria.param_list.push({ name: "status", value: formData.ddStatus, option: "" });
    }

    if (formData.txtEraId != undefined && formData.txtEraId != '') {
      this.eraIdSearch = formData.txtEraId;
      this.eraSearchCriteria.param_list.push({ name: "era_id", value: formData.txtEraId, option: "" });
    }

    if (formData.txtClaimId != undefined && formData.txtClaimId != '') {
      this.claimIdSearch = formData.txtClaimId;
      this.eraSearchCriteria.param_list.push({ name: "claim_id", value: formData.txtClaimId, option: "" });
      //this.eraSearchClaimCriteriaMain.param_list.push({ name: "claim_id", value: formData.txtClaimId, option: "" });
    }

    if (formData.txtPayerId != undefined && formData.txtPayerId != '') {
      this.eraSearchCriteria.param_list.push({ name: "payer_number", value: formData.txtPayerId, option: "" });
    }

    if (formData.txtCheckNumber != undefined && formData.txtCheckNumber != '') {
      this.eraSearchCriteria.param_list.push({ name: "check_number", value: formData.txtCheckNumber, option: "" });
    }

    if (formData.txtCheckAmount != undefined && formData.txtCheckAmount != '' && formData.ddCheckAmountOperator != undefined && formData.ddCheckAmountOperator != '') {
      this.eraSearchCriteria.param_list.push({ name: "check_amount", value: formData.txtCheckAmount, option: formData.ddCheckAmountOperator });
    }

    if (formData.dpCheckFrom != undefined && formData.dpCheckFrom != '') {
      this.eraSearchCriteria.param_list.push({ name: "check_date_from", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpCheckFrom, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: '' });
    }
    if (formData.dpCheckTo != undefined && formData.dpCheckTo != '') {
      this.eraSearchCriteria.param_list.push({ name: "check_date_to", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpCheckTo, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: '' });
    }
    if (formData.dpDOSFrom != undefined && formData.dpDOSFrom != '') {
      this.eraSearchCriteria.param_list.push({ name: "dos_from", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpDOSFrom, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: '' });
      //this.eraSearchClaimCriteriaMain.param_list.push({ name: "dos_from", value: this.dateTimeUtil.getstringDateFromDateModelWithFormat(formData.dpDOSFrom, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: '' });

    }
    if (formData.dpDOSTo != undefined && formData.dpDOSTo != '') {
      this.eraSearchCriteria.param_list.push({ name: "dos_to", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpDOSTo, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: '' });
      //this.eraSearchClaimCriteriaMain.param_list.push({ name: "dos_to", value: this.dateTimeUtil.getstringDateFromDateModelWithFormat(formData.dpDOSTo, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: '' });
    }

    if (formData.dpCreatedFrom != undefined && formData.dpCreatedFrom != '') {
      this.eraSearchCriteria.param_list.push({ name: "date_created_from", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpCreatedFrom, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: '' });
    }
    if (formData.dpCreatedTo != undefined && formData.dpCreatedTo != '') {
      this.eraSearchCriteria.param_list.push({ name: "date_created_to", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpCreatedTo, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: '' });
    }
    if (this.patientIdSearch != undefined) {
      this.eraSearchCriteria.param_list.push({ name: "patient_id", value: this.patientIdSearch, option: "" });
      //this.eraSearchClaimCriteriaMain.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
    }

    if (formData.txtICN != undefined && formData.txtICN != '') {
      this.eraSearchCriteria.param_list.push({ name: "icn_number", value: formData.txtICN, option: "" });
    }

    if (formData.chkFileWithError != undefined && formData.chkFileWithError != '') {
      this.eraSearchCriteria.param_list.push({ name: "file_with_error", value: formData.chkFileWithError, option: "" });
    }
    if (formData.chkFileNotProccessed != undefined && formData.chkFileNotProccessed != '') {
      this.eraSearchCriteria.param_list.push({ name: "file_not_processed", value: formData.chkFileNotProccessed, option: "" });
    }
    if (formData.chkNotificationOnly != undefined && formData.chkNotificationOnly != '') {
      this.eraSearchCriteria.param_list.push({ name: "notification_only", value: formData.chkNotificationOnly, option: "" });
    }

    this.getERAList();
  }


  getERAList() {
    this.isLoading = true;

    //this.eraCount = 0;
    //this.eraClaimCount = 0;
    //this.eraClaimServiceCount = 0;

    //this.lstEra = undefined;
    //this.lstEraClaim = undefined;
    //this.lstEraClaimFiltered = undefined;

    //this.lstEraClaimService = undefined;

    //this.objEraDetail = undefined;
    //this.objEraClaimDetail = undefined;

    //this.lstAdjustmentCodesGlossary = undefined;

    //this.clearEraDetail();
    //this.clearAll();

    this.loadingCount = 1;
    this.eraCount = 0;
    this.duplicateEOBId = undefined;

    this.billingService.getEraList(this.eraSearchCriteria).subscribe(
      data => {

        debugger;
        this.lstEra = data as Array<any>;
        this.loadingCount--;

        if (this.lstEra != undefined && this.lstEra.length > 0) {
          this.eraCount = this.lstEra.length;
          this.onEraSelectionChange(this.lstEra[0], true);
        }
        else {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.getEraListError(error);
      }
    );
  }

  getEraListError(error) {
    this.logMessage.log("getEraList Error." + error);
  }

  getERADetail() {

    this.objEraDetail = undefined;
    //this.clearEraDetail();
    this.billingService.getEraDetails(this.eraId).subscribe(
      data => {

        if (data != undefined && (data as Array<any>).length > 0) {
          this.objEraDetail = (data as Array<any>)[0];

          this.loadingCount++;
          this.getEOBId();
        }
        this.assignERAValues();
        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.getEraDetailsError(error);
      }
    );
  }

  getEraDetailsError(error) {
    this.logMessage.log("getEraDetails Error." + error);
  }

  getERAClaimList() {


    this.isLoading = true;

    this.eraClaimCount = 0;
    this.eraClaimServiceCount = 0;

    this.lstEraClaim = undefined;
    this.lstEraClaimFiltered = undefined;
    this.lstEraClaimService = undefined;

    this.objEraClaimDetail = undefined;

    //this.lstAdjustmentCodesGlossary = undefined;

    this.clearEraClaimDetail();
    this.clearInsuranceInfo();

    let eraClaimCriteria: SearchCriteria;
    eraClaimCriteria = new SearchCriteria();//this.eraSearchClaimCriteriaMain;

    eraClaimCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    eraClaimCriteria.param_list = [];
    eraClaimCriteria.param_list.push({ name: "era_id", value: this.eraId, option: "" });
    eraClaimCriteria.param_list.push({ name: "status", value: this.selectedEraClaimStatus, option: "" });

    if (this.eraSearchCriteria != undefined && this.eraSearchCriteria.param_list != undefined) {

      this.eraSearchCriteria.param_list.forEach(param => {

        switch (param.name) {
          case 'claim_id':
          case 'dos_from':
          case 'dos_to':
          case 'patient_id':
            eraClaimCriteria.param_list.push(param);
            break;

          default:
            break;
        }

      });

    }
    this.eraClaimCount = 0;
    this.billingService.getEraClaimList(eraClaimCriteria).subscribe(
      data => {

        debugger;
        this.lstEraClaim = data as Array<any>;
        this.lstEraClaimFiltered = data as Array<any>;



        this.loadingCount--;

        if (this.lstEraClaimFiltered != undefined && this.lstEraClaimFiltered.length > 0) {
          this.eraClaimCount = this.lstEraClaimFiltered.length;
          this.onEraClaimSelectionChange(this.lstEraClaimFiltered[0], true);
        }

        if (this.loadingCount <= 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.getEraClaimListError(error);
      }
    );
  }

  getEraClaimListError(error) {
    this.logMessage.log("getEraClaimListError Error." + error);
  }


  getEOBId() {


    this.duplicateEOBId = undefined;

    let searchCriteria: SearchCriteria;
    searchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];
    searchCriteria.param_list.push({ name: "check_number", value: this.objEraDetail.check_number, option: "" });
   // searchCriteria.param_list.push({ name: "check_date", value: this.objEraDetail.check_date, option: "" });
    searchCriteria.param_list.push({ name: "check_amount", value: this.objEraDetail.check_amount, option: "" });


    this.billingService.getEOBIdByCriteria(searchCriteria).subscribe(
      data => {

        if (data['status'] == ServiceResponseStatusEnum.SUCCESS) {
          this.duplicateEOBId = data['result'];
        }

        /*
        else if(data['status']==ServiceResponseStatusEnum.NOT_FOUND){

        }
        else if(data['status']==ServiceResponseStatusEnum.ERROR){

        }
        */

        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.getEOBIdError(error);
      }
    );
  }

  getEOBIdError(error) {
    this.logMessage.log("getEOBId Error." + error);
  }

  getERAClaimDetail() {

    this.objEraClaimDetail = undefined;
    this.ehrClaimDOS = '';
    this.ehrClaimDue = 0;
    this.mappedInsurance = ''

    this.billingService.getEraClaimDetail(this.lookupList.practiceInfo.practiceId, this.eraClaimId).subscribe(
      data => {

        if (data != undefined && data != null) {
          this.objEraClaimDetail = data as any;

          if (this.objEraClaimDetail.ehr_claim_id != undefined && this.objEraClaimDetail.ehr_claim_id > 0) {
            this.ehrClaimId = this.objEraClaimDetail.ehr_claim_id;
            this.claimNotfound = false;
            this.loadingCount++;
            this.getClaimInsurance();
          }
        }
        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.assignEraClaimValues();
          this.fetchMappedInsurance();
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.getEraClaimDetailsError(error);
      }
    );
  }

  getEraClaimDetailsError(error) {
    this.logMessage.log("getEraClaimDetails Error." + error);
  }

  getEraClaimServices() {

    this.lstEraClaimService = undefined;
    //this.lstAdjustmentCodesGlossary = [];
    // this.lstAdjustmentCodesGlossaryProcessing = [];
    // this.lstAdjustGroupCodesUnique = undefined;


    this.eraClaimServiceCount = 0;

    this.billingService.getEraClaimServices(this.eraClaimId).subscribe(
      data => {

        debugger;
        this.lstEraClaimService = data as Array<any>;
        this.eraClaimServiceCount = this.lstEraClaimService.length;

        if (!this.loadEraClaimServicesOnly) {
          this.loadingCount--;
          if (this.loadingCount <= 0) {
            this.assignEraClaimValues();
            this.fetchMappedInsurance();
            this.isLoading = false;
          }
        }
        else {
          this.loadEraClaimServicesOnly = false;
          this.isLoading = false;
        }

      },
      error => {
        this.isLoading = false;
        this.getEraClaimServicesError(error);
      }
    );
  }

  getEraClaimServicesError(error) {
    this.logMessage.log("getEraClaimServices Error." + error);
  }

  getClaimInsurance() {

    this.claimService.getClaimInsurance(this.ehrClaimId, false).subscribe(
      data => {

        let lstClaimInsurance = data as Array<any>;

        if (lstClaimInsurance != undefined) {

          lstClaimInsurance.forEach(ins => {


            if (ins.insurace_type.toLowerCase() == "primary") {
              this.priInsId = ins.insurance_id;
              this.priInsName = ins.name;
              this.priInsPolicyNo = ins.policy_number != undefined ? ins.policy_number.toUpperCase() : '';
            }
            else if (ins.insurace_type.toLowerCase() == "secondary") {
              this.secInsId = ins.insurance_id;
              this.secInsName = ins.name;
              this.secInsPolicyNo = ins.policy_number != undefined ? ins.policy_number.toUpperCase() : '';
            }
            else if (ins.insurace_type.toLowerCase() == "other") {
              this.OthInsId = ins.insurance_id;
              this.OthInsName = ins.name;
              this.OthInsPolicyNo = ins.policy_number != undefined ? ins.policy_number.toUpperCase() : '';
            }
          });

        }

        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.assignEraClaimValues();
          this.fetchMappedInsurance();
          this.isLoading = false;
        }
      },
      error => {
        this.loadingCount--;
        this.isLoading = false;
        this.getClaimInsuranceError(error);
      }
    );
  }

  getClaimInsuranceError(error: any) {
    this.logMessage.log("getClaimInsurance Error." + error);
  }

  fetchMappedInsurance() {

    this.mappedInsurance = '';

    if (this.ehrInsuranceId != undefined && this.ehrInsuranceId > 0) {

      if (this.ehrInsuranceId == this.priInsId && this.ehrClaimInsurancePolicyNo.toUpperCase() == this.priInsPolicyNo.toUpperCase()) {
        this.mappedInsurance = 'primary'
      }
      else if (this.ehrInsuranceId == this.secInsId && this.ehrClaimInsurancePolicyNo.toUpperCase() == this.secInsPolicyNo.toUpperCase()) {
        this.mappedInsurance = 'secondary'
      }
      else if (this.ehrInsuranceId == this.OthInsId && this.ehrClaimInsurancePolicyNo.toUpperCase() == this.OthInsPolicyNo.toUpperCase()) {
        this.mappedInsurance = 'other'
      }
    }
  }

  onEraSelectionChange(eraObj: any, forceFetch: boolean) {

    debugger;
    if (this.eraId != eraObj.era_id || forceFetch) {

      this.eraClaimId = undefined;
      this.isEraClaimPosted = undefined;


      this.clearEraDetail();
      this.clearEraClaimDetail();
      this.clearInsuranceInfo();
      this.lstEraClaimService = undefined;

      this.eraId = eraObj.era_id;

      this.isEraPosted = eraObj.posted;
      this.eraError = eraObj.error_detail;
      this.eraFileLink = eraObj.file_path;

      if (this.eraError == undefined || this.eraError == '') {

        if (!eraObj.is_processed) {
          this.eraError = "ERA File Not Processed.";
        }
      }


      if (this.eraError == undefined || this.eraError == '') {

        this.loadingCount = 2;
        this.getERADetail();
        this.getERAClaimList();

      }
      else {
        this.isLoading = false;
      }
    }

  }
  onEraClaimSelectionChange(objEraClaim: any, forceFetch: boolean) {

    debugger;
    if (this.eraClaimId != objEraClaim.era_claim_id || forceFetch) {
      this.isLoading = true;

      this.lstEraClaimService = undefined;
      this.clearEraClaimDetail();
      this.clearInsuranceInfo();
      this.eraClaimId = objEraClaim.era_claim_id;
      this.isEraClaimPosted = objEraClaim.posted;

      this.loadingCount = 2;
      this.getERAClaimDetail();
      this.getEraClaimServices();

      //debugger;

      /*
      if (objEraClaim.claim_exist) {
        this.ehrClaimId = objEraClaim.claim_id;
        this.claimNotfound = false;
        this.loadingCount++;
        this.getClaimInsurance();
      }
      */


      //else {
      //this.ehrClaimId = undefined;
      //this.claimNotfound = true;
      //this.priInsId = undefined;
      //this.secInsId = undefined;
      //this.OthInsId = undefined;
      //this.mappedInsurance = '';
      //this.ehrPatientName = '';
      //this.isEraClaimPosted = undefined;
      //}

      //this.isLoading = false;
    }

  }

  selectAllServices(select: boolean) {
    if (this.lstEraClaimService != undefined) {
      this.lstEraClaimService.forEach(service => {

        if (!service.payment_posted && !service.denial_posted) {
          service.selected = select;
        }
      });
    }
  }
  selectService(select: boolean, index: number) {
    this.lstEraClaimService[index].selected = select;
  }




  assignERAValues(): void {


    if (this.objEraDetail != undefined) {

      //strERAID = eraDetail.era_id;
      // this.eraFileLink = this.objEraDetail.file_path;

      //Payer 
      this.strPayerName = this.objEraDetail.payer_name;
      this.strPayerID = this.objEraDetail.payer_identifier;
      this.strPayerAddress = this.objEraDetail.payer_address;
      this.strPayeeCity = this.objEraDetail.payer_city;
      this.strPayeeZip = this.objEraDetail.payer_zip;
      this.strPayeeState = this.objEraDetail.payer_state;

      //Payee 			
      this.strPayeeName = this.objEraDetail.payee_name;
      this.strPayeeID = this.objEraDetail.payee_identifier_code;
      this.strPayeeIDQualifier = this.getIdentificationQualifierName("PROVIDER_IDENTIFICATION", this.objEraDetail.payee_identifier_code_qualifier);

      this.strPayeeAdditionalIDQualifier = this.getIdentificationQualifierName("PROVIDER_IDENTIFICATION", this.objEraDetail.additional_payee_identifier_code_qualifier);
      this.strPayeeAdditionalID = this.objEraDetail.additional_payee_identifier_code;
      this.strPayeeAddress = this.objEraDetail.payee_address;
      this.strPayeeCity = this.objEraDetail.payee_city;
      this.strPayeeZip = this.objEraDetail.payee_zip;
      this.strPayeeState = this.objEraDetail.payee_state;


      //Check 			
      this.strCheckNo = this.objEraDetail.check_number;
      this.checkAmount = this.objEraDetail.check_amount;
      this.strCheckDate = this.objEraDetail.check_date;
      this.strProductionDate = this.objEraDetail.production_date;

      //Provider Adjustment
      this.providerAdjustmentAmount = this.objEraDetail.provider_adjustment;
    }
    else {
      this.clearEraDetail();
    }

  }

  getIdentificationQualifierName(IdentifierType: string, qualifier: string): string {
    if (qualifier == null)
      return "";

    var strQualifierName: string = "";

    var arrTemp: Array<string> = qualifier.split(", ");

    for (var i: number = 0; i < arrTemp.length; i++) {
      if (IdentifierType.toUpperCase() == "SUBSCRIBER_IDENTIFICATION" || IdentifierType.toUpperCase() == "PATIENT_IDENTIFICATION") {
        if (strQualifierName != "") {
          strQualifierName += ", ";
        }
        switch (arrTemp[i].toUpperCase()) {
          case "34":
            strQualifierName += "Social Security Number";
            break;
          case "HN":
            strQualifierName += "Health Insurance Claim (HIC) Number";
            break;
          case "II":
            strQualifierName += "United States National Individual Identifier";
            break;
          case "MI":
          case "1W":
            strQualifierName += "Member Identification Number";
            break;
          case "MR":
            strQualifierName += "Medicaid Recipient Identification Number";
            break;
          case "C":
            strQualifierName += "Insured’s Changed Unique Identification Number";
            break;
          case "1L":
            strQualifierName += "Group or Policy Number";
            break;
          default:
            strQualifierName += arrTemp[i].toUpperCase();
            break;
        }
      }

      else if (IdentifierType.toUpperCase() == "PROVIDER_IDENTIFICATION") {
        if (strQualifierName != "") {
          strQualifierName += ", ";
        }
        switch (arrTemp[i].toUpperCase()) {
          case "0B":
            strQualifierName += "State License Number";
            break;
          case "1A":
            strQualifierName += "Blue Cross Provider Number";
            break;
          case "1B":
            strQualifierName += "Blue Shield Provider Number";
            break;
          case "1C":
            strQualifierName += "Medicare Provider Number";
            break;
          case "1D":
            strQualifierName += "Medicaid Provider Number";
            break;
          case "1G":
            strQualifierName += "Provider UPIN Number";
            break;
          case "1H":
            strQualifierName += "CHAMPUS Identification Number";
            break;
          case "D3":
            strQualifierName += "National Association of Boards of Pharmacy Number";
            break;
          case "G2":
            strQualifierName += "Provider Commercial Number";
            break;
          case "XX":
            strQualifierName += "Health Care Financing Administration National Provider Identifier";
            break;
          case "FI":
            strQualifierName += "Federal Taxpayer’s Identification Number";
            break;
          case "PQ":
            strQualifierName += "Payee Identification";
            break;
          case "TJ":
            strQualifierName += "Federal Taxpayer’s Identification Number";
            break;
          default:
            strQualifierName += arrTemp[i].toUpperCase();
            break;
        }
      }
    }
    return strQualifierName;
  }


  clearEraDetail() {

    this.duplicateEOBId = undefined;

    this.objEraDetail = undefined;

    this.eraId = undefined;
    this.isEraPosted = undefined;
    this.eraError = '';
    this.eraFileLink = '';


    //Payer 
    this.strPayerName = "";
    this.strPayerID = "";
    this.strPayerAddress = "";
    this.strPayerCity = '';
    this.strPayerZip = '';
    this.strPayerState = '';


    //Payee 			
    this.strPayeeName = "";
    this.strPayeeID = "";
    this.strPayeeAdditionalID = "";
    this.strPayeeAddress = "";
    this.strPayeeCity = '';
    this.strPayeeZip = '';
    this.strPayeeState = '';

    this.strPayeeIDQualifier = "";
    this.strPayeeAdditionalIDQualifier = "";

    //Check .			
    this.strCheckNo = "";
    this.checkAmount = 0;
    this.strCheckDate = "";
    this.strProductionDate = "";
    this.providerAdjustmentAmount = 0;
  }

  clearEraClaimDetail() {

    debugger;

    this.claimNotfound = true;
    this.ehrClaimId = undefined;
    this.ehrClaimDOS = '';
    this.ehrClaimDue = 0;

    this.ehrClaimInsuranceType = '';
    this.ehrClaimInsuranceName = '';
    this.ehrClaimInsurancePolicyNo = '';
    //this.ehrClaimId = this.objEraClaimDetail.ehr_claim_id;
    this.ehrPriStatus = '';
    this.ehrSecStatus = '';
    this.ehrOthStatus = '';
    this.ehrPatientId = undefined;
    this.ehrPatientName = '';
    this.ehrPayerId = '';
    this.ehrClaimInsuranceType = '';
    this.ehrInsuranceId = undefined;


    this.amtBilled = 0;
    this.amtPaid = 0;

    this.claimInterest = 0;
    this.claimAdjustedAmt = 0;
    this.patResponsibiltiy = 0;
    this.claimIdFromEra = '';
    this.earClaimStatus = '';
    this.payerClaimControlNo = '';
    this.claimStartDate = '';
    this.claimEndDate = '';
    this.eraPatientName = '';
    this.patientIdentification = '';
    this.patientIdentificationQualifier = '';
    this.subscriberName = '';
    this.subscriberNameCorrected = '';
    this.subscriberIdentification = '';
    this.subscriberIdentificationCorrected = '';
    this.subscriberIdentificationCorrectedQualifier = '';
    this.renderingProviderName = '';
    this.renderingProviderIdentification = '';
    this.renderingProviderIdentificationQualifier = '';
    this.adjustCodes = '';
    this.remarksCodes = '';
    this.patReasonCode = '';
    this.isEraClaimPosted = undefined;
    this.isEhrClaimSelfPay = undefined;

  }

  clearInsuranceInfo() {
    this.priInsId = undefined;
    this.secInsId = undefined;
    this.OthInsId = undefined;
    this.priInsName = 'N/A';
    this.secInsName = 'N/A';
    this.OthInsName = 'N/A';
    this.priInsPolicyNo = 'N/A';
    this.secInsPolicyNo = 'N/A';
    this.OthInsPolicyNo = 'N/A';
    this.mappedInsurance = '';
  }


  assignEraClaimValues() {

    if (this.objEraClaimDetail != undefined) {

      this.ehrClaimDOS = this.objEraClaimDetail.dos;
      this.ehrClaimDue = Number(this.objEraClaimDetail.amt_due);

      this.ehrClaimInsuranceType = this.objEraClaimDetail.ehr_insurace_type;
      this.ehrClaimInsuranceName = this.objEraClaimDetail.ehr_insurance_name;
      this.ehrClaimInsurancePolicyNo = this.objEraClaimDetail.policy_number != undefined ? this.objEraClaimDetail.policy_number.toUpperCase() : '';
      //this.ehrClaimId = this.objEraClaimDetail.ehr_claim_id;
      this.ehrPriStatus = this.objEraClaimDetail.ehr_pri_status;
      this.ehrSecStatus = this.objEraClaimDetail.ehr_sec_status;
      this.ehrOthStatus = this.objEraClaimDetail.ehr_oth_status;
      this.ehrPatientId = this.objEraClaimDetail.ehr_patient_id;
      this.ehrPatientName = this.objEraClaimDetail.ehr_patient_name;
      this.ehrPayerId = this.objEraClaimDetail.ehr_payer_id;
      this.ehrClaimInsuranceType = this.objEraClaimDetail.ehr_insurace_type;
      this.ehrInsuranceId = this.objEraClaimDetail.ehr_insurance_id;


      this.amtBilled = this.objEraClaimDetail.claim_billed_amount;
      this.amtPaid = this.objEraClaimDetail.claim_paid_amount;

      this.claimInterest = this.objEraClaimDetail.claim_interest;
      this.claimAdjustedAmt = this.objEraClaimDetail.claim_adj_amount;
      this.patResponsibiltiy = this.objEraClaimDetail.patient_responsibility;

      this.claimIdFromEra = this.objEraClaimDetail.claim_id;
      //earClaimIdStatus = this.objEraClaimDetail.claim_status_code;

      this.earClaimStatus = this.getClaimStatusName(this.objEraClaimDetail.claim_status_code);

      if (this.objEraClaimDetail.crossover_carrier_name != null && this.objEraClaimDetail.crossover_carrier_name != "") {
        this.earClaimStatus += "\n" + this.objEraClaimDetail.crossover_carrier_name
      }

      this.payerClaimControlNo = this.objEraClaimDetail.payer_claim_control_number;
      this.claimStartDate = this.objEraClaimDetail.claim_statement_period_start;
      this.claimEndDate = this.objEraClaimDetail.claim_statemnent_period_end;
      this.eraPatientName = this.objEraClaimDetail.patient_lname + ", " + this.objEraClaimDetail.patient_fname;
      this.patientIdentification = this.objEraClaimDetail.patient_identifier;
      this.patientIdentificationQualifier = this.getIdentificationQualifierName("PATIENT_IDENTIFICATION", this.objEraClaimDetail.patient_identifier_qualfier);

      this.subscriberName = this.objEraClaimDetail.subscriber_lname + ", " + this.objEraClaimDetail.subscriber_fname;
      this.subscriberNameCorrected = this.objEraClaimDetail.corrected_insured_lname + ", " + this.objEraClaimDetail.corrected_insured_fname;
      this.subscriberIdentification = this.objEraClaimDetail.subscriber_identifier;
      this.subscriberIdentificationQualifier = this.getIdentificationQualifierName("SUBSCRIBER_IDENTIFICATION", this.objEraClaimDetail.subscriber_identifier_qualfier);
      this.subscriberIdentificationCorrected = this.objEraClaimDetail.corrected_insured_identifier;
      this.subscriberIdentificationCorrectedQualifier = this.getIdentificationQualifierName("SUBSCRIBER_IDENTIFICATION", this.objEraClaimDetail.corrected_insured_identifier);
      this.renderingProviderName = this.objEraClaimDetail.rendering_provider_lname + ", " + this.objEraClaimDetail.rendering_provider_fname;
      this.renderingProviderIdentification = this.objEraClaimDetail.rendering_provider_identifier;
      this.renderingProviderIdentificationQualifier = this.getIdentificationQualifierName("PROVIDER_IDENTIFICATION", this.objEraClaimDetail.rendering_provider_identifier_qualifier);
      this.adjustCodes = this.objEraClaimDetail.claim_adj_codes;
      this.remarksCodes = this.objEraClaimDetail.claim_remark_codes;
      this.patReasonCode = this.objEraClaimDetail.patient_responsibility_reason_code;




      this.isEhrClaimSelfPay = this.objEraClaimDetail.self_pay;

      //SetInsuranceMappedColors();

    }
    else {
      this.clearEraClaimDetail();
    }

  }

  getClaimStatusName(status_code: string): string {
    var strStatus: string = "";

    switch (status_code.toUpperCase()) {
      case "1":
        strStatus = "Processed as Primary";
        break;
      case "2":
        strStatus = "Processed as Secondary";
        break;
      case "3":
        strStatus = "Processed as Tertiary";
        break;
      case "4":
        strStatus = "Denied";
        break;
      case "19":
        strStatus = "Processed as Primary, \nForwarded to Additional Payer(s)";
        break;
      case "20":
        strStatus = "Processed as Secondary,\nForwarded to Additional Payer(s)";
        break;
      case "21":
        strStatus = "Processed as Tertiary,\nForwarded to Additional Payer(s)";
        break;
      case "22":
        strStatus = "Reversal of Previous Payment";
        break;
      case "23":
        strStatus = "Not Our Claim, \nForwarded to Additional Payer(s)";
        break;
      case "24":
        strStatus = "Predetermination Pricing Only - No Payment";
        break;
      default:
        strStatus = status_code.toUpperCase();
        break;
    }

    return strStatus;
  }


  showAdjustmentCodesGlossary() {

    let lstAdjustCodes: Array<any> = [];
    let lstRemarksCodes: Array<any> = [];

    if (this.lstEraClaimService != undefined) {

      this.lstEraClaimService.forEach(service => {


        let lst: Array<string> = service.adjust_codes.split(",");

        if (lst != undefined && lst.length > 0) {

          lst.forEach(code => {

            if (code != undefined && code != '') {

              let adjCodeFound: boolean = false;
              lstAdjustCodes.forEach(addedCode => {
                if (addedCode == code) {
                  adjCodeFound = true;
                }
              });
              if (!adjCodeFound) {
                lstAdjustCodes.push(code);
              }
            }
          });
        }



        let lstRemaksSplitted: Array<string> = service.remark_codes.split(",");
        if (lstRemaksSplitted != undefined && lstRemaksSplitted.length > 0) {
          lstRemaksSplitted.forEach(rCode => {

            if (rCode != undefined && rCode != '') {
              let remCodeFound: boolean = false;
              lstRemarksCodes.forEach(addedCode => {
                if (addedCode == rCode) {
                  remCodeFound = true;
                }
              });
              if (!remCodeFound) {
                lstRemarksCodes.push(rCode);
              }
            }

          });
        }
      });
    }

    if (lstAdjustCodes != undefined && lstAdjustCodes.length > 0) {
      const modalRef = this.ngbModal.open(AdjustmentCodesGlossarayComponent, this.popUpOptionsLg);
      modalRef.componentInstance.lstAdjustCodes = lstAdjustCodes;
      modalRef.componentInstance.lstRemarksCodes = lstRemarksCodes;
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Adjustment Codes Glossary', "There is not adjust/remarks code.", AlertTypeEnum.INFO)
    }
  }

  openClaim() {

    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = this.ehrPatientId;
    obj.patient_name = this.ehrPatientName;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = this.ehrClaimId;
    this.openModuleService.openPatient.emit(obj);
  }

  eraClaimStatusChange(status: string) {

    this.selectedEraClaimStatus = status;
    this.clearEraClaimDetail();
    this.clearInsuranceInfo();
    this.lstEraClaimService = undefined;
    this.eraClaimId = undefined;
    //this.ehrClaimId = undefined;
    //this.claimNotfound = true;
    //this.priInsId = undefined;
    //this.secInsId = undefined;
    //this.OthInsId = undefined;
    //this.mappedInsurance = '';
    //this.ehrPatientName = '';

    if (this.eraId != undefined && this.eraId > 0) {
      this.loadingCount = 1;
      this.getERAClaimList();
    }
  }

  onEraClaimPatientFilter(strPat: string) {

    if (strPat != undefined && strPat != '') {
      let filterObj: any = { patient_fname: strPat, patient_lname: strPat };
      this.lstEraClaimFiltered = new ListFilterContainsAnyGeneral().transform(this.lstEraClaim, filterObj);
    }
    else {
      this.lstEraClaimFiltered = this.lstEraClaim;
    }

    this.eraClaimCount = this.lstEraClaimFiltered.length;

    if (this.lstEraClaimFiltered != undefined && this.lstEraClaimFiltered.length > 0) {
      this.onEraClaimSelectionChange(this.lstEraClaimFiltered[0], true);
    }
    else {

      this.clearEraClaimDetail();
      this.clearInsuranceInfo();

      this.lstEraClaimService = undefined;
      this.eraClaimId = undefined;
      //this.ehrClaimId = undefined;
      //this.claimNotfound = true;
      //this.priInsId = undefined;
      //this.secInsId = undefined;
      //this.OthInsId = undefined;
      //this.mappedInsurance = '';
      //this.ehrPatientName = '';

    }
  }

  showEraProviderAdjusment() {
    if (this.eraId != undefined && this.eraId > 0) {
      const modalRef = this.ngbModal.open(EraProviderAdjustmentComponent, this.popUpOptionsLg);
      modalRef.componentInstance.eraId = this.eraId;
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Provider Adjustment (PLB)', "No Era is selected.", AlertTypeEnum.INFO)
    }
  }

  onDownloadERA() {


    debugger;

    if (this.eraFileLink == undefined || this.eraFileLink == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "ERA File not found.", AlertTypeEnum.INFO)
      return;
    }

    this.isProcessing = true;
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    //searchCriteria.criteria = this.downloadPath + "/" + document.link;    
    searchCriteria.param_list = [
      { name: "category", value: 'ERA', option: "" },
      { name: "link", value: this.eraFileLink, option: "" }
    ];

    this.generalService.getDocumentBytes(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.isProcessing = false;
          if (data != null && data != undefined) {

            /*
            if (data['status'] == ServiceResponseStatusEnum.SUCCESS) {

              let encodedBase64 = data['bytes'];
              let decodedString = atob(encodedBase64)

              this.SaveEraFile(decodedString, this.eraId.toString() + ".RMT");
            }
            else {
              GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data['error_message'], AlertTypeEnum.DANGER)
            }
            */

            this.SaveEraFile(data, this.eraId.toString() + ".RMT");


          }
          else {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "ERA File not found.", AlertTypeEnum.DANGER)
          }
        },
        error => {
          alert(error);
          this.isProcessing = false;
        }
      );

  }
  SaveEraFile(data: any, name: string) {
    var file = new Blob([data], { type: 'text/plain' });
    FileSaver.saveAs(file, name);
  }

  mapEraClaimServicesIds() {

    debugger;
    let strEraClaimServiceIds: string = '';


    if (this.lstEraClaimService != undefined && this.lstEraClaimService.length > 0) {
      this.lstEraClaimService.forEach(service => {
        if (service.selected) {
          if (strEraClaimServiceIds != "") {
            strEraClaimServiceIds += ",";
          }
          strEraClaimServiceIds += "'" + service.era_claim_service_id + "'";

        }
      });
    }


    if (this.eraId == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "No ERA is selected.", AlertTypeEnum.DANGER);
      return;
    }
    else if (this.ehrClaimId == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "EHR Claim not found.", AlertTypeEnum.DANGER);
      return;
    }
    else if (strEraClaimServiceIds == undefined || strEraClaimServiceIds == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "No Claim Service is selected.", AlertTypeEnum.DANGER);
      return;
    }

    let searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "era_claim_service_ids", value: strEraClaimServiceIds, option: "" },
      { name: "claim_id", value: this.ehrClaimId, option: "" },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: "" }
    ];

    this.billingService.mapEraClaimServicesIds(searchCriteria).subscribe(
      data => {
        this.mapEraClaimServicesIdsSuccess(data);
      },
      error => {
        this.mapEraClaimServicesIdsError(error);
      }
    );
  }

  loadEraClaimServicesOnly: boolean = false;
  mapEraClaimServicesIdsSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.isLoading = true;
      this.loadEraClaimServicesOnly = true;
      this.getEraClaimServices();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.response, AlertTypeEnum.DANGER)

    }
  }

  mapEraClaimServicesIdsError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "An Error Occured while mapping era claim services", AlertTypeEnum.DANGER)

  }

  //postDuplicate: number = -1;
  //postInterest: number = -1;
  searchCriteriaPostEra: SearchCriteria = new SearchCriteria();
  paymentPostingOption: PaymentPostingOptionEnum;
  postErapaymentCPTWise() {

    if (this.eraId == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "No ERA is selected.", AlertTypeEnum.DANGER);
      return;
    }
    else if (this.ehrClaimId == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "EHR Claim not found.", AlertTypeEnum.DANGER);
      return;
    }
    if (this.mappedInsurance == undefined || this.mappedInsurance == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Claim Insurance is missing or does not match with ERA.", AlertTypeEnum.DANGER);
      return;
    }
    else if (

      (this.mappedInsurance == 'primary' && this.ehrPriStatus == 'P')
      || (this.mappedInsurance == 'secondary' && this.ehrSecStatus == 'P')
      || (this.mappedInsurance == 'other' && this.ehrOthStatus == 'P')

    ) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Selected Claim is already paid. Please check or enter it manually.", AlertTypeEnum.DANGER);
      return;
    }
    else if (this.isEraClaimPosted) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Selected ERA Claim has already been posted.", AlertTypeEnum.DANGER);
      return;
    }
    else if (this.isEhrClaimSelfPay) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Selected Claim is Self Pay.", AlertTypeEnum.DANGER);
      return;
    }

    let strEraClaimServiceIds: string = '';
    if (this.lstEraClaimService != undefined && this.lstEraClaimService.length > 0) {
      this.lstEraClaimService.forEach(service => {
        if (service.selected) {
          if (strEraClaimServiceIds != "") {
            strEraClaimServiceIds += ",";
          }
          strEraClaimServiceIds += service.era_claim_service_id;
        }
      });
    }

    if (strEraClaimServiceIds == undefined || strEraClaimServiceIds == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "No Claim Service is selected.", AlertTypeEnum.DANGER);
      return;
    }

    //this.postDuplicate = -1;
    //this.postInterest = -1;

    this.searchCriteriaPostEra = new SearchCriteria();
    this.searchCriteriaPostEra.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteriaPostEra.param_list = [
      { name: "posting_option", value: PaymentPostingOptionEnum.CPT_WISE, option: "" },
      { name: "post_duplicate", value: '-1', option: '' },
      { name: "post_interest", value: '-1', option: '' },
      { name: "era_id", value: this.eraId, option: '' },
      { name: "era_claim_id", value: this.eraClaimId, option: '' },
      { name: "era_claim_service_ids", value: strEraClaimServiceIds, option: '' },
      { name: "check_date", value: this.strCheckDate, option: '' },
      { name: "check_no", value: this.strCheckNo, option: '' },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
      { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
      { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
    ];
    this.postEraPayment(PaymentPostingOptionEnum.CPT_WISE);
  }

  postErapaymentFull() {

    if (this.eraId == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "No ERA is selected.", AlertTypeEnum.DANGER);
      return;
    }

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Action!';
    modalRef.componentInstance.promptMessage = "Are you sure you want to Post Full ERA ?";
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {

        this.searchCriteriaPostEra = new SearchCriteria();
        this.searchCriteriaPostEra.practice_id = this.lookupList.practiceInfo.practiceId;
        this.searchCriteriaPostEra.param_list = [
          { name: "posting_option", value: PaymentPostingOptionEnum.FULL_ERA, option: "" },
          { name: "post_duplicate", value: '0', option: '' },
          { name: "post_interest", value: '0', option: '' },
          { name: "era_id", value: this.eraId, option: '' },
          //{ name: "era_claim_id", value: undefined, option: '' },
          //{ name: "era_claim_service_ids", value: '', option: '' },
          { name: "check_date", value: this.strCheckDate, option: '' },
          { name: "check_no", value: this.strCheckNo, option: '' },
          { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
          { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
          { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
        ];
        this.postEraPayment(PaymentPostingOptionEnum.FULL_ERA);
      }
    }, (reason) => {
    });
  }

  postEraPayment(postingOption: PaymentPostingOptionEnum) {
    this.paymentPostingOption = postingOption;
    this.isProcessing = true;
    this.billingService.postERAPayment(this.searchCriteriaPostEra).subscribe(
      data => {
        this.isProcessing = false;
        this.postERAPaymentSuccess(data);
      },
      error => {
        this.isProcessing = false;
        this.searchCriteriaPostEra = undefined;
        this.postERAPaymentError(error);
      }
    );
  }

  postERAPaymentSuccess(data: any) {
    debugger;

    if (data.message_type == 'ALERT') {
      if (data.status == 'ERROR') {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.message, AlertTypeEnum.DANGER);
      }
      else if (data.status == 'INFO') {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.message, AlertTypeEnum.INFO);
      }
      else if (data.status == 'SUCCESS') {

        let msg: string = '';

        if (data.payment_posted > 0) {
          msg += "<span class='text-success'>";
        }
        else {
          msg += "<span class='text-danger'>";
        }
        msg += "Payment Posted : " + data.payment_posted + '</span><br>';

        if (data.denial_posted > 0) {
          msg += "<span class='text-danger'>";
        }
        else {
          msg += "<span class='text-success'>";
        }
        msg += "Denial Posted : " + data.denial_posted + '</span><br>';

        GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', msg, AlertTypeEnum.SUCCESS);

        for (let i: number = 0; i < this.lstEra.length; i++) {
          if (this.lstEra[i].era_id == this.eraId) {
            this.onEraSelectionChange(this.lstEra[i], true);
            break;
          }
        }

        /*
        if (this.paymentPostingOption == PaymentPostingOptionEnum.FULL_ERA) {
          for (let i: number = 0; i < this.lstEra.length; i++) {
            if (this.lstEra[i].era_id == this.eraId) {
              this.lstEra[i].posted = 1;
              this.onEraSelectionChange(this.lstEra[i], true);
              break;
            }
          }
        }
        else if (this.paymentPostingOption == PaymentPostingOptionEnum.CPT_WISE) {
          for (let i: number = 0; i < this.lstEraClaimFiltered.length; i++) {
            if (this.lstEraClaimFiltered[i].era_claim_id == this.eraClaimId) {             
              this.onEraClaimSelectionChange(this.lstEraClaimFiltered[i], true);
              break;
            }
          }
        }
        */
      }
      this.searchCriteriaPostEra = undefined;
    }
    else if (data.message_type == 'CONFIRMATION') {

      if (data.status == 'DUPLICATE_POSTING_CONFIRMATION_REQUIRED') {

        const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
        modalRef.componentInstance.promptHeading = 'Confirm Action!';
        modalRef.componentInstance.promptMessage = data.message;
        modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;

        modalRef.result.then((result) => {
          debugger;
          if (result == PromptResponseEnum.YES) {

            this.searchCriteriaPostEra.param_list.forEach(param => {
              if (param.name == 'post_duplicate') {
                param.value = "1";
              }
            });
            this.postEraPayment(this.paymentPostingOption);
          }
        }, (reason) => {
        });

      }
      else if (data.status == 'INTEREST_CONFIRMATION_REQUIRED') {

        const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
        modalRef.componentInstance.promptHeading = 'Confirm Action!';
        modalRef.componentInstance.promptMessage = data.message;
        modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;

        modalRef.result.then((result) => {
          debugger;
          if (result == PromptResponseEnum.YES) {
            this.searchCriteriaPostEra.param_list.forEach(param => {
              if (param.name == 'post_interest') {
                param.value = "1";
              }
            });
            this.postEraPayment(this.paymentPostingOption);
          }
        }, (reason) => {
        });

      }

    }
  }

  postERAPaymentError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "An Error Occured while Posting Payment", AlertTypeEnum.DANGER)
  }

  importERAFromGatewayEdi() {

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

    this.billingService.importERAFromGatewayEdi(searchCriteria).subscribe(
      data => {
        this.isProcessing = false;
        this.importERAFromGatewayEdiSuccess(data);
      },
      error => {
        this.isProcessing = false;
        this.importERAFromGatewayEdiError(error);
      }
    );

  }

  importERAFromGatewayEdiSuccess(data: any) {
    debugger;

    if (data.message_type == 'ERROR') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.message, AlertTypeEnum.DANGER)
    }
    else if (data.message_type == 'INFO') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.message, AlertTypeEnum.INFO)
    }
    else if (data.message_type == 'SUCCESS') {

      let msg: string = ''

      if (data.total_files != null && data.total_files != undefined) {
        msg += "<span class='font-weight-500'>" + "Total Files : " + data.total_files + '</span><br>';
      }
      if (data.downloaded != null && data.downloaded != undefined) {
        if (data.downloaded > 0) {
          msg += "<span class='text-success'>";
        }
        else {
          msg += "<span class='text-danger'>";
        }
        msg += "Files Downloaded : " + data.downloaded + '</span><br>';
      }
      if (data.processed != null && data.processed != undefined) {
        if (data.processed > 0) {
          msg += "<span class='text-success'>";
        }
        else {
          msg += "<span class='text-danger'>";
        }
        msg += "Files Processed : " + data.processed + '</span><br>';
      }
      if (data.errors != null && data.errors != undefined) {
        msg += "<span class='text-danger'>" + "Errors : " + data.errors + '</span><br>';
      }
      if (data.invalid_files != null && data.invalid_files != undefined) {
        msg += "<span class='text-danger'>" + "Invalid Files : " + data.invalid_files + '</span><br>';
      }
      if (data.empty_files != null && data.empty_files != undefined) {
        msg += "<span class='text-danger'>" + "Empty Files : " + data.empty_files + '</span>';
      }

      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', msg, AlertTypeEnum.SUCCESS)
    }

  }

  importERAFromGatewayEdiError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "An Error Occured while getting ERA from Gateway EDI", AlertTypeEnum.DANGER)
  }

  onDeleteEra() {

    if (this.eraId == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "No ERA is selected.", AlertTypeEnum.DANGER);
    }
    else {
      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Action!';
      modalRef.componentInstance.promptMessage = 'Do you want to delete selected ERA?';
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;

      modalRef.result.then((result) => {
        debugger;
        if (result == PromptResponseEnum.YES) {
          let deleteRecordData = new ORMDeleteRecord();
          deleteRecordData.column_id = this.eraId.toString();
          deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
          deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
          deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

          this.billingService.deleteERA(deleteRecordData)
            .subscribe(
              data => {

                if (data['status'] == ServiceResponseStatusEnum.SUCCESS) {
                  if (this.lstEra != undefined && this.lstEra.length > 0) {

                    debugger;

                    for (let i: number = (this.lstEra.length - 1); i >= 0; i--) {
                      debugger;
                      if (this.lstEra[i].era_id == this.eraId) {
                        debugger;
                        this.lstEra.splice(i, 1)
                        this.eraCount = this.lstEra.length;

                        if (this.lstEra.length > 0) {

                          if (i < this.lstEra.length) {
                            this.onEraSelectionChange(this.lstEra[i], true);
                          }
                          else if (i == this.lstEra.length) {
                            this.onEraSelectionChange(this.lstEra[i - 1], true);
                          }
                          else {
                            this.onEraSelectionChange(this.lstEra[0], true);
                          }
                        }
                        break;
                      }
                    }
                  }
                }
                else if (data['status'] === ServiceResponseStatusEnum.ERROR) {
                  GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data['response'], AlertTypeEnum.DANGER)
                }

              },
              error => alert(error),
              () => this.logMessage.log("ERA has benn deleted Successfull.")
            );
        }
      }, (reason) => {
      });
    }
  }


  insIdToMap: number;
  insTypeToMap: string = '';
  mapEraClaimPaymentInsurance(insType: string, insId: number) {

    if (insType == undefined || insType == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Insurance Type not provided.", AlertTypeEnum.DANGER)
    }
    else if (insId == undefined || insId <= 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Insurance ID not found.", AlertTypeEnum.DANGER)
    }
    else if (this.eraClaimId == undefined || this.eraClaimId <= 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "ERA Claim ID not found.", AlertTypeEnum.DANGER)
    }
    else {
      this.insIdToMap = insId;
      this.insTypeToMap = insType;
      /*
      switch (insType) {
        case 'priamry':
          this.insIdToMap = this.priInsId;
          break;
        case 'secondary':
          this.insIdToMap = this.secInsId;
          break;
        case 'other':
          this.insIdToMap = this.OthInsId;
          break;
        default:
          break;
      }
      */


      this.isProcessing = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();

      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
        { name: "era_claim_id", value: this.eraClaimId, option: "" },
        { name: "insurance_id", value: this.insIdToMap, option: "" },
        { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
        { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
        { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
      ];

      this.billingService.mapEraClaimPaymentInsurance(searchCriteria).subscribe(
        data => {
          this.isProcessing = false;
          this.mapEraClaimPaymentInsuranceSuccess(data);
        },
        error => {
          this.isProcessing = false;
          this.mapEraClaimPaymentInsuranceError(error);
        }
      );
    }


  }

  mapEraClaimPaymentInsuranceSuccess(data: any) {
    debugger;

    if (data.status == ServiceResponseStatusEnum.SUCCESS) {
      this.isLoading = true;
      this.loadingCount = 1;
      this.getERAClaimDetail();
    }
    else if (data.status == ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.message, AlertTypeEnum.DANGER)
    }
  }

  mapEraClaimPaymentInsuranceError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "An Error Occured while mapping Insurnce", AlertTypeEnum.DANGER)
  }


  marAsPostedOption: string = '';
  markAsPosted(dateOption: string, id: number) {

    if (id == undefined || id <= 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', dateOption + " Id not found.", AlertTypeEnum.DANGER)
    }

    this.marAsPostedOption = dateOption;

    this.isProcessing = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "data_option", value: dateOption, option: "" },
      { name: "id", value: id, option: "" },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
      { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
      { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
    ];

    this.billingService.markAsPosted(searchCriteria).subscribe(
      data => {
        this.isProcessing = false;
        this.markAsPostedSuccess(data);
      },
      error => {
        this.isProcessing = false;
        this.markAsPostedError(error);
      }
    );
  }

  markAsPostedSuccess(data: any) {
    debugger;

    if (data.status == ServiceResponseStatusEnum.SUCCESS) {

      if (this.marAsPostedOption == 'ERA') {

        for (let i: number = 0; i < this.lstEra.length; i++) {
          if (this.lstEra[i].era_id == this.eraId) {
            this.lstEra[i].posted = 1;
            this.onEraSelectionChange(this.lstEra[i], true);
            break;
          }
        }

      }
      if (this.marAsPostedOption == 'ERA_CLAIM') {

        for (let i: number = 0; i < this.lstEraClaim.length; i++) {
          if (this.lstEraClaim[i].era_claim_id == this.eraClaimId) {
            this.lstEraClaim[i].posted = 1;
            break;
          }
        }
        for (let i: number = 0; i < this.lstEraClaimFiltered.length; i++) {
          if (this.lstEraClaimFiltered[i].era_claim_id == this.eraClaimId) {
            this.lstEraClaimFiltered[i].posted = 1;
            this.onEraClaimSelectionChange(this.lstEraClaimFiltered[i], true);
            break;
          }
        }
      }
      if (this.marAsPostedOption == 'ERA_CLAIM_SERVICE') {

        this.isLoading = true;
        this.loadingCount = 1;
        this.getEraClaimServices();
      }
    }
    else if (data.status == ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.response, AlertTypeEnum.DANGER)
    }
  }

  markAsPostedError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "An Error Occured while saving record.", AlertTypeEnum.DANGER)
  }

  expandCollapseEraList() {
    this.isEraListExpanded = !this.isEraListExpanded;
  }

  onViewDenial() {
    if (this.eraId == undefined || this.eraId <= 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Please select ERA.", AlertTypeEnum.DANGER)
    }
    else {
      this.showDenials = true;
    }

  }

  callBack() {
    this.showDenials = false;
    this.showImportERAFromText = false;
  }

  onImportFromTextClick() {
    this.showImportERAFromText = true;
  }

  importERAFromText(eraString: string) {

    if (eraString == undefined || eraString == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Please enter ERA Text.", AlertTypeEnum.DANGER)
      return;
    }
    this.isProcessing = true;
    debugger;
    let strRootUrl: string = window.location.hostname;

    let searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "era_text", value: eraString, option: "" },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
      { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
      { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
    ];

    this.billingService.importERAFromTextString(searchCriteria).subscribe(
      data => {
        this.isProcessing = false;
        this.importERAFromTextSuccess(data);
      },
      error => {
        this.isProcessing = false;
        this.importERAFromTextError(error);
      }
    );

  }

  importERAFromTextSuccess(data: any) {
    debugger;

    if (data.message_type == 'ERROR') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.message, AlertTypeEnum.DANGER)
    }
    else if (data.message_type == 'INFO') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.message, AlertTypeEnum.INFO)
    }
    else if (data.message_type == 'SUCCESS') {

      let msg: string = ''

      if (data.processed != null && data.processed != undefined) {
        if (data.processed > 0) {
          msg += "<span class='text-success'>";
        }
        else {
          msg += "<span class='text-danger'>";
        }
        msg += "Files Processed : " + data.processed + '</span><br>';
      }
      if (data.errors != null && data.errors != undefined) {
        msg += "<span class='text-danger'>" + "Errors : " + data.errors + '</span><br>';
      }
      if (data.invalid_files != null && data.invalid_files != undefined) {
        msg += "<span class='text-danger'>" + "Invalid Files : " + data.invalid_files + '</span><br>';
      }
      if (data.empty_files != null && data.empty_files != undefined) {
        msg += "<span class='text-danger'>" + "Empty Files : " + data.empty_files + '</span>';
      }

      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', msg, AlertTypeEnum.SUCCESS)
    }

  }

  importERAFromTextError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "An Error Occured while getting ERA from Gateway EDI", AlertTypeEnum.DANGER)
  }



  onSortERA(sortEvent: SortEvent) {
    debugger;
    this.sortEventEra = sortEvent;
    this.sortERA();
  }
  private sortERA() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstEra, this.headers, this.sortEventEra, null, null, 'era');
    this.lstEra = sortFilterPaginationResult.list;
  }

  onSortPatient(sortEvent: SortEvent) {
    debugger;
    this.sortEventEraClaim = sortEvent;
    this.sortPatient();
  }
  private sortPatient() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstEraClaimFiltered, this.headers, this.sortEventEraClaim, null, null, 'era_claim');
    this.lstEraClaimFiltered = sortFilterPaginationResult.list;
  }

  moveEraTo(practiceIdToMove: number, practiceName: string) {

    if (this.eraId == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Please select ERA.", AlertTypeEnum.DANGER)
      return;
    }
    if (practiceIdToMove == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "Please select Practice.", AlertTypeEnum.DANGER)
      return;
    }

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Action!';
    modalRef.componentInstance.promptMessage = "Are you sure you want to Move selected ERA to <br>\"" + practiceName + "\" ?";
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {

        this.isProcessing = true;
        let searchCriteria = new SearchCriteria();
        searchCriteria.param_list = [
          { name: "era_id", value: this.eraId, option: '' },
          { name: "practice_id_to_move", value: practiceIdToMove, option: '' },
          { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
          { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
          { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
        ];

        this.billingService.moveEraToOtherPractice(searchCriteria).subscribe(
          data => {
            this.isProcessing = false;
            this.moveEraToOtherPracticeSuccess(data);
          },
          error => {
            this.isProcessing = false;
            this.moveEraToOtherPracticeError(error);
          }
        );

      }
    }, (reason) => {
    });
  }

  moveEraToOtherPracticeSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {


      let arrResult: Array<any> = data.response.toString().split("~");

      let msg: string = "ERA has been Moved successfully <br>"
        + "Claim = " + arrResult[1] + "<br>" +
        "Claim Services = " + arrResult[2] + "<br>" +
        "Claim Adjustments = " + arrResult[3];

      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', msg, AlertTypeEnum.SUCCESS);


      if (this.lstEra != undefined && this.lstEra.length > 0) {

        //this.clearAll();

        this.clearEraClaimDetail();
        this.clearEraDetail();
        this.clearInsuranceInfo();
        this.lstEraClaim = undefined;
        this.lstEraClaimFiltered = undefined;
        this.lstEraClaimService = undefined;
        debugger;

        for (let i: number = (this.lstEra.length - 1); i >= 0; i--) {
          debugger;
          if (this.lstEra[i].era_id == Number(data.result)) {
            debugger;
            this.lstEra.splice(i, 1)

            this.eraCount = this.lstEra.length;

            if (this.lstEra.length > 0) {

              if (i < this.lstEra.length) {
                this.onEraSelectionChange(this.lstEra[i], true);
              }
              else if (i == this.lstEra.length) {
                this.onEraSelectionChange(this.lstEra[i - 1], true);
              }
              else {
                this.onEraSelectionChange(this.lstEra[0], true);
              }
            }
            break;
          }
        }
      }


    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', data.response, AlertTypeEnum.DANGER)

    }
  }

  moveEraToOtherPracticeError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'ERA', "An Error Occured while moving ERA.", AlertTypeEnum.DANGER)

    this.lookupList.logedInUser.user_name.toLowerCase()
  }

}