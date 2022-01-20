import { Component, OnInit, Input, Output, EventEmitter, Inject, OnChanges } from '@angular/core';
import { LogMessage } from '../../shared/log-message';
import { SearchCriteria } from '../../models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from '../../providers/lookupList.module';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'inline-labtest-search',
  templateUrl: './inline-labtest-search.component.html',
  styleUrls: ['./inline-labtest-search.component.css']
})
export class InlineLabtestSearchComponent implements OnChanges {
  @Input() testSearchCriteria:SearchCriteria;
  @Output() onLabTestSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();

  lstLabTests:Array<any>;
  isLoading:boolean=true;

  constructor(private logMessage:LogMessage,
    private searchService:SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,) { }

  // ngOnInit() {
  //   this.searchLabTest();
  // }
  ngOnChanges() {
    this.searchLabTest();
  }
  searchLabTest(){

    debugger;
    this.isLoading = true;
    this.lstLabTests=undefined;
   this.searchService.searchLabMappingTest(this.testSearchCriteria).subscribe(
      data => {
        debugger;
        this.lstLabTests = data as Array<any>;
        this.isLoading=false;
      },
      error => {
        this.onSearchLabTestError(error);
        this.isLoading=false;
      }
    );
   
  }
  onSearchLabTestError(error){
    this.logMessage.log("searchLabMappingTest:"+error);
  }
}
