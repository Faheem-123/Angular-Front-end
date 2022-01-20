import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORM_HealthMaintenanceDetail } from 'src/app/models/encounter/ORMHealthMaintenanceDetail';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'health-maint-vaccination',
  templateUrl: './health-maint-vaccination.component.html',
  styleUrls: ['./health-maint-vaccination.component.css']
})
export class HealthMaintVaccinationComponent implements OnInit {

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
      txtPPDComplDate: this.formBuilder.control("", Validators.required),
      txtPPDDueDate: this.formBuilder.control("", Validators.required),
      chkPPDRefused: this.formBuilder.control(false, Validators.required),
      txtPPDComments:this.formBuilder.control("", Validators.required),

      txtHEPAComplDate: this.formBuilder.control("", Validators.required),
      txtHEPADueDate: this.formBuilder.control("", Validators.required),
      chkHEPARefused: this.formBuilder.control(false, Validators.required),
      txtHEPAComments:this.formBuilder.control("", Validators.required),

      txtHEPBComplDate: this.formBuilder.control("", Validators.required),
      txtHEPBDueDate: this.formBuilder.control("", Validators.required),
      chkHEPBRefused: this.formBuilder.control(false, Validators.required),
      txtHEPBComments:this.formBuilder.control("", Validators.required),

      txtPnemoComplDate: this.formBuilder.control("", Validators.required),
      txtPnemoDueDate: this.formBuilder.control("", Validators.required),
      chkPnemoRefused: this.formBuilder.control(false, Validators.required),
      txtPnemoComments:this.formBuilder.control("", Validators.required),

      txtTetnusComplDate: this.formBuilder.control("", Validators.required),
      txtTetnusDueDate: this.formBuilder.control("", Validators.required),
      chkTetnusRefused: this.formBuilder.control(false, Validators.required),
      txtTetnusComments:this.formBuilder.control("", Validators.required),

      txtDepoComplDate: this.formBuilder.control("", Validators.required),
      txtDepoDueDate: this.formBuilder.control("", Validators.required),
      chkDepoRefused: this.formBuilder.control(false, Validators.required),
      txtDepoComments:this.formBuilder.control("", Validators.required),

      txtinflComplDate: this.formBuilder.control("", Validators.required),
      txtInflDueDate: this.formBuilder.control("", Validators.required),
      chkInflRefused: this.formBuilder.control(false, Validators.required),
      txtInflComments:this.formBuilder.control("", Validators.required),

