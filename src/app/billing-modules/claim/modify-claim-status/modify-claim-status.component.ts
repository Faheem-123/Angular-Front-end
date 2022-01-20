import { Component, OnInit, Input, Inject } from '@angular/core';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ClaimNotesPopupComponent } from '../claim-notes-popup/claim-notes-popup.component';
import { AddEditClaimNoteComponent } from '../claim-notes/add-edit-claim-note/add-edit-claim-note.component';
import { CallingFromEnum, AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ClaimStatusUpdate } from 'src/app/models/billing/claim-status-update';
import { ClaimNotes } from 'src/app/models/billing/claim-notes';

@Component({
  selector: 'modify-claim-status',
  templateUrl: './modify-claim-status.component.html',
  styleUrls: ['./modify-claim-status.component.css']
})
export class ModifyClaimStatusComponent implements OnInit {

  isLoading = false;
  @Input() openedClaimInfo: OpenedClaimInfo;

  claimStatusFormGroup: FormGroup;


  lstStatus: Array<any> = [
    { status: '', display: '' },
    { status: 'B', display: 'Billed' },
    { status: 'P', display: 'Paid' },
    { status: 'PP', display: 'Partialy Paid' }
  ]

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  claimStatusUpdate: ClaimStatusUpdate;

  constructor(private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private claimService: ClaimService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private ngbModal: NgbModal) { }

  ngOnInit() {
    this.buildForm();

    this.getLastEditableClaimNote();
  }

  buildForm() {
    this.claimStatusFormGroup = this.formBuilder.group({
      ddPrimaryStatus: this.formBuilder.control(this.openedClaimInfo.primaryStatus),
      ddSecondaryStatus: this.formBuilder.control(this.openedClaimInfo.secondaryStatus),
      ddOtherStatus: this.formBuilder.control(this.openedClaimInfo.otherStatus),
      ddPatientStatus: this.formBuilder.control(this.openedClaimInfo.patientStatus),
      txtNotes: this.formBuilder.control(null, Validators.required)
    });
  }

  lstClaimNotes: Array<any>;
  showLastNote: boolean = false;
  getLastEditableClaimNote() {
    this.isLoading = true;
    this.lstClaimNotes = undefined;
    this.claimService.getClaimNotes(this.openedClaimInfo.claimId, this.lookupList.logedInUser.user_name, 'true').subscribe(
      data => {
        this.lstClaimNotes = data as Array<any>;
        if (this.lstClaimNotes != undefined && this.lstClaimNotes.length > 0) {
          this.showLastNote = true;
        }
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getLastEditableClaimNoteError(error);
      }
    );
  }

  getLastEditableClaimNoteError(error: any) {
    this.logMessage.log("getLastEditableClaimNote Error." + error);
  }

  onSubmit(formData: any) {

    debugger;
    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);




    debugger;
    let claimNotes: ClaimNotes = new ClaimNotes();

    if (this.objNote != undefined) {
      claimNotes.notes_id = this.objNote.notes_id;
      claimNotes.date_created = this.objNote.date_created;
      claimNotes.created_user = this.objNote.created_user;
      claimNotes.client_date_created = this.objNote.client_date_created;
    }
    else {
      claimNotes.created_user = this.lookupList.logedInUser.user_name;
      claimNotes.client_date_created = clientDateTime;
    }

    claimNotes.modified_user = this.lookupList.logedInUser.user_name;
    claimNotes.client_date_modified = clientDateTime;
    claimNotes.practice_id = this.lookupList.practiceInfo.practiceId;
    claimNotes.claim_id = this.openedClaimInfo.claimId;
    claimNotes.patient_id = this.openedClaimInfo.patientId;
    claimNotes.notes = formData.txtNotes;


    this.claimStatusUpdate = new ClaimStatusUpdate();
    this.claimStatusUpdate.claim_id = this.openedClaimInfo.claimId;
    this.claimStatusUpdate.patient_id = this.openedClaimInfo.patientId;
    this.claimStatusUpdate.practice_id = this.lookupList.practiceInfo.practiceId;
    this.claimStatusUpdate.pri_status = formData.ddPrimaryStatus;
    this.claimStatusUpdate.sec_status = formData.ddSecondaryStatus;
    this.claimStatusUpdate.oth_status = formData.ddOtherStatus;
    this.claimStatusUpdate.pat_status = formData.ddPatientStatus;
    this.claimStatusUpdate.client_date_time = clientDateTime;
    this.claimStatusUpdate.user_name = this.lookupList.logedInUser.user_name;
    this.claimStatusUpdate.system_ip = this.lookupList.logedInUser.systemIp;
    this.claimStatusUpdate.claim_notes = claimNotes;

    this.claimService.updateClaimStatus(this.claimStatusUpdate).subscribe(
      data => {

        this.updateClaimStatusSuccess(data);
      },
      error => {
        this.updateClaimStatusError(error);
      }
    );
  }

  updateClaimStatusSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Modify Claim Status', data.response, AlertTypeEnum.DANGER)
    }
  }

  updateClaimStatusError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Modify Claim Status', "An Error Occured while updateing claim status.", AlertTypeEnum.DANGER)
  }

  
  objNote:any;
  onAddEditClaimNote(note: any) {
    this.showLastNote = false;
    this.objNote = note;
    if (this.objNote != undefined) {
      this.claimStatusFormGroup.get("txtNotes").setValue(this.objNote.notes);            
    }
  }


}
