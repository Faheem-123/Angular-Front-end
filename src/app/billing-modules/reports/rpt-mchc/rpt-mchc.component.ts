import { Component, OnInit, Inject } from '@angular/core';
import { NgbTabChangeEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportsService } from 'src/app/services/reports.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { excelService } from 'src/app/shared/excelService';

@Component({
  selector: 'rpt-mchc',
  templateUrl: './rpt-mchc.component.html',
  styleUrls: ['./rpt-mchc.component.css']
})
export class RptMchcComponent implements OnInit {

  searchFormGroup: FormGroup;
  //YTDReportForm: FormGroup;

  isLoading = false;
  lstSummary: Array<any>;
  // lstYeartoDateSummary: Array<any>;

  total_encounter = 0;
  no_of_claims = 0;
  total_claim_charges = 0;
  total_payment_received = 0;
  total_payment_posted = 0;
  total_denial_received = 0;
  total_denial_worked = 0;
  patient_payment = 0;

  // yearMonthDisplayMonthly:string='';
  yearMonthDisplay: string = '';

  constructor(private reportsService: ReportsService, private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private modalService: NgbModal, private excel: excelService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.buildForm();
    let month = this.dateTimeUtil.getCurrentDateTimeDate();
    let fmonth = String("00" + (month.getMonth()+1)).slice(-2);
    (this.searchFormGroup.get("cmbMonthsMTD") as FormControl).setValue(fmonth.toString());

    //this.getMonthWise();
  }
  buildForm() {
    this.searchFormGroup = this.formBuilder.group({
      cmbMonthsMTD: this.formBuilder.control(null, Validators.required),
      txtYearMTD: this.formBuilder.control(this.dateTimeUtil.getDateTimeFormatedString(this.dateTimeUtil.getCurrentDateTimeDate(), DateTimeFormat.DATEFORMAT_YYYY))
    }

    );
    /*
    this.YTDReportForm = this.formBuilder.group({
      //cmbMonthsYTD: this.formBuilder.control(null, Validators.required),
      txtYearYTD: this.formBuilder.control(this.dateTimeUtil.getDateTimeFormatedString(this.dateTimeUtil.getCurrentDateTimeDate(), DateTimeFormat.DATEFORMAT_YYYY))
    }
    );
    */
  }
  /*
  onTabChange(event: NgbTabChangeEvent) {
    switch (event.nextId) {
      case 'monthwise':
        let month = this.dateTimeUtil.getCurrentDateTimeDate();
        let fmonth;
        if (Number(month.getMonth()) + Number(1) < 10)
          if (month.getMonth() == 0)
            fmonth = "01";
          else
            fmonth = "0" + month.getMonth();

        else
          fmonth = Number(month.getMonth()) + Number(1);

        (this.searchFormGroup.get("cmbMonthsMTD") as FormControl).setValue(fmonth.toString());
        //this.getMonthWise();
        break;
      case 'yearwise':
        //this.getYearWise();
        break;
    }
  }
  */
  // getMonthWise() {
  //   let month = this.dateTimeUtil.getCurrentDateTimeDate();
  //   let fmonth;
  //   if(Number(month.getMonth())+Number(1) < 10){
  //     if(month.getMonth() == 0)
  //       fmonth = "01";
  //     else
  //       fmonth = "0"+ month.getMonth();
  //   }  

  //   else
  //     fmonth = Number(month.getMonth()) + Number(1);

  //   //this.isLoading = true;
  //   alert(month.getMonth());


  //   let MTDYTDrpt: SearchCriteria = new SearchCriteria();
  //   MTDYTDrpt.practice_id = this.lookupList.practiceInfo.practiceId;
  //   MTDYTDrpt.param_list = [];
  // MTDYTDrpt.param_list.push({ name: "from", value: (this.searchFormGroup.get('txtYearYTD') as FormControl).value + '-' + fmonth + '-01', option: "" });
  // MTDYTDrpt.param_list.push({ name: "tabType", value: 'mtd', option: "" });

