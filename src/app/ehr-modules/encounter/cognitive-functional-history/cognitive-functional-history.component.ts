import { Component, OnInit, Inject, Input, Output,EventEmitter } from '@angular/core';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LogMessage } from '../../../shared/log-message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ConfirmationPopupComponent } from './../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from './../../../models/general/orm-delete-record';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { GeneralOperation } from './../../../shared/generalOperation';
import { ORMCognitiveFunctional } from './../../../models/encounter/orm-cognitive-functional';
import { ChartModuleHistoryComponent } from './../../../general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from './../../../models/encounter/chartmodulehistory';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { debug } from 'util';
import { LogParameters } from '../../log/log-parameters';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';


@Component({
  selector: 'cognitive-functional-history',
  templateUrl: './cognitive-functional-history.component.html',
  styleUrls: ['./cognitive-functional-history.component.css']
})
export class CognitiveFunctionalHistoryComponent implements OnInit {
  @Input() moduleName:string;
  private obj_charthistory: chartmodulehistory;
  @Input() objencounterToOpen:EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  editOperation='';
  noRecordFound;  
  isLoading=false;
  cfh = false;
  personalInfoHeight: number;
  cfunchistoryForm: FormGroup;
  listCogValues;
  listCogFunctHistory;
  selectedRow;
  isEdit = false;
  canView: boolean = false;
  canAddEdit: boolean = false;
  private obj_ORMCognitive_Functional: ORMCognitiveFunctional;

  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    private clockService: DateTimeUtil,
    private logMessage: LogMessage) {
      
      this.canView=this.lookupList.UserRights.ViewCognitive;
      this.canAddEdit=this.lookupList.UserRights.AddModifyCognitive;  
  }    

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;

    this.buildForm();
    if(this.canView)
    {
      //this.lblmsg = "Loading Please Wait . . .";
      this.getChartCognitiveFunctional();
      this.getCognitiveValues();
    }
    //else
    //{
    //  this.deniedView = true;
    //  this.lblmsg = "Access Denied.";
    //}
    //if(this.lookupList.UserRights.AddModifyCognitive == true)
    //{
     // this.deniedAddEdit = true;
    //}
    //else
    //{
     // this.deniedAddEdit = false;
    //}
  }
  buildForm() {
    this.cfunchistoryForm = this.formBuilder.group({
      historytype: this.formBuilder.control("",Validators.required),
      txt_cfhdate: this.formBuilder.control("",Validators.required),
      cfhvalue: this.formBuilder.control("",Validators.required),
      cfhstatus: this.formBuilder.control("",Validators.required),
      cfhnotes: this.formBuilder.control("",Validators.required)
    })
  }
     
  getCognitiveValues() {
    
    this.encounterService.getCognitiveValues(this.objencounterToOpen.chart_id.toString())
      .subscribe(
      data => {
        
        this.listCogValues = data;
      },
      error => alert(error),
      () => this.logMessage.log("get ddl values Successfull.")
      );
  }
  getChartCognitiveFunctional() {
    
    this.encounterService.getChartCognitiveFunctional(this.objencounterToOpen.chart_id.toString())
      .subscribe(
      data => {
        if (data.toString().length > 0) {
          this.noRecordFound=false;
          this.listCogFunctHistory = data;
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName,"1"));
        }else{
          this.noRecordFound=true;
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName,"0"));
        }
      },
      error => alert(error),
      () => this.logMessage.log("get Cognitive/Func Hx Successfull.")
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
        deleteRecordData.column_id = obj.cognitive_functional_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.clockService.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
        this.encounterService.deleteCognitivefunct(deleteRecordData)
          .subscribe(
          data => this.onDeleteSuccessfully(data, obj),
          error => alert(error),
          () => this.logMessage.log("delete cognitive Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(result, element) {
    if (result > 0) {
      var index = this.generalOperation.getElementIndex(this.listCogFunctHistory, element);
      if (index > -1) 
      {
        this.listCogFunctHistory.splice(index, 1);
      }
      if(this.listCogFunctHistory.length==0)
        this.noRecordFound=true;
    }
  }
  editSelectedRecord(row) {
    debugger;
    this.addEditView = true;
    this.selectedRow = row;    
    this.populateData(row);
    this.editOperation='Edit'
  }
  populateData(row) {
    debugger;
      let value = this.selectedRow.snomed_description + '(' + this.selectedRow.snomed_code + ')';
      (this.cfunchistoryForm.get('historytype') as FormControl).setValue(this.selectedRow.type);
      (this.cfunchistoryForm.get("txt_cfhdate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.selectedRow.effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));

      (this.cfunchistoryForm.get('cfhvalue') as FormControl).setValue(this.selectedRow.snomed_code);
      (this.cfunchistoryForm.get('cfhstatus') as FormControl).setValue(this.selectedRow.status);
      (this.cfunchistoryForm.get('cfhnotes') as FormControl).setValue(this.selectedRow.notes);

  }

  onSave() {
    //if (this.validate()) 
    {
      debugger;
      
      this.obj_ORMCognitive_Functional = new ORMCognitiveFunctional();

      this.obj_ORMCognitive_Functional.type = (this.cfunchistoryForm.get('historytype') as FormControl).value;
      this.obj_ORMCognitive_Functional.effective_date = this.dateTimeUtil.getStringDateFromDateModel((this.cfunchistoryForm.get('txt_cfhdate') as FormControl).value);
      
      this.obj_ORMCognitive_Functional.status = (this.cfunchistoryForm.get('cfhstatus') as FormControl).value;
      this.obj_ORMCognitive_Functional.notes = (this.cfunchistoryForm.get('cfhnotes') as FormControl).value;
      
      this.obj_ORMCognitive_Functional.snomed_code = (this.cfunchistoryForm.get('cfhvalue') as FormControl).value;
      this.obj_ORMCognitive_Functional.snomed_description=new ListFilterPipe().transform(this.listCogValues, "col1", (this.cfunchistoryForm.get('cfhvalue') as FormControl).value)[0].col2;

      this.obj_ORMCognitive_Functional.system_ip = this.lookupList.logedInUser.systemIp;
      this.obj_ORMCognitive_Functional.patient_id = this.objencounterToOpen.patient_id.toString();
      this.obj_ORMCognitive_Functional.chart_id = this.objencounterToOpen.chart_id.toString();
      this.obj_ORMCognitive_Functional.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      this.obj_ORMCognitive_Functional.modified_user = this.lookupList.logedInUser.user_name;
      this.obj_ORMCognitive_Functional.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

      if (this.editOperation == 'New') {
        this.obj_ORMCognitive_Functional.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        this.obj_ORMCognitive_Functional.created_user = this.lookupList.logedInUser.user_name;
      }
      else {
        this.obj_ORMCognitive_Functional.cognitive_functional_id = this.selectedRow.cognitive_functional_id;
        this.obj_ORMCognitive_Functional.date_created = this.selectedRow.date_created;
        this.obj_ORMCognitive_Functional.created_user = this.selectedRow.created_user;
        this.obj_ORMCognitive_Functional.client_date_created = this.selectedRow.client_date_created;
      }

    }
    
    this.encounterService.CognitiveAddUpdate(this.obj_ORMCognitive_Functional)
      .subscribe(
      data => {
        this.addEditView=false;
        this.getChartCognitiveFunctional();
      },
      error => alert(error),
      () => this.logMessage.log("Save Patient Congnative .")
      );
  }
  onCancel() {
  this.addEditView=false;
  this.editOperation='';
  }
  onNew(){
    this.addEditView=true;
    this. editOperation='New';

    (this.cfunchistoryForm.get('historytype') as FormControl).setValue(null);
    (this.cfunchistoryForm.get("txt_cfhdate") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
    (this.cfunchistoryForm.get('cfhvalue') as FormControl).setValue(null);
    (this.cfunchistoryForm.get('cfhstatus') as FormControl).setValue(null);
    (this.cfunchistoryForm.get('cfhnotes') as FormControl).setValue(null);

  }
  validate(): Boolean {
    let datevalue = (this.cfunchistoryForm.get('txt_cfhdate') as FormControl).value;
    if (!datevalue) {
      alert("Please select a valid Date.");
      return false;
    }
    else if (!(this.cfunchistoryForm.get('historytype') as FormControl).value) {
      alert("Please select a Type.");
      return false;
    }
    else if (!(this.cfunchistoryForm.get('cfhvalue') as FormControl).value) {
      alert("Please select a Value.");
      return false;
    }
    return true;
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  getCongFunctionalHistory() {
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "chart_cognitive_functional_log";
    logParameters.logDisplayName = "Cognitive/Functional History";
    logParameters.logMainTitle = "Cognitive/Functional History";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
    
    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }
  // {
  //   const modalRef = this.modalService.open(ChartModuleHistoryComponent, this.logoutScreenOptions);

  //   this.obj_charthistory = new chartmodulehistory();

  //   this.obj_charthistory.titleString = "Cognitive/Functional History";
  //   this.obj_charthistory.moduleName = "chart_cognitive_functional_log";
  //   this.obj_charthistory.criteria = " and ccf.chart_id= " + this.objencounterToOpen.chart_id;
  //   //this.obj_charthistory.parameter = " and ccf.chart_id = " + this.objencounterToOpen.chart_id;
  //   modalRef.componentInstance.data = this.obj_charthistory;
  //   let closeResult;

  //   modalRef.result.then((result) => {
  //     if (result == true) {
  //       //this.getAllUsers((this.userForm.get('ctrlStatus') as FormControl).value);
  //     }
  //   }
  //     , (reason) => {
  //       //alert(reason);
  //     });
  // }
}
