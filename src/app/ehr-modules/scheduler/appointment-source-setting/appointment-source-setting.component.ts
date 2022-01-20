import { Component, OnInit,Inject } from '@angular/core';
import { NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { SchedulerService } from '../../../services/scheduler/scheduler.service';
import { LogMessage } from '../../../shared/log-message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { ServiceResponseStatusEnum, PromptResponseEnum } from '../../../shared/enum-util';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from '../../../models/general/orm-delete-record';
import { ORMSaveAppointmentSource } from '../../../models/scheduler/orm-save-appointment-source';

@Component({
  selector: 'appointment-source-setting',
  templateUrl: './appointment-source-setting.component.html',
  styleUrls: ['./appointment-source-setting.component.css']
})
export class AppointmentSourceSettingComponent implements OnInit {
  
  sourcForm: FormGroup;
  selectedSourceId:number;  
  lstSources:Array<any>;
  recordToEdit:any;

  editState:boolean;
  isLoading:boolean=true;

  
 

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  constructor(private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private schedulerService: SchedulerService,
    private logMessage: LogMessage,    
    private modalService: NgbModal,    
    private dateTimeUtil:DateTimeUtil) {
   
   this.getAppSourceSettings();
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.sourcForm = this.formBuilder.group({
      txtSource: this.formBuilder.control(null,Validators.required)
    });
  }


  getAppSourceSettings() {
    this.isLoading=true;
    this.lstSources = undefined;
    this.schedulerService.getAppointmentSourceSettings(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstSources = data as Array<any>;      
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.ongetAppSourceSettingsError(error);
      }
    );
  }
  ongetAppSourceSettingsError(error) {
    this.logMessage.log("getLocationProviders Error.");
  }

  onEdit(record){          

    this.recordToEdit=record;
    this.selectedSourceId=record.source_id;
    (this.sourcForm.get('txtSource') as FormControl).setValue(record.source);
    this.editState = true;
  }
 

  onAddNew() {
    
    this.recordToEdit=undefined;
    this.editState = true;
    this.selectedSourceId=undefined;
    (this.sourcForm.get('txtSource') as FormControl).setValue(null);
   
  }

  cancelAddEdit() {  
    debugger;
    this.editState = false;    
    this.recordToEdit=undefined;
    this.selectedSourceId=undefined;
    
  }

  onSubmit(formValue) {

    let ormSave:ORMSaveAppointmentSource=new ORMSaveAppointmentSource();
    
    ormSave.source=formValue.txtSource;
    ormSave.practice_id=this.lookupList.practiceInfo.practiceId;
    ormSave.system_ip=this.lookupList.logedInUser.systemIp;
    ormSave.modified_user=this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();

    if(this.selectedSourceId!=undefined){
      ormSave.source_id=this.recordToEdit.source_id;
      ormSave.date_created=this.recordToEdit.date_created;
      ormSave.client_date_created=this.recordToEdit.client_date_created;
      ormSave.created_user=this.recordToEdit.created_user;
    }
    else{      
      ormSave.client_date_created=ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.created_user=this.lookupList.logedInUser.user_name;
    }

    this.schedulerService.saveAppointmentSource(ormSave).subscribe(
      data => {            
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {         
          this.editState=false;
          this.getAppSourceSettings();
         
          this.selectedSourceId=undefined;
          this.recordToEdit=undefined;          
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
          this.onSettingError(data['response']);
        }      
      },
      error => {    
        this.onSettingError("An error occured while saving Appointment Source.");
      }
    );
    
  }

  
  onSettingError(error){
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment Source"
      modalRef.componentInstance.promptMessage = error;

      let closeResult;

      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {          
          //alert(reason);
        });
  }

  onDelete(record){
   

    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = record.source_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.schedulerService.deleteAppointmentSource(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Appointment Source Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment Source"
      modalRef.componentInstance.promptMessage = data.response;

      let closeResult;

      modalRef.result.then((result) => {


        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      this.getAppSourceSettings();
    }
  }

}
