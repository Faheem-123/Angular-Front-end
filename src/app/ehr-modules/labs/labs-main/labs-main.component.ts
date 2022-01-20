import { Component, OnInit, Inject } from '@angular/core';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'labs-main',
  templateUrl: './labs-main.component.html',
  styleUrls: ['./labs-main.component.css']
})
export class LabsMainComponent implements OnInit {

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
  }
  onTabChange(event: NgbTabChangeEvent) {
    
  }
}
