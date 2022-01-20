import { Component, OnInit, Inject } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMSaveSetupLabCategory } from 'src/app/models/setting/ORMSaveSetupLabCategory';
import { ORMSaveSetupSubLabCategory } from 'src/app/models/setting/ORMSaveSetupSubLabCategory';
import { ORMSaveSetupLabCategoryDetail } from 'src/app/models/setting/ORMSaveSetupLabCategoryDetail';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'lab-category-setup',
  templateUrl: './lab-category-setup.component.html',
  styleUrls: ['./lab-category-setup.component.css']
})
export class LabCategorySetupComponent implements OnInit {

frmNewCategory:FormGroup;
frmNewSubCategory:FormGroup;
inputForm:FormGroup;

arrLabCategory;
arrSubLabCategory;
arrLabCategoryDetail;

labCategoryIndex=0;
labSubCategoryIndex=0;
labDetailCategoryIndex=0;

showCategory=false;
showSubCategory=false;

categoryOperation="";
subCategoryOperation="";
detailCategoryOperation="";

isDisable=false;

  constructor(private setupService: SetupService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  ,private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil, private modalService: NgbModal,
  private generalOperation:GeneralOperation) { 

  }

  ngOnInit() {
    this. buildForm() ;
    this.getLabCategory();
  }
  buildForm() {
    this.frmNewCategory = this.formBuilder.group({
      txtCategoryName: this.formBuilder.control(null, Validators.required),
    })
    this.frmNewSubCategory = this.formBuilder.group({
      txtSubCategoryName: this.formBuilder.control(null, Validators.required),
    })
    this.inputForm = this.formBuilder.group({
      txtcodeSearch: this.formBuilder.control(null, Validators.required),
      txtCode: this.formBuilder.control(null, Validators.required),
      txtDesc: this.formBuilder.control(null, Validators.required),
      txtLabCode: this.formBuilder.control(null, Validators.required),
      txtLabDesc: this.formBuilder.control(null, Validators.required),
      txtCharge: this.formBuilder.control(null, Validators.required),
      txtUnit: this.formBuilder.control(null, Validators.required),
      txtModifier: this.formBuilder.control(null, Validators.required),
      txtNDC: this.formBuilder.control(null, Validators.required),
      txtInstruction: this.formBuilder.control(null, Validators.required),
      txtPosition: this.formBuilder.control(null, Validators.required),
      rbCodeType: this.formBuilder.control("cpt", Validators.required),
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
getLabCategory() {
    this.setupService.getSetupLabCategory(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
        data => {
            this.arrLabCategory = data as Array<any>;
            if(this.arrLabCategory!=undefined && this.arrLabCategory!=null)
            {
              this.labCategoryIndex=0;
              this.onLabCategorySelectionChange(0,null);
              this.getSubLabCategory(this.arrLabCategory[0].category_id)
            }
        },
        error => {
        }
    );
}
getSubLabCategory(category_id) {
  this.setupService.getSetupSubLabCategory(category_id).subscribe(
      data => {
          this.arrSubLabCategory = data as Array<any>;
          if(this.arrSubLabCategory!=undefined && this.arrSubLabCategory!=null && this.arrSubLabCategory.length>0)
          {
            debugger;
            this.labSubCategoryIndex=0;
            this.getSetupLabCategoryDetail(this.arrSubLabCategory[0].sub_category_id)
          }
      },
      error => {
      }
  );
}
getSetupLabCategoryDetail(category_id) {
  this.setupService.getSetupLabCategoryDetail(category_id).subscribe(
      data => {
          this.arrLabCategoryDetail = data as Array<any>;
          if(this.arrLabCategoryDetail!=undefined && this.arrLabCategoryDetail!=null)
          {
            this.labDetailCategoryIndex=0;
            if(this.arrLabCategoryDetail.length>0)
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
  (this.inputForm.get("txtCode") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].proc_code);
  (this.inputForm.get("txtDesc") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].proc_description);
  (this.inputForm.get("txtLabCode") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].lab_assigned_cpt);
  (this.inputForm.get("txtLabDesc") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].lab_assigned_desc);
  
  (this.inputForm.get("txtCharge") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].amount);
  (this.inputForm.get("txtUnit") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].units);
  (this.inputForm.get("txtModifier") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].modifier);
  (this.inputForm.get("txtNDC") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].ndc);
  (this.inputForm.get("txtInstruction") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].test_instructions);
  (this.inputForm.get("txtPosition") as FormControl).setValue(this.arrLabCategoryDetail[this.labDetailCategoryIndex].position);

  this.strlabcode=this.arrLabCategoryDetail[this.labDetailCategoryIndex].lab_assigned_cpt;
  this.strlabdesc=this.arrLabCategoryDetail[this.labDetailCategoryIndex].lab_assigned_desc;

}
clearFields(){
  (this.inputForm.get("txtcodeSearch") as FormControl).setValue("");
  (this.inputForm.get("txtCode") as FormControl).setValue("");
  (this.inputForm.get("txtDesc") as FormControl).setValue("");
  (this.inputForm.get("txtLabCode") as FormControl).setValue("");
  (this.inputForm.get("txtLabDesc") as FormControl).setValue("");
  (this.inputForm.get("txtCharge") as FormControl).setValue("");
  (this.inputForm.get("txtUnit") as FormControl).setValue("");
  (this.inputForm.get("txtModifier") as FormControl).setValue("");
  (this.inputForm.get("txtNDC") as FormControl).setValue("");
  (this.inputForm.get("txtInstruction") as FormControl).setValue("");
  (this.inputForm.get("txtPosition") as FormControl).setValue("");
  this.strlabcode="";
  this.strlabdesc="";
}
showLabRadio=false;
onLabCategorySelectionChange(index,obj)
{
  this.labCategoryIndex=index;
  this.getSubLabCategory(this.arrLabCategory[this.labCategoryIndex].category_id);
  //false test search lab radio
  if(this.arrLabCategory[this.labCategoryIndex].external_lab_id==null ||
    this.arrLabCategory[this.labCategoryIndex].external_lab_id=="" || this.arrLabCategory[this.labCategoryIndex].external_lab_id=="0")
  {
    this.showLabRadio=false;
  }
  else{
    this.showLabRadio=true;
  }
  
}
onSubCategorySelectionChange(index,obj)
{
  this.labSubCategoryIndex=index;
  this.getSetupLabCategoryDetail(this.arrSubLabCategory[this.labSubCategoryIndex].sub_category_id);
}
onLabCategoryDetailSelectionChange(index,obj)
{
  this.labDetailCategoryIndex=index;
  this.assignValues();
}
onAddLabCategory(){
  this.showCategory=true;
  this.categoryOperation="new";
  (this.frmNewCategory.get("txtCategoryName") as FormControl).setValue("");
  this.isDisable=true;
}

