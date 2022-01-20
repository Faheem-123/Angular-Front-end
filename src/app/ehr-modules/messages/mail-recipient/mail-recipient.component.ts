import { Component, OnInit, Inject, Input } from '@angular/core';
import { NgbActiveModal, NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';
import { LOOKUP_LIST, LookupList } from './../../../providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';

@Component({
  selector: 'mail-recipient',
  templateUrl: './mail-recipient.component.html',
  styleUrls: ['./mail-recipient.component.css']
})
export class MailRecipientComponent implements OnInit {
  callingFrom: string = ''; //to or cc only

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    public activeModal: NgbActiveModal,
    private logMessage: LogMessage,
    private generalService: GeneralService) { }
  public listReturn: any[] = [{ users: [{ id: '', name: '' }], location: [{ id: '', name: '' }], role: [{ id: '', name: '' }] }];
  public arrPracticeUsers: any[];
  public arrLocations: any[];
  public arrRoles: any[];
  recipientValues: Array<any>;

  ngOnInit() {
    if (this.lookupList.roleList == undefined || this.lookupList.roleList.length == 0) {
      this.getUserRole();
    }
    this.listReturn[0].users.pop();
    this.clearAll();
    this.assignTo(this.recipientValues);
  }
  assignTo(values) {
    debugger;
    //this.arrPracticeUsers=this.lookupList.listpracticeUserName;
    //this.arrPracticeUsers  = Object.assign([], this.lookupList.listpracticeUserName);
    this.arrPracticeUsers = JSON.parse(JSON.stringify(this.lookupList.listpracticeUserName));
    this.arrLocations = JSON.parse(JSON.stringify(this.lookupList.locationList));
    this.arrRoles = JSON.parse(JSON.stringify(this.lookupList.roleList));

    if (values != undefined && values != null) {
      if (this.callingFrom == "to") {
        for (var z = 0; z < values[0].usersTo.length; z++) {
          for (var i = 0; i < this.arrPracticeUsers.length; i++) {
            if (this.arrPracticeUsers[i].id == values[0].usersTo[z].id) {
              this.arrPracticeUsers[i].chkbox = true;
              break;
            }
          }
        }
        //
        for (var z = 0; z < values[0].locationTo.length; z++) {
          for (var i = 0; i < this.arrLocations.length; i++) {
            if (this.arrLocations[i].id == values[0].locationTo[z].id) {
              this.arrLocations[i].chkbox = true;
              break;
            }
          }
        }
        for (var z = 0; z < values[0].roleTo.length; z++) {
          for (var i = 0; i < this.arrRoles.length; i++) {
            if (this.arrRoles[i].role_id == values[0].roleTo[z].id) {
              this.arrRoles[i].chkbox = true;
              break;
            }
          }
        }
      }//toend
      else {
        debugger;
        for (var z = 0; z < values[0].usersCc.length; z++) {
          for (var i = 0; i < this.arrPracticeUsers.length; i++) {
            if (this.arrPracticeUsers[i].id == values[0].usersCc[z].id) {
              this.arrPracticeUsers[i].chkbox = true;
              break;
            }
          }
        }
        //
        for (var z = 0; z < values[0].locationCc.length; z++) {
          for (var i = 0; i < this.arrLocations.length; i++) {
            if (this.arrLocations[i].id == values[0].locationCc[z].id) {
              this.arrLocations[i].chkbox = true;
              break;
            }
          }
        }
        for (var z = 0; z < values[0].roleCc.length; z++) {
          for (var i = 0; i < this.arrRoles.length; i++) {
            if (this.arrRoles[i].role_id == values[0].roleCc[z].id) {
              this.arrRoles[i].chkbox = true;
              break;
            }
          }
        }
      }
    }
    //
  }

  clearAll() {
    if (this.callingFrom == "cc") {

    }
  }
  getUserRole() {
    //Load Location
    this.generalService.getUserAllRoles(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.roleList = data as Array<any>;
      },
      error => {
        this.logMessage.log("getUserRole: " + error);
      }
    );
  }
  selectAllUsers(value) {
    debugger;
    for (var i = 0; i < this.arrPracticeUsers.length; i++) {
      this.arrPracticeUsers[i].chkbox = value;
    }
  }
  selectAllLocation(value) {
    debugger;
    for (var i = 0; i < this.arrLocations.length; i++) {
      this.arrLocations[i].chkbox = value;
    }
  }
  selectAllRole(value) {
    debugger;
    for (var i = 0; i < this.arrRoles.length; i++) {
      this.arrRoles[i].chkbox = value;
    }
  }
  checkChkBox(id, event, list) {
    debugger;
    if (list == "users") {
      for (var i = 0; i < this.arrPracticeUsers.length; i++) {
        if (event == true) {
          if (this.arrPracticeUsers[i].id == id) {
            this.arrPracticeUsers[i].chkbox = true;
            return;
          }
        } else if (event == false) {
          if (this.arrPracticeUsers[i].id == id) {
            this.arrPracticeUsers[i].chkbox = false;
            return;
          }
        }

      }
    } else if (list == "location") {
      for (var i = 0; i < this.arrLocations.length; i++) {
        if (event == true) {
          if (this.arrLocations[i].id == id) {
            this.arrLocations[i].chkbox = true;
            return;
          }
        } else if (event == false) {
          if (this.arrLocations[i].id == id) {
            this.arrLocations[i].chkbox = false;
            return;
          }
        }

      }
    }
    if (list == "role") {
      for (var i = 0; i < this.arrRoles.length; i++) {
        if (event == true) {
          if (this.arrRoles[i].role_id == id) {
            this.arrRoles[i].chkbox = true;
            return;
          }
        } else if (event == false) {
          if (this.arrRoles[i].role_id == id) {
            this.arrRoles[i].chkbox = false;
            return;
          }
        }
      }
    }
    //
  }
  getAllSelected() {
    debugger;
    this.listReturn[0].users.pop();
    this.listReturn[0].location.pop();
    this.listReturn[0].role.pop();
    if (this.arrPracticeUsers != null && this.arrPracticeUsers.length > 0) {
      for (var i = 0; i < this.arrPracticeUsers.length; i++) {
        if (this.arrPracticeUsers[i].chkbox == true) {
          this.listReturn[0].users.push({ id: this.arrPracticeUsers[i].id, name: this.arrPracticeUsers[i].user_name });
        }
      }
    }
    debugger;
    if (this.arrLocations != null && this.arrLocations.length > 0) {
      for (var i = 0; i < this.arrLocations.length; i++) {
        if (this.arrLocations[i].chkbox == true) {
          this.listReturn[0].location.push({ id: this.arrLocations[i].id, name: this.arrLocations[i].name });
        }
      }
    }
    debugger;
    if (this.arrRoles != null && this.arrRoles.length > 0) {
      for (var i = 0; i < this.arrRoles.length; i++) {
        if (this.arrRoles[i].chkbox == true) {
          this.listReturn[0].role.push({ id: this.arrRoles[i].role_id, name: this.arrRoles[i].role_name });
        }
      }
    }
    debugger;
    this.activeModal.close(this.listReturn);
  }
}
