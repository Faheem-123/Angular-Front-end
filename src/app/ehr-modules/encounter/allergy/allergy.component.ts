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

import { AlertTypeEnum, ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { LogMessage } from 'src/app/shared/log-message';
import { NewCropXML } from 'src/app/shared/NewCropXML';
import "../../../../assets/js/ehr";
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ListFilterGeneralNotIn } from 'src/app/shared/filter-pipe-general-not-in';
import { AddEditLocalAllergyComponent } from './add-edit-local-allergy/add-edit-local-allergy.component';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { UpdateRecordModel } from 'src/app/models/general/update-record-model';


@Component({
  selector: 'allergy',
  templateUrl: './allergy.component.html',
  styleUrls: ['./allergy.component.css']
})
export class AllergyComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;

  isLoading: boolean = false;

  canView: boolean = false;
  canAddEdit: boolean = false;

  noRecordFound: boolean = false;
  lstAllergyView;
  lstAllergyViewFiltered;
  dataOption = "ehr";
  radioForm: FormGroup;
  post_form: FormGroup;
  getXml;
  Prescriptionlink: string = "";
  //production
  post_xml = "";
  
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  enableLocalAllergy: boolean = false;

  constructor(private encounterService: EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private genXml: NewCropXML) {

    this.canView = this.lookupList.UserRights.ViewAllergies;
    this.canAddEdit = this.lookupList.UserRights.AddModifyAllergies;
  }
  buildForm() {
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control('ehr'),
    }
    );
    this.post_form = this.formBuilder.group({
      RxInput: this.formBuilder.control(this.post_xml),
    })
  }

  poupUpOptions: NgbModalOptions = {
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


  ngOnInit() {

    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
    this.canAddEdit = false;
    
    let arrOptions: any = new ListFilterPipe().transform(this.lookupList.appSettings, "description", "localAllergyPrescription");
    if (arrOptions != undefined && arrOptions.length > 0) {
      if (arrOptions[0].options.toString().toLocaleUpperCase() == "TRUE") {
        this.enableLocalAllergy = true;
      }
      else {
        this.enableLocalAllergy = false;
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

    this.encounterService.getChartAllergyView(this.objencounterToOpen.patient_id.toString())
      .subscribe(
        data => {
          this.lstAllergyView = data;
          if (this.lstAllergyView == undefined || this.lstAllergyView.length == 0) {
            this.noRecordFound = true;
          }
          this.isLoading = false;

          if (this.noRecordFound == true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));

            //this.lstAllergyViewFiltered = new ListFilterPipe().transform(this.lstAllergyView, "modified_user", "N");

            let filterObj: any = { modified_user: 'ccd' };
            this.lstAllergyViewFiltered = new ListFilterGeneralNotIn().transform(this.lstAllergyView, filterObj);

          }
          //this.lstAllergyViewFiltered = new ListFilterPipe().transform(this.lstAllergyView, "modified_user", "N");
        },
        error => {
          this.logMessage.log("An Error Occured while getting Prescription list.")
          this.isLoading = false;
        }
      );
  }
  onRadioOptionChange(event) {
    debugger;
    this.dataOption = event;
    switch (this.dataOption) {
      case "ehr":
        let filterObj: any = { modified_user: 'ccd' };
        this.lstAllergyViewFiltered = new ListFilterGeneralNotIn().transform(this.lstAllergyView, filterObj);

        break;
      case "other":
        this.lstAllergyViewFiltered = new ListFilterPipe().transform(this.lstAllergyView, "modified_user", "ccd");
        break;
      default:
        if (this.lstAllergyViewFiltered.length == 0)
          this.noRecordFound = true;
        else
          this.noRecordFound = false;
        break;

    }
    // switch (this.dataOption) {
    //   case "all":
    //     this.lstAllergyViewFiltered= this.lstAllergyView;
    //   break;
    //   case "active":
    //     this.lstAllergyViewFiltered = new ListFilterPipe().transform(this.lstAllergyView, "archive", "N");
    //   break;

    //   default:
    //   break;
    // }
  }
  /*
  private httpOptions = {
    //   headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    // };
    headers: new HttpHeaders({
      'Content-Type': 'application/xml', //<- To SEND XML
      'Accept': 'application/xml',       //<- To ask for XML
      'Response-Type': 'text'
    })
  };
  */


  onSubmit() {
debugger;
    let prescripXML: PrescriptionXml = new PrescriptionXml();
    prescripXML = this.genXml.prepareObject(prescripXML, this.objencounterToOpen, this.lookupList);
    if (prescripXML.msg != "") {
      //alert("Rx Credentials are not correct, Please contact Administrator.");
      alert(prescripXML.msg);
      return false;
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
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.post_xml = data.result;
      this.loadIrx();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.modalService, "Prescription", data.result, AlertTypeEnum.WARNING);
    }
  }

  PrescriptionError(error) {
    this.logMessage.log("Error on Prescription.");
  }

  loadIrx() {
    debugger;
    const modalRef = this.modalService.open(NewcropComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.patient_name = "Patient Allergies - " + this.objencounterToOpen.openPatientInfo.last_name + ", " + this.objencounterToOpen.openPatientInfo.first_name + "(DOB: " + this.objencounterToOpen.openPatientInfo.patient_dob + ")";
    modalRef.componentInstance.post_xml = this.post_xml;
    modalRef.componentInstance.prescription_link = this.Prescriptionlink;

    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        this.getupdateAllergies();
      }
    }, (reason) => {
    });
  }


  getupdateAllergies() {
    let getAllergiesNCrop: GetPrescriptionAllergies = new GetPrescriptionAllergies();
    getAllergiesNCrop = this.genXml.prepareGetObject(getAllergiesNCrop, this.objencounterToOpen, this.lookupList, "Allergies");

    this.isLoading = true;
    this.noRecordFound = false;
    debugger;
    this.encounterService.getPatientAllergys(getAllergiesNCrop)
      .subscribe(
        data => {
          this.isLoading = false;
          this.lstAllergyView = data;
          if (this.lstAllergyView == undefined || this.lstAllergyView.length == 0) {
            this.noRecordFound = true;
          }
          if (this.noRecordFound == true) {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
            let filterObj: any = { modified_user: 'ccd' };
            this.lstAllergyViewFiltered = new ListFilterGeneralNotIn().transform(this.lstAllergyView, filterObj);
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting Allergies list.")
        }
      );
  }

  addEditLocalAllergy(allergy: any) {

    const modalRef = this.modalService.open(AddEditLocalAllergyComponent, this.popUpOptions);

    modalRef.componentInstance.objencounterToOpen = this.objencounterToOpen;
    if (allergy == undefined) {

      modalRef.componentInstance.opertaionType = 'new';
    }
    else {
      modalRef.componentInstance.chartAllergyId = allergy.chart_allergies_id;
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

  onDeleteAllergy(allergy: any) {


    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = allergy.chart_allergies_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteAllergy(deleteRecordData).subscribe(
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

      const modalRef = this.modalService.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = "Delete Allergy"
      modalRef.componentInstance.promptMessage = data.response;
    }

  }

  onDeleteError(error: any) {
    this.logMessage.log("An Error Occured while deleting allergy.");
  }

  markAllergyAsInactive(allergy: any) {

    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Action!';
    modalRef.componentInstance.promptMessage = 'Do you want to mark selected allergy as Inactive ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {

        let updateRecordModel: UpdateRecordModel = new UpdateRecordModel();
        updateRecordModel.id = allergy.chart_allergies_id.toString();
        updateRecordModel.client_datetime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
        updateRecordModel.user_name = this.lookupList.logedInUser.user_name;
        updateRecordModel.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.markAllergyAsInactive(updateRecordModel).subscribe(
          data => {
            this.markAllergyAsInactiveSuccess(data);
          },
          error => {
            this.markAllergyAsInactiveError(error);
          }
        );
      }
    }, (reason) => {
      //alert(reason);
    });

  }

  markAllergyAsInactiveSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.getViewData();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);
    }
  }

  markAllergyAsInactiveError(error: any) {
    this.logMessage.log("markTaskAsInactive Error.");
  }

}
