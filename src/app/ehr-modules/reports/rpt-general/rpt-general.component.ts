import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralService } from 'src/app/services/general/general.service';
import { ReportsService } from '../../../services/reports.service';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { excelService } from 'src/app/shared/excelService';

@Component({
  selector: 'rpt-general',
  templateUrl: './rpt-general.component.html',
  styleUrls: ['./rpt-general.component.css']
})
export class RptGeneralComponent implements OnInit {

  generalReportForm: FormGroup;
  isLoading: boolean = false;
  lstGeneralReport: Array<any>;
  lstGeneralReportHeadder;
  recordCount: number = 0;
  reasonDescription: string = "";
  reasonSP: string = "";
  reportOptions: Array<any>;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,private excel: excelService,
  private formBuilder: FormBuilder, private logMessage: LogMessage,
  private dateTimeUtil: DateTimeUtil, private generalService: GeneralService,
  private reportsService: ReportsService,private ngbModal: NgbModal) { }

  ngOnInit(){
    this.buildForm();
    this.getGeneralReportOptions();
  }
  buildForm() {
    this.generalReportForm = this.formBuilder.group({
      //dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
      //  Validators.required,
      //  datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      //])),
      //dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
      //  Validators.required,
      //  datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      //])),
      //cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'':this.lookupList.logedInUser.defaultProvider),
      //cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'':this.lookupList.logedInUser.defaultLocation),
      cmbReport: this.formBuilder.control('')
    })
  }//end buldform
  getGeneralReportOptions(){
    this.reportsService.getGeneralReportOptions(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        debugger;
        this.reportOptions = data as Array<any>;
      },
      error => {
        this.getreportOptionsListError(error);
      }
    );
  }
  getreportOptionsListError(error) {
    this.logMessage.log("getGeneralReportOptions Error." + error);
  }

  searchGeneralReport(formData){

    if ((this.generalReportForm.get('cmbReport') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Select Report', "Please Select Report.", AlertTypeEnum.WARNING)
      return;
    }
    
    this.isLoading = true;
    this.lstGeneralReport =undefined;
    // let searchCriteria: SearchCriteria = new SearchCriteria();
    // searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    // searchCriteria.param_list = [];

    //let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    //let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    //searchCriteria.param_list.push({ name: "dateFrom", value: vardateFrom, option: "" });
    //searchCriteria.param_list.push({ name: "dateTo", value: vardateTo, option: "" });
    //searchCriteria.param_list.push({ name: "cmbProvider", value: formData.cmbProvider == undefined ? '' : formData.cmbProvider, option: "" });
    //searchCriteria.param_list.push({ name: "cmbLocation", value: formData.cmbLocation == undefined ? '' : formData.cmbLocation, option: "" });
    //searchCriteria.param_list.push({ name: "procedure", value: this.reasonSP, option: "" });
    debugger;
    this.reportsService.searchGeneralReport(this.reasonSP, this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        debugger;
        this.isLoading = false;
        this.lstGeneralReport = data["lst_log"] as Array<any>;
        this.recordCount = this.lstGeneralReport.length;
      },
      error => {
        this.isLoading = false;
        this.getGeneralReportError(error);
      }
    );
  }
  getGeneralReportError(error) {
    this.logMessage.log("searchGeneralReport Error." + error);
  }
  reportOptionsChange(val){
    this.reasonDescription = "";
    this.reasonSP = "";
debugger;
    if(this.reportOptions.length>0){
      for(let i=0; i < this.reportOptions.length; i++){
        if(val == this.reportOptions[i].id){
          this.reasonDescription = this.reportOptions[i].name +' ('+ this.reportOptions[i].address +')';
          this.reasonSP = this.reportOptions[i].phone;
          this.lstGeneralReportHeadder = this.reportOptions[i].npi.split(',');
          break;
        }
      }
    }
    
  }
  exportAsXLSX(){
    this.excel.exportAsExcelFile(this.lstGeneralReport, this.lstGeneralReportHeadder.toString(), 'RPT_GENERAL');
  }
}