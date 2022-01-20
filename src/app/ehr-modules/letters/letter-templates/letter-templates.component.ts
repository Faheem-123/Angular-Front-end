import { Component, OnInit, Input, Inject, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { LetterService } from 'src/app/services/general/letter.service';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMLetterTemplate } from 'src/app/models/letter/ORMLetterTemplate';
import * as Quill from 'quill';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ORMLetterTemplateSection } from 'src/app/models/letter/ORMLetterTemplateSection';
import { ORMLetterTemplateSubSection } from 'src/app/models/letter/ORMLetterTemplateSubSection';
import { debug } from 'util';

@Component({
  selector: 'letter-templates',
  templateUrl: './letter-templates.component.html',
  styleUrls: ['./letter-templates.component.css']
})
export class LetterTemplatesComponent implements OnInit {

  @Output() backToLettersMain = new EventEmitter<any>();
  @Input() lstTemplateSectionsSettings: Array<any>;
  @Input() lstTemplateSubSectionsSettings: Array<any>;
  @Output() dataUpdated = new EventEmitter<any>();

  lstLetterTemplates: Array<any>;
  isLetterTemplate = true;
  lstTemplateSections: Array<any>;
  lstTemplateSubSections: Array<any>;

  acTemplateSections: Array<any>;
  acTemplateSubSections: Array<any>;

  isSelectedTempID;
  selected;
  editTemplateRecord: any;
  acTemplateSectionsSave: Array<ORMLetterTemplateSection>;
  acTemplateSubSectionsSave: Array<ORMLetterTemplateSubSection>;

  public lettertempTextEdit: AbstractControl;
  public lettertempTextView: AbstractControl;
  showHideLtrTemplate: Boolean = false;
  //showHideTemplate:Boolean = false;

  quilLetterTemplateEdit: FormGroup;
  quilLetterTemplateView: FormGroup;

  FrmLetterTemplate: FormGroup;

