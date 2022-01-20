import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ORMROSSave } from 'src/app/models/encounter/ORMROSSave';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { TemplateMainComponent } from '../chart-template/template-main/template-main.component';
import { LastNoteComponent } from '../last-note/last-note.component';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';

@Component({
  selector: 'ros',
  templateUrl: './ros.component.html',
  styleUrls: ['./ros.component.css']
})
export class RosComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen:EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  canView: boolean = false;
  canAddEdit: boolean = false;
  addEditView: boolean = false;
  isLoading=false;
  noRecordFound=true;
  editOperation='';
  objROsDetail;
  inputForm:FormGroup;
  lstExamView;
  isEditable=true;
  lastModifiedMsg='';
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private logMessage: LogMessage,private dateTimeUtil: DateTimeUtil,
  private encounterService: EncounterService,private formBuilder: FormBuilder,
  private modalService: NgbModal) { 

  this.canView=this.lookupList.UserRights.ViewROS;
  this.canAddEdit=this.lookupList.UserRights.AddModifyROS;
  }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      
    if(this.canView)
    {
      this.getViewData();
    }
    
    this.buildForm();
    if(!this.canAddEdit)
    {
      this.inputForm.disable();
    }
  }

  getViewData(){
    this.isLoading = true;
    this.noRecordFound = false;
    this.editOperation='';
    this.encounterService.getChartROS(this.objencounterToOpen.chart_id.toString())
      .subscribe(
        data => {
          debugger;
          this.lstExamView = data;
          if (this.lstExamView == undefined || this.lstExamView.length == 0) {
            debugger;
            this.noRecordFound = true;
            this.editOperation='new';
            this.isEditable=false;
            this.addEditView=false;
          }
          else{
            this.editOperation='';
            (this.inputForm.get("txtComments") as FormControl).setValue(this.lstExamView.ros_detail);
            this.addEditView=true;
            this.isEditable=true;
            this.noRecordFound = false;
            this.lastModifiedMsg = this.lstExamView.modified_user + " at " + this.lstExamView.client_date_modified;
          }
          this.isLoading = false;

          if (this.noRecordFound==true) 
          {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else
          {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting ROS list.")
          this.isLoading = false;
        }
      );
  }

  buildForm(){
    this.inputForm = this.formBuilder.group({
      txtComments: this.formBuilder.control("", Validators.required),
    })
  }
  onAddEditClick(){
    this.addEditView=true;
    this.isEditable=false;
  }
  onSaveROS(formValue){
    debugger;
    let ormSave: ORMROSSave = new ORMROSSave();
    if (this.editOperation == "new") 
    {
      ormSave.created_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
    }
    else
    {
      ormSave.patient_ros_id=this.lstExamView.patient_ros_id;
      ormSave.client_date_created = this.lstExamView.client_date_created;
      ormSave.date_created = this.lstExamView.date_created;
      ormSave.created_user = this.lstExamView.created_user;
    }
    ormSave.modified_user=this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
    ormSave.patient_id=this.objencounterToOpen.patient_id.toString();
    ormSave.chart_id=this.objencounterToOpen.chart_id.toString();
    ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();
    ormSave.system_ip=this.lookupList.logedInUser.systemIp;
    ormSave.ros_detail=formValue.txtComments;
    
    this.encounterService.saveChartRos(ormSave).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.addEditView = false;
          this.isEditable=true;
          this.getViewData();
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {

          this.showError(data['response']);
        }
      },
      error => {
        this.showError("An error occured while saving Chart PhysicalExam.");
      }
    );
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  showError(errMsg) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Error";
    modalRef.componentInstance.promptMessage = errMsg;
    modalRef.componentInstance.alertType = "error";

    let closeResult;

    modalRef.result.then((result) => {

      //alert(result);
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
        //alert(reason);
      });

    return;
  }
  onTemplateClick(){
    debugger; 
    const modalRef = this.modalService.open(TemplateMainComponent, { size: 'lg', windowClass: 'modal-adaptive',backdrop: 'static' });
    modalRef.componentInstance.objencounterToOpen = this.objencounterToOpen;
    modalRef.componentInstance.module_txt=(this.inputForm.get('txtComments') as FormControl).value;
    
    modalRef.componentInstance.callingFrom='ROS';
    
    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        debugger;
        (this.inputForm.get('txtComments') as FormControl).setValue(result);
        //@autoSave
        this.onSaveROS(this.inputForm.value);
      }
    }
      , (reason) => {
      });
  }
  onLastROSClick(){
    debugger; 
    const modalRef = this.modalService.open(LastNoteComponent, { size: 'lg', windowClass: 'modal-adaptive',backdrop: 'static' });
    modalRef.componentInstance.header = 'Previous ROS';
    modalRef.componentInstance.callingFrom='ROS';
    modalRef.componentInstance.patient_id=this.objencounterToOpen.patient_id;
    modalRef.componentInstance.chart_id=this.objencounterToOpen.chart_id;
    
    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        debugger;
        (this.inputForm.get('txtComments') as FormControl).setValue(result);
      }
    }
      , (reason) => {
      });
  }
  onCancelRos(){
    if (this.lstExamView == undefined || this.lstExamView.length == 0) {
      debugger;
      (this.inputForm.get("txtComments") as FormControl).setValue("");
      this.noRecordFound = true;
      this.editOperation='new';
      this.isEditable=false;
      this.addEditView=false;
      return;
    }    
    this.editOperation='';
    this.addEditView=true;
    this.isEditable=true;
    (this.inputForm.get("txtComments") as FormControl).setValue(this.lstExamView.ros_detail);            
  }
  showLogHistory() {
    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "patient_ros_log";
    logParameters.logDisplayName = "Review Of System";
    logParameters.logMainTitle = "Review Of System";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;

    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;

  }  
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
}
