import { Component, OnInit, Input, EventEmitter, Output, Inject, OnChanges } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchService } from 'src/app/services/search.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'inline-lab-test-search',
  templateUrl: './inline-lab-test-search.component.html',
  styleUrls: ['./inline-lab-test-search.component.css']
})
export class InlineLabTestSearchComponent implements OnChanges {

  
  @Input() testSearchCriteria:SearchCriteria;
  @Output() onLabTestSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  lstLabTests:Array<any>;
  isLoading:boolean=true;
  isCptGridShow=false;

  constructor(private logMessage:LogMessage,
    private searchService:SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnChanges() {
    this.searchLabTest();
  }
  searchLabTest(){

    debugger;
    if(this.testSearchCriteria.option=="CPT")
      this.isCptGridShow=true;
    else
      this.isCptGridShow=false;
    this.isLoading = true;
    this.lstLabTests=undefined;

    this.searchService.searchLabTest(this.testSearchCriteria).subscribe(
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
    this.logMessage.log("searchLabTestError:"+error);
  }

}
