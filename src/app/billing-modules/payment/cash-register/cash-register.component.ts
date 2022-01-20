import { Component, OnInit, Input, Inject, ViewChild, HostListener } from '@angular/core';
import { NgbActiveModal, NgbTimepickerConfig, NgbTabChangeEvent, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { LogMessage } from 'src/app/shared/log-message';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { SchedulerService } from 'src/app/services/scheduler/scheduler.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { PatientService } from 'src/app/services/patient/patient.service';
import { DecimalPipe } from '@angular/common';
import { GeneralService } from 'src/app/services/general/general.service';
import { RegExEnum, ServiceResponseStatusEnum, AlertTypeEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ORMCashRegisterAdd } from 'src/app/models/billing/orm-cash-register-add';
import { WrapperTwoObjectsSave } from 'src/app/models/general/wrapper-two-objects-save';
import { ORMSavePatientNotPaidReason } from 'src/app/models/patient/orm-save-not-paid-reason';
import { CustomValidators, datetimeValidator } from 'src/app/shared/custome-validators';
import { AppointmentOperationData } from 'src/app/ehr-modules/scheduler/appointment-operation-data';
import { WrapperCashRegisterSave } from 'src/app/models/general/wrapper-cash-register-save';
import { CcPaymentComponent } from '../cc-payment/cc-payment.component';

@Component({
  selector: 'cash-register',
  templateUrl: './cash-register.component.html',
  styleUrls: ['./cash-register.component.css']
})
export class CashRegisterComponent implements OnInit {

  @Input() appData: AppointmentOperationData;

  patientId;
  appointmentId;
  dos;
  providerId;
  locationId;

  providerName;
  locationName;

  formGroup: FormGroup;
  formNotPaidReason: FormGroup;

  patientName;
  patAge;
  patGender;
  patPID;
  patDOB;
  patAddress;
  patZip;
  patCity;
  patState;
  patContactNo;
  patInsurance;

  lstLocations;
  lstLocationProviders;
  lstFileredProviders;
  isLoading: boolean;
  cashRegisterInfo;
  lstCurrentDOSEntries;

  patientAdvance = 0.0;
  copay = 0.00;
  selfpayDue = 0.00;
  patientBalance = 0.00;

  lstPaymentMethod = ["CASH", "CHECK", "CREDIT CARD", "MONEY ORDER", "ADVANCE ADJUSTMENT", "WRITE OFF"];
  lstAuthorizedBy = ['User 1', 'User 2', 'User 3']


  paymentPlan;
  paymentPlanId;
  paymentPlanModifidUser;
  paymentPlanDateModified;

  dosModel;
  lstErrors;
  //lstErrors = ['Please select Payment Method', 'Please enter Advance Adjusted amount', 'Please enter Write Off amount', 'Please enter paid amount.']


  preLoadingCount: number = 0;

  totalDue = 0;
  totalPaidToday = 0;
  totalAdvanceAdjusted = 0;
  totalWriteOff = 0;

  NotPaidReasonRequired: boolean = false;
  printView: boolean = false;
  printCashRegisterId;


  copayPaid = 0;
  selfpayPaid = 0;
  prevBalPaid = 0;
  otherPaid = 0;
  advancePaid = 0;

  copayAdvanceAdjusted = 0;
  selfpayAdvanceAdjusted = 0;
  prevBalAdvanceAdjusted = 0;
  otherAdvanceAdjusted = 0;

  copayWriteOff = 0;
  selfpayWriteOff = 0;
  prevBalWriteOff = 0;


  isRecordSaved: boolean = false;
  isSaving: boolean = false;

  patPicURL: string;
  //downloadPath:string;
  wrapperCashRegisterSave: WrapperCashRegisterSave;


  popUpOptionsMD: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false    
  };

  constructor(public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private logMessage: LogMessage,
    private schedulerService: SchedulerService,
    private paymentService: PaymentService,
    private generalOperation: GeneralOperation,
    config: NgbTimepickerConfig,
    private dateTimeUtil: DateTimeUtil,
    private patientService: PatientService,
    private decimalPipe: DecimalPipe,
    private generalService: GeneralService,
    private ngbModal: NgbModal) {

    config.spinners = false;
    config.size = 'small';

  }
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    this.activeModal.dismiss('Cross click')
  }
  ngOnInit() {

    debugger;



    this.isLoading = true;
    this.patientId = this.appData.patientId;
    this.appointmentId = this.appData.appointmentId;

    this.preLoadingCount = 1;
    this.getPatientHeaderInfo();

    if (this.lookupList.lstPracticeWriteOffCodes == undefined || this.lookupList.lstPracticeWriteOffCodes.length == 0) {
      this.preLoadingCount++;
      this.getWriteOffCodes();
    }

    if (this.appointmentId == undefined) {


      this.providerId = this.lookupList.logedInUser.defaultProvider;

      if (this.generalOperation.getitemIndex(this.lookupList.locationList, 'id', this.lookupList.logedInUser.defaultLocation) != undefined) {
        this.locationId = this.lookupList.logedInUser.defaultLocation;
      }
      if (this.generalOperation.getitemIndex(this.lookupList.providerList, 'id', this.lookupList.logedInUser.defaultProvider) != undefined) {
        this.providerId = this.lookupList.logedInUser.defaultProvider;
      }

      this.dos = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      this.dosModel = this.dateTimeUtil.getDateModelFromDateString(this.dos, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

      this.lstLocations = this.lookupList.locationList.slice();
      //this.preLoadingCount++;
      //this.getLocationProviders();
    }
    else {

      this.dos = this.appData.appDate;
      this.providerId = this.appData.providerId;
      this.locationId = this.appData.locationId;

      if (this.dos != undefined) {
        this.dosModel = this.dateTimeUtil.getDateModelFromDateString(this.dos, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      }


      let loc = this.generalOperation.getitem(this.lookupList.locationList, "id", this.locationId.toString())
      this.locationName = loc.name;

      let pro = this.generalOperation.getitem(this.lookupList.providerList, "id", this.providerId.toString())
      this.providerName = pro.name;

      //this.preLoadingCount++;
     // this.getCashRegisterData();
    }

    this.getCashRegisterData();
    
    this.buildForm();
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      cmbLocation: this.formBuilder.control(this.locationId, (this.appointmentId == undefined ? Validators.required : null)),
      cmbProvider: this.formBuilder.control(this.providerId, (this.appointmentId == undefined ? Validators.required : null)),
      dpDOS: this.formBuilder.control(this.dosModel,
        Validators.compose([(this.appointmentId == undefined ? Validators.required : null),
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
        ])),
      cmbPaymentMethod: this.formBuilder.control("CASH", Validators.required),
      txtCheckNo: this.formBuilder.control(null),
      dpCheckDate: this.formBuilder.control(null, datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
      txtCopayDue: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),

      txtCopayPaid: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])
      ),
      txtSelfpayPaid: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtPrevBalPaid: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtOtherPaid: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtAdvancePaid: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),

      txtCopayAdvanceAdjusted: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtSelfpayAdvanceAdjusted: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtPrevBalAdvanceAdjusted: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtOtherAdvanceAdjusted: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),

      txtCopayWriteOff: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtSelfpayWriteOff: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtPrevBalWriteOff: this.formBuilder.control(null, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),

      txtComments: this.formBuilder.control(null, Validators.required),
      cmbWriteOff: this.formBuilder.control(null)
    },
      {
        validator: Validators.compose([
          CustomValidators.requiredWhenOneOptionWithValue('txtCheckNo', 'cmbPaymentMethod', 'CHECK'),
          CustomValidators.requiredWhenOneOptionWithValue('dpCheckDate', 'cmbPaymentMethod', 'CHECK'),
          CustomValidators.requiredWhenOneOptionWithValue('cmbWriteOff', 'cmbPaymentMethod', 'WRITE OFF'),
          //CustomValidators.validDate('dpCheckDate', true),
          //CustomValidators.validDate('dpDOS', true),
          CustomValidators.requiredAnyOfControlWhenOptionWithMultipleValue(['txtCopayPaid', 'txtSelfpayPaid', 'txtPrevBalPaid', 'txtOtherPaid', 'txtAdvancePaid'], 'cmbPaymentMethod', ['CASH', 'CHECK', 'CREDIT CARD', 'MONEY ORDER'], 'todayPayment'),
          CustomValidators.requiredAnyOfControlWhenOptionWithValue(['txtCopayAdvanceAdjusted', 'txtSelfpayAdvanceAdjusted', 'txtPrevBalAdvanceAdjusted', 'txtOtherAdvanceAdjusted'], 'cmbPaymentMethod', 'ADVANCE ADJUSTMENT', 'advanceAdjusted'),
          CustomValidators.requiredAnyOfControlWhenOptionWithValue(['txtCopayWriteOff', 'txtSelfpayWriteOff', 'txtPrevBalWriteOff'], 'cmbPaymentMethod', 'WRITE OFF', 'writeOff')
        ])
      }
    );

    this.formNotPaidReason = this.formBuilder.group({
      txtNotPaidReason: this.formBuilder.control(null, Validators.required),
      cmbAuthorizedBy: this.formBuilder.control(null)
    });
  }

  getPatientHeaderInfo() {
    this.patientService.getPatientHeader(this.patientId).subscribe(
      data => {
        this.preLoadingCount--;
        if (this.preLoadingCount == 0)
          this.isLoading = false;

        this.onHeaderSuccessfull(data);
      },
      error => {
        this.onHeaderError(error);
      }
    );
  }

  onHeaderSuccessfull(data) {

    this.patPID = data["pid"];
    this.patientName = data["last_name"] + ", " + data["first_name"];

    if (data["gender_code"] == 'F') {
      this.patGender = "FEMALE";
    }
    else if (data["gender_code"] == 'M') {
      this.patGender = "MALE";
    }
    else if (data["gender_code"] == 'U') {
      this.patGender = "UNKNOWN";
    }
    else {
      this.patGender = "";
    }

    this.patDOB = data["dob"];
    this.patAddress = data["address"];
    this.patCity = data["city"];
    this.patState = data["state"];
    this.patZip = data["zip"];
    this.patContactNo = data["primary_contact_no"];
    this.patAge = "";
    if (data['age_year'] > 0) {
      this.patAge += data['age_year'] + 'Y ';
    }
    if (data['age_month'] > 0) {
      this.patAge += data['age_month'] + 'M';
    }
    if (data['age_year'] == 0 && data['age_month'] == 0 && data['age_days'] > 0) {
      this.patAge += data['age_days'] + 'D';
    }


    this.patPicURL = this.generalOperation.getPatientPicturePath(data["pic"], data["gender_code"]);
  }
  onHeaderError(error) {
    this.logMessage.log("onHeaderError Error.");
  }


  /*
  getLocationProviders() {

    this.lstLocationProviders = undefined;
    this.schedulerService.getLocationProviders(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstLocationProviders = data;
        //this.filterProviders();
        this.preLoadingCount--;

        this.preLoadingCount++;
        this.getCashregisterInfo();

        //if (this.preLoadingCount <= 0) {
        //  this.isLoading = false;
        //}


      },
      error => {
        this.isLoading = false;
        this.ongetLocationProvidersError(error);
      }
    );
  }

  ongetLocationProvidersError(error) {
    this.logMessage.log("getLocationProviders Error.");
  }
  */


  getCashRegisterData() {

    this.isLoading = true;
    this.preLoadingCount = 2;
    this.getPaymentPlan();
    this.getCashregisterInfo();
  }

  /*
  filterProviders() {

    if (this.lstLocationProviders == undefined)
      return;

    this.lstFileredProviders = undefined;

    if (this.locationId != undefined) {
      this.lstFileredProviders = new ListFilterPipe().transform(this.lstLocationProviders, "location_id", this.locationId);
      let index: number = this.generalOperation.getitemIndex(this.lstFileredProviders, "provider_id", this.providerId);
      if (index == undefined && this.lstFileredProviders != undefined && this.lstFileredProviders.length > 0) {
        this.providerId = this.lstFileredProviders[0].provider_id;
      }
    }


    if (this.lstFileredProviders == undefined || this.lstFileredProviders.length == 0) {
      this.providerId = undefined;
    }
    (this.formGroup.get("cmbProvider") as FormControl).setValue(this.providerId);
  }
  */

  locationChanged(locId) {
    this.locationId = locId;
    //this.filterProviders();

    this.preLoadingCount = 1;
    this.getCashregisterInfo();
  }
  providerChanged(proId) {
    this.providerId = proId;
  }

  getWriteOffCodes() {

    this.paymentService.getWriteOffCodes(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lookupList.lstPracticeWriteOffCodes = data as Array<any>;
        this.preLoadingCount--;
        if (this.preLoadingCount <= 0)
          this.isLoading = false;

        //if (this.preLoadingCount == 0) {
        //  this.isLoading = true;
        //  this.preLoadingCount = 2;
        //  this.getPaymentPlan();
        //  this.getCashregisterInfo();
        //}
      },
      error => {
        this.isLoading = false;
        this.preLoadingCount--;
        this.ongetWriteOffCodesError(error);
      }
    );
  }

  ongetWriteOffCodesError(error) {
    this.logMessage.log("getWriteOffCodes Error.");
  }


  getAuthorizationUsers() {

    this.generalService.getAuthorizationUsers(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.authorizationUsers.lstAuthorizationUsers = data as Array<any>;
      },
      error => {
        this.ongetAuthorizationUsersError(error);
      }
    );
  }

  ongetAuthorizationUsersError(error) {
    this.logMessage.log("getAuthorizationUsers Error.");
  }


  getPaymentPlan() {
    this.paymentPlan = undefined;
    this.paymentPlanId = undefined;
    this.paymentPlanDateModified = undefined;
    this.paymentPlanModifidUser = undefined;

    this.paymentService.getPaymentPlan(this.patientId).subscribe(
      data => {
        if (data['length'] > 0) {
          this.paymentPlanId = data[0]['col1'];
          this.paymentPlan = data[0]['col2'];
          this.paymentPlanModifidUser = data[0]['col3'];
          this.paymentPlanDateModified = data[0]['col4'];
        }

        this.preLoadingCount--;
        if (this.preLoadingCount <= 0)
          this.isLoading = false;

      },
      error => {
        this.isLoading = false;
        this.preLoadingCount--;
        this.ongetPaymentPlanError(error);
      }
    );
  }

  ongetPaymentPlanError(error) {
    this.logMessage.log("getPaymentPlan Error.");
  }

  getCashregisterInfo() {

    debugger;
    this.cashRegisterInfo = undefined;

    this.copay = undefined;

    this.selfpayDue = undefined;
    this.patientAdvance = undefined;
    this.patientBalance = undefined;



    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.dos == undefined ? "" : this.dos, option: "" },
      { name: "provider_id", value: this.providerId == undefined ? "" : this.providerId, option: "" },
      { name: "location_id", value: this.locationId == undefined ? "" : this.locationId, option: "" }
    ];

    this.paymentService.getCashregisterInfo(searchCriteria).subscribe(
      data => {

        this.cashRegisterInfo = data;
        //this.pid = data["pid"];
        //this.patientName = data['patient_Name'];
        //this.gender = data['gender'];
        //this.age = "";
        //if (data['age_year'] > 0) {
        //          this.age += data['age_year'] + ' Y';
        //}
        //if (data['age_month'] > 0) {
        //          this.age += ' ' + data['age_month'] + ' M';
        //}

        //this.dob = data['dob'];
        //this.padAddress = data['address'];
        //this.patCity = data['city'];
        //this.patState = data['state'];
        //this.patZip = data['zip'];

        //this.patHomePhone = data['patient_phone'];

        this.patInsurance = data['ins_name'];
        this.copay = data['copay'];

        this.selfpayDue = data['self_pay_due'];
        this.patientAdvance = data['patient_advance'];
        this.patientBalance = data['prev_balance'];

        this.calculateTotalDue();

        this.preLoadingCount--;
        if (this.preLoadingCount <= 0)
          this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.preLoadingCount--;
        this.ongetCashregisterInfoError(error);
      }
    );
  }

  ongetCashregisterInfoError(error) {
    this.logMessage.log("getCashregisterInfo Error.");
  }

  getCurrentDOSEntries() {
    this.lstCurrentDOSEntries = undefined;

    this.isLoading = true;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.dos, option: "" }
    ];

    this.paymentService.getCashRegister(searchCriteria).subscribe(
      data => {
        this.lstCurrentDOSEntries = data;


        if (this.printCashRegisterId != undefined) {
          let objPrint = this.generalOperation.getitem(this.lstCurrentDOSEntries, "cash_register_id", this.printCashRegisterId);

          this.printCashRegister(objPrint);
        }

        this.isLoading = false;


      },
      error => {
        this.isLoading = false;
        this.ongetCurrentDOSEntriesError(error);
      }
    );
  }

  ongetCurrentDOSEntriesError(error) {
    this.logMessage.log("getCurrentDOSEntries Error.");
  }


  paymentMethodChanged(paymentMethod) {

  }

  onTabChange(event: NgbTabChangeEvent) {
    switch (event.nextId) {
      case 'tab-cashregister-currentDOSEntries':
        if (this.lstCurrentDOSEntries == undefined) {
          this.getCurrentDOSEntries();
        }
        break;
      default:
        break;
    }
  }

  calculateTotalPaidToday() {
    debugger;
    let todaysCopayPaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtCopayPaid") as FormControl).value);
    let todaysSelfPaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtSelfpayPaid") as FormControl).value);

    let todaysPrevBalPaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtPrevBalPaid") as FormControl).value);
    let todaysOtherPaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtOtherPaid") as FormControl).value);
    let todaysAdvancePaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtAdvancePaid") as FormControl).value);

    this.totalPaidToday = Number(todaysCopayPaid) + Number(todaysSelfPaid) + Number(todaysPrevBalPaid) + Number(todaysOtherPaid) + Number(todaysAdvancePaid);

  }
  calculateTotalDue() {

    debugger;
    let copayDue = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtCopayDue") as FormControl).value);
    this.totalDue = Number(copayDue) + Number(this.selfpayDue) + Number(this.patientBalance);
  }
  calculateTotalAdvanceAdjusted() {

    let copayAdjusted = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtCopayAdvanceAdjusted") as FormControl).value);

    let selfpayAdjusted = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtSelfpayAdvanceAdjusted") as FormControl).value);

    let prevBalAdjusted = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtPrevBalAdvanceAdjusted") as FormControl).value);

    let otherAdjusted = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtOtherAdvanceAdjusted") as FormControl).value);

    this.totalAdvanceAdjusted = Number(copayAdjusted) + Number(selfpayAdjusted) + Number(prevBalAdjusted) + Number(otherAdjusted);

  }
  calculateTotalWriteOff() {


    let copayWO = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtCopayWriteOff") as FormControl).value);
    let selfpayWO = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtSelfpayWriteOff") as FormControl).value);
    let prevBalAdWO = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtPrevBalWriteOff") as FormControl).value);

    this.totalWriteOff = Number(copayWO) + Number(selfpayWO) + Number(prevBalAdWO);
  }


  formateCurrencyInputs(value: any, id: any) {

    if (!isNaN(value)) {
      let formatedValue = this.decimalPipe.transform(value, ".2-2", "");
      (this.formGroup.get(id) as FormControl).setValue(formatedValue);

      switch (id) {
        case "txtCopayPaid":
        case "txtSelfpayPaid":
        case "txtPrevBalPaid":
        case "txtOtherPaid":
        case "txtAdvancePaid":
          this.calculateTotalPaidToday();
          break;
        case "txtCopayDue":
          this.calculateTotalDue();
          break;
        case "txtCopayAdvanceAdjusted":
        case "txtSelfpayAdvanceAdjusted":
        case "txtPrevBalAdvanceAdjusted":
        case "txtOtherAdvanceAdjusted":
          this.calculateTotalAdvanceAdjusted();
          break
        case "txtCopayWriteOff":
        case "txtSelfpayWriteOff":
        case "txtPrevBalWriteOff":
          this.calculateTotalWriteOff();
          break;
        default:
          break;
      }
    }
    else {
      switch (id) {
        case "txtCopayPaid":
        case "txtSelfpayPaid":
        case "txtPrevBalPaid":
        case "txtOtherPaid":
        case "txtAdvancePaid":
          this.totalPaidToday = 0;
          break;
        case "txtCopayDue":
          this.totalDue = 0;
          break;
        case "txtCopayAdvanceAdjusted":
        case "txtSelfpayAdvanceAdjusted":
        case "txtPrevBalAdvanceAdjusted":
        case "txtOtherAdvanceAdjusted":
          this.totalAdvanceAdjusted = 0;
          break
        case "txtCopayWriteOff":
        case "txtSelfpayWriteOff":
        case "txtPrevBalWriteOff":
          this.totalWriteOff = 0;
          break;
        default:
          break;
      }
    }
  }

  validateFormData(formData: any) {

    debugger;
    let isValid: boolean = true;
    this.lstErrors = [];

    if (this.locationId == undefined) {

      this.lstErrors.push("Please select location.");
      isValid = false;
    }

    if (this.providerId == undefined) {

      this.lstErrors.push("Please select Provider.");
      isValid = false;
    }

    if (formData.dpDOS != undefined) {
      this.dos = this.dateTimeUtil.getStringDateFromDateModel(formData.dpDOS);
    }
    if (this.dos == undefined) {
      this.lstErrors.push("Please select DOS.");
      isValid = false;
    }

    if (formData.cmbPaymentMethod == undefined || formData.cmbPaymentMethod == '') {

      this.lstErrors.push("Please select Payment Method.");
      isValid = false;
    }


    if ((formData.cmbPaymentMethod == "CASH" || formData.cmbPaymentMethod == "CREDIT CARD" || formData.cmbPaymentMethod == "CHECK" || formData.cmbPaymentMethod == "MONEY ORDER") && this.totalPaidToday <= 0) {

      this.lstErrors.push("Please enter Today's Payment.");
      isValid = false;
    }
    if (formData.cmbPaymentMethod == "ADVANCE ADJUSTMENT" && this.totalAdvanceAdjusted <= 0) {

      this.lstErrors.push("Please enter Advance Adjusted Amount.");
      isValid = false;
    }
    if (formData.cmbPaymentMethod == "WRITE OFF") {

      if (this.totalWriteOff <= 0) {
        this.lstErrors.push("Please enter Write Off Amount.");
        isValid = false;
      }
      if (formData.cmbWriteOff == undefined || formData.cmbWriteOff == '') {
        this.lstErrors.push("Please enter Wirte Off Code.");
        isValid = false;
      }
    }

    if (formData.cmbPaymentMethod == "CHECK") {

      if (formData.txtCheckNo == undefined || formData.txtCheckNo == '') {
        this.lstErrors.push("Please enter Check Number.");
        isValid = false;
      }

      if (formData.dpCheckDate == undefined || formData.dpCheckDate == '') {
        this.lstErrors.push("Please enter Check Date.");
        isValid = false;
      }

    }

    debugger
    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtCopayDue))) {
      this.lstErrors.push("Copay Due Amount is invalid.");
      isValid = false;
    }
    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtCopayPaid))) {
      this.lstErrors.push("Copay Paid Amount is invalid.");
      isValid = false;
    }
    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtSelfpayPaid))) {
      this.lstErrors.push("Selfpay Paid Amount is invalid.");
      isValid = false;
    }
    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtPrevBalPaid))) {
      this.lstErrors.push("Previous Balance Paid Amount is invalid.");
      isValid = false;
    }
    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtOtherPaid))) {
      this.lstErrors.push("Other Paid Amount is invalid.");
      isValid = false;
    }
    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtAdvancePaid))) {
      this.lstErrors.push("Advance Paid Amount is invalid.");
      isValid = false;
    }

    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtCopayAdvanceAdjusted))) {
      this.lstErrors.push("Copay Advance Adjusted Amount is invalid.");
      isValid = false;
    }
    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtSelfpayAdvanceAdjusted))) {
      this.lstErrors.push("Selfpay Advance Adjusted Amount is invalid.");
      isValid = false;
    }
    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtPrevBalAdvanceAdjusted))) {
      this.lstErrors.push("Previous Balance Advance Adjusted Amount is invalid.");
      isValid = false;
    }

    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtOtherAdvanceAdjusted))) {
      this.lstErrors.push("Other Advance Adjusted Amount is invalid.");
      isValid = false;
    }


    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtCopayWriteOff))) {
      this.lstErrors.push("Copay Write Off Amount is invalid.");
      isValid = false;
    }

    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtSelfpayWriteOff))) {
      this.lstErrors.push("Selfpay Write Off Amount is invalid.");
      isValid = false;
    }
    if (isNaN(GeneralOperation.getCurrencyNumbersOnly(formData.txtPrevBalWriteOff))) {
      this.lstErrors.push("Previous Balance Write Off Amount is invalid.");
      isValid = false;
    }


    if (formData.txtComments == undefined || formData.txtComments == '') {

      this.lstErrors.push("Please enter Comments.");
      isValid = false;
    }


    return isValid;

  }



  saveTwoObjectWrapper: WrapperTwoObjectsSave;
  onSubmit(form: any) {


    if (!this.validateFormData(form)) {
      return;
    }


    debugger;
    //this.lstErrors = undefined;//[];
    this.copayPaid = 0;
    this.selfpayPaid = 0;
    this.prevBalPaid = 0;
    this.otherPaid = 0;
    this.advancePaid = 0;

    this.copayAdvanceAdjusted = 0;
    this.selfpayAdvanceAdjusted = 0;
    this.prevBalAdvanceAdjusted = 0;
    this.otherAdvanceAdjusted = 0;

    this.copayWriteOff = 0;
    this.selfpayWriteOff = 0;
    this.prevBalWriteOff = 0;

    let ormSaveCashRegister: ORMCashRegisterAdd;
    this.saveTwoObjectWrapper = new WrapperTwoObjectsSave();

    /*
    if (this.locationId == undefined) {
      if (this.lstErrors == undefined)
        this.lstErrors = [];
      this.lstErrors.push("Please select location.");
      return;
    }

    if (this.providerId == undefined) {
      if (this.lstErrors == undefined)
        this.lstErrors = [];
      this.lstErrors.push("Please select Provider.");
      return;
    }

    if (this.dos == undefined) {

      this.dos = this.dateTimeUtil.getStringDateFromDateModel(form.dpDOS);

      if (this.dos == undefined) {
        if (this.lstErrors == undefined)
          this.lstErrors = [];
        this.lstErrors.push("Please select dos.");
        return;
      }
    }

    //lstPaymentMethod = ["CASH", "CHECK", "CREDIT CARD", "MONEY ORDER", "ADVANCE ADJUSTMENT", "WRITE OFF"];
    if ((form.cmbPaymentMethod == "CASH" || form.cmbPaymentMethod == "CHECK" || form.cmbPaymentMethod == "MONEY ORDER") && this.totalPaidToday <= 0) {
      if (this.lstErrors == undefined)
        this.lstErrors = [];
      this.lstErrors.push("Please enter Today's Payment.");
      return;
    }
    if (form.cmbPaymentMethod == "ADVANCE ADJUSTMENT" && this.totalAdvanceAdjusted <= 0) {
      if (this.lstErrors == undefined)
        this.lstErrors = [];
      this.lstErrors.push("Please enter Advance Adjusted Amount.");
      return;
    }
    if (form.cmbPaymentMethod == "WRITE OFF" && (this.totalWriteOff <= 0 || form.cmbWriteOff == undefined)) {

      let error = "Please enter Write Off Amount";

      if (this.lookupList.lstPracticeWriteOffCodes != undefined) {
        error += " and/or Wirte Off Code"
      }
      error += ".";
      if (this.lstErrors == undefined)
        this.lstErrors = [];
      this.lstErrors.push(error);
      return;
    }

  */




    this.copay = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtCopayDue));
    this.copayPaid = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtCopayPaid));
    this.selfpayPaid = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtSelfpayPaid));
    this.prevBalPaid = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtPrevBalPaid));
    this.otherPaid = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtOtherPaid));
    this.advancePaid = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtAdvancePaid));

    this.copayAdvanceAdjusted = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtCopayAdvanceAdjusted));
    this.selfpayAdvanceAdjusted = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtSelfpayAdvanceAdjusted));
    this.prevBalAdvanceAdjusted = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtPrevBalAdvanceAdjusted));
    this.otherAdvanceAdjusted = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtOtherAdvanceAdjusted));

    this.copayWriteOff = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtCopayWriteOff));
    this.selfpayWriteOff = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtSelfpayWriteOff));
    this.prevBalWriteOff = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtPrevBalWriteOff));

    ormSaveCashRegister = new ORMCashRegisterAdd();

    ormSaveCashRegister.patient_id = this.patientId;
    ormSaveCashRegister.provider_id = this.providerId;
    ormSaveCashRegister.location_id = this.locationId;
    ormSaveCashRegister.appointment_id = this.appointmentId;
    // ormSaveCashRegister.dos = this.dos;
    ormSaveCashRegister.payment_method = form.cmbPaymentMethod;
    ormSaveCashRegister.comments = form.txtComments;
    ormSaveCashRegister.copay_write_off = form.cmbWriteOff;
    ormSaveCashRegister.practice_id = this.lookupList.practiceInfo.practiceId;
    ormSaveCashRegister.system_ip = this.lookupList.logedInUser.systemIp;
    ormSaveCashRegister.created_user = this.lookupList.logedInUser.user_name;
    ormSaveCashRegister.modified_user = this.lookupList.logedInUser.user_name;
    ormSaveCashRegister.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    ormSaveCashRegister.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    if (this.appointmentId == undefined) {
      ormSaveCashRegister.dos = this.dateTimeUtil.getStringDateFromDateModel(form.dpDOS);
    }
    else {
      ormSaveCashRegister.dos = this.dos;
    }


    if (form.cmbPaymentMethod == "CHECK") {
      ormSaveCashRegister.check_number = form.txtCheckNo;
      ormSaveCashRegister.check_date = this.dateTimeUtil.getStringDateFromDateModel(form.dpCheckDate);
    }

    ormSaveCashRegister.copay_due = this.copay;
    ormSaveCashRegister.selfpay_due = this.selfpayDue;
    ormSaveCashRegister.previous_balance_due = this.patientBalance;

    ormSaveCashRegister.copay_paid = this.copayPaid;
    ormSaveCashRegister.selfpay_paid = this.selfpayPaid;
    ormSaveCashRegister.previous_balance_paid = this.prevBalPaid;
    ormSaveCashRegister.other_paid = this.otherPaid;
    ormSaveCashRegister.advance_paid = this.advancePaid;

    ormSaveCashRegister.copay_advance_adjusted = this.copayAdvanceAdjusted;
    ormSaveCashRegister.selfpay_advance_adjusted = this.selfpayAdvanceAdjusted;
    ormSaveCashRegister.prev_balance_advance_adjusted = this.prevBalAdvanceAdjusted;
    ormSaveCashRegister.other_advance_adjusted = this.otherAdvanceAdjusted;

    ormSaveCashRegister.copay_write_off = this.copayWriteOff;
    ormSaveCashRegister.selfpay_write_off = this.selfpayWriteOff;
    ormSaveCashRegister.prev_balance_write_off = this.prevBalWriteOff;

    this.saveTwoObjectWrapper.ormSave1 = ormSaveCashRegister;

    if ((this.copay > 0 && (this.copayPaid + this.copayAdvanceAdjusted + this.copayWriteOff) <= 0)
      || (this.selfpayDue > 0 && (this.selfpayPaid + this.selfpayAdvanceAdjusted + this.selfpayWriteOff) <= 0)
      || (this.patientBalance > 0 && (this.prevBalPaid + this.prevBalAdvanceAdjusted + this.prevBalWriteOff) <= 0)) {

      if (this.lookupList.authorizationUsers.isLoaded == false) {
        this.getAuthorizationUsers();
      }

      this.NotPaidReasonRequired = true;

    }
    else {
      // this.proceedToSave();
      this.saveCashRegister();
    }

  }

  notPaidReasonCancel() {

    this.NotPaidReasonRequired = false;
  }
  notPaidReasonSave(form) {


    let ormSavePatientNotPaidReason: ORMSavePatientNotPaidReason = new ORMSavePatientNotPaidReason();
    ormSavePatientNotPaidReason.appointment_id = this.appointmentId;
    ormSavePatientNotPaidReason.patient_id = this.patientId;
    ormSavePatientNotPaidReason.practice_id = this.lookupList.practiceInfo.practiceId;
    ormSavePatientNotPaidReason.not_paid_reson = form.txtNotPaidReason;
    ormSavePatientNotPaidReason.authorized_by = form.cmbAuthorizedBy;
    ormSavePatientNotPaidReason.created_user = this.lookupList.logedInUser.user_name;

    this.saveTwoObjectWrapper.ormSave2 = ormSavePatientNotPaidReason;

    // this.proceedToSave();
    this.saveCashRegister();

  }

  
  // proceedToSave() {

    
  //   if (this.wrapperCashRegisterSave.orm_cash_register.payment_method == 'CREDIT CARD'
  //     && this.lookupList.ccPaymentServiceName != undefined) {

  //     const modalRef = this.ngbModal.open(CcPaymentComponent, this.popUpOptionsMD);
  //     modalRef.componentInstance.paymentAmount = this.totalPaidToday;
  //     modalRef.componentInstance.patientId = this.patientId;


  //     modalRef.result.then((result) => {

       
  //       debugger;
  //       this.wrapperCashRegisterSave.cc_detail = result;

  //       //alert(result);

  //       this.saveCashRegister();

  //     }, (reason) => {
  //       //alert(reason);
  //     });
  //   }
  //   else {
  //     debugger;
  //     this.saveCashRegister();
  //   }
  // }
  
  saveCashRegister() {
    this.isSaving = true;
    this.paymentService.addCashRegister(this.saveTwoObjectWrapper).subscribe(
      data => {
        this.isSaving = false;
        this.saveCashRegisterSuccess(data);

      },
      error => {
        this.isSaving = false;
        this.saveCashRegisterError(error);

      }
    );
  }
  saveCashRegisterSuccess(data) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      debugger
      this.printCashRegisterId = data.result;
      this.getCurrentDOSEntries();
      this.NotPaidReasonRequired = false;
      this.isRecordSaved = true;
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {

      GeneralOperation.showAlertPopUp(this.ngbModal, "Cash Register", data.response, AlertTypeEnum.INFO)
      this.isRecordSaved = false;
    }
  }

  saveCashRegisterError(error) {

    GeneralOperation.showAlertPopUp(this.ngbModal, "Cash Register", "An Error Occured while saving.", AlertTypeEnum.INFO)
  }

  cashRegisterPrintData;
  printCashRegister(objCashRegiser) {
    this.cashRegisterPrintData = objCashRegiser;
    this.printView = true;
  }

  closePrintView() {
    if (this.isRecordSaved) {
      this.activeModal.close(this.isRecordSaved);
    }
    else {
      this.printView = false;
    }
  }

  patPicErrorHandler(event) {
    event.target.src = this.lookupList.defaultPatPic;;
  }

  onDateFocusOut(date: string, controlName: string) {
    let formatedDate = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined && formatedDate != '') {
      this.formGroup.get(controlName).setValue(formatedDate);
    }
  }
}


