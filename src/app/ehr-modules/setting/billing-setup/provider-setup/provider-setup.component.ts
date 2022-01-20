import { Component, OnInit, Inject } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LogMessage } from 'src/app/shared/log-message';
import { ORMSaveSetupProvider } from 'src/app/models/setting/ORMSaveSetupProvider';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ServiceResponseStatusEnum, PromptResponseEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralService } from 'src/app/services/general/general.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'provider-setup',
  templateUrl: './provider-setup.component.html',
  styleUrls: ['./provider-setup.component.css']
})
export class ProviderSetupComponent implements OnInit {
  inputForm:FormGroup;
  arrprovider;
  provierSelectedIndex;
  providerOperation='';
  isDisable=false;
  lstZipCityState: Array<any>;
  constructor(private setupService: SetupService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  ,private formBuilder: FormBuilder,private logMessage: LogMessage,private dateTimeUtil: DateTimeUtil,
  private modalService: NgbModal,private generalService: GeneralService) { }

  ngOnInit() {
    this.getProviderList() ;
    this.buildForm();
    this.enableDisable('disable');
  }
  enableDisable(value)
  {
    if(value=='disable')
      this.inputForm.disable();
    else
      this.inputForm.enable();
  }
  getProviderList() {

    this.setupService.getSetupProvider(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.arrprovider = data as Array<any>;
        if(this.arrprovider.length>0)
        {
          this.provierSelectedIndex=0;
          this.assignValues();

        }
      },
      error => {
        this.logMessage.log("getSetupProvider Error." + error);
      }
    );
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({  
      txtfirstName: this.formBuilder.control(null, Validators.required),
      txtMName: this.formBuilder.control(null),
      txtlastName: this.formBuilder.control(null, Validators.required),
      txtTitle: this.formBuilder.control(null),
      txtDob: this.formBuilder.control(null, Validators.required),
      txtSSN: this.formBuilder.control(null),
      txtAddress1: this.formBuilder.control(null, Validators.required),
      txtZip: this.formBuilder.control(null, Validators.required),
      drpCity: this.formBuilder.control(null, Validators.required),
      txtState: this.formBuilder.control(null, Validators.required),
      txtAddress2: this.formBuilder.control(null),
      txtHomePhone: this.formBuilder.control(null),
      txtOfficePhone: this.formBuilder.control(null, Validators.required),
      txtCellPhone: this.formBuilder.control(null, Validators.required),
      txtEmail: this.formBuilder.control(null),
      txtFax: this.formBuilder.control(null),
      txtStateLicense: this.formBuilder.control(null),
      txtSPI: this.formBuilder.control(null),
      txtDEA: this.formBuilder.control(null),
      txtNPI: this.formBuilder.control(null, Validators.required),
      txtSpecLicense: this.formBuilder.control(null),
      txtUPN: this.formBuilder.control(null),
      txtDEAExpiry: this.formBuilder.control(null),
      txtCLIA: this.formBuilder.control(null),
      txtCLIAExpiry: this.formBuilder.control(null),
      txtTaxonomy: this.formBuilder.control(null),
      chkIsAttending: this.formBuilder.control(null),
      chkIsOperating: this.formBuilder.control(null),
      chkIsDeactivatePrescription: this.formBuilder.control(null),
      chkIsDeactivate: this.formBuilder.control(null),

    });
  }
  clearFields()
  {
    this.inputForm.reset();
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  assignValues(){
    debugger;
    (this.inputForm.get("txtfirstName") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].first_name);
    (this.inputForm.get("txtMName") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].mname);
    (this.inputForm.get("txtlastName") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].last_name);
    (this.inputForm.get("txtTitle") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].title);
    (this.inputForm.get("txtDob") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString( this.arrprovider[this.provierSelectedIndex].dob, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("txtSSN") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].ssn);
    (this.inputForm.get("txtAddress1") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].address);
    (this.inputForm.get("txtZip") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].zip);
    this.zipFocusOut(this.arrprovider[this.provierSelectedIndex].zip);
    //(this.inputForm.get("drpCity") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].city);
    //(this.inputForm.get("txtState") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].state);
    (this.inputForm.get("txtAddress2") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].address2);
    (this.inputForm.get("txtHomePhone") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].home_phone);
    (this.inputForm.get("txtOfficePhone") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].phone_no);
    (this.inputForm.get("txtCellPhone") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].cell_phone);
    (this.inputForm.get("txtEmail") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].email);
    (this.inputForm.get("txtFax") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].fax);
    (this.inputForm.get("txtStateLicense") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].state_license);
    (this.inputForm.get("txtSPI") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].spi);
    (this.inputForm.get("txtDEA") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].dea_no);
    (this.inputForm.get("txtNPI") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].npi);
    (this.inputForm.get("txtSpecLicense") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].spec_license);
    
    (this.inputForm.get("txtUPN") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].upin);
    (this.inputForm.get("txtDEAExpiry") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].dea_expiry_date==""?null:this.dateTimeUtil.getDateModelFromDateString(this.arrprovider[this.provierSelectedIndex].dea_expiry_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("txtCLIA") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].clia_number);
    (this.inputForm.get("txtCLIAExpiry") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].clia_expiry_date==""?null:this.dateTimeUtil.getDateModelFromDateString(this.arrprovider[this.provierSelectedIndex].clia_expiry_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("txtTaxonomy") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].taxonomy_id);

    (this.inputForm.get("chkIsAttending") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].is_attending);
    (this.inputForm.get("chkIsOperating") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].is_operating);
    (this.inputForm.get("chkIsDeactivatePrescription") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].is_prescription_disable);
    (this.inputForm.get("chkIsDeactivate") as FormControl).setValue(this.arrprovider[this.provierSelectedIndex].is_blocked);
  }
  onAddNew(){
  
    this.providerOperation="new";
    this.clearFields();
    this.enableDisable('enable');
    (this.inputForm.get("chkIsAttending") as FormControl).setValue(true);
    this.isDisable  =true;
  }
  onEdit(obj)
  {
    this.enableDisable('enable');  
    this.isDisable  =true;
    this.providerOperation="Edit";
  }
  onDelete(obj)
  {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.arrprovider[this.provierSelectedIndex].provider_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.setupService.deleteSetupProvider(deleteRecordData)
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
        if (result === PromptResponseEnum.OK) { 

        }
      }
        , (reason) => {
        });
    }
    else {
      this.arrprovider.splice(this.provierSelectedIndex,1);
      if(this.arrprovider.length>0)
      {
        this.provierSelectedIndex=0;
        this.assignValues();
      }
    }
  }
  validate(){
    if((this.inputForm.get('txtfirstName') as FormControl).value=="" || (this.inputForm.get('txtfirstName') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter First Name.",'warning')
      return false;
    }
    if((this.inputForm.get('txtlastName') as FormControl).value=="" || (this.inputForm.get('txtlastName') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Last Name.",'warning')
      return false;
    }
    if((this.inputForm.get('txtDob') as FormControl).value=="" || (this.inputForm.get('txtDob') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter DOB.",'warning')
      return false;
    }
    if((this.inputForm.get('txtAddress1') as FormControl).value=="" || (this.inputForm.get('txtAddress1') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Address.",'warning')
      return false;
    }
    if((this.inputForm.get('txtZip') as FormControl).value=="" || (this.inputForm.get('txtZip') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Zip.",'warning')
      return false;
    }
    if((this.inputForm.get('drpCity') as FormControl).value=="" || (this.inputForm.get('drpCity') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please select City.",'warning')
      return false;
    }
    if((this.inputForm.get('txtState') as FormControl).value=="" || (this.inputForm.get('txtState') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter State.",'warning')
      return false;
    }
    if((this.inputForm.get('txtOfficePhone') as FormControl).value=="" || (this.inputForm.get('txtOfficePhone') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Office Phone.",'warning')
      return false;
    }
    if((this.inputForm.get('txtCellPhone') as FormControl).value=="" || (this.inputForm.get('txtCellPhone') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter Cell Phone.",'warning')
      return false;
    }
    if((this.inputForm.get('txtNPI') as FormControl).value=="" || (this.inputForm.get('txtNPI') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please enter NPI.",'warning')
      return false;
    }
    return true;
   }
   
  objProvider:ORMSaveSetupProvider;
  onSave(){
          if(this.validate()==false)
          return;
          
        this.objProvider=new ORMSaveSetupProvider;
        this.objProvider.first_name=this.inputForm.get("txtfirstName").value;
				this.objProvider.mname=this.inputForm.get("txtMName").value;
				this.objProvider.last_name=this.inputForm.get("txtlastName").value;
				this.objProvider.dob=this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtDob").value);
				this.objProvider.title=this.inputForm.get("txtTitle").value;
				this.objProvider.ssn=this.inputForm.get("txtSSN").value;
				this.objProvider.address=this.inputForm.get("txtAddress1").value;
				this.objProvider.address2=this.inputForm.get("txtAddress2").value;
				this.objProvider.city=this.inputForm.get("drpCity").value;
				this.objProvider.state=this.inputForm.get("txtState").value;
				this.objProvider.zip=this.inputForm.get("txtZip").value;
				this.objProvider.home_phone=this.inputForm.get("txtHomePhone").value;
				this.objProvider.phone_no=this.inputForm.get("txtOfficePhone").value;
				this.objProvider.cell_phone=this.inputForm.get("txtCellPhone").value;
				this.objProvider.fax_no=this.inputForm.get("txtFax").value;
				this.objProvider.email=this.inputForm.get("txtEmail").value;
				this.objProvider.upin=this.inputForm.get("txtUPN").value;
				this.objProvider.dea_no=this.inputForm.get("txtDEA").value;
				this.objProvider.clia_number=this.inputForm.get("txtCLIA").value;
				this.objProvider.dea_expiry_date=this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtDEAExpiry").value);
				this.objProvider.clia_expiry_date=this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtCLIAExpiry").value);
				this.objProvider.npi=this.inputForm.get("txtNPI").value;
				this.objProvider.taxonomy_id=this.inputForm.get("txtTaxonomy").value;
				this.objProvider.spi=this.inputForm.get("txtSPI").value;
				this.objProvider.state_license=this.inputForm.get("txtStateLicense").value;
				this.objProvider.spec_license=this.inputForm.get("txtSpecLicense").value;
				this.objProvider.is_blocked=this.inputForm.get("chkIsDeactivate").value;
				this.objProvider.is_prescription_disable=this.inputForm.get("chkIsDeactivatePrescription").value;
				this.objProvider.is_attending=this.inputForm.get("chkIsAttending").value;
        this.objProvider.is_operating=this.inputForm.get("chkIsOperating").value;
        debugger;
				if(this.providerOperation=="new"){
					this.objProvider.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
					this.objProvider.created_user=this.lookupList.logedInUser.user_name;
				}else{
          this.objProvider.provider_id=this.arrprovider[this.provierSelectedIndex].provider_id;
					this.objProvider.client_date_created=this.arrprovider[this.provierSelectedIndex].client_date_created;
					this.objProvider.date_created=this.arrprovider[this.provierSelectedIndex].date_created;
					this.objProvider.created_user=this.arrprovider[this.provierSelectedIndex].created_user;
				}
				this.objProvider.modified_user=this.lookupList.logedInUser.user_name;
        this.objProvider.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
        this.objProvider.practice_id=this.lookupList.practiceInfo.practiceId.toString();

        this.setupService.saveSetupProvider(this.objProvider).subscribe(
          data => {
            debugger;
            this.saveProviderSuccess(data);
          },
          error => {
            this.saveProviderError(error);
          }
        );
  }
  saveProviderSuccess(data)
  {
    debugger;
    this.enableDisable('disable');    
    this.isDisable =false;
    this.providerOperation="";
    if (data['status'] === ServiceResponseStatusEnum.SUCCESS) 
    {
      if(this.objProvider.provider_id==null || this.objProvider.provider_id=='')
      {
        // this.objProvider.provider_id=data['result'];
        // this.arrprovider.push(this.objProvider);
        this.getProviderList() ;
      }
      else{
        this.arrprovider[this.provierSelectedIndex].first_name=this.inputForm.get("txtfirstName").value;
				this.arrprovider[this.provierSelectedIndex].mname=this.inputForm.get("txtMName").value;
				this.arrprovider[this.provierSelectedIndex].last_name=this.inputForm.get("txtlastName").value;
				this.arrprovider[this.provierSelectedIndex].dob=this.dateTimeUtil.getStringDateFromDateModel(this.inputForm.get("txtDob").value);
				this.arrprovider[this.provierSelectedIndex].title=this.inputForm.get("txtTitle").value;
				this.arrprovider[this.provierSelectedIndex].ssn=this.inputForm.get("txtSSN").value;
				this.arrprovider[this.provierSelectedIndex].address=this.inputForm.get("txtAddress1").value;
				this.arrprovider[this.provierSelectedIndex].address2=this.inputForm.get("txtAddress2").value;
				this.arrprovider[this.provierSelectedIndex].city=this.inputForm.get("drpCity").value;
				this.arrprovider[this.provierSelectedIndex].state=this.inputForm.get("txtState").value;
				this.arrprovider[this.provierSelectedIndex].zip=this.inputForm.get("txtZip").value;
				this.arrprovider[this.provierSelectedIndex].home_phone=this.inputForm.get("txtHomePhone").value;
				this.arrprovider[this.provierSelectedIndex].phone_no=this.inputForm.get("txtOfficePhone").value;
				this.arrprovider[this.provierSelectedIndex].cell_phone=this.inputForm.get("txtCellPhone").value;
				this.arrprovider[this.provierSelectedIndex].fax_no=this.inputForm.get("txtFax").value;
				this.arrprovider[this.provierSelectedIndex].email=this.inputForm.get("txtEmail").value;
				this.arrprovider[this.provierSelectedIndex].upin=this.inputForm.get("txtUPN").value;
				this.arrprovider[this.provierSelectedIndex].dea_no=this.inputForm.get("txtDEA").value;
				this.arrprovider[this.provierSelectedIndex].clia_number=this.inputForm.get("txtCLIA").value;
				this.arrprovider[this.provierSelectedIndex].dea_expiry_date=this.inputForm.get("txtDEAExpiry").value;
				this.arrprovider[this.provierSelectedIndex].clia_expiry_date=this.inputForm.get("txtCLIAExpiry").value;
				this.arrprovider[this.provierSelectedIndex].npi=this.inputForm.get("txtNPI").value;
				this.arrprovider[this.provierSelectedIndex].taxonomy_id=this.inputForm.get("txtTaxonomy").value;
				this.arrprovider[this.provierSelectedIndex].spi=this.inputForm.get("txtSPI").value;
				this.arrprovider[this.provierSelectedIndex].state_license=this.inputForm.get("txtStateLicense").value;
				this.arrprovider[this.provierSelectedIndex].spec_license=this.inputForm.get("txtSpecLicense").value;
				this.arrprovider[this.provierSelectedIndex].is_blocked=this.inputForm.get("chkIsDeactivate").value;
				this.arrprovider[this.provierSelectedIndex].is_prescription_disable=this.inputForm.get("chkIsDeactivatePrescription").value;
				this.arrprovider[this.provierSelectedIndex].is_attending=this.inputForm.get("chkIsAttending").value;
        this.arrprovider[this.provierSelectedIndex].is_operating=this.inputForm.get("chkIsOperating").value;
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
  saveProviderError(error)
  {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Provider Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Provider."
  }
  onCancel(){
    if(this.arrprovider!=undefined && this.arrprovider!=null)
    {
      this.provierSelectedIndex=0;
      this.assignValues();
    }
    this.enableDisable('disable');    
    this.isDisable  =false;
    this.providerOperation="";
  }
  onSelectionChange(index,obj){
    this.provierSelectedIndex=index;
    this.assignValues();
    }
    
    zipFocusOut(zipCode: string) {
      debugger;
          if (zipCode != undefined) {
              if (zipCode.replace("-", "").length == 5 || zipCode.replace("-", "").length == 9) {
                  this.getCityStateByZipCode(zipCode);
              }
          }
      }
  getCityStateByZipCode(zipCode) {
    this.generalService.getCityStateByZipCode(zipCode).subscribe(
        data => {
            this.lstZipCityState = data as Array<any>;
            if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
                
              (this.inputForm.get("txtState") as FormControl).setValue(this.lstZipCityState[0].state);
              
                if (this.lstZipCityState.length > 1) {
                    (this.inputForm.get("drpCity") as FormControl).setValue(null);
                }
                else if (this.lstZipCityState.length == 1) {
                    (this.inputForm.get("drpCity") as FormControl).setValue(this.lstZipCityState[0].city);
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
