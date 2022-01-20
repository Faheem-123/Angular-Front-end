import { Component, OnInit, Inject, Input } from '@angular/core';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { LogMessage } from "../../../shared/log-message";
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { PatientService } from '../../../services/patient/patient.service';
import { ORMPatientCommunication } from './../../../models/patient/orm-patient-communication';
import { DateTimeUtil, DatePart, DateTimeFormat } from '../../../shared/date-time-util';
import { DatePipe } from '@angular/common';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadPopupComponent } from 'src/app/general-modules/file-upload-popup/file-upload-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';

@Component({
  selector: 'patient-correspondence',
  templateUrl: './patient-correspondence.component.html',
  styleUrls: ['./patient-correspondence.component.css'],
  providers: [DatePipe]
})
export class PatientCorrespondenceComponent implements OnInit {

  public showHideButtons = false;
  listCorrespondenceResult;
  correspondenceForm: FormGroup;
  private obj_PatientCommunication: ORMPatientCommunication;
  isEdit: Boolean = false;
  dateConsult;
  dateConsultObject
  selectedRow;
  isSelectedRowID;
  @Input() patientId;


  navigation = "navigation";

  docDetails: FormData;
  dateModel;
  isLoading: boolean = false;

  constructor(private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    private datePipe: DatePipe,
    private modalService: NgbModal,
    private patientService: PatientService) {

  }

  ngOnInit() {
    this.getCommunications(this.patientId);
    this.buildForm();
  }

  buildForm() {
    this.correspondenceForm = this.formBuilder.group({
      txtCorrDetails: this.formBuilder.control("", Validators.required),
      txtCorrDate: this.formBuilder.control(""),
      ddlCorrWith: this.formBuilder.control("")
    })
  }

  // onSubmitoldohere(value) {
  //   debugger;


  //   this.obj_PatientCommunication = new ORMPatientCommunication();

  //   this.obj_PatientCommunication.communication = (this.correspondenceForm.get('txtCorrDetails') as FormControl).value;//value.txtCorrDetails
  //   //this.obj_PatientCommunication.communicate_date = "";//(this.correspondenceForm.get('txtCorrDate') as FormControl).value;

  //   //this.obj_PatientCommunication.communicate_date= String("00" + value.txtCorrDate.month).slice(-2)+'/'+String("00" + value.txtCorrDate.day).slice(-2)+'/'+String("0000" + value.txtCorrDate.year).slice(-4);
  //   let communicationDate = this.dateTimeUtil.getStringDateFromDateModel(value.txtCorrDate);
  //     if (communicationDate != "") {
  //       this.obj_PatientCommunication.communicate_date = communicationDate;
  //     } else {
  //       this.obj_PatientCommunication.communicate_date = "";
  //     }

  //   this.obj_PatientCommunication.patient_id = this.patientId;
  //   this.obj_PatientCommunication.practice_id = this.lookupList.practiceInfo.practiceId;
  //   this.obj_PatientCommunication.communicate_with = (this.correspondenceForm.get('ddlCorrWith') as FormControl).value;//value.ddlCorrWith;

  //   this.obj_PatientCommunication.patient_document_id = undefined;
  //   this.obj_PatientCommunication.modified_by = this.lookupList.logedInUser.user_name;
  //   this.obj_PatientCommunication.client_modified_date = this.dateTimeUtil.getCurrentDateTimeString();
  //   //this.obj_PatientCommunication.modified_date = this.selectedRow.;

  //   if(this.isEdit){
  //     //edit rec
  //     this.obj_PatientCommunication.communication_id = this.selectedRow.communication_id;
  //     this.obj_PatientCommunication.created_user = this.selectedRow.created_user;
  //     this.obj_PatientCommunication.client_date_created = this.selectedRow.client_date_created;
  //   }else{
  //     this.obj_PatientCommunication.communication_id =undefined;;
  //     this.obj_PatientCommunication.created_user = this.lookupList.logedInUser.user_name;
  //   }
  //   this.patientService.saveeditCorrespondence(this.obj_PatientCommunication)
  //     .subscribe(
  //     data => this.savedSuccessfull(data),
  //     error => alert(error),
  //     () => this.logMessage.log("Save Patient Consultant.")
  //   );
  // }
  savedSuccessfull(data) {
    this.docDetails = undefined;
    this.getCommunications(this.patientId);
    this.cancelAddEdit();
  }

