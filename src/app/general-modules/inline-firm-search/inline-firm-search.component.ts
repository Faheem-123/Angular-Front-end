import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchService } from 'src/app/services/search.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';

@Component({
  selector: 'inline-firm-search',
  templateUrl: './inline-firm-search.component.html',
  styleUrls: ['./inline-firm-search.component.css']
})
export class InlineFirmSearchComponent implements OnInit {
  @Input() searchValue:string
  @Output() onClose = new EventEmitter<any>();
  @Output() onFirmSelect = new EventEmitter<any>();

  isLoading:boolean=true;
  lstFirmName:Array<any>
  constructor(private logMessage:LogMessage,
    private searchService:SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,) { }

  ngOnInit() {
    this.searchFirm();
  }
  searchFirm(){
    debugger;
    this.isLoading = true;
    this.lstFirmName=undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "criteria", value: this.searchValue, option: "" }
    ];


    this.searchService.searchFirm(searchCriteria).subscribe(
      data => {
        this.lstFirmName = data as Array<any>
        this.isLoading=false;
      },
      error => {
        this.onSearchFirmError(error);
        this.isLoading=false;
      }
    );
   
  }
  onSearchFirmError(error){
    this.logMessage.log("SearchFirmError:"+error);
  }
}
