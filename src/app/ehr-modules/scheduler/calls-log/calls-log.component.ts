import { Component, OnInit, Input, Inject } from '@angular/core';
import { PatientService } from 'src/app/services/patient/patient.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { AppointmentOperationData } from '../appointment-operation-data';

@Component({
  selector: 'app-calls-log',
  templateUrl: './calls-log.component.html',
  styleUrls: ['./calls-log.component.css']
})
export class CallsLogComponent implements OnInit {
  printView='';
  appDate='';
  isRecordSaved='';
  @Input() appOperationData: AppointmentOperationData;
  

  patientName: string;
  patAge: string;
  patGender: string;
  patPID: string;
  patDOB: string;
  patAddress: string;
  patZip: string;
  patCity: string;
  patState: string;
  patContactNo: string;
  patInsurance: string;
  patPicURL: string;

  constructor(
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    public activeModal: NgbActiveModal,
    private logMessage: LogMessage,
    private generalOperation: GeneralOperation,
    private patientService: PatientService) { }

  ngOnInit() {

    this.getPatientHeaderInfo();

    this.appDate= this.appOperationData.appDate;
  }


  getPatientHeaderInfo() {
    this.patientService.getPatientHeader(this.appOperationData.patientId).subscribe(
      data => {
        this.onHeaderSuccessfull(data);
      },
      error => {
        this.onHeaderError(error);
      }
    );
  }

  onHeaderSuccessfull(data) {

    this.patPID = data["pid"];
    this.patientName = data["last_name"] + ", " + data["first_name"];

    if (data["gender_code"] == 'F') {
      this.patGender = "FEMALE";
    }
    else if (data["gender_code"] == 'M') {
      this.patGender = "MALE";
    }
    else if (data["gender_code"] == 'U') {
      this.patGender = "UNKNOWN";
    }
    else {
      this.patGender = "";
    }

    this.patDOB = data["dob"];
    this.patAddress = data["address"];
    this.patCity = data["city"];
    this.patState = data["state"];
    this.patZip = data["zip"];
    this.patContactNo = data["primary_contact_no"];
    this.patAge = "";
    if (data['age_year'] > 0) {
      this.patAge += data['age_year'] + 'Y ';
    }
    if (data['age_month'] > 0) {
      this.patAge += data['age_month'] + 'M';
    }
    if (data['age_year'] == 0 && data['age_month'] == 0 && data['age_days'] > 0) {
      this.patAge += data['age_days'] + 'D';
    }


    this.patPicURL = this.generalOperation.getPatientPicturePath(data["pic"], data["gender_code"]);
  }
  onHeaderError(error) {
    this.logMessage.log("onHeaderError Error.");
  }

  patPicErrorHandler(event) {
    event.target.src = this.lookupList.defaultPatPic;;
  }

  callBack(value:any){

    debugger;

    if(value){
      this.activeModal.close(value);
    }

  }

}
