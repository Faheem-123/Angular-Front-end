import { Component, OnInit, Inject, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralService } from 'src/app/services/general/general.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMSaveLocalPrescription } from 'src/app/models/encounter/orm-save-local-prescription';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';

@Component({
  selector: 'add-edit-local-prescription',
  templateUrl: './add-edit-local-prescription.component.html',
  styleUrls: ['./add-edit-local-prescription.component.css']
})
export class AddEditLocalPrescriptionComponent implements OnInit {

  @Input() objencounterToOpen: EncounterToOpen;
  @Input() chartPrescriptionId: number;
  @Input() opertaionType: string = 'new';

  title: string = "Prescription";
  formGroup: FormGroup;
  isLoading: Boolean = false;
  errorMsg: string = '';

  prescriptionDetail: any;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private generalService: GeneralService,
    private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {

    if (this.opertaionType == 'new') {
      this.title = 'Add Prescription';
    }
    else if (this.opertaionType == 'edit') {
      this.title = 'Edit Prescription';
    }
    this.buildForm();

    if (this.opertaionType == 'edit' && this.chartPrescriptionId != undefined) {
      this.getLocalPrescription();
      //this.assignData();
    }

  }


  buildForm() {

    this.formGroup = this.formBuilder.group({

      dpIssueDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      dpStartDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      dpEndDate: this.formBuilder.control(null),
      txtDrugName: this.formBuilder.control(null, Validators.required),
      txtSig: this.formBuilder.control(null),
      txtRefills: this.formBuilder.control(0),
      ddStatus: this.formBuilder.control('N', Validators.required),
      txtPharmacyNotes: this.formBuilder.control(null),
      ddPrescriber: this.formBuilder.control(this.objencounterToOpen.provider_id, Validators.required)
    }
    )
  }

  getLocalPrescription() {
    this.isLoading=true;
    this.encounterService.getLocalPrescriptionById(this.chartPrescriptionId).subscribe(
      data => {
        this.prescriptionDetail = data;
       
        this.assignData();
        this.isLoading=false;
      },
      error => {
        this.isLoading=false;
        this.getLocalPrescriptionError(error);
      }
    );
  }
  getLocalPrescriptionError(error) {
    this.logMessage.log("getLocalPrescription Error." + error);
  }

