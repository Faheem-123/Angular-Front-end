import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralService } from '../../../../services/general/general.service';
import { LookupList, LOOKUP_LIST } from '../../../../providers/lookupList.module';
import { LogMessage } from '../../../../shared/log-message';
import { CustomValidators } from '../../../../shared/custome-validators';
import { SearchService } from '../../../../services/search.service';
import { SearchCriteria } from '../../../../models/common/search-criteria';

@Component({
  selector: 'patient-care-team-member-add-edit-popup',
  templateUrl: './patient-care-team-member-add-edit-popup.component.html',
  styleUrls: ['./patient-care-team-member-add-edit-popup.component.css']
})
export class PatientCareTeamMemberAddEditPopupComponent implements OnInit {

  @Input() memberId:number;
  @Input() teamId:number;
  @Input() patientId:number;
  @Input() data:any;
  @Input() patientData:any;
  @Input() operationType:string;

  memberForm: FormGroup;
  isLoading: Boolean = true;
  prePopulateCount: number = 0;
  lstZipCityState;  
  lstMemberType = ["Provider in Practice", "Referring Provider", "Patient", "Other"];
  state: String = "";
  isZipChanged: Boolean = false;
  isZipLoading: Boolean = false;
  showRefPhySearch: Boolean = false;
  showSpecialitySearch: Boolean = false;
  relationshipDescription = "Provider in Practice";
  memberType: String = "Provider in Practice";

  refPhyData;
  providerData;
  
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private generalService: GeneralService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private searchService: SearchService,
    private modalService: NgbModal) { }

  ngOnInit() {
    debugger;
    this.isLoading = true;

    this.buildForm();
    if (this.lookupList.lstSnomedRelationship == undefined || this.lookupList.lstSnomedRelationship.length == 0) {

      this.prePopulateCount++;
      this.getSnomedRelationshipList();
    }
    else{
      this.loadData();
    }

  }

  loadData(){
    if (this.operationType == "EDIT") {
      //this.populateData();
      this.memberType = this.data.member_type;
      this.populateData(this.memberType);
    }

    this.isLoading = false;
  }

  getSnomedRelationshipList() {
    this.generalService.getSnomedRelationshipList().subscribe(
        data => {

            this.lookupList.lstSnomedRelationship =  data as Array<any>;
            this.prePopulateCount--;
            if (this.prePopulateCount == 0) {
                if (this.patientId != undefined) {
                    this.loadData();
                }
                else {
                    this.isLoading = false;
                }
            }
        },
        error => {
            this.prePopulateCount--;
            if (this.prePopulateCount == 0) {
                this.isLoading = false;
            }
            this.getSnomedRelationshipListError(error);
        }
    );
}

