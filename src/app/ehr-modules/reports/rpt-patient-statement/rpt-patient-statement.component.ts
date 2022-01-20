import { Component, OnInit, Inject, ViewChildren, QueryList, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportsService } from 'src/app/services/reports.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { excelService } from 'src/app/shared/excelService';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { PatientSubTabsEnum, ServiceResponseStatusEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { ORMPatientStatementNotes } from 'src/app/models/billing/ORMPatientStatementNotes';
import { ORMStatementPDF } from 'src/app/models/billing/ORMStatementPDF';
import { ORMspGetPatientClaims } from 'src/app/models/billing/ORMspGetPatientClaims';
import { GeneralService } from 'src/app/services/general/general.service';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'rpt-patient-statement',
  templateUrl: './rpt-patient-statement.component.html',
  styleUrls: ['./rpt-patient-statement.component.css']
})
export class RptPatientStatementComponent implements OnInit {
  @Input() callingFrom: CallingFromEnum;
  lstBalance: Array<string> = ["", "=", ">", ">=", "<", "<="];
  isLoading = false;
  lstClaimDetails;
  lstClaimDetailsDB;
  patientId = "";
  btnDetailView = "Detailed View";
  detailView = false;
  controlUniqueId = '';
  strStatementPhone = "";
  isCollapsed = false;
  searchForm: FormGroup;
  constructor(private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil, private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage, private excel: excelService, private claimService: ClaimService,
    private reportsService: ReportsService, @Inject(LOOKUP_LIST) public lookupList: LookupList,private generalService:GeneralService,
    private sortFilterPaginationService: SortFilterPaginationService, private generalOperation: GeneralOperation) { }

