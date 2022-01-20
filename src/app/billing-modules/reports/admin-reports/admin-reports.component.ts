import { Component, OnInit, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {



  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList) { 
    this.lookupList.logedInUser.user_name.toLocaleLowerCase()=='bill@ihc'
  }

  ngOnInit() {
  }

}
