import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { PatientService } from 'src/app/services/patient/patient.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralOperation } from 'src/app/shared/generalOperation';


@Component({
  selector: 'print-demographics',
  templateUrl: './print-demographics.component.html',
  styleUrls: ['./print-demographics.component.css']
})
export class PrintDemographicsComponent implements OnInit {

  @Input() patientId: number;
  @Input() patientInfo: any;
  @Input() lstPatientInsurance: Array<any>;
  @Input() lstPatRaceEthnicity: Array<any>;

  lstPatRace: Array<any> = new Array<any>();
  lstPatCDCRace: Array<any> = new Array<any>();

  lstPatEthnicity: Array<any> = new Array<any>();
  lstPatCDCEthnicity: Array<any> = new Array<any>();


  isLoading: boolean = true;

  preloadCount:number=0;
  maskedSSN: string = "";
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
    private patientService: PatientService,
    private generalService: GeneralService,
    private logMessage: LogMessage,
    private generalOperation: GeneralOperation) { }

  ngOnInit() {


    this.printDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
    //this.printLocationName = this.cashRegisterData.location_name;

    if (this.patientInfo == undefined) {
      this.isLoading=true;
      this.preloadCount=3;
      this.getPatientInfo();
      this.getPatientRaceEthnicty();
      this.getPatientInsurance();
    }
    else {
      if (this.patientInfo.ssn != null && this.patientInfo.ssn != "") {
        this.maskedSSN = "*****" + this.patientInfo.ssn.replace("-", "").replace("-", "").substring(5, 9);
      }
      this.populateLocationInfo();
      this.populateRaceEthnictyInfo();
      this.isLoading=false;
    }
  }

  populateLocationInfo() {

    debugger;
    let location: any;

    if (this.patientInfo.location_id != undefined && this.patientInfo.location_id != "") {

      location = this.generalOperation.getitem(this.lookupList.locationList, "id", this.patientInfo.location_id);
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

    this.isLoading = false;
  }


  populateRaceEthnictyInfo() {

    debugger;

    if (this.lstPatRaceEthnicity != undefined) {
      this.lstPatRaceEthnicity.forEach(element => {
        if (element.entry_type == 'RACE') {
          this.lstPatRace.push(element);
        }
        else if (element.entry_type == 'ETHNICITY') {
          this.lstPatEthnicity.push(element);
        }
      });

      this.lstPatCDCRace = new Array();
      if (this.lstPatRace != undefined) {
        for (let r of this.lstPatRace) {
          if (r["cdc_code"] != undefined && r["cdc_code"] != "") {
            this.lstPatCDCRace.push(r);
          }
        }
      }

      this.lstPatCDCEthnicity = new Array();
      if (this.lstPatEthnicity != undefined) {
        for (let e of this.lstPatEthnicity) {
          if (e["cdc_code"] != undefined && e["cdc_code"] != "") {
            this.lstPatCDCEthnicity.push(e);
          }
        }
      }
    }

  }

  getPatientInfo() {

    this.patientService.getPatient(this.patientId).subscribe(
      data => {

        this.patientInfo = data;
        if (this.patientInfo.ssn != null && this.patientInfo.ssn != "") {
          this.maskedSSN = "*****" + this.patientInfo.ssn.replace("-", "").replace("-", "").substring(5, 9);
      }
        this.populateLocationInfo();


        this.preloadCount--;
        if(this.preloadCount==0){
          this.isLoading=false;
        }

      },
      error => {
        this.isLoading = false;
        this.GetPatientError(error);
      }
    );
  }

  GetPatientError(error: any) {
    this.logMessage.log("getPatient Error." + error);
  }

  getPatientRaceEthnicty() {
    this.patientService.getPatientRaceEthnicty(this.patientId).subscribe(
      data => {


        this.lstPatRaceEthnicity = data as Array<any>;

        this.lstPatRace = new Array();
        this.lstPatEthnicity = new Array();

        this.populateRaceEthnictyInfo();

        this.preloadCount--;
        if(this.preloadCount==0){
          this.isLoading=false;
        }

      },
      error => {
        this.isLoading=false;
        this.getPatientRaceEthnictyError(error);
      }
    );
  }

  getPatientRaceEthnictyError(error) {
    this.logMessage.log("getPatientRaceEthnicty Error." + error);
  }

  getPatientInsurance() {
    this.patientService.getPatientInsurance(this.patientId,'active').subscribe(
      data => {
        debugger;
        this.lstPatientInsurance = data as Array<any>;

        this.preloadCount--;
        if(this.preloadCount==0){
          this.isLoading=false;
        }
      },
      error => {
        this.isLoading=false;
        this.getPatientInsuranceError(error);
      }
    );
  }

  getPatientInsuranceError(error) {
    this.logMessage.log("getPatientInsurance Error." + error);
  }


  cancelPrint() {
    this.activeModal.close();
  }

  print() {
    let printContents = document.getElementById('patient_demo_report').innerHTML;
    this.generalService.printReport(printContents);
  }

}


