import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORM_HealthMaintenance } from 'src/app/models/encounter/ORMHealthMaintenance';
import { ORM_HealthMaintenanceDetail } from 'src/app/models/encounter/ORMHealthMaintenanceDetail';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';

//import { WrapperObjectSave } from 'src/app/models/general/wrapper-object-save';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'health-maint-commontest',
  templateUrl: './health-maint-commontest.component.html',
  styleUrls: ['./health-maint-commontest.component.css']
})
export class HealthMaintCommontestComponent implements OnInit {
  @Input() objencounterToOpen:EncounterToOpen;
  @Input() lstTest;
  @Input() objSelectedMain;
  @Input() editOperation;
  @Output() dataUpdated = new EventEmitter<any>();
  listSaveTest: Array<ORM_HealthMaintenanceDetail> = [];
  inputForm: FormGroup;
  isLoading=false;
  //saveObjectWrapper: WrapperObjectSave;
  
  constructor(private encounterService:EncounterService,private ngbModal: NgbModal,
    private logMessage:LogMessage,    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {
    debugger;
    this.buildForm();
    if(this.editOperation!="New")
    {
      this.assignValues();
    }
  }
  buildForm(){
    this.inputForm = this.formBuilder.group({
      
      txtCreatComplDate: this.formBuilder.control("", Validators.required),
      txtCreatDueDate: this.formBuilder.control("", Validators.required),
      chkCreatRefused: this.formBuilder.control(false, Validators.required),
      txtCreatComments:this.formBuilder.control("", Validators.required),

      txtAICComplDate: this.formBuilder.control("", Validators.required),
      txtAICDueDate: this.formBuilder.control("", Validators.required),
      ChkAICRefused: this.formBuilder.control(false, Validators.required),
      txtAICComments:this.formBuilder.control("", Validators.required),

      txtEyeComplDate: this.formBuilder.control("", Validators.required),
      txtEyeDueDate: this.formBuilder.control("", Validators.required),
      chkEyeRefused: this.formBuilder.control(false, Validators.required),
      txtEyeComments:this.formBuilder.control("", Validators.required),

      txtLDLComplDate: this.formBuilder.control("", Validators.required),
      txtLdlDueDate: this.formBuilder.control("", Validators.required),
      chkLdlRefused: this.formBuilder.control(false, Validators.required),
      txtLdlComments:this.formBuilder.control("", Validators.required),

      txtPAPComplDate: this.formBuilder.control("", Validators.required),
      txtPAPDueDate: this.formBuilder.control("", Validators.required),
      chkPAPRefused: this.formBuilder.control(false, Validators.required),
      txtPAPComments:this.formBuilder.control("", Validators.required),

      txtMamoComplDate: this.formBuilder.control("", Validators.required),
      txtMamoDueDate: this.formBuilder.control("", Validators.required),
      chkMamoRefused: this.formBuilder.control(false, Validators.required),
      txtMamoComments:this.formBuilder.control("", Validators.required),

      txtColonComplDate: this.formBuilder.control("", Validators.required),
      txtColonDueDate: this.formBuilder.control("", Validators.required),
      chkColonRefused: this.formBuilder.control(false, Validators.required),
      txtColonComments:this.formBuilder.control("", Validators.required),

      txtDexaComplDate: this.formBuilder.control("", Validators.required),
      txtDexaDueDate: this.formBuilder.control("", Validators.required),
      chkDexaRefused: this.formBuilder.control(false, Validators.required),
      txtDexaComments:this.formBuilder.control("", Validators.required)     
    })
  }
   
  assignValues()
  {
    debugger;
      for(let i=0;i<this.lstTest.length;i++)
      {
        switch(this.lstTest[i].test_name)
        {
          case "Creat":
            (this.inputForm.get("txtCreatComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtCreatDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkCreatRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtCreatComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;
          case "AIC":
            (this.inputForm.get("txtAICComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtAICDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("ChkAICRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtAICComments") as FormControl).setValue(this.lstTest[i].test_value);
           break;
          case "Eye":
            (this.inputForm.get("txtEyeComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtEyeDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkEyeRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtEyeComments") as FormControl).setValue(this.lstTest[i].test_value);
           break;
          case "LDL":
            (this.inputForm.get("txtLDLComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtLdlDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkLdlRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtLdlComments") as FormControl).setValue(this.lstTest[i].test_value);
           break;
          case "Pap":
            (this.inputForm.get("txtPAPComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtPAPDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkPAPRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtPAPComments") as FormControl).setValue(this.lstTest[i].test_value);
           break;
          case "Mamo":
            (this.inputForm.get("txtMamoComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtMamoDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkMamoRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtMamoComments") as FormControl).setValue(this.lstTest[i].test_value);
           break;
          case "Colonoscopy":
            (this.inputForm.get("txtColonComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtColonDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkColonRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtColonComments") as FormControl).setValue(this.lstTest[i].test_value);
           break;
          case "Dexa":
            (this.inputForm.get("txtDexaComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtDexaDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkDexaRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtDexaComments") as FormControl).setValue(this.lstTest[i].test_value);
           break;
        }
      }
  }
  onSave(formValue)
  {
    if (formValue.txtCreatComplDate != undefined && formValue.txtCreatComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtCreatComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Create Complete  Date is not in correct formate.",'warning') ;
      return;
    }
    if (formValue.txtCreatDueDate != undefined && formValue.txtCreatDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtCreatDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Create Due Date is not in correct formate.",'warning') ;
      return;
    }
    //--
    if (formValue.txtAICComplDate != undefined && formValue.txtAICComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtAICComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"AIC Complete Date is not in correct formate.",'warning') ;
      return;
    }
    if (formValue.txtAICDueDate != undefined && formValue.txtAICDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtAICDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"AIC Due Date is not in correct formate.",'warning') ;
      return;
    }
    //--
    if (formValue.txtEyeComplDate != undefined && formValue.txtEyeComplDate != ''
    && !this.dateTimeUtil.isValidDateTime(formValue.txtEyeComplDate, DateTimeFormat.DATE_MODEL)) {
    GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Eye Complete Date is not in correct formate.",'warning') ;
    return;
  }
  if (formValue.txtEyeDueDate != undefined && formValue.txtEyeDueDate != ''
    && !this.dateTimeUtil.isValidDateTime(formValue.txtEyeDueDate, DateTimeFormat.DATE_MODEL)) {
    GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Eye Due Date is not in correct formate.",'warning') ;
    return;
  }
  //--
    if (formValue.txtLDLComplDate != undefined && formValue.txtLDLComplDate != ''
    && !this.dateTimeUtil.isValidDateTime(formValue.txtLDLComplDate, DateTimeFormat.DATE_MODEL)) {
    GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"LDL Complete Date is not in correct formate.",'warning') ;
    return;
  }
  if (formValue.txtLdlDueDate != undefined && formValue.txtLdlDueDate != ''
    && !this.dateTimeUtil.isValidDateTime(formValue.txtLdlDueDate, DateTimeFormat.DATE_MODEL)) {
    GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"LDL Due Date is not in correct formate.",'warning') ;
    return;
  }
  //--
  if (formValue.txtPAPComplDate != undefined && formValue.txtPAPComplDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtPAPComplDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"PAP Complete Date is not in correct formate.",'warning') ;
  return;
  }
  if (formValue.txtPAPDueDate != undefined && formValue.txtPAPDueDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtPAPDueDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"PAP Due Date is not in correct formate.",'warning') ;
  return;
  }
  //--
  if (formValue.txtMamoComplDate != undefined && formValue.txtMamoComplDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtMamoComplDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Mamo Complete Date is not in correct formate.",'warning') ;
  return;
  }
  if (formValue.txtMamoDueDate != undefined && formValue.txtMamoDueDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtMamoDueDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Mamo Due Date is not in correct formate.",'warning') ;
  return;
  }
  //--
  if (formValue.txtColonComplDate != undefined && formValue.txtColonComplDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtColonComplDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Colonoscopy Complete Date is not in correct formate.",'warning') ;
  return;
  }
  if (formValue.txtColonDueDate != undefined && formValue.txtColonDueDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtColonDueDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Colonoscopy Due Date is not in correct formate.",'warning') ;
  return;
  }
  //--
  if (formValue.txtDexaComplDate != undefined && formValue.txtDexaComplDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtDexaComplDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Dexa Complete Date is not in correct formate.",'warning') ;
  return;
  }
  if (formValue.txtDexaDueDate != undefined && formValue.txtDexaDueDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtDexaDueDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.ngbModal,'Validation',"Dexa Due Date is not in correct formate.",'warning') ;
  return;
  }

    if (this.listSaveTest == undefined)
            this.listSaveTest = new Array();
