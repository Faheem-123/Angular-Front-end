import { Component, OnInit, Inject } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { GeneralService } from 'src/app/services/general/general.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { AlertTypeEnum, PromptResponseEnum, ServiceResponseStatusEnum, OperationType } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { Md5 } from 'ts-md5';
import { ORMUserInsert } from 'src/app/models/billing/ORMUserInsert';
import { ORMUserPractices } from 'src/app/models/billing/ORMUserPractices';

@Component({
  selector: 'billing-users',
  templateUrl: './billing-users.component.html',
  styleUrls: ['./billing-users.component.css']
})
export class BillingUsersComponent implements OnInit {

  lstUserData: Array<any>;
  lstAllPractices: Array<any>;
  lstUserPractices: Array<any>;
  addEditView: boolean = false;
  addEditOperation: String;
  billingUserFormGroup: FormGroup;
  selectedUserDetail: any;
  arrPrescriptionList: Array<string> = ["", "Administration Only", "Doctor", "Staff"];
  arrUserTypeList: Array<string> = ["Billing", "Transcription"]
  lstChartSettings: Array<any>;
  lstSuperBills: Array<any>;
  selectedUserId: number;
  isPwdChanged: boolean = false;
  acPracticeSeletedSave: Array<ORMUserPractices>;
  BroleList: Array<any>;

  objFirst_name;
  objMname;
  objUser_name;
  objBilling_phy_name;
  objLoc_name;
  objChart_setting_name;
  objDefault_bill_name;
  objLast_name;
  objDefault_phy_name;
  objRole_name;
  objDefault_prescription_role;
  objUser_type;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private userService: UserService, private generalService: GeneralService, private generalOperation: GeneralOperation,
    private modalService: NgbModal, private dateTimeUtil: DateTimeUtil, private logMessage: LogMessage,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.buildForm();


    //this.getBillingUserDetails();

