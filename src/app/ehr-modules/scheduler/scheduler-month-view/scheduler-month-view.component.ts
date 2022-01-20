import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { SchedulerService } from 'src/app/services/scheduler/scheduler.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { WeekDaysEnum, CallingFromEnum, SchedulerViewType } from '../../../shared/enum-util';
import { WeekRow } from './week-row';
import { WeekDay } from './week-day';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { DateModel } from 'src/app/models/general/date-model';



const now = new Date();

@Component({
  selector: 'scheduler-month-view',
  templateUrl: './scheduler-month-view.component.html',
  styleUrls: ['./scheduler-month-view.component.css']
})
export class SchedulerMonthViewComponent implements OnInit {

  @Input() locationId: number;
  @Input() providerId: number;
  @Input() appDate: string;
  @Input() refresh: boolean = false;
  @Input() locationName: string;
  @Input() providerName: string;
  @Output() loadingIndicator = new EventEmitter<any>();
  @Output() loadScheduler = new EventEmitter<any>();

  lstAppointments: Array<string>;
  lstMonthView: Array<WeekRow>;

  month: string;
  year: string;
  yearMonthDispay: string;
  locationIdSearhed: number;
  providerIdSearched: number;

  todayDate: string = '';// YYYY-MM-DD

  appointmentCount: number = 0;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private schedulerService: SchedulerService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {
    //this.getAppointmentsLocationView();
  }

  ngOnChanges() {
    debugger;
    this.appointmentCount = 0;

    this.todayDate = String("0000" + now.getFullYear()).slice(-4) + '-' + String("00" + (now.getMonth() + 1)).slice(-2) + '-' + String("00" + now.getDate()).slice(-2);

    let lst: Array<string> = this.appDate.split('/');

    if (lst[0] != this.month || lst[2] != this.year || this.providerIdSearched != this.providerId
      || this.locationIdSearhed != this.locationId || this.refresh) {


      this.month = lst[0];
      this.year = lst[2];
      this.yearMonthDispay = this.dateTimeUtil.convertDateTimeFormat(this.appDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_MMMM_YYYY);

      this.providerIdSearched = this.providerId;
      this.locationIdSearhed = this.locationId;
      this.refresh = false;
      this.getAppointmentsMonthView();
    }
    else {
      this.loaded();
    }
  }

  loading() {
    this.loadingIndicator.emit({ schedulerView:SchedulerViewType.MONTH_VIEW, isLoading: true, appCount: this.appointmentCount });
  }


  loaded() {
    this.loadingIndicator.emit({schedulerView:SchedulerViewType.MONTH_VIEW, isLoading: false, appCount: this.appointmentCount });
  }

