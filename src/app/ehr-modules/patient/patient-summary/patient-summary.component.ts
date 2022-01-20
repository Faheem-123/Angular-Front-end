import { Component, OnInit, Input, ViewEncapsulation, Inject } from '@angular/core';
import { ChartsModule, Color } from 'ng2-charts';
import { PatientService } from '../../../services/patient/patient.service';
import { LogMessage } from '../../../shared/log-message';
import { log, debug } from 'util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ServiceResponseStatusEnum, AlertTypeEnum, CallingFromEnum, OperationType, DymoLbelPrintType } from 'src/app/shared/enum-util';
import { CheckInOutPopupComponent } from '../../scheduler/check-in-out-popup/check-in-out-popup.component';
import { AppointmentOperationData } from '../../scheduler/appointment-operation-data';
import { OpenedPatientInfo } from 'src/app/models/common/patientInfo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PatientNotesComponent } from '../patient-notes/patient-notes.component';
import { TimelyAccessComponent } from '../timely-access/timely-access.component';
import { PatientCcdComponent } from '../patient-ccd/patient-ccd.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
import { PrintDemographicsComponent } from '../patient-info/print-demographics/print-demographics.component';
//import { ORMEligibilityDetail } from 'src/app/models/general/ORMEligibilityDetail';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ReportsService } from 'src/app/services/reports.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { EligibilityService } from 'src/app/services/patient/eligibility.service';
import { PatientEligibilityComponent } from '../patient-eligibility/patient-eligibility.component';
import { DymoLabelPrintComponent } from '../../../general-modules/dymo-label-print/dymo-label-print.component';
import { PatientPaymentPlanComponent } from 'src/app/billing-modules/payment/patient-payment-plan/patient-payment-plan.component';
import { AddTaskComponent } from '../../tasks/add-task/add-task.component';

@Component({
  selector: 'patient-summary',
  templateUrl: './patient-summary.component.html',
  styles: [`
        // .navbar.left-nav > .tab-content {
        //     display: flex;
        // }
    `],
  encapsulation: ViewEncapsulation.Emulated
})
export class PatientSummaryComponent implements OnInit {

  @Input() patientId: number;
  @Input() patGender: string;
  @Input() openPatientInfo: OpenedPatientInfo;



