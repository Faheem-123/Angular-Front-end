import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GeneralService } from 'src/app/services/general/general.service';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMSaveSetupLocation } from 'src/app/models/setting/ORMSaveSetupLocation';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ClaimService } from 'src/app/services/billing/claim.service';

@Component({
  selector: 'location-setup',
  templateUrl: './location-setup.component.html',
  styleUrls: ['./location-setup.component.css']
})
export class LocationSetupComponent implements OnInit {
  inputForm: FormGroup;
  arrLocation;
  LocationSelectedIndex;
  LocationOperation = '';
  isDisable = false;

  lstZipCityState: Array<any>;

  constructor(private setupService: SetupService, @Inject(LOOKUP_LIST) public lookupList: LookupList
    , private formBuilder: FormBuilder, private logMessage: LogMessage, private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal, private generalService: GeneralService,
    private claimService: ClaimService) { }

  ngOnInit() {
    this.buildForm();
    if (this.lookupList.facilityList == undefined || this.lookupList.facilityList.length == 0) {
      this.getFacilityList();
    }
    else {
      this.getSetupLocation();
    }

    this.enableDisable('disable');
  }
  enableDisable(value) {
    if (value == 'disable')
      this.inputForm.disable();
    else
      this.inputForm.enable();
  }

  getFacilityList() {
    this.claimService.getFacilityList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.facilityList = data as Array<any>;
        this.getSetupLocation();
      },
      error => {
        this.getFacilityListError(error);
      }
    );
  }

  getFacilityListError(error: any) {
    this.logMessage.log("getFacilityList Error." + error);
  }

  getSetupLocation() {

    this.setupService.getSetupLocation(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.arrLocation = data as Array<any>;
        if (this.arrLocation.length > 0) {
          this.LocationSelectedIndex = 0;
          this.assignValues();

        }
      },
      error => {
        this.logMessage.log("getSetup Billing Provider Error." + error);
      }
    );
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtName: this.formBuilder.control(null, Validators.required),
      drpCity: this.formBuilder.control(null),
      txtZip: this.formBuilder.control(null),
      txtState: this.formBuilder.control(null),
      txtCliaNo: this.formBuilder.control(null),
      dpCLIAExpiry: this.formBuilder.control(null),
      txtAddressL1: this.formBuilder.control(null),
      txtAddressL2: this.formBuilder.control(null),
      txtPhone: this.formBuilder.control(null),
      txtFax: this.formBuilder.control(null),
      ddFaciliy: this.formBuilder.control(null)

    });
  }
  clearFields() {
    this.inputForm.reset();
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  assignValues() {

    (this.inputForm.get("txtName") as FormControl).setValue(this.arrLocation[this.LocationSelectedIndex].name);

    (this.inputForm.get("txtZip") as FormControl).setValue(this.arrLocation[this.LocationSelectedIndex].zip);
    (this.inputForm.get("txtCliaNo") as FormControl).setValue(this.arrLocation[this.LocationSelectedIndex].clia_number);
    (this.inputForm.get("dpCLIAExpiry") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrLocation[this.LocationSelectedIndex].clia_expiry_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("txtAddressL1") as FormControl).setValue(this.arrLocation[this.LocationSelectedIndex].address);
    (this.inputForm.get("txtAddressL2") as FormControl).setValue(this.arrLocation[this.LocationSelectedIndex].address2);
    (this.inputForm.get("txtPhone") as FormControl).setValue(this.arrLocation[this.LocationSelectedIndex].phone);
    (this.inputForm.get("txtFax") as FormControl).setValue(this.arrLocation[this.LocationSelectedIndex].fax);
    (this.inputForm.get("ddFaciliy") as FormControl).setValue(this.arrLocation[this.LocationSelectedIndex].facility_id);

    this.zipFocusOut(this.arrLocation[this.LocationSelectedIndex].zip);
  }
  onAddNew() {

    this.LocationOperation = "new";
    this.clearFields();
    this.enableDisable('enable');
    this.isDisable = true;
  }
  onEdit() {
    this.enableDisable('enable');
    this.isDisable = true;
    this.LocationOperation = "Edit";
  }
  onDelete() {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.arrLocation[this.LocationSelectedIndex].location_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.setupService.deleteSetupLocation(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),

          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }

  onDeleteSuccessfully(data) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Provider Setup"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.arrLocation.splice(this.LocationSelectedIndex, 1);
    }
  }
  objLocation: ORMSaveSetupLocation;
  onSave() {

    if ((this.inputForm.get('txtName') as FormControl).value == "" || (this.inputForm.get('txtName') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please enter Location Name.", 'warning')
      return false;
    }
    if ((this.inputForm.get('txtZip') as FormControl).value == "" || (this.inputForm.get('txtZip') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please enter Zip.", 'warning')
      return false;
    }
    if ((this.inputForm.get('drpCity') as FormControl).value == "" || (this.inputForm.get('drpCity') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select City.", 'warning')
      return false;
    }
    if ((this.inputForm.get('txtState') as FormControl).value == "" || (this.inputForm.get('txtState') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select State.", 'warning')
      return false;
    }
    if ((this.inputForm.get('txtAddressL1') as FormControl).value == "" || (this.inputForm.get('txtAddressL1') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please enter Address.", 'warning')
      return false;
    }
    this.objLocation = new ORMSaveSetupLocation;

    this.objLocation.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.objLocation.name = this.inputForm.get("txtName").value;;
    this.objLocation.address = this.inputForm.get("txtAddressL1").value;;
    this.objLocation.address2 = this.inputForm.get("txtAddressL2").value;;
    this.objLocation.city = this.inputForm.get("drpCity").value;;
    this.objLocation.state = this.inputForm.get("txtState").value;;
    this.objLocation.zip = this.inputForm.get("txtZip").value;
    this.objLocation.phone = this.inputForm.get("txtPhone").value;;
    this.objLocation.fax = this.inputForm.get("txtFax").value;;
    this.objLocation.clia_number = this.inputForm.get("txtCliaNo").value;
    this.objLocation.clia_expiry_date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("dpCLIAExpiry").value);
    //this.objLocation.is_block=this.inputForm.get("txtfirstName").value;;
    if (this.inputForm.get("ddFaciliy").value != undefined) {
      this.objLocation.facility_id = this.inputForm.get("ddFaciliy").value;
    }

    if (this.LocationOperation == "new") {
      this.objLocation.created_user = this.lookupList.logedInUser.user_name;
      this.objLocation.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    } else {
      this.objLocation.location_id = this.arrLocation[this.LocationSelectedIndex].location_id;
      this.objLocation.client_date_created = this.arrLocation[this.LocationSelectedIndex].client_date_created;
      this.objLocation.date_created = this.arrLocation[this.LocationSelectedIndex].date_created;
      this.objLocation.created_user = this.arrLocation[this.LocationSelectedIndex].created_user;
    }

    this.objLocation.modified_user = this.lookupList.logedInUser.user_name;
    this.objLocation.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    this.setupService.saveSetupLocation(this.objLocation).subscribe(
      data => {
        debugger;
        this.saveProviderSuccess(data);
      },
      error => {
        this.saveProviderError(error);
      }
    );
  }
  saveProviderSuccess(data) {
    debugger;
    this.enableDisable('disable');
    this.isDisable = false;
    this.LocationOperation = "";
    if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
      if (this.objLocation.location_id == null || this.objLocation.location_id == '') {
        this.getSetupLocation();
      }
      else {
        this.arrLocation[this.LocationSelectedIndex].name = this.inputForm.get("txtName").value;
        this.arrLocation[this.LocationSelectedIndex].address = this.inputForm.get("txtAddressL1").value;
        this.arrLocation[this.LocationSelectedIndex].address2 = this.inputForm.get("txtAddressL2").value;
        this.arrLocation[this.LocationSelectedIndex].city = this.inputForm.get("drpCity").value;
        this.arrLocation[this.LocationSelectedIndex].state = this.inputForm.get("txtState").value;
        this.arrLocation[this.LocationSelectedIndex].zip = this.inputForm.get("txtZip").value;
        this.arrLocation[this.LocationSelectedIndex].phone = this.inputForm.get("txtPhone").value;
        this.arrLocation[this.LocationSelectedIndex].fax = this.inputForm.get("txtFax").value;
        this.arrLocation[this.LocationSelectedIndex].clia_number = this.inputForm.get("txtCliaNo").value;
        this.arrLocation[this.LocationSelectedIndex].clia_expiry_date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("dpCLIAExpiry").value);

        if (this.inputForm.get("ddFaciliy").value != undefined) {
          this.arrLocation[this.LocationSelectedIndex].facility_id = this.inputForm.get("ddFaciliy").value;
          this.lookupList.facilityList.map(facility => {
            if (facility.id == this.inputForm.get("ddFaciliy").value) {
              this.arrLocation[this.LocationSelectedIndex].facility_name = facility.name;
            }
          })
        }
        else {
          this.arrLocation[this.LocationSelectedIndex].facility_nam = '';
        }


      }
      //this.LocationSelectedIndex=0;
      //this.assignValues();
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Location Save';
      modalRef.componentInstance.promptMessage = "Location save successfully.";
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Location Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveProviderError(error) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Location Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Location."
  }
  onCancel() {
    if (this.arrLocation != undefined && this.arrLocation != null) {
      this.LocationSelectedIndex = 0;
      this.assignValues();
    }
    this.enableDisable('disable');
    this.isDisable = false;
    this.LocationOperation = "";
  }
  onSelectionChange(index, obj) {
    this.LocationSelectedIndex = index;
    this.assignValues();
  }

  zipFocusOut(zipCode: string) {
    debugger;
    if (zipCode != undefined) {
      if (zipCode.replace("-", "").length == 5 || zipCode.replace("-", "").length == 9) {
        this.getCityStateByZipCode(zipCode);
      }
    }
  }
  getCityStateByZipCode(zipCode) {
    this.generalService.getCityStateByZipCode(zipCode).subscribe(
      data => {
        this.lstZipCityState = data as Array<any>;

        if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
          (this.inputForm.get("txtState") as FormControl).setValue(this.lstZipCityState[0].state);

          if (this.lstZipCityState.length > 1) {
            (this.inputForm.get("drpCity") as FormControl).setValue(null);
          }
          else if (this.lstZipCityState.length == 1) {
            (this.inputForm.get("drpCity") as FormControl).setValue(this.lstZipCityState[0].city);
          }
        }
      },
      error => {
        this.getCityStateByZipCodeError(error);
      }
    );
  }

  getCityStateByZipCodeError(error) {
    //this.logMessage.log("getCityStateByZipCode Error." + error);
  }

}
