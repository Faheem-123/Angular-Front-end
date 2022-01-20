import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { FileUploadPopupComponent } from './../../../general-modules/file-upload-popup/file-upload-popup.component';
import { LOOKUP_LIST, LookupList } from './../../../providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ORMDailyDeposit } from './../../../models/reports/ORMDailyDeposit';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { GeneralOperation } from '../../../shared/generalOperation';
import { DateTimeUtil, DatePart, DateTimeFormat } from '../../../shared/date-time-util';
import { ReportsService } from '../../../services/reports.service';
import { LogMessage } from '../../../shared/log-message';
import { ORMKeyValue } from './../../../models/general/orm-key-value';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ServiceResponseStatusEnum, PromptResponseEnum, AlertTypeEnum } from '../../../shared/enum-util';
import { ORMDeleteRecord } from '../../../models/general/orm-delete-record';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { ORMDailyDepositTotalcount } from 'src/app/models/reports/ORMDailyDepositTotalCount';

@Component({
  selector: 'daily-deposit',
  templateUrl: './rpt-daily-deposit.component.html',
  styleUrls: ['./rpt-daily-deposit.component.css']
})
export class RptDailyDepositComponent implements OnInit {

  lstDailyDeposit;
  totalRow = [];
  isDeposit = "search-report";
  fileAttached ;
  addDailyDeposit: FormGroup;
  dailydepositReportForm: FormGroup;
  dailyDepositMonthYear: FormGroup;
  private obj_ORMDailyDeposit: ORMDailyDeposit;
  @Output() dataUpdated = new EventEmitter<any>();

