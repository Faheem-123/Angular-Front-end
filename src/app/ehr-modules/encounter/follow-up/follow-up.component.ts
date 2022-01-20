import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { LogMessage } from '../../../shared/log-message';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { GeneralOperation } from '../../../shared/generalOperation';
import { ORMSaveChartProblem } from './../../../models/encounter/orm-save-chart-problem';
import { ORMChartProcedures } from './../../../models/encounter/orm-chart-procedures'
import { DateTimeUtil, DatePart, DateTimeFormat } from '../../../shared/date-time-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ConfirmationPopupComponent } from './../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from './../../../models/general/orm-delete-record';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { LogParameters } from '../../log/log-parameters';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';

@Component({
  selector: 'follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.css']
})
export class FollowUpComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  addEditView: boolean = false;
  editOperation = '';
  noRecordFound;
  isLoading;

  followup = false;
  followupForm: FormGroup;

  enterbyanddatetime;
  comments;
  cptdetails;
  date;
  delRight = false;
  listFollowUp;
  listNQFPlan;
  listNQFPlanDetail;
  filterValue;
  selectedValues;
  isShowGrid = false;

  canAddEdit: boolean = true;

  private obj_ORMChartProblem: ORMSaveChartProblem;
  private obj_ORMChartProcedures: ORMChartProcedures;



  constructor(private formBuilder: FormBuilder,
    private encounterService: EncounterService,
    private logMessage: LogMessage,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    @Inject(LOOKUP_LIST) public lookupList: LookupList
  ) {
  }

  ngOnInit() {
if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      
    this.buildForm();

    this.getNQFPlan();
    this.getNQFPlanDetail();
    debugger;
    this.isShowGrid
    this.getChartFollowUpProblem(this.objencounterToOpen.chart_id);

  }
  onAddNew() {
    this.addEditView = true;
    this.editOperation = 'New';
    this.clearForm();
  }
  buildForm() {
    this.followupForm = this.formBuilder.group({
      txt_followupdate: this.formBuilder.control(null),
      txt_followstatus: this.formBuilder.control(null),
      txt_followtype: this.formBuilder.control(null),
      txt_followcomments: this.formBuilder.control(null),
      txt_code: this.formBuilder.control(null),
      txt_description: this.formBuilder.control(null)
    })
  }
  selectCode(val) {
    (this.followupForm.get('txt_code') as FormControl).setValue(val.code);
    (this.followupForm.get('txt_description') as FormControl).setValue(val.description);
    this.selectedValues = val.code_type;
    this.filterValue = null;
  }
  getNQFPlan() {
    this.encounterService.getNQFPlan()
      .subscribe(
        data => {
          this.listNQFPlan = data;
        },
        error => alert(error),
        () => this.logMessage.log("get NQF plan Successfull.")
      );
  }
  getNQFPlanDetail() {
    this.encounterService.getNQFPlanDetail()
      .subscribe(
        data => {
          this.listNQFPlanDetail = data;
          // if(this.listNQFPlanDetail.length==0)
          // {
          //   this.dataUpdated.emit(new ORMKeyValue("Follow Up", "0"));
          // }
          // else{
          //   this.dataUpdated.emit(new ORMKeyValue("Follow Up", "1"));
          // }
        },
        error => alert(error),
        () => this.logMessage.log("get NQF details Successfull.")
      );
  }
  selectDetails(value) {
    debugger;
    this.filterValue = null;
    this.filterValue = this.generalOperation.filterArray(this.listNQFPlanDetail, "plan_id", value);
    let a = "";
  }

  saveFollowUp() {
    debugger;
    if (this.selectedValues == "ICD-10") {
      this.savePatientProblem();
    }
    else if (this.selectedValues == "CPT" || this.selectedValues == "SNOMED" || this.selectedValues == "HCPCS" || this.selectedValues == "SNOMEDCT") {
      this.saveProcedure();
    }

  }
  savePatientProblem() {
    debugger;
    if (this.validate()) {
      this.obj_ORMChartProblem = new ORMSaveChartProblem();
      this.obj_ORMChartProblem.system_ip = this.lookupList.logedInUser.systemIp;
      this.obj_ORMChartProblem.patient_id = Number(this.objencounterToOpen.patient_id);
      this.obj_ORMChartProblem.chart_id = Number(this.objencounterToOpen.chart_id);
      this.obj_ORMChartProblem.practice_id = this.lookupList.practiceInfo.practiceId;
      this.obj_ORMChartProblem.prob_date = this.dateTimeUtil.getStringDateFromDateModel((this.followupForm.get('txt_followupdate') as FormControl).value);
      this.obj_ORMChartProblem.diag_code = (this.followupForm.get('txt_code') as FormControl).value;
      this.obj_ORMChartProblem.diag_description = (this.followupForm.get('txt_description') as FormControl).value;
      this.obj_ORMChartProblem.code_type = this.filterValue.npi;
      this.obj_ORMChartProblem.primary_diag = false;
      this.obj_ORMChartProblem.chronic = false;
      this.obj_ORMChartProblem.acute = false;
      this.obj_ORMChartProblem.comments = (this.followupForm.get('txt_followcomments') as FormControl).value;
      //this.obj_ORMChartProblem.status = (this.followupForm.get('historyprovidedby') as FormControl).value;
      this.obj_ORMChartProblem.modified_user = this.lookupList.logedInUser.user_name;
      this.obj_ORMChartProblem.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      this.obj_ORMChartProblem.diag_type = "F";
      this.obj_ORMChartProblem.from_followup = true;
      this.obj_ORMChartProblem.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.obj_ORMChartProblem.created_user = this.lookupList.logedInUser.user_name;
      this.obj_ORMChartProblem.education_provided = false;
      this.encounterService.savePatientProblem(this.obj_ORMChartProblem)
        .subscribe(
          data => {
            this.savedPatientProblem(event, data)
            this.addEditView = false;
            this.editOperation = '';
            this.getChartFollowUpProblem(this.objencounterToOpen.chart_id);
          },
          error => alert(error),
          () => this.logMessage.log("Save Patient Follow up problems.")
        );
    }
  }
  savedPatientProblem(event, data) {
    this.getChartFollowUpProblem(this.objencounterToOpen.chart_id);

  }
  saveProcedure() {
    debugger;
    this.obj_ORMChartProcedures = new ORMChartProcedures();
    this.obj_ORMChartProcedures.system_ip = this.lookupList.logedInUser.systemIp;
    this.obj_ORMChartProcedures.patient_id = this.objencounterToOpen.patient_id.toString();
    this.obj_ORMChartProcedures.chart_id = this.objencounterToOpen.chart_id.toString();
    this.obj_ORMChartProcedures.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.obj_ORMChartProcedures.procedure_date = this.dateTimeUtil.getStringDateFromDateModel((this.followupForm.get('txt_followupdate') as FormControl).value);
    this.obj_ORMChartProcedures.procedure_code = (this.followupForm.get('txt_code') as FormControl).value;
    this.obj_ORMChartProcedures.description = (this.followupForm.get('txt_description') as FormControl).value;
    this.obj_ORMChartProcedures.code_type = this.filterValue.npi == "SNOMED" ? "SnomedCT" : this.filterValue.npi;
    this.obj_ORMChartProcedures.comments = (this.followupForm.get('txt_followcomments') as FormControl).value;
    this.obj_ORMChartProcedures.modified_user = this.lookupList.logedInUser.user_name;
    this.obj_ORMChartProcedures.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    this.obj_ORMChartProcedures.entry_type = "CHART_SURGERY";
    this.obj_ORMChartProcedures.from_followup = true;
    this.obj_ORMChartProcedures.education_provided = false;
    this.obj_ORMChartProcedures.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    this.obj_ORMChartProcedures.created_user = this.lookupList.logedInUser.user_name;

    this.encounterService.saveProcedure(this.obj_ORMChartProcedures)
      .subscribe(
        data => {
          this.savedProcedure(event, data)
          this.addEditView = false;
          this.editOperation = '';
          this.getChartFollowUpProblem(this.objencounterToOpen.chart_id);
        },
        error => alert(error),
        () => this.logMessage.log("Save Patient Followup Procedures.")
      );
  }
  savedProcedure(event, data) {
    this.getChartFollowUpProblem(this.objencounterToOpen.chart_id);

  }
  validate(): Boolean {
    //if(!GeneralOptions.dateValidation(txtdate.text))
    //{
    // Alert.show("Please select a valid  Date.",GeneralOptions.messageCaption,Alert.OK,this,null,GeneralOptions.alertIcon);
    // return false;
    //}
    if ((this.followupForm.get('txt_code') as FormControl).value == "") {
      alert("Please select a valid Code.");
      return false;
    }
    else if ((this.followupForm.get('txt_description') as FormControl).value == "") {
      alert("Please select a valid Description.");
      return false;
    }
    return true;
  }
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
  };
  deleteSelectedFollowUp(row) {
    debugger;
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.logoutScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == "YES") {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
        if (row.code_type == 'ICD-10' || row.code_type == 'ICD-9') {
          deleteRecordData.column_id = row.p_id;
          this.encounterService.deleteProblem(deleteRecordData)
            .subscribe(
              data => this.deleteProblemSuccessfully(data, row),
              error => alert(error),
              () => this.logMessage.log("delete Personal Injury Successfull.")
            );
        } else {
          deleteRecordData.column_id = row.p_id;
          this.encounterService.deleteSurgery(deleteRecordData)
            .subscribe(
              data => this.deleteSurgerySuccessfully(data, row),
              error => alert(error),
              () => this.logMessage.log("delete Personal Injury Successfull.")
            );
        }
      }
    }, (reason) => {
    });
  }

  clearForm() {
    (this.followupForm.get('txt_followupdate') as FormControl).setValue('');
    (this.followupForm.get('txt_followstatus') as FormControl).setValue('');
    (this.followupForm.get('txt_followtype') as FormControl).setValue('');
    (this.followupForm.get('txt_followcomments') as FormControl).setValue('');
    (this.followupForm.get('txt_code') as FormControl).setValue('');
    (this.followupForm.get('txt_description') as FormControl).setValue('');
  }

  deleteProblemSuccessfully(result, element) {
    if (result > 0) {
      var index = this.generalOperation.getElementIndex(this.listFollowUp, element);
      if (index > -1) {
        this.listFollowUp.splice(index, 1);
      }
    }
  }
  deleteSurgerySuccessfully(result, element) {
    if (result > 0) {
      var index = this.generalOperation.getElementIndex(this.listFollowUp, element);
      if (index > -1) {
        this.listFollowUp.splice(index, 1);
      }
    }
  }
  getChartFollowUpProblem(chart_id) {
    this.encounterService.getChartFollowUpProblem(chart_id)
      .subscribe(
        data => {
          if (data.toString().length > 0) {
            this.noRecordFound = false;
            this.listFollowUp = data;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          } else {
            this.noRecordFound = true;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
        },
        error => alert(error),
        () => this.logMessage.log("get folowup Successfull.")
      );
  }
  onCancel() {
    this.addEditView = false;
    this.editOperation = '';
  }
  onTypeSearchClose() {
    this.filterValue = null;
  }
}
