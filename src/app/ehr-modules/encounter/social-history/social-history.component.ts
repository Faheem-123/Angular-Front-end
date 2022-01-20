import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { ORMChartSocialHistory } from './../../../models/encounter/orm-chart-social-history';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { GeneralService } from '../../../services/general/general.service'
import { LogMessage } from '../../../shared/log-message';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ChartModuleHistoryComponent } from './../../../general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from './../../../models/encounter/chartmodulehistory';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ServiceResponseStatusEnum, AlertTypeEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { LogParameters } from '../../log/log-parameters';

@Component({
  selector: 'social-history',
  templateUrl: './social-history.component.html',
  styleUrls: ['./social-history.component.css']
})
export class SocialHistoryComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  
  
  //private obj_ORMChartSocialHistory: ORMChartSocialHistory;
  socialHistoryForm: FormGroup;
  formBuildDone: boolean = false;

  canView: boolean = false;
  canAddEdit: boolean = false;
  noRecordFound = true;

  lastModifiedMsg: string;
  //patient_gender: string;

  loadingCount: number = 0;
  isLoading: boolean = false;


  //deniedView: boolean;

  chartSocialHistoryDisplay = null;
  chartSocialHistoryDetail = null;
  addEditView = false;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private encounterService: EncounterService,
    private formBuilder: FormBuilder,
    private ngbModal: NgbModal,
    private generalService: GeneralService,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage) {

    this.canView = this.lookupList.UserRights.ViewSocialHx;
    this.canAddEdit = this.lookupList.UserRights.AddModifySocialHx;

  }

  ngOnInit() {

    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
    this.canAddEdit = false;
    
    if (this.canView == true) {

      this.isLoading = true;
      this.getChartSocialHistDisplay();


    }
    //else {
    // this.deniedView = true;     
    // }

    this.buildForm();
  }

  getChartSocialHistDisplay() {
    this.encounterService.getChartSocialHistDisplay(Number(this.objencounterToOpen.chart_id))
      .subscribe(
        data => {

          debugger;
          this.chartSocialHistoryDisplay = data;
          if (this.chartSocialHistoryDisplay == undefined) {
            this.noRecordFound = true;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            debugger;
            this.noRecordFound = false;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));

            this.lastModifiedMsg = this.chartSocialHistoryDisplay.modified_user + " at " + this.chartSocialHistoryDisplay.date_modified;


          }

          this.isLoading = false;
        },
        error => {
          this.getChartSocialHistDisplayError(error);
          this.isLoading = false;
        }
      );
  }

  getChartSocialHistDisplayError(error) {
    this.logMessage.log("getChartSocialHistDisplay Error." + error);
  }


  buildForm() {

    if (!this.formBuildDone) {
      this.socialHistoryForm = this.formBuilder.group({
        ddMaritalStatus: this.formBuilder.control(null),
        ddChildren: this.formBuilder.control(null),
        ddSexualOrientation: this.formBuilder.control(null),
        txtOtherSexualOrientation: this.formBuilder.control(null),
        ddGenderIdentity: this.formBuilder.control(null),
        txtOtherGenderIdentity: this.formBuilder.control(null),
        ddHighestEducation: this.formBuilder.control(null),

        ddOccupation: this.formBuilder.control(null),
        ddHomeEnvironment: this.formBuilder.control(null),
        ddDietEducation: this.formBuilder.control(null),
        ddSmokingStatus: this.formBuilder.control(null),
        ddTobaccoType: this.formBuilder.control(null),
        ddPacksPerDay: this.formBuilder.control(null),
        ddYearStarted: this.formBuilder.control(null),
        dfTobaccoStartDate: this.formBuilder.control(null, datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
        dfTobaccoEndDate: this.formBuilder.control(null, datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
        ddTobaccoCessation: this.formBuilder.control(null),
        ddAlcoholUse: this.formBuilder.control(null),
        ddCaffeineUse: this.formBuilder.control(null),
        ddETOH: this.formBuilder.control(null),
        ddDrugUse: this.formBuilder.control(null),
        dfDrugQuiteDate: this.formBuilder.control(null, datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
        ddExcercise: this.formBuilder.control(null),
        ddSeatBelts: this.formBuilder.control(null),
        ddExposure: this.formBuilder.control(null),
        dfLMP: this.formBuilder.control(null, datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
        chkPregnant: this.formBuilder.control(null),
        dfEDD: this.formBuilder.control(null, datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
        ddCycle: this.formBuilder.control(null),
        ddDysmenomhea: this.formBuilder.control(null),
        ddFlow: this.formBuilder.control(null),
        txtAgeAtMenarche: this.formBuilder.control(null),
        ddPara: this.formBuilder.control(null),
        ddGravida: this.formBuilder.control(null),
        txtYearOfMenopause: this.formBuilder.control(null, Validators.compose([Validators.min(1900), Validators.max(9999)])),
        txtNotes: this.formBuilder.control(null)
      }
      );

      this.formBuildDone = true;
    }
  }


  getGenderIdentityList() {
    this.generalService.getGenderIdentityList().subscribe(
      data => {
        this.lookupList.lstGenderIdentity = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.assignEditValues();
        }
      },
      error => {
        this.getGenderIdentityListError(error);
      }
    );
  }
  getGenderIdentityListError(error) {
    this.logMessage.log("getGenderIdentityList Error." + error);
  }
  getSexualOrientationList() {
    this.generalService.getSexualOrientationList().subscribe(
      data => {
        this.lookupList.lstSexualOrientation = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.assignEditValues();
        }
      },
      error => {
        this.getSexualOrientationListError(error);
      }
    );
  }

  getSexualOrientationListError(error) {
    this.logMessage.log("getSexualOrientationList Error." + error);
  }

  getMaritalStatusList() {
    this.generalService.getMaritalStatusList().subscribe(
      data => {
        this.lookupList.lstMaritalStatus = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.assignEditValues();
        }
      },
      error => {
        this.getMaritalStatusListError(error);
      }
    );
  }

  getMaritalStatusListError(error) {
    this.logMessage.log("getMaritalStatusList Error." + error);
  }
  getSmokingStatusList() {
    this.generalService.getSmokingStatusList().subscribe(
      data => {
        this.lookupList.lstSmokingStatus = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.assignEditValues();
        }
      },
      error => {
        this.getSmokingStatusListError(error);
      }
    );
  }

  getSmokingStatusListError(error) {
    this.logMessage.log("getSmokingStatusList Error." + error);
  }


  getChartSocialHistDetailById(SocialhistoryId: number) {
    this.encounterService.getChartSocialHistDetailById(SocialhistoryId).subscribe(
      data => {
        this.chartSocialHistoryDetail = data;

        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.assignEditValues();
        }
      },
      error => {
        this.loadingCount--;
        this.getChartSocialHistDetailByIdError(error);
      }
    );
  }

  getChartSocialHistDetailByIdError(error) {
    this.logMessage.log("getChartSocialHistDetailById Error." + error);
  }
  addEdit_Clicked() {

    debugger;
    this.chartSocialHistoryDetail == undefined;

    this.loadingCount = 0;

    if (this.lookupList.lstMaritalStatus == undefined || this.lookupList.lstMaritalStatus.length == 0) {
      this.loadingCount++;
      this.getMaritalStatusList();
    }

    if (this.lookupList.lstGenderIdentity == undefined || this.lookupList.lstGenderIdentity.length == 0) {
      this.loadingCount++;
      this.getGenderIdentityList();
    }
    if (this.lookupList.lstSexualOrientation == undefined || this.lookupList.lstSexualOrientation.length == 0) {
      this.loadingCount++;
      this.getSexualOrientationList();
    }
    if (this.lookupList.lstSmokingStatus == undefined || this.lookupList.lstSmokingStatus.length == 0) {
      this.loadingCount++;
      this.getSmokingStatusList();
    }
    if (this.chartSocialHistoryDisplay != undefined) {
      this.loadingCount++;
      this.getChartSocialHistDetailById(this.chartSocialHistoryDisplay.socialhistory_id);
    }

    if (this.loadingCount == 0) {
      this.assignEditValues();
    }
  }

  assignEditValues() {
    debugger;
    this.buildForm();
    this.addEditView = true;

    if (this.chartSocialHistoryDetail != undefined) {



      //this.maritalStatusDescription = this.chartSocialHistoryDetail.marital_status;

      (this.socialHistoryForm.get('ddMaritalStatus') as FormControl).setValue(this.chartSocialHistoryDetail.marital_status_code);
      (this.socialHistoryForm.get('ddChildren') as FormControl).setValue(this.chartSocialHistoryDetail.children);

      (this.socialHistoryForm.get('ddHighestEducation') as FormControl).setValue(this.chartSocialHistoryDetail.education);
      (this.socialHistoryForm.get('ddOccupation') as FormControl).setValue(this.chartSocialHistoryDetail.occupation);
      (this.socialHistoryForm.get('ddHomeEnvironment') as FormControl).setValue(this.chartSocialHistoryDetail.home_environment);
      (this.socialHistoryForm.get('ddDietEducation') as FormControl).setValue(this.chartSocialHistoryDetail.diet_education);

      //this.sexualOrientationDescription = this.chartSocialHistoryDetail.sexual_orientation;
      (this.socialHistoryForm.get('ddSexualOrientation') as FormControl).setValue(this.chartSocialHistoryDetail.sexual_orientation_code);
      if (this.chartSocialHistoryDetail.sexual_orientation_code == "OTH") {
        (this.socialHistoryForm.get('txtOtherSexualOrientation') as FormControl).setValue(this.chartSocialHistoryDetail.sexual_orientation);
      }


      //this.genderIdentityreDescription = this.chartSocialHistoryDetail.gender_identity;
      (this.socialHistoryForm.get('ddGenderIdentity') as FormControl).setValue(this.chartSocialHistoryDetail.gender_identity_code);
      if (this.chartSocialHistoryDetail.gender_identity_code == "OTH") {
        (this.socialHistoryForm.get('txtOtherGenderIdentity') as FormControl).setValue(this.chartSocialHistoryDetail.gender_identity);
      }

      //this.smokingStatusDescription = this.chartSocialHistoryDetail.smoking_status;
      (this.socialHistoryForm.get('ddSmokingStatus') as FormControl).setValue(this.chartSocialHistoryDetail.smoking_snomed);
      (this.socialHistoryForm.get('ddTobaccoType') as FormControl).setValue(this.chartSocialHistoryDetail.tobacco_type);
      (this.socialHistoryForm.get('ddPacksPerDay') as FormControl).setValue(this.chartSocialHistoryDetail.packs_per_day);
      (this.socialHistoryForm.get('ddYearStarted') as FormControl).setValue(this.chartSocialHistoryDetail.year_started);
      (this.socialHistoryForm.get('dfTobaccoStartDate') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.chartSocialHistoryDetail.smoking_start_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
      (this.socialHistoryForm.get('dfTobaccoEndDate') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.chartSocialHistoryDetail.smoking_end_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
      //(this.socialHistoryForm.get('dfTobaccoStartDate') as FormControl).setValue(this.chartSocialHistoryDetail.smoking_start_date);
      //(this.socialHistoryForm.get('dfTobaccoEndDate') as FormControl).setValue(this.chartSocialHistoryDetail.smoking_end_date);

      (this.socialHistoryForm.get('ddTobaccoCessation') as FormControl).setValue(this.chartSocialHistoryDetail.tobacco_cessation);

      (this.socialHistoryForm.get('ddAlcoholUse') as FormControl).setValue(this.chartSocialHistoryDetail.alcohol_per_day);
      (this.socialHistoryForm.get('ddCaffeineUse') as FormControl).setValue(this.chartSocialHistoryDetail.caffeine_per_day);
      (this.socialHistoryForm.get('ddETOH') as FormControl).setValue(this.chartSocialHistoryDetail.etoh);

      (this.socialHistoryForm.get('ddDrugUse') as FormControl).setValue(this.chartSocialHistoryDetail.drug_use);
      (this.socialHistoryForm.get('dfDrugQuiteDate') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.chartSocialHistoryDetail.quit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
      //(this.socialHistoryForm.get('dfDrugQuiteDate') as FormControl).setValue(this.chartSocialHistoryDetail.quit_date);
      (this.socialHistoryForm.get('ddExcercise') as FormControl).setValue(this.chartSocialHistoryDetail.exercise);
      (this.socialHistoryForm.get('ddSeatBelts') as FormControl).setValue(this.chartSocialHistoryDetail.seatbelt);
      (this.socialHistoryForm.get('ddExposure') as FormControl).setValue(this.chartSocialHistoryDetail.exposure);

      (this.socialHistoryForm.get('txtNotes') as FormControl).setValue(this.chartSocialHistoryDetail.comment);

      if (this.objencounterToOpen.openPatientInfo.patient_gender.toUpperCase() == "FEMALE" || this.objencounterToOpen.openPatientInfo.patient_gender.toUpperCase() == "F") {

        (this.socialHistoryForm.get('dfLMP') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.chartSocialHistoryDetail.lmp, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
        //(this.socialHistoryForm.get('dfLMP') as FormControl).setValue(this.chartSocialHistoryDetail.lmp);
        (this.socialHistoryForm.get('ddCycle') as FormControl).setValue(this.chartSocialHistoryDetail.cycle);
        //(this.socialHistoryForm.get('ddFlow') as FormControl).setValue(this.chartSocialHistoryDetail.ddFlow);
        (this.socialHistoryForm.get('ddFlow') as FormControl).setValue(this.chartSocialHistoryDetail.flow);
        (this.socialHistoryForm.get('ddDysmenomhea') as FormControl).setValue(this.chartSocialHistoryDetail.dysmenomhea);

        (this.socialHistoryForm.get('chkPregnant') as FormControl).setValue(this.chartSocialHistoryDetail.pregnant);
        (this.socialHistoryForm.get('dfEDD') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.chartSocialHistoryDetail.edd, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
        //(this.socialHistoryForm.get('dfEDD') as FormControl).setValue(this.chartSocialHistoryDetail.edd);

        (this.socialHistoryForm.get('ddPara') as FormControl).setValue(this.chartSocialHistoryDetail.para);
        (this.socialHistoryForm.get('ddGravida') as FormControl).setValue(this.chartSocialHistoryDetail.gravida);

        (this.socialHistoryForm.get('txtAgeAtMenarche') as FormControl).setValue(this.chartSocialHistoryDetail.age_at_menarche);
        (this.socialHistoryForm.get('txtYearOfMenopause') as FormControl).setValue(this.chartSocialHistoryDetail.year_of_menopause);
      }

    }
  }


  addEditSocialHistory() {

    this.addEditView = true;

  }
  cancelSocialHistory() {
    this.addEditView = false;

  }

  ValidateData(formData: any): boolean {

    debugger;

    let strAlertMsg: string = "";


    if (this.objencounterToOpen.openPatientInfo.patient_gender.toUpperCase() == "FEMALE"
      || this.objencounterToOpen.openPatientInfo.patient_gender.toUpperCase() == "F") {

      if (formData.dfLMP != "" && formData.dfLMP != undefined) {
        if (this.dateTimeUtil.checkIfFutureDate(formData.dfLMP, DateTimeFormat.DATEFORMAT_YYYY_MM_DD)) {
          strAlertMsg = "LMP Date Cant not be a future date.";
        }
      }

      if (formData.chkPregnant && strAlertMsg == "") {

        if (formData.dfLMP == "" || formData.dfLMP == undefined) {
          strAlertMsg = "Please enter LMP.";
        }
        else if (formData.dfEDD == "" || formData.dfEDD == undefined) {
          strAlertMsg = "Please enter EDD.";
        }
      }

      if (strAlertMsg == "" && formData.dfLMP != "" && formData.dfLMP != undefined && formData.dfEDD != "" && formData.dfEDD != undefined) {
        let dtCompareResult: number = this.dateTimeUtil.compareDate(formData.dfLMP, formData.dfEDD, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);
        if (dtCompareResult > 0) {
          strAlertMsg = "EDD can't be earlier than LMP Date.";
        }
      }
      if (strAlertMsg == "") {
        if (formData.txtYearOfMenopause != "" && formData.txtYearOfMenopause != undefined) {
          if (formData.txtYearOfMenopause.toString().length != 4) {
            strAlertMsg = "Year of Menopause is invalid. Required value in YYYY";
          }
        }
      }
    }

    if (strAlertMsg != "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Chart Social History', strAlertMsg, AlertTypeEnum.DANGER)
      return false;
    }
    else {
      return true;
    }
  }

  saveSocialHistory(formData: any) {

    if (this.ValidateData(formData)) {

      let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

      let obj_ORMChartSocialHistory:ORMChartSocialHistory = new ORMChartSocialHistory();

      obj_ORMChartSocialHistory.system_ip = this.lookupList.logedInUser.systemIp;
      obj_ORMChartSocialHistory.patient_id = Number(this.objencounterToOpen.patient_id);
      obj_ORMChartSocialHistory.chart_id = Number(this.objencounterToOpen.chart_id);
      obj_ORMChartSocialHistory.practice_id = this.lookupList.practiceInfo.practiceId;

      obj_ORMChartSocialHistory.modified_user = this.lookupList.logedInUser.user_name;
      obj_ORMChartSocialHistory.client_date_modified = clientDateTime;

      if (this.chartSocialHistoryDetail == null) {
        obj_ORMChartSocialHistory.created_user = this.lookupList.logedInUser.user_name;
        obj_ORMChartSocialHistory.client_date_created = clientDateTime;
      } else {
        obj_ORMChartSocialHistory.socialhistory_id = this.chartSocialHistoryDetail.socialhistory_id;//this.listSocialHistory.socialhistory_id;
        obj_ORMChartSocialHistory.created_user = this.chartSocialHistoryDetail.created_user;
        obj_ORMChartSocialHistory.date_created = this.chartSocialHistoryDetail.date_created;
        obj_ORMChartSocialHistory.client_date_created = this.chartSocialHistoryDetail.client_date_created;
      }

      //obj_ORMChartSocialHistory.marital_status_code = formData.ddMaritalStatus
      //obj_ORMChartSocialHistory.marital_status = this.maritalStatusDescription;

      if (formData.ddMaritalStatus != undefined && formData.ddMaritalStatus != "") {
        obj_ORMChartSocialHistory.marital_status_code = formData.ddMaritalStatus;
        let selectedSite = new ListFilterPipe().transform(this.lookupList.lstMaritalStatus, "code", formData.ddMaritalStatus);
        obj_ORMChartSocialHistory.marital_status = selectedSite[0].display;
      }


      obj_ORMChartSocialHistory.children = formData.ddChildren;
      obj_ORMChartSocialHistory.education = formData.ddHighestEducation;
      obj_ORMChartSocialHistory.occupation = formData.ddOccupation;
      obj_ORMChartSocialHistory.home_environment = formData.ddHomeEnvironment;
      obj_ORMChartSocialHistory.diet_education = formData.ddDietEducation;

      if (formData.ddSexualOrientation != undefined && formData.ddSexualOrientation != "") {
        obj_ORMChartSocialHistory.sexual_orientation_code = formData.ddSexualOrientation;

        if (formData.ddSexualOrientation == "OTH") {
          obj_ORMChartSocialHistory.sexual_orientation = formData.txtOtherSexualOrientation;
        }
        else {
          let selectedSexOrientation = new ListFilterPipe().transform(this.lookupList.lstSexualOrientation, "code", formData.ddSexualOrientation);
          obj_ORMChartSocialHistory.sexual_orientation = selectedSexOrientation[0].description;
        }

      }


      if (formData.ddGenderIdentity != undefined && formData.ddGenderIdentity != "") {
        obj_ORMChartSocialHistory.gender_identity_code = formData.ddGenderIdentity;

        if (formData.ddGenderIdentity == "OTH") {
          obj_ORMChartSocialHistory.gender_identity = formData.txtOtherGenderIdentity;
        }
        else {
          let selectedGenderIdentity = new ListFilterPipe().transform(this.lookupList.lstGenderIdentity, "code", formData.ddGenderIdentity);
          obj_ORMChartSocialHistory.gender_identity = selectedGenderIdentity[0].description;
        }

      }

      if (formData.ddSmokingStatus != undefined && formData.ddSmokingStatus != "") {
        obj_ORMChartSocialHistory.smoking_snomed = formData.ddSmokingStatus;
        let selectedSmokStatus = new ListFilterPipe().transform(this.lookupList.lstSmokingStatus, "code", formData.ddSmokingStatus);
        obj_ORMChartSocialHistory.smoking_status = selectedSmokStatus[0].description;
      }

      obj_ORMChartSocialHistory.smoking_snomed = formData.ddSmokingStatus;
      obj_ORMChartSocialHistory.tobacco_type = formData.ddTobaccoType;
      obj_ORMChartSocialHistory.packs_per_day = formData.ddPacksPerDay;
      obj_ORMChartSocialHistory.year_started = formData.ddYearStarted;
      obj_ORMChartSocialHistory.smoking_start_date = this.dateTimeUtil.getStringDateFromDateModel(formData.dfTobaccoStartDate);
      obj_ORMChartSocialHistory.smoking_end_date = this.dateTimeUtil.getStringDateFromDateModel(formData.dfTobaccoEndDate);
      //obj_ORMChartSocialHistory.smoking_start_date = formData.dfTobaccoStartDate;
      //obj_ORMChartSocialHistory.smoking_end_date = formData.dfTobaccoEndDate;

      obj_ORMChartSocialHistory.tobacco_cessation = formData.ddTobaccoCessation;

      obj_ORMChartSocialHistory.alcohol_per_day = formData.ddAlcoholUse;
      obj_ORMChartSocialHistory.caffeine_per_day = formData.ddCaffeineUse;
      obj_ORMChartSocialHistory.etoh = formData.ddETOH;

      obj_ORMChartSocialHistory.drug_use = formData.ddDrugUse;
      obj_ORMChartSocialHistory.quit_date = this.dateTimeUtil.getStringDateFromDateModel(formData.dfDrugQuiteDate);
      //obj_ORMChartSocialHistory.quit_date = formData.dfDrugQuiteDate;
      obj_ORMChartSocialHistory.exercise = formData.ddExcercise;
      obj_ORMChartSocialHistory.seatbelt = formData.ddSeatBelts;
      obj_ORMChartSocialHistory.exposure = formData.ddExposure;

      obj_ORMChartSocialHistory.comment = formData.txtNotes;

      if (this.objencounterToOpen.openPatientInfo.patient_gender.toUpperCase() == "FEMALE" || this.objencounterToOpen.openPatientInfo.patient_gender.toUpperCase() == "F") {
        obj_ORMChartSocialHistory.lmp = this.dateTimeUtil.getStringDateFromDateModel(formData.dfLMP);
        //obj_ORMChartSocialHistory.lmp = formData.dfLMP;
        obj_ORMChartSocialHistory.cycle = formData.ddCycle;
        obj_ORMChartSocialHistory.flow = formData.ddFlow;
        obj_ORMChartSocialHistory.dysmenomhea = formData.ddDysmenomhea;

        obj_ORMChartSocialHistory.age_at_menarche = formData.txtAgeAtMenarche;
        obj_ORMChartSocialHistory.year_of_menopause = formData.txtYearOfMenopause;

        obj_ORMChartSocialHistory.pregnant = formData.chkPregnant;
        obj_ORMChartSocialHistory.edd = this.dateTimeUtil.getStringDateFromDateModel(formData.dfEDD);
        //obj_ORMChartSocialHistory.edd = formData.dfEDD;
        obj_ORMChartSocialHistory.gravida = formData.ddGravida;
        obj_ORMChartSocialHistory.para = formData.ddPara;
      }


      this.encounterService.saveSocialHistory(obj_ORMChartSocialHistory).subscribe(
        data => {
          this.saveSocialHistorySuccess(data);
        },
        error => {
          this.saveSocialHistoryError(error);
        }
      );
    }

  }

  saveSocialHistorySuccess(data) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.getChartSocialHistDisplay();
      this.addEditView = false;
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Chart Social History', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveSocialHistoryError(error) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Chart Social History', "An Error Occured while Chart Social History.", AlertTypeEnum.DANGER)
  }

  popUpOptionsLarge: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true,
    size: 'lg'
  };

  getHistorySocialHist_OLD() {
    const modalRef = this.ngbModal.open(ChartModuleHistoryComponent, this.popUpOptionsLarge);
    let obj_charthistory:chartmodulehistory = new chartmodulehistory();
    obj_charthistory.titleString = "Social History";
    obj_charthistory.moduleName = "socal_history_log";
    //GeneralOptions.LoadHistory("Socal History","socal_history_log",criteria);
    //this.obj_charthistory.criteria = this.lookupList.practiceInfo.practiceId + " and cs.socialhistory_id='" + this.chartSocialHistoryDisplay.socialhistory_id +"' ";
    obj_charthistory.criteria = " and cs.socialhistory_id='" + this.chartSocialHistoryDisplay.socialhistory_id + "' ";
    modalRef.componentInstance.data = obj_charthistory;
    let closeResult;

    modalRef.result.then((result) => {
      if (result == true) {
        //this.getAllUsers((this.userForm.get('ctrlStatus') as FormControl).value);
      }
    }
      , (reason) => {
        //alert(reason);
      });
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  getHistorySocialHist(){
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "socal_history_log";
    logParameters.logDisplayName = "Social History Log";
    logParameters.logMainTitle = "Social History Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
    
    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.ngbModal.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }

  dateFeildFocusOut(event: any) {

    if (event.target.value == undefined || event.target.value == "") {
      event.target.value = "";
    }
  }

}