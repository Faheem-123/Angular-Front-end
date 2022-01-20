import { Component, OnInit, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { ReportsService } from 'src/app/services/reports.service';

@Component({
  selector: 'users-admin-settings',
  templateUrl: './users-admin-settings.component.html',
  styleUrls: ['./users-admin-settings.component.css']
})
export class UsersAdminSettingsComponent implements OnInit {

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, 
  private logMessage: LogMessage,
  private reportsService: ReportsService) { }

  showModule=true;
  acUserModuels: Array<any>;
  componentName = "";

  ngOnInit() {
    this.getusermodules();
  }
  getusermodules() {
    debugger;
     this.reportsService.getusermodules(this.lookupList.logedInUser.userRole, this.lookupList.practiceInfo.practiceId.toString())
       .subscribe(
         data => {
          debugger;
           this.acUserModuels = undefined;
           this.acUserModuels = data as Array<any>;
          //  if (this.acUserModuels)
          //   this.generalOnChange(this.acUserModuels[0].module_name);
            this.showModule =false;
             for (let i = 0; i < this.acUserModuels.length; i++) 
             {
               if(this.acUserModuels[i].is_enabled == 1)
               {
                  this.generalOnChange(this.acUserModuels[0].module_name);
                  this.showModule =true;
                  break;
               }
            }
         },
         error => alert(error),
         () => this.logMessage.log("get Admin User Modules Successfull.")
       );
   }
   generalOnChange(value){
    debugger;
    this.componentName=value;

    // switch (value) {
    //   case "DashBoard Settings":
    //   this.componentName = "DashBoard Settings";
    //   break;
      
    //   case "Fax Contact List":
    //   this.componentName = "Fax Contact List";
    //   break;

    //   case "Encounter Settings":
    //   this.componentName = "Encounter Settings";
    //   break;
      
    //   case "Insurances":
    //   this.componentName = "Insurances";
    //   break;
      
    //   case "My List":
    //   this.componentName = "My List";
    //   break;

    //   case "Template Setup":
    //   this.componentName = "Template Setup";
    //   break;
    // }
  }
}