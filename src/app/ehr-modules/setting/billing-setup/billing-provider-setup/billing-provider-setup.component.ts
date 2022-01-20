import { Component, OnInit, Inject } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralService } from 'src/app/services/general/general.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMSaveSetupBillingProvider } from 'src/app/models/setting/ORMSaveSetupBillingProvider';

@Component({
  selector: 'billing-provider-setup',
  templateUrl: './billing-provider-setup.component.html',
  styleUrls: ['./billing-provider-setup.component.css']
})
export class BillingProviderSetupComponent implements OnInit {
  inputForm: FormGroup;
  arrprovider;
  provierSelectedIndex;
  providerOperation = '';
  isDisable = false;

  lstZipCityState: Array<any>;
  lstPayToZipCityState: Array<any>;
  lstGrpZipCityState: Array<any>;
  lstGrpPayToZipCityState: Array<any>;

  constructor(private setupService: SetupService, @Inject(LOOKUP_LIST) public lookupList: LookupList
    , private formBuilder: FormBuilder, private logMessage: LogMessage, private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal, private generalService: GeneralService) { }

  ngOnInit() {
    this.buildForm();
    this.getProviderList();
    this.enableDisable('disable');
  }
  enableDisable(value) {
    if (value == 'disable')
      this.inputForm.disable();
    else
      this.inputForm.enable();
  }
  getProviderList() {

    this.setupService.getSetupBillingProvider(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.arrprovider = data as Array<any>;
        if (this.arrprovider.length > 0) {
          this.provierSelectedIndex = 0;
          this.assignValues();

        }
      },
      error => {
        this.logMessage.log("getSetup Billing Provider Error." + error);
      }
    );
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      drpProviderType: this.formBuilder.control(null, Validators.required),
      txtTitle: this.formBuilder.control(null),
      txtfirstName: this.formBuilder.control(null, Validators.required),
      txtLastName: this.formBuilder.control(null, Validators.required),
      txtMName: this.formBuilder.control(null),
      txtdob: this.formBuilder.control(null, Validators.required),
      txtSSN: this.formBuilder.control(null, Validators.required),
      txtOrgName: this.formBuilder.control(null),
      txtPhone: this.formBuilder.control(null, Validators.required),
      txtFax: this.formBuilder.control(null),
      txtEmail: this.formBuilder.control(null),
      txtIndividualNPI: this.formBuilder.control(null),
      txtGroupNPI: this.formBuilder.control(null),
      txtFedTaxId: this.formBuilder.control(null),
      drpFedTaxType: this.formBuilder.control(null),
      txtTaxonomyId: this.formBuilder.control(null),
      txtGroupTaxonomyid: this.formBuilder.control(null),
      txtDEA: this.formBuilder.control(null),
      txtDEAExpiry: this.formBuilder.control(null),
      txtSPI: this.formBuilder.control(null),
      txtTPI: this.formBuilder.control(null),
      txtGroupTPI: this.formBuilder.control(null),

      txtlicenseState: this.formBuilder.control(null),
      txtLicenseSpec: this.formBuilder.control(null),
      txtUPN: this.formBuilder.control(null),
      txtCliaNo: this.formBuilder.control(null),
      txtCliaExpiry: this.formBuilder.control(null),

      txtIndividualAddress: this.formBuilder.control(null),
      txtIndividualZip: this.formBuilder.control(null),
      txtIndividualState: this.formBuilder.control(null),
      drpIndividualCity: this.formBuilder.control(null),

      txtIndividualPayToAddress: this.formBuilder.control(null),
      txtIndividualPayToZip: this.formBuilder.control(null),
      txtIndividualPayToState: this.formBuilder.control(null),
      drpIndividualPayToCity: this.formBuilder.control(null),

      txtGroupAddress: this.formBuilder.control(null),
      txtGroupZip: this.formBuilder.control(null),
      txtGroupState: this.formBuilder.control(null),
      drpGroupCity: this.formBuilder.control(null),

