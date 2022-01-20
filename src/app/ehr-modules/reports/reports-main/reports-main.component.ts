import { Component, OnInit, Inject } from '@angular/core';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'reports-main',
  templateUrl: './reports-main.component.html',
  styleUrls: ['./reports-main.component.css']
})
export class ReportsMainComponent implements OnInit {


  componentName = "";

  lstAppiontmentReportData:Array<any>;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList) {
    this.lstAppiontmentReportData = new Array();
    this.lstAppiontmentReportData.push(new ORMKeyValue('callingFrom', CallingFromEnum.REPORTS));
   }
  ngOnInit() {
    this.generalOnChange('encounter-report');
  }
  generalOnChange(value){
    debugger;
    this.componentName=value;
  }
}
