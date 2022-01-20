import { Component, OnInit, Input, Inject, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { GeneralService } from '../../../services/general/general.service';
import { LogMessage } from '../../../shared/log-message';
import { ClaimService } from '../../../services/billing/claim.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { DiagSearchCriteria } from '../../../general-modules/inline-diagnosis-search/diag-search-criteria';
import { DiagnosisCodeType, ProcedureSearchType, RegExEnum, AlertTypeEnum, PromptResponseEnum, claimType, CallingFromEnum, ServiceResponseStatusEnum, OperationType } from 'src/app/shared/enum-util';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ProcedureSearchCriteria } from 'src/app/general-modules/inline-procedure-search/proc-search-criteria';
import { DecimalPipe } from '@angular/common';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { PatientInsuranceAddEditPopupComponent } from '../../../general-modules/insurance/patient-insurance-add-edit-popup/patient-insurance-add-edit-popup.component';
import { ClaimRulesService } from 'src/app/services/billing/claim-rules.service';
//import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { ClamSavePro } from 'src/app/models/billing/claim-save-pro';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { AddEditClaimNoteComponent } from '../claim-notes/add-edit-claim-note/add-edit-claim-note.component';
import { ClaimDiagnosisSavePro } from 'src/app/models/billing/claim-diagnosis-save-pro';
import { ClaimProceduresSavePro } from 'src/app/models/billing/claim-procedures-save-pro';
import { ClaimInsuranceSave } from 'src/app/models/billing/claim-insurance-save';
import { WrapperClaimSavePro } from 'src/app/models/billing/wrapper-claim-save-pro';
import { PatientService } from 'src/app/services/patient/patient.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { InlineProcedureSearchComponent } from 'src/app/general-modules/inline-procedure-search/inline-procedure-search.component';
import { InlineDiagnosisSearchComponent } from 'src/app/general-modules/inline-diagnosis-search/inline-diagnosis-search.component';
import { InlineInsuranceSearchComponent } from 'src/app/general-modules/insurance/inline-insurance-search/inline-insurance-search.component';
import { DateModel } from 'src/app/models/general/date-model';
import { EligibilityService } from 'src/app/services/patient/eligibility.service';
import { PatientEligibilityComponent } from 'src/app/ehr-modules/patient/patient-eligibility/patient-eligibility.component';
import { InlineRefPhysicianSearchComponent } from 'src/app/general-modules/inline-ref-physician-search/inline-ref-physician-search.component';
import { ImportPatientInsuranceComponent } from 'src/app/general-modules/insurance/import-patient-insurance/import-patient-insurance.component';
import { BillingService } from 'src/app/services/billing/billing.service';
import { HcfaViewerComponent } from '../../hcfa/hcfa-viewer/hcfa-viewer.component';
import { SubmissionProccessedClaimInfo } from 'src/app/models/billing/submission-proccessed-claim-info';
import { HcfaPrintOptionPopupComponent } from '../../hcfa/hcfa-print-option-popup/hcfa-print-option-popup.component';
import { PatientClaimReceiptPrintComponent } from '../patient-claim-receipt-print/patient-claim-receipt-print.component';


@Component({
  selector: 'claim-professional',
  templateUrl: './claim-professional.component.html',
  styleUrls: ['./claim-professional.component.css']
})
export class ClaimProfessionalComponent implements OnInit {


  @Input() openedClaimInfo: OpenedClaimInfo;
  @Output() onClaimSaved = new EventEmitter<any>();
  @Output() showImportIcdCptModule = new EventEmitter<any>();

  @ViewChild('txtRefPhy') txtRefPhy: ElementRef;
  @ViewChild('txtDiagSearch') txtDiagSearch: ElementRef;
  @ViewChild('chkDiagnosisSearchAll') chkDiagnosisSearchAll: ElementRef;

  @ViewChild('txtProcSearch') txtProcSearch: ElementRef;
  @ViewChild('chkProcedureSearchAll') chkProcedureSearchAll: ElementRef;

  @ViewChild('inlineClaimProcSearch') inlineClaimProcSearch: InlineProcedureSearchComponent;
  @ViewChild('inlineClaimDiagSearch') inlineClaimDiagSearch: InlineDiagnosisSearchComponent;
  @ViewChild('inlineClaimInsSearch') inlineClaimInsSearch: InlineInsuranceSearchComponent;
  @ViewChild('inlineRefSearch') inlineRefSearch: InlineRefPhysicianSearchComponent;


  claimType: string = claimType.PROFESSIONAL;
  callingFrom: string = CallingFromEnum.CLAIM_ENTRY;
  patientId: number;
  claimId: number;

  controlUniqueId: string = "";

  selectedDOSYYYYMMDD: string;
  //defaultProviderId:number;
  //defaualtlocationId:number;
  addEditOperation: string;

  defaultFacilityId: number;
  selectedFacilityPOSCode: string = "";

  claimFormGroup: FormGroup;

  isLoading: boolean = true;
  isSaving: boolean = false;
  isProcessing: boolean = false;


  objClaim: any;
  lstClaimDiagnosis: Array<any>;
  lstClaimProcedures: Array<any>;
  lstClaimInsurance: Array<any>;

  lstBillingProviderTaxonomyList: Array<any>;


  claimTotal: number = 0;
  claimDue: number = 0;
  isSelfPay: boolean = false;
  billingProviderTaxonomy: string = '';

  //lstBillingPhysician:Array<any>;
  //lstFacilities:Array<any>;

  showICDCol2: boolean = false;
  selectedICDCode: string = "";

  selectedDiagnosisRow: number = 0;
  selectedProcedureRow: number = 0;

  preDataPopulateCount: number = 0;
  dataPopulateCount: number = 0;
  followUpCodesPopulateCount: number = 0;

  showRefPhySearch: boolean = false;
  showDiagSearch: boolean = false;
  showProcSearch: boolean = false;
  diagSearchCriteria: DiagSearchCriteria;
  procedureSearchCriteria: ProcedureSearchCriteria;

  lstDeletedDiagnosis: Array<number>;
  lstDeletedProcedures: Array<number>;
  lstDeletedInsurances: Array<number>;

  //strDeletedClaimDiagnosis: string;
  //strDeletedClaimProcedures: string;

  newProcedureTempId: number = -1;

  lstNDCMeasure: Array<string> = new Array("F2", "GR", "ME", "ML", "UN");

  //isNDCExist:boolean=false;

  lstAuthorizationType: Array<string> = ["Prior Auth No", "Referral No"];
  lstShowInsuranceSearch: Array<ORMKeyValue> = [];
  lstShowInsuranceSubscriberSearch: Array<ORMKeyValue> = [];
  lstInsuranceWCCities: Array<any>;
  isInsuranceExists: boolean = false;
  isAllInsurancesEntered: boolean = false;
  //insuranceDeletedIds: string;
  insOperation: string;


  patientClaimRuleInfo: any;
  lstSelfPayPatient: any;

  showImportICDCPT: boolean = false;
  showSuperBill: boolean = false;

  claimDiagCount: number = 0;



  isClaimSavedAndSubmitted: boolean = false;

  clientDateTime: string = "";

  //isDOSChanged: boolean = false;

  tempClaimInsuranceId: number = 0;
  dosChangeCallingFrom: string = ""