  //   this.reportsService.searchReport(MTDYTDrpt).subscribe(
  //     data => {
  //       this.lstSummary = data as Array<any>;
  //       this.isLoading = false;
  //     },
  //     error => {
  //       this.isLoading = false;
  //       return;
  //     }
  //   );

  //   // let searchCriteria: SearchCriteria = new SearchCriteria();
  //   // searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
  //   // searchCriteria.param_list = [];
  //   // searchCriteria.param_list.push({ name: "tabType", value: 'mtd', option: "" });

  //   // this.reportsService.getMonthorYearWiseRpt(searchCriteria).subscribe(
  //   //   data => {
  //   //     lstSummary: new Array();
  //   //     this.lstSummary = data as Array<any>;
  //   //     this.isLoading = false;
  //   //   },
  //   //   error => {
  //   //     this.isLoading = false;
  //   //   }
  //   // );
  // }
  // getYearWise() {
  //   //this.isLoading = true;


  //   let month = this.dateTimeUtil.getCurrentDateTimeDate();
  //   let fmonth;
  //   if(Number(month.getMonth())+Number(1) < 10)
  //     fmonth = "0"+ month.getMonth();
  //   else
  //     fmonth = Number(month.getMonth()) + Number(1);

  //   this.isLoading = true;


  //   let MTDYTDrpt: SearchCriteria = new SearchCriteria();
  //   MTDYTDrpt.practice_id = this.lookupList.practiceInfo.practiceId;
  //   MTDYTDrpt.param_list = [];
  // MTDYTDrpt.param_list.push({ name: "from", value: (this.searchFormGroup.get('txtYearYTD') as FormControl).value + '-' + fmonth + '-01', option: "" });
  // MTDYTDrpt.param_list.push({ name: "tabType", value: 'ytd', option: "" });

  //   this.reportsService.searchReport(MTDYTDrpt).subscribe(
  //     data => {
  //       this.lstYeartoDateSummary = data as Array<any>;
  //       this.isLoading = false;
  //     },
  //     error => {
  //       this.isLoading = false;
  //       return;
  //     }
  //   );

  //   // let searchCriteria: SearchCriteria = new SearchCriteria();
  //   // searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
  //   // searchCriteria.param_list = [];
  //   // searchCriteria.param_list.push({ name: "tabType", value: 'ytd', option: "" });

