import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchService } from 'src/app/services/search.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'inline-phr-patient-search',
  templateUrl: './inline-phr-patient-search.component.html',
  styleUrls: ['./inline-phr-patient-search.component.css']
})
export class InlinePhrPatientSearchComponent implements OnInit {
  @Input() searchValue: string
  @Output() onPatientSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  
  isLoading: boolean = true;
  lstPHRPatient: Array<any>

  constructor(private logMessage: LogMessage,
    private searchService: SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    this.searchPHRPatient();
  }
  searchPHRPatient() {
    debugger;
    this.isLoading = true;
    this.lstPHRPatient = undefined;
    if (this.searchValue != undefined && this.searchValue != "") {
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.option = "DEFAULT";
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
        { name: "criteria", value: this.searchValue, option: "" }
      ];
      this.searchService.PHRsearchPatient(searchCriteria).subscribe(
        data => {
          this.lstPHRPatient = data as Array<any>
          this.isLoading = false;
        },
        error => {
          this.onSearchPHRPatientError(error);
          this.isLoading = false;
        }
      );
    }
  }
  onSearchPHRPatientError(error) {
    this.logMessage.log("searchPHRPatient:" + error);
  }
}