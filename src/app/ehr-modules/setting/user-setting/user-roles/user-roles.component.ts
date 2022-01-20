import { Component, OnInit, Inject, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { TreeviewItem, TreeviewConfig,TreeItem } from 'ngx-treeview';
import { UserService } from 'src/app/services/user/user.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ORMRoleModuleSave } from 'src/app/models/setting/ORMRoleModuleSave';
import { observable } from 'rxjs';
import { ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { ORMSaveModuleRule } from 'src/app/models/setting/ORMSaveModuleRule';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css']
})
export class UserRolesComponent implements OnInit,OnDestroy {
  @Input() callingFrom:string='';
  //isCallFromBilling;
  arrRoles;
  arrRolesModuleDetail;
  arrAllModuleList;
  selectedRoleIndex=0;
  items: TreeviewItem[];
  values: number[];
  arrModuleSave : Array<ORMRoleModuleSave>=new Array;
  inputForm:FormGroup;
  isRoleShow=false;
  roleOperation='';
  isDisable=false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  config = TreeviewConfig.create({
      hasAllCheckBox: true,
      hasFilter: true,
      hasCollapseExpand: true,
      decoupleChildFromParent: false
      //,maxHeight: 400            
  });
   
  constructor(private userService: UserService,private generalService:GeneralService,
    private logMessage: LogMessage, private formBuilder: FormBuilder,@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalOperation:GeneralOperation,private modalService: NgbModal,private dateTimeUtil:DateTimeUtil
    ,private el: ElementRef) { }

  onFilterChange(value: string) {
    //console.log('filter:', value);
}
ngOnDestroy(){

}
  ngOnInit() {
    //this.items = this.getBooks();
    debugger;
    if(this.callingFrom.toLowerCase() == "billing"){
      //this.isCallFromBilling = "billing";
      this.getRoleList('499');
      this.getAllModuleList('499');
    }else{
      //this.isCallFromBilling = "ehr";
      this.getRoleList(this.lookupList.practiceInfo.practiceId);
      this.getAllModuleList(this.lookupList.practiceInfo.practiceId);
    }
    
    this.buildForm();    
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      txtRoleName: this.formBuilder.control(null, Validators.required),  
    });
  }
  getRoleList(practice_id) {
    this.userService.getRoleList(practice_id).subscribe(
        data => {
          debugger;
            this.arrRoles = data as Array<any>;
            if(this.arrRoles!=undefined && this.arrRoles!=null)
            {
              this.role_id=this.arrRoles[0].role_id;
              this.selectedRoleIndex=0;
              this.getRoleDetail(this.arrRoles[0].role_id);
            }
        },
        error => {
        }
    );
}
getAllModuleList(practiceId) {
  this.userService.getAllModulesList(practiceId).subscribe(
      data => {
          this.arrAllModuleList = data as Array<any>;
          if(this.arrAllModuleList!=undefined && this.arrAllModuleList!=null)
          {
          
          }
      },
      error => {
      }
  );
}

