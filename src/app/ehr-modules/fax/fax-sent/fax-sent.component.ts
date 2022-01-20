import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { LogMessage } from 'src/app/shared/log-message';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { FaxService } from 'src/app/services/fax.service';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum, ServiceResponseStatusEnum, FaxAttachemntsTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FaxParam } from '../new-fax/fax-parm';
import { SendFaxAttachmentsFromClient } from 'src/app/models/fax/send-fax-attachments-from-client';
import { NewFaxComponent } from '../new-fax/new-fax.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ListFilterGeneral } from 'src/app/shared/filter-pipe-general';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';

@Component({
  selector: 'fax-sent',
  templateUrl: './fax-sent.component.html',
  styleUrls: ['./fax-sent.component.css']
})
export class FaxSentComponent implements OnInit {


  @ViewChild('inlineFaxSentPatSearch') inlineFaxSentPatSearch: InlinePatientSearchComponent;

  faxSentSearchFormGroup: FormGroup;
  filterRadioButtonFormGroup: FormGroup;

  dataFilterOption: string = "all";
  lstFaxSentFromDB: Array<any>;
  lstFaxSentFiltered: Array<any>;
  lstFaxSentAttachments: Array<any>;
  lstFaxSendingAttempts: Array<any>;
  isLoading: boolean = false;
  isStatusUpdating: boolean = false;


  showPatientSearch: boolean = false;
  patientNameSearch: string = "";
  //patientNameIdSearch: number;

  selectedFaxSentId: number;

  loadingCounter: number = 0;

