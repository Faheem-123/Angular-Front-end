import { Component, OnInit, Output, EventEmitter, OnChanges, Inject, Input } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MailRecipientComponent } from '../mail-recipient/mail-recipient.component';
import { FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import * as Quill from 'quill';
import { ORMMessage } from 'src/app/models/messages/ORMMessage';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { debug } from 'util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMMessageDetail } from 'src/app/models/messages/ORMMessageDetail';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { MessagesService } from 'src/app/services/messages/messages.service';
import { WrapperMessageSave } from 'src/app/models/messages/WrapperMessageSave';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralService } from 'src/app/services/general/general.service';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'ehr-message-compose',
  templateUrl: './ehr-message-compose.component.html',
  styleUrls: ['./ehr-message-compose.component.css']
})
export class EhrMessageComposeComponent implements OnChanges {
  @Output() onCloseNewMessage = new EventEmitter<any>();
  @Input() objReply;
  @Input() patient_id;
  @Input() patient_name;
  
  patientId: number;
  patientName: string;
  canReplyorAll = false;//disable TO and CC button in reply and reply all
  //public showPatientSearch = false;
  showPatientSearch: boolean = false;
  isLoadingSend: boolean = false;

  public listTo: any[] = [{ usersTo: [{ id: '' }], locationTo: [{ id: '' }], roleTo: [{ id: '' }] }];
  public listCC: any[] = [{ usersCc: [{ id: '' }], locationCc: [{ id: '' }], roleCc: [{ id: '' }] }];

  isToCC;
  messageComposeForm: FormGroup;
  recipientValuesTo: Array<any>;
  recipientValuesCc: Array<any>;
  quilComposeMessageEdit: FormGroup;
  arrDistUser: Array<any>;
  arrDistUserrepall: Array<any>;
  arrSplitUserByComa: Array<any>;
  arrforSingleRep: Array<any>;
  //arrSplitUserByComarepall: Array<any>;
  arrAllUser: Array<any>;
  public txtMessageEdit: AbstractControl;
  private draft_id: String = "";
  arrDetailsMessages: Array<any>;
  objToRecvID: Array<any>;
  isMessageType="";

  filterToLocation;
  filterToRole;
  filterCcLocation;
  filterCcRole;
  