  getAppointmentsMonthView() {

    debugger;
    this.appointmentCount = 0;
    this.loading();


    this.lstAppointments = undefined;
    //this.lstMonthView = new Array<WeekRow>();
    this.fetchEmptyMonthDsiplay();

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "location_id", value: this.locationId, option: "" },
      { name: "provider_id", value: this.providerId, option: "" },
      { name: "year", value: this.year, option: "" },
      { name: "month", value: this.month, option: "" }
    ];

    this.schedulerService.getAppointmentsMonthView(searchCriteria).subscribe(
      data => {

        debugger;
        this.lstAppointments = data as Array<any>;


        this.appointmentCount=0;       
        this.lstAppointments.forEach(monthApp => {
          if (monthApp['total_appointments'] != undefined) {
            this.appointmentCount += Number(monthApp['total_appointments']);
          }
        });

        

        this.populateData();

        this.loaded();

      },
      error => {
        this.ongetAppointmentsMonthViewError(error);
        this.loaded();
      }
    );
  }

  populateData() {


    if (this.lstAppointments == undefined || this.lstAppointments.length == 0) {
      return;
    }

    debugger;
    this.lstMonthView = new Array<WeekRow>();

    let appIndex: number = 0;
    for (let weekNo = 1; weekNo <= 6; weekNo++) {

      let wr: WeekRow = new WeekRow();
      wr.week_no = weekNo;
      wr.week_days = new Array<WeekDay>();

      let weekDayNo: number = 1;
      while (appIndex < this.lstAppointments.length)
      //for (; appIndex < this.lstAppointments.length; appIndex++) 
      {
        debugger;
        const app = this.lstAppointments[appIndex];

        if (appIndex == 0 && app['week_day_no'] > 1) {

          do {
            wr.week_days.push(this.getEmptyDay(weekDayNo));
            weekDayNo++;

          } while (weekDayNo < app['week_day_no']);

        }
        debugger;
        let wd: WeekDay = new WeekDay();
        wd.day_no = app['month_day_no'];
        wd.date = app['month_date'];
        wd.week_day_no = app['week_day_no'];
        wd.day_active = true;
        wd.day_name = app['week_day'];
        wd.total_appointments = app['total_appointments'];
        wd.completed = app['completed'];
        wr.week_days.push(wd);
        weekDayNo++;
        appIndex++;

        if (weekDayNo > 7) {
          break;
        }
      }

      debugger;
      if (weekDayNo <= 7) {
        do {
          let wd: WeekDay = this.getEmptyDay(weekDayNo);
          wr.week_days.push(wd);
          weekDayNo++;

        } while (weekDayNo <= 7);

      }
      this.lstMonthView.push(wr);
    }

  }

  ongetAppointmentsMonthViewError(error) {
    this.logMessage.log("getAppointmentsMonthView Error.");
    this.loaded();
  }

  getEmptyDay(weekDayNo: number): WeekDay {

    let wd: WeekDay = new WeekDay();
    wd.day_no = undefined;
    wd.week_day_no = weekDayNo;
    wd.day_active = false;
    wd.date = '';
    switch (weekDayNo) {

      case 1:
        wd.day_name = WeekDaysEnum.MONDAY;
        break;
      case 2:
        wd.day_name = WeekDaysEnum.TUESDAY;
        break;
      case 3:
        wd.day_name = WeekDaysEnum.WEDNESDAY;
        break;
      case 4:
        wd.day_name = WeekDaysEnum.THURSDAY;
        break;
      case 5:
        wd.day_name = WeekDaysEnum.FRIDAY;
        break;
      case 6:
        wd.day_name = WeekDaysEnum.SATURDAY;
        break;
      case 7:
        wd.day_name = WeekDaysEnum.SUNDAY;
        break;

      default:
        break;
    }

    wd.total_appointments = undefined;//   
    wd.completed = undefined;

    return wd;
  }

  getEmptyWeekRow(): WeekRow {

    let wr: WeekRow = new WeekRow();
    wr.week_no = undefined;// week.week_no;
    wr.week_days = new Array<WeekDay>();

    wr.week_days.push(this.getEmptyDay(1));
    wr.week_days.push(this.getEmptyDay(2));
    wr.week_days.push(this.getEmptyDay(3));
    wr.week_days.push(this.getEmptyDay(4));
    wr.week_days.push(this.getEmptyDay(5));
    wr.week_days.push(this.getEmptyDay(6));
    wr.week_days.push(this.getEmptyDay(7));

    return wr;

  }

  openNormalSchedulerView(dayOfMonth: number) {

    let dateModel: DateModel = this.dateTimeUtil.getDateModelFromDateString(this.year + '-' + this.month + '-' + String("00" + dayOfMonth).slice(-2), DateTimeFormat.DATEFORMAT_YYYY_MM_DD);
    let lstKV: Array<ORMKeyValue> = new Array();

    lstKV.push(new ORMKeyValue('callingFrom', CallingFromEnum.SCHEDULER_MONTH_VIEW))
    lstKV.push(new ORMKeyValue('dateModel', dateModel))

    this.loadScheduler.emit(lstKV);
  }

  fetchEmptyMonthDsiplay() {
    this.lstMonthView = new Array<WeekRow>();
    this.lstMonthView.push(this.getEmptyWeekRow());
    this.lstMonthView.push(this.getEmptyWeekRow());
    this.lstMonthView.push(this.getEmptyWeekRow());
    this.lstMonthView.push(this.getEmptyWeekRow());
    this.lstMonthView.push(this.getEmptyWeekRow());
    this.lstMonthView.push(this.getEmptyWeekRow());
  }
}
