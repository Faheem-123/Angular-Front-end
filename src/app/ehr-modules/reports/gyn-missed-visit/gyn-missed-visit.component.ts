import { Component, OnInit, Inject } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'gyn-missed-visit',
  templateUrl: './gyn-missed-visit.component.html',
  styleUrls: ['./gyn-missed-visit.component.css']
})
export class GynMissedVisitComponent implements OnInit {
  lstMissedVisit;
  practice_id;
  recordCount;

  constructor(private reportsService:ReportsService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
  }

  searchMissedVisit()
  {
    this.practice_id =this.lookupList.practiceInfo.practiceId;
    this.reportsService.getgynMissedVisit(this.practice_id).subscribe(
      data => {this.lstMissedVisit = data;
        this.recordCount = this.lstMissedVisit['length'];},
        error => {alert("Error is : "+error); })
      }

}
