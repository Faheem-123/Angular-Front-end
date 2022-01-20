import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChildren } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchService } from 'src/app/services/search.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'inline-payer-search',
  templateUrl: './inline-payer-search.component.html',
  styleUrls: ['./inline-payer-search.component.css']
})
export class InlinePayerSearchComponent implements OnInit {
@Input() searchValue;
@Output() onPayerSelect = new EventEmitter<any>();
@Output() onClose = new EventEmitter<any>();
@Input() calling_from='';

@ViewChildren('buttons') buttons;

isLoading:boolean=true;

lstPayer;

  constructor(private logMessage:LogMessage,
    private searchService:SearchService,private generalOperation:GeneralOperation,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,) { }

  ngOnInit() {
    this.searchPayer();
  }

  searchPayer(){

    debugger;
    this.isLoading = true;
    this.lstPayer=undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "criteria", value: this.searchValue, option: "" }
    ];


    this.searchService.searchPayer(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstPayer = data;
        this.isLoading=false;
      },
      error => {
        this.onSearchError(error);
        this.isLoading=false;
      }
    );
   
  }

  onSearchError(error){
    this.logMessage.log("SearchPatientError:"+error);
  }

  onPayerSelection(value, payer) {
    this.lstPayer[this.generalOperation.getElementIndex(this.lstPayer, payer)].chk = value;
  }
  onAddMultiplePayer(){
    let lstSelectedPayer = new Array<any>();
    for(let i=0;i<this.lstPayer.length;i++)
    {
      if(this.lstPayer[i].chk==true)
      {
        lstSelectedPayer.push(this.lstPayer[i]);
      }
    }
    if(lstSelectedPayer.length>0)
      this.onPayerSelect.emit(lstSelectedPayer);
  }

  selectedIndex: number = 0;
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
      //if (scrollToView) {
      //  var elmnt = document.getElementById("tr_" + rowIdx);
        //elmnt.scrollIntoView();
      //}
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


  rowClick(rowIdx: number) {
    this.focusIndex(rowIdx, false);
  }

}
