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
import { ORMSaveInsurancePayerTypes } from 'src/app/models/setting/ORMSaveInsurancePayerTypes';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'insurance-type',
  templateUrl: './insurance-type.component.html',
  styleUrls: ['./insurance-type.component.css']
})
export class InsuranceTypeComponent implements OnInit {
  frmInput:FormGroup;
  operation='';
  isDisable=false;
  constructor(private insService: InsurancesService,private formBuilder: FormBuilder,private dateTimeUtil: DateTimeUtil,
   @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,private modalService: NgbModal ) { }

  listInsType;
  ngOnInit() {
    this.buildForm();
    this.getInsuranceTypes();
    this.enableDisable('disable');
  }
  buildForm() {
    this.frmInput = this.formBuilder.group({
      txtName: this.formBuilder.control(""),
      txtCode: this.formBuilder.control("")
    });
  }
  getInsuranceTypes()
  {
debugger;
    this.insService.getInsurancePayerTypes()
      .subscribe(
        data => {
          this.listInsType = data;
          this.selectedRow=0;
          this.assignvalues();
          },
        error => {
          this.logMessage.log("An Error Occured while getting getInsurancePayerTypes list.")
          // this.isLoading = false;
        }
      );
  }
  selectedRow=0;
  onselectionChange(index: number) {
    this.selectedRow = index;
    this.assignvalues()
  }
  assignvalues(){
    (this.frmInput.get("txtName") as FormControl).setValue(this.listInsType[this.selectedRow].name);
    (this.frmInput.get("txtCode") as FormControl).setValue(this.listInsType[this.selectedRow].payertype_code);
  }
  onAddNew(){
    this.operation = "new";
    this.clearFields();
    this.enableDisable('enable');
    this.isDisable = true;
  }
  onEdit(){
    this.enableDisable('enable');
    this.isDisable = true;
    this.operation = "edit";
  }
  onDelete(){
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.listInsType[this.selectedRow].payertype_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.insService.deleteInsurancePayerTypes(deleteRecordData)
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
      this.listInsType.splice(this.selectedRow, 1);
      if(this.listInsType.length>0)
      {
        this.selectedRow=0;
        this.assignvalues();
      }
    }
  }
  objORMInsurance_PayerTypes:ORMSaveInsurancePayerTypes;
  onSave(){
    debugger;
    if ((this.frmInput.get('txtName') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please Enter Name", 'warning')
      return;
    }
    if ((this.frmInput.get('txtCode') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please Enter Code", 'warning')
      return;
    }
    this.objORMInsurance_PayerTypes=new ORMSaveInsurancePayerTypes;
    this.objORMInsurance_PayerTypes.modified_user = this.lookupList.logedInUser.user_name;
    this.objORMInsurance_PayerTypes.name = this.frmInput.get("txtName").value;
    this.objORMInsurance_PayerTypes.payertype_code = this.frmInput.get("txtCode").value;
    this.objORMInsurance_PayerTypes.practice_id = "-1";//this.lookupList.practiceInfo.practiceId.toString();
    this.objORMInsurance_PayerTypes.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    if (this.operation == "new") {
      this.objORMInsurance_PayerTypes.created_user = this.lookupList.logedInUser.user_name;  
      this.objORMInsurance_PayerTypes.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else if (this.operation == "edit") {
      this.objORMInsurance_PayerTypes.payertype_id = this.listInsType[this.selectedRow].payertype_id;
      this.objORMInsurance_PayerTypes.created_user = this.listInsType[this.selectedRow].created_user;
      this.objORMInsurance_PayerTypes.client_date_created = this.listInsType[this.selectedRow].client_date_created;
      this.objORMInsurance_PayerTypes.date_created = this.listInsType[this.selectedRow].date_created;
    }
this.insService.saveInsurancePayerTypes(this.objORMInsurance_PayerTypes).subscribe(
  data=>
  {
    this.saveInsurancePayerTypesSuccess(data);
  },
  error=>{
    this.saveInsurancePayerTypesError(error);
  }
)
}
saveInsurancePayerTypesSuccess(data) {
  debugger;
  this.enableDisable('disable');
  this.isDisable = false;
  this.operation = "";
  if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {

    this.getInsuranceTypes();

    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
    modalRef.componentInstance.promptHeading = 'Payer Type Save';
    modalRef.componentInstance.promptMessage = "Payer Type save successfully.";
  }
  else if (data.status === ServiceResponseStatusEnum.ERROR) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Payer Type Save';
    modalRef.componentInstance.promptMessage = data.response;
  }
}
saveInsurancePayerTypesError(error) {
  const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
  modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
  modalRef.componentInstance.promptHeading = 'Payer Type Save';
  modalRef.componentInstance.promptMessage = "An Error Occured while saving Payer Type."
}
  onCancel(){
 if (this.listInsType != undefined && this.listInsType != null) {
      this.selectedRow = 0;
      this.assignvalues();
    }
    this.enableDisable('disable');
    this.isDisable = false;
    this.operation = "";
  }
  clearFields() {
    this.frmInput.reset();
  }
  enableDisable(value) {
    if (value == 'disable')
      this.frmInput.disable();
    else
      this.frmInput.enable();
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
}