  totalRecords: number = 0;

  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
  };


  constructor(private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private faxService: FaxService,
    private openModuleService: OpenModuleService,
    private ngbModal: NgbModal,
    private generalOperation: GeneralOperation) { }

  ngOnInit() {

    this.buildForm();
  }



  buildForm() {

    this.filterRadioButtonFormGroup = this.formBuilder.group({
      filterOption: this.formBuilder.control('all'),
    }
    );

    this.faxSentSearchFormGroup = this.formBuilder.group({
      dpDateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpDateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null)
    });
  }



  onPatientSearchKeydown(event: KeyboardEvent) {


    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else if (event.key == 'ArrowDown') {
      debugger;
      this.shiftFocusToInsSearch();
    }
    else {
      this.showPatientSearch = false;
    }
  }

  shiftFocusToInsSearch() {
    this.inlineFaxSentPatSearch.focusFirstIndex();
  }

  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");

    if (newValue !== this.patientNameSearch) {
      //this.patientNameIdSearch = undefined;
      this.faxSentSearchFormGroup.get("txtPatientIdHidden").setValue(null);
    }



  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientNameSearch == undefined && this.showPatientSearch == false) {
      this.patientNameSearch = undefined;
      this.faxSentSearchFormGroup.get("txtPatientSearch").setValue(null);
      this.faxSentSearchFormGroup.get("txtPatientIdHidden").setValue(null);
    }
    //this.patientId=undefined;
  }

  onPatientSelect(patObject: any) {

    debugger;
    this.logMessage.log(patObject);
    //this.faxSentSearchFormGroup = patObject.patient_id;
    this.patientNameSearch = patObject.name;
    this.faxSentSearchFormGroup.get("txtPatientSearch").setValue(patObject.name);
    this.faxSentSearchFormGroup.get("txtPatientIdHidden").setValue(patObject.patient_id);
    this.showPatientSearch = false;

  }

  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  searchCriteria: SearchCriteria = new SearchCriteria();

  search(formData: any) {


    debugger;
    this.isLoading = true;
    this.totalRecords = 0;
    this.lstFaxSentFromDB = undefined;
    this.lstFaxSentFiltered = undefined;
    this.lstFaxSentAttachments = undefined;
    this.lstFaxSendingAttempts = undefined;

    let criteria: SearchCriteria = new SearchCriteria();
    criteria.practice_id = this.lookupList.practiceInfo.practiceId;
    criteria.param_list = [];


    if (formData.dpDateFrom != undefined) {
      criteria.param_list.push({ name: "dateFrom", value: this.dateTimeUtil.getStringDateFromDateModel(formData.dpDateFrom), option: "" });
    }
    if (formData.dpDateTo != undefined) {
      criteria.param_list.push({ name: "dateTo", value: this.dateTimeUtil.getStringDateFromDateModel(formData.dpDateTo), option: "" });
    }
    if (formData.txtPatientIdHidden != undefined) {
      criteria.param_list.push({ name: "patientId", value: formData.txtPatientIdHidden, option: "" });
    }

    this.getSentFaxes(criteria);
  }

  getSentFaxes(criteria: SearchCriteria) {

    this.searchCriteria = criteria;
    this.selectedFaxSentId = undefined;
    this.faxService.getSentFaxes(criteria).subscribe(
      data => {
        this.lstFaxSentFromDB = data as Array<any>;

        this.isLoading = false;

        this.filterData();

        /*
        if (this.lstFaxSentFromDB != undefined && this.lstFaxSentFromDB.length > 0) {
          this.totalRecords = this.lstFaxSentFromDB.length;
          this.faxSentRowSelectionChange(this.lstFaxSentFromDB[0].fax_sent_id);
        }
        */

      },
      error => {
        this.isLoading = false;
      }
    );

  }


  getSentFaxAttachments(faxSentId: number) {
    this.lstFaxSentAttachments = undefined;
    this.faxService.getSentFaxAttachments(faxSentId).subscribe(
      data => {
        this.lstFaxSentAttachments = data as Array<any>;
        this.loadingCounter--;
        if (this.loadingCounter == 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
      }
    );

  }

  getFaxSendingAttempts(faxSentId: number) {
    this.lstFaxSendingAttempts = undefined;
    this.faxService.getFaxSendingAttempts(faxSentId).subscribe(
      data => {
        this.lstFaxSendingAttempts = data as Array<any>;

        this.loadingCounter--;
        if (this.loadingCounter == 0) {
          this.isLoading = false;
        }

      },
      error => {
        this.isLoading = false;
      }
    );

  }




  faxSentRowSelectionChange(faxSentId: number) {

    if (this.selectedFaxSentId != faxSentId) {
      this.selectedFaxSentId = faxSentId;

      this.loadingCounter = 2;
      this.isLoading = true;

      this.getSentFaxAttachments(faxSentId);
      this.getFaxSendingAttempts(faxSentId);
    }
  }

  openPatient(faxSent: any) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = faxSent.patient_id;
    obj.patient_name = faxSent.pat_name;
    this.openModuleService.openPatient.emit(obj);
  }


  isSingleUpdateCalled: boolean = false;
  updateSingleFaxStatus(fax: any) {

    if (fax.fax_status.toString().toLowerCase() == 'success') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Fax Status', "Fax Status is 'Success'.", AlertTypeEnum.INFO)
      return;
    }
    else {

      this.isSingleUpdateCalled = true;
      let criteria: SearchCriteria = new SearchCriteria();
      criteria.practice_id = this.lookupList.practiceInfo.practiceId;
      criteria.param_list = [
        { name: "clientDateTime", value: this.dateTimeUtil.getCurrentDateTimeString() },
        { name: "logedInUser", value: this.lookupList.logedInUser.user_name },
        { name: "systemIp", value: this.lookupList.logedInUser.systemIp },
        { name: "faxSentIds", value: fax.fax_sent_id }
      ];

      this.updateFaxSendingStatus(criteria);

    }
  }

  updateAllFaxStatus() {

    if (this.lstFaxSentFiltered != undefined) {



      let faxSentIds: string = "";

      this.lstFaxSentFiltered.forEach(fax => {

        if (fax.fax_status.toString().toLowerCase() != 'success') {

          if (faxSentIds != "") {
            faxSentIds += ",";
          }
          faxSentIds += fax.fax_sent_id.toString();
        }
      });

      if (faxSentIds != "") {
        this.isSingleUpdateCalled = false;
        let criteria: SearchCriteria = new SearchCriteria();
        criteria.practice_id = this.lookupList.practiceInfo.practiceId;
        criteria.param_list = [
          { name: "clientDateTime", value: this.dateTimeUtil.getCurrentDateTimeString() },
          { name: "logedInUser", value: this.lookupList.logedInUser.user_name },
          { name: "systemIp", value: this.lookupList.logedInUser.systemIp },
          { name: "faxSentIds", value: faxSentIds }
        ];

        console.log("Fax Sent Ids:" + faxSentIds);

        this.updateFaxSendingStatus(criteria);
      }

    }
  }

  updateFaxSendingStatus(criteria: SearchCriteria) {
    this.isStatusUpdating = true;
    this.faxService.updateFaxSendingStatus(criteria).subscribe(
      data => {
        this.isStatusUpdating = false;
        this.updateFaxStatusSuccess(data);
      },
      error => {
        this.updateFaxStatusError(error);
        this.isStatusUpdating = false;
      }
    );
  }

  updateFaxStatusSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      if (this.isSingleUpdateCalled) {
        debugger;

        this.lstFaxSentFiltered.forEach(fax => {
          debugger;
          if (fax.fax_sent_id == this.selectedFaxSentId) {
            fax.fax_status = data.response;
          }
        });
        this.lstFaxSentFromDB.forEach(fax => {
          debugger;
          if (fax.fax_sent_id == this.selectedFaxSentId) {
            fax.fax_status = data.response;
          }
        });

        this.faxSentRowSelectionChange(this.selectedFaxSentId);
      }
      else {
        this.getSentFaxes(this.searchCriteria);
      }
      //this.getFaxDetail(this.rowId);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Update Fax Status', data.response, AlertTypeEnum.DANGER)
    }
  }

  updateFaxStatusError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Update Fax Status', "An Error Occured getting fax status.", AlertTypeEnum.DANGER)
  }

  onFaxResend(sentFax: any) {


    if (sentFax.fax_status.toString().toLowerCase() == 'pending') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Resend Fax', "Selected Fax is already in the queue.", AlertTypeEnum.WARNING)
    }
    else {
      let faxParam: FaxParam = new FaxParam();

      faxParam.faxSubject = sentFax.subject;
      faxParam.faxNotes = sentFax.cover_page_comments;
      faxParam.faxNotes = sentFax.cover_page_comments;

      faxParam.recepientOrganization = sentFax.receiver_organization;
      faxParam.recepientName = sentFax.receiver_name;
      faxParam.recepientFaxNo = sentFax.receiver_no;
      faxParam.recepientPhone = sentFax.receiver_phone;


      faxParam.senderOrganization = sentFax.sender_organization;
      faxParam.senderName = sentFax.sender_name;
      faxParam.senderFaxNo = sentFax.sender_no;
      faxParam.senderPhone = sentFax.sender_phone;

      faxParam.patientId = sentFax.patient_id;
      faxParam.moduleReferenceId = sentFax.module_reference_id;
      faxParam.faxReferenceId = sentFax.fax_reference_id;

      let faxSentId: string = '';

      if (sentFax.fax_sent_id_main != undefined
        && sentFax.fax_sent_id_main != null
        && sentFax.fax_sent_id_main != '') {
        faxSentId = sentFax.fax_sent_id_main;
      }
      else {
        faxSentId = sentFax.fax_sent_id;
      }
      faxParam.faxSentId = Number(faxSentId);

      let lstFaxAttachments = new Array<any>();
      if (this.lstFaxSentAttachments != undefined && this.lstFaxSentAttachments.length > 0) {
        this.lstFaxSentAttachments.forEach(att => {
          let sendFaxAttachmentsFromClient: SendFaxAttachmentsFromClient = new SendFaxAttachmentsFromClient();
          sendFaxAttachmentsFromClient.read_only = true;
          sendFaxAttachmentsFromClient.document_source = FaxAttachemntsTypeEnum.REFERENCED_DOCUMENT;
          sendFaxAttachmentsFromClient.document_name = att.doc_name;
          sendFaxAttachmentsFromClient.document_link = att.doc_link;
          lstFaxAttachments.push(sendFaxAttachmentsFromClient);
        });

      }

      this.openSendFaxPopUp("Resend Fax", lstFaxAttachments, "resend_fax", faxParam);
    }
  }

  openSendFaxPopUp(title: string, lstAttachment: Array<SendFaxAttachmentsFromClient>, faxOption: string, faxParam: FaxParam) {

    const modalRef = this.ngbModal.open(NewFaxComponent, this.lgPopUpOptions);

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.lstAttachments = lstAttachment;
    modalRef.componentInstance.callingFrom = "fax";
    modalRef.componentInstance.operation = faxOption;
    modalRef.componentInstance.faxParam = faxParam;

    modalRef.result.then((result) => {
      if (result) {
        this.faxSentRowSelectionChange(this.selectedFaxSentId);
      }
    }, (reason) => {

    });
  }

  onDeleteFax(fax: any) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected Fax?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = fax.fax_sent_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.faxService.deleteFaxSent(deleteRecordData).subscribe(
          data => {
            if (data > 0) {

              let nextIndex: number = 0;

              if (this.lstFaxSentFromDB != undefined) {
                nextIndex = 0;
                for (let i: number = 0; i < this.lstFaxSentFromDB.length; i++) {
                  let element = this.lstFaxSentFromDB[i];
                  if (element.fax_sent_id == this.selectedFaxSentId) {
                    if (i > 0) {
                      nextIndex = i;
                    }
                    this.lstFaxSentFromDB.splice(i, 1);
                    break;
                  }
                }

                if (this.lstFaxSentFromDB.length) {
                  this.faxSentRowSelectionChange(this.lstFaxSentFromDB[nextIndex].fax_sent_id);
                }
              }


              if (this.lstFaxSentFiltered != undefined) {

                nextIndex = 0;
                for (let i: number = 0; i < this.lstFaxSentFiltered.length; i++) {
                  let element = this.lstFaxSentFiltered[i];
                  if (element.fax_sent_id == this.selectedFaxSentId) {
                    if (i > 0) {
                      nextIndex = i;
                    }
                    this.lstFaxSentFiltered.splice(i, 1);
                    break;
                  }
                }

                if (this.lstFaxSentFiltered.length) {
                  this.faxSentRowSelectionChange(this.lstFaxSentFiltered[nextIndex].fax_sent_id);
                }
              }

            }
            else {
              GeneralOperation.showAlertPopUp(this.ngbModal, 'Delete Fax', "An Error Occured while sending Fax.", AlertTypeEnum.DANGER)
            }
          },
          error => {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'Delete Fax', "An Error Occured while sending Fax.", AlertTypeEnum.DANGER)
          }
        );

      }
    }, (reason) => {
      //alert(reason);
    });

  }

  onRadioOptionChange(event) {
    this.dataFilterOption = event;
    this.filterData();
  }

  filterData() {

    debugger;
    this.totalRecords = 0;
    this.lstFaxSentFiltered = undefined;
    this.lstFaxSentAttachments = undefined;
    this.lstFaxSendingAttempts = undefined;
    this.selectedFaxSentId = undefined;
    this.isLoading = true;
    let filterObj: any;

    switch (this.dataFilterOption) {
      case "all":
        this.lstFaxSentFiltered = this.lstFaxSentFromDB;
        break;
      case "sent":
        filterObj = { fax_status: "Success" };
        this.lstFaxSentFiltered = new ListFilterGeneral().transform(this.lstFaxSentFromDB, filterObj);
        break;
      case "failed":
        filterObj = { fax_status: "Fail" };
        this.lstFaxSentFiltered = new ListFilterGeneral().transform(this.lstFaxSentFromDB, filterObj);
        break;
      case "pending":
        filterObj = { fax_status: "Pending" };
        this.lstFaxSentFiltered = new ListFilterGeneral().transform(this.lstFaxSentFromDB, filterObj);
        break;
      default:
        break;
    }
    this.isLoading = false;
    if (this.lstFaxSentFiltered != undefined && this.lstFaxSentFiltered.length > 0) {
      debugger;
      this.totalRecords = this.lstFaxSentFiltered.length;
      this.faxSentRowSelectionChange(this.lstFaxSentFiltered[0].fax_sent_id);
    }

  }


  onFaxAttachmentView(att) {

    let docPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
    let downPath: string = docPath[0].download_path;

    let link = this.generalOperation.ReplaceAll((downPath + this.lookupList.practiceInfo.practiceId + "/PatientDocuments/" + att.doc_link).toString(), "\\", "/");
    const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = link;
    modalRef.componentInstance.width = '800px';
  }

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

}