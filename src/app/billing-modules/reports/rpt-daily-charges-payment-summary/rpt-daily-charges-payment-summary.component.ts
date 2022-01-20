import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateModel } from 'src/app/models/general/date-model';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ReportsService } from 'src/app/services/reports.service';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { excelService } from 'src/app/shared/excelService';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbDatepickerNavigateEvent } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ExcelColumn } from 'src/app/models/general/excel-column';

@Component({
  selector: 'rpt-daily-charges-payment-summary',
  templateUrl: './rpt-daily-charges-payment-summary.component.html',
  styleUrls: ['./rpt-daily-charges-payment-summary.component.css']
})
export class RptDailyChargesPaymentSummaryComponent implements OnInit {

  searchFormGroup: FormGroup;

  lstReport: Array<any>;
  isLoading: boolean = false;
  yearMonthDisplay: string = '';
  yearMonth: string = '';
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
    let today: DateModel = this.dateTimeUtil.getCurrentDateModel();

    this.yearMonth = String("0000" + today.year).slice(-4) + '-' + String("00" + today.month).slice(-2);


    this.searchFormGroup = this.formBuilder.group({
      dpMonthYear: this.formBuilder.control(today, Validators.required)
    }
    );
  }

  dateNavigate($event: NgbDatepickerNavigateEvent) {
    this.yearMonth = String("0000" + $event.next.year).slice(-4) + '-' + String("00" + $event.next.month).slice(-2);
  }


  validateSearchData(formData: any): boolean {
    let strMsg: string = '';
    if (this.yearMonth != undefined && this.yearMonth != '' && !this.dateTimeUtil.isValidDateTime(this.yearMonth, DateTimeFormat.DATEFORMAT_YYYY_MM)) {
      strMsg = "Year Month is not in correct format.";
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

    this.yearMonthDisplay = this.dateTimeUtil.convertDateTimeFormat(this.yearMonth, DateTimeFormat.DATEFORMAT_YYYY_MM, DateTimeFormat.DATEFORMAT_MMMM_YYYY);

    this.isLoading = true;

    let dateFrom = this.yearMonth+ '-01';
    let dateTo = this.dateTimeUtil.getEndDateOfMonth(dateFrom);


    let searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "dateFrom", value: dateFrom, option: '' },
      { name: "dateTo", value: dateTo, option: '' }
    ];

    this.reportsService.getDailyChargesPaymentSummaryReport(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstReport = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.logMessage.log("getDailyChargesPaymentSummaryReport Error." + error);
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
        new ExcelColumn('summary_date', 'Date'),
        new ExcelColumn('total_charges', 'Charges', 'number'),
        new ExcelColumn('total_payment', 'Payment', 'number'),
        new ExcelColumn('total_adjusted', 'Adjustment', 'number'),
        new ExcelColumn('total_refund', 'Refund', 'number'),
        new ExcelColumn('ar_balance', 'A/R Balance', 'number')
      ]

      this.excel.exportAsExcelFileWithHeaders(this.lstReport, lstColumns, 'DailyChargesPaymentSummary_'+ this.yearMonth.replace("-","_"));
    }
  }
}
