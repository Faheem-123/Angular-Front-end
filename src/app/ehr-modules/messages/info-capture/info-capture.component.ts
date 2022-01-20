import { Component, OnInit, Input, Inject } from '@angular/core';
import { PatientService } from 'src/app/services/patient/patient.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { ORM_HealthInformationCaptureAttachments } from 'src/app/models/patient/orm-healthinformationcaptureattachments';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMHealthInformationCapture } from 'src/app/models/patient/orm-healthinformationcapture';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { WrapperPatientInfoCapture } from 'src/app/models/patient/WrapperPatientInfoCapture';
import { debug } from 'util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ChartModuleHistoryComponent } from './../../../general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from 'src/app/models/encounter/chartmodulehistory';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { CallingFromEnum, PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { LogParameters } from '../../log/log-parameters';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'info-capture',
  templateUrl: './info-capture.component.html',
  styleUrls: ['./info-capture.component.css']
})
export class InfoCaptureComponent implements OnInit {
  @Input() openPatientInfo;
  patientId;
  public isaddEdit = false;
  listInfoCapture: Array<any>;
  listInfoCaptureAttachments: Array<any>;
  listInfoCaptureLinks: Array<any>;
  ormListHealthInfoAttachments: ORM_HealthInformationCaptureAttachments = new ORM_HealthInformationCaptureAttachments();
  ormHealthInformationCapture: ORMHealthInformationCapture = new ORMHealthInformationCapture();
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    private generalOperation: GeneralOperation,
    private patientService: PatientService) { }
  patInfoCaptureForm: FormGroup;
  arrLinks: Array<any>;
  arrLinksCopy: Array<any>;
  arrAttachments: Array<any>;
  arrAttachmentCopy: Array<any>;
  acPath;
  IsEdit = false;
  editRecord; // to edit record
  objSaveHealthInfoAttachLinks: ORM_HealthInformationCaptureAttachments = new ORM_HealthInformationCaptureAttachments();
  //arrHealthInfoAttachmentsLinks: Array<any>;
  arrHealthInfoAttachmentsLinks;//: Array<any>;
  others: Array<ORMKeyValue> = [];
  selectedRowID;

  arrMultiFiles: Array<File>;//add files
  commDateModel: any;
  dateModel;
  private obj_charthistory: chartmodulehistory; //use for history
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  ngOnInit() {
    debugger;
    this.patientId = this.openPatientInfo.patient_id;
    this.buildForm();
    this.getHealthInfoCapture();
  }
  buildForm() {
    this.patInfoCaptureForm = this.formBuilder.group({
      txtaddLinks: this.formBuilder.control(null),
      ddlCorrespondenceWith: this.formBuilder.control(null),
      txtLabeling: this.formBuilder.control(null),
      txtDate: this.formBuilder.control(null),
      txtDetails: this.formBuilder.control(null)
    })
  }
  addNewInfoCapture() {
    this.isaddEdit = true;
    this.IsEdit = false;
    this.editRecord = "";
    this.listInfoCaptureAttachments = new Array<any>();
    this.listInfoCaptureLinks = new Array<any>();
    this.clearAll();
    this.dateModel = this.dateTimeUtil.getCurrentDateModel();
    (this.patInfoCaptureForm.get('txtDate') as FormControl).setValue(this.dateModel);
  }
  clearAll() {
    (this.patInfoCaptureForm.get('ddlCorrespondenceWith') as FormControl).setValue("");
    (this.patInfoCaptureForm.get('txtLabeling') as FormControl).setValue("");
    (this.patInfoCaptureForm.get('txtDate') as FormControl).setValue("");
    (this.patInfoCaptureForm.get('txtDetails') as FormControl).setValue("");
    (this.patInfoCaptureForm.get('txtaddLinks') as FormControl).setValue("");
    //this.innitializeAll();
  }
  cancelInfoCapture() {
    this.isaddEdit = false;
    this.IsEdit = false;
    this.editRecord = "";
    if(this.listInfoCapture[0]){
      this.RowDataUpdate(this.listInfoCapture[0]);
    }
  }
  getHealthInfoCapture() {
    debugger;
    this.patientService.getHealthInfoCapture(this.patientId, this.lookupList.practiceInfo.practiceId)
      .subscribe(
        data => {
          debugger;
          this.listInfoCapture = data as Array<any>;
          if(this.listInfoCapture[0]){
            this.RowDataUpdate(this.listInfoCapture[0]);
          }
          //this.cancelInfoCapture();
          //this.getHealthInfoCaptureAttach();
          //this.getHealthInfoCaptureLinks();
        },
        error => alert(error),
        () => this.logMessage.log("get Info Capture Successfull.")
      );
  }

  onFileChange(event) {
    this.ormListHealthInfoAttachments = new ORM_HealthInformationCaptureAttachments();
    if (this.arrAttachments == undefined) {
      this.arrAttachments = new Array<any>();
    }
    this.arrAttachmentCopy = new Array<any>();
    if (this.listInfoCaptureAttachments == undefined) {
      this.listInfoCaptureAttachments = new Array<any>();
    }
    this.ormListHealthInfoAttachments.link = "";
    this.ormListHealthInfoAttachments.attach_type = "file";
    this.ormListHealthInfoAttachments.attachment_id = "";
    this.ormListHealthInfoAttachments.name = event.target.files[0].name;
    this.arrAttachments.push(this.ormListHealthInfoAttachments);
    this.arrAttachmentCopy.push(this.ormListHealthInfoAttachments);
    //this.listInfoCaptureAttachments.push(this.arrAttachments[0]);
    this.listInfoCaptureAttachments.push(this.arrAttachmentCopy[0]);
    //this.copyList = this.listInfoCaptureAttachments;
    if (this.arrMultiFiles == undefined) {
      this.arrMultiFiles = new Array<any>();
    }
    this.arrMultiFiles.push(event.target.files[0]);
    //this.arrMultiFiles=event.target.files[0];
  }
  addLink() {
    if (this.validate()) {
      this.ormListHealthInfoAttachments = new ORM_HealthInformationCaptureAttachments();
      if (this.arrLinks == undefined) {
        this.arrLinks = new Array<any>();
      }
      //if(this.arrLinksCopy == undefined){
      this.arrLinksCopy = new Array<any>();
      //}
      this.ormListHealthInfoAttachments.link = (this.patInfoCaptureForm.get('txtaddLinks') as FormControl).value
      this.ormListHealthInfoAttachments.attach_type = "link";
      this.ormListHealthInfoAttachments.attachment_id = "";
      this.ormListHealthInfoAttachments.name = (this.patInfoCaptureForm.get('txtaddLinks') as FormControl).value
      this.arrLinksCopy.push(this.ormListHealthInfoAttachments);
      (this.patInfoCaptureForm.get('txtaddLinks') as FormControl).setValue('');
      this.listInfoCaptureLinks.push(this.arrLinksCopy[0]);
      this.arrLinks.push(this.arrLinksCopy);
    }
  }
  validate() {
    if ((this.patInfoCaptureForm.get('txtaddLinks') as FormControl).value.trim() == "") {
      alert("Pleas enter link.");
      return false;
    }
    return true;
  }
  saveInfoCapture() {
    if ((this.patInfoCaptureForm.get('txtDetails') as FormControl).value.toString().trim() == "") {
      alert("Please enter notes.");
      return false;
    }
    this.ormHealthInformationCapture = new ORMHealthInformationCapture();
    this.ormHealthInformationCapture.communication = (this.patInfoCaptureForm.get('txtDetails') as FormControl).value;
    this.ormHealthInformationCapture.patient_id = this.patientId;
    this.ormHealthInformationCapture.labeling = (this.patInfoCaptureForm.get('txtLabeling') as FormControl).value;
    this.ormHealthInformationCapture.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.ormHealthInformationCapture.communicate_with = (this.patInfoCaptureForm.get('ddlCorrespondenceWith') as FormControl).value;
    let varDate = this.dateTimeUtil.getStringDateFromDateModel((this.patInfoCaptureForm.get('txtDate') as FormControl).value);
    this.ormHealthInformationCapture.communicate_date = varDate;
    this.ormHealthInformationCapture.system_ip = this.lookupList.logedInUser.systemIp;
    this.ormHealthInformationCapture.deleted = "false";
    if (this.IsEdit == true) {
      this.ormHealthInformationCapture.health_info_id = this.editRecord.health_info_id;
      this.ormHealthInformationCapture.created_user = this.editRecord.created_user;
      this.ormHealthInformationCapture.client_date_created = this.editRecord.client_date_created;
      this.ormHealthInformationCapture.modified_user = this.lookupList.logedInUser.user_name;
      this.ormHealthInformationCapture.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      this.ormHealthInformationCapture.date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    } else {
      this.ormHealthInformationCapture.health_info_id = "";
      this.ormHealthInformationCapture.created_user = this.lookupList.logedInUser.user_name;
      this.ormHealthInformationCapture.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.ormHealthInformationCapture.modified_user = this.lookupList.logedInUser.user_name;
      this.ormHealthInformationCapture.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    }
    if (this.arrAttachments != null) {
      if (this.arrHealthInfoAttachmentsLinks == null || this.arrHealthInfoAttachmentsLinks == undefined) {
        this.arrHealthInfoAttachmentsLinks = new Array();
      }
      for (var i = 0; i < this.arrAttachments.length; i++) {
        this.objSaveHealthInfoAttachLinks = new ORM_HealthInformationCaptureAttachments();
        this.objSaveHealthInfoAttachLinks.system_ip = this.lookupList.logedInUser.systemIp;
        if (this.arrAttachments[i].attachment_id == "") {
          this.objSaveHealthInfoAttachLinks.attachment_id = "";
          this.objSaveHealthInfoAttachLinks.patient_id = this.patientId;
          this.objSaveHealthInfoAttachLinks.practice_id = this.lookupList.practiceInfo.practiceId.toString();
          this.objSaveHealthInfoAttachLinks.document_date = "";//GeneralOptions.CurrentDateTimeString();
          this.objSaveHealthInfoAttachLinks.original_file_name = this.arrAttachments[i].name; //browseFile.name;
          this.objSaveHealthInfoAttachLinks.name = this.arrAttachments[i].name; //browseFile.name;
          this.objSaveHealthInfoAttachLinks.link = ""; //isshe here.
          this.objSaveHealthInfoAttachLinks.attach_type = "file";
          if (this.IsEdit == true) {
            this.objSaveHealthInfoAttachLinks.health_info_id = this.editRecord.health_info_id;
          } else {
            this.objSaveHealthInfoAttachLinks.health_info_id = "";
          }
          this.objSaveHealthInfoAttachLinks.created_user = this.lookupList.logedInUser.user_name;
          this.objSaveHealthInfoAttachLinks.modified_user = this.lookupList.logedInUser.user_name;
          this.objSaveHealthInfoAttachLinks.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
          this.objSaveHealthInfoAttachLinks.client_modified_date = this.dateTimeUtil.getCurrentDateTimeString();
          this.objSaveHealthInfoAttachLinks.deleted = "false";
          this.arrHealthInfoAttachmentsLinks.push(this.objSaveHealthInfoAttachLinks);
        }
      }
    }//end attach
    if (this.arrLinks != null) {
      //check this detail
      if (this.arrHealthInfoAttachmentsLinks == null || this.arrHealthInfoAttachmentsLinks == undefined) {
        this.arrHealthInfoAttachmentsLinks = new Array();
      }
      for (var z = 0; z < this.arrLinks.length; z++) {
        this.objSaveHealthInfoAttachLinks = new ORM_HealthInformationCaptureAttachments();
        this.objSaveHealthInfoAttachLinks.system_ip = this.lookupList.logedInUser.systemIp;
        if (this.arrLinks[z][0].attachment_id == "") {
          this.objSaveHealthInfoAttachLinks.attachment_id = "";
          this.objSaveHealthInfoAttachLinks.patient_id = this.patientId;
          this.objSaveHealthInfoAttachLinks.practice_id = this.lookupList.practiceInfo.practiceId.toString();
          this.objSaveHealthInfoAttachLinks.document_date = "";//GeneralOptions.CurrentDateTimeString();
          this.objSaveHealthInfoAttachLinks.original_file_name = this.arrLinks[z][0].link;
          this.objSaveHealthInfoAttachLinks.name = this.arrLinks[z][0].link;
          this.objSaveHealthInfoAttachLinks.link = this.arrLinks[z][0].link;
          this.objSaveHealthInfoAttachLinks.attach_type = "link";
          if (this.IsEdit == true) {
            this.objSaveHealthInfoAttachLinks.health_info_id = this.editRecord.health_info_id;
          } else {
            this.objSaveHealthInfoAttachLinks.health_info_id = "";
          }
          this.objSaveHealthInfoAttachLinks.created_user = this.lookupList.logedInUser.user_name;
          this.objSaveHealthInfoAttachLinks.modified_user = this.lookupList.logedInUser.user_name;
          this.objSaveHealthInfoAttachLinks.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
          this.objSaveHealthInfoAttachLinks.client_modified_date = this.dateTimeUtil.getCurrentDateTimeString();
          this.objSaveHealthInfoAttachLinks.deleted = "false";
          this.arrHealthInfoAttachmentsLinks.push(this.objSaveHealthInfoAttachLinks);
        }
      }
    }//link end
    debugger;
    var acAttachmentPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "Messages");
    let WrapperPatInfoCapture: WrapperPatientInfoCapture = new WrapperPatientInfoCapture();
    if(this.arrHealthInfoAttachmentsLinks){
      WrapperPatInfoCapture.arrHealthInfoAttachmentsLinks = this.arrHealthInfoAttachmentsLinks;
    }else{
      WrapperPatInfoCapture.arrHealthInfoAttachmentsLinks = null;
    }
    WrapperPatInfoCapture.objHealthInfoCapture = this.ormHealthInformationCapture;
    if(acAttachmentPath.length > 0){
      WrapperPatInfoCapture.path = acAttachmentPath[0].upload_path;
    }else{
      WrapperPatInfoCapture.path = null;
    }
    
    const formData: FormData = new FormData();
    if (this.arrMultiFiles != undefined || this.arrMultiFiles != null) {
      for (let a = 0; a < this.arrMultiFiles.length; a++) {
        formData.append('attachFile', this.arrMultiFiles[a]);
      }
    } else {
      formData.append('attachFile', null);
    }
    formData.append('infoWrapperData', JSON.stringify(WrapperPatInfoCapture));
    this.patientService.AddEditNewHealthInformation(formData).subscribe(
      data => {
        debugger;
        this.cancelInfoCapture();
        this.innitializeAll();
        this.getHealthInfoCapture();
      },
      error => {
        return;
      }
    );
  }
  editPatInfoCapture(value) {
    debugger;
    this.isaddEdit = true;
    this.IsEdit = true;
    //this.assignValue();
     this.commDateModel = this.dateTimeUtil.getDateModelFromDateString(value.communicate_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    (this.patInfoCaptureForm.get('ddlCorrespondenceWith') as FormControl).setValue(value.communicate_with);
    (this.patInfoCaptureForm.get('txtLabeling') as FormControl).setValue(value.labeling);
    (this.patInfoCaptureForm.get('txtDate') as FormControl).setValue(this.commDateModel);
    (this.patInfoCaptureForm.get('txtDetails') as FormControl).setValue(value.communication);
  }
  RowDataUpdate(row) {
    this.editRecord = row;
    this.selectedRowID = row.health_info_id;
    this.getHealthInfoCaptureAttach(row.health_info_id, "file");
    this.getHealthInfoCaptureLinks(row.health_info_id, "link");
  }
  getHealthInfoCaptureAttach(health_info_id, recType) {
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "health_info_id", value: health_info_id, option: "" },
      { name: "recType", value: recType, option: "" }
    ];
    this.patientService.getHealthInfoCaptureAttach(searchCriteria)
      .subscribe(
        data => {
          this.listInfoCaptureAttachments = data as Array<any>;
        },
        error => alert(error),
        () => this.logMessage.log("get Info Capture Attach Successfull.")
      );
  }
  getHealthInfoCaptureLinks(health_info_id, recType) {
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "health_info_id", value: health_info_id, option: "" },
      { name: "recType", value: recType, option: "" }
    ];
    this.patientService.getHealthInfoCaptureLinks(searchCriteria)
      .subscribe(
        data => {
          this.listInfoCaptureLinks = data as Array<any>;
        },
        error => alert(error),
        () => this.logMessage.log("get Info Capture Attach Successfull.")
      );
  }
  // assignValue() {
  //   this.commDateModel = this.dateTimeUtil.getDateModelFromDateString(this.editRecord.communicate_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
  //   (this.patInfoCaptureForm.get('ddlCorrespondenceWith') as FormControl).setValue(this.editRecord.communicate_with);
  //   (this.patInfoCaptureForm.get('txtLabeling') as FormControl).setValue(this.editRecord.labeling);
  //   (this.patInfoCaptureForm.get('txtDate') as FormControl).setValue(this.commDateModel);
  //   (this.patInfoCaptureForm.get('txtDetails') as FormControl).setValue(this.editRecord.communication);
  // }
  innitializeAll() {
    this.arrAttachments = new Array<any>();
    this.arrAttachmentCopy = new Array<any>();
    this.listInfoCaptureAttachments = new Array<any>();
    this.arrLinks = new Array<any>();
    this.arrLinksCopy = new Array<any>();
    this.listInfoCaptureLinks = new Array<any>();
    this.arrHealthInfoAttachmentsLinks = new Array();
  }
  onDelete(val){
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;
    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = val.health_info_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
        this.patientService.deleteInfoCapture(deleteRecordData)
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
    if (data.status === ServiceResponseStatusEnum.ERROR){
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Info Capture"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else{
      this.getHealthInfoCapture();
    }
  }
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  
  showInfoCaptureHistory() {
    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "health_information_capture_log";
    logParameters.logDisplayName = "Patient Health Information Capture Log";
    logParameters.logMainTitle = "Patient Health Information Capture Log";
    logParameters.patientId = this.patientId;
    logParameters.PID = this.openPatientInfo.PID;
    logParameters.patientName = this.openPatientInfo.patientName
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.PATIENT;

    const modalRef = this.modalService.open(LogPopUpComponent, this.logoutScreenOptions);
    modalRef.componentInstance.param = logParameters;

    // const modalRef = this.modalService.open(ChartModuleHistoryComponent, this.logoutScreenOptions);
    // this.obj_charthistory = new chartmodulehistory();
    // this.obj_charthistory.titleString = "Patient Health Information Capture";
    // this.obj_charthistory.moduleName = "health_information_capture_log";
    // this.obj_charthistory.criteria = "and hi.patient_id = " + this.patientId;
    // this.obj_charthistory.parameter = "and hi.patient_id = " + this.patientId;
    // modalRef.componentInstance.data = this.obj_charthistory;
    // let closeResult;
    // modalRef.result.then((result) => {
    //   if (result == true) {
    //     //this.getAllUsers((this.userForm.get('ctrlStatus') as FormControl).value);
    //   }
    // }
    //   , (reason) => {
    //     //alert(reason);
    //   });
  }
}