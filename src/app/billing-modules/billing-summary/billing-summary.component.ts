import { Component, OnInit, Inject, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { BillingService } from 'src/app/services/billing/billing.service';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { PatientSubTabsEnum, ServiceResponseStatusEnum, AlertTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { ORMSaveBatch } from 'src/app/models/billing/ORMSaveBatch';
import { ListFilterGeneral } from 'src/app/shared/filter-pipe-general';
import { ORMSaveClaimBatchDetail } from 'src/app/models/billing/ORMSaveClaimBatchDetail';
import { ClaimBatchDetailComponent } from '../claim-batch-detail/claim-batch-detail.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { InlineInsuranceSearchComponent } from 'src/app/general-modules/insurance/inline-insurance-search/inline-insurance-search.component';
import { excelService } from 'src/app/shared/excelService';

@Component({
  selector: 'billing-summary',
  templateUrl: './billing-summary.component.html',
  styleUrls: ['./billing-summary.component.css']
})
export class BillingSummaryComponent implements OnInit {

  @ViewChild('inlineSearchDenialPatient') inlineSearchDenialPatient: InlinePatientSearchComponent;
  @ViewChild('inlineSearchDenialInsurance') inlineSearchDenialInsurance: InlineInsuranceSearchComponent;

  loadmodule = false;
  searchForm: FormGroup;
  frmNewBatch: FormGroup;
  frmAddinBatch: FormGroup;
  frmBatchDates: FormGroup;
  filterProvider: FormGroup;
  listclaimlist = [];
  listclaimlistDb = [];
  listAllBatch = [];
  listFilteredBatch = [];
  listclaimbatchcount = [];
  listclaimbatchcountFiltered = [];
  closeResult: string;
  patientID = '';
  Insurance_IdSearch = '';
  searchCriteria: SearchCriteria;
  total_claim = 0;
  showPatientSearch = false;
  showInsuranceSearch = false;
  isLoading = false;
  showNewBatch = false;
  showAddinBatch = false;
  showbatchListDates = false;
  controlUniqueId = '';
  lblBatchDates = '';
  isExpand = true;
  selectedSummaryRow: number = 0;
  objSaveBatchDetail: ORMSaveClaimBatchDetail;

  dateType: string = "dos";


  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, private dateTimeUtil: DateTimeUtil, private generaloperation: GeneralOperation,
    private formBuilder: FormBuilder, private modalService: NgbModal, private billingService: BillingService,
    private openModuleService: OpenModuleService, private sortFilterPaginationService: SortFilterPaginationService,
    private excel: excelService,) { }


  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnInit() {
    this.buildForm();
    this.controlUniqueId = 'Billing_Summary_chk_';

    this.getunLockBatch();
    this.getClaimBatchCount();
    this.lblBatchDates = this.dateTimeUtil.convertDateTimeFormat(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    this.lblBatchDates += " - " + this.dateTimeUtil.convertDateTimeFormat(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
  }
  getunLockBatch() {
    this.billingService.getUnlockBatch(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.listAllBatch = data as Array<any>;
      },
      error => {
      }
    );
  }
  getClaimBatchCount() {
    debugger;
    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "date_From", value: this.dateTimeUtil.getStringDateFromDateModel((this.frmBatchDates.get('txtBatchFromDate') as FormControl).value), option: "" });
    this.searchCriteria.param_list.push({ name: "date_To", value: this.dateTimeUtil.getStringDateFromDateModel((this.frmBatchDates.get('txtBatchToDate') as FormControl).value), option: "" });
    this.searchCriteria.param_list.push({ name: "batch_Type", value: "P", option: "" });

    this.billingService.getClaimBatchCount(this.searchCriteria).subscribe(
      data => {
        this.listclaimbatchcount = data as Array<any>;
        this.listclaimbatchcountFiltered = data as Array<any>;
        this.showbatchListDates = false;
      },
      error => {
        this.showbatchListDates = false;
      }
    );
  }
  buildForm() {
    this.searchForm = this.formBuilder.group({
      dateType: this.formBuilder.control(this.dateType),
      //drpDateOption: this.formBuilder.control("DOS"),
      txtFromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      txtToDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      drpProvider: this.formBuilder.control((this.lookupList.logedInUser.defaultProvider > 0 && this.lookupList.logedInUser.defaultProvider != null) ? this.lookupList.logedInUser.defaultProvider : ''),
      drpLocation: this.formBuilder.control((this.lookupList.logedInUser.defaultLocation > 0 && this.lookupList.logedInUser.defaultLocation != null) ? this.lookupList.logedInUser.defaultLocation : ''),
      txtPatientSearch: this.formBuilder.control(""),
      drpType: this.formBuilder.control('Professional'),
      drpStatus: this.formBuilder.control('Unprocessed'),
      txtInsuranceSearch: this.formBuilder.control(""),
    }),
      this.frmNewBatch = this.formBuilder.group({
        drpNewBatchProvider: this.formBuilder.control("null"),
        txtNewBatchDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
        rbProfessional: this.formBuilder.control('professional'),
      }),
      this.frmAddinBatch = this.formBuilder.group({
        drpBatchAddinProvider: this.formBuilder.control(-1),
        drpAddinBatch: this.formBuilder.control("")
      }),
      this.frmBatchDates = this.formBuilder.group({
        rbBatchDateProfessional: this.formBuilder.control("professional"),
        txtBatchFromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
        txtBatchToDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      }),
      this.filterProvider = this.formBuilder.group({
        drpFilterProvider: this.formBuilder.control("-1")
      })

    this.searchForm.get("drpType").disable();

  }
  onFilter(frm) {
    debugger;
    if ((this.searchForm.get('txtFromDate') as FormControl).value == "" || (this.searchForm.get('txtFromDate') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Billing Summary", "Please Enter From Date", 'warning')
      return;
    }
    if ((this.searchForm.get('txtToDate') as FormControl).value == "" || (this.searchForm.get('txtToDate') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Billing Summary", "Please Enter To Date", 'warning')
      return;
    }

    let strquery = "";
    let strConditionalJoin = " and isnull(c.is_resubmitted,0)<>1 ";
    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];

    //this.searchCriteria.param_list.push({ name: "date_option", value: frm.drpDateOption, option: "" });
    this.searchCriteria.param_list.push({ name: "date_option", value: frm.dateType, option: "" });

    this.searchCriteria.param_list.push({ name: "from_date", value: this.dateTimeUtil.getStringDateFromDateModel(frm.txtFromDate), option: "" });
    this.searchCriteria.param_list.push({ name: "to_date", value: this.dateTimeUtil.getStringDateFromDateModel(frm.txtToDate), option: "" });

    if (this.patientID != '' && frm.txtPatientSearch != null && frm.txtPatientSearch != '')
      this.searchCriteria.param_list.push({ name: "patient_id", value: this.patientID, option: "" });

    if (frm.drpProvider != "" && frm.drpProvider != "null" && frm.drpProvider != null && frm.drpProvider != "All")
      this.searchCriteria.param_list.push({ name: "provider_id", value: frm.drpProvider, option: "" });

    if (frm.drpLocation != "" && frm.drpLocation != null && frm.drpLocation != "null" && frm.drpLocation != "All")
      this.searchCriteria.param_list.push({ name: "location_id", value: frm.drpLocation, option: "" });

    if (frm.drpStatus != "" && frm.drpStatus != null && frm.drpStatus != "null" && frm.drpStatus != "All")
      this.searchCriteria.param_list.push({ name: "status", value: frm.drpStatus, option: "" });

    if (frm.drpType != "" && frm.drpType != null && frm.drpType != "null")
      this.searchCriteria.param_list.push({ name: "type", value: frm.drpType, option: "" });

    if (this.Insurance_IdSearch != '' && frm.txtInsuranceSearch != null && frm.txtInsuranceSearch != '')
      this.searchCriteria.param_list.push({ name: "insurance_id", value: this.Insurance_IdSearch, option: "" });
    this.isLoading = true;
    this.billingService.getClaimBillingSummary(this.searchCriteria).subscribe(
      data => {
        this.isLoading = false;
        this.listclaimlist = data as Array<any>;
        this.listclaimlistDb = data as Array<any>;
        this.total_claim = this.listclaimlist.length;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  openPatient(data) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = data.patient_id;
    obj.patient_name = data.pname;
    this.openModuleService.openPatient.emit(obj);
  }
  openClaim(data) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = data.patient_id;
    obj.patient_name = data.pname;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = data.claim_id;
    this.openModuleService.openPatient.emit(obj);
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
    this.patientID = undefined;
  }
  onPatientSearchBlur() {
    if (this.patientID == undefined && this.showPatientSearch == false) {
      this.searchForm.get("txtPatientSearch").setValue('');
    }
  }

  openSelectPatient(patObject) {
    this.patientID = patObject.patient_id;
    this.searchForm.get("txtPatientSearch").setValue(patObject.name);
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

  onInsuranceSearchInputChange() {
    this.Insurance_IdSearch = undefined;
  }
  shiftFocusToInsSearch() {
    this.inlineSearchDenialInsurance.focusFirstIndex();
  }

  onSelectInsurance(obj) {
    debugger;
    this.Insurance_IdSearch = obj.insurance.insurance_id;
    (this.searchForm.get("txtInsuranceSearch") as FormControl).setValue(obj.insurance.insurance_name);
    this.showInsuranceSearch = false;
  }


  onInsuranceSearchFocusOut() {
    if (this.Insurance_IdSearch == undefined && this.showInsuranceSearch == false) {
      this.searchForm.get("txtInsuranceSearch").setValue('');
    }
  }


  closeInsuranceSearch() {
    this.showInsuranceSearch = false;
  }

  onAddNewbatch() {
    this.showNewBatch = false;
    (this.frmNewBatch.get("drpNewBatchProvider") as FormControl).setValue("-1");
    (this.frmNewBatch.get("txtNewBatchDate") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
  }
  onClosedNewBatch() {
    this.showNewBatch = false;
  }
  onSaveNewBatch(frm) {
    debugger;
    let objBatch: ORMSaveBatch = new ORMSaveBatch();
    let batch_type = frm.rbProfessional == 'Institutional' ? 'I' : 'P';
    let DateTimeString = this.dateTimeUtil.convertDateTimeFormat(this.dateTimeUtil.getStringDateFromDateModel(frm.txtNewBatchDate), DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_MMDDYYYY)
    if (frm.drpNewBatchProvider == "-1") {
      objBatch.batch_name = "CH_" + batch_type + "_" + DateTimeString + "_";
    }
    else {
      let index = this.generaloperation.getitemIndex(this.lookupList.billingProviderList, "id", frm.drpNewBatchProvider);
      let provider_name = this.lookupList.billingProviderList[index].name;
      objBatch.batch_name = this.generaloperation.ReplaceAll(provider_name.toString(), " ", "").split(",")[1].toString().substr(0, 1)
        + this.generaloperation.ReplaceAll(provider_name.toString(), " ", "").split(",")[0].toString().substr(0, 1)
        + "_" + batch_type + "_" + DateTimeString + "_";
    }
    objBatch.provider_id = frm.drpNewBatchProvider;
    objBatch.date = this.dateTimeUtil.getStringDateFromDateModel(frm.txtNewBatchDate);
    objBatch.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    objBatch.created_user = this.lookupList.logedInUser.user_name;
    objBatch.modified_user = this.lookupList.logedInUser.user_name;
    objBatch.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    objBatch.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    objBatch.batch_type = batch_type;

    this.billingService.addUpdateBatch(objBatch).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          GeneralOperation.showAlertPopUp(this.modalService, 'Add New Batch', 'Batch successfully created', 'success');
          this.showNewBatch = false;
          this.getunLockBatch();
          this.getClaimBatchCount();
        }
      },
      error => {
        GeneralOperation.showAlertPopUp(this.modalService, 'Add New Batch', 'Error on Created New Batch.', 'danger');
      }
    );
  }
  onClaimSelection(value, obj) {
    debugger;
    this.listclaimlist[this.generaloperation.getElementIndex(this.listclaimlist, obj)].chk = value;

  }
  onClaimSelectAll(value) {
    debugger;
    for (var i = 0; i < this.listclaimlist.length; i++) {
      this.listclaimlist[i].chk = value;
    }
  }
  onChangedrpBatchAddinProvider(value) {
    debugger;
    //event.currentTarget.value
    let filterObj: any;
    filterObj = { col3: value };
    this.listFilteredBatch = new ListFilterGeneral().transform(this.listAllBatch, filterObj);
    debugger;


    if (this.listFilteredBatch.length == 1) {
      this.frmAddinBatch.get('drpAddinBatch').setValue(this.listFilteredBatch[0].col1);
    }
    else {
      this.frmAddinBatch.get('drpAddinBatch').setValue("");
    }

  }
  acBatchClaimsList;
  addclaimflag: boolean = false;
  onAddinBatch(frm) {
    debugger;
    this.addclaimflag = true;
    for (var i = 0; i < this.listclaimlist.length; i++) {
      if (this.listclaimlist[i].chk == true) {
        if (frm.drpBatchAddinProvider > 0) {
          if (this.listclaimlist[i].billing_physician != frm.drpBatchAddinProvider) {
            GeneralOperation.showAlertPopUp(this.modalService, "Add In Batch Validation", "Claim and Batch Provider must be same.", 'warning');

            this.addclaimflag = false;
            return;
          }
        }
      }
    }
    if (this.addclaimflag) {

      if (frm.drpAddinBatch == undefined || frm.drpAddinBatch == null || frm.drpAddinBatch == '') {
        GeneralOperation.showAlertPopUp(this.modalService, "Add In Batch Validation", "Please select batch.", 'warning');

        return;
      }
      else {
        this.billingService.getBatchClaimList(frm.drpAddinBatch).subscribe(
          data => {
            debugger;
            this.acBatchClaimsList = data;
            this.saveClaimBatchDetail();
          },
          error => {
            this.addclaimflag = false;
          }
        );
      }
    }
  }
  saveClaimBatchDetail() {
    debugger;
    let listSaveClaims: Array<ORMSaveClaimBatchDetail> = new Array;
    for (var i = 0; i < this.listclaimlist.length; i++) {
      if (this.listclaimlist[i].chk == true) {
        if (this.frmAddinBatch.get("drpBatchAddinProvider").value > 0) {
          if (this.listclaimlist[i].billing_physician != this.frmAddinBatch.get("drpBatchAddinProvider").value) {
            GeneralOperation.showAlertPopUp(this.modalService, "Add In Batch Validation", "Claim and Batch Provider must be same.", 'warning');
            listSaveClaims = [];
            this.addclaimflag = false;
            return;
          }
        }
        //if(listclaimlist[i])

        // to avoid duplicate claim entry in batch.
        var is_already_added: Boolean = false;
        for (var j = 0; j < listSaveClaims.length; j++) {
          if (listSaveClaims[j].claim_id == this.listclaimlist[i].claim_id) {
            is_already_added = true;
            break;
          }
        }

        if (this.acBatchClaimsList != null && this.acBatchClaimsList.length > 0) {
          for (var k = 0; k < this.acBatchClaimsList.length; k++) {
            if (this.acBatchClaimsList[k].scalar_value == this.listclaimlist[i].claim_id) //scalar_value =~ claim_id
            {
              is_already_added = true;
              break;
            }
          }
        }

        if (is_already_added == false) {

          let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


          this.objSaveBatchDetail = new ORMSaveClaimBatchDetail;


          if (this.listclaimlist[i].is_resubmitted == true) {
            //objORMclaim_batch.detail_id=listclaimlist[i].detail_id;
            if (this.frmAddinBatch.get("drpAddinBatch").value == this.listclaimlist[i].batch_id) {
              this.objSaveBatchDetail.detail_id = this.listclaimlist[i].detail_id;

            }

          }
          else {
            if (this.listclaimlist[i].detail_id != null && this.listclaimlist[i].detail_id != "" && this.listclaimlist[i].detail_id != "0") {
              if (this.frmAddinBatch.get("drpAddinBatch").value != this.listclaimlist[i].batch_id) {
                this.objSaveBatchDetail.detail_id = this.listclaimlist[i].detail_id;


              }
            }
          }

          if (this.objSaveBatchDetail.detail_id != undefined) {
            this.objSaveBatchDetail.date_created = this.listclaimlist[i].batch_date_created;
            this.objSaveBatchDetail.client_date_created = this.listclaimlist[i].batch_client_date_created;
          }
          else {
            this.objSaveBatchDetail.client_date_created = clientDateTime;
          }
          this.objSaveBatchDetail.client_date_modified = clientDateTime;

          this.objSaveBatchDetail.batch_id = this.frmAddinBatch.get("drpAddinBatch").value;
          this.objSaveBatchDetail.claim_id = this.listclaimlist[i].claim_id;
          this.objSaveBatchDetail.practice_id = this.lookupList.practiceInfo.practiceId.toString();
          this.objSaveBatchDetail.created_user = this.lookupList.logedInUser.user_name;
          this.objSaveBatchDetail.modified_user = this.lookupList.logedInUser.user_name;
          this.objSaveBatchDetail.system_ip = this.lookupList.logedInUser.systemIp;

          //All in One
          listSaveClaims.push(this.objSaveBatchDetail);
        }
      }
    }
    if (listSaveClaims.length > 0) {
      this.billingService.saveClaimBatchDetail(listSaveClaims).subscribe(
        data => {
          debugger;
          this.addclaimflag = false;
          this.showAddinBatch = false;
          this.onFilter(this.searchForm.value);

          this.getClaimBatchCount();
        },
        error => {
          this.addclaimflag = false;
          GeneralOperation.showAlertPopUp(this.modalService, 'Error Calim Add In Batch', error, 'danger')
        }
      );
    }
    else {
      this.addclaimflag = false;
      this.showAddinBatch = false;
    }
  }
  clickAddInBatch() {
    debugger;
    let claimchk = false;
    let pr_id = "";
    for (var i = 0; i < this.listclaimlist.length; i++) {
      if (this.listclaimlist[i].chk == true) {
        claimchk = true;
        pr_id = this.listclaimlist[i].billing_physician;
        break;
      }
      else {
        claimchk = false;
      }
    }
    if (claimchk == true) {
      this.showAddinBatch = true;

      if (pr_id != "") {
        (this.frmAddinBatch.get("drpBatchAddinProvider") as FormControl).setValue(pr_id);
      }
      else {
        for (let i = 0; i < this.lookupList.billingProviderList.length; i++) {
          (this.frmAddinBatch.get("drpBatchAddinProvider") as FormControl).setValue(this.lookupList.billingProviderList[0].id);
          break;
        }
      }
      //this.onChangedrpBatchAddinProvider(null);
      this.onChangedrpBatchAddinProvider((this.frmAddinBatch.get('drpBatchAddinProvider') as FormControl).value);
    }
    else {
      GeneralOperation.showAlertPopUp(this.modalService, "Add In Batch Validation", "Please select atleast one claim.", 'warning');
      return;
    }


  }
  onClickBatchDates(frm) {
    this.showbatchListDates = true;
  }
  onBatchDatesClsoe() {
    this.showbatchListDates = false;
  }
  onBatchDateSearch(frm) {
    this.getClaimBatchCount();

    this.lblBatchDates = this.dateTimeUtil.getStringDateFromDateModel(frm.txtBatchFromDate)
    this.lblBatchDates += " - " + this.dateTimeUtil.getStringDateFromDateModel(frm.txtBatchToDate)
  }
  onLockBatch(d) {
    if (d.batch_lock == false && d.file_generated == false) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Batch Lock Validation', 'Could not lock this batch, Because Batch File is not generated yet.', 'warning');
      return;
    }
    if (d.batch_lock == false) {
      const modalRef = this.modalService.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Lock!';
      modalRef.componentInstance.promptMessage = 'Are you sure you want to lock this Batch ?' + name;
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      let closeResult;

      modalRef.result.then((result) => {
        debugger;
        if (result == PromptResponseEnum.YES) {
          this.searchCriteria = new SearchCriteria()
          this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
          this.searchCriteria.param_list = [];
          this.searchCriteria.param_list.push({ name: "User", value: this.lookupList.logedInUser.user_name, option: "" });
          this.searchCriteria.param_list.push({ name: "batch_id", value: d.batch_id, option: "" });
          this.searchCriteria.param_list.push({ name: "batch_name", value: d.name, option: "" });

          this.billingService.lockBatch(this.searchCriteria)
            .subscribe(
              data => this.onDeleteSuccessfully(data),
              error => {
                GeneralOperation.showAlertPopUp(this.modalService, 'Error In LockBatch', error, 'danger')
              }

            );
        }
      }, (reason) => {
        //alert(reason);
      });
    }
    else {
      //nothing
      return;
    }
  }
  onDeleteBatch(d) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to delete selected record ?' + name;
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = d.batch_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.billingService.deleteClaimBatch(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => {
              GeneralOperation.showAlertPopUp(this.modalService, 'Error In Delete Claim Batch', error, 'danger')
            }
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = "Batch Delete"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        ;
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.getClaimBatchCount();
    }
  }
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  selectedbatchObject;
  openBatchDetail(d) {
    debugger;
    this.selectedbatchObject = d;
    this.loadmodule = true;
    /*
    return;
    const modalRef = this.modalService.open(ClaimBatchDetailComponent, { size: 'lg', windowClass: 'modal-adaptive' });

    modalRef.componentInstance.batch_id = d.batch_id;
    modalRef.componentInstance.batch_name = d.name;
    modalRef.componentInstance.isbatch_lock = d.batch_lock;
    modalRef.componentInstance.batch_path = d.file_path;
    modalRef.componentInstance.batch_status_detail = d.batch_status_detail;
    modalRef.componentInstance.batch_type = d.batch_type;
    */
  }
  navigateBackToSummary() {
    this.loadmodule = false;
    this.getClaimBatchCount();
  }
  onChangedrpFilterProvider(value) {
    debugger;
    //event.currentTarget.value
    let filterObj: any;
    filterObj = { provider_id: value };
    this.listclaimbatchcountFiltered = new ListFilterGeneral().transform(this.listclaimbatchcount, filterObj);
  }
  onBatchSelection(value, obj) {
    this.listclaimbatchcountFiltered[this.generaloperation.getElementIndex(this.listclaimbatchcountFiltered, obj)].selected = value;
  }
  selectAllBatch(value) {
    if (this.listclaimbatchcountFiltered != null && this.listclaimbatchcountFiltered.length > 0) {
      for (var a = 0; a < this.listclaimbatchcountFiltered.length; a++) {
        if (this.listclaimbatchcountFiltered[a].batch_status == null || this.listclaimbatchcountFiltered[a].batch_status == "") {
          if (this.listclaimbatchcountFiltered[a].file_generated == true && this.listclaimbatchcountFiltered[a].batch_lock == true) {
            this.listclaimbatchcountFiltered[a].selected = value;
          }
          else {
            this.listclaimbatchcountFiltered[a].selected = false;
          }
        }
        else {
          this.listclaimbatchcountFiltered[a].selected = false;
        }
      }
    }
  }
  setTextColor(status, name): string {
    debugger;
    if (status == "A")
      return '#38a833';
    else if (status == 'Sent To GatewayEdi')
      return '#9c27b0'
  }
  onExpand() {
    if (this.isExpand == true)
      this.isExpand = false;
    else
      this.isExpand = true;
  }
  onUploadBatch() {
    debugger;

    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Upload';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to upload the selected bacth ?' + name;
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {


        let strBatchIds = "";

        if (this.listclaimbatchcountFiltered != null && this.listclaimbatchcountFiltered.length > 0) {
          for (var i = 0; i < this.listclaimbatchcountFiltered.length; i++) {
            if (this.listclaimbatchcountFiltered[i].selected == true) {
              if (this.listclaimbatchcountFiltered[i].file_generated == true) {
                if (this.listclaimbatchcountFiltered[i].batch_status == null || this.listclaimbatchcountFiltered[i].batch_status == "") {
                  if (strBatchIds != "") {
                    strBatchIds += ",";
                  }
                  strBatchIds += "'" + this.listclaimbatchcountFiltered[i].batch_id + "'";
                }
                else {
                  GeneralOperation.showAlertPopUp(this.modalService, "Batch Upload Validation", 'Batch is already uploaded. ' + this.listclaimbatchcountFiltered[i].name, 'danger');
                  break;
                }
              }
              else {
                GeneralOperation.showAlertPopUp(this.modalService, "Batch Upload Validation", 'Batch File is not generated. ' + this.listclaimbatchcountFiltered[i].name, 'danger');
                break;
              }
            }
          }

          if (strBatchIds == "") {
            GeneralOperation.showAlertPopUp(this.modalService, "Batch Upload Validation", 'No Batch is selected to Uplaod ', 'danger');
          }
          else {
            GeneralOperation.showAlertPopUp(this.modalService, "Batch Upload Validation", 'Batch Files are being uploading.\nYou will receive a prompt message when it is done.', 'info');
            //bopUploadBatch.UploadBatchToGatewayEDI.send(GeneralOptions.practiceID,URLUtil.getServerName(FlexGlobals.topLevelApplication.loaderInfo.url),GeneralOptions.loginUser,strBatchIds);
            //window.location.hostname
            this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
            this.searchCriteria.param_list = [];
            this.searchCriteria.param_list.push({ name: "host", value: window.location.hostname, option: "" });
            this.searchCriteria.param_list.push({ name: "user", value: this.lookupList.logedInUser.user_name, option: "" });
            this.searchCriteria.param_list.push({ name: "batch_id", value: strBatchIds, option: "" });


            this.billingService.uploadBatchToGatewayEDI(this.searchCriteria).subscribe(
              data => {
                debugger;
                this.modalService.dismissAll();
                GeneralOperation.showAlertPopUp(this.modalService, "Batch Upload Result", data.toString(), 'info');
                this.getClaimBatchCount();
              },
              error => {
                debugger;
                this.modalService.dismissAll();
                GeneralOperation.showAlertPopUp(this.modalService, "Batch Upload Result", error.error.text.toString(), 'danger');
                this.getClaimBatchCount();
              }
            );
          }
        }

        else {
          GeneralOperation.showAlertPopUp(this.modalService, "Batch Upload Validation", 'No Batch is selected to Uplaod ', 'danger');
        }
      }
    })
  }
  onBatchResponse() {
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "host", value: window.location.hostname, option: "" });
    this.searchCriteria.param_list.push({ name: "user", value: this.lookupList.logedInUser.user_name, option: "" });

    this.billingService.downloadBatchResponse(this.searchCriteria).subscribe(
      data => {
        debugger;
        GeneralOperation.showAlertPopUp(this.modalService, "Batch Download Result", data.toString(), 'info');
      },
      error => {
        debugger;
        GeneralOperation.showAlertPopUp(this.modalService, "Batch Download Error", error.error.text.toString(), 'danger');
      }
    );
  }





  

  onClear() {
    debugger;

    this.patientID = '';
    this.Insurance_IdSearch = '';
    this.dateType = "DOS"


    this.searchForm.get('dateType').setValue(this.dateType);
    this.searchForm.get('txtFromDate').setValue(this.dateTimeUtil.getCurrentDateModel());
    this.searchForm.get('txtToDate').setValue(this.dateTimeUtil.getCurrentDateModel());
    this.searchForm.get('drpProvider').setValue((this.lookupList.logedInUser.defaultProvider > 0 && this.lookupList.logedInUser.defaultProvider != null && this.lookupList.logedInUser.defaultProvider != undefined) ? this.lookupList.logedInUser.defaultProvider : '');
    this.searchForm.get('drpLocation').setValue((this.lookupList.logedInUser.defaultLocation > 0 && this.lookupList.logedInUser.defaultLocation != null && this.lookupList.logedInUser.defaultLocation != undefined) ? this.lookupList.logedInUser.defaultLocation : '');
    this.searchForm.get('drpStatus').setValue('Unprocessed');
    this.searchForm.get('drpType').setValue('Professional');
    this.searchForm.get('txtPatientSearch').setValue('');
    this.searchForm.get('txtInsuranceSearch').setValue('');

    /*
    this.searchForm = this.formBuilder.group({
      dateType: this.formBuilder.control(this.dateType),
      txtFromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      txtToDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      drpProvider: this.formBuilder.control((this.lookupList.logedInUser.defaultProvider > 0 && this.lookupList.logedInUser.defaultProvider != null && this.lookupList.logedInUser.defaultProvider != undefined) ? this.lookupList.logedInUser.defaultProvider : ''),
      drpLocation: this.formBuilder.control((this.lookupList.logedInUser.defaultLocation > 0 && this.lookupList.logedInUser.defaultLocation != null && this.lookupList.logedInUser.defaultLocation != undefined) ? this.lookupList.logedInUser.defaultLocation : ''),      
      drpType: this.formBuilder.control('Professional'),
      drpStatus: this.formBuilder.control('Unprocessed'),
      txtPatientSearch: this.formBuilder.control(''),
      txtInsuranceSearch: this.formBuilder.control(""),
    })
    */
  }
  onselectionChange(index: number) {
    this.selectedSummaryRow = index;
  }
  onDateTypeChange(type: string) {
    this.dateType = type;
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.listclaimlistDb, this.headers, this.sortEvent, null, null, '');
    debugger;
    this.listclaimlist = sortFilterPaginationResult.list;
  }

  exportAsXLSX() {
    this.excel.exportAsExcelFile(this.listclaimlist, 'claim_id,pname,dos,insurance_name,insurance_name,policy_no,proname,proname,facility_name,facility_name,claim_total,date_created,cpt,icd,name', 'Billing Claim Summary');
  }
  getTooltipIcdsCptsAsList(icdsCpts: any, src) {
    //debugger;
    let lst: Array<string> = [];
    let lstfnl: Array<string> = [];
    if (icdsCpts != undefined && icdsCpts != '' && icdsCpts != null) {
      lst = icdsCpts.split(':');

      // if(src=="icd")
      // return icdsCpts.match(/[^:]+:[^:]+/g)
      if (src == "icd") {
        let icd: string = "";
        for (let i = 0; i < lst.length; i++) {
          if (icd == "")
            icd = lst[i];
          else
            icd += ", " + lst[i];

          if (icd.includes(",")) {
            lstfnl.push(icd);
            icd = "";
          }
          else {
            if (i + 1 == lst.length) {
              lstfnl.push(icd);
            }
          }
          // if(i>0)
          // {
          //   if(i%2==1 )
          //   {
          //     lstfnl.push(icd);
          //     icd="";
          //   }
          //   else{

          //   }
          // }
        }
        return lstfnl;
      }
    }

    return lst;
  }
}