  acPath;
  IsEdit=false;
  IsFileRemove="n";
  errorMsg:string="";
  lstdayWise;
  chkDate;
  chkRecDate;
  //recordCount = "0";
  colday29;
  colday30;
  colday31;
  colH_day29;
  colH_day30;
  colH_day31;
  totalValues = [];

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private modalService: NgbModal,
  private formBuilder:FormBuilder,
  private dateTimeUtil: DateTimeUtil,
  private reportsService: ReportsService,
  private logMessage: LogMessage,
  private generalOperation: GeneralOperation) { }
  

  ngOnInit() {
    this.buildForm();
  }
  buildForm(){
    debugger;
    this.addDailyDeposit = this.formBuilder.group({
      dateCheckDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      dateReceivedDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      txt_checknumber: this.formBuilder.control(null),    
      txtFile: this.formBuilder.control(null),
      txt_check_amnt: this.formBuilder.control(null),
      ddlInsName: this.formBuilder.control(null),
      txt_comments: this.formBuilder.control(null)
    })
    this.dailydepositReportForm = this.formBuilder.group({
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      ddldatetype: this.formBuilder.control(null),
      txt_checkno: this.formBuilder.control(null),
      txt_ins_name: this.formBuilder.control(null),
      ddltype: this.formBuilder.control(null)
    })
    this.dailyDepositMonthYear = this.formBuilder.group({
      cmbMonthsdaywise: this.formBuilder.control(null, Validators.required),
      txtYeardaywise: this.formBuilder.control(null, Validators.required)
    })
  }

  addDepositReport(){
    if(this.isDeposit == "search-report")
      this.isDeposit = "add-report";
    else
      this.isDeposit = "search-report";
  }
  depositReport(){
    if(this.isDeposit == "deposit-report")
      this.isDeposit = "search-report";
    else
      this.isDeposit = "deposit-report";
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };


  onFileChange(event) {
    debugger;
    this.fileAttached=undefined;
    if(event.target.files && event.target.files.length > 0) {
      debugger;
      this.fileAttached = event.target.files[0];
    }
  }

  removeAttachedFile(){
    debugger;
    this.addDailyDeposit.get("txt_comments").setValue("");
		this.IsFileRemove="y";
     if(this.fileAttached!=null || this.fileAttached!=""){
       this.fileAttached = "undefined";
     }
  }

  searchByMonthYear(){
    if ((this.dailyDepositMonthYear.get('cmbMonthsdaywise') as FormControl).value <= 0) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Month Selection', "Pleae select Month.", AlertTypeEnum.WARNING);
      return;
    }
    if ((this.dailyDepositMonthYear.get('txtYeardaywise') as FormControl).value == "" || (this.dailyDepositMonthYear.get('txtYeardaywise') as FormControl).value == null || (this.dailyDepositMonthYear.get('txtYeardaywise') as FormControl).value.length != 4) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Year Selection', "Please enter 4 digit year.", AlertTypeEnum.WARNING);
      return;
    }
    let dayWiseSearch: SearchCriteria = new SearchCriteria();
    dayWiseSearch.practice_id = this.lookupList.practiceInfo.practiceId;
    dayWiseSearch.param_list = [];
    dayWiseSearch.param_list.push({ name: "yearMonth", value: (this.dailyDepositMonthYear.get('txtYeardaywise') as FormControl).value + '' + (this.dailyDepositMonthYear.get('cmbMonthsdaywise') as FormControl).value, option: "" });


    this.reportsService.searchByMonthYear(dayWiseSearch).subscribe(
      data => {
        debugger;
        this.lstdayWise = data;
        //this.recordCount = data['length'];

        if (this.lstdayWise.length > 0) {
          if (data[0].total_month_days < 31) {
            this.colday31 = false;
            this.colH_day31 = false;
          }
          else {
            this.colday31 = true;
            this.colH_day31 = true;
          }
          if (data[0].total_month_days < 30) {
            this.colday30 = false;
            this.colH_day30 = false;
          }
          else {
            this.colday30 = true;
            this.colH_day30 = true;
          }
          if (data[0].total_month_days < 29) {
            this.colday29 = false;
            this.colH_day29 = false;
          }
          else {
            this.colday29 = true;
            this.colH_day29 = true;
          }
        }


        this.totalValues = [];
          let day_01_total:number=0;
					let day_02_total:number=0;
					let day_03_total:number=0;
					let day_04_total:number=0;
					let day_05_total:number=0;
					let day_06_total:number=0;
					let day_07_total:number=0;
					let day_08_total:number=0;
					let day_09_total:number=0;
					let day_10_total:number=0;
					let day_11_total:number=0;
					let day_12_total:number=0;
					let day_13_total:number=0;
					let day_14_total:number=0;
					let day_15_total:number=0;
					let day_16_total:number=0;
					let day_17_total:number=0;
					let day_18_total:number=0;
					let day_19_total:number=0;
					let day_20_total:number=0;
					let day_21_total:number=0;
					let day_22_total:number=0;
					let day_23_total:number=0;
					let day_24_total:number=0;
					let day_25_total:number=0;
					let day_26_total:number=0;
					let day_27_total:number=0;
					let day_28_total:number=0;
					let day_29_total:number=0;
					let day_30_total:number=0;
					let day_31_total:number=0;
					let total:number=0;
        if (this.lstdayWise != null && this.lstdayWise.length > 0) {
          for (var i = 0; i < this.lstdayWise.length; i++) {
            day_01_total += Number(this.lstdayWise[i].day_01);
            day_02_total += Number(this.lstdayWise[i].day_02);
            day_03_total += Number(this.lstdayWise[i].day_03);
            day_04_total += Number(this.lstdayWise[i].day_04);
            day_05_total += Number(this.lstdayWise[i].day_05);
            day_06_total += Number(this.lstdayWise[i].day_06);
            day_07_total += Number(this.lstdayWise[i].day_07);
            day_08_total += Number(this.lstdayWise[i].day_08);
            day_09_total += Number(this.lstdayWise[i].day_09);
            day_10_total += Number(this.lstdayWise[i].day_10);
            day_11_total += Number(this.lstdayWise[i].day_11);
            day_12_total += Number(this.lstdayWise[i].day_12);
            day_13_total += Number(this.lstdayWise[i].day_13);
            day_14_total += Number(this.lstdayWise[i].day_14);
            day_15_total += Number(this.lstdayWise[i].day_15);
            day_16_total += Number(this.lstdayWise[i].day_16);
            day_17_total += Number(this.lstdayWise[i].day_17);
            day_18_total += Number(this.lstdayWise[i].day_18);
            day_19_total += Number(this.lstdayWise[i].day_19);
            day_20_total += Number(this.lstdayWise[i].day_20);
            day_21_total += Number(this.lstdayWise[i].day_21);
            day_22_total += Number(this.lstdayWise[i].day_22);
            day_23_total += Number(this.lstdayWise[i].day_23);
            day_24_total += Number(this.lstdayWise[i].day_24);
            day_25_total += Number(this.lstdayWise[i].day_25);
            day_26_total += Number(this.lstdayWise[i].day_26);
            day_27_total += Number(this.lstdayWise[i].day_27);
            day_28_total += Number(this.lstdayWise[i].day_28);
            day_29_total += Number(this.lstdayWise[i].day_29);
            day_30_total += Number(this.lstdayWise[i].day_30);
            day_31_total += Number(this.lstdayWise[i].day_31);
            total += Number(this.lstdayWise[i].total);
          }
          
          let objDailyDeptCount: ORMDailyDepositTotalcount = new ORMDailyDepositTotalcount();
          objDailyDeptCount = new ORMDailyDepositTotalcount();
          objDailyDeptCount.day_01 = day_01_total;
          objDailyDeptCount.day_02 = day_02_total;
          objDailyDeptCount.day_03 = day_03_total;
          objDailyDeptCount.day_04 = day_04_total;
          objDailyDeptCount.day_05 = day_05_total;
          objDailyDeptCount.day_06 = day_06_total;
          objDailyDeptCount.day_07 = day_07_total;
          objDailyDeptCount.day_08 = day_08_total;
          objDailyDeptCount.day_09 = day_09_total;
          objDailyDeptCount.day_10 = day_10_total;
          objDailyDeptCount.day_11 = day_11_total;
          objDailyDeptCount.day_12 = day_12_total;
          objDailyDeptCount.day_13 = day_13_total;
          objDailyDeptCount.day_14 = day_14_total;
          objDailyDeptCount.day_15 = day_15_total;
          objDailyDeptCount.day_16 = day_16_total;
          objDailyDeptCount.day_17 = day_17_total;
          objDailyDeptCount.day_18 = day_18_total;
          objDailyDeptCount.day_19 = day_19_total;
          objDailyDeptCount.day_20 = day_20_total;
          objDailyDeptCount.day_21 = day_21_total;
          objDailyDeptCount.day_22 = day_22_total;
          objDailyDeptCount.day_23 = day_23_total;
          objDailyDeptCount.day_24 = day_24_total;
          objDailyDeptCount.day_25 = day_25_total;
          objDailyDeptCount.day_26 = day_26_total;
          objDailyDeptCount.day_27 = day_27_total;
          objDailyDeptCount.day_28 = day_28_total;
          objDailyDeptCount.day_29 = day_29_total;
          objDailyDeptCount.day_30 = day_30_total;
          objDailyDeptCount.day_31 = day_31_total;
          objDailyDeptCount.total = total;
          this.totalValues.push(objDailyDeptCount);
        }


      },
      error => {
        return;
      }
    );


  }

  saveDeposit(value){
    if(!(this.addDailyDeposit.get('txt_checknumber') as FormControl).value){
      GeneralOperation.showAlertPopUp(this.modalService, 'Check Number', "Please enter Check Number.", AlertTypeEnum.WARNING);
      return;
    }
    if(!(this.addDailyDeposit.get('txt_check_amnt') as FormControl).value){
      GeneralOperation.showAlertPopUp(this.modalService, 'Check Amount', "Please enter Check Amount.", AlertTypeEnum.WARNING);
      return;
    }
    if(!(this.addDailyDeposit.get('ddlInsName') as FormControl).value){
      GeneralOperation.showAlertPopUp(this.modalService, 'Insurance Name', "Please enter Insurance Name.", AlertTypeEnum.WARNING);
      return;
    }
    if(!(this.addDailyDeposit.get('dateCheckDate') as FormControl).value){
      GeneralOperation.showAlertPopUp(this.modalService, 'Check Date', "Please enter Check Date.", AlertTypeEnum.WARNING);
      return;
    }
    if(!this.fileAttached){
      GeneralOperation.showAlertPopUp(this.modalService, 'Attach File', "Please attach file.", AlertTypeEnum.WARNING);
      return;
    }
    if(this.acPath==null || this.acPath=="")
				{
          this.acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath,"category_name","EOB");
				}
    debugger;
    let dateCheck = this.dateTimeUtil.getStringDateFromDateModel((this.addDailyDeposit.get('dateCheckDate') as FormControl).value);
    let ReceivedDate = this.dateTimeUtil.getStringDateFromDateModel((this.addDailyDeposit.get('dateReceivedDate') as FormControl).value);

    this.obj_ORMDailyDeposit = new ORMDailyDeposit();
    this.obj_ORMDailyDeposit.check_number = (this.addDailyDeposit.get('txt_checknumber') as FormControl).value;
    this.obj_ORMDailyDeposit.check_amount = (this.addDailyDeposit.get('txt_check_amnt') as FormControl).value;
    this.obj_ORMDailyDeposit.insurance_name = (this.addDailyDeposit.get('ddlInsName') as FormControl).value;
    this.obj_ORMDailyDeposit.check_date = dateCheck;
    this.obj_ORMDailyDeposit.comments = (this.addDailyDeposit.get('txt_comments') as FormControl).value;
    if((this.addDailyDeposit.get('dateReceivedDate') as FormControl).value == ""){
      this.obj_ORMDailyDeposit.check_received_date = null;
    }
    else{
      this.obj_ORMDailyDeposit.check_received_date = ReceivedDate;
    }
    this.obj_ORMDailyDeposit.deleted = "0";
    this.obj_ORMDailyDeposit.system_ip = this.lookupList.logedInUser.systemIp;
    this.obj_ORMDailyDeposit.modified_user = this.lookupList.logedInUser.user_name;
    
    this.obj_ORMDailyDeposit.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    this.obj_ORMDailyDeposit.practice_id = this.lookupList.practiceInfo.practiceId.toString();

    if(this.IsEdit == false)
    {
      if(this.fileAttached!=null && this.fileAttached!=undefined){
        this.obj_ORMDailyDeposit.original_file_name = this.fileAttached.name;
        this.obj_ORMDailyDeposit.file_link = this.acPath[0].upload_path;
      }
      else{
        this.obj_ORMDailyDeposit.original_file_name=null;
        this.obj_ORMDailyDeposit.file_link=null;
      }	

      this.obj_ORMDailyDeposit.dailydeposit_id = "";
      this.obj_ORMDailyDeposit.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.obj_ORMDailyDeposit.created_user = this.lookupList.logedInUser.user_name;
    }
    else if(this.IsEdit==true){
       if(this.IsFileRemove=="n"){

        // if(this.fileAttached!=null && this.fileAttached!=undefined)
        // {
        //   this.objNewDoc.original_file_name=this.fileAttached.name;
        //   this.objNewDoc.name=this.fileAttached.name;
        // }
        // else{
        //   this.objNewDoc.original_file_name=this.selectedDocObj.original_file_name;
        //   this.objNewDoc.name=this.selectedDocObj.name;
        // }

        if(this.fileAttached!=null && this.fileAttached!=undefined){
           this.obj_ORMDailyDeposit.original_file_name = this.fileAttached.name;
           this.obj_ORMDailyDeposit.file_link = this.acPath[0].upload_path;
         }
         else{
           //this.obj_ORMDailyDeposit.original_file_name = this.fileAttached.name;
           this.obj_ORMDailyDeposit.original_file_name=this.fileAttached.name;
        this.obj_ORMDailyDeposit.file_link=this.acPath[0].upload_path;
         }	
       }else{
        this.fileAttached=undefined;
         this.obj_ORMDailyDeposit.original_file_name = "";
         this.obj_ORMDailyDeposit.file_link = "";
       }
       this.obj_ORMDailyDeposit.dailydeposit_id = value.dailydeposit_id;
       this.obj_ORMDailyDeposit.date_created = value.selectedItem.date_created;
       this.obj_ORMDailyDeposit.created_user = value.selectedItem.created_user;
       this.obj_ORMDailyDeposit.client_date_created = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
    }

    const formData: FormData=new FormData();
    //if(this.fileAttached!=null && this.fileAttached!=undefined){
    formData.append('docFile',this.fileAttached);
    
    formData.append('docData',JSON.stringify(this.obj_ORMDailyDeposit));
    formData.append('docCategory',"EOB");


    this.reportsService.saveupdateDailyDeposit(formData)
    .subscribe(
      data => this.savedSuccessfull(),
      error => alert(error),
      () => this.logMessage.log("Save Daily Deposit.")
    );
  }
  savedSuccessfull() {
    //this.getChartReasonForVisit_HPI(this.objencounterToOpen.chart_id);
    this.dataUpdated.emit(new ORMKeyValue("Daily Deposit", "1"));
    this.IsEdit = false;
  }
  cancelDeposit(){
    this.clearALL();
  }
  clearALL(){
    this.addDailyDeposit.get("dateCheckDate").setValue("");
    this.addDailyDeposit.get("dateReceivedDate").setValue("");
    this.addDailyDeposit.get("txt_checknumber").setValue("");
    this.addDailyDeposit.get("txtFile").setValue("");
    this.addDailyDeposit.get("txt_check_amnt").setValue("");
    this.addDailyDeposit.get("ddlInsName").setValue("");
    this.addDailyDeposit.get("txt_comments").setValue("");
    this.isDeposit = "search-report";
  }
  searchReport(formData){
    debugger;
    if((this.dailydepositReportForm.get('dateFrom') as FormControl).value == "" || (this.dailydepositReportForm.get('dateFrom') as FormControl).value == null){
      GeneralOperation.showAlertPopUp(this.modalService, 'Date From Selection', "Please enter date from.", AlertTypeEnum.WARNING);
      return;
    }
    if((this.dailydepositReportForm.get('dateTo') as FormControl).value == "" || (this.dailydepositReportForm.get('dateTo') as FormControl).value ==null){
      GeneralOperation.showAlertPopUp(this.modalService, 'Date To Selection', "Please enter date to.", AlertTypeEnum.WARNING);
      return;
    }
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list=[];

    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel((this.dailydepositReportForm.get('dateFrom') as FormControl).value);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel((this.dailydepositReportForm.get('dateTo') as FormControl).value);

    searchCriteria.param_list.push( { name: "dateFrom", value: vardateFrom, option: "" });
    searchCriteria.param_list.push( { name: "dateTo", value: vardateTo, option: "" });
    searchCriteria.param_list.push( { name: "ddldatetype", value: (this.dailydepositReportForm.get('ddldatetype') as FormControl).value==0? true: false, option: "" });
    searchCriteria.param_list.push( { name: "txt_checkno", value: (this.dailydepositReportForm.get('txt_checkno') as FormControl).value, option: "" });
    searchCriteria.param_list.push( { name: "txt_ins_name", value: (this.dailydepositReportForm.get('txt_ins_name') as FormControl).value, option: "" });

    this.lstDailyDeposit=new Array();
  this.reportsService.getDailyDeposit(searchCriteria).subscribe(
      data => {
        debugger;
        this.assignData(data);
      },
      error => {
        this.getDailyDeopositError(error);
      }
    );

  }
  getDailyDeopositError(error){
    this.errorMsg=error;
  }
  assignData(value){
    this.lstDailyDeposit = value;
    let total_count: number = 0;
    this.totalRow=new Array;
    if (this.lstDailyDeposit != null && this.lstDailyDeposit.length > 0) {
      for (var i = 0; i < this.lstDailyDeposit.length; i++) {
        total_count += Number(this.lstDailyDeposit[i].check_amount.toString().split("$")[1]);
      }
      let objDailyDeptTotal: ORMDailyDeposit = new ORMDailyDeposit();
      objDailyDeptTotal = new ORMDailyDeposit();
      objDailyDeptTotal.check_number = "TOTAL: "
      objDailyDeptTotal.check_amount = "$ "+ total_count;
      this.totalRow.push(objDailyDeptTotal);
      
    }
  }
  deleteSelected(record){

    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = record.dailydeposit_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.reportsService.deleteDailyDeposit(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Deposit Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Daily Deposit";
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
      this.searchReport('');
    }
  }
  editSelected(values){
    debugger;
    this.IsEdit = true;
    this.isDeposit = "search-report";
    this.chkDate = this.dateTimeUtil.getDateModelFromDateString(values.check_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
    this.chkRecDate = this.dateTimeUtil.getDateModelFromDateString(values.check_received_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);

     (this.addDailyDeposit.get("dateCheckDate") as FormControl).setValue(values.check_date);
     (this.addDailyDeposit.get("dateReceivedDate") as FormControl).setValue(values.check_received_date);
     (this.addDailyDeposit.get("txt_checknumber") as FormControl).setValue(values.check_number);
     (this.addDailyDeposit.get("txtFile") as FormControl).setValue('');
     (this.addDailyDeposit.get("txt_check_amnt") as FormControl).setValue(values.check_amount.split('$ ')[1]);
     (this.addDailyDeposit.get("ddlInsName") as FormControl).setValue(values.insurance_name);
     (this.addDailyDeposit.get("txt_comments") as FormControl).setValue(values.comments);

  }
}