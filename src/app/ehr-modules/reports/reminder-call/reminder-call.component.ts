import { Component, OnInit, Inject } from '@angular/core';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ReportsService } from 'src/app/services/reports.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { excelService } from 'src/app/shared/excelService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'reminder-call',
  templateUrl: './reminder-call.component.html',
  styleUrls: ['./reminder-call.component.css']
})
export class ReminderCallComponent implements OnInit {

  lstCallDetails: Array<any>;
  dateFrom;
  dateTo;
  locationId;
  frmCallSubmit: FormGroup;
  //recordCount;
  mylocation;
  selectedRow;
  isLoading: boolean = false;
  rptType: string = "call";
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil, private modalService: NgbModal,
    private formBuilder: FormBuilder, private excel: excelService,
    private reportsService: ReportsService
    // private fb: FormBuilder

  ) {
    this.mylocation = this.lookupList.locationList;

    // this.frmCallSubmit = this.fb.group({
    //   dateFrom: this.formBuilder.control(null, Validators.required),
    //   dateTo: this.formBuilder.control(null, Validators.required),
    //   cmbLocation: this.formBuilder.control(this.locationId),
    // })
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.frmCallSubmit = this.formBuilder.group({
      rptType: this.formBuilder.control(this.rptType),
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'':this.lookupList.logedInUser.defaultLocation),

    })
    // ,{
    //   validator: Validators.compose([
    //     CustomValidators.validDate('dateFrom', false),
    //     CustomValidators.validDate('dateTo', true)
    //   ])
    // }
  }
  onrptTypeChange(type: string) {
    this.rptType = type;
    lstCallDetails: new Array();
  }
  searchCallData(formData) {
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];

    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    searchCriteria.param_list.push({ name: "dateFrom", value: vardateFrom, option: "" });
    searchCriteria.param_list.push({ name: "dateTo", value: vardateTo, option: "" });
    searchCriteria.param_list.push({ name: "cmbLocation", value: (this.frmCallSubmit.get('cmbLocation') as FormControl).value, option: "" });

    if(this.rptType=="call")
    {
      this.reportsService.getCallsData(searchCriteria).subscribe(
        data => {
          lstCallDetails: new Array();
          this.lstCallDetails = data as Array<any>;
          this.isLoading = false;
          //this.recordCount=this.lstCallDetails['length'];
        },
        error => {
          this.isLoading = false;
          alert('Error is :' + error.message);
        }
      );
    }
    else{
      this.reportsService.getAppointmentsms(searchCriteria).subscribe(
        data => {
          lstCallDetails: new Array();
          this.lstCallDetails = data as Array<any>;
          this.isLoading = false;
          //this.recordCount=this.lstCallDetails['length'];
        },
        error => {
          this.isLoading = false;
          alert('Error is :' + error.message);
        }
      );

    }
  }
  onSelectionChange(row) {
    this.selectedRow = row.row_id;
  }
  exportAsXLSX() {
    if (this.lstCallDetails != undefined || this.lstCallDetails != null) {
      this.excel.exportAsExcelFile(this.lstCallDetails, 'call_date,appointment_date,alternate_account,pat_name,status', 'ACU-Report');
    }
    else {
      GeneralOperation.showAlertPopUp(this.modalService, 'Export To Excel', "Record not found to export.", AlertTypeEnum.WARNING);
      return false;
    }
  }
}