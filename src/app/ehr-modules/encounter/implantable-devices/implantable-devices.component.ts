import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ChartModuleHistoryComponent } from 'src/app/general-modules/chart-module-history/chart-module-history.component';
import { chartmodulehistory } from 'src/app/models/encounter/chartmodulehistory';
import { ormpatientimplantabledevice } from 'src/app/models/encounter/ormpatientimplantabledevice';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum, OperationType, AlertTypeEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';


@Component({
  selector: 'implantable-devices',
  templateUrl: './implantable-devices.component.html',
  styleUrls: ['./implantable-devices.component.css']
})
export class ImplantableDevicesComponent implements OnInit {
  @Input() moduleName: string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();

  addEditView: boolean = false;
  canView: boolean = false;
  canAddEdit: boolean = true;
  
  dataFilterOption: string = "active";
  formBuildCompleted: boolean = false;;
  isLoading: boolean = false;
  noRecordFound: boolean = false;

  filterForm: FormGroup;
  searchUDIForm: FormGroup;
  ImplForm: FormGroup;

  addEditOperation: string;


  private obj_implDevHistory: chartmodulehistory;

  UDIVerified: boolean = false;
  VerifyicationInProgress: boolean = false;
  showGlobalUDIInfo: boolean = false;
  udiVerificationErrorMsg: string = "";
  searchedUDI: string = "";

 
  //isEdit: boolean = false;
  lstPatImplantableDevicesSummary: any;
  lstPatImplantableDevicesSummaryFiltered: any;
  //editIndex;
  //editID;
  //editValues;
  patImplantableDevice: any;

  deviceID: string = "";
  issuingAgencey: string = "";
  deviceDescription: string = "";
  deviceHCTP: string = ""
  gmdNptName: string = "";
  gmdNptDescription: string = "";
  companyName: string = "";
  brandName: string = "";

  expirationDate: string = "";
  manufacturingDate: string = "";
  serialNumber: string = "";
  lotBatchNumber: string = "";
  versionModelNumber: string = "";

  snomedCTCode: string = "";
  snomedCTDescription: string = "";

