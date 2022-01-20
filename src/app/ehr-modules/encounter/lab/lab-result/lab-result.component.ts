import { Component, OnInit, Input, Inject } from '@angular/core';
import { LogMessage } from 'src/app/shared/log-message';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LabService } from 'src/app/services/lab/lab.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ORMLabOrderResult } from 'src/app/models/lab/ORMLabOrderResult';
import { ORMLabResultNotes } from 'src/app/models/lab/ORMLabResultNotes';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { Rptlabresults_Print } from 'src/app/models/lab/Rptlabresults_Print';
import { WrapperLabResultSave } from 'src/app/models/lab/WrapperLabResultSave';

@Component({
  selector: 'lab-result',
  templateUrl: './lab-result.component.html',
  styleUrls: ['./lab-result.component.css']
})
export class LabResultComponent implements OnInit {
  @Input() order_Id;
  @Input() patient_Id;
  addEditView;
  operation = '';

  lstOrderTest;
  lstUnits;
  lstStatus;
  lstRange
  lstStaffNotes
  lstTestResult;
  SelectedTestObj;
  SelectedResultObj;
  inputForm: FormGroup;
  showloincSearch = false;
  searchCriteria: SearchCriteria;
  loincSearchCriteria: string;
  strOperation = '';
  canView: boolean = false;
  canAddEdit: boolean = false;
  canDelete: boolean = false;
  canSign: boolean = false;
  constructor(private logMessage: LogMessage, private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private labService: LabService,
    @Inject(Rptlabresults_Print) private objRptLabResultPrint: Rptlabresults_Print,
    private modalService: NgbModal) {
    this.canView = this.lookupList.UserRights.lab_result_view;
    this.canAddEdit = this.lookupList.UserRights.lab_result_add_modify;
    this.canDelete = this.lookupList.UserRights.lab_result_delete;
    this.canSign = this.lookupList.UserRights.lab_order_sign;
  }

