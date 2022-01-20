import { Component, OnInit, Inject, ViewChild, ViewContainerRef, ComponentFactoryResolver, Output, EventEmitter, Input } from '@angular/core';
import { LOOKUP_LIST, LookupList } from './../../../providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { LetterService } from '../../../services/general/letter.service';
// import { debug } from 'util';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum, AlertTypeEnum } from '../../../shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import * as Quill from 'quill';
import { ORMPatientLetter } from 'src/app/models/letter/ORMPatientLetter';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
// import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
//import { EncounterPrintViewerComponent } from '../../general-modules/encounter-print-viewer/encounter-print-viewer.component';
import { EncounterPrintViewerComponent } from 'src/app/general-modules/encounter-print-viewer/encounter-print-viewer.component';
import { OpenedPatientInfo } from 'src/app/models/common/patientInfo';
import { ORMPatientNote } from 'src/app/models/letter/ORMPatientNote';
import { datetimeValidator } from '../../../shared/custome-validators';
import { ReferralService } from 'src/app/services/patient/referral.service';
import { ReferralViewersComponent } from 'src/app/general-modules/referral-viewers/referral-viewers.component';
import { AppConfig, APP_CONFIG } from 'src/app/providers/app-config.module';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
import { PhonePipe } from 'src/app/shared/phone-pipe';

@Component({
  selector: 'letters-main',
  templateUrl: './letters-main.component.html',
  styleUrls: ['./letters-main.component.css']
})
export class LettersMainComponent implements OnInit {
  //@Input() patientIdfwd;
  //@Input() patient;
  //@Input() lstPatData: Array<ORMKeyValue>;
  @Input() openPatientInfo: OpenedPatientInfo;

  style =
    '.styleTopHeader {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-weight: bold;font-size: 18px; color:#00000;}' +
    '.styleTopSubHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;	font-weight: bold;font-size: 12px; color:#0f4977;}' +
    '.styleMainHeading {font-family:Trebuchet MS, Arial, Helvetica, sans-serif; font-weight: bold; font-size: 13px; color:#0f4977;}' +
    '.styleNormal {font-size: 11px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;} ' +
    '.styleNormalBold {font-size: 11px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;font-weight: bold;} ' +
    '.styleSubHeading {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;	font-size: 12px;font-weight: bold;}' +
    '.tableMain{font-size:11px;font-font-family:Trebuchet MS, Arial, Helvetica, sans-serif; border-collapse:collapse; border:.1px solid #5bb6d0;}' +
    '.tableMain td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:.1px solid #5bb6d0;padding:3px 7px 2px 7px;}' +
    '.tableMain tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:.1px solid #5bb6d0; }' +
    '.tableMain th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; font-size:12px;text-align:left;padding:3px 7px 2px 7px;background-color:#5bb6d0;color:#000000;} ' +
    '.tableNoBorder{font-size:11px;font-family:Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;border: border:0px;}' +
    '.tableNoBorder td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:0px ;padding:3px 5px 2px 5px;valign:top;} ' +
    '.tableNoBorder tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:0px ; }' +
    '.tableNoBorder th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; valign:center;  background-color: #edfbf6; color:#000000; font-weight:bold;font-size:12px;border:.1px solid #5bb6d0;padding:3px 5px 2px 5px;}  ' +
    '.styleModuleHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;  font-size: 12px;text-align: left; font-weight: bold;  background-color:#5bb6d0;color:#000000;} ' +
    '.styleModuleSubHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif; font-size: 11px;   valign:center;  background-color: #d4eeee; color:#000000; font-weight:bold;} ' +
    '.styleAlternateRowColor {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; background-color: #f4fafd;}';

  private objPatLtr: ORMPatientLetter;
  public richAbstract: AbstractControl;
  @Output() dataUpdated = new EventEmitter<any>();
  //notes_html = "";
  //notes_text = "";
  //    public onReady( editor ) {
  //      editor.ui.view.editable.element.parentElement.insertBefore(
  //          editor.ui.view.toolbar.element,
  //          editor.ui.view.editable.element
  //      );
  //  }


  //lstLetters;
  //patient_id='';
  //@ViewChild('patientSearchDiv', {read: ViewContainerRef}) div;
  isCallingFrom = "letters";
  lstSearchLetters;
  patLetterId;
  //dropdowns
  lstLetterTemplate;
  lstLetterHeader: Array<any>;
  lstLetterSection;
  previewPrint = false;

  panelShowHidePrev: Boolean = true;
  editHeaderRow: any;
  textBtnPrint = "Print";
  selectedHeadderHTML;
  selectedSectionHTML;
  selectedSubSectionHTML;

  selectedPatientInfoString = '';
  strPatLetterOperation = '';
  issigned;
  isEditedLtr = false;
  refreshSearch;
  SignatureUrl = "";
  img_sign = "";
  isPreviewBtn = false;
  enableSign: Boolean;
  ltrHTML: string;
  txt_ltr_headder = "New Letter";
  lstSignLetterData: Array<ORMKeyValue> = [];
  isSelectedLtrID;


  prntPracticeHeadder;
  prntPatientHeadder;
  prntSection;
  prntSubSection;
  prntPatInfo;
  prntDOs;
  prntBody;
  prntSignDate;
  prntSignBy;
  isLoding: boolean = false;

