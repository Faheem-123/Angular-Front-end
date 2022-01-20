import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';

@Component({
  selector: 'pre-natal',
  templateUrl: './pre-natal.component.html',
  styleUrls: ['./pre-natal.component.css']
})
export class PreNatalComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
