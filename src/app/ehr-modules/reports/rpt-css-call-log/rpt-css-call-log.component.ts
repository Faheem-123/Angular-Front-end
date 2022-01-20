import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { ReportsService } from 'src/app/services/reports.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { GeneralService } from 'src/app/services/general/general.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'rpt-css-call-log',
  templateUrl: './rpt-css-call-log.component.html',
  styleUrls: ['./rpt-css-call-log.component.css']
})
export class RptCssCallLogComponent implements OnInit {
  frmInput:FormGroup;
  isLoading=false;
  listrpt;
  recordCount=0;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private formBuilder: FormBuilder,
  private reportsService: ReportsService,
  private logMessage: LogMessage,
  private dateTimeUtil: DateTimeUtil,
  private generalService: GeneralService,
  private generalOperation: GeneralOperation) { }

  ngOnInit() {
    this.buildForm();
    if (this.lookupList.billingUsersList == undefined || this.lookupList.billingUsersList.length == 0) {
      this.getBillingUsersList();
    }
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
  
  buildForm() {
    this.frmInput = this.formBuilder.group({
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      cmbUser: this.formBuilder.control('ALL'),
      cmbType: this.formBuilder.control('ALL'),
    })
     
  }
  searchLog(formData){
    debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];
    debugger
    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    searchCriteria.param_list.push({ name: "dateFrom", value: vardateFrom, option: "" });
    searchCriteria.param_list.push({ name: "dateTo", value: vardateTo, option: "" });
    searchCriteria.param_list.push({ name: "user", value: formData.cmbUser == undefined ? 'ALL' : formData.cmbUser, option: "" });
    searchCriteria.param_list.push({ name: "type", value: formData.cmbType == undefined ? 'ALL' : formData.cmbType, option: "" });

    this.reportsService.getcssCallLog(searchCriteria).subscribe(
      data => {
        debugger;
        this.isLoading = false;
        this.listrpt = data;
        this.recordCount = this.listrpt.length;
      },
      error => {
        this.isLoading = false;
        this.getEligVerifError(error);
      }
    );
  }
  getEligVerifError(error) {
   // this.errorMsg = error;
  }
}
