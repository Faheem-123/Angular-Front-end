import { Component, OnInit, Input, Inject, DebugNode, Output, EventEmitter, ViewChild } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';
import { GeneralService } from '../../../../services/general/general.service';
import { LOOKUP_LIST, LookupList } from '../../../../providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomValidators, datetimeValidator } from '../../../../shared/custome-validators';
import { ListFilterPipe } from '../../../../shared/list-filter-pipe';
import { DateTimeUtil, DateTimeFormat } from '../../../../shared/date-time-util';
import { ORMKeyValue } from '../../../../models/general/orm-key-value';
import { NgbModal, NgbModalOptions, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NextOfKinPopupComponent } from '../next-of-kin-popup/next-of-kin-popup.component';
import { PatientInsuranceAddEditPopupComponent } from '../../../../general-modules/insurance/patient-insurance-add-edit-popup/patient-insurance-add-edit-popup.component';
import { PatientCareTeamAddEditPopupComponent } from '../patient-care-team-add-edit-popup/patient-care-team-add-edit-popup.component';
import { PatientCareTeamMemberAddEditPopupComponent } from '../patient-care-team-member-add-edit-popup/patient-care-team-member-add-edit-popup.component';
import { ORMSavePatient } from '../../../../models/patient/orm-save-patient';
import { ORMSavePatientRaceEthnicity } from '../../../../models/patient/orm-save-patient-race-ethnicity';
import { ORMSavePatientInsurance } from '../../../../models/patient/orm-save-patient-insurance';
import { ORMSavePatientNextOfKin } from 'src/app/models/patient/orm-save-next-of-kin';
import { ORMSavePatientImmRegInfo } from 'src/app/ehr-modules/immunization-registry/orm-save-imm-reg-info';
import { ORMSavePatientCareTeam } from 'src/app/models/patient/orm-save-care-team';
import { ORMSavePatientCareTeamMember } from 'src/app/models/patient/orm-save-care-team-member';
import { PatientSaveObjectWrapper } from 'src/app/models/patient/patient-save-object-wrapper';
import { ServiceResponseStatusEnum, CallingFromEnum, PromptResponseEnum, AlertTypeEnum, OperationType } from 'src/app/shared/enum-util';
import { CameraCapturePopupComponent } from 'src/app/general-modules/camera-capture-popup/camera-capture-popup.component';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { DwtComponent } from 'src/app/general-modules/dwt/dwt.component';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { DateModel } from 'src/app/models/general/date-model';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PrintDemographicsComponent } from '../print-demographics/print-demographics.component';
import { InlineInsuranceSearchComponent } from 'src/app/general-modules/insurance/inline-insurance-search/inline-insurance-search.component';
import { SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ImportPatientInsuranceComponent } from 'src/app/general-modules/insurance/import-patient-insurance/import-patient-insurance.component';
import { DecimalPipe } from '@angular/common';


@Component({
    selector: 'patient-info',
    templateUrl: './patient-info.component.html',
    styleUrls: ['./patient-info.component.css']
})
export class PatientInfoComponent implements OnInit {

    @Input() patientId: number;
    @Input() addEditOperation: OperationType;
    @Input() callingFrom: string = "PATIENT";

    @Output() onSave = new EventEmitter<any>();
    @Output() onCancel = new EventEmitter<any>();

    @ViewChild('inlinePatientInsSearch') inlinePatientInsSearch: InlineInsuranceSearchComponent;


    selectedMenuItem: string = 'patient_info';

    patInfoFormGroup: FormGroup;

    patient: any;
    lstPatInsurance: Array<any>;
    lstNextOfKin: Array<any>;
    lstPatRace: Array<any>;
    lstPatCDCRace: Array<any>;
    lstPatEthnicity: Array<any>;
    lstPatCDCEthnicity: Array<any>;
    lstPatOMBRace: Array<any>;
    lstPatOMBEthnicity: Array<any>;
    lstPatRaceEthnicityFromDB: Array<any>;
    //patientImmRegInfo: any;
    lstPatientCareTeams: Array<any>;
    lstPatientCareTeamMembers: Array<any>;

    viewOnly: boolean = true;
    isLoading: boolean = true;
    showSSN: boolean = false;
    isSaving: boolean = false;
    //isInsuranceExists: boolean = false;
    isAllInsurancesEntered: boolean = false;

    isSelfPay: boolean = false;
    maskedSSN: string = "";
    prePopulateCount: number = 0;
    loadingCount: number = 0;
    editMode: boolean = false;
    isPatPicChanged: boolean = false;

    isMultiBirth: boolean = false;
    isInterpertureRequired: boolean = false;
    lstBirthOrder: Array<string> = ["", "1", "2", "3", "4", "5", "6", "7", "8"];
    lstPatStatus: Array<string> = ["ACTIVE", "INACTIVE", "CLINIC DISCHARGED", "PHYSICIAN DISCHARGED", "DECEASED", "NEVER SEEN"];
    lstContactRelationship: Array<string> = ["", "PARENT", "FRIEND", "SPOUSE", "CHILD", "RELATIVE", "OTHER"];
    lstPrimaryPhoneType: Array<string> = ["CELL PHONE", "HOME PHONE", "WORK PHONE"];
    listConfContactType: Array<string> = ["EMAIL", "PHONE", "MAIL"];
    lstAdvanceDirectives: Array<string> = ["", "Yes", "No", "Declined", "Request for more info", "On File"];
    lstCountryParishCode: Array<any>;
    loadingInsurance: boolean = true;
    showRaceSearch: boolean = false;
    showRefPhySearch: boolean = false;
    showPatientSubscriberSearch: boolean = false;
    showEthnicitySearch: boolean = false;

    lstZipCityState: Array<any>;
    state: string;
    birthDateModel: any;
    disabledDateModel: DateModel;
    deathDateModel: DateModel;


    isZipChanged: boolean = false;
    isZipLoading: boolean = false;
    iscountryCodeLoading: boolean = false;

    lstShowInsuranceSearch: Array<ORMKeyValue> = [];
    lstShowInsuranceSubscriberSearch: Array<ORMKeyValue> = [];
    lstInsuranceWCCities: Array<any> = [];

    genderIdentityreDescription: string = "";
    sexualOrientationDescription: string = "";
    genderDescription: string = "";
    maritalStatus: string = "";
    languageDescription: string = "";
    immRegPublicityCodeDescription: string = "";

    raceEthnicityDeletedIds: string = "";
    insuranceDeletedIds: string = "";
    nokDeletedIds: string = "";
    careTeamDeletedIds: string = "";
    careTeamMemberDeletedIds: string = "";

    downloadPath: string;
    uploadPath: string;

    patientName: string = "lName, fName";

    tempPatInsuranceId: number = 0;

    uniqueModuleId: string = "";


