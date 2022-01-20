import { Component, OnInit, Input, Inject } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { AppointmentOperationData } from 'src/app/ehr-modules/scheduler/appointment-operation-data';
import { CashRegisterComponent } from '../cash-register/cash-register.component';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { ClaimPostedPaymentDetailsComponent } from '../claim-posted-payment-details/claim-posted-payment-details.component';
import { CashRegisterModificationNotesComponent } from '../cash-register-modification-notes/cash-register-modification-notes.component';
import { CashRegisterModifyComponent } from '../cash-register-modify/cash-register-modify.component';
import { RefundPatientPaymentComponent } from '../refund-patient-payment/refund-patient-payment.component';

@Component({
  selector: 'patient-payment',
  templateUrl: './patient-payment.component.html',
  styleUrls: ['./patient-payment.component.css']
})
export class PatientPaymentComponent implements OnInit {

  @Input() patientId: number;
  @Input() dos: string;

  loadPayment: boolean = false;
  loadReason: boolean = false;
  printView: boolean = false;

  isLoading = false;
  lstPatientPayment;
  lstPatientRefund;

  cashRegisterPrintData;
  //preLoadCount: number = 0;
  selectedRow:number=0;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };


  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private paymentService: PaymentService,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private dateTimeUtil: DateTimeUtil) { }


  ngOnInit() {
    if (this.lookupList.UserRights.cashregister_view) {
      this.loadPatientPayment();
    }
  }

  getPatientPayment() {
    this.lstPatientPayment = undefined;

    this.isLoading = true;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.dos != undefined ? this.dos : "", option: "" }
    ];

    this.paymentService.getCashRegister(searchCriteria).subscribe(
      data => {
        this.lstPatientPayment = data;
        //this.preLoadCount--;
        //if (this.preLoadCount == 0) {
        this.isLoading = false;
        //}
      },
      error => {
        this.isLoading = false;
        this.ongetPatientPaymentError(error);
      }
    );
  }

  ongetPatientPaymentError(error) {
    this.logMessage.log("getPatientPayment Error.");
  }

  /*
  getPatientRefund() {
    this.lstPatientPayment = undefined;

    this.isLoading = true;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" }
    ];

    this.paymentService.getPatientRefund(searchCriteria).subscribe(
      data => {
        this.lstPatientRefund = data;
        this.preLoadCount--;
        if(this.preLoadCount==0){
          this.isLoading = false;
        }
        
      },
      error => {
        this.isLoading = false;
        this.ongetPatientRefundError(error);
      }
    );
  }

  ongetPatientRefundError(error) {
    this.logMessage.log("getPatientRefund Error.");
  }
*/

  addNewPaymentClicked() {
    this.showCashRegister();
  }


  showCashRegister() {


    let appData: AppointmentOperationData = new AppointmentOperationData();
    appData.patientId = this.patientId;

    const modalRef = this.ngbModal.open(CashRegisterComponent, this.popUpOptionsLg);
    modalRef.componentInstance.appData = appData;


    let closeResult;

    modalRef.result.then((result) => {

      debugger;
      if (result === true) {
        this.getPatientPayment();
      }
    }
      , (reason) => {
        //alert(reason);
      });

  }

  loadPatientPayment() {
    //this.preLoadCount = 1;
    //this.getPatientRefund();
    this.getPatientPayment();
  }


  printCashRegister(objCashRegiser) {

    this.cashRegisterPrintData = objCashRegiser;
    this.printView = true;
  }

  closePrintView() {
    this.printView = false;
  }

  refundPatientPayment(cashEntry: any) {

    debugger;
    const modalRef = this.ngbModal.open(RefundPatientPaymentComponent, this.popUpOptionsLg);
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.cashRegisterId = cashEntry.cash_register_id;
    modalRef.componentInstance.locationId = cashEntry.location_id;
    modalRef.componentInstance.totalRefund = Number(cashEntry.total_paid) == NaN ? 0 : Number(cashEntry.total_paid);
    modalRef.componentInstance.totalPatientPaid = Number(cashEntry.total_paid) == NaN ? 0 : Number(cashEntry.total_paid);   
    modalRef.componentInstance.prevRefunded= Number(cashEntry.refund_amount) == NaN ? 0 : Number(cashEntry.refund_amount);   
    modalRef.componentInstance.callingFrom = CallingFromEnum.CASH_REGISTER;

    modalRef.result.then((result) => {
      debugger;
      if (result) {
        this.isLoading = true;
        this.loadPatientPayment();
      }
    }, (reason) => {
      //alert(reason);
    });

  }

  disableVoidButton(cashEntry: any): boolean {


    let disable: boolean = false;

    if (cashEntry.main_refunded || cashEntry.voided || cashEntry.check_bounce) {
      disable = true;
    }
    else if (cashEntry.is_same_day_entry || this.lookupList.logedInUser.user_name.toUpperCase() == 'ADMIN'
      || this.lookupList.logedInUser.user_name.toUpperCase() == 'BILL@IHC'
      || this.lookupList.logedInUser.user_name.toUpperCase() == 'WAQAR'
      || this.lookupList.logedInUser.user_name.toUpperCase() == 'FS@IHC'
      || this.lookupList.logedInUser.user_name.toUpperCase() == 'ELIZABETHF'
      || this.lookupList.logedInUser.user_name.toUpperCase() == 'EELAHI'
      || this.lookupList.logedInUser.user_name.toUpperCase() == 'ABASIT@IHC') {
      disable = false;
    }

    return disable;

  }

  showClaimPostedDetails(cashRegisterId: number) {
    const modalRef = this.ngbModal.open(ClaimPostedPaymentDetailsComponent, this.popUpOptionsLg);
    modalRef.componentInstance.eobEraId = cashRegisterId;
    modalRef.componentInstance.eobEraIdType = "CASH_REGISTER";
  }

  addModificationNotes(cashEntry: any, operation: string) {

    const modalRef = this.ngbModal.open(CashRegisterModificationNotesComponent, this.popUpOptions);
    modalRef.componentInstance.operation = operation;
    modalRef.componentInstance.cashRegisterId = cashEntry.cash_register_id;

    modalRef.componentInstance.checkNo = cashEntry.check_number;
    modalRef.componentInstance.checkDate = cashEntry.check_date;


    modalRef.componentInstance.callingFrom = CallingFromEnum.CASH_REGISTER;

    modalRef.result.then((result) => {
      debugger;
      if (result) {
        this.isLoading = true;
        this.loadPatientPayment();
      }
    }, (reason) => {
      //alert(reason);
    });

  }

  editCashRgistrEntry(cashEntry: any) {

    const modalRef = this.ngbModal.open(CashRegisterModifyComponent, this.popUpOptionsLg);
    modalRef.componentInstance.cashRegEntry = cashEntry;

    modalRef.result.then((result) => {
      debugger;
      if (result) {
        this.isLoading = true;
        this.loadPatientPayment();
      }
    }, (reason) => {
      //alert(reason);
    });
  }

  selectRow(row:number){
    this.selectedRow=row;
  }

}

