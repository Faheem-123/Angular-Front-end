import { Component, OnInit,Inject } from '@angular/core';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { SchedulerService } from '../../../services/scheduler/scheduler.service';
import { LogMessage } from '../../../shared/log-message';
import { ListFilterPipe } from '../../../shared/list-filter-pipe';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { GeneralOperation } from '../../../shared/generalOperation';
import { ORMSaveLocationProviders } from '../../../models/scheduler/orm-save-location-providers';
import { DateTimeUtil } from '../../../shared/date-time-util';
import { ServiceResponseStatusEnum, PromptResponseEnum } from '../../../shared/enum-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'location-provider-setup',
  templateUrl: './location-provider-setup.component.html',
  styleUrls: ['./location-provider-setup.component.css']
})
export class LocationProviderSetupComponent implements OnInit {


  lstLocations:Array<any>;
  lstAllProviders:Array<any>;
  lstFileredAllProviders:Array<any>;
  lstLocationProviders:Array<any>;
  locationId:number;
  isLoading:boolean=false;
  //isAllProviderLoading:boolean=false;
  //isLocationProvidersLoading:boolean=false;
  locationProviderCount:number=0;
  allFilteredProviderCount:number=0;
  editState:boolean=false;
  lstAdded:Array<any>;
  lstDeleted:Array<any>;
  

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor( @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private schedulerService:SchedulerService,
    private logMessage:LogMessage,
    private generalOperation:GeneralOperation,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal) {

    this.lstLocations = this.lookupList.locationList.slice();
    this.locationId=this.lstLocations[0].id;

    this.lstAllProviders = this.lookupList.providerList.slice();

    this.getLocationProviders();
   }

  ngOnInit() {
  }

  getLocationProviders() {
    this.isLoading=true;
    this.lstLocationProviders = undefined;
    //this.isLocationProvidersLoading=true;
    this.locationProviderCount=0;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [      
      { name: "location_id", value: this.locationId, option: "" }
    ];

    this.schedulerService.getLocationProviderSettings(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstLocationProviders = data as Array<any>;
        this.locationProviderCount=this.lstLocationProviders.length;

        this.filterAllProviders();
        this.isLoading = false;

        
      },
      error => {
        this.isLoading = false;
        this.ongetLocationProvidersError(error);
      }
    );
  }

  ongetLocationProvidersError(error) {
    this.logMessage.log("getLocationProviders Error.");
  }

  filterAllProviders() {    

    debugger;
    this.lstFileredAllProviders = this.lstAllProviders.slice();

    if(this.lstLocationProviders==undefined || this.lstLocationProviders.length==0){
      this.allFilteredProviderCount=this.lstFileredAllProviders.length;
        return;
    }


    for(let lp of this.lstLocationProviders){

      let index: number = this.generalOperation.getitemIndex(this.lstFileredAllProviders, "id", lp.provider_id);

      if(index!=undefined){
        this.lstFileredAllProviders.splice(index, 1);
      }
    }   

    this.allFilteredProviderCount=this.lstFileredAllProviders.length;
  }


  locationChanged(locId){

    if(this.editState || locId==this.locationId)
      return;


    this.locationId=locId;
    this.getLocationProviders();
  }

  onEdit(){
    this.editState=true;
    this.lstDeleted=undefined;
    this.filterAllProviders();
  }
  onCancel(){    
    this.editState=false;
    this.lstDeleted=undefined;
    this.getLocationProviders();
  }
  onSave(){

    this.editState=false;

    let lstSave:Array<ORMSaveLocationProviders>=[];
    let orm:ORMSaveLocationProviders=new ORMSaveLocationProviders();

    if(this.lstDeleted!=undefined && this.lstDeleted.length>0){
      for(let d of this.lstDeleted){
        let orm:ORMSaveLocationProviders=new ORMSaveLocationProviders();
        orm.setting_id=d.setting_id;
        orm.location_id =d.location_id;
        orm.provider_id=d.provider_id;
        orm.practice_id=this.lookupList.practiceInfo.practiceId;
        orm.modified_user=this.lookupList.logedInUser.user_name;
        orm.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
        orm.system_ip=this.lookupList.logedInUser.systemIp;
        orm.deleted=true;
        orm.client_date_created=d.client_date_created;
        orm.created_user=d.created_user;
        orm.date_created=d.date_created;
        lstSave.push(orm);
      }
    }

    if(this.lstLocationProviders!=undefined && this.lstLocationProviders.length>0){
      for(let r of this.lstLocationProviders){
        if(r.setting_id==undefined){
          let orm:ORMSaveLocationProviders=new ORMSaveLocationProviders();
          orm.setting_id=r.setting_id;
          orm.location_id =r.location_id;
          orm.provider_id=r.provider_id;
          orm.practice_id=this.lookupList.practiceInfo.practiceId;
          orm.modified_user=this.lookupList.logedInUser.user_name;
          orm.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
          orm.system_ip=this.lookupList.logedInUser.systemIp;
          orm.deleted=false;
          orm.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
          orm.created_user=this.lookupList.logedInUser.user_name;
          lstSave.push(orm);
        }
      }
    }

    debugger;
    this.saveLocationProviders(lstSave);
  }

  saveLocationProviders(lstSave:Array<ORMSaveLocationProviders>){
    this.schedulerService.saveLocationProviderSettings(lstSave).subscribe(
      data => {     
        debugger;       
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.editState=false;
          this.getLocationProviders();
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
          this.onSaveTimingError(data['response']);
        }      
      },
      error => {       
        this.onSaveTimingError("An error occured while saving record.");
      }
    );
  }
  onSaveSuccess(error){
    this.logMessage.log("onSaveTiming Error.");
  }
  onSaveTimingError(error){
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Location Provider Setting"
      modalRef.componentInstance.promptMessage = error;

      let closeResult;

      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {          
          //alert(reason);
        });
  }

  addProvider(provider){
    if(this.lstLocationProviders==undefined)
        this.lstLocationProviders=[];
    
    let indexDeleted=this.generalOperation.getitemIndex(this.lstDeleted, "provider_id", provider.id);
    if(indexDeleted!=undefined){
      this.lstLocationProviders.push(this.lstDeleted[indexDeleted]);
    }
    else{
      this.lstLocationProviders.push({setting_id:undefined,provider_id:provider.id,location_id:this.locationId,provider_name:provider.name});
    }

    
    let index: number = this.generalOperation.getitemIndex(this.lstFileredAllProviders, "id", provider.id);

    if(index!=undefined){
      this.lstFileredAllProviders.splice(index, 1);
    }

  }
  removeProvider(proId){
    
    debugger;
      let index: number = this.generalOperation.getitemIndex(this.lstLocationProviders, "provider_id", proId);
      if(index!=undefined){

        if(this.lstDeleted==undefined){
            this.lstDeleted=[];
        }

        if(this.lstLocationProviders[index].setting_id!=undefined){
          this.lstDeleted.push(this.lstLocationProviders[index]);
        }

        this.lstLocationProviders.splice(index, 1);
        this.filterAllProviders();
      }   
       
  }
}
