import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { ORMSaveSuperBill } from 'src/app/models/setting/ORMSaveSuperBill';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ServiceResponseStatusEnum, PromptResponseEnum, AlertTypeEnum, ProcedureSearchType } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMSaveSuperBillCategory } from 'src/app/models/setting/ORMSaveSuperBillCategory';
import { ProcedureSearchCriteria } from 'src/app/general-modules/inline-procedure-search/proc-search-criteria';
import { DiagSearchCriteria } from 'src/app/general-modules/inline-diagnosis-search/diag-search-criteria';
import { ORMSaveSuperBillCategoryDetail } from 'src/app/models/setting/ORMSaveSuperBillCategoryDetail';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'superbill-setup',
  templateUrl: './superbill-setup.component.html',
  styleUrls: ['./superbill-setup.component.css']
})
export class SuperbillSetupComponent implements OnInit {

  frmNewBill:FormGroup;
  frmNewBillCategory:FormGroup;
  inputForm:FormGroup;

  arrSuperBill;
  arrSuperBillCategory;
  arrSuperBillCategoryDetail;
  superBillIndex;
  superBillCategoryIndex;
  superBillDetailIndex;
  showBillName=false;
  isDisable=false;
  isSaving=false;
  codeType1Update='';
  codeType2Update='';
  constructor(private setupService: SetupService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  ,private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil, private modalService: NgbModal) { }

