import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DiagSearchCriteria } from 'src/app/general-modules/inline-diagnosis-search/diag-search-criteria';
import { GeneralService } from 'src/app/services/general/general.service';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORMSaveChartFamilyHx } from 'src/app/models/encounter/orm-save-familyhx';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { LogParameters } from '../../log/log-parameters';

@Component({
  selector: 'family-history',
  templateUrl: './family-history.component.html',
  styleUrls: ['./family-history.component.css']
})
export class FamilyHistoryComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  lstFamilyHxView;
  isLoading = false;
  noRecordFound: boolean = false;
  FHXForm: FormGroup;
  showDiagSearch: boolean = false;
  dataOption = "mylist";
  codeType = "ICD-10";
  editOperation = '';
  diagSearchCriteria: DiagSearchCriteria;
  objChrtFamilyDetail;
  canView: boolean = false;
  canAddEdit: boolean = false;

  constructor(private encounterService: EncounterService,
    private logMessage: LogMessage, @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder, private generalService: GeneralService,
    private dateTimeUtil: DateTimeUtil, private ngbModal: NgbModal) {
    this.canView = this.lookupList.UserRights.ViewFamilyHx;
    this.canAddEdit = this.lookupList.UserRights.AddModifyFamilyHx;
  }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
    this.canAddEdit = false;
    if (this.canView) {
      this.getViewData();


      if (this.canAddEdit) {
        if (this.lookupList.lstRelationship == undefined || this.lookupList.lstRelationship.length == 0) {
          this.getRelationshipList();
        }
        this.buildForm();
      }
    }

  }
  getRelationshipList() {
    this.generalService.getRelationshipList().subscribe(
      data => {

        debugger;
        this.lookupList.lstRelationship = data as Array<any>;
      },
      error => {
        this.logMessage.log("getRelationshipList Error." + error);
      }
    );
  }
  getViewData() {
    this.isLoading = true;
    this.noRecordFound = false;

    this.encounterService.getChartFamilyHxView(this.objencounterToOpen.chart_id.toString())
      .subscribe(
        data => {
          this.lstFamilyHxView = data;
          if (this.lstFamilyHxView == undefined || this.lstFamilyHxView.length == 0) {
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
          this.logMessage.log("An Error Occured while getting Family Hx list.")
          this.isLoading = false;
        }
      );
  }
  OnAddNew() {
    this.addEditView = true;
    this.editOperation = 'New';
    this.buildForm();
    (this.FHXForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
  }
  onCancel() {
    this.addEditView = false;
  }
  buildForm() {
    this.FHXForm = this.formBuilder.group({

      drpRelationship: this.formBuilder.control("", Validators.required),
      txtDate: this.formBuilder.control("", Validators.required),
      txtProblemSearch: this.formBuilder.control("", Validators.required),
      rbCondition: this.formBuilder.control("mylist"),
      rbCodeType: this.formBuilder.control("ICD-10"),
      txtComments: this.formBuilder.control(""),
      txtIcdCode: this.formBuilder.control("", Validators.required),
      txtIcdDescription: this.formBuilder.control("", Validators.required)
    })
  }

  onCodeTypeChange(event) {
    debugger;
    this.codeType = event;
    

    this.showDiagSearch = false;
    if (this.FHXForm.get("txtProblemSearch").value != null && this.FHXForm.get("txtProblemSearch").value.length > 2) {
      this.sentCriteriatoSearch(this.FHXForm.get("txtProblemSearch").value);
    }
  }
  onRadioOptionChange(event) {
    debugger;
    this.dataOption = event;
    this.showDiagSearch = false;
    if (this.FHXForm.get("txtProblemSearch").value != null && this.FHXForm.get("txtProblemSearch").value.length > 2) {
      this.sentCriteriatoSearch(this.FHXForm.get("txtProblemSearch").value);
    }
  }
  sentCriteriatoSearch(value) {
    debugger;
    this.diagSearchCriteria = new DiagSearchCriteria();

    if (this.FHXForm.get("rbCondition").value == "mylist") {
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
  diagCode;
  diagDescription;
  onProblemSearcBlur() {
    if (this.diagCode == undefined && this.showDiagSearch == false) {
      this.diagCode = undefined;
      this.diagDescription = undefined;
      this.FHXForm.get("txtIcdCode").setValue(null);
      this.FHXForm.get("txtProblemSearch").setValue(null);
    }
  }
  onDiagnosisSelect(diag) {
    this.logMessage.log(diag);
    this.diagCode = diag.diag_code;
    this.diagDescription = diag.diag_description;
    (this.FHXForm.get("txtIcdCode") as FormControl).setValue(this.diagCode);
    (this.FHXForm.get("txtIcdDescription") as FormControl).setValue(this.diagDescription);
    this.showDiagSearch = false;
  }
  closeDiagSearch() {
    this.showDiagSearch = false;
    this.onProblemSearcBlur();
  }
  onSave(formValue) {
    let ormSave: ORMSaveChartFamilyHx = new ORMSaveChartFamilyHx();
    if (this.editOperation == "New") {
      ormSave.created_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else {
      ormSave.familyhistory_id = this.objChrtFamilyDetail.familyhistory_id;
      ormSave.client_date_created = this.objChrtFamilyDetail.client_date_created;
      ormSave.date_created = this.objChrtFamilyDetail.date_created;
      ormSave.created_user = this.objChrtFamilyDetail.created_user;
    }

    ormSave.modified_user = this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    ormSave.patient_id = this.objencounterToOpen.patient_id.toString();
    ormSave.chart_id = this.objencounterToOpen.chart_id.toString();
    ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    ormSave.relation=formValue.drpRelationship;
    ormSave.icd_code = formValue.txtIcdCode;
    ormSave.description = formValue.txtIcdDescription;
    ormSave.onset_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtDate);
    ormSave.comment = formValue.txtComments;
    ormSave.system_ip = this.lookupList.logedInUser.systemIp;
    ormSave.code_type = this.codeType;
    this.encounterService.saveFamilyHx(ormSave).subscribe(
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
    const modalRef = this.ngbModal.open(AlertPopupComponent, this.poupUpOptions);
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

  onEdit(sur) {
    this.isLoading = true;
    this.noRecordFound = false;
    this.encounterService.getChartFamilyHxDetail(sur.familyhistory_id)
      .subscribe(
        data => {
          this.objChrtFamilyDetail = data;
          this.assignValues();
          this.editOperation = "edit";
          this.addEditView = true;
          this.isLoading = false;
        },
        error => {
          this.logMessage.log("An Error Occured while getting Family Hx Detail.")
          this.isLoading = false;
        }
      );
  }
  assignValues() {
    debugger;
    (this.FHXForm.get("txtIcdCode") as FormControl).setValue(this.objChrtFamilyDetail.icd_code);
    (this.FHXForm.get("txtIcdDescription") as FormControl).setValue(this.objChrtFamilyDetail.description);
    (this.FHXForm.get("txtComments") as FormControl).setValue(this.objChrtFamilyDetail.comment);
    (this.FHXForm.get("drpRelationship") as FormControl).setValue(this.objChrtFamilyDetail.relation);
    (this.FHXForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.objChrtFamilyDetail.onset_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
  }

  onDelete(sur) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = sur.familyhistory_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteFamilyHx(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Family HX Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.ngbModal.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter FamilyHX"
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
  showLogHistory() {
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "family_history_log";
    logParameters.logDisplayName = "Family History Log";
    logParameters.logMainTitle = "Family History Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
    
    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.ngbModal.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;

  }
}
