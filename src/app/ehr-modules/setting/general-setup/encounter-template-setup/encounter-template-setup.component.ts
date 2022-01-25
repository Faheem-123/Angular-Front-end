import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { SetupService } from 'src/app/services/setup.service';
import { ORMTemplate } from 'src/app/models/setting/ORMTemplate';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMtemplateprovider } from 'src/app/models/setting/ORMtemplateprovider';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'encounter-template-setup',
  templateUrl: './encounter-template-setup.component.html',
  styleUrls: ['./encounter-template-setup.component.css']
})
export class EncounterTemplateSetupComponent implements OnInit {

  optionSelect = 'Reason For Visit';
  tempSetUpForm: FormGroup;
  radioForm: FormGroup;
  gridName = 'Reason For Visit';
  isEditID='';
  enableDisableCheckBox:boolean = true;
  newTemplate:boolean = true;
  isSelectedID='';
  listTemplate_hpi: Array<any>;
  listTemplate_rfv: Array<any>;
  listTemplate_pmh: Array<any>;
  listTemplate_ros: Array<any>;
  listTemplate_pe: Array<any>;
  listTemplate_plan: Array<any>;
  
  listTemplateResult: Array<any>;

  listProvidersClone: Array<any>;
  //callingFor='';
  strsetting_ids: String;
  strTemplate_id: String;
  selectedProvidersID;
  acProviderSave: Array<any>;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private generalService: GeneralService,
  private setupService: SetupService,
  private modalService: NgbModal,
  private dateTimeUtil: DateTimeUtil,
  private logMessage: LogMessage,
  private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.buildForm();
    if (this.lookupList.providerList == undefined || this.lookupList.providerList.length == 0) {
      //this.getProviderList();
    }else{
     // this.listProvidersClone = this.lookupList.providerList;
    }
    this.getTemplateResult('Reason For Visit');
  }
  buildForm() {
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control('rfv'),
    }
    );
    this.tempSetUpForm = this.formBuilder.group({
      txt_TemplateName: this.formBuilder.control(null),
      txt_TemplateText: this.formBuilder.control(null)
    }
    );
  }
  getProviderList(){
    this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.providerList =  data as Array<any>;
        this.listProvidersClone = this.lookupList.providerList;
      },
      error => {
        this.getProviderListError(error);
      }
    );
  }
  getProviderListError(error){
    this.logMessage.log("getProviderList Error." + error);
  }
  changeTemplateTab(value){
    debugger;
    this.optionSelect = value;
    this.gridName = value;
    this.getTemplateResult(value);
  }
  checkChkBox(id, event){
    debugger;
    for(var i = 0; i < this.listProvidersClone.length; i++){
      if (event == true) {
        if (this.listProvidersClone[i].provider_id == id) {
          this.listProvidersClone[i].chkbox = true;
          return;
        }
      } else if (event == false) {
        if (this.listProvidersClone[i].provider_id == id) {
          this.listProvidersClone[i].chkbox = false;
          return;
        }
      }
      // if(event==true){
      //   if(this.listProvidersClone[i].row_id == id){
      //     this.listProvidersClone[i].chkbox = true;
      //     return;
      //   }
      // }else if(event==false){
      //   if(this.listProvidersClone[i].row_id == id){
      //     this.listProvidersClone[i].chkbox = false;
      //     return;
      //   }
      // }
    }
  }
  providerschange(value){
    this.selectedProvidersID = value.provider_id;
  }
  editProvider(){
    this.enableDisableCheckBox = false;
  }
  cancelProvider(){
    this.enableDisableCheckBox = true;
  }
  addNewTemplate(){
    debugger;
    this.newTemplate = false;
    this.enableDisableCheckBox = true;
    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue('');
    (this.tempSetUpForm.get("txt_TemplateText") as FormControl).setValue('');
    this.isEditID = '';
  }
  cancelNewTemplate(){
    this.newTemplate = true;
    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue('');
    (this.tempSetUpForm.get("txt_TemplateText") as FormControl).setValue('');
    if(this.listTemplateResult.length>0)
      this.PopTemplateSetup(this.listTemplateResult[0]);
  }
  getTemplateResult(value){
    debugger;
    switch (value.toLowerCase()) {
      case "reason for visit":
        this.getTemplate('RFV');
        break;
      case "hpi":
        this.getTemplate('HPI');
        break;
      case "pmh":
        this.getTemplate('PMH');
        break;
      case "ros":
        this.getTemplate('ROS');
        break;
      case "physical exam":
        this.getTemplate('PE');
        break;
      case "plan":
        this.getTemplate('chart');
        break;
      default:
        break;
    }
  }
  removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
     return newArray;
}
  getTemplate(value){
    debugger;
    this.setupService.getTemplate(this.lookupList.practiceInfo.practiceId.toString(), value).subscribe(
      data => {
        debugger;
        if(value == 'RFV'){
          this.listTemplate_rfv = data as Array<any>;
          this.listTemplate_rfv = this.removeDuplicates(this.listTemplate_rfv, "name");
          this.listTemplateResult =  data as Array<any>;
        }else if(value == 'HPI'){
          this.listTemplate_hpi =  data as Array<any>;
          this.listTemplate_hpi = this.removeDuplicates(this.listTemplate_hpi, "name");
          this.listTemplateResult =  data as Array<any>;
        }else if(value == 'PMH'){
          this.listTemplate_pmh =  data as Array<any>;
          this.listTemplate_pmh = this.removeDuplicates(this.listTemplate_pmh, "name");
          this.listTemplateResult =  data as Array<any>;
        }else if(value == 'ROS'){
          this.listTemplate_ros =  data as Array<any>;
          this.listTemplate_ros = this.removeDuplicates(this.listTemplate_ros, "name");
          this.listTemplateResult =  data as Array<any>;
        }else if(value == 'PE'){
          this.listTemplate_pe =  data as Array<any>;
          this.listTemplate_pe = this.removeDuplicates(this.listTemplate_pe, "name");
          this.listTemplateResult =  data as Array<any>;
        }else if(value == 'chart'){
          this.listTemplate_plan =  data as Array<any>;
          this.listTemplate_plan = this.removeDuplicates(this.listTemplate_plan, "name");
          this.listTemplateResult =  data as Array<any>;
        }

        if(this.listTemplateResult.length>0)
            
           this.listTemplateResult = this.removeDuplicates(this.listTemplateResult, "name");
          this.PopTemplateSetup(this.listTemplateResult[0]);
      },
      error => {
        this.getTemplateError(error);
      }
    );
  }
  getTemplateError(error){
    this.logMessage.log("getTemplate Error." + error);
  }


  PopTemplateSetup(val){
    debugger;
    this.isSelectedID = val.id;
    (this.tempSetUpForm.get("txt_TemplateText") as FormControl).setValue(val.text);
    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue(val.name);
    this.getTemplateDetails();
  }
 
  getTemplateDetails(){
     this.setupService.getTemplateDetails(this.lookupList.practiceInfo.practiceId.toString(), this.isSelectedID).subscribe(
       data => {
         debugger;
         //this.SetProvidersSectionsCheckList(data);
         this.listProvidersClone = data as Array<any>;
         // if(type == 'RFV'){
         //   this.listTemplate_rfv = data as Array<any>;
         //   this.listTemplateResult =  data as Array<any>;
         // }else if(type == 'HPI'){
         //   this.listTemplate_hpi =  data as Array<any>;
         //   this.listTemplateResult =  data as Array<any>;
         // }else if(type == 'PMH'){
         //   this.listTemplate_pmh =  data as Array<any>;
         //   this.listTemplateResult =  data as Array<any>;
         // }else if(type == 'ROS'){
         //   this.listTemplate_ros =  data as Array<any>;
         //   this.listTemplateResult =  data as Array<any>;
         // }else if(type == 'PE'){
         //   this.listTemplate_pe =  data as Array<any>;
         //   this.listTemplateResult =  data as Array<any>;
         // }else if(type == 'Plan'){
         //   this.listTemplate_plan =  data as Array<any>;
         //   this.listTemplateResult =  data as Array<any>;
         // }
       },
       error => {
         this.getTemplateError(error);
       }
     );    
   }
   SetProvidersSectionsCheckList(data){
     debugger;
     if (this.listTemplateResult == null)
      return;

      if (this.listTemplateResult != null && this.listProvidersClone != null) {
        for (var i = 0; i < this.listProvidersClone.length; i++) {
          this.listProvidersClone[i].chkbox = false;
          for (var j = 0; j < data.length; j++) {
            if(this.listProvidersClone[i].id == data[j].provider_id){
              //if(data[j].chkbox == true){
                this.listProvidersClone[i].chkbox = true;
                //break;
              //}
              //else{
              //  this.listProvidersClone[i].chk = false;
             // }
            }else{
              this.listProvidersClone[i].chkbox = false;
            }
          }


          // if(this.isSelectedID == this.listProvidersClone[i].id){
          //   this.listProvidersClone[i].chk = true;
          // }else{
          //   this.listProvidersClone[i].chk = false;
          // }
        }
      }
   }
  editSeletedTemplate(value){
    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue(value.name);
    (this.tempSetUpForm.get("txt_TemplateText") as FormControl).setValue(value.text);
    this.isEditID = value.id;
    this.newTemplate = false;
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  deleteSeletedTemplate(value){
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
          { name: "column_id", value: value.id, option: "" },
          { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" }
        ];

        this.setupService.deleteSeletedTemplate(searchCriteria)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Tempalte Deleted Successfull.")
          );

          // let deleteRecordData = new ORMDeleteRecord();
          // deleteRecordData.column_id = value.id.toString();
          // deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
          // deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
          // deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
          // this.setupService.deleteSeletedTemplate(deleteRecordData)
          //   .subscribe(            
          //   data => this.onDeleteSuccessfully(data),
          //   error => alert(error),
          //   () => this.logMessage.log("Tempalte Deleted Successfull.")
          //   );
        
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
        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      this.getTemplate('RFV');
    }
  }
  saveTemplateSetup(){
    if(this.validate()){
      let ormSave: ORMTemplate = new ORMTemplate();
      if(this.isEditID != ''){
        ormSave.id = this.isEditID;
        ormSave.date_created = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.created_user = this.lookupList.logedInUser.user_name;
      }else{
        ormSave.id="";
        ormSave.date_created = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.created_user = this.lookupList.logedInUser.user_name;
      }
      ormSave.name = (this.tempSetUpForm.get('txt_TemplateName') as FormControl).value
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.text = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value
      ormSave.text_html = "";
      ormSave.deleted = false;
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      if(this.optionSelect == 'Reason For Visit'){
        ormSave.type = "RFV";
      }else if(this.optionSelect == 'HPI'){
        ormSave.type = "HPI";
      }else if(this.optionSelect == 'PMH'){
        ormSave.type = "PMH";
      }else if(this.optionSelect == 'ROS'){
        ormSave.type = "ROS";
      }else if(this.optionSelect == 'Physical Exam'){
        ormSave.type = "PE";
      }else if(this.optionSelect == 'Plan'){
        ormSave.type = "chart";
      }
      this.setupService.saveTemplateSetup(ormSave).subscribe(
        data => {
          debugger;
          this.getTemplateResult('Reason For Visit');
          this.cancelNewTemplate();
        },
        error => {
        }
      );
    }
  }
  validate(): boolean {
    if ((this.tempSetUpForm.get('txt_TemplateName') as FormControl).value == "") {
      alert("Please Enter Template Name.");
      return false;
    }
    if ((this.tempSetUpForm.get('txt_TemplateText') as FormControl).value == "") {
      alert("Please Enter Template Text.");
      return false;
    }
    return true;
  }
  saveSelectedProvider(){
    debugger;
    for(var i = 0; i < this.listProvidersClone.length; i++){
      if(this.listProvidersClone[i].chkbox==true){
        if(this.listProvidersClone[i].id==null || this.listProvidersClone[i].id=="0"){
          let ormSave: ORMtemplateprovider = new ORMtemplateprovider();
          
          ormSave.id="";
            if('A-CHART'=='A-CHART'){
              //strTemplate_id="";
              if(this.optionSelect=="Reason For Visit")
              {
                //strTemplate_id=dgtemplate_rfv.selectedItem.id;
                ormSave.template_id=this.isSelectedID;;
                ormSave.template_text=(this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
                ormSave.template_html="";
              }
              else if(this.optionSelect=="HPI")
              {
                //strTemplate_id=dgtemplate_hpi.selectedItem.id;
                ormSave.template_id=this.isSelectedID;;
                ormSave.template_text=(this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
                ormSave.template_html="";
              }
              else if(this.optionSelect=="PMH")
              {
                //strTemplate_id=dgtemplate_pmh.selectedItem.id;
                ormSave.template_id=this.isSelectedID;;
                ormSave.template_text=(this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
                ormSave.template_html="";
              }
              else if(this.optionSelect=="ROS")
              {
                //strTemplate_id=dgtemplate_ros.selectedItem.id;
                ormSave.template_id=this.isSelectedID;;
                ormSave.template_text=(this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
                ormSave.template_html="";
              }
              else if(this.optionSelect=="Physical Exam")
              {
                //strTemplate_id=dgtemplate_pe.selectedItem.id;
                ormSave.template_id=this.isSelectedID;;
                ormSave.template_text=(this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
                ormSave.template_html="";
              }
              else if(this.optionSelect=="Plan")
              {
                //strTemplate_id=dgtemplate_plan.selectedItem.id;
                ormSave.template_id=this.isSelectedID;;
                ormSave.template_text=(this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
                ormSave.template_html="";
              }
            }

            ormSave.provider_id = this.listProvidersClone[i].provider_id;
            ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
            ormSave.deleted = false;
            ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
            ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
            ormSave.created_user = this.lookupList.logedInUser.user_name;
            ormSave.modified_user = this.lookupList.logedInUser.user_name;
            
            //if (this.acProviderSave == undefined)
            // this.acProviderSave = new Array<any>();

           // this.acProviderSave.push(ormSave);

           this.setupService.saveSelectedProvider(ormSave)
            .subscribe(
              data => {
                this.cancelProvider();
                if(this.listTemplateResult.length>0)
                  this.PopTemplateSetup(this.listTemplateResult[0]);
              },
              error => alert(error),
                () => this.logMessage.log("saveSelectedProvider Error.")
            );
        }//new end
      }//checkbox true
      else{
        debugger;
        if('A-CHART' == 'A-CHART'){
							this.strTemplate_id="";
							if(this.optionSelect=="Reason For Visit"){
								this.strTemplate_id=this.isSelectedID;
							}
							else if(this.optionSelect=="HPI"){
								this.strTemplate_id=this.isSelectedID;
							}
							else if(this.optionSelect=="PMH"){
								this.strTemplate_id=this.isSelectedID;
							}
							else if(this.optionSelect=="ROS"){
								this.strTemplate_id=this.isSelectedID;
							}
							else if(this.optionSelect=="Physical Exam"){
								this.strTemplate_id=this.isSelectedID;
							}
							else if(this.optionSelect=="Plan"){
								this.strTemplate_id=this.isSelectedID;
              }
              if(this.strsetting_ids){
                this.strsetting_ids += ", "+ this.listProvidersClone[i].id;
              }else{
                this.strsetting_ids = this.listProvidersClone[i].id;
              }
            }
      }//checkbox true else end
    }//for end
    if(this.strsetting_ids != ""){
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
        { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" },
        { name: "template_id", value: this.strTemplate_id, option: "" },
        { name: "id", value: this.strsetting_ids, option: "" }
      ];
      this.setupService.DeleteTemplateProvider(searchCriteria)
      .subscribe(
        data => {
          this.strTemplate_id = "";
          this.strsetting_ids = "";
          this.cancelProvider();
          this.cancelNewTemplate();
        },
        error => alert(error),
        () => this.logMessage.log("DeleteTemplateProvider Error.")
      );
    }
  }
  onChkIsProviderChange(e: any) {
    debugger;
    var checked = e.target.checked;
    for(var i=0;i<this.listProvidersClone.length;i++)
    {
      this.listProvidersClone[i].chkbox=checked;
    }
  }
  // saveSelectedProvider(){
  //   debugger;
    
  //   for(var i = 0; i < this.listProvidersClone.length; i++){
  //     if(this.listProvidersClone[i].chkbox==true){
  //       //if(acTemplateproviders[i].id==null || acTemplateproviders[i].id=="0")
  //       let ormSave: ORMtemplateprovider = new ORMtemplateprovider();
  //       ormSave.id="";
      
	// 			//pnltemplaterfv.enabled=true;
  //       if("A-Chart"=="A-Chart"){
  //         this.strTemplate_id = "";
  //         this.strTemplate_id = this.isSelectedID;
  //         ormSave.template_id = this.strTemplate_id;
  //         ormSave.template_html="";
  //         ormSave.template_text = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
          
  //         //if(this.optionSelect == 'Reason For Visit'){
  //         //   ormSave.template_text = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
  //         // }else if(this.optionSelect == 'HPI'){
  //         //   ormSave.template_text = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
  //         // }else if(this.optionSelect == 'PMH'){
  //         //   ormSave.template_text = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
  //         // }else if(this.optionSelect == 'ROS'){
  //         //   ormSave.template_text = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
  //         // }else if(this.optionSelect == 'Physical Exam'){
  //         //   ormSave.template_text = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
  //         // }else if(this.optionSelect == 'Plan'){
  //         //   ormSave.template_text = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;
  //         // }
  //       }else{
  //         this.strTemplate_id = this.isSelectedID;
  //         ormSave.template_id = this.strTemplate_id;
  //         //ormSave.template_text = rtEditor.text;
  //         //ormSave.template_html = rtEditor.htmlText;
  //         ormSave.template_html = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value;

  //       }
  //       ormSave.provider_id = this.listProvidersClone[i].id;
  //       ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  //       ormSave.deleted = false;
  //       ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
  //       ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
  //       ormSave.created_user = this.lookupList.logedInUser.user_name;
  //       ormSave.modified_user = this.lookupList.logedInUser.user_name;



  //       this.setupService.saveSelectedProvider(ormSave)
  //       .subscribe(
  //         data => {
  //           // this.strTemplate_id = "";
  //           // this.strsetting_ids = "";
  //           // this.cancelProvider();
  //           // this.cancelNewTemplate();
  //         },
  //         error => alert(error),
  //         () => this.logMessage.log("DeleteTemplateProvider Error.")
  //       );



  //     }else{
  //       debugger;
  //       //if(GeneralOptions.Practice_Template_Type=='A-CHART')
  //       if("A-Chart"=="A-Chart"){
  //         this.strTemplate_id = "";
  //         this.strTemplate_id = this.isSelectedID;
  //       }
  //       if(this.strsetting_ids){
  //         this.strsetting_ids += ", "+ this.listProvidersClone[i].id;
  //       }else{
  //         this.strsetting_ids = this.listProvidersClone[i].id;
  //       }
  //       // if(this.strsetting_ids == "" || this.strsetting_ids == undefined || this.strsetting_ids == null)
  //       //   this.strsetting_ids = this.listProvidersClone[i].id;
  //       // else
  //       //   this.strsetting_ids += ", "+ this.listProvidersClone[i].id;
  //     }
  //   }


  //   if(this.strsetting_ids != ""){
  //     let searchCriteria: SearchCriteria = new SearchCriteria();
  //     searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
  //     searchCriteria.param_list = [
  //       { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" },
  //       { name: "template_id", value: this.strTemplate_id, option: "" },
  //       { name: "id", value: this.strsetting_ids, option: "" }
  //     ];
  //     this.setupService.DeleteTemplateProvider(searchCriteria)
  //     .subscribe(
  //       data => {
  //         this.strTemplate_id = "";
  //         this.strsetting_ids = "";
  //         this.cancelProvider();
  //         this.cancelNewTemplate();
  //       },
  //       error => alert(error),
  //       () => this.logMessage.log("DeleteTemplateProvider Error.")
  //     );
  //   }
  // }
}