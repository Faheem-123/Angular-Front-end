import { Component, OnInit, Input, Inject } from '@angular/core';
import { ServiceResponseStatusEnum, ImmunizationEntryTypeEnum, AlertTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { NgbActiveModal, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ImmunizationService } from 'src/app/services/immunization.service';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { datetimeValidator, CustomValidators } from 'src/app/shared/custome-validators';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { DateModel } from 'src/app/models/general/date-model';
import { ORMSavePatientImmRegInfo } from 'src/app/ehr-modules/immunization-registry/orm-save-imm-reg-info';
import { GeneralService } from 'src/app/services/general/general.service';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ImmRegVXUCriteria } from '../imm-reg-vxu-criteria';

@Component({
  selector: 'generate-imm-reg-update-message',
  templateUrl: './generate-imm-reg-update-message.component.html',
  styleUrls: ['./generate-imm-reg-update-message.component.css']
})
export class GenerateImmRegUpdateMessageComponent implements OnInit {

  @Input() lstRegSelectedChartImmunizationIds: Array<number>;
  @Input() patientId: number;
  @Input() chartId: number;

  lstRegSelectedImmunization: Array<any>;

  isLoading: boolean = false;
  isRegistryFileProcessing: boolean = false;
  registryProcessStatus: ServiceResponseStatusEnum;
  isSubmitAfterGenerate: boolean = false;

  regMessageId: string = "";
  regMessageString: string = "";
  regMessageErroList: Array<any>;

  loadingCount: number = 0;

  fileGenerationSuccessMsg: string = "File has been generated successfully.";


  selectedClinicId: string = "";
  registryCode: string = "";

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  patientImmRegInfo: any;
  immRegPublicityCodeDescription: string = "";

