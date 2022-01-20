import { Component, OnInit, Input, Inject, EventEmitter, Output } from '@angular/core';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { LogMessage } from '../../../shared/log-message';
import { LOOKUP_LIST, LookupList } from './../../../providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { NgbTimepickerConfig, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { DiagSearchCriteria } from '../../../general-modules/inline-diagnosis-search/diag-search-criteria';
import { datetimeValidator } from '../../../shared/custome-validators';
import { ORMSaveChartProblem } from '../../../models/encounter/orm-save-chart-problem';
import { EncounterToOpen } from '../../../models/encounter/EncounterToOpen';
import { ServiceResponseStatusEnum, PromptResponseEnum, AlertTypeEnum } from '../../../shared/enum-util';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from '../../../models/general/orm-delete-record';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { ChartModuleHistoryComponent } from 'src/app/general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from 'src/app/models/encounter/chartmodulehistory';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { LogParameters } from '../../log/log-parameters';
import { ORMSaveAssessments } from 'src/app/models/encounter/orm-save-assessmens';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMMyListICD } from 'src/app/models/setting/ORMMyListICD';
import { SetupService } from 'src/app/services/setup.service';

@Component({
  selector: 'patient-problems',
  templateUrl: './patient-problems.component.html',
  styleUrls: ['./patient-problems.component.css']
})
export class PatientProblemsComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  private obj_PatProblemsHistory: chartmodulehistory;

  radioForm: FormGroup;
  problemFormGroup: FormGroup;
  dataOption = "active";
  codeType = "ICD-10";

  listChartProblems;
  objChrtProblemDetail;

  canView: boolean = false;
  canAddEdit: boolean = false;
  noRecordFound: boolean = false;
  isLoading: boolean = false;
  addEditView: boolean = false;
  isEducationProvided = false;
  diagSearchCriteria: DiagSearchCriteria;

  //lblmsg;

  //chartId;
  //patientId;
  errorMsg;

  addEditOption;

  problDateModel;
  problTimeModel;
  problDateResolvedModel;
  problTimeResolvedModel;

  diagCode;
  diagDescription;
  visitDateforDiscuss;
  showDiagSearch: boolean = false;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(config: NgbTimepickerConfig,
    private formBuilder: FormBuilder,
    private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation, private setupService: SetupService,
    private ngbModal: NgbModal
  ) {

    config.spinners = false;
    config.size = 'small';

    this.canView = this.lookupList.UserRights.ViewProblemList;
    this.canAddEdit = this.lookupList.UserRights.AddModifyProblemList;
  }

  ngOnInit() {
    debugger;
    if (this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;

    this.visitDateforDiscuss = this.objencounterToOpen.visit_date;
    //this.visitDateforDiscuss = this.dateTimeUtil.convertDateTimeFormat(this.objencounterToOpen.visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

    if (this.canView) {

      debugger;
      //this.chartId = this.objencounterToOpen.chart_id;
      //this.patientId = this.objencounterToOpen.patient_id;
      this.isLoading = true;
      this.noRecordFound = false;
      this.getChartProblem("active");

      this.buildForm()
    }
  }


  buildForm() {
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control(this.dataOption),
    }
    );

    this.problemFormGroup = this.formBuilder.group({
      codeType: this.formBuilder.control(this.codeType),
      txtProblemSearch: this.formBuilder.control(null),
      // txtIcdCode: this.formBuilder.control(null, Validators.required),
      txtIcdDescription: this.formBuilder.control(null, Validators.required),
      dpProblemDate: this.formBuilder.control(null, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      tpProblemTime: this.formBuilder.control(null, Validators.required),
      rbCondition: this.formBuilder.control(null),
      rbList: this.formBuilder.control('mylist'),
      rbType: this.formBuilder.control(null),
      chkPrimary: this.formBuilder.control(null),
      cmbStatus: this.formBuilder.control(null),
      cmbProbType: this.formBuilder.control(null),
      dpDateResolved: this.formBuilder.control(null, datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
      tpTimeResolved: this.formBuilder.control(null),
      txtComments: this.formBuilder.control(null)
    }
      /*,
        {
          validator: Validators.compose([
            CustomValidators.validDate('dpProblemDate', false),
            CustomValidators.validDate('dpDateResolved', true)
          ])
        }
        */
    )
  }


  onRadioOptionChange(event) {
    this.dataOption = event;
    switch (this.dataOption) {
      case "all":
      case "active":
      case "inactive":
      case "resolved":
        this.getChartProblem(this.dataOption);
        break;
      case "other":
        this.getChartProblem("ccd");
        break;
      default:
        break;
    }
  }
  onCodeTypeChange(event) {
    this.codeType = event;
  }


  onProblemSearchKeydown(event) {

    if (event.currentTarget.value.length > 2) {
      debugger;
      this.sentCriteriatoSearch(event.currentTarget.value);
      // this.diagSearchCriteria = new DiagSearchCriteria();
      // this.diagSearchCriteria.codeType = this.codeType;
      // this.diagSearchCriteria.criteria = ;
      // this.diagSearchCriteria.providerId = undefined;

      // this.showDiagSearch = true;
    }
    else {
      //this.showDiagSearch = false;
    }
  }


  onProblemSearcBlur() {

    //this.logMessage.log("onProblemSearcBlur");

    if (this.diagCode == undefined && this.showDiagSearch == false) {
      //this.diagCode = undefined;
      //this.diagDescription = undefined;
      //this.problemFormGroup.get("txtIcdCode").setValue(null);
      //this.problemFormGroup.get("txtProblemSearch").setValue(null);
    }

  }
  showAddtoMylistButton = false;
  onDiagnosisSelect(diag) {

    //this.logMessage.log(diag);
    this.diagCode = diag.diag_code;
    this.diagDescription = diag.diag_description;
    //(this.problemFormGroup.get("txtIcdCode") as FormControl).setValue(this.diagCode);
    (this.problemFormGroup.get("txtIcdDescription") as FormControl).setValue(this.diagDescription);

    //(this.problemFormGroup.get("txtProblemSearch") as FormControl).setValue(this.diagCode + " ( " + this.diagDescription + " )");

    this.showDiagSearch = false;
    if (this.problemFormGroup.get("rbList").value == "all") {
      this.showAddtoMylistButton = true;
    }
    else {
      this.showAddtoMylistButton = false;
    }
  }

  closeDiagSearch() {
    this.showDiagSearch = false;
    this.onProblemSearcBlur();
  }
  getChartProblem(option) {

    //this.isLoading = true;
    //this.noRecordFound = false;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "chart_id", value: this.objencounterToOpen.chart_id.toString(), option: "" },
      { name: "diag_option", value: option, option: "" }
    ];

    this.encounterService.getChartProblem(searchCriteria)
      .subscribe(
        data => {
          debugger
          this.listChartProblems = data;

          if (this.listChartProblems != null) {
            for (let i = 0; i < this.listChartProblems.length; i++) {
              if (this.listChartProblems[i].prob_date != "" || this.listChartProblems[i].prob_date != null || this.listChartProblems[i].prob_date != undefined) {
                // let dos: string = this.dateTimeUtil.convertDateTimeFormat(this.listChartProblems[i].prob_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
                // this.listChartProblems[i].convertedDate = dos;
                this.listChartProblems[i].problem_discussed = this.ProbDiscussed(this.listChartProblems[i]);
              }
            }
          }





          if (this.listChartProblems == undefined || this.listChartProblems.length == 0) {
            this.noRecordFound = true;
          }
          else
            this.noRecordFound = false;

          this.isLoading = false;;


          if (this.noRecordFound == true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }

        },
        error => {
          this.errorMsg = "An Error Occured while getting problem list";
          this.logMessage.log("An Error Occured while getting problem list.")
          this.isLoading = false;
        }
      );
  }

  addNew() {

    debugger;
    this.addEditView = true;
    this.addEditOption = "add";

    this.diagCode = undefined;
    this.diagDescription = undefined;
    this.isEducationProvided = false;
    this.codeType = "ICD-10";

    this.problDateModel = this.dateTimeUtil.getCurrentDateModel();
    this.problTimeModel = this.dateTimeUtil.getCurrentTimeModel();


    //(this.problemFormGroup.get("txtIcdCode") as FormControl).setValue(null);

    (this.problemFormGroup.get("txtIcdDescription") as FormControl).setValue(null);
    (this.problemFormGroup.get("txtProblemSearch") as FormControl).setValue(null);
    (this.problemFormGroup.get("dpProblemDate") as FormControl).setValue(this.problDateModel);
    (this.problemFormGroup.get("tpProblemTime") as FormControl).setValue(this.problTimeModel);

    (this.problemFormGroup.get("codeType") as FormControl).setValue(this.codeType);
    (this.problemFormGroup.get("txtComments") as FormControl).setValue(null);
    (this.problemFormGroup.get("cmbStatus") as FormControl).setValue("Active");
    (this.problemFormGroup.get("cmbProbType") as FormControl).setValue("");


    this.problDateResolvedModel = undefined;
    this.problTimeResolvedModel = undefined;
    (this.problemFormGroup.get("dpDateResolved") as FormControl).setValue(this.problDateResolvedModel);
    (this.problemFormGroup.get("tpTimeResolved") as FormControl).setValue(this.problTimeResolvedModel);

    (this.problemFormGroup.get("rbType") as FormControl).setValue("F");
    (this.problemFormGroup.get("rbCondition") as FormControl).setValue(null);
    (this.problemFormGroup.get("chkPrimary") as FormControl).setValue(null);

  }
  edit(record) {
    debugger;

    (this.problemFormGroup.get("txtProblemSearch") as FormControl).setValue(null);

    this.diagCode = undefined;
    this.diagDescription = undefined;
    this.isEducationProvided = false;
    this.problDateModel = undefined;
    this.problTimeModel = undefined;

    this.problDateResolvedModel = undefined;
    this.problTimeResolvedModel = undefined;


    this.getProblemDetails(record.problem_id);
  }

  getProblemDetails(prblemId) {
    debugger;
    this.isLoading = true;
    this.objChrtProblemDetail = undefined;
    this.encounterService.getChartProblemDetail(prblemId)
      .subscribe(
        data => {
          this.objChrtProblemDetail = data;
          this.addEditOption = "edit";
          this.addEditView = true;
          this.assignValues();
          this.isLoading = false;;
        },
        error => {
          this.errorMsg = "An Error Occured while getting problem Detail";
          this.logMessage.log("An Error Occured while getting problem Detail.")
          this.isLoading = false;
        }
      );

  }

  assignValues() {

    debugger;
    this.isEducationProvided = false;
    this.diagCode = this.objChrtProblemDetail.diag_code;
    this.diagDescription = this.objChrtProblemDetail.diag_description;

    this.problDateModel = this.dateTimeUtil.getDateModelFromDateString(this.objChrtProblemDetail.prob_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    this.problTimeModel = this.dateTimeUtil.getTimeModelFromTimeString(this.objChrtProblemDetail.prob_date, DateTimeFormat.DATEFORMAT_hh_mm_a);

    //(this.problemFormGroup.get("txtIcdCode") as FormControl).setValue(this.diagCode);
    (this.problemFormGroup.get("txtIcdDescription") as FormControl).setValue(this.diagDescription);

    //(this.problemFormGroup.get("txtProblemSearch") as FormControl).setValue(this.diagDescription);
    (this.problemFormGroup.get("dpProblemDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.objChrtProblemDetail.prob_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a));
    (this.problemFormGroup.get("tpProblemTime") as FormControl).setValue(this.dateTimeUtil.getTimeModelFromTimeString(this.objChrtProblemDetail.prob_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a));
    (this.problemFormGroup.get("codeType") as FormControl).setValue(this.objChrtProblemDetail.code_type);
    (this.problemFormGroup.get("txtComments") as FormControl).setValue(this.objChrtProblemDetail.comments);
    (this.problemFormGroup.get("cmbStatus") as FormControl).setValue(this.objChrtProblemDetail.status);
    (this.problemFormGroup.get("cmbProbType") as FormControl).setValue(this.objChrtProblemDetail.problem_type);


    if (this.objChrtProblemDetail.status == "Resolved") {
      this.problDateResolvedModel = this.dateTimeUtil.getDateModelFromDateString(this.objChrtProblemDetail.resolved_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
      this.problTimeResolvedModel = this.dateTimeUtil.getTimeModelFromTimeString(this.objChrtProblemDetail.resolved_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
    }
    else if (this.objChrtProblemDetail.status == "Completed") {
      this.problDateResolvedModel = this.dateTimeUtil.getDateModelFromDateString(this.objChrtProblemDetail.resolved_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
      this.problTimeResolvedModel = undefined;
    }
    else {
      this.problDateResolvedModel = undefined;
      this.problTimeResolvedModel = undefined;
    }

    (this.problemFormGroup.get("dpDateResolved") as FormControl).setValue(this.problDateResolvedModel);
    (this.problemFormGroup.get("tpTimeResolved") as FormControl).setValue(this.problTimeResolvedModel);

    this.isEducationProvided = this.objChrtProblemDetail.education_provided;
    let condition = undefined;
    if (this.objChrtProblemDetail.chronic) {
      condition = "chronic";
    }
    else if (this.objChrtProblemDetail.acute) {
      condition = "accute";
    }
    else if (this.objChrtProblemDetail.screening) {
      condition = "screening";
    }
    (this.problemFormGroup.get("rbCondition") as FormControl).setValue(condition);

    (this.problemFormGroup.get("rbType") as FormControl).setValue(this.objChrtProblemDetail.diag_type);
    (this.problemFormGroup.get("chkPrimary") as FormControl).setValue(this.objChrtProblemDetail.primary_diag);




  }


  cancelAddEdit() {
    this.addEditView = false;
  }
  saveProblem(formValue) {


    debugger;

    if (this.diagCode == undefined || this.diagCode == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Save Problem", "Please enter Diagnose", AlertTypeEnum.DANGER)
      return;
    }

    //this.addEditView = false;
    let ormMChartProblem: ORMSaveChartProblem = new ORMSaveChartProblem();


    if (this.addEditOption == "add") {
      ormMChartProblem.chart_id = Number(this.objencounterToOpen.chart_id);
      ormMChartProblem.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      ormMChartProblem.created_user = this.lookupList.logedInUser.user_name;
      ormMChartProblem.education_provided = this.isEducationProvided;
    }
    else {
      ormMChartProblem.problem_id = this.objChrtProblemDetail.problem_id;
      ormMChartProblem.chart_id = this.objChrtProblemDetail.chart_id;
      ormMChartProblem.client_date_created = this.objChrtProblemDetail.client_date_created;
      ormMChartProblem.date_created = this.objChrtProblemDetail.date_created;
      ormMChartProblem.created_user = this.objChrtProblemDetail.created_user;
      ormMChartProblem.education_provided = this.isEducationProvided;
    }

    ormMChartProblem.modified_user = this.lookupList.logedInUser.user_name;
    ormMChartProblem.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    ormMChartProblem.patient_id = Number(this.objencounterToOpen.patient_id);
    ormMChartProblem.practice_id = this.lookupList.practiceInfo.practiceId;
    ormMChartProblem.system_ip = this.lookupList.logedInUser.systemIp;
    ormMChartProblem.from_followup = false;



    switch (formValue.rbCondition) {
      case "chronic":
        ormMChartProblem.chronic = true;
        ormMChartProblem.acute = false;
        ormMChartProblem.screening = false;
        break;
      case "accute":
        ormMChartProblem.chronic = false;
        ormMChartProblem.acute = true;
        ormMChartProblem.screening = false;
        break;
      case "screening":
        ormMChartProblem.chronic = false;
        ormMChartProblem.acute = true;
        ormMChartProblem.screening = false;
        break;

      default:
        ormMChartProblem.chronic = false;
        ormMChartProblem.acute = false;
        ormMChartProblem.screening = false;
        break;
    }


    ormMChartProblem.diag_type = formValue.rbType;
    ormMChartProblem.primary_diag = formValue.chkPrimary;
    debugger;
    let probDateTimeString = this.dateTimeUtil.getStringDateFromDateModel(formValue.dpProblemDate) + ' ' + this.dateTimeUtil.getStringTimeFromTimeModel(formValue.tpProblemTime);
    ormMChartProblem.prob_date = probDateTimeString;

    ormMChartProblem.diag_code = this.diagCode;// formValue.txtIcdCode;
    ormMChartProblem.diag_description = formValue.txtIcdDescription;
    ormMChartProblem.code_type = this.codeType;

    ormMChartProblem.comments = formValue.txtComments;
    ormMChartProblem.status = formValue.cmbStatus;
    ormMChartProblem.problem_type = formValue.cmbProbType;


    debugger;
    if ((formValue.cmbStatus == "Resolved" || formValue.cmbStatus == "Completed") && formValue.dpDateResolved != undefined) {
      let resolvedDateTimeString = this.dateTimeUtil.getStringDateFromDateModel(formValue.dpDateResolved) + ' ' + this.dateTimeUtil.getStringTimeFromTimeModel(formValue.tpTimeResolved);
      ormMChartProblem.resolved_date = resolvedDateTimeString;
    }

    // this.encounterService.savePatientProblem(ormMChartProblem)
    this.encounterService.savePatientProblem(ormMChartProblem).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.addEditView = false;
          this.getChartProblem(this.dataOption);
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {

          this.showError(data['response']);
        }
      },
      error => {
        this.showError("An error occured while saving Patient Problem.");
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


  onDelete(record) {


    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = record.problem_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteProblem(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Problem Status Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.ngbModal.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter Problem"
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
      this.getChartProblem(this.dataOption);

    }
  }
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true,
    size: 'lg'
  };
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showHistory() {
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "patient_problem_log";
    logParameters.logDisplayName = "Patient Problem Log";
    logParameters.logMainTitle = "Patient Problem Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;

    logParameters.lstOtherCriteria = lstOtherCriteria

    const modalRef = this.ngbModal.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;

  }
  onRadioListChange(event) {
    debugger;
    this.dataOption = event;
    this.showDiagSearch = false;
    if (this.problemFormGroup.get("txtProblemSearch").value != null && this.problemFormGroup.get("txtProblemSearch").value.length > 2) {
      this.sentCriteriatoSearch(this.problemFormGroup.get("txtProblemSearch").value);
    }
  }
  sentCriteriatoSearch(value) {
    debugger;
    this.diagSearchCriteria = new DiagSearchCriteria();

    if (this.problemFormGroup.get("rbList").value == "mylist") {
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
  onEducationClick() {

    //var file = new Blob([data], { type: file_type });//, {type: 'application/pdf'}
    //var fileURL = URL.createObjectURL(file);

    //let path = fileURL;
    // var myWindow = window.open('', '', 'width=810,height=600,resizable=1');
    // myWindow.document.title = "new title";
    // myWindow.document.write("<title>IHC Document Viewer</title><iframe  src='" + path + "' width='100%' height='100%' frameborder='0' > </iframe>");
    // myWindow.focus()


    // this.doc_path = path;
    // this.current_url=this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc_path)
    if (this.diagCode != null && this.diagCode != '') {
      var URL: string = "";
      if (this.codeType == "ICD-10")
        URL = "http://apps2.nlm.nih.gov/medlineplus/services/mpconnect.cfm?mainSearchCriteria.v.c=" + this.diagCode + "&mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&informationRecipient.languageCode.c=en";
      else
        URL = "http://apps2.nlm.nih.gov/medlineplus/services/mpconnect.cfm?mainSearchCriteria.v.c=" + this.diagCode + "&mainSearchCriteria.v.cs=2.16.840.1.113883.6.96&informationRecipient.languageCode.c=en";
      // else 
      // {
      // 	isEducationProvided = false;
      // 	return;
      // }

      window.open(URL, '_blank');
      this.isEducationProvided = true;
    }
  }
  discussWithPatient(row) {
    debugger;
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Discuss with Patient !';
    modalRef.componentInstance.promptMessage = 'Current problem is discuss with Patient ?';
    modalRef.componentInstance.alertType = 'info';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "problem_id", value: row.problem_id, option: "" }
        ];
        this.encounterService.MoveProblemToCurrent(searchCriteria)
          .subscribe(
            data => {
              debugger
              if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
                this.insertAssessment(row);
              }
            }, error => {
              this.showError("An error occured while update Problems to Current.");
            }
          );
      }
    }, (reason) => {
      //alert(reason);
    });

  }
  insertAssessment(row) {
    let ormPMHObj: ORMSaveAssessments = new ORMSaveAssessments();
    ormPMHObj.id = null;
    ormPMHObj.patient_id = this.objencounterToOpen.patient_id.toString();
    ormPMHObj.chart_id = this.objencounterToOpen.chart_id.toString();
    ormPMHObj.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    ormPMHObj.code = row.diag_code;
    ormPMHObj.description = row.diag_description;
    ormPMHObj.date = row.prob_date;
    ormPMHObj.notes = row.comments;
    ormPMHObj.created_user = this.lookupList.logedInUser.user_name;
    ormPMHObj.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    ormPMHObj.date_created = "";
    ormPMHObj.modified_user = this.lookupList.logedInUser.user_name;
    ormPMHObj.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    ormPMHObj.date_modified = "";
    ormPMHObj.system_ip = this.lookupList.logedInUser.systemIp;
    this.encounterService.savePatientAssessments(ormPMHObj).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.getChartProblem("active");
        }
      },
      error => {
        this.showError("An error occured while save Problems to PMH.");
      }
    );
  }
  ProbDiscussed(obj) {
    debugger;
    // let dtCompareResult: number = this.dateTimeUtil.compareDate(this.visitDateforDiscuss, obj.prob_date, DateTimeFormat.DATEFORMAT_YYYY_MM_DD_hh_mm_a);
    // if (dtCompareResult > 0) {

    // }
    let visit_Date: Date;
    visit_Date = this.dateTimeUtil.getDateTimeFromString(this.objencounterToOpen.visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);

    let prob_Date: Date;
    prob_Date = this.dateTimeUtil.getDateTimeFromString(obj.prob_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
    if (prob_Date < visit_Date) {
      return true;
    }
    else
      return false;

  }
  arrDetailSave: Array<ORMMyListICD> = new Array;
  onAddToMyList() {
    debugger;
    this.arrDetailSave = new Array;
    let objORMMylist_icd: ORMMyListICD;

    objORMMylist_icd = new ORMMyListICD();
    objORMMylist_icd.id = "";
    objORMMylist_icd.diag_code = this.diagCode; //this.problemFormGroup.get("txtIcdCode").value;
    objORMMylist_icd.diag_description = this.problemFormGroup.get("txtIcdDescription").value//this.diagDescription;
    objORMMylist_icd.expiry_date = "";
    objORMMylist_icd.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    objORMMylist_icd.provider_id = this.objencounterToOpen.provider_id.toString();
    objORMMylist_icd.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    objORMMylist_icd.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    objORMMylist_icd.modified_user = this.lookupList.logedInUser.user_name;
    objORMMylist_icd.created_user = this.lookupList.logedInUser.user_name;

    this.arrDetailSave.push(objORMMylist_icd);

    if (this.arrDetailSave.length > 0) {
      this.setupService.saveSetupMyListICD(this.arrDetailSave).subscribe(
        data => {
          debugger;

        },
        error => {
        }
      );
    }
    this.showAddtoMylistButton = false;
  }

  onRemoveDiagnosis() {
    this.diagCode = '';
    this.diagDescription = '';
    (this.problemFormGroup.get("txtIcdDescription") as FormControl).setValue(this.diagDescription);
  }


}