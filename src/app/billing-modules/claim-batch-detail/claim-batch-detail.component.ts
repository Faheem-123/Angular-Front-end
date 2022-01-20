import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from 'src/app/services/billing/billing.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { CallingFromEnum, OperationType, PromptResponseEnum, PatientSubTabsEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import * as FileSaver from 'file-saver';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { GeneralService } from 'src/app/services/general/general.service';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { OpenedPatientInfo } from 'src/app/models/common/patientInfo';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
@Component({
  selector: 'claim-batch-detail',
  templateUrl: './claim-batch-detail.component.html',
  styleUrls: ['./claim-batch-detail.component.css']
})
export class ClaimBatchDetailComponent implements OnInit {
  @Input() batch_id;
  @Input() batch_name = '';
  @Input() isbatch_lock = false;
  @Input() batch_path = ''
  @Input() batch_status_detail = '';
  @Input() batch_type = '';
  @Output() onBack = new EventEmitter<any>();
  
  listBatchDetail;
  listBatchError;
  loadmodule = false;
  module_name = '';
  show_Batch_error = false;
  isLoading = false;
  lblBackto = 'Back To Batch';
  downloadPath;
  constructor(private billingService: BillingService, private generalOperation: GeneralOperation,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private generalService: GeneralService,
    private ngbModal: NgbModal, private datetimeUtil: DateTimeUtil) { }

  ngOnInit() {

    this.getBatchDetail();

    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      let lstDocPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "BatchFiles");
      if (lstDocPath.length > 0)
        this.downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//BatchFiles";
      else
        this.downloadPath = '';
    }
  }
  getBatchDetail() {
    this.isLoading = true;
    this.billingService.getBatchDetail(this.lookupList.practiceInfo.practiceId.toString(), this.batch_id).subscribe(
      data => {
        this.listBatchDetail = data;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  onDownloadbatch() {
    this.billingService.getBatchPath(this.batch_id).subscribe(
      data => {
        let searchCriteria: SearchCriteria = new SearchCriteria;
        searchCriteria.criteria = this.downloadPath + "/" + data[0].col2;
        this.generalService.downloadFile(searchCriteria).subscribe(
          data => {
            debugger;
            var file = new Blob([data], { type: 'text/plain' });
            FileSaver.saveAs(file, this.batch_name + ".txt");
          },
          error => {
            alert(error);
            this.isLoading = false;
          }
        );

        this.downloadPath
      },
      error => {

      }
    );
  }
  downloadfile(data, doc_link, name) {

    let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
    let file_type: string = '';
    switch (file_ext.toLowerCase()) {
      case 'txt':
        file_type = 'text/plain';
        break;
    }
    var fileURL;
    var file = new Blob([data], { type: file_type });
    FileSaver.saveAs(file, name + "." + file_ext);
  }
  onBatchGeneration(){
    if(this.listBatchDetail.length<1)
    {
      return;
    }
    this.isLoading=true;
    let searchCriteria:SearchCriteria=new SearchCriteria()
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];
    searchCriteria.param_list.push({ name: "batch_id", value: this.batch_id, option: "" });
    searchCriteria.param_list.push({ name: "batch_name", value: this.batch_name, option: "" });
    searchCriteria.param_list.push({ name: "user_name", value: this.lookupList.logedInUser.user_name, option: "" });
    searchCriteria.param_list.push({ name: "IgnoreRefPhyErrors", value: false, option: "" });
    searchCriteria.param_list.push({ name: "client_date_time", value: this.datetimeUtil.getCurrentDateTimeString(), option: "" });

    this.billingService.generateBatch_5010_P(searchCriteria).subscribe(
      data => {
        debugger;
        this.isLoading = false;
        this.listBatchError = data;
        if (this.listBatchError.length > 0) {
          this.show_Batch_error = true;
        }
        else {
          this.isbatch_lock = true;
          this.listBatchDetail=[];
        }
      },
      error => {
        debugger;
        this.isLoading = false;
      }
    );
  }
  navigateBackToSummary()
  {
    this.show_Batch_error=false;
    this.listBatchError=undefined;
    this.loadmodule=false;
  }
  patientToOpen:PatientToOpen;
  openedClaimInfo: OpenedClaimInfo;
  patientName = '';
  patient_id = '';
  claim_id = '';
  onOpenModule(obj, module, from) {
    this.module_name = module;
    this.patientName = obj.patientname;
    this.patient_id = obj.patient_id;
    this.claim_id=obj.claim_id;
    if (from == 'batch') {
      this.lblBackto = 'Back To Batch';
    }
    else
      this.lblBackto = 'Back To Batch Error';

    if (this.module_name == 'claim') {
      // this.openedClaimInfo = new OpenedClaimInfo(obj.claim_id, obj.patient_id, undefined, undefined, obj.dos, OperationType.EDIT, false,
      //   CallingFromEnum.Billing_Summary, undefined, undefined, undefined, undefined, undefined, undefined);
      this.patientToOpen=new PatientToOpen();
        this.patientToOpen.callingFrom=CallingFromEnum.Billing_Summary;
        this.patientToOpen.patient_id=obj.patient_id;
        this.patientToOpen.child_module=PatientSubTabsEnum.CLAIM;
        this.patientToOpen.child_module_id=obj.claim_id;
    }
    this.loadmodule = true;
  }
  onDeleteClaimFromBatch(c, index) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.logoutScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Ignore!';
    modalRef.componentInstance.promptMessage = 'Are you sure you wants to delete selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {

        let searchCriteria: SearchCriteria = new SearchCriteria()
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [];
        searchCriteria.param_list.push({ name: "claim_batch_detail_id", value: c.detail_id, option: "" });
        searchCriteria.param_list.push({ name: "user", value: this.lookupList.logedInUser.user_name, option: "" });
        searchCriteria.param_list.push({ name: "client_date", value: this.datetimeUtil.getCurrentDateTimeString(), option: "" });
        searchCriteria.param_list.push({ name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: "" });

        this.billingService.deleteClaimFromBatch(searchCriteria)
          .subscribe(
            data => {
              if (data > 0) {
                this.listBatchDetail.splice(index, 1)
              }
            },
            error => alert(error),
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
  };

  onIgnoreError(c, index) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.logoutScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Ignore!';
    modalRef.componentInstance.promptMessage = 'Are you sure you wants to Ignore selected Error?';
    modalRef.componentInstance.alertType = 'warning';
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        this.billingService.IgnoreError(c.id, this.lookupList.logedInUser.user_name)
          .subscribe(
            data => {
              if (data > 0) {
                this.listBatchError.splice(index, 1)
              }
            },
            error => alert(error),
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }

}
