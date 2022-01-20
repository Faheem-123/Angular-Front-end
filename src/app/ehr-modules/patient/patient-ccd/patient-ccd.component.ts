import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbModal, NgbActiveModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { ORMCCDRequest } from 'src/app/models/encounter/ORMCCDRequest';
import { PatientService } from 'src/app/services/patient/patient.service';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
import { ORMCCDSetting } from 'src/app/models/encounter/ORMCCDSetting';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';


@Component({
  selector: 'patient-ccd',
  templateUrl: './patient-ccd.component.html',
  styleUrls: ['./patient-ccd.component.css']
})
export class PatientCcdComponent implements OnInit {
  patient_id;
  patient_name;
  patient_dob;
  radioGroupForm: FormGroup
  inputForm: FormGroup;
  lstPatientVisit;
  lstCCDSetting;
  dataOption = "clinical";
  listSaveCCDSetting: Array<ORMCCDSetting> = [];
  constructor(private formbuilder: FormBuilder,
    private modalService: NgbModal, public activeModal: NgbActiveModal, @Inject(LOOKUP_LIST) public lookupList: LookupList
    , private encounterService: EncounterService, private patientService: PatientService, private generalOperation: GeneralOperation) { }

  ngOnInit() {
    this.encounterService.getCCDSetting(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.lstCCDSetting = data;
      },
      error => {
        // this.isLoading = false;
      }
    );
    this.buildForm();
    (this.inputForm.get("drpprovider") as FormControl).setValue(this.lookupList.logedInUser.defaultProvider);
    (this.inputForm.get("drplocation") as FormControl).setValue(this.lookupList.logedInUser.defaultLocation);

    if (this.patient_id != "") {
      (this.inputForm.get("cntrlpatientSearch") as FormControl).setValue(this.patient_name);
      this.getPatientVisist();

      let patienttxt = this.inputForm.get('cntrlpatientSearch');
      patienttxt.disable();
    }
    this.radioGroupForm = this.formbuilder.group({
      model: this.formbuilder.control("clinical")
    })
  }
  getPatientVisist() {
    this.encounterService.getPatientVisit_CCD(this.patient_id).subscribe(
      data => {
        this.lstPatientVisit = data;
      },
      error => {
        // this.isLoading = false;
      }
    );
  }
  public showPatientSearch = false;
  onKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
  }

  buildForm() {
    this.inputForm = this.formbuilder.group({
      drpprovider: this.formbuilder.control("", Validators.required),
      drplocation: this.formbuilder.control("", Validators.required),
      cntrlpatientSearch: this.formbuilder.control("", Validators.required),
    })

  }
  openSelectPatient(patient) {
    debugger;
    this.patient_id = patient.patient_id;
    // this.inputForm = this.formbuilder.group({
    //   cntrlpatientSearch: this.formbuilder.control(patient.name, Validators.required),
    // })
    (this.inputForm.get("cntrlpatientSearch") as FormControl).setValue(patient.name);
    this.getPatientVisist();
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
  }
  onCCDExport(enc, option) {
    debugger;
    let objccdReq: ORMCCDRequest = new ORMCCDRequest;
    objccdReq.patient_id = this.patient_id.toString();
    objccdReq.chart_id = enc.chart_id.toString();
    objccdReq.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    objccdReq.provider_id = this.inputForm.get("drpprovider").value;
    objccdReq.isReferal = option;
    objccdReq.ccd_Version = "0";
    objccdReq.ccd_type = "0";

    this.patientService.GenerateCCDA(objccdReq).subscribe(
      data => {
        debugger;
        // = data["result"].split("~")[0];
        const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
        modalRef.componentInstance.path_doc = data["result"].split("~")[0];
        modalRef.componentInstance.width = '800px';
      },
      error => {
        // this.logMessage.log("newchart " + error);
      }
    );
  }
  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };
  popUpOptionslarge: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',

  };
  IsSettingSelect(value, seting) {
    debugger;
    this.lstCCDSetting[this.generalOperation.getElementIndex(this.lstCCDSetting, seting)].enabled = value;
  }

  IsSettingSelectAll(value) {
    for (var i = 0; i < this.lstCCDSetting.length; i++) {
      this.lstCCDSetting[i].enabled = value;
    }
  }
  saveCCDSetting() {
    let obj: ORMCCDSetting;
    for (let i = 0; i < this.lstCCDSetting.length; i++) {
      obj = this.lstCCDSetting[i];
      this.listSaveCCDSetting.push(obj);
    }

    this.encounterService.saveCCD_Setting(this.listSaveCCDSetting).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {

        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {

        }
      },
      error => {
        //this.showError("An error occured while saving Chart Assessments.");
      }
    );
  }
}

