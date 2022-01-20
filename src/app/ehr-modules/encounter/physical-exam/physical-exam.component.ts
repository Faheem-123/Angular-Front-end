import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ORMSavePatientPhysicalExam } from 'src/app/models/encounter/ORMSavePatientPhysicalExam';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { LastNoteComponent } from '../last-note/last-note.component';
import { TemplateMainComponent } from '../chart-template/template-main/template-main.component';

@Component({
  selector: 'physical-exam',
  templateUrl: './physical-exam.component.html',
  styleUrls: ['./physical-exam.component.css']
})
export class PhysicalExamComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  isLoading=false;
  noRecordFound=true;
  editOperation='';
  objExamDetail;
  inputForm:FormGroup;
  lstExamView;
  canView: boolean = false;
  canAddEdit: boolean = false;
  lastModifiedMsg = "";
  isEditable=true;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private logMessage: LogMessage,private dateTimeUtil: DateTimeUtil,
  private encounterService: EncounterService,private formBuilder: FormBuilder,
  private modalService: NgbModal) 
  { 
    this.canView=this.lookupList.UserRights.ViewPE;
    this.canAddEdit=this.lookupList.UserRights.AddModifyPE;

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
    this.encounterService.getPatPhysicalExamDetail(this.objencounterToOpen.chart_id.toString())
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
            (this.inputForm.get("txtComments") as FormControl).setValue(this.lstExamView.pe_detail);
            this.addEditView=true;
            this.isEditable=true;
            this.noRecordFound = false;
            //this.lastModifiedMsg = this.lstExamView.modified_user + " at " + this.lstExamView.date_modified;
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
          this.logMessage.log("An Error Occured while getting Physical Exam list.")
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
  onSavePhysicalExam(formValue){
    debugger;
    let ormSave: ORMSavePatientPhysicalExam = new ORMSavePatientPhysicalExam();
    if (this.editOperation == "new") 
    {
      ormSave.created_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
    }
    else
    {
      ormSave.patient_organ_id=this.lstExamView.patient_organ_id;
      ormSave.client_date_created = this.lstExamView.client_date_created;
      ormSave.date_created = this.lstExamView.date_created;
      ormSave.created_user = this.lstExamView.created_user;
    }
    ormSave.modified_user=this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
    ormSave.patient_id=this.objencounterToOpen.patient_id.toString();
    ormSave.chart_id=this.objencounterToOpen.chart_id.toString();
    ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();

    ormSave.pe_detail=formValue.txtComments;
    
    this.encounterService.savePatientPhysicalExam(ormSave).subscribe(
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
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showLogHistory() {
    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "physical_exam_log";
    logParameters.logDisplayName = "Physical Exam";
    logParameters.logMainTitle = "Physical Exam";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;

    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;

  }
  onTemplateClick(){
    debugger; 
    const modalRef = this.modalService.open(TemplateMainComponent, { size: 'lg', windowClass: 'modal-adaptive',backdrop: 'static' });
    modalRef.componentInstance.objencounterToOpen = this.objencounterToOpen;
    modalRef.componentInstance.module_txt=(this.inputForm.get('txtComments') as FormControl).value;
    
    modalRef.componentInstance.callingFrom='PE';
    
    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        debugger;
        (this.inputForm.get('txtComments') as FormControl).setValue(result);
        //@autoSave
        this.onSavePhysicalExam(this.inputForm.value);
      }
    }
      , (reason) => {
      });
  }
  onLastROSClick(){
    debugger; 
    const modalRef = this.modalService.open(LastNoteComponent, { size: 'lg', windowClass: 'modal-adaptive',backdrop: 'static' });
    modalRef.componentInstance.header = 'Previous Physical Exam';
    modalRef.componentInstance.callingFrom='PE';
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
  onCancelPhysicalExam(){
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
    (this.inputForm.get("txtComments") as FormControl).setValue(this.lstExamView.pe_detail);            
  }
}
