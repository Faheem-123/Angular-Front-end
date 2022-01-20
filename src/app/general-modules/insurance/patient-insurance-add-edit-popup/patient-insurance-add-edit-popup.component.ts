import { Component, OnInit, Input, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralService } from '../../../services/general/general.service';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { LogMessage } from '../../../shared/log-message';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { DecimalPipe } from '@angular/common';
import { InlineInsuranceSearchComponent } from 'src/app/general-modules/insurance/inline-insurance-search/inline-insurance-search.component';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { DateModel } from 'src/app/models/general/date-model';

@Component({
  selector: 'patient-insurance-add-edit-popup',
  templateUrl: './patient-insurance-add-edit-popup.component.html',
  styleUrls: ['./patient-insurance-add-edit-popup.component.css']
})
export class PatientInsuranceAddEditPopupComponent implements OnInit {

  @Input() patientId: number;
  @Input() Id: number;
  @Input() insType: string;
  @Input() data: any;
  @Input() operationType: string;

  @ViewChild('inlineInsPopUpInsSearch') inlineInsPopUpInsSearch: InlineInsuranceSearchComponent; 

  insForm: FormGroup;
  lstZipCityState: Array<any>;
  showInsuranceSearch: Boolean = false;
  showSubscriberSearch: Boolean = false;
  isLoading: Boolean = true;
  isZipChanged: Boolean = false;
  isZipLoading: Boolean = false;
  WCstate: String = "";

