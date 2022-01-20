import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { LogMessage } from 'src/app/shared/log-message';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ORMSaveUser } from 'src/app/models/setting/ORMSaveUser';
import { Md5 } from 'ts-md5';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ORMUser_Providers } from 'src/app/models/setting/ORMUser_Providers';
import { Wrapper_UserSave } from 'src/app/models/setting/WrapperUserSave';
import { ServiceResponseStatusEnum, AlertTypeEnum, PromptResponseEnum, OperationType } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralService } from 'src/app/services/general/general.service';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { SortFilterPaginationResult, NgbdSortableHeader, SortEvent, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  userFormGroup: FormGroup;
  isLoading=false;
  lstUsers: Array<any>;
  lstAllProviders: Array<any>;
  lstUserProviders: Array<any>;
  lstUerProviderIdsDeleted: Array<number>;

  lstRoles: Array<any>;
  lstChartSettings: Array<any>;
  lstSuperBills: Array<any>;


  selectedUserId: number;
  selectedUserDetail: any;
  arrUserTypeList: Array<string> = ["EHR","Billing"]
  addEditOperation: OperationType;

  changePassword: boolean = false;
  addEditView: boolean = false;
  isPwdChanged: boolean = false;

  fileAttached: any;
  arrPrescriptionList: Array<string> = ["", "Administration Only", "Doctor", "Staff"];

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

  constructor(private userService: UserService, private generalService: GeneralService,
    private logMessage: LogMessage, private formBuilder: FormBuilder, @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalOperation: GeneralOperation, private modalService: NgbModal, private dateTimeUtil: DateTimeUtil,
    private sortFilterPaginationService: SortFilterPaginationService) { }

  ngOnInit() {

    debugger;
    this.getUserList();
    this.buildForm();

    this.getChartSettingList();
    this.getSuperBills();
    if (this.lookupList.billingProviderList == undefined || this.lookupList.billingProviderList.length == 0) {
      this.getBillingProviderList();
    }



    //this.enableDisable('disable');
  }
  getBillingProviderList() {
    this.generalService.getBillingProviderList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.billingProviderList = data as Array<any>;
      },
      error => {
      }
    );
  }
  /*
  enableDisable(value) {
    
    if (value == 'disable')
      this.userFormGroup.disable();
    else
      this.userFormGroup.enable();
      
  }*/
  buildForm() {
    this.userFormGroup = this.formBuilder.group({

      txtuserName: this.formBuilder.control(null, Validators.required),
      txtfirstName: this.formBuilder.control(null, Validators.required),
      txtmiddleName: this.formBuilder.control(null),
      txtlastName: this.formBuilder.control(null, Validators.required),
      txtpassword: this.formBuilder.control(null, Validators.required),
      // drpProvider: this.formBuilder.control(null, Validators.required),
      ddBilingProvider: this.formBuilder.control(null),
      ddLocation: this.formBuilder.control(null, Validators.required),
      ddRole: this.formBuilder.control(null, Validators.required),
      ddChartSetting: this.formBuilder.control(null, Validators.required),
      ddPrescriptionRole: this.formBuilder.control(null),
      ddSuperBill: this.formBuilder.control(null),
      chkIsProvider: this.formBuilder.control(null),
      ddProvider: this.formBuilder.control(null),
      rbLabAssignedTo: this.formBuilder.control(false),
      rbIsLabUser: this.formBuilder.control(false),
      rbIsBlocked: this.formBuilder.control(false),
      rbAPIAccess: this.formBuilder.control(false),
      rbOutsideAccess: this.formBuilder.control(false),
      ddlUserType: this.formBuilder.control(null, Validators.required)
    });
  }
  getUserList() {
    this.userService.getUserSetup(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstUsers = data as Array<any>;
        if (this.lstUsers != undefined && this.lstUsers != null) {
          //this.selecteduserIndex = 0;
          //this.selectedUserId=this.lstUsers[0].user_id;
          if (this.selectedUserId == undefined) {
            this.selectedUserId = this.lstUsers[0].user_id;
          }


          this.onuserSelectionChange(this.selectedUserId);
        }
      },
      error => {
      }
    );
  }
  getUserDetail() {
    this.isLoading=true;
    this.userService.getUserDetail(this.selectedUserId).subscribe(
      data => {
        this.selectedUserDetail = data;
        if (this.lstUsers != undefined && this.lstUsers != null) {
          this.assignValues();
        }
        this.isLoading=false;
      },
      error => {
      }
    );
  }
  getChartSettingList() {
    this.userService.getchartModuleSetting(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstChartSettings = data as Array<any>;

      },
      error => {
      }
    );
  }
  getSuperBills() {
    debugger;
    this.userService.getSuperBills(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        debugger;

        this.lstSuperBills = data as Array<any>;

      },
      error => {
      }
    );
  }
  noAssignedProvider = false;
  getUserAssignProvider() {
    this.isLoading=true;
    this.userService.getUserAssignProvider(this.selectedUserId).subscribe(
      data => {
        this.lstUserProviders = data as Array<any>;
        if (this.lstUserProviders != null && this.lstUserProviders.length > 0) {
          this.noAssignedProvider = false;
        }
        else {
          this.noAssignedProvider = true;
        }
        this.isLoading=false;

      },
      error => {
      }
    );
  }
  getUserProviderAll(user_id: number) {
    this.userService.getUserProviderAll(user_id, this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstAllProviders = data as Array<any>;
      },
      error => {
      }
    );
  }
  assignValues() {
    if (this.selectedUserDetail != undefined) {

debugger;
      (this.userFormGroup.get("txtfirstName") as FormControl).setValue(this.selectedUserDetail.first_name);
      (this.userFormGroup.get("txtlastName") as FormControl).setValue(this.selectedUserDetail.last_name);
      (this.userFormGroup.get("txtmiddleName") as FormControl).setValue(this.selectedUserDetail.mname);
      (this.userFormGroup.get("txtuserName") as FormControl).setValue(this.selectedUserDetail.user_name);
      (this.userFormGroup.get("txtpassword") as FormControl).setValue(this.selectedUserDetail.password);
      //(this.userFormGroup.get("drpProvider") as FormControl).setValue(this.selectedUserDetail.default_physician);
      (this.userFormGroup.get("ddBilingProvider") as FormControl).setValue(this.selectedUserDetail.default_billing_phy);
      (this.userFormGroup.get("ddLocation") as FormControl).setValue(this.selectedUserDetail.default_location);
      (this.userFormGroup.get("ddRole") as FormControl).setValue(this.selectedUserDetail.default_role);
      (this.userFormGroup.get("ddChartSetting") as FormControl).setValue(this.selectedUserDetail.default_chart_setting);
      (this.userFormGroup.get("ddPrescriptionRole") as FormControl).setValue(this.selectedUserDetail.default_prescription_role);
      (this.userFormGroup.get("ddSuperBill") as FormControl).setValue(this.selectedUserDetail.default_bill);
      (this.userFormGroup.get("chkIsProvider") as FormControl).setValue(this.selectedUserDetail.is_provider);

      if (this.selectedUserDetail.is_provider) {
        (this.userFormGroup.get("ddProvider") as FormControl).enable();
        (this.userFormGroup.get("ddProvider") as FormControl).setValue(this.selectedUserDetail.provider_id);
      }
      else {
        (this.userFormGroup.get("ddProvider") as FormControl).disable();
        (this.userFormGroup.get("ddProvider") as FormControl).setValue(null);
      }
      (this.userFormGroup.get("rbLabAssignedTo") as FormControl).setValue(this.selectedUserDetail.lab_assigned);
      (this.userFormGroup.get("rbIsLabUser") as FormControl).setValue(this.selectedUserDetail.is_lab_user);
      (this.userFormGroup.get("rbIsBlocked") as FormControl).setValue(this.selectedUserDetail.is_blocked);
      (this.userFormGroup.get("rbAPIAccess") as FormControl).setValue(this.selectedUserDetail.phr_access_allowed);
      (this.userFormGroup.get("rbOutsideAccess") as FormControl).setValue(this.selectedUserDetail.allowed_ip);

      (this.userFormGroup.get("ddlUserType") as FormControl).setValue(this.selectedUserDetail.user_type);
    }
  }

  onEdit() {

    this.addEditView = true;
    this.addEditOperation = OperationType.EDIT;
    this.lstUerProviderIdsDeleted = undefined;

    //console.log('enable');
    //this.enableDisable('enable');
    //this.isDisable = true;
    //this.editAssignedProvider = true;
    this.getUserProviderAll(this.selectedUserDetail.user_id);
    //this.userFormGroup.get('txtuserName').disable();
    //this.addEditOperation = OperationType.EDIT;// "Edit";

    this.userFormGroup.get("txtpassword").disable();

  }
  onCancel() {

    this.clearFields();
    this.addEditView = false;
    this.addEditOperation = undefined;
    this.lstUerProviderIdsDeleted = undefined;
    this.lstAllProviders = undefined;
    this.lstUserProviders = undefined;
    this.selectedUserDetail = undefined;

    if (this.lstUsers != undefined && this.lstUsers != null) {
      //this.selecteduserIndex = 0;
      this.onuserSelectionChange(this.selectedUserId);
    }
    //this.editAssignedProvider = false;
    //this.enableDisable('disable');
    //this.isDisable = false;
    //this.strOperation = "";
  }
  clearFields() {
    this.userFormGroup.reset();
  }
  //isDisable = false;
  onAdd() {

    this.lstUerProviderIdsDeleted = undefined;
    this.addEditView = true;
    this.addEditOperation = OperationType.ADD;
    this.lstAllProviders = undefined;
    this.lstUserProviders = undefined;
    this.selectedUserDetail = undefined;
    this.noAssignedProvider=false;
    //this.enableDisable('enable');
    this.clearFields();
    //this.isDisable = true;
    //this.strOperation = "newrecord";
    //this.editAssignedProvider = true
    this.getUserProviderAll(-1);
    this.userFormGroup.get("txtpassword").enable();
    this.userFormGroup.get("ddProvider").disable();

    (this.userFormGroup.get("rbLabAssignedTo") as FormControl).setValue(false);
    (this.userFormGroup.get("rbIsLabUser") as FormControl).setValue(false);
    (this.userFormGroup.get("rbAPIAccess") as FormControl).setValue(false);
    (this.userFormGroup.get("rbIsBlocked") as FormControl).setValue(false);
    (this.userFormGroup.get("ddLocation") as FormControl).setValue(this.lookupList.logedInUser.defaultLocation);
    (this.userFormGroup.get("rbOutsideAccess") as FormControl).setValue(true);
  }

  //editAssignedProvider = false;
  //onAssignedProviderEdit() {
  //  this.getUserProviderAll(this.lstUsers[this.selecteduserIndex].user_id);
  //  this.editAssignedProvider = true;
  //}
  //onAssignedProviderCancel() {
  //  this.editAssignedProvider = false;
  //}

  addProviderToUserList(provider: any, index: number) {

    debugger;
    if (this.lstUserProviders == undefined) {
      this.lstUserProviders = new Array<any>();
    }

    this.lstUserProviders.push(
      {
        user_provider_id: -1,
        provider_id: provider.id,
        provider_name: provider.name,
        is_default: false
      }
    );

    this.lstAllProviders.splice(index, 1);
    this.noAssignedProvider=false;
    if (this.lstUserProviders.length == 1) {
      this.onSetProviderAsDefault(0);
    }
  }

  /*
  IsAssignedProviderSelect(value, seting) {
    this.lstAllProviders[this.generalOperation.getElementIndex(this.lstAllProviders, seting)].chk = value;
  }
  */
  /*
  setDefaultText(seting) {
    for (let a = 0; a < this.lstAllProviders.length; a++) {
      this.lstAllProviders[a].default_txt = 'Set as default';
    }
    this.lstAllProviders[this.generalOperation.getElementIndex(this.lstAllProviders, seting)].default_txt = 'Default';
    this.lstAllProviders[this.generalOperation.getElementIndex(this.lstAllProviders, seting)].chk = true;

  }
  */
  onSave() {
    debugger;
    if (this.validate() == false) {
      return;
    }
    if (this.addEditOperation == OperationType.ADD) {
      this.checkIfUserExsist();
    }
    else {
      this.saveUser();
    }
  }
  validate(): boolean {

    debugger;
    let strMsg: string = "";

    if (this.addEditOperation == OperationType.ADD) {
      if (this.userFormGroup.get("txtuserName").value == '' || this.userFormGroup.get("txtuserName").value == null) {
        strMsg = "Please enter User Name.";
      }
    }

    if (strMsg == '' && (this.addEditOperation == OperationType.ADD || this.changePassword == true) && (this.userFormGroup.get("txtuserName").value == undefined || this.userFormGroup.get("txtuserName").value == '')) {
      strMsg = "Please enter Password.";
    }
    else if (this.userFormGroup.get("txtfirstName").value == undefined || this.userFormGroup.get("txtfirstName").value == '') {
      strMsg = "Please enter Fist Name.";
    }
    else if (this.userFormGroup.get("txtlastName").value == undefined || this.userFormGroup.get("txtlastName").value == '') {
      strMsg = "Please enter Last Name.";
    }
    else if (this.userFormGroup.get("chkIsProvider").value == true && (this.userFormGroup.get("ddProvider").value == undefined || this.userFormGroup.get("ddProvider").value == '')) {
      strMsg = "Please select provider if user is a provider.";
    }
    else if (this.userFormGroup.get("ddRole").value == undefined || this.userFormGroup.get("ddRole").value == '') {
      strMsg = "Please select default role.";
    }
    else if (this.userFormGroup.get("ddRole").value == undefined || this.userFormGroup.get("ddRole").value == '') {
      strMsg = "Please select default role.";
    }
    else if (this.userFormGroup.get("ddLocation").value == undefined || this.userFormGroup.get("ddLocation").value == '') {
      strMsg = "Please select Location.";
    }
    else if (this.userFormGroup.get("ddChartSetting").value == undefined || this.userFormGroup.get("ddChartSetting").value == '') {
      strMsg = "Please select Chart Settings.";
    }






    if (strMsg == '') {
      if (this.lstUserProviders == undefined || this.lstUserProviders.length == 0) {
        strMsg = "Please assign at least one provider to user.";
      }
      else {

        let requireDefault: boolean = true;
        this.lstUserProviders.forEach(upr => {
          if (upr.is_default) {
            requireDefault = false;
          }
        });

        if (requireDefault) {
          strMsg = "Please select default provider for user.";
        }
      }

    }

    //Assigned Provider check
    //return true;


    if (strMsg != '') {
      GeneralOperation.showAlertPopUp(this.modalService, 'User Setting', strMsg, 'warning');
      return false;
    }
    else {
      return true;
    }
  }
  checkIfUserExsist() {
    debugger;
    let userName: string = this.userFormGroup.get("txtuserName").value + this.lookupList.practiceInfo.domain;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "user_name", value: userName, option: "" },
      { name: "purpose", value: 'new_record', option: "" }
    ];
    this.userService.checkIfUserExsist(searchCriteria).subscribe(
      data => {
        debugger;
        if (data == true) {
          GeneralOperation.showAlertPopUp(this.modalService, "User Setting", "Username already exsist. Please try another.", 'warning')
        }
        else {
          //save record
          this.saveUser();
        }
      },
      error => {
      }
    );
  }
  saveUser() {
    debugger;
    let userObj: ORMSaveUser = new ORMSaveUser;

    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    if (this.addEditOperation == OperationType.EDIT) {
      userObj.user_id = this.selectedUserDetail.user_id;
      userObj.user_name = this.selectedUserDetail.user_name;
      userObj.date_created = this.selectedUserDetail.date_created;
      userObj.client_date_created = this.selectedUserDetail.client_date_created;
      userObj.created_user = this.selectedUserDetail.created_user;
      //userObj.allowed_ip = this.selectedUserDetail.allowed_ip;
    }
    if (this.addEditOperation == OperationType.ADD) {
      userObj.client_date_created = clientDateTime;
      userObj.created_user = this.lookupList.logedInUser.user_name;
      userObj.user_name = this.userFormGroup.get("txtuserName").value + this.lookupList.practiceInfo.domain;
    }
    userObj.modified_user = this.lookupList.logedInUser.user_name;
    userObj.client_date_modified = clientDateTime;
    userObj.system_ip = this.lookupList.logedInUser.systemIp;
    userObj.practice_id = this.lookupList.practiceInfo.practiceId;

    userObj.first_name = this.userFormGroup.get("txtfirstName").value;
    userObj.last_name = this.userFormGroup.get("txtlastName").value;
    userObj.mname = this.userFormGroup.get("txtmiddleName").value;

    if (this.changePassword || this.addEditOperation == OperationType.ADD) {
      userObj.password = Md5.hashStr(this.userFormGroup.get("txtpassword").value).toString();
    }
    else {
      userObj.password = this.selectedUserDetail.password;
    }

    userObj.default_role = this.userFormGroup.get("ddRole").value;

    userObj.default_billing_phy = this.userFormGroup.get("ddBilingProvider").value;
    userObj.default_location = this.userFormGroup.get("ddLocation").value;
    userObj.default_chart_setting = this.userFormGroup.get("ddChartSetting").value;
    userObj.default_prescription_role = this.userFormGroup.get("ddPrescriptionRole").value;
    userObj.default_bill = this.userFormGroup.get("ddSuperBill").value;
    userObj.lab_assigned = this.userFormGroup.get("rbLabAssignedTo").value;
    userObj.is_lab_user = this.userFormGroup.get("rbIsLabUser").value;
    userObj.allowed_ip = this.userFormGroup.get("rbOutsideAccess").value;
    
    userObj.is_provider = this.userFormGroup.get("chkIsProvider").value;
    if (this.userFormGroup.get("chkIsProvider").value == true) {
      userObj.provider_id = this.userFormGroup.get("ddProvider").value;
    }

    userObj.is_blocked = this.userFormGroup.get("rbIsBlocked").value;
    userObj.phr_access_allowed = this.userFormGroup.get("rbAPIAccess").value;

    if(this.lookupList.practiceInfo.practiceId==524)
      userObj.user_type = ((this.userFormGroup.get('ddlUserType') as FormControl).value=="EHR"?"":(this.userFormGroup.get('ddlUserType') as FormControl).value);

    //User Provider
    let lstProvider: Array<ORMUser_Providers> = new Array;
    if (this.lstUserProviders != undefined) {
      this.lstUserProviders.forEach(pro => {

        if (pro.is_default) {
          userObj.default_physician = pro.provider_id;
        }

        if (pro.user_provider_id < 0 || pro.modify_flag == true) {

          let objProvider: ORMUser_Providers = new ORMUser_Providers;


          if (pro.user_provider_id < 0) {
            objProvider.client_date_created = clientDateTime;
            objProvider.created_user = this.lookupList.logedInUser.user_name;
          }
          else {
            objProvider.user_provider_id = pro.user_provider_id;
            objProvider.date_created = pro.date_created;
            objProvider.client_date_created = pro.client_date_created;
            objProvider.created_user = pro.created_user;
          }

          objProvider.practice_id = this.lookupList.practiceInfo.practiceId;
          objProvider.modified_user = this.lookupList.logedInUser.user_name;

          objProvider.client_date_modified = clientDateTime;
          objProvider.provider_id = pro.provider_id;
          objProvider.system_ip = this.lookupList.logedInUser.systemIp;

          lstProvider.push(objProvider);
        }

      });
    }

    let userSaveObjectWrapper: Wrapper_UserSave = new Wrapper_UserSave(userObj, lstProvider, this.lstUerProviderIdsDeleted);
    debugger;
    this.userService.saveUser(userSaveObjectWrapper).subscribe(
      data => {
        debugger;
        this.saveUserSuccess(data);
      },
      error => {
        debugger;
        this.saveUserError(error);
      }
    );
  }

  saveUserSuccess(data: any) {
    debugger;

    //this.enableDisable('disable');
    //this.isDisable = false;
    //this.strOperation = "";
    //this.editAssignedProvider = false;

    //this.getUserAssignProvider(data['result']);
    //this.getUserDetail(data['result']);
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      GeneralOperation.showAlertPopUp(this.modalService, "User Setting", "User save successfully.", AlertTypeEnum.INFO)
      this.addEditOperation = undefined;
      this.addEditView = false;
      this.selectedUserId = Number(data.result);
      this.getUserList()
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.modalService, "User Setting", data.response, AlertTypeEnum.DANGER)
    }
  }
  saveUserError(error: any) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'User Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving User."
  }
  onDelete() {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;// 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.selectedUserDetail.user_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.userService.deleteUser(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("User Setup Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      for (let index = 0; index < this.lstUsers.length; index++) {

        if (this.lstUsers[index].user_id == this.selectedUserId) {
          this.lstUsers.splice(index, 1);
          break;
        }
      }
      this.selectedUserId = undefined;
      this.selectedUserDetail = undefined;
      this.lstUserProviders=undefined;

      if (this.lstUsers != undefined && this.lstUsers.length > 0) {
        this.selectedUserId = this.lstUsers[0].user_id;
        this.onuserSelectionChange(this.selectedUserId);
      }

    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "User Setup"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }

  }
  onAssignedProviderDelete(userProvider: any, index: number) {

    debugger;
    if (userProvider.user_provider_id > 0) {
      if (this.lstUerProviderIdsDeleted == undefined) {
        this.lstUerProviderIdsDeleted = new Array<number>();
      }
      this.lstUerProviderIdsDeleted.push(userProvider.user_provider_id);
    }


    let setNewDefault: boolean = false;
    if (this.lstUserProviders[index].is_default) {
      setNewDefault = true;
    }

    this.lstUserProviders.splice(index, 1);

    if (setNewDefault) {
      this.onSetProviderAsDefault(0);
    }

    /*
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.user_provider_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.userService.deleteUserProvider(deleteRecordData)
          .subscribe(
            data => this.lstUserProviders.splice(this.generalOperation.getElementIndex(this.lstUserProviders, obj)),
            error => alert(error),
            () => this.logMessage.log("User Setup Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
    */
  }
  onSetProviderAsDefault(index: number) {

    if (this.lstUserProviders != undefined && this.lstUserProviders.length > 0) {

      for (let i: number = 0; i < this.lstUserProviders.length; i++) {

        if (this.lstUserProviders[i].is_default == true) {
          this.lstUserProviders[i].is_default = false;
          this.lstUserProviders[i].modify_flag = true;
          break;
        }

      }

      this.lstUserProviders[index].is_default = true;
      this.lstUserProviders[index].modify_flag = true;

    }


    /*

    debugger;
    let recordData = new ORMDeleteRecord();
    recordData.column_id = this.selectedUserDetail.user_id + '^' + obj.provider_id;
    recordData.modified_user = this.lookupList.logedInUser.user_name;
    recordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
    recordData.client_ip = this.lookupList.logedInUser.systemIp;

    this.userService.setDefaultUserProvider(recordData)
      .subscribe(
        data => {
          this.getUserAssignProvider();
        }
        ,
        error => alert(error),
        () => this.logMessage.log("onAssignedProviderSetDefault Successfull.")
      );
      */
  }


  //selecteduserIndex:number = 0;
  onuserSelectionChange(userId: number) {

    if (!this.addEditView) {
      this.selectedUserId = userId;
      this.getUserDetail();
      this.getUserAssignProvider();
    }

  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;

  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;

    this.search();
  }

  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstUsers, this.headers, this.sortEvent, null, null,'');
    this.lstUsers = sortFilterPaginationResult.list;

    debugger;
    //this.selecteduserIndex = 0;
    //this.selectedUserId=this.lstUsers[0].user_id;
    if (this.lstUsers != null && this.lstUsers.length > 0) {
      this.onuserSelectionChange(this.lstUsers[0].user_id);
    }

  }


  changePwdClicked() {
    this.changePassword = true;
  }
  cancelChangePwdClicked() {
    this.changePassword = false;
  }


  onChkChangePwdChange(e: any) {
    debugger;
    var checked = e.target.checked;
    console.log(checked); // {}, true || false
    if (checked) {
      this.userFormGroup.get("txtpassword").enable();
      this.userFormGroup.get("txtpassword").setValue(null);
      this.changePassword = true;
    }
    else {
      this.userFormGroup.get("txtpassword").disable();
      this.userFormGroup.get("txtpassword").setValue(this.selectedUserDetail.password);
      this.changePassword = false;
    }
  }
  onChkIsProviderChange(e: any) {
    debugger;
    var checked = e.target.checked;
    console.log(checked); // {}, true || false
    if (checked) {
      this.userFormGroup.get("ddProvider").enable();
      this.userFormGroup.get("ddProvider").setValue(null);
    }
    else {
      this.userFormGroup.get("ddProvider").disable();
      this.userFormGroup.get("ddProvider").setValue(this.selectedUserDetail.password);
    }
  }
}
