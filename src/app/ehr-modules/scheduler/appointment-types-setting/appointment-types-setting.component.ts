import { Component, OnInit, Inject } from '@angular/core';
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
import { ORMSaveAppointmentType } from '../../../models/scheduler/orm-save-appointment-type';



@Component({
  selector: 'appointment-types-setting',
  templateUrl: './appointment-types-setting.component.html',
  styleUrls: ['./appointment-types-setting.component.css']
})
export class AppointmentTypesSettingComponent implements OnInit {

  fromGroup: FormGroup;
  selectedId: number;
  lstTypes:Array<any>;
  recordToEdit:any;

  editState: boolean;
  isLoading: boolean = true;

  lstDuration: Array<number> = [5, 10, 15, 20, 25, 30];

  defaultTypeColor:string="#ACD2D9";
  defaultColorComments:string="#FFFFFF";
  defaultColorLabel:string="#000000";

  typeColor:string="#ACD2D9";
  colorComments:string="#FFFFFF";
  colorLabel:string="#000000";

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private schedulerService: SchedulerService,
    private logMessage: LogMessage,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil) {

    this.getAppTypeSettings();
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.fromGroup = this.formBuilder.group({
      txtType: this.formBuilder.control(null, Validators.required),
      cmbDuration: this.formBuilder.control(null, Validators.required)     
    });
  }


  getAppTypeSettings() {
    this.isLoading = true;
    this.lstTypes = undefined;
    this.schedulerService.getAppointmentTypeSettings(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstTypes = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.ongetAppTypeSettingsError(error);
      }
    );
  }
  ongetAppTypeSettingsError(error) {
    this.logMessage.log("getAppTypeSettings Error.");
  }

  onEdit(record) {

    this.typeColor=record.type_color;
    this.colorComments=record.comments_color;
    this.colorLabel=record.label_color;

    this.recordToEdit = record;
    this.selectedId = record.type_id;
    (this.fromGroup.get('txtType') as FormControl).setValue(record.description);
    (this.fromGroup.get('cmbDuration') as FormControl).setValue(record.type_duration);
    this.editState = true;
  }


  onAddNew() {

    this.typeColor=this.defaultTypeColor;
    this.colorComments=this.defaultColorComments;
    this.colorLabel=this.defaultColorLabel;

    this.recordToEdit = undefined;
    this.editState = true;
    this.selectedId = undefined;
    (this.fromGroup.get('txtType') as FormControl).setValue(null);
    (this.fromGroup.get('cmbDuration') as FormControl).setValue(15);

  }

  cancelAddEdit() {
    debugger;
    this.editState = false;
    this.recordToEdit = undefined;
    this.selectedId = undefined;

  }

  onSubmit(formValue) {
    
    let ormSave:ORMSaveAppointmentType=new ORMSaveAppointmentType();
    
    ormSave.description=formValue.txtType;
    ormSave.type_duration=formValue.cmbDuration;
    ormSave.practice_id=this.lookupList.practiceInfo.practiceId;
    ormSave.system_ip=this.lookupList.logedInUser.systemIp;
    ormSave.modified_user=this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();


    ormSave.type_color=this.typeColor;
    ormSave.comments_color=this.colorComments;
    ormSave.label_color=this.colorLabel;

    if(this.selectedId!=undefined){
      ormSave.type_id=this.recordToEdit.type_id;
      ormSave.date_created=this.recordToEdit.date_created;
      ormSave.client_date_created=this.recordToEdit.client_date_created;
      ormSave.created_user=this.recordToEdit.created_user;
    }
    else{      
      ormSave.client_date_created=ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.created_user=this.lookupList.logedInUser.user_name;
    }

    this.schedulerService.saveAppointmentType(ormSave).subscribe(
      data => {            
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {         
          this.editState=false;
          this.getAppTypeSettings();         
          this.selectedId=undefined;
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


  onSettingError(error) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Appointment Type"
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

  onDelete(record) {

    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = record.type_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.schedulerService.deleteAppointmentType(deleteRecordData)
          .subscribe(
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Appointment Type Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment Type"
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
      this.getAppTypeSettings();
    }
  }
}
