import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LogMessage } from '../../../shared/log-message';
import { CustomValidators, datetimeValidator } from '../../../shared/custome-validators';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { GeneralService } from '../../../services/general/general.service'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ReportsService } from '../../../services/reports.service';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum } from '../../../shared/enum-util';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { GeneralOperation } from '../../../shared/generalOperation';

@Component({
  selector: 'diagnostic-report, multi-selector-dropdown',
  templateUrl: './diagnostic-report.component.html',
  styleUrls: ['./diagnostic-report.component.css']
})
export class DiagnosticReportComponent implements OnInit {


  diagnosticReportForm: FormGroup;
  paggingForm: FormGroup;
  totalRecords = "0";
  showLabTestSearch: boolean = false;
  showPatientSearch: boolean = false;
  patientName: string;
  patientId: number;
  LabID="";
  labDetails="";

  selectedLabCatIds: string;
  varSelectedLabCatIds: string;

  // dropdownList = [];
  // dropdownSettings = {};
  dropdownList = [];
  dropdownSettings = {};
  IDs = [];
  lstDiagReport;
  totalPages = 0;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation:GeneralOperation,
    private reportsService:ReportsService,
    private generalService: GeneralService,
    private modalService: NgbModal) {}

  ngOnInit() {
    debugger;
    this.buildForm();
      
    //if(this.lookupList.appStatusList)
    //if (this.lookupList.lstLabCategory == undefined || this.lookupList.lstLabCategory.length == 0) {
      this.getLabCategory();
    //}
    
    //////////////////// multi select ddl
       //this.dropdownList = [  
      //   {"item_id":1,"item_text":"Pakistan"},
      //   {"item_id":2,"item_text":"Singapore"},
      //   {"item_id":3,"item_text":"Australia"},
      //   {"item_id":4,"item_text":"Canada"},
      //   {"item_id":5,"item_text":"South Korea"},
      //   {"item_id":6,"item_text":"Germany"},
      //   {"item_id":7,"item_text":"France"},
      //   {"item_id":8,"item_text":"Russia"},
      //   {"item_id":9,"item_text":"Italy"},
      //   {"item_id":10,"item_text":"Sweden"}
       //];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
        //////////////////// end
        (this.paggingForm.get('txtPageNo') as FormControl).setValue("1");
        (this.paggingForm.get('ddl_perpagerecord') as FormControl).setValue("25");
  }
  onItemSelect(item: any) {
    //(this.diagnosticReportForm.get('txtLabCatSearch') as FormControl).setValue((this.diagnosticReportForm.get('txtLabCatSearch') as FormControl).value +', '+ item.name);
    //this.IDs.push(item.id);
  }
  closeIT(item: any) {
    debugger;
    
  }
  onSelectAll(items: any) {
    alert(items);
  }
  getLocationsList() {
    this.generalService.getLocation(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.locationList =  data as Array<any>;
      },
      error => {
        this.getLocationListError(error);
      }
    );
  }
  getLocationListError(error) {
    this.logMessage.log("getLocationList Error." + error);
  }
  getProviderList(){
    this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.providerList =  data as Array<any>;
      },
      error => {
        this.getProviderListError(error);
      }
    );
  }
  getProviderListError(error){
    this.logMessage.log("getProviderList Error." + error);
  }
  
  
  getLabCategory(){
     this.generalService.getLabCategory(this.lookupList.practiceInfo.practiceId).subscribe(
       data => {
         debugger;
         this.lookupList.lstLabCategory =  data as Array<any>;
         this.fillLabDDL();
       },
       error => {
         this.getgetLabCategoryError(error);
       }
     );
   }
  getgetLabCategoryError(error){
    this.logMessage.log("getProviderList Error." + error);
  }
   fillLabDDL(){
     debugger;
     if(this.lookupList.lstLabCategory.length>0){
       for (let i = 0; i < this.lookupList.lstLabCategory.length; i++) {
         debugger;
         let newName = {
           id:this.lookupList.lstLabCategory[i].id,
           name:this.lookupList.lstLabCategory[i].name
         };
         this.dropdownList.push(newName);
       }
     }
   }

  buildForm() {
    this.diagnosticReportForm = this.formBuilder.group({

      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([        
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([        
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtPatientSearch: this.formBuilder.control(null),
      txtLabtest: this.formBuilder.control(null),
      txtLabCatSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null),
      cmbStatus: this.formBuilder.control(null),
      txtLabTestIdHidden: this.formBuilder.control(null),
      dateStatusFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      dateStatusTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'null':this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'null':this.lookupList.logedInUser.defaultLocation)
    })
    /*,
    {
      validator: Validators.compose([
        CustomValidators.validDate('dateFrom', false),
        CustomValidators.validDate('dateTo', true)
      ])
    }*/
    this.paggingForm = this.formBuilder.group({
      ddl_perpagerecord: this.formBuilder.control(null),
      txtPageNo: this.formBuilder.control(null)
    })
  }

  onLabTestSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showLabTestSearch = true;
    }
    else {
      this.showLabTestSearch = false;
    }
  }
  onLabTestSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
  }
  onLabTestSearchBlur() {
    this.logMessage.log("onLabTestSearchBlur");
  }
  openSelectLabTest(LabObject) { 
    debugger;   
    this.logMessage.log(LabObject);

    this.LabID = LabObject.proc_code;
    this.labDetails = '('+ LabObject.proc_code +') ' + LabObject.description;
    
    (this.diagnosticReportForm.get('txtLabTestIdHidden') as FormControl).setValue(this.LabID);
    (this.diagnosticReportForm.get('txtLabtest') as FormControl).setValue(this.labDetails);

    this.showLabTestSearch = false;

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
      this.diagnosticReportForm.get("txtPatientIdHidden").setValue(null);
    }
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");
    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.diagnosticReportForm.get("txtPatientSearch").setValue(null);
      this.diagnosticReportForm.get("txtPatientIdHidden").setValue(null);
    }
  }
  openSelectPatient(patObject) {
    this.logMessage.log(patObject);
    if(patObject.patient_status==='INACTIVE' || patObject.patient_status==='DECEASED'){
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is "+patObject.patient_status;
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
    (this.diagnosticReportForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    (this.diagnosticReportForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);
    this.showPatientSearch = false;
  }
  closePatientSearch(){
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  gotoPrevPage(formData, pagging){
    if((this.paggingForm.get('txtPageNo') as FormControl).value >= 1){
      if(this.totalPages !=0 ){
        (this.paggingForm.get('txtPageNo') as FormControl).setValue(parseInt((this.paggingForm.get('txtPageNo') as FormControl).value) - parseInt("1"));
        this.searchDiagReport(formData, pagging);
      }
    }
  }
  gotoFirstPage(formData, pagging){
    if((this.paggingForm.get('txtPageNo') as FormControl).value >= 1){
      if(this.totalPages !=0 ){
        (this.paggingForm.get('txtPageNo') as FormControl).setValue("1");
        this.searchDiagReport(formData, pagging);
      }
    }
  }
  gotoNextPage(formData, pagging){
    if((this.paggingForm.get('txtPageNo') as FormControl).value >= 1){
      if(this.totalPages !=0 ){
        debugger;
        (this.paggingForm.get('txtPageNo') as FormControl).setValue(parseInt((this.paggingForm.get('txtPageNo') as FormControl).value) + parseInt("1"));
        this.searchDiagReport(formData, pagging);
      }
    }
  }
  gotoLastPage(formData, pagging){
    if((this.paggingForm.get('txtPageNo') as FormControl).value >= 1){
      if(this.totalPages !=0 ){
        debugger;
        (this.paggingForm.get('txtPageNo') as FormControl).setValue(this.totalPages);
        this.searchDiagReport(formData, pagging);
      }
    }
  }

  changeSearchKeydown(formData, pagging){
    debugger;
    //if (event.key === "Enter") {
      if((this.paggingForm.get('txtPageNo') as FormControl).value > this.totalPages){
        this.searchDiagReport(formData, pagging);
      }
    //}else{
     // return;
    //}
  }
  changeSearch(formData, pagging){
    this.searchDiagReport(formData, pagging);
  }
  searchDiagReport(formData, pagging){
    debugger;
    let diagSearchCriteria: SearchCriteria = new SearchCriteria();
    diagSearchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    diagSearchCriteria.param_list=[];

    let diagDateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let diagDateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);
    
    let diagDateStatusFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateStatusFrom);
    let diagDateStatusTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateStatusTo);

    diagSearchCriteria.param_list.push( { name: "dateFrom", value: diagDateFrom == undefined ? null : diagDateFrom, option: "" });
    diagSearchCriteria.param_list.push( { name: "dateTo", value: diagDateTo == undefined ? null : diagDateTo, option: "" });
    diagSearchCriteria.param_list.push( { name: "dateStatusFrom", value: diagDateStatusFrom == undefined ? null : diagDateStatusFrom, option: "" });
    diagSearchCriteria.param_list.push( { name: "dateStatusTo", value: diagDateStatusTo == undefined ? null : diagDateStatusTo, option: "" });

    diagSearchCriteria.param_list.push( { name: "cmbProvider", value: ((this.diagnosticReportForm.get('cmbProvider') as FormControl).value=="null"?"All":(this.diagnosticReportForm.get('cmbProvider') as FormControl).value), option: ""});
    diagSearchCriteria.param_list.push( { name: "cmbLocation", value: ((this.diagnosticReportForm.get('cmbLocation') as FormControl).value=="null"?"All":(this.diagnosticReportForm.get('cmbLocation') as FormControl).value), option: ""});
    diagSearchCriteria.param_list.push( { name: "cmbStatus", value: (this.diagnosticReportForm.get('cmbStatus') as FormControl).value, option: "" });
    
    diagSearchCriteria.param_list.push( { name: "patient_id", value: this.patientId, option: "" });
    diagSearchCriteria.param_list.push( { name: "testID", value: this.LabID, option: "" });
    
    this.varSelectedLabCatIds = this.getLabCategoryId(formData);
    debugger;
    diagSearchCriteria.param_list.push( { name: "LabsID", value: this.varSelectedLabCatIds == undefined ? null : this.varSelectedLabCatIds, option: "" });

    diagSearchCriteria.param_list.push( { name: "pageNo", value: (this.paggingForm.get('txtPageNo') as FormControl).value, option: "" });
    diagSearchCriteria.param_list.push( { name: "perPageRec", value: (this.paggingForm.get('ddl_perpagerecord') as FormControl).value, option: "" });


    this.reportsService.getDiagnReport(diagSearchCriteria).subscribe(
      data => {
        debugger;
        this.assignData(data);
        //this.lstDiagReport = data;
        //this.totalRecords = this.lstDiagReport.length;
      },
      error => {
        return;
      }
    );
  }
  assignData(value){
    debugger;
    this.lstDiagReport = value;
        this.totalRecords=value['length'];
        if(value.length>0){
          this.totalPages = value[0].total_PAGES;
          for (var i = 0; i < value.length; i++) {
            debugger;
            if(this.lstDiagReport[i].cptlist !=null){
              this.lstDiagReport[i].cptlist =  this.generalOperation.ReplaceAll(this.lstDiagReport[i].cptlist,'~','\n');
          }
        }
    }
  }
  getLabCategoryId(value){
    debugger;
    this.selectedLabCatIds = "";
    if(value.txtLabCatSearch != null && value.txtLabCatSearch.length>0){
      for (let i = 0; i < value.txtLabCatSearch.length; i++) {
      if(this.selectedLabCatIds!="")
				{
					this.selectedLabCatIds+=","+value.txtLabCatSearch[i].id;
				}
				else
				{
					this.selectedLabCatIds+=value.txtLabCatSearch[i].id;
				}
      }
      return this.selectedLabCatIds;
    }
  }
  loopCptList(value)
  {
    let x =value.split("~");
    return x;

  }

}