      txtGroupPayToAddress: this.formBuilder.control(null),
      txtGroupPayToZip: this.formBuilder.control(null),
      txtGroupPayToState: this.formBuilder.control(null),
      drpGroupPayToCity: this.formBuilder.control(null),
      chkDeactivate: this.formBuilder.control(null),
      txtSecondaryTaxonomyid: this.formBuilder.control(null)
    });
  }
  clearFields() {
    this.inputForm.reset();
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  assignValues() {

    (this.inputForm.get("drpProviderType") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].billingprovidertype);
    (this.inputForm.get("txtfirstName") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].first_name);
    (this.inputForm.get("txtMName") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].mname);
    (this.inputForm.get("txtLastName") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].last_name);
    (this.inputForm.get("txtTitle") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].title);
    (this.inputForm.get("txtdob") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrprovider[this.provierSelectedIndex].dob, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("txtSSN") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].ssn);
    (this.inputForm.get("txtOrgName") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].organization_name);

    (this.inputForm.get("txtPhone") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].phone_no);
    (this.inputForm.get("txtFax") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].billing_fax);
    (this.inputForm.get("txtEmail") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].email);
    (this.inputForm.get("txtIndividualNPI") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].npi);
    (this.inputForm.get("txtGroupNPI") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].group_npi);
    (this.inputForm.get("txtFedTaxId") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].federal_taxid);
    (this.inputForm.get("drpFedTaxType") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].federal_taxidnumbertype);

    (this.inputForm.get("txtTaxonomyId") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].taxonomy_id);
    (this.inputForm.get("txtGroupTaxonomyid") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].grp_taxonomy_id);
    (this.inputForm.get("txtDEA") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].dea_no);
    (this.inputForm.get("txtDEAExpiry") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrprovider[this.provierSelectedIndex].dea_expiry_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("txtSPI") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].spi);
    (this.inputForm.get("txtTPI") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].tpi);
    (this.inputForm.get("txtGroupTPI") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].group_tpi);

    (this.inputForm.get("txtlicenseState") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].state_license);
    (this.inputForm.get("txtLicenseSpec") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].spec_license);
    (this.inputForm.get("txtUPN") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].upin);
    (this.inputForm.get("txtCliaNo") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].clia_number);
    (this.inputForm.get("txtCliaExpiry") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrprovider[this.provierSelectedIndex].clia_expiry_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));


    (this.inputForm.get("txtIndividualAddress") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].bill_address);
    (this.inputForm.get("txtIndividualZip") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].bill_zip);
    this.zipFocusOut(this.arrprovider[this.provierSelectedIndex].bill_zip, 'ind');
    //  (this.inputForm.get("txtIndividualState") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].bill_state);
    //    (this.inputForm.get("drpIndividualCity") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].bill_city);

    (this.inputForm.get("txtIndividualPayToAddress") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].pay_to_address);
    (this.inputForm.get("txtIndividualPayToZip") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].pay_to_zip);
    //(this.inputForm.get("txtIndividualPayToState") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].pay_to_state);
    //(this.inputForm.get("drpIndividualPayToCity") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].pay_to_city);
    this.zipFocusOut(this.arrprovider[this.provierSelectedIndex].pay_to_zip, 'indPay');

    (this.inputForm.get("txtGroupAddress") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].bill_address_grp);
    (this.inputForm.get("txtGroupZip") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].bill_zip_grp);
    //(this.inputForm.get("txtGroupState") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].bill_state_grp);
    //(this.inputForm.get("drpGroupCity") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].bill_city_grp);
    this.zipFocusOut(this.arrprovider[this.provierSelectedIndex].bill_zip_grp, 'grp');

    (this.inputForm.get("txtGroupPayToAddress") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].pay_to_address_grp);
    (this.inputForm.get("txtGroupPayToZip") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].pay_to_zip_grp);
    //(this.inputForm.get("txtGroupPayToState") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].pay_to_state_grp);
    //(this.inputForm.get("drpGroupPayToCity") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].pay_to_city_grp);
    this.zipFocusOut(this.arrprovider[this.provierSelectedIndex].pay_to_zip_grp, 'grpPay');

    (this.inputForm.get("chkDeactivate") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].is_blocked);

    (this.inputForm.get("txtSecondaryTaxonomyid") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].secondary_taxonomy_id);

    //(this.inputForm.get("drpCity") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].city);
    //(this.inputForm.get("txtState") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].state);

  }
  onAddNew() {

    this.providerOperation = "new";
    this.clearFields();
    this.enableDisable('enable');
    this.isDisable = true;
  }
  onEdit() {
    this.enableDisable('enable');
    this.isDisable = true;
    this.providerOperation = "Edit";
  }
  onDelete() {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.arrprovider[this.provierSelectedIndex].billing_provider_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.setupService.deleteSetupBillingProvider(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),

          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }

  onDeleteSuccessfully(data) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Provider Setup"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.arrprovider.splice(this.provierSelectedIndex, 1);
      if (this.arrprovider.length > 0) {
        this.provierSelectedIndex = 0;
        this.assignValues();
      }
    }
  }
  objBProvider: ORMSaveSetupBillingProvider;
  onSave() {
    this.objBProvider = new ORMSaveSetupBillingProvider;

    this.objBProvider.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.objBProvider.first_name = this.inputForm.get("txtfirstName").value;
    this.objBProvider.mname = this.inputForm.get("txtMName").value;
    this.objBProvider.last_name = this.inputForm.get("txtLastName").value;
    this.objBProvider.dob = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtdob").value);
    this.objBProvider.title = this.inputForm.get("txtTitle").value;
    this.objBProvider.ssn = this.inputForm.get("txtSSN").value;

    this.objBProvider.phone_no = this.inputForm.get("txtPhone").value;

    this.objBProvider.email = this.inputForm.get("txtEmail").value;
    this.objBProvider.upin = this.inputForm.get("txtUPN").value;
    this.objBProvider.dea_no = this.inputForm.get("txtDEA").value;
    this.objBProvider.clia_number = this.inputForm.get("txtCliaNo").value;
    this.objBProvider.dea_expiry_date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtDEAExpiry").value);
    this.objBProvider.clia_expiry_date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtCliaExpiry").value);
    this.objBProvider.npi = this.inputForm.get("txtIndividualNPI").value;
    this.objBProvider.group_npi = this.inputForm.get("txtGroupNPI").value;

    this.objBProvider.taxonomy_id = this.inputForm.get("txtTaxonomyId").value;
    this.objBProvider.spi = this.inputForm.get("txtSPI").value;

    this.objBProvider.state_license = this.inputForm.get("txtlicenseState").value;
    this.objBProvider.spec_license = this.inputForm.get("txtLicenseSpec").value;

    this.objBProvider.organization_name = this.inputForm.get("txtOrgName").value;

    this.objBProvider.bill_address = this.inputForm.get("txtIndividualAddress").value;
    this.objBProvider.bill_city = this.inputForm.get("drpIndividualCity").value;
    this.objBProvider.bill_state = this.inputForm.get("txtIndividualState").value;
    this.objBProvider.bill_zip = this.inputForm.get("txtIndividualZip").value;

    this.objBProvider.billing_fax = this.inputForm.get("txtFax").value;
    this.objBProvider.billingprovidertype = this.inputForm.get("drpProviderType").value;

    this.objBProvider.federal_taxidnumbertype = this.inputForm.get("drpFedTaxType").value;
    this.objBProvider.federal_taxid = this.inputForm.get("txtFedTaxId").value;
    this.objBProvider.is_blocked = this.inputForm.get("chkDeactivate").value;


    this.objBProvider.pay_to_address = this.inputForm.get("txtIndividualPayToAddress").value;
    this.objBProvider.pay_to_city = this.inputForm.get("drpIndividualPayToCity").value;
    this.objBProvider.pay_to_state = this.inputForm.get("txtIndividualPayToState").value;
    this.objBProvider.pay_to_zip = this.inputForm.get("txtIndividualPayToZip").value;

    this.objBProvider.grp_taxonomy_id = this.inputForm.get("txtGroupTaxonomyid").value;
    this.objBProvider.tpi = this.inputForm.get("txtTPI").value;
    this.objBProvider.group_tpi = this.inputForm.get("txtGroupTPI").value;


    this.objBProvider.pay_to_address_grp = this.inputForm.get("txtGroupPayToAddress").value;
    this.objBProvider.pay_to_city_grp = this.inputForm.get("drpGroupPayToCity").value;
    this.objBProvider.pay_to_state_grp = this.inputForm.get("txtGroupPayToState").value;
    this.objBProvider.pay_to_zip_grp = this.inputForm.get("txtGroupPayToZip").value;

    this.objBProvider.bill_address_grp = this.inputForm.get("txtGroupAddress").value;
    this.objBProvider.bill_city_grp = this.inputForm.get("drpGroupCity").value;
    this.objBProvider.bill_state_grp = this.inputForm.get("txtGroupState").value;
    this.objBProvider.bill_zip_grp = this.inputForm.get("txtGroupZip").value;

    this.objBProvider.secondary_taxonomy_id = this.inputForm.get("txtSecondaryTaxonomyid").value;


    if (this.providerOperation == "new") {
      this.objBProvider.created_user = this.lookupList.logedInUser.user_name;
      this.objBProvider.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    } else {
      this.objBProvider.billing_provider_id = this.arrprovider[this.provierSelectedIndex].billing_provider_id;
      this.objBProvider.client_date_created = this.arrprovider[this.provierSelectedIndex].client_date_created;
      this.objBProvider.date_created = this.arrprovider[this.provierSelectedIndex].date_created;
      this.objBProvider.created_user = this.arrprovider[this.provierSelectedIndex].created_user;
    }

    this.objBProvider.modified_user = this.lookupList.logedInUser.user_name;
    this.objBProvider.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();




    this.setupService.saveSetupBillingProvider(this.objBProvider).subscribe(
      data => {
        debugger;
        this.saveProviderSuccess(data);
      },
      error => {
        this.saveProviderError(error);
      }
    );
  }
  saveProviderSuccess(data) {
    debugger;
    this.enableDisable('disable');
    this.isDisable = false;
    this.providerOperation = "";
    if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
      if (this.objBProvider.billing_provider_id == null || this.objBProvider.billing_provider_id == '') {
        // this.objProvider.provider_id=data['result'];
        // this.arrprovider.push(this.objProvider);
        this.getProviderList();
      }
      else {
        this.arrprovider[this.provierSelectedIndex].billingprovidertype = this.inputForm.get("drpProviderType").value;
        this.arrprovider[this.provierSelectedIndex].title = this.inputForm.get("txtTitle").value;
        this.arrprovider[this.provierSelectedIndex].first_name = this.inputForm.get("txtfirstName").value;
        this.arrprovider[this.provierSelectedIndex].last_name = this.inputForm.get("txtLastName").value;
        this.arrprovider[this.provierSelectedIndex].mname = this.inputForm.get("txtMName").value;
        this.arrprovider[this.provierSelectedIndex].dob = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtdob").value);
        this.arrprovider[this.provierSelectedIndex].ssn = this.inputForm.get("txtSSN").value;
        this.arrprovider[this.provierSelectedIndex].organization_name = this.inputForm.get("txtOrgName").value;
        this.arrprovider[this.provierSelectedIndex].phone_no = this.inputForm.get("txtPhone").value;
        this.arrprovider[this.provierSelectedIndex].billing_fax = this.inputForm.get("txtFax").value;
        this.arrprovider[this.provierSelectedIndex].email = this.inputForm.get("txtEmail").value;
        this.arrprovider[this.provierSelectedIndex].npi = this.inputForm.get("txtIndividualNPI").value;
        this.arrprovider[this.provierSelectedIndex].group_npi = this.inputForm.get("txtGroupNPI").value;
        this.arrprovider[this.provierSelectedIndex].federal_taxid = this.inputForm.get("txtFedTaxId").value;
        this.arrprovider[this.provierSelectedIndex].federal_taxidnumbertype = this.inputForm.get("drpFedTaxType").value;
        this.arrprovider[this.provierSelectedIndex].taxonomy_id = this.inputForm.get("txtTaxonomyId").value;
        this.arrprovider[this.provierSelectedIndex].grp_taxonomy_id = this.inputForm.get("txtGroupTaxonomyid").value;
        this.arrprovider[this.provierSelectedIndex].dea_no = this.inputForm.get("txtDEA").value;
        this.arrprovider[this.provierSelectedIndex].dea_expiry_date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtDEAExpiry").value);
        this.arrprovider[this.provierSelectedIndex].spi = this.inputForm.get("txtSPI").value;
        this.arrprovider[this.provierSelectedIndex].tpi = this.inputForm.get("txtTPI").value;
        this.arrprovider[this.provierSelectedIndex].group_tpi = this.inputForm.get("txtGroupTPI").value;

        this.arrprovider[this.provierSelectedIndex].bill_address = this.inputForm.get("txtIndividualAddress").value;
        this.arrprovider[this.provierSelectedIndex].bill_zip = this.inputForm.get("txtIndividualZip").value;
        this.arrprovider[this.provierSelectedIndex].bill_state = this.inputForm.get("txtIndividualState").value;
        this.arrprovider[this.provierSelectedIndex].bill_city = this.inputForm.get("drpIndividualCity").value;

        this.arrprovider[this.provierSelectedIndex].pay_to_address = this.inputForm.get("txtIndividualPayToAddress").value;
        this.arrprovider[this.provierSelectedIndex].pay_to_zip = this.inputForm.get("txtIndividualPayToZip").value;
        this.arrprovider[this.provierSelectedIndex].pay_to_state = this.inputForm.get("txtIndividualPayToState").value;
        this.arrprovider[this.provierSelectedIndex].pay_to_city = this.inputForm.get("drpIndividualPayToCity").value;

        this.arrprovider[this.provierSelectedIndex].bill_address_grp = this.inputForm.get("txtGroupAddress").value;
        this.arrprovider[this.provierSelectedIndex].bill_zip_grp = this.inputForm.get("txtGroupZip").value;
        this.arrprovider[this.provierSelectedIndex].bill_state_grp = this.inputForm.get("txtGroupState").value;
        this.arrprovider[this.provierSelectedIndex].bill_city_grp = this.inputForm.get("drpGroupCity").value;

        this.arrprovider[this.provierSelectedIndex].pay_to_address_grp = this.inputForm.get("txtGroupPayToAddress").value;
        this.arrprovider[this.provierSelectedIndex].pay_to_zip_grp = this.inputForm.get("txtGroupPayToZip").value;
        this.arrprovider[this.provierSelectedIndex].pay_to_state_grp = this.inputForm.get("txtGroupPayToState").value;
        this.arrprovider[this.provierSelectedIndex].pay_to_city_grp = this.inputForm.get("drpGroupPayToCity").value;

        this.arrprovider[this.provierSelectedIndex].state_license = this.inputForm.get("txtlicenseState").value;
        this.arrprovider[this.provierSelectedIndex].spec_license = this.inputForm.get("txtLicenseSpec").value;
        this.arrprovider[this.provierSelectedIndex].upin = this.inputForm.get("txtUPN").value;
        this.arrprovider[this.provierSelectedIndex].clia_number = this.inputForm.get("txtCliaNo").value;
        this.arrprovider[this.provierSelectedIndex].clia_expiry_date = this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtCliaExpiry").value);
        this.arrprovider[this.provierSelectedIndex].is_blocked = this.inputForm.get("chkDeactivate").value;

      }
      //this.provierSelectedIndex=0;
      //this.assignValues();
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Provider Save';
      modalRef.componentInstance.promptMessage = "Provider save successfully.";
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Provider Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveProviderError(error) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Provider Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Provider."
  }
  onCancel() {
    if (this.arrprovider != undefined && this.arrprovider != null) {
      this.provierSelectedIndex = 0;
      this.assignValues();
    }
    this.enableDisable('disable');
    this.isDisable = false;
    this.providerOperation = "";
  }
  onSelectionChange(index, obj) {
    this.provierSelectedIndex = index;
    this.assignValues();
  }

  zipFocusOut(zipCode: string, source) {
    debugger;
    if (zipCode != undefined) {
      if (zipCode.replace("-", "").length == 5 || zipCode.replace("-", "").length == 9) {
        this.getCityStateByZipCode(zipCode, source);
      }
      else {
        if (source == "ind") {
          (this.inputForm.get("drpIndividualCity") as FormControl).setValue(null);
          (this.inputForm.get("txtIndividualState") as FormControl).setValue(null);
        }
        else if (source == "indPay") {
          (this.inputForm.get("drpIndividualPayToCity") as FormControl).setValue(null);
          (this.inputForm.get("txtIndividualPayToState") as FormControl).setValue(null);
        }
        else if (source == "grp") {
          (this.inputForm.get("drpGroupCity") as FormControl).setValue(null);
          (this.inputForm.get("txtGroupState") as FormControl).setValue(null);
        }
        else if (source == "grpPay") {
          (this.inputForm.get("drpGroupPayToCity") as FormControl).setValue(null);
          (this.inputForm.get("txtGroupPayToState") as FormControl).setValue(null);
        }
      }
    }
    else {
      if (source == "ind") {
        (this.inputForm.get("drpIndividualCity") as FormControl).setValue(null);
        (this.inputForm.get("txtIndividualState") as FormControl).setValue(null);
      }
      else if (source == "indPay") {
        (this.inputForm.get("drpIndividualPayToCity") as FormControl).setValue(null);
        (this.inputForm.get("txtIndividualPayToState") as FormControl).setValue(null);
      }
      else if (source == "grp") {
        (this.inputForm.get("drpGroupCity") as FormControl).setValue(null);
        (this.inputForm.get("txtGroupState") as FormControl).setValue(null);
      }
      else if (source == "grpPay") {
        (this.inputForm.get("drpGroupPayToCity") as FormControl).setValue(null);
        (this.inputForm.get("txtGroupPayToState") as FormControl).setValue(null);
      }
    }
  }
  getCityStateByZipCode(zipCode, source) {
    this.generalService.getCityStateByZipCode(zipCode).subscribe(
      data => {
        if (source == "ind")
          this.lstZipCityState = data as Array<any>;
        else if (source == "indPay")
          this.lstPayToZipCityState = data as Array<any>;
        else if (source == "grp")
          this.lstGrpZipCityState = data as Array<any>;
        else if (source == "grpPay")
          this.lstGrpPayToZipCityState = data as Array<any>;

        if (source == "ind") {
          if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
            (this.inputForm.get("txtIndividualState") as FormControl).setValue(this.lstZipCityState[0].state);

            if (this.lstZipCityState.length > 1) {
              (this.inputForm.get("drpIndividualCity") as FormControl).setValue(null);
            }
            else if (this.lstZipCityState.length == 1) {
              (this.inputForm.get("drpIndividualCity") as FormControl).setValue(this.lstZipCityState[0].city);
            }
          }
        }
        else if (source == "indPay") {
          if (this.lstPayToZipCityState != null && this.lstPayToZipCityState.length > 0) {
            (this.inputForm.get("txtIndividualPayToState") as FormControl).setValue(this.lstPayToZipCityState[0].state);

            if (this.lstPayToZipCityState.length > 1) {
              (this.inputForm.get("drpIndividualPayToCity") as FormControl).setValue(null);
            }
            else if (this.lstPayToZipCityState.length == 1) {
              (this.inputForm.get("drpIndividualPayToCity") as FormControl).setValue(this.lstPayToZipCityState[0].city);
            }
          }
        }

        else if (source == "grp") {
          if (this.lstGrpZipCityState != null && this.lstGrpZipCityState.length > 0) {
            (this.inputForm.get("txtGroupState") as FormControl).setValue(this.lstGrpZipCityState[0].state);

            if (this.lstGrpZipCityState.length > 1) {
              (this.inputForm.get("drpGroupCity") as FormControl).setValue(null);
            }
            else if (this.lstGrpZipCityState.length == 1) {
              (this.inputForm.get("drpGroupCity") as FormControl).setValue(this.lstGrpZipCityState[0].city);
            }
          }
        }
        else if (source == "grpPay") {
          if (this.lstGrpPayToZipCityState != null && this.lstGrpPayToZipCityState.length > 0) {
            (this.inputForm.get("txtGroupPayToState") as FormControl).setValue(this.lstGrpPayToZipCityState[0].state);

            if (this.lstGrpPayToZipCityState.length > 1) {
              (this.inputForm.get("drpGroupPayToCity") as FormControl).setValue(null);
            }
            else if (this.lstGrpPayToZipCityState.length == 1) {
              (this.inputForm.get("drpGroupPayToCity") as FormControl).setValue(this.lstGrpPayToZipCityState[0].city);
            }
          }
        }
      },
      error => {
        this.getCityStateByZipCodeError(error);
      }
    );
  }

  getCityStateByZipCodeError(error) {
    //this.logMessage.log("getCityStateByZipCode Error." + error);
  }
}