  ngOnInit() {
    this.buildForm();
    this.getSuperBill();   
  }
  buildForm() {
    this.frmNewBill = this.formBuilder.group({
      txtBillName: this.formBuilder.control(null, Validators.required),
    })
    this.frmNewBillCategory = this.formBuilder.group({
      txtCategoryName: this.formBuilder.control(null, Validators.required),
      txtposition: this.formBuilder.control(null, Validators.required),
    })
    this.inputForm = this.formBuilder.group({
      txtCatDescription: this.formBuilder.control(null, Validators.required),
      txtcode1Type: this.formBuilder.control(null, Validators.required),

      txtcode1Search: this.formBuilder.control(null, Validators.required),
      txtcode1: this.formBuilder.control(null, Validators.required),
      txtcode1Desc: this.formBuilder.control(null, Validators.required),
      txtcode1Modifier: this.formBuilder.control(null, Validators.required),
      txtcode1NDC: this.formBuilder.control(null, Validators.required),
      txtcode1charge: this.formBuilder.control(null, Validators.required),
      txtcode1unit: this.formBuilder.control(null, Validators.required),
      txtcode2Type: this.formBuilder.control(null, Validators.required),
      txtcode2Search: this.formBuilder.control(null, Validators.required),
      txtcode2: this.formBuilder.control(null, Validators.required),
      txtcode2Desc: this.formBuilder.control(null, Validators.required),
      txtcode2Modifier: this.formBuilder.control(null, Validators.required),
      txtcode2charge: this.formBuilder.control(null, Validators.required),
      txtcode2unit: this.formBuilder.control(null, Validators.required),
    })
    this.enableDisableField(false);    
  }
  getSuperBill() {
    this.setupService.getSuperBillSetup(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
        data => {
            this.arrSuperBill = data as Array<any>;
            if(this.arrSuperBill!=undefined && this.arrSuperBill!=null)
            {
              this.superBillIndex=0;
              this.getSuperBillCategory(this.arrSuperBill[0].bill_id)
            }
        },
        error => {
        }
    );
}
getSuperBillCategory(bill_id) {
  this.setupService.getSuperBillCategorySetup(bill_id).subscribe(
      data => {
          this.arrSuperBillCategory = data as Array<any>;
          if(this.arrSuperBillCategory!=undefined && this.arrSuperBillCategory!=null && this.arrSuperBillCategory.length>0)
          {
            debugger;
            this.superBillCategoryIndex=0;
            this.getSuperBillCategoryDetail(this.arrSuperBillCategory[0].category_id)
          }
      },
      error => {
      }
  );
}
getSuperBillCategoryDetail(category_id) {
  this.setupService.getSuperBillCategoryDetailSetup(category_id).subscribe(
      data => {
          this.arrSuperBillCategoryDetail = data as Array<any>;
          if(this.arrSuperBillCategoryDetail!=undefined && this.arrSuperBillCategoryDetail!=null)
          {
            this.superBillDetailIndex=0;
            if(this.arrSuperBillCategoryDetail.length>0)
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
onSuperBillSelectionChange(index,obj)
{
  this.superBillIndex=index;
  this.getSuperBillCategory(this.arrSuperBill[this.superBillIndex].bill_id);
}
onSuperBillCategorySelectionChange(index,obj)
{
  this.superBillCategoryIndex=index;
  this.getSuperBillCategoryDetail(this.arrSuperBillCategory[this.superBillCategoryIndex].category_id);
 
}
onSuperBillCategoryDetailSelectionChange(index,obj)
{
  this.superBillDetailIndex=index;
  this.assignValues();
}
assignValues(){
  debugger;
  (this.inputForm.get("txtCatDescription") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].description);
  (this.inputForm.get("txtcode1Type") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].code1_type.toLowerCase());
  (this.inputForm.get("txtcode1Search") as FormControl).setValue("");
  (this.inputForm.get("txtcode1") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].code1);
  (this.inputForm.get("txtcode1Desc") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].description1);
  (this.inputForm.get("txtcode1Modifier") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].default_modifier1);
  (this.inputForm.get("txtcode1NDC") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].default_ndc1);
  
  (this.inputForm.get("txtcode1charge") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].default_amt1);
  (this.inputForm.get("txtcode1unit") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].unit1);
  (this.inputForm.get("txtcode2Type") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].code2_type.toString().toLowerCase());
  (this.inputForm.get("txtcode2Search") as FormControl).setValue("");
  (this.inputForm.get("txtcode2") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].code2);
  (this.inputForm.get("txtcode2Desc") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].description2);

  (this.inputForm.get("txtcode2Modifier") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].default_modifier2);
  (this.inputForm.get("txtcode2charge") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].default_amt2);
  (this.inputForm.get("txtcode2unit") as FormControl).setValue(this.arrSuperBillCategoryDetail[this.superBillDetailIndex].unit2);

}
superBillOperation="";
onAddSuperBill()
{
  this.showBillName=true;
  this.superBillOperation="new";
  (this.frmNewBill.get("txtBillName") as FormControl).setValue("");
  this.isDisable=true;

}
objSuperBill:ORMSaveSuperBill;
onBillSave(){
  
  this.objSuperBill=new ORMSaveSuperBill();
  
  this.objSuperBill.bill_name=this.frmNewBill.get("txtBillName").value;
  this.objSuperBill.practice_id=this.lookupList.practiceInfo.practiceId.toString();
  this.objSuperBill.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();

  if(this.superBillOperation=="new")
  {
    this.objSuperBill.bill_id="";
    this.objSuperBill.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
    this.objSuperBill.created_user=this.lookupList.logedInUser.user_name;
  }
  else{
    this.objSuperBill.client_date_created=this.arrSuperBill[this.superBillIndex].client_date_created;
    this.objSuperBill.date_created=this.arrSuperBill[this.superBillIndex].date_created;
    this.objSuperBill.created_user=this.arrSuperBill[this.superBillIndex].created_user;
    this.objSuperBill.bill_id=this.arrSuperBill[this.superBillIndex].bill_id;
  }
  this.objSuperBill.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
  this.objSuperBill.modified_user=this.lookupList.logedInUser.user_name;

  this.setupService.saveSuperBill(this.objSuperBill).subscribe(
    data => {
      if(this.superBillOperation=="new")
      {
        this.objSuperBill.bill_id=data['result'];
        this.arrSuperBill.push(this.objSuperBill);
        this.superBillIndex=this.arrSuperBill.length;
      }
      else{
        this.arrSuperBill[this.superBillIndex].bill_name =this.frmNewBill.get("txtBillName").value;
      }
      this.showBillName=false;
      this.superBillOperation="";
      this.isDisable=false;
    },
    error => {
    }
  );
}
onBillCancel(){
  this.showBillName=false;
  this.superBillOperation="";
  this.isDisable=false;
}
onEditSuperBill(obj)
{
  debugger;
  this.showBillName=true;
  this.superBillOperation="edit";
  (this.frmNewBill.get("txtBillName") as FormControl).setValue(obj.bill_name);
  this.isDisable=true;
}
onDeleteSuperBill(obj)
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
      deleteRecordData.column_id = obj.bill_id;
      deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
      deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
      deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

      this.setupService.deleteSuperBill(deleteRecordData)
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
    modalRef.componentInstance.promptHeading = "SuperBill Setup"
    modalRef.componentInstance.promptMessage = data.response;

    let closeResult;

    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
  }
  else {
    this.arrSuperBill.splice(this.superBillIndex,1);

  }
}
poupUpOptions: NgbModalOptions = {
  backdrop: 'static',
  keyboard: false
};
showBillCategoryName=false;
superBillCategoryOperation="";
onAddSuperBillCategory(){
  this.showBillCategoryName=true;
  this.superBillCategoryOperation="new";
  (this.frmNewBillCategory.get("txtCategoryName") as FormControl).setValue("");  
  (this.frmNewBillCategory.get("txtposition") as FormControl).setValue("");   
  this.isDisable=true;   
}

