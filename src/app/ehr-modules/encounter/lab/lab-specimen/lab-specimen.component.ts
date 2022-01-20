import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LabService } from 'src/app/services/lab/lab.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LogMessage } from 'src/app/shared/log-message';
import { ORMLabSpecimenSave } from 'src/app/models/lab/ORMLabSpecimenSave';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { DateModel } from 'src/app/models/general/date-model';
import { TimeModel } from 'src/app/models/general/time-model';

@Component({
  selector: 'lab-specimen',
  templateUrl: './lab-specimen.component.html',
  styleUrls: ['./lab-specimen.component.css']
})
export class LabSpecimenComponent implements OnInit {
  @Input() order_Id;
  lstOrderTest;
  lstTestSpecimen;
  SelectedTestObj;
  SelectedSpecimenObj;
  inputForm:FormGroup;
  operation:string='';
  addEditView=false;
  visitDateModel: DateModel;
  visitTimeModel: TimeModel;
  constructor(private logMessage:LogMessage,private formBuilder: FormBuilder,private dateTimeUtil: DateTimeUtil, 
    @Inject(LOOKUP_LIST) public lookupList: LookupList,private labService:LabService,
    private modalService: NgbModal) 
    {

     }

  ngOnInit() {
    this.buildForm();
    this.getViewData();
    this.enableDisableControls(false);

    this.visitDateModel = this.dateTimeUtil.getDateModelFromDateString(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
    this.visitTimeModel = this.dateTimeUtil.getTimeModelFromTimeString(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
  }

  buildForm(){
    this.inputForm = this.formBuilder.group({
      txtSpecimenid: this.formBuilder.control("", Validators.required),
      txtSpecimentag: this.formBuilder.control("", Validators.required),
      txtSpecimenSource: this.formBuilder.control("", Validators.required),
      txtSpecimenType: this.formBuilder.control("", Validators.required),
      txtSpecimenStartDate: this.formBuilder.control("", Validators.required),
      txtSpecimenStartTime: this.formBuilder.control("", Validators.required),
      txtSpecimenEndDate: this.formBuilder.control("", Validators.required),
      txtSpecimenEndTime: this.formBuilder.control("", Validators.required),
      txtSpecimenVolume: this.formBuilder.control("", Validators.required),
      txtSpecimenUnit: this.formBuilder.control("", Validators.required),
      txtSpecimenRejReason: this.formBuilder.control("", Validators.required),
      txtSpecimencondition: this.formBuilder.control("", Validators.required)     
    })
  }
  enableDisableControls(value:boolean){
    if(value==true)
    {
      this.inputForm.get('txtSpecimenid').enable() ; 
      this.inputForm.get('txtSpecimentag').enable() ; 
      this.inputForm.get('txtSpecimentag').enable() ; 
      this.inputForm.get('txtSpecimenSource').enable() ; 
      this.inputForm.get('txtSpecimenType').enable() ; 
      this.inputForm.get('txtSpecimenStartDate').enable() ; 
      this.inputForm.get('txtSpecimenStartTime').enable() ; 
      this.inputForm.get('txtSpecimenEndDate').enable() ; 
      this.inputForm.get('txtSpecimenEndTime').enable() ; 
      this.inputForm.get('txtSpecimenVolume').enable() ; 
      this.inputForm.get('txtSpecimenUnit').enable() ; 
      this.inputForm.get('txtSpecimenRejReason').enable() ; 
      this.inputForm.get('txtSpecimencondition').enable() ; 
    }
    else{
      this.inputForm.get('txtSpecimenid').disable() ; 
      this.inputForm.get('txtSpecimentag').disable() ; 
      this.inputForm.get('txtSpecimentag').disable() ; 
      this.inputForm.get('txtSpecimenSource').disable() ; 
      this.inputForm.get('txtSpecimenType').disable() ; 
      this.inputForm.get('txtSpecimenStartDate').disable() ; 
      this.inputForm.get('txtSpecimenStartTime').disable() ; 
      this.inputForm.get('txtSpecimenEndDate').disable() ; 
      this.inputForm.get('txtSpecimenEndTime').disable() ; 
      this.inputForm.get('txtSpecimenVolume').disable() ; 
      this.inputForm.get('txtSpecimenUnit').disable() ; 
      this.inputForm.get('txtSpecimenRejReason').disable() ; 
      this.inputForm.get('txtSpecimencondition').disable() ; 
    }
  }
  onTestClick(obj)
  {
    debugger;
    this.SelectedTestObj= obj;
    this.getTestSpecimen(obj.test_id)
  }
  clearFields(){
    (this.inputForm.get("txtSpecimenid") as FormControl).setValue("");
    (this.inputForm.get("txtSpecimentag") as FormControl).setValue("");
    (this.inputForm.get("txtSpecimenSource") as FormControl).setValue("");
    (this.inputForm.get("txtSpecimenType") as FormControl).setValue("");
    (this.inputForm.get("txtSpecimenStartDate") as FormControl).setValue("");

    (this.inputForm.get("txtSpecimenStartTime") as FormControl).setValue("");
    (this.inputForm.get("txtSpecimenEndDate") as FormControl).setValue("");

    (this.inputForm.get("txtSpecimenEndTime") as FormControl).setValue("");

    (this.inputForm.get("txtSpecimenVolume") as FormControl).setValue("");
    (this.inputForm.get("txtSpecimenUnit") as FormControl).setValue("");
    (this.inputForm.get("txtSpecimenRejReason") as FormControl).setValue("");
    (this.inputForm.get("txtSpecimencondition") as FormControl).setValue("");
  }
  assignValues(obj)
  {  
    this.SelectedSpecimenObj=obj;
    (this.inputForm.get("txtSpecimenid") as FormControl).setValue(obj.specimen_id);
    (this.inputForm.get("txtSpecimentag") as FormControl).setValue(obj.tag);
    (this.inputForm.get("txtSpecimenSource") as FormControl).setValue(obj.source);
    (this.inputForm.get("txtSpecimenType") as FormControl).setValue(obj.specimen_type);
    
    if(obj.collection_start_date!=null && obj.collection_start_date.length>9)
      (this.inputForm.get("txtSpecimenStartDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(obj.collection_start_date.substring(0,10),DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    else
      (this.inputForm.get("txtSpecimenStartDate") as FormControl).setValue("");

      (this.inputForm.get("txtSpecimenStartTime") as FormControl).setValue(this.dateTimeUtil.getTimeModelFromTimeString(obj.collection_start_time,DateTimeFormat.DATEFORMAT_hh_mm_a));

    //(this.inputForm.get("txtSpecimenStartTime") as FormControl).setValue(obj.collection_start_time);
    
    if(obj.collection_end_date!=null && obj.collection_end_date.length>9)
      (this.inputForm.get("txtSpecimenEndDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(obj.collection_end_date.substring(0,10),DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    else
      (this.inputForm.get("txtSpecimenEndDate") as FormControl).setValue("");

// (this.inputForm.get("txtSpecimenEndTime") as FormControl).setValue(this.dateTimeUtil.getTimeModelFromTimeString(obj.collection_end_time, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a));

    (this.inputForm.get("txtSpecimenEndTime") as FormControl).setValue(this.dateTimeUtil.getTimeModelFromTimeString(obj.collection_end_time,DateTimeFormat.DATEFORMAT_hh_mm_a));

    (this.inputForm.get("txtSpecimenVolume") as FormControl).setValue(obj.volume);
    (this.inputForm.get("txtSpecimenUnit") as FormControl).setValue(obj.measure_unit);
    (this.inputForm.get("txtSpecimenRejReason") as FormControl).setValue(obj.rejected_reason);
    (this.inputForm.get("txtSpecimencondition") as FormControl).setValue(obj.tag);
  }
  getViewData(){
    debugger;
    this.labService.getOrderTest(this.order_Id)
    .subscribe(
      data => {
        this.lstOrderTest = data;
        if(this.lstOrderTest.length>0)
          this.onTestClick(this.lstOrderTest[0]);
      },
      error => {
        this.logMessage.log("An Error Occured while getting getOrderTest list specimen.")
      }
    );
  }
  getTestSpecimen(test_id)
  {
    this.labService.getTestSpecimen(test_id)
    .subscribe(
      data => {
        this.lstTestSpecimen = data;
        if(this.lstTestSpecimen.length>0)
        {
          this.assignValues(this.lstTestSpecimen[0]);
        }
        else{
          this.clearFields();
        }
      },
      error => {
        this.logMessage.log("An Error Occured while getting getTestSpecimen list specimen.")
      }
    );
  }
  validation():boolean{
    if(this.inputForm.get("txtSpecimenid").value=='' ||  this.inputForm.get("txtSpecimenid").value==null)
    {
      this.onShowValidationPopUp('Patient Order Specimen Validation','Please enter Specimen ID.','warning');
      return false;
    }
    if(this.inputForm.get("txtSpecimentag").value=='' ||  this.inputForm.get("txtSpecimentag").value==null)
    {
      this.onShowValidationPopUp('Patient Order Specimen Validation','Please enter Specimen Tag.','warning');
      return false;
    }
    return true;
  }
  onShowValidationPopUp(message_heading:string,message_Body:string,message_type:string) 
  {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = message_heading
      modalRef.componentInstance.promptMessage = message_Body;
      modalRef.componentInstance.alertType = message_type;     
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  onEdit(){
    this.operation='Edit';
    this.addEditView=true;
    this.enableDisableControls(true);
  }
  onNew(){
    this.operation='New';
    this.addEditView=true;
    this.clearFields();
    this.enableDisableControls(true);
  }
  onCancel(){
    this.operation='';
    this.addEditView=false;
    this.enableDisableControls(false);
  }
  onSaveClick(){
    debugger;
    if(this.validation()==true)
    {
      this.SaveSpecimen();
    }

  }
  SaveSpecimen(){
    debugger;
    let obj: ORMLabSpecimenSave = new ORMLabSpecimenSave;

    if(this.operation=='New')
    {
      obj.created_user =  this.lookupList.logedInUser.user_name;
      obj.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else{
      obj.patient_specimen_id = this.SelectedSpecimenObj.patient_specimen_id;
      obj.created_user = this.SelectedSpecimenObj.created_user;
      obj.client_date_created = this.SelectedSpecimenObj.client_date_created;
      obj.date_created = this.SelectedSpecimenObj.date_created;
    }
    obj.test_id = this.SelectedTestObj.test_id;
    obj.practice_id=this.lookupList.practiceInfo.practiceId.toString();
    if(this.lookupList.isLabInterface)
      obj.test_code=this.SelectedTestObj.lab_assigned_cpt;
    else
      obj.test_code=this.SelectedTestObj.proc_code;

    obj.order_id = this.order_Id;
    obj.specimen_id = this.inputForm.get("txtSpecimenid").value;
    obj.tag = this.inputForm.get("txtSpecimentag").value;
    obj.source = this.inputForm.get("txtSpecimenSource").value;

    if(this.inputForm.get("txtSpecimenStartDate").value!=null && this.inputForm.get("txtSpecimenStartDate").value!='')
    {
      obj.collection_start_datetime = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtSpecimenStartDate").value);
    }
    if(this.inputForm.get("txtSpecimenStartTime").value!=null && this.inputForm.get("txtSpecimenStartTime").value!='')
    {
      obj.collection_start_datetime +=" "+this.dateTimeUtil.getStringTimeFromTimeModel(this.inputForm.get("txtSpecimenStartTime").value);
    }
    if(this.inputForm.get("txtSpecimenEndDate").value!=null && this.inputForm.get("txtSpecimenEndDate").value!='')
    {
      obj.collection_end_datetime = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtSpecimenEndDate").value);
    }
    if(this.inputForm.get("txtSpecimenStartTime").value!=null && this.inputForm.get("txtSpecimenEndTime").value!='')
    {
      obj.collection_end_datetime +=" "+this.dateTimeUtil.getStringTimeFromTimeModel(this.inputForm.get("txtSpecimenEndTime").value);
    }

    //obj.collection_start_datetime = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtSpecimenStartDate").value)+ " "+this.dateTimeUtil.getStringTimeFromTimeModel(this.inputForm.get("txtSpecimenStartTime").value);
    //obj.collection_end_datetime = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtSpecimenEndDate").value)+ " "+this.dateTimeUtil.getStringTimeFromTimeModel(this.inputForm.get("txtSpecimenEndTime").value);

    obj.volume = this.inputForm.get("txtSpecimenVolume").value;
    obj.measure_unit = this.inputForm.get("txtSpecimenUnit").value;
    obj.speciment_disposition = this.inputForm.get("txtSpecimencondition").value;
    obj.rejected_reason= this.inputForm.get("txtSpecimenRejReason").value;
    obj.deleted = false;
  
    obj.modified_user = this.lookupList.logedInUser.user_name;
    obj.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    this.labService.saveLabSpecimen(obj).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.enableDisableControls(false);
          this.getTestSpecimen(this.SelectedTestObj.test_id);
          this.addEditView=false;
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) 
        {
          this.showError(data['response']);
        }
      },
      error => {
        this.showError("An error occured while saving Lab specimen.");
      }
    );
    
  }
  showError(errMsg) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Error";
    modalRef.componentInstance.promptMessage = errMsg;
    modalRef.componentInstance.alertType = "error";

    let closeResult;

    modalRef.result.then((result) => {

      //alert(result);
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
        //alert(reason);
      });

    return;
  }
  onDelete(obj)
  {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.patient_specimen_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.labService.deleteSpecimen(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Specimen Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Specimen "
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
      this.getViewData();
     
    }
  }

}
