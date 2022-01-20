import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORM_HealthMaintenanceDetail } from 'src/app/models/encounter/ORMHealthMaintenanceDetail';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'health-maint-lipid',
  templateUrl: './health-maint-lipid.component.html',
  styleUrls: ['./health-maint-lipid.component.css']
})
export class HealthMaintLipidComponent implements OnInit {

  inputForm: FormGroup;
  @Input() objencounterToOpen:EncounterToOpen;
  @Input() lstTest;
  @Input() objSelectedMain;
  @Input() editOperation;
  @Output() dataUpdated = new EventEmitter<any>();
  listSaveTest: Array<ORM_HealthMaintenanceDetail> = [];
  
  constructor(private encounterService:EncounterService,private modalService: NgbModal,
    private logMessage:LogMessage,    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {
    this.buildForm();
    if(this.editOperation!="New")
    {
      this.assignValues();
    }
  }
  
  buildForm(){
  this.inputForm = this.formBuilder.group({
    txtCholComplDate: this.formBuilder.control("", Validators.required),
    txtCholDueDate: this.formBuilder.control("", Validators.required),
    chkCholRefused: this.formBuilder.control(false, Validators.required),
    txtCholComments:this.formBuilder.control("", Validators.required),

    txtHDLComplDate: this.formBuilder.control("", Validators.required),
    txtHDLDueDate: this.formBuilder.control("", Validators.required),
    chkHDLRefused: this.formBuilder.control(false, Validators.required),
    txtHDLComments:this.formBuilder.control("", Validators.required),

    txtTrigComplDate: this.formBuilder.control("", Validators.required),
    txtTrigDueDate: this.formBuilder.control("", Validators.required),
    chkTrigRefused: this.formBuilder.control(false, Validators.required),
    txtTrigComments:this.formBuilder.control("", Validators.required),

    txtLDLComplDate: this.formBuilder.control("", Validators.required),
    txtLDLDueDate: this.formBuilder.control("", Validators.required),
    chkLDLRefused: this.formBuilder.control(false, Validators.required),
    txtLDLComments:this.formBuilder.control("", Validators.required)

  })
  }
  assignValues()
  {
    debugger;
      for(let i=0;i<this.lstTest.length;i++)
      {
        switch(this.lstTest[i].test_name)
        {
          case "Total Chol":
            (this.inputForm.get("txtCholComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtCholDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkCholRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtCholComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
          case "HDL":
            (this.inputForm.get("txtHDLComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtHDLDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkHDLRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtHDLComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;  
        case "TriG":
          (this.inputForm.get("txtTrigComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtTrigDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("chkTrigRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
          (this.inputForm.get("txtTrigComments") as FormControl).setValue(this.lstTest[i].test_value);
        break;    
      case "LDL":
        (this.inputForm.get("txtLDLComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
        (this.inputForm.get("txtLDLDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
        (this.inputForm.get("chkLDLRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
        (this.inputForm.get("txtLDLComments") as FormControl).setValue(this.lstTest[i].test_value);
      break;     
        }
      }
    }
    onSave(formValue)
    {
      debugger;
      //
      if (formValue.txtCholComplDate != undefined && formValue.txtCholComplDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtCholComplDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Total Chol Complete Date is not in correct formate.", 'warning');
        return;
      }
      if (formValue.txtCholDueDate != undefined && formValue.txtCholDueDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtCholDueDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Total Chol Due Date is not in correct formate.", 'warning');
        return;
      }
      //
      if (formValue.txtHDLComplDate != undefined && formValue.txtHDLComplDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtHDLComplDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "HDL Complete Date is not in correct formate.", 'warning');
        return;
      }
      if (formValue.txtHDLDueDate != undefined && formValue.txtHDLDueDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtHDLDueDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "HDL Due Date is not in correct formate.", 'warning');
        return;
      }
      //
      if (formValue.txtTrigComplDate != undefined && formValue.txtTrigComplDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtTrigComplDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "TriG Complete Date is not in correct formate.", 'warning');
        return;
      }
      if (formValue.txtTrigDueDate != undefined && formValue.txtTrigDueDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtTrigDueDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "TriG Due Date is not in correct formate.", 'warning');
        return;
      }
      //
      if (formValue.txtLDLComplDate != undefined && formValue.txtLDLComplDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtLDLComplDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "LDL Complete Date is not in correct formate.", 'warning');
        return;
      }
      if (formValue.txtLDLDueDate != undefined && formValue.txtLDLDueDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtLDLDueDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "LDL Due Date is not in correct formate.", 'warning');
        return;
      }
      if (this.listSaveTest == undefined)
        this.listSaveTest = new Array();
  
      if (formValue.txtCholComplDate != '' || formValue.txtCholDueDate != '' || formValue.txtCholComments != '' || formValue.chkCholRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'LIPIDS';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'Total Chol';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtCholComplDate==""?undefined:formValue.txtCholComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtCholDueDate==""?undefined:formValue.txtCholDueDate);
        ormSave.test_value = formValue.txtCholComments;
        ormSave.refusal = formValue.chkCholRefused;
  
        if (this.objSelectedMain != null)
          ormSave.phm_id = this.objSelectedMain.phm_id;
  
        if (this.editOperation == "New") {
          ormSave.created_user = this.lookupList.logedInUser.user_name;
          ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        }
        else {
          ormSave.created_user = this.objSelectedMain.created_user;
          ormSave.date_created = this.objSelectedMain.date_created;
          ormSave.client_date_created = this.objSelectedMain.client_date_created;
        }
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Total Chol');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtHDLComplDate != '' || formValue.txtHDLDueDate != '' || formValue.txtHDLComments != '' || formValue.chkHDLRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'LIPIDS';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'HDL';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHDLComplDate==""?undefined:formValue.txtHDLComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHDLDueDate==""?undefined:formValue.txtHDLDueDate);
        ormSave.test_value = formValue.txtHDLComments;
        ormSave.refusal = formValue.chkHDLRefused;
  
        if (this.objSelectedMain != null)
          ormSave.phm_id = this.objSelectedMain.phm_id;
  
        if (this.editOperation == "New") {
          ormSave.created_user = this.lookupList.logedInUser.user_name;
          ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        }
        else {
          ormSave.created_user = this.objSelectedMain.created_user;
          ormSave.date_created = this.objSelectedMain.date_created;
          ormSave.client_date_created = this.objSelectedMain.client_date_created;
        }
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'HDL');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtTrigComplDate != '' || formValue.txtTrigDueDate != '' || formValue.txtTrigComments != '' || formValue.chkTrigRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'LIPIDS';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'HDL';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtTrigComplDate==""?undefined:formValue.txtTrigComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtTrigDueDate==""?undefined:formValue.txtTrigDueDate);
        ormSave.test_value = formValue.txtTrigComments;
        ormSave.refusal = formValue.chkTrigRefused;
  
        if (this.objSelectedMain != null)
          ormSave.phm_id = this.objSelectedMain.phm_id;
  
        if (this.editOperation == "New") {
          ormSave.created_user = this.lookupList.logedInUser.user_name;
          ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        }
        else {
          ormSave.created_user = this.objSelectedMain.created_user;
          ormSave.date_created = this.objSelectedMain.date_created;
          ormSave.client_date_created = this.objSelectedMain.client_date_created;
        }
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'HDL');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtLDLComplDate != '' || formValue.txtLDLDueDate != '' || formValue.txtLDLComments != '' || formValue.chkLDLRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'LIPIDS';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'HDL';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtLDLComplDate==""?undefined:formValue.txtLDLComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtLDLDueDate==""?undefined:formValue.txtLDLDueDate);
        ormSave.test_value = formValue.txtLDLComments;
        ormSave.refusal = formValue.chkLDLRefused;
  
        if (this.objSelectedMain != null)
          ormSave.phm_id = this.objSelectedMain.phm_id;
  
        if (this.editOperation == "New") {
          ormSave.created_user = this.lookupList.logedInUser.user_name;
          ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        }
        else {
          ormSave.created_user = this.objSelectedMain.created_user;
          ormSave.date_created = this.objSelectedMain.date_created;
          ormSave.client_date_created = this.objSelectedMain.client_date_created;
        }
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'HDL');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
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
