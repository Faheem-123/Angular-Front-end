import { Component, OnInit, Input, Output, EventEmitter, Inject, OnChanges } from '@angular/core';
import { AppointmentOperationData, AppointmentOptions } from '../appointment-operation-data';
import { OpenModuleService } from '../../../services/general/openModule.service';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { DateDifference } from 'src/app/models/general/date-difference';

@Component({
  selector: 'scheduler-card',
  templateUrl: './scheduler-card.component.html',
  styleUrls: ['./scheduler-card.component.css']
})
export class SchedulerCardComponent implements OnInit, OnChanges {

  @Input() appointment;
  @Input() patientIdSearched: number;
  @Input() patientNameSearched: string;
  @Input() colIndex: number=0;
  @Output() doSchedulerAction = new EventEmitter<any>();


  bgColor: string = "#ACD2D9";
  lblColor: string = "#FFFFFF";
  commentsColor: string = "#2d2d2d";
  patientName: string = "";
  patientAge:string="";
  //patientNameHeighlighted: string = "";  
  heighligh: boolean = false;

  constructor(private openModuleService: OpenModuleService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,private dateTimeUtil:DateTimeUtil) { }

  ngOnInit() {

    //console.log("Patient ID Searched"+this.patientIdSearched+ ' ' +this.appointment);
    if (this.appointment != null && this.appointment != undefined) {

      this.bgColor = this.appointment.type_color;
      this.lblColor = this.appointment.label_color;


      if (this.appointment.patient_id == -1) {
        this.commentsColor = "#9dabb7";
        this.patientName = "BLOCK TIME";
      }
      else {
        debugger;

        this.commentsColor = this.appointment.comments_color;
        this.patientName = this.appointment.patient_name;
        //this.patientNameHeighlighted = this.appointment.patient_name;

        //calculated age
        let dobDate = this.dateTimeUtil.getDateTimeFromString(this.appointment.dob, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        let appDate = this.dateTimeUtil.getDateTimeFromString(this.appointment.appointment_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        let ageWrtDos:DateDifference = this.dateTimeUtil.calculateDateDiferrence(dobDate, appDate);
        //interpreter_req
        this.patientAge="";
        if(ageWrtDos!=null && ageWrtDos!=undefined)
        {
          if(ageWrtDos.years>0)
          {
            this.patientAge= ageWrtDos.years+ " Y";
          }
          if(ageWrtDos.months>0)
          {
            if(this.patientAge=="")
              this.patientAge= ageWrtDos.months+ " M";
            else
              this.patientAge+= "- "+ageWrtDos.months+ " M";
          }
          if(this.patientAge=="")
          {
            if(ageWrtDos.days>0)
            {
              if(this.patientAge=="")
                this.patientAge= ageWrtDos.days+ " D";
              else
                this.patientAge= "-"+ageWrtDos.days+ " D";
            }
          }
        }

        if (this.patientIdSearched === this.appointment.patient_id) {
          this.heighligh = true;
        }
        else if (this.patientNameSearched != undefined && this.patientNameSearched != "") {
          let fName: string = "";
          let lName: string = "";
          lName = this.patientName.split(",")[0];
          if (this.patientName.split(",").length > 1) {
            fName = this.patientName.split(",")[1].trimLeft();
          }

          let fNameSearch: string = "";
          let lNameSearch: string = "";

          lNameSearch = this.patientNameSearched.split(",")[0];
          if (this.patientNameSearched.split(",").length > 1) {
            fNameSearch = this.patientNameSearched.split(",")[1].trimLeft();
          }


          let regExpLName: RegExp = new RegExp("^" + lNameSearch, "i");


          if (regExpLName.test(lName)) {
            this.heighligh = true;
          }

          if (fNameSearch != "" && this.heighligh == true) {
            let regExpFName: RegExp = new RegExp("^" + fNameSearch, "i");
            if (regExpFName.test(fName)) {
              this.heighligh = true;
            }
            else {
              this.heighligh = false;
            }
          }


        }
      }
    }
  }

  ngOnChanges() {

    debugger;
    this.heighligh = false;
    //this.patientNameHeighlighted = this.appointment.patient_name;



    if (this.appointment != undefined) {
      if (this.appointment.patient_id > 0) {
        if (this.patientIdSearched === this.appointment.patient_id) {
          this.heighligh = true;
        }
        else if (this.patientNameSearched != undefined && this.patientNameSearched != "") {
          //this.highlightSearhedPatient();

          let fName: string = "";
          let lName: string = "";
          lName = this.patientName.split(",")[0];
          if (this.patientName.split(",").length > 1) {
            fName = this.patientName.split(",")[1].trimLeft();
          }

          let fNameSearch: string = "";
          let lNameSearch: string = "";

          lNameSearch = this.patientNameSearched.split(",")[0];
          if (this.patientNameSearched.split(",").length > 1) {
            fNameSearch = this.patientNameSearched.split(",")[1].trimLeft();
          }

          let regExpLName: RegExp = new RegExp("^" + lNameSearch, "i");


          if (regExpLName.test(lName)) {
            this.heighligh = true;
          }

          if (fNameSearch != "" && this.heighligh == true) {
            let regExpFName: RegExp = new RegExp("^" + fNameSearch, "i");
            if (regExpFName.test(fName)) {
              this.heighligh = true;
            }
            else {
              this.heighligh = false;
            }
          }
        }
      }
    }
  }


  doAction(option) {

    debugger;
    let appData: AppointmentOperationData = new AppointmentOperationData();
    switch (option) {
      case "delete":
        appData.appOption = AppointmentOptions.DELETE;
        break;
      case "edit":
        appData.appOption = AppointmentOptions.EDIT;
        break;
      case "checkin_checkout":
        appData.appOption = AppointmentOptions.CHECKIN_CHECKOUT;
        break;
      case "show_eligibility":
        appData.appOption = AppointmentOptions.SHOW_ELIGIBLITY;
        break;
      case "check_live_eligibility":
        appData.appOption = AppointmentOptions.CHECK_LIVE_ELIGIBLITY;
        break;
      case "cash_register":
        appData.appOption = AppointmentOptions.CASH_REGISTER;
        break;
      case "modify_patient":
        appData.appOption = AppointmentOptions.MODIFY_PATIENT;
        break;
      case "print_demographics":
        appData.appOption = AppointmentOptions.PRINT_DEMOGRAPHICS;
        break;
      case "create_encounter":
        appData.appOption = AppointmentOptions.CREATE_ENCOUNTER;
        break;
      case "encounter_snapshot":
        appData.appOption = AppointmentOptions.ENCOUNTER_SNAPSHOT;
        break;
      case "scheduler_patient_appiontment_report":
        appData.appOption = AppointmentOptions.SCHEDULER_PATIENT_APPOINTMENT_REPORT;
        break;
      case "patient_notes":
        appData.appOption = AppointmentOptions.PATIENT_NOTES;
        break;
      case "call_log":
        appData.appOption = AppointmentOptions.CALL_LOG;
        break;
        case "appt_log":
        appData.appOption = AppointmentOptions.APPOINTMENT_LOG;
        break;
        

      default:
        break;
    }


    appData.appointmentId = this.appointment.appointment_id;
    appData.patientName = this.patientName;
    
    appData.providerId=this.appointment.provider_id;
    appData.locationId=this.appointment.location_id;
    
    appData.appDuration = this.appointment.appointment_duration;
    appData.patientId = this.appointment.patient_id;
    appData.appDate = this.appointment.appointment_date;
    appData.appTime = this.appointment.appointment_time;
    appData.appStatusId = this.appointment.status_id;
    //appData.pid=this.appointment.pid;
    appData.dob = this.appointment.dob;
    //appData.gender=this.appointment.gender;
    appData.phone = this.appointment.phone_number;

    appData.comments = this.appointment.appointment_comments;
    //appData.typeId=this.appointment.type_id;
    //appData.statusId=this.appointment.status_id;
    //appData.reasonId=this.appointment.reason_id;

    // appData.appDate=this.selectedDate;
    // appData.appTime=appTime;
    //appData.appDuration=15;

    debugger;

    this.doSchedulerAction.emit(appData);
  }

  openPatient() {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = this.appointment.patient_id.toString();
    obj.patient_name = this.patientName;
    this.openModuleService.openPatient.emit(obj);
  }

  /*
  highlightSearhedPatient() {

    this.patientNameHeighlighted = this.patientName;

    if (this.appointment != undefined) {
      if (this.appointment.patient_id > 0) {

        if (this.patientNameSearched != undefined && this.patientNameSearched != "") {
          this.patientNameHeighlighted = this.patientName.replace(new RegExp(this.patientNameSearched, "gi"), match => {
            return '<span class="heighlight-text">' + match + '</span>';
          });
        }
      }
     
      //return originalText.replace(new RegExp('WEL', "gi"), match => {
      //  return '<span class="heighlighted">' + match + '</span>';
      //});
    

      //return patientNameHeighlighted

    }

  }
  */
}

