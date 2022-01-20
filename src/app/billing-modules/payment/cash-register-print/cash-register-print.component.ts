import { Component, OnInit, Input, Inject, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { PatientService } from 'src/app/services/patient/patient.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchCriteria } from 'src/app/models/common/search-criteria';



@Component({
  selector: 'cash-register-print',
  templateUrl: './cash-register-print.component.html',
  styleUrls: ['./cash-register-print.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CashRegisterPrintComponent implements OnInit {

  @Input() patientId;
  @Input() cashRegisterData;
  @Input() patientInfo;
  @Input() primaryInsurance;
  @Output() close = new EventEmitter<any>();

  isLoading: boolean = false;
  /*** PRINT Variables */
  patientName;
  patAge;
  patGender;
  patPID;
  patDOB;
  patAddress;
  patZip;
  patCity;
  patState;
  patContactNo;

  printLocationCityStateZip;
  printPracticeName
  printLocationName;
  printLocationAddress;
  printLocationPhone;
  printLocationFax;
  printReceiptNo;
  printDateTime;

  printDOS;

  printPaymentMehtod = "CREDIT CARD";
  printCopayPaid = 0;
  printSelfpayPaid = 0;
  printPrevBalPaid = 0;
  printOtherPaid = 0;
  printAdvancePaid = 0;
  printCopayAdjusted = 0;
  printSelfpayAdjusted = 0;
  printPrevBalAdjusted = 0;
  printOtherAdjusted = 0;
  printCopayWriteOff = 0;
  printSelfpayWriteOff = 0;
  printPrevBalWriteOff = 0;
  printTotalPaidToday = 0;
  printTotalAdvanceAdjusted = 0;
  printTotalWriteOff = 0;

  printCheckNo;
  printCheckDate;

  printCCNo;
  printCCType;
  printCCAuthCode;
  printCCCharges = 0;
  printCCTranId;
  printCCTransTimeStamp;
  printCCStatus;

  printComments;
  printEnteredBy;
  printDateTimeModified;

  preLoadCount = 0;

  /*** END PRINT Variables */

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private patientService: PatientService,
    private generalService: GeneralService,
    private logMessage: LogMessage) { }

  ngOnInit() {

    if (this.patientInfo != undefined && this.primaryInsurance != undefined) {
      this.AssignData();
    }
    else {
      this.preLoadCount++;
      this.isLoading = true;
      if (this.primaryInsurance == undefined) {
        this.preLoadCount++;
        this.getPatientInsuranceName();
      }
      this.getPatientHeaderInfo();
    }


  }

  getPatientHeaderInfo() {
    this.isLoading = true;
    this.patientService.getPatientHeader(this.patientId).subscribe(
      data => {

        this.patientInfo = data;
        this.preLoadCount--;
        if (this.preLoadCount == 0) {
          this.isLoading = false;
          this.AssignData();
        }
      },
      error => {
        this.onHeaderError(error);
      }
    );
  }

  onHeaderError(error) {
    this.logMessage.log("getPatientInfo Error.");
  }

  getPatientInsuranceName() {


    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" }
    ];


    this.generalService.getPatientInsuranceName(searchCriteria).subscribe(
      data => {
        debugger;
        this.primaryInsurance = data['primary_insurance'];
        this.preLoadCount--;
        if (this.preLoadCount == 0) {
          this.isLoading = false;
          this.AssignData();
        }
      },
      error => {
        this.ongetPatientInsuranceNameError(error);
      }
    );
  }

  ongetPatientInsuranceNameError(error) {
    this.logMessage.log("getPatientInsuranceName Error.");
  }


  AssignData() {


    if (this.cashRegisterData != undefined && this.patientInfo != undefined) {

      debugger;

      this.patPID = this.patientInfo.pid;
      this.patientName = this.patientInfo.last_name + ", " + this.patientInfo.first_name;

      switch (this.patientInfo.gender_code) {
        case "F":
        case "f":
          this.patGender = "FEMALE";
          break;
        case "m":
        case "m":
          this.patGender = "MALE";
          break;

        default:
            this.patGender = "";
          break;
      }

      this.patDOB = this.patientInfo.dob;
      this.patAddress = this.patientInfo.address+" "+this.patientInfo.city+", "+this.patientInfo.state+" "+this.patientInfo.zip;    

      this.patContactNo = this.patientInfo.primary_contact_no;
      this.patAge = "";
      if (this.patientInfo.age_year > 0) {
        this.patAge += this.patientInfo.age_year + 'Y ';
      }
      if (this.patientInfo.age_month > 0) {
        this.patAge += this.patientInfo.age_month + 'M';
      }
      if (this.patientInfo.age_year == 0 && this.patientInfo.age_month == 0 && this.patientInfo.age_days > 0) {
        this.patAge += this.patientInfo.age_days + 'D';
      }


      this.printDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);//  this.dateTimeUtil.getCurrentDateTimeString();

      this.printLocationName = this.cashRegisterData.location_name;
      this.printLocationAddress = this.cashRegisterData.location_address + ' ' + this.cashRegisterData.location_zip_city_state;
      this.printLocationPhone = this.cashRegisterData.location_phone;
      this.printLocationFax = this.cashRegisterData.location_fax;


      //if(this.appointmentId==undefined){

      //}
      //else{
      this.printDOS = this.cashRegisterData.dos;
      //}

      this.printReceiptNo = this.cashRegisterData.receipt_no;
      this.printComments = this.cashRegisterData.comments;
      this.printEnteredBy = this.cashRegisterData.modified_user;
      this.printDateTimeModified = this.cashRegisterData.date_created;

      this.printPaymentMehtod = this.cashRegisterData.payment_method;


      this.printCheckNo = this.cashRegisterData.check_number;
      this.printCheckDate = this.cashRegisterData.check_date;


      this.printCopayPaid = this.cashRegisterData.copay_paid;
      this.printSelfpayPaid = this.cashRegisterData.selfpay_paid;
      this.printPrevBalPaid = this.cashRegisterData.previous_balance_paid;
      this.printOtherPaid = this.cashRegisterData.other_paid;
      this.printAdvancePaid = this.cashRegisterData.advance_paid;
      this.printCopayAdjusted = this.cashRegisterData.copay_advance_adjusted;
      this.printSelfpayAdjusted = this.cashRegisterData.selfpay_advance_adjusted;
      this.printPrevBalAdjusted = this.cashRegisterData.prev_balance_advance_adjusted;
      this.printOtherAdjusted = this.cashRegisterData.other_advance_adjusted;
      this.printCopayWriteOff = this.cashRegisterData.copay_write_off;
      this.printSelfpayWriteOff = this.cashRegisterData.selfpay_write_off;
      this.printPrevBalWriteOff = this.cashRegisterData.prev_balance_write_off;

      this.printTotalPaidToday = Number(this.printCopayPaid) + Number(this.printSelfpayPaid) + Number(this.printPrevBalPaid) + Number(this.printOtherPaid) + Number(this.printAdvancePaid);
      this.printTotalAdvanceAdjusted = Number(this.printCopayAdjusted) + Number(this.printSelfpayAdjusted) + Number(this.printPrevBalAdjusted) + Number(this.printOtherAdjusted);
      this.printTotalWriteOff = Number(this.printCopayWriteOff) + Number(this.printSelfpayWriteOff) + Number(this.printPrevBalWriteOff);

    }
  }

  cancelPrint() {

    this.close.emit();
  }

  print() {
    let printContents = document.getElementById('cash_register_report').innerHTML;
    this.generalService.printReport(printContents);
    /*
    let printContents, popupWin;
    printContents = document.getElementById('report').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <link rel="stylesheet" type="text/css" href="./assets/css/bootstrap.min.css" media="screen,print">  
          <link rel="stylesheet" type="text/css" href="./assets/css/font-awesome.min.css" media="screen,print"/>
          <link rel="stylesheet" type="text/css" href="./assets/css/font-ihc.css" media="screen,print"/>     
          <link rel="stylesheet" type="text/css" href="./assets/css/ihc-style.css" media="screen,print"/>  
          <link rel="stylesheet" type="text/css" href="./assets/css/main-nav.css" media="screen,print"/>   
          <link rel="stylesheet" type="text/css" href="./assets/css/dashboard.css" media="screen,print"/>     
          <link rel="stylesheet" type="text/css" href="./assets/css/helper.css" media="screen,print"/> 
          <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">              
        </head>
    <body style="background-color:white;" onload="window.print();">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
*/
    //<body onload="window.print();window.close()">${printContents}</body>
  }

}

