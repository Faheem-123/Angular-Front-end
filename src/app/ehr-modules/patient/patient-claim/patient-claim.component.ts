import { Component, OnInit, Input, QueryList, ViewChildren, Inject, ViewChild } from '@angular/core';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { LogMessage } from 'src/app/shared/log-message';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { OperationType, CallingFromEnum, AlertTypeEnum, PromptResponseEnum, ServiceResponseStatusEnum, PatientSubTabsEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { NgbTabChangeEvent, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClaimNotesPopupComponent } from 'src/app/billing-modules/claim/claim-notes-popup/claim-notes-popup.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { AuthenticationPopupComponent } from 'src/app/general-modules/authentication-popup/authentication-popup.component';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { PatientPaymentPlanComponent } from 'src/app/billing-modules/payment/patient-payment-plan/patient-payment-plan.component';
import { ModifyClaimStatusComponent } from 'src/app/billing-modules/claim/modify-claim-status/modify-claim-status.component';
import { ClaimProfessionalComponent } from 'src/app/billing-modules/claim/claim-professional/claim-professional.component';
import { ClaimStatementComponent } from 'src/app/billing-modules/statement/claim-statement/claim-statement.component';
import { OpenedPatientInfo } from 'src/app/models/common/patientInfo';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { ClaimStatementLogComponent } from 'src/app/billing-modules/statement/claim-statement-log/claim-statement-log.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AddTaskComponent } from '../../tasks/add-task/add-task.component';
import { PatientClaimReceiptPrintComponent } from 'src/app/billing-modules/claim/patient-claim-receipt-print/patient-claim-receipt-print.component';

@Component({
  selector: 'patient-claim',
  templateUrl: './patient-claim.component.html',
  styleUrls: ['./patient-claim.component.css']
})
export class PatientClaimComponent implements OnInit {

  @Input() patientId: number;

  @Input() patientToOpen: PatientToOpen;
  @ViewChild('claimProfersional') claimProfersional: ClaimProfessionalComponent;

  frmShowDeletedClaim: FormGroup;

  openedClaimInfo: OpenedClaimInfo;

  selectedClaim: any;
  selectedClaimId: number;
  //isDeletedClaim:boolean;
  //addEditOperation:string;

  isLoading: boolean = true;

  lstClaim: Array<any>;
  addEditView: boolean = false;
  showImportIcdCpt: boolean = false;
  canView = false;
  canAddEdit = false;

  selectedTab: string = "tb-professional-claim";

  totalAllClaimsDue: number = 0;
  totalPatientDue: number = 0;

  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };


  constructor(private claimService: ClaimService, private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList
    , private logMessage: LogMessage,
    private sortFilterPaginationService: SortFilterPaginationService,
    private ngbModal: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    private paymentService: PaymentService) {

  }

  ngOnInit() {

    // if(
    //   (this.claimId!=undefined && this.claimId!=null && this.claimId>0)
    //   &&
    //   (this.patientId!=undefined && this.patientId!=null && this.patientId>0))
    //   {
    //     this.openedClaimInfo = new OpenedClaimInfo(this.claimId, this.patientId, undefined, undefined, "", OperationType.EDIT, false,
    //       CallingFromEnum.Billing_Summary, undefined, undefined, undefined, undefined, undefined, undefined);

    //       this.selectedClaimId=this.claimId;
    //   }
    if (this.patientToOpen != null && this.patientToOpen != undefined && this.patientToOpen.callingFrom == CallingFromEnum.Billing_Summary) {

      this.openedClaimInfo = new OpenedClaimInfo(this.patientToOpen.child_module_id, this.patientToOpen.patient_id, undefined, undefined, "", OperationType.EDIT, false,
        CallingFromEnum.Billing_Summary, undefined, undefined, undefined, undefined, undefined, undefined);

      this.selectedClaimId = this.patientToOpen.child_module_id;
      this.addEditView = true;
    }
    else if (this.openedClaimInfo != null && this.openedClaimInfo != undefined && this.openedClaimInfo.operationType == "edit") {
      this.addEditView = true;
    }
    else {
      this.getclaimSummary(false);
    }
    this.frmShowDeletedClaim = this.formBuilder.group({
      chkShowDeletedClaim: this.formBuilder.control(false)
    }
    )
  }
  getclaimSummary(showDeleted) {
    this.isLoading = true;
    this.claimService.getClaimSummary(this.patientId, false, showDeleted).subscribe(
      data => {
        this.isLoading = false;
        this.lstClaim = data as Array<any>;

        if (this.lstClaim != undefined && this.lstClaim.length > 0 && this.selectedClaimId == undefined) {
          this.selectedClaimId = this.lstClaim[0].claim_id;
          this.selectedClaim = this.lstClaim[0];
        }
        else {
          this.selectedClaim = this.generalOperation.getitem(this.lstClaim, "claim_id", this.selectedClaimId);
        }

        this.calculateTotalDue();
        this.openClaim();
      },
      error => {
        this.isLoading = false;
        this.getClaimSummaryError(error);
      }
    );

  }
  openClaim() {

    debugger;
    if (this.patientToOpen != null && this.patientToOpen != undefined
      && (this.patientToOpen.child_module_id != null && this.patientToOpen.child_module_id != undefined)
      && (this.patientToOpen.child_module != null && this.patientToOpen.child_module != undefined && this.patientToOpen.child_module == PatientSubTabsEnum.CLAIM)) {

      if (this.lstClaim != undefined && this.lstClaim.length > 0) {
        this.selectedClaim = this.generalOperation.getitem(this.lstClaim, "claim_id", this.patientToOpen.child_module_id);
        this.selectedClaimId = this.selectedClaim.claim_id;

        this.openedClaimInfo = new OpenedClaimInfo(this.selectedClaim.claim_id, this.patientId, this.selectedClaim.provider_id, this.selectedClaim.location_id,
          this.selectedClaim.dos, OperationType.EDIT, this.selectedClaim.deleted, CallingFromEnum.PATIENT_CLAIM, this.selectedClaim.attending_physician,
          this.selectedClaim.location_name, this.selectedClaim.pri_status, this.selectedClaim.sec_status, this.selectedClaim.oth_status, this.selectedClaim.pat_status);
        this.addEditView = true;
      }

      // to avoid opening claim on refresh/reload claim summary.
      if (this.patientToOpen != undefined) {
        this.patientToOpen.child_module = undefined;
        this.patientToOpen.child_module_id = undefined;
      }
    }
  }
  getClaimSummaryError(error: any) {
    this.logMessage.log("Patient-claim:-" + error);
  }


  calculateTotalDue() {
    this.totalPatientDue = 0;
    this.totalAllClaimsDue = 0;
    if (this.lstClaim != undefined && this.lstClaim.length > 0) {

      this.lstClaim.forEach(clm => {

        this.totalAllClaimsDue = this.totalAllClaimsDue + Number(clm.amt_due);
        if (clm.pat_status == 'B') {
          this.totalPatientDue = this.totalPatientDue + Number(clm.amt_due);
        }
      });

    }

  }

  btnRefreshClicked() {
    this.selectedClaimId = undefined;
    this.selectedClaim = undefined;
    this.getclaimSummary(false);
  }

  claimSelectionChanged(claim: any) {
    this.selectedClaimId = claim.claim_id;
    this.selectedClaim = claim;
  }



  onAddNewClaim() {

    this.openedClaimInfo = new OpenedClaimInfo(undefined, this.patientId, undefined, undefined, undefined, OperationType.ADD, false,
      CallingFromEnum.PATIENT_CLAIM, undefined, undefined, undefined, undefined, undefined, undefined);
    this.selectedClaimId = undefined;
    this.selectedClaim = undefined;

    this.selectedTab = "tb-professional-claim";
    this.addEditView = true;
  }
  onOpenClaim(objClaim: any, selectedTab: string) {

    if (selectedTab == undefined || selectedTab == '') {
      this.selectedTab = "tb-professional-claim";
    }
    else {
      this.selectedTab = selectedTab;
    }


    this.openedClaimInfo = new OpenedClaimInfo(objClaim.claim_id, this.patientId, objClaim.provider_id, objClaim.location_id,
      objClaim.dos, OperationType.EDIT, objClaim.deleted, CallingFromEnum.PATIENT_CLAIM, objClaim.attending_physician,
      objClaim.location_name, objClaim.pri_status, objClaim.sec_status, objClaim.oth_status, objClaim.pat_status);
    this.selectedClaimId = objClaim.claim_id;
    this.selectedClaim = objClaim;
    this.addEditView = true;
  }

  /*
  onBackToSummary() {
    this.addEditView = false;
  }
  */

  onClaimSaved(claimId: number) {
    this.selectedClaimId = claimId;
    this.addEditView = false;
    this.getclaimSummary(false);
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstClaim, this.headers, this.sortEvent, null, null, '');
    this.lstClaim = sortFilterPaginationResult.list;
  }


  loadEdiClaimStatus: boolean = false;
  onTabChange(event: NgbTabChangeEvent) {
    this.selectedTab = event.nextId;
    switch (event.nextId) {
      case 'claim-summary':
        this.addEditView = false;
        break;
      case 'tb-edi-claim-status':
        this.loadEdiClaimStatus = true;
      default:
        break;
    }
  }

  openClaimNotesPopUp(clm: any) {

    let claimInfo: OpenedClaimInfo = new OpenedClaimInfo(clm.claim_id, this.patientId,
      clm.provider_id, clm.location_id,
      clm.dos, OperationType.EDIT, clm.deleted, CallingFromEnum.PATIENT_CLAIM,
      clm.attending_physician, clm.location_name,
      clm.pri_status, clm.sec_status, clm.oth_status, clm.pat_status);

    const modalRef = this.ngbModal.open(ClaimNotesPopupComponent, this.lgPopUpOptions);
    modalRef.componentInstance.openedClaimInfo = claimInfo;

    modalRef.result.then((result) => {
      if (result == true) {

      }
    }
      , (reason) => {
        //alert(reason);
      });
  }

  public GetClaimStatusText(clm: any): string {
    var strStatus: string = "";


    if (clm.pri_status != "") {
      strStatus = "<br>Primary Status: " + clm.pri_status;
    }
    if (clm.sec_status != "") {
      strStatus = "<br>Secondary Status: " + clm.sec_status;
    }
    if (clm.oth_status != "") {
      strStatus = "<br>Other Status: " + clm.oth_status;
    }
    if (clm.pat_status != "") {
      strStatus = "<br>Patient Status: " + clm.pat_status;
    }
    return strStatus;
  }

  claimIdToDelete: number;
  onDeleteClaim(clm: any) {
    this.claimIdToDelete = clm.claim_id;
    if (this.lookupList.UserRights.claim_delete) {

      let claimTotal: number = Number(clm.claim_total);
      let claimDue: number = Number(clm.amt_due);

      if (claimTotal > 0 && claimTotal != claimDue) {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim', "Claim cannot be deleted.<br>There is is un-rectified payment.", AlertTypeEnum.DANGER)
      }
      else {
        let claimStatus: string = this.GetClaimStatusText(clm);
        let strMsg: string = "";
        if (claimStatus != "") {
          strMsg += "This Claims has following Status. " + this.GetClaimStatusText(clm) + "<br>";
        }
        strMsg += "Do you want to delete selected claim ? "

        const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
        modalRef.componentInstance.promptHeading = 'Confirm Delete!';
        modalRef.componentInstance.promptMessage = strMsg;
        modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;

        modalRef.result.then((result) => {
          debugger;
          if (result == PromptResponseEnum.YES) {
            this.authenticateUser();
          }
        }, (reason) => {

        });
      }



    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim', "You don't have rights to delete Claim.", AlertTypeEnum.WARNING)
    }

  }

  deleteClaim(authResp: any) {

    let delNotes: string = authResp.notes + " | Authorized by: " + authResp.user_name;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "claim_id", value: this.claimIdToDelete, option: "" },
      { name: "modified_user", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS), option: "" },  // chart_immunization_ids empty to get all      
      { name: "system_ip", value: this.lookupList.logedInUser.systemIp, option: "" },
      { name: "deletion_notes", value: delNotes, option: "" }
    ];


    this.claimService.deleteClaim(searchCriteria)
      .subscribe(
        data => {

          if (data["status"] === ServiceResponseStatusEnum.SUCCESS) {
            this.getclaimSummary(false);
            GeneralOperation.showAlertPopUp(this.ngbModal, 'Delete Claim', "Claim has been deleted successfully.", AlertTypeEnum.SUCCESS)
          }
          if (data["status"] === ServiceResponseStatusEnum.ERROR) {
            GeneralOperation.showAlertPopUp(this.ngbModal, 'Delete Claim', data["response"], AlertTypeEnum.DANGER)
          }

        },
        error => {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'Delete Claim', error.message, AlertTypeEnum.DANGER)
        }
      );
  }

  authenticateUser() {
    const modalRef = this.ngbModal.open(AuthenticationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.allowUserSelection = false;
    modalRef.componentInstance.notesRequired = true;
    modalRef.componentInstance.headerTitle = "Delete Claim";
    modalRef.componentInstance.notesTitle = "Claim Deletion Reason";

    modalRef.result.then((result) => {

      if (result) {
        this.deleteClaim(result);
      }
    }, (reason) => {
      //alert(reason);
    });
  }

  showPaymentPlan() {
    const modalRef = this.ngbModal.open(PatientPaymentPlanComponent, this.popUpOptions);
    modalRef.componentInstance.editable = false;
    modalRef.componentInstance.patientId = this.patientId;
  }

  openModifyClaimStatusPopUp() {

    if (this.selectedClaim != undefined) {
      let claimInfo: OpenedClaimInfo = new OpenedClaimInfo(this.selectedClaim.claim_id, this.patientId,
        this.selectedClaim.provider_id, this.selectedClaim.location_id,
        this.selectedClaim.dos, OperationType.EDIT, this.selectedClaim.deleted, CallingFromEnum.PATIENT_CLAIM,
        this.selectedClaim.attending_physician, this.selectedClaim.location_name,
        this.selectedClaim.pri_status, this.selectedClaim.sec_status, this.selectedClaim.oth_status, this.selectedClaim.pat_status);

      const modalRef = this.ngbModal.open(ModifyClaimStatusComponent, this.lgPopUpOptions);
      modalRef.componentInstance.openedClaimInfo = claimInfo;

      modalRef.result.then((result) => {
        if (result == true) {
          this.getclaimSummary(false);
        }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Modify Claim Status', "Please select claim.", AlertTypeEnum.DANGER)
    }
  }


  showImportIcdCptModule(event: boolean) {
    debugger;
    this.showImportIcdCpt = event;
  }
  onStatement() {
    const modalRef = this.ngbModal.open(ClaimStatementComponent, this.lgPopUpOptions);
    modalRef.componentInstance.patient_id = this.patientId;

    modalRef.result.then((result) => {

      if (result) {
      }
    }, (reason) => {
      //alert(reason);
    });
  }

  getTooltipIcdsCptsAsList(icdsCpts: any) {
    let lst: Array<string> = [];

    if (icdsCpts != undefined && icdsCpts != '' && icdsCpts != null) {
      lst = icdsCpts.split(':');
    }

    return lst;
  }
  onStatementLog() {
    const modalRef = this.ngbModal.open(ClaimStatementLogComponent, this.lgPopUpOptions);
    modalRef.componentInstance.patient_id = this.patientId;

    modalRef.result.then((result) => {

      if (result) {
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  isShowDeleted = false;
  onchkShowDeleted(value) {
    if (value == true) {
      this.getclaimSummary(true);
      this.isShowDeleted = true;
    }
    else {
      this.getclaimSummary(false);
      this.isShowDeleted = false;
    }
  }

  addToTask() {

    const modalRef = this.ngbModal.open(AddTaskComponent, this.popUpOptions);

    modalRef.componentInstance.opertaionType = 'new';
    modalRef.componentInstance.callingFrom = CallingFromEnum.PATIENT_CLAIM;

    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.claimId = this.selectedClaimId;
    modalRef.componentInstance.patientName = this.patientToOpen.patient_name;
    modalRef.componentInstance.dos = this.selectedClaim.dos;

    modalRef.result.then((result) => {
      if (result != undefined) {
        //this.getTasks();
      }
    }
      , (reason) => {

        //alert(reason);
      });

  }

  printPatientReceipt() {

    if (this.selectedClaim != undefined) {
      const modalRef = this.ngbModal.open(PatientClaimReceiptPrintComponent, this.lgPopUpOptions);
      modalRef.componentInstance.claimId = this.selectedClaim.claim_id;
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Receipt', "Please select claim.", AlertTypeEnum.DANGER)
    }


  }
}
