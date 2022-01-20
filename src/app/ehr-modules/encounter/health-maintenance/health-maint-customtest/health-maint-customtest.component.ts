import { Component, OnInit, Input, EventEmitter, Output, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORM_HealthMaintenanceDetail } from 'src/app/models/encounter/ORMHealthMaintenanceDetail';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'health-maint-customtest',
  templateUrl: './health-maint-customtest.component.html',
  styleUrls: ['./health-maint-customtest.component.css']
})
export class HealthMaintCustomtestComponent implements OnInit {

  @Input() objencounterToOpen:EncounterToOpen;
  @Input() lstTest;
  @Input() objSelectedMain;
  @Input() editOperation;
  @Output() dataUpdated = new EventEmitter<any>();
  listSaveTest: Array<ORM_HealthMaintenanceDetail> = [];
  objSelectedChild;
  localeditOperation='';
  inputForm:FormGroup;
  constructor( @Inject(LOOKUP_LIST) public lookupList: LookupList,
  private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil,
  private encounterService:EncounterService,private modalService: NgbModal
  , private logMessage: LogMessage) { }

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  ngOnInit() {

    this.buildForm();
  }
clearFields(){
  (this.inputForm.get("txtTestName") as FormControl).setValue("");
  (this.inputForm.get("txtCompleteDate") as FormControl).setValue("");
  (this.inputForm.get("txtDueDate") as FormControl).setValue("");
  (this.inputForm.get("chkRefused") as FormControl).setValue(false);
  (this.inputForm.get("txtComments") as FormControl).setValue("");
}
  buildForm(){
    this.inputForm = this.formBuilder.group({
      txtTestName:this.formBuilder.control("", Validators.required),
      txtCompleteDate: this.formBuilder.control("", Validators.required),
      txtDueDate: this.formBuilder.control("", Validators.required),
      chkRefused: this.formBuilder.control(false),
      txtComments:this.formBuilder.control("", Validators.required),    
    })
  }

  onAddtoList(formvalue)
  {
    debugger;
    let due_date;
    let cmp_date;
    if(formvalue.txtDueDate!="")  
      due_date=this.dateTimeUtil.getStringDateFromDateModel(formvalue.txtDueDate);
    else
      due_date='';
    if(formvalue.txtCompleteDate!="")  
    cmp_date=this.dateTimeUtil.getStringDateFromDateModel(formvalue.txtCompleteDate);
    else
      cmp_date='';

    // if(formvalue.chkRefused)  
    //   formvalue.refusal=='1'?true:false;
    // if(formvalue.txtComments)    
    //   formvalue.txtComments;

      //Add to Main List
      this.lstTest.push({
        visit_s_no:1,
        categroy_s_no:2,
        refusal: formvalue.chkRefused=='1'?true:false,
        phm_id:this.objSelectedMain.phm_id,
        detail_id:'',
        test_category:'CUSTOM TEST',
        test_name:formvalue.txtTestName,
        test_date:cmp_date,
        due_date:due_date,
        test_value:formvalue.txtComments
    });
    this.clearFields();
  }

