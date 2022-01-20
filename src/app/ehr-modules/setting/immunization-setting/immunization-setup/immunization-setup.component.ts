import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { ImmunizationService } from 'src/app/services/immunization.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { ORMPracticeImmunizationSave } from 'src/app/models/setting/Immunization/orm-practice-immunization-save';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { SortEvent, NgbdSortableHeader, FilterOptions, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';

@Component({
  selector: 'immunization-setup',
  templateUrl: './immunization-setup.component.html',
  styleUrls: ['./immunization-setup.component.css']
})
export class ImmunizationSetupComponent implements OnInit {


  selectedPracticeImmId: number;
  selectedCVXCode: string = "";
  loadingCount: number = 0;

  lstAllImmList: Array<any>;
  lstAllImmListFromDB: Array<any>;
  lstPracticemmList: Array<any>;
  lstPracticemmListFromDB: Array<any>;

  lstImmNDC: Array<any>;
  lstImmVIS: Array<any>;
  lstImmManfacturer: Array<any>;
  lstImmTradeName: Array<any>;
  lstImmProcedures: Array<any>;

  isLoading: boolean = false;

  constructor(private immunizationService: ImmunizationService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private ngbModal: NgbModal,
    private sortFilterPaginationService: SortFilterPaginationService) { }

  ngOnInit() {
    this.loadingCount = 2;
    this.getSetupImmAllList();
    this.getSetupImmPracticeList();
  }


  getSetupImmAllList() {
    this.immunizationService.getSetupImmAllList(this.lookupList.practiceInfo.practiceId)
      .subscribe(
        data => {
          this.loadingCount--;
          //this.lstAllImmList = data as Array<any>;
          this.lstAllImmListFromDB = data as Array<any>;
          this.searchAll();
        },
        error => {
          this.logMessage.log("An Error Occured while getting getSetupImmAllList list.")

        }
      );
  }
  getSetupImmPracticeList() {
    this.immunizationService.getSetupImmPracticeList(this.lookupList.practiceInfo.practiceId)
      .subscribe(
        data => {
          this.loadingCount--;
          //this.lstPracticemmList = data as Array<any>;
          this.lstPracticemmListFromDB = data as Array<any>;
          this.searchPractice(0);
        },
        error => {
          this.logMessage.log("An Error Occured while getting getSetupImmPracticeList list.")

        }
      );
  }

  getImmNDC() {
    this.immunizationService.getImmNDC(this.selectedCVXCode)
      .subscribe(
        data => {
          this.loadingCount--;
          this.lstImmNDC = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getAllImmunizationNDC list.")

        }
      );
  }


  getImmVIS() {
    this.immunizationService.getImmVIS(this.selectedCVXCode)
      .subscribe(
        data => {
          this.loadingCount--;
          this.lstImmVIS = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getAllImmunizationProcedures list.")

        }
      );
  }
  getImmManufacturer() {
    this.immunizationService.getImmManufacturer(this.selectedCVXCode)
      .subscribe(
        data => {
          this.loadingCount--;
          this.lstImmManfacturer = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getAllImmunizationProcedures list.")

        }
      );
  }

  getImmTradeName() {
    this.immunizationService.getImmTradeName(this.selectedCVXCode)
      .subscribe(
        data => {
          this.loadingCount--;
          this.lstImmTradeName = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getAllImmunizationProcedures list.")

        }
      );
  }

  getImmProcedure() {
    this.immunizationService.getImmProcedure(this.selectedCVXCode)
      .subscribe(
        data => {
          this.loadingCount--;
          this.lstImmProcedures = data as Array<any>;
        },
        error => {
          this.logMessage.log("An Error Occured while getting getAllImmunizationProcedures list.")

        }
      );
  }

  selectionChanged(id: number, cvxCode: string) {
    this.selectedPracticeImmId = id;
    this.selectedCVXCode = cvxCode;

    this.lstImmNDC = undefined;
    this.lstImmVIS = undefined;
    this.lstImmManfacturer = undefined;
    this.lstImmTradeName = undefined;
    this.lstImmProcedures = undefined;
    if (this.selectedCVXCode != undefined && this.selectedCVXCode != "") {
      this.getImmNDC();
      this.getImmVIS();
      this.getImmManufacturer();
      this.getImmTradeName();
      this.getImmProcedure();
    }

  }

  addPracticeImmunization(imm: any) {

    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    let ormPracticeImmunizationSave: ORMPracticeImmunizationSave = new ORMPracticeImmunizationSave();
    ormPracticeImmunizationSave.cvx_code = imm.cvx_code;
    ormPracticeImmunizationSave.immunization_name = imm.immunization_name;

    ormPracticeImmunizationSave.status = imm.status;

    ormPracticeImmunizationSave.client_date_created = clientDateTime;
    ormPracticeImmunizationSave.client_date_modified = clientDateTime;

    ormPracticeImmunizationSave.created_user = this.lookupList.logedInUser.user_name;
    ormPracticeImmunizationSave.modified_user = this.lookupList.logedInUser.user_name;

    ormPracticeImmunizationSave.practice_id = this.lookupList.practiceInfo.practiceId;
    ormPracticeImmunizationSave.system_ip = this.lookupList.logedInUser.systemIp;

    this.immunizationService.savePracticeImmmunization(ormPracticeImmunizationSave).subscribe(
      data => {
        this.savePracticeImmmunizationSuccess(data);
      },
      error => {
        this.savePracticeImmmunizationError(error);
      }
    );


  }

  savePracticeImmmunizationSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      let cvxCodeAdded: string = data.result;

