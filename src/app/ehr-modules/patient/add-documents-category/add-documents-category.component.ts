import { Component, OnInit, Inject } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ORMSaveDocCategory } from 'src/app/models/patient/orm-save-doc-category';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { PatientService } from 'src/app/services/patient/patient.service';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'app-add-documents-category',
  templateUrl: './add-documents-category.component.html',
  styleUrls: ['./add-documents-category.component.css']
})
export class AddDocumentsCategoryComponent implements OnInit {
  patientID = "";
  parentCategory = "";
  editCategoryID = "";
  editCategoryName = "";
  isDefaultCategory = "";
  isEdit = "false";
  parentCategoryID = "";

  showhideChkBox: boolean = false;
  docCategoryForm: FormGroup;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    public activeModal: NgbActiveModal,
    private patientService: PatientService,
    private modalService: NgbModal,
    private generalOperation: GeneralOperation,
    private dateTimeUtil: DateTimeUtil,
    private formBuilder: FormBuilder) { }

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  ngOnInit() {
    this.buildForm();
    debugger;
    if (this.isEdit == "true") {
      (this.docCategoryForm.get('txtcategoryname') as FormControl).setValue(this.editCategoryName);
      if (this.isDefaultCategory == "true") {
        (this.docCategoryForm.get("chk_detaultCategory") as FormControl).setValue(true);
      } else {
        (this.docCategoryForm.get("chk_detaultCategory") as FormControl).setValue(false);
      }
    }
  }
  buildForm() {
    this.docCategoryForm = this.formBuilder.group({
      txtcategoryname: this.formBuilder.control(""),
      chk_detaultCategory: this.formBuilder.control("")
    })
  }
  saveDocCategory() {
    debugger;
    let ormSave: ORMSaveDocCategory = new ORMSaveDocCategory();
    ormSave.category_name = (this.docCategoryForm.get('txtcategoryname') as FormControl).value;
    ormSave.is_default_category = (this.docCategoryForm.get('chk_detaultCategory') as FormControl).value;
    ormSave.parent_category = this.parentCategoryID; //selected category id
    ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    if (this.isEdit == "false") {
      ormSave.created_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else if (this.isEdit == "true") {
      var objacDocCategories = this.generalOperation.filterArray(this.lookupList.lstDocumentCategory, "document_categories_id", this.editCategoryID);
      if (objacDocCategories != null && objacDocCategories.length > 0) {
        ormSave.document_categories_id = this.editCategoryID;
        ormSave.created_user = objacDocCategories[0].created_user;
        ormSave.client_date_created = objacDocCategories[0].client_date_created;
        ormSave.date_created = objacDocCategories[0].date_created;
      }
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    }
    this.patientService.addEditDocCategory(ormSave)
      .subscribe(
        data => {
          this.activeModal.close();
        },
        error => {
          this.showError("An error occured while saving Documents Category.");
        }
      );
  }
  showError(errMsg) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Error";
    modalRef.componentInstance.promptMessage = errMsg;
    modalRef.componentInstance.alertType = "error";
    let closeResult;
    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
    return;
  }
}