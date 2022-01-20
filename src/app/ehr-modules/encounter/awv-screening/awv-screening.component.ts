import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { PatientHtmlFormsViewerComponent } from 'src/app/general-modules/patient-html-forms-viewer/patient-html-forms-viewer.component';
import { PromptResponseEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';

@Component({
  selector: 'awv-screening',
  templateUrl: './awv-screening.component.html',
  styleUrls: ['./awv-screening.component.css']
})
export class AwvScreeningComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  canView=false;
  canAddEdit=false;
  isLoading: boolean = false;
  //noRecordFound: boolean = false;
  lstExamView;
  lstHCForms;

  constructor(private encounterService: EncounterService,
    private generalOperation: GeneralOperation
    , private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { 
      this.canView = this.lookupList.UserRights.ViewAnnualWellness;
      this.canAddEdit = this.lookupList.UserRights.AddModifyAnnualWellness;
    }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      
    if(this.canView){
      this.getViewData();
      this.getHealthCheckFormsList();
    }
  }
  getViewData() {
    this.isLoading = true;
    //this.noRecordFound = false;
    let searchcrit: SearchCriteria = new SearchCriteria();
        searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
        searchcrit.param_list = [
          { name: "patient_id", value: this.objencounterToOpen.patient_id, option: "" },
          { name: "form_type", value: 'Annual Wellness Visit',option: "" }
        ];

    this.encounterService.getPatientHealthCheckSummary(searchcrit)
      .subscribe(
        data => {
          this.lstExamView = data;
          if (this.lstExamView == undefined || this.lstExamView.length == 0) {
            //this.noRecordFound = true;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else{
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
          this.isLoading = false;

          
        },
        error => {
          this.logMessage.log("An Error Occured while getting AWV Screening list.")
          this.isLoading = false;
        }
      );
  }
  getHealthCheckFormsList(){
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "form_type", value: 'Annual Wellness Visit',option: "" }
    ];
  this.encounterService.getHealthCheckFormsList(searchcrit).subscribe(
  data => {
    //debugger;
    this.lstHCForms = data;
  },
  error => {
    this.logMessage.log("getHealthCheckFormsList "+error);
  }
);
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  onAddNew()
  {
    const modalRef = this.modalService.open(PatientHtmlFormsViewerComponent,{ size: 'lg', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.chartId=this.objencounterToOpen.chart_id; 
    modalRef.componentInstance.patientId=this.objencounterToOpen.patient_id;
    modalRef.componentInstance.provider_name= this.objencounterToOpen.provider_name
    modalRef.componentInstance.form_id=this.lstHCForms[0].form_id;
    modalRef.componentInstance.modalTitle='Annual Wellness Visit';
    modalRef.componentInstance.operation='new';
    modalRef.componentInstance.chart_provider_id=this.objencounterToOpen.provider_id;

    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES)
      {
        this.getViewData();
      }
    }, 
    (reason) => {
    //alert(reason);
        });
  }
  onDelete(form){
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Confirm Deletion !"
    modalRef.componentInstance.promptMessage = "Are you sure you want to delete selected record ?";
    modalRef.componentInstance.alertType = "danger";
    let closeResult;

    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.YES) {
        let objormdelete: ORMDeleteRecord = new ORMDeleteRecord();
        objormdelete.modified_user = this.lookupList.logedInUser.user_name;
        objormdelete.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        objormdelete.client_ip = this.lookupList.logedInUser.systemIp;
        objormdelete.column_id = form.health_check_id;
        this.encounterService.DeletePatientHealthCheck(objormdelete).subscribe(
          data => {
            this.onDeleteSuccessfully(data, form);
          },
          error => {
            this.logMessage.log(error);
          }
        );
      }
    }
      , (reason) => {
      });
  }
  onDeleteSuccessfully(data,form){
    if (data > 0) {
      var index = this.generalOperation.getElementIndex(this.lstExamView, form);
      if (index > -1) {
        this.lstExamView.splice(index, 1);
      }
      
      //if(this.lstExamView.length==0)
      //  this.noRecordFound=true;
    }
  }
  onEdit(form)
  {
    const modalRef = this.modalService.open(PatientHtmlFormsViewerComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.chartId=this.objencounterToOpen.chart_id; 
    modalRef.componentInstance.patientId=this.objencounterToOpen.patient_id;
    modalRef.componentInstance.form_id=form.form_id;
    modalRef.componentInstance.modalTitle=form.form_description;
    modalRef.componentInstance.patient_health_check_id=form.health_check_id;
    modalRef.componentInstance.operation='edit';
    var acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath,"category_name","Health_Check");
    var upload_path:string=acPath[0].upload_path;
    modalRef.componentInstance.doc_path=upload_path;
    modalRef.componentInstance.doc_link=form.file_link;
    modalRef.componentInstance.chart_provider_id=this.objencounterToOpen.provider_id;
  }  

}
