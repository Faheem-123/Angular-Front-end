import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { LogMessage } from 'src/app/shared/log-message';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LabService } from 'src/app/services/lab/lab.service';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { DiagSearchCriteria } from 'src/app/general-modules/inline-diagnosis-search/diag-search-criteria';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { NgbModal, NgbModalOptions, NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PatientService } from 'src/app/services/patient/patient.service';
import { ORMLabOrder } from 'src/app/models/lab/ORMLabOrder';
import { ORMLabOrderTest } from 'src/app/models/lab/ORMLabOrderTest';
import { ORMLabOrderIcd } from 'src/app/models/lab/ORMLabOrderIcd';
import { ORMLabOrderComment } from 'src/app/models/lab/ORMLabOrderComment';
import { OrderSaveObjectWrapper } from 'src/app/models/lab/LabOrderSaveWrapper';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ServiceResponseStatusEnum, AlertTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ImportIcdComponent } from '../import-icd/import-icd.component';
import { rptLabRequisition } from 'src/app/models/lab/rptLabRequisition';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'lab-order',
  templateUrl: './lab-order.component.html',
  styleUrls: ['./lab-order.component.css']
})
export class LabOrderComponent implements OnInit {
  @Input() objencounterToOpen: EncounterToOpen;
  @Input() isNewOrder;
  @Input() order_Id;
  @Output() updateSummary = new EventEmitter<any>();
  inputForm: FormGroup;
  inputTestForm: FormGroup;
  inputIcdForm: FormGroup;
  inputFormComment: FormGroup;
  problTimeModel;
  arrPatientOrder: any;
  arrPatientInsurance: any;
  lstCategory: any;
  lstCategoryFiltered: any;
  arrfacility: any;
  arrOrderTest: any;
  arrOrderTestDel: any;
  arrOrderIcd: any;
  arrOrderIcdDel: any;
  arrOrderComment: any;
  showTestSearch = false;
  showLabSearch = false;
  showDiagSearch = false;
  testSearchCriteria: SearchCriteria;
  diagSearchCriteria: DiagSearchCriteria;
  cnfrmsend: boolean;
  isImport = false;
  canAddEdit = false;
  defaultLab_id = '';
  unique_id = Math.random().toString(36).substr(2, 9);

  orderSentMsg: string = '';
  signedMsg: string = '';

  constructor(private logMessage: LogMessage, private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil, @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private labService: LabService, private modalService: NgbModal, private patService: PatientService
    , private encounterService: EncounterService, private generalOperation: GeneralOperation, private rptReq: rptLabRequisition,
    config: NgbTimepickerConfig) {
    this.canAddEdit = this.lookupList.UserRights.lab_order_add_modify;
    config.spinners = false;
  }

  ngOnInit() {

    this.arrOrderIcdDel = new Array();
    this.arrOrderTestDel = new Array();
    this.arrOrderTest = new Array();
    this.arrOrderIcd = new Array();
    this.isSaving = false;
    this.buildForm();
    this.getViewData();
    this.cnfrmsend = false;
    if (this.isNewOrder) {
      this.onDefaultValues();
    }
    else {

    }
    debugger;
    if (this.canAddEdit == false) {
      this.inputForm.disable();
      this.inputTestForm.disable();
      this.inputIcdForm.disable();
    }
  }
  getViewData() {
    this.labService.getLabGroupTest(this.lookupList.practiceInfo.practiceId.toString())
      .subscribe(
        data => {
          debugger;
          this.lstCategory = data;
          this.lstCategoryFiltered = data;
          if (this.defaultLab_id != null && this.defaultLab_id != undefined && this.defaultLab_id != '')
            this.onLabChange(this.defaultLab_id);

        },
        error => {
          this.logMessage.log("An Error Occured while getting getLabCategoy list.")
        }
      );
    //Patient Insurance
    this.patService.getPatientInsuranceView(this.objencounterToOpen.patient_id)
      .subscribe(
        data => {
          debugger;
          this.arrPatientInsurance = data;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getLabCategoy list.")
        }
      );
    this.labService.getLabFacility(this.lookupList.practiceInfo.practiceId.toString())
      .subscribe(
        data => {
          debugger;
          this.arrfacility = data;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getLabCategoy list.")
        }
      );
    debugger;
    if (this.isNewOrder == false) {

      this.labService.getPatientOrderDetail(this.order_Id)
        .subscribe(
          data => {
            debugger;
            this.arrPatientOrder = data;
            if (this.arrPatientOrder != null && this.arrPatientOrder.length > 0)
              this.onAssignValues();
          },
          error => {
            this.logMessage.log("An Error Occured while getting getPatientOrderDetail list.")
          }
        );
      this.labService.getOrderTest(this.order_Id)
        .subscribe(
          data => {
            debugger;
            this.arrOrderTest = data;
          },
          error => {
            this.logMessage.log("An Error Occured while getting getOrderTest list.")
          }
        );
      this.labService.getOrderICD(this.order_Id)
        .subscribe(
          data => {
            debugger;
            this.arrOrderIcd = data;
          },
          error => {
            this.logMessage.log("An Error Occured while getting getOrderICD list.")
          }
        );
      this.labService.getOrderComments(this.order_Id)
        .subscribe(
          data => {
            debugger;
            this.arrOrderComment = data;
          },
          error => {
            this.logMessage.log("An Error Occured while getting getOrderComments list.")
          }
        );
    }

  }

