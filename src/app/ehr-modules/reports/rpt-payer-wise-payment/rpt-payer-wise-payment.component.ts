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
  selector: 'rpt-payer-wise-payment',
  templateUrl: './rpt-payer-wise-payment.component.html',
  styleUrls: ['./rpt-payer-wise-payment.component.css']
})
export class RptPayerWisePaymentComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  
  searchForm:FormGroup;
  isLoading=false;
  lstClaimDetails;
  lstClaimDetailsDB; 
  lstPayerWisePaymentDetails;
  payerId='';
  constructor(private formBuilder:FormBuilder, private dateTimeUtil:DateTimeUtil,private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage,private excel:excelService,private sortFilterPaginationService: SortFilterPaginationService,
    private reportsService: ReportsService,@Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    debugger;
		this.searchForm = this.formBuilder.group({
      dateType: this.formBuilder.control(this.dateType),
      dpTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      drpProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'null':this.lookupList.logedInUser.defaultProvider),
      drpLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'null':this.lookupList.logedInUser.defaultLocation),
      txtpayerSearch: this.formBuilder.control("")
     })
  }
  searchCriteria: SearchCriteria;
  total_adjustments=0;
	total_paid=0;
  onSearch(frm)
  {
    debugger;
    if((this.searchForm.get('dpFrom') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.ngbModal,"Validation","Please Enter From Date",'warning')
      return;
    }
    if((this.searchForm.get('dpTo') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.ngbModal,"Validation","Please Enter To Date",'warning')
      return;
    }
    this.total_adjustments=0;
    this.total_paid=0;
    this.isLoading=true;

    this.searchCriteria=new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];
    this.searchCriteria.param_list.push( { name: "type", value: frm.dateType, option: ""});
    this.searchCriteria.param_list.push( { name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpFrom), option: ""});
    this.searchCriteria.param_list.push( { name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpTo), option: ""});
    
    if(this.payerId!='' && frm.txtpayerSearch!=null && frm.txtpayerSearch!='')  
    {
      this.searchCriteria.param_list.push( { name: "payer_id", value: this.payerId, option: ""});
    }
     
    if(frm.drpProvider!="" && frm.drpProvider!="null" && frm.drpProvider!=null && frm.drpProvider!="All")  
    {
      this.searchCriteria.param_list.push( { name: "provider_id", value: frm.drpProvider, option: ""});
    }
    if(frm.drpLocation!="" && frm.drpLocation!=null && frm.drpLocation!="null" && frm.drpLocation!="All")  
    {
      this.searchCriteria.param_list.push( { name: "location_id", value: frm.drpLocation, option: ""});
    }
    this.reportsService.getPayerWisePayment(this.searchCriteria).subscribe(
      data=>
      {
        this.lstClaimDetails=data;
        this.lstClaimDetailsDB=data;
        for(let i=0;i<this.lstClaimDetails.length;i++)
						{
							this.total_paid=this.total_paid+Number(this.lstClaimDetails[i].paid_amt.toString());							
							this.total_adjustments=this.total_adjustments+Number(this.lstClaimDetails[i].adjusted_amount.toString());
            }
            this.total_paid=Number(this.total_paid.toFixed(2));							
            this.total_adjustments=Number(this.total_adjustments.toFixed(2));
        this.isLoading=false;
      },
      error=>
      {
        this.logMessage.log(error);
        this.isLoading=false;
      }
    );
  }
  onPayerSearchBlur() {
   
    if (this.payerId == undefined && this.showPayerSearch == false) {
      this.payerId="";
      this.searchForm.get("txtpayerSearch").setValue(null);
    }
  }
  
  showPayerSearch=false;
  onPayerSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPayerSearch = true;
    }
    else {
      this.showPayerSearch = false;
    }
  }
  openSelectPayer(patObject) { 
    debugger;
    this.payerId = patObject.payerid;
        
    (this.searchForm.get('txtpayerSearch') as FormControl).setValue(patObject.name+" ("+patObject.payer_number+")");

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
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstClaimDetailsDB, this.headers, this.sortEvent, null, null,'');
    debugger;
    this.lstClaimDetails = sortFilterPaginationResult.list;
  }
  loadmodule=false;
  selectedPayername='';
  detail_total_adjustments=0;
  detail_total_paid=0;
  detail_total_writeoff=0;
  detail_total_risk=0;
  openDetail(obj,frm)
  {
    this.loadmodule=true
    this.lstPayerWisePaymentDetails=[];
    this.detail_total_adjustments=0;
    this.detail_total_paid=0;
    this.detail_total_writeoff=0;
    this.detail_total_risk=0;

    this.selectedPayername=obj.name;
    this.searchCriteria=new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];
    this.searchCriteria.param_list.push( { name: "type", value: frm.dateType, option: ""});
    this.searchCriteria.param_list.push( { name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpFrom), option: ""});
    this.searchCriteria.param_list.push( { name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpTo), option: ""});
    this.searchCriteria.param_list.push( { name: "payer_id", value: obj.payer_id, option: ""});     
    if(frm.drpProvider!="" && frm.drpProvider!="null" && frm.drpProvider!=null && frm.drpProvider!="All")  
    {
      this.searchCriteria.param_list.push( { name: "provider_id", value: frm.drpProvider, option: ""});
    }
    if(frm.drpLocation!="" && frm.drpLocation!=null && frm.drpLocation!="null" && frm.drpLocation!="All")  
    {
      this.searchCriteria.param_list.push( { name: "location_id", value: frm.drpLocation, option: ""});
    }
    this.reportsService.getPayerWisePaymentDetails(this.searchCriteria).subscribe(
      data=>
      {
        this.lstPayerWisePaymentDetails=data;
        for (let i = 0; i < this.lstPayerWisePaymentDetails.length; i++) {
          this.detail_total_paid = this.detail_total_paid + Number(this.lstPayerWisePaymentDetails[i].paid_amount.toString());
          this.detail_total_writeoff = this.detail_total_writeoff + Number(this.lstPayerWisePaymentDetails[i].write_off.toString());
          this.detail_total_risk = this.detail_total_risk + Number(this.lstPayerWisePaymentDetails[i].risk_amount.toString());
          this.detail_total_adjustments = this.detail_total_adjustments + Number(this.lstPayerWisePaymentDetails[i].adjust_amount.toString());
        }
        
        this.detail_total_paid=Number(this.detail_total_paid.toFixed(2));							
        this.detail_total_writeoff=Number(this.detail_total_writeoff.toFixed(2));
        this.detail_total_risk=Number(this.detail_total_risk.toFixed(2));							
        this.detail_total_adjustments=Number(this.detail_total_adjustments.toFixed(2));

        this.isLoading=false;
      },
      error=>
      {
        this.logMessage.log(error);
        this.isLoading=false;
      }
    );
  }
  navigateBackToSSummary(){
    this.loadmodule=false;
  }
  selectedRow=0;
  onSelectionChange(index)
  {
    this.selectedRow=index;
  }

  dateType:string='Claim Created';
  onDateTypeChange(type: string) {
    this.dateType = type;
  }
}
