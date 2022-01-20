import { Component, OnInit, Input, Inject, EventEmitter, Output } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ORMSessionInfo } from 'src/app/models/encounter/ORM_SessionInfo';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModal, NgbModalOptions, NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { LogMessage } from 'src/app/shared/log-message';
import { ChartModuleHistoryComponent } from 'src/app/general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from 'src/app/models/encounter/chartmodulehistory';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';

@Component({
  selector: 'chart-sessioninfo',
  templateUrl: './chart-sessioninfo.component.html',
  styleUrls: ['./chart-sessioninfo.component.css']
})
export class ChartSessioninfoComponent implements OnInit {
  @Input() objencounterToOpen: EncounterToOpen;
  @Input() moduleName: string;
  @Output() dataUpdated = new EventEmitter<any>();
  private obj_SessionInfoHistory: chartmodulehistory;
  isLoading=false;
  addEditView: boolean = false;
  sessionInfoForm: FormGroup;
  acSessionInfoResult;
  acSessionInfoResult_COPY;
  dateTimeIN;
  dateTimeOUT;
  canView=false;
  canAddEdit=false;
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  constructor(config: NgbTimepickerConfig,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    private logMessage: LogMessage,
    private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) {
      config.spinners = false;
      config.size = 'small';

      this.canView = this.lookupList.UserRights.ViewSessionInfo;
      this.canAddEdit = this.lookupList.UserRights.AddModifySessionInfo;
     }

