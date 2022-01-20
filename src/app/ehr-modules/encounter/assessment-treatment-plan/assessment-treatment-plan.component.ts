import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LogMessage } from 'src/app/shared/log-message';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ORMAssessPlanAssessmentSave } from 'src/app/models/encounter/assess-plan/orm-assess-plan-assessment-save';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum, OperationType, DiagnosisCodeType, ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ORMAssessPlanOfTreatementSave } from 'src/app/models/encounter/assess-plan/orm-assess-plan-pot-save';
import { DiagSearchCriteria } from 'src/app/general-modules/inline-diagnosis-search/diag-search-criteria';
import { ORMAssessPlanSave } from 'src/app/models/encounter/assess-plan/orm-assess-plan-save';
import { WrapperAssessPlanSave } from 'src/app/models/encounter/assess-plan/wrapper-assess-plan-save';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ChartModuleHistoryComponent } from 'src/app/general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from 'src/app/models/encounter/chartmodulehistory';
import { OpenedPatientInfo } from 'src/app/models/common/patientInfo';

@Component({
  selector: 'assessment-treatment-plan',
  templateUrl: './assessment-treatment-plan.component.html',
  styleUrls: ['./assessment-treatment-plan.component.css']
})
export class AssessmentTreatmentPlanComponent implements OnInit {

  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();


  @ViewChild('txtAssesmentAddEdit') txtAssesmentAddEdit: ElementRef;
  @ViewChild('txtPOTCodeSearch') txtPOTCodeSearch: ElementRef;
  @ViewChild('txtTreatmentPlanTextAddEdit') txtTreatmentPlanTextAddEdit: ElementRef;


  loadingCount: number = 0;

  isLoading: boolean = false;
  addEditView: boolean = false;

  canView: boolean = false;
  canAddEdit: boolean = false;
  noRecordFound = true;
  lastModifiedMsg: string;

  formGroup: FormGroup;
  formGroupAddAssessment: FormGroup;
  formGroformGroupAddPOT: FormGroup;


  formBuildDone: boolean = false;

  treatmentPlanCodeType: string = "text";

  addEditOperation: OperationType = OperationType.ADD;
  assessmentOperation: OperationType = OperationType.ADD;
  planOfTreatmentOperation: OperationType = OperationType.ADD;

  potCode: string = "";
  potText: string = "";

  showAssessmentAddEdit: boolean = false;
  showPOTAddEdit: boolean = false;
  showPOTCodeSearch: boolean = false;
  potCodeSearchCriteria: DiagSearchCriteria;

  lstStatus: Array<any> = [{ code: "draft", description: "Pending" },
  { code: "active", description: "Active" },
  { code: "suspended", description: "Suspended" },
  { code: "completed", description: "Completed" },
  { code: "cancelled", description: "Cancelled" },
  { code: "unknown", description: "Unknown" }];

  lstPlanMain: Array<any>;
  /* [
    { assess_plan_id: 111, date_created: '22/06/2015', status: 'Active', modified_user: 'admin', date_modified: '06/13/2019 05:55 PM' },
    { assess_plan_id: 112, date_created: '22/06/2015', status: 'Active', modified_user: 'admin', date_modified: '06/13/2019 05:55 PM' }]
    */

  lstAssessment: Array<any>;
  /*= [
    { assessment_id: 1, assess_plan_id: 111, assessment: 'Watch Temp of patient' },
    { assessment_id: 2, assess_plan_id: 111, assessment: 'Watch Weight of patient' },
    { assessment_id: 3, assess_plan_id: 112, assessment: 'Documented HyperTension problem' },
  ]
  */

  lstPlanOfTreatment: Array<any>;
  /*= [
    { planoftreatment_id: 1, assess_plan_id: 111, plan_date: '22/06/2015', plan_of_treatment: 'Watch Temp of patient' },
    { planoftreatment_id: 2, assess_plan_id: 111, plan_date: '22/06/2015', plan_of_treatment: 'Watch Weight of patient' },
    { planoftreatment_id: 3, assess_plan_id: 112, plan_date: '22/06/2015', plan_of_treatment: 'Test' },
  ]
  */

