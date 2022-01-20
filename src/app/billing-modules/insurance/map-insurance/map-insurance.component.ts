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
import { ORMinsurancesetup } from 'src/app/models/setting/orm-insurance-setup';

@Component({
  selector: 'map-insurance',
  templateUrl: './map-insurance.component.html',
  styleUrls: ['./map-insurance.component.css']
})
export class MapInsuranceComponent implements OnInit {
  listInsurance;
  selectedInsuranceRow;
  listInsType;
  selectedGroupRow;
  listInspayer;
  selectedPayerRow;
  constructor(private insService: InsurancesService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  , private formBuilder: FormBuilder, private logMessage: LogMessage, private dateTimeUtil: DateTimeUtil,
  private modalService: NgbModal, private generalService: GeneralService) { }

  ngOnInit() {
    this.getClient_Insurances();
    this.getInsuranceTypes();
  }
  onRefresh()
  {
    this.getClient_Insurances();
    this.getInsuranceTypes();
  }
  getClient_Insurances() {

    this.insService.getClient_Insurances("IHC CLIENTS").subscribe(
      data => {
        this.listInsurance = data as Array<any>;
        if(this.listInsurance.length>0)
          this.selectedInsuranceRow=0;
      },
      error => {
        this.logMessage.log("getClient_Insurances Error." + error);
      }
    );
  }
  onInsuranceSelection(event: any, index){
    debugger;
    this.listInsurance[index].chk=event.target.checked;
  }
  onInsuranceSelectionChange(index,obj){
    this.selectedInsuranceRow = index;
  }
  getInsuranceTypes()
  {
    this.insService.getInsurancePayerTypes()
      .subscribe(
        data => {
          this.listInsType = data;
          this.selectedGroupRow=0;
          if(this.listInsType.length>0)
          {
            this.getPayerTypePayer(this.listInsType[this.selectedGroupRow].payertype_id)
          }
          },
        error => {
          this.logMessage.log("An Error Occured while getting getInsurancePayerTypes list.")
        }
      );
  }
  getPayerTypePayer(id)
  {
    this.insService.getPayerTypePayer(id)
      .subscribe(
        data => {
          this.listInspayer = data;
          this.selectedPayerRow=0;         
          },
        error => {
          this.logMessage.log("An Error Occured while getting getPayerTypePayer list.")
          // this.isLoading = false;
        }
      );
  }
  onTypeselectionChange(index: number) {
    this.selectedGroupRow = index;
    this.getPayerTypePayer(this.listInsType[this.selectedGroupRow].payertype_id)
  }
  onpayerselectionChange(index: number) {
    this.selectedPayerRow = index;
  }
  onMapInsurance()
  {
    debugger; 
    if(this.listInspayer==null || this.listInspayer.length==0 || this.selectedPayerRow<0)
    {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select payer from Payer Name.", 'warning')
			return;
    }
    let lstSave: Array<ORMinsurancesetup>=new Array;
    for(let i=0;i<this.listInsurance.length;i++)
    {
      if (this.listInsurance[i].chk == true) {
        debugger; 
        let objORMInsurance_setup = new ORMinsurancesetup();

        objORMInsurance_setup.name = this.listInsurance[i].name;
        objORMInsurance_setup.address = this.listInsurance[i].address;
        objORMInsurance_setup.city = this.listInsurance[i].city;
        objORMInsurance_setup.zip = this.listInsurance[i].zip;
        objORMInsurance_setup.state = this.listInsurance[i].state;
        objORMInsurance_setup.phone = this.listInsurance[i].phone;
        objORMInsurance_setup.fax = this.listInsurance[i].fax;
        objORMInsurance_setup.email = this.listInsurance[i].email;
        objORMInsurance_setup.website = this.listInsurance[i].website;
        objORMInsurance_setup.attn = this.listInsurance[i].attn;
        objORMInsurance_setup.practice_id = this.listInsurance[i].practice_id;
        objORMInsurance_setup.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString()
        objORMInsurance_setup.modified_user = this.lookupList.logedInUser.user_name;

        objORMInsurance_setup.created_user = this.listInsurance[i].created_user;
        objORMInsurance_setup.client_date_created = this.listInsurance[i].client_date_created;
        objORMInsurance_setup.insurance_id = this.listInsurance[i].insurance_id;
        objORMInsurance_setup.date_created = this.listInsurance[i].date_created;
        objORMInsurance_setup.deleted = false;
        objORMInsurance_setup.payerid = this.listInspayer[this.selectedPayerRow].payer_id;

        lstSave.push(objORMInsurance_setup);
      }
    }
    this.insService.saveInsuranceslist(lstSave).subscribe(
      data => {
       // this.saveInsuranceSuccess(data);
       this.getClient_Insurances();
      },
      error => {
        //this.saveInsuranceError(error);
      }
    );
    
  }
}
