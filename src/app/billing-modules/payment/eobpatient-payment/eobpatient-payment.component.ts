import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { OrmClaimPaymentSave } from 'src/app/models/billing/orm-claim-payment-save';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { WrapperClaimPaymentSave } from 'src/app/models/billing/wrapper-claim-payment-save';
import { AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'eobpatient-payment',
  templateUrl: './eobpatient-payment.component.html',
  styleUrls: ['./eobpatient-payment.component.css']
})
export class EOBPatientPaymentComponent implements OnInit {
  isLoading = false;
  patient_id;
  check_amount = 0;
  posted_amount = 0;
  pending_amount = 0;
  check_no;
  check_date;
  patient_name;
  eob_id;
  acClaims;
  acClaimsCPT;
  lstPostingDetails;
  searchForm: FormGroup;
  constructor(public activeModal: NgbActiveModal, private claimServices: ClaimService, private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil,
    private paymentService: PaymentService, private logMessage: LogMessage, @Inject(LOOKUP_LIST) public lookupList: LookupList, private modalService: NgbModal) { }

    @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
    }
    
  ngOnInit() {
    this.getClaimSummary();
    this.getPostedDetail();

    this.searchForm = this.formBuilder.group({
      cmbClaim: this.formBuilder.control('-1')
    })
  }
  getClaimSummary() {
    this.claimServices.getClaimSummary(this.patient_id, false, false).subscribe(
      data => {
        this.acClaims = data;
      },
      error => {

      }
    );
  }
  claim_id;
  onDropDownChange(value) {
    debugger;
    if (value != "Select Claim")
      this.getCPTsWithBalance(value);
    else
      this.acClaimsCPT = [];
  }
  getCPTsWithBalance(claim_id) {
    debugger;
    let searchCriteria: SearchCriteria;
    searchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;

    searchCriteria.criteria = '';
    searchCriteria.option = '';
    searchCriteria.param_list = [];
    searchCriteria.param_list.push({ name: "claim_id", value: claim_id, option: "" });
    searchCriteria.param_list.push({ name: "patient_id", value: this.patient_id, option: "" });


    this.claimServices.getCPTsWithBalance(searchCriteria).subscribe(
      data => {
        this.acClaimsCPT = data;
        this.calculateTransfer();
      },
      error => {

      }
    );
  }
  getPostedDetail() {

    this.paymentService.getClaimPostedPayment(this.eob_id, "EOB").subscribe(
      data => {

        debugger;
        this.lstPostingDetails = data as Array<any>;
        if (this.lstPostingDetails != null && this.lstPostingDetails.length > 0) {
          for (let i = 0; i < this.lstPostingDetails.length; i++) {
            this.posted_amount = Number((this.posted_amount + Number(this.lstPostingDetails[i].paid_amount)).toFixed(2));
          }
        }

        this.pending_amount = Number((this.check_amount - this.posted_amount).toFixed(2));
      },
      error => {
        this.getPostedDetailError(error);
      }
    );

  }
  getPostedDetailError(error: any) {
    this.logMessage.log("getPostedDetail:-" + error);
  }
  selectedCptRow = 0;
  onCptRowClick(index) {
    this.selectedCptRow = index;
  }
  total_paid_tansfer = 0;
  calculateTransfer() {
    this.total_paid_tansfer = 0;

    if (this.acClaimsCPT != null) {
      for (let i = 0; i < this.acClaimsCPT.length; i++) {
        if (parseFloat(this.acClaimsCPT[i].paid_amount) > 0) {
          this.total_paid_tansfer = parseFloat((this.total_paid_tansfer + parseFloat(parseFloat(this.acClaimsCPT[i].paid_amount).toFixed(2))).toFixed(2));
        }
      }
    }
  }
  ontxt_eob_post_patient_paymentChange(value, index) {
    this.acClaimsCPT[index].paid_amount = value;
    this.calculateTransfer();
  }
  onSave() {
    debugger;
    if ((this.searchForm.get('cmbClaim') as FormControl).value == "-1") {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select claim.", 'warning');
      return;
    }
    if (this.total_paid_tansfer <= 0) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "No Amount is entered to post.", 'warning');
      return;
    }
    if (Number(this.total_paid_tansfer.toFixed(2)) > Number(this.pending_amount.toFixed(2))) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Posting Amount can't exceed Actual Paid Amount.", 'warning');
      return;
    }

    let lstClaimPaymentSave: Array<OrmClaimPaymentSave>;
    let lstKV: Array<ORMKeyValue>;


    let strClaimNotes = "$" + this.total_paid_tansfer.toFixed(2) + " has been posted from Patient EOB EOB_ID:" + this.eob_id;
    let ormKV: ORMKeyValue = new ORMKeyValue("CLAIM_NOTE", strClaimNotes);
    lstKV = new Array<ORMKeyValue>();
    lstKV.push(ormKV);

    ormKV = new ORMKeyValue("IS_AUTO_CLAIM_NOTE", true);
    lstKV = new Array<ORMKeyValue>();
    lstKV.push(ormKV);



    if (this.acClaimsCPT != undefined) {
      this.acClaimsCPT.forEach(proc => {
          let paid: number = GeneralOperation.getCurrencyNumbersOnly(proc.paid_amount);
          let writeOffAmount: number = GeneralOperation.getCurrencyNumbersOnly(proc.write_off);
          if (paid > 0 || writeOffAmount > 0) 
          {
            let objClaimPyment = new OrmClaimPaymentSave();

            objClaimPyment.claim_procedures_id = proc.claim_procedures_id;
            objClaimPyment.patient_id = this.patient_id;
            objClaimPyment.claim_id = (this.searchForm.get('cmbClaim') as FormControl).value;
            objClaimPyment.practice_id = this.lookupList.practiceInfo.practiceId;
            objClaimPyment.payment_source = "Patient";
            objClaimPyment.charged_procedure = proc.proc_code;
            objClaimPyment.paid_procedure = proc.proc_code;

            if (this.check_no != null && this.check_no != "") {
              objClaimPyment.check_date = this.check_date;
              objClaimPyment.check_number = this.check_no;
            }

            objClaimPyment.paid_amount = paid;
            objClaimPyment.writeoff_amount = 0.00;

            objClaimPyment.eob_era_id = this.eob_id
            objClaimPyment.eob_era_id_type = "EOB";

            objClaimPyment.created_user = this.lookupList.logedInUser.user_name;
            objClaimPyment.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
            objClaimPyment.modified_user = this.lookupList.logedInUser.user_name;
            objClaimPyment.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
            objClaimPyment.system_ip = this.lookupList.logedInUser.systemIp;

            objClaimPyment.entry_type = "Payment";

            if (lstClaimPaymentSave == undefined) {
              lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
            }
            lstClaimPaymentSave.push(objClaimPyment);
          }
      });
    }

    let wrapperClaimPaymentSave: WrapperClaimPaymentSave = new WrapperClaimPaymentSave(lstClaimPaymentSave, undefined, lstKV, undefined);

    if (wrapperClaimPaymentSave != undefined && wrapperClaimPaymentSave.lstClaimPaymentSave != undefined && wrapperClaimPaymentSave.lstClaimPaymentSave.length > 0) {


      this.paymentService.saveClaimPayment(wrapperClaimPaymentSave).subscribe(
        data => {

          this.saveClaimPaymentSuccess(data);
        },
        error => {
          this.saveClaimPaymentError(error);
        }
      );

    }
    else {

      GeneralOperation.showAlertPopUp(this.modalService, 'Post Patient EOB Payment', "There no amount to post.", AlertTypeEnum.INFO)

    }
  }
  saveClaimPaymentSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.modalService, 'Post Patient EOB Payment', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveClaimPaymentError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.modalService, 'Post Patient EOB Payment', "An Error Occured while saving Patient EOB ", AlertTypeEnum.DANGER)
  }
}
