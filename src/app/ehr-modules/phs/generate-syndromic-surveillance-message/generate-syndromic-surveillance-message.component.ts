import { Component, OnInit, Input, Inject } from '@angular/core';
import { ServiceResponseStatusEnum, ImmunizationEntryTypeEnum, AlertTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { NgbModalOptions, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { PHSService } from 'src/app/services/phs.service';

@Component({
  selector: 'generate-syndromic-surveillance-message',
  templateUrl: './generate-syndromic-surveillance-message.component.html',
  styleUrls: ['./generate-syndromic-surveillance-message.component.css']
})
export class GenerateSyndromicSurveillanceMessageComponent implements OnInit {

  @Input() patientId: number;
  @Input() chartId: number;

  isLoading: boolean = false;

  lstChartProblems: Array<any>;
  lstSelectedChartProblemsIds: Array<number>;

  isPHSFileProcessing: boolean = false;
  phsProcessStatus: ServiceResponseStatusEnum;

  messageLogId: string = "";
  phsMessageString: string = "";
  phsMessageErrorList: Array<any>;  
  fileGenerationSuccessMsg: string = "File has been generated successfully.";

  lstSurveillanceMessageType: Array<any> = [
    { code: "A04", description: "Register a patient" },
    { code: "A08", description: "Update patient information" },
    { code: "A03", description: "Discharge/end visit" }
  ];

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };


  //canDownloadHL7File: boolean = false;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal,
    private logMessage: LogMessage,
    private encounterService: EncounterService,
    private phsService: PHSService) { }

  registryFormGroup: FormGroup;

  ngOnInit() {



    //if (this.lookupList.logedInUser.user_name.toLocaleLowerCase() == "admin") {
    //this.canDownloadHL7File = true;
    //}

    this.registryFormGroup = this.formBuilder.group({
      ddSurveillanceMessageType: this.formBuilder.control(null, Validators.required),
    }
    );

    this.isLoading = true;
    this.getChartProblem();
  }

  getChartProblem() {

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "chart_id", value: this.chartId.toString(), option: "" },
      { name: "diag_option", value: "active", option: "" }
    ];

    this.encounterService.getChartProblem(searchCriteria)
      .subscribe(
        data => {

          this.lstChartProblems = data as Array<any>;
          this.isLoading = false;
        },
        error => {

          this.getChartProblemError(error);
          this.isLoading = false;
        }
      );
  }

  getChartProblemError(error: any) {
    this.logMessage.log("getChartProblem Error." + error);
  }


  selectionChanged(problemId: number, selected: boolean) {


    this.lstChartProblems.forEach(element => {

      if (element.problem_id == problemId) {
        element.selected = selected;
      }
    });

  }




  generateHL7() {


    debugger;
    this.isPHSFileProcessing = true;
    let strMsg: string = "";
    let strSelectedProblemIds: string = "";
    this.phsMessageErrorList=undefined;

    if (this.lstChartProblems == undefined || this.lstChartProblems.length == 0) {
      strMsg = "There is no diagnosis found.";
    }
    else if (this.registryFormGroup.get("ddSurveillanceMessageType").value == undefined || this.registryFormGroup.get("ddSurveillanceMessageType").value == "") {
      strMsg = "Please select Message Type.";
    }
    else {

      this.lstChartProblems.forEach(element => {
        if (element.selected == true) {

          if (strSelectedProblemIds != "") {
            strSelectedProblemIds += ",";
          }
          strSelectedProblemIds += element.problem_id;

        }
      });

      if (strSelectedProblemIds == "") {
        strMsg = "Please select at least one diagnose.";
      }
    }

    if (strMsg != "") {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = "PHS - Syndromic Surveillance Message"
      modalRef.componentInstance.promptMessage = strMsg;
    }
    else {


      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
        { name: "patient_id", value: this.patientId, option: "" },
        { name: "chart_id", value: this.chartId, option: "" },
        { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: "" },
        { name: "message_type_code", value: this.registryFormGroup.get("ddSurveillanceMessageType").value, option: "" },
        { name: "status", value: "F", option: "" },
        { name: "problem_ids", value: strSelectedProblemIds, option: "" }
      ];


      this.phsService.GenerateSyndromicSurveillanceMessage(searchCriteria).subscribe(
        data => {

          this.GenerateSyndromicSurveillanceMessage_HL7_FileSuccess(data);
        },
        error => {
          this.GenerateSyndromicSurveillanceMessage_HL7_FileError(error);
        }
      );

    }
  }


  GenerateSyndromicSurveillanceMessage_HL7_FileSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      this.fileGenerationSuccessMsg = "File has been generated successfully.";
      this.phsMessageErrorList = undefined;
      this.phsProcessStatus = ServiceResponseStatusEnum.SUCCESS;
      this.messageLogId = data.result;
      this.phsMessageString = data.response;
      this.isPHSFileProcessing = false;
    }

    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.phsProcessStatus = ServiceResponseStatusEnum.ERROR;
      this.messageLogId = data.result;
      this.phsMessageErrorList = data.response_list as Array<any>;
      this.isPHSFileProcessing = false;
    }
  }


  GenerateSyndromicSurveillanceMessage_HL7_FileError(error: any) {

    this.phsProcessStatus = ServiceResponseStatusEnum.ERROR;
    this.phsMessageErrorList = new Array<any>();
    this.phsMessageErrorList.push({ immunization: "PHS - Syndromic Surveillance Message", segment: "ERROR", description: "An Error Occured while Generating File" });
    this.isPHSFileProcessing = false;
    //GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry', "An Error Occured while Generating Regisry File", 
    //AlertTypeEnum.DANGER)
  }

  close(reason: string) {

    if (this.isPHSFileProcessing) {

      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'PHS - Syndromic Surveillance Message';
      modalRef.componentInstance.promptMessage = 'File generation is in progress.<br> Do you want to close ?';
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

      if (this.phsProcessStatus == ServiceResponseStatusEnum.SUCCESS) {
        this.activeModal.close(true);
      }
      else {
        this.activeModal.dismiss(reason);
      }
    }
  }

  downlaodGeneratedFile() {
    GeneralOperation.dyanmicDownloadByHtmlTag({
      fileName: this.messageLogId + '.hl7',
      text: this.phsMessageString
    });
  }

}
