import { Component, OnInit, Inject, ElementRef, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ORMProblemBasedTemplate } from 'src/app/models/encounter/ORMProblemBasedTemplate';
import { ORMtemplateprovider } from 'src/app/models/setting/ORMtemplateprovider';
import { SetupService } from 'src/app/services/setup.service';

@Component({
  selector: 'problem-based-template-setup',
  templateUrl: './problem-based-template-setup.component.html',
  styleUrls: ['./problem-based-template-setup.component.css']
})
export class ProblemBasedTemplateSetupComponent implements OnInit {
  @Input() callingFrom: CallingFromEnum;
  inputForm:FormGroup;
  tempSetUpForm:FormGroup;
  listTemplateResult;
  listTemplateproviders;
  isSelectedID='';
  selectedProvidersID;
  newTemplate:boolean = true;
  enableDisableCheckBox:boolean = true;
  isDisable=false;
  constructor(private formBuilder: FormBuilder,private encounterService: EncounterService,private setupService:SetupService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,private modalService: NgbModal,private dateTimeUtil:DateTimeUtil,
    private hostElement: ElementRef) { }

  ngOnInit() {
    this.buildForm();
    debugger;
    if (this.callingFrom == CallingFromEnum.user_admin) {
      this.getProviderWiseProblemBasedTemplate();
    }else{
      this.getProblemBasedChartTemplate();
    }
  }
  getProblemBasedChartTemplate(){
    this.encounterService.getProblemBasedChartTemplate(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.listTemplateResult =  data as Array<any>;
        if(this.listTemplateResult.length>0)
        {
          this.isSelectedID=this.listTemplateResult[0].template_id;
          this.tempSelectedIndex=0;
          this.PopTemplateSetup(this.listTemplateResult[0],this.tempSelectedIndex)
          this.getProviderOfProblemBasedTemplate(this.listTemplateResult[0].template_id);
        }
      },
      error => {
        
      }
    );
  }
  getProviderWiseProblemBasedTemplate(){
    this.encounterService.getProblemBasedTemplateEncounter(this.lookupList.practiceInfo.practiceId, this.lookupList.logedInUser.loginProviderId).subscribe(
      data => {
        debugger;
        this.listTemplateResult =  data as Array<any>;
        if(this.listTemplateResult.length>0)
        {
          this.isSelectedID=this.listTemplateResult[0].template_id;
          this.PopTemplateSetup(this.listTemplateResult[0],0)
        }
      },
      error => {
        
      }
    );
  }
  getProviderOfProblemBasedTemplate(template_id){
    this.encounterService.getProviderOfProblemBasedTemplate(this.lookupList.practiceInfo.practiceId,template_id).subscribe(
      data => {
        debugger;
        this.listTemplateproviders =  data as Array<any>;
       
      },
      error => {
        
      }
    );
  } 
  
  buildForm(){
    this.inputForm = this.formBuilder.group({
      planSetuptxt: this.formBuilder.control(null, Validators.required),
      PESetuptxt: this.formBuilder.control(null, Validators.required),
      ROSSetuptxt: this.formBuilder.control(null, Validators.required),
      PMHSetuptxt: this.formBuilder.control(null, Validators.required),
      HPISetuptxt: this.formBuilder.control(null, Validators.required),
      RFVSetuptxt: this.formBuilder.control(null, Validators.required)
    }),
    this.tempSetUpForm=this.formBuilder.group({
      txt_TemplateName: this.formBuilder.control(null, Validators.required),
    })
  }
  tempSelectedIndex=0;
  PopTemplateSetup(val,indx){
    debugger;
    this.tempSelectedIndex=indx;
    this.isSelectedID = val.template_id;   

    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue(val.name);

    (this.inputForm.get("RFVSetuptxt") as FormControl).setValue(this.listTemplateResult[this.tempSelectedIndex].rfv_txt==null?"":this.listTemplateResult[this.tempSelectedIndex].rfv_txt);
    this.resizeTextarea("RFVSetuptxt");
    (this.inputForm.get("HPISetuptxt") as FormControl).setValue(this.listTemplateResult[this.tempSelectedIndex].hpi_txt==null?"":this.listTemplateResult[this.tempSelectedIndex].hpi_txt);
    this.resizeTextarea("HPISetuptxt");
    (this.inputForm.get("PMHSetuptxt") as FormControl).setValue(this.listTemplateResult[this.tempSelectedIndex].pmh_txt==null?"":this.listTemplateResult[this.tempSelectedIndex].pmh_txt);
    this.resizeTextarea("PMHSetuptxt");
    (this.inputForm.get("ROSSetuptxt") as FormControl).setValue(this.listTemplateResult[this.tempSelectedIndex].ros_txt==null?"":this.listTemplateResult[this.tempSelectedIndex].ros_txt);
    this.resizeTextarea("ROSSetuptxt");
    (this.inputForm.get("PESetuptxt") as FormControl).setValue(this.listTemplateResult[this.tempSelectedIndex].pe_txt==null?"":this.listTemplateResult[this.tempSelectedIndex].pe_txt);
    this.resizeTextarea("PESetuptxt");
    (this.inputForm.get("planSetuptxt") as FormControl).setValue(this.listTemplateResult[this.tempSelectedIndex].notes_txt==null?"":this.listTemplateResult[this.tempSelectedIndex].notes_txt);
    this.resizeTextarea("planSetuptxt");

    this.getProviderOfProblemBasedTemplate(this.isSelectedID);
  }

  resizeTextarea(id) {
    debugger;
    var a = document.getElementById(id);
    if (a != null) {
      a.style.height = 'auto';
      a.style.height = a.scrollHeight + 'px';
    }
  }
   
  addNewTemplate(){
    debugger;
    this.newTemplate = false;
    this.enableDisableCheckBox = true;
    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue('');

    (this.inputForm.get("RFVSetuptxt") as FormControl).setValue("");
    this.resizeTextarea("RFVSetuptxt");
    (this.inputForm.get("HPISetuptxt") as FormControl).setValue("");
    this.resizeTextarea("HPISetuptxt");
    (this.inputForm.get("PMHSetuptxt") as FormControl).setValue("");
    this.resizeTextarea("PMHSetuptxt");
    (this.inputForm.get("ROSSetuptxt") as FormControl).setValue("");
    this.resizeTextarea("ROSSetuptxt");
    (this.inputForm.get("PESetuptxt") as FormControl).setValue("");
    this.resizeTextarea("PESetuptxt");
    (this.inputForm.get("planSetuptxt") as FormControl).setValue("");
    this.resizeTextarea("planSetuptxt");

    this.isSelectedID = '';
    this.isDisable=true;
  }
  editSeletedTemplate(value){
    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue(value.name);
    this.isSelectedID = value.template_id;
    this.newTemplate = false;
    this.isDisable=true;
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
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = value.template_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteProblemBasedTemplate(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
          );        
      }
    }, (reason) => {
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
          
        });
    }
    else {
      this.getProblemBasedChartTemplate();
    }
  }
  validate(): boolean {
    if ((this.tempSetUpForm.get('txt_TemplateName') as FormControl).value == "") {
      alert("Please Enter Template Name.");
      return false;
    }
    return true;
  }
  saveTemplateSetup(){
    if(this.validate()){
      let ormSave: ORMProblemBasedTemplate = new ORMProblemBasedTemplate();
      if(this.isSelectedID != ''){
        ormSave.template_id = this.isSelectedID;
        ormSave.date_created = this.listTemplateResult[this.tempSelectedIndex].date_created;
        ormSave.created_user = this.listTemplateResult[this.tempSelectedIndex].created_user;
      }else{
        ormSave.date_created = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.created_user = this.lookupList.logedInUser.user_name;
      }

      ormSave.name = (this.tempSetUpForm.get('txt_TemplateName') as FormControl).value;
      ormSave.modified_user = this.lookupList.logedInUser.user_name;

      ormSave.deleted = false;
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.rfv_txt=(this.inputForm.get('RFVSetuptxt') as FormControl).value;
      ormSave.hpi_txt=(this.inputForm.get('HPISetuptxt') as FormControl).value;
      ormSave.pmh_txt=(this.inputForm.get('PMHSetuptxt') as FormControl).value;
      ormSave.ros_txt=(this.inputForm.get('ROSSetuptxt') as FormControl).value;
      ormSave.pe_txt=(this.inputForm.get('PESetuptxt') as FormControl).value;
      ormSave.notes_txt=(this.inputForm.get('planSetuptxt') as FormControl).value;

       
      this.encounterService.saveProblemBasedTemplateSetup(ormSave).subscribe(
        data => {
          debugger;
          this.isSelectedID = data['result'];
          if (this.callingFrom == CallingFromEnum.user_admin) {
            if(this.isSelectedID)
              this.saveSelectedProvider();
          }

          this.getProblemBasedChartTemplate();
          this.isDisable=false;
          this.newTemplate = true;
        },
        error => {
        }
      );
    }
  }
  cancelNewTemplate(){
    this.newTemplate = true;
    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue('');    
    this.getProblemBasedChartTemplate();
    this.isDisable=false;
    if(this.listTemplateResult.length>0)
    {
      this.isSelectedID=this.listTemplateResult[0].template_id;
      this.tempSelectedIndex=0;

      this.PopTemplateSetup(this.listTemplateResult[0],this.tempSelectedIndex);
    }
  }
  onProviderClick(value){
      this.selectedProvidersID = value.provider_id;
  }
  checkChkBox(id, event){
    debugger;
    for(var i = 0; i < this.listTemplateproviders.length; i++){
      if (event == true) {
        if (this.listTemplateproviders[i].provider_id == id) {
          this.listTemplateproviders[i].chkbox = true;
          return;
        }
      } else if (event == false) {
        if (this.listTemplateproviders[i].provider_id == id) {
          this.listTemplateproviders[i].chkbox = false;
          return;
        }
      }
    }
  }
  editProvider(){
    this.enableDisableCheckBox = false;
    this.isDisable=false;
  }
  cancelProvider(){
    this.enableDisableCheckBox = true;
    this.isDisable=false;
    this.newTemplate = true;
  }
  strsetting_ids: String;
  strTemplate_id: String;
  saveSelectedProvider(){
    debugger;
    //if call from user admin start
    if (this.callingFrom == CallingFromEnum.user_admin) {
      let ormSave: ORMtemplateprovider = new ORMtemplateprovider();
          
      ormSave.template_id=this.isSelectedID;            
      ormSave.provider_id = this.lookupList.logedInUser.loginProviderId.toString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      ormSave.deleted = false;
      ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.created_user = this.lookupList.logedInUser.user_name;
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
                 

     this.setupService.saveSelectedProvider(ormSave)
      .subscribe(
        data => {
          this.cancelProvider();
          if(this.listTemplateResult.length>0)
          this.getProviderOfProblemBasedTemplate(this.isSelectedID);
          this.isDisable=false;
        },
        error => alert(error),
          
      );
    }//if call from user admin end
    else{


    for(var i = 0; i < this.listTemplateproviders.length; i++){
      if(this.listTemplateproviders[i].chkbox==true){
        if(this.listTemplateproviders[i].id==null || this.listTemplateproviders[i].id=="0"){
          let ormSave: ORMtemplateprovider = new ORMtemplateprovider();
          
            ormSave.template_id=this.isSelectedID;            
            ormSave.provider_id = this.listTemplateproviders[i].provider_id;
            ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
            ormSave.deleted = false;
            ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
            ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
            ormSave.created_user = this.lookupList.logedInUser.user_name;
            ormSave.modified_user = this.lookupList.logedInUser.user_name;
                       

           this.setupService.saveSelectedProvider(ormSave)
            .subscribe(
              data => {
                this.cancelProvider();
                if(this.listTemplateResult.length>0)
                this.getProviderOfProblemBasedTemplate(this.isSelectedID);
                this.isDisable=false;
              },
              error => alert(error),
                
            );
        }//new end
      }//checkbox true
      else{
        debugger;
        if('A-CHART' == 'A-CHART'){
              this.strTemplate_id="";
              this.strTemplate_id=this.isSelectedID;
						 
              if(this.strsetting_ids){
                this.strsetting_ids += ", "+ this.listTemplateproviders[i].id;
              }else{
                this.strsetting_ids = this.listTemplateproviders[i].id;
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
      );
    }
  }
  }
}
