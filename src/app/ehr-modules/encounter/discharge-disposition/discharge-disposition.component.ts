import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { AlertTypeEnum, ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMPatientDischargeDisposition } from 'src/app/models/encounter/orm-patient-discharge-disposition';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { DateModel } from 'src/app/models/general/date-model';
import { TimeModel } from 'src/app/models/general/time-model';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';

@Component({
  selector: 'discharge-disposition',
  templateUrl: './discharge-disposition.component.html',
  styleUrls: ['./discharge-disposition.component.css']
})
export class DischargeDispositionComponent implements OnInit {

  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  dischargeFormGroup: FormGroup;

  addEditView: boolean = false;

  canView: boolean = false;
  canAddEdit: boolean = false;
  noRecordFound = true;
  lastModifiedMsg: string;

  isLoading: boolean = false;
  formBuildDone: boolean = false;

  chartDischargeDispostionSummary: any;
  chartDischargeDispostionDetail: any;

  loadingCount: number = 0;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(@Inject(LOOKUP_LIST) private lookupList: LookupList,
    private encounterService: EncounterService,
    private formBuilder: FormBuilder,
    private ngbModal: NgbModal,
    private generalService: GeneralService,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage) {
    this.canView=this.lookupList.UserRights.ViewDischargeDisposition;
    this.canAddEdit=this.lookupList.UserRights.AddModifyDischargeDisposition;  
     }

  ngOnInit() {
    if (this.canView) {
      this.getDischargeDispositionSummary();
    }
  }

  buildForm() {
    if (!this.formBuildDone) {
      this.dischargeFormGroup = this.formBuilder.group({

        dpDischargeDate: this.formBuilder.control(null, Validators.compose([
          Validators.required,
          datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
        ])),
        tpDischageTime: this.formBuilder.control(null),
        ddDischargeDispostion: this.formBuilder.control(null, Validators.required),
        txtOtherSexualOrientation: this.formBuilder.control(null),
        txtComments: this.formBuilder.control(null)
      }
      );

      this.formBuildDone = true;
    }
  }

