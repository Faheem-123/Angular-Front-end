import { Component, OnInit, Inject } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { DiagSearchCriteria } from 'src/app/general-modules/inline-diagnosis-search/diag-search-criteria';
import { SetupService } from 'src/app/services/setup.service';
import { ORMMyListICD } from 'src/app/models/setting/ORMMyListICD';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertTypeEnum, PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'mylist-icd',
  templateUrl: './mylist-icd.component.html',
  styleUrls: ['./mylist-icd.component.css']
})
export class MylistIcdComponent implements OnInit {
  selectedProviderIndex=0;
  inputForm:FormGroup;
  showDiagSearch=false;
  diagSearchCriteria: DiagSearchCriteria;
  operation="";
  arrCodeDetail;
  total: number;
  page: number=1;
  pageSize: number=20;
  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,private setupService: SetupService,private modalService: NgbModal) { }

  ngOnInit() {
    this.buildForm();
    this.getCodeDetail(this.lookupList.providerList[0].id);
  }
  buildForm() {
     
    this.inputForm = this.formBuilder.group({
      txtcodeSearch: this.formBuilder.control(null),
      txtCode: this.formBuilder.control(null, Validators.required),
      txtDesc: this.formBuilder.control(null, Validators.required),
    })
    this.enableDisableField(false);    
  }
  enableDisableField(value)
  {
    if(value)
      this.inputForm.enable();
    else
      this.inputForm.disable();
  }
  onProviderSelectionChange(index,u)
  {
    this.selectedProviderIndex=index;
    this.getCodeDetail(this.lookupList.providerList[this.selectedProviderIndex].id);
    // this.role_id=u.role_id;
    // this.getRoleDetail(u.role_id);
  }

  onCodeSearchKeydown(event) {
    debugger;
    if (event.key === "Enter") {
      debugger;
      this.diagSearchCriteria = new DiagSearchCriteria();
      this.diagSearchCriteria.codeType = "ICD-10";
      this.diagSearchCriteria.criteria = event.currentTarget.value;
      this.diagSearchCriteria.providerId = undefined;

      this.showDiagSearch = true;
    }
    else {
      //this.showDiagSearch = false;
    }
  }

  onSearchInputChange(newValue) {
    if (newValue !== this.inputForm.get("txtDesc").value) {
      this.inputForm.get("txtCode").setValue(null);
    }
  }
  onSearchBlur() {
    if (this.showDiagSearch == false) {
      this.inputForm.get("txtCode").setValue(null);
      this.inputForm.get("txtDesc").setValue(null);
    }

  }

  onDiagnosisSelect(diag) {
    (this.inputForm.get("txtCode") as FormControl).setValue(diag.diag_code);
    (this.inputForm.get("txtDesc") as FormControl).setValue(diag.diag_description);

    this.showDiagSearch = false;
  }

  closeDiagSearch() {
    this.showDiagSearch = false;
    this.onSearchBlur();
  }
  onAdd(){
  this.operation="New";
  this.enableDisableField(true);
  this.clearFields();
  }
  onEditDetail(){
    this.operation="Edit";
    this.enableDisableField(true);
    this.clearFields();
  }
  arrDetailSave : Array<ORMMyListICD>=new Array;
  onSave(){
    debugger;
    this.arrDetailSave = new Array;
    let objORMMylist_icd: ORMMyListICD;
    if (this.operation == "New")
    {
      for (let i = 0; i < this.arrCodeDetail.length; i++) 
      {
        objORMMylist_icd = new ORMMyListICD();
        objORMMylist_icd.id = "";
        objORMMylist_icd.diag_code = this.arrCodeDetail[i].diag_code;
        objORMMylist_icd.diag_description = this.arrCodeDetail[i].diag_description;
        objORMMylist_icd.expiry_date = "";//listicdDetail[i].expiry_date;
        objORMMylist_icd.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        objORMMylist_icd.provider_id = this.lookupList.providerList[this.selectedProviderIndex].id;
        objORMMylist_icd.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        objORMMylist_icd.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        objORMMylist_icd.modified_user = this.lookupList.logedInUser.user_name;
        objORMMylist_icd.created_user = this.lookupList.logedInUser.user_name;

        this.arrDetailSave.push(objORMMylist_icd);
      }
    }
   else if (this.operation == "Edit") {
        objORMMylist_icd = new ORMMyListICD();
        objORMMylist_icd.id = this.arrCodeDetail[this.codeDetailSelectedIndex].id;
        objORMMylist_icd.diag_code = this.inputForm.get("txtCode").value;
        objORMMylist_icd.diag_description = this.inputForm.get("txtDesc").value;
        objORMMylist_icd.expiry_date = "";//listicdDetail[i].expiry_date;
        objORMMylist_icd.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        objORMMylist_icd.provider_id = this.lookupList.providerList[this.selectedProviderIndex].id;
        objORMMylist_icd.client_date_created =  this.arrCodeDetail[this.codeDetailSelectedIndex].client_date_created;
        objORMMylist_icd.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        objORMMylist_icd.modified_user = this.lookupList.logedInUser.user_name;
        objORMMylist_icd.created_user = this.arrCodeDetail[this.codeDetailSelectedIndex].created_user;
        objORMMylist_icd.date_created= this.arrCodeDetail[this.codeDetailSelectedIndex].date_created;

        this.arrDetailSave.push(objORMMylist_icd);
    }
    if(this.arrDetailSave.length>0)
    {
      this.setupService.saveSetupMyListICD(this.arrDetailSave).subscribe(
        data => {
          debugger;
          if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
            const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
            modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
            modalRef.componentInstance.promptHeading = 'My List';
            modalRef.componentInstance.promptMessage = "My List save successfully.";
            this.getCodeDetail(this.lookupList.providerList[this.selectedProviderIndex].id)
            this.operation="";
            this.enableDisableField(false);
            this.isDisable=false;
        }},
        error => {
        }
      );
    }
    this.operation="";
    this.enableDisableField(false);
    this.clearFields();
  }
  isDisable=false;
  onCancel(){
    this.operation="";
    this.enableDisableField(false);
    this.clearFields();
  }
  clearFields(){
    (this.inputForm.get("txtcodeSearch") as FormControl).setValue("");
    (this.inputForm.get("txtCode") as FormControl).setValue("");
    (this.inputForm.get("txtDesc") as FormControl).setValue("");
  }
  codeDetailSelectedIndex=0;
  getCodeDetail(provider_id) {
    this.setupService.getSetupMyListICD(this.lookupList.practiceInfo.practiceId.toString(),provider_id).subscribe(
        data => {
            this.arrCodeDetail = data as Array<any>;
            if(this.arrCodeDetail!=undefined && this.arrCodeDetail!=null)
            {
              this.codeDetailSelectedIndex=0;
              if(this.arrCodeDetail.length>0)
              {
                this.assignValues();
              }
              else{
                this.clearFields();
              }
            }
        },
        error => {
        }
    );
  }
  assignValues(){
    (this.inputForm.get("txtcodeSearch") as FormControl).setValue("");
    (this.inputForm.get("txtCode") as FormControl).setValue(this.arrCodeDetail[this.codeDetailSelectedIndex].diag_code);
    (this.inputForm.get("txtDesc") as FormControl).setValue(this.arrCodeDetail[this.codeDetailSelectedIndex].diag_description);  
  }
  onCodeDetailSelectionChange(index)
  {
    this.codeDetailSelectedIndex=index;
    this.assignValues();
  }
  onAddToList(){
    this.arrCodeDetail.push({ 
      id: "", 
      diag_code:this.inputForm.get("txtCode").value,
      diag_description:this.inputForm.get("txtDesc").value,
      provider_id:"",
      system_ip:this.lookupList.logedInUser.systemIp,
      deleted: false, 
      created_user: this.lookupList.logedInUser.user_name, 
      modified_user: this.lookupList.logedInUser.user_name,
      client_date_created: "",  
      client_date_modified:  "", 
      date_created: "",
      date_modified:"",
      expiry_date:"",
      practice_id:this.lookupList.practiceInfo.practiceId});
      
      this.clearFields();
  }
  onDeleteDetail(obj)
{
  const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
  modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
  modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
  modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
  let closeResult;

  modalRef.result.then((result) => {

    if (result == PromptResponseEnum.YES) {
      debugger;
      let deleteRecordData = new ORMDeleteRecord();
      deleteRecordData.column_id = obj.id;
      deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
      deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
      deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

      this.setupService.deleteSetupMyListICD(deleteRecordData)
        .subscribe(
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
        );
    }
  }, (reason) => {
  });
}

onDeleteSuccessfully(data) {
  if (data.status === ServiceResponseStatusEnum.ERROR) {

    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "My List Setup"
    modalRef.componentInstance.promptMessage = data.response;

    let closeResult;

    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
  }
  else {
    this.arrCodeDetail.splice(this.codeDetailSelectedIndex,1);

  }
}
poupUpOptions: NgbModalOptions = {
  backdrop: 'static',
  keyboard: false
};
}
