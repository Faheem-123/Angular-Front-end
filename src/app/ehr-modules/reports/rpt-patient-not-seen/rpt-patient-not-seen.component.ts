import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { excelService } from 'src/app/shared/excelService';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ReportsService } from 'src/app/services/reports.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';

@Component({
  selector: 'rpt-patient-not-seen',
  templateUrl: './rpt-patient-not-seen.component.html',
  styleUrls: ['./rpt-patient-not-seen.component.css']
})
export class RptPatientNotSeenComponent implements OnInit {
  isLoading: boolean = false;
  patientNotSeenReportForm: FormGroup;
  lstPatientNotSeen;
  recordCount = "0";
  showPatientSearch: boolean = false;
  patientName: string;
  patientId: number;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage, private formBuilder: FormBuilder, private openModuleService: OpenModuleService,
    private dateTimeUtil: DateTimeUtil, private excel: excelService, private modalService: NgbModal,
    private reportsService: ReportsService) { }

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    this.patientNotSeenReportForm = this.formBuilder.group({
      // dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
      //   Validators.required,
      //   datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      // ])),
      // dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
      //   Validators.required,
      //   datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      // ])),
      cmbMonthsdaywise: this.formBuilder.control(null),
      cmbLocation: this.formBuilder.control(null),
      //cmbProvider: this.formBuilder.control(null),
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null)
    })
  }
  searchPatientNotSeenDetail(formData) {
    debugger;

    if ((this.patientNotSeenReportForm.get('cmbMonthsdaywise') as FormControl).value <= 0) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Month Selection', "Pleae select Month.", AlertTypeEnum.WARNING);
      return;
    }

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];

    searchCriteria.param_list.push({ name: "app_date", value: ((this.patientNotSeenReportForm.get('cmbMonthsdaywise') as FormControl).value * 30), option: "" });
    searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });

    //if ((this.patientNotSeenReportForm.get('cmbProvider') as FormControl).value != null && (this.patientNotSeenReportForm.get('cmbProvider') as FormControl).value != "null")
    //  searchCriteria.param_list.push({ name: "cmbProvider", value: (this.patientNotSeenReportForm.get('cmbProvider') as FormControl).value, option: "" });
    if ((this.patientNotSeenReportForm.get('cmbLocation') as FormControl).value != null && (this.patientNotSeenReportForm.get('cmbLocation') as FormControl).value != "") {
      searchCriteria.param_list.push({ name: "location_id", value: (this.patientNotSeenReportForm.get('cmbLocation') as FormControl).value, option: "" });
    }


    debugger;

    this.isLoading = true;

    this.reportsService.getPatientNotSeen(searchCriteria).subscribe(
      data => {
        this.isLoading = false;
        this.lstPatientNotSeen = data;
        this.recordCount = this.lstPatientNotSeen.length;
      },
      error => {
        this.isLoading = false;
        return;
      }
    );
  }
  selectedRow = 0;
  onSelectionChange(index) {
    this.selectedRow = index;
  }
  exportAsXLSX() {
    this.excel.exportAsExcelFile(this.lstPatientNotSeen, 'pid,pat_name,provider,location,last_app_date,next_app,not_seen_days', 'RPT_Patient_Not_Seen');
  }

  //#region searchpat

  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else if (event.key == "Backspace") {
      this.showPatientSearch = false;
      this.patientId = null;
      this.patientName = null;
      (this.patientNotSeenReportForm.get('txtPatientIdHidden') as FormControl).setValue(null);
      (this.patientNotSeenReportForm.get('txtPatientSearch') as FormControl).setValue(null);
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {


      this.patientId = undefined;
      this.patientNotSeenReportForm.get("txtPatientIdHidden").setValue(null);
    }


    //this.patientName=undefined;
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.patientNotSeenReportForm.get("txtPatientSearch").setValue(null);
      this.patientNotSeenReportForm.get("txtPatientIdHidden").setValue(null);
    }
    //this.patientId=undefined;
  }
  openSelectPatient(patObject) {
    debugger;
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

    (this.patientNotSeenReportForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    (this.patientNotSeenReportForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);

    this.showPatientSearch = false;

  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  //#endregion searchpat

  openPatient(patient) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.pat_name;
    this.openModuleService.openPatient.emit(obj);
  }
}