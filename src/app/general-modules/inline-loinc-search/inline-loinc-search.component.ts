import { Component, OnInit, Input, Output, EventEmitter, OnChanges, Inject } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'inline-loinc-search',
  templateUrl: './inline-loinc-search.component.html',
  styleUrls: ['./inline-loinc-search.component.css']
})
export class InlineLoincSearchComponent implements  OnChanges  {

  @Input() searchValue:string
  @Output() onLionicSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  lstvalue:Array<any>;
  isLoading:boolean=true;
  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList
  ,private searchService:SearchService) { }

  ngOnChanges() {
    this.searchLoinc();
  }
  searchLoinc(){
    debugger;
    this.isLoading = true;
    this.lstvalue=undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.criteria=this.searchValue

    // searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    // searchCriteria.param_list = [
    //   { name: "criteria", value: this.searchValue, option: "" }
    // ];
    this.searchService.getLoinCode(searchCriteria).subscribe(
      data => {
        this.lstvalue = data as Array<any>;
        this.isLoading=false;
      },
      error => {
        this.onSearchLabTestError(error);
        this.isLoading=false;
      }
    );
   
  }
  onSearchLabTestError(error){
   // this.logMessage.log("searchLabTestError:"+error);
  }
}
