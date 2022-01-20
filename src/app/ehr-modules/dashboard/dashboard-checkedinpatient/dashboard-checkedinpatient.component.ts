import { PatientToOpen } from './../../../models/common/patientToOpen';
import { GeneralService } from './../../../services/general/general.service';
import { debug } from 'util';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { LogMessage } from './../../../shared/log-message';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { LookupList } from '../../../providers/lookupList.module';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Inject, Output, EventEmitter, ViewChild } from '@angular/core';
import { OpenModuleService } from '../../../services/general/openModule.service';
import { PatientSubTabsEnum, ServiceResponseStatusEnum } from '../../../shared/enum-util';
import { AppointmentOperationData } from '../../scheduler/appointment-operation-data';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CheckInOutPopupComponent } from '../../scheduler/check-in-out-popup/check-in-out-popup.component';
@Component({
  selector: 'dashboard-checkedinpatient',
  templateUrl: './dashboard-checkedinpatient.component.html',
  styleUrls: ['./dashboard-checkedinpatient.component.css']
})

export class DashboardCheckedinpatientComponent implements OnInit {
  @Output() widgetUpdate = new EventEmitter<any>();
  lstPatient;
  checkincount;
  showHideSearch = true;
  isLoading: boolean = false;
  constructor(private formBuilder: FormBuilder,
    private dashboardService: DashboardService,
    private openModuleService: OpenModuleService,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }
  filterForm: FormGroup;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  buildForm() {
    this.filterForm = this.formBuilder.group({
      ctrlproviderSearch: this.formBuilder.control("all", Validators.required),
      ctrllocationSearch: this.formBuilder.control("all", Validators.required)
    })

  }
  onFilter(criteria) {
    this.showHideSearch = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.criteria = '';
    if (criteria.ctrlproviderSearch != 'all') {
      searchCriteria.criteria = ' and a.provider_id=' + criteria.ctrlproviderSearch;
    }
    if (criteria.ctrllocationSearch != 'all') {
      searchCriteria.criteria += ' and a.location_id =' + criteria.ctrllocationSearch;
    }

    searchCriteria.option = '';
    this.isLoading = true;
    this.dashboardService.getCheckInPatient(searchCriteria).subscribe(
      data => {
        //this.total = data['length'];
        this.lstPatient = data;
        this.checkincount = this.lstPatient.length;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getCheckInPatientError(error);
      }
    );
  }
  ngOnInit() {

    this.buildForm();



    this.getCheckInPatient();
  }
  getCheckInPatient() {
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.criteria = '';
    searchCriteria.option = '';
    this.dashboardService.getCheckInPatient(searchCriteria).subscribe(
      data => {
        //this.total = data['length'];
        this.lstPatient = data;
        this.checkincount = this.lstPatient.length;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getCheckInPatientError(error);
      }
    );
  }
  getCheckInPatientError(error) {
    this.logMessage.log("LoadEmpAttendance Successfull.");
  }

  openPatient(patient) {

    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }

  openPatientEncounter(patient) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    obj.child_module = PatientSubTabsEnum.ENCOUNTER;// "tab-encounter";
    this.openModuleService.openPatient.emit(obj);
  }
  onRefresh(criteria) {
    this.widgetUpdate.emit('checkedin');
    this.onFilter(criteria)
  }
  showCheckInCheckOutPopUp(value) {
    debugger;
    let appData: AppointmentOperationData = new AppointmentOperationData;
    appData.patientId = value.patient_id
    appData.patientName = value.patient_name;
    appData.dob = value.dob;
    appData.appointmentId = value.appointment_id;
    const modalRef = this.ngbModal.open(CheckInOutPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.appOperationData = appData;
    let closeResult;
    modalRef.result.then((result) => {
      if (result === ServiceResponseStatusEnum.SUCCESS) {
        this.getCheckInPatient();
      }
    }
      , (reason) => {

      });

  }
  showHidetoggle(){
    this.showHideSearch = false;
  }
}
