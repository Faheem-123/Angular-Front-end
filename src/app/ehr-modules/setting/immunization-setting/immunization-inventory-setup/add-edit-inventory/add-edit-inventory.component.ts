import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ImmunizationService } from 'src/app/services/immunization.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { OperationType, RegExEnum, ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ListFilterContainsAnyGeneral } from 'src/app/shared/filter-pipe-contains-any-general';
import { CustomValidators, datetimeValidator } from 'src/app/shared/custome-validators';
import { DateModel } from 'src/app/models/general/date-model';
import { ORMImmInventorySave } from 'src/app/models/setting/Immunization/orm-imm-inventory-save';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'add-edit-inventory',
  templateUrl: './add-edit-inventory.component.html',
  styleUrls: ['./add-edit-inventory.component.css']
})
export class AddEditInventoryComponent implements OnInit {

  @Input() clinicInfo: any;
  @Input() inventoryInfo: any;
  @Input() operation: OperationType;



  isLoading: boolean = false;

  clinicName: string = "";

  showImmunizationSearch: boolean = false;

  lstNDC: Array<any>;
  lstStatus: Array<string> = ["ACTIVE", "INACTIVE"];
  lstPracticeAllImmTrade: Array<any>;
  lstPracticeFilteredImmTrade: Array<any>;

  selectedCVXCode: string = '';
  //selectedImmunizationDisplay: string = "";
  selectedImmunization: string = '';
  selectedTradeName: string = '';
  selectedMVXCode: string = '';
  selectedTradeDescription: string = '';
  selectedTradeCodingSystem: string = '';
  selectedManufacturer: string = '';

  exiryDateModel: DateModel;

  formGroup: FormGroup;




  constructor(private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private immService: ImmunizationService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private ngbModal: NgbModal) { }

