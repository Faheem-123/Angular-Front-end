import { Component, OnInit, Input } from '@angular/core';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LogParameters } from '../log-parameters';

@Component({
  selector: 'log-pop-up',
  templateUrl: './log-pop-up.component.html',
  styleUrls: ['./log-pop-up.component.css']
})
export class LogPopUpComponent implements OnInit {

  @Input() param: LogParameters;

  logName: string;
  logMainTitle: string;
  logDisplayName: string = "Log";
  datetimeFrom: string;
  datetimeTo: string;
  datetimeFromFlag: string; // date|datetime
  datetimeToFlag: string;// date|datetime
  userName: string;
  patientId: number;
  PID: string;
  patientName: string;
  enableSearch: boolean = true;
  callingFrom: CallingFromEnum;
  lstOtherCriteria: Array<ORMKeyValue>;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {

    if (this.param != undefined) {
      this.logDisplayName = this.param.logDisplayName;
      if (this.logMainTitle == undefined) {
        this.logMainTitle = this.param.logDisplayName;
      }
    }
  }

}
