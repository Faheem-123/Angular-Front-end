import { Component, OnInit, Input, Inject } from '@angular/core';
import { LabService } from 'src/app/services/lab/lab.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMLabOrderAttachment } from 'src/app/models/lab/ORMLabOrderAttachment';
import { ORMAddDocument } from 'src/app/models/patient/ORMAddDocument';
import { GeneralService } from 'src/app/services/general/general.service';
import { ORMLabOrderAttachmentComments } from 'src/app/models/lab/ORMLabOrderAttachmentComments';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';

@Component({
  selector: 'lab-attachment',
  templateUrl: './lab-attachment.component.html',
  styleUrls: ['./lab-attachment.component.css']
})
export class LabAttachmentComponent implements OnInit {
  @Input() order_Id;
  @Input() patient_Id;

  addEditView;
  operation = '';
  lstOrderTest;
  lstTestAttachment;
  lstStaffNotes;
  SelectedTestObj;
  SelectedAttachmentObj;
  inputForm: FormGroup;
  fileAttached: any;
  objAttachment: ORMLabOrderAttachment;
  objNewDoc: ORMAddDocument;
  downloadPath;
  canView: boolean = false;
  canAddEdit: boolean = false;
  canSign: boolean = false;
  objattachmentComment: ORMLabOrderAttachmentComments = null;
  constructor(private labService: LabService, private logMessage: LogMessage, private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private modalService: NgbModal, private generalService: GeneralService
    , private generalOperation: GeneralOperation) {
    this.canView = this.lookupList.UserRights.lab_attachment_view;
    this.canAddEdit = this.lookupList.UserRights.lab_attachment_edit;
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
      txtDocumentName: this.formBuilder.control("", Validators.required),
      chkAllTestAttachment: this.formBuilder.control("", Validators.required),
      txtPhysicianNotes: this.formBuilder.control("", Validators.required),
      chkAlert: this.formBuilder.control("", Validators.required),
      txtStaffNotes: this.formBuilder.control("", Validators.required),
      drpAssigned: this.formBuilder.control("", Validators.required),
      drpFollowUp: this.formBuilder.control("", Validators.required),
      drpFollowUpaction: this.formBuilder.control("", Validators.required),
      txtFile: this.formBuilder.control(null),
    })
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

  saveAttachment() {
    //this.objAttachment = new ORMLabOrderAttachment();

    this.objAttachment.order_id = this.order_Id;
    this.objAttachment.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.objAttachment.lab_category_id = this.SelectedTestObj.lab_category_id;

    this.objAttachment.followup_note = this.inputForm.get("drpFollowUp").value;
    this.objAttachment.assigned_to = this.inputForm.get("drpAssigned").value;
    this.objAttachment.system_ip = this.lookupList.logedInUser.systemIp;
    debugger;
    if (this.inputForm.get("chkAllTestAttachment").value == true) {
      this.objAttachment.test_id = "-1";
    }
    else
      this.objAttachment.test_id = this.SelectedTestObj.test_id;

    this.objAttachment.deleted = false;
    this.objAttachment.physician_comments = this.inputForm.get("txtPhysicianNotes").value;
    if (this.operation == "New") {
      this.objAttachment.patient_order_attachment_id = "";
      //this.objAttachment.patient_document_id="";

      this.objAttachment.created_user = this.lookupList.logedInUser.userLName;
      this.objAttachment.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.objAttachment.modified_user = this.lookupList.logedInUser.userLName;
      this.objAttachment.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

      if (this.inputForm.get("txtPhysicianNotes").value != "")
        this.objAttachment.phy_comments_date = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else {
      this.objAttachment.patient_order_attachment_id = this.SelectedAttachmentObj.patient_order_attachment_id;
      this.objAttachment.patient_document_id = this.SelectedAttachmentObj.patient_document_id;

      this.objAttachment.reviewed_by = this.SelectedAttachmentObj.reviewed_by;
      this.objAttachment.reviewed_date = this.SelectedAttachmentObj.reviewed_date;
      this.objAttachment.created_user = this.SelectedAttachmentObj.created_user;
      this.objAttachment.client_date_created = this.SelectedAttachmentObj.client_date_created;
      this.objAttachment.date_created = this.SelectedAttachmentObj.date_created;

      if (this.inputForm.get("txtPhysicianNotes").value != "" && this.inputForm.get("txtPhysicianNotes").value != this.SelectedAttachmentObj.physician_comments)
        this.objAttachment.phy_comments_date = this.dateTimeUtil.getCurrentDateTimeString();
      else
        this.objAttachment.phy_comments_date = this.SelectedAttachmentObj.phy_comments_date;

      this.objAttachment.modified_user = this.lookupList.logedInUser.userLName;
      this.objAttachment.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    }

    if (this.operation == "sign") {
      this.objAttachment.reviewed_by = this.lookupList.logedInUser.userLName;
      this.objAttachment.reviewed_date = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else if (this.operation == "delete") {
      this.objAttachment.deleted = true;
    }
    debugger;
    if (this.inputForm.get("txtStaffNotes").value != null && this.inputForm.get("txtStaffNotes").value != '') {
      this.saveComments(this.inputForm.get("txtStaffNotes").value);
    }

    const formData: FormData = new FormData();
    {
      formData.append('attData', JSON.stringify(this.objAttachment));
    }
    formData.append('comData', JSON.stringify(this.objattachmentComment));

    this.labService.saveLabAttachment(formData)
      .subscribe(
        data => {
          this.getTestResult(this.SelectedTestObj.test_id)
          this.enableDisableControls(false);
          this.addEditView = false;
        },
        error => alert(error),
        () => this.logMessage.log("Order Attachment Save Successfull.")
      );
  }
  onShowValidationPopUp(message_heading: string, message_Body: string, message_type: string) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = message_heading
    modalRef.componentInstance.promptMessage = message_Body;
    modalRef.componentInstance.alertType = message_type;
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  onSaveClick() {
    if (this.validation() == true) {
      this.objAttachment = new ORMLabOrderAttachment;
      if (this.fileAttached != undefined) {
        this.saveDocument();
      }
      else {
        this.saveAttachment();
      }
    }
  }
  validation(): boolean {
    if (this.inputForm.get("txtDate").value == null || this.inputForm.get("txtDate").value == '') {
      this.onShowValidationPopUp('Patient Order Attachment Validation', 'Please Enter Document Date.', 'warning');
      return false;
    }
    if (this.operation == "New" && this.fileAttached == null) {
      this.onShowValidationPopUp('Patient Order Attachment Validation', 'Please select File to Upload.', 'warning');
      return false;
    }

    return true;
  }
  saveComments(cmnt) {
    this.objattachmentComment = new ORMLabOrderAttachmentComments();
    this.objattachmentComment.comment_id = "";
    this.objattachmentComment.patient_order_attachment_id = ""//grdAttDetail.selectedItem.patient_order_attachment_id;
    this.objattachmentComment.order_id = this.order_Id;
    this.objattachmentComment.alert = this.inputForm.get("chkAlert").value;
    this.objattachmentComment.comments = cmnt;
    this.objattachmentComment.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    if (this.inputForm.get("chkAllTestAttachment").value == true)
      this.objattachmentComment.test_id = "-1";
    else
      this.objattachmentComment.test_id = this.SelectedTestObj.test_id;
    this.objattachmentComment.deleted = false;
    this.objattachmentComment.created_user = this.lookupList.logedInUser.userLName;
    this.objattachmentComment.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();;
  }
  saveDocument() {

    debugger;

    this.objNewDoc = new ORMAddDocument();
    this.objNewDoc.patient_id = this.patient_Id;
    this.objNewDoc.practice_id = this.lookupList.practiceInfo.practiceId;
    this.objNewDoc.doc_categories_id = this.SelectedTestObj.lab_category_id;
    this.objNewDoc.document_date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtDate").value);

    if (this.operation === "Edit") {
      if (this.fileAttached != null && this.fileAttached != undefined) {
        this.objNewDoc.original_file_name = this.fileAttached.name;
        this.objNewDoc.name = this.fileAttached.name;
      }
      else {
        this.objNewDoc.original_file_name = this.SelectedAttachmentObj.name;
        this.objNewDoc.name = this.SelectedAttachmentObj.name;
        this.objNewDoc.link = this.SelectedAttachmentObj.link;
        this.fileAttached = null;
      }
    }
    else {
      if (this.fileAttached != null && this.fileAttached != undefined) {
        this.objNewDoc.original_file_name = this.fileAttached.name;
        this.objNewDoc.name = this.fileAttached.name;
      }
    }
    this.objNewDoc.doc_type = "lab";
    this.objNewDoc.doc_type_id = this.order_Id;


    this.objNewDoc.modified_user = this.lookupList.logedInUser.user_name;
    this.objNewDoc.client_date_modified = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);

    this.objNewDoc.system_ip = this.lookupList.logedInUser.systemIp;

    if (this.operation === 'New') {
      this.objNewDoc.patient_document_id = undefined;
      this.objNewDoc.created_user = this.lookupList.logedInUser.user_name;
      this.objNewDoc.client_date_created = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
    }
    else {
      this.objNewDoc.patient_document_id = this.SelectedAttachmentObj.patient_document_id;
      this.objNewDoc.created_user = this.SelectedAttachmentObj.doc_created_user;
      this.objNewDoc.client_date_created = this.SelectedAttachmentObj.client_date_created;
      this.objNewDoc.date_created = this.SelectedAttachmentObj.doc_created_date;
    }
    const formData: FormData = new FormData();
    {
      if (this.fileAttached != undefined)
        formData.append('docFile', this.fileAttached);
    }

    formData.append('docData', JSON.stringify(this.objNewDoc));
    formData.append('docCategory', 'PatientDocuments');


    this.generalService.savePatientDocument(formData)
      .subscribe(
        data => this.savedSuccessfull(data),
        error => alert(error),
        () => this.logMessage.log("Document Save Successfull.")
      );

  }
  savedSuccessfull(data) {
    debugger;
    if (data.status === "SUCCESS") {
      this.objAttachment.patient_document_id = data.result.toString();
      this.saveAttachment();
    }
    else {

    }
  }

  onFileChange(event) {
    this.fileAttached = undefined;

    let reader = new FileReader();

    if (event.target.files && event.target.files.length > 0) {
      this.fileAttached = event.target.files[0];
    }

  }
  getViewData() {
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
  onTestClick(obj) {
    this.SelectedTestObj = obj;
    this.getTestResult(obj.test_id);
  }
  getTestResult(test_id) {
    debugger;
    this.labService.getAttachments(test_id, this.order_Id)
      .subscribe(
        data => {
          this.lstTestAttachment = data;
          if (this.lstTestAttachment.length > 0) {
            this.assignValues(this.lstTestAttachment[0]);
          }
          else {
            this.SelectedAttachmentObj = null;
            this.clearFields();
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting getTestSpecimen list specimen.")
        }
      );
  }
  enableDisableControls(value: boolean) {
    if (value == true) {
      this.inputForm.get('txtDate').enable();
      this.inputForm.get('chkAllTestAttachment').enable();
      this.inputForm.get('txtPhysicianNotes').enable();
      this.inputForm.get('chkAlert').enable();
      this.inputForm.get('txtStaffNotes').enable();
      this.inputForm.get('drpAssigned').enable();
      this.inputForm.get('drpFollowUp').enable();
      this.inputForm.get('drpFollowUpaction').enable();
    }
    else {
      this.inputForm.get('txtDate').disable();
      this.inputForm.get('chkAllTestAttachment').disable();
      this.inputForm.get('txtPhysicianNotes').disable();
      this.inputForm.get('chkAlert').disable();
      this.inputForm.get('txtStaffNotes').disable();
      this.inputForm.get('drpAssigned').disable();
      this.inputForm.get('drpFollowUp').disable();
      this.inputForm.get('drpFollowUpaction').disable();
    }
  }
  clearFields() {
    (this.inputForm.get("txtDate") as FormControl).setValue("");
    (this.inputForm.get('chkAllTestAttachment') as FormControl).setValue("");
    (this.inputForm.get('txtPhysicianNotes') as FormControl).setValue("");
    (this.inputForm.get('chkAlert') as FormControl).setValue("");
    (this.inputForm.get('txtStaffNotes') as FormControl).setValue("");
    (this.inputForm.get('drpAssigned') as FormControl).setValue("");
    (this.inputForm.get('txtDocumentName') as FormControl).setValue("");
    (this.inputForm.get('drpFollowUp') as FormControl).setValue("");
    (this.inputForm.get('drpFollowUpaction') as FormControl).setValue("");

  }
  assignValues(obj) {
    this.SelectedAttachmentObj = obj;

    (this.inputForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(obj.document_date.substring(0, 10), DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("txtDocumentName") as FormControl).setValue(obj.name);
    if (obj.test_id == '-1')
      (this.inputForm.get("chkAllTestAttachment") as FormControl).setValue(true);
    else
      (this.inputForm.get("chkAllTestAttachment") as FormControl).setValue(false);

    (this.inputForm.get("txtPhysicianNotes") as FormControl).setValue(obj.physician_comments);
    (this.inputForm.get("drpFollowUp") as FormControl).setValue(obj.followup_note);
    (this.inputForm.get("drpFollowUpaction") as FormControl).setValue(obj.follow_up_action);
    (this.inputForm.get("drpAssigned") as FormControl).setValue(obj.assigned_to);
    //(this.inputForm.get("txtFile") as FormControl).setValue(obj.name);      
  }

  onDelete(obj) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.patient_order_attachment_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.labService.deleteAttachment(deleteRecordData)
          .subscribe(
            data => {
              this.onDeleteSuccessfully(data)
              this.getTestResult(this.SelectedTestObj.test_id);
            },
            error => alert(error),
            () => this.logMessage.log("Attachment Deleted Successfull.")
          );
      }
    }, (reason) => {

    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Attachment"
      modalRef.componentInstance.promptMessage = data.response;

      let closeResult;

      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      //this.getViewData();

    }
  }
  onFollowUpChange(args) {
    if (args.target.options[args.target.selectedIndex].text == 'Follow Up Required') {
      this.inputForm.get('drpFollowUpaction').enable();
    }
    else {
      this.inputForm.get('drpFollowUpaction').disable();
    }
  }
  openDocument() {
    debugger;
    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      let lstDocPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
      if (lstDocPath.length > 0)
        this.downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientDocuments";
      else
        this.downloadPath = '';

      let searchCriteria: SearchCriteria = new SearchCriteria;
      searchCriteria.criteria = this.downloadPath + "/" + this.SelectedAttachmentObj.link;
      this.generalService.downloadFile(searchCriteria)
        .subscribe(
          data => {
            debugger;
            this.downloafileResponse(data, this.SelectedAttachmentObj.link);
          },
          error => alert(error)
        );
    }
  }
  downloafileResponse(data, doc_link) {
    // if (data.byteLength <= 0)
    //   return;
    debugger;
    let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
    let file_type: string = '';
    switch (file_ext.toLowerCase()) {
      case 'png':
        file_type = 'IMAGE/PNG';
        break;
      case 'jpg':
        file_type = 'IMAGE/JPEG';
        break;
      case 'pdf':
        file_type = 'application/pdf';
        break;
      case 'txt':
        file_type = 'text/plain';
        break;
    }
    var file = new Blob([data], { type: file_type });//, {type: 'application/pdf'}
    var fileURL = URL.createObjectURL(file);
    let path = fileURL;
    const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = path;

  }

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
    // size: 'lg'
  };
  onCancel() {
    this.operation = '';
    this.addEditView = false;
    this.enableDisableControls(false);
    this.clearFields();
  }
  notesOperation = '';
  onNotesNew() {
    this.inputForm.get('txtStaffNotes').enable();
    this.inputForm.get('chkAlert').enable();
    this.notesOperation = 'New';
  }
  onNotesSave() {
    let objattachmentComment: ORMLabOrderAttachmentComments = null;
    debugger;
    if (this.inputForm.get("txtStaffNotes").value != "") {
      objattachmentComment = new ORMLabOrderAttachmentComments()
      objattachmentComment.comment_id = "";
      objattachmentComment.patient_order_attachment_id = this.SelectedAttachmentObj.patient_order_attachment_id;
      objattachmentComment.order_id = this.order_Id;

      objattachmentComment.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      objattachmentComment.test_id = this.SelectedTestObj.test_id;
      objattachmentComment.comments = this.inputForm.get("txtStaffNotes").value;
      objattachmentComment.alert = this.inputForm.get("chkAlert").value;
      objattachmentComment.deleted = false;
      objattachmentComment.created_user = this.lookupList.logedInUser.user_name;
      objattachmentComment.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();

      this.labService.saveAttachmentComments(objattachmentComment)
        .subscribe(
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Attachment Notes Save Successfull.")
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
  onSign() {
    debugger;
    if (this.lstTestAttachment == null || this.lstTestAttachment.length == 0) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Sign !';
      modalRef.componentInstance.promptMessage = "There is no attachment to Sign.";
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
}
