import { Component, OnInit, Input, Inject, Output, EventEmitter, ElementRef } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ORMChartTemplateApply } from 'src/app/models/encounter/orm-chartTemplateApply';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as Quill from 'quill';
import { patientTemplateData } from 'src/app/models/encounter/patientTemplateData';
import { DateTimeUtil,DateTimeFormat } from 'src/app/shared/date-time-util';
@Component({
  selector: 'template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  @Input() objencounterToOpen:EncounterToOpen;
  @Input() objpatientTemplateData:patientTemplateData;
  
  @Input() callingFrom='';
  @Input() module_txt='';
  @Output() dataUpdated = new EventEmitter<any>();
  provider_id;
  inputForm: FormGroup ;
  richForm: FormGroup;
  public content: AbstractControl;
  lstCurrentEncounterData;
  constructor(private formBuilder: FormBuilder,private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,public activeModal: NgbActiveModal,
    private dateTimeUtil: DateTimeUtil,
    private hostElement: ElementRef) { 
      this.richForm = formBuilder.group({
        'content': [''],
      });
      this.content = this.richForm.controls['content'];
    }

  ngOnInit() {
    //this.provider_id=this.objencounterToOpen.provider_id;
    this.buildForm();
    if(this.callingFrom=="All")
      this.getCurrentEncounterData(this.objencounterToOpen.chart_id.toString());
  }
  getCurrentEncounterData(chart_id:string){
    this.encounterService.getCurrentEncounterTemplate(chart_id)
    .subscribe(
      data => {
        this.lstCurrentEncounterData = data;
        if(this.lstCurrentEncounterData.length>0)
        {
            (this.inputForm.get("RFVtxt") as FormControl).setValue(this.lstCurrentEncounterData[0].rfv==null?"":this.lstCurrentEncounterData[0].rfv);
            this.resizeTextarea("RFVtxt");
            (this.inputForm.get("HPItxt") as FormControl).setValue(this.lstCurrentEncounterData[0].hpi==null?"":this.lstCurrentEncounterData[0].hpi);
            this.resizeTextarea("HPItxt");
            (this.inputForm.get("PMHtxt") as FormControl).setValue(this.lstCurrentEncounterData[0].pmh==null?"":this.lstCurrentEncounterData[0].pmh);
            this.resizeTextarea("PMHtxt");
            (this.inputForm.get("ROStxt") as FormControl).setValue(this.lstCurrentEncounterData[0].ros==null?"":this.lstCurrentEncounterData[0].ros);
            this.resizeTextarea("ROStxt");
            (this.inputForm.get("PEtxt") as FormControl).setValue(this.lstCurrentEncounterData[0].pe==null?"":this.lstCurrentEncounterData[0].pe);
            this.resizeTextarea("PEtxt");
            (this.inputForm.get("plantxt") as FormControl).setValue(this.lstCurrentEncounterData[0].plan==null?"":this.lstCurrentEncounterData[0].plan);
            this.resizeTextarea("plantxt");
debugger;
            var quill = new Quill('#richEditorTemp', {
              theme: 'snow'
          });             
              this.richForm = this.formBuilder.group({
                'content': [this.lstCurrentEncounterData[0].plan==null?"":this.lstCurrentEncounterData[0].plan],
              });
              this.content = this.richForm.controls['content'];
              quill.setText(this.lstCurrentEncounterData[0].plan==null?"":this.lstCurrentEncounterData[0].plan);
            
        }
      },
      error => {
       // this.isLoading = false;
      }
    );
  }
  buildForm(){
    this.inputForm = this.formBuilder.group({
      plantxt: this.formBuilder.control(null, Validators.required),
      PEtxt: this.formBuilder.control(null, Validators.required),
      ROStxt: this.formBuilder.control(null, Validators.required),
      PMHtxt: this.formBuilder.control(null, Validators.required),
      HPItxt: this.formBuilder.control(null, Validators.required),
      RFVtxt: this.formBuilder.control(null, Validators.required),
      extendertxt: this.formBuilder.control(null, Validators.required)
    })
    if(this.callingFrom=="RFV")
    {
      (this.inputForm.get("RFVtxt") as FormControl).setValue(this.module_txt);
      this.resizeTextarea("RFVtxt");
    }
    if(this.callingFrom=="HPI")
    {
      (this.inputForm.get("HPItxt") as FormControl).setValue(this.module_txt);
      this.resizeTextarea("HPItxt");
    }
    if(this.callingFrom=="chart")
    {
      (this.inputForm.get("plantxt") as FormControl).setValue(this.module_txt);
      this.resizeTextarea("plantxt");
    }
    if(this.callingFrom=="PMH")
    {
      (this.inputForm.get("PMHtxt") as FormControl).setValue(this.module_txt);
      this.resizeTextarea("PMHtxt");
    }
    if(this.callingFrom=="ROS")
    {
      (this.inputForm.get("ROStxt") as FormControl).setValue(this.module_txt);
      this.resizeTextarea("ROStxt");
    }
    if(this.callingFrom=="PE")
    {
      (this.inputForm.get("PEtxt") as FormControl).setValue(this.module_txt);
      this.resizeTextarea("PEtxt");
    }
    if(this.callingFrom=="extender")
    {
      (this.inputForm.get("extendertxt") as FormControl).setValue(this.module_txt);
      this.resizeTextarea("extendertxt");
    }
    
    
  }
  
  dataAdd(value)
  {
    debugger;
    if(value.split("~")[0]=="RFV")
    {
      if(this.inputForm.get("RFVtxt").value==null || this.inputForm.get("RFVtxt").value=="" )
        (this.inputForm.get("RFVtxt") as FormControl).setValue(value.split("~")[1]);
      else
        (this.inputForm.get("RFVtxt") as FormControl).setValue(this.inputForm.get("RFVtxt").value+"\n"+value.split("~")[1]);

      this.resizeTextarea("RFVtxt");
    }
    else if(value.split("~")[0]=="HPI")
    {
      if(this.inputForm.get("HPItxt").value==null  || this.inputForm.get("HPItxt").value=="")
        (this.inputForm.get("HPItxt") as FormControl).setValue(value.split("~")[1]);
      else
        (this.inputForm.get("HPItxt") as FormControl).setValue(this.inputForm.get("HPItxt").value+"\n"+value.split("~")[1]);

      this.resizeTextarea("HPItxt");
    }
    else if(value.split("~")[0]=="PMH")
    {
      if(this.inputForm.get("PMHtxt").value==null || this.inputForm.get("PMHtxt").value=="")
        (this.inputForm.get("PMHtxt") as FormControl).setValue(value.split("~")[1]);
      else
        (this.inputForm.get("PMHtxt") as FormControl).setValue(this.inputForm.get("PMHtxt").value+"\n"+value.split("~")[1]);

      this.resizeTextarea("PMHtxt");
    }
    else if(value.split("~")[0]=="ROS")
    {
      if(this.inputForm.get("ROStxt").value==null || this.inputForm.get("ROStxt").value=="")
        (this.inputForm.get("ROStxt") as FormControl).setValue(value.split("~")[1]);
      else
        (this.inputForm.get("ROStxt") as FormControl).setValue(this.inputForm.get("ROStxt").value+"\n"+value.split("~")[1]);

      this.resizeTextarea("ROStxt");
    }
    else if(value.split("~")[0]=="PE")
    {
      if(this.inputForm.get("PEtxt").value==null || this.inputForm.get("PEtxt").value=="")
        (this.inputForm.get("PEtxt") as FormControl).setValue(value.split("~")[1]);
      else
        (this.inputForm.get("PEtxt") as FormControl).setValue(this.inputForm.get("PEtxt").value+"\n"+value.split("~")[1]);

      this.resizeTextarea("PEtxt");
    }
    else if(value.split("~")[0]=="extender")
    {
      if(this.inputForm.get("extendertxt").value==null || this.inputForm.get("extendertxt").value=="")
        (this.inputForm.get("extendertxt") as FormControl).setValue(value.split("~")[1]);
      else
        (this.inputForm.get("extendertxt") as FormControl).setValue(this.inputForm.get("extendertxt").value+"\n"+value.split("~")[1]);

      this.resizeTextarea("extendertxt");
    }
    
    else if(value.split("~")[0]=="chart")
    {
      var quill = new Quill('#richEditorTemp', {
        theme: 'snow'
    });
      if(this.inputForm.get("plantxt").value==null || this.inputForm.get("plantxt").value=="")
      {
        (this.inputForm.get("plantxt") as FormControl).setValue(value.split("~")[1]);
       
        this.richForm = this.formBuilder.group({
          'content': [value.split("~")[1]],
        });
        this.content = this.richForm.controls['content'];
        quill.setText(value.split("~")[1]);
      }
      else{
        (this.inputForm.get("plantxt") as FormControl).setValue(this.inputForm.get("plantxt").value+"\n"+value.split("~")[1]);
        this.richForm = this.formBuilder.group({
          'content': [this.inputForm.get("plantxt").value+"<br/>"+value.split("~")[1]],
        });
        this.content = this.richForm.controls['content'];
        quill.setText(this.inputForm.get("plantxt").value+"<br/>"+value.split("~")[1]);
      }

      this.resizeTextarea("plantxt");
      
    } 
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
  onApply(){
    if(this.callingFrom=="RFV")
    {
      this.activeModal.close(this.inputForm.get("RFVtxt").value==null?"":this.inputForm.get("RFVtxt").value)
      return;
    }
    if(this.callingFrom=="HPI")
    {
      this.activeModal.close(this.inputForm.get("HPItxt").value==null?"":this.inputForm.get("HPItxt").value)
      return;
    }
    if(this.callingFrom=="PMH")
    {
      this.activeModal.close(this.inputForm.get("PMHtxt").value==null?"":this.inputForm.get("PMHtxt").value)
      return;
    }
    if(this.callingFrom=="ROS")
    {
      this.activeModal.close(this.inputForm.get("ROStxt").value==null?"":this.inputForm.get("ROStxt").value)
      return;
    }
    if(this.callingFrom=="PE")
    {
      this.activeModal.close(this.inputForm.get("PEtxt").value==null?"":this.inputForm.get("PEtxt").value)
      return;
    }
    if(this.callingFrom=="extender")
    {
      this.activeModal.close(this.inputForm.get("extendertxt").value==null?"":this.inputForm.get("extendertxt").value)
      return;
    }
    
    if(this.callingFrom=="chart")
    {
      this.activeModal.close(this.inputForm.get("plantxt").value==null?"":this.inputForm.get("plantxt").value)
      return;
    }

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
  openEncounterSummary=false;
  lstPreviousEncounters;
  onPreviousEncounter(){

    this.encounterService.getTemplateEncSummary(this.objencounterToOpen.patient_id.toString(),this.objencounterToOpen.chart_id.toString()).subscribe(
      data => {
        debugger;
      this.lstPreviousEncounters=data;
        if(this.lstPreviousEncounters.length>0)
        {
          this.openEncounterSummary=true;
        }
      },
      error => {
      }
    );
  }
  openChart(enc){
    this.openEncounterSummary=false;
    this.getCurrentEncounterData(enc.chart_id);
  }
  onBackToPreview()
  {
    this.openEncounterSummary=false;
    
  }
}
