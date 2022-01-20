import { Component, OnInit, Inject, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORMChartTemplateApply } from 'src/app/models/encounter/orm-chartTemplateApply';
import * as Quill from 'quill';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
@Component({
  selector: 'problem-based-template',
  templateUrl: './problem-based-template.component.html',
  styleUrls: ['./problem-based-template.component.css']
})
export class ProblemBasedTemplateComponent implements OnInit {
  @Input() objencounterToOpen:EncounterToOpen;
  @Input() callingFrom='';
  @Input() module_txt='';
  @Output() dataUpdated = new EventEmitter<any>();

  provider_id;
  listTemplateResult;
  
  inputForm:FormGroup;
  richForm: FormGroup;
  public content: AbstractControl;
  constructor(private formBuilder: FormBuilder,private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,public activeModal: NgbActiveModal,) { 
      this.richForm = formBuilder.group({
        'content': [''],
      });
      this.content = this.richForm.controls['content'];
    }

  ngOnInit() {
    this.buildForm();
    this.getProblemBasedTemplateEncounter();
  }
  buildForm(){
    this.inputForm = this.formBuilder.group({
      plantxt: this.formBuilder.control(null, Validators.required),
      PEtxt: this.formBuilder.control(null, Validators.required),
      ROStxt: this.formBuilder.control(null, Validators.required),
      PMHtxt: this.formBuilder.control(null, Validators.required),
      HPItxt: this.formBuilder.control(null, Validators.required),
      RFVtxt: this.formBuilder.control(null, Validators.required)
    })    
  }
  selectedIndex=0;
  getProblemBasedTemplateEncounter(){
    this.encounterService.getProblemBasedTemplateEncounter(this.lookupList.practiceInfo.practiceId,this.objencounterToOpen.provider_id)
    .subscribe(
      data => {
        this.listTemplateResult = data;
        if(this.listTemplateResult.length>0)
        {
          this.selectedIndex=0;
          
            (this.inputForm.get("RFVtxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].rfv_txt==null?"":this.listTemplateResult[this.selectedIndex].rfv_txt);
            this.resizeTextarea("RFVtxt");
            (this.inputForm.get("HPItxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].hpi_txt==null?"":this.listTemplateResult[this.selectedIndex].hpi_txt);
            this.resizeTextarea("HPItxt");
            (this.inputForm.get("PMHtxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].pmh_txt==null?"":this.listTemplateResult[this.selectedIndex].pmh_txt);
            this.resizeTextarea("PMHtxt");
            (this.inputForm.get("ROStxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].ros_txt==null?"":this.listTemplateResult[this.selectedIndex].ros_txt);
            this.resizeTextarea("ROStxt");
            (this.inputForm.get("PEtxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].pe_txt==null?"":this.listTemplateResult[this.selectedIndex].pe_txt);
            this.resizeTextarea("PEtxt");
            (this.inputForm.get("plantxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].notes_txt==null?"":this.listTemplateResult[this.selectedIndex].notes_txt);
            this.resizeTextarea("plantxt");
debugger;
          //   var quill = new Quill('#richEditorTemp', {
          //     theme: 'snow'
          // });             
          //     this.richForm = this.formBuilder.group({
          //       'content': [this.lstCurrentEncounterData[0].plan==null?"":this.lstCurrentEncounterData[0].plan],
          //     });
          //     this.content = this.richForm.controls['content'];
          //     quill.setText(this.lstCurrentEncounterData[0].plan==null?"":this.lstCurrentEncounterData[0].plan);
            
        }
      },
      error => {
       // this.isLoading = false;
      }
    );
  }
  resizeTextarea(id) {
    debugger;
    var a = document.getElementById(id);
    if(a!=null)
    {
      a.style.height = 'auto';
      a.style.height = a.scrollHeight + 'px';
    }
}
PopTemplateSetup(val,indx){
  debugger;
    this.selectedIndex=indx;
    
    (this.inputForm.get("RFVtxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].rfv_txt==null?"":this.listTemplateResult[this.selectedIndex].rfv_txt);
    this.resizeTextarea("RFVtxt");
    (this.inputForm.get("HPItxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].hpi_txt==null?"":this.listTemplateResult[this.selectedIndex].hpi_txt);
    this.resizeTextarea("HPItxt");
    (this.inputForm.get("PMHtxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].pmh_txt==null?"":this.listTemplateResult[this.selectedIndex].pmh_txt);
    this.resizeTextarea("PMHtxt");
    (this.inputForm.get("ROStxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].ros_txt==null?"":this.listTemplateResult[this.selectedIndex].ros_txt);
    this.resizeTextarea("ROStxt");
    (this.inputForm.get("PEtxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].pe_txt==null?"":this.listTemplateResult[this.selectedIndex].pe_txt);
    this.resizeTextarea("PEtxt");
    (this.inputForm.get("plantxt") as FormControl).setValue(this.listTemplateResult[this.selectedIndex].notes_txt==null?"":this.listTemplateResult[this.selectedIndex].notes_txt);
    this.resizeTextarea("plantxt");
}
onApply(){
   

  let objApply:ORMChartTemplateApply=new ORMChartTemplateApply;
  objApply.patient_id=this.objencounterToOpen.patient_id.toString();
  objApply.chart_id=this.objencounterToOpen.chart_id.toString();
  objApply.practice_id=this.lookupList.practiceInfo.practiceId.toString();
  objApply.user=this.lookupList.logedInUser.user_name;

  objApply.rfv=(this.inputForm.get("RFVtxt").value==null?"":this.inputForm.get("RFVtxt").value);
  objApply.hpi=(this.inputForm.get("HPItxt").value==null?"":this.inputForm.get("HPItxt").value);
  objApply.pmh=(this.inputForm.get("PMHtxt").value==null?"":this.inputForm.get("PMHtxt").value);
  objApply.ros=(this.inputForm.get("ROStxt").value==null?"":this.inputForm.get("ROStxt").value);
  objApply.pe=(this.inputForm.get("PEtxt").value==null?"":this.inputForm.get("PEtxt").value);
  objApply.plan=(this.inputForm.get("plantxt").value==null?"":this.inputForm.get("plantxt").value);    
  debugger;
  let quill = new Quill('#richEditorTemp', {
    theme: 'snow'
  });
  quill.setText(this.inputForm.get("plantxt").value==null?"":this.inputForm.get("plantxt").value);

  let strHtml=quill.root.innerHTML;
  let arrHtml=strHtml.split('</p>');
  let notesHtml='';
  for(let p=0;p<arrHtml.length;p++)
  {
    if(arrHtml[p].replace('<p>','').trim()!='')
    {
      notesHtml+=arrHtml[p]+'</p>';
    }
  }
  objApply.plan_html=notesHtml;
debugger;
  this.encounterService.ApplyChartTemplate(objApply).subscribe(
    data => {
      if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
        this.activeModal.close("OK")
       // this.dataUpdated.emit();
      }
      else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
       // this.activeModal.dismiss('Error');
      }
    },
    error => {
    }
  );
}
}
