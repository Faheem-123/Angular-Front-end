import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { LogMessage } from '../../shared/log-message';
import { SearchService } from '../../services/search.service';
import { LookupList, LOOKUP_LIST } from '../../providers/lookupList.module';
import { SearchCriteria } from '../../models/common/search-criteria';

@Component({
  selector: 'inline-race-ethnicity-search',
  templateUrl: './inline-race-ethnicity-search.component.html',
  styleUrls: ['./inline-race-ethnicity-search.component.css']
})
export class InlineRaceEthnicitySearchComponent implements OnInit {
  @Input() searchValue: string;
  @Input() searchType: string;
  @Input() title: string;
  @Output() onSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();

  isLoading: boolean = true;
  lstSearchResult:Array<any>;

  constructor(private logMessage: LogMessage,
    private searchService: SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    this.search();
  }

  search() {
   
    this.isLoading = true;
    this.lstSearchResult = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "criteria", value: this.searchValue, option: "" }
    ];

    if (this.searchType == "RACE") {
      this.searchService.searchRace(searchCriteria).subscribe(
        data => {
          this.lstSearchResult = data as Array<any>;
          this.isLoading = false;
        },
        error => {
          this.onSearchError(error);
          this.isLoading = false;
        }
      );
    }
    else if (this.searchType == "ETHNICITY") {
      this.searchService.searchEthnicity(searchCriteria).subscribe(
        data => {
          this.lstSearchResult = data as Array<any>;
          this.isLoading = false;
        },
        error => {
          this.onSearchError(error);
          this.isLoading = false;
        }
      );
    }
  }  

  onSearchError(error) {
    this.logMessage.log("SearchError:" + error);
  }  
}
