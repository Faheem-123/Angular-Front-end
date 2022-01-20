import { Component, OnInit, Inject, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ReportsService } from 'src/app/services/reports.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { ClaimPostedPaymentDetailsComponent } from 'src/app/billing-modules/payment/claim-posted-payment-details/claim-posted-payment-details.component';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { CallingFromEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'rpt-cashregister-entry',
  templateUrl: './rpt-cashregister-entry.component.html',
  styleUrls: ['./rpt-cashregister-entry.component.css']
})
export class RptCashregisterEntryComponent implements OnInit {
  @Input() callingFrom: CallingFromEnum;
  frmSearch: FormGroup;
  lstClaimDetails;
  lstClaimDetailsDB;
  isLoading=false;
  patientId='';
  showPatientSearch=false;
  @ViewChild('inlineSearchDenialPatient') inlineSearchDenialPatient: InlinePatientSearchComponent;
  constructor(private formBuilder:FormBuilder, private dateTimeUtil:DateTimeUtil,private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage, private generalService: GeneralService,
    private reportsService: ReportsService,@Inject(LOOKUP_LIST) public lookupList: LookupList,private sortFilterPaginationService: SortFilterPaginationService) { }

  ngOnInit()
  {
    if (this.lookupList.practiceUsersList == undefined || this.lookupList.practiceUsersList.length == 0) 
    {
      this.getPracticeUsersList();
    }
    this.buildForm();
  }
  getPracticeUsersList() {
    this.generalService.getPracticeUsersList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.practiceUsersList = data as Array<any>;
      },
      error => {
        this.getPracticeUsersListError(error);
      }
    );
  }
  getPracticeUsersListError(error) {
    this.logMessage.log("getPracticeUsersList Error." + error);
  }
  buildForm() {

    let currentDateModel = this.dateTimeUtil.getCurrentDateModel();

    this.frmSearch = this.formBuilder.group({
      dpFrom: this.formBuilder.control(currentDateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpTo: this.formBuilder.control(currentDateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtPatientSearch: this.formBuilder.control(''),
      drpProvider: this.formBuilder.control('null'),
      drpLocation: this.formBuilder.control('null'),
      drpuser: this.formBuilder.control('null'),
      drpPayment: this.formBuilder.control('null'),
      drpStatus: this.formBuilder.control('null')
    }
    );
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
    this.patientId = undefined;
  }
  onPatientSearchBlur() {
    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.frmSearch.get("txtPatientSearch").setValue('');
    }
  }

  openSelectPatient(patObject) {
    this.patientId = patObject.patient_id;
    this.frmSearch.get("txtPatientSearch").setValue(patObject.name);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  searchCriteria: SearchCriteria;
onSearch(frm)
  {
    debugger;
    if((this.frmSearch.get('dpFrom') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.ngbModal,"Validation","Please Enter From Date",'warning')
      return;
    }
    if((this.frmSearch.get('dpTo') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.ngbModal,"Validation","Please Enter To Date",'warning')
      return;
    }
    
    this.isLoading=true;

    this.searchCriteria=new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];
    
    this.searchCriteria.param_list.push( { name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpFrom), option: ""});
    this.searchCriteria.param_list.push( { name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpTo), option: ""});
    if(frm.drpProvider!="" && frm.drpProvider!="null" && frm.drpProvider!=null && frm.drpProvider!="All")  
    {
      this.searchCriteria.param_list.push( { name: "provider_id", value: frm.drpProvider, option: ""});
    }
    if(frm.drpLocation!="" && frm.drpLocation!=null && frm.drpLocation!="null" && frm.drpLocation!="All")  
    {
      this.searchCriteria.param_list.push( { name: "location_id", value: frm.drpLocation, option: ""});
    }
    if(frm.drpuser!="" && frm.drpuser!=null && frm.drpuser!="null" && frm.drpuser!="All")  
    {
      this.searchCriteria.param_list.push( { name: "user_id", value: frm.drpuser, option: ""});
    }
    if(frm.drpPayment!="" && frm.drpPayment!=null && frm.drpPayment!="null" && frm.drpPayment!="All")  
    {
      this.searchCriteria.param_list.push( { name: "payment", value: frm.drpPayment, option: ""});
    }
    if(frm.drpStatus!="" && frm.drpStatus!=null && frm.drpStatus!="null" && frm.drpStatus!="All")  
    {
      this.searchCriteria.param_list.push( { name: "status", value: frm.drpStatus, option: ""});
    }
    if (this.patientId != '' && frm.txtPatientSearch != null && frm.txtPatientSearch != '')
      this.searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });

    this.reportsService.getCashRegisterReport(this.searchCriteria).subscribe(
      data=>{
        this.lstClaimDetails=data;
        this.lstClaimDetailsDB=data;           
        this.isLoading=false;
      },
      error=>{
        this.isLoading=false;
      }
    );
  }
  openPatient(data) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = data.patient_id;
    obj.patient_name = data.patient;
    this.openModuleService.openPatient.emit(obj);
  }
  selectedSummaryRow: number = 0;
  onselectionChange(index: number) {
    this.selectedSummaryRow = index;
  }
  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  postingDetails(obj)
  {
    const modalRef = this.ngbModal.open(ClaimPostedPaymentDetailsComponent, this.popUpOptionsLg);
    modalRef.componentInstance.eobEraId = obj.cash_register_id;
    modalRef.componentInstance.eobEraIdType = "CASH_REGISTER";
  }
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstClaimDetailsDB, this.headers, this.sortEvent, null, null,'');
    debugger;
    this.lstClaimDetails = sortFilterPaginationResult.list;
  }
}
