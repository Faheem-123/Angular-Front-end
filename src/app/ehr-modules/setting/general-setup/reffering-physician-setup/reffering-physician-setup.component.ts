import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ReferralService } from 'src/app/services/patient/referral.service';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ListFilterContainPipe } from 'src/app/shared/list-filter-contain-pipe';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ORMSaveReferral } from 'src/app/models/setting/ORMSaveReferral';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ServiceResponseStatusEnum, AlertTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralService } from 'src/app/services/general/general.service';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { PagingOptions, SortFilterPaginationResult, SortFilterPaginationService, NgbdSortableHeader, FilterOptions, SortEvent } from 'src/app/services/sort-filter-pagination.service';

@Component({
  selector: 'reffering-physician-setup',
  templateUrl: './reffering-physician-setup.component.html',
  styleUrls: ['./reffering-physician-setup.component.css']
})
export class RefferingPhysicianSetupComponent implements OnInit {
  inputForm:FormGroup;
  searchForm:FormGroup;
  arrphysician;
  arrphysicianFromDB
  arrphysicianFiltered;
  selectedIndex;
  lstConsultType;
  arrRefferingType: Array<String> = ['','Individual','Group'];
  strOperation='';
  lstZipCityState: Array<any>;
  objSave:ORMSaveReferral;

  pagingOptions:PagingOptions;
  filterOptions:FilterOptions;
  total: number;
  page: number=1;
  pageSize: number=20;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;  
  sortEvent: SortEvent;
  
  constructor(private setupService: SetupService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  ,private formBuilder: FormBuilder,private referralService: ReferralService,private modalService: NgbModal,
  private dateTimeUtil:DateTimeUtil,private generalService: GeneralService,  private sortFilterPaginationService: SortFilterPaginationService) { }

