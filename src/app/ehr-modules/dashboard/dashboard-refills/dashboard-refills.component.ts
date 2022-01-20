import { Component, Inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { PrescriptionXml } from 'src/app/models/encounter/PrescriptionXml';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { NewCropXML } from 'src/app/shared/NewCropXML';
import { GetPrescriptionAllergies } from 'src/app/models/encounter/GetPrescriptionAllergies';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LogMessage } from 'src/app/shared/log-message';
import { NewcropComponent } from 'src/app/general-modules/newcrop/newcrop.component';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'dashboard-refills',
  templateUrl: './dashboard-refills.component.html',
  styleUrls: ['./dashboard-refills.component.css']
})
export class DashboardRefillsComponent implements OnInit {
  @Output() openModule = new EventEmitter<any>();
  @Output() widgetUpdate = new EventEmitter<any>();
  Physician_Pending = "--";
  Staff_Pending = "--";
  Failed = "--";
  Refills = "--";
  Physician_Review = "--";
  lstPrescription;
  Prescriptionlink;
  post_xml;
  ModuleName = "Refill Request";
  totalpending;
  showHide: boolean = true;
  frmSearch: FormGroup;
  frmRadio: FormGroup;
  isShowPatient = false;
  isLoading: boolean = false;
  constructor(private genXml: NewCropXML,
    private encounterService: EncounterService,
    private dashboardService: DashboardService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private modalService: NgbModal, private formBuilder: FormBuilder,
    private logMessage: LogMessage) { }

  poupUpOptions: NgbModalOptions = {
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

  ngOnInit() {
    this.getData('Refills');
    this.buildForm();
  }
  buildForm() {
    this.frmSearch = this.formBuilder.group({
      cntrlpatientSearch: this.formBuilder.control("")
    });

    this.frmRadio = this.formBuilder.group({
      entryOption: this.formBuilder.control(this.radioOption)
    });

  }
  getData(val: string) {
    this.isLoading = true;
    this.showHide = false;
    let getRefillData: GetPrescriptionAllergies = new GetPrescriptionAllergies();
    getRefillData = this.genXml.prepareGetObjectRefills(getRefillData, this.lookupList);

    getRefillData.options = val;
    getRefillData.providerid = this.lookupList.logedInUser.defaultProvider;// "50010113"; // this will be default_physician

    this.dashboardService.getRefillsData(getRefillData)
      .subscribe(
        data => {
          debugger;
          this.lstPrescription = "";
          this.lstPrescription = data;
          switch (val) {
            case "Physician Pending":
              this.Physician_Pending = this.lstPrescription.length;
              this.ModuleName = "Pending Physicain Prescription";
              break;
            case "Staff Pending":
              this.Staff_Pending = this.lstPrescription.length;
              this.ModuleName = "Pending Staff Prescription";
              break;
            case "Failed":
              this.Failed = this.lstPrescription.length;
              this.ModuleName = "Failed Prescription";
              break;
            case "Refills":
              this.Refills = this.lstPrescription.length;
              this.ModuleName = "Refill Request";
              this.widgetUpdate.emit('refill');
              break;
            case "For Physician Review":
              this.Physician_Review = this.lstPrescription.length;
              this.ModuleName = "For Doctor Review";
              break;
          }
          this.totalpending = this.lstPrescription.length;
          this.showHide = true;
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          this.showHide = true;
        }
      );

  }
  selectedObject;
  openNewCrop(result) {
    this.selectedObject = result;
    debugger;
    if (result.ext_patient_id == null || result.ext_patient_id == "" || result.ext_patient_id == "0" || result.ext_patient_id.toString().toUpperCase().lastIndexOf("PROCARE") > -1) {
      this.isShowPatient = true;
      this.buildForm();
      (this.frmSearch.get("cntrlpatientSearch") as FormControl).setValue(result.pat_dob);
      return;
    }
    else {
      this.isShowPatient = false;
      (this.frmSearch.get("cntrlpatientSearch") as FormControl).setValue("");
    }
    this.generateXml(result)

  }
  generateXml(result) {
    let prescripXML: PrescriptionXml = new PrescriptionXml();
    // let resultObj;   
    let resultObj: any[] = [{ patient_id: '', chart_id: '', provider_id: '', location_id: '', externalprescriptionid: '' }]
    resultObj[0].patient_id = result.ext_patient_id;
    resultObj[0].chart_id = "";
    resultObj[0].provider_id = result.ext_providerid;
    resultObj[0].location_id = result.ext_location_id;
    resultObj[0].externalprescriptionid = result.prescription_guid;

    prescripXML = this.genXml.prepareObject(prescripXML, resultObj[0], this.lookupList);
    if (prescripXML.msg != "") {
      // alert("Rx Credentials are not correct, Please contact Administrator.");
      alert(prescripXML.msg);
      return false;
    }
    switch (result.status_section) {
      case "StaffProcessing":
      case "AllDoctorReview":
      case "DrReview":
        prescripXML.requestedpage = "status";
        break;
      case "FailedFax":
        prescripXML.requestedpage = "rxdetail";
        break;
      case "Refill":
        prescripXML.requestedpage = "renewal";
        break;
      default:
        prescripXML.requestedpage = "status";
        break;
    }

    this.Prescriptionlink = prescripXML.prescriptionlink;
    this.encounterService.getPrescriptionXml(prescripXML)
      .subscribe(
        data => {
          this.prescriptionXmlResult(data)
        },
        error => {
          this.PrescriptionError(error);
        }
      );
  }

  prescriptionXmlResult(data) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.post_xml = data.result;
      this.loadIrx();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.modalService, "Prescription", data.result, AlertTypeEnum.WARNING);
    }
  }

  PrescriptionError(error) {
    this.logMessage.log("Error on Prescription.");
  }

  loadIrx() {
    debugger;
    const modalRef = this.modalService.open(NewcropComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.patient_name = "Patient Prescription - " + this.ModuleName;//this.objencounterToOpen.openPatientInfo.last_name+", "+this.objencounterToOpen.openPatientInfo.first_name +"(DOB: "+this.objencounterToOpen.openPatientInfo.patient_DOB+")";
    modalRef.componentInstance.post_xml = this.post_xml;
    modalRef.componentInstance.prescription_link = this.Prescriptionlink;

    modalRef.result.then((result) => {
      debugger;
      if (result != "") {
        // this.getAllPrescription();
      }
    }, (reason) => {
    });
  }
  openSelectPatient(patient) {
    debugger;
    this.selectedObject.ext_patient_id = patient.patient_id
    this.isShowPatient = false;
    this.generateXml(this.selectedObject);
    //this.patient_id=patient.patient_id;
    //(this.frmSearch.get("cntrlpatientSearch") as FormControl).setValue(patient.name);


  }
  closePatientSearch() {
    this.isShowPatient = false;
  }

  radioOption: string = 'refills';
  onOptionChange(option: any) {
    this.radioOption = option;
    debugger;

    switch (this.radioOption) {
      case "physician_pending":
        this.getData("Physician Pending");        
        break;
      case "staff_pending":
        this.getData("Staff Pending");
        break;
      case "failed":
        this.getData("Failed");
        break;
      case "refills":
        this.getData("Refills");
        break;
      case "for_physician_review":
        this.getData("For Physician Review");
        break;
    }

    

  }
  enlargeScreen()  
  {
    this.openModule.emit();
  }

}
