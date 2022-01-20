import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { LogMessage } from '../../../shared/log-message';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ServiceResponseStatusEnum, PromptResponseEnum, OperationType, CallingFromEnum, PatientSubTabsEnum } from '../../../shared/enum-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { GeneralService } from '../../../services/general/general.service'
import { GeneralOperation } from '../../../shared/generalOperation';
import { CustomValidators, datetimeValidator } from '../../../shared/custome-validators';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { ReportsService } from '../../../services/reports.service';
import { PagerService } from '../../../services/pager.service';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { excelService } from 'src/app/shared/excelService';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService, PagingOptions } from 'src/app/services/sort-filter-pagination.service';
import { ExcelColumn } from 'src/app/models/general/excel-column';
import { Wrapper_ExcelColumn } from 'src/app/models/general/Wrapper_ExcelColumn';
import * as FileSaver from 'file-saver';
import { EncounterPrintViewerComponent } from 'src/app/general-modules/encounter-print-viewer/encounter-print-viewer.component';
import { Chartreport_Print } from 'src/app/models/encounter/Chartreport_Print';
@Component({
  selector: 'encounter-report',
  templateUrl: './encounter-report.component.html',
  styleUrls: ['./encounter-report.component.css']
})
export class EncounterReportComponent implements OnInit {

  patientId: number;
  showPatientSearch: boolean = false;
  isOrderCrs: boolean = false;
  patientName: string;
  selectedOption = "ENCOUNTER";
  cmbReportSelection = "";