      txtPneumoComplDate: this.formBuilder.control("", Validators.required),
      txtPneumoDueDate: this.formBuilder.control("", Validators.required),
      chkPneumoRefused: this.formBuilder.control(false, Validators.required),
      txtPneumoComments:this.formBuilder.control("", Validators.required),

    })
  }
  assignValues()
  {
    debugger;
      for(let i=0;i<this.lstTest.length;i++)
      {
        switch(this.lstTest[i].test_name)
        {
          case "PPD":
            (this.inputForm.get("txtPPDComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtPPDDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkPPDRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtPPDComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
          case "Hep A":
            (this.inputForm.get("txtHEPAComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtHEPADueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkHEPARefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtHEPAComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
          case "Hep B":
            (this.inputForm.get("txtHEPBComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtHEPBDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkHEPBRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtHEPBComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
          case "Pneumonia":
            (this.inputForm.get("txtPnemoComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtPnemoDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkPnemoRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtPnemoComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
          case "Tetnus":
          (this.inputForm.get("txtTetnusComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtTetnusDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("chkTetnusRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
          (this.inputForm.get("txtTetnusComments") as FormControl).setValue(this.lstTest[i].test_value);
        break;
        case "Depo":
          (this.inputForm.get("txtDepoComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtDepoDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("chkDepoRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
          (this.inputForm.get("txtDepoComments") as FormControl).setValue(this.lstTest[i].test_value);
        break;
        case "Influenza":
          (this.inputForm.get("txtinflComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtInflDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("chkInflRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
          (this.inputForm.get("txtInflComments") as FormControl).setValue(this.lstTest[i].test_value);
        break;
        case "Pneumococcal":
          (this.inputForm.get("txtPneumoComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtPneumoDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("chkPneumoRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
          (this.inputForm.get("txtPneumoComments") as FormControl).setValue(this.lstTest[i].test_value);
        break;
        }
      }
    }
    onSave(formValue)
    {
      debugger;
      //
      if (formValue.txtPPDComplDate != undefined && formValue.txtPPDComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtPPDComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PPD Complete Date is not in correct formate.", 'warning');
      return;
      }
      if (formValue.txtPPDDueDate != undefined && formValue.txtPPDDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtPPDDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PPD Due Date is not in correct formate.", 'warning');
      return;
      }
       //
       if (formValue.txtHEPAComplDate != undefined && formValue.txtHEPAComplDate != ''
       && !this.dateTimeUtil.isValidDateTime(formValue.txtHEPAComplDate, DateTimeFormat.DATE_MODEL)) {
       GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Hep A Complete Date is not in correct formate.", 'warning');
       return;
       }
       if (formValue.txtHEPADueDate != undefined && formValue.txtHEPADueDate != ''
       && !this.dateTimeUtil.isValidDateTime(formValue.txtHEPADueDate, DateTimeFormat.DATE_MODEL)) {
       GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Hep A Due Date is not in correct formate.", 'warning');
       return;
       }
        //
        if (formValue.txtHEPBComplDate != undefined && formValue.txtHEPBComplDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtHEPBComplDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Hep B Complete Date is not in correct formate.", 'warning');
        return;
        }
        if (formValue.txtHEPBDueDate != undefined && formValue.txtHEPBDueDate != ''
        && !this.dateTimeUtil.isValidDateTime(formValue.txtHEPBDueDate, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Hep B Due Date is not in correct formate.", 'warning');
        return;
        }
         //
         if (formValue.txtPnemoComplDate != undefined && formValue.txtPnemoComplDate != ''
         && !this.dateTimeUtil.isValidDateTime(formValue.txtPnemoComplDate, DateTimeFormat.DATE_MODEL)) {
         GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Pneumonia Complete Date is not in correct formate.", 'warning');
         return;
         }
         if (formValue.txtPnemoDueDate != undefined && formValue.txtPnemoDueDate != ''
         && !this.dateTimeUtil.isValidDateTime(formValue.txtPnemoDueDate, DateTimeFormat.DATE_MODEL)) {
         GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Pneumonia Due Date is not in correct formate.", 'warning');
         return;
         }
          //
          if (formValue.txtTetnusComplDate != undefined && formValue.txtTetnusComplDate != ''
          && !this.dateTimeUtil.isValidDateTime(formValue.txtTetnusComplDate, DateTimeFormat.DATE_MODEL)) {
          GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Tetnus Complete Date is not in correct formate.", 'warning');
          return;
          }
          if (formValue.txtTetnusDueDate != undefined && formValue.txtTetnusDueDate != ''
          && !this.dateTimeUtil.isValidDateTime(formValue.txtTetnusDueDate, DateTimeFormat.DATE_MODEL)) {
          GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Tetnus Due Date is not in correct formate.", 'warning');
          return;
          }
           //
           if (formValue.txtDepoComplDate != undefined && formValue.txtDepoComplDate != ''
           && !this.dateTimeUtil.isValidDateTime(formValue.txtDepoComplDate, DateTimeFormat.DATE_MODEL)) {
           GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Depo Complete Date is not in correct formate.", 'warning');
           return;
           }
           if (formValue.txtDepoDueDate != undefined && formValue.txtDepoDueDate != ''
           && !this.dateTimeUtil.isValidDateTime(formValue.txtDepoDueDate, DateTimeFormat.DATE_MODEL)) {
           GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Depo Due Date is not in correct formate.", 'warning');
           return;
           }
             //
             if (formValue.txtinflComplDate != undefined && formValue.txtinflComplDate != ''
             && !this.dateTimeUtil.isValidDateTime(formValue.txtinflComplDate, DateTimeFormat.DATE_MODEL)) {
             GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Influenza Complete Date is not in correct formate.", 'warning');
             return;
             }
             if (formValue.txtInflDueDate != undefined && formValue.txtInflDueDate != ''
             && !this.dateTimeUtil.isValidDateTime(formValue.txtInflDueDate, DateTimeFormat.DATE_MODEL)) {
             GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Influenza Due Date is not in correct formate.", 'warning');
             return;
             }
              //
              if (formValue.txtPneumoComplDate != undefined && formValue.txtPneumoComplDate != ''
              && !this.dateTimeUtil.isValidDateTime(formValue.txtPneumoComplDate, DateTimeFormat.DATE_MODEL)) {
              GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Pneumococcal Complete Date is not in correct formate.", 'warning');
              return;
              }
              if (formValue.txtPneumoDueDate != undefined && formValue.txtPneumoDueDate != ''
              && !this.dateTimeUtil.isValidDateTime(formValue.txtPneumoDueDate, DateTimeFormat.DATE_MODEL)) {
              GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Pneumococcal Due Date is not in correct formate.", 'warning');
              return;
              }
      if (this.listSaveTest == undefined)
        this.listSaveTest = new Array();
  
      if (formValue.txtPPDComplDate != '' || formValue.txtPPDDueDate != '' || formValue.txtPPDComments != '' || formValue.chkPPDRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'VACCINATION';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'PPD';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPPDComplDate==""?undefined:formValue.txtPPDComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPPDDueDate==""?undefined:formValue.txtPPDDueDate);
        ormSave.test_value = formValue.txtPPDComments;
        ormSave.refusal = formValue.chkPPDRefused;
  
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
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'PPD');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtHEPAComplDate != '' || formValue.txtHEPADueDate != '' || formValue.txtHEPAComments != '' || formValue.chkHEPARefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'VACCINATION';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'Hep A';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHEPAComplDate==""?undefined:formValue.txtHEPAComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHEPADueDate==""?undefined:formValue.txtHEPADueDate);
        ormSave.test_value = formValue.txtHEPAComments;
        ormSave.refusal = formValue.chkHEPARefused;
  
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
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Hep A');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtHEPBComplDate != '' || formValue.txtHEPBDueDate != '' || formValue.txtHEPBComments != '' || formValue.chkHEPBRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'VACCINATION';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'Hep B';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHEPBComplDate==""?undefined:formValue.txtHEPBComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHEPBDueDate==""?undefined:formValue.txtHEPBDueDate);
        ormSave.test_value = formValue.txtHEPBComments;
        ormSave.refusal = formValue.chkHEPBRefused;
  
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
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Hep B');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtPnemoComplDate != '' || formValue.txtPnemoDueDate != '' || formValue.txtPnemoComments != '' || formValue.chkPnemoRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'VACCINATION';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'Pneumonia';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPnemoComplDate==""?undefined:formValue.txtPnemoComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPnemoDueDate==""?undefined:formValue.txtPnemoDueDate);
        ormSave.test_value = formValue.txtPnemoComments;
        ormSave.refusal = formValue.chkPnemoRefused;
  
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
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Pneumonia');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtTetnusComplDate != '' || formValue.txtTetnusDueDate != '' || formValue.txtTetnusComments != '' || formValue.chkTetnusRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'VACCINATION';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'Tetnus';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtTetnusComplDate==""?undefined:formValue.txtTetnusComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtTetnusDueDate==""?undefined:formValue.txtTetnusDueDate);
        ormSave.test_value = formValue.txtTetnusComments;
        ormSave.refusal = formValue.chkTetnusRefused;
  
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
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Tetnus');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtDepoComplDate != '' || formValue.txtDepoDueDate != '' || formValue.txtDepoComments != '' || formValue.chkDepoRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'VACCINATION';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'Depo';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtDepoComplDate==""?undefined:formValue.txtDepoComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtDepoDueDate==""?undefined:formValue.txtDepoDueDate);
        ormSave.test_value = formValue.txtDepoComments;
        ormSave.refusal = formValue.chkDepoRefused;
  
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
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Depo');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtinflComplDate != '' || formValue.txtInflDueDate != '' || formValue.txtInflComments != '' || formValue.chkInflRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'VACCINATION';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'Influenza';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtinflComplDate==""?undefined:formValue.txtinflComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtInflDueDate==""?undefined:formValue.txtInflDueDate);
        ormSave.test_value = formValue.txtInflComments;
        ormSave.refusal = formValue.chkInflRefused;
  
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
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Influenza');
  
        if (filterTest != null && filterTest.length > 0)
          ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);
      }
      if (formValue.txtPneumoComplDate != '' || formValue.txtPneumoDueDate != '' || formValue.txtPneumoComments != '' || formValue.chkPneumoRefused == true) {
        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
  
        ormSave.test_category = 'VACCINATION';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = 'Pneumococcal';
        ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPneumoComplDate==""?undefined:formValue.txtPneumoComplDate);
        ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPneumoDueDate==""?undefined:formValue.txtPneumoDueDate);
        ormSave.test_value = formValue.txtPneumoComments;
        ormSave.refusal = formValue.chkPneumoRefused;
  
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
  
        let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Pneumococcal');
  
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
