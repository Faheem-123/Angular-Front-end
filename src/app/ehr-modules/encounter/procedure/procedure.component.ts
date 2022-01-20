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
import { ClaimSuperBillComponent } from 'src/app/billing-modules/claim/claim-super-bill/claim-super-bill.component';

@Component({
  selector: 'procedure',
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.css']
})
export class ProcedureComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen:EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  addEditView: boolean = false;
  lstSurgeryView;
  lstProcedureAdd;
  InputForm: FormGroup;
  isLoading=false;
  noRecordFound: boolean = false;
  editOperation:string='';
  operationType='';
  Code;
  Description;
  showDiagSearch: boolean = false;
  dataOption = "mylist";
  objsurgeryDetail;
  procSearchCriteria: ProcedureSearchCriteria;
  codeType = "CPT";
  canView: boolean = false;
  canAddEdit: boolean = false;
  controlUniqueId:any="";

  constructor(private encounterService:EncounterService,
    private logMessage:LogMessage,   @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,private dateTimeUtil: DateTimeUtil,private modalService: NgbModal) {
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
    //this.buildForm();
  }
  getViewData() {
    this.isLoading = true;
    this.noRecordFound = false;
    
    this.encounterService.getChartProcedureView(this.objencounterToOpen.chart_id.toString())
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
          this.logMessage.log("An Error Occured while getting Procedure list.")
          this.isLoading = false;
        }
      );
  }
  showSuperBill=false;
  onAdd()
  {
    this.lstProcedureAdd=new Array();
    this.showSuperBill=true;
    
    // const modalRef = this.modalService.open(ClaimSuperBillComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    // modalRef.componentInstance.claimDiagCount=0; 
    // modalRef.componentInstance.dos=this.objencounterToOpen.visit_date;
    // modalRef.componentInstance.callingFrom='encounter';
    // modalRef.result.then((result) => {
    //   debugger;
    //   if (result!=null)
    //   {
    //     this.onImportIcdCptCallBack(result);
    //     this.addEditView=true;
    //     this.buildForm();
    //   }
    // }, 
    // (reason) => {
    //         //alert(reason);
    //     }); 
  }

  addProcedure(proc: any) {
    this.lstProcedureAdd.push({
      chart_procedures_id: null,
      chart_id: this.objencounterToOpen.chart_id,
      patient_id:this.objencounterToOpen.patient_id,
      procedure_code: proc.code,
      description: proc.description,
      procedure_date:this.dateTimeUtil.getCurrentDateTimeString(),
      practice_id:this.lookupList.practiceInfo.practiceId,
      system_ip:this.lookupList.logedInUser.systemIp,
      deleted:0,
      created_user:this.lookupList.logedInUser.user_name,
      client_date_created:this.dateTimeUtil.getCurrentDateTimeString(),
      modified_user:this.lookupList.logedInUser.user_name,
      client_date_modified:this.dateTimeUtil.getCurrentDateTimeString(),
      date_created:'',
      date_modified:'',
      comments:'',
      education_provided:false,
      code_type:'CPT',
      entry_type:'CHART_PROCEDURE'
    });
  }
  onImportIcdCptCallBack(lstSelectedCodes: any) {
    debugger;
    this.showSuperBill = false;
    this.addEditView=true;
    this.buildForm();
    if (lstSelectedCodes != undefined) {
      let procImpLst = lstSelectedCodes.procedures_list;
      if (procImpLst != undefined) {
        procImpLst.forEach(element => {
          if (!this.checkIfProcAlreadyExist(element.code)) {
            this.addProcedure(element);
          }
        });
      }
    }
  }
  checkIfProcAlreadyExist(procCode: string): boolean {

    let exist: boolean = false;

    // if (this.lstClaimProcedures != undefined) {
    //   this.lstClaimProcedures.forEach(element => {
    //     if (element.proc_code == procCode) {
    //       exist = true;
    //     }

    //   });
    // }

    return exist;

  }
  
  onCancel(){
    this.addEditView=false;
    this.editOperation='';
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
  
  onProblemSearcInputChange(newValue) {
    this.logMessage.log("onProblemSearcInputChange");
    if (newValue !== this.Description) {
      this.Code = undefined;
      this.InputForm.get("txtIcdCode").setValue(null);
    }
  }
  onProblemSearcBlur() {
    if (this.Code == undefined && this.showDiagSearch == false) {
      this.Code = undefined;
      this.Description = undefined;
      //this.InputForm.get("txtIcdCode").setValue(null);
      //this.InputForm.get("txtProblemSearch").setValue(null);
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
    this.showDiagSearch=true; 
  }
  onProblemSearchKeydown(event) {
    debugger;
    if (event.key === "Enter" && this.InputForm.get("txtProblemSearch").value.length>2) 
    {
      this.sentCriteriatoSearch(this.InputForm.get("txtProblemSearch").value);
    }
    else {
      this.showDiagSearch = false;
    }
  }
  
  onDiagnosisSelect(diag) {
    this.lstProcedureAdd.push({
      chart_procedures_id: null,
      chart_id: this.objencounterToOpen.chart_id,
      patient_id:this.objencounterToOpen.patient_id,
      procedure_code: diag.code,
      description: diag.description,
      procedure_date:this.dateTimeUtil.getCurrentDateTimeString(),
      practice_id:this.lookupList.practiceInfo.practiceId,
      system_ip:this.lookupList.logedInUser.systemIp,
      deleted:0,
      created_user:this.lookupList.logedInUser.user_name,
      client_date_created:this.dateTimeUtil.getCurrentDateTimeString(),
      modified_user:this.lookupList.logedInUser.user_name,
      client_date_modified:this.dateTimeUtil.getCurrentDateTimeString(),
      date_created:'',
      date_modified:'',
      comments:'',
      education_provided:false,
      code_type:'CPT',
      entry_type:'CHART_PROCEDURE'
    });


    this.showDiagSearch = false;
  }

  closeDiagSearch() {
    this.showDiagSearch = false;
    this.onProblemSearcBlur();
  }
  onRadioOptionChange(event) {
    debugger;
    this.dataOption = event;
    this.showDiagSearch = false;
    if(this.InputForm.get("txtProblemSearch").value !=null && this.InputForm.get("txtProblemSearch").value.length>2)
    {
      this.sentCriteriatoSearch(this.InputForm.get("txtProblemSearch").value);
    }
  }
  onSaveSurgery(){
    debugger;
    let lstSave: Array<ORMSaveSurgery>=new Array;
    for(let i=0;i<this.lstProcedureAdd.length;i++)
    {
      lstSave.push(this.lstProcedureAdd[i]);
    }     

    this.encounterService.saveChartProcedure(lstSave).subscribe(
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
        this.showError("An error occured while saving Chart Procedure.");
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
    logParameters.logDisplayName = "Procedures Log";
    logParameters.logMainTitle = "Procedures Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
        
    logParameters.lstOtherCriteria = lstOtherCriteria
    
    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }
  txtinstructionFocusOut(value,index)
  {
    this.lstProcedureAdd[index].comments=value;
  }
  buildForm(){
    this.InputForm = this.formBuilder.group({
      txtProblemSearch: this.formBuilder.control("", Validators.required),
      rbCondition:this.formBuilder.control("mylist"),
    })
  }
  
  onImportIcdCdptCancelCallBack() {
    this.showSuperBill = false;
  }
}