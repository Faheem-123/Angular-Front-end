import { OpenModuleService } from './../../../services/general/openModule.service';
import { Component, OnInit, Input, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { PatientService } from '../../../services/patient/patient.service';
import { LogMessage } from '../../../shared/log-message';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap/tabset/tabset';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { OpenedPatientInfo } from './../../../models/common/patientInfo';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { CDSService } from 'src/app/services/cds.service';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { GeneralService } from 'src/app/services/general/general.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { PatientSummaryComponent } from '../patient-summary/patient-summary.component';
import { CameraCapturePopupComponent } from 'src/app/general-modules/camera-capture-popup/camera-capture-popup.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'patient-content',
  templateUrl: './patient-content.component.html',
  styleUrls: ['./patient-content.component.css']
})
export class PatientContentComponent implements OnInit, AfterViewInit {
  @Input() patientToOpen: PatientToOpen;
  @ViewChild('patientMaintab') tab: any;
  @ViewChild('popContent') popover: any;
  @ViewChild(PatientSummaryComponent) summaryChild: PatientSummaryComponent;
  patientId;
  patFName;
  patLName;
  patDOB;
  patAge;
  patGender;
  PID;
  patAddress;
  patCity;
  patState;
  patZip;
  patContactNo;

  patMaritalStatus;
  patAgeYear;
  patAgeMonth;
  patAgeDays;
  patHeight;
  patWeight;
  patBMI;
  patBP;
  patTemp;
  patPicURL: String;
  downloadPath;
  //*****  Load On Init ***************
  loadSummaryByDefault: boolean = false;
  loadSummary: boolean = false;
  loadInfo: boolean = false;
  loadEncounter: boolean = false;
  loadClaim: boolean = false;
  loadLabs: boolean = false;
  loadDocments: boolean = false;
  loadReferral: boolean = false;
  loadConsults: boolean = false;
  loadLetters: boolean = false;
  loadCorrespondence: boolean = false;
  loadPersonalInjury: boolean = false;
  loadAppointments: boolean = false;
  loadMessages: boolean = false;
  //loadtestChart: boolean = false;
  loadPatientPayment: boolean = false;
  loadInfoCapture: boolean = false;
  //*******************************  

  lstAppiontmentData: Array<ORMKeyValue>;
  lstPatientData: Array<ORMKeyValue>;
  acNotivications;
  isCDSLoding = false;
  isRefresh = false;
  ruleMainHeading = 'Please click refresh to load Alert/Notification.'
  isCDSShow=false;
  private openPatientInfo: OpenedPatientInfo

  ngAfterViewInit() {
    this.oPenDesiredTab();
  }

  constructor(private patientService: PatientService,
    private cdsService: CDSService,
    private generalService: GeneralService,
    private generalOperation: GeneralOperation,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil, private ngbModal: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList
  ) {

  }

  ngOnInit() {

    if (this.patientToOpen.child_module == undefined) {
      this.loadSummary = true;
    }

    this.patientId = this.patientToOpen.patient_id;
    this.patPicURL = this.lookupList.defaultPatPic;


    //console.log(this.patient.child_module);

    //this.tab.select(this.patient.child_module);
    this.lstAppiontmentData = new Array();
    this.lstAppiontmentData.push(new ORMKeyValue('patientId', this.patientId))
    this.lstAppiontmentData.push(new ORMKeyValue('callingFrom', CallingFromEnum.PATIENT))

    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      this.downloadPath = this.lookupList.lstdocumentPath[0].download_path;
    }

    this.getPatientHeaderInfo();
    this.getPatientHeaderVitals();

