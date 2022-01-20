import { Component, OnInit, Input, Inject, HostListener } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { PatientService } from 'src/app/services/patient/patient.service';
import { LogMessage } from 'src/app/shared/log-message';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum, AlertTypeEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ormpatientnotes } from 'src/app/models/patient/orm-patient-notes';
import { GeneralService } from 'src/app/services/general/general.service';
declare var myExtObject:any;
@Component({
  selector: 'patient-notes',
  templateUrl: './patient-notes.component.html',
  styleUrls: ['./patient-notes.component.css']
})
 
export class PatientNotesComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private patientService: PatientService,private generalService:GeneralService,
    private logMessage: LogMessage, private modalService: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private dateTimeUtil: DateTimeUtil, private generalOperation: GeneralOperation) { }

  @Input() patientId;
  @Input() patientName;
  @Input() dob;

  PatientDetails;
  radioFormGroup: FormGroup;
  ArrNotes;
  ArrNotesFilter;
  ArrEditNote;
  selectedTab = 'staff';
  operation = "";
  selecteduserIndex = 0;
  formStaffNotes: FormGroup;
  formPhysicanNotes: FormGroup;
  formBillingNotes: FormGroup;
  loading = true;
  showHideButtons = false;
  callingFrom;
  previousBillingNotes="";


  ngOnInit() {
    this.buildForm();
    this.loadNotes();
  }
  @HostListener('document:keydown.escape', ['$event']) 
  onKeydownHandler(event: KeyboardEvent) {
    this.activeModal.dismiss('Cross click')
}
  buildForm() {
    this.radioFormGroup = this.formBuilder.group({
      radioOption: this.formBuilder.control("staff")
    })

    this.formStaffNotes = this.formBuilder.group({
      txtStaffDetials: this.formBuilder.control(""),
      ChkStaffAlert: this.formBuilder.control(false)
    })
    this.enableDisableNoteField("staff", false);

    this.formPhysicanNotes = this.formBuilder.group({
      txtPhysicanNote: this.formBuilder.control(""),
      chkPhysicanAlert: this.formBuilder.control(false)
    })
    this.enableDisableNoteField("physician", false);

    this.formBillingNotes = this.formBuilder.group({
      txtBillingNote: this.formBuilder.control(""),
      txtBillingNote_prev: this.formBuilder.control(""),
      chkBillingAlert: this.formBuilder.control(false)
    })
    this.enableDisableNoteField("billing", false);
  }

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

  dismiss() {
    this.activeModal.close();
  }

  onOptionChange(val: string) {
    debugger;
    this.selectedTab = val;
    switch (val) {
      case "staff":
        this.ArrNotesFilter = new ListFilterPipe().transform(this.ArrNotes, "notes_type", 'staff');
        this.onuserSelectionChange(0, this.ArrNotesFilter, val);
        this.enableDisableNoteField("staff", false);
        break;
      case "physician":
        this.ArrNotesFilter = new ListFilterPipe().transform(this.ArrNotes, "notes_type", 'physician');
        this.onuserSelectionChange(0, this.ArrNotesFilter, val);
        this.enableDisableNoteField("physician", false);
        break;
      case "billing":
        this.ArrNotesFilter = new ListFilterPipe().transform(this.ArrNotes, "notes_type", 'billing');
        this.onuserSelectionChange(0, this.ArrNotesFilter, val);
        this.enableDisableNoteField("billing", false);
        break;
    }
  }


  loadNotes() {
    debugger;
    if(this.callingFrom=='alert')
    {
        this.patientService.getStaffNoteAlert(this.patientId).subscribe(
          data => {
            this.ArrNotes = data;
            this.ArrNotesFilter = data;
            this.onOptionChange('staff');
          },
          error => {
          }
        );
    }
    else{
    this.patientService.getPatientNotes(this.patientId).subscribe(
      data => {
        debugger;
        if (data != undefined && data != null) {
          this.ArrNotes = data;
          this.ArrNotesFilter = data;
          if (this.loading)
            this.onOptionChange('staff');
          else
            this.onOptionChange(this.selectedTab);
        }
        else {
          this.ArrNotes = null
        }
        this.loading = false;
      },
      error => {
        this.logMessage.log("Get Patient Error.");
        this.loading = false;
      }
    );
  }
  }

  onuserSelectionChange(index, arrData, option) {
    debugger;
    this.selecteduserIndex = index;
    let notes;
    let checkbox;
    if (arrData['length'] >= 1) {
      notes = arrData[index].notes;
      checkbox = arrData[index].alert;
    }
    else {
      notes = arrData.notes;
      checkbox = arrData.alert;
    }
    switch (option) {
      case "staff":
        (this.formStaffNotes.get("txtStaffDetials") as FormControl).setValue(notes);
        (this.formStaffNotes.get("ChkStaffAlert") as FormControl).setValue(checkbox);
        break;
      case "physician":
        (this.formPhysicanNotes.get("txtPhysicanNote") as FormControl).setValue(notes);
        (this.formPhysicanNotes.get("chkPhysicanAlert") as FormControl).setValue(checkbox);
        break;
      case "billing":
        this.previousBillingNotes=notes;
        (this.formBillingNotes.get("txtBillingNote_prev") as FormControl).setValue(notes);
        (this.formBillingNotes.get("chkBillingAlert") as FormControl).setValue(checkbox);
        break;
    }
  }

  deleteNotes(obj) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.patient_note_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
        if(obj.notes_from=='PATIENT')
        {
          this.patientService.deleteNotes(deleteRecordData)
            .subscribe(
              data => this.onDeleteSuccessfully(data, obj.patient_note_id.toString()),
              error => alert(error),
              () => this.logMessage.log("Patient Note Deleted Successfull.")
            );
        }
        else if(obj.notes_from=='RESULT')
        {
          this.patientService.deleteResultStaffNotes(deleteRecordData)
            .subscribe(
              data => this.onDeleteSuccessfully(data, obj.patient_note_id.toString()),
              error => alert(error),
              () => this.logMessage.log("Patient Note Deleted Successfull.")
            );
        }
        else if(obj.notes_from=='ATTACHMENT')
        {
          this.patientService.deleteAttabhmentStaffNotes(deleteRecordData)
            .subscribe(
              data => this.onDeleteSuccessfully(data, obj.patient_note_id.toString()),
              error => alert(error),
              () => this.logMessage.log("Patient Note Deleted Successfull.")
            );
        }
      }
    }, (reason) => {
      alert(reason);
    });
  }

  onDeleteSuccessfully(data, id) {
    debugger;
    if (data === 1) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Patient Notes"
      modalRef.componentInstance.promptMessage = "Patient Note Deleted Successfull.";
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) {
          this.ArrNotes.splice(this.generalOperation.getitemIndex(this.ArrNotes, "patient_note_id", id), 1);
          this.onOptionChange(this.selectedTab);
        }
      }
        , (reason) => {
        });
    }
    else {
      // if (this.arrusers.length > 0) {
      //   this.selecteduserIndex=0;
      //   this.getUserDetail(this.arrusers[0].user_id);
      //   this.getUserAssignProvider(this.arrusers[0].user_id);
      // }     
    }
  }

  updateNotes(lstNotes) {
    debugger;
    this.operation = "editnote";
    this.ArrEditNote = lstNotes;
    if(lstNotes.notes_type.toLowerCase()=="staff"){
      this.enableDisableNoteField("staff", true);
    }else if(lstNotes.notes_type.toLowerCase()=="physician"){
      this.enableDisableNoteField("physician", true);
    }
    else if(lstNotes.notes_type.toLowerCase()=="billing"){
      this.enableDisableNoteField("billing", true);
    }


    
  }