objCategory:ORMSaveSetupLabCategory;
onSaveLabCategory(){
  debugger;
  this.objCategory=new ORMSaveSetupLabCategory();

  this.objCategory.category_name=this.frmNewCategory.get("txtCategoryName").value;
  this.objCategory.practice_id=this.lookupList.practiceInfo.practiceId.toString();
  this.objCategory.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();

  if(this.categoryOperation=="new")
  {
    this.objCategory.category_id="";
    this.objCategory.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
    this.objCategory.created_user=this.lookupList.logedInUser.user_name;
  }
  else{
    this.objCategory.client_date_created=this.arrLabCategory[this.labCategoryIndex].client_date_created;
    this.objCategory.date_created=this.arrLabCategory[this.labCategoryIndex].date_created;
    this.objCategory.created_user=this.arrLabCategory[this.labCategoryIndex].created_user;
    this.objCategory.category_id=this.arrLabCategory[this.labCategoryIndex].category_id;
    this.objCategory.external_lab_id=this.arrLabCategory[this.labCategoryIndex].external_lab_id;
  }
  this.objCategory.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
  this.objCategory.modified_user=this.lookupList.logedInUser.user_name;

  this.setupService.saveSetupLabCategory(this.objCategory).subscribe(
    data => {
      if(this.categoryOperation=="new")
      {
        this.objCategory.category_id=data['result'];
        this.arrLabCategory.push(this.objCategory);
        this.labCategoryIndex=this.arrLabCategory.length;
      }
      else{
        this.arrLabCategory[this.labCategoryIndex].category_name =this.frmNewCategory.get("txtCategoryName").value;
      }
      this.showCategory=false;
      this.categoryOperation="";
      this.isDisable=false;
    },
    error => {
    }
  );
}
onCancelLabCategory(){
  this.showCategory=false;
  this.categoryOperation="";
  this.isDisable=false;
}
onEditCategory(obj)
{
  debugger;
  this.showCategory=true;
  this.categoryOperation="edit";
  (this.frmNewCategory.get("txtCategoryName") as FormControl).setValue(obj.category_name);
  this.isDisable=true;
}
onDeleteCategory(obj)
{
  if(this.arrLabCategory[this.labCategoryIndex].external_lab_id!=null &&
    this.arrLabCategory[this.labCategoryIndex].external_lab_id!="" &&
    this.arrLabCategory[this.labCategoryIndex].external_lab_id!="0")
    {
      GeneralOperation.showAlertPopUp(this.modalService, 'Confirm Deletion', "Mapped Category with Lab Interface, Can't be Deleted.", AlertTypeEnum.WARNING)
      //this.onShowValidationPopUp('Patient Order Validation','Please Select Lab','warning');
      return;
    }
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

      this.setupService.deleteSetupLabCategory(deleteRecordData)
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
    this.arrLabCategory.splice(this.labCategoryIndex,1);

  }
}
poupUpOptions: NgbModalOptions = {
  backdrop: 'static',
  keyboard: false
};
onAddSubCategory()
{
  this.showSubCategory=true;
  this.subCategoryOperation="new";
  (this.frmNewSubCategory.get("txtSubCategoryName") as FormControl).setValue("");  
  this.isDisable=true;   
}
objSaveSubCategory:ORMSaveSetupSubLabCategory;
onSaveSubCategory(){
  this.objSaveSubCategory=new ORMSaveSetupSubLabCategory;

  this.objSaveSubCategory.category_id=this.arrLabCategory[this.labCategoryIndex].category_id;
  this.objSaveSubCategory.sub_category_name=this.frmNewSubCategory.get("txtSubCategoryName").value;
  
  this.objSaveSubCategory.practice_id=this.lookupList.practiceInfo.practiceId.toString();
  this.objSaveSubCategory.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();

  if(this.subCategoryOperation=="new")
  {
    this.objSaveSubCategory.sub_category_id="";
    this.objSaveSubCategory.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
    this.objSaveSubCategory.created_user=this.lookupList.logedInUser.user_name;
  }
  else{
    this.objSaveSubCategory.client_date_created=this.arrSubLabCategory[this.labSubCategoryIndex].client_date_created;
    this.objSaveSubCategory.date_created=this.arrSubLabCategory[this.labSubCategoryIndex].date_created;
    this.objSaveSubCategory.created_user=this.arrSubLabCategory[this.labSubCategoryIndex].created_user;
    this.objSaveSubCategory.sub_category_id=this.arrSubLabCategory[this.labSubCategoryIndex].category_id;
  }
  this.objSaveSubCategory.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
  this.objSaveSubCategory.modified_user=this.lookupList.logedInUser.user_name;

  this.setupService.saveSetupSubLabCategory(this.objSaveSubCategory).subscribe(
    data => {
      if(this.subCategoryOperation=="new")
      {
        this.objSaveSubCategory.sub_category_id=data['result'];
        this.arrSubLabCategory.push(this.objSaveSubCategory);
        this.labSubCategoryIndex=this.arrSubLabCategory.length;
      }
      else{
        this.arrSubLabCategory[this.labSubCategoryIndex].sub_category_name =this.frmNewSubCategory.get("txtSubCategoryName").value;
      }
      this.showSubCategory=false;
      this.subCategoryOperation="";
      this.isDisable=false;
    },
    error => {
    }
  );
}
onCancelSubCategory(){
  this.showSubCategory=false;
  this.subCategoryOperation="";
  this.isDisable=false;
}
onEditSubCatgeory(obj)
{
  this.showSubCategory=true;
  this.subCategoryOperation="edit";
  (this.frmNewSubCategory.get("txtSubCategoryName") as FormControl).setValue(obj.sub_category_name);
  this.isDisable=true;
}
onDeleteSubCategory(obj)
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
      deleteRecordData.column_id = obj.sub_category_id;
      deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
      deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
      deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

      this.setupService.deleteSetupLabCategorysub(deleteRecordData)
        .subscribe(
          data => this.onDeleteSubCaetgorySuccessfully(data),
          error => alert(error),
        );
    }
  }, (reason) => {
  });
}
onDeleteSubCaetgorySuccessfully(data)
{
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
    this.arrSubLabCategory.splice(this.labSubCategoryIndex,1);

  }
}
onAddNewDetail()
{
  this.detailCategoryOperation="new";
  this.clearFields();
  this.enableDisableField(true);
  this.isDisable=true;
}
onEditDetail(obj)
{
  this.detailCategoryOperation="edit";
  this.enableDisableField(true);
  this.isDisable=true;
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

      this.setupService.deleteSetupLabCategoryDetail(deleteRecordData)
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
    this.arrLabCategoryDetail.splice(this.labDetailCategoryIndex,1);

  }
}
onAddToList(){
  this.arrLabCategoryDetail.push({ 
    detail_id: "", 
    sub_category_id: this.arrSubLabCategory[this.labSubCategoryIndex].sub_category_id, 
    proc_code:this.inputForm.get("txtCode").value,
    proc_description:this.inputForm.get("txtDesc").value,
    units:this.inputForm.get("txtUnit").value,
    test_instructions:this.inputForm.get("txtInstruction").value,
    lab_assigned_cpt:this.strlabcode,
    lab_assigned_desc:this.strlabdesc,
    amount:this.inputForm.get("txtCharge").value,
    modifier:this.inputForm.get("txtModifier").value,
    ndc:this.inputForm.get("txtNDC").value,
    position:this.inputForm.get("txtPosition").value,
    system_ip:this.lookupList.logedInUser.systemIp,
    deleted: false, 
    created_user: this.lookupList.logedInUser.user_name, 
    modified_user: this.lookupList.logedInUser.user_name,
    client_date_created: "",  
    client_date_modified:  "", 
    date_created: "",
    date_modified:"",
    practice_id:this.lookupList.practiceInfo.practiceId});
    this.clearFields();
}
onDetailCancel(){
  this.detailCategoryOperation="";
  this.enableDisableField(false);
  this.isDisable=false;
}
arrDetailSave : Array<ORMSaveSetupLabCategoryDetail>=new Array;
onSaveDetail(){
  debugger;
  this.arrDetailSave = new Array;
  let objlabCategoryDetail: ORMSaveSetupLabCategoryDetail;
  if (this.detailCategoryOperation == "new") {
    for (let i = 0; i < this.arrLabCategoryDetail.length; i++) 
    {
      if(this.arrLabCategoryDetail[i].detail_id==null || this.arrLabCategoryDetail[i].detail_id=="")
      {
        objlabCategoryDetail = new ORMSaveSetupLabCategoryDetail();

        objlabCategoryDetail.practice_id = this.arrLabCategoryDetail[i].practice_id;
        objlabCategoryDetail.sub_category_id = this.arrLabCategoryDetail[i].sub_category_id;
        objlabCategoryDetail.proc_code = this.arrLabCategoryDetail[i].proc_code;
        objlabCategoryDetail.proc_description = this.arrLabCategoryDetail[i].proc_description;
        objlabCategoryDetail.units = this.arrLabCategoryDetail[i].units;
        objlabCategoryDetail.test_instructions = this.arrLabCategoryDetail[i].test_instructions;
        objlabCategoryDetail.amount = this.arrLabCategoryDetail[i].amount;
        objlabCategoryDetail.ndc = this.arrLabCategoryDetail[i].ndc;
        objlabCategoryDetail.position = this.arrLabCategoryDetail[i].position;
        objlabCategoryDetail.system_ip = this.arrLabCategoryDetail[i].system_ip;
        if (this.arrLabCategoryDetail[i].lab_assigned_cpt == "") {
          objlabCategoryDetail.lab_assigned_cpt = null;
          objlabCategoryDetail.lab_assigned_desc = null;
        }
        else {
          objlabCategoryDetail.lab_assigned_cpt = this.arrLabCategoryDetail[i].lab_assigned_cpt;
          objlabCategoryDetail.lab_assigned_desc = this.arrLabCategoryDetail[i].lab_assigned_desc;
        }
        objlabCategoryDetail.created_user = this.arrLabCategoryDetail[i].created_user;
        objlabCategoryDetail.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        objlabCategoryDetail.modified_user = this.arrLabCategoryDetail[i].modified_user;
        objlabCategoryDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        this.arrDetailSave.push(objlabCategoryDetail);
    }
    }
  }
  else if (this.detailCategoryOperation == "edit") {
    objlabCategoryDetail = new ORMSaveSetupLabCategoryDetail();
    objlabCategoryDetail.detail_id=this.arrLabCategoryDetail[this.labDetailCategoryIndex].detail_id;
    objlabCategoryDetail.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    objlabCategoryDetail.sub_category_id = this.arrSubLabCategory[this.labSubCategoryIndex].sub_category_id;
    objlabCategoryDetail.proc_code = this.inputForm.get("txtCode").value;
    objlabCategoryDetail.proc_description = this.inputForm.get("txtDesc").value;
    objlabCategoryDetail.units = this.inputForm.get("txtUnit").value;
    objlabCategoryDetail.test_instructions = this.inputForm.get("txtInstruction").value;
    objlabCategoryDetail.amount = this.inputForm.get("txtCharge").value;
    objlabCategoryDetail.ndc = this.inputForm.get("txtNDC").value;
    objlabCategoryDetail.position = this.inputForm.get("txtPosition").value;
    objlabCategoryDetail.system_ip = this.lookupList.logedInUser.systemIp;
    if (this.strlabcode == "" || this.strlabcode == null) {
      objlabCategoryDetail.lab_assigned_cpt = null;
      objlabCategoryDetail.lab_assigned_desc = null;
    }
    else {
      objlabCategoryDetail.lab_assigned_cpt = this.strlabcode;
      objlabCategoryDetail.lab_assigned_desc = this.strlabdesc;
    }
    objlabCategoryDetail.created_user = this.arrLabCategoryDetail[this.labDetailCategoryIndex].created_user;
    objlabCategoryDetail.client_date_created = this.arrLabCategoryDetail[this.labDetailCategoryIndex].client_date_created;
    objlabCategoryDetail.date_created = this.arrLabCategoryDetail[this.labDetailCategoryIndex].date_created;
    objlabCategoryDetail.modified_user = this.lookupList.logedInUser.user_name;
    objlabCategoryDetail.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    this.arrDetailSave.push(objlabCategoryDetail);
  }

  if(this.arrDetailSave.length>0)
  {
    this.setupService.saveSetupLabCategoryDetail(this.arrDetailSave).subscribe(
      data => {
        debugger;
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
          modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
          modalRef.componentInstance.promptHeading = 'LabCategory';
          modalRef.componentInstance.promptMessage = "LabCategory Detail save successfully.";
          this.getSetupLabCategoryDetail(this.arrSubLabCategory[this.labSubCategoryIndex].sub_category_id)
          this.detailCategoryOperation="";
          this.enableDisableField(false);
          this.isDisable=false;
      }},
      error => {
      }
    );
  }
}
codeType="";
onCodeTypeChange(event) {
  this.codeType = event;
}
showProcSearch=false;
showLabSearch=false;
onCodeSearchKeydown(value)
{
  debugger;
  this.strlabcode="";
  this.strlabdesc="";
  if(value.length>2)
  {
    if(this.arrLabCategory[this.labCategoryIndex].external_lab_id==null ||
      this.arrLabCategory[this.labCategoryIndex].external_lab_id=="" || this.arrLabCategory[this.labCategoryIndex].external_lab_id=="0")
    {
      this.sentProcCriteriatoSearch(value);
    }
    else{
      this.sentLabCriteriatoSearch(value);
    }
  }
  else 
  {
    this.showProcSearch=false;
    this.showLabSearch=false;
  }
}
testSearchCriteria: SearchCriteria;
sentProcCriteriatoSearch(value)
  {
    debugger;
    this.testSearchCriteria = new SearchCriteria();

    if(this.inputForm.get("rbCodeType").value=="cpt")
    {
      this.testSearchCriteria.option ='CPT';
      this.testSearchCriteria.param_list= [
        { name: "search_criteria", value: value, option: "" },
        { name: "dos", value: '', option: "" },   
        { name: "provider_id", value: '', option: "" }
  
      ];
    }
    else if(this.inputForm.get("rbCodeType").value=="lab")
    {
      this.testSearchCriteria.option ='LAB';
    }
    
    this.showProcSearch=true; 
  }
  sentLabCriteriatoSearch(value)
  {
    this.testSearchCriteria = new SearchCriteria();
    this.testSearchCriteria.criteria=this.arrLabCategory[this.labCategoryIndex].external_lab_id;
    if(this.inputForm.get("rbCodeType").value=="cpt")
    {
      this.testSearchCriteria.option ='CPT';
    }
    else if(this.inputForm.get("rbCodeType").value=="lab")
    {
      this.testSearchCriteria.option ='LAB';
    }
      this.testSearchCriteria.param_list= [
        { name: "search_criteria", value: value, option: "" },
      ];
      this.showLabSearch=true; 
  }
  closeTestSearch()
  {
    this.showProcSearch = false;
  }
  closeLabTestSearch()
  {
    this.showLabSearch = false;
  }
  strlabcode="";
  strlabdesc="";
  onLabTestSelect(value)
  {

      (this.inputForm.get("txtCode") as FormControl).setValue(value.proc_code);
      (this.inputForm.get("txtDesc") as FormControl).setValue(value.lab_description); 
      (this.inputForm.get("txtLabCode") as FormControl).setValue(value.lab_code);
      (this.inputForm.get("txtLabDesc") as FormControl).setValue(value.lab_description); 

      this.strlabcode=value.lab_code;
      this.strlabdesc=value.lab_description;
    
      this.showLabSearch = false;
  }
  onTestSelect(value) {
    debugger;
    let test_type='';
    // if(this.inputTestForm.get("rdbTestSearchType").value=="search_cpt")
    // {
    //   test_type ='CPT';
    // }
    // else if(this.inputTestForm.get("rdbTestSearchType").value=="search_lab")
    // {
    //   test_type ='LAB';
    // }
    // else if(this.inputTestForm.get("rdbTestSearchType").value=="search_loinc")
    // {
    //   test_type ='LOINC';
    // }
    // else if(this.inputTestForm.get("rdbTestSearchType").value=="search_snomed")
    // {
    //   test_type ='SNOMED';
    // } 
    //this.logMessage.log(value);

      (this.inputForm.get("txtCode") as FormControl).setValue(value.code);
      (this.inputForm.get("txtDesc") as FormControl).setValue(value.description);  
      this.showProcSearch = false;
  }
 
}
