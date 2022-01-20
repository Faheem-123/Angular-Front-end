import { Component, OnInit, Input, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { AppointmentOperationData } from 'src/app/ehr-modules/scheduler/appointment-operation-data';
import { CashRegisterComponent } from '../cash-register/cash-register.component';

@Component({
  selector: 'patient-refunds',
  templateUrl: './patient-refunds.component.html',
  styleUrls: ['./patient-refunds.component.css']
})
export class PatientRefundsComponent implements OnInit {

  @Input() patientId: number;

  isLoading = false;
  lstPatientRefund: Array<any>;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private paymentService: PaymentService,
    private logMessage: LogMessage) { }


  ngOnInit() {
    if (this.lookupList.UserRights.cashregister_view) {
      this.getPatientRefund();
    }
  }

  getPatientRefund() {

    this.isLoading = true;
    this.lstPatientRefund = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" }
    ];

    this.paymentService.getPatientRefund(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstPatientRefund = data as Array<any>;
        this.isLoading = false;
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

}
