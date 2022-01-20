import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { CustomValidators } from 'src/app/shared/custome-validators';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { MessagesService } from 'src/app/services/messages/messages.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { validateConfig } from '@angular/router/src/config';
import { AddToCorrespondenceComponent } from '../add-to-correspondence/add-to-correspondence.component';
import { ORMPatientMessage } from 'src/app/models/messages/ORMPatientMessage';
import { ORMPatientMessageDetail } from 'src/app/models/messages/ORMPatientMessageDetail';
import { WrapperPatientMessage } from 'src/app/models/patient/WrapperPatientMessage';
import * as Quill from 'quill';
import { debug } from 'util';
import { ORMMessageAttachment } from 'src/app/models/messages/ORMMessageAttachment';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { DocumentViewerComponent } from '../../../general-modules/document-viewer/document-viewer.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { PatientMsgUserRecipientComponent } from '../patient-msg-user-recipient/patient-msg-user-recipient.component';
import { UniquePipe } from 'src/app/shared/unique-pipe';

@Component({
  selector: 'patient-message',
  templateUrl: './patient-message.component.html',
  styleUrls: ['./patient-message.component.css']
})
export class PatientMessageComponent implements OnInit {
  @Output() BackToMainMessage = new EventEmitter<any>();
  searchPHRMessagesForm: FormGroup;
  patientMsgComposeForm: FormGroup;
  quilComposeMessageEdit: FormGroup;
  //rdobtn: FormGroup;
  dataOption = 'inbox';
  showPatientSearch: boolean = false;
  showPatientSearchTo: boolean = false;
  selectedPatientID: string;
  selectedPatientIDTo: string;
  patientName: string;
  patientNameTo: string;
  patientId: number;
  patientIdTo: number;
  patientMsgList: Array<any>;
  patientMsgListFilter: Array<any>;
  rdoChangedValue: string = "inbox";
  showHideFunctionButton;
  selectedRowDelete;
  objFrom; objSent; objTo; objCC; objSubject; //objTextMessage;
  to_User;
  cc_User;
  draft_id;

  msg_selected_body;
  txt_Msg_Body;
  txt_Pat_Name;
  txt_Pat_ID;
  txt_msg_ID;
  patientMessageFormView: FormGroup;
  public patientMessageView: AbstractControl;
  public txtMessageEditTo: AbstractControl;
  // //quilPatientMessageView: FormGroup;
  // //public txtPatientMessageView: AbstractControl;
  // //public txtPatientMessageEdit: AbstractControl;

  // //quilPatientMessageEdit: FormGroup;
  messageID;
  messageDetailID;
  // showHideEditor: Boolean = false; // show hide view and edit editors.
  strOperation;
  patientMessageStatus: Array<ORMKeyValue> = [];
  amendmentMsg;
  showAlert: Boolean = false;
  value;
  patMsgAttachmentsList: Array<any>;
  patMsgLinksList: Array<any>;

  // attachmentsList: Array<any>;
  // linksList: Array<any>;

  selectedPatID; // to open a patient
  selectedPatName; // to open patient name
  rdoselectedOption;
  showComposeMsg: Boolean = false;
  fileAttached;
  arrDetailsMessages;
  objMessage: ORMPatientMessage = new ORMPatientMessage();
  objMessageDetail: ORMPatientMessageDetail = new ORMPatientMessageDetail();
  objMessageDetailAut: ORMPatientMessageDetail = new ORMPatientMessageDetail();
  objMsgAttachment: ORMMessageAttachment = new ORMMessageAttachment();
  isEdit: Boolean = false;
  isReply: Boolean = false;
  replyEditable: Boolean = false;
  is_attachment: Boolean = false;
  //selectedPhrUser = "demoa";
  selectedPhrUser;
  selectedPhrUserID;
  acAttachmentPath;
  radioForm: FormGroup;
  saveDetailsMessages: Array<any>;
  objToRecvID: Array<any>;
  arrSplitUserByComa: Array<any>;
  arrDistUser: Array<any>;

  lgPopupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  public listTo: any[] = [{ usersTo: [{ id: '', name: '', user_id: '' }] }];
  //public replyMsg: any[] = [{ usersTo: [{ user_to: '' }], msgSubj: [{ msg_subj: '' }], msgText: [{ msg_text: '' }], type: [{ action_type: '' }], msgId: [{ msg_id: '' }], sender: [{ name: '' }] }];
  // msg_detail_from;
  // msg_detail_to;
  // msg_detail_subject;
  // msg_detail_body;
  // msg_detail_date;

