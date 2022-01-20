import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { DiagSearchCriteria } from 'src/app/general-modules/inline-diagnosis-search/diag-search-criteria';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { SearchService } from 'src/app/services/search.service';
import { ORMCarePlan } from 'src/app/models/encounter/ORMCarePlan';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';

@Component({
  selector: 'care-plan',
  templateUrl: './care-plan.component.html',
  styleUrls: ['./care-plan.component.css']
})
export class CarePlanComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen:EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  editOperation:string='';
  isLoading: boolean = false;
  addEditView: boolean = false;
  canView: boolean = false;
  canAddEdit: boolean = false;
  noRecordFound: boolean = false;
  showSearch=false;
  arrcarePlanView;
  arrSearchResult;
  arrType: Array<String> = ["","Assessment","Instruction","Referral","Observation","Encounter","Goal","HealthConcerns","Substance Administration","Procedure","Procedure Activity","Plan Of Care Activity","Plan of Treatment","Care Plan","Clinical Instructions","Patient Decision Aids","Preventative Health"];
  inputForm: FormGroup;
  selectedIndex=0;

  constructor(private formBuilder: FormBuilder,
    private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    private searchService:SearchService) { 
    
      this.canView=this.lookupList.UserRights.ViewCarePlan;
      this.canAddEdit=this.lookupList.UserRights.AddModifyCarePlan;  
  }
  getChartCarePlan() {
    this.encounterService.getChartCarePlan(this.objencounterToOpen.chart_id.toString())
      .subscribe(
        data => {
          this.arrcarePlanView = data;
          if (this.arrcarePlanView == undefined || this.arrcarePlanView.length == 0) {
            this.noRecordFound = true;
          }
          else
            this.noRecordFound = false;

          this.isLoading = false;;

          if (this.noRecordFound==true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else{
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
        },
        error => {
          this.isLoading = false;
        }
      );
  }
  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
    if (this.canView) {
      this.isLoading = true;
      this.getChartCarePlan();      
      this.buildForm()
    }
  }

  buildForm() {
    this.inputForm = this.formBuilder.group({
      drpType: this.formBuilder.control(null),
      txtSearch: this.formBuilder.control(null),
      dpDate: this.formBuilder.control(null, Validators.compose([        
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      rbCondition: this.formBuilder.control("icd"),
      txtComments: this.formBuilder.control(null)
    }
    )
  }
  
  onProblemSearchKeydown(event) {

    if (event.key === "Enter") {
      this.arrSearchResult=null;
      let searchType='';
    switch(this.inputForm.get("rbCondition").value)
    {
      case "icd":
        searchType='ICD-10';
        break;
      case "cpt":
      searchType='CPT';
        break;  
      case "snomed":
      searchType='SnomedCT';
        break;
      case "medicine":
      searchType='Medicine';
        break;  
      case "loinc":
      searchType='Loinc';
        break;   
    }
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "type", value: searchType, option: "" },
      { name: "criteria", value: this.inputForm.get("txtSearch").value, option: "" },
      { name: "criteria2", value: "", option: "" },
      { name: "chart_id", value: this.objencounterToOpen.chart_id, option: "" },
    ];
    debugger;   
    this.searchService.searchCarePlan(searchCriteria)
    .subscribe(
      data => {      
        debugger;   
        this.arrSearchResult = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.logMessage.log("An Error Occured while getting searchCarePlan.")
        this.isLoading = false;
      }
    );

    this.showSearch = true;
    }
    else {
      this.showSearch = false;
    }
  }
  
  onProblemSearcInputChange(newValue) {
    // this.logMessage.log("onProblemSearcInputChange");
    // if (newValue !== this.diagDescription) {
    //   this.diagCode = undefined;
    //   this.problemFormGroup.get("txtIcdCode").setValue(null);
    // }
  }
  onProblemSearcBlur() {

    // this.logMessage.log("onProblemSearcBlur");

    
    // if (this.diagCode == undefined && this.showDiagSearch == false) {
    //   this.diagCode = undefined;
    //   this.diagDescription = undefined;
    //   this.problemFormGroup.get("txtIcdCode").setValue(null);
    //   this.problemFormGroup.get("txtProblemSearch").setValue(null);
    // }

  }
  addNew(){
    this.addEditView=true;
    this.editOperation="new";
    this.buildForm();

    (this.inputForm.get("dpDate") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
  }
  onEdit(obj){
    this.addEditView=true;
    this.editOperation="edit";
    this.assignValues(obj);
  }
  assignValues(obj) {
    (this.inputForm.get("drpType") as FormControl).setValue(obj.plan_type);
    (this.inputForm.get("dpDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(obj.date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("txtComments") as FormControl).setValue(obj.instruction);
    (this.inputForm.get("txtSearch") as FormControl).setValue(obj.code+' ('+obj.description +')');


    this.selectedCode=obj.code;
    this.selectedDescription=obj.description;
  }
  onDelete(obj){
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.chart_careplanid;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteCarePlan(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Chart Care Plan"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
     this.getChartCarePlan();
    }
  }
  selectedCode:string="";
  selectedDescription:string="";

  onSelect(obj){
    this.showSearch=false;
    this.selectedCode = obj.name;
    this.selectedDescription=obj.address;
    this.inputForm.get("txtSearch").setValue(obj.name+' ('+obj.address +')');
  }
  onCancel(){
    this.addEditView=false;
    this.editOperation='';
  }
  objSave:ORMCarePlan;
  
  validate():boolean{
    if(this.inputForm.get("drpType").value=='' ||  this.inputForm.get("drpType").value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Care Plan','Please Select Type First.','warning');
      return false;
    }
     
     
    return true;
  }
  saveplan() {
    if(this.validate()==false)
      return;

    this.objSave = new ORMCarePlan;
    this.objSave.plan_type = this.inputForm.get("drpType").value; 
    this.objSave.code = this.selectedCode;
    this.objSave.description = this.selectedDescription;
    let searchType="";
    switch(this.inputForm.get("rbCondition").value)
    {
      case "icd":
        searchType='ICD-10';
        break;
      case "cpt":
      searchType='CPT';
        break;  
      case "snomed":
      searchType='SnomedCT';
        break;
      case "medicine":
      searchType='Medicine';
        break;  
      case "loinc":
      searchType='Loinc';
        break;   
    }
    this.objSave.code_type = searchType;
    this.objSave.date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("dpDate").value)
    this.objSave.instruction = this.inputForm.get("txtComments").value

    this.objSave.system_ip = this.lookupList.logedInUser.systemIp
    this.objSave.patient_id = this.objencounterToOpen.patient_id.toString();
    this.objSave.chart_id = this.objencounterToOpen.chart_id.toString();
    this.objSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

    this.objSave.modified_user = this.lookupList.logedInUser.user_name;
    this.objSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();;

    if (this.editOperation != "edit") {
      this.objSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();;
      this.objSave.created_user = this.lookupList.logedInUser.user_name;
    }
    else {
      this.objSave.chart_careplanid = this.arrcarePlanView[this.selectedIndex].chart_careplanid//dg_cog.selectedItem.chart_careplanid;
      this.objSave.date_created = this.arrcarePlanView[this.selectedIndex].date_created;
      this.objSave.created_user = this.arrcarePlanView[this.selectedIndex].created_user;
      this.objSave.client_date_created = this.arrcarePlanView[this.selectedIndex].client_date_created;
    }
    this.encounterService.saveCarePlan(this.objSave).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.getChartCarePlan() ;
          this.addEditView=false;
          this.editOperation='';
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {

          this.showError(data['response']);
        }
      },
      error => {
        this.showError("An error occured while saving Care Plan.");
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
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
    return;
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showLog(){
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));
    
    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "chart_care_plan_log";
    logParameters.logDisplayName = "Care Plan";
    logParameters.logMainTitle = "Care Plan";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;

    logParameters.lstOtherCriteria = lstOtherCriteria;
    
    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }
}
