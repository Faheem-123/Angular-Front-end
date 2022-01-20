import { Component, OnInit, Input, Inject } from '@angular/core';
import { NgbModalOptions, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LogMessage } from '../../../../shared/log-message';
import { LookupList, LOOKUP_LIST } from '../../../../providers/lookupList.module';
import { GeneralService } from '../../../../services/general/general.service';

@Component({
  selector: 'next-of-kin-popup',
  templateUrl: './next-of-kin-popup.component.html',
  styleUrls: ['./next-of-kin-popup.component.css']
})
export class NextOfKinPopupComponent implements OnInit {

  @Input() patientId:number;
  @Input() nokId:number;
  @Input() data:any;
  @Input() operationType:string;

  nokForm: FormGroup;

  lstZipCityState:Array<any>;
  isLoading: Boolean = true;

  state: String = "";
  relDescription: String = "";
  isZipChanged: Boolean = false;
  isZipLoading: Boolean = false;

  //relModel;
  prePopulateCount: number = 0;
  /*
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  */
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private generalService: GeneralService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private modalService: NgbModal) {
    this.operationType = "New";
  }



  ngOnInit() {

    this.isLoading = true;
    debugger;
    if (this.lookupList.lstRelationship == undefined || this.lookupList.lstRelationship.length == 0) {
      this.prePopulateCount++;
      this.getRelationshipList();
    }

    this.buildForm();
    //this.isLoading = false;

    if (this.prePopulateCount == 0) {
      this.populateData();
      this.isLoading = false;
    }
  }

  buildForm() {

    this.nokForm = this.formBuilder.group({
      txtFName: this.formBuilder.control(null, Validators.required),
      txtMName: this.formBuilder.control(null),
      txtLName: this.formBuilder.control(null, Validators.required),
      ddRelationship: this.formBuilder.control(null, Validators.required),
      txtAddress: this.formBuilder.control(null),
      txtZipCode: this.formBuilder.control(null),
      ddCity: this.formBuilder.control(null),
      txtState: this.formBuilder.control(null),
      txtHomePhone: this.formBuilder.control(null),
      txtCellPhone: this.formBuilder.control(null)
    }
    )
  }

  zipChanged() {
    this.isZipChanged = true;
  }

  zipFocusOut(zipCode) {

    if (this.isZipLoading || this.isZipChanged) {
      this.isZipChanged = false;
      this.state = "";
      this.lstZipCityState = [];
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
          this.state = this.lstZipCityState[0].state;

          (this.nokForm.get("txtState") as FormControl).setValue(this.state);

          if (this.isZipLoading) {
            (this.nokForm.get("ddCity") as FormControl).setValue(this.data.city);
          }
          else if (this.lstZipCityState.length > 1) {
            (this.nokForm.get("ddCity") as FormControl).setValue(null);
          }
          else if (this.lstZipCityState.length == 1) {
            (this.nokForm.get("ddCity") as FormControl).setValue(this.lstZipCityState[0].city);
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

  getRelationshipList() {
    this.generalService.getRelationshipList().subscribe(
      data => {

        debugger;
        this.lookupList.lstRelationship =  data as Array<any>;
        this.prePopulateCount--;
        if (this.prePopulateCount == 0) {
          this.populateData();
          this.isLoading = false;
        }
      },
      error => {
        this.prePopulateCount--;
        if (this.prePopulateCount == 0) {
          this.isLoading = false;
        }
        this.getRelationshipListError(error);
      }
    );
  }

  getRelationshipListError(error) {
    this.logMessage.log("getRelationshipList Error." + error);
  }

  populateData() {

    debugger;
    if (this.operationType == "EDIT") {
      this.state = this.data.state;
      this.relDescription=this.data.relationship_description;
      (this.nokForm.get("txtFName") as FormControl).setValue(this.data.first_name);
      (this.nokForm.get("txtMName") as FormControl).setValue(this.data.mname);
      (this.nokForm.get("txtLName") as FormControl).setValue(this.data.last_name);
      (this.nokForm.get("ddRelationship") as FormControl).setValue(this.data.relationship_code);

      (this.nokForm.get("txtAddress") as FormControl).setValue(this.data.address);
      (this.nokForm.get("txtHomePhone") as FormControl).setValue(this.data.phone);
      (this.nokForm.get("txtCellPhone") as FormControl).setValue(this.data.cell_phone);

      this.isZipLoading = true;
      this.getCityStateByZipCode(this.data.zip);
      (this.nokForm.get("txtZipCode") as FormControl).setValue(this.data.zip);
      (this.nokForm.get("txtState") as FormControl).setValue(this.data.state);
    }

  }


  relationsSelectchange(args) {
    debugger;
    //this.countryValue = args.target.value; 
    this.relDescription = args.target.options[args.target.selectedIndex].text;
  }

  onSubmit(formData) {
    debugger;

    let objNOK = {
      next_of_kin_id: this.nokId,
      patient_id: this.patientId,
      first_name: (this.nokForm.get("txtFName") as FormControl).value,
      mname: (this.nokForm.get("txtMName") as FormControl).value,
      last_name: (this.nokForm.get("txtLName") as FormControl).value,
      relationship_code: (this.nokForm.get("ddRelationship") as FormControl).value,
      relationship_description: this.relDescription,
      zip: (this.nokForm.get("txtZipCode") as FormControl).value,
      city: (this.nokForm.get("ddCity") as FormControl).value,
      state: (this.nokForm.get("txtState") as FormControl).value,
      country: "USA",
      address: (this.nokForm.get("txtAddress") as FormControl).value,
      phone: (this.nokForm.get("txtHomePhone") as FormControl).value,
      cell_phone: (this.nokForm.get("txtCellPhone") as FormControl).value,
      created_user: (this.data != undefined ? this.data.created_user : undefined),
      client_date_created: (this.data != undefined ? this.data.client_date_created : undefined),
      date_created: (this.data != undefined ? this.data.date_created : undefined),
      add_edit_flag: true
    };

    this.activeModal.close(objNOK);
  }

  closePopup(value) {
    this.activeModal.close(value);
  }
}
