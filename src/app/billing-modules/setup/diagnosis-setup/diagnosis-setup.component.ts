import { Component, OnInit, Inject } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GeneralService } from 'src/app/services/general/general.service';
import { PromptResponseEnum, ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMProcedureSetup } from 'src/app/models/setting/ORMProcedureSetup';
import { ORMDiagnosis } from 'src/app/models/setting/ORMDiagnosis';

@Component({
  selector: 'diagnosis-setup',
  templateUrl: './diagnosis-setup.component.html',
  styleUrls: ['./diagnosis-setup.component.css']
})
export class DiagnosisSetupComponent implements OnInit {

  arrPOS;
  arrDiagnosis;
  inputForm:FormGroup;
  searchForm:FormGroup;
  selectedIndex=0;
  operation='';
  isDisable = false;
  constructor(private setupService: SetupService, @Inject(LOOKUP_LIST) public lookupList: LookupList
  , private formBuilder: FormBuilder, private logMessage: LogMessage, private dateTimeUtil: DateTimeUtil,
  private modalService: NgbModal, private generalService: GeneralService) { }

  ngOnInit() {
    this.buildForm();
    this.enableDisable('disable');
  }
  enableDisable(value) {
    if (value == 'disable')
      this.inputForm.disable();
    else
      this.inputForm.enable();
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtCode: this.formBuilder.control(null, Validators.required),
      txtDescription: this.formBuilder.control(null),
      txtExpiredDate: this.formBuilder.control(''),
      drpGender: this.formBuilder.control(null),
      drpAge: this.formBuilder.control(null),
      txtYearsFrom: this.formBuilder.control('0'),  
      txtMonthFrom: this.formBuilder.control('0'),  
      txtYearsTo: this.formBuilder.control('0'),    
      txtMonthTo: this.formBuilder.control('0') 
    });
    this.searchForm= this.formBuilder.group({
      codeSearch: this.formBuilder.control('check_code'),
      txtProcedureSearch: this.formBuilder.control(''),
    });
  }
  clearFields() {
    this.inputForm.reset();
  } 
  onAddNew(){
    this.operation = "new";
    this.clearFields();
    this.enableDisable('enable');
    this.isDisable = true;
  }
  onEdit(){
    this.enableDisable('enable');
    this.inputForm.get("txtCode").disable();
    this.isDisable = true;
    this.operation = "Edit";
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
        deleteRecordData.column_id = this.arrDiagnosis[this.selectedIndex].code;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.setupService.deleteDiagnosis(deleteRecordData)
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
      modalRef.componentInstance.promptHeading = "Diagnosis Setup"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.arrDiagnosis.splice(this.selectedIndex, 1);
      if(this.arrDiagnosis.length>0)
      {
        this.selectedIndex=0;
        this.assignValues();
      }
    }
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  assignValues() {
    debugger;
    (this.inputForm.get("txtCode") as FormControl).setValue(this.arrDiagnosis[this.selectedIndex].code);
    (this.inputForm.get("txtDescription") as FormControl).setValue(this.arrDiagnosis[this.selectedIndex].description);
    (this.inputForm.get("txtExpiredDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrDiagnosis[this.selectedIndex].expiry_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("drpGender") as FormControl).setValue(this.arrDiagnosis[this.selectedIndex].gender);
    let optionArrMin;
    let optionArrMax;

    if(this.arrDiagnosis[this.selectedIndex].age!=null){
      optionArrMin=this.arrDiagnosis[this.selectedIndex].age.toString().split("~");
    }
    if(this.arrDiagnosis[this.selectedIndex].age_max!=null){
      optionArrMax=this.arrDiagnosis[this.selectedIndex].age_max.toString().split("~");
    }

    (this.inputForm.get("drpAge") as FormControl).setValue("");        
    (this.inputForm.get("txtYearsFrom") as FormControl).setValue("");
    (this.inputForm.get("txtMonthFrom") as FormControl).setValue("");
    (this.inputForm.get("txtYearsTo") as FormControl).setValue("");
    (this.inputForm.get("txtMonthTo") as FormControl).setValue("");

    if(optionArrMin.length>1 )//optionArr[1]!=""||optionArr[1]!=null
				{
					if(optionArrMin[0]=="Between"){
            (this.inputForm.get("drpAge") as FormControl).setValue(optionArrMin[0]);
            
            (this.inputForm.get("txtYearsFrom") as FormControl).setValue(optionArrMin[1]);
            (this.inputForm.get("txtMonthFrom") as FormControl).setValue(optionArrMin[2]);

            (this.inputForm.get("txtYearsTo") as FormControl).setValue(optionArrMax[1]);
            (this.inputForm.get("txtMonthTo") as FormControl).setValue(optionArrMax[2]);
					}
					else{
            (this.inputForm.get("drpAge") as FormControl).setValue(optionArrMin[0]);
            (this.inputForm.get("txtYearsFrom") as FormControl).setValue(optionArrMin[1]);
            (this.inputForm.get("txtMonthFrom") as FormControl).setValue(optionArrMin[2]);
					}
        }
  }
  objOrmDiagnosis:ORMDiagnosis;
  onSave(){
    debugger;
    if((this.inputForm.get('txtCode') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Diagnosis code.",'warning')
      return;
    }
    if((this.inputForm.get('txtDescription') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Diagnosis description.",'warning')
      return;
    }
    if((this.inputForm.get('drpAge') as FormControl).value!=null && (this.inputForm.get('drpAge') as FormControl).value!='')
    {
      if((this.inputForm.get('drpAge') as FormControl).value.toString().toLowerCase()=="between")
      {
        if(((this.inputForm.get('txtYearsFrom') as FormControl).value==0 && (this.inputForm.get('txtMonthFrom') as FormControl).value==0) 
        ||  ((this.inputForm.get('txtYearsTo') as FormControl).value==0 && (this.inputForm.get('txtMonthTo') as FormControl).value==0) )
        {
          GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Diagnosis Age Criteria.",'warning')
          return;
        }
      }
      if((this.inputForm.get('drpAge') as FormControl).value.toString().toLowerCase()=="less then")
      {
        if(((this.inputForm.get('txtYearsFrom') as FormControl).value==0 && (this.inputForm.get('txtMonthFrom') as FormControl).value==0))
        {
          GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Diagnosis Age Criteria.",'warning')
          return;
        }
      }
      if((this.inputForm.get('drpAge') as FormControl).value.toString().toLowerCase()=="greater then")
      {
        if(((this.inputForm.get('txtYearsFrom') as FormControl).value==0 && (this.inputForm.get('txtMonthFrom') as FormControl).value==0))
        {
          GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Diagnosis Age Criteria.",'warning')
          return;
        }
      }
  }

    this.objOrmDiagnosis=new ORMDiagnosis();
    this.objOrmDiagnosis.code=(this.inputForm.get('txtCode') as FormControl).value;
    this.objOrmDiagnosis.description=(this.inputForm.get('txtDescription') as FormControl).value;
    if((this.inputForm.get('txtExpiredDate') as FormControl).value==null || (this.inputForm.get('txtExpiredDate') as FormControl).value=='')
    {
      this.objOrmDiagnosis.expiry_date="";
    }
    else
      this.objOrmDiagnosis.expiry_date = this.dateTimeUtil.getStringDateFromDateModel((this.inputForm.get('txtExpiredDate') as FormControl).value);

    this.objOrmDiagnosis.gender=((this.inputForm.get('drpGender') as FormControl).value==null?'':(this.inputForm.get('drpGender') as FormControl).value);
    
    if((this.inputForm.get('drpAge') as FormControl).value!=null && (this.inputForm.get('drpAge') as FormControl).value!=''){
      if((this.inputForm.get('drpAge') as FormControl).value!="Between"){
      if((this.inputForm.get('txtYearsFrom') as FormControl).value>0)
        this.objOrmDiagnosis.age=(this.inputForm.get('drpAge') as FormControl).value+"~"+(this.inputForm.get('txtYearsFrom') as FormControl).value+"~"+(this.inputForm.get('txtMonthFrom') as FormControl).value;
      }
      else{
        if((this.inputForm.get('txtYearsFrom') as FormControl).value>0){
          this.objOrmDiagnosis.age=(this.inputForm.get('drpAge') as FormControl).value+"~"+(this.inputForm.get('txtYearsFrom') as FormControl).value+"~"+(this.inputForm.get('txtYearsFrom') as FormControl).value;
          this.objOrmDiagnosis.age_max=(this.inputForm.get('drpAge') as FormControl).value+"~"+(this.inputForm.get('txtYearsTo') as FormControl).value+"~"+(this.inputForm.get('txtMonthTo') as FormControl).value;
        }
      }
    }
    else{
      this.objOrmDiagnosis.age="";
      this.objOrmDiagnosis.age_max="";
    }

    let condationSign="";
    let totalMonthMin=0; 
    let totalMonthMax=0;

    if((this.inputForm.get('drpAge') as FormControl).value=="Between")
    {
      condationSign="Between";
      totalMonthMin= (Number((this.inputForm.get('txtYearsFrom') as FormControl).value *12) + Number((this.inputForm.get('txtMonthFrom') as FormControl).value));
      totalMonthMax= (Number(((this.inputForm.get('txtYearsTo') as FormControl).value *12)) +Number((this.inputForm.get('txtMonthTo') as FormControl).value));
      this.objOrmDiagnosis.condition=condationSign+"~"+totalMonthMin+"^"+totalMonthMax+"~M";
    }
    if((this.inputForm.get('drpAge') as FormControl).value=="Greater Then"){
      condationSign=">";
      totalMonthMin= (Number(((this.inputForm.get('txtYearsFrom') as FormControl).value*12)) + Number((this.inputForm.get('txtMonthFrom') as FormControl).value));
      this.objOrmDiagnosis.condition=condationSign+"~"+totalMonthMin+"~M";
    }
    if((this.inputForm.get('drpAge') as FormControl).value=="Less Then"){
      condationSign="<";
      totalMonthMin= (Number(((this.inputForm.get('txtYearsFrom') as FormControl).value*12)) + Number((this.inputForm.get('txtMonthFrom') as FormControl).value));
      this.objOrmDiagnosis.condition=condationSign+"~"+totalMonthMin+"~M";
    }						 
    if((this.inputForm.get('drpAge') as FormControl).value==null || (this.inputForm.get('drpAge') as FormControl).value=='')
    {
      this.objOrmDiagnosis.condition="";
    }
    this.objOrmDiagnosis.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
    this.objOrmDiagnosis.modified_user=this.lookupList.logedInUser.user_name;    

    if(this.operation=="new")
    {
      this.objOrmDiagnosis.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      this.objOrmDiagnosis.created_user=this.lookupList.logedInUser.user_name;

      this.setupService.addDiagnosis(this.objOrmDiagnosis).subscribe(
        data=>{
          this.saveSuccess(data);
        },error=>{
          this.saveError(error);
        }
        );
    }
    else{
      this.objOrmDiagnosis.client_date_created=this.arrDiagnosis[this.selectedIndex].client_date_created;
      this.objOrmDiagnosis.created_user=this.arrDiagnosis[this.selectedIndex].created_user;

      this.setupService.updateDiagnosis(this.objOrmDiagnosis).subscribe(
      data=>{
        this.saveSuccess(data);
        },error=>{
          this.saveError(error);
        }
        );
    }
  }
  saveSuccess(data) {
    debugger;
    this.enableDisable('disable');
    this.isDisable = false;
    this.operation = "";
    if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {

      (this.searchForm.get("txtProcedureSearch") as FormControl).setValue((this.inputForm.get('txtCode') as FormControl).value);
      this.searchPrcedure();

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Diagnosis Save';
      modalRef.componentInstance.promptMessage = "Diagnosis save successfully.";
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Diagnosis Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveError(error) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Diagnosis Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Diagnosis."
  }
  onCancel(){
    if (this.arrDiagnosis != undefined && this.arrDiagnosis != null) {
      this.selectedIndex = 0;
      this.assignValues();
    }
    this.enableDisable('disable');
    this.isDisable = false;
    this.operation = "";
  }
  searchCriteria: SearchCriteria;
  onProcedureSearchKeydown(event){
    debugger
    if (event.key === "Enter" && this.searchForm.get("txtProcedureSearch").value.length>0) {
      this.searchPrcedure();
    }
  }
  searchPrcedure(){
    this.searchCriteria=new SearchCriteria();

    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];
    this.searchCriteria.param_list.push( { name: "search_option", value: this.searchForm.get("codeSearch").value, option: ""});
    this.searchCriteria.param_list.push( { name: "search_value", value: this.searchForm.get("txtProcedureSearch").value, option: ""});

    this.setupService.getDiagnosis(this.searchCriteria).subscribe(
      data=>{
        this.arrDiagnosis=data;
        if(this.arrDiagnosis.length>0)
        {
          this.selectedIndex=0;
          this.assignValues();
        }
      },error=>
      {

      }
    );
  }
  onSelectionChange(index,obj){
    debugger;
    this.selectedIndex=index;
    this.assignValues()

  }

}
