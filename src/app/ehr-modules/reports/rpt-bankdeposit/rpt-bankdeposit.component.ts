import { Component, OnInit, Input, Inject, ViewChild, ElementRef, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LogMessage } from 'src/app/shared/log-message';
import { excelService } from 'src/app/shared/excelService';
import { ReportsService } from 'src/app/services/reports.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { PatientSubTabsEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { DateModel } from 'src/app/models/general/date-model';

@Component({
  selector: 'rpt-bankdeposit',
  templateUrl: './rpt-bankdeposit.component.html',
  styleUrls: ['./rpt-bankdeposit.component.css']
})
export class RptBankdepositComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;

  isCollapsed = false;
  selectedSummaryRow: number = 0;
  bankDepostReportForm: FormGroup;
  recordCount = 0;
  addEdit = false;
  lstChecksPaymentDetail;
  lstChecksPaymentDetailDB;
  lstChecksDetail;
  unique_id = Math.random().toString(36).substr(2, 9); //unique id for CheckBoxes { usefull when same module, opend on multiple location }

  dateType: string = 'check_date';

  constructor(private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil, private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage, private excel: excelService, private sortFilterPaginationService: SortFilterPaginationService,
    private reportsService: ReportsService, @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    debugger;
    this.buildForm();
    // (this.bankDepostReportForm.get("chk_eoberapayment") as FormControl).setValue(true);
    //(this.bankDepostReportForm.get("chkbox_acapayment") as FormControl).setValue(true);
    //(this.bankDepostReportForm.get("chkbox_patpayment") as FormControl).setValue(true);
    // (this.bankDepostReportForm.get("dateType") as FormControl).setValue("check_date");

  }
  buildForm() {
    this.bankDepostReportForm = this.formBuilder.group({
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      txtCheckNo: this.formBuilder.control(""),
      dateType: this.formBuilder.control(this.dateType),
      chk_eoberapayment: this.formBuilder.control(true),
      chkbox_acapayment: this.formBuilder.control(true),
      chkbox_patpayment: this.formBuilder.control(true),
      txtpayerSearch: this.formBuilder.control(null)
    })
  }
  searchCriteria: SearchCriteria;
  isLoading = false;
  total_check_amount = 0;
  total_posted_amount = 0;
  searchBankDepost(frm) {
    if ((this.bankDepostReportForm.get('dateFrom') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter From Date", 'warning')
      return;
    }
    if ((this.bankDepostReportForm.get('dateTo') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter To Date", 'warning')
      return;
    }
    debugger;
    this.isLoading = true;

    this.total_check_amount = 0;
    this.total_posted_amount = 0;
    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "date_option", value: frm.dateType, option: "" });
    this.searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dateFrom), option: "" });
    this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dateTo), option: "" });

    this.searchCriteria.param_list.push({ name: "iseobPayment", value: frm.chk_eoberapayment, option: "" });
    this.searchCriteria.param_list.push({ name: "isACAPayment", value: frm.chkbox_acapayment, option: "" });
    this.searchCriteria.param_list.push({ name: "isPatientPayment", value: frm.chkbox_patpayment, option: "" });
    if (this.payerId != '' && frm.txtpayerSearch != null && frm.txtpayerSearch != '') {
      this.searchCriteria.param_list.push({ name: "payer_id", value: this.payerId, option: "" });
    }
    this.searchCriteria.param_list.push({ name: "check_number", value: frm.txtCheckNo, option: "" });
    this.reportsService.getBankDepositReportCheckSummary(this.searchCriteria).subscribe(
      data => {
        this.lstChecksDetail = data;

        for (let i = 0; i < this.lstChecksDetail.length; i++) {
          if (frm.dateType != 'posting_date') {
            this.total_check_amount = this.total_check_amount + Number(this.lstChecksDetail[i].check_amount);
          }
          this.total_posted_amount = this.total_posted_amount + Number(this.lstChecksDetail[i].total_posted_amount);
        }
        this.total_check_amount = Number(this.total_check_amount.toFixed(2));
        this.total_posted_amount = Number(this.total_posted_amount.toFixed(2));
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );

  }
  showPayerSearch = false;
  onPayerSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPayerSearch = true;
    }
    else {
      this.showPayerSearch = false;
    }
  }
  payerId = '';
  openSelectPayer(patObject) {
    debugger;
    this.payerId = patObject.payer_number;

    (this.bankDepostReportForm.get('txtpayerSearch') as FormControl).setValue(patObject.name + " (" + patObject.payer_number + ")");

    this.showPayerSearch = false;
  }
  closePayerSearch() {
    this.showPayerSearch = false;
    this.onPayerSearchBlur();
  }
  onPayerSearchBlur() {

    if (this.payerId == undefined && this.showPayerSearch == false) {
      this.payerId = "";
      this.bankDepostReportForm.get("txtpayerSearch").setValue(null);
    }
  }
  getSummaryChange(index, obj, frm) {
    this.isLoading = true;
    this.selectedSummaryRow = index;

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dateFrom), option: "" });
    this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dateTo), option: "" });

    this.searchCriteria.param_list.push({ name: "eob_era_id", value: (obj.eob_era_id == null ? "" : obj.eob_era_id), option: "" });
    this.searchCriteria.param_list.push({ name: "eob_era_id_type", value: (obj.eob_era_id_type == null ? "" : obj.eob_era_id_type), option: "" });

    this.reportsService.getCheckPostedPayments(this.searchCriteria).subscribe(
      data => {
        this.lstChecksPaymentDetail = data;
        this.lstChecksPaymentDetailDB = data;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );

  }
  selectedDetailRow = 0;
  getDetailChange(index, obj) {
    this.selectedDetailRow = index;
  }

  openClaim(claim) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = claim.patient_id;
    obj.patient_name = claim.patient_name;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = claim.claim_id;
    this.openModuleService.openPatient.emit(obj);
  }
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstChecksPaymentDetailDB, this.headers, this.sortEvent, null, null, '');
    debugger;
    this.lstChecksPaymentDetail = sortFilterPaginationResult.list;
  }
  exportAsXLSX() {
    this.excel.exportAsExcelFile(this.lstChecksDetail, 'check_date,check_number,check_amount,total_posted_amount,date_created,payment_type,payment_source,eob_era_id', 'RPT_CHECK_DETAILS');
  }


  onDateTypeChange(type: string) {
    this.dateType = type;
  }


  onDateFocusOut(date: string, controlName: string) {

    // console.log('focus out Called:');
    let formatedDate: DateModel = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined) {
      this.bankDepostReportForm.get(controlName).setValue(formatedDate);
    }
  }
}
