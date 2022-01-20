import { Component, OnInit, Input, Inject } from '@angular/core';
import { OperationType, AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralService } from 'src/app/services/general/general.service';
import { FaxService } from 'src/app/services/fax.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ORMFaxContactSave } from 'src/app/models/fax/orm-fax-contact-save';

@Component({
  selector: 'add-edit-fax-contact',
  templateUrl: './add-edit-fax-contact.component.html',
  styleUrls: ['./add-edit-fax-contact.component.css']
})
export class AddEditFaxContactComponent implements OnInit {

  @Input() contactId: number;
  @Input() operationType: OperationType;

  @Input() orgName: string;
  @Input() contactPerson: string;
  @Input() faxNumber: string;
  @Input() phoneNumber: string;


  formGroup: FormGroup;

  contactDetail: any;

  lstZipCityState: Array<any>;
  showInsuranceSearch: boolean = false;
  showSubscriberSearch: boolean = false;
  isLoading: boolean = true;
  isZipChanged: boolean = false;
  isZipLoading: boolean = false;
  state: string = "";


  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private generalService: GeneralService,
    private faxService: FaxService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private dateTimeUtil: DateTimeUtil) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.buildForm();

    if (this.operationType == OperationType.EDIT) {
      this.getFaxContactDetail();
    }
    else {
      this.isLoading = false;
    }
  }

  buildForm() {

    this.formGroup = this.formBuilder.group({
      txtOrgName: this.formBuilder.control(this.orgName, Validators.required),
      txtContactPerson: this.formBuilder.control(this.contactPerson, Validators.required),
      txtFax: this.formBuilder.control(this.faxNumber, Validators.required),
      txtPhone: this.formBuilder.control(this.phoneNumber),
      txtAddress: this.formBuilder.control(null),
      txtZipCode: this.formBuilder.control(null),
      ddCity: this.formBuilder.control(null)
    }
    )
  }

  getFaxContactDetail() {

    this.faxService.getFaxContactDetailById(this.contactId).subscribe(
      data => {

        this.contactDetail = data;

        this.populateData();
        //this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getFaxContactListError(error);
      }
    );
  }
  getFaxContactListError(error: any) {
    this.logMessage.log("getFaxContactList Error." + error);
  }


  populateData() {

    debugger;
    if (this.operationType == OperationType.EDIT) {
      this.state = this.contactDetail.state;

      (this.formGroup.get("txtOrgName") as FormControl).setValue(this.contactDetail.organization_name);
      (this.formGroup.get("txtContactPerson") as FormControl).setValue(this.contactDetail.contact_person);
      (this.formGroup.get("txtFax") as FormControl).setValue(this.contactDetail.fax_no);

      (this.formGroup.get("txtPhone") as FormControl).setValue(this.contactDetail.phone_no);
      (this.formGroup.get("txtAddress") as FormControl).setValue(this.contactDetail.address);

      (this.formGroup.get("txtZipCode") as FormControl).setValue(this.contactDetail.zip);
      this.isZipLoading = true;
      this.getCityStateByZipCode(this.contactDetail.zip);
    }

    this.isLoading = false;

  }

  zipChanged() {
    this.isZipChanged = true;
  }

  zipFocusOut(zipCode) {

    if (this.isZipLoading || this.isZipChanged) {
      this.isZipChanged = false;
      this.state = "";
      this.lstZipCityState = [];
      if (zipCode.replace("-", "").length == 5 || zipCode.replace("-", "").length == 9) {
        this.getCityStateByZipCode(zipCode);
      }
    }
  }
  getCityStateByZipCode(zipCode) {

    this.generalService.getCityStateByZipCode(zipCode).subscribe(
      data => {
        debugger;
        this.lstZipCityState = data as Array<any>;;
        if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
          this.state = this.lstZipCityState[0].state;

          if (this.isZipLoading && this.operationType == OperationType.EDIT) {
            (this.formGroup.get("ddCity") as FormControl).setValue(this.contactDetail.city);
          }
          else if (this.lstZipCityState.length > 1) {
            (this.formGroup.get("ddCity") as FormControl).setValue(null);
          }
          else if (this.lstZipCityState.length == 1) {
            (this.formGroup.get("ddCity") as FormControl).setValue(this.lstZipCityState[0].city);
          }
          this.isZipLoading = false;
        }
        this.isZipLoading = false;
      },
      error => {
        this.isZipLoading = false;
        this.getCityStateByZipCodeError(error);
      }
    );
  }

  getCityStateByZipCodeError(error) {
    this.logMessage.log("getCityStateByZipCode Error." + error);
  }

  onSubmit(formData: any) {
    if (this.validateData(formData)) {

      debugger;
      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


      let ormFaxContactSave: ORMFaxContactSave = new ORMFaxContactSave();

      if (this.operationType == OperationType.ADD) {

        ormFaxContactSave.client_date_created = clientDateTime;
        ormFaxContactSave.created_user = this.lookupList.logedInUser.user_name;


      }
      else if (this.operationType == OperationType.EDIT) {
        ormFaxContactSave.contact_id = this.contactDetail.contact_id;
        ormFaxContactSave.date_created = this.contactDetail.date_created;
        ormFaxContactSave.client_date_created = this.contactDetail.client_date_created;
        ormFaxContactSave.created_user = this.contactDetail.created_user;
      }

      ormFaxContactSave.practice_id = this.lookupList.practiceInfo.practiceId;
      ormFaxContactSave.client_date_modified = clientDateTime;
      ormFaxContactSave.modified_user = this.lookupList.logedInUser.user_name;
      ormFaxContactSave.system_ip = this.lookupList.logedInUser.systemIp;

      ormFaxContactSave.organization_name = formData.txtOrgName;
      ormFaxContactSave.contact_person = formData.txtContactPerson;
      ormFaxContactSave.fax_no = formData.txtFax;
      ormFaxContactSave.phone_no = formData.txtPhone;
      ormFaxContactSave.address = formData.txtAddress;
      ormFaxContactSave.zip = formData.txtZipCode;
      ormFaxContactSave.city = formData.ddCity;
      ormFaxContactSave.state = this.state;


      debugger;
      this.faxService.saveFaxContact(ormFaxContactSave).subscribe(
        data => {

          this.saveFaxContactSuccess(data);
        },
        error => {
          this.saveFaxContactError(error);
        }
      );

    }


  }

  saveFaxContactSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Fax Contact', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveFaxContactError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Fax Contact', "An Error Occured while saving Fax Contact", AlertTypeEnum.DANGER)
  }

  validateData(formData: any) {

    debugger;
    let strMsg: string = "";
    if (formData.txtOrgName == undefined || formData.txtOrgName == "") {
      strMsg = "Please enter Organization Name."
    }
    else if (formData.txtContactPerson == undefined || formData.txtContactPerson == "") {
      strMsg = "Please enter Contact Persion Name."
    }
    else if (formData.txtFax == undefined || formData.txtFax == "") {
      strMsg = "Please enter Fax Number."
    }



    if (strMsg != "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Fax Contact', strMsg, AlertTypeEnum.DANGER)

      return false;
    }
    else {
      return true;
    }

  }
}
