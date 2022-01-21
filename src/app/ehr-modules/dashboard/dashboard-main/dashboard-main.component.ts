import { Component, OnInit, ViewChild, EventEmitter, Output, ElementRef, Inject } from '@angular/core';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { CallingFromEnum, OperationType } from 'src/app/shared/enum-util';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { DashboardPendingencounterComponent } from '../dashboard-pendingencounter/dashboard-pendingencounter.component';
import { DashboardPendingresultsComponent } from '../dashboard-pendingresults/dashboard-pendingresults.component';
import { GetPrescriptionAllergies } from 'src/app/models/encounter/GetPrescriptionAllergies';
import { NewCropXML } from 'src/app/shared/NewCropXML';
import { debug } from 'util';
import { DashboardPendingclaimsComponent } from '../dashboard-pendingclaims/dashboard-pendingclaims.component';

@Component({
  selector: 'dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.css']
})
export class DashboardMainComponent implements OnInit {

  @ViewChild(DashboardPendingresultsComponent) dashboardPendingresultsComponent: DashboardPendingresultsComponent;
  @ViewChild(DashboardPendingclaimsComponent) dashboardPendingclaimsComponent: DashboardPendingclaimsComponent;

  User_type="";

  loadmodule = false;
  patient_id;
  order_id;
  module_name = '';
  openedClaimInfo: OpenedClaimInfo;
  lstModules;
  isLoading = true;
  patientName: string = "";

  lstCountWidgets: Array<any> = [
    { moduleName: 'checkedinpatient', sequence: 10 },
    { moduleName: 'cashregister', sequence: 11 },
    { moduleName: 'refills', sequence: 12 },
    { moduleName: 'pendingresults', sequence: 13 },
    { moduleName: 'pendingclaims', sequence: 14 },
    { moduleName: 'unreadfaxes', sequence: 15 }
  ];

  constructor(private dashboardService: DashboardService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private el: ElementRef,
    private genXml: NewCropXML,) {
  }

