import { Component, OnInit, Input, Inject, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { LetterService } from 'src/app/services/general/letter.service';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import * as Quill from 'quill';
import { ORMLetterHeaders } from 'src/app/models/letter/ORMLetterHeaders';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ORMLetterSections } from 'src/app/models/letter/ORMLetterSections';
import { ORMLetterSubSections } from 'src/app/models/letter/ORMLetterSubSections';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'letter-templates-settings',
  templateUrl: './letter-templates-settings.component.html',
  styleUrls: ['./letter-templates-settings.component.css']
})
export class LetterTemplatesSettingsComponent implements OnInit {

  @Output() backToLettersTemplate = new EventEmitter<any>();
  @Input() lstTemplateSections: Array<any>;
  @Output() dataUpdated = new EventEmitter<any>();
  
  isAddEditHeader:Boolean = false;
  isEditHeader:Boolean = false;
  //editHeaderRowID = "";
  editHeaderRow:any;
  
  isAddEditSection:Boolean = false;
  isEditSection:Boolean = false;
  editSectionRow:any;

  isAddEditSubSection:Boolean = false;
  isEditSubSection:Boolean = false;
  editSubSectionRow:any;

  frmLetterHeader:FormGroup;
  quilLetterHeaderEdit:FormGroup;
  quilLetterHeaderView:FormGroup;
  
  frmLetterSection:FormGroup;
  quilLetterSectionEdit:FormGroup;
  quilLetterSectionView:FormGroup;

  frmLetterSubSection:FormGroup;
  quilLetterSubSectionEdit:FormGroup;
  quilLetterSubSectionView:FormGroup;

  public headerTextEdit: AbstractControl;
  public headerTextView: AbstractControl;

  public sectionTextEdit: AbstractControl;
  public sectionTextView: AbstractControl;

  public subSectionTextEdit: AbstractControl;
  public subSectionTextView: AbstractControl;

  lstTemplateSectionsSettings=true;
  lstLetterHeadersSetup: Array<any>;
  lstLetterSectionsSetup: Array<any>;
  lstLetterSubSectionsSetup: Array<any>;

  showHideHeadder:Boolean = false; // show hide view and edit editors.
  isSelectedHeaderID; //to select n highlight headder row
  showHideSections:Boolean = false; // show hide view and edit sections
  isSelectedSectionID; // select row
  showHideSubSections:Boolean = false;
  isSelectedSubSectionID;