  totalCount: number = 0;
  //ltrSignature_Url="";
  //callFromPatient: boolean = false;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private letterService: LetterService,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage,
    private general: GeneralOperation,
    private generalOperation: GeneralOperation,
    private modalService: NgbModal,
    private formBuilder: FormBuilder, private referralService: ReferralService, @Inject(APP_CONFIG) private config: AppConfig) {

    this.quilLetterTemplate = formBuilder.group({
      'letterTempText': [''],
    });
    this.letterTempText = this.quilLetterTemplate.controls['letterTempText'];

    this.preview = formBuilder.group({
      'letterTempPrev': [''],
    });
    this.letterTempPrev = this.preview.controls['letterTempPrev'];

  }

  formtest: FormGroup;
  letterMainForm: FormGroup;


  acLetterSections: Array<any>;
  acLetterSectionsSetup: Array<any>;
  acTemplateSections: Array<any>;
  acLetterSubSections: Array<any>;

  acLetterSubSectionsSetup: Array<any>;
  acTemplateSubSections: Array<any>;

  objSection;
  objSubSection;
  public letterTempText: AbstractControl;
  public letterTempPrev: AbstractControl;
  selectedRowHTML;

  print_html;
  prevMainHTML;


  quilLetterTemplate: FormGroup;
  preview: FormGroup;

  searchLettersForm: FormGroup;
  cheditorForm: FormGroup;
  isNewLetter = false;
  isLetterTemplate = false;
  isSummary = true;
  isTemplateSetting = false;
  isCKeditor = false;
  prev_from_main = false;
  errorMsg: string = "";
  disableField = false;
  disableNewField = false;
  callShowHide = false;
  showPatientSearch: boolean = false;
  showPatientSearchnew: boolean = false;
  patientName: string;
  patientId: number;
  patientNamenew: string;
  patient_addressnew: String;
  patient_zipcitystate: String;
  patient_dob: string;
  patient_cellPhone: string;
  patientIdnew: number;
  selectedPatientID: number;
  selectedPatientIDnew: number;
  strLtrPreview;
  ltr_Header = '';
  ltr_pat_Header = '';
  ltr_Section = '';
  ltr_OptSection = '';
  ltr_Body = '';
  ltr_DOS = '';
  ltrSignDate = ''
  ltrSigned_By = '';
  ltrSignature_Url = '';

  ltr_prev_Section = '';
  ltr_prev_OptSection = '';
  ltr_prev_Body = '';
  ltr_prev_DOS = '';
  letterName = '';
  SelPatInfo = '';
  patientID_patLtr = '';
  letterName_patLtr;
  isLetterSigned = '';
  ltr_prev_SignDate = "";
  ltr_prev_Signed_By = "";
  ltr_prev_Signature_Url = "";
  todayDate;
  DOSDateModel;
  dateModel;
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  backToLettersMain() {
    this.isLetterTemplate = false;
    this.isSummary = true;
  }

  ngOnInit() {

    this.buildForm();
    this.getddlLetterTemplate();
    this.getddlLetterHeader();
    this.getSettingsSection();
    this.getTemplateSection();
    this.getTemplateSubSection();
    this.getSettingsSubSection();
    //this.getLetterTemplateSubSections()
    //from and to empty - comment these lines.
    //this.dateModel = this.dateTimeUtil.getCurrentDateModel();
    //(this.searchLettersForm.get('mainFromDate') as FormControl).setValue(this.dateModel);
    //(this.searchLettersForm.get('mainToDate') as FormControl).setValue(this.dateModel);

    if (this.openPatientInfo != null && this.openPatientInfo != undefined) {
      if (this.openPatientInfo.calling_from == "patient") {
        this.isCallingFrom = "patient";
      }
    }

    (this.searchLettersForm.get("mainDateType") as FormControl).setValue("dos");

    this.isPreviewBtn = false;
    this.enableSign = false;

    var acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "Signature");
    if (acPath != null && acPath.length > 0) {
      //if (this.isCallingFrom == "patient") {
      this.SignatureUrl = acPath[0].download_path + this.lookupList.practiceInfo.practiceId + "/";
      // } else {
      //  this.SignatureUrl = acPath[0].download_path + this.lookupList.practiceInfo.practiceId + "/";
      //}
    }
    if (this.isCallingFrom == "patient") {
      this.disableField = true;
      this.callShowHide = true;
      (this.searchLettersForm.get('mainPatientSearch') as FormControl).setValue(this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name);
      this.patientId = parseInt(this.openPatientInfo.patient_id.toString());
      //setPat_String();

      //this.selectedPatientInfoString = "<b>Patient Name: </b> " + this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name + " <b>   Birth Date: </b> " + this.openPatientInfo.patient_dob + "<b> Age: </b>" + this.openPatientInfo.patient_age;

      this.patientNamenew = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
      this.patient_addressnew = this.openPatientInfo.patient_address;
      this.patient_zipcitystate = this.openPatientInfo.Patient_zip_city_state;
      this.patient_dob = this.openPatientInfo.patient_dob_101;
      this.patient_cellPhone = this.openPatientInfo.phone;

      this.prntPatientHeadder = "<TEXTFORMAT LEADING='2'>" +
        "<P ALIGN='RIGHT'><B>" + this.patientNamenew.toString().toUpperCase() + "</B></P>" +
        "</TEXTFORMAT>" +
        "<TEXTFORMAT LEADING='2'>" +
        "<P ALIGN='RIGHT'>" + this.patient_addressnew.toString().toUpperCase() + "</P>" +
        "</TEXTFORMAT>" +
        "<TEXTFORMAT LEADING='2'>" +
        "<P ALIGN='RIGHT'>" + this.patient_zipcitystate + "</P>" +
        "</TEXTFORMAT>";



      //let btn:HTMLElement = document.getElementById("btnSrch") as HTMLElement;
      //btn.click();

      if (this.isCallingFrom == "patient") {
        this.searchLetters(this.searchLettersForm);
      }
      //this.callFromPatient = true;
    } else {
      this.disableField = false;
      this.callShowHide = false;
      // this.callFromPatient = false;
    }


  }
  buildForm() {
    this.searchLettersForm = this.formBuilder.group({
      mainFromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      mainToDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),

      // mainFromDate: this.formBuilder.control("", Validators.required),
      // mainToDate: this.formBuilder.control("", Validators.required),
      mainPatientSearch: this.formBuilder.control("", Validators.required),
      mainDateType: this.formBuilder.control("", Validators.required),
      mainUserSearch: this.formBuilder.control(null)
    })
    this.cheditorForm = this.formBuilder.group({
      content: this.formBuilder.control(null)
    })
    this.letterMainForm = this.formBuilder.group({
      mainPatientSearchnew: this.formBuilder.control("", Validators.required),
      //dateDOS: this.formBuilder.control("", Validators.required),
      //dateDOS: this.formBuilder.control(null, datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
      dateDOS: this.formBuilder.control("", Validators.required),
      ddl_lettertemplates: this.formBuilder.control("", Validators.required),
      ddl_header: this.formBuilder.control("", Validators.required),
      ddl_section: this.formBuilder.control("", Validators.required),
      ddl_optionalsection: this.formBuilder.control("", Validators.required)
    })


  }

  //#region onitcalls
  getddlLetterTemplate() {
    this.letterService.GetLetterTemplates(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        lstLetterTemplate: new Array();
        this.lstLetterTemplate = data as Array<any>;
      },
      error => {
        return;
      }
    );
  }
  getSettingsSection() {
    this.letterService.getSettingsLetterSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        acLetterSectionsSetup: new Array();
        this.acLetterSectionsSetup = data as Array<any>;
      },
      error => {
        return;
      }
    );
  }
  getTemplateSection() {
    this.letterService.getLetterTemplateSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        acTemplateSections: new Array();
        this.acTemplateSections = data as Array<any>;
      },
      error => {
        return;
      }
    );
  }



  getSettingsSubSection() {
    this.letterService.getLetterSubSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        acLetterSubSectionsSetup: new Array();
        this.acLetterSubSectionsSetup = data as Array<any>;
      },
      error => {
        return;
      }
    );
  }
  getTemplateSubSection() {
    this.letterService.getLetterTemplateSubSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        acTemplateSubSections: new Array();
        this.acTemplateSubSections = data as Array<any>;
      },
      error => {
        return;
      }
    );
  }
  getddlLetterHeader() {
    this.letterService.getSettingsLetterHeaders(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        lstLetterHeader: new Array();
        this.lstLetterHeader = data as Array<any>;
      },
      error => {
        return;
      }
    );
  }
  //#endregion onitcalls








  // getLetterTemplateSubSections(){
  //   this.letterService.getLetterTemplateSubSections(this.lookupList.practiceInfo.practiceId).subscribe(
  //     data => {
  //       acLetterSubSectionsSetup: new Array();
  //       this.acLetterSubSectionsSetup = data as Array<any>;
  //     },
  //     error => {
  //       return;
  //     }
  //   );
  // }


  searchLetters(criteria) {
    debugger;
    if ((criteria.mainFromDate == "" || criteria.mainFromDate == null) && (criteria.mainToDate == "" || criteria.mainToDate == null)
      && (this.patientId == null || this.patientId == undefined)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Search', "Plaese select at least one search criteria.", AlertTypeEnum.WARNING);
      return;
    }

    this.isLoding = true;
    this.totalCount = 0;

    this.refreshSearch = criteria;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];
    let vardateFrom;
    if (criteria.mainFromDate)
      vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(criteria.mainFromDate);
    else
      vardateFrom = null;

    let vardateTo;
    if (criteria.mainToDate)
      vardateTo = this.dateTimeUtil.getStringDateFromDateModel(criteria.mainToDate);
    else
      vardateTo = null;

    searchCriteria.param_list.push({ name: "dateFrom", value: vardateFrom, option: "" });
    searchCriteria.param_list.push({ name: "dateTo", value: vardateTo, option: "" });
    // searchCriteria.param_list.push( { name: "patient_id", value: this.lookupList., option: "" });
    if (this.patientId != undefined && this.patientId > 0) {
      searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
    }
    searchCriteria.param_list.push({ name: "dateType", value: (this.searchLettersForm.get('mainDateType') as FormControl).value, option: "" });

    if ((this.searchLettersForm.get('mainUserSearch') as FormControl).value == "0") {
      searchCriteria.param_list.push({ name: "modified_user", value: "", option: "" });
    } else {
      searchCriteria.param_list.push({ name: "modified_user", value: (this.searchLettersForm.get('mainUserSearch') as FormControl).value, option: "" });
    }

    this.letterService.searchPatientLetters(searchCriteria).subscribe(
      data => {
        this.isLoding = false;
        this.lstSearchLetters = null;
        this.lstSearchLetters = data;
        this.totalCount = this.lstSearchLetters.length;
      },
      error => {
        this.searchLettersError(error);
        this.isLoding = false;
      }
    );
  }
  searchLettersError(error) {
    this.errorMsg = error;
  }
  //#region  patientsearch
  // pateint search start
  onPatientSearchKeydown(event) {

    if (event.key === "Enter") {
      this.showPatientSearch = true;
    } else if (event.key == "Backspace") {
      this.showPatientSearch = false;
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientID = null;
      this.patientId = null;
      (this.searchLettersForm.get("mainPatientSearch") as FormControl).setValue(null);
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {

    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {
      this.patientId = undefined;
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientID = null;
    }
  }
  onPatientSearchBlur() {

    this.logMessage.log("onPatientSearchBlur");
    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      (this.searchLettersForm.get("mainPatientSearch") as FormControl).setValue(null);
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientID = null;
    }
  }
  openSelectPatient(patObject) {

    this.logMessage.log(patObject);
    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;
      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) {
          this.closePatientSearch();
        }
      }
        , (reason) => {
          //alert(reason);
        });
      return;
    }
    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;
    //(this.searchLettersForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    this.selectedPatientID = this.patientId;
    (this.searchLettersForm.get('mainPatientSearch') as FormControl).setValue(this.patientName);
    this.showPatientSearch = false;
  }
  closePatientSearch() {

    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  //patient search end
  //#endregion patientserach
  onNewLetter() {
    debugger;
    //(this.letterMainForm.get("dateDOS") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
    this.txt_ltr_headder = "New Letter";
    this.previewFromMainGrid = false;
    this.isNewLetter = true;
    this.isSummary = false;
    this.panelShowHidePrev = true;
    this.clearAllFields();
    this.DOSDateModel = this.dateTimeUtil.getCurrentDateModel();
    //this.DOSDateModel = this.dateTimeUtil.getDateModelFromDateString(this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY), DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    (this.letterMainForm.get("dateDOS") as FormControl).setValue(this.DOSDateModel);
    if (this.isCallingFrom == "patient") {
      //mainPatientSearchnew
      //(this.letterMainForm.get("mainPatientSearchnew") as FormControl).setValue(this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name);
      this.disableNewField = true;
      (this.letterMainForm.get('mainPatientSearchnew') as FormControl).setValue(this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name);
      this.patientIdnew = this.openPatientInfo.patient_id;
      this.patientNamenew = (this.letterMainForm.get('mainPatientSearchnew') as FormControl).value;
    }

  }
  clearAllFields() {
    (this.letterMainForm.get("mainPatientSearchnew") as FormControl).setValue(null);
    (this.letterMainForm.get("dateDOS") as FormControl).setValue(null);
    (this.letterMainForm.get('ddl_lettertemplates') as FormControl).setValue("");

    (this.letterMainForm.get('ddl_header') as FormControl).setValue("");
    (this.letterMainForm.get('ddl_section') as FormControl).setValue("");
    (this.letterMainForm.get('ddl_optionalsection') as FormControl).setValue("");


    this.quilLetterTemplate = this.formBuilder.group({
      'letterTempText': [""],
    });
    this.letterTempText = this.quilLetterTemplate.controls['letterTempText'];

    this.print_html = "";
  }
  onLetterTemplate() {
    this.isSummary = false;
    this.isLetterTemplate = true;
  }
  onBackToSummary() {
    debugger;
    if (this.previewFromMainGrid == true) {
      this.cancelPreview();
      this.previewFromMainGrid = false;
    }
    if (this.panelShowHidePrev == false) {
      this.isPreviewBtn = false;
      this.isNewLetter = true;
      this.isSummary = false;
      this.panelShowHidePrev = true;
      this.previewPrint = false;
    } else {
      this.cancelPreview();
    }

    //this.isLetterTemplate = false;
    //this.isNewLetter = false;
    //this.isSummary = true;
    //this.isEditedLtr = false;
    ////if (this.isCallingFrom != "patient") {
    //this.cancelPreview()
    ////}
  }

  //#region searchpatientfornew
  //pateint search start
  onPatientSearchKeydownnew(event) {

    if (event.key === "Enter") {
      this.showPatientSearchnew = true;
    } else if (event.key == "Backspace") {
      this.showPatientSearchnew = false;
      this.selectedPatientIDnew = null;
      this.patientNamenew = "";

      (this.letterMainForm.get("mainPatientSearchnew") as FormControl).setValue(null);
    }
    else {
      this.showPatientSearchnew = false;
    }
  }
  onPatientSearchInputChangenew(newValue) {

    this.logMessage.log("onPatientSearchChangenew");
    if (newValue !== this.patientNamenew) {
      this.patientIdnew = undefined;
      //this.searchLettersForm.get("txtPatientIdHidden").setValue(null);
      this.selectedPatientIDnew = null;
      this.patientNamenew = "";
    }
  }
  onPatientSearchBlurnew() {

    this.logMessage.log("onPatientSearchBlur");
    if (this.patientIdnew == undefined && this.showPatientSearchnew == false) {
      this.patientNamenew = undefined;
      //(this.letterMainForm.get("mainPatientSearchnew") as FormControl).setValue(null);

      this.selectedPatientIDnew = null;
      this.patientNamenew = "";
    }
  }
  openSelectPatientnew(patObject) {
    debugger;
    this.logMessage.log(patObject);
    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Letter Patient Search"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;
      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) {
          this.closePatientSearchnew();
        }
      }
        , (reason) => {
          //alert(reason);
        });
      return;
    }
    this.patientIdnew = patObject.patient_id;
    this.patientNamenew = patObject.name;

    this.selectedPatientIDnew = this.patientIdnew;

    if (patObject.address != "") {
      this.patient_addressnew = patObject.address.toString().split(',')[0];
    }
    this.patient_zipcitystate = patObject.address.toString().split(",")[1] + patObject.address.toString().split(",")[2];

    this.patient_dob = patObject.dob;
    if (patObject.cell_phone != null && patObject.cell_phone != '')
      this.patient_cellPhone = new PhonePipe().transform(patObject.cell_phone);
    else
      this.patient_cellPhone = "";

    //this.setPatString(patObject);
    (this.letterMainForm.get('mainPatientSearchnew') as FormControl).setValue(this.patientNamenew);

    let pat_head_forprint = "<TEXTFORMAT LEADING='2'>" +
      "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='14' COLOR='#000000' LETTERSPACING='0' KERNING='0'><B>" + this.patientNamenew.toString().toUpperCase() + "</B></FONT></P>" +
      "</TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'>" +
      "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='12' COLOR='#000000' LETTERSPACING='0' KERNING='0'>" + patObject.dob + "</FONT></P>" +
      "</TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'>" +
      "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='12' COLOR='#000000' LETTERSPACING='0' KERNING='0'>" + this.patient_addressnew.toString().toUpperCase() + "</FONT></P>" +
      "</TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'>" +
      "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='12' COLOR='#000000' LETTERSPACING='0' KERNING='0'>" + this.patient_zipcitystate + "</FONT></P>" +
      "</TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'>" +
      "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='12' COLOR='#000000' LETTERSPACING='0' KERNING='0'>" + patObject.cell_phone + "</FONT></P>" +
      "</TEXTFORMAT>";
    this.prntPatientHeadder = pat_head_forprint;


    this.showPatientSearchnew = false;
  }
  setPatString(value) {
    var dob = value.dob;
    var today: Date = new Date();
    var Arrage = this.general.calculateAge(dob, today);

    this.selectedPatientInfoString = "<b>Patient Name: </b> " + value.name + " <b>   Birth Date: </b> " + value.dob;

    if (Arrage[0] == "0" && Arrage[1] == "0") {
      this.selectedPatientInfoString += "  <b> Age: </b>" + Arrage[1] + " DAYS";
    }
    if (Arrage[0] == "0") {
      if (Arrage[2] == "0")
        this.selectedPatientInfoString += "  <b> Age: </b>" + Arrage[1] + " month";
      else
        this.selectedPatientInfoString += "  <b> Age: </b>" + Arrage[1] + "-months " + Arrage[2] + "-days";
    }
    else if (Arrage[1] == "0")
      this.selectedPatientInfoString += "  <b> Age: </b>" + Arrage[0] + " years";
    else
      this.selectedPatientInfoString += "  <b> Age: </b>" + Arrage[0] + " years - " + Arrage[1] + " months";
  }
  closePatientSearchnew() {

    this.showPatientSearchnew = false;
    this.onPatientSearchBlurnew();
  }
  //patient search end
  //#endregion searchpatientfornew

  //#region dropdown
  changeDDLltrTempValues() {
    this.populateDDLTemplateSections();
    this.populateDDLTemplateSubSections();
    this.selectedRowHTML = null;
    this.selectedRowHTML = this.generalOperation.filterArray(this.lstLetterTemplate, "template_id", this.letterMainForm.controls.ddl_lettertemplates.value);
    this.quilLetterTemplate = this.formBuilder.group({
      'letterTempText': [this.selectedRowHTML[0].text],
    });
    this.letterTempText = this.quilLetterTemplate.controls['letterTempText'];
  }
  populateDDLTemplateSections() {
    let a = (this.letterMainForm.get('ddl_lettertemplates') as FormControl).value;
    if (this.acLetterSections != null && this.acLetterSections.length > 0) {
      this.acLetterSections = new Array();
    }
    this.objSection = new Array();
    this.objSection.section_id = "-1";
    this.objSection.section_name = "";
    this.objSection.section_text = "";
    this.objSection.template_id = "-1";
    if (this.acLetterSections == null) {
      this.acLetterSections = new Array();
    }
    this.acLetterSections.push(this.objSection);
    if (this.acLetterSectionsSetup != null && this.acLetterSectionsSetup.length > 0) {
      for (var i = 0; i < this.acLetterSectionsSetup.length; i++) {
        if ((this.letterMainForm.get('ddl_lettertemplates') as FormControl).value != "") {
          if (this.acTemplateSections != null && this.acTemplateSections.length > 0) {
            for (var j = 0; j < this.acTemplateSections.length; j++) {
              if (this.acLetterSectionsSetup[i].section_id == this.acTemplateSections[j].section_id
                && (this.letterMainForm.get('ddl_lettertemplates') as FormControl).value == this.acTemplateSections[j].template_id) {
                this.objSection = new Array();
                this.objSection.section_id = this.acLetterSectionsSetup[i].section_id;
                this.objSection.section_name = this.acLetterSectionsSetup[i].section_name;
                this.objSection.section_text = this.acLetterSectionsSetup[i].section_text;
                this.objSection.template_id = this.acTemplateSections[j].template_id;
                this.acLetterSections.push(this.objSection);
                break;
              }
            }
          }
        }
      }
    }
  }

  //#endregion dropdown


  populateDDLTemplateSubSections() {
    this.acLetterSubSections = new Array();
    this.objSubSection = new Array();
    this.objSubSection.sub_section_id = "-1";
    this.objSubSection.sub_section_name = "";
    this.objSubSection.sub_section_text = "";
    this.objSubSection.template_id = "-1";

    if (this.acLetterSubSections == null) {
      this.acLetterSubSections = new Array();
    }

    this.acLetterSubSections.push(this.objSubSection);

    if (this.acLetterSubSectionsSetup != null && this.acLetterSubSectionsSetup.length > 0) {
      for (var i = 0; i < this.acLetterSubSectionsSetup.length; i++) {
        if ((this.letterMainForm.get('ddl_lettertemplates') as FormControl).value != "") {
          if (this.acTemplateSubSections != null && this.acTemplateSubSections.length > 0) {
            for (var j = 0; j < this.acTemplateSubSections.length; j++) {
              if (this.acLetterSubSectionsSetup[i].sub_section_id == this.acTemplateSubSections[j].sub_section_id
                && (this.letterMainForm.get('ddl_lettertemplates') as FormControl).value == this.acTemplateSubSections[j].template_id) {
                this.objSubSection = new Array();

                this.objSubSection.sub_section_id = this.acLetterSubSectionsSetup[i].sub_section_id;
                this.objSubSection.sub_section_name = this.acLetterSubSectionsSetup[i].sub_section_name;
                this.objSubSection.sub_section_text = this.acLetterSubSectionsSetup[i].sub_section_text;
                this.objSubSection.template_id = this.acTemplateSubSections[j].template_id;

                this.acLetterSubSections.push(this.objSubSection);

                break;
              }
            }
          }

        }
      }
    }

  }

  cancelPreview() {
    this.previewPrint = false;
    this.isPreviewBtn = false;
    this.panelShowHidePrev = true;
    this.isEditedLtr = false;
    this.isLetterTemplate = false;
    this.isNewLetter = false;
    this.isSummary = true;
    this.patientIdnew = null;
    this.patientNamenew = "";
    this.patient_dob = "";
    this.patient_cellPhone = "";
    (this.letterMainForm.get("mainPatientSearchnew") as FormControl).setValue(null);
    (this.letterMainForm.get("dateDOS") as FormControl).setValue(null);
    (this.letterMainForm.get('ddl_lettertemplates') as FormControl).setValue("");

    (this.letterMainForm.get('ddl_header') as FormControl).setValue("");
    (this.letterMainForm.get('ddl_section') as FormControl).setValue("");
    (this.letterMainForm.get('ddl_optionalsection') as FormControl).setValue("");


    this.quilLetterTemplate = this.formBuilder.group({
      'letterTempText': [""],
    });
    this.letterTempText = this.quilLetterTemplate.controls['letterTempText'];

    this.print_html = "";

  }

  previewLtrTemplate() {
    debugger;
    if (this.validate()) {
      this.ltr_Header = '';
      this.ltr_pat_Header = '';
      this.ltr_Section = '';
      this.ltr_OptSection = '';
      this.ltr_Body = '';
      this.ltr_DOS = '';
      this.ltrSignDate = ''
      this.ltrSigned_By = '';
      this.ltrSignature_Url = '';

      this.previewPrint = true;
      this.panelShowHidePrev = false;

      var quill = new Quill('#letterTempRichEditor', {
        theme: 'snow'
      });

      // get patient details for headder
      // ltr_pat_Header = "<TEXTFORMAT LEADING='2'>"+
      // "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='14' COLOR='#000000' LETTERSPACING='0' KERNING='0'><B>"+this.patientNamenew+"</B></FONT></P>"+
      // "</TEXTFORMAT>"+
      // "<TEXTFORMAT LEADING='2'>"+
      // "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='12' COLOR='#000000' LETTERSPACING='0' KERNING='0'>"+this.patient_addressnew+"</FONT></P>"+
      // "</TEXTFORMAT>"+
      // "<TEXTFORMAT LEADING='2'>"+
      // "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='12' COLOR='#000000' LETTERSPACING='0' KERNING='0'>"+this.patient_zipcitystate+"</FONT></P>"+
      // "</TEXTFORMAT>";
      this.ltr_pat_Header = "<P ALIGN='RIGHT' class=\"m-0\"><B>" + this.patientNamenew + "</B></P>" +
        "<P ALIGN='RIGHT' class=\"m-0\"> DOB " + this.patient_dob + "</P>" +
        "<P ALIGN='RIGHT' class=\"m-0\">" + this.patient_addressnew + "</P>" +
        "<P ALIGN='RIGHT' class=\"m-0\">" + this.patient_zipcitystate + "</P>" +
        "<P ALIGN='RIGHT' class=\"m-0\">" + this.patient_cellPhone + "</P>";


      // get practice details for headder
      this.selectedHeadderHTML = null;
      this.selectedHeadderHTML = this.generalOperation.filterArray(this.lstLetterHeader, "header_id", (this.letterMainForm.get('ddl_header') as FormControl).value);
      this.ltr_Header = this.selectedHeadderHTML.length > 0 ? this.richTextEditorToHtml(this.selectedHeadderHTML[0].text) : "";
      this.ltr_Header = this.generalOperation.ReplaceAll(this.ltr_Header, "<p>", "<p class=\"m-0\">")
      //get section
      this.selectedSectionHTML = null;
      this.selectedSectionHTML = this.generalOperation.filterArray(this.acLetterSections, "section_id", (this.letterMainForm.get('ddl_section') as FormControl).value);
      this.ltr_Section = this.selectedSectionHTML.length > 0 ? this.richTextEditorToHtml(this.selectedSectionHTML[0].section_text) : "";

      //get sub section

      this.selectedSubSectionHTML = null;
      this.selectedSubSectionHTML = this.generalOperation.filterArray(this.acLetterSubSections, "sub_section_id", (this.letterMainForm.get('ddl_optionalsection') as FormControl).value);
      this.ltr_OptSection = this.selectedSubSectionHTML.length > 0 ? this.richTextEditorToHtml(this.selectedSubSectionHTML[0].sub_section_text) : "";


      this.ltr_Body = this.richTextEditorToHtml(this.quilLetterTemplate.value.letterTempText);
      this.ltr_DOS = this.dateTimeUtil.getStringDateFromDateModel((this.letterMainForm.get('dateDOS') as FormControl).value);

      // if(this.strPatLetterOperation == "modify" && this.issigned == "1")
      // {
      // 	//ltrSignDate = "<i>Signed Date: <b>"+dgPatLetters.selectedItem.signed_date+"</b></i>";
      // 	//ltrSigned_By = "<i>Signed By: <b>" +dgPatLetters.selectedItem.signed_by_name+"</b></i>";
      //   //ltrSignature_Url = dgPatLetters.selectedItem.signature_path.toString().replace("\\","/");


      // 	// if(img_sign != null && ltrSignature_Url != "")
      // 	// 	img_sign.source = SignatureUrl + ltrSignature_Url;
      // 	// if(btnEditPrev !=  null)
      // 	// {
      // 	// 	btnEditPrev.enabled = false;
      // 	// 	btnSignLtr.enabled = false;
      // 	// }
      // }else{
      //   ltrSignDate = ltrSigned_By = ltrSignature_Url = "";
      //   // img_sign != null ? img_sign.source = null : null;
      //   // if(btnEditPrev !=  null)
      //   // {
      //   //   btnEditPrev.enabled = true;
      //   //   btnSignLtr.enabled = false;
      //   // }
      // }

      let chck = "<table class='HTMLPrevMargin' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td align='left'>" + this.ltr_Header + "</td><td align='right'> " +
        " " + this.ltr_pat_Header + " " +
        "</td></tr><tr><td colspan='2'><hr size='2' width='100%' color='#009140'></td></tr></table><table width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td>" +
        " " + this.ltr_Section + " " +
        "</td></tr></table><table width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td>" +
        " " + this.ltr_OptSection + " " +
        "</td></tr></table><table class='HTMLPrevAlign' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td colspan='2'>" +
        " " + this.selectedPatientInfoString + " " +
        "</td></tr></table><table class='HTMLPrevAlign' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td colspan='2' class=\"float-right\">" +
        " " + this.ltr_DOS + " " +
        "</td></tr></table><table class='HTMLPrevMargin' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td>" +
        " " + this.ltr_Body + " " +
        "</td></tr></table>";

      // this.preview = this.formBuilder.group({
      //   'letterTempPrev': [chck],
      // });
      // this.letterTempPrev = this.preview.controls['letterTempPrev'];

      this.patientID_patLtr = this.patientIdnew.toString();

      this.letterName_patLtr = this.generalOperation.filterArray(this.lstLetterTemplate, "template_id", (this.letterMainForm.get('ddl_lettertemplates') as FormControl).value);
      this.letterName = this.letterName_patLtr.length > 0 ? this.letterName_patLtr[0].name : "";
      this.ltr_prev_DOS = this.ltr_DOS;

      this.print_html = chck;//.replace(/<p align="LEFT">/g, "<p align='LEFT' style='margin-bottom:0rem !important;'>");
      this.isPreviewBtn = true;
      this.textBtnPrint = "Save & Print";
    }

    this.enableSign = false;
  }

  validate(): Boolean {

    if (this.patientNamenew == "") {
      alert("Please Select the patient.");
      return false;
    }
    if ((this.letterMainForm.get('ddl_lettertemplates') as FormControl).value == "") {
      alert("Please select a valid Letter Template.");
      return false;
    }
    if ((this.letterMainForm.get('dateDOS') as FormControl).value == "") {
      alert("Please select DOS first.");
      return false;
    }
    return true;
  }
  richTextEditorToHtml(str) {
    // Create XML document
    debugger;
    str = this.generalOperation.ReplaceAll(str, "<TEXTFORMAT LEADING=\"2\"><P ALIGN=\"LEFT\"><FONT FACE=\"Arial\" SIZE=\"14\" COLOR=\"#000000\" LETTERSPACING=\"0\" KERNING=\"0\">", "<br/>");
    str = this.generalOperation.ReplaceAll(str, "<TEXTFORMAT LEADING=\"2\"><P ALIGN=\"LEFT\"><FONT FACE=\"Arial\" SIZE=\"12\" COLOR=\"#000000\" LETTERSPACING=\"0\" KERNING=\"0\">", "<br/>");
    str = this.generalOperation.ReplaceAll(str, "</FONT></P></TEXTFORMAT>", "");
    //str =  ("<BODY>"+str+"</BODY>");

    //remove text format
    //str = str.replace(/(<TEXTFORMAT[^>]+>|<TEXTFORMAT>|<\/TEXTFORMAT>)/g, "<br/>");
    //str = str.replace(/(<textformat[^>]+>|<textformat>|<\/textformat>)/g, "<br/>");

    //remove alignleft
    //str = str.replace("align='left'","text-align='left'")

    //remove font tag
    str = str.replace(/(<FONT[^>]+>|<FONT>|<\/FONT>)/g, "");
    str = str.replace(/(<font[^>]+>|<font>|<\/font>)/g, "");

    str = str.replace(/  /g, "&nbsp;");

    return str;
  }


  previewA() {

    this.previewPrint = true;

    var quill = new Quill('#letterTempRichEditor', {
      theme: 'snow'
    });



    let headderPatientDetails = "<TEXTFORMAT LEADING='2'>" +
      "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='14' COLOR='#000000' LETTERSPACING='0' KERNING='0'><B>" + this.patientNamenew + "</B></FONT></P>" +
      "</TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'>" +
      "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='12' COLOR='#000000' LETTERSPACING='0' KERNING='0'>" + this.patient_addressnew + "</FONT></P>" +
      "</TEXTFORMAT>" +
      "<TEXTFORMAT LEADING='2'>" +
      "<P ALIGN='RIGHT'><FONT FACE='Arial' SIZE='12' COLOR='#000000' LETTERSPACING='0' KERNING='0'>" + this.patient_zipcitystate + "</FONT></P>" +
      "</TEXTFORMAT>";

    //ltr_Header = drpDwnHeader.selectedIndex > 0 ? drpDwnHeader.selectedItem.text : "";
    //ddl_header

    // alert((this.letterMainForm.get('ddl_header') as FormControl).value);
    //   if((this.letterMainForm.get('ddl_header') as FormControl).value!=""){

    //     this.selectedHeadderHTML = null;
    //     this.selectedHeadderHTML = this.generalOperation.filterArray(this.lstLetterHeader, "header_id", (this.letterMainForm.get('ddl_header') as FormControl).value);
    //     headderPracticeInformation = this.selectedHeadderHTML[0].text;
    //   }

    // this.selectedPatientInfoString;

    //DOS from date selected.......


    // this.quilLetterTemplate.value.letterTempText

    this.preview = this.formBuilder.group({
      'letterTempPrev': [this.quilLetterTemplate.value.letterTempText],
    });
    this.letterTempPrev = this.preview.controls['letterTempPrev'];

    //this.print_html = this.quilLetterTemplate.value.letterTempText;
    //this.quilLetterTemplate.value.sectionText;
    //this.print_html = 
  }
  //#region savepatientletter
  editLetter() {
    debugger;
    if (this.strLtrPreview == "home")
      this.isEditedLtr = true;

    this.txt_ltr_headder = "Edit Letter";
    this.isNewLetter = true;
    this.isSummary = false;
    this.panelShowHidePrev = true;
    this.previewPrint = false;
    this.isPreviewBtn = false;
    this.patientNamenew = this.editHeaderRow.patient_name;
    this.patientIdnew = this.editHeaderRow.patient_id;
    this.patient_dob = this.editHeaderRow.dob;

    if (this.editHeaderRow.cell_phone != null && this.editHeaderRow.cell_phone != "")
      this.patient_cellPhone = new PhonePipe().transform(this.editHeaderRow.cell_phone);
    else
      this.patient_cellPhone = "";
    this.patient_addressnew = this.editHeaderRow.patient_address;
    this.patient_zipcitystate = this.editHeaderRow.patient_city_state_zip;
    this.selectedPatientInfoString = this.editHeaderRow.patient_detail;

    (this.letterMainForm.get("mainPatientSearchnew") as FormControl).setValue(this.editHeaderRow.patient_name);
    //(this.letterMainForm.get("dateDOS") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.editHeaderRow.dos.substring(0, 10), DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    //(this.letterMainForm.get("dateDOS") as FormControl).setValue(this.editHeaderRow.dos);
    (this.letterMainForm.get('dateDOS') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.editHeaderRow.dos, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.letterMainForm.get('ddl_lettertemplates') as FormControl).setValue(this.editHeaderRow.template_id);
    this.changeDDLltrTempValues();
    (this.letterMainForm.get('ddl_header') as FormControl).setValue(this.editHeaderRow.header_id);
    (this.letterMainForm.get('ddl_section') as FormControl).setValue(this.editHeaderRow.section_id);
    (this.letterMainForm.get('ddl_optionalsection') as FormControl).setValue(this.editHeaderRow.optional_section_id);


    this.quilLetterTemplate = this.formBuilder.group({
      'letterTempText': [this.editHeaderRow.body_text],
    });
    this.letterTempText = this.quilLetterTemplate.controls['letterTempText'];

    this.print_html = "";

  }

  savePatientLetter() {
    debugger;
    if (this.validate()) {

      this.objPatLtr = new ORMPatientLetter();
      this.objPatLtr.template_id = (this.letterMainForm.get('ddl_lettertemplates') as FormControl).value;
      this.objPatLtr.patient_id = this.patientIdnew.toString();
      this.objPatLtr.patient_text = this.selectedPatientInfoString;
      this.objPatLtr.dos = this.dateTimeUtil.getStringDateFromDateModel((this.letterMainForm.get('dateDOS') as FormControl).value);
      this.prntDOs = this.objPatLtr.dos;

      this.selectedHeadderHTML = null;
      this.selectedHeadderHTML = this.generalOperation.filterArray(this.lstLetterHeader, "header_id", (this.letterMainForm.get('ddl_header') as FormControl).value);
      this.objPatLtr.header_id = this.selectedHeadderHTML.length > 0 ? (this.letterMainForm.get('ddl_header') as FormControl).value : "";
      this.prntPracticeHeadder = this.selectedHeadderHTML.length > 0 ? this.selectedHeadderHTML[0].text : "";



      //section
      this.selectedSectionHTML = null;
      this.selectedSectionHTML = this.generalOperation.filterArray(this.acLetterSections, "section_id", (this.letterMainForm.get('ddl_section') as FormControl).value);
      this.objPatLtr.section_id = this.selectedSectionHTML.length > 0 ? (this.letterMainForm.get('ddl_section') as FormControl).value : "";
      this.prntSection = this.selectedSectionHTML.length > 0 ? this.selectedSectionHTML[0].section_text : "";

      //sub section
      this.selectedSubSectionHTML = null;
      this.selectedSubSectionHTML = this.generalOperation.filterArray(this.acLetterSubSections, "sub_section_id", (this.letterMainForm.get('ddl_optionalsection') as FormControl).value);
      this.objPatLtr.optional_section_id = this.selectedSubSectionHTML.length > 0 ? (this.letterMainForm.get('ddl_optionalsection') as FormControl).value : "";
      this.prntSubSection = this.selectedSubSectionHTML.length > 0 ? this.selectedSubSectionHTML[0].sub_section_text : "";

      this.objPatLtr.body_text = this.quilLetterTemplate.value.letterTempText;
      this.prntBody = this.quilLetterTemplate.value.letterTempText;

      this.objPatLtr.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      this.objPatLtr.modified_user = this.lookupList.logedInUser.user_name;
      this.objPatLtr.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

      if (this.isEditedLtr != true) {
        this.objPatLtr.created_user = this.lookupList.logedInUser.user_name;
        this.objPatLtr.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      }
      else {
        this.objPatLtr.patient_letter_id = this.editHeaderRow.patient_letter_id;
        this.objPatLtr.created_user = this.editHeaderRow.created_user;
        this.objPatLtr.client_date_created = this.editHeaderRow.client_date_created;
        this.objPatLtr.date_created = this.editHeaderRow.date_created;
      }

      if (this.textBtnPrint.toLowerCase() == "save & print") {
        this.prntSignDate = "";
        this.prntSignBy = "";
      }
      if (this.selectedPatientInfoString != "")
        this.prntPatInfo = this.selectedPatientInfoString;
      else
        this.prntPatInfo = "";




      this.letterService.saveupdatePatientLetter(this.objPatLtr)
        .subscribe(
          data => this.savedSuccessfull(this.patientIdnew.toString(), data),
          error => alert(error),
          () => this.logMessage.log("Save Daily Deposit.")
        );
    }
  }
  savedSuccessfull(patientIdnew, data) {
    debugger;
    this.dataUpdated.emit(new ORMKeyValue("Patient Letter", "1"));
    this.isEditedLtr = false;

    this.isPreviewBtn = false;
    this.isLetterTemplate = false;
    this.isNewLetter = false;
    this.isSummary = true;

    debugger;
    if (this.textBtnPrint.toLowerCase() == "print") {
      (this.searchLettersForm.get("mainPatientSearch") as FormControl).setValue(null);
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [];
      if (patientIdnew != undefined && patientIdnew != "") {
        searchCriteria.param_list.push({ name: "patient_id", value: patientIdnew, option: "" });
      }

      searchCriteria.param_list.push({ name: "dateFrom", value: data.dos, option: "" });
      searchCriteria.param_list.push({ name: "dateTo", value: data.dos, option: "" });
      searchCriteria.param_list.push({ name: "dateType", value: "dos", option: "" });

      this.letterService.searchPatientLetters(searchCriteria).subscribe(
        data => {
          this.lstSearchLetters = null;
          this.lstSearchLetters = data;
        },
        error => {
          this.searchLettersError(error);
        }
      );
    } else {
      this.printLtr();
    }
    this.cancelPreview();

    if (this.isCallingFrom == "patient") {

      (this.searchLettersForm.get("mainPatientSearch") as FormControl).setValue(this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name);
      this.searchLetters(this.searchLettersForm);
    }
  }
  //#endregion savepatientletter
  // openck() {
  //   this.isSummary = false;
  //   this.isNewLetter = false;
  //   this.isLetterTemplate = false;
  //   this.isTemplateSetting = false;
  //   this.isCKeditor = true;
  // }
  DeleteSelectedLetter(row) {

    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;
    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = row.patient_letter_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.letterService.deleteSelectedLetter(deleteRecordData)
          .subscribe(
            data => this.onDeleteSelectedLetter(data),
            error => alert(error),
            () => this.logMessage.log("Selected Letter Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSelectedLetter(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Selected Letter";
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      this.searchLetters(this.refreshSearch)
    }
  }
  previewFromMainGrid = false;
  //grid preview
  openSelectedLetter(selectedRow) {
    debugger;
    this.previewFromMainGrid = true;
    this.txt_ltr_headder = "Preview Letter";
    this.editHeaderRow = "";
    this.editHeaderRow = selectedRow;
    if (selectedRow.letter_name.toUpperCase() == "ABNORMAL LAB LETTER - DOWNTOWN") {
      const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirmation Required';
      modalRef.componentInstance.promptMessage = 'Do you want to change lab follow up status to LETTER SENT?';
      let closeResult;
      modalRef.result.then((result) => {
        if (result == PromptResponseEnum.YES) {
          let searchCriteria: SearchCriteria = new SearchCriteria();
          searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
          searchCriteria.param_list = [
            { name: "User", value: this.lookupList.logedInUser.user_name, option: "" },
            { name: "DOS", value: selectedRow.dos, option: "" },
            { name: "patient_id", value: selectedRow.patient_id, option: "" }
          ];
          this.letterService.updateLetterStatus(searchCriteria)
            .subscribe(
              data => this.onLetterStatusUpdate(data),
              error => alert(error),
              () => this.logMessage.log("Selected Letter Status Changed Successfull.")
            );

        } else if (result === PromptResponseEnum.NO) {
          this.ltrPreview(selectedRow);
        }
      }, (reason) => {

      });
    } else {
      this.ltrPreview(selectedRow);
    }
    //this.enableSign = true;

    if (selectedRow.signed == "1") {
      this.enableSign = false;
    } else {
      this.enableSign = true;
    }

    this.panelShowHidePrev = false;
    this.strLtrPreview = "home";
    this.textBtnPrint = "Print";
  }
  onLetterStatusUpdate(data) {


  }
  ltrPreview(selectedRow) {
    debugger;
    this.isSummary = false;
    this.isNewLetter = true;
    this.previewPrint = true;
    this.isPreviewBtn = true;


    this.ltr_prev_SignDate = "";
    this.ltr_prev_Signed_By = "";
    this.ltr_prev_Signature_Url = "";
    //clearData(false);
    let ltr_prev_Header = this.richTextEditorToHtml(selectedRow.header_text);
    this.prntPracticeHeadder = ltr_prev_Header;
    let c_phone = "";
    if (selectedRow.cell_phone != null && selectedRow.cell_phone != "") {
      c_phone = new PhonePipe().transform(selectedRow.cell_phone);
    }

    let ltr_prev_pat_Header = "<P ALIGN='RIGHT' class=\"m-0\"><B>" + selectedRow.patient_name.toString().toUpperCase() + "</B></P>" +
      "<P ALIGN='RIGHT' class=\"m-0\"> DOB " + selectedRow.dob + "</P>" +
      "<P ALIGN='RIGHT' class=\"m-0\">" + selectedRow.patient_address + "</P>" +
      "<P ALIGN='RIGHT' class=\"m-0\"> " + selectedRow.patient_city_state_zip + "</P>" +
      "<P ALIGN='RIGHT' class=\"m-0\"> " + c_phone + "</P>";
    this.prntPatientHeadder = ltr_prev_pat_Header;

    this.ltr_prev_Section = this.richTextEditorToHtml(selectedRow.section_text);
    this.prntSection = this.ltr_prev_Section;
    this.ltr_prev_OptSection = this.richTextEditorToHtml(selectedRow.optional_section_text);
    this.prntSubSection = this.ltr_prev_OptSection;
    this.ltr_prev_Body = this.richTextEditorToHtml(selectedRow.body_text);
    this.prntBody = this.ltr_prev_Body;
    this.ltr_prev_DOS = selectedRow.dos;
    this.prntDOs = this.ltr_prev_DOS;
    this.letterName = selectedRow.letter_name;
    //this.SelPatInfo = selectedRow.patient_detail;
    //this.prntPatInfo = this.SelPatInfo;
    this.patientID_patLtr = selectedRow.patient_id;
    this.patLetterId = selectedRow.patient_letter_id;
    this.isLetterSigned = selectedRow.signed > 0 ? "true" : "false";
    if (this.isLetterSigned == "true") {
      // this.ltr_prev_SignDate = "<i>Signed Date: <b>" + selectedRow.signed_date + "</b></i>";
      // this.ltr_prev_Signed_By = "<i>Signed By: <b>" + selectedRow.signed_by_name + "</b></i>";

      this.ltr_prev_SignDate = selectedRow.signed_date;
      this.ltr_prev_Signed_By = selectedRow.signed_by_name;

      this.ltr_prev_Signature_Url = selectedRow.signature_path.toString().replace("\\", "/");
      if (this.img_sign != null && this.ltr_prev_Signature_Url != "")
        this.img_sign = this.SignatureUrl + this.ltr_prev_Signature_Url;
    }
    else {
      //let ltr_prev_SignDate = this.ltr_prev_Signed_By = this.ltr_prev_Signature_Url = "";
      //this.img_sign != null ? this.img_sign = null : null;
    }
    this.prntSignDate = this.ltr_prev_SignDate;
    this.prntSignBy = this.ltr_prev_Signed_By;
    //let img_sign = 
    // strLtrPreview = "homepage";

    //this.selectedPatientInfoString = selectedRow.patient_detail;

    let chck = "<table class='HTMLPrevMargin' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td align='left'>" + ltr_prev_Header + "</td><td align='right'> " +
      " " + this.richTextEditorToHtml(ltr_prev_pat_Header) + " " +
      "</td></tr><tr><td colspan='2'><hr size='2' width='100%' color='#009140'></td></tr></table> " +
      " <table width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td>" +
      " " + this.ltr_prev_Section + " " +
      "</td></tr></table><table width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td>" +
      " " + this.ltr_prev_OptSection + " " +
      "</td></tr></table>" +
      // "<br><table class='HTMLPrevAlign' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td colspan='2'>" +
      // " " + this.selectedPatientInfoString + " " +
      // "</td></tr></table><br>"+
      "<table class='HTMLPrevAlign' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td class=\"float-right\" colspan='2'>" +
      " " + this.ltr_prev_DOS + " " +
      "</td></tr></table><br><table class='HTMLPrevMargin' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td>" +
      " " + this.ltr_prev_Body + " " +
      "</td></tr></table><br></br><br>";
    if (this.isLetterSigned == "true") {
      chck = chck + "<table class='HTMLPrevMargin' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td align='left'><i>Signed Date: <b>" + this.ltr_prev_SignDate + "</b></i></td><td align='right'> " +
        // " <img src=" + this.img_sign + " /> " +
        "</td></tr>" +
        "<tr><td align='left'><i>Signed By: <b>" + this.ltr_prev_Signed_By + "</b></i></td><td align='right'> " +
        // "<tr><td align='left'>" + this.ltr_prev_Signed_By + "</td><td align='right'> " +
        "</td></tr></table>";


      // this.ltr_prev_SignDate = "<i>Signed Date: <b>" + selectedRow.signed_date + "</b></i>";
      // this.ltr_prev_Signed_By = "<i>Signed By: <b>" + selectedRow.signed_by_name + "</b></i>";
    }

    // this.preview = this.formBuilder.group({
    //   'letterTempPrev': [chck],
    // });
    // this.letterTempPrev = this.preview.controls['letterTempPrev'];


    //this.prevMainHTML = chck;
    this.print_html = chck;

  }
  signLetter() {

    try {
      if (this.patLetterId != "") {
        this.lstSignLetterData = new Array<ORMKeyValue>();

        this.lstSignLetterData.push(new ORMKeyValue("patLetterId", this.patLetterId));
        //this.lstSignLetterData.push(new ORMKeyValue("userName",this.lookupList.logedInUser.user_name));
        this.lstSignLetterData.push(new ORMKeyValue("userName", this.lookupList.logedInUser.user_name));
        this.lstSignLetterData.push(new ORMKeyValue("dateTime", this.dateTimeUtil.getCurrentDateTimeString()));
        this.lstSignLetterData.push(new ORMKeyValue("practiceId", this.lookupList.practiceInfo.practiceId));

        this.letterService.signLetter(this.lstSignLetterData).subscribe(
          data => {
            //this.onLetterSign(data);

            this.ltrSignature_Url = data['result'].toString().replace("\\", "/");

            this.isLetterSigned = "true";
            this.ltr_prev_SignDate = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
            //this.img_sign  = this.SignatureUrl + this.ltrSignature_Url ;
            //this.ltr_prev_Signed_By = this.lookupList.logedInUser.user_name;
            this.ltr_prev_Signed_By = this.lookupList.logedInUser.userLName + ', ' + this.lookupList.logedInUser.userFName;


            if (this.isLetterSigned == "true") {
              this.print_html = this.print_html + "<table class='HTMLPrevMargin' width='100%' border='0' cellpadding='0' cellspacing='0'><tr><td align='left'><i>Signed By: </i><b>" + this.ltr_prev_Signed_By + "</b></td><td align='right'> " +
                // " <img src=" + this.img_sign + " /> " +
                "</td></tr>" +
                "<tr><td align='left'><i>Signed Date: </i><b>" + this.ltr_prev_SignDate + "</b></td><td align='right'> " +
                // "<tr><td align='left'>" + this.ltr_prev_Signed_By + "</td><td align='right'> " +
                "</td></tr></table>";
            }

            this.enableSign = false;

          },
          error => {
            this.signLetterSuccessError(error);

          }
        );


      }
    } catch (error) {

    }
  }
  onLetterSign(data) {
    this.ltrSignature_Url = data.toString().replace("\\", "/");
    this.isLetterSigned = "true";
    this.ltr_prev_SignDate = this.dateTimeUtil.getCurrentDateTimeString();
    this.img_sign = this.SignatureUrl + this.ltrSignature_Url;
    this.ltr_prev_Signed_By = this.lookupList.logedInUser.user_name;



    // let searchCriteria: SearchCriteria = new SearchCriteria();
    // searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    // searchCriteria.param_list = [];
    // if (this.patientID_patLtr != undefined && this.patientID_patLtr !="") {
    //   searchCriteria.param_list.push({ name: "patient_id", value: this.patientID_patLtr, option: "" });
    // }
    // this.letterService.searchPatientLetters(searchCriteria).subscribe(
    //   data => {
    //     this.lstSearchLetters = null;
    //     this.lstSearchLetters = data;
    //   },
    //   error => {
    //     this.searchLettersError(error);
    //   }
    // );

  }
  signLetterSuccessError(error) {
    this.logMessage.log("Sign letter Error.");
  }

  //print
  printLetter() {
    if (this.textBtnPrint.toLowerCase() == "save & print") {
      this.savePatientLetter();

    } else {
      this.printLtr();
    }
  }
  printLtr() {
    debugger;
    this.ltrHTML = "<div class='report letter'>";
    this.ltrHTML = this.ltrHTML + " <table width='100%' class='fz-inherit' border='0' cellpadding='0' cellspacing='0'> " +
      " <tr> " +
      " <td align='left'> " +
      " " + this.richTextEditorToHtml(this.prntPracticeHeadder) + " " +
      " </td> " +
      " <td align='right'> " +
      " " + this.richTextEditorToHtml(this.prntPatientHeadder) + " " +
      " </td></tr> " +
      " <tr><td colspan='2'><hr size='2' width='100%' color='#009140'></td></tr></table> ";

    this.ltrHTML = this.generalOperation.ReplaceAll(this.ltrHTML, "<p>", "<p class=\"m-0\">")

    if (this.prntSection) {
      this.ltrHTML = this.ltrHTML + " <table width='100%' class='fz-inherit'> <tr> <td> " +
        " " + this.prntSection + " " +
        " </td> </tr> </table> ";
    }
    if (this.prntSubSection) {
      this.ltrHTML = this.ltrHTML + " <table width='100%' class='fz-inherit'> <tr> <td> " +
        " " + this.prntSubSection + " " +
        " </td> </tr> </table> ";
    }

    // " <table width='100%'> <tr> <td> " +
    // " " + this.prntSection + " " +
    // " </td> </tr> </table> " +
    // // " <br></br> " +
    // " </br> " +
    // " <table width='100%'> <tr> <td> " +
    // " " + this.prntSubSection + " " +
    // " </td> </tr> </table> " +
    // //" <br></br> " +
    // " </br> " +

    // if (this.prntPatInfo) {
    //   this.ltrHTML = this.ltrHTML + " <table width='100%'><tr><td> " +
    //     " " + this.prntPatInfo + " " +
    //     " </td></tr></table> " +
    //     " </br> ";
    // }
    if (this.prntDOs) {
      this.ltrHTML = this.ltrHTML + " <table align='left' class='fz-inherit' class=\"float-right\" width='100%'><tr><td class='text-right'> " +
        " " + this.prntDOs + " " +
        " </td></tr></table>  ";
    }


    //" <br></br> " +
    this.ltrHTML = this.ltrHTML + " <table width='100%' class='fz-inherit'><tr><td>" +
      " " + this.richTextEditorToHtml(this.prntBody) + " " +
      " </td></tr></table><br></br> ";
    //if (this.ltr_prev_Signed_By != "" || this.ltr_prev_Signed_By != null || this.ltr_prev_Signed_By != undefined) {
    if (this.ltr_prev_Signed_By) {
      this.ltrHTML = this.ltrHTML + " <i>Signed By: </i><b> " + this.ltr_prev_Signed_By + "</b> ";
    }
    //if (this.ltr_prev_SignDate != "" || this.ltr_prev_SignDate != null || this.ltr_prev_SignDate != undefined) {
    if (this.ltr_prev_SignDate) {
      this.ltrHTML = this.ltrHTML + " </br> " +
        " <i>Signed Date: </i><b>" + this.ltr_prev_SignDate + "</b> ";
    }
    this.insertNotesPrint();

    this.ltrHTML = this.ltrHTML + " </div> ";

    const modalRef = this.modalService.open(EncounterPrintViewerComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.print_html = this.ltrHTML;
    modalRef.componentInstance.print_style = this.style;
    // if (window) {
    //   if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
    //     var popup = window.open('', '_blank',
    //       'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,'
    //       + 'location=no,status=no,titlebar=no');

    //     popup.window.focus();
    //     popup.document.write('<!DOCTYPE html><html><head>  '
    //       // +'<style>'
    //       // +this.print_style
    //       // +'</style>'
    //       + '</head><body onload="self.print()"><div class="reward-body">'
    //       + this.richTextEditorToHtml(this.ltrHTML) + '</div></html>');
    //     popup.onbeforeunload = function (event) {
    //       popup.close();
    //       return '.\n';
    //     };
    //     popup.onabort = function (event) {
    //       popup.document.close();
    //       popup.close();
    //     }
    //   } else {
    //     var popup = window.open('', '_blank', 'width=800,height=600');
    //     popup.document.open();
    //     popup.document.write('<html><head>' +
    //       +'<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css"'
    //       + ' media="all">'
    //       // +'<style>'
    //       // +this.print_style
    //       // +'</style>'
    //       + '</head><body onload="window.print()">' + this.ltrHTML + '</html>');
    //     popup.document.close();
    //   }

    //   popup.document.close();
    // }



  }

  insertNotesPrint() {

    let ormPatNote: ORMPatientNote = new ORMPatientNote();

    //ormPatNote.patient_id = this.patientId.toString();
    ormPatNote.patient_id = this.patientID_patLtr.toString();
    ormPatNote.notes = "Letter print: " + this.letterName + " of (" + this.ltr_prev_DOS + ") was printed by " + this.lookupList.logedInUser.user_name.toUpperCase() + " (" + this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY) + ") ";
    ormPatNote.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    ormPatNote.created_user = this.lookupList.logedInUser.user_name;
    ormPatNote.client_date_created = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    ormPatNote.modified_user = this.lookupList.logedInUser.user_name;
    ormPatNote.client_date_modified = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    ormPatNote.notes_type = "Staff";
    ormPatNote.alert = false;
    ormPatNote.note_type_id = "";
    this.letterService.saveNotesonPrint(ormPatNote)
      .subscribe(
        data => this.savedSuccessfullNotesonPrint(),
        error => alert(error),
        () => this.logMessage.log("Save Notes on Print.")
      );
  }
  savedSuccessfullNotesonPrint() {
    this.dataUpdated.emit(new ORMKeyValue("Save Notes on Print", "1"));
  }
  changeLetter(val) {
    this.isSelectedLtrID = val.patient_letter_id;
  }
  generated_pdf_url_link: string = "";
  generated_pdf_url_temp: string = "";
  generated_pdf_path_temp: string = "";
  lgPopupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  onFax() {
    let docPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
    if (docPath != null && docPath.length > 0) {
      let criteria: SearchCriteria = new SearchCriteria();
      criteria.practice_id = this.lookupList.practiceInfo.practiceId;
      criteria.param_list = [
        { name: "path", value: docPath[0].upload_path, option: "" },
        { name: "footer", value: "", option: "" },
        { name: "html", value: this.print_html, option: "" }
      ];
      this.referralService.GenerateTempLetter(criteria).subscribe(
        data => {
          debugger;
          this.generated_pdf_url_temp = this.generalOperation.ReplaceAll((docPath[0].download_path + this.lookupList.practiceInfo.practiceId + "/PatientDocuments/temp/" + data['result']).toString(), "\\", "/");
          this.generated_pdf_path_temp = (docPath[0].upload_path + this.lookupList.practiceInfo.practiceId + "/PatientDocuments/temp/" + data['result']).toString();//2019/05/27/456.pdf
          this.generated_pdf_url_link = data['result'];

          // const modalRef = this.modalService.open(ReferralViewersComponent, this.lgPopupUpOptions);
          // modalRef.componentInstance.path_doc = this.generated_pdf_url_temp;//docPath[0].download_path+this.lookupList.practiceInfo.practiceId+"\\PatientDocuments\\temp\\"+data['result'];
          // modalRef.componentInstance.width = '800px';

          // this.showFax = true;
          let strLink = "";
          strLink = this.config.flexApplink;
          strLink += "user_id=" + this.lookupList.logedInUser.userId;
          strLink += "&user_name=" + this.lookupList.logedInUser.user_name;
          strLink += "&practice_id=" + this.lookupList.practiceInfo.practiceId;
          strLink += "&calling_from=letters";
          strLink += "&letter_path=" + this.generated_pdf_path_temp;
          strLink += "&patient_id=" + this.patientId;

          const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
          modalRef.componentInstance.path_doc = strLink;
          modalRef.componentInstance.width = '800px';
        },
        error => {
          error => alert(error);
        }
      );
    }
  }

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };
}