    if (this.lookupList.logedInUser.userType.toUpperCase() != "BILLING"
      && this.lookupList.logedInUser.userType.toUpperCase() != "TRANSCRIPTION"
      && this.lookupList.logedInUser.userType.toUpperCase() != "CSS"
      && this.lookupList.logedInUser.userType.toUpperCase() != "BILLING_ONLY") {
      this.onCDSRunRule("NO");
    }
  }

  onCDSRunRule(refresh) {
    this.isCDSLoding = true;
    this.acNotivications = null;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "practice_id", value: this.lookupList.practiceInfo.practiceId, option: "" },
      { name: "role_id", value: this.lookupList.logedInUser.userRole, option: "" },
      { name: "user_id", value: this.lookupList.logedInUser.userId, option: "" },
      { name: "user_name", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "clientDate", value: this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY), option: "" },
      { name: "system_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
      { name: "is_refresh", value: refresh, option: "" },
    ];
    this.cdsService.RunCDSRules(searchCriteria).subscribe(
      data => {
        this.isCDSShow=true;
        debugger;
        this.acNotivications = data;
        if (this.acNotivications != undefined && this.acNotivications != null) {
          debugger;
          if (this.acNotivications.length == 0) {
            this.ruleMainHeading = "There is no Clinical Decision Support Alert/Notification.";
          }
          else if (this.acNotivications.length == 1) {
            if (this.acNotivications[0].rule_notification == "TODAY_APPOINTMENT_NOT_FOUND") {
              this.ruleMainHeading = 'Please click refresh to load Alert/Notification.';
            }
            else { 
              this.ruleMainHeading = "There is 1 Clinical Decision Support Alert/Notification.";
            }
          }
          else {
            this.ruleMainHeading = "There are " + this.acNotivications.length + " Clinical Decision Support Alert/Notification.";
          }
        }
        this.isCDSLoding = false;
      },
      error => {

      }
    );
  }
  isRuleItemShow() {

    if (this.acNotivications == null || this.acNotivications.length == 0)
      return false;


    if (this.acNotivications != null && this.acNotivications.length == 1) {
      if (this.acNotivications[0].rule_notification == "TODAY_APPOINTMENT_NOT_FOUND") {
        return false;
      }
      if (this.acNotivications[0].rule_notification == "NO_ASSIGNED_CDS_FOUND") {
        return false;
      }
      else {
        return true;
      }
    }
    else {
      return true;
    }
  }
  getPatientHeaderInfo() {
    this.patientService.getPatientHeader(this.patientId).subscribe(
      data => {
        this.onHeaderSuccessfull(data);
      },
      error => {
        this.onHeaderError(error);
      }
    );
  }

  oPenDesiredTab() {
    debugger;
    if (this.patientToOpen.child_module != undefined) {
      //console.log(this.patient.child_module);
      this.tab.select(this.patientToOpen.child_module);
    }
    //else
    //      this.loadSummary = true;
  }
  onHeaderSuccessfull(data) {

    this.openPatientInfo = new OpenedPatientInfo;
    this.PID = data["pid"];
    this.patLName = data["last_name"];
    this.patFName = data["first_name"];
    if (data["gender_code"] == 'F') {
      this.patGender = "FEMALE";
      this.openPatientInfo.patient_gender = "FEMALE";
    }
    else if (data["gender_code"] == 'M') {
      this.patGender = "MALE";
      this.openPatientInfo.patient_gender = "MALE";
    }
    else if (data["gender_code"] == 'U') {
      this.patGender = "UNKNOWN";
      this.openPatientInfo.patient_gender = "UNKNOWN";
    }
    else {
      this.patGender = "";
      this.openPatientInfo.patient_gender = "";
    }

    this.patDOB = data["dob"];
    this.patAddress = data["address"];
    this.patCity = data["city"];
    this.patState = data["state"];
    this.patZip = data["zip"];
    this.patContactNo = data["primary_contact_no"];
    this.patMaritalStatus = data["marital_status"];
    this.patAgeYear = data["age_year"];
    this.patAgeMonth = data["age_month"];
    this.patAgeDays = data["age_days"];

    //#region use in patient letter
    this.openPatientInfo.patient_id = this.patientId;
    this.openPatientInfo.calling_from = CallingFromEnum.PATIENT;
    this.openPatientInfo.patient_dob = this.patDOB;
    this.openPatientInfo.patient_age = this.patAgeYear + ' Year(s) - ' + this.patAgeMonth + " Month(s)";
    this.openPatientInfo.patient_address = this.patAddress;
    this.openPatientInfo.Patient_zip_city_state = this.patCity + ' ' + this.patState + ', ' + this.patZip;
    //#endregion use in patient letter
    this.openPatientInfo.city = this.patCity;
    this.openPatientInfo.state = this.patState;
    this.openPatientInfo.zip = this.patZip;
    this.openPatientInfo.ssn = data["ssn"];
    this.openPatientInfo.patient_dob_101 = data["dob_101"];
    this.openPatientInfo.pid = this.PID;
    debugger;
    if (data.pic == null || data.pic == undefined || data.pic == '') {
      if (data.gender_code == 'M') {
        this.patPicURL = this.lookupList.defaultPatMalePic;// "assets/images/img_male.png"        
      }
      else if (data.gender_code == 'F') {
        this.patPicURL = this.lookupList.defaultPatFemalePic;//"assets/images/img_female.png"        
      }
      else {
        this.patPicURL = this.lookupList.defaultPatPic;
      }
    }
    else {
      this.patPicURL = this.downloadPath + this.lookupList.practiceInfo.practiceId + "/" + "PatientImages/" + data.pic;
    }


    this.openPatientInfo.last_name = data["last_name"];
    this.openPatientInfo.first_name = data["first_name"];
    //this.fillLetterList();
  }
  onHeaderError(error) {
    this.logMessage.log("onHeaderError Error.");
  }
  // fillLetterList(){
  //   debugger;
  //   this.lstPatientData = new Array();
  //   this.lstPatientData.push(new ORMKeyValue('fwdPatientId', this.patientId))
  //   this.lstPatientData.push(new ORMKeyValue('fwdCallingFrom', "patient"))
  //   this.lstPatientData.push(new ORMKeyValue('fwdPatient_dob', this.patDOB))
  //   this.lstPatientData.push(new ORMKeyValue('fwdPatient_age', this.patAgeYear+' Year(s) - '+this.patAgeMonth+" Month(s)"))
  //   this.lstPatientData.push(new ORMKeyValue('fwdPatient_name', this.patLName+', '+this.patFName))
  //   this.lstPatientData.push(new ORMKeyValue('fwdPatient_address', this.patAddress))
  //   this.lstPatientData.push(new ORMKeyValue('fwdPatient_ZIP_CITY_STATE', this.patCity+' '+this.patState+', '+ this.patZip))
  // }

  getPatientHeaderVitals() {
    this.patientService.getPatientHeaderVitals(this.patientId).subscribe(
      data => {
        this.onHeaderVitalsSuccessfull(data);
      },
      error => {
        this.onHeaderVitalsError(error);
      }
    );
  }

  onHeaderVitalsSuccessfull(data) {

    if (data != undefined) {
      this.patWeight = data["weight"];
      this.patHeight = data["height"];

      this.patBMI = data["bmi"];
      this.patBP = data["bp"];
      this.patTemp = data["temprature"];
    }
  }
  onHeaderVitalsError(error) {
    this.logMessage.log("onHeaderVitalsError Error.");
  }

  onTabChange(event: NgbTabChangeEvent) {

    
    this.loadSummary=false;
    this.loadLabs=false;
    this.loadDocments=false;
    this.loadReferral=false;
    this.loadConsults=false;
    this.loadLetters=false;
    this.loadCorrespondence=false;
    this.loadAppointments=false;
    this.loadPatientPayment=false;
    this.loadInfoCapture=false;
    

    switch (event.nextId) {
      case 'tab-summary':
        if (this.loadSummary == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Summary', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadSummary = true;
        break;
      case 'tab-patient-info':
        if (this.loadInfo == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Info', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadInfo = true;
        break;
      case 'tab-encounter':
        if (this.loadEncounter == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Encounter', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadEncounter = true;
        break;
      case 'tab-claim':
        if (this.loadClaim == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Claim', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadClaim = true;
        break;
      case 'tab-results':
        if (this.loadLabs == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Lab Results', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadLabs = true;
        break;
      case 'tab-documents':
        if (this.loadDocments == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Document', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadDocments = true;
        break;
      case 'tab-referral':
        if (this.loadReferral == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Referral', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadReferral = true;
        break;
      case 'tab-consults':
        if (this.loadConsults == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Consults', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadConsults = true;
        break;
      case 'tab-letter':
        if (this.loadLetters == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Letters', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadLetters = true;
        break;
      case 'tab-correspondance':
        if (this.loadCorrespondence == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Correspondence', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadCorrespondence = true;
        break;
      case 'tab-injury':
        if (this.loadPersonalInjury == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Injury', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadPersonalInjury = true;
        break;
      case 'tab-appointment':
        if (this.loadAppointments == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Appointment', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadAppointments = true;
        break;
      case 'tab-pat-messages':
        if (this.loadMessages == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Messages', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadMessages = true;
        break;
      //case 'tab-charttest':
      //        this.loadtestChart = true;
      //break;
      case 'tab-patient-payment':
        if (this.loadPatientPayment == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Payment', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadPatientPayment = true;
        break;

      case 'tab-info-capture':
        if (this.loadInfoCapture == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Info Capture', this.patientId, ""))
            .subscribe(
              data => {
              });
        }
        this.loadInfoCapture = true;
        break;

      default:
        break;
    }
  }

  patPicErrorHandler(event) {
    event.target.src = this.lookupList.defaultPatPic;;
  }

  loadPatientHeaderInfo() {
    this.getPatientHeaderInfo();
    if (this.summaryChild != undefined) {
      this.summaryChild.getPatientScannedCards();
      this.summaryChild.getPatientInsuranceInfo();
    }
  }
  loadPatientHeaderVitals() {
    this.getPatientHeaderVitals();
  }

  isInsuranceExis(type) {

  }
  showGrowthChart = false;
  isShowGrowthChart() {
    this.showGrowthChart = true;
  }
  backFromGrowthChart() {
    this.showGrowthChart = false;
  }
  onPicClick(){
    debugger;
  const modalRef = this.ngbModal.open(CameraCapturePopupComponent, this.popupUpOptionsCamera);
  modalRef.componentInstance.isOnlyView=true;
  modalRef.componentInstance.current_url=this.patPicURL;
  modalRef.componentInstance.title="Picture View";
}
popupUpOptionsCamera: NgbModalOptions = {
  backdrop: 'static',
  keyboard: false,
  size: 'sm'
};
}

