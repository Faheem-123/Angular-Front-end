import { Component, OnInit, Inject } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';

@Component({
  selector: 'user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.css']
})
export class UserAdminComponent implements OnInit {
  acUserModuels: Array<any>;

  balanceReminderCalls: Boolean = false;
  cssCallLog: Boolean = false;
  dashBoardSettings: Boolean = false;
  encounterSettings: Boolean = false;
  eOB: Boolean = false;
  faxContactList: Boolean = false;
  iCD10GuideLine: Boolean = false;
  immunizationInventory: Boolean = false;
  immunizationRegistry: Boolean = false;
  insuranceSites: Boolean = false;
  insurances: Boolean = false;
  issueTracker: Boolean = false;
  myCDSRules: Boolean = false;
  myList: Boolean = false;
  patientSummaryModules: Boolean = false;
  practiceInsurances: Boolean = false;
  providerTemplates: Boolean = false;
  referralInfo: Boolean = false;
  referralRequest: Boolean = false;
  referringProvider: Boolean = false;
  routesInfo: Boolean = false;
  scheduleAppointments: Boolean = false;
  statement: Boolean = false;
  
  componentName = "Dashboard Setting";

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, private logMessage: LogMessage,
    private reportsService: ReportsService) { }

  ngOnInit() {
   // this.getusermodules();
  }
  // getusermodules() {
  //   this.reportsService.getusermodules(this.lookupList.practiceInfo.practiceId)
  //     .subscribe(
  //       data => {
  //         this.acUserModuels = undefined;
  //         this.acUserModuels = data as Array<any>;
  //         //if (this.acUserModuels)
  //           //for (let i = 0; i < this.acUserModuels.length; i++) {
  //             //this.showHideModule(this.acUserModuels[i].module_name);
  //           //}
  //       },
  //       error => alert(error),
  //       () => this.logMessage.log("get Admin User Modules Successfull.")
  //     );
  // }
  generalOnChange(module_name) {
    debugger;
    switch (module_name) {
      case "Balance Reminder Calls":
        this.componentName = "Balance Reminder Calls";
        break;

      case "CSS Call Log":
        this.componentName = "CSS Call Log";
        break;

      case "DashBoard Settings":
        this.componentName = "DashBoard Settings";
        break;

      case "Encounter Settings":
        this.componentName = "Encounter Settings";
        break;

      case "EOB's":
        this.componentName = "EOBs";
        break;

      case "Fax Contact List":
        this.componentName = "Fax Contact List";
        break;

      case "ICD-10 GuideLine":
        this.componentName = "ICD10 GuideLine";
        break;

      case "Immunization Inventory":
        this.componentName = "Immunization Inventory";
        break;

      case "Immunization Registry":
        this.componentName = "Immunization Registry";
        break;

      case "Insurance Sites":
        this.componentName = "Insurance Sites";
        break;

      case "Insurances":
        this.componentName = "Insurances";
        break;

      case "Issue Tracker":
        this.componentName = "Issue Tracker";
        break;

      case "My CDS Rules":
        this.componentName = "My CDS Rules";
        break;

      case "My List":
        this.componentName = "My List";
        break;

      case "Patient Summary Modules":
        this.componentName = "Patient Summary Modules";
        break;

      case "Practice Insurances":
        this.componentName = "Practice Insurances";
        break;

      case "Provider Templates":
        this.componentName = "Provider Templates";
        break;

      case "Referral Info":
        this.componentName = "Referral Info";
        break;

      case "Referral Request":
        this.componentName = "Referral Request";
        break;

      case "Referring Provider":
        this.componentName = "Referring Provider";
        break;

      case "Routes Info":
        this.componentName = "Routes Info";
        break;

      case "Schedule Appointments":
        this.componentName = "Schedule Appointments";
        break;

      case "Statement":
        this.componentName = "Statement";
        break;

    }
  }
}
