import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { OpenModuleService } from '../../../services/general/openModule.service';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { LogMessage } from '../../../shared/log-message';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { SearchCriteria } from '../../../models/common/search-criteria';

@Component({
  selector: 'dashboard-pendingclaims',
  templateUrl: './dashboard-pendingclaims.component.html',
  styleUrls: ['./dashboard-pendingclaims.component.css']
})
export class DashboardPendingclaimsComponent implements OnInit {
  @Output() openModule = new EventEmitter<any>();
  @Output() widgetUpdate = new EventEmitter<any>();
  pendingClaimscount;
  listDashboardPendingClaims;
  selectedLocation: String = "";

  filterForm: FormGroup;
  radioForm: FormGroup;
  radioOption = "missing";
  showHideSearch = true;
  isLoading: boolean = false;
  constructor(private dashboardService: DashboardService,
    private logMessage: LogMessage,
    private openModuleService: OpenModuleService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.buildForm();
    this.missingClaims();
  }
  buildForm() {
    this.filterForm = this.formBuilder.group({
      ctrlproviderSearch: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider.toString() == '' ? 'all' : this.lookupList.logedInUser.defaultProvider, Validators.required),
      ctrllocationSearch: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation.toString() == '' ? 'all' : this.lookupList.logedInUser.defaultLocation, Validators.required)
    });

    this.radioForm = this.formBuilder.group({
      entryOption: this.formBuilder.control(this.radioOption)
    });
  }
  missingClaims() {
    debugger
    // let searchCriteria: SearchCriteria = new SearchCriteria();
    // searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    // searchCriteria.param_list= [{ name: "attending_physician",value: this.filterForm.get('ctrlproviderSearch').value,option:""},
    // { name: "location_id",value: this.filterForm.get('ctrllocationSearch').value,option:""}];
    // searchCriteria.option = 'draft';

    // let searchCriteria: SearchCriteria = new SearchCriteria();
    // searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    // searchCriteria.param_list= [{name: "provider_id",value: this.filterForm.get('ctrlproviderSearch').value=='all'?'0':this.filterForm.get('ctrlproviderSearch').value,option:""},
    // {name: "location_id",value: this.filterForm.get('ctrllocationSearch').value=="all"?'0':this.filterForm.get('ctrllocationSearch').value,option:""}];
    // searchCriteria.option = 'missing';
    // this.getMissingClaims(searchCriteria);
    this.onOptionChange("missing");
  }

  onOptionChange(event) {
    debugger;
    //if (event == "missing") {
    //  this.selectedOption = "missing";
    //} else {
    this.radioOption = event;
    //}
    if (this.radioOption == "missing") {
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [{ name: "provider_id", value: this.filterForm.get('ctrlproviderSearch').value == 'all' ? '0' : this.filterForm.get('ctrlproviderSearch').value, option: "" },
      { name: "location_id", value: this.filterForm.get('ctrllocationSearch').value == "all" ? '0' : this.filterForm.get('ctrllocationSearch').value, option: "" }];
      searchCriteria.option = 'missing';
      this.getMissingClaims(searchCriteria);
    }
    else if (this.radioOption == "draft") {
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [{ name: "attending_physician", value: this.filterForm.get('ctrlproviderSearch').value == 'all' ? '0' : this.filterForm.get('ctrlproviderSearch').value, option: "" },
      { name: "location_id", value: this.filterForm.get('ctrllocationSearch').value == "all" ? '0' : this.filterForm.get('ctrllocationSearch').value, option: "" }];
      searchCriteria.option = 'draft';
      this.getMissingClaims(searchCriteria);
    }

  }
  getMissingClaims(searchCriteria) {
    this.isLoading = true;
    this.dashboardService.getMissingClaims(searchCriteria)
      .subscribe(
        data => {
          this.listDashboardPendingClaims = "";
          this.listDashboardPendingClaims = data
          this.pendingClaimscount = this.listDashboardPendingClaims.length;
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          this.logMessage.log("getMissingClaims Successfull" + error);
        }
      );
  }
  onFilter(criteria) {
    debugger;
    this.showHideSearch = true;
    let selectedProvider: String = "";
    let selectedLocation: String = "";
    if (criteria.ctrlproviderSearch != 'all') {
      selectedProvider = criteria.ctrlproviderSearch;
    } else {
      selectedProvider = '0';
    }
    if (criteria.ctrllocationSearch != 'all') {
      selectedLocation = criteria.ctrllocationSearch;
    } else {
      selectedLocation = '0';
    }
    if (this.radioOption == "missing") {
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [{ name: "provider_id", value: selectedProvider, option: "" },
      { name: "location_id", value: selectedLocation, option: "" }];
      searchCriteria.option = 'missing';
      this.getMissingClaims(searchCriteria);
    } else if (this.radioOption == "draft") {
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [{ name: "attending_physician", value: selectedProvider, option: "" },
      { name: "location_id", value: selectedLocation, option: "" }];
      searchCriteria.option = 'draft';
      this.getMissingClaims(searchCriteria);
    }
  }
  openClaim(obj) {
    this.openModule.emit(obj)
  }
  onRefresh(criteria) {
    this.widgetUpdate.emit('pendingClaim');
    this.onFilter(criteria);
  }
  showHidetoggle() {
    this.showHideSearch = false;
  }

  reloadModule() {
    debugger;
    this.missingClaims();
  }
}
