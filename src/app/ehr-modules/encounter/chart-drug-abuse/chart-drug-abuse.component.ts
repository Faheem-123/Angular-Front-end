import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { PatientHtmlFormsViewerComponent } from 'src/app/general-modules/patient-html-forms-viewer/patient-html-forms-viewer.component';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralService } from 'src/app/services/general/general.service';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';

@Component({
  selector: 'chart-drug-abuse',
  templateUrl: './chart-drug-abuse.component.html',
  styleUrls: ['./chart-drug-abuse.component.css']
})
export class ChartDrugAbuseComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  canView = false;
  canAddEdit = false;
  addEditView: boolean = false;
  isLoading: boolean = false;
  lstDrugAbuseResult;
  lstDrugsResult;
  lstHCForms;
  healthcheckId;
  isAlreadySent = "";

  public depscrValues: any[] = [{ created_user: [{ val: '' }], date_created: [{ val: '' }], client_date_created: [{ val: '' }] }];

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalOperation: GeneralOperation, private dateTimeUtil: DateTimeUtil, private generalService: GeneralService,
    private modalService: NgbModal, private logMessage: LogMessage, private encounterService: EncounterService) {

    this.canView = this.lookupList.UserRights.ViewDrugAbuse;
    this.canAddEdit = this.lookupList.UserRights.AddModifyDrugAbuse;
  }

  ngOnInit() {
    debugger;
    if (this.canView) {
      this.getPatientDrugAbuse();
    }
  }
  getPatientDrugAbuse() {
    debugger;
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "patient_id", value: this.objencounterToOpen.patient_id, option: "" },
      { name: "form_type", value: 'drug_form', option: "" }
    ];
    this.isLoading = true;
    this.encounterService.getPatientDrugAbuseSummary(searchcrit).subscribe(
      data => {
        // debugger;
        this.lstDrugsResult = data;
        if (this.lstDrugsResult.length > 0) {
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
        }
        else {
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
        }
      },
      error => {
        this.logMessage.log("getPatientDrugAbuseSummary " + error);
      }
    );
    this.isLoading = false;
  }
  // getDepressionScreening() {
  //   debugger;
  //   this.isLoading = true;
  //   let searchcrit: SearchCriteria = new SearchCriteria();
  //   searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
  //   searchcrit.param_list = [
  //     { name: "patient_id", value: this.objencounterToOpen.patient_id, option: "" },
  //     { name: "form_type", value: 'drug_abuse_test', option: "" },
  //     { name: "chartid", value: this.objencounterToOpen.chart_id, option: "" }
  //   ];
  //   this.encounterService.getDepressionScreening(searchcrit)
  //     .subscribe(
  //       data => {
  //         this.lstDrugsResult = data;
  //         if (this.lstDrugsResult == undefined || this.lstDrugsResult.length == 0) {
  //            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
  //         }
  //         else {
  //            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
  //         }
  //         this.isLoading = false;


  //       },
  //       error => {
  //         this.logMessage.log("An Error Occured while getting Depression Check list.")
  //         this.isLoading = false;
  //       }
  //     );
  // }
  getHealthCheckFormsList(opt, value) {
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "form_type", value: opt, option: "" }
    ];
    this.encounterService.getHealthCheckFormsList(searchcrit).subscribe(
      data => {
        debugger;
        this.lstHCForms = data;
        this.getHTML(value);
      },
      error => {
        this.logMessage.log("getHealthCheckFormsList " + error);
      }
    );
  }
  openDrugAbuse(value) {
    this.getHealthCheckFormsList('drug_form', value);
  }

  getHTML(val) {
    debugger;
    const modalRef = this.modalService.open(PatientHtmlFormsViewerComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.chartId = this.objencounterToOpen.chart_id;
    modalRef.componentInstance.patientId = this.objencounterToOpen.patient_id;
    if (val == "adults") {
      if (this.lstHCForms.length > 0)
        if (this.lstHCForms[0].form_id == "88") {
          modalRef.componentInstance.form_id = this.lstHCForms[0].form_id;
          modalRef.componentInstance.modalTitle = 'DAST-Adults';
        } else if (this.lstHCForms[1].form_id == "88") {
          modalRef.componentInstance.form_id = this.lstHCForms[1].form_id;
          modalRef.componentInstance.modalTitle = 'DAST-Adults';
        }
    } else {
      if (this.lstHCForms.length > 0)
        if (this.lstHCForms[0].form_id == "89") {
          modalRef.componentInstance.form_id = this.lstHCForms[0].form_id;
          modalRef.componentInstance.modalTitle = 'DAST-Children';
        } else if (this.lstHCForms[1].form_id == "89") {
          modalRef.componentInstance.form_id = this.lstHCForms[1].form_id;
          modalRef.componentInstance.modalTitle = 'DAST-Children';
        }
    }

    modalRef.componentInstance.operation = 'new';
    modalRef.componentInstance.chart_provider_id = this.objencounterToOpen.provider_id;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        this.getPatientDrugAbuse();
      }
    },
      (reason) => {
        //alert(reason);
      });
  }




  onEdit(form) {
    debugger;
    const modalRef = this.modalService.open(PatientHtmlFormsViewerComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.chartId = this.objencounterToOpen.chart_id;
    modalRef.componentInstance.patientId = this.objencounterToOpen.patient_id;
    modalRef.componentInstance.form_id = form.form_id;
    modalRef.componentInstance.modalTitle = form.form_name; //form.form_description;
    modalRef.componentInstance.patient_health_check_id = form.health_check_id;
    modalRef.componentInstance.operation = 'edit';
    var acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "Health_Check");
    var upload_path: string = acPath[0].upload_path;
    modalRef.componentInstance.doc_path = upload_path;
    modalRef.componentInstance.doc_link = form.file_link;
    modalRef.componentInstance.chart_provider_id = this.objencounterToOpen.provider_id;
    this.depscrValues[0].created_user.pop();
    this.depscrValues[0].date_created.pop();
    this.depscrValues[0].client_date_created.pop();
    this.depscrValues[0].created_user.push({ val: form.created_user });
    this.depscrValues[0].date_created.push({ val: form.date_created });
    this.depscrValues[0].client_date_created.push({ val: form.client_date_created });
    modalRef.componentInstance.depscrValues = this.depscrValues;
    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        this.getPatientDrugAbuse();
      }
    },
      (reason) => {
        //alert(reason);
      });
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
  };
  onDelete(value) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;
    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = value.health_check_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteDrugAbuse(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Drug Abuse Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Drug Abuse"
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
      this.getPatientDrugAbuse();
    }
  }









  // getDrugAbuse() {
  //   debugger;
  //   this.isLoading = true;
  //   let searchcrit: SearchCriteria = new SearchCriteria();
  //   searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
  //   searchcrit.param_list = [
  //     { name: "patient_id", value: this.objencounterToOpen.patient_id, option: "" },
  //     { name: "form_type", value: 'drug_abuse_test', option: "" },
  //     { name: "chartid", value: this.objencounterToOpen.chart_id, option: "" }
  //   ];
  //   this.encounterService.getDrugAbuse(searchcrit)
  //     .subscribe(
  //       data => {
  //         this.lstDrugAbuseResult = data;
  //         if (this.lstDrugAbuseResult == undefined || this.lstDrugAbuseResult.length == 0) {
  //            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
  //         }
  //         else {
  //            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
  //         }
  //         this.isLoading = false;


  //       },
  //       error => {
  //         this.logMessage.log("An Error Occured while getting Drug Abuse.")
  //         this.isLoading = false;
  //       }
  //     );
  // }
  file_pth = '';
  onPreview(value) {
    debugger;
    this.isAlreadySent = value.reference_id;
    this.healthcheckId = value.health_check_id.toString();
    var acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "Health_Check");
    var upload_path: string = acPath[0].upload_path;

    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "health_check_id", value: value.health_check_id.toString(), option: "" },
      { name: "patient_id", value: this.objencounterToOpen.patient_id, option: "" },
      { name: "upload_path", value: upload_path, option: "" }
    ];

    this.encounterService.getPreviewDrigAbuse(searchcrit)
      .subscribe(
        data => {
          debugger;
          var acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "Health_Check");
          var upload_path: string = acPath[0].upload_path;

          let searchCriteria: SearchCriteria = new SearchCriteria;
          this.file_pth = data[0].col3;
          searchCriteria.criteria = upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//Health_Check//" + data[0].col3;
          this.generalService.downloadFile(searchCriteria)
            .subscribe(
              data => {
                debugger;
                this.downloafileResponse(data, this.file_pth);
                this.isLoading = false;
              },
              error => {
                alert(error)
                this.isLoading = false;
              }
            );
        },
        error => {
          this.logMessage.log("An Error Occured while generating preview for selected drug abuse.")
          this.isLoading = false;
        }
      );
  }

  doc_path = '';
  downloafileResponse(data, doc_link) {
    debugger;
    let file_ext: string = doc_link.substring(doc_link.lastIndexOf('.') + 1, doc_link.length);
    let file_type: string = '';
    switch (file_ext.toLowerCase()) {
      case 'png':
        file_type = 'IMAGE/PNG';
        break;
      case 'jpg':
        file_type = 'IMAGE/JPEG';
        break;
      case 'pdf':
        file_type = 'application/pdf';
        break;
      case 'txt':
        file_type = 'text/plain';
        break;
      case 'doc':
        file_type = 'application/msword';
        break;
      case 'docx':
        file_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'html':
        file_type = 'text/html';
        break;
    }
    var file = new Blob([data], { type: file_type });//, {type: 'application/pdf'}
    var fileURL = URL.createObjectURL(file);

    let path = fileURL;
    this.doc_path = path;
    const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = path;
    modalRef.componentInstance.width = '800px';
    modalRef.componentInstance.callingModule = 'drug';
    modalRef.componentInstance.drugfilePath = doc_link;
    modalRef.componentInstance.healthcheckId = this.healthcheckId;
    modalRef.componentInstance.isAlreadySent = this.isAlreadySent;
  }
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
}