  ngOnInit() {

    this.buildForm();
    if (this.canView) {
      this.getViewData();
    }
    this.enableDisableControls(false);

  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtDate: this.formBuilder.control("", Validators.required),
      drpAssigned: this.formBuilder.control("", Validators.required),
      drpFollowUp: this.formBuilder.control("", Validators.required),
      drpFollowUpaction: this.formBuilder.control("", Validators.required),
      chkChangeMed: this.formBuilder.control("", Validators.required),
      txtResultCode: this.formBuilder.control("", Validators.required),
      txtResultDescription: this.formBuilder.control("", Validators.required),
      txtResultValue: this.formBuilder.control("", Validators.required),
      drpResultUnit: this.formBuilder.control("", Validators.required),
      txtRecomended: this.formBuilder.control("", Validators.required),
      drpResultStatus: this.formBuilder.control("", Validators.required),
      drpAbnormalFlag: this.formBuilder.control("", Validators.required),
      txtCollectionDate: this.formBuilder.control("", Validators.required),
      txtLabNotes: this.formBuilder.control("", Validators.required),
      txtPhysicionNotes: this.formBuilder.control("", Validators.required),
      txtStaffNotes: this.formBuilder.control("", Validators.required),
      chkAlert: this.formBuilder.control("", Validators.required)
    })
  }
  enableDisableControls(value: boolean) {
    if (value == true) {
      this.inputForm.get('txtDate').enable();
      this.inputForm.get('drpAssigned').enable();
      this.inputForm.get('drpFollowUp').enable();
      this.inputForm.get('drpFollowUpaction').enable();
      this.inputForm.get('chkChangeMed').enable();
      this.inputForm.get('txtResultCode').enable();
      this.inputForm.get('txtResultDescription').enable();
      this.inputForm.get('txtResultValue').enable();
      this.inputForm.get('drpResultUnit').enable();
      this.inputForm.get('txtRecomended').enable();
      this.inputForm.get('drpResultStatus').enable();
      this.inputForm.get('drpAbnormalFlag').enable();
      this.inputForm.get('txtCollectionDate').enable();
      this.inputForm.get('txtLabNotes').enable();
      this.inputForm.get('txtPhysicionNotes').enable();
      this.inputForm.get('txtStaffNotes').enable();
      this.inputForm.get('chkAlert').enable();
    }
    else {
      this.inputForm.get('txtDate').disable();
      this.inputForm.get('drpAssigned').disable();
      this.inputForm.get('drpFollowUp').disable();
      this.inputForm.get('drpFollowUpaction').disable();
      this.inputForm.get('chkChangeMed').disable();
      this.inputForm.get('txtResultCode').disable();
      this.inputForm.get('txtResultDescription').disable();
      this.inputForm.get('txtResultValue').disable();
      this.inputForm.get('drpResultUnit').disable();
      this.inputForm.get('txtRecomended').disable();
      this.inputForm.get('drpResultStatus').disable();
      this.inputForm.get('drpAbnormalFlag').disable();
      this.inputForm.get('txtCollectionDate').disable();
      this.inputForm.get('txtLabNotes').disable();
      this.inputForm.get('txtPhysicionNotes').disable();
      this.inputForm.get('txtStaffNotes').disable();
      this.inputForm.get('chkAlert').disable();
    }
  }
  getViewData() {
    debugger;
    this.labService.getResultUnits()
      .subscribe(
        data => {
          this.lstUnits = data;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getResultUnits list Result.")
        }
      );
    this.labService.getResultStatus()
      .subscribe(
        data => {
          this.lstStatus = data;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getResultStatus list Result.")
        }
      );
    this.labService.getResultAbnormalRange()
      .subscribe(
        data => {
          this.lstRange = data;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getResultAbnormalRange list Result.")
        }
      );
    this.labService.getResultStafNotes(this.order_Id)
      .subscribe(
        data => {
          this.lstStaffNotes = data;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getResultStafNotes list Result.")
        }
      );

    this.getResulttest();

  }
  getResulttest() {
    this.labService.getResultTest(this.order_Id)
      .subscribe(
        data => {
          this.lstOrderTest = data;
          if (this.lstOrderTest.length > 0)
            this.onTestClick(this.lstOrderTest[0]);
        },
        error => {
          this.logMessage.log("An Error Occured while getting getResultTest list Result.")
        }
      );
  }
  onTestClick(obj) {
    this.SelectedTestObj = obj;
    this.getTestResult(obj.test_id)
  }
  getTestResult(test_id) {
    this.labService.getTestResult(test_id)
      .subscribe(
        data => {
          this.lstTestResult = data;
          if (this.lstTestResult.length > 0) {
            this.assignValues(this.lstTestResult[0]);
          }
          else {
            this.clearFields();
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting getTestSpecimen list specimen.")
        }
      );
  }
  clearFields() {
    (this.inputForm.get("txtDate") as FormControl).setValue("");

    (this.inputForm.get("drpAssigned") as FormControl).setValue("");
    (this.inputForm.get("drpFollowUp") as FormControl).setValue("");
    (this.inputForm.get("drpFollowUpaction") as FormControl).setValue("");
    (this.inputForm.get("chkChangeMed") as FormControl).setValue(false);
    (this.inputForm.get("txtResultCode") as FormControl).setValue("");
    (this.inputForm.get("txtResultDescription") as FormControl).setValue("");
    (this.inputForm.get("txtResultValue") as FormControl).setValue("");
    (this.inputForm.get("drpResultUnit") as FormControl).setValue("");
    (this.inputForm.get("txtRecomended") as FormControl).setValue("");
    (this.inputForm.get("drpResultStatus") as FormControl).setValue("");
    (this.inputForm.get("drpAbnormalFlag") as FormControl).setValue("");
    (this.inputForm.get("txtCollectionDate") as FormControl).setValue("");
    (this.inputForm.get("txtLabNotes") as FormControl).setValue("");
    (this.inputForm.get("txtPhysicionNotes") as FormControl).setValue("");
    (this.inputForm.get("txtStaffNotes") as FormControl).setValue("");
    (this.inputForm.get("chkAlert") as FormControl).setValue(false);
  }
  assignValues(obj) {
    this.SelectedResultObj = obj;
    (this.inputForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(obj.observation_date.substring(0, 10), DateTimeFormat.DATEFORMAT_MM_DD_YYYY));

    (this.inputForm.get("drpAssigned") as FormControl).setValue(obj.assigned_to);
    (this.inputForm.get("drpFollowUpaction") as FormControl).setValue(obj.follow_up_action);
    (this.inputForm.get("drpFollowUp") as FormControl).setValue(obj.followup_notes);

    (this.inputForm.get("chkChangeMed") as FormControl).setValue(obj.change_med);

    (this.inputForm.get("txtResultCode") as FormControl).setValue(obj.result_code);
    (this.inputForm.get("txtResultDescription") as FormControl).setValue(obj.result_description);
    (this.inputForm.get("txtResultValue") as FormControl).setValue(obj.result_value);
    (this.inputForm.get("drpResultUnit") as FormControl).setValue(obj.result_value_unit);
    (this.inputForm.get("txtRecomended") as FormControl).setValue(obj.recomended_value);
    (this.inputForm.get("drpResultStatus") as FormControl).setValue(obj.result_status_code);
    (this.inputForm.get("drpAbnormalFlag") as FormControl).setValue(obj.abnormal_range_code);
    (this.inputForm.get("txtCollectionDate") as FormControl).setValue(obj.collection_date);
    (this.inputForm.get("txtLabNotes") as FormControl).setValue(obj.lab_comments);
    (this.inputForm.get("txtPhysicionNotes") as FormControl).setValue(obj.physician_comments);
    (this.inputForm.get("txtStaffNotes") as FormControl).setValue("");
    (this.inputForm.get("chkAlert") as FormControl).setValue(false);

  }
  onNew() {
    this.operation = 'New';
    this.addEditView = true;
    this.enableDisableControls(true);
    this.clearFields();

    (this.inputForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
  }
  onEdit() {
    this.operation = 'Edit';
    this.addEditView = true;
    this.enableDisableControls(true);
  }
  onLoincSearchKeydown(value) {
    debugger;
    if (value.length > 2) {
      this.sentCriteriatoSearch(value);
    }
    else {
      this.showloincSearch = false;
    }
  }

  sentCriteriatoSearch(value) {
    this.loincSearchCriteria = value;
    this.showloincSearch = true;
  }
  closeloincSearch() {
    this.loincSearchCriteria = '';
    this.showloincSearch = false;
  }
  onLoincSelect(obj) {
    (this.inputForm.get("txtResultCode") as FormControl).setValue(obj.loinc_code);
    (this.inputForm.get("txtResultDescription") as FormControl).setValue(obj.component);
    this.showloincSearch = false;
  }
  validation() {
    debugger;
    if (this.inputForm.get("txtDate").value == '' || this.inputForm.get("txtDate").value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Patient Order Results', 'Please enter Result Date', 'warning');
      return false;
    }
    if (this.inputForm.get("txtResultValue").value == '') {
      GeneralOperation.showAlertPopUp(this.modalService, 'Patient Order Results', 'Please enter Result Value', 'warning');
      return false;
    }
    return true;
  }
  onSaveClick() {
    debugger;
    if (this.validation() == false)
      return;

    let wrapperLabResultSave: WrapperLabResultSave = new WrapperLabResultSave();

    let objResult: ORMLabOrderResult = new ORMLabOrderResult();
    objResult.patient_id = this.patient_Id;
    objResult.test_id = this.SelectedTestObj.test_id;
    objResult.order_id = this.order_Id;
    objResult.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    objResult.observation_datetime = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtDate").value);
    objResult.result_code = this.inputForm.get("txtResultCode").value;
    objResult.result_description = this.inputForm.get("txtResultDescription").value;
    objResult.result_value = this.inputForm.get("txtResultValue").value;
    objResult.result_value_unit = this.inputForm.get("drpResultUnit").value;
    objResult.recomended_value = this.inputForm.get("txtRecomended").value;
    if (this.inputForm.get("drpResultStatus").value != "") {
      objResult.result_status = new ListFilterPipe().transform(this.lstStatus, "result_status_code", this.inputForm.get("drpResultStatus").value)[0].result_status_description;
      objResult.result_status_code = this.inputForm.get("drpResultStatus").value;
    }
    else {
      objResult.result_status = "";
      objResult.result_status_code = "";
    }
    if (this.inputForm.get("drpAbnormalFlag").value != "") {
      objResult.abnormal_range = new ListFilterPipe().transform(this.lstRange, "range_code", this.inputForm.get("drpAbnormalFlag").value)[0].range_name;
      objResult.abnormal_range_code = this.inputForm.get("drpAbnormalFlag").value;
    }
    else {
      objResult.abnormal_range = "";
      objResult.abnormal_range_code = "";
    }
    objResult.physician_comments = this.inputForm.get("txtPhysicionNotes").value;
    objResult.followup_notes = this.inputForm.get("drpFollowUp").value;
    if (this.inputForm.get("drpFollowUp").value == 'Follow Up Required') {
      objResult.follow_up_action = this.inputForm.get("drpFollowUpaction").value
    }
    else {
      objResult.follow_up_action = '';
    }
    // cmbfollowupaction.selectedIndex == -1 ? null : cmbfollowupaction.selectedItem;

    //objResult.assigned_to = cmbAssignTo.selectedIndex == -1?null:cmbAssignTo.selectedItem.user_name;
    objResult.assigned_to = this.inputForm.get("drpAssigned").value;
    objResult.deleted = false;

    objResult.change_med = this.inputForm.get("chkChangeMed").value;
    objResult.system_ip = this.lookupList.logedInUser.systemIp;
    if (this.operation == "sign") {
      objResult.reviewed_by = this.lookupList.logedInUser.userLName;
      objResult.reviewed_date = this.dateTimeUtil.getCurrentDateTimeString();

      objResult.result_id = this.SelectedResultObj.result_id;
      objResult.created_user = this.SelectedResultObj.created_user;
      objResult.client_date_created = this.SelectedResultObj.client_date_created;
      objResult.date_created = this.SelectedResultObj.date_created;
      objResult.test_id = this.SelectedResultObj.test_id;

      objResult.modified_user = this.lookupList.logedInUser.userLName;
      objResult.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    }
    else if (this.operation == "New") {
      objResult.result_id = "";
      objResult.created_user = this.lookupList.logedInUser.userLName;
      objResult.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      objResult.modified_user = this.lookupList.logedInUser.userLName;
      objResult.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      //	objResult.education_provided=isEducationProvided;


      if (this.inputForm.get("txtPhysicionNotes").value != "")
        objResult.phy_comments_date = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else {
      objResult.result_id = this.SelectedResultObj.result_id;
      objResult.created_user = this.SelectedResultObj.created_user;
      objResult.client_date_created = this.SelectedResultObj.client_date_created;
      objResult.date_created = this.SelectedResultObj.date_created;
      objResult.test_id = this.SelectedResultObj.test_id;

      objResult.modified_user = this.lookupList.logedInUser.userLName;
      objResult.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

      objResult.reviewed_by = this.SelectedResultObj.reviewed_by;
      objResult.reviewed_date = this.SelectedResultObj.reviewed_date;
      objResult.education_provided = this.SelectedResultObj.education_provided;

      if (this.inputForm.get("txtPhysicionNotes").value != "" && this.inputForm.get("txtPhysicionNotes").value != this.SelectedResultObj.physician_comments)
        objResult.phy_comments_date = this.dateTimeUtil.getCurrentDateTimeString();
      else
        objResult.phy_comments_date = this.SelectedResultObj.phy_comments_date;
    }
    if (this.operation == "delete") {
      objResult.deleted = true;
    }

   
    wrapperLabResultSave.objLabResultSave = objResult;
    
    let objResultNotes: ORMLabResultNotes = undefined;
    debugger;
    if (this.inputForm.get("txtStaffNotes").value != "") {
      objResultNotes = new ORMLabResultNotes()
      //objResultNotes = new ORMLabResultNotes();
      objResultNotes.notes_id = "";

      if (this.operation == "New")
        objResultNotes.result_id = "";
      else
        objResultNotes.result_id = objResult.result_id;

      objResultNotes.order_id = this.order_Id;

      objResultNotes.test_id = this.SelectedTestObj.test_id;

      objResultNotes.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      objResultNotes.test_id = this.SelectedTestObj.test_id;
      objResultNotes.notes = this.inputForm.get("txtStaffNotes").value;
      objResultNotes.alert = this.inputForm.get("chkAlert").value;
      objResultNotes.deleted = false;
      objResultNotes.created_user = this.lookupList.logedInUser.user_name;
      objResultNotes.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();

      wrapperLabResultSave.labNotes = objResultNotes;
    }

   
    //const formData: FormData = new FormData();
    //{
    //  formData.append('resultData', JSON.stringify(objResult));
   // }
    //formData.append('notesData', JSON.stringify(objResultNotes));


    if(objResult.followup_notes!=this.SelectedResultObj.followup_notes){
      wrapperLabResultSave.followUpDetails= "By "+ this.lookupList.logedInUser.userFName.toUpperCase()+' '+ this.lookupList.logedInUser.userLName.toUpperCase()+ " ("+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)+")";							
    }
  
    


      this.labService.saveResultData(wrapperLabResultSave).subscribe(
        data => {
          if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
            this.enableDisableControls(false);
            for (let a = 0; a < this.lstOrderTest.length; a++) {
              if (this.SelectedTestObj.test_id == this.lstOrderTest[a].test_id
                && this.lstOrderTest[a].result_id == null) {
                this.lstOrderTest[a].result_id = data['result'];
              }
            }
            this.getTestResult(this.SelectedTestObj.test_id);
            this.addEditView = false;
          }
          else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
            this.showError(data['response']);
          }
        },
        error => {
          this.showError("An error occured while saving saveResultData.");
        }
      );
    // this.labService.saveResults(objResult).subscribe(
    //   data => {
    //     if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
    //       this.enableDisableControls(false);
    //       this.getTestResult(this.SelectedTestObj.test_id);
    //       this.addEditView=false;
    //     }
    //     else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) 
    //     {
    //       this.showError(data['response']);
    //     }
    //   },
    //   error => {
    //     this.showError("An error occured while saving Lab specimen.");
    //   }
    // );

  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
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
  onDelete(obj) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.result_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.labService.deleteResults(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Result Deleted Successfull.")
          );
      }
    }, (reason) => {

    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Result "
      modalRef.componentInstance.promptMessage = data.response;

      let closeResult;

      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) {

        }
      }
        , (reason) => {
        });
    }
    else {
      //this.getViewData();
      this.getResulttest();

    }
  }
  onFollowUpChange(args) {
    if (args.target.options[args.target.selectedIndex].text == 'Follow Up Required') {
      this.inputForm.get('drpFollowUpaction').enable();
    }
    else {
      this.inputForm.get('drpFollowUpaction').setValue('');
      this.inputForm.get('drpFollowUpaction').disable();
    }
  }

  onSign() {
    debugger;
    if (this.lstTestResult == null || this.lstTestResult.length == 0) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Sign !';
      modalRef.componentInstance.promptMessage = "There is no result to Sign.";
      modalRef.componentInstance.alertType = 'warning';
      return;
    }
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Sign !';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to Sign the selected Order ?';
    modalRef.componentInstance.alertType = 'info';
    let closeResult;

    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "order_id", value: this.order_Id, option: "" }
        ];
        this.labService.signLabOrder(searchCriteria).subscribe(
          data => {
            const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
            modalRef.componentInstance.promptHeading = 'Confirm Sign !';
            modalRef.componentInstance.promptMessage = "Patient Order Sign Successfully";
            modalRef.componentInstance.alertType = 'info';
          },
          error => {
            this.logMessage.log("signLabOrder " + error);
          }
        );
      }
    }, (reason) => {
      //alert(reason);
    });

  }
  onCancel() {
    this.operation = '';
    this.addEditView = false;
    this.enableDisableControls(false);
    this.clearFields();
    if (this.lstTestResult.length > 0) {
      this.assignValues(this.lstTestResult[0]);
    }
  }

  printLabResult() {
    this.objRptLabResultPrint.order_id = this.order_Id;
    this.objRptLabResultPrint.getLabResultRpt();
  }

  notesOperation = '';
  onNotesNew() {
    this.inputForm.get('txtStaffNotes').enable();
    this.inputForm.get('chkAlert').enable();
    this.notesOperation = 'New';
  }
  onNotesSave() {
    let objResultNotes: ORMLabResultNotes = null;
    debugger;
    if (this.inputForm.get("txtStaffNotes").value != "") {
      objResultNotes = new ORMLabResultNotes()
      objResultNotes.notes_id = "";
      objResultNotes.result_id = this.SelectedResultObj.result_id;
      objResultNotes.order_id = this.order_Id;

      objResultNotes.test_id = this.SelectedTestObj.test_id;

      objResultNotes.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      objResultNotes.test_id = this.SelectedTestObj.test_id;
      objResultNotes.notes = this.inputForm.get("txtStaffNotes").value;
      objResultNotes.alert = this.inputForm.get("chkAlert").value;
      objResultNotes.deleted = false;
      objResultNotes.created_user = this.lookupList.logedInUser.user_name;
      objResultNotes.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();

      this.labService.saveResultComments(objResultNotes)
        .subscribe(
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Result Note Save Successfull.")
        );
    }
    else {
      GeneralOperation.showAlertPopUp(this.modalService, 'Staff Notes Validation', 'Please enter Notes First', 'warning')
      return;
    }

    this.inputForm.get('txtStaffNotes').disable();
    this.inputForm.get('chkAlert').disable();
    this.notesOperation = '';
    this.labService.getResultStafNotes(this.order_Id)
      .subscribe(
        data => {
          this.lstStaffNotes = data;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getResultStafNotes list Result.")
        }
      );
  }
}
