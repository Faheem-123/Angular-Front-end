import { ORMKeyValue } from './../../../models/general/orm-key-value';
import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { lookup } from 'dns';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { LogMessage } from '../../../shared/log-message';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ORMChartReasonForVisitHPI } from './../../../models/encounter/orm-chart-reason-for-visit-hpi';
import { chartmodulehistory } from './../../../models/encounter/chartmodulehistory';
import { ChartModuleHistoryComponent } from './../../../general-modules/chart-module-history/chart-module-history.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap'
import { EncounterToOpen } from '../../../models/encounter/EncounterToOpen';
import { DateTimeUtil, DatePart, DateTimeFormat } from '../../../shared/date-time-util';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { LogParameters } from '../../log/log-parameters';
import { TemplateMainComponent } from '../chart-template/template-main/template-main.component';
import { LastNoteComponent } from '../last-note/last-note.component';

@Component({
  selector: 'reasonforvisit-hpi',
  templateUrl: './reasonforvisit-hpi.component.html',
  styleUrls: ['./reasonforvisit-hpi.component.css']
})

export class ReasonforvisitHpiComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  ChartROVHPI;
  HPI;
  ROV;
  canView: boolean = false;
  canAddEdit: boolean = false;
  noRecordFound: boolean = true;
  isLoading: boolean = false;
  isSaving: boolean = false;
  addEditView: boolean = false;
  reasonforvisit_id;
  reasonforvisitHPIForm: FormGroup;
  private obj_ChartReasonForVisit_HPI: ORMChartReasonForVisitHPI;
  private obj_charthistory: chartmodulehistory;
  lastModifiedMsg = "";


  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };



  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage) {

    this.canView = this.lookupList.UserRights.ViewReasonforVisit;
    this.canAddEdit = this.lookupList.UserRights.AddModifyReasonforVisit;

  }
  ngOnInit() 
  {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      
    if (this.lookupList.UserRights.ViewReasonforVisit) 
    {
      this.getChartReasonForVisit_HPI(this.objencounterToOpen.chart_id);
      this.buildForm();
    }
    else {
      this.isLoading = false;
    }

  }

  buildForm() {
    this.reasonforvisitHPIForm = this.formBuilder.group({
      visitreason: this.formBuilder.control(null),
      historyprovidedby: this.formBuilder.control(null),
      hpicomments: this.formBuilder.control(null)
    })
  }
  saveEditHPI() {
    this.isSaving=true;
    this.obj_ChartReasonForVisit_HPI = new ORMChartReasonForVisitHPI();
    this.obj_ChartReasonForVisit_HPI.reason_detail = (this.reasonforvisitHPIForm.get('visitreason') as FormControl).value;
    this.obj_ChartReasonForVisit_HPI.provided_by = (this.reasonforvisitHPIForm.get('historyprovidedby') as FormControl).value;
    this.obj_ChartReasonForVisit_HPI.hpi_detail = (this.reasonforvisitHPIForm.get('hpicomments') as FormControl).value;

    this.obj_ChartReasonForVisit_HPI.system_ip = this.lookupList.logedInUser.systemIp;
    this.obj_ChartReasonForVisit_HPI.patient_id = Number(this.objencounterToOpen.patient_id);
    this.obj_ChartReasonForVisit_HPI.chart_id = Number(this.objencounterToOpen.chart_id);
    this.obj_ChartReasonForVisit_HPI.deleted = false;
    this.obj_ChartReasonForVisit_HPI.practice_id = this.lookupList.practiceInfo.practiceId;
    this.obj_ChartReasonForVisit_HPI.modified_user = this.lookupList.logedInUser.user_name;
    this.obj_ChartReasonForVisit_HPI.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    if (this.reasonforvisit_id == undefined) {
      this.obj_ChartReasonForVisit_HPI.reasonforvisit_id = undefined;
      this.obj_ChartReasonForVisit_HPI.created_user = this.lookupList.logedInUser.user_name;
      this.obj_ChartReasonForVisit_HPI.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else {
      this.obj_ChartReasonForVisit_HPI.reasonforvisit_id = this.reasonforvisit_id;
      this.obj_ChartReasonForVisit_HPI.created_user = this.ChartROVHPI.created_user;
      this.obj_ChartReasonForVisit_HPI.date_created = this.ChartROVHPI.date_created;
      this.obj_ChartReasonForVisit_HPI.client_date_created = this.ChartROVHPI.client_date_created;
    }
    this.encounterService.saveupdateChartRFV_HPI(this.obj_ChartReasonForVisit_HPI)
      .subscribe(
        data => {
          this.savedSuccessfull()
        },
        error => {
          this.isSaving=false;
          alert(error)
        },
        () => this.logMessage.log("Save Patient hpi.")
      );
  }

  savedSuccessfull() {
    this.getChartReasonForVisit_HPI(this.objencounterToOpen.chart_id);
    this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
    this.addEditView = false;
   // this.isSaving=false;
  }
  cancelAddEdit() {
    this.addEditView = false;
  }

  onEdit() {
    this.addEditView = true;
    this.populateData();
  }

  //get
  getChartReasonForVisit_HPI(chartID) 
  {
    this.isLoading = true;
    this.isSaving=true;
    this.encounterService.getChartReasonForVisit_HPI(chartID)
      .subscribe(
        data => {
          debugger;
          this.ChartROVHPI = data;
          if (this.ChartROVHPI != undefined && this.ChartROVHPI != null) {
            if (this.ChartROVHPI != undefined) {
              this.reasonforvisit_id = this.ChartROVHPI.reasonforvisit_id;
              this.HPI = this.ChartROVHPI.hpi_detail;
              this.ROV = this.ChartROVHPI.reason_detail;
              this.lastModifiedMsg = this.ChartROVHPI.modified_user + " at " + this.ChartROVHPI.date_modified;
            }
            if ((this.ROV == undefined || this.ROV == "")
              && (this.HPI == undefined || this.HPI == "")
            ) {
              this.noRecordFound = true;
            }
            else {
              this.noRecordFound = false
            }
          }
          else {
            this.noRecordFound = true;
          }
          if (this.noRecordFound == true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
          this.isLoading = false;
          this.isSaving = false;
        },
        error =>{ 
          this.isLoading = false;
          this.isSaving = false;
          alert(error)
        },
        () => this.logMessage.log("getChartReasonForVisit_HPI Successfull.")
      );
  }
  //papulate value when edit.
  populateData() {
    if (this.reasonforvisit_id != undefined) {
      (this.reasonforvisitHPIForm.get('visitreason') as FormControl).setValue(this.ROV);
      (this.reasonforvisitHPIForm.get('hpicomments') as FormControl).setValue(this.HPI);
      (this.reasonforvisitHPIForm.get('historyprovidedby') as FormControl).setValue(this.ChartROVHPI.provided_by);
    }
  }


  showLogHistory() {

    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("reasonforvisit_id", this.reasonforvisit_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "reason_for_visit_log";
    logParameters.logDisplayName = "Reason for Visit/HPI Log";
    logParameters.logMainTitle = "Reason for Visit/HPI Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;

  }
  onRFVTemplateClick(){
    const modalRef = this.modalService.open(TemplateMainComponent, { size: 'lg', windowClass: 'modal-adaptive',backdrop: 'static' });
    modalRef.componentInstance.objencounterToOpen = this.objencounterToOpen;
    modalRef.componentInstance.module_txt=(this.reasonforvisitHPIForm.get('visitreason') as FormControl).value;
    modalRef.componentInstance.callingFrom='RFV';

    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        debugger;
        (this.reasonforvisitHPIForm.get('visitreason') as FormControl).setValue(result);
        //@autoSave
        this.saveEditHPI();
      }
    }
      , (reason) => {
      });
  }
  onHPITemplateClick(){
    const modalRef = this.modalService.open(TemplateMainComponent, { size: 'lg', windowClass: 'modal-adaptive',backdrop: 'static' });
    modalRef.componentInstance.objencounterToOpen = this.objencounterToOpen;
    modalRef.componentInstance.module_txt=(this.reasonforvisitHPIForm.get('hpicomments') as FormControl).value;
    modalRef.componentInstance.callingFrom='HPI';

    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        debugger;
        (this.reasonforvisitHPIForm.get('hpicomments') as FormControl).setValue(result);
         //@autoSave
         this.saveEditHPI();
      }
    }
      , (reason) => {
      });
  }
  onLastROSClick(){
    debugger; 
    const modalRef = this.modalService.open(LastNoteComponent, { size: 'lg', windowClass: 'modal-adaptive',backdrop: 'static' });
    modalRef.componentInstance.header = 'Previous HPI';
    modalRef.componentInstance.callingFrom='HPI';
    modalRef.componentInstance.patient_id=this.objencounterToOpen.patient_id;
    modalRef.componentInstance.chart_id=this.objencounterToOpen.chart_id;
    
    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        debugger;
        (this.reasonforvisitHPIForm.get('hpicomments') as FormControl).setValue(result);
      }
    }
      , (reason) => {
      });
  }

}
