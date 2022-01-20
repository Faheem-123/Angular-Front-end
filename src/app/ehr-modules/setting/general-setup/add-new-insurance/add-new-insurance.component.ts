import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { SetupService } from 'src/app/services/setup.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ORMinsurancesetup } from 'src/app/models/setting/orm-insurance-setup';
import { LogMessage } from 'src/app/shared/log-message';
import { ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'add-new-insurance',
  templateUrl: './add-new-insurance.component.html',
  styleUrls: ['./add-new-insurance.component.css']
})
export class AddNewInsuranceComponent implements OnInit {

  isDisable = false;
  strOperation = '';
  newInsuranceForm: FormGroup;
  selectedIndex;
  payerid: String = "300101243";//ihc clients
  lstInsurance: Array<any>;
  isSelectedInsID = '';
  isEditInsID = '';
  editRowValues: any;
  lstZipCityState: Array<any>;
  state: string;

  isShowSearchIns = false;
  isMainIns = true;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private setupService: SetupService,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage,private modalService: NgbModal,
    private generalService: GeneralService) { }


  ngOnInit() {
    this.buildForm();
    this.enableDisable('disable');
    this.getClientPayerId();
  }
  buildForm() {
    this.newInsuranceForm = this.formBuilder.group({
      txtInsName: this.formBuilder.control(null),
      txtInsAddress: this.formBuilder.control(null),
      txtInsZip: this.formBuilder.control(null),
      ddlInsCity: this.formBuilder.control(null),
      //txtInsState: this.formBuilder.control(null),
      txtInsPhone: this.formBuilder.control(null),
      txtInsFax: this.formBuilder.control(null),
      txtInsPlanName: this.formBuilder.control(null),
      txtInsEmail: this.formBuilder.control(null),
      txtInsAttn: this.formBuilder.control(null),
      txtInsWebsite: this.formBuilder.control(null)
    });
  }
  getClientPayerId() {
    this.setupService.getClientPayerId(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        debugger;
        this.payerid = data[0].id;
        this.getInsurances()
      },
      error => {
      }
    );
  }
  selectInsurance(value) {
    this.isSelectedInsID = value.insurance_id;
    debugger;
    this.isEditInsID = value.insurance_id;
    this.editRowValues = value;
    (this.newInsuranceForm.get("txtInsName") as FormControl).setValue(value.name);
    (this.newInsuranceForm.get("txtInsAddress") as FormControl).setValue(value.address);
    (this.newInsuranceForm.get("txtInsZip") as FormControl).setValue(value.zip);
    //(this.newInsuranceForm.get("ddlInsCity") as FormControl).setValue(value.city);
    //(this.newInsuranceForm.get("txtInsState") as FormControl).setValue(value.state);
    //this.state = value.state;
    this.zipFocusOut(value.zip);

    (this.newInsuranceForm.get("txtInsPhone") as FormControl).setValue(value.phone);
    (this.newInsuranceForm.get("txtInsFax") as FormControl).setValue(value.fax);
    (this.newInsuranceForm.get("txtInsPlanName") as FormControl).setValue(value.plan_name);
    (this.newInsuranceForm.get("txtInsEmail") as FormControl).setValue(value.email);
    (this.newInsuranceForm.get("txtInsAttn") as FormControl).setValue(value.attn);
    (this.newInsuranceForm.get("txtInsWebsite") as FormControl).setValue(value.website);

  }
  getInsurances() {
    debugger;
    let insuranceSearchCriteria: SearchCriteria = new SearchCriteria();
    insuranceSearchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    insuranceSearchCriteria.param_list = [];
    insuranceSearchCriteria.param_list.push({ name: "payerid", value: this.payerid, option: "" });
    this.setupService.getInsurances(insuranceSearchCriteria).subscribe(
      data => {
        debugger;
        this.lstInsurance = data as Array<any>;
      },
      error => {
      }
    );
  }
  saveInsurance() {
    if (this.validate()) {
      let ormSaveIns: ORMinsurancesetup = new ORMinsurancesetup();

      ormSaveIns.name = (this.newInsuranceForm.get('txtInsName') as FormControl).value;
      ormSaveIns.address = (this.newInsuranceForm.get('txtInsAddress') as FormControl).value;
      ormSaveIns.city = (this.newInsuranceForm.get('ddlInsCity') as FormControl).value;
      ormSaveIns.zip = (this.newInsuranceForm.get('txtInsZip') as FormControl).value;
      //ormSaveIns.state = (this.newInsuranceForm.get('txtInsState') as FormControl).value;
      ormSaveIns.state = this.state;
      ormSaveIns.plan_name = (this.newInsuranceForm.get('txtInsPlanName') as FormControl).value;
      ormSaveIns.phone = (this.newInsuranceForm.get('txtInsPhone') as FormControl).value;
      ormSaveIns.fax = (this.newInsuranceForm.get('txtInsFax') as FormControl).value;
      ormSaveIns.email = (this.newInsuranceForm.get('txtInsEmail') as FormControl).value;
      ormSaveIns.website = (this.newInsuranceForm.get('txtInsWebsite') as FormControl).value;
      ormSaveIns.attn = (this.newInsuranceForm.get('txtInsAttn') as FormControl).value;
      ormSaveIns.payerid = this.payerid;
      ormSaveIns.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      ormSaveIns.modified_user = this.lookupList.logedInUser.user_name;
      ormSaveIns.system_ip = this.lookupList.logedInUser.systemIp;
      ormSaveIns.practice_id = "-1";//this.lookupList.practiceInfo.practiceId.toString();

      if (this.strOperation == "new") {
        ormSaveIns.created_user = this.lookupList.logedInUser.user_name;
        ormSaveIns.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      }
      else if (this.strOperation == "edit") {
        ormSaveIns.insurance_id = this.editRowValues.insurance_id;
        ormSaveIns.created_user = this.editRowValues.created_user;
        ormSaveIns.client_date_created = this.editRowValues.client_date_created;
        ormSaveIns.date_created = this.editRowValues.date_created;
      }
      this.setupService.saveInsurance(ormSaveIns).subscribe(
        data => {
          debugger;
          this.enableDisable('disable');
  this.isDisable = false;
  if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {

    //this.getInsuranceTypes();

    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
    modalRef.componentInstance.promptHeading = 'Insurance Save';
    modalRef.componentInstance.promptMessage = "Insurance save successfully.";
  }
  else if (data['status'] === ServiceResponseStatusEnum.ERROR) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Insurance Save';
    modalRef.componentInstance.promptMessage = data['response'];
  }
        },
        error => {
        }
      );
    }
  }
  validate(): boolean {
    if ((this.newInsuranceForm.get('txtInsName') as FormControl).value == "") {
      alert("Please enter Insurance Name.");
      return false;
    }

    if ((this.newInsuranceForm.get('txtInsAddress') as FormControl).value == "") {
      alert("Please enter Insurance Address.");
      return false;
    }
    if ((this.newInsuranceForm.get('txtInsZip') as FormControl).value == "") {
      alert("Please enter Insurance Zip.");
      return false;
    }
    if ((this.newInsuranceForm.get('ddlInsCity') as FormControl).value == "") {
      alert("Please enter Insurance City.");
      return false;
    }
    //if ((this.newInsuranceForm.get('txtInsState') as FormControl).value == "") {
    if(this.state == ""){
      alert("Please enter Insurance State.");
      return false;
    }
    if ((this.newInsuranceForm.get('txtInsPhone') as FormControl).value == "") {
      alert("Please enter Insurance Phone.");
      return false;
    }
    if ((this.newInsuranceForm.get('txtInsPlanName') as FormControl).value == "") {
      alert("Please enter Plan Name.");
      return false;
    }
    return true;
  }




  addInsurance() {
    this.enableDisable('enable');
    this.clearAllFields();
    this.isDisable = true;
    this.strOperation = "new";
  }
  cancelIns() {
    if (this.lstInsurance != undefined && this.lstInsurance != null) {
      this.selectedIndex = 0;
    }
    this.enableDisable('disable');
    this.isDisable = false;
    this.strOperation = "";
  }
  editInsurance() {
    this.enableDisable('enable');
    this.isDisable = true;
    this.strOperation = "edit";
  }
  enableDisable(value) {
    if (value == 'disable')
      this.newInsuranceForm.disable();
    else
      this.newInsuranceForm.enable();
  }
  clearAllFields() {
    this.newInsuranceForm.reset();
  }
  zipFocusOut(zipCode: string) {
    debugger;
    if (zipCode != undefined || zipCode!="" || zipCode!=null) {
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

          //(this.newInsuranceForm.get("txtInsState") as FormControl).setValue(this.lstZipCityState[0].state);
          this.state = this.lstZipCityState[0].state;

          if (this.lstZipCityState.length > 1) {
            (this.newInsuranceForm.get("ddlInsCity") as FormControl).setValue(null);
          }
          else if (this.lstZipCityState.length == 1) {
            (this.newInsuranceForm.get("ddlInsCity") as FormControl).setValue(this.lstZipCityState[0].city);
          }
        }
      },
      error => {
        this.getCityStateByZipCodeError(error);
      }
    );
  }
  getCityStateByZipCodeError(error) {
    this.logMessage.log("getCityStateByZipCode Error." + error);
  }
  searchInsurance() {
    this.isShowSearchIns = true;
    this.isMainIns = false;
  }
  backToMainIns() {
    this.isShowSearchIns = false;
    this.isMainIns = true;
  
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
}
