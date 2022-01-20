import { Component, OnInit, Input, Inject } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { SetupService } from 'src/app/services/setup.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ORMProviderTemplateSave } from 'src/app/models/setting/ORMProviderTemplateSave';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORM_template_provider } from 'src/app/models/setting/ORM_template_provider';

@Component({
  selector: 'provider-wise-templates',
  templateUrl: './provider-wise-templates.component.html',
  styleUrls: ['./provider-wise-templates.component.css']
})
export class ProviderWiseTemplatesComponent implements OnInit {
  //lstProvidersLstClone: Array<any>;
  lstTemplateValues: Array<any>;
  //selectedProvidersID;
  selectedNotesID;
  enableDisableCheckBox:boolean = true;
  optionsSelect = 'Reason For Visit';
  grdName = 'Reason For Visit';
  isSelectedID='';
  isEditID='';
  selectedRowData;
  isLoading: boolean = false;

  // listTemplate_hpi: Array<any>;
  // listTemplate_rfv: Array<any>;
  // listTemplate_pmh: Array<any>;
  // listTemplate_ros: Array<any>;
  // listTemplate_pe: Array<any>;
  // listTemplate_plan: Array<any>;
  listTemplateResult: Array<any>;

  radioForm: FormGroup;
  provTempSetUpForm: FormGroup;
  searchCriteria: SearchCriteria;
  newTemplate:boolean = true;
  provTempCreatedBy = '';
  provTempDateCreated = '';
  provTempModifiedBy = '';
  provTempDateModified = '';
  providerName = "";

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private generalService: GeneralService,  private setupService: SetupService,
  private logMessage: LogMessage, private formBuilder: FormBuilder, private modalService: NgbModal,
  private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {
    this.buildForm();
    debugger;
    if (this.lookupList.logedInUser.loginProviderId != 0 && this.lookupList.logedInUser.loginProviderId != null) {
      this.providerName = "  - (" + this.lookupList.logedInUser.loginProviderName.toString()+ ")";
    }else{
      this.providerName = "";
    }
    this.changeTemplateTabs("RFV");
    // if (this.lookupList.providerList == undefined || this.lookupList.providerList.length == 0) {
    //   this.getProviderList();
    // }else{
    //   if (this.lookupList.logedInUser.loginProviderId != 0 && this.lookupList.logedInUser.loginProviderId != null) {
    //     for(var i = 0; i < this.lookupList.providerList.length; i++){
    //       if(this.lookupList.logedInUser.loginProviderId == this.lookupList.providerList[i].id){
    //         this.lstProvidersLstClone = this.lookupList.providerList[i];
    //       }
    //     }
    //   }
    //   //this.lstProvidersLstClone = this.lookupList.providerList;
    //   if(this.lstProvidersLstClone.length>0)
    //     this.providerchange(this.lstProvidersLstClone[0]);
    // }
  }
  buildForm() {
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control('rfv'),
    });
    this.provTempSetUpForm = this.formBuilder.group({
      txt_provTemplateName: this.formBuilder.control(null),
      txt_provTemplateText: this.formBuilder.control(null)
    });

  }
  // getProviderList(){
  //   this.isLoading = true;
  //   this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(
  //     data => {
  //       debugger;
  //       this.isLoading = false;
  //       this.lookupList.providerList =  data as Array<any>;
  //       this.lstProvidersLstClone = this.lookupList.providerList;
        
  //       if (this.lookupList.logedInUser.loginProviderId != 0 && this.lookupList.logedInUser.loginProviderId != null) {
  //         for(var i = 0; i < this.lookupList.providerList.length; i++){
  //           if(this.lookupList.logedInUser.loginProviderId == this.lookupList.providerList[i].id){
  //             this.lstProvidersLstClone = this.lookupList.providerList[i];
  //           }
  //         }
  //       }


  //       if(this.lstProvidersLstClone.length>0)
  //         this.providerchange(this.lstProvidersLstClone[0]);
  //     },
  //     error => {
  //       this.isLoading = false;
  //       this.getProviderListError(error);
  //     }
  //   );
  // }
  getProviderListError(error){
    this.logMessage.log("getProviderList Error." + error);
  }
 // providerchange(value){
   // debugger;
    //this.selectedProvidersID = value.id;
    //roRos.getTemplateForProvider_Setting.send(GeneralOptions.practiceID,"chart",dgprovider.selectedItem.id);
   // this.getTemplateProvider();
  //}
  getTemplateProvider(val){
    this.isLoading = true;
    this.searchCriteria = new SearchCriteria();
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.param_list=[];
    this.searchCriteria.param_list.push( { name: "type", value: val, option: ""});
    //this.searchCriteria.param_list.push( { name: "provider_id", value: this.selectedProvidersID, option: ""});
    this.searchCriteria.param_list.push( { name: "provider_id", value: this.lookupList.logedInUser.loginProviderId, option: ""});
    this.setupService.getTemplateProvider(this.searchCriteria).subscribe(
    data => {
        debugger;
        this.isLoading = false;
        this.lstTemplateValues = data as Array<any>;

        if(this.lstTemplateValues.length>0)
          this.providersNoteschange(this.lstTemplateValues[0]);
      },
      error => {
        this.isLoading = false;
        this.getTemplateError(error);
      }
    );    
  }
  // checkChkBox(id, event){
  //   debugger;
  //   for(var i = 0; i < this.lstProvidersClone.length; i++){
  //     if (event == true) {
  //       if (this.lstProvidersClone[i].provider_id == id) {
  //         this.lstProvidersClone[i].chkbox = true;
  //         return;
  //       }
  //     } else if (event == false) {
  //       if (this.lstProvidersClone[i].provider_id == id) {
  //         this.lstProvidersClone[i].chkbox = false;
  //         return;
  //       }
  //     }
  //   }
  // }
  changeTemplateTabs(value){
    debugger;
    this.optionsSelect = value;
    this.grdName = value;
    this.getTemplateRst(value);
    //this.getTemplateResult(value);
  }
  getTemplateRst(value){
    debugger;
    switch (value.toLowerCase()) {
      case "rfv":
        this.getTemplateProvider('RFV');
        break;
      case "hpi":
        this.getTemplateProvider('HPI');
        break;
      case "pmh":
        this.getTemplateProvider('PMH');
        break;
      case "ros":
        this.getTemplateProvider('ROS');
        break;
      case "physical exam":
        this.getTemplateProvider('PE');
        break;
      case "plan":
        this.getTemplateProvider('chart');
        break;
      default:
        break;
    }
  }



  // getTemplate(value){
  //   debugger;
  //   this.setupService.getTemplate(this.lookupList.practiceInfo.practiceId.toString(), value).subscribe(
  //     data => {
  //       debugger;
  //       if(value == 'RFV'){
  //         this.listTemplate_rfv = data as Array<any>;
  //         this.listTemplateResult =  data as Array<any>;
  //       }else if(value == 'HPI'){
  //         this.listTemplate_hpi =  data as Array<any>;
  //         this.listTemplateResult =  data as Array<any>;
  //       }else if(value == 'PMH'){
  //         this.listTemplate_pmh =  data as Array<any>;
  //         this.listTemplateResult =  data as Array<any>;
  //       }else if(value == 'ROS'){
  //         this.listTemplate_ros =  data as Array<any>;
  //         this.listTemplateResult =  data as Array<any>;
  //       }else if(value == 'PE'){
  //         this.listTemplate_pe =  data as Array<any>;
  //         this.listTemplateResult =  data as Array<any>;
  //       }else if(value == 'chart'){
  //         this.listTemplate_plan =  data as Array<any>;
  //         this.listTemplateResult =  data as Array<any>;
  //       }
  //       // if(this.listTemplateResult.length>0)
  //       //   this.PopTemplateSetup(this.listTemplateResult[0]);
  //     },
  //     error => {
  //       this.getTemplateError(error);
  //     }
  //   );
  // }
   getTemplateError(error){
    this.logMessage.log("getTemplate Error." + error);
   }
  PopTemplateSetup(val){
    debugger;
    this.isSelectedID = val.id;
    //(this.tempSetUpForm.get("txt_TemplateText") as FormControl).setValue(val.text);
    //(this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue(val.name);
    //this.getTemplateDetails();
  }
 
  // getTemplateDetails(){
  //    this.setupService.getTemplateDetails(this.lookupList.practiceInfo.practiceId.toString(), this.isSelectedID).subscribe(
  //      data => {
  //        debugger;
  //        this.lstProvidersClone = data as Array<any>;
  //      },
  //      error => {
  //        this.getTemplateError(error);
  //      }
  //    );    
  //  }
   addNewProviderTemplate(){
    debugger;
    this.newTemplate = false;
    (this.provTempSetUpForm.get("txt_provTemplateName") as FormControl).setValue('');
    (this.provTempSetUpForm.get("txt_provTemplateText") as FormControl).setValue('');
    this.isEditID = '';
  }
  cancelProvTemplate(){
    this.newTemplate = true;
    this.isEditID = '';
    (this.provTempSetUpForm.get("txt_provTemplateName") as FormControl).setValue('');
    (this.provTempSetUpForm.get("txt_provTemplateText") as FormControl).setValue('');
    //this.resetAll();

 // if(this.lstProvidersLstClone.length>0)
 //   this.providerchange(this.lstProvidersLstClone[0]);

  this.optionsSelect = 'RFV';
  this.grdName = 'Reason For Visit';

  //if(this.lstTemplateValues.length>0)
    //this.providersNoteschange(this.lstTemplateValues[0]);

    this.changeTemplateTabs("RFV");
  }
  editSeletedProvTemplate(value){
    debugger;
    (this.provTempSetUpForm.get("txt_provTemplateName") as FormControl).setValue(value.name);
    (this.provTempSetUpForm.get("txt_provTemplateText") as FormControl).setValue(value.text);
    this.isEditID = value.id;
    this.selectedRowData = value;
    this.newTemplate = false;
  }
  saveProvTemplateSetup(){
    if(this.validate()){
      if(this.isEditID == ''){
        this.isLoading = true;
        let ormSave: ORMProviderTemplateSave = new ORMProviderTemplateSave();
        ormSave.id = "";
        ormSave.name = (this.provTempSetUpForm.get('txt_provTemplateName') as FormControl).value;
        ormSave.text = (this.provTempSetUpForm.get('txt_provTemplateText') as FormControl).value;
        ormSave.date_created = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.created_user = this.lookupList.logedInUser.user_name;
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.text_html = '';
        ormSave.deleted = false;
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        //ormSave.type = "chart";
         if(this.optionsSelect == 'RFV'){
           ormSave.type = "RFV";
         }else if(this.optionsSelect == 'HPI'){
           ormSave.type = "HPI";
         }else if(this.optionsSelect == 'PMH'){
           ormSave.type = "PMH";
         }else if(this.optionsSelect == 'ROS'){
           ormSave.type = "ROS";
         }else if(this.optionsSelect == 'Physical Exam'){
           ormSave.type = "PE";
         }else if(this.optionsSelect == 'Plan'){
           ormSave.type = "chart";
         }
        this.setupService.saveProvTemplateSetup(ormSave)
        .subscribe(
          data => {
            this.isLoading = false;
            this.saveProviderTemplate(data)
          },
          error => {  
            this.isLoading = false;
          }
        );
      }//new case end here.
      else{ 
        //datecreated createduser clientdatecreated templateid dgproviderid
        this.isLoading = true;
        let ormProviderSave: ORM_template_provider = new ORM_template_provider();
        ormProviderSave.id = this.selectedRowData.id;
        ormProviderSave.date_created = this.selectedRowData.date_created;
        ormProviderSave.created_user = this.selectedRowData.created_user;
        ormProviderSave.client_date_created = this.selectedRowData.client_date_created;
        ormProviderSave.modified_user = this.lookupList.logedInUser.user_name;
        ormProviderSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
						
        //ormProviderSave.provider_id = this.selectedProvidersID;
        ormProviderSave.provider_id = this.lookupList.logedInUser.loginProviderId.toString();
        ormProviderSave.template_id = this.selectedRowData.template_id;
        ormProviderSave.template_text = (this.provTempSetUpForm.get('txt_provTemplateText') as FormControl).value;
        ormProviderSave.template_html = (this.provTempSetUpForm.get('txt_provTemplateText') as FormControl).value;
        ormProviderSave.deleted = false;
        ormProviderSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

        this.setupService.addEditProvTemplateSetup(ormProviderSave).subscribe(
          data => {
            this.isLoading = false;
            this.resetAll();
           // get all template again here.
         },
         error => {
          this.isLoading = false;
         }
        );
      }
    }
  }
  saveProviderTemplate(data){
    this.isLoading = true;
    debugger;
    let ormProviderSave: ORM_template_provider = new ORM_template_provider();
    ormProviderSave.id = "";
    ormProviderSave.date_created = '';
    ormProviderSave.created_user = this.lookupList.logedInUser.user_name;
    ormProviderSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    ormProviderSave.modified_user = this.lookupList.logedInUser.user_name;
    ormProviderSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        
    //ormProviderSave.provider_id = this.selectedProvidersID;
    ormProviderSave.provider_id = this.lookupList.logedInUser.loginProviderId.toString();
    ormProviderSave.template_id = data.result;
    ormProviderSave.template_text = (this.provTempSetUpForm.get('txt_provTemplateText') as FormControl).value;
    ormProviderSave.template_html = (this.provTempSetUpForm.get('txt_provTemplateText') as FormControl).value;
    ormProviderSave.deleted = false;
    ormProviderSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.setupService.addEditProvTemplateSetup(ormProviderSave).subscribe(
      data => {
        this.isLoading = false;
       this.resetAll();
     },
     error => {
      this.isLoading = false;
     }
    );
  }
  validate(): boolean {
    if ((this.provTempSetUpForm.get('txt_provTemplateName') as FormControl).value == "") {
      alert("Please Enter Template Name.");
      return false;
    }
    if ((this.provTempSetUpForm.get('txt_provTemplateText') as FormControl).value == "") {
      alert("Please Enter Template Text.");
      return false;
    }
    return true;
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  deleteSeletedProvTemplate(value){
    this.isLoading = true;
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected Record?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;
    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {
        debugger;
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "template_id", value: value.template_id, option: "" },
          //{ name: "provider_id", value: this.selectedProvidersID, option: "" },
          { name: "provider_id", value: this.lookupList.logedInUser.loginProviderId.toString(), option: "" },
          { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" }
        ];

        this.setupService.deleteSeletedProvTemplate(searchCriteria)
          .subscribe(
            data => 
            {
              this.isLoading = false;
              this.onDeleteSuccessfully(data)
            },
            error => {
              this.isLoading = false;
             }
            // error => alert(error),
            // () => this.logMessage.log("Tempalte Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Template Delete."
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      //this.getTemplate('RFV');
    }
    this.changeTemplateTabs("RFV");
    this.cancelProvTemplate();
  }

  providersNoteschange(value){
    this.selectedNotesID = value.id;   
    (this.provTempSetUpForm.get("txt_provTemplateName") as FormControl).setValue(value.name);
    (this.provTempSetUpForm.get("txt_provTemplateText") as FormControl).setValue(value.text);
    this.provTempCreatedBy = value.created_user == '' ? '' : value.created_user == null ? '' : value.created_user;
    this.provTempDateCreated = value.date_created == '' ? '' : value.date_created == null ? '' : value.date_created;
    this.provTempModifiedBy = value.modified_user == '' ? '' : value.modified_user == null ? '' : value.modified_user;
    this.provTempDateModified = value.date_modified == '' ? '' : value.date_modified == null ? '' : value.date_modified;

  }
  resetAll(){
    //if(this.lstProvidersLstClone.length>0)
      //this.providerchange(this.lstProvidersLstClone[0]);

    this.optionsSelect = 'Reason For Visit';
    this.grdName = 'Reason For Visit';
 
  if(this.lstTemplateValues.length>0)
    this.providersNoteschange(this.lstTemplateValues[0]);

    this.cancelProvTemplate();
  }
}