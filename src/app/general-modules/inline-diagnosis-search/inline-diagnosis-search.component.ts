import { Component, Input, Output, EventEmitter, Inject, OnChanges, ViewChildren } from '@angular/core';
import { LogMessage } from '../../shared/log-message';
import { SearchService } from '../../services/search.service';
import { SearchCriteria } from '../../models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from '../../providers/lookupList.module';
import { DiagSearchCriteria } from './diag-search-criteria';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { FORMERR } from 'dns';

@Component({
  selector: 'inline-diagnosis-search',
  templateUrl: './inline-diagnosis-search.component.html',
  styleUrls: ['./inline-diagnosis-search.component.css']
})
export class InlineDiagnosisSearchComponent implements OnChanges {
  @Input() diagSearchCriteria: DiagSearchCriteria;
  @Input() lstChartDiagnosis: any;
  @Input() title: string = "Diagnosis Search";
  @Output() onDiagSelect = new EventEmitter<any>();
  @Output() onDiagMultiSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();


  isLoading: boolean = true;

  lstDiagnosis: Array<any>;
  selectedIndex: number = 0;

  @ViewChildren('buttons') buttons;

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

    this.searchDiag();
    
  }

  searchDiag() {
    debugger;
    this.isLoading = true;
    this.lstDiagnosis = undefined;
    if (this.lstChartDiagnosis != null) {
      this.lstDiagnosis = this.lstChartDiagnosis;
      this.isLoading = false;
      return;
    }
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "criteria", value: this.diagSearchCriteria.criteria.toString(), option: "" },
      { name: "code_type", value: this.diagSearchCriteria.codeType.toString(), option: "" },
      { name: "provider_id", value: this.diagSearchCriteria.providerId == undefined ? "" : this.diagSearchCriteria.providerId.toString(), option: "" },
      { name: "dos", value: this.diagSearchCriteria.dos == undefined ? "" : this.diagSearchCriteria.dos == "" ? "" : this.diagSearchCriteria.dos.toString(), option: "" },
      //{ name: "dos", value: this.diagSearchCriteria.dos.toString(), option: "" }
    ];


    this.searchService.searchDiagnosis(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.lstDiagnosis = data as Array<any>;
          this.isLoading = false;
        },
        error => {
          this.logMessage.log("An Error Occured while getting searchDiagnosis.")
          this.isLoading = false;
        }
      );
  }

  onSearchDiagError(error) {
    this.logMessage.log("SearchDiagError:" + error);
  }

  onAdd() {
    debugger;
    let lstSelecteddiag: Array<any> = new Array<any>();
    for (let i = 0; i < this.lstDiagnosis.length; i++) {
      if (this.lstDiagnosis[i].checked != undefined && this.lstDiagnosis[i].checked == 'true') {
        lstSelecteddiag.push(this.lstDiagnosis[i]);
      }
    }
    this.onDiagMultiSelect.emit(lstSelecteddiag);
  }
  ondiagCheckBox(i, event) {
    if (event.currentTarget.checked == true) {
      this.lstDiagnosis[i].checked = 'true';
    }
    else {
      this.lstDiagnosis[i].checked = 'false';
    }
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
     // var elmnt = document.getElementById("tr_"+rowIdx);
     // elmnt.scrollIntoView();
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


  diagRowClick(rowIdx: number) {
    this.focusIndex(rowIdx,false);
  }
}
