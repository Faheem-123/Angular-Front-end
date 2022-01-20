import { Component, OnInit, Inject, ViewChildren, QueryList } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ImmunizationService } from 'src/app/services/immunization.service';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { AddEditInventoryComponent } from './add-edit-inventory/add-edit-inventory.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OperationType, AlertTypeEnum, PromptResponseEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { NgbdSortableHeader, SortEvent, FilterOptions, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';

@Component({
  selector: 'immunization-inventory-setup',
  templateUrl: './immunization-inventory-setup.component.html',
  styleUrls: ['./immunization-inventory-setup.component.css']
})
export class ImmunizationInventorySetupComponent implements OnInit {

  loadingCount: number = 0;
  isLoading: boolean = false;

  selectedVaccineId: number;
  lstVaccine: Array<any>;
  lstVaccineFromDB: Array<any>;
  lstVaccineInventory: Array<any>;
  lstVaccineInventoryUsage: Array<any>;

  selectedClinicId: string = "";
  selectedCVXCode: string = "";
  selectedTrdeName: string = "";

  selectedClinicInfo: any;
  showInventoryUsage: boolean = false;

  selectedInventoryInfo: any;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private immService: ImmunizationService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private openModuleService:OpenModuleService,
    private sortFilterPaginationService:SortFilterPaginationService) { }

  ngOnInit() {

    if (this.lookupList.lstImmRegClinics == undefined || this.lookupList.lstImmRegClinics.length == 0) {
      this.loadingCount++;
      this.getImmRegistryClinics();
    }
    else if (this.lookupList.lstImmRegClinics.length == 1) {
      this.selectedClinicInfo = this.lookupList.lstImmRegClinics[0];
      this.selectedClinicId = this.lookupList.lstImmRegClinics[0].clinic_id;
      this.getInventoryVaccineList();
    }
  }

  getImmRegistryClinics() {
    this.immService.getRegistryClinics(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lookupList.lstImmRegClinics = data as Array<any>;

        if (this.lookupList.lstImmRegClinics.length == 1) {
          this.selectedClinicInfo = this.lookupList.lstImmRegClinics[0];
          this.selectedClinicId = this.lookupList.lstImmRegClinics[0].clinic_id;
          this.getInventoryVaccineList();
        }

        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
        }
      },
      error => {

        this.isLoading = false;
        this.getImmRegistryClinicsError(error);
      }
    );
  }

  getImmRegistryClinicsError(error: any) {
    this.logMessage.log("getImmRegistryClinics Error." + error);
  }


  getInventoryVaccineList() {

    this.isLoading=true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "clinic_id", value: this.selectedClinicId, option: "" }
    ];

    this.immService.getInventoryVaccineList(searchCriteria).subscribe(
      data => {

        //this.lstVaccine = data as Array<any>;
        this.lstVaccineFromDB=data as Array<any>;
        this.search(0);

        //if (this.lstVaccine != undefined && this.lstVaccine.length > 0) {
        //  this.vaccineSelectionChanged(this.lstVaccine[0]);
       // }

        //this.loadingCount--;
        //if (this.loadingCount == 0) {
          this.isLoading = false;
        //}
      },
      error => {

        this.isLoading = false;
        this.getInventoryVaccineListError(error);
      }
    );
  }

  getInventoryVaccineListError(error: any) {
    this.logMessage.log(" Error." + error);
  }

  getInventoryVaccineDetails() {

    this.isLoading=true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "clinic_id", value: this.selectedClinicId, option: "" },
      { name: "cvx_code", value: this.selectedCVXCode, option: "" },
      { name: "trade_name", value: this.selectedTrdeName, option: "" }
    ];

    this.immService.getInventoryVaccineDetails(searchCriteria).subscribe(
      data => {

        this.lstVaccineInventory = data as Array<any>;



        //this.loadingCount--;
        //if (this.loadingCount == 0) {
          this.isLoading = false;
        //}
      },
      error => {
        this.isLoading = false;
        this.getInventoryVaccineDetailsError(error);
      }
    );
  }

  getInventoryVaccineDetailsError(error: any) {
    this.logMessage.log("getInventoryVaccineDetails Error." + error);
  }

  clinicChanged(clinicId: string) {

    debugger;
    this.selectedClinicInfo = undefined;
    this.selectedClinicId = undefined;
    this.selectedVaccineId = undefined;
    this.selectedCVXCode = undefined;
    this.selectedTrdeName = undefined;
    this.lstVaccine = undefined;
    this.lstVaccineInventory = undefined;


    if (clinicId != null && clinicId != undefined && clinicId != "" && clinicId != "Select Clinic") {
      this.selectedClinicId = clinicId;
      this.lookupList.lstImmRegClinics.forEach(clinic => {
        debugger;
        if (clinic.clinic_id == clinicId) {
          this.selectedClinicInfo = clinic;
        }
      });
      this.getInventoryVaccineList();

    }
  }

  vaccineSelectionChanged(vaccine: any) {

    this.selectedVaccineId = vaccine.s_no;
    this.selectedCVXCode = vaccine.cvx_code;
    this.selectedTrdeName = vaccine.trade_name;

    this.getInventoryVaccineDetails();
  }

  onAddEditInventory(inventoryInfo: any, operation: OperationType) {

    const modalRef = this.ngbModal.open(AddEditInventoryComponent, this.popUpOptions);
    modalRef.componentInstance.clinicInfo = this.selectedClinicInfo;
    modalRef.componentInstance.inventoryInfo = inventoryInfo;
    modalRef.componentInstance.operation = operation;


    modalRef.result.then((result) => {

      if (result) {
        this.clinicChanged(this.selectedClinicId);

      }
    }, (reason) => {

    });


  }

  onDelete(inventory: any) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;


    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = inventory.inventory_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.immService.deleteImmmunizationInventory(deleteRecordData)
          .subscribe(
            data => this.deleteImmmunizationInventorySuccess(data),
            error => this.deleteImmmunizationInventoryError(error)
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  deleteImmmunizationInventorySuccess(data: any) {

    if (data.status === ServiceResponseStatusEnum.SUCCESS) {

      let inventoryId: number = Number(data.result);
      for (let i: number = this.lstVaccineInventory.length - 1; i >= 0; i--) {
        debugger;
        if (this.lstVaccineInventory[i].inventory_id == inventoryId) {
          this.lstVaccineInventory.splice(i, 1);
          break;
        }
      }
      for (let i: number = this.lstVaccineFromDB.length - 1; i >= 0; i--) {
        debugger;
        if (this.lstVaccineFromDB[i].inventory_id == inventoryId) {
          this.lstVaccineFromDB.splice(i, 1);
          break;
        }
      }
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Inventory', data.response, AlertTypeEnum.DANGER)
    }
  }

  deleteImmmunizationInventoryError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Inventory', "An Error Occured while deleting Immunization Inventory.", AlertTypeEnum.DANGER)

  }

  getClinicDropDownDisplay(clinic: any) {
    return clinic.clinic_id.padEnd(20, '*') + clinic.clinic_name;
  }


  getImmunizationInventoryUsage(inventory: any) {

    debugger;
    this.isLoading=true;
    this.selectedInventoryInfo = inventory;
    this.lstVaccineInventoryUsage=undefined;
    this.showInventoryUsage = true;

    this.immService.getImmunizationInventoryUsage(inventory.inventory_id).subscribe(
      data => {


        this.lstVaccineInventoryUsage = data as Array<any>;

        this.isLoading=false;
        //this.isLoading = false;

      },
      error => {
        this.isLoading=false;
        // this.isLoading = false;
        this.getImmunizationInventoryUsageError(error);
      }
    );
  }

  getImmunizationInventoryUsageError(error: any) {
    this.logMessage.log("getImmunizationInventoryUsageError Error." + error);
  }

  navigateBackToInventory() {
    this.showInventoryUsage = false;

    this.selectedInventoryInfo=undefined;
    this.lstVaccineInventoryUsage=undefined;
  }

  openPatient(data:any){   
    let obj:PatientToOpen=new PatientToOpen();
    obj.patient_id=data.patient_id.toString();
    obj.patient_name=data.patient_name;
    this.openModuleService.openPatient.emit(obj);
  } 

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;  
  sortEvent: SortEvent;
  sortEventDetail: SortEvent;
  filterOptions:FilterOptions;  
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search(0);
  } 
  onSortDetail(sortEvent: SortEvent) {
    this.sortEventDetail = sortEvent;
    this.searchDetail();
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
    this.search(0);
  }
  private search(indexToSelect:number) {   
    let sortFilterPaginationResult :SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstVaccineFromDB,this.headers,this.sortEvent,this.filterOptions,null,'');
    this.lstVaccine=sortFilterPaginationResult.list;    

    if (this.lstVaccine != undefined && this.lstVaccine.length > 0) {
      if(indexToSelect<this.lstVaccine.length){
        this.vaccineSelectionChanged(this.lstVaccine[indexToSelect]);
      }
      else{
        this.vaccineSelectionChanged(this.lstVaccine[0]);
      }
    }    
  }
  private searchDetail() {   
    let sortFilterPaginationResult :SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstVaccineInventory,this.headers,this.sortEventDetail,null,null,'');
    this.lstVaccineInventory=sortFilterPaginationResult.list;    
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

}
