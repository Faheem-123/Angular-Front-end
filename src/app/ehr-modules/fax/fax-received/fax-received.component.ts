import { Component, OnInit, Inject } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { FaxService } from 'src/app/services/fax.service';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ListFilterGeneral } from 'src/app/shared/filter-pipe-general';
import { ListFilterGeneralNotIn } from 'src/app/shared/filter-pipe-general-not-in';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum, ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { GeneralService } from 'src/app/services/general/general.service';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
import * as FileSaver from 'file-saver';
import { AddFaxToPatientDocumentsComponent } from '../add-fax-to-patient-documents/add-fax-to-patient-documents.component';
import { AssignFaxComponent } from '../assign-fax/assign-fax.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { WrapperObjectSave } from 'src/app/models/general/wrapper-object-save';

@Component({
  selector: 'fax-received',
  templateUrl: './fax-received.component.html',
  styleUrls: ['./fax-received.component.css']
})
export class FaxReceivedComponent implements OnInit {


  isLoading: boolean = false;
  isProcessing: boolean = false;

  receivedFaxSearchFormGroup: FormGroup;
  filterRadioButtonFormGroup: FormGroup;

  dataFilterOption: string = "all";
  lstFaxFromDB: Array<any>;
  lstFaxFiltered: Array<any>;

  selectedRecordId: number;

  loadingCounter: number = 0;

  totalRecords: number = 0;

  closeResult: string;