getSnomedRelationshipListError(error) {
    this.logMessage.log("getSnomedRelationshipList Error." + error);
}

  buildForm() {
    this.memberForm = this.formBuilder.group({
      ddMemberType: this.formBuilder.control(this.memberType, Validators.required),
      ddProvider: this.formBuilder.control(null),
      ddRelationship: this.formBuilder.control(null),
      txtRefPhy: this.formBuilder.control(null),
      txtRefPhyIDHidden: this.formBuilder.control(null),
      txtSpecialtiy: this.formBuilder.control(null),
      txtSpecialtiyCode: this.formBuilder.control(null),
      txtNPI: this.formBuilder.control(null),
      chkPCP: this.formBuilder.control(null),
      txtTitle: this.formBuilder.control({ value: null, disabled: true }),
      txtFName: this.formBuilder.control({ value: null, disabled: true }),
      txtLName: this.formBuilder.control({ value: null, disabled: true }),
      txtAddressL1: this.formBuilder.control({ value: null, disabled: true }),
      txtAddressL2: this.formBuilder.control({ value: null, disabled: true }),
      txtZipCode: this.formBuilder.control({ value: null, disabled: true }),
      ddCity: this.formBuilder.control({ value: null, disabled: true }),
      txtState: this.formBuilder.control(null),
      txtPhone: this.formBuilder.control({ value: null, disabled: true }),
    },
      {
        validator: Validators.compose([
          CustomValidators.requiredWhenOneOptionWithValue('ddProvider', 'ddMemberType', 'Provider in Practice'),
          CustomValidators.requiredWhenOneOptionWithValue('txtRefPhyIDHidden', 'ddMemberType', 'Referring Provider'),
          CustomValidators.requiredWhenOneOptionWithValue('ddRelationship', 'ddMemberType', 'Other'),
          CustomValidators.requiredWhenOneOptionWithValue('txtFName', 'ddMemberType', 'Other'),
          CustomValidators.requiredWhenOneOptionWithValue('txtLName', 'ddMemberType', 'Other')
        ])
      }
    )
  }

  clearFields() {
    debugger;
    this.lstZipCityState = new Array();
    this.state = undefined;
    (this.memberForm.get("txtTitle") as FormControl).reset(null);
    (this.memberForm.get("txtLName") as FormControl).reset(null);
    (this.memberForm.get("txtFName") as FormControl).reset(null);
    (this.memberForm.get("txtAddressL1") as FormControl).reset(null);
    (this.memberForm.get("txtAddressL2") as FormControl).reset(null);
    (this.memberForm.get("txtZipCode") as FormControl).reset(null);
    (this.memberForm.get("txtPhone") as FormControl).reset(null);
    (this.memberForm.get("txtState") as FormControl).reset(null);
    (this.memberForm.get("ddCity") as FormControl).reset(null);
    //(this.memberForm.get("ddProvider") as FormControl).setValue(null);
    (this.memberForm.get("txtSpecialtiy") as FormControl).reset(null);
    (this.memberForm.get("txtSpecialtiyCode") as FormControl).reset(null);
    (this.memberForm.get("txtNPI") as FormControl).reset(null);
    (this.memberForm.get("chkPCP") as FormControl).reset(null);
    //(this.memberForm.get("txtRefPhy") as FormControl).setValue(null);
    //(this.memberForm.get("txtRefPhyIDHidden") as FormControl).setValue(null);
    //(this.memberForm.get("ddRelationship") as FormControl).setValue(null);
  }

  enableDisalbeFields(option: Boolean) {
    debugger;

    if (option) {
      (this.memberForm.get("txtTitle") as FormControl).enable();
      (this.memberForm.get("txtLName") as FormControl).enable();
      (this.memberForm.get("txtFName") as FormControl).enable();
      (this.memberForm.get("txtAddressL1") as FormControl).enable();
      (this.memberForm.get("txtAddressL2") as FormControl).enable();
      (this.memberForm.get("txtZipCode") as FormControl).enable();
      (this.memberForm.get("txtPhone") as FormControl).enable();
      (this.memberForm.get("ddCity") as FormControl).enable();
      (this.memberForm.get("txtState") as FormControl).enable();

    }
    else if (!option) {
      (this.memberForm.get("txtTitle") as FormControl).disable();
      (this.memberForm.get("txtLName") as FormControl).disable();
      (this.memberForm.get("txtFName") as FormControl).disable();
      (this.memberForm.get("txtAddressL1") as FormControl).disable();
      (this.memberForm.get("txtAddressL2") as FormControl).disable();
      (this.memberForm.get("txtZipCode") as FormControl).disable();
      (this.memberForm.get("txtPhone") as FormControl).disable();
      (this.memberForm.get("ddCity") as FormControl).disable();
      (this.memberForm.get("txtState") as FormControl).disable();
    }
  }

  populateData(memType) {

    debugger;
    this.memberType = memType;

    if (this.isLoading) {     
      this.lstZipCityState = new Array();
      this.state = this.data.state;
      if (this.data != undefined) {
        this.lstZipCityState.push({ id: 1, zip_code: this.data.zip, city: this.data.city, state: this.data.state });
      }

      this.relationshipDescription = this.data.relationship_description;

      (this.memberForm.get("ddMemberType") as FormControl).setValue(this.memberType);
      (this.memberForm.get("txtSpecialtiy") as FormControl).setValue(this.data.taxonomy_description);
      (this.memberForm.get("txtSpecialtiyCode") as FormControl).setValue(this.data.taxonomy);
      (this.memberForm.get("txtNPI") as FormControl).setValue(this.data.npi);
      (this.memberForm.get("chkPCP") as FormControl).setValue(this.data.pcp);
      //(this.memberForm.get("ddRelationship") as FormControl).setValue(this.data.snomed_relationship_code);

      (this.memberForm.get("txtTitle") as FormControl).setValue(this.data.title);
      (this.memberForm.get("txtLName") as FormControl).setValue(this.data.last_name);
      (this.memberForm.get("txtFName") as FormControl).setValue(this.data.first_name);
      (this.memberForm.get("txtAddressL1") as FormControl).setValue(this.data.address);
      (this.memberForm.get("txtAddressL2") as FormControl).setValue(this.data.address2);
      (this.memberForm.get("txtZipCode") as FormControl).setValue(this.data.zip);
      (this.memberForm.get("txtState") as FormControl).setValue(this.data.state);
      (this.memberForm.get("ddCity") as FormControl).setValue(this.data.city);
      (this.memberForm.get("txtPhone") as FormControl).setValue(this.data.phone);

    }
    else {
      (this.memberForm.get("ddProvider") as FormControl).reset(null);
      (this.memberForm.get("txtSpecialtiy") as FormControl).reset(null);
      (this.memberForm.get("txtSpecialtiyCode") as FormControl).reset(null);
      (this.memberForm.get("txtNPI") as FormControl).reset(null);
      (this.memberForm.get("chkPCP") as FormControl).reset(null);
      (this.memberForm.get("ddRelationship") as FormControl).reset(null);

      this.refPhyData = undefined;
      this.providerData = undefined;

      this.clearFields();
    }
    debugger;

    switch (memType) {
      case "Provider in Practice":
        this.enableDisalbeFields(false);
        this.relationshipDescription = "Provider in Practice";

        if (this.isLoading) {
          (this.memberForm.get("ddProvider") as FormControl).setValue(this.data.member_reference_id);

          this.providerData = {
            id: this.data.member_reference_id,
            title: this.data.title,
            last_name: this.data.last_name,
            first_name: this.data.first_name,
            npi: this.data.npi,
            taxonomy_code: this.data.taxonomy_code,
            address: this.data.address,
            address2: this.data.address2,
            city: this.data.city,
            state: this.data.state,
            zip: this.data.zip,
            phone: this.data.phone
          };
        }

        break;
      case "Referring Provider":
        this.enableDisalbeFields(false);
        this.relationshipDescription = "Referring Provider";

        if (this.isLoading) {
          (this.memberForm.get("txtRefPhy") as FormControl).setValue(this.data.first_name + ' ' + this.data.last_name);
          (this.memberForm.get("txtRefPhyIDHidden") as FormControl).setValue(this.data.member_reference_id);

          this.refPhyData = {
            id: this.data.member_reference_id,
            title: this.data.title,
            last_name: this.data.last_name,
            first_name: this.data.first_name,
            npi: this.data.npi,
            taxonomy_code: this.data.taxonomy_code,
            address: this.data.address,
            city: this.data.city,
            state: this.data.state,
            zip: this.data.zip,
            phone: this.data.phone
          };
        }
        break;

      case "Other":
        this.enableDisalbeFields(true);
        if (this.isLoading) {
          (this.memberForm.get("ddRelationship") as FormControl).setValue(this.data.snomed_relationship_code);
        }
        this.enableDisalbeFields(true);
        break;
      case "Patient":
        {
          this.enableDisalbeFields(false);
          this.relationshipDescription = "Patient";
          if (!this.isLoading) {
            (this.memberForm.get("txtTitle") as FormControl).reset(this.patientData.title);
            (this.memberForm.get("txtLName") as FormControl).reset(this.patientData.last_name);
            (this.memberForm.get("txtFName") as FormControl).reset(this.patientData.first_name);
            (this.memberForm.get("txtAddressL1") as FormControl).reset(this.patientData.address);
            (this.memberForm.get("txtAddressL2") as FormControl).reset(this.patientData.address2);
            (this.memberForm.get("txtZipCode") as FormControl).reset(this.patientData.zip);
            (this.memberForm.get("txtPhone") as FormControl).reset(this.patientData.phone);
            this.lstZipCityState = new Array();
            this.state = this.patientData.state;
            if (this.data != undefined) {
              this.lstZipCityState.push({ id: 1, zip_code: this.patientData.zip, city: this.patientData.city, state: this.patientData.state });
            }
            (this.memberForm.get("txtState") as FormControl).reset(this.patientData.state);
            (this.memberForm.get("ddCity") as FormControl).reset(this.patientData.city);
          }
        }
        break;

      default:
        break;
    }
  }

  providerChanged(id) {

    if (id == undefined) {
      this.clearFields();
    }
    else {

      this.generalService.getProviderInfoById(id).subscribe(
        data => {
          //let lstProvider = data;
          debugger;
          if (data != undefined) {

            this.providerData = data[0];
            (this.memberForm.get("txtSpecialtiy") as FormControl).setValue(this.providerData.taxonomy_code);
            (this.memberForm.get("txtSpecialtiyCode") as FormControl).setValue(this.providerData.taxonomy_code);
            (this.memberForm.get("txtNPI") as FormControl).setValue(this.providerData.npi);
            this.assignNameContactInfo(this.providerData);

            if (this.providerData.taxonomy_code != undefined && this.providerData.taxonomy_code != "") {
              this.showSpecialitySearch = true;
            }
          }
        },
        error => {
          this.onProviderSearchError(error);
        }
      );

    }
  }
  onProviderSearchError(error) {
    this.logMessage.log("onProviderSearchError: " + error);
  }

  assignNameContactInfo(dataToAssign) {

    debugger;

    (this.memberForm.get("txtTitle") as FormControl).reset(dataToAssign.title);
    (this.memberForm.get("txtLName") as FormControl).reset(dataToAssign.last_name);
    (this.memberForm.get("txtFName") as FormControl).reset(dataToAssign.first_name);
    (this.memberForm.get("txtAddressL1") as FormControl).reset(dataToAssign.address);
    (this.memberForm.get("txtAddressL2") as FormControl).reset(dataToAssign.address2);
    (this.memberForm.get("txtZipCode") as FormControl).reset(dataToAssign.zip);
    (this.memberForm.get("txtPhone") as FormControl).reset(dataToAssign.phone);
    this.lstZipCityState = new Array();
    this.state = dataToAssign.state;
    if (dataToAssign != undefined) {
      this.lstZipCityState.push({ id: 1, zip_code: dataToAssign.zip, city: dataToAssign.city, state: dataToAssign.state });
    }
    (this.memberForm.get("txtState") as FormControl).reset(dataToAssign.state);
    (this.memberForm.get("ddCity") as FormControl).reset(dataToAssign.city);
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
        this.lstZipCityState = data;
        if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
          this.state = this.lstZipCityState[0].state;

          (this.memberForm.get("txtState") as FormControl).setValue(this.state);

          if (this.isZipLoading) {
            (this.memberForm.get("ddCity") as FormControl).setValue(this.data.city);
          }
          else if (this.lstZipCityState.length > 1) {
            (this.memberForm.get("ddCity") as FormControl).setValue(null);
          }
          else if (this.lstZipCityState.length == 1) {
            (this.memberForm.get("ddCity") as FormControl).setValue(this.lstZipCityState[0].city);
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



  onRefPhysicianFocusOut() {

    debugger;

    if ((this.memberForm.get("txtRefPhyIDHidden") as FormControl).value == "" || (this.memberForm.get("txtRefPhyIDHidden") as FormControl).value == undefined) {
      (this.memberForm.get("txtRefPhy") as FormControl).setValue(null);
      (this.memberForm.get("txtRefPhyIDHidden") as FormControl).setValue(null);
      this.clearFields();
    }

  }

  onRefPhysicianSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showRefPhySearch = true;
    }
    else {
      this.showRefPhySearch = false;
    }
  }

  closeRefPhysicianSearch() {
    debugger;
    if ((this.memberForm.get("txtRefPhyIDHidden") as FormControl).value == "" || (this.memberForm.get("txtRefPhyIDHidden") as FormControl).value == undefined) {
      (this.memberForm.get("txtRefPhy") as FormControl).setValue(null);
      (this.memberForm.get("txtRefPhyIDHidden") as FormControl).setValue(null);
      this.clearFields();
    }

    this.showRefPhySearch = false;
  }

  addRefPhysician(refPhy) {

    debugger;
    this.refPhyData = refPhy;

    (this.memberForm.get("txtRefPhy") as FormControl).setValue(this.refPhyData.first_name + ' ' + this.refPhyData.last_name);
    (this.memberForm.get("txtRefPhyIDHidden") as FormControl).setValue(this.refPhyData.id);
    (this.memberForm.get("txtSpecialtiy") as FormControl).setValue(this.refPhyData.taxonomy_code);
    (this.memberForm.get("txtSpecialtiyCode") as FormControl).setValue(this.refPhyData.taxonomy_code);
    (this.memberForm.get("txtNPI") as FormControl).setValue(this.refPhyData.npi);

    this.assignNameContactInfo(this.refPhyData);
    this.showRefPhySearch = false;
  }



  onSpecialtiySearchKeydown(event) {
    if (event.key === "Enter") {
      this.showSpecialitySearch = true;
    }
    else {
      this.showSpecialitySearch = false;
    }
  }

  closeSpecialtiySearch() {
    (this.memberForm.get("txtSpecialtiyCode") as FormControl).setValue(null);
    (this.memberForm.get("txtSpecialtiy") as FormControl).setValue(null);
    this.showSpecialitySearch = false;
  }

  onSpecialtiySearchFocusOut() {

    if ((this.memberForm.get("txtSpecialtiyCode") as FormControl).value == "" || (this.memberForm.get("txtSpecialtiyCode") as FormControl).value == undefined) {
      (this.memberForm.get("txtSpecialtiyCode") as FormControl).setValue(null);
      (this.memberForm.get("txtSpecialtiy") as FormControl).setValue(null);
    }
    //this.showSpecialitySearch = false;
  }


  addSpecialtiy(speciality) {
    debugger;
    (this.memberForm.get("txtSpecialtiyCode") as FormControl).setValue(speciality.taxonomy_code);

    let specialityText = speciality.taxonomy_group + " - " + speciality.taxonomy_description;

    (this.memberForm.get("txtSpecialtiy") as FormControl).setValue(specialityText);
    this.showSpecialitySearch = false;
  }

  relationsSelectionchange(args) {
    debugger;
    //this.countryValue = args.target.value; 
    this.relationshipDescription = args.target.options[args.target.selectedIndex].text;
  }

  ddMemberTypeChanged(value) {

    (this.memberForm.get("ddProvider") as FormControl).reset(null);
    (this.memberForm.get("txtSpecialtiyCode") as FormControl).reset(null);
    (this.memberForm.get("txtRefPhyIDHidden") as FormControl).reset(null);

    this.populateData(value);
  }




  onSubmit(formData) {

    debugger;
    let memberReferenceId;
    let objCareTeamMemer;
    //lstMemberType = ["Provider in Practice", "Referring Provider", "Patient", "Other"];

    if ((this.memberForm.get("ddMemberType") as FormControl).value == "Provider in Practice") {
      memberReferenceId = (this.memberForm.get("ddProvider") as FormControl).value;

      objCareTeamMemer = {
        id: this.memberId,
        team_id: this.teamId,
        patient_id: this.patientId,
        member_reference_id: (this.memberForm.get("ddProvider") as FormControl).value,
        member_type: (this.memberForm.get("ddMemberType") as FormControl).value,
        pcp: (this.memberForm.get("chkPCP") as FormControl).value,
        taxonomy: (this.memberForm.get("txtSpecialtiyCode") as FormControl).value,
        taxonomy_description: (this.memberForm.get("txtSpecialtiy") as FormControl).value,
        npi: (this.memberForm.get("txtNPI") as FormControl).value,
        snomed_relationship_code: undefined,// (this.memberForm.get("ddRelationship") as FormControl).value,
        relationship_description: this.relationshipDescription,
        title: this.providerData.title,
        last_name: this.providerData.last_name,
        first_name: this.providerData.first_name,
        address: this.providerData.address,
        address2: this.providerData.address2,
        city: this.providerData.city,
        state: this.providerData.state,
        zip: this.providerData.zip,
        phone: this.providerData.phone,
        amendment_request_id: undefined,
        add_edit_flag: true
      };
    }
    else if ((this.memberForm.get("ddMemberType") as FormControl).value == "Referring Provider") {
      memberReferenceId = (this.memberForm.get("txtRefPhyIDHidden") as FormControl).value;

      objCareTeamMemer = {
        id: this.memberId,
        team_id: this.teamId,
        patient_id: this.patientId,
        member_reference_id: (this.memberForm.get("txtRefPhyIDHidden") as FormControl).value,
        member_type: (this.memberForm.get("ddMemberType") as FormControl).value,
        pcp: (this.memberForm.get("chkPCP") as FormControl).value,
        taxonomy: (this.memberForm.get("txtSpecialtiyCode") as FormControl).value,
        taxonomy_description: (this.memberForm.get("txtSpecialtiy") as FormControl).value,
        npi: (this.memberForm.get("txtNPI") as FormControl).value,
        snomed_relationship_code: undefined,// (this.memberForm.get("ddRelationship") as FormControl).value,
        relationship_description: this.relationshipDescription,
        title: this.refPhyData.title,
        last_name: this.refPhyData.last_name,
        first_name: this.refPhyData.first_name,
        address: this.refPhyData.address,
        address2: undefined,
        city: this.refPhyData.city,
        state: this.refPhyData.state,
        zip: this.refPhyData.zip,
        phone: this.refPhyData.phone,
        amendment_request_id: undefined,
        add_edit_flag: true
      };
    }
    else if ((this.memberForm.get("ddMemberType") as FormControl).value == "Patient") {
      memberReferenceId = this.patientId;

      objCareTeamMemer = {
        id: this.memberId,
        team_id: this.teamId,
        patient_id: this.patientId,
        member_reference_id: (this.memberForm.get("txtRefPhyIDHidden") as FormControl).value,
        member_type: (this.memberForm.get("ddMemberType") as FormControl).value,
        pcp: undefined,
        taxonomy: undefined,
        taxonomy_description: undefined,
        npi: undefined,
        snomed_relationship_code: undefined,// (this.memberForm.get("ddRelationship") as FormControl).value,
        relationship_description: this.relationshipDescription,
        title: this.patientData.title,
        last_name: this.patientData.last_name,
        first_name: this.patientData.first_name,
        address: this.patientData.address,
        address2: this.patientData.address2,
        city: this.patientData.city,
        state: this.patientData.state,
        zip: this.patientData.zip,
        phone: this.patientData.phone,
        amendment_request_id: undefined,
        add_edit_flag: true
      };

    }
    else if ((this.memberForm.get("ddMemberType") as FormControl).value == "Other") {
      memberReferenceId = (this.memberForm.get("ddRelationship") as FormControl).value;
      objCareTeamMemer = {
        id: this.memberId,
        team_id: this.teamId,
        patient_id: this.patientId,
        member_reference_id: memberReferenceId,
        member_type: (this.memberForm.get("ddMemberType") as FormControl).value,
        title: (this.memberForm.get("txtTitle") as FormControl).value,
        last_name: (this.memberForm.get("txtLName") as FormControl).value,
        first_name: (this.memberForm.get("txtFName") as FormControl).value,
        pcp: (this.memberForm.get("chkPCP") as FormControl).value,
        taxonomy: (this.memberForm.get("txtSpecialtiyCode") as FormControl).value,
        taxonomy_description: (this.memberForm.get("txtSpecialtiy") as FormControl).value,
        snomed_relationship_code: (this.memberForm.get("ddRelationship") as FormControl).value,
        relationship_description: this.relationshipDescription,
        npi: (this.memberForm.get("txtNPI") as FormControl).value,
        address: (this.memberForm.get("txtAddressL1") as FormControl).value,
        address2: (this.memberForm.get("txtAddressL2") as FormControl).value,
        city: (this.memberForm.get("ddCity") as FormControl).value,
        state: this.state,
        zip: (this.memberForm.get("txtZipCode") as FormControl).value,
        phone: (this.memberForm.get("txtPhone") as FormControl).value,
        amendment_request_id: undefined,
        add_edit_flag: true
      };
    }
    this.activeModal.close(objCareTeamMemer);
  }

  closePopup(value) {
    this.activeModal.close(value);
  }



}
