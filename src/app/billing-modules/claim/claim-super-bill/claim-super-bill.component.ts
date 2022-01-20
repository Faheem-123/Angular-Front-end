import { Component, OnInit, Output, EventEmitter, Input, Inject } from '@angular/core';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { SuperBillCode } from './super-bill-code';
import { NgbModal, NgbModalOptions, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { AlertTypeEnum } from 'src/app/shared/enum-util';


@Component({
  selector: 'claim-super-bill',
  templateUrl: './claim-super-bill.component.html',
  styleUrls: ['./claim-super-bill.component.css'],

})
export class ClaimSuperBillComponent implements OnInit {

  @Input() claimDiagCount: number;
  @Input() dos: string;
  @Input() callingFrom: string;
  @Input() controlUniqueId: any;
  @Input() eap: boolean=false;


  @Output() onImport = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();

  isLoading = false;
  isLoadingMain: boolean = true;
  isLoadingBill: boolean = true;

  lstSuperBillList: Array<any>;
  lstSuperBillCatList: Array<any>;
  lstSuperBillDetails: Array<any>;


  loadingCount: number = 0;


  lstSelectedDiagnosis: Array<any>;
  lstSelectedProcedures: Array<any>;



  popupScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
  };

  constructor(private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private claimService: ClaimService,
    private modalService: NgbModal) {    
  }

  ngOnInit() {
    debugger;
    this.isLoadingMain = true;

    if (this.callingFrom == "encounter") {
      this.getSuperBillEncounterList();
    }
    else
      this.getSuperBillList();
  }

  getSuperBillEncounterList() {


    this.lstSuperBillList = undefined;

    this.claimService.getSuperBillEncounterList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstSuperBillList = data as Array<any>;
        this.isLoadingMain = false;

        debugger;
        if (this.lstSuperBillList != undefined && this.lstSuperBillList.length > 0) {
          if (this.lookupList.logedInUser.defaultSuperBill < 1)
            this.onSuperBillSelectionChanged(this.lstSuperBillList[0].id);
          else
            this.onSuperBillSelectionChanged(this.lookupList.logedInUser.defaultSuperBill);

        }
      },
      error => {
        this.isLoadingMain = false;
        this.onGetSuperBillListError(error);
      }
    );
  }

  getSuperBillList() {


    this.lstSuperBillList = undefined;

    this.claimService.getSuperBillList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstSuperBillList = data as Array<any>;
        this.isLoadingMain = false;

        debugger;
        if (this.lstSuperBillList != undefined && this.lstSuperBillList.length > 0) {
          if (this.lookupList.logedInUser.defaultSuperBill < 1)
            this.onSuperBillSelectionChanged(this.lstSuperBillList[0].id);
          else
            this.onSuperBillSelectionChanged(this.lookupList.logedInUser.defaultSuperBill);

        }
      },
      error => {
        this.isLoadingMain = false;
        this.onGetSuperBillListError(error);
      }
    );
  }

  onGetSuperBillListError(error: any) {
    this.logMessage.log("getSuperBillList Error.");
  }


  getSuperBillCatList(billId: number) {


    this.lstSuperBillCatList = undefined;

    this.claimService.getSuperBillCatList(billId).subscribe(
      data => {
        this.lstSuperBillCatList = data as Array<any>;

        this.loadingCount--;

        if (this.loadingCount == 0) {
          this.isLoadingBill = false;
        }
      },
      error => {
        this.isLoadingBill = false;
        this.onGetSuperBillCatListError(error);
      }
    );
  }

  onGetSuperBillCatListError(error: any) {
    this.logMessage.log("getSuperBillCatList Error.");
  }


  getSuperBillDetails(billId: number) {
    debugger;

    this.lstSuperBillDetails = undefined;


    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "bill_id", value: billId, option: "" },
      { name: "dos", value: this.dos == undefined ? "" : this.dos, option: "" }
    ];

    this.claimService.getSuperBillDetails(searchCriteria).subscribe(
      data => {

        debugger;
        this.lstSuperBillDetails = data as Array<any>;

        this.loadingCount--;

        if (this.loadingCount == 0) {
          this.isLoadingBill = false;
        }
      },
      error => {
        this.isLoadingBill = false;
        this.onGetSuperBillDetailsError(error);
      }
    );
  }

  onGetSuperBillDetailsError(error: any) {
    this.logMessage.log("getSuperBillDetails Error.");
  }


  onSuperBillSelectionChanged(billId: number) {
    debugger;
    this.lstSelectedDiagnosis = undefined;
    this.lstSelectedProcedures = undefined;

    this.isLoadingBill = true;
    this.loadingCount = 2;
    this.getSuperBillCatList(billId);
    this.getSuperBillDetails(billId);

  }


  onSuperBillItemSelectionChanged(objCode: SuperBillCode) {

    debugger;

    if (objCode.codeType.toUpperCase() == "ICD") {

      if (this.lstSelectedDiagnosis == undefined)
        this.lstSelectedDiagnosis = new Array<any>();

      if (objCode.selected) {
        this.lstSelectedDiagnosis.push({ diag_code: objCode.code, diag_description: objCode.description, code_type: 'ICD-10' });
      }
      else {

        for (let i: number = this.lstSelectedDiagnosis.length - 1; i >= 0; i--) {

          if (this.lstSelectedDiagnosis[i].diag_code == objCode.code) {
            this.lstSelectedDiagnosis.splice(i, 1);
          }

        }

      }

    }
    else if (objCode.codeType.toUpperCase() == "CPT") {
      if (this.lstSelectedProcedures == undefined)
        this.lstSelectedProcedures = new Array<any>();
      if (objCode.selected) {
        this.lstSelectedProcedures.push({
          code: objCode.code,
          description: objCode.description,
          ndc_code: objCode.ndcCode,
          mod1: objCode.modifier,
          charges: objCode.charges
        });
      }
      else {

        for (let i: number = this.lstSelectedProcedures.length - 1; i >= 0; i--) {

          if (this.lstSelectedProcedures[i].code == objCode.code) {
            this.lstSelectedProcedures.splice(i, 1);
          }

        }

      }
    }
  }


  onImportCodes() {

    debugger;
    if ((this.lstSelectedDiagnosis == undefined || this.lstSelectedDiagnosis.length == 0)
      && (this.lstSelectedProcedures == undefined || this.lstSelectedProcedures.length == 0)) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.popupScreenOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      modalRef.componentInstance.promptHeading = 'Super Bill';
      modalRef.componentInstance.promptMessage = "No Code is selected.";

      return;
    }

    if (this.lstSelectedDiagnosis != undefined && (this.lstSelectedDiagnosis.length + this.claimDiagCount) > 16) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.popupScreenOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      modalRef.componentInstance.promptHeading = 'Super Bill';
      modalRef.componentInstance.promptMessage = "Maximum 16 diagnosis are allowed.";

      return;
    }

    let lstSelectedCodes: any = { diagnosis_list: this.lstSelectedDiagnosis, procedures_list: this.lstSelectedProcedures,eap:this.eap};
    // if(this.callingFrom=='encounter')
    // {
    //   this.activeModal.close(lstSelectedCodes)
    // }
    // else
    {
      this.onImport.emit(lstSelectedCodes);
    }
  }

  onCancelClick() {
    // if(this.callingFrom=='encounter')
    // {
    //   this.activeModal.close(null)
    // }
    // else
    this.onCancel.emit()
  }

  chkEAPCheckChanged(event:any){
    this.eap=event.currentTarget.checked;
  }

}
