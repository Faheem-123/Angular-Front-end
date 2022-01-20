import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { LogMessage } from '../../../shared/log-message';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ChartModuleHistoryComponent } from './../../../general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from './../../../models/encounter/chartmodulehistory';
import { ORMChartVitals } from './../../../models/encounter/orm-chart-vitals';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { VitalsUnitEnum, VitalsUnitConversionEnum, ServiceResponseStatusEnum, AlertTypeEnum, CallingFromEnum, RegExEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { LogParameters } from '../../log/log-parameters';


@Component({
  selector: 'vitals',
  templateUrl: './vitals.component.html',
  styleUrls: ['./vitals.component.css']
})
export class VitalsComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  vitalsForm: FormGroup;
  formBuildDone: boolean = false;


  vitalUnit: VitalsUnitEnum = VitalsUnitEnum.US_CUSTOMARY;//"us_customary";

  canView: boolean = false;
  canAddEdit: boolean = false;
  canViewQuickVital:boolean=false;
  isCumulativeVitals: boolean = false;
  addEditView: boolean = false;
  noRecordFound: boolean = true;

  lastModifiedMsg: string;

  chartVital: any;
  lstQuickVitals: Array<any>;

  //*****
  height_feet: string;
  height_inc: string;
  height_cm: string;
  weight_lbs: string;
  weight_ozs: string;
  weight_kg: string;
  weight_grm: string;
  BMI: string;

  bmi_cateogry_description: string;
  bmi_category_criteria: string;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private encounterService: EncounterService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage,
    private ngbModal: NgbModal) {

    this.canView = this.lookupList.UserRights.ViewVitalSigns;
    this.canAddEdit = this.lookupList.UserRights.AddModifyVitalSign;
    this.canViewQuickVital =this.lookupList.UserRights.QuickVitalDefault;
  }

  personalInfoHeight: number;
  ngOnInit() {
    debugger;
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      
    if (this.canView) {

      this.getChartVital();

      if (this.lookupList.UserRights.QuickVitalDefault) {
        this.isCumulativeVitals = true;
        this.getCumulativeData();

      }
      else {
        this.isCumulativeVitals = false;
      }
    }

  }
  getCumulativeData() {

    this.encounterService.getCummulativeVitals(this.objencounterToOpen.patient_id, this.vitalUnit)
      .subscribe(
        data => {
          this.lstQuickVitals = data as Array<any>;
          if (this.lstQuickVitals == undefined || this.lstQuickVitals == null || this.lstQuickVitals.length == 0) {
            this.isCumulativeVitals = false;

          }

        },
        error => alert(error),
        () => this.logMessage.log("get correspondence Successfull.")
      );
  }

  buildForm() {

    if (!this.formBuildDone) {
      this.vitalsForm = this.formBuilder.group({
        txtHeightFt: this.formBuilder.control(null),
        txtHeightIn: this.formBuilder.control(null),
        txtHeightCm: this.formBuilder.control(null),
        txtWeightLb: this.formBuilder.control(null),
        txtWeightOz: this.formBuilder.control(null),
        txtWeightKg: this.formBuilder.control(null),
        txtWeightGm: this.formBuilder.control(null),
        txtHeadCirIn: this.formBuilder.control(null),
        txtHeadCirCm: this.formBuilder.control(null),
        txtWaistIn: this.formBuilder.control(null),
        txtWaistCm: this.formBuilder.control(null),
        txtTempF: this.formBuilder.control(null),
        txtTempC: this.formBuilder.control(null),
        txtTempSource: this.formBuilder.control(null),
        txtBP1Systolic: this.formBuilder.control(null,Validators.pattern(RegExEnum.PositiveWholeNumber)),
        txtBP1Diastolic: this.formBuilder.control(null,Validators.pattern(RegExEnum.PositiveWholeNumber)),
        txtBP1Pulse: this.formBuilder.control(null),
        ddBP1Position: this.formBuilder.control(null),
        txtBP1Character: this.formBuilder.control(null),
        ddBP1Rhythm: this.formBuilder.control(null),
        txtBP2Systolic: this.formBuilder.control(null,Validators.pattern(RegExEnum.PositiveWholeNumber)),
        txtBP2Diastolic: this.formBuilder.control(null ,Validators.pattern(RegExEnum.PositiveWholeNumber)),
        txtBP2Pulse: this.formBuilder.control(null),
        ddBP2Position: this.formBuilder.control(null),
        ddBP2Character: this.formBuilder.control(null),
        ddBP2Delay: this.formBuilder.control(null),
        txtComments: this.formBuilder.control(null),

        txtRespRate: this.formBuilder.control(null),
        txtOxygenSaturation: this.formBuilder.control(null),
        txtPulseOximetry: this.formBuilder.control(null),
        ddOxygenFlow: this.formBuilder.control(null),
        ddOxygenSource: this.formBuilder.control(null),
        ddPain: this.formBuilder.control(null)
      });
      this.formBuildDone = true;
    }
  }
  getChartVital() {

    this.chartVital = undefined;
    this.height_feet = undefined;
    this.height_inc = undefined;
    this.height_cm = undefined;
    this.weight_lbs = undefined;
    this.weight_ozs = undefined;
    this.weight_kg = undefined;
    this.weight_grm = undefined;
    this.BMI = undefined;

    this.bmi_cateogry_description = undefined;
    this.bmi_category_criteria = undefined;


    this.encounterService.getChartVital(this.objencounterToOpen.chart_id)
      .subscribe(
        data => {

          debugger;
          this.chartVital = data;
          if (this.chartVital == undefined) {

            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
            this.noRecordFound = true;
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
            this.noRecordFound = false;


            if (this.chartVital.height_feet != undefined && this.chartVital.height_feet != "") {
              this.height_feet = this.chartVital.height_feet.toString().split(".")[0];
              this.height_inc = this.chartVital.height_feet.toString().split(".")[1];
            }


            if (this.chartVital.weight_lbs != undefined && this.chartVital.weight_lbs != "") {
              this.weight_lbs = this.chartVital.weight_lbs.toString().split(".")[0];
              this.weight_ozs = this.chartVital.weight_lbs.toString().split(".")[1];
            }

            if (this.chartVital.weight_kg != null && this.chartVital.weight_kg != "") {
              this.weight_kg = this.chartVital.weight_kg.toString().split(".")[0];

              if (this.chartVital.weight_kg.toString().split(".").length > 0) {
                this.weight_grm = this.chartVital.weight_kg.toString().split(".")[1];
              }
              else {
                this.weight_grm = "";
              }
            }
            else {
              this.weight_kg = "";
              this.weight_grm = "";
            }


            this.height_cm = this.chartVital.height_cm;

            this.BMI = this.chartVital.bmi;

            this.lastModifiedMsg = this.chartVital.modified_user + " at " + this.chartVital.client_date_modified;
          }
        },
        error => alert(error),
        () => this.logMessage.log("get vitals Successfull.")
      );
  }
  editVitals() {

    this.buildForm();
    this.addEditView = true;
    this.assignValues();
    this.enableUnitFeilds(this.vitalUnit);

  }
  assignValues() {
    if (this.chartVital != null) {

      if (this.vitalsForm != null) {
        (this.vitalsForm.get('txtHeightCm') as FormControl).setValue(this.height_cm);
        (this.vitalsForm.get('txtHeightFt') as FormControl).setValue(this.height_feet);// this.chartVital.height_feet.toString().split(".")[0]);
        (this.vitalsForm.get('txtHeightIn') as FormControl).setValue(this.height_inc);// this.chartVital.height_feet.toString().split(".")[1]);
        (this.vitalsForm.get('txtWeightLb') as FormControl).setValue(this.weight_lbs);// this.chartVital.weight_lbs.toString().split(".")[0]);
        (this.vitalsForm.get('txtWeightOz') as FormControl).setValue(this.weight_ozs);// this.chartVital.weight_lbs.toString().split(".")[1]);
        (this.vitalsForm.get('txtWeightKg') as FormControl).setValue(this.weight_kg);// this.chartVital.weight_kg.toString().split(".")[0]);
        (this.vitalsForm.get('txtWeightGm') as FormControl).setValue(this.weight_grm);// this.chartVital.weight_kg.toString().split(".")[1]);

        this.BMI = this.chartVital.bmi;

        (this.vitalsForm.get('txtWaistIn') as FormControl).setValue(this.chartVital.waist_in);
        (this.vitalsForm.get('txtWaistCm') as FormControl).setValue(this.chartVital.waist_cm);

        (this.vitalsForm.get('txtTempC') as FormControl).setValue(this.chartVital.temperature_centi);
        (this.vitalsForm.get('txtTempF') as FormControl).setValue(this.chartVital.temperature_fahren);
        (this.vitalsForm.get('txtTempSource') as FormControl).setValue(this.chartVital.temperature_source);

        (this.vitalsForm.get('ddBP1Position') as FormControl).setValue(this.chartVital.monitoringposition_bp1);
        (this.vitalsForm.get('txtBP1Systolic') as FormControl).setValue(this.chartVital.systolic_bp1);
        (this.vitalsForm.get('txtBP1Diastolic') as FormControl).setValue(this.chartVital.diastolic_bp1);
        (this.vitalsForm.get('txtBP1Pulse') as FormControl).setValue(this.chartVital.pulse);
        (this.vitalsForm.get('txtBP1Character') as FormControl).setValue(this.chartVital.character);
        (this.vitalsForm.get('ddBP1Rhythm') as FormControl).setValue(this.chartVital.rhythm);
        (this.vitalsForm.get('ddBP2Position') as FormControl).setValue(this.chartVital.monitoringposition_bp2);
        (this.vitalsForm.get('txtBP2Systolic') as FormControl).setValue(this.chartVital.systolic_bp2);
        (this.vitalsForm.get('txtBP2Diastolic') as FormControl).setValue(this.chartVital.diastolic_bp2);
        (this.vitalsForm.get('txtBP2Pulse') as FormControl).setValue(this.chartVital.pulse_bp2);
        (this.vitalsForm.get('ddBP2Character') as FormControl).setValue(this.chartVital.character_bp2);
        (this.vitalsForm.get('ddBP2Delay') as FormControl).setValue(this.chartVital.reading_delay);

        (this.vitalsForm.get('txtHeadCirCm') as FormControl).setValue(this.chartVital.head_circumference_cm);
        (this.vitalsForm.get('txtHeadCirIn') as FormControl).setValue(this.chartVital.head_circumference_inch);

        (this.vitalsForm.get('txtRespRate') as FormControl).setValue(this.chartVital.respiration);
        (this.vitalsForm.get('txtOxygenSaturation') as FormControl).setValue(this.chartVital.oxygen_saturation);
        (this.vitalsForm.get('txtPulseOximetry') as FormControl).setValue(this.chartVital.pulse_oximetry);

        (this.vitalsForm.get('ddOxygenSource') as FormControl).setValue(this.chartVital.oxygen_source);
        (this.vitalsForm.get('ddOxygenFlow') as FormControl).setValue(this.chartVital.oxygen_flow);
        (this.vitalsForm.get('ddPain') as FormControl).setValue(this.chartVital.pain);

        (this.vitalsForm.get('txtComments') as FormControl).setValue(this.chartVital.comments);
      }

      this.categoriezBMI(this.chartVital.bmi);

    }


  }
  cancelVitals() {

    this.addEditView = false;
    this.assignValues();
  }
  saveVitals() {

    let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
    let obj_ORMChartVitals: ORMChartVitals = new ORMChartVitals();

    if (this.chartVital == null) {
      obj_ORMChartVitals.created_user = this.lookupList.logedInUser.user_name;
      obj_ORMChartVitals.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else {
      obj_ORMChartVitals.vital_id = this.chartVital.vital_id;
      obj_ORMChartVitals.created_user = this.chartVital.created_user;
      obj_ORMChartVitals.date_created = this.chartVital.date_created;
      obj_ORMChartVitals.client_date_created = this.chartVital.client_date_created;
    }

    obj_ORMChartVitals.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    obj_ORMChartVitals.modified_user = this.lookupList.logedInUser.user_name;
    obj_ORMChartVitals.system_ip = this.lookupList.logedInUser.systemIp;

    obj_ORMChartVitals.patient_id = Number(this.objencounterToOpen.patient_id);
    obj_ORMChartVitals.chart_id = Number(this.objencounterToOpen.chart_id);
    obj_ORMChartVitals.practice_id = this.lookupList.practiceInfo.practiceId;

    let heightFt = parseInt((this.vitalsForm.get('txtHeightFt') as FormControl).value);
    let heightInc = parseInt((this.vitalsForm.get('txtHeightIn') as FormControl).value);
    let heightCm = parseFloat((this.vitalsForm.get('txtHeightCm') as FormControl).value);

    if (!Number.isNaN(heightFt) || !Number.isNaN(heightInc)) {
      heightFt = Number.isNaN(heightFt) ? 0 : heightFt
      heightInc = Number.isNaN(heightInc) ? 0 : heightInc;
      obj_ORMChartVitals.height_feet = heightFt + "." + heightInc;
    }
    if (!Number.isNaN(heightCm)) {
      heightCm = Number.isNaN(heightCm) ? 0 : heightCm;
      obj_ORMChartVitals.height_cm = (this.vitalsForm.get('txtHeightCm') as FormControl).value;
    }


    let weightLb = parseInt((this.vitalsForm.get('txtWeightLb') as FormControl).value);
    let weightOz = parseInt((this.vitalsForm.get('txtWeightOz') as FormControl).value);
    let weightKg = parseFloat((this.vitalsForm.get('txtWeightKg') as FormControl).value);
    let weightgm = parseFloat((this.vitalsForm.get('txtWeightGm') as FormControl).value);

    if (!Number.isNaN(weightLb) || !Number.isNaN(weightOz)) {
      weightLb = Number.isNaN(weightLb) ? 0 : weightLb;
      weightOz = Number.isNaN(weightOz) ? 0 : weightOz;
      obj_ORMChartVitals.weight_lbs = weightLb + "." + weightOz;
    }
    if (!Number.isNaN(weightKg) || !Number.isNaN(weightgm)) {
      weightKg = Number.isNaN(weightKg) ? 0 : weightKg;
      weightgm = Number.isNaN(weightgm) ? 0 : weightgm;
      obj_ORMChartVitals.weight_kg = weightKg + "." + weightgm;
    }

    obj_ORMChartVitals.bmi = this.BMI;

    let tempF = parseFloat((this.vitalsForm.get('txtTempF') as FormControl).value);
    let tempC = parseFloat((this.vitalsForm.get('txtTempC') as FormControl).value);
    if (!Number.isNaN(tempF)) {
      obj_ORMChartVitals.temperature_fahren = tempF.toString();
    }
    if (!Number.isNaN(tempC)) {
      obj_ORMChartVitals.temperature_centi = tempC.toString();
    }


    let headCirmIn = parseFloat((this.vitalsForm.get('txtHeadCirIn') as FormControl).value);
    let headCirmCm = parseFloat((this.vitalsForm.get('txtHeadCirCm') as FormControl).value);
    if (!Number.isNaN(headCirmIn)) {
      obj_ORMChartVitals.head_circumference_inch = headCirmIn.toString();
    }
    if (!Number.isNaN(headCirmCm)) {
      obj_ORMChartVitals.head_circumference_cm = headCirmCm.toString();
    }


    let waistIn = parseFloat((this.vitalsForm.get('txtWaistIn') as FormControl).value);
    let waistCm = parseFloat((this.vitalsForm.get('txtWaistCm') as FormControl).value);
    if (!Number.isNaN(waistIn)) {
      obj_ORMChartVitals.waist_in = waistIn.toString();
    }
    if (!Number.isNaN(waistCm)) {
      obj_ORMChartVitals.waist_cm = waistCm.toString();
    }

    obj_ORMChartVitals.respiration = (this.vitalsForm.get('txtRespRate') as FormControl).value;
    obj_ORMChartVitals.temperature_source = (this.vitalsForm.get('txtTempSource') as FormControl).value;
    obj_ORMChartVitals.oxygen_saturation = (this.vitalsForm.get('txtOxygenSaturation') as FormControl).value;
    obj_ORMChartVitals.pulse_oximetry = (this.vitalsForm.get('txtPulseOximetry') as FormControl).value;

    obj_ORMChartVitals.oxygen_source = (this.vitalsForm.get('ddOxygenSource') as FormControl).value;
    obj_ORMChartVitals.oxygen_flow = (this.vitalsForm.get('ddOxygenFlow') as FormControl).value;


    obj_ORMChartVitals.monitoringposition_bp1 = (this.vitalsForm.get('ddBP1Position') as FormControl).value;
    obj_ORMChartVitals.systolic_bp1 = (this.vitalsForm.get('txtBP1Systolic') as FormControl).value;
    obj_ORMChartVitals.diastolic_bp1 = (this.vitalsForm.get('txtBP1Diastolic') as FormControl).value;
    obj_ORMChartVitals.pulse = (this.vitalsForm.get('txtBP1Pulse') as FormControl).value;
    obj_ORMChartVitals.character = (this.vitalsForm.get('txtBP1Character') as FormControl).value;
    obj_ORMChartVitals.rhythm = (this.vitalsForm.get('ddBP1Rhythm') as FormControl).value;
    obj_ORMChartVitals.monitoringposition_bp2 = (this.vitalsForm.get('ddBP2Position') as FormControl).value;
    obj_ORMChartVitals.systolic_bp2 = (this.vitalsForm.get('txtBP2Systolic') as FormControl).value;
    obj_ORMChartVitals.diastolic_bp2 = (this.vitalsForm.get('txtBP2Diastolic') as FormControl).value;
    obj_ORMChartVitals.pulse_bp2 = (this.vitalsForm.get('txtBP2Pulse') as FormControl).value;
    obj_ORMChartVitals.character_bp2 = (this.vitalsForm.get('ddBP2Character') as FormControl).value;
    obj_ORMChartVitals.reading_delay = (this.vitalsForm.get('ddBP2Delay') as FormControl).value;
    obj_ORMChartVitals.pain = (this.vitalsForm.get('ddPain') as FormControl).value;
    obj_ORMChartVitals.comments = (this.vitalsForm.get('txtComments') as FormControl).value;

    this.encounterService.saveEditVitals(obj_ORMChartVitals)
      .subscribe(
        data => {
          this.savedSuccessfull(data)
        },
        error => alert(error),
        () => this.logMessage.log("Save Patient Consultant.")
      );
  }
  savedSuccessfull(data: any) {

    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.addEditView = false;
      this.getChartVital();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Chart Vital', data.response, AlertTypeEnum.DANGER)
    }

  }

  calculateCM(feild: string) {
    debugger;
    let valueCM;
    let valueInc;

    switch (feild) {
      case "height":
        debugger;

        let heightFt = parseInt((this.vitalsForm.get('txtHeightFt') as FormControl).value);//== "" ? "0" : (this.vitalsForm.get('txtHeightFt') as FormControl).value;
        let heightInc = parseInt((this.vitalsForm.get('txtHeightIn') as FormControl).value);// == "" ? "0" : (this.vitalsForm.get('txtHeightIn') as FormControl).value;

        if (Number.isNaN(heightFt) && Number.isNaN(heightInc)
          || (Number.isNaN(heightFt) && heightInc == 0)
          || (Number.isNaN(heightInc) && heightFt == 0)
        ) {
          (this.vitalsForm.get('txtHeightFt') as FormControl).setValue(null);
          (this.vitalsForm.get('txtHeightIn') as FormControl).setValue(null);
          (this.vitalsForm.get('txtHeightCm') as FormControl).setValue(null);
        }
        else {

          heightFt = Number.isNaN(heightFt) ? 0 : heightFt
          heightInc = Number.isNaN(heightInc) ? 0 : heightInc;

          if (heightInc > 0) {
            let feetInchesFromInches: string = this.convertGivenValues(VitalsUnitConversionEnum.IN_TO_FTIN, heightInc);

            if (!Number.isNaN(Number(feetInchesFromInches)) && feetInchesFromInches != "") {
              let feetsFromInches = feetInchesFromInches.split(".")[0];
              heightInc = parseInt(feetInchesFromInches.split(".")[1]);
              heightFt = parseInt((Number(heightFt) + Number(feetsFromInches)).toString());
            }
          }

          let totalInches: number = (heightFt * 12) + heightInc;
          (this.vitalsForm.get('txtHeightCm') as FormControl).setValue(this.convertGivenValues(VitalsUnitConversionEnum.IN_TO_CM, totalInches));

          (this.vitalsForm.get('txtHeightFt') as FormControl).setValue(heightFt);
          (this.vitalsForm.get('txtHeightIn') as FormControl).setValue(heightInc);
        }

        this.calculateBMI(VitalsUnitEnum.US_CUSTOMARY);

        break;

      case "head_circumference":

        valueInc = parseInt((this.vitalsForm.get('txtHeadCirIn') as FormControl).value);// == "" ? "0" : (this.vitalsForm.get('txtHeadCirIn') as FormControl).value;

        if (Number.isNaN(valueInc)) {
          (this.vitalsForm.get('txtHeadCirIn') as FormControl).setValue(null);
          (this.vitalsForm.get('txtHeadCirCm') as FormControl).setValue(null);
        }
        else {
          valueInc = Number.isNaN(valueInc) ? 0 : valueInc;
          valueCM = Number(this.convertGivenValues(VitalsUnitConversionEnum.IN_TO_CM, valueInc));
          (this.vitalsForm.get('txtHeadCirIn') as FormControl).setValue(valueInc);
          (this.vitalsForm.get('txtHeadCirCm') as FormControl).setValue(Number.isNaN(Number(valueCM)) ? "" : valueCM);
        }

        break;

      case "waist":
        valueInc = parseInt((this.vitalsForm.get('txtWaistIn') as FormControl).value);// == "" ? "0" : (this.vitalsForm.get('txtHeadCirIn') as FormControl).value;

        if (Number.isNaN(valueInc)) {
          (this.vitalsForm.get('txtWaistIn') as FormControl).setValue(null);
          (this.vitalsForm.get('txtWaistCm') as FormControl).setValue(null);
        }
        else {
          valueInc = Number.isNaN(valueInc) ? 0 : valueInc;
          valueCM = Number(this.convertGivenValues(VitalsUnitConversionEnum.IN_TO_CM, valueInc));
          (this.vitalsForm.get('txtWaistIn') as FormControl).setValue(valueInc);
          (this.vitalsForm.get('txtWaistCm') as FormControl).setValue(Number.isNaN(Number(valueCM)) ? "" : valueCM);
        }

        break;

      default:
        break;
    }
  }
  calculateInc(feild: string) {

    debugger;
    let valueCM;
    let valueInc;
    switch (feild) {
      case "height":

        var heightCM = parseFloat((this.vitalsForm.get('txtHeightCm') as FormControl).value);// == "" ? "0" : (this.vitalsForm.get('txtHeightCm') as FormControl).value;

        if (Number.isNaN(heightCM)) {
          (this.vitalsForm.get('txtHeightFt') as FormControl).setValue(null);
          (this.vitalsForm.get('txtHeightIn') as FormControl).setValue(null);
          (this.vitalsForm.get('txtHeightCm') as FormControl).setValue(null);
        }
        else {
          heightCM = Number.isNaN(heightCM) ? 0 : heightCM;

          let heightInc = Number(this.convertGivenValues(VitalsUnitConversionEnum.CM_TO_IN, heightCM));

          let heightFt = parseInt((Number(heightInc) / 12).toString());
          heightInc = parseInt((Number(heightInc) % 12).toString());
          (this.vitalsForm.get('txtHeightCm') as FormControl).setValue(heightCM);
          (this.vitalsForm.get('txtHeightFt') as FormControl).setValue(Number.isNaN(Number(heightFt)) ? "" : heightFt);
          (this.vitalsForm.get('txtHeightIn') as FormControl).setValue(Number.isNaN(Number(heightInc)) ? "" : heightInc);

        }
        this.calculateBMI(VitalsUnitEnum.METRIC);

        break;

      case "head_circumference":

        valueCM = parseFloat((this.vitalsForm.get('txtHeadCirCm') as FormControl).value);

        if (Number.isNaN(valueCM)) {
          (this.vitalsForm.get('txtHeadCirIn') as FormControl).setValue(null);
          (this.vitalsForm.get('txtHeadCirCm') as FormControl).setValue(null);
        }
        else {

          valueInc = Number(this.convertGivenValues(VitalsUnitConversionEnum.CM_TO_IN, valueCM));
          (this.vitalsForm.get('txtHeadCirIn') as FormControl).setValue(valueInc);
          (this.vitalsForm.get('txtHeadCirCm') as FormControl).setValue(valueInc);
        }
        break;

      case "waist":

        valueCM = parseFloat((this.vitalsForm.get('txtWaistCm') as FormControl).value);

        if (Number.isNaN(valueCM)) {
          (this.vitalsForm.get('txtWaistIn') as FormControl).setValue(null);
          (this.vitalsForm.get('txtWaistCm') as FormControl).setValue(null);
        }
        else {

          valueInc = Number(this.convertGivenValues(VitalsUnitConversionEnum.CM_TO_IN, valueCM));
          (this.vitalsForm.get('txtWaistIn') as FormControl).setValue(valueInc);
          (this.vitalsForm.get('txtWaistCm') as FormControl).setValue(valueInc);
        }

        break;

      default:
        break;
    }
  }
  calculateKgGm(feild: string) {
    debugger;
    switch (feild) {
      case "weight":
        //let strVal = [];
        var lb = parseInt((this.vitalsForm.get('txtWeightLb') as FormControl).value);//== "" ? "0" : (this.vitalsForm.get('txtWeightLb') as FormControl).value;
        let oz = parseInt((this.vitalsForm.get('txtWeightOz') as FormControl).value);//== "" ? "0" : (this.vitalsForm.get('txtWeightOz') as FormControl).value;


        if (Number.isNaN(lb) && Number.isNaN(oz)
          || (Number.isNaN(lb) && oz == 0)
          || (Number.isNaN(oz) && lb == 0)
        ) {
          (this.vitalsForm.get('txtWeightLb') as FormControl).setValue(null);
          (this.vitalsForm.get('txtWeightOz') as FormControl).setValue(null);
          (this.vitalsForm.get('txtWeightKg') as FormControl).setValue(null);
          (this.vitalsForm.get('txtWeightGm') as FormControl).setValue(null);
        }
        else {

          lb = Number.isNaN(lb) ? 0 : lb;
          oz = Number.isNaN(oz) ? 0 : oz;

          if (oz > 0) {
            let lbOzFromOz: string = this.convertGivenValues(VitalsUnitConversionEnum.OZ_TO_LBOZ, oz);

            if (!Number.isNaN(Number(lbOzFromOz)) && lbOzFromOz != "") {
              let lbFromOz = lbOzFromOz.split(".")[0];
              oz = parseInt(lbOzFromOz.split(".")[1]);
              lb = parseInt((Number(lb) + Number(lbFromOz)).toString());
            }
          }

          let totalOnce: number = parseInt(((lb * 16) + oz).toString());

          let ozToKgGram = this.convertGivenValues(VitalsUnitConversionEnum.OZ_TO_KGG, totalOnce).split(".");
          (this.vitalsForm.get('txtWeightKg') as FormControl).setValue(parseInt(ozToKgGram[0]));
          (this.vitalsForm.get('txtWeightGm') as FormControl).setValue(parseInt(ozToKgGram[1]));

          (this.vitalsForm.get('txtWeightLb') as FormControl).setValue(lb);
          (this.vitalsForm.get('txtWeightOz') as FormControl).setValue(oz);
        }

        this.calculateBMI(VitalsUnitEnum.US_CUSTOMARY);

        break;
    }
  }

  calculateLbOz(feild: string) {
    debugger;
    switch (feild) {
      case "weight":

        let kg = parseInt((this.vitalsForm.get('txtWeightKg') as FormControl).value);// == "" ? "0" : (this.vitalsForm.get('txtWeightKg') as FormControl).value;
        var gm = parseInt((this.vitalsForm.get('txtWeightGm') as FormControl).value);// == "" ? "0" : (this.vitalsForm.get('txtWeightGm') as FormControl).value;

        if (Number.isNaN(kg) && Number.isNaN(gm)
          || (Number.isNaN(kg) && gm == 0)
          || (Number.isNaN(gm) && kg == 0)
        ) {
          (this.vitalsForm.get('txtWeightLb') as FormControl).setValue(null);
          (this.vitalsForm.get('txtWeightOz') as FormControl).setValue(null);
          (this.vitalsForm.get('txtWeightKg') as FormControl).setValue(null);
          (this.vitalsForm.get('txtWeightGm') as FormControl).setValue(null);
        }
        else {

          kg = Number.isNaN(kg) ? 0 : kg;
          gm = Number.isNaN(gm) ? 0 : gm;

          if (gm > 0) {
            let kbGmFromGm: string = this.convertGivenValues(VitalsUnitConversionEnum.G_TO_KGG, gm);

            if (!Number.isNaN(Number(kbGmFromGm)) && kbGmFromGm != "") {
              let kgFromGm = kbGmFromGm.split(".")[0];
              gm = parseInt(kbGmFromGm.split(".")[1]);
              kg = parseInt((Number(kg) + Number(kgFromGm)).toString());
            }
          }

          let totalGm: number = (Number(kg) * 1000) + Number(gm);

          let lbOzTotal: string = this.convertGivenValues(VitalsUnitConversionEnum.G_TO_LBOZ, totalGm);
          let lb = lbOzTotal.split(".")[0];
          let oz = lbOzTotal.split(".")[1];

          (this.vitalsForm.get('txtWeightLb') as FormControl).setValue(parseInt(lb));
          (this.vitalsForm.get('txtWeightOz') as FormControl).setValue(parseInt(oz));

          (this.vitalsForm.get('txtWeightKg') as FormControl).setValue(kg);
          (this.vitalsForm.get('txtWeightGm') as FormControl).setValue(gm);
        }

        this.calculateBMI(VitalsUnitEnum.METRIC);

        break;
    }
  }


  convertTempToDegreeC() {
    debugger;
    let var_tempf = parseFloat((this.vitalsForm.get('txtTempF') as FormControl).value);
    if (Number.isNaN(var_tempf)) {
      (this.vitalsForm.get('txtTempF') as FormControl).setValue(null);
      (this.vitalsForm.get('txtTempC') as FormControl).setValue(null);
    }
    else {
      (this.vitalsForm.get('txtTempF') as FormControl).setValue(var_tempf);
      (this.vitalsForm.get('txtTempC') as FormControl).setValue(this.convertGivenValues(VitalsUnitConversionEnum.DEGREE_F_TO_DEGREE_C, var_tempf));
    }
  }
  convertTempToDegreeF() {
    debugger;

    let var_tempc = parseFloat((this.vitalsForm.get('txtTempC') as FormControl).value);
    if (Number.isNaN(var_tempc)) {
      (this.vitalsForm.get('txtTempF') as FormControl).setValue(null);
      (this.vitalsForm.get('txtTempC') as FormControl).setValue(null);
    }
    else {
      (this.vitalsForm.get('txtTempC') as FormControl).setValue(var_tempc);
      (this.vitalsForm.get('txtTempF') as FormControl).setValue(this.convertGivenValues(VitalsUnitConversionEnum.DEGREE_C_TO_DEGREE_F, var_tempc));
    }
  }


  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true,
    size: 'lg'
  };

  calculateBMI(unitType: VitalsUnitEnum) {
    //Metric Units: BMI = Weight (kg) / (Height (m) x Height (m))
    //US Customary Units: BMI = Weight (lb) / (Height (in) x Height (in)) x 703
    debugger;
    var bmi: number;


    switch (unitType) {
      case VitalsUnitEnum.US_CUSTOMARY: {
        let weightLbsTotal: number = 0;
        let heightIncTotal: number = 0;

        let wtLb = Number((this.vitalsForm.get('txtWeightLb') as FormControl).value);
        let wtOz = Number((this.vitalsForm.get('txtWeightOz') as FormControl).value);
        let lbFromOz: number = wtOz * 0.0625;
        weightLbsTotal = wtLb + lbFromOz;


        let htFt = Number((this.vitalsForm.get('txtHeightFt') as FormControl).value);
        let htInc = Number((this.vitalsForm.get('txtHeightIn') as FormControl).value);
        let incFromFt: number = htFt * 12;
        heightIncTotal = htInc + incFromFt;

        if (!Number.isNaN(weightLbsTotal) && !Number.isNaN(heightIncTotal) && weightLbsTotal > 0 && heightIncTotal > 0) {
          bmi = (weightLbsTotal / (heightIncTotal * heightIncTotal)) * 703;
        }
        else {
          bmi = 0;
        }

        break;
      }
      case VitalsUnitEnum.METRIC: {

        let weightKgTotal: number = 0;
        let heightMeterTotal: number = 0;


        let wtKg = Number((this.vitalsForm.get('txtWeightKg') as FormControl).value);
        let wtGm = Number((this.vitalsForm.get('txtWeightGm') as FormControl).value);
        let kgFromGm: number = wtGm * 0.001;
        weightKgTotal = wtKg + kgFromGm;


        let htCm = Number((this.vitalsForm.get('txtHeightCm') as FormControl).value);
        heightMeterTotal = htCm * 0.01;

        if (!Number.isNaN(weightKgTotal) && !Number.isNaN(heightMeterTotal) && weightKgTotal > 0 && heightMeterTotal > 0) {
          bmi = weightKgTotal / (heightMeterTotal * heightMeterTotal);
        }
        else {
          bmi = 0;
        }



        break;
      }
    }


    if (bmi > 0) {
      this.BMI = bmi.toFixed(2).toString();
      //(this.vitalsForm.get('txtBMI') as FormControl).setValue(this.BMI);
      this.categoriezBMI(bmi);
    } else {
      this.BMI = "";
      this.bmi_cateogry_description = "";
      this.bmi_category_criteria = "";
    }


  }

  categoriezBMI(bmi: number) {

    if (bmi > 0) {
      if (bmi < 18.5) {
        this.bmi_cateogry_description = "Underweight";
        this.bmi_category_criteria = "<18.5";
      } else if (bmi >= 18.5 && bmi <= 24.9) {
        this.bmi_cateogry_description = "Normal weight";
        this.bmi_category_criteria = "18.5–24.9";
      } else if (bmi >= 25 && bmi <= 29.9) {
        this.bmi_cateogry_description = "Overweight";
        this.bmi_category_criteria = "25–29.9";
      } else if (bmi >= 30) {
        this.bmi_cateogry_description = "Obese";
        this.bmi_category_criteria = "30 or >30";
      }
    }
  }



  showNormalView() {
    this.isCumulativeVitals = false;
    this.categoriezBMI(Number(this.BMI));
  }
  showCumulativeView() {
    //this.cancelVitals();
    this.isCumulativeVitals = true;
    this.lstQuickVitals = undefined;
    this.getCumulativeData();
    this.enableUnitFeilds(this.vitalUnit);

  }
  convertGivenValues(type: string, currValue): string {
    {

      debugger;
      try {
        var convertedVal: string = "0.0";
        switch (type as VitalsUnitConversionEnum) {
          case VitalsUnitConversionEnum.OZ_TO_LBOZ:
            {

              // return lb.oz
              if (currValue != "") {

                let lbFromOz = parseInt((Number(currValue) / 16).toString());
                let oz = parseInt((Number(currValue) % 16).toString());

                convertedVal = lbFromOz + "." + oz;
              }
              else
                convertedVal = "0." + currValue;
              break;
            }
          case VitalsUnitConversionEnum.G_TO_KGG:
            {

              // return kg.gm
              if (currValue != "") {
                convertedVal = (parseFloat(currValue) * 0.001).toFixed(3).toString();
              }
              else
                convertedVal = "0." + currValue;
              break;
            }
          case VitalsUnitConversionEnum.OZ_TO_KGG:
            {


              if (currValue != "" && currValue != 0) {
                // return kg.g

                // 1 oz == 28.3495 g
                //let gramsTotal = parseInt((Number(currValue) * 28.3495).toString());
                //let kg = gramsTotal / 10000;
                //let g = parseInt((gramsTotal % 10000).toString());

                convertedVal = (parseFloat(currValue) * 0.02834952).toFixed(3).toString();
                //convertedVal = kg + "." + g
              }
              else
                convertedVal = "0.0";
              break;
            }
          case VitalsUnitConversionEnum.G_TO_LBOZ:
            {

              if (currValue != "" && currValue != 0) {
                // return Lb.Oz

                // 1 g == 0.035274 oz
                let ozTotal = Number(currValue) * 0.035274;

                let lb = parseInt((ozTotal / 16).toString());
                let oz = parseInt((ozTotal % 16).toString());

                convertedVal = lb + "." + oz;
              }
              else
                convertedVal = "0.0";
              break;
            }
          case VitalsUnitConversionEnum.IN_TO_FTIN:
            {

              // return ft.inches
              if (currValue != "") {

                //convertedVal = (parseFloat(currValue) * 0.083333).toFixed(2).toString();

                let feetsFromInches = parseInt((Number(currValue) / 12).toString());
                let inches = parseInt((Number(currValue) % 12).toString());

                convertedVal = feetsFromInches + "." + inches;

              }
              else
                convertedVal = "0." + currValue;
              break;
            }
          case VitalsUnitConversionEnum.FT_TO_CM:
            {

              let newval = [];
              newval = currValue.split(".");
              if (newval.length > 1) {
                currValue = ((parseFloat(newval[0]) * 12) + parseFloat(newval[1])).toString();
              }
              else
                currValue = (parseFloat(currValue) * 12).toString()

              if (currValue != "") {
                convertedVal = (parseFloat(currValue) * 2.54).toString();
                newval = convertedVal.split(".");
                if (newval.length > 1) {
                  if (newval[1].length > 1) {
                    convertedVal = (parseFloat(currValue) * 2.54).toFixed(2).toString();
                  }
                }
              }
              else
                convertedVal = currValue;
              break;
            }


          case VitalsUnitConversionEnum.DEGREE_F_TO_DEGREE_C:
            {

              if (currValue != "")
                convertedVal = ((parseFloat(currValue) - 32) * 5 / 9).toFixed(2).toString();

              else
                convertedVal = currValue;
              break;
            }
          case VitalsUnitConversionEnum.DEGREE_C_TO_DEGREE_F:
            {

              if (currValue != "")
                convertedVal = ((parseFloat(currValue) * 9 / 5) + 32).toFixed(2).toString();

              else
                convertedVal = currValue;
              break;
            }
          case VitalsUnitConversionEnum.IN_TO_CM:
            {

              if (currValue != "")
                convertedVal = (parseFloat(currValue) * 2.54).toFixed(2).toString();

              else
                convertedVal = currValue;
              break;
            }
          case VitalsUnitConversionEnum.CM_TO_IN:
            {
              if (currValue != "")
                convertedVal = (parseFloat(currValue) / 2.54).toFixed(2).toString();

              else
                convertedVal = currValue;
              break;
            }
        }

        convertedVal = Number.isNaN(Number(convertedVal)) ? "" : convertedVal;
        return convertedVal;
      }
      catch (error) {
        return "";
      }
    }
  }

  isBP1Exist(): boolean {
    let exist: boolean = false;

    if (this.chartVital != undefined) {

      if (
        (this.chartVital.systolic_bp1 != undefined && this.chartVital.systolic_bp1 != "")
        || (this.chartVital.diastolic_bp1 != undefined && this.chartVital.diastolic_bp1 != "")
        || (this.chartVital.pulse != undefined && this.chartVital.pulse != "")
        || (this.chartVital.bp1_rhythm != undefined && this.chartVital.bp1_rhythm != "")
        || (this.chartVital.monitoringposition_bp1 != undefined && this.chartVital.monitoringposition_bp1 != "")
        || (this.chartVital.character != undefined && this.chartVital.character != "")
      ) {
        exist = true;
      }
    }
    return exist;
  }
  isBP2Exist(): boolean {
    let exist: boolean = false;

    if (this.chartVital != undefined) {

      if (
        (this.chartVital.systolic_bp2 != undefined && this.chartVital.systolic_bp2 != "")
        || (this.chartVital.diastolic_bp2 != undefined && this.chartVital.diastolic_bp2 != "")
        || (this.chartVital.pulse_bp2 != undefined && this.chartVital.pulse_bp2 != "")
        || (this.chartVital.monitoringposition_bp2 != undefined && this.chartVital.monitoringposition_bp2 != "")
        || (this.chartVital.character_bp2 != undefined && this.chartVital.character_bp2 != "")
        || (this.chartVital.reading_delay != undefined && this.chartVital.reading_delay != "")
      ) {
        exist = true;
      }
    }


    return exist;
  }

  isOtherExist(): boolean {
    let exist: boolean = false;

    if (this.chartVital != undefined) {

      if (
        (this.chartVital.head_circumference_inch != undefined && this.chartVital.head_circumference_inch != "")
        || (this.chartVital.respiration != undefined && this.chartVital.respiration != "")
        || (this.chartVital.oxygen_saturation != undefined && this.chartVital.oxygen_saturation != "")
        || (this.chartVital.oxygen_flow != undefined && this.chartVital.oxygen_flow != "")
        || (this.chartVital.oxygen_source != undefined && this.chartVital.oxygen_source != "")
        || (this.chartVital.pulse_oximetry != undefined && this.chartVital.pulse_oximetry != "")
        || (this.chartVital.waist_in != undefined && this.chartVital.waist_in != "")
        || (this.chartVital.waist_cm != undefined && this.chartVital.waist_cm != "")
        || (this.chartVital.pain != undefined && this.chartVital.pain != "")
        || (this.chartVital.pr_bpm != undefined && this.chartVital.pr_bpm != "")
      ) {
        exist = true;
      }
    }


    return exist;
  }

  ChangeVitalUnit(unit: string) {
    this.vitalUnit = unit as VitalsUnitEnum;
    if (this.isCumulativeVitals) {
      this.lstQuickVitals = undefined;
      this.getCumulativeData();
    }

    if (this.addEditView) {
      this.enableUnitFeilds(this.vitalUnit);
    }
  }

  enableUnitFeilds(unit: string) {

    debugger;
    
    switch (unit) {
      case "us_customary":
        (this.vitalsForm.get('txtHeightFt') as FormControl).enable();
        (this.vitalsForm.get('txtHeightIn') as FormControl).enable();
        (this.vitalsForm.get('txtWeightLb') as FormControl).enable();
        (this.vitalsForm.get('txtWeightOz') as FormControl).enable();
        (this.vitalsForm.get('txtHeadCirIn') as FormControl).enable();
        (this.vitalsForm.get('txtWaistIn') as FormControl).enable();
        (this.vitalsForm.get('txtTempF') as FormControl).enable();


        (this.vitalsForm.get('txtHeightCm') as FormControl).disable();
        (this.vitalsForm.get('txtWeightKg') as FormControl).disable();
        (this.vitalsForm.get('txtWeightGm') as FormControl).disable();
        (this.vitalsForm.get('txtHeadCirCm') as FormControl).disable();
        (this.vitalsForm.get('txtWaistCm') as FormControl).disable();
        (this.vitalsForm.get('txtTempC') as FormControl).disable();

        break;
      case "metric":

        (this.vitalsForm.get('txtHeightFt') as FormControl).disable();
        (this.vitalsForm.get('txtHeightIn') as FormControl).disable();
        (this.vitalsForm.get('txtWeightLb') as FormControl).disable();
        (this.vitalsForm.get('txtWeightOz') as FormControl).disable();
        (this.vitalsForm.get('txtHeadCirIn') as FormControl).disable();
        (this.vitalsForm.get('txtWaistIn') as FormControl).disable();
        (this.vitalsForm.get('txtTempF') as FormControl).disable();


        (this.vitalsForm.get('txtHeightCm') as FormControl).enable();
        (this.vitalsForm.get('txtWeightKg') as FormControl).enable();
        (this.vitalsForm.get('txtWeightGm') as FormControl).enable();
        (this.vitalsForm.get('txtHeadCirCm') as FormControl).enable();
        (this.vitalsForm.get('txtWaistCm') as FormControl).enable();
        (this.vitalsForm.get('txtTempC') as FormControl).enable();

        break;

    }

  }


  showLogHistory() {

    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("vital_id", this.chartVital.vital_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "chart_vital_log";
    logParameters.logDisplayName = "Patient Vitals Log";
    logParameters.logMainTitle = "Patient Vitals Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }
}