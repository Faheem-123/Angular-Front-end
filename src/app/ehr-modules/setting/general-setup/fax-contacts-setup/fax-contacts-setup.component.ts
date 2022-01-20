import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { FaxService } from 'src/app/services/fax.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { OperationType, AlertTypeEnum, PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AddEditFaxContactComponent } from './add-edit-fax-contact/add-edit-fax-contact.component';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SortFilterPaginationService, PagingOptions, SortFilterPaginationResult, NgbdSortableHeader, SortEvent, FilterOptions } from 'src/app/services/sort-filter-pagination.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'fax-contacts-setup',
  templateUrl: './fax-contacts-setup.component.html',
  styleUrls: ['./fax-contacts-setup.component.css']
})
export class FaxContactsSetupComponent implements OnInit {

  isLoading: boolean = false;

  lstContactList: Array<any>;

  
  //lstContactListFromDB: Array<any>;

  total: number;
  page: number=1;
  pageSize: number=20;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private faxService: FaxService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal,
    private sortFilterPaginationService: SortFilterPaginationService) { }

  ngOnInit() {
    this.getFaxContactList();
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;  
  sortEvent: SortEvent;
  //searchTerm: string;
  pagingOptions:PagingOptions;
  filterOptions:FilterOptions;
  
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  } 
  pageOptionChaged() {
    this.pagingOptions=new PagingOptions(this.page,this.pageSize)
    this.search();
  } 
  pageChange(event){    
    this.page=event;
    this.pagingOptions=new PagingOptions(this.page,this.pageSize)
    this.search();
  }
  onFilter(searchTerm:string,searchFeild:string) {
    
    // Clear all Other Filter Feilds
    let row = document.getElementById("filterRow");
    let inputs:any= row.getElementsByTagName("input");
    for (let input of inputs) {
      if(input.name!=searchFeild){
        input.value="";
      }      
    }

    this.filterOptions=new FilterOptions(searchTerm,searchFeild);    
    this.search();
  }
  private search() {   
    let sortFilterPaginationResult :SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lookupList.lstFaxContactList,this.headers,this.sortEvent,this.filterOptions,this.pagingOptions,'');
    this.lstContactList=sortFilterPaginationResult.list;
    this.total=sortFilterPaginationResult.total;
  }
  getNGHighlightTerm(feild:string){

    if(this.filterOptions!=undefined){

      if(feild==this.filterOptions.searchFeild){
        return this.filterOptions.searchTerm;
      }
      else{
        return undefined;
      }
    }
  }

  getFaxContactList() {

    this.faxService.getFaxContactList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lstContactList = data as Array<any>;
        //this.lstContactListFromDB = data as Array<any>;
        this.lookupList.lstFaxContactList= data as Array<any>;

        this.pagingOptions=new PagingOptions(this.page,this.pageSize)
        this.search();
        this.isLoading = false;
        //this.sortFilterPaginationService.lst=this.lstContactList;

      },
      error => {
        this.isLoading = false;
        this.getFaxContactListError(error);
      }
    );
  }
  getFaxContactListError(error: any) {
    this.logMessage.log("getFaxContactList Error." + error);
  }

 

  onAddEditFaxContact(contactId: number, operation: string) {

    const modalRef = this.ngbModal.open(AddEditFaxContactComponent, this.popUpOptions);
    modalRef.componentInstance.contactId = contactId;
    modalRef.componentInstance.operationType = operation;


    modalRef.result.then((result) => {
      if (result) {

        this.getFaxContactList();

      }
    }, (reason) => {

    });


  }

  onDelete(contactId: number) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;


    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = contactId.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.faxService.deleteFaxContact(deleteRecordData)
          .subscribe(
            data => this.deleteFaxContactSuccess(data),
            error => this.deleteFaxContactError(error)
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  deleteFaxContactSuccess(data: any) {

    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      let contactId: number = Number(data.result);
      
      /*
      for (let i: number = this.lstContactList.length - 1; i >= 0; i--) {
        debugger;
        if (this.lstContactList[i].contact_id == contactId) {
          this.lstContactList.splice(i, 1);
          break;
        }
      }
      */
      for (let i: number = this.lookupList.lstFaxContactList.length - 1; i >= 0; i--) {
        debugger;
        if (this.lookupList.lstFaxContactList[i].contact_id == contactId) {
          this.lookupList.lstFaxContactList.splice(i, 1);
          break;
        }
      }

      this.search();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Fax Contacts', data.response, AlertTypeEnum.DANGER)
    }
  }

  deleteFaxContactError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Fax Contacts', "An Error Occured while deleting Fax Contact.", AlertTypeEnum.DANGER)

  }


}
