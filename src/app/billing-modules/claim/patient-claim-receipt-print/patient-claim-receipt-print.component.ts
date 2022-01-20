import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { PatientService } from 'src/app/services/patient/patient.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ReportsService } from 'src/app/services/reports.service';
import { ClaimService } from 'src/app/services/billing/claim.service';


@Component({
  selector: 'app-patient-claim-receipt-print',
  templateUrl: './patient-claim-receipt-print.component.html',
  styleUrls: ['./patient-claim-receipt-print.component.css']
})
export class PatientClaimReceiptPrintComponent implements OnInit {

  @Input() claimId: number;

  receiptDetail: any;
  lstClaimDiagnosis: Array<any>;
  lstClaimProcedures:Array<any>;

  isLoading: boolean = true;

  preloadCount: number = 0;
  //maskedSSN: string = "";
  /*** PRINT Variables */
  printLocationName: string = "";
  printLocationAddress: string = "";
  printLocationCityStateZip: string = "";
  printLocationPhone: string = "";
  printLocationFax: string = "";
  printDateTime: string = "";

  /*** END PRINT Variables */

  constructor(public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private claimService: ClaimService,
    private generalService: GeneralService,
    private reportsService: ReportsService,
    private logMessage: LogMessage,
    private generalOperation: GeneralOperation) { }

  ngOnInit() {


    this.printDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
    //this.printLocationName = this.cashRegisterData.location_name;
    this.preloadCount = 3;
    this.getClaimReceiptDetail();
    this.getProClaimDiagnosis();
    this.getProClaimProcedures();

    /*
    if (this.patientInfo == undefined) {
      this.isLoading = true;
      this.preloadCount = 1;
      this.getPatientInfo();
    }
    else {
      //if (this.patientInfo.ssn != null && this.patientInfo.ssn != "") {
      //  this.maskedSSN = "*****" + this.patientInfo.ssn.replace("-", "").replace("-", "").substring(5, 9);
     // }
      this.populateLocationInfo();
      this.isLoading = false;
    }
    */
  }

  populateLocationInfo() {


    debugger;
    let location: any;

    if (this.receiptDetail.location_id != undefined && this.receiptDetail.location_id != "") {

      location = this.generalOperation.getitem(this.lookupList.locationList, "id", this.receiptDetail.location_id);
    }

    if (location != undefined) {
      this.printLocationName = location.name;
      this.printLocationAddress = location.address;
      this.printLocationCityStateZip = location.city + ", " + location.state + " " + location.zip;
      this.printLocationPhone = location.phone;
      this.printLocationFax = location.fax;
    }
    else {

      this.printLocationAddress = this.lookupList.practiceInfo.address1;
      this.printLocationCityStateZip = this.lookupList.practiceInfo.city + ", " + this.lookupList.practiceInfo.state + " " + this.lookupList.practiceInfo.zip;
      this.printLocationPhone = this.lookupList.practiceInfo.phone;
      this.printLocationFax = this.lookupList.practiceInfo.fax;
    }
  }


  getClaimReceiptDetail() {

    this.reportsService.getClaimReceiptDetail(this.claimId).subscribe(
      data => {

        debugger;
        this.receiptDetail = data;

        //if (this.patientInfo.ssn != null && this.patientInfo.ssn != "") {
        //  this.maskedSSN = "*****" + this.patientInfo.ssn.replace("-", "").replace("-", "").substring(5, 9);
        //}
        this.populateLocationInfo();


        this.preloadCount--;
        if (this.preloadCount == 0) {
          this.isLoading = false;
        }

      },
      error => {
        this.isLoading = false;
        this.getClaimReceiptDetailError(error);
      }
    );
  }

  getClaimReceiptDetailError(error: any) {
    this.logMessage.log("getClaimReceiptDetail Error." + error);
  }


  getProClaimDiagnosis() {
    this.claimService.getProClaimDiagnosis(this.claimId, false).subscribe(
      data => {

        this.lstClaimDiagnosis = data as Array<any>;
        this.preloadCount--;
        if (this.preloadCount == 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.preloadCount--;
        if (this.preloadCount == 0) {
          this.isLoading = false;
        }
        this.getProClaimDiagnosisError(error);
      }
    );
  }

  getProClaimDiagnosisError(error: any) {
    this.logMessage.log("getProClaimDiagnosis Error." + error);
  }

  getProClaimProcedures() {
    this.claimService.getProClaimProcedures(this.claimId, false).subscribe(
      data => {

        this.lstClaimProcedures = data as Array<any>;
        this.preloadCount--;
        if (this.preloadCount == 0) {
          this.isLoading = false;
        }

      },
      error => {
        this.preloadCount--;
        if (this.preloadCount == 0) {
          this.isLoading = false;
        }
        this.getProClaimProceduresError(error);
      }
    );
  }

  getProClaimProceduresError(error: any) {
    this.logMessage.log("getProClaimProcedures Error." + error);
  }


  cancelPrint() {
    this.activeModal.close();
  }

  print() {
    let printContents = document.getElementById('patient_demo_report').innerHTML;
    this.generalService.printReport(printContents);
  }

}
