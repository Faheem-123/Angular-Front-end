import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { ReportsService } from 'src/app/services/reports.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { Color } from 'ng2-charts';
import { CurrencyPipe } from '@angular/common';
import { DateModel } from 'src/app/models/general/date-model';
import { NgbDatepickerNavigateEvent } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker';
import { excelService } from 'src/app/shared/excelService';
import { ExcelColumn } from 'src/app/models/general/excel-column';

@Component({
  selector: 'rpt-month-wise-charges-payment',
  templateUrl: './rpt-month-wise-charges-payment.component.html',
  styleUrls: ['./rpt-month-wise-charges-payment.component.css']
})
export class RptMonthWiseChargesPaymentComponent implements OnInit {

  searchFormGroup: FormGroup;

  lstReport: Array<any>;
  isLoading: boolean = false;

  //filterObj: any = [{ year_month: 'Total' }, { year_month: 'Average' }];

  public bpLineChartLabels: string[] = [];
  public bpLineChartType: string = 'line';
  public bpLineChartLegend: boolean = true;

  public bpLineChartData: any[] = [
    { data: [], label: 'Charges' },
    { data: [], label: 'Payment' },
    { data: [], label: 'Adjustment' },
    { data: [], label: 'Refund' }
  ];

  /*
  public bpLineChartData: any[] = [
    { data: [], label: 'Charges',lineTension: 0 ,fill: false},
    { data: [], label: 'Payment' ,lineTension: 0 ,fill: false},
    { data: [], label: 'Adjustment',lineTension: 0 ,fill: false },
    { data: [], label: 'Refund' ,lineTension: 0 ,fill: false}
  ];
  */

  // Blood Pressure Chart
  public bpLineChartOptions: any = {
    scaleShowVerticalLines: false,
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }


