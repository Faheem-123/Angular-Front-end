import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { LogMessage } from 'src/app/shared/log-message';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ReportsService } from 'src/app/services/reports.service';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateModel } from 'src/app/models/general/date-model';
import { NgbDatepickerNavigateEvent } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker';


@Component({
  selector: 'rpt-provider-wise-collection',
  templateUrl: './rpt-provider-wise-collection.component.html',
  styleUrls: ['./rpt-provider-wise-collection.component.css']
})
export class RptProviderWiseCollectionComponent implements OnInit {
  
  strProviderID: String = "";
  strLocationID: String = "";
  yearMonth:string='';
  yearMonthDisplay:string='';
  lstProviderWiseColl: Array<any>;  
  isLoading: boolean = false;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private reportsService: ReportsService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) { }
  providerWiseCollectionForm: FormGroup;
  
  
  ngOnInit() {
    this.buildForm();
  }
/*
  ngAfterViewInit(){
    debugger;
    let month = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM);
    //let fmonth;
    //if(Number(month.getMonth())+Number(1) < 10)
    //  fmonth = "0"+ month.getMonth();
    //else
     // fmonth = Number(month.getMonth()) + Number(1);

    (this.providerWiseCollectionForm.get("cmbMonthsdaywise") as FormControl).setValue(month.toString());
  }
  */
  buildForm() {

    let today: DateModel = this.dateTimeUtil.getCurrentDateModel();
    this.yearMonth = String("0000" + today.year).slice(-4) + '-' + String("00" + today.month).slice(-2);


    this.providerWiseCollectionForm = this.formBuilder.group({
      dpMonthYear: this.formBuilder.control(this.yearMonth),
      //txtYeardaywise: this.formBuilder.control(this.dateTimeUtil.getDateTimeFormatedString(this.dateTimeUtil.getCurrentDateTimeDate(),DateTimeFormat.DATEFORMAT_YYYY)),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'null':this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'null':this.lookupList.logedInUser.defaultLocation)      
    })
  }

  
  dateNavigate($event: NgbDatepickerNavigateEvent) {
    this.yearMonth = String("0000" + $event.next.year).slice(-4) + '-' + String("00" + $event.next.month).slice(-2);
  }

  searchPayRoll() {
    debugger;    
    if (this.yearMonth != undefined && this.yearMonth != '' && !this.dateTimeUtil.isValidDateTime(this.yearMonth, DateTimeFormat.DATEFORMAT_YYYY_MM)) {      
      GeneralOperation.showAlertPopUp(this.modalService, 'Year Month Selection', "Month and or Year is invalid.", AlertTypeEnum.WARNING);
      return;
    }

    //if ((this.providerWiseCollectionForm.get('cmbMonthsdaywise') as FormControl).value <= 0) {
//      GeneralOperation.showAlertPopUp(this.modalService, 'Month Selection', "Pleae select Month.", AlertTypeEnum.WARNING);
  //    return;
    //}
    //if ((this.providerWiseCollectionForm.get('txtYeardaywise') as FormControl).value == "" || (this.providerWiseCollectionForm.get('txtYeardaywise') as FormControl).value == null || (this.providerWiseCollectionForm.get('txtYeardaywise') as FormControl).value.length != 4) {
//      GeneralOperation.showAlertPopUp(this.modalService, 'Year Selection', "Please enter 4 digit Year.", AlertTypeEnum.WARNING);
  //    return;
    //}

    //this.yearMonth=(this.providerWiseCollectionForm.get('txtYeardaywise') as FormControl).value+"-"+(this.providerWiseCollectionForm.get('cmbMonthsdaywise') as FormControl).value;
   
    this.isLoading = true; //bloack UI
   
    this.yearMonthDisplay=this.dateTimeUtil.convertDateTimeFormat(this.yearMonth,DateTimeFormat.DATEFORMAT_YYYY_MM,DateTimeFormat.DATEFORMAT_MMMM_YYYY);

    this.strProviderID = (this.providerWiseCollectionForm.get('cmbProvider') as FormControl).value=="null"?null:(this.providerWiseCollectionForm.get('cmbProvider') as FormControl).value;
    this.strLocationID = (this.providerWiseCollectionForm.get('cmbLocation') as FormControl).value=="null"?null:(this.providerWiseCollectionForm.get('cmbLocation') as FormControl).value;

    let providerWiseCollSearch: SearchCriteria = new SearchCriteria();
    providerWiseCollSearch.practice_id = this.lookupList.practiceInfo.practiceId;
    providerWiseCollSearch.param_list = [];

    //providerWiseCollSearch.param_list.push({ name: "dateFromProviderWise", value: this.dateFromProviderWise, option: "" });
    providerWiseCollSearch.param_list.push({ name: "yearMonth", value: this.yearMonth, option: "" });
    providerWiseCollSearch.param_list.push({ name: "strProviderID", value: this.strProviderID, option: "" });
    providerWiseCollSearch.param_list.push({ name: "strLocationID", value: this.strLocationID, option: "" });

    this.reportsService.getPaymentCollectionSummaryProviderWise(providerWiseCollSearch).subscribe(
      data => {
        debugger;
        this.lstProviderWiseColl =  data as Array<any>;        
        this.isLoading = false;
      },
      error => {
        this.getPaymentCollectionSummaryProviderWiseError(error);
        this.isLoading = false;
        return;
      }
    );
  }
  getPaymentCollectionSummaryProviderWiseError(error) {
    this.logMessage.log("getPaymentCollectionSummaryProviderWiseError Error." + error);
  }
}
