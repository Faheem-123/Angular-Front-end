import { ORMAddDocument } from './../../models/patient/orm-add-document';
import { LogMessage } from './../../shared/log-message';
import { GeneralService } from './../../services/general/general.service';
import { DateTimeUtil, DateTimeFormat } from './../../shared/date-time-util';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { LookupList, LOOKUP_LIST } from '../../providers/lookupList.module';
import { FileValidator } from '../../shared/fileValidator';
import { DateModel } from 'src/app/models/general/date-model';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ListFilterGeneralNotIn } from 'src/app/shared/filter-pipe-general-not-in';
import { TreeComponent } from 'angular-tree-component';


@Component({
  selector: 'file-upload-popup',
  templateUrl: './file-upload-popup.component.html',
  styleUrls: ['./file-upload-popup.component.css']
})
export class FileUploadPopupComponent implements OnInit {
  @Input() patientId: number;


  callingFrom: string = '';
  btnUpload = "Upload";
  fileUploadForm: FormGroup;
  fileAttached: any;
  errorMessage: string;
  operation: string = '';
  docCategory: string = '';
  selectedDocObj: any;
  documentDate: string;
  documentDateObject: DateModel;
  //lstCategory;
  showDocCategorySearch: boolean = false;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private generalService: GeneralService,
    private modalService: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    // private datePipe: DatePipe,
    private logMessage: LogMessage,
    private generalOperation: GeneralOperation) { }

  ngOnInit() {
    /*
    if (this.lookupList.lstCategoriesTree == undefined || this.lookupList.lstCategoriesTree.length == 0) {
      this.lookupList.lstCategoriesTree = this.generalOperation.createDocumentCategory(this.lookupList.lstDocumentCategory);
    }
    let filterObj: any = { id: "lab" };
    this.lstTreeCategoriesMain = new ListFilterGeneralNotIn().transform(this.lookupList.lstCategoriesTree, filterObj);
*/


    debugger;
    this.buildForm();
    if (this.callingFrom.toLowerCase() == "communication") {
      this.btnUpload = "Ok";
    }
    if (this.operation === "Edit") {
      //Assign Values
      if (this.selectedDocObj.document_date != null && this.selectedDocObj.document_date != undefined) {
        this.documentDate = this.selectedDocObj.document_date;
        this.documentDateObject = this.dateTimeUtil.getDateModelFromDateString(this.selectedDocObj.document_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

      }
      else {
        this.documentDate = null;
        this.documentDateObject = null;
      }

      this.docCatName = this.selectedDocObj.category_name;
      (this.fileUploadForm.get('txtDate') as FormControl).setValue(this.documentDateObject);
      //(this.fileUploadForm.get('txtFile') as FormControl).setValue(this.selectedDocObj.name);
      (this.fileUploadForm.get('txtComments') as FormControl).setValue(this.selectedDocObj.comment);
      (this.fileUploadForm.get('txtDocCategoryIdHidden') as FormControl).setValue(this.selectedDocObj.doc_categories_id);
    } else {
      (this.fileUploadForm.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getCurrentDateModel());
    }
  }
  buildForm() {
    this.fileUploadForm = this.formBuilder.group({
      txtFile: this.formBuilder.control(null, this.operation == "Edit" ? null : Validators.required),
      txtDate: this.formBuilder.control(null),
      txtComments: this.formBuilder.control(null),
      txtDocCategoryIdHidden: this.formBuilder.control(null,Validators.required)
    }//,
      // {
      //   validator : Validators.compose([
      //     .validDate('ctrDocDate')
      //   ]) 
      // }
    )
  }
  cancelAddDocument() {
    this.activeModal.dismiss();
  }

  selectedDocName: string = "";
  onFileChange(event) {

    debugger;
    this.fileAttached = undefined;

    let reader = new FileReader();

    if (event.target.files && event.target.files.length > 0) {
      this.fileAttached = event.target.files[0];
      this.selectedDocName = this.fileAttached.name;
    }
    else {
      this.selectedDocName = "";
    }

  }
  private objNewDoc: ORMAddDocument;
  onSubmit(docDetail) {

    debugger;
    if (this.docRemove == true && this.operation == "Edit" && (this.fileAttached == null || this.fileAttached == undefined)) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Document Upload', 'Please select the file to upload', 'warning');
      return;
    }

    this.objNewDoc = new ORMAddDocument();
    this.objNewDoc.patient_id = this.patientId;
    this.objNewDoc.practice_id = this.lookupList.practiceInfo.practiceId;

    //let docDate= String("00" + docDetail.txtDate.month).slice(-2) +'/'+String("00" + docDetail.txtDate.day).slice(-2) +'/'+ docDetail.txtDate.year ;
    //this.objNewDoc.document_date=this.dateTimeUtil.getDateTimeString(docDate,DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    let docDate = this.dateTimeUtil.getStringDateFromDateModel(docDetail.txtDate);
    if (docDate != "") {
      this.objNewDoc.document_date = docDate;
    } else {
      this.objNewDoc.document_date = "";
    }

    if (this.operation === "Edit") {
      if (this.fileAttached != null && this.fileAttached != undefined) {
        this.objNewDoc.original_file_name = this.fileAttached.name;
        this.objNewDoc.name = this.fileAttached.name;
      }
      else {
        this.objNewDoc.original_file_name = this.selectedDocObj.original_file_name;
        this.objNewDoc.name = this.selectedDocObj.name;
      }
    }
    else {
      if (this.fileAttached != null && this.fileAttached != undefined) {
        this.objNewDoc.original_file_name = this.fileAttached.name;
        this.objNewDoc.name = this.fileAttached.name;
      }
    }
    this.objNewDoc.comment = docDetail.txtComments;
    this.objNewDoc.doc_categories_id = docDetail.txtDocCategoryIdHidden;

    this.objNewDoc.modified_user = this.lookupList.logedInUser.user_name;
    this.objNewDoc.client_date_modified = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);

    this.objNewDoc.system_ip = this.lookupList.logedInUser.systemIp;

    if (this.operation === 'New') {
      this.objNewDoc.patient_document_id = undefined;
      this.objNewDoc.created_user = this.lookupList.logedInUser.user_name;
      this.objNewDoc.client_date_created = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
    }
    else {
      this.objNewDoc.patient_document_id = this.selectedDocObj.patient_document_id;
      this.objNewDoc.created_user = this.selectedDocObj.created_user;
      this.objNewDoc.client_date_created = this.selectedDocObj.client_date_created;
      this.objNewDoc.link = this.selectedDocObj.link;
    }
    const formData: FormData = new FormData();
    //if(this.fileAttached!=null && this.fileAttached!=undefined)
    {
      formData.append('docFile', this.fileAttached);
    }
    // else
    //   formData.append('docFile',null);

    formData.append('docData', JSON.stringify(this.objNewDoc));
    formData.append('docCategory', this.docCategory);
    debugger;
    if (this.callingFrom.toLowerCase() == "communication") {
      this.activeModal.close(formData);
    } else {
      this.generalService.savePatientDocument(formData)
        .subscribe(
          data => this.savedSuccessfull(data),
          error => alert(error),
          () => this.logMessage.log("Document Save Successfull.")
        );
    }
  }

  savedSuccessfull(data) {
    if (data.status === "SUCCESS") {
      this.activeModal.close(true);
    }
    else {
      console.log(data.error_message);
      //this.errorMessage=data.error_message;
    }
  }
  docRemove = false;
  onDocRemove() {
    //this.selectedDocObj.original_file_name=null;
    //this.selectedDocObj.name=null;    
    this.docRemove = true;
    this.fileUploadForm.controls['txtFile'].setValidators([Validators.required]);
  }


  docCatName: string = "";

  onDocCategorySelect(category: any) {

    debugger;
    this.docCatName = category.name;
    this.fileUploadForm.get("txtDocCategoryIdHidden").setValue(category.id);
    this.showDocCategorySearch = false;
    /*
    this.logMessage.log(patObject);    
    this.patientNameSearch = patObject.name;
    this.faxSentSearchFormGroup.get("txtPatientSearch").setValue(patObject.name);
    this.faxSentSearchFormGroup.get("txtPatientIdHidden").setValue(patObject.patient_id);
    this.showPatientSearch = false;
    */

  }

  closeDocCategorySearch() {
    this.showDocCategorySearch = false;
  }

  openCateogrySearch() {
    this.showDocCategorySearch = true;
  }
}
