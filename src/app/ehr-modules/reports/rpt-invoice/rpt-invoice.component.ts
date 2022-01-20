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
  selector: 'rpt-invoice',
  templateUrl: './rpt-invoice.component.html',
  styleUrls: ['./rpt-invoice.component.css']
})
export class RptInvoiceComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  
  isCollapsed = false;
  searchForm:FormGroup;
  isLoading=false;
  lstClaimDetails;
  lstClaimDetailsDB;
  constructor(private formBuilder:FormBuilder, private dateTimeUtil:DateTimeUtil,private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage,private excel:excelService,private sortFilterPaginationService: SortFilterPaginationService,
    private reportsService: ReportsService,@Inject(LOOKUP_LIST) public lookupList: LookupList,private generalOperation:GeneralOperation) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    debugger;
		this.searchForm = this.formBuilder.group({
      dptoDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpfromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel())     
     })
  }
  searchCriteria: SearchCriteria;
  totalBalance = 0;
  onSearch(frm)
  {
    debugger;
    if((this.searchForm.get('dpfromDate') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.ngbModal,"Validation","Please Enter From Date",'warning')
      return;
    }
    if((this.searchForm.get('dptoDate') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.ngbModal,"Validation","Please Enter To Date",'warning')
      return;
    }
    this.totalBalance = 0;
    
    this.isLoading=true;

    this.searchCriteria=new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];
    
    this.searchCriteria.param_list.push( { name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpfromDate), option: ""});
    this.searchCriteria.param_list.push( { name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dptoDate), option: ""});
    
    this.reportsService.getInvoiceReport(this.searchCriteria).subscribe(
      data=>{
        this.lstClaimDetails=data;
        this.lstClaimDetailsDB=data;
        for(let i=0;i<this.lstClaimDetails.length;i++)
						{
							this.totalBalance = this.totalBalance + Number(parseFloat(this.lstClaimDetails[i].check_amount).toFixed(2));
            }
           
        this.isLoading=false;
      },
      error=>{
        this.isLoading=false;
      }
    );
  }
  exportAsXLSX(){
    this.excel.exportAsExcelFile(this.lstClaimDetails, 'date,name,check_date,check_number,check_amount,type', 'Invoice');
  }
  print(){
    debugger;
    let total=0;
    let strhtml="";
    strhtml="<html><head></head><body>" +
      "<table width='750'>"+
      "<tr > <td rowspan='3' align='left' style='font-size:22px'><span class='styleTopHeader'><b>"+this.lookupList.practiceInfo.practiceName+"</b></span></td></tr>"+
      "<tr><td align='right' style='font-size:24px'><span class='styleTopHeader'><b>Invoice</b></td></tr>"+
      "<tr><td align='right'><table id='customers'><td style='background-color: #cee6f8; color:#000000; font-weight:bold;'>Date</td><td style='background-color: #cee6f8; color:#000000; font-weight:bold;'>Amount</td>"+
      "<tr><td>"+this.dateTimeUtil.getStringDateFromDateModel(this.searchForm.get('dpfromDate').value)+" to "+this.dateTimeUtil.getStringDateFromDateModel(this.searchForm.get('dptoDate').value)+"</td><td>@total</td></tr>"+
      "</table></td></tr>"+
      "</table><br><br>" +
      "<table width='750' id='customers'>" +
        "<thead style='background-color: #0376a8; color:#ffffff' text-align: center; font-weight: bold; >" +
          "<tr>" +
            "<td colspan='5' align='center' style='font-size:20px'><b>Invoice Detail</b></td>" +
          "</tr>" +
          "<tr style='background-color: #cee6f8; color:#000000; font-weight:bold;'>" +
            "<td width='20'>Date</td>" +
            "<td valign='center'>Payment From</td>" +
            "<td valign='center'>Check Date</td>" +
            "<td valign='center'>Check #</td>" +
            "<td valign='center'>Amount</td>" +
          "</tr></thead>" ;
    for(let i=0;i<this.lstClaimDetails.length;i++)
    {
      total = total + Number(parseFloat(this.lstClaimDetails[i].check_amount).toFixed(2));
      
      if(i%2==1)
        strhtml+="<tr style='background-color: #f3f6fb;'>";
      else
        strhtml+="<tr>";
      
      strhtml+="<td>"+this.lstClaimDetails[i].date+"</td>";
      strhtml+="<td>"+this.lstClaimDetails[i].name+"</td>";
      strhtml+="<td>"+this.lstClaimDetails[i].check_date+"</td>";
      strhtml+="<td>"+this.lstClaimDetails[i].check_number+"</td>";
      strhtml+="<td>"+Number(parseFloat(this.lstClaimDetails[i].check_amount).toFixed(2))+"</td>";
      strhtml+="</tr>";
    }
    strhtml+="" +
        "</table>"+
      "</body></html>";
      strhtml=this.generalOperation.ReplaceAll(strhtml,"@total","$ "+parseFloat(total.toString()).toFixed(2));
      let disp_setting = "toolbar=yes,location=no,directories=yes,menubar=yes,";
      disp_setting += "scrollbars=yes,width=790,  left=100, top=25";
      var w = window.open("", "", disp_setting);
      w.document.open();
      w.document.write(strhtml);
      w.document.close();
      w.focus();
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
