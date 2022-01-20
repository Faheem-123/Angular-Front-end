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
import { InsurancesService } from 'src/app/services/insurances.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMSaveProvider_Payers } from 'src/app/models/billing/ORMSaveProvider_Payers';


@Component({
  selector: 'provider-payers',
  templateUrl: './provider-payers.component.html',
  styleUrls: ['./provider-payers.component.css']
})
export class ProviderPayersComponent implements OnInit {
  frmInput:FormGroup;
  arrprovider;
  arrproviderPayer;
  arrproviderModifier;
  selectedProviderRow=0;
  selectedPayerRow=0;
  operation="";
  isDisable=false;
  payerId="";
  showPayerSearch=false;
  constructor(private setupService: SetupService, private insService: InsurancesService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  , private formBuilder: FormBuilder, private logMessage: LogMessage, private dateTimeUtil: DateTimeUtil,
  private modalService: NgbModal, private generalService: GeneralService) { }

  ngOnInit() {
    this.buildForm();
    this.getProviderList();
    this.getProviderModifier();
    this.enableDisable('disable');
  }
  onRefresh()
  {
    this.getProviderList();
    this.getProviderModifier();
    this.enableDisable('disable');
  }
  buildForm() {
    this.frmInput = this.formBuilder.group({
      txtPayerSearch: this.formBuilder.control(""),
      txtProviderNumber: this.formBuilder.control(""),
      drpType: this.formBuilder.control(""),
      txtFederalTaxId: this.formBuilder.control(""),
      drpFederalTaxIdType: this.formBuilder.control(""),
      txtHacfaBox: this.formBuilder.control(""),
      txtEffectiveDate: this.formBuilder.control(""),
      txtValidationDate: this.formBuilder.control(""),
      txtValidationExpiryDate: this.formBuilder.control("")
    });
  }
  getProviderModifier() {
    this.insService.getProviderModifier().subscribe(
      data => {
        this.arrproviderModifier = data as Array<any>;
      },
      error => {
        this.logMessage.log("getProviderModifier Error." + error);
      }
    );
  }
  getProviderList() {

    this.setupService.getSetupBillingProvider(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.arrprovider = data as Array<any>;
        if (this.arrprovider.length > 0) {
          this.selectedProviderRow = 0;
          this.getProviderPayer(this.arrprovider[this.selectedProviderRow].billing_provider_id);
        }
      },
      error => {
        this.logMessage.log("Billing Provider Error." + error);
      }
    );
  }
  onProviderSelectionChange(index,obj)
  {
    this.selectedProviderRow = index;
    this.getProviderPayer(this.arrprovider[this.selectedProviderRow].billing_provider_id);
  }
  getProviderPayer(id) {
    debugger;
    this.insService.getProviderPayer(id).subscribe(
      data => {
        this.arrproviderPayer = data as Array<any>;
        if (this.arrproviderPayer.length > 0) {
          this.selectedPayerRow = 0;
          this.assignValues();
        }
        else{
          this.clearFields();
          this.box33_Change("");
          this.payerId="";
        }
      },
      error => {
        this.logMessage.log("getProviderPayer Error." + error);
      }
    );
  }
  onProviderPayerSelectionChange(indx,obj)
  {
    this.selectedPayerRow = indx;
    this.assignValues();
  }
  assignValues(){
    (this.frmInput.get("txtPayerSearch") as FormControl).setValue(this.arrproviderPayer[this.selectedPayerRow].payer_name);
    (this.frmInput.get("txtProviderNumber") as FormControl).setValue(this.arrproviderPayer[this.selectedPayerRow].provider_number);
    (this.frmInput.get("drpType") as FormControl).setValue(this.arrproviderPayer[this.selectedPayerRow].provider_modifier_code);
    (this.frmInput.get("txtFederalTaxId") as FormControl).setValue(this.arrproviderPayer[this.selectedPayerRow].provider_identification_number);
    (this.frmInput.get("drpFederalTaxIdType") as FormControl).setValue(this.arrproviderPayer[this.selectedPayerRow].provider_identification_number_type);
    (this.frmInput.get("txtHacfaBox") as FormControl).setValue(this.arrproviderPayer[this.selectedPayerRow].box_33_type);
    (this.frmInput.get("txtEffectiveDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrproviderPayer[this.selectedPayerRow].effective_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.frmInput.get("txtValidationDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrproviderPayer[this.selectedPayerRow].validation_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.frmInput.get("txtValidationExpiryDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.arrproviderPayer[this.selectedPayerRow].validation_expiry_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    this.box33_Change(this.arrproviderPayer[this.selectedPayerRow].box_33_type);
    this.payerId=this.arrproviderPayer[this.selectedPayerRow].payer_id;
  }
  lblBox33BillingName="";
  lblBox33BillingAddress="";
  lblBox33BillingCityZipState="";
  lblBox33a="";
  lblBox33b="";
  box33_Change(value)
  {
    debugger;
    switch(value)
				{
					case "GROUP":
						this.lblBox33BillingName=this.arrprovider[this.selectedProviderRow].organization_name;
						this.lblBox33BillingAddress=this.arrprovider[this.selectedProviderRow].bill_address_grp;
						this.lblBox33BillingCityZipState=this.arrprovider[this.selectedProviderRow].bill_city_grp+" "+this.arrprovider[this.selectedProviderRow].bill_state_grp+" "+this.arrprovider[this.selectedProviderRow].bill_zip_grp;
						this.lblBox33a=this.arrprovider[this.selectedProviderRow].group_npi;
						this.lblBox33b=this.arrprovider[this.selectedProviderRow].grp_taxonomy_id;
						break
					case "INDIVIDUAL":
						this.lblBox33BillingName=this.arrprovider[this.selectedProviderRow].last_name+", "+this.arrprovider[this.selectedProviderRow].first_name+" "+this.arrprovider[this.selectedProviderRow].mname;
						this.lblBox33BillingAddress=this.arrprovider[this.selectedProviderRow].bill_address;
						this.lblBox33BillingCityZipState=this.arrprovider[this.selectedProviderRow].bill_city+" "+this.arrprovider[this.selectedProviderRow].bill_state+" "+this.arrprovider[this.selectedProviderRow].bill_zip;
						this.lblBox33a=this.arrprovider[this.selectedProviderRow].npi;
						this.lblBox33b=this.arrprovider[this.selectedProviderRow].taxonomy_id;
						break
					default:
						this.lblBox33BillingName="";
						this.lblBox33BillingAddress="";
						this.lblBox33BillingCityZipState="";
						this.lblBox33a="";
						this.lblBox33b="";
						break
				}
  }
  enableDisable(value) {
    if (value == 'disable')
      this.frmInput.disable();
    else
      this.frmInput.enable();
  }
  clearFields() {
    this.frmInput.reset();
  }
  onAddNew(){
    this.operation = "new";
    this.clearFields();
    this.enableDisable('enable');
    this.isDisable = true;
  }
  onEdit(){
    this.enableDisable('enable');
    this.isDisable = true;
    this.operation = "edit";
  }
  onDelete(){
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.arrproviderPayer[this.selectedPayerRow].provider_payer_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.insService.deleteProviderPayer(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),

          );
      }
    }, (reason) => {
    });
  }
  onDeleteSuccessfully(data) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Provider Payer"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
        });
    }
    else {
      this.arrproviderPayer.splice(this.selectedPayerRow, 1);
      if(this.arrproviderPayer.length>0)
      {
        this.selectedPayerRow=0;
        this.assignValues();
      }
      else{
        this.clearFields();
      }
    }
  }
  onSave(){
    debugger;
    if (this.payerId == "") {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select insurance payer.", 'warning')
      return;
    }
    if ((this.frmInput.get('drpFederalTaxIdType') as FormControl).value == "" || (this.frmInput.get('drpFederalTaxIdType') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select Federal Tax ID No Type.", 'warning')
      return;
    }
    if ((this.frmInput.get('txtFederalTaxId') as FormControl).value == "" || (this.frmInput.get('txtFederalTaxId') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please enter Tax Identification No.", 'warning')
      return;
    }
    if(this.arrproviderPayer!=null && this.arrproviderPayer!=undefined && this.arrproviderPayer.length>0)
    {
      for (let i = 0; i < this.arrproviderPayer.length; i++) {
        if (this.arrproviderPayer[i].payer_id == this.payerId) {
          if (this.operation != "new" && this.selectedPayerRow >= 0 && this.payerId == this.arrproviderPayer[this.selectedPayerRow].payer_id) {
            continue;
          }
          else {
            GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Selected Insurance Payer already exist in the list", 'warning')
            return;
          }
        }
      }
    }
    let objORMProvider_Payers=new ORMSaveProvider_Payers();
				objORMProvider_Payers.practice_id=this.lookupList.practiceInfo.practiceId.toString();
				objORMProvider_Payers.payer_id=this.payerId;
				objORMProvider_Payers.billing_provider_id=this.arrprovider[this.selectedProviderRow].billing_provider_id;				
				objORMProvider_Payers.provider_number=this.frmInput.get("txtProviderNumber").value;
				//objORMProvider_Payers.group_number=txtgroupnumber.text;
				objORMProvider_Payers.deleted=false;
				objORMProvider_Payers.modified_user=this.lookupList.logedInUser.user_name
				objORMProvider_Payers.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();				
			//	if(cmbModifierType.selectedIndex>=0)
					objORMProvider_Payers.provider_modifier_code=this.frmInput.get("drpType").value;
				
				//if(cmbIdentifierType.selectedIndex>0)
					
				objORMProvider_Payers.provider_identification_number_type= this.frmInput.get("drpFederalTaxIdType").value; 
				//if(txtIdentificationNumber.text!="")

				objORMProvider_Payers.provider_identification_number= this.frmInput.get("txtFederalTaxId").value;
				
				objORMProvider_Payers.box_33_type=this.frmInput.get("txtHacfaBox").value;
				objORMProvider_Payers.effective_date= this.dateTimeUtil.getStringDateFromDateModel(this.frmInput.get("txtEffectiveDate").value)
				objORMProvider_Payers.validation_date= this.dateTimeUtil.getStringDateFromDateModel(this.frmInput.get("txtValidationDate").value)
				objORMProvider_Payers.validation_expiry_date= this.dateTimeUtil.getStringDateFromDateModel(this.frmInput.get("txtValidationExpiryDate").value)
				
				
				if(this.operation=="new")
				{
					objORMProvider_Payers.created_user=this.lookupList.logedInUser.user_name
					objORMProvider_Payers.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
				}
				else
				{
					objORMProvider_Payers.provider_payer_id= this.arrproviderPayer[this.selectedPayerRow].provider_payer_id;
					objORMProvider_Payers.created_user= this.arrproviderPayer[this.selectedPayerRow].created_user;
					objORMProvider_Payers.client_date_created= this.arrproviderPayer[this.selectedPayerRow].client_date_created;
					objORMProvider_Payers.date_created=this.arrproviderPayer[this.selectedPayerRow].date_created;					
        }
        
        this.insService.saveProviderPayer(objORMProvider_Payers).subscribe(
          data=>{
            this.saveProviderPayerSuccess(data);
          },
          error=>{
            this.saveProviderPayerError(error);
          }

        );
				
  }
  saveProviderPayerSuccess(data) {
    debugger;
    this.enableDisable('disable');
    this.isDisable = false;
    this.operation = "";
    if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
      if(this.arrprovider.length>0)
        this.getProviderPayer(this.arrprovider[this.selectedProviderRow].billing_provider_id);
  
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Payer Save';
      modalRef.componentInstance.promptMessage = "Payer save successfully.";
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Payer Save';
      modalRef.componentInstance.promptMessage = data.response;
    }
  }
  saveProviderPayerError(error) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Payer Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Payer."
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  onPayerSearchBlur() {
   
    if (this.payerId == undefined && this.showPayerSearch == false) {
      this.payerId="";
      this.frmInput.get("txtPayerSearch").setValue(null);
    }
  }
  
  onPayerSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPayerSearch = true;
    }
    else {
      this.showPayerSearch = false;
    }
  }

   
  openSelectPayer(patObject) { 
    debugger;
    this.payerId = patObject.payerid;
        
    (this.frmInput.get('txtPayerSearch') as FormControl).setValue(patObject.name+" ("+patObject.payer_number+")");

    this.showPayerSearch = false;
  }
  closePayerSearch() {
    this.showPayerSearch = false;
    this.onPayerSearchBlur();
  }
  onCancel()
  {
    this.enableDisable('disable');
    this.isDisable = false;
    this.operation = "";
  }
}
