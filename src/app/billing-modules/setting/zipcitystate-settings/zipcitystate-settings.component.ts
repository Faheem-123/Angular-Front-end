import { Component, OnInit, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { UserService } from 'src/app/services/user/user.service';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralOperation } from 'src/app/shared/generalOperation';
//import { GeneralService } from 'src/app/services/general/general.service';
import { DateTimeUtil } from 'src/app/shared/date-time-util';

@Component({
  selector: 'zipcitystate-settings',
  templateUrl: './zipcitystate-settings.component.html',
  styleUrls: ['./zipcitystate-settings.component.css']
})
export class ZipcitystateSettingsComponent implements OnInit {

  isLoading;
  showSavebtns: Boolean = false;
  zipcitystateSave: FormGroup;
  searchForm: FormGroup;
  lstZipCityState: Array<any>;
  lstFindZipCityState: Array<any>;
  recordCount;
  selectedRowID;
  selectedRow;
  isEdit:Boolean = false;
  operation='';

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private userService: UserService, private modalService: NgbModal,
    //private generalService: GeneralService,
    private dateTimeUtil: DateTimeUtil,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.buildForm();
    this.disableFields();
    (this.searchForm.get("rdoziporcity") as FormControl).setValue("zipcode");
  }
  disableFields(){
    this.zipcitystateSave.get("txtZip").disable();
    this.zipcitystateSave.get("txtCity").disable();
    this.zipcitystateSave.get("txtState").disable();
  }
  enableFields(){
    this.zipcitystateSave.get("txtZip").enable();
    this.zipcitystateSave.get("txtCity").enable();
    this.zipcitystateSave.get("txtState").enable();
  }
  buildForm() {
    this.zipcitystateSave = this.formBuilder.group({
      txtZip: this.formBuilder.control("", Validators.required),
      txtCity: this.formBuilder.control("", Validators.required),
      txtState: this.formBuilder.control("", Validators.required)
    })
    this.searchForm = this.formBuilder.group({
      rdoziporcity: this.formBuilder.control(null, Validators.required),
      txtSerachBar: this.formBuilder.control(null, Validators.required)
    })
  }
  onCancel() {
    this.isEdit = false;
    this.zipcitystateSave.reset();
    this.showSavebtns = false;
    this.disableFields();
    this.operation = "";
    this.selectedRowID = "";
    this.selectedRow = "";
  }
  onSave(value) {
    debugger;
    if (value.txtZip == "" || value.txtZip == null || value.txtZip == undefined) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Zip Code', "Please enter Zip code.", AlertTypeEnum.WARNING);
      return;
    }
    if (value.txtCity == "" || value.txtCity == null || value.txtCity == undefined) {
      GeneralOperation.showAlertPopUp(this.modalService, 'City Name', "Please enter City name.", AlertTypeEnum.WARNING);
      return;
    }
    if (value.txtState == "" || value.txtState == null || value.txtState == undefined) {
      GeneralOperation.showAlertPopUp(this.modalService, 'State Name', "Please enter State name.", AlertTypeEnum.WARNING);
      return;
    }


