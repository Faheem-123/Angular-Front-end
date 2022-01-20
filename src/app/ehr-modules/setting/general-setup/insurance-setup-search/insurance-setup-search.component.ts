import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { LogMessage } from 'src/app/shared/log-message';
import { SetupService } from 'src/app/services/setup.service';

@Component({
  selector: 'insurance-setup-search',
  templateUrl: './insurance-setup-search.component.html',
  styleUrls: ['./insurance-setup-search.component.css']
})
export class InsuranceSetupSearchComponent implements OnInit {
  @Output() backToMainIns = new EventEmitter<any>();

  isSelectedPayID = '';
  searchInsSetupForm: FormGroup;
  editWebsiteForm: FormGroup;
  lstPayerType: Array<any>;
  lstInsuranceSearch: Array<any>;
  showPayerSearch: boolean = false;
  payerId: number;
  payerName;
  payerNumber = "";
  criteria: Boolean = false;
  isLoadingSearch: boolean = false;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private setupService: SetupService,
    private logMessage: LogMessage,
    private generalOperation: GeneralOperation
  ) { }

  ngOnInit() {
    this.buildForm();
    this.getPayerType();
  }
  buildForm() {
    this.searchInsSetupForm = this.formBuilder.group({
      txtSrchInsurance: this.formBuilder.control(null),
      txtPayerSearch: this.formBuilder.control(null),
      ddlSrchPayerType: this.formBuilder.control(null)
    })
    this.editWebsiteForm = this.formBuilder.group({
      txtEditWebsite: this.formBuilder.control(null)
    })
  }

  getPayerType() {
    this.setupService.getPayerType(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.lstPayerType = data as Array<any>;
      },
      error => {
        this.getPayerTypeError(error);
      }
    );
  }
  getPayerTypeError(error) {
    this.logMessage.log("getPayerType Error." + error);
  }
  searchInsuranceSetup(){
    debugger;
    if ((this.searchInsSetupForm.get('txtSrchInsurance') as FormControl).value == "") {
      this.criteria = false;
    }else{this.criteria = true;}
    if ((this.searchInsSetupForm.get('ddlSrchPayerType') as FormControl).value == "") {
      this.criteria = false;
    }else{this.criteria = true;}
    if (this.payerNumber=="") {
      this.criteria = false;
    }else{this.criteria = true;}
    if (this.criteria == false) {
      alert("Please enter at least one criteria.");
      return false;
    } else {
      this.isLoadingSearch = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [];

      searchCriteria.param_list.push({ name: "name", value: (this.searchInsSetupForm.get('txtSrchInsurance') as FormControl).value, option: "" });
      searchCriteria.param_list.push({ name: "payertype", value: (this.searchInsSetupForm.get('ddlSrchPayerType') as FormControl).value, option: "" });
      //searchCriteria.param_list.push( { name: "payer", value: (this.searchInsSetupForm.get('ddlSrchPayerType') as FormControl).value, option: "" });
      searchCriteria.param_list.push({ name: "payer", value: this.payerNumber, option: "" });

      this.setupService.searchInsuranceSetup(searchCriteria).subscribe(
        data => {
          this.lstInsuranceSearch = data as Array<any>;
          this.isLoadingSearch = false;
        },
        error => {
          this.searchInsuranceSetupError(error);
        }
      );
      //
    }
  }
  searchInsuranceSetupError(error){
    this.isLoadingSearch = false;
    this.logMessage.log("searchInsuranceSetup Error." + error);
  }
  onBackToMainIns() {
    this.backToMainIns.emit();
  }
  onPayerSearchKeydown(event) {
    if (event.key === "Enter"){
      this.showPayerSearch = true;
      event.preventDefault();
    }
    else {
      this.showPayerSearch = false;
    }
  }
  onPayerSearchInputChange(newValue) {
    if (newValue !== this.payerName) {

      this.payerId = undefined;
      this.payerNumber = undefined;
    }
  }
  onPatientSearchBlur() {
    if (this.payerId == undefined && this.showPayerSearch == false) {
      this.payerName = undefined;
      this.searchInsSetupForm.get("txtPayerSearch").setValue(null);
    }
    this.payerId = undefined;
    this.payerName = undefined;
    this.payerNumber = undefined;
  }

  selectPayerRow(val) {
    this.isSelectedPayID = val.insurance_id;
  }

  openSelectPayer(patObject) {
    this.payerId = patObject.payerid;
    this.payerName = patObject.name;
    this.payerNumber = patObject.payer_number;

    (this.searchInsSetupForm.get('txtPayerSearch') as FormControl).setValue(this.payerName + " (" + this.payerNumber + ")");

    this.showPayerSearch = false;
  }
  closePayerSearch(){
    this.showPayerSearch = false;
    this.onPatientSearchBlur();
  }
  editSelectedRow(values){
    this.editWebsiteForm.get("txtEditWebsite").setValue("");
    if (values.website != "") {
      this.editWebsiteForm.get("txtEditWebsite").setValue(values.website);
    }
  }
  editWebsite(value){
    if ((this.editWebsiteForm.get('txtEditWebsite') as FormControl).value == "") {
      alert("Please Enter Insurance Website.");
      return;
    } else {

      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
        { name: "website", value: (this.editWebsiteForm.get('txtEditWebsite') as FormControl).value, option: "" },
        { name: "modified_user", value: this.lookupList.logedInUser.user_name.toString(), option: "" },
        { name: "insurance_id", value: this.isSelectedPayID, option: "" }
      ];


      this.setupService.editWebsite(searchCriteria)
        .subscribe(
          data => {
            this.searchInsuranceSetup();
          },
          error => {
            this.searchInsuranceSetupError(error);
          }
        );
    }
  }
  cancelWebsiteEdit() {

  }
}