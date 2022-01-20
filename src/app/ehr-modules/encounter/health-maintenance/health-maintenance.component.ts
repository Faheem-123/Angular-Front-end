import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NewHealthMaintPopupComponent } from './new-health-maint-popup/new-health-maint-popup.component';
import { NgbModal, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
@Component({
  selector: 'health-maintenance',
  templateUrl: './health-maintenance.component.html',
  styleUrls: ['./health-maintenance.component.css']
})
export class HealthMaintenanceComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen:EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  isLoading: boolean = false;
  noRecordFound: boolean = false;
  lstMaintList;
  lstMaintListDetail;
  objSelectedListRow;
  rowId;
  editOperation='';
  selectedTab = "h-common";
  lstOtherTest;
  lstCommonTest;
  lstVaccination;
  lstCustomTest;
  lstLipid;
  lstDrugs;

  isOtherTestNotFound=false;
  isCommonTestNotFound=false;
  isVaccinationNotFound=false;
  isCustomTestNotFound=false;
  isLipidTestNotFound=false;
  isDrugsTestNotFound=false;
  inputForm:FormGroup;
  canView=false;
  canAddEdit=false;

  constructor(private encounterService: EncounterService
    , private logMessage: LogMessage,private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil, @Inject(LOOKUP_LIST) public lookupList: LookupList
    ,private modalService: NgbModal) {

      this.canView = this.lookupList.UserRights.ViewHealthMaint;
      this.canAddEdit = this.lookupList.UserRights.AddModifyHealthMaint;
     }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
    this.buildForm();
    if(this.canView)
      this.getViewData();
  }
  buildForm(){
    this.inputForm = this.formBuilder.group({
      txtVisitDate: this.formBuilder.control("", Validators.required),
      drpProvider: this.formBuilder.control("", Validators.required),
      drpLocation: this.formBuilder.control("", Validators.required),
    })
  }
 
  assignData(){
    (this.inputForm.get("txtVisitDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.objSelectedListRow.visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.inputForm.get("drpProvider") as FormControl).setValue(this.objSelectedListRow.provider_id);
    (this.inputForm.get("drpLocation") as FormControl).setValue(this.objSelectedListRow.location_id);
  }
  clearInputForm()
  {
    (this.inputForm.get("txtVisitDate") as FormControl).setValue("");
    (this.inputForm.get("drpProvider") as FormControl).setValue("");
    (this.inputForm.get("drpLocation") as FormControl).setValue("");
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  selectedHealthId;
  onAddnew(){
    //this.addEditView=true;
    this.editOperation='New';
    //this.objSelectedListRow=null;
    //this.clearInputForm();
    debugger;
    const modalRef = this.modalService.open(NewHealthMaintPopupComponent, { size: 'sm', windowClass: 'modal-adaptive' });
    modalRef.componentInstance.patient_id = this.objencounterToOpen.patient_id;
    modalRef.componentInstance.chart_id = this.objencounterToOpen.chart_id
    modalRef.componentInstance.default_Provider = this.objencounterToOpen.provider_id;
    modalRef.componentInstance.default_Location = this.objencounterToOpen.location_id;
    modalRef.componentInstance.visit_Date = this.objencounterToOpen.visit_date;
    
    let closeResult;

    modalRef.result.then((result) => 
    {
      debugger;
      if (result>0) {
        this.selectedHealthId=result;
        this.getViewData() ;
      }
    }, (reason) => {
    });
  }
  onEdit(){
    if(!this.objSelectedListRow){
      alert("Please select any record first.")
      return;
    }
    this.addEditView=true;
    this.editOperation='Edit';
    this.assignData();
  }
  onCancel(){
    this.addEditView=false;
    this.editOperation='';
  }
    getViewData() {
      this.isLoading = true;
      this.noRecordFound = false;
      this.encounterService.getChartHealthMainList(this.objencounterToOpen.patient_id.toString())
        .subscribe(
          data => {
            this.lstMaintList = data;
            if (this.lstMaintList == undefined || this.lstMaintList.length == 0) 
            {
              this.noRecordFound = true;
            }
            else
            {
              if(this.editOperation=='New')
              {
                for(let i=0;i<this.lstMaintList.length;i++)
                {
                  if(this.selectedHealthId==this.lstMaintList[i].phm_id)
                  {
                    this.OnSelectionChanged(this.lstMaintList[i]);
                    this.addEditView=true;
                  }
                }
              }
              else
              {
                this.OnSelectionChanged(this.lstMaintList[0]);
              }
            }
            this.isLoading = false;
  
            if (this.noRecordFound==true) 
            {
              this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
            }
            else
            {
              this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
            }
          },
          error => {
            this.logMessage.log("An Error Occured while getting Health Maint list.")
            this.isLoading = false;
          }
        );
  }
  OnSelectionChanged(obj){
    debugger;
    this.objSelectedListRow=obj;
    this.rowId = obj.phm_id;
    this.isLoading = true;
    this.assignData();
    this.encounterService.getChartHealthMainDetail_View(this.objencounterToOpen.patient_id.toString(),obj.phm_id)
      .subscribe(
        data => {
          this.lstMaintListDetail = data;
          this.ProcessMainView();
          this.isLoading = false;
        },
        error => {
          this.logMessage.log("An Error Occured while getting Health Maint Detail.")
          this.isLoading = false;
        }
      );
  }
  ProcessMainView()
  {
    debugger;
    this.isLipidTestNotFound=false;
    this.isCommonTestNotFound=false;
    this.isCustomTestNotFound=false;
    this.isOtherTestNotFound=false;
    this.isVaccinationNotFound=false;
    this.isDrugsTestNotFound=false;
    this.lstLipid= new ListFilterPipe().transform(this.lstMaintListDetail, "test_category", 'LIPIDS');
    if(this.lstLipid.length==0)
    {
      this.isLipidTestNotFound=true;
    }
    this.lstCommonTest= new ListFilterPipe().transform(this.lstMaintListDetail, "test_category", 'COMMON TEST');
    if(this.lstCommonTest.length==0)
    {
      this.isCommonTestNotFound=true;
    }
    this.lstCustomTest= new ListFilterPipe().transform(this.lstMaintListDetail, "test_category", 'CUSTOM TEST');
    if(this.lstCustomTest.length==0)
    {
      this.isCustomTestNotFound=true;
    }
    this.lstOtherTest= new ListFilterPipe().transform(this.lstMaintListDetail, "test_category", 'OTHER TESTS');
    if(this.lstOtherTest.length==0)
    {
      this.isOtherTestNotFound=true;
    }
    this.lstVaccination= new ListFilterPipe().transform(this.lstMaintListDetail, "test_category", 'VACCINATION');
    if(this.lstVaccination.length==0)
    {
      this.isVaccinationNotFound=true;
    }
    this.lstDrugs= new ListFilterPipe().transform(this.lstMaintListDetail, "test_category", 'Drugs');
    if(this.lstDrugs.length==0)
    {
      this.isDrugsTestNotFound=true;
    }
    
  }
  navigateBackToSummary(){
    debugger;
    this.editOperation='';
    this.addEditView=false;
    this.getViewData();
  }
  onDelete(){
    if(this.lstMaintList.length < 1 && !this.objSelectedListRow){
      alert("Please select any record first.")
      return;
    }
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType='danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.objSelectedListRow.phm_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.encounterService.deleteHealthMaint(deleteRecordData)
          .subscribe(            
          data => this.onDeleteSuccessfully(data),
          error => alert(error),
          () => this.logMessage.log("Health Maintenance Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter Health Maintenance"
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
  onTabChange(event: NgbTabChangeEvent) {
    switch (event.nextId) {
      case 'h-home':

        this.navigateBackToSummary()
        break;
      default:
        break;
    }
  }
  }
