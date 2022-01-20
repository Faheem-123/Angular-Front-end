import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ProcedureSearchCriteria } from 'src/app/general-modules/inline-procedure-search/proc-search-criteria';
import { ProcedureSearchType, ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { ORMSaveSurgery } from 'src/app/models/encounter/ORMSaveSurgery';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { LogParameters } from '../../log/log-parameters';

@Component({
  selector: 'surgery',
  templateUrl: './surgery.component.html',
  styleUrls: ['./surgery.component.css']
})
export class SurgeryComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen:EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  lstSurgeryView;
  InputForm: FormGroup;
  isLoading=false;
  noRecordFound: boolean = false;
  editOperation:string='';
  operationType='';
  Code;
  Description;
  showProcSearch: boolean = false;
  dataOption = "mylist";
  objsurgeryDetail;
  procSearchCriteria: ProcedureSearchCriteria;
  codeType = "CPT";
  canView: boolean = false;
  canAddEdit: boolean = false;

  constructor(private encounterService:EncounterService,
    private logMessage:LogMessage,   @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,private dateTimeUtil: DateTimeUtil,private modalService: NgbModal) {
debugger;
      this.canView = this.lookupList.UserRights.ViewSurgeries;
      this.canAddEdit = this.lookupList.UserRights.AddModifySurgeries;
     }

  ngOnInit() 
  {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      
    if(this.lookupList.UserRights.ViewSurgeries)
    {
      this. getViewData();
    }
    this.buildForm();
  }
  buildForm(){
    this.InputForm = this.formBuilder.group({
      
      txtProcedureSearch: this.formBuilder.control("", Validators.required),
      txtIcdCode: this.formBuilder.control("", Validators.required),
      txtIcdDescription: this.formBuilder.control("", Validators.required),
      //dpProblemDate: this.formBuilder.control(null, Validators.required),
      rbCondition:this.formBuilder.control("mylist"),
      rbCodeType:this.formBuilder.control("CPT"),
      txtComments: this.formBuilder.control(""),
      txtDate: this.formBuilder.control(null, Validators.required)
    })
  }
  getViewData() {
    this.isLoading = true;
    this.noRecordFound = false;
    
    this.encounterService.getChartSurgeryView(this.objencounterToOpen.chart_id.toString())
      .subscribe(
        data => {
          this.lstSurgeryView = data;
          if (this.lstSurgeryView == undefined || this.lstSurgeryView.length == 0) {
            this.noRecordFound = true;
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
          this.logMessage.log("An Error Occured while getting Surgeries list.")
          this.isLoading = false;
        }
      );
  }
  getSurgeryDetail(id) {
    this.isLoading = true;
    this.noRecordFound = false;
    
    this.encounterService.getChartSurgeryDetail(id)
      .subscribe(
        data => {
          this.objsurgeryDetail = data;
          this.assignValues();
          this.isLoading = false;
        },
        error => {
          this.logMessage.log("An Error Occured while getting Surgeries Detail.")
          this.isLoading = false;
        }
      );
  }

  OnAddNew(type){
    this.addEditView=true;
    this.operationType=type;
    this.editOperation='New';
    (this.InputForm.get("txtIcdCode") as FormControl).setValue(null);
    (this.InputForm.get("txtIcdDescription") as FormControl).setValue(null);
    (this.InputForm.get("txtComments") as FormControl).setValue(null);
    (this.InputForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
    (this.InputForm.get("txtProcedureSearch") as FormControl).setValue(null);
  }
  onCancel(){
    this.addEditView=false;
    this.editOperation='';
  }
  onEdit(sur){
    this.addEditView=true;
    this.editOperation='Edit';
    this.operationType=sur.entry_type;
    this.getSurgeryDetail(sur.chart_procedures_id);
  }
  assignValues(){
    (this.InputForm.get("txtIcdCode") as FormControl).setValue(this.objsurgeryDetail.procedure_code);
    (this.InputForm.get("txtIcdDescription") as FormControl).setValue(this.objsurgeryDetail.description);
    (this.InputForm.get("txtComments") as FormControl).setValue(this.objsurgeryDetail.comments);
    (this.InputForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.objsurgeryDetail.procedure_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.InputForm.get("txtProcedureSearch") as FormControl).setValue(null);
  }
 
  onDelete(record){
   
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = record.chart_procedures_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteSurgery(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Surgery Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter Assessment"
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
      this.getViewData();
     
    }
  }
  
  onProcedureSearcInputChange(newValue) {

    debugger;
    this.logMessage.log("onProcedureSearcInputChange");
    if (newValue !== this.Description) {
      this.Code = undefined;
      this.InputForm.get("txtIcdCode").setValue(null);
    }
  }
  onProcedureSearcBlur() {
    if (this.Code == undefined && this.showProcSearch == false) {
      this.Code = undefined;
      this.Description = undefined;
      this.InputForm.get("txtIcdCode").setValue(null);
      this.InputForm.get("txtProcedureSearch").setValue(null);
    }

  }

  sentCriteriatoSearch(value)
  {
    debugger;
    this.procSearchCriteria = new ProcedureSearchCriteria();

    if(this.InputForm.get("rbCondition").value=="mylist")
    {
      this.procSearchCriteria.providerId =Number(this.objencounterToOpen.provider_id);
    }
    else
    {
      this.procSearchCriteria.providerId = undefined;
    }
    this.procSearchCriteria.criteria = value;  
    this.procSearchCriteria.dos=this.objencounterToOpen.visit_date;
    if(this.codeType=="CPT")
      this.procSearchCriteria.searchType=ProcedureSearchType.ALL;
    if(this.codeType=="SnomedCT")
      this.procSearchCriteria.searchType=ProcedureSearchType.SNOMED_CT;
    this.showProcSearch=true; 
  }
  onProcedureSearchKeydown(event) {
    
    
    if (event.currentTarget.value.length > 2) {
      debugger;
      this.sentCriteriatoSearch(event.currentTarget.value);
     
    }
   
  }
  
  onProcedureSelect(diag) {
    this.logMessage.log(diag);

    this.Code = diag.code;
    this.Description = diag.description;

    (this.InputForm.get("txtIcdCode") as FormControl).setValue(this.Code);
    (this.InputForm.get("txtIcdDescription") as FormControl).setValue(this.Description);

    this.showProcSearch = false;
  }

  closeDiagSearch() {
    this.showProcSearch = false;
    this.onProcedureSearcBlur();
  }
  onRadioOptionChange(event) {
    debugger;
    this.dataOption = event;
    this.showProcSearch = false;
    if(this.InputForm.get("txtProcedureSearch").value !=null && this.InputForm.get("txtProcedureSearch").value.length>2)
    {
      this.sentCriteriatoSearch(this.InputForm.get("txtProcedureSearch").value);
    }
  }
  onSaveSurgery(formValue){
    debugger;
    let ormSave: ORMSaveSurgery = new ORMSaveSurgery();
    if (this.editOperation == "New") 
    {
      ormSave.created_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
    }
    else
    {
      ormSave.chart_procedures_id=this.objsurgeryDetail.chart_procedures_id;
       ormSave.client_date_created = this.objsurgeryDetail.client_date_created;
       ormSave.date_created = this.objsurgeryDetail.date_created;
       ormSave.created_user = this.objsurgeryDetail.created_user;
    }
    ormSave.modified_user=this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
    ormSave.patient_id=this.objencounterToOpen.patient_id.toString();
    ormSave.chart_id=this.objencounterToOpen.chart_id.toString();
    ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();

    ormSave.procedure_code=formValue.txtIcdCode;
    ormSave.description=formValue.txtIcdDescription;
    ormSave.procedure_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtDate);
    ormSave.comments=formValue.txtComments;
    ormSave.system_ip=this.lookupList.logedInUser.systemIp;
    ormSave.entry_type=this.operationType;
    ormSave.code_type=this.codeType;

    this.encounterService.saveChartSurgery(ormSave).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.addEditView = false;
          this.getViewData();
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {

          this.showError(data['response']);
        }
      },
      error => {
        this.showError("An error occured while saving Chart Surgery.");
      }
    );
  }
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
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  onCodeTypeChange(event) {
    this.codeType = event;
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showLogHistory(){
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "past_surgery_log";
    logParameters.logDisplayName = "Surgeries/Procedures Log";
    logParameters.logMainTitle = "Surgeries/Procedures Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
        
    logParameters.lstOtherCriteria = lstOtherCriteria
    
    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }
}