import { Component, OnInit, Inject, Input, EventEmitter, Output } from '@angular/core';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LogMessage } from '../../../shared/log-message';
import { ORMChartAnnotation } from '../../../models/encounter/orm-chart-annotation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ConfirmationPopupComponent } from './../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from './../../../models/general/orm-delete-record';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { GeneralOperation } from './../../../shared/generalOperation';
import { ORMPhysiciansCare } from './../../../models/encounter/orm-physicians-care';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { TemplateMainComponent } from '../chart-template/template-main/template-main.component';

@Component({
  selector: 'physicians-care',
  templateUrl: './physicians-care.component.html',
  styleUrls: ['./physicians-care.component.css']
})
export class PhysiciansCareComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen:EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  private obj_orm_physicians_care: ORMPhysiciansCare;
  addEditView: boolean = false;
  editoperation="New";
  isLoading=false;
  noRecordFound=false;
  hideFields: boolean = false;
  
  phy_care_id = '';
  
  canView=false;
  canAddEdit=false;


  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    private clockService: DateTimeUtil,
    private logMessage: LogMessage) {
      this.canView = this.lookupList.UserRights.extender_notes_view;
      this.canAddEdit = this.lookupList.UserRights.extender_notes_edit;
    }
  physiciansCareForm: FormGroup;
  provcare = false;
  personalInfoHeight: number;
  listChartPhyCare;
  isEdit = false;
  editRow;

  ngOnInit(){
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      
    debugger;
    if(this.canView){
      this.isLoading=true;
      this.getPhyCare(this.lookupList.practiceInfo.practiceId, this.objencounterToOpen.patient_id, this.objencounterToOpen.chart_id);
    }
    this.buildForm();
  }
  buildForm() {
    this.physiciansCareForm = this.formBuilder.group({
      txt_provcare_dateStarted: this.formBuilder.control(null,Validators.required),
      txt_provcare_providerCare: this.formBuilder.control("",Validators.required),
      txt_provcare_Location: this.formBuilder.control(""),
      txt_provcare_typeofCare: this.formBuilder.control("")
    })
  }
  
  getPhyCare(practice_id, patient_id, chart_id) {
    this.encounterService.GetPhyCare(practice_id, patient_id, chart_id)
      .subscribe(
      data => {
        this.isLoading=false;
        this.listChartPhyCare = null;
        this.listChartPhyCare = data;
        debugger;
        if(this.listChartPhyCare.length==0 || this.listChartPhyCare == undefined )
        {
          this.noRecordFound=true;
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
        }
        else{
          this.noRecordFound=false;
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
        }
      },
      error => {
        alert(error)
        this.isLoading=false;
      },
      () => this.logMessage.log("get Extender notes Successfull.")
     
      );
  }
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
  };
  deleteselectedRecord(obj) {
    
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.logoutScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == "YES") {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.physicians_care_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.clockService.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
        this.encounterService.deletePhysCare(deleteRecordData)
          .subscribe(
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("delete Extender notes Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  onDeleteSuccessfully(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter Extender notes"
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
      this.getPhyCare(this.lookupList.practiceInfo.practiceId, this.objencounterToOpen.patient_id, this.objencounterToOpen.chart_id);
    }
    // if (result > 0) {
    //   var index = this.generalOperation.getElementIndex(this.listChartPhyCare, element);
    //   if (index > -1) {
    //     this.listChartPhyCare.splice(index, 1);
    //   }
    // }
  }
  editSelected(row) {
    this.editoperation = 'Edit';
    this.addEditView=true;
    this.editRow = row;
    this.populateData(row);
  }
  populateData(row) 
  {
      (this.physiciansCareForm.get('txt_provcare_providerCare') as FormControl).setValue(row.provider_name);
      //(this.physiciansCareForm.get('txt_provcare_Location') as FormControl).setValue(row.location);
      //(this.physiciansCareForm.get('txt_provcare_typeofCare') as FormControl).setValue(row.type_of_care);
      //(this.physiciansCareForm.get('txt_provcare_dateStarted') as FormControl).setValue(row.date_started);
      //(this.physiciansCareForm.get("txt_provcare_dateStarted") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(row.date_started, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
  }
  extNotesSelectionChanged(phyc) {
    this.phy_care_id = phyc.physicians_care_id;
  }
  saveEditPhyCare(event) {
    this.obj_orm_physicians_care = new ORMPhysiciansCare();
    if((this.physiciansCareForm.get('txt_provcare_providerCare') as FormControl).value == ""){
      //alert("Please enter Provider Name to save record.");
      alert("Please enter Extender notes to save record.");
      return;
    }
    //send empty 3 location, type_of_care, date_started
    this.obj_orm_physicians_care=new ORMPhysiciansCare;
    this.obj_orm_physicians_care.chart_id = this.objencounterToOpen.chart_id.toString() ;
    this.obj_orm_physicians_care.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.obj_orm_physicians_care.patient_id = this.objencounterToOpen.patient_id.toString();
    this.obj_orm_physicians_care.system_ip = this.lookupList.logedInUser.systemIp;
    this.obj_orm_physicians_care.location = "";//(this.physiciansCareForm.get('txt_provcare_Location') as FormControl).value;
    this.obj_orm_physicians_care.type_of_care = "";//(this.physiciansCareForm.get('txt_provcare_typeofCare') as FormControl).value;
    //this.obj_orm_physicians_care.date_started = (this.physiciansCareForm.get('txt_provcare_dateStarted') as FormControl).value;
    this.obj_orm_physicians_care.date_started = ""//this.dateTimeUtil.getStringDateFromDateModel((this.physiciansCareForm.get('txt_provcare_dateStarted') as FormControl).value);
    this.obj_orm_physicians_care.provider_name = (this.physiciansCareForm.get('txt_provcare_providerCare') as FormControl).value;//save notes
    this.obj_orm_physicians_care.modified_user = this.lookupList.logedInUser.user_name;
    this.obj_orm_physicians_care.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    if(this.editoperation == 'New')
    {
      this.obj_orm_physicians_care.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.obj_orm_physicians_care.created_user = this.lookupList.logedInUser.user_name;
    }
    else
    {
      this.obj_orm_physicians_care.physicians_care_id = this.editRow.physicians_care_id;
      this.obj_orm_physicians_care.created_user = this.editRow.created_user;
      this.obj_orm_physicians_care.client_date_created = this.editRow.client_date_created;
      this.obj_orm_physicians_care.date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    this.encounterService.saveEditPhyCare(this.obj_orm_physicians_care)
    .subscribe(
      data => this.savedSuccessfull(event, data),
      error => alert(error),
      () => this.logMessage.log("Save Extender notes.")//Patient Consultant
    );
  }
  savedSuccessfull(event, data) {
    this.getPhyCare(this.lookupList.practiceInfo.practiceId, this.objencounterToOpen.patient_id, this.objencounterToOpen.chart_id);
    //this.addEditView = false;
    this.onCancel();
  }
  onCancel(){
    this.addEditView = false;
    (this.physiciansCareForm.get('txt_provcare_providerCare') as FormControl).setValue('');
  }
  onAddNew(){
    this.addEditView = true;
    this.editoperation='New';
    (this.physiciansCareForm.get('txt_provcare_providerCare') as FormControl).setValue('');
  }
  geExtNotesHist(){
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "extender_notes_log";
    logParameters.logDisplayName = "Extender Notes Log";
    logParameters.logMainTitle = "Extender Notes Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
    
    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  refreshExtNotes(){
    this.isLoading=true;
    this.getPhyCare(this.lookupList.practiceInfo.practiceId, this.objencounterToOpen.patient_id, this.objencounterToOpen.chart_id);    
  }
  onTemplateClick(){
    const modalRef = this.modalService.open(TemplateMainComponent, { size: 'lg', windowClass: 'modal-adaptive',backdrop: 'static' });
    modalRef.componentInstance.objencounterToOpen = this.objencounterToOpen;
    modalRef.componentInstance.module_txt=(this.physiciansCareForm.get('txt_provcare_providerCare') as FormControl).value;
    modalRef.componentInstance.callingFrom='extender';

    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        debugger;
        (this.physiciansCareForm.get('txt_provcare_providerCare') as FormControl).setValue(result);
      }
    }
      , (reason) => {
      });
  }
}
