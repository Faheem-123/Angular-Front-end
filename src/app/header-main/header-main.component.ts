import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UserIdleService } from 'angular-user-idle';
import { AuthService } from '../authentication/auth-service';
import { AboutUsComponent } from '../general-modules/about-us/about-us.component';
import { ConfirmationPopupComponent } from '../general-modules/confirmation-popup/confirmation-popup.component';
import { InlinePatientSearchComponent } from '../general-modules/inline-patient-search/inline-patient-search.component';
import { PatientToOpen } from '../models/common/patientToOpen';
import { SearchCriteria } from '../models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from '../providers/lookupList.module';
import { GeneralService } from '../services/general/general.service';
import { OpenModuleService } from '../services/general/openModule.service';
import { LoadStartupService } from '../services/login/load-startup.service';
import { DateTimeUtil } from '../shared/date-time-util';
import { AlertTypeEnum, MainTabsEnum, PromptResponseEnum } from '../shared/enum-util';
import { GeneralOperation } from '../shared/generalOperation';

@Component({
  selector: 'header-main',
  templateUrl: './header-main.component.html',
  styleUrls: ['./header-main.component.css']
})
export class HeaderMainComponent implements OnInit {

  @Output() practiceSwitch = new EventEmitter<any>();
  
  @ViewChild('inlinePatientSearchComponent') inlinePatientSearchComponent: InlinePatientSearchComponent;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, private generalService: GeneralService, 
  private openModuleService: OpenModuleService,
  private dateTimeUtil: DateTimeUtil,
  private ngbModal: NgbModal) { }

  ngOnInit() {
  }

  onPaste(event: ClipboardEvent, controlName: string) {
    debugger;
    event.preventDefault();

    var pastedText = '';

    if (event.clipboardData && event.clipboardData.getData) {
      pastedText = event.clipboardData.getData('text/plain');
    }

    (document.getElementById(controlName) as HTMLInputElement).value = pastedText.trim();
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

    this.inlinePatientSearchComponent.focusFirstIndex();
  }


  onPatientSearchInputChange() {


    if ((document.getElementById('txtPatientSearchMain') as HTMLInputElement).value == "")
      this.showPatientSearch = false;
  }
  onPatientSearchBlur() {

  }
  openSelectPatient(patObject) {
    debugger;

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

  onMessages() {
    this.openModuleService.navigateToTab.emit(MainTabsEnum.MESSAGES)
  }

  onLock() {
    this.lookupList.isEhrLocked = true;
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

  onLogout() {
    this.createLogoutUserLog();
  }
}