  ngOnInit() {
    this.getphysicianList();
    this.onGetConsultType();
    this.buildForm();
    this.enableDisable('disable');
  }
  onGetConsultType() {
    this.lstConsultType=undefined;
    this.referralService.getConsultType(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstConsultType = data;
      },
      error => {
      }
    );
  }
  getphysicianList() {
    this.setupService.getSetupReferringPhysician(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
        data => {
            this.arrphysician = data as Array<any>;
            this.arrphysicianFromDB = data as Array<any>;
            this.arrphysicianFiltered = this.arrphysician.slice();

            if(this.arrphysician!=undefined && this.arrphysician!=null)
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
// private search() {   
//   let sortFilterPaginationResult :SortFilterPaginationResult = this.sortFilterPaginationService.search(this.arrphysicianFromDB,this.headers,this.sortEvent,this.filterOptions,this.pagingOptions,'');
//   this.arrphysicianFiltered=sortFilterPaginationResult.list;
//   this.total=sortFilterPaginationResult.total;
// }
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
onSort(sortEvent: SortEvent) {
  this.sortEvent = sortEvent;
  this.search();
} 
getNGHighlightTerm(feild:string){

  if(this.filterOptions!=undefined){

    if(feild==this.filterOptions.searchFeild){
      return this.filterOptions.searchTerm;
    }
    else{
      return undefined;
    }
  }
}
onSelectionChange(index,obj){
this.selectedIndex=index;
this.assignValues();
}
buildForm() {
  this.inputForm = this.formBuilder.group({
    txtfirstName: this.formBuilder.control(null, Validators.required),
    txtlastName: this.formBuilder.control(null, Validators.required),
    txtmiddleName: this.formBuilder.control(null, Validators.required),
    txtssn: this.formBuilder.control(null, Validators.required),
    txtlicense: this.formBuilder.control(null, Validators.required),
    txtaddress: this.formBuilder.control(null, Validators.required),
    txtzip: this.formBuilder.control(null, Validators.required),
    txtcity: this.formBuilder.control(null, Validators.required),
    txtstate: this.formBuilder.control(null, Validators.required),

    txtphone: this.formBuilder.control(null, Validators.required),
    txtemail: this.formBuilder.control(null, Validators.required),
    txtfax: this.formBuilder.control(null, Validators.required),
    txtcontactPerson: this.formBuilder.control(null, Validators.required),
    txttaxonomyId: this.formBuilder.control(null, Validators.required),
    txtnpi: this.formBuilder.control(null, Validators.required),
    txtupn: this.formBuilder.control(null, Validators.required),
    txttaxid: this.formBuilder.control(null, Validators.required),
    txtreferringType: this.formBuilder.control(null, Validators.required),
    txtconsultType: this.formBuilder.control(null, Validators.required)
  });
//   this.searchForm = this.formBuilder.group({
//     txtSearch:this.formBuilder.control("", Validators.required),
//     rbCondition: this.formBuilder.control("rbfirstName", Validators.required),
// });
}
assignValues(){
  (this.inputForm.get("txtfirstName") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].first_name);
  (this.inputForm.get("txtlastName") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].last_name);
  (this.inputForm.get("txtmiddleName") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].mname);
  (this.inputForm.get("txtssn") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].ssn);
  (this.inputForm.get("txtlicense") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].license);
  (this.inputForm.get("txtaddress") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].address);
  (this.inputForm.get("txtzip") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].zip);
  (this.inputForm.get("txtcity") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].city);
  (this.inputForm.get("txtstate") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].state);

  (this.inputForm.get("txtphone") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].phone);
  (this.inputForm.get("txtemail") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].email);
  (this.inputForm.get("txtfax") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].fax);
  (this.inputForm.get("txtcontactPerson") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].contact_person);
  (this.inputForm.get("txttaxonomyId") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].taxonomy_code);
  (this.inputForm.get("txtnpi") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].npi);
  (this.inputForm.get("txtupn") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].upin);
  (this.inputForm.get("txttaxid") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].tax_id);
  (this.inputForm.get("txtreferringType") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].reffering_type);
  (this.inputForm.get("txtconsultType") as FormControl).setValue(this.arrphysicianFiltered[this.selectedIndex].consult_type_id);
}
onFilter(searchTerm:string,searchFeild:string) {
    
  // Clear all Other Filter Feilds
  let row = document.getElementById("filterRow");
  let inputs:any= row.getElementsByTagName("input");
  for (let input of inputs) {
    if(input.name!=searchFeild){
      input.value="";
    }      
  }

  this.filterOptions=new FilterOptions(searchTerm,searchFeild);    
  this.search();
}
private search() {   
  let sortFilterPaginationResult :SortFilterPaginationResult = this.sortFilterPaginationService.search(this.arrphysicianFromDB,this.headers,this.sortEvent,this.filterOptions,this.pagingOptions,'');
  this.arrphysicianFiltered=sortFilterPaginationResult.list;
  this.total=sortFilterPaginationResult.total;
}
// onFilter(value)
// {
//   debugger;
//   if(value.length>2)
//   {
//     let searchCol="";
//     if(this.searchForm.value.rbCondition=="rbfirstName")
//     {
//       searchCol="first_name";
//     }
//     else if(this.searchForm.value.rbCondition=="rblastName")
//     {
//       searchCol="last_name";
//     }
//     else if(this.searchForm.value.rbCondition=="rbSSN")
//     {
//       searchCol="ssn";
//     }
//     else if(this.searchForm.value.rbCondition=="rbPhone")
//     {
//       searchCol="phone";
//     }
//     else if(this.searchForm.value.rbCondition=="rbAddress")
//     {
//       searchCol="address";
//     }
//     else if(this.searchForm.value.rbCondition=="rbFax")
//     {
//       searchCol="fax";
//     }
//     else if(this.searchForm.value.rbCondition=="rbNPI")
//     {
//       searchCol="npi";
//     }
//     else if(this.searchForm.value.rbCondition=="rbConsultType")
//     {
//       searchCol="consult_type";
//     }
//     if(searchCol!="")
//       this.arrphysicianFiltered = new ListFilterContainPipe().transform(this.arrphysician, searchCol, value);
//   }
//   else {
//     this.arrphysicianFiltered = this.arrphysician.slice();
//   }
// }
enableDisable(value)
  {
    if(value=='disable')
      this.inputForm.disable();
    else
      this.inputForm.enable();
  }
  onEdit(){
    //console.log('enable');
    this.enableDisable('enable');  
    this.isDisable  =true;
    //this.getUserProviderAll(this.objUserDetail.user_id);
    this.strOperation="Edit";
  } 
  onCancel(){
    if(this.arrphysicianFiltered!=undefined && this.arrphysicianFiltered!=null)
    {
      this.selectedIndex=0;
    }
    this.enableDisable('disable');    
    this.isDisable  =false;
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
 
  onSave() {
    debugger;
    if (this.validate() == false)
      return;

    this.objSave = new ORMSaveReferral;
    this.objSave.first_name = this.inputForm.get("txtfirstName").value;
    this.objSave.mname = this.inputForm.get("txtmiddleName").value;
    this.objSave.last_name = this.inputForm.get("txtlastName").value;
    this.objSave.ssn = this.inputForm.get("txtssn").value;
    this.objSave.address = this.inputForm.get("txtaddress").value;
    this.objSave.state = this.inputForm.get("txtstate").value;
    this.objSave.city = this.inputForm.get("txtcity").value;
    this.objSave.zip = this.inputForm.get("txtzip").value;
    this.objSave.phone = this.inputForm.get("txtphone").value;
    this.objSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.objSave.fax = this.inputForm.get("txtfax").value;
    this.objSave.email = this.inputForm.get("txtemail").value;
    this.objSave.upin = this.inputForm.get("txtupn").value;
    this.objSave.npi = this.inputForm.get("txtnpi").value;
    this.objSave.tax_id = this.inputForm.get("txttaxid").value;
    this.objSave.license = this.inputForm.get("txtlicense").value;
    this.objSave.taxonomy_code = this.inputForm.get("txttaxonomyId").value;
    this.objSave.reffering_type = this.inputForm.get("txtreferringType").value;
    this.objSave.contact_person = this.inputForm.get("txtcontactPerson").value;
    this.objSave.consult_type_id = this.inputForm.get("txtconsultType").value;

    if (this.strOperation=="newrecord") {
      //objSave.created_user=GeneralOptions.LoginUserID;
      this.objSave.created_user = this.lookupList.logedInUser.user_name;
      this.objSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    } else {
      this.objSave.referral_id = this.arrphysicianFiltered[this.selectedIndex].referral_id;
      this.objSave.created_user = this.arrphysicianFiltered[this.selectedIndex].referral_id.created_user;
      this.objSave.client_date_created = this.arrphysicianFiltered[this.selectedIndex].referral_id.client_date_created;
      this.objSave.date_created = this.arrphysicianFiltered[this.selectedIndex].referral_id.date_created;
    }

    this.objSave.modified_user = this.lookupList.logedInUser.user_name;
    this.objSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();


    this.setupService.saveReferral(this.objSave).subscribe(
      data => {
        debugger;
        this.saveUserSuccess(data);
      },
      error => {
        this.saveUserError(error);
      }
    );
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  saveUserSuccess(data: any) 
  {
    debugger;
    this.enableDisable('disable');    
    this.isDisable =false;
    this.strOperation="";
    if (data.status === ServiceResponseStatusEnum.SUCCESS) 
    {
      if(this.objSave.referral_id==null || this.objSave.referral_id=='')
      {
        this.objSave.referral_id=data['result'];
        this.arrphysicianFiltered.push(this.objSave);
      }
      else{
        
        this.arrphysicianFiltered[this.selectedIndex].first_name = this.inputForm.get("txtfirstName").value;
        this.arrphysicianFiltered[this.selectedIndex].mname = this.inputForm.get("txtmiddleName").value;
        this.arrphysicianFiltered[this.selectedIndex].last_name = this.inputForm.get("txtlastName").value;
        this.arrphysicianFiltered[this.selectedIndex].ssn = this.inputForm.get("txtssn").value;
        this.arrphysicianFiltered[this.selectedIndex].address = this.inputForm.get("txtaddress").value;
        this.arrphysicianFiltered[this.selectedIndex].state = this.inputForm.get("txtstate").value;
        this.arrphysicianFiltered[this.selectedIndex].city = this.inputForm.get("txtcity").value;
        this.arrphysicianFiltered[this.selectedIndex].zip = this.inputForm.get("txtzip").value;
        this.arrphysicianFiltered[this.selectedIndex].phone = this.inputForm.get("txtphone").value;
        this.arrphysicianFiltered[this.selectedIndex].practice_id = this.lookupList.practiceInfo.practiceId.toString();
        this.arrphysicianFiltered[this.selectedIndex].fax = this.inputForm.get("txtfax").value;
        this.arrphysicianFiltered[this.selectedIndex].email = this.inputForm.get("txtemail").value;
        this.arrphysicianFiltered[this.selectedIndex].upin = this.inputForm.get("txtupn").value;
        this.arrphysicianFiltered[this.selectedIndex].npi = this.inputForm.get("txtnpi").value;
        this.arrphysicianFiltered[this.selectedIndex].tax_id = this.inputForm.get("txttaxid").value;
        this.arrphysicianFiltered[this.selectedIndex].license = this.inputForm.get("txtlicense").value;
        this.arrphysicianFiltered[this.selectedIndex].taxonomy_code = this.inputForm.get("txttaxonomyId").value;
        this.arrphysicianFiltered[this.selectedIndex].reffering_type = this.inputForm.get("txtreferringType").value;
        this.arrphysicianFiltered[this.selectedIndex].contact_person = this.inputForm.get("txtcontactPerson").value;
        this.arrphysicianFiltered[this.selectedIndex].consult_type_id = this.inputForm.get("txtconsultType").value;
      }
      //this.selectedIndex=0;
      //this.assignValues();
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Referral Save';
      modalRef.componentInstance.promptMessage = "Referral save successfully.";
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Referral Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveUserError(error: any) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Referral Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Referral."
  }
  validate():boolean{
    if(this.inputForm.get("txtfirstName").value=='' ||  this.inputForm.get("txtfirstName").value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Referral Setting','Please Enter First Name.','warning');
      return false;
    }
    if(this.inputForm.get("txtlastName").value=='' ||  this.inputForm.get("txtlastName").value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Referral Setting','Please Enter Last Name.','warning');
      return false;
    }
     
    return true;
  }
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
        deleteRecordData.column_id = this.arrphysicianFiltered[this.selectedIndex].referral_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.setupService.deleteReferral(deleteRecordData)
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
      modalRef.componentInstance.promptHeading = "Referral Setup"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.arrphysicianFromDB.splice(this.selectedIndex,1);
      this.search();
     
    }
  }
}