  isTemplateShow = false;
  istemplateAddEdit = false;
  showSavebtns: Boolean = false;
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private letterService: LetterService,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder) {
    this.quilLetterTemplateEdit = formBuilder.group({
      'lettertempTextEdit': [''],
    });

    this.lettertempTextEdit = this.quilLetterTemplateEdit.controls['lettertempTextView'];
    this.quilLetterTemplateEdit = formBuilder.group({
      'lettertempTextView': [''],
    });

    this.lettertempTextView = this.quilLetterTemplateEdit.controls['lettertempTextView'];

  }

  ngOnInit() {
    this.buildForm();

    this.getLetterTemplates();
    this.getLetterSections();
    this.getLetterSubSections();

    this.getLetterTemplateSections();
    this.getLetterTemplateSubSections();
  }
  buildForm() {
    this.FrmLetterTemplate = this.formBuilder.group({
      txt_TemplateName: this.formBuilder.control("", Validators.required),
      chkbox_includePatInfo: this.formBuilder.control("", Validators.required)
    })
  }
  //#region START
  backToLettersTemplate() {
    this.isLetterTemplate = true;
    this.getLetterTemplates();
    this.getLetterSections();
    this.getLetterSubSections();

    this.getLetterTemplateSections();
    this.getLetterTemplateSubSections();
  }
  onBackToTemplate() {
    this.backToLettersMain.emit();
  }
  onBacktoTemplatesFromSettings() {

    if (this.isLetterTemplate == true) {
      this.isLetterTemplate = false;
    } else {
      this.isLetterTemplate = true;
    }
  }
  onTemplateSetting() {

    this.isLetterTemplate = false;
  }
  onBackToSummary() {
    this.backToLettersMain.emit();
  }
  //#endregion END


  getLetterTemplates() {
    this.letterService.GetLetterTemplates(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        lstLetterTemplates: new Array();
        this.lstLetterTemplates = data as Array<any>;
        if (this.lstLetterTemplates)
          this.PopLetterTemplate(this.lstLetterTemplates[0]);
      },
      error => {
        return;
      }
    );
  }
  getLetterSections() {
    this.letterService.getLetterSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        lstTemplateSections: new Array();
        lstTemplateSectionsSettings: new Array();

        this.lstTemplateSections = data as Array<any>;
        this.lstTemplateSectionsSettings = data as Array<any>;

      },
      error => {
        return;
      }
    );
  }

  getLetterTemplateSections() {
    this.letterService.getLetterTemplateSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        acTemplateSections: new Array();
        this.acTemplateSections = data as Array<any>;
      },
      error => {
        return;
      }
    );
  }
  getLetterTemplateSubSections() {
    this.letterService.getLetterTemplateSubSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        acTemplateSubSections: new Array();
        this.acTemplateSubSections = data as Array<any>;
      },
      error => {
        return;
      }
    );
  }
  getLetterSubSections() {
    this.letterService.getLetterSubSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        lstTemplateSubSections: new Array();
        lstTemplateSubSectionsSettings: new Array();

        this.lstTemplateSubSections = data as Array<any>;
        this.lstTemplateSubSectionsSettings = data as Array<any>;
      },
      error => {
        return;
      }
    );
  }
  deleteSeletedTemplate(row) {

    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = row.template_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.letterService.deleteSelectedTemplate(deleteRecordData)
          .subscribe(
            data => this.onDeleteSeletedTemplate(data),
            error => alert(error),
            () => this.logMessage.log("Selected Header Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSeletedTemplate(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Letter Settings Header";
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      this.getLetterTemplates();
    }
  }
  PopLetterTemplate(value) {
    this.isSelectedTempID = value.template_id;
    this.editTemplateRecord = value;
    this.quilLetterTemplateView = this.formBuilder.group({
      'lettertempTextView': [value.text],
    });
    this.lettertempTextView = this.quilLetterTemplateView.controls['lettertempTextView'];

    // this.FrmLetterTemplates = this.formBuilder.group({
    //   'letterTemplate': ['<p>I am Example 02</p>'],
    // });
    // this.richAbstract = this.FrmLetterTemplates.controls['letterTemplate'];
    this.SetTemplateSectionsCheckList(value.template_id);
    this.SetTemplateSubSectionsCheckList(value.template_id);

    (this.FrmLetterTemplate.get("txt_TemplateName") as FormControl).setValue(value.name);
    (this.FrmLetterTemplate.get("chkbox_includePatInfo") as FormControl).setValue(value.add_patient_info);
    //this.FrmLetterTemplate.get("chkbox_includePatInfo").setValue(add_patient_info);
  }
  SetTemplateSectionsCheckList(template_id) {
    if (this.lstLetterTemplates == null)
      return;

    if (this.lstLetterTemplates != null && this.lstTemplateSections != null && this.lstTemplateSubSections != null) {
      for (var i = 0; i < this.lstTemplateSections.length; i++) {
        this.lstTemplateSections[i].template_section_id = "";
        this.lstTemplateSections[i].template_id = "";
        this.lstTemplateSections[i].created_user = "";
        this.lstTemplateSections[i].client_date_created = "";
        this.lstTemplateSections[i].date_created = "";
        this.lstTemplateSections[i].chk = false;

        for (var j = 0; j < this.acTemplateSections.length; j++) {
          //if (value.template_id == this.lstTemplateSections[j].section_id) {
          if (template_id == this.acTemplateSections[j].template_id && this.lstTemplateSections[i].section_id == this.acTemplateSections[j].section_id) {
            this.lstTemplateSections[i].template_section_id = this.acTemplateSections[j].template_section_id;
            this.lstTemplateSections[i].template_id = this.acTemplateSections[j].template_section_id;
            this.lstTemplateSections[i].created_user = this.acTemplateSections[j].created_user;
            this.lstTemplateSections[i].client_date_created = this.acTemplateSections[j].client_date_created;
            this.lstTemplateSections[i].date_created = this.acTemplateSections[j].date_created;
            this.lstTemplateSections[i].chk = true;
            break;
          }
        }

      }
      //this.lstTemplateSections.refresh();

    } else if (this.lstTemplateSections != null) {
      for (var k = 0; k < this.lstTemplateSections.length; k++) {
        this.lstTemplateSections[k].template_section_id = "";
        this.lstTemplateSections[k].template_id = "";
        this.lstTemplateSections[k].created_user = "";
        this.lstTemplateSections[k].client_date_created = "";
        this.lstTemplateSections[k].date_created = "";
        this.lstTemplateSections[k].chk = false;
      }

      //this.lstTemplateSections.refresh();
    }
  }
  SetTemplateSubSectionsCheckList(template_id) {

    if (this.lstLetterTemplates == null)
      return;

    if (this.lstLetterTemplates.length >= 0
      && this.lstTemplateSubSections != null && this.lstTemplateSubSections.length > 0
      && this.acTemplateSubSections != null && this.acTemplateSubSections.length > 0) {
      for (var i = 0; i < this.lstTemplateSubSections.length; i++) {
        this.lstTemplateSubSections[i].template_sub_section_id = "";
        this.lstTemplateSubSections[i].template_id = "";
        this.lstTemplateSubSections[i].created_user = "";
        this.lstTemplateSubSections[i].client_date_created = "";
        this.lstTemplateSubSections[i].date_created = "";
        this.lstTemplateSubSections[i].chk = false;

        for (var j = 0; j < this.acTemplateSubSections.length; j++) {
          if (template_id == this.acTemplateSubSections[j].template_id && this.lstTemplateSubSections[i].sub_section_id == this.acTemplateSubSections[j].sub_section_id) {
            this.lstTemplateSubSections[i].template_sub_section_id = this.acTemplateSubSections[j].template_sub_section_id;
            this.lstTemplateSubSections[i].template_id = this.acTemplateSubSections[j].template_id;
            this.lstTemplateSubSections[i].created_user = this.acTemplateSubSections[j].created_user;
            this.lstTemplateSubSections[i].client_date_created = this.acTemplateSubSections[j].client_date_created;
            this.lstTemplateSubSections[i].date_created = this.acTemplateSubSections[j].date_created;
            this.lstTemplateSubSections[i].chk = true;
            break;
          }
        }
      }
      //this.lstTemplateSubSections.refresh();
    }
    else if (this.lstTemplateSubSections != null) {
      for (var k = 0; k < this.lstTemplateSubSections.length; k++) {
        this.lstTemplateSubSections[k].template_sub_section_id = "";
        this.lstTemplateSubSections[k].template_id = "";
        this.lstTemplateSubSections[k].created_user = "";
        this.lstTemplateSubSections[k].client_date_created = "";
        this.lstTemplateSubSections[k].date_created = "";
        this.lstTemplateSubSections[k].chk = false;
      }

      //this.lstTemplateSubSections.refresh();
    }
  }
  //#region new/modifytemplate
  cancelAll() {
    this.showSavebtns = false;
    this.showHideLtrTemplate = false;
    this.quilLetterTemplateEdit = this.formBuilder.group({
      'lettertempTextEdit': [''],
    });
    this.lettertempTextEdit = this.quilLetterTemplateEdit.controls['lettertempTextEdit'];

    (this.FrmLetterTemplate.get("txt_TemplateName") as FormControl).setValue("");
    (this.FrmLetterTemplate.get("chkbox_includePatInfo") as FormControl).setValue(false);

    this.isTemplateShow = false;
    this.istemplateAddEdit = false;

    this.clearTemplateSectionCheckList();
    this.clearTemplateSubSectionCheckList();

    if (this.lstLetterTemplates)
      this.PopLetterTemplate(this.lstLetterTemplates[0]);
  }

  addNewTemplate() {
    //this.isTemplateEdit = false;
    this.isTemplateShow = true;
    this.istemplateAddEdit = false;
    this.showHideLtrTemplate = true;
    this.showSavebtns = true;
    this.clearTemplateSectionCheckList();
    this.clearTemplateSubSectionCheckList();

    (this.FrmLetterTemplate.get("txt_TemplateName") as FormControl).setValue("");
    (this.FrmLetterTemplate.get("chkbox_includePatInfo") as FormControl).setValue(false);
    this.quilLetterTemplateEdit = this.formBuilder.group({
      'lettertempTextEdit': [''],
    });
    this.lettertempTextEdit = this.quilLetterTemplateEdit.controls['lettertempTextEdit'];
  }
  modifyTemplate() {
    this.showSavebtns = true;
    this.isTemplateShow = true;
    this.istemplateAddEdit = true;
    this.showHideLtrTemplate = true;

    this.quilLetterTemplateEdit = this.formBuilder.group({
      'lettertempTextEdit': [this.editTemplateRecord.text],
    });
    this.lettertempTextEdit = this.quilLetterTemplateEdit.controls['lettertempTextEdit'];
    (this.FrmLetterTemplate.get("txt_TemplateName") as FormControl).setValue(this.editTemplateRecord.name);
    (this.FrmLetterTemplate.get("chkbox_includePatInfo") as FormControl).setValue(this.editTemplateRecord.add_patient_info);

  }
  //#endregion new/modifytemplate
  checkChkBoxSubSection(id, event) {


    for (var i = 0; i < this.lstTemplateSubSections.length; i++) {
      if (event == true) {
        if (this.lstTemplateSubSections[i].sub_section_id == id) {
          this.lstTemplateSubSections[i].chk = true;
          return;
        }
      } else if (event == false) {
        this.lstTemplateSubSections[i].chk = false;
        return;
      }

    }
  }
  checkChkBox(id, event) {


    if (this.isTemplateShow == false) {
      if (event == true) {
        (this.FrmLetterTemplate.get("chkbox_includePatInfo") as FormControl).setValue(false);
      } else {
        (this.FrmLetterTemplate.get("chkbox_includePatInfo") as FormControl).setValue(true);
      }
    }


    for (var i = 0; i < this.lstTemplateSections.length; i++) {
      if (event == true) {
        if (this.lstTemplateSections[i].section_id == id) {
          this.lstTemplateSections[i].chk = true;
          return;
        }
      } else if (event == false) {
        this.lstTemplateSections[i].chk = false;
        return;
      }

    }
  }

  //#region save
  saveTemplate() {
    // /ORMLetterTemplate
    if ((this.FrmLetterTemplate.get('txt_TemplateName') as FormControl).value == "") {
      alert("Please enter Template Name.");
      return;
    }
    var quill = new Quill('#templateRichEditorEdit', {
      theme: 'snow'
    });

    let strHtml = quill.root.innerHTML;
    let arrHtml = strHtml.split('<p>');
    let letterText = '';
    for (let p = 0; p < arrHtml.length; p++) {
      if (arrHtml[p].replace('</p>', '').trim() != '') {
        letterText += "<p>" + arrHtml[p].trim();
        letterText = letterText.replace('<p></p>', '');
      }
    }



    let ormSave: ORMLetterTemplate = new ORMLetterTemplate();
    if (this.istemplateAddEdit == false) {
      ormSave.created_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else if (this.istemplateAddEdit == true) {
      ormSave.template_id = this.editTemplateRecord.template_id;
      ormSave.created_user = this.editTemplateRecord.created_user;
      ormSave.client_date_created = this.editTemplateRecord.client_date_created;
      ormSave.date_created = this.editTemplateRecord.date_created;
    }
    ormSave.modified_user = this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    ormSave.name = (this.FrmLetterTemplate.get('txt_TemplateName') as FormControl).value;
    ormSave.text = letterText;// this.quilLetterTemplateEdit.controls.lettertempTextEdit.value;
    ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    ormSave.add_patient_info =  (this.FrmLetterTemplate.get('chkbox_includePatInfo') as FormControl).value == true ? true:(this.FrmLetterTemplate.get('chkbox_includePatInfo') as FormControl).value == false ? false: null;
    
    this.letterService.saveupdateLetterTemplate(ormSave)
      .subscribe(
        data => this.savedTemplateSuccessfull(data),
        error => alert(error),
        () => this.logMessage.log("Save letter Template.")
      );
  }
  savedTemplateSuccessfull(data) {
    this.showHideLtrTemplate = false;
    this.dataUpdated.emit(new ORMKeyValue("letter Template", "1"));
    this.SaveTemplateSections(data);
    this.SaveTemplateSubSections(data);

    this.getLetterSections();
    this.getLetterSubSections();
    this.getLetterTemplates();

    this.getLetterTemplateSections();
    this.getLetterTemplateSubSections();
  }
  SaveTemplateSubSections(data) {

    let objORM: ORMLetterTemplateSubSection = new ORMLetterTemplateSubSection();
    this.acTemplateSubSectionsSave = new Array();

    if (this.lstTemplateSubSections != null && this.lstTemplateSubSections.length > 0) {
      for (var i = 0; i < this.lstTemplateSubSections.length; i++) {
        // if cheched or unchecked.
        if (
          (
            this.lstTemplateSubSections[i].chk == true
            && (this.lstTemplateSubSections[i].template_sub_section_id == null || this.lstTemplateSubSections[i].template_sub_section_id == "")
          )
          ||
          (this.lstTemplateSubSections[i].chk == false
            && this.lstTemplateSubSections[i].template_sub_section_id != null
            && this.lstTemplateSubSections[i].template_sub_section_id != ""
          )
        ) {
          objORM = new ORMLetterTemplateSubSection();

          if (this.lstTemplateSubSections[i].template_sub_section_id != null && this.lstTemplateSubSections[i].template_sub_section_id != "") {
            objORM.template_sub_section_id = this.lstTemplateSubSections[i].template_sub_section_id;
            objORM.date_created = this.lstTemplateSubSections[i].date_created;
            objORM.client_date_created = this.lstTemplateSubSections[i].client_date_created;
            objORM.created_user = this.lstTemplateSubSections[i].created_user;
          }
          else {
            objORM.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
            objORM.created_user = this.lookupList.logedInUser.user_name;
          }

          objORM.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
          objORM.modified_user = this.lookupList.logedInUser.user_name;
          objORM.template_id = data.template_id;

          objORM.sub_section_id = this.lstTemplateSubSections[i].sub_section_id;
          objORM.practice_id = this.lookupList.practiceInfo.practiceId.toString();
          objORM.system_ip = this.lookupList.logedInUser.systemIp;

          if (this.lstTemplateSubSections[i].chk == true) {
            objORM.deleted = false;
          }
          else {
            objORM.deleted = true;
          }
          this.acTemplateSubSectionsSave.push(objORM);
        }
      }

      if (this.acTemplateSubSectionsSave.length > 0) {
        this.letterService.SaveTemplateSubSections(this.acTemplateSubSectionsSave)
          .subscribe(
            data => this.savedSubSectionSuccessfull(),
            error => alert(error),
            () => this.logMessage.log("Save sub section.")
          );
      }
    }
  }
  savedSubSectionSuccessfull() {

  }
  SaveTemplateSections(data) {

    let objORM: ORMLetterTemplateSection = new ORMLetterTemplateSection();
    this.acTemplateSectionsSave = new Array();
    if (this.lstTemplateSections != null && this.lstTemplateSections.length > 0) {
      for (var i = 0; i < this.lstTemplateSections.length; i++) {
        // if cheched or unchecked.
        if (
          (
            this.lstTemplateSections[i].chk == true
            && (this.lstTemplateSections[i].template_section_id == null || this.lstTemplateSections[i].template_section_id == "")
          )
          ||
          (this.lstTemplateSections[i].chk == false
            && this.lstTemplateSections[i].template_section_id != null
            && this.lstTemplateSections[i].template_section_id != ""
          )
        ) {
          objORM = new ORMLetterTemplateSection();
          if (this.lstTemplateSections[i].template_section_id != null && this.lstTemplateSections[i].template_section_id != "") {
            objORM.template_section_id = this.lstTemplateSections[i].template_section_id;
            objORM.date_created = this.lstTemplateSections[i].date_created;
            objORM.client_date_created = this.lstTemplateSections[i].client_date_created;
            objORM.created_user = this.lstTemplateSections[i].created_user;
          }
          else {
            objORM.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
            objORM.created_user = this.lookupList.logedInUser.user_name;
          }
          objORM.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
          objORM.modified_user = this.lookupList.logedInUser.user_name;
          //objORM.template_id=this.editTemplateRecord.template_id;
          objORM.template_id = data.template_id;
          objORM.section_id = this.lstTemplateSections[i].section_id;
          objORM.practice_id = this.lookupList.practiceInfo.practiceId.toString();
          objORM.system_ip = this.lookupList.logedInUser.systemIp;
          if (this.lstTemplateSections[i].chk == true) {
            objORM.deleted = false;
          }
          else {
            objORM.deleted = true;
          }
          this.acTemplateSectionsSave.push(objORM);
        }
      }

      if (this.acTemplateSectionsSave.length > 0) {
        this.letterService.SaveTemplateSections(this.acTemplateSectionsSave)
          .subscribe(
            data => this.SaveTemplateSectionsSuccessfull(),
            error => alert(error),
            () => this.logMessage.log("Save template section checkbox.")
          );
      }
    }
  }
  SaveTemplateSectionsSuccessfull() {

  }
  //#endregion save

  //#region enabledisable
  // checkNewEdit(event){
  //   
  //   if(this.isTemplateEdit == false){
  //     if(event==true){
  //       (this.FrmLetterTemplate.get("chkbox_includePatInfo") as FormControl).setValue(false);
  //     }else{
  //       (this.FrmLetterTemplate.get("chkbox_includePatInfo") as FormControl).setValue(true);
  //     }
  //   }
  // }
  //#endregion enabledisable


  clearTemplateSectionCheckList() {
    if (this.lstTemplateSections != null) {
      for (var k = 0; k < this.lstTemplateSections.length; k++) {
        this.lstTemplateSections[k].template_section_id = "";
        this.lstTemplateSections[k].template_id = "";
        this.lstTemplateSections[k].created_user = "";
        this.lstTemplateSections[k].client_date_created = "";
        this.lstTemplateSections[k].date_created = "";
        this.lstTemplateSections[k].chk = false;
      }
    }
  }
  clearTemplateSubSectionCheckList() {
    if (this.lstTemplateSubSections != null) {
      for (var k = 0; k < this.lstTemplateSubSections.length; k++) {
        this.lstTemplateSubSections[k].template_sub_section_id = "";
        this.lstTemplateSubSections[k].template_id = "";
        this.lstTemplateSubSections[k].created_user = "";
        this.lstTemplateSubSections[k].client_date_created = "";
        this.lstTemplateSubSections[k].date_created = "";
        this.lstTemplateSubSections[k].chk = false;
      }
    }
  }
}