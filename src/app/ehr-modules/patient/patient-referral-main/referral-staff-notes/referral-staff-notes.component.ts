import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { stat } from 'fs';
import { WrapperObjectSave } from 'src/app/models/general/wrapper-object-save';
import { ORMReferralStaffNotes } from 'src/app/models/patient/ORMReferralStaffNotes';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ReferralService } from 'src/app/services/patient/referral.service';
import { PromptResponseEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'referral-staff-notes',
  templateUrl: './referral-staff-notes.component.html',
  styleUrls: ['./referral-staff-notes.component.css']
})
export class ReferralStaffNotesComponent implements OnInit {

  notesForm:FormGroup;
  @Input() patient_id;
  @Input() status;
  @Input() notes;
  @Input() referral_id;
  isLoading=false;
  saveObjectWrapper: WrapperObjectSave;
  private obj_referralStaffNotes: ORMReferralStaffNotes;
  constructor(private formBuilder:FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,public activeModal: NgbActiveModal
    ,private dateTimeUtil: DateTimeUtil,private referralService: ReferralService) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    this.notesForm = this.formBuilder.group({
      drStatus: this.formBuilder.control(this.status,Validators.required),
      txtNotes: this.formBuilder.control(this.notes,Validators.required)
  })
  }
  onSubmit(formData)
  {
    this.saveObjectWrapper = new WrapperObjectSave();
    debugger;
   this.obj_referralStaffNotes=new ORMReferralStaffNotes();
   this.obj_referralStaffNotes.notes=formData.txtNotes;
   this.obj_referralStaffNotes.created_user=this.lookupList.logedInUser.user_name;
   this.obj_referralStaffNotes.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
   this.obj_referralStaffNotes.deleted=false;
   this.obj_referralStaffNotes.patient_id=this.patient_id;
   this.obj_referralStaffNotes.referral_id=this.referral_id;
   this.obj_referralStaffNotes.practice_id=this.lookupList.practiceInfo.practiceId;
   this.saveObjectWrapper.ormSave = this.obj_referralStaffNotes;
 
   this.saveObjectWrapper.lstKeyValue=[];
   this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("referal_status",formData.drStatus));
     //appointmentSaveObjectWrapper.saveConfirmationList.push(new ORMKeyValue("allow_duplicate","YES"));
 
   this.referralService.UpdateReferralRequestStatus(this.saveObjectWrapper)
           .subscribe(
          data =>   this.activeModal.close(PromptResponseEnum.SUCCESS),
           );
  }

}
