import { Injectable, Inject } from "@angular/core";
import { DateModel } from "../models/general/date-model";
import { TimeModel } from "../models/general/time-model";
import { DateDifference } from "../models/general/date-difference";


export enum DatePart {
  MINUTES = "minutes",
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks"
}

export enum DateTimeFormat {

  DATEFORMAT_YYYY_MM_DD_HH_mm_ss = "YYYY-MM-DD HH:mm:ss",
  DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS = "YYYY-MM-DD HH:mm:ss.SSS",
  DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S = "YYYY-MM-DD HH:mm:ss.S", // default datetime received from db without any conversion at db side
  DATEFORMAT_YYYY_MM_DD = "YYYY-MM-DD",
  DATEFORMAT_YYYY_MM = "YYYY-MM",
  DATEFORMAT_YYYY_MM_DD_hh_mm_a = "YYYY-MM-DD hh:mm A",
  DATEFORMAT_YYYYMMDD = "YYYYMMDD",
  DATEFORMAT_MM_DD_YYYY = "MM/DD/YYYY",
  DATEFORMAT_MMDDYYYY = "MMDDYYYY",
  DATEFORMAT_MMDDYY = "MMDDYY",
  DATEFORMAT_MM_DD_YYYY_hh_mm_a = "MM/DD/YYYY hh:mm A",
  DATEFORMAT_MM_DD_YYYY_hh_mm_ss_a = "MM/DD/YYYY hh:mm:ss A",
  DATEFORMAT_MM_DD_YYYY_HH_mm = "MM/DD/YYYY HH:mm",
  DATEFORMAT_hh_mm_a = "hh:mm A",
  DATEFORMAT_HH_mm = "HH:mm",
  DATEFORMAT_YYYY = "YYYY",
  DATEFORMAT_MM = "MM",
  DATEFORMAT_DD = "DD",
  DATEFORMAT_hh = "hh",
  DATEFORMAT_HH = "HH",
  DATEFORMAT_mm = "mm",
  DATEFORMAT_a = "A",
  DATEFORMATE_dddd = "dddd", // full day name
  DATE_MODEL = "date_model",
  TIME_MODEL = "time_model",
  DATEFORMAT_DDDD_MMM_DD_YYYY = "dddd, MMM DD, YYYY",
  DATEFORMAT_MMMM_YYYY = "MMMM, YYYY",
  DATEFORMAT_MMM_YYYY = "MMM, YYYY"  
}

@Injectable()
export class DateTimeUtil {

  moment;

  defaultTimeZone = ""

  constructor() {
    //constructor() {
    this.moment = require('moment-timezone');
    //this.moment.tz.setDefault("America/Chicago");
  }

  ngOnInit() {
  }

  getCurrentDateTimeDate(): Date {
    return new Date;
  }


  getCurrentDateTimeStringWithFormat(formate: DateTimeFormat): string {

    this.moment.tz.setDefault(); // set to local timezone
    var mt = this.moment(new Date);
    return mt.format(formate);
  }