    popupUpOptionsCamera: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        size: 'sm'
    };

    popUpOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false
    };
    insPopUpOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false
        //size: 'lg'
    };

    lgPopUpOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        size: 'lg'
    };

    nokOperation: string = "";
    insOperation: string = "";

    clientDateTime: string = "";

    constructor(
        private formBuilder: FormBuilder,
        private patientService: PatientService,
        private generalService: GeneralService,
        @Inject(LOOKUP_LIST) public lookupList: LookupList,
        private logMessage: LogMessage,
        private dateTimeUtil: DateTimeUtil,
        private ngbModal: NgbModal,
        private decimalPipe: DecimalPipe) { }


    ngOnInit() {

        this.uniqueModuleId = "pat_" + (this.patientId == undefined ? 'New' : this.patientId);

        //console.log('PatientInfo PatientID:' + this.patientId);
        this.patPicURL = this.lookupList.defaultPatPicLg;


        if (this.lookupList.lstMaritalStatus == undefined || this.lookupList.lstMaritalStatus.length == 0) {

            this.prePopulateCount++;
            this.getMaritalStatusList();
        }

        if (this.lookupList.lstLanguages == undefined || this.lookupList.lstLanguages.length == 0) {

            this.prePopulateCount++;
            this.getLanguageList();
        }

        if (this.lookupList.lstGenderIdentity == undefined || this.lookupList.lstGenderIdentity.length == 0) {

            this.prePopulateCount++;
            this.getGenderIdentityList();
        }
        if (this.lookupList.lstSexualOrientation == undefined || this.lookupList.lstSexualOrientation.length == 0) {

            this.prePopulateCount++;
            this.getSexualOrientationList();
        }

        if (this.lookupList.lstOMBRace == undefined || this.lookupList.lstOMBRace.length == 0) {

            this.prePopulateCount++;
            this.getOMBRaceList();
        }
        if (this.lookupList.lstOMBEthnicity == undefined || this.lookupList.lstOMBEthnicity.length == 0) {

            this.prePopulateCount++;
            this.getOMBEthnicityList();
        }




        if (this.prePopulateCount == 0) {
            this.loadPatientData(false);
        }


        if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
            this.downloadPath = this.lookupList.lstdocumentPath[0].download_path;
            this.uploadPath = this.lookupList.lstdocumentPath[0].upload_path;
            // console.log("downloadPath: " + this.downloadPath);
        }

        //this.buildForm();

    }

    loadPatientData(isReload: Boolean) {

        debugger;

        if (!isReload) {
            this.buildForm();
        }


        if (this.patientId != undefined) {

            this.isLoading = true;
            this.loadingCount = 6;
            this.getPatientInfo();
            this.getPatientRaceEthnicty();
            this.getPatientNextOfKin();
            // this.getPatientImmRegInfo();
            this.getPatientCareTeams();
            this.getPatientCareTeamMembers();
            this.getPatientInsurance();

        }
        else if (this.addEditOperation == OperationType.ADD) {

            this.populateRaceCDC();
            this.populateEthnicityCDC();

            this.patInfoFormGroup.get('ddPreferredLanguage').setValue("en");
            this.patInfoFormGroup.get('rbInterpreterRequired').setValue(false);
            this.patInfoFormGroup.get('ddPrimaryPhone').setValue('CELL PHONE');

            this.editMode = true;
            this.isLoading = false;
        }
    }
    checkIfLoadingCompleted() {
        if (this.loadingCount == 0) {
            this.isLoading = false;

            if (this.addEditOperation == OperationType.EDIT && (this.callingFrom == CallingFromEnum.PATIENT_SEARCH || this.callingFrom == CallingFromEnum.SCHEDULER)) {
                this.editMode = true;
                this.assignValues();
            }
        }
    }

    buildForm() {


        this.patInfoFormGroup = this.formBuilder.group({
            //  patPic: this.formBuilder.control(null),
            txtPatTitle: this.formBuilder.control(null),
            txtPatFName: this.formBuilder.control(null, Validators.required),
            txtPatMName: this.formBuilder.control(null),
            txtPatLName: this.formBuilder.control(null, Validators.required),
            txtPatSuffix: this.formBuilder.control(null),
            txtPatPrevName: this.formBuilder.control(null),
            ddPatStatus: this.formBuilder.control(this.addEditOperation == OperationType.ADD ? "ACTIVE" : null, Validators.required),
            dpBirthDate: this.formBuilder.control(null, Validators.compose([
                Validators.required,
                datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
            ])),
            ddGender: this.formBuilder.control(null, Validators.required),
            ddMaritalStatus: this.formBuilder.control(null),
            txtSSN: this.formBuilder.control(null),
            ddPreferredLanguage: this.formBuilder.control(null),
            rbInterpreterRequired: this.formBuilder.control(null),
            txtMotherFName: this.formBuilder.control(null),
            txtMotherLName: this.formBuilder.control(null),
            ddMultiBirthIndicator: this.formBuilder.control(null),
            ddBirthOrder: this.formBuilder.control(null),
            ddGenderIdentity: this.formBuilder.control(null),
            txtOtherGenderIdentity: this.formBuilder.control(null),
            ddSexualOrientation: this.formBuilder.control(null),
            txtOtherSexualOrientation: this.formBuilder.control(null),
            chkRaceDeclined: this.formBuilder.control(null),
            chkEthnicityDeclined: this.formBuilder.control(null),

            txtAddressL1: this.formBuilder.control(null),
            txtAddressL2: this.formBuilder.control(null),
            txtZipCode: this.formBuilder.control(null),
            //txtState: this.formBuilder.control(null),
            ddCity: this.formBuilder.control(null),
            ddParishcode: this.formBuilder.control(null),
            ddPrimaryPhone: this.formBuilder.control(null),
            txtCellPhone: this.formBuilder.control(null),
            txtHomePhone: this.formBuilder.control(null),
            txtWorkPhone: this.formBuilder.control(null),
            txtEmail: this.formBuilder.control(null),
            ddCommPreference: this.formBuilder.control(null),
            txtCommDetail: this.formBuilder.control(null),
            txtEmrContactPerson: this.formBuilder.control(null),
            ddEmrContactRelationship: this.formBuilder.control(null),
            txtEmrContactNo: this.formBuilder.control(null),

            ddPrimaryPhy: this.formBuilder.control(null),
            ddLocation: this.formBuilder.control(null),
            txtPatientSubscriber: this.formBuilder.control(null),
            txtPatientSubscriberIDHidden: this.formBuilder.control(null),
            txtRefPhy: this.formBuilder.control(null),
            txtRefPhyIDHidden: this.formBuilder.control(null),
            ddAdvanceDirective: this.formBuilder.control(null),
            txtAnnualIncome: this.formBuilder.control(null),
            txtFamilySize: this.formBuilder.control(null),
            txtComments: this.formBuilder.control(null),
            dpDisabledDate: this.formBuilder.control(null, Validators.compose([
                datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
            ])),
            dpDeathDate: this.formBuilder.control(null, Validators.compose([
                datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
            ])),
            txtDeathReason: this.formBuilder.control(null),
            chkTransisionOfCare: this.formBuilder.control(null),
            chkBlockRemCalls: this.formBuilder.control(null),
            chkDontSendStatement: this.formBuilder.control(null),
            chkAccessRestricted: this.formBuilder.control(null),
            chkIsDental: this.formBuilder.control(null)
            //chkSelfpay: this.formBuilder.control(null)

            /*
            ddImmRegStatus: this.formBuilder.control(null),
            dpImmRegStatusEffectiveDate: this.formBuilder.control(null, Validators.compose([
                datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
            ])),

            ddImmRegPublicityCode: this.formBuilder.control(null),
            dpImmRegPublicityCodeEffectiveDate: this.formBuilder.control(null, Validators.compose([
                datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
            ])),

            ddImmRegProtectionIndicator: this.formBuilder.control(null),
            dpImmRegProtectionIndicatorEffectiveDate: this.formBuilder.control(null, Validators.compose([
                datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
            ]))
            */
        },
            {
                validator: Validators.compose([

                    CustomValidators.requiredWhenOneOptionWithValue('ddBirthOrder', 'ddMultiBirthIndicator', 'Y'),
                    CustomValidators.requiredWhenOneOptionWithValue('txtOtherGenderIdentity', 'ddGenderIdentity', 'OTH'),
                    CustomValidators.requiredWhenOneOptionWithValue('txtOtherSexualOrientation', 'ddSexualOrientation', 'OTH'),

                    //lstPrimaryPhoneType: Array<string> = ["", "CELL PHONE", "HOME PHONE", "WORK PHONE"];
                    CustomValidators.requiredWhenOneOptionWithValue('txtCellPhone', 'ddPrimaryPhone', 'CELL PHONE'),
                    CustomValidators.requiredWhenOneOptionWithValue('txtHomePhone', 'ddPrimaryPhone', 'HOME PHONE'),
                    CustomValidators.requiredWhenOneOptionWithValue('txtWorkPhone', 'ddPrimaryPhone', 'WORK PHONE'),

                    CustomValidators.requiredWhenNotNull('txtCommDetail', 'ddCommPreference')

                    //CustomValidators.requiredWhenNotNull('dpImmRegStatusEffectiveDate', 'ddImmRegStatus'),
                    //CustomValidators.requiredWhenNotNull('dpImmRegPublicityCodeEffectiveDate', 'ddImmRegPublicityCode'),
                    //CustomValidators.requiredWhenNotNull('dpImmRegProtectionIndicatorEffectiveDate', 'ddImmRegProtectionIndicator'),

                    //CustomValidators.validDate('dpBirthDate', false)

                ])
            }
        )

        this.lookupList.lstOMBRace.forEach(race => {
            this.patInfoFormGroup.addControl("chkRaceOBM_" + race.code, this.formBuilder.control(null));
        });

        this.lookupList.lstOMBEthnicity.forEach(ethnicity => {
            this.patInfoFormGroup.addControl("chkEthnicityOBM_" + ethnicity.code, this.formBuilder.control(null));
        });
    }

    assignValues() {
        debugger;
        this.genderDescription = this.patient.gender;
        this.sexualOrientationDescription = this.patient.sexual_orientation;
        this.genderIdentityreDescription = this.patient.gender_identity;
        this.maritalStatus = this.patient.marital_status;
        this.languageDescription = this.patient.patient_language;

        this.birthDateModel = this.dateTimeUtil.getDateModelFromDateString(this.patient.dob, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

        (this.patInfoFormGroup.get("txtPatTitle") as FormControl).setValue(this.patient.preffix);
        (this.patInfoFormGroup.get("txtPatFName") as FormControl).setValue(this.patient.first_name);
        (this.patInfoFormGroup.get("txtPatMName") as FormControl).setValue(this.patient.mname);
        (this.patInfoFormGroup.get("txtPatLName") as FormControl).setValue(this.patient.last_name);
        (this.patInfoFormGroup.get("txtPatSuffix") as FormControl).setValue(this.patient.suffix);
        (this.patInfoFormGroup.get("txtPatPrevName") as FormControl).setValue(this.patient.previous_name);

        if (this.patient.patient_status == undefined || this.patient.patient_status == null || this.patient.patient_status == '') {
            (this.patInfoFormGroup.get("ddPatStatus") as FormControl).setValue('ACTIVE');
        }
        else {
            (this.patInfoFormGroup.get("ddPatStatus") as FormControl).setValue(this.patient.patient_status);
        }


        (this.patInfoFormGroup.get("dpBirthDate") as FormControl).setValue(this.birthDateModel);
        (this.patInfoFormGroup.get("ddGender") as FormControl).setValue(this.patient.gender_code);
        (this.patInfoFormGroup.get("ddMaritalStatus") as FormControl).setValue(this.patient.marital_status_code);
        (this.patInfoFormGroup.get("txtSSN") as FormControl).setValue(this.patient.ssn);
        (this.patInfoFormGroup.get("ddPreferredLanguage") as FormControl).setValue(this.patient.language_code);

        debugger;
        (this.patInfoFormGroup.get("rbInterpreterRequired") as FormControl).setValue(this.patient.interpreter_req);

        (this.patInfoFormGroup.get("txtMotherFName") as FormControl).setValue(this.patient.mother_maiden_first_name);
        (this.patInfoFormGroup.get("txtMotherLName") as FormControl).setValue(this.patient.mother_maiden_last_name);

        (this.patInfoFormGroup.get("ddMultiBirthIndicator") as FormControl).setValue(this.patient.multi_birth);
        if (this.patient.multi_birth == "Y") {
            (this.patInfoFormGroup.get("ddBirthOrder") as FormControl).setValue(this.patient.birth_order);
        }


        (this.patInfoFormGroup.get("ddGenderIdentity") as FormControl).setValue(this.patient.gender_identity_code);
        if (this.patient.gender_identity_code == "OTH") {
            (this.patInfoFormGroup.get("txtOtherGenderIdentity") as FormControl).setValue(this.patient.gender_identity);
        }

        (this.patInfoFormGroup.get("ddSexualOrientation") as FormControl).setValue(this.patient.sexual_orientation_code);
        if (this.patient.sexual_orientation_code == "OTH") {
            (this.patInfoFormGroup.get("txtOtherSexualOrientation") as FormControl).setValue(this.patient.sexual_orientation);
        }

        (this.patInfoFormGroup.get("txtAddressL1") as FormControl).setValue(this.patient.address);
        (this.patInfoFormGroup.get("txtAddressL2") as FormControl).setValue(this.patient.address2);

        (this.patInfoFormGroup.get("txtZipCode") as FormControl).setValue(this.patient.zip);

        this.isZipLoading = true;
        this.zipFocusOut(this.patient.zip);

        (this.patInfoFormGroup.get("ddPrimaryPhone") as FormControl).setValue(this.patient.primary_contact_type);
        (this.patInfoFormGroup.get("txtCellPhone") as FormControl).setValue(this.patient.cell_phone);
        (this.patInfoFormGroup.get("txtHomePhone") as FormControl).setValue(this.patient.home_phone);
        (this.patInfoFormGroup.get("txtWorkPhone") as FormControl).setValue(this.patient.work_phone);
        (this.patInfoFormGroup.get("txtEmail") as FormControl).setValue(this.patient.email);
        (this.patInfoFormGroup.get("ddCommPreference") as FormControl).setValue(this.patient.confid_contact_type);
        (this.patInfoFormGroup.get("txtCommDetail") as FormControl).setValue(this.patient.confid_contact);
        (this.patInfoFormGroup.get("txtEmrContactPerson") as FormControl).setValue(this.patient.emrg_contact_name);

        (this.patInfoFormGroup.get("txtEmrContactNo") as FormControl).setValue(this.patient.emrg_contact);

        (this.patInfoFormGroup.get("ddPrimaryPhy") as FormControl).setValue(this.patient.primary_provider);
        (this.patInfoFormGroup.get("ddLocation") as FormControl).setValue(this.patient.location_id);
        (this.patInfoFormGroup.get("txtPatientSubscriber") as FormControl).setValue(this.patient.guarantor_name);
        (this.patInfoFormGroup.get("txtPatientSubscriberIDHidden") as FormControl).setValue(this.patient.guarantor_id);
        (this.patInfoFormGroup.get("txtRefPhy") as FormControl).setValue(this.patient.referral_name);
        (this.patInfoFormGroup.get("txtRefPhyIDHidden") as FormControl).setValue(this.patient.referral_id);

        (this.patInfoFormGroup.get("ddAdvanceDirective") as FormControl).setValue(this.patient.advance_directive);

        (this.patInfoFormGroup.get("txtAnnualIncome") as FormControl).setValue(this.patient.annual_income);
        (this.patInfoFormGroup.get("txtFamilySize") as FormControl).setValue(this.patient.family_size);

        (this.patInfoFormGroup.get("txtComments") as FormControl).setValue(this.patient.comment);


        this.disabledDateModel = this.dateTimeUtil.getDateModelFromDateString(this.patient.disabled_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        this.deathDateModel = this.dateTimeUtil.getDateModelFromDateString(this.patient.expired_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

        (this.patInfoFormGroup.get("dpDisabledDate") as FormControl).setValue(this.disabledDateModel);
        (this.patInfoFormGroup.get("dpDeathDate") as FormControl).setValue(this.deathDateModel);

        (this.patInfoFormGroup.get("txtDeathReason") as FormControl).setValue(this.patient.death_cause);

        (this.patInfoFormGroup.get("chkTransisionOfCare") as FormControl).setValue(this.patient.is_transition_of_care);
        (this.patInfoFormGroup.get("chkBlockRemCalls") as FormControl).setValue(this.patient.acu);
        (this.patInfoFormGroup.get("chkDontSendStatement") as FormControl).setValue(this.patient.pat_statement);
        (this.patInfoFormGroup.get("chkAccessRestricted") as FormControl).setValue(this.patient.access_restricted);
        (this.patInfoFormGroup.get("chkIsDental") as FormControl).setValue(this.patient.is_dental);


        //(this.patInfoFormGroup.get("chkSelfpay") as FormControl).setValue(this.patient.self_pay);


        if (this.patient.race_code == 'ASKU') {
            (this.patInfoFormGroup.get("chkRaceDeclined") as FormControl).setValue(true);
        }
        else {
            (this.patInfoFormGroup.get("chkRaceDeclined") as FormControl).setValue(false);
        }

        if (this.patient.ethnicity_code == 'ASKU') {
            (this.patInfoFormGroup.get("chkEthnicityDeclined") as FormControl).setValue(true);
        }
        else {
            (this.patInfoFormGroup.get("chkEthnicityDeclined") as FormControl).setValue(false);
        }
        (this.patInfoFormGroup.get("ddEmrContactRelationship") as FormControl).setValue(this.patient.emrg_contact_relation);

        /*
        debugger;
        if (this.patientImmRegInfo != undefined) {
            let dtModel: DateModel;

            (this.patInfoFormGroup.get("ddImmRegStatus") as FormControl).setValue(this.patientImmRegInfo.registry_status);
            (this.patInfoFormGroup.get("ddImmRegPublicityCode") as FormControl).setValue(this.patientImmRegInfo.publicity_code);
            (this.patInfoFormGroup.get("ddImmRegProtectionIndicator") as FormControl).setValue(this.patientImmRegInfo.protection_indicator);

            dtModel = this.dateTimeUtil.getDateModelFromDateString(this.patientImmRegInfo.registry_status_effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
            (this.patInfoFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).setValue(dtModel);

            dtModel = this.dateTimeUtil.getDateModelFromDateString(this.patientImmRegInfo.publicity_code_effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
            (this.patInfoFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).setValue(dtModel);

            dtModel = this.dateTimeUtil.getDateModelFromDateString(this.patientImmRegInfo.protection_indicator_effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
            (this.patInfoFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).setValue(dtModel);
        }
        */

        this.disableInsuranceFields(this.isSelfPay);

    }

    getPatientInfo() {
        this.patientService.getPatient(this.patientId).subscribe(
            data => {

                this.loadingCount--;
                this.checkIfLoadingCompleted();

                this.patient = data;

                if (this.patient != null) {
                    if (this.patient.ssn != null && this.patient.ssn != "") {
                        this.maskedSSN = "*****" + this.patient.ssn.replace("-", "").replace("-", "").substring(5, 9);
                    }
                    this.isSelfPay = this.patient.self_pay;
                }

                this.fetchPatientPicURL();
            },
            error => {

                this.loadingCount--;
                this.checkIfLoadingCompleted();
                this.isLoading = false;
                this.GetPatientError(error);
            }
        );
    }

    GetPatientError(error) {
        this.logMessage.log("getPatient Error." + error);
    }

    ShowHideSSN(show: boolean) {
        this.showSSN = show;
    }


    getPatientInsurance() {
        this.patientService.getPatientInsurance(this.patientId, 'active').subscribe(
            data => {
                debugger;
                this.lstPatInsurance = data as Array<any>;
                /*
                if (this.lstPatInsurance != undefined && this.lstPatInsurance != null && this.lstPatInsurance.length > 0) {
                    this.isInsuranceExists = true;
                }
                else {
                    this.isInsuranceExists = false;
                }
                */
                this.removeAllInsuranceControls();
                this.addAllInsuranceControls();

                this.loadingInsurance = false;
                this.loadingCount--;
                this.checkIfLoadingCompleted();
            },
            error => {
                this.loadingInsurance = false;
                this.loadingCount--;
                this.getPatientInsuranceError(error);
            }
        );
    }

    getPatientInsuranceError(error) {
        this.logMessage.log("getPatientInsurance Error." + error);
    }

    addAllInsuranceControls() {
        if (this.lstPatInsurance != undefined) {
            this.lstPatInsurance.forEach(ins => {
                this.addInsuranceControlsToFormGroup(ins);
            });
        }
    }


    addInsuranceControlsToFormGroup(ins: any) {

        debugger;
        if (this.lstInsuranceWCCities == undefined)
            this.lstInsuranceWCCities = new Array();

        this.lstInsuranceWCCities.push({ id: ins.patientinsurance_id, zip_code: ins.workercomp_zip, zip_changed: false, zip_loading: false, lstCities: [{ zip_code: ins.workercomp_zip, city: ins.workercomp_city, state: ins.state }] });

        let startDateModel = this.dateTimeUtil.getDateModelFromDateString(ins.issue_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        let endDateModel = this.dateTimeUtil.getDateModelFromDateString(ins.end_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);



        //this.patInfoFormGroup.addControl("txtInsuranceID_" + ins.patientinsurance_id, new FormControl(ins.insurance_id, Validators.required));
        this.patInfoFormGroup.addControl("txtInsuranceName_" + ins.patientinsurance_id, this.formBuilder.control(ins.name));
        this.patInfoFormGroup.addControl("txtInsuranceSubscriber_" + ins.patientinsurance_id, this.formBuilder.control(ins.guarantor_name));
        this.patInfoFormGroup.addControl("ddInsuranceSubscriberRel_" + ins.patientinsurance_id, this.formBuilder.control(ins.guarantor_relationship));

        this.patInfoFormGroup.addControl("txtPolicyNo_" + ins.patientinsurance_id, this.formBuilder.control(ins.policy_number));
        this.patInfoFormGroup.addControl("txtGroupNo_" + ins.patientinsurance_id, this.formBuilder.control(ins.group_number));

        //this.patInfoFormGroup.addControl("dpInsStartDate_" + ins.patientinsurance_id, this.formBuilder.control(startDateModel));
        //this.patInfoFormGroup.addControl("dpInsEndDate_" + ins.patientinsurance_id, this.formBuilder.control(endDateModel));

        this.patInfoFormGroup.addControl("dpInsStartDate_" + ins.patientinsurance_id,
            this.formBuilder.control(startDateModel, Validators.compose([
                datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
            ]))
        );

        this.patInfoFormGroup.addControl("dpInsEndDate_" + ins.patientinsurance_id,
            this.formBuilder.control(endDateModel, Validators.compose([
                datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
            ]))
        );


        this.patInfoFormGroup.addControl("txtInsCopy_" + ins.patientinsurance_id, this.formBuilder.control(ins.copay));
        this.patInfoFormGroup.addControl("txtInsPCP_" + ins.patientinsurance_id, this.formBuilder.control(ins.pcp));

        this.patInfoFormGroup.addControl("txtWorkerCompName_" + ins.patientinsurance_id, this.formBuilder.control(ins.workercomp_name));
        this.patInfoFormGroup.addControl("txtWorkerCompAddress_" + ins.patientinsurance_id, this.formBuilder.control(ins.workercomp_address));
        this.patInfoFormGroup.addControl("txtWCZipCode_" + ins.patientinsurance_id, this.formBuilder.control(ins.workercomp_zip));
        this.patInfoFormGroup.addControl("ddWorkerCompCity_" + ins.patientinsurance_id, this.formBuilder.control(ins.workercomp_city));

    }

    removeAllInsuranceControls() {

        if (this.lstPatInsurance != undefined) {
            this.lstPatInsurance.forEach(ins => {
                this.removeInsuranceControlsById(ins.patientinsurance_id);
            });
        }
    }
    removeInsuranceControlsById(id: number) {

        this.patInfoFormGroup.removeControl("txtInsuranceName_" + id);
        this.patInfoFormGroup.removeControl("txtInsuranceSubscriber_" + id);
        this.patInfoFormGroup.removeControl("ddInsuranceSubscriberRel_" + id);
        this.patInfoFormGroup.removeControl("txtPolicyNo_" + id);
        this.patInfoFormGroup.removeControl("txtGroupNo_" + id);
        this.patInfoFormGroup.removeControl("dpInsStartDate_" + id);
        this.patInfoFormGroup.removeControl("dpInsEndDate_" + id);
        this.patInfoFormGroup.removeControl("txtInsCopy_" + id);
        this.patInfoFormGroup.removeControl("txtInsPCP_" + id);
        this.patInfoFormGroup.removeControl("txtWorkerCompName_" + id);
        this.patInfoFormGroup.removeControl("txtWorkerCompAddress_" + id);
        this.patInfoFormGroup.removeControl("txtWCZipCode_" + id);
        this.patInfoFormGroup.removeControl("ddWorkerCompCity_" + id);

        if (this.lstInsuranceWCCities != undefined) {

            for (let i: number = this.lstInsuranceWCCities.length - 1; i >= 0; i--) {

                let element = this.lstInsuranceWCCities[i];
                if (element.patientinsurance_id == id) {
                    this.lstInsuranceWCCities.splice(i, 1);
                }
            }
        }
    }

    getWorkerCompCities(id): Array<any> {

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

    getPatientRaceEthnicty() {
        debugger;
        this.patientService.getPatientRaceEthnicty(this.patientId).subscribe(
            data => {

                debugger;
                this.lstPatRaceEthnicityFromDB = data as Array<any>;
                //this.lstPatRaceFromDB = data;
                this.lstPatRace = new Array();
                this.lstPatEthnicity = new Array();

                this.lstPatRaceEthnicityFromDB.forEach(element => {
                    if (element.entry_type == 'RACE') {
                        this.lstPatRace.push(element);
                    }
                    else if (element.entry_type == 'ETHNICITY') {
                        this.lstPatEthnicity.push(element);
                    }

                });

                this.populateRaceCDC();
                this.populateEthnicityCDC();

                this.loadingCount--;
                this.checkIfLoadingCompleted();
            },
            error => {
                this.loadingCount--;
                this.checkIfLoadingCompleted();

                this.getPatientRaceEthnictyError(error);
            }
        );
    }

    getPatientRaceEthnictyError(error) {
        this.logMessage.log("getPatientRaceEthnicty Error." + error);
    }

    /*
    getPatientRace() {
        this.patientService.getPatientRace(this.patientId).subscribe(
            data => {

                this.lstPatRace = data;
                this.lstPatRaceFromDB = data;
                this.populateRaceCDC();

                this.loadingCount--;
                if (this.loadingCount == 0) {
                    this.isLoading = false;
                }
            },
            error => {
                this.loadingCount--;
                if (this.loadingCount == 0) {
                    this.isLoading = false;
                }

                this.getPatientRaceError(error);
            }
        );
    }

    getPatientRaceError(error) {
        this.logMessage.log("getPatientRace Error." + error);
    }
    getPatientEthnicity() {
        this.patientService.getPatientEthnicity(this.patientId).subscribe(
            data => {

                this.lstPatEthnicity = data;
                this.populateEthnicityCDC();

                this.loadingCount--;
                if (this.loadingCount == 0) {
                    this.isLoading = false;
                }

            },
            error => {
                this.loadingCount--;
                if (this.loadingCount == 0) {
                    this.isLoading = false;
                }

                this.getPatientEthnicityError(error);
            }
        );
    }

    getPatientEthnicityError(error) {
        this.logMessage.log("getPatientEthnicity Error." + error);
    }
    */

    getPatientNextOfKin() {
        this.patientService.getPatientNextOfKin(this.patientId).subscribe(
            data => {

                this.lstNextOfKin = data as Array<any>;
                this.loadingCount--;
                this.checkIfLoadingCompleted();

            },
            error => {
                this.loadingCount--;
                this.checkIfLoadingCompleted();
                this.getPatientNextOfKinError(error);
            }
        );
    }

    getPatientNextOfKinError(error) {
        this.logMessage.log("getPatientNextOfKin Error." + error);
    }

    /*
    getPatientImmRegInfo() {
        this.patientService.getPatientImmRegInfo(this.patientId).subscribe(
            data => {

                this.patientImmRegInfo = data;
                if (this.patientImmRegInfo != undefined) {
                    this.immRegPublicityCodeDescription = this.patientImmRegInfo.publicity_code_description;
                }
                this.loadingCount--;
                this.checkIfLoadingCompleted();
            },
            error => {
                this.loadingCount--;
                this.checkIfLoadingCompleted();
                this.getPatientImmRegInfoError(error);
            }
        );
    }

    getPatientImmRegInfoError(error: any) {
        this.logMessage.log("getPatientImmRegInfo Error." + error);
    }
    */

    getPatientCareTeams() {

        this.patientService.getPatientCareTeams(this.patientId).subscribe(
            data => {

                this.lstPatientCareTeams = data as Array<any>;
                this.loadingCount--;
                this.checkIfLoadingCompleted();
            },
            error => {
                this.loadingCount--;
                this.checkIfLoadingCompleted();
                this.getPatientCareTeamsError(error);
            }
        );
    }

    getPatientCareTeamsError(error) {
        this.logMessage.log("getPatientCareTeams Error." + error);
    }

    getPatientCareTeamMembers() {
        this.patientService.getPatientCareTeamMembers(this.patientId).subscribe(
            data => {

                this.lstPatientCareTeamMembers = data as Array<any>;
                this.loadingCount--;
                this.checkIfLoadingCompleted();
            },
            error => {
                this.loadingCount--;
                this.checkIfLoadingCompleted();
                this.getPatientCareTeamMembersError(error);
            }
        );
    }

    getPatientCareTeamMembersError(error) {
        this.logMessage.log("getPatientCareTeamMembers Error." + error);
    }


    getMaritalStatusList() {
        this.generalService.getMaritalStatusList().subscribe(
            data => {


                this.lookupList.lstMaritalStatus = data as Array<any>;
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    //if (this.patientId != undefined) {
                    this.loadPatientData(false);
                    //}
                    //else {
                    //this.isLoading = false;
                    //}
                }
            },
            error => {
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    this.isLoading = false;
                }
                this.getMaritalStatusListError(error);
            }
        );
    }

    getMaritalStatusListError(error) {
        this.logMessage.log("getMaritalStatusList Error." + error);
    }
    getLanguageList() {
        this.generalService.getLanguagesList(this.lookupList.practiceInfo.practiceId).subscribe(
            data => {

                this.lookupList.lstLanguages = data as Array<any>;
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    //if (this.patientId != undefined) {
                    this.loadPatientData(false);
                    //}
                    //else {
                    //this.isLoading = false;
                    //}
                }
            },
            error => {
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    this.isLoading = false;
                }
                this.getgetLanguageListError(error);
            }
        );
    }

    getgetLanguageListError(error) {
        this.logMessage.log("getgetLanguageList Error." + error);
    }
    getGenderIdentityList() {
        this.generalService.getGenderIdentityList().subscribe(
            data => {

                this.lookupList.lstGenderIdentity = data as Array<any>;
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    //if (this.patientId != undefined) {
                    this.loadPatientData(false);
                    // }
                    // else {
                    //     this.isLoading = false;
                    //  }
                }
            },
            error => {
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    this.isLoading = false;
                }
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
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    //if (this.patientId != undefined) {
                    //   this.loadPatientData(false);
                    //}
                    //else {
                    //this.isLoading = false;
                    //}
                }
            },
            error => {
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    this.isLoading = false;
                }
                this.getSexualOrientationListError(error);
            }
        );
    }

    getSexualOrientationListError(error) {
        this.logMessage.log("getSexualOrientationList Error." + error);
    }

    OnEdit() {
        this.editMode = true;
        this.addEditOperation = OperationType.EDIT;
        this.assignValues();
    }

    populateEthnicityCDC() {

        this.lstPatOMBEthnicity = new Array();
        this.lookupList.lstOMBEthnicity.forEach(ombEth => {

            let checked: boolean = false;

            if (this.lstPatEthnicity != undefined) {
                let lstFiltered = new ListFilterPipe().transform(this.lstPatEthnicity, "omb_code", ombEth.code);
                if (lstFiltered.length > 0) {
                    checked = true;
                }
            }
            this.lstPatOMBEthnicity.push({ id: ombEth.id, omb_code: ombEth.code, omb_description: ombEth.description, selected: checked });
        });


        this.lstPatCDCEthnicity = new Array();
        if (this.lstPatEthnicity != undefined) {
            for (let e of this.lstPatEthnicity) {
                if (e["cdc_code"] != undefined && e["cdc_code"] != "") {
                    this.lstPatCDCEthnicity.push(e);
                }
            }
        }
    }

    populateRaceCDC() {

        debugger;
        this.lstPatOMBRace = new Array();
        this.lookupList.lstOMBRace.forEach(ombRace => {

            let checked: boolean = false;

            if (this.lstPatRace != undefined) {
                let lstFiltered = new ListFilterPipe().transform(this.lstPatRace, "omb_code", ombRace.code);
                if (lstFiltered.length > 0) {
                    checked = true;
                }
            }

            this.lstPatOMBRace.push({ id: ombRace.id, omb_code: ombRace.code, omb_description: ombRace.description, selected: checked });
        });


        this.lstPatCDCRace = new Array();
        if (this.lstPatRace != undefined) {
            for (let r of this.lstPatRace) {
                if (r["cdc_code"] != undefined && r["cdc_code"] != "") {
                    this.lstPatCDCRace.push(r);
                }
            }
        }

    }

    onRemoveRace(ombCode, cdcCode) {


        for (let i: number = this.lstPatRace.length - 1; i >= 0; i--) {

            let element = this.lstPatRace[i];
            if (cdcCode != undefined && cdcCode != "") {
                if (element.cdc_code == cdcCode) {
                    if (i !== -1) {
                        this.lstPatRace.splice(i, 1);
                    }
                }
            }
            else if (ombCode != undefined && ombCode != "") {
                if (element.omb_code == ombCode) {
                    if (i !== -1) {
                        this.lstPatRace.splice(i, 1);
                    }
                }
            }
        }

        this.populateRaceCDC();
    }
    onRemoveEthnicity(ombCode, cdcCode) {
        for (let i: number = this.lstPatEthnicity.length - 1; i >= 0; i--) {

            let element = this.lstPatEthnicity[i];
            if (cdcCode != undefined && cdcCode != "") {
                if (element.cdc_code == cdcCode) {
                    if (i !== -1) {
                        this.lstPatEthnicity.splice(i, 1);

                    }
                }
            }
            else if (ombCode != undefined && ombCode != "") {
                if (element.omb_code == ombCode) {
                    if (i !== -1) {
                        this.lstPatEthnicity.splice(i, 1);
                    }
                }
            }
        }

        this.populateEthnicityCDC();

    }

    onRaceSearchKeydown(event) {
        if (event.key === "Enter") {
            this.showRaceSearch = true;
        }
        else {
            this.showRaceSearch = false;
        }
    }

    addRace(raceObject) {


        debugger;
        this.logMessage.log(raceObject);
        if (this.lstPatRace == undefined) {
            this.lstPatRace = [];
        }

        let found: boolean = false;
        this.lstPatRace.forEach(race => {


            if (!found) {
                if (race.cdc_code == raceObject.cdc_code && race.cdc_code != "") {
                    found = true;
                }
                else if (race.id == -1 && race.omb_code == raceObject.omb_code && race.cdc_code == "") {
                    race.cdc_code = raceObject.cdc_code;
                    race.cdc_description = raceObject.cdc_description;
                    race.add_edit_flag = true;
                    found = true;
                }
            }
        });

        if (!found) {
            this.lstPatRace.push({
                id: -1,
                patient: this.patientId,
                cdc_code: raceObject.cdc_code,
                cdc_description: raceObject.cdc_description,
                omb_code: raceObject.omb_code,
                omb_description: raceObject.omb_description,
                entry_type: "RACE",
                add_edit_flag: true
            });
        }

        this.populateRaceCDC();
        this.showRaceSearch = false;
    }

    closeRaceSearch() {
        this.showRaceSearch = false;
    }


    onEthnicitySearchKeydown(event) {
        if (event.key === "Enter") {
            this.showEthnicitySearch = true;
        }
        else {
            this.showEthnicitySearch = false;
        }
    }

    addEthnicity(ethObject) {

        debugger;
        this.logMessage.log(ethObject);

        if (this.lstPatEthnicity == undefined) {
            this.lstPatEthnicity = [];
        }
        let found: boolean = false;
        this.lstPatEthnicity.forEach(eth => {
            if (!found) {
                if (eth.cdc_code == ethObject.cdc_code && eth.cdc_code != "") {
                    found = true;
                }
                else if (eth.id == -1 && eth.omb_code == ethObject.omb_code && eth.cdc_code == "") {
                    eth.cdc_code = ethObject.cdc_code;
                    eth.cdc_description = ethObject.cdc_description;
                    eth.add_edit_flag = true;
                    found = true;
                }
            }
        });

        if (!found) {
            this.lstPatEthnicity.push({
                id: -1,
                patient: this.patientId,
                cdc_code: ethObject.cdc_code,
                cdc_description: ethObject.cdc_description,
                omb_code: ethObject.omb_code,
                omb_description: ethObject.omb_description,
                entry_type: "ETHNICITY",
                add_edit_flag: true
            });
        }
        this.populateEthnicityCDC();
        this.showEthnicitySearch = false;
    }

    closeEthnicitySearch() {
        this.showEthnicitySearch = false;
    }

    getOMBRaceList() {
        this.generalService.getOMBRaceList().subscribe(
            data => {

                this.lookupList.lstOMBRace = data as Array<any>;
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    //if (this.patientId != undefined) {
                    this.loadPatientData(false);
                    //}
                    //else {
                    //this.isLoading = false;
                    //}
                }
            },
            error => {
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    this.isLoading = false;
                }
                this.getOMBRaceListError(error);
            }
        );
    }

    getOMBRaceListError(error) {
        this.logMessage.log("getOMBRaceList Error." + error);
    }

    getOMBEthnicityList() {
        this.generalService.getOMBEthnicityList().subscribe(
            data => {


                this.lookupList.lstOMBEthnicity = data as Array<any>;
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    //if (this.patientId != undefined) {
                    this.loadPatientData(false);
                    //}
                    //else {
                    //this.isLoading = false;
                    //}
                }
            },
            error => {
                this.prePopulateCount--;
                if (this.prePopulateCount == 0) {
                    this.isLoading = false;
                }
                this.getOMBEthnicityListError(error);
            }
        );
    }

    getOMBEthnicityListError(error) {
        this.logMessage.log("getOMBEthnicityList Error." + error);
    }





    populatePatientSaveObject(patForm): ORMSavePatient {

        debugger;

        let objORMPatient: ORMSavePatient = new ORMSavePatient();

        if (this.addEditOperation == OperationType.EDIT) {
            objORMPatient.patient_id = this.patientId;
            objORMPatient.alternate_account = this.patient.alternate_account;
            objORMPatient.date_created = this.patient.date_created;
            objORMPatient.client_date_created = this.patient.client_date_created;
            objORMPatient.created_user = this.patient.created_user;
            objORMPatient.pic = this.patient.pic;

            objORMPatient.id_card = this.patient.id_card;
            objORMPatient.driving_license = this.patient.driving_license;
            objORMPatient.patient_agreement = this.patient.patient_agreement;

        }
        if (this.addEditOperation == OperationType.ADD) {
            //objORMPatient.alternate_account = this.patientId.toString(); // will be assigned on server side.
            objORMPatient.client_date_created = this.clientDateTime;
            objORMPatient.created_user = this.lookupList.logedInUser.user_name;
        }
        objORMPatient.modified_user = this.lookupList.logedInUser.user_name;
        objORMPatient.client_date_modified = this.clientDateTime;
        objORMPatient.system_ip = this.lookupList.logedInUser.systemIp;
        objORMPatient.practice_id = this.lookupList.practiceInfo.practiceId;

        this.patientName = (this.patInfoFormGroup.get("txtPatLName") as FormControl).value + ', ' + (this.patInfoFormGroup.get("txtPatFName") as FormControl).value;

        objORMPatient.preffix = (this.patInfoFormGroup.get("txtPatTitle") as FormControl).value;
        objORMPatient.first_name = (this.patInfoFormGroup.get("txtPatFName") as FormControl).value;
        objORMPatient.mname = (this.patInfoFormGroup.get("txtPatMName") as FormControl).value;
        objORMPatient.last_name = (this.patInfoFormGroup.get("txtPatLName") as FormControl).value;
        objORMPatient.suffix = (this.patInfoFormGroup.get("txtPatSuffix") as FormControl).value;
        objORMPatient.previous_name = (this.patInfoFormGroup.get("txtPatPrevName") as FormControl).value;
        objORMPatient.patient_status = (this.patInfoFormGroup.get("ddPatStatus") as FormControl).value;

        let dob = this.dateTimeUtil.getStringDateFromDateModel((this.patInfoFormGroup.get("dpBirthDate") as FormControl).value);
        objORMPatient.dob = dob;
        objORMPatient.gender_code = (this.patInfoFormGroup.get("ddGender") as FormControl).value;
        objORMPatient.gender = this.genderDescription;

        objORMPatient.marital_status_code = (this.patInfoFormGroup.get("ddMaritalStatus") as FormControl).value;
        objORMPatient.marital_status = this.maritalStatus;

        objORMPatient.ssn = (this.patInfoFormGroup.get("txtSSN") as FormControl).value;

        objORMPatient.language_code = (this.patInfoFormGroup.get("ddPreferredLanguage") as FormControl).value;
        objORMPatient.language = this.languageDescription;

        objORMPatient.interpreter_req = (this.patInfoFormGroup.get("rbInterpreterRequired") as FormControl).value;

        objORMPatient.mother_maiden_first_name = (this.patInfoFormGroup.get("txtMotherFName") as FormControl).value;
        objORMPatient.mother_maiden_last_name = (this.patInfoFormGroup.get("txtMotherLName") as FormControl).value;


        objORMPatient.multi_birth = (this.patInfoFormGroup.get("ddMultiBirthIndicator") as FormControl).value;
        if (objORMPatient.multi_birth == "Y") {
            objORMPatient.birth_order = (this.patInfoFormGroup.get("ddBirthOrder") as FormControl).value;
        }

        objORMPatient.gender_identity_code = (this.patInfoFormGroup.get("ddGenderIdentity") as FormControl).value;
        objORMPatient.gender_identity = this.genderIdentityreDescription;
        if (objORMPatient.gender_identity_code == "OTH") {
            objORMPatient.gender_identity = (this.patInfoFormGroup.get("txtOtherGenderIdentity") as FormControl).value;
        }

        objORMPatient.sexual_orientation_code = (this.patInfoFormGroup.get("ddSexualOrientation") as FormControl).value;
        objORMPatient.sexual_orientation = this.sexualOrientationDescription;
        if (objORMPatient.sexual_orientation_code == "OTH") {
            objORMPatient.sexual_orientation = (this.patInfoFormGroup.get("txtOtherSexualOrientation") as FormControl).value;
        }


        objORMPatient.address = (this.patInfoFormGroup.get("txtAddressL1") as FormControl).value;
        objORMPatient.address2 = (this.patInfoFormGroup.get("txtAddressL2") as FormControl).value;
        objORMPatient.zip = (this.patInfoFormGroup.get("txtZipCode") as FormControl).value;
        objORMPatient.city = (this.patInfoFormGroup.get("ddCity") as FormControl).value;
        objORMPatient.state = this.state;
        objORMPatient.county_code = (this.patInfoFormGroup.get("ddParishcode") as FormControl).value;

        objORMPatient.primary_contact_type = (this.patInfoFormGroup.get("ddPrimaryPhone") as FormControl).value;
        objORMPatient.cell_phone = this.generalService.getPhoneFaxDigitsOnly((this.patInfoFormGroup.get("txtCellPhone") as FormControl).value);
        objORMPatient.home_phone = this.generalService.getPhoneFaxDigitsOnly((this.patInfoFormGroup.get("txtHomePhone") as FormControl).value);
        objORMPatient.work_phone = this.generalService.getPhoneFaxDigitsOnly((this.patInfoFormGroup.get("txtWorkPhone") as FormControl).value);
        objORMPatient.email = (this.patInfoFormGroup.get("txtEmail") as FormControl).value;

        objORMPatient.confid_contact_type = (this.patInfoFormGroup.get("ddCommPreference") as FormControl).value;
        objORMPatient.confid_contact = (this.patInfoFormGroup.get("txtCommDetail") as FormControl).value;

        objORMPatient.emrg_contact_name = (this.patInfoFormGroup.get("txtEmrContactPerson") as FormControl).value;
        objORMPatient.emrg_contact_relation = (this.patInfoFormGroup.get("ddEmrContactRelationship") as FormControl).value;
        objORMPatient.emrg_contact = (this.patInfoFormGroup.get("txtEmrContactNo") as FormControl).value;

        if ((this.patInfoFormGroup.get("chkRaceDeclined") as FormControl).value) {
            objORMPatient.race_code = "ASKU";
            objORMPatient.race = "Declined to specify";
        }
        if ((this.patInfoFormGroup.get("chkEthnicityDeclined") as FormControl).value) {
            objORMPatient.ethnicity_code = "ASKU";
            objORMPatient.ethnicity = "Declined to specify";
        }

        objORMPatient.primary_provider = (this.patInfoFormGroup.get("ddPrimaryPhy") as FormControl).value;
        objORMPatient.location_id = (this.patInfoFormGroup.get("ddLocation") as FormControl).value;
        objORMPatient.guarantor_id = (this.patInfoFormGroup.get("txtPatientSubscriberIDHidden") as FormControl).value;
        objORMPatient.referral_id = (this.patInfoFormGroup.get("txtRefPhyIDHidden") as FormControl).value;

        objORMPatient.advance_directive = (this.patInfoFormGroup.get("ddAdvanceDirective") as FormControl).value;
        objORMPatient.annual_income = (this.patInfoFormGroup.get("txtAnnualIncome") as FormControl).value;
        objORMPatient.family_size = (this.patInfoFormGroup.get("txtFamilySize") as FormControl).value;
        objORMPatient.comment = (this.patInfoFormGroup.get("txtComments") as FormControl).value;


        let disabledDate = this.dateTimeUtil.getStringDateFromDateModel((this.patInfoFormGroup.get("dpDisabledDate") as FormControl).value);
        let deathDate = this.dateTimeUtil.getStringDateFromDateModel((this.patInfoFormGroup.get("dpDeathDate") as FormControl).value);

        objORMPatient.disabled_date = disabledDate;
        objORMPatient.expired_date = deathDate;
        objORMPatient.death_cause = (this.patInfoFormGroup.get("txtDeathReason") as FormControl).value;

        objORMPatient.is_transition_of_care = (this.patInfoFormGroup.get("chkTransisionOfCare") as FormControl).value;
        objORMPatient.acu = (this.patInfoFormGroup.get("chkBlockRemCalls") as FormControl).value;
        objORMPatient.pat_statement = (this.patInfoFormGroup.get("chkDontSendStatement") as FormControl).value;
        objORMPatient.access_restricted = (this.patInfoFormGroup.get("chkAccessRestricted") as FormControl).value;
        objORMPatient.is_dental = (this.patInfoFormGroup.get("chkIsDental") as FormControl).value;


        objORMPatient.self_pay = this.isSelfPay;// (this.patInfoFormGroup.get("chkSelfpay") as FormControl).value;

        return objORMPatient;
    }

    populatePatientRaceEthnicitySaveObject(): Array<ORMSavePatientRaceEthnicity> {

        debugger;
        let lstSave: Array<ORMSavePatientRaceEthnicity>;
        this.raceEthnicityDeletedIds = "";
        if ((this.patInfoFormGroup.get("chkRaceDeclined") as FormControl).value) {
            if (this.lstPatRaceEthnicityFromDB != undefined) {
                this.lstPatRaceEthnicityFromDB.forEach(element => {
                    if (element.entry_type == "RACE") {
                        if (this.raceEthnicityDeletedIds != "") {
                            this.raceEthnicityDeletedIds += ","
                        }
                        this.raceEthnicityDeletedIds += element.id;
                    }
                });
            }
        }
        else {

            if (this.lstPatRaceEthnicityFromDB != undefined) {
                this.lstPatRaceEthnicityFromDB.forEach(dbRace => {

                    debugger;

                    let deleted: Boolean = true;

                    if (dbRace.entry_type == "RACE") {

                        this.lstPatRace.forEach(currentRace => {

                            if (dbRace.id == currentRace.id && deleted == true && currentRace.entry_type == "RACE") {
                                deleted = false;
                            }
                        });

                        if (deleted == true) {
                            if (this.raceEthnicityDeletedIds != "") {
                                this.raceEthnicityDeletedIds += ","
                            }
                            this.raceEthnicityDeletedIds += dbRace.id;
                        }

                    }
                });
            }


            if (this.lstPatRace != undefined) {
                this.lstPatRace.forEach(element => {
                    debugger;
                    if (element.i < 0 || (element.add_edit_flag != undefined && element.add_edit_flag == true)) {

                        if (lstSave == undefined) {
                            lstSave = new Array();
                        }


                        let objPatRaceEthnicity: ORMSavePatientRaceEthnicity = new ORMSavePatientRaceEthnicity();
                        if (element.id > 0) {
                            objPatRaceEthnicity.id = element.id;
                            objPatRaceEthnicity.date_created = element.date_created;
                            objPatRaceEthnicity.client_date_created = element.client_date_created;
                            objPatRaceEthnicity.created_user = element.created_user;
                        }
                        else {
                            objPatRaceEthnicity.client_date_created = this.clientDateTime;
                            objPatRaceEthnicity.created_user = this.lookupList.logedInUser.user_name;
                        }
                        objPatRaceEthnicity.modified_user = this.lookupList.logedInUser.user_name;
                        objPatRaceEthnicity.client_date_modified = this.clientDateTime;
                        objPatRaceEthnicity.system_ip = this.lookupList.logedInUser.systemIp;
                        objPatRaceEthnicity.practice_id = this.lookupList.practiceInfo.practiceId;
                        objPatRaceEthnicity.patient_id = this.patientId;

                        objPatRaceEthnicity.entry_type = element.entry_type;
                        objPatRaceEthnicity.cdc_code = element.cdc_code;
                        objPatRaceEthnicity.cdc_description = element.cdc_description;
                        objPatRaceEthnicity.omb_code = element.omb_code;
                        objPatRaceEthnicity.omb_description = element.omb_description;

                        lstSave.push(objPatRaceEthnicity);
                    }
                });
            }
        }


        if ((this.patInfoFormGroup.get("chkEthnicityDeclined") as FormControl).value) {
            if (this.lstPatRaceEthnicityFromDB != undefined) {
                this.lstPatRaceEthnicityFromDB.forEach(element => {
                    if (element.entry_type == "ETHNICITY") {
                        if (this.raceEthnicityDeletedIds != "") {
                            this.raceEthnicityDeletedIds += ","
                        }
                        this.raceEthnicityDeletedIds += element.id;
                    }
                });
            }
        }
        else {

            if (this.lstPatRaceEthnicityFromDB != undefined) {
                this.lstPatRaceEthnicityFromDB.forEach(dbEthnicity => {

                    debugger;

                    let deleted: Boolean = true;


                    if (dbEthnicity.entry_type == "ETHNICITY") {


                        this.lstPatEthnicity.forEach(currentEthnicity => {

                            if (dbEthnicity.id == currentEthnicity.id && deleted == true && currentEthnicity.entry_type == "ETHNICITY") {
                                deleted = false;
                            }
                        });

                        if (deleted == true) {
                            if (this.raceEthnicityDeletedIds != "") {
                                this.raceEthnicityDeletedIds += ","
                            }
                            this.raceEthnicityDeletedIds += dbEthnicity.id;
                        }
                    }
                });
            }


            if (this.lstPatEthnicity != undefined) {
                this.lstPatEthnicity.forEach(element => {

                    debugger;

                    if (element.id < 0 || (element.add_edit_flag != undefined && element.add_edit_flag == true)) {

                        if (lstSave == undefined) {
                            lstSave = new Array();
                        }


                        let objPatRaceEthnicity: ORMSavePatientRaceEthnicity = new ORMSavePatientRaceEthnicity();
                        if (element.id > 0) {
                            objPatRaceEthnicity.id = element.id;
                            objPatRaceEthnicity.date_created = element.date_created;
                            objPatRaceEthnicity.client_date_created = element.client_date_created;
                            objPatRaceEthnicity.created_user = element.created_user;
                        }
                        else {
                            objPatRaceEthnicity.client_date_created = this.clientDateTime;
                            objPatRaceEthnicity.created_user = this.lookupList.logedInUser.user_name;
                        }
                        objPatRaceEthnicity.modified_user = this.lookupList.logedInUser.user_name;
                        objPatRaceEthnicity.client_date_modified = this.clientDateTime;
                        objPatRaceEthnicity.system_ip = this.lookupList.logedInUser.systemIp;
                        objPatRaceEthnicity.practice_id = this.lookupList.practiceInfo.practiceId;
                        objPatRaceEthnicity.patient_id = this.patientId;

                        objPatRaceEthnicity.entry_type = element.entry_type;
                        objPatRaceEthnicity.cdc_code = element.cdc_code;
                        objPatRaceEthnicity.cdc_description = element.cdc_description;
                        objPatRaceEthnicity.omb_code = element.omb_code;
                        objPatRaceEthnicity.omb_description = element.omb_description;

                        lstSave.push(objPatRaceEthnicity);
                    }
                });
            }
        }

        return lstSave;
    }

    checkIfIsnuranceValueChanged(patInsId) {

        if (
            this.patInfoFormGroup.get("ddInsuranceSubscriberRel_" + patInsId).dirty
            || this.patInfoFormGroup.get("txtPolicyNo_" + patInsId).dirty
            || this.patInfoFormGroup.get("txtGroupNo_" + patInsId).dirty
            || this.patInfoFormGroup.get("dpInsStartDate_" + patInsId).dirty
            || this.patInfoFormGroup.get("dpInsEndDate_" + patInsId).dirty
            || this.patInfoFormGroup.get("txtInsCopy_" + patInsId).dirty
            || this.patInfoFormGroup.get("txtInsPCP_" + patInsId).dirty
            || this.patInfoFormGroup.get("txtWorkerCompName_" + patInsId).dirty
            || this.patInfoFormGroup.get("txtWorkerCompAddress_" + patInsId).dirty
            || this.patInfoFormGroup.get("txtWCZipCode_" + patInsId).dirty
            || this.patInfoFormGroup.get("ddWorkerCompCity_" + patInsId).dirty
        ) {
            return true;
        }
        else {
            return false;
        }
    }

    populatePatientInsuranceSaveObject(): Array<ORMSavePatientInsurance> {

        let lstSave: Array<ORMSavePatientInsurance>;
        //this.insuranceDeletedIds = "";

        //if ((this.patInfoFormGroup.get("chkSelfpay") as FormControl).value) {
        if (this.isSelfPay) {

            return null;
        }
        else {
            if (this.lstPatInsurance != undefined) {
                this.lstPatInsurance.forEach(element => {

                    let id = element.patientinsurance_id;
                    if (this.checkIfIsnuranceValueChanged(id) || element.add_edit_flag == true) {

                        if (lstSave == undefined) {
                            lstSave = new Array();
                        }


                        let objPatInsurance: ORMSavePatientInsurance = new ORMSavePatientInsurance();

                        if (id > 0) {
                            objPatInsurance.patientinsurance_id = id;
                            objPatInsurance.date_created = element.date_created;
                            objPatInsurance.client_date_created = element.client_date_created;
                            objPatInsurance.created_user = element.created_user;
                            objPatInsurance.document_id = element.document_id;
                        }
                        else {
                            objPatInsurance.client_date_created = this.clientDateTime;
                            objPatInsurance.created_user = this.lookupList.logedInUser.user_name;
                        }

                        objPatInsurance.modified_user = this.lookupList.logedInUser.user_name;
                        objPatInsurance.client_date_modified = this.clientDateTime;
                        objPatInsurance.system_ip = this.lookupList.logedInUser.systemIp;
                        objPatInsurance.patient_id = this.patientId;

                        objPatInsurance.insurace_type = element.insurace_type;
                        objPatInsurance.insurance_id = element.insurance_id;

                        objPatInsurance.guarantor_id = element.guarantor_id;
                        objPatInsurance.guarantor_relationship = this.patInfoFormGroup.get("ddInsuranceSubscriberRel_" + id).value;

                        let startDate = this.dateTimeUtil.getStringDateFromDateModel((this.patInfoFormGroup.get("dpInsStartDate_" + id) as FormControl).value);
                        let endtDate = this.dateTimeUtil.getStringDateFromDateModel((this.patInfoFormGroup.get("dpInsEndDate_" + id) as FormControl).value);

                        objPatInsurance.start_date = startDate;
                        objPatInsurance.end_date = endtDate;

                        objPatInsurance.copay = this.patInfoFormGroup.get("txtInsCopy_" + id).value;
                        objPatInsurance.pcp = this.patInfoFormGroup.get("txtInsPCP_" + id).value;
                        if (this.patInfoFormGroup.get("txtGroupNo_" + id).value != null && this.patInfoFormGroup.get("txtGroupNo_" + id).value != "")
                            objPatInsurance.group_number = this.patInfoFormGroup.get("txtGroupNo_" + id).value.toString().trim();

                        objPatInsurance.policy_number = this.patInfoFormGroup.get("txtPolicyNo_" + id).value.toString().trim();

                        if (this.patInfoFormGroup.get("txtWorkerCompName_" + id).value != undefined && this.patInfoFormGroup.get("txtWorkerCompName_" + id).value != "") {
                            objPatInsurance.workercomp_name = this.patInfoFormGroup.get("txtWorkerCompName_" + id).value;
                            objPatInsurance.workercomp_address = this.patInfoFormGroup.get("txtWorkerCompAddress_" + id).value;
                            objPatInsurance.workercomp_city = this.patInfoFormGroup.get("ddWorkerCompCity_" + id).value;
                            objPatInsurance.workercomp_state = element.workercomp_state;
                            objPatInsurance.workercomp_zip = this.patInfoFormGroup.get("txtWCZipCode_" + id).value;
                        }

                        lstSave.push(objPatInsurance);
                    }
                });
            }
        }
        return lstSave;
    }

    populatePatientNextOfKinSaveObject(): Array<ORMSavePatientNextOfKin> {


        let lstSave: Array<ORMSavePatientNextOfKin>;

        if (this.lstNextOfKin != undefined) {
            this.lstNextOfKin.forEach(element => {

                let id = element.next_of_kin_id;
                if (element.add_edit_flag != undefined && element.add_edit_flag == true) {

                    if (lstSave == undefined) {
                        lstSave = new Array();
                    }


                    let objNOK: ORMSavePatientNextOfKin = new ORMSavePatientNextOfKin();

                    if (id > 0) {
                        objNOK.next_of_kin_id = id;
                        objNOK.date_created = element.date_created;
                        objNOK.client_date_created = element.client_date_created;
                        objNOK.created_user = element.created_user;
                    }
                    else {
                        objNOK.client_date_created = this.clientDateTime;
                        objNOK.created_user = this.lookupList.logedInUser.user_name;
                    }

                    objNOK.modified_user = this.lookupList.logedInUser.user_name;
                    objNOK.client_date_modified = this.clientDateTime;
                    objNOK.system_ip = this.lookupList.logedInUser.systemIp;
                    objNOK.patient_id = this.patientId;

                    objNOK.first_name = element.first_name;
                    objNOK.last_name = element.last_name;
                    objNOK.mname = element.mname;

                    objNOK.relationship_code = element.relationship_code;

                    objNOK.phone = this.generalService.getPhoneFaxDigitsOnly(element.phone);
                    objNOK.cell_phone = this.generalService.getPhoneFaxDigitsOnly(element.cell_phone);

                    objNOK.address = element.address;
                    objNOK.zip = element.zip;
                    objNOK.city = element.city;
                    objNOK.state = element.state;
                    objNOK.country = "USA";

                    objNOK.practice_id = this.lookupList.practiceInfo.practiceId;
                    objNOK.amendment_request_id = element.amendment_request_id;

                    lstSave.push(objNOK);
                }
            });
        }


        return lstSave;
    }

    /*
    populatePatientImmRegInfoSaveObject(): ORMSavePatientImmRegInfo {

        debugger;
        let objImmRegInfo: ORMSavePatientImmRegInfo;

        if (this.patientImmRegInfo != undefined
            || (this.patInfoFormGroup.get("ddImmRegStatus") as FormControl).value != undefined
            || (this.patInfoFormGroup.get("ddImmRegPublicityCode") as FormControl).value != undefined
            || (this.patInfoFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value != undefined) {

            objImmRegInfo = new ORMSavePatientImmRegInfo();

            if (this.patientImmRegInfo != undefined) {
                objImmRegInfo.registry_info_id = this.patientImmRegInfo.registry_info_id;
                objImmRegInfo.date_created = this.patientImmRegInfo.date_created;
                objImmRegInfo.client_date_created = this.patientImmRegInfo.client_date_created;
                objImmRegInfo.created_user = this.patientImmRegInfo.created_user;
            }
            else {
                objImmRegInfo.client_date_created = this.clientDateTime;
                objImmRegInfo.created_user = this.lookupList.logedInUser.user_name;
            }

            objImmRegInfo.patient_id = this.patientId;
            objImmRegInfo.modified_user = this.lookupList.logedInUser.user_name;
            objImmRegInfo.client_date_modified = this.clientDateTime;
            objImmRegInfo.system_ip = this.lookupList.logedInUser.systemIp;
            objImmRegInfo.practice_id = this.lookupList.practiceInfo.practiceId;

            if ((this.patInfoFormGroup.get("ddImmRegStatus") as FormControl).value != undefined) {
                objImmRegInfo.registry_status = (this.patInfoFormGroup.get("ddImmRegStatus") as FormControl).value;
                let regSatusDate = this.dateTimeUtil.getStringDateFromDateModel((this.patInfoFormGroup.get("dpImmRegStatusEffectiveDate") as FormControl).value);
                objImmRegInfo.registry_status_effective_date = regSatusDate;
            }
            else {
                objImmRegInfo.registry_status = "";
            }
            if ((this.patInfoFormGroup.get("ddImmRegPublicityCode") as FormControl).value != undefined) {
                objImmRegInfo.publicity_code = (this.patInfoFormGroup.get("ddImmRegPublicityCode") as FormControl).value;
                objImmRegInfo.publicity_code_description = this.immRegPublicityCodeDescription;
                let regPubDate = this.dateTimeUtil.getStringDateFromDateModel((this.patInfoFormGroup.get("dpImmRegPublicityCodeEffectiveDate") as FormControl).value);
                objImmRegInfo.publicity_code_effective_date = regPubDate;
            }
            else {
                objImmRegInfo.publicity_code = "";
                objImmRegInfo.publicity_code_description = "";
            }
            if ((this.patInfoFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value != undefined) {
                objImmRegInfo.protection_indicator = (this.patInfoFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value;
                if ((this.patInfoFormGroup.get("ddImmRegProtectionIndicator") as FormControl).value != '') {
                    let regProcDate = this.dateTimeUtil.getStringDateFromDateModel((this.patInfoFormGroup.get("dpImmRegProtectionIndicatorEffectiveDate") as FormControl).value);
                    objImmRegInfo.protection_indicator_effective_date = regProcDate;
                }
            }
            else {
                objImmRegInfo.protection_indicator = "";
            }
        }



        return objImmRegInfo;
    }
    */

    populatePatientCareTeamSaveObject(): Array<ORMSavePatientCareTeam> {

        debugger;
        let lstSave: Array<ORMSavePatientCareTeam>;

        if (this.lstPatientCareTeams != undefined) {
            this.lstPatientCareTeams.forEach(element => {

                let id = element.team_id;
                if (element.add_edit_flag != undefined && element.add_edit_flag == true) {

                    if (lstSave == undefined) {
                        lstSave = new Array();
                    }


                    let objCareTeam: ORMSavePatientCareTeam = new ORMSavePatientCareTeam();
                    objCareTeam.team_id = id;
                    if (id > 0) {
                        objCareTeam.date_created = element.date_created;
                        objCareTeam.client_date_created = element.client_date_created;
                        objCareTeam.created_user = element.created_user;
                    }
                    else {
                        objCareTeam.client_date_created = this.clientDateTime;
                        objCareTeam.created_user = this.lookupList.logedInUser.user_name;
                    }

                    objCareTeam.modified_user = this.lookupList.logedInUser.user_name;
                    objCareTeam.client_date_modified = this.clientDateTime;
                    objCareTeam.system_ip = this.lookupList.logedInUser.systemIp;
                    objCareTeam.patient_id = this.patientId;
                    objCareTeam.team_name = element.team_name;
                    objCareTeam.team_status = element.team_status;
                    objCareTeam.practice_id = this.lookupList.practiceInfo.practiceId;
                    lstSave.push(objCareTeam);
                }
            });
        }

        return lstSave;
    }

    populatePatientCareTeamMembersSaveObject(): Array<ORMSavePatientCareTeamMember> {


        debugger;
        let lstSave: Array<ORMSavePatientCareTeamMember>;

        if (this.lstPatientCareTeamMembers != undefined) {
            this.lstPatientCareTeamMembers.forEach(element => {

                let id = element.id;
                if (element.add_edit_flag != undefined && element.add_edit_flag == true) {

                    if (lstSave == undefined) {
                        lstSave = new Array();
                    }


                    let objCTMember: ORMSavePatientCareTeamMember = new ORMSavePatientCareTeamMember();

                    if (id > 0) {
                        objCTMember.id = id;
                        objCTMember.date_created = element.date_created;
                        objCTMember.client_date_created = element.client_date_created;
                        objCTMember.created_user = element.created_user;
                    }
                    else {
                        objCTMember.client_date_created = this.clientDateTime;
                        objCTMember.created_user = this.lookupList.logedInUser.user_name;
                    }

                    objCTMember.team_id = element.team_id;
                    objCTMember.member_type = element.member_type;
                    objCTMember.member_reference_id = element.member_reference_id;
                    objCTMember.snomed_relationship_code = element.snomed_relationship_code;
                    objCTMember.npi = element.npi;
                    objCTMember.taxonomy = element.taxonomy;
                    objCTMember.pcp = element.pcp;


                    objCTMember.modified_user = this.lookupList.logedInUser.user_name;
                    objCTMember.client_date_modified = this.clientDateTime;
                    objCTMember.system_ip = this.lookupList.logedInUser.systemIp;
                    objCTMember.patient_id = this.patientId;

                    objCTMember.first_name = element.first_name;
                    objCTMember.last_name = element.last_name;
                    objCTMember.phone = this.generalService.getPhoneFaxDigitsOnly(element.phone);
                    objCTMember.address = element.address;
                    objCTMember.address2 = element.address2;
                    objCTMember.zip = element.zip;
                    objCTMember.city = element.city;
                    objCTMember.state = element.state;

                    objCTMember.practice_id = this.lookupList.practiceInfo.practiceId;
                    objCTMember.amendment_request_id = element.amendment_request_id;

                    lstSave.push(objCTMember);
                }
            });
        }

        return lstSave;
    }

    patPicFile: File;
    patPicURL: any;
    onFileChange(event) {
        debugger;
        let reader = new FileReader();

        if (event.target.files && event.target.files.length > 0) {

            this.isPatPicChanged = true;
            this.patPicFile = event.target.files[0];

            if (event.target.files && event.target.files[0]) {

                reader.onload = (event) => {
                    debugger;
                    this.patPicURL = event.target["result"];
                }

                reader.readAsDataURL(event.target.files[0]);

            }

        }
    }

    OnCancel() {


        if (this.callingFrom == CallingFromEnum.PATIENT) {

            this.lstErrors = [];
            this.addEditOperation = undefined;
            this.editMode = false;
            this.isLoading = true;
            this.insuranceDeletedIds = "";
            this.raceEthnicityDeletedIds = "";
            this.nokDeletedIds = "";
            this.careTeamDeletedIds = "";
            this.careTeamMemberDeletedIds = "";
            this.patPicFile = undefined;
            this.patInfoFormGroup.reset();
            this.loadPatientData(true);
            this.isPatPicChanged = false;
        }
        //else{
        this.onCancel.emit();
        //}
    }

    lstErrors: Array<string> = [];
    validateSaveData(patForm: any): boolean {

        debugger;

        let isValid: boolean = true;
        this.lstErrors = [];


        //******** PATIENT VALIDATION */
        if (patForm.txtPatFName == undefined
            || patForm.txtPatFName == ''
            || patForm.txtPatFName == null

        ) {

            this.lstErrors.push("Please enter First Name.");

        }
        if (patForm.txtPatLName == undefined
            || patForm.txtPatLName == ''
            || patForm.txtPatLName == null) {


            this.lstErrors.push("Please enter Last Name.");
        }
        if (patForm.ddPatStatus == undefined
            || patForm.ddPatStatus == ''
            || patForm.ddPatStatus == null) {


            this.lstErrors.push("Please select Patient Status.");
        }

        if (patForm.dpBirthDate == undefined
            || patForm.dpBirthDate == ''
            || patForm.dpBirthDate == null) {


            this.lstErrors.push("Please enter Birth Date.");
        }
        else if (!this.dateTimeUtil.isValidDateTime(patForm.dpBirthDate, DateTimeFormat.DATE_MODEL)) {

            this.lstErrors.push("Birth Date is not in correct format.");
        }
        else if (this.dateTimeUtil.checkIfFutureDate(patForm.dpBirthDate, DateTimeFormat.DATE_MODEL)) {
            this.lstErrors.push("Birth Date cannot be future date.");
        }


        if (patForm.ddGender == undefined
            || patForm.ddGender == ''
            || patForm.ddGender == null) {


            this.lstErrors.push("Please select Patient Gender.");
        }

        if (patForm.ddMultiBirthIndicator == 'Y' &&
            (patForm.ddBirthOrder == undefined
                || patForm.ddBirthOrder == ''
                || patForm.ddBirthOrder == null
            )
        ) {
            this.lstErrors.push("Please select Birth Order.");
        }
        if (patForm.ddGenderIdentity == 'OTH' &&
            (patForm.txtOtherGenderIdentity == undefined
                || patForm.txtOtherGenderIdentity == ''
                || patForm.txtOtherGenderIdentity == null
            )
        ) {
            this.lstErrors.push("Please enter Gender Identity.");
        }

        if (patForm.ddSexualOrientation == 'OTH' &&
            (patForm.txtOtherSexualOrientation == undefined
                || patForm.txtOtherSexualOrientation == ''
                || patForm.txtOtherSexualOrientation == null
            )
        ) {
            this.lstErrors.push("Please enter Sexual Orientation.");
        }


        if (patForm.ddPrimaryPhone == 'CELL PHONE' && (patForm.txtCellPhone == undefined
            || patForm.txtCellPhone == ''
            || patForm.txtCellPhone == null)) {

            this.lstErrors.push("Please enter Cell Phone.");
        }
        else if (patForm.ddPrimaryPhone == 'HOME PHONE' && (patForm.txtHomePhone == undefined
            || patForm.txtHomePhone == ''
            || patForm.txtHomePhone == null)) {

            this.lstErrors.push("Please enter Home Phone.");
        }
        else if (patForm.ddPrimaryPhone == 'WORK PHONE' && (patForm.txtWorkPhone == undefined
            || patForm.txtWorkPhone == ''
            || patForm.txtWorkPhone == null)) {

            this.lstErrors.push("Please enter Work Phone.");
        }


        if ((patForm.ddCommPreference != undefined
            && patForm.ddCommPreference != ''
            && patForm.ddCommPreference != null
        ) &&
            (patForm.txtCommDetail == undefined
                || patForm.txtCommDetail == ''
                || patForm.txtCommDetail == null
            )
        ) {
            this.lstErrors.push("Please enter Confidential Communication Detail.");
        }


        if (patForm.dpDisabledDate != undefined && patForm.dpDisabledDate != '' && patForm.dpDisabledDate != null) {
            if (!this.dateTimeUtil.isValidDateTime(patForm.dpDisabledDate, DateTimeFormat.DATE_MODEL)) {

                this.lstErrors.push("Patient Disabled Date is not in correct format.");
            }
            else if (this.dateTimeUtil.checkIfFutureDate(patForm.dpDisabledDate, DateTimeFormat.DATE_MODEL)) {
                this.lstErrors.push("Patient Disabled cannot be a future date.");
            }
        }
        if (patForm.dpDeathDate != undefined && patForm.dpDeathDate != '' && patForm.dpDeathDate != null) {
            if (!this.dateTimeUtil.isValidDateTime(patForm.dpDeathDate, DateTimeFormat.DATE_MODEL)) {

                this.lstErrors.push("Patient Death Date is not in correct format.");
            }
            else if (this.dateTimeUtil.checkIfFutureDate(patForm.dpDeathDate, DateTimeFormat.DATE_MODEL)) {
                this.lstErrors.push("Patient Death cannot be a future date.");
            }
        }



        /*
        if (patForm.ddImmRegStatus != undefined
            && patForm.ddImmRegStatus != ''
            && patForm.ddCommPreference != null
        ) {

            if (patForm.dpImmRegStatusEffectiveDate == undefined
                || patForm.dpImmRegStatusEffectiveDate == ''
                || patForm.dpImmRegStatusEffectiveDate == null

            ) {
                this.lstErrors.push("Please enter Immunization Registry Status Effective Date.");
            }
            else if (!this.dateTimeUtil.isValidDateTime(patForm.dpImmRegStatusEffectiveDate, DateTimeFormat.DATE_MODEL)) {
                this.lstErrors.push("Immunization Registry Status Effective Date is not in correct formate.");
            }
            else if (this.dateTimeUtil.checkIfFutureDate(patForm.dpImmRegStatusEffectiveDate, DateTimeFormat.DATE_MODEL)) {
                this.lstErrors.push("Immunization Registry Status Effective Date cannot be a future date.");
            }

        }
        if (patForm.ddImmRegPublicityCode != undefined
            && patForm.ddImmRegPublicityCode != ''
            && patForm.ddImmRegPublicityCode != null
        ) {

            if (patForm.dpImmRegPublicityCodeEffectiveDate == undefined
                || patForm.dpImmRegPublicityCodeEffectiveDate == ''
                || patForm.dpImmRegPublicityCodeEffectiveDate == null

            ) {
                this.lstErrors.push("Please enter Immunization Publicity Code Effective Date.");
            }
            else if (!this.dateTimeUtil.isValidDateTime(patForm.dpImmRegPublicityCodeEffectiveDate, DateTimeFormat.DATE_MODEL)) {
                this.lstErrors.push("Immunization Registry Publicity Code Effective Date is not in correct formate.");
            }
            else if (this.dateTimeUtil.checkIfFutureDate(patForm.dpImmRegPublicityCodeEffectiveDate, DateTimeFormat.DATE_MODEL)) {
                this.lstErrors.push("Immunization Registry Publicity Code Effective Date cannot be a future date.");
            }

        }

        if (patForm.ddImmRegProtectionIndicator != undefined
            && patForm.ddImmRegProtectionIndicator != ''
            && patForm.ddImmRegProtectionIndicator != null
        ) {

            if (patForm.dpImmRegProtectionIndicatorEffectiveDate == undefined
                || patForm.dpImmRegProtectionIndicatorEffectiveDate == ''
                || patForm.dpImmRegProtectionIndicatorEffectiveDate == null

            ) {
                this.lstErrors.push("Please enter Immunization Protection Indicator Effective Date.");
            }
            else if (!this.dateTimeUtil.isValidDateTime(patForm.dpImmRegProtectionIndicatorEffectiveDate, DateTimeFormat.DATE_MODEL)) {
                this.lstErrors.push("Immunization Registry Protection Indicator Effective Date is not in correct formate.");
            }

            else if (this.dateTimeUtil.checkIfFutureDate(patForm.dpImmRegProtectionIndicatorEffectiveDate, DateTimeFormat.DATE_MODEL)) {
                this.lstErrors.push("Immunization Registry Protection Indicator Effective Date cannot be a future date.");
            }

        }
        */

        //******** END PATIENT VALIDATION */

        //******** PATIENT INSURANCE VALIDATION */

        let isPriInsExist: Boolean = false;
        let isSecInsExist: Boolean = false;
        let isOthInsExist: Boolean = false;


        if (!this.isSelfPay && this.lstPatInsurance != undefined && this.lstPatInsurance.length > 0) {
            this.lstPatInsurance.forEach(ins => {


                if (ins.insurace_type.toLowerCase() == 'primary') {
                    isPriInsExist = true;
                }
                else if (ins.insurace_type.toLowerCase() == 'secondary') {
                    isSecInsExist = true;
                }
                else if (ins.insurace_type.toLowerCase() == 'other') {
                    isOthInsExist = true;
                }

                if (patForm['txtInsuranceName_' + ins.patientinsurance_id] == undefined || patForm['txtInsuranceName_' + ins.patientinsurance_id] == null || patForm['txtInsuranceName_' + ins.patientinsurance_id] == '') {
                    this.lstErrors.push("Please enter " + ins.insurace_type + " Insurance.");
                }

                if (patForm['txtPolicyNo_' + ins.patientinsurance_id] == undefined || patForm['txtPolicyNo_' + ins.patientinsurance_id] == null || patForm['txtPolicyNo_' + ins.patientinsurance_id] == '') {
                    this.lstErrors.push("Please enter " + ins.insurace_type + " Insurance Policy Number.");
                }

                if (patForm['ddInsuranceSubscriberRel_' + ins.patientinsurance_id] != undefined
                    && patForm['ddInsuranceSubscriberRel_' + ins.patientinsurance_id] != null
                    && patForm['ddInsuranceSubscriberRel_' + ins.patientinsurance_id] != ''
                    && patForm['ddInsuranceSubscriberRel_' + ins.patientinsurance_id] != 'SELF'
                    && (patForm['txtInsuranceSubscriber_' + ins.patientinsurance_id] == undefined || patForm['txtInsuranceSubscriber_' + ins.patientinsurance_id] == null || patForm['txtInsuranceSubscriber_' + ins.patientinsurance_id] == '')) {
                    this.lstErrors.push("Please enter " + ins.insurace_type + " Insurance Subscriber.");
                }


                if (patForm['dpInsStartDate_' + ins.patientinsurance_id] != undefined && patForm['dpInsStartDate_' + ins.patientinsurance_id] != '' && patForm['dpInsStartDate_' + ins.patientinsurance_id] != null) {
                    if (!this.dateTimeUtil.isValidDateTime(patForm['dpInsStartDate_' + ins.patientinsurance_id], DateTimeFormat.DATE_MODEL)) {

                        this.lstErrors.push(ins.insurace_type + " Insurance Start Date is not in correct format.");
                    }
                }

                if (patForm['dpInsEndDate_' + ins.patientinsurance_id] != undefined && patForm['dpInsEndDate_' + ins.patientinsurance_id] != '' && patForm['dpInsEndDate_' + ins.patientinsurance_id] != null) {
                    if (!this.dateTimeUtil.isValidDateTime(patForm['dpInsEndDate_' + ins.patientinsurance_id], DateTimeFormat.DATE_MODEL)) {

                        this.lstErrors.push(ins.insurace_type + " Insurance End Date is not in correct format.");
                    }
                }

            });
        }

        if (isOthInsExist) {
            if (!isPriInsExist) {
                this.lstErrors.push("Please enter Primary Insurance.");
            }
            if (!isSecInsExist) {
                this.lstErrors.push("Please enter Secondary Insurance.");
            }
        }
        else if (isSecInsExist) {
            if (!isPriInsExist) {
                this.lstErrors.push("Please enter Primary Insurance.");
            }
        }

        //******** END INSURANCE VALIDATION */


        // Care Team Validation:
        let CareTeamErrorMsg: string = "";
        if (this.lstPatientCareTeams != undefined) {
            this.lstPatientCareTeams.forEach(element => {

                if (CareTeamErrorMsg == "") {
                    let membersList: Array<any> = new ListFilterPipe().transform(this.lstPatientCareTeamMembers, "team_id", element.team_id)

                    if (membersList == undefined || membersList.length == 0) {
                        this.lstErrors.push("Care Team must have at least one member.");
                        //CareTeamErrorMsg = "Care Team must have at least one member."
                    }
                }
            });
        }

        if (this.lstErrors.length > 0) {
            isValid = false;
        }
        return isValid;

    }

    patientSaveObjectWrapper: PatientSaveObjectWrapper;
    onSubmit(patForm: any) {
        debugger;

        this.isSaving = true;

        if (!this.validateSaveData(patForm)) {
            this.isSaving = false;
            return;
        }

        this.clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

        let objORMPatient: ORMSavePatient = this.populatePatientSaveObject(patForm);
        let lstRaceEthnicitySave: Array<ORMSavePatientRaceEthnicity> = this.populatePatientRaceEthnicitySaveObject();
        let lstPatIns: Array<ORMSavePatientInsurance> = this.populatePatientInsuranceSaveObject();
        let lstPatNOK: Array<ORMSavePatientNextOfKin> = this.populatePatientNextOfKinSaveObject();
        //let objImmRegInfo: ORMSavePatientImmRegInfo = this.populatePatientImmRegInfoSaveObject();
        let lstCareTeam: Array<ORMSavePatientCareTeam> = this.populatePatientCareTeamSaveObject();
        let lstCareTeamMember: Array<ORMSavePatientCareTeamMember> = this.populatePatientCareTeamMembersSaveObject();




        this.patientSaveObjectWrapper = new PatientSaveObjectWrapper();
        this.patientSaveObjectWrapper.patient_id = this.patientId;
        this.patientSaveObjectWrapper.practice_id = this.lookupList.practiceInfo.practiceId;
        this.patientSaveObjectWrapper.loged_in_user = this.lookupList.logedInUser.user_name;
        this.patientSaveObjectWrapper.client_date = this.clientDateTime;
        this.patientSaveObjectWrapper.system_ip = this.lookupList.logedInUser.systemIp;

        let lstDeletedIds: Array<ORMKeyValue>;
        if (this.raceEthnicityDeletedIds != undefined && this.raceEthnicityDeletedIds != "") {

            if (lstDeletedIds == undefined) {
                lstDeletedIds = new Array();
            }
            lstDeletedIds.push(new ORMKeyValue('patient_race_ethnicity', this.raceEthnicityDeletedIds))
        }
        if (this.insuranceDeletedIds != undefined && this.insuranceDeletedIds != "") {
            if (lstDeletedIds == undefined) {
                lstDeletedIds = new Array();
            }
            lstDeletedIds.push(new ORMKeyValue('patient_insurance', this.insuranceDeletedIds))
        }
        if (this.nokDeletedIds != undefined && this.nokDeletedIds != "") {
            if (lstDeletedIds == undefined) {
                lstDeletedIds = new Array();
            }
            lstDeletedIds.push(new ORMKeyValue('patient_next_of_kin', this.nokDeletedIds))
        }
        if (this.careTeamDeletedIds != undefined && this.careTeamDeletedIds != "") {
            if (lstDeletedIds == undefined) {
                lstDeletedIds = new Array();
            }
            lstDeletedIds.push(new ORMKeyValue('patient_care_team', this.careTeamDeletedIds))
        }
        if (this.careTeamMemberDeletedIds != undefined && this.careTeamMemberDeletedIds != "") {
            if (lstDeletedIds == undefined) {
                lstDeletedIds = new Array();
            }
            lstDeletedIds.push(new ORMKeyValue('care_team_member', this.careTeamMemberDeletedIds))
        }

        this.patientSaveObjectWrapper.lst_deleted_ids = lstDeletedIds;
        this.patientSaveObjectWrapper.patient = objORMPatient;
        this.patientSaveObjectWrapper.lst_race_ethnicity = lstRaceEthnicitySave;
        this.patientSaveObjectWrapper.lst_patient_insurance = lstPatIns;
        this.patientSaveObjectWrapper.lst_next_of_kin = lstPatNOK;
        this.patientSaveObjectWrapper.lst_care_team = lstCareTeam;
        this.patientSaveObjectWrapper.lst_care_team_member = lstCareTeamMember;
        //this.patientSaveObjectWrapper.imm_reg_info = objImmRegInfo;


        debugger;
        if (!this.patientSaveObjectWrapper.patient.self_pay &&
            (this.lstPatInsurance == undefined || this.lstPatInsurance.length == 0)) {

            this.isSaving = false;
            const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
            modalRef.componentInstance.promptHeading = 'Confirm No Insurance!';
            modalRef.componentInstance.promptMessage = "No Insurance is entered.<br>Do You want to save patient as Selfpay.";
            modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;

            modalRef.result.then((result) => {
                debugger;
                if (result == PromptResponseEnum.YES) {
                    this.patientSaveObjectWrapper.patient.self_pay = true;
                    this.savePatient();
                }
                if (result == PromptResponseEnum.NO) {
                    this.selectedTab = "tab_pat_ins";
                    this.isSaving = false;
                }
                else {
                    this.isSaving = false;
                }
            }, (reason) => {

                this.isSaving = false;
            });

        }
        else {
            this.savePatient();
        }
    }

    savePatient() {

        this.isSaving = true;

        const imgFile: File = this.patPicFile;
        const formDate: FormData = new FormData();
        if (imgFile != undefined) {
            formDate.append('pic', imgFile);
        }

        formDate.append('patient_data', JSON.stringify(this.patientSaveObjectWrapper));

        this.patientService.savePatient(formDate).subscribe(
            data => {
                debugger;
                this.isSaving = false;
                this.isPatPicChanged = false;
                this.savePatientSuccess(data);
            },
            error => {
                debugger;
                this.isSaving = false;
                this.savePatientError(error);
            }
        );
    }

    savePatientSuccess(data) {

        debugger;
        if (data.status === ServiceResponseStatusEnum.SUCCESS) {

            this.patientId = Number(data.result);

            if (this.callingFrom == CallingFromEnum.PATIENT) {
                this.addEditOperation = undefined;
                this.insuranceDeletedIds = "";
                this.raceEthnicityDeletedIds = "";
                this.nokDeletedIds = "";
                this.careTeamDeletedIds = "";
                this.careTeamMemberDeletedIds = "";
                this.patPicFile = undefined;
                this.patInfoFormGroup.reset();
                this.editMode = false;
                this.removeAllInsuranceControls();

                this.loadPatientData(true);

            }
            let patientToOpen: PatientToOpen = new PatientToOpen();
            patientToOpen.patient_id = this.patientId;
            patientToOpen.patient_name = this.patientName;
            this.onSave.emit(patientToOpen);

            //}            
        }
        else if (data.status === ServiceResponseStatusEnum.ERROR) {
            GeneralOperation.showAlertPopUp(this.ngbModal, "Save Patient", data.response, AlertTypeEnum.DANGER)
        }
    }

    savePatientError(error) {
        debugger;
        //this.logMessage.log("savePatient Error.");
        GeneralOperation.showAlertPopUp(this.ngbModal, "Save Patient", error.message, AlertTypeEnum.DANGER)
    }


    RaceOMBChanged(event: any, obmCode: string) {

        debugger;

        //let IDArray = val.target.id.split("_");
        //let ombCode = IDArray[1];

        if (event.target.checked) {

            this.lstPatOMBRace.forEach(ombRace => {
                if (ombRace.omb_code == obmCode) {
                    this.addRace({
                        cdc_code: "",
                        cdc_description: "",
                        omb_code: ombRace.omb_code,
                        omb_description: ombRace.omb_description,
                        add_edit_flag: true
                    }
                    );
                }
            });
        }
        else if (!event.target.checked) {

            for (let i: number = this.lstPatRace.length - 1; i >= 0; i--) {

                if (this.lstPatRace[i]['omb_code'] == obmCode) {
                    this.lstPatRace.splice(i, 1);
                }
            }
            this.populateRaceCDC();
        }

    }

    EthnicityOMBChanged(event: any, objCode: string) {


        //let IDArray = val.target.id.split("_");
        //let ombCode = IDArray[1];

        if (event.target.checked) {
            this.lstPatOMBEthnicity.forEach(ombEth => {
                if (ombEth.omb_code == objCode) {
                    this.addEthnicity({ cdc_code: "", cdc_description: "", omb_code: ombEth.omb_code, omb_description: ombEth.omb_description, add_edit_flag: true });
                }
            });
        }
        else if (!event.target.checked) {

            for (let i: number = this.lstPatEthnicity.length - 1; i >= 0; i--) {

                if (this.lstPatEthnicity[i]['omb_code'] == objCode) {
                    this.lstPatEthnicity.splice(i, 1);
                }
            }
            this.populateEthnicityCDC();
        }
    }

    zipChanged() {
        this.isZipChanged = true;
    }
    zipFocusOut(zipCode: string) {

        debugger;
        if (this.isZipLoading || this.isZipChanged || this.patient.zip != zipCode) {
            this.isZipChanged = false;
            this.state = "";
            this.lstZipCityState = [];
            this.lstCountryParishCode = [];
            if (zipCode != undefined) {
                if (zipCode.replace("-", "").length == 5 || zipCode.replace("-", "").length == 9) {
                    this.getCityStateByZipCode(zipCode);
                }
            }
        }
    }

    getCityStateByZipCode(zipCode) {

        this.generalService.getCityStateByZipCode(zipCode).subscribe(
            data => {
                this.lstZipCityState = data as Array<any>;
                if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
                    this.state = this.lstZipCityState[0].state;


                    if (this.isZipLoading) {
                        (this.patInfoFormGroup.get("ddCity") as FormControl).setValue(this.patient.city);
                        this.iscountryCodeLoading = true
                    }
                    else if (this.lstZipCityState.length > 1) {
                        (this.patInfoFormGroup.get("ddCity") as FormControl).setValue(null);
                    }
                    else if (this.lstZipCityState.length == 1) {
                        (this.patInfoFormGroup.get("ddCity") as FormControl).setValue(this.lstZipCityState[0].city);
                    }

                    this.getCountryParishCodeByState(this.state);

                    this.isZipLoading = false;
                }
                this.isZipLoading = false;
            },
            error => {
                this.isZipLoading = false;
                this.getCityStateByZipCodeError(error);
            }
        );
    }

    getCityStateByZipCodeError(error) {
        this.logMessage.log("getCityStateByZipCode Error." + error);
    }


    getCountryParishCodeByState(state) {

        this.generalService.getCountryParishCodeByState(state).subscribe(
            data => {
                this.lstCountryParishCode = data as Array<any>;

                if (this.iscountryCodeLoading) {
                    (this.patInfoFormGroup.get("ddParishcode") as FormControl).setValue(this.patient.county_code);
                    this.iscountryCodeLoading = false;
                }
                else {
                    (this.patInfoFormGroup.get("ddParishcode") as FormControl).setValue(null);
                }
            },
            error => {
                this.iscountryCodeLoading = false;
                this.getCountryParishCodeByStateError(error);
            }
        );
    }

    getCountryParishCodeByStateError(error) {
        this.logMessage.log("getCountryParishCodeByState Error." + error);
    }


    WCzipChanged(id) {
        this.lstInsuranceWCCities.forEach(element => {
            if (element.id == id) {
                element.zip_changed = true;
            }
        });
    }
    WCzipFocusOut(id, zipCode) {

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

            //this.state = "";
            //this.lstZipCityState = [];
            //this.lstCountryParishCode = [];



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

    getWCCityStateByZipCode(id, zipCode) {

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

                this.lstPatInsurance.forEach(element => {
                    if (element.patientinsurance_id == id) {
                        if (lstCity != undefined && lstCity.length > 0) {
                            element.workercomp_state = lstCity[0].state;
                        }
                        else {
                            element.workercomp_state = "";
                        }
                    }
                });

                /*

                this.lstZipCityState = data;
                if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
                    this.state = this.lstZipCityState[0].state;

                    
                    if (this.isZipLoading) {
                        (this.patInfoFormGroup.get("ddCity") as FormControl).setValue(this.patient.city);
                        this.iscountryCodeLoading = true
                    }
                    else if (this.lstZipCityState.length > 1) {
                        (this.patInfoFormGroup.get("ddCity") as FormControl).setValue(null);
                    }

                    this.getCountryParishCodeByState(this.state);

                    this.isZipLoading = false;
                }
                this.isZipLoading = false;
                */
            },
            error => {
                // this.isZipLoading = false;
                this.getWCCityStateByZipCodeError(error);
            }
        );
    }

    getWCCityStateByZipCodeError(error) {
        this.logMessage.log("getWCCityStateByZipCode Error." + error);
    }

    onPatientSubsciberSearchKeydown(event) {
        if (event.key === "Enter") {
            this.showPatientSubscriberSearch = true;
        }
        else {
            this.showPatientSubscriberSearch = false;
        }
    }

    closePatientSubsciberSearch() {
        if ((this.patInfoFormGroup.get("txtPatientSubscriberIDHidden") as FormControl).value == "" || (this.patInfoFormGroup.get("txtPatientSubscriberIDHidden") as FormControl).value == undefined) {
            (this.patInfoFormGroup.get("txtPatientSubscriber") as FormControl).setValue(null);
            (this.patInfoFormGroup.get("txtPatientSubscriberIDHidden") as FormControl).setValue(null);
        }
        this.showPatientSubscriberSearch = false;
    }

    addPatientSubsciber(obj) {
        let subsriberObject = obj.gurantor;
        (this.patInfoFormGroup.get("txtPatientSubscriber") as FormControl).setValue(subsriberObject.name);
        (this.patInfoFormGroup.get("txtPatientSubscriberIDHidden") as FormControl).setValue(subsriberObject.id);
        this.showPatientSubscriberSearch = false;
    }

    onPatientSubsciberFocusOut() {
        if ((this.patInfoFormGroup.get("txtPatientSubscriberIDHidden") as FormControl).value == "" || (this.patInfoFormGroup.get("txtPatientSubscriberIDHidden") as FormControl).value == undefined) {
            (this.patInfoFormGroup.get("txtPatientSubscriber") as FormControl).setValue(null);
            (this.patInfoFormGroup.get("txtPatientSubscriberIDHidden") as FormControl).setValue(null);
        }

    }


    onRefPhysicianFocusOut() {

        if ((this.patInfoFormGroup.get("txtRefPhyIDHidden") as FormControl).value == "" || (this.patInfoFormGroup.get("txtRefPhyIDHidden") as FormControl).value == undefined) {
            (this.patInfoFormGroup.get("txtRefPhy") as FormControl).setValue(null);
            (this.patInfoFormGroup.get("txtRefPhyIDHidden") as FormControl).setValue(null);
        }

    }

    onRefPhysicianSearchKeydown(event) {
        if (event.key === "Enter") {
            this.showRefPhySearch = true;
        }
        else {
            this.showRefPhySearch = false;
        }
    }

    closeRefPhysicianSearch() {
        if ((this.patInfoFormGroup.get("txtRefPhyIDHidden") as FormControl).value == "" || (this.patInfoFormGroup.get("txtRefPhyIDHidden") as FormControl).value == undefined) {
            (this.patInfoFormGroup.get("txtRefPhy") as FormControl).setValue(null);
            (this.patInfoFormGroup.get("txtRefPhyIDHidden") as FormControl).setValue(null);
        }

        this.showRefPhySearch = false;
    }

    addRefPhysician(refPhy: any) {
        (this.patInfoFormGroup.get("txtRefPhy") as FormControl).setValue(refPhy.first_name + ' ' + refPhy.last_name);
        (this.patInfoFormGroup.get("txtRefPhyIDHidden") as FormControl).setValue(refPhy.referral_id);
        this.showRefPhySearch = false;
    }

    checkIfAllInsuranceExist() {


        let priExist: boolean = false;
        let secExist: boolean = false;
        let othExist: boolean = false;

        if (this.lstPatInsurance == null || this.lstPatInsurance == undefined) {
            this.lstPatInsurance = new Array();
        }

        this.lstPatInsurance.forEach(ins => {

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

        if (this.lstPatInsurance == null || this.lstPatInsurance == undefined) {
            this.lstPatInsurance = new Array();
        }

        this.lstPatInsurance.forEach(ins => {

            if (ins.insurace_type.toLowerCase() == type.toLowerCase()) {
                isExist = true;
            }

        });

        return isExist;
    }

    /*
    OnAddNewInsurance(type: string) {


        if (this.checkIfInsuranceExist(type)) {
            alert(type + " insurance already exist in the list.");
        }
        else {

            let id: Number = -1;
            if (this.lstPatInsurance.length > 0) {
                id = (this.lstPatInsurance.length + 1) * -1;
            }

            this.patInfoFormGroup.addControl("txtInsuranceName_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("txtInsuranceSubscriber_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("ddInsuranceSubscriberRel_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("txtPolicyNo_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("txtGroupNo_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("dpInsStartDate_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("dpInsEndDate_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("txtInsCopy_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("txtInsPCP_" + id, this.formBuilder.control(null));

            this.patInfoFormGroup.addControl("txtWorkerCompName_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("txtWorkerCompAddress_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("txtWCZipCode_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("txtWCState_" + id, this.formBuilder.control(null));
            this.patInfoFormGroup.addControl("ddWorkerCompCity_" + id, this.formBuilder.control(null));



            if (this.lstInsuranceWCCities == undefined)
                this.lstInsuranceWCCities = new Array();

            this.lstInsuranceWCCities.push({ id: id, zip_code: undefined, zip_changed: false, zip_loading: false, lstCities: [] });


            if (type == "Primary") {
                this.lstPatInsurance.push({ patientinsurance_id: id, insurace_type: 'Primary' });
            }
            else if (type == "Secondary") {
                this.lstPatInsurance.push({ patientinsurance_id: id, insurace_type: 'Secondary' });
            }
            else if (type == "Other") {
                this.lstPatInsurance.push({ patientinsurance_id: id, insurace_type: 'Other' });
            }

            this.isInsuranceExists = true;
        }

    }
*/
    onInsuranceSearchInput(event: any, id: number) {
        this.setInsuranceVisiblity(id, "false");
    }

    onInsuranceSearchEnter(event: any, id: number) {

        //if (event.key === "Enter") {
        this.setInsuranceVisiblity(id, "true");
        //}
        //else if (event.key == 'ArrowDown') {
        //this.shiftFocusToInsSearch(id);
        //}
        //else {
        //this.setInsuranceVisiblity(id, "false");
        //}
    }
    shiftFocusToInsSearch(insId: number) {

        if (this.showInsuranceSearch(insId)) {
            this.inlinePatientInsSearch.focusFirstIndex();
        }
    }

    showInsuranceSearch(id) {
        let show: boolean = false;
        this.lstShowInsuranceSearch.forEach(element => {
            if (element.key == id) {
                show = element.value == "true" ? true : false;
            }
        });

        return show

    }

    addInsurance(obj) {

        debugger;

        let recordId = obj.record_id;
        let insObject = obj.insurance;


        this.logMessage.log(recordId);
        this.logMessage.log(insObject);

        this.lstPatInsurance.forEach(ins => {
            if (ins.patientinsurance_id == recordId) {
                ins.name = insObject.insurance_name;
                ins.insurance_id = insObject.insurance_id;
                ins.address = insObject.address + " (" + insObject.city + ", " + insObject.state + " " + insObject.zip + ")";
                ins.phone = insObject.phone;
                ins.add_edit_flag = true;
                (this.patInfoFormGroup.get("txtInsuranceName_" + recordId) as FormControl).setValue(insObject.insurance_name);
                //(this.patInfoFormGroup.get("txtInsuranceID_" + recordId) as FormControl).setValue(insObject.insurance_id);
            }
        });

        this.setInsuranceVisiblity(recordId, "false");
    }

    closeInsuranceSearch(recordId) {
        this.setInsuranceVisiblity(recordId, "false");

    }
    onRemoveInsurance(id, name) {

        const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
        modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
        modalRef.componentInstance.promptMessage = 'Do you want to delete selected Insurance?<br>' + name;
        modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
        let closeResult;

        modalRef.result.then((result) => {
            debugger;
            if (result == PromptResponseEnum.YES) {
                for (let i: number = this.lstPatInsurance.length - 1; i >= 0; i--) {

                    let element = this.lstPatInsurance[i];
                    if (id != undefined && id != "") {
                        if (element.patientinsurance_id == id) {
                            this.lstPatInsurance.splice(i, 1);
                            if (id > 0) {
                                if (this.insuranceDeletedIds != "") {
                                    this.insuranceDeletedIds += ","
                                }
                                this.insuranceDeletedIds += id;
                            }
                        }
                    }
                }

                this.removeInsuranceControlsById(id);

                /*
                if (this.lstPatInsurance == undefined || this.lstPatInsurance.length == 0) {
                    this.isInsuranceExists = false;
                }
                */
            }
        }, (reason) => {
            //alert(reason);
        });





    }

    setInsuranceVisiblity(id, option) {

        let found: boolean = false;
        this.lstShowInsuranceSearch.forEach(element => {
            if (element.key == id && !found) {
                element.value = option;
                found = true;
            }
        });

        if (!found) {
            this.lstShowInsuranceSearch.push(new ORMKeyValue(id, option));
        }
    }


    onInsuranceSubscriberSearchKeydown(event, id) {

        if (event.key === "Enter") {
            this.setInsuranceSubscriberVisiblity(id, "true");
        }
        else {
            this.setInsuranceSubscriberVisiblity(id, "false");
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

    onInsuranceSearchFocusOut(id: number) {

        if (!this.showInsuranceSearch(id)) {
            if ((this.patInfoFormGroup.get("txtInsuranceName_" + id) as FormControl).value == "" || (this.patInfoFormGroup.get("txtInsuranceName_" + id) as FormControl).value == undefined) {

                (this.patInfoFormGroup.get("txtInsuranceName_" + id) as FormControl).setValue(null);
                ///(this.patInfoFormGroup.get("txtInsuranceID_" + id) as FormControl).setValue(null);
                if (this.lstPatInsurance != undefined && this.lstPatInsurance.length > 0) {
                    this.lstPatInsurance.forEach(ins => {
                        if (ins.patientinsurance_id == id) {
                            ins.name = undefined;
                            ins.insurance_id = undefined;
                            ins.address = undefined;
                            ins.phone = undefined;
                        }
                    });
                }
            }
            else {

                this.lstPatInsurance.forEach(element => {

                    if (element.patientinsurance_id == id) {
                        (this.patInfoFormGroup.get("txtInsuranceName_" + id) as FormControl).setValue(element.name);
                    }

                });

            }
        }

    }

    addInsuranceSubscriber(obj) {

        let recordId = obj.record_id;
        let subsriberObject = obj.gurantor;


        this.logMessage.log(recordId);
        this.logMessage.log(subsriberObject);

        this.lstPatInsurance.forEach(ins => {
            if (ins.patientinsurance_id == recordId) {
                ins.guarantor_name = subsriberObject.name;
                ins.guarantor_id = subsriberObject.id;
                ins.add_edit_flag = true;
                (this.patInfoFormGroup.get("txtInsuranceSubscriber_" + recordId) as FormControl).setValue(subsriberObject.name);
            }
        });

        this.setInsuranceSubscriberVisiblity(recordId, "false");
    }

    closeInsuranceSubscriberSearch(recordId) {
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

    onInsuranceSubscriberFocusOut(id) {
        if ((this.patInfoFormGroup.get("txtInsuranceSubscriber_" + id) as FormControl).value == "" || (this.patInfoFormGroup.get("txtInsuranceSubscriber_" + id) as FormControl).value == undefined) {
            if (this.lstPatInsurance != undefined && this.lstPatInsurance.length > 0) {
                this.lstPatInsurance.forEach(ins => {
                    if (ins.patientinsurance_id == id) {
                        ins.guarantor_name = undefined;
                        ins.guarantor_id = undefined;
                        (this.patInfoFormGroup.get("txtInsuranceSubscriber_" + id) as FormControl).setValue(null);

                    }
                });
            }
        }
    }


    addEditNextOfKin(operation, data) {


        this.nokOperation = operation;
        const modalRef = this.ngbModal.open(NextOfKinPopupComponent, this.popUpOptions);

        modalRef.componentInstance.operationType = operation;
        modalRef.componentInstance.patientId = this.patientId;
        modalRef.componentInstance.data = data;

        let id: Number = -1;
        if (operation == "EDIT") {
            id = data.next_of_kin_id;
        }
        else {
            if (this.lstNextOfKin != undefined && this.lstNextOfKin.length > 0) {
                id = (this.lstNextOfKin.length + 1) * -1;
            }
        }
        modalRef.componentInstance.nokId = id;
        //let closeResult;
        modalRef.result.then((result) => {
            if (result != undefined) {
                if (this.nokOperation == "ADD") {
                    if (this.lstNextOfKin == undefined)
                        this.lstNextOfKin = new Array();

                    this.lstNextOfKin.push(result);
                }
                else if (this.nokOperation == "EDIT") {

                    this.lstNextOfKin.forEach(element => {
                        if (element.next_of_kin_id == result.next_of_kin_id) {
                            element.first_name = result.first_name;
                            element.mname = result.mname;
                            element.last_name = result.last_name;
                            element.relationship_code = result.relationship_code;
                            element.relationship_description = result.relationship_description;
                            element.zip = result.zip;
                            element.city = result.city;
                            element.state = result.state;
                            element.state = result.state;
                            element.country = result.country;
                            element.address = result.address;
                            element.phone = result.phone;
                            element.cell_phone = result.cell_phone;
                            element.created_user = result.created_user;
                            element.client_date_created = result.client_date_created;
                            element.date_created = result.date_created;
                            element.add_edit_flag = true;
                        }
                    });

                }

            }
        }
            , (reason) => {

                //alert(reason);
            });

    }

    onRemoveNOK(id) {


        for (let i: number = this.lstNextOfKin.length - 1; i >= 0; i--) {

            let element = this.lstNextOfKin[i];
            if (id != undefined && id != "") {
                if (element.next_of_kin_id == id) {
                    this.lstNextOfKin.splice(i, 1);
                    if (id > 0) {
                        if (this.nokDeletedIds != "") {
                            this.nokDeletedIds += ","
                        }
                        this.nokDeletedIds += id;
                    }
                }
            }
        }
    }

    addNewInsurance(operation, insType, data) {

        this.insOperation = operation;
        if (this.insOperation == "ADD") {

            let isExist: boolean = false;

            if (this.lstPatInsurance == null || this.lstPatInsurance == undefined) {
                this.lstPatInsurance = new Array();
            }

            this.lstPatInsurance.forEach(ins => {

                if (ins.insurace_type == insType) {
                    isExist = true;
                }

            });



            if (isExist) {
                alert(insType + " insurance already exist in the list.");
                return;
            }
        }


        const modalRef = this.ngbModal.open(PatientInsuranceAddEditPopupComponent, this.insPopUpOptions);

        modalRef.componentInstance.operationType = operation;
        modalRef.componentInstance.patientId = this.patientId;
        modalRef.componentInstance.insType = insType;
        modalRef.componentInstance.data = data;

        //let id: Number = -1;
        if (operation == "EDIT") {
            //modalRef.componentInstance.Id = id;
            modalRef.componentInstance.Id = data.patientinsurance_id;
        }
        else {
            //if (this.lstPatInsurance.length > 0) {
            this.tempPatInsuranceId--;
            modalRef.componentInstance.Id = this.tempPatInsuranceId;
            //id = (this.lstPatInsurance.length + 1) * -1;
            //}
        }
        //modalRef.componentInstance.Id = id;
        //let closeResult;
        modalRef.result.then((result) => {
            if (result != undefined) {

                if (this.insOperation == "ADD") {

                    let objInsurance = {
                        patientinsurance_id: result.id,
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
                        issue_date: result.start_date,
                        end_date: result.end_date,

                        workercomp_name: result.workercomp_name,
                        workercomp_address: result.workercomp_address,
                        workercomp_zip: result.workercomp_zip,
                        workercomp_city: result.workercomp_city,
                        workercomp_state: result.workercomp_state,
                        add_edit_flag: true
                    };


                    if (this.lstInsuranceWCCities == undefined)
                        this.lstInsuranceWCCities = new Array();

                    this.lstInsuranceWCCities.push({ id: result.id, zip_code: objInsurance.workercomp_zip, zip_changed: false, zip_loading: false, lstCities: [{ zip_code: objInsurance.workercomp_zip, city: objInsurance.workercomp_city, state: objInsurance.state }] });

                    if (this.lstPatInsurance == undefined)
                        this.lstPatInsurance = new Array();

                    let index: number = GeneralOperation.getIndexForNewInsuranceEntry(this.lstPatInsurance, objInsurance.insurace_type);
                    //this.lstPatInsurance.push(objInsurance);                    
                    this.lstPatInsurance.splice(index, 0, objInsurance);
                    this.addInsuranceControlsToFormGroup(objInsurance);

                }
                else if (this.insOperation == "EDIT") {


                    this.lstPatInsurance.forEach(element => {
                        if (element.patientinsurance_id == result.patientinsurance_id) {

                        }
                    });

                }

            }
        }
            , (reason) => {

                //alert(reason);
            });

    }
    genderSelecttionchange(args) {

        //this.countryValue = args.target.value; 
        this.genderDescription = args.target.options[args.target.selectedIndex].text;
    }
    maritalStatusSelecttionchange(args) {

        //this.countryValue = args.target.value; 
        this.maritalStatus = args.target.options[args.target.selectedIndex].text;
    }
    languageSelecttionchange(args) {

        //this.countryValue = args.target.value; 
        this.languageDescription = args.target.options[args.target.selectedIndex].text;
    }
    genderIdentitySelecttionchange(args) {

        //this.countryValue = args.target.value; 
        this.genderIdentityreDescription = args.target.options[args.target.selectedIndex].text;
    }
    sexualOrientationSelecttionchange(args) {

        //this.countryValue = args.target.value; 
        this.sexualOrientationDescription = args.target.options[args.target.selectedIndex].text;
    }
    immRegPublicityCodeSelecttionchange(args) {

        //this.countryValue = args.target.value; 
        this.immRegPublicityCodeDescription = args.target.options[args.target.selectedIndex].text.split(" - ")[1];
    }


    addEditCareTeam(operation, data) {

        //this.nokOperation = operation;
        const modalRef = this.ngbModal.open(PatientCareTeamAddEditPopupComponent, this.popUpOptions);
        modalRef.componentInstance.patientId = this.patientId;
        modalRef.componentInstance.operationType = operation;
        modalRef.componentInstance.data = data;

        let id: Number = -1;
        if (operation == "EDIT") {
            id = data.team_id;
        }
        else {
            if (this.lstPatientCareTeams != undefined && this.lstPatientCareTeams.length > 0) {
                id = (this.lstPatientCareTeams.length + 1) * -1;
            }
        }
        modalRef.componentInstance.careTeamId = id;

        //let closeResult;
        modalRef.result.then((result) => {
            if (result != undefined) {

                if (operation == "ADD") {
                    if (this.lstPatientCareTeams == undefined)
                        this.lstPatientCareTeams = new Array();

                    this.lstPatientCareTeams.push(result);
                }
                else if (operation == "EDIT") {

                    this.lstPatientCareTeams.forEach(element => {
                        if (element.team_id == result.team_id) {
                            element.team_name = result.team_name;
                            element.team_status = result.team_status;
                            element.add_edit_flag = true;
                        }
                    });
                }
            }
        }
            , (reason) => {

                //alert(reason);
            });

    }

    getFilteredCareTeamMembers(team_id): Array<any> {

        let lst: Array<any> = new Array()

        if (this.lstPatientCareTeamMembers != undefined) {
            this.lstPatientCareTeamMembers.forEach(member => {
                if (member.team_id == team_id) {
                    lst.push(member);
                }
            });
        }
        return lst;
    }

    addEditCareTeamMember(operation, teamId, data) {


        const modalRef = this.ngbModal.open(PatientCareTeamMemberAddEditPopupComponent, this.popUpOptions);
        modalRef.componentInstance.operationType = operation;
        modalRef.componentInstance.data = data;
        modalRef.componentInstance.patientId = this.patientId;
        modalRef.componentInstance.teamId = teamId;

        modalRef.componentInstance.patientData = {
            title: (this.patInfoFormGroup.get("txtPatTitle") as FormControl).value,
            last_name: (this.patInfoFormGroup.get("txtPatLName") as FormControl).value,
            first_name: (this.patInfoFormGroup.get("txtPatFName") as FormControl).value,
            address: (this.patInfoFormGroup.get("txtAddressL1") as FormControl).value,
            address2: (this.patInfoFormGroup.get("txtAddressL2") as FormControl).value,
            zip: (this.patInfoFormGroup.get("txtZipCode") as FormControl).value,
            city: (this.patInfoFormGroup.get("ddCity") as FormControl).value,
            state: this.state,
            phone: (this.patInfoFormGroup.get("txtCellPhone") as FormControl).value
        };

        let id: Number = -1;
        if (operation == "EDIT") {
            id = data.id;
        }
        else {
            if (this.lstPatientCareTeamMembers != undefined && this.lstPatientCareTeamMembers.length > 0) {
                id = (this.lstPatientCareTeamMembers.length + 1) * -1;
            }
        }
        modalRef.componentInstance.memberId = id;

        //let closeResult;
        modalRef.result.then((result) => {
            if (result != undefined) {

                if (operation == "ADD") {
                    if (this.lstPatientCareTeamMembers == undefined)
                        this.lstPatientCareTeamMembers = new Array();

                    this.lstPatientCareTeamMembers.push(result);
                }
                else if (operation == "EDIT") {

                    this.lstPatientCareTeamMembers.forEach(element => {
                        if (element.id == result.id) {

                            element.member_type = result.member_type;
                            element.member_reference_id = result.member_reference_id;
                            element.title = result.title;
                            element.first_name = result.first_name;
                            element.last_name = result.last_name;
                            element.pcp = result.pcp;
                            element.taxonomy = result.taxonomy;
                            element.taxonomy_description = result.taxonomy_description;
                            element.snomed_relationship_code = result.snomed_relationship_code;
                            element.relationship_description = result.relationship_description;
                            element.npi = result.npi;
                            element.address = result.address;
                            element.address2 = result.address2;
                            element.city = result.city;
                            element.state = result.state;
                            element.zip = result.zip;
                            element.phone = result.phone;
                            element.amendment_request_id = result.amendment_request_id;
                            element.add_edit_flag = true;
                        }
                    });
                }
            }
        }
            , (reason) => {

                //alert(reason);
            });

    }

    onRemoveCareTeam(id: number) {

        for (let i: number = this.lstPatientCareTeams.length - 1; i >= 0; i--) {

            let element = this.lstPatientCareTeams[i];
            if (id != undefined) {
                if (element.team_id == id) {
                    this.lstPatientCareTeams.splice(i, 1);
                    if (id > 0) {
                        if (this.careTeamDeletedIds != "") {
                            this.careTeamDeletedIds += ","
                        }
                        this.careTeamDeletedIds += id;
                    }

                    for (let i: number = this.lstPatientCareTeamMembers.length - 1; i >= 0; i--) {
                        let ctm = this.lstPatientCareTeamMembers[i];
                        if (ctm.team_id == id) {
                            this.lstPatientCareTeamMembers.splice(i, 1);
                            if (ctm.id > 0) {
                                if (this.careTeamMemberDeletedIds != "") {
                                    this.careTeamMemberDeletedIds += ","
                                }
                                this.careTeamMemberDeletedIds += ctm.id;
                            }
                        }
                    }
                }
            }
        }
    }
    onRemoveCareTeamMember(id: number) {

        for (let i: number = this.lstPatientCareTeamMembers.length - 1; i >= 0; i--) {

            let ctm = this.lstPatientCareTeamMembers[i];
            if (id != undefined) {
                if (ctm.id == id) {
                    this.lstPatientCareTeamMembers.splice(i, 1);
                    if (id > 0) {
                        if (this.careTeamMemberDeletedIds != "") {
                            this.careTeamMemberDeletedIds += ","
                        }
                        this.careTeamMemberDeletedIds += id;
                    }
                }
            }
        }
    }

    patPicErrorHandler(event) {
        event.target.src = this.lookupList.defaultPatPicLg;
    }

    caputurePicture() {

        const modalRef = this.ngbModal.open(CameraCapturePopupComponent, this.popupUpOptionsCamera);

        //modalRef.componentInstance.operationType = operation;
        //modalRef.componentInstance.patientId = this.patientId;
        //modalRef.componentInstance.data = data;       

        //let closeResult;
        let reader = new FileReader();
        modalRef.result.then((dataURL) => {

            if (dataURL != undefined) {

                this.isPatPicChanged = true;
                this.patPicURL = dataURL;
                //this.patPicFile=result;

                fetch(dataURL)
                    .then(res => res.blob())
                    .then(blob => {
                        this.patPicFile = new File([blob], this.patientId + ".png")
                    })
            }
        }
            , (reason) => {

                //alert(reason);
            });

    }

    removePicture() {

        debugger;
        this.patPicFile = null;

        if (this.patient != undefined) {
            this.patient.pic = undefined;
            this.isPatPicChanged = true;
        }
        else {
            this.patPicURL = this.lookupList.defaultPatPicLg;
        }

        this.fetchPatientPicURL();
    }
    /*
    dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    */

    navigateBack() {
        this.onCancel.emit();
    }

    ScanCard(type) {

        debugger;
        let insId;
        let docType;
        if (type.toLowerCase() == "primary" || type.toLowerCase() == "secondary" || type.toLowerCase() == "other") {

            this.lstPatInsurance.forEach(ins => {
                if (ins.insurace_type.toLowerCase() == type.toLowerCase() && ins.patientinsurance_id > 0) {
                    insId = ins.patientinsurance_id;
                }
            });

            if (insId == undefined) {
                alert(type.toUpperCase() + " insurance not found.")
                return;
            }


            if (type.toLowerCase() == "primary") {
                docType = "primary_insurance";
            }
            else if (type.toLowerCase() == "secondary") {
                docType = "secondary_insurance";
            }
            else if (type.toLowerCase() == "other") {
                docType = "other_insurance";
            }
        }
        else {
            docType = type;
        }


        const modalRef = this.ngbModal.open(DwtComponent, this.lgPopUpOptions);
        modalRef.componentInstance.docType = docType;
        modalRef.componentInstance.patientId = this.patientId;
        modalRef.componentInstance.patientInsuranceId = insId

        //modalRef.componentInstance.patientId = this.patientId;
        //modalRef.componentInstance.data = data;       

        //let closeResult;
        //let reader = new FileReader();
        modalRef.result.then((result) => {

            debugger;
            if (result != undefined && result.status == ServiceResponseStatusEnum.SUCCESS) {

                switch (result.docType) {
                    case "primary_insurance":
                    case "secondary_insurance":
                    case "other_insurance":
                        this.isLoading = true;
                        this.loadingCount = 1;
                        this.getPatientInsurance();
                        break;
                    case "id_card":
                    case "driving_license":
                    case "patient_agreement":
                        this.isLoading = true;
                        this.loadingCount = 1;
                        this.getPatientInfo();
                        break;

                    default:
                        break;
                }

            }
        }
            , (reason) => {
                debugger;
                //alert(reason);
            });
    }

    xLgPopUpOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        windowClass: 'modal-adaptive'
    };
    viewScanCard(type, link) {
        //alert(type + ":" + link);
        let docPath = this.downloadPath + this.lookupList.practiceInfo.practiceId + "/" + "PatientDocuments/" + link;
        //alert(docPath);
        const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
        modalRef.componentInstance.path_doc = docPath;

        /*
         let searchCriteria: SearchCriteria = new SearchCriteria;
         searchCriteria.criteria = this.uploadPath + "/" + link;
         this.generalService.downloadFile(searchCriteria)
             .subscribe(
                 data => {
                     this.downloafileResponse(data, link);
                 },
                 error => alert(error)
             );
             */

    }

    downloafileResponse(data, doc_link) {
        if (data.byteLength <= 0)
            return;
        debugger;
        let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
        let file_type: string = '';
        switch (file_ext.toLowerCase()) {
            case 'png':
                file_type = 'IMAGE/PNG';
                break;
            case 'jpg':
                file_type = 'IMAGE/JPEG';
                break;
            case 'pdf':
                file_type = 'application/pdf';
                break;
            case 'txt':
                file_type = 'text/plain';
                break;
        }

        var file = new Blob([data], { type: file_type });
        var fileURL = URL.createObjectURL(file);

        let path = fileURL;
        const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
        modalRef.componentInstance.path_doc = path;
    }

    removeScanCard(type: string, id: number) {

        let insId;


        if (type.toLowerCase() == "primary" || type.toLowerCase() == "secondary" || type.toLowerCase() == "other") {

            this.lstPatInsurance.forEach(ins => {
                if (ins.insurace_type.toLowerCase() == type.toLowerCase() && ins.patientinsurance_id > 0) {
                    insId = ins.patientinsurance_id;
                    ins.doc_link = undefined;
                    ins.document_id = undefined;
                }
            });

            if (insId == undefined) {
                alert(type.toUpperCase() + " insurance not found.")
                return;
            }
        }
        else if (type.toLowerCase() == "insurance") {

            this.lstPatInsurance.forEach(ins => {
                if (id == ins.patientinsurance_id) {
                    insId = ins.patientinsurance_id;
                    ins.doc_link = undefined;
                    ins.document_id = undefined;
                }
            });
        }

        else if (type.toLowerCase() == "id_card") {
            this.patient.id_card = undefined;

        }
        else if (type.toLowerCase() == "driving_license") {
            this.patient.driving_license = undefined;
        }
        else if (type.toLowerCase() == "patient_agreement") {
            this.patient.patient_agreement = undefined;
        }


    }

    printDemographics() {

        const modalRef = this.ngbModal.open(PrintDemographicsComponent, this.lgPopUpOptions);
        modalRef.componentInstance.patientId = this.patientId;
        modalRef.componentInstance.patientInfo = this.patient;
        modalRef.componentInstance.lstPatientInsurance = this.lstPatInsurance;
        modalRef.componentInstance.lstPatRaceEthnicity = this.lstPatRaceEthnicityFromDB;

        modalRef.result.then((result) => {

            if (result != undefined) {

            }
        }
            , (reason) => {

                //alert(reason);
            });

    }

    chkSelfPayChanged(value: boolean) {
        this.isSelfPay = value;
        this.disableInsuranceFields(this.isSelfPay);
    }

    disableInsuranceFields(option: boolean) {

        if (this.lstPatInsurance != undefined) {
            this.lstPatInsurance.forEach(element => {

                let id = element.patientinsurance_id;

                if (option == true) {
                    this.patInfoFormGroup.get("txtInsuranceName_" + id).disable();
                    this.patInfoFormGroup.get("txtInsuranceSubscriber_" + id).disable();
                    this.patInfoFormGroup.get("ddInsuranceSubscriberRel_" + id).disable();
                    this.patInfoFormGroup.get("txtPolicyNo_" + id).disable();
                    this.patInfoFormGroup.get("txtGroupNo_" + id).disable();
                    this.patInfoFormGroup.get("dpInsStartDate_" + id).disable();
                    this.patInfoFormGroup.get("dpInsEndDate_" + id).disable();
                    this.patInfoFormGroup.get("txtInsCopy_" + id).disable();
                    this.patInfoFormGroup.get("txtInsPCP_" + id).disable();
                    this.patInfoFormGroup.get("txtWorkerCompName_" + id).disable();
                    this.patInfoFormGroup.get("txtWorkerCompAddress_" + id).disable();
                    this.patInfoFormGroup.get("txtWCZipCode_" + + id).disable();
                    this.patInfoFormGroup.get("ddWorkerCompCity_" + + id).disable();
                }
                else {
                    this.patInfoFormGroup.get("txtInsuranceName_" + id).enable();
                    this.patInfoFormGroup.get("txtInsuranceSubscriber_" + id).enable();
                    this.patInfoFormGroup.get("ddInsuranceSubscriberRel_" + id).enable();
                    this.patInfoFormGroup.get("txtPolicyNo_" + id).enable();
                    this.patInfoFormGroup.get("txtGroupNo_" + id).enable();
                    this.patInfoFormGroup.get("dpInsStartDate_" + id).enable();
                    this.patInfoFormGroup.get("dpInsEndDate_" + id).enable();
                    this.patInfoFormGroup.get("txtInsCopy_" + id).enable();
                    this.patInfoFormGroup.get("txtInsPCP_" + id).enable();
                    this.patInfoFormGroup.get("txtWorkerCompName_" + id).enable();
                    this.patInfoFormGroup.get("txtWorkerCompAddress_" + id).enable();
                    this.patInfoFormGroup.get("txtWCZipCode_" + + id).enable();
                    this.patInfoFormGroup.get("ddWorkerCompCity_" + + id).enable();
                }

            });
        }


    }


    onDateFocusOut(date: string, controlName: string) {
        let formatedDate = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
        if (formatedDate != undefined && formatedDate != '') {
            this.patInfoFormGroup.get(controlName).setValue(formatedDate);
        }
    }

    onLeftMenueClicke(mItem: string) {
        this.selectedMenuItem = mItem;
    }


    selectedTab: string = "tab_pat_info";
    onTabChange(event: NgbTabChangeEvent) {

        switch (event.nextId) {
            case "tab_pat_info":
            case "tab_pat_ins":
            case "tab_pat_nok":
            case "tab_pat_careteam":
            case "tab_pat_scanned_cards":

                this.selectedTab = event.nextId;
                break;
            case "tab_pat_pic":
                event.preventDefault();
                break;

            default:
                break;
        }

    }


    OnPatPicSave() {
        //this.isPatPicChanged = false;

        const imgFile: File = this.patPicFile;
        const formDate: FormData = new FormData();
        if (imgFile != undefined) {
            formDate.append('pic', imgFile);
        }

        let strCriteria: SearchCriteria = new SearchCriteria();
        strCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        strCriteria.param_list = [];
        strCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
        strCriteria.param_list.push({ name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS), option: "" });
        strCriteria.param_list.push({ name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: "" });
        strCriteria.param_list.push({ name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: "" });


        formDate.append('patient_data', JSON.stringify(strCriteria));

        this.patientService.savePatientPic(formDate).subscribe(
            data => {
                debugger;
                this.isSaving = false;
                this.isPatPicChanged = false;
                this.savePatientPicSuccess(data);
            },
            error => {
                debugger;
                this.isSaving = false;
                this.savePatientPicSuccessError(error);
            }
        );
    }

    savePatientPicSuccess(data) {

        debugger;
        if (data.status === ServiceResponseStatusEnum.SUCCESS) {
            this.isPatPicChanged = false;
            this.patPicFile = undefined;
            this.patient.pic = data['result'];

            this.fetchPatientPicURL();

        }
        else if (data.status === ServiceResponseStatusEnum.ERROR) {
            GeneralOperation.showAlertPopUp(this.ngbModal, "Save Patient", data.response, AlertTypeEnum.DANGER)
        }
    }

    savePatientPicSuccessError(error) {
        debugger;
        //this.logMessage.log("savePatient Error.");
        GeneralOperation.showAlertPopUp(this.ngbModal, "Save Patient", error.message, AlertTypeEnum.DANGER)
    }


    OnPatPicCancel() {
        debugger;

        this.isPatPicChanged = false;
        this.patPicFile = undefined;

        this.fetchPatientPicURL();

    }

    onBrowsePatPic() {
        document.getElementById('patPic_' + this.uniqueModuleId).click();
    }

    selectInsuranceTab() {
        this.selectedTab = "tab_pat_ins";
    }

    onMoveInsurance(ins: any, insTypeFrom: string, insTypeTo: string) {

        debugger;
        this.lstPatInsurance.forEach(patIns => {
            debugger;
            if (patIns.patientinsurance_id == ins.patientinsurance_id) {
                patIns.insurace_type = insTypeTo;
                patIns.add_edit_flag = true;

            }
            else if (patIns.patientinsurance_id != ins.patientinsurance_id && patIns.insurace_type == insTypeTo) {

                patIns.insurace_type = insTypeFrom;
                patIns.add_edit_flag = true;

            }
        });

        /*
        let indexFrom: number = GeneralOperation.getIndexForInsuranceEntry(this.lstPatInsurance, insTypeTo);
        let indexTo: number = GeneralOperation.getIndexForInsuranceEntry(this.lstPatInsurance, insTypeFrom);

        debugger;
        if (indexFrom >= 0 && indexTo >= 0) {
            let insFrom: any = this.lstPatInsurance[indexFrom];
            let insTo: any = this.lstPatInsurance[indexTo];

            this.lstPatInsurance[indexFrom] = insTo;
            this.lstPatInsurance[indexTo] = insFrom;
        }
        */


        //let lstPrimaryIns: Array<any> = new Array<any>();
        //let lstSecIns: Array<any> = new Array<any>();
        //let lstOthIns: Array<any> = new Array<any>();

        this.lstPatInsurance = GeneralOperation.arrangeInsuranceOrder(this.lstPatInsurance);
    }

    onImportInactiveInsurance() {
        //this.importInsurance = false;
        const modalRef = this.ngbModal.open(ImportPatientInsuranceComponent, { size: 'lg', windowClass: 'modal-adaptive' });
        modalRef.componentInstance.patientId = this.patientId;
        modalRef.componentInstance.status = 'inactive';
        modalRef.componentInstance.calling_from = CallingFromEnum.PATIENT_CLAIM;
        modalRef.result.then((result) => {
            debugger;
            //let insFound = false;
            if (result != null) {
                if (this.lstPatInsurance.length > 0) {
                    //Remove previous insurance
                    for (let i = this.lstPatInsurance.length - 1; i >= 0; i--) {
                        if (this.lstPatInsurance[i].insurace_type.toString().toLowerCase() == result.insurace_type.toString().toLowerCase()) {

                            let id: number = this.lstPatInsurance[i].patientinsurance_id;
                            this.lstPatInsurance.splice(i, 1);
                            if (id > 0) {
                                if (this.insuranceDeletedIds != "") {
                                    this.insuranceDeletedIds += ","
                                }
                                this.insuranceDeletedIds += id;
                            }
                        }
                    }
                }

                this.addImportInsurance(result);
                this.lstPatInsurance = GeneralOperation.arrangeInsuranceOrder(this.lstPatInsurance);

            }
        },
            (reason) => {
                //alert(reason);
            });
    }

    addImportInsurance(result) {
        debugger;
        this.tempPatInsuranceId--;

        if (this.lstPatInsurance == undefined) {
            this.lstPatInsurance = new Array<any>();
        }

        let ins: any = {

            patientinsurance_id: this.tempPatInsuranceId,
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
            issue_date: result.start_date,
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

        this.lstPatInsurance.push(ins);
        this.addInsuranceControlsToFormGroup(ins);
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
        this.patInfoFormGroup.get(controlName).setValue(pastedText.trim());

        // Mark control as dirty mannualy because with event.preventDefault() control is not marked dirty by default 
        this.patInfoFormGroup.controls[controlName].markAsDirty();
    }

    formateCurrencyInputs(controlName: string) {
        let value: any = (this.patInfoFormGroup.get(controlName) as FormControl).value;
        if (!isNaN(value)) {
            let formatedValue = this.decimalPipe.transform(value, ".2-2", "");
            (this.patInfoFormGroup.get(controlName) as FormControl).setValue(formatedValue);
        }
    }
    onPicClick() {
        debugger;
        const modalRef = this.ngbModal.open(CameraCapturePopupComponent, this.popupUpOptionsCamera);
        modalRef.componentInstance.isOnlyView = true;
        modalRef.componentInstance.current_url = this.patPicURL;
        modalRef.componentInstance.title = "Picture View";
    }

    fetchPatientPicURL() {
        if (this.patient != undefined) {
            if (this.patient.pic == null || this.patient.pic == undefined || this.patient.pic == '') {

                if (this.patient.gender_code == 'M') {
                    this.patPicURL = this.lookupList.defaultPatMalePicLg;// "assets/images/img_male.png"        
                }
                else if (this.patient.gender_code == 'F') {
                    this.patPicURL = this.lookupList.defaultPatFemalePicLg;//"assets/images/img_female.png"        
                }
                else {
                    this.patPicURL = this.lookupList.defaultPatPicLg;
                }
            }
            else {
                this.patPicURL = this.downloadPath + this.lookupList.practiceInfo.practiceId + "/" + "PatientImages/" + this.patient.pic;
            }
        }
        else {
            this.patPicURL = this.lookupList.defaultPatPicLg;
        }

    }
}