getRoleDetail(role_id) {
  this.isSaving=false;
  this.isLoading=true;
  this.userService.getModuleDetails(role_id).subscribe(
      data => {
        debugger;
          this.arrRolesModuleDetail = data as Array<any>;
          if(this.arrRolesModuleDetail!=undefined && this.arrRolesModuleDetail!=null)
          {
            this.createTreeView();
            this.items= this.lstChildrenMain;
          }
          this.isLoading=false;
      },
      error => {
      }
  );
}
lstChildrenMain=[];
lstChildrenSub=[];
createTreeView(){
debugger;
this.lstChildrenMain=[];
  let lstUniqueModule = (new UniquePipe).transform(this.arrAllModuleList, "name")

  for (let a = 0; a < lstUniqueModule.length; a++) 
  {
    let lstChildModule = this.generalOperation.filterArray(this.arrAllModuleList, "name", lstUniqueModule[a].name);
    this.lstChildrenSub=[];

    for (let b = 0; b < lstChildModule.length; b++) 
    {
      let lstUserModule = this.generalOperation.filterArray(this.arrRolesModuleDetail, "module_id", lstChildModule[b].module_id);
      if(lstUserModule!=null && lstUserModule.length>0)
        this.lstChildrenSub.push(new TreeviewItem({ text: lstChildModule[b].operation.toString(), value: lstChildModule[b].module_id.toString(),checked: true }));
      else
        this.lstChildrenSub.push(new TreeviewItem({ text: lstChildModule[b].operation.toString(), value: lstChildModule[b].module_id.toString(),checked: false }));
    }
    this.lstChildrenMain.push(new TreeviewItem({text:lstUniqueModule[a].name.toString(),value:lstUniqueModule[a].name.toString(),children:this.lstChildrenSub}));
  }
  return [this.lstChildrenMain];
}
  getBooks(): TreeviewItem[] {
    const childrenCategory = new TreeviewItem({
        text: 'Children', value: 1, collapsed: true, children: [
            { text: 'Baby 3-5', value: 11 },
            { text: 'Baby 6-8', value: 12 },
            { text: 'Baby 9-12', value: 13 }
        ]
    });
    const itCategory = new TreeviewItem({
        text: 'IT', value: 9, children: [
            {
                text: 'Programming', value: 91, children: [{
                    text: 'Frontend', value: 911, children: [
                        { text: 'Angular 1', value: 9111 },
                        { text: 'Angular 2', value: 9112 },
                        { text: 'ReactJS', value: 9113, disabled: true }
                    ]
                }, {
                    text: 'Backend', value: 912, children: [
                        { text: 'C#', value: 9121 },
                        { text: 'Java', value: 9122 },
                        { text: 'Python', value: 9123, checked: false, disabled: true }
                    ]
                }]
            },
            {
                text: 'Networking', value: 92, children: [
                    { text: 'Internet', value: 921 },
                    { text: 'Security', value: 922 }
                ]
            }
        ]
    });
    const teenCategory = new TreeviewItem({
        text: 'Teen', value: 2, collapsed: true, disabled: true, children: [
            { text: 'Adventure', value: 21 },
            { text: 'Science', value: 22 }
        ]
    });
    const othersCategory = new TreeviewItem({ text: 'Others', value: 3, checked: false, disabled: true });
    return [childrenCategory, itCategory, teenCategory, othersCategory];
}
onCancel(){
  this.isRoleShow=false;
  this.roleOperation='';
  this.isDisable=false;
}
onSave(){
  debugger;
  this.isSaving=true;
  this.arrModuleSave =new Array;
  for(let i=0;i<this.items.length;i++)
  {
    for(let j=0;j<this.items[i].children.length;j++)
    {
      if(this.items[i].children[j].hasOwnProperty('children'))
      {
      if(this.items[i].children[j].children.length>0)
      {
        for(let k=0;k<this.items[i].children[j].children.length;k++)
        {
          this.prepareObject(this.items[i].children[j].children[k].value);
        }
      }
    }
      else
      {
        if(this.items[i].children[j].checked==true)
        {
          this.prepareObject(this.items[i].children[j].value);
        }
      }
      
    }
  }
  debugger;
  this.userService.saveRoleModule(this.arrModuleSave)
  .subscribe(
    data => {
      debugger;
      if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
        const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
        modalRef.componentInstance.promptHeading = 'Save Role !';
        modalRef.componentInstance.promptMessage = "Record Save Successfully.";
        modalRef.componentInstance.alertType = 'info';

        this.getRoleDetail(this.arrRoles[this.selectedRoleIndex].role_id)
    }},
    error => {
    }
  );
  //this.isLoading=false;
}
prepareObject(module_id){
  let objSave:ORMRoleModuleSave=new ORMRoleModuleSave;
  if(this.callingFrom.toLowerCase() == "billing"){
    objSave.practice_id='499';
  }else{
    objSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();
  }
  objSave.role_id=this.arrRoles[this.selectedRoleIndex].role_id;
  objSave.module_id=module_id;
  objSave.created_user=this.lookupList.logedInUser.user_name;
  objSave.modified_user=this.lookupList.logedInUser.user_name;
  objSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
  objSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();

  this.arrModuleSave.push(objSave);
}
role_id=""; 
onRoleSelectionChange(index,u)
  {
    this.selectedRoleIndex=index;
    this.role_id=u.role_id;
    this.getRoleDetail(u.role_id);
  }
  onAddNew(){
    debugger;
    
    this.isRoleShow=true;
    this.roleOperation='New';
    this.isDisable=true;
    this.inputForm = this.formBuilder.group({
      txtRoleName: this.formBuilder.control("", Validators.required,),  
    });
  }
  onRoleSave(){
    let ormSave:ORMSaveModuleRule=new ORMSaveModuleRule();
    if(this.roleOperation=='New')
    {
      ormSave.created_user=this.lookupList.logedInUser.user_name;
      ormSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
    }
    else{
      ormSave.created_user=this.arrRoles[this.selectedRoleIndex].created_user;
      ormSave.client_date_created=this.arrRoles[this.selectedRoleIndex].client_date_created;
      ormSave.role_id=this.arrRoles[this.selectedRoleIndex].role_id;
    }
    if(this.callingFrom == 'billing'){
      ormSave.practice_id = '499';
    }else{
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    }
    ormSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
    ormSave.role_name=this.inputForm.get("txtRoleName").value;
    ormSave.modified_user=this.lookupList.logedInUser.user_name;

    this.userService.saveRole(ormSave)
    .subscribe(
      data => {
        debugger;
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS){
          if(this.roleOperation=="New"){
            ormSave.role_id=data['result'];
            this.arrRoles.push(ormSave);
          }
          else{
            this.arrRoles[this.selectedRoleIndex].role_name=ormSave.role_name;
          }
          this.isRoleShow=false;
          this.roleOperation='';
          this.isDisable=false;
      }},
      error => {
      }
    );
    
  }
  onRoleCancel(){
    this.isRoleShow=false;
    this.roleOperation='';
    this.isDisable=false;
  }
  onRoleEdit(obj){
    this.isRoleShow=true;
    this.roleOperation='Edit';
    this.isDisable=true;
    (this.inputForm.get("txtRoleName") as FormControl).setValue(obj.role_name);
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  onRoleDelete(obj)
  {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.role_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.userService.deleteRole(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("User Role Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "User Setup"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
     this.arrRoles.splice(this.selectedRoleIndex,1);
    }
  }

}