  canDownloadHL7File: boolean = false;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal,
    private immService: ImmunizationService,
    private logMessage: LogMessage,
    private encounterService: EncounterService,
    private dateTimeUtil: DateTimeUtil,
    private generalService: GeneralService) { }

  registryFormGroup: FormGroup;

  ngOnInit() {

    debugger;

    if (this.lookupList.logedInUser.user_name.toLocaleLowerCase() == "admin@mchc") {
      this.canDownloadHL7File = true;
    }

    this.registryFormGroup = this.formBuilder.group({
      ddOffice: this.formBuilder.control(undefined, Validators.required),
      ddImmRegStatus: this.formBuilder.control(undefined),
      dpImmRegStatusEffectiveDate: this.formBuilder.control(undefined, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),

      ddImmRegPublicityCode: this.formBuilder.control(undefined),
      dpImmRegPublicityCodeEffectiveDate: this.formBuilder.control(undefined, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),

      ddImmRegProtectionIndicator: this.formBuilder.control(undefined),
      dpImmRegProtectionIndicatorEffectiveDate: this.formBuilder.control(undefined, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ]))

    }
      ,
      {
        validator: Validators.compose([
          CustomValidators.requiredWhenNotNull('dpImmRegStatusEffectiveDate', 'ddImmRegStatus'),
          CustomValidators.requiredWhenNotNull('dpImmRegPublicityCodeEffectiveDate', 'ddImmRegPublicityCode'),
          CustomValidators.requiredWhenNotNull('dpImmRegProtectionIndicatorEffectiveDate', 'ddImmRegProtectionIndicator')
        ])
      }
    );

    this.isLoading = true;
    this.loadingCount++;
    this.getChartImmunizationSummary();

    if (this.lookupList.lstImmRegClinics == undefined || this.lookupList.lstImmRegClinics.length == 0) {
      this.loadingCount++;
      this.getImmRegistryClinics();
    }

    if (this.lookupList.lstImmRegStatus == undefined || this.lookupList.lstImmRegStatus.length == 0) {

      this.loadingCount++;
      this.getImmRegistryStatusList();
    }

    if (this.lookupList.lstImmRegPublicityCode == undefined || this.lookupList.lstImmRegPublicityCode.length == 0) {

      this.loadingCount++;
      this.getImmRegistryPublicityCodeList();
    }

    if (this.lookupList.lstImmRegProtectionIndicator == undefined || this.lookupList.lstImmRegProtectionIndicator.length == 0) {

      this.loadingCount++;
      this.getImmRegistryProcectionIndicatorList();
    }


    this.loadingCount++;
    this.getPatientImmRegInfo();

  }

  getPatientImmRegInfo() {
    this.immService.getPatientImmRegInfo(this.patientId).subscribe(
      data => {
        this.patientImmRegInfo = data;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
          this.assignDefaultRegistry();
        }

      },
      error => {
        this.isLoading = false;
        this.getPatientImmRegInfoError(error);
      }
    );
  }

  getPatientImmRegInfoError(error: any) {
    this.logMessage.log("getPatientImmRegInfo Error." + error);
  }


  getChartImmunizationSummary() {

    //this.isLoading = true;
    //this.noRecordFound = false;

    debugger;
    let chartImmIds: string = "";

    this.lstRegSelectedChartImmunizationIds.forEach(id => {

      if (chartImmIds != undefined && chartImmIds != "") {
        chartImmIds += ",";
      }
      chartImmIds += id.toString();
    });

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "chart_id", value: this.chartId, option: "" },
      { name: "chart_immunization_ids", value: chartImmIds, option: "" },
      { name: "include_deleted", value: true, option: "" }
    ];


    this.encounterService.getChartImmunizationSummary(searchCriteria)
      .subscribe(
        data => {


          this.lstRegSelectedImmunization = data as Array<any>;
          this.loadingCount--;
          if (this.loadingCount == 0) {
            this.isLoading = false;
            this.assignDefaultRegistry();
          }
        },
        error => {
          debugger;
          this.getChartImmunizationSummaryError(error);
          this.isLoading = false;
        }
      );
  }

  getChartImmunizationSummaryError(error: any) {
    this.logMessage.log("getChartImmunizationSummary Error." + error);
  }

  getImmRegistryClinics() {
    this.immService.getRegistryClinics(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lookupList.lstImmRegClinics = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
          this.assignDefaultRegistry();
        }
      },
      error => {

        this.isLoading = false;
        this.getImmRegistryClinicsError(error);
      }
    );
  }

  getImmRegistryClinicsError(error: any) {
    this.logMessage.log("getImmRegistryClinics Error." + error);
  }

  getImmRegistryStatusList() {

    debugger;
    this.generalService.getImmRegistryStatusList().subscribe(
      data => {

        debugger;
        this.lookupList.lstImmRegStatus = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          //if (this.patientId != undefined) {
          this.assignDefaultRegistry();
          //}
          //else {
          //this.isLoading = false;
          //}
        }
      },
      error => {
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
        }
        this.getImmRegistryStatusListError(error);
      }
    );
  }

  getImmRegistryStatusListError(error) {
    this.logMessage.log("getImmRegistryStatusList Error." + error);
  }


  getImmRegistryPublicityCodeList() {
    this.generalService.getImmRegistryPublicityCodeList().subscribe(
      data => {
        this.lookupList.lstImmRegPublicityCode = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          //if (this.patientId != undefined) {
          this.assignDefaultRegistry();
          //}
          //else {
          //this.isLoading = false;
          //}
        }
      },
      error => {
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
        }
        this.getImmRegistryPublicityCodeListError(error);
      }
    );
  }

  getImmRegistryPublicityCodeListError(error) {
    this.logMessage.log("getImmRegistryPublicityCodeList Error." + error);
  }

  getImmRegistryProcectionIndicatorList() {
    this.generalService.getImmRegistryProcectionIndicatorList().subscribe(
      data => {
        this.lookupList.lstImmRegProtectionIndicator = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          //if (this.patientId != undefined) {
          this.assignDefaultRegistry();
          //}
          //else {
          //this.isLoading = false;
          //}
        }
      },
      error => {
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
        }
        this.getImmRegistryProcectionIndicatorListError(error);
      }
    );
  }

  getImmRegistryProcectionIndicatorListError(error) {
    this.logMessage.log("getImmRegistryProcectionIndicatorList Error." + error);
  }

  getAdministeredDescriptions(vaccineInfo: any) {

    let lstInfo: Array<string>;

    let type: string = "";
    let deccription: string = "";

    switch (vaccineInfo.entry_type.toString().toLowerCase()) {
      case ImmunizationEntryTypeEnum.ADMINISTERED:
        type = "New Administered";
        if (vaccineInfo.completion_status_code.toString().toLowerCase() == "cp") {
          deccription = "(Complete)";
        }
        else if (vaccineInfo.completion_status_code.toString().toLowerCase() == "pa") {
          deccription = "(Partially Administered)";
        }
        else if (vaccineInfo.completion_status_code.toString().toLowerCase() == "na") {
          deccription = "(Not Administered)";
        }

        break;
      case ImmunizationEntryTypeEnum.REFUSED:
        type = "Refused";
        deccription = "(" + vaccineInfo.reason_description + ")"
        break;
      case ImmunizationEntryTypeEnum.HISTORICAL:
        type = "Historical";
        if (vaccineInfo.administered_code_description.toString().split("-").length > 1) {
          deccription = "(" + vaccineInfo.administered_code_description.toString().split("-")[1] + ")";
        }
        else {
          deccription = "(" + vaccineInfo.administered_code_description + ")";
        }
        break;

      default:
        break;
    }

    lstInfo = new Array<string>();
    lstInfo.push(type);
    lstInfo.push(deccription);

    return lstInfo;
  }

  assignDefaultRegistry() {

    debugger;
    //let id: number = null;

    if (this.lookupList.lstImmRegClinics != undefined) {

      if (this.lookupList.lstImmRegClinics.length == 1) {
        this.selectedClinicId = this.lookupList.lstImmRegClinics[0].clinic_id;
        this.registryCode = this.lookupList.lstImmRegClinics[0].registry_code;
      }
      else {
        this.lookupList.lstImmRegClinics.forEach(clinic => {
          if (clinic.location_id == this.lstRegSelectedImmunization[0].location_id) {
            this.selectedClinicId = clinic.clinic_id;
            this.registryCode = clinic.registry_code;
          }
        });
      }
      this.registryFormGroup.get("ddOffice").setValue(this.selectedClinicId);
    }

    if (this.patientImmRegInfo != undefined) {

      let dtModel: DateModel;

      (this.registryFormGroup.get("ddImmRegStatus") as FormControl).setValue(this.patientImmRegInfo.registry_status);
      (this.registryFormGroup.get("ddImmRegPublicityCode") as FormControl).setValue(this.patientImmRegInfo.publicity_code);
      (this.registryFormGroup.get("ddImmRegProtectionIndicator") as FormControl).setValue(this.patientImmRegInfo.protection_indicator);

      dtModel = this.dateTimeUtil.getDateModelFromDateString(this.patientImmRegInfo.registry_status_effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      (this.registryFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).setValue(dtModel);

      dtModel = this.dateTimeUtil.getDateModelFromDateString(this.patientImmRegInfo.publicity_code_effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      (this.registryFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).setValue(dtModel);

      dtModel = this.dateTimeUtil.getDateModelFromDateString(this.patientImmRegInfo.protection_indicator_effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      (this.registryFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).setValue(dtModel);

      this.immRegPublicityCodeDescription = this.patientImmRegInfo.publicity_code_description;
    }
  }

  removeRegSelectedImmunization(index: number) {
    this.lstRegSelectedImmunization.splice(index, 1);
  }

  lstErrors: Array<string> = [];
  validateSaveData(): boolean {

    debugger;

    let isValid: boolean = true;
    this.lstErrors = [];


    if ((this.registryFormGroup.get("ddImmRegStatus") as FormControl).value != undefined
      && (this.registryFormGroup.get("ddImmRegStatus") as FormControl).value != ''
      && (this.registryFormGroup.get("ddImmRegStatus") as FormControl).value != null
    ) {

      if ((this.registryFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).value == undefined
        || (this.registryFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).value == ''
        || (this.registryFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).value == null

      ) {
        this.lstErrors.push("Please enter Immunization Registry Status Effective Date.");
      }
      else if (!this.dateTimeUtil.isValidDateTime((this.registryFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).value, DateTimeFormat.DATE_MODEL)) {
        this.lstErrors.push("Immunization Registry Status Effective Date is not in correct formate.");
      }
      else if (this.dateTimeUtil.checkIfFutureDate((this.registryFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).value, DateTimeFormat.DATE_MODEL)) {
        this.lstErrors.push("Immunization Registry Status Effective Date cannot be a future date.");
      }

    }
    if ((this.registryFormGroup.get("ddImmRegPublicityCode") as FormControl).value != undefined
      && (this.registryFormGroup.get("ddImmRegPublicityCode") as FormControl).value != ''
      && (this.registryFormGroup.get("ddImmRegPublicityCode") as FormControl).value != null
    ) {

      if ((this.registryFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).value == undefined
        || (this.registryFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).value == ''
        || (this.registryFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).value == null

      ) {
        this.lstErrors.push("Please enter Immunization Publicity Code Effective Date.");
      }
      else if (!this.dateTimeUtil.isValidDateTime((this.registryFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).value, DateTimeFormat.DATE_MODEL)) {
        this.lstErrors.push("Immunization Registry Publicity Code Effective Date is not in correct formate.");
      }
      else if (this.dateTimeUtil.checkIfFutureDate((this.registryFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).value, DateTimeFormat.DATE_MODEL)) {
        this.lstErrors.push("Immunization Registry Publicity Code Effective Date cannot be a future date.");
      }

    }

    if ((this.registryFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value != undefined
      && (this.registryFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value != ''
      && (this.registryFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value != null
    ) {

      if ((this.registryFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).value == undefined
        || (this.registryFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).value == ''
        || (this.registryFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).value == null

      ) {
        this.lstErrors.push("Please enter Immunization Protection Indicator Effective Date.");
      }
      else if (!this.dateTimeUtil.isValidDateTime((this.registryFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).value, DateTimeFormat.DATE_MODEL)) {
        this.lstErrors.push("Immunization Registry Protection Indicator Effective Date is not in correct formate.");
      }

      else if (this.dateTimeUtil.checkIfFutureDate((this.registryFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).value, DateTimeFormat.DATE_MODEL)) {
        this.lstErrors.push("Immunization Registry Protection Indicator Effective Date cannot be a future date.");
      }

    }

    if (this.lstErrors.length > 0) {
      isValid = false;
    }
    return isValid;

  }

  generateHL7(submitAfterGenerate: boolean) {

    debugger;
    if (!this.validateSaveData()) {
      return;
    }

    debugger;
    let strMsg: string = "";

    if (this.lstRegSelectedImmunization == undefined || this.lstRegSelectedImmunization.length == 0) {
      strMsg = "No Immunization is selected.";
    }
    else if (this.registryFormGroup.get("ddOffice").value == undefined || this.registryFormGroup.get("ddOffice").value == "") {
      strMsg = "Please select Office.";
    }

    if (strMsg != "") {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = "Immunization Registry"
      modalRef.componentInstance.promptMessage = strMsg;
    }
    else {

      this.registryFormGroup.disable();
      this.isSubmitAfterGenerate = submitAfterGenerate;
      this.isRegistryFileProcessing = true;


      this.selectedClinicId = this.registryFormGroup.get("ddOffice").value;

      // let clinicId: string = "";
      //let registryCode: string = "";


      this.lookupList.lstImmRegClinics.forEach(clinic => {
        if (clinic.clinic_id == this.selectedClinicId) {
          this.registryCode = clinic.registry_code;
        }
      });

      let lstChartImmIds: Array<number> = new Array<number>();
      this.lstRegSelectedImmunization.forEach(imm => {
        lstChartImmIds.push(imm.chart_immunization_id);
      });

      let ormSavePatientImmRegInfo: ORMSavePatientImmRegInfo;

      if (this.registryFormGroup.get('ddImmRegStatus').dirty
        || this.registryFormGroup.get('dpImmRegStatusEffectiveDate').dirty
        || this.registryFormGroup.get('ddImmRegPublicityCode').dirty
        || this.registryFormGroup.get('dpImmRegPublicityCodeEffectiveDate').dirty
        || this.registryFormGroup.get('ddImmRegProtectionIndicator').dirty
        || this.registryFormGroup.get('dpImmRegProtectionIndicatorEffectiveDate').dirty) {

        ormSavePatientImmRegInfo = new ORMSavePatientImmRegInfo();

        ormSavePatientImmRegInfo.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSavePatientImmRegInfo.modified_user = this.lookupList.logedInUser.user_name;

        if (this.patientImmRegInfo != undefined) {


          ormSavePatientImmRegInfo.registry_info_id = this.patientImmRegInfo.registry_info_id;
          ormSavePatientImmRegInfo.date_created = this.patientImmRegInfo.date_created;
          ormSavePatientImmRegInfo.created_user = this.patientImmRegInfo.created_user;
          ormSavePatientImmRegInfo.client_date_created = this.patientImmRegInfo.client_date_created;


          let dtModel: DateModel;

          (this.registryFormGroup.get("ddImmRegStatus") as FormControl).setValue(this.patientImmRegInfo.registry_status);
          (this.registryFormGroup.get("ddImmRegPublicityCode") as FormControl).setValue(this.patientImmRegInfo.publicity_code);
          (this.registryFormGroup.get("ddImmRegProtectionIndicator") as FormControl).setValue(this.patientImmRegInfo.protection_indicator);

          dtModel = this.dateTimeUtil.getDateModelFromDateString(this.patientImmRegInfo.registry_status_effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
          (this.registryFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).setValue(dtModel);

          dtModel = this.dateTimeUtil.getDateModelFromDateString(this.patientImmRegInfo.publicity_code_effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
          (this.registryFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).setValue(dtModel);

          dtModel = this.dateTimeUtil.getDateModelFromDateString(this.patientImmRegInfo.protection_indicator_effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
          (this.registryFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).setValue(dtModel);

          this.immRegPublicityCodeDescription = this.patientImmRegInfo.publicity_code_description;
        }
        else {

          ormSavePatientImmRegInfo.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
          ormSavePatientImmRegInfo.created_user = this.lookupList.logedInUser.user_name;
        }

        ormSavePatientImmRegInfo.patient_id = this.patientId;
        ormSavePatientImmRegInfo.practice_id = this.lookupList.practiceInfo.practiceId;
        ormSavePatientImmRegInfo.system_ip = this.lookupList.logedInUser.systemIp;

        if (this.registryFormGroup.get('ddImmRegStatus').value != undefined && this.registryFormGroup.get('ddImmRegStatus').value !== "") {
          ormSavePatientImmRegInfo.registry_status = this.registryFormGroup.get("ddImmRegStatus").value;
          ormSavePatientImmRegInfo.registry_status_effective_date = this.dateTimeUtil.getStringDateFromDateModel(this.registryFormGroup.get("dpImmRegStatusEffectiveDate").value);
        }

        if (this.registryFormGroup.get('ddImmRegPublicityCode').value != undefined && this.registryFormGroup.get('ddImmRegPublicityCode').value !== "") {

          ormSavePatientImmRegInfo.publicity_code = this.registryFormGroup.get("ddImmRegPublicityCode").value;
          ormSavePatientImmRegInfo.publicity_code_effective_date = this.dateTimeUtil.getStringDateFromDateModel(this.registryFormGroup.get("dpImmRegPublicityCodeEffectiveDate").value);

          let selectedPublicityOption = new ListFilterPipe().transform(this.lookupList.lstImmRegPublicityCode, "code", this.registryFormGroup.get("ddImmRegPublicityCode").value);
          ormSavePatientImmRegInfo.publicity_code_description = selectedPublicityOption[0].description;
        }

        if (this.registryFormGroup.get('ddImmRegProtectionIndicator').value != undefined && this.registryFormGroup.get('ddImmRegProtectionIndicator').value !== "") {
          ormSavePatientImmRegInfo.protection_indicator = this.registryFormGroup.get("ddImmRegProtectionIndicator").value;
          ormSavePatientImmRegInfo.protection_indicator_effective_date = this.dateTimeUtil.getStringDateFromDateModel(this.registryFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate").value);
        }
      }


      let immRegVXUCriteria: ImmRegVXUCriteria = new ImmRegVXUCriteria(
        this.lookupList.practiceInfo.practiceId,
        this.patientId,
        this.chartId,
        this.selectedClinicId,
        this.registryCode,
        this.lookupList.logedInUser.user_name,
        this.lookupList.logedInUser.systemIp,
        this.isSubmitAfterGenerate,
        lstChartImmIds,
        ormSavePatientImmRegInfo
      )

      this.immService.generateRegistryVXU_HL7(immRegVXUCriteria).subscribe(
        data => {
          debugger;

          this.generateImmunizationVXU_HL7_FileSuccess(data);
        },
        error => {
          debugger;
          this.generateImmunizationVXU_HL7_FileError(error);
        }
      );
    }
  }


  generateImmunizationVXU_HL7_FileSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      if (this.isSubmitAfterGenerate) {
        this.fileGenerationSuccessMsg = "File has been generated successfully and queued for submission.";
      }
      else {
        this.fileGenerationSuccessMsg = "File has been generated successfully.";
      }


      this.regMessageErroList = undefined;
      this.registryProcessStatus = ServiceResponseStatusEnum.SUCCESS;
      this.regMessageId = data.result;
      this.regMessageString = data.response;
      this.isRegistryFileProcessing = false;

      //this.activeModal.close(true);

      //alert(this.regMessageString);
    }

    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.registryProcessStatus = ServiceResponseStatusEnum.ERROR;
      this.regMessageId = data.result;
      this.regMessageErroList = data.response_list as Array<any>;
      this.isRegistryFileProcessing = false;
      //GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry', data.response, AlertTypeEnum.DANGER)
    }
  }


  generateImmunizationVXU_HL7_FileError(error: any) {

    this.registryProcessStatus = ServiceResponseStatusEnum.ERROR;
    this.regMessageErroList = new Array<any>();
    this.regMessageErroList.push({ immunization: "VXU File Generation", segment: "ERROR", description: "An Error Occured while Generating Regisry File" });
    this.isRegistryFileProcessing = false;
    //GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry', "An Error Occured while Generating Regisry File", 
    //AlertTypeEnum.DANGER)
  }

  close(reason: string) {

    if (this.isRegistryFileProcessing) {

      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Immunization Registry';
      modalRef.componentInstance.promptMessage = 'Registry file generation is in progress.<br> Do you want to close ?';
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;


      modalRef.result.then((result) => {

        debugger;
        if (result == PromptResponseEnum.YES) {
          this.activeModal.dismiss(reason);
        }
      }, (reason) => {
        //alert(reason);
      });

    }
    else {

      if (this.registryProcessStatus == ServiceResponseStatusEnum.SUCCESS) {
        this.activeModal.close(true);
      }
      else {
        this.activeModal.dismiss(reason);
      }
    }
  }

  downlaodGeneratedFile() {
    GeneralOperation.dyanmicDownloadByHtmlTag({
      fileName: this.regMessageId + '.hl7',
      text: this.regMessageString
    });
  }

  populatePatientImmRegInfoSaveObject(): ORMSavePatientImmRegInfo {

    debugger;
    let objImmRegInfo: ORMSavePatientImmRegInfo;
    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    if (this.patientImmRegInfo != undefined
      || (this.registryFormGroup.get("ddImmRegStatus") as FormControl).value != undefined
      || (this.registryFormGroup.get("ddImmRegPublicityCode") as FormControl).value != undefined
      || (this.registryFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value != undefined) {

      objImmRegInfo = new ORMSavePatientImmRegInfo();

      if (this.patientImmRegInfo != undefined) {
        objImmRegInfo.registry_info_id = this.patientImmRegInfo.registry_info_id;
        objImmRegInfo.date_created = this.patientImmRegInfo.date_created;
        objImmRegInfo.client_date_created = this.patientImmRegInfo.client_date_created;
        objImmRegInfo.created_user = this.patientImmRegInfo.created_user;
      }
      else {
        objImmRegInfo.client_date_created = clientDateTime;
        objImmRegInfo.created_user = this.lookupList.logedInUser.user_name;
      }

      objImmRegInfo.patient_id = this.patientId;
      objImmRegInfo.modified_user = this.lookupList.logedInUser.user_name;
      objImmRegInfo.client_date_modified = clientDateTime;
      objImmRegInfo.system_ip = this.lookupList.logedInUser.systemIp;
      objImmRegInfo.practice_id = this.lookupList.practiceInfo.practiceId;

      if ((this.registryFormGroup.get("ddImmRegStatus") as FormControl).value != undefined) {
        objImmRegInfo.registry_status = (this.registryFormGroup.get("ddImmRegStatus") as FormControl).value;
        let regSatusDate = this.dateTimeUtil.getStringDateFromDateModel((this.registryFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).value);
        objImmRegInfo.registry_status_effective_date = regSatusDate;
      }
      else {
        objImmRegInfo.registry_status = "";
      }
      if ((this.registryFormGroup.get("ddImmRegPublicityCode") as FormControl).value != undefined) {
        objImmRegInfo.publicity_code = (this.registryFormGroup.get("ddImmRegPublicityCode") as FormControl).value;
        objImmRegInfo.publicity_code_description = this.immRegPublicityCodeDescription;
        let regPubDate = this.dateTimeUtil.getStringDateFromDateModel((this.registryFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).value);
        objImmRegInfo.publicity_code_effective_date = regPubDate;
      }
      else {
        objImmRegInfo.publicity_code = "";
        objImmRegInfo.publicity_code_description = "";
      }
      if ((this.registryFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value != undefined) {
        objImmRegInfo.protection_indicator = (this.registryFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value;
        if ((this.registryFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value != '') {
          let regProcDate = this.dateTimeUtil.getStringDateFromDateModel((this.registryFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).value);
          objImmRegInfo.protection_indicator_effective_date = regProcDate;
        }
      }
      else {
        objImmRegInfo.protection_indicator = "";
      }
    }



    return objImmRegInfo;
  }


}
