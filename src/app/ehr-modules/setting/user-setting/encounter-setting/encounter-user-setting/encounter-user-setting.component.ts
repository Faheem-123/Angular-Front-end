import { Component, OnInit, Inject, ViewChildren, ElementRef } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ORMChartModuleSettingSave } from 'src/app/models/setting/ORMChartModuleSettingSave';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ServiceResponseStatusEnum, PromptResponseEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ORMChartModuleTempSettingSave } from 'src/app/models/setting/ORMChartModuleTempSettingSave';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'encounter-user-setting',
  templateUrl: './encounter-user-setting.component.html',
  styleUrls: ['./encounter-user-setting.component.css']
})
export class EncounterUserSettingComponent implements OnInit {
  @ViewChildren('txtSettingName') txtinput: ElementRef;
  arrModuleSetting;
  arrPageNo;
  arrModuleDetail;
  arrModuleDetailFiltered;
  arrAllModule;
  arrAllFiltered;
  selectedSetting;
  selectedPage;
  selectedModule;
  settingInputForm:FormGroup;
  constructor(private setupService: SetupService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  ,private generalOperation:GeneralOperation,private modalService: NgbModal,private formBuilder: FormBuilder
  ,private dateTimeUtil:DateTimeUtil) { }

  ngOnInit() {
    this.getEncounterAllModule();
    this.getEncounterSetting() ;

    this.settingInputForm = this.formBuilder.group({
      txtSettingName: this.formBuilder.control(null, Validators.required)
    });
  }
  
