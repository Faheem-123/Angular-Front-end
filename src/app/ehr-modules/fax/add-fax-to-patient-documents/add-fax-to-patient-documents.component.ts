import { Component, OnInit, Inject, ViewChild, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { GeneralService } from 'src/app/services/general/general.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMAddDocument } from 'src/app/models/patient/ORMAddDocument';
import { WrapperObjectSave } from 'src/app/models/general/wrapper-object-save';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { FaxService } from 'src/app/services/fax.service';

@Component({
  selector: 'add-fax-to-patient-documents',
  templateUrl: './add-fax-to-patient-documents.component.html',
  styleUrls: ['./add-fax-to-patient-documents.component.css']
})
export class AddFaxToPatientDocumentsComponent implements OnInit {

  @Input() faxId: string = "";
  @Input() faxDate: string = "";
  @Input() faxName: string = "";
  @Input() faxLink: string = "";


  @ViewChild('inlineAddFaxToDocPatSearch') inlineAddFaxToDocPatSearch: InlinePatientSearchComponent;

  addFaxToDocFormGroup: FormGroup;

  showPatientSearch: boolean = false;
  showDocCategorySearch: boolean = false;

  patientNameSearch: string = "";
  docCatName: string = "";

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private generalService: GeneralService,
    private ngbModal: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private faxService: FaxService) { }

  ngOnInit() {
    this.buildForm();
  }



  buildForm() {

    this.addFaxToDocFormGroup = this.formBuilder.group({
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null),
      txtDocCategoryIdHidden: this.formBuilder.control(null),
      txtDocName: this.formBuilder.control(this.faxName),
      txtNotes: this.formBuilder.control(null)

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
    this.inlineAddFaxToDocPatSearch.focusFirstIndex();
  }

  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");

    if (newValue !== this.patientNameSearch) {
      //this.patientNameIdSearch = undefined;
      this.addFaxToDocFormGroup.get("txtPatientIdHidden").setValue(null);
    }



  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientNameSearch == undefined && this.showPatientSearch == false) {
      this.patientNameSearch = undefined;
      this.addFaxToDocFormGroup.get("txtPatientSearch").setValue(null);
      this.addFaxToDocFormGroup.get("txtPatientIdHidden").setValue(null);
    }
    //this.patientId=undefined;
  }

  onPatientSelect(patObject: any) {

    debugger;
    this.logMessage.log(patObject);
    this.patientNameSearch = patObject.name;
    this.addFaxToDocFormGroup.get("txtPatientSearch").setValue(patObject.name);
    this.addFaxToDocFormGroup.get("txtPatientIdHidden").setValue(patObject.patient_id);
    this.showPatientSearch = false;

  }

  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }



  onDocCategorySelect(category: any) {

    debugger;
    this.docCatName = category.name;
    this.addFaxToDocFormGroup.get("txtDocCategoryIdHidden").setValue(category.id);
    this.showDocCategorySearch = false;
  }

  closeDocCategorySearch() {
    this.showDocCategorySearch = false;
  }

  openCateogrySearch() {
    this.showDocCategorySearch = true;
  }

  validateData(formData: any): boolean {

    let msg: string = "";
    if (this.faxLink == undefined || this.faxLink == '') {
      msg = "Fax file Not Found.";
    }
    else if (this.addFaxToDocFormGroup.get("txtPatientIdHidden").value == undefined || this.addFaxToDocFormGroup.get("txtPatientIdHidden").value == '') {
      msg = "Please select patient.";
    }
    else if (this.addFaxToDocFormGroup.get("txtDocCategoryIdHidden").value == undefined || this.addFaxToDocFormGroup.get("txtDocCategoryIdHidden").value == '') {
      msg = "Please select dcument category.";
    }
    else if (this.addFaxToDocFormGroup.get("txtDocName").value == undefined || this.addFaxToDocFormGroup.get("txtDocName").value == '') {
      msg = "Please enter dcument name.";
    }

    if (msg != undefined && msg != '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Add Fax to Documents', msg, AlertTypeEnum.DANGER)
      return false;
    }
    else {
      return true;
    }
  }



  onSave(formData: any) {

    if (this.validateData(formData)) {
      debugger;

      let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);

      let objNewDoc: ORMAddDocument = new ORMAddDocument();
      objNewDoc.patient_document_id = undefined;

      objNewDoc.doc_type = "fax_received"
      objNewDoc.doc_type_id = this.faxId;

      objNewDoc.document_date = this.faxDate;
      objNewDoc.original_file_name = this.faxLink.substring(this.faxLink.lastIndexOf("\\") + 1, this.faxLink.length);

      objNewDoc.patient_id = this.addFaxToDocFormGroup.get("txtPatientIdHidden").value;
      objNewDoc.doc_categories_id = this.addFaxToDocFormGroup.get("txtDocCategoryIdHidden").value;
      objNewDoc.name = this.addFaxToDocFormGroup.get("txtDocName").value;
      objNewDoc.comment = this.addFaxToDocFormGroup.get("txtNotes").value;

      objNewDoc.practice_id = this.lookupList.practiceInfo.practiceId;
      objNewDoc.created_user = this.lookupList.logedInUser.user_name;
      objNewDoc.modified_user = this.lookupList.logedInUser.user_name;
      objNewDoc.client_date_created = clientDateTime;
      objNewDoc.client_date_modified = clientDateTime;
      objNewDoc.system_ip = this.lookupList.logedInUser.systemIp;


      let lstKV: Array<ORMKeyValue> = new Array<ORMKeyValue>();
      lstKV.push(new ORMKeyValue('fax_link', this.faxLink));

      let wapperObjectSave: WrapperObjectSave = new WrapperObjectSave();
      wapperObjectSave.ormSave = objNewDoc;
      wapperObjectSave.lstKeyValue = lstKV;

      this.faxService.addFaxReceivedToPatientDocument(wapperObjectSave)
        .subscribe(
          data => this.savedSuccessfull(data),
          error => this.saveError(error)
        );
    }
  }


  savedSuccessfull(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Add Fax to Documents', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Add Fax to Documents', "An Error Occured while saving claim", AlertTypeEnum.DANGER)

  }


  onCancel() {
    this.activeModal.dismiss();
  }
}
