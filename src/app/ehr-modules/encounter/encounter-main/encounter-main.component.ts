import { Component, OnInit,Input,Output,EventEmitter, Inject } from '@angular/core';
import { EncounterToOpen } from '../../../models/encounter/EncounterToOpen';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'encounter-main',
  templateUrl: './encounter-main.component.html',
  styleUrls: ['./encounter-main.component.css']
})
export class EncounterMainComponent implements OnInit {
@Input() moduleName:string;
@Input() objencounterToOpen:EncounterToOpen;
//@Input() openPatientInfo;
@Output() dataUpdated = new EventEmitter<any>();
  constructor( @Inject(LOOKUP_LIST) public lookupList: LookupList) {

   
   }

  ngOnInit() {

    //debugger;
    //alert(this.moduleId);
  }

}
