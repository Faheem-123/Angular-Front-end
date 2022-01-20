import { Component, OnInit, Input, OnChanges, Output, EventEmitter, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MessagesService } from 'src/app/services/messages/messages.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { markDirty } from '@angular/core/src/render3';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ListFilterContainPipe } from 'src/app/shared/list-filter-contain-pipe';
import { ListFilterContainsAnyGeneral } from 'src/app/shared/filter-pipe-contains-any-general';

@Component({
  selector: 'ehr-message-inbox',
  templateUrl: './ehr-message-inbox.component.html',
  styleUrls: ['./ehr-message-inbox.component.css']
})
export class EhrMessageInboxComponent implements OnChanges {
  @Input() isNewMessage;
  @Output() onCloseNewMessagebkpMain = new EventEmitter<any>();
  @Input() message_type;
  @Input() patient_name;
  @Input() patient_id;

  values;
  lstMessagelist: Array<any>;
  
  lstMessagelist_DB;
  MessageDetail;
  isLoading: boolean = false;
  message_id;
  isReaded;
  message_detail_id;
  msg_selected_body;
  quilMessageHeaderEdit: FormGroup;
  public messageTextView: AbstractControl;
  public replyMsg: any[] = [{
    usersTo: [{ user_to: '' }], usersCc: [{ user_cc: '' }], msgSubj: [{ msg_subj: '' }], msgText: [{ msg_text: '' }], type: [{ action_type: '' }], msgId: [{ msg_id: '' }],
    sender: [{ name: '' }]
    , tousers: [{ name: '' }]
    , senders: [{ name: '' }]
    , toLocation: [{ to_location: '' }]
    , toRole: [{ to_role: '' }]
    , ccLocation: [{ cc_location: '' }]
    , ccRole: [{ cc_role: '' }]
  }];
  //public listReturn:any[] = [{ users:[{id:'', name:''}], location:[{id:'', name:''}], role:[{id:'', name:''}] }];
  messageStatus: Array<ORMKeyValue> = [];
  constructor(private messageService: MessagesService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal, private generalOperation: GeneralOperation,

    private logMessage: LogMessage, private openModuleService: OpenModuleService) {
    this.quilMessageHeaderEdit = formBuilder.group({
      'messageTextView': [''],
    });
    this.messageTextView = this.quilMessageHeaderEdit.controls['messageTextView'];

  }

  ngOnChanges() {
    if (this.patient_id != undefined && this.patient_id != '') {
      this.onGetPatientMessageList();
    }
    else {
      this.onGetMessageList();
    }
    if (this.message_type == "Inbox") {

    }
    else if (this.message_type == "Draft") {

    }
    else if (this.message_type == "Sent") {

    }
    else if (this.message_type == "Deleted") {

    }
    else if (this.message_type == "Archive") {

    }

  }
  onGetMessageList(){
    this.isLoading = true;
    this.messageService.getMessageslist(this.lookupList.logedInUser.userId.toString(), this.message_type)
      .subscribe(
        data => {
          if (this.lstMessagelist == undefined) {
            this.lstMessagelist = new Array<any>();
          }
          this.lstMessagelist = data as Array<any>;
          this.lstMessagelist_DB = data;
          this.isLoading = false;
          //this.onMessageClick(this.lstMessagelist[0].message_id);
          if(this.lstMessagelist.length > 0)
            this.onMessageClick(this.lstMessagelist[0], "0");
        },
        error => {
          this.isLoading = false;
          this.logMessage.log("An Error Occured while getting getMessages list.")
        }
      );
  }
  onGetPatientMessageList() {

    this.messageService.getPatientMessagesListt(this.patient_id, this.message_type)
      .subscribe(
        data => {
          if (this.lstMessagelist == undefined) {
            this.lstMessagelist = new Array<any>();
          }
          this.lstMessagelist = data as Array<any>;
          //this.onMessageClick(this.lstMessagelist[0].message_id);
          if(this.lstMessagelist.length > 0)
            this.onMessageClick(this.lstMessagelist[0], "0");
        },
        error => {
          this.logMessage.log("An Error Occured while getting getMessages list.")
        }
      );
  }
  onCloseNewMessage() {
    this.isNewMessage = false;
    this.onCloseNewMessagebkpMain.emit();
    this.msg_selected_body = "";
    this.replyMsg[0].usersTo = [];
    this.replyMsg[0].usersCc = [];
    this.replyMsg[0].msgSubj = [];
    this.replyMsg[0].msgText = [];
    this.replyMsg[0].type = [];
    this.replyMsg[0].msgId = [];

    if(this.lstMessagelist == undefined)
      if (this.lstMessagelist[0]) {
        this.onMessageClick(this.lstMessagelist[0], "0");
    }
  }
  msg_detail_from;
  msg_detail_to;
  msg_detail_cc;
  msg_detail_subject;
  msg_detail_body;
  msg_detail_date;
  module_id;

