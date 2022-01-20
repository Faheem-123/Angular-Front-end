import { Component, OnInit, Input, Inject, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import { LogMessage } from '../../../shared/log-message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { DiagnosisCodeType, ProcedureSearchType, RegExEnum, AlertTypeEnum, PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from '../../../shared/generalOperation';
import { ORMpaymentcategories } from './../../../models/reports/ORMpaymentcategories';

import { ORMKeyValue } from './../../../models/general/orm-key-value';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ProcedureSearchCriteria } from 'src/app/general-modules/inline-procedure-search/proc-search-criteria';
import { ORMpaymentcategoryprocedures } from 'src/app/models/reports/ORMpaymentcategoryprocedures';

@Component({
  selector: 'rpt-payment-categories',
  templateUrl: './rpt-payment-categories.component.html',
  styleUrls: ['./rpt-payment-categories.component.css']
})
export class RptPaymentCategoriesComponent implements OnInit {

  private obj_ORMpaymentcategories: ORMpaymentcategories;
  private objORMpaymentcategoryprocedures: ORMpaymentcategoryprocedures;
  paymentCategoriesReportForm: FormGroup;
  paycategForm: FormGroup;
  proceduresForm: FormGroup;
  lstDDLPayCategories: Array<any>;
  lstPayCategories;
  lstPaymentCategoriesDetails: Array<any>;
  acProcedureSave = [];
  selectedCategory;
  showPatientSearch: boolean = false;
  patientName: string;
  patientId: number;
  searchPatientId: string;
  totalPayCharges = '$ 0.00';
  varSelectedCatIds: string;
  selectedLabCatIds: string;
  dropdownList = [];
  dropdownSettings = {};
  viewName;
  view = "categories";
  title;
  editRowID = "";
  IsEditPaymentCategory = false;
  //isAddCat = false;
  recordCount=0;
  @Output() dataUpdated = new EventEmitter<any>();

