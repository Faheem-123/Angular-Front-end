import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { LogMessage } from "../../../shared/log-message";
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'dashboard-cashregister',
  templateUrl: './dashboard-cashregister.component.html',
  styleUrls: ['./dashboard-cashregister.component.css']
})
export class DashboardCashregisterComponent implements OnInit {
  @Output() widgetUpdate = new EventEmitter<any>();
  listCashRegDetailsResult;
  isClickedDate: String = "";
  view;
  showGraph: Boolean;
  showGrid: Boolean;
  filterForm: FormGroup;
  booleanCheck: Boolean;
  showHideSearch = true;
  isLoading: boolean = false;
  constructor(private dashBoardCashRegister: DashboardService,
    private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private dashboardService: DashboardService) {

    this.getCashPayment('', '');
    this.showGraph = true;
    this.showGrid = false;
    this.view = "Normal View";
  }

  buildForm() {
    this.filterForm = this.formBuilder.group({
      ctrlproviderSearch: this.formBuilder.control("all", Validators.required),
      ctrllocationSearch: this.formBuilder.control("all", Validators.required)
    })

  }

  ngOnInit() {
    this.buildForm();
  }
  /////
  public barChartOptions: any = {
    responsive: true
  };
  public barChartLabels: string[] = [];
  public barChartType: string = 'bar';


  public barChartData: Array<any> = [
    { data: [], label: '$' }
  ];
  // events
  public chartClicked(e: any): void {

    if (e.active.length > 0) {
      this.isClickedDate = e.active[0]._model.label;
      e.active[0]._model.backgroundColor("rgba(244,9,33, 0.8)");
    }
  }

  public chartHovered(e: any): void {
    //console.log(e);
  }
  ////
  getCashPayment(provider_id, location_id) {
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "provider_id", value: provider_id, option: "" },
      { name: "location_id", value: location_id, option: "" },
    ];



    this.dashBoardCashRegister.getCashRegisterLastWeekDayWisePayment(searchCriteria)
      .subscribe(
        data => {
          debugger;
          //this.listPendingLabResult = data
          this.drawBars(data)
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          this.logMessage.log("getcash register Successfull" + error);
        }
      );
  }
  drawBars(values) {

    this.barChartLabels = [];
    this.barChartData[0].data = [];
    for (let att of values) {
      this.barChartLabels.push(att.payment_date);
      this.barChartData[0].data.push(att.payment);
    }
  }
  //detail view
  gotoDetails() {

    if (this.view == "Normal View") {
      if (this.isClickedDate == "") {
        alert("Please select date to view its details.");
        return;
      } else {
        this.view = "Graph View";
        this.getCashPaymentDetails(this.isClickedDate, '', '');
        //this.isClickedDate = "";
        this.showGraph = false;
        this.showGrid = true;
      }

    } else if (this.view == "Graph View") {
      this.view = "Normal View";
      this.isClickedDate = "";
      this.showGraph = true;
      this.showGrid = false;
      return false;
    }


  }

  getCashPaymentDetails(date, provider_id, location_id) {
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "date", value: date, option: "" },
      { name: "provider_id", value: provider_id, option: "" },
      { name: "location_id", value: location_id, option: "" },
    ];


    this.dashBoardCashRegister.getCashPaymentDetails(searchCriteria)
      .subscribe(
        data => {
          this.cashRegisterDetails(data)
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          this.logMessage.log("getcash register Details Successfull" + error);
        }
      );
  }
  cashRegisterDetails(valueRecv) {

    if (valueRecv != "") {

      this.listCashRegDetailsResult = valueRecv
    }
  }
  //refresh record
  refreshRecord() {
    if (this.view == "Normal View") {
      this.getCashPaymentDetails(this.isClickedDate, '', '');
    }
    else if (this.view == "Graph View") {
      this.getCashPayment('', '');
    }
    this.widgetUpdate.emit('cash');
  }
  onFilter(criteria) {
    this.showHideSearch = true;
    let selectedProvider: String = "";
    let selectedLocation: String = "";
    if (criteria.ctrlproviderSearch != 'all') {
      selectedProvider = criteria.ctrlproviderSearch;
    } else {
      selectedProvider = '';
    }
    if (criteria.ctrllocationSearch != 'all') {
      selectedLocation = criteria.ctrllocationSearch;
    } else {
      selectedLocation = '';
    }
    this.booleanCheck = false;
    this.getCashPayment(selectedProvider, selectedLocation);
  }
  showHidetoggle(){
    this.showHideSearch = false;
  }
}