  assPlanMainAddEdit: any;
  lstAssessmentAddEdit: Array<any>;
  lstAssessmentDeletedIds: Array<number>;
  lstPlanOfTreatmentAddEdit: Array<any>;
  lstPlanOfTreatmentDeletedIds: Array<number>;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private formBuilder: FormBuilder,
    private encounterService: EncounterService,
    private ngbModal: NgbModal,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) {

    this.canView = true;
    this.canAddEdit = true;
    this.noRecordFound = false;
  }

  ngOnInit() {

    if (this.canView) {
      this.isLoading = true;
      this.getPatientAssessmentPlan();

    }
  }


  getPatientAssessmentPlan() {

    this.encounterService.getPatientAssessmentPlan(this.objencounterToOpen.patient_id)
      .subscribe(
        data => {

          this.lstPlanMain = data as Array<any>;
          if (this.lstPlanMain == undefined || this.lstPlanMain.length == 0) {
            this.noRecordFound = true;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
            this.getAssessPlanAssessment();
            this.getAssessPlanPOT();
          }
          this.isLoading = false;
        },
        error => {

          this.logMessage.log("An Error Occured while getting Assessment Plan.")
          this.isLoading = false;
        }
      );
  }
  getAssessPlanAssessment() {
    this.encounterService.getAssessPlanAssessment(this.objencounterToOpen.patient_id)
      .subscribe(
        data => {
          debugger;
          this.lstAssessment = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting Assessments.")
          this.isLoading = false;
        }
      );
  }
  getAssessPlanPOT() {
    this.encounterService.getAssessPlanPOT(this.objencounterToOpen.patient_id)
      .subscribe(
        data => {
          this.lstPlanOfTreatment = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting Plan of Treatment.")
          this.isLoading = false;
        }
      );
  }

  buildForm() {

    if (!this.formBuildDone) {

      this.formGroup = this.formBuilder.group({
        ddStatus: this.formBuilder.control("active"),
      });

      this.formGroupAddAssessment = this.formBuilder.group({
        txtAssesmentAddEdit: this.formBuilder.control(null)
      });

      this.formGroformGroupAddPOT = this.formBuilder.group({
        ddPlanTextType: this.formBuilder.control(this.treatmentPlanCodeType),
        dfPlanDate: this.formBuilder.control(null),
        txtTreatmentPlanTextAddEdit: this.formBuilder.control(null),
        //txtDiagCode: this.formBuilder.control(null),
        txtPOTCodeSearch: this.formBuilder.control(null)
      });

      this.formBuildDone = true;
    }

  }


  selectedAssessPlanId: number = -1;
  assessmentIdTemp: number = -1;
  planOfTreatmentIdTemp: number = -1;

  onAdd() {

    this.addEditOperation = OperationType.ADD;

    this.buildForm();

    this.clearAllFeilds();

    this.closeaddEditAssesment();
    this.closeaddEditPOT();

    this.addEditView = true;
  }
  onEdit(assMain: any) {

    debugger;

    this.buildForm();

    this.selectedAssessPlanId = assMain.assess_plan_id;
    this.addEditOperation = OperationType.EDIT;
    this.assPlanMainAddEdit = assMain;//new ListFilterPipe().transform(this.lstPlanMain, "assess_plan_id", this.selectedAssessPlanId)[0];
    this.lstAssessmentAddEdit = new ListFilterPipe().transform(this.lstAssessment, "assess_plan_id", this.selectedAssessPlanId);
    this.lstPlanOfTreatmentAddEdit = new ListFilterPipe().transform(this.lstPlanOfTreatment, "assess_plan_id", this.selectedAssessPlanId);

    this.closeaddEditAssesment();
    this.closeaddEditPOT();

    this.addEditView = true;
  }

  onDelete(assMain: any) {

    if (assMain != undefined) {
      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
      modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;

      modalRef.result.then((result) => {

        if (result == PromptResponseEnum.YES) {

          let deleteRecordData = new ORMDeleteRecord();
          deleteRecordData.column_id = assMain.assess_plan_id.toString();
          deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
          deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
          deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

          this.encounterService.deleteAssessPlan(deleteRecordData)
            .subscribe(
              data => this.onDeleteSuccessfully(data),
              error => alert(error),
              () => this.logMessage.log("Record has benn deleted Successfull.")
            );
        }
      }, (reason) => {
        //alert(reason);
      });
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Assessment & Plan of Treatment', "There is no record to delete.", AlertTypeEnum.INFO)
    }

  }
  onDeleteSuccessfully(data: any) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Assessment & Plan of Treatment', data.response, AlertTypeEnum.DANGER);
    }
    else {
      this.getPatientAssessmentPlan();
    }
  }

  clearAllFeilds() {

    this.selectedAssessPlanId = -1;

    this.assPlanMainAddEdit = undefined;
    this.lstAssessmentAddEdit = undefined;
    this.lstPlanOfTreatmentAddEdit = undefined;

    this.lstAssessmentDeletedIds = undefined;
    this.lstPlanOfTreatmentDeletedIds = undefined;

    this.closeaddEditAssesment();
    this.closeaddEditPOT();

  }

  validateData(): boolean {

    let strAlertMsg: string = "";

    if (this.formGroup.get("ddStatus").value == "" || this.formGroup.get("ddStatus").value == undefined) {
      strAlertMsg = "Please select status";
    }
    else if ((this.lstAssessmentAddEdit == undefined || this.lstAssessmentAddEdit.length == 0)
      && (this.lstPlanOfTreatmentAddEdit == undefined || this.lstPlanOfTreatmentAddEdit.length == 0)) {
      strAlertMsg = "Please enter assessment & plan of treatment.";
    }

    if (strAlertMsg != "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Assessment & Plan of Treatment', strAlertMsg, AlertTypeEnum.DANGER)
      return false;
    }
    else {
      return true;
    }
  }
  onSave() {

    if (this.validateData()) {
      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

      let assessPlan: ORMAssessPlanSave = new ORMAssessPlanSave();

      if (this.addEditOperation == OperationType.ADD) {
        assessPlan.created_user = this.lookupList.logedInUser.user_name;
        assessPlan.client_date_created = clientDateTime;

      }
      else {
        assessPlan.assess_plan_id = this.assPlanMainAddEdit.assess_plan_id;
        assessPlan.created_user = this.assPlanMainAddEdit.created_user;
        assessPlan.date_created = this.assPlanMainAddEdit.date_created;
        assessPlan.client_date_created = this.assPlanMainAddEdit.client_date_created;
      }

      assessPlan.modified_user = this.lookupList.logedInUser.user_name;
      assessPlan.client_date_modified = clientDateTime;
      assessPlan.system_ip = this.lookupList.logedInUser.systemIp;
      assessPlan.patient_id = this.objencounterToOpen.patient_id;
      assessPlan.chart_id = this.objencounterToOpen.chart_id;
      assessPlan.practice_id = this.lookupList.practiceInfo.practiceId;
      assessPlan.status = this.formGroup.get("ddStatus").value;



      let lstormAssessPlanAssessmentSave: Array<ORMAssessPlanAssessmentSave>;
      if (this.lstAssessmentAddEdit != undefined && this.lstAssessmentAddEdit.length > 0) {

        this.lstAssessmentAddEdit.forEach(assessment => {

          if (assessment.assessment_id <= 0 || assessment.modify_flag == true) {

            let assessPlanAssessments: ORMAssessPlanAssessmentSave = new ORMAssessPlanAssessmentSave();

            if (assessment.assessment_id <= 0) {
              assessPlanAssessments.created_user = this.lookupList.logedInUser.user_name;
              assessPlanAssessments.client_date_created = clientDateTime;

            }
            else {
              assessPlanAssessments.assess_plan_id = assessment.assess_plan_id;
              assessPlanAssessments.created_user = assessment.created_user;
              assessPlanAssessments.date_created = assessment.date_created;
              assessPlanAssessments.client_date_created = assessment.client_date_created;
            }

            assessPlanAssessments.assess_plan_id = assessPlan.assess_plan_id;
            assessPlanAssessments.modified_user = this.lookupList.logedInUser.user_name;
            assessPlanAssessments.client_date_modified = clientDateTime;
            assessPlanAssessments.system_ip = this.lookupList.logedInUser.systemIp;
            assessPlanAssessments.patient_id = this.objencounterToOpen.patient_id;
            assessPlanAssessments.chart_id = this.objencounterToOpen.chart_id;
            assessPlanAssessments.practice_id = this.lookupList.practiceInfo.practiceId;

            assessPlanAssessments.assessment = assessment.assessment;

            if (lstormAssessPlanAssessmentSave == undefined) {
              lstormAssessPlanAssessmentSave = new Array<ORMAssessPlanAssessmentSave>();
            }
            lstormAssessPlanAssessmentSave.push(assessPlanAssessments);
          }
        });

      }

      let lstormAssessPlanOfTreatementSave: Array<ORMAssessPlanOfTreatementSave>;
      if (this.lstPlanOfTreatmentAddEdit != undefined && this.lstPlanOfTreatmentAddEdit.length > 0) {

        this.lstPlanOfTreatmentAddEdit.forEach(pot => {

          if (pot.planoftreatment_id <= 0 || pot.modify_flag == true) {

            let potSave: ORMAssessPlanOfTreatementSave = new ORMAssessPlanOfTreatementSave();

            if (pot.planoftreatment_id <= 0) {
              potSave.created_user = this.lookupList.logedInUser.user_name;
              potSave.client_date_created = clientDateTime;

            }
            else {
              potSave.assess_plan_id = pot.assess_plan_id;
              potSave.created_user = pot.created_user;
              potSave.date_created = pot.date_created;
              potSave.client_date_created = pot.client_date_created;
            }

            potSave.assess_plan_id = assessPlan.assess_plan_id;
            potSave.modified_user = this.lookupList.logedInUser.user_name;
            potSave.client_date_modified = clientDateTime;
            potSave.system_ip = this.lookupList.logedInUser.systemIp;
            potSave.patient_id = this.objencounterToOpen.patient_id;
            potSave.chart_id = this.objencounterToOpen.chart_id;
            potSave.practice_id = this.lookupList.practiceInfo.practiceId;

            potSave.plan_date = pot.plan_date;
            potSave.plan_of_treatment = pot.plan_of_treatment;
            potSave.plan_of_treatment_code = pot.plan_of_treatment_code;
            potSave.code_type = pot.code_type;

            if (lstormAssessPlanOfTreatementSave == undefined) {
              lstormAssessPlanOfTreatementSave = new Array<ORMAssessPlanOfTreatementSave>();
            }
            lstormAssessPlanOfTreatementSave.push(potSave);
          }
        });
      }

      let wrapperAssessPlanSave: WrapperAssessPlanSave = new WrapperAssessPlanSave(
        assessPlan, lstormAssessPlanAssessmentSave, lstormAssessPlanOfTreatementSave, this.lstAssessmentDeletedIds, this.lstPlanOfTreatmentDeletedIds
      );

      this.encounterService.saveAssessPlan(wrapperAssessPlanSave).subscribe(
        data => {
          this.saveAssessPlanSuccess(data);
        },
        error => {
          this.saveAssessPlanError(error);
        }
      );
    }


  }

  saveAssessPlanSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.addEditView = false;
      this.clearAllFeilds();
      this.getPatientAssessmentPlan();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Assessment & Plan of Treatment', data.response, AlertTypeEnum.DANGER)

    }
  }

  saveAssessPlanError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Assessment & Plan of Treatment', "An Error Occured while saving Chart Assessment & Plan of Treatment.", AlertTypeEnum.DANGER)

  }

  cancelAddEdit() {
    this.addEditView = false;
  }

  planCodeTypeChanged(event) {
    this.treatmentPlanCodeType = event.target.value;
  }

  assessmentToEdit: any;
  editAssessment(assessment: any) {
    this.showAssessmentAddEdit = true;
    this.assessmentOperation = OperationType.EDIT;
    this.assessmentToEdit = assessment;
    this.formGroupAddAssessment.get("txtAssesmentAddEdit").setValue(assessment.assessment);
    //this.txtAssesmentAddEdit.nativeElement.value = assessment.assessment;
    //this.txtAssesmentAddEdit.nativeElement.focus();
  }

  addUpdateAssessmentToList() {

    if (this.formGroupAddAssessment.get("txtAssesmentAddEdit").value == undefined || this.formGroupAddAssessment.get("txtAssesmentAddEdit").value.trim() == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Assessment & Plan of Treatment', "Please enter assessment.", AlertTypeEnum.WARNING)
    }
    else {

      if (this.assessmentOperation == OperationType.EDIT) {

        if (this.lstAssessmentAddEdit != undefined) {
          for (let i: number = this.lstAssessmentAddEdit.length - 1; i >= 0; i--) {
            if (this.assessmentToEdit.assessment_id == this.lstAssessmentAddEdit[i].assessment_id) {
              this.lstAssessmentAddEdit[i].assessment = this.formGroupAddAssessment.get("txtAssesmentAddEdit").value;
            }
          }
        }

        this.assessmentToEdit = undefined;
        this.closeaddEditAssesment();
      }
      else {
        let assessPlanAssessmentSave: ORMAssessPlanAssessmentSave = new ORMAssessPlanAssessmentSave();
        assessPlanAssessmentSave.assess_plan_id = this.selectedAssessPlanId;
        assessPlanAssessmentSave.assessment_id = this.assessmentIdTemp;
        assessPlanAssessmentSave.assessment = this.formGroupAddAssessment.get("txtAssesmentAddEdit").value;

        if (this.lstAssessmentAddEdit == undefined) {
          this.lstAssessmentAddEdit = new Array<any>();
        }
        this.lstAssessmentAddEdit.push(assessPlanAssessmentSave);

        this.assessmentIdTemp--;

        this.formGroupAddAssessment.get("txtAssesmentAddEdit").setValue("");
        this.txtAssesmentAddEdit.nativeElement.focus();

      }

    }
  }
  /*
  cancelAssessmentEdit() {
    this.assessmentOperation = OperationType.ADD;
    this.formGroupAddAssessment.get("txtAssesmentAddEdit").setValue("");
    this.txtAssesmentAddEdit.nativeElement.focus();
  }
  */

  removeAssessment(assessmentId: number) {

    if (this.lstAssessmentAddEdit != undefined) {
      for (let i: number = this.lstAssessmentAddEdit.length - 1; i >= 0; i--) {
        if (assessmentId == this.lstAssessmentAddEdit[i].assessment_id) {
          this.lstAssessmentAddEdit.splice(i, 1);
          if (assessmentId > 0) {
            if (this.lstAssessmentDeletedIds == undefined) {
              this.lstAssessmentDeletedIds = new Array<number>();
            }
            this.lstAssessmentDeletedIds.push(assessmentId);
          }
        }
      }
    }
  }

  planOfTreatmentToEdit: any;
  editPlanOfTreatment(pot: any) {
    debugger;
    this.showPOTAddEdit = true;
    this.planOfTreatmentOperation = OperationType.EDIT;
    this.planOfTreatmentToEdit = pot;

    this.formGroformGroupAddPOT.get("dfPlanDate").setValue(this.dateTimeUtil.getDateModelFromDateString(pot.plan_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    this.formGroformGroupAddPOT.get("ddPlanTextType").setValue(pot.code_type);
    if (pot.code_type == "text") {
      this.formGroformGroupAddPOT.get("txtTreatmentPlanTextAddEdit").setValue(pot.plan_of_treatment);
    }
    else if (pot.code_type == "SnomedCT") {
      {
        this.potCode = pot.plan_of_treatment_code;
        this.potText = pot.plan_of_treatment;

        //this.formGroformGroupAddPOT.get("txtDiagCode").setValue(pot.plan_of_treatment_code);
        this.formGroformGroupAddPOT.get("txtPOTCodeSearch").setValue(null);
      }
    }
  }

  addUpdatePlanOfTreatmentToList() {

    debugger;
    let strErrorMsg: string = "";
    if (this.formGroformGroupAddPOT.get("dfPlanDate").value == undefined || this.formGroformGroupAddPOT.get("dfPlanDate").value == "") {
      strErrorMsg = "Please enter Plan Date";
      //GeneralOperation.showAlertPopUp(this.ngbModal, 'Assessment & Plan of Treatment', "Please enter Plan Date.", AlertTypeEnum.WARNING)
    }
    else if (!this.dateTimeUtil.isValidDateTime(this.formGroformGroupAddPOT.get("dfPlanDate").value, DateTimeFormat.DATE_MODEL)) {
      strErrorMsg = "Plan date is invalid.";
      //GeneralOperation.showAlertPopUp(this.ngbModal, 'Assessment & Plan of Treatment', "Plan date is invalid.", AlertTypeEnum.WARNING)
    }
    else if (this.treatmentPlanCodeType == "text" && (this.formGroformGroupAddPOT.get("txtTreatmentPlanTextAddEdit").value == undefined || this.formGroformGroupAddPOT.get("txtTreatmentPlanTextAddEdit").value == "")) {
      strErrorMsg = "Plan enter treatment plan.";
    }
    else if (this.treatmentPlanCodeType == "SnomedCT" &&
      (this.potCode == undefined || this.potCode == ""
        || this.potText == undefined || this.potText == "")) {
      strErrorMsg = "Plan enter treatment plan.";
    }



    if (strErrorMsg == "") {
      if (this.planOfTreatmentOperation == OperationType.EDIT) {

        if (this.lstPlanOfTreatmentAddEdit != undefined) {
          for (let i: number = this.lstPlanOfTreatmentAddEdit.length - 1; i >= 0; i--) {
            if (this.planOfTreatmentToEdit.planoftreatment_id == this.lstPlanOfTreatmentAddEdit[i].planoftreatment_id) {

              this.lstPlanOfTreatmentAddEdit[i].plan_date = this.dateTimeUtil.getStringDateFromDateModel(this.formGroformGroupAddPOT.get("dfPlanDate").value);
              if (this.treatmentPlanCodeType == "text") {
                this.lstPlanOfTreatmentAddEdit[i].code_type = "text";
                this.lstPlanOfTreatmentAddEdit[i].plan_of_treatment = this.formGroformGroupAddPOT.get("txtTreatmentPlanTextAddEdit").value;
              }
              else if (this.treatmentPlanCodeType == "SnomedCT") {
                this.lstPlanOfTreatmentAddEdit[i].code_type = "SnomedCT";
                this.lstPlanOfTreatmentAddEdit[i].plan_of_treatment_code = this.potCode;
                this.lstPlanOfTreatmentAddEdit[i].plan_of_treatment = this.potText;
              }
            }
          }
        }

        this.planOfTreatmentToEdit = undefined;
        this.closeaddEditPOT();
      }
      else {
        let assessPlanOfTreatementSave: ORMAssessPlanOfTreatementSave = new ORMAssessPlanOfTreatementSave();
        assessPlanOfTreatementSave.assess_plan_id = this.selectedAssessPlanId;
        assessPlanOfTreatementSave.planoftreatment_id = this.planOfTreatmentIdTemp;

        assessPlanOfTreatementSave.plan_date = this.dateTimeUtil.getStringDateFromDateModel(this.formGroformGroupAddPOT.get("dfPlanDate").value);
        if (this.treatmentPlanCodeType == "text") {
          assessPlanOfTreatementSave.code_type = "text";
          assessPlanOfTreatementSave.plan_of_treatment = this.formGroformGroupAddPOT.get("txtTreatmentPlanTextAddEdit").value;
        }
        else if (this.treatmentPlanCodeType == "SnomedCT") {
          assessPlanOfTreatementSave.code_type = "SnomedCT";
          assessPlanOfTreatementSave.plan_of_treatment_code = this.potCode;
          assessPlanOfTreatementSave.plan_of_treatment = this.potText;
        }

        if (this.lstPlanOfTreatmentAddEdit == undefined) {
          this.lstPlanOfTreatmentAddEdit = new Array<any>();
        }
        this.lstPlanOfTreatmentAddEdit.push(assessPlanOfTreatementSave);

        this.planOfTreatmentIdTemp--;

        this.formGroformGroupAddPOT.get("txtTreatmentPlanTextAddEdit").setValue(null);
        this.formGroformGroupAddPOT.get("txtPOTCodeSearch").setValue(null);

        if (this.treatmentPlanCodeType == "text") {
          this.txtTreatmentPlanTextAddEdit.nativeElement.focus();
        }
        else if (this.treatmentPlanCodeType == "SnomedCT") {
          this.txtPOTCodeSearch.nativeElement.focus();
        }

        this.potCode = "";
        this.potText = "";
      }



    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Assessment & Plan of Treatment', strErrorMsg, AlertTypeEnum.WARNING)
    }
  }

  /*
  cancelPlanOfTreatmentEdit() {
    this.planOfTreatmentOperation = OperationType.ADD;
    this.formGroformGroupAddPOT.get("txtTreatmentPlanTextAddEdit").setValue(null);
    this.formGroformGroupAddPOT.get("txtDiagCode").setValue(null);
    this.formGroformGroupAddPOT.get("txtPOTCodeSearch").setValue(null);

    if (this.treatmentPlanCodeType == "text") {
      this.txtTreatmentPlanTextAddEdit.nativeElement.focus();
    }
    else if (this.treatmentPlanCodeType == "SnomedCT") {
      this.txtPOTCodeSearch.nativeElement.focus();
    }
  }
  */
  removePlanOfTreatment(potId: number) {

    debugger;
    if (this.lstPlanOfTreatmentAddEdit != undefined) {
      for (let i: number = this.lstPlanOfTreatmentAddEdit.length - 1; i >= 0; i--) {
        if (potId == this.lstPlanOfTreatmentAddEdit[i].planoftreatment_id) {
          this.lstPlanOfTreatmentAddEdit.splice(i, 1);
          if (potId > 0) {
            if (this.lstPlanOfTreatmentDeletedIds == undefined) {
              this.lstPlanOfTreatmentDeletedIds = new Array<number>();
            }
            this.lstPlanOfTreatmentDeletedIds.push(potId);
          }
        }
      }
    }
  }

  addNewAssesment() {
    this.showAssessmentAddEdit = true;
  }
  closeaddEditAssesment() {
    debugger;
    this.assessmentOperation = OperationType.ADD;
    this.formGroupAddAssessment.get("txtAssesmentAddEdit").setValue("");
    //this.txtAssesmentAddEdit.nativeElement.focus();
    this.showAssessmentAddEdit = false;
  }
  addNewPOT() {
    this.showPOTAddEdit = true;
    this.formGroformGroupAddPOT.get("dfPlanDate").setValue(this.dateTimeUtil.getDateModelFromDateString(this.objencounterToOpen.visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a));
  }
  closeaddEditPOT() {
    debugger;
    this.showPOTAddEdit = false;

    this.planOfTreatmentOperation = OperationType.ADD;
    this.potCode = "";
    this.potText = "";
    this.formGroformGroupAddPOT.get("txtTreatmentPlanTextAddEdit").setValue(null);
    this.formGroformGroupAddPOT.get("txtPOTCodeSearch").setValue(null);

    /*
    if (this.treatmentPlanCodeType == "text") {
      this.txtTreatmentPlanTextAddEdit.nativeElement.focus();
    }
    else if (this.treatmentPlanCodeType == "SnomedCT") {
      this.txtPOTCodeSearch.nativeElement.focus();
    }
    */
  }

  onPOTCodeSearchKeydown(event: any) {

    if (event.key === "Enter") {
      this.potCodeSearchCriteria = new DiagSearchCriteria();
      this.potCodeSearchCriteria.codeType = DiagnosisCodeType.SNOMED_CT;
      this.potCodeSearchCriteria.criteria = event.currentTarget.value;
      this.potCodeSearchCriteria.providerId = undefined;

      this.showPOTCodeSearch = true;
    }

  }
  /*
  onPOTCodeSearchInputChange(newValue:any) {
    this.logMessage.log("onProblemSearcInputChange");
    if (newValue !== this.diagDescription) {
      this.potCode = undefined;
      this.problemFormGroup.get("txtIcdCode").setValue(null);
    }
  }
  */

  /*
  onPOTCodeSearchBlur() {

    this.logMessage.log("onProblemSearcBlur");

    if (this.potCode == undefined && this.showPOTCodeSearch == false) {
      this.diagCode = undefined;
      this.diagDescription = undefined;
      this.problemFormGroup.get("txtIcdCode").setValue(null);
      this.problemFormGroup.get("txtProblemSearch").setValue(null);
    }

  }
  */


  onPOTCodeSearchSelect(diag: any) {

    this.logMessage.log(diag);
    this.potCode = diag.diag_code;
    this.potText = diag.diag_description;
    //(this.problemFormGroup.get("txtIcdCode") as FormControl).setValue(this.diagCode);
    //(this.problemFormGroup.get("txtProblemSearch") as FormControl).setValue(this.diagDescription);
    this.showPOTCodeSearch = false;
  }

  closePOTCodeSearch() {
    this.showPOTCodeSearch = false;
  }
  popUpOptionsLarge: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true,
    size: 'lg'
  };
  viewAssessmentRecordLog(id){
      const modalRef = this.ngbModal.open(ChartModuleHistoryComponent, this.popUpOptionsLarge);
      let obj_charthistory:chartmodulehistory = new chartmodulehistory();
      obj_charthistory.titleString = "Assessment Plan History";
      obj_charthistory.moduleName = "assessment_plan_log";
      obj_charthistory.criteria = " and apa.chart_id ='"+ this.objencounterToOpen.chart_id +"' and apa.assess_plan_id = '"+ id +"' ";
      modalRef.componentInstance.data = obj_charthistory;
      let closeResult;
  
      modalRef.result.then((result) => {
        if (result == true) {
          //this.getAllUsers((this.userForm.get('ctrlStatus') as FormControl).value);
        }
      }
        , (reason) => {
          //alert(reason);
        });
  }
  viewTreatmentRecordLog(id){
    {
      const modalRef = this.ngbModal.open(ChartModuleHistoryComponent, this.popUpOptionsLarge);
      let obj_charthistory:chartmodulehistory = new chartmodulehistory();
      obj_charthistory.titleString = "Treatment Plan History";
      obj_charthistory.moduleName = "treatment_plan_log";
      obj_charthistory.criteria = " and app.chart_id ='"+ this.objencounterToOpen.chart_id +"' and app.assess_plan_id = '"+ id +"' ";
      modalRef.componentInstance.data = obj_charthistory;
      let closeResult;
  
      modalRef.result.then((result) => {
        if (result == true) {
          //this.getAllUsers((this.userForm.get('ctrlStatus') as FormControl).value);
        }
      }
        , (reason) => {
          //alert(reason);
        });
  }
  }
}
