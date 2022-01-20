import { Component, OnInit, Inject,Input,Output,EventEmitter } from '@angular/core';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { EncounterService } from '../../../services/encounter/encounter.service';
import { GeneralOperation } from '../../../shared/generalOperation';
import { LogMessage } from '../../../shared/log-message';
import { DateTimeUtil } from '../../../shared/date-time-util';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { PatientHtmlFormsViewerComponent } from '../../../general-modules/patient-html-forms-viewer/patient-html-forms-viewer.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum } from '../../../shared/enum-util';
import { ORMDeleteRecord } from '../../../models/general/orm-delete-record';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
@Component({
  selector: 'health-check-summary',
  templateUrl: './health-check-summary.component.html',
  styleUrls: ['./health-check-summary.component.css']
})
export class HealthCheckSummaryComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen:EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  isLoading=false;
  lstHCForms;
  listHealthCheckSummary;
 
  addEditView: boolean = false;
  noRecordFound=true;
  canView: boolean = false;
  canAddEdit: boolean = false;

  constructor(private encounterService: EncounterService,
    private generalOperation: GeneralOperation
    , private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { 
    this.canView = this.lookupList.UserRights.ViewHealthCheck;
    this.canAddEdit = this.lookupList.UserRights.AddModifyHealthCheck;
    }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
    if(this.canView)
    {
      this.getHealthCheckFormsList();
      this.getPatientHealthCheckSummary();
    }
  }
  getHealthCheckFormsList(){
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "form_type", value: 'HEALTH_CHECK',option: "" }
    ];
  this.encounterService.getHealthCheckFormsList(searchcrit).subscribe(
  data => {
    //debugger;
    this.lstHCForms = data;
  },
  error => {
    this.logMessage.log("getPatientHealthCheckSummary "+error);
  }
);
  }
  getPatientHealthCheckSummary(){
    let searchcrit: SearchCriteria = new SearchCriteria();
        searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
        searchcrit.param_list = [
          { name: "patient_id", value: this.objencounterToOpen.patient_id, option: "" },
          { name: "form_type", value: 'HEALTH_CHECK',option: "" }
        ];
        this.isLoading=true;
    this.encounterService.getPatientHealthCheckSummary(searchcrit).subscribe(
      data => {
       // debugger;
        this.listHealthCheckSummary = data;
        if(this.listHealthCheckSummary.length>0)
        {
          this.noRecordFound=false;
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName,"1"));
        }
        else{
          this.noRecordFound=true;
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName,"0"));
          
        }
      },
      error => {
        this.logMessage.log("getPatientHealthCheckSummary "+error);
      }
    );
    this.isLoading=false;
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size:'lg'
  };
  poupUpOptionsSM: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  onNewClick(form){
  //validation
  for(let i=0;i<this.listHealthCheckSummary.length;i++)
  {
    if(form.form_id==this.listHealthCheckSummary[i].form_id)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Health Check','Sorry, you can not create another copy of '+form.form_description+' Form.','warning');
      return;
    }
  }

    const modalRef = this.modalService.open(PatientHtmlFormsViewerComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.chartId=this.objencounterToOpen.chart_id; 
    modalRef.componentInstance.patientId=this.objencounterToOpen.patient_id;
    modalRef.componentInstance.form_id=form.form_id;
    modalRef.componentInstance.modalTitle=form.form_description;
    modalRef.componentInstance.operation='new';
    modalRef.componentInstance.chart_provider_id=this.objencounterToOpen.provider_id;
    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES)
      {
        this.getPatientHealthCheckSummary();
      }
    }, 
    (reason) => {
            //alert(reason);
        });
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
    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES)
      {
        this.getPatientHealthCheckSummary();
      }
    }, 
    (reason) => {
            //alert(reason);
        });
  }
  onDelete(form){
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptionsSM);
    modalRef.componentInstance.promptHeading = "Confirm Deletion !"
    modalRef.componentInstance.promptMessage = "Are you sure you want to delete selected record ?";
    modalRef.componentInstance.alertType = "danger";
    let closeResult;

    modalRef.result.then((result) => {


      //alert(result);
      if (result === PromptResponseEnum.YES) {
      //  debugger;
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
      var index = this.generalOperation.getElementIndex(this.listHealthCheckSummary, form);
      if (index > -1) {
        this.listHealthCheckSummary.splice(index, 1);
      }

      if(this.listHealthCheckSummary==undefined || this.listHealthCheckSummary.length==0){
        this.noRecordFound=true;
      }
    }
  }  

}
