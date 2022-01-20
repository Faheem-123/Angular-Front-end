import { Component, OnInit, Inject, ViewChild, EventEmitter, Output } from '@angular/core';
import { LOOKUP_LIST, LookupList } from '../providers/lookupList.module';
import { GeneralService } from '../services/general/general.service';
import { OpenModuleService } from '../services/general/openModule.service';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap/tabset/tabset';
import { LoadStartupService } from '../services/login/load-startup.service';
import { UserIdleService } from 'angular-user-idle';
import { AuthService } from '../authentication/auth-service';
import { SearchCriteria } from '../models/common/search-criteria';
import { DateTimeUtil } from '../shared/date-time-util';
import { GeneralOperation } from '../shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ResetPasswordComponent } from '../ehr-modules/setting/user-setting/reset-password/reset-password.component';
import { timer } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationCredentials } from '../authentication/authenticationCredentials';
import { Md5 } from 'ts-md5';
import { ConfirmationPopupComponent } from '../general-modules/confirmation-popup/confirmation-popup.component';
import { AlertTypeEnum, PromptResponseEnum, MainTabsEnum,FaxServerEnum } from '../shared/enum-util';
import { AboutUsComponent } from '../general-modules/about-us/about-us.component';
import { ListFilterPipe } from '../shared/list-filter-pipe';
import { PatientToOpen } from '../models/common/patientToOpen';
import { InlinePatientSearchComponent } from '../general-modules/inline-patient-search/inline-patient-search.component';
import { MessagesMainComponent } from '../ehr-modules/messages/messages-main/messages-main.component';


@Component({
  selector: 'nav-main',
  templateUrl: './nav-main.component.html',
  styleUrls: ['./nav-main.component.css']
})
export class NavMainComponent implements OnInit {
  @Output() practiceSwitch = new EventEmitter<any>();

  @ViewChild('inlinePatientSearchComponent') inlinePatientSearchComponent: InlinePatientSearchComponent;

  loadScheduler: boolean = false;
  loadSettings: boolean = false;
  loadUserSettings: boolean = false;

  loadPatientSearch: boolean = false;
  loadMessages: boolean = false;
  loadLab: boolean = false;
  loadLetter: boolean = false;
  loadReports: boolean = false;
  loadFax: boolean = false;
  loadBilling: boolean = false;
  loadLog: boolean = false;
  loadUserAdmin: boolean = false;
  curFeature = 1;
  totalNum = 7;

  source = timer(8000, 8000);
  subscribe = this.source.subscribe(val => this.curFeature == this.totalNum ? this.curFeature = 1 : this.curFeature++);

  lockForm: FormGroup;
  loginStatusMessage = "Verifying Login Information. Please wait....";
  loginStatus: string = "";
  @ViewChild('appTabSet') appTabSet;

