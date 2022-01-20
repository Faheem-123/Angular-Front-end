import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LogMessage } from 'src/app/shared/log-message';
import { UserService } from 'src/app/services/user/user.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from '../alert-popup/alert-popup.component';
import { AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { AuthenticationCredentials } from 'src/app/authentication/authenticationCredentials';
import { Md5 } from 'ts-md5';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'authentication-popup',
  templateUrl: './authentication-popup.component.html',
  styleUrls: ['./authentication-popup.component.css']
})
export class AuthenticationPopupComponent implements OnInit {

  @Input() headerTitle: string = "";
  @Input() allowUserSelection: boolean = false;
  @Input() notesRequired: boolean = false;
  @Input() notesTitle: string = "Notes";  

  isVerifying: boolean = false;
  msg: string;
  authenticateForm: FormGroup;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };


  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    public activeModal: NgbActiveModal,
    private ngbModal: NgbModal,
    private generalService: GeneralService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.buildForm();

    if (this.lookupList.practiceUsersList == undefined || this.lookupList.practiceUsersList.length == 0) {
      this.getPracticeUsersList();
    }
  }


  buildForm() {
    this.authenticateForm = this.formBuilder.group({
      txtPassword: this.formBuilder.control(null, Validators.required)
    })

    if (this.allowUserSelection) {
      this.authenticateForm.addControl("txtUser", this.formBuilder.control(null, Validators.compose([Validators.required])));
    }

    if (this.notesRequired) {
      this.authenticateForm.addControl("txtNotes", this.formBuilder.control(null, Validators.compose([Validators.required])));
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

  onSubmit(formData: any) {

    if (this.validateFormData(formData)) {

      debugger;
      let authCredentials: AuthenticationCredentials = new AuthenticationCredentials;
      if(this.allowUserSelection){
        authCredentials.username = formData.txtUser;
      }
      else{
        authCredentials.username = this.lookupList.logedInUser.user_name;
      }
      
      authCredentials.password = Md5.hashStr(formData.txtPassword).toString();


      this.userService.authenticateUser(authCredentials).subscribe(
        data => {
          debugger;
          if (data["status"] === ServiceResponseStatusEnum.AUTHORIZED) {

            let lstUser: Array<any> = data["response_list"] as Array<any>;

            let userId: string = "";
            let userName: string = "";
            let last_name: string = "";
            let first_name: string = "";
            let formNotes: string = "";

            if (lstUser != undefined && lstUser.length > 0) {
              userId = lstUser[0].user_id;
              userName = lstUser[0].user_name;
              last_name = lstUser[0].last_name;
              first_name = lstUser[0].first_name;
            }

            if (this.notesRequired) {
              formNotes = formData.txtNotes;
            }

            let authResponse: any = { user_id: userId, user_name: userName, last_name: last_name, first_name: first_name, notes: formNotes };

            this.activeModal.close(authResponse);

          }
          else if (data["status"] === ServiceResponseStatusEnum.UNAUTHORIZED) {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'Authentication Failed', "Invalid UserName and/or Password.", AlertTypeEnum.DANGER)
          }

        }, error => {

        }
      );
    }
  }


  validateFormData(formData: any): boolean {

    let strMsg: string = "";

    if (this.allowUserSelection && (formData.txtUser == undefined || formData.txtUser == "")) {
      strMsg = "Please enter User."
    }
    else if (formData.txtPassword == undefined || formData.txtPassword == "") {
      strMsg = "Please enter password."
    }
    else if (this.notesRequired && (formData.txtNotes == undefined || formData.txtNotes == "")) {
      strMsg = "Please enter " + this.notesTitle;
    }

    if (strMsg != "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Authentication', strMsg, AlertTypeEnum.DANGER)
      return false;
    }
    else {
      return true;
    }

  }


}