  procedureSearchCriteria: ProcedureSearchCriteria;
  @ViewChild('txtProcSearch') txtProcSearch: ElementRef;
  @ViewChild('chkProcedureSearchAll') chkProcedureSearchAll: ElementRef;
  showProcSearch: boolean = false;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private formBuilder: FormBuilder,
    private logMessage: LogMessage,
    private generalOperation: GeneralOperation,
    private modalService: NgbModal,
    private reportsService: ReportsService) { }

  ngOnInit() {
    this.buildForm();
    this.getPaymentCategories();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'category_id',
      textField: 'category_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
    this.viewName = "Categories Settings";
    this.title = "Claim Detail Report";
    //this.ChangeView();
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  buildForm() {
    debugger;
    this.paymentCategoriesReportForm = this.formBuilder.group({
      dateFrom: this.formBuilder.control(null, Validators.required),
      dateTo: this.formBuilder.control(null, Validators.required),
      txtPatientSearch: this.formBuilder.control(null),

      cmbLocation: this.formBuilder.control(null),
      cmbProvider: this.formBuilder.control(null),

      cmbCategories: this.formBuilder.control(null),
      claimtype: this.formBuilder.control(null)
    }),
      this.paycategForm = this.formBuilder.group({
        txtCategoies: this.formBuilder.control(null)
      }),
      this.proceduresForm = this.formBuilder.group({
        txtProcedure: this.formBuilder.control(null)
      })
  }
  // addNewPayCategories(){
  //   this.isAddCat = true;
  // }
  ChangeView() {
    debugger;
    if (this.viewName == "Categories Settings") {
      this.viewName = "Back to Report";
      this.title = "Payment Categoires Report";
      this.view = "report";
      this.getPaymentCategories();
    } else {
      this.viewName = "Categories Settings";
      this.title = "Payment Categoires";
      this.view = "categories";
    }

  }
  onDeleteProcedures(row, index){
    {
      const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
      modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
      let closeResult;
  
      modalRef.result.then((result) => {
  
        if (result == PromptResponseEnum.YES) {
          debugger;
          let deleteRecordData = new ORMDeleteRecord();
          deleteRecordData.column_id = row.category_procedure_id.toString();
          deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
          deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
          deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
  
          this.reportsService.deleteProcedure(deleteRecordData)
            .subscribe(
              data => this.onProcDeleteSuccessfully(data, index),
              error => alert(error),
              () => this.logMessage.log("Procedures Deleted Successfull.")
            );
        }
      }, (reason) => {
        //alert(reason);
      });
    }
  }
  onProcDeleteSuccessfully(data, index) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Report Payment Categories Procedures"
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      debugger;
      if(this.lstPaymentCategoriesDetails != null){
        this.lstPaymentCategoriesDetails.splice(index,1);
      }
    }
  }

  onDeleteCategory(record, index) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = record.category_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.reportsService.deleteCategory(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data, index),
            error => alert(error),
            () => this.logMessage.log("Category Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data, index) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Report Payment Categories"
      modalRef.componentInstance.promptMessage = data.response;

      let closeResult;

      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      if(this.lstDDLPayCategories != null && this.lstDDLPayCategories.length>0){
        this.lstDDLPayCategories.splice(index,1);
        this.getProcedures(this.lstDDLPayCategories[0].category_id)
      }
    }
  }
  getProcedures(row) {
    debugger;
    if (row != "") {
      this.selectedCategory = "";
      this.selectedCategory = row; //row.category_id;
      this.reportsService.getPaymentcategories_Procedures(row).subscribe(
        data => {
          debugger;
          lstPaymentCategoriesDetails: new Array();

          this.lstPaymentCategoriesDetails = data as Array<any>;
        },
        error => {
          return;
        }
      );
    }
  }

  saveNewCategoryName() {
    debugger;
    if ((this.paycategForm.get('txtCategoies') as FormControl).value.trim() == "") {
      GeneralOperation.showAlertPopUp(this.modalService, 'Category Name Selection', "Please enter Category Name.", AlertTypeEnum.WARNING);
      return;
    }
    this.obj_ORMpaymentcategories = new ORMpaymentcategories();
    //this.obj_ORMDailyDeposit.check_number = (this.addDailyDeposit.get('txt_checknumber') as FormControl).value;
    this.obj_ORMpaymentcategories.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    this.obj_ORMpaymentcategories.modified_user = this.lookupList.logedInUser.user_name;
    this.obj_ORMpaymentcategories.practice_id = this.lookupList.practiceInfo.practiceId;
    this.obj_ORMpaymentcategories.system_ip = this.lookupList.logedInUser.systemIp;
    //this.obj_ORMpaymentcategories.deleted = false;
    this.obj_ORMpaymentcategories.category_name = (this.paycategForm.get('txtCategoies') as FormControl).value
    this.obj_ORMpaymentcategories.created_user = this.lookupList.logedInUser.user_name;
    if (this.IsEditPaymentCategory == false) {
      this.obj_ORMpaymentcategories.category_id = "";
      this.obj_ORMpaymentcategories.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.obj_ORMpaymentcategories.created_user = this.lookupList.logedInUser.user_name;
    }
    else {
      this.obj_ORMpaymentcategories.category_id = this.editRowID;
    }
    debugger;
    this.reportsService.saveupdatePaymentCategory(this.obj_ORMpaymentcategories)
      .subscribe(
        data => this.savedSuccessfull(),
        error => alert(error),
        () => this.logMessage.log("Save Payment Category.")
      );
  }
  savedSuccessfull() {
    debugger;
    this.dataUpdated.emit(new ORMKeyValue("Payment Categories", "1"));
    this.IsEditPaymentCategory = false;
    this.editRowID = "";
    this.paycategForm.get("txtCategoies").setValue("");
    this.getPaymentCategories();
  }
  clearCatName() {
    (this.paycategForm.get('txtCategoies') as FormControl).setValue("");
    //this.isAddCat = false;
  }
  getPaymentCategories() {
    this.reportsService.getPaymentCategories(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        lstDDLPayCategories: new Array();

        this.lstDDLPayCategories = data as Array<any>;
        this.fillLabDDL();
      },
      error => {
        return;
      }
    );
  }
  fillLabDDL() {
    debugger;
    if (this.lstDDLPayCategories.length > 0) {
      for (let i = 0; i < this.lstDDLPayCategories.length; i++) {
        debugger;
        let newName = {
          category_id: this.lstDDLPayCategories[i].category_id,
          category_name: this.lstDDLPayCategories[i].category_name
        };
        this.dropdownList.push(newName);
      }
    }
  }
  //pateint search start
  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    } else if (event.key == "Backspace") {
      this.showPatientSearch = false;
      this.searchPatientId = null;
      this.paymentCategoriesReportForm.get("txtPatientSearch").setValue(null);
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {
      this.patientId = undefined;
      this.searchPatientId = null;
    }
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");
    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.paymentCategoriesReportForm.get("txtPatientSearch").setValue(null);
      this.searchPatientId = null;
    }
  }
  openSelectPatient(patObject) {
    this.logMessage.log(patObject);
    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
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
    this.searchPatientId = this.patientId.toString();
    (this.paymentCategoriesReportForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  //patient search end
  //mulit select ddl
  onItemSelect(item: any) {
  }
  closeIT(item: any) {
  }
  onSelectAll(items: any) {
  }
  //end multi select ddl
  searchPayCategoires(values) {

    debugger;
    if (values.cmbCategories.length < 1) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Category Selection', "Please select atlest one Category.", AlertTypeEnum.WARNING);
      return;
    }
    if (values.dateFrom == "" || values.dateFrom == null) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Date From Selection', "Please selected From date.", AlertTypeEnum.WARNING);
      return;
    }
    if (values.dateTo == "" || values.dateTo == null) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Date To Selection', "Please selected To date.", AlertTypeEnum.WARNING);
      return;
    }


    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];

    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(values.dateFrom);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(values.dateTo);

    this.varSelectedCatIds = this.getLabCategoryId(values);

    searchCriteria.param_list.push({ name: "category_id", value: this.varSelectedCatIds == undefined ? null : this.varSelectedCatIds, option: "" });
    searchCriteria.param_list.push({ name: "location_id", value: (this.paymentCategoriesReportForm.get('cmbLocation') as FormControl).value, option: "" });
    searchCriteria.param_list.push({ name: "attending_physician", value: (this.paymentCategoriesReportForm.get('cmbProvider') as FormControl).value, option: "" });
    searchCriteria.param_list.push({ name: "dateFrom", value: vardateFrom, option: "" });
    searchCriteria.param_list.push({ name: "dateTo", value: vardateTo, option: "" });
    searchCriteria.param_list.push({ name: "patient_id", value: this.searchPatientId, option: "" });



    debugger;

    // if(this.varSelectedCatIds.indexOf("', '")== -1){
    //   this.varSelectedCatIds = this.generalOperation.ReplaceAll(this.varSelectedCatIds,", ","\', '");
    //   //this.generalOperation.ReplaceAll(this.lstEncounterProcDiag[i].problem_list,'~','\n');
    // }
    searchCriteria.param_list.push({ name: "rdoclaimtype", value: (this.paymentCategoriesReportForm.get('claimtype') as FormControl).value, option: "" });

    this.reportsService.getPaymentCategoriesDetails(searchCriteria).subscribe(
      data => {
        this.lstPayCategories = data;
        let totalBalance: number = 0;
        for (var i = 0; i < this.lstPayCategories.length; i++) {
          totalBalance = totalBalance + Number(parseFloat(this.lstPayCategories[i].charges).toFixed(2));
        }
        this.totalPayCharges = "";
        this.totalPayCharges = "$" + totalBalance.toFixed(2).toString();
      },
      error => {
        return;
      }
    );
  }
  getLabCategoryId(value) {
    debugger;
    this.selectedLabCatIds = "";
    if (value.cmbCategories != null && value.cmbCategories.length > 0) {
      for (let i = 0; i < value.cmbCategories.length; i++) {
        if (this.selectedLabCatIds != "") {
          this.selectedLabCatIds += "," + value.cmbCategories[i].category_id;
        }
        else {
          this.selectedLabCatIds += value.cmbCategories[i].category_id;
        }
      }
      return this.selectedLabCatIds;
    }
  }

  /******* Procedure Search ******* */
  onchkProcedureChanged() {
    if (this.showProcSearch == true) {
      this.searchProcedure((this.proceduresForm.get('txtProcedure') as FormControl).value);
    }
  }
  onProcedureSearhBlur(event: any) {
    if (this.showProcSearch == false) {
      event.currentTarget.value = "";
    }
  }

  onProcedureSearcInputChange(event: any) {
    this.logMessage.log("onProcedureSearcInputChange");
    this.searchProcedure(event.currentTarget.value);
  }

  searchProcedure(searchVal: string) {
    debugger;
    if (searchVal.length >= 3) {


      this.procedureSearchCriteria = new ProcedureSearchCriteria();
      this.procedureSearchCriteria.criteria = searchVal;

      // if (!this.chkProcedureSearchAll.nativeElement.checked) {
      this.procedureSearchCriteria.searchType = ProcedureSearchType.ALL;
      // }
      // else {
      //   this.procedureSearchCriteria.searchType = ProcedureSearchType.SUPER_BILL;
      // }
      this.showProcSearch = true;
    }
    else {
      this.showProcSearch = false;
    }
  }

  closeProcedureSearch() {
    this.showProcSearch = false;
    //this.txtProcSearch.nativeElement.value = "";
    //this.txtProcSearch.nativeElement.focus();
  }

  addProcedureFromSearch(proc: any) {
    debugger;
    if (this.lstPaymentCategoriesDetails == undefined)
      this.lstPaymentCategoriesDetails = new Array();

    this.lstPaymentCategoriesDetails.push({ proc_code: proc.code, proc_description: proc.description });

    this.showProcSearch = false;

  }
  /******* END Procedure Search  ******* */

  saveNewProcedure() {
    // if ((this.proceduresForm.get('txtProcedure') as FormControl).value.trim() == "") {
    //   alert("Please enter Procedure Name.");
    //   return;
    // }
    debugger;
    if(this.selectedCategory =="" || this.selectedCategory == null){
      GeneralOperation.showAlertPopUp(this.modalService, 'Category Selection', "Please select any catagory first to add procedure.", AlertTypeEnum.WARNING);
      return;
    }
    if(this.lstPaymentCategoriesDetails !=null && this.lstPaymentCategoriesDetails.length > 0){
      for(var i=0;i<this.lstPaymentCategoriesDetails.length;i++){
        this.objORMpaymentcategoryprocedures = new ORMpaymentcategoryprocedures();
        if(this.lstPaymentCategoriesDetails[i].category_procedure_id==null || this.lstPaymentCategoriesDetails[i].category_procedure_id=="" )
						{
							this.objORMpaymentcategoryprocedures.category_id=this.selectedCategory;
							this.objORMpaymentcategoryprocedures.category_procedure_id="";
							this.objORMpaymentcategoryprocedures.client_date_created=this.dateTimeUtil.getCurrentDateTimeString();
							this.objORMpaymentcategoryprocedures.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
							this.objORMpaymentcategoryprocedures.created_user=this.lookupList.logedInUser.user_name;
							this.objORMpaymentcategoryprocedures.deleted="0";
							this.objORMpaymentcategoryprocedures.modified_user=this.lookupList.logedInUser.user_name;
							this.objORMpaymentcategoryprocedures.practice_id=this.lookupList.practiceInfo.practiceId.toString();
							this.objORMpaymentcategoryprocedures.proc_code=this.lstPaymentCategoriesDetails[i].proc_code;
              this.objORMpaymentcategoryprocedures.proc_description=this.lstPaymentCategoriesDetails[i].proc_description;
              this.objORMpaymentcategoryprocedures.system_ip = this.lookupList.logedInUser.systemIp;

							if(this.acProcedureSave==null){
                this.acProcedureSave = new Array();
              }
							this.acProcedureSave.push(this.objORMpaymentcategoryprocedures);
						}
      }//for loop end
      if(this.acProcedureSave != null && this.acProcedureSave.length > 0){
        this.reportsService.saveProcedures(this.acProcedureSave)
        .subscribe(
          data => this.proceduresSavedSuccessfull(),
          error => alert(error),
          () => this.logMessage.log("Save Procedures against Category.")
        );   
      }
    }
  }
  proceduresSavedSuccessfull(){
      debugger;
      this.dataUpdated.emit(new ORMKeyValue("Procedures saved", "1"));
      this.proceduresForm.get("txtProcedure").setValue("");
      this.getProcedures(this.selectedCategory);
  }
  editCategory(rows){
    debugger;
    this.IsEditPaymentCategory = true;
    this.editRowID = rows.category_id;
    this.paycategForm.get("txtCategoies").setValue(rows.category_name);
  }
}