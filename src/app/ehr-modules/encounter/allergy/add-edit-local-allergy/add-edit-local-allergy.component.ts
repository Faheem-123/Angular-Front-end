import { Component, OnInit, Inject, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralService } from 'src/app/services/general/general.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ORMSaveLocalAllergy } from 'src/app/models/encounter/orm-save-local-allergy';

@Component({
  selector: 'add-edit-local-allergy',
  templateUrl: './add-edit-local-allergy.component.html',
  styleUrls: ['./add-edit-local-allergy.component.css']
})
export class AddEditLocalAllergyComponent implements OnInit {

  @Input() objencounterToOpen: EncounterToOpen;
  @Input() chartAllergyId: number;
  @Input() opertaionType: string = 'new';

  title: string = "Allergy";
  formGroup: FormGroup;
  isLoading: Boolean = false;
  errorMsg: string = '';

  allergyDetail: any;

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
      this.title = 'Add Allergy';
    }
    else if (this.opertaionType == 'edit') {
      this.title = 'Edit Allergy';
    }
    this.buildForm();

    if (this.opertaionType == 'edit' && this.chartAllergyId != undefined) {
      this.getLocalAllergy();
    }


  }


 
  buildForm() {

    this.formGroup = this.formBuilder.group({
      dpOnsetDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      txtAllergySubstance: this.formBuilder.control(null, Validators.required),
      ddSeverity: this.formBuilder.control('Mild', Validators.required),
      txtReaction: this.formBuilder.control(null),
      ddStatus: this.formBuilder.control('A', Validators.required)
    }
    )
  }

  getLocalAllergy() {
    this.isLoading = true;
    this.encounterService.getLocalAllergyById(this.chartAllergyId).subscribe(
      data => {

        this.allergyDetail = data;

        this.assignData();
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getLocalAllergyError(error);
      }
    );
  }
  getLocalAllergyError(error) {
    this.logMessage.log("getLocalAllergy Error." + error);
  }

  assignData() {
    debugger;
    this.formGroup.get('dpOnsetDate').setValue(this.dateTimeUtil.getDateModelFromDateString(this.allergyDetail.onset_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    this.formGroup.get('txtAllergySubstance').setValue(this.allergyDetail.description);
    this.formGroup.get('ddSeverity').setValue(this.allergyDetail.severity);
    this.formGroup.get('txtReaction').setValue(this.allergyDetail.notes);
    this.formGroup.get('ddStatus').setValue(this.allergyDetail.status);
  }

  validateData(formVal: any) {

    debugger;
    this.errorMsg = '';

    if (this.errorMsg == '' && (formVal.dpOnsetDate == undefined || formVal.dpOnsetDate == null || formVal.dpOnsetDate == '')) {
      this.errorMsg = 'Please enter Onset Date.';
    }
    if (this.errorMsg == '' && (!this.dateTimeUtil.isValidDateTime(formVal.dpOnsetDate, DateTimeFormat.DATE_MODEL))) {
      this.errorMsg = 'Allergy Date is invalid.';
    }
    if (this.errorMsg == '' && (formVal.txtAllergySubstance == undefined || formVal.txtAllergySubstance == null || formVal.txtAllergySubstance == '')) {
      this.errorMsg = 'Please enter Substance.';
    }
    if (this.errorMsg == '' && (formVal.ddSeverity == undefined || formVal.ddSeverity == null || formVal.ddSeverity == '')) {
      this.errorMsg = 'Please select Severity.';
    }
    if (this.errorMsg == '' && (formVal.ddStatus == undefined || formVal.ddStatus == null || formVal.ddStatus == '')) {
      this.errorMsg = 'Please select status.';
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
      let ormSave: ORMSaveLocalAllergy = new ORMSaveLocalAllergy();

      if (this.allergyDetail != undefined) {
        ormSave.chart_allergies_id = this.allergyDetail.chart_allergies_id;
        ormSave.created_user = this.allergyDetail.created_user;
        ormSave.date_created = this.allergyDetail.date_created;
        ormSave.client_date_created = this.allergyDetail.client_date_created;
      }
      else {
        ormSave.created_user = this.lookupList.logedInUser.user_name;
        ormSave.client_date_created = clientDateTime;
      }

      ormSave.patient_id = this.objencounterToOpen.patient_id;
     
      ormSave.alergy_date = this.dateTimeUtil.getStringDateFromDateModel(formVal.dpOnsetDate);
      ormSave.onset_date = this.dateTimeUtil.getStringDateFromDateModel(formVal.dpOnsetDate);
      ormSave.description = formVal.txtAllergySubstance;
      ormSave.severity = formVal.ddSeverity;
      ormSave.notes = formVal.txtReaction;
      ormSave.status = formVal.ddStatus;

      ormSave.modified_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = clientDateTime;
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId;
      ormSave.system_ip = this.lookupList.logedInUser.systemIp;

      this.encounterService.saveLocalAllergy(ormSave).subscribe(
        data => {
          this.saveLocalAllergySuccess(data);
        },
        error => {
          this.saveLocalAllergyError(error);
        }
      );
    }

  }

  saveLocalAllergySuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);
    }
  }
  saveLocalAllergyError(error: any) {
    this.logMessage.log("saveLocalAllergy Error.");
  }

}
