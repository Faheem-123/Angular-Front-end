import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { LogMessage } from "../../../shared/log-message";
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { GeneralService } from 'src/app/services/general/general.service';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'dashboard-unreadfaxes',
  templateUrl: './dashboard-unreadfaxes.component.html',
  styleUrls: ['./dashboard-unreadfaxes.component.css']
})
export class DashboardUnreadfaxesComponent implements OnInit {
  @Output() widgetUpdate = new EventEmitter<any>();
  listUnreadfaxResult;
  unreadfaxcount;
  isLoading: boolean = false;
  constructor(private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private dateUtil: DateTimeUtil,
    private formBuilder: FormBuilder, private generalOperation: GeneralOperation, private generalService: GeneralService,
    private dashboardService: DashboardService, private ngbModal: NgbModal) { }

  ngOnInit() {
    this.getUnReadFaxes(this.lookupList.logedInUser.userId, this.lookupList.practiceInfo.practiceId);
  }
  refreshFax() {
    this.widgetUpdate.emit('fax');
    this.getUnReadFaxes(this.lookupList.logedInUser.userId, this.lookupList.practiceInfo.practiceId);
  }
  getUnReadFaxes(userID, practice_id) {
    debugger;
    this.isLoading = true;
    this.dashboardService.getUnReadFaxes(userID, practice_id)
      .subscribe(
        data => {
          this.listUnreadfaxResult = data
          this.unreadfaxcount = this.listUnreadfaxResult.length;
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          this.logMessage.log("unread fax Successfull." + error);
        }
      );
  }
  onFaxView(obj) {
    let downloadPath;
    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      let lstDocPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
      if (lstDocPath.length > 0)
        downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//Fax//FaxRecived//";
      else
        downloadPath = '';
    }
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = downloadPath + "/" + obj.link;
    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.downloafileResponse(data, obj.link);
        },
        error => alert(error)
      );
  }
  downloafileResponse(data, doc_link) {
    debugger;
    let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
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
    }
    var file = new Blob([data], { type: file_type });//, {type: 'application/pdf'}
    var fileURL = URL.createObjectURL(file);

    let path = fileURL;

    const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = path;
    modalRef.componentInstance.width = '800px';

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
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  onRead(obj, index) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Read !';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to Read the selected Fax ?';
    modalRef.componentInstance.alertType = 'info';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "client_date", value: this.dateUtil.getCurrentDateTimeString(), option: "" },
          { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "fax_users_id", value: obj.fax_users_id, option: "" }
        ];
        this.dashboardService.faxMarkasRead(searchCriteria).subscribe(
          data => {
            if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
              this.listUnreadfaxResult.splice(index, 1)
            }
            else if (data['status'] === ServiceResponseStatusEnum.ERROR) {

            }
          },
          error => alert(error),
          () => this.logMessage.log("faxMarkasRead Successfull.")
        );
        this.unreadfaxcount = this.listUnreadfaxResult.length;
      }
    }
      , (reason) => {
      });
  }

}
