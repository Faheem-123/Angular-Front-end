import { Component, OnInit, Input, Inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from 'src/app/services/billing/billing.service';
import { LogMessage } from 'src/app/shared/log-message';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ServiceResponseStatusEnum, AlertTypeEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';

@Component({
  selector: 'edi-claim-status-detail',
  templateUrl: './edi-claim-status-detail.component.html',
  styleUrls: ['./edi-claim-status-detail.component.css']
})
export class EdiClaimStatusDetailComponent implements OnInit {

  @Input() claimId: number;
  @Input() openedClaimInfo: OpenedClaimInfo;
  @Input() callingFrom: CallingFromEnum;

  isLoading: boolean = false;
  isProcessing: boolean = false;
  lstClaimStatus: Array<any>;

  constructor(
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal,
    private billingService: BillingService,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage) { }

  ngOnInit() {
    debugger;
    //this.isLoading = true;
    console.log("Calling From :" + this.callingFrom);

    this.getEdiClaimStatusByClaimId();
  }

  getEdiClaimStatusByClaimId() {
    debugger;
    this.isLoading = true;
    this.lstClaimStatus = [];
    this.billingService.getEdiClaimStatusDetailByClaimId(this.claimId).subscribe(
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

  downloadClaimStatus() {

    this.isProcessing = true;
    debugger;
    let strRootUrl: string = window.location.hostname;

    let searchCriteria: SearchCriteria = new SearchCriteria();

    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "root_url", value: strRootUrl, option: "" },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
      { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
      { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
    ];

    this.billingService.downloadClaimResponse(searchCriteria).subscribe(
      data => {
        debugger;
        this.isProcessing = false;
        this.downloadClaimResponseSuccess(data);
      },
      error => {
        this.isProcessing = false;
        this.downloadClaimResponseError(error);
      }
    );
  }

  downloadClaimResponseSuccess(data: any) {
    debugger;

    if (data.status == 'ERROR') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Status', data.response, AlertTypeEnum.DANGER)
    }
    else if (data.status == 'SUCCESS') {
      this.getEdiClaimStatusByClaimId();
      //GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Status', data.response, AlertTypeEnum.SUCCESS)
    }
    else if (data.status == 'INFO') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Status', data.response, AlertTypeEnum.INFO)
    }
  }

  downloadClaimResponseError(error: any) {
    debugger;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Status', "An Error Occured while getting Claim Status from Gateway EDI.", AlertTypeEnum.DANGER)
  }

}
