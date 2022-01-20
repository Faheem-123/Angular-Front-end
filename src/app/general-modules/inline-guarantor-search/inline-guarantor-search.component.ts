import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { LogMessage } from '../../shared/log-message';
import { SearchService } from '../../services/search.service';
import { LookupList, LOOKUP_LIST } from '../../providers/lookupList.module';
import { SearchCriteria } from '../../models/common/search-criteria';

@Component({
  selector: 'inline-guarantor-search',
  templateUrl: './inline-guarantor-search.component.html',
  styleUrls: ['./inline-guarantor-search.component.css']
})
export class InlineGuarantorSearchComponent implements OnInit {

  @Input() searchValue:string
  @Input() recordId:number;
  @Output() onSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();

  isLoading:boolean=true;

  lstGurantors:Array<any>;

  constructor(private logMessage:LogMessage,
    private searchService:SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList
  ) { }

  ngOnInit() {
    
    this.searchGurantor();
  }

  searchGurantor(){

    debugger;
    this.isLoading = true;
    this.lstGurantors=undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "search_value", value: this.searchValue, option: "" }
    ];


    this.searchService.searchGurantor(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstGurantors = data as Array<any>;
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