objSuperBillCategory:ORMSaveSuperBillCategory;
onSaveBillCategory(){
  
  this.objSuperBillCategory=new ORMSaveSuperBillCategory();
  this.objSuperBillCategory.bill_id=this.arrSuperBill[this.superBillIndex].bill_id;
  this.objSuperBillCategory.category_name=this.frmNewBillCategory.get("txtCategoryName").value;
  this.objSuperBillCategory.position=this.frmNewBillCategory.get("txtposition").value;

  this.objSuperBillCategory.practice_id=this.lookupList.practiceInfo.practiceId.toString();
  this.objSuperBillCategory.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();

  if(this.superBillCategoryOperation=="new")
  {
    this.objSuperBillCategory.category_id="";
    this.objSuperBillCategory.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
    this.objSuperBillCategory.created_user=this.lookupList.logedInUser.user_name;
  }
  else{
    this.objSuperBillCategory.client_date_created=this.arrSuperBillCategory[this.superBillCategoryIndex].client_date_created;
    this.objSuperBillCategory.date_created=this.arrSuperBillCategory[this.superBillCategoryIndex].date_created;
    this.objSuperBillCategory.created_user=this.arrSuperBillCategory[this.superBillCategoryIndex].created_user;
    this.objSuperBillCategory.category_id=this.arrSuperBillCategory[this.superBillCategoryIndex].category_id;
  }
  this.objSuperBillCategory.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
  this.objSuperBillCategory.modified_user=this.lookupList.logedInUser.user_name;

  this.setupService.saveSuperBillCategory(this.objSuperBillCategory).subscribe(
    data => {
      if(this.superBillCategoryOperation=="new")
      {
        this.objSuperBillCategory.category_id=data['result'];
        this.arrSuperBillCategory.push(this.objSuperBillCategory);
        this.superBillCategoryIndex=this.arrSuperBillCategory.length;
      }
      else{
        this.arrSuperBillCategory[this.superBillCategoryIndex].category_name =this.frmNewBillCategory.get("txtCategoryName").value;
      }
      this.showBillCategoryName=false;
      this.superBillCategoryOperation="";
      this.isDisable=false;
    },
    error => {
    }
  );
}
onCancelBillCategory(){
  this.showBillCategoryName=false;
  this.superBillCategoryOperation="";
  this.isDisable=false;
}
onEditSuperBillCatgeory(obj)
{
  this.showBillCategoryName=true;
  this.superBillCategoryOperation="edit";
  (this.frmNewBillCategory.get("txtCategoryName") as FormControl).setValue(obj.category_name);
  this.isDisable=true;
}

onDeleteSuperBillCategory(obj)
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
      deleteRecordData.column_id = obj.category_id;
      deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
      deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
      deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

      this.setupService.deleteSuperBillCategory(deleteRecordData)
        .subscribe(
          data => this.onDeleteCaetgorySuccessfully(data),
          error => alert(error),
        );
    }
  }, (reason) => {
  });
}

