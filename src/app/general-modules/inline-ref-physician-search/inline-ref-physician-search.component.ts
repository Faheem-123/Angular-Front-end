import { Component, Input, Output, EventEmitter, Inject, OnChanges, ViewChildren } from '@angular/core';
import { LogMessage } from '../../shared/log-message';
import { SearchService } from '../../services/search.service';
import { LOOKUP_LIST, LookupList } from '../../providers/lookupList.module';
import { SearchCriteria } from '../../models/common/search-criteria';

@Component({
  selector: 'inline-ref-physician-search',
  templateUrl: './inline-ref-physician-search.component.html',
  styleUrls: ['./inline-ref-physician-search.component.css']
})
export class InlineRefPhysicianSearchComponent implements OnChanges {

  @Input() searchValue: string;
  @Input() refConsultlist;
  @Output() onSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();

  isLoading: boolean = true;
  @ViewChildren('buttons') buttons;
  
  lstRefPhysician: Array<any>
  selectedIndex: number = 0;
  constructor(private logMessage: LogMessage,
    private searchService: SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList
  ) { }

  ngOnChanges() {
    this.search();
  }

  search() {

    debugger;
    this.isLoading = true;
    this.lstRefPhysician = undefined;
    if(this.refConsultlist!=null)
    {
      this.lstRefPhysician = this.refConsultlist;
      this.isLoading = false;
      return;
    }
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "search_value", value: this.searchValue, option: "" }
    ];


    this.searchService.searchRefPhysician(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstRefPhysician = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.onSearchError(error);
        this.isLoading = false;
      }
    );

  }

  onSearchError(error) {
    this.logMessage.log("onSearchError:" + error);
  }

  focusFirstIndex() {

    debugger;

    let buttonEls = this.buttons.toArray();
    // get the flat index from row/cols
    // let flatIdx = rowIdx(rowIdx * this.columns.length) + colIdx;
    // get that reference from the input array and use the native element focus() method
    buttonEls[0].nativeElement.focus();
    this.selectedIndex = 0;
    //this.keyPressed = "";
  }

  focusIndex(rowIdx: number, scrollToView: boolean) {
    debugger;
    //console.log(rowIdx);
    // convert ViewChildren querylist to an array to access by index
    let buttonEls = this.buttons.toArray();
    // get the flat index from row/cols
    //let flatIdx = rowIdx(rowIdx * this.columns.length) + colIdx;
    // get that reference from the input array and use the native element focus() method
    if (buttonEls != undefined && buttonEls.length > rowIdx && rowIdx >= 0) {
      buttonEls[rowIdx].nativeElement.focus();
      this.selectedIndex = rowIdx;
     // if (scrollToView) {
     //   var elmnt = document.getElementById("tr_" + rowIdx);
     //   elmnt.scrollIntoView();
     // }
    }
  }

  shiftFocusDown(rowIdx: number) {
    debugger;
    //console.log("DOWN", colIdx, rowIdx)
    // add 1 but don't go beyond my row range
    rowIdx = Math.min(rowIdx + 1);
    this.focusIndex(rowIdx, true);
  }

  shiftFocusUp(rowIdx: number) {
    debugger;
    //console.log("UP", colIdx, rowIdx);
    // up 1, but not less than 0
    rowIdx = Math.max(0, rowIdx - 1);
    this.focusIndex(rowIdx, true);
  }

  insRowClick(rowIdx: number) {
    this.focusIndex(rowIdx, false);
  }
}
