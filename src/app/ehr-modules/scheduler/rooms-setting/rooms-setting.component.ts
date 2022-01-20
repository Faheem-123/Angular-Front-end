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
import { ORMSaveAppointmentStatus } from '../../../models/scheduler/orm-save-appointment-status';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { ORMSaveLocationRooms } from '../../../models/scheduler/orm-save-location-rooms';


@Component({
  selector: 'rooms-setting',
  templateUrl: './rooms-setting.component.html',
  styleUrls: ['./rooms-setting.component.css']
})
export class RoomsSettingComponent implements OnInit {

  formGroup: FormGroup;

  lstLocations:Array<any>;
  locationId:number;

  
  selectedId:number;  
  lstRooms:Array<any>;
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

      this.lstLocations = this.lookupList.locationList.slice();
      this.locationId=this.lstLocations[0].id;
   
      this.getLocationRooms();
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      txtRoom: this.formBuilder.control(null,Validators.required),
      chkColor: this.formBuilder.control(false),
      chkDefault: this.formBuilder.control(false)
    });
  }

  locationChanged(locId){

    if(this.editState || locId== this.locationId)
      return;

    this.locationId=locId;
    this.getLocationRooms();
  }


  getLocationRooms() {
    this.isLoading=true;
    this.lstRooms = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "location_id", value: this.locationId, option: "" }      
    ];

    this.schedulerService.getLocationRoomsSettings(searchCriteria).subscribe(
      data => {
        this.lstRooms = data as Array<any>;     
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.ongetLocationRoomsSettingsError(error);
      }
    );
  }
  ongetLocationRoomsSettingsError(error) {
    this.logMessage.log("getLocationRoomsSettings Error.");
  }

  onEdit(record){          

    debugger;
    this.editState = true;
    this.recordToEdit=record;
    this.selectedId=record.rooms_id;
    (this.formGroup.get('txtRoom') as FormControl).setValue(record.name);
    (this.formGroup.get('chkColor') as FormControl).setValue(record.is_color);
    (this.formGroup.get('chkDefault') as FormControl).setValue(record.is_default);
  
  }
 

  onAddNew() {
    
    this.recordToEdit=undefined;
    this.editState = true;
    this.selectedId=undefined;
    (this.formGroup.get('txtRoom') as FormControl).setValue(null);
    (this.formGroup.get('chkColor') as FormControl).setValue(null);
    (this.formGroup.get('chkDefault') as FormControl).setValue(null);
   
  }

  onCancel() {  
    debugger;
    this.editState = false;    
    this.recordToEdit=undefined;
    this.selectedId=undefined;
    
  }

  onSubmit(formValue) {

    debugger;

    let ormSave:ORMSaveLocationRooms=new ORMSaveLocationRooms();
    
    ormSave.name=formValue.txtRoom;
    ormSave.practice_id=this.lookupList.practiceInfo.practiceId;
    ormSave.system_ip=this.lookupList.logedInUser.systemIp;
    ormSave.modified_user=this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
    ormSave.location_id=this.locationId;
    ormSave.is_color=formValue.chkColor;
    ormSave.is_default=formValue.chkDefault;
    ormSave.short_name="";

    if(this.selectedId!=undefined){
      ormSave.rooms_id=this.recordToEdit.rooms_id;
      ormSave.date_created=this.recordToEdit.date_created;
      ormSave.client_date_created=this.recordToEdit.client_date_created;
      ormSave.created_user=this.recordToEdit.created_user;
    }
    else{      
      ormSave.client_date_created=ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.created_user=this.lookupList.logedInUser.user_name;
    }

    this.schedulerService.saveLocationRoom(ormSave).subscribe(
      data => {            
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {         
          this.editState=false;
          this.getLocationRooms();
         
          this.selectedId=undefined;
          this.recordToEdit=undefined;          
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
          this.onSettingError(data['response']);
        }      
      },
      error => {    
        this.onSettingError("An error occured while saving Location Room.");
      }
    );
    
  }

  
  onSettingError(error){
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Locatino Room"
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
        deleteRecordData.column_id = record.rooms_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.schedulerService.deleteLocationRoom(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Room Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Locaiton Room"
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
      this.getLocationRooms();
    }
  }


}