onDeleteCaetgorySuccessfully(data) {
  if (data.status === ServiceResponseStatusEnum.ERROR) {

    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "SuperBill Setup"
    modalRef.componentInstance.promptMessage = data.response;

    let closeResult;

    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
  }
  else {
    this.arrSuperBillCategory.splice(this.superBillCategoryIndex,1);

  }
}
superBillCategoryDetailOperation="";
onAddNewDetail()
{
  this.codeType1Update='';
  this.codeType2Update='';
  this.superBillCategoryDetailOperation="new";
  this.clearFields();
  this.enableDisableField(true);
  this.isDisable=true;
  this.enableDisableCodeType();
  
}
enableDisableCodeType(){
  let codetype1=this.inputForm.get('txtcode1Type');
  codetype1.enable();
  let codetype2=this.inputForm.get('txtcode2Type');
  codetype2.enable();
  if(this.arrSuperBillCategory.length>0 && this.arrSuperBillCategory[this.superBillCategoryIndex].code1_type.toString()!="")
  {
    (this.inputForm.get("txtcode1Type") as FormControl).setValue(this.arrSuperBillCategory[this.superBillCategoryIndex].code1_type.toString().toLowerCase());
    codetype1.disable();
  }
  else{
    codetype1.enable();
  }
  if(this.arrSuperBillCategory.length>0 && this.arrSuperBillCategory[this.superBillCategoryIndex].code2_type.toString()!="")
  {
    (this.inputForm.get("txtcode2Type") as FormControl).setValue(this.arrSuperBillCategory[this.superBillCategoryIndex].code2_type.toString().toLowerCase());
    codetype2.disable();
  }
  else{
    codetype2.enable();
  }
}
clearFields(){
(this.inputForm.get("txtCatDescription") as FormControl).setValue("");
//(this.inputForm.get("txtcode1Type") as FormControl).setValue("");
(this.inputForm.get("txtcode1Search") as FormControl).setValue("");
(this.inputForm.get("txtcode1") as FormControl).setValue("");
(this.inputForm.get("txtcode1Desc") as FormControl).setValue("");
(this.inputForm.get("txtcode1Modifier") as FormControl).setValue("");
(this.inputForm.get("txtcode1NDC") as FormControl).setValue("");
(this.inputForm.get("txtcode1charge") as FormControl).setValue("");
(this.inputForm.get("txtcode1unit") as FormControl).setValue("");
//(this.inputForm.get("txtcode2Type") as FormControl).setValue("");
(this.inputForm.get("txtcode2Search") as FormControl).setValue("");
(this.inputForm.get("txtcode2") as FormControl).setValue("");
(this.inputForm.get("txtcode2Desc") as FormControl).setValue("");
(this.inputForm.get("txtcode2Modifier") as FormControl).setValue("");
(this.inputForm.get("txtcode2charge") as FormControl).setValue("");
(this.inputForm.get("txtcode2unit") as FormControl).setValue("");
}
enableDisableField(value)
{
  if(value)
    this.inputForm.enable();
  else
    this.inputForm.disable();
}
onEditDetail(obj)
{
  this.codeType1Update='';
  this.codeType2Update='';
  this.superBillCategoryDetailOperation="edit";
  this.isDisable=true;
  this.enableDisableField(true);

  this.enableDisableCodeType();
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
      deleteRecordData.column_id = obj.detail_id;
      deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
      deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
      deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

      this.setupService.deleteSuperBillCategoryDetail(deleteRecordData)
        .subscribe(
          data => this.onDeleteCategoryDetailSuccessfully(data),
          error => alert(error),
        );
    }
  }, (reason) => {
  });
}


onDeleteCategoryDetailSuccessfully(data) {
  if (data.status === ServiceResponseStatusEnum.ERROR) {

    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "SuperBill Setup"
    modalRef.componentInstance.promptMessage = data.response;

    let closeResult;

    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
  }
  else {
    this.arrSuperBillCategoryDetail.splice(this.superBillDetailIndex,1);

  }
}
showDiagSearch1 = false;
showProcSearch1 = false;

showDiagSearch2 = false;
showProcSearch2 = false;

