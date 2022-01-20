import { Component, OnInit, Output, EventEmitter, Input, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from 'src/app/services/patient/patient.service';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum, PromptResponseEnum, ServiceResponseStatusEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';


@Component({
  selector: 'merge-patient',
  templateUrl: './merge-patient.component.html',
  styleUrls: ['./merge-patient.component.css']
})
export class MergePatientComponent implements OnInit {

  @Output() onCallBack = new EventEmitter<any>();
  @Input() callingFrom: CallingFromEnum;

  @ViewChild('mergeTabSet') mergeTabSet;

  isLoading: boolean = false;
  total: number = 0;
  lstPatientSearch: Array<any>;
  lstSelectedPatients: Array<any>;
  lstInsurancesToMerge: Array<any>;
  lstSelectedInsurances: Array<any>;

  patSearchForm: FormGroup;
  patAdvanceSearchForm: FormGroup;


  selectedPatientId: number;
  selectedPatientInfo: any;

  isSelfPay: boolean = false;

  totalSteps: number = 3;
  currentStep: number = 1;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  lstSteps: Array<any> = [
    { step_no: 1, id: 'select-patient-tab', title: 'Select Patient', selected: true, done: false },
    { step_no: 2, id: 'select-record-to-keep-tab', title: 'Select Record to Keep', selected: false, done: false },
    { step_no: 3, id: 'merge-patient-tab', title: 'Confirm and Merge', selected: false, done: false }
  ]

  constructor(private formBuilder: FormBuilder,
    private patientService: PatientService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private ngbModal: NgbModal) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.patSearchForm = this.formBuilder.group({
      ctrlPatientSearch: this.formBuilder.control(null, Validators.required)
    })

    this.patAdvanceSearchForm = this.formBuilder.group({
      ctrlPatientSearchAdvance: this.formBuilder.control(null, Validators.required),
      ctrlPatientSearchAdvanceOption: this.formBuilder.control(null, Validators.required)
    })
  }

  onSearchPatient(criteriaForm: any) {
    this.total = 0;
    this.lstPatientSearch = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.option = "DEFAULT";
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [{ name: "criteria", value: criteriaForm.ctrlPatientSearch, option: "" }];
    this.searchPatient(searchCriteria);

  }

  onSearchPatientAdvance(criteriaForm: any) {
    this.total = 0;
    this.lstPatientSearch = undefined;
    //debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.option = "ADVANCE";
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [{ name: criteriaForm.ctrlPatientSearchAdvanceOption, value: criteriaForm.ctrlPatientSearchAdvance, option: undefined }];
    this.searchPatient(searchCriteria);

  }

  searchPatient(searchCriteria: SearchCriteria) {
    this.isLoading = true;
    this.patientService.searchPatient(searchCriteria).subscribe(
      data => {
        this.lstPatientSearch = data as Array<any>;;
        this.total = this.lstPatientSearch.length;
        this.isLoading = false;
      },
      error => {
        this.SearchPatientError(error);
        this.isLoading = false;
      }
    );
  }

  SearchPatientError(error: string) {
    this.logMessage.log("onSearchPatientAdvance Error." + error);
  }


  patientSelectionChanged(patient: any, selected: boolean) {

    if (selected) {
      if (this.lstSelectedPatients == undefined) {
        this.lstSelectedPatients = new Array<any>();
      }
      patient.keep = false;
      this.lstSelectedPatients.push(patient);
    }
    else {
      if (this.lstSelectedPatients != undefined) {
        for (let i: number = this.lstSelectedPatients.length - 1; i >= 0; i--) {

          if (this.lstSelectedPatients[i].patient_id == patient.patient_id) {
            this.lstSelectedPatients.splice(i, 1);
          }
        }
      }
    }
  }

  navigateNext() {

    debugger;

    let currentTab: string = "";
    this.lstSteps.forEach(step => {
      if (step.selected) {
        this.currentStep = step.step_no;
      }
      step.selected = false;
    });

    if (this.validateData(this.currentStep)) {

      switch (this.currentStep) {
        case 1:
          this.lstSteps[1].selected = true;
          this.lstSteps[0].done = true;
          currentTab = "select-record-to-keep-tab";
          this.currentStep++;
          this.getPatientInsuranceToMerge();
          break;
        case 2:

          this.lstSteps[2].selected = true;
          this.lstSteps[1].done = true;
          currentTab = "merge-patient-tab";
          this.currentStep++;

          this.getSelectedPatientInfo();

          break;

        default:
          break;
      }

      this.mergeTabSet.select(currentTab);
    }
  }

  navigatePrevious() {

    let currentTab: string = "";
    this.lstSteps.forEach(step => {
      if (step.selected) {
        this.currentStep = step.step_no;
      }
      step.selected = false;
    });

    switch (this.currentStep) {
      case 3:
        this.lstSteps[1].selected = true;
        this.lstSteps[1].done = false;
        this.lstSteps[2].done = false;
        currentTab = "select-record-to-keep-tab";
        this.currentStep--;
        break;
      case 2:
        this.lstSteps[0].selected = true;
        this.lstSteps[0].done = false;
        this.lstSteps[1].done = false;
        currentTab = "select-patient-tab";
        this.currentStep--;
        break;

      default:
        break;
    }
    this.mergeTabSet.select(currentTab);

  }

  validateData(step: number) {

    this.selectedPatientId = undefined;
    let isValid: boolean = true;

    let strMsg: string = "";

    if (step == 1) {

      if (this.lstSelectedPatients == undefined || this.lstSelectedPatients.length < 2) {
        strMsg = "Please select at least two patients."
      }

    }
    else if (step == 2) {

      for (let index = 0; index < this.lstSelectedPatients.length; index++) {
        if (this.lstSelectedPatients[index].keep == true) {
          this.selectedPatientId = this.lstSelectedPatients[index].patient_id;
          break;
        }
      }

      if (this.selectedPatientId == undefined) {
        strMsg = "Please select Patient."
      }

      else {

        let isPrimaryIns: boolean = false;
        let isSecondaryIns: boolean = false;
        let isOtherIns: boolean = false;

        this.lstSelectedInsurances = undefined;

        if (this.isSelfPay == false) {

          if (this.lstInsurancesToMerge != undefined) {

            for (let index = 0; index < this.lstInsurancesToMerge.length; index++) {

              if (this.lstInsurancesToMerge[index].insurace_type.toString().toLowerCase() == 'primary') {
                if (this.lstInsurancesToMerge[index].keep == true) {
                  if (this.lstSelectedInsurances == undefined) {
                    this.lstSelectedInsurances = new Array<any>();
                  }
                  this.lstSelectedInsurances.push(this.lstInsurancesToMerge[index]);
                  isPrimaryIns = true;
                  break;
                }
              }
            }
            for (let index = 0; index < this.lstInsurancesToMerge.length; index++) {

              if (this.lstInsurancesToMerge[index].insurace_type.toString().toLowerCase() == 'secondary') {
                if (this.lstInsurancesToMerge[index].keep == true) {
                  if (this.lstSelectedInsurances == undefined) {
                    this.lstSelectedInsurances = new Array<any>();
                  }
                  this.lstSelectedInsurances.push(this.lstInsurancesToMerge[index]);
                  isSecondaryIns = true;
                  break;
                }
              }
            }
            for (let index = 0; index < this.lstInsurancesToMerge.length; index++) {

              if (this.lstInsurancesToMerge[index].insurace_type.toString().toLowerCase() == 'other') {
                if (this.lstInsurancesToMerge[index].keep == true) {
                  if (this.lstSelectedInsurances == undefined) {
                    this.lstSelectedInsurances = new Array<any>();
                  }
                  this.lstSelectedInsurances.push(this.lstInsurancesToMerge[index]);
                  isOtherIns = true;
                  break;
                }
              }
            }


            if (isOtherIns == true && isPrimaryIns == false && isSecondaryIns == false) {
              strMsg = "Please select Primary and Secondary Insurance."
            }
            else if ((isOtherIns == true && isPrimaryIns == false) || (isSecondaryIns == true && isPrimaryIns == false)) {
              strMsg = "Please select Primary Insurance."
            }
            else if (isOtherIns == true && isSecondaryIns == false) {
              strMsg = "Please select Secondary Insurance."
            }
            else if (this.lstInsurancesToMerge.length > 0 && (this.lstSelectedInsurances == undefined || this.lstSelectedInsurances.length == 0)) {
              strMsg = "Please select Insurance."
            }

          }

        }
      }

    }
    else if (step == 3) {

    }

    if (strMsg != "") {

      isValid = false;

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Merge Patient', strMsg, AlertTypeEnum.DANGER)

    }


    return isValid;
  }

  selecPatientToKeep(patId: number) {


    for (let index = 0; index < this.lstSelectedPatients.length; index++) {

      debugger;

      if (this.lstSelectedPatients[index].patient_id == patId) {
        this.lstSelectedPatients[index].keep = true;
      }
      else {
        this.lstSelectedPatients[index].keep = false;
      }

    }
  }

  selectInsuranceToKeep(ins: any) {

    for (let index = 0; index < this.lstInsurancesToMerge.length; index++) {

      if (this.lstInsurancesToMerge[index].insurace_type == ins.insurace_type) {
        if (this.lstInsurancesToMerge[index].patientinsurance_id == ins.patientinsurance_id) {
          this.lstInsurancesToMerge[index].keep = true;
        }
        else {
          this.lstInsurancesToMerge[index].keep = false;
        }
      }

    }
  }


  getPatientInsuranceToMerge() {

    debugger;
    this.isLoading = true;
    this.lstInsurancesToMerge = undefined;
    let patIds: string = "";

    if (this.lstSelectedPatients != undefined && this.lstSelectedPatients.length > 0) {
      this.lstSelectedPatients.forEach(pat => {

        if (patIds != "") {
          patIds += ",";
        }
        patIds += pat.patient_id;

      });
    }

    if (patIds != "") {
      this.patientService.getPatientInsuranceToMerge(patIds).subscribe(
        data => {
          this.lstInsurancesToMerge = data as Array<any>;;
          this.isLoading = false;
        },
        error => {
          this.getPatientInsuranceToMergeError(error);
          this.isLoading = false;
        }
      );
    }
  }

  getPatientInsuranceToMergeError(error: string) {
    this.logMessage.log("getPatientInsuranceToMerge Error." + error);
  }

  getSelectedPatientInfo() {
    this.isLoading = true;
    this.patientService.getPatient(this.selectedPatientId).subscribe(
      data => {

        this.selectedPatientInfo = data;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getSelectedPatientInfoError(error);
      }
    );
  }

  getSelectedPatientInfoError(error: any) {
    this.logMessage.log("getSelectedPatientInfo Error." + error);
  }

  selfpayChange(option: boolean) {

    this.isSelfPay = option;
    if (option) {
      if (this.lstInsurancesToMerge != undefined) {
        this.lstInsurancesToMerge.forEach(ins => {
          ins.keep = false;
        });
      }
    }
  }

  mergePatient() {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Confirmation Merge Patient"
    modalRef.componentInstance.promptMessage = "Are you sure you want to merge Patient(s)?<br>This action can't be reverted back.";
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;

    modalRef.result.then((result) => {

      if (result === PromptResponseEnum.YES) {


        let patIdsToDelete: string = "";
        let insIdsToKeep: string = "";

        this.lstSelectedPatients.forEach(pat => {

          if (pat.patient_id != this.selectedPatientId) {
            if (patIdsToDelete != "") {
              patIdsToDelete += ",";
            }
            patIdsToDelete += pat.patient_id;
          }
        });

        if (this.lstSelectedInsurances != undefined && !this.isSelfPay)
          this.lstSelectedInsurances.forEach(ins => {
            if (ins.keep) {
              if (insIdsToKeep != "") {
                insIdsToKeep += ",";
              }
              insIdsToKeep += ins.patientinsurance_id;
            }

          });

        let lstParm: Array<ORMKeyValue> = new Array<ORMKeyValue>();

        lstParm.push(new ORMKeyValue("pat_id_to_keep", this.selectedPatientId));
        lstParm.push(new ORMKeyValue("patient_ids_to_delete", patIdsToDelete));
        lstParm.push(new ORMKeyValue("insurance_ids_to_keep", insIdsToKeep));
        lstParm.push(new ORMKeyValue("modified_user", this.lookupList.logedInUser.user_name));
        lstParm.push(new ORMKeyValue("client_date_time", this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS)));


        this.patientService.mergePatients(lstParm).subscribe(
          data => {
            this.mergePatientsSuccess(data);
          },
          error => {
            this.mergePatientsError(error);
          }
        );
      }
    }
      , (reason) => {
      });
  }


  mergePatientsSuccess(data) {

    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Merge Patient', "Patients have been merged successfully.", AlertTypeEnum.INFO)
      this.onCallBack.emit(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Merge Patient', data.response, AlertTypeEnum.DANGER)
    }
  }

  mergePatientsError(error) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Merge Patient', error.message, AlertTypeEnum.DANGER)
  }
}