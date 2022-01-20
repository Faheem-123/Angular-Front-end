import { Component, OnInit, Inject, Input, OnChanges } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { SetupService } from 'src/app/services/setup.service';
import { UserService } from 'src/app/services/user/user.service';
import { ORMRSaveoleAdministrationModule } from 'src/app/models/setting/ORMRSaveoleAdministrationModule';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'administration-modules',
  templateUrl: './administration-modules.component.html',
  styleUrls: ['./administration-modules.component.css']
})
export class AdministrationModulesComponent implements OnChanges {
  @Input() role_id;
lstModules
isLoading=false;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,private dateTimeUtil:DateTimeUtil
  ,private setupService: SetupService ,private userService: UserService,  private generalOperation: GeneralOperation,
  private modalService: NgbModal) { 
    debugger
  }

  ngOnChanges() {
    debugger
    if(this.role_id!="")
        this.getList() ;
  }
  getList() {
    this.setupService.getRoleAdministrationModules(this.lookupList.practiceInfo.practiceId.toString(),this.role_id).subscribe(
        data => {
          debugger;
            this.lstModules = data as Array<any>;
        },
        error => {
        }
    );
}
IsSelectAll(value) {
  for (var i = 0; i < this.lstModules.length; i++) {
    this.lstModules[i].is_enabled = value;
  }
}
IsSelect(value, doc) {
  this.lstModules[this.generalOperation.getElementIndex(this.lstModules, doc)].is_enabled = value;
}
arrModuleSave : Array<ORMRSaveoleAdministrationModule>=new Array;
onSave(){
debugger;
this.arrModuleSave=new Array()
  let objSave:ORMRSaveoleAdministrationModule;
  for(let i=0;i<this.lstModules.length;i++)
  {
    if((this.lstModules[i].id!=null && this.lstModules[i].id!="")
      ||  this.lstModules[i].is_enabled==true)
    {
      objSave=new  ORMRSaveoleAdministrationModule(); 
      objSave.role_id=this.role_id;
      objSave.module_id=this.lstModules[i].module_id;
      objSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();    
      objSave.deleted=!this.lstModules[i].is_enabled;
      objSave.modified_user=this.lookupList.logedInUser.user_name;    
      objSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      if(this.lstModules[i].id!=null && this.lstModules[i].id!="")
      {
        objSave.id=this.lstModules[i].id;
        objSave.created_user=this.lstModules[i].created_user;
        objSave.client_date_created=this.lstModules[i].client_date_created;
        objSave.date_created=this.lstModules[i].date_created;
        objSave.created_user=this.lookupList.logedInUser.user_name;    
      }
      else{
        objSave.created_user=this.lookupList.logedInUser.user_name;  
        objSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      }

      this.arrModuleSave.push(objSave);
    }

  }
  if(this.arrModuleSave.length>0)
  {
    this.setupService.SaveRoleAdministrationModules(this.arrModuleSave).subscribe(
      data => {
        debugger;
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
          modalRef.componentInstance.promptHeading = "Administration Module"
          modalRef.componentInstance.promptMessage = "Record Save Successfully";
          modalRef.componentInstance.alertType = 'info';

          this.getList();
      }},
      error => {
      }
    );
  }
}
poupUpOptions: NgbModalOptions = {
  backdrop: 'static',
  keyboard: false,
  centered: true
};
}