  searchOption = "";
  save_criteria = "";
  criteria = ""
  reportName = "Encounter Report";
  lstEncounterReport;
  lstEncounterReportDB;
  lstClaimwithInsignEncounter;
  lstMissingClaims;
  lstMissingClaimsDB;
  lstDataPrint;
  toolTipText = "";
  lstOrderCross;
  isLoading: boolean = false;
  reportSearchCriteria: SearchCriteria;
  totalRecords = "0";
  pagingOptions: PagingOptions;
  totalPages: number;
  page: number = 1;
  pageSize: number = 10;
  private objchartReport: Chartreport_Print;
  openedClaimInfo: OpenedClaimInfo;
  encounterReportForm: FormGroup;
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };


  popUpOptionslarge: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',

  };

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder, private generalOperation: GeneralOperation,
    private dateTimeUtil: DateTimeUtil, private excel: excelService,
    private reportsService: ReportsService, private encounterService: EncounterService,
    private generalService: GeneralService, private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private pagerService: PagerService,
    private sortFilterPaginationService: SortFilterPaginationService) {

  }

  ngOnInit() {
    this.isLoading = true;
    this.buildForm();

    this.cmbReportSelection = "encounter missing encounter claim";
    this.createTooltip();
    this.isLoading = false;
  }
  getProviderList() {
    this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.providerList = data as Array<any>;
      },
      error => {
        this.getProviderListError(error);
      }
    );
  }
  getProviderListError(error) {
    this.logMessage.log("getProviderList Error." + error);
  }
  getLocationsList() {
    this.generalService.getLocation(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.locationList = data as Array<any>;
      },
      error => {
        this.getLocationListError(error);
      }
    );
  }
  getLocationListError(error) {
    this.logMessage.log("getLocationList Error." + error);
  }
  buildForm() {
    this.encounterReportForm = this.formBuilder.group({
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null),
      cmbreport: this.formBuilder.control('Encounter'),
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider == 0 ? '' : this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation == 0 ? '' : this.lookupList.logedInUser.defaultLocation),
      chkOrderCross: this.formBuilder.control("")
    })/*,
    {
      validator: Validators.compose([
        CustomValidators.validDate('dateFrom', false),
        CustomValidators.validDate('dateTo', true)
      ])
    }*/
  }


  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {


      this.patientId = undefined;
      this.encounterReportForm.get("txtPatientIdHidden").setValue(null);
    }


    //this.patientName=undefined;
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.encounterReportForm.get("txtPatientSearch").setValue(null);
      this.encounterReportForm.get("txtPatientIdHidden").setValue(null);
    }
    //this.patientId=undefined;
  }
  openSelectPatient(patObject) {
    debugger;
    this.logMessage.log(patObject);

    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;
      modalRef.result.then((result) => {

        //alert(result);
        if (result === PromptResponseEnum.OK) {
          this.closePatientSearch();
        }
      }
        , (reason) => {
          //alert(reason);
        });

      return;
    }


    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;

    (this.encounterReportForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    (this.encounterReportForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);

    this.showPatientSearch = false;

  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  onSearchClick(formData) {
    this.isExcelExport = false;
    this.isPrint = false;
    this.page = 1;
    this.searchReport(formData);
  }
  searchReport(formData) {
    debugger;
    //let a = (this.encounterReportForm.get('chkOrderCross') as FormControl).value;
    this.isLoading = true;
    if (this.isExcelExport == false && this.isPrint == false)
      this.clearReports();

    this.searchOption = "";
    this.save_criteria = "";
    this.criteria = "";
    this.searchOption = "ENCOUNTER";
    if (this.selectedOption.toLowerCase() == "encounter") {
      this.searchOption = "ENCOUNTER";
      this.save_criteria += " (Encounters) ";
    } else if (this.selectedOption.toLowerCase() == "missing encounters") {
      this.searchOption = "MISSING_ENCOUNTER";
      this.save_criteria += " (Missing Encounters) ";
    } else if (this.selectedOption.toLowerCase() == "claims") {
      this.searchOption = "CLAIM";
      this.save_criteria += " (Claims) ";
    }
    let dateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let dateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    this.reportSearchCriteria = new SearchCriteria();
    this.reportSearchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.reportSearchCriteria.param_list = [];

    this.reportSearchCriteria.param_list.push({ name: "cmbProvider", value: ((this.encounterReportForm.get('cmbProvider') as FormControl).value == null ? "" : (this.encounterReportForm.get('cmbProvider') as FormControl).value), option: "" });
    this.reportSearchCriteria.param_list.push({ name: "cmbLocation", value: ((this.encounterReportForm.get('cmbLocation') as FormControl).value == null ? "" : (this.encounterReportForm.get('cmbLocation') as FormControl).value), option: "" });
    this.reportSearchCriteria.param_list.push({ name: "dateFrom", value: dateFrom, option: "" });
    this.reportSearchCriteria.param_list.push({ name: "dateTo", value: dateTo, option: "" });
    this.reportSearchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
    this.reportSearchCriteria.param_list.push({ name: "pageIndex", value: (this.isExcelExport || this.isPrint) ? "0" : this.page, option: "" });
    this.reportSearchCriteria.param_list.push({ name: "pageSize", value: (this.isExcelExport || this.isPrint) ? "0" : this.pageSize, option: "" });
    this.reportSearchCriteria.param_list.push({ name: "searchOption", value: this.searchOption, option: "" });

    if (this.isExcelExport) {
      //Same for Encounter|Missing ENcounter|Claim
      let lstColumns: Array<any> = new Array<any>();

      if (this.selectedOption.toLowerCase() == "missing claims") {
        lstColumns = [
          new ExcelColumn('alternate_account', 'PID'),
          new ExcelColumn('patient_name', 'Patient Name'),
          new ExcelColumn('dos', 'DOS'),
          new ExcelColumn('provider_name', 'Provider'),
          new ExcelColumn('location_name', 'Location'),
          new ExcelColumn('hpi', 'Reason F/V'),
        ];
      }
      else if (this.selectedOption.toLowerCase() == "order cross") {
        lstColumns = [
          new ExcelColumn('pid', 'PID'),
          new ExcelColumn('pat_name', 'Patient Name'),
          new ExcelColumn('order_date', 'Order Date'),
          new ExcelColumn('status_detail', 'Status Date'),
          new ExcelColumn('order_provider', 'Provider'),
          new ExcelColumn('order_location', 'Location'),
        ];
      }

      else if (this.selectedOption.toLowerCase() == "ready claim with unsign encounter") {
        lstColumns = [
          new ExcelColumn('patient_name', 'Patient Name'),
          new ExcelColumn('chart_provider', 'Provider Name'),
          new ExcelColumn('visit_date', 'Visit Date'),
          new ExcelColumn('claim_date_created', 'Claim Date'),

        ];
      }
      else {
        lstColumns = [
          new ExcelColumn('alternate_account', 'PID'),
          new ExcelColumn('patient_name', 'Patient Name'),
          new ExcelColumn('dob', 'DOB'),
          new ExcelColumn('app_date', 'Appointment Date'),
          new ExcelColumn('app_time', 'Appointment Time'),
          new ExcelColumn('app_status', 'Appointment Status'),
          new ExcelColumn('source', 'Appointment Source'),
          new ExcelColumn('provider', 'Provider'),
          new ExcelColumn('location', 'Location'),
          new ExcelColumn('reason_detail', 'Encounter Reason'),
        ];
      }

      let wrapper: Wrapper_ExcelColumn = new Wrapper_ExcelColumn();
      wrapper.lst_excel_columns = lstColumns;
      this.reportSearchCriteria.param_list.push({ name: "excelColumn", value: JSON.stringify(wrapper), option: "" });

      // if(this.selectedOption.toLowerCase()=="encounter")    
      // {
      //   this.excel.exportAsExcelFile(this.lstEncounterReport,'alternate_account,app_date,app_time,app_status,source,reason_detail,patient_name,dob,provider,location', 'RPT_Encounter');
      // }
      // if(this.selectedOption.toLowerCase()=="missing claims"){
      //   this.excel.exportAsExcelFile(this.lstMissingClaims,'alternate_account,patient_name,dos,hpi,provider_name,location_name', 'RPT_MISSINGCLAIM');
      // }
      // if(this.selectedOption.toLowerCase()=="order cross" )
      // {
      //   this.excel.exportAsExcelFile(this.lstOrderCross,'pid,pat_name,order_date,status_detail,category,order_provider,order_location', 'RPT_ORDERCROSS');      
      // }
    }

    if (this.selectedOption.toLowerCase() == "missing claims") {
      if (this.isExcelExport) {
        this.reportSearchCriteria.option = "getMissingClaimsReport";
        this.callExportReport(this.reportSearchCriteria);
      }
      else {
        this.reportsService.getMissingClaimsReport(this.reportSearchCriteria).subscribe(
          data => {
            debugger;
            if (this.isPrint) {
              this.lstDataPrint = data;
              this.Print_MissingClaims(this.selectedOption);
              this.isPrint = false;
            }
            else {
              this.lstMissingClaims = data;
              this.lstMissingClaimsDB = data;
              if (this.lstMissingClaims.length > 0)
                this.SelectedMissingClaimS_no = this.lstMissingClaims[0].s_no;

              if (this.lstMissingClaims != null && this.lstMissingClaims.length > 0) {
                this.totalPages = this.lstMissingClaims[0].total_count;
                // this.setPage(1);
                this.totalRecords = this.totalPages.toString();
              }
              else {
                this.totalRecords = "0";
                this.totalPages = 0;
              }
            }
            this.isLoading = false;
            return;
          },
          error => {
            this.totalRecords = "0";
            this.totalPages = 0;
            return;
          }
        );
      }
    }
    else if (this.selectedOption.toLowerCase() == "order cross" && (this.encounterReportForm.get('chkOrderCross') as FormControl).value == false) {
      if (this.isExcelExport) {
        this.reportSearchCriteria.option = "getOrderCross_False";
        this.callExportReport(this.reportSearchCriteria);
      }
      else {
        this.reportsService.getOrderCross_False(this.reportSearchCriteria).subscribe(
          data => {
            debugger;

            this.lstOrderCross = data;

            if (this.lstOrderCross != null && this.lstOrderCross.length > 0) {
              this.totalPages = this.lstOrderCross[0].total_count;
              // this.setPage(1);
              this.totalRecords = this.totalPages.toString();
            }
            else {
              this.totalRecords = "0";
              this.totalPages = 0;
            }

            this.isLoading = false;
            return;
          },
          error => {
            this.totalRecords = "0";
            this.totalPages = 0;
            return;
          }
        );
      }
      ////////////////////
    }
    else if (this.selectedOption.toLowerCase() == "order cross" && (this.encounterReportForm.get('chkOrderCross') as FormControl).value == true) {
      if (this.isExcelExport) {
        this.reportSearchCriteria.option = "getOrderCross_True";
        this.callExportReport(this.reportSearchCriteria);
      }
      else {
        this.reportsService.getOrderCross_True(this.reportSearchCriteria).subscribe(
          data => {
            debugger;
            this.lstOrderCross = data;

            if (this.lstOrderCross != null && this.lstOrderCross.length > 0) {
              this.totalPages = this.lstOrderCross[0].total_count;
              // this.setPage(1);
              this.totalRecords = this.totalPages.toString();
            }
            else {
              this.totalRecords = "0";
              this.totalPages = 0;
            }
            this.isLoading = false;
            return;
          },
          error => {
            this.totalRecords = "0";
            this.totalPages = 0;
            return;
          }
        );
      }

    }
    else if (this.selectedOption.toLowerCase() == "ready claim with unsign encounter") {
      this.searchOption = "CLAIM_WITH_UNSIGN_ENCOUNTER";
      if (this.isExcelExport) {
        this.reportSearchCriteria.option = "getClaimwithUnsignedEncounter";
        this.callExportReport(this.reportSearchCriteria);
      }
      else {
        this.reportsService.getClaimwithUnsignedEncounter(this.reportSearchCriteria).subscribe(
          data => {
            debugger;
            if (this.isPrint) {
              this.lstDataPrint = data;
              this.Print_unSing(this.selectedOption);
              this.isPrint = false;
            }
            else {


              this.lstClaimwithInsignEncounter = data;

              if (this.lstClaimwithInsignEncounter != null && this.lstClaimwithInsignEncounter.length > 0) {
                this.totalPages = this.lstClaimwithInsignEncounter[0].total_count;
                // this.setPage(1);
                this.totalRecords = this.totalPages.toString();
              }
              else {
                this.totalRecords = "0";
                this.totalPages = 0;
              }
            }
            this.isLoading = false;
            return;
          },
          error => {
            this.totalRecords = "0";
            this.totalPages = 0;
            return;
          }
        );
      }
    }
    else {
      if (this.isExcelExport) {
        this.reportSearchCriteria.option = "getEncounterReport";
        this.callExportReport(this.reportSearchCriteria);
      }
      else {
        this.reportsService.getEncounterReport(this.reportSearchCriteria).subscribe(
          data => {
            debugger;
            if (this.isPrint) {
              this.lstDataPrint = data;
              this.printSame(this.selectedOption);
              this.isPrint = false;
            }
            else {
              this.lstEncounterReport = data;
              this.lstEncounterReportDB = data;
              this.selectedEncRow = 0;
              if (this.lstEncounterReport != null && this.lstEncounterReport.length > 0) {
                this.totalPages = this.lstEncounterReport[0].total_count;
                // this.setPage(1);
                this.totalRecords = this.totalPages.toString();
              }
              else {
                this.totalRecords = "0";
                this.totalPages = 0;
              }
            }
            this.isLoading = false;
          },
          error => {
            this.totalRecords = "0";
            this.totalPages = 0;
          }
        );
      }
    }
  }
  callExportReport(searchCriteria: SearchCriteria) {
    let downloadPath = "";
    this.reportsService.getExportResult(searchCriteria).subscribe(
      data => {
        debugger;
        if (data['result'] != '') {
          //download
          //this.downloafile(data, ".xlsx", this.selectedOption+"_"+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
          this.generalOperation.downloaExcelFile(data, ".xlsx", this.selectedOption + "_" + this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
          this.isLoading = false;
          this.isExcelExport = false;
        }
        else {
          //error
          debugger;
        }
      },
      error => {
        debugger;
      }
    );
  }
  // pager object
  pager: any = {};
  // paged items
  pagedItems: any[];
  setPage(page: number) {
    debugger;
    // get pager object from service
    this.pager = this.pagerService.getPager(this.lstEncounterReport.length, page);

    // get current page of items
    this.pagedItems = this.lstEncounterReport.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }
  cmbReportChagne(event) {
    debugger;
    this.totalRecords = "0";
    this.selectedOption = event.currentTarget.value;
    if (this.selectedOption.toLowerCase() == "encounter") {
      this.reportName = "Encounter Report";
      this.cmbReportSelection = "encounter missing encounter claim";
      this.isOrderCrs = false;
    }
    if (this.selectedOption.toLowerCase() == "missing encounters") {
      this.reportName = "Missing Encounters Report";
      this.cmbReportSelection = "encounter missing encounter claim";
      this.isOrderCrs = false;
    }
    if (this.selectedOption.toLowerCase() == "claims") {
      this.reportName = "Claims Report";
      this.cmbReportSelection = "encounter missing encounter claim";
      this.isOrderCrs = false;
    }
    if (this.selectedOption.toLowerCase() == "missing claims") {
      this.reportName = "Missing Claims Report";
      this.cmbReportSelection = "missing claim";
      this.isOrderCrs = false;
    }
    if (this.selectedOption.toLowerCase() == "order cross") {
      this.reportName = "Order Cross Report";
      this.cmbReportSelection = "order cross";
      this.isOrderCrs = true;
    }
    // if(this.selectedOption.toLowerCase()=="order cross"){//without checkbox check here/
    //   this.reportName = "Order Cross Report";
    //   this.cmbReportSelection = "order cross";
    // }
    if (this.selectedOption.toLowerCase() == "ready claim with unsign encounter") {
      this.reportName = "Ready Claim With UnSign Encounter Report";
      this.cmbReportSelection = "ready claim with unSign encounter";
      this.isOrderCrs = false;
    }
    this.createTooltip();
  }
  createTooltip() {
    this.toolTipText = "";
    if (this.cmbReportSelection != "order cross") {
      this.toolTipText = "Date From/To is Appointment Date, you can also specific your search by selecting  " +
        "Patient, Location or Provider, and you can change your report by selecting report type from report dropdown. ";
    } else {
      this.toolTipText = "Date From/To is Appointment Date, you can also specific your search by selecting  " +
        "Patient, Location or Provider, and you can change your report by selecting report type from report dropdown. Order Cross.  ";
    }

  }
  openPatient(patient) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }
  loadmodule = false;
  missingClaimIndex = 0;
  openClaim(obj, index) {
    debugger;
    this.patientName = obj.patient_name + ' ( ' + obj.alternate_account + ' )';

    this.openedClaimInfo = new OpenedClaimInfo(undefined, obj.patient_id, obj.provider_id, obj.location_id, obj.dos, OperationType.ADD, false,
      CallingFromEnum.DASHBOARD, obj.provider_name, obj.location_name, undefined, undefined, undefined, undefined);
    this.loadmodule = true;
    this.missingClaimIndex = index;
  }
  MarkAsClaimCreated(obj, index) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Mark As Created !';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to mark selected claim as created ?';
    modalRef.componentInstance.alertType = 'warning';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let searchCrit: SearchCriteria = new SearchCriteria();
        searchCrit.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCrit.param_list = [];

        searchCrit.param_list.push({ name: "chart_id", value: obj.chart_id, option: "" });
        searchCrit.param_list.push({ name: "user", value: this.lookupList.logedInUser.user_name, option: "" });

        this.encounterService.MarkEncounterAsClaimCreated(searchCrit).subscribe(
          data => {
            if (data > 0) {
              this.lstMissingClaims.splice(index, 1);
              this.totalRecords = this.lstMissingClaims.length;
            }
          },
          error => {

          }
        );
      }
    });
  }
  navigateBackToSSummary() {
    debugger;
    this.loadmodule = false;
    this.selectedOption = 'Missing Claims';
    (this.encounterReportForm.get("cmbreport") as FormControl).setValue(this.selectedOption);

  }
  onClaimSaved(claimId: number) {
    debugger;
    //this.lstMissingClaimsDB.splice(this.generalOperation.getitemIndex(this.lstMissingClaimsDB,'claim_id',claimId),1);
    this.lstMissingClaims.splice(this.missingClaimIndex, 1);
    this.totalRecords = this.lstMissingClaims.length;
    if (this.lstMissingClaims.length > 0 && this.missingClaimIndex > this.lstMissingClaims.length)
      this.SelectedMissingClaimS_no = this.lstMissingClaims[this.missingClaimIndex].s_no;
    this.loadmodule = false;
  }
  clearReports() {
    debugger;
    this.lstMissingClaims = undefined;
    this.lstOrderCross = undefined;
    this.lstClaimwithInsignEncounter = undefined;
    this.lstEncounterReport = undefined;
  }
  isExcelExport = false;
  isPrint = false;
  exportAsXLSX() {
    debugger;
    this.isExcelExport = true;
    this.isPrint = false;
    this.searchReport(this.encounterReportForm.value);
  }
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;

  onSortMisClaim(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.searchMissingClaim();
  }

  private searchMissingClaim() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstMissingClaimsDB, this.headers, this.sortEvent, null, null, '');
    this.lstMissingClaims = sortFilterPaginationResult.list;
  }

  onSortEncouonter(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.searchENcounter();
  }

  private searchENcounter() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstEncounterReportDB, this.headers, this.sortEvent, null, null, '');
    this.lstEncounterReport = sortFilterPaginationResult.list;
  }
  SelectedMissingClaimS_no = 0;
  onSelectMissingClaimRow(s_no) {
    this.SelectedMissingClaimS_no = s_no;
  }
  selectedEncRow = 0;
  onEncReportChange(indx) {
    this.selectedEncRow = indx;
  }
  pageOptionChaged() {
    //this.onCallPagingChange();
    this.searchReport(this.encounterReportForm.value);
  }
  pageChange(event) {
    debugger;
    this.page = event;
    this.pagingOptions = new PagingOptions(this.page, this.pageSize)
    this.searchReport(this.encounterReportForm.value);
    //this.search();
  }

  print() {
    debugger;

    this.isPrint = true;
    this.isExcelExport = false;
    this.searchReport(this.encounterReportForm.value);

    /*
    switch (this.selectedOption.toLowerCase()) {
      case "encounter":
      case "missing encounters":
      case "claims":
        this.printSame(this.selectedOption);
        break;
      case "missing claims":
        this.Print_MissingClaims(this.selectedOption);
        break;
      case "ready claim with unSign encounter":
        this.Print_unSing(this.selectedOption);
        break;
  
      default:
        break;
    }
    */
  }

  printSame(header: string) {

    debugger;
    var html: string = "<table width='100%' class='tableMain'><tbody>" +
      "<tr >" +
      "<th colspan='14'>" + header + "</th>" +
      "</tr>" +
      "<tr class='styleModuleSubHeader'>" +
      " 	<td width='10' valign='top'></td>" +
      " 	<td width='60' valign='top' >PID</td> " +
      " 	<td width='65' valign='top'  >App Date</td> " +
      " 	<td width='65' valign='top' >App Time</td> " +
      " 	<td width='65' valign='top'  >App Status</td> " +
      " 	<td width='60' valign='top' >App Source</td> " +
      " 	<td width='65' valign='top'  >Reason</td> " +
      " 	<td  valign='top' >Patient Name</td> " +
      " 	<td width='10' valign='top'>Provider</td>" +
      " 	<td width='65' valign='top'  >Location</td> " +
      "</tr>";

    if (this.lstDataPrint != undefined) {
      let count: number = 1;
      this.lstDataPrint.map(enc => {
        html += "<tr><td valign='top'>" + count++ + "</td> ";
        html += " <td valign='top'>" + enc.alternate_account + "</td> ";
        html += " <td valign='top'>" + enc.app_date + "</td> ";
        html += " <td valign='top'>" + enc.app_time + "</td> ";
        html += " <td valign='top'>" + enc.app_status + "</td> ";
        html += " <td valign='top'>" + enc.source + "</td> ";
        html += "<td valign='top'>" + enc.reason_detail + "</td> ";
        html += " <td valign='top'>" + enc.patient_name + "</td> ";
        html += " <td valign='top'>" + enc.provider + "</td> ";
        html += " <td valign='top'>" + enc.location + "</td> ";
        html += "</tr>";
      })

    }
    html += " </tbody></table>";

    const modalRef = this.ngbModal.open(EncounterPrintViewerComponent, this.popUpOptionslarge);
    modalRef.componentInstance.print_html = html;
  }

  Print_MissingClaims(header: string) {

    var html: String = "<table width='100%' class='tableMain'><tbody>" +
      "<tr >" +
      "<th colspan='14'>" + header + "</th>" +
      "</tr>" +
      "<tr class='styleModuleSubHeader'>" +
      " 	<td width='10' valign='top'></td>" +
      " 	<td width='60' valign='top' >PID</td> " +
      " 	<td width='65' valign='top'  >Patient Name</td> " +
      " 	<td  valign='top' >DOS</td> " +
      " 	<td  valign='top'  >Reason F/V</td> " +
      " 	<td width='60' valign='top' >Provider</td> " +
      " 	<td width='65' valign='top'  >Location</td> " +
      "</tr>";

    if (this.lstDataPrint != undefined) {
      let count: number = 1;
      this.lstDataPrint.map(enc => {
        html += "<tr><td valign='top'>" + count++ + "</td> ";
        html += " <td valign='top'>" + enc.alternate_account + "</td> ";
        html += " <td valign='top'>" + enc.patient_name + "</td> ";
        html += " <td valign='top'>" + enc.dos + "</td> ";
        html += " <td valign='top'>" + enc.hpi + "</td> ";
        html += " <td valign='top'>" + enc.provider_name + "</td> ";
        html += "<td valign='top'>" + enc.location_name + "</td> ";
        html += "</tr>";
      })

    }
    html += " </tbody></table>";

    const modalRef = this.ngbModal.open(EncounterPrintViewerComponent, this.popUpOptionslarge);
    modalRef.componentInstance.print_html = html;
  }

  Print_unSing(header: string) {

    var html: String = "<table width='100%' class='tableMain'><tbody>" +
      "<tr >" +
      "<th colspan='14'>" + header + "</th>" +
      "</tr>" +
      "<tr class='styleModuleSubHeader'>" +
      " 	<td width='10' valign='top'></td>" +
      " 	<td width='60' valign='top' >Patient Name</td> " +
      " 	<td width='65' valign='top'  >Provider Name</td> " +
      " 	<td  valign='top' >Location Name</td> " +
      " 	<td  valign='top'  >Visit Date</td> " +
      " 	<td width='60' valign='top' >Claim Date</td> " +
      "</tr>";

    if (this.lstDataPrint != undefined) {
      let count: number = 1;
      this.lstDataPrint.map(enc => {
        html += "<tr><td valign='top'>" + count++ + "</td> ";
        html += " <td valign='top'>" + enc.patient_name + "</td> ";
        html += " <td valign='top'>" + enc.chart_provider + "</td> ";
        html += " <td valign='top'>" + enc.location_name + "</td> ";
        html += " <td valign='top'>" + enc.visit_date + "</td> ";
        html += " <td valign='top'>" + enc.claim_date_created + "</td> ";
        html += "</tr>";
      })

    }
    html += " </tbody></table>";

    const modalRef = this.ngbModal.open(EncounterPrintViewerComponent, this.popUpOptionslarge);
    modalRef.componentInstance.print_html = html;

  }

  openEncounter(record) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = record.patient_id;
    obj.patient_name = record.patient_name;
    obj.child_module = PatientSubTabsEnum.ENCOUNTER;
    obj.child_module_id = record.chart_id;
    obj.callingFrom = CallingFromEnum.REPORTS;
    this.openModuleService.openPatient.emit(obj);

  }

}