  replySubject;
  replyPatientName;
  replyPatientID;
  replySentDate;
  replyTo;
  dateModel;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private messageService: MessagesService,
    private formBuilder: FormBuilder,
    private openModuleService: OpenModuleService,
    private general: GeneralOperation,
    private domSanitizer: DomSanitizer,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    private generalService: GeneralService) {
    this.patientMessageFormView = formBuilder.group({
      'patientMessageView': [''],
    });
    this.patientMessageView = this.patientMessageFormView.controls['patientMessageView'];



    this.quilComposeMessageEdit = formBuilder.group({
      'txtMessageEditTo': [''],
    });

    this.txtMessageEditTo = this.quilComposeMessageEdit.controls['txtMessageEditTo'];

    // // this.quilPatientMessageView = formBuilder.group({
    // //   'txtPatientMessageView': [''],
    // // });
    // // this.txtPatientMessageView = this.quilPatientMessageView.controls['txtPatientMessageView'];
    // //this.quilPatientMessageEdit = formBuilder.group({
    // //  'txtPatientMessageEdit': [''],
    // // });
    // // this.txtPatientMessageEdit = this.quilPatientMessageEdit.controls['txtPatientMessageEdit'];
  }

  ngOnInit() {
    this.buildForm();

    this.onGetPatientMessage();
    //var acAttachmentPath = this.general.filterArray(this.lookupList.lstdocumentPath, "category_name", "Messages");
    debugger;
    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      let lstDocPath = this.general.filterArray(this.lookupList.lstdocumentPath, "category_name", "Messages");
      if (lstDocPath.length > 0)
        this.acAttachmentPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//Messages";
      else
        this.acAttachmentPath = '';
    }
    this.dateModel = this.dateTimeUtil.getCurrentDateModel();
    (this.searchPHRMessagesForm.get('dateFrom') as FormControl).setValue(this.dateModel);
    (this.searchPHRMessagesForm.get('dateTo') as FormControl).setValue(this.dateModel);


  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  poupUpOptionssm: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'sm'
  };
  sendReceive() {
    this.discardPatMsgT();
    this.onGetPatientMessage();
  }
  getProviderList() {
    this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lookupList.providerList = data as Array<any>;
      },
      error => {
        this.getProviderListError(error);
      }
    );
  }
  getProviderListError(error) {
    this.logMessage.log("getProviderList Error." + error);
  }

  buildForm() {
    this.searchPHRMessagesForm = this.formBuilder.group({
      txtPatientSearch: this.formBuilder.control(null),
      cmbProvider: this.formBuilder.control(null),
      dateFrom: this.formBuilder.control(null, Validators.required),
      dateTo: this.formBuilder.control(null, Validators.required)
    }),
      // {
      //   validator: Validators.compose([
      //     CustomValidators.validDate('dateFrom', false),
      //     CustomValidators.validDate('dateTo', true)
      //   ])
      // },
      this.patientMsgComposeForm = this.formBuilder.group({
        txtPatientSearchTo: this.formBuilder.control(null),
        txtRecipientTo: this.formBuilder.control(""),
        txtSubjectTo: this.formBuilder.control(null),
        attachFile: this.formBuilder.control(null),
        cmbProviderTo: this.formBuilder.control(null)
        //chkPatient: this.formBuilder.control(null),
        //chkAuthRep: this.formBuilder.control(null)
      });

    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control('Inbox')
    })
    //this.rdobtn = this.formBuilder.group({

    // })
  }

  onGetPatientMessage() {
    debugger;
    this.messageService.onGetPatientMessage(this.lookupList.logedInUser.userId.toString(), this.lookupList.practiceInfo.practiceId.toString())
      .subscribe(
        data => {
          debugger;
          this.patientMsgList = data as Array<any>;
          this.onOptionChange('inbox');

          if (this.patientMsgList.length > 0)
            this.onPatMessageSelect(this.patientMsgList[0]);

          //this.onOptionChange(this.rdoChangedValue);
        },
        error => {
          this.logMessage.log("An Error Occured while getting onGetPatientMessage list.")
        }
      );
  }

  //#region  patientsearch
  // pateint search start
  onPatientSearchKeydown(event) {

    if (event.key === "Enter") {
      this.showPatientSearch = true;
    } else if (event.key == "Backspace") {
      this.showPatientSearch = false;
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientID = null;
      (this.searchPHRMessagesForm.get("mainPatientSearch") as FormControl).setValue(null);
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {

    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {
      this.patientId = undefined;
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientID = null;
    }
  }
  onPatientSearchBlur() {

    this.logMessage.log("onPatientSearchBlur");
    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      (this.searchPHRMessagesForm.get("txtPatientSearch") as FormControl).setValue(null);
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientID = null;
    }
  }
  openSelectPatient(patObject) {

    this.logMessage.log(patObject);
    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Patient Message"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;
      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) {
          this.closePatientSearch();
        }
      }
        , (reason) => {
          //alert(reason);
        });
      return;
    }
    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;
    //(this.searchLettersForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    this.selectedPatientID = this.patientId.toString();
    (this.searchPHRMessagesForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);
    this.showPatientSearch = false;
  }
  closePatientSearch() {

    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  //patient search end
  //#endregion patientserach

  clearSearchForm() {

    this.patientId = undefined;
    this.patientName = "";
    (this.searchPHRMessagesForm.get('dateFrom') as FormControl).setValue("");
    (this.searchPHRMessagesForm.get('dateTo') as FormControl).setValue("");
    (this.searchPHRMessagesForm.get('txtPatientSearch') as FormControl).setValue("");
    (this.searchPHRMessagesForm.get('cmbProvider') as FormControl).setValue("");

    // (this.searchPHRMessagesForm.get("txtPatientSearch")as FormControl).setValue("");
    // (this.searchPHRMessagesForm.get("cmbreport")as FormControl).setValue("");
    // (this.searchPHRMessagesForm.get("dateFrom")as FormControl).setValue("");
    // (this.searchPHRMessagesForm.get("dateTo")as FormControl).setValue("");
  }

  searchPatientMSG(values) {
    if (this.patientId == undefined || this.patientId == null && (this.searchPHRMessagesForm.get('dateTo') as FormControl).value == "" && (this.searchPHRMessagesForm.get('dateTo') as FormControl).value == "") {
      alert("Please select any criteria for search.");
      return;
    }
    this.clearAll();
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];

    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel((this.searchPHRMessagesForm.get('dateFrom') as FormControl).value);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel((this.searchPHRMessagesForm.get('dateTo') as FormControl).value);
    searchCriteria.param_list.push({ name: "sender_id", value: this.lookupList.logedInUser.userId, option: "" });
    searchCriteria.param_list.push({ name: "PatientID", value: this.patientId, option: "" });
    searchCriteria.param_list.push({ name: "cmbProvider", value: (this.searchPHRMessagesForm.get('cmbProvider') as FormControl).value, option: "" });
    searchCriteria.param_list.push({ name: "dateFrom", value: vardateFrom, option: "" });
    searchCriteria.param_list.push({ name: "dateTo", value: vardateTo, option: "" });

    this.messageService.searchPatientMSG(searchCriteria).subscribe(
      data => {
        debugger;
        //this.patientMsgList = data as Array<any>;
        this.patientMsgListFilter = data as Array<any>;
      },
      error => {
        this.searchPatientMSGError(error);
      }
    );
  }
  searchPatientMSGError(error) {
    this.logMessage.log("searchPatientMSG Error." + error);
  }

  clearAll() {
    this.objFrom = "";
    this.objSent = "";
    this.objTo = "";
    this.objSubject = "";
    this.patientMessageFormView = this.formBuilder.group({
      'patientMessageView': [''],
    });
    this.patientMessageView = this.patientMessageFormView.controls['patientMessageView'];

    this.txt_Msg_Body = "";
    this.txt_Pat_Name = "";
    this.txt_Pat_ID = "";
    this.txt_msg_ID = "";
    this.showAlert = false;
    this.selectedPatID = "";
    this.messageID = "";
    this.messageDetailID = "";
  }


  unSelectAllMsg() {
    this.objFrom = "";
    this.objSent = "";
    this.objTo = "";
    this.objSubject = "";
    this.patientMessageFormView = this.formBuilder.group({
      'patientMessageView': [''],
    });
    this.patientMessageView = this.patientMessageFormView.controls['patientMessageView'];
  }

  onPatMessageSelect(value) {
    debugger;

    // this.msg_detail_from = '';
    // this.msg_detail_to = '';
    // this.msg_detail_subject = '';
    // this.msg_detail_body = '';
    // this.msg_detail_date = '';


    // this.msg_detail_from = value.created_user;
    // this.msg_detail_to = value.mess_to;
    // this.msg_detail_subject = value.mess_subject;
    // this.msg_detail_date = value.client_date_modified;
    // this.msg_detail_body = '';



    // this.patientIdTo = patObject.patient_id;
    // this.patientNameTo = patObject.name;
    // this.selectedPatID = patObject.patient_id;
    // //(this.searchLettersForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    // this.selectedPatientIDTo = this.patientIdTo.toString();
    // (this.patientMsgComposeForm.get('txtPatientSearchTo') as FormControl).setValue(this.patientNameTo);

    this.discardPatMsgT();
    this.replySubject = value.mess_subject;
    this.replyPatientName = value.phr_user;
    this.replyPatientID = value.patient_id;
    this.replySentDate = value.client_date_modified;
    this.replyTo = value.mess_to;
    this.patientIdTo = value.patient_id;
    //this.patientNameTo = patObject.name;

    this.selectedRowDelete = value;
    this.showAlert = false;
    this.amendmentMsg = "";
    this.selectedPatID = value.patient_id;
    //this.selectedPatName = value.
    this.messageID = value.message_id;//select row
    this.messageDetailID = value.message_detail_id;
    this.selectedPhrUser = value.phr_user;
    this.selectedPhrUserID = value.user_id;//phr user id
    this.objFrom = value.created_user;//value.created_user;
    this.objSent = value.client_date_modified;
    this.objTo = value.mess_to;
    //this.objCC = value.
    this.objSubject = value.mess_subject;
    //this.objTextMessage = value.mess_body_html;
    this.patientMessageFormView = this.formBuilder.group({
      'patientMessageView': [value.mess_body_html],
    });
    this.patientMessageView = this.patientMessageFormView.controls['patientMessageView'];



    //this.to_User = 
    //this.cc_User = 
    //this.draft_id = 
    this.msg_selected_body = value.mess_body_html.trim();
    this.txt_Msg_Body = value.mess_body_text;
    this.txt_Pat_Name = value.created_user;//phr_user;
    this.txt_Pat_ID = value.patient_id;
    this.txt_msg_ID = value.message_id;



    if (value.readed != true && event != null) {
      this.strOperation = "readed";
      this.patientMessageStatus = new Array<ORMKeyValue>();
      this.patientMessageStatus.push(new ORMKeyValue("client_date_modified", this.dateTimeUtil.getCurrentDateTimeString()));
      this.patientMessageStatus.push(new ORMKeyValue("modified_user", this.lookupList.logedInUser.user_name));
      this.patientMessageStatus.push(new ORMKeyValue("message_detail_id", value.message_detail_id));
      this.patientMessageStatus.push(new ORMKeyValue("callingFrom", "Patientmessage"));
      this.messageService.updateToReaded(this.patientMessageStatus)
        .subscribe(
          data => this.onupdateToReaded(data),
          error => alert(error),
          () => this.logMessage.log("Patient message status changed to read.")
        );
    }
    if (value.is_amendments) {
      if (value.amendment_status.toString().toUpperCase() == "ACCEPTED") {
        this.showAlert = true;
        this.value = "ACCEPTED";
        this.amendmentMsg = "Amendment Accepted By " + value.modified_user.toString().toUpperCase() + " on " + value.amendment_date;
      }
      else if (value.amendment_status.toString().toUpperCase() == "DENIED") {
        this.showAlert = true;
        this.value = "DENIED";
        this.amendmentMsg = "Amendment Denied By " + value.modified_user.toString().toUpperCase() + " on " + value.amendment_date;
      }
      // else
      // {
      //   this.showAlert = true;
      // 	this.amendmentMsg = "Amendment Request :";
      // }
    }
    this.getMessagesAttachments(value.message_id);
    this.getMessagesLinks(value.message_id);

  }
  onupdateToReaded(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Patient message status not changed to read.";
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
    }
  }
  getMessagesAttachments(message_ID) {
    this.messageService.getMessagesAttachments(message_ID, this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.patMsgAttachmentsList = data as Array<any>;
      },
      error => {
        this.getMessagesAttachmentsError(error);
      }
    );
  }
  getMessagesAttachmentsError(error) {
    this.logMessage.log("getMessagesAttachments Error." + error);
  }
  getMessagesLinks(message_ID) {
    this.messageService.getMessagesLinks(message_ID, this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {

        this.patMsgLinksList = data as Array<any>;
      },
      error => {
        this.getMessagesLinksError(error);
      }
    );
  }
  getMessagesLinksError(error) {
    this.logMessage.log("getMessagesLinks Error." + error);
  }
  viewPatient() {
    if (this.selectedPatID) {
      let obj: PatientToOpen = new PatientToOpen();
      obj.patient_id = this.selectedPatID;
      this.openModuleService.openPatient.emit(obj);
    }
  }
  openPatientSummary(patient) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }
  onOptionChange(event) {
    //  if(event!="inbox"){
    //    this.rdoselectedOption = event.currentTarget.value;
    //  }
    debugger;
    this.showHideFunctionButton = event;
    this.clearAll();
    this.patientMsgListFilter = this.general.filterArray(this.patientMsgList, "mail_status", event);
    this.onPatMessageSelect(this.patientMsgListFilter[0]);
    this.rdoChangedValue = event;
  }
  validate(): Boolean {

    if (this.selectedPatientID == "") {
      alert("Please select Patient.");
      return;
    }

    if ((this.searchPHRMessagesForm.get('cmbProvider') as FormControl).value == "") {
      alert("Please select provider.");
      return;
    }
    if ((this.searchPHRMessagesForm.get('dateFrom') as FormControl).value == "") {
      alert("Please select Date from.");
      return;
    }
    if ((this.searchPHRMessagesForm.get('dateTo') as FormControl).value == "") {
      alert("Please select date to.");
      return;
    }
    return true;
  }
  // searchPatientMsg(formData) {
  //   if (this.validate()) {
  //     
  //     let patMsgSearchCriteria: SearchCriteria = new SearchCriteria();
  //     patMsgSearchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
  //     patMsgSearchCriteria.param_list=[];

  //     let patMdateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
  //     let patMdateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);
  //     patMsgSearchCriteria.param_list.push( { name: "patientID", value: this.selectedPatientID, option: "" });
  //     patMsgSearchCriteria.param_list.push( { name: "cmbProvider", value: (this.searchPHRMessagesForm.get('cmbProvider') as FormControl).value, option: "" });
  //     patMsgSearchCriteria.param_list.push( { name: "dateFrom", value: patMdateFrom, option: "" });
  //     patMsgSearchCriteria.param_list.push( { name: "dateTo", value: patMdateTo, option: "" });
  //     this.messageService.searchPatientMsg(patMsgSearchCriteria).subscribe(
  //       data => {
  //         this.patientMsgList = data as Array<any>;
  //       },
  //       error => {
  //         this.logMessage.log("An Error Occured while serach PatientMessage criteria.")
  //       }
  //     );
  //   }
  // }


  openPopUp() {

    if (this.patMsgAttachmentsList.length > 0 || this.patMsgLinksList.length > 0) {

      const modalRef = this.modalService.open(AddToCorrespondenceComponent, this.poupUpOptions);
      modalRef.componentInstance.attachmentsList = this.patMsgAttachmentsList;
      modalRef.componentInstance.linksList = this.patMsgLinksList;
      modalRef.componentInstance.patientName = this.txt_Pat_Name;
      modalRef.componentInstance.txtBody = this.txt_Msg_Body;
      modalRef.componentInstance.patientID = this.txt_Pat_ID;
      modalRef.componentInstance.messageID = this.txt_msg_ID;
      modalRef.componentInstance.messageattachmentID = 'atch id';
      if (this.patMsgAttachmentsList.length > 0)
        modalRef.componentInstance.messageattachmentID = "";
      else
        modalRef.componentInstance.messageattachmentID = "";

      // const modalRef = this.modalService.open(AddToCorrespondenceComponent, this.poupUpOptions);


      // modalRef.componentInstance.addPatient.subscribe(($event) => {
      //   console.log("Add");
      // })
      // let closeResult;

      // modalRef.result.then((result) => {
      // }
      //   , (reason) => {
      //     //alert(reason);
      //   });
    } else {
      alert("No Attachment/Links found.");
      return;
    }
  }
  newPatientMsgCompose() {
    this.showComposeMsg = true;

  }
  //#region  patientsearchTO
  // pateint search start
  onPatientSearchKeydownTo(event) {

    if (event.key === "Enter") {
      this.showPatientSearchTo = true;
    } else if (event.key == "Backspace") {
      this.showPatientSearchTo = false;
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientIDTo = null;
      //(this.patientMsgComposeForm.get("mainPatientSearch") as FormControl).setValue(null);
    }
    else {
      this.showPatientSearchTo = false;
    }
  }
  onPatientSearchInputChangeTo(newValue) {

    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientNameTo) {
      this.patientIdTo = undefined;
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientIDTo = null;
    }
  }
  onPatientSearchBlurTo() {

    this.logMessage.log("onPatientSearchBlur");
    if (this.patientIdTo == undefined && this.showPatientSearchTo == false) {
      this.patientNameTo = undefined;
      (this.patientMsgComposeForm.get("txtPatientSearchTo") as FormControl).setValue(null);
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientIDTo = null;
    }
  }
  openSelectPatientTo(patObject) {
    debugger;
    this.logMessage.log(patObject);
    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Patient Message"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;
      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) {
          this.closePatientSearch();
        }
      }
        , (reason) => {
          //alert(reason);
        });
      return;
    }
    this.patientIdTo = patObject.patient_id;
    this.patientNameTo = patObject.name;
    this.selectedPatID = patObject.patient_id;
    this.selectedPhrUserID = patObject.user_id;
    this.selectedPhrUser = patObject.user_name;
    //(this.searchLettersForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    this.selectedPatientIDTo = this.patientIdTo.toString();
    (this.patientMsgComposeForm.get('txtPatientSearchTo') as FormControl).setValue(this.patientNameTo);
    this.showPatientSearchTo = false;
  }
  closePatientSearchTo() {

    this.showPatientSearchTo = false;
    this.onPatientSearchBlurTo();
  }

  //patient search end
  //#endregion patientserachTO

  onFileChange(event) {

    this.is_attachment = true;
    this.fileAttached = undefined;
    if (event.target.files && event.target.files.length > 0) {
      this.fileAttached = event.target.files[0];
    }
  }

  discardPatMsgT() {
    this.showComposeMsg = false;
    this.isEdit = false;
    this.replyEditable = false;
    this.isReply = false;
    this.clearPatMsg();
    // this.replyMsg[0].usersTo = [];
    // this.replyMsg[0].msgSubj = [];
    // this.replyMsg[0].msgText = [];
    // this.replyMsg[0].type = [];
    // this.replyMsg[0].msgId = [];
  }
  clearPatMsg() {
    (this.patientMsgComposeForm.get("txtPatientSearchTo") as FormControl).setValue('');
    (this.patientMsgComposeForm.get("txtRecipientTo") as FormControl).setValue('');
    (this.patientMsgComposeForm.get("txtSubjectTo") as FormControl).setValue('');
    (this.patientMsgComposeForm.get("cmbProviderTo") as FormControl).setValue('');
    this.quilComposeMessageEdit = this.formBuilder.group({
      'txtMessageEditTo': [''],
    });
    this.txtMessageEditTo = this.quilComposeMessageEdit.controls['txtMessageEditTo'];


    this.patientIdTo = null;
    this.patientNameTo = null;
    this.selectedPatID = null;
    if (this.patientIdTo)
      this.selectedPatientIDTo = this.patientIdTo.toString();
    else
      this.selectedPatientIDTo = "";

  }
  sendPatientMessage(value) {
    debugger;
    this.objToRecvID = new Array<any>();
    var strToUser: String = "";

    if (this.Validation()) {
      this.objMessage = new ORMPatientMessage();
      this.objMessage.mess_subject = (this.patientMsgComposeForm.get('txtSubjectTo') as FormControl).value;
      var quill = new Quill('#messageRichEditorToEdit', {
        theme: 'snow'
      });
      debugger;
      this.objMessage.mess_body_html = this.quilComposeMessageEdit.controls.txtMessageEditTo.value;//quill.getText().trim(); //this.patientMsgComposeForm.controls.txtMessageEditTo.value
      this.objMessage.mess_body_text = quill.getText().trim();
      this.objMessage.mess_to = this.patientNameTo; // api pat name
      this.objMessage.deleted = false;
      this.objMessage.message_type = "EHR";
      this.objMessage.from_id = (this.patientMsgComposeForm.get('cmbProviderTo') as FormControl).value;
      // this.objMessage.to_id = this.patientIdTo.toString(); //api user id in this and add pat id col in table..
      this.objMessage.sender_id = this.lookupList.logedInUser.userId.toString();
      this.objMessage.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.objMessage.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      this.objMessage.created_user = this.lookupList.logedInUser.user_name;
      debugger;
      // if(!this.isReply){
      //   this.objMessage.message_id = "";
      // }else{
      //   this.objMessage.message_id = this.messageID;
      // }

      this.objMessage.is_draft = false;
      this.objMessage.system_ip = this.lookupList.logedInUser.systemIp;
      this.objMessage.modified_user = this.lookupList.logedInUser.user_name;
      this.objMessage.practice_id = this.lookupList.practiceInfo.practiceId.toString();


      // for (var i = 0; i < this.listTo[0].usersTo.length; i++) {
      //   if(this.listTo[0].usersTo[i].id){
      //     if (strToUser == "")
      //       strToUser = strToUser + this.listTo[0].usersTo[i].id;
      //     else
      //       strToUser = strToUser + "," + this.listTo[0].usersTo[i].id;

      //     this.objToRecvID.push({ reciever_id: this.listTo[0].usersTo[i].id.toString()});
      //   }
      // }


      if (this.listTo[0].usersTo) {
        for (let index = 0; index < this.listTo[0].usersTo.length; index++) {
          debugger;
          var a = "";
          if (this.listTo[0].usersTo[index].user_id) {
            if (strToUser == "")
              strToUser = strToUser + this.listTo[0].usersTo[index].user_id;
            else
              strToUser = strToUser + "," + this.listTo[0].usersTo[index].user_id;

            this.objToRecvID.push({ reciever_id: this.listTo[0].usersTo[index].user_id.toString() });
          }
          //saveDetailsMessages
        }
      }

      this.arrSplitUserByComa = new Array<any>();
      for (var z = 0; z < this.objToRecvID.length; z++) {
        if (this.objToRecvID[z].reciever_id.toString().includes(',')) {
          for (var x = 0; x < this.objToRecvID[z].reciever_id.split(',').length; x++) {
            if (this.objToRecvID[z].reciever_id.split(',')[x].toString() != "") {
              this.arrSplitUserByComa.push({ reciever_id: this.objToRecvID[z].reciever_id.split(',')[x].toString() });
            }
          }
        } else {
          this.arrSplitUserByComa.push({ reciever_id: this.objToRecvID[z].reciever_id.toString() });
        }
      }
      this.arrDistUser = new UniquePipe().transform(this.arrSplitUserByComa, "reciever_id");
      // if (this.arrDetailsMessages == null || this.arrDetailsMessages == undefined) {
      this.arrDetailsMessages = new Array();
      //}
      for (let i = 0; i < this.arrDistUser.length; i++) {
        if (this.arrDistUser[i].reciever_id == "") {
          continue;
        } else {


          this.objMessageDetail = new ORMPatientMessageDetail();
          // if(!this.isReply){
          //   this.objMessageDetail.message_detail_id = "";
          // }else{
          //   this.objMessageDetail.message_detail_id = this.messageDetailID;
          // }

          this.objMessageDetail.recieve_date = this.dateTimeUtil.getCurrentDateTimeString();
          this.objMessageDetail.readed = false;
          this.objMessageDetail.mail_status = "inbox";
          this.objMessageDetail.patient_id = this.selectedPatID;
          this.objMessageDetail.deleted = false;
          this.objMessageDetail.created_user = this.lookupList.logedInUser.user_name;
          this.objMessageDetail.modified_user = this.lookupList.logedInUser.user_name;
          this.objMessageDetail.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
          this.objMessageDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
          this.objMessageDetail.phr_user = this.selectedPhrUser;
          this.objMessageDetail.user_id = this.selectedPhrUserID;
          this.objMessageDetail.reciever_id = this.arrDistUser[i].reciever_id;
          this.arrDetailsMessages.push(this.objMessageDetail);
        }
      }


      this.objMessage.to_id = strToUser; //this.patientIdTo.toString(); //api user id in this and add pat id col in table..

      if (this.isReply) {
        //if (this.arrDetailsMessages == null || this.arrDetailsMessages == undefined) {
        this.arrDetailsMessages = new Array();
        //}         
        this.objMessageDetail = new ORMPatientMessageDetail();
        //in reply case
        this.objMessageDetail.message_detail_id = this.messageDetailID;
        this.objMessageDetail.recieve_date = this.dateTimeUtil.getCurrentDateTimeString();
        this.objMessageDetail.readed = false;
        this.objMessageDetail.mail_status = "inbox";
        this.objMessageDetail.patient_id = this.selectedPatID;
        this.objMessageDetail.deleted = false;
        this.objMessageDetail.created_user = this.lookupList.logedInUser.user_name;
        this.objMessageDetail.modified_user = this.lookupList.logedInUser.user_name;
        this.objMessageDetail.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        this.objMessageDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        //this.objMessageDetail.phr_user = this.selectedPhrUser;
        this.objMessageDetail.phr_user = this.selectedPhrUser;
        this.objMessageDetail.user_id = this.selectedPhrUserID;

        this.arrDetailsMessages.push(this.objMessageDetail);
      }

      // if (value.chkPatient == true) {
      //  if (this.arrDetailsMessages == null || this.arrDetailsMessages == undefined) {
      //    this.arrDetailsMessages = new Array();
      //  }
      //  this.objMessageDetail = new ORMPatientMessageDetail();
      //  this.objMessageDetail.recieve_date = this.dateTimeUtil.getCurrentDateTimeString();
      //  this.objMessageDetail.readed = false;
      //  this.objMessageDetail.mail_status = "inbox";
      //  this.objMessageDetail.patient_id = this.selectedPatID;
      //  this.objMessageDetail.deleted = false;
      //  this.objMessageDetail.created_user = this.lookupList.logedInUser.user_name;
      //  this.objMessageDetail.modified_user = this.lookupList.logedInUser.user_name;
      //  this.objMessageDetail.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      //  this.objMessageDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      //  this.objMessageDetail.phr_user = this.selectedPhrUser;
      //  this.arrDetailsMessages.push(this.objMessageDetail);
      //}


      // if (value.chkAuthRep == true) {
      //   if (this.arrDetailsMessages == null || this.arrDetailsMessages == undefined) {
      //     this.arrDetailsMessages = new Array();
      //   }
      //   this.objMessageDetailAut = new ORMPatientMessageDetail();
      //   this.objMessageDetailAut.recieve_date = this.dateTimeUtil.getCurrentDateTimeString();
      //   this.objMessageDetailAut.readed = false;
      //   this.objMessageDetailAut.mail_status = "inbox";
      //   this.objMessageDetailAut.patient_id = this.lookupList.logedInUser.userId.toString();//this.selectedPatID;
      //   this.objMessageDetailAut.deleted = false;
      //   this.objMessageDetailAut.created_user = this.lookupList.logedInUser.user_name;
      //   this.objMessageDetailAut.modified_user = this.lookupList.logedInUser.user_name;
      //   this.objMessageDetailAut.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      //   this.objMessageDetailAut.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      //   this.objMessageDetailAut.user_id = this.lookupList.logedInUser.userId.toString();
      //   this.objMessageDetailAut.phr_user = this.selectedPhrUser;
      //   this.arrDetailsMessages.push(this.objMessageDetailAut);
      // }

      if (this.is_attachment) {
        this.objMsgAttachment = new ORMMessageAttachment();
        this.objMsgAttachment.message_attachment_id = "";
        this.objMsgAttachment.patient_id = this.lookupList.logedInUser.userId.toString();//this.selectedPatID;
        this.objMsgAttachment.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        this.objMsgAttachment.document_date = this.dateTimeUtil.getCurrentDateTimeString();
        this.objMsgAttachment.original_file_name = this.fileAttached.name;
        this.objMsgAttachment.link = "";
        this.objMsgAttachment.name = this.fileAttached.name;
      }
      let WrapperPatient: WrapperPatientMessage = new WrapperPatientMessage();
      WrapperPatient.objPatMsg = this.objMessage;
      WrapperPatient.objPatMsgDetail = this.arrDetailsMessages;
      WrapperPatient.objMsgAttach = this.objMsgAttachment;

      const formData: FormData = new FormData();
      formData.append('attachFile', this.fileAttached);
      formData.append('patMsgWrapperData', JSON.stringify(WrapperPatient));

      this.messageService.saveupdatePatientMessages(formData)
        .subscribe(
          data => this.savedSuccessfull(),
          error => alert(error),
          () => this.logMessage.log("Save Patient Message.")
        );

    }
  }
  //   sendPatientMessage(value){
  //     
  //     if(this.Validation()){
  //       this.objMessage = new ORMPatientMessage();
  //       var strToUser:String ="";
  //       var strCcUser:String ="";

  //       this.objMessage.mess_subject = (this.patientMsgComposeForm.get('txtSubjectTo') as FormControl).value;
  //       this.objMessage.mess_body_html = (this.patientMsgComposeForm.get('txtSubjectTo') as FormControl).value

  //       var quill = new Quill('#messageRichEditorToEdit', {
  //         theme: 'snow'
  //       });

  //       this.objMessage.mess_body_text = quill.getText().trim(); //this.patientMsgComposeForm.controls.txtMessageEditTo.value
  //       this.objMessage.mess_to = this.patientNameTo;
  //       this.objMessage.deleted = false;
  //       this.objMessage.message_type = "EHR";
  //       this.objMessage.from_id =  (this.patientMsgComposeForm.get('cmbProviderTo') as FormControl).value;
  //       this.objMessage.to_id = this.patientIdTo.toString();
  //       this.objMessage.sender_id = this.lookupList.logedInUser.userId.toString();
  //       this.objMessage.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
  //       this.objMessage.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
  //       this.objMessage.created_user = this.lookupList.logedInUser.user_name;
  //       this.objMessage.message_id = "";
  //       this.objMessage.is_draft = false;
  //       this.objMessage.system_ip = this.lookupList.logedInUser.systemIp;
  //       this.objMessage.modified_user = this.lookupList.logedInUser.user_name;
  //       this.objMessage.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  //       if(this.isEdit == true){
  //         if (this.arrDetailsMessages == null || this.arrDetailsMessages == undefined) {
  //           this.arrDetailsMessages = new Array();
  //         }
  //         this.objMessageDetail = new ORMPatientMessageDetail();
  // 				this.objMessageDetail.recieve_date = this.dateTimeUtil.getCurrentDateTimeString();
  // 				this.objMessageDetail.readed = false;
  // 				this.objMessageDetail.mail_status = "inbox";
  // 				this.objMessageDetail.patient_id = this.selectedPatID;
  // 				this.objMessageDetail.deleted = false;
  // 				this.objMessageDetail.created_user = this.lookupList.logedInUser.user_name;
  // 				this.objMessageDetail.modified_user = this.lookupList.logedInUser.user_name;
  // 				this.objMessageDetail.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
  // 				this.objMessageDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
  // 				this.objMessageDetail.phr_user = this.selectedPhrUser;
  // 				this.arrDetailsMessages.push(this.objMessageDetail);
  //       }
  //       if(value.chkPatient == true){
  //         if (this.arrDetailsMessages == null || this.arrDetailsMessages == undefined) {
  //           this.arrDetailsMessages = new Array();
  //         }
  //         this.objMessageDetail = new ORMPatientMessageDetail();
  //         this.objMessageDetail.recieve_date = this.dateTimeUtil.getCurrentDateTimeString();
  //         this.objMessageDetail.readed = false;
  //         this.objMessageDetail.mail_status = "inbox";
  //         this.objMessageDetail.patient_id = this.selectedPatID;
  //         this.objMessageDetail.deleted = false;
  //         this.objMessageDetail.created_user = this.lookupList.logedInUser.user_name;
  //         this.objMessageDetail.modified_user = this.lookupList.logedInUser.user_name;
  //         this.objMessageDetail.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
  //         this.objMessageDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
  //         this.objMessageDetail.phr_user = this.selectedPhrUser;
  //         this.arrDetailsMessages.push(this.objMessageDetail);
  //       }
  //       if(value.chkAuthRep == true){
  //         if (this.arrDetailsMessages == null || this.arrDetailsMessages == undefined) {
  //           this.arrDetailsMessages = new Array();
  //         }
  //         this.objMessageDetailAut = new ORMPatientMessageDetail();
  //         this.objMessageDetailAut.recieve_date = this.dateTimeUtil.getCurrentDateTimeString();
  //         this.objMessageDetailAut.readed = false;
  //         this.objMessageDetailAut.mail_status = "inbox";
  //         this.objMessageDetailAut.patient_id = this.selectedPatID;
  //         this.objMessageDetailAut.deleted = false;
  //         this.objMessageDetailAut.created_user = this.lookupList.logedInUser.user_name;
  //         this.objMessageDetailAut.modified_user = this.lookupList.logedInUser.user_name;
  //         this.objMessageDetailAut.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
  //         this.objMessageDetailAut.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
  //         this.objMessageDetailAut.phr_user = this.selectedPhrUser;
  //         this.arrDetailsMessages.push(this.objMessageDetailAut);
  //       }
  //        let WrapperPatient: WrapperPatientMessage = new WrapperPatientMessage();
  //        WrapperPatient.objPatMsg = this.objMessage;
  //        WrapperPatient.objPatMsgDetail = this.arrDetailsMessages;

  //        const formData: FormData = new FormData();
  //        formData.append('attachFile', this.fileAttached);
  //        formData.append('patMsgWrapperData', JSON.stringify(WrapperPatient));
  // 
  //       this.messageService.saveupdatePatientMessages(formData)
  //       .subscribe(
  //         data => this.savedSuccessfull(),
  //         error => alert(error),
  //         () => this.logMessage.log("Save Patient Message.")
  //       );
  //     }
  //   }
  savedSuccessfull() {
    //this.discardPatMsgT();
    //this.onGetPatientMessage();123
    this.onOptionChange("inbox");
  }
  Validation() {
    debugger;
    if (this.patientIdTo.toString() == "") {
      alert("Please enter To address.");
      return false;
    }
    if ((this.patientMsgComposeForm.get('txtSubjectTo') as FormControl).value.trim() == "") {
      alert("Pleas enter Subject.");
      return false;
    }
    if ((this.patientMsgComposeForm.get('cmbProviderTo') as FormControl).value.trim() == "") {
      alert("Pleas select from.");
      return false;
    }
    return true;
  }
  deletePatMsg(value) {
    debugger;
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);

    if (value == "delete") {
      modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
      modalRef.componentInstance.promptMessage = 'Are you sure you want to delete selected message?';
    } else if (value == "archive") {
      modalRef.componentInstance.promptHeading = 'Confirm Archive !';
      modalRef.componentInstance.promptMessage = 'Are you sure you want to archive selected message?';
    }


    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        let msgType = "";
        if (value == "archive") {
          msgType = "archive";
        } else {
          msgType = "delete"
        }

        debugger;
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "column_id", value: this.selectedRowDelete.message_id, option: "" },
          { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "client_date_modified", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" },
          { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
          { name: "msg_Type", value: msgType, option: "" }
        ];

        this.messageService.deletePatMsg(searchCriteria)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Selected Record Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    this.onGetPatientMessage();
  }
  replyPatMsg() {
    debugger;
    this.replyEditable = true;
    this.isEdit = true;
    this.isReply = true;
    this.showComposeMsg = true;
    var strBody: String = "<p><br/></p><TEXTFORMAT LEADING=\"2\"><P ALIGN=\"LEFT\"></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING=\"2\"><P ALIGN=\"LEFT\"></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING=\"2\"><P ALIGN=\"LEFT\"><FONT FACE=\"Verdana\" SIZE=\"10\" COLOR=\"#e6e6e6\" LETTERSPACING=\"0\" KERNING=\"0\">_____________________________________________________________</FONT></P></TEXTFORMAT>";


    strBody = strBody + "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='11' LETTERSPACING='0' KERNING='0'><B>From: </B>" + this.objFrom + "</FONT></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='11' LETTERSPACING='0' KERNING='0'><B>Sent: </B> " + this.objSent + "</FONT></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='11' LETTERSPACING='0' KERNING='0'><B>To: </B> " + this.objTo + "</FONT></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='11' LETTERSPACING='0' KERNING='0'><B>Subject:</B> " + this.objSubject + "</FONT></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='10' LETTERSPACING='0' KERNING='0'></FONT></P></TEXTFORMAT><p><br/></p>";


    var quill = new Quill('#messageRichEditorToEdit', {
      theme: 'snow'
    });

    //this.quilComposeMessageEdit.controls.txtMessageEditTo.value;
    //quill.getText().trim();

    //strBody = strBody + this.quilComposeMessageEdit.controls.txtMessageEditTo.value;
    strBody = strBody + this.msg_selected_body;

    this.quilComposeMessageEdit = this.formBuilder.group({
      'txtMessageEditTo': [strBody],
    });
    this.txtMessageEditTo = this.quilComposeMessageEdit.controls['txtMessageEditTo'];


    // this.replyMsg[0].usersTo.pop();
    // this.replyMsg[0].type.pop();
    // this.replyMsg[0].msgSubj.pop();
    // this.replyMsg[0].msgText.pop();
    // this.replyMsg[0].msgId.pop();


    // this.replyMsg[0].usersTo.push({user_to: this.msg_detail_from})
    // this.replyMsg[0].type.push({action_type: "reply"});
    // this.replyMsg[0].msgSubj.push({msg_subj: this.msg_detail_subject});
    // this.replyMsg[0].msgText.push({msg_text: strBody + this.msg_selected_body});
    //this.replyMsg[0].msgId.push({msg_id: this.message_id});




    // replySubject;
    // replyPatientName;
    // replyPatientID;
    // replySentDate;
    // replyTo;

    (this.patientMsgComposeForm.get("txtSubjectTo") as FormControl).setValue(this.replySubject);
    (this.patientMsgComposeForm.get("txtPatientSearchTo") as FormControl).setValue(this.replyPatientName);
    (this.patientMsgComposeForm.get("cmbProviderTo") as FormControl).setValue(this.replyTo);

  }
  showDoc = false;
  openDocument(document) {
    this.showDoc = true;

    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = this.acAttachmentPath + "/" + document.link;
    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          this.downloadfileResponse(data, document.link);
        },
        error => alert(error)
      );
  }
  doc_path = '';
  downloadfileResponse(data, doc_link) {
    // if (data.byteLength <= 0)
    //   return;

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
    this.doc_path = path;
    this.getLink();
    const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = path;

  }
  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };
  urlCache = new Map<string, SafeResourceUrl>();
  getLink(): SafeResourceUrl {

    var url = this.urlCache.get(this.doc_path);
    if (!url) {
      url = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.doc_path);
      this.urlCache.set("41", url);
    }
    return url;
  }
  openRecipient() {

    if (!this.patientIdTo) {
      alert("Please select any patient first.");
      return;
    }
    const modalRef = this.modalService.open(PatientMsgUserRecipientComponent, this.poupUpOptionssm);
    modalRef.componentInstance.selectedPatient = this.patientIdTo;

    let closeResult;
    modalRef.result.then((result) => {

      if (result) {
        debugger;
        this.listTo[0].usersTo.pop();
        (this.patientMsgComposeForm.get("txtRecipientTo") as FormControl).setValue('');
        if (result[0].users.length > 0) {
          for (var i = 0; i < result[0].users.length; i++) {
            //this.listTo[0].usersTo = result[0].users;
            //this.listTo[0].usersTo.push(result[i].users);
            this.listTo[0].usersTo.push({ id: result[0].users[i].id, name: result[0].users[i].name, user_id: result[0].users[i].user_id });
            (this.patientMsgComposeForm.get("txtRecipientTo") as FormControl).setValue((this.patientMsgComposeForm.get('txtRecipientTo') as FormControl).value + result[0].users[i].name + ";");
          }
        }
      }
    }
      , (reason) => {
        //alert(reason);
      });
  }
}