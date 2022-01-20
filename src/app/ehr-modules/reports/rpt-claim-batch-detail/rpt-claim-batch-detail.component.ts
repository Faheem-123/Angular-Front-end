import { Component, OnInit, Inject, ViewChildren, QueryList, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
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
import { DateModel } from 'src/app/models/general/date-model';
@Component({
  selector: 'rpt-claim-batch-detail',
  templateUrl: './rpt-claim-batch-detail.component.html',
  styleUrls: ['./rpt-claim-batch-detail.component.css']
})
export class RptClaimBatchDetailComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;

  isCollapsed = false;
  searchForm: FormGroup;
  isLoading = false;
  lstClaimDetails;
  lstClaimDetailsDB;
  constructor(private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil, private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage, private excel: excelService, private sortFilterPaginationService: SortFilterPaginationService,
    private reportsService: ReportsService, @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    debugger;
    this.searchForm = this.formBuilder.group({
      dpFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      cmbProvider: this.formBuilder.control(null),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation == 0 ? 'null' : this.lookupList.logedInUser.defaultLocation),
      dateType: this.formBuilder.control(this.dateType)
    })
  }
  searchCriteria: SearchCriteria;
  totalBalance = 0;
  pri_paid = 0;
  sec_paid = 0;
  pat_paid = 0;
  amt_due = 0;
  onSearch(frm) {
    debugger;
    if ((this.searchForm.get('dpTo') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter From Date", 'warning')
      return;
    }
    if ((this.searchForm.get('dpFrom') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter To Date", 'warning')
      return;
    }
    this.totalBalance = 0;
    this.pri_paid = 0;
    this.sec_paid = 0;
    this.pat_paid = 0;
    this.amt_due = 0;
    this.isLoading = true;

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];

    this.searchCriteria.param_list.push({ name: "type", value: frm.dateType, option: "" });
    this.searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpTo), option: "" });
    this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpFrom), option: "" });
    if (frm.cmbProvider != "" && frm.cmbProvider != "null" && frm.cmbProvider != null && frm.cmbProvider != "All") {
      this.searchCriteria.param_list.push({ name: "provider_id", value: frm.cmbProvider, option: "" });
    }
    if (frm.cmbLocation != "" && frm.cmbLocation != null && frm.cmbLocation != "null" && frm.cmbLocation != "All") {
      this.searchCriteria.param_list.push({ name: "location_id", value: frm.cmbLocation, option: "" });
    }
    this.reportsService.getClaimBatchReport(this.searchCriteria).subscribe(
      data => {
        this.lstClaimDetails = data;
        this.lstClaimDetailsDB = data;
        for (let i = 0; i < this.lstClaimDetails.length; i++) {
          this.totalBalance = this.totalBalance + Number(parseFloat(this.lstClaimDetails[i].claim_total).toFixed(2));
          this.pri_paid = this.pri_paid + Number(parseFloat(this.lstClaimDetails[i].pri_paid).toFixed(2));
          this.sec_paid = this.sec_paid + Number(parseFloat(this.lstClaimDetails[i].sec_paid).toFixed(2));
          this.pat_paid = this.pat_paid + Number(parseFloat(this.lstClaimDetails[i].pat_paid).toFixed(2));
          this.amt_due = this.amt_due + Number(parseFloat(this.lstClaimDetails[i].amt_due).toFixed(2));
        }

        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
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

  dateType: string = 'dos'
  onDateTypeChange(type: string) {
    this.dateType = type;
  }

  
  onDateFocusOut(date: string, controlName: string) {
    let formatedDate: DateModel = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined) {
      this.searchForm.get(controlName).setValue(formatedDate);
    }
  }
}
