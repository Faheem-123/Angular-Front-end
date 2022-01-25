import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil,DateTimeFormat } from 'src/app/shared/date-time-util';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { patientTemplateData } from 'src/app/models/encounter/patientTemplateData';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'template-module',
  templateUrl: './template-module.component.html',
  styleUrls: ['./template-module.component.css']
})
export class TemplateModuleComponent implements OnInit {

  @Input() moduleName: string;
  @Input() DisplayName: string;
  @Input() provider_id: string;
  @Output() dataUpdated = new EventEmitter<any>();
  lstTemplate: Array<any>;
  inputForm: FormGroup;
  @Input() objpatientTemplateData:patientTemplateData;
  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private logMessage: LogMessage,private general: GeneralOperation,
    private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {
    this.buildForm();
    this.getTemplateText();
  }
   removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
     return newArray;
}

  getTemplateText() {
    if(this.moduleName=="extender")
    {
      this.encounterService.getTemlplateText(this.lookupList.practiceInfo.practiceId.toString(),"-1",this.moduleName)
      .subscribe(
        data => {
          this.lstTemplate = data as Array<any>;
           this.lstTemplate = this.removeDuplicates(this.lstTemplate, "name");

          //this.lstTemplate = Array.from(this.lstTemplate.reduce((m, t) => m.set(t.name, t), new Map()).values());

          if(this.lstTemplate!=null && this.lstTemplate.length>0)
          {
            this.onAssignText(this.lstTemplate[0]);
          }
        },
        error => {
         // this.isLoading = false;
        }
      );
    }
    else{
    this.encounterService.getTemlplateText(this.lookupList.practiceInfo.practiceId.toString(),this.provider_id,this.moduleName)
      .subscribe(
        data => {
          this.lstTemplate = data as Array<any>;
          this.lstTemplate = this.removeDuplicates(this.lstTemplate, "name");
         // this.lstTemplate = Array.from(this.lstTemplate.reduce((m, t) => m.set(t.name, t), new Map()).values());

          if(this.lstTemplate!=null && this.lstTemplate.length>0)
          {
            this.onAssignText(this.lstTemplate[0]);
          }
        },
        error => {
         // this.isLoading = false;
        }
      );
    }
  }
  buildForm(){
    this.inputForm = this.formBuilder.group({
      tmptxt: this.formBuilder.control(null, Validators.required),
    })
  }
  rowId="";
  onAssignText(tmp)
  {
    (this.inputForm.get("tmptxt") as FormControl).setValue(tmp.text);
    this.rowId = tmp.id;
  }
  onAdd(value){
    debugger;
    if(this.objpatientTemplateData!=null && this.objpatientTemplateData!=undefined)
    {
      value=this.qqfesc80rqna4ljmv0ga2m5m6f58twm7nqc27h0gx2(value);
    }
    this.dataUpdated.emit(this.moduleName+"~"+value);
  }
  qqfesc80rqna4ljmv0ga2m5m6f58twm7nqc27h0gx2(value)
  {
    //{{date}} {{patient}}  {{datetime}} {{now}} {{office}} {{age}} {{gender}}
    //{{pulse}} {{height}}  {{weight}}{{blood_pressure}}    {{oxygen_saturation}} {{bmi}} {{smoking_status}}
    value=this.general.ReplaceAll(value,'{{date}}',this.objpatientTemplateData.visit_date);
    value=this.general.ReplaceAll(value,'{{patient}}',this.objpatientTemplateData.patient_name);
    value=this.general.ReplaceAll(value,'{{datetime}}',this.objpatientTemplateData.visit_date);
    value=this.general.ReplaceAll(value,'{{dob}}',this.objpatientTemplateData.patient_dob_101);
    value=this.general.ReplaceAll(value,'{{now}}',this.objpatientTemplateData.visit_date);//this.dateTimeUtil.getTimeModelFromTimeString(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_MM_DD_YYYY).toString());
    value=this.general.ReplaceAll(value,'{{office}}',this.objpatientTemplateData.location_name);
    value=this.general.ReplaceAll(value,'{{age}}',this.objpatientTemplateData.patient_age);
    value=this.general.ReplaceAll(value,'{{gender}}',this.objpatientTemplateData.patient_gender);
    value=this.general.ReplaceAll(value,'{{pulse}}',this.objpatientTemplateData.pulse);
    value=this.general.ReplaceAll(value,'{{height}}',this.objpatientTemplateData.height);
    value=this.general.ReplaceAll(value,'{{weight}}',this.objpatientTemplateData.weight);
    value=this.general.ReplaceAll(value,'{{blood_pressure}}',this.objpatientTemplateData.blood_pressure);
    value=this.general.ReplaceAll(value,'{{oxygen_saturation}}',this.objpatientTemplateData.oxygen_saturation);
    value=this.general.ReplaceAll(value,'{{bmi}}',this.objpatientTemplateData.bmi);
    value=this.general.ReplaceAll(value,'{{smoking_status}}','');
    return value;
  }
}
