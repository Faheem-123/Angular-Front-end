import { Component, OnInit, Injectable, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { LogParameters } from '../log-parameters';
const now = new Date();

@Component({
  selector: 'log-main',
  templateUrl: './log-main.component.html',
  styleUrls: ['./log-main.component.css']
})


export class LogMainComponent implements OnInit {

  encounterAccessLogTabVisible: boolean = false;
  auditLogTabVisible: boolean = false;
  auditLogTabTitle: string = "Log";


  selectedTab: string = "tab_patient_access_log";

  param: LogParameters;

  constructor() { }
  ngOnInit() {
  }

  onTabChange(event: NgbTabChangeEvent) {

    debugger;
    this.selectedTab = event.nextId;
    switch (event.nextId) {
      case 'tab_patient_access_log':
        this.param = undefined;
        this.auditLogTabVisible = false;
        this.auditLogTabTitle = "Log";
        this.encounterAccessLogTabVisible = false;
        break;
      case 'tab_ecnounter_access_log':
        this.encounterAccessLogTabVisible = true;
        this.auditLogTabVisible = false;
        this.auditLogTabTitle = "Log";
        break;
      //case 'tab_audit_log':
      //  this.auditLogTabTitle = this.param.logDisplayName;
      //  this.auditLogTabVisible = true;

      //  break;
    }
  }


  showLog(p: LogParameters) {
    debugger;

    this.param = p;

    switch (this.param.logName) {
      case "patient_log":
      case "encounter_log":
      case "data_export_log":
      case "ccda_log":
        this.auditLogTabTitle = this.param.logDisplayName;
        this.auditLogTabVisible = true;
        this.selectedTab = "tab_audit_log";
        break;
      case "encounter_access_log":
        this.encounterAccessLogTabVisible = true;
        this.selectedTab = "tab_ecnounter_access_log";
        this.auditLogTabVisible = false;
        this.auditLogTabTitle = "Log";
        break;
      default:
        break;
    }

  }

}
