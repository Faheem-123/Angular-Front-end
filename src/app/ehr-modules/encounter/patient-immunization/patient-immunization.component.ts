import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { EncounterToOpen } from '../../../models/encounter/EncounterToOpen';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModalOptions, NgbTimepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { LogMessage } from '../../../shared/log-message';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ListFilterGeneral } from 'src/app/shared/filter-pipe-general';
import { ListFilterContainThreeColumns } from 'src/app/shared/filter-pipe-three-columns';
import { ServiceResponseStatusEnum, PromptResponseEnum, OperationType, ImmunizationEntryTypeEnum, AlertTypeEnum, RegExEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralService } from 'src/app/services/general/general.service';
import { AddVisComponent } from './add-vis/add-vis.component';
import { ListFilterGeneralNotIn } from 'src/app/shared/filter-pipe-general-not-in';
import { CustomValidators, datetimeValidator } from 'src/app/shared/custome-validators';
import { DateModel } from 'src/app/models/general/date-model';
import { TimeModel } from 'src/app/models/general/time-model';
import { ORMChartImmunizationSave } from 'src/app/models/encounter/immunization/orm-chart-immunization-save';
import { WrapperImmunizationSave } from 'src/app/models/encounter/immunization/wrapper-chart-immunization-save';
import { ORMChartImmunizationVISSave } from 'src/app/models/encounter/immunization/orm-chart-immunization-vis-save';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ImmunizationService } from 'src/app/services/immunization.service';
import { GenerateImmRegUpdateMessageComponent } from '../../immunization-registry/generate-imm-reg-update-message/generate-imm-reg-update-message.component';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { LogParameters } from '../../log/log-parameters';

