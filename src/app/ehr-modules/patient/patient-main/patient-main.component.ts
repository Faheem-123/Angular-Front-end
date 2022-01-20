import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { PatientSearchObservable } from 'src/app/services/observable/patient-search-observable';
import { PatientService } from 'src/app/services/patient/patient.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { LogMessage } from 'src/app/shared/log-message';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { OpenModuleService } from '../../../services/general/openModule.service';
import { MainTabsEnum, OperationType, ServiceResponseStatusEnum, CallingFromEnum } from '../../../shared/enum-util';
//import { LOOKUP_LIST, LookupList } from '../../providers/lookupList.module';
import { TabsComponent } from '../../patient/patient-tab/tabs.component';
import { OperationData, OperationDataOptionEnum } from './operation-data';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogParameters } from '../../log/log-parameters';

@Component({
  selector: 'patient-main',
  templateUrl: './patient-main.component.html',
  styleUrls: ['./patient-main.component.css']
})

export class PatientMainComponent implements OnInit {


  childActiveTab: any;
  @ViewChild('patientContent') patientContentTemplate: any;
  @ViewChild(TabsComponent) tabsComponent: any;

  addEditPatientFlag: boolean = false;
  addEditOperation: OperationType;
  patientId: number;

  showMergePatientFlag: boolean = false;
  showFlexApp: boolean = false;
  flax_app_url: string = "";
  showAuditLog: boolean = false;
  logParameters: LogParameters;

  constructor(private openModuleService: OpenModuleService,
    private patientSearchObservable: PatientSearchObservable,
    private patientService: PatientService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private generalService: GeneralService,
    private generalOperation: GeneralOperation) {

    //Catch the event to make the search
    this.openModuleService.openPatient.subscribe(value => {
      //console.log("Open Patient:"+value);
      this.openPatient(value);
    });
  }

  ngOnInit() {
  }



  /*
  openPatientClick(patient: any) {
    debugger;
    let patientToOpen: PatientToOpen = new PatientToOpen();
    patientToOpen.patient_id = patient.patient_id;
    patientToOpen.patient_name = patient.name;
    if (patient.childName != "" && patient.childName != undefined)
      patientToOpen.child_module = patient.childName;
    this.openPatient(patientToOpen);

  }
  */
  openPatient(patientToOpen: PatientToOpen) {

    debugger;

    this.openModuleService.navigateToTab.emit(MainTabsEnum.PATIENT);// "patient-tab-main");
    this.tabsComponent.openTab(
      patientToOpen.patient_name,
      this.patientContentTemplate,
      patientToOpen,
      true
    );

    let objKeyValue: Array<ORMKeyValue> = new Array<ORMKeyValue>();
    objKeyValue.push(new ORMKeyValue("practice_id", this.lookupList.practiceInfo.practiceId));
    objKeyValue.push(new ORMKeyValue("patient_id", patientToOpen.patient_id));
    objKeyValue.push(new ORMKeyValue("user_name", this.lookupList.logedInUser.user_name));

    this.patientService.saveOpenedPatient(objKeyValue).subscribe(
      data => {
        debugger;
        this.saveOpenedPatientSuccess(data);
      },
      error => {
        debugger;
        this.logMessage.log("saveOpenedPatient Error.");
      }
    );


    //Audit Log
    debugger;
    this.generalService.auditLog(
      this.generalOperation.moduleAccessLog("Access", patientToOpen.child_module == undefined ? 'Patient' : patientToOpen.child_module, patientToOpen.patient_id, ""))
      .subscribe(
        data => {
        });

  }
  saveOpenedPatientSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      //this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      //alert("Error" + data.response);
      this.logMessage.log("Error: saveOpenedPatient:" + data.response);
    }
  }


  onAddNewPatient() {
    debugger;
    this.addEditOperation = OperationType.ADD;
    this.addEditPatientFlag = true;
  }



  onEditPatient(patientId: number) {
    debugger;
    this.patientId = patientId;
    this.addEditOperation = OperationType.EDIT;
    this.addEditPatientFlag = true;
  }


  onAddEditPatientSaved(patientToOpen: PatientToOpen) {
    debugger;
    this.addEditPatientFlag = false;

    if (this.addEditOperation == OperationType.ADD) {
      this.openPatient(patientToOpen);
    }
    else if (this.addEditOperation == OperationType.EDIT) {
      //this.patientSearchObservable.searchPatient(patientToOpen.patient_id);    
      this.patientSearchObservable.searchPatient(undefined);
    }
    this.patientId = undefined;
    this.addEditOperation = undefined
  }

  onAddEditPatientCancelled() {
    debugger;
    this.addEditPatientFlag = false;
    this.patientId = undefined;
    this.addEditOperation = undefined
  }



  showMergePatient() {
    this.showMergePatientFlag = true;
  }



  mergePatientCallBack(option: boolean) {
    this.showMergePatientFlag = false;

    if (option == true) {
      this.patientSearchObservable.searchPatient(undefined);
    }
  }

  onShowFlexApp(url: string) {

    this.flax_app_url = url;
    this.showFlexApp = true;
  }


  FlexAppCallBack() {
    this.showFlexApp = false;
  }

  performAction(operationData: OperationData) {

    debugger;

    switch (operationData.operation) {
      case OperationDataOptionEnum.OPEN:
        let patientToOpen: PatientToOpen = operationData.data as PatientToOpen;
        this.openPatient(patientToOpen);
        break;
      case OperationDataOptionEnum.EDIT:
        let patId: number = Number(operationData.data);
        this.onEditPatient(patId);
        break;
      case OperationDataOptionEnum.ADD:
        this.onAddNewPatient();
        break;
      case OperationDataOptionEnum.MERGE_PATIENT:
        this.showMergePatient();
        break;
      case OperationDataOptionEnum.SHOW_FLEX_APP:
        let url: string = operationData.data.toString();
        this.onShowFlexApp(url);
        break;
      case OperationDataOptionEnum.SHOW_AUDIT_LOG:

        let patient: PatientToOpen = operationData.data as PatientToOpen;
        this.logParameters = new LogParameters();
        this.logParameters.logName = patient.other_option;
        this.logParameters.patientId = patient.patient_id;
        this.logParameters.PID = patient.pid;
        this.logParameters.patientName = patient.patient_name;
        this.logParameters.enableSearch = true;
        this.logParameters.logMainTitle = "Patient Log";
        this.logParameters.logDisplayName = "Patient Log";
        this.logParameters.callingFrom = CallingFromEnum.PATIENT;
        this.showAuditLog = true;
        break;

      default:
        break;
    }

  }

  navigateBackToSearch() {
    this.showAuditLog = false;
    this.patientId = undefined;
    this.logParameters=undefined;
  }
}