  patientScannedCards: any;
  patientInsuanceInfo: any;
  downloadPath: string;
  patCheckedInInfo;
  isLoading: boolean = true;
  lstPhrUsers: Array<any>;


  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };


  // Blood Pressure Chart
  public bpLineChartOptions: any = {
    scaleShowVerticalLines: false,
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
    ,
    tooltips: {
      mode: 'label',
      callbacks: {
        label: function (tooltipItem) {

          if (tooltipItem.datasetIndex == 0) {
            this.bpToolTip = tooltipItem.yLabel.toString();
            return null;
          }
          else {
            this.bpToolTip += "/" + tooltipItem.yLabel.toString();
            return 'BP: ' + this.bpToolTip;
          }

          //debugger;
          //this.test += tooltipItem.yLabel.toString();

          //  return this.bpToolTip;

        }
      }
    }

  };

  closeResult: string;

  public bpToolTip: string = "";


  public bpLineChartLabels: string[] = [];
  public bpLineChartType: string = 'line';
  public bpLineChartLegend: boolean = false;

  public bpLineChartData: any[] = [
    { data: [], label: 'Systolic' },
    { data: [], label: 'Diastolic' }
  ];

  public bpLineChartColors: Array<Color> = [

    { // blue
      backgroundColor: 'rgba(63,127,191,0.3)',
      borderColor: '#2e7fc1',
      pointBackgroundColor: '#0f8842',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#0f8842'
    },
    { // green
      backgroundColor: 'rgba(63,191,127,0.5)',
      borderColor: '#2ebd6b',
      pointBackgroundColor: '#1c6eb1',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#1c6eb1'
    }
  ];

  open(content) {
    this.ngbModal.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  // private getDismissReason(reason: any): string {
  // if (reason === ModalDismissReasons.ESC) {
  //   return 'by pressing ESC';
  // } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //   return 'by clicking on a backdrop';
  // } else {
  //   return  `with: ${reason}`;
  // }
  // }

  /*
  // Height Chart
  public heightBarChartColors:Array<Color> = [    
    { 
      backgroundColor: 'rgba(63,127,191,0.5)',//'#2e7fc1', // blue
      hoverBackgroundColor: 'rgba(63,191,127,0.5)'//''#2ebd6b', // green
    }
   ];
 public heightBarChartOptions: any = {
   scaleShowVerticalLines: false,
   maintainAspectRatio: false,
   responsive: true,
   scales: {
     yAxes: [{
       ticks: {
         beginAtZero: true
       }
     }]
   },
   tooltips: {
     callbacks: {
       label: function (tooltipItem) {

         
         let total_inches = (Number(tooltipItem.yLabel))*12 ;

         let ft = Math.floor(total_inches / 12);
         let inches = Math.floor(total_inches % 12);

         return 'Height: '+ft+' ft  '+ inches+' in';
       }
     }
   }
 };
 
 public heightBarChartLabels: string[] = ['01/01/1900'];
 public heightBarChartType: string = 'bar';
 public heightBarChartLegend: boolean = false;

 public heightBarChartData: any[] = [
   { data: [5.3], label: 'Height' }
 ];

 */
  // Weight Chart
  public weightLineChartColors: Array<Color> = [
    {
      backgroundColor: 'rgba(63,191,127,0.3)',
      borderColor: '#2e7fc1',
      pointBackgroundColor: '#0f8842',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#0f8842'
    }
    /*
    {
      hoverBackgroundColor: 'rgba(63,127,191,0.5)', // green
      backgroundColor: 'rgba(63,191,127,0.5)'//''// blue
    }
    */
  ];


  public weightLineChartOptions: any = {

    scaleShowVerticalLines: false,
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
    ,
    tooltips: {
      callbacks: {
        label: function (tooltipItem) {
          return (Number(tooltipItem.yLabel)) + ' Kg';

        }
      }
    }
    /*
    scaleShowVerticalLines: false,
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }*/
  };
  public weightLineChartLabels: string[] = [];
  public weightLineChartType: string = 'line';
  public weightLineChartLegend: boolean = false;

  public weightLineChartData: any[] = [
    { data: [], label: 'Weight' }
  ];


  // Temprature Chart
  public tempLineChartColors: Array<Color> = [
    {
      backgroundColor: 'rgba(63,191,127,0.3)',
      borderColor: '#2e7fc1',
      pointBackgroundColor: '#0f8842',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#0f8842'
    }
  ];

  public tempLineChartOptions: any = {
    scaleShowVerticalLines: false,
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
    ,
    tooltips: {
      callbacks: {
        label: function (tooltipItem) {
          return (Number(tooltipItem.yLabel)) + ' °F';

        }
      }
    }
  };
  public tempLineChartLabels: string[] = [];
  public tempLineChartType: string = 'line';
  public tempLineChartLegend: boolean = false;

  public tempLineChartData: any[] = [
    { data: [], label: 'Temperature' }
  ];
  public radioGroupForm: FormGroup;


  constructor(private patientService: PatientService,
    private logMessage: LogMessage, private ngbModal: NgbModal, private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private dateTimeUtil: DateTimeUtil, private reportsService: ReportsService
    , private generalService: GeneralService,
    private eligibilityService: EligibilityService) {

  }

  ngOnInit() {
    this.getPatientScannedCards();
    this.getPatientCheckedInInfo();
    this.getPatientInsuranceInfo();
    this.getPatientPhrUsersNames();

    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      this.downloadPath = this.lookupList.lstdocumentPath[0].download_path;
    }


    this.radioGroupForm = this.formBuilder.group({
      'model': 'staff'
    });
    /*
        if (this.lookupList.acProviderEligibility == undefined || this.lookupList.acProviderEligibility.length == 0) {
          this.getProvider_Eligibility();
        }
        */
    this.getVitalGraphData();

    if (this.lookupList.UserRights.pat_staffnotes || this.lookupList.UserRights.pat_phynotes)
      this.getStaffNoteAlert();
  }
  getStaffNoteAlert() {
    this.isLoading = true;
    this.patientService.getStaffNoteAlert(this.patientId).subscribe(
      data => {
        this.isLoading = false;
        if ((data as Array<any>).length > 0) {
          this.openNotes('alert');
        }
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  primary_insurance_id: number;
  primary_insurance = "";
  primary_insurance_address = "";
  secondary_insurance_id: number;
  secondary_insurance = "";
  secondary_insurance_address = "";

  getPatientInsuranceInfo() {
    this.patientService.getPatientInsuranceView(this.patientId).subscribe(
      data => {

        debugger;
        if (data != null && data != undefined) {
          debugger;
          this.patientInsuanceInfo = data;
          if (this.patientInsuanceInfo.length > 0) {
            for (let i = 0; i < this.patientInsuanceInfo.length; i++) {
              if (this.patientInsuanceInfo[i].insurace_type.toString().toLowerCase() == "primary") {
                this.primary_insurance_id = this.patientInsuanceInfo[i].patientinsurance_id;
                this.primary_insurance = this.patientInsuanceInfo[i].name;//+ this.patientInsuanceInfo[i].address;
                this.linkPrimaryIns = this.parseEligStatus(this.patientInsuanceInfo[i].elig_status);
                //this.primary_insurance_address=this.patientInsuanceInfo[i].address;
              }
              else if (this.patientInsuanceInfo[i].insurace_type.toString().toLowerCase() == "secondary") {
                this.secondary_insurance_id = this.patientInsuanceInfo[i].patientinsurance_id;
                this.secondary_insurance = this.patientInsuanceInfo[i].name;//+ this.patientInsuanceInfo[i].address;
                //this.secondary_insurance_address=this.patientInsuanceInfo[i].address;
                this.linkSecondaryIns = this.parseEligStatus(this.patientInsuanceInfo[i].elig_status);
              }
            }
          }
        }
        else {
          this.patientInsuanceInfo = new Array();
        }


      },
      error => {
        this.isLoading = false;
      }
    );
  }
  parseEligStatus(value): string {
    let str = "";
    switch (value) {
      case "A":
        str = "Active Insurance";
        break;
      case "I":
        str = "Inactive Insurance";
        break;
      case "U":
        str = "Unable to Verify Insurance";
        break;
    }
    return str;
  }
  /*
  getProvider_Eligibility(){
    this.generalService.getProvider_Eligibility(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.acProviderEligibility =  data as Array<any>;
      },
      error => {
        this.logMessage.log("getProvider_Eligibility Error." + error);
      }
    );
  }
  */
  getPatientScannedCards() {

    this.isLoading = true;
    this.patientService.getPatientScannedCards(this.patientId).subscribe(
      data => {
        this.isLoading = false;
        this.patientScannedCards = data;
      },
      error => {
        this.isLoading = false;
      }
    );
  }


  isPhrUsersloading: boolean = true;
  getPatientPhrUsersNames() {

    this.isPhrUsersloading = true;
    this.lstPhrUsers = undefined;

    this.patientService.getPatientPhrUsersNames(this.lookupList.practiceInfo.practiceId, this.patientId).subscribe(
      data => {
        debugger;
        this.isPhrUsersloading = false;
        this.lstPhrUsers = data as Array<any>;
      },
      error => {
        this.isPhrUsersloading = false;
      }
    );
  }



  clearGraph() {
    // BP
    this.bpLineChartLabels = [];
    this.bpLineChartData[0].data = [];
    this.bpLineChartData[1].data = [];

    // Weight
    this.weightLineChartLabels = [];
    this.weightLineChartData[0].data = [];

    // Temprature
    this.tempLineChartLabels = [];
    this.tempLineChartData[0].data = [];

    // Height
    //this.heightBarChartLabels=[];
    //this.heightBarChartData[0].data=[];
  }
  checkedinTitle = 'No CheckedIn Info Found';
  getPatientCheckedInInfo() {
    this.patientService.getPatientCheckedInInfo(this.patientId).subscribe(
      data => {
        if (data != undefined && data != null) {
          debugger;
          this.patCheckedInInfo = data;
          if (this.patCheckedInInfo.length > 0)
            this.checkedinTitle = "Checked In for " + this.patCheckedInInfo[0].provider_name + " at " + this.patCheckedInInfo[0].room + " (" + this.patCheckedInInfo[0].location + ")";
        }
        else {
          this.patCheckedInInfo = null
          this.checkedinTitle = 'No CheckedIn Info Found';
        }
      },
      error => {
        this.isLoading = false;
        this.onVitalGraphError(error);
      }
    );
  }
  arrVitalGraphData;
  isVitalGraphLoading = false;
  getVitalGraphData() {

    this.isVitalGraphLoading = true;
    this.clearGraph();
    this.patientService.getVitalGraphData(this.patientId).subscribe(
      data => {
        debugger;
        this.arrVitalGraphData = data;
        this.onVitalGraphSuccessfull();
      },
      error => {
        this.isVitalGraphLoading = false;
        this.onVitalGraphError(error);
      }
    );
  }



  onVitalGraphSuccessfull() {
    debugger;
    //for (let vital of this.arrVitalGraphData) {
    for (let i = 0; i < this.arrVitalGraphData.length; i++) {
      let vital = this.arrVitalGraphData[i];
      // BP
      if (vital.systolic_bp1 != undefined && vital.systolic_bp1 != ""
        && vital.diastolic_bp1 != undefined && vital.diastolic_bp1 != "") {
        this.bpLineChartLabels.push(vital.visit_date);
        this.bpLineChartData[0].data.push(vital.systolic_bp1);
        this.bpLineChartData[1].data.push(vital.diastolic_bp1);
      }

      // Height
      if (vital.height_feet != undefined && vital.height_feet != "") {


        var feet_inches = vital.height_feet.split(".");
        let inches: number = 0;
        let feet: number = feet_inches[0] * 12;

        if (feet_inches.length > 1) {
          inches = +feet_inches[1];
        }

        let total_inches: number = +feet + +inches;


        //this.heightBarChartLabels.push(vital.visit_date);
        //this.heightBarChartData[0].data.push(total_inches/12);
      }

      // Weight
      if (vital.weight_kg != undefined && vital.weight_kg != "") {
        this.weightLineChartLabels.push(vital.visit_date);
        this.weightLineChartData[0].data.push(vital.weight_kg);
      }

      // Temperature
      if (vital.temperature_fahren != undefined && vital.temperature_fahren != "") {
        this.tempLineChartLabels.push(vital.visit_date);
        this.tempLineChartData[0].data.push(vital.temperature_fahren);
      }

    }
    this.isVitalGraphLoading = false;
  }
  onVitalGraphError(error) {
    this.logMessage.log("getVitalGraphData Error.");
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  NotesPoupUp: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  poupUpOptionslg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

  openCheckIn() {
    this.showCheckInCheckOutPopUp();
  }

  showCheckInCheckOutPopUp() {
    let appData: AppointmentOperationData = new AppointmentOperationData;
    appData.patientId = this.patientId;
    appData.patientName = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
    appData.dob = this.openPatientInfo.patient_dob;
    appData.appointmentId = 0;
    const modalRef = this.ngbModal.open(CheckInOutPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.appOperationData = appData;

    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result === ServiceResponseStatusEnum.SUCCESS) {
        this.getPatientCheckedInInfo();
      }

    }
      , (reason) => {
        debugger;
        this.getPatientCheckedInInfo();
      });

  }
  onMenuClick(option: string) {
    switch (option) {
      case "print-demographic":
        this.printDemographics();
        break;
      case "ccda":
        let modalRefCCD = this.ngbModal.open(PatientCcdComponent, this.poupUpOptionslg);
        modalRefCCD.componentInstance.patient_id = this.patientId;
        modalRefCCD.componentInstance.patient_name = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
        modalRefCCD.componentInstance.patient_dob = this.openPatientInfo.patient_dob;


        modalRefCCD.result.then((result) => {

          if (result === ServiceResponseStatusEnum.SUCCESS) {
            // this.loadScheduler("inside");
          }
        }
          , (reason) => {
            //alert(reason);
          });
        break;
      case "timely-access":

        const modalRef = this.ngbModal.open(TimelyAccessComponent, this.poupUpOptionslg);
        //modalRef.componentInstance.patient_id=pat.patient_id;
        modalRef.componentInstance.patientName = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
        //modalRef.componentInstance.patient_dob=pat.dob;
        modalRef.componentInstance.patientId = this.patientId;
        modalRef.componentInstance.callingFrom = CallingFromEnum.PATIENT;
        let closeResult;

        modalRef.result.then((result) => {
          if (result === ServiceResponseStatusEnum.SUCCESS) {
          }
        }
          , (reason) => {
          });
        break;
        break;
      case "id-card":
        if (this.patientScannedCards != undefined && this.patientScannedCards.id_card != undefined && this.patientScannedCards.id_card != "") {
          this.viewScanCard(this.patientScannedCards.id_card);
        }
        else {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'View Scanned Card', "ID Card not found.", AlertTypeEnum.WARNING)
        }
        break;
      case "driving-licence":
        if (this.patientScannedCards != undefined && this.patientScannedCards.driving_license != undefined && this.patientScannedCards.driving_license != "") {
          this.viewScanCard(this.patientScannedCards.driving_license);
        }
        else {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'View Scanned Card', "Driving Licence not found.", AlertTypeEnum.WARNING)
        }
        break;
      case "patient-agreement":
        if (this.patientScannedCards != undefined && this.patientScannedCards.patient_agreement != undefined && this.patientScannedCards.patient_agreement != "") {
          this.viewScanCard(this.patientScannedCards.patient_agreement);
        }
        else {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'View Scanned Card', "Patient Agreement not found.", AlertTypeEnum.WARNING)
        }
        break;

      case "primary-insurnce":
        if (this.patientScannedCards != undefined && this.patientScannedCards.primary_insurance != undefined && this.patientScannedCards.primary_insurance != "") {
          this.viewScanCard(this.patientScannedCards.primary_insurance);
        }
        else {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'View Scanned Card', "Primary Insurance Card not found.", AlertTypeEnum.WARNING)
        }
        break;
      case "secondary-insurnce":
        if (this.patientScannedCards != undefined && this.patientScannedCards.secondary_insurance != undefined && this.patientScannedCards.secondary_insurance != "") {
          this.viewScanCard(this.patientScannedCards.secondary_insurance);
        }
        else {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'View Scanned Card', "Secondary Insurance Card not found.", AlertTypeEnum.WARNING)
        }
        break;
      case "other-insurnce":
        if (this.patientScannedCards != undefined && this.patientScannedCards.other_insurance != undefined && this.patientScannedCards.other_insurance != "") {
          this.viewScanCard(this.patientScannedCards.other_insurance);
        }
        else {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'View Scanned Card', "Other Insurance Card not found.", AlertTypeEnum.WARNING)
        }
        break;
      case "payment-plan":
        this.addPaymentPlan();
        break;
      case "add-to-task":
        this.addToTask();
        break;

      default:
        break;
    }

  }

  addToTask() {

    const modalRef = this.ngbModal.open(AddTaskComponent, this.poupUpOptions);

    modalRef.componentInstance.opertaionType = 'new';
    modalRef.componentInstance.callingFrom = CallingFromEnum.PATIENT;

    modalRef.componentInstance.patientId = this.patientId;
    //modalRef.componentInstance.chartId = this.objEncounterToOpen.chart_id;
    modalRef.componentInstance.patientName = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
    //modalRef.componentInstance.encounterDate = this.objEncounterToOpen.visit_date;

    modalRef.result.then((result) => {
      if (result != undefined) {
        //this.getTasks();
      }
    }
      , (reason) => {

        //alert(reason);
      });

  }

  viewScanCard(link: string) {

    let docPath = this.downloadPath + this.lookupList.practiceInfo.practiceId + "/" + "PatientDocuments/" + link;
    const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = docPath;

  }

  openNotes(value) {
    this.OpenPatientNotes(value);
  }

  OpenPatientNotes(value) {
    debugger;
    const modalRef = this.ngbModal.open(PatientNotesComponent, this.NotesPoupUp);

    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.patientName = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
    modalRef.componentInstance.dob = this.openPatientInfo.patient_dob;
    modalRef.componentInstance.callingFrom = value;

  }

  printDemographics() {
    const modalRef = this.ngbModal.open(PrintDemographicsComponent, this.lgPopUpOptions);
    modalRef.componentInstance.patientId = this.patientId;
  }

  printLabel(labelType: string) {

    debugger;
    const modalRef = this.ngbModal.open(DymoLabelPrintComponent, this.popUpOptions);
    modalRef.componentInstance.id = this.patientId;
    //modalRef.componentInstance.pid = this.openPatientInfo.pid;
    //modalRef.componentInstance.patientName = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
    //modalRef.componentInstance.addressLine1 = this.openPatientInfo.patient_address;
    //modalRef.componentInstance.addressLine2 = this.openPatientInfo.patient_address_line2;
    //modalRef.componentInstance.dob = this.openPatientInfo.patient_dob_101;
    //modalRef.componentInstance.patientCityStateZip = this.openPatientInfo.Patient_zip_city_state;
    //modalRef.componentInstance.phoneNo = this.openPatientInfo.phone;    
    modalRef.componentInstance.labelType = labelType as DymoLbelPrintType;

  }

  //private objEligDetails: ORMEligibilityDetail;
  insuranceTypEligCheck: string = '';
  EligReqProcessing(type: string) {

    debugger;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;

    this.insuranceTypEligCheck = type;
    let insId: number;
    if (type == 'primary') {
      insId = this.primary_insurance_id;

    }
    else if (type == 'secondary') {
      insId = this.secondary_insurance_id;
    }

    if (insId == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Elibibility', type.toUpperCase() + " insurance not found.", AlertTypeEnum.INFO)
      return;
    }

    searchCriteria.param_list = [
      { name: "check_live", value: "true", option: "" },
      { name: "patient_id", value: this.patientId.toString(), option: "" },
      { name: "id", value: insId.toString(), option: "" },
      { name: "id_type", value: "insurance", option: "" },
      { name: "insurance_type", value: type, option: "" },
      { name: "dos", value: this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYYMMDD), option: "" }

    ];

    this.eligibilityService.getPatientElibility(searchCriteria).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.onEligibilityResponse(data['response_list'][0], this.insuranceTypEligCheck);
        }
        else if (data['status'] === ServiceResponseStatusEnum.ERROR) {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Eligibility', data['response'], AlertTypeEnum.DANGER)
        }
        else if (data['status'] === ServiceResponseStatusEnum.NOT_FOUND) {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Eligibility', data['response'], AlertTypeEnum.INFO)
        }

      },
      error => {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Eligibility', error.message, AlertTypeEnum.DANGER)
      }
    );



    /*
    let ArrDate = [];
    let ArrDate1 = [];
    this.objEligDetails = new ORMEligibilityDetail();
    this.objEligDetails.appointment_id = "";
    this.objEligDetails.patient_id = this.patientId.toString();
    this.objEligDetails.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.objEligDetails.elig_user = this.lookupList.acProviderEligibility[0].user;
    this.objEligDetails.elig_password = this.lookupList.acProviderEligibility[0].password;
    this.objEligDetails.provider_fname = this.lookupList.acProviderEligibility[0].provider_fname;
    this.objEligDetails.provider_lname = this.lookupList.acProviderEligibility[0].provider_lname;
    this.objEligDetails.provider_npi = this.lookupList.acProviderEligibility[0].provider_npi;
    this.objEligDetails.insured_fname = this.openPatientInfo.first_name;
    this.objEligDetails.insured_lname = this.openPatientInfo.last_name;
    this.objEligDetails.insured_ssn = this.openPatientInfo.ssn;
    this.objEligDetails.insured_state = this.openPatientInfo.state;
      
    if(this.openPatientInfo.patient_dob_101.toString() != ""){
      ArrDate=this.openPatientInfo.patient_dob_101.toString().split("/");
    this.objEligDetails.insured_dob = ArrDate[2].toString() + ArrDate[0].toString() + ArrDate[1].toString();
    }else{
      this.objEligDetails.insured_dob = "";
    }
    let dateElig = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)

    if(dateElig != ""){
      ArrDate1 =dateElig.toString().split("/");
      this.objEligDetails.dos = ArrDate1[2].toString()+ArrDate1[0].toString()+ArrDate1[1].toString();
    }else{
      this.objEligDetails.dos = "";
    }
    
    this.objEligDetails.ins_type = type;
    
    debugger;
    
    this.reportsService.getPatientEligibility(this.objEligDetails).subscribe(
      data => {
        debugger;
        this.onEligibilityResponse(data['result'],this.objEligDetails.ins_type);
      },
      error => {
        return;
      }
    );
    */
  }
  linkPrimaryIns = "";
  linkSecondaryIns = "";
  onEligibilityResponse(data, type) {
    let insStatusMsg: string = '';

    if (data.eligibility_status == "A") {
      insStatusMsg = "Active Insurance";
    }
    else if (data.eligibility_status == "I") {
      insStatusMsg = "Inactive Insurance";
    }
    else {
      insStatusMsg = "Unable to Verify Insurance";
    }


    if (type == 'primary') {
      this.linkPrimaryIns = insStatusMsg;
    }
    else if (type == 'secondary') {
      this.linkSecondaryIns = insStatusMsg;
    }
  }

  showEligibility(type: string) {

    debugger;
    this.insuranceTypEligCheck = type;
    let insId: number;
    if (type == 'primary') {
      insId = this.primary_insurance_id;

    }
    else if (type == 'secondary') {
      insId = this.secondary_insurance_id;
    }

    if (insId == undefined) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Elibibility', type.toUpperCase() + " insurance not found.", AlertTypeEnum.INFO)
      return;
    }

    const modalRef = this.ngbModal.open(PatientEligibilityComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.id = insId;
    modalRef.componentInstance.idType = "insurance";
    modalRef.componentInstance.checkLive = false;
    modalRef.componentInstance.insuranceType = this.insuranceTypEligCheck;
    modalRef.componentInstance.dos = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYYMMDD);

  }

  addPaymentPlan() {
    const modalRef = this.ngbModal.open(PatientPaymentPlanComponent, this.popUpOptions);
    modalRef.componentInstance.editable = true;
    modalRef.componentInstance.patientId = this.patientId;
  }

  onPHRAccessClicked() {
    const modalRef = this.ngbModal.open(TimelyAccessComponent, this.poupUpOptionslg);
    modalRef.componentInstance.patientName = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.callingFrom = CallingFromEnum.PATIENT;
  }
}
