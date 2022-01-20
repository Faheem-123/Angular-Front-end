import { Component, OnInit, Inject } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ORMPatient_Followup } from 'src/app/models/encounter/ORMPatient_Followup';
import { ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'follow-up-task',
  templateUrl: './follow-up-task.component.html',
  styleUrls: ['./follow-up-task.component.css']
})
export class FollowUpTaskComponent implements OnInit {

  inputForm:FormGroup;
  constructor(private encounterService:EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,public activeModal: NgbActiveModal,private formBuilder:FormBuilder
    ,private modalService: NgbModal) { }
  chart_id='';
  patient_id='';
  appointment_id='';
  lstData;
  
  ngOnInit() {
    this.buildForm();

    this.encounterService.getPatientFollowup(this.chart_id).subscribe(
      data => {
        debugger;
          this.lstData = data as Array<any>;
          if(this.lstData.length>0)
          {
            (this.inputForm.get('drpDays') as FormControl).setValue(this.lstData[0].day);
            (this.inputForm.get('drpWeeks') as FormControl).setValue(this.lstData[0].week);
            (this.inputForm.get('drpMonth') as FormControl).setValue(this.lstData[0].month);
          }
      },
      error => {
      }
  );
  }
  buildForm()
  {
    this.inputForm = this.formBuilder.group({
      drpDays:this.formBuilder.control(null,null),
      drpWeeks : this.formBuilder.control( null),
      drpMonth : this.formBuilder.control(null)
     })
  }
  
  onSave(){
   let objFollowup:ORMPatient_Followup=new ORMPatient_Followup;
    if(this.lstData.length>0)
    {
      objFollowup.id=this.lstData[0].id;
      objFollowup.date_created=this.lstData[0].date_created;
      objFollowup.created_user=this.lstData[0].created_user;
    }
    else
    {
      objFollowup.created_user=this.lookupList.logedInUser.user_name;
    }
    objFollowup.patient_id=this.patient_id;
    objFollowup.chart_id=this.chart_id;
    objFollowup.appointment_id=this.appointment_id;
    objFollowup.day=this.inputForm.get("drpDays").value;
    objFollowup.week=this.inputForm.get("drpWeeks").value;
    objFollowup.month=this.inputForm.get("drpMonth").value;
    objFollowup.practice_id=this.lookupList.practiceInfo.practiceId.toString();
    objFollowup.modified_user=this.lookupList.logedInUser.user_name;


    this.encounterService.savePatientFollowupTask(objFollowup).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.activeModal.close(true);
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {

          this.showError(data['response']);
        }
      },
      error => {
       this.showError("An error occured while saving Chart Surgery.");
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
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
}
