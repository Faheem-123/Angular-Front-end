import { Component, OnInit, Output, Inject, Input, ViewChild } from '@angular/core';
import { MessagesService } from 'src/app/services/messages/messages.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { EhrMessageInboxComponent } from '../ehr-message-inbox/ehr-message-inbox.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'messages-main',
  templateUrl: './messages-main.component.html',
  styleUrls: ['./messages-main.component.css']
})
export class MessagesMainComponent implements OnInit {
  @Input() patient_name;
  @Input() patient_id;
  showMessage = '';
  isNewMessage;
  message_type = '';//[inbox,draft,sent,deleted,archive]
  lstMessagesCount;
  //isLoading;
  inboxCount: String = '0';
  draftCount: String = '0';
  sentCount: String = '0';
  deletedCount: String = '0';
  archiveCount: String = '0';


  @ViewChild('ehrMessageInbox') ehrMessageInbox: EhrMessageInboxComponent;

  constructor(private messageService: MessagesService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private generalOperation:GeneralOperation) { }

  ngOnInit() {
    debugger;
    this.getMessageCount(false);

    this.message_type = 'Inbox';
  }

  getMessageCount(isRefresh: Boolean) {

    if (this.patient_id != undefined && this.patient_id != '') {
      this.onGetPatientMessageCount();
    }
    else {
      this.onGetMessageCount();
    }

    if (isRefresh) {
      this.ehrMessageInbox.onGetMessageList();
    }
  }


  onGetPatientMessageCount() {
    this.messageService.getPatientMessagesCount(this.patient_id)
      .subscribe(
        data => {
          this.lstMessagesCount = data;
          for (let i = 0; i < this.lstMessagesCount.length; i++) {
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "inbox") {
              this.inboxCount = this.lstMessagesCount[i].cnt;
              //              this.message_type='Inbox';
            }
            //else 
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "deleted") {
              this.deletedCount = this.lstMessagesCount[i].cnt;
            }
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "sent") {
              this.sentCount = this.lstMessagesCount[i].cnt;
            }
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "draft") {
              this.draftCount = this.lstMessagesCount[i].cnt;
            }
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "archive") {
              this.archiveCount = this.lstMessagesCount[i].cnt;
            }
          }
          //this.isLoading = false;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getMessagesCount list.")
          //this.isLoading = false;
        }
      );

     
  }
  onGetMessageCount() {
    this.messageService.getMessagesCount(this.lookupList.logedInUser.userId.toString())
      .subscribe(
        data => {
          this.lstMessagesCount = data;
          for (let i = 0; i < this.lstMessagesCount.length; i++) {
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "inbox") {
              this.inboxCount = this.lstMessagesCount[i].cnt;
              //              this.message_type='Inbox';
            }
            //else 
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "deleted") {
              this.deletedCount = this.lstMessagesCount[i].cnt;
            }
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "sent") {
              this.sentCount = this.lstMessagesCount[i].cnt;
            }
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "draft") {
              this.draftCount = this.lstMessagesCount[i].cnt;
            }
            if (this.lstMessagesCount[i].mail_status.toString().toLowerCase() == "archive") {
              this.archiveCount = this.lstMessagesCount[i].cnt;
            }
          }
          //this.isLoading = false;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getMessagesCount list.")
          //this.isLoading = false;
        }
      );

      this.generalOperation.getUnReadMessagesCount();
  }
  onPHRMessage() {
    this.showMessage = 'PHR';
  }
  onBackFromPHR() {
    this.showMessage = '';
  }
  // getSendReceive(){
  //   this.onGetMessageCount();
  //   this.message_type='Inbox';
  // }
  onDirectMessage() {
    this.showMessage = 'Direct';
  }
  onBackFromDirect() {
    this.showMessage = '';
  }
  onNewMessage() {
    debugger;
    this.isNewMessage = true;
  }
  onCloseNewMessage() {
    debugger;

    this.isNewMessage = false;

    if (this.patient_id != undefined && this.patient_id != '') {
      this.onGetPatientMessageCount();
    }
    else {
      this.onGetMessageCount();
    }
    if (this.message_type.toLowerCase() == "deleted")
      this.OnDelete();
    else if (this.message_type.toLowerCase() == "inbox")
      this.OnInbox();
    else if (this.message_type.toLowerCase() == "draft")
      this.OnDraft();
    else if (this.message_type.toLowerCase() == "sent")
      this.OnSent();
    else if (this.message_type.toLowerCase() == "archive")
      this.OnArchive();
  }

  OnInbox() {
    this.isNewMessage = false;
    this.message_type = "Inbox";
  }
  OnDraft() {
    this.isNewMessage = false;
    this.message_type = "Draft";
  }
  OnSent() {
    this.isNewMessage = false;
    this.message_type = "Sent";
  }
  OnDelete() {
    this.isNewMessage = false;
    this.message_type = "Deleted";
  }
  OnArchive() {
    this.isNewMessage = false;
    this.message_type = "Archive";
  }

  onShowTasks() {
    this.showMessage = 'Task';
  }
  backFromTask() {
    this.showMessage = '';
  }
}
