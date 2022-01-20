import { Component, OnInit, Input, Inject, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { RegExEnum, ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { DecimalPipe } from '@angular/common';
import { ORMCashRegisterModify } from 'src/app/models/billing/orm-cash-register-modify';


@Component({
  selector: 'cash-register-modify',
  templateUrl: './cash-register-modify.component.html',
  styleUrls: ['./cash-register-modify.component.css']
})
export class CashRegisterModifyComponent implements OnInit {

  @Input() cashRegEntry: any;

  appointmentId:number;
  
  providerName: string;
  locationName: string;
  formGroup: FormGroup;
  isLoading: boolean;
  lstErrors: Array<string>;
  preLoadingCount: number = 0;
  totalPaidTodayActual = 0;
  totalAdvanceAdjustedActual = 0;
  totalWriteOffActual = 0;
  copayPaidActual = 0;
  selfpayPaidActual = 0;
  prevBalPaidActual = 0;
  otherPaidActual = 0;
  advancePaidActual = 0;
  copayAdvanceAdjustedActual = 0;
  selfpayAdvanceAdjustedActual = 0;
  prevBalAdvanceAdjustedActual = 0;
  otherAdvanceAdjustedActual = 0;
  copayWriteOffActual = 0;
  selfpayWriteOffActual = 0;
  prevBalWriteOffActual = 0;

  totalPaidToday = 0;
  totalAdvanceAdjusted = 0;
  totalWriteOff = 0;

  copayPaid = 0;
  selfpayPaid = 0;
  prevBalPaid = 0;
  otherPaid = 0;
  advancePaid = 0;

  copayAdvanceAdjusted = 0;
  selfpayAdvanceAdjusted = 0;
  prevBalAdvanceAdjusted = 0;
  otherAdvanceAdjusted = 0;

  copayWriteOff = 0;
  selfpayWriteOff = 0;
  prevBalWriteOff = 0;

  constructor(public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private logMessage: LogMessage,
    private paymentService: PaymentService,
    private dateTimeUtil: DateTimeUtil,
    private decimalPipe: DecimalPipe,
    private ngbModal:NgbModal) {
  }
  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  ngOnInit() {
    debugger;
    this.isLoading = true;

    this.assignValues();

    this.locationName = this.cashRegEntry.location_name;
    this.providerName = this.cashRegEntry.provider_name;

    if (this.totalWriteOffActual > 0) {
      if (this.lookupList.lstPracticeWriteOffCodes == undefined || this.lookupList.lstPracticeWriteOffCodes.length == 0) {
        this.preLoadingCount++;
        this.getWriteOffCodes();
      }
    }

    this.buildForm();
    this.calculateTotalPaidToday();
    this.calculateTotalAdvanceAdjusted();
    this.calculateTotalWriteOff();

    if (this.preLoadingCount == 0) {
      this.isLoading = false;
    }

  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      cmbLocation: this.formBuilder.control(this.cashRegEntry.location_id),
      cmbProvider: this.formBuilder.control(this.cashRegEntry.provider_id),
      txtCopayPaid: this.formBuilder.control(this.cashRegEntry.copay_paid, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])
      ),
      txtSelfpayPaid: this.formBuilder.control(this.cashRegEntry.selfpay_paid, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtPrevBalPaid: this.formBuilder.control(this.cashRegEntry.previous_balance_paid, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtOtherPaid: this.formBuilder.control(this.cashRegEntry.other_paid, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtAdvancePaid: this.formBuilder.control(this.cashRegEntry.advance_paid, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),

      txtCopayAdvanceAdjusted: this.formBuilder.control(this.cashRegEntry.copay_advance_adjusted, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtSelfpayAdvanceAdjusted: this.formBuilder.control(this.cashRegEntry.selfpay_advance_adjusted, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtPrevBalAdvanceAdjusted: this.formBuilder.control(this.cashRegEntry.prev_balance_advance_adjusted, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtOtherAdvanceAdjusted: this.formBuilder.control(this.cashRegEntry.other_advance_adjusted, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),

      txtCopayWriteOff: this.formBuilder.control(this.cashRegEntry.copay_write_off, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtSelfpayWriteOff: this.formBuilder.control(this.cashRegEntry.selfpay_write_off, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),
      txtPrevBalWriteOff: this.formBuilder.control(this.cashRegEntry.prev_balance_write_off, Validators.compose([
        Validators.pattern(RegExEnum.Currency)])),

      txtComments: this.formBuilder.control(null, Validators.required),
      cmbWriteOff: this.formBuilder.control(this.cashRegEntry.write_off_code)
    });
  }

  assignValues() {

    if (this.cashRegEntry != undefined) {

      this.appointmentId=this.cashRegEntry.appointment_id;
      
      this.copayPaidActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.copay_paid);
      this.copayPaid = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.copay_paid);

      this.selfpayPaidActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.selfpay_paid);
      this.selfpayPaid = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.selfpay_paid);

      this.prevBalPaidActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.previous_balance_paid);
      this.prevBalPaid = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.previous_balance_paid);

      this.otherPaidActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.other_paid);
      this.otherPaid= GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.other_paid);

      this.advancePaidActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.advance_paid);
      this.advancePaid = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.advance_paid);

      this.copayAdvanceAdjustedActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.copay_advance_adjusted);
      this.copayAdvanceAdjusted = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.copay_advance_adjusted);

      this.selfpayAdvanceAdjustedActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.selfpay_advance_adjusted);
      this.selfpayAdvanceAdjusted = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.selfpay_advance_adjusted);

      this.prevBalAdvanceAdjustedActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.prev_balance_advance_adjusted);
      this.prevBalAdvanceAdjusted = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.prev_balance_advance_adjusted);
      
      this.otherAdvanceAdjustedActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.other_advance_adjusted);
      this.otherAdvanceAdjusted = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.other_advance_adjusted);

      this.copayWriteOffActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.copay_write_off);
      this.copayWriteOffActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.copay_write_off);

      this.selfpayWriteOffActual = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.selfpay_write_off);
      this.prevBalWriteOff = GeneralOperation.getCurrencyNumbersOnly(this.cashRegEntry.prev_balance_write_off);

      this.totalPaidTodayActual = this.copayPaidActual + this.selfpayPaidActual + this.prevBalPaidActual + this.otherPaidActual + this.advancePaidActual;
      this.totalPaidToday = this.copayPaidActual + this.selfpayPaidActual + this.prevBalPaidActual + this.otherPaidActual + this.advancePaidActual;

      this.totalAdvanceAdjustedActual = this.copayAdvanceAdjustedActual + this.selfpayAdvanceAdjustedActual + this.otherAdvanceAdjustedActual;
      this.totalAdvanceAdjusted = this.copayAdvanceAdjustedActual + this.selfpayAdvanceAdjustedActual + this.otherAdvanceAdjustedActual;

      this.totalWriteOffActual = this.copayWriteOffActual + this.selfpayWriteOffActual + this.prevBalWriteOffActual;
      this.totalWriteOff = this.copayWriteOffActual + this.selfpayWriteOffActual + this.prevBalWriteOffActual;
    }
  }



  getWriteOffCodes() {

    this.paymentService.getWriteOffCodes(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.lstPracticeWriteOffCodes = data as Array<any>;

        this.formGroup.get("cmbWriteOff").setValue(this.cashRegEntry.write_off_code);
        this.preLoadingCount--;
        if (this.preLoadingCount <= 0)
          this.isLoading = false;
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


  calculateTotalPaidToday() {
    debugger;

    let todaysCopayPaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtCopayPaid") as FormControl).value);
    let todaysSelfPaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtSelfpayPaid") as FormControl).value);

    let todaysPrevBalPaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtPrevBalPaid") as FormControl).value);
    let todaysOtherPaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtOtherPaid") as FormControl).value);
    let todaysAdvancePaid = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtAdvancePaid") as FormControl).value);

    this.totalPaidToday = Number(todaysCopayPaid) + Number(todaysSelfPaid) + Number(todaysPrevBalPaid) + Number(todaysOtherPaid) + Number(todaysAdvancePaid);

  }

  calculateTotalAdvanceAdjusted() {
    debugger;
    let copayAdjusted = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtCopayAdvanceAdjusted") as FormControl).value);

    let selfpayAdjusted = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtSelfpayAdvanceAdjusted") as FormControl).value);

    let prevBalAdjusted = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtPrevBalAdvanceAdjusted") as FormControl).value);

    let otherAdjusted = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtOtherAdvanceAdjusted") as FormControl).value);

    this.totalAdvanceAdjusted = Number(copayAdjusted) + Number(selfpayAdjusted) + Number(prevBalAdjusted) + Number(otherAdjusted);

  }
  calculateTotalWriteOff() {
    debugger;

    let copayWO = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtCopayWriteOff") as FormControl).value);
    let selfpayWO = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtSelfpayWriteOff") as FormControl).value);
    let prevBalAdWO = GeneralOperation.getCurrencyNumbersOnly((this.formGroup.get("txtPrevBalWriteOff") as FormControl).value);

    this.totalWriteOff = Number(copayWO) + Number(selfpayWO) + Number(prevBalAdWO);
  }


  formateCurrencyInputs(value: any, id: any) {
    debugger;
    if (!isNaN(value)) {
      let formatedValue = this.decimalPipe.transform(value, ".2-2", "");
      (this.formGroup.get(id) as FormControl).setValue(formatedValue);

      switch (id) {
        case "txtCopayPaid":
        case "txtSelfpayPaid":
        case "txtPrevBalPaid":
        case "txtOtherPaid":
        case "txtAdvancePaid":
          this.calculateTotalPaidToday();
          break;
        case "txtCopayAdvanceAdjusted":
        case "txtSelfpayAdvanceAdjusted":
        case "txtPrevBalAdvanceAdjusted":
        case "txtOtherAdvanceAdjusted":
          this.calculateTotalAdvanceAdjusted();
          break
        case "txtCopayWriteOff":
        case "txtSelfpayWriteOff":
        case "txtPrevBalWriteOff":
          this.calculateTotalWriteOff();
          break;
        default:
          break;
      }
    }
  }

  onSubmit(form:any) {

    this.lstErrors = undefined;//[];
    this.copayPaid = 0;
    this.selfpayPaid = 0;
    this.prevBalPaid = 0;
    this.otherPaid = 0;
    this.advancePaid = 0;

    this.copayAdvanceAdjusted = 0;
    this.selfpayAdvanceAdjusted = 0;
    this.prevBalAdvanceAdjusted = 0;
    this.otherAdvanceAdjusted = 0;

    this.copayWriteOff = 0;
    this.selfpayWriteOff = 0;
    this.prevBalWriteOff = 0;


    if (this.totalPaidTodayActual != this.totalPaidToday) {
      if (this.lstErrors == undefined)
        this.lstErrors = [];
      this.lstErrors.push("Modified Entry for Today's Payment is invalid.");
    }
    if (this.totalAdvanceAdjustedActual != this.totalAdvanceAdjusted) {
      if (this.lstErrors == undefined)
        this.lstErrors = [];
      this.lstErrors.push("Modified Entry for Advance Adjustment is invalid.");
    }
    if (this.totalWriteOffActual != this.totalWriteOff) {
      if (this.lstErrors == undefined)
        this.lstErrors = [];
      this.lstErrors.push("Modified Entry for Write Off is invalid.");
    }

    if (this.lstErrors != undefined && this.lstErrors.length > 0) {
      return;
    }

    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


    //this.copay = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtCopayDue));
    this.copayPaid =  Number(GeneralOperation.getCurrencyNumbersOnly(form.txtCopayPaid));
    this.selfpayPaid = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtSelfpayPaid));
    this.prevBalPaid = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtPrevBalPaid));
    this.otherPaid = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtOtherPaid));
    this.advancePaid = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtAdvancePaid));

    this.copayAdvanceAdjusted = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtCopayAdvanceAdjusted));
    this.selfpayAdvanceAdjusted = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtSelfpayAdvanceAdjusted));
    this.prevBalAdvanceAdjusted = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtPrevBalAdvanceAdjusted));
    this.otherAdvanceAdjusted = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtOtherAdvanceAdjusted));

    this.copayWriteOff = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtCopayWriteOff));
    this.selfpayWriteOff = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtSelfpayWriteOff));
    this.prevBalWriteOff = Number(GeneralOperation.getCurrencyNumbersOnly(form.txtPrevBalWriteOff));

    debugger;
    let ormCashRegisterModify: ORMCashRegisterModify = new ORMCashRegisterModify();

    ormCashRegisterModify.cash_register_id = this.cashRegEntry.cash_register_id;
    ormCashRegisterModify.modification_comments = form.txtComments;
    ormCashRegisterModify.copay_write_off = form.cmbWriteOff;
    ormCashRegisterModify.system_ip = this.lookupList.logedInUser.systemIp;
    ormCashRegisterModify.modified_user = this.lookupList.logedInUser.user_name;
    ormCashRegisterModify.client_date_modified = clientDateTime;
    ormCashRegisterModify.copay_paid = this.copayPaid;
    ormCashRegisterModify.selfpay_paid = this.selfpayPaid;
    ormCashRegisterModify.previous_balance_paid = this.prevBalPaid;
    ormCashRegisterModify.other_paid = this.otherPaid;
    ormCashRegisterModify.advance_paid = this.advancePaid;
    ormCashRegisterModify.copay_advance_adjusted = this.copayAdvanceAdjusted;
    ormCashRegisterModify.selfpay_advance_adjusted = this.selfpayAdvanceAdjusted;
    ormCashRegisterModify.prev_balance_advance_adjusted = this.prevBalAdvanceAdjusted;
    ormCashRegisterModify.other_advance_adjusted = this.otherAdvanceAdjusted;
    ormCashRegisterModify.copay_write_off = this.copayWriteOff;
    ormCashRegisterModify.selfpay_write_off = this.selfpayWriteOff;
    ormCashRegisterModify.prev_balance_write_off = this.prevBalWriteOff;

    if(this.appointmentId!=undefined){
      ormCashRegisterModify.location_id=this.cashRegEntry.location_id;
      ormCashRegisterModify.provider_id=this.cashRegEntry.provider_id;
    }
    else{
      ormCashRegisterModify.location_id=form.cmbLocation;
      ormCashRegisterModify.provider_id=form.cmbProvider;
    }

    this.paymentService.modifyCashRegister(ormCashRegisterModify).subscribe(
      data => {
        this.saveCashRegisterSuccess(data);

      },
      error => {
        this.saveCashRegisterError(error);

      }
    );
  }

  saveCashRegisterSuccess(data) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {      
      this.activeModal.close(true)
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {      
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Modify Cash Register Entry', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveCashRegisterError(error:any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Modify Cash Register Entry', "An Error occured while saving.", AlertTypeEnum.DANGER)
  }

  isFormValid(): boolean {

    let valid: boolean = true;

    if (!this.formGroup.valid || (this.totalPaidToday != this.totalPaidTodayActual)
      || (this.totalAdvanceAdjusted != this.totalAdvanceAdjustedActual)
      || (this.totalWriteOff != this.totalWriteOffActual)
    ) {
      valid = false;
    }


    return valid;


  }


}