  insuranceId: number;
  insuranceName: string;
  subsciberId: number;
  insuranceAddress: string;
  insuranceZip: string;
  insuranceCity: string;
  insuranceState: string;
  insurancePhone: string;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private generalService: GeneralService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private decimalPipe: DecimalPipe) {
    this.operationType = "New";
  }


  ngOnInit() {
    this.isLoading = true;
    this.buildForm();
    this.populateData();
    this.isLoading = false;
  }

  buildForm() {
    this.insForm = this.formBuilder.group({
      txtInsuranceID: this.formBuilder.control(null, Validators.required),
      txtSubscriber: this.formBuilder.control(null),
      ddSubscriberRelationship: this.formBuilder.control("SELF", Validators.required),
      txtPolicyNo: this.formBuilder.control(null),
      txtGroupNo: this.formBuilder.control(null),
      dpStartDate: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpEndDate: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtCopy: this.formBuilder.control(null),
      txtPCP: this.formBuilder.control(null),
      txtWorkerCompName: this.formBuilder.control(null),
      txtWorkerCompAddress: this.formBuilder.control(null),
      txtWCZipCode: this.formBuilder.control(null),
      ddWorkerCompCity: this.formBuilder.control(null)
    }
    )
  }

  populateData() {

    debugger;
    if (this.operationType == "EDIT") {
      this.insuranceState = this.data.state;
      this.insuranceId = this.data.insurance_id;
      this.subsciberId = this.data.guarantor_id;
      this.insuranceAddress = this.data.address;//+ " (" + this.data.city + ", " + this.data.state + " " + this.data.zip + ")";
      this.insurancePhone = this.data.phone;
      this.insuranceName = this.data.name;
      this.WCstate = this.data.workercomp_state;


      (this.insForm.get("txtInsuranceID") as FormControl).setValue(this.data.insurance_id);
      (this.insForm.get("txtSubscriber") as FormControl).setValue(this.data.guarantor_name);
      (this.insForm.get("ddSubscriberRelationship") as FormControl).setValue(this.data.guarantor_relationship);

      (this.insForm.get("txtPolicyNo") as FormControl).setValue(this.data.policy_number);
      (this.insForm.get("txtGroupNo") as FormControl).setValue(this.data.group_number);

      let startDateMModel = this.dateTimeUtil.getDateModelFromDateString(this.data.issue_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      (this.insForm.get("dpStartDate") as FormControl).setValue(startDateMModel);

      let endDateMModel = this.dateTimeUtil.getDateModelFromDateString(this.data.end_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      (this.insForm.get("dpEndDate") as FormControl).setValue(endDateMModel);

      (this.insForm.get("txtWorkerCompName") as FormControl).setValue(this.data.workercomp_name);
      (this.insForm.get("txtWorkerCompAddress") as FormControl).setValue(this.data.workercomp_address);


      (this.insForm.get("txtWCZipCode") as FormControl).setValue(this.data.workercomp_zip);
      this.isZipLoading = true;
      this.getCityStateByZipCode(this.data.workercomp_zip);
    }

  }

  WCzipChanged() {
    this.isZipChanged = true;
  }

  WCzipFocusOut(zipCode) {

    if (this.isZipLoading || this.isZipChanged) {
      this.isZipChanged = false;
      this.WCstate = "";
      this.lstZipCityState = [];
      if (zipCode.replace("-", "").length == 5 || zipCode.replace("-", "").length == 9) {
        this.getCityStateByZipCode(zipCode);
      }
    }
  }
  getCityStateByZipCode(zipCode) {

    this.generalService.getCityStateByZipCode(zipCode).subscribe(
      data => {
        debugger;
        this.lstZipCityState = data as Array<any>;;
        if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
          this.WCstate = this.lstZipCityState[0].state;

          if (this.isZipLoading) {
            (this.insForm.get("ddWorkerCompCity") as FormControl).setValue(this.data.workercomp_city);
          }
          else if (this.lstZipCityState.length > 1) {
            (this.insForm.get("ddWorkerCompCity") as FormControl).setValue(null);
          }
          else if (this.lstZipCityState.length == 1) {
            (this.insForm.get("ddWorkerCompCity") as FormControl).setValue(this.lstZipCityState[0].city);
          }
          this.isZipLoading = false;
        }
        this.isZipLoading = false;
      },
      error => {
        this.isZipLoading = false;
        this.getCityStateByZipCodeError(error);
      }
    );
  }

  getCityStateByZipCodeError(error) {
    this.logMessage.log("getCityStateByZipCode Error." + error);
  }


  onInsuranceSearchInput() {
    this.showInsuranceSearch = false;
  }


  onInsuranceSearchEnter() {

    debugger;
    //if (event.key === "Enter") {
      this.showInsuranceSearch = true;
//    }
  //  else if (event.key == 'ArrowDown') {
    //  this.shiftFocusToInsSearch();
    //}
    //else {
//      this.showInsuranceSearch = false;
    //}
  }

  shiftFocusToInsSearch() {

    debugger;
    this.inlineInsPopUpInsSearch.focusFirstIndex();
  }


  addInsurance(obj) {


    let recordId = obj.record_id;
    let insObject = obj.insurance;

    this.insuranceId = insObject.insurance_id;
    this.insuranceName = insObject.insurance_name;
    (this.insForm.get("txtInsuranceID") as FormControl).setValue(insObject.insurance_id);
    this.insuranceAddress = insObject.address;
    this.insuranceCity = insObject.city;
    this.insuranceState = insObject.state;
    this.insuranceZip = insObject.zip;;


    this.insurancePhone = insObject.phone;
    this.showInsuranceSearch = false;
  }

  closeInsuranceSearch() {
    this.showInsuranceSearch = false;
  }


  onInsuranceSearchFocusOut(id) {

    //if ((this.insForm.get("txtInsuranceName") as FormControl).value == "" || (this.insForm.get("txtInsuranceName") as FormControl).value == undefined) {

    //this.insuranceId = undefined;
    //(this.insForm.get("txtInsuranceName") as FormControl).setValue(null);

    //this.insuranceAddress = undefined;
    //this.insurancePhone = undefined;
    //}
  }


  onSubscriberSearchKeydown(event, id) {

    if (event.key === "Enter") {
      this.showSubscriberSearch = true;
    }
    else {
      this.showSubscriberSearch = false;
    }
  }

  addSubscriber(obj) {

    //let recordId = obj.record_id;
    let subsriberObject = obj.gurantor;
    this.subsciberId = subsriberObject.id;
    (this.insForm.get("txtSubscriber") as FormControl).setValue(subsriberObject.name);
    this.closeSubscriberSearch();
  }

  closeSubscriberSearch() {
    this.showSubscriberSearch = false;
  }

  onSubscriberFocusOut(id) {
    if ((this.insForm.get("txtSubscriber") as FormControl).value == "" || (this.insForm.get("txtSubscriber") as FormControl).value == undefined) {
      this.subsciberId = undefined;
      (this.insForm.get("txtSubscriber") as FormControl).setValue(null);
    }
  }

  onSubmit(formData) {
    debugger;
    let start_date = this.dateTimeUtil.getStringDateFromDateModel(formData.dpStartDate);
    let end_date = this.dateTimeUtil.getStringDateFromDateModel(formData.dpEndDate);


    let objInsurance = {
      id: this.Id,
      insurace_type: this.insType,
      insurance_id: this.insuranceId,
      name: this.insuranceName,
      address: this.insuranceAddress,
      zip: this.insuranceZip,
      city: this.insuranceCity,
      state: this.insuranceState,
      phone: this.insurancePhone,
      guarantor_id: this.subsciberId,
      guarantor_name: formData.txtSubscriber,
      guarantor_relationship: formData.ddSubscriberRelationship,
      policy_number: formData.txtPolicyNo,
      group_number: formData.txtGroupNo,
      pcp: formData.txtPCP,
      copay: formData.txtCopy,
      start_date: start_date,
      end_date: end_date,

      workercomp_name: formData.txtWorkerCompName,
      workercomp_address: formData.txtWorkerCompAddress,
      workercomp_zip: formData.txtWCZipCode,
      workercomp_city: formData.ddWorkerCompCity,
      workercomp_state: this.WCstate,
      add_edit_flag: true
    };

    debugger;

    this.activeModal.close(objInsurance);

  }

  formateCurrencyInputs(controlName: string) {
    let value: any = (this.insForm.get(controlName) as FormControl).value;
    if (!isNaN(value)) {
      let formatedValue = this.decimalPipe.transform(value, ".2-2", "");
      (this.insForm.get(controlName) as FormControl).setValue(formatedValue);
    }
    else {
      (this.insForm.get(controlName) as FormControl).setValue(null);
    }
  }

  onDateFocusOut(date: string, controlName: string) {
    // console.log('focus out Called:');
    let formatedDate: DateModel = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined) {
      //debugger;
      this.insForm.get(controlName).setValue(formatedDate);     
    }

  }
}
