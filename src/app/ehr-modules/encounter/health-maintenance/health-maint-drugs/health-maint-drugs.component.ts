import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
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
  selector: 'health-maint-drugs',
  templateUrl: './health-maint-drugs.component.html',
  styleUrls: ['./health-maint-drugs.component.css']
})
export class HealthMaintDrugsComponent implements OnInit {
  inputForm: FormGroup;
  @Input() objencounterToOpen: EncounterToOpen;
  @Input() lstTest;
  @Input() objSelectedMain;
  @Input() editOperation;
  @Output() dataUpdated = new EventEmitter<any>();
  listSaveTest: Array<ORM_HealthMaintenanceDetail> = [];
  constructor(private encounterService: EncounterService,private modalService: NgbModal,
    private logMessage: LogMessage, @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {
    this.buildForm();
    if (this.editOperation != "New") {
      this.assignValues();
    }
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtAmphetaminesComplDate: this.formBuilder.control("", Validators.required),
      txtAmphetaminesDueDate: this.formBuilder.control("", Validators.required),
      chkAmphetaminesPos: this.formBuilder.control(false, Validators.required),
      //chkAmphetaminesNeg: this.formBuilder.control(false, Validators.required),
      txtAmphetaminesComments: this.formBuilder.control("", Validators.required),

      txtBarbiturateComplDate: this.formBuilder.control("", Validators.required),
      txtBarbiturateDueDate: this.formBuilder.control("", Validators.required),
      chkBarbituratePos: this.formBuilder.control("", Validators.required),
      //chkBarbiturateNeg: this.formBuilder.control("", Validators.required),
      txtBarbiturateComments: this.formBuilder.control("", Validators.required),

      txtBenzodiazepineComplDate: this.formBuilder.control("", Validators.required),
      txtBenzodiazepineDueDate: this.formBuilder.control("", Validators.required),
      chkBenzodiazepinePos: this.formBuilder.control("", Validators.required),
      //chkBenzodiazepineNeg: this.formBuilder.control("", Validators.required),
      txtBenzodiazepineComments: this.formBuilder.control("", Validators.required),

      txtCocaineComplDate: this.formBuilder.control("", Validators.required),
      txtCocaineDueDate: this.formBuilder.control("", Validators.required),
      chkCocainePos: this.formBuilder.control("", Validators.required),
      //chkCocaineNeg: this.formBuilder.control("", Validators.required),
      txtCocaineComments: this.formBuilder.control("", Validators.required),

      txtEcstasyComplDate: this.formBuilder.control("", Validators.required),
      txtEcstasyDueDate: this.formBuilder.control("", Validators.required),
      chkEcstasyPos: this.formBuilder.control("", Validators.required),
      //chkEcstasyNeg: this.formBuilder.control("", Validators.required),
      txtEcstasyComments: this.formBuilder.control("", Validators.required),

      txtMarijuanaComplDate: this.formBuilder.control("", Validators.required),
      txtMarijuanaDueDate: this.formBuilder.control("", Validators.required),
      chkMarijuanaPos: this.formBuilder.control("", Validators.required),
      //chkMarijuanaNeg: this.formBuilder.control("", Validators.required),
      txtMarijuanaComments: this.formBuilder.control("", Validators.required),

      txtMethadoneComplDate: this.formBuilder.control("", Validators.required),
      txtMethadoneDueDate: this.formBuilder.control("", Validators.required),
      chkMethadonePos: this.formBuilder.control("", Validators.required),
      //chkMethadoneNeg: this.formBuilder.control("", Validators.required),
      txtMethadoneComments: this.formBuilder.control("", Validators.required),

      txtMethamphetamineComplDate: this.formBuilder.control("", Validators.required),
      txtMethamphetamineDueDate: this.formBuilder.control("", Validators.required),
      chkMethamphetaminePos: this.formBuilder.control("", Validators.required),
      //chkMethamphetamineNeg: this.formBuilder.control("", Validators.required),
      txtMethamphetamineComments: this.formBuilder.control("", Validators.required),


      txtOpiatesComplDate: this.formBuilder.control("", Validators.required),
      txtOpiatesDueDate: this.formBuilder.control("", Validators.required),
      chkOpiatesPos: this.formBuilder.control("", Validators.required),
      //chkOpiatesNeg: this.formBuilder.control("", Validators.required),
      txtOpiatesComments: this.formBuilder.control("", Validators.required),

      txtOxycodoneComplDate: this.formBuilder.control("", Validators.required),
      txtOxycodoneDueDate: this.formBuilder.control("", Validators.required),
      chkOxycodonePos: this.formBuilder.control("", Validators.required),
      //chkOxycodoneNeg: this.formBuilder.control("", Validators.required),
      txtOxycodoneComments: this.formBuilder.control("", Validators.required),

      txtPhencyclidineComplDate: this.formBuilder.control("", Validators.required),
      txtPhencyclidineDueDate: this.formBuilder.control("", Validators.required),
      chkPhencyclidinePos: this.formBuilder.control("", Validators.required),
      //chkPhencyclidineNeg: this.formBuilder.control("", Validators.required),
      txtPhencyclidineComments: this.formBuilder.control("", Validators.required),

      txtPropoxypheneComplDate: this.formBuilder.control("", Validators.required),
      txtPropoxypheneDueDate: this.formBuilder.control("", Validators.required),
      chkPropoxyphenePos: this.formBuilder.control("", Validators.required),
      //chkPropoxypheneNeg: this.formBuilder.control("", Validators.required),
      txtPropoxypheneComments: this.formBuilder.control("", Validators.required),


      txtTricyclicComplDate: this.formBuilder.control("", Validators.required),
      txtTricyclicDueDate: this.formBuilder.control("", Validators.required),
      chkTricyclicPos: this.formBuilder.control("", Validators.required),
      //chkTricyclicNeg: this.formBuilder.control("", Validators.required),
      txtTricyclicComments: this.formBuilder.control("", Validators.required),

      txtBupComplDate: this.formBuilder.control("", Validators.required),
      txtBupDueDate: this.formBuilder.control("", Validators.required),
      chkBupPos: this.formBuilder.control("", Validators.required),
      //chkBupNeg: this.formBuilder.control("", Validators.required),
      txtBupComments: this.formBuilder.control("", Validators.required),


      txtCreatinineComplDate: this.formBuilder.control("", Validators.required),
      txtCreatinineDueDate: this.formBuilder.control("", Validators.required),
      chkCreatininePos: this.formBuilder.control("", Validators.required),
      //chkCreatinineNeg: this.formBuilder.control("", Validators.required),
      txtCreatinineComments: this.formBuilder.control("", Validators.required),

      txtGlutaraldehydeComplDate: this.formBuilder.control("", Validators.required),
      txtGlutaraldehydeDueDate: this.formBuilder.control("", Validators.required),
      chkGlutaraldehydePos: this.formBuilder.control("", Validators.required),
      //chkGlutaraldehydeNeg: this.formBuilder.control("", Validators.required),
      txtGlutaraldehydeComments: this.formBuilder.control("", Validators.required),

      txtNitritesComplDate: this.formBuilder.control("", Validators.required),
      txtNitritesDueDate: this.formBuilder.control("", Validators.required),
      chkNitritesPos: this.formBuilder.control("", Validators.required),
      //chkNitritesNeg: this.formBuilder.control("", Validators.required),
      txtNitritesComments: this.formBuilder.control("", Validators.required),

      txtOxidantsComplDate: this.formBuilder.control("", Validators.required),
      txtOxidantsDueDate: this.formBuilder.control("", Validators.required),
      chkOxidantsPos: this.formBuilder.control("", Validators.required),
      //chkOxidantsNeg: this.formBuilder.control("", Validators.required),
      txtOxidantsComments: this.formBuilder.control("", Validators.required),

      txtPHComplDate: this.formBuilder.control("", Validators.required),
      txtPHDueDate: this.formBuilder.control("", Validators.required),
      chkPHPos: this.formBuilder.control("", Validators.required),
      //chkPHNeg: this.formBuilder.control("", Validators.required),
      txtPHComments: this.formBuilder.control("", Validators.required),

      txtSpecificGravityComplDate: this.formBuilder.control("", Validators.required),
      txtSpecificGravityDueDate: this.formBuilder.control("", Validators.required),
      chkSpecificGravityPos: this.formBuilder.control("", Validators.required),
      //chkSpecificGravityNeg: this.formBuilder.control("", Validators.required),
      txtSpecificGravityComments: this.formBuilder.control("", Validators.required)
    })
  }
  assignValues() {
    debugger;
    for (let i = 0; i < this.lstTest.length; i++) {
      switch (this.lstTest[i].test_name) {
        case "Amphetamines (AMP)":
          (this.inputForm.get("txtAmphetaminesComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtAmphetaminesDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkAmphetaminesPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkAmphetaminesPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkAmphetaminesPos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkAmphetaminesNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtAmphetaminesComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Barbiturate (BAR)":
          (this.inputForm.get("txtBarbiturateComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtBarbiturateDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkBarbituratePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkBarbituratePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkBarbituratePos") as FormControl).setValue("Negative");
          }
         // (this.inputForm.get("chkBarbiturateNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtBarbiturateComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Benzodiazepine (BZO)":
          (this.inputForm.get("txtBenzodiazepineComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtBenzodiazepineDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkBenzodiazepinePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkBenzodiazepinePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkBenzodiazepinePos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkBenzodiazepineNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtBenzodiazepineComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Cocaine (COC)":
          (this.inputForm.get("txtCocaineComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtCocaineDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkCocainePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkCocainePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkCocainePos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkCocaineNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtCocaineComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Ecstasy (MDMA)":
          (this.inputForm.get("txtEcstasyComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtEcstasyDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkEcstasyPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkEcstasyPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkEcstasyPos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkEcstasyNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtEcstasyComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Marijuana (THC)":
          (this.inputForm.get("txtMarijuanaComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtMarijuanaDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkMarijuanaPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkMarijuanaPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkMarijuanaPos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkMarijuanaNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtMarijuanaComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Methadone (MTD)":
          (this.inputForm.get("txtMethadoneComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtMethadoneDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkMethadonePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkMethadonePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkMethadonePos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkMethadoneNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtMethadoneComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Methamphetamine (MET)":
          (this.inputForm.get("txtMethamphetamineComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtMethamphetamineDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkMethamphetaminePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkMethamphetaminePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkMethamphetaminePos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkMethamphetamineNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtMethamphetamineComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Opiates (OPI)":
          (this.inputForm.get("txtOpiatesComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtOpiatesDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkOpiatesPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkOpiatesPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkOpiatesPos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkOpiatesNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtOpiatesComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Oxycodone (OXY)":
          (this.inputForm.get("txtOxycodoneComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtOxycodoneDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkOxycodonePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkOxycodonePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkOxycodonePos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkOxycodoneNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtOxycodoneComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Phencyclidine (PCP)":
          (this.inputForm.get("txtPhencyclidineComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtPhencyclidineDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkPhencyclidinePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkPhencyclidinePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkPhencyclidinePos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkPhencyclidineNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtPhencyclidineComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Propoxyphene (PPX)":
          (this.inputForm.get("txtPropoxypheneComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtPropoxypheneDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkPropoxyphenePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkPropoxyphenePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkPropoxyphenePos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkPropoxypheneNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtPropoxypheneComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Tricyclic Antidepressants (TCA)":
          (this.inputForm.get("txtTricyclicComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtTricyclicDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkTricyclicPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkTricyclicPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkTricyclicPos") as FormControl).setValue("Negative");
          }
         // (this.inputForm.get("chkTricyclicNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtTricyclicComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Bup (BUP)":
          (this.inputForm.get("txtBupComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtBupDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkBupPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkBupPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkBupPos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkBupNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtBupComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Creatinine":
          (this.inputForm.get("txtCreatinineComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtCreatinineDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkCreatininePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkCreatininePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkCreatininePos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkCreatinineNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtCreatinineComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Glutaraldehyde":
          (this.inputForm.get("txtGlutaraldehydeComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtGlutaraldehydeDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkGlutaraldehydePos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkGlutaraldehydePos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkGlutaraldehydePos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkGlutaraldehydeNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtGlutaraldehydeComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Nitrites":
          (this.inputForm.get("txtNitritesComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtNitritesDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkNitritesPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkNitritesPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkNitritesPos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkNitritesNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtNitritesComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Oxidants":
          (this.inputForm.get("txtOxidantsComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtOxidantsDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkOxidantsPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkOxidantsPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkOxidantsPos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkOxidantsNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtOxidantsComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "PH":
          (this.inputForm.get("txtPHComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtPHDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkPHPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkPHPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkPHPos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkPHNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtPHComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
        case "Specific Gravity":
          (this.inputForm.get("txtSpecificGravityComplDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          (this.inputForm.get("txtSpecificGravityDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstTest[i].due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
          //(this.inputForm.get("chkSpecificGravityPos") as FormControl).setValue(this.lstTest[i].refusal == '1' ? true : false);
          if (this.lstTest[i].refusal == true) {
            (this.inputForm.get("chkSpecificGravityPos") as FormControl).setValue("Positive");
          }
          else if (this.lstTest[i].refusal == false) {
            (this.inputForm.get("chkSpecificGravityPos") as FormControl).setValue("Negative");
          }
          //(this.inputForm.get("chkSpecificGravityNeg") as FormControl).setValue(this.lstTest[i].refusal == '0' ? true : false);
          (this.inputForm.get("txtSpecificGravityComments") as FormControl).setValue(this.lstTest[i].test_value);
          break;
      }
    }
  }
  onSave(formValue) {
    debugger;
    if (formValue.txtAmphetaminesComplDate != undefined && formValue.txtAmphetaminesComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtAmphetaminesComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Amphetamines Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtAmphetaminesDueDate != undefined && formValue.txtAmphetaminesDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtAmphetaminesDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Amphetamines Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtBarbiturateComplDate != undefined && formValue.txtBarbiturateComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtBarbiturateComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Barbiturate Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtBarbiturateDueDate != undefined && formValue.txtBarbiturateDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtBarbiturateDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Barbiturate Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtBenzodiazepineComplDate != undefined && formValue.txtBenzodiazepineComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtBenzodiazepineComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Benzodiazepine Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtBenzodiazepineDueDate != undefined && formValue.txtBenzodiazepineDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtBenzodiazepineDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Benzodiazepine Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtCocaineComplDate != undefined && formValue.txtCocaineComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtCocaineComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Cocaine Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtCocaineDueDate != undefined && formValue.txtCocaineDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtCocaineDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Cocaine Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtEcstasyComplDate != undefined && formValue.txtEcstasyComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtEcstasyComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Ecstasy Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtEcstasyDueDate != undefined && formValue.txtEcstasyDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtEcstasyDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Ecstasy Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtMarijuanaComplDate != undefined && formValue.txtMarijuanaComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtMarijuanaComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Marijuana Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtMarijuanaDueDate != undefined && formValue.txtMarijuanaDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtMarijuanaDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Marijuana Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtMethadoneComplDate != undefined && formValue.txtMethadoneComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtMethadoneComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Methadone Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtMethadoneDueDate != undefined && formValue.txtMethadoneDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtMethadoneDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Methadone Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtMethamphetamineComplDate != undefined && formValue.txtMethamphetamineComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtMethamphetamineComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Methamphetamine Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtMethamphetamineDueDate != undefined && formValue.txtMethamphetamineDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtMethamphetamineDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Methamphetamine Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtOpiatesComplDate != undefined && formValue.txtOpiatesComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtOpiatesComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Opiates Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtOpiatesDueDate != undefined && formValue.txtOpiatesDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtOpiatesDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Opiates Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtOxycodoneComplDate != undefined && formValue.txtOxycodoneComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtOxycodoneComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Oxycodone Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtOxycodoneDueDate != undefined && formValue.txtOxycodoneDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtOxycodoneDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Oxycodone Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtPhencyclidineComplDate != undefined && formValue.txtPhencyclidineComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtPhencyclidineComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Phencyclidine Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtPhencyclidineDueDate != undefined && formValue.txtPhencyclidineDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtPhencyclidineDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Phencyclidine Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtPropoxypheneComplDate != undefined && formValue.txtPropoxypheneComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtPropoxypheneComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Propoxyphene Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtPropoxypheneDueDate != undefined && formValue.txtPropoxypheneDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtPropoxypheneDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Propoxyphene Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtTricyclicComplDate != undefined && formValue.txtTricyclicComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtTricyclicComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Tricyclic Antidepressants Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtTricyclicDueDate != undefined && formValue.txtTricyclicDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtTricyclicDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Tricyclic Antidepressants Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtBupComplDate != undefined && formValue.txtBupComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtBupComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Bup Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtBupDueDate != undefined && formValue.txtBupDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtBupDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Bup Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtCreatinineComplDate != undefined && formValue.txtCreatinineComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtCreatinineComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Creatinine Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtCreatinineDueDate != undefined && formValue.txtCreatinineDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtCreatinineDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Creatinine Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtGlutaraldehydeComplDate != undefined && formValue.txtGlutaraldehydeComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtGlutaraldehydeComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Glutaraldehyde Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtGlutaraldehydeDueDate != undefined && formValue.txtGlutaraldehydeDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtGlutaraldehydeDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Glutaraldehyde Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtNitritesComplDate != undefined && formValue.txtNitritesComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtNitritesComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Nitrites Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtNitritesDueDate != undefined && formValue.txtNitritesDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtNitritesDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Nitrites Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtOxidantsComplDate != undefined && formValue.txtOxidantsComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtOxidantsComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Oxidants Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtOxidantsDueDate != undefined && formValue.txtOxidantsDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtOxidantsDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Oxidants Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtPHComplDate != undefined && formValue.txtPHComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtPHComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PH Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtPHDueDate != undefined && formValue.txtPHDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtPHDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "PH Due Date is not in correct formate.", 'warning');
      return;
    }
    //
    if (formValue.txtSpecificGravityComplDate != undefined && formValue.txtSpecificGravityComplDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtSpecificGravityComplDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Specific Gravity Complete Date is not in correct formate.", 'warning');
      return;
    }
    if (formValue.txtSpecificGravityDueDate != undefined && formValue.txtSpecificGravityDueDate != ''
      && !this.dateTimeUtil.isValidDateTime(formValue.txtSpecificGravityDueDate, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Validation', "Specific Gravity Due Date is not in correct formate.", 'warning');
      return;
    }
    if (this.listSaveTest == undefined || this.listSaveTest!=null)
      this.listSaveTest = new Array();

    if (formValue.txtAmphetaminesComplDate != '' || formValue.txtAmphetaminesDueDate != '' || formValue.chkAmphetaminesPos != '' || formValue.txtAmphetaminesComments !='') {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Amphetamines (AMP)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtAmphetaminesComplDate == "" ? undefined : formValue.txtAmphetaminesComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtAmphetaminesDueDate == "" ? undefined : formValue.txtAmphetaminesDueDate);
      ormSave.test_value = formValue.txtAmphetaminesComments;
      ormSave.refusal = formValue.chkAmphetaminesPos == "Positive" ? true : formValue.chkAmphetaminesPos == "Negative" ? false : null; //formValue.chkAmphetaminesPos == true ? true : formValue.chkAmphetaminesNeg == true ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Amphetamines (AMP)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    //if (formValue.txtBarbiturateComplDate != '' || formValue.txtBarbiturateDueDate != '' || formValue.chkBarbituratePos != '' || formValue.txtBarbiturateComments == true) {
    if(formValue.txtBarbiturateComplDate!='' || formValue.txtBarbiturateDueDate!='' || formValue.txtBarbiturateComments!='' || formValue.chkBarbituratePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Barbiturate (BAR)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtBarbiturateComplDate == "" ? undefined : formValue.txtBarbiturateComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtBarbiturateDueDate == "" ? undefined : formValue.txtBarbiturateDueDate);
      ormSave.test_value = formValue.txtBarbiturateComments;
      ormSave.refusal = formValue.chkBarbituratePos == "Positive" ? true : formValue.chkBarbituratePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Barbiturate (BAR)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    //if (formValue.txtBenzodiazepineComplDate != '' || formValue.txtBenzodiazepineDueDate != '' || formValue.chkBenzodiazepinePos != '' || formValue.txtBenzodiazepineComments == true) {
    if(formValue.txtBenzodiazepineComplDate!='' || formValue.txtBenzodiazepineDueDate!='' || formValue.txtBenzodiazepineComments!='' || formValue.chkBenzodiazepinePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Benzodiazepine (BZO)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtBenzodiazepineComplDate == "" ? undefined : formValue.txtBenzodiazepineComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtBenzodiazepineDueDate == "" ? undefined : formValue.txtBenzodiazepineDueDate);
      ormSave.test_value = formValue.txtBenzodiazepineComments;
      ormSave.refusal = formValue.chkBenzodiazepinePos == "Positive" ? true : formValue.chkBenzodiazepinePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Benzodiazepine (BZO)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }


    //if (formValue.txtCocaineComplDate != '' || formValue.txtCocaineDueDate != '' || formValue.chkCocainePos != '' || formValue.txtCocaineComments == true) {
    if(formValue.txtCocaineComplDate!='' || formValue.txtCocaineDueDate!='' || formValue.txtCocaineComments!='' || formValue.chkCocainePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Cocaine (COC)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtCocaineComplDate == "" ? undefined : formValue.txtCocaineComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtCocaineDueDate == "" ? undefined : formValue.txtCocaineDueDate);
      ormSave.test_value = formValue.txtCocaineComments;
      ormSave.refusal = formValue.chkCocainePos == "Positive" ? true : formValue.chkCocainePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Cocaine (COC)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }


    //if (formValue.txtEcstasyComplDate != '' || formValue.txtEcstasyDueDate != '' || formValue.chkEcstasyPos != '' || formValue.txtEcstasyComments == true) {
    if(formValue.txtEcstasyComplDate!='' || formValue.txtEcstasyDueDate!='' || formValue.txtEcstasyComments!='' || formValue.chkEcstasyPos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Ecstasy (MDMA)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtEcstasyComplDate == "" ? undefined : formValue.txtEcstasyComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtEcstasyDueDate == "" ? undefined : formValue.txtEcstasyDueDate);
      ormSave.test_value = formValue.txtEcstasyComments;
      ormSave.refusal = formValue.chkEcstasyPos == "Positive" ? true : formValue.chkEcstasyPos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Ecstasy (MDMA)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    //if (formValue.txtMarijuanaComplDate != '' || formValue.txtMarijuanaDueDate != '' || formValue.chkMarijuanaPos != '' || formValue.txtMarijuanaComments == true) {
    if(formValue.txtMarijuanaComplDate!='' || formValue.txtMarijuanaDueDate!='' || formValue.txtMarijuanaComments!='' || formValue.chkMarijuanaPos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Marijuana (THC)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtMarijuanaComplDate == "" ? undefined : formValue.txtMarijuanaComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtMarijuanaDueDate == "" ? undefined : formValue.txtMarijuanaDueDate);
      ormSave.test_value = formValue.txtMarijuanaComments;
      ormSave.refusal = formValue.chkMarijuanaPos == "Positive" ? true : formValue.chkMarijuanaPos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Marijuana (THC)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }


    //if (formValue.txtMethadoneComplDate != '' || formValue.txtMethadoneDueDate != '' || formValue.chkMethadonePos != '' || formValue.txtMethadoneComments == true) {
    if(formValue.txtMethadoneComplDate!='' || formValue.txtMethadoneDueDate!='' || formValue.txtMethadoneComments!='' || formValue.chkMethadonePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Methadone (MTD)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtMethadoneComplDate == "" ? undefined : formValue.txtMethadoneComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtMethadoneDueDate == "" ? undefined : formValue.txtMethadoneDueDate);
      ormSave.test_value = formValue.txtMethadoneComments;
      ormSave.refusal = formValue.chkMethadonePos == "Positive" ? true : formValue.chkMethadonePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Methadone (MTD)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    //if (formValue.txtMethamphetamineComplDate != '' || formValue.txtMethamphetamineDueDate != '' || formValue.chkMethamphetaminePos != '' || formValue.txtMethamphetamineComments == true) {
      if(formValue.txtMethamphetamineComplDate!='' || formValue.txtMethamphetamineDueDate!='' || formValue.txtMethamphetamineComments!='' || formValue.chkMethamphetaminePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Methamphetamine (MET)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtMethamphetamineComplDate == "" ? undefined : formValue.txtMethamphetamineComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtMethamphetamineDueDate == "" ? undefined : formValue.txtMethamphetamineDueDate);
      ormSave.test_value = formValue.txtMethamphetamineComments;
      ormSave.refusal = formValue.chkMethamphetaminePos == "Positive" ? true : formValue.chkMethamphetaminePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Methamphetamine (MET)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    //if (formValue.txtOpiatesComplDate != '' || formValue.txtOpiatesDueDate != '' || formValue.chkOpiatesPos != '' || formValue.txtOpiatesComments == true) {
    if(formValue.txtOpiatesComplDate!='' || formValue.txtOpiatesDueDate!='' || formValue.txtOpiatesComments!='' || formValue.chkOpiatesPos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Opiates (OPI)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtOpiatesComplDate == "" ? undefined : formValue.txtOpiatesComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtOpiatesDueDate == "" ? undefined : formValue.txtOpiatesDueDate);
      ormSave.test_value = formValue.txtOpiatesComments;
      ormSave.refusal = formValue.chkOpiatesPos == "Positive" ? true : formValue.chkOpiatesPos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Opiates (OPI)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }



    //if (formValue.txtOxycodoneComplDate != '' || formValue.txtOxycodoneDueDate != '' || formValue.chkOxycodonePos != '' || formValue.txtOxycodoneComments == true) {
    if(formValue.txtOxycodoneComplDate!='' || formValue.txtOxycodoneDueDate!='' || formValue.txtOxycodoneComments!='' || formValue.chkOxycodonePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Oxycodone (OXY)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtOxycodoneComplDate == "" ? undefined : formValue.txtOxycodoneComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtOxycodoneDueDate == "" ? undefined : formValue.txtOxycodoneDueDate);
      ormSave.test_value = formValue.txtOxycodoneComments;
      ormSave.refusal = formValue.chkOxycodonePos == "Positive" ? true : formValue.chkOxycodonePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Oxycodone (OXY)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }




    //if (formValue.txtPhencyclidineComplDate != '' || formValue.txtPhencyclidineDueDate != '' || formValue.chkPhencyclidinePos != '' || formValue.txtPhencyclidineComments == true) {
    if(formValue.txtPhencyclidineComplDate!='' || formValue.txtPhencyclidineDueDate!='' || formValue.txtPhencyclidineComments!='' || formValue.chkPhencyclidinePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Phencyclidine (PCP)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPhencyclidineComplDate == "" ? undefined : formValue.txtPhencyclidineComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPhencyclidineDueDate == "" ? undefined : formValue.txtPhencyclidineDueDate);
      ormSave.test_value = formValue.txtPhencyclidineComments;
      ormSave.refusal = formValue.chkPhencyclidinePos == "Positive" ? true : formValue.chkPhencyclidinePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Phencyclidine (PCP)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }




    //if (formValue.txtPropoxypheneComplDate != '' || formValue.txtPropoxypheneDueDate != '' || formValue.chkPropoxyphenePos != '' || formValue.txtPropoxypheneComments == true) {
    if(formValue.txtPropoxypheneComplDate!='' || formValue.txtPropoxypheneDueDate!='' || formValue.txtPropoxypheneComments!='' || formValue.chkPropoxyphenePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Propoxyphene (PPX)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPropoxypheneComplDate == "" ? undefined : formValue.txtPropoxypheneComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPropoxypheneDueDate == "" ? undefined : formValue.txtPropoxypheneDueDate);
      ormSave.test_value = formValue.txtPropoxypheneComments;
      ormSave.refusal = formValue.chkPropoxyphenePos == "Positive" ? true : formValue.chkPropoxyphenePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Propoxyphene (PPX)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }




    //if (formValue.txtTricyclicComplDate != '' || formValue.txtTricyclicDueDate != '' || formValue.chkTricyclicPos != '' || formValue.txtTricyclicComments == true) {
    if(formValue.txtTricyclicComplDate!='' || formValue.txtTricyclicDueDate!='' || formValue.txtTricyclicComments!='' || formValue.chkTricyclicPos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Tricyclic Antidepressants (TCA)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtTricyclicComplDate == "" ? undefined : formValue.txtTricyclicComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtTricyclicDueDate == "" ? undefined : formValue.txtTricyclicDueDate);
      ormSave.test_value = formValue.txtTricyclicComments;
      ormSave.refusal = formValue.chkTricyclicPos == "Positive" ? true : formValue.chkTricyclicPos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Tricyclic Antidepressants (TCA)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }




    //if (formValue.txtBupComplDate != '' || formValue.txtBupDueDate != '' || formValue.chkBupPos != '' || formValue.txtBupComments == true) {
    if(formValue.txtBupComplDate!='' || formValue.txtBupDueDate!='' || formValue.txtBupComments!='' || formValue.chkBupPos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Bup (BUP)';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtBupComplDate == "" ? undefined : formValue.txtBupComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtBupDueDate == "" ? undefined : formValue.txtBupDueDate);
      ormSave.test_value = formValue.txtBupComments;
      ormSave.refusal = formValue.chkBupPos == "Positive" ? true : formValue.chkBupPos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Bup (BUP)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }


    //Adulterant

    //if (formValue.txtCreatinineComplDate != '' || formValue.txtCreatinineDueDate != '' || formValue.chkCreatininePos != '' || formValue.txtCreatinineComments == true) {
    if(formValue.txtCreatinineComplDate!='' || formValue.txtCreatinineDueDate!='' || formValue.txtCreatinineComments!='' || formValue.chkCreatininePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Creatinine';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtCreatinineComplDate == "" ? undefined : formValue.txtCreatinineComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtCreatinineDueDate == "" ? undefined : formValue.txtCreatinineDueDate);
      ormSave.test_value = formValue.txtCreatinineComments;
      ormSave.refusal = formValue.chkCreatininePos == "Positive" ? true : formValue.chkCreatininePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Creatinine');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    //if (formValue.txtGlutaraldehydeComplDate != '' || formValue.txtGlutaraldehydeDueDate != '' || formValue.chkGlutaraldehydePos != '' || formValue.txtGlutaraldehydeComments == true) {
    if(formValue.txtGlutaraldehydeComplDate!='' || formValue.txtGlutaraldehydeDueDate!='' || formValue.txtGlutaraldehydeComments!='' || formValue.chkGlutaraldehydePos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Glutaraldehyde';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtGlutaraldehydeComplDate == "" ? undefined : formValue.txtGlutaraldehydeComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtGlutaraldehydeDueDate == "" ? undefined : formValue.txtGlutaraldehydeDueDate);
      ormSave.test_value = formValue.txtGlutaraldehydeComments;
      ormSave.refusal = formValue.chkGlutaraldehydePos == "Positive" ? true : formValue.chkGlutaraldehydePos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Glutaraldehyde');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    //if (formValue.txtNitritesComplDate != '' || formValue.txtNitritesDueDate != '' || formValue.chkNitritesPos != '' || formValue.txtNitritesComments == true) {
    if(formValue.txtNitritesComplDate!='' || formValue.txtNitritesDueDate!='' || formValue.txtNitritesComments!='' || formValue.chkNitritesPos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Nitrites';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtNitritesComplDate == "" ? undefined : formValue.txtNitritesComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtNitritesDueDate == "" ? undefined : formValue.txtNitritesDueDate);
      ormSave.test_value = formValue.txtNitritesComments;
      ormSave.refusal = formValue.chkNitritesPos == "Positive" ? true : formValue.chkNitritesPos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Nitrites');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

   // if (formValue.txtOxidantsComplDate != '' || formValue.txtOxidantsDueDate != '' || formValue.chkOxidantsPos != '' || formValue.txtOxidantsComments == true) {
    if(formValue.txtOxidantsComplDate!='' || formValue.txtOxidantsDueDate!='' || formValue.txtOxidantsComments!='' || formValue.chkOxidantsPos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Oxidants';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtOxidantsComplDate == "" ? undefined : formValue.txtOxidantsComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtOxidantsDueDate == "" ? undefined : formValue.txtOxidantsDueDate);
      ormSave.test_value = formValue.txtOxidantsComments;
      ormSave.refusal = formValue.chkOxidantsPos == "Positive" ? true : formValue.chkOxidantsPos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Oxidants');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    //if (formValue.txtPHComplDate != '' || formValue.txtPHDueDate != '' || formValue.chkPHPos != '' || formValue.txtPHComments == true) {
      if(formValue.txtPHComplDate!='' || formValue.txtPHDueDate!='' || formValue.txtPHComments!='' || formValue.chkPHPos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'PH';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPHComplDate == "" ? undefined : formValue.txtPHComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtPHDueDate == "" ? undefined : formValue.txtPHDueDate);
      ormSave.test_value = formValue.txtPHComments;
      ormSave.refusal = formValue.chkPHPos == "Positive" ? true : formValue.chkPHPos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'PH');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    //if (formValue.txtSpecificGravityComplDate != '' || formValue.txtSpecificGravityDueDate != '' || formValue.chkSpecificGravityPos != '' || formValue.txtSpecificGravityComments == true) {
    if(formValue.txtSpecificGravityComplDate!='' || formValue.txtSpecificGravityDueDate!='' || formValue.txtSpecificGravityComments!='' || formValue.chkSpecificGravityPos!=''){
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'Drugs';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = 'Specific Gravity';
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtSpecificGravityComplDate == "" ? undefined : formValue.txtSpecificGravityComplDate);
      ormSave.due_date = this.dateTimeUtil.getStringDateFromDateModel(formValue.txtSpecificGravityDueDate == "" ? undefined : formValue.txtSpecificGravityDueDate);
      ormSave.test_value = formValue.txtSpecificGravityComments;
      ormSave.refusal = formValue.chkSpecificGravityPos == "Positive" ? true : formValue.chkSpecificGravityPos == "Negative" ? false : null;

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

      let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Bup (BUP)');

      if (filterTest != null && filterTest.length > 0)
        ormSave.detail_id = filterTest[0].detail_id;

      this.listSaveTest.push(ormSave);
    }

    if (this.listSaveTest.length > 0)
      this.onSendSaveCall();
  }
  onSendSaveCall() {
    debugger;
    if (this.editOperation == "New") {
    }
    else {

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
