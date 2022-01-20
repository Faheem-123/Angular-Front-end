import { Component, OnInit, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'general-setup',
  templateUrl: './general-setup.component.html',
  styleUrls: ['./general-setup.component.css']
})
export class GeneralSetupComponent implements OnInit {

  canViewCDS:boolean=false;

  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {

    //if(this.lookupList.logedInUser.user_name.toLowerCase()=='admin')
    {
      this.canViewCDS=true; // Ony accessible to admin
    }

    
  }

}
