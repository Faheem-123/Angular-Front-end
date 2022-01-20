import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { LogMessage } from '../../../shared/log-message';
import { ORMOfficeTestSave } from 'src/app/models/encounter/ORMOfficeTestSave';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ChartModuleHistoryComponent } from 'src/app/general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from 'src/app/models/encounter/chartmodulehistory';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { ORMChartOfficeTestCpt } from 'src/app/models/encounter/ORMChartOfficeTestCpt';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { WrapperOfficeTestSave } from 'src/app/models/encounter/WrapperOfficeTestSave';

@Component({
  selector: 'office-test',
  templateUrl: './office-test.component.html',
  styleUrls: ['./office-test.component.css']
})
export class OfficeTestComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  private obj_OfficeTesthistory: chartmodulehistory;
  isOfcTestShow = true;
  ofcTestForm: FormGroup;
  chartOfficeTestList;
  addEditView: boolean = false;
  canView: boolean = false;
  canAddEdit: boolean = false;
  isLoading: boolean = false;

  lstCPTs: Array<any>;
  acBillCpts: Array<any>;
  acBillCptsResult: Array<any>;
  constructor(private formBuilder: FormBuilder,
    private encounterService: EncounterService, private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation, private modalService: NgbModal) {
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
  rdogeneralChange() {
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
    (this.ofcTestForm.get('txt_BGfasting') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_BGrandom') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_BGprandial') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_vision_left') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_vision_right') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_txtOgtt1') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_txtOgtt2') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_txtOgtt3') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_txtOgtt4') as FormControl).setValue('');
    (this.ofcTestForm.get('rdHearinglevel') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdHearinglevel') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdHearinglevel') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdRitht500') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdRitht500') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdRitht1000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdRitht1000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdRitht2000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdRitht2000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdRitht4000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdRitht4000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdLeft500') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdLeft500') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdLeft1000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdLeft1000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdLeft2000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdLeft2000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdLeft4000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rdLeft4000') as FormControl).setValue(false);
    (this.ofcTestForm.get('rbPregCondition') as FormControl).setValue(false);
    (this.ofcTestForm.get('rbPregCondition') as FormControl).setValue(false);
    (this.ofcTestForm.get('rbStrepCondition') as FormControl).setValue(false);
    (this.ofcTestForm.get('rbStrepCondition') as FormControl).setValue(false);
    (this.ofcTestForm.get('txt_OBG_LMP') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_spirometryresult') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_glucose') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_blood') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_nitrate') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_bilirubin') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_ph') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_leukocytes') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_ketone') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_protein') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_spgravity') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_urobilinogen') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_hemoglobin') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_fluoride') as FormControl).setValue('');
    (this.ofcTestForm.get('txt_loadscreening') as FormControl).setValue('');
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
      txt_BGfasting: this.formBuilder.control(""),
      txt_BGrandom: this.formBuilder.control(""),
      txt_BGprandial: this.formBuilder.control(""),
      txt_vision_left: this.formBuilder.control(""),
      txt_vision_right: this.formBuilder.control(""),
      txt_txtOgtt1: this.formBuilder.control(""),
      txt_txtOgtt2: this.formBuilder.control(""),
      txt_txtOgtt3: this.formBuilder.control(""),
      txt_txtOgtt4: this.formBuilder.control(""),
      rdHearinglevel: this.formBuilder.control(""),
      rdRitht500: this.formBuilder.control(""),
      rdRitht1000: this.formBuilder.control(""),
      rdRitht2000: this.formBuilder.control(""),
      rdRitht4000: this.formBuilder.control(""),
      rdLeft500: this.formBuilder.control(""),
      rdLeft1000: this.formBuilder.control(""),
      rdLeft2000: this.formBuilder.control(""),
      rdLeft4000: this.formBuilder.control(""),
      rbPregCondition: this.formBuilder.control(""),
      rbStrepCondition: this.formBuilder.control(""),
      rbRapidFlu: this.formBuilder.control(""),
      rbPPDTest: this.formBuilder.control(""),
      txt_OBG_LMP: this.formBuilder.control(""),
      txt_spirometryresult: this.formBuilder.control(""),
      txt_glucose: this.formBuilder.control(""),
      txt_blood: this.formBuilder.control(""),
      txt_nitrate: this.formBuilder.control(""),
      txt_bilirubin: this.formBuilder.control(""),
      txt_ph: this.formBuilder.control(""),
      txt_leukocytes: this.formBuilder.control(""),
      txt_ketone: this.formBuilder.control(""),
      txt_protein: this.formBuilder.control(""),
      txt_spgravity: this.formBuilder.control(""),
      txt_urobilinogen: this.formBuilder.control(""),
      txt_hemoglobin: this.formBuilder.control(""),
      txt_fluoride: this.formBuilder.control(""),
      txt_loadscreening: this.formBuilder.control(""),
      txt_fluab: this.formBuilder.control(""),
      txt_rsv: this.formBuilder.control("")
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
      (this.ofcTestForm.get('txt_BGfasting') as FormControl).setValue(this.chartOfficeTestList[0].fasting);
      (this.ofcTestForm.get('txt_BGrandom') as FormControl).setValue(this.chartOfficeTestList[0].random);
      (this.ofcTestForm.get('txt_BGprandial') as FormControl).setValue(this.chartOfficeTestList[0].post_prandial);
      (this.ofcTestForm.get('txt_vision_left') as FormControl).setValue(this.chartOfficeTestList[0].left_vesion);
      (this.ofcTestForm.get('txt_vision_right') as FormControl).setValue(this.chartOfficeTestList[0].right_vesion);
      (this.ofcTestForm.get('txt_txtOgtt1') as FormControl).setValue(this.chartOfficeTestList[0].ogtt_1);
      (this.ofcTestForm.get('txt_txtOgtt2') as FormControl).setValue(this.chartOfficeTestList[0].ogtt_2);
      (this.ofcTestForm.get('txt_txtOgtt3') as FormControl).setValue(this.chartOfficeTestList[0].ogtt_3);
      (this.ofcTestForm.get('txt_txtOgtt4') as FormControl).setValue(this.chartOfficeTestList[0].ogtt_4);
      if (this.chartOfficeTestList[0].hear_level_20 == true) {
        (this.ofcTestForm.get('rdHearinglevel') as FormControl).setValue("hearing_level_20");
      }
      else if (this.chartOfficeTestList[0].hear_level_25 == true) {
        (this.ofcTestForm.get('rdHearinglevel') as FormControl).setValue("hearing_level_25");
      }
      else if (this.chartOfficeTestList[0].hear_level_40 == true) {
        (this.ofcTestForm.get('rdHearinglevel') as FormControl).setValue("hearing_level_40");
      }
      if (this.chartOfficeTestList[0].ritht_ear_500 == true) {
        (this.ofcTestForm.get('rdRitht500') as FormControl).setValue("rightear1_y");
      }
      else if (this.chartOfficeTestList[0].ritht_ear_500 == false) {
        (this.ofcTestForm.get('rdRitht500') as FormControl).setValue("rightear1_n");
      }
      if (this.chartOfficeTestList[0].ritht_ear_1000 == true) {
        (this.ofcTestForm.get('rdRitht1000') as FormControl).setValue("rightear2_y");
      }
      else if (this.chartOfficeTestList[0].ritht_ear_1000 == false) {
        (this.ofcTestForm.get('rdRitht1000') as FormControl).setValue("rightear2_n");
      }
      if (this.chartOfficeTestList[0].ritht_ear_2000 == true) {
        (this.ofcTestForm.get('rdRitht2000') as FormControl).setValue("rightear3_y");
      }
      else if (this.chartOfficeTestList[0].ritht_ear_2000 == false) {
        (this.ofcTestForm.get('rdRitht2000') as FormControl).setValue("rightear3_n");
      }
      if (this.chartOfficeTestList[0].ritht_ear_4000 == true) {
        (this.ofcTestForm.get('rdRitht4000') as FormControl).setValue("rightear4_y");
      }
      else if (this.chartOfficeTestList[0].ritht_ear_4000 == false) {
        (this.ofcTestForm.get('rdRitht4000') as FormControl).setValue("rightear4_n");
      }

      if (this.chartOfficeTestList[0].left_ear_500 == true) {
        (this.ofcTestForm.get('rdLeft500') as FormControl).setValue("leftear1_y");
      }
      else if (this.chartOfficeTestList[0].left_ear_500 == false) {
        (this.ofcTestForm.get('rdLeft500') as FormControl).setValue("leftear1_n");
      }


      //(this.ofcTestForm.get('rdLeft500') as FormControl).setValue(this.chartOfficeTestList[0].left_ear_500 == true ? "leftear1_y" : false);
      //(this.ofcTestForm.get('rdLeft500') as FormControl).setValue(this.chartOfficeTestList[0].left_ear_500 == false ? "leftear1_n" : false);

      // if (this.chartOfficeTestList[0].left_ear_500 == true) {
      //   (this.ofcTestForm.get('rdLeft500') as FormControl).setValue("leftear1_y");
      // }
      // else if (this.chartOfficeTestList[0].left_ear_500 == false) {
      //   (this.ofcTestForm.get('rdLeft500') as FormControl).setValue("leftear1_n");
      // }



      if (this.chartOfficeTestList[0].left_ear_1000 == true) {
        (this.ofcTestForm.get('rdLeft1000') as FormControl).setValue("leftear2_y");
      }
      else if (this.chartOfficeTestList[0].left_ear_1000 == false) {
        (this.ofcTestForm.get('rdLeft1000') as FormControl).setValue("leftear2_n");
      }
      if (this.chartOfficeTestList[0].left_ear_2000 == true) {
        (this.ofcTestForm.get('rdLeft2000') as FormControl).setValue("leftear3_y");
      }
      else if (this.chartOfficeTestList[0].left_ear_2000 == false) {
        (this.ofcTestForm.get('rdLeft2000') as FormControl).setValue("leftear3_n");
      }
      if (this.chartOfficeTestList[0].left_ear_4000 == true) {
        (this.ofcTestForm.get('rdLeft4000') as FormControl).setValue("leftear4_y");
      }
      else if (this.chartOfficeTestList[0].left_ear_4000 == false) {
        (this.ofcTestForm.get('rdLeft4000') as FormControl).setValue("leftear4_n");
      }
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
      
      (this.ofcTestForm.get('txt_spirometryresult') as FormControl).setValue(this.chartOfficeTestList[0].spirometry);
      (this.ofcTestForm.get('txt_glucose') as FormControl).setValue(this.chartOfficeTestList[0].glucose);
      (this.ofcTestForm.get('txt_blood') as FormControl).setValue(this.chartOfficeTestList[0].blood);
      (this.ofcTestForm.get('txt_nitrate') as FormControl).setValue(this.chartOfficeTestList[0].nitrate);
      (this.ofcTestForm.get('txt_bilirubin') as FormControl).setValue(this.chartOfficeTestList[0].bilirubin);
      (this.ofcTestForm.get('txt_ph') as FormControl).setValue(this.chartOfficeTestList[0].ph);
      (this.ofcTestForm.get('txt_leukocytes') as FormControl).setValue(this.chartOfficeTestList[0].leukoctes);
      (this.ofcTestForm.get('txt_ketone') as FormControl).setValue(this.chartOfficeTestList[0].kenton);
      (this.ofcTestForm.get('txt_protein') as FormControl).setValue(this.chartOfficeTestList[0].protein);
      (this.ofcTestForm.get('txt_spgravity') as FormControl).setValue(this.chartOfficeTestList[0].sp_gravity);
      (this.ofcTestForm.get('txt_urobilinogen') as FormControl).setValue(this.chartOfficeTestList[0].urobilinogen);
      (this.ofcTestForm.get('txt_hemoglobin') as FormControl).setValue(this.chartOfficeTestList[0].hemoglobin);
      (this.ofcTestForm.get('txt_fluoride') as FormControl).setValue(this.chartOfficeTestList[0].fluoride);
      (this.ofcTestForm.get('txt_loadscreening') as FormControl).setValue(this.chartOfficeTestList[0].lead_screening);
      (this.ofcTestForm.get('txt_fluab') as FormControl).setValue(this.chartOfficeTestList[0].flu_ab);
      (this.ofcTestForm.get('txt_rsv') as FormControl).setValue(this.chartOfficeTestList[0].rsv);
      debugger;
      if (this.chartOfficeTestList[0].rapidflu == true) {
        (this.ofcTestForm.get('rbRapidFlu') as FormControl).setValue("RapidFlu_Positive");
      }
      else if (this.chartOfficeTestList[0].rapidflu == false) {
        (this.ofcTestForm.get('rbRapidFlu') as FormControl).setValue("RapidFlu_Negative");
      }
      if (this.chartOfficeTestList[0].ppd_test == true) {
        (this.ofcTestForm.get('rbPPDTest') as FormControl).setValue("PPDTest_Positive");
      }
      else if (this.chartOfficeTestList[0].rapidflu == false) {
        (this.ofcTestForm.get('rbPPDTest') as FormControl).setValue("PPDTest_Negative");
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
    ormSave.left_vesion = formvalue.txt_vision_left;
    ormSave.right_vesion = formvalue.txt_vision_right;
    ormSave.hear_level_20 = formvalue.rdHearinglevel == "hearing_level_20" ? "true" : "false";

    // if (formvalue.rdHearinglevel == "hearing_level_20") {
    //   ormSave.hear_level_20 = true;
    // }
    // else
    //   ormSave.hear_level_20 = false;
    ormSave.hear_level_25 = formvalue.rdHearinglevel == "hearing_level_25" ? "true" : "false";
    // if (formvalue.rdHearinglevel == "hearing_level_25") {
    //   ormSave.hear_level_25 = true;
    // }
    // else
    //   ormSave.hear_level_25 = false;
    ormSave.hear_level_40 = formvalue.rdHearinglevel == "hearing_level_40" ? "true" : "false";
    // if (formvalue.rdHearinglevel == "hearing_level_40") {
    //   ormSave.hear_level_40 = true;
    // }
    // else
    //   ormSave.hear_level_40 = false;
    //ormSave.ritht_ear_500 = formvalue.rdRitht500 == "rightear1_y" ? "true" : "false";
    //ormSave.ritht_ear_500 = formvalue.rdRitht500 == "rightear1_y" ? "true" : formvalue.rdRitht500 == "rightear1_n" ? "false" : null;
    ormSave.ritht_ear_500 = formvalue.rdRitht500 == "rightear1_y" ? "1" : formvalue.rdRitht500 == "rightear1_n" ? "0" : null;
    // if (formvalue.rdRitht500 == "rightear1_y") {
    //   ormSave.ritht_ear_500 = true;
    // }
    // else {
    //   ormSave.ritht_ear_500 = false;
    // }
    //ormSave.ritht_ear_1000 = formvalue.rdRitht1000 == "rightear2_y" ? "true" : "false";
    //ormSave.ritht_ear_1000 = formvalue.rdRitht1000 == "rightear2_y" ? "true" : formvalue.rdRitht1000 == "rightear2_y" ? "false" : null;
    ormSave.ritht_ear_1000 = formvalue.rdRitht1000 == "rightear2_y" ? "1" : formvalue.rdRitht1000 == "rightear2_y" ? "0" : null;
    // if (formvalue.rdRitht1000 == "rightear2_y") {
    //   ormSave.ritht_ear_1000 = true;
    // }
    // else {
    //   ormSave.ritht_ear_1000 = false;
    // }
    //ormSave.ritht_ear_2000 = formvalue.rdRitht2000 == "rightear3_y" ? "true" : "false";
    ormSave.ritht_ear_2000 = formvalue.rdRitht2000 == "rightear3_y" ? "1" : formvalue.rdRitht2000 == "rightear3_n" ? "0" : null;
    // if (formvalue.rdRitht2000 == "rightear3_y") {
    //   ormSave.ritht_ear_2000 = true;
    // }
    // else {
    //   ormSave.ritht_ear_2000 = false;
    // }
    //ormSave.ritht_ear_4000 = formvalue.rdRitht4000 == "rightear4_y" ? "true" : "false";
    ormSave.ritht_ear_4000 = formvalue.rdRitht4000 == "rightear4_y" ? "1" : formvalue.rdRitht4000 == "rightear4_n" ? "0" : null;
    // if (formvalue.rdRitht4000 == "rightear4_y") {
    //   ormSave.ritht_ear_4000 = true;
    // }
    // else {
    //   ormSave.ritht_ear_4000 = false;
    // }
    //ormSave.left_ear_500 = formvalue.rdLeft500 == "leftear1_y" ? "true" : "false";
    ormSave.left_ear_500 = formvalue.rdLeft500 == "leftear1_y" ? "1" : formvalue.rdLeft500 == "leftear1_n" ? "0" : null;
    // if(formvalue.rdLeft500=="leftear1_y")
    // {
    //   ormSave.left_ear_500=true;
    // }
    // else
    // {
    //   ormSave.left_ear_500=false;
    // }
    //ormSave.left_ear_1000 = formvalue.rdLeft1000 == "leftear2_y" ? "true" : "false";
    ormSave.left_ear_1000 = formvalue.rdLeft1000 == "leftear2_y" ? "1" : formvalue.rdLeft1000 == "leftear2_n" ? "0" : null;
    // if(formvalue.rdLeft1000=="leftear2_y")
    // {
    //   ormSave.left_ear_1000=true;
    // }
    // else
    // {
    //   ormSave.left_ear_1000 = false;
    // }
    //ormSave.left_ear_2000 = formvalue.rdLeft2000 == "leftear3_y" ? "true" : "false";
    ormSave.left_ear_2000 = formvalue.rdLeft2000 == "leftear3_y" ? "1" : formvalue.rdLeft2000 == "leftear3_n" ? "0" : null;
    // if (formvalue.rdLeft2000 == "leftear3_y") {
    //   ormSave.left_ear_2000 = true;
    // }
    // else {
    //   ormSave.left_ear_2000 = false;
    // }
    //ormSave.left_ear_4000 = formvalue.rdLeft4000 == "leftear4_y" ? "true" : "false";
    ormSave.left_ear_4000 = formvalue.rdLeft4000 == "leftear4_y" ? "1" : formvalue.rdLeft4000 == "leftear4_n" ? "0" : null;
    // if (formvalue.rdLeft4000 == "leftear4_y") {
    //   ormSave.left_ear_4000 = true;
    // }
    // else {
    //   ormSave.left_ear_4000 = false;
    // }
    //ormSave.rapidflu = formvalue.rbRapidFlu == "RapidFlu_Positive" ? "true" : "false";
    debugger;
    ormSave.rapidflu = formvalue.rbRapidFlu == "RapidFlu_Positive" ? "1" : formvalue.rbRapidFlu == "RapidFlu_Negative" ? "0" : null;
    ormSave.ppd_test = formvalue.rbPPDTest == "PPDTest_Positive" ? "1" : formvalue.rbPPDTest == "PPDTest_Negative" ? "0" : null;
    // if (formvalue.rbRapidFlu == "RapidFlu_Positive") {
    //   ormSave.rapidflu = true;
    // } else {
    //   ormSave.rapidflu = false;
    // }
    ormSave.fasting = formvalue.txt_BGfasting;
    ormSave.random = formvalue.txt_BGrandom;
    ormSave.post_prandial = formvalue.txt_BGprandial;
    ormSave.ogtt_1 = formvalue.txt_txtOgtt1;
    ormSave.ogtt_2 = formvalue.txt_txtOgtt2;
    ormSave.ogtt_3 = formvalue.txt_txtOgtt3;
    ormSave.ogtt_4 = formvalue.txt_txtOgtt4;
    let OBGLMPDate = (this.ofcTestForm.get('txt_OBG_LMP') as FormControl).value;
    if (OBGLMPDate != "") {
      let OBG_LMP = this.dateTimeUtil.getStringDateFromDateModel(OBGLMPDate);
      ormSave.lmp = OBG_LMP;
    } else {
      ormSave.lmp = "";
    }
    ormSave.hp = '';
    //ormSave.pregnancy = formvalue.rbPregCondition == "pregnancy_Positive" ? "true" : "false";
    ormSave.pregnancy = formvalue.rbPregCondition == "pregnancy_Positive" ? "1" : formvalue.rbPregCondition == "pregnancy_Negative" ? "0" : null;
    // if (formvalue.rbPregCondition == "pregnancy_Positive") {
    //   ormSave.pregnancy = true;
    // }
    // else {
    //   ormSave.pregnancy = false;
    // }
    //ormSave.strip = formvalue.rbStrepCondition == "prag_strep_Positive" ? "true" : "false";
    ormSave.strip = formvalue.rbStrepCondition == "prag_strep_Positive" ? "1" : formvalue.rbStrepCondition == "prag_strep_Negative" ? "0" : null;
    // if (formvalue.rbStrepCondition == "prag_strep_Positive") {
    //   ormSave.strip = true;
    // }
    // else {
    //   ormSave.strip = false;
    // }
    ormSave.glucose = formvalue.txt_glucose;
    ormSave.bilirubin = formvalue.txt_bilirubin;
    ormSave.kenton = formvalue.txt_ketone;
    ormSave.sp_gravity = formvalue.txt_spgravity;
    ormSave.blood = formvalue.txt_blood;
    ormSave.ph = formvalue.txt_ph;
    ormSave.resp_rate = '';
    ormSave.protein = formvalue.txt_protein;
    ormSave.urobilinogen = formvalue.txt_urobilinogen;
    ormSave.spirometry = formvalue.txt_spirometryresult;
    ormSave.nitrate = formvalue.txt_nitrate;
    ormSave.leukoctes = formvalue.txt_leukocytes;
    ormSave.deleted = false;
    ormSave.hemoglobin = formvalue.txt_hemoglobin;
    ormSave.fluoride = formvalue.txt_fluoride;
    ormSave.lead_screening = formvalue.txt_loadscreening;
    ormSave.flu_ab = formvalue.txt_fluab;
    ormSave.rsv = formvalue.txt_rsv;
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
    // this.encounterService.saveOfficeTest(ormSave)
    //   .subscribe(
    //     data => {
    //       this.addEditView = false;
    //       this.getChartOfficeTest(this.objencounterToOpen.chart_id);
    //     },
    //     error => {
    //       this.showError("An error occured while saving Chart Office Test.");
    //     }
    //   );
  }
  saveCPTs() {
    if (this.acBillCptsResult == null || this.acBillCptsResult.length == 0)
      return;

    if ((this.ofcTestForm.get('txt_vision_left') as FormControl).value != "" || (this.ofcTestForm.get('txt_vision_right') as FormControl).value != "") {
      //Vision
      this.add_OfficeCpts("99173", "Vision");
    }

    if ((this.ofcTestForm.get('rdHearinglevel') as FormControl).value == "hearing_level_20" ||
      (this.ofcTestForm.get('rdHearinglevel') as FormControl).value == "hearing_level_25" ||
      (this.ofcTestForm.get('rdHearinglevel') as FormControl).value == "hearing_level_40" ||
      (this.ofcTestForm.get('rdRitht500') as FormControl).value == "rightear1_y" ||
      (this.ofcTestForm.get('rdRitht500') as FormControl).value == "rightear1_n" ||
      (this.ofcTestForm.get('rdLeft500') as FormControl).value == "rightear1_y" ||
      (this.ofcTestForm.get('rdLeft500') as FormControl).value == "rightear1_n" ||
      (this.ofcTestForm.get('rdRitht1000') as FormControl).value == "rightear2_y" ||
      (this.ofcTestForm.get('rdRitht1000') as FormControl).value == "rightear2_n" ||
      (this.ofcTestForm.get('rdLeft1000') as FormControl).value == "rightear2_y" ||
      (this.ofcTestForm.get('rdLeft1000') as FormControl).value == "rightear2_n" ||
      (this.ofcTestForm.get('rdRitht2000') as FormControl).value == "rightear3_y" ||
      (this.ofcTestForm.get('rdRitht2000') as FormControl).value == "rightear3_n" ||
      (this.ofcTestForm.get('rdLeft2000') as FormControl).value == "rightear3_y" ||
      (this.ofcTestForm.get('rdLeft2000') as FormControl).value == "rightear3_n" ||
      (this.ofcTestForm.get('rdRitht4000') as FormControl).value == "rightear4_y" ||
      (this.ofcTestForm.get('rdRitht4000') as FormControl).value == "rightear4_n" ||
      (this.ofcTestForm.get('rdLeft4000') as FormControl).value == "rightear4_y" ||
      (this.ofcTestForm.get('rdLeft4000') as FormControl).value == "rightear4_n") {
      //hearing
      this.add_OfficeCpts("92552", "Hearing");
    }
    if ((this.ofcTestForm.get('txt_BGfasting') as FormControl).value != "" ||
      (this.ofcTestForm.get('txt_BGrandom') as FormControl).value != "" ||
      (this.ofcTestForm.get('txt_BGprandial') as FormControl).value != "") {
      //blood gulicue
      this.add_OfficeCpts("82962", "Blood Glucose");
    }
    if ((this.ofcTestForm.get('txt_txtOgtt1') as FormControl).value != "" ||
      (this.ofcTestForm.get('txt_txtOgtt2') as FormControl).value != "" ||
      (this.ofcTestForm.get('txt_txtOgtt3') as FormControl).value != "" ||
      (this.ofcTestForm.get('txt_txtOgtt4') as FormControl).value != "") {
      //ogtt / gtt there is another 82950
      this.add_OfficeCpts("82947", "OGTT/GTT");
    }

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
    if ((this.ofcTestForm.get("txt_glucose") as FormControl).value != "" ||
      (this.ofcTestForm.get("txt_blood") as FormControl).value != "" ||
      (this.ofcTestForm.get("txt_nitrate") as FormControl).value != "" ||
      (this.ofcTestForm.get("txt_bilirubin") as FormControl).value != "" ||
      (this.ofcTestForm.get("txt_ph") as FormControl).value != "" ||
      (this.ofcTestForm.get("txt_leukocytes") as FormControl).value != "" ||
      (this.ofcTestForm.get("txt_ketone") as FormControl).value != "" ||
      (this.ofcTestForm.get("txt_protein") as FormControl).value != "" ||
      (this.ofcTestForm.get("txt_spgravity") as FormControl).value != "" ||
      (this.ofcTestForm.get("txt_urobilinogen") as FormControl).value != "") {
      // U/A
      this.add_OfficeCpts("81002", "U/A");
    }
    if ((this.ofcTestForm.get("rbPPDTest") as FormControl).value == "PPDTest_Positive" ||
    (this.ofcTestForm.get("rbPPDTest") as FormControl).value == "PPDTest_Negative") {
    //PPD Test
    this.add_OfficeCpts("86580", "PPD");
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

  checkUncheckRapidFlu(status) {
    if (status == "pos") {
      if ((this.ofcTestForm.get("rbRapidFlu") as FormControl).value == "RapidFlu_Positive") {
        (this.ofcTestForm.get('rbRapidFlu') as FormControl).setValue(false);
      }
    } else if (status == "neg") {
      if ((this.ofcTestForm.get("rbRapidFlu") as FormControl).value == "RapidFlu_Negative") {
        (this.ofcTestForm.get('rbRapidFlu') as FormControl).setValue(false);
      }
    }
    this.rdogeneralChange();
  }

  checkUncheckPPDTest(status) {
    if (status == "pos") {
      if ((this.ofcTestForm.get("rbPPDTest") as FormControl).value == "PPDTest_Positive") {
        (this.ofcTestForm.get('rbPPDTest') as FormControl).setValue(false);
      }
    } else if (status == "neg") {
      if ((this.ofcTestForm.get("rbPPDTest") as FormControl).value == "PPDTest_Negative") {
        (this.ofcTestForm.get('rbPPDTest') as FormControl).setValue(false);
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

  getOfficeTestHistory() {
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "office_test_log";
    logParameters.logDisplayName = "Office Test";
    logParameters.logMainTitle = "Office Test";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;

    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;

  }
  // getOfficeTestHistory() {
  //   const modalRef = this.modalService.open(ChartModuleHistoryComponent, this.logoutScreenOptions);
  //   this.obj_OfficeTesthistory = new chartmodulehistory();
  //   this.obj_OfficeTesthistory.titleString = "Office Test";
  //   this.obj_OfficeTesthistory.moduleName = "office_test_log";
  //   this.obj_OfficeTesthistory.criteria = " and po.chart_id = '" + this.objencounterToOpen.chart_id + "' ";
  //   modalRef.componentInstance.data = this.obj_OfficeTesthistory;
  //   let closeResult;
  //   modalRef.result.then((result) => {
  //     if (result == true) {
  //     }
  //   }
  //     , (reason) => {
  //     });
  // }

  onrefresh(){
    if (this.canView)
    this.getChartOfficeTest(this.objencounterToOpen.chart_id);    
  }
}
