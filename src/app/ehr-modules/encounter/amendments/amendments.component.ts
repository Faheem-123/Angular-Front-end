import { Component, OnInit, Inject, Input } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbModal, NgbModalOptions, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMChartAmendmentsSave } from 'src/app/models/encounter/ORMChartAmendmentsSave';

@Component({
  selector: 'amendments',
  templateUrl: './amendments.component.html',
  styleUrls: ['./amendments.component.css']
})
export class AmendmentsComponent implements OnInit {

  @Input() chart_id;
  inputForm: FormGroup;
  noRecordFound: boolean = true;
  isLoading: boolean = false;
  addEditView: boolean = false;
  lstAmendments;
  objChrtAmendmenttDetail;
  operation = '';
  canAddEdit = false;
  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage, public activeModal: NgbActiveModal) {
    this.canAddEdit = this.lookupList.UserRights.AddModifyAmendments;
  }

  ngOnInit() {
    this.buildForm();
    this.getChartAmendments();
  }
  getChartAmendmentsDetail(id) {
    this.encounterService.getChartAmendmentsDetail(id)
      .subscribe(
        data => {
          this.objChrtAmendmenttDetail = data;

          (this.inputForm.get("txtNotes") as FormControl).setValue(this.objChrtAmendmenttDetail.notes);
          this.isLoading = false;
        },
        error => alert(error),
        () => this.logMessage.log("getChartAmendmentsDetail Successfull.")
      );
  }
  getChartAmendments() {
    this.encounterService.getChartAmendmentsView(this.chart_id)
      .subscribe(
        data => {
          debugger;
          this.lstAmendments = data;
          if (this.lstAmendments != undefined && this.lstAmendments != null && this.lstAmendments.length > 0) {
            this.noRecordFound = false
          }
          else {
            this.noRecordFound = true;
          }
          this.isLoading = false;
        },
        error => alert(error),
        () => this.logMessage.log("getChartAmendments Successfull.")
      );
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtNotes: this.formBuilder.control(null)
    })
  }
  onAdd() {
    this.addEditView = true;
    (this.inputForm.get("txtNotes") as FormControl).setValue(null);
    this.operation = 'New';
  }
  onEdit(obj) {
    this.addEditView = true;
    this.getChartAmendmentsDetail(obj.amendment_id);
    this.operation = 'Edit';
  }
  onSave(formValue) {
    let ormsave: ORMChartAmendmentsSave = new ORMChartAmendmentsSave;
    ormsave.system_ip = this.lookupList.logedInUser.systemIp;
    ormsave.chart_id = this.chart_id;
    ormsave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    ormsave.modified_user = this.lookupList.logedInUser.user_name;;
    ormsave.notes = formValue.txtNotes;
    ormsave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    ormsave.deleted = false;
    if (this.operation == 'New') {
      ormsave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      ormsave.created_user = this.lookupList.logedInUser.user_name;
    }
    else {
      ormsave.amendment_id = this.objChrtAmendmenttDetail.amendment_id;
      ormsave.date_created = this.objChrtAmendmenttDetail.date_created;
      ormsave.created_user = this.objChrtAmendmenttDetail.created_user;
      ormsave.client_date_created = this.objChrtAmendmenttDetail.client_date_created;
    }
    this.encounterService.saveChartAmendments(ormsave).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.addEditView = false;
          this.getChartAmendments();
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {

          // this.showError(data['response']);
        }
      },
      error => {
        //this.showError("An error occured while saving Chart amendments.");
      }
    );
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  onDelete(obj) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.amendment_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteAmendments(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Amendments Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter Amendments"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.getChartAmendments();
    }
  }
  onCancel() {
    this.addEditView = false;
  }
}
