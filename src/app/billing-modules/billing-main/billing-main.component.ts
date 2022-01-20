import { Component, OnInit, Inject } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'billing-main',
  templateUrl: './billing-main.component.html',
  styleUrls: ['./billing-main.component.css']
})
export class BillingMainComponent implements OnInit {

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
     
    if(this.lookupList.practiceInfo.practiceId.toString()=='524' && this.lookupList.logedInUser.user_name.toString().toLowerCase() !='bill@ihc')
    {

    }
  }

}
