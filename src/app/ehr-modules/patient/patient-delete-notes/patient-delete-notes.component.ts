import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-patient-delete-notes',
  templateUrl: './patient-delete-notes.component.html',
  styleUrls: ['./patient-delete-notes.component.css']
})
export class PatientDeleteNotesComponent implements OnInit {
  deleteForm : FormGroup;  
  title:string="";
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm(){
    this.deleteForm = this.formBuilder.group({
      txtComments : this.formBuilder.control(null,Validators.required)
     } 
  )
  }
  onSubmit(formData){
    this.activeModal.close(formData.txtComments);
  }

}
