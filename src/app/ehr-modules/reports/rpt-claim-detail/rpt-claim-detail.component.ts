import { Component, OnInit, Inject, ViewChildren, QueryList, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LogMessage } from '../../../shared/log-message';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum, PatientSubTabsEnum, AlertTypeEnum, CallingFromEnum } from '../../../shared/enum-util';
import { CustomValidators, datetimeValidator } from '../../../shared/custome-validators';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { GeneralService } from '../../../services/general/general.service'
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { ReportsService } from '../../../services/reports.service';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { excelService } from 'src/app/shared/excelService';
import { SortFilterPaginationService, NgbdSortableHeader, SortEvent, SortFilterPaginationResult, PagingOptions } from 'src/app/services/sort-filter-pagination.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { DateModel } from 'src/app/models/general/date-model';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { ExcelColumn } from 'src/app/models/general/excel-column';
import { Wrapper_ExcelColumn } from 'src/app/models/general/Wrapper_ExcelColumn';

@Component({
  selector: 'rpt-claim-detail',
  templateUrl: './rpt-claim-detail.component.html',
  styleUrls: ['./rpt-claim-detail.component.css']
})
export class RptClaimDetailComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  
  isLoading: boolean = false;
  isCollapsed = false;
  claimDetailsReportForm: FormGroup;
  lstPatInsurance: Array<any>;
  lstShowInsuranceSearch: Array<ORMKeyValue> = [];
  lstClaimDetails;
  lstClaimDetailsFooter;
  lstClaimDetailsDB;
  detailView = false;
  btnDetailView = "Detailed View";

  dateType: string = "dos";

  //TOTAL
  ClaimTotal;
  PrimaryPaid;
  SecondaryPaid;
  TertiaryPaid;
  PatientPaid;
  Adjusted;
  WriteOff;
  Risk;
  TotalPaid;
  Balance;
  pagingOptions:PagingOptions;
  totalRecords = "0";
  totalPages: number;
  page: number=1;
  pageSize: number=10;
  isExcelExport=false;
  //
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,private generalOperation:GeneralOperation,
    private dateTimeUtil: DateTimeUtil,
    private reportsService: ReportsService,
    private generalService: GeneralService,
    private claimService: ClaimService,
    private formBuilder: FormBuilder, private excel: excelService,
    private openModuleService: OpenModuleService,
    private sortFilterPaginationService: SortFilterPaginationService) { }

  recordCount;
  showPatientSearch: boolean = false;
  patientName: string;
  patientId: number;
  showInsuranceSearch: boolean = false;
  insuranceId;
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  ngOnInit() {
    this.buildForm();

    if (this.lookupList.lstLabCategory == undefined || this.lookupList.lstLabCategory.length == 0) {
      this.getLabCategory();
    }
    if (this.lookupList.billingUsersList == undefined || this.lookupList.billingUsersList.length == 0) {
      this.getBillingUsersList();
    }
    if (this.lookupList.facilityList == undefined || this.lookupList.facilityList.length == 0) {
      this.getFacilityList();
    }
  }
  buildForm() {
    this.claimDetailsReportForm = this.formBuilder.group({
      dateType: this.formBuilder.control(this.dateType),
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null),
      dpFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtInsuranceName: this.formBuilder.control(null),
      cmbUser: this.formBuilder.control(null),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'':this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'':this.lookupList.logedInUser.defaultLocation),
      cmbInsType: this.formBuilder.control(null),
      cmbStatus: this.formBuilder.control("All"),
      cmbLabCat: this.formBuilder.control(null),
      cmbFacility: this.formBuilder.control(null)
    })
  }

  onDateTypeChange(type: string) {
    this.dateType = type;
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
  getLabCategory() {
    this.generalService.getLabCategory(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.lstLabCategory = data as Array<any>;
      },
      error => {
        this.getgetLabCategoryError(error);
      }
    );
  }
  getgetLabCategoryError(error) {
    this.logMessage.log("getProviderList Error." + error);
  }

  getFacilityList() {
    this.claimService.getFacilityList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.facilityList = data as Array<any>;
      },
      error => {
        this.getFacilityListError(error);
      }
    );
  }
  
  getFacilityListError(error: any) {
    this.logMessage.log("getFacilityList Error." + error);
  }
  getBillingUsersList() {
    this.generalService.getBillingUsersList(this.lookupList.practiceInfo.practiceId, this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.billingUsersList = data as Array<any>;
      },
      error => {
        this.getBillingUsersListError(error);
      }
    );
  }
  getBillingUsersListError(error) {
    this.logMessage.log("getBillingUsersList Error." + error);
  }
  //pateint search start
  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    } else if (event.key == "Backspace") {
      this.showPatientSearch = false;
      this.claimDetailsReportForm.get("txtPatientIdHidden").setValue(null);
      this.claimDetailsReportForm.get("txtPatientSearch").setValue(null);
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {
      this.patientId = undefined;
      this.claimDetailsReportForm.get("txtPatientIdHidden").setValue(null);
    }
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");
    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.claimDetailsReportForm.get("txtPatientSearch").setValue(null);
      this.claimDetailsReportForm.get("txtPatientIdHidden").setValue(null);
    }
  }
  openSelectPatient(patObject) {
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
    (this.claimDetailsReportForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    (this.claimDetailsReportForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  //patient search end

  //insurance search start
  onInsuranceSearchKeydown(event) {

    if (event.key === "Enter") {
      //this.setInsuranceVisiblity("true");
      this.showInsuranceSearch = true;
    } else if (event.key == "Backspace") {
      //this.setInsuranceVisiblity("false");
      this.showInsuranceSearch = false;
      this.claimDetailsReportForm.get("txtInsuranceName").setValue(null);
    } else {
      this.showInsuranceSearch = false;
    }
  }
  addInsurance(obj) {
    debugger;
    this.insuranceId = obj.insurance.insurance_id;
    let insObject = obj.insurance;

    this.logMessage.log(this.insuranceId);
    this.logMessage.log(insObject);
    (this.claimDetailsReportForm.get("txtInsuranceName") as FormControl).setValue(insObject.insurance_name);
    this.showInsuranceSearch = false;
  }

  onInsuranceSearchFocusOut() {
    if ((this.claimDetailsReportForm.get("txtInsuranceName") as FormControl).value == ""
      || (this.claimDetailsReportForm.get("txtInsuranceName") as FormControl).value == undefined) {
      this.insuranceId = undefined;
    }
  }
  closeInsuranceSearch() {
    this.showInsuranceSearch = false;
  }

  validateSearchData(formData: any): boolean {
    let strMsg: string = '';

    if (formData.dateType == undefined || formData.dateType == '') {
      strMsg = "Please select Date Range Type.";
    }
    else if (formData.dpFrom != undefined && formData.dpFrom != '' && strMsg == '' && !this.dateTimeUtil.isValidDateTime(formData.dpFrom, DateTimeFormat.DATE_MODEL)) {
      strMsg = "Date From is not in correct formate.";
    }
    else if (formData.dpTo != undefined && formData.dpTo != '' && strMsg == '' && !this.dateTimeUtil.isValidDateTime(formData.dpTo, DateTimeFormat.DATE_MODEL)) {
      strMsg = "Date To is not in correct formate.";
    }
    else if (formData.dpFrom != undefined && formData.dpFrom != '' && formData.dpTo != undefined && formData.dpTo != '') {
      strMsg = this.dateTimeUtil.validateDateFromDateTo(formData.dpFrom, formData.dpTo, DateTimeFormat.DATE_MODEL, false, true);
    }


    if (strMsg != '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Denial Messages', strMsg, AlertTypeEnum.DANGER)
      return false;
    }

    return true;
  }
  onSearClick(formData)
  {
    this.isExcelExport=false;
    this.searchClaimDetail(formData);
    this.getReportClaimdetailFooter(this.searchCriteria);
    
  }
  searchCriteria: SearchCriteria;
  searchClaimDetail(formData) {
    debugger;

    if (!this.validateSearchData(formData)) {
      return;
    }

    this.searchCriteria  = new SearchCriteria();
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.param_list = [];


    if (formData.dpFrom != undefined && formData.dpFrom != '') {
      this.searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpFrom, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: formData.dateType });
    }
    if (formData.dpTo != undefined && formData.dpTo != '') {
      this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.dpTo, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: formData.dateType });
    }

    //searchCriteria.param_list.push({ name: "date_type", value: (this.claimDetailsReportForm.get('dateType') as FormControl).value, option: "" });
    this.searchCriteria.option="getClaimdetails";
    this.searchCriteria.param_list.push({ name: "patient_id", value: (this.claimDetailsReportForm.get('txtPatientIdHidden') as FormControl).value, option: "" });
    this.searchCriteria.param_list.push({ name: "cmbStatus", value: (this.claimDetailsReportForm.get('cmbStatus') as FormControl).value, option: "" });
    if ((this.claimDetailsReportForm.get('cmbProvider') as FormControl).value != null && (this.claimDetailsReportForm.get('cmbProvider') as FormControl).value != "null")
    this.searchCriteria.param_list.push({ name: "cmbProvider", value: (this.claimDetailsReportForm.get('cmbProvider') as FormControl).value, option: "" });
    if ((this.claimDetailsReportForm.get('cmbLocation') as FormControl).value != null && (this.claimDetailsReportForm.get('cmbLocation') as FormControl).value != "null")
    this.searchCriteria.param_list.push({ name: "cmbLocation", value: (this.claimDetailsReportForm.get('cmbLocation') as FormControl).value, option: "" });
    this.searchCriteria.param_list.push({ name: "cmbUser", value: (this.claimDetailsReportForm.get('cmbUser') as FormControl).value, option: "" });
    if ((this.claimDetailsReportForm.get('txtInsuranceName') as FormControl).value != ""
      && (this.claimDetailsReportForm.get('txtInsuranceName') as FormControl).value != null)
      this.searchCriteria.param_list.push({ name: "insuranceID", value: this.insuranceId, option: "" });

    if ((this.claimDetailsReportForm.get('cmbLabCat') as FormControl).value != "" && (this.claimDetailsReportForm.get('cmbLabCat') as FormControl).value != "0")
    this.searchCriteria.param_list.push({ name: "cmbLabCat", value: (this.claimDetailsReportForm.get('cmbLabCat') as FormControl).value, option: "" });

    if ((this.claimDetailsReportForm.get('cmbFacility') as FormControl).value != null && (this.claimDetailsReportForm.get('cmbFacility') as FormControl).value != "null")
    this.searchCriteria.param_list.push({ name: "cmbFacility", value: (this.claimDetailsReportForm.get('cmbFacility') as FormControl).value, option: "" });

    this.searchCriteria.param_list.push( { name: "pageIndex", value: this.isExcelExport?"0":this.page, option: "" });
    this.searchCriteria.param_list.push( { name: "pageSize", value: this.isExcelExport?"0":this.pageSize, option: "" });
    debugger;
    if(this.isExcelExport)
    {
      let lstColumns: Array<any> = new Array<any>();
      lstColumns = [
        new ExcelColumn('claim_id', 'Claim Id'),
        new ExcelColumn('pname', 'Patient Name'),
        new ExcelColumn('dos', 'DOS'),
        new ExcelColumn('insurance_name', 'Primary Insurance'),
        new ExcelColumn('pri_policy_number', 'Primary.Ins.Policy No'),
        new ExcelColumn('sec_insurance', 'Secondary Insurance'),

        new ExcelColumn('proname', 'Provider'),
        new ExcelColumn('loname', 'Location'),
        new ExcelColumn('facility_name', 'Facility'),

        new ExcelColumn('claim_total', 'Claim Total','amount'),
        new ExcelColumn('amt_paid', 'Amt. Paid','amount'),
        new ExcelColumn('amt_due', 'Amt. Due','amount'),

        new ExcelColumn('pri_paid', 'Pri. Paid','amount'),
        new ExcelColumn('sec_paid', 'Sec. Paid','amount'),
        new ExcelColumn('oth_paid', 'Oth. Paid','amount'),

        new ExcelColumn('patient_paid', 'Pat. Paid','amount'),
        new ExcelColumn('write_off', 'Write Off','amount'),
        new ExcelColumn('risk_amount', 'Risk Amount','amount'),

        new ExcelColumn('adjust_amount', 'Adjusted Amount','amount'),
        new ExcelColumn('claim_notes', 'Last Note'),
        new ExcelColumn('created_user', 'Created user'),
        new ExcelColumn('cpt', 'CPT'),
        new ExcelColumn('icd', 'ICD'),
      ];
      let wrapper:Wrapper_ExcelColumn=new Wrapper_ExcelColumn();
      wrapper.lst_excel_columns= lstColumns;
      this.searchCriteria.param_list.push( { name: "excelColumn", value: JSON.stringify(wrapper), option: "" });
    }
    this.isLoading = true;
    if(this.isExcelExport==false)
    {
      this.lstClaimDetails = undefined;
      this.lstClaimDetailsDB = undefined;
    }
    if(this.isExcelExport)
    {
      
      this.searchCriteria.option="getClaimdetails";
      this.callExportReport(this.searchCriteria);
    }
    else{
     
    this.reportsService.getClaimdetails(this.searchCriteria).subscribe(
      data => {
        debugger;
        this.lstClaimDetails = data;
        this.lstClaimDetailsDB = data;
        if(this.lstClaimDetailsDB!=null && this.lstClaimDetailsDB.length>0)
        {        
          this.totalPages=this.lstClaimDetailsDB[0].total_count;
          // this.setPage(1);
          this.totalRecords = this.totalPages.toString();
        }
        else{
          this.totalRecords="0"
          this.totalPages=0;
        }
        this.isLoading = false;
        
        //this.CalculateClaimPaymentSummary();
      },
      error => {
        this.isLoading = false;
        this.totalRecords="0";
        this.totalPages=0;
        return;
      }
    );
    
    }
  }
  getReportClaimdetailFooter(searchCriteria:SearchCriteria){
    this.lstClaimDetailsFooter =null;
    this.reportsService.getReportClaimdetailFooter(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstClaimDetailsFooter = data;
        this.CalculateClaimPaymentSummary();
      },
      error => {
        return;
      }
    );
  }
  callExportReport(searchCriteria:SearchCriteria){
    let downloadPath="";
    this.reportsService.getExportResult(searchCriteria).subscribe(
      data => {
        debugger;
        if (data['result']!='') {
          //download
          //this.downloafile(data, ".xlsx", "rptClaim_"+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
          this.generalOperation.downloaExcelFile(data, ".xlsx", "rptClaim_"+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
          this.isLoading = false;
          this.isExcelExport=false;
        }
        else{
          //error
          debugger;
        }
      },
      error => {
        debugger;
      }
    );
  }
 
  CalculateClaimPaymentSummary() {
    debugger;
    let total_claim_charges = 0;
    let total_primary_paid = 0;
    let total_secondary_paid = 0;
    let total_other_paid = 0;
    let total_claim_risk_amount = 0;
    let total_claim_adjusted = 0;
    let total_patient_paid = 0;
    let total_write_off = 0;
    let total_claim_paid_amount = 0;
    let total_claim_balance: number = 0;
    if (this.lstClaimDetailsFooter != null && this.lstClaimDetailsFooter.length > 0) {
      for (var i = 0; i < this.lstClaimDetailsFooter.length; i++) {
        total_claim_charges += Number(this.lstClaimDetailsFooter[i].claim_total == null ? "0.00" : this.lstClaimDetailsFooter[i].claim_total);
        total_claim_risk_amount = Number((total_claim_risk_amount + Number(this.lstClaimDetailsFooter[i].risk_amount == null ? "0.00" : this.lstClaimDetailsFooter[i].risk_amount)).toFixed(2));
        total_claim_adjusted = Number((total_claim_adjusted + Number(this.lstClaimDetailsFooter[i].adjust_amount == null ? "0.00" : this.lstClaimDetailsFooter[i].adjust_amount)).toFixed(2));
        total_write_off = Number((total_write_off + Number(this.lstClaimDetailsFooter[i].write_off == null ? "0.00" : this.lstClaimDetailsFooter[i].write_off)).toFixed(2));
        total_primary_paid = Number((total_primary_paid + Number(this.lstClaimDetailsFooter[i].pri_paid == null ? "0.00" : this.lstClaimDetailsFooter[i].pri_paid)).toFixed(2));
        total_secondary_paid = Number((total_secondary_paid + Number(this.lstClaimDetailsFooter[i].sec_paid == null ? "0.00" : this.lstClaimDetailsFooter[i].sec_paid)).toFixed(2));
        total_other_paid = Number((total_other_paid + Number(this.lstClaimDetailsFooter[i].oth_paid == null ? "0.00" : this.lstClaimDetailsFooter[i].oth_paid)).toFixed(2));
        total_patient_paid = Number((total_patient_paid + Number(this.lstClaimDetailsFooter[i].patient_paid == null ? "0.00" : this.lstClaimDetailsFooter[i].patient_paid)).toFixed(2));
        total_claim_paid_amount = Number((total_claim_paid_amount + Number(this.lstClaimDetailsFooter[i].amt_paid == null ? "0.00" : this.lstClaimDetailsFooter[i].amt_paid)).toFixed(2));
      }
      total_claim_balance = total_claim_charges;


      total_claim_risk_amount = Number(total_claim_risk_amount.toFixed(2));
      total_claim_adjusted = Number(total_claim_adjusted.toFixed(2));
      total_write_off = Number(total_write_off.toFixed(2));
      total_patient_paid = Number(total_patient_paid.toFixed(2));


      total_claim_balance = Number((total_claim_charges - (total_primary_paid + total_secondary_paid + total_other_paid + total_write_off + total_claim_risk_amount + total_claim_adjusted + total_patient_paid)).toFixed(2));
      total_claim_balance = Number(total_claim_balance.toFixed(2));
      total_claim_paid_amount = Number(total_claim_paid_amount.toFixed(2));


      this.ClaimTotal = total_claim_charges.toFixed(2);
      this.PrimaryPaid = total_primary_paid.toFixed(2);
      this.SecondaryPaid = total_secondary_paid.toFixed(2);
      this.TertiaryPaid = total_other_paid.toFixed(2);
      this.PatientPaid = total_patient_paid.toFixed(2);
      this.Adjusted = total_claim_adjusted.toFixed(2);
      this.WriteOff = total_write_off.toFixed(2);
      this.Risk = total_claim_risk_amount.toFixed(2);
      this.TotalPaid = total_claim_paid_amount.toFixed(2);
      this.Balance = total_claim_balance.toFixed(2);

    }
  }
  showDetailView() {
    if (this.btnDetailView == "Detailed View") {
      this.btnDetailView = "Compact View";
      this.detailView = true;
    } else {
      this.btnDetailView = "Detailed View";
      this.detailView = false;
    }
  }

  openPatient(patient) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.pname;
    this.openModuleService.openPatient.emit(obj);
  }
  openClaim(claim) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = claim.patient_id;
    obj.patient_name = claim.pname;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = claim.claim_id;
    this.openModuleService.openPatient.emit(obj);
  }
  exportAsXLSX() {
    this.isExcelExport=true;
    this.searchClaimDetail(this.claimDetailsReportForm.value);

    //this.excel.exportAsExcelFile(this.lstClaimDetails, 'claim_id,patient_id,pname,dos,insurance_name,pri_policy_number,sec_insurance,proname,loname,facility_name,claim_total,amt_paid,amt_due,pri_paid,sec_paid,oth_paid,patient_paid,write_off,risk_amount,adjust_amount,claim_notes,created_user,cpt,icd', 'RPT_CLAIM');
  }
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstClaimDetailsDB, this.headers, this.sortEvent, null, null, '');
    debugger;
    this.lstClaimDetails = sortFilterPaginationResult.list;
  }
  selectedRow = 0;
  onSelectionChange(index) {
    this.selectedRow = index;
  }


  onDateFocusOut(date: string, controlName: string) {

    // console.log('focus out Called:');
    let formatedDate: DateModel = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined) {
      this.claimDetailsReportForm.get(controlName).setValue(formatedDate);
    }
  }
  pageOptionChaged() {
    //this.onCallPagingChange();
    this.searchClaimDetail(this.claimDetailsReportForm.value);
  } 
  pageChange(event){   
    debugger; 
    this.page=event;
    this.pagingOptions=new PagingOptions(this.page,this.pageSize)
    this.searchClaimDetail(this.claimDetailsReportForm.value);
    //this.search();
  }

}