  sender;
  to_user;

  onMessageClick(value, index){
    if(this.isNewMessage == true){
      return false;
    }
    this.isLoading = true;
    this.isReaded = value.readed;

    this.replyMsg = [{
      usersTo: [{ user_to: '' }], usersCc: [{ user_cc: '' }], msgSubj: [{ msg_subj: '' }], msgText: [{ msg_text: '' }], type: [{ action_type: '' }], msgId: [{ msg_id: '' }],
      sender: [{ name: '' }]
      , tousers: [{ name: '' }]
      , senders: [{ name: '' }]
      , toLocation: [{ to_location: '' }]
      , toRole: [{ to_role: '' }]
      , ccLocation: [{ cc_location: '' }]
      , ccRole: [{ cc_role: '' }]
    }];

    this.message_id = value.message_id;
    this.msg_detail_from = '';
    this.msg_detail_to = '';
    this.msg_detail_cc = '';
    this.msg_detail_subject = '';
    this.msg_detail_body = '';
    this.msg_detail_date = '';
    this.module_id = '';

    this.sender = '';
    this.to_user = '';

    if (this.patient_id != undefined && this.patient_id != '') {
      this.messageService.getPatientMessageDetail(value.message_id, this.patient_id, this.message_type)
        .subscribe(
          data => {
            this.MessageDetail = data;
            this.msg_detail_from = this.MessageDetail.created_user;
            this.msg_detail_to = this.MessageDetail.mess_to;
            this.msg_detail_cc = this.MessageDetail.mess_cc;
            this.msg_detail_subject = this.MessageDetail.mess_subject;
            this.msg_detail_date = this.MessageDetail.client_date_modified;
            this.message_detail_id = this.MessageDetail.message_detail_id;
            this.module_id = this.MessageDetail.module_id;
            this.msg_detail_body = this.MessageDetail.mess_body_html.trim();


            this.quilMessageHeaderEdit = this.formBuilder.group({
              'messageTextView': [this.MessageDetail.mess_body_html.trim()],
            });
            this.messageTextView = this.quilMessageHeaderEdit.controls['messageTextView'];
            this.msg_selected_body = this.MessageDetail.mess_body_html.trim();
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
            this.logMessage.log("An Error Occured while getting getMessages list.")
          }
        );
    }
    else {
      this.messageService.getMessageDetail(value.message_id, this.lookupList.logedInUser.userId.toString(), this.message_type)
        .subscribe(
          data => {
            this.MessageDetail = data;
            this.msg_detail_from = this.MessageDetail.created_user;
            this.msg_detail_to = this.MessageDetail.mess_to;
            this.msg_detail_cc = this.MessageDetail.mess_cc;
            this.msg_detail_subject = this.MessageDetail.mess_subject;
            this.msg_detail_date = this.MessageDetail.client_date_modified;
            this.message_detail_id = this.MessageDetail.message_detail_id;
            this.module_id = this.MessageDetail.module_id;
            this.msg_detail_body = this.MessageDetail.mess_body_html.trim();
            this.sender = this.MessageDetail.sender;
            this.to_user = this.MessageDetail.to_user;

            this.quilMessageHeaderEdit = this.formBuilder.group({
              'messageTextView': [this.MessageDetail.mess_body_html.trim()],
            });
            this.messageTextView = this.quilMessageHeaderEdit.controls['messageTextView'];
            this.msg_selected_body = this.MessageDetail.mess_body_html.trim();
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
            this.logMessage.log("An Error Occured while getting getMessages list.")
          }
        );
    }

    if (this.isReaded != true) {
      this.messageStatus = new Array<ORMKeyValue>();
      this.messageStatus.push(new ORMKeyValue("client_date_modified", this.dateTimeUtil.getCurrentDateTimeString()));
      this.messageStatus.push(new ORMKeyValue("modified_user", this.lookupList.logedInUser.user_name));
      this.messageStatus.push(new ORMKeyValue("message_detail_id", value.message_detail_id));
      this.messageStatus.push(new ORMKeyValue("callingFrom", "message"));
      this.messageService.updateToReaded(this.messageStatus)
        .subscribe(
          data => {
            this.onupdateToReaded(data, index)
          },
          error => {
            this.logMessage.log("Message status changed to read.");
            return;
          }
        );


    }
  }
  onupdateToReaded(data, index) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Message status not changed to read.";
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
      this.lstMessagelist[index].readed = true;
      this.generalOperation.getUnReadMessagesCount();
      // this.lstMessagelist.refresh();
    }
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  archiveSelectedMessage() {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Archive !';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to archive this message?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "column_id", value: this.MessageDetail.message_detail_id, option: "" },
          { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "client_date_modified", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" },
          { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
          { name: "msg_Type", value: "archive", option: "" }
        ];

        this.messageService.archiveSelectedMessage(searchCriteria)
          .subscribe(
            data => this.onDeleteSelectedMessage(data),
            error => alert(error),
            () => this.logMessage.log("Selected Record Archive.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }

  deleteSelectedMessage(value) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);


    //if (value == "delete") {
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    // } else if (value == "archive") {
    //   modalRef.componentInstance.promptHeading = 'Confirm Archive !';
    //   modalRef.componentInstance.promptMessage = 'Are you sure you want to archive this message?';
    // }
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        let msgType = "";
        // if (value == "archive") {
        //   msgType = "archive";
        // } else {
        msgType = this.message_type.toLowerCase();
        //}


        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "column_id", value: this.MessageDetail.message_detail_id, option: "" },
          { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "client_date_modified", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" },
          { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
          { name: "msg_Type", value: "deleted", option: "" }
        ];

        this.messageService.deleteSelectedMessage(searchCriteria)
          .subscribe(
            data => this.onDeleteSelectedMessage(data),
            error => alert(error),
            () => this.logMessage.log("Selected Record Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSelectedMessage(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Message Inbox";
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
      if (this.patient_id != undefined && this.patient_id != '') {
        this.onGetPatientMessageList();
      }
      else {
        this.onGetMessageList();
      }
      this.onCloseNewMessage();
    }
  }
  replySelectedMessage(value) {

    this.isNewMessage = true;
    var strBody: String = "<p><br/></p><TEXTFORMAT LEADING=\"2\"><P ALIGN=\"LEFT\"></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING=\"2\"><P ALIGN=\"LEFT\"><FONT FACE=\"Verdana\" SIZE=\"10\" COLOR=\"#e6e6e6\" LETTERSPACING=\"0\" KERNING=\"0\">_____________________________________________________________</FONT>" +
      "</P></TEXTFORMAT>";

    strBody = strBody + "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='11' LETTERSPACING='0' KERNING='0'><B>From: </B>" + this.msg_detail_from + "</FONT></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='11' LETTERSPACING='0' KERNING='0'><B>Sent: </B> " + this.msg_detail_date + "</FONT></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='11' LETTERSPACING='0' KERNING='0'><B>To: </B> " + this.msg_detail_to + "</FONT></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='11' LETTERSPACING='0' KERNING='0'><B>Cc: </B> " + this.msg_detail_cc + "</FONT></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='11' LETTERSPACING='0' KERNING='0'><B>Subject:</B> " + this.msg_detail_subject + "</FONT></P></TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'><P ALIGN='LEFT'><FONT FACE='Verdana' SIZE='10' LETTERSPACING='0' KERNING='0'></FONT></P></TEXTFORMAT><p><br/></p>";

    this.replyMsg[0].usersTo.pop();
    this.replyMsg[0].type.pop();
    this.replyMsg[0].usersCc.pop();
    this.replyMsg[0].msgSubj.pop();
    this.replyMsg[0].msgText.pop();
    this.replyMsg[0].msgId.pop();


    this.replyMsg[0].tousers.pop();
    this.replyMsg[0].senders.pop();


    // if(this.lookupList.logedInUser.user_name.toLowerCase() == this.msg_detail_from.toLowerCase()){
    //   this.replyMsg[0].usersTo.push({user_to: this.msg_detail_to});
    //   this.replyMsg[0].usersCc.push({user_cc: this.msg_detail_cc});
    //   this.replyMsg[0].type.push({action_type: "own"});
    // }
    if (value == "reply") {
      this.replyMsg[0].usersTo.push({ user_to: this.msg_detail_from })
      this.replyMsg[0].usersCc.push({ user_cc: "" });
      this.replyMsg[0].type.push({ action_type: "reply" });
    } else if (value == "replyall") {



      this.msg_detail_to = this.msg_detail_to.toLowerCase().replace(this.lookupList.logedInUser.user_name.toLowerCase() + ';', '');


      // if(this.msg_detail_to.search(';'+this.lookupList.logedInUser.user_name.toLowerCase()) > -1 ){
      //   this.msg_detail_to = this.msg_detail_to.toLowerCase().replace(';' + this.lookupList.logedInUser.user_name.toLowerCase(), '');
      // }else if(this.msg_detail_to.search(this.lookupList.logedInUser.user_name.toString()+';') > -1 ){
      //   this.msg_detail_to = this.msg_detail_to.toLowerCase().replace(this.lookupList.logedInUser.user_name.toLowerCase() + ';', '');
      // }else{
      //   this.msg_detail_to = this.msg_detail_to.toLowerCase().replace(this.lookupList.logedInUser.user_name.toLowerCase(), '');
      // }



      this.replyMsg[0].usersTo.push({ user_to: this.msg_detail_from + ";" + this.msg_detail_to + this.msg_detail_cc });
      this.replyMsg[0].usersCc.push({ user_cc: "" });
      this.replyMsg[0].type.push({ action_type: "replyall" });
    } else { this.replyMsg[0].type.push({ action_type: "" }); }
    //    this.replyMsg[0].usersCc.push({user_cc: this.msg_detail_cc});
    this.replyMsg[0].sender.push({ name: this.msg_detail_from.toLowerCase() });
    this.replyMsg[0].msgSubj.push({ msg_subj: this.msg_detail_subject });
    this.replyMsg[0].msgText.push({ msg_text: strBody + this.msg_selected_body });
    this.replyMsg[0].msgId.push({ msg_id: this.message_id });

    this.replyMsg[0].senders.push({ name: this.sender.toLowerCase() });
    this.replyMsg[0].tousers.push({ name: this.to_user.toLowerCase() });

  }
  getSendReceive() {

    if (this.patient_id != undefined && this.patient_id != '') {
      this.onGetPatientMessageList();
    }
    else {
      this.onGetMessageList();
    }
  }
  onOpenPatientClick(value) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = value;
    obj.patient_name = "Patient";
    this.openModuleService.openPatient.emit(obj);

  }
  onFilter(val: string) {
    //this.lstMessagelist = this.generalOperation.filterArray(this.lstMessagelist_DB, "created_user", val);
    //this.lstMessagelist  = new ListFilterContainPipe().transform(this.lstMessagelist_DB, "created_user", val);
    if (val != "") {
      let filterObjCuser: any = { created_user: val };
      this.lstMessagelist = new ListFilterContainsAnyGeneral().transform(this.lstMessagelist_DB, filterObjCuser);
    } else {
      this.lstMessagelist = this.lstMessagelist_DB;
    }

  }
}