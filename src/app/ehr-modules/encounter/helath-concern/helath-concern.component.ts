import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { DiagSearchCriteria } from 'src/app/general-modules/inline-diagnosis-search/diag-search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMSavehealthconcern } from 'src/app/models/encounter/ORMSavehealthconcern';
import { ORMSavehealthconcerndetail } from 'src/app/models/encounter/ORMSavehealthconcerndetail';
import { HealthConcernAddProblemComponent } from '../health-concern-add-problem/health-concern-add-problem.component';
import { HealthConcernSaveWrapper } from 'src/app/models/encounter/HealthConcernSaveWrapper';
import { ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';


@Component({
  selector: 'helath-concern',
  templateUrl: './helath-concern.component.html',
  styleUrls: ['./helath-concern.component.css']
})
export class HelathConcernComponent implements OnInit {

  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  isLoading: boolean = false;
  addEditView: boolean = false;
  codeType = 'ICD-10';

  canView: boolean = false;
  canAddEdit: boolean = false;
  noRecordFound = true;
  lastModifiedMsg: string;
  healthConcernForm: FormGroup;
  editOperation: string = "";
  showDiagSearch = false;
  objSaveHealthConcern: ORMSavehealthconcern;
  selectedConcern = 0;
  
  lstConcern: Array<any>;
  lstConcernDetail:Array<any>;
  lstConcernDetailAddEdit:Array<any>;

  constructor(private formBuilder: FormBuilder, private encounterService: EncounterService
    , @Inject(LOOKUP_LIST) public lookupList: LookupList, private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal) {

    this.canView = true;
    this.canAddEdit = true;
    this.noRecordFound = false;
  }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      
    this.buildForm();
    this.getChartHealthConcernView();
    this.getChartHealthConcernDetailView();
    this.lstConcernDetailAddEdit = new Array<any>();
  }

  getChartHealthConcernView() {
    this.encounterService.getChartHealthConcernView(this.objencounterToOpen.chart_id.toString())
      .subscribe(
        data => {
          debugger
          this.lstConcern = data as Array<any>;

          if (this.lstConcern == undefined || this.lstConcern.length == 0) {
            this.noRecordFound = true;
          }
          else
            this.noRecordFound = false;

          this.isLoading = false;

          if (this.noRecordFound == true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
        },
        error => {
          this.isLoading = false;
        }
      );
  }

  getChartHealthConcernDetailView() {
    this.encounterService.getChartHealthConcernViewDetail(this.objencounterToOpen.chart_id.toString())
      .subscribe(
        data => {
          debugger
          this.lstConcernDetail = data as Array<any>;
        },
        error => {
          this.isLoading = false;
        }
      );
  }
  buildForm() {
    this.healthConcernForm = this.formBuilder.group({
      codeType: this.formBuilder.control(this.codeType),
      txtIcdCode: this.formBuilder.control(null, Validators.required),
      txtProblemSearch: this.formBuilder.control(null, Validators.required),
      dfDate: this.formBuilder.control(null, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtComments: this.formBuilder.control(null, Validators.required),
    }
    )
  }

  onAdd() {
    this.addEditView = true;
    this.editOperation = 'new';
    
    this.lstConcernDetailAddEdit=new Array<any>();
    this.buildForm();
    
  }
  onEdit(obj) {
    this.addEditView = true;
    this.editOperation = 'edit';
    this.assignValues(obj);
  }

  cancelAddEdit() {
    this.addEditView = false;
    this.editOperation = '';
  }
  onCodeTypeChange(event) {
    this.codeType = event;
  }
  assignValues(obj) {
    //(this.healthConcernForm.get("ddStatus") as FormControl).setValue("CP"); 
    this.diagCode=obj.code;
    this.diagDescription=obj.description;

    (this.healthConcernForm.get("txtIcdCode") as FormControl).setValue(obj.code);
    (this.healthConcernForm.get("txtProblemSearch") as FormControl).setValue(obj.description);
    (this.healthConcernForm.get("dfDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(obj.health_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.healthConcernForm.get("txtComments") as FormControl).setValue(obj.observation);


    this.lstConcernDetailAddEdit=new Array<any>();
    for(let i=0;i<this.lstConcernDetail.length;i++)
      {
        let objP: any = {
          id:this.lstConcernDetail[i].id,
          problem_id: this.lstConcernDetail[i].problem_id,
          diag_description: this.lstConcernDetail[i].diag_description,
          diag_code: this.lstConcernDetail[i].diag_code,
        };
        this.lstConcernDetailAddEdit.push(objP);
      }
  }
  diagSearchCriteria: DiagSearchCriteria;
  onProblemSearchKeydown(event) {

    if (event.key === "Enter") {
      debugger;
      this.diagSearchCriteria = new DiagSearchCriteria();
      this.diagSearchCriteria.codeType = this.codeType;
      this.diagSearchCriteria.criteria = event.currentTarget.value;
      this.diagSearchCriteria.providerId = undefined;

      this.showDiagSearch = true;
    }
    else {
      //this.showDiagSearch = false;
    }
  }
  diagCode;
  diagDescription;
  onDiagnosisSelect(diag) {
    this.diagCode = diag.diag_code;
    this.diagDescription = diag.diag_description;
    (this.healthConcernForm.get("txtIcdCode") as FormControl).setValue(this.diagCode);
    (this.healthConcernForm.get("txtProblemSearch") as FormControl).setValue(this.diagDescription);

    this.showDiagSearch = false;
  }

   
  validate(): boolean {
    if (this.healthConcernForm.get("dfDate").value == '' || this.healthConcernForm.get("dfDate").value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Health Concern', 'Please Enter Date.', 'warning');
      return false;
    }
    return true;
  }
  onSave() {
    debugger;
    if (this.validate() == false)
      return false;
    this.objSaveHealthConcern = new ORMSavehealthconcern;

    this.objSaveHealthConcern.health_date = this.dateTimeUtil.getStringDateFromDateModel(this.healthConcernForm.get("dfDate").value);
    this.objSaveHealthConcern.observation = this.healthConcernForm.get("txtComments").value;
    this.objSaveHealthConcern.patient_id = this.objencounterToOpen.patient_id.toString();
    this.objSaveHealthConcern.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.objSaveHealthConcern.chart_id = this.objencounterToOpen.chart_id.toString();
    this.objSaveHealthConcern.deleted = false;
    this.objSaveHealthConcern.modified_user = this.lookupList.logedInUser.user_name;
    this.objSaveHealthConcern.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();;

    this.objSaveHealthConcern.system_ip = this.lookupList.logedInUser.systemIp;
    this.objSaveHealthConcern.code = this.diagCode;
    this.objSaveHealthConcern.description = this.diagDescription;
    this.objSaveHealthConcern.code_type = this.codeType;

    if (this.editOperation == "new") {
      this.objSaveHealthConcern.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.objSaveHealthConcern.created_user = this.lookupList.logedInUser.user_name;
    }
    else {
      this.objSaveHealthConcern.health_id = this.lstConcernDetailAddEdit[this.selectedConcern].health_id;
      // this.objSaveHealthConcern.date_created=dgHealthConcernDates.selectedItem.date_created;
      // this.objSaveHealthConcern.client_date_created=dgHealthConcernDates.selectedItem.client_date_created;
      // this.objSaveHealthConcern.created_user=dgHealthConcernDates.selectedItem.created_user;
    }
    
    let lstDetail = new Array<ORMSavehealthconcerndetail>();
    for(let i=0;i<this.lstConcernDetailAddEdit.length;i++)
    {
      let objSaveConcernDetail: ORMSavehealthconcerndetail = new ORMSavehealthconcerndetail;
      objSaveConcernDetail.id = "";
      objSaveConcernDetail.health_id = "";
      objSaveConcernDetail.concern = this.lstConcernDetailAddEdit[i].concern==undefined?'':this.lstConcernDetailAddEdit[i].concern;
      objSaveConcernDetail.deleted = false;
      objSaveConcernDetail.created_user =this.lookupList.logedInUser.user_name;
      objSaveConcernDetail.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      objSaveConcernDetail.modified_user = this.lookupList.logedInUser.user_name;
      objSaveConcernDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      objSaveConcernDetail.module_type = "problems";
      objSaveConcernDetail.module_id = this.lstConcernDetailAddEdit[i].problem_id;
      lstDetail.push(objSaveConcernDetail);
    }
    let saveObjectWrapper: HealthConcernSaveWrapper = new HealthConcernSaveWrapper();

    saveObjectWrapper.operation=this.editOperation;
    saveObjectWrapper.concern=this.objSaveHealthConcern;
    saveObjectWrapper.lst_detail=lstDetail;
    

    this.encounterService.SaveHealthConcern(saveObjectWrapper).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.addEditView = false;
          this.getChartHealthConcernView();
          this.getChartHealthConcernDetailView();
          //this.getViewData();
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {

          //this.showError(data['response']);
        }
      },
      error => {
        //this.showError("An error occured while saving Chart Assessments.");
      }
    );
  }

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
  };
  AddProblems() {
    const modalRef = this.modalService.open(HealthConcernAddProblemComponent, this.poupUpOptions);
    modalRef.componentInstance.chart_id = this.objencounterToOpen.chart_id;

    modalRef.result.then((result) => {
      debugger;
    if((result as Array<any>).length>0)
    {
      for(let i=0;i<result.length;i++)
      {
        let objP: any = {
          problem_id: result[i].problem_id,
          diag_description: result[i].diag_description,
          diag_code: result[i].diag_code,
        };
        this.lstConcernDetailAddEdit.push(objP);
      }
    }
    }, (reason) => {
    });
  }
  onDeleteMainConern(sur) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = sur.health_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteHealthConcern(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
          );
      }
    }, (reason) => {
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter HealthConcern"
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
      this.getChartHealthConcernView();
      this.getChartHealthConcernDetailView();
      this.lstConcernDetailAddEdit = new Array<any>();
    }
  }

  
   
  onDeleteConcernDetail(sur) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = sur.id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteHealthConcernDetail(deleteRecordData)
          .subscribe(
            data => this.onDeleteDetailSuccessfully(data),
            error => alert(error),
          );
      }
    }, (reason) => {
    });
  }
  onDeleteDetailSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter HealthConcern Detail"
      modalRef.componentInstance.promptMessage = data.response;

      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.getChartHealthConcernView();
      this.getChartHealthConcernDetailView();
      this.lstConcernDetailAddEdit = new Array<any>();
    }
  }
}
