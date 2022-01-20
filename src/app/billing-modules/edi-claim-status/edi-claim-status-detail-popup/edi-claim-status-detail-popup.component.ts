import { Component, OnInit, Input, HostListener, Inject } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from 'src/app/services/billing/billing.service';
import { LogMessage } from 'src/app/shared/log-message';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { DateTimeUtil } from 'src/app/shared/date-time-util';


@Component({
  selector: 'edi-claim-status-detail-popup',
  templateUrl: './edi-claim-status-detail-popup.component.html',
  styleUrls: ['./edi-claim-status-detail-popup.component.css']
})
export class EdiClaimStatusDetailPopupComponent implements OnInit {

  @Input() ediStatus: any;

  isLoading: boolean = false;
  isProcessing: boolean = false;
  lstClaimStatus: Array<any>;

  constructor(
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    public activeModal: NgbActiveModal,
    private ngbModal: NgbModal,
    private billingService: BillingService,
    private dateTimeUtil:DateTimeUtil,
    private logMessage: LogMessage) { }

  ngOnInit() {
    debugger;
    //this.isLoading = true;
    this.getEdiClaimStatusByClaimId();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    this.activeModal.dismiss('Cross click')
  }



  getEdiClaimStatusByClaimId() {
    debugger;
    this.isLoading = true;
    this.lstClaimStatus = [];
    this.billingService.getEdiClaimStatusDetailByClaimId(this.ediStatus.claim_id).subscribe(
      data => {
        this.lstClaimStatus = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        alert(error);
        this.isLoading = false;
      }
    );

  }



  markAsWorked(id: number) {

    this.isProcessing = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "id", value: id, option: "" },
      { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
      { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
    ];

    this.billingService.markEdiClaimStatusAsWorked(searchCriteria).subscribe(
      data => {
        this.isProcessing = false;
        this.markAsWorkedSuccess(data);
      },
      error => {
        this.isProcessing = false;
        this.markAsWorkedError(error);
      }
    );
  }

  markAsWorkedSuccess(data: any) {
    debugger;

    if (data.status == ServiceResponseStatusEnum.SUCCESS) {
      this.getEdiClaimStatusByClaimId();
    }
    else if (data.status == ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Mark EDI Claim Status As Worked', data.response, AlertTypeEnum.DANGER)
    }
  }

  markAsWorkedError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Mark EDI Claim Status As Worked', "An Error Occured while saving record.", AlertTypeEnum.DANGER)
  }
}