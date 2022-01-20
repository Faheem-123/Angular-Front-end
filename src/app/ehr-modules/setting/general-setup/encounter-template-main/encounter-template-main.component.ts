import { Component, OnInit, Inject } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'encounter-template-main',
  templateUrl: './encounter-template-main.component.html',
  styleUrls: ['./encounter-template-main.component.css']
})
export class EncounterTemplateMainComponent implements OnInit {

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,) { }

  ngOnInit() {
    
  }

}
