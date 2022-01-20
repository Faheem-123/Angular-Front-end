import { Component, OnInit, Input, EventEmitter, Output, Inject } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORM_HealthMaintenanceDetail } from 'src/app/models/encounter/ORMHealthMaintenanceDetail';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'health-maint-othertest',
  templateUrl: './health-maint-othertest.component.html',
  styleUrls: ['./health-maint-othertest.component.css']
})
export class HealthMaintOthertestComponent implements OnInit {

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
  assignValues()
  {
    debugger;
      for(let i=0;i<this.lstTest.length;i++)
      {
        switch(this.lstTest[i].test_name)
        {
          case "FS":
            (this.inputForm.get("txtFSComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtFSDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkFsRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtFsComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;
          case "FOBT":
            (this.inputForm.get("txtFOBTCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtFOBTDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkFOBTRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtFOBTComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;
          case "FBS":
            (this.inputForm.get("txtFBSCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtFBSDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkFBSRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtFBSComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "GTT":
            (this.inputForm.get("txtGTTCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtGTTDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkGTTRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtGTTComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "BRE":
            (this.inputForm.get("txtBRECompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtBREDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkBRERefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtBREComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "Sonogram":
            (this.inputForm.get("txtSonogramCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtSonogramDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkSonogramRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtSonogramComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "HIV-1":
            (this.inputForm.get("txtHIV1CompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtHIV1DueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkHIV1Refused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtHIV1Comments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "HIV-2":
            (this.inputForm.get("txtHIV2CompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtHIV2DueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkHIV2Refused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtHIV2Comments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "Lead Lvl":
            (this.inputForm.get("txtleadlvlCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtleadlvlDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkleadlvlRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtleadlvlComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "PFT":
            (this.inputForm.get("txtPFTCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtPFTDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkPFTRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtPFTComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "H/H":
            (this.inputForm.get("txtHHCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtHHDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkHHRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtHHComments") as FormControl).setValue(this.lstTest[i].test_value);
            break; 
          case "PSA":
            (this.inputForm.get("txtPSACompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtPSADueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkPSARefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtPSAComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "ABI":
            (this.inputForm.get("txtABICompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtABIDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkABIRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtABIComments") as FormControl).setValue(this.lstTest[i].test_value);
            break; 
          case "STRESS":
          (this.inputForm.get("txtStressCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtStressDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkStressRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtStressComments") as FormControl).setValue(this.lstTest[i].test_value);
          
            break; 
          case "Podiatry":
            (this.inputForm.get("txtPodCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtPodDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkPodRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtPodComments") as FormControl).setValue(this.lstTest[i].test_value);
            break;  
          case "EGD":
            (this.inputForm.get("txtEGDCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtEGDDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkEGDRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtEGDComments") as FormControl).setValue(this.lstTest[i].test_value);
            break; 
          case "TSH":
            (this.inputForm.get("txtTSHCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtTSHDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkTSHRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtTSHComments") as FormControl).setValue(this.lstTest[i].test_value);
            break; 
          case "Echo":
            (this.inputForm.get("txtEchoCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtEchoDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkEchoRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtEchoComments") as FormControl).setValue(this.lstTest[i].test_value);          
            break; 
          case "DRE":
            (this.inputForm.get("txtDreCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtDreDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkDreRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtDreComments") as FormControl).setValue(this.lstTest[i].test_value);  
            break; 
          case "Vit-D":
          (this.inputForm.get("txtVitDCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtVitDDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkVitDRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtVitDComments") as FormControl).setValue(this.lstTest[i].test_value);
            break; 
          case "PT/INR":
            (this.inputForm.get("txtPTINRCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtPTINRDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkPTINRRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtPTINRComments") as FormControl).setValue(this.lstTest[i].test_value);          
            break; 
          case "H Pylori":
            (this.inputForm.get("txtHPlyloriCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtHPlyloriDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkHPlyloriRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtHPlyloriComments") as FormControl).setValue(this.lstTest[i].test_value);          
            break; 
          case "Urine Micro":
            (this.inputForm.get("txtUrineCompDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("txtUrineDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
            (this.inputForm.get("chkUrineRefused") as FormControl).setValue(this.lstTest[i].refusal=='1'?true:false);
            (this.inputForm.get("txtUrineComments") as FormControl).setValue(this.lstTest[i].test_value);
            break; 
        }
      }
    }
    
  buildForm(){
    this.inputForm = this.formBuilder.group({
      
      txtFSComplDate: this.formBuilder.control("", Validators.required),
      txtFSDueDate: this.formBuilder.control("", Validators.required),
      chkFsRefused: this.formBuilder.control(false, Validators.required),
      txtFsComments:this.formBuilder.control("", Validators.required),

      txtFOBTCompDate: this.formBuilder.control("", Validators.required),
      txtFOBTDueDate: this.formBuilder.control("", Validators.required),
      chkFOBTRefused: this.formBuilder.control(false, Validators.required),
      txtFOBTComments:this.formBuilder.control("", Validators.required),

      txtFBSCompDate: this.formBuilder.control("", Validators.required),
      txtFBSDueDate: this.formBuilder.control("", Validators.required),
      chkFBSRefused: this.formBuilder.control(false, Validators.required),
      txtFBSComments:this.formBuilder.control("", Validators.required),

      txtGTTCompDate: this.formBuilder.control("", Validators.required),
      txtGTTDueDate: this.formBuilder.control("", Validators.required),
      chkGTTRefused: this.formBuilder.control(false, Validators.required),
      txtGTTComments:this.formBuilder.control("", Validators.required),

      txtBRECompDate: this.formBuilder.control("", Validators.required),
      txtBREDueDate: this.formBuilder.control("", Validators.required),
      chkBRERefused: this.formBuilder.control(false, Validators.required),
      txtBREComments:this.formBuilder.control("", Validators.required),

      txtVitDCompDate: this.formBuilder.control("", Validators.required),
      txtVitDDueDate: this.formBuilder.control("", Validators.required),
      chkVitDRefused: this.formBuilder.control(false, Validators.required),
      txtVitDComments:this.formBuilder.control("", Validators.required),

      txtHIV1CompDate: this.formBuilder.control("", Validators.required),
      txtHIV1DueDate: this.formBuilder.control("", Validators.required),
      chkHIV1Refused: this.formBuilder.control(false, Validators.required),
      txtHIV1Comments:this.formBuilder.control("", Validators.required),

      txtHIV2CompDate: this.formBuilder.control("", Validators.required),
      txtHIV2DueDate: this.formBuilder.control("", Validators.required),
      chkHIV2Refused: this.formBuilder.control(false, Validators.required),
      txtHIV2Comments:this.formBuilder.control("", Validators.required),

      txtPTINRCompDate: this.formBuilder.control("", Validators.required),
      txtPTINRDueDate: this.formBuilder.control("", Validators.required),
      chkPTINRRefused: this.formBuilder.control(false, Validators.required),
      txtPTINRComments:this.formBuilder.control("", Validators.required),

      txtPFTCompDate: this.formBuilder.control("", Validators.required),
      txtPFTDueDate: this.formBuilder.control("", Validators.required),
      chkPFTRefused: this.formBuilder.control(false, Validators.required),
      txtPFTComments:this.formBuilder.control("", Validators.required),

      txtHHCompDate: this.formBuilder.control("", Validators.required),
      txtHHDueDate: this.formBuilder.control("", Validators.required),
      chkHHRefused: this.formBuilder.control(false, Validators.required),
      txtHHComments:this.formBuilder.control("", Validators.required),

      txtPSACompDate: this.formBuilder.control("", Validators.required),
      txtPSADueDate: this.formBuilder.control("", Validators.required),
      chkPSARefused: this.formBuilder.control(false, Validators.required),
      txtPSAComments:this.formBuilder.control("", Validators.required),

      txtPodCompDate: this.formBuilder.control("", Validators.required),
      txtPodDueDate: this.formBuilder.control("", Validators.required),
      chkPodRefused: this.formBuilder.control(false, Validators.required),
      txtPodComments:this.formBuilder.control("", Validators.required),

      txtEchoCompDate: this.formBuilder.control("", Validators.required),
      txtEchoDueDate: this.formBuilder.control("", Validators.required),
      chkEchoRefused: this.formBuilder.control(false, Validators.required),
      txtEchoComments:this.formBuilder.control("", Validators.required),

      txtStressCompDate: this.formBuilder.control("", Validators.required),
      txtStressDueDate: this.formBuilder.control("", Validators.required),
      chkStressRefused: this.formBuilder.control(false, Validators.required),
      txtStressComments:this.formBuilder.control("", Validators.required),

      txtEGDCompDate: this.formBuilder.control("", Validators.required),
      txtEGDDueDate: this.formBuilder.control("", Validators.required),
      chkEGDRefused: this.formBuilder.control(false, Validators.required),
      txtEGDComments:this.formBuilder.control("", Validators.required),

      txtHPlyloriCompDate: this.formBuilder.control("", Validators.required),
      txtHPlyloriDueDate: this.formBuilder.control("", Validators.required),
      chkHPlyloriRefused: this.formBuilder.control(false, Validators.required),
      txtHPlyloriComments:this.formBuilder.control("", Validators.required),

      txtDreCompDate: this.formBuilder.control("", Validators.required),
      txtDreDueDate: this.formBuilder.control("", Validators.required),
      chkDreRefused: this.formBuilder.control(false, Validators.required),
      txtDreComments:this.formBuilder.control("", Validators.required),

      txtABICompDate: this.formBuilder.control("", Validators.required),
      txtABIDueDate: this.formBuilder.control("", Validators.required),
      chkABIRefused: this.formBuilder.control(false, Validators.required),
      txtABIComments:this.formBuilder.control("", Validators.required),

      txtTSHCompDate: this.formBuilder.control("", Validators.required),
      txtTSHDueDate: this.formBuilder.control("", Validators.required),
      chkTSHRefused: this.formBuilder.control(false, Validators.required),
      txtTSHComments:this.formBuilder.control("", Validators.required),

      txtSonogramCompDate: this.formBuilder.control("", Validators.required),
      txtSonogramDueDate: this.formBuilder.control("", Validators.required),
      chkSonogramRefused: this.formBuilder.control(false, Validators.required),
      txtSonogramComments:this.formBuilder.control("", Validators.required),

      txtUrineCompDate: this.formBuilder.control("", Validators.required),
      txtUrineDueDate: this.formBuilder.control("", Validators.required),
      chkUrineRefused: this.formBuilder.control(false, Validators.required),
      txtUrineComments:this.formBuilder.control("", Validators.required),

      txtleadlvlCompDate: this.formBuilder.control("", Validators.required),
      txtleadlvlDueDate: this.formBuilder.control("", Validators.required),
      chkleadlvlRefused: this.formBuilder.control(false, Validators.required),
      txtleadlvlComments:this.formBuilder.control("", Validators.required),

    })
  }
  onSave(formValue)
  {
    debugger;
    //
    if (formValue.txtFSComplDate != undefined && formValue.txtFSComplDate != ''
    && !this.dateTimeUtil.isValidDateTime(formValue.txtFSComplDate, DateTimeFormat.DATE_MODEL)) {
    GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "FS Complete Date is not in correct formate.", 'warning');
    return;
  }
  if (formValue.txtFSDueDate != undefined && formValue.txtFSDueDate != ''
    && !this.dateTimeUtil.isValidDateTime(formValue.txtFSDueDate, DateTimeFormat.DATE_MODEL)) {
    GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "FS Due Date is not in correct formate.", 'warning');
    return;
  }
   //
   if (formValue.txtFOBTCompDate != undefined && formValue.txtFOBTCompDate != ''
   && !this.dateTimeUtil.isValidDateTime(formValue.txtFOBTCompDate, DateTimeFormat.DATE_MODEL)) {
   GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "FOBT Complete Date is not in correct formate.", 'warning');
   return;
 }
 if (formValue.txtFOBTDueDate != undefined && formValue.txtFOBTDueDate != ''
   && !this.dateTimeUtil.isValidDateTime(formValue.txtFOBTDueDate, DateTimeFormat.DATE_MODEL)) {
   GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "FOBT Due Date is not in correct formate.", 'warning');
   return;
 }
  //
  if (formValue.txtFBSCompDate != undefined && formValue.txtFBSCompDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtFBSCompDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "FBS Complete Date is not in correct formate.", 'warning');
  return;
}
if (formValue.txtFBSDueDate != undefined && formValue.txtFBSDueDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtFBSDueDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "FBS Due Date is not in correct formate.", 'warning');
  return;
}
  //
  if (formValue.txtGTTCompDate != undefined && formValue.txtGTTCompDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtGTTCompDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "GTT Complete Date is not in correct formate.", 'warning');
  return;
}
if (formValue.txtGTTDueDate != undefined && formValue.txtGTTDueDate != ''
  && !this.dateTimeUtil.isValidDateTime(formValue.txtGTTDueDate, DateTimeFormat.DATE_MODEL)) {
  GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "GTT Due Date is not in correct formate.", 'warning');
  return;
}
 //
 if (formValue.txtBRECompDate != undefined && formValue.txtBRECompDate != ''
 && !this.dateTimeUtil.isValidDateTime(formValue.txtBRECompDate, DateTimeFormat.DATE_MODEL)) {
 GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "BRE Complete Date is not in correct formate.", 'warning');
 return;
}
if (formValue.txtBREDueDate != undefined && formValue.txtBREDueDate != ''
 && !this.dateTimeUtil.isValidDateTime(formValue.txtBREDueDate, DateTimeFormat.DATE_MODEL)) {
 GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "BRE Due Date is not in correct formate.", 'warning');
 return;
}
//
if (formValue.txtVitDCompDate != undefined && formValue.txtVitDCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtVitDCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Vit-D Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtVitDDueDate != undefined && formValue.txtVitDDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtVitDDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Vit-D Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtHIV1CompDate != undefined && formValue.txtHIV1CompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtHIV1CompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "HIV-1 Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtHIV1DueDate != undefined && formValue.txtHIV1DueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtHIV1DueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "HIV-1 Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtHIV2CompDate != undefined && formValue.txtHIV2CompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtHIV2CompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "HIV-2 Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtHIV2DueDate != undefined && formValue.txtHIV2DueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtHIV2DueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "HIV-2 Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtPTINRCompDate != undefined && formValue.txtPTINRCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtPTINRCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PT/INR Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtPTINRDueDate != undefined && formValue.txtPTINRDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtPTINRDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PT/INR Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtPFTCompDate != undefined && formValue.txtPFTCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtPFTCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PFT Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtPFTDueDate != undefined && formValue.txtPFTDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtPFTDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PFT Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtHHCompDate != undefined && formValue.txtHHCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtHHCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "H/H Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtHHDueDate != undefined && formValue.txtHHDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtHHDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "H/H Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtPSACompDate != undefined && formValue.txtPSACompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtPSACompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PSA Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtPSADueDate != undefined && formValue.txtPSADueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtPSADueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PSA Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtPodCompDate != undefined && formValue.txtPodCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtPodCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Podiatry Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtPodDueDate != undefined && formValue.txtPodDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtPodDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Podiatry Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtEchoCompDate != undefined && formValue.txtEchoCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtEchoCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Echo Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtEchoDueDate != undefined && formValue.txtEchoDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtEchoDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Echo Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtStressCompDate != undefined && formValue.txtStressCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtStressCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Stress Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtStressDueDate != undefined && formValue.txtStressDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtStressDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Stress Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtEGDCompDate != undefined && formValue.txtEGDCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtEGDCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "EGD Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtEGDDueDate != undefined && formValue.txtEGDDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtEGDDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "EGD Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtHPlyloriCompDate != undefined && formValue.txtHPlyloriCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtHPlyloriCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "H Pylori Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtHPlyloriDueDate != undefined && formValue.txtHPlyloriDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtHPlyloriDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "H Pylori Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtDreCompDate != undefined && formValue.txtDreCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtDreCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "DRE Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtDreDueDate != undefined && formValue.txtDreDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtDreDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "DRE Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtABICompDate != undefined && formValue.txtABICompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtABICompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "ABI Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtABIDueDate != undefined && formValue.txtABIDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtABIDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "ABI Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtTSHCompDate != undefined && formValue.txtTSHCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtTSHCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "TSH Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtTSHDueDate != undefined && formValue.txtTSHDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtTSHDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "TSH Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtSonogramCompDate != undefined && formValue.txtSonogramCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtSonogramCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Sonogram Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtSonogramDueDate != undefined && formValue.txtSonogramDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtSonogramDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Sonogram Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtUrineCompDate != undefined && formValue.txtUrineCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtUrineCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Urine Micro	Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtUrineDueDate != undefined && formValue.txtUrineDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtUrineDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Urine Micro Due Date is not in correct formate.", 'warning');
return;
}
//
if (formValue.txtleadlvlCompDate != undefined && formValue.txtleadlvlCompDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtleadlvlCompDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Lead Lvl Complete Date is not in correct formate.", 'warning');
return;
}
if (formValue.txtleadlvlDueDate != undefined && formValue.txtleadlvlDueDate != ''
&& !this.dateTimeUtil.isValidDateTime(formValue.txtleadlvlDueDate, DateTimeFormat.DATE_MODEL)) {
GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Lead Lvl Due Date is not in correct formate.", 'warning');
return;
}
    if (this.listSaveTest == undefined)
      this.listSaveTest = new Array();

    if (formValue.txtFSComplDate != '' || formValue.txtFSDueDate != '' || formValue.txtFsComments != '' || formValue.chkFsRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'FS';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtFSComplDate==""?undefined:formValue.txtFSComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtFSDueDate==""?undefined:formValue.txtFSComplDate);
      ormSave.test_value = formValue.txtFsComments;
      ormSave.refusal = formValue.chkFsRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'FS');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtFOBTCompDate != '' || formValue.txtFOBTDueDate != '' || formValue.txtFOBTComments != '' || formValue.chkFOBTRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'FOBT';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtFOBTCompDate==""?undefined:formValue.txtFOBTCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtFOBTDueDate==""?undefined:formValue.txtFOBTDueDate);
      ormSave.test_value = formValue.txtFOBTComments;
      ormSave.refusal = formValue.chkFOBTRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'FOBT');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtFBSCompDate != '' || formValue.txtFBSDueDate != '' || formValue.txtFBSComments != '' || formValue.chkFBSRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'FBS';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtFBSCompDate==""?undefined:formValue.txtFBSCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtFBSDueDate==""?undefined:formValue.txtFBSDueDate);
      ormSave.test_value = formValue.txtFBSComments;
      ormSave.refusal = formValue.chkFBSRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'FBS');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtGTTCompDate != '' || formValue.txtGTTDueDate != '' || formValue.txtGTTComments != '' || formValue.chkGTTRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'GTT';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtGTTCompDate==""?undefined:formValue.txtGTTCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtGTTDueDate==""?undefined:formValue.txtGTTDueDate);
      ormSave.test_value = formValue.txtGTTComments;
      ormSave.refusal = formValue.chkGTTRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'GTT');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtBRECompDate != '' || formValue.txtBREDueDate != '' || formValue.txtBREComments != '' || formValue.chkBRERefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'BRE';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtBRECompDate==""?undefined:formValue.txtBRECompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtBREDueDate==""?undefined:formValue.txtBREDueDate);
      ormSave.test_value = formValue.txtBREComments;
      ormSave.refusal = formValue.chkBRERefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'BRE');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtVitDCompDate != '' || formValue.txtVitDDueDate != '' || formValue.txtVitDComments != '' || formValue.chkVitDRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Vit-D';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtVitDCompDate==""?undefined:formValue.txtVitDCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtVitDDueDate==""?undefined:formValue.txtVitDDueDate);
      ormSave.test_value = formValue.txtVitDComments;
      ormSave.refusal = formValue.chkVitDRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Vit-D');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtHIV1CompDate != '' || formValue.txtHIV1DueDate != '' || formValue.txtHIV1Comments != '' || formValue.chkHIV1Refused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'HIV-1';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHIV1CompDate==""?undefined:formValue.txtHIV1CompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHIV1DueDate==""?undefined:formValue.txtHIV1DueDate);
      ormSave.test_value = formValue.txtHIV1Comments;
      ormSave.refusal = formValue.chkHIV1Refused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'HIV-1');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtHIV2CompDate != '' || formValue.txtHIV2DueDate != '' || formValue.txtHIV2Comments != '' || formValue.chkHIV2Refused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'HIV-2';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHIV2CompDate==""?undefined:formValue.txtHIV2CompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHIV2DueDate==""?undefined:formValue.txtHIV2DueDate);
      ormSave.test_value = formValue.txtHIV2Comments;
      ormSave.refusal = formValue.chkHIV2Refused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'HIV-2');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtPTINRCompDate != '' || formValue.txtPTINRDueDate != '' || formValue.txtPTINRComments != '' || formValue.chkPTINRRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'PT/INR';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPTINRCompDate==""?undefined:formValue.txtPTINRCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPTINRDueDate==""?undefined:formValue.txtPTINRDueDate);
      ormSave.test_value = formValue.txtPTINRComments;
      ormSave.refusal = formValue.chkPTINRRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'PT/INR');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtPFTCompDate != '' || formValue.txtPFTDueDate != '' || formValue.txtPFTComments != '' || formValue.chkPFTRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'PFT';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPFTCompDate==""?undefined:formValue.txtPFTCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPFTDueDate==""?undefined:formValue.txtPFTDueDate);
      ormSave.test_value = formValue.txtPFTComments;
      ormSave.refusal = formValue.chkPFTRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'PFT');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtHHCompDate != '' || formValue.txtHHDueDate != '' || formValue.txtHHComments != '' || formValue.chkHHRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'H/H';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHHCompDate==""?undefined:formValue.txtHHCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHHDueDate==""?undefined:formValue.txtHHDueDate);
      ormSave.test_value = formValue.txtHHComments;
      ormSave.refusal = formValue.chkHHRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'H/H');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtPSACompDate != '' || formValue.txtPSADueDate != '' || formValue.txtPSAComments != '' || formValue.chkPSARefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'PSA';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPSACompDate==""?undefined:formValue.txtPSACompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPSADueDate==""?undefined:formValue.txtPSADueDate);
      ormSave.test_value = formValue.txtPSAComments;
      ormSave.refusal = formValue.chkPSARefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'PSA');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtPodCompDate != '' || formValue.txtPodDueDate != '' || formValue.txtPodComments != '' || formValue.chkPodRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Podiatry';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPodCompDate==""?undefined:formValue.txtPodCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPodDueDate==""?undefined:formValue.txtPodDueDate);
      ormSave.test_value = formValue.txtPodComments;
      ormSave.refusal = formValue.chkPodRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Podiatry');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtEchoCompDate != '' || formValue.txtEchoDueDate != '' || formValue.txtEchoComments != '' || formValue.chkEchoRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Echo';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtEchoCompDate==""?undefined:formValue.txtEchoCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtEchoDueDate==""?undefined:formValue.txtEchoDueDate);
      ormSave.test_value = formValue.txtEchoComments;
      ormSave.refusal = formValue.chkEchoRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Echo');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtStressCompDate != '' || formValue.txtStressDueDate != '' || formValue.txtStressComments != '' || formValue.chkStressRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'STRESS';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtStressCompDate==""?undefined:formValue.txtStressCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtStressDueDate==""?undefined:formValue.txtStressDueDate);
      ormSave.test_value = formValue.txtStressComments;
      ormSave.refusal = formValue.chkStressRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'STRESS');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtEGDCompDate != '' || formValue.txtEGDDueDate != '' || formValue.txtEGDComments != '' || formValue.chkEGDRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'EGD';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtEGDCompDate==""?undefined:formValue.txtEGDCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtEGDDueDate==""?undefined:formValue.txtEGDDueDate);
      ormSave.test_value = formValue.txtEGDComments;
      ormSave.refusal = formValue.chkEGDRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'EGD');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtHPlyloriCompDate != '' || formValue.txtHPlyloriDueDate != '' || formValue.txtHPlyloriComments != '' || formValue.chkHPlyloriRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'H Pylori';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHPlyloriCompDate==""?undefined:formValue.txtHPlyloriCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtHPlyloriDueDate==""?undefined:formValue.txtHPlyloriDueDate);
      ormSave.test_value = formValue.txtHPlyloriComments;
      ormSave.refusal = formValue.chkHPlyloriRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'H Pylori');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtDreCompDate != '' || formValue.txtDreDueDate != '' || formValue.txtDreComments != '' || formValue.chkDreRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'DRE';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtDreCompDate==""?undefined:formValue.txtDreCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtDreDueDate==""?undefined:formValue.txtDreDueDate);
      ormSave.test_value = formValue.txtDreComments;
      ormSave.refusal = formValue.chkDreRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'DRE');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtABICompDate != '' || formValue.txtABIDueDate != '' || formValue.txtABIComments != '' || formValue.chkABIRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'ABI';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtABICompDate==""?undefined:formValue.txtABICompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtABIDueDate==""?undefined:formValue.txtABIDueDate);
      ormSave.test_value = formValue.txtABIComments;
      ormSave.refusal = formValue.chkABIRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'ABI');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtTSHCompDate != '' || formValue.txtTSHDueDate != '' || formValue.txtTSHComments != '' || formValue.chkTSHRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'TSH';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtTSHCompDate==""?undefined:formValue.txtTSHCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtTSHDueDate==""?undefined:formValue.txtTSHDueDate);
      ormSave.test_value = formValue.txtTSHComments;
      ormSave.refusal = formValue.chkTSHRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'TSH');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtSonogramCompDate != '' || formValue.txtSonogramDueDate != '' || formValue.txtSonogramComments != '' || formValue.chkSonogramRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Sonogram';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtSonogramCompDate==""?undefined:formValue.txtSonogramCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtSonogramDueDate==""?undefined:formValue.txtSonogramDueDate);
      ormSave.test_value = formValue.txtSonogramComments;
      ormSave.refusal = formValue.chkSonogramRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Sonogram');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtUrineCompDate != '' || formValue.txtUrineDueDate != '' || formValue.txtUrineComments != '' || formValue.chkUrineRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Urine Micro';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtUrineCompDate==""?undefined:formValue.txtUrineCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtUrineDueDate==""?undefined:formValue.txtUrineDueDate);
      ormSave.test_value = formValue.txtUrineComments;
      ormSave.refusal = formValue.chkUrineRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Urine Micro');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }
    if (formValue.txtleadlvlCompDate != '' || formValue.txtleadlvlDueDate != '' || formValue.txtleadlvlComments != '' || formValue.chkleadlvlRefused == true) {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;

      ormSave.test_category = 'OTHER TESTS';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Lead Lvl';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtleadlvlCompDate==""?undefined:formValue.txtleadlvlCompDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtleadlvlDueDate==""?undefined:formValue.txtleadlvlDueDate);
      ormSave.test_value = formValue.txtleadlvlComments;
      ormSave.refusal = formValue.chkleadlvlRefused;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Lead Lvl');

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
