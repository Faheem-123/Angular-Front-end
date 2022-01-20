import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { SetupService } from 'src/app/services/setup.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMAdjustmentReasonCodes } from 'src/app/models/billing/ORMAdjustmentReasonCodes';

@Component({
  selector: 'adjust-code',
  templateUrl: './adjust-code.component.html',
  styleUrls: ['./adjust-code.component.css']
})
export class AdjustCodeComponent implements OnInit {

  arrPOS;
  inputForm:FormGroup;
  arrCodes;
  selectedIndex=0;
  operation='';
  isDisable = false;
  constructor(private setupService: SetupService, @Inject(LOOKUP_LIST) public lookupList: LookupList,
  private formBuilder: FormBuilder, private logMessage: LogMessage, private dateTimeUtil: DateTimeUtil,
  private modalService: NgbModal, private generalService: GeneralService, private claimService:ClaimService) { 

  }
 
  ngOnInit() {
    this.buildForm();
    this.getCode();
    this.enableDisable('disable');
  }
  enableDisable(value) {
    if (value == 'disable')
      this.inputForm.disable();
    else
      this.inputForm.enable();
  }
  getCode() {
    this.setupService.getAdjustcode(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.arrCodes = data as Array<any>;
      },
      error => {
        this.logMessage.log("getCode Error." + error);
      }
    );
  }
  
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtCode: this.formBuilder.control(null, Validators.required),
      txtDescription: this.formBuilder.control(null)  
    });
  }
  assignValues() {

    (this.inputForm.get("txtCode") as FormControl).setValue(this.arrCodes[this.selectedIndex].code);
    (this.inputForm.get("txtDescription") as FormControl).setValue(this.arrCodes[this.selectedIndex].description);
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
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
        deleteRecordData.column_id = this.arrCodes[this.selectedIndex].id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.setupService.deleteRestrictedCode(deleteRecordData)
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
      modalRef.componentInstance.promptHeading = "Code Setup"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.arrCodes.splice(this.selectedIndex, 1);
    }
  }
  objSave: ORMAdjustmentReasonCodes;
  onSave() {
    this.objSave = new ORMAdjustmentReasonCodes;

    this.objSave.code=this.inputForm.get("txtCode").value;;
    this.objSave.description=this.inputForm.get("txtDescription").value;				
    if (this.operation == "new") 
    {
      this.objSave.created_user = this.lookupList.logedInUser.user_name;
      this.objSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    } 
    else 
    {
      this.objSave.id = this.arrCodes[this.selectedIndex].id;
      this.objSave.client_date_created = this.arrCodes[this.selectedIndex].client_date_created;
      this.objSave.date_created = this.arrCodes[this.selectedIndex].date_created;
      this.objSave.created_user = this.arrCodes[this.selectedIndex].created_user;
    }

    this.objSave.modified_user = this.lookupList.logedInUser.user_name;
    this.objSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    this.setupService.saveAdjustCode(this.objSave).subscribe(
      data => {
        debugger;
        this.saveRestrictedCodeSuccess(data);
      },
      error => {
        this.saveProviderError(error);
      }
    );
  }
  saveRestrictedCodeSuccess(data) {
    debugger;
    this.enableDisable('disable');
    this.isDisable = false;
    this.operation = "";
    if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
      if (this.objSave.id == null || this.objSave.id == '') {
        this.getCode();
      }
      else {
        this.arrCodes[this.selectedIndex].code=this.inputForm.get("txtCode").value;
        this.arrCodes[this.selectedIndex].description=this.inputForm.get("txtDescription").value;
      }
      //this.selectedIndex=0;
      //this.assignValues();
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Code Save';
      modalRef.componentInstance.promptMessage = "Code save successfully.";
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Code Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveProviderError(error) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Code Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Code."
  }
  onCancel() {
    if (this.arrCodes != undefined && this.arrCodes != null) {
      this.selectedIndex = 0;
      this.assignValues();
    }
    this.enableDisable('disable');
    this.isDisable = false;
    this.operation = "";
  }
  onSelectionChange(index, obj) {
    this.selectedIndex = index;
    this.assignValues();
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
    this.operation = "Edit";
  }
  clearFields() {
    this.inputForm.reset();
  }
}