  editRow(row) {
    this.isEdit = true;
    this.selectedRow = row;
    this.showHideButtons = true;
    this.assignValues(row);
  }
  assignValues(values) {
    debugger;
    //assign values gose here.
    (this.correspondenceForm.get('txtCorrDetails') as FormControl).setValue(values.communication);

    // if(values.communicate_date!=null && values.communicate_date!=undefined)
    // {
    //   // this.dateConsult = values.communicate_date;

    //   // this.dateConsultObject= {
    //   //   year: Number(this.dateTimeUtil.getDateTimeFormatedString(values.communicate_date,DateTimeFormat.DATEFORMAT_YYYY)),
    //   //   month:Number(this.dateTimeUtil.getDateTimeFormatedString(values.communicate_date,DateTimeFormat.DATEFORMAT_MM)),
    //   //   day:Number(this.dateTimeUtil.getDateTimeFormatedString(values.communicate_date,DateTimeFormat.DATEFORMAT_DD))
    //   // }
    // }   
    // else
    // {
    //   // this.dateConsult=null;
    //   // this.dateConsultObject=null;
    // }
    (this.correspondenceForm.get('txtCorrDate') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(values.communicate_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    //(this.correspondenceForm.get('txtCorrDate') as FormControl).setValue(this.datePipe.transform(values.communicate_date,'MM/dd/yyyy');
    (this.correspondenceForm.get('ddlCorrWith') as FormControl).setValue(values.communicate_with);
  }

  getCommunications(patient_id) {
    this.isLoading = true;
    this.patientService.getCommunications(patient_id)
      .subscribe(
        data => {
          this.isLoading = false;
          this.listCorrespondenceResult = data
        },
        error => alert(error),
        () => {
          this.logMessage.log("get correspondence Successfull.")
          this.isLoading = false;
        }
      );
  }

  showAddEdit() {
    this.showHideButtons = true;

    this.dateModel = this.dateTimeUtil.getCurrentDateModel();
    (this.correspondenceForm.get('txtCorrDate') as FormControl).setValue(this.dateModel);
  }
  selectionChange(row) {
    this.isSelectedRowID = row.communication_id;
  }
  cancelAddEdit() {
    this.clearAllFields();
    this.selectedRow = "";
    this.showHideButtons = false;
    this.isEdit = false;
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  openAttachmentDialog(operation, doc) {
    debugger;
    const modalRef = this.modalService.open(FileUploadPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.docCategory = 'PatientDocuments';
    modalRef.componentInstance.operation = operation;
    modalRef.componentInstance.callingFrom = "communication";
    if (operation.toLowerCase() == "edit") {
      modalRef.componentInstance.selectedDocObj = doc;
    }
    let closeResult;

    modalRef.result.then((result) => {
      //if (result == true) {
      debugger;
      this.docDetails = result;
      //this.getPatientDocuments();
      //}
    }, (reason) => {
    });
  }
  savePatientCommunications(value) {
    debugger;
    if ((this.correspondenceForm.get('txtCorrDetails') as FormControl).value == "") {
      alert("Please enter notes.");
      return;
    }
    let ormPatcomm: ORMPatientCommunication = new ORMPatientCommunication();
    ormPatcomm.communication = (this.correspondenceForm.get('txtCorrDetails') as FormControl).value;
    let commDate = this.dateTimeUtil.getStringDateFromDateModel((this.correspondenceForm.get('txtCorrDate') as FormControl).value);
    if (commDate != "") {
      ormPatcomm.communicate_date = commDate;
    } else {
      ormPatcomm.communicate_date = "";
    }
    ormPatcomm.patient_id = this.patientId;
    ormPatcomm.practice_id = this.lookupList.practiceInfo.practiceId;
    ormPatcomm.communicate_with = (this.correspondenceForm.get('ddlCorrWith') as FormControl).value;
    ormPatcomm.system_ip = this.lookupList.logedInUser.systemIp;
    ormPatcomm.deleted = false;
    if (this.isEdit) {
      ormPatcomm.created_user = this.selectedRow.created_user;
      ormPatcomm.client_date_created = this.selectedRow.client_date_created;
      ormPatcomm.communication_id = this.selectedRow.communication_id;
      ormPatcomm.modified_by = this.lookupList.logedInUser.user_name;
      ormPatcomm.client_modified_date = this.dateTimeUtil.getCurrentDateTimeString();
      ormPatcomm.modified_date = this.dateTimeUtil.getCurrentDateTimeString();
      ormPatcomm.patient_document_id = this.selectedRow.patient_document_id;
    }
    else {
      ormPatcomm.patient_document_id = null;
      ormPatcomm.created_user = this.lookupList.logedInUser.user_name;
      ormPatcomm.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      ormPatcomm.modified_by = this.lookupList.logedInUser.user_name;
      ormPatcomm.client_modified_date = this.dateTimeUtil.getCurrentDateTimeString();
    }
    if (!this.docDetails) {
      this.docDetails = new FormData();
      this.docDetails.append('docData', JSON.stringify(null));
      this.docDetails.append('docCategory', null);
    }
    this.docDetails.append('communication', JSON.stringify(ormPatcomm));
    this.patientService.saveeditCorrespondence(this.docDetails)
      .subscribe(
        data => this.savedSuccessfull(data),
        error => alert(error),
        () => this.logMessage.log("Save Correspondence.")
      );
  }
  openPatientCommDocument(document) {




    debugger;
    var acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
    //var uploadPath: string;
    var downloadPath: string;
    if (acPath != null && acPath.length > 0) {
      //uploadPath = acPath[0].upload_path;
      downloadPath = acPath[0].download_path;
    }
    //var ext:String = document.link.toString().substr(document.link.toString().lastIndexOf(".")+1, document.link.toString().length);
    //this.downloafileResponse("", document.link);
    //this.viewDocument("", document.link, uploadPath);


    let docPath = downloadPath + this.lookupList.practiceInfo.practiceId + "/" + "PatientDocuments/" + document.link;
    //alert(docPath);
    const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = docPath;

  }

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

  doc_path = '';
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
    debugger;
    //comment now to check on live
    //var file = new Blob([data], { type: file_type });
    //var fileURL = URL.createObjectURL(file);
    //let path = fileURL;
    //const modalRef = this.modalService.open(DocumentViewerComponent, this.lgPopupUpOptions);
    // modalRef.componentInstance.path_doc = path;
    //cmnt end


    var file = new Blob([data], { type: file_type });//, {type: 'application/pdf'}
    var fileURL = URL.createObjectURL(file);

    let path = fileURL;



    this.doc_path = path;
    const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = path;
    modalRef.componentInstance.width = '800px';


  }
  lgPopupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  clearAllFields() {
    (this.correspondenceForm.get('txtCorrDetails') as FormControl).setValue('');
    (this.correspondenceForm.get('txtCorrDate') as FormControl).setValue('');
    (this.correspondenceForm.get('ddlCorrWith') as FormControl).setValue('');
  }
}