  ngOnInit() {

    debugger;
    this.clinicName = this.clinicInfo.clinic_name;
    this.getPracticeImmunizationTradeList();


    if (this.operation == OperationType.EDIT) {
      this.selectedCVXCode = this.inventoryInfo.cvx_code;
      this.selectedImmunization = this.inventoryInfo.immunization_name;
      this.selectedTradeName = this.inventoryInfo.trade_name;
      this.selectedTradeDescription = this.inventoryInfo.trade_description;
      this.selectedTradeCodingSystem = this.inventoryInfo.coding_system;
      this.selectedMVXCode = this.inventoryInfo.mvx_code;
      this.selectedManufacturer = this.inventoryInfo.manufacturer_name;
      //this.selectedImmunizationDisplay = this.inventoryInfo.trade_name ;//+ " (" + this.inventoryInfo.immunization_name + ")";

      this.exiryDateModel = this.dateTimeUtil.getDateModelFromDateString(this.inventoryInfo.expiry_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

      this.getImmNDC(this.selectedCVXCode);
    }

    this.buildForm();
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      txtNDC: this.formBuilder.control(this.inventoryInfo == undefined ? null : this.inventoryInfo.ndc,
        Validators.compose([Validators.required, Validators.pattern(RegExEnum.VACCINE_NDC_11)])),
      txtlotNumber: this.formBuilder.control(this.inventoryInfo == undefined ? null : this.inventoryInfo.lot_number, Validators.required),
      dpExpiryDate: this.formBuilder.control(this.inventoryInfo == undefined ? null : this.exiryDateModel,
        Validators.compose([
          Validators.required,
          datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
        ])),
      txtInventory: this.formBuilder.control(this.inventoryInfo == undefined ? null : this.inventoryInfo.inventory,
        Validators.compose(
          [Validators.required,
          Validators.min(0)])),
      ddStatus: this.formBuilder.control(this.inventoryInfo == undefined ? "ACTIVE" : this.inventoryInfo.inventory_status, Validators.required)
    }
      /*,
        {
          validator: Validators.compose([
            CustomValidators.validDate("dpExpiryDate", false)
          ])
        }*/
    );
  }
  getPracticeImmunizationTradeList() {

    this.immService.getImmunizationTradeNameSearchList(this.lookupList.practiceInfo.practiceId)
      .subscribe(
        data => {

          this.lstPracticeAllImmTrade = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting Practice Trade Names list.")
        }
      );

  }

  onImmunizationSearchKeydown(value: string) {


    debugger;
    //if (event.key === "Enter") 
    if (value.length >= 2) {
      this.showImmunizationSearch = true;

      let filterObj: any = { cvx_code: value, trade_name: value };
      this.lstPracticeFilteredImmTrade =
        new ListFilterContainsAnyGeneral().transform(this.lstPracticeAllImmTrade, filterObj);

      //this.lstImmunizationMyListFiltered=this.lstReasonValue= new ListFilterGeneral().transform(this.lstImmunizationMyList, [{'immunization_name':this.vaccineFormGroup.get("txtImmunizaionSearch").value},{'cvx_code':this.vaccineFormGroup.get("txtImmunizaionSearch").value},{'trade_name':this.vaccineFormGroup.get("txtImmunizaionSearch").value}]);
      //this.lstPracticeFilteredImmTrade = new ListFilterContainThreeColumns().transform(this.lstPracticeAllImmTrade,
      //        'immunization_name', 'cvx_code', 'trade_name', value);
      //console.log(this.lstImmunizationMyListFiltered.length)
    }
    else {
      this.showImmunizationSearch = false;
    }


  }

  closeImmunizationSearch() {

    /*
    if ((this.vaccineFormGroup.get("txtCvxCode") as FormControl).value == "" || (this.vaccineFormGroup.get("txtCvxCode") as FormControl).value == undefined) {
        (this.vaccineFormGroup.get("txtImmunizaionSearch") as FormControl).setValue(null);
        (this.vaccineFormGroup.get("txtCvxCode") as FormControl).setValue(null);
    }
    */
    this.showImmunizationSearch = false;
  }

  addImmunization(objImm: any) {

    debugger;

    this.selectedCVXCode = objImm.cvx_code;
    this.selectedImmunization = objImm.immunization_name;
    this.selectedTradeName = objImm.trade_name;
    this.selectedTradeDescription = objImm.trade_description;
    this.selectedTradeCodingSystem = objImm.coding_system;
    this.selectedMVXCode = objImm.mvx_code;
    this.selectedManufacturer = objImm.manufacturer_name;
    //this.selectedImmunizationDisplay = objImm.trade_name + " (" + objImm.immunization_name + ")";
    this.showImmunizationSearch = false;

    this.getImmNDC(this.selectedCVXCode);
  }

  getImmNDC(code: string) {
    this.immService.getImmNDC(code)
      .subscribe(
        data => {
          this.lstNDC = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting Immunization NDC list.")

        }
      );
  }


  onSubmit(formData: any) {


    if (this.validateData(formData)) {


      debugger;
      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


      let ormImmunizationInventorySave: ORMImmInventorySave = new ORMImmInventorySave();

      if (this.operation == OperationType.ADD) {

        ormImmunizationInventorySave.client_date_created = clientDateTime;
        ormImmunizationInventorySave.created_user = this.lookupList.logedInUser.user_name;


      }
      else if (this.operation == OperationType.EDIT) {
        ormImmunizationInventorySave.inventory_id = this.inventoryInfo.inventory_id;
        ormImmunizationInventorySave.date_created = this.inventoryInfo.date_created;
        ormImmunizationInventorySave.client_date_created = this.inventoryInfo.client_date_created;
        ormImmunizationInventorySave.created_user = this.inventoryInfo.created_user;
      }
      ormImmunizationInventorySave.practice_id = this.lookupList.practiceInfo.practiceId;
      ormImmunizationInventorySave.client_date_modified = clientDateTime;
      ormImmunizationInventorySave.modified_user = this.lookupList.logedInUser.user_name;
      ormImmunizationInventorySave.system_ip = this.lookupList.logedInUser.systemIp;
      ormImmunizationInventorySave.location_id = this.clinicInfo.location_id;
      ormImmunizationInventorySave.clinic_id = this.clinicInfo.clinic_id;

      ormImmunizationInventorySave.inventory = formData.txtInventory;
      ormImmunizationInventorySave.inventory_status = formData.ddStatus;
      ormImmunizationInventorySave.expiry_date = this.dateTimeUtil.getStringDateFromDateModel(formData.dpExpiryDate);

      ormImmunizationInventorySave.lot_number = formData.txtlotNumber;

      ormImmunizationInventorySave.cvx_code = this.selectedCVXCode;
      ormImmunizationInventorySave.mvx_code = this.selectedMVXCode;

      ormImmunizationInventorySave.trade_name = this.selectedTradeName;
      ormImmunizationInventorySave.trade_description = this.selectedTradeDescription;

      ormImmunizationInventorySave.ndc = formData.txtNDC;
      ormImmunizationInventorySave.deleted = false;


      debugger;
      this.immService.saveImmmunizationInentory(ormImmunizationInventorySave).subscribe(
        data => {

          this.saveImmmunizationInentorySuccess(data);
        },
        error => {
          this.saveImmmunizationInentoryError(error);
        }
      );

    }


  }

  saveImmmunizationInentorySuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Inventory', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveImmmunizationInentoryError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Inventory', "An Error Occured while saving Immunization Inventory", AlertTypeEnum.DANGER)
  }

  validateData(formData: any) {

    debugger;
    let strMsg: string = "";

    if (this.selectedCVXCode == undefined || this.selectedCVXCode == ""
      || this.selectedMVXCode == undefined || this.selectedMVXCode == ""
      || this.selectedTradeName == undefined || this.selectedTradeName == "") {
      strMsg = "Please select immunization trade."
    }
    else if (formData.txtNDC == undefined || formData.txtNDC == "") {
      strMsg = "Please enter NDC Code."
    }
    else if (formData.txtlotNumber == undefined || formData.txtlotNumber == "") {
      strMsg = "Please enter Lot Number."
    }
    else if (formData.dpExpiryDate == undefined || formData.dpExpiryDate == "") {
      strMsg = "Please enter Expiry Date."
    }
    else if (formData.txtInventory == undefined || formData.txtInventory == "") {
      strMsg = "Please Inventory in hand."
    }
    else if (formData.ddStatus == undefined || formData.ddStatus == "") {
      strMsg = "Please select status."
    }


    if (strMsg != "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Inventory', strMsg, AlertTypeEnum.DANGER)

      return false;
    }
    else {
      return true;
    }

  }



}
