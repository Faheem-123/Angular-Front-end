import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import "../../../assets/js/ehr.js";
import { FormBuilder, FormGroup } from '@angular/forms';
import { GeneralOperation } from 'src/app/shared/generalOperation.js';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe.js';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module.js';


declare var myExtObject:any;

@Component({
  selector: 'newcrop',
  templateUrl: './newcrop.component.html',
  styleUrls: ['./newcrop.component.css']
})
export class NewcropComponent implements OnInit {

  post_form:FormGroup;
  @Input() patient_name;
  @Input() post_xml;
  @Input() prescription_link;
  //@Output() BacktoMain = new EventEmitter<any>();
  @Input() canDownloadXml:string;
  
  constructor(public activeModal: NgbActiveModal,private formBuilder:FormBuilder) { }
  
  
  ngOnInit() {
    debugger;
    this.post_form = this.formBuilder.group({
      RxInput: this.formBuilder.control(this.post_xml),
    })
    this.loadIrx();
   
  }

  loadIrx()
  {
   myExtObject.loadIrx(this.post_xml,this.prescription_link);

  }

  closePrescription()
  {
    this.activeModal.close('Alergies');   
  }

  DloadXml()
  {
    GeneralOperation.dyanmicDownloadByHtmlTag({
      fileName:this.patient_name+'.xml',
      text: this.post_xml
    // alert(this.post_xml);
  });
}
}
