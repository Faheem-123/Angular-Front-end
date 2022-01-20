import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { DateDifference } from 'src/app/models/general/date-difference';
import { ClaimRulesService } from 'src/app/services/billing/claim-rules.service';



@Component({
  selector: 'import-icd-cpt',
  templateUrl: './import-icd-cpt.component.html',
  styleUrls: ['./import-icd-cpt.component.css']
})
export class ImportIcdCptComponent implements OnInit {

  @Input() patientId: number;
  @Input() claimId: number;
  @Input() dos: string;
  @Input() providerId: string;
  @Input() locationId: string;
  @Input() patientClaimRuleInfo: any;
  @Output() onImport = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();
  


  isLoading: boolean = true;

  lstEncounterProcedures: Array<any>;
  lstEncounterDiagnosis: Array<any>;

  lstLabOrders: Array<any>;
  lstLabProcedures: Array<any>;
  lstLabDiagnosis: Array<any>;
  lstLabProceduresFiltered: Array<any>;
  lstLabDiagnosisFiltered: Array<any>;

  lstPreviousClaims: Array<any>;
  lstPreviousClaimProcedures: Array<any>;
  lstPreviousClaimDiagnosis: Array<any>;

  selectedLabOrderId: number;
  selectedClaimId: number;


  lstSelectedDiagnosis: Array<any>;
  /*=[
    {code:"Z00.121",description:"Encounter for routine child health exam w abnormal findings"},
    {code:"J06.9",description:"Acute upper respiratory infection, unspecified"},
    {code:"L22",description:"Diaper dermatitis"},
    {code:"Z23",description:"Encounter for immunization"},
    {code:"K00.7",description:"Teething syndrome"}
  ]
  */
  lstSelectedProcedures: Array<any>;
  /*=[
    {code:"23490",description:"PROPHYLACTIC TREATMENT (NAILING, PINNING, PLATING OR WIRING) WITH OR WITHOUT METHYLMETHACRYLATE; CLAVICLE\">PROPHYLACTIC TREATMENT (NAILING, PINNING, PLATING OR WIRING) WITH OR WITHOUT METHYLMETHACRYLATE; CLAVICLE"},
    {code:"99213",description:"Office Vst Level 3"},
    {code:"99392",description:"Hth Ck Est 1-4"},
    {code:"90670",description:"Prevnar 13 pneumoncoccal"},
    {code:"90698",description:"Pentacel Vaccine"}
  ]*/

  preLoadingCount: number = 0;

  ageWrtDos: DateDifference

  popupScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
  };

  constructor(private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private claimService: ClaimService,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private claimRulesService:ClaimRulesService) { }

  ngOnInit() {

    debugger;

    this.isLoading = true;

    this.preLoadingCount = 5;
    this.getLabOrders();
    this.getEncounterProcedures();
    this.getEncounterDiagnosis()
    this.getLabDiagnosis();
    this.getLabProcedures();
    this.getPreviousClaim();
  


    //let dobDate = this.dateTimeUtil.getDateTimeFromString(this.patientClaimRuleInfo.dob, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    //let dosDate = this.dateTimeUtil.getDateTimeFromString(this.dos, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    //this.ageWrtDos = this.dateTimeUtil.calculateDateDiferrence(dobDate, dosDate);



  }

  filterLabOrderICDCPTs() {

    this.lstLabProceduresFiltered = undefined;
    this.lstLabDiagnosisFiltered = undefined;

    if (this.selectedLabOrderId != undefined) {
      if (this.lstLabProcedures != undefined) {
        this.lstLabProceduresFiltered = new ListFilterPipe().transform(this.lstLabProcedures, "order_id", this.selectedLabOrderId);
      }
      if (this.lstLabDiagnosis != undefined) {
        this.lstLabDiagnosisFiltered = new ListFilterPipe().transform(this.lstLabDiagnosis, "order_id", this.selectedLabOrderId);
      }
    }
  }


  getLabOrders() {


    this.lstLabOrders = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.dos == undefined ? "" : this.dos, option: "" },
      { name: "provider_id", value: this.providerId == undefined ? "" : this.providerId, option: "" },
      { name: "location_id", value: this.locationId == undefined ? "" : this.locationId, option: "" }
    ];

    this.claimService.getClaimImportLabOrders(searchCriteria).subscribe(
      data => {
        this.lstLabOrders = data as Array<any>;
        debugger;
        if (this.lstLabOrders != undefined && this.lstLabOrders.length > 0) {
          this.selectedLabOrderId = this.lstLabOrders[0].order_id;
        }
        this.preLoadingCount--
        if (this.preLoadingCount <= 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.onGetClaimImportLabOrdersError(error);
      }
    );
  }

  onGetClaimImportLabOrdersError(error: any) {
    this.logMessage.log("getClaimImportLabOrders Error.");
  }
  getPreviousClaim() {

    this.lstPreviousClaims = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.dos == undefined ? "" : this.dos, option: "" },
      { name: "provider_id", value: this.providerId == undefined ? "" : this.providerId, option: "" },
      { name: "location_id", value: this.locationId == undefined ? "" : this.locationId, option: "" }
    ];

    this.claimService.getPreviousCalimImport(searchCriteria).subscribe(
      data => {
        this.lstPreviousClaims = data as Array<any>;
        debugger;
        if (this.lstPreviousClaims != undefined && this.lstPreviousClaims.length > 0) {
          this.selectedClaimId = this.lstPreviousClaims[0].claim_id;
        }
        this.preLoadingCount--
        if (this.preLoadingCount <= 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.logMessage.log("getPreviousCalimImport Error.");
      }
    );
  }

  getEncounterProcedures() {

    this.lstEncounterProcedures = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.option = "encounter_procedures";
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.dos == undefined ? "" : this.dos, option: "" },
      { name: "provider_id", value: this.providerId == undefined ? "" : this.providerId, option: "" },
      { name: "location_id", value: this.locationId == undefined ? "" : this.locationId, option: "" }
    ];

    this.claimService.getClaimImportProc(searchCriteria).subscribe(
      data => {
        this.lstEncounterProcedures = data as Array<any>;
        this.preLoadingCount--
        if (this.preLoadingCount <= 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.onGetClaimImportProcError(error);
      }
    );
  }

  onGetClaimImportProcError(error: any) {
    this.logMessage.log("getClaimImportProc Error.");
  }

  getEncounterDiagnosis() {
    this.lstEncounterDiagnosis = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.option = "encounter_diagnosis";
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.dos == undefined ? "" : this.dos, option: "" },
      { name: "provider_id", value: this.providerId == undefined ? "" : this.providerId, option: "" },
      { name: "location_id", value: this.locationId == undefined ? "" : this.locationId, option: "" }
    ];

    this.claimService.getClaimImportDiag(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstEncounterDiagnosis = data as Array<any>;
        this.preLoadingCount--
        if (this.preLoadingCount <= 0) {
          this.isLoading = false;
          this.filterLabOrderICDCPTs();
        }
      },
      error => {
        this.isLoading = false;
        this.ongetEncounterDiagnosisError(error);
      }
    );
  }

  ongetEncounterDiagnosisError(error: any) {
    this.logMessage.log("getClaimImportDiag Error.");
  }



  getLabProcedures() {

    this.lstEncounterProcedures = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.option = "lab_procedures";
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.dos == undefined ? "" : this.dos, option: "" },
      { name: "provider_id", value: this.providerId == undefined ? "" : this.providerId, option: "" },
      { name: "location_id", value: this.locationId == undefined ? "" : this.locationId, option: "" }
    ];

    this.claimService.getClaimImportProc(searchCriteria).subscribe(
      data => {
        this.lstLabProcedures = data as Array<any>;
        this.preLoadingCount--
        if (this.preLoadingCount <= 0) {
          this.isLoading = false;
          this.filterLabOrderICDCPTs();
        }
      },
      error => {
        this.isLoading = false;
        this.ongGetLabProceduresError(error);
      }
    );
  }
  ongGetLabProceduresError(error: any) {
    this.logMessage.log("getLabProcedures Error.");
  }

  getLabDiagnosis() {

    this.lstEncounterDiagnosis = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.option = "lab_diagnosis";
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "dos", value: this.dos == undefined ? "" : this.dos, option: "" },
      { name: "provider_id", value: this.providerId == undefined ? "" : this.providerId, option: "" },
      { name: "location_id", value: this.locationId == undefined ? "" : this.locationId, option: "" }
    ];

    this.claimService.getClaimImportDiag(searchCriteria).subscribe(
      data => {
        this.lstLabDiagnosis = data as Array<any>;
        this.preLoadingCount--
        if (this.preLoadingCount <= 0) {
          this.isLoading = false;
          this.filterLabOrderICDCPTs();
        }
      },
      error => {
        this.isLoading = false;
        this.onGetLabDiagnosisError(error);
      }
    );
  }

  onGetLabDiagnosisError(error: any) {
    this.logMessage.log("getLabDiagnosis Error.");
  }

  labSelectionChanged(orderId: number) {
    this.selectedLabOrderId = orderId;
    this.filterLabOrderICDCPTs();
  }
  previousClaimSelectionChanged(claimId: number) {
    this.selectedClaimId = claimId;
    this.getProClaimProcedures();
    this.getProClaimDiagnosis();
    
  }
  getProClaimProcedures() {
    this.claimService.getProClaimProcedures(this.selectedClaimId,false).subscribe(
      data => {

        this.lstPreviousClaimProcedures = data as Array<any>;
      },
      error => {
        this.isLoading = false;
        this.logMessage.log("getProClaimProcedures Error.");
      }
    );
  }
  getProClaimDiagnosis() {
    this.claimService.getProClaimDiagnosis(this.selectedClaimId,false).subscribe(
      data => {
        this.lstPreviousClaimDiagnosis = data as Array<any>;
      },
      error => {
        this.isLoading = false;
        this.logMessage.log("getProClaimDiagnosis Error.");
      }
    );
  }
  
  addClaimProcToSelectedList(element: any) {
   
      if (this.lstSelectedProcedures == undefined)
        this.lstSelectedProcedures = new Array<any>();

      this.lstSelectedProcedures.push(
        {
          code: element.proc_code,
          description: element.description,
          charges:element.charges,
          ndc_code:"",
          modifier:element.mod1,
        }
      );
  }
  addProcToSelectedList(element: any) {

    if (element.is_expired) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.popupScreenOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      modalRef.componentInstance.promptHeading = 'Procedure Code Expired!';
      modalRef.componentInstance.promptMessage = element.code + ' is expired,<br> Please use alternate code.';
    }
    else {
      if (this.lstSelectedProcedures == undefined)
        this.lstSelectedProcedures = new Array<any>();

      this.lstSelectedProcedures.push(
        {
          code: element.code,
          description: element.description,
          charges:element.charges,
          ndc_code:"",
          modifier:"",
        }
      );
    }



  }

  removeProcFromSelectedList(index: number) {
    this.lstSelectedProcedures.splice(index, 1)
  }

  removeAllSelectedProcedures() {
    this.lstSelectedProcedures = undefined;
  }
  isProcedureAdded(procCode: string) {



    let isAdded: boolean = false;
    if (this.lstSelectedProcedures != null) {
      this.lstSelectedProcedures.forEach(element => {
        if (element.code == procCode) {
          isAdded = true;
        }

      });
    }

    return isAdded;
  }

  addClaimDiagToSelectedList(element: any) {
      if (this.lstSelectedDiagnosis == undefined)
        this.lstSelectedDiagnosis = new Array<any>();
      this.lstSelectedDiagnosis.push(
        {
          diag_code: element.diag_code,
          diag_description: element.description,
          code_type:'ICD-10'
        }
      );
  }
  addDiagToSelectedList(element: any) {

    debugger;

    let dosDate:Date = this.dateTimeUtil.getDateTimeFromString(this.dos, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    let validattionMsg:string=this.claimRulesService.validateDiagnosisRules(dosDate,element,this.patientClaimRuleInfo);
    if (validattionMsg!=undefined) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.popupScreenOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      modalRef.componentInstance.promptHeading = 'Diagnosis Age/Gender Validation';
      modalRef.componentInstance.promptMessage = validattionMsg;

      return;
    }

    if (element.is_expired) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.popupScreenOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      modalRef.componentInstance.promptHeading = 'Diagnosis Code Expired!';
      modalRef.componentInstance.promptMessage = element.code + ' is expired,<br> Please use alternate code.';
    }
    else {

      if (this.lstSelectedDiagnosis == undefined)
        this.lstSelectedDiagnosis = new Array<any>();

      this.lstSelectedDiagnosis.push(
        {
          diag_code: element.code,
          diag_description: element.description,
          code_type:'ICD-10'
        }
      );
    }
  }
   

  removeDiagFromSelectedList(index: number) {
    this.lstSelectedDiagnosis.splice(index, 1)
  }
  removeAllSelectedDiagnosis() {
    this.lstSelectedDiagnosis = undefined;
  }

  isDiagnosisAdded(diagCode: string) {
debugger;
    let isAdded: boolean = false;
    if (this.lstSelectedDiagnosis != null) {
      this.lstSelectedDiagnosis.forEach(element => {
        if (element.diag_code == diagCode) {
          isAdded = true;
        }

      });
    }

    return isAdded;
  }

  onImportCodes() {

    debugger;
    if((this.lstSelectedDiagnosis==undefined || this.lstSelectedDiagnosis.length==0)
    && (this.lstSelectedProcedures==undefined || this.lstSelectedProcedures.length==0)){

      const modalRef = this.modalService.open(AlertPopupComponent, this.popupScreenOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.INFO;
      modalRef.componentInstance.promptHeading = 'Import Procedures/Diagnosis';
      modalRef.componentInstance.promptMessage = "No Code is selected.";

      return;
    }

    let lstSelectedCodes: any = { diagnosis_list: this.lstSelectedDiagnosis, procedures_list: this.lstSelectedProcedures };

    this.onImport.emit(lstSelectedCodes);
  }
}