  ngOnInit() {
    debugger;
    this.buildForm();
    if(this.canView)
    {
      this.getSessionInfo(this.objencounterToOpen.chart_id);
    }
    if(this.canAddEdit==false)
    {
     this.sessionInfoForm.disable();
    }
  }
  buildForm() {
    this.sessionInfoForm = this.formBuilder.group({
      timein: this.formBuilder.control(""),
      timeout: this.formBuilder.control(""),
      txt_sessionNo: this.formBuilder.control(""),
      change_medication_no: this.formBuilder.control(""),
      change_medication_yes: this.formBuilder.control(""),
      treatmentplan_unchange: this.formBuilder.control(""),
      treatmentplan_modified: this.formBuilder.control(""),
      chkbox_signifimprov: this.formBuilder.control(""),
      chkbox_suicide: this.formBuilder.control(""),      
      chkbox_homicide: this.formBuilder.control(""),
      chkbox_violence: this.formBuilder.control(""),
      ddl_SHV: this.formBuilder.control(""),
      chkbox_moderateimprov: this.formBuilder.control(""),
      chkbox_mentalstatusconcern: this.formBuilder.control(""),      
      ddl_MSC: this.formBuilder.control(""),
      chkbox_minimalimpro: this.formBuilder.control(""),
      chkbox_nochange: this.formBuilder.control(""),
      chkbox_deteriorated: this.formBuilder.control(""),
      chkbox_individual: this.formBuilder.control(""),
      chkbox_couplefamily: this.formBuilder.control(""),
      chkbox_initialassessment: this.formBuilder.control(""),
      chkbox_collateralconsult: this.formBuilder.control(""),
      chkbox_group: this.formBuilder.control(""),
      txt_notes: this.formBuilder.control("")
    })
  }
  checkBoxgeneralChange(){
    this.addEditView = true;
  }
  changeTime(){
    this.addEditView = true;
  }
  changeText(){
    this.addEditView = true;
  }
  generalChange(){
    this.addEditView = true;
  }
  cancelAddEdit(){
    this.addEditView = false;
    this.sessionInfoForm.reset();
    if(this.acSessionInfoResult.length>0){
      this.acSessionInfoResult_COPY = this.acSessionInfoResult;
      this.acSessionInfoResult = null;
      this.acSessionInfoResult = this.acSessionInfoResult_COPY;
    }else{
      if(this.canView){
        this.getSessionInfo(this.objencounterToOpen.chart_id);
      }
    }
  }
  saveSessionInfo(formvalue){
    debugger;
    let ormSave: ORMSessionInfo = new ORMSessionInfo();
    ormSave.patient_id = this.objencounterToOpen.patient_id.toString();
		ormSave.chart_id = this.objencounterToOpen.chart_id.toString();
    ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    if(formvalue.timeout!="")
    {
      let timeOutString = this.dateTimeUtil.getStringTimeFromTimeModel(formvalue.timeout);
      ormSave.time_out = timeOutString;
    }
    else{
      ormSave.time_out = null;
    }
    if(formvalue.timein!='')
    {
      let timeInString = this.dateTimeUtil.getStringTimeFromTimeModel(formvalue.timein);
      ormSave.time_in = timeInString;
    }
    else
    {
      ormSave.time_in = null;
    }
    //ormSave.time_in = (this.sessionInfoForm.get('timein') as FormControl).value;
    
    ormSave.session_no = (this.sessionInfoForm.get('txt_sessionNo') as FormControl).value;
    ormSave.individual = formvalue.chkbox_individual == true ? true:formvalue.chkbox_individual == false ? false : null;
    ormSave.couple_family = formvalue.chkbox_couplefamily == true ? true:formvalue.chkbox_couplefamily == false ? false: null;
    ormSave.initial_assessment = formvalue.chkbox_initialassessment == true ? true:formvalue.chkbox_initialassessment == false ? false: null;
    ormSave.collateral_consult = formvalue.chkbox_collateralconsult == true ? true:formvalue.chkbox_collateralconsult == false ? false: null;
    ormSave.grouptype = formvalue.chkbox_group == true ? true:formvalue.chkbox_group == false ? false: null;
    ormSave.significant_improv = formvalue.chkbox_signifimprov == true ? true:formvalue.chkbox_signifimprov == false ? false: null;
    ormSave.suicide = formvalue.chkbox_suicide == true ? true:formvalue.chkbox_suicide == false ? false: null;
    ormSave.homicide = formvalue.chkbox_homicide == true ? true:formvalue.chkbox_homicide == false ? false: null;
    ormSave.violence = formvalue.chkbox_violence == true ? true:formvalue.chkbox_violence == false ? false: null;
    ormSave.ddl_shv = (this.sessionInfoForm.get('ddl_SHV') as FormControl).value;
    ormSave.moderate_improv = formvalue.chkbox_moderateimprov == true ? true:formvalue.chkbox_moderateimprov == false ? false: null;
    ormSave.mental_status = formvalue.chkbox_mentalstatusconcern == true ? true:formvalue.chkbox_mentalstatusconcern == false ? false: null;
    ormSave.ddl_msc = (this.sessionInfoForm.get('ddl_MSC') as FormControl).value;
    ormSave.minimal_improv = formvalue.chkbox_minimalimpro == true ? true:formvalue.chkbox_minimalimpro == false ? false: null;
    ormSave.no_change = formvalue.chkbox_nochange == true ? true:formvalue.chkbox_nochange == false ? false: null;
    ormSave.deteriorated = formvalue.chkbox_deteriorated == true ? true:formvalue.chkbox_deteriorated == false ? false: null;
    ormSave.changeinmedno = formvalue.change_medication_no == true ? true:formvalue.change_medication_no == false ? false: null;
    ormSave.changeinmedyes = formvalue.change_medication_yes == true ? true:formvalue.change_medication_yes == false ? false: null;
    ormSave.treatmentplanunchanged = formvalue.treatmentplan_unchange == true ? true:formvalue.treatmentplan_unchange == false ? false: null;
    ormSave.treatmentplanmodified = formvalue.treatmentplan_modified == true ? true:formvalue.treatmentplan_modified == false ? false: null;
    ormSave.notes = (this.sessionInfoForm.get('txt_notes') as FormControl).value;
    ormSave.deleted = false;
    ormSave.date_modified = this.dateTimeUtil.getCurrentDateTimeString();
       
    if(this.acSessionInfoResult.length>0){
      //o
      ormSave.sessional_id = this.acSessionInfoResult[0].sessional_id;
      ormSave.date_created = this.acSessionInfoResult[0].date_created;
      ormSave.created_user = this.acSessionInfoResult[0].created_user;
      ormSave.client_date_created = this.acSessionInfoResult[0].client_date_created;
      ormSave.client_date_modified =this.acSessionInfoResult[0].client_date_modified;
      ormSave.modified_user = this.acSessionInfoResult[0].modified_user;
    }else{
      ormSave.created_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    }
    this.encounterService.saveSessionInfo(ormSave)
    .subscribe(
      data => {
        this.addEditView = false;
        this.getSessionInfo(this.objencounterToOpen.chart_id);
      },
      error => {
        this.showError("An error occured while saving Chart session information.");
      }
    );
  }
   getSessionInfo(chartID) {
     this.encounterService.getSessionInformation(chartID, this.objencounterToOpen.patient_id)
       .subscribe(
         data => {
           this.acSessionInfoResult = null;
           this.acSessionInfoResult = data;
           if (this.acSessionInfoResult.length > 0)
             this.assignValues();

             if (this.acSessionInfoResult.length ==0) 
             {
               this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
             }
             else
             {
               this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
             }
         },
         error => alert(error),
         () => this.logMessage.log("get Session Information Successfull.")
       );
   }
  