if(this.isEdit == false){
//new case
this.getIsRecordExist(value);
}else{
  //edit case
  this.sendEditQuery(value)
  }
}
sendEditQuery(value){
  debugger;
  let zcsEdit: SearchCriteria = new SearchCriteria();
  zcsEdit.practice_id = this.lookupList.practiceInfo.practiceId;
  zcsEdit.param_list = [];
  zcsEdit.param_list.push({ name: "zip_code", value: value.txtZip, option: "" });
  zcsEdit.param_list.push({ name: "city", value: value.txtCity, option: "" });
  zcsEdit.param_list.push({ name: "state", value: value.txtState, option: "" });
  zcsEdit.param_list.push({ name: "oldcity", value: this.selectedRow.name, option: "" });
  zcsEdit.param_list.push({ name: "oldstate", value: this.selectedRow.address, option: "" });
  //zcsEdit.param_list.push({ name: "created_user", value: this.lookupList.logedInUser.user_name, option: "" });
  //zcsEdit.param_list.push({ name: "client_date_created", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" });
  zcsEdit.param_list.push({ name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" });
  zcsEdit.param_list.push({ name: "client_date_modified", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" });
  //zcsEdit.param_list.push({ name: "option", value: option, option: "" });
  this.userService.EditCityZipState(zcsEdit).subscribe(
    data => {
      //alert("saved");
      //GeneralOperation.showAlertPopUp(this.modalService, 'Save Record', "Saved.", AlertTypeEnum.WARNING);
      this.lstZipCityState = new Array<any>();
      this.clearAll();
    },
    error => {
      return;
    }
  );
}
sendSaveQuery(value){
  let zcsSave: SearchCriteria = new SearchCriteria();
  zcsSave.practice_id = this.lookupList.practiceInfo.practiceId;
  zcsSave.param_list = [];
  zcsSave.param_list.push({ name: "zip_code", value: value.txtZip, option: "" });
  zcsSave.param_list.push({ name: "city", value: value.txtCity, option: "" });
  zcsSave.param_list.push({ name: "state", value: value.txtState, option: "" });
  zcsSave.param_list.push({ name: "created_user", value: this.lookupList.logedInUser.user_name, option: "" });
  zcsSave.param_list.push({ name: "client_date_created", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" });
  zcsSave.param_list.push({ name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" });
  zcsSave.param_list.push({ name: "client_date_modified", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" });
  //zcsSave.param_list.push({ name: "option", value: option, option: "" });
  this.userService.saveCityZipState(zcsSave).subscribe(
    data => {
      //alert("saved");
      //GeneralOperation.showAlertPopUp(this.modalService, 'Save Record', "Saved.", AlertTypeEnum.WARNING);
      this.clearAll();
    },
    error => {
      return;
    }
  );
}
getIsRecordExist(val){
  let checkExist: SearchCriteria = new SearchCriteria();
  checkExist.practice_id = this.lookupList.practiceInfo.practiceId;
  checkExist.param_list = [];
  checkExist.param_list.push({ name: "txtZip", value: this.zipcitystateSave.get("txtZip").value, option: "" });
  checkExist.param_list.push({ name: "ddlCity", value: this.zipcitystateSave.get("txtCity").value, option: "" });
  checkExist.param_list.push({ name: "txtState", value: this.zipcitystateSave.get("txtState").value, option: "" });
  debugger;
  this.userService.getIsRecordExist(checkExist).subscribe(
    data => {
      debugger;
      if(data == true){
        GeneralOperation.showAlertPopUp(this.modalService, "Zip City State Setting", "Zip Code: " +this.zipcitystateSave.get("txtZip").value+ ", City: "+this.zipcitystateSave.get("txtCity").value+", State: "+this.zipcitystateSave.get("txtState").value+ " is already exist.", 'warning')
        return;
      }else{
        this.sendSaveQuery(val);
      }
    },
    error => {
      return;
    }
  );
}
  clearAll(){
    //(this.zipcitystateSave.get("txtZip") as FormControl).setValue('');
    //(this.zipcitystateSave.get("txtState") as FormControl).setValue('');
    //(this.zipcitystateSave.get("ddCity") as FormControl).setValue('');
    this.zipcitystateSave.reset();
    this.showSavebtns = false;
    this.isEdit = false;
    this.disableFields();
    this.operation = "";
    this.selectedRowID = "";
    this.selectedRow = "";
  }
  onEdit() {
    if(this.selectedRowID == "" || this.selectedRowID == null || this.selectedRowID == undefined){
      GeneralOperation.showAlertPopUp(this.modalService, 'No Record', "Please select any record first.", AlertTypeEnum.WARNING);
    }else{
      this.isEdit = true;
      this.showSavebtns = true;
      this.enableFields();
      this.operation = "Edit";
    }
  }
  onAddNew() {
    this.isEdit = false;
    this.zipcitystateSave.reset();
    this.showSavebtns = true;
    this.enableFields();
    this.operation = "new";
  }
  keyDownSearch(val){
    this.onSearch(val);
  }
  onSearch(value) {
    debugger;
    this.recordCount = 0;
    let zcsSearch: SearchCriteria = new SearchCriteria();
    zcsSearch.practice_id = this.lookupList.practiceInfo.practiceId;
    zcsSearch.param_list = [];
    zcsSearch.param_list.push({ name: "rdoType", value: value.rdoziporcity, option: "" });
    zcsSearch.param_list.push({ name: "textValue", value: value.txtSerachBar, option: "" });
    this.userService.searchCityZipState(zcsSearch).subscribe(
      data => {
        debugger;
        this.lstZipCityState = data as Array<any>;
        this.recordCount = this.lstZipCityState.length;
      },
      error => {
        return;
      }
    );
  }
  searchZipCode() {
    debugger;
    if ((this.zipcitystateSave.get('txtZip') as FormControl).value.length > 0) {
      if((this.zipcitystateSave.get('txtZip') as FormControl).value.length == 5 || (this.zipcitystateSave.get('txtZip') as FormControl).value.length == 9){

      }else{
        GeneralOperation.showAlertPopUp(this.modalService, 'Zip Code', "Please enter 5/9 digit zip code.", AlertTypeEnum.WARNING);
      }
    }


    //if ((this.zipcitystateSave.get('txtZip') as FormControl).value.length > 0) {
      // if ((this.zipcitystateSave.get('txtZip') as FormControl).value.replace("-", "").length == 5 || (this.zipcitystateSave.get('txtZip') as FormControl).value.replace("-", "").length == 9) {
      //   this.generalService.getCityStateByZipCode((this.zipcitystateSave.get('txtZip') as FormControl).value).subscribe(
      //     data => {
      //       this.lstFindZipCityState = data as Array<any>;
      //       if (this.lstFindZipCityState != null && this.lstFindZipCityState.length > 0) {

      //         (this.zipcitystateSave.get("txtState") as FormControl).setValue(this.lstFindZipCityState[0].state);

      //         // if (this.isZipLoading) {
      //         //     (this.zipcitystateSave.get("txtCity") as FormControl).setValue(this.patient.city);
      //         // }
      //         //else
      //         if (this.lstFindZipCityState.length > 1) {
      //           (this.zipcitystateSave.get("txtCity") as FormControl).setValue(null);
      //         }
      //         else if (this.lstFindZipCityState.length == 1) {
      //           (this.zipcitystateSave.get("txtCity") as FormControl).setValue(this.lstFindZipCityState[0].city);
      //         }
      //       }
      //     },
      //     error => {
      //     }
      //   );
      // }
   // } else {
   //   GeneralOperation.showAlertPopUp(this.modalService, 'Zip Code', "Please enter 5/9 digit zip code.", AlertTypeEnum.WARNING);
   // }
  }
  populateRowData(value){
    debugger;
    this.selectedRowID = value.sno;
    this.selectedRow = value;
    (this.zipcitystateSave.get("txtZip") as FormControl).setValue(value.id);
    (this.zipcitystateSave.get('txtCity') as FormControl).setValue(value.name);
    (this.zipcitystateSave.get("txtState") as FormControl).setValue(value.address);
    //this.searchZipCode();
  }
  
}