import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ORMSaveGuarantor } from 'src/app/models/setting/ORMSaveGuarantor';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { AlertTypeEnum, ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { GeneralService } from 'src/app/services/general/general.service';
import { SortFilterPaginationService, PagingOptions, FilterOptions, SortEvent, NgbdSortableHeader, SortFilterPaginationResult } from 'src/app/services/sort-filter-pagination.service';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'guarantor-setup',
  templateUrl: './guarantor-setup.component.html',
  styleUrls: ['./guarantor-setup.component.css']
})
export class GuarantorSetupComponent implements OnInit {
arrGuarantor;
arrGuarantorDB;
inputForm:FormGroup;
selectedIndex;
strOperation='';
objSave:ORMSaveGuarantor;
lstZipCityState: Array<any>;

pagingOptions:PagingOptions;
filterOptions:FilterOptions;
total: number;
page: number=1;
pageSize: number=20;
@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;  
sortEvent: SortEvent;

  constructor(private setupService: SetupService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  ,private formBuilder: FormBuilder,private modalService: NgbModal,private dateTimeUtil:DateTimeUtil
  ,private generalService: GeneralService,private sortFilterPaginationService: SortFilterPaginationService) { }

  ngOnInit() {
    this.getGuarantorList();
    this.buildForm();
  }
  
  getGuarantorList() {
    this.setupService.getSetupGuarantor(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
        data => {
            this.arrGuarantor = data as Array<any>;
            this.arrGuarantorDB= data as Array<any>;

            if(this.arrGuarantor!=undefined && this.arrGuarantor!=null)
            {
              this.selectedIndex=0;
              this.pagingOptions=new PagingOptions(this.page,this.pageSize)
              this.search();              
              this.assignValues();
            }
        },
        error => {
        }
    );
}
buildForm() {
  this.inputForm = this.formBuilder.group({
    txtfirstName: this.formBuilder.control(null, Validators.required),
    txtmname: this.formBuilder.control(null, Validators.required),
    txtlastName: this.formBuilder.control(null, Validators.required),
    txtdob: this.formBuilder.control(null, Validators.required),
    txtssn: this.formBuilder.control(null, Validators.required),
    drpGender: this.formBuilder.control(null, Validators.required),
    txtaddress: this.formBuilder.control(null, Validators.required),
    txtzip: this.formBuilder.control(null, Validators.required),
    txtcity: this.formBuilder.control(null, Validators.required),

    txtstate: this.formBuilder.control(null, Validators.required),
    txtphone: this.formBuilder.control(null, Validators.required),
    txtemail: this.formBuilder.control(null, Validators.required),
  });
  
}
onSelectionChange(index,obj){
  this.selectedIndex=index;
  this.assignValues();
  }
  
assignValues(){
  (this.inputForm.get("txtfirstName") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].first_name);
  (this.inputForm.get("txtmname") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].mname);
  (this.inputForm.get("txtlastName") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].last_name);
  (this.inputForm.get("txtdob") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrGuarantor[this.selectedIndex].dob, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
  (this.inputForm.get("drpGender") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].gender);
  (this.inputForm.get("txtaddress") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].address);
  (this.inputForm.get("txtzip") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].zip);
  (this.inputForm.get("txtcity") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].city);
  (this.inputForm.get("txtstate") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].state);
  (this.inputForm.get("txtphone") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].phone);
  (this.inputForm.get("txtemail") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].email);
  (this.inputForm.get("txtssn") as FormControl).setValue(this.arrGuarantor[this.selectedIndex].ssn);
}