    ,
    tooltips: {
      mode: 'label',
      callbacks: {
        label: function (tooltipItem) {
          debugger;
          let tt = new CurrencyPipe('en-US').transform(tooltipItem.yLabel.toString(), 'USD', 'symbol', '1.2-2');
          // this.bpToolTip =tt;
          return tt;

        }
      }

    }


  };



  public bpLineChartColors: Array<Color> = [
    { // blue
      backgroundColor: 'rgba(63,127,191,0.2)',
      borderColor: '#2e7fc1',
      pointBackgroundColor: '#2e7fc1',

      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#2e7fc1'
    },
    { // green
      backgroundColor: 'rgba(40,167,69,0.2)',
      borderColor: '#28a745',
      pointBackgroundColor: '#28a745',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#28a745'
    },
    { // Yellow
      backgroundColor: 'rgba(254,207,95,0.2)',
      borderColor: '#fecf5f',
      pointBackgroundColor: '#fecf5f',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#fecf5f'
    },
    { // RED
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: '#ff6384',
      pointBackgroundColor: '#ff6384',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#ff6384'
    }


  ];



  yearMonthFrom: string = '';
  yearMonthTo: string = '';

  yearMonthFromDisplay: string = '';
  yearMonthToDisplay: string = '';

  constructor(private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage,
    private reportsService: ReportsService,
    private ngbModal: NgbModal,
    private excel: excelService) { }

  ngOnInit() {
    this.buildSearchForm();
  }

  buildSearchForm() {

    debugger;

    let dtFrom: DateModel = this.dateTimeUtil.getFirstDayOfYearDateModel();
    let today: DateModel = this.dateTimeUtil.getCurrentDateModel();

    this.yearMonthFrom = String("0000" + dtFrom.year).slice(-4) + '-' + String("00" + dtFrom.month).slice(-2);
    this.yearMonthTo = String("0000" + today.year).slice(-4) + '-' + String("00" + today.month).slice(-2);

    this.searchFormGroup = this.formBuilder.group({

      dpFrom: this.formBuilder.control(dtFrom, Validators.required),
      dpTo: this.formBuilder.control(today, Validators.required)

    }
    );    
  }



  dateFromNavigate($event: NgbDatepickerNavigateEvent) {
    this.yearMonthFrom = String("0000" + $event.next.year).slice(-4) + '-' + String("00" + $event.next.month).slice(-2);
  }
  dateToNavigate($event: NgbDatepickerNavigateEvent) {
    this.yearMonthTo = String("0000" + $event.next.year).slice(-4) + '-' + String("00" + $event.next.month).slice(-2);
  }



  validateSearchData(formData: any): boolean {
    let strMsg: string = '';
    if (this.yearMonthFrom != undefined && this.yearMonthFrom != '' && !this.dateTimeUtil.isValidDateTime(this.yearMonthFrom, DateTimeFormat.DATEFORMAT_YYYY_MM)) {
      strMsg = "Date From is not in correct valid.";
    }
    else if (this.yearMonthTo != undefined && this.yearMonthTo != '' && !this.dateTimeUtil.isValidDateTime(this.yearMonthTo, DateTimeFormat.DATEFORMAT_YYYY_MM)) {
      strMsg = "Date To is not in correct valid.";
    }

    if (strMsg == '') {
      strMsg = this.dateTimeUtil.validateDateFromDateTo(this.yearMonthFrom, this.yearMonthTo, DateTimeFormat.DATEFORMAT_YYYY_MM, true, true);
    }

    if (strMsg != '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Validation', strMsg, AlertTypeEnum.WARNING)
      return false;
    }
    return true;
  }



  onSearch(formData: any) {

    debugger;
    this.lstReport = undefined;

    if (!this.validateSearchData(formData)) {
      return;
    }

    debugger;

    this.yearMonthFromDisplay = this.dateTimeUtil.convertDateTimeFormat(this.yearMonthFrom, DateTimeFormat.DATEFORMAT_YYYY_MM, DateTimeFormat.DATEFORMAT_MMMM_YYYY);

    this.yearMonthToDisplay = this.dateTimeUtil.convertDateTimeFormat(this.yearMonthTo, DateTimeFormat.DATEFORMAT_YYYY_MM, DateTimeFormat.DATEFORMAT_MMMM_YYYY);



    this.isLoading = true;

    let searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "year_month_from", value: this.yearMonthFrom, option: '' },
      { name: "year_month_to", value: this.yearMonthTo, option: '' }
    ];

    this.reportsService.getMonthWiseChargesPaymentReport(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstReport = data as Array<any>;

        //this.lstReport = new ListFilterGeneralNotIn().transform(this.lstReport, this.filterObj);

        this.bpLineChartLabels = [];
        this.bpLineChartData[0].data = [];
        this.bpLineChartData[1].data = [];
        this.bpLineChartData[2].data = [];
        this.bpLineChartData[3].data = [];
        if (this.lstReport != undefined && this.lstReport.length > 0) {

          for (let i = 0; i < this.lstReport.length; i++) {
            if (!this.lstReport[i].is_aggregate) {
              this.bpLineChartLabels.push(this.lstReport[i].year_month);
              this.bpLineChartData[0].data.push(this.lstReport[i].total_charges);
              this.bpLineChartData[1].data.push(this.lstReport[i].total_payment);
              this.bpLineChartData[2].data.push(this.lstReport[i].total_adjusted);
              this.bpLineChartData[3].data.push(this.lstReport[i].total_refund);
            }
          }
        }

        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.logMessage.log("getMonthWiseChargesPaymentReport Error." + error);
      }
    );
  }

  exportToExcel() {

    if (this.lstReport == undefined || this.lstReport.length == 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Report', "There is no record to export.", AlertTypeEnum.INFO)
    }
    else {
      let lstColumns: Array<any> = new Array<any>();
      lstColumns = [
        new ExcelColumn('year_month', 'Year Month'),
        new ExcelColumn('total_claims', 'Claims', 'number'),
        new ExcelColumn('total_procedures', 'Procedures', 'number'),
        new ExcelColumn('total_charges', 'Charges', 'number'),
        new ExcelColumn('total_payment', 'Payment', 'number'),
        new ExcelColumn('total_adjusted', 'Adjustment', 'number'),
        new ExcelColumn('total_refund', 'Refund', 'number'),
        new ExcelColumn('ar_balance', 'A/R Balance', 'number')
      ]

      this.excel.exportAsExcelFileWithHeaders(this.lstReport, lstColumns, 'Monthly_Charges_Payment');
    }
  }
}