  ngOnInit() {
    debugger
    this.getLabPendingResults_Widget();
    this.getRefill_Widget();
    this.getCheckedInPatient_Widget();
    this.getUnReadFaxes_Widget();
    this.getPendingClaims_Widget();
    this.getCashPayment_Widget();
    this.User_type=this.lookupList.logedInUser.userType.toUpperCase();
    var prac_id: String = this.lookupList.practiceInfo.practiceId.toString();
    if (this.lookupList.logedInUser.user_name.toUpperCase().search("@IHC") > -1 || this.lookupList.logedInUser.userType.toUpperCase() == 'BILLING')//if(this.lookupList.logedInUser.user_name.toUpperCase()=="BILL@IHC")// if(this.lookupList.logedInUser.user_name.toUpperCase().search("@IHC")>-1)
    {
      prac_id = "499";//only get the settings
    }
    this.dashboardService.getDashBoardModule(this.lookupList.logedInUser.userId, prac_id)
      //(this.lookupList.logedInUser.userType.toUpperCase() == 'BILLING' ? this.lookupList.logedInUser.userPracticeId : this.lookupList.practiceInfo.practiceId))
      .subscribe(
        data => {
          this.lstModules = data;
          if (this.lstModules == undefined || this.lstModules.length == 0) {
            //this.noRecordFound = true;
          }
          else {


            let sequence: number = 1;
            this.lstModules.forEach(m => {

              this.lstCountWidgets.forEach(w => {
                if (w.moduleName == m.name) {
                  w.sequence = sequence;
                  sequence++;
                }
              });


            });

            this.lstCountWidgets = this.lstCountWidgets.sort((a, b) => (a.sequence < b.sequence ? -1 : 1));

          }
          this.isLoading = false;
        },
        error => {
        }
      );
  }
  widget_Refill = 0;
  getRefill_Widget() {
    debugger;
    this.widget_Refill = 0;
    let getRefillData: GetPrescriptionAllergies = new GetPrescriptionAllergies();
    getRefillData = this.genXml.prepareGetObjectRefills(getRefillData, this.lookupList);

    getRefillData.options = 'Refills';
    getRefillData.providerid = this.lookupList.logedInUser.defaultProvider;// "50010113"; // this will be default_physician

    this.dashboardService.getRefillsData(getRefillData)
      .subscribe(
        data => {
          if (data != null && data != undefined) {
            this.widget_Refill = data.length;
          }
          else {
            this.widget_Refill = 0;
          }
        },
        error => {
        }
      );
  }
  widget_PendingResult = 0;
  getLabPendingResults_Widget() {
    this.widget_PendingResult = 0;
    this.dashboardService.getLabPendingResults_Widget(this.lookupList.logedInUser.defaultProvider, "0", "All", "0")
      .subscribe(
        data => {
          if (data != null && data != undefined) {
            this.widget_PendingResult = data[0].col1
          }
          else {
            this.widget_PendingResult = 0;
          }
        },
        error => alert(error),
      );
  }
  widget_CheckedInPatient = 0;
  getCheckedInPatient_Widget() {
    this.widget_CheckedInPatient = 0;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.criteria = ' and a.provider_id=' + this.lookupList.logedInUser.defaultProvider;
    searchCriteria.option = '';

    this.dashboardService.getCheckInPatient_Widget(searchCriteria).subscribe(
      data => {
        if (data != null && data != undefined) {
          this.widget_CheckedInPatient = data[0].col1
        }
        else {
          this.widget_CheckedInPatient = 0;
        }
      },
      error => {
      }
    );
  }
  widget_pendingClaim = 0;
  getPendingClaims_Widget() {
    this.widget_pendingClaim = 0;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [{ name: "attending_physician", value: this.lookupList.logedInUser.defaultProvider, option: "" },
    { name: "location_id", value: "0", option: "" }];
    searchCriteria.option = 'draft';

    this.dashboardService.getPendingClaims_Widget(searchCriteria).subscribe(
      data => {
        if (data != null && data != undefined) {
          this.widget_pendingClaim = data[0].col1
        }
        else {
          this.widget_pendingClaim = 0;
        }
      },
      error => {
      }
    );
  }
  widget_UnreadFax = 0;
  getUnReadFaxes_Widget() {
    debugger;
    this.dashboardService.getUnReadFaxes_Widget(this.lookupList.logedInUser.userId, this.lookupList.practiceInfo.practiceId)
      .subscribe(
        data => {
          if (data != null && data != undefined) {
            this.widget_UnreadFax = data[0].col1
          }
          else {
            this.widget_UnreadFax = 0;
          }

        },
        error => alert(error),
      );
  }
  widget_Cashregister_Dollar = 0;
  widget_Cashregister_Cent = 0;
  getCashPayment_Widget() {
    this.widget_Cashregister_Dollar = 0;
    this.widget_Cashregister_Cent = 0;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "provider_id", value: "", option: "" },
      { name: "location_id", value: "", option: "" },
    ];
    this.dashboardService.getCashRegister_Widget(searchCriteria)
      .subscribe(
        data => {
          if (data != null && data != undefined) {
            let amt = data[0].col1
            this.widget_Cashregister_Dollar = amt.toString().split(".")[0];
            this.widget_Cashregister_Cent = amt.toString().split(".")[1];
          }
          else {
            this.widget_Cashregister_Dollar = 0;
            this.widget_Cashregister_Cent = 0;
          }
        },
        error => alert(error),

      );
  }
  refreshWidgets(value) {
    if (value == "result") {
      this.getLabPendingResults_Widget();
    }
    else if (value == "checkedin") {
      this.getCheckedInPatient_Widget();
    }
    else if (value == "pendingClaim") {
      this.getPendingClaims_Widget();
    }
    else if (value == "fax") {
      this.getUnReadFaxes_Widget();
    }
    else if (value == "cash") {
      this.getCashPayment_Widget();
    }
    else if (value == "refill") {
      this.getRefill_Widget();
    }
  }
  openModule(value) {

    debugger;
    this.loadmodule = true;
  }
  navigateBackToSSummary() {
    debugger;
    this.loadmodule = false;

    if (this.module_name == 'Result' || this.module_name == 'Attachment') {
      this.getLabPendingResults_Widget();
      this.navigateModule('div_dashboard_pendingresults');
    }

  }

  openLab(obj) {
    debugger;
    //to_open:value.result_name,patient_id:value.patient_id,order_id:value.order_id,result_id:value.result_id
    this.patient_id = obj.patient_id;
    this.module_name = obj.to_open;
    this.order_id = obj.order_id;
    this.patientName = obj.patient_name;
    obj.result_id;
    this.loadmodule = true;
  }

  enlargeRefill()
  {
    this.loadmodule = true;
    this.module_name="refill";
  }

  openClaim(obj) {
    debugger;
    this.patientName = obj.patient_name;

    this.openedClaimInfo = new OpenedClaimInfo(undefined, obj.patient_id, obj.provider_id, obj.location_id, obj.dos, OperationType.ADD, false,
      CallingFromEnum.DASHBOARD, obj.provider_name, obj.location_name, undefined, undefined, undefined, undefined);
    this.loadmodule = true;
    this.module_name = 'claim';
  }

  onClaimSaved(claimId: number) {
    debugger;
    this.loadmodule = false;
    this.refreshWidgets('pendingClaim');
    this.navigateModule('div_dashboard_pendingclaims');
  }



  onPendingClaim(dsh) {
    //this.navigateModule('');
    debugger;
    let find_index = 0;
    let div_main = document.getElementById('div_dashboard_main');
    for (let i = 0; i < div_main.children.length; i++) {
      if (div_main.children[i].id == "div_dashboard_modules") {
        for (let j = 0; j < div_main.children[i].children.length; j++) {
          for (let k = 0; k < div_main.children[i].children[j].children.length; k++) {
            if (div_main.children[i].children[j].children[k].id == dsh) {
              find_index = k;
              break;
            }
          }
        }
      }
    }
    debugger;
    let dsp = Math.round(find_index / 2);

    div_main.scrollTop = ((dsp - 1) * 262) + 90;
  }
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  navigateModule(value) {
    debugger;
    let sumHeight = 0;
    let i = 1;
    let div_main = document.getElementById('div_dashboard_modules');//Main Div where all modules are added
    let div_main_row = div_main.childNodes[0];
    for (let i = 0; i < div_main_row.childNodes.length; i++) {
      if (div_main_row.childNodes[i]["id"] == value) {

        switch (value) {
          case 'div_dashboard_pendingresults':
            this.dashboardPendingresultsComponent.reloadModule();
            break;
          case 'div_dashboard_pendingclaims':
            this.dashboardPendingclaimsComponent.reloadModule();
            break;
          default:
            break;
        }

        //this.child.reloadModule();

        //   this.el.nativeElement=div_main_row.childNodes[i];
        //   this.el.nativeElement.style.display="none";

        //   //div_main_row.childNodes[i]["style.display"] = "'none'";
        //   (async () => { 
        //     // Do something before delay
        //     console.log('before delay')      
        //     await this.delay(100);
        //     // Do something after
        //     console.log('after delay')
        //     debugger;
        //     this.el.nativeElement.style.display="block";  


        // })();

      }
    }
    let div_main1 = document.getElementById(value);//Main Div where all modules are added
    div_main.scrollTop = 250;
    //return;
    /*
    if (value == '1') {
      div_main.scrollTop = 0;
      return;
    }
    //while(i<value)
    {
      let el = document.getElementById('div_dash_pendingClaim');//get the child div, where id is set in loop in html
      if (el != null) {
        sumHeight += el.offsetHeight;
      }
      i++;
    }
    //Set the scroll to main div
    div_main.scrollTop = 0;
    */

  }

}
