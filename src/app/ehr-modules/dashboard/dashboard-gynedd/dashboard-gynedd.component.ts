import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { LogMessage } from "../../../shared/log-message";
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'dashboard-gynedd',
  templateUrl: './dashboard-gynedd.component.html',
  styleUrls: ['./dashboard-gynedd.component.css']
})
export class DashboardGyneddComponent implements OnInit {
  @Output() widgetUpdate = new EventEmitter<any>();
  eddcount;
  listEddResult;
  isLoading: boolean = false;
  constructor(private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    this.getgynEDD(this.lookupList.practiceInfo.practiceId);
  }
  refreshEDD(){
    this.getgynEDD(this.lookupList.practiceInfo.practiceId);
  }
  getgynEDD(practice_id){
    debugger;
    this.isLoading = true;
    this.dashboardService.getgynEDD(practice_id)
    .subscribe(
      data=>
      {
        this.listEddResult = data
        this.eddcount = this.listEddResult.length;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.logMessage.log("EDD register Successfull" + error);
      }
    );
  }

}
