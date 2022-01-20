import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { LogMessage } from "../../../shared/log-message";
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'dashboard-unreadmessages',
  templateUrl: './dashboard-unreadmessages.component.html',
  styleUrls: ['./dashboard-unreadmessages.component.css']
})
export class DashboardUnreadmessagesComponent implements OnInit {
  @Output() widgetUpdate = new EventEmitter<any>();
  listUnreadMsgResult;
  messagecount;
  isLoading: boolean = false;
  constructor(private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private dashboardService: DashboardService) { 
    //this.getUnReadMessages(this.lookupList.practiceInfo.logedInUser);
    this.getUnReadMessages(this.lookupList.logedInUser.userId);
  }
  refreshMessages(){
    this.getUnReadMessages(this.lookupList.logedInUser.userId);
  }
  ngOnInit() {
  }
  getUnReadMessages(ReciverID){
    debugger;
    this.isLoading = true;
    this.dashboardService.getUnReadMessages(ReciverID)
    .subscribe(
      data=>
      {
        this.listUnreadMsgResult = data
        this.messagecount = this.listUnreadMsgResult.length;
        this.lookupList.unReadmessageCount=this.messagecount
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.logMessage.log("getcash register Successfull." + error);
      }
    );
  }
  isReadMessage=false;
  msg_detail_from='';
  msg_detail_date='';
  msg_detail_subject='';
  msg_detail='';
  onReadClick(msg){
    this.isReadMessage=true;
    this.msg_detail_from=msg.sender;
    this.msg_detail_date=msg.client_date_created;
    this.msg_detail_subject=msg.mess_subject;
    this.msg_detail=msg.mess_body_text;
    this.markRead(msg);
  }
  markRead(row){
    debugger;
    var clientdatetime = "0";
    var ip ="0";
    this.dashboardService.markAsRead(row.message_detail_id, this.lookupList.logedInUser.user_name, clientdatetime, ip)
    .subscribe(
      data=>
      {
        this.refreshMessages();
      },
      error=>alert(error),
      ()=>this.logMessage.log("markRead.")
    );
  }
  onCloseReadMessage()
  {
    this.isReadMessage=false;

  }
  
}
