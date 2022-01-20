import { Component, OnInit, Input, Inject } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { UserService } from 'src/app/services/user/user.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Md5 } from 'ts-md5';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'provider-authentication-popup',
  templateUrl: './provider-authentication-popup.component.html',
  styleUrls: ['./provider-authentication-popup.component.css']
})
export class ProviderAuthenticationPopupComponent implements OnInit {

  @Input() headerTitle: string = "";
  @Input() provider_id: string = "";
  lstProviderUsers;

  strProviderID: String = "";
  strProviderName: String = "";
  providerAuthForm: FormGroup;
  constructor(public activeModal: NgbActiveModal,
    private generalService: GeneralService,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private generalOperation: GeneralOperation,
    private ngbModal: NgbModal,
    private userService: UserService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    this.buildForm();
    // if (!this.lookupList.providerList) {
    //   this.getProviderList();
    // }
    this.getProviderUser();
    this.selectDefaultProvider();
  }
  buildForm() {
    this.providerAuthForm = this.formBuilder.group({
      cmbProvider: this.formBuilder.control(this.provider_id),
      txtUserID: this.formBuilder.control(this.lookupList.logedInUser.user_name),
      txtPassword: this.formBuilder.control(null, Validators.required)
    })
  }
  getProviderUser(){
    this.generalService.getProviderUser(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        debugger;
        this.lstProviderUsers = data as Array<any>;
        (this.providerAuthForm.get('cmbProvider') as FormControl).setValue(this.provider_id);
        this.onProviderChange();
      },
      error => {
        this.logMessage.log("getProviderUser "+error);
      }
    );
  }
  onProviderChange()
  {
    debugger;
    let listProviderUserFiltered=this.generalOperation.filterArray(this.lstProviderUsers,'provider_id',this.providerAuthForm.get("cmbProvider").value)
        if(listProviderUserFiltered.length>0)
        {
          (this.providerAuthForm.get('txtUserID') as FormControl).setValue(listProviderUserFiltered[0].user_name);
        }
        else
          (this.providerAuthForm.get('txtUserID') as FormControl).setValue('');

      (this.providerAuthForm.get('txtPassword') as FormControl).setValue('');

  }
  // getProviderList() {
  //   this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(
  //     data => {
  //       this.lookupList.providerList = data as Array<any>;
  //     },
  //     error => {
  //       this.getProviderListError(error);
  //     }
  //   );
  // }
  getProviderListError(error) {
    this.logMessage.log("getProviderList Error." + error);
  }
  closePopup(value) {
    this.activeModal.close(value);
  }
  onSubmit(formData: any) {
    debugger;
    if (this.validateFormData(formData)) {
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
        { name: "user", value: formData.txtUserID, option: "" },
        { name: "ps", value: Md5.hashStr(formData.txtPassword).toString(), option: "" },
        { name: "provID", value: formData.cmbProvider.toString(), option: "" }
      ];
      this.userService.AuthenticatePU(searchCriteria).subscribe(
        data => {
          debugger;
          if (data[0] != undefined) {
                                    //User_id=Provider_id, User_name=Provider_name
            let authResponse: any = { user_id: data[0].provider_id, user_name: data[0].provider_name };
            this.activeModal.close(authResponse);
          } else {
            alert("Invalid User/Password");
            return;
          }
        },
        error => {
          this.logMessage.log("signEncounter " + error);
        }
      );


      // var cmbProviderID = (this.providerAuthForm.get('cmbProvider') as FormControl).value;
      // var UserID = formData.txtUserID;
      // var pass = Md5.hashStr(formData.txtPassword).toString();
      // this.userService.AuthenticateProviderUser(UserID,pass,this.lookupList.practiceInfo.practiceId).subscribe(
      //   data => {
      //   }, error => {
      //   }
      // );
    }
  }
  validateFormData(formData: any): boolean {
    let strMsg: string = "";
    if (formData.txtUserID == undefined || formData.txtUserID == "") {
      strMsg = "Please enter User."
    }
    else if (formData.txtPassword == undefined || formData.txtPassword == "") {
      strMsg = "Please enter password."
    }
    if (strMsg != "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Authentication', strMsg, AlertTypeEnum.DANGER)
      return false;
    }
    else {
      return true;
    }
  }
  selectDefaultProvider() {
    debugger;
    if (this.lookupList.logedInUser.loginProviderId != 0 || this.lookupList.logedInUser.loginProviderId != null) {
      let lstprovider = this.generalOperation.filterArray(this.lookupList.providerList, 'id', this.lookupList.logedInUser.loginProviderId);
      if(lstprovider!=null && lstprovider.length>0)
        this.providerAuthForm.get("cmbProvider").setValue(lstprovider[0].id);
      else
        this.providerAuthForm.get("cmbProvider").setValue(this.provider_id);
      this.providerAuthForm.get("txtUserID").setValue(this.lookupList.logedInUser.user_name);
    }
  }
}