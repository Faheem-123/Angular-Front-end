import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientHtmlFormsViewerComponent } from 'src/app/general-modules/patient-html-forms-viewer/patient-html-forms-viewer.component';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';

@Component({
  selector: 'depression-screening',
  templateUrl: './depression-screening.component.html',
  styleUrls: ['./depression-screening.component.css']
})
export class DepressionScreeningComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;

  public depscrValues: any[] = [{ created_user: [{ val: '' }], date_created: [{ val: '' }], client_date_created: [{ val: '' }] }];
  isLoading: boolean = false;
  lstDepressionResult;
  lstHCForms;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
  };
  canView=false;
  canAddEdit=false;
  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalOperation: GeneralOperation,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    private logMessage: LogMessage) { 
      this.canView = this.lookupList.UserRights.ViewDepressionScreening;
      this.canAddEdit = this.lookupList.UserRights.AddModifyDepressionScreening;
    }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
    this.canAddEdit = false;
    
    if(this.canView)
    {
      this.getDepressionScreening();
      this.getHealthCheckFormsList();
    }
  }
  getHealthCheckFormsList() {
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "form_type", value: 'GYN_Depression_Screening', option: "" }
    ];
    this.encounterService.getHealthCheckFormsList(searchcrit).subscribe(
      data => {
        //debugger;
        debugger;
        this.lstHCForms = data;
      },
      error => {
        this.logMessage.log("getHealthCheckFormsList " + error);
      }
    );
  }
  addNewDepressionScreening() {
    debugger;
    const modalRef = this.modalService.open(PatientHtmlFormsViewerComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.chartId = this.objencounterToOpen.chart_id;
    modalRef.componentInstance.patientId = this.objencounterToOpen.patient_id;
    modalRef.componentInstance.form_id = this.lstHCForms[0].form_id;
    modalRef.componentInstance.modalTitle = 'Depression Screening';
    modalRef.componentInstance.operation = 'new';
    modalRef.componentInstance.chart_provider_id = this.objencounterToOpen.provider_id;

    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {
        this.getDepressionScreening();
      }
    },
      (reason) => {
        //alert(reason);
      });
  }

  getDepressionScreening() {
    debugger;
    this.isLoading = true;
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "patient_id", value: this.objencounterToOpen.patient_id, option: "" },
      { name: "form_type", value: 'GYN_Depression_Screening', option: "" },
      { name: "chartid", value: this.objencounterToOpen.chart_id, option: "" }
    ];

    //GeneralOptions.practiceID,patientID,"GYN_Depression_Screening",chartID
    this.encounterService.getDepressionScreening(searchcrit)
      .subscribe(
        data => {
          this.lstDepressionResult = data;
          if (this.lstDepressionResult == undefined || this.lstDepressionResult.length == 0) {
             this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
             this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
          this.isLoading = false;


        },
        error => {
          this.logMessage.log("An Error Occured while getting Depression Check list.")
          this.isLoading = false;
        }
      );
  }
  onEdit(form){
    debugger;
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
    this.depscrValues[0].created_user.pop();
    this.depscrValues[0].date_created.pop();
    this.depscrValues[0].client_date_created.pop();
    this.depscrValues[0].created_user.push({val: form.created_user});
    this.depscrValues[0].date_created.push({val: form.date_created});
    this.depscrValues[0].client_date_created.push({val: form.client_date_created});
    modalRef.componentInstance.depscrValues = this.depscrValues;
  }
  onDelete(value){
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;
    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = value.health_check_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteDepressionScreening(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Problem Status Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Depression Screening"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      this.getDepressionScreening();
    }
  }
}