enableDisable(value)
  {
    if(value=='disable')
      this.inputForm.disable();
    else
      this.inputForm.enable();
  }
  onEdit(){
    this.enableDisable('enable');  
    this.isDisable  =true;
    this.strOperation="Edit";
  } 
  onCancel(){
    if(this.arrGuarantor!=undefined && this.arrGuarantor!=null)
    {
      this.selectedIndex=0;
    }
    this.enableDisable('disable');    
    this.isDisable =false;
    this.strOperation="";
  }
  clearFields()
  {
    this.inputForm.reset();
  }
  isDisable=false;
  onAdd(){
    this.enableDisable('enable');
    this.clearFields();
    this.isDisable  =true;
    this.strOperation="newrecord";
  }
  validate():boolean{
    if(this.inputForm.get("txtfirstName").value=='' ||  this.inputForm.get("txtfirstName").value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Guarantor Setting','Please Enter First Name.','warning');
      return false;
    }
    if(this.inputForm.get("txtlastName").value=='' ||  this.inputForm.get("txtlastName").value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Guarantor Setting','Please Enter Last Name.','warning');
      return false;
    }
    if(this.inputForm.get("txtdob").value=='' ||  this.inputForm.get("txtdob").value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Guarantor Setting','Please Enter DOB.','warning');
      return false;
    }
    if(this.inputForm.get("drpGender").value=='' ||  this.inputForm.get("drpGender").value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Guarantor Setting','Please Select Gender.','warning');
      return false;
    }
     
    return true;
  }
  onSave() {
    debugger;
    if (this.validate() == false)
      return;

    this.objSave = new ORMSaveGuarantor;
    this.objSave.first_name = this.inputForm.get("txtfirstName").value;
    this.objSave.mname = this.inputForm.get("txtmname").value;
    this.objSave.last_name = this.inputForm.get("txtlastName").value;
    this.objSave.ssn = this.inputForm.get("txtssn").value;
    this.objSave.dob=this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtdob").value);
    this.objSave.gender = this.inputForm.get("drpGender").value;
    this.objSave.address = this.inputForm.get("txtaddress").value;
    this.objSave.state = this.inputForm.get("txtstate").value;
    this.objSave.city = this.inputForm.get("txtcity").value;
    this.objSave.zip = this.inputForm.get("txtzip").value;
    this.objSave.phone = this.inputForm.get("txtphone").value;
    this.objSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    
    this.objSave.email = this.inputForm.get("txtemail").value;
    

    if (this.strOperation=="newrecord") 
    {
      this.objSave.created_user = this.lookupList.logedInUser.user_name;
      this.objSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();;
    } else {
      this.objSave.guarantor_id = this.arrGuarantor[this.selectedIndex].guarantor_id;
      this.objSave.created_user = this.arrGuarantor[this.selectedIndex].created_user;
      this.objSave.client_date_created = this.arrGuarantor[this.selectedIndex].client_date_created;
      this.objSave.date_created = this.arrGuarantor[this.selectedIndex].date_created;
    }

    this.objSave.modified_user = this.lookupList.logedInUser.user_name;
    this.objSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();


    this.setupService.saveGuarantor(this.objSave).subscribe(
      data => {
        debugger;
        this.saveUserSuccess(data);
      },
      error => {
        this.saveUserError(error);
      }
    );
  }
  saveUserSuccess(data: any) 
  {
    debugger;
    this.enableDisable('disable');    
    this.isDisable =false;
    this.strOperation="";
    if (data.status === ServiceResponseStatusEnum.SUCCESS) 
    {
      if(this.objSave.guarantor_id==null || this.objSave.guarantor_id=='')
      {
        this.objSave.guarantor_id=data['result'];
        this.arrGuarantor.push(this.objSave);
      }
      else{
        this.arrGuarantor[this.selectedIndex].first_name = this.inputForm.get("txtfirstName").value;
        this.arrGuarantor[this.selectedIndex].mname = this.inputForm.get("txtmname").value;
        this.arrGuarantor[this.selectedIndex].last_name = this.inputForm.get("txtlastName").value;
        this.arrGuarantor[this.selectedIndex].ssn = this.inputForm.get("txtssn").value;
        this.arrGuarantor[this.selectedIndex].dob=this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtdob").value);
        this.arrGuarantor[this.selectedIndex].gender = this.inputForm.get("drpGender").value;
        this.arrGuarantor[this.selectedIndex].address = this.inputForm.get("txtaddress").value;
        this.arrGuarantor[this.selectedIndex].state = this.inputForm.get("txtstate").value;
        this.arrGuarantor[this.selectedIndex].city = this.inputForm.get("txtcity").value;
        this.arrGuarantor[this.selectedIndex].zip = this.inputForm.get("txtzip").value;
        this.arrGuarantor[this.selectedIndex].phone = this.inputForm.get("txtphone").value;
        this.arrGuarantor[this.selectedIndex].practice_id = this.lookupList.practiceInfo.practiceId.toString();
        this.arrGuarantor[this.selectedIndex].email = this.inputForm.get("txtemail").value;
      }
      //this.selectedIndex=0;
      //this.assignValues();
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Guarantor Save';
      modalRef.componentInstance.promptMessage = "Guarantor save successfully.";
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Guarantor Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveUserError(error: any) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Guarantor Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Guarantor."
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

zipFocusOut(zipCode: string) {
    debugger;
        if (zipCode != undefined) {
            if (zipCode.replace("-", "").length == 5 || zipCode.replace("-", "").length == 9) {
                this.getCityStateByZipCode(zipCode);
            }
        }
    }
getCityStateByZipCode(zipCode) {
  this.generalService.getCityStateByZipCode(zipCode).subscribe(
      data => {
          this.lstZipCityState = data as Array<any>;
          if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
              
            (this.inputForm.get("txtstate") as FormControl).setValue(this.lstZipCityState[0].state);
            
              if (this.lstZipCityState.length > 1) {
                  (this.inputForm.get("txtcity") as FormControl).setValue(null);
              }
              else if (this.lstZipCityState.length == 1) {
                  (this.inputForm.get("txtcity") as FormControl).setValue(this.lstZipCityState[0].city);
              }
          }
      },
      error => {
          this.getCityStateByZipCodeError(error);
      }
  );
}

getCityStateByZipCodeError(error) {
  //this.logMessage.log("getCityStateByZipCode Error." + error);
}
private search() {   
  let sortFilterPaginationResult :SortFilterPaginationResult = this.sortFilterPaginationService.search(this.arrGuarantorDB,this.headers,this.sortEvent,this.filterOptions,this.pagingOptions,'');
  this.arrGuarantor=sortFilterPaginationResult.list;
  this.total=sortFilterPaginationResult.total;
}
pageChange(event){   
  debugger; 
  this.page=event;
  this.pagingOptions=new PagingOptions(this.page,this.pageSize)
  this.search();
}
pageOptionChaged() {
  this.pagingOptions=new PagingOptions(this.page,this.pageSize)
  this.search();
} 
onDelete()
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
        deleteRecordData.column_id = this.arrGuarantor[this.selectedIndex].guarantor_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.setupService.deleteGuarantor(deleteRecordData)
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
      modalRef.componentInstance.promptHeading = "Guarantor Setup"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.arrGuarantorDB.splice(this.selectedIndex,1);
      this.search();
      
     
    }
  }
}