  @ViewChild('messagesMain') messagesMain:MessagesMainComponent;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, private formBuilder: FormBuilder,
    private authService: AuthService, private generalService: GeneralService, private generalOperation: GeneralOperation, private openModuleService: OpenModuleService
    , private userIdle: UserIdleService, private dateTimeUtil: DateTimeUtil, private loadStartup: LoadStartupService,
    private ngbModal: NgbModal) {
    debugger;
    this.openModuleService.navigateToTab.subscribe(value => {

      debugger;
      // to reload messages if navigate from somewhere else and Messages module is already loaded.
      if (value == MainTabsEnum.MESSAGES && this.loadMessages==true) {
        //this.loadMessages = false;
        this.messagesMain.getMessageCount(true);
      }
      this.appTabSet.select(value);
      //console.log(value);

    });

  }

  messageCountTimer: number = 1000 * 60 * 1;// 5 MIN
  messageTimer: NodeJS.Timer;

  startMessageCounterTimer() {
    this.messageTimer = setInterval(() => {

      if (this.lookupList.isEhrLocked) {
        clearInterval(this.messageTimer);
      }
      if (this.authService.jwt_token_creation_time != undefined 
        && this.authService.chkIsTokenExpire(new Date()) == true) {
        this.generalOperation.getUnReadMessagesCount();
       }
//      this.generalOperation.getUnReadMessagesCount();
    }, this.messageCountTimer)
  }

  ngOnInit() {
    debugger;
    this.getIdleTimerTokenPing();
    this.buildForm();

    this.startMessageCounterTimer();

    debugger;
    let lstAppSetting: Array<any> = new ListFilterPipe().transform(this.lookupList.appSettings, "description", "FaxServer");
    if (lstAppSetting != undefined && lstAppSetting.length > 0) {
      switch (lstAppSetting[0].options) {
        case FaxServerEnum.FAXAGE:
          this.lookupList.faxServer = FaxServerEnum.FAXAGE;
          break;
        case FaxServerEnum.MFAX:
          this.lookupList.faxServer= FaxServerEnum.MFAX;
          break;
        default:
          break;
      }
    }
  }
  buildForm() {
    this.lockForm = this.formBuilder.group({
      txtuser: this.formBuilder.control(this.lookupList.logedInUser.user_name, Validators.required),
      txtpassword: this.formBuilder.control('', Validators.required)
    })
  }

  getIdleTimerTokenPing() {
    debugger;
    let idleTimeOut = 10000;
    let lstAppSetting: Array<any> = new ListFilterPipe().transform(this.lookupList.appSettings, "description", "AppLockTime");
    if (lstAppSetting != undefined && lstAppSetting.length > 0) {
      idleTimeOut = lstAppSetting[0].options;
    }
    if (idleTimeOut < 100)
      idleTimeOut = 1000;

    this.userIdle.setConfigValues({ idle: idleTimeOut, timeout: 1000, ping: this.authService.jwt_token_expiry })
    this.userIdle.startWatching();
    this.userIdle.ping$.subscribe(() => {
      //console.log("get Token PING")
      if (this.authService.jwt_token_creation_time != undefined) {
        if (this.authService.chkIsTokenExpire(new Date()) == false) {
          this.authService.generateToken();
        }
      }
    });
    this.userIdle.onTimerStart().subscribe(count => {
      window.location.reload();
    }
    );

    // Start watch when time is up.
    // this.userIdle.onTimeout().subscribe(() => 
    //console.log('Time is up!')
    // );
  }
  activeIdString;


  selectTab(event) {
    debugger;
    this.appTabSet.select('apptab_patient');
  }
  openPatient(patient) {
    debugger;
    //this.apptab_patient
    //this.tabParams.id = id;
    this.appTabSet.select('apptab_patient');
  }

  onTabChange(event: NgbTabChangeEvent) {
    switch (event.nextId) {
      case 'scheduelr-tab-main':
        if (this.loadScheduler == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Scheduler', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadScheduler = true;
        break;
      case 'admin-tab-main':
        if (this.loadSettings == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Setting', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadSettings = true;
        break;
      case 'user-admin-tab-main':
        if (this.loadUserSettings == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'User Setting', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadUserSettings = true;
        break;
      case 'patient-tab-main':
        if (this.loadPatientSearch == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Patient Search', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadPatientSearch = true;
        break;
      case 'messages-tab-main':
        debugger;
        if (this.loadMessages == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Messages', "", ""))
            .subscribe(
              data => {
              });
        }
        else{
          this.messagesMain.getMessageCount(true);
        }
        this.loadMessages = true;
        break;
      case 'labs-tab-main':
        if (this.loadLab == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Lab', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadLab = true;
        break;
      case 'letters-tab-main':
        if (this.loadLetter == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Letters', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadLetter = true;
        break;
      case 'reports-tab-main':
        if (this.loadReports == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Reports', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadReports = true;
        break;
      case 'fax-tab-main':
        if (this.loadFax == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Fax', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadFax = true;
        break;
      case 'billing-tab-main':
        if (this.loadBilling == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'Billing', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadBilling = true;
        break;
      case 'log-tab-main':
        if (this.loadLog == false) {
          this.generalService.auditLog(
            this.generalOperation.moduleAccessLog("Access", 'EHR Log', "", ""))
            .subscribe(
              data => {
              });
        }
        this.loadLog = true;
        break;
      default:
        break;
    }
  }
  onLogout() {
    this.createLogoutUserLog();
  }
  createLogoutUserLog() {
    debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "loginId", value: this.lookupList.logedInUser.loginLog_id, option: "" },
      { name: "clientDate", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" }
    ];

    this.generalService.logoutUserLog(searchCriteria).subscribe(
      data => {
        location.reload()
      });
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  onResetPassword() {

    const modalRef = this.ngbModal.open(ResetPasswordComponent, { size: 'sm', windowClass: 'modal-adaptive' });
    let closeResult;

    modalRef.result.then((result) => {
      if (result) {
      }
    }
      , (reason) => {
      });
  }
  onLock() {
    this.lookupList.isEhrLocked = true;
    this.loginStatusMessage = "";
  }
  onUnlock(formdata) {
    debugger;
    this.generateToken(formdata);
  }

  public generateToken(formData) {
    let auth: AuthenticationCredentials = new AuthenticationCredentials;
    auth.app = "EHR";
    if (this.lookupList.isEhrLocked == true) {
      auth.username = formData.txtuser;
      auth.password = Md5.hashStr(formData.txtpassword).toString();
    }
    else {
      auth.username = this.lookupList.logedInUser.user_name;
      auth.password = this.lookupList.logedInUser.password;
    }
    this.authService.getAuthenticationToken(auth).subscribe(
      data => {//setToken
        debugger;
        let parseToken = this.authService.decodeToken(data['token']);
        this.authService.userId = Number(parseToken.user_id);
        this.authService.setToken(data['token'])
        this.authService.jwt_token_expiry = parseToken.exp - parseToken.iat;
        this.authService.jwt_token_creation_time = this.dateTimeUtil.getCurrentDateTimeDate();
        //this.startTokenTick(this.token.jwt_token_expiry);        
        this.loginStatusMessage = "Loading EHR Data, Please wait....";
        this.loginStatus = "login_Success";

        this.lookupList.isEhrLocked = false;
      }, error => {
        if (error.status == 401) {
          this.lockForm.get("txtuser").enable()
          this.lockForm.get("txtpassword").enable();

          this.loginStatus = "login_failed";
          this.loginStatusMessage = "User Name and/or Password is Invalid.";
          //Login Log
          // this.createLoginUserLog( this.lockForm.get("txtuser").value,"",false);
        }
      }
    );
  }
  onOverRideSecurity() {
    //
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Override !';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to Override Security Rights ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        this.lookupList.loginWithOverrideRigts = true;
        this.lookupList.isEhrDataLoad = false;
      }
    }, (reason) => {
    });
  }
  openAboutUS() {
    const modalRef = this.ngbModal.open(AboutUsComponent, { windowClass: 'modal-adaptive' });
    let closeResult;

    modalRef.result.then((result) => {
      if (result) {
      }
    }
      , (reason) => {
      });
  }
  onPracticeSelection(p) {
    debugger;
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Practice Switch!';
    modalRef.componentInstance.promptMessage = "Are you sure you want to Switch to <br><b>(" + p.col2 + ")</b> ?";
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;
    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {
        this.createLogoutUserLog();
        this.practiceSwitch.emit(p.col1);
      }
    });
  }
  showPatientSearch = false;
  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onClosePatientSearch() {
    this.showPatientSearch = false;
  }

  onPatientSearchEnter() {
    this.showPatientSearch = true;
  }


  shiftFocusToPatSearch() {
    debugger;
    this.inlinePatientSearchComponent.focusFirstIndex();
  }


  onPatientSearchInputChange() {
    // if (newValue !== this.patientName) {
    //   this.patientId = undefined;
    //   this.encounterReportForm.get("txtPatientIdHidden").setValue(null);
    // }

    if ((document.getElementById('txtPatientSearchMain') as HTMLInputElement).value == "")
      this.showPatientSearch = false;
  }
  onPatientSearchBlur() {
    // if (this.patientId == undefined && this.showPatientSearch == false) 
    // {
    //   this.patientName = undefined;
    //   this.encounterReportForm.get("txtPatientSearch").setValue(null);
    //   this.encounterReportForm.get("txtPatientIdHidden").setValue(null);
    // }
    //this.patientId=undefined;
  }
  openSelectPatient(patObject) {
    debugger;
    //this.patientId = patObject.patient_id;
    //this.patientName = patObject.name;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patObject.patient_id;
    obj.patient_name = patObject.name;
    this.openModuleService.openPatient.emit(obj);

    this.showPatientSearch = false;
    //
    (document.getElementById('txtPatientSearchMain') as HTMLInputElement).value = "";

  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
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

    (document.getElementById(controlName) as HTMLInputElement).value = pastedText.trim();

  }

  onMessages() {
    this.openModuleService.navigateToTab.emit(MainTabsEnum.MESSAGES)
  }


}
