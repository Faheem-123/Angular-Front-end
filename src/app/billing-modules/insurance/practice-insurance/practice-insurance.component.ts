import { Component, OnInit, Inject } from '@angular/core';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { FormBuilder } from '@angular/forms';
import { InsurancesService } from 'src/app/services/insurances.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ORMPracticeInsurance } from 'src/app/models/setting/ORMPracticeInsurance';
import { ListFilterContainsAnyGeneral } from 'src/app/shared/filter-pipe-contains-any-general';

@Component({
  selector: 'practice-insurance',
  templateUrl: './practice-insurance.component.html',
  styleUrls: ['./practice-insurance.component.css']
})
export class PracticeInsuranceComponent implements OnInit {

  listInsType;
  listInsType_Filter;
  selectedGroupRow=0;
  listInspayer;
  listInspayer_Filter;
  selectedPayerRow=0;
  listIns;
  selectedInsRow=0;
  listunMappedInsurance;
  listunMappedInsurance_Filter;
  selectedUnMappedInsRow=0;
  listMappedInsurance;
  selectedMappedInsRow=0;

  constructor(private insService: InsurancesService,private formBuilder: FormBuilder,private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,private generalService: GeneralService,
     private logMessage: LogMessage,private modalService: NgbModal) { }

  ngOnInit() {
    this.getInsuranceTypes();
  }
  
  getUnMappedPracticeInsurances(payer_id)
  {
    this.insService.getUnMappedPracticeInsurances(this.lookupList.practiceInfo.practiceId,"0",payer_id)
      .subscribe(
        data => {
          this.listunMappedInsurance = data;
          this.listunMappedInsurance_Filter = data;
          this.selectedUnMappedInsRow=0;
          },
        error => {
          this.logMessage.log("An Error Occured while getting getInsuranceTypes list.")
        }
      );
  }
  getMappedPracticeInsurances(payer_id)
  {
    this.insService.getUnMappedPracticeInsurances(this.lookupList.practiceInfo.practiceId,"1",payer_id)
      .subscribe(
        data => {
          this.listMappedInsurance = data;
          this.selectedMappedInsRow=0;
          },
        error => {
          this.logMessage.log("An Error Occured while getting getInsuranceTypes list.")
        }
      );
  }
  getInsuranceTypes()
  {
    this.insService.getInsurancePayerTypes()
      .subscribe(
        data => {
          this.listInsType = data;
          this.listInsType_Filter = data;
          this.selectedGroupRow=0;
          if(this.listInsType.length>0)
          {
            this.getPayerTypePayer(this.listInsType[this.selectedGroupRow].payertype_id)
          }
          },
        error => {
          this.logMessage.log("An Error Occured while getting getInsuranceTypes list.")
        }
      );
  }
  getPayerTypePayer(id)
  {
    this.insService.getPayerTypePayer(id)
      .subscribe(
        data => {
          this.listInspayer = data;
          this.listInspayer_Filter = data;
          this.selectedPayerRow=0;
          if(this.listInspayer.length>0)
          {
            this.getUnMappedPracticeInsurances(this.listInspayer[this.selectedPayerRow].payer_id);
            this.getMappedPracticeInsurances(this.listInspayer[this.selectedPayerRow].payer_id);
          }
          //this.getPayerInsurance(this.listInspayer[this.selectedPayerRow].payer_id)
          },
        error => {
          this.logMessage.log("An Error Occured while getting getPayerTypePayer list.")
          // this.isLoading = false;
        }
      );
  }
  onGroupSelectionChange(index: number,obj) {
    this.selectedGroupRow = index;
    this.getPayerTypePayer(this.listInsType[this.selectedGroupRow].payertype_id)

  }
  onpayerselectionChange(index: number,obj) {
    this.selectedPayerRow = index;
   // this.getPayerInsurance(this.listInspayer[this.selectedPayerRow].payer_id);
   this.getUnMappedPracticeInsurances(this.listInspayer[this.selectedPayerRow].payer_id);
    this.getMappedPracticeInsurances(this.listInspayer[this.selectedPayerRow].payer_id);
  }
  onInsuranceselectionChange(index: number){
    this.selectedUnMappedInsRow = index;
    
    //this.getPayerInsurance(this.listIns[this.selectedInsRow].insurance_id);
  }
  onMappedInsuranceselectionChange(index: number){
    this.selectedMappedInsRow = index;
    
    //this.getPayerInsurance(this.listIns[this.selectedInsRow].insurance_id);
  }
  onInsuranceSelection(event: any, index){
    debugger;
    this.listunMappedInsurance[index].chk=event.target.checked;
  }
  onMapInsurance(){
    debugger;
    let lstSave: Array<ORMPracticeInsurance>=new Array;

    for (let i = 0; i < this.listunMappedInsurance.length; i++) {
      if(this.listunMappedInsurance[i].chk==true)
      {
        let objORM = new ORMPracticeInsurance();
        objORM.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        objORM.insurance_id = this.listunMappedInsurance[i].insurance_id;
        objORM.insurance_name=this.listunMappedInsurance[i].name;
        objORM.deleted = false;
        objORM.system_ip = this.lookupList.logedInUser.systemIp;
        objORM.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        objORM.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        objORM.created_user = this.lookupList.logedInUser.user_name;
        objORM.modified_user = this.lookupList.logedInUser.user_name;
  
        lstSave.push(objORM);
      }
      
    }
    if(lstSave.length>0)
    {
      this.insService.savePracticeInsurance(lstSave).subscribe(
        data=>{
          this.getUnMappedPracticeInsurances(this.listInspayer[this.selectedPayerRow].payer_id);
          this.getMappedPracticeInsurances(this.listInspayer[this.selectedPayerRow].payer_id);
        },error=>{

        }
      );
    }

  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  onDelete(){

  const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.listMappedInsurance[this.selectedMappedInsRow].practice_insurance_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.insService.deletePracticeInsurance(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),

          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Practice Insurance"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.listMappedInsurance.splice(this.selectedMappedInsRow, 1);
      if(this.listMappedInsurance.length>0)
      {
        this.selectedMappedInsRow=0;
      }
    }
  }
  onInsuranceNameChange(value, index) {
    this.listunMappedInsurance[index].name = value;
  }
  onGroupFilter(value){
    if (value != "") {
      let filterObjCuser: any = { name: value };
      this.listInsType = new ListFilterContainsAnyGeneral().transform(this.listInsType_Filter, filterObjCuser);
    } else {
      this.listInsType = this.listInsType_Filter;
    }
  }

  onPayerFilter(value){
    if (value != "") {
      let filterObjCuser: any = { name: value };
      this.listInspayer = new ListFilterContainsAnyGeneral().transform(this.listInspayer_Filter, filterObjCuser);
    } else {
      this.listInspayer = this.listInspayer_Filter;
    }
  }

  onInsuranceFilter(value){
    if (value != "") {
      let filterObjCuser: any = { name: value };
      this.listunMappedInsurance = new ListFilterContainsAnyGeneral().transform(this.listunMappedInsurance_Filter, filterObjCuser);
    } else {
      this.listunMappedInsurance = this.listunMappedInsurance_Filter;
    }
  }

}
