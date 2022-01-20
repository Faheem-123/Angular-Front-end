import { Component, OnInit, Input, Inject, HostListener } from '@angular/core';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { DecimalPipe } from '@angular/common';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { listFilterWithNumericCondition } from 'src/app/shared/list-filter-with-numeric-condition';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMCashRegisterAdd } from 'src/app/models/billing/orm-cash-register-add';
import { OrmClaimPaymentSave } from 'src/app/models/billing/orm-claim-payment-save';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { WrapperClaimPaymentSave } from 'src/app/models/billing/wrapper-claim-payment-save';

@Component({
  selector: 'post-patient-write-off',
  templateUrl: './post-patient-write-off.component.html',
  styleUrls: ['./post-patient-write-off.component.css']
})
export class PostPatientWriteOffComponent implements OnInit {

  @Input() openedClaimInfo: OpenedClaimInfo;

  lstClaimProcedures: Array<any>;

  isLoading: boolean = false;

  totalClaimDue: number = 0;
  totalWriteOffToPost: number = 0;

  formGroup: FormGroup;
  preLoadingCount: number = 0;

  constructor(private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private paymentService: PaymentService,
    private dateTimeUtil: DateTimeUtil,
    private decimalPipe: DecimalPipe,
    private ngbModal: NgbModal) { }

