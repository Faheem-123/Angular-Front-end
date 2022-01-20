import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { LabService } from 'src/app/services/lab/lab.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbTabChangeEvent, NgbTabset, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'lab-summary',
  templateUrl: './lab-summary.component.html',
  styleUrls: ['./lab-summary.component.css']
})
export class LabSummaryComponent implements OnInit, AfterViewInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  @ViewChild('labMaintab') tab: NgbTabset;
  openedOrderId = "";
  addEditView: boolean = false;
  isNew: boolean = false;
  lstOrderSummaryView: Array<any>;
  lstOrderSummaryViewFiltered: Array<any>;
  isLoading: boolean = false;
  noRecordFound: boolean = false;
  canView: boolean = false;
  canAddEdit: boolean = false;
  canDelete: boolean = false;
  radioForm: FormGroup;
  dataOption = "all";
  name = 'World';
  constructor(private labService: LabService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage, private dateTimeUtil: DateTimeUtil, 
    private formBuilder: FormBuilder, private modalService: NgbModal,private generalOperation:GeneralOperation
    ) {

    this.canView = this.lookupList.UserRights.lab_order_view;
    this.canAddEdit = this.lookupList.UserRights.lab_order_add_modify;
    this.canDelete=this.lookupList.UserRights.lab_order_delete;
  }

  ngAfterViewInit() {
    // this.tab.select("lab-edit");
    
  }
  selectedTab = "lab-edit";
  ngOnInit() {
    if (this.canView) 
    {
      this.getViewData();
    }
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control('active'),
    }
    );
  }
  getViewData() {
    this.isLoading = true;
    this.noRecordFound = false;
    //this.backtoSummary();
    this.labService.getpatientOrderSummaryView(this.objencounterToOpen.patient_id.toString())
      .subscribe(
        data => {
          this.lstOrderSummaryView = data as Array<any>;
          if (this.lstOrderSummaryView == undefined || this.lstOrderSummaryView.length == 0) {

            this.noRecordFound = true;
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));

          }
          else {
            this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          }
          // for(let i=0;i<this.lstOrderSummaryView.length;i++)
          // {
          //   this.lstOrderSummaryView[i].cpt=this.generalOperation.ReplaceAll(this.lstOrderSummaryView[i].cpt,"~","<br>");
          // }
          this.onRadioOptionChange("all");
          this.isLoading = false;
        },

        error => {
          this.logMessage.log("An Error Occured while getting Lab Order Summary list.")
          this.isLoading = false;
        }
      );
  }
  addNew() {
    this.openedOrderId = "";
    this.isNew = true;
    this.addEditView = true;
    //this.tab.select("lab-edit");
  }
  backtoSummary() {
    debugger;
    this.getViewData();
    this.isNew=false;
    this.addEditView = false;
  }
  
  

  onRadioOptionChange(event) {
    this.dataOption = event;
    switch (this.dataOption) {
      case "all":
        this.lstOrderSummaryViewFiltered = this.lstOrderSummaryView;
        break;
      case "inside_facility":
        this.lstOrderSummaryViewFiltered = new ListFilterPipe().transform(this.lstOrderSummaryView, "facility_filter", "inside");
        break;
      case "outside_facility":
        this.lstOrderSummaryViewFiltered = new ListFilterPipe().transform(this.lstOrderSummaryView, "facility_filter", "outside");
        break;
    }

    if (this.lstOrderSummaryViewFiltered != undefined && this.lstOrderSummaryViewFiltered.length > 0) {
      this.noRecordFound = false;
    }
    else {
      this.noRecordFound = true
    }
  }

  onTabChange(event: NgbTabChangeEvent) {
    switch (event.nextId) {
      case 'lab-home':
        this.backtoSummary();
        break;
      default:
        break;
    }
  }
  onOpenOrder(obj) {
    this.openedOrderId = obj.order_id;
    this.isNew = false;
    this.addEditView = true;
  }
  onDelete(obj) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = obj.order_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.labService.deleteLabOrder(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Assessment Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "LabOrder"
      modalRef.componentInstance.promptMessage = data.response;

      let closeResult;

      modalRef.result.then((result) => {


        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      this.getViewData();

    }
  }
  onSaveOrderCallback(value){
    this.getViewData();
    this.isNew=false;
    this.openedOrderId=value;
    this.addEditView = false;
  }
  formatToolTip(value)
  {
    return this.generalOperation.ReplaceAll(value,"~","<br>")
  }

  getTooltipCptsAsList(ctps:any){
    let lst:Array<string>=[];
    if(ctps!=undefined && ctps!='' && ctps!=null){
      lst= ctps.split('~');
    }

    return lst;
  }
}