  getDischargeDispositionSummary() {
    this.encounterService.getDischargeDispositionSummary(Number(this.objencounterToOpen.chart_id))
      .subscribe(
        data => {
          this.chartDischargeDispostionSummary = data;
          if (this.chartDischargeDispostionSummary == undefined) {
            this.noRecordFound = true;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            debugger;
            this.noRecordFound = false;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));

            this.lastModifiedMsg = this.chartDischargeDispostionSummary.modified_user + " at " + this.chartDischargeDispostionSummary.date_modified;


          }
          this.isLoading = false;
        },
        error => {
          this.getDischargeDispositionSummaryError(error);
          this.isLoading = false;
        }
      );
  }

  getDischargeDispositionSummaryError(error) {
    this.logMessage.log("getDischargeDispositionSummary Error." + error);
  }

  getDischargeDispositionDetailById(dischargeId: number) {

    this.encounterService.getDischargeDispositionDetailById(dischargeId)
      .subscribe(
        data => {
          debugger;

          this.chartDischargeDispostionDetail = data;
          this.loadingCount--;
          if (this.loadingCount == 0) {
            this.assignEditValues();
          }
        },
        error => {
          this.getDischargeDispositionSummaryError(error);
        }
      );
  }

  getDischargeDispositionDetailByIdError(error) {
    this.logMessage.log("getDischargeDispositionDetailById Error." + error);
  }

  getDischargeDispositionList() {
    this.generalService.getDischargeDispositionList().subscribe(
      data => {
        this.lookupList.lstDischargeDisposition = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.assignEditValues();
        }
      },
      error => {
        this.getDischargeDispositionListError(error);
      }
    );
  }
  getDischargeDispositionListError(error) {
    this.logMessage.log("getDischargeDispositionList Error." + error);
  }

  assignEditValues() {

    debugger;
    this.buildForm();
    this.clearAllFeilds();
    this.addEditView = true;


    if (!this.formBuildDone) {
      this.dischargeFormGroup = this.formBuilder.group({

        dpDischargeDate: this.formBuilder.control(null, Validators.compose([
          Validators.required,
          datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
        ])),
        tpDischageTime: this.formBuilder.control(null),
        ddDischargeDispostion: this.formBuilder.control(null, Validators.required),
        txtComments: this.formBuilder.control(null)
      }
      );
    }
    (this.dischargeFormGroup.get("dpDischargeDate") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
    (this.dischargeFormGroup.get("tpDischageTime") as FormControl).setValue("");
    
    if (this.chartDischargeDispostionDetail != undefined) {

      let dischargeDateModel: DateModel = this.dateTimeUtil.getDateModelFromDateString(this.chartDischargeDispostionDetail.discharge_date, DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
      let dischargeTimeModel: TimeModel = this.dateTimeUtil.getTimeModelFromTimeString(this.chartDischargeDispostionDetail.discharge_date, DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);

      (this.dischargeFormGroup.get('dpDischargeDate') as FormControl).setValue(dischargeDateModel);
      (this.dischargeFormGroup.get('tpDischageTime') as FormControl).setValue(dischargeTimeModel);

      (this.dischargeFormGroup.get('ddDischargeDispostion') as FormControl).setValue(this.chartDischargeDispostionDetail.discharge_code);
      (this.dischargeFormGroup.get('txtComments') as FormControl).setValue(this.chartDischargeDispostionDetail.comments);
    }
  }

  clearAllFeilds() {
    (this.dischargeFormGroup.get('dpDischargeDate') as FormControl).setValue(null);
    (this.dischargeFormGroup.get('tpDischageTime') as FormControl).setValue(null);
    (this.dischargeFormGroup.get('ddDischargeDispostion') as FormControl).setValue(null);
    (this.dischargeFormGroup.get('txtComments') as FormControl).setValue(null);
  }

  onAddEdit() {

    debugger;
    this.chartDischargeDispostionDetail = undefined;
    this.loadingCount = 0;

    if (this.lookupList.lstDischargeDisposition == undefined || this.lookupList.lstDischargeDisposition.length == 0) {
      this.loadingCount++;
      this.getDischargeDispositionList();
    }

    if (this.chartDischargeDispostionSummary != undefined) {
      this.loadingCount++;
      this.getDischargeDispositionDetailById(this.chartDischargeDispostionSummary.discharge_id);
    }



    if (this.loadingCount == 0) {
      this.assignEditValues();
    }
  }
  cancelAddEdit() {
    this.addEditView = false;
  }


  ValidateData(formData: any): boolean {

    debugger;

    let strAlertMsg: string = "";

    if (formData.dpDischargeDate == "" || formData.dpDischargeDate == undefined) {
      strAlertMsg = "Please enter Discharge Date.";
    }
    else if (formData.ddDischargeDispostion == "" || formData.ddDischargeDispostion == undefined) {
      strAlertMsg = "Please select Discharge Disposition.";
    }

    if (strAlertMsg != "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Discharge Disposition', strAlertMsg, AlertTypeEnum.DANGER)
      return false;
    }
    else {
      return true;
    }
  }

  saveDischargeDisposition(formData: any) {

    if (this.ValidateData(formData)) {

      debugger;

      let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

      let ormPatientDischargeDisposition: ORMPatientDischargeDisposition = new ORMPatientDischargeDisposition();

      ormPatientDischargeDisposition.system_ip = this.lookupList.logedInUser.systemIp;
      ormPatientDischargeDisposition.patient_id = Number(this.objencounterToOpen.patient_id);
      ormPatientDischargeDisposition.chart_id = Number(this.objencounterToOpen.chart_id);
      ormPatientDischargeDisposition.practice_id = this.lookupList.practiceInfo.practiceId;

      ormPatientDischargeDisposition.modified_user = this.lookupList.logedInUser.user_name;
      ormPatientDischargeDisposition.client_date_modified = clientDateTime;

      if (this.chartDischargeDispostionDetail == null) {
        ormPatientDischargeDisposition.created_user = this.lookupList.logedInUser.user_name;
        ormPatientDischargeDisposition.client_date_created = clientDateTime;
      } else {
        ormPatientDischargeDisposition.discharge_id = this.chartDischargeDispostionDetail.discharge_id;//this.listSocialHistory.socialhistory_id;
        ormPatientDischargeDisposition.created_user = this.chartDischargeDispostionDetail.created_user;
        ormPatientDischargeDisposition.date_created = this.chartDischargeDispostionDetail.date_created;
        ormPatientDischargeDisposition.client_date_created = this.chartDischargeDispostionDetail.client_date_created;
      }

      let dischargeDate: string = this.dateTimeUtil.getStringDateFromDateModel(formData.dpDischargeDate);
      let dischargeTime: string = this.dateTimeUtil.getStringTimeFromTimeModel(formData.tpDischageTime);

      ormPatientDischargeDisposition.discharge_date = dischargeDate + " " + dischargeTime;
      if (formData.ddDischargeDispostion != undefined && formData.ddDischargeDispostion != "") {
        ormPatientDischargeDisposition.discharge_code = formData.ddDischargeDispostion;

        let selectedSite = new ListFilterPipe().transform(this.lookupList.lstDischargeDisposition, "code", formData.ddDischargeDispostion);
        ormPatientDischargeDisposition.discharge_description = selectedSite[0].description;
      }
      ormPatientDischargeDisposition.comments = formData.txtComments;

      this.encounterService.saveDischargeDisposition(ormPatientDischargeDisposition).subscribe(
        data => {
          this.saveDischargeDispositionSuccess(data);
        },
        error => {
          this.saveDischargeDispositionError(error);
        }
      );
    }
  }

  saveDischargeDispositionSuccess(data) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.getDischargeDispositionSummary();
      this.addEditView = false;
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Discharge Disposition', data.response, AlertTypeEnum.DANGER)
    }
  }
  saveDischargeDispositionError(error) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Discharge Disposition', "An Error Occured while Discharge Disposition.", AlertTypeEnum.DANGER)
  }

  deleteDischargeDisposition() {

    if (this.chartDischargeDispostionSummary != undefined) {
      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
      modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;

      modalRef.result.then((result) => {

        if (result == PromptResponseEnum.YES) {

          let deleteRecordData = new ORMDeleteRecord();
          deleteRecordData.column_id = this.chartDischargeDispostionSummary.discharge_id.toString();
          deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
          deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
          deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

          this.encounterService.deleteDischargeDisposition(deleteRecordData)
            .subscribe(
              data => this.onDeleteSuccessfully(data),
              error => alert(error),
              () => this.logMessage.log("Discharge Disposition has benn deleted Successfull.")
            );
        }
      }, (reason) => {
        //alert(reason);
      });
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Discharge Disposition', "There is no record to delete.", AlertTypeEnum.INFO)
    }

  }
  onDeleteSuccessfully(data: any) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Discharge Disposition', data.response, AlertTypeEnum.DANGER)
      this.chartDischargeDispostionSummary = undefined;
      this.chartDischargeDispostionDetail = undefined;
    }
    else {
      this.getDischargeDispositionSummary();
    }
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  viewLog() {
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));
    
    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "discharge_disposition_log";
    logParameters.logDisplayName = "Discharge Disposition";
    logParameters.logMainTitle = "Discharge Disposition";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;

    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.ngbModal.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }
}