  popUpOptionsLarge: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };


  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };


  constructor(private claimService: ClaimService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalService: GeneralService,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private decimalPipe: DecimalPipe,
    private ngbModal: NgbModal,
    private claimRulesService: ClaimRulesService,
    private patientService: PatientService,
    private generalOperation: GeneralOperation, private eligibilityService: EligibilityService,
    private billingService: BillingService) { }


  ngOnInit() {

    if (this.lookupList.logedInUser.userType.toLocaleLowerCase() == "billing") {
      this.lookupList.showClaimProcDescription = false;
    }

    debugger;
    this.patientId = this.openedClaimInfo.patientId;
    this.claimId = this.openedClaimInfo.claimId;

    this.controlUniqueId = this.patientId + "_claim_" + (this.claimId == undefined ? 'newclaim' : this.claimId);
    //this.selectedDOSYYYYMMDD=  this.dateTimeUtil.convertDateTimeFormat(this.openedClaimInfo.dos, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);


    // this.providerId = this.openedClaimInfo.providerId;
    // this.locationId = this.openedClaimInfo.locationId;
    this.addEditOperation = this.openedClaimInfo.operationType;
    this.callingFrom = this.openedClaimInfo.callingFrom;


    if (this.lookupList.billingProviderList == undefined || this.lookupList.billingProviderList.length == 0) {
      this.preDataPopulateCount++;
      this.getBillingProviderList();
    }
    if (this.lookupList.facilityList == undefined || this.lookupList.facilityList.length == 0) {
      this.preDataPopulateCount++;
      this.getFacilityList();
    }

    if (this.lookupList.practicePOSList == undefined || this.lookupList.practicePOSList.length == 0) {
      this.preDataPopulateCount++;
      this.getPracticePOSList();
    }
    if (this.lookupList.modifierList == undefined || this.lookupList.modifierList.length == 0) {
      this.preDataPopulateCount++;
      this.getModifierList();
    }
    if (this.lookupList.statesList == undefined || this.lookupList.statesList.length == 0) {
      this.preDataPopulateCount++;
      this.getStatesList();
    }

    this.preDataPopulateCount++;
    this.getClaimRulePatientInfo();

    this.preDataPopulateCount++;
    this.getPatientSelfPay();

    this.buidlForm();

    if (this.preDataPopulateCount == 0) {
      this.loadClaimData();
    }



  }

  buidlForm() {
    this.claimFormGroup = this.formBuilder.group({
      dpDOS: this.formBuilder.control(null, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      ddFaciliy: this.formBuilder.control(null),
      ddLocation: this.formBuilder.control(null),
      ddAttendingPhysician: this.formBuilder.control(null),
      ddBillingPhysician: this.formBuilder.control(null),
      txtRefPhy: this.formBuilder.control(null),
      txtRefPhyIDHidden: this.formBuilder.control(null),
      chkSelfPay: this.formBuilder.control(null),


      chkEmployment: this.formBuilder.control(false),
      chAutoAccident: this.formBuilder.control(false),
      chkOtherAccident: this.formBuilder.control(false),
      chkEmergencey: this.formBuilder.control(false),
      dpAccidentDate: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      ddStates: this.formBuilder.control(null),

      txtClaimNo: this.formBuilder.control(null),
      txtLUO: this.formBuilder.control(null),
      txtPaperPayerID: this.formBuilder.control(null),
      txtHCFA_17_A: this.formBuilder.control(null),
      dpLMP: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpLastXRay: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtPriorAuthNo: this.formBuilder.control(null),
      txtResubmissionCode: this.formBuilder.control(null),
      dpStartCareDate: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpHospitalFrom: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpHospitalTo: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtNotes: this.formBuilder.control(null),
      chkLabClaim: this.formBuilder.control(false),
      chkOutsideLab: this.formBuilder.control(false),
      txtOutsideLabCharges: this.formBuilder.control(null),
      chkEPSDT: this.formBuilder.control(false),
      chkAA: this.formBuilder.control(true),
      chkIsCorrected: this.formBuilder.control(false),
      chkEAP: this.formBuilder.control(false),
      rbSubmissionOption: this.formBuilder.control(null),
      ddHCFAInsurance: this.formBuilder.control(null),
      chkDoNotBill: this.formBuilder.control(false),
      chkFolowUp: this.formBuilder.control(false),
      ddBillingPhysicianTaxonomy: this.formBuilder.control(''),
    }
    )

  }

  laodChartFollowUpCodes() {

    if (this.selectedDOSYYYYMMDD != undefined && this.selectedDOSYYYYMMDD != "") {
      this.followUpCodesPopulateCount = 2;
      this.getChartFollowUpDiagnosis();
      this.getChartFollowUpProcedures();
    }

  }

  assignChartFollowUpCodes() {

    if (this.followUpCodesPopulateCount > 0)
      return;

    this.assignDxPointers(undefined);

    /*
  if (this.lstClaimProcedures != undefined && this.lstClaimDiagnosis != undefined) {

    this.lstClaimProcedures.forEach(element => {

      if (this.claimDiagCount == 1) {
        element.dx_pointer1 = 1;
      }
      if (this.claimDiagCount == 2) {
        element.dx_pointer1 = 1;
        element.dx_pointer2 = 2;
      }
      if (this.claimDiagCount == 3) {
        element.dx_pointer1 = 1;
        element.dx_pointer2 = 2;
        element.dx_pointer3 = 3;
      }
      if (this.claimDiagCount >= 4) {
        element.dx_pointer1 = 1;
        element.dx_pointer2 = 2;
        element.dx_pointer3 = 3;
        element.dx_pointer4 = 3;
      }
    });
  }
  */

    this.createProcedureControls()
  }

  loadClaimData() {


    if (this.preDataPopulateCount == 0) {

      if (this.addEditOperation == OperationType.ADD) // New
      {
        this.assignValues();
        //this.isLoading = false;
        this.isClaimSavedAndSubmitted = false;

      }
      else if (this.addEditOperation == OperationType.EDIT && this.claimId != undefined) // Edit
      {
        this.dataPopulateCount = 4;
        this.isLoading = true;
        this.getClaim();
        this.getProClaimDiagnosis();
        this.getProClaimProcedures()
        this.getClaimInsurance()
      }
      else {
        this.isClaimSavedAndSubmitted = false;
      }
    }

    /*
    if (this.preDataPopulateCount == 0 && this.claimId != undefined) {
      this.dataPopulateCount = 4;
      this.isLoading = true;
      this.getClaim();
      this.getProClaimDiagnosis();
      this.getProClaimProcedures()
      this.getClaimInsurance()
    }
    else {
      this.isClaimSavedAndSubmitted = false;
    }
    */
  }

  assignValues() {

    if (this.dataPopulateCount > 0) {
      return;
    }

    if (this.lstClaimDiagnosis != undefined) {
      this.claimDiagCount = this.lstClaimDiagnosis.length;
    }
    else {
      this.claimDiagCount = 0;
    }

    if (this.openedClaimInfo.operationType == OperationType.ADD) {

      if (this.openedClaimInfo.dos != undefined) {
        this.selectedDOSYYYYMMDD = this.dateTimeUtil.convertDateTimeFormat(this.openedClaimInfo.dos, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);
      }
      else {
        this.selectedDOSYYYYMMDD = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD);
      }

      this.dosChangeCallingFrom = "loading";
      this.claimFormGroup.get("dpDOS").setValue(this.dateTimeUtil.getDateModelFromDateString(this.selectedDOSYYYYMMDD, DateTimeFormat.DATEFORMAT_YYYY_MM_DD));
      this.dosChangeCallingFrom = "";

      this.claimFormGroup.get("rbSubmissionOption").setValue("electronic");
      this.claimFormGroup.get("chkAA").setValue(true);
      this.claimFormGroup.get("chkSelfPay").setValue(false);
      // if (this.lookupList.facilityList != undefined) {

      //   if (this.lookupList.facilityList.length == 1) {
      //     this.defaultFacilityId = this.lookupList.facilityList[0].id;
      //     this.selectedFacilityPOSCode = this.lookupList.facilityList[0].pos_code;
      //   }
      //   else {
      //     this.lookupList.facilityList.forEach(element => {
      //       if (element.is_default == true) {
      //         this.defaultFacilityId = element.id;
      //         this.selectedFacilityPOSCode = element.pos_code;
      //       }
      //     });
      //   }

      //   this.claimFormGroup.get("ddFaciliy").setValue(this.defaultFacilityId);

      // }


      debugger;
      let defaultProvider: number;
      let defaultProviderName: string;
      if (this.openedClaimInfo.providerId != undefined) {
        defaultProvider = this.openedClaimInfo.providerId;
      }
      else {
        defaultProvider = this.lookupList.logedInUser.defaultProvider;
      }
      this.claimFormGroup.get("ddAttendingPhysician").setValue(defaultProvider);
      defaultProviderName = this.openedClaimInfo.providerName;

      let defaultLocation: number;
      if (this.openedClaimInfo.locationId != undefined) {
        defaultLocation = this.openedClaimInfo.locationId;
      }
      else {
        defaultLocation = this.lookupList.logedInUser.defaultLocation;
      }
      this.claimFormGroup.get("ddLocation").setValue(defaultLocation);

      if (this.lookupList.facilityList != undefined) {


        // set default facility for selected location.
        if (this.lookupList.locationList != undefined && this.lookupList.locationList.length > 0) {
          for (let i = 0; i < this.lookupList.locationList.length; i++) {
            debugger;
            if (this.lookupList.locationList[i].id == defaultLocation) {
              debugger;
              if (this.lookupList.locationList[i].facility_id != null
                && this.lookupList.locationList[i].facility_id != undefined
                && this.lookupList.locationList[i].facility_id != '') {


                this.lookupList.facilityList.map(facility => {
                  if (facility.id == this.lookupList.locationList[i].facility_id) {
                    this.defaultFacilityId = facility.id;
                    this.selectedFacilityPOSCode = facility.pos_code;
                  }
                })
              }
            }
          }
        }

        debugger;
        // set default facility if not set from location
        if (this.defaultFacilityId == undefined) {
          if (this.lookupList.facilityList.length == 1) {
            this.defaultFacilityId = this.lookupList.facilityList[0].id;
            this.selectedFacilityPOSCode = this.lookupList.facilityList[0].pos_code;
          }
          else {
            this.lookupList.facilityList.forEach(element => {
              if (element.is_default == true) {
                this.defaultFacilityId = element.id;
                this.selectedFacilityPOSCode = element.pos_code;
              }
            });
          }
        } 
        debugger;
        this.claimFormGroup.get("ddFaciliy").setValue(this.defaultFacilityId);
      }

      for (let i = 0; i < this.lookupList.locationList.length; i++) {
        if (this.lookupList.locationList[i] == defaultLocation
          && this.lookupList.locationList[i].facility_id != null && this.lookupList.locationList[i].facility_id != undefined
          && this.lookupList.locationList[i].facility_id != '') {
          this.onLocationChange(i);
          break;
        }
      }

      let defaultBillingProvider: number;
      if (this.lookupList.logedInUser.defaultBillingProvider < 1) {
        defaultBillingProvider = this.lookupList.billingProviderList[0].id;
      }
      else {
        defaultBillingProvider = this.lookupList.logedInUser.defaultBillingProvider;
      }

      this.claimFormGroup.get("ddBillingPhysician").setValue(defaultBillingProvider);
      if (defaultProviderName != null && defaultProviderName != undefined && defaultProviderName != '') {
        for (let i = 0; i < this.lookupList.billingProviderList.length; i++) {
          if (defaultProviderName.toUpperCase() == this.lookupList.billingProviderList[i].name.toString().toUpperCase()) {
            this.claimFormGroup.get("ddBillingPhysician").setValue(this.lookupList.billingProviderList[i].id);
            break;
          }
          else {
            this.claimFormGroup.get("ddBillingPhysician").setValue(null);
          }
        }
      }
      // this.claimFormGroup.get("ddBillingPhysician".setValue(defaultBillingProvider);


      this.isClaimSavedAndSubmitted = false;

      //this.isLoading = true;
      if (this.lstSelfPayPatient != undefined && this.lstSelfPayPatient.length > 0 && this.lstSelfPayPatient[0].col2 == '0')
        this.getPatientInsurance();
      else {
        this.claimFormGroup.get("chkSelfPay").setValue(true);
        this.isLoading = false;
      }

      // update pinters in cpts
      this.laodChartFollowUpCodes();

    }
    else if (this.openedClaimInfo.operationType == OperationType.EDIT) {
      this.selectedFacilityPOSCode = this.objClaim.pos;

      this.isSelfPay = this.objClaim.self_pay;
      this.billingProviderTaxonomy = this.objClaim.billing_provider_taxonomy;

      this.isClaimSavedAndSubmitted = !this.objClaim.draft;

      if (this.objClaim.dos != null && this.objClaim.dos != "01/01/1900") {
        this.selectedDOSYYYYMMDD = this.dateTimeUtil.convertDateTimeFormat(this.objClaim.dos, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);
        this.claimFormGroup.get("dpDOS").setValue(this.dateTimeUtil.getDateModelFromDateString(this.selectedDOSYYYYMMDD, DateTimeFormat.DATEFORMAT_YYYY_MM_DD));
      }


      this.claimFormGroup.get("ddFaciliy").setValue(this.objClaim.facility_id);
      this.claimFormGroup.get("ddLocation").setValue(this.objClaim.location_id);
      this.claimFormGroup.get("ddAttendingPhysician").setValue(this.objClaim.attending_physician);
      this.claimFormGroup.get("ddBillingPhysician").setValue(this.objClaim.billing_physician);
      this.claimFormGroup.get("txtRefPhy").setValue(this.objClaim.referring_physician_name);
      this.claimFormGroup.get("txtRefPhyIDHidden").setValue(this.objClaim.referring_physician);
      this.claimFormGroup.get("chkSelfPay").setValue(this.objClaim.self_pay);


      /* *** ACCIDENT INFO */
      this.claimFormGroup.get("chkEmployment").setValue(this.objClaim.employment);
      this.claimFormGroup.get("chAutoAccident").setValue(this.objClaim.accident_auto);
      this.claimFormGroup.get("chkOtherAccident").setValue(this.objClaim.accident_other);
      this.claimFormGroup.get("chkEmergencey").setValue(this.objClaim.accident_emergency);

      if (this.objClaim.accident_date != null && this.objClaim.accident_date != "01/01/1900") {
        let dateModel = this.dateTimeUtil.getDateModelFromDateString(this.objClaim.accident_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        this.claimFormGroup.get("dpAccidentDate").setValue(dateModel);
      }

      this.claimFormGroup.get("ddStates").setValue(this.objClaim.accident_state);
      /* *** END ACCIDENT INFO */


      /**   OTHER INFO */
      this.claimFormGroup.get("txtClaimNo").setValue(this.objClaim.claim_number);
      this.claimFormGroup.get("txtLUO").setValue(this.objClaim.luo);
      this.claimFormGroup.get("txtPaperPayerID").setValue(this.objClaim.paper_payer_id);
      this.claimFormGroup.get("txtHCFA_17_A").setValue(this.objClaim.hcfa_17_a);

      if (this.objClaim.lmp_date != null && this.objClaim.lmp_date != "01/01/1900") {
        let dateModel = this.dateTimeUtil.getDateModelFromDateString(this.objClaim.lmp_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        this.claimFormGroup.get("dpLMP").setValue(dateModel);
      }

      if (this.objClaim.xraydate != null && this.objClaim.xraydate != "01/01/1900") {
        let dateModel = this.dateTimeUtil.getDateModelFromDateString(this.objClaim.xraydate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        this.claimFormGroup.get("dpLastXRay").setValue(dateModel);
      }
      this.claimFormGroup.get("txtPriorAuthNo").setValue(this.objClaim.pa_number);
      this.claimFormGroup.get("txtResubmissionCode").setValue(this.objClaim.medical_resubmision_code);

      if (this.objClaim.start_care_date != null && this.objClaim.start_care_date != "01/01/1900") {
        let dateModel = this.dateTimeUtil.getDateModelFromDateString(this.objClaim.start_care_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        this.claimFormGroup.get("dpStartCareDate").setValue(dateModel);
      }

      if (this.objClaim.hospital_from_date != null && this.objClaim.hospital_from_date != "01/01/1900") {
        let dateModel = this.dateTimeUtil.getDateModelFromDateString(this.objClaim.hospital_from_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        this.claimFormGroup.get("dpHospitalFrom").setValue(dateModel);
      }

      if (this.objClaim.hospital_to_date != null && this.objClaim.hospital_to_date != "01/01/1900") {
        let dateModel = this.dateTimeUtil.getDateModelFromDateString(this.objClaim.hospital_to_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        this.claimFormGroup.get("dpHospitalTo").setValue(dateModel);
      }

      this.claimFormGroup.get("txtNotes").setValue(this.objClaim.notes);

      this.claimFormGroup.get("chkLabClaim").setValue(this.objClaim.lab_claim);
      if (this.objClaim.outside_lab) {
        this.claimFormGroup.get("chkOutsideLab").setValue(this.objClaim.outside_lab);
        this.claimFormGroup.get("txtOutsideLabCharges").setValue(this.decimalPipe.transform(this.objClaim.outside_lab_charges, ".2-2", ""));
      }

      this.claimFormGroup.get("chkEPSDT").setValue(this.objClaim.epsdt);
      this.claimFormGroup.get("chkAA").setValue(this.objClaim.aa);
      this.claimFormGroup.get("chkIsCorrected").setValue(this.objClaim.is_corrected);
      this.claimFormGroup.get("chkEAP").setValue(this.objClaim.eap);



      /** END   OTHER INFO */

      /**   SUBMISSION INFO */

      if (this.objClaim.is_hcfa) {
        this.claimFormGroup.get("rbSubmissionOption").setValue("hcfa");
        this.claimFormGroup.get("ddHCFAInsurance").setValue(this.objClaim.hcfa_ins_type);
      }
      else {
        this.claimFormGroup.get("rbSubmissionOption").setValue("electronic");
      }

      this.claimFormGroup.get("chkDoNotBill").setValue(this.objClaim.not_bill);
      this.claimFormGroup.get("chkFolowUp").setValue(this.objClaim.followup);

      /**  END SUBMISSION INFO */
      this.createProcedureControls();
      this.calculateClaimTotal();

      if (this.objClaim.isDraft && !this.objClaim.self_pay && (this.lstClaimInsurance == undefined || this.lstClaimInsurance == null || this.lstClaimInsurance.length == 0)
      ) {
        this.getPatientInsurance();
      }
      else {

        this.createInsuranceControls();
        this.isLoading = false;
      }

    }


    this.GetBillingProviderTaxonomyList();

    if (!this.lookupList.UserRights.claim_edit || this.openedClaimInfo.deleted) {
      this.claimFormGroup.disable();
    }
  }

  createProcedureControls() {

    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {
      this.lstClaimProcedures.forEach(proc => {
        this.addProcedureControlToFormGroup(proc);
      });
    }
  }

  addProcedureControlToFormGroup(proc: any) {


    this.claimFormGroup.addControl("dpDOSFrom_" + proc.claim_procedures_id, this.formBuilder.control(this.dateTimeUtil.getDateModelFromDateString(proc.dos_from, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), Validators.compose([Validators.required])));
    this.claimFormGroup.addControl("dpDOSTo_" + proc.claim_procedures_id, this.formBuilder.control(this.dateTimeUtil.getDateModelFromDateString(proc.dos_to, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), Validators.compose([Validators.required])));

    this.claimFormGroup.addControl("ddPOS_" + proc.claim_procedures_id, this.formBuilder.control(proc.pos, Validators.compose([Validators.required])));
    this.claimFormGroup.addControl("txtCharges_" + proc.claim_procedures_id, this.formBuilder.control(this.decimalPipe.transform(proc.charges, ".2-2", ""), Validators.compose([Validators.pattern(RegExEnum.Currency)])));
    this.claimFormGroup.addControl("txtUnits_" + proc.claim_procedures_id, this.formBuilder.control(proc.units, Validators.compose([Validators.required, Validators.min(1), Validators.pattern(RegExEnum.PositiveWholeNumber)])));

    this.claimFormGroup.addControl("ddMode1_" + proc.claim_procedures_id, this.formBuilder.control(proc.mod1 != undefined ? proc.mod1.toUpperCase() : ''));
    this.claimFormGroup.addControl("ddMode2_" + proc.claim_procedures_id, this.formBuilder.control(proc.mod2 != undefined ? proc.mod2.toUpperCase() : ''));
    this.claimFormGroup.addControl("ddMode3_" + proc.claim_procedures_id, this.formBuilder.control(proc.mod3 != undefined ? proc.mod3.toUpperCase() : ''));
    this.claimFormGroup.addControl("ddMode4_" + proc.claim_procedures_id, this.formBuilder.control(proc.mod4 != undefined ? proc.mod4.toUpperCase() : ''));

    this.claimFormGroup.addControl("txtNDCCode_" + proc.claim_procedures_id, this.formBuilder.control(proc.ndc_code, Validators.compose([Validators.pattern(RegExEnum.NDC)])));
    this.claimFormGroup.addControl("ddNDCMeasure_" + proc.claim_procedures_id, this.formBuilder.control(proc.ndc_measure));

    debugger;
    // this.claimFormGroup.addControl("txtNDCQuantity_" + proc.claim_procedures_id, this.formBuilder.control(proc.ndc_qty,Validators.compose([Validators.min(1), Validators.pattern(RegExEnum.PositiveWholeNumber)])));
    this.claimFormGroup.addControl("txtNDCQuantity_" + proc.claim_procedures_id,
      this.formBuilder.control(proc.ndc_qty,
        Validators.compose([
          Validators.maxLength(10),
          Validators.pattern(RegExEnum.EitherWholeNumberOrDecimalWithTwoPoints)])));

    this.claimFormGroup.addControl("txtNDCPrice_" + proc.claim_procedures_id, this.formBuilder.control(this.decimalPipe.transform(proc.ndc_price, ".2-2", ""), Validators.compose([Validators.pattern(RegExEnum.Currency)])));


    this.claimFormGroup.addControl("txtDxPointer1_" + proc.claim_procedures_id, this.formBuilder.control(proc.dx_pointer1, Validators.compose([Validators.min(1), Validators.pattern(RegExEnum.PositiveWholeNumber)])));
    this.claimFormGroup.addControl("txtDxPointer2_" + proc.claim_procedures_id, this.formBuilder.control(proc.dx_pointer2, Validators.compose([Validators.min(1), Validators.pattern(RegExEnum.PositiveWholeNumber)])));
    this.claimFormGroup.addControl("txtDxPointer3_" + proc.claim_procedures_id, this.formBuilder.control(proc.dx_pointer3, Validators.compose([Validators.min(1), Validators.pattern(RegExEnum.PositiveWholeNumber)])));
    this.claimFormGroup.addControl("txtDxPointer4_" + proc.claim_procedures_id, this.formBuilder.control(proc.dx_pointer4, Validators.compose([Validators.min(1), Validators.pattern(RegExEnum.PositiveWholeNumber)])));

    this.claimFormGroup.addControl("chkIsProcResubmit_" + proc.claim_procedures_id, this.formBuilder.control(proc.is_resubmitted));
    this.claimFormGroup.addControl("txtProNotes_" + proc.claim_procedures_id, this.formBuilder.control(proc.notes));
  }

  removeAllProcedureControlFromFormGroup() {
    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {
      this.lstClaimProcedures.forEach(proc => {
        this.removeProcedureControlFromFormGroup(proc.claim_procedures_id);
      });
    }

  }
  removeProcedureControlFromFormGroup(claim_procedures_id: number) {

    this.claimFormGroup.removeControl("dpDOSFrom_" + claim_procedures_id);
    this.claimFormGroup.removeControl("dpDOSTo_" + claim_procedures_id);

    this.claimFormGroup.removeControl("ddPOS_" + claim_procedures_id);

    this.claimFormGroup.removeControl("txtCharges_" + claim_procedures_id);
    this.claimFormGroup.removeControl("txtUnits_" + claim_procedures_id);

    this.claimFormGroup.removeControl("ddMode1_" + claim_procedures_id);
    this.claimFormGroup.removeControl("ddMode2_" + claim_procedures_id);
    this.claimFormGroup.removeControl("ddMode3_" + claim_procedures_id);
    this.claimFormGroup.removeControl("ddMode4_" + claim_procedures_id);

    this.claimFormGroup.removeControl("txtNDCCode_" + claim_procedures_id);
    this.claimFormGroup.removeControl("ddNDCMeasure_" + claim_procedures_id);
    this.claimFormGroup.removeControl("txtNDCQuantity_" + claim_procedures_id);
    this.claimFormGroup.removeControl("txtNDCPrice_" + claim_procedures_id);


    this.claimFormGroup.removeControl("txtDxPointer1_" + claim_procedures_id);
    this.claimFormGroup.removeControl("txtDxPointer2_" + claim_procedures_id);
    this.claimFormGroup.removeControl("txtDxPointer3_" + claim_procedures_id);
    this.claimFormGroup.removeControl("txtDxPointer4_" + claim_procedures_id);

    this.claimFormGroup.removeControl("chkIsProcResubmit_" + claim_procedures_id);
    this.claimFormGroup.removeControl("txtProNotes_" + claim_procedures_id);
  }

  getBillingProviderList() {
    this.generalService.getBillingProviderList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lookupList.billingProviderList = data as Array<any>;
        this.preDataPopulateCount--;
        this.loadClaimData();

      },
      error => {
        this.preDataPopulateCount--;
        this.isLoading = false;
        this.getBillingProviderListError(error);
      }
    );
  }

  getBillingProviderListError(error) {
    this.logMessage.log("getBillingProviderList Error." + error);
  }

  getFacilityList() {
    this.claimService.getFacilityList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        debugger;
        this.lookupList.facilityList = data as Array<any>;
        this.preDataPopulateCount--;
        this.loadClaimData();

      },
      error => {
        this.preDataPopulateCount--;
        this.isLoading = false;
        this.getFacilityListError(error);
      }
    );
  }

  getFacilityListError(error: any) {
    this.logMessage.log("getFacilityList Error." + error);
  }


  getPracticePOSList() {
    this.claimService.getPracticePOSList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lookupList.practicePOSList = data as Array<any>;
        this.preDataPopulateCount--;
        this.loadClaimData();

      },
      error => {
        this.preDataPopulateCount--;
        this.isLoading = false;
        this.getPOSListError(error);
      }
    );
  }

  getPOSListError(error: any) {
    this.logMessage.log("getPOSList Error." + error);
  }

  getModifierList() {
    this.claimService.getModifierList().subscribe(
      data => {

        this.lookupList.modifierList = data as Array<any>;
        this.preDataPopulateCount--;
        this.loadClaimData();

      },
      error => {
        this.preDataPopulateCount--;
        this.isLoading = false;
        this.getModifierListError(error);
      }
    );
  }

  getModifierListError(error: any) {
    this.logMessage.log("getModifierList Error." + error);
  }

  getClaimRulePatientInfo() {
    debugger;
    this.claimService.getClaimRulePatientInfo(this.patientId).subscribe(
      data => {
        debugger;
        this.patientClaimRuleInfo = data;
        this.preDataPopulateCount--;
        this.loadClaimData();

      },
      error => {
        this.preDataPopulateCount--;
        this.isLoading = false;
        this.getClaimRulePatientInfoError(error);
      }
    );
  }

  getClaimRulePatientInfoError(error: any) {
    this.logMessage.log("getClaimRulePatientInfo Error." + error);
  }
  getPatientSelfPay() {
    debugger;
    this.claimService.getPatientSelfPay(this.patientId).subscribe(
      data => {
        debugger;
        this.lstSelfPayPatient = data;
        this.preDataPopulateCount--;
        this.loadClaimData();
      },
      error => {
        this.preDataPopulateCount--;
        this.isLoading = false;
      }
    );
  }
  getStatesList() {
    this.generalService.getStatesList().subscribe(
      data => {

        this.lookupList.statesList = data as Array<any>;
        this.preDataPopulateCount--;
        this.loadClaimData();

      },
      error => {
        this.preDataPopulateCount--;
        this.isLoading = false;
        this.getStatesListError(error);
      }
    );
  }

  getStatesListError(error: any) {
    this.logMessage.log("getStatesList Error." + error);
  }

  getClaim() {
    this.claimService.getClaim(this.claimId).subscribe(
      data => {

        this.objClaim = data;
        this.dataPopulateCount--;
        this.assignValues();
      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getClaimError(error);
      }
    );
  }

  getClaimError(error: any) {
    this.logMessage.log("getClaim Error." + error);
  }


  getProClaimDiagnosis() {
    this.claimService.getProClaimDiagnosis(this.claimId, this.openedClaimInfo.deleted).subscribe(
      data => {

        this.lstClaimDiagnosis = data as Array<any>;

        this.claimDiagCount = this.lstClaimDiagnosis.length;
        if (this.lstClaimDiagnosis != undefined && this.lstClaimDiagnosis.length > 0) {
          this.selectedICDCode = this.lstClaimDiagnosis[0];
        }
        this.arrangeDiagnosis();
        this.dataPopulateCount--;
        this.assignValues();

      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getProClaimDiagnosisError(error);
      }
    );
  }

  arrangeDiagnosis() {

    this.showICDCol2 = false;
    let maxCountCol: number = 5;

    debugger;
    if (this.lstClaimDiagnosis != undefined && this.lstClaimDiagnosis.length > 0) {

      let col1Count: number = Math.ceil(this.lstClaimDiagnosis.length / 2);
      //alert("Col1 Count:" + col1Count);


      if (col1Count > 5) {
        maxCountCol = col1Count;
      }

      let count: number = 0;

      this.lstClaimDiagnosis.forEach(diag => {
        count++;
        if (count <= maxCountCol) {
          diag.column = 1;
        }
        else {
          diag.column = 2;
        }


      });

      if (count > maxCountCol) {
        this.showICDCol2 = true;
      }

    }
    debugger;
  }

  getProClaimDiagnosisError(error: any) {
    this.logMessage.log("getProClaimDiagnosis Error." + error);
  }

  getProClaimProcedures() {
    this.claimService.getProClaimProcedures(this.claimId, this.openedClaimInfo.deleted).subscribe(
      data => {

        this.lstClaimProcedures = data as Array<any>;
        this.dataPopulateCount--;
        this.assignValues();



      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getProClaimProceduresError(error);
      }
    );
  }

  getProClaimProceduresError(error: any) {
    this.logMessage.log("getProClaimProcedures Error." + error);
  }

  getClaimInsurance() {
    this.claimService.getClaimInsurance(this.claimId, this.openedClaimInfo.deleted).subscribe(
      data => {

        this.lstClaimInsurance = data as Array<any>;
        if (this.lstClaimInsurance != undefined && this.lstClaimInsurance != null && this.lstClaimInsurance.length > 0) {
          this.isInsuranceExists = true;
        }
        else {
          this.isInsuranceExists = false;
        }
        this.dataPopulateCount--;
        this.assignValues();
      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getClaimInsuranceError(error);
      }
    );
  }

  getClaimInsuranceError(error: any) {
    this.logMessage.log("getClaimInsurance Error." + error);
  }



  getPatientInsurance() {
    this.patientService.getPatientInsurance(this.patientId, 'active').subscribe(
      data => {

        debugger;
        let lstPatientInsurance = data as Array<any>;
        if (lstPatientInsurance != undefined && lstPatientInsurance != null && lstPatientInsurance.length > 0) {


          this.isInsuranceExists = true;
          if (this.lstClaimInsurance == undefined) {
            this.lstClaimInsurance = new Array<any>();


            lstPatientInsurance.forEach(element => {

              if (!this.checkIfInsuranceExist(element.insurace_type)) {

                debugger;
                this.tempClaimInsuranceId--;
                //let id: Number = -1;
                //if (this.lstClaimInsurance.length > 0) {
                //let id: number = this.tempClaimInsuranceId--;
                //id = (this.lstClaimInsurance.length + 1) * -1;
                //}

                if (this.lstInsuranceWCCities == undefined)
                  this.lstInsuranceWCCities = new Array();

                this.lstInsuranceWCCities.push({ id: this.tempClaimInsuranceId, zip_code: element.workercomp_zip, zip_changed: false, zip_loading: false, lstCities: [{ zip_code: element.workercomp_zip, city: element.workercomp_city, state: element.state }] });

                this.lstClaimInsurance.push(
                  {
                    claiminsurance_id: this.tempClaimInsuranceId,
                    insurace_type: element.insurace_type,
                    insurance_id: element.insurance_id,

                    name: element.name,
                    address: element.address,
                    phone: element.phone,
                    guarantor_id: element.guarantor_id,
                    guarantor_name: element.guarantor_name,
                    guarantor_relationship: ((element.guarantor_relationship == '' || element.guarantor_relationship == null) ? 'SELF' : element.guarantor_relationship),
                    policy_number: element.policy_number,
                    group_number: element.group_number,
                    copay: element.copay,
                    start_date: element.start_date,
                    end_date: element.end_date,

                    workercomp_name: element.workercomp_name,
                    workercomp_address: element.workercomp_address,
                    workercomp_city: element.workercomp_city,
                    workercomp_state: element.workercomp_state,
                    workercomp_zip: element.workercomp_zip,
                    elig_date: element.elig_date,
                    elig_status: element.elig_status,
                    elig_response: element.elig_response,
                    add_edit_flag: true

                  }
                );
              }
            });
          }

        }
        else {
          this.isInsuranceExists = false;
        }

        this.createInsuranceControls();
        this.isLoading = false;


      },
      error => {
        // this.dataPopulateCount--;
        this.isLoading = false;
        this.getPatientInsuranceError(error);
      }
    );
  }

  getPatientInsuranceError(error: any) {
    this.logMessage.log("getPatientInsurance Error." + error);
  }

  /* ************  INSURANCE ******* */
  createInsuranceControls() {

    if (this.lstClaimInsurance != undefined) {
      this.lstClaimInsurance.forEach(ins => {
        this.addInsuranceControlsToFormGroup(ins);
      });
    }
  }
  addInsuranceControlsToFormGroup(ins: any) {

    debugger;
    let insID = ins.claiminsurance_id;

    if (this.lstInsuranceWCCities == undefined)
      this.lstInsuranceWCCities = new Array();

    this.lstInsuranceWCCities.push({ id: insID, zip_code: ins.workercomp_zip, zip_changed: false, zip_loading: false, lstCities: [{ zip_code: ins.workercomp_zip, city: ins.workercomp_city, state: ins.state }] });

    //let startDateModel = this.dateTimeUtil.getDateModelFromDateString(ins.start_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    //let endDateModel = this.dateTimeUtil.getDateModelFromDateString(ins.end_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);


    let startDateModel = this.dateTimeUtil.getDateModelFromDateString(ins.start_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    let endDateModel = this.dateTimeUtil.getDateModelFromDateString(ins.end_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

    //this.patInfoFormGroup.addControl("txtInsuranceID_" + ins.patientinsurance_id, new FormControl(ins.insurance_id, Validators.required));
    this.claimFormGroup.addControl("txtInsuranceName_" + insID, this.formBuilder.control(ins.name));
    this.claimFormGroup.addControl("txtInsuranceSubscriber_" + insID, this.formBuilder.control(ins.guarantor_name));
    this.claimFormGroup.addControl("ddInsuranceSubscriberRel_" + insID, this.formBuilder.control(ins.guarantor_relationship));

    this.claimFormGroup.addControl("txtPolicyNo_" + insID, this.formBuilder.control(ins.policy_number));
    this.claimFormGroup.addControl("txtGroupNo_" + insID, this.formBuilder.control(ins.group_number));

    //this.claimFormGroup.addControl("dpInsStartDate_" + insID, this.formBuilder.control(startDateModel));
    //this.claimFormGroup.addControl("dpInsEndDate_" + insID, this.formBuilder.control(endDateModel));

    this.claimFormGroup.addControl("dpInsStartDate_" + insID,
      this.formBuilder.control(startDateModel, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ]))
    );

    this.claimFormGroup.addControl("dpInsEndDate_" + insID,
      this.formBuilder.control(endDateModel, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ]))
    );




    this.claimFormGroup.addControl("txtInsCopy_" + insID, this.formBuilder.control(this.decimalPipe.transform(ins.copay, ".2-2", "")));
    this.claimFormGroup.addControl("txtInsPCP_" + insID, this.formBuilder.control(ins.pcp));

    this.claimFormGroup.addControl("txtInsOrigClaimNo_" + insID, this.formBuilder.control(ins.claim_no));
    this.claimFormGroup.addControl("txtInsAuthorizationNo_" + insID, this.formBuilder.control(ins.auth_no));
    this.claimFormGroup.addControl("ddInsAuthorizationType_" + insID, this.formBuilder.control(ins.auth_no_type));

    this.claimFormGroup.addControl("txtWorkerCompName_" + insID, this.formBuilder.control(ins.workercomp_name));
    this.claimFormGroup.addControl("txtWorkerCompAddress_" + insID, this.formBuilder.control(ins.workercomp_address));
    this.claimFormGroup.addControl("txtWCZipCode_" + insID, this.formBuilder.control(ins.workercomp_zip));
    this.claimFormGroup.addControl("ddWorkerCompCity_" + insID, this.formBuilder.control(ins.workercomp_city));

  }

  removeAllInsuranceControlsFromFormGroup() {

    if (this.lstClaimInsurance != undefined) {
      this.lstClaimInsurance.forEach(ins => {
        this.removeInsuranceControlsById(ins.claiminsurance_id);
      });
    }
  }
  removeInsuranceControlsById(insID: number) {

    this.claimFormGroup.removeControl("txtInsuranceName_" + insID);
    this.claimFormGroup.removeControl("txtInsuranceSubscriber_" + insID);
    this.claimFormGroup.removeControl("ddInsuranceSubscriberRel_" + insID);
    this.claimFormGroup.removeControl("txtPolicyNo_" + insID);
    this.claimFormGroup.removeControl("txtGroupNo_" + insID);
    this.claimFormGroup.removeControl("dpInsStartDate_" + insID);
    this.claimFormGroup.removeControl("dpInsEndDate_" + insID);
    this.claimFormGroup.removeControl("txtInsCopy_" + insID);
    this.claimFormGroup.removeControl("txtInsPCP_" + insID);
    this.claimFormGroup.removeControl("txtInsOrigClaimNo_" + insID);
    this.claimFormGroup.removeControl("txtInsAuthorizationNo_" + insID);
    this.claimFormGroup.removeControl("ddInsAuthorizationType_" + insID);


    this.claimFormGroup.removeControl("txtWorkerCompName_" + insID);
    this.claimFormGroup.removeControl("txtWorkerCompAddress_" + insID);
    this.claimFormGroup.removeControl("txtWCZipCode_" + insID);
    this.claimFormGroup.removeControl("ddWorkerCompCity_" + insID);

    if (this.lstInsuranceWCCities != undefined) {

      for (let i: number = this.lstInsuranceWCCities.length - 1; i >= 0; i--) {

        let element = this.lstInsuranceWCCities[i];
        if (element.claiminsurance_id == insID) {
          this.lstInsuranceWCCities.splice(i, 1);
        }
      }
    }
  }

  getWorkerCompCities(id: number): Array<any> {

    let lst: Array<any> = new Array()

    if (this.lstInsuranceWCCities != undefined) {
      this.lstInsuranceWCCities.forEach(cityObj => {
        if (cityObj.id == id) {
          lst = cityObj.lstCities.map(x => Object.assign({}, x));
        }
      });
    }
    return lst;
  }

  checkIfAllInsuranceExist() {


    let priExist: boolean = false;
    let secExist: boolean = false;
    let othExist: boolean = false;

    if (this.lstClaimInsurance == null || this.lstClaimInsurance == undefined) {
      this.lstClaimInsurance = new Array();
    }

    this.lstClaimInsurance.forEach(ins => {

      if (ins.insurace_type.toLowerCase() == "primary") {
        priExist = true;
      }
      else if (ins.insurace_type.toLowerCase() == "secondary") {
        secExist = true;
      }
      else if (ins.insurace_type.toLowerCase() == "other") {
        othExist = true;
      }

    });

    return priExist && secExist && othExist;
  }

  checkIfInsuranceExist(type: string) {

    let isExist: boolean = false;

    if (this.lstClaimInsurance == null || this.lstClaimInsurance == undefined) {
      this.lstClaimInsurance = new Array();
    }

    this.lstClaimInsurance.forEach(ins => {

      if (ins.insurace_type.toLowerCase() == type.toLowerCase()) {
        isExist = true;
      }

    });

    return isExist;
  }

  //claiminsuranceIdTemp:number=-1;  
  OnAddNewInsurance(type: string) {

    if (this.checkIfInsuranceExist(type)) {
      alert(type + " insurance already exist in the list.");
    }
    else {

      /*
      let id: Number = -1;
      if (this.lstClaimInsurance.length > 0) {
        id = (this.lstClaimInsurance.length + 1) * -1;
      }
      */
      this.tempClaimInsuranceId--;

      if (this.lstInsuranceWCCities == undefined)
        this.lstInsuranceWCCities = new Array();

      this.lstInsuranceWCCities.push({ id: this.tempClaimInsuranceId, zip_code: undefined, zip_changed: false, zip_loading: false, lstCities: [] });


      if (type == "Primary") {
        this.lstClaimInsurance.push({ claiminsurance_id: this.tempClaimInsuranceId, insurace_type: 'Primary' });
      }
      else if (type == "Secondary") {
        this.lstClaimInsurance.push({ claiminsurance_id: this.tempClaimInsuranceId, insurace_type: 'Secondary' });
      }
      else if (type == "Other") {
        this.lstClaimInsurance.push({ claiminsurance_id: this.tempClaimInsuranceId, insurace_type: 'Other' });
      }

      this.addInsuranceControlsToFormGroup(this.lstClaimInsurance[(this.lstClaimInsurance.length - 1)]);
      this.isInsuranceExists = true;

    }

  }

  onInsuranceSearchInput(event: any, id: number) {
    this.setInsuranceVisiblity(id, "false");
  }


  onInsuranceSearchEnter(event: KeyboardEvent, id: number) {

    debugger;
    //if (event.key === "Enter") {
    this.setInsuranceVisiblity(id, "true");
    // }
    //else if (event.key == 'ArrowDown') {
    //  this.shiftFocusToInsSearch(id);
    //}
    //else {
    //  this.setInsuranceVisiblity(id, "false");
    //}
  }

  setInsuranceVisiblity(id: number, option: string) {

    let found: boolean = false;
    this.lstShowInsuranceSearch.forEach(element => {
      if (element.key == id.toString() && !found) {
        element.value = option;
        found = true;
      }
    });

    if (!found) {
      this.lstShowInsuranceSearch.push(new ORMKeyValue(id.toString(), option));
    }
  }

  showInsuranceSearch(id: number) {

    let show: boolean = false;
    this.lstShowInsuranceSearch.forEach(element => {
      if (element.key == id.toString()) {
        show = element.value == "true" ? true : false;
      }
    });

    return show

  }

  addInsurance(obj: any) {

    let recordId = obj.record_id;
    let insObject = obj.insurance;


    this.logMessage.log(recordId);
    this.logMessage.log(insObject);

    this.lstClaimInsurance.forEach(ins => {
      if (ins.claiminsurance_id == recordId) {
        ins.name = insObject.insurance_name;
        ins.insurance_id = insObject.insurance_id;
        ins.address = insObject.address + " (" + insObject.city + ", " + insObject.state + " " + insObject.zip + ")";
        ins.phone = insObject.phone;
        ins.add_edit_flag = true;
        (this.claimFormGroup.get("txtInsuranceName_" + recordId) as FormControl).setValue(insObject.insurance_name);

      }
    });

    this.setInsuranceVisiblity(recordId, "false");
  }


  closeInsuranceSearch(recordId) {
    this.setInsuranceVisiblity(recordId, "false");

  }
  onInsuranceSearchFocusOut(id: number) {

    if (!this.showInsuranceSearch(id)) {
      if ((this.claimFormGroup.get("txtInsuranceName_" + id) as FormControl).value == "" || (this.claimFormGroup.get("txtInsuranceName_" + id) as FormControl).value == undefined) {

        (this.claimFormGroup.get("txtInsuranceName_" + id) as FormControl).setValue(null);
        ///(this.patInfoFormGroup.get("txtInsuranceID_" + id) as FormControl).setValue(null);
        if (this.lstClaimInsurance != undefined && this.lstClaimInsurance.length > 0) {
          this.lstClaimInsurance.forEach(ins => {
            if (ins.claiminsurance_id == id) {
              ins.name = undefined;
              ins.insurance_id = undefined;
              ins.address = undefined;
              ins.phone = undefined;
            }
          });
        }
      }
      else {

        this.lstClaimInsurance.forEach(element => {

          if (element.claiminsurance_id == id) {
            (this.claimFormGroup.get("txtInsuranceName_" + id) as FormControl).setValue(element.name);
          }

        });
      }
    }

  }

  showInsuranceSubscriberSearch(id) {
    let show: boolean = false;
    this.lstShowInsuranceSubscriberSearch.forEach(element => {
      if (element.key == id) {
        show = element.value == "true" ? true : false;
      }
    });

    return show
  }

  addInsuranceSubscriber(obj: any) {

    let recordId = obj.record_id;
    let subsriberObject = obj.gurantor;


    this.logMessage.log(recordId);
    this.logMessage.log(subsriberObject);

    this.lstClaimInsurance.forEach(ins => {
      if (ins.claiminsurance_id == recordId) {
        ins.guarantor_name = subsriberObject.name;
        ins.guarantor_id = subsriberObject.id;
        ins.add_edit_flag = true;
        (this.claimFormGroup.get("txtInsuranceSubscriber_" + recordId) as FormControl).setValue(subsriberObject.name);
      }
    });

    this.setInsuranceSubscriberVisiblity(recordId, "false");
  }

  closeInsuranceSubscriberSearch(recordId: number) {
    this.setInsuranceSubscriberVisiblity(recordId, "false");

  }

  setInsuranceSubscriberVisiblity(id, option) {

    let found: boolean = false;
    this.lstShowInsuranceSubscriberSearch.forEach(element => {
      if (element.key == id && !found) {
        element.value = option;
        found = true;
      }
    });

    if (!found) {
      this.lstShowInsuranceSubscriberSearch.push(new ORMKeyValue(id, option));
    }
  }

  onInsuranceSubscriberSearchKeydown(event: any, id: number) {

    if (event.key === "Enter") {
      this.setInsuranceSubscriberVisiblity(id, "true");
    }
    else {
      this.setInsuranceSubscriberVisiblity(id, "false");
    }
  }

  onInsuranceSubscriberFocusOut(id: number) {
    if ((this.claimFormGroup.get("txtInsuranceSubscriber_" + id) as FormControl).value == "" || (this.claimFormGroup.get("txtInsuranceSubscriber_" + id) as FormControl).value == undefined) {
      if (this.lstClaimInsurance != undefined && this.lstClaimInsurance.length > 0) {
        this.lstClaimInsurance.forEach(ins => {
          if (ins.claiminsurance_id == id) {
            ins.guarantor_name = undefined;
            ins.guarantor_id = undefined;
            (this.claimFormGroup.get("txtInsuranceSubscriber_" + id) as FormControl).setValue(null);

          }
        });
      }
    }
  }

  WCzipChanged(id: number) {
    this.lstInsuranceWCCities.forEach(element => {
      if (element.id == id) {
        element.zip_changed = true;
      }
    });
  }
  WCzipFocusOut(id: number, zipCode: string) {

    let zip_changed = false;
    let zip_loading = false;
    let zip_code = "";

    this.lstInsuranceWCCities.forEach(element => {
      if (element.id == id) {
        zip_changed = element.zip_changed;
        zip_loading = element.zip_loading;
        zip_code = element.zip_code;
      }
    });

    if (zip_loading || zip_changed || zip_code != zipCode) {

      if (zipCode.replace("-", "").length == 5 || zipCode.replace("-", "").length == 9) {

        this.lstInsuranceWCCities.forEach(element => {
          if (element.id == id) {
            element.zip_changed = false;
            element.zip_loading = false;
            element.zip_code = zipCode;
            element.lstCities = [];
          }
        });
        this.getWCCityStateByZipCode(id, zipCode);
      }
      else {
        this.lstInsuranceWCCities.forEach(element => {
          if (element.id == id) {
            element.lstCities = [];
          }
        });
      }
    }
  }

  getWCCityStateByZipCode(id: number, zipCode: string) {

    this.generalService.getCityStateByZipCode(zipCode).subscribe(
      data => {
        let lstCity = [];
        lstCity = data as Array<any>;
        this.lstInsuranceWCCities.forEach(element => {
          if (element.id == id) {
            element.zip_changed = false;
            element.zip_loading = false;
            element.zip_code = zipCode;
            element.lstCities = lstCity;
          }
        });

        this.lstClaimInsurance.forEach(element => {
          if (element.claiminsurance_id == id) {
            if (lstCity != undefined && lstCity.length > 0) {
              element.workercomp_state = lstCity[0].state;
            }
            else {
              element.workercomp_state = undefined;
            }
          }
        });

      },
      error => {
        this.getWCCityStateByZipCodeError(error);
      }
    );
  }

  getWCCityStateByZipCodeError(error) {
    this.logMessage.log("getWCCityStateByZipCode Error." + error);
  }

  onRemoveInsurance(id: number, name: string, ins) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected Insurance?<br>' + name;
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        for (let i: number = this.lstClaimInsurance.length - 1; i >= 0; i--) {

          let element = this.lstClaimInsurance[i];
          if (id != undefined) {
            if (element.claiminsurance_id == id) {
              this.lstClaimInsurance.splice(i, 1);
              if (id > 0) {

                if (this.lstDeletedInsurances == undefined) {
                  this.lstDeletedInsurances = new Array<number>();
                }

                this.lstDeletedInsurances.push(id);
              }
            }
          }
        }

        this.removeInsuranceControlsById(id);

        if (this.lstClaimInsurance == undefined || this.lstClaimInsurance.length == 0) {
          this.isInsuranceExists = false;
        }
        if (ins != null) {
          this.isInsuranceExists = true;
          this.addImportInsurance(ins);
        }
      }
    }, (reason) => {
      //alert(reason);
    });
  }


  addNewInsurance(operation: string, insType: string, data: any) {

    this.insOperation = operation;
    if (this.insOperation == "ADD") {

      let isExist: boolean = false;

      if (this.lstClaimInsurance == null || this.lstClaimInsurance == undefined) {
        this.lstClaimInsurance = new Array();
      }

      this.lstClaimInsurance.forEach(ins => {

        if (ins.insurace_type == insType) {
          isExist = true;
        }

      });



      if (isExist) {
        alert(insType + " insurance already exist in the list.");
        return;
      }
    }


    const modalRef = this.ngbModal.open(PatientInsuranceAddEditPopupComponent, this.popUpOptions);

    modalRef.componentInstance.operationType = operation;
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.insType = insType;
    modalRef.componentInstance.data = data;

    //let id: Number = -1;
    if (operation == "EDIT") {
      //     id = data.claiminsurance_id;
      modalRef.componentInstance.Id = data.claiminsurance_id;
    }
    else {
      this.tempClaimInsuranceId--;
      modalRef.componentInstance.Id = this.tempClaimInsuranceId;
      /*
      if (this.lstClaimInsurance.length > 0) {
        id = this.tempClaimInsuranceId--;
        //id = (this.lstClaimInsurance.length + 1) * -1;
      }
      */
    }
    //modalRef.componentInstance.Id = id;
    //let closeResult;
    modalRef.result.then((result) => {
      if (result != undefined) {

        debugger;

        if (this.insOperation == "ADD") {

          let objInsurance = {
            claiminsurance_id: result.id,
            insurace_type: result.insurace_type,
            insurance_id: result.insurance_id,
            name: result.name,
            address: result.address,
            zip: result.zip,
            city: result.city,
            state: result.state,
            phone: result.phone,
            guarantor_id: result.guarantor_id,
            guarantor_name: result.guarantor_name,
            guarantor_relationship: result.guarantor_relationship,
            policy_number: result.policy_number,
            group_number: result.group_number,
            pcp: result.pcp,
            copay: result.copay,
            start_date: result.start_date,
            end_date: result.end_date,

            workercomp_name: result.workercomp_name,
            workercomp_address: result.workercomp_address,
            workercomp_zip: result.workercomp_zip,
            workercomp_city: result.workercomp_city,
            workercomp_state: result.workercomp_state,

            elig_date: '',
            elig_status: '',
            elig_response: '',

            add_edit_flag: true
          };


          if (this.lstInsuranceWCCities == undefined)
            this.lstInsuranceWCCities = new Array();

          this.lstInsuranceWCCities.push({ id: result.id, zip_code: objInsurance.workercomp_zip, zip_changed: false, zip_loading: false, lstCities: [{ zip_code: objInsurance.workercomp_zip, city: objInsurance.workercomp_city, state: objInsurance.state }] });

          /*
          let startDateModel = this.dateTimeUtil.getDateModelFromDateString(result.start_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
          let endDateModel = this.dateTimeUtil.getDateModelFromDateString(result.end_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);


          this.patInfoFormGroup.addControl("txtInsuranceName_" + id, this.formBuilder.control(result.name));
          this.patInfoFormGroup.addControl("txtInsuranceSubscriber_" + id, this.formBuilder.control(result.guarantor_name));
          this.patInfoFormGroup.addControl("ddInsuranceSubscriberRel_" + id, this.formBuilder.control(result.guarantor_relationship));

          this.patInfoFormGroup.addControl("txtPolicyNo_" + id, this.formBuilder.control(result.policy_number));
          this.patInfoFormGroup.addControl("txtGroupNo_" + id, this.formBuilder.control(result.group_number));
          this.patInfoFormGroup.addControl("dpInsStartDate_" + id, this.formBuilder.control(startDateModel));
          this.patInfoFormGroup.addControl("dpInsEndDate_" + id, this.formBuilder.control(endDateModel));

          this.patInfoFormGroup.addControl("txtInsCopy_" + id, this.formBuilder.control(result.copay));
          this.patInfoFormGroup.addControl("txtInsPCP_" + id, this.formBuilder.control(result.pcp));

          this.patInfoFormGroup.addControl("txtWorkerCompName_" + id, this.formBuilder.control(result.workercomp_name));
          this.patInfoFormGroup.addControl("txtWorkerCompAddress_" + id, this.formBuilder.control(result.workercomp_address));
          this.patInfoFormGroup.addControl("txtWCZipCode_" + id, this.formBuilder.control(result.workercomp_zip));
          this.patInfoFormGroup.addControl("ddWorkerCompCity_" + id, this.formBuilder.control(result.workercomp_city));
          */

          if (this.lstClaimInsurance == undefined)
            this.lstClaimInsurance = new Array();


          let index: number = GeneralOperation.getIndexForNewInsuranceEntry(this.lstClaimInsurance, objInsurance.insurace_type);
          this.lstClaimInsurance.splice(index, 0, objInsurance);
          //this.lstClaimInsurance.push(objInsurance);

          this.addInsuranceControlsToFormGroup(objInsurance);


          this.isInsuranceExists = true;

        }
        else if (this.insOperation == "EDIT") {

          this.lstClaimInsurance.forEach(element => {
            if (element.claiminsurance_id == result.claiminsurance_id) {
            }
          });

        }

      }
    }
      , (reason) => {

        //alert(reason);
      });

  }

  /*************************  */

  /******* Referring Physician Search ******* */

  onRefPhysicianFocusOut() {
    debugger;
    if (((this.claimFormGroup.get("txtRefPhyIDHidden") as FormControl).value == ""
      || (this.claimFormGroup.get("txtRefPhyIDHidden") as FormControl).value == undefined) && this.showRefPhySearch == false) {
      (this.claimFormGroup.get("txtRefPhy") as FormControl).setValue(null);
      (this.claimFormGroup.get("txtRefPhyIDHidden") as FormControl).setValue(null);
    }
  }

  onRefPhysicianSearcInputChange(event: any) {
    (this.claimFormGroup.get("txtRefPhyIDHidden") as FormControl).setValue(null);
    if (event.currentTarget.value.length >= 3) {
      this.showRefPhySearch = true;
    }
    else {
      this.showRefPhySearch = false;
    }
  }

  onRefPhysicianSearchKeydown(event: any) {
    if (event.key === "Enter") {
      this.showRefPhySearch = true;
    }
    else {
      this.showRefPhySearch = false;
    }
  }

  closeRefPhysicianSearch() {
    if ((this.claimFormGroup.get("txtRefPhyIDHidden") as FormControl).value == "" || (this.claimFormGroup.get("txtRefPhyIDHidden") as FormControl).value == undefined) {
      (this.claimFormGroup.get("txtRefPhy") as FormControl).setValue(null);
      (this.claimFormGroup.get("txtRefPhyIDHidden") as FormControl).setValue(null);
    }

    this.showRefPhySearch = false;
    this.txtRefPhy.nativeElement.focus();
  }

  addRefPhysician(refPhy: any) {
    debugger;
    (this.claimFormGroup.get("txtRefPhy") as FormControl).setValue(refPhy.first_name + ' ' + refPhy.last_name);
    (this.claimFormGroup.get("txtRefPhyIDHidden") as FormControl).setValue(refPhy.referral_id);
    this.showRefPhySearch = false;
    this.txtRefPhy.nativeElement.focus();
  }
  /******* END Referring Physician Search ******* */


  /******* Diagnosis Search ******* */
  onchkDiagnosisChanged() {
    if (this.showDiagSearch) {
      this.searchDiagnosis(this.txtDiagSearch.nativeElement.value);
    }
  }
  onDiagnosisSearhBlur(event: any) {
    if (this.showDiagSearch == false) {
      event.currentTarget.value = "";
    }
  }

  onDiaghnosisSearcInputChange(event: any) {
    this.logMessage.log("onProblemSearcInputChange");
    this.searchDiagnosis(event.currentTarget.value);
  }

  searchDiagnosis(searchVal: string) {


    if (searchVal.length >= 3) {
      this.diagSearchCriteria = new DiagSearchCriteria();
      this.diagSearchCriteria.codeType = DiagnosisCodeType.ICD_10;
      this.diagSearchCriteria.criteria = searchVal;
      this.diagSearchCriteria.dos = this.selectedDOSYYYYMMDD;// this.claimFormGroup.get("dpDOS").value;

      if (!this.chkDiagnosisSearchAll.nativeElement.checked) {
        this.diagSearchCriteria.providerId = (this.claimFormGroup.get("ddAttendingPhysician") as FormControl).value;
      }

      this.showDiagSearch = true;
    }
    else {
      this.showDiagSearch = false;
    }
  }


  closeDiagnosisSearch() {
    this.showDiagSearch = false;
    this.txtDiagSearch.nativeElement.value = "";
    this.txtDiagSearch.nativeElement.focus();
  }

  addDiagnosisToList(diag: any) {

    if (this.lstClaimDiagnosis == undefined)
      this.lstClaimDiagnosis = new Array();

    this.lstClaimDiagnosis.push({ diag_sequence: this.lstClaimDiagnosis.length + 1, diag_code: diag.diag_code, description: diag.diag_description, code_type: diag.code_type, add_edit_flag: true })

    this.arrangeDiagnosis();

    this.claimDiagCount = this.lstClaimDiagnosis.length;

    this.assignDxPointers(undefined);
  }

  assignDxPointers(claimProcId: number) {
    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {


      let dx1: number;
      let dx2: number;
      let dx3: number;
      let dx4: number;

      if (this.claimDiagCount != undefined || this.claimDiagCount > 0) {

        if (this.claimDiagCount == 1) {
          dx1 = 1;
        }
        if (this.claimDiagCount == 2) {
          dx1 = 1;
          dx2 = 2;

        }
        if (this.claimDiagCount == 3) {
          dx1 = 1;
          dx2 = 2;
          dx3 = 3;

        }
        if (this.claimDiagCount >= 4) {
          dx1 = 1;
          dx2 = 2;
          dx3 = 3;
          dx4 = 4;
        }
      }


      if (claimProcId != undefined) {
        this.claimFormGroup.get("txtDxPointer1_" + claimProcId).setValue(dx1);
        this.claimFormGroup.get("txtDxPointer2_" + claimProcId).setValue(dx2);
        this.claimFormGroup.get("txtDxPointer3_" + claimProcId).setValue(dx3);
        this.claimFormGroup.get("txtDxPointer4_" + claimProcId).setValue(dx4);
      }
      else {
        this.lstClaimProcedures.forEach(proc => {


          this.claimFormGroup.get("txtDxPointer1_" + proc.claim_procedures_id).setValue(dx1);
          this.claimFormGroup.get("txtDxPointer2_" + proc.claim_procedures_id).setValue(dx2);
          this.claimFormGroup.get("txtDxPointer3_" + proc.claim_procedures_id).setValue(dx3);
          this.claimFormGroup.get("txtDxPointer4_" + proc.claim_procedures_id).setValue(dx4);

        });
      }

    }

  }



  addDiagnosisFromSearch(diag: any) {

    if (this.checkIfDiagAlreadyExist(diag.diag_code)) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Procedure/Diagnosis Validation', "Diagnose " + diag.diag_code + " is already exisit.", AlertTypeEnum.WARNING)
    }
    else if (this.validateDiagRule(diag)) {

      if (this.lstClaimDiagnosis != undefined && this.lstClaimDiagnosis.length == 16) {

        GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Procedure/Diagnosis Validation', "Maximum 16 diagnosis are allowed.", AlertTypeEnum.WARNING)
      }
      else {
        if (this.lstClaimDiagnosis == undefined)
          this.lstClaimDiagnosis = new Array();

        this.addDiagnosisToList(diag);
        //this.lstClaimDiagnosis.push({ diag_sequence: this.lstClaimDiagnosis.length + 1, diag_code: diag.diag_code, description: diag.diag_description, code_type: diag.code_type, add_edit_flag: true });
        //this.arrangeDiagnosis();

        this.showDiagSearch = false;
        this.txtDiagSearch.nativeElement.value = "";
        this.txtDiagSearch.nativeElement.focus();
      }
    }
  }

  validateDiagRule(diagElement: any): boolean {

    let dosDate = this.dateTimeUtil.getDateTimeFromString(this.selectedDOSYYYYMMDD, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);

    let validattionMsg: string = this.claimRulesService.validateDiagnosisRules(dosDate, diagElement, this.patientClaimRuleInfo);
    if (validattionMsg != undefined) {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Diagnosis Age/Gender Validation', validattionMsg, AlertTypeEnum.WARNING);

      return false;
    }
    else {
      return true;
    }

  }

  getChartFollowUpDiagnosis() {
    // this.lstClaimDiagnosis = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.selectedDOSYYYYMMDD, option: "" }
    ];

    this.claimService.getChartFollowUpDiagnosis(searchCriteria).subscribe(
      data => {

        debugger;
        let lstFollowUpDiag = data as Array<any>;
        if (lstFollowUpDiag != undefined && lstFollowUpDiag.length > 0) {

          if (this.lstClaimDiagnosis == undefined || this.lstClaimDiagnosis == null) {
            this.lstClaimDiagnosis = new Array<any>();
          }
          else {

            lstFollowUpDiag.forEach(element => {

              if (!this.checkIfDiagAlreadyExist(element.code)) {

                //if (this.lstClaimDiagnosis == undefined)
                //  this.lstClaimDiagnosis = new Array();

                this.addDiagnosisToList({ diag_sequence: this.lstClaimDiagnosis.length + 1, diag_code: element.code, description: element.description, code_type: element.code_type, add_edit_flag: true });

                //this.addDiagnosisToList(element);

              }
            });

            this.arrangeDiagnosis();
          }
        }

        this.followUpCodesPopulateCount--;
        this.assignChartFollowUpCodes();

      },
      error => {
        // this.dataPopulateCount--;
        this.isLoading = false;
        this.getChartFollowUpDiagnosisError(error);
      }
    );
  }

  getChartFollowUpDiagnosisError(error: any) {
    this.logMessage.log("getChartFollowUpDiagnosis Error." + error);
  }

  /******* END Diagnosis Search  ******* */


  diagnosisSelectionChanged(icdCode: string) {

    debugger;
    this.selectedICDCode = icdCode;
    for (let i: number = 0; i < this.lstClaimDiagnosis.length; i++) {

      debugger;
      if (this.lstClaimDiagnosis[i].diag_code == icdCode) {
        this.selectedDiagnosisRow = i;
      }
    }
  }

  moveDiagnosis(option: string) {


    if (this.selectedDiagnosisRow != undefined && this.lstClaimDiagnosis != undefined && this.lstClaimDiagnosis.length > 0) {
      switch (option) {
        case "down":
          if ((this.selectedDiagnosisRow + 1) < this.lstClaimDiagnosis.length) {
            var source = this.lstClaimDiagnosis[this.selectedDiagnosisRow];
            var toBeSwaped = this.lstClaimDiagnosis[this.selectedDiagnosisRow + 1];

            source.diag_sequence = this.selectedDiagnosisRow + 2;
            source.add_edit_flag = true;
            toBeSwaped.diag_sequence = this.selectedDiagnosisRow + 1;
            toBeSwaped.add_edit_flag = true;

            this.lstClaimDiagnosis[this.selectedDiagnosisRow] = toBeSwaped;
            this.lstClaimDiagnosis[this.selectedDiagnosisRow + 1] = source

            this.selectedDiagnosisRow++;

            this.arrangeDiagnosis();
          }

          break;
        case "up":
          if ((this.selectedDiagnosisRow) > 0) {

            var source = this.lstClaimDiagnosis[this.selectedDiagnosisRow];
            var toBeSwaped = this.lstClaimDiagnosis[this.selectedDiagnosisRow - 1];

            source.diag_sequence = this.selectedDiagnosisRow;
            source.add_edit_flag = true;
            toBeSwaped.diag_sequence = this.selectedDiagnosisRow + 1;
            toBeSwaped.add_edit_flag = true;

            this.lstClaimDiagnosis[this.selectedDiagnosisRow] = toBeSwaped;
            this.lstClaimDiagnosis[this.selectedDiagnosisRow - 1] = source

            this.selectedDiagnosisRow--;

            this.arrangeDiagnosis();
          }
          break;

        default:
          break;
      }
    }

  }

  removeDiagnosis(diagCode: number) {


    if (this.lstClaimDiagnosis != undefined) {


      let rowIndex: number = this.generalOperation.getitemIndex(this.lstClaimDiagnosis, 'diag_code', diagCode)

      if (this.lstClaimDiagnosis[rowIndex].claim_diagnosis_id != undefined) {
        //if (this.strDeletedClaimDiagnosis != undefined && this.strDeletedClaimDiagnosis != "") {
        //          this.strDeletedClaimDiagnosis += ","
        //      }
        if (this.lstDeletedDiagnosis == undefined) {
          this.lstDeletedDiagnosis = new Array<number>();
        }
        this.lstDeletedDiagnosis.push(this.lstClaimDiagnosis[rowIndex].claim_diagnosis_id);
        //this.strDeletedClaimDiagnosis += "'" + this.lstClaimDiagnosis[rowIndex].claim_diagnosis_id + "'";
      }
      this.lstClaimDiagnosis.splice(rowIndex, 1);

      for (let i: number = rowIndex; i < this.lstClaimDiagnosis.length; i++) {
        this.lstClaimDiagnosis[i].diag_sequence = i + 1;
        this.lstClaimDiagnosis[i].add_edit_flag = true;
      }

      this.claimDiagCount = this.lstClaimDiagnosis.length;
      this.arrangeDiagnosis();
      this.assignDxPointers(undefined);

    }

  }


  /******* Procedure Search ******* */
  onchkProcedureChanged() {
    if (this.showProcSearch == true) {
      this.searchProcedure(this.txtProcSearch.nativeElement.value);
    }
  }
  onProcedureSearhBlur(event: any) {
    if (this.showProcSearch == false) {
      event.currentTarget.value = "";
    }
  }

  onProcedureSearchInputChange(event: any) {
    debugger;
    this.logMessage.log("onProcedureSearcInputChange");
    if (event.currentTarget.value.length == 5) {
      this.searchProcedure(event.currentTarget.value);
    }
  }
  onProcedureSearchEnter(event: any) {
    this.logMessage.log("onProcedureSearcInputChange");
    this.searchProcedure(event.currentTarget.value);
  }


  searchProcedure(searchVal: string) {


    if (searchVal.length >= 3) {

      debugger;

      this.procedureSearchCriteria = new ProcedureSearchCriteria();
      this.procedureSearchCriteria.criteria = searchVal;
      this.procedureSearchCriteria.dos = this.selectedDOSYYYYMMDD;//this.claimFormGroup.get("dpDOS").value;

      if (this.chkProcedureSearchAll.nativeElement.checked) {
        this.procedureSearchCriteria.searchType = ProcedureSearchType.ALL;
      }
      else {
        this.procedureSearchCriteria.searchType = ProcedureSearchType.SUPER_BILL;
      }
      this.showProcSearch = true;
    }
    else {
      this.showProcSearch = false;
    }
  }


  closeProcedureSearch() {
    this.showProcSearch = false;
    this.txtProcSearch.nativeElement.value = "";
    this.txtProcSearch.nativeElement.focus();
  }

  addProcedureFromSearch(proc: any) {

    //if (this.checkIfProcAlreadyExist(proc.code)) {
    //  GeneralOperation.showAlertPopUp(this.ngbModal, 'Diagnosis Age/Gender Validation', "Procedure " + proc.code + " is already exisit.", AlertTypeEnum.WARNING);
    // }
    //else {

    this.addProcedure(proc);
    //}

    this.showProcSearch = false;
    this.txtProcSearch.nativeElement.value = "";
    this.txtProcSearch.nativeElement.focus();

  }

  checkPOSMatched(pos: any) {
    let selectedPOS = undefined
    this.lookupList.practicePOSList.forEach(p => {
      if (p.pos == pos) {
        selectedPOS = p.pos;
      }
    });

    return selectedPOS;
  }

  addProcedure(proc: any) {

    debugger;

    if (this.lstClaimProcedures == undefined)
      this.lstClaimProcedures = new Array();



    let claimProcId: number = this.newProcedureTempId--;

    this.lstClaimProcedures.push({

      claim_procedures_id: claimProcId,
      proc_sequence: this.lstClaimProcedures.length + 1,
      proc_code: proc.code,
      description: proc.description,
      charges: proc.charges,
      units: 1,
      total_charges: proc.charges,
      dos_from: this.selectedDOSYYYYMMDD,
      dos_to: this.selectedDOSYYYYMMDD,
      mod1: proc.modifier,
      //mod2: "",
      //mod3: "",
      //mod4: "",
      //dx_pointer1: "",
      //dx_pointer2: "",
      //dx_pointer3: "",
      //dx_pointer4: "",
      ndc_code: proc.ndc_code,
      //ndc_price: "",
      //ndc_qty: "",
      //ndc_measure: "",
      pos: (this.checkPOSMatched(proc.pos) == undefined ? this.selectedFacilityPOSCode : proc.pos),
      //is_resubmitted: "",
      //is_procedure_paid: "",
      //notes: "",
      add_edit_flag: true
    });
    this.calculateClaimTotal();
    this.addProcedureControlToFormGroup(this.lstClaimProcedures[this.lstClaimProcedures.length - 1]);

    this.assignDxPointers(claimProcId)
  }

  getChartFollowUpProcedures() {
    // this.lstClaimProcedures = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.selectedDOSYYYYMMDD, option: "" }
    ];

    this.claimService.getChartFollowUpProcedures(searchCriteria).subscribe(
      data => {

        debugger;
        let lstFollowUpProc = data as Array<any>;
        if (lstFollowUpProc != undefined && lstFollowUpProc.length > 0) {

          if (this.lstClaimProcedures == undefined) {
            this.lstClaimProcedures = new Array<any>();
          }
          else {
            //this.newProcedureTempId = -1;
            let claimProcId: number = this.newProcedureTempId--;
            lstFollowUpProc.forEach(element => {

              //if (!this.checkIfProcAlreadyExist(element.code)) {
              this.lstClaimProcedures.push({

                claim_procedures_id: claimProcId--,
                proc_sequence: this.lstClaimProcedures.length + 1,
                proc_code: element.code,
                description: element.description,
                charges: element.charges,
                units: 1,
                total_charges: element.charges,
                mod1: element.modifier,
                ndc_code: element.ndc_code,
                pos: element.pos,
                add_edit_flag: true
              });
              //}
            });
          }
        }

        //this.dataPopulateCount--;
        //this.assignValues();
        //this.createProcedureControls();

        this.followUpCodesPopulateCount--;
        this.assignChartFollowUpCodes();

      },
      error => {
        // this.dataPopulateCount--;
        this.isLoading = false;
        this.getChartFollowUpProceduresError(error);
      }
    );
  }

  getChartFollowUpProceduresError(error: any) {
    this.logMessage.log("getChartFollowUpProcedures Error." + error);
  }

  /******* END Procedure Search  ******* */

  procedureFieldFocused(index: number) {
    this.procedureSelectionChanged(index)
  }

  procedureSelectionChanged(index: number) {
    this.selectedProcedureRow = index;
  }

  moveProcedure(option: string) {


    if (this.selectedProcedureRow != undefined && this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {
      switch (option) {
        case "down":
          if ((this.selectedProcedureRow + 1) < this.lstClaimProcedures.length) {
            var source = this.lstClaimProcedures[this.selectedProcedureRow];
            var toBeSwaped = this.lstClaimProcedures[this.selectedProcedureRow + 1];

            source.proc_sequence = this.selectedProcedureRow + 2;
            source.add_edit_flag = true;
            toBeSwaped.proc_sequence = this.selectedProcedureRow + 1;
            toBeSwaped.add_edit_flag = true;

            this.lstClaimProcedures[this.selectedProcedureRow] = toBeSwaped;
            this.lstClaimProcedures[this.selectedProcedureRow + 1] = source

            this.selectedProcedureRow++;
          }

          break;
        case "up":
          if ((this.selectedProcedureRow) > 0) {

            var source = this.lstClaimProcedures[this.selectedProcedureRow];
            var toBeSwaped = this.lstClaimProcedures[this.selectedProcedureRow - 1];

            source.proc_sequence = this.selectedProcedureRow;
            source.add_edit_flag = true;
            toBeSwaped.proc_sequence = this.selectedProcedureRow + 1;
            toBeSwaped.add_edit_flag = true;

            this.lstClaimProcedures[this.selectedProcedureRow] = toBeSwaped;
            this.lstClaimProcedures[this.selectedProcedureRow - 1] = source

            this.selectedProcedureRow--;

          }
          break;

        default:
          break;
      }
    }
  }

  removeProcedure(rowIndex: number) {


    if (this.lstClaimProcedures != undefined) {

      let claim_procedures_id = this.lstClaimProcedures[rowIndex].claim_procedures_id;

      if (claim_procedures_id > 0) {

        if (this.lstDeletedProcedures == undefined) {
          this.lstDeletedProcedures = new Array<number>();
        }
        this.lstDeletedProcedures.push(claim_procedures_id);

        //if (this.strDeletedClaimProcedures != undefined && this.strDeletedClaimProcedures != "") {
        //          this.strDeletedClaimProcedures += ","
        //      }
        //    this.strDeletedClaimProcedures += "'" + claim_procedures_id + "'";
      }
      this.lstClaimProcedures.splice(rowIndex, 1);

      this.removeProcedureControlFromFormGroup(claim_procedures_id);

      for (let i: number = rowIndex; i < this.lstClaimProcedures.length; i++) {
        this.lstClaimProcedures[i].add_edit_flag = true;
        this.lstClaimProcedures[i].proc_sequence = i + 1;
      }

    }

    this.calculateClaimTotal();
  }

  calculateSingleProcedureCharges(claim_procedures_id: number) {

    debugger;
    let charges: any = GeneralOperation.getCurrencyNumbersOnly((this.claimFormGroup.get("txtCharges_" + claim_procedures_id) as FormControl).value);
    let units: any = (this.claimFormGroup.get("txtUnits_" + claim_procedures_id) as FormControl).value;
    if (!isNaN(charges) && !isNaN(units)) {

      this.lstClaimProcedures.forEach(proc => {
        if (proc.claim_procedures_id == claim_procedures_id) {
          proc.total_charges = Number(charges) * Number(units);

        }
      });
    }

    this.calculateClaimTotal();

  }

  calculateClaimTotal() {
    debugger;
    this.claimTotal = 0;
    this.claimDue = 0;
    this.lstClaimProcedures.forEach(proc => {

      let total_charges: any = proc.total_charges;

      if (!isNaN(total_charges)) {

        this.claimTotal = Number(this.claimTotal) + Number(total_charges);
      }
    });


    if (this.objClaim != undefined) {
      this.claimDue = this.claimTotal - (Number(this.objClaim.pri_paid) + Number(this.objClaim.sec_paid) + Number(this.objClaim.oth_paid) + Number(this.objClaim.patient_paid) + Number(this.objClaim.write_off) + Number(this.objClaim.adjust_amount));
    }
    else {
      this.claimDue = this.claimTotal;
    }

  }


  formateProcedureCurrencyInputs(claim_procedures_id: number, fieldName: string) {

    debugger;

    let controlName = fieldName + "_" + claim_procedures_id;
    // let value: any = (this.claimFormGroup.get(controlName) as FormControl).value;
    let value: number = GeneralOperation.getCurrencyNumbersOnly((this.claimFormGroup.get(controlName) as FormControl).value);
    if (!isNaN(value)) {
      let formatedValue = this.decimalPipe.transform(value, ".2-2", "");
      (this.claimFormGroup.get(controlName) as FormControl).setValue(formatedValue);

      if (fieldName == "txtCharges") {
        this.calculateSingleProcedureCharges(claim_procedures_id);
      }
    }
  }

  formateCurrencyInputs(controlName: string) {
    let value: any = (this.claimFormGroup.get(controlName) as FormControl).value;
    if (!isNaN(value)) {
      let formatedValue = this.decimalPipe.transform(value, ".2-2", "");
      (this.claimFormGroup.get(controlName) as FormControl).setValue(formatedValue);
    }
  }

  /*
  ndcFocusOut(claim_procedures_id: number) {

    let ndcCode: any = (this.claimFormGroup.get("txtNDCCode_" + claim_procedures_id) as FormControl).value;
    this.lstClaimProcedures.forEach(proc => {
      if (proc.claim_procedures_id == claim_procedures_id) {
        proc.ndc_code = ndcCode;
      }
    });

    this.procNDCCheck();
  }

  procNDCCheck() {

   this.isNDCExist=false;
    this.lstClaimProcedures.forEach(proc => {
      if (proc.ndc_code != undefined && proc.ndc_code != "") {
        this.isNDCExist = true;
      }
    });
  
  }
  */


  onImportICDCPTFromEncounterClicked() {

    debugger;
    let alertMsg: string = "";

    if (this.selectedDOSYYYYMMDD == undefined || this.selectedDOSYYYYMMDD == "") {
      alertMsg = "Please select DOS."
    }
    if (this.claimFormGroup.get("ddLocation").value == undefined) {
      alertMsg = "Please select Location."
    }
    if (this.claimFormGroup.get("ddAttendingPhysician").value == undefined) {
      alertMsg = "Please select Attending Provider."
    }

    if (alertMsg != "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Procedures/Diagnosi', alertMsg, AlertTypeEnum.WARNING);

    }
    else {

      let obj = {
        claimIcdCount: this.lstClaimDiagnosis != undefined ? this.lstClaimDiagnosis.length : 0,
        claimPatientId: this.patientId,
        claimDOS: this.dateTimeUtil.getStringDateFromDateModelWithFormat(
          this.claimFormGroup.get('dpDOS').value,
          DateTimeFormat.DATEFORMAT_YYYY_MM_DD),
        claimRulesInfo: this.patientClaimRuleInfo,
        claimProviderId: this.claimFormGroup.get('ddAttendingPhysician').value,
        claimLocationId: this.claimFormGroup.get('ddLocation').value,
      };

      //this.onImportIcdCpt.emit(obj);

      this.showImportICDCPT = true;
      this.showImportIcdCptModule.emit(true);
    }



    /*
    const modalRef = this.ngbModal.open(ImportIcdCptComponent, this.popUpOptionsLarge);

    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.claimId = this.claimId;
    modalRef.componentInstance.dos = this.claimFormGroup.get("dpDOS").value;
    modalRef.componentInstance.providerId = this.claimFormGroup.get("ddLocation").value;
    modalRef.componentInstance.locationId = this.claimFormGroup.get("ddAttendingPhysician").value;
    modalRef.componentInstance.objPatientClaimRuleInfo = this.objPatientClaimRuleInfo;

    modalRef.result.then((result) => {
      if (result != undefined) {

      }
    }
      , (reason) => {

      });
      */
  }

  onImportIcdCptCallBack(lstSelectedCodes: any) {

    debugger;

    if (lstSelectedCodes != undefined) {

      this.claimFormGroup.get("chkEAP").setValue(lstSelectedCodes.eap);
      let diagImpLst = lstSelectedCodes.diagnosis_list;
      let procImpLst = lstSelectedCodes.procedures_list;

      if (diagImpLst != undefined) {

        diagImpLst.forEach(element => {

          if (!this.checkIfDiagAlreadyExist(element.code)) {

            //if (this.lstClaimDiagnosis == undefined)
            // this.lstClaimDiagnosis = new Array();


            //this.lstClaimDiagnosis.push({ diag_sequence: this.lstClaimDiagnosis.length + 1, diag_code: element.code, description: element.description, code_type: element.code_type, add_edit_flag: true });

            this.addDiagnosisToList(element);

          }
        });

        this.arrangeDiagnosis();
      }

      if (procImpLst != undefined) {

        procImpLst.forEach(element => {


          //if (!this.checkIfProcAlreadyExist(element.code)) {

          this.addProcedure(element);
          //}
        });
      }


    }

    //if (source == "import") {
    //  this.showImportICDCPT = false;
    //}
    //else 
    //if (source == "super_bill") {
    //  this.showSuperBill = false;
    //}
    this.showImportICDCPT = false;
    this.showSuperBill = false;
    this.showImportIcdCptModule.emit(false);


  }

  checkIfDiagAlreadyExist(daigCode: string): boolean {

    let exist: boolean = false;

    if (this.lstClaimDiagnosis != undefined) {
      this.lstClaimDiagnosis.forEach(element => {
        if (element.diag_code == daigCode) {
          exist = true;
        }

      });
    }

    return exist;

  }

  /*
  checkIfProcAlreadyExist(procCode: string): boolean {

    let exist: boolean = false;

    if (this.lstClaimProcedures != undefined) {
      this.lstClaimProcedures.forEach(element => {
        if (element.proc_code == procCode) {
          exist = true;
        }

      });
    }

    return exist;

  }
  */

  onSuperBillClicked() {


    //this.showSuperBill = true;

    //let obj = {
    //  claimIcdCount: this.lstClaimDiagnosis != undefined ? this.lstClaimDiagnosis.length : 0,
    //  claimDOS: this.claimFormGroup.get('dpDOS').value
    //};

    this.showSuperBill = true;
    this.showImportIcdCptModule.emit(true);

    //this.onSuperBill.emit(obj);
  }

  onFacilityChange(index: number) {
    debugger;
    this.selectedFacilityPOSCode = this.lookupList.facilityList[index].pos_code;
  }
  onAttendingChange(index: number) {
    debugger;
    if (this.isLoading == false && this.addEditOperation == OperationType.ADD) {
      let providerName = this.lookupList.providerList[index].name;
      this.claimFormGroup.get("ddBillingPhysician").setValue(null);
      for (let i = 0; i < this.lookupList.billingProviderList.length; i++) {
        if (providerName.toUpperCase() == this.lookupList.billingProviderList[i].name.toString().toUpperCase()) {
          this.claimFormGroup.get("ddBillingPhysician").setValue(this.lookupList.billingProviderList[i].id);
          break;
        }
      }
    }
  }

  onCancel() {
    this.lstDeletedDiagnosis = undefined;
    this.lstDeletedProcedures = undefined;
    this.lstDeletedInsurances = undefined;


    this.removeAllProcedureControlFromFormGroup();
    this.removeAllInsuranceControlsFromFormGroup();
    this.loadClaimData();
  }

  summarizeICDList(): string {

    let lst: string = "";

    if (this.lstClaimDiagnosis != undefined) {
      this.lstClaimDiagnosis.forEach(element => {
        lst += element.diag_code;
      });
    }

    return lst;

  }


  isClaim_Resubmit(): boolean {
    let isResubmitted: boolean = false;
    if (this.lstClaimProcedures != undefined) {
      this.lstClaimProcedures.forEach(element => {
        if (!isResubmitted) {
          if (this.claimFormGroup.get("chkIsProcResubmit_" + element.claim_procedures_id).value == true) {
            isResubmitted = true;
          }
        }
      });
    }

    return isResubmitted;

  }

  getIcdCptSummary(): string {

    let cpts: string = "";
    let icds: string = "";

    if (this.lstClaimProcedures != undefined) {

      this.lstClaimProcedures.forEach(element => {

        // Mod
        let mod1: string = this.claimFormGroup.get("ddMode1_" + element.claim_procedures_id).value;
        let mod2: string = this.claimFormGroup.get("ddMode2_" + element.claim_procedures_id).value;
        let mod3: string = this.claimFormGroup.get("ddMode3_" + element.claim_procedures_id).value;
        let mod4: string = this.claimFormGroup.get("ddMode4_" + element.claim_procedures_id).value;

        let strmod: string = "";
        if (mod1 != undefined && mod1 != "") {
          if (strmod != "") {
            strmod += ","
          }
          strmod += mod1.toUpperCase();
        }
        if (mod2 != undefined && mod2 != "") {
          if (strmod != "") {
            strmod += ","
          }
          strmod += mod2.toUpperCase();
        }

        if (mod3 != undefined && mod3 != "") {
          if (strmod != "") {
            strmod += ","
          }
          strmod += mod3.toUpperCase();
        }
        if (mod4 != undefined && mod4 != "") {
          if (strmod != "") {
            strmod += ","
          }
          strmod += mod4.toUpperCase();
        }

        if (cpts != '') {
          cpts += ':';
        }
        cpts += element.proc_code + " $" + element.total_charges + " " + strmod;
      }
      );
    }



    if (this.lstClaimDiagnosis != undefined)
      this.lstClaimDiagnosis.forEach(element => {
        if (icds != "") {
          icds += ":";
        }
        icds += element.diag_code;
      });


    return cpts + "~" + icds;
  }



  validateDateFormates() {

    debugger;

    let strAlertMsg: string = "";
    if (this.claimFormGroup.get('dpDOS').value != undefined && this.claimFormGroup.get('dpDOS').value != ''
      && !this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpDOS').value, DateTimeFormat.DATE_MODEL)) {
      strAlertMsg = "DOS is not in correct formate.";
    }
    else if (this.claimFormGroup.get('dpAccidentDate').value != undefined && this.claimFormGroup.get('dpAccidentDate').value != ''
      && !this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpAccidentDate').value, DateTimeFormat.DATE_MODEL)) {
      strAlertMsg = "Accident Date is not in correct formate.";
    }
    else if (this.claimFormGroup.get('dpStartCareDate').value != undefined && this.claimFormGroup.get('dpStartCareDate').value != ''
      && !this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpStartCareDate').value, DateTimeFormat.DATE_MODEL)) {
      strAlertMsg = "Current Illness Date is not in correct formate.";
    }
    else if (this.claimFormGroup.get('dpHospitalFrom').value != undefined && this.claimFormGroup.get('dpHospitalFrom').value != ''
      && !this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpHospitalFrom').value, DateTimeFormat.DATE_MODEL)) {
      strAlertMsg = "Hospital Form Date is not in correct formate.";
    }
    else if (this.claimFormGroup.get('dpLMP').value != undefined && this.claimFormGroup.get('dpLMP').value != ''
      && !this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpLMP').value, DateTimeFormat.DATE_MODEL)) {
      strAlertMsg = "LMP is not in correct formate.";
    }
    else if (this.claimFormGroup.get('dpLastXRay').value != undefined && this.claimFormGroup.get('dpLastXRay').value != ''
      && !this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpLastXRay').value, DateTimeFormat.DATE_MODEL)) {
      strAlertMsg = "Last X-Ray Date is not in correct formate.";
    }

    else if (this.lstClaimInsurance != undefined && this.lstClaimInsurance.length > 0) {
      this.lstClaimInsurance.forEach(element => {

        if (strAlertMsg == "") {

          if (this.claimFormGroup.get('dpInsStartDate_' + element.claiminsurance_id).value != undefined && this.claimFormGroup.get('dpInsStartDate_' + element.claiminsurance_id).value != ''
            && !this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpInsStartDate_' + element.claiminsurance_id).value, DateTimeFormat.DATE_MODEL)) {
            strAlertMsg = element.insurace_type + " Insurance Start Date is invalid.";
          }
          else if (this.claimFormGroup.get('dpInsEndDate_' + element.claiminsurance_id).value != undefined && this.claimFormGroup.get('dpInsEndDate_' + element.claiminsurance_id).value != ''
            && !this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpInsEndDate_' + element.claiminsurance_id).value, DateTimeFormat.DATE_MODEL)) {
            strAlertMsg = element.insurace_type + " Insurance End Date is invalid.";
          }
        }
      });
    }

    return strAlertMsg;
  }

  ValidateClaimData(): string {

    debugger;

    let strAlertMsg: string = "";

    if (this.claimFormGroup.get('dpDOS').value == undefined || this.claimFormGroup.get('dpDOS').value == "") {
      strAlertMsg = "Please enter DOS.";
    }
    //else if (!this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpDOS').value, DateTimeFormat.DATE_MODEL)) {
    //  strAlertMsg = "DOS is invalid.";
    // }
    else if (this.dateTimeUtil.checkIfFutureDate(this.claimFormGroup.get('dpDOS').value, DateTimeFormat.DATE_MODEL)) {
      strAlertMsg = "Claim of Future DOS Can't be created.";
    }
    else if (this.claimFormGroup.get("ddFaciliy").value == undefined || this.claimFormGroup.get("ddFaciliy").value == "") {
      strAlertMsg = "Please select facility.";
    }
    else if (this.claimFormGroup.get("ddAttendingPhysician").value == undefined || this.claimFormGroup.get("ddAttendingPhysician").value == "") {
      strAlertMsg = "Please select attending provider.";
    }
    else if (this.claimFormGroup.get("ddBillingPhysician").value == undefined || this.claimFormGroup.get("ddBillingPhysician").value == "") {
      strAlertMsg = "Please select billing provider.";
    }

    else if (this.claimFormGroup.get("chkLabClaim").value == true && (this.claimFormGroup.get("txtRefPhyIDHidden").value == undefined || this.claimFormGroup.get("txtRefPhyIDHidden").value == "")) {

      strAlertMsg = "Please select referring provider.";
    }


    else if (this.lstClaimDiagnosis == undefined || this.lstClaimDiagnosis.length == 0) {
      strAlertMsg = "Please select at leaset one diagnose.";
    }
    else if (this.lstClaimProcedures == undefined || this.lstClaimProcedures.length == 0) {
      strAlertMsg = "Please select at leaset one procedure.";
    }


    if (strAlertMsg == "") {
      strAlertMsg = this.validateDiagnosis();
    }

    if (strAlertMsg == "") {
      strAlertMsg = this.validateProcedures();
    }


    if (strAlertMsg == "") {
      strAlertMsg = this.validateInsurances();
    }



    return strAlertMsg;

  }

  validateInsurances() {

    debugger;
    let msg = "";
    if (this.claimFormGroup.get("chkSelfPay").value != true) {

      if (this.lstClaimInsurance == undefined || this.lstClaimInsurance.length == 0) {
        msg = "Please enter insurance or mark claim as Self Pay.";
      }
      else {

        let isPriInsExist: Boolean = false;
        let isSecInsExist: Boolean = false;
        let isOthInsExist: Boolean = false;

        let priInsCount: number = 0;
        let secInsCount: number = 0;
        let othInsCount: number = 0;

        this.lstClaimInsurance.forEach(element => {

          if (msg == "") {

            if (element.insurace_type.toLowerCase() == 'primary') {
              isPriInsExist = true;
              priInsCount++;
            }
            else if (element.insurace_type.toLowerCase() == 'secondary') {
              isSecInsExist = true;
              secInsCount++;
            }
            else if (element.insurace_type.toLowerCase() == 'other') {
              isOthInsExist = true;
              othInsCount++;
            }


            if (element.insurance_id == undefined) {
              msg = "Please selcect " + element.insurace_type + " insurance.";
            }
            else if (element.guarantor_id != undefined && element.guarantor_relationship == undefined) {
              msg = "Please selcect " + element.insurace_type + " insurance subscriber relationship.";
            }
            else if (element.guarantor_relationship != "SELF" && element.guarantor_id == undefined) {
              msg = "Please selcect " + element.insurace_type + " insurance subscriber.";
            }
          }
        });


        if (msg == "") {
          if (isOthInsExist) {
            if (!isPriInsExist) {
              msg = "Please enter Primary Insurance.";
            }
            if (!isSecInsExist) {
              msg = "Please enter Secondary Insurance.";
            }
          }
          else if (isSecInsExist) {
            if (!isPriInsExist) {
              msg = "Please enter Primary Insurance.";
            }
          }
        }

        if (msg == "") {

          if (priInsCount > 1) {
            msg = "Primary Insurance is duplicate.";
          }
          else if (secInsCount > 1) {
            msg = "Secondary Insurance is duplicate.";
          }
          else if (othInsCount > 1) {
            msg = "Other Insurance is duplicate.";
          }

        }
      }
    }

    return msg;
  }

  validateDiagnosis(): string {

    let msg: string = "";
    if (this.lstClaimDiagnosis != undefined) {

      for (let i: number = 0; i < this.lstClaimDiagnosis.length; i++) {

        if (msg == "") {
          for (let j: number = i + 1; j < this.lstClaimDiagnosis.length; j++) {

            if (msg == "") {
              if (this.lstClaimDiagnosis[i].diag_code == this.lstClaimDiagnosis[j].diag_code) {
                msg = "Duplicate diagnosis are not allowed (" + this.lstClaimDiagnosis[i].diag_code + ").";
              }
            }

          }
        }
      }
    }

    if (msg == "") {

      debugger;
      let uniqueCodeTypes: any = new UniquePipe().transform(this.lstClaimDiagnosis, "code_type");
      if (uniqueCodeTypes != undefined && uniqueCodeTypes.length > 1) {
        msg = "Only One Type of ICD's is Allowed.";
      }

    }

    return msg;
  }

  validateProcedures() {

    debugger;
    let msg: string = "";

    if (this.lstClaimProcedures != undefined) {

      this.lstClaimProcedures.forEach(element => {

        if (msg == "") {

          if (this.claimFormGroup.get('dpDOSFrom_' + element.claim_procedures_id).value == undefined
            || this.claimFormGroup.get('dpDOSFrom_' + element.claim_procedures_id).value == "") {
            msg = element.proc_code + ": Please enter DOS From.";
          }
          else if (this.claimFormGroup.get('dpDOSTo_' + element.claim_procedures_id).value == undefined
            || this.claimFormGroup.get('dpDOSTo_' + element.claim_procedures_id).value == "") {
            msg = element.proc_code + ": Please enter DOS To.";
          }
          else if (!this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpDOSFrom_' + element.claim_procedures_id).value, DateTimeFormat.DATE_MODEL)) {
            msg = element.proc_code + ": DOS From is not in valid formate.";
          }
          else if (!this.dateTimeUtil.isValidDateTime(this.claimFormGroup.get('dpDOSFrom_' + element.claim_procedures_id).value, DateTimeFormat.DATE_MODEL)) {
            msg = element.proc_code + ": DOS From is not in valid formate.";
          }
          else if (this.dateTimeUtil.checkIfFutureDate(this.claimFormGroup.get('dpDOSFrom_' + element.claim_procedures_id).value, DateTimeFormat.DATE_MODEL)) {
            msg = element.proc_code + ": DOS From Can't be a future date.";
          }
          else if (this.dateTimeUtil.checkIfFutureDate(this.claimFormGroup.get('dpDOSTo_' + element.claim_procedures_id).value, DateTimeFormat.DATE_MODEL)) {
            msg = element.proc_code + ": DOS To Can't be a future date.";
          }
          else if (this.dateTimeUtil.compareDate(this.claimFormGroup.get('dpDOSFrom_' + element.claim_procedures_id).value, this.claimFormGroup.get('dpDOSTo_' + element.claim_procedures_id).value, DateTimeFormat.DATE_MODEL) > 0) {
            msg = element.proc_code + ": DOS From Can't be earliear than DOS To.";
          }
        }

        if (msg == "") {
          debugger;



          // NDC Check
          if (this.claimFormGroup.get("txtNDCCode_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("txtNDCCode_" + element.claim_procedures_id).value != "") {

            if (RegExp(RegExEnum.NDC).test(this.claimFormGroup.get("txtNDCCode_" + element.claim_procedures_id).value) == false) {
              msg = "Please enter a valid NDC code for " + element.proc_code;
            }
            else {
              if (this.claimFormGroup.get("ddNDCMeasure_" + element.claim_procedures_id).value == undefined || this.claimFormGroup.get("ddNDCMeasure_" + element.claim_procedures_id).value == "") {
                msg = "Please enter NDC Unit for " + element.proc_code;
              }
              else if (this.claimFormGroup.get("txtNDCQuantity_" + element.claim_procedures_id).value == undefined || this.claimFormGroup.get("txtNDCQuantity_" + element.claim_procedures_id).value == "") {
                msg = "Please enter NDC Quantity for " + element.proc_code;
              }
              else if (RegExp(RegExEnum.EitherWholeNumberOrDecimalWithTwoPoints).test(this.claimFormGroup.get("txtNDCQuantity_" + element.claim_procedures_id).value) == false) {
                msg = "NDC Quantity is invalid for " + element.proc_code;
              }
            }
          }
        }


        if (msg == "") {
          // Mod
          let mod1: string = this.claimFormGroup.get("ddMode1_" + element.claim_procedures_id).value;
          let mod2: string = this.claimFormGroup.get("ddMode2_" + element.claim_procedures_id).value;
          let mod3: string = this.claimFormGroup.get("ddMode3_" + element.claim_procedures_id).value;
          let mod4: string = this.claimFormGroup.get("ddMode4_" + element.claim_procedures_id).value;

          if (mod1 != undefined && mod1 != "" && (mod1 == mod2 || mod1 == mod3 || mod1 == mod4)) {
            msg = "Duplicate modifier are not allowed in one procedure " + element.proc_code + ".";
          }
          else if (mod2 != undefined && mod2 != "" && (mod2 == mod3 || mod2 == mod4)) {
            msg = "Duplicate modifier are not allowed in one procedure " + element.proc_code + ".";
          }
          else if (mod3 != undefined && mod3 != "" && mod3 == mod4) {
            msg = "Duplicate modifier are not allowed in one procedure " + element.proc_code + ".";
          }
        }



        // dx pointer
        if (msg == "") {
          let dx1: string = this.claimFormGroup.get("txtDxPointer1_" + element.claim_procedures_id).value;
          let dx2: string = this.claimFormGroup.get("txtDxPointer2_" + element.claim_procedures_id).value;
          let dx3: string = this.claimFormGroup.get("txtDxPointer3_" + element.claim_procedures_id).value;
          let dx4: string = this.claimFormGroup.get("txtDxPointer4_" + element.claim_procedures_id).value;

          if ((dx1 == undefined || dx1 == "")
            && (dx2 == undefined || dx2 == "")
            && (dx3 == undefined || dx3 == "")
            && (dx4 == undefined || dx4 == "")) {
            msg = "Dx Pointer is missing for " + element.proc_code + ".";
          }
        }
      });
    }
    return msg;
  }

  checkIfIsnuranceValueChanged(Id: number) {

    if (
      this.claimFormGroup.get("ddInsuranceSubscriberRel_" + Id).dirty
      || this.claimFormGroup.get("txtPolicyNo_" + Id).dirty
      || this.claimFormGroup.get("txtGroupNo_" + Id).dirty
      || this.claimFormGroup.get("dpInsStartDate_" + Id).dirty
      || this.claimFormGroup.get("dpInsEndDate_" + Id).dirty
      || this.claimFormGroup.get("txtInsCopy_" + Id).dirty
      || this.claimFormGroup.get("txtInsPCP_" + Id).dirty
      || this.claimFormGroup.get("txtWorkerCompName_" + Id).dirty
      || this.claimFormGroup.get("txtWorkerCompAddress_" + Id).dirty
      || this.claimFormGroup.get("txtWCZipCode_" + Id).dirty
      || this.claimFormGroup.get("ddWorkerCompCity_" + Id).dirty
      || this.claimFormGroup.get("txtInsOrigClaimNo_" + Id).dirty
      || this.claimFormGroup.get("txtInsCopy_" + Id).dirty
      || this.claimFormGroup.get("txtInsAuthorizationNo_" + Id).dirty
      || this.claimFormGroup.get("txtInsAuthorizationNo_" + Id).dirty
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  populateClaimInsuranceSaveObject(): Array<ClaimInsuranceSave> {

    let lstClaimInsuranceSave: Array<ClaimInsuranceSave>;

    if (this.lstClaimInsurance != undefined && this.lstClaimInsurance.length > 0) {

      debugger;
      this.lstClaimInsurance.forEach(element => {

        if (this.checkIfIsnuranceValueChanged(element.claiminsurance_id) || element.add_edit_flag == true) {

          let ormClaimInsuranceSave: ClaimInsuranceSave = new ClaimInsuranceSave();

          if (element.claiminsurance_id != null && element.claiminsurance_id > 0) {
            ormClaimInsuranceSave.claiminsurance_id = element.claiminsurance_id
            ormClaimInsuranceSave.client_date_created = element.client_date_created;
            ormClaimInsuranceSave.created_user = element.created_user;
            ormClaimInsuranceSave.date_created = element.date_created;
          }
          else {

            ormClaimInsuranceSave.client_date_created = this.clientDateTime;
            ormClaimInsuranceSave.created_user = this.lookupList.logedInUser.user_name;
          }

          ormClaimInsuranceSave.claim_id = this.claimId;
          ormClaimInsuranceSave.patient_id = this.patientId;
          ormClaimInsuranceSave.client_date_modified = this.clientDateTime;
          ormClaimInsuranceSave.modified_user = this.lookupList.logedInUser.user_name;

          ormClaimInsuranceSave.insurace_type = element.insurace_type;
          ormClaimInsuranceSave.insurance_id = element.insurance_id;


          if (element.guarantor_id != undefined && element.guarantor_id != "") {
            ormClaimInsuranceSave.guarantor_id = element.guarantor_id;
            ormClaimInsuranceSave.guarantor_relationship = this.claimFormGroup.get("ddInsuranceSubscriberRel_" + element.claiminsurance_id).value;
          }
          else {
            ormClaimInsuranceSave.guarantor_relationship = "SELF";
          }

          if (this.claimFormGroup.get("txtPolicyNo_" + element.claiminsurance_id).value != null && this.claimFormGroup.get("txtPolicyNo_" + element.claiminsurance_id).value != "")
            ormClaimInsuranceSave.policy_number = this.claimFormGroup.get("txtPolicyNo_" + element.claiminsurance_id).value.toString().trim();
          if (this.claimFormGroup.get("txtGroupNo_" + element.claiminsurance_id).value != null && this.claimFormGroup.get("txtGroupNo_" + element.claiminsurance_id).value != "")
            ormClaimInsuranceSave.group_number = this.claimFormGroup.get("txtGroupNo_" + element.claiminsurance_id).value.toString().trim();

          ormClaimInsuranceSave.copay = this.claimFormGroup.get("txtInsCopy_" + element.claiminsurance_id).value;
          ormClaimInsuranceSave.start_date = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get("dpInsStartDate_" + element.claiminsurance_id).value);

          ormClaimInsuranceSave.end_date = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get("dpInsEndDate_" + element.claiminsurance_id).value);

          if (this.claimFormGroup.get("txtWorkerCompName_" + element.claiminsurance_id).value != undefined && this.claimFormGroup.get("txtWorkerCompName_" + element.claiminsurance_id).value != "") {

            ormClaimInsuranceSave.workercomp_name = this.claimFormGroup.get("txtWorkerCompName_" + element.claiminsurance_id).value;
            ormClaimInsuranceSave.workercomp_address = this.claimFormGroup.get("txtWorkerCompAddress_" + element.claiminsurance_id).value;
            ormClaimInsuranceSave.workercomp_city = this.claimFormGroup.get("ddWorkerCompCity_" + element.claiminsurance_id).value;
            ormClaimInsuranceSave.workercomp_zip = this.claimFormGroup.get("txtWCZipCode_" + element.claiminsurance_id).value;
            ormClaimInsuranceSave.workercomp_state = element.workercomp_state;
          }

          if (this.claimFormGroup.get("txtInsAuthorizationNo_" + element.claiminsurance_id).value != undefined && this.claimFormGroup.get("txtInsAuthorizationNo_" + element.claiminsurance_id).value != "") {
            ormClaimInsuranceSave.auth_no = this.claimFormGroup.get("txtInsAuthorizationNo_" + element.claiminsurance_id).value;
            ormClaimInsuranceSave.auth_no_type = this.claimFormGroup.get("txtInsAuthorizationNo_" + element.claiminsurance_id).value;
          }
          ormClaimInsuranceSave.claim_no = this.claimFormGroup.get("txtInsOrigClaimNo_" + element.claiminsurance_id).value;

          ormClaimInsuranceSave.elig_date = element.elig_date;
          ormClaimInsuranceSave.elig_status = element.elig_status;
          ormClaimInsuranceSave.elig_response = element.elig_response;

          if (lstClaimInsuranceSave == undefined) {
            lstClaimInsuranceSave = new Array<ClaimInsuranceSave>();
          }
          lstClaimInsuranceSave.push(ormClaimInsuranceSave);
        }
      });
    }


    return lstClaimInsuranceSave;
  }


  checkIfProcedurValueChanged(Id: number) {

    if (
      this.claimFormGroup.get("dpDOSFrom_" + Id).dirty
      || this.claimFormGroup.get("dpDOSTo_" + Id).dirty
      || this.claimFormGroup.get("ddPOS_" + Id).dirty
      || this.claimFormGroup.get("txtCharges_" + Id).dirty
      || this.claimFormGroup.get("txtUnits_" + Id).dirty
      || this.claimFormGroup.get("ddMode1_" + Id).dirty
      || this.claimFormGroup.get("ddMode2_" + Id).dirty
      || this.claimFormGroup.get("ddMode3_" + Id).dirty
      || this.claimFormGroup.get("ddMode4_" + Id).dirty
      || this.claimFormGroup.get("txtNDCCode_" + Id).dirty
      || this.claimFormGroup.get("ddNDCMeasure_" + Id).dirty
      || this.claimFormGroup.get("txtNDCQuantity_" + Id).dirty
      || this.claimFormGroup.get("txtNDCPrice_" + Id).dirty
      || this.claimFormGroup.get("txtDxPointer1_" + Id).dirty
      || this.claimFormGroup.get("txtDxPointer2_" + Id).dirty
      || this.claimFormGroup.get("txtDxPointer3_" + Id).dirty
      || this.claimFormGroup.get("txtDxPointer4_" + Id).dirty
      || this.claimFormGroup.get("chkIsProcResubmit_" + Id).dirty
      || this.claimFormGroup.get("txtProNotes_" + Id).dirty
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  populateProceduresSaveObject(): Array<ClaimProceduresSavePro> {

    let lstProceduresSavePro: Array<ClaimProceduresSavePro>;

    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {


      this.lstClaimProcedures.forEach(element => {

        debugger;

        if (this.checkIfProcedurValueChanged(element.claim_procedures_id) || element.add_edit_flag == true) {


          let ormProceduresSavePro: ClaimProceduresSavePro = new ClaimProceduresSavePro();

          if (element.claim_procedures_id != null && element.claim_procedures_id > 0) {
            ormProceduresSavePro.claim_procedures_id = element.claim_procedures_id
            ormProceduresSavePro.client_date_created = element.client_date_created;
            ormProceduresSavePro.created_user = element.created_user;
            ormProceduresSavePro.date_created = element.date_created;
          }
          else {

            ormProceduresSavePro.client_date_created = this.clientDateTime;
            ormProceduresSavePro.created_user = this.lookupList.logedInUser.user_name;
          }

          ormProceduresSavePro.proc_sequence = element.proc_sequence;

          ormProceduresSavePro.claim_id = this.claimId;
          ormProceduresSavePro.patient_id = this.patientId;
          ormProceduresSavePro.practice_id = this.lookupList.practiceInfo.practiceId;
          ormProceduresSavePro.client_date_modified = this.clientDateTime;
          ormProceduresSavePro.modified_user = this.lookupList.logedInUser.user_name;

          ormProceduresSavePro.dos_from = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get('dpDOSFrom_' + element.claim_procedures_id).value);
          ormProceduresSavePro.dos_to = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get('dpDOSTo_' + element.claim_procedures_id).value);

          ormProceduresSavePro.proc_code = element.proc_code;
          ormProceduresSavePro.description = element.description;
          ormProceduresSavePro.pos = this.claimFormGroup.get("ddPOS_" + element.claim_procedures_id).value;
          ormProceduresSavePro.charges = GeneralOperation.getCurrencyNumbersOnly(this.claimFormGroup.get("txtCharges_" + element.claim_procedures_id).value);
          ormProceduresSavePro.units = Number(this.claimFormGroup.get("txtUnits_" + element.claim_procedures_id).value);
          ormProceduresSavePro.total_charges = Number(element.total_charges);

          if (this.claimFormGroup.get("ddMode1_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("ddMode1_" + element.claim_procedures_id).value != "") {
            ormProceduresSavePro.mod1 = this.claimFormGroup.get("ddMode1_" + element.claim_procedures_id).value;
          }
          if (this.claimFormGroup.get("ddMode2_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("ddMode2_" + element.claim_procedures_id).value != "") {
            ormProceduresSavePro.mod2 = this.claimFormGroup.get("ddMode2_" + element.claim_procedures_id).value;
          }
          if (this.claimFormGroup.get("ddMode3_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("ddMode3_" + element.claim_procedures_id).value != "") {
            ormProceduresSavePro.mod3 = this.claimFormGroup.get("ddMode3_" + element.claim_procedures_id).value;
          }
          if (this.claimFormGroup.get("ddMode4_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("ddMode4_" + element.claim_procedures_id).value != "") {
            ormProceduresSavePro.mod4 = this.claimFormGroup.get("ddMode4_" + element.claim_procedures_id).value;
          }

          if (this.claimFormGroup.get("txtNDCCode_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("txtNDCCode_" + element.claim_procedures_id).value != "") {

            debugger;
            ormProceduresSavePro.ndc_code = this.claimFormGroup.get("txtNDCCode_" + element.claim_procedures_id).value;
            ormProceduresSavePro.ndc_measure = this.claimFormGroup.get("ddNDCMeasure_" + element.claim_procedures_id).value;
            ormProceduresSavePro.ndc_qty = this.claimFormGroup.get("txtNDCQuantity_" + element.claim_procedures_id).value;
            ormProceduresSavePro.ndc_price = this.claimFormGroup.get("txtNDCPrice_" + element.claim_procedures_id).value;
          }

          if (this.claimFormGroup.get("txtDxPointer1_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("txtDxPointer1_" + element.claim_procedures_id).value != "") {
            ormProceduresSavePro.dx_pointer1 = Number(this.claimFormGroup.get("txtDxPointer1_" + element.claim_procedures_id).value);
          }


          if (this.claimFormGroup.get("txtDxPointer2_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("txtDxPointer2_" + element.claim_procedures_id).value != "") {
            ormProceduresSavePro.dx_pointer2 = Number(this.claimFormGroup.get("txtDxPointer2_" + element.claim_procedures_id).value);
          }
          if (this.claimFormGroup.get("txtDxPointer3_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("txtDxPointer3_" + element.claim_procedures_id).value != "") {
            ormProceduresSavePro.dx_pointer3 = Number(this.claimFormGroup.get("txtDxPointer3_" + element.claim_procedures_id).value);
          }
          if (this.claimFormGroup.get("txtDxPointer4_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("txtDxPointer4_" + element.claim_procedures_id).value != "") {
            ormProceduresSavePro.dx_pointer4 = Number(this.claimFormGroup.get("txtDxPointer4_" + element.claim_procedures_id).value);
          }

          if (this.claimFormGroup.get("chkIsProcResubmit_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("chkIsProcResubmit_" + element.claim_procedures_id).value == true) {
            ormProceduresSavePro.is_resubmitted = true;
          }
          else {
            ormProceduresSavePro.is_resubmitted = false;
          }


          if (this.claimFormGroup.get("txtProNotes_" + element.claim_procedures_id).value != undefined && this.claimFormGroup.get("txtProNotes_" + element.claim_procedures_id).value != true) {
            ormProceduresSavePro.notes = this.claimFormGroup.get("txtProNotes_" + element.claim_procedures_id).value;
          }


          if (lstProceduresSavePro == undefined) {
            lstProceduresSavePro = new Array<ClaimProceduresSavePro>();
          }

          lstProceduresSavePro.push(ormProceduresSavePro);

        }
      });



    }


    return lstProceduresSavePro;
  }

  populateDiagnosisSaveObject(): Array<ClaimDiagnosisSavePro> {

    let lstDiagnosisSavePro: Array<ClaimDiagnosisSavePro>;

    if (this.lstClaimDiagnosis != undefined && this.lstClaimDiagnosis.length > 0) {


      this.lstClaimDiagnosis.forEach(element => {

        if (element.add_edit_flag == true) {
          let ormDiagnosisSavePro: ClaimDiagnosisSavePro = new ClaimDiagnosisSavePro();

          if (element.claim_diagnosis_id != null) {
            ormDiagnosisSavePro.claim_diagnosis_id = element.claim_diagnosis_id
            ormDiagnosisSavePro.client_date_created = element.client_date_created;
            ormDiagnosisSavePro.created_user = element.created_user;
            ormDiagnosisSavePro.date_created = element.date_created;
          }
          else {

            ormDiagnosisSavePro.client_date_created = this.clientDateTime;
            ormDiagnosisSavePro.created_user = this.lookupList.logedInUser.user_name;
          }

          ormDiagnosisSavePro.claim_id = this.claimId;
          ormDiagnosisSavePro.patient_id = this.patientId;
          ormDiagnosisSavePro.practice_id = this.lookupList.practiceInfo.practiceId;
          ormDiagnosisSavePro.client_date_modified = this.clientDateTime;
          ormDiagnosisSavePro.modified_user = this.lookupList.logedInUser.user_name;

          ormDiagnosisSavePro.code_type = element.code_type;
          ormDiagnosisSavePro.diag_code = element.diag_code;
          ormDiagnosisSavePro.diag_sequence = element.diag_sequence;
          ormDiagnosisSavePro.description = element.description;

          if (lstDiagnosisSavePro == undefined) {
            lstDiagnosisSavePro = new Array<ClaimDiagnosisSavePro>();
          }
          lstDiagnosisSavePro.push(ormDiagnosisSavePro);
        }
      });
    }

    return lstDiagnosisSavePro;
  }

  populateClaimSaveObject(saveAsDraft: boolean): ClamSavePro {

    // Claim
    debugger;
    let ormClaimSave_Pro: ClamSavePro = new ClamSavePro();

    if (this.objClaim != undefined) {
      ormClaimSave_Pro.claim_id = this.claimId;
      ormClaimSave_Pro.client_date_created = this.objClaim.client_date_created;
      ormClaimSave_Pro.created_user = this.objClaim.created_user;
      ormClaimSave_Pro.date_created = this.objClaim.date_created;

      if (!saveAsDraft && this.objClaim.draft == true) {
        ormClaimSave_Pro.coding_done_date = this.clientDateTime;
      }
      else if (this.objClaim.coding_done_date != undefined) {
        ormClaimSave_Pro.coding_done_date = this.objClaim.coding_done_date;
      }

      ormClaimSave_Pro.icd_10_claim = this.objClaim.icd_10_claim;

      //let amtDue: number = Number(this.objClaim.claim_total) - (Number(this.objClaim.pri_paid) + Number(this.objClaim.sec_paid) + Number(this.objClaim.oth_paid + Number(this.objClaim.patient_paid) + Number(this.objClaim.write_off)));
      //ormClaimSave_Pro.amt_due = amtDue;
      ormClaimSave_Pro.amt_due = this.claimDue;



      if (this.claimFormGroup.get("chkSelfPay").value == true) {
        ormClaimSave_Pro.pri_status = undefined;
        ormClaimSave_Pro.sec_status = undefined;
        ormClaimSave_Pro.oth_status = undefined;
        ormClaimSave_Pro.pat_status = "B";
      }
      else {

        if (this.lstClaimInsurance != undefined) {

          if (this.checkIfInsuranceExist("Primary")) {
            ormClaimSave_Pro.pri_status = this.objClaim.pri_status;
          }
          else {
            ormClaimSave_Pro.pri_status = undefined;
          }

          if (this.checkIfInsuranceExist("Secondary")) {
            ormClaimSave_Pro.sec_status = this.objClaim.sec_status;
          }
          else {
            ormClaimSave_Pro.sec_status = undefined;
          }

          if (this.checkIfInsuranceExist("Other")) {
            ormClaimSave_Pro.oth_status = this.objClaim.oth_status;
          }
          else {
            ormClaimSave_Pro.oth_status = undefined;
          }
        }

        if (this.objClaim.self_pay == true) {
          ormClaimSave_Pro.pat_status = undefined;
        }
        else {
          ormClaimSave_Pro.pat_status = this.objClaim.pat_status;
        }
      }

      ormClaimSave_Pro.pri_paid = this.objClaim.pri_paid;
      ormClaimSave_Pro.sec_paid = this.objClaim.sec_paid;
      ormClaimSave_Pro.oth_paid = this.objClaim.oth_paid;
      ormClaimSave_Pro.patient_paid = this.objClaim.patient_paid;
      ormClaimSave_Pro.amt_paid = this.objClaim.amt_paid;
      ormClaimSave_Pro.write_off = this.objClaim.write_off;
      ormClaimSave_Pro.allowed_amount = this.objClaim.allowed_amount;


      ormClaimSave_Pro.is_resubmitted = this.isClaim_Resubmit();
      if (ormClaimSave_Pro.is_resubmitted == true) {
        ormClaimSave_Pro.submission_status = undefined;
      }
      else {
        ormClaimSave_Pro.submission_status = this.objClaim.submission_status;
      }
    }
    else {
      ormClaimSave_Pro.client_date_created = this.clientDateTime;
      ormClaimSave_Pro.created_user = this.lookupList.logedInUser.user_name;

      ormClaimSave_Pro.coding_done_date = this.clientDateTime;

      ormClaimSave_Pro.icd_10_claim = true;

      if (this.claimFormGroup.get("chkSelfPay").value == true) {
        ormClaimSave_Pro.pat_status = "B";
      }

      ormClaimSave_Pro.amt_due = this.claimTotal;
      ormClaimSave_Pro.allowed_amount = this.claimTotal;

      ormClaimSave_Pro.pri_paid = 0;
      ormClaimSave_Pro.sec_paid = 0;
      ormClaimSave_Pro.oth_paid = 0;
      ormClaimSave_Pro.patient_paid = 0;
      ormClaimSave_Pro.amt_paid = 0;
      ormClaimSave_Pro.write_off = 0;
    }

    ormClaimSave_Pro.claim_total = this.claimTotal;
    ormClaimSave_Pro.draft = saveAsDraft;

    ormClaimSave_Pro.claim_type = this.claimType;

    ormClaimSave_Pro.patient_id = this.patientId;
    ormClaimSave_Pro.practice_id = this.lookupList.practiceInfo.practiceId;
    ormClaimSave_Pro.system_ip = this.lookupList.logedInUser.systemIp;
    ormClaimSave_Pro.client_date_modified = this.clientDateTime;
    ormClaimSave_Pro.modified_user = this.lookupList.logedInUser.user_name;

    ormClaimSave_Pro.listcpticd = this.getIcdCptSummary();

    ormClaimSave_Pro.dos = this.selectedDOSYYYYMMDD;//this.claimFormGroup.get("dpDOS").value;
    ormClaimSave_Pro.facility_id = this.claimFormGroup.get("ddFaciliy").value;

    if (this.claimFormGroup.get("ddFaciliy").value != undefined) {
      ormClaimSave_Pro.pos = this.selectedFacilityPOSCode;
    }

    debugger;
    ormClaimSave_Pro.location_id = this.claimFormGroup.get("ddLocation").value;
    ormClaimSave_Pro.attending_physician = this.claimFormGroup.get("ddAttendingPhysician").value;
    ormClaimSave_Pro.billing_physician = this.claimFormGroup.get("ddBillingPhysician").value;
    ormClaimSave_Pro.referring_physician = this.claimFormGroup.get("txtRefPhyIDHidden").value;
    ormClaimSave_Pro.self_pay = this.claimFormGroup.get("chkSelfPay").value;
    ormClaimSave_Pro.employment = this.claimFormGroup.get("chkEmployment").value;
    ormClaimSave_Pro.accident_auto = this.claimFormGroup.get("chAutoAccident").value;
    ormClaimSave_Pro.accident_other = this.claimFormGroup.get("chkOtherAccident").value;
    ormClaimSave_Pro.accident_emergency = this.claimFormGroup.get("chkEmergencey").value;
    ormClaimSave_Pro.accident_date = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get("dpAccidentDate").value);
    ormClaimSave_Pro.accident_state = this.claimFormGroup.get("ddStates").value;
    ormClaimSave_Pro.claim_number = this.claimFormGroup.get("txtClaimNo").value;
    ormClaimSave_Pro.luo = this.claimFormGroup.get("txtLUO").value;
    ormClaimSave_Pro.paper_payer_id = this.claimFormGroup.get("txtPaperPayerID").value;
    ormClaimSave_Pro.hcfa_17_a = this.claimFormGroup.get("txtHCFA_17_A").value;
    ormClaimSave_Pro.lmp_date = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get("dpLMP").value);
    ormClaimSave_Pro.xraydate = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get("dpLastXRay").value);
    ormClaimSave_Pro.pa_number = this.claimFormGroup.get("txtPriorAuthNo").value;
    ormClaimSave_Pro.medical_resubmision_code = this.claimFormGroup.get("txtResubmissionCode").value;
    ormClaimSave_Pro.start_care_date = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get("dpStartCareDate").value);
    ormClaimSave_Pro.hospital_from_date = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get("dpHospitalFrom").value);
    ormClaimSave_Pro.hospital_to_date = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get("dpHospitalTo").value);
    ormClaimSave_Pro.notes = this.claimFormGroup.get("txtNotes").value;
    ormClaimSave_Pro.lab_claim = this.claimFormGroup.get("chkLabClaim").value;
    ormClaimSave_Pro.outside_lab = this.claimFormGroup.get("chkOutsideLab").value;
    if (this.claimFormGroup.get("chkOutsideLab").value == true) {
      ormClaimSave_Pro.outside_lab_charges = this.claimFormGroup.get("txtOutsideLabCharges").value;
    }
    ormClaimSave_Pro.epsdt = this.claimFormGroup.get("chkEPSDT").value;
    ormClaimSave_Pro.aa = this.claimFormGroup.get("chkAA").value;
    ormClaimSave_Pro.is_corrected = this.claimFormGroup.get("chkIsCorrected").value;
    ormClaimSave_Pro.eap = this.claimFormGroup.get("chkEAP").value;
    ormClaimSave_Pro.billing_provider_taxonomy = this.claimFormGroup.get("ddBillingPhysicianTaxonomy").value;




    debugger;
    if (this.claimFormGroup.get("rbSubmissionOption").value == "hcfa") {
      ormClaimSave_Pro.is_hcfa = true;
      ormClaimSave_Pro.hcfa_ins_type = this.claimFormGroup.get("ddHCFAInsurance").value;
    }
    else {
      ormClaimSave_Pro.is_electronic = true;
    }
    ormClaimSave_Pro.not_bill = this.claimFormGroup.get("chkDoNotBill").value;
    ormClaimSave_Pro.followup = this.claimFormGroup.get("chkFolowUp").value;


    debugger;
    return ormClaimSave_Pro;
    // END claim

  }

  onSubmit(isDraft: boolean) {
    debugger;

    let strAlertMsg: string = "";

    if (!isDraft) {
      strAlertMsg = this.ValidateClaimData();
    }

    if (strAlertMsg == "") {
      strAlertMsg = this.validateDateFormates();
    }

    if (strAlertMsg != "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Validation', strAlertMsg, AlertTypeEnum.DANGER);
    }
    else {


      if (this.claimId != undefined &&
        (
          (this.objClaim.pri_status != undefined && this.objClaim.pri_status != "")
          || (this.objClaim.sec_status != undefined && this.objClaim.sec_status != "")
          || (this.objClaim.oth_status != undefined && this.objClaim.oth_status != "")
          || (this.objClaim.pat_status != undefined && this.objClaim.pat_status != "")
        )) {

        const modalRef = this.ngbModal.open(AddEditClaimNoteComponent, this.popUpOptionsLarge);
        modalRef.componentInstance.openedClaimInfo = this.openedClaimInfo;
        modalRef.componentInstance.callingFrom = CallingFromEnum.CLAIM_ENTRY;

        modalRef.result.then((result) => {
          debugger;
          if (result) {
            this.saveClaim(isDraft)
          }
        }, (reason) => {
          this.isSaving = false;

        });

      }
      else {
        this.saveClaim(isDraft)
      }
    }
  }

  saveClaim(isDraft: boolean) {

    this.isSaving = true;

    this.clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    let ormClaimSave_Pro: ClamSavePro = this.populateClaimSaveObject(isDraft)
    let lstDiagnosisSavePro: Array<ClaimDiagnosisSavePro> = this.populateDiagnosisSaveObject();
    let lstProceduresSavePro: Array<ClaimProceduresSavePro> = this.populateProceduresSaveObject();
    let lstClaimInsuranceSave: Array<ClaimInsuranceSave> = this.populateClaimInsuranceSaveObject();

    let wrapperClaimSavePro: WrapperClaimSavePro = new WrapperClaimSavePro();
    wrapperClaimSavePro.claimSave_Pro = ormClaimSave_Pro;
    wrapperClaimSavePro.lstClaimDiagnosisSave_Pro = lstDiagnosisSavePro;
    wrapperClaimSavePro.lstClaimProceduresSave_Pro = lstProceduresSavePro;
    wrapperClaimSavePro.lstClaimInsuranceSave = lstClaimInsuranceSave;

    wrapperClaimSavePro.lstDiagIdsDeleted = this.lstDeletedDiagnosis;
    wrapperClaimSavePro.lstProcIdsDeleted = this.lstDeletedProcedures;
    wrapperClaimSavePro.lstInsIdsDeleted = this.lstDeletedInsurances;

    //console.log(wrapperClaimSavePro);


    this.claimService.saveClaimPro(wrapperClaimSavePro).subscribe(
      data => {

        this.saveClaimProSuccess(data);
      },
      error => {
        this.saveClaimProError(error);
      }
    );

  }




  saveClaimProSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      //this.activeModal.close(true);
      this.isSaving = false;
      this.claimId = Number(data.result);
      this.onClaimSaved.emit(this.claimId);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isSaving = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Save', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveClaimProError(error: any) {
    this.isSaving = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Save', "An Error Occured while saving claim.", AlertTypeEnum.DANGER)
  }

  shiftFocusToDiagSearch() {
    if (this.showDiagSearch) {
      this.inlineClaimDiagSearch.focusFirstIndex();
    }
  }

  shiftFocusToProcSearch() {
    if (this.showProcSearch) {
      this.inlineClaimProcSearch.focusFirstIndex();
    }
  }

  showHideProcDescription() {
    this.lookupList.showClaimProcDescription = !this.lookupList.showClaimProcDescription;
  }

  shiftFocusToInsSearch(insId: number) {

    if (this.showInsuranceSearch(insId)) {
      this.inlineClaimInsSearch.focusFirstIndex();
    }
  }

  shiftFocusToRefSearch() {
    if (this.showRefPhySearch) {
      this.inlineRefSearch.focusFirstIndex();
    }
  }


  onImportIcdCdptCancelCallBack() {
    this.showImportICDCPT = false;
    this.showSuperBill = false;
    this.showImportIcdCptModule.emit(false);
  }
  addImportInsurance(result) {
    debugger
    //let id: Number = -1;
    this.tempClaimInsuranceId--;
    //
    // if (this.lstClaimInsurance.length > 0) {
    //  id = (this.lstClaimInsurance.length + 1) * -1;
    // }
    // else {
    //  id = -1;
    //}
    this.isInsuranceExists = true;

    if (this.lstClaimInsurance == undefined) {
      this.lstClaimInsurance = new Array<any>();
    }

    let ins: any = {
      claiminsurance_id: this.tempClaimInsuranceId,
      insurace_type: result.insurace_type,
      insurance_id: result.insurance_id,
      name: result.name,
      address: result.address,
      phone: result.phone,
      guarantor_id: result.guarantor_id,
      guarantor_name: result.guarantor_name,
      guarantor_relationship: result.guarantor_relationship,
      policy_number: result.policy_number,
      group_number: result.group_number,
      copay: 0,
      start_date: result.start_date,
      end_date: result.end_date,
      workercomp_name: result.workercomp_name,
      workercomp_address: result.workercomp_address,
      workercomp_city: result.workercomp_city,
      workercomp_state: result.workercomp_state,
      workercomp_zip: result.workercomp_zip,
      elig_date: '',
      elig_status: '',
      elig_response: '',
      add_edit_flag: true
    };
    this.lstClaimInsurance.push(ins);
    //this.createInsuranceControls();
    this.addInsuranceControlsToFormGroup(ins);
  }

  /*
  onImportInsurance(status: string) {
    this.importInsurance = false;
    const modalRef = this.ngbModal.open(ImportPatientInsuranceComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.status = status;
    modalRef.componentInstance.calling_from = CallingFromEnum.PATIENT_CLAIM;

    modalRef.result.then((result) => {
      debugger;
      let insFound = false;
      if (result != null) {
        if (this.lstClaimInsurance.length > 0) {
          //Remove previous insurance
          for (let i = 0; i < this.lstClaimInsurance.length; i++) {
            if (this.lstClaimInsurance[i].insurace_type.toString().toLowerCase() == result.insurace_type.toString().toLowerCase()) {
              this.importInsurance = true;
              insFound = true;
              this.onRemoveInsurance(this.lstClaimInsurance[i].claiminsurance_id, this.lstClaimInsurance[i].name, result);
              break;
            }
          }
          if (!insFound) {
            this.addImportInsurance(result);
          }
        }
        else {
          this.addImportInsurance(result);
        }
      }
    },
      (reason) => {
        //alert(reason);
      });
  }
  */
  /*
  openImportIcdCpt() {

    let obj = {
      claimIcdCount: this.lstClaimDiagnosis.length,
      claimDOS: this.claimFormGroup.get('dpDOS').value,
      claimRulesInfo: this.patientClaimRuleInfo,
      claimProviderId: this.claimFormGroup.get('ddAttendingPhysician').value,
      claimLocationId: this.claimFormGroup.get('ddLocation').value,
    };

    this.onImportIcdCpt.emit(obj);
  }
  */


  onDOSChangeInput(event: any) {
    this.dosChangeCallingFrom = "input_field";
  }
  onDOSChangeInputKeydown(event: any) {
    this.dosChangeCallingFrom = "input_field";
  }
  onDateFocusOut(date: string, controlName: string) {

    // console.log('focus out Called:');
    let formatedDate: DateModel = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined) {

      let isDOSChanged: boolean = false;
      let prevDate: string = this.dateTimeUtil.getStringDateFromDateModelWithFormat(formatedDate, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);
      if (controlName == "dpDOS" && this.selectedDOSYYYYMMDD != prevDate) {
        isDOSChanged = true;
      }

      this.dosChangeCallingFrom = "focus_out";
      this.claimFormGroup.get(controlName).setValue(formatedDate);


      if (controlName == "dpDOS" && isDOSChanged) {
        // console.log('focus out:' + this.isDOSChanged + ' ' + this.selectedDOSYYYYMMDD);
        this.DOSPostChangeUpdate();
      }

      if (controlName.startsWith('dpDOSFrom_')) {
        let dosToCtrlName: string = 'dpDOSTo_' + controlName.split('_')[1];
        this.claimFormGroup.get(dosToCtrlName).setValue(formatedDate);
      }
    }
    else {
      this.dosChangeCallingFrom = "focus_out";
      this.claimFormGroup.get(controlName).setValue(null);
    }
  }

  onDOSChange(date: any) {
    //console.log('onDOSChange Called:');
    //this.isDOSChanged = true;

    debugger;

    if (this.dosChangeCallingFrom != 'input_field') {
      this.selectedDOSYYYYMMDD = this.dateTimeUtil.getStringDateFromDateModelWithFormat(
        date,
        DateTimeFormat.DATEFORMAT_YYYY_MM_DD);// event.target.value;

      if (this.dosChangeCallingFrom != "focus_out" && this.dosChangeCallingFrom != "loading") {
        this.DOSPostChangeUpdate();
      }

    }
    //console.log('Channge' + this.isDOSChanged + ' ' + this.selectedDOSYYYYMMDD);

    this.dosChangeCallingFrom = "";

  }
  DOSPostChangeUpdate() {

    //if (this.isDOSChanged) {
    //this.selectedDOSYYYYMMDD = this.dateTimeUtil.getStringDateFromDateModelWithFormat(this.claimFormGroup.get("dpDOS").value(),DateTimeFormat.DATEFORMAT_YYYY_MM_DD) ;// event.target.value;
    //this.isDOSChanged = false;
    if (this.openedClaimInfo.operationType == OperationType.ADD) {
      this.laodChartFollowUpCodes();
    }
    //}


    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
      modalRef.componentInstance.promptMessage = 'Do you want to change DOS in Procedures?';
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      let closeResult;

      modalRef.result.then((result) => {
        debugger;
        if (result == PromptResponseEnum.YES) {

          let dateModel: DateModel = this.dateTimeUtil.getDateModelFromDateString(this.selectedDOSYYYYMMDD, DateTimeFormat.DATEFORMAT_YYYY_MM_DD);

          this.lstClaimProcedures.forEach(proc => {
            proc.dos_from = this.selectedDOSYYYYMMDD;
            proc.dos_to = this.selectedDOSYYYYMMDD;

            this.claimFormGroup.get("dpDOSFrom_" + proc.claim_procedures_id).setValue(dateModel);
            this.claimFormGroup.get("dpDOSTo_" + proc.claim_procedures_id).setValue(dateModel);

          });
        }
      }, (reason) => {
        //alert(reason);
      });

    }

  }

  EligReqProcessing(ins, index) {

    debugger;
    let type = '';
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "check_live", value: "true", option: "" },
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "claim_id", value: this.claimId == undefined ? 0 : this.claimId, option: "" },
      { name: "id", value: ((this.addEditOperation == OperationType.ADD) ? ins.insurance_id : ins.claiminsurance_id), option: "" },
      { name: "id_type", value: "claim", option: "" },
      { name: "insurance_type", value: ins.insurace_type.toString().toUpperCase(), option: "" },
      { name: "policy_no", value: ins.policy_number.toString().toUpperCase(), option: "" },
      { name: "dos", value: this.dateTimeUtil.convertDateTimeFormat(this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get('dpDOS').value), DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_YYYYMMDD), option: "" }
    ];
    //this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYYMMDD)
    debugger;
    this.eligibilityService.getClaimElibility(searchCriteria).subscribe(
      data => {
        debugger;
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.onEligibilityResponse(data, ins.insurace_type.toString().toUpperCase(), index);
        }
        else if (data['status'] === ServiceResponseStatusEnum.ERROR) {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Eligibility', data['response'], AlertTypeEnum.DANGER)
        }
        else if (data['status'] === ServiceResponseStatusEnum.NOT_FOUND) {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Eligibility', data['response'], AlertTypeEnum.INFO)
        }

      },
      error => {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Eligibility', error.message, AlertTypeEnum.DANGER)
      }
    );
  }
  onEligibilityResponse(data, type, index) {
    let insStatusMsg: string = '';
    debugger;
    this.lstClaimInsurance[index].elig_status = data['response_list'][0].eligibility_status;
    this.lstClaimInsurance[index].elig_date = this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get('dpDOS').value);
    this.lstClaimInsurance[index].elig_response = data['result'];
  }

  showEligibility(ins) {
    debugger;

    if (ins.insurance_id == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Elibibility', ins.insurace_type.toUpperCase() + " insurance not found.", AlertTypeEnum.INFO)
      return;
    }

    const modalRef = this.ngbModal.open(PatientEligibilityComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.id = ins.claiminsurance_id;
    modalRef.componentInstance.idType = "claim";
    modalRef.componentInstance.checkLive = false;
    modalRef.componentInstance.insuranceType = ins.insurace_type.toLowerCase();
    modalRef.componentInstance.dos = this.dateTimeUtil.convertDateTimeFormat(this.dateTimeUtil.getStringDateFromDateModel(this.claimFormGroup.get('dpDOS').value), DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_YYYYMMDD);
    modalRef.componentInstance.policy_number = ins.policy_number;

  }

  onMoveInsurance(ins: any, insTypeFrom: string, insTypeTo: string) {

    debugger;

    this.lstClaimInsurance.forEach(claimIns => {
      debugger;
      if (claimIns.claiminsurance_id == ins.claiminsurance_id) {
        claimIns.insurace_type = insTypeTo;
        claimIns.add_edit_flag = true;

      }
      else if (claimIns.claiminsurance_id != ins.claiminsurance_id && claimIns.insurace_type == insTypeTo) {

        claimIns.insurace_type = insTypeFrom;
        claimIns.add_edit_flag = true;

      }
    });

    this.lstClaimInsurance = GeneralOperation.arrangeInsuranceOrder(this.lstClaimInsurance);
    /*
    let indexFrom: number = GeneralOperation.getIndexForInsuranceEntry(this.lstClaimInsurance, insTypeTo);
    let indexTo: number = GeneralOperation.getIndexForInsuranceEntry(this.lstClaimInsurance, insTypeFrom);


    debugger;
    if (indexFrom >= 0 && indexTo >= 0) {
      let insFrom: any = this.lstClaimInsurance[indexFrom];
      let insTo: any = this.lstClaimInsurance[indexTo];

      this.lstClaimInsurance[indexFrom] = insTo;      
      this.lstClaimInsurance[indexTo] = insFrom;
    }
    */
  }

  importInsurance = false;
  onImportInsurance(status: string) {
    //this.importInsurance = false;
    const modalRef = this.ngbModal.open(ImportPatientInsuranceComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.status = status;
    modalRef.componentInstance.calling_from = CallingFromEnum.PATIENT_CLAIM;
    modalRef.result.then((result) => {
      debugger;
      //let insFound = false;
      if (result != null) {
        if (this.lstClaimInsurance.length > 0) {
          //Remove previous insurance
          for (let i = this.lstClaimInsurance.length - 1; i >= 0; i--) {
            if (this.lstClaimInsurance[i].insurace_type.toString().toLowerCase() == result.insurace_type.toString().toLowerCase()) {
              //this.importInsurance = true;
              //insFound = true;
              //this.onRemoveInsurance(this.lstClaimInsurance[i].claiminsurance_id, this.lstClaimInsurance[i].name, result);
              //break;

              let id: number = this.lstClaimInsurance[i].claiminsurance_id;
              this.lstClaimInsurance.splice(i, 1);
              if (id > 0) {
                if (this.lstDeletedInsurances == undefined) {
                  this.lstDeletedInsurances = new Array<number>();
                }
                this.lstDeletedInsurances.push(id);
              }
            }
          }


          //if (!insFound) {
          // this.addImportInsurance(result);
          //}
        }
        // else {
        this.addImportInsurance(result);
        this.lstClaimInsurance = GeneralOperation.arrangeInsuranceOrder(this.lstClaimInsurance);
        //}
      }
    },
      (reason) => {
        //alert(reason);
      });
  }

  printHCFA(insuranceType: string) {

    const modalRef = this.ngbModal.open(HcfaPrintOptionPopupComponent, this.popUpOptions);
    let closeResult;

    modalRef.result.then((result) => {
      debugger;

      if (result != null) {

        if (result.confirmation == PromptResponseEnum.OK) {
          let printWithBg: boolean = result.printWithBg;

          this.lstSubmissionProccessedClaimInfo = undefined;
          this.isProcessing = true;
          let searchCriteria: SearchCriteria = new SearchCriteria();
          searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
          searchCriteria.param_list = [
            { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" },
            { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: "" },
            { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
            { name: "claim_ids", value: this.claimId, option: "" },
            { name: "bill_to_insurance_type", value: insuranceType, option: "" },
            { name: "with_bg", value: printWithBg, option: "" }
          ];

          this.billingService.generateHCFA(searchCriteria).subscribe(
            data => {
              this.printHCFASuccess(data);
            },
            error => {
              this.printHCFAError(error);
            }
          );
        }
      }

    }, (reason) => {
      //alert(reason);
    });
  }

  lstSubmissionProccessedClaimInfo: Array<SubmissionProccessedClaimInfo>;

  printHCFASuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.isProcessing = false;
      //this.activeModal.close(true);
      //this.isProcessing = false;
      //this.claimId = Number(data.result);
      // this.onClaimSaved.emit(this.claimId);
      this.openHcfa(data.response);
      this.lstSubmissionProccessedClaimInfo = data.response_list;

      //this.openDocument(data.response)
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isProcessing = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', data.response, AlertTypeEnum.DANGER)
    }
  }

  printHCFAError(error: any) {
    this.isProcessing = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', "An Error Occured while generating HCFA.", AlertTypeEnum.DANGER)
  }

  openHcfa(hcfaLink: string) {

    debugger;

    this.isProcessing = true;
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    //searchCriteria.criteria = this.downloadPath + "/" + document.link;    
    searchCriteria.param_list = [
      { name: "category", value: 'HCFA', option: "" },
      { name: "link", value: hcfaLink, option: "" }
    ];

    this.generalService.getDocumentBytes(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.isProcessing = false;
          if (data != null && data != undefined) {
            this.openHcfaResponse(data);
          }
          else {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', "HCFA File not found.", AlertTypeEnum.DANGER)
          }
        },
        error => {
          alert(error);
          this.isProcessing = false;
        }
      );

  }

  openHcfaResponse(data: any) {

    this.isProcessing = false;
    var file = new Blob([data], { type: 'application/pdf' });//, {type: 'application/pdf'}
    var fileURL = URL.createObjectURL(file);
    const modalRef = this.ngbModal.open(HcfaViewerComponent, this.popUpOptionsLarge);
    modalRef.componentInstance.url = fileURL;

    modalRef.result.then((result) => {
      this.updateProcessedClaims();
    }
      , (reason) => {

        this.updateProcessedClaims();

      });
  }

  updateProcessedClaims() {

    if (this.lstSubmissionProccessedClaimInfo != undefined) {

      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Claim Status!';
      modalRef.componentInstance.promptMessage = 'Do you want to mark claim as Processed?';
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      let closeResult;

      modalRef.result.then((result) => {
        debugger;
        if (result == PromptResponseEnum.YES) {
          this.isProcessing = true;

          this.lstSubmissionProccessedClaimInfo.forEach(element => {
            (element as SubmissionProccessedClaimInfo).add_claim_note = true;
          });

          this.billingService.updateProcessedClaims(this.lstSubmissionProccessedClaimInfo).subscribe(
            data => {
              //if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {

              //}
              //else 
              if (data['status'] === ServiceResponseStatusEnum.ERROR) {
                this.isProcessing = false;
                GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', data['response'], AlertTypeEnum.DANGER)
              }
              this.isProcessing = false;
            },
            error => {
              debugger;
              this.isProcessing = false;
              GeneralOperation.showAlertPopUp(this.ngbModal, 'HCFA', "An Error Occured saving record..", AlertTypeEnum.DANGER)
            }
          );
        }
      }, (reason) => {
        //alert(reason);
      });

    }

  }

  onPaste(event: ClipboardEvent, controlName: string) {
    debugger;
    event.preventDefault();

    var pastedText = '';

    if (event.clipboardData && event.clipboardData.getData) {// Standards Compliant FIRST!
      pastedText = event.clipboardData.getData('text/plain');
    }
    //else if (window.clipboardData && window.clipboardData.getData)
    //{// IE
    //    pastedText = window.clipboardData.getData('Text');
    //}

    this.claimFormGroup.get(controlName).setValue(pastedText.trim());

    // Mark control as dirty mannualy because with event.preventDefault() control is not marked dirty by default 
    this.claimFormGroup.controls[controlName].markAsDirty();
  }

  printPatientReceipt() {
    const modalRef = this.ngbModal.open(PatientClaimReceiptPrintComponent, this.popUpOptionsLarge);
    modalRef.componentInstance.claimId = this.claimId;
  }

  GetBillingProviderTaxonomyList() {

    this.lstBillingProviderTaxonomyList = undefined;
    this.claimFormGroup.get("ddBillingPhysicianTaxonomy").setValue('');
    let selectedBillingPhy: number = this.claimFormGroup.get("ddBillingPhysician").value;
    if (selectedBillingPhy != undefined) {
      this.claimService.GetBillingProviderTaxonomyList(this.lookupList.practiceInfo.practiceId, selectedBillingPhy).subscribe(
        data => {
          this.lstBillingProviderTaxonomyList = data as Array<any>;
          if (this.openedClaimInfo.operationType == OperationType.EDIT) {

            for (let index = 0; index < this.lstBillingProviderTaxonomyList.length; index++) {
              if (this.billingProviderTaxonomy == this.lstBillingProviderTaxonomyList[index].taxonomy_id) {
                this.claimFormGroup.get("ddBillingPhysicianTaxonomy").setValue(this.billingProviderTaxonomy);
                break;
              }
            }
          }
        },
        error => {
          //this.preDataPopulateCount--;
          //this.isLoading = false;
          this.GetBillingProviderTaxonomyListError(error);
        }
      );
    }
  }


  GetBillingProviderTaxonomyListError(error) {
    this.logMessage.log("GetBillingProviderTaxonomyList Error." + error);
  }

  onBillingPhysicianChange() {
    this.GetBillingProviderTaxonomyList();
  }

  onLocationChange(index: number) {
    debugger;
    if (this.openedClaimInfo.operationType == OperationType.ADD) {

      if (this.lookupList.locationList[index].facility_id != null && this.lookupList.locationList[index].facility_id != undefined
        && this.lookupList.locationList[index].facility_id != '') {

        for (let i = 0; i < this.lookupList.facilityList.length; i++) {
          debugger;
          if (this.lookupList.facilityList[i].id == this.lookupList.locationList[index].facility_id) {
            this.defaultFacilityId = this.lookupList.facilityList[i].id;
            this.selectedFacilityPOSCode = this.lookupList.facilityList[i].pos_code;
            this.claimFormGroup.get("ddFaciliy").setValue(this.defaultFacilityId);
            this.onFacilityChange(i);
            break;
          }
        }
      }
      else {

        for (let i = 0; i < this.lookupList.facilityList.length; i++) {
          debugger;
          if (this.lookupList.facilityList[i].is_default == true) {
            this.defaultFacilityId = this.lookupList.facilityList[i].id;
            this.selectedFacilityPOSCode = this.lookupList.facilityList[i].pos_code;
            this.claimFormGroup.get("ddFaciliy").setValue(this.defaultFacilityId);
            this.onFacilityChange(i);
            break;
          }
        }

      }
    }
  }
}
