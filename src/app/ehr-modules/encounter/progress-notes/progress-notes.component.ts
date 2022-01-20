import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import * as Quill from 'quill';
import { ORMSavePlanOfCare } from 'src/app/models/encounter/orm-save-chart-planofcare';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { LogParameters } from '../../log/log-parameters';
import { TemplateMainComponent } from '../chart-template/template-main/template-main.component';
import { LastNoteComponent } from '../last-note/last-note.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'progress-notes',
  templateUrl: './progress-notes.component.html',
  styleUrls: ['./progress-notes.component.css']
})
export class ProgressNotesComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  isLoading: boolean = false;
  noRecordFound: boolean = false;
  canView: boolean = false;
  canAddEdit: boolean = false;

  lstprogressNoteList;
  lstprogressNoteText;
  selectedNoteText;
  selectedNoteHtml;
  dataOption = "current";
  radioForm: FormGroup;
  richForm: FormGroup;
  richFormView: FormGroup;
  rowId;
  editOperation = '';
  public content: AbstractControl;
  public contentView: AbstractControl;
  public editorContent = '';

  uniqueModuleId: string = "";

  public editorOptions = {
    theme: 'bubble',
    placeholder: "insert content..."
  };
  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil, private formBuilder: FormBuilder, private ngbModal: NgbModal) {

    this.canView = this.lookupList.UserRights.ViewProgressNote;
    this.canAddEdit = this.lookupList.UserRights.AddModifyProgressNote;

    // var quill = new Quill(('#richEditorView'+this.uniqueModuleId), {
    //   theme: 'snow'
    //});

    this.richForm = formBuilder.group({
      'content': [''],
    });

    this.content = this.richForm.controls['content'];

    this.richFormView = formBuilder.group({
      'contentView': [''],
    });

    this.contentView = this.richFormView.controls['contentView'];


  }

  ngOnInit() {

    this.uniqueModuleId = "progN_" + this.objencounterToOpen.chart_id;

    if (this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;

    if (this.canView) {
      this.getViewData();
    }
    this.buildForm();
  }
  buildForm() {
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control('current'),
    }
    );
    // this.richForm = this.formBuilder.group({
    //   richEditor: this.formBuilder.control(this.editorContent),

    // })
  }
  getViewData() {
    this.isLoading = true;
    this.noRecordFound = false;
    this.getNotesList(this.objencounterToOpen.chart_id.toString());
  }
  getNotesList(FilterOption: string) {
    this.encounterService.getChartProgressNoteListView(this.objencounterToOpen.patient_id.toString(), FilterOption)
      .subscribe(
        data => {
          this.lstprogressNoteList = data;
          if (this.lstprogressNoteList == undefined || this.lstprogressNoteList.length == 0) {
            this.noRecordFound = true;
          }
          else {
            this.noRecordFound = false;
            this.OnSelectionChanged(this.lstprogressNoteList[0]);
          }
          this.isLoading = false;

          if (this.noRecordFound == true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting Plan of Care list.")
          this.isLoading = false;
        }
      );
  }
  onRadioOptionChange(event) {
    debugger;

    this.dataOption = event;
    if (event == 'all') {
      this.getNotesList('0');
    }
    else
      this.getNotesList(this.objencounterToOpen.chart_id.toString());

  }
  OnSelectionChanged(request) {
    this.rowId = request.note_id;
    debugger;
    this.encounterService.getChartProgressNoteTextView(request.note_id)
      .subscribe(
        data => {
          debugger;
          this.lstprogressNoteText = data;
          this.selectedNoteText = this.lstprogressNoteText[0].notes_text;
          this.selectedNoteHtml = this.lstprogressNoteText[0].notes_new_html;

          this.richFormView = this.formBuilder.group({
            'contentView': [this.selectedNoteHtml == "" ? this.selectedNoteText : this.selectedNoteHtml],
          });

          this.contentView = this.richFormView.controls['contentView'];
          // if (this.lstprogressNoteText == undefined || this.lstprogressNoteText.length == 0) {
          //   this.noRecordFound = true;
          // }
          // this.isLoading = false;

          // if (this.noRecordFound==true) 
          // {
          //   this.dataUpdated.emit(new ORMKeyValue("Plan of Care", "0"));
          // }
          // else
          // {
          //   this.dataUpdated.emit(new ORMKeyValue("Plan of Care", "1"));
          // }
        },
        error => {
          this.logMessage.log("An Error Occured while getting Plan of Care text.")
          this.isLoading = false;
        }
      );

  }
  onAddNew() {
    this.addEditView = true;
    this.editOperation = "New";
    this.richForm = this.formBuilder.group({
      'content': [''],
    });
    this.content = this.richForm.controls['content'];
  }
  onSave() {
    debugger;
    this.addEditView = false;
    this.onSaveNotes();
  }
  onCancel() {
    this.addEditView = false;
  }
  onEdit() {
    debugger;
    this.editOperation = "Edit";
    this.addEditView = true;
    this.richForm = this.formBuilder.group({
      'content': [this.selectedNoteHtml == "" ? this.selectedNoteText : this.selectedNoteHtml],
    });
    this.content = this.richForm.controls['content'];
  }
  onDelete() {
    debugger;
    this.editOperation = "Delete";
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        // let deleteRecordData = new ORMDeleteRecord();
        // deleteRecordData.column_id = this.rowId.toString();
        // deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        // deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        // deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "column_id", value: this.rowId.toString(), option: "" },
          { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "client_date_modified", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" },
          { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
          { name: "msg_Type", value: "deleted", option: "" }
        ];

        this.encounterService.deleteProgressNotes(searchCriteria)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Progress Notes Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.ngbModal.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter Progress Notes"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.getViewData();
    }
  }
  onSaveNotes() {
    debugger;
    try {
      let ormSave: ORMSavePlanOfCare = new ORMSavePlanOfCare();

      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.patient_id = this.objencounterToOpen.patient_id.toString();
      ormSave.chart_id = this.objencounterToOpen.chart_id.toString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      ormSave.system_ip = this.lookupList.logedInUser.systemIp;


      this.addEditView = false;


      let quill = new Quill(('#richEditor' + this.uniqueModuleId), {
        theme: 'snow'
      });
      //Temp check
      ormSave.notes_html = "HTML:" + quill.root.innerHTML + ":Text:" + quill.root.innerText;
      //End
      let strHtml = quill.root.innerHTML;
      let arrHtml = strHtml.split('<p>');
      let notesHtml = '';
      for (let p = 0; p < arrHtml.length; p++) {
        if (arrHtml[p].replace('</p>', '').trim() != '') {
          notesHtml += "<p>" + arrHtml[p].trim();
          notesHtml = notesHtml.replace('<p></p>', '');
        }
      }


      //ormSave.notes_new_html = this.richForm.value.content;
      ormSave.notes_new_html = notesHtml;//quill.root.innerHTML;

      ormSave.notes_text = quill.getText().trim();

      if (this.editOperation == "New") {
        ormSave.created_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      }
      else {
        // ormSave.notes_html=this.lstprogressNoteText[0].notes_html;
        ormSave.note_id = this.lstprogressNoteText[0].note_id;
        ormSave.client_date_created = this.lstprogressNoteText[0].client_date_created;
        ormSave.date_created = this.lstprogressNoteText[0].date_created;
        ormSave.created_user = this.lstprogressNoteText[0].created_user;
      }

      this.encounterService.saveChartProgressNotes(ormSave)
        .subscribe(
          data => {
            if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
              this.addEditView = false;
              this.getViewData();
              this.editOperation = '';
            }
            else if (data['error'] === ServiceResponseStatusEnum.ERROR) {
              //this.logMessage.log(data['response']);
              GeneralOperation.showAlertPopUp(this.ngbModal, 'Save Note Result Error', data['response'], 'danger');
            }
          },
          error => {
            // this.logMessage.log("An error occured while saving Chart Progress Notes.");
            GeneralOperation.showAlertPopUp(this.ngbModal, 'Save Note Error', 'An error occured while saving Plan Of Care.' + error, 'danger');
          }
        );
    }
    catch (error) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Save Plan Of Care Error', error, 'danger');
    }
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showProgressLog() {
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "chart_progress_note_log";
    logParameters.logDisplayName = "Plan of Care Log";
    logParameters.logMainTitle = "Plan of Care Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;

    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.ngbModal.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;

  }
  onTemplateClick() {
    debugger;
    var quill = new Quill(('#richEditor' + this.uniqueModuleId), {
      theme: 'snow'
    });

    const modalRef = this.ngbModal.open(TemplateMainComponent, { size: 'lg', windowClass: 'modal-adaptive', backdrop: 'static' });
    modalRef.componentInstance.objencounterToOpen = this.objencounterToOpen;
    modalRef.componentInstance.module_txt = quill.getText().trim();

    modalRef.componentInstance.callingFrom = 'chart';

    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        debugger;
        this.richForm = this.formBuilder.group({
          'content': [result],
        });
        this.content = this.richForm.controls['content'];
        quill.setText(result);
        //quill.setContents(this.content);
      }
      else {
        this.richForm = this.formBuilder.group({
          'content': [quill.getText().trim()],
        });
        this.content = this.richForm.controls['content'];
        quill.setText(quill.getText().trim());
      }
      //@auto Save
      this.onSave();
    }
      , (reason) => {
      });
    // quill.destroy();
  }
  onLastNotesClick() {
    debugger;
    let quill = new Quill(('#richEditor' + this.uniqueModuleId), {
      theme: 'snow'
    });

    //this.quill=new Quill('#richEditor');
    const modalRef = this.ngbModal.open(LastNoteComponent, { size: 'lg', windowClass: 'modal-adaptive', backdrop: 'static' });
    modalRef.componentInstance.header = 'Previous Plan Of Care Notes';
    modalRef.componentInstance.callingFrom = 'POC';
    modalRef.componentInstance.patient_id = this.objencounterToOpen.patient_id;
    modalRef.componentInstance.chart_id = this.objencounterToOpen.chart_id;

    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        debugger;
        this.richForm = this.formBuilder.group({
          'content': [result],
        });
        this.content = this.richForm.controls['content'];
        quill.setText(result);
      }
    }
      , (reason) => {
      });

  }
}
