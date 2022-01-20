import { element } from 'protractor';
import { GeneralOperation } from './../../../shared/generalOperation';
import { ORMDeleteRecord } from './../../../models/general/orm-delete-record';
import { ConfirmationPopupComponent } from './../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ORMPatientConsultant } from './../../../models/patient/orm-patient-consultant';
import { LogMessage } from './../../../shared/log-message';
import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient/patient.service';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { lookup } from 'dns';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
//import {} from 'ngme';
import { PromptResponseEnum } from '../../../shared/enum-util';
import { FileUploadPopupComponent } from 'src/app/general-modules/file-upload-popup/file-upload-popup.component';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
@Component({
  selector: 'patient-consults',
  templateUrl: './patient-consults.component.html',
  styleUrls: ['./patient-consults.component.css']
})
export class PatientConsultsComponent implements OnInit {
  lstConsultant;
  lstSpeciality;
  selectedConsult;
  rowId;

  uploadFileDetails: FormData;
  isLoading: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private patientService: PatientService,
    private logMessage: LogMessage,
    private clockService: DateTimeUtil,
    private modalService: NgbModal,
    private generalOperation: GeneralOperation,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  public dashboardAddEdit = false;
  inputForm: FormGroup;
  @Input() patientId;

  operation = '';
  dateConsult;
  dateConsultObject;
  dateModel;
  toDatyDate;
  private obj_patient_consultant: ORMPatientConsultant;
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtConsultantName: this.formBuilder.control("", Validators.required),
      drpSpeciality: this.formBuilder.control("", Validators.required),
      txtDate: this.formBuilder.control({ value: this.dateModel }, Validators.required),
      txtClinicName: this.formBuilder.control("", Validators.required),
      txtDocument: this.formBuilder.control("", Validators.required),
      drpStatus: this.formBuilder.control("", Validators.required),
      txtMedicine: this.formBuilder.control("", Validators.required),
      txtReason: this.formBuilder.control("", Validators.required)
    })
  }

  ngOnInit() {
    this.buildForm();
    this.getPatientConsults();
  }
  getPatientConsults() {

    this.isLoading = true;
    this.patientService.getPatientConsultant(this.patientId).subscribe(
      data => {
        this.lstConsultant = data;
        this.isLoading = false;
      }
    );
    this.patientService.getSpeciality(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.isLoading = false;
        this.lstSpeciality = data;
      }
    );
  }
  showAddEdit(operation, consult) {
    debugger;
    if (operation == 'Add') {
      this.operation = 'Add';
      this.resetForm();
    }
    else if (operation == 'Edit') {
      this.selectedConsult = consult;
      this.operation = 'Edit';
      //Assign Value:-
      (this.inputForm.get('txtConsultantName') as FormControl).setValue(consult.consultant_name);
      (this.inputForm.get('drpSpeciality') as FormControl).setValue(consult.specility_id);
      // if(consult.date!=null && consult.date!=undefined)
      // {
      //   this.dateConsult = consult.date;

      //   this.dateConsultObject= {
      //     year: Number(this.clockService.getDateTimeFormatedString(consult.date,DateTimeFormat.DATEFORMAT_YYYY)),
      //     month:Number(this.clockService.getDateTimeFormatedString(consult.date,DateTimeFormat.DATEFORMAT_MM)),
      //     day:Number(this.clockService.getDateTimeFormatedString(consult.date,DateTimeFormat.DATEFORMAT_DD))
      //   }
      // }   
      // else
      // {
      //   this.dateConsult=null;
      //   this.dateConsultObject=null;
      // }

      this.dateModel = this.dateTimeUtil.getDateModelFromDateString(consult.date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      (this.inputForm.get('txtDate') as FormControl).setValue(this.dateModel);
      (this.inputForm.get('txtClinicName') as FormControl).setValue(consult.clinic_name);
      (this.inputForm.get('txtDocument') as FormControl).setValue(consult.name);
      (this.inputForm.get('drpStatus') as FormControl).setValue(consult.status);
      (this.inputForm.get('txtMedicine') as FormControl).setValue(consult.medicine);
      (this.inputForm.get('txtReason') as FormControl).setValue(consult.reason);
    }
    this.dashboardAddEdit = true;
  }

  hideAddEdit() {
    this.dashboardAddEdit = false;

  }
  resetForm() {
    debugger;
    //this.inputForm.reset();
    (this.inputForm.get('txtConsultantName') as FormControl).setValue("");
    (this.inputForm.get('drpSpeciality') as FormControl).setValue("");
    (this.inputForm.get('txtDate') as FormControl).setValue("");
    (this.inputForm.get('txtClinicName') as FormControl).setValue("");
    (this.inputForm.get('txtDocument') as FormControl).setValue("");
    (this.inputForm.get('drpStatus') as FormControl).setValue("");
    (this.inputForm.get('txtMedicine') as FormControl).setValue("");
    (this.inputForm.get('txtReason') as FormControl).setValue("");

    this.toDatyDate = this.dateTimeUtil.getCurrentDateModel();
    (this.inputForm.get("txtDate") as FormControl).setValue(this.toDatyDate);
  }
  savePatientConsult(cns) {
    debugger;
    let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    this.obj_patient_consultant = new ORMPatientConsultant();
    this.obj_patient_consultant.patient_id = this.patientId;
    this.obj_patient_consultant.practice_id = this.lookupList.practiceInfo.practiceId;

    this.obj_patient_consultant.modified_user = this.lookupList.logedInUser.user_name;
    this.obj_patient_consultant.date_modified = "";
    //this.obj_patient_consultant.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    this.obj_patient_consultant.client_date_modified = clientDateTime;

    this.obj_patient_consultant.consultant_name = (this.inputForm.get('txtConsultantName') as FormControl).value;
    //this.obj_patient_consultant.date = (this.inputForm.get('txtDate') as FormControl).value; 
    let varDate = this.dateTimeUtil.getStringDateFromDateModel((this.inputForm.get('txtDate') as FormControl).value);
    if (varDate != "") {
      this.obj_patient_consultant.date = varDate;
    } else {
      this.obj_patient_consultant.date = null;
    }

    this.obj_patient_consultant.specility_id = (this.inputForm.get('drpSpeciality') as FormControl).value;
    this.obj_patient_consultant.clinic_name = (this.inputForm.get('txtClinicName') as FormControl).value;
    this.obj_patient_consultant.status = (this.inputForm.get('drpStatus') as FormControl).value;
    this.obj_patient_consultant.medicine = (this.inputForm.get('txtMedicine') as FormControl).value;
    this.obj_patient_consultant.reason = (this.inputForm.get('txtReason') as FormControl).value;

    if (this.operation.toLowerCase() == 'edit') {
      this.obj_patient_consultant.consultation_id = this.selectedConsult.consultation_id;
      this.obj_patient_consultant.created_user = this.selectedConsult.created_user;
      this.obj_patient_consultant.date_created = this.selectedConsult.date_created;
      this.obj_patient_consultant.client_date_created = this.selectedConsult.client_date_created;
      this.obj_patient_consultant.patient_document_id = this.selectedConsult.patient_document_id;
    }
    else {
      this.obj_patient_consultant.consultation_id = undefined;
      this.obj_patient_consultant.created_user = this.lookupList.logedInUser.user_name;
      this.obj_patient_consultant.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.obj_patient_consultant.patient_document_id = null;
    }
    //if(this.uploadFileDetails==null || this.uploadFileDetails == undefined){
    if (!this.uploadFileDetails) {
      this.uploadFileDetails = new FormData();
      this.uploadFileDetails.append('docData', JSON.stringify(null));
      this.uploadFileDetails.append('docCategory', null);
    }
    this.uploadFileDetails.append('consult', JSON.stringify(this.obj_patient_consultant));

    this.patientService.savePatientConsultant(this.uploadFileDetails)
      .subscribe(
        data => this.savedSuccessfull(data),
        error => alert(error),
        () => this.logMessage.log("Save Patient Consultant.")
      );

  }
  savedSuccessfull(data) {
    this.uploadFileDetails = undefined;
    this.getPatientConsults();
    this.selectedConsult = null;
    this.hideAddEdit();
  }
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
  };
  deleteConsult(obj) {

    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.logoutScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.consultation_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.clockService.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;


        this.patientService.deletePatientConsultant(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data, obj),
            error => alert(error),
            () => this.logMessage.log("deleteEmployee Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(result, element) {
    if (result > 0) {
      var index = this.generalOperation.getElementIndex(this.lstConsultant, element);
      if (index > -1) {
        this.lstConsultant.splice(index, 1);
      }
    }
  }
  OnSelectionChanged(request) {
    this.rowId = request.consultation_id;
  }
  stringConvertSubString(value) {
    let result = "";
    if (value != null) {
      if (value.length > 20)
        result = value.substring(0, 20) + " ...";
      else
        result = value.substring(0, 20);
    }
    return result;
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
      this.uploadFileDetails = result;
      //this.getPatientDocuments();
      //}
    }, (reason) => {
    });
  }
  openPatientconsultDocument(document) {
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



    // debugger;
    // var acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath,"category_name","PatientDocuments");
    // var uploadPath:String;
    // var downloadPath:String;		
    // if(acPath != null && acPath.length > 0)
    // {
    //   uploadPath = acPath[0].upload_path;
    //   downloadPath= acPath[0].download_path;
    // }
    // //var ext:String = document.link.toString().substr(document.link.toString().lastIndexOf(".")+1, document.link.toString().length);
    // this.downloafileResponse1("", document.link, uploadPath);
  }

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };
  downloafileResponse1(type, link, uploadPath) {
    //alert(type + ":" + link);
    let docPath = uploadPath + this.lookupList.practiceInfo.practiceId + "/" + "PatientDocuments/" + link;
    //alert(docPath);
    const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = docPath;
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
    debugger;
    var file = new Blob([data], { type: file_type });
    var fileURL = URL.createObjectURL(file);
    let path = fileURL;
    const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = path;
  }
  lgPopupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  clearFields() {
    (this.inputForm.get('txtConsultantName') as FormControl).setValue('');
    (this.inputForm.get('drpSpeciality') as FormControl).setValue("");
    (this.inputForm.get('txtDate') as FormControl).setValue('');
    (this.inputForm.get('txtClinicName') as FormControl).setValue('');
    (this.inputForm.get('txtDocument') as FormControl).setValue('');
    (this.inputForm.get('drpStatus') as FormControl).setValue('');
    (this.inputForm.get('txtMedicine') as FormControl).setValue('');
    (this.inputForm.get('txtReason') as FormControl).setValue('');
  }
}