  getEncounterSetting() {
    this.setupService.getSetupChartModuleSetting(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
        data => {
            this.arrModuleSetting = data as Array<any>;
            
            if(this.arrModuleSetting!=undefined && this.arrModuleSetting!=null)
            {
              this.selectedSetting=0;
              this.getEncounterSettingDetail(this.arrModuleSetting[0].setting_id);
            }
        },
        error => {
        }
    );
}

getEncounterSettingDetail(setting_id) {
  this.setupService.getSetupChartModuleSettingsDetail(setting_id).subscribe(
      data => {
          this.arrModuleDetail = data as Array<any>;
          
          if(this.arrModuleDetail!=undefined && this.arrModuleDetail!=null)
          {
            this.arrPageNo = (new UniquePipe).transform(this.arrModuleDetail, "page_no");
            if(this.arrPageNo!=undefined && this.arrPageNo!=null)
            {
              this.selectedPage=0;
              this.arrModuleDetailFiltered=this.generalOperation.filterArray(this.arrModuleDetail, "page_no", this.selectedPage+1);
              this.userModuleNotIncluded();
            }
            
          }
      },
      error => {
      }
  );
}

getEncounterAllModule() {
  this.setupService.getSetupChartModuleAll().subscribe(
      data => {
          this.arrAllModule = data as Array<any>;
      },
      error => {
      }
  );
}
onSettingSelectionChange(index,obj){
  this.selectedSetting=index;
  this.getEncounterSettingDetail(obj.setting_id);
}

onPageSelectionChange(index,obj)
{
  debugger;
  this.selectedPage=index;
  if (this.arrModuleDetail != undefined && this.arrModuleDetail != null) {
    if (this.arrPageNo != undefined && this.arrPageNo != null) {
      this.arrModuleDetailFiltered = this.generalOperation.filterArray(this.arrModuleDetail, "page_no", this.selectedPage + 1);
      this.userModuleNotIncluded();
    }

  }
}
onUserModuleSelectionChange(index,obj)
{
  this.selectedModule=index;
}
userModuleNotIncluded(){
   debugger;
  this.arrAllFiltered  = Object.assign([], this.arrAllModule);

  for(let i=0;i<this.arrModuleDetail.length;i++)
  { 
    this.arrAllFiltered.splice(this.generalOperation.getitemIndex(this.arrAllFiltered,'module_name',this.arrModuleDetail[i].module_name),1);
    // let arr=this.generalOperation.filterArray(this.arrAllFiltered, "module_name", );
    // this.arrModuleDetailFiltered.splice(this.generalOperation.getElementIndex(arr,));
    // this.lstExamView.splice(index, 1);
  }
}
onNewPage(){
  debugger;
  //this.arrModuleDetail.push({'chartmodule_setting_id':"",'page_no':this.arrPageNo.length+1,'module_id':"",'module_name':"",'position':"",'oper':"N"});
  //this.arrModuleDetailFiltered  = this.arrModuleDetail ;
  this.arrPageNo.push({page_no:this.arrPageNo.length+1});
  this.selectedPage = this.arrPageNo.length-1; 
  this.onPageSelectionChange(this.selectedPage,this.arrPageNo[this.selectedPage]);
}
settingOperation="";
onSettingNew(){
  this.settingOperation="new";
  (this.settingInputForm.get("txtSettingName") as FormControl).setValue('');
  this.txtinput.nativeElement.focus();
}
onSettingEdit(obj){
  this.settingOperation="edit";
  (this.settingInputForm.get("txtSettingName") as FormControl).setValue(obj.setting_name);
}
onSettingDelete(obj){

  const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
  modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
  modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
  modalRef.componentInstance.alertType='danger';
  let closeResult;

  modalRef.result.then((result) => {

    if (result == PromptResponseEnum.YES) {
      debugger;
      let deleteRecordData = new ORMDeleteRecord();
      deleteRecordData.column_id = obj.setting_id.toString();
      deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
      deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
      deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

      this.setupService.deleteEncounterSetting(deleteRecordData)
        .subscribe(            
        data => this.onDeleteSettingSuccessfully(data),
        error => alert(error),
        );
    }
  }, (reason) => {
    //alert(reason);
  });
}
onSettingSave(){
  let objSettingSave:ORMChartModuleSettingSave=new  ORMChartModuleSettingSave;

  objSettingSave.setting_name = this.settingInputForm.get("txtSettingName").value;
  objSettingSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  objSettingSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();;
  objSettingSave.modified_user =this.lookupList.logedInUser.user_name;
  // if (strSetting_type == "Print")
  //   objORMChartModSett.is_print_setting = true;
  // else
  objSettingSave.is_print_setting = false;

  if (this.settingOperation == "new") {
    objSettingSave.created_user = this.lookupList.logedInUser.user_name;
    objSettingSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();;
  }
  else if (this.settingOperation == "edit") {
    objSettingSave.setting_id = this.arrModuleSetting[this.selectedSetting].setting_id;
    objSettingSave.created_user = this.arrModuleSetting[this.selectedSetting].created_user;
    objSettingSave.client_date_created = this.arrModuleSetting[this.selectedSetting].client_date_created;
  }
  this.setupService.saveEncounterSetting(objSettingSave)
    .subscribe(
      data => {
        debugger;
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) 
        {
          const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
          modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
          modalRef.componentInstance.promptHeading = 'Encounter Setting';
          modalRef.componentInstance.promptMessage = "Ecounter setting save successfull.";
          if(this.settingOperation=="new")
          {
            objSettingSave.setting_id=data['result'];
            this.arrModuleSetting.push(objSettingSave);
            this.selectedSetting=this.arrModuleSetting.length-1;
            this.getEncounterSettingDetail(objSettingSave.setting_id);
          }
          else{
            this.arrModuleSetting[this.selectedSetting].setting_name=objSettingSave.setting_name;
          }
          this.settingOperation="";
      }},
      error => {
      }
    );
  
  
}
onSettingCancel(){
  this.settingOperation="";
}
onPageDelete(obj)
{

  const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
  modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
  modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
  modalRef.componentInstance.alertType='danger';
  let closeResult;

  modalRef.result.then((result) => {

    if (result == PromptResponseEnum.YES) {
      debugger;
      let module_id:string="";
      for(let a=0;a<this.arrModuleDetailFiltered.length;a++)
      {
        if(module_id=="")
          module_id=this.arrModuleDetailFiltered[a].chartmodule_setting_id;
        else
        module_id+=","+this.arrModuleDetailFiltered[a].chartmodule_setting_id;
      }
      let deleteRecordData = new ORMDeleteRecord();
      deleteRecordData.column_id = module_id;
      deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
      deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
      deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

      this.setupService.deleteEncounterSettingPage(deleteRecordData)
        .subscribe(            
        data => {
          this.arrPageNo.splice(this.selectedPage,1);
          if(this.arrPageNo.length>0)
            this.onPageSelectionChange(0,this.arrPageNo[0]);
        },
        error => alert(error),
        );
    }
  }, (reason) => {
    //alert(reason);
  });
}
poupUpOptions: NgbModalOptions = {
  backdrop: 'static',
  keyboard: false,
  centered: true
};
onModuleDelete(obj){

const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.chartmodule_setting_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.setupService.deleteEncounterSettingModule(deleteRecordData)
          .subscribe(            
          data => {
            this.arrModuleDetailFiltered.splice(this.selectedModule,1);
            this.arrModuleDetail.splice(this.generalOperation.getitemIndex(this.arrModuleDetail,'chartmodule_setting_id',obj.chartmodule_setting_id),1);
            this.onDeleteModuleSuccessfully(data)
          },
          error => alert(error),
          );
      }
    }, (reason) => {
      //alert(reason);
    });
}
onDeleteModuleSuccessfully(data) {

  if (data.status === ServiceResponseStatusEnum.ERROR) {

    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Encounter Setting Setup"
    modalRef.componentInstance.promptMessage = data.response;
    let closeResult;
    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
  }
  else {
    if (this.arrModuleDetail.length > 0) {
      this.selectedModule=0;      
      
    }
   
  }
}
onDeleteSettingSuccessfully(data) {

  if (data.status === ServiceResponseStatusEnum.ERROR) {

    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Encounter Setting Setup"
    modalRef.componentInstance.promptMessage = data.response;
    let closeResult;
    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
  }
  else {
    if (this.arrModuleSetting.length > 0) {
      this.arrModuleSetting.splice(this.selectedSetting,1);
      this.selectedSetting=0;  
      this.getEncounterSettingDetail(this.arrModuleSetting[0].setting_id);    
    }
   
  }
}

