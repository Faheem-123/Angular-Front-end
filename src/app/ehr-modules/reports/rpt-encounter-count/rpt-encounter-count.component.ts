import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { ReportsService } from '../../../services/reports.service';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { ORMrptEncounterCount } from '../../../models/reports/ORMrptEncounterCount';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ORMproviderEncounterCount } from 'src/app/models/reports/ORMproviderEncounterCount';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { datetimeValidator } from 'src/app/shared/custome-validators';

@Component({
  selector: 'encounter-count',
  templateUrl: './rpt-encounter-count.component.html',
  styleUrls: ['./rpt-encounter-count.component.css']
})
export class RptEncounterCountComponent implements OnInit {


  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private reportsService: ReportsService) { }

  dayWiseEncCountReportForm: FormGroup;
  providerWiseEncCountReportForm: FormGroup;
  locationWiseEncCountReportForm: FormGroup;
  radioForm: FormGroup;

  showReport = "";
  dataOption = "";
  //lstdayWise =[];
  lstdayWise;
  lstdayWisetest;
  lstdayWise1;
  lstdayWiseF;
  lstProvWise;
  test = [];
  test1 = [];
  testmain = [];
  lstLocWise;
  recordCount = "0";
  strLocation = "";
  lstLocationWiseTotal;

  colday29;
  colday30;
  colday31;
  colH_day29;
  colH_day30;
  colH_day31;
  selectedMonth;

  ngOnInit() {
    this.buildForm();
    this.onRadioOptionChange("day wise encounters");
    //let month = this.dateTimeUtil.getCurrentMonthName();
    //this.selectedMonth = month.toString();
    //alert(this.selectedMonth);
    //(this.dayWiseEncCountReportForm.get("cmbMonthsdaywise") as FormControl).setValue(month.toString());
  }
  ngAfterViewInit(){
    let month = this.dateTimeUtil.getCurrentDateTimeDate();
    let fmonth;
    if(Number(month.getMonth())+Number(1) < 10)
      fmonth = "0"+ month.getMonth();
    else
      fmonth = Number(month.getMonth()) + Number(1);

    (this.dayWiseEncCountReportForm.get("cmbMonthsdaywise") as FormControl).setValue(fmonth.toString());
  }
  buildForm() {
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control('daywise'),
    }
    );
    this.dayWiseEncCountReportForm = this.formBuilder.group({
      cmbMonthsdaywise: this.formBuilder.control(null, Validators.required),
      txtYeardaywise: this.formBuilder.control(this.dateTimeUtil.getDateTimeFormatedString(this.dateTimeUtil.getCurrentDateTimeDate(),DateTimeFormat.DATEFORMAT_YYYY))
      // txtYeardaywise: this.formBuilder.control(this.dateTimeUtil.getCurrentYear(), Validators.compose([
      //   Validators.required,
      //   datetimeValidator(DateTimeFormat.DATEFORMAT_YYYY)
      // ])),
    }
    );
    this.providerWiseEncCountReportForm = this.formBuilder.group({
      txtYearProviderWise: this.formBuilder.control(this.dateTimeUtil.getDateTimeFormatedString(this.dateTimeUtil.getCurrentDateTimeDate(),DateTimeFormat.DATEFORMAT_YYYY)),
    }
    );
    this.locationWiseEncCountReportForm = this.formBuilder.group({
      txtYearLocationWise: this.formBuilder.control(this.dateTimeUtil.getDateTimeFormatedString(this.dateTimeUtil.getCurrentDateTimeDate(),DateTimeFormat.DATEFORMAT_YYYY)),
    }
    );
  }
  onRadioOptionChange(value) {
    this.recordCount = "0";
    switch (value.toLowerCase()) {
      case "day wise encounters":
        this.dataOption = "daywise";
        this.showReport = "daywise";
        if(this.lstLocationWiseTotal !=undefined && this.lstLocationWiseTotal.length>0){
          this.recordCount = this.lstLocationWiseTotal.length;
        }
        break;
      case "provider month wise":
        this.dataOption = "providerwise";
        this.showReport = "providerwise";
        if(this.lstProvWise !=undefined && this.lstProvWise.length>0){
          this.recordCount = this.lstProvWise.length;
        }
        break;
      case "location month wise":
        this.dataOption = "locationwise";
        this.showReport = "locationwise";
        if(this.lstLocWise !=undefined && this.lstLocWise.length>0){
          this.recordCount = this.lstLocWise.length;
        }
        break;
        
      default:
        break;
    }
    
  }
  searchEncCountRpt(value, rpt) {
    if (rpt == "daywise")
      this.searchDayWise();
    if (rpt == "provwise")
      this.searchProviderWise();
    if (rpt == "locwise")
      this.searchLocationWise();
  }

  searchDayWise() {
    
    if ((this.dayWiseEncCountReportForm.get('cmbMonthsdaywise') as FormControl).value <= 0) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Month Selection', "Pleae select Month.", AlertTypeEnum.WARNING);
      return;
    }
    if ((this.dayWiseEncCountReportForm.get('txtYeardaywise') as FormControl).value == "" || (this.dayWiseEncCountReportForm.get('txtYeardaywise') as FormControl).value == null || (this.dayWiseEncCountReportForm.get('txtYeardaywise') as FormControl).value.length != 4) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Year Selection', "Please enter 4 digit year.", AlertTypeEnum.WARNING);
      return;
    }

    let dayWiseSearch: SearchCriteria = new SearchCriteria();
    dayWiseSearch.practice_id = this.lookupList.practiceInfo.practiceId;
    dayWiseSearch.param_list = [];

    dayWiseSearch.param_list.push({ name: "yearMonth", value: (this.dayWiseEncCountReportForm.get('txtYeardaywise') as FormControl).value + '' + (this.dayWiseEncCountReportForm.get('cmbMonthsdaywise') as FormControl).value, option: "" });

    this.reportsService.getDayWiseRpt(dayWiseSearch).subscribe(
      data => {
        debugger;
        this.lstdayWise = data;
        this.recordCount = data['length'];


        if (this.lstdayWise.length > 0) {
          if (data[0].total_month_days < 31) {
            this.colday31 = false;
            this.colH_day31 = false;
          }
          else {
            this.colday31 = true;
            this.colH_day31 = true;
          }

          if (data[0].total_month_days < 30) {
            this.colday30 = false;
            this.colH_day30 = false;
          }
          else {
            this.colday30 = true;
            this.colH_day30 = true;
          }

          if (data[0].total_month_days < 29) {
            this.colday29 = false;
            this.colH_day29 = false;
          }
          else {
            this.colday29 = true;
            this.colH_day29 = true;
          }
        }

        debugger;
        let disttinctLocation = new UniquePipe().transform(this.lstdayWise, "location_name");
        this.lstLocationWiseTotal = new Array();
        this.strLocation = "";
        disttinctLocation.forEach(loc => {
          this.strLocation = loc.location_name;
          let objORMEnCount: ORMrptEncounterCount = new ORMrptEncounterCount();
          this.lstdayWise.forEach(element => {

            if (element.location_name.toLowerCase() == loc.location_name.toLowerCase()) {


              //   this.strLocation = "";
              // if (this.lstdayWise[i].location_name == this.strLocation) {
              //   this.lstdayWise[i].location_name = "";
              //   this.lstdayWise[i].is_aggregate = false;



              objORMEnCount.day_01 = objORMEnCount.day_01 + element.day_01;
              objORMEnCount.day_02 = objORMEnCount.day_02 + element.day_02;
              objORMEnCount.day_03 = objORMEnCount.day_03 + element.day_03;
              objORMEnCount.day_04 = objORMEnCount.day_04 + element.day_04;
              objORMEnCount.day_05 = objORMEnCount.day_05 + element.day_05;
              objORMEnCount.day_06 = objORMEnCount.day_06 + element.day_06;
              objORMEnCount.day_07 = objORMEnCount.day_07 + element.day_07;
              objORMEnCount.day_08 = objORMEnCount.day_08 + element.day_08;
              objORMEnCount.day_09 = objORMEnCount.day_09 + element.day_09;
              objORMEnCount.day_10 = objORMEnCount.day_10 + element.day_10;

              objORMEnCount.day_11 = objORMEnCount.day_11 + element.day_11;
              objORMEnCount.day_12 = objORMEnCount.day_12 + element.day_12;
              objORMEnCount.day_13 = objORMEnCount.day_13 + element.day_13;
              objORMEnCount.day_14 = objORMEnCount.day_14 + element.day_14;
              objORMEnCount.day_15 = objORMEnCount.day_15 + element.day_15;
              objORMEnCount.day_16 = objORMEnCount.day_16 + element.day_16;
              objORMEnCount.day_17 = objORMEnCount.day_17 + element.day_17;
              objORMEnCount.day_18 = objORMEnCount.day_18 + element.day_18;
              objORMEnCount.day_19 = objORMEnCount.day_19 + element.day_19;
              objORMEnCount.day_20 = objORMEnCount.day_20 + element.day_20;

              objORMEnCount.day_21 = objORMEnCount.day_21 + element.day_21;
              objORMEnCount.day_22 = objORMEnCount.day_22 + element.day_22;
              objORMEnCount.day_23 = objORMEnCount.day_23 + element.day_23;
              objORMEnCount.day_24 = objORMEnCount.day_24 + element.day_24;
              objORMEnCount.day_25 = objORMEnCount.day_25 + element.day_25;
              objORMEnCount.day_26 = objORMEnCount.day_26 + element.day_26;
              objORMEnCount.day_27 = objORMEnCount.day_27 + element.day_27;
              objORMEnCount.day_28 = objORMEnCount.day_28 + element.day_28;
              objORMEnCount.day_29 = objORMEnCount.day_29 + element.day_29;
              objORMEnCount.day_30 = objORMEnCount.day_30 + element.day_30;
              objORMEnCount.day_31 = objORMEnCount.day_31 + element.day_31;
            }
          });
          objORMEnCount.is_aggregate = false;
          objORMEnCount.location_name = this.strLocation;
          this.lstLocationWiseTotal.push(objORMEnCount);


        });

      },
      error => {
        return;
      }
    );
  }

  searchProviderWise() {
      if ((this.providerWiseEncCountReportForm.get('txtYearProviderWise') as FormControl).value == "" || (this.providerWiseEncCountReportForm.get('txtYearProviderWise') as FormControl).value == null || (this.providerWiseEncCountReportForm.get('txtYearProviderWise') as FormControl).value.length != 4) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Year Selection', "Please enter 4 digit year.", AlertTypeEnum.WARNING);
        return;
    }
    let providerWiseSearch: SearchCriteria = new SearchCriteria();
    providerWiseSearch.practice_id = this.lookupList.practiceInfo.practiceId;
    providerWiseSearch.param_list = [];
    providerWiseSearch.param_list.push({ name: "provyear", value: (this.providerWiseEncCountReportForm.get('txtYearProviderWise') as FormControl).value, option: "" });
    this.reportsService.getProviderWiseRpt(providerWiseSearch).subscribe(
      data => {
        this.lstProvWise = data;
        this.recordCount = data['length'];
        this.test = [];
        let jan_count: number = 0;
        let feb_count: number = 0;
        let mar_count: number = 0;
        let apr_count: number = 0;
        let may_count: number = 0;
        let jun_count: number = 0;
        let jul_count: number = 0;
        let aug_count: number = 0;
        let sep_count: number = 0;
        let oct_count: number = 0;
        let nov_count: number = 0;
        let dec_count: number = 0;
        let total_count: number = 0;
        if (this.lstProvWise != null && this.lstProvWise.length > 0) {
          for (var i = 0; i < this.lstProvWise.length; i++) {
            jan_count += Number(this.lstProvWise[i].jan);
            feb_count += Number(this.lstProvWise[i].feb);
            mar_count += Number(this.lstProvWise[i].mar);
            apr_count += Number(this.lstProvWise[i].apr);
            may_count += Number(this.lstProvWise[i].may);
            jun_count += Number(this.lstProvWise[i].jun);
            jul_count += Number(this.lstProvWise[i].jul);
            aug_count += Number(this.lstProvWise[i].aug);
            sep_count += Number(this.lstProvWise[i].sep);
            oct_count += Number(this.lstProvWise[i].oct);
            nov_count += Number(this.lstProvWise[i].nov);
            dec_count += Number(this.lstProvWise[i].dec);
            total_count += Number(this.lstProvWise[i].total);
          }
          let objProvCount: ORMproviderEncounterCount = new ORMproviderEncounterCount();
          objProvCount = new ORMproviderEncounterCount();
          objProvCount.provider_name = "Total";
          objProvCount.jan = jan_count;
          objProvCount.feb = feb_count;
          objProvCount.mar = mar_count;
          objProvCount.apr = apr_count;
          objProvCount.may = may_count;
          objProvCount.jun = jun_count;
          objProvCount.jul = jul_count;
          objProvCount.aug = aug_count;
          objProvCount.sep = sep_count;
          objProvCount.oct = oct_count;
          objProvCount.nov = nov_count;
          objProvCount.dec = dec_count;
          objProvCount.total = total_count;
          objProvCount.is_aggregate = true;
          this.test.push(objProvCount);
        }
      }
    );

  }
  searchLocationWise() {
    if ((this.locationWiseEncCountReportForm.get('txtYearLocationWise') as FormControl).value == "" || (this.locationWiseEncCountReportForm.get('txtYearLocationWise') as FormControl).value == null || (this.locationWiseEncCountReportForm.get('txtYearLocationWise') as FormControl).value.length != 4) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Year Selection', "Please enter 4 digit year.", AlertTypeEnum.WARNING);
      return;
    }
    let locationWiseSearch: SearchCriteria = new SearchCriteria();
    locationWiseSearch.practice_id = this.lookupList.practiceInfo.practiceId;
    locationWiseSearch.param_list = [];
    locationWiseSearch.param_list.push({ name: "locyear", value: (this.locationWiseEncCountReportForm.get('txtYearLocationWise') as FormControl).value, option: "" });

    this.reportsService.getLocationWiseRpt(locationWiseSearch).subscribe(
      data => {
        debugger;
        this.lstLocWise = data;
        this.recordCount = data['length'];
        this.test1 = [];
        let jan_count: number = 0;
        let feb_count: number = 0;
        let mar_count: number = 0;
        let apr_count: number = 0;
        let may_count: number = 0;
        let jun_count: number = 0;
        let jul_count: number = 0;
        let aug_count: number = 0;
        let sep_count: number = 0;
        let oct_count: number = 0;
        let nov_count: number = 0;
        let dec_count: number = 0;
        let total_count: number = 0;

        if (this.lstLocWise != null && this.lstLocWise.length > 0) {
          for (var i = 0; i < this.lstLocWise.length; i++) {
            jan_count += Number(this.lstLocWise[i].jan);
            feb_count += Number(this.lstLocWise[i].feb);
            mar_count += Number(this.lstLocWise[i].mar);
            apr_count += Number(this.lstLocWise[i].apr);
            may_count += Number(this.lstLocWise[i].may);
            jun_count += Number(this.lstLocWise[i].jun);
            jul_count += Number(this.lstLocWise[i].jul);
            aug_count += Number(this.lstLocWise[i].aug);
            sep_count += Number(this.lstLocWise[i].sep);
            oct_count += Number(this.lstLocWise[i].oct);
            nov_count += Number(this.lstLocWise[i].nov);
            dec_count += Number(this.lstLocWise[i].dec);
            total_count += Number(this.lstLocWise[i].total);
          }

          let objLogCount: ORMproviderEncounterCount = new ORMproviderEncounterCount();
          objLogCount = new ORMproviderEncounterCount();
          objLogCount.location_name = "Total";
          objLogCount.jan = jan_count;
          objLogCount.feb = feb_count;
          objLogCount.mar = mar_count;
          objLogCount.apr = apr_count;
          objLogCount.may = may_count;
          objLogCount.jun = jun_count;
          objLogCount.jul = jul_count;
          objLogCount.aug = aug_count;
          objLogCount.sep = sep_count;
          objLogCount.oct = oct_count;
          objLogCount.nov = nov_count;
          objLogCount.dec = dec_count;
          objLogCount.total = total_count;
          objLogCount.is_aggregate = true;

          this.test1.push(objLogCount);
        }
      }
    );
  }
}