    if (this.lookupList.billingProviderList == undefined || this.lookupList.billingProviderList.length == 0) {
      this.getBillingProviderList();
    }
    this.getStartUp();
  }

  getStartUp() {
    this.getBillingUserDetails();
    this.getAllPractices();
    this.getUserPractices();
    this.getChartModuleSetting();
    this.getSuperBills();
    this.getUserAllRoles();
  }

  buildForm() {
    this.billingUserFormGroup = this.formBuilder.group({
      txtfirstName: this.formBuilder.control(null, Validators.required),
      txtlastName: this.formBuilder.control(null, Validators.required),
      txtmiddleName: this.formBuilder.control(null, Validators.required),
      txtuserName: this.formBuilder.control(null, Validators.required),
      ddlDefaultPhysician: this.formBuilder.control(null, Validators.required),
      ddLocation: this.formBuilder.control(null, Validators.required),
      ddlDefaultChartSetting: this.formBuilder.control(null, Validators.required),
      ddlDefaultSuperBill: this.formBuilder.control(null, Validators.required),
      txtpassword: this.formBuilder.control(null, Validators.required),
      ddBilingProvider: this.formBuilder.control(null, Validators.required),
      ddRole: this.formBuilder.control(null, Validators.required),
      ddlPrescriptionRole: this.formBuilder.control(null, Validators.required),
      ddlUserType: this.formBuilder.control(null, Validators.required)
    })
  }
  getSuperBills() {
    this.userService.getSuperBills(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstSuperBills = data as Array<any>;
      },
      error => {
      }
    );
  }
  getChartModuleSetting() {
    this.userService.getchartModuleSetting(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstChartSettings = data as Array<any>;

      },
      error => {
      }
    );
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
  // getBillingUserDetails(){
  //   this.userService.getBillingUserDetails(this.lookupList.practiceInfo.practiceId).subscribe(
  //     data => {
  //       this.lstUserData = data as Array<any>;
  //       if(this.lstUserData)
  //         this.userChagned(this.lstUserData[0]);
  //     },
  //     error => {
  //     }
  //   );
  // }
  getUserPractices() {
    this.userService.getUserPractices().subscribe(
      data => {
        this.lstUserPractices = data as Array<any>;
      },
      error => {
      }
    );
  }
  getAllPractices() {
    this.userService.getAllPractices().subscribe(
      data => {
        this.lstAllPractices = data as Array<any>;
      },
      error => {
      }
    );
  }
  userChagned(value) {
    this.selectedUserId = value.user_id;
    this.getUserDetail();
  }
  getUserDetail() {
    this.userService.getUserDetail(this.selectedUserId).subscribe(
      data => {
        this.selectedUserDetail = data;
        if (this.selectedUserDetail != null || this.selectedUserDetail != undefined) {
          this.assignLabelValues(this.selectedUserDetail);
        }
        if (this.lstUserData != undefined && this.lstUserData != null) {
          this.assignValues();
        }
      },
      error => {
      }
    );
  }
  assignLabelValues(value) {
    this.objFirst_name = value.first_name;
    this.objMname = value.mname;
    this.objUser_name = value.user_name;
    this.objBilling_phy_name = value.billing_phy_name;
    this.objLoc_name = value.loc_name;
    this.objChart_setting_name = value.chart_setting_name;
    this.objDefault_bill_name = value.default_bill_name;
    this.objLast_name = value.last_name;
    this.objDefault_phy_name = value.billing_phy_name;
    this.objRole_name = value.role_name;
    this.objDefault_prescription_role = value.default_prescription_role;
    this.objUser_type = value.user_type;
  }
  getBillingUserDetails() {
    this.userService.getUserSetup(this.lookupList.logedInUser.userPracticeId).subscribe(
      data => {
        this.lstUserData = data as Array<any>;
        if (this.lstUserData != undefined && this.lstUserData.length > 0) {
          //this.userChagned(this.lstUserData[0].user_id);
          this.selectedUserId = this.lstUserData[0].user_id;
          this.getUserDetail();
        }
      },
      error => {
      }
    );
  }

  getUserAllRoles() {
    debugger;
    this.generalService.getUserAllRoles(this.lookupList.logedInUser.userPracticeId).subscribe(
      data => {
        this.BroleList  = data as Array<any>;
      },
      error => {
        this.logMessage.log("getUserRole: " + error);
      }
    );
  }

  assignValues() {
    if (this.selectedUserDetail != undefined){
      (this.billingUserFormGroup.get("txtfirstName") as FormControl).setValue(this.selectedUserDetail.first_name);
      (this.billingUserFormGroup.get("txtlastName") as FormControl).setValue(this.selectedUserDetail.last_name);
      (this.billingUserFormGroup.get("txtmiddleName") as FormControl).setValue(this.selectedUserDetail.mname);
      (this.billingUserFormGroup.get("txtuserName") as FormControl).setValue(this.selectedUserDetail.user_name);
      (this.billingUserFormGroup.get("txtpassword") as FormControl).setValue(this.selectedUserDetail.password);
      (this.billingUserFormGroup.get("ddBilingProvider") as FormControl).setValue(this.selectedUserDetail.default_billing_phy);
      (this.billingUserFormGroup.get("ddLocation") as FormControl).setValue(this.selectedUserDetail.default_location);
      (this.billingUserFormGroup.get("ddRole") as FormControl).setValue(this.selectedUserDetail.default_role);
      (this.billingUserFormGroup.get("ddlDefaultChartSetting") as FormControl).setValue(this.selectedUserDetail.default_chart_setting);
      (this.billingUserFormGroup.get("ddlPrescriptionRole") as FormControl).setValue(this.selectedUserDetail.default_prescription_role);
      (this.billingUserFormGroup.get("ddlDefaultSuperBill") as FormControl).setValue(this.selectedUserDetail.default_bill);
      (this.billingUserFormGroup.get("ddlDefaultPhysician") as FormControl).setValue(this.selectedUserDetail.default_physician);
      (this.billingUserFormGroup.get("ddlUserType") as FormControl).setValue(this.selectedUserDetail.user_type);
    }
    // let acUserPractices = this.generalOperation.filterArray(this.lstUserPractices, "address", this.selectedUserDetail.user_id);
    // for (var i = 0; i < this.lstAllPractices.length; i++) {
    //   this.lstAllPractices[i].address = "0";
    // }
    // if(acUserPractices)
    //   for (var i = 0; i < acUserPractices.length; i++) {
    //     let acAllPractices = this.generalOperation.filterArray(this.lstUserPractices, "id", acUserPractices[i].name);
    //     if(acAllPractices !=null && this.lstAllPractices.length>0){
    //       this.lstAllPractices[i].address = true;
    //     }
    //   }

    let acUserPractices = this.generalOperation.filterArray(this.lstUserPractices, "address", this.selectedUserDetail.user_id);
    //for (var i:int = 0; i < acAllPractices.length; i++) 
    for (var i = 0; i < this.lstAllPractices.length; i++) {
      this.lstAllPractices[i].address = false;
    }



    for (var i = 0; i < acUserPractices.length; i++) {
      let acAllPractices = this.generalOperation.filterArray(this.lstAllPractices, "id", acUserPractices[i].name);

      for (var z = 0; z < this.lstAllPractices.length; z++) {
        if (this.lstAllPractices[z].id == acAllPractices[0].id) {
          this.lstAllPractices[z].address = true;
          break;
        }
      }

      //if(acAllPractices!=null && acAllPractices.length > 0)
      //if(this.lstAllPractices)


      //acAllPractices.refresh();
    }


  }
  // getUserDetail() {
  //   this.userService.getUserDetail(this.selectedUserId).subscribe(
  //     data => {
  //       this.selectedUserDetail = data;
  //       // if (this.lstUsers != undefined && this.lstUsers != null) {
  //       //   this.assignValues();
  //       // }
  //     },
  //     error => {
  //     }
  //   );
  // }
  onChkChangePwdChange(e: any) {
    var checked = e.target.checked;
    console.log(checked); // {}, true || false
    if (checked) {
      this.billingUserFormGroup.get("txtpassword").enable();
      this.billingUserFormGroup.get("txtpassword").setValue(null);
      this.isPwdChanged = true;
    }
    else {
      this.billingUserFormGroup.get("txtpassword").disable();
      this.billingUserFormGroup.get("txtpassword").setValue(this.selectedUserDetail.password);
      this.isPwdChanged = false;
    }
  }
  onAdd() {
    this.addEditView = true;
    this.addEditOperation = OperationType.ADD;
    this.clearFields();
  }
  onEdit() {
    this.addEditView = true;
    this.addEditOperation = OperationType.EDIT;
    this.billingUserFormGroup.get("txtpassword").disable();
  }
  clearFields() {
    this.billingUserFormGroup.reset();

    for (var z = 0; z < this.lstAllPractices.length; z++) {
      if (this.lstAllPractices[z].address == true) {
        this.lstAllPractices[z].address = false;
      }
    }
  }
  onCancel() {
    this.addEditView = false;
    this.addEditOperation = undefined;
    this.selectedUserDetail = undefined;
    this.clearFields();
    if (this.lstUserData != undefined && this.lstUserData.length > 0) {
      //this.selectedUserId = this.lstUserData[0].user_id;
      this.userChagned(this.lstUserData[0]);
    }
  }
  onDelete() {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;
    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.selectedUserDetail.user_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.userService.deleteBillingUser(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("User Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    if (data == "1") {
      this.getStartUp();
    }
    else {
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
  practiceCheckBoxChk(id, event) {
    for (var i = 0; i < this.lstAllPractices.length; i++) {
      if (event == true) {
        if (this.lstAllPractices[i].id == id) {
          this.lstAllPractices[i].address = true;
          return;
        }
      } else if (event == false) {
        if (this.lstAllPractices[i].id == id) {
          this.lstAllPractices[i].address = false;
          return;
        }
      }
    }
  }
  saveBillingUser() {
    // if (this.validate() == false) {
    //   return;
    // }
    if (this.addEditOperation == OperationType.ADD) {
      this.checkIfUserExsist();
    }
    else {
      this.saveUser();
    }
  }
  checkIfUserExsist(){
    let userName: string = this.billingUserFormGroup.get("txtuserName").value + "@IHC";
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "user_name", value: userName, option: "" },
      { name: "purpose", value: 'new_record', option: "" }
    ];
    this.userService.checkIfUserExsist(searchCriteria).subscribe(
      data => {
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
  saveUser(){
    if (this.billingUserFormGroup.get("txtuserName").value == '' || this.billingUserFormGroup.get("txtuserName").value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "User Name", "Please Enter User Name.", 'warning')
      return;
    }
    if (this.billingUserFormGroup.get("txtpassword").value == '' || this.billingUserFormGroup.get("txtpassword").value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "User Password", "Please Enter Password.", 'warning')
      return;
    }

    let userObj: ORMUserInsert = new ORMUserInsert;
    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    if (this.addEditOperation == OperationType.ADD) {
      userObj.created_user = this.lookupList.logedInUser.user_name;
      userObj.client_date_created = clientDateTime;
      userObj.user_name = (this.billingUserFormGroup.get('txtuserName') as FormControl).value + "@IHC";
    }
    else if (this.addEditOperation == OperationType.EDIT) {
      userObj.user_id = this.selectedUserDetail.user_id;
      userObj.created_user = this.selectedUserDetail.created_user;
      userObj.client_date_created = this.selectedUserDetail.client_date_created;
      userObj.date_created = this.selectedUserDetail.date_created;
      userObj.user_name = this.selectedUserDetail.user_name;
    }
    userObj.first_name = (this.billingUserFormGroup.get('txtfirstName') as FormControl).value;
    userObj.last_name = (this.billingUserFormGroup.get('txtlastName') as FormControl).value;
    userObj.mname = (this.billingUserFormGroup.get('txtmiddleName') as FormControl).value;
    //userObj.password = (this.billingUserFormGroup.get('txtpassword') as FormControl).value;
    if (this.isPwdChanged || this.addEditOperation == OperationType.ADD) {
      userObj.password = Md5.hashStr(this.billingUserFormGroup.get("txtpassword").value).toString();
    }
    else {
      userObj.password = this.selectedUserDetail.password;
    }
    userObj.default_role = (this.billingUserFormGroup.get('ddRole') as FormControl).value;
    userObj.default_physician = (this.billingUserFormGroup.get('ddlDefaultPhysician') as FormControl).value;
    userObj.default_billing_phy = (this.billingUserFormGroup.get('ddBilingProvider') as FormControl).value;
    userObj.default_location = (this.billingUserFormGroup.get('ddLocation') as FormControl).value;
    userObj.modified_user = this.lookupList.logedInUser.user_name;
    userObj.client_date_modified = clientDateTime;
    userObj.practice_id = this.lookupList.logedInUser.userPracticeId.toString();
    userObj.default_chart_setting = (this.billingUserFormGroup.get('ddlDefaultChartSetting') as FormControl).value;
    userObj.default_prescription_role = (this.billingUserFormGroup.get('ddlPrescriptionRole') as FormControl).value;
    userObj.default_bill = (this.billingUserFormGroup.get('ddlDefaultSuperBill') as FormControl).value;
    userObj.lab_assigned = false;
    userObj.is_lab_user = false;
    userObj.deleted = false;
    userObj.is_provider = false;
    userObj.is_blocked = false;
    userObj.user_type = (this.billingUserFormGroup.get('ddlUserType') as FormControl).value;
    this.userService.saveupdateBillingUser(userObj)
      .subscribe(
        data => this.BillingUserSuccessfull(data),
        error => {
          this.saveUserError(error);
        }
      );
  }
  saveUserError(error: any) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Billing User Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving User."
  }
  BillingUserSuccessfull(data) {
    this.setPractice_User(data);
  }

  setPractice_User(value){
    let practObj: ORMUserPractices = new ORMUserPractices;
    this.acPracticeSeletedSave = new Array();
    let lstPractUsers = this.generalOperation.filterArray(this.lstAllPractices, "address", true);

    for (var i = 0; i < lstPractUsers.length; i++) {
      if (lstPractUsers[i].address == true) {
        practObj = new ORMUserPractices();
        practObj.user_practice_id = "";
        practObj.practice_id = lstPractUsers[i].id;
        practObj.user_id = value.user_id;
        practObj.created_user = this.lookupList.logedInUser.user_name;
        practObj.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        this.acPracticeSeletedSave.push(practObj);
      }
    }
    if (this.acPracticeSeletedSave.length > 0) {
      this.userService.SavePracticeList(this.acPracticeSeletedSave)
        .subscribe(
          data => this.SavePracticeListSuccessfull(),
          error => alert(error),
          () => this.logMessage.log("Save template section checkbox.")
        );
    }
  }
  SavePracticeListSuccessfull() {
    //this.getBillingUserDetails();
    this.onCancel();
    this.getStartUp();
  }
}