debugger;
    if(formValue.txtCreatComplDate!='' || formValue.txtCreatDueDate!='' || formValue.txtCreatComments!='' || formValue.chkCreatRefused==true)
    {
      let ormSave:ORM_HealthMaintenanceDetail =new ORM_HealthMaintenanceDetail;

      ormSave.test_category='COMMON TEST';
      ormSave.modified_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name='Creat';
      ormSave.test_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtCreatComplDate==""?undefined:formValue.txtCreatComplDate);
      ormSave.due_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtCreatDueDate==""?undefined:formValue.txtCreatDueDate);
      ormSave.test_value=formValue.txtCreatComments;
      ormSave.refusal=formValue.chkCreatRefused;
     
      if(this.objSelectedMain!=null)
        ormSave.phm_id=this.objSelectedMain.phm_id;

      if(this.editOperation=="New")
      {
        ormSave.created_user=this.lookupList.logedInUser.user_name;
        ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      }
      else{
        ormSave.created_user=this.objSelectedMain.created_user;
        ormSave.date_created=this.objSelectedMain.date_created;
        ormSave.client_date_created=this.objSelectedMain.client_date_created;
      }
      
      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Creat');

      if(filterTest!=null && filterTest.length>0)
        ormSave.detail_id=filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if(formValue.txtAICComplDate!='' || formValue.txtAICDueDate!='' || formValue.txtAICComments!='' || formValue.ChkAICRefused==true)
    {
      let ormSave:ORM_HealthMaintenanceDetail =new ORM_HealthMaintenanceDetail;

      ormSave.test_category='COMMON TEST';
      ormSave.modified_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();

      if(this.objSelectedMain!=null)
        ormSave.phm_id=this.objSelectedMain.phm_id;

      ormSave.test_name='AIC';
      ormSave.test_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtAICComplDate==""?undefined:formValue.txtAICComplDate);
      ormSave.due_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtAICDueDate==""?undefined:formValue.txtAICDueDate);
      ormSave.test_value=formValue.txtAICComments;
      ormSave.refusal=formValue.ChkAICRefused;

      if(this.editOperation=="New")
      {
        ormSave.created_user=this.lookupList.logedInUser.user_name;
        ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      }
      else{
        ormSave.created_user=this.objSelectedMain.created_user;
        ormSave.date_created=this.objSelectedMain.date_created;
        ormSave.client_date_created=this.objSelectedMain.client_date_created;
      }

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'AIC');

      if(filterTest!=null && filterTest.length>0)
        ormSave.detail_id=filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if(formValue.txtEyeComplDate!='' || formValue.txtEyeDueDate!='' || formValue.txtEyeComments!='' || formValue.chkEyeRefused==true)
    {
      let ormSave:ORM_HealthMaintenanceDetail =new ORM_HealthMaintenanceDetail;

      ormSave.test_category='COMMON TEST';
      ormSave.modified_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();

      if(this.objSelectedMain!=null)
        ormSave.phm_id=this.objSelectedMain.phm_id;

      ormSave.test_name='Eye';
      ormSave.test_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtEyeComplDate==""?undefined:formValue.txtEyeComplDate);
      ormSave.due_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtEyeDueDate==""?undefined:formValue.txtEyeDueDate);
      ormSave.test_value=formValue.txtEyeComments;
      ormSave.refusal=formValue.chkEyeRefused;

      if(this.editOperation=="New")
      {
        ormSave.created_user=this.lookupList.logedInUser.user_name;
        ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      }
      else{
        ormSave.created_user=this.objSelectedMain.created_user;
        ormSave.date_created=this.objSelectedMain.date_created;
        ormSave.client_date_created=this.objSelectedMain.client_date_created;
      }

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Eye');

      if(filterTest!=null && filterTest.length>0)
        ormSave.detail_id=filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if(formValue.txtLDLComplDate!='' || formValue.txtLdlDueDate!='' || formValue.txtLdlComments!='' || formValue.chkLdlRefused==true)
    {
      let ormSave:ORM_HealthMaintenanceDetail =new ORM_HealthMaintenanceDetail;

      ormSave.test_category='COMMON TEST';
      ormSave.modified_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();
      
      if(this.objSelectedMain!=null)
        ormSave.phm_id=this.objSelectedMain.phm_id;

      ormSave.test_name='LDL';
      ormSave.test_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtLDLComplDate==""?undefined:formValue.txtLDLComplDate);
      ormSave.due_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtLdlDueDate==""?undefined:formValue.txtLdlDueDate);
      ormSave.test_value=formValue.txtLdlComments;
      ormSave.refusal=formValue.chkLdlRefused;

      if(this.editOperation=="New")
      {
        ormSave.created_user=this.lookupList.logedInUser.user_name;
        ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      }
      else{
        ormSave.created_user=this.objSelectedMain.created_user;
        ormSave.date_created=this.objSelectedMain.date_created;
        ormSave.client_date_created=this.objSelectedMain.client_date_created;
      }
      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'LDL');

      if(filterTest!=null && filterTest.length>0)
        ormSave.detail_id=filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if(formValue.txtPAPComplDate!='' || formValue.txtPAPDueDate!='' || formValue.txtPAPComments!='' || formValue.chkPAPRefused==true)
    {
      let ormSave:ORM_HealthMaintenanceDetail =new ORM_HealthMaintenanceDetail;

      ormSave.test_category='COMMON TEST';
      ormSave.modified_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();
      
      if(this.objSelectedMain!=null)
        ormSave.phm_id=this.objSelectedMain.phm_id;

      ormSave.test_name='Pap';
      ormSave.test_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPAPComplDate==""?undefined:formValue.txtPAPComplDate);
      ormSave.due_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPAPDueDate==""?undefined:formValue.txtPAPDueDate);
      ormSave.test_value=formValue.txtPAPComments;
      ormSave.refusal=formValue.chkPAPRefused;

      if(this.editOperation=="New")
      {
        ormSave.created_user=this.lookupList.logedInUser.user_name;
        ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      }
      else{
        ormSave.created_user=this.objSelectedMain.created_user;
        ormSave.date_created=this.objSelectedMain.date_created;
        ormSave.client_date_created=this.objSelectedMain.client_date_created;
      }
      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Pap');

      if(filterTest!=null && filterTest.length>0)
        ormSave.detail_id=filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if(formValue.txtMamoComplDate!='' || formValue.txtMamoDueDate!='' || formValue.txtMamoComments!='' || formValue.chkMamoRefused==true)
    {
      let ormSave:ORM_HealthMaintenanceDetail =new ORM_HealthMaintenanceDetail;

      ormSave.test_category='COMMON TEST';
      ormSave.modified_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();
      
      if(this.objSelectedMain!=null)
        ormSave.phm_id=this.objSelectedMain.phm_id;

      ormSave.test_name='Mamo';
      ormSave.test_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtMamoComplDate==""?undefined:formValue.txtMamoComplDate);
      ormSave.due_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtMamoDueDate==""?undefined:formValue.txtMamoDueDate);
      ormSave.test_value=formValue.txtMamoComments;
      ormSave.refusal=formValue.chkMamoRefused;

      if(this.editOperation=="New")
      {
        ormSave.created_user=this.lookupList.logedInUser.user_name;
        ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      }
      else{
        ormSave.created_user=this.objSelectedMain.created_user;
        ormSave.date_created=this.objSelectedMain.date_created;
        ormSave.client_date_created=this.objSelectedMain.client_date_created;
      }
      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Mamo');

      if(filterTest!=null && filterTest.length>0)
        ormSave.detail_id=filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if(formValue.txtColonComplDate!='' || formValue.txtColonDueDate!='' || formValue.txtColonComments!='' || formValue.chkColonRefused==true)
    {
      let ormSave:ORM_HealthMaintenanceDetail =new ORM_HealthMaintenanceDetail;

      ormSave.test_category='COMMON TEST';
      ormSave.modified_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();
      
      if(this.objSelectedMain!=null)
        ormSave.phm_id=this.objSelectedMain.phm_id;

      ormSave.test_name='Colonoscopy';
      ormSave.test_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtColonComplDate==""?undefined:formValue.txtColonComplDate);
      ormSave.due_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtColonDueDate==""?undefined:formValue.txtColonDueDate);
      ormSave.test_value=formValue.txtColonComments;
      ormSave.refusal=formValue.chkColonRefused;

      if(this.editOperation=="New")
      {
        ormSave.created_user=this.lookupList.logedInUser.user_name;
        ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      }
      else{
        ormSave.created_user=this.objSelectedMain.created_user;
        ormSave.date_created=this.objSelectedMain.date_created;
        ormSave.client_date_created=this.objSelectedMain.client_date_created;
      }
      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Colonoscopy');

      if(filterTest!=null && filterTest.length>0)
        ormSave.detail_id=filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if(formValue.txtDexaComplDate!='' || formValue.txtDexaDueDate!='' || formValue.txtDexaComments!='' || formValue.chkDexaRefused==true)
    {
      let ormSave:ORM_HealthMaintenanceDetail =new ORM_HealthMaintenanceDetail;

      ormSave.test_category='COMMON TEST';
      ormSave.modified_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();

      if(this.objSelectedMain!=null)
        ormSave.phm_id=this.objSelectedMain.phm_id;

      ormSave.test_name='Dexa';
      ormSave.test_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtDexaComplDate==""?undefined:formValue.txtDexaComplDate);
      ormSave.due_date=this.dateTimeUtil.getStringDateFromDateModel(formValue.txtDexaDueDate==""?undefined:formValue.txtDexaDueDate);
      ormSave.test_value=formValue.txtDexaComments;
      ormSave.refusal=formValue.chkDexaRefused;

      if(this.editOperation=="New")
      {
        ormSave.created_user=this.lookupList.logedInUser.user_name;
        ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      }
      else{
        ormSave.phm_id=this.objSelectedMain.phm_id;
        ormSave.created_user=this.objSelectedMain.created_user;
        ormSave.date_created=this.objSelectedMain.date_created;
        ormSave.client_date_created=this.objSelectedMain.client_date_created;
      }
      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Dexa');

      if(filterTest!=null && filterTest.length>0)
        ormSave.detail_id=filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if(this.listSaveTest.length>0)
      this.onSendSaveCall();
  
  }
  onSendSaveCall()
  {
    debugger;
    if(this.editOperation=="New")
    {      
    }
    else{

    }
    this.encounterService.saveHealthMaintDetail(this.listSaveTest).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.dataUpdated.emit();
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {

          
        }
      },
      error => {
        //this.showError("An error occured while saving Chart Assessments.");
      }
    );
  }

}
