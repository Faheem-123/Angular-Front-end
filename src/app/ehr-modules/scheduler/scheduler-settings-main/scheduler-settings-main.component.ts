import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'scheduler-settings-main',
  templateUrl: './scheduler-settings-main.component.html',
  styleUrls: ['./scheduler-settings-main.component.css']
})
export class SchedulerSettingsMainComponent implements OnInit {

  @Input() bac_tabl_title: string = "Back";
  @Output() onCallBack = new EventEmitter<any>();
  selectedTab: string = "tab-office-timing";

  constructor() { }

  ngOnInit() {
  }


  onTabChange(event: NgbTabChangeEvent) {
    this.selectedTab = event.nextId;
    switch (event.nextId) {
      case 'tab_back_from_scheduler_settings':
        this.onCallBack.emit();
        break;
      default:
        break;
    }
  }

}