  isMyFaxes: boolean = false;

  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
  };


  faxDownlaodPath: string = "";


  constructor(private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private faxService: FaxService,
    private openModuleService: OpenModuleService,
    private ngbModal: NgbModal,
    private generalService: GeneralService) {

  }

  ngOnInit() {
    this.buildForm();

    if (this.lookupList.lstFaxConfigFaxNumbers == undefined || this.lookupList.lstFaxConfigFaxNumbers.length == 0) {
      this.getFaxConfigFaxNumbersList();
    }
    else {
      this.receivedFaxSearchFormGroup.get('ddReceiverFaxNo').setValue(this.lookupList.lstFaxConfigFaxNumbers[0].id);
    }

    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      this.faxDownlaodPath = this.lookupList.lstdocumentPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//Fax//FaxRecived//";
    }
  }
  buildForm() {


    this.filterRadioButtonFormGroup = this.formBuilder.group({
      filterOption: this.formBuilder.control('all'),
    }
    );


    this.receivedFaxSearchFormGroup = this.formBuilder.group({
      dpDateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpDateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      ddLocation: this.formBuilder.control(""),
      ddReceiverFaxNo: this.formBuilder.control(null),
      chkMyFaxes: this.formBuilder.control(null)
    });
  }


  getFaxConfigFaxNumbersList() {

    this.faxService.getFaxConfigFaxNumbersList(this.lookupList.practiceInfo.practiceId, this.lookupList.faxServer).subscribe(
      data => {

        debugger;
        this.lookupList.lstFaxConfigFaxNumbers = data as Array<any>;

        if (this.lookupList.lstFaxConfigFaxNumbers != undefined && this.lookupList.lstFaxConfigFaxNumbers.length > 0) {
          this.receivedFaxSearchFormGroup.get('ddReceiverFaxNo').setValue(this.lookupList.lstFaxConfigFaxNumbers[0].id);
        }

        this.isLoading = false;


      },
      error => {
        this.isLoading = false;
        this.getFaxConfigError(error);
      }
    );
  }
  getFaxConfigError(error: any) {
    this.logMessage.log("getFaxConfig Error." + error);
  }



  search(formData: any) {

    debugger;
    this.isLoading = true;
    this.isMyFaxes = false;
    this.totalRecords = 0;
    this.lstFaxFromDB = undefined;
    this.lstFaxFiltered = undefined;

    let criteria: SearchCriteria = new SearchCriteria();
    criteria.practice_id = this.lookupList.practiceInfo.practiceId;
    criteria.param_list = [];

    if (formData.dpDateFrom != undefined) {
      criteria.param_list.push({ name: "dateFrom", value: this.dateTimeUtil.getStringDateFromDateModel(formData.dpDateFrom), option: "" });
    }
    if (formData.dpDateTo != undefined) {
      criteria.param_list.push({ name: "dateTo", value: this.dateTimeUtil.getStringDateFromDateModel(formData.dpDateTo), option: "" });
    }
    if (formData.ddLocation != undefined) {
      criteria.param_list.push({ name: "locationId", value: formData.ddLocation, option: "" });
    }
    if (formData.ddReceiverFaxNo != undefined) {
      criteria.param_list.push({ name: "receiverFaxNo", value: formData.ddReceiverFaxNo, option: "" });
    }

    if (!this.lookupList.UserRights.fax_Download) {
      criteria.param_list.push({ name: "faxAssignedToUserId", value: this.lookupList.logedInUser.userId, option: "" });
    }
    else if (formData.chkMyFaxes) {
      this.isMyFaxes = true;
      criteria.param_list.push({ name: "myFaxes", value: 'true', option: "" });
      criteria.param_list.push({ name: "faxAssignedToUserId", value: this.lookupList.logedInUser.userId, option: "" });
    }


    if (!this.lookupList.UserRights.fax_Download || this.isMyFaxes) {

      this.faxService.getUserAssignedReceivedFaxes(criteria).subscribe(
        data => {
          this.lstFaxFromDB = data as Array<any>;
          this.isLoading = false;

          this.filterData();

        },
        error => {
          this.isLoading = false;
        }
      );

    }
    else {

      this.faxService.getReceivedFaxes(criteria).subscribe(
        data => {
          this.lstFaxFromDB = data as Array<any>;
          this.isLoading = false;

          this.filterData();

        },
        error => {
          this.isLoading = false;
        }
      );



    }
  }


  onRadioOptionChange(event) {
    this.dataFilterOption = event;
    this.filterData();
  }

  filterData() {

    debugger;
    this.totalRecords = 0;
    this.lstFaxFiltered = undefined;
    this.isLoading = true;
    let filterObj: any;

    switch (this.dataFilterOption) {
      case "all":
        this.lstFaxFiltered = this.lstFaxFromDB;
        break;
      case "assigned":
        filterObj = { assigned_to: "" };
        this.lstFaxFiltered = new ListFilterGeneralNotIn().transform(this.lstFaxFromDB, filterObj);
        break;
      case "unassigned":
        filterObj = { assigned_to: "" };
        this.lstFaxFiltered = new ListFilterGeneral().transform(this.lstFaxFromDB, filterObj);
        break;
      case "read":
        filterObj = { fax_status: "Read" };
        this.lstFaxFiltered = new ListFilterGeneral().transform(this.lstFaxFromDB, filterObj);
        break;
      case "unread":
        filterObj = { fax_status: "Unread" };
        this.lstFaxFiltered = new ListFilterGeneral().transform(this.lstFaxFromDB, filterObj);
        break;
      case "archived":
        filterObj = { fax_status: "Archive" };
        this.lstFaxFiltered = new ListFilterGeneral().transform(this.lstFaxFromDB, filterObj);
        break;
      default:
        break;
    }

    switch (this.dataFilterOption) {
      case "all":
      case "assigned":
      case "unassigned":
        if (this.lstFaxFiltered != undefined && this.lstFaxFiltered.length > 0) {
          debugger;
          this.totalRecords = this.lstFaxFiltered.length;
          this.selectedRecordId = this.lstFaxFiltered[0].fax_recived_id;
        }
        break;
      case "read":
      case "unread":
      case "archived":
        if (this.lstFaxFiltered != undefined && this.lstFaxFiltered.length > 0) {
          debugger;
          this.totalRecords = this.lstFaxFiltered.length;
          this.selectedRecordId = this.lstFaxFiltered[0].fax_users_id;
        }
        break;
      default:
        break;
    }

    this.isLoading = false;


  }

  faxRowSelectionChange(fax: any) {

    if (this.lookupList.UserRights.fax_Download) {
      this.selectedRecordId = fax.fax_recived_id;
    }
    else {
      this.selectedRecordId = fax.fax_users_id;
    }
  }


  ReceiveFaxesFromFaxServer(faxNo: string) {

    this.isProcessing = true;
    let criteria: SearchCriteria = new SearchCriteria();
    criteria.practice_id = this.lookupList.practiceInfo.practiceId;
    criteria.param_list = [
      { name: "clientFaxNo", value: faxNo, option: "" },
      { name: "clientDateTime", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" },
      { name: "logedInuser", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "systemIp", value: this.lookupList.logedInUser.systemIp, option: "" },
      { name: "faxServer", value: this.lookupList.faxServer, option: "" }
    ];

    this.faxService.downloadFaxesFromServer(criteria).subscribe(
      data => {
        this.isProcessing = false;
        this.downloadFaxesFromServerSuccess(data);
      },
      error => {
        this.downloadFaxesFromServerError(error);
        this.isProcessing = false;
      }
    );

  }

  downloadFaxesFromServerSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      let total: number = 0;
      let success: number = 0;
      let errors: number = 0;

      if (data.response_list != undefined && data.response_list.length > 0) {

        data.response_list.forEach(resp => {
          if ((resp as ORMKeyValue).key == "total") {
            total = (resp as ORMKeyValue).value;
          }
          if ((resp as ORMKeyValue).key == "success") {
            success = (resp as ORMKeyValue).value;
          }
          if ((resp as ORMKeyValue).key == "error") {
            errors = (resp as ORMKeyValue).value;
          }

        });
      }
      let msg: string = "";
      if (total > 0) {
        msg = "Total Incoming Faxes : " + total + "<br>Downloaded Successfully : " + success + "<br>Errors : " + errors;
      }
      else {
        msg = "There is no 'New Incoming Fax'.";
      }



      GeneralOperation.showAlertPopUp(this.ngbModal, 'Receive Faxes', msg, AlertTypeEnum.INFO)

    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Receive Faxes', data.response, AlertTypeEnum.DANGER)
    }
  }

  downloadFaxesFromServerError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Receive Faxes', "An Error Occured while getting Faxes from Fax Server.", AlertTypeEnum.DANGER)
  }

  downloadAll() {

  }




  viewDocument(fax: any) {

    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = this.faxDownlaodPath + fax.link;
    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.isLoading = false;
          this.viewDocumentResponse(data, fax.link);
        },
        error => {
          this.isLoading = false;
          alert(error)
        }
      );
    // this.isLoading = false;
  }

  viewDocumentResponse(data, doc_link) {

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

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

  downlaodDocument(fax: any) {

    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = this.faxDownlaodPath + fax.link;
    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          this.isLoading = false;
          this.downloaFileResponse(data, fax.link, fax.fax_name);
        },
        error => {
          this.isLoading = false;
          alert(error)
        }
      );

  }

  downloaFileResponse(data, doc_link, name) {

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

    var file = new Blob([data], { type: file_type });
    //FileSaver.saveAs(file, name + "." + file_ext);
    FileSaver.saveAs(file, name + "." + file_ext);
  }



  onAddFaxToPatientDocuments(fax: any) {

    if (fax.link == undefined || fax.link == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Add Fax to Documents', "Fax file not found.", AlertTypeEnum.DANGER)
    }
    else {
      const modalRef = this.ngbModal.open(AddFaxToPatientDocumentsComponent, this.popUpOptions);
      modalRef.componentInstance.faxId = fax.fax_recived_id;
      modalRef.componentInstance.faxDate = fax.recived_date;
      modalRef.componentInstance.faxName = fax.fax_name;
      modalRef.componentInstance.faxLink = fax.link;
    }
  }


  onAssignFax(fax: any) {

    debugger;
    const modalRef = this.ngbModal.open(AssignFaxComponent, this.popUpOptions);
    modalRef.componentInstance.faxRecId = fax.fax_recived_id;
    modalRef.componentInstance.faxAssignedUsers = fax.assigned_to;
    modalRef.componentInstance.faxAssignedUsersIds = fax.fax_users_id;
    modalRef.componentInstance.faxName = fax.fax_name;
    modalRef.componentInstance.comments = fax.comments;


    modalRef.result.then((result) => {

      debugger;
      let comments: string = "";
      let assignedToUsers: string = "";
      let assignedToUsersIds: string = "";

      if (result != undefined && result.status == ServiceResponseStatusEnum.SUCCESS) {

        comments = result.comments;
        assignedToUsers = result.assignedToUsers;
        assignedToUsersIds = result.assignedToUsersIds;

        if (this.lstFaxFromDB != undefined) {
          for (let index = 0; index < this.lstFaxFromDB.length; index++) {
            if (this.lstFaxFromDB[index].fax_recived_id == this.selectedRecordId) {
              this.lstFaxFromDB[index].comments = comments;
              this.lstFaxFromDB[index].assigned_to = assignedToUsers;
              this.lstFaxFromDB[index].fax_users_id = assignedToUsersIds;
              break;
            }

          }
        }

        if (this.lstFaxFiltered != undefined) {
          for (let index = 0; index < this.lstFaxFiltered.length; index++) {
            if (this.lstFaxFiltered[index].fax_recived_id == this.selectedRecordId) {
              this.lstFaxFiltered[index].comments = comments;
              this.lstFaxFiltered[index].assigned_to = assignedToUsers;
              this.lstFaxFiltered[index].fax_users_id = assignedToUsersIds;
              break;
            }

          }
        }
      }

    }
      , (reason) => {

        //alert(reason);
      });
  }


  onDeleteFax(fax: any) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected Fax?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();

        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        let deletFaxOption: string = "all";

        if (!this.lookupList.UserRights.fax_Download || this.isMyFaxes) {
          deletFaxOption = "myfaxes"
          deleteRecordData.column_id = fax.fax_users_id.toString();
        }
        else {
          deletFaxOption = "all"
          deleteRecordData.column_id = fax.fax_recived_id.toString();
        }


        let wrapperObjectSave: WrapperObjectSave = new WrapperObjectSave();


        let lst: Array<ORMKeyValue> = new Array<any>();
        lst.push(new ORMKeyValue("option", deletFaxOption));

        wrapperObjectSave.ormSave = deleteRecordData;
        wrapperObjectSave.lstKeyValue = lst;



        this.faxService.deleteReceivedFax(wrapperObjectSave).subscribe(
          data => {

            debugger;
            if (data > 0) {
              debugger;
              let nextIndex: number = 0;

              if (this.lstFaxFromDB != undefined) {
                nextIndex = 0;
                for (let i: number = 0; i < this.lstFaxFromDB.length; i++) {
                  let element = this.lstFaxFromDB[i];
                  if (element.fax_recived_id == this.selectedRecordId) {
                    if (i > 0) {
                      nextIndex = i;
                    }
                    this.lstFaxFromDB.splice(i, 1);
                    break;
                  }
                }


              }


              if (this.lstFaxFiltered != undefined) {

                nextIndex = 0;
                for (let i: number = 0; i < this.lstFaxFiltered.length; i++) {
                  let element = this.lstFaxFiltered[i];
                  if (element.fax_recived_id == this.selectedRecordId) {
                    if (i > 0) {
                      nextIndex = i;
                    }
                    this.lstFaxFiltered.splice(i, 1);
                    break;
                  }
                }

                if (this.lstFaxFiltered.length) {
                  this.faxRowSelectionChange(this.lstFaxFiltered[nextIndex]);
                }
              }

            }
            else {
              GeneralOperation.showAlertPopUp(this.ngbModal, 'Delete Fax', "An Error Occured while deleting Fax.", AlertTypeEnum.DANGER)
            }
          },
          error => {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'Delete Fax', "An Error Occured while deleting Fax.", AlertTypeEnum.DANGER)
          }
        );

      }
    }, (reason) => {
      //alert(reason);
    });

  }


  onUpdateaFaxStatus(fax: any, status: string) {

    let lstKV: Array<ORMKeyValue> = new Array<ORMKeyValue>();

    lstKV.push(new ORMKeyValue('faxUserId', fax.fax_users_id));
    lstKV.push(new ORMKeyValue('clientDateTime', this.dateTimeUtil.getCurrentDateTimeString()));
    lstKV.push(new ORMKeyValue('logedInUser', this.lookupList.logedInUser.user_name));
    lstKV.push(new ORMKeyValue('systemIp', this.lookupList.logedInUser.systemIp));
    lstKV.push(new ORMKeyValue('faxStatus', status));


    this.faxService.updateReceivedUserFaxStatus(lstKV).subscribe(
      data => {
        this.updateReceivedUserFaxStatusSuccess(data);
      },
      error => {
        this.updateReceivedUserFaxStatusError(error);
      }
    );


  }

  updateReceivedUserFaxStatusSuccess(data: any) {

    debugger;

    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      let faxUserId: number = data.result.split("~")[0];
      let status: number = data.result.split("~")[1];
      //resp.result;

      if (this.lstFaxFromDB != undefined) {
        for (let index = 0; index < this.lstFaxFromDB.length; index++) {
          if (this.lstFaxFromDB[index].fax_users_id == faxUserId) {
            this.lstFaxFromDB[index].fax_status = status;
            break;
          }

        }
      }

      if (this.lstFaxFiltered != undefined) {
        for (let index = 0; index < this.lstFaxFiltered.length; index++) {
          if (this.lstFaxFiltered[index].fax_users_id == faxUserId) {
            this.lstFaxFiltered[index].fax_status = status;
            break;
          }

        }
      }

    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Fax Status Change', data.response, AlertTypeEnum.DANGER)
    }
  }

  updateReceivedUserFaxStatusError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Fax Status Change', "An Error Occured while Saving Record.", AlertTypeEnum.DANGER)
  }



  open(content) {
    this.ngbModal.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


}