onCode1SearchKeydown(value,section) 
{
  if(value.length>2)
  {
    if(section=="1")
    {
      if(this.inputForm.get("txtcode1Type").value.toString().toUpperCase()=="CPT")
      {
        this.sentProcedureCriteriatoSearch(value,section);
      }
      else if (this.inputForm.get("txtcode1Type").value.toString().toUpperCase()=="ICD")
      {
        this.sentDiagnosisCriteriatoSearch(value,section);
      }
    }
    else if(section=="2")
    {
      if(this.inputForm.get("txtcode2Type").value.toString().toUpperCase()=="CPT")
      {
        this.sentProcedureCriteriatoSearch(value,section);
      }
      else if (this.inputForm.get("txtcode2Type").value.toString().toUpperCase()=="ICD")
      {
        this.sentDiagnosisCriteriatoSearch(value,section);
      }
    }
  }
  else 
  {
    this.showDiagSearch1 = false;
    this.showProcSearch1=false;
  }
}
procSearchCriteria: ProcedureSearchCriteria;
sentProcedureCriteriatoSearch(value,section)
  {
    debugger;
    this.procSearchCriteria = new ProcedureSearchCriteria();
    this.procSearchCriteria.providerId = undefined;
    this.procSearchCriteria.criteria = value;  
    this.procSearchCriteria.dos=this.dateTimeUtil.getCurrentDateTimeString();
    this.procSearchCriteria.searchType=ProcedureSearchType.ALL;
    if(section=="1")
    {
      this.showProcSearch1=true; 
      this.showProcSearch2=false; 
    }
    else{
      this.showProcSearch1=false; 
      this.showProcSearch2=true; 
    }
  }
  onProcCodeSelect(obj,section) {
    debugger;
    if(section=="1")
    {
      (this.inputForm.get("txtcode1") as FormControl).setValue(obj.code);
      (this.inputForm.get("txtcode1Desc") as FormControl).setValue(obj.description);  
      this.showProcSearch1 = false;
    }
    else{
      (this.inputForm.get("txtcode2") as FormControl).setValue(obj.code);
      (this.inputForm.get("txtcode2Desc") as FormControl).setValue(obj.description);  
      this.showProcSearch2 = false;
    }
  }
  closeProcSearch() {
    this.showProcSearch1 = false;
    this.showProcSearch2 = false;
  }
  diagSearchCriteria: DiagSearchCriteria;
  sentDiagnosisCriteriatoSearch(value,section)
  {
    debugger;
    this.diagSearchCriteria = new DiagSearchCriteria();
    this.diagSearchCriteria.providerId = undefined;    
    this.diagSearchCriteria.codeType = "ICD-10";
    this.diagSearchCriteria.criteria = value;  
    this.diagSearchCriteria.dos=this.dateTimeUtil.getCurrentDateTimeString();
    if(section=="1")
    {
      this.showDiagSearch1=true; 
      this.showDiagSearch2=false; 
    }
    else{
      this.showDiagSearch1=false; 
      this.showDiagSearch2=true; 
    }
    
  }
  onDiagnosisSelect(diag,section) {
    if(section=="1")
    {
      (this.inputForm.get("txtcode1") as FormControl).setValue(diag.diag_code);
      (this.inputForm.get("txtcode1Desc") as FormControl).setValue(diag.diag_description);
      this.showDiagSearch1 = false;
    }
    else{
      (this.inputForm.get("txtcode2") as FormControl).setValue(diag.diag_code);
      (this.inputForm.get("txtcode2Desc") as FormControl).setValue(diag.diag_description);
      this.showDiagSearch2 = false;
    }
    
  }

  closeDiagSearch() {
    this.showDiagSearch1 = false;
    this.showDiagSearch2= false;
  }
  
  onAddToList(){
    this.arrSuperBillCategoryDetail.push({ 
      detail_id: "", 
      category_id: this.arrSuperBillCategory[this.superBillCategoryIndex].category_id, 
      description: this.inputForm.get("txtCatDescription").value, 
      code1:this.inputForm.get("txtcode1").value ,
      code1_type:this.inputForm.get("txtcode1Type").value ,
      code2: this.inputForm.get("txtcode2").value,  
      code2_type:this.inputForm.get("txtcode2Type").value ,
      unit1:this.inputForm.get("txtcode1unit").value , 
      default_modifier1:this.inputForm.get("txtcode1Modifier").value,
      default_ndc1: this.inputForm.get("txtcode1NDC").value, 
      description1: this.inputForm.get("txtcode1Desc").value, 
      default_amt1:  this.inputForm.get("txtcode1charge").value, 
      unit2: this.inputForm.get("txtcode2unit").value ,
      default_modifier2:this.inputForm.get("txtcode2Modifier").value,  
      default_ndc2: "", 
      description2: this.inputForm.get("txtcode2Desc").value,
      default_amt2: this.inputForm.get("txtcode2charge").value, 
      deleted: false, 
      created_user: this.lookupList.logedInUser.user_name, 
      modified_user: this.lookupList.logedInUser.user_name,
      client_date_created: "",  
      client_date_modified:  "", 
      date_created: "",
      date_modified:"",
      practice_id:this.lookupList.practiceInfo.practiceId});
     debugger;
      if(this.arrSuperBillCategory.length>0 && (this.inputForm.get("txtcode1Type").value!=''|| this.inputForm.get("txtcode1Type").value!=null) && (this.arrSuperBillCategory[this.superBillCategoryIndex].code1_type=="" || this.arrSuperBillCategory[this.superBillCategoryIndex].code1_type==null ))
      {
        this.arrSuperBillCategory[this.superBillCategoryIndex].code1_type=this.inputForm.get("txtcode1Type").value;
        this.codeType1Update=this.inputForm.get("txtcode1Type").value;
      }
      if(this.arrSuperBillCategory.length>0 && (this.inputForm.get("txtcode2Type").value!=''|| this.inputForm.get("txtcode2Type").value!=null) &&(this.arrSuperBillCategory[this.superBillCategoryIndex].code2_type=="" || this.arrSuperBillCategory[this.superBillCategoryIndex].code2_type==null))
      {
        this.arrSuperBillCategory[this.superBillCategoryIndex].code2_type=this.inputForm.get("txtcode2Type").value;
        this.codeType2Update=this.inputForm.get("txtcode2Type").value;
      }
      

     // this.arrSuperBillCategory[this.superBillCategoryIndex].code1_type=this.inputForm.get("txtcode1Type").value;
    //this.arrSuperBillCategory[this.superBillCategoryIndex].code2_type=this.inputForm.get("txtcode2Type").value;
      this.enableDisableCodeType();

      this.clearFields();
  }
  onDetailCancel(){
    this.superBillCategoryDetailOperation="";
    this.enableDisableField(false);
    this.isDisable=false;
    this.isSaving=false;
  }

  arrDetailSave : Array<ORMSaveSuperBillCategoryDetail>=new Array;
  onSaveDetail(){
     debugger;
     this.isSaving=true;
     this.arrDetailSave=new Array;
    let objsuperbillcatDetail:ORMSaveSuperBillCategoryDetail;
    if (this.superBillCategoryDetailOperation == "new") {
      for (let i = 0; i < this.arrSuperBillCategoryDetail.length; i++) {
        objsuperbillcatDetail = new ORMSaveSuperBillCategoryDetail();

        if(this.arrSuperBillCategoryDetail[i].detail_id=="" || this.arrSuperBillCategoryDetail[i].detail_id==null)
        {
          objsuperbillcatDetail.practice_id = this.arrSuperBillCategoryDetail[i].practice_id;
          objsuperbillcatDetail.category_id = this.arrSuperBillCategoryDetail[i].category_id;
          objsuperbillcatDetail.description = this.arrSuperBillCategoryDetail[i].description;
          objsuperbillcatDetail.code1 = this.arrSuperBillCategoryDetail[i].code1;
          //objsuperbillcatDetail.code_type1 = catDetailData[i].code_type1;
          objsuperbillcatDetail.code2 = this.arrSuperBillCategoryDetail[i].code2;
          //objsuperbillcatDetail.code_type2 = catDetailData[i].code_type2;

          objsuperbillcatDetail.unit1 = this.arrSuperBillCategoryDetail[i].unit1;
          objsuperbillcatDetail.default_modifier1 = this.arrSuperBillCategoryDetail[i].default_modifier1;
          objsuperbillcatDetail.default_ndc1 = this.arrSuperBillCategoryDetail[i].default_ndc1;
          objsuperbillcatDetail.description1 = this.arrSuperBillCategoryDetail[i].description1;
          objsuperbillcatDetail.default_amt1 = this.arrSuperBillCategoryDetail[i].default_amt1;

          objsuperbillcatDetail.unit2 = this.arrSuperBillCategoryDetail[i].unit2;
          objsuperbillcatDetail.default_modifier2 = this.arrSuperBillCategoryDetail[i].default_modifier2;
          //objsuperbillcatDetail.default_ndc2 = catDetailData[i].default_ndc2;
          objsuperbillcatDetail.description2 = this.arrSuperBillCategoryDetail[i].description2;
          objsuperbillcatDetail.default_amt2 = this.arrSuperBillCategoryDetail[i].default_amt2;
          objsuperbillcatDetail.created_user = this.lookupList.logedInUser.user_name;
          objsuperbillcatDetail.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
          objsuperbillcatDetail.modified_user = this.lookupList.logedInUser.user_name;
          objsuperbillcatDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

          // objsuperbillcatDetail.created_user = catDetailData[i].created_user;
          // objsuperbillcatDetail.client_date_created = catDetailData[i].client_date_created;
          // objsuperbillcatDetail.modified_user = GeneralOptions.loginUser;
          // objsuperbillcatDetail.client_date_modified=GeneralOptions.CurrentDateTimeString();
          this.arrDetailSave.push(objsuperbillcatDetail);
        }
      }
    }
    else if(this.superBillCategoryDetailOperation=="edit")
    {
      objsuperbillcatDetail = new ORMSaveSuperBillCategoryDetail();

        objsuperbillcatDetail.detail_id=this.arrSuperBillCategoryDetail[this.superBillDetailIndex].detail_id;
        objsuperbillcatDetail.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        objsuperbillcatDetail.category_id = this.arrSuperBillCategory[this.superBillCategoryIndex].category_id;

        objsuperbillcatDetail.description =this.inputForm.get("txtCatDescription").value;
        objsuperbillcatDetail.code1 =this.inputForm.get("txtcode1").value;
        //objsuperbillcatDetail.code_type1 = catDetailData[i].code_type1;
        objsuperbillcatDetail.code2 =this.inputForm.get("txtcode2").value;
        //objsuperbillcatDetail.code_type2 = catDetailData[i].code_type2;

        objsuperbillcatDetail.unit1 = this.inputForm.get("txtcode1unit").value;
        objsuperbillcatDetail.default_modifier1 = this.inputForm.get("txtcode1Modifier").value;
        objsuperbillcatDetail.default_ndc1 = this.inputForm.get("txtcode1NDC").value;
        objsuperbillcatDetail.description1 = this.inputForm.get("txtcode1Desc").value;
        objsuperbillcatDetail.default_amt1 = this.inputForm.get("txtcode1charge").value;

        objsuperbillcatDetail.unit2 = this.inputForm.get("txtcode2unit").value;
        objsuperbillcatDetail.default_modifier2 = this.inputForm.get("txtcode2Modifier").value;
        //objsuperbillcatDetail.default_ndc2 = catDetailData[i].default_ndc2;
        objsuperbillcatDetail.description2 = this.inputForm.get("txtcode2Desc").value;
        objsuperbillcatDetail.default_amt2 = this.inputForm.get("txtcode2charge").value;
        objsuperbillcatDetail.date_created = this.arrSuperBillCategoryDetail[this.superBillDetailIndex].date_created;
        objsuperbillcatDetail.created_user = this.arrSuperBillCategoryDetail[this.superBillDetailIndex].created_user;
        objsuperbillcatDetail.client_date_created = this.arrSuperBillCategoryDetail[this.superBillDetailIndex].client_date_created;
        objsuperbillcatDetail.modified_user = this.arrSuperBillCategoryDetail[this.superBillDetailIndex].modified_user;
        objsuperbillcatDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

       
        this.arrDetailSave.push(objsuperbillcatDetail);
    }
  if(this.arrDetailSave.length>0)
  {
    this.setupService.saveSuperBillCategoryDetail(this.arrDetailSave).subscribe(
      data => {
        debugger;
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
          modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
          modalRef.componentInstance.promptHeading = 'SuperBill Setting';
          modalRef.componentInstance.promptMessage = "SuperBill setting save successfull.";

          if((this.codeType1Update !="" && this.codeType1Update !=null) || (this.codeType2Update!='' && this.codeType2Update!=null))
          {
            let searchCriteria: SearchCriteria = new SearchCriteria();
            searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
            searchCriteria.param_list = [
            { name: "category_id", value: this.arrSuperBillCategory[this.superBillCategoryIndex].category_id, option: "" },
            { name: "code1Type", value: this.codeType1Update, option: "" },
            { name: "code2Type", value: this.codeType2Update, option: "" }
            ];
            this.setupService.updateCategoryCodeType(searchCriteria).subscribe(

            );
          }

          this.superBillCategoryDetailOperation="";
          this.enableDisableField(false);
          this.isDisable=false;
          this.getSuperBillCategoryDetail(this.arrSuperBillCategory[this.superBillCategoryIndex].category_id);
          this.isSaving=false;
      }},
      error => {
        GeneralOperation.showAlertPopUp(this.modalService,'SuperBill Setting Save Error',error,'danger');
        this.isSaving=false;
      }
    );
  }
  }
}