  ngOnInit() {
    this.isLoading = true;

    if (this.lookupList.lstPracticeWriteOffCodes == undefined || this.lookupList.lstPracticeWriteOffCodes.length == 0) {
      this.preLoadingCount++;
      this.getWriteOffCodes();
    }


    this.preLoadingCount++;
    this.getProceduresForPosting();

    this.formGroup = this.formBuilder.group({
      cmbWriteOff: this.formBuilder.control(null),
      txtComments: this.formBuilder.control(null, Validators.required)
    });
  }


  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}

  getWriteOffCodes() {

    this.paymentService.getWriteOffCodes(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.lstPracticeWriteOffCodes = data as Array<any>;

        this.preLoadingCount--;
        if (this.preLoadingCount <= 0) {
          this.assignValues();
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.ongetWriteOffCodesError(error);
      }
    );
  }

  ongetWriteOffCodesError(error) {
    this.logMessage.log("getWriteOffCodes Error.");
  }

  getProceduresForPosting() {

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.openedClaimInfo.patientId, option: "" },
      { name: "claim_id", value: this.openedClaimInfo.claimId, option: "" },
      { name: "dos", value: "", option: "" },
      { name: "provider_id", value: "", option: "" },
      { name: "location_id", value: "", option: "" },
      { name: "cash_register_id", value: "", option: "" }
    ];


    this.paymentService.getProceduresForPosting(searchCriteria).subscribe(
      data => {
        let claimProcedures: Array<any> = data as Array<any>;

        this.lstClaimProcedures = new listFilterWithNumericCondition().transform(claimProcedures, "cpt_balance", ">", 0);
        this.preLoadingCount--;
        if (this.preLoadingCount <= 0) {
          this.assignValues();
          this.isLoading = false;
        }

      },
      error => {
        this.getProceduresForPostingError(error);
        this.isLoading = false;
      }
    );
  }

  getProceduresForPostingError(error) {
    this.logMessage.log("getProceduresForPosting Error." + error);
  }

  assignValues() {

    this.totalClaimDue = 0;

    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      this.lstClaimProcedures.forEach(proc => {

        if (proc.cpt_balance != undefined && proc.cpt_balance != null) {

          let cptBalance = GeneralOperation.getCurrencyNumbersOnly(proc.cpt_balance);
          this.totalClaimDue += Number(cptBalance);
        }
      });

    }

  }

  formateCurrencyInputs(element: HTMLInputElement, claimProcId: number, feildeName: string) {

    let value: any = element.value;
    let formatedValue = "";
    if (!isNaN(value)) {

      formatedValue = this.decimalPipe.transform(value, ".2-2", "");
      element.value = formatedValue;
    }
    else {
      element.value = "";

    }

    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      this.lstClaimProcedures.forEach(proc => {

        if (proc.claim_procedures_id == claimProcId) {
          proc[feildeName] = formatedValue;
        }
      });

      this.calculateTotalPosting();
    }

  }

  calculateTotalPosting() {

    //this.totalClaimDue = 0;
    this.totalWriteOffToPost = 0;


    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      this.lstClaimProcedures.forEach(proc => {

        if (proc.write_off != undefined && proc.write_off != null) {

          let cptBalance = GeneralOperation.getCurrencyNumbersOnly(proc.cpt_balance);
          let writeOffAmount = GeneralOperation.getCurrencyNumbersOnly(proc.write_off);

          if (Number(writeOffAmount) != NaN && Number(writeOffAmount) > 0) {

            this.totalWriteOffToPost += Number(writeOffAmount);
          }


          if (cptBalance < writeOffAmount) {
            proc.invalid = true;
          }
          else {
            proc.invalid = false;
          }

        }
      });

    }
  }

  validateData(formData: any) {

    let strMsg: string = "";

    if (this.totalClaimDue == 0) {
      strMsg = "There is not due amount."
    }
    else if (this.totalWriteOffToPost == 0) {
      strMsg = "Please enter Write Off amount to post."
    }
    else if (this.lookupList.lstPracticeWriteOffCodes != undefined && this.lookupList.lstPracticeWriteOffCodes.length > 0 
      && formData.cmbWriteOff == undefined) {
      strMsg = "Please select Write Off Code."
    }
    else {
      let invalidCpts: string = "";
      if (this.lstClaimProcedures != undefined) {
        this.lstClaimProcedures.forEach(proc => {

          if (proc.invalid != undefined && proc.invalid == true) {
            if (invalidCpts != "") {
              invalidCpts += ",";
            }
            invalidCpts += proc.proc_code;
          }

        });
      }

      if (invalidCpts != "") {
        strMsg = "Write Off Amount can't exeed CPT Balance.<br>" + invalidCpts;
      }
    }

    if (strMsg != "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Post Patient Write Off', strMsg, AlertTypeEnum.DANGER)

      return false;
    }
    else {
      return true;
    }
  }
  onSubmit(formData: any) {

    if (this.validateData(formData)) {

      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

      let lstClaimPaymentSave: Array<OrmClaimPaymentSave>;
      let lstKV: Array<ORMKeyValue>;

      lstKV = new Array<ORMKeyValue>();
      lstKV.push(new ORMKeyValue("CLAIM_NOTE", formData.txtComments));
      lstKV.push(new ORMKeyValue("RESOLVE_CASH_REGISTER_ENTRY", true));



      let objCashReg: ORMCashRegisterAdd = new ORMCashRegisterAdd();
      objCashReg.dos = this.openedClaimInfo.dos;
      objCashReg.practice_id = this.lookupList.practiceInfo.practiceId;
      objCashReg.patient_id = this.openedClaimInfo.patientId;
      objCashReg.payment_method = "WRITE OFF";
      objCashReg.provider_id = this.openedClaimInfo.patientId;
      objCashReg.location_id = this.openedClaimInfo.locationId;
      objCashReg.copay_due = 0;
      objCashReg.selfpay_due = this.totalClaimDue;
      objCashReg.previous_balance_due = 0;
      objCashReg.copay_write_off = 0;
      objCashReg.selfpay_write_off = this.totalWriteOffToPost;
      objCashReg.prev_balance_write_off = 0;
      objCashReg.comments = formData.txtComments;
      objCashReg.created_user = this.lookupList.logedInUser.user_name;
      objCashReg.client_date_created = clientDateTime;
      objCashReg.modified_user = this.lookupList.logedInUser.user_name;
      objCashReg.client_date_modified = clientDateTime;
      objCashReg.system_ip = this.lookupList.logedInUser.systemIp;

      if (formData.cmbWriteOff != undefined) {
        objCashReg.write_off_code = formData.cmbWriteOff;
      }


      this.lstClaimProcedures.forEach(proc => {

        let writeOffAmount: number = GeneralOperation.getCurrencyNumbersOnly(proc.write_off);

        if (writeOffAmount > 0) {

          let objClaimPyment = new OrmClaimPaymentSave();

          objClaimPyment.claim_procedures_id = proc.claim_procedures_id;
          objClaimPyment.patient_id = this.openedClaimInfo.patientId;
          objClaimPyment.claim_id = this.openedClaimInfo.claimId;
          objClaimPyment.practice_id = this.lookupList.practiceInfo.practiceId;
          objClaimPyment.payment_source = "Patient";
          objClaimPyment.charged_procedure = proc.proc_code;
          objClaimPyment.paid_procedure = proc.proc_code;
          objClaimPyment.paid_amount = 0;
          objClaimPyment.writeoff_amount = writeOffAmount;
          objClaimPyment.eob_era_id_type = "CASH_REGISTER";
          objClaimPyment.created_user = this.lookupList.logedInUser.user_name;
          objClaimPyment.client_date_created = clientDateTime;
          objClaimPyment.modified_user = this.lookupList.logedInUser.user_name;
          objClaimPyment.client_date_modified = clientDateTime;
          objClaimPyment.system_ip = this.lookupList.logedInUser.systemIp;

          objClaimPyment.entry_type = "Patient Write Off";

          if (lstClaimPaymentSave == undefined) {
            lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
          }
          lstClaimPaymentSave.push(objClaimPyment);
        }
      });



      let wrapperClaimPaymentSave: WrapperClaimPaymentSave = new WrapperClaimPaymentSave(lstClaimPaymentSave, undefined, lstKV, objCashReg);

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

        GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash Register Payment', "There no Write Off Amount to post.", AlertTypeEnum.INFO)

      }

    }
  }

  saveClaimPaymentSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash Register Payment', data.response, AlertTypeEnum.DANGER)

    }
  }

  saveClaimPaymentError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash Register Payment', "An Error Occured while saving claim", AlertTypeEnum.DANGER)

  }

  /*

  postPatientWriteOff() {

    if (this.validateData()) {

      debugger;

      let lstClaimPaymentSave: Array<OrmClaimPaymentSave>;
      let lstKV: Array<ORMKeyValue>;

      if ((this.totalPendingPayment + this.totalPendingWriteOff + this.totalPendingPrevPayment + this.totalPendingPrevWriteOff)
        == (this.totalPaymentToPost + this.totalWriteOffToPost + this.totalPrevPaymentToPost + this.totalPrevWriteOffToPost)) {

        let ormKV: ORMKeyValue = new ORMKeyValue("RESOLVE_CASH_REGISTER_ENTRY", true);
        lstKV = new Array<ORMKeyValue>();
        lstKV.push(ormKV);
      }


      if (this.lstClaimProcedures != undefined) {

        let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

        this.lstClaimProcedures.forEach(proc => {

          let paid: number = GeneralOperation.getCurrencyNumbersOnly(proc.paid_amount);
          let writeOffAmount: number = GeneralOperation.getCurrencyNumbersOnly(proc.write_off);
          let prevPaidAmount: number = GeneralOperation.getCurrencyNumbersOnly(proc.prev_paid_amount);
          let prevWriteOffAmount: number = GeneralOperation.getCurrencyNumbersOnly(proc.prev_write_off);

          if (paid > 0 || writeOffAmount > 0) {

            let objClaimPyment = new OrmClaimPaymentSave();

            objClaimPyment.claim_procedures_id = proc.claim_procedures_id;
            objClaimPyment.patient_id = this.openedClaimInfo.patientId;
            objClaimPyment.claim_id = this.openedClaimInfo.claimId;
            objClaimPyment.practice_id = this.lookupList.practiceInfo.practiceId;
            objClaimPyment.payment_source = "Patient";
            objClaimPyment.charged_procedure = proc.proc_code;
            objClaimPyment.paid_procedure = proc.proc_code;

            if (this.checkNo != null && this.checkNo != "") {
              objClaimPyment.check_date = this.checkDate;
              objClaimPyment.check_number = this.checkNo;
            }

            objClaimPyment.paid_amount = paid;
            objClaimPyment.writeoff_amount = writeOffAmount;

            objClaimPyment.eob_era_id = this.selectedCashRegisterId
            objClaimPyment.eob_era_id_type = "CASH_REGISTER";

            objClaimPyment.created_user = this.lookupList.logedInUser.user_name;
            objClaimPyment.client_date_created = clientDateTime;
            objClaimPyment.modified_user = this.lookupList.logedInUser.user_name;
            objClaimPyment.client_date_modified = clientDateTime;
            objClaimPyment.system_ip = this.lookupList.logedInUser.systemIp;

            objClaimPyment.entry_type = "Cash Register";

            if (lstClaimPaymentSave == undefined) {
              lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
            }
            lstClaimPaymentSave.push(objClaimPyment);
          }

          if (prevPaidAmount > 0 || prevWriteOffAmount > 0) {

            let objClaimPyment = new OrmClaimPaymentSave();

            objClaimPyment.claim_procedures_id = proc.claim_procedures_id;
            objClaimPyment.patient_id = this.openedClaimInfo.patientId;
            objClaimPyment.claim_id = this.openedClaimInfo.claimId;
            objClaimPyment.practice_id = this.lookupList.practiceInfo.practiceId;
            objClaimPyment.payment_source = "Patient";
            objClaimPyment.charged_procedure = proc.proc_code;
            objClaimPyment.paid_procedure = proc.proc_code;

            if (this.checkNo != null && this.checkNo != "") {
              objClaimPyment.check_date = this.checkDate;
              objClaimPyment.check_number = this.checkNo;
            }

            objClaimPyment.paid_amount = prevPaidAmount;
            objClaimPyment.writeoff_amount = prevWriteOffAmount;

            objClaimPyment.eob_era_id = this.selectedCashRegisterId
            objClaimPyment.eob_era_id_type = "CASH_REGISTER";

            objClaimPyment.created_user = this.lookupList.logedInUser.user_name;
            objClaimPyment.client_date_created = clientDateTime;
            objClaimPyment.modified_user = this.lookupList.logedInUser.user_name;
            objClaimPyment.client_date_modified = clientDateTime;
            objClaimPyment.system_ip = this.lookupList.logedInUser.systemIp;

            objClaimPyment.entry_type = "Previous Balance";

            if (lstClaimPaymentSave == undefined) {
              lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
            }
            lstClaimPaymentSave.push(objClaimPyment);
          }

        });


      }


      let wrapperClaimPaymentSave: WrapperClaimPaymentSave = new WrapperClaimPaymentSave(lstClaimPaymentSave, undefined, lstKV);

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

        GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash Register Payment', "There no amount to post.", AlertTypeEnum.INFO)

      }
    }
  }

  saveClaimPaymentSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash Register Payment', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveClaimPaymentError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash Register Payment', "An Error Occured while saving Patient Refund", AlertTypeEnum.DANGER)
  }

  

  }

  */
}
