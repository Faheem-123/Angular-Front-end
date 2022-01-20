import { Component, OnInit, Input, Inject } from '@angular/core';
import { ListFilterPipe } from '../../../shared/list-filter-pipe';
import { UniquePipe } from '../../../shared/unique-pipe';
import { GeneralOperation } from '../../../shared/generalOperation';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { CustomValidators, datetimeValidator } from '../../../shared/custome-validators';
import { GeneralService } from '../../../services/general/general.service';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { LogMessage } from '../../../shared/log-message';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum } from '../../../shared/enum-util';
import { ReportsService } from '../../../services/reports.service';
import { PagingOptions } from 'src/app/services/sort-filter-pagination.service';
import { ExcelColumn } from 'src/app/models/general/excel-column';
import { Wrapper_ExcelColumn } from 'src/app/models/general/Wrapper_ExcelColumn';
//import { IfObservable } from 'rxjs/observable/IfObservable';

@Component({
  selector: 'rpt-encounter-proc-diag',
  templateUrl: './rpt-encounter-proc-diag.component.html',
  styleUrls: ['./rpt-encounter-proc-diag.component.css']
})
export class RptEncounterProcDiagComponent implements OnInit {

  @Input() lstLocations;
  @Input() lstLocationProviders;
  @Input() lstData: Array<ORMKeyValue>;
  encounterProcDiagReportForm: FormGroup;
  isLoading: boolean = false;
  showPatientSearch:boolean=false;
  lstFileredProviders;
  // locationId=-1;
  // providerId=-1;
  dateFromModel;
  dateToModel;
  dateFrom;
  dateTo;
  patientId;
  patientName;
  lstEncounterProcDiag;
  lstproblem_list;
  recordCount;
  errorMsg:string="";
  pagingOptions:PagingOptions;
  totalRecords = "0";
  totalPages: number;
  page: number=1;
  pageSize: number=10;
  isExcelExport=false;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private generalOperation:GeneralOperation,
    private formBuilder:FormBuilder,
    private dateTimeUtil:DateTimeUtil,
    private modalService: NgbModal,
    private reportsService:ReportsService,
    private generalService: GeneralService) { }

  ngOnInit() {
    debugger;
    this.buildForm();   
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
  buildForm(){
    debugger;
    this.encounterProcDiagReportForm = this.formBuilder.group({
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([        
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([        
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'null':this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'null':this.lookupList.logedInUser.defaultLocation)
    })
    /*,
    {
      validator: Validators.compose([
        CustomValidators.validDate('dateFrom', false),
        CustomValidators.validDate('dateTo', true)
      ])
    }
    */
  }

  closePatientSearch(){
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  
  onSearchClick(formData)
  {
    this.isExcelExport=false;
    this.searchEncProcDiag(formData);
  }
  searchCriteria: SearchCriteria;
  searchEncProcDiag(formData){
    debugger;
    if( (this.encounterProcDiagReportForm.get('cmbProvider') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Validation','Please Select Provider First.','warning')
      return;
    }
    if( (this.encounterProcDiagReportForm.get('cmbLocation') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Validation','Please Select Location First.','warning')
      return;
    }
    this.searchCriteria = new SearchCriteria();
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.param_list=[];

    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    this.searchCriteria.param_list.push( { name: "dateFrom", value: vardateFrom, option: "" });
    this.searchCriteria.param_list.push( { name: "dateTo", value: vardateTo, option: "" });
    this.searchCriteria.param_list.push( { name: "cmbProvider", value: (this.encounterProcDiagReportForm.get('cmbProvider') as FormControl).value==null?'':(this.encounterProcDiagReportForm.get('cmbProvider') as FormControl).value, option: "" });
    this.searchCriteria.param_list.push( { name: "cmbLocation", value: (this.encounterProcDiagReportForm.get('cmbLocation') as FormControl).value==null?'':(this.encounterProcDiagReportForm.get('cmbLocation') as FormControl).value, option: "" });

    if(this.patientId!=undefined && this.patientId>0){
      this.searchCriteria.param_list.push( { name: "patient_id", value: this.patientId, option: "" });
    }
    this.searchCriteria.param_list.push( { name: "pageIndex", value: this.isExcelExport?"0":this.page, option: "" });
    this.searchCriteria.param_list.push( { name: "pageSize", value: this.isExcelExport?"0":this.pageSize, option: "" });
    if(this.isExcelExport)
    {
      let lstColumns: Array<any> = new Array<any>();
      lstColumns = [
        new ExcelColumn('pid', 'PID'),
        new ExcelColumn('patient_name', 'Patient'),
        new ExcelColumn('dob', 'DOB'),
        new ExcelColumn('addres', 'Address'),
        new ExcelColumn('work_phone', 'Work Phone'),
        new ExcelColumn('home_phone', 'Home Phone'),

        new ExcelColumn('cell_phone', 'Cell Phone'),
        new ExcelColumn('primary_ins', 'Primary Ins.'),
        new ExcelColumn('primary_policy', 'Primary Policy'),

        new ExcelColumn('secondary_ins', 'Secondary Ins.'),
        new ExcelColumn('secondary_policy', 'Secondary Policy'),
        new ExcelColumn('visit_date', 'Visit Date'),

        new ExcelColumn('provdier_name', 'Provider'),
        new ExcelColumn('location_name', 'Location'),
        new ExcelColumn('problem_list', 'problemList'),
        new ExcelColumn('proceduer_list', 'proceduerList')
      ];
      let wrapper:Wrapper_ExcelColumn=new Wrapper_ExcelColumn();
      wrapper.lst_excel_columns= lstColumns;
      this.searchCriteria.param_list.push( { name: "excelColumn", value: JSON.stringify(wrapper), option: "" });
    }
    this.isLoading = true;
    if(this.isExcelExport)
    {
      
      this.searchCriteria.option="getEncounterProcDiag";
      this.callExportReport(this.searchCriteria);
    }
    else{
    this.reportsService.getEncounterProcDiag(this.searchCriteria).subscribe(
      data => {
        debugger;
        if(data['length']>0)
        {        
          this.totalPages=data[0].total_count;
          // this.setPage(1);
          this.totalRecords = this.totalPages.toString();
        }
        else{
          this.totalRecords="0"
          this.totalPages=0;
        }
        this.isLoading = false;

        this.assignData(data);
      },
      error => {
        this.isLoading = false;
        this.totalRecords="0";
        this.totalPages=0;
        this.getEncounterProcDiagError(error);
      }
    );
    }
  }
  callExportReport(searchCriteria:SearchCriteria){
    let downloadPath="";
    this.reportsService.getExportResult(searchCriteria).subscribe(
      data => {
        debugger;
        if (data['result']!='') {
          //download
          //this.downloafile(data, ".xlsx", "rptClaim_"+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
          this.generalOperation.downloaExcelFile(data, ".xlsx", "rptEncounterProcDiag_"+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
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
  assignData(value){
    debugger;
    this.lstEncounterProcDiag = value;
        this.recordCount=value['length'];
        if(value.length>0){
          for (var i = 0; i < value.length; i++) {
            debugger;
            if(this.lstEncounterProcDiag[i].problem_list !=null){
              this.lstEncounterProcDiag[i].problem_list =  this.generalOperation.ReplaceAll(this.lstEncounterProcDiag[i].problem_list,'~','\n');
            }

            if(this.lstEncounterProcDiag[i].proceduer_list!=null){
              this.lstEncounterProcDiag[i].proceduer_list =  this.generalOperation.ReplaceAll(this.lstEncounterProcDiag[i].proceduer_list,'~','\n');
            }
          }
        }

  }
  getEncounterProcDiagError(error){
    this.errorMsg=error;
  }
  onPatientSearchKeydown(event) {
    debugger;
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    } 
    else if (event.key === "Backspace") {
      this.encounterProcDiagReportForm.get("txtPatientIdHidden").setValue("");
      this.encounterProcDiagReportForm.get("txtPatientSearch").setValue("");
      this.closePatientSearch();
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {
      this.patientId = undefined;
      this.encounterProcDiagReportForm.get("txtPatientIdHidden").setValue(null);
    }
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.encounterProcDiagReportForm.get("txtPatientSearch").setValue(null);
      this.encounterProcDiagReportForm.get("txtPatientIdHidden").setValue(null);
    }
  }
  openSelectPatient(patObject) {    

    debugger;
    this.logMessage.log(patObject);

    if(patObject.patient_status==='INACTIVE' || patObject.patient_status==='DECEASED'){
      //this.show = false;
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is "+patObject.patient_status;

      let closeResult;

      modalRef.result.then((result) => {
        //this.show = true;

        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //this.show = true;
          //alert(reason);
        });

      return;
    }

    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;    

    this.encounterProcDiagReportForm.get("txtPatientIdHidden").setValue(this.patientId);
    this.encounterProcDiagReportForm.get("txtPatientSearch").setValue(this.patientName);
    this.showPatientSearch = false;
  }
  pageOptionChaged() {
    //this.onCallPagingChange();
    this.searchEncProcDiag(this.encounterProcDiagReportForm.value);
  } 
  pageChange(event){   
    debugger; 
    this.page=event;
    this.pagingOptions=new PagingOptions(this.page,this.pageSize)
    this.searchEncProcDiag(this.encounterProcDiagReportForm.value);
    //this.search();
  }
  
  exportAsXLSX(){
    debugger;
    this.isExcelExport=true;
    this.searchEncProcDiag(this.encounterProcDiagReportForm.value);
  }
}
