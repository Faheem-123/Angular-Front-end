import { Component, OnInit, Inject } from '@angular/core';
import { InsurancesService } from 'src/app/services/insurances.service';
import { LogMessage } from 'src/app/shared/log-message';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { PromptResponseEnum, ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMSaveInsurance_Payers } from 'src/app/models/billing/ORMSaveInsurance_Payers';

@Component({
  selector: 'insurance-payer',
  templateUrl: './insurance-payer.component.html',
  styleUrls: ['./insurance-payer.component.css']
})
export class InsurancePayerComponent implements OnInit {
  frmInput:FormGroup;
  operation='';
  isDisable=false;
  listInsType;
  listInspayer;
  selectedPayerRow=0;
  selectedTypeRow=0;
  constructor(private insService: InsurancesService,private formBuilder: FormBuilder,private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
     private logMessage: LogMessage,private modalService: NgbModal ) { }

  ngOnInit() {
    this.buildForm();
    this.getInsuranceTypes();    
    this.enableDisable('disable');
  }
  onRefresh()
  {
    this.getInsuranceTypes();    
    this.enableDisable('disable');
  }
  buildForm() {
    this.frmInput = this.formBuilder.group({
      txtName: this.formBuilder.control(""),
      txtid: this.formBuilder.control(""),
      txtFilling: this.formBuilder.control("")
    });
  }
  getInsuranceTypes()
  {
    debugger;
    this.insService.getInsurancePayerTypes()
      .subscribe(
        data => {
          this.listInsType = data;
          this.selectedTypeRow=0;
         // this.assignvalues();
         if(this.listInsType.length>0)
            this.getPayerTypePayer(this.listInsType[this.selectedTypeRow].payertype_id);
          },
        error => {
          this.logMessage.log("An Error Occured while getting getInsurancePayerTypes list.")
          // this.isLoading = false;
        }
      );
  }
  onTypeselectionChange(index: number) {
    this.selectedTypeRow = index;
    this.getPayerTypePayer(this.listInsType[this.selectedTypeRow].payertype_id)

  }
  getPayerTypePayer(id)
  {
    debugger;
    this.insService.getPayerTypePayer(id)
      .subscribe(
        data => {
          this.listInspayer = data;
          this.selectedPayerRow=0;
          if(this.listInspayer.length>0)
              this.assignvalues();
          },
        error => {
          this.logMessage.log("An Error Occured while getting getPayerTypePayer list.")
          // this.isLoading = false;
        }
      );
  }
  onpayerselectionChange(index: number) {
    this.selectedPayerRow = index;
    this.assignvalues();

  }
  assignvalues(){
    (this.frmInput.get("txtName") as FormControl).setValue(this.listInspayer[this.selectedPayerRow].name);
    (this.frmInput.get("txtid") as FormControl).setValue(this.listInspayer[this.selectedPayerRow].payer_number);
    (this.frmInput.get("txtFilling") as FormControl).setValue(this.listInspayer[this.selectedPayerRow].no_of_days);
    
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
        deleteRecordData.column_id = this.listInspayer[this.selectedPayerRow].payer_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.insService.deleteInsurancePayer(deleteRecordData)
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
      this.listInspayer.splice(this.selectedPayerRow, 1);
      if(this.listInspayer.length>0)
      {
        this.selectedPayerRow=0;
        this.assignvalues();
      }
    }
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
  onCancel(){
    if (this.listInspayer != undefined && this.listInspayer != null) {
         this.selectedPayerRow = 0;
         this.assignvalues();
       }
       this.enableDisable('disable');
       this.isDisable = false;
       this.operation = "";
     }
     objORMInsurance_PayerTypes:ORMSaveInsurance_Payers;
  onSave(){
    if ((this.frmInput.get('txtName') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please Enter Name", 'warning')
      return;
    }
    if ((this.frmInput.get('txtid') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please Enter Payer Number", 'warning')
      return;
    }
    this.objORMInsurance_PayerTypes=new ORMSaveInsurance_Payers;
    this.objORMInsurance_PayerTypes.payertype_id = this.listInsType[this.selectedTypeRow].payertype_id;
    this.objORMInsurance_PayerTypes.modified_user = this.lookupList.logedInUser.user_name;
    this.objORMInsurance_PayerTypes.name = this.frmInput.get("txtName").value;
    this.objORMInsurance_PayerTypes.payer_number = this.frmInput.get("txtid").value;
    this.objORMInsurance_PayerTypes.no_of_days = this.frmInput.get("txtFilling").value;
    this.objORMInsurance_PayerTypes.practice_id = "-1";//this.lookupList.practiceInfo.practiceId.toString();
    this.objORMInsurance_PayerTypes.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    this.objORMInsurance_PayerTypes.system_ip=this.lookupList.logedInUser.systemIp;
    if (this.operation == "new") {
      this.objORMInsurance_PayerTypes.created_user = this.lookupList.logedInUser.user_name;  
      this.objORMInsurance_PayerTypes.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else if (this.operation == "edit") {
      this.objORMInsurance_PayerTypes.payer_id=this.listInspayer[this.selectedPayerRow].payer_id;
      this.objORMInsurance_PayerTypes.created_user = this.listInspayer[this.selectedPayerRow].created_user;
      this.objORMInsurance_PayerTypes.client_date_created = this.listInspayer[this.selectedPayerRow].client_date_created;
      this.objORMInsurance_PayerTypes.date_created = this.listInspayer[this.selectedPayerRow].date_created;
    }
this.insService.saveInsurancePayer(this.objORMInsurance_PayerTypes).subscribe(
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
    if(this.listInsType.length>0)
      this.getPayerTypePayer(this.listInsType[this.selectedTypeRow].payertype_id);

    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
    modalRef.componentInstance.promptHeading = 'Payer Save';
    modalRef.componentInstance.promptMessage = "Payer save successfully.";
  }
  else if (data.status === ServiceResponseStatusEnum.ERROR) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Payer Save';
    modalRef.componentInstance.promptMessage = data.response;
  }
}
saveInsurancePayerTypesError(error) {
  const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
  modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
  modalRef.componentInstance.promptHeading = 'Payer Save';
  modalRef.componentInstance.promptMessage = "An Error Occured while saving Payer."
}
 
}
