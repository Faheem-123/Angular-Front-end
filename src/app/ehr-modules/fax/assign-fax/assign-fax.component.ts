import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { FaxService } from 'src/app/services/fax.service';
import { ORMIdName } from 'src/app/models/general/orm-id-name';
import { WrapperListWithOneObjectSave } from 'src/app/models/general/wrapper-list-with-one-object';
import { AssignFaxToUserParmList } from 'src/app/models/fax/assign-fax-to-user-pramlist';
import { ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'assign-fax',
  templateUrl: './assign-fax.component.html',
  styleUrls: ['./assign-fax.component.css']
})
export class AssignFaxComponent implements OnInit {

  @Input() faxRecId: number;
  @Input() faxUserId: number;
  @Input() faxAssignedUsers: string = "";
  @Input() faxAssignedUsersIds: string = "";
  @Input() faxName: string = "";
  @Input() comments: string = "";
  @Input() callingFrom: string = "";



  assignFaxFormGroup: FormGroup;
  isLoading: boolean = false;


  dropdownSettings = {
    singleSelection: false,
    idField: 'user_id',
    textField: 'display_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true
  };

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil ,  
    private ngbModal: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private faxService: FaxService) { }

  ngOnInit() {
    this.buildForm();
    if (this.lookupList.lstAssignedToUsersList == undefined || this.lookupList.lstAssignedToUsersList.length == 0) {
      this.getAssignedToUsersList();
    }
  }

  buildForm() {

    this.assignFaxFormGroup = this.formBuilder.group({
      txtAssignedTo: this.formBuilder.control(null),
      txtFaxName: this.formBuilder.control(this.faxName),
      txtNotes: this.formBuilder.control(this.comments),
      chkHighImportance: this.formBuilder.control(null)
    });
  }

  getAssignedToUsersList() {

    this.faxService.getAssignedToUsersList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        debugger;
        this.lookupList.lstAssignedToUsersList = data as Array<any>;

      },
      error => {
        this.isLoading = false;
        this.getAssignedToUsersListError(error);
      }
    );
  }
  getAssignedToUsersListError(error: any) {
    this.logMessage.log("getAssignedToUsersList Error." + error);
  }

  /*
  getAssignedUsers(value): Array<ORMIdName> {
    debugger;

    let lstUsers: Array<ORMIdName> = new Array<ORMIdName>();

    if (value.txtAssignedTo != null && value.txtAssignedTo.length > 0) {
      for (let i = 0; i < value.txtAssignedTo.length; i++) {
        lstUsers.push(new ORMIdName(value.txtAssignedTo[i].user_id, value.txtAssignedTo[i].display_name));
      }
    }

    return lstUsers;
  }
*/
  onSave(formData: any) {

    this.comments=formData.txtNotes;
    let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeString();

    let lstUsers: Array<ORMIdName> = new Array<ORMIdName>();

    let wrapperListWithOneObjectSave: WrapperListWithOneObjectSave = new WrapperListWithOneObjectSave();

    if (formData.txtAssignedTo != null && formData.txtAssignedTo.length > 0) {

      for (let i = 0; i < formData.txtAssignedTo.length; i++) {
        lstUsers.push(new ORMIdName(formData.txtAssignedTo[i].user_id, formData.txtAssignedTo[i].display_name));
      }
    }


    let objAssignFaxToUserParmList: AssignFaxToUserParmList = new AssignFaxToUserParmList();
    objAssignFaxToUserParmList.practiceId = this.lookupList.practiceInfo.practiceId;
    objAssignFaxToUserParmList.logedInUser = this.lookupList.logedInUser.user_name;
    objAssignFaxToUserParmList.systemIp = this.lookupList.logedInUser.systemIp;
    objAssignFaxToUserParmList.clientDateTime = clientDateTime

    if (this.faxName != formData.txtFaxname) {
      objAssignFaxToUserParmList.faxName = formData.txtFaxname;
    }

    objAssignFaxToUserParmList.callingFrom = this.callingFrom
    objAssignFaxToUserParmList.comments = formData.txtNotes
    objAssignFaxToUserParmList.faxRecId = this.faxRecId
    objAssignFaxToUserParmList.isImportant=formData.chkHighImportance;
    if (this.faxUserId != undefined && this.faxUserId > 0) {
      objAssignFaxToUserParmList.faxUsersId = this.faxUserId
    }

    wrapperListWithOneObjectSave.lstObjSave = lstUsers as Array<any>;
    wrapperListWithOneObjectSave.objSave = objAssignFaxToUserParmList;

    this.faxService.assignFaxToUsers(wrapperListWithOneObjectSave).subscribe(
      data => {
        //this.isProcessing = false;
        this.assignFaxToUsersSuccess(data);
      },
      error => {
        this.assignFaxToUsersError(error);
        //this.isProcessing = false;
      }
    );
  }


  assignFaxToUsersSuccess(data: any) {

    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      debugger;

      let assignedToUsers: string = "";
      let assignedToUsersIds: string = "";     

      if (data.response_list != undefined && data.response_list.length > 0) {

        data.response_list.forEach(resp => {

          switch ((resp as ORMKeyValue).key) {
            case "assigned_to_users":
              assignedToUsers = (resp as ORMKeyValue).value;
              break;

            case "assigned_to_users_ids":
              assignedToUsersIds = (resp as ORMKeyValue).value;
              break;

            default:
              break;
          }
        });
      }

      this.activeModal.close({ status: data.status, comments:this.comments, assignedToUsers: assignedToUsers, assignedToUsersIds: assignedToUsersIds })

    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Assign Fax', data.response, AlertTypeEnum.DANGER)
    }
  }

  assignFaxToUsersError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Assign Fax', "An Error Occured while getting Faxes from Fax Server.", AlertTypeEnum.DANGER)
  }


  onCancel() {
    this.activeModal.dismiss();
  }
}