  onSave(formvalue)
  {
    debugger;
    if (formvalue.txtCompleteDate != undefined && formvalue.txtCompleteDate != ''
    && !this.dateTimeUtil.isValidDateTime(formvalue.txtCompleteDate, DateTimeFormat.DATE_MODEL)) {
    GeneralOperation.showAlertPopUp(this.modalService,'Validation',"Test Complete Date is not in correct formate.",'warning') ;
    return;
    }
    if (formvalue.txtDueDate != undefined && formvalue.txtDueDate != ''
    && !this.dateTimeUtil.isValidDateTime(formvalue.txtDueDate, DateTimeFormat.DATE_MODEL)) {
    GeneralOperation.showAlertPopUp(this.modalService,'Validation',"Test Due Date is not in correct formate.",'warning') ;
    return;
  }
    if (this.listSaveTest == undefined)
      this.listSaveTest = new Array();

    if(this.localeditOperation=='Edit')
    {
      let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
      ormSave.test_category = 'CUSTOM TEST';
      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();

      ormSave.test_name = formvalue.txtTestName;
      ormSave.test_date = this.dateTimeUtil.getStringDateFromDateModel(formvalue.txtCompleteDate);
      ormSave.due_date =  this.dateTimeUtil.getStringDateFromDateModel(formvalue.txtDueDate);
      ormSave.test_value =  formvalue.txtComments;
      ormSave.refusal =  formvalue.chkRefused=='1'?true:false;

      ormSave.phm_id = this.objSelectedChild.phm_id;
      ormSave.detail_id = this.objSelectedChild.detail_id;

      if (this.editOperation == "New") {
        ormSave.created_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      }
      else {
        ormSave.created_user = this.objSelectedMain.created_user;
        ormSave.date_created = this.objSelectedMain.date_created;
        ormSave.client_date_created = this.objSelectedMain.client_date_created;
      }

      this.listSaveTest.push(ormSave);

      if(this.listSaveTest.length>0)
        this.onSendSaveCall();

      return;
    }
    for(let i=0;i<this.lstTest.length;i++)
    {
      if(this.lstTest[i].detail_id=='')
      {

        let ormSave: ORM_HealthMaintenanceDetail = new ORM_HealthMaintenanceDetail;
        ormSave.test_category = 'CUSTOM TEST';
        ormSave.modified_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
  
        ormSave.test_name = this.lstTest[i].test_name;
        ormSave.test_date = this.lstTest[i].test_date;
        ormSave.due_date =  this.lstTest[i].due_date;
        ormSave.test_value = this.lstTest[i].test_value;
        ormSave.refusal = this.lstTest[i].refusal;
  
        ormSave.phm_id = this.lstTest[i].phm_id;
  
        if (this.editOperation == "New") {
          ormSave.created_user = this.lookupList.logedInUser.user_name;
          ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        }
        else {
          ormSave.created_user = this.objSelectedMain.created_user;
          ormSave.date_created = this.objSelectedMain.date_created;
          ormSave.client_date_created = this.objSelectedMain.client_date_created;
        }
  
        // let filterTest = new ListFilterPipe().transform(this.lstTest, "test_name", 'Total Chol');
  
        // if (filterTest != null && filterTest.length > 0)
        //   ormSave.detail_id = filterTest[0].detail_id;
  
        this.listSaveTest.push(ormSave);

      }
    }
    if(this.listSaveTest.length>0)
      this.onSendSaveCall();
  }
  onSendSaveCall()
    {
      debugger;
      this.encounterService.saveHealthMaintDetail(this.listSaveTest).subscribe(
        data => {
          if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
           this.dataUpdated.emit();
          }
          else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
  
            
          }
        },
        error => {
          //this.showError("An error occured while saving Chart Assessments.");
        }
      );
    }
    onEdit(value)
    {
      this.localeditOperation='Edit';
      this.objSelectedChild=value;
      (this.inputForm.get("txtTestName") as FormControl).setValue(value.test_name);
      (this.inputForm.get("txtCompleteDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(value.test_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
      (this.inputForm.get("txtDueDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(value.due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
      (this.inputForm.get("chkRefused") as FormControl).setValue(value.refusal);
      (this.inputForm.get("txtComments") as FormControl).setValue(value.test_value);      
    }
  
    onDelete(value,index){
      const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
      modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
      modalRef.componentInstance.alertType='danger';
      let closeResult;
  
      modalRef.result.then((result) => {
  
        if (result == PromptResponseEnum.YES) {
          debugger;
          if(value.detail_id!='' && value.detail_id!=null)
          {
            let deleteRecordData = new ORMDeleteRecord();
            deleteRecordData.column_id = value.detail_id.toString();
            deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
            deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
            deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
    
            this.encounterService.deleteHealthMaintDetail(deleteRecordData)
              .subscribe(            
              data => this.onDeleteSuccessfully(data,index),
              error => alert(error),
              () => this.logMessage.log("Health Maintenance Deleted Successfull.")
              );
          }
          else{
              this.lstTest.splice(index,1);
          }
        }
      }, (reason) => {
        //alert(reason);
      });
    }
    onDeleteSuccessfully(data,index) {
  
      if (data.status === ServiceResponseStatusEnum.ERROR) {
  
        const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
        modalRef.componentInstance.promptHeading = "Encounter Health Maintenance"
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
        //this.getViewData();
        this.lstTest.splice(index,1);
      }
    }
    onCancel(){
      this.clearFields();
      this.localeditOperation='';
    }


}
