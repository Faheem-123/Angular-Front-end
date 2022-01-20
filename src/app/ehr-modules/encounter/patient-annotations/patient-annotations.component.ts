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
import { ChartModuleHistoryComponent } from './../../../general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from './../../../models/encounter/chartmodulehistory';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { LogParameters } from '../../log/log-parameters';

@Component({
  selector: 'patient-annotations',
  templateUrl: './patient-annotations.component.html',
  styleUrls: ['./patient-annotations.component.css']
})
export class PatientAnnotationsComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  private obj_PatAnnotHistory: chartmodulehistory;


  addEditView: boolean = false;
  operation='';
  patannot = false;
  personalInfoHeight: number;
  listChartAnnotations;
  private obj_orm_chart_annotation: ORMChartAnnotation;
  patannotationForm: FormGroup;
  selectedRow;
  isEdit = false;
  
  lblmsg;
  isLoading=false;

  noRecordFound=false;
  canView: boolean = false;
  canAddEdit: boolean = false;

  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private ngbModal: NgbModal,
    private generalOperation: GeneralOperation,
    private clockService: DateTimeUtil,
    private logMessage: LogMessage) {

      
    this.canView = this.lookupList.UserRights.ViewAnnotation;
    this.canAddEdit = this.lookupList.UserRights.AddModifyAnnotation;

  }
  

  ngOnInit() {
    this.buildForm();

    if (this.canView == true) 
    {
      this.lblmsg = "Loading Please Wait . . .";
      this.getChartAnnotation(this.objencounterToOpen.chart_id);
    } 
    else 
    {
      this.lblmsg = "Access Denied.";
    }
  }
  buildForm() {
    this.patannotationForm = this.formBuilder.group({
      annotationprovidedby: this.formBuilder.control(""),
      annotationcomments: this.formBuilder.control("")
    })
  }
  getChartAnnotation(chartID) {
    this.isLoading = true;
    this.noRecordFound = false;
    this.encounterService.getChartAnnotation(chartID)
      .subscribe(
        data => {
          if (data.toString().length > 0) 
          {
            this.listChartAnnotations = null;
            this.listChartAnnotations = data;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
            this.noRecordFound=false;
            this.isLoading=false;
          } 
          else 
          {
            this.noRecordFound=true;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
            this.isLoading=false;
          }
        },
        error => alert(error),
        () => this.logMessage.log("get Annotation Successfull.")
      );
  }
  onSaveAnnotations() {
    this.obj_orm_chart_annotation = new ORMChartAnnotation;
    this.obj_orm_chart_annotation.system_ip = this.lookupList.logedInUser.systemIp;
    this.obj_orm_chart_annotation.patient_id = this.objencounterToOpen.patient_id.toString();
    this.obj_orm_chart_annotation.chart_id = this.objencounterToOpen.chart_id.toString();
    this.obj_orm_chart_annotation.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.obj_orm_chart_annotation.provided_by = (this.patannotationForm.get('annotationprovidedby') as FormControl).value;
    this.obj_orm_chart_annotation.comments = (this.patannotationForm.get('annotationcomments') as FormControl).value;
    this.obj_orm_chart_annotation.modified_user = this.lookupList.logedInUser.user_name;
    this.obj_orm_chart_annotation.client_date_modified = this.clockService.getCurrentDateTimeString();
    if (this.operation=="New") {
      this.obj_orm_chart_annotation.chart_annotation_id = "";
      this.obj_orm_chart_annotation.created_user = this.lookupList.logedInUser.user_name;
      this.obj_orm_chart_annotation.client_date_created = this.clockService.getCurrentDateTimeString();
    }
    else {
      this.obj_orm_chart_annotation.chart_annotation_id = this.selectedRow.chart_annotation_id;
      this.obj_orm_chart_annotation.date_created = this.selectedRow.date_created;
      this.obj_orm_chart_annotation.client_date_created = this.selectedRow.client_date_created;
      this.obj_orm_chart_annotation.created_user = this.selectedRow.created_user;
    }
    this.encounterService.saveupdateChartAnnotation(this.obj_orm_chart_annotation)
      .subscribe(
        data => this.savedSuccessfull(event, data),
        error => alert(error),
        () => this.logMessage.log("Save Patient Consultant.")
      );
  }
  savedSuccessfull(event, data) {
    this.onCancel();
    this.getChartAnnotation(this.objencounterToOpen.chart_id);
  }
  onCancel() {
    this.addEditView=false;
    this.operation='';
  }
  editAnnotation(row) {

    this.addEditView = true;
    this.selectedRow = row;
    this.operation="Edit";
    (this.patannotationForm.get('annotationcomments') as FormControl).setValue(this.selectedRow.comments);
    (this.patannotationForm.get('annotationprovidedby') as FormControl).setValue(this.selectedRow.provided_by);
  }
  populateData() {

    if (this.isEdit) {
      (this.patannotationForm.get('annotationcomments') as FormControl).setValue(this.selectedRow.comments);
      (this.patannotationForm.get('annotationprovidedby') as FormControl).setValue(this.selectedRow.provided_by);
    }
  }
  onAddNew(){
    this.operation="New";
    this.addEditView=true;
    (this.patannotationForm.get('annotationcomments') as FormControl).setValue('');
    (this.patannotationForm.get('annotationprovidedby') as FormControl).setValue(null);
  }
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true,
  };
  deleteselectedRecord(obj) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.logoutScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == "YES") {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.chart_annotation_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.clockService.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
        this.encounterService.deletePatientAnnotation(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data, obj),
            error => alert(error),
            () => this.logMessage.log("delete Personal Injury Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(result, element) {
    if (result > 0) {
      var index = this.generalOperation.getElementIndex(this.listChartAnnotations, element);
      if (index > -1) {
        this.listChartAnnotations.splice(index, 1);
      }
    }
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  getHistoryAnnotations() {
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "annotations_log";
    logParameters.logDisplayName = "Patinet Annotation Log";
    logParameters.logMainTitle = "Patinet Annotation Log";
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
