import { Component, OnInit, Input, EventEmitter, Output, Inject } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ORMOfficeTestSave } from 'src/app/models/encounter/ORMOfficeTestSave';
import { WrapperOfficeTestSave } from 'src/app/models/encounter/WrapperOfficeTestSave';
import { PromptResponseEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMChartOfficeTestCpt } from 'src/app/models/encounter/ORMChartOfficeTestCpt';

@Component({
  selector: 'mental-officetest',
  templateUrl: './mental-officetest.component.html',
  styleUrls: ['./mental-officetest.component.css']
})
export class MentalOfficetestComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  
  lstCPTs: Array<any>;
  acBillCpts: Array<any>;
  acBillCptsResult: Array<any>;

  isOfcTestShow = true;
  ofcTestForm: FormGroup;
  chartOfficeTestList;
  addEditView: boolean = false;
  canView: boolean = false;
  canAddEdit: boolean = false;
  isLoading: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private encounterService: EncounterService, private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation, private modalService: NgbModal)
    { 
      this.canView = this.lookupList.UserRights.ViewOfficeTest;
      this.canAddEdit = this.lookupList.UserRights.AddModifyOfficeTest;
    } 

    ngOnInit() {
      if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      this.buildForm();
      if (this.canView)
        this.getChartOfficeTest(this.objencounterToOpen.chart_id);
  
      if (this.canAddEdit == false)
        this.ofcTestForm.disable();
  
      this.getOfficeCpts();
    }
    getOfficeCpts() {
      this.encounterService.getOfficeCpts(this.lookupList.practiceInfo.practiceId.toString())
        .subscribe(
          data => {
            this.acBillCptsResult = undefined;
            this.acBillCptsResult = data as Array<any>;
          },
          error => alert(error),
          () => this.logMessage.log("get Office Cpts Successfull.")
        );
    }
    generalChange(event) {
      debugger;
      if(event.key == "Tab")
        return;
  
      this.addEditView = true;
    }
    cancelEdit() {
      this.addEditView = false;
      this.clearAllFields();
      if (this.chartOfficeTestList.length > 0) {
        this.assignValues();
      }
    }
    clearAllFields() {
      (this.ofcTestForm.get('txt_ua') as FormControl).setValue('');
      (this.ofcTestForm.get('txt_sbirit') as FormControl).setValue('');
      
      (this.ofcTestForm.get('rbPregCondition') as FormControl).setValue(false);
      (this.ofcTestForm.get('rbPregCondition') as FormControl).setValue(false);
      (this.ofcTestForm.get('rbStrepCondition') as FormControl).setValue(false);
      (this.ofcTestForm.get('rbStrepCondition') as FormControl).setValue(false);

      (this.ofcTestForm.get('txt_OBG_LMP') as FormControl).setValue('');
      
    }
    getChartOfficeTest(chartID) {
      this.isLoading = true;
      this.encounterService.getOfficeTest(chartID)
        .subscribe(
          data => {
            this.chartOfficeTestList = null;
            this.chartOfficeTestList = data;
            if (this.chartOfficeTestList.length > 0)
              this.assignValues();
  
            if (this.chartOfficeTestList.length == 0) {
              this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
            }
            else {
              this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
            }
            this.isLoading = false;
          },
          error => alert(error),
          () => this.logMessage.log("get office test Successfull.")
        );
    }
    buildForm() {
      this.ofcTestForm = this.formBuilder.group({
        txt_ua: this.formBuilder.control(""),
        txt_sbirit: this.formBuilder.control(""),
       
        rbPregCondition: this.formBuilder.control(""),
        rbStrepCondition: this.formBuilder.control(""),
        rbRapidFlu: this.formBuilder.control(""),
        rbPPDTest: this.formBuilder.control(""),
        txt_OBG_LMP: this.formBuilder.control(""),
        
        
      })
    }
    editOfficeTest() {
      this.isOfcTestShow = false;
      this.assignValues();
    }
    cancelOfcTest() {
      this.isOfcTestShow = true;
    }
    assignValues() {
      debugger;
      if (this.chartOfficeTestList != null || this.chartOfficeTestList != "") {
        (this.ofcTestForm.get('txt_ua') as FormControl).setValue(this.chartOfficeTestList[0].urine_analysis);
        (this.ofcTestForm.get('txt_sbirit') as FormControl).setValue(this.chartOfficeTestList[0].sbirit);
 
        if (this.chartOfficeTestList[0].pregnancy == true) {
          (this.ofcTestForm.get('rbPregCondition') as FormControl).setValue("pregnancy_Positive");
        }
        else if (this.chartOfficeTestList[0].pregnancy == false) {
          (this.ofcTestForm.get('rbPregCondition') as FormControl).setValue("pregnancy_Negative");
        }
        if (this.chartOfficeTestList[0].strip == true) {
          (this.ofcTestForm.get('rbStrepCondition') as FormControl).setValue("prag_strep_Positive");
        }
        else if (this.chartOfficeTestList[0].strip == false) {
          (this.ofcTestForm.get('rbStrepCondition') as FormControl).setValue("prag_strep_Negative");
        }
        if(this.chartOfficeTestList[0].lmp!=undefined && this.chartOfficeTestList[0].lmp!=null && this.chartOfficeTestList[0].lmp!=''){
          (this.ofcTestForm.get("txt_OBG_LMP") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.chartOfficeTestList[0].lmp.substring(0, 10), DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
        }
      }
    }
    saveOfficeTest(formvalue) {
      let ormSave: ORMOfficeTestSave = new ORMOfficeTestSave();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      ormSave.system_ip = this.lookupList.logedInUser.systemIp;
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.patient_id = this.objencounterToOpen.patient_id.toString();
      ormSave.chart_id = this.objencounterToOpen.chart_id.toString();
  
      if (this.chartOfficeTestList.length == 0) {
        ormSave.created_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      }
      else {
        ormSave.officetest_id = this.chartOfficeTestList[0].officetest_id;
        ormSave.client_date_created = this.chartOfficeTestList[0].client_date_created;
        ormSave.date_created = this.chartOfficeTestList[0].date_created;
        ormSave.created_user = this.chartOfficeTestList[0].created_user;
      }
       
  
       
      ormSave.urine_analysis = formvalue.txt_ua;
      ormSave.sbirit = formvalue.txt_sbirit;

      
      let OBGLMPDate = (this.ofcTestForm.get('txt_OBG_LMP') as FormControl).value;
      if (OBGLMPDate != "") {
        let OBG_LMP = this.dateTimeUtil.getStringDateFromDateModel(OBGLMPDate);
        ormSave.lmp = OBG_LMP;
      } else {
        ormSave.lmp = "";
      }
      ormSave.hp = '';
      
      ormSave.pregnancy = formvalue.rbPregCondition == "pregnancy_Positive" ? "1" : formvalue.rbPregCondition == "pregnancy_Negative" ? "0" : null;
      
      ormSave.strip = formvalue.rbStrepCondition == "prag_strep_Positive" ? "1" : formvalue.rbStrepCondition == "prag_strep_Negative" ? "0" : null;
      
      
  debugger;
      this.saveCPTs();
      let WrapperSaveOfficeTest: WrapperOfficeTestSave = new WrapperOfficeTestSave();
  
      WrapperSaveOfficeTest.officeTestSave = ormSave;
      WrapperSaveOfficeTest.cptSave = this.lstCPTs;
  
  
  
      this.encounterService.saveOfficeTest(WrapperSaveOfficeTest)
        .subscribe(
          data => {
            this.addEditView = false;
            this.getChartOfficeTest(this.objencounterToOpen.chart_id);
          },
          error => {
            this.showError("An error occured while saving Chart Office Test.");
          }
        );
      
    }
    saveCPTs() {
      if (this.acBillCptsResult == null || this.acBillCptsResult.length == 0)
        return;  
      if ((this.ofcTestForm.get("rbPregCondition") as FormControl).value == "pregnancy_Positive" ||
        (this.ofcTestForm.get("rbPregCondition") as FormControl).value == "pregnancy_Negative") {
        //preganancy
        this.add_OfficeCpts("81025", "Pregnancy");
      }
  
      if ((this.ofcTestForm.get("rbStrepCondition") as FormControl).value == "prag_strep_Positive" ||
        (this.ofcTestForm.get("rbStrepCondition") as FormControl).value == "prag_strep_Negative") {
        //strep
        this.add_OfficeCpts("87880", "Strep");
      }
      if ((this.ofcTestForm.get("txt_ua") as FormControl).value != "") {
        // U/A
        this.add_OfficeCpts("81002", "U/A");
      }
    }
    add_OfficeCpts(cptVal, testName) {
      if (this.acBillCptsResult == null || this.acBillCptsResult.length == 0)
        return;
  
      let objOfficeTestCPt: ORMChartOfficeTestCpt = new ORMChartOfficeTestCpt();
      this.acBillCpts = this.generalOperation.filterArray(this.acBillCptsResult, "code1", cptVal);
      if (this.acBillCpts.length == 0)
        return;
  
      objOfficeTestCPt.officetest_cpt_id = "";
      objOfficeTestCPt.officetest_id = "";
      objOfficeTestCPt.patient_id = this.objencounterToOpen.patient_id.toString();
      objOfficeTestCPt.chart_id = this.objencounterToOpen.chart_id.toString();
      objOfficeTestCPt.testname = testName;
      objOfficeTestCPt.proc_code = this.acBillCpts[0].code1;
      objOfficeTestCPt.charges = this.acBillCpts[0].default_amt1;
      objOfficeTestCPt.units = this.acBillCpts[0].unit1;
      objOfficeTestCPt.ndc_code = this.acBillCpts[0].default_ndc1;
      objOfficeTestCPt.description = this.acBillCpts[0].description1;
      objOfficeTestCPt.pos = "11     Office";
      objOfficeTestCPt.default_modifier = this.acBillCpts[0].default_modifier1;
  
      objOfficeTestCPt.deleted = false;
      objOfficeTestCPt.created_user = this.lookupList.logedInUser.user_name;
      objOfficeTestCPt.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      objOfficeTestCPt.modified_user = this.lookupList.logedInUser.user_name;
      objOfficeTestCPt.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
  
      if (this.lstCPTs == undefined)
        this.lstCPTs = new Array<number>();
  
      this.lstCPTs.push(objOfficeTestCPt);
  
  
    }
    showError(errMsg) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Error";
      modalRef.componentInstance.promptMessage = errMsg;
      modalRef.componentInstance.alertType = "error";
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
      return;
    }
    poupUpOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    checkUncheckPregnancyStatus(status) {
      if (status == "pos") {
        if ((this.ofcTestForm.get("rbPregCondition") as FormControl).value == "pregnancy_Positive") {
          (this.ofcTestForm.get('rbPregCondition') as FormControl).setValue(false);
        }
      } else if (status == "neg") {
        if ((this.ofcTestForm.get("rbPregCondition") as FormControl).value == "pregnancy_Negative") {
          (this.ofcTestForm.get('rbPregCondition') as FormControl).setValue(false);
        }
      }
      this.rdogeneralChange();
    }
    checkUncheckStrepStatus(status) {
      if (status == "pos") {
        if ((this.ofcTestForm.get("rbStrepCondition") as FormControl).value == "prag_strep_Positive") {
          (this.ofcTestForm.get('rbStrepCondition') as FormControl).setValue(false);
        }
      } else if (status == "neg") {
        if ((this.ofcTestForm.get("rbStrepCondition") as FormControl).value == "prag_strep_Negative") {
          (this.ofcTestForm.get('rbStrepCondition') as FormControl).setValue(false);
        }
      }
      this.rdogeneralChange();
    }
    logoutScreenOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: true,
      size: 'lg'
    };
    lgPopUpOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
    };
    rdogeneralChange() {
      this.addEditView = true;
    }
    onrefresh(){
      if (this.canView)
      this.getChartOfficeTest(this.objencounterToOpen.chart_id);      
    }
}
