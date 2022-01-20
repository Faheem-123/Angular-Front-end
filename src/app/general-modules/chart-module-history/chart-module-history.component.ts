import { Component, OnInit, Inject, Input } from '@angular/core';
import { LogMessage } from '../../shared/log-message';
import { EncounterService } from '../../services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from '../../providers/lookupList.module';
import { SearchCriteria } from "../../models/common/search-criteria";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from '../../shared/date-time-util';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-chart-module-history',
  templateUrl: './chart-module-history.component.html',
  styleUrls: ['./chart-module-history.component.css']
})
export class ChartModuleHistoryComponent implements OnInit {
  @Input() data:any;
  listHistoryHPI:Array<any>;
  listHistoryHPIHeader:Array<any>;
  module_name:string;
  isLoading: boolean = true;
  searchHistoryForm: FormGroup;
  varQuery :string= "";
  varOrderPart:string = "";
  strEncounterQuery: string = "";

  constructor(private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    public activeModal: NgbActiveModal,
    private dateTimeUtil: DateTimeUtil,
    private formBuilder: FormBuilder,
    private encounterService: EncounterService) {
  }

  ngOnInit() {
    this.module_name = this.data.titleString;
    this.isLoading = true;
    this.encounterService.LoadChartModuleHistoryHeader(this.data.moduleName)
      .subscribe(
        data => {
          debugger;
          //this.listHistoryHPIHeader  = data;
          this.varQuery = data[0].col1;
          this.varOrderPart = data[0].col2;
          var array = data[0].col1.split(",");
          var col2 = [];
          for (let i = 0; i < array.length; i++) {
            col2.push(array[i].split("[)]")[0].substring(array[i].split("[)]")[0].indexOf("(") + 1, array[i].split("[)]")[0].length));
          }
          var col3 = [];
          for (let x = 0; x < col2.length; x++) {
            if (col2[x].indexOf("]") > -1) {
              if (col2[x].split("]")[0].split("[")[1].indexOf("~") > -1) {
                col3.push(col2[x].split("]")[0].split("[")[1].split("~")[0]);
              } else {
                col3.push(col2[x].split("]")[0].split("[")[1]);
              }
            }
          }
          debugger;
          this.listHistoryHPIHeader = col3;
        },
        error => alert(error),
        () => this.logMessage.log("get history Successfull.")
      );
    this.getHistoryData();
    //this.buildForm();
  }
  buildForm() {
    this.searchHistoryForm = this.formBuilder.group({
      cntrlfromDate: this.formBuilder.control("", Validators.required),
      cntrltoDate: this.formBuilder.control("", Validators.required),
      cntrluserSearch: this.formBuilder.control("All", Validators.required)
    })
  }

  searchHistory(criteria) {
    debugger;
    var critria: String = "";
    var tbleAlies: String = "";
    if (this.varQuery != null && this.varQuery.length > 0) {
      var getSplit = this.varQuery.split('where');
      if (getSplit != null && getSplit.length > 0)
        var afterSplit = getSplit[1].split('.');

      if (afterSplit != null && afterSplit.length > 0)
        tbleAlies = afterSplit[0].toString();
    }
    var ddlUser = (this.searchHistoryForm.get('cntrluserSearch') as FormControl).value;
    var dateFrom = (this.searchHistoryForm.get('cntrlfromDate') as FormControl).value;
    var dateTo = (this.searchHistoryForm.get('cntrltoDate') as FormControl).value;
    if (ddlUser != -1) {
      criteria = criteria + "and " + tbleAlies + ".modified_user = '" + ddlUser + "'";
    }
    if (dateFrom != "" && dateTo != "")
      critria = critria + " and CONVERT(datetime, CONVERT(varchar," + tbleAlies + ".date_modified,101)) between CONVERT(datetime,'" + dateFrom + "') and CONVERT(datetime,'" + dateTo + "')";
    else if (dateFrom != "")
      critria = critria + " and CONVERT(datetime, CONVERT(varchar," + tbleAlies + ".date_modified,101)) >= CONVERT(datetime,'" + dateFrom + "')";
    else if (dateTo != "")
      critria = critria + " and CONVERT(datetime, CONVERT(varchar," + tbleAlies + ".date_modified,101)) <= CONVERT(datetime,'" + dateTo + "')";

    if (this.varQuery != null && this.varQuery.length > 0) {
      this.strEncounterQuery = this.varQuery + " " + this.data.criteria + " " + critria + " " + this.varOrderPart;
    } else {
      this.strEncounterQuery = "";
    }

if(this.strEncounterQuery!=""){
  {
    this.encounterService.getChartModuleHistCriteria(this.strEncounterQuery)
      .subscribe(
      data => {
        
      },
      error => alert(error),
      () => this.logMessage.log("getcash register Successfull.")
      );
  }
}


    /*
if(strEncounterQuery !=="")
					RoAuditLog.getEncounterDetail(strEncounterQuery);
				else
					grdDetails.dataProvider = null;
*/
  }

  cancelSearchHistory() {
    debugger;
    (this.searchHistoryForm.get('cntrlfromDate') as FormControl).setValue("");
    (this.searchHistoryForm.get('cntrltoDate') as FormControl).setValue("");
    (this.searchHistoryForm.get('cntrluserSearch') as FormControl).setValue("");
  }

  getHistoryData() {
    debugger;
    if (this.data != undefined && this.data != null) {
      debugger;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = 0;
      //searchCriteria.criteria = this.data.parameter;
      searchCriteria.criteria = this.data.criteria
      searchCriteria.option = '';
      this.LoadChartModuleHistory(this.lookupList.practiceInfo.practiceId.toString(), this.data.moduleName, searchCriteria);
    }
  }

  LoadChartModuleHistory(practice_id, moduleName, searchCriteria) {
    this.encounterService.LoadChartModuleHistory(practice_id, moduleName, searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.listHistoryHPI = data as Array<any>;;
        },
        error => alert(error),
        () => this.logMessage.log("get history Successfull.")
      );
    this.isLoading = false;
  }
  closePopUp() {
    this.activeModal.close(true);
  }
}