@Component({
  selector: 'patient-immunization',
  templateUrl: './patient-immunization.component.html',
  styleUrls: ['./patient-immunization.component.css']
})
export class PatientImmunizationComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  radioForm: FormGroup;
  vaccineFormGroup: FormGroup;
  registryFormGroup: FormGroup;

  title: string = "Immunization/Injections";

  showImmunizationSearch: boolean = false;
  lstUnits: Array<string> = ["", "mL", "cc", "gm", "oz", "mg"];
  lstCompletionStatus: Array<any> = [
    { status_code: "CP", status_description: "Complete" },
    { status_code: "PA", status_description: "Partially Administered" },
    { status_code: "NA", status_description: "Not Administered" }];



  editOperation: string = "";
  canView: boolean = false;
  canAddEdit: boolean = false;
  canTransmitToRegistry: boolean = false;

  noRecordFound: boolean = false;
  isLoading: boolean = false;
  isAddEditLoading: boolean = false;
  //isRegistryLoading: boolean = false;
  //isRegistryFileProcessing: boolean = false;

  addEditView: boolean = false;
  readOnlyView: boolean = false;
  //registryView: boolean = false;
  dataOption = "current_dos";
  disableNotAdministredReason: boolean = true;

  lstChartImmunizations: Array<any>;
  lstChartImmunizationsFiltered: Array<any>;
  singleChartImmunization: any;


  immunizationEntryType: ImmunizationEntryTypeEnum;
  immunizationEntryTypeDisplay: string = "";

  visitDateModel: DateModel;
  visitTimeModel: TimeModel;

  lblmsg: string;
  chartId: number;
  patientId: number;
  errorMsg: string;

  addEditOption: string;
  //acImmunizationGroups;

  lstReasonValue: Array<any>;
  //lstProcedures;
  //lstProceduresFiltered: Array<any>;
  lstImmunizationMyList: Array<any>;
  lstImmunizationMyListFiltered: Array<any>;
  objImmunizationDetail: any;

  selectedCVXCode: string = '';
  selectedImmunizationDisplay: string = "";
  selectedImmunization: string = '';
  selectedTradeName: string = '';
  selectedMVXCode: string = '';
  selectedTradeDescription: string = '';
  selectedTradeCodingSystem: string = '';
  selectedManufacturer: string = '';
  administeringUserInfo: string = '';


  //lstNDCCodes: Array<string> = ["00006-4681-01", "21695-0413-01"];
  lstChartImmVIS: Array<any>;
  //lstRoutes:Array<any>;
  //lstSites:Array<any>;
  lstImmunizationCodeSet: Array<any>;
  //lstImmNDCFiltered: Array<any>;
  lstImmRoutesFiltered: Array<any>;

  lstDeletedVIS: Array<number>;
  routeCodeValueColumn: string = "NCIT";

  tempVISDetailId: number = 0;

  loadingCount: number = 0;
  assignVlauesAfterLoading: boolean = true;

  submitAfterSave: boolean = false;
  lstRegSelectedChartImmunizationIds: Array<number>;

  lstImmProcedures: Array<any>;
  lstImmNDC: Array<any>;

  immRegEnabled: boolean = false;

  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(config: NgbTimepickerConfig,
    private formBuilder: FormBuilder,
    private encounterService: EncounterService,
    private immunizationService: ImmunizationService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private ngbModal: NgbModal,
    private generalService: GeneralService) {

    config.spinners = false;
    config.size = 'small';

    //this.canAddEdit = this.lookupList.UserRights.AddModifyImmunization;
    this.canView = this.lookupList.UserRights.ViewImmunization;
    this.canAddEdit = this.lookupList.UserRights.AddModifyImmunization;
    this.canTransmitToRegistry = this.lookupList.UserRights.immunization_registry;
    debugger;
  }

  ngOnInit() {

    debugger;
    if (this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;

    if (this.lookupList.UserRights.ViewImmunization) {
      this.chartId = Number(this.objencounterToOpen.chart_id);
      this.patientId = Number(this.objencounterToOpen.patient_id);

      this.visitDateModel = this.dateTimeUtil.getDateModelFromDateString(this.objencounterToOpen.visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
      this.visitTimeModel = this.dateTimeUtil.getTimeModelFromTimeString(this.objencounterToOpen.visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);


      this.buildFilterForm();
      this.getViewData();

      this.buildForm();


      /*
     
      this.LoadTablesData();
      if (this.lookupList.practiceUsersList == undefined || this.lookupList.practiceUsersList.length == 0) {
        this.getPracticeUsersList();
      }
      */

      let lstAppSetting: Array<any> = new ListFilterPipe().transform(this.lookupList.appSettings, "description", "enable_immunization_registry");
      if (lstAppSetting != undefined && lstAppSetting.length > 0) {
        let option: string = lstAppSetting[0].options.toString();
        if (option.toString().toLowerCase() == 'true') {
          this.immRegEnabled = true;
        }
      }

    }
  }


  getPracticeUsersList() {
    this.generalService.getPracticeUsersList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.loadingCount--;
        this.assignValues();
        this.lookupList.practiceUsersList = data as Array<any>;
      },
      error => {
        this.getPracticeUsersListError(error);
      }
    );
  }
  getPracticeUsersListError(error) {
    this.logMessage.log("getPracticeUsersList Error." + error);
  }



  getViewData() {
    this.isLoading = true;
    this.noRecordFound = false;
    //this.dataOption="current_dos";
    this.getChartImmunizationSummary();
  }

  buildFilterForm() {
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control(this.dataOption),
    }
    );
  }
  buildForm() {

    this.vaccineFormGroup = this.formBuilder.group({
      txtNDC: this.formBuilder.control(null, Validators.compose([Validators.pattern(RegExEnum.VACCINE_NDC_11)])),
      dpAdministeredDate: this.formBuilder.control(null, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      tpAdministeredTime: this.formBuilder.control(null),
      rbCondition: this.formBuilder.control("mylist"),
      ddAdministeredBy: this.formBuilder.control(null),
      ddOrderingProvider: this.formBuilder.control(null),
      txtDose: this.formBuilder.control(null),
      ddUnit: this.formBuilder.control(null),
      ddRoutes: this.formBuilder.control(null),
      ddSite: this.formBuilder.control(null),
      txtReaction: this.formBuilder.control(null),
      rbBillable: this.formBuilder.control(false),
      txtProcCode: this.formBuilder.control(null),
      txtNotes: this.formBuilder.control(null),
      txtManufacterInfo: this.formBuilder.control(null),
      txtlotNumber: this.formBuilder.control(null),
      dpExpiryDate: this.formBuilder.control(null, datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
      ddStatus: this.formBuilder.control(null),
      ddReasonType: this.formBuilder.control(null),
      ddReasonValue: this.formBuilder.control(null),
      ddFundingSource: this.formBuilder.control(null),
      ddVFCFinancialClass: this.formBuilder.control(null),
      ddInformationSource: this.formBuilder.control(null),
      ddRefusalReason: this.formBuilder.control(null),
      txtOtherReason: this.formBuilder.control(null)
    },
      {
        validator: Validators.compose([
          CustomValidators.requiredWhenBoolean("txtProcCode", "rbBillable"),
          CustomValidators.requiredWhenOneOptionWithValue("txtOtherReason", "ddRefusalReason", "02"),
          CustomValidators.requiredWhenOneOptionWithValue("ddReasonType", "ddStatus", "NA"),
          CustomValidators.requiredWhenOneOptionWithValue("ddReasonValue", "ddStatus", "NA")
        ])
      }
    );
  }

  clearAllFeilds() {


    debugger;
    this.submitAfterSave = false;
    this.lstRegSelectedChartImmunizationIds = undefined

    this.selectedImmunization = undefined;
    this.selectedTradeName = undefined;

    this.selectedTradeDescription = undefined;
    this.selectedTradeCodingSystem = undefined;
    this.selectedManufacturer = undefined;


    this.routeCodeValueColumn = "NCIT";

    this.objImmunizationDetail = undefined;
    this.selectedCVXCode = undefined;
    this.lstImmProcedures = undefined;
    this.lstImmNDC = undefined;
    this.selectedImmunizationDisplay = undefined;

    this.selectedMVXCode = undefined;
    this.selectedManufacturer = undefined;

    (this.vaccineFormGroup.get("txtNDC") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("txtManufacterInfo") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("txtlotNumber") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("dpExpiryDate") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddVFCFinancialClass") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddFundingSource") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("dpAdministeredDate") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("tpAdministeredTime") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddStatus") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("txtDose") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddUnit") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddRoutes") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddSite") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("txtReaction") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddReasonType") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddReasonValue") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddOrderingProvider") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("ddAdministeredBy") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("rbBillable") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("txtProcCode") as FormControl).setValue(null);
    (this.vaccineFormGroup.get("txtNotes") as FormControl).setValue(null);

    this.lstChartImmVIS = undefined;
    this.lstDeletedVIS = undefined;
    this.tempVISDetailId = -1;
    this.removeAllVISControls();
    this.vaccineFormGroup.enable();

  }

  assignValues() {
    debugger;
    if (this.loadingCount > 0) {
      return;
    }
    if (!this.assignVlauesAfterLoading) {
      this.assignVlauesAfterLoading = true;
      return;
    }



    if (this.editOperation == OperationType.ADD) {

      //objencounterToOpen

      (this.vaccineFormGroup.get("ddStatus") as FormControl).setValue("CP");
      (this.vaccineFormGroup.get("ddOrderingProvider") as FormControl).setValue(this.objencounterToOpen.provider_id);
      (this.vaccineFormGroup.get("ddAdministeredBy") as FormControl).setValue(this.lookupList.logedInUser.userId);
      (this.vaccineFormGroup.get("dpAdministeredDate") as FormControl).setValue(this.visitDateModel);
      (this.vaccineFormGroup.get("tpAdministeredTime") as FormControl).setValue(this.visitTimeModel);


      this.routeCodeValueColumn = "NCIT";
      let filterObj: any = { ncit_code: "" };
      this.lstImmRoutesFiltered =
        new ListFilterGeneralNotIn().transform(this.lookupList.lstImmRoutes, filterObj);



    }
    else if (this.editOperation == OperationType.EDIT) {

      if (this.readOnlyView)
        this.vaccineFormGroup.disable();
      else {
        this.vaccineFormGroup.enable();
      }

      this.selectedCVXCode = this.singleChartImmunization.cvx_code;
      this.selectedImmunization = this.singleChartImmunization.immunization_name;

      if (this.singleChartImmunization.trade_name != undefined && this.singleChartImmunization.trade_name != "") {
        this.selectedImmunizationDisplay = this.singleChartImmunization.trade_name + ' (' + this.singleChartImmunization.immunization_name+')';
        
      }
      else {
        this.selectedImmunizationDisplay = this.singleChartImmunization.immunization_name;
      }
      (this.vaccineFormGroup.get("txtNotes") as FormControl).setValue(this.singleChartImmunization.comments);

      (this.vaccineFormGroup.get("dpAdministeredDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.singleChartImmunization.datetime_administered, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a));



      if (this.immunizationEntryType == ImmunizationEntryTypeEnum.ADMINISTERED) {

       
        this.selectedMVXCode = this.singleChartImmunization.mvx_code;
        this.selectedManufacturer = this.singleChartImmunization.manufacturer;

        this.selectedTradeName = this.singleChartImmunization.trade_name;
        this.selectedTradeDescription = this.singleChartImmunization.trade_description;
        this.selectedTradeCodingSystem = this.singleChartImmunization.trade_coding_system;

        (this.vaccineFormGroup.get("txtNDC") as FormControl).setValue(this.singleChartImmunization.ndc_code);
        (this.vaccineFormGroup.get("txtManufacterInfo") as FormControl).setValue(this.singleChartImmunization.manufacturer_detail);
        (this.vaccineFormGroup.get("txtlotNumber") as FormControl).setValue(this.singleChartImmunization.lot_number);
        (this.vaccineFormGroup.get("dpExpiryDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.singleChartImmunization.expiration_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
        (this.vaccineFormGroup.get("ddVFCFinancialClass") as FormControl).setValue(this.singleChartImmunization.vfc_code);
        (this.vaccineFormGroup.get("ddFundingSource") as FormControl).setValue(this.singleChartImmunization.funding_code);
        (this.vaccineFormGroup.get("tpAdministeredTime") as FormControl).setValue(this.dateTimeUtil.getTimeModelFromTimeString(this.singleChartImmunization.datetime_administered, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a));
        (this.vaccineFormGroup.get("ddStatus") as FormControl).setValue(this.singleChartImmunization.completion_status_code);
        (this.vaccineFormGroup.get("txtDose") as FormControl).setValue(this.singleChartImmunization.dose);
        (this.vaccineFormGroup.get("ddUnit") as FormControl).setValue(this.singleChartImmunization.units);



        if (this.singleChartImmunization.route_code_system == "NCIT") {
          this.routeCodeValueColumn = "NCIT";

          let filterObj: any = { ncit_code: "" };
          this.lstImmRoutesFiltered =
            new ListFilterGeneralNotIn().transform(this.lookupList.lstImmRoutes, filterObj);

        }
        else {
          this.routeCodeValueColumn = "HL70162";

          let filterObj: any = { hl70162_code: "" };
          this.lstImmRoutesFiltered =
            new ListFilterGeneralNotIn().transform(this.lookupList.lstImmRoutes, filterObj);

        }
        if (this.singleChartImmunization.route_code != undefined && this.singleChartImmunization.route_code != "") {
          (this.vaccineFormGroup.get("ddRoutes") as FormControl).setValue(this.singleChartImmunization.route_code);
        }


        (this.vaccineFormGroup.get("ddSite") as FormControl).setValue(this.singleChartImmunization.site_code);
        (this.vaccineFormGroup.get("txtReaction") as FormControl).setValue(this.singleChartImmunization.adverse_reaction);
        (this.vaccineFormGroup.get("ddReasonType") as FormControl).setValue(this.singleChartImmunization.reason_type);
        (this.vaccineFormGroup.get("ddReasonValue") as FormControl).setValue(this.singleChartImmunization.reason_code_snomed);

        (this.vaccineFormGroup.get("ddOrderingProvider") as FormControl).setValue(this.singleChartImmunization.provider_id);

        if (this.singleChartImmunization.administering_user_info != undefined && this.singleChartImmunization.administering_user_info != null) {
          let administering_user_id = this.singleChartImmunization.administering_user_info.toString().split("^")[0];
          (this.vaccineFormGroup.get("ddAdministeredBy") as FormControl).setValue(administering_user_id);
        }

        debugger;
        (this.vaccineFormGroup.get("rbBillable") as FormControl).setValue(this.singleChartImmunization.billable);
        (this.vaccineFormGroup.get("txtProcCode") as FormControl).setValue(this.singleChartImmunization.proc_code);


      }
      else if (this.immunizationEntryType == ImmunizationEntryTypeEnum.HISTORICAL) {
        (this.vaccineFormGroup.get("ddInformationSource") as FormControl).setValue(this.singleChartImmunization.administered_code);
      }
      else if (this.immunizationEntryType == ImmunizationEntryTypeEnum.REFUSED) {
        (this.vaccineFormGroup.get("ddRefusalReason") as FormControl).setValue(this.singleChartImmunization.reason_code_cdc);
        (this.vaccineFormGroup.get("txtOtherReason") as FormControl).setValue(this.singleChartImmunization.reason_description);
      }


    }


    this.isAddEditLoading = false;
  }

  addVISControlsToFormGroup(visInfo: any) {

    let visDatePresented = this.dateTimeUtil.getDateModelFromDateString(visInfo.vis_date_presented, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);

    this.vaccineFormGroup.addControl("dpVISPresented_" + visInfo.chart_imm_vis_id, new FormControl(visDatePresented, Validators.required));
  }

  removeAllVISControls() {

    if (this.lstChartImmVIS != undefined) {
      this.lstChartImmVIS.forEach(visInfo => {
        this.removeVISControlsById(visInfo.chart_imm_vis_id);
      });
    }
  }
  removeVISControlsById(id) {

    debugger;
    this.vaccineFormGroup.removeControl("dpVISPresented_" + id);

    if (this.lstChartImmVIS != undefined) {

      for (let i: number = this.lstChartImmVIS.length - 1; i >= 0; i--) {

        let element = this.lstChartImmVIS[i];
        if (element.chart_imm_vis_id == id) {
          this.lstChartImmVIS.splice(i, 1);
        }
      }
    }
  }

  onRemoveChartVIS(id) {

    for (let i: number = this.lstChartImmVIS.length - 1; i >= 0; i--) {

      let element = this.lstChartImmVIS[i];
      if (id != undefined && id != "") {
        if (element.chart_imm_vis_id == id) {
          this.lstChartImmVIS.splice(i, 1);
          if (id > 0) {

            if (this.lstDeletedVIS == undefined) {
              this.lstDeletedVIS = new Array<number>();
            }
            this.lstDeletedVIS.push(id);
          }
        }
      }
    }

    this.removeVISControlsById(id);

  }


  onRadioOptionChange(filterOption: string) {

    debugger;
    this.clearRegistrySelectedData();
    this.lstChartImmunizationsFiltered = undefined;
    this.dataOption = filterOption;
  
    if (this.dataOption == "all") {
      this.lstChartImmunizationsFiltered = new ListFilterPipe().transform(this.lstChartImmunizations, "deleted", "false");
    }
    else if (this.dataOption == "current_dos") {

      let filterObj: any = { chart_id: this.chartId, deleted: false };
      this.lstChartImmunizationsFiltered =  new ListFilterGeneral().transform(this.lstChartImmunizations, filterObj);
    }
    else if (this.dataOption == "other_dos") {
      let filterObj: any = { chart_id: this.chartId, deleted: true };
      this.lstChartImmunizationsFiltered =  new ListFilterGeneralNotIn().transform(this.lstChartImmunizations, filterObj);
    }
    else if (this.dataOption == "deleted") {
      this.lstChartImmunizationsFiltered = new ListFilterPipe().transform(this.lstChartImmunizations, "deleted", "true");
    }


    if (this.lstChartImmunizationsFiltered != undefined && this.lstChartImmunizationsFiltered.length > 0) {
      this.noRecordFound = false;
    }
    else {
      this.noRecordFound = true;
    }
  }

  getChartImmunizationSummary() {

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "chart_id", value: this.chartId, option: "" },
      { name: "chart_immunization_ids", value: "", option: "" },  // chart_immunization_ids empty to get all      
      { name: "include_deleted", value: true, option: "" }
    ];


    this.encounterService.getChartImmunizationSummary(searchCriteria)
      .subscribe(
        data => {

          this.lstChartImmunizations = data as Array<any>;


          if (this.lstChartImmunizations == undefined || this.lstChartImmunizations.length == 0) {
            this.noRecordFound = true;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {

            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));

            this.onRadioOptionChange(this.dataOption);


          }
          this.isLoading = false;

        

        },
        error => {
          this.errorMsg = "An Error Occured while getting Immunization list";
          this.logMessage.log("An Error Occured while getting Immunization list.")
          this.isLoading = false;
        }
      );
  }


  onAddImmunization(entryType: ImmunizationEntryTypeEnum) {

    ImmunizationEntryTypeEnum.REFUSED
    this.editOperation = OperationType.ADD;
    this.immunizationEntryType = entryType;//ImmunizationEntryTypeEnum.ADMINISTERED;
    this.addEditView = true;


    switch (this.immunizationEntryType.toString().toLowerCase()) {
      case ImmunizationEntryTypeEnum.ADMINISTERED:
        this.immunizationEntryTypeDisplay = "New Administered";
        break;
      case ImmunizationEntryTypeEnum.REFUSED:
        this.immunizationEntryTypeDisplay = "Refused";
        break;
      case ImmunizationEntryTypeEnum.HISTORICAL:
        this.immunizationEntryTypeDisplay = "Historical";
        break;

      default:
        break;
    }



    this.clearAllFeilds();
    this.LoadTablesData();

    if (this.loadingCount == 0) {
      this.assignValues();
    }
  }
  onEditView(obj: any, readOnly: boolean) {

    this.loadingCount = 0;
    if (readOnly) {
      this.readOnlyView = true;
    }
    else {
      this.addEditView = true;
    }


    this.isAddEditLoading = true;

    this.immunizationEntryType = obj.entry_type.toString().toLowerCase();//'administered';

    switch (this.immunizationEntryType.toString().toLowerCase()) {
      case ImmunizationEntryTypeEnum.ADMINISTERED:
        this.immunizationEntryTypeDisplay = "New Administered";
        break;
      case ImmunizationEntryTypeEnum.REFUSED:
        this.immunizationEntryTypeDisplay = "Refused";
        break;
      case ImmunizationEntryTypeEnum.HISTORICAL:
        this.immunizationEntryTypeDisplay = "Historical";
        break;

      default:
        break;
    }

    this.editOperation = OperationType.EDIT;
    this.clearAllFeilds();
    this.LoadTablesData();

    debugger;
    this.loadingCount++;
    this.getChartImmunizationById(obj.chart_immunization_id);
    this.loadingCount++;
    this.getChartImmunizationVIS(obj.chart_immunization_id);



    if (this.loadingCount == 0) {
      this.assignValues();
    }
  }

  loadImmNDCProcedure(ndcCode: string) {
    debugger;

    this.lstImmProcedures = undefined;
    this.lstImmNDC = undefined;

    if (ndcCode != undefined && ndcCode != "") {
      this.loadingCount++;
      this.getImmProcedure(ndcCode);

      this.loadingCount++;
      this.getImmNDC(ndcCode);
    }
  }

  getChartImmunizationById(chartImmId: number) {
    this.encounterService.getChartImmunizationById(chartImmId)
      .subscribe(
        data => {
          this.singleChartImmunization = data;
          this.loadingCount--;
          this.loadImmNDCProcedure(this.singleChartImmunization.ndc_code);

          this.assignValues();
        },
        error => {
          this.logMessage.log("An Error Occured while getting getChartImmunizationById.")

        }
      );
  }

  getChartImmunizationVIS(chartImmId: number) {
    this.encounterService.getChartImmunizationVIS(chartImmId).subscribe(
      data => {
        this.lstChartImmVIS = data as Array<any>;

        if (this.lstChartImmVIS != undefined) {
          this.lstChartImmVIS.forEach(visInfo => {
            this.addVISControlsToFormGroup(visInfo);
          });
        }

        this.loadingCount--;
        this.assignValues();
      },
      error => {
        this.logMessage.log("An Error Occured while getting getChartImmunizationVIS.")
      }
    );
  }


  onDelete(obj: any) {
    this.editOperation = OperationType.DELETE;

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;


    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.chart_immunization_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteChartImmunization(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Immunization has benn deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data: any) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter Immunization"
      modalRef.componentInstance.promptMessage = data.response;
    }
    else {
      this.getViewData();

    }
  }

  onCancel() {

    this.clearAllFeilds();

    this.addEditView = false;
    this.readOnlyView = false;
    //this.registryView = false;
  }



  LoadTablesData() {

    debugger
    if (this.immunizationEntryType == ImmunizationEntryTypeEnum.ADMINISTERED) {
      if (this.lookupList.lstImmRoutes == undefined || this.lookupList.lstImmRoutes.length == 0) {
        this.loadingCount++;
        this.getImmRouteList();
      }
      if (this.lookupList.lstImmSites == undefined || this.lookupList.lstImmSites.length == 0) {
        this.loadingCount++;
        this.getImmSiteList();
      }
      

      if (this.lookupList.practiceUsersList == undefined || this.lookupList.practiceUsersList.length == 0) {
        this.loadingCount++;
        this.getPracticeUsersList();
      }




    }

    if (this.lstImmunizationMyList == undefined || this.lstImmunizationMyList.length == 0) {
      this.loadingCount++;
      this.getPracticeImmunizationSearch();
    }
    if (this.lstImmunizationCodeSet == undefined || this.lstImmunizationCodeSet.length == 0) {
      this.loadingCount++;
      this.getImmCodeSet();
    }

  }

  getImmNDC(code: string) {
    this.immunizationService.getImmNDC(code)
      .subscribe(
        data => {
          this.loadingCount--;
          this.lstImmNDC = data as Array<any>;
          this.assignValues();

        },
        error => {
          this.logMessage.log("An Error Occured while getting getAllImmunizationNDC list.")

        }
      );
  }

  getImmRouteList() {
    this.immunizationService.getImmRouteList()
      .subscribe(
        data => {
          this.lookupList.lstImmRoutes = data as Array<any>;
          this.loadingCount--;
          this.assignValues();
        },
        error => {
          this.logMessage.log("An Error Occured while getting getImmunizationRoute list.")

        }
      );
  }
  getImmSiteList() {
    this.immunizationService.getImmSiteList()
      .subscribe(
        data => {
          this.loadingCount--;
          this.assignValues();
          this.lookupList.lstImmSites = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getImmunizationSite list.")

        }
      );
  }
  getImmCodeSet() {
    this.immunizationService.getImmCodeSet()
      .subscribe(
        data => {
          this.loadingCount--;
          this.assignValues();
          this.lstImmunizationCodeSet = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getImmunizationCodeSet list.")

        }
      );
  }
  getImmProcedure(code: string) {
    this.immunizationService.getImmProcedure(code)
      .subscribe(
        data => {
          this.loadingCount--;
          this.lstImmProcedures = data as Array<any>;
          this.assignValues();
        },
        error => {
          this.logMessage.log("An Error Occured while getting getAllImmunizationProcedures list.")

        }
      );
  }
  getPracticeImmunizationSearch() {
    this.immunizationService.getImmunizationPracticeSearchList(this.lookupList.practiceInfo.practiceId.toString(), this.objencounterToOpen.location_id.toString())
      .subscribe(
        data => {
          this.loadingCount--;
          this.assignValues();
          this.lstImmunizationMyList = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getPracticeImmunizationSearch list.")

        }
      );
  }
  onImmunizationSearchKeydown(value: string) {

    //if (event.key === "Enter") 
    if (value.length > 1) {
      this.showImmunizationSearch = true;

      //this.lstImmunizationMyListFiltered=this.lstReasonValue= new ListFilterGeneral().transform(this.lstImmunizationMyList, [{'immunization_name':this.vaccineFormGroup.get("txtImmunizaionSearch").value},{'cvx_code':this.vaccineFormGroup.get("txtImmunizaionSearch").value},{'trade_name':this.vaccineFormGroup.get("txtImmunizaionSearch").value}]);
      this.lstImmunizationMyListFiltered = new ListFilterContainThreeColumns().transform(this.lstImmunizationMyList,
        'immunization_name', 'cvx_code', 'trade_name', value);
      //console.log(this.lstImmunizationMyListFiltered.length)
    }
    else {
      this.showImmunizationSearch = false;
    }

  }

  closeImmunizationSearch() {

  
    this.showImmunizationSearch = false;
  }

  addImmunization(objImm: any) {
    this.loadingCount = 0;
    this.selectedCVXCode = objImm.cvx_code;
    this.selectedImmunization = objImm.immunization_name;
    this.selectedTradeName = objImm.trade_name;


    if (objImm.trade_name != undefined && objImm.trade_name != "") {
      this.selectedImmunizationDisplay = objImm.trade_name + ' (' + objImm.immunization_name+')';
    }
    else {
      this.selectedImmunizationDisplay = objImm.immunization_name;
    }

    (this.vaccineFormGroup.get("dpExpiryDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(objImm.expiry_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.vaccineFormGroup.get("txtlotNumber") as FormControl).setValue(objImm.lot_number);
    (this.vaccineFormGroup.get("txtNDC") as FormControl).setValue(objImm.ndc);
    this.selectedMVXCode = objImm.mvx_code;
    this.selectedTradeDescription = objImm.trade_description;
    this.selectedTradeCodingSystem = objImm.coding_system;
    this.selectedManufacturer = objImm.manufacturer_name;

    this.showImmunizationSearch = false;



    this.assignVlauesAfterLoading = false;
    this.loadImmNDCProcedure(objImm.cvx_code);

  }

  onImmunizationSearchFocusOut() {
    /*
    if ((this.vaccineFormGroup.get("txtCvxCode") as FormControl).value == "" || (this.vaccineFormGroup.get("txtCvxCode") as FormControl).value == undefined) {
        (this.vaccineFormGroup.get("txtImmunizaionSearch") as FormControl).setValue(null);
        (this.vaccineFormGroup.get("txtCvxCode") as FormControl).setValue(null);
    }
    */
  }

  onStatusChange(args) {

    if (args.target.options[args.target.selectedIndex].text == 'Not Administered') {
      //this.disableNotAdministredReason=false;
      this.vaccineFormGroup.get('ddReasonType').enable();
      this.vaccineFormGroup.get('ddReasonValue').enable();
    }
    else {
      this.vaccineFormGroup.get('ddReasonType').disable();
      this.vaccineFormGroup.get('ddReasonValue').disable();
    }
  }
  onddReasonTypeChange(arg) {
    if (arg.target.options[arg.target.selectedIndex].text == 'Immunity') {
      this.lstReasonValue = new ListFilterPipe().transform(this.lstImmunizationCodeSet, "type", 'IMMUNE');

    }
    else if (arg.target.options[arg.target.selectedIndex].text == 'Medical Precaution') {
      this.lstReasonValue = new ListFilterPipe().transform(this.lstImmunizationCodeSet, "type", 'MEDPREC');
    }
    else if (arg.target.options[arg.target.selectedIndex].text == 'Availability') {
      this.lstReasonValue = new ListFilterPipe().transform(this.lstImmunizationCodeSet, "type", 'OSTOCK');
    }
  }

  validateData(): boolean {

    let strMsg: string = "";

    

    if (this.selectedImmunization == undefined || this.selectedImmunization == null || this.selectedImmunization == "") {
      strMsg = "Please enter immunization.";
    }
    if (strMsg == "" && this.immunizationEntryType == ImmunizationEntryTypeEnum.ADMINISTERED) {

     
      if (this.vaccineFormGroup.get("dpAdministeredDate").value == undefined
        || this.vaccineFormGroup.get("dpAdministeredDate").value == null
        || this.vaccineFormGroup.get("dpAdministeredDate").value == "") {
        strMsg = "Please enter Date Administered.";
      }
      else if (!this.dateTimeUtil.isValidDateTime(this.vaccineFormGroup.get("dpAdministeredDate").value, DateTimeFormat.DATE_MODEL)) {

        strMsg = "Date Administered is not in correct format.";
      }
      else if (this.dateTimeUtil.checkIfFutureDate(this.vaccineFormGroup.get("dpAdministeredDate").value, DateTimeFormat.DATE_MODEL)) {
        strMsg = "Date Administered cannot be future date.";
      }


      if (strMsg == "") {

        if (this.vaccineFormGroup.get("tpAdministeredTime").value == undefined
          || this.vaccineFormGroup.get("tpAdministeredTime").value == null
          || this.vaccineFormGroup.get("tpAdministeredTime").value == "") {
          strMsg = "Please enter Administered Time.";
        }
        else if (this.vaccineFormGroup.get("ddOrderingProvider").value == undefined
          || this.vaccineFormGroup.get("ddOrderingProvider").value == null
          || this.vaccineFormGroup.get("ddOrderingProvider").value == "") {
          strMsg = "Please select Provider.";
        }
        else if (this.vaccineFormGroup.get("ddStatus").value == undefined
          || this.vaccineFormGroup.get("ddStatus").value == null
          || this.vaccineFormGroup.get("ddStatus").value == "") {
          strMsg = "Please select Completion Status.";
        }
        else if (this.vaccineFormGroup.get("rbBillable").value == true && (
          this.vaccineFormGroup.get("txtProcCode").value == undefined
          || this.vaccineFormGroup.get("txtProcCode").value == null
          || this.vaccineFormGroup.get("txtProcCode").value == "")) {
          strMsg = "Please Enter Procedure Code.";
        }
        else if (this.vaccineFormGroup.get("txtNDC").value != undefined
          && this.vaccineFormGroup.get("txtNDC").value != null
          && this.vaccineFormGroup.get("txtNDC").value != "") {

          let regex = new RegExp(RegExEnum.VACCINE_NDC_11);
          if (!regex.test(this.vaccineFormGroup.get("txtNDC").value)) {
            strMsg = "NDC Code is invalid. NDC code must be of 11 digits."
          }
        }
      }

      if (strMsg == "" && this.vaccineFormGroup.get("dpExpiryDate").value != undefined && this.vaccineFormGroup.get("dpExpiryDate").value != '' && this.vaccineFormGroup.get("dpExpiryDate").value != null) {
        if (!this.dateTimeUtil.isValidDateTime(this.vaccineFormGroup.get("dpExpiryDate").value, DateTimeFormat.DATE_MODEL)) {
          strMsg = "Expiry Date is not in correct format";
        }
      }

      if (strMsg == "" && this.lstChartImmVIS != undefined && this.lstChartImmVIS.length > 0) {

        this.lstChartImmVIS.forEach(vis => {

          if (this.vaccineFormGroup.get("dpVISPresented_" + vis.chart_imm_vis_id).value == undefined
            || this.vaccineFormGroup.get("dpVISPresented_" + vis.chart_imm_vis_id).value == null
            || this.vaccineFormGroup.get("dpVISPresented_" + vis.chart_imm_vis_id).value == "") {

            if (strMsg != "") {
              strMsg += ", "
            }

            strMsg += vis.vis_name
          }
        });

        if (strMsg != "") {
          strMsg = "Please enter VIS Date Presented for <br>" + strMsg;
        }
      }

      if (strMsg == "" && this.vaccineFormGroup.get("ddStatus").value == "NA") {
        if (this.vaccineFormGroup.get("ddReasonType").value == undefined
          || this.vaccineFormGroup.get("ddReasonType").value == null
          || this.vaccineFormGroup.get("ddReasonType").value == "") {
          strMsg = "Please select not performed reason.";
        }
        else if (this.vaccineFormGroup.get("ddReasonValue").value == undefined
          || this.vaccineFormGroup.get("ddReasonValue").value == null
          || this.vaccineFormGroup.get("ddReasonValue").value == "") {
          strMsg = "Please select not performed reason.";
        }
      }
      if (strMsg == "" && (this.vaccineFormGroup.get("ddStatus").value == "CP"
        || this.vaccineFormGroup.get("ddStatus").value == "PA")) {

        if (this.vaccineFormGroup.get("ddAdministeredBy").value == undefined
          || this.vaccineFormGroup.get("ddAdministeredBy").value == null
          || this.vaccineFormGroup.get("ddAdministeredBy").value == "") {
          strMsg = "Please select administered by.";
        }
       
       
      }


    }
    else if (strMsg == "" && this.immunizationEntryType == ImmunizationEntryTypeEnum.HISTORICAL) {
      if (this.vaccineFormGroup.get("dpAdministeredDate").value == undefined
        || this.vaccineFormGroup.get("dpAdministeredDate").value == null
        || this.vaccineFormGroup.get("dpAdministeredDate").value == "") {
        strMsg = "Please enter Date Administered.";
      }
      else if (this.vaccineFormGroup.get("ddInformationSource").value == undefined
        || this.vaccineFormGroup.get("ddInformationSource").value == null
        || this.vaccineFormGroup.get("ddInformationSource").value == "") {
        strMsg = "Please select Information Source.";
      }
    }
    else if (strMsg == "" && this.immunizationEntryType == ImmunizationEntryTypeEnum.REFUSED) {
      if (this.vaccineFormGroup.get("dpAdministeredDate").value == undefined
        || this.vaccineFormGroup.get("dpAdministeredDate").value == null
        || this.vaccineFormGroup.get("dpAdministeredDate").value == "") {
        strMsg = "Please enter Date refused.";
      }
      else if (this.vaccineFormGroup.get("ddRefusalReason").value == undefined
        || this.vaccineFormGroup.get("ddRefusalReason").value == null
        || this.vaccineFormGroup.get("ddRefusalReason").value == "") {
        strMsg = "Please select refusal reason.";
      }
      else if (this.vaccineFormGroup.get("ddRefusalReason").value == "02"
        && (this.vaccineFormGroup.get("txtOtherReason").value == undefined
          || this.vaccineFormGroup.get("txtOtherReason").value == null
          || this.vaccineFormGroup.get("txtOtherReason").value == "")) {
        strMsg = "Please enter other refusal reason.";
      }
    }


    if (strMsg != "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization', strMsg, AlertTypeEnum.WARNING)
      return false;
    }

    return true;
  }


  onSaveImmunizationClicked(saveForm: any, submit: boolean) {


    if (this.validateData() == false)
      return;

    this.submitAfterSave = submit;

    if (this.immunizationEntryType == ImmunizationEntryTypeEnum.ADMINISTERED
      && this.vaccineFormGroup.get("dpExpiryDate").value != undefined
      && this.vaccineFormGroup.get("dpExpiryDate").value != null
      && this.vaccineFormGroup.get("dpExpiryDate").value != ""
      && this.dateTimeUtil.checkIfPastDate(this.vaccineFormGroup.get("dpExpiryDate").value, DateTimeFormat.DATE_MODEL)) {

      // strMsg = "Vaccine is expired, do you want to continue ?";

      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Immunization';
      modalRef.componentInstance.promptMessage = 'Vaccine is expired, do you want to continue ?';
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;

      modalRef.result.then((result) => {

        if (result == PromptResponseEnum.YES) {
           this.saveImmunization(saveForm);
        }

      }, (reason) => {
        //alert(reason);
      });

      return false;
    }
    else {
      this.saveImmunization(saveForm);
    }
  }
  saveImmunization(saveForm: any) {

    debugger;

    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


    let ormChartImmSave: ORMChartImmunizationSave = new ORMChartImmunizationSave();
    let lstChartImmunizationVISSave: Array<ORMChartImmunizationVISSave>;


    if (this.editOperation == OperationType.ADD) {
      ormChartImmSave.action_code = "A";
      ormChartImmSave.created_user = this.lookupList.logedInUser.user_name;
      ormChartImmSave.client_date_created = clientDateTime;
    }
    else if (this.editOperation == OperationType.EDIT) {
      ormChartImmSave.action_code = "U";
      if (this.singleChartImmunization.registry_status == "AA" || this.singleChartImmunization.registry_status == "AA_IW") {
        ormChartImmSave.action_code = "U";
      }
      else {
        ormChartImmSave.action_code = "A";
      }

      ormChartImmSave.chart_immunization_id = this.singleChartImmunization.chart_immunization_id;
      ormChartImmSave.created_user = this.singleChartImmunization.created_user;
      ormChartImmSave.date_created = this.singleChartImmunization.date_created;
      ormChartImmSave.client_date_created = this.singleChartImmunization.client_date_created;
    }

    ormChartImmSave.entry_type = this.immunizationEntryType;
    ormChartImmSave.system_ip = this.lookupList.logedInUser.systemIp;
    ormChartImmSave.patient_id = Number(this.objencounterToOpen.patient_id);
    ormChartImmSave.chart_id = Number(this.objencounterToOpen.chart_id);
    ormChartImmSave.practice_id = this.lookupList.practiceInfo.practiceId;

    ormChartImmSave.entered_by_user_info = this.lookupList.logedInUser.userId + "^" + this.lookupList.logedInUser.userLName + "^" + this.lookupList.logedInUser.userFName + "^" + this.lookupList.logedInUser.userMname;


    if (saveForm.tpAdministeredTime != undefined && saveForm.tpAdministeredTime != "") {
      ormChartImmSave.datetime_administered = this.dateTimeUtil.getStringDateFromDateModel(saveForm.dpAdministeredDate) + ' ' + this.dateTimeUtil.getStringTimeFromTimeModel(saveForm.tpAdministeredTime);
    }
    else {
      ormChartImmSave.datetime_administered = this.dateTimeUtil.getStringDateFromDateModel(saveForm.dpAdministeredDate);
    }

    ormChartImmSave.provider_id = saveForm.ddOrderingProvider; // Administered by

    ormChartImmSave.immunization_name = this.selectedImmunization;
    ormChartImmSave.cvx_code = this.selectedCVXCode;
    ormChartImmSave.comments = saveForm.txtNotes;
    ormChartImmSave.modified_user = this.lookupList.logedInUser.user_name;
    ormChartImmSave.client_date_modified = clientDateTime;

    ormChartImmSave.comments = saveForm.txtNotes;

    if (this.immunizationEntryType == ImmunizationEntryTypeEnum.ADMINISTERED) {

      ormChartImmSave.administered_code = "00"; // code for new Administered
      ormChartImmSave.administered_code_description = "New immunization record";

      ormChartImmSave.trade_name = this.selectedTradeName;
      ormChartImmSave.trade_description = this.selectedTradeDescription;
      ormChartImmSave.trade_coding_system = this.selectedTradeCodingSystem;
      ormChartImmSave.ndc_code = saveForm.txtNDC;
      ormChartImmSave.mvx_code = this.selectedMVXCode;
      ormChartImmSave.manufacturer = this.selectedManufacturer;
      ormChartImmSave.manufacturer_detail = saveForm.txtManufacterInfo;
      ormChartImmSave.lot_number = saveForm.txtlotNumber;
      ormChartImmSave.expiration_date = this.dateTimeUtil.getStringDateFromDateModel(saveForm.dpExpiryDate);


      if (saveForm.ddVFCFinancialClass != undefined && saveForm.ddVFCFinancialClass != "") {
        ormChartImmSave.vfc_code = saveForm.ddVFCFinancialClass;
        let filterObj: any = { type: "VFC", code: saveForm.ddVFCFinancialClass };
        let selectedVFCFinancialClass = new ListFilterGeneral().transform(this.lstImmunizationCodeSet, filterObj);
        ormChartImmSave.vfc_description = selectedVFCFinancialClass[0].description;
      }

      if (saveForm.ddFundingSource != undefined && saveForm.ddFundingSource != "") {

        ormChartImmSave.funding_code = saveForm.ddFundingSource;
        let filterObj: any = { type: "FUNDS", code: saveForm.ddFundingSource };
        let selectedFund = new ListFilterGeneral().transform(this.lstImmunizationCodeSet, filterObj);


        ormChartImmSave.funding_description = selectedFund[0].description;
        ormChartImmSave.funding_coding_system = selectedFund[0].coding_system;
      }



      ormChartImmSave.provider_id = saveForm.ddOrderingProvider;

      let selectedUser = new ListFilterPipe().transform(this.lookupList.practiceUsersList, "user_id", saveForm.ddAdministeredBy);
      ormChartImmSave.administering_user_info = selectedUser[0].user_id + "^" + selectedUser[0].last_name + "^" + selectedUser[0].first_name + "^" + selectedUser[0].mname;


      ormChartImmSave.completion_status_code = saveForm.ddStatus;

      if (saveForm.ddStatus == "CP" || saveForm.ddStatus == "PA") {

        ormChartImmSave.dose = saveForm.txtDose;
        ormChartImmSave.units = saveForm.ddUnit;

        if (saveForm.ddSite != undefined && saveForm.ddSite != "") {
          ormChartImmSave.site_code = saveForm.ddSite;
          let selectedSite = new ListFilterPipe().transform(this.lookupList.lstImmSites, "site_code", saveForm.ddSite);
          ormChartImmSave.site_description = selectedSite[0].site_description;
        }



        if (saveForm.ddRoutes != undefined && saveForm.ddRoutes != "") {
          if (this.routeCodeValueColumn == "NCIT") {
            let selectedRoute = new ListFilterPipe().transform(this.lstImmRoutesFiltered, "ncit_code", saveForm.ddRoutes)
            ormChartImmSave.route_code_system = this.routeCodeValueColumn;
            ormChartImmSave.route_code = selectedRoute[0].ncit_code;
            ormChartImmSave.route_description = selectedRoute[0].route_description;
          }
          else {
            let selectedRoute = new ListFilterPipe().transform(this.lstImmRoutesFiltered, "hl70162_code", saveForm.ddRoutes)
            ormChartImmSave.route_code_system = this.routeCodeValueColumn;
            ormChartImmSave.route_code = selectedRoute[0].hl70162_code;
            ormChartImmSave.route_description = selectedRoute[0].route_description;
          }
        }




        ormChartImmSave.adverse_reaction = saveForm.txtReaction;


        if (saveForm.rbBillable == true) {
          ormChartImmSave.billable = true;
          ormChartImmSave.proc_code = saveForm.txtProcCode;
          if (saveForm.txtProcCode != undefined && saveForm.txtProcCode != "") {
            let procDescription = new ListFilterPipe().transform(this.lstImmProcedures, "proc_code", saveForm.txtProcCode);

            if (procDescription != undefined && procDescription.length > 0) {
              ormChartImmSave.proc_description = procDescription[0].proc_description;
            }
            else {
              ormChartImmSave.proc_description = "";
            }
          }


        }

      }
      else if (saveForm.ddStatus == "NA") {

        debugger;
        ormChartImmSave.reason_type = saveForm.ddReasonType;
        ormChartImmSave.reason_code_snomed = saveForm.ddReasonValue;
        if (saveForm.ddReasonValue != undefined && saveForm.ddReasonValue != "") {
          let selectedReason = new ListFilterPipe().transform(this.lstReasonValue, "code", saveForm.ddReasonValue);
          ormChartImmSave.reason_description = selectedReason[0].description;
        }


      }


      /*

      if (saveForm.ddReasonType == 'IMMUNITY') {
        ormChartImmSave.reason_type = "IMMUNITY";
        ormChartImmSave.reason_code_snomed = saveForm.ddReasonValue;
        ormChartImmSave.reason_description = new ListFilterPipe().transform(this.lstReasonValue, "code", saveForm.ddReasonValue)[0].description;
      }
      else if (saveForm.ddReasonType == 'MEDICAL PRECAUTIONS') {
        ormChartImmSave.reason_type = "MEDICAL PRECAUTIONS";
        ormChartImmSave.reason_code_snomed = saveForm.ddReasonValue;
        ormChartImmSave.reason_description = new ListFilterPipe().transform(this.lstReasonValue, "code", saveForm.ddReasonValue)[0].description;
      }
      else if (saveForm.ddReasonType == 'UNAVAILABLE') {
        ormChartImmSave.reason_type = "UNAVAILABLE";
        ormChartImmSave.reason_code_snomed = saveForm.ddReasonValue;
        ormChartImmSave.reason_description = new ListFilterPipe().transform(this.lstReasonValue, "code", saveForm.ddReasonValue)[0].description;
      }
*/



      //let selectedUser = new ListFilterPipe().transform(this.lookupList.listpracticeUserName, "id", saveForm.ddAdministeredBy);


      //ormChartImmSave.administering_user_info = selectedUser[0].id + "^" + selectedUser[0].last_name + "^" + selectedUser[0].first_name + "^" + selectedUser[0].mname;
      //ormChartImmSave.billable = saveForm.chkBillable.value;



      // VIS 
      if (this.lstChartImmVIS != undefined && this.lstChartImmVIS.length > 0) {

        this.lstChartImmVIS.forEach(vis => {


          if (vis.chart_imm_vis_id == undefined || vis.chart_imm_vis_id <= 0 || saveForm["dpVISPresented_" + vis.chart_imm_vis_id].dirty) {

            let chartImmunizationVISSave: ORMChartImmunizationVISSave = new ORMChartImmunizationVISSave();

            if (vis.chart_imm_vis_id == undefined || vis.chart_imm_vis_id <= 0) {
              chartImmunizationVISSave.created_user = this.lookupList.logedInUser.user_name;
              chartImmunizationVISSave.client_date_created = clientDateTime;

            }
            else {
              chartImmunizationVISSave.chart_imm_vis_id = vis.chart_imm_vis_id;
              chartImmunizationVISSave.created_user = vis.created_user;
              chartImmunizationVISSave.date_created = vis.date_created;
              chartImmunizationVISSave.client_date_created = vis.client_date_created;
            }
            chartImmunizationVISSave.client_date_modified = clientDateTime;
            chartImmunizationVISSave.modified_user = this.lookupList.logedInUser.user_name;
            chartImmunizationVISSave.vis_gdti_code = vis.vis_gdti_code;
            chartImmunizationVISSave.vis_name = vis.vis_name;
            chartImmunizationVISSave.vis_encoded_text = vis.vis_encoded_text;
            chartImmunizationVISSave.coding_system = vis.coding_system;
            chartImmunizationVISSave.vis_date_published = vis.vis_date_published;
            chartImmunizationVISSave.vis_date_presented = this.dateTimeUtil.getStringDateFromDateModel(saveForm["dpVISPresented_" + vis.chart_imm_vis_id]);
            chartImmunizationVISSave.system_ip = this.lookupList.logedInUser.systemIp;
            chartImmunizationVISSave.patient_id = Number(this.objencounterToOpen.patient_id);
            chartImmunizationVISSave.chart_id = Number(this.objencounterToOpen.chart_id);
            chartImmunizationVISSave.practice_id = this.lookupList.practiceInfo.practiceId;

            if (lstChartImmunizationVISSave == undefined)
              lstChartImmunizationVISSave = new Array<ORMChartImmunizationVISSave>();

            lstChartImmunizationVISSave.push(chartImmunizationVISSave);

          }

        });

      }
    }
    else if (this.immunizationEntryType == ImmunizationEntryTypeEnum.HISTORICAL) {

      debugger;
      ormChartImmSave.completion_status_code = "CP";
      ormChartImmSave.administered_code = saveForm.ddInformationSource;

      if (saveForm.ddInformationSource != undefined && saveForm.ddInformationSource != "") {
        let filterObj: any = { type: "HISTORICAL_SOURCE", code: saveForm.ddInformationSource };
        let selectedInfoSource = new ListFilterGeneral().transform(this.lstImmunizationCodeSet, filterObj);
        ormChartImmSave.administered_code_description = selectedInfoSource[0].description;
      }
    }
    else if (this.immunizationEntryType == ImmunizationEntryTypeEnum.REFUSED) {

      debugger;
      ormChartImmSave.reason_type = "REFUSAL";
      ormChartImmSave.completion_status_code = "RE";
      ormChartImmSave.reason_code_cdc = saveForm.ddRefusalReason;

      if (saveForm.ddRefusalReason != undefined && saveForm.ddRefusalReason != "") {
        let filterObj: any = { type: "REFUSAL_REASON", code: saveForm.ddRefusalReason };

        let selectedRefusalReason = new ListFilterGeneral().transform(this.lstImmunizationCodeSet, filterObj);
        if (saveForm.ddRefusalReason == "02") {
          ormChartImmSave.reason_description = saveForm.txtOtherReason;
        }
        else {
          ormChartImmSave.reason_description = selectedRefusalReason[0].description;
        }
      }
    }



    let wrapperImmunizationSave: WrapperImmunizationSave = new WrapperImmunizationSave(ormChartImmSave, lstChartImmunizationVISSave, this.lstDeletedVIS, this.objencounterToOpen.location_id);

    debugger;

    this.encounterService.saveChartImmunization(wrapperImmunizationSave).subscribe(
      data => {
        this.saveChartImmunizationSuccess(data);
      },
      error => {
        this.saveChartImmunizationError(error);
      }
    );


  }

  saveChartImmunizationSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.addEditView = false;

      debugger;
      if (this.submitAfterSave) {
        this.lstRegSelectedChartImmunizationIds = new Array<number>();
        this.lstRegSelectedChartImmunizationIds.push(Number(data.result));

        this.onRegistryClicked();
      }
      else {
        this.getViewData();
      }


    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Chart Immunization', data.response, AlertTypeEnum.DANGER)

    }
  }

  saveChartImmunizationError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Chart Immunization', "An Error Occured while Chart Immunization.", AlertTypeEnum.DANGER)

  }

  addVIS_Clicked() {

    debugger;
    const modalRef = this.ngbModal.open(AddVisComponent, this.popUpOptions);
    modalRef.componentInstance.cvxCode = this.selectedCVXCode;
    modalRef.componentInstance.vaccineVisList = this.lstChartImmVIS;
    modalRef.componentInstance.selectedImmunizationDisplay = this.selectedImmunizationDisplay;

    let dateYYYMMDD: any;
    if (this.vaccineFormGroup.get("dpAdministeredDate") != undefined) {

      dateYYYMMDD = this.dateTimeUtil.convertDateTimeFormat(this.vaccineFormGroup.get("dpAdministeredDate").value, DateTimeFormat.DATE_MODEL, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);
      //this.dateTimeUtil.getStringDateFromDateModel(this.vaccineFormGroup.get("dpAdministeredDate").value);
    }
    else {
      dateYYYMMDD = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD);
    }
    modalRef.componentInstance.datePresented = dateYYYMMDD;



    modalRef.result.then((result) => {
      debugger;
      if (result != undefined) {

        if (this.lstChartImmVIS == undefined) {
          this.lstChartImmVIS = new Array<any>();
        }

        result.forEach(vis => {

          let objVIS: any = {
            chart_imm_vis_id: this.tempVISDetailId--,
            vis_name: vis.vis_name,
            vis_encoded_text: vis.vis_encoded_text,
            vis_gdti_code: vis.vis_gdti_code,
            vis_info: vis.vis_name,
            vis_date_published: vis.vis_date,
            vis_date_presented: vis.vis_date_presented,
            coding_system: vis.coding_system
          };

          this.lstChartImmVIS.push(
            objVIS
          )

          this.addVISControlsToFormGroup(objVIS);

        });


        //this.isLoading = true;
        //this.loadPaymentDetails();
      }
    }, (reason) => {
      //alert(reason);
    });
  }

  removeVIS(rowIndex: number) {

    if (this.lstChartImmVIS != undefined) {

      let chart_imm_vis_id = this.lstChartImmVIS[rowIndex].chart_imm_vis_id;

      if (chart_imm_vis_id > 0) {

        if (this.lstDeletedVIS == undefined) {
          this.lstDeletedVIS = new Array<number>();
        }
        this.lstDeletedVIS.push(chart_imm_vis_id);

      }
      this.lstChartImmVIS.splice(rowIndex, 1);
    }
  }

  getEnteredByUserName(userInfo: string) {

    let strName: string = "";
    if (userInfo != undefined) {
      let lstName: Array<string> = userInfo.split("^");

      if (lstName != undefined && lstName.length > 1) {
        strName += lstName[1];
      }
      if (lstName != undefined && lstName.length > 2) {
        strName += ", " + lstName[2];
      }
    }

    return strName;
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
  getRegStatusDescription(statusCode: string) {

    let tip: string = "";

    switch (statusCode) {
      case "AQ":
        tip = "Queued for Immunization Registry Submission.";
        break;
      case "TF":
        tip = "Transmission to the Immunization Registry Failed.";
        break;
      case "AF":
        tip = "Application Failure.";
        break;
      case "AT":
        tip = "Transmitted to Immunization Registry (Pending for Immunization Registry Response).";
        break;
      case "AA":
      case "AA_IW":
        tip = "Application acknowledgment: Accept";
        break;
      case "AE":
        tip = "Application acknowledgment: Error";
        break;
      case "AR":
        tip = "Application acknowledgment: Reject";
        break;

      default:
        break;
    }

    return tip;

  }

  getRounteDropDownValue(route: any) {

    if (this.routeCodeValueColumn == "NCIT") {
      return route.ncit_code;
    }
    else {
      return route.hl70162_code;
    }

  }

  onImmunizationSelectionChagned(event: any, vaccine: any) {

    debugger;
    if (event.target.checked) {

      if (this.lstRegSelectedChartImmunizationIds == undefined)
        this.lstRegSelectedChartImmunizationIds = new Array<number>();

      this.lstRegSelectedChartImmunizationIds.push(vaccine.chart_immunization_id);

    }
    else if (!event.target.checked) {

      if (this.lstRegSelectedChartImmunizationIds != undefined) {

        for (let i: number = this.lstRegSelectedChartImmunizationIds.length - 1; i >= 0; i--) {

          if (this.lstRegSelectedChartImmunizationIds[i] == vaccine.chart_immunization_id) {
            this.lstRegSelectedChartImmunizationIds.splice(i, 1);
          }
        }
      }
    }
  }

  onRegistryClicked() {

    debugger;
    let strMsg: string = "";

    if (this.lstRegSelectedChartImmunizationIds == undefined || this.lstRegSelectedChartImmunizationIds.length == 0) {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);

      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      modalRef.componentInstance.promptHeading = "Immunization Registry"
      modalRef.componentInstance.promptMessage = "Please select at least one immunization.";
    }

    else {
      debugger;
      const modalRef = this.ngbModal.open(GenerateImmRegUpdateMessageComponent, this.popUpOptionsLg);
      modalRef.componentInstance.lstRegSelectedChartImmunizationIds = this.lstRegSelectedChartImmunizationIds;
      modalRef.componentInstance.patientId = Number(this.objencounterToOpen.patient_id);
      modalRef.componentInstance.chartId = Number(this.objencounterToOpen.chart_id);

      modalRef.result.then((result) => {

        this.clearRegistrySelectedData();

        if (result) {

          this.getViewData();
          //this.onRadioOptionChange(this.dataOption);
        }
      }, (reason) => {

        //this.getViewData();
        this.clearRegistrySelectedData();

      });


    }
  }

  clearRegistrySelectedData() {
    this.submitAfterSave = false;
    this.lstRegSelectedChartImmunizationIds = undefined;

    if (this.lstChartImmunizations != undefined) {
      this.lstChartImmunizations.forEach(v => {

        if ((<HTMLInputElement>document.getElementById("chk_" + v.chart_immunization_id)) != null) {
          (<HTMLInputElement>document.getElementById("chk_" + v.chart_immunization_id)).checked = false;
        }

      });
    }

  }


  onClose() {
    this.addEditView = false;
    this.readOnlyView = false;
    //this.registryView = false;
    //this.isRegistryLoading = false;
    //this.isRegistryFileProcessing = false;
    //this.lstRegSelectedImmunization = undefined;
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showHistory() {
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "immnuization_log";
    logParameters.logDisplayName = "Immunization/Injections Log";
    logParameters.logMainTitle = "Immunization/Injections Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;

    logParameters.lstOtherCriteria = lstOtherCriteria

    const modalRef = this.ngbModal.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }

  onDateFocusOut(date: string, controlName: string) {
    let formatedDate = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined && formatedDate != '') {
      this.vaccineFormGroup.get(controlName).setValue(formatedDate);
    }
  }
}
