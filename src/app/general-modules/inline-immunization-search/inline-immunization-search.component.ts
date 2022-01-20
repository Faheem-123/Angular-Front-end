import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchService } from 'src/app/services/search.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { EncounterService } from 'src/app/services/encounter/encounter.service';

@Component({
  selector: 'inline-immunization-search',
  templateUrl: './inline-immunization-search.component.html',
  styleUrls: ['./inline-immunization-search.component.css']
})
export class InlineImmunizationSearchComponent implements OnInit {  
  @Input() lstImmunization:Array<any>;
  @Output() onSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  
  constructor() { }

  ngOnInit() { 
  }
}
