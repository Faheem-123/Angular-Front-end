import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DiagSearchCriteria } from 'src/app/general-modules/inline-diagnosis-search/diag-search-criteria';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ORMSavePMH } from 'src/app/models/encounter/ORMSavePMH';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';

@Component({
  selector: 'pmh',
  templateUrl: './pmh.component.html',
  styleUrls: ['./pmh.component.css']
})
export class PmhComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen:EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  editOperation: string = '';
  isLoading: boolean = false;
  noRecordFound: boolean = false;
  dataOption = "mylist";
  lstAssessmentView;
  inputForm: FormGroup;
  diagCode;
  diagDescription;
  showDiagSearch: boolean = false;
  diagSearchCriteria: DiagSearchCriteria;
  codeType = "ICD-10";
  objChrtAssessmentDetail;
  errorMsg;

  canView: boolean = false;
  canAddEdit: boolean = false;

  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private formBuilder: FormBuilder, private modalService: NgbModal) {

    this.canView = this.lookupList.UserRights.ViewPMH;
    this.canAddEdit = this.lookupList.UserRights.AddModifyPMH;

  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtProblemSearch: this.formBuilder.control("", Validators.required),
      txtIcdCode: this.formBuilder.control("", Validators.required),
      txtIcdDescription: this.formBuilder.control("", Validators.required),
      rbCondition: this.formBuilder.control("mylist"),
      txtComments: this.formBuilder.control(""),
      txtDate: this.formBuilder.control(null, Validators.required)
    })
  }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      if (this.canView) 
      {
        this.getViewData();
      }
      this.buildForm()
  }
  getViewData() {
    this.isLoading = true;
    this.noRecordFound = false;

    this.encounterService.getChartPMHView(this.objencounterToOpen.patient_id.toString(), this.objencounterToOpen.chart_id.toString())
      .subscribe(
        data => {
          this.lstAssessmentView = data;
          if (this.lstAssessmentView == undefined || this.lstAssessmentView.length == 0) {
            this.noRecordFound = true;
          }
          this.isLoading = false;

          if (this.noRecordFound == true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting PMH list.")
          this.isLoading = false;
        }
      );
  }
  onAddNew() {
    this.addEditView = true;
    this.editOperation = 'new';
    (this.inputForm.get("txtIcdCode") as FormControl).setValue(null);
    (this.inputForm.get("txtIcdDescription") as FormControl).setValue(null);
    (this.inputForm.get("txtComments") as FormControl).setValue(null);
    (this.inputForm.get("txtDate") as FormControl).setValue(null);
  
    (this.inputForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
  }

  onCancel() {
    this.addEditView = false;
  }

  onProblemSearcInputChange(newValue) {
    this.logMessage.log("onProblemSearcInputChange");
    if (newValue !== this.diagDescription) {
      this.diagCode = undefined;
      this.inputForm.get("txtIcdCode").setValue(null);
    }
  }
  onProblemSearcBlur() {


    if (this.diagCode == undefined && this.showDiagSearch == false) {
      this.diagCode = undefined;
      this.diagDescription = undefined;
      this.inputForm.get("txtIcdCode").setValue(null);
      this.inputForm.get("txtProblemSearch").setValue(null);
    }

  }

  sentCriteriatoSearch(value) {
    debugger;
    this.diagSearchCriteria = new DiagSearchCriteria();

    if (this.inputForm.get("rbCondition").value == "mylist") {
      this.diagSearchCriteria.providerId = Number(this.objencounterToOpen.provider_id);
    }
    else {
      this.diagSearchCriteria.providerId = undefined;
    }
    this.diagSearchCriteria.codeType = this.codeType;
    this.diagSearchCriteria.criteria = value;
    this.diagSearchCriteria.dos = this.objencounterToOpen.visit_date;
    this.showDiagSearch = true;
  }
  onProblemSearchKeydown(event) {

    if (event.currentTarget.value.length > 2) {
      this.sentCriteriatoSearch(event.currentTarget.value);      
    }
    else {
      this.showDiagSearch = false;
    }
  }

  onDiagnosisSelect(diag) {
    this.logMessage.log(diag);

    this.diagCode = diag.diag_code;
    this.diagDescription = diag.diag_description;

    (this.inputForm.get("txtIcdCode") as FormControl).setValue(this.diagCode);
    (this.inputForm.get("txtIcdDescription") as FormControl).setValue(this.diagDescription);

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
    if (this.inputForm.get("txtProblemSearch").value != null && this.inputForm.get("txtProblemSearch").value.length > 2) {
      this.sentCriteriatoSearch(this.inputForm.get("txtProblemSearch").value);
    }
  }
  assignValues() {

    debugger;
    (this.inputForm.get("txtIcdCode") as FormControl).setValue(this.objChrtAssessmentDetail.code);
    (this.inputForm.get("txtIcdDescription") as FormControl).setValue(this.objChrtAssessmentDetail.description);
    (this.inputForm.get("txtComments") as FormControl).setValue(this.objChrtAssessmentDetail.notes);
    (this.inputForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.objChrtAssessmentDetail.date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
  }
  onDiagnosisClear() {
    (this.inputForm.get("txtIcdCode") as FormControl).setValue("");
    (this.inputForm.get("txtIcdDescription") as FormControl).setValue("");
  }
  onSave(formValue) {
    debugger;
    let ormSave: ORMSavePMH = new ORMSavePMH();
    if (this.editOperation == "new") {
      ormSave.created_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else {
      ormSave.id = this.objChrtAssessmentDetail.id;
      ormSave.client_date_created = this.objChrtAssessmentDetail.client_date_created;
      ormSave.date_created = this.objChrtAssessmentDetail.date_created;
      ormSave.created_user = this.objChrtAssessmentDetail.created_user;
    }
    ormSave.modified_user = this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    ormSave.patient_id = this.objencounterToOpen.patient_id.toString();
    ormSave.chart_id = this.objencounterToOpen.chart_id.toString();
    ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

    ormSave.code = formValue.txtIcdCode;
    ormSave.description = formValue.txtIcdDescription;
    ormSave.date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtDate);
    ormSave.notes = formValue.txtComments;
    ormSave.system_ip = this.lookupList.logedInUser.systemIp;
    this.encounterService.savePMH(ormSave).subscribe(
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
        this.showError("An error occured while saving Chart Assessments.");
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

  onDataAssign() {

  }
  onEdit(obj) {
    this.getAssessmentDetails(obj.id);
  }

  getAssessmentDetails(id) {
    debugger;
    this.isLoading = true;
    this.objChrtAssessmentDetail = undefined;
    this.encounterService.getChartPMHDetail(id)
      .subscribe(
        data => {
          this.objChrtAssessmentDetail = data;
          this.editOperation = "edit";
          this.addEditView = true;
          this.assignValues();
          this.isLoading = false;;
        },
        error => {
          this.errorMsg = "An Error Occured while getting PMH Detail";
          this.logMessage.log("An Error Occured while getting PMH Detail.")
          this.isLoading = false;
        }
      );

  }

  onDelete(record) {


    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger'
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = record.id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deletePMH(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("PMH Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter PMH"
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
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showLog(){
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));
    
    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "chart_pmh_log";
    logParameters.logDisplayName = "Past Medical History";
    logParameters.logMainTitle = "Past Medical History";
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