  MRISafetyStatusInfo: string = "";
  labledAsNoNRL: string = ""
  labledAsContainsNRL: string = ""

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private ngbModal: NgbModal,
    private logMessage: LogMessage,
    private encounterService: EncounterService) { }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
    //this.buildForm();
    this.buildFilterForm();
    this.getPatImplantableDevicesSummary();
  }
  buildFilterForm() {
    this.filterForm = this.formBuilder.group({
      radioOption: this.formBuilder.control(this.dataFilterOption),
    }
    );
  }

  buildForm() {
    if (!this.formBuildCompleted) {
      this.searchUDIForm = this.formBuilder.group({
        txtUDI: this.formBuilder.control(null)
      })
      this.ImplForm = this.formBuilder.group({
        implantDate: this.formBuilder.control(null, Validators.compose([
          Validators.required,
          datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
        ])),
        rbDevicedActive: this.formBuilder.control(true),
        notes: this.formBuilder.control(null)
      })

      this.formBuildCompleted = true;
    }

  }

  getPatImplantableDevicesSummary() {
    this.isLoading = true;
    this.encounterService.getPatImplantableDevicesSummary(this.objencounterToOpen.patient_id)
      .subscribe(
        data => {
          this.lstPatImplantableDevicesSummary = data as Array<any>;
          this.onRadioOptionChange(this.dataFilterOption);
          this.isLoading = false;
        },
        error => {
          this.logMessage.log("An Error Occured while getting Immunization list.")
          this.isLoading = false;
        }
      );
  }

  getPatImplantableDeviceDetailById(implantableDeviceId: number) {
    this.encounterService.getPatImplantableDeviceDetailById(implantableDeviceId).subscribe(
      data => {
        this.patImplantableDevice = data;
        this.assignEditData(this.patImplantableDevice);
      },
      error => {
        return;
      }
    );
  }

  onRadioOptionChange(filterOption: string) {

    this.lstPatImplantableDevicesSummaryFiltered = undefined;
    this.dataFilterOption = filterOption;
    if (filterOption == "all") {
      this.lstPatImplantableDevicesSummaryFiltered = this.lstPatImplantableDevicesSummary;//new ListFilterPipe().transform(this.lstPatImplantableDevicesSummary, "status", "false");
    }
    else if (filterOption == "active") {
      this.lstPatImplantableDevicesSummaryFiltered = new ListFilterPipe().transform(this.lstPatImplantableDevicesSummary, "device_active", "true");
      if (this.lstPatImplantableDevicesSummaryFiltered != undefined && this.lstPatImplantableDevicesSummaryFiltered.length > 0) {
        this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
      }
      else {
        this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
      }
    }
    else if (filterOption == "inactive") {
      this.lstPatImplantableDevicesSummaryFiltered = new ListFilterPipe().transform(this.lstPatImplantableDevicesSummary, "device_active", "false");
    }

    if (this.lstPatImplantableDevicesSummaryFiltered != undefined && this.lstPatImplantableDevicesSummaryFiltered.length > 0) {
      this.noRecordFound = false;
      this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
    }
    else {
      this.noRecordFound = true;
      this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
    }
  }

  verifyUDI() {

    if ((this.searchUDIForm.get('txtUDI') as FormControl).value == undefined
      || (this.searchUDIForm.get('txtUDI') as FormControl).value == null
      || (this.searchUDIForm.get('txtUDI') as FormControl).value.trim() == "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Implantable Devices', "Please enter UDI", AlertTypeEnum.WARNING)

    }
    else {
      this.searchedUDI = "";
      this.udiVerificationErrorMsg = "";
      this.showGlobalUDIInfo = false;
      this.UDIVerified = false;
      // this.clearAllFields();

      if (this.validate()) {

        this.searchedUDI = (this.searchUDIForm.get('txtUDI') as FormControl).value.trim();
        this.VerifyicationInProgress = true;
        this.searchUDIForm.get('txtUDI').disable();

        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [];
        searchCriteria.param_list.push({ name: "UDI", value: this.searchedUDI, option: "" });


        this.encounterService.getDeviceDetailFromGlobalUDIDB(searchCriteria).subscribe(
          data => {
            debugger;
            this.VerifyicationInProgress = false;
            if (data[0][0].error != undefined && data[0][0].error != "") {
              // alert(data[0][0].iserror)
              this.UDIVerified = false;
              this.showGlobalUDIInfo = false;
              this.udiVerificationErrorMsg = data[0][0].error;
              //GeneralOperation.showAlertPopUp(this.ngbModal, 'Implantable Devices', data[0][0].iserror, AlertTypeEnum.WARNING)
              this.searchUDIForm.get('txtUDI').enable();
            } else {

              this.UDIVerified = true;
              this.showGlobalUDIInfo = true;
              this.assignGlobadUDIDBDeviceInfo(data[0][0]);
              this.udiVerificationErrorMsg = "";
            }

            //this.searchUDIForm.get('txtUDI').enable();
          },
          error => {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'Implantable Devices', error.message, AlertTypeEnum.WARNING)
            this.VerifyicationInProgress = false;
            this.searchUDIForm.get('txtUDI').enable();
          }
        );
      }
    }


  }

  onCancel() {
    this.searchedUDI = "";
    this.addEditOperation = undefined;
    this.UDIVerified = false;
    this.addEditView = false;
    this.showGlobalUDIInfo = false;
    this.clearAllFields();
  }


  onAddNewDevice() {
    this.buildForm();
    this.searchedUDI = "";
    this.addEditOperation = OperationType.ADD;

    this.addEditView = true;
    this.UDIVerified = false;
    this.showGlobalUDIInfo = false;
    this.clearAllFields();

    if (this.ImplForm != undefined) {
      this.ImplForm.get("rbDevicedActive").setValue(true);
    }
    if (this.searchUDIForm != undefined) {
      (this.searchUDIForm.get('txtUDI') as FormControl).setValue(null);
      this.searchUDIForm.get("txtUDI").enable();
    }

  }

  onEditDevice(implantableDeviceId: number) {


    this.buildForm();
    this.addEditOperation = OperationType.EDIT;
    if (this.searchUDIForm != undefined) {
      (this.searchUDIForm.get('txtUDI') as FormControl).setValue(null);
      this.searchUDIForm.get("txtUDI").disable();
    }
    this.getPatImplantableDeviceDetailById(implantableDeviceId);

  }


  assignGlobadUDIDBDeviceInfo(deviceInfo: any) {

    debugger;
    this.clearDeviceGlobalUDIInfo();

    /*
    if (this.addEditOperation == OperationType.ADD) {


      this.deviceID = deviceInfo.deviceId;
      this.deviceDescription = deviceInfo.deviceDescription;
      if (deviceInfo.device_HCTP == "true") {
        this.deviceHCTP = "Yes"
      }
      else if (deviceInfo.device_HCTP == "false") {
        this.deviceHCTP = "No"
      }

      this.issuingAgencey = deviceInfo.issuing_agency;
      this.gmdNptName = deviceInfo.gmdnPTName;
      this.gmdNptDescription = deviceInfo.gmdnPTDefinition;

      this.expirationDate = deviceInfo.expiration_date;
      this.manufacturerDate = deviceInfo.manufacturing_date

      this.companyName = deviceInfo.companyName;
      this.brandName = deviceInfo.brandName;

      this.serialNumber = deviceInfo.serial_number;
      this.lotBatchNumber = deviceInfo.lot_batch_number;
      this.versionModelNumber = deviceInfo.versionModelNumber;

      this.MRISafetyStatusInfo = deviceInfo.mrisafetyStatus;

      if (deviceInfo.labeledNoNRL == "true") {
        this.labledAsNoNRL = "Yes";
      }
      else if (deviceInfo.labeledNoNRL == "false") {
        this.labledAsNoNRL = "No";
      }
      if (deviceInfo.labeledContainsNRL == "true") {
        this.labledAsContainsNRL = "Yes";
      } else if (deviceInfo.labeledContainsNRL == "false") {
        this.labledAsContainsNRL = "No";
      }

      this.snomedCTCode = deviceInfo.snomedIdentifier;
      this.snomedCTDescription = deviceInfo.snomedCTName;
    }
    */
    //else if (this.addEditOperation == OperationType.EDIT) {
    this.deviceID = deviceInfo.device_id;
    this.issuingAgencey = deviceInfo.device_id_issuing_agency;

    this.deviceDescription = deviceInfo.device_description;
    if (deviceInfo.device_hctp == "true") {
      this.deviceHCTP = "Yes"
    }
    else if (deviceInfo.device_hctp == "false") {
      this.deviceHCTP = "No"
    }


    this.gmdNptName = deviceInfo.gmdn_pt_name;
    this.gmdNptDescription = deviceInfo.gmdn_pt_description;

    this.expirationDate = deviceInfo.expiry_date;
    this.manufacturingDate = deviceInfo.manufacturing_date

    this.companyName = deviceInfo.company_name;
    this.brandName = deviceInfo.brand_name;

    this.serialNumber = deviceInfo.serial_number;
    this.lotBatchNumber = deviceInfo.lot_batch_number;
    this.versionModelNumber = deviceInfo.version_model_number;

    this.MRISafetyStatusInfo = deviceInfo.mri_safety_status;

    if (deviceInfo.labeled_no_nrl == "true" || deviceInfo.labeled_no_nrl == true) {
      this.labledAsNoNRL = "Yes";
    }
    else if (deviceInfo.labeled_no_nrl == "false" || deviceInfo.labeled_no_nrl == false) {
      this.labledAsNoNRL = "No";
    }
    if (deviceInfo.labeled_contains_nrl == "true" || deviceInfo.labeled_contains_nrl == true) {
      this.labledAsContainsNRL = "Yes";
    } else if (deviceInfo.labeled_contains_nrl == "false" || deviceInfo.labeled_contains_nrl == false) {
      this.labledAsContainsNRL = "No";
    }

    this.snomedCTCode = deviceInfo.snomed_ct_id;
    this.snomedCTDescription = deviceInfo.snomed_ct_description;
    //}

  }


  assignEditData(deviceInfo: any) {


    this.addEditView = true;
    this.UDIVerified = true;
    this.showGlobalUDIInfo = true;

    this.clearAllFields();

    debugger;
    this.searchedUDI = deviceInfo.udi;
    (this.searchUDIForm.get('txtUDI') as FormControl).setValue(this.searchedUDI);

    if (deviceInfo.implant_date != "" || deviceInfo.implant_date != undefined || deviceInfo.implant_date != null) {
      (this.ImplForm.get("implantDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(deviceInfo.implant_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    }

    (this.ImplForm.get('rbDevicedActive') as FormControl).setValue(deviceInfo.device_active);
    /*if (deviceInfo.status.toString().toLowerCase() == "active") {
      (this.ImplForm.get('rbDevicedActive') as FormControl).setValue("Active");
    } else {
      (this.ImplForm.get('rbDevicedActive') as FormControl).setValue("false");
    }
    */
    (this.ImplForm.get('notes') as FormControl).setValue(deviceInfo.notes);
    this.assignGlobadUDIDBDeviceInfo(deviceInfo);
  }


  ValidateData(formData: any): boolean {

    debugger;

    let strAlertMsg: string = "";

    if (!this.UDIVerified || this.searchedUDI == undefined || this.searchedUDI == "") {
      strAlertMsg = "Please enter a valid UDI and veify.";
    }
    else if (formData.implantDate == "" || formData.implantDate == undefined) {
      strAlertMsg = "Please Implant Date.";
    }
    else if (this.dateTimeUtil.checkIfFutureDate(formData.dfLMP, DateTimeFormat.DATEFORMAT_YYYY_MM_DD)) {
      strAlertMsg = "Implant Date Cant not be a future date.";
    }

    if (strAlertMsg != "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Chart Social History', strAlertMsg, AlertTypeEnum.DANGER)
      return false;
    }
    else {
      return true;
    }
  }

  //#region Save
  saveImplantableDevice(formData: any) {


    if (!this.ValidateData(formData))
      return;

    debugger;
    let ormSave: ormpatientimplantabledevice = new ormpatientimplantabledevice();
    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    ormSave.modified_user = this.lookupList.logedInUser.user_name;
    ormSave.client_date_modified = clientDateTime;

    if (this.addEditOperation == OperationType.ADD) {
      ormSave.created_user = this.lookupList.logedInUser.user_name;
      ormSave.client_date_modified = clientDateTime;
      ormSave.udi = this.searchedUDI;//(this.searchUDIForm.get('txtUDI') as FormControl).value.trim();
    }
    else {
      ormSave.implantable_device_id = this.patImplantableDevice.implantable_device_id;// this.editID;
      ormSave.created_user = this.patImplantableDevice.created_user;
      ormSave.date_created = this.patImplantableDevice.date_created;
      ormSave.client_date_created = this.patImplantableDevice.client_date_created;
      ormSave.udi = this.patImplantableDevice.udi;// (this.searchUDIForm.get('txtUDI') as FormControl).value.trim();
    }

    ormSave.system_ip = this.lookupList.logedInUser.systemIp;
    ormSave.patient_id = this.objencounterToOpen.patient_id;
    ormSave.chart_id = this.objencounterToOpen.chart_id;
    ormSave.practice_id = this.lookupList.practiceInfo.practiceId;

    ormSave.device_active = formData.rbDevicedActive;//
    /*
    if (formData.rbDevicedActive == "true" || formData.rbDevicedActive == true) {
      ormSave.status = "Active";
    } else {
      ormSave.status = "Inactive";
    }
    */

    let impDate = this.dateTimeUtil.getStringDateFromDateModel((this.ImplForm.get('implantDate') as FormControl).value);
    if (impDate != "") {
      //let imp_date = this.dateTimeUtil.getStringDateFromDateModel(impDate);
      ormSave.implant_date = impDate;
    } else {
      ormSave.implant_date = "";
    }
    ormSave.notes = (this.ImplForm.get('notes') as FormControl).value;

    ormSave.device_id = this.deviceID;
    ormSave.device_id_issuing_agency = this.issuingAgencey;
    ormSave.gmdn_pt_name = this.gmdNptName;
    ormSave.gmdn_pt_description = this.gmdNptDescription;

    ormSave.expiry_date = this.expirationDate;
    ormSave.manufacturing_date = this.manufacturingDate;

    ormSave.company_name = this.companyName;
    ormSave.brand_name = this.brandName;
    ormSave.serial_number = this.serialNumber;
    ormSave.lot_batch_number = this.lotBatchNumber;
    ormSave.version_model_number = this.versionModelNumber;

    ormSave.device_hctp = this.deviceHCTP == 'Yes' ? 'true' : this.deviceHCTP == 'No' ? 'false' : '';

    ormSave.mri_safety_status = this.MRISafetyStatusInfo;
    ormSave.labeled_no_nrl = this.labledAsNoNRL == 'Yes' ? 'true' : this.labledAsNoNRL == 'No' ? 'false' : '';
    ormSave.labeled_contains_nrl = this.labledAsContainsNRL == 'Yes' ? 'true' : this.labledAsContainsNRL == 'No' ? 'false' : '';;

    ormSave.device_description = this.deviceDescription;

    ormSave.snomed_ct_id = this.snomedCTCode;
    ormSave.snomed_ct_description = this.snomedCTDescription;

    this.encounterService.savePatImplantDevice(ormSave)
      .subscribe(
        data => {
          this.saveImplantDevicesSuccess(data);
        },
        error => {
          this.saveImplantDevicesError(error);
        }
      );
  }

  saveImplantDevicesSuccess(data: any) {

    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.addEditOperation = undefined;
      this.addEditView = false;
      this.getPatImplantableDevicesSummary();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Implantable Devices', data.response, AlertTypeEnum.DANGER)

    }
  }

  saveImplantDevicesError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Implantable Devices', "An Error Occured while saving Chart Patient Implantable Device.", AlertTypeEnum.DANGER)

  }

  showError(errMsg) {
    const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = "Error";
    modalRef.componentInstance.promptMessage = errMsg;
    modalRef.componentInstance.alertType = "error";
    let closeResult;
    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
    return;
  }
  //#endregion Save

  //#region History
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true,
    size: 'lg'
  };
  historyImplantableDevice() {
    const modalRef = this.ngbModal.open(ChartModuleHistoryComponent, this.logoutScreenOptions);
    this.obj_implDevHistory = new chartmodulehistory();
    this.obj_implDevHistory.titleString = "Patient Implantable Device";
    this.obj_implDevHistory.moduleName = "patient_implantable_device_log";
    this.obj_implDevHistory.criteria = " and ps.chart_id= '" + this.objencounterToOpen.chart_id + "' ";
    this.obj_implDevHistory.criteria = " and ps.chart_id= '" + this.objencounterToOpen.chart_id + "' and ps.patient_id = '" + this.objencounterToOpen.patient_id + "' ";
    //and ps.udi = '"+grdImplDevice.selectedItem.udi+"' 
    modalRef.componentInstance.data = this.obj_implDevHistory;
    let closeResult;
    modalRef.result.then((result) => {
      if (result == true) {
      }
    }
      , (reason) => {
      });
  }
  //#endregion History

  //#region getimpldev

  //#endregion getimpldev

  validate(): boolean {//.trim()
    if ((this.searchUDIForm.get('txtUDI') as FormControl).value.trim() == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Implantable Devices', "Please enter UDI/DI for search.", AlertTypeEnum.DANGER)
      return false;
    }
    return true;
  }

  clearDeviceGlobalUDIInfo() {

    this.deviceID = "";
    this.deviceDescription = "";
    this.deviceHCTP = "";
    this.issuingAgencey = "";
    this.gmdNptName = "";
    this.gmdNptDescription = "";

    this.expirationDate = "";
    this.manufacturingDate = "";

    this.companyName = "";
    this.brandName = "";

    this.serialNumber = "";
    this.lotBatchNumber = "";
    this.versionModelNumber = "";

    this.MRISafetyStatusInfo = "";
    this.labledAsNoNRL = "";
    this.labledAsContainsNRL = "";
    this.labledAsNoNRL = "";

    this.snomedCTCode = "";
    this.snomedCTDescription = "";
  }

  clearAllFields() {

    this.clearDeviceGlobalUDIInfo();


    if (this.ImplForm != undefined) {
      (this.ImplForm.get('notes') as FormControl).setValue(null);
      (this.ImplForm.get('rbDevicedActive') as FormControl).setValue(true);
      (this.ImplForm.get('implantDate') as FormControl).setValue(null);
    }

  }

  onDeleteDevice(implantableDeviceId: number) {

    this.addEditOperation = OperationType.DELETE;

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;


    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = implantableDeviceId.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deletePatImplantableDevice(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => GeneralOperation.showAlertPopUp(this.ngbModal, 'Implantable Devices', error, AlertTypeEnum.DANGER),
            () => this.logMessage.log("Record has benn deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data: any) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Implantable Devices', data.response, AlertTypeEnum.DANGER)
    }
    else {
      this.getPatImplantableDevicesSummary();
    }
  }

  clearVerifiedUDIInfo() {
    this.searchedUDI = "";
    this.clearAllFields();
    this.UDIVerified = false;
    this.showGlobalUDIInfo = false;
    this.searchUDIForm.get('txtUDI').enable();
    this.searchUDIForm.get('txtUDI').setValue(null);
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showLogHistory(){
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "implantable_devices_log";
    logParameters.logDisplayName = "Implantable Devices";
    logParameters.logMainTitle = "Implantable Devices";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
  
    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.ngbModal.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }
}