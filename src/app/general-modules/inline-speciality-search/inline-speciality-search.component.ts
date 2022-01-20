import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { LogMessage } from '../../shared/log-message';
import { SearchService } from '../../services/search.service';
import { LOOKUP_LIST, LookupList } from '../../providers/lookupList.module';
import { SearchCriteria } from '../../models/common/search-criteria';

@Component({
  selector: 'inline-speciality-search',
  templateUrl: './inline-speciality-search.component.html',
  styleUrls: ['./inline-speciality-search.component.css']
})
export class InlineSpecialitySearchComponent implements OnInit {

  @Input() searchValue:string; 
  @Output() onSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();

  isLoading:boolean=true;

  lstSpeciality:Array<any>

  constructor(private logMessage:LogMessage,
    private searchService:SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList
  ) { }

  ngOnInit() {    
    this.search();
  }

  search(){

    debugger;
    this.isLoading = true;
    this.lstSpeciality=undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "search_value", value: this.searchValue, option: "" }
    ];


    this.searchService.searchSpeciality(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstSpeciality = data as Array<any>
        this.isLoading=false;
      },
      error => {
        this.onSearchError(error);
        this.isLoading=false;
      }
    );
   
  }
  
  onSearchError(error){
    this.logMessage.log("onSearchError:"+error);
  }
}
