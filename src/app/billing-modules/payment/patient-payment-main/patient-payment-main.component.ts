import { Component, OnInit, Input, Inject } from '@angular/core';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { LogMessage } from 'src/app/shared/log-message';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'patient-payment-main',
  templateUrl: './patient-payment-main.component.html',
  styleUrls: ['./patient-payment-main.component.css']
})
export class PatientPaymentMainComponent implements OnInit {

  @Input() patientId;

  //isLoading: boolean = false;

  loadPayment: boolean = false;
  loadRefund: boolean = false;
  loadReason: boolean = false;

  lstNotPaidReason;
  isLoadingReason:boolean=false;

  constructor(private paymentService: PaymentService,
    private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
  }

  getNotPaidReason() {

    if (this.lookupList.UserRights.cashregister_view) {
      this.lstNotPaidReason = undefined;
      this.isLoadingReason = true;
      this.paymentService.getNotPaidReason(this.patientId).subscribe(
        data => {
          this.lstNotPaidReason = data;
          this.isLoadingReason = false;
        },
        error => {
          this.isLoadingReason = false;
          this.ongetPatientPaymentError(error);
        }
      );
    }
  }

  ongetPatientPaymentError(error) {
    this.logMessage.log("getPatientPayment Error.");
  }


  onTabChange(event: NgbTabChangeEvent) {
    debugger;
    switch (event.nextId) {
      case 'tab-pat-payment':
        this.loadPayment = true;
        break;
      case 'tab-pat-refunds':
        this.loadRefund = true;
        break;
      case 'tab-not-paid-reason':
        if (this.lstNotPaidReason == undefined) {
          this.getNotPaidReason();
        }
        this.loadReason = true;
        break;
    }
  }
}
