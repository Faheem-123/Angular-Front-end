import { Component, OnInit, Input, Inject, HostListener } from '@angular/core';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { PaymentService } from 'src/app/services/billing/payment.service';

@Component({
  selector: 'claim-payment-eob-era-info',
  templateUrl: './claim-payment-eob-era-info.component.html',
  styleUrls: ['./claim-payment-eob-era-info.component.css']
})
export class ClaimPaymentEobEraInfoComponent implements OnInit {

  @Input() openedClaimInfo: OpenedClaimInfo;

  lstERA: Array<any>;
  lstEOB: Array<any>;

  isLoading: boolean = false;

  preLoadingCount: number = 0;

  constructor(public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private paymentService: PaymentService) { }

  ngOnInit() {
    this.preLoadingCount = 2;
    this.getERAPaymentInfoByClaimId();
    this.getEOBInfoByClaimId();
  }
  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  getEOBInfoByClaimId() {

    this.paymentService.getEOBInfoByClaimId(this.openedClaimInfo.claimId).subscribe(
      data => {
        this.lstEOB = data as Array<any>;
        this.preLoadingCount--;
        if (this.preLoadingCount <= 0) {
          this.isLoading = false;
        }

      },
      error => {
        this.getEOBInfoByClaimIdError(error);
        this.isLoading = false;
      }
    );
  }

  getEOBInfoByClaimIdError(error) {
    this.logMessage.log("getEOBInfoByClaimId Error." + error);
  }

  getERAPaymentInfoByClaimId() {

    this.paymentService.getERAPaymentInfoByClaimId(this.openedClaimInfo.claimId).subscribe(
      data => {
        this.lstERA = data as Array<any>;
        this.preLoadingCount--;
        if (this.preLoadingCount <= 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.getERAPaymentInfoByClaimIdError(error);
        this.isLoading = false;
      }
    );
  }

  getERAPaymentInfoByClaimIdError(error) {
    this.logMessage.log("getERAPaymentInfoByClaimId Error." + error);
  }

}
