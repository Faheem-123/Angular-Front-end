import { Component, OnInit, Inject, Input, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { SchedulerService } from 'src/app/services/scheduler/scheduler.service';
import { PatientService } from 'src/app/services/patient/patient.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ReportsService } from 'src/app/services/reports.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LogService } from 'src/app/services/log.service';
import { AppointmentOperationData } from '../../appointment-operation-data';
import { AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMAppointmentCallsLogSave } from 'src/app/models/log/orm-appointment-calls-log-save';

@Component({
  selector: 'appointment-calls-log',
  templateUrl: './appointment-calls-log.component.html',
  styleUrls: ['./appointment-calls-log.component.css']
})
export class AppointmentCallsLogComponent implements OnInit {

  @Input() appOperationData: AppointmentOperationData;
  @Output() callBack = new EventEmitter<any>();

  isLoading: boolean = false;
  radioFormGroup: FormGroup;
  addLogFormGroup: FormGroup;

  selectedTab: string = "current_appointment";

  lstCallLogs: Array<any>;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private schedulerService: SchedulerService,
    private dateTimeUtil: DateTimeUtil,
    private ngbModal: NgbModal,
    private patientService: PatientService,
    private generalOperation: GeneralOperation,
    private logService: LogService) { }

  ngOnInit() {
    this.buildForm();
    this.onRadioOptionChange('current_appointment');
  }

  buildForm() {

    debugger;

    this.radioFormGroup = this.formBuilder.group({
      radioOption: this.formBuilder.control("current_appointment")
    });

    this.addLogFormGroup = this.formBuilder.group({
      ddStatus: this.formBuilder.control(this.appOperationData.appStatusId, Validators.required),
      txtCallDetail: this.formBuilder.control(null, Validators.required)
    });


  }

  onRadioOptionChange(val: string) {
    debugger;
    this.selectedTab = val;
    this.getAppointmentsCallLog(val);   
  }

  getAppointmentsCallLog(option: string) {

    this.lstCallLogs = undefined;
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;

    if (option == "current_appointment") {
      searchCriteria.param_list = [
        { name: "patient_id", value: this.appOperationData.patientId, option: "" },
        { name: "appointment_id", value: this.appOperationData.appointmentId, option: "" }
      ];
    }
    else if (option == "all") {
      searchCriteria.param_list = [
        { name: "patient_id", value: this.appOperationData.patientId, option: "" },
        { name: "appointment_id", value: '', option: "" }
      ];
    }


    this.logService.getAppointmentsCallLog(searchCriteria).subscribe(
      data => {

        this.lstCallLogs = data as Array<any>
        this.isLoading = false;
      },
      error => {
        this.getAppointmentsCallLogError(error);
      }
    );
  }
  getAppointmentsCallLogError(error) {
    this.logMessage.log("getAppointmentsCallLog Error.");
  }

  saveCallLog(formData:any){

    if(formData.ddStatus==undefined || formData.ddStatus=='' ){
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Appointment Call', "Please select appointment status.", AlertTypeEnum.DANGER)
      return;
    }
    else if(formData.txtCallDetail==undefined || formData.txtCallDetail=='' ){
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Appointment Call', "Please enter call details.", AlertTypeEnum.DANGER)
      return;
    }
    else{

      let orm:ORMAppointmentCallsLogSave=new ORMAppointmentCallsLogSave();
      orm.appointment_id=this.appOperationData.appointmentId;
      orm.details=  this.generalOperation.ReplaceAll(formData.txtCallDetail,"'","`");
      orm.status_id=formData.ddStatus;
      orm.created_user=this.lookupList.logedInUser.user_name;
      orm.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      orm.practice_id=this.lookupList.practiceInfo.practiceId;
      orm.system_ip=this.lookupList.logedInUser.systemIp;

      this.logService.saveAppointmentCallsLog(orm).subscribe(
        data => {
          this.saveAppointmentCallsLogSuccess(data);
        },
        error => {
          this.saveAppointmentCallsLogError(error);
        }
      );
    }
  }

  saveAppointmentCallsLogSuccess(data:any) {   

    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.callBack.emit(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Appointment Call', data.response, AlertTypeEnum.DANGER)     
    }

  }

  saveAppointmentCallsLogError(error) {    
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Appointment Call', error.message, AlertTypeEnum.DANGER)
  }


  

}