  public onReady( editor ) {
      editor.ui.view.editable.element.parentElement.insertBefore(
          editor.ui.view.toolbar.element,
          editor.ui.view.editable.element
      );
  }

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private letterService: LetterService,
  private formBuilder: FormBuilder,
  private modalService: NgbModal,
  private logMessage: LogMessage,
  private dateTimeUtil: DateTimeUtil) { 
    this.quilLetterHeaderEdit = formBuilder.group({
      'headerTextEdit': [''],
    });
    this.headerTextEdit = this.quilLetterHeaderEdit.controls['headerTextEdit'];
    this.quilLetterHeaderEdit = formBuilder.group({
      'headerTextView': [''],
    });
    this.headerTextView = this.quilLetterHeaderEdit.controls['headerTextView'];
    

    this.quilLetterSectionEdit = formBuilder.group({
      'sectionTextEdit': [''],
    });
    this.sectionTextEdit = this.quilLetterSectionEdit.controls['sectionTextEdit'];
    this.quilLetterSectionEdit = formBuilder.group({
      'sectionTextView': [''],
    });
    this.sectionTextView = this.quilLetterSectionEdit.controls['sectionTextView'];
    

    this.quilLetterSubSectionEdit = formBuilder.group({
      'subSectionTextEdit': [''],
    });
    this.subSectionTextEdit = this.quilLetterSubSectionEdit.controls['subSectionTextEdit'];
    this.quilLetterSubSectionEdit = formBuilder.group({
      'subSectionTextView': [''],
    });
    this.subSectionTextView = this.quilLetterSubSectionEdit.controls['subSectionTextView'];
  }

  ngOnInit() {
    debugger;
    this.buildForm();
    this.getSettingsLetterHeaders();
    this.getSettingsLetterSections();
    this.getSettingsLetterSubSections();
  }
  buildForm(){
    debugger;
    this.frmLetterHeader = this.formBuilder.group({
      txt_HeaderName: this.formBuilder.control(null)
    })
    this.frmLetterSection = this.formBuilder.group({
      txt_sectionName: this.formBuilder.control(null)
    })
    this.frmLetterSubSection = this.formBuilder.group({
      txt_subSectionName: this.formBuilder.control(null)
    })
    debugger;
  }
  //#region Startgetformdata
  getSettingsLetterHeaders(){
    this.letterService.getSettingsLetterHeaders(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        lstLetterHeadersSetup: new Array();
        this.lstLetterHeadersSetup = data as Array<any>;
        if(this.lstLetterHeadersSetup.length>0){
          this.headerChange(this.lstLetterHeadersSetup[0]);
        }
      },
      error => {
        return;
      }
    );
  }
  getSettingsLetterSections(){
    this.letterService.getSettingsLetterSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        lstLetterSectionsSetup: new Array();
        this.lstLetterSectionsSetup = data as Array<any>;
        if(this.lstLetterSectionsSetup.length>0){
          this.sectionChange(this.lstLetterSectionsSetup[0]);
        }
      },
      error => {
        return;
      }
    );
  }
  getSettingsLetterSubSections(){
    this.letterService.getSettingsLetterSubSections(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        lstLetterSubSectionsSetup: new Array();
        this.lstLetterSubSectionsSetup = data as Array<any>;
        if(this.lstLetterSubSectionsSetup.length>0){
          this.subSectionChange(this.lstLetterSubSectionsSetup[0]);
        }
      },
      error => {
        return;
      }
    );
  }
  //#region ENDgetformdata
  
  //#region  Header
  editHeader(row){
    debugger;
    this.showHideHeadder = true;
    this.editHeaderRow = row;
    this.isAddEditHeader=true;
    this.isEditHeader = true;
    //this.editHeaderRowID = row.header_id;
    this.quilLetterHeaderEdit = this.formBuilder.group({
      'headerTextEdit': [row.text],
    });
    this.headerTextEdit = this.quilLetterHeaderEdit.controls['headerTextEdit'];
    (this.frmLetterHeader.get("txt_HeaderName") as FormControl).setValue(row.name);
  }
  addNewHeader(){
    this.showHideHeadder = true;
    this.isAddEditHeader=true;
    this.isEditHeader = false;
    (this.frmLetterHeader.get("txt_HeaderName") as FormControl).setValue("");
    this.quilLetterHeaderEdit = this.formBuilder.group({
      'headerTextEdit': [''],
    });
    this.headerTextEdit = this.quilLetterHeaderEdit.controls['headerTextEdit'];
  }
   saveHeader(){
     debugger;
     if ((this.frmLetterHeader.get('txt_HeaderName') as FormControl).value == "") {
       alert("Please enter header Name.");
       return;
     }
     var quill = new Quill('#headerRichEditorEdit', {
       theme: 'snow'
     });
     if(quill.getText().trim()==""){
       alert("Please enter header body.");
       return;
     }
     let ormSave: ORMLetterHeaders = new ORMLetterHeaders();
     if(this.isEditHeader == false)
	 			{
	 				ormSave.created_user=this.lookupList.logedInUser.user_name;
           ormSave.client_date_created= this.dateTimeUtil.getCurrentDateTimeString();
           ormSave.header_id = "";
	 			}
	 			 else if(this.isEditHeader == true)
	 			 {
	 			 	ormSave.header_id = this.editHeaderRow.header_id;
	 			 	ormSave.created_user = this.editHeaderRow.created_user;
	 			 	ormSave.client_date_created = this.editHeaderRow.client_date_created;
	 			 	ormSave.date_created = this.editHeaderRow.date_created;
	 			 }
	 			 ormSave.modified_user = this.lookupList.logedInUser.user_name;
	 			 ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
	 			 ormSave.name = (this.frmLetterHeader.get('txt_HeaderName') as FormControl).value;
	 			 ormSave.text = this.quilLetterHeaderEdit.value.headerTextEdit;		
	 			 ormSave.system_ip = this.lookupList.logedInUser.systemIp;
	 			 ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    
          debugger;
      this.letterService.saveupdateLetterHeader(ormSave)
      .subscribe(
        data => this.savedSuccessfull(),
        error => alert(error),
        () => this.logMessage.log("Save letter header.")
      );
   }
   savedSuccessfull() {
    debugger;
    this.dataUpdated.emit(new ORMKeyValue("letter setting header", "1"));
    this.quilLetterHeaderEdit = this.formBuilder.group({
      'headerTextEdit': [''],
    });
    this.headerTextEdit = this.quilLetterHeaderEdit.controls['headerTextEdit'];
    this.cancelHeader();
    this.getSettingsLetterHeaders();
    //this.getSettingsLetterHeaders();
  }
  cancelHeader(){
    //this.editHeaderRowID = "";
    (this.frmLetterHeader.get("txt_HeaderName") as FormControl).setValue("");
    this.quilLetterHeaderEdit = this.formBuilder.group({
      'headerTextEdit': [''],
    });
    this.headerTextEdit = this.quilLetterHeaderEdit.controls['headerTextEdit'];

    this.isAddEditHeader=false;
    this.isEditHeader = false;
    this.showHideHeadder = false;
    this.headerChange(this.lstLetterHeadersSetup[0]);
  }
  deleteSeletedHeader(row){
    debugger;
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = row.header_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.letterService.deleteSelectedHeader(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSelectedHeader(data),
          error => alert(error),
          () => this.logMessage.log("Selected Header Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSelectedHeader(data) {
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
      this.getSettingsLetterHeaders();
    }
  }
  //#endregion Header
  
  headerChange(value){
    debugger;
    this.isSelectedHeaderID = value.header_id;
    this.quilLetterHeaderView = this.formBuilder.group({
      'headerTextView': [value.text],
    });
    this.headerTextView = this.quilLetterHeaderView.controls['headerTextView'];
    (this.frmLetterHeader.get("txt_HeaderName") as FormControl).setValue(value.name);
  }
  sectionChange(row){
    debugger;
    this.isSelectedSectionID = row.section_id;
    this.quilLetterSectionView = this.formBuilder.group({
      'sectionTextView': [row.section_text],
    });
    this.sectionTextView = this.quilLetterSectionView.controls['sectionTextView'];
    (this.frmLetterSection.get("txt_sectionName") as FormControl).setValue(row.section_name);
  }
  subSectionChange(row){
    debugger;
    this.isSelectedSubSectionID = row.sub_section_id;
    this.quilLetterSubSectionView = this.formBuilder.group({
      'subSectionTextView': [row.sub_section_text],
    });
    this.subSectionTextView = this.quilLetterSubSectionView.controls['subSectionTextView'];
    (this.frmLetterSubSection.get("txt_subSectionName") as FormControl).setValue(row.sub_section_name);
  }
  onBacktoTemplatesFromSettings(){
    this.showHideHeadder = false;
    this.backToLettersTemplate.emit();
  }

//#region Section
editSection(result){
  this.showHideSections = true;
  this.isAddEditSection = true;
  this.isEditSection = true;
  this.editSectionRow = result;
  this.quilLetterSectionEdit = this.formBuilder.group({
    'sectionTextEdit': [result.section_text],
  });
  this.sectionTextEdit = this.quilLetterSectionEdit.controls['sectionTextEdit'];
  (this.frmLetterSection.get("txt_sectionName") as FormControl).setValue(result.section_name);
}
cancelSection(){
  (this.frmLetterSection.get("txt_sectionName") as FormControl).setValue("");
  this.quilLetterSectionEdit = this.formBuilder.group({
    'sectionTextEdit': [''],
  });
  this.sectionTextEdit = this.quilLetterSectionEdit.controls['sectionTextEdit'];

  this.isAddEditSection=false;
  this.isEditSection = false;
  this.showHideSections = false;
  this.sectionChange(this.lstLetterSectionsSetup[0]);
}
addNewSection(){
  this.isAddEditSection=true;
  this.isEditSection = false;
  this.showHideSections = true;
  (this.frmLetterSection.get("txt_sectionName") as FormControl).setValue("");
  this.quilLetterSectionEdit = this.formBuilder.group({
    'sectionTextEdit': [''],
  });
  this.sectionTextEdit = this.quilLetterSectionEdit.controls['sectionTextEdit'];
}
saveSection(){
  debugger;
  if ((this.frmLetterSection.get('txt_sectionName') as FormControl).value == "") {
    alert("Please enter Section Name.");
    return;
  }
  var quill = new Quill('#sectionRichEditorEdit', {
    theme: 'snow'
  });
  if(quill.getText().trim()==""){
    alert("Please enter section body.");
    return;
  }
        let ormSection: ORMLetterSections = new ORMLetterSections();
        if(this.isEditSection == false){
          ormSection.created_user = this.lookupList.logedInUser.user_name;
          ormSection.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        }else if(this.isEditSection == true){
					ormSection.section_id = this.editSectionRow.section_id;
					ormSection.created_user = this.editSectionRow.created_user;
					ormSection.client_date_created = this.editSectionRow.client_date_created;
					ormSection.date_created = this.editSectionRow.date_created;
				}
				ormSection.modified_user = this.lookupList.logedInUser.user_name;
				ormSection.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        
        ormSection.section_name = (this.frmLetterSection.get('txt_sectionName') as FormControl).value;
        debugger;
        ormSection.section_text = this.quilLetterSectionEdit.controls.sectionTextEdit.value;
				ormSection.system_ip = this.lookupList.logedInUser.systemIp;
        ormSection.practice_id = this.lookupList.practiceInfo.practiceId.toString();

        this.letterService.saveupdateLetterSection(ormSection)
        .subscribe(
          data => this.savedSectionSuccessfull(),
          error => alert(error),
          () => this.logMessage.log("Save letter section.")
        );
}
savedSectionSuccessfull() {
  debugger;
  this.dataUpdated.emit(new ORMKeyValue("letter setting section", "1"));
  this.cancelSection();
  this.getSettingsLetterSections();
}
deleteSeletedSection(row){
  {
    
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = row.section_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.letterService.deleteSelectedSection(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSelectedSection(data),
          error => alert(error),
          () => this.logMessage.log("Selected Section Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
}
onDeleteSelectedSection(data) {
  if (data.status === ServiceResponseStatusEnum.ERROR) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Letter Settings Section";
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
    this.getSettingsLetterSections();
  }
}
//#endregion Section

//#region  SubSection
editSubSection(result){
  debugger;
  this.showHideSubSections = true;
  this.isAddEditSubSection = true;
  this.isEditSubSection = true;
  this.editSubSectionRow = result;
  this.quilLetterSubSectionEdit = this.formBuilder.group({
    'subSectionTextEdit': [result.sub_section_text],
  });
  this.subSectionTextEdit = this.quilLetterSubSectionEdit.controls['subSectionTextEdit'];
  (this.frmLetterSubSection.get("txt_subSectionName") as FormControl).setValue(result.sub_section_name);
}
cancelSubSection(){
  (this.frmLetterSubSection.get("txt_subSectionName") as FormControl).setValue("");
  this.quilLetterSubSectionEdit = this.formBuilder.group({
    'subSectionTextEdit': [''],
  });
  this.subSectionTextEdit = this.quilLetterSubSectionEdit.controls['subSectionTextEdit'];

  this.isAddEditSubSection=false;
  this.isEditSubSection = false;
  this.showHideSubSections = false;
}
addNewSubSection(){
  this.isAddEditSubSection=true;
  this.isEditSubSection = false;
  this.showHideSubSections = true;
  (this.frmLetterSubSection.get("txt_subSectionName") as FormControl).setValue("");
  this.quilLetterSubSectionEdit = this.formBuilder.group({
    'subSectionTextEdit': [''],
  });
  this.subSectionTextEdit = this.quilLetterSubSectionEdit.controls['subSectionTextEdit'];
}
deleteSeletedSubSection(row){
      const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
      modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
      let closeResult;
  
      modalRef.result.then((result) => {
  
        if (result == PromptResponseEnum.YES) {
          debugger;
          let deleteRecordData = new ORMDeleteRecord();
          deleteRecordData.column_id = row.sub_section_id.toString();
          deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
          deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
          deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
  
          this.letterService.deleteSeletedSubSection(deleteRecordData)
            .subscribe(            
            data => this.onDeleteSubSelectedSection(data),
            error => alert(error),
            () => this.logMessage.log("Selected Section Deleted Successfull.")
            );
        }
      }, (reason) => {
        //alert(reason);
      });
    }
  onDeleteSubSelectedSection(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Letter Settings Sub Section";
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
      this.getSettingsLetterSubSections();
    }
  }
saveSubSection(){
  if ((this.frmLetterSubSection.get('txt_subSectionName') as FormControl).value == "") {
    alert("Please enter Sub Section Name.");
    return;
  }
  var quill = new Quill('#subSectionRichEditorEdit', {
    theme: 'snow'
  });
  if(quill.getText().trim()==""){
    alert("Please enter Sub Section body.");
    return;
  }

        var objORM:ORMLetterSubSections=new ORMLetterSubSections();
        
				if(this.isEditSubSection == false)
				{
					objORM.created_user = this.lookupList.logedInUser.user_name;
					objORM.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
				}
				else if(this.isEditSubSection == true)
				{
					objORM.sub_section_id = this.editSubSectionRow.sub_section_id;
					objORM.created_user = this.editSubSectionRow.created_user;
					objORM.client_date_created = this.editSubSectionRow.client_date_created;
					objORM.date_created = this.editSubSectionRow.date_created;
        }
        
				objORM.modified_user = this.lookupList.logedInUser.user_name;
				objORM.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
				debugger;
				objORM.sub_section_name = (this.frmLetterSubSection.get('txt_subSectionName') as FormControl).value;
				objORM.sub_section_text = this.quilLetterSubSectionEdit.controls.subSectionTextEdit.value;
				objORM.system_ip = this.lookupList.logedInUser.systemIp;
				objORM.practice_id = this.lookupList.practiceInfo.practiceId.toString();

        this.letterService.saveupdateLetterSubSection(objORM)
        .subscribe(
          data => this.savedSubSectionSuccessfull(),
          error => alert(error),
          () => this.logMessage.log("Save letter subsection.")
        );
}
savedSubSectionSuccessfull() {
  debugger;
  this.dataUpdated.emit(new ORMKeyValue("letter setting subsection", "1"));
  this.cancelSubSection();
  this.getSettingsLetterSubSections();
}
//#endregion SubSection
}
