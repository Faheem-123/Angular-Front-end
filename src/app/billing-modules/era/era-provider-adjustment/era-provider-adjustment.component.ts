import { Component, OnInit, Input } from '@angular/core';
import { BillingService } from 'src/app/services/billing/billing.service';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'era-provider-adjustment',
  templateUrl: './era-provider-adjustment.component.html',
  styleUrls: ['./era-provider-adjustment.component.css']
})
export class EraProviderAdjustmentComponent implements OnInit {

  @Input() eraId: number;

  isLoading: boolean = false;
  lstAdjustment: Array<any>;

  constructor(private billingService: BillingService,
    private logMessage: LogMessage,
    public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.getProviderAdjustment();
  }


  getProviderAdjustment() {
    this.isLoading = true;
    this.billingService.getERAProviderAdjustment(this.eraId).subscribe(
      data => {

        this.lstAdjustment = data as Array<any>;


        this.isLoading = false;

      },
      error => {
        this.isLoading = false;
        this.getProviderAdjustmentError(error);
      }
    );
  }
  getProviderAdjustmentError(error) {
    this.logMessage.log("getProviderAdjustment Error." + error);
  }

}