  buildForm() {

    if (this.lookupList.practiceInfo.practiceId == 511) {
      this.defaultLab_id = "51110113";
    }
    if (this.lookupList.practiceInfo.practiceId == 512) {
      this.defaultLab_id = "5121012";
    }
    if (this.lookupList.practiceInfo.practiceId == 513) {
      this.defaultLab_id = "51310110";
    }
    else {
      if (this.lookupList.lstPracticeLab.length > 0) {
        this.defaultLab_id = this.lookupList.lstPracticeLab[0].id;
      }
    }

    this.inputForm = this.formBuilder.group({
      txtDate: this.formBuilder.control("", Validators.required),
      txtTime: this.formBuilder.control("", Validators.required),
      txtDueDate: this.formBuilder.control("", Validators.required),
      drpLab: this.formBuilder.control(this.defaultLab_id, Validators.required),
      drpStatus: this.formBuilder.control("COMPLETED", Validators.required),
      drpLocation: this.formBuilder.control("", Validators.required),
      drpProvider: this.formBuilder.control("", Validators.required),
      drpAssignedTo: this.formBuilder.control("", Validators.required),
      drpBillType: this.formBuilder.control("THIRD PARTY", Validators.required),
      drpResultTo: this.formBuilder.control("", Validators.required),
      drpOrderType: this.formBuilder.control("", Validators.required),
      drpFacility: this.formBuilder.control("", Validators.required),
      chkFasting: this.formBuilder.control(false, Validators.required),
      chkStat: this.formBuilder.control(false, Validators.required),
      chklabDraw: this.formBuilder.control(false, Validators.required),
      chkImage: this.formBuilder.control(false, Validators.required)
    })
    this.inputForm.get('drpFacility').disable();
    this.inputTestForm = this.formBuilder.group({
      txtTestSearch: this.formBuilder.control("", Validators.required),
      rdbTestSearchType: this.formBuilder.control("search_cpt", Validators.required)
    })
    this.inputIcdForm = this.formBuilder.group({
      txtIcdSearch: this.formBuilder.control(""),
      rdbIcdSearchOption: this.formBuilder.control("icd_mylist", Validators.required)
    })
    this.inputFormComment = this.formBuilder.group({
      txtComment: this.formBuilder.control(""),
    })

  }
  onSingleAdd(value) {
    if (this.inputForm.get("drpLab").value == '' || this.inputForm.get("drpLab").value == null) {
      this.onShowValidationPopUp('Test Search Validation', 'Please Select Lab First.', 'warning');
      return false;
    }
    this.arrOrderTest.push({

      test_id: '',
      lab_id: this.inputForm.get("drpLab").value,
      order_id: '',
      proc_code: value.proc_code,
      proc_description: value.proc_description,
      lab_assigned_cpt: value.lab_assigned_cpt,
      lab_assigned_desc: value.lab_assigned_desc,
      amount: 0.00,
      ndc: '',
      modifier: '',
      testdetail: value.proc_code + '( ' + value.proc_description + ')',
      units: '1',
      test_instructions: '',
      lab_category_id: value.category_id,

      code_type: 'CPT',
      accession_id: '',
      deleted: false,
      created_user: '',
      client_date_created: '',
      modified_user: '',
      client_date_modified: '',
      date_created: '',
      date_modified: '',
      source: ''

    });
    if (value.imaging == true) {
      (this.inputForm.get("chkImage") as FormControl).setValue(true);
    }
    else {
      (this.inputForm.get("chkImage") as FormControl).setValue(false);
    }
  }
  onAddAll(value) {
    if (this.inputForm.get("drpLab").value == '' || this.inputForm.get("drpLab").value == null) {
      this.onShowValidationPopUp('Test Search Validation', 'Please Select Lab First.', 'warning');
      return false;
    }
    let arrSelectedtest = new ListFilterPipe().transform(this.lstCategoryFiltered, "sub_category_id", value.sub_category_id);
    for (let i = 0; i < arrSelectedtest.length; i++) {
      this.arrOrderTest.push({
        test_id: '',
        lab_id: this.inputForm.get("drpLab").value,
        order_id: '',
        proc_code: arrSelectedtest[i].proc_code,
        proc_description: arrSelectedtest[i].proc_description,
        lab_assigned_cpt: arrSelectedtest[i].lab_assigned_cpt,
        lab_assigned_desc: arrSelectedtest[i].lab_assigned_desc,
        amount: 0.00,
        ndc: '',
        modifier: '',
        testdetail: arrSelectedtest[i].proc_code + '( ' + arrSelectedtest[i].proc_description + ')',
        units: '1',
        test_instructions: '',
        lab_category_id: arrSelectedtest[i].category_id,
        code_type: 'CPT',
        accession_id: '',
        deleted: false,
        created_user: '',
        client_date_created: '',
        modified_user: '',
        client_date_modified: '',
        date_created: '',
        date_modified: '',
        source: ''
      });
    }
  }
  onTestRadioOptionChange(event) {
    debugger;
    this.showTestSearch = false;
    this.showLabSearch = false;
    if (this.inputTestForm.get("txtTestSearch").value != null && this.inputTestForm.get("txtTestSearch").value.length > 2) {
      this.sentCriteriatoSearch(this.inputTestForm.get("txtTestSearch").value);
    }
  }
  onTestSearchKeydown(value) {
    debugger;
    if (this.inputForm.get("drpLab").value == '' || this.inputForm.get("drpLab").value == null) {
      this.onShowValidationPopUp('Test Search Validation', 'Please Select Lab First.', 'warning');
      return false;
    }
    if (value.length > 2) {
      this.sentCriteriatoSearch(value);
    }
    else {
      this.showTestSearch = false;
      this.showLabSearch = false;
    }
  }
  sentLabCriteriatoSearch(lab_id, code_type, value) {
    this.testSearchCriteria = new SearchCriteria();
    this.testSearchCriteria.criteria = lab_id;
    this.testSearchCriteria.option = code_type
    this.testSearchCriteria.param_list = [
      { name: "search_criteria", value: value, option: "" },
    ];
    this.showLabSearch = true;
  }
  sentCriteriatoSearch(value) {
    debugger;
    let code_tye = '';
    if (this.inputTestForm.get("rdbTestSearchType").value == "search_cpt") {
      code_tye = 'CPT';
    }
    else if (this.inputTestForm.get("rdbTestSearchType").value == "search_lab") {
      code_tye = 'LAB';
    }
    else if (this.inputTestForm.get("rdbTestSearchType").value == "search_loinc") {
      code_tye = 'LOINC';
    }
    else if (this.inputTestForm.get("rdbTestSearchType").value == "search_snomed") {
      code_tye = 'SNOMED';
    }

    this.testSearchCriteria = new SearchCriteria();
    let acFilterLab = new ListFilterPipe().transform(this.lookupList.lstPracticeLab, "id", this.inputForm.get("drpLab").value);
    if (acFilterLab.length > 0) {
      if (acFilterLab[0].is_external_lab == true) {
        this.sentLabCriteriatoSearch(this.inputForm.get("drpLab").value, code_tye, value);
      }
      else {
        this.testSearchCriteria.option = code_tye;
        this.testSearchCriteria.criteria = this.inputForm.get("drpLab").value;
        this.testSearchCriteria.param_list = [
          { name: "search_criteria", value: value, option: "" },
          { name: "dos", value: '', option: "" },
          { name: "provider_id", value: '', option: "" }

        ];
        this.showTestSearch = true;
      }
    }



  }
  closeTestSearch() {
    this.showTestSearch = false;
    this.showLabSearch = false;
    (this.inputTestForm.get("txtTestSearch") as FormControl).setValue('');
    //this.onProblemSearcBlur();
  }
  onLabTestSelect(value) {
    debugger;
    let test_type = ''
    if (this.inputTestForm.get("rdbTestSearchType").value == "search_cpt") {
      test_type = 'CPT';
    }
    else if (this.inputTestForm.get("rdbTestSearchType").value == "search_lab") {
      test_type = 'LAB';
    }
    else if (this.inputTestForm.get("rdbTestSearchType").value == "search_loinc") {
      test_type = 'LOINC';
    }
    else if (this.inputTestForm.get("rdbTestSearchType").value == "search_snomed") {
      test_type = 'SNOMED';
    }
    this.logMessage.log(value);
    this.arrOrderTest.push({
      test_id: '',
      lab_id: this.inputForm.get("drpLab").value,
      order_id: '',
      proc_code: value.proc_code,
      proc_description: value.proc_description,
      lab_assigned_cpt: value.lab_code,
      lab_assigned_desc: value.lab_description,
      amount: 0.00,
      ndc: '',
      modifier: '',
      testdetail: value.code + '( ' + value.description + ')',
      units: '1',
      test_instructions: '',
      lab_category_id: null,
      code_type: test_type,
      accession_id: '',
      deleted: false,
      created_user: '',
      client_date_created: '',
      modified_user: '',
      client_date_modified: '',
      date_created: '',
      date_modified: '',
      source: ''
    });

    this.showTestSearch = false;
    this.showLabSearch = false;

    (this.inputTestForm.get("txtTestSearch") as FormControl).setValue('');
  }
  onTestSelect(value) {
    let test_type = ''
    if (this.inputTestForm.get("rdbTestSearchType").value == "search_cpt") {
      test_type = 'CPT';
    }
    else if (this.inputTestForm.get("rdbTestSearchType").value == "search_lab") {
      test_type = 'LAB';
    }
    else if (this.inputTestForm.get("rdbTestSearchType").value == "search_loinc") {
      test_type = 'LOINC';
    }
    else if (this.inputTestForm.get("rdbTestSearchType").value == "search_snomed") {
      test_type = 'SNOMED';
    }
    this.logMessage.log(value);
    this.arrOrderTest.push({
      test_id: '',
      lab_id: this.inputForm.get("drpLab").value,
      order_id: '',
      proc_code: value.code,
      proc_description: value.description,
      // lab_assigned_cpt:value.lab_code,
      // lab_assigned_desc:value.lab_description,
      amount: 0.00,
      ndc: '',
      modifier: '',
      testdetail: value.code + '( ' + value.description + ')',
      units: '1',
      test_instructions: '',
      lab_category_id: value.category_id,
      code_type: test_type,
      accession_id: '',
      deleted: false,
      created_user: '',
      client_date_created: '',
      modified_user: '',
      client_date_modified: '',
      date_created: '',
      date_modified: '',
      source: ''
    });

    this.showTestSearch = false;
    this.showLabSearch = false;
    (this.inputTestForm.get("txtTestSearch") as FormControl).setValue('');
  }
  onTestDelete(obj, rowIndex) {
    if (obj.test_id != null && obj.test_id != "")
      this.arrOrderTestDel.push(obj);
    this.arrOrderTest.splice(rowIndex, 1);
  }
  onDiagnosisSelect(diag) {
    debugger;
    this.arrOrderIcd.push({
      diagnosise_id: '',
      order_id: "",
      diag_code: diag.diag_code,
      diag_description: diag.diag_description,
      diagdetail: diag.diag_code + " (" + diag.diag_description + ")",
      code_type: "ICD-10",
      sequence: this.arrOrderIcd.length + 1,
      deleted: "false",
      created_user: "",
      client_date_created: "",
      modified_user: "",
      client_date_modified: "",
      date_created: "",
      date_modified: ""
    });
    this.showDiagSearch = false;
    (this.inputIcdForm.get("txtIcdSearch") as FormControl).setValue('');
  }

