import { Component, OnInit,Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { SchedulerService } from '../../../services/scheduler/scheduler.service';
import { LogMessage } from '../../../shared/log-message';
import { GeneralOperation } from '../../../shared/generalOperation';
import { ORMSaveAppointmentRules } from '../../../models/scheduler/orm-save-appointment-rules';
import { DateTimeUtil } from '../../../shared/date-time-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ServiceResponseStatusEnum, PromptResponseEnum } from '../../../shared/enum-util';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'appointment-rules',
  templateUrl: './appointment-rules.component.html',
  styleUrls: ['./appointment-rules.component.css']
})
export class AppointmentRulesComponent implements OnInit {

  providerId:number;
  lstAppRules:Array<any>;
  lstProviders: Array<any>;

  editState:boolean=false;
  isLoading:boolean=false;

  lstNoOfSlotPerAppoitment:Array<any>=[1,2,3,4,5,6,7,8,9,10];  

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor( @Inject(LOOKUP_LIST) public lookupList: LookupList,
  private schedulerService:SchedulerService,
  private logMessage:LogMessage,
  private generalOperation:GeneralOperation,
  private dateTimeUtil: DateTimeUtil,
  private modalService: NgbModal) {    
    this.getDistinctLocatinProviders();
   }

  ngOnInit() {    
  }

  getDistinctLocatinProviders(){
    this.isLoading=true;
    this.lstAppRules=undefined;
    this.schedulerService.getDistinctLocationProviders(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {        
        this.lstProviders = data as Array<any>;       
        this.isLoading = false;

        this.providerId=this.lstProviders[0].id;
        this.getAppointmentRules();

      },
      error => {
        this.isLoading = false;
        this.ongetDistinctLocatinProvidersError(error);
      }
    );
  }
  ongetDistinctLocatinProvidersError(error) {
    this.logMessage.log("getDistinctLocatinProviders Error.");
  }

  getAppointmentRules(){
    this.isLoading=true;
    this.lstAppRules=undefined;
    this.schedulerService.getAppointmentRules(this.providerId).subscribe(
      data => {
        this.lstAppRules = data as Array<any>;       
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.ongetAppointmentRulesError(error);
      }
    );
  }
  ongetAppointmentRulesError(error) {
    this.logMessage.log("getAppointmentRules Error.");
  }


  providerChanged(proId){
    if(this.editState || proId==this.providerId)
      return;
    this.providerId=proId;
    this.getAppointmentRules();
  }

  slotCountChanged(record,newValue){

    let index: number = this.generalOperation.getitemIndex(this.lstAppRules, "setting_id",record.setting_id);
    if(!this.lstAppRules[index].is_modified){
      this.lstAppRules[index].slot_appointment_size_orignial=this.lstAppRules[index].slot_appointment_size;
    }

    if(newValue==undefined || newValue=="")
    {
      this.lstAppRules[index].is_modified= true;
      this.lstAppRules[index].slot_appointment_size= null;
    }
    else{
      this.lstAppRules[index].is_modified= true;
      this.lstAppRules[index].slot_appointment_size= Number(newValue);
    }
  }

  onEdit(){
    this.editState=true;
  }

  onCancel(){
    this.editState=false
    this.getAppointmentRules();
  }

  onSave(){
   
    debugger;
    let lstSave=[];

    for(let rule of this.lstAppRules){

      if(rule.is_modified && rule.slot_appointment_size_orignial!=rule.slot_appointment_size){

        let objSave:ORMSaveAppointmentRules=new ORMSaveAppointmentRules();


        if(rule.rule_id!=undefined && rule.rule_id!=null){
          objSave.rule_id=rule.rule_id;
          objSave.client_date_created=rule.client_date_created;
          objSave.date_created=rule.date_created;
          objSave.created_user=rule.created_user;
        }
        else{
          objSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
          objSave.created_user=this.lookupList.logedInUser.user_name;
        }

        objSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
        objSave.modified_user=this.lookupList.logedInUser.user_name;
        objSave.system_ip=this.lookupList.logedInUser.systemIp;

        objSave.location_id=rule.location_id;
        objSave.provider_id=this.providerId;
        objSave.practice_id=this.lookupList.practiceInfo.practiceId;
        objSave.slot_appointment_size=rule.slot_appointment_size;
        lstSave.push(objSave);
      }
    }

    if(lstSave.length>0){
      this.saveAppointmentRules(lstSave);
    }
    else{
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment Rules"
      modalRef.componentInstance.promptMessage = "There is no change to be saved.";

      let closeResult;

      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {          
          //alert(reason);
        });
    }

  }
  saveAppointmentRules(lstSave:Array<ORMSaveAppointmentRules>){
    this.schedulerService.saveAppointmentRules(lstSave).subscribe(
      data => {     
        debugger;       
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.editState=false;
          this.getAppointmentRules();
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
          this.onSaveRulesError(data['response']);
        }      
      },
      error => {       
        this.onSaveRulesError("An error occured while saving record.");
      }
    );
  }
  onSaveSuccess(error){
    this.logMessage.log("onSaveTiming Error.");
  }
  onSaveRulesError(error){
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment Rules"
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
}
