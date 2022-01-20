import { Component, OnInit, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ReportsService } from 'src/app/services/reports.service';
import { excelService } from 'src/app/shared/excelService';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertTypeEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'rpt-provider-work',
  templateUrl: './rpt-provider-work.component.html',
  styleUrls: ['./rpt-provider-work.component.css']
})
export class RptProviderWorkComponent implements OnInit {
  isLoading: boolean = false;
  providerWorkReportForm: FormGroup;
  lstProviderWork: Array<any>;
  selectedRow;
  totalApp = "0000";
  totalEncounter = "0000";
  Totalclaim = "0000";
  TotalAmt = "$0.00";

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, private formBuilder: FormBuilder,private modalService: NgbModal,
  private dateTimeUtil: DateTimeUtil, private reportsService: ReportsService,private excel: excelService) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    this.providerWorkReportForm = this.formBuilder.group({
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'':this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'':this.lookupList.logedInUser.defaultLocation)
    })
  }
  onSearch(values){
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];

    let dateFrom = this.dateTimeUtil.getStringDateFromDateModel(values.dateFrom);
    let dateTo = this.dateTimeUtil.getStringDateFromDateModel(values.dateTo);
    
    searchCriteria.param_list.push({ name: "dateFrom", value: dateFrom, option: "" });
    searchCriteria.param_list.push({ name: "dateTo", value: dateTo, option: "" });

    if((this.providerWorkReportForm.get('cmbProvider') as FormControl).value!=null && (this.providerWorkReportForm.get('cmbProvider') as FormControl).value!="null")
      searchCriteria.param_list.push({ name: "cmbProvider", value: (this.providerWorkReportForm.get('cmbProvider') as FormControl).value, option: "" });
    if((this.providerWorkReportForm.get('cmbLocation') as FormControl).value!=null && (this.providerWorkReportForm.get('cmbLocation') as FormControl).value!="null")
      searchCriteria.param_list.push({ name: "cmbLocation", value: (this.providerWorkReportForm.get('cmbLocation') as FormControl).value, option: "" });
    
    this.reportsService.getProviderWork(searchCriteria).subscribe(
      data => {
        lstProviderWork: new Array();
        this.lstProviderWork = data as Array<any>;
        this.CalculatePaymentSummary()
        this.isLoading = false;
      },error => {
        this.isLoading = false;
        return;
      }
    );
  }
  onSelectionChange(row){
    this.selectedRow = row.row_id;
  }
  exportAsXLSX() {
    debugger;
    if(this.lstProviderWork!=undefined || this.lstProviderWork !=null)
      this.excel.exportAsExcelFile(this.lstProviderWork, 'provider_name,location_name,loc_total,enc_total,notexist,claim_loc_total,amt_loc_total,total_app,total_enc,claim_total,amt_total','Provider Work Report');
    else{
      GeneralOperation.showAlertPopUp(this.modalService, 'Export To Excel', "Record not found to export.", AlertTypeEnum.WARNING);
      return false;
    }
  }
  CalculatePaymentSummary(){
    debugger;
    if(this.lstProviderWork != undefined && this.lstProviderWork.length>0){
      let total_App = 0;
      let total_Encount = 0;
      let total_Claim = 0;
      let total_Amt = 0;
      for (var i = 0; i < this.lstProviderWork.length; i++) {
        total_App += Number(this.lstProviderWork[i].total_app == null ? "0.00" : this.lstProviderWork[i].total_app);
        total_Encount += Number(this.lstProviderWork[i].enc_total == null ? "0.00" : this.lstProviderWork[i].enc_total);
        total_Claim += Number(this.lstProviderWork[i].claim_total == null ? "0.00" : this.lstProviderWork[i].claim_total);
        total_Amt += Number(this.lstProviderWork[i].amt_total == null ? "0.00" : this.lstProviderWork[i].amt_total);
      }
      this.totalApp = "";
      this.totalEncounter = "";
      this.Totalclaim = "";
      this.TotalAmt = "";

      this.totalApp = total_App.toString();
      this.totalEncounter = total_Encount.toString();
      this.Totalclaim = total_Claim.toString();
      this.TotalAmt = total_Amt.toString();
    }
  }
}