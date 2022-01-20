import { Component, OnChanges, Output, Input, Inject, EventEmitter, ViewChildren } from '@angular/core';
import { LogMessage } from 'src/app/shared/log-message';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchService } from 'src/app/services/search.service';
import { ProcedureSearchCriteria } from './proc-search-criteria';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'inline-procedure-search',
  templateUrl: './inline-procedure-search.component.html',
  styleUrls: ['./inline-procedure-search.component.css']
})
export class InlineProcedureSearchComponent implements OnChanges {

  @Input() procSearchCriteria: ProcedureSearchCriteria;
  @Output() onSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();


  @ViewChildren('buttons') buttons;
  selectedIndex: number = 0;
  isLoading: boolean = true;

  lst: Array<any>;

  constructor(private logMessage: LogMessage,
    private searchService: SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList
  ) { }


  /*
  ngOnInit() {

    debugger;
    console.log(this.diagSearchCriteria);
    
    this.searchDiag();
  }
  */
  ngOnChanges() {
    debugger;
    //console.log(this.procSearchCriteria);
    //this.search();
    this.search();
  }

  search() {
    debugger;
    this.isLoading = true;
    this.lst = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.option = this.procSearchCriteria.searchType;
    searchCriteria.param_list = [
      { name: "search_criteria", value: this.procSearchCriteria.criteria.toString(), option: "" },
      { name: "dos", value: this.procSearchCriteria.dos.toString(), option: "" },
      { name: "provider_id", value: this.procSearchCriteria.providerId == undefined ? "" : this.procSearchCriteria.providerId.toString(), option: "" },
    ];


    this.searchService.searchProcedures(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.lst = data as Array<any>;
          this.isLoading = false;
        },
        error => {
          this.logMessage.log("An Error Occured while getting Procedure list.")
          this.isLoading = false;
        }
      );
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

  focusIndex(rowIdx: number,scrollToView:boolean) {
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
      //if(scrollToView){
      //var elmnt = document.getElementById("tr_"+rowIdx);
      //elmnt.scrollIntoView();
      //}
    }
  }

  shiftFocusDown(rowIdx: number) {
    debugger;
    //console.log("DOWN", colIdx, rowIdx)
    // add 1 but don't go beyond my row range
    rowIdx = Math.min(rowIdx + 1);
    this.focusIndex(rowIdx,true);
  }

  shiftFocusUp(rowIdx: number) {
    debugger;
    //console.log("UP", colIdx, rowIdx);
    // up 1, but not less than 0
    rowIdx = Math.max(0, rowIdx - 1);
    this.focusIndex(rowIdx,true);
  }


  procRowClick(rowIdx: number) {
    this.focusIndex(rowIdx,false);
  }

}
