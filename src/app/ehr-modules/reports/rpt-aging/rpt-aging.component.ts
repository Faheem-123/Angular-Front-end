import { Component, OnInit, Inject, ViewChildren, QueryList, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportsService } from 'src/app/services/reports.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { excelService } from 'src/app/shared/excelService';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { PatientSubTabsEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';

@Component({
  selector: 'rpt-aging',
  templateUrl: './rpt-aging.component.html',
  styleUrls: ['./rpt-aging.component.css']
})
export class RptAgingComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;

  isCollapsed = false;
  lstAmtCnd: Array<string> = ["=", ">", ">=", "<", "<="];
  constructor(private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil, private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage, private excel: excelService,
    private reportsService: ReportsService, @Inject(LOOKUP_LIST) public lookupList: LookupList, private sortFilterPaginationService: SortFilterPaginationService) { }
  isLoading = false;
  lstClaimDetails;
  lstClaimDetailsDB;
  patientId = "";
  payerId = "";
  btnDetailView = "Detailed View";
  detailView = false;
  searchForm: FormGroup;

  ngOnInit() {
    this.buildForm();
  }
  showDetailView() {
    if (this.btnDetailView == "Detailed View") {
      this.btnDetailView = "Compact View";
      this.detailView = true;
    } else {
      this.btnDetailView = "Detailed View";
      this.detailView = false;
    }
  }

  buildForm() {
    debugger;
    this.searchForm = this.formBuilder.group({
      dateType: this.formBuilder.control(this.dateType),
      dptoDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpfromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      txtPatientSearch: this.formBuilder.control(""),

      drpPriStatus: this.formBuilder.control("all"),
      drpSecStatus: this.formBuilder.control("all"),
      payerType: this.formBuilder.control(this.payerType),
      txtpayerSearch: this.formBuilder.control(""),
      drpProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider == 0 ? '' : this.lookupList.logedInUser.defaultProvider),
      drpLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation == 0 ? '' : this.lookupList.logedInUser.defaultLocation),
      drpClaimType: this.formBuilder.control("all"),
      drpAmtCond: this.formBuilder.control("="),
      txtAmount: this.formBuilder.control(""),
      chkAging_Self: this.formBuilder.control(false)
    })
  }
  searchCriteria: SearchCriteria;
  total_30 = 0;
  total_60 = 0;
  total_90 = 0;
  total_120 = 0;
  total_120Plus = 0;
  total_amount = 0;
  onSearch(frm) {
    debugger;
    if ((this.searchForm.get('dpfromDate') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter From Date", 'warning')
      return;
    }
    if ((this.searchForm.get('dptoDate') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter To Date", 'warning')
      return;
    }

    this.total_120 = 0;
    this.total_120Plus = 0;
    this.total_30 = 0;
    this.total_60 = 0;
    this.total_90 = 0;
    this.total_amount = 0;
    this.isLoading = true;

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "range", value: frm.dateType, option: "" });
    this.searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpfromDate), option: "" });
    this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dptoDate), option: "" });
    if (this.patientId != '' && frm.txtPatientSearch != null && frm.txtPatientSearch != '') {
      this.searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
    }
    if (this.payerId != '' && frm.txtpayerSearch != null && frm.txtpayerSearch != '') {
      this.searchCriteria.param_list.push({ name: "payer_id", value: this.payerId, option: "" });
    }
    if (frm.payerType != null && frm.payerType != '') {
      this.searchCriteria.param_list.push({ name: "payer_type", value: frm.payerType, option: "" });
    }
    if (frm.drpProvider != "" && frm.drpProvider != "null" && frm.drpProvider != null && frm.drpProvider != "All") {
      this.searchCriteria.param_list.push({ name: "provider_id", value: frm.drpProvider, option: "" });
    }
    if (frm.drpLocation != "" && frm.drpLocation != null && frm.drpLocation != "null" && frm.drpLocation != "All") {
      this.searchCriteria.param_list.push({ name: "location_id", value: frm.drpLocation, option: "" });
    }

    this.searchCriteria.param_list.push({ name: "self", value: frm.chkAging_Self, option: "" });
    this.searchCriteria.param_list.push({ name: "amt_cond", value: frm.drpAmtCond, option: "" });
    this.searchCriteria.param_list.push({ name: "amt", value: frm.txtAmount, option: "" });
    this.searchCriteria.param_list.push({ name: "claim_type", value: frm.drpClaimType, option: "" });
    this.searchCriteria.param_list.push({ name: "pri_status", value: frm.drpPriStatus, option: "" });
    this.searchCriteria.param_list.push({ name: "sec_status", value: frm.drpSecStatus, option: "" });

    this.reportsService.getBillingTrackSheetFreez(this.searchCriteria).subscribe(
      data => {
        this.lstClaimDetailsDB = data;
        this.lstClaimDetails = data;
        for (let i = 0; i < this.lstClaimDetails.length; i++) {
          this.total_30 += Number(this.lstClaimDetails[i].aging_30);
          this.total_60 += Number(this.lstClaimDetails[i].aging_60);
          this.total_90 += Number(this.lstClaimDetails[i].aging_90);
          this.total_120 += Number(this.lstClaimDetails[i].aging_120);
          this.total_120Plus += Number(this.lstClaimDetails[i].aging_120_plus);
        }
        this.total_30 = Number(this.total_30.toFixed(2));
        this.total_60 = Number(this.total_60.toFixed(2));
        this.total_90 = Number(this.total_90.toFixed(2));
        this.total_120 = Number(this.total_120.toFixed(2));
        this.total_120Plus = Number(this.total_120Plus.toFixed(2));
        debugger;
        this.total_amount = this.total_30 + this.total_60 + this.total_90 + this.total_120 + this.total_120Plus;
        this.isLoading = false;
      },
      error => {
        this.logMessage.log(error);
        this.isLoading = false;
      }
    );
  }
  showPatientSearch: boolean = false;
  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    } else if (event.key == "Backspace") {
      this.showPatientSearch = false;
      this.patientId = "";
      this.searchForm.get("txtPatientSearch").setValue(null);
    }
    else {
      this.showPatientSearch = false;
    }
  }
  openSelectPatient(patObject) {
    this.patientId = patObject.patient_id;
    (this.searchForm.get('txtPatientSearch') as FormControl).setValue(patObject.name);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  onPatientSearchBlur() {

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientId = "";
      this.searchForm.get("txtPatientSearch").setValue(null);
    }
  }
  onPayerSearchBlur() {

    if (this.payerId == undefined && this.showPayerSearch == false) {
      this.payerId = "";
      this.searchForm.get("txtpayerSearch").setValue(null);
    }
  }

  showPayerSearch = false;
  onPayerSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPayerSearch = true;
      this.payerId = '';
    }
    else {
      this.showPayerSearch = false;
    }
  }


  openSelectPayer(patObject) {
    debugger;
    this.payerId = '';
    if (patObject.length > 0) {
      for (let i = 0; i < patObject.length; i++) {
        if (this.payerId == '')
          this.payerId = patObject[i].payerid;
        else
          this.payerId += "," + patObject[i].payerid;
      }
    }
    else
      this.payerId = patObject.payerid;

    if (patObject.length > 0) {
      if (patObject.length == 1)
        (this.searchForm.get('txtpayerSearch') as FormControl).setValue(patObject[0].name + " (" + patObject[0].payer_number + ")");
      else
        (this.searchForm.get('txtpayerSearch') as FormControl).setValue("<Multiple Payer (" + patObject.length + ")>");
    }
    else
      (this.searchForm.get('txtpayerSearch') as FormControl).setValue(patObject.name + " (" + patObject.payer_number + ")");


    this.showPayerSearch = false;
  }
  closePayerSearch() {
    this.showPayerSearch = false;
    this.onPayerSearchBlur();
  }
  exportAsXLSX() {
    this.excel.exportAsExcelFile(this.lstClaimDetails, 'patient_id,alternate_account,patient_name,dob,claim_id,dos,attending_physician,location_name,pri_status,sec_status,oth_status,pat_status,last_claim_note_date,coding_done_date,batch_generated_date,primary_insurance,secondary_insurance,other_insurance,elig_status_primary,elig_status_secondary,pri_paid,sec_paid,oth_paid,patient_paid,write_off,discount,risk_amount,adjust_amount,claim_total,amt_due,patient_statement_dates,aging_30,aging_60,aging_90,aging_120,aging_120_plus,no_of_days_pri,submission_date', 'RPT_AGING');
  }
  openClaim(claim) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = claim.patient_id;
    obj.patient_name = claim.patient_name;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = claim.claim_id;
    this.openModuleService.openPatient.emit(obj);
  }
  openPatient(patient) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstClaimDetailsDB, this.headers, this.sortEvent, null, null, '');
    debugger;
    this.lstClaimDetails = sortFilterPaginationResult.list;
  }
  selectedRow = 0;
  onSelectionChange(index) {
    this.selectedRow = index;
  }

  dateType:string='date_created';
  onDateTypeChange(type: string) {
    this.dateType = type;
  }

  payerType:string='all_payers';
  onPayerTypeChange(type: string) {
    this.payerType = type;
  }
}
