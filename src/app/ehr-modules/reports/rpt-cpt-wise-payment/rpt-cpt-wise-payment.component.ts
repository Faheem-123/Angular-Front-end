import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
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
import { PatientSubTabsEnum } from 'src/app/shared/enum-util';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
@Component({
  selector: 'rpt-cpt-wise-payment',
  templateUrl: './rpt-cpt-wise-payment.component.html',
  styleUrls: ['./rpt-cpt-wise-payment.component.css']
})
export class RptCptWisePaymentComponent implements OnInit {
  searchForm: FormGroup;
  isLoading = false;
  lstClaimDetails;
  lstClaimDetailsDB;
  showPayerSearch = false;
  showInsuranceSearch = false;
  payerId = '';
  insurance_Id = '';
  isCollapsed = false;
  constructor(private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil, private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage, private excel: excelService, private sortFilterPaginationService: SortFilterPaginationService,
    private reportsService: ReportsService, @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    debugger;
    this.searchForm = this.formBuilder.group({
      dateType: this.formBuilder.control(this.dateType),
      dptoDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpfromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      txtpayerSearch: this.formBuilder.control(""),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider == 0 ? 'null' : this.lookupList.logedInUser.defaultProvider),
      txtInsuranceName: this.formBuilder.control(null),
      drpPayerType: this.formBuilder.control("all"),
      txttaxonomy: this.formBuilder.control(""),
      txtCpt: this.formBuilder.control(""),
      chkPaidOnly: this.formBuilder.control(true),
      chkDx: this.formBuilder.control(false)
    })
  }
  searchCriteria: SearchCriteria;
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

    this.isLoading = true;

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];

    this.searchCriteria.param_list.push({ name: "date_option", value: frm.dateType, option: "" });
    this.searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpfromDate), option: "" });
    this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dptoDate), option: "" });
    if (frm.cmbProvider != "" && frm.cmbProvider != "null" && frm.cmbProvider != null && frm.cmbProvider != "All") {
      this.searchCriteria.param_list.push({ name: "provider_id", value: frm.cmbProvider, option: "" });
    }
    if (frm.txttaxonomy != "" && frm.txttaxonomy != "null" && frm.txttaxonomy != null) {
      this.searchCriteria.param_list.push({ name: "taxonomy_id", value: frm.txttaxonomy, option: "" });
    }
    if (frm.txtCpt != "" && frm.txtCpt != "null" && frm.txtCpt != null) {
      this.searchCriteria.param_list.push({ name: "cpt_code", value: frm.txtCpt, option: "" });
    }
    if (this.payerId != '' && frm.txtpayerSearch != null && frm.txtpayerSearch != '') {
      this.searchCriteria.param_list.push({ name: "payer_id", value: this.payerId, option: "" });
    }
    // if(this.insurance_Id!='' && frm.txtpayerSearch!=null && frm.txtpayerSearch!='')  
    // {
    //   this.searchCriteria.param_list.push( { name: "insurance_Id", value: this.insurance_Id, option: ""});
    // }
    if (this.insurance_Id != '') {
      this.searchCriteria.param_list.push({ name: "insurance_Id", value: this.insurance_Id, option: "" });
    }

    this.searchCriteria.param_list.push({ name: "paid_only", value: frm.chkPaidOnly, option: "" });
    this.searchCriteria.param_list.push({ name: "show_dx", value: frm.chkDx, option: "" });
    this.searchCriteria.param_list.push({ name: "insurance_type", value: frm.drpPayerType, option: "" });


    this.reportsService.getCPTWisePaymentReport(this.searchCriteria).subscribe(
      data => {
        this.lstClaimDetails = data;
        this.lstClaimDetailsDB = data;


        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }

  onInsuranceSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showInsuranceSearch = true;
    } else if (event.key == "Backspace") {
      this.insurance_Id = "";
      (this.searchForm.get("txtInsuranceName") as FormControl).setValue("");
      this.showInsuranceSearch = false;
    } else {
      this.showInsuranceSearch = false;
    }
  }
  addInsurance(obj) {
    debugger;
    this.insurance_Id = obj.insurance.insurance_id;
    let insObject = obj.insurance;
    (this.searchForm.get("txtInsuranceName") as FormControl).setValue(insObject.insurance_name);
    this.showInsuranceSearch = false;
  }

  onInsuranceSearchFocusOut(id) {
    if ((this.searchForm.get("txtInsuranceName") as FormControl).value == "" || (this.searchForm.get("txtInsuranceName") as FormControl).value == undefined) {
      (this.searchForm.get("txtInsuranceName") as FormControl).setValue(null);
      this.insurance_Id = "";
    }
  }
  closeInsuranceSearch(recordId) {
    this.showInsuranceSearch = false;
  }
  onPayerSearchBlur() {

    if (this.payerId == undefined && this.showPayerSearch == false) {
      this.payerId = "";
      this.searchForm.get("txtpayerSearch").setValue(null);
    }
  }


  onPayerSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPayerSearch = true;
    } else if (event.key == "Backspace") {
      this.payerId = "";
      (this.searchForm.get('txtpayerSearch') as FormControl).setValue("");
      this.showPayerSearch = false;
    } else {
      this.showPayerSearch = false;
    }
  }


  openSelectPayer(patObject) {
    debugger;
    this.payerId = patObject.payer_number;

    (this.searchForm.get('txtpayerSearch') as FormControl).setValue(patObject.name + " (" + patObject.payer_number + ")");

    this.showPayerSearch = false;
  }
  closePayerSearch() {
    this.showPayerSearch = false;
    this.onPayerSearchBlur();
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

  dateType:string='Payment Date';
  onDateTypeChange(type: string) {
    this.dateType = type;
  }

}