   assignValues() {
     debugger;
    if (this.acSessionInfoResult != null || this.acSessionInfoResult != "") {
      //this.dateTimeIN = this.dateTimeUtil.getDateModelFromDateString(this.acSessionInfoResult[0].time_in, DateTimeFormat.DATEFORMAT_hh_mm_a);
      this.dateTimeOUT = this.dateTimeUtil.getTimeModelFromTimeString(this.acSessionInfoResult[0].time_out, DateTimeFormat.DATEFORMAT_hh_mm_a);
      this.dateTimeIN = this.dateTimeUtil.getTimeModelFromTimeString(this.acSessionInfoResult[0].time_in, DateTimeFormat.DATEFORMAT_hh_mm_a);

      (this.sessionInfoForm.get("timein") as FormControl).setValue(this.dateTimeIN);
      (this.sessionInfoForm.get("timeout") as FormControl).setValue(this.dateTimeOUT);
      (this.sessionInfoForm.get("txt_sessionNo") as FormControl).setValue(this.acSessionInfoResult[0].session_no);
      (this.sessionInfoForm.get("txt_notes") as FormControl).setValue(this.acSessionInfoResult[0].notes);      
      (this.sessionInfoForm.get("ddl_SHV") as FormControl).setValue(this.acSessionInfoResult[0].ddl_shv);
      (this.sessionInfoForm.get("ddl_MSC") as FormControl).setValue(this.acSessionInfoResult[0].ddl_msc);

      if (this.acSessionInfoResult[0].individual == true) {
        (this.sessionInfoForm.get('chkbox_individual') as FormControl).setValue(true);
      }else{
        (this.sessionInfoForm.get('chkbox_individual') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].couple_family == true) {
        (this.sessionInfoForm.get('chkbox_couplefamily') as FormControl).setValue(true);
      }else{
        (this.sessionInfoForm.get('chkbox_couplefamily') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].initial_assessment == true) {
        (this.sessionInfoForm.get('chkbox_initialassessment') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_initialassessment') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].collateral_consult == true) {
        (this.sessionInfoForm.get('chkbox_collateralconsult') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_collateralconsult') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].significant_improv == true) {
        (this.sessionInfoForm.get('chkbox_signifimprov') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_signifimprov') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].suicide == true) {
        (this.sessionInfoForm.get('chkbox_suicide') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_suicide') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].homicide == true) {
        (this.sessionInfoForm.get('chkbox_homicide') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_homicide') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].violence == true) {
        (this.sessionInfoForm.get('chkbox_violence') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_violence') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].moderate_improv == true) {
        (this.sessionInfoForm.get('chkbox_moderateimprov') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_moderateimprov') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].mental_status == true) {
        (this.sessionInfoForm.get('chkbox_mentalstatusconcern') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_mentalstatusconcern') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].minimal_improv == true) {
        (this.sessionInfoForm.get('chkbox_minimalimpro') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_minimalimpro') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].no_change == true) {
        (this.sessionInfoForm.get('chkbox_nochange') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_nochange') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].deteriorated == true) {
        (this.sessionInfoForm.get('chkbox_deteriorated') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_deteriorated') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].changeinmedno == true) {
        (this.sessionInfoForm.get('change_medication_no') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('change_medication_no') as FormControl).setValue(false);
      }

      if (this.acSessionInfoResult[0].changeinmedyes == true) {
        (this.sessionInfoForm.get('change_medication_yes') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('change_medication_yes') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].treatmentplanunchanged == true) {
        (this.sessionInfoForm.get('treatmentplan_unchange') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('treatmentplan_unchange') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].treatmentplanmodified == true) {
        (this.sessionInfoForm.get('treatmentplan_modified') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('treatmentplan_modified') as FormControl).setValue(false);
      }
      if (this.acSessionInfoResult[0].grouptype == true) {
        (this.sessionInfoForm.get('chkbox_group') as FormControl).setValue(true);
      }
      else{
        (this.sessionInfoForm.get('chkbox_group') as FormControl).setValue(false);
      }
    }
   }
  showError(errMsg) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Error";
    modalRef.componentInstance.promptMessage = errMsg;
    modalRef.componentInstance.alertType = "error";
    let closeResult;
    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
    return;
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showHistory() {
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "session_info";
    logParameters.logDisplayName = "Session Info";
    logParameters.logMainTitle = "Session Info";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
   
    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;


    // const modalRef = this.modalService.open(ChartModuleHistoryComponent, this.logoutScreenOptions);
    // this.obj_SessionInfoHistory = new chartmodulehistory();
    // this.obj_SessionInfoHistory.titleString = "Session Information";
    // this.obj_SessionInfoHistory.moduleName = "chart_sessioninfo";
    // this.obj_SessionInfoHistory.criteria = " and cs.chart_id= '" + this.objencounterToOpen.chart_id + "' ";
    // modalRef.componentInstance.data = this.obj_SessionInfoHistory;
    // let closeResult;
    // modalRef.result.then((result) => {
    //   if (result == true) {
    //   }
    // }
    //   , (reason) => {
    //   });
   }
}