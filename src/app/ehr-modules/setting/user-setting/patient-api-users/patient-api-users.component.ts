import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ORMAPIUserPatientSave } from 'src/app/models/patient/orm-patient-api-user-patients-save';
import { ORMAPIUserSave } from 'src/app/models/patient/orm-patient-api-user-save';
import { WrapperPatientAPIUserSave } from 'src/app/models/patient/WrapperPatientAPIUserSave';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { PatientService } from 'src/app/services/patient/patient.service';
import { CustomValidators } from 'src/app/shared/custome-validators';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { AlertTypeEnum, CallingFromEnum, OperationType, PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { LogMessage } from 'src/app/shared/log-message';
import { Md5 } from 'ts-md5';
import { SetupService } from 'src/app/services/setup.service';

@Component({
  selector: 'patient-api-users',
  templateUrl: './patient-api-users.component.html',
  styleUrls: ['./patient-api-users.component.css']
})
export class PatientApiUsersComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  @Input() patientId: number;


  patientInfo: any;
  //isLoading = false;
  isLoading: boolean = false;
  arrAllModule;
  phrRightsFList: Array<any>;
  selectedRightRow = 0;
  @ViewChild('txtPatientSearch') txtPatientSearch: ElementRef;

  searchFormGroup: FormGroup;
  userFormGroup: FormGroup;

  showPatientSearchCriteria: boolean = false;
  //patientIdSearchCriteria: number;
  //patientNameSearchCriteria: number;

  showPatientSearch: boolean = false;
  patientIdSearch: number;
  patientNameSearh: number;

  printView: boolean = false;
  addEditView: boolean = false;
  addEditOperation: OperationType;


  lstUsersList: Array<any>;
  lstUserPatientsList: Array<any>;
  userIdSelected: number;
  selectedUser: any;

  lstDeletedUserPatientIds: Array<number>;
  rights: string = "";
  selectedRights: Array<any>;
  lstUserRlationshipg: Array<any> = [{ code: 'self', description: 'Self' }, { code: 'representative', description: 'Representative' }];

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };


  /*** PRINT Variables */
  printLocationName: string = "";
  printLocationAddress: string = "";
  printLocationCityStateZip: string = "";
  printLocationPhone: string = "";
  printLocationFax: string = "";
  printDateTime: string = "";

  /*** END PRINT Variables */

  constructor(private formBuilder: FormBuilder,
    private patientService: PatientService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal, private generalOperation: GeneralOperation,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private generalService: GeneralService, private setupService: SetupService) { }

  ngOnInit() {

    this.printDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
    this.printLocationAddress = this.lookupList.practiceInfo.address1;
    this.printLocationCityStateZip = this.lookupList.practiceInfo.city + ", " + this.lookupList.practiceInfo.state + " " + this.lookupList.practiceInfo.zip;
    this.printLocationPhone = this.lookupList.practiceInfo.phone;
    this.printLocationFax = this.lookupList.practiceInfo.fax;

    this.buildForm();

    if (this.callingFrom == CallingFromEnum.PATIENT) {
      this.getAPIUsers();
      this.getPatientInfo();
    }
    this.getEncounterAllModule();
  }
  getEncounterAllModule() {
    this.setupService.getSetupChartModuleAll().subscribe(
      data => {
        this.arrAllModule = data as Array<any>;
        if (this.arrAllModule.length > 0)
          this.getPHRrole();
      },
      error => {
      }
    );
  }
  getPHRrole() {
    debugger;
    if (this.phrRightsFList == undefined) {
      this.phrRightsFList = new Array<any>();
    }
    if (this.arrAllModule) {
      //this.arrAllModule[0].module_id
      for (let i = 0; i < this.arrAllModule.length; i++) {
        if (this.arrAllModule[i].module_id == "1" || this.arrAllModule[i].module_id == "2" || this.arrAllModule[i].module_id == "3" ||
          this.arrAllModule[i].module_id == "4" || this.arrAllModule[i].module_id == "5" || this.arrAllModule[i].module_id == "6" ||
          this.arrAllModule[i].module_id == "7" || this.arrAllModule[i].module_id == "8" || this.arrAllModule[i].module_id == "9" ||
          this.arrAllModule[i].module_id == "10" || this.arrAllModule[i].module_id == "11" || this.arrAllModule[i].module_id == "17" ||
          this.arrAllModule[i].module_id == "18" || this.arrAllModule[i].module_id == "37") {
          //this.phrRightsFList.(this.arrAllModule[i].module_name);
          this.phrRightsFList.push({ name: this.arrAllModule[i].module_name, id: this.arrAllModule[i].module_id });
        }

      }
      this.phrRightsFList.push({ name: "labresult", id: "labresult" });
      this.phrRightsFList.push({ name: "message", id: "message" });
      this.phrRightsFList.push({ name: "viewccd", id: "viewccd" });
      this.phrRightsFList.push({ name: "downloadccd", id: "downloadccd" });
      this.phrRightsFList.push({ name: "transmitccd", id: "transmitccd" });
      this.selectedRightRow = 0;
    }
  }
  getPatientInfo() {
    this.patientService.getPatient(this.patientId).subscribe(
      data => {
        this.patientInfo = data;
      },
      error => {
        this.logMyError("getPatient Error.",error);
      }
    );
  }

  buildForm() {

    this.searchFormGroup = this.formBuilder.group({
      txtUserNameSearch: this.formBuilder.control(null),
      txtLastNameSearch: this.formBuilder.control(null),
      txtFirstNameSearch: this.formBuilder.control(null),
      txtPatientIdHiddenSearchCrieteria: this.formBuilder.control(null),
      txtPatientSearchCriteria: this.formBuilder.control(null)
    }
    );

    this.userFormGroup = this.formBuilder.group({
      txtUserName: this.formBuilder.control(null),
      txtLastName: this.formBuilder.control(null),
      txtFirstName: this.formBuilder.control(null),
      chkChangePwd: this.formBuilder.control(false),
      txtPassword: this.formBuilder.control(null),
      txtConfirmPassword: this.formBuilder.control(null),
      txtEmail: this.formBuilder.control(null),
      txtContactNumber: this.formBuilder.control(null),
      rbIsBlocked: this.formBuilder.control(false)
    },
      {
        validator: Validators.compose([
          CustomValidators.matchPassword('txtPassword', 'txtConfirmPassword')
        ])
      }
    );

  }

  onAPIUserSearchClicked() {

    this.lstUserPatientsList = undefined;
    this.lstUsersList = undefined;
    this.userIdSelected = undefined;
    this.selectedUser = undefined;

    this.getAPIUsers();
  }

  getAPIUsers() {
    let searchCriteria: SearchCriteria;
    if (this.callingFrom == CallingFromEnum.PATIENT) {
      searchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [{ name: 'patient_id', value: this.patientId, option: '' }];
    }
    else {
      if ((this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').value == undefined || this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').value == '')
        && (this.searchFormGroup.get('txtUserNameSearch').value == undefined || this.searchFormGroup.get('txtUserNameSearch').value == '')
        && (this.searchFormGroup.get('txtLastNameSearch').value == undefined || this.searchFormGroup.get('txtLastNameSearch').value == '')
        && (this.searchFormGroup.get('txtFirstNameSearch').value == undefined || this.searchFormGroup.get('txtFirstNameSearch').value == '')
      ) {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient API Users', 'Please select at least one search criteria.', AlertTypeEnum.WARNING);

      }
      else {

        searchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [];

        if (this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').value != undefined && this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').value != '') {
          searchCriteria.param_list.push({ name: 'patient_id', value: this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').value, option: '' });
        }
        if ((this.searchFormGroup.get('txtUserNameSearch').value != undefined && this.searchFormGroup.get('txtUserNameSearch').value != '')) {
          searchCriteria.param_list.push({ name: 'user_name', value: (this.searchFormGroup.get('txtUserNameSearch').value + this.lookupList.practiceInfo.domain), option: '' });
        }
        if ((this.searchFormGroup.get('txtLastNameSearch').value != undefined && this.searchFormGroup.get('txtLastNameSearch').value != '')) {
          searchCriteria.param_list.push({ name: 'last_name', value: this.searchFormGroup.get('txtLastNameSearch').value, option: '' });
        }
        if ((this.searchFormGroup.get('txtFirstNameSearch').value != undefined && this.searchFormGroup.get('txtFirstNameSearch').value != '')) {
          searchCriteria.param_list.push({ name: 'first_name', value: this.searchFormGroup.get('txtFirstNameSearch').value, option: '' });
        }
      }
    }

    this.isLoading = true;
    if (searchCriteria != undefined) {
      this.patientService.getAPIUsers(searchCriteria).subscribe(
        data => {
          debugger;
          this.lstUsersList = data as Array<any>;

          if (this.lstUsersList != undefined && this.lstUsersList.length > 0) {

            if (this.userIdSelected != undefined) {

              this.lstUsersList.forEach(element => {
                if (element.user_id == this.userIdSelected) {
                  this.selectedUser = element;
                }
              });
            }


            if (this.selectedUser == undefined) {
              this.selectedUser = this.lstUsersList[0];
            }

            this.onUserSelectionChanged(this.selectedUser);

          }
          this.isLoading = false;
        },
        error => {
          this.logMessage.log('getAPIUsers Error.' + error);
        }
      );
    } else {
      this.isLoading = false;
    }

  }


  // getAPIUsersError(error: any) {
  //   this.logMessage.log('getAPIUsers Error.' + error);
  // }

  onUserSelectionChanged(user: any) {
    debugger;
    if (!this.addEditView && user != undefined) {
      this.selectedUser = user;
      this.userIdSelected = user.user_id;
      this.getAPIUserPatients();
      if (user.user_rights) {
        this.selectedRights = user.user_rights.split("~");

        if (this.selectedRights.length > 0) {

          // for(var i = 0; i < this.phrRightsFList.length; i++){
          //   debugger;
          //   for(var z = 0; z < this.selectedRights.length; z++){
          //     if(this.phrRightsFList[z].id === this.selectedRights[i]){
          //       this.phrRightsFList[i].is_check = true;
          //       break;
          //     }else{
          //       this.phrRightsFList[i].is_check = false;
          //     }
          //   }
          // }
          if (this.phrRightsFList != undefined) {
            for (var i = 0; i < this.phrRightsFList.length; i++) {
              this.phrRightsFList[i].is_check = false;
            }

            for (var i = 0; i < this.selectedRights.length; i++) {
              debugger;
              for (var z = 0; z < this.phrRightsFList.length; z++) {
                if (this.selectedRights[i] != "") {
                  if (this.phrRightsFList[z].id === this.selectedRights[i]) {
                    this.phrRightsFList[z].is_check = true;
                    break;
                  }
                  // else{
                  //   this.phrRightsFList[z].is_check = false;
                  // }
                }
              }
            }
          }
        }


      }
    }
  }


  getAPIUserPatients() {

    const searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: 'user_id', value: this.userIdSelected, option: '' }
    ];
    this.patientService.getAPIUserPatients(searchCriteria).subscribe(
      data => {
        this.lstUserPatientsList = data as Array<any>;
      },
      error => {
        this.logMyError('getAPIUserPatients Error.',error);
      }
    );

  }

  //getAPIUserPatientsError
  logMyError(msg,error)
  {
    this.logMessage.log(msg + error);
    this.isLoading = false;
  }

  onPatientSearchCriteriaKeydown(event: any) {
    if (event.key == 'Enter') {
      this.showPatientSearchCriteria = true;
    } else {
      this.showPatientSearchCriteria = false;
    }
  }
  onPatientSearchCriteriaInputChange(newValue) {

    this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').setValue(null);
    //if (newValue !== this.patientNameSearchCriteria) {

    this.showPatientSearchCriteria = undefined;
    //  this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').setValue(null);
    //}


    //this.patientName=undefined;
  }
  onPatientSearchCriteriaBlur() {
    //this.logMessage.log('onPatientSearchBlur');
    if ((this.showPatientSearchCriteria == undefined || this.showPatientSearchCriteria == false) && this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').value == undefined) {
      this.searchFormGroup.get('txtPatientSearchCriteria').setValue(null);
      this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').setValue(null);
    }
    //this.patientId=undefined;
  }
  openSelectCriteriaPatient(patObject) {

    debugger;
    //this.patientIdSearchCriteria = patObject.patient_id;
    //this.patientNameSearchCriteria = patObject.name;

    (this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria') as FormControl).setValue(patObject.patient_id);
    (this.searchFormGroup.get('txtPatientSearchCriteria') as FormControl).setValue(patObject.name);

    this.showPatientSearchCriteria = false;

  }
  closePatientSearchCriteria() {
    this.showPatientSearchCriteria = false;
    this.onPatientSearchCriteriaBlur();
  }

  clearAllFeilds() {

    this.removeAllRelationshipControls();

    this.lstUserPatientsList = undefined;
    this.userFormGroup.get('txtUserName').setValue(null);
    this.userFormGroup.get('txtLastName').setValue(null);
    this.userFormGroup.get('txtFirstName').setValue(null);
    this.userFormGroup.get('txtEmail').setValue(null);
    this.userFormGroup.get('txtContactNumber').setValue(null);
    this.userFormGroup.get('rbIsBlocked').setValue(false);


    this.userFormGroup.get('chkChangePwd').setValue(false);
    this.userFormGroup.get('txtPassword').setValue(null);
    this.userFormGroup.get('txtConfirmPassword').setValue(null);
    for (var i = 0; i < this.phrRightsFList.length; i++) {
      this.phrRightsFList[i].is_check = false;
    }
  }

  removeAllRelationshipControls() {

    if (this.lstUserPatientsList != undefined) {
      this.lstUserPatientsList.forEach(pat => {
        this.removeRelationshipControlById(pat.patient_id);
      });
    }
  }
  removeRelationshipControlById(patId: number) {

    this.userFormGroup.removeControl("ddUserRelationship_" + patId);
  }

  addAllRelationshipControls() {
    if (this.lstUserPatientsList != undefined) {
      this.lstUserPatientsList.forEach(pat => {
        this.addRelationshipControlToFormGroup(pat.patient_id, pat.user_relationship);
      });
    }
  }

  addRelationshipControlToFormGroup(patId: number, rel: string) {
    debugger;
    this.userFormGroup.addControl("ddUserRelationship_" + patId, this.formBuilder.control(rel, Validators.required));
  }


  onAdd() {
    debugger;

    this.clearAllFeilds();
    this.userIdSelected = -1;
    this.addEditOperation = OperationType.ADD;
    this.addEditView = true;

    if (this.callingFrom == CallingFromEnum.PATIENT) {

      this.userFormGroup.get('txtLastName').setValue(this.patientInfo.last_name);
      this.userFormGroup.get('txtFirstName').setValue(this.patientInfo.first_name);
      this.userFormGroup.get('txtEmail').setValue(this.patientInfo.email);
      this.userFormGroup.get('txtContactNumber').setValue(this.patientInfo.cell_phone);

      this.addPatientToList(this.patientInfo);
    }
  }

  onEdit() {
    debugger;
    this.addAllRelationshipControls();
    this.addEditOperation = OperationType.EDIT;
    this.addEditView = true;
    this.lstDeletedUserPatientIds = undefined;

    this.userFormGroup.get('txtUserName').setValue(this.selectedUser.user_name.split("@", 2)[0]);
    this.userFormGroup.get('txtLastName').setValue(this.selectedUser.last_name);
    this.userFormGroup.get('txtFirstName').setValue(this.selectedUser.first_name);
    this.userFormGroup.get('txtEmail').setValue(this.selectedUser.email);
    this.userFormGroup.get('txtContactNumber').setValue(this.selectedUser.contact_no);
    this.userFormGroup.get('rbIsBlocked').setValue(this.selectedUser.is_blocked);


  }

  onCancel() {
    debugger;
    this.removeAllRelationshipControls();
    this.addEditOperation = undefined
    this.addEditView = false;
    this.lstDeletedUserPatientIds = undefined;
    this.userIdSelected = undefined;

    this.onUserSelectionChanged(this.selectedUser);
  }

  onDelete() {

    this.addEditOperation = OperationType.DELETE;

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;


    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.userIdSelected.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.patientService.deleteAPIUser(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("User has benn deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data: any) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = "Patient API User"
      modalRef.componentInstance.promptMessage = data.response;
    }
    else {
      this.onAPIUserSearchClicked();
    }
  }


  onSave(formData: any) {

    this.isLoading = true;
    if (this.validateData(formData)) {

      //let wrapperPatientAPIUserSave:WrapperPatientAPIUserSave=new WrapperPatientAPIUserSave();

      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


      let apiUserSave: ORMAPIUserSave = new ORMAPIUserSave();
      let lstAPIUserPatients: Array<ORMAPIUserPatientSave> = new Array<ORMAPIUserPatientSave>();


      if (this.addEditOperation == OperationType.EDIT) {
        apiUserSave.user_id = this.selectedUser.user_id;
        apiUserSave.user_name = this.selectedUser.user_name;
        apiUserSave.date_created = this.selectedUser.date_created;
        apiUserSave.client_date_created = this.selectedUser.client_date_created;
        apiUserSave.created_user = this.selectedUser.created_user;

      }
      if (this.addEditOperation == OperationType.ADD) {
        apiUserSave.client_date_created = clientDateTime;
        apiUserSave.created_user = this.lookupList.logedInUser.user_name;
        apiUserSave.user_name = formData.txtUserName + this.lookupList.practiceInfo.domain;
      }
      apiUserSave.modified_user = this.lookupList.logedInUser.user_name;
      apiUserSave.client_date_modified = clientDateTime;
      apiUserSave.system_ip = this.lookupList.logedInUser.systemIp;
      apiUserSave.practice_id = this.lookupList.practiceInfo.practiceId;

      apiUserSave.last_name = formData.txtLastName;
      apiUserSave.first_name = formData.txtFirstName;
      apiUserSave.email = formData.txtEmail;
      apiUserSave.contact_no = formData.txtContactNumber;
      apiUserSave.is_blocked = formData.rbIsBlocked;

      if (formData.chkChangePwd == true || this.addEditOperation == OperationType.ADD) {
        apiUserSave.password = Md5.hashStr(formData.txtPassword).toString();
      }
      else {
        apiUserSave.password = this.selectedUser.password;
      }

      apiUserSave.can_access_all_patients = false;
      apiUserSave.user_type = "API_USER";

      debugger;
      this.rights = "";
      if (this.phrRightsFList) {
        for (var i = 0; i < this.phrRightsFList.length; i++) {
          if (this.phrRightsFList[i].is_check == true) {
            this.rights += this.phrRightsFList[i].id + '~';
          }
        }
        apiUserSave.user_rights = this.rights;
      }



      debugger;
      this.lstUserPatientsList.forEach(pat => {
        debugger;

        if (pat.id < 0 || this.userFormGroup.get('ddUserRelationship_' + pat.patient_id).dirty) {

          let ormAPIUserPatientSave: ORMAPIUserPatientSave = new ORMAPIUserPatientSave();


          if (pat.id < 0) {
            ormAPIUserPatientSave.client_date_created = clientDateTime;
            ormAPIUserPatientSave.created_user = this.lookupList.logedInUser.user_name;
          }
          else {
            ormAPIUserPatientSave.id = pat.id;
            ormAPIUserPatientSave.date_created = pat.date_created;
            ormAPIUserPatientSave.client_date_created = pat.client_date_created;
            ormAPIUserPatientSave.created_user = pat.created_user;
          }


          ormAPIUserPatientSave.user_id = apiUserSave.user_id;
          ormAPIUserPatientSave.user_name = apiUserSave.user_name;
          ormAPIUserPatientSave.patient_id = pat.patient_id;

          ormAPIUserPatientSave.user_relationship = formData['ddUserRelationship_' + pat.patient_id];

          //ormAPIUserPatientSave.client_date_created = clientDateTime;
          //ormAPIUserPatientSave.created_user = this.lookupList.logedInUser.user_name;
          ormAPIUserPatientSave.modified_user = this.lookupList.logedInUser.user_name;
          ormAPIUserPatientSave.client_date_modified = clientDateTime;
          ormAPIUserPatientSave.system_ip = this.lookupList.logedInUser.systemIp;
          ormAPIUserPatientSave.practice_id = this.lookupList.practiceInfo.practiceId;

          lstAPIUserPatients.push(ormAPIUserPatientSave);
        }
      });


      let wrapperPatientAPIUserSave: WrapperPatientAPIUserSave = new WrapperPatientAPIUserSave(apiUserSave, lstAPIUserPatients, this.lstDeletedUserPatientIds);


      this.patientService.saveAPIUser(wrapperPatientAPIUserSave).subscribe(
        data => {
          this.saveAPIUserSuccess(data);
        },
        error => {
          this.logMyError("saveAPIUser Error.",error);
        }
      );


      //console.log(patientSaveObjectWrapper);
    } else {
      this.isLoading = false;
    }


  }

  saveAPIUserSuccess(data) {
    if (data.status == ServiceResponseStatusEnum.SUCCESS) {


      this.addEditView = false;
      this.lstDeletedUserPatientIds = undefined;

      //this.userIdSelected = Number(data.result);

      this.searchFormGroup.get('txtUserNameSearch').setValue(this.userFormGroup.get('txtUserName').value);
      this.searchFormGroup.get('txtLastNameSearch').setValue(null);
      this.searchFormGroup.get('txtFirstNameSearch').setValue(null);
      this.searchFormGroup.get('txtPatientIdHiddenSearchCrieteria').setValue(null);
      this.searchFormGroup.get('txtPatientSearchCriteria').setValue(null);

      this.removeAllRelationshipControls();
      this.onAPIUserSearchClicked();
      this.isLoading = false;
      if (this.addEditOperation == OperationType.EDIT) {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Timely Access', "Patient Access has been updated successfully.", AlertTypeEnum.SUCCESS);
      } else if (this.addEditOperation == OperationType.ADD) {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Timely Access', "Portal access given.", AlertTypeEnum.SUCCESS);
      }

      this.addEditOperation = undefined
    }
    else if (data.status == ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient API Users', data.response, AlertTypeEnum.DANGER)
    }
    else if (data.status == ServiceResponseStatusEnum.NOT_ALLOWED) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient API Users', data.response, AlertTypeEnum.WARNING)
    }
  }


  /*
 
  this.addEditOperation = undefined
  this.addEditView = false;
  this.lstDeletedUserPatientIds = undefined;
}
}
*/



  onPatientSearchKeydown(event: any) {
    if (event.key == 'Enter') {
      this.showPatientSearch = true;
    } else {
      this.showPatientSearch = false;
    }
  }

  onPatientSearchBlur() {
    //this.logMessage.log('onPatientSearchBlur');

    if (this.showPatientSearch == undefined && this.showPatientSearch == false) {
      this.showPatientSearch = false;
      this.txtPatientSearch.nativeElement.value = '';
    }
    //this.patientId=undefined;
  }

  userPatientTempId: number = -1;

  openSelectPatient(patObject: any) {

    debugger;
    this.addPatientToList(patObject);
    this.showPatientSearch = false;

    if (this.addEditOperation == OperationType.ADD) {

      if (
        (this.userFormGroup.get('txtLastName').value == undefined || this.userFormGroup.get('txtLastName').value == '')
        &&
        (this.userFormGroup.get('txtFirstName').value == undefined || this.userFormGroup.get('txtFirstName').value == '')
        &&
        (this.userFormGroup.get('txtEmail').value == undefined || this.userFormGroup.get('txtEmail').value == '')
        &&
        (this.userFormGroup.get('txtContactNumber').value == undefined || this.userFormGroup.get('txtContactNumber').value == '')
      ) {

        this.userFormGroup.get('txtLastName').setValue(patObject.name.split(",")[0]);
        this.userFormGroup.get('txtFirstName').setValue(patObject.name.split(",")[1]);
        this.userFormGroup.get('txtEmail').setValue(patObject.email);
        this.userFormGroup.get('txtContactNumber').setValue(patObject.cell_phone);
      }
    }

  }

  addPatientToList(patient: any) {

    if (this.lstUserPatientsList == undefined) {
      this.lstUserPatientsList = new Array<any>();
    }


    let isPatientExist: boolean = false;
    for (let i: number = this.lstUserPatientsList.length - 1; i >= 0; i--) {

      if (this.lstUserPatientsList[i].patient_id == patient.patient_id) {
        isPatientExist = true;
      }
    }



    if (!isPatientExist) {

      let patName: string = "";
      if (patient.name != undefined) {
        patName = patient.name;
      }
      else {
        patName = patient.last_name + ', ' + patient.first_name;
      }

      this.lstUserPatientsList.push({
        id: this.userPatientTempId,
        user_id: this.userIdSelected,
        patient_id: patient.patient_id,
        alternate_account: patient.alternate_account,
        name: patName,
        dob: patient.dob,
        home_phone: patient.home_phone,
        cell_phone: patient.cell_phone,
        patient_status: patient.patient_status,
        address: patient.address,
        gender: (patient.gender_code == 'M' ? 'Male' : patient.gender_code == 'F' ? 'Female' : '')
      });

      this.addRelationshipControlToFormGroup(patient.patient_id, null);
    }

    this.userPatientTempId--;

  }



  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  onRemovePatient(patientId: number) {

    for (let i: number = this.lstUserPatientsList.length - 1; i >= 0; i--) {

      if (this.lstUserPatientsList[i].patient_id == patientId) {

        if (this.lstUserPatientsList[i].id > 0) {

          if (this.lstDeletedUserPatientIds == undefined) {
            this.lstDeletedUserPatientIds = new Array<number>();
          }

          this.lstDeletedUserPatientIds.push(this.lstUserPatientsList[i].id);

        }
        this.lstUserPatientsList.splice(i, 1);
        this.removeRelationshipControlById(patientId);
      }
    }

  }

  validateData(formData: any): boolean {

    debugger;
    let msg: string = '';

    if (formData.txtUserName == undefined || formData.txtUserName == '') {
      msg = "Please enter User Name";
    }
    else if (formData.txtLastName == undefined || formData.txtLastName == '') {
      msg = "Please enter Last Name";
    }
    else if (formData.txtFirstName == undefined || formData.txtFirstName == '') {
      msg = "Please enter First Name";
    }
    else if (formData.chkChangePwd == true || this.addEditOperation == OperationType.ADD) {

      if (formData.txtPassword == undefined || formData.txtPassword == '') {
        msg = "Please enter Password.";
      }
      else if (formData.txtConfirmPassword == undefined || formData.txtConfirmPassword == '') {
        msg = "Please enter Confirm Password.";
      }
      else if (formData.txtPassword != formData.txtConfirmPassword) {
        msg = "Confirm Password mismatch.";
      }

    }

    if (msg == '') {

      if (this.lstUserPatientsList == undefined || this.lstUserPatientsList.length == 0) {
        msg = "Please enter accessible patient(s)";
      }
      else if (this.lstUserPatientsList != undefined) {
        this.lstUserPatientsList.forEach(pat => {
          if (msg == '') {
            if (formData['ddUserRelationship_' + pat.patient_id] == undefined || formData['ddUserRelationship_' + pat.patient_id] == '') {
              msg = "Please select relationship for patient with the user."
            }
          }

        });
      }

    }

    if (msg != '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient API Users', msg, AlertTypeEnum.DANGER)
      return false;
    }
    else {
      return true;
    }
  }

  onPrintView() {
    this.printView = true;
  }

  closePrint() {
    this.printView = false;
  }

  print() {
    let printContents = document.getElementById('patient_api_user_print').innerHTML;
    this.generalService.printReport(printContents);
  }
  onRowChange(index) {
    this.selectedRightRow = index;
  }
  IsRightsSelectAll(value) {
    if (this.addEditOperation == 'add' || this.addEditOperation == 'edit') {
      for (var i = 0; i < this.phrRightsFList.length; i++) {
        this.phrRightsFList[i].is_check = value;
      }
    }
  }
  IsRightSettingSelect(value, seting) {
    debugger;
    if (this.addEditOperation == 'add' || this.addEditOperation == 'edit') {
      this.phrRightsFList[this.generalOperation.getElementIndex(this.phrRightsFList, seting)].is_check = value;
    }
  }
}