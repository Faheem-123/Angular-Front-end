import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ehr-main',
  templateUrl: './ehr-main.component.html',
  styleUrls: ['./ehr-main.component.css']
})
export class EhrMainComponent implements OnInit {

  @Output() practiceSwitch = new EventEmitter<any>();

  constructor() {
  }
  ngOnInit() {

  }
}
