import { Component, OnInit, Inject } from '@angular/core';
import { ServiceResponseStatusEnum, AlertTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { NgbModalOptions, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ImmunizationService } from 'src/app/services/immunization.service';
import { LogMessage } from 'src/app/shared/log-message';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ImmRegQBPCriteria } from '../Imm-reg-qbp-criteria';

@Component({
  selector: 'generate-imm-reg-history-forecast-query-message',
  templateUrl: './generate-imm-reg-history-forecast-query-message.component.html',
  styleUrls: ['./generate-imm-reg-history-forecast-query-message.component.css']
})
export class GenerateImmRegHistoryForecastQueryMessageComponent implements OnInit {


  isLoading: boolean = false;
  showPatientSearch: boolean = false;
  isRegistryFileProcessing: boolean = false;
  registryProcessStatus: ServiceResponseStatusEnum;
  isSubmitAfterGenerate: boolean = false;

  regMessageId: string = "";
  regMessageString: string = "";
  regMessageErroList: Array<any>;

  selectedClinicId: string = "";
  registryCode: string = "";
  patientName: string = "";
  patientId: number;

  fileGenerationSuccessMsg: string = "File has been generated successfully.";


  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };


  canDownloadHL7File: boolean = false;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal,
    private immService: ImmunizationService,
    private logMessage: LogMessage) { }

  registryFormGroup: FormGroup;

  ngOnInit() {


    if (this.lookupList.logedInUser.user_name.toLocaleLowerCase() == "admin") {
      this.canDownloadHL7File = true;
    }

    if (this.lookupList.lstImmRegClinics == undefined || this.lookupList.lstImmRegClinics.length == 0) {
      this.isLoading = true;
      this.getImmRegistryClinics();
    }
    else if (this.lookupList.lstImmRegClinics.length == 1) {
      this.isLoading = false;
      this.selectedClinicId = this.lookupList.lstImmRegClinics[0].clinic_id;
      this.registryCode = this.lookupList.lstImmRegClinics[0].registry_code;
    }

    this.buildForm();
  }

  buildForm(){
    this.registryFormGroup = this.formBuilder.group({
      ddOffice: this.formBuilder.control(this.selectedClinicId, Validators.required),
      txtPatientIdHidden: this.formBuilder.control(null, Validators.required),
      txtPatientSearch:this.formBuilder.control(null, Validators.required)
    }
    );

  }


  getImmRegistryClinics() {
    this.immService.getRegistryClinics(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        debugger;
        this.lookupList.lstImmRegClinics = data as Array<any>;
        this.isLoading = false;

        if (this.lookupList.lstImmRegClinics.length == 1) {
          this.selectedClinicId = this.lookupList.lstImmRegClinics[0].clinic_id;
          this.registryCode = this.lookupList.lstImmRegClinics[0].registry_code;
          this.registryFormGroup.get("ddClinic").setValue(this.selectedClinicId);
        }

      
      },
      error => {

        this.isLoading = false;
        this.getImmRegistryClinicsError(error);
      }
    );
  }

  getImmRegistryClinicsError(error: any) {
    this.logMessage.log("getImmRegistryClinics Error." + error);
  }

  onPatientSearchKeydown(event: any) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    if (newValue !== this.patientName) {
      //this.patientIdSearch = undefined;
      this.patientName = "";
      this.registryFormGroup.get("txtPatientIdHidden").setValue(null);
    }


    //this.patientName=undefined;
  }
  onPatientSearchBlur() {
    //this.logMessage.log("onPatientSearchBlur");

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.registryFormGroup.get("txtPatientSearch").setValue(null);
      this.registryFormGroup.get("txtPatientIdHidden").setValue(null);
    }
    //this.patientId=undefined;
  }
  openSelectPatient(patObject) {

    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;

    (this.registryFormGroup.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    (this.registryFormGroup.get('txtPatientSearch') as FormControl).setValue(this.patientName);

    this.showPatientSearch = false;

  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }



  GenerateQBP_HL7(submitAfterGenerate: boolean) {

    this.registryFormGroup.disable();
    this.isSubmitAfterGenerate = submitAfterGenerate;
    this.isRegistryFileProcessing = true;
    debugger;
    let strMsg: string = "";

    //if (this.lstRegSelectedImmunization == undefined || this.lstRegSelectedImmunization.length == 0) {
    //      strMsg = "No Immunization is selecte.";
    //  }
    //else 
    if (this.registryFormGroup.get("ddOffice").value == undefined || this.registryFormGroup.get("ddOffice").value == "") {
      strMsg = "Please select Office.";
    }

    if (strMsg != "") {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = "Immunization Registry"
      modalRef.componentInstance.promptMessage = strMsg;
    }
    else {

      this.selectedClinicId  = this.registryFormGroup.get("ddOffice").value;
      this.lookupList.lstImmRegClinics.forEach(clinic => {
        if (clinic.clinic_id == this.selectedClinicId) {          
          this.registryCode = clinic.registry_code;
        }
      });


      debugger;

      let immRegQBPCriteria: ImmRegQBPCriteria = new ImmRegQBPCriteria(
        this.lookupList.practiceInfo.practiceId,
        this.patientId,
        this.selectedClinicId,
        this.registryCode,
        this.lookupList.logedInUser.user_name,
        this.lookupList.logedInUser.systemIp,
        this.isSubmitAfterGenerate
      )

      this.immService.generateQBPFile_HL7_File(immRegQBPCriteria).subscribe(
        data => {
          debugger;

          this.generateQBPFile_HL7_File_Success(data);
        },
        error => {
          debugger;
          this.generateQBPFile_HL7_File_Error(error);
        }
      );
      
    }
  }


  generateQBPFile_HL7_File_Success(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      if (this.isSubmitAfterGenerate) {
        this.fileGenerationSuccessMsg = "File has been generated successfully and queued for submission.";
      }
      else {
        this.fileGenerationSuccessMsg = "File has been generated successfully.";
      }


      this.regMessageErroList = undefined;
      this.registryProcessStatus = ServiceResponseStatusEnum.SUCCESS;
      this.regMessageId = data.result;
      this.regMessageString = data.response;
      this.isRegistryFileProcessing = false;

      //this.activeModal.close(true);

      //alert(this.regMessageString);
    }

    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.registryProcessStatus = ServiceResponseStatusEnum.ERROR;
      this.regMessageId = data.result;
      this.regMessageErroList = data.response_list as Array<any>;
      this.isRegistryFileProcessing = false;
      //GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry', data.response, AlertTypeEnum.DANGER)
    }
  }


  generateQBPFile_HL7_File_Error(error: any) {

    this.registryProcessStatus = ServiceResponseStatusEnum.ERROR;
    this.regMessageErroList = new Array<any>();
    this.regMessageErroList.push({ immunization: "QBP File Generation", segment: "ERROR", description: "An Error Occured while Generating Regisry File" });
    this.isRegistryFileProcessing = false;
    //GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry', "An Error Occured while Generating Regisry File", 
    //AlertTypeEnum.DANGER)
  }

  close(reason: string) {

    if (this.isRegistryFileProcessing) {

      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Immunization Registry';
      modalRef.componentInstance.promptMessage = 'Registry file generation is in progress.<br> Do you want to close ?';
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;


      modalRef.result.then((result) => {

        debugger;
        if (result == PromptResponseEnum.YES) {
          this.activeModal.dismiss(reason);
        }
      }, (reason) => {
        //alert(reason);
      });

    }
    else {

      if (this.registryProcessStatus == ServiceResponseStatusEnum.SUCCESS) {
        this.activeModal.close(true);
      }
      else {
        this.activeModal.dismiss(reason);
      }
    }
  }

  downlaodGeneratedFile() {
    GeneralOperation.dyanmicDownloadByHtmlTag({
      fileName: this.regMessageId + '.hl7',
      text: this.regMessageString
    });
  }

}
