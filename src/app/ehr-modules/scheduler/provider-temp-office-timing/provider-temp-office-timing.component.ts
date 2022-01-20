import { Component, OnInit,Inject } from '@angular/core';
import { NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { SchedulerService } from '../../../services/scheduler/scheduler.service';
import { LogMessage } from '../../../shared/log-message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { ListFilterPipe } from '../../../shared/list-filter-pipe';
import { GeneralOperation } from '../../../shared/generalOperation';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { CustomValidators } from '../../../shared/custome-validators';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { ORMSaveProviderTempTiming } from '../../../models/scheduler/orm-save-provider-temp-timing';
import { ServiceResponseStatusEnum, PromptResponseEnum } from '../../../shared/enum-util';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from '../../../models/general/orm-delete-record';
import { DateModel } from 'src/app/models/general/date-model';
import { TimeModel } from 'src/app/models/general/time-model';

@Component({
  selector: 'provider-temp-office-timing',
  templateUrl: './provider-temp-office-timing.component.html',
  styleUrls: ['./provider-temp-office-timing.component.css']
})
export class ProviderTempOfficeTimingComponent implements OnInit {

  tempTimingForm: FormGroup;

  lstSlotSize: Array<number> = [5, 10, 15, 20, 25, 30]

  editState:boolean;
  lstFileredProviders:Array<any>;
  lstLocationProviders:Array<any>;
  lstLocations:Array<any>;
  lstProviderTempTiming:Array<any>;

  locationId:number;
  providerId:number;

  isLoading:boolean=true;
  isSaving:boolean=false;

  dtFromModel:DateModel;
  dtToModel:DateModel;
  tmFromModel:TimeModel;
  tmToModel:TimeModel;
  tmBreakFromModel:TimeModel;
  tmBreakToModel:TimeModel;
  tempTimingId:number;
  recordToEdit:any;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  constructor(config: NgbTimepickerConfig,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private schedulerService: SchedulerService,
    private logMessage: LogMessage,    
    private modalService: NgbModal,
    private generalOperation: GeneralOperation,
    private dateTimeUtil:DateTimeUtil) {

    config.spinners = false;
    config.size = 'small';


    this.lstLocations = lookupList.locationList.slice();
    this.locationId=this.lstLocations[0].id;

    this.isLoading = true;
    this.getLocationProviders();
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.tempTimingForm = this.formBuilder.group({
      cmbLocation: this.formBuilder.control(this.locationId),
      cmbProvider: this.formBuilder.control(null),

      dpDateFrom: this.formBuilder.control(null,Validators.required),
      dpDateTo: this.formBuilder.control(null,Validators.required),

      tpTimeFrom: this.formBuilder.control(null),
      tpTimeTo: this.formBuilder.control(null),
      cmbSlotSize:this.formBuilder.control(15),
      tpBreakFrom: this.formBuilder.control(null),
      tpBreakTo: this.formBuilder.control(null),


      chkDayOff: this.formBuilder.control(null),
      chkBreakEnabled: this.formBuilder.control(null)
    },
    {
      validator: Validators.compose([              
        CustomValidators.requiredWhenNotBoolean('tpTimeFrom','chkDayOff'),
        CustomValidators.requiredWhenNotBoolean('tpTimeTo','chkDayOff'),
        CustomValidators.requiredWhenNotBoolean('cmbSlotSize','chkDayOff'),
        CustomValidators.requiredWhenBoolean('tpBreakFrom','chkBreakEnabled'),
        CustomValidators.requiredWhenBoolean('tpBreakTo','chkBreakEnabled')
      ])
    }
    );
  }


  getLocationProviders() {
    this.lstLocationProviders = undefined;
    this.schedulerService.getLocationProviders(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstLocationProviders = data as Array<any>;
        this.filterProviders();        
        this.isLoading = false;

        this.getProviderTempTiming();
      },
      error => {
        this.isLoading = false;
        this.ongetLocationProvidersError(error);
      }
    );
  }
  ongetLocationProvidersError(error) {
    this.logMessage.log("getLocationProviders Error.");
  }

  filterProviders() {
    debugger;
    if (this.lstLocationProviders == undefined)
      return;

    this.lstFileredProviders = undefined;

    if (this.locationId != undefined) {
      let listFilterPipe: ListFilterPipe;
      this.lstFileredProviders = new ListFilterPipe().transform(this.lstLocationProviders, "location_id", this.locationId);
      let index: number = this.generalOperation.getitemIndex(this.lstFileredProviders, "provider_id", this.providerId);
     
      if (index == undefined && this.lstFileredProviders != undefined && this.lstFileredProviders.length > 0) {
        this.providerId = this.lstFileredProviders[0].provider_id;
      }
    }

    if (this.lstFileredProviders == undefined || this.lstFileredProviders.length == 0) {
      this.providerId = undefined;
    }
    
    (this.tempTimingForm.get("cmbProvider") as FormControl).setValue(this.providerId);
    // console.log(this.lstFileredProviders.length);
  }

  locationChanged(locId) {    
    this.locationId =locId;
    this.filterProviders();    

    this.getProviderTempTiming();
  }

  providerChanged(proId) {    
    this.providerId =proId;
    this.getProviderTempTiming();
  }

  getProviderTempTiming() {
    this.lstProviderTempTiming = undefined;

    if(this.locationId==undefined || this.providerId==undefined)
      return;

    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "location_id", value: this.locationId, option: "" },
      { name: "provider_id", value: this.providerId, option: "" }
    ];


    this.schedulerService.getProviderTempTimingSettings(searchCriteria).subscribe(
      data => {
        this.lstProviderTempTiming = data as Array<any>;
        this.filterProviders();
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.ongetProviderTempTimingError(error);
      }
    );
  }
  ongetProviderTempTimingError(error) {
    this.logMessage.log("getProviderTempTiming Error.");
  }

  onEdit(record){      

    

    this.recordToEdit=record;
    this.tempTimingId=record.temp_timing_id;


    (this.tempTimingForm.get('cmbLocation') as FormControl).disable();
    (this.tempTimingForm.get('cmbProvider') as FormControl).disable();


    if(record.off_day){
      this.tmFromModel = null;
      this.tmToModel = null;
  
      this.tmBreakFromModel = null;
      this.tmBreakToModel = null;
  
    }
    else{
      this.tmFromModel = this.dateTimeUtil.getTimeModelFromTimeString(record.time_from, DateTimeFormat.DATEFORMAT_hh_mm_a);
      this.tmToModel = this.dateTimeUtil.getTimeModelFromTimeString(record.time_to, DateTimeFormat.DATEFORMAT_hh_mm_a);

      if(record.enable_break){
        this.tmBreakFromModel = this.dateTimeUtil.getTimeModelFromTimeString(record.break_from, DateTimeFormat.DATEFORMAT_hh_mm_a);
        this.tmBreakToModel = this.dateTimeUtil.getTimeModelFromTimeString(record.break_to, DateTimeFormat.DATEFORMAT_hh_mm_a);
      }
      else{
        this.tmBreakFromModel = null;
        this.tmBreakToModel = null;
      }
    }

    this.dtFromModel = this.dateTimeUtil.getDateModelFromDateString(record.date_from, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    this.dtToModel = this.dateTimeUtil.getDateModelFromDateString(record.date_to, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);    
    
    (this.tempTimingForm.get('dpDateFrom') as FormControl).setValue(this.dtFromModel);
    (this.tempTimingForm.get('dpDateTo') as FormControl).setValue(this.dtToModel);
    (this.tempTimingForm.get('tpTimeFrom') as FormControl).setValue(this.tmFromModel);
    (this.tempTimingForm.get('tpTimeTo') as FormControl).setValue(this.tmToModel);
    (this.tempTimingForm.get('cmbSlotSize') as FormControl).setValue(record.slot_size);
    (this.tempTimingForm.get('tpBreakFrom') as FormControl).setValue(this.tmBreakFromModel);
    (this.tempTimingForm.get('tpBreakTo') as FormControl).setValue(this.tmBreakToModel );
    (this.tempTimingForm.get('chkDayOff') as FormControl).setValue(record.off_day);
    (this.tempTimingForm.get('chkBreakEnabled') as FormControl).setValue(record.enable_break);    

    this.editState = true;
  }
 

  onAddNew() {
    debugger;
    this.recordToEdit=undefined;
    this.tempTimingId=undefined;
    this.editState = true;
   

    (this.tempTimingForm.get('cmbLocation') as FormControl).disable();
    (this.tempTimingForm.get('cmbProvider') as FormControl).disable();


    this.tmFromModel = null;
    this.tmToModel = null;
    this.tmBreakFromModel = null;
    this.tmBreakToModel = null;

    this.dtFromModel = this.dateTimeUtil.getDateModelFromDateString(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
    this.dtToModel =  this.dateTimeUtil.getDateModelFromDateString(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);

    (this.tempTimingForm.get('dpDateFrom') as FormControl).setValue(this.dtFromModel);
    (this.tempTimingForm.get('dpDateTo') as FormControl).setValue(this.dtToModel);
    (this.tempTimingForm.get('tpTimeFrom') as FormControl).setValue(null);
    (this.tempTimingForm.get('tpTimeTo') as FormControl).setValue(null);
    (this.tempTimingForm.get('cmbSlotSize') as FormControl).setValue(15);
    (this.tempTimingForm.get('tpBreakFrom') as FormControl).setValue(null);
    (this.tempTimingForm.get('tpBreakTo') as FormControl).setValue(null);
    (this.tempTimingForm.get('chkDayOff') as FormControl).setValue(false);
    (this.tempTimingForm.get('chkBreakEnabled') as FormControl).setValue(false);   
  }

  cancelAddEdit() {  
    debugger;
    this.editState = false;
    this.tempTimingId=undefined;
    this.recordToEdit=undefined;
    (this.tempTimingForm.get('cmbLocation') as FormControl).enable();
    (this.tempTimingForm.get('cmbProvider') as FormControl).enable();
  }

  onSubmit(formValue) {
    debugger;
    

    let ormSaveProviderTempTiming:ORMSaveProviderTempTiming=new ORMSaveProviderTempTiming();

    
    ormSaveProviderTempTiming.practice_id=this.lookupList.practiceInfo.practiceId;
    ormSaveProviderTempTiming.location_id=this.locationId;
    ormSaveProviderTempTiming.provider_id=this.providerId;

    ormSaveProviderTempTiming.date_from= String("00" + formValue.dpDateFrom.month).slice(-2)+'/'+String("00" + formValue.dpDateFrom.day).slice(-2)+'/'+String("0000" + formValue.dpDateFrom.year).slice(-4);
    ormSaveProviderTempTiming.date_to= String("00" + formValue.dpDateTo.month).slice(-2)+'/'+String("00" + formValue.dpDateTo.day).slice(-2)+'/'+String("0000" + formValue.dpDateTo.year).slice(-4);
    
    ormSaveProviderTempTiming.off_day=formValue.chkDayOff;
    if(!formValue.chkDayOff){

      ormSaveProviderTempTiming.time_from=(String("00" + formValue.tpTimeFrom.hour).slice(-2) + ':' + String("00" + formValue.tpTimeFrom.minute) .slice(-2));
      ormSaveProviderTempTiming.time_to=(String("00" + formValue.tpTimeTo.hour).slice(-2) + ':' + String("00" + formValue.tpTimeTo.minute) .slice(-2));

      ormSaveProviderTempTiming.slot_size=formValue.cmbSlotSize;

      ormSaveProviderTempTiming.enable_break=formValue.chkBreakEnabled;

      if(formValue.chkBreakEnabled){
        ormSaveProviderTempTiming.break_from=(String("00" + formValue.tpBreakFrom.hour).slice(-2) + ':' + String("00" + formValue.tpBreakFrom.minute) .slice(-2));
        ormSaveProviderTempTiming.break_to=(String("00" + formValue.tpBreakTo.hour).slice(-2) + ':' + String("00" + formValue.tpBreakTo.minute) .slice(-2));  
      }
      
    }
    
    ormSaveProviderTempTiming.modified_user=this.lookupList.logedInUser.user_name;
    ormSaveProviderTempTiming.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
    ormSaveProviderTempTiming.system_ip=this.lookupList.logedInUser.systemIp;

    if(this.tempTimingId!=undefined){
      ormSaveProviderTempTiming.temp_timing_id=this.tempTimingId;
      ormSaveProviderTempTiming.created_user=this.recordToEdit.created_user;
      ormSaveProviderTempTiming.client_date_created=this.recordToEdit.client_date_created;
      ormSaveProviderTempTiming.date_created=this.recordToEdit.date_created;
    }
    else{
      ormSaveProviderTempTiming.created_user=this.lookupList.logedInUser.user_name;
      ormSaveProviderTempTiming.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
    }

    this.saveTiming(ormSaveProviderTempTiming);
  }

  saveTiming(ormSaveProviderTempTiming:ORMSaveProviderTempTiming){
    this.schedulerService.saveProviderTempTimingSettings(ormSaveProviderTempTiming).subscribe(
      data => {            
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.isSaving = false;
          this.editState=false;
          this.getProviderTempTiming();
          this.editState = false;
          this.tempTimingId=undefined;
          this.recordToEdit=undefined;
          (this.tempTimingForm.get('cmbLocation') as FormControl).enable();
          (this.tempTimingForm.get('cmbProvider') as FormControl).enable();
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
          this.onSaveTimingError(data['response']);
        }      
      },
      error => {
        this.isSaving = false;
        this.onSaveTimingError("An error occured while saving provider timing.");
      }
    );
  }  
  onSuccess(error){
    this.logMessage.log("onSaveTiming Error.");
  }
  onSaveTimingError(error){
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Provider Temp Timing"
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
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = record.temp_timing_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.schedulerService.deleteTempTiming(deleteRecordData)
          .subscribe(
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Provide Temp Timing deleted successfully.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {
      
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Provider Temp Office timing"
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
      this.getProviderTempTiming();
    }
  }
}
