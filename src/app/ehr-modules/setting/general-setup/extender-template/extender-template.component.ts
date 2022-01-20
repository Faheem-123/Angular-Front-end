import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SetupService } from 'src/app/services/setup.service';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMTemplate } from 'src/app/models/setting/ORMTemplate';
import { DateTimeUtil } from 'src/app/shared/date-time-util';

@Component({
  selector: 'extender-template',
  templateUrl: './extender-template.component.html',
  styleUrls: ['./extender-template.component.css']
})
export class ExtenderTemplateComponent implements OnInit {
  tempSetUpForm: FormGroup;
  newTemplate:boolean = true;
  listTemplateResult: Array<any>;
  selectedObj=null;
  isEditID='';
  isSelectedID='';
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, private formBuilder: FormBuilder,
  private setupService: SetupService,private modalService: NgbModal,private dateTimeUtil: DateTimeUtil
  ,private logMessage: LogMessage) { }

  ngOnInit() {
    this.buildForm();
    this.getTemplate('extender');
  }

  buildForm() {    
    this.tempSetUpForm = this.formBuilder.group({
      txt_TemplateName: this.formBuilder.control(null),
      txt_TemplateText: this.formBuilder.control(null)
    }
    );
  }
  getTemplate(value){
    debugger;
    this.setupService.getTemplate(this.lookupList.practiceInfo.practiceId.toString(), value).subscribe(
      data => {
        debugger;
          this.listTemplateResult =  data as Array<any>;
          if(this.listTemplateResult!=null && this.listTemplateResult.length>0)
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
  addNewTemplate(){
    debugger;
    this.newTemplate = false;
    //this.enableDisableCheckBox = true;
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
  PopTemplateSetup(val){
    debugger;
    this.isSelectedID = val.id;
    (this.tempSetUpForm.get("txt_TemplateText") as FormControl).setValue(val.text);
    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue(val.name);
   // this.getTemplateDetails();
  }
  editSeletedTemplate(value){
    (this.tempSetUpForm.get("txt_TemplateName") as FormControl).setValue(value.name);
    (this.tempSetUpForm.get("txt_TemplateText") as FormControl).setValue(value.text);
    this.isEditID = value.id;
    this.newTemplate = false;
    this.selectedObj=value;
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
      this.getTemplate('extender');
    }
  }
  saveTemplateSetup(){
    if(this.validate()){
      let ormSave: ORMTemplate = new ORMTemplate();
      if(this.isEditID != ''){
        ormSave.id = this.isEditID;
        ormSave.date_created = this.selectedObj.date_created;;
        ormSave.created_user = this.selectedObj.created_user;;
      }else{
        ormSave.id="";
        ormSave.date_created = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.created_user = this.lookupList.logedInUser.user_name;
      }
      ormSave.type="extender";
      ormSave.name = (this.tempSetUpForm.get('txt_TemplateName') as FormControl).value
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.text = (this.tempSetUpForm.get('txt_TemplateText') as FormControl).value
      ormSave.text_html = "";
      ormSave.deleted = false;
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      this.setupService.saveTemplateSetup(ormSave).subscribe(
        data => {
          debugger;
          this.getTemplate('extender');
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
}
