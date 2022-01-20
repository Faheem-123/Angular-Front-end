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
import { ORMSaveSetupFacility } from 'src/app/models/setting/ORMSaveSetupFacility';
import { ClaimService } from 'src/app/services/billing/claim.service';

@Component({
  selector: 'facility-setup',
  templateUrl: './facility-setup.component.html',
  styleUrls: ['./facility-setup.component.css']
})
export class FacilitySetupComponent implements OnInit {

  inputForm: FormGroup;
  arrFacility;
  facilitySelectedIndex;
  facilityOperation = '';
  isDisable = false;
  arrPOS;
  lstZipCityState: Array<any>;
  
  constructor(private setupService: SetupService, @Inject(LOOKUP_LIST) public lookupList: LookupList
  , private formBuilder: FormBuilder, private logMessage: LogMessage, private dateTimeUtil: DateTimeUtil,
  private modalService: NgbModal, private generalService: GeneralService,
  private claimService:ClaimService) { }

  ngOnInit() {
    this.buildForm();
    this.getSetupFacility();
    this.getPOS();
    this.enableDisable('disable');
  }
  enableDisable(value) {
    if (value == 'disable')
      this.inputForm.disable();
    else
      this.inputForm.enable();
  }
  getSetupFacility() {
    this.setupService.getSetupFacility(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.arrFacility = data as Array<any>;
        if (this.arrFacility.length > 0) {
          this.facilitySelectedIndex = 0;
          this.assignValues();
        }
      },
      error => {
        this.logMessage.log(" getSetupFacility Error." + error);
      }
    );
  }
  getPOS() {
    this.generalService.getPOSList().subscribe(
      data => {
        this.arrPOS = data as Array<any>;
      },
      error => {
        this.logMessage.log("getPOS Error." + error);
      }
    );
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtName: this.formBuilder.control(null, Validators.required),
      drpCity: this.formBuilder.control(null),
      txtZip: this.formBuilder.control(null),
      txtState: this.formBuilder.control(null),
      txtEmail: this.formBuilder.control(null),
      txtAddress: this.formBuilder.control(null),
      txtPhone: this.formBuilder.control(null),
      txtFax: this.formBuilder.control(null),  
      txtNPI: this.formBuilder.control(null),  
      drpPos: this.formBuilder.control(null),    
      chkDefault: this.formBuilder.control(null),    
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
    (this.inputForm.get("txtName") as FormControl).setValue(this.arrFacility[this.facilitySelectedIndex].name);
    (this.inputForm.get("txtAddress") as FormControl).setValue(this.arrFacility[this.facilitySelectedIndex].address);
    (this.inputForm.get("txtZip") as FormControl).setValue(this.arrFacility[this.facilitySelectedIndex].zip);    
    (this.inputForm.get("txtPhone") as FormControl).setValue(this.arrFacility[this.facilitySelectedIndex].phone);
    (this.inputForm.get("txtFax") as FormControl).setValue(this.arrFacility[this.facilitySelectedIndex].fax);
    (this.inputForm.get("txtEmail") as FormControl).setValue(this.arrFacility[this.facilitySelectedIndex].email);
    (this.inputForm.get("txtNPI") as FormControl).setValue(this.arrFacility[this.facilitySelectedIndex].npi);
    (this.inputForm.get("drpPos") as FormControl).setValue(this.arrFacility[this.facilitySelectedIndex].default_pos);
    (this.inputForm.get("chkDefault") as FormControl).setValue(this.arrFacility[this.facilitySelectedIndex].default_facility);
    
    this.zipFocusOut(this.arrFacility[this.facilitySelectedIndex].zip);
  }
  onAddNew() {

    this.facilityOperation = "new";
    this.clearFields();
    this.enableDisable('enable');
    this.isDisable = true;
  }
  onEdit() {
    this.enableDisable('enable');
    this.isDisable = true;
    this.facilityOperation = "Edit";
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
        deleteRecordData.column_id = this.arrFacility[this.facilitySelectedIndex].facility_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.setupService.deleteSetupFacility(deleteRecordData)
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
      this.arrFacility.splice(this.facilitySelectedIndex, 1);
      if(this.arrFacility.length>0)
      {
        this.facilitySelectedIndex=0;
        this.assignValues();
      }
    }
  }
  objFacility: ORMSaveSetupFacility;
  onSave() {
    this.objFacility = new ORMSaveSetupFacility;

        this.objFacility.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        this.objFacility.name=this.inputForm.get("txtName").value;
        this.objFacility.address=this.inputForm.get("txtAddress").value;
				this.objFacility.zip=this.inputForm.get("txtZip").value;				
				this.objFacility.city=this.inputForm.get("drpCity").value;
        this.objFacility.state=this.inputForm.get("txtState").value;
				this.objFacility.email=this.inputForm.get("txtEmail").value;
				this.objFacility.phone=this.inputForm.get("txtPhone").value;
        this.objFacility.fax=this.inputForm.get("txtFax").value;
        this.objFacility.npi=this.inputForm.get("txtNPI").value;
        this.objFacility.default_pos=this.inputForm.get("drpPos").value;
        this.objFacility.default_facility=this.inputForm.get("chkDefault").value;				
    if (this.facilityOperation == "new") {
      this.objFacility.created_user = this.lookupList.logedInUser.user_name;
      this.objFacility.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    } else {
      this.objFacility.facility_id = this.arrFacility[this.facilitySelectedIndex].facility_id;
      this.objFacility.client_date_created = this.arrFacility[this.facilitySelectedIndex].client_date_created;
      this.objFacility.date_created = this.arrFacility[this.facilitySelectedIndex].date_created;
      this.objFacility.created_user = this.arrFacility[this.facilitySelectedIndex].created_user;
    }

    this.objFacility.modified_user = this.lookupList.logedInUser.user_name;
    this.objFacility.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    this.setupService.saveSetupFacility(this.objFacility).subscribe(
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
    this.facilityOperation = "";
    if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
      if (this.objFacility.facility_id == null || this.objFacility.facility_id == '') {
        this.getSetupFacility();
      }
      else {
        this.arrFacility[this.facilitySelectedIndex].name=this.inputForm.get("txtName").value;
        this.arrFacility[this.facilitySelectedIndex].address=this.inputForm.get("txtAddress").value;
        this.arrFacility[this.facilitySelectedIndex].zip=this.inputForm.get("txtZip").value;
        this.arrFacility[this.facilitySelectedIndex].city=this.inputForm.get("drpCity").value;
        this.arrFacility[this.facilitySelectedIndex].state=this.inputForm.get("txtState").value;
        this.arrFacility[this.facilitySelectedIndex].email=this.inputForm.get("txtEmail").value;
        this.arrFacility[this.facilitySelectedIndex].phone=this.inputForm.get("txtPhone").value;
        this.arrFacility[this.facilitySelectedIndex].fax=this.inputForm.get("txtFax").value;
        this.arrFacility[this.facilitySelectedIndex].npi=this.inputForm.get("txtNPI").value;
        this.arrFacility[this.facilitySelectedIndex].default_pos=this.inputForm.get("drpPos").value;
        this.arrFacility[this.facilitySelectedIndex].default_facility=this.inputForm.get("chkDefault").value;        
      }
      //this.facilitySelectedIndex=0;
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
    if (this.arrFacility != undefined && this.arrFacility != null) {
      this.facilitySelectedIndex = 0;
      this.assignValues();
    }
    this.enableDisable('disable');
    this.isDisable = false;
    this.facilityOperation = "";
  }
  onSelectionChange(index, obj) {
    this.facilitySelectedIndex = index;
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