  getCurrentDateTimeString(): string {

    this.moment.tz.setDefault(); // set to local timezone
    var mt = this.moment(new Date);
    //let dt=this.moment.tz(new Date, 'America/Chicago').format(DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);

    return mt.format(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
  }

  getDateTimeFormatedString(dt: Date, formate: DateTimeFormat): string {
    if (dt == null)
      return null;
    var mt = this.moment(dt);
    return mt.format(formate);
  }


  getDateTimeFromString(stringDate: string, formate: DateTimeFormat): Date {


    if (!this.moment(stringDate, formate, true).isValid()) {
      return null;
    }

    this.moment.tz.setDefault(); // set to local timezone
    return this.moment(stringDate, formate).toDate();

    //return this.moment(stringDate, formate, true).toDate();
  }
  getDateTimeString(stringDate: string, formate: DateTimeFormat): string {

    if (!this.moment(stringDate, formate, true).isValid()) {
      return null;
    }
    return this.moment(stringDate, formate, true).toDate();
  }

  getDateOjbect(date: any): Date {

    if (!this.moment(date).isValid()) {
      return null;
    }
    return this.moment(date).toDate();
  }
  isValidDateTime(dateToCheck: any, formate: DateTimeFormat): Boolean {

    debugger
    if (formate == DateTimeFormat.DATE_MODEL) {
      var dt = this.getStringDateFromDateModelWithFormat(dateToCheck, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);
      return (this.moment(dt, DateTimeFormat.DATEFORMAT_YYYY_MM_DD, true).isValid());
    }
    else {
      return (this.moment(dateToCheck, formate, true).isValid());
    }
  }

  addDateTime(dt: Date, timeToAdd: number, datePart: DatePart) {

    return this.moment(dt).add(timeToAdd, datePart).toDate();
  }

  convertDateTimeFormat(sourceDate: any, sourceFormate: DateTimeFormat, requiredFormate: DateTimeFormat) {

    debugger;

    if (sourceFormate == DateTimeFormat.DATE_MODEL) {
      sourceDate = this.moment(this.getStringDateFromDateModel(sourceDate), DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    }

    if (!this.moment(sourceDate, sourceFormate, true).isValid()) {
      return null;
    }
    let dt = this.moment(sourceDate, sourceFormate, true).toDate();

    let dtFormated: any;
    if (requiredFormate == DateTimeFormat.DATE_MODEL) {
      dtFormated = this.getDateModelFromDate(dt);
    }
    else {
      dtFormated = this.getDateTimeFormatedString(dt, requiredFormate);
    }

    return dtFormated
  }


  getDayNameFromStringDate(stringDate: string, formate: DateTimeFormat) {

    if (!this.moment(stringDate, formate, true).isValid()) {
      return null;
    }
    let dt = this.moment(stringDate, formate, true).toDate();

    return this.getDateTimeFormatedString(dt, DateTimeFormat.DATEFORMATE_dddd);

  }

  getDateModelFromDateString(date: string, formate: DateTimeFormat) {


    let dt: Date = this.getDateTimeFromString(date, formate);

    if (dt == undefined)
      return null;

    let dateModel: DateModel = new DateModel(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
    return dateModel;
  }
  getDateModelFromDate(date: Date) {


    //let dt: Date = this.getDateTimeFromString(date, formate);

    if (date == undefined)
      return null;

    let dateModel: DateModel = new DateModel(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return dateModel;
  }

  getStringDateFromDateModel(dateModel: DateModel) {
    if (dateModel != undefined) {
      let dtString = String("00" + dateModel.month).slice(-2) + '/' + String("00" + dateModel.day).slice(-2) + '/' + String("0000" + dateModel.year).slice(-4);
      return dtString;
    }
    else {
      return undefined;
    }
  }
  getStringDateFromDateModelWithFormat(dateModel: DateModel, requiredFormate: DateTimeFormat) {
    if (dateModel != undefined) {

      let dtString = String("0000" + dateModel.year).slice(-4) + '-' + String("00" + dateModel.month).slice(-2) + '-' + String("00" + dateModel.day).slice(-2);

      if (requiredFormate != DateTimeFormat.DATEFORMAT_YYYY_MM_DD) {
        dtString = this.convertDateTimeFormat(dtString, DateTimeFormat.DATEFORMAT_YYYY_MM_DD, requiredFormate);
      }

      return dtString;
    }
    else {
      return undefined;
    }
  }

  getTimeModelFromTimeString(date: string, formate: DateTimeFormat) {
    let dt: Date = this.getDateTimeFromString(date, formate);
    if (dt == undefined)
      return null;

    let timeModel: TimeModel = new TimeModel(dt.getHours(), dt.getMinutes());
    return timeModel;
  }
  getStringTimeFromTimeModel(timeModel: TimeModel) {
    let tmString = "";
    if (timeModel == undefined) {
      tmString = "00:00";
    }
    else {
      tmString = String("00" + timeModel.hour).slice(-2) + ':' + String("00" + timeModel.minute).slice(-2);
    }
    return tmString;
  }

  getCurrentDateModel() {
    let dt: Date = new Date;
    let dateModel: DateModel = new DateModel(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());// { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
    return dateModel;
  }
  getFirstDayOfYearDateModel() {
    let dt: Date = new Date;
    let dateModel: DateModel = new DateModel(dt.getFullYear(), 1, 1);// { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
    return dateModel;
  }

  getCurrentTimeModel() {
    let dt: Date = new Date;
    let timeModel = { hour: dt.getHours(), minute: dt.getMinutes() };
    return timeModel;
  }
  compareDate(date1: any, date2: any, formate: DateTimeFormat) {


    if (formate == DateTimeFormat.DATE_MODEL) {

      var dt1 = this.moment(this.getStringDateFromDateModel(date1), DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      var dt2 = this.moment(this.getStringDateFromDateModel(date2), DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    }
    else {
      var dt1 = this.moment(this.getDateTimeFromString(date1, formate));
      var dt2 = this.moment(this.getDateTimeFromString(date2, formate));
    }


    let diff: number = dt1.diff(dt2, 'days');
    //return dt1.diff(dt2, 'days');

    return diff;
  }
  /*
    dateCompare(Date1: string, Date2: string) {
  
      
         if (a == null && b == null)
             return 0;
         if (a == null)
           return 1;
         if (b == null)
            return -1;
  
         if(a < b)
            return -1;
  
         if(a > b)
            return 1;
            
         //var na:Number = a. getTime();
         //var nb:Number = b.getTime();
        // if (na < nb)
        //     return -1;
         //if (na > nb)
         //    return 1;
  
         return 0;
       
    }
    */


  checkIfFutureDate(date: any, formate: DateTimeFormat) {

    let isFuterDate: boolean = false;

    var dtToday = this.moment(this.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD));

    if (formate == DateTimeFormat.DATE_MODEL) {

      var dtToCompare = this.moment(this.getStringDateFromDateModel(date), DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

    }
    else {
      var dtToCompare = this.moment(this.getDateTimeFromString(date, formate));

    }



    //var dtToCompare=this.getDateTimeFromString(date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    //let dtToday: Date = new Date;

    //var dtToCompare =this.moment(date, 'MM/DD/YYYY')
    //let dtToday: Date = new Date;
    //let dtToday = this.moment(date,this.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY),'MM/DD/YYYY');

    /*
    if (dtToCompare.diff(dtToday, 'days') > 0)
      return true;
    else
      return false;
      */

    if (dtToCompare.diff(dtToday, 'days') > 0)
      isFuterDate = true;
    else
      isFuterDate = false;

    return isFuterDate;
  }
  checkIfPastDate(date: any, formate: DateTimeFormat) {

    let isPastDate: boolean = false;

    var dtToday = this.moment(this.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD));

    if (formate == DateTimeFormat.DATE_MODEL) {

      var dtToCompare = this.moment(this.getStringDateFromDateModel(date), DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

    }
    else {
      var dtToCompare = this.moment(this.getDateTimeFromString(date, formate));

    }

    //var dtToCompare = this.moment(this.getDateTimeFromString(date, formate));
    //var dtToday = this.moment(this.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD));

    //var dtToCompare=this.getDateTimeFromString(date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    //let dtToday = this.moment(new Date());

    //var dtToCompare = this.moment(date, 'MM/DD/YYYY')
    //let dtToday = this.moment(new Date());
    //let dtToday = this.moment(date,this.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY),'MM/DD/YYYY');

    // if (dtToday.diff(dtToCompare, 'days') > 0)
    //  return true;
    //  else
    //  return false;

    if (dtToday.diff(dtToCompare, 'days') > 0)
      isPastDate = true;
    else
      isPastDate = false;

    return isPastDate;
  }


  calculateDateDiferrence(stardDate: Date, endDate: Date) {

    var dtStart = this.moment(stardDate);
    var dtEnd = this.moment(endDate);

    let years = dtEnd.diff(dtStart, 'year');
    dtStart.add(years, 'years');

    let months = dtEnd.diff(dtStart, 'months');
    dtStart.add(months, 'months');

    let days = dtEnd.diff(dtStart, 'days');
    dtStart.add(days, 'days');

    let hours = dtEnd.diff(dtStart, 'hours');
    dtStart.add(hours, 'hours');

    let minutes = dtEnd.diff(dtStart, 'minutes');
    dtStart.add(minutes, 'minutes');

    let seconds = dtEnd.diff(dtStart, 'seconds');


    return new DateDifference(years, months, days, hours, minutes, seconds);


  }


  validateDateFromDateTo(dateFrom: any, dateTo: any, format: DateTimeFormat, futeruAllowed: boolean, pastAllowed: boolean): string {

    debugger;
    let strErrorMsg: string = "";

    if (!futeruAllowed) {
      if (this.checkIfFutureDate(dateFrom, format)) {
        strErrorMsg = "Date From is a future date.";
      }
      else if (this.checkIfFutureDate(dateTo, format)) {
        strErrorMsg = "Date To is a future date.";
      }
    }

    if (!pastAllowed && strErrorMsg == "") {
      if (this.checkIfPastDate(dateFrom, format)) {
        strErrorMsg = "Date From is a past date.";
      }
      else if (this.checkIfPastDate(dateTo, format)) {
        strErrorMsg = "Date To is a past date.";
      }
    }

    if (strErrorMsg == "") {
      let dtCompareResult: number = this.compareDate(dateFrom, dateTo, format);
      if (dtCompareResult > 0) {
        strErrorMsg = "Date To can't be earlier than Date To.";
      }
    }

    return strErrorMsg;
  }


  getDateFromDigitsOnly(sourceDate: string, requiredFormate: DateTimeFormat) {

    let dtFormated;
    if (!sourceDate.includes('/')) {
      if (sourceDate.length == 6) {
        dtFormated = this.convertDateTimeFormat(sourceDate, DateTimeFormat.DATEFORMAT_MMDDYY, requiredFormate);
        //alert(this.convertDateTimeFormat(sourceDate,DateTimeFormat.DATEFORMAT_MMDDYY,requiredFormate));    
      }
      else if (sourceDate.length == 8) {
        dtFormated = this.convertDateTimeFormat(sourceDate, DateTimeFormat.DATEFORMAT_MMDDYYYY, requiredFormate);
        //alert(this.convertDateTimeFormat(sourceDate,DateTimeFormat.DATEFORMAT_MMDDYY,requiredFormate));    
      }
    }
    else {
      let splited: Array<string> = sourceDate.split("/");
      if (splited.length == 3) {

        let month: string = String("00" + splited[0]).slice(-2);
        let day: string = String("00" + splited[1]).slice(-2);
        let year: string = "";
        if (splited[2].length == 2) {
          year = splited[2];
          let dtMMDDYY = month + day + year;
          dtFormated = this.convertDateTimeFormat(dtMMDDYY, DateTimeFormat.DATEFORMAT_MMDDYY, requiredFormate);
        }
        else if (splited[2].length == 4) {
          year = splited[2];
          let dtMMDDYY = month + day + year;
          dtFormated = this.convertDateTimeFormat(dtMMDDYY, DateTimeFormat.DATEFORMAT_MMDDYYYY, requiredFormate);
        }
      }
    }
    return dtFormated
  }
  getCurrentMonthName() {
    debugger;
    //let dt: Date = new Date;
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const d = new Date();
    return monthNames[d.getMonth()];
  }

  getEndDateOfMonth(currentDate:string){
    //currentDate ==> YYYY-MM-DD
    var startDate = this.moment(currentDate);
    var endDate = startDate.clone().endOf('month').format("YYYY-MM-DD");
    return endDate;
  }
  

}
