import { Component, OnInit, Inject } from '@angular/core';
import { InsurancesService } from 'src/app/services/insurances.service';
import { LogMessage } from 'src/app/shared/log-message';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { PromptResponseEnum, ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { GeneralService } from 'src/app/services/general/general.service';
import { ORMinsurancesetup } from 'src/app/models/setting/orm-insurance-setup';

@Component({
  selector: 'insurance-setup',
  templateUrl: './insurance-setup.component.html',
  styleUrls: ['./insurance-setup.component.css']
})
export class InsuranceSetupComponent implements OnInit {
  frmInput: FormGroup;
  operation = '';
  isDisable = false;
  listInsType;
  listInspayer;
  listIns;
  selectedPayerRow = 0;
  selectedTypeRow = 0;
  selectedInsRow = 0;
  lstZipCityState: Array<any>;

  isShowSearchIns = false;
  isMainIns = true;

  constructor(private insService: InsurancesService, private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private generalService: GeneralService,
    private logMessage: LogMessage, private modalService: NgbModal) { }

  ngOnInit() {
    this.buildForm();
    this.getInsuranceTypes();
    this.enableDisable('disable');
  }
  buildForm() {
    this.frmInput = this.formBuilder.group({
      txtName: this.formBuilder.control(""),
      txtAddress: this.formBuilder.control(""),
      txtZip: this.formBuilder.control(""),
      drpCity: this.formBuilder.control(""),
      txtState: this.formBuilder.control(""),
      txtPhone: this.formBuilder.control(""),
      txtFax: this.formBuilder.control(""),
      txtPlan: this.formBuilder.control(""),
      txtEmail: this.formBuilder.control(""),
      txtAttn: this.formBuilder.control(""),
      txtWebsite: this.formBuilder.control("")
    });
  }
  getInsuranceTypes() {
    this.insService.getInsurancePayerTypes()
      .subscribe(
        data => {
          this.listInsType = data;
          this.selectedTypeRow = 0;
          if (this.listInsType.length > 0) {
            this.getPayerTypePayer(this.listInsType[this.selectedTypeRow].payertype_id)
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting getInsurancePayerTypes list.")
        }
      );
  }
  getPayerTypePayer(id) {
    this.insService.getPayerTypePayer(id)
      .subscribe(
        data => {
          this.listInspayer = data;
          this.selectedPayerRow = 0;
          if (this.listInspayer.length > 0)
            this.getPayerInsurance(this.listInspayer[this.selectedPayerRow].payer_id)
        },
        error => {
          this.logMessage.log("An Error Occured while getting getPayerTypePayer list.")
          // this.isLoading = false;
        }
      );
  }
  onTypeselectionChange(index: number) {
    this.selectedTypeRow = index;
    this.getPayerTypePayer(this.listInsType[this.selectedTypeRow].payertype_id)

  }
  onpayerselectionChange(index: number) {
    this.selectedPayerRow = index;
    this.getPayerInsurance(this.listInspayer[this.selectedPayerRow].payer_id);
  }
  onInsuranceselectionChange(index: number) {
    this.selectedInsRow = index;
    this.assignvalues();
    //this.getPayerInsurance(this.listIns[this.selectedInsRow].insurance_id);
  }
  getPayerInsurance(id) {
    this.insService.getPayerInsurances(id)
      .subscribe(
        data => {
          this.listIns = data;
          this.selectedInsRow = 0;
          if (this.listIns.length > 0)
            this.assignvalues();
          else {
            this.clearFields();
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting getPayerInsurance list.")
          // this.isLoading = false;
        }
      );
  }
  assignvalues() {
    (this.frmInput.get("txtName") as FormControl).setValue(this.listIns[this.selectedInsRow].name);
    (this.frmInput.get("txtAddress") as FormControl).setValue(this.listIns[this.selectedInsRow].address);
    this.zipFocusOut(this.listIns[this.selectedInsRow].zip.toString().trim());
    //(this.frmInput.get("drpCity") as FormControl).setValue(this.listIns[this.selectedInsRow].city);
    (this.frmInput.get("txtZip") as FormControl).setValue(this.listIns[this.selectedInsRow].zip);

    (this.frmInput.get("txtState") as FormControl).setValue(this.listIns[this.selectedInsRow].state);
    (this.frmInput.get("txtPhone") as FormControl).setValue(this.listIns[this.selectedInsRow].phone);
    (this.frmInput.get("txtFax") as FormControl).setValue(this.listIns[this.selectedInsRow].fax);
    (this.frmInput.get("txtEmail") as FormControl).setValue(this.listIns[this.selectedInsRow].email);
    (this.frmInput.get("txtWebsite") as FormControl).setValue(this.listIns[this.selectedInsRow].website);
    (this.frmInput.get("txtAttn") as FormControl).setValue(this.listIns[this.selectedInsRow].attn);
    (this.frmInput.get("txtPlan") as FormControl).setValue(this.listIns[this.selectedInsRow].plan_name);
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

          (this.frmInput.get("txtState") as FormControl).setValue(this.lstZipCityState[0].state);

          if (this.lstZipCityState.length > 1) {
            (this.frmInput.get("drpCity") as FormControl).setValue(null);
          }
          else if (this.lstZipCityState.length == 1) {
            (this.frmInput.get("drpCity") as FormControl).setValue(this.lstZipCityState[0].city);
          }
        }
      },
      error => {
        this.getCityStateByZipCodeError(error);
      }
    );
  }
  getCityStateByZipCodeError(error) {
    this.logMessage.log("getCityStateByZipCode Error." + error);
  }

  enableDisable(value) {
    if (value == 'disable')
      this.frmInput.disable();
    else
      this.frmInput.enable();
  }
  clearFields() {
    this.frmInput.reset();
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  onAddNew() {
    this.operation = "new";
    this.clearFields();
    this.enableDisable('enable');
    this.isDisable = true;
  }
  onEdit() {
    this.enableDisable('enable');
    this.isDisable = true;
    this.operation = "edit";
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
        deleteRecordData.column_id = this.listIns[this.selectedInsRow].insurance_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.insService.deleteInsurance(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),

          );
      }
    }, (reason) => {
    });
  }
  onDeleteSuccessfully(data) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "INSURANCE TYPE Setup"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.listIns.splice(this.selectedInsRow, 1);
      if (this.listIns.length > 0) {
        this.selectedInsRow = 0;
        this.assignvalues();
      }
    }
  }
  validate(): boolean {
    debugger;
    if ((this.frmInput.get('txtName') as FormControl).value == "" || (this.frmInput.get('txtName') as FormControl).value == null) {
      alert("Please enter Insurance Name.");
      return false;
    }

    if ((this.frmInput.get('txtAddress') as FormControl).value == "" || (this.frmInput.get('txtAddress') as FormControl).value == null) {
      alert("Please enter Insurance Address.");
      return false;
    }
    if ((this.frmInput.get('txtZip') as FormControl).value == "" || (this.frmInput.get('txtZip') as FormControl).value == null) {
      alert("Please enter Insurance Zip.");
      return false;
    }
    if ((this.frmInput.get('drpCity') as FormControl).value == "" || (this.frmInput.get('drpCity') as FormControl).value == null) {
      alert("Please enter Insurance City.");
      return false;
    }
    if ((this.frmInput.get('txtState') as FormControl).value == "" || (this.frmInput.get('txtState') as FormControl).value == null) {
      alert("Please enter Insurance State.");
      return false;
    }
    if ((this.frmInput.get('txtPhone') as FormControl).value == "" || (this.frmInput.get('txtPhone') as FormControl).value == null) {
      alert("Please enter Insurance Phone.");
      return false;
    }
    if ((this.frmInput.get('txtPlan') as FormControl).value == "" || (this.frmInput.get('txtPlan') as FormControl).value == null) {
      alert("Please enter Plan Name.");
      return false;
    }
    return true;
  }
  onSave() {
    debugger;
    if (this.validate()) {

      let ormSaveIns: ORMinsurancesetup = new ORMinsurancesetup();

      ormSaveIns.name = (this.frmInput.get('txtName') as FormControl).value;
      ormSaveIns.address = (this.frmInput.get('txtAddress') as FormControl).value;
      ormSaveIns.city = (this.frmInput.get('drpCity') as FormControl).value;
      ormSaveIns.zip = (this.frmInput.get('txtZip') as FormControl).value;
      ormSaveIns.state = (this.frmInput.get('txtState') as FormControl).value;
      ormSaveIns.plan_name = (this.frmInput.get('txtPlan') as FormControl).value;
      ormSaveIns.phone = (this.frmInput.get('txtPhone') as FormControl).value;
      ormSaveIns.fax = (this.frmInput.get('txtFax') as FormControl).value;
      ormSaveIns.email = (this.frmInput.get('txtEmail') as FormControl).value;
      ormSaveIns.website = (this.frmInput.get('txtWebsite') as FormControl).value;
      ormSaveIns.attn = (this.frmInput.get('txtAttn') as FormControl).value;
      ormSaveIns.payerid = this.listInspayer[this.selectedPayerRow].payer_id;

      ormSaveIns.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSaveIns.modified_user = this.lookupList.logedInUser.user_name;
      ormSaveIns.system_ip = this.lookupList.logedInUser.systemIp;
      ormSaveIns.practice_id = "-1";//this.lookupList.practiceInfo.practiceId.toString(); 


      if (this.operation == "new") {
        ormSaveIns.created_user = this.lookupList.logedInUser.user_name;
        ormSaveIns.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      }
      else if (this.operation == "edit") {
        ormSaveIns.insurance_id = this.listIns[this.selectedInsRow].insurance_id;
        ormSaveIns.created_user = this.listIns[this.selectedInsRow].created_user;
        ormSaveIns.client_date_created = this.listIns[this.selectedInsRow].client_date_created;
        ormSaveIns.date_created = this.listIns[this.selectedInsRow].date_created;
      }
      this.insService.saveInsurances(ormSaveIns).subscribe(
        data => {
          this.saveInsuranceSuccess(data);
        },
        error => {
          this.saveInsuranceError(error);
        }
      );
    }
  }
  saveInsuranceSuccess(data) {
    debugger;
    this.enableDisable('disable');
    this.isDisable = false;
    this.operation = "";
    if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
      if (this.listInsType.length > 0)
        this.getPayerInsurance(this.listInspayer[this.selectedPayerRow].payer_id);

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Insurance Save';
      modalRef.componentInstance.promptMessage = "Insurance save successfully.";
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Insurance Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveInsuranceError(error) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Insurance Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Insurance."
  }
  onCancel() {
    debugger;
    if (this.listIns != undefined && this.listIns != null && this.listIns.length > 0) {
      this.selectedInsRow = 0;
      this.assignvalues();
    }
    else {
      this.clearFields();
    }
    this.enableDisable('disable');
    this.isDisable = false;
    this.operation = "";
  }

  onSearchInsurance() {
    this.isShowSearchIns = true;
    this.isMainIns = false;
  }
  backToMainIns() {
    this.isShowSearchIns = false;
    this.isMainIns = true;
  }
}
