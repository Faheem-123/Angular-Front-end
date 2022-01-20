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
import { ORMRestrictedCode } from 'src/app/models/billing/ORMRestrictedCode';

@Component({
  selector: 'restricted-code',
  templateUrl: './restricted-code.component.html',
  styleUrls: ['./restricted-code.component.css']
})
export class RestrictedCodeComponent implements OnInit {
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
    this.getPOS();
    this.enableDisable('disable');
  }
  enableDisable(value) {
    if (value == 'disable')
      this.inputForm.disable();
    else
      this.inputForm.enable();
  }
  getPOS() {
    this.claimService.getPracticePOSList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.arrPOS = data as Array<any>;
      },
      error => {
        this.logMessage.log("getPOS Error." + error);
      }
    );
  }
  getCode() {
    this.setupService.getRestrictedcode(this.lookupList.practiceInfo.practiceId).subscribe(
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
      drpPos: this.formBuilder.control(null),
      txtDescription: this.formBuilder.control(null)  
    });
  }
  assignValues() {

    (this.inputForm.get("txtCode") as FormControl).setValue(this.arrCodes[this.selectedIndex].proc_code);
    (this.inputForm.get("drpPos") as FormControl).setValue(this.arrCodes[this.selectedIndex].pos);
    (this.inputForm.get("txtDescription") as FormControl).setValue(this.arrCodes[this.selectedIndex].cpt_description);
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
        deleteRecordData.column_id = this.arrCodes[this.selectedIndex].restproc_id;
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
  objSave: ORMRestrictedCode;
  onSave() {
    this.objSave = new ORMRestrictedCode;

        this.objSave.practice_id = this.lookupList.practiceInfo.practiceId;
        this.objSave.proc_code=this.inputForm.get("txtCode").value;;
				this.objSave.pos=this.inputForm.get("drpPos").value;
				this.objSave.cpt_description=this.inputForm.get("txtDescription").value;				
    if (this.operation == "new") 
    {
      this.objSave.created_user = this.lookupList.logedInUser.user_name;
      this.objSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    } 
    else 
    {
      this.objSave.restproc_id = this.arrCodes[this.selectedIndex].restproc_id;
      this.objSave.client_date_created = this.arrCodes[this.selectedIndex].client_date_created;
      this.objSave.date_created = this.arrCodes[this.selectedIndex].date_created;
      this.objSave.created_user = this.arrCodes[this.selectedIndex].created_user;
    }

    this.objSave.modified_user = this.lookupList.logedInUser.user_name;
    this.objSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    this.setupService.saveRestrictedCode(this.objSave).subscribe(
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
      if (this.objSave.restproc_id == null || this.objSave.restproc_id == '') {
        this.getCode();
      }
      else {
        this.arrCodes[this.selectedIndex].proc_code=this.inputForm.get("txtCode").value;
        this.arrCodes[this.selectedIndex].pos=this.inputForm.get("drpPos").value;
        this.arrCodes[this.selectedIndex].cpt_description=this.inputForm.get("txtDescription").value;
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
