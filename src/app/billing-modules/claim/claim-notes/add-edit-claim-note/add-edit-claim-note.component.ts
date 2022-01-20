import { Component, OnInit, Input, Inject, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClaimNotes } from 'src/app/models/billing/claim-notes';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { CallingFromEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { LogMessage } from 'src/app/shared/log-message';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { GeneralService } from 'src/app/services/general/general.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'add-edit-claim-note',
  templateUrl: './add-edit-claim-note.component.html',
  styleUrls: ['./add-edit-claim-note.component.css']
})
export class AddEditClaimNoteComponent implements OnInit {

  @Input() openedClaimInfo: OpenedClaimInfo;
  //@Input() patientId: number;
  //@Input() dos: string;
  @Input() objNote: any;
  @Input() callingFrom: CallingFromEnum;

  claimNotesFormGroup: FormGroup;

  note: string;
  dos: string;

  isBillingUser: boolean = false;

  addEdittitle: string = "Add";
  isLoading: boolean;
  lstClaimNotes: Array<any>;

  showLastNote: boolean = false;


  constructor(private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private claimService: ClaimService,
    private logMessage: LogMessage,private generalService:GeneralService,private generalOperation: GeneralOperation,
    private dateTimeUtil: DateTimeUtil) { }

    @HostListener('document:keydown.escape', ['$event']) 
    onKeydownHandler(event: KeyboardEvent) {
      this.activeModal.dismiss('Cross click')
  }
  
  ngOnInit() {

    if (this.lookupList.logedInUser.userType.toUpperCase() == "BILLING") {
      this.isBillingUser = true;
    }

    if (this.callingFrom == CallingFromEnum.CALIM_NOTES) {
      if (this.objNote != undefined) {
        this.addEdittitle = "Edit";
        this.note = this.objNote.notes;
      }
      else {
        this.addEdittitle = "Add";
      }
    }
    else if (this.callingFrom == CallingFromEnum.CLAIM_ENTRY) {
      this.getLastEditableClaimNote();
    }


    this.buildForm();
  }

  buildForm() {
    this.claimNotesFormGroup = this.formBuilder.group({
      txtNotes: this.formBuilder.control(this.note, Validators.compose([Validators.required, Validators.maxLength(500)])),
      chkAddToPatientNotes: this.formBuilder.control(null)
    });
  }

  getLastEditableClaimNote() {
    this.isLoading = true;
    this.lstClaimNotes = undefined;

    let  fetchOnlyEditable:boolean=true;

    if(this.isBillingUser){
      fetchOnlyEditable=false;
    }

    this.claimService.getClaimNotes(this.openedClaimInfo.claimId, this.lookupList.logedInUser.user_name,fetchOnlyEditable.toString() ).subscribe(
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

    let AddToPatient: boolean = formData.chkAddToPatientNotes == true ? true : false;

    let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

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

    //if (this.callingFrom == CallingFromEnum.CALIM_SAVE) {
    //  this.activeModal.close(claimNotes);
    //}
    //else {
    this.saveClaimNotes(claimNotes, AddToPatient);
    //}
  }

  saveClaimNotes(claimNotes: ClaimNotes, chkAddToPatientNotes: boolean) {
    this.claimService.saveClaimNotes(claimNotes, chkAddToPatientNotes).subscribe(
      data => {
        this.saveClaimNotesSuccess(data);
      },
      error => {
        this.saveClaimNotesError(error);
      }
    );
  }

  onAddEditClaimNote(note: any) {

    this.showLastNote = false;

    this.objNote = note;
    if (this.objNote != undefined) {
      this.claimNotesFormGroup.get("txtNotes").setValue(this.objNote.notes);
      this.addEdittitle = "Edit";
      this.note = this.objNote.notes;
    }
  }

  saveClaimNotesSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close({ status: true, notes: this.claimNotesFormGroup.get("txtNotes").value });
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);
    }
  }

  saveClaimNotesError(error: any) {    
    this.logMessage.log("ClaimNotesError Error.");
  }
  recognition;
  onVoiceSatrt(){
      debugger;
       //var recognition = new webkitSpeechRecognition();
       this.recognition= new window['webkitSpeechRecognition'];
       this.recognition.lang = "en-US";
       this.recognition.continuous = true;
       this.recognition.interimResults =false;
      
       this.recognition .onresult = (e) => {
        var current = e.resultIndex;
        let control=document.getElementById('txtClaimNotes');
        control['value']=control['value']+e.results[current][0].transcript;
        
           this.generalService.auditLog(
             this.generalOperation.moduleAccessLog("Voice Record", 'ClaimNotesAudio:'+e.results[current][0].transcript, this.openedClaimInfo.patientId, ""))
             .subscribe();
        }

      //  this.recognition.onresult = function(event) {
      //    var current = event.resultIndex;
      //    debugger;
      //       console.log(event);
      //       console.log("Result:"+event.results[current][0].transcript);
      //       let control=document.getElementById('txtClaimNotes');
      //       control['value']=control['value']+event.results[current][0].transcript;
      //      //document.getElementById('patient_notes_staff_notes').value = event.results[current][0].transcript;
      //      //(this.formStaffNotes.get("txtStaffDetials") as FormControl).setValue(event.results[current][0].transcript);
      //      //this.assignValue(event.results[current][0].transcript);
      //  }
       this.recognition.start();
       
     
  }
  onVoiceStop(){
    debugger;
    //var recognition= new window['webkitSpeechRecognition'];
    this.recognition.stop();
  }

  canEditNote(note: any): boolean {
    let canEdit: boolean = true;

    if (this.openedClaimInfo.deleted) {
      canEdit = false;
    }
    else if (!note.is_auto && note.can_edit_note && note.modified_user.toUpperCase() == this.lookupList.logedInUser.user_name.toUpperCase()) {
      canEdit = true;
    }
    else {
      canEdit = false;
    }
    return canEdit;

  }

}
