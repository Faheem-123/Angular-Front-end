import { Component, OnInit, Inject } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { ORMDashBoardSetting } from 'src/app/models/dashboard/ORMDashBoardSetting';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { stringify } from 'querystring';

@Component({
  selector: 'dashboard-setting',
  templateUrl: './dashboard-setting.component.html',
  styleUrls: ['./dashboard-setting.component.css']
})
export class DashboardSettingComponent implements OnInit {
listAllModule;
listUserModule;
  constructor(private dashboardService:DashboardService,@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private dateTimeUtil:DateTimeUtil,private modalService: NgbModal) { }

  ngOnInit() {
    this.getAllModules() ;
    this.getUserModules();
  }
  getAllModules() {
    var prac_id:String="";
    if(this.lookupList.logedInUser.user_name.toUpperCase().search("@IHC")>-1 || this.lookupList.logedInUser.userType.toString().toUpperCase()=='BILLING')
    //if(this.lookupList.logedInUser.userType.toString().toUpperCase()=='BILLING')
    {
      prac_id="499";
    }
    else{
      prac_id=this.lookupList.practiceInfo.practiceId.toString();
    }
    this.dashboardService.getAllDashBoardModule(this.lookupList.logedInUser.userId,prac_id)
      .subscribe(
        data => {
          this.listAllModule = data as Array<any>;
        },
        error => {
        }
      );
  }
  getUserModules() {
    var prac_id:String="";
    if(this.lookupList.logedInUser.user_name.toUpperCase().search("@IHC")>-1 || this.lookupList.logedInUser.userType.toString().toUpperCase()=='BILLING')
    //if(this.lookupList.logedInUser.userType.toString().toUpperCase()=='BILLING')
    {
      prac_id="499";
    }
    else{
      prac_id=this.lookupList.practiceInfo.practiceId.toString();
    }
    this.dashboardService.getUserDashBoardModule(this.lookupList.logedInUser.userId,prac_id.toString())
      .subscribe(
        data => {
          this.listUserModule = data as Array<any>;
        },
        error => {
        }
      );
  }
  addModule(obj)
  {
    for(let i=0;i<this.listAllModule.length;i++)
    {
      if(this.listAllModule[i].dashboard_moduleid==obj.dashboard_moduleid)
      {
        this.listAllModule.splice(i,1);  

        this.listUserModule.push(obj);
        break;
      }
    }
  }
  deleteModule(obj)
  {
    debugger;
    for(let i=0;i<this.listUserModule.length;i++)
    {
      if(this.listUserModule[i].dashboard_moduleid==obj.dashboard_moduleid)
      {
        this.listUserModule.splice(i,1);  

        this.listAllModule.push(obj);
        break;
      }
    }
  }
  selectedModuleRow: number = 0;
  onmoduleSelectionChanged(index)
  {
    this.selectedModuleRow=index
  }
  
  moveModule(option: string) {


    if (this.selectedModuleRow != undefined && this.listUserModule != undefined && this.listUserModule.length > 0) {
      switch (option) {
        case "down":
          if ((this.selectedModuleRow + 1) < this.listUserModule.length) {
            var source = this.listUserModule[this.selectedModuleRow];
            var toBeSwaped = this.listUserModule[this.selectedModuleRow + 1];

            source.diag_sequence = this.selectedModuleRow + 2;
            source.add_edit_flag = true;
            toBeSwaped.diag_sequence = this.selectedModuleRow + 1;
            toBeSwaped.add_edit_flag = true;

            this.listUserModule[this.selectedModuleRow] = toBeSwaped;
            this.listUserModule[this.selectedModuleRow + 1] = source

            this.selectedModuleRow++;
          }

          break;
        case "up":
          if ((this.selectedModuleRow) > 0) {

            var source = this.listUserModule[this.selectedModuleRow];
            var toBeSwaped = this.listUserModule[this.selectedModuleRow - 1];

            source.diag_sequence = this.selectedModuleRow;
            source.add_edit_flag = true;
            toBeSwaped.diag_sequence = this.selectedModuleRow + 1;
            toBeSwaped.add_edit_flag = true;

            this.listUserModule[this.selectedModuleRow] = toBeSwaped;
            this.listUserModule[this.selectedModuleRow - 1] = source

            this.selectedModuleRow--;

          }
          break;

        default:
          break;
      }
    }
  }
  onSave(){

    let lstSave: Array<ORMDashBoardSetting>=new Array;
    for (let i = 0; i < this.listUserModule.length; i++) 
    {
      let objORMDashBoardSetting: ORMDashBoardSetting = new ORMDashBoardSetting();
      objORMDashBoardSetting.dashboard_moduleid = this.listUserModule[i].dashboard_moduleid;
      objORMDashBoardSetting.setting_id = this.listUserModule[i].setting_id;
      objORMDashBoardSetting.user_id = this.lookupList.logedInUser.userId.toString();
      objORMDashBoardSetting.position = i.toString();
      objORMDashBoardSetting.visiable = "true";
      objORMDashBoardSetting.deleted = false;
      objORMDashBoardSetting.created_user = this.listUserModule[i].created_user == "" ? this.lookupList.logedInUser.user_name : this.listUserModule[i].created_user;
      objORMDashBoardSetting.client_date_created = this.listUserModule[i].client_date_created == "" ? this.dateTimeUtil.getCurrentDateTimeString() : this.listUserModule[i].client_date_created;
      objORMDashBoardSetting.modified_user = this.lookupList.logedInUser.user_name;
      objORMDashBoardSetting.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      objORMDashBoardSetting.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      lstSave.push(objORMDashBoardSetting);
    }
      this.dashboardService.saveDashboardSetting(lstSave)
      .subscribe(
        data => {
          debugger;
          if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
            const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
            modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
            modalRef.componentInstance.promptHeading = 'Dashboard Setting';
            modalRef.componentInstance.promptMessage = "Dashboard setting save successfull.";
        }},
        error => {
        }
      );
}
poupUpOptions: NgbModalOptions = {
  backdrop: 'static',
  keyboard: false,
  centered: true
};


}