  ngOnInit() {
    this.buildForm();
    this.controlUniqueId = "statement";
    this.strStatementPhone = this.lookupList.practiceInfo.statement_phone == "" ? this.lookupList.practiceInfo.phone : this.lookupList.practiceInfo.statement_phone;

    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      let lstDocPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientStatement");
      if (lstDocPath.length > 0)
      {
        this.downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientStatement";
        this.uploadPath=lstDocPath[0].download_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientStatement";
      }
      else
      {
        this.downloadPath = '';
      }
    }
  }
  buildForm() {
    debugger;
    this.searchForm = this.formBuilder.group({
      drpDateRange: this.formBuilder.control("DOS"),
      dptoDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpfromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      txtPatientSearch: this.formBuilder.control(""),

      drpStatus: this.formBuilder.control("all"),
      drpAmtCond: this.formBuilder.control(">"),
      txtAmount: this.formBuilder.control("0"),

      drpSentDaysCond: this.formBuilder.control(">"),
      txtSentDays: this.formBuilder.control(""),
      chkSelf: this.formBuilder.control(false),
      chkPatientBilled: this.formBuilder.control(false)
    })
  }
  showPatientSearch: boolean = false;
  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    } else if (event.key == "Backspace") {
      this.showPatientSearch = false;
      this.patientId = "";
      this.searchForm.get("txtPatientSearch").setValue(null);
    }
    else {
      this.showPatientSearch = false;
    }
  }
  openSelectPatient(patObject) {
    this.patientId = patObject.patient_id;
    (this.searchForm.get('txtPatientSearch') as FormControl).setValue(patObject.name);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  onPatientSearchBlur() {

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientId = "";
      this.searchForm.get("txtPatientSearch").setValue(null);
    }
  }

  onSearch(frm) {
    if ((this.searchForm.get('dpfromDate') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter From Date", 'warning')
      return;
    }
    if ((this.searchForm.get('dptoDate') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter To Date", 'warning')
      return;
    }
    debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];
    searchCriteria.param_list.push({ name: "range", value: frm.drpDateRange, option: "" });
    searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpfromDate), option: "" });
    searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dptoDate), option: "" });
    if (this.patientId != '' && frm.txtPatientSearch != null && frm.txtPatientSearch != '') {
      searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
    }
    searchCriteria.param_list.push({ name: "status", value: frm.drpStatus, option: "" });
    searchCriteria.param_list.push({ name: "amt_cond", value: frm.drpAmtCond, option: "" });
    searchCriteria.param_list.push({ name: "amt_value", value: frm.txtAmount, option: "" });
    searchCriteria.param_list.push({ name: "sent_day_cond", value: frm.drpSentDaysCond, option: "" });
    searchCriteria.param_list.push({ name: "sent_day_value", value: frm.txtSentDays, option: "" });
    searchCriteria.param_list.push({ name: "self_pay", value: frm.chkSelf, option: "" });
    searchCriteria.param_list.push({ name: "patient_bill", value: frm.chkPatientBilled, option: "" });
    searchCriteria.param_list.push({ name: "calling_from", value: 'report', option: "" });
    this.isLoading=true;
    this.claimService.getPatientStatement(searchCriteria).subscribe(
      data => {
        this.isLoading=false;
        debugger;
        this.lstClaimDetailsDB = data as Array<any>;
        this.lstClaimDetails = data as Array<any>;
      },
      error => {
        this.isLoading=false;
      }
    );

  }
  IsSelectAll(value) {
    debugger;
    for (var i = 0; i < this.lstClaimDetails.length; i++) {
      this.lstClaimDetails[i].chk = value;
    }
  }
  IsSelect(value, doc) {
    this.lstClaimDetails[this.generalOperation.getElementIndex(this.lstClaimDetails, doc)].chk = value;
  }
  openClaim(claim) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = claim.patient_id;
    obj.patient_name = claim.pat_name;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = claim.claim_id;
    this.openModuleService.openPatient.emit(obj);
  }
  openPatient(patient) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.pat_name;
    this.openModuleService.openPatient.emit(obj);
  }
  exportAsXLSX() {
    // this.excel.exportAsExcelFile(this.lstClaimDetails,'claim_id,patient_id,pname,dos,insurance_name,pri_policy_number,sec_insurance,proname,loname,facility_name,claim_total,amt_paid,amt_due,pri_paid,sec_paid,oth_paid,patient_paid,write_off,risk_amount,adjust_amount,claim_notes,created_user,cpt,icd', 'RPT_CLAIM');
  }
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstClaimDetailsDB, this.headers, this.sortEvent, null, null,'');
    debugger;
    this.lstClaimDetails = sortFilterPaginationResult.list;
  }
  onClaimMessageChange(value, index) {
    this.lstClaimDetails[index].pos_name = value;
  }
  onStatementMessageChange(value, index) {
    this.lstClaimDetails[index].statement_message = value;
  }
  lstStatementNotesSave;
  onSaveNotes() {
    debugger;
    this.lstStatementNotesSave = new Array<any>();
    for (let i = 0; i < this.lstClaimDetails.length; i++) {
      if(this.lstClaimDetails[i].chk==true)
      {
        let objORM = new ORMPatientStatementNotes();

        objORM.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        objORM.created_user = this.lookupList.logedInUser.user_name;
        objORM.statement_message = this.lstClaimDetails[i].statement_message;
        objORM.claim_message = this.lstClaimDetails[i].pos_name; // used as claim message.
        objORM.claim_id = this.lstClaimDetails[i].claim_id;

        this.lstStatementNotesSave.push(objORM);
      }
    }
    if (this.lstStatementNotesSave.length > 0) {
      this.claimService.saveStatementNotes(this.lstStatementNotesSave).subscribe(
        data => {
          if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
            GeneralOperation.showAlertPopUp(this.ngbModal, "Save", "Statement Notes have been saved successfully.", 'info');
          }
          else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
            GeneralOperation.showAlertPopUp(this.ngbModal, "Save", "Unable to Save Statement Notes.", 'info');
          }
        },
        error => {

        }
      );
    }
  }
  acStatementNotes;
  onRecoverNotes() {
    debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];
    searchCriteria.param_list.push({ name: "user", value: this.lookupList.logedInUser.user_name, option: "" });
    this.isLoading=true;
    this.claimService.getPatientStatementSavedNotes(searchCriteria).subscribe(
      data => {
        this.acStatementNotes = data;
        if (this.acStatementNotes.length > 0) {
          for (let i = 0; i < this.lstClaimDetails.length; i++) {
            for (let j = 0; j < this.acStatementNotes.length; j++) {
              if (this.lstClaimDetails[i].claim_id == this.acStatementNotes[j].claim_id) {
                this.lstClaimDetails[i].chk = true;
                this.lstClaimDetails[i].statement_message = this.acStatementNotes[j].statement_message;
                this.lstClaimDetails[i].pos_name = this.acStatementNotes[j].claim_message;

                this.acStatementNotes.splice(j, 1)
                break;
              }
            }
          }
        }
        this.isLoading=false;
      },
      error => {

      }
    );
  }
  onGeneratePDF() {
    if (this.lstClaimDetails != null && this.lstClaimDetails != undefined && this.lstClaimDetails.length > 0) {
      let selectedClaimList = "";
      for (let i = 0; i < this.lstClaimDetails.length; i++) {
        
        if (this.lstClaimDetails[i].chk == true) 
        {
          if (selectedClaimList == "")
            selectedClaimList = this.lstClaimDetails[i].claim_id;
          else
            selectedClaimList += "," + this.lstClaimDetails[i].claim_id;
        }
      }
      if (selectedClaimList != "") {
        let listStatementClaim = new Array<any>();

        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [];
        searchCriteria.param_list.push({ name: "claim_id", value: selectedClaimList, option: "" });
        this.claimService.getStatementPDF(searchCriteria).subscribe(
          data => {
            debugger;
            let listDetail = data as Array<any>;
            for (var jj = 0; jj < listDetail.length; jj++) {
              let objOrm = new ORMStatementPDF;
              objOrm.practice_id = this.lookupList.practiceInfo.practiceId.toString();
              objOrm.claim_id = listDetail[jj].claim_id;
              objOrm.patient_id = listDetail[jj].patient_id;
              objOrm.alternate_account = listDetail[jj].alternate_account;

              objOrm.pat_last_name = listDetail[jj].last_name;
              objOrm.pat_first_name = listDetail[jj].first_name;
              objOrm.pat_address = listDetail[jj].address;
              objOrm.pat_zip = listDetail[jj].zip;
              objOrm.pat_city = listDetail[jj].city;
              objOrm.pat_state = listDetail[jj].state;

              objOrm.prac_name = this.lookupList.practiceInfo.practiceName;
              objOrm.prac_address = this.lookupList.practiceInfo.address1;
              objOrm.prac_citystatezip = this.lookupList.practiceInfo.city + ", " + this.lookupList.practiceInfo.state + " " + this.lookupList.practiceInfo.zip;
              objOrm.prac_phone = this.strStatementPhone;

              objOrm.claim_dos = listDetail[jj].dos;
              objOrm.claim_atten_pro_name = listDetail[jj].atten_pro_name;
              objOrm.claim_proc_code = listDetail[jj].proc_code;
              objOrm.claim_total_charges = listDetail[jj].total_charges;
              objOrm.claim_total = listDetail[jj].claim_total;
              objOrm.claim_amt_paid = listDetail[jj].amt_paid;
              objOrm.claim_adjust_amount = listDetail[jj].adjust_amount;
              objOrm.claim_amt_due = listDetail[jj].amt_due;
              if (listDetail[jj].statement_count > 2) {
                objOrm.statement_message = "Your ACCOUNT IS PAST DUE. PLEASE REMIT PAYMENT OR CALL US AT " + this.strStatementPhone + " TO MAKE PAYMENT ARRANGEMENTS";
              }
              else {
                objOrm.statement_message = "YOUR INSURANCE HAS PAID ITS PORTION OF SERVICES SO PLEASE REMIT YOUR BALANCE PROMPTLY. IN CASE OF ANY CONCERNS PLEASE CONTACT US At " + this.strStatementPhone;
              }
              listStatementClaim.push(objOrm);
            }
            this.claimService.generatePDFStatement(listStatementClaim).subscribe(
              data=>{
                debugger;
                let link= this.downloadPath+"//"+data['result'].toString()
                let searchCriteria: SearchCriteria = new SearchCriteria;
                searchCriteria.criteria = link;
                this.generalService.downloadFile(searchCriteria)
                  .subscribe(
                    data => {
                      debugger;
                      this.isLoading = false;
                      this.downloaPDFZip(data, "PatientStatement_"+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
                    },
                    error => {
                      alert(error);
                      this.isLoading = false;
                    }
                  );
                window.open(link, '_blank');
              },
              error=>{

              }
            );
          },
          error => {

          }
        );

      }
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Statement Validation', 'Please select atleast one claim.', 'warning');
    }
  }
  strStatement_path='';
  showDownload=false;
  onGenerateStatement() {
    debugger;
    this.strStatement_path='';
    this.showDownload=false;
    let listStatementClaim = new Array<any>();
    if (this.lstClaimDetails != null && this.lstClaimDetails != undefined && this.lstClaimDetails.length > 0) {
      for (var jj = 0; jj < this.lstClaimDetails.length; jj++) {
        if (this.lstClaimDetails[jj].chk == true) {
          let objOrm = new ORMspGetPatientClaims;
          objOrm.claim_id = this.lstClaimDetails[jj].claim_id;
          objOrm.patient_id = this.lstClaimDetails[jj].patient_id;
          objOrm.alternate_account = this.lstClaimDetails[jj].alternate_account;
          objOrm.pat_name = this.lstClaimDetails[jj].pat_name;
          objOrm.last_name = this.lstClaimDetails[jj].last_name;
          objOrm.first_name = this.lstClaimDetails[jj].first_name;
          objOrm.pat_address = this.lstClaimDetails[jj].pat_address;
          objOrm.pat_zip = this.lstClaimDetails[jj].pat_zip;
          objOrm.pat_city = this.lstClaimDetails[jj].pat_city;
          objOrm.pat_state = this.lstClaimDetails[jj].pat_state;

          objOrm.practice_name = this.lstClaimDetails[jj].practice_name;
          objOrm.practice_id=this.lookupList.practiceInfo.practiceId.toString();
          objOrm.prac_address = this.lstClaimDetails[jj].prac_address;
          objOrm.prac_zip = this.lstClaimDetails[jj].prac_zip;
          objOrm.prac_city = this.lstClaimDetails[jj].prac_city;
          objOrm.prac_state = this.lstClaimDetails[jj].prac_state;
          objOrm.prac_phone =  this.strStatementPhone;//this.lstClaimDetails[jj].prac_phone;
          objOrm.chk = this.lstClaimDetails[jj].chk;
          objOrm.dos = this.lstClaimDetails[jj].dos;
          objOrm.claim_total = this.lstClaimDetails[jj].claim_total;
          objOrm.pri_paid = this.lstClaimDetails[jj].pri_paid;
          objOrm.sec_paid = this.lstClaimDetails[jj].sec_paid;
          objOrm.write_off = this.lstClaimDetails[jj].write_off;
          objOrm.discount = this.lstClaimDetails[jj].discount;
          objOrm.amt_paid = this.lstClaimDetails[jj].amt_paid;
          objOrm.risk_amount = this.lstClaimDetails[jj].risk_amount;
          objOrm.adjust_amount = this.lstClaimDetails[jj].adjust_amount;
          objOrm.patient_paid = this.lstClaimDetails[jj].patient_paid;
          objOrm.amt_due = this.lstClaimDetails[jj].amt_due;
          objOrm.statement_date = this.lstClaimDetails[jj].statement_date;
          objOrm.patient_statement_days = this.lstClaimDetails[jj].patient_statement_days;
          objOrm.statement_count = this.lstClaimDetails[jj].statement_count;
          objOrm.pat_due = this.lstClaimDetails[jj].pat_due;
          objOrm.facility_name = this.lstClaimDetails[jj].facility_name;
          objOrm.pos_name = this.lstClaimDetails[jj].pos_name;
          objOrm.billing_first_name = this.lstClaimDetails[jj].billing_first_name;

          objOrm.billing_last_name = this.lstClaimDetails[jj].billing_last_name;
          objOrm.prov_name = this.lstClaimDetails[jj].prov_name;
          objOrm.billing_physician = this.lstClaimDetails[jj].billing_physician;
          objOrm.facility_id = this.lstClaimDetails[jj].facility_id;
          objOrm.insurance_name = this.lstClaimDetails[jj].insurance_name;
          objOrm.statement_message = this.lstClaimDetails[jj].statement_message;
          objOrm.adv_paid = this.lstClaimDetails[jj].adv_paid;
          objOrm.deductable_amt = this.lstClaimDetails[jj].deductable_amt;
          objOrm.coinsurance_amt = this.lstClaimDetails[jj].coinsurance_amt;
          objOrm.copay_amt = this.lstClaimDetails[jj].copay_amt;
          objOrm.loc_name = this.lstClaimDetails[jj].loc_name;
          objOrm.pat_statement = this.lstClaimDetails[jj].pat_statement;
          objOrm.atten_pro_name = this.lstClaimDetails[jj].atten_pro_name;
          objOrm.self_pay = this.lstClaimDetails[jj].self_pay;
          objOrm.user=this.lookupList.logedInUser.user_name;
          objOrm.system_ip=this.lookupList.logedInUser.systemIp;
          listStatementClaim.push(objOrm);
        }
      }
      this.claimService.generateStatement(listStatementClaim).subscribe(
        data=>{
          debugger;
          if(data!='')
          {
            this.strStatement_path=data['result'].toString();
            this.showDownload=true;
          }
        },
        error=>{

        }
      );
    }
  }
  downloadPath='';
  uploadPath='';
  onDownload(){
    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      let lstDocPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientStatement");
      if (lstDocPath.length > 0)
      {
        this.downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientStatement";
        this.uploadPath=lstDocPath[0].download_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientStatement";
      }
      else
      {
        this.downloadPath = '';
      }
    }
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = this.downloadPath + "/" + this.strStatement_path;
    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.isLoading = false;
          this.downloafile(data, this.strStatement_path, "PatientStatement_"+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
        },
        error => {
          alert(error);
          this.isLoading = false;
        }
      );
  }
  downloafile(data, doc_link, name) {
    let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
    let file_type: string = '';
    switch (file_ext.toLowerCase()) {
      
      case 'xml':
        file_type = 'text/plain';
        break;
    }
    var fileURL;
    var file = new Blob([data], { type: file_type });
    FileSaver.saveAs(file, name + "." + file_ext);
  }
  downloaPDFZip(data,name)
  {
    let file_ext='zip';
    let file_type: string = 'application/zip';
    var fileURL;
    var file = new Blob([data], { type: file_type });
    FileSaver.saveAs(file, name + "." + file_ext);
  }
  selectedRow=0;
  onSelectionChange(index)
  {
    this.selectedRow=index;
  }
}