      /* for(let i:number=this.lstAllImmList.length-1;i>=0;i--){      
         debugger;
         if(this.lstAllImmList[i].cvx_code==cvxCodeAdded){
           this.lstAllImmList.splice(i,1);          
           break;          
         }
       }
       */
      for (let i: number = this.lstAllImmListFromDB.length - 1; i >= 0; i--) {
        debugger;
        if (this.lstAllImmListFromDB[i].cvx_code == cvxCodeAdded) {
          this.lstAllImmListFromDB.splice(i, 1);
          break;
        }
      }
      this.searchAll();


      this.loadingCount = 1;
      this.getSetupImmPracticeList();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Practice Immunization', data.response, AlertTypeEnum.DANGER)

    }
  }

  savePracticeImmmunizationError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Practice Immunization', "An Error Occured while Practice Immunization.", AlertTypeEnum.DANGER)

  }


  deletePracticeImmunization(imm: any) {

    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
    let ormDeleteRecord: ORMDeleteRecord = new ORMDeleteRecord();
    ormDeleteRecord.client_date_time = clientDateTime;
    ormDeleteRecord.client_ip = this.lookupList.logedInUser.systemIp;
    ormDeleteRecord.modified_user = this.lookupList.logedInUser.user_name;
    ormDeleteRecord.column_id = imm.practice_immunization_id;

    this.immunizationService.deletePracticeImmmunization(ormDeleteRecord).subscribe(
      data => {
        this.deletePracticeImmmunizationSuccess(data);
      },
      error => {
        this.deletePracticeImmmunizationError(error);
      }
    );


  }

  deletePracticeImmmunizationSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      let pracImmId: number = Number(data.result);

      let nextPracImmId: number;
      let nextCVXCode: string;

      let indextToSelect: number = 0;

      for (let i: number = this.lstPracticemmList.length - 1; i >= 0; i--) {
        debugger;
        if (this.lstPracticemmList[i].practice_immunization_id == pracImmId) {
          //this.lstPracticemmList.splice(i,1);         
          indextToSelect = i;

          //if( ( i==0 && this.lstPracticemmList.length>0 ) || (i>0)){
          //            nextPracImmId=this.lstPracticemmList[i].practice_immunization_id;
          //          nextCVXCode=this.lstPracticemmList[i].cvx_code;
          //      }         

          break;
        }
      }

      for (let i: number = this.lstPracticemmListFromDB.length - 1; i >= 0; i--) {
        debugger;
        if (this.lstPracticemmListFromDB[i].practice_immunization_id == pracImmId) {
          this.lstPracticemmListFromDB.splice(i, 1);
          break;
        }
      }

      this.searchPractice(indextToSelect);
      //this.selectionChanged(nextPracImmId, nextCVXCode);

      this.loadingCount = 1;
      this.getSetupImmAllList();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Practice Immunization', data.response, AlertTypeEnum.DANGER)

    }
  }

  deletePracticeImmmunizationError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Practice Immunization', "An Error Occured while Practice Immunization.", AlertTypeEnum.DANGER)

  }


  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEventAll: SortEvent;
  filterOptionsAll: FilterOptions;
  onSortAll(sortEvent: SortEvent) {
    this.sortEventAll = sortEvent;
    this.searchAll();
  }
  onFilterAll(searchTerm: string, searchFeild: string) {

    // Clear all Other Filter Feilds
    let row = document.getElementById("filterRowAll");
    let inputs: any = row.getElementsByTagName("input");
    for (let input of inputs) {
      if (input.name != searchFeild) {
        input.value = "";
      }
    }

    this.filterOptionsAll = new FilterOptions(searchTerm, searchFeild);
    this.searchAll();
  }
  private searchAll() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstAllImmListFromDB, this.headers, this.sortEventAll, this.filterOptionsAll, null,'immunization_all');
    this.lstAllImmList = sortFilterPaginationResult.list;
  }
  getNGHighlightTermAll(feild: string) {

    if (this.filterOptionsAll != undefined) {

      if (feild == this.filterOptionsAll.searchFeild) {
        return this.filterOptionsAll.searchTerm;
      }
      else {
        return undefined;
      }
    }
  }

  sortEventPractice: SortEvent;
  filterOptionsPractice: FilterOptions;
  onSortPractice(sortEvent: SortEvent) {
    this.sortEventPractice = sortEvent;
    this.searchPractice(0);
  }
  onFilterPractice(searchTerm: string, searchFeild: string) {

    // Clear all Other Filter Feilds
    let row = document.getElementById("filterRowPractice");
    let inputs: any = row.getElementsByTagName("input");
    for (let input of inputs) {
      if (input.name != searchFeild) {
        input.value = "";
      }
    }

    this.filterOptionsPractice = new FilterOptions(searchTerm, searchFeild);
    this.searchPractice(0);
  }
  private searchPractice(indexToSlect: number) {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstPracticemmListFromDB, this.headers, this.sortEventPractice, this.filterOptionsPractice, null,'immunization_practice');
    this.lstPracticemmList = sortFilterPaginationResult.list;

    let nextPracImmId: number;
    let nextCVXCode: string;

    if (this.lstPracticemmList != undefined && this.lstPracticemmList.length > 0) {
      if (indexToSlect < this.lstPracticemmList.length) {
        nextPracImmId = this.lstPracticemmList[indexToSlect].practice_immunization_id;
        nextCVXCode = this.lstPracticemmList[indexToSlect].cvx_code;
      }
    }

    this.selectionChanged(nextPracImmId, nextCVXCode);

  }
  getNGHighlightTermPractice(feild: string) {

    if (this.filterOptionsPractice != undefined) {

      if (feild == this.filterOptionsPractice.searchFeild) {
        return this.filterOptionsPractice.searchTerm;
      }
      else {
        return undefined;
      }
    }
  }

}