  onDiagSearchKeydown(value) {
    if (value.length > 2) {
      this.sentDiagCriteriatoSearch(value);
    }
    else {
      this.showDiagSearch = false;
    }
  }
  closeDiagSearch() {
    this.showDiagSearch = false;
    (this.inputIcdForm.get("txtIcdSearch") as FormControl).setValue('');
  }
  onDiagRadioOptionChange(event) {
    debugger;
    // this.dataOption = event;
    this.showDiagSearch = false;
    if (this.inputIcdForm.get("txtIcdSearch").value != null && this.inputIcdForm.get("txtIcdSearch").value.length > 2) {
      this.sentDiagCriteriatoSearch(this.inputIcdForm.get("txtIcdSearch").value);
    }
  }
  sentDiagCriteriatoSearch(value) {
    debugger;
    this.diagSearchCriteria = new DiagSearchCriteria();

    if (this.inputIcdForm.get("rdbIcdSearchOption").value == "icd_mylist") {
      this.diagSearchCriteria.providerId = Number(this.objencounterToOpen.provider_id);
    }
    else {
      this.diagSearchCriteria.providerId = undefined;
    }
    this.diagSearchCriteria.codeType = 'ICD-10';
    this.diagSearchCriteria.criteria = value;
    this.diagSearchCriteria.dos = this.objencounterToOpen.visit_date;
    this.showDiagSearch = true;
  }
  onDiagDelete(obj, rwindex) {
    debugger;
    if (obj.diagnosise_id != null && obj.diagnosise_id != "")
      this.arrOrderIcdDel.push(obj);
    this.arrOrderIcd.splice(rwindex, 1);
  }
  onDefaultValues() {
    debugger;
    (this.inputForm.get("drpProvider") as FormControl).setValue(this.objencounterToOpen.provider_id);
    (this.inputForm.get("drpLocation") as FormControl).setValue(this.objencounterToOpen.location_id);

    //(this.inputForm.get("drpAdministeredBy") as FormControl).setValue(this.lookupList.logedInUser.userId);
    (this.inputForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.objencounterToOpen.visit_date.substring(0, 10), DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    this.problTimeModel = this.dateTimeUtil.getTimeModelFromTimeString(this.objencounterToOpen.visit_date.toString().substring(11), DateTimeFormat.DATEFORMAT_hh_mm_a);
    (this.inputForm.get("txtTime") as FormControl).setValue(this.problTimeModel);

    (this.inputForm.get("txtDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.objencounterToOpen.visit_date.substring(0, 10), DateTimeFormat.DATEFORMAT_MM_DD_YYYY));

  }
  onAssignValues() {    
    if (this.arrPatientOrder[0].order_sent == true) {
      this.orderSentMsg = 'Order Sent to Lab';
    }
    else {
      this.orderSentMsg = '';
    }
    if (this.arrPatientOrder[0].signed_by !=undefined && this.arrPatientOrder[0].signed_by !=null && this.arrPatientOrder[0].signed_by !=''
    && this.arrPatientOrder[0].signed_date !=undefined && this.arrPatientOrder[0].signed_date !=null && this.arrPatientOrder[0].signed_date !='') {
      this.signedMsg = 'Signed by '+this.arrPatientOrder[0].signed_by +' | '+this.arrPatientOrder[0].signed_date;
    }
    else {
      this.signedMsg = '';
    }
    
    debugger;
    (this.inputForm.get("drpProvider") as FormControl).setValue(this.arrPatientOrder[0].provider_id);
    (this.inputForm.get("drpLocation") as FormControl).setValue(this.arrPatientOrder[0].location_id);

    //(this.inputForm.get("drpAdministeredBy") as FormControl).setValue(this.lookupList.logedInUser.userId);
    (this.inputForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrPatientOrder[0].order_date.substring(0, 10), DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    this.problTimeModel = this.dateTimeUtil.getTimeModelFromTimeString(this.arrPatientOrder[0].order_date.substring(11), DateTimeFormat.DATEFORMAT_hh_mm_a);
    (this.inputForm.get("txtTime") as FormControl).setValue(this.problTimeModel);

    (this.inputForm.get("txtDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrPatientOrder[0].order_due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("drpLab") as FormControl).setValue(this.arrPatientOrder[0].lab_id);
    (this.inputForm.get("drpStatus") as FormControl).setValue(this.arrPatientOrder[0].status);
    (this.inputForm.get("drpAssignedTo") as FormControl).setValue(this.arrPatientOrder[0].assigned_to);
    (this.inputForm.get("drpBillType") as FormControl).setValue(this.arrPatientOrder[0].bill_type);
    (this.inputForm.get("drpResultTo") as FormControl).setValue(this.arrPatientOrder[0].prompt_result_to);
    (this.inputForm.get("drpOrderType") as FormControl).setValue(this.arrPatientOrder[0].order_type);
    (this.inputForm.get("drpFacility") as FormControl).setValue(this.arrPatientOrder[0].facility_id);
    (this.inputForm.get("chkFasting") as FormControl).setValue(this.arrPatientOrder[0].fasting);
    (this.inputForm.get("chkStat") as FormControl).setValue(this.arrPatientOrder[0].stat);
    (this.inputForm.get("chklabDraw") as FormControl).setValue(this.arrPatientOrder[0].lab_draw);
    (this.inputForm.get("chkImage") as FormControl).setValue(this.arrPatientOrder[0].imaging_order);

    if (this.inputForm.get("drpOrderType").value.toString().toUpperCase() == "MAMMOGRAM"
      || this.inputForm.get("drpOrderType").value.toString().toUpperCase() == "COLONOSCOPY"
      || this.inputForm.get("drpOrderType").value.toString().toUpperCase() == "OUTSIDE FACILITY") {
      this.inputForm.get('drpFacility').enable();
    }
    else {
      this.inputForm.get('drpFacility').disable();
      (this.inputForm.get("drpFacility") as FormControl).setValue(null);
    }
    debugger;
    if (this.canAddEdit == false) {
      this.inputForm.disable();
      this.inputTestForm.disable();
      this.inputIcdForm.disable();
    }
  }
  saveOrderDetail(): ORMLabOrder {
    debugger;
    let objLabOrder: ORMLabOrder = new ORMLabOrder;
    if (this.isNewOrder) {
      objLabOrder.order_id = "";
      objLabOrder.chart_id = this.objencounterToOpen.chart_id.toString();

      objLabOrder.created_user = this.lookupList.logedInUser.user_name;
      objLabOrder.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();

      objLabOrder.modified_user = this.lookupList.logedInUser.user_name;
      objLabOrder.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

      objLabOrder.status_detail = this.dateTimeUtil.getCurrentDateTimeString();
      objLabOrder.status_by = this.lookupList.logedInUser.user_name;
    }
    else {
      objLabOrder.chart_id = this.arrPatientOrder[0].chart_id;
      objLabOrder.order_id = this.arrPatientOrder[0].order_id;
      objLabOrder.client_date_created = this.arrPatientOrder[0].client_date_created;
      objLabOrder.created_user = this.arrPatientOrder[0].created_user;
      objLabOrder.date_created = this.arrPatientOrder[0].date_created;

      objLabOrder.modified_user = this.lookupList.logedInUser.user_name;
      objLabOrder.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      objLabOrder.is_abnormal = this.arrPatientOrder[0].is_abnormal;

      if (this.arrPatientOrder[0].status != null && this.arrPatientOrder[0].status != (this.inputForm.get("drpStatus").value == "" ? "PENDING" : this.inputForm.get("drpStatus").value.toString().toUpperCase())) {
        objLabOrder.status_detail = this.dateTimeUtil.getCurrentDateTimeString();
        objLabOrder.status_by = this.lookupList.logedInUser.user_name;
      }
      else {
        objLabOrder.status_detail = this.arrPatientOrder[0].status_detail;
        objLabOrder.status_by = this.arrPatientOrder[0].status_by;
      }
    }
    if (this.inputForm.get("drpBillType").value.toString().toUpperCase() == "PATIENT") {
      // if(cmbdiscount.selectedIndex>0)
      // 	objLabOrder.labcorp_discount=cmbdiscount.selectedItem.id;
      // else
      // 	objLabOrder.labcorp_discount="";
    }
    else
      objLabOrder.labcorp_discount = "";

    objLabOrder.imaging_order = this.inputForm.get("chkImage").value;
    objLabOrder.order_type = this.inputForm.get("drpOrderType").value == "" ? null : this.inputForm.get("drpOrderType").value;
    objLabOrder.facility_id = this.inputForm.get("drpFacility").value == "" ? null : this.inputForm.get("drpFacility").value;
    //objLabOrder.assigned_to = cmbAssigned.selectedIndex ==-1?null:cmbAssigned.selectedItem.user_name;
    objLabOrder.assigned_to = this.inputForm.get("drpAssignedTo").value == "" ? null : this.inputForm.get("drpAssignedTo").value;
    //objLabOrder.prompt_result_to = cmbResultTo.selectedIndex ==-1?null:cmbResultTo.selectedItem.user_name;
    objLabOrder.prompt_result_to = this.inputForm.get("drpResultTo").value == "" ? null : this.inputForm.get("drpResultTo").value;
    objLabOrder.location_id = this.inputForm.get("drpLocation").value == "" ? null : this.inputForm.get("drpLocation").value;
    objLabOrder.system_ip = this.lookupList.logedInUser.systemIp;

    if (this.inputForm.get("drpStatus").value == "") {
      objLabOrder.status = "PENDING";
      //	cmbStatus.selectedIndex = listStatus.getItemIndex("PENDING");
    }
    else
      objLabOrder.status = this.inputForm.get("drpStatus").value == "" ? "PENDING" : this.inputForm.get("drpStatus").value;

    objLabOrder.provider_id = this.inputForm.get("drpProvider").value == "" ? null : this.inputForm.get("drpProvider").value;
    objLabOrder.fasting = this.inputForm.get("chkFasting").value == true ? true : false;
    objLabOrder.bill_type = this.inputForm.get("drpBillType").value == "" ? null : this.inputForm.get("drpBillType").value;
    objLabOrder.stat = this.inputForm.get("chkStat").value == true ? true : false;
    objLabOrder.lab_draw = this.inputForm.get("chklabDraw").value == true ? true : false;

    objLabOrder.patient_id = this.objencounterToOpen.patient_id.toString();
    objLabOrder.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    if (this.cnfrmsend) {
      objLabOrder.order_sent = true;
    }
    else
      objLabOrder.order_sent = false;

    objLabOrder.deleted = false;
    objLabOrder.lab_id = this.inputForm.get("drpLab").value;
    //objLabOrder.lab_name = cmblab.selectedItem.name;
    //objLabOrder.not_perform_reason = txtReason.text;

    objLabOrder.order_date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtDate").value) + ' ' + this.dateTimeUtil.getStringTimeFromTimeModel(this.inputForm.get("txtTime").value);
    objLabOrder.order_due_date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtDueDate").value);
    return objLabOrder;
  }
  saveTest(): Array<ORMLabOrderTest> {
    let lstSave: Array<ORMLabOrderTest> = new Array;
    for (let i = 0; i < this.arrOrderTest.length; i++) {
      let objLabTest = new ORMLabOrderTest();
      objLabTest.deleted = false;
      objLabTest.proc_code = this.arrOrderTest[i].proc_code;
      objLabTest.proc_description = this.arrOrderTest[i].proc_description;
      objLabTest.test_instructions = this.arrOrderTest[i].test_instructions;
      objLabTest.units = this.arrOrderTest[i].units;
      objLabTest.lab_category_id = this.arrOrderTest[i].lab_category_id;
      objLabTest.code_type = this.arrOrderTest[i].code_type;
      objLabTest.education_provided = this.arrOrderTest[i].education_provided;

      objLabTest.amount = this.arrOrderTest[i].amount;
      objLabTest.modifier = this.arrOrderTest[i].modifier;
      objLabTest.ndc = this.arrOrderTest[i].ndc;

      objLabTest.lab_assigned_cpt = this.arrOrderTest[i].lab_assigned_cpt;
      objLabTest.lab_assigned_desc = this.arrOrderTest[i].lab_assigned_desc;

      objLabTest.system_ip = this.lookupList.logedInUser.systemIp;
      // for(var j:int=0;j<LabQuestionarr.length;j++)
      // {
      // 	if(LabQuestionarr[j].pdm==arrOrderTest[i].lab_assigned_cpt)
      // 	{
      // 		objLabTest.lab_question_txt=LabQuestionarr[j].answer;
      // 		break;
      // 	}
      // }
      if (this.arrOrderTest[i].test_id == "") {
        objLabTest.order_id = "";
        objLabTest.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        objLabTest.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        objLabTest.created_user = this.lookupList.logedInUser.user_name;
        objLabTest.modified_user = this.lookupList.logedInUser.user_name;
        //this.arrTestSave.addItem(objLabTest);
      }
      else {
        objLabTest.created_user = this.arrOrderTest[i].created_user;
        objLabTest.client_date_created = this.arrOrderTest[i].client_date_created;
        objLabTest.date_created = this.arrOrderTest[i].date_created;

        objLabTest.order_id = this.arrOrderTest[i].order_id;
        objLabTest.test_id = this.arrOrderTest[i].test_id;
        objLabTest.modified_user = this.lookupList.logedInUser.user_name;
        objLabTest.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        //this.arrTestSave.addItem(objLabTest);
      }
      lstSave.push(objLabTest);
    }
    return lstSave;
  }
  saveIcds(): Array<ORMLabOrderIcd> {
    debugger;
    let lstSave: Array<ORMLabOrderIcd> = new Array;
    for (let i = 0; i < this.arrOrderIcd.length; i++) {
      let objLabIcd = new ORMLabOrderIcd;

      objLabIcd.diag_code = this.arrOrderIcd[i].diag_code;
      objLabIcd.diag_description = this.arrOrderIcd[i].diag_description;
      objLabIcd.sequence = this.arrOrderIcd[i].sequence;
      objLabIcd.code_type = this.arrOrderIcd[i].code_type;
      objLabIcd.deleted = false;
      objLabIcd.system_ip = this.lookupList.logedInUser.systemIp

      if (this.arrOrderIcd[i].diagnosise_id == "") {
        objLabIcd.diagnosise_id = "";
        objLabIcd.created_user = this.lookupList.logedInUser.user_name;
        objLabIcd.modified_user = this.lookupList.logedInUser.user_name;

        objLabIcd.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        objLabIcd.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        //arrICDInsert.addItem(objLabIcd);
      }
      else {
        objLabIcd.diagnosise_id = this.arrOrderIcd[i].diagnosise_id;
        objLabIcd.date_created = this.arrOrderIcd[i].date_created;
        objLabIcd.client_date_created = this.arrOrderIcd[i].client_date_created;
        objLabIcd.created_user = this.arrOrderIcd[i].created_user;
        objLabIcd.order_id = this.arrOrderIcd[i].order_id;

        objLabIcd.modified_user = this.lookupList.logedInUser.user_name;
        objLabIcd.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        //arrICDUpdate.addItem(objLabIcd);
      }
      lstSave.push(objLabIcd);
    }
    return lstSave;
  }
  saveComments(): ORMLabOrderComment {
    let objLabComment = new ORMLabOrderComment();
    objLabComment.comment_id = "";
    objLabComment.comment = this.inputFormComment.get("txtComment").value;
    objLabComment.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    objLabComment.deleted = false;
    objLabComment.created_user = this.lookupList.logedInUser.user_name;
    objLabComment.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    return objLabComment;
  }
  isSaving = false;
  onSave() {
    debugger;
    if (this.validation()) {
      if (this.inputForm.get("drpStatus").value.toString().toUpperCase() != "COMPLETED")
        this.cnfrmsend = false;

      var is_external_lab: boolean = false;

      let acFilterLab = new ListFilterPipe().transform(this.lookupList.lstPracticeLab, "id", this.inputForm.get("drpLab").value);
      if (acFilterLab.length > 0) {
        if (acFilterLab[0].is_external_lab == true)
          is_external_lab = true;
      }
      if (is_external_lab == true
        &&
        this.inputForm.get("drpStatus").value.toString().toUpperCase() == "COMPLETED") {
        const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
        modalRef.componentInstance.promptHeading = 'Confirm Submit Lab Order';
        modalRef.componentInstance.promptMessage = 'Do you want to submit this order to the LAB ?\nModification is not allowed in order after this.';
        modalRef.componentInstance.alertType = 'danger';
        let closeResult;

        modalRef.result.then((result) => {

          if (result == PromptResponseEnum.YES) {
            this.cnfrmsend = true;
            debugger;
            this.saveDbRequest();
            return;
          }
          else
            this.cnfrmsend = false;
          debugger;
          this.saveDbRequest();
          return;
        });
      }
      else {
        debugger;
        this.saveDbRequest();
        return;
      }


    }
  }
  saveDbRequest() {
    debugger;
    this.isSaving = true;
    let objLabOrder: ORMLabOrder = this.saveOrderDetail();
    let lstOrderTestSave: Array<ORMLabOrderTest> = this.saveTest();
    let lstOrderDiagSave: Array<ORMLabOrderIcd> = this.saveIcds();
    let objOrderComment: ORMLabOrderComment;
    if (this.inputFormComment.get("txtComment").value != "") {
      objOrderComment = this.saveComments();
    }
    let testDeletedIds: string = "";
    if (this.arrOrderTestDel.length > 0) {
      for (let d = 0; d < this.arrOrderTestDel.length; d++) {
        if (testDeletedIds != "") {
          testDeletedIds += ","
        }
        testDeletedIds += this.arrOrderTestDel[d].test_id;
      }
    }
    let icdDeletedIds: string = "";
    if (this.arrOrderIcdDel.length > 0) {
      for (let d = 0; d < this.arrOrderIcdDel.length; d++) {
        if (icdDeletedIds != "") {
          icdDeletedIds += ","
        }
        icdDeletedIds += this.arrOrderIcdDel[d].diagnosise_id;
      }
    }
    let orderSaveObjectWrapper: OrderSaveObjectWrapper = new OrderSaveObjectWrapper();
    orderSaveObjectWrapper.order_id = this.order_Id;
    orderSaveObjectWrapper.practice_id = this.lookupList.practiceInfo.practiceId;
    orderSaveObjectWrapper.loged_in_user = this.lookupList.logedInUser.user_name;
    orderSaveObjectWrapper.client_date = this.dateTimeUtil.getCurrentDateTimeString();
    orderSaveObjectWrapper.system_ip = this.lookupList.logedInUser.systemIp;

    orderSaveObjectWrapper.order = objLabOrder;
    orderSaveObjectWrapper.lst_order_test = lstOrderTestSave;
    orderSaveObjectWrapper.lst_order_diag = lstOrderDiagSave;
    orderSaveObjectWrapper.order_comment = objOrderComment;

    let lstDeletedIds: Array<ORMKeyValue>;

    if (testDeletedIds != undefined && testDeletedIds != "") {
      if (lstDeletedIds == undefined) {
        lstDeletedIds = new Array();
      }
      lstDeletedIds.push(new ORMKeyValue('patient_order_test', testDeletedIds))
    }
    if (icdDeletedIds != undefined && icdDeletedIds != "") {
      if (lstDeletedIds == undefined) {
        lstDeletedIds = new Array();
      }
      lstDeletedIds.push(new ORMKeyValue('patient_order_diagnosis', icdDeletedIds))
    }

    orderSaveObjectWrapper.lst_deleted_ids = lstDeletedIds;

    this.labService.saveLabOrder(orderSaveObjectWrapper).subscribe(
      data => {
        debugger;
        this.saveOrderSuccess(data);
        this.isSaving = false;
      },
      error => {
        this.saveOrderError(error);
        this.isSaving = false;
      }
    );
  }
  saveOrderSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      //this.activeModal.close(true);
      this.order_Id = Number(data.result);
      this.isNewOrder = false;
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'LabOrder Save';
      modalRef.componentInstance.promptMessage = "Lab order save successfull.";

      //this.updateSummary.emit(this.order_Id);

      //this.onClaimSaved.emit(this.claimId);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'LabOrder Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveOrderError(error: any) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'LabOrder Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving LabOrder."
  }
  validation(): boolean {
    debugger;
    if (this.inputForm.get("drpLab").value == '' || this.inputForm.get("drpLab").value == null) {
      this.onShowValidationPopUp('Patient Order Validation', 'Please Select Lab', 'warning');
      return false;
    }
    if (this.inputForm.get("drpLab").value != '' && this.inputForm.get("drpLab").value != null) {
      let acFilterLab = new ListFilterPipe().transform(this.lookupList.lstPracticeLab, "id", this.inputForm.get("drpLab").value);
      if (acFilterLab.length > 0) {
        if (acFilterLab[0].is_external_lab == true && acFilterLab[0].phone == '') {
          this.onShowValidationPopUp('Patient Order Validation', 'Provider NPI is missing', 'warning');
          return false;
        }
        if (acFilterLab[0].is_external_lab == true) {
          for (let i = 0; i < this.arrOrderTest.length; i++) {
            //check for duplicate
            //Duplicate lab code is not allowed in case of
          }
          //
          //return false;
        }
      }
    }
    if (this.inputForm.get("drpBillType").value == '' || this.inputForm.get("drpBillType").value == null) {
      this.onShowValidationPopUp('Patient Order Validation', 'Please select Bill Type', 'warning');
      return false;
    }
    if (this.inputForm.get("drpBillType").value == 'Patient' && this.arrPatientInsurance.length == 0) {
      this.onShowValidationPopUp('Patient Order Validation', 'Please enter patient insurance first', 'warning');
      return false;
    }
    if (this.arrOrderTest.length == 0) {
      this.onShowValidationPopUp('Patient Order Validation', 'Please enter atleast one test.', 'warning');
      return false;
    }
    if (this.arrOrderTest.length > 40) {
      this.onShowValidationPopUp('Patient Order Validation', 'More than 40 Test`s are not allowed in single requisition.', 'warning');
      return false;
    }
    if (this.arrOrderIcd.length == 0) {
      this.onShowValidationPopUp('Patient Order Validation', 'Please select atleast one ICD/Diagnosis Code', 'warning');
      return false;
    }
    if (this.arrOrderTest != null && this.arrOrderTest.length > 0) {
      if (this.isNewOrder) {
        for (let i = 0; i < this.arrOrderTest.length; i++) {
          if (this.arrOrderTest[i].lab_category_id == "5001018" && this.lookupList.practiceInfo.practiceId.toString() == '500')//MRI category
          {
            //only prompt no return req
            this.onShowValidationPopUp('Patient Order Validation', 'X-Ray or Ultrasound should be ordered before MRI.', 'warning');
          }
        }
        var ismultipleCategory = false;
        for (var i = 0; i < this.arrOrderTest.length; i++) {
          var strlab_category_id = this.arrOrderTest[i].lab_category_id;
          if (strlab_category_id != null && strlab_category_id != undefined) {
            for (var j = 1; j < this.arrOrderTest.length; j++) {
              if (this.arrOrderTest[j].lab_category_id != null && this.arrOrderTest[j].lab_category_id != undefined) {
                if (strlab_category_id != this.arrOrderTest[j].lab_category_id)
                  ismultipleCategory = true;
                break;
              }
            }
          }
        }
        if (ismultipleCategory) {
          this.onShowValidationPopUp('Patient Order Validation', 'Test From Multiple Categories Are Not Allowed.', 'warning');
          return false;
        }
        //check for Test codes are according to lab
        for (let i = 0; i < this.arrOrderTest.length; i++) {
          if (this.arrOrderTest[i].lab_id != this.inputForm.get("drpLab").value) {
            this.onShowValidationPopUp('Patient Order Validation', 'Test are not mapped with Selected Lab.', 'warning');
            return false;
          }
        }


        // let uniqueLabCategory: any = new UniquePipe().transform(this.arrOrderTest, "lab_category_id");
        // if (uniqueLabCategory != undefined && uniqueLabCategory.length > 1) {
        //   this.onShowValidationPopUp('Patient Order Validation','Test From Multiple Categories Are Not Allowed.','warning');
        //   return false;
        // }


      }
    }

    //if(checkLabDraw)

    //this.onShowValidationPopUp('Patient Order Validation','Do you want to submit this order to the LAB ?\nModification is not allowed in order after this.','warning');
    // return false;
    if (this.arrOrderTest.length > 0) {
      let combination = 0;
      let strScode = "";
      for (let i = 0; i < this.arrOrderTest.length; i++) {
        if (this.arrOrderTest[i].proc_code == "93000" || this.arrOrderTest[i].proc_code == "93306" || this.arrOrderTest[i].proc_code == "78452"
          || this.arrOrderTest[i].proc_code == "93015") {
          if (strScode == "")
            strScode = this.arrOrderTest[i].proc_code;
          else
            strScode = ", " + this.arrOrderTest[i].proc_code;

          combination++;
        }
      }
      if (combination > 0) {
        this.onShowValidationPopUp('Patient Order Validation', 'Following codes cannot be sent in single order.Please order these codes separately.(' + strScode + ')', 'warning');
        return false;
      }
    }
    return true;
    //
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  onShowValidationPopUp(message_heading: string, message_Body: string, message_type: string) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = message_heading
    modalRef.componentInstance.promptMessage = message_Body;
    modalRef.componentInstance.alertType = message_type;
  }
  onOrderTypeChange(value) {
    if (value.toString().toUpperCase() == "MAMMOGRAM"
      || value.toString().toUpperCase() == "COLONOSCOPY"
      || value.toString().toUpperCase() == "OUTSIDE FACILITY") {
      this.inputForm.get('drpFacility').enable();
    }
    else {
      this.inputForm.get('drpFacility').disable();
      (this.inputForm.get("drpFacility") as FormControl).setValue(null);
    }
  }
  lstChartDiagnosis;
  onImport() {
    const modalRef = this.modalService.open(ImportIcdComponent, this.poupUpOptions);
    modalRef.componentInstance.patient_id = this.objencounterToOpen.patient_id;
    modalRef.componentInstance.chart_id = this.objencounterToOpen.chart_id;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          this.arrOrderIcd.push(result[i])
        }
      }
    }, (reason) => {
      //alert(reason);
    });

    // this.encounterService.getChartDiagnosis(this.objencounterToOpen.patient_id.toString(),this.objencounterToOpen.chart_id.toString()).subscribe(
    //   data => {
    //     this.isImport=true;
    //     this.lstChartDiagnosis = data;
    //   },
    //   error => {
    //     this.logMessage.log("An Error Occured while getChartDiagnosis.")
    //   }
    // );
    // this.isImport=true;

  }

  importSelectAll(value) {
    for (var i = 0; i < this.lstChartDiagnosis.length; i++) {
      this.lstChartDiagnosis[i].chk = value;
    }
  }
  importSingleSelect(value, doc) {
    this.lstChartDiagnosis[this.generalOperation.getElementIndex(this.lstChartDiagnosis, doc)].chk = value;
  }

  onImportOK() {

    for (var i = 0; i < this.lstChartDiagnosis.length; i++) {
      if (this.lstChartDiagnosis[i].chk == true)
        this.arrOrderIcd.push({
          diagnosise_id: '',
          order_id: "",
          diag_code: this.lstChartDiagnosis[i].code,
          diag_description: this.lstChartDiagnosis[i].description,
          diagdetail: this.lstChartDiagnosis[i].code + " (" + this.lstChartDiagnosis[i].description + ")",
          code_type: "ICD-10",
          sequence: this.arrOrderIcd.length + 1,
          deleted: "false",
          created_user: "",
          client_date_created: "",
          modified_user: "",
          client_date_modified: "",
          date_created: "",
          date_modified: ""
        });
    }
    this.isImport = false;
  }
  onPrint() {
    this.rptReq.order_id = this.order_Id;
    this.rptReq.patient_id = this.objencounterToOpen.patient_id;
    this.rptReq.arrDiagCode = this.arrOrderIcd;
    this.rptReq.getReportData();
  }
  closeLabTestSearch() {
    this.showTestSearch = false;
    this.showLabSearch = false;
    (this.inputTestForm.get("txtTestSearch") as FormControl).setValue('');
    //this.onProblemSearcBlur();
  }
  onCancel() {
    this.updateSummary.emit(this.order_Id);
  }
  txtinstructionFocusOut(value, index) {
    this.arrOrderTest[index].test_instructions = value;
  }
  onLabChange(value) {
    if (this.inputForm.get("drpLab").value == '' || this.inputForm.get("drpLab").value == null) {
      this.lstCategoryFiltered = this.lstCategory;
      return;
    }

    var isExternalLab = false;
    var lstLab = new ListFilterPipe().transform(this.lookupList.lstPracticeLab, "id", value);
    if (lstLab != null && lstLab != undefined && lstLab.length > 0) {
      isExternalLab = lstLab[0].is_external_lab;
    }
    debugger;
    if (isExternalLab != false)
      this.lstCategoryFiltered = new ListFilterPipe().transform(this.lstCategory, "external_lab_id", value);
    else
      this.lstCategoryFiltered = new ListFilterPipe().transform(this.lstCategory, "external_lab_id", "0");
  }
}