  arrDraftDistUser: Array<any>;
  arrDraftAllUser: Array<any>;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private modalService: NgbModal,
    private general: GeneralOperation,
    private messageService: MessagesService,
    private generalService: GeneralService,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder) {

    this.quilComposeMessageEdit = formBuilder.group({
      'txtMessageEdit': [''],
    });
    this.txtMessageEdit = this.quilComposeMessageEdit.controls['txtMessageEdit'];
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  ngOnChanges() {
  }
  ngOnInit(){
    this.buildForm();
    if(this.objReply[0].type[0]==undefined || this.objReply[0].type[0]== ""){
      return;
    }else{
      if(this.objReply[0].type[0].action_type){
        this.isMessageType = this.objReply[0].type[0].action_type;
        this.assignValues();
      }else{
        this.clearAll();
      }
    }
    if (this.lookupList.practiceUsersList == undefined || this.lookupList.practiceUsersList.length == 0) {
      this.getPracticeUsersList();
    }
  }
  getPracticeUsersList() {
    this.generalService.getPracticeUsersList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.practiceUsersList = data as Array<any>;
      },
      error => {
        this.getPracticeUsersListError(error);
      }
    );
  }
  getPracticeUsersListError(error) {
    this.logMessage.log("getPracticeUsersList Error." + error);
  }
  getToCcData(){
    this.messageService.getToCcData(this.objReply[0].msgId[0].msg_id)
      .subscribe(
        data => {
          debugger;
          if (data != "") {
            this.listTo[0].usersTo.pop();
            this.listTo[0].locationTo.pop();
            this.listTo[0].roleTo.pop();
            this.listCC[0].usersCc.pop();
            this.listCC[0].locationCc.pop();
            this.listCC[0].roleCc.pop();
            if(this.isMessageType == "replyall"){
              if(this.objReply[0].senders[0].name !=""){
                this.listTo[0].usersTo.push({id: this.objReply[0].senders[0].name +","+ data[0].to_user});
              }else{
                this.listTo[0].usersTo.push({id: data[0].to_user});
              }
              this.listTo[0].usersTo.push({id: data[0].cc_user});
              this.listTo[0].locationTo.push({id: data[0].to_location});
              this.listTo[0].locationTo.push({id: data[0].cc_location});
              this.listTo[0].roleTo.push({id: data[0].to_role});
              this.listTo[0].roleTo.push({id: data[0].cc_role});
            }
            else{
              this.listTo[0].usersTo.push({id: data[0].to_user});
            }
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting ToCc Data list.")
        }
      );
  }
  assignValues(){
      if(this.objReply[0].type[0].action_type=="reply"){
        (this.messageComposeForm.get("txtRecipientTo") as FormControl).setValue(this.objReply[0].usersTo[0].user_to);
        (this.messageComposeForm.get("txtRecipientCC") as FormControl).setValue('');
      }else{
        if(this.objReply[0].usersCc[0].user_cc!=""){
          (this.messageComposeForm.get("txtRecipientTo") as FormControl).setValue(this.objReply[0].usersTo[0].user_to+';'+this.objReply[0].usersCc[0].user_cc);
        }else{
          (this.messageComposeForm.get("txtRecipientTo") as FormControl).setValue(this.objReply[0].usersTo[0].user_to);
        }
        
        (this.messageComposeForm.get("txtRecipientCC") as FormControl).setValue('');
      }

    (this.messageComposeForm.get("txtSubject") as FormControl).setValue(this.objReply[0].msgSubj[0].msg_subj);
    this.quilComposeMessageEdit = this.formBuilder.group({
      'txtMessageEdit': [this.objReply[0].msgText[0].msg_text],
    });
    this.txtMessageEdit = this.quilComposeMessageEdit.controls['txtMessageEdit'];
    
    if(this.objReply[0].type[0].action_type=="replyall" || this.objReply[0].type[0].action_type=="reply"){
      this.canReplyorAll = true;
    }else{
      this.canReplyorAll = false;
    }

    this.getToCcData();
  }
  buildForm() {
    this.messageComposeForm = this.formBuilder.group({
      txtRecipientTo: this.formBuilder.control(""),
      txtRecipientCC: this.formBuilder.control(""),
      txtSubject: this.formBuilder.control(""),
      prior_Flag: this.formBuilder.control(""),
      //txtPatientSearch: this.formBuilder.control(this.patient_name!=undefined?this.patient_name:''),
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null)
    })
    if(this.patient_name!=undefined && this.patient_name!='')
    {
      let patienttxt=this.messageComposeForm.get('txtPatientSearch');
      patienttxt.disable();
    }
  }
  onDiscard() {
    this.clearAll();
    this.onCloseNewMessage.emit();
  }

  openRecipient(value) {
    this.isToCC = value;
    const modalRef = this.modalService.open(MailRecipientComponent, this.poupUpOptions);
    modalRef.componentInstance.callingFrom = this.isToCC;
    if (this.isToCC == "to") {
      modalRef.componentInstance.recipientValues = this.listTo;
    } else {
      modalRef.componentInstance.recipientValues = this.listCC;
    }

    let closeResult;
    modalRef.result.then((result) => {
      if (result) {
        if (this.isToCC == "to")
          (this.messageComposeForm.get("txtRecipientTo") as FormControl).setValue('');
        if (this.isToCC == "cc")
          (this.messageComposeForm.get("txtRecipientCC") as FormControl).setValue('');

        if (result[0].users.length > 0) {
          for (var i = 0; i < result[0].users.length; i++) {
            if (this.isToCC == "to") {
              this.listTo[0].usersTo = result[0].users;
              (this.messageComposeForm.get("txtRecipientTo") as FormControl).setValue((this.messageComposeForm.get('txtRecipientTo') as FormControl).value + result[0].users[i].name + ";");
            }
            else {
              this.listCC[0].usersCc = result[0].users;
              (this.messageComposeForm.get("txtRecipientCC") as FormControl).setValue((this.messageComposeForm.get('txtRecipientCC') as FormControl).value + result[0].users[i].name + ";");
            }
          }
        }//if users end here.
        if (result[0].location.length > 0) {
          for (var i = 0; i < result[0].location.length; i++) {
            if (this.isToCC == "to") {
              this.listTo[0].locationTo = result[0].location;
              (this.messageComposeForm.get("txtRecipientTo") as FormControl).setValue((this.messageComposeForm.get('txtRecipientTo') as FormControl).value + result[0].location[i].name + ";");
            }
            else {
              this.listCC[0].locationCc = result[0].location;
              (this.messageComposeForm.get("txtRecipientCC") as FormControl).setValue((this.messageComposeForm.get('txtRecipientCC') as FormControl).value + result[0].location[i].name + ";");
            }
          }
        }//if location end here.
        if (result[0].role.length > 0) {
          for (var i = 0; i < result[0].role.length; i++) {
            if (this.isToCC == "to") {
              this.listTo[0].roleTo = result[0].role;
              (this.messageComposeForm.get("txtRecipientTo") as FormControl).setValue((this.messageComposeForm.get('txtRecipientTo') as FormControl).value + result[0].role[i].name + ";");
            }
            else {
              this.listCC[0].roleCc = result[0].role;
              (this.messageComposeForm.get("txtRecipientCC") as FormControl).setValue((this.messageComposeForm.get('txtRecipientCC') as FormControl).value + result[0].role[i].name + ";");
            }
          }
        }//if role end here.
      }
    }
      , (reason) => {
        //alert(reason);
      });
  }

  sendMail(value){
    this.objToRecvID = new Array<any>();
    if (!this.Validation())
      return;
      debugger;

    this.isLoadingSend = true;
    let ormMessage: ORMMessage = new ORMMessage();
    var strToUser: String = "";
    var strToLocation: String = "";
    var strToRole: String = "";
    var strCcUser: String = "";
    var strCcLocation: String = "";
    var strCcRole: String = "";
    var obj: Object;
    ormMessage.mess_to = (this.messageComposeForm.get('txtRecipientTo') as FormControl).value
    ormMessage.mess_cc = (this.messageComposeForm.get('txtRecipientCC') as FormControl).value
    ormMessage.mess_subject = (this.messageComposeForm.get('txtSubject') as FormControl).value
    var quill = new Quill('#messageRichEditorEdit', {
      theme: 'snow'
    });
    ormMessage.mess_body_html = this.quilComposeMessageEdit.controls.txtMessageEdit.value//quill.container.innerHTML;
    ormMessage.mess_body_text = quill.getText().trim();
    ormMessage.system_ip = this.lookupList.logedInUser.systemIp;
    ormMessage.deleted = false;
    ormMessage.priority = this.messageComposeForm.get("prior_Flag").value == true ? true : false;
    
    ormMessage.sender = this.lookupList.logedInUser.userId.toString();
    
    ormMessage.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    ormMessage.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    ormMessage.created_user = this.lookupList.logedInUser.user_name;
    if (this.draft_id != "")
      ormMessage.message_id = this.draft_id;
    else
      ormMessage.message_id = "";
    if(value == 'draft'){
      ormMessage.is_draft = true;
    }else{
      ormMessage.is_draft = false;
    }
    if(this.patient_id!=undefined && this.patient_id!="" 
    && ((this.messageComposeForm.get('txtPatientSearch') as FormControl).value!=null && (this.messageComposeForm.get('txtPatientSearch') as FormControl).value!=''))
    {
      ormMessage.module_id=this.patient_id;
      ormMessage.module_name="Patient";
    }
    else{
      ormMessage.module_id="";
      ormMessage.module_name="";
    }
    ormMessage.modified_user = this.lookupList.logedInUser.user_name;
    ormMessage.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    //#region ToUsers
    debugger;
  for (var i = 0; i < this.listTo[0].usersTo.length; i++) {
    if(this.listTo[0].usersTo[i].id){
      if (strToUser == "")
        strToUser = strToUser + this.listTo[0].usersTo[i].id;
      else
        strToUser = strToUser + "," + this.listTo[0].usersTo[i].id;

      this.objToRecvID.push({ reciever_id: this.listTo[0].usersTo[i].id.toString(), reciver_type: "touser"});
    }
  }
    //#endregion ToUsers
    //#region ToLocation
    
      for (var i = 0; i < this.listTo[0].locationTo.length; i++) {
        if(this.listTo[0].locationTo[i].id){
          if (strToLocation == "")
            strToLocation = strToLocation + this.listTo[0].locationTo[i].id;
          else
            strToLocation = strToLocation + "," + this.listTo[0].locationTo[i].id;
    
          //GeneralOptions.filterArrayCollection(GeneralOptions.acAllUsers,"default_location",arrLocation.getItemAt(i).id);
          this.filterToLocation = this.general.filterArray(this.lookupList.practiceUsersList, "default_location", this.listTo[0].locationTo[i].id);
          for (var j = 0; j < this.filterToLocation.length; j++) 
          {
            this.objToRecvID.push({ reciever_id: this.filterToLocation[j].user_id.toString(), reciver_type: "tolocation" });
          }
        }
      }
    //#endregion ToLocation
    //#region ToRole
    
      for (var i = 0; i < this.listTo[0].roleTo.length; i++) {
        if(this.listTo[0].roleTo[i].id){
          if (strToRole == "")
            strToRole = strToRole + this.listTo[0].roleTo[i].id;
          else
            strToRole = strToRole + "," + this.listTo[0].roleTo[i].id;
    
          //this.objToRecvID.push({ reciever_id: this.listTo[0].roleTo[i].id });
          //arr = GeneralOptions.filterArrayCollection(GeneralOptions.acAllUsers,"default_role",arrRoles.getItemAt(i).id);
          this.filterToRole = this.general.filterArray(this.lookupList.practiceUsersList, "default_role", this.listTo[0].roleTo[i].id);
          for (var j = 0; j < this.filterToRole.length; j++) 
          {
            this.objToRecvID.push({ reciever_id: this.filterToRole[j].user_id.toString(), reciver_type: "torole" });
          }
      }
    }
    //#endregion torole
    //#region CCUsers
    
      for (var i = 0; i < this.listCC[0].usersCc.length; i++) {
        if(this.listCC[0].usersCc[i].id){
          if (strCcUser == "")
            strCcUser = strCcUser + this.listCC[0].usersCc[i].id;
          else
            strCcUser = strCcUser + "," + this.listCC[0].usersCc[i].id;
    
          this.objToRecvID.push({ reciever_id: this.listCC[0].usersCc[i].id.toString(), reciver_type: "ccuser" });
        }
      }
    //#endregion CCUsers
    //#region CCLocation
   
      for (var i = 0; i < this.listCC[0].locationCc.length; i++) {
        if(this.listCC[0].locationCc[i].id){
          if (strCcLocation == "")
            strCcLocation = strCcLocation + this.listCC[0].locationCc[i].id;
          else
            strCcLocation = strCcLocation + "," + this.listCC[0].locationCc[i].id;
    
          //this.objToRecvID.push({ reciever_id: this.listCC[0].locationCc[i].id });
          this.filterCcLocation = this.general.filterArray(this.lookupList.practiceUsersList, "default_location", this.listCC[0].locationCc[i].id);
          for (var j = 0; j < this.filterCcLocation.length; j++) 
          {
            this.objToRecvID.push({ reciever_id: this.filterCcLocation[j].user_id.toString(), reciver_type: "cclocation" });
          }
      }
    }
    //#endregion CCLocation
    //#region CCRole
    
      for (var i = 0; i < this.listCC[0].roleCc.length; i++) {
        if(this.listCC[0].roleCc[i].id){
          if (strCcRole == "")
            strCcRole = strCcRole + this.listCC[0].roleCc[i].id;
          else
            strCcRole = strCcRole + "," + this.listCC[0].roleCc[i].id;
    
          //this.objToRecvID.push({ reciever_id: this.listCC[0].roleCc[i].id });
          this.filterCcRole = this.general.filterArray(this.lookupList.practiceUsersList, "default_role", this.listCC[0].roleCc[i].id);
          for (var j = 0; j < this.filterCcRole.length; j++) 
          {
            this.objToRecvID.push({ reciever_id: this.filterCcRole[j].user_id.toString(), reciver_type: "ccrole" });
          }
      }
    }    
    //#endregion CCrole
     //this.arrDistUser.length
     this.arrSplitUserByComa = new Array<any>();
     for (var z = 0; z < this.objToRecvID.length; z++) {
      if(this.objToRecvID[z].reciever_id.toString().includes(',')){
        for (var x = 0; x < this.objToRecvID[z].reciever_id.split(',').length; x++) {
          if(this.objToRecvID[z].reciever_id.split(',')[x].toString()!=""){
            this.arrSplitUserByComa.push({ reciever_id: this.objToRecvID[z].reciever_id.split(',')[x].toString(), reciver_type: this.objToRecvID[z].reciver_type });
          }
        }
      }else{
        this.arrSplitUserByComa.push({ reciever_id: this.objToRecvID[z].reciever_id.toString(), reciver_type: this.objToRecvID[z].reciver_type });
      }
     }









//      if(this.objReply[0].type[0].action_type=="replyall"){
//       //objMessageDetail.reciever_id = this.objReply[0].tousers[0].name;

//       this.arrSplitUserByComarepall = new Array<any>();
//       //for (var z = 0; z < this.objReply[0].tousers[0].name.split(',').length; z++) {
//        if(this.objReply[0].tousers[0].name.toString().includes(',')){
//          for (var x = 0; x < this.objReply[0].tousers[0].name.split(',').length; x++) {
//            if(this.objReply[0].tousers[0].name.split(',')[x].toString()!=""){
//              this.arrSplitUserByComarepall.push({ reciever_id: this.objReply[0].tousers[0].name.split(',')[x].toString() });
//            }
//          }
//        }else{
//          this.arrSplitUserByComarepall.push({ reciever_id: this.objReply[0].tousers.toString() });
//        }
//       //}
//     }

    // this.arrDistUserrepall = new UniquePipe().transform(this.arrSplitUserByComarepall, "reciever_id");

    // this.arrDetailsMessages = new Array<any>();
    // let objMessageDetail: ORMMessageDetail = new ORMMessageDetail();
    // for (var s = 0; s < this.arrDistUserrepall.length; s++) {
    //   if(this.arrDistUserrepall[s].reciever_id == ""){
    //     continue;
    //   }else{
    //     objMessageDetail.reciever_id = this.arrDistUserrepall[s].reciever_id;
    //   }
    // }


    debugger;
    //this.arrDistUser = new UniquePipe().transform(this.objToRecvID, "reciever_id"); // 123,1233
    this.arrDistUser = new Array<any>();
    this.arrforSingleRep = new Array<any>();
    this.arrforSingleRep.push({ reciever_id: this.objReply[0].senders[0].name.toString() });

    if(this.objReply[0].type[0].action_type=="reply"){
      this.arrDistUser = new UniquePipe().transform(this.arrforSingleRep, "reciever_id");
    }else if(this.objReply[0].type[0].action_type=="replyall"){

for (i=0; i<this.arrSplitUserByComa.length;i++){
  if(this.lookupList.logedInUser.userId == this.arrSplitUserByComa[i].reciever_id && 
    (this.arrSplitUserByComa[i].reciver_type == "touser" ||  this.arrSplitUserByComa[i].reciver_type == "ccuser")){
    this.arrSplitUserByComa.splice(i,1);
    break;
  }
}



      this.arrDistUser = new UniquePipe().transform(this.arrSplitUserByComa, "reciever_id");



    }else{
      this.arrDistUser = new UniquePipe().transform(this.arrSplitUserByComa, "reciever_id");
    }


    this.arrDetailsMessages = new Array<any>();
    for (i = 0; i < this.arrDistUser.length; i++) {
      if(this.arrDistUser[i].reciever_id == ""){
        continue;
      }else{
        let objMessageDetail: ORMMessageDetail = new ORMMessageDetail();
        objMessageDetail.recieve_date = this.dateTimeUtil.getCurrentDateTimeString();
        objMessageDetail.readed = false;
        objMessageDetail.mail_status = "inbox";
        
        if(this.objReply[0].type[0].action_type=="reply"){
          objMessageDetail.reciever_id = this.objReply[0].senders[0].name;
        }else{
          objMessageDetail.reciever_id = this.arrDistUser[i].reciever_id;
        }
        
        

        objMessageDetail.location = "";
        objMessageDetail.deleted = false;
        objMessageDetail.created_user = this.lookupList.logedInUser.user_name;
        objMessageDetail.modified_user = this.lookupList.logedInUser.user_name;
        objMessageDetail.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        objMessageDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        this.arrDetailsMessages.push(objMessageDetail)
      }
    }
    debugger;
    if(this.objReply[0].type[0].action_type=="reply"){
      ormMessage.to_user = this.objReply[0].senders[0].name;
    }else if(this.objReply[0].type[0].action_type=="replyall"){
      //ormMessage.to_user = this.arrDistUser[i].reciever_id;//arrSplitUserByComa -- this.arrSplitUserByComa;

    // for(var a = 0; a<this.arrDistUser.length;a++){
    //   ormMessage.to_user += this.arrDistUser[a].reciever_id+',';
    // }


      if(strToUser.search(','+this.lookupList.logedInUser.userId.toString()) > -1 ){
        ormMessage.to_user = strToUser.replace(','+this.lookupList.logedInUser.userId.toString(),'');  
      }else if(strToUser.search(this.lookupList.logedInUser.userId.toString()+',') > -1 ){
        ormMessage.to_user = strToUser.replace(this.lookupList.logedInUser.userId.toString()+',','');  
      }else{
        ormMessage.to_user = strToUser.replace(this.lookupList.logedInUser.userId.toString(),'');
      }

    }else{
      ormMessage.to_user = strToUser;
    }
    
    
    
    ormMessage.to_location = strToLocation;
    ormMessage.to_role = strToRole;
    ormMessage.cc_user = strCcUser;
    ormMessage.cc_location = strCcLocation;
    ormMessage.cc_role = strCcRole;
    let WrapperMessagesSave: WrapperMessageSave = new WrapperMessageSave();
    WrapperMessagesSave.messageSave_Pro = ormMessage;
    WrapperMessagesSave.lstMessageDetails = this.arrDetailsMessages;


    this.messageService.saveMessage(WrapperMessagesSave).subscribe(
      data => {
        this.clearAll();
        this.onCloseNewMessage.emit();
        this.objReply[0].type[0].action_type = "";
        this.isLoadingSend = false;
      },
      error => {
        this.isLoadingSend = false;
        return;
      }
    );
  }
  clearAll() {
   

    (this.messageComposeForm.get("txtRecipientTo") as FormControl).setValue('');
    (this.messageComposeForm.get("txtRecipientCC") as FormControl).setValue('');
    (this.messageComposeForm.get("txtSubject") as FormControl).setValue('');
    this.quilComposeMessageEdit = this.formBuilder.group({
      'txtMessageEdit': [''],
    });
    this.txtMessageEdit = this.quilComposeMessageEdit.controls['txtMessageEdit'];
    (this.messageComposeForm.get("prior_Flag") as FormControl).setValue(false);
  }

  Validation() {
    if ((this.messageComposeForm.get('txtRecipientTo') as FormControl).value.trim() == "") {
      alert("Please enter To address.");
      return false;
    }
    if ((this.messageComposeForm.get('txtSubject') as FormControl).value.trim() == "") {
      alert("Please enter Subject.");
      return false;
    }
    return true;
  }
  onKeydown(event){
    if (event.key === "Enter"){
      this.showPatientSearch=true;
    }
  }
  // openSelectPatient(patient){
  //   this.patient_id=patient.patient_id;

  //   (this.messageComposeForm.get("txtPatientSearch") as FormControl).setValue(patient.name);
  //   this.patient_id=patient.patient_id;
  //   this.showPatientSearch=false;
  // }
  // closePatientSearch(){
  //   this.showPatientSearch = false;
  // }


onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {
    

      this.patientId = undefined;
      this.messageComposeForm.get("txtPatientIdHidden").setValue(null);
    }


    //this.patientName=undefined;
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.messageComposeForm.get("txtPatientSearch").setValue(null);
      this.messageComposeForm.get("txtPatientIdHidden").setValue(null);
    }
    //this.patientId=undefined;
  }
  openSelectPatient(patObject) {
    this.logMessage.log(patObject);

    if(patObject.patient_status==='INACTIVE' || patObject.patient_status==='DECEASED'){
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is "+patObject.patient_status;
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

     this.patient_id=patObject.patient_id;

     (this.messageComposeForm.get("txtPatientSearch") as FormControl).setValue(patObject.name);

    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;
    
    (this.messageComposeForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    (this.messageComposeForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);

    this.showPatientSearch = false;

  }
  closePatientSearch(){
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  // saveAsDraft(){
  //   if (!this.ValidationDraft())
  //     return;

  //   let ormDraftMsg: ORMMessage = new ORMMessage();
  //   var strDraftToUser:String ="";
	// 	var strDraftCcUser:String ="";
  
  //   ormDraftMsg.mess_to = (this.messageComposeForm.get('txtRecipientTo') as FormControl).value
  //   ormDraftMsg.mess_cc = (this.messageComposeForm.get('txtRecipientCC') as FormControl).value
  //   ormDraftMsg.mess_subject = (this.messageComposeForm.get('txtSubject') as FormControl).value
  //   var quill = new Quill('#messageRichEditorEdit', {
  //     theme: 'snow'
  //   });
  //   ormDraftMsg.mess_body_html = this.quilComposeMessageEdit.controls.txtMessageEdit.value//quill.container.innerHTML;

    
  //   ormDraftMsg.mess_body_text = = quill.getText().trim();
  //   ormDraftMsg.deleted = false;
  //   ormDraftMsg.priority = this.messageComposeForm.get("prior_Flag").value == true ? true : false;
  //   ormDraftMsg.sender = this.lookupList.logedInUser.userId.toString();
  //   ormDraftMsg.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
  //   ormDraftMsg.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
  //   ormDraftMsg.created_user = this.lookupList.logedInUser.user_name;
    
    
  //   if (this.draft_id != "")
  //     ormDraftMsg.message_id = this.draft_id;
  //   else
  //     ormDraftMsg.message_id = "";

  // ormDraftMsg.is_draft = false;
  // ormDraftMsg.modified_user = this.lookupList.logedInUser.user_name;
  // ormDraftMsg.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
  

  // ormDraftMsg.is_draft = false;
  // ormDraftMsg.modified_user = this.lookupList.logedInUser.user_name;
  // ormDraftMsg.practice_id = this.lookupList.practiceInfo.practiceId.toString();




  // }
  // ValidationDraft() {
  //   if ((this.messageComposeForm.get('txtRecipientTo') as FormControl).value.trim() == "") {
  //     alert("Please enter To address.");
  //     return false;
  //   }
  //   if ((this.messageComposeForm.get('txtSubject') as FormControl).value.trim() == "") {
  //     alert("Please enter Subject.");
  //     return false;
  //   }
  //   return true;
  // }
}