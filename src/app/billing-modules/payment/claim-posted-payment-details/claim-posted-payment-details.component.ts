import { Component, OnInit, Input, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LogMessage } from 'src/app/shared/log-message';
import { PaymentService } from 'src/app/services/billing/payment.service';

@Component({
  selector: 'claim-posted-payment-details',
  templateUrl: './claim-posted-payment-details.component.html',
  styleUrls: ['./claim-posted-payment-details.component.css']
})
export class ClaimPostedPaymentDetailsComponent implements OnInit {

  @Input() eobEraId: number;
  @Input() eobEraIdType: string;

  isLoading: boolean = false;
  lstPostingDetails: Array<any>;

  constructor(public activeModal: NgbActiveModal,
    private logMessage: LogMessage,
    private paymentService: PaymentService) { }

  ngOnInit() {
    this.getPostedDetail();
  }

  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  getPostedDetail() {
    this.isLoading=true;
    this.paymentService.getClaimPostedPayment(this.eobEraId, this.eobEraIdType).subscribe(
      data => {

        this.lstPostingDetails = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getPostedDetailError(error);
      }
    );

  }
  getPostedDetailError(error: any) {
    this.logMessage.log("getPostedDetail:-" + error);
  }

}
