import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';

@Component({
  selector: 'injury-treatment',
  templateUrl: './injury-treatment.component.html',
  styleUrls: ['./injury-treatment.component.css']
})
export class InjuryTreatmentComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  isLoading=false;
  noRecordFound=false;
  canView=false;

  constructor(  @Inject(LOOKUP_LIST) public lookupList: LookupList) { 
    this.canView = this.lookupList.UserRights.view_personal_injury;
    //this.canAddEdit = this.lookupList.UserRight.iju;

  }

  ngOnInit() {
  }

}
