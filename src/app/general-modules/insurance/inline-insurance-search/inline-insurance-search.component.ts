import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChildren } from '@angular/core';
import { LogMessage } from '../../../shared/log-message';
import { SearchService } from '../../../services/search.service';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { PromptResponseEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from '../../confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'inline-insurance-search',
  templateUrl: './inline-insurance-search.component.html',
  styleUrls: ['./inline-insurance-search.component.css']
})
export class InlineInsuranceSearchComponent implements OnInit {

  @Input() searchValue: string
  @Input() recordId: number;
  @Output() onSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();

  @ViewChildren('buttons') buttons;

  selectedIndex: number = 0;
  isLoading: boolean = true;

  lstInsurance: Array<any>;

  constructor(private logMessage: LogMessage,
    private searchService: SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal
  ) { }

  ngOnInit() {
    this.searchInsurance();
  }

  searchInsurance() {

    debugger;
    this.isLoading = true;
    this.lstInsurance = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "search_value", value: this.searchValue, option: "" }
    ];


    this.searchService.searchInsurance(searchCriteria).subscribe(
      data => {
        this.lstInsurance = data as Array<any>;
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
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
};
onInsuranceSelect(obj,record_id){

  if( (obj.payer_number==null || obj.payer_number=='')  && this.lookupList.logedInUser.userType.toLocaleLowerCase() == "billing")
  {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Selection!';
    modalRef.componentInstance.promptMessage = "Selected Insurance Shouldn't Go To Electronic Claim Submission Due To Missing Payer Number.<br>"+
                                                "Do you want to select this insurance ?";
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {
        debugger;
        if (result == PromptResponseEnum.YES) {
          this.onSelect.emit({insurance:obj,record_id:record_id})
        }
      });

    return;
  }
  else
    this.onSelect.emit({insurance:obj,record_id:record_id})
}
}
