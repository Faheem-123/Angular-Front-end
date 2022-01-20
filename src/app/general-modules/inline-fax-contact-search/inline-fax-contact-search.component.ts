import { Component, Output, EventEmitter, ViewChildren, Inject, Input, OnInit } from '@angular/core';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchService } from 'src/app/services/search.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'inline-fax-contact-search',
  templateUrl: './inline-fax-contact-search.component.html',
  styleUrls: ['./inline-fax-contact-search.component.css']
})
export class InlineFaxContactSearchComponent implements OnInit {

  @Input() lstFaxContacts: Array<any>;
  @Output() onSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();


  isLoading: boolean = true;


  selectedIndex: number = 0;

  @ViewChildren('buttons') buttons;

  constructor() { }


  ngOnInit() {

  }


  focusFirstIndex() {

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
      //var elmnt = document.getElementById("tr_" + rowIdx);
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


  onRowClick(rowIdx: number) {    
    this.focusIndex(rowIdx,false);
  }
}
