import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralService } from '../../../../services/general/general.service';
import { LookupList, LOOKUP_LIST } from '../../../../providers/lookupList.module';
import { LogMessage } from '../../../../shared/log-message';
import { PatientService } from '../../../../services/patient/patient.service';

@Component({
  selector: 'patient-care-team-add-edit-popup',
  templateUrl: './patient-care-team-add-edit-popup.component.html',
  styleUrls: ['./patient-care-team-add-edit-popup.component.css']
})
export class PatientCareTeamAddEditPopupComponent implements OnInit {
    
  @Input() careTeamId:number;
  @Input() patientId:number;
  @Input() data:any;    
  @Input() operationType:string;

  ctForm: FormGroup;
  isLoading: Boolean = true;  

  lstTeamStatus = [
    { code: "proposed", description: "Proposed" },
    { code: "active", description: "Active" },
    { code: "suspended", description: "Suspended" },
    { code: "inactive", description: "Inactive" }
  ];

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder, 
    private patientService: PatientService,
    private generalService: GeneralService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private modalService: NgbModal) {    
  }

  ngOnInit() {
    this.isLoading = true; 
    this.buildForm();
    this.isLoading = false;    

    if(this.operationType=="EDIT"){
    this.populateData();
    }
  
  }

  buildForm() {

    this.ctForm = this.formBuilder.group({
      txtName: this.formBuilder.control(null, Validators.required),
      ddStatus: this.formBuilder.control(null, Validators.required)
    }
    )
  }  

  populateData() {

    debugger;

    (this.ctForm.get("txtName") as FormControl).setValue(this.data.team_name);
    (this.ctForm.get("ddStatus") as FormControl).setValue(this.data.team_status);
  }


  onSubmit(formData) {
    debugger;

    let objCareTeam = {
      team_id: this.careTeamId,
      patient_id:this.patientId,
      team_name: (this.ctForm.get("txtName") as FormControl).value,
      team_status: (this.ctForm.get("ddStatus") as FormControl).value,
      add_edit_flag: true
    };

    this.activeModal.close(objCareTeam);
  }

  closePopup(value) {
    this.activeModal.close(value);
  }

}