  assignData() {

    debugger;

    this.formGroup.get('dpIssueDate').setValue(this.dateTimeUtil.getDateModelFromDateString(this.prescriptionDetail.issued_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    this.formGroup.get('dpStartDate').setValue(this.dateTimeUtil.getDateModelFromDateString(this.prescriptionDetail.start_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    this.formGroup.get('dpEndDate').setValue(this.dateTimeUtil.getDateModelFromDateString(this.prescriptionDetail.end_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    this.formGroup.get('txtDrugName').setValue(this.prescriptionDetail.drug_name);
    this.formGroup.get('txtSig').setValue(this.prescriptionDetail.sig_text);
    this.formGroup.get('txtRefills').setValue(this.prescriptionDetail.num_of_refills_allowed);
    this.formGroup.get('ddStatus').setValue(this.prescriptionDetail.archive);
    this.formGroup.get('txtPharmacyNotes').setValue(this.prescriptionDetail.pharmacist_notes);
    this.formGroup.get('ddPrescriber').setValue(this.prescriptionDetail.provider_id);

  }

  validateData(formVal: any) {

    debugger;
    this.errorMsg = '';

    if (this.errorMsg == '' && (formVal.dpIssueDate == undefined || formVal.dpIssueDate == null || formVal.dpIssueDate == '')) {
      this.errorMsg = 'Please enter prescription Date.';
    }
    if (this.errorMsg == '' && (!this.dateTimeUtil.isValidDateTime(formVal.dpIssueDate, DateTimeFormat.DATE_MODEL))) {
      this.errorMsg = 'Prescription Date is invalid.';
    }
    if (this.errorMsg == '' && (formVal.txtDrugName == undefined || formVal.txtDrugName == null || formVal.txtDrugName == '')) {
      this.errorMsg = 'Please enter Medication.';
    }
    if (this.errorMsg == '' && (formVal.txtSig == undefined || formVal.txtSig == null || formVal.txtSig == '')) {
      this.errorMsg = 'Please enter Sig.';
    }
    if (this.errorMsg == '' && (formVal.dpStartDate == undefined || formVal.dpStartDate == null || formVal.dpStartDate == '')) {
      this.errorMsg = 'Please enter Start Date.';
    }
    if (this.errorMsg == '' && (!this.dateTimeUtil.isValidDateTime(formVal.dpStartDate, DateTimeFormat.DATE_MODEL))) {
      this.errorMsg = 'Start Date is invalid.';
    }


    if (this.errorMsg == '' && formVal.dpEndDate != undefined && formVal.dpEndDate != null && formVal.dpEndDate != '') {
      if (!this.dateTimeUtil.isValidDateTime(formVal.dpEndDate, DateTimeFormat.DATE_MODEL)) {
        this.errorMsg = 'End Date is invalid.';
      }
    }

    if (this.errorMsg == '' && (formVal.ddStatus == undefined || formVal.ddStatus == null || formVal.ddStatus == '')) {
      this.errorMsg = 'Please select status.';
    }
    if (this.errorMsg == '' && (formVal.ddPrescriber == undefined || formVal.ddPrescriber == null || formVal.ddPrescriber == '')) {
      this.errorMsg = 'Please select Presciber.';
    }

    if (this.errorMsg == '') {
      return true;
    }
    else {
      return false;
    }
  }

  onSubmit(formVal: any) {


    if (this.validateData(formVal)) {

      let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

      debugger;
      let ormMed: ORMSaveLocalPrescription = new ORMSaveLocalPrescription();

      if (this.prescriptionDetail != undefined) {
        ormMed.chart_prescription_id = this.prescriptionDetail.chart_prescription_id;
        ormMed.created_user = this.prescriptionDetail.created_user;
        ormMed.date_created = this.prescriptionDetail.date_created;
        ormMed.client_date_created = this.prescriptionDetail.client_date_created;
      }
      else {
        ormMed.created_user = this.lookupList.logedInUser.user_name;
        ormMed.client_date_created = clientDateTime;
      }

      ormMed.patient_id = this.objencounterToOpen.patient_id;
      ormMed.chart_id = this.objencounterToOpen.chart_id;
      ormMed.drug_name = formVal.txtDrugName;
      ormMed.drug_info = formVal.txtDrugName;

      ormMed.archive = formVal.ddStatus;

      ormMed.issued_date = this.dateTimeUtil.getStringDateFromDateModel(formVal.dpIssueDate);
      ormMed.start_date = this.dateTimeUtil.getStringDateFromDateModel(formVal.dpStartDate);

      if (formVal.dpEndDate != null && formVal.dpEndDate != undefined && formVal.dpEndDate != '') {
        ormMed.end_date = this.dateTimeUtil.getStringDateFromDateModel(formVal.dpEndDate);
      }

      ormMed.sig_text = formVal.txtSig;
      ormMed.provider_id = formVal.ddPrescriber;
      ormMed.is_eprescription = false;
      ormMed.num_of_refills_allowed=formVal.txtRefills;

      for (let index = 0; index < this.lookupList.providerList.length; index++) {
        if (this.lookupList.providerList[index].id == formVal.ddPrescriber) {
          ormMed.provider_name = this.lookupList.providerList[index].name;
          break;
        }
      }

      for (let index = 0; index < this.lookupList.locationList.length; index++) {
        if (this.lookupList.locationList[index].id == this.objencounterToOpen.location_id) {
          ormMed.location_name = this.lookupList.locationList[index].name;
          break;
        }
      }

      ormMed.pharmacist_notes = formVal.txtPharmacyNotes;
      ormMed.modified_user = this.lookupList.logedInUser.user_name;
      ormMed.client_date_modified = clientDateTime;
      ormMed.practice_id = this.lookupList.practiceInfo.practiceId;    
      ormMed.system_ip = this.lookupList.logedInUser.systemIp;

      this.encounterService.saveLocalPrescription(ormMed).subscribe(
        data => {
          this.saveLocalPrescriptionSuccess(data);
        },
        error => {
          this.saveLocalPrescriptionError(error);
        }
      );
    }

  }

  saveLocalPrescriptionSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);
    }
  }
  saveLocalPrescriptionError(error: any) {
    this.logMessage.log("saveLocalPrescription Error.");
  }
}