  //   // this.reportsService.getMonthorYearWiseRpt(searchCriteria).subscribe(
  //   //   data => {
  //   //     lstYeartoDateSummary: new Array();
  //   //     this.lstYeartoDateSummary = data as Array<any>;
  //   //     this.isLoading = false;
  //   //   },
  //   //   error => {
  //   //     this.isLoading = false;
  //   //   }
  //   // );
  // }
  onSearch(value) {
    //searchFormGroup
    debugger;
    if ((this.searchFormGroup.get('cmbMonthsMTD') as FormControl).value == undefined && (this.searchFormGroup.get('cmbMonthsMTD') as FormControl).value != 'full_year') {
      GeneralOperation.showAlertPopUp(this.modalService, 'Month Selection', "Pleae select Month.", AlertTypeEnum.WARNING);
      return;
    }

    if ((this.searchFormGroup.get('txtYearMTD') as FormControl).value == "" || (this.searchFormGroup.get('txtYearMTD') as FormControl).value == null || (this.searchFormGroup.get('txtYearMTD') as FormControl).value.length != 4) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Year Selection', "Please enter 4 digit year.", AlertTypeEnum.WARNING);
      return;
    }

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];
    // from--2020-01-01
    // to -- 2020-01-06

    let startDate: string = '';
    let endDate: string = '';

    if ((this.searchFormGroup.get('cmbMonthsMTD') as FormControl).value == 'full_year') {
      startDate = (this.searchFormGroup.get('txtYearMTD') as FormControl).value + '-01-01';
      endDate = (this.searchFormGroup.get('txtYearMTD') as FormControl).value + '-12-31';
      this.yearMonthDisplay = 'Full Year -' + (this.searchFormGroup.get('txtYearMTD') as FormControl).value;
    }
    else {
      startDate = (this.searchFormGroup.get('txtYearMTD') as FormControl).value + '-' + (this.searchFormGroup.get('cmbMonthsMTD') as FormControl).value + '-01';
      endDate = this.dateTimeUtil.getEndDateOfMonth(startDate);

      this.yearMonthDisplay = this.dateTimeUtil.convertDateTimeFormat(startDate, DateTimeFormat.DATEFORMAT_YYYY_MM_DD, DateTimeFormat.DATEFORMAT_MMMM_YYYY);
      //   (this.searchFormGroup.get('txtYearMTD') as FormControl).value + '-' + (this.searchFormGroup.get('cmbMonthsMTD') as FormControl).value ;

    }

    searchCriteria.param_list.push({ name: "dateFrom", value: startDate, option: "" });
    searchCriteria.param_list.push({ name: "dateTo", value: endDate, option: "" });
    //MTDYTDrpt.param_list.push({ name: "tabType", value: 'mtd', option: "" });



    this.isLoading = true;
    this.reportsService.searchReport(searchCriteria).subscribe(
      data => {
        this.lstSummary = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        return;
      }
    );
  }
  /*
  searchYTDRpt(value) {
    //YTDReportForm
    // if ((this.YTDReportForm.get('cmbMonthsYTD') as FormControl).value <= 0) {
    //   GeneralOperation.showAlertPopUp(this.modalService, 'Month Selection', "Pleae select Month.", AlertTypeEnum.WARNING);
    //   return;
    // }
    if ((this.YTDReportForm.get('txtYearYTD') as FormControl).value == "" || (this.YTDReportForm.get('txtYearYTD') as FormControl).value == null || (this.YTDReportForm.get('txtYearYTD') as FormControl).value.length != 4) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Year Selection', "Please enter 4 digit year.", AlertTypeEnum.WARNING);
      return;
    }
    let MTDYTDrpt: SearchCriteria = new SearchCriteria();
    MTDYTDrpt.practice_id = this.lookupList.practiceInfo.practiceId;
    MTDYTDrpt.param_list = [];
    // from--2020-01-01
    // to -- 2020-01-06
    this.isLoading = true;

    let startDate: string = (this.YTDReportForm.get('txtYearYTD') as FormControl).value + '-01-01';
    let endDate: string = (this.YTDReportForm.get('txtYearYTD') as FormControl).value + '-12-31';
    MTDYTDrpt.param_list.push({ name: "dateFrom", value: startDate, option: "" });
    MTDYTDrpt.param_list.push({ name: "dateTo", value: endDate, option: "" });

    //MTDYTDrpt.param_list.push({ name: "from", value: (this.YTDReportForm.get('txtYearYTD') as FormControl).value + '-01-01', option: "" });
    //MTDYTDrpt.param_list.push({ name: "tabType", value: 'ytd', option: "" });

    this.yearDisplayYearly = (this.YTDReportForm.get('txtYearYTD') as FormControl).value 

    this.reportsService.searchReport(MTDYTDrpt).subscribe(
      data => {
        this.lstYeartoDateSummary = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        return;
      }
    );

  }
  */
  exportToExcel() {
    if (this.lstSummary.length > 0)
      this.excel.exportAsExcelFile(this.lstSummary, 'col1,col2', 'BILLING_SUMMARY_' + this.yearMonthDisplay.replace(",", "").replace("-", "_").replace(" ", ""));
  }
  /*
  exportXLSXYearToDate() {
    if (this.lstYeartoDateSummary.length > 0)
      this.excel.exportAsExcelFile(this.lstYeartoDateSummary, 'col1,col2', 'Year_To_Date_RPT_BILLING_SUMMARY');

  }
  */
}