assignValue(value){
  (this.formStaffNotes.get("txtStaffDetials") as FormControl).setValue(value);
}
  AddNew() {
    this.operation = "addnew";
    switch (this.selectedTab) {
      case "staff":
          //myExtObject.record('patient_notes_staff_notes');
         
        (this.formStaffNotes.get("txtStaffDetials") as FormControl).setValue("");
        (this.formStaffNotes.get("ChkStaffAlert") as FormControl).setValue("");
        this.enableDisableNoteField("staff", true);

        break;
      case "physician":
        (this.formPhysicanNotes.get("txtPhysicanNote") as FormControl).setValue("");
        (this.formPhysicanNotes.get("chkPhysicanAlert") as FormControl).setValue("");
        this.enableDisableNoteField("physician", true);
        break;
      case "billing":
        (this.formBillingNotes.get("txtBillingNote") as FormControl).setValue("");
        (this.formBillingNotes.get("chkBillingAlert") as FormControl).setValue("");
        this.enableDisableNoteField("billing", true);
        break;
    }

  }

  saveRecord() {
    if (this.validate() == false)
      return;
    else
      this.prepareSaveObj();
  }

  validate(): boolean {
    switch (this.selectedTab) {
      case "staff":
        if (this.formStaffNotes.get("txtStaffDetials").value == '' || this.formStaffNotes.get("txtStaffDetials").value == null) {
          GeneralOperation.showAlertPopUp(this.modalService, 'Patient Notes', 'Please enter staff notes.', 'warning');
          return false;
        }
        break;
      case "physician":
        if (this.formPhysicanNotes.get("txtPhysicanNote").value == '' || this.formPhysicanNotes.get("txtPhysicanNote").value == null) {
          GeneralOperation.showAlertPopUp(this.modalService, 'Patient Notes', 'Please enter physican notes.', 'warning');
          return false;
        }
        break;
      case "billing":
        if (this.formBillingNotes.get("txtBillingNote").value == '' || this.formBillingNotes.get("txtBillingNote").value == null) {
          GeneralOperation.showAlertPopUp(this.modalService, 'Patient Notes', 'Please enter billing notes.', 'warning');
          return false;
        }
        break;
    }
    return true;
  }

  prepareSaveObj() {
    debugger;

    if (this.operation === "") {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Notes Save';
      modalRef.componentInstance.promptMessage = "Nothing to update";
      return;
    }

    let patientNotes;
    let alertValue;
    switch (this.selectedTab) {
      case "staff":
        patientNotes = this.formStaffNotes.get("txtStaffDetials").value;
        alertValue = this.formStaffNotes.get("ChkStaffAlert").value;
        break;
      case "physician":
        patientNotes = this.formPhysicanNotes.get("txtPhysicanNote").value;
        alertValue = this.formPhysicanNotes.get("chkPhysicanAlert").value;
        break;
      case "billing":
        if(this.previousBillingNotes!=""){
          patientNotes = this.previousBillingNotes +"\nFor Billing: "+ this.formBillingNotes.get("txtBillingNote").value +" ["+ this.lookupList.logedInUser.user_name +"]";
        }else{
          patientNotes = this.formBillingNotes.get("txtBillingNote").value;
        }
        alertValue = this.formBillingNotes.get("chkBillingAlert").value;
        break;
    }

    let objNotwes: ormpatientnotes = new ormpatientnotes;

    objNotwes.patient_id = this.patientId;
    objNotwes.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    objNotwes.modified_user = this.lookupList.logedInUser.user_name;
    objNotwes.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    objNotwes.notes_type = this.selectedTab;
    objNotwes.alert = alertValue;
    objNotwes.notes = patientNotes;

    if (this.operation == "addnew") {
      objNotwes.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      objNotwes.created_user = this.lookupList.logedInUser.user_name;
      // objNotwes.date_created
      // objNotwes.date_modified      
      // objNotwes.note_type_id      
      objNotwes.patient_note_id = null;
    }
    else {
      // if(this.ArrEditNote['length'] === 0)
      // {
      //   alert("There record to update.");
      //   return;
      // }
      objNotwes.patient_note_id = this.ArrEditNote.patient_note_id;
      objNotwes.client_date_created = this.ArrEditNote.client_date_created;
      objNotwes.created_user = this.ArrEditNote.created_user;
      objNotwes.date_created = this.ArrEditNote.date_created;
    }

    this.patientService.savePatientNotes(objNotwes).subscribe(
      data => {
        debugger;
        this.saveUserSuccess(data);
      },
      error => {
        this.saveUserError(error);
      }
    );
  }

  saveUserSuccess(data: any) {
    debugger;
    this.operation = "";
    this.ArrEditNote = "";
    this.loadNotes();
    // this.enableDisable('disable');    
    // this.isDisable =false;
    // this.strOperation="";
    // this.editAssignedProvider=false;
    // this.getUserAssignProvider(this.objUserDetail.user_id);
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Notes Save';
      modalRef.componentInstance.promptMessage = "Patient note save successfully.";
      if(this.selectedTab == "billing"){
        (this.formBillingNotes.get("txtBillingNote") as FormControl).setValue("");
      }
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Notes Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveUserError(error: any) {
    this.operation = "";
    this.ArrEditNote = "";

    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'User Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving User."
  }
  enableDisableNoteField(type, value) {
    debugger;
    switch (type) {
      case "staff":
        if (value){
          this.formStaffNotes.enable();
          this.showHideButtons = true;
        }
        else{
          this.formStaffNotes.disable();
          this.showHideButtons = false;
        }
        break;
      case "physician":
        if (value){
          this.formPhysicanNotes.enable();
          this.showHideButtons = true;
        }
        else{
          this.formPhysicanNotes.disable();
          this.showHideButtons = false;
        }
        break;
      case "billing":
        if (value){
          this.formBillingNotes.enable();
          this.showHideButtons = true;
          this.formBillingNotes.get("txtBillingNote_prev").disable();
        }
        else{
          this.formBillingNotes.disable();
          this.showHideButtons = false;
        }
        break;
    }
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
        let control=document.getElementById('patient_notes_staff_notes');
        control['value']=control['value']+e.results[current][0].transcript;
        
           this.generalService.auditLog(
             this.generalOperation.moduleAccessLog("Voice Record", 'PatientAudio:'+e.results[current][0].transcript, this.patientId, ""))
             .subscribe();
}

      //  this.recognition.onresult = function(event) {
      //    var current = event.resultIndex;
      //    debugger;
      //      // console.log(event);
      //       //console.log("Result:"+event.results[current][0].transcript);
      //       let control=document.getElementById('patient_notes_staff_notes');
      //       control['value']=control['value']+event.results[current][0].transcript;
      //      //document.getElementById('patient_notes_staff_notes').value = event.results[current][0].transcript;
      //      //(this.formStaffNotes.get("txtStaffDetials") as FormControl).setValue(event.results[current][0].transcript);
      //      //this.assignValue(event.results[current][0].transcript);
           
      //     //  let generalService:GeneralService;
      //     //  generalService.auditLog(
      //     //   this.generalOperation.moduleAccessLog("Voice", 'User Audio', event.results[current][0].transcript, ""))
      //     //   .subscribe();
      //  }
       this.recognition.onerror = function(event) {
        console.log('Speech recognition error detected: ' + event.error);
        console.log('Additional information: ' + event.message);
      }
       this.recognition.start();
       
     
  }

  onVoiceStop(){
    debugger;
    //var recognition= new window['webkitSpeechRecognition'];
    this.recognition.stop();
  }
}


