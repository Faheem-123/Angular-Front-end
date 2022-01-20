import { Component, OnInit, Inject, Input, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { SchedulerService } from 'src/app/services/scheduler/scheduler.service';
import { PatientService } from 'src/app/services/patient/patient.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { AppointmentOperationData } from '../../appointment-operation-data';
import { LogService } from 'src/app/services/log.service';

@Component({
  selector: 'acu-calls-log',
  templateUrl: './acu-calls-log.component.html',
  styleUrls: ['./acu-calls-log.component.css']
})
export class AcuCallsLogComponent implements OnInit {

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
    this.radioFormGroup = this.formBuilder.group({
      radioOption: this.formBuilder.control("current_appointment")
    });

  }

  onRadioOptionChange(val: string) {
    debugger;
    this.selectedTab = val;
    this.getACUCallsLog(val);
  }

  getACUCallsLog(option: string) {

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
      ];
    }


    this.logService.getACUCallsLog(searchCriteria).subscribe(
      data => {

        this.lstCallLogs = data as Array<any>
        this.isLoading = false;
      },
      error => {
        this.getACUCallsLogError(error);
      }
    );
  }

  getACUCallsLogError(error) {
    this.logMessage.log("getACUCallsLog Error.");
  }
}