moveModule(option: string) {
  if (this.selectedModule != undefined && this.arrModuleDetailFiltered != undefined && this.arrModuleDetailFiltered.length > 0) {
    switch (option) {
      case "down":
        if ((this.selectedModule + 1) < this.arrModuleDetailFiltered.length) {
          var source = this.arrModuleDetailFiltered[this.selectedModule];
          var toBeSwaped = this.arrModuleDetailFiltered[this.selectedModule + 1];
          if(source.oper!="N")
          {
            source.oper="U";
          }
          source.position = this.selectedModule + 2;

          if(toBeSwaped.oper!="N")
          {
            toBeSwaped.oper="U";
          }
          toBeSwaped.position = this.selectedModule + 1;
          

          this.arrModuleDetailFiltered[this.selectedModule] = toBeSwaped;
          this.arrModuleDetailFiltered[this.selectedModule + 1] = source

          this.selectedModule++;
        }

        break;
      case "up":
        if ((this.selectedModule) > 0) {

          var source = this.arrModuleDetailFiltered[this.selectedModule];
          var toBeSwaped = this.arrModuleDetailFiltered[this.selectedModule - 1];

          if(source.oper!="N")
          {
            source.oper="U";
          }
          source.position = this.selectedModule;

          if(toBeSwaped.oper!="N")
          {
            toBeSwaped.oper="U";
          }
          toBeSwaped.position = this.selectedModule + 1;
          

          this.arrModuleDetailFiltered[this.selectedModule] = toBeSwaped;
          this.arrModuleDetailFiltered[this.selectedModule - 1] = source

          this.selectedModule--;

        }
        break;

      default:
        break;
    }
  }
}
onModuleAdd(index,obj)
{
  if (this.arrPageNo == undefined || this.arrPageNo == null) {
    GeneralOperation.showAlertPopUp(this.modalService, 'Encounter Setting', 'Please Select/Create page first', 'info')
    return;
  }
  
  
  this.arrModuleDetail.push({ chartmodule_setting_id: "", page_no: this.selectedPage+1, module_id: obj.module_id, module_name: obj.module_name,display_name: obj.display_name,  position: this.arrModuleDetailFiltered.length + 1, oper: "N" });
  this.arrModuleDetailFiltered.push({ chartmodule_setting_id: "", page_no: this.selectedPage+1, module_id: obj.module_id, module_name: obj.module_name,  display_name: obj.display_name, position: this.arrModuleDetailFiltered.length + 1, oper: "N" });
  this.selectedModule = this.arrModuleDetailFiltered.length - 1;
  this.arrAllFiltered.splice(index,1);
}
arrModuleSave : Array<ORMChartModuleTempSettingSave>=new Array;
onSaveAll(){
  debugger;
  this.arrModuleSave=new Array();
  let objSave:ORMChartModuleTempSettingSave;
  for(let i=0;i<this.arrModuleDetail.length;i++)
  {
    objSave=new  ORMChartModuleTempSettingSave();
    if(this.arrModuleDetail[i].oper!="N" && this.arrModuleDetail[i].chartmodule_setting_id!="")
    {
      objSave.chartmodule_setting_id=this.arrModuleDetail[i].chartmodule_setting_id;
      objSave.client_date_created=this.arrModuleDetail[i].client_date_created;
      objSave.created_user=this.arrModuleDetail[i].created_user;
    }
    else{
      objSave.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
      objSave.created_user=this.lookupList.logedInUser.user_name;
    }
    
    objSave.setting_id=this.arrModuleSetting[this.selectedSetting].setting_id;
    objSave.page_no=this.arrModuleDetail[i].page_no;
    objSave.module_id=this.arrModuleDetail[i].module_id;
    objSave.position=this.arrModuleDetail[i].position;
    objSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();    
    objSave.modified_user=this.lookupList.logedInUser.user_name;    
    objSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
    objSave.deleted=false;
    // if(this.arrModuleDetail[i].oper=="D" && this.arrModuleDetail[i].chartmodule_setting_id!="")
    // {
    //   objSave.deleted=true;
    // }
    // else
     

    this.arrModuleSave.push(objSave);
  }
  if(this.arrModuleSave.length>0)
  {
    this.setupService.saveEncounterSettingDetail(this.arrModuleSave).subscribe(
      data => {
        debugger;
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) 
        {
          const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
          modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
          modalRef.componentInstance.promptHeading = 'Encounter Setting';
          modalRef.componentInstance.promptMessage = "Ecounter setting save successfull.";

          this.getEncounterSettingDetail(this.arrModuleSetting[this.selectedSetting].setting_id);
      }},
      error => {
      }
    );
  }

}
}
