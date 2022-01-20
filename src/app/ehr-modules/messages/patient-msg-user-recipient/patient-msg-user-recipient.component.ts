import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MessagesService } from 'src/app/services/messages/messages.service';
import { LogMessage } from 'src/app/shared/log-message';

@Component({
  selector: 'app-patient-msg-user-recipient',
  templateUrl: './patient-msg-user-recipient.component.html',
  styleUrls: ['./patient-msg-user-recipient.component.css']
})
export class PatientMsgUserRecipientComponent implements OnInit {
  
  selectedPatient: string = '';
  public arrPHRUsers: any[];
  public listReturn: any[] = [{ users: [{ id: '', name: '', user_id: '' }] }];
  //recipientValues: Array<any>;

  constructor(public activeModal: NgbActiveModal,
    private messageService: MessagesService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    debugger;
    this.getUsers();
    this.listReturn[0].users.pop();
  }
  getUsers(){
    this.messageService.getPatMsgUsersRecipient(this.selectedPatient).subscribe(
      data => {
        debugger;
        this.arrPHRUsers = JSON.parse(JSON.stringify(data as Array<any>));
      },
      error => {
        this.getUsersError(error);
      }
    );
  }
  getUsersError(error) {
    this.logMessage.log("getUsersError pat msg recipients Error." + error);
  }
  // selectAllUsers(value) {
  //   debugger;
  //   for (var i = 0; i < this.arrPHRUsers.length; i++) {
  //     this.arrPHRUsers[i].chkbox = value;
  //   }
  // }
  getAllSelected(){
    debugger;
    this.listReturn[0].users.pop();
    if (this.arrPHRUsers != null && this.arrPHRUsers.length > 0) {
      for (var i = 0; i < this.arrPHRUsers.length; i++) {
        if (this.arrPHRUsers[i].chkbox == true) {
          this.listReturn[0].users.push({ id: this.arrPHRUsers[i].id, name: this.arrPHRUsers[i].username, user_id: this.arrPHRUsers[i].user_id });
        }
      }
    }
    this.activeModal.close(this.listReturn);
  }
  checkChkBox(id, event) {
    debugger;
      for (var i = 0; i < this.arrPHRUsers.length; i++) {
        if (event == true) {
          if (this.arrPHRUsers[i].id == id) {
            this.arrPHRUsers[i].chkbox = true;
            return;
          }
        } else if (event == false) {
          if (this.arrPHRUsers[i].id == id) {
            this.arrPHRUsers[i].chkbox = false;
            return;
          }
        }

      }
  }
}
