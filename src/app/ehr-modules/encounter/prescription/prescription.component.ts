import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NewcropComponent } from 'src/app/general-modules/newcrop/newcrop.component';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { GetPrescriptionAllergies } from 'src/app/models/encounter/GetPrescriptionAllergies';
import { PrescriptionXml } from 'src/app/models/encounter/PrescriptionXml';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { AlertTypeEnum, ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { LogMessage } from 'src/app/shared/log-message';
import { NewCropXML } from 'src/app/shared/NewCropXML';
import { AddEditLocalPrescriptionComponent } from './add-edit-local-prescription/add-edit-local-prescription.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { UpdateRecordModel } from 'src/app/models/general/update-record-model';
import { Chartreport_Print } from 'src/app/models/encounter/Chartreport_Print';

@Component({
  selector: 'prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  addEditView: boolean = false;
  isLoading: boolean = false;

  lstPrescriptionView;
  lstPrescriptionViewFiltered;
  dataOption = "active";
  radioForm: FormGroup;
  Prescriptionlink;
  post_xml;

  canView: boolean = false;
  canAddEdit: boolean = false;
  noRecordFound: boolean = false;

  enableLocalPrescription: boolean = false;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

  canShowEprescriptionButton = true;
  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private genXml: NewCropXML,
    private ngbModal: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation) {

    this.canView = this.lookupList.UserRights.ViewMedication;
    this.canAddEdit = this.lookupList.UserRights.AddModifyMedication;

    let ProductionOption: String = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxProduction")[0].options.toString();
    if (ProductionOption.toLocaleUpperCase() != "YES") {
      var rxUser = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxDemoUserName")[0].options;
      var rxPwd = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxDemoPassword")[0].options;
      if ((rxUser == null || rxUser == "")
        || rxPwd == null || rxPwd == "") {
        this.canShowEprescriptionButton = false;
      }
    }
  }
  buildForm() {
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control('active'),
    }
    );
  }
  ngOnInit() {
    if (this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;

    let arrOptions: any = new ListFilterPipe().transform(this.lookupList.appSettings, "description", "localAllergyPrescription");
    if (arrOptions != undefined && arrOptions.length > 0) {
      if (arrOptions[0].options.toString().toLocaleUpperCase() == "TRUE") {
        this.enableLocalPrescription = true;
      }
      else {
        this.enableLocalPrescription = false;
      }
    }

    this.buildForm();
    if (this.canView) {
      this.getViewData();
    }
  }




  getViewData() {
    this.isLoading = true;
    this.noRecordFound = false;

    this.encounterService.getChartPrescriptionView(this.objencounterToOpen.patient_id.toString())
      .subscribe(
        data => {
          this.lstPrescriptionView = data;
          if (this.lstPrescriptionView == undefined || this.lstPrescriptionView.length == 0) {
            this.noRecordFound = true;
          }
          this.isLoading = false;

          if (this.noRecordFound == true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
          this.lstPrescriptionViewFiltered = new ListFilterPipe().transform(this.lstPrescriptionView, "archive", "N");
        },
        error => {
          this.logMessage.log("An Error Occured while getting Prescription list.")
          this.isLoading = false;
        }
      );
  }
  onRadioOptionChange(event) {
    this.dataOption = event;

    switch (this.dataOption) {
      case "all":
        this.lstPrescriptionViewFiltered = this.lstPrescriptionView;
        break;
      case "active":
        this.lstPrescriptionViewFiltered = new ListFilterPipe().transform(this.lstPrescriptionView, "archive", "N");
        break;
      case "inactive":
        this.lstPrescriptionViewFiltered = new ListFilterPipe().transform(this.lstPrescriptionView, "archive", "Y");
        break;
      case "other":
        this.lstPrescriptionViewFiltered = new ListFilterPipe().transform(this.lstPrescriptionView, "archive", "OTHER");
        break;
      default:
        break;
    }
  }

  openPrescripton(reqPage: string) {
    if (
      this.lookupList.logedInUser.userDefaultPrescriptionRole.toString().toLocaleUpperCase() == "DOCTOR"
      &&
      (this.lookupList.logedInUser.loginProviderId == 0 || this.lookupList.logedInUser.loginProviderId == null)) {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      modalRef.componentInstance.promptHeading = 'Prescription Validation';
      modalRef.componentInstance.promptMessage = "Provider is not mapped properly in user, Please contact Administrator";// not mapped properly in user, plz con
      return;
    }
    let prescripXML: PrescriptionXml = new PrescriptionXml();
    prescripXML = this.genXml.prepareObject(prescripXML, this.objencounterToOpen, this.lookupList);
    if (prescripXML.msg != "") {
      //alert("Rx Credentials are not correct, Please contact Administrator.");
      alert(prescripXML.msg);
      return false;
    }
    if (reqPage != "") {
      prescripXML.requestedpage = reqPage;
    }

    this.Prescriptionlink = prescripXML.prescriptionlink;
    this.encounterService.getPrescriptionXml(prescripXML)
      .subscribe(
        data => {
          this.prescriptionXmlResult(data)
        },
        error => {
          this.PrescriptionError(error);
        }
      );


  }

  prescriptionXmlResult(data) {

    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.post_xml = data.result;
      this.loadIrx();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Prescription", data.result, AlertTypeEnum.WARNING);
    }
  }

  PrescriptionError(error) {
    this.logMessage.log("Error on Prescription.");
  }

  loadIrx() {
    debugger;
    const modalRef = this.ngbModal.open(NewcropComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.patient_name = "Patient Prescription - " + this.objencounterToOpen.openPatientInfo.last_name + ", " + this.objencounterToOpen.openPatientInfo.first_name + "(DOB: " + this.objencounterToOpen.openPatientInfo.patient_dob + ")";
    modalRef.componentInstance.post_xml = this.post_xml;
    modalRef.componentInstance.prescription_link = this.Prescriptionlink;
    var canDownloadXmlData: string = new ListFilterPipe().transform(this.lookupList.appSettings, "description", "ShowGetXmlButton")[0].options.toString();
    modalRef.componentInstance.canDownloadXml = canDownloadXmlData.toLowerCase();//change case

    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        this.getAllPrescription();
      }
    }, (reason) => {
    });
  }

  getAllPrescription() {

    let getPrescriptionNCrop: GetPrescriptionAllergies = new GetPrescriptionAllergies();
    getPrescriptionNCrop = this.genXml.prepareGetObject(getPrescriptionNCrop, this.objencounterToOpen, this.lookupList, "prescription");

    this.isLoading = true;
    this.noRecordFound = false;
    debugger;
    this.encounterService.getPatPrescriptionServer(getPrescriptionNCrop)
      .subscribe(
        data => {
          this.lstPrescriptionView = data;
          if (this.lstPrescriptionView == undefined || this.lstPrescriptionView.length == 0) {
            this.noRecordFound = true;
          }
          this.isLoading = false;

          if (this.noRecordFound == true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
          this.lstPrescriptionViewFiltered = new ListFilterPipe().transform(this.lstPrescriptionView, "archive", "N");
        },
        error => {
          this.logMessage.log("An Error Occured while getting Prescription list.")
          this.isLoading = false;
        }
      );
  }
  openPDMP() {
    var URL: string = "";
    URL = "https://pdmp.wi.gov/";

    window.open(URL, '_blank');
  }

  addEditLocalPrescription(med: any) {

    const modalRef = this.ngbModal.open(AddEditLocalPrescriptionComponent, this.popUpOptions);

    modalRef.componentInstance.objencounterToOpen = this.objencounterToOpen;
    if (med == undefined) {

      modalRef.componentInstance.opertaionType = 'new';
    }
    else {
      modalRef.componentInstance.chartPrescriptionId = med.chart_prescription_id;
      modalRef.componentInstance.opertaionType = 'edit';
    }


    modalRef.result.then((result) => {
      if (result != undefined) {
        this.getViewData();
      }
    }
      , (reason) => {

        //alert(reason);
      });

  }

  onDeletePrescription(med: any) {


    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = med.chart_prescription_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deletePrescription(deleteRecordData).subscribe(
          data => {
            this.onDeleteSuccessfully(data);
          },
          error => {
            this.onDeleteError(error);
          }
        );


      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.getViewData();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);

      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = "Delete Prescription"
      modalRef.componentInstance.promptMessage = data.response;
    }

  }

  onDeleteError(error: any) {
    this.logMessage.log("An Error Occured while deleting prescription.");
  }

  markPrescriptionAsInactive(med: any) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Action!';
    modalRef.componentInstance.promptMessage = 'Do you want to mark selected medication as Inactive ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {

        let updateRecordModel: UpdateRecordModel = new UpdateRecordModel();
        updateRecordModel.id = med.chart_prescription_id.toString();
        updateRecordModel.client_datetime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
        updateRecordModel.user_name = this.lookupList.logedInUser.user_name;
        updateRecordModel.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.markPrescriptionAsInactive(updateRecordModel).subscribe(
          data => {
            this.markPrescriptionAsInactiveSuccess(data);
          },
          error => {
            this.markPrescriptionAsInactiveError(error);
          }
        );
      }
    }, (reason) => {
      //alert(reason);
    });

  }

  markPrescriptionAsInactiveSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.getViewData();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);
    }
  }

  markPrescriptionAsInactiveError(error: any) {
    this.logMessage.log("markTaskAsCompleted Error.");
  }

  
  print() {
    let objchartReport:Chartreport_Print = new Chartreport_Print(this.encounterService, this.generalOperation, this.logMessage, this.dateTimeUtil, 
      this.lookupList, this.ngbModal, undefined);
    objchartReport.chartId = this.objencounterToOpen.chart_id;
    objchartReport.patientId = this.objencounterToOpen.patient_id;
    objchartReport.callingFrom = 'prescription_only';
    objchartReport.getReportData();
  }

}
