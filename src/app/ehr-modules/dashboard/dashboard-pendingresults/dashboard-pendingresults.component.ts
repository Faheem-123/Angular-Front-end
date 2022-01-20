import { Component, OnInit, Inject, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { OpenModuleService } from '../../../services/general/openModule.service';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { LogMessage } from '../../../shared/log-message';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { Rptlabresults_Print } from 'src/app/models/lab/Rptlabresults_Print';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { GeneralService } from 'src/app/services/general/general.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';


@Component({
  selector: 'dashboard-pendingresults',
  templateUrl: './dashboard-pendingresults.component.html',
  styleUrls: ['./dashboard-pendingresults.component.css'],

})
export class DashboardPendingresultsComponent implements OnInit, AfterViewInit {
  @Output() openModule = new EventEmitter<any>();
  @Output() widgetUpdate = new EventEmitter<any>();
  listDashboardPendingResult;
  pendingresultcount;
  showAssignto = false;
  showHideSearch = true;
  isLoading: boolean = false;
  constructor(private dashboardService: DashboardService, private generalOperation: GeneralOperation,
    private logMessage: LogMessage, @Inject(Rptlabresults_Print) private objRptLabResultPrint: Rptlabresults_Print,
    private openModuleService: OpenModuleService, private generalService: GeneralService, private modalService: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder) {

  }
  filterForm: FormGroup;
  assignForm: FormGroup;
  onFilter(criteria) {
    this.showHideSearch = true;
    let selectedProvider: String = "";
    let selectedLocation: String = "";
    if (criteria.ctrlproviderSearch != 'all') {
      selectedProvider = criteria.ctrlproviderSearch;
    } else {
      selectedProvider = '-1';
    }
    if (criteria.ctrllocationSearch != 'all') {
      selectedLocation = criteria.ctrllocationSearch;
    } else {
      selectedLocation = '-1';
    }
    criteria.rdobtn
    //this.getPendingLabResults('50010112','','ALL','50010114');
    this.getPendingLabResults(selectedProvider, selectedLocation, criteria.rdobtn, this.lookupList.logedInUser.loginProviderId);
  }
  reloadModule() {
    debugger;
    this.getPendingLabResults(this.filterForm.get('ctrlproviderSearch').value, (this.filterForm.get('ctrllocationSearch').value == 'all' ? "-1" : this.filterForm.get('ctrllocationSearch').value), 'ALL', this.lookupList.logedInUser.loginProviderId);
  }
  ngAfterViewInit() {

    debugger;
    this.getPendingLabResults(this.filterForm.get('ctrlproviderSearch').value, this.filterForm.get('ctrllocationSearch').value, 'ALL', this.lookupList.logedInUser.loginProviderId);
  }
  ngOnInit() {
    debugger;
    this.buildForm();
    this.getPendingLabResults(this.filterForm.get('ctrlproviderSearch').value, this.filterForm.get('ctrllocationSearch').value, 'ALL', this.lookupList.logedInUser.loginProviderId);
  }
  openPatientSummary(patient) {

    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }
  buildForm() {
    this.filterForm = this.formBuilder.group({
      ctrlproviderSearch: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider.toString() == '' ? 'all' : this.lookupList.logedInUser.defaultProvider, Validators.required),
      ctrllocationSearch: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation.toString() == '' ? 'all' : this.lookupList.logedInUser.defaultLocation, Validators.required),
      rdobtn: this.formBuilder.control('All')
    })

    this.assignForm = this.formBuilder.group({
      drpAssignedTo: this.formBuilder.control("", Validators.required),
    })

  }
  //get pending lab results
  getPendingLabResults(ProviderID, locationID, type, LoginUserID) {
    debugger;
    this.isLoading = true;
    //locationID =  "0";
    this.listDashboardPendingResult = null;
    this.pendingresultcount = 0
    this.dashboardService.getLabPendingResults(ProviderID, locationID, type, LoginUserID)
      .subscribe(
        data => {
          if (data != null && data != undefined) {
            this.listDashboardPendingResult = data
            this.pendingresultcount = this.listDashboardPendingResult.length;
            this.isLoading = false;
          }
          else {
            this.isLoading = false;
          }
        },
        error => {
          this.isLoading = false;
          this.logMessage.log("getLabPendingResults Successfull" + error);
        }
      );

  }
  openResult(value) {
    this.openModule.emit({ to_open: value.result_name, patient_id: value.patient_id, order_id: value.order_id, result_id: value.result_id, patient_name: value.patient_name });
    //console.log(value);
  }
  ViewResult(value) {
    if (value.result_name == 'Result')
      this.printLabResult(value);
    else
      this.openDocument(value);
  }
  printLabResult(value) {
    this.objRptLabResultPrint.order_id = value.order_id;
    this.objRptLabResultPrint.getLabResultRpt();
  }
  openDocument(value) {
    debugger;
    let downloadPath;
    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      let lstDocPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
      if (lstDocPath.length > 0)
        downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientDocuments";
      else
        downloadPath = '';

      let searchCriteria: SearchCriteria = new SearchCriteria;
      searchCriteria.criteria = downloadPath + "/" + value.link;
      this.generalService.downloadFile(searchCriteria)
        .subscribe(
          data => {
            debugger;
            this.downloafileResponse(data, value);
          },
          error => alert(error)
        );
    }
  }
  downloafileResponse(data, obj) {
    // if (data.byteLength <= 0)
    //   return;
    let doc_link = obj.link;
    debugger;
    let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
    let file_type: string = '';
    switch (file_ext.toLowerCase()) {
      case 'png':
        file_type = 'IMAGE/PNG';
        break;
      case 'jpg':
        file_type = 'IMAGE/JPEG';
        break;
      case 'pdf':
        file_type = 'application/pdf';
        break;
      case 'txt':
        file_type = 'text/plain';
        break;
    }
    var file = new Blob([data], { type: file_type });//, {type: 'application/pdf'}
    var fileURL = URL.createObjectURL(file);
    let path = fileURL;
    const modalRef = this.modalService.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = path;
    modalRef.componentInstance.callingModule = 'order';
    modalRef.componentInstance.module_id = obj.order_id;

  }


  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };
  onRefresh(criteria) {
    this.widgetUpdate.emit('result');
    this.onFilter(criteria);
  }
  onAssignto() {
    this.showAssignto = true
  }
  onAssignSave(order_id) {

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "assigned_to", value: this.assignForm.get('drpAssignedTo').value, option: "" },
      { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "order_id", value: order_id, option: "" }
    ];
    this.dashboardService.updateOrderAssignedTo(searchCriteria).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {

        }
        else if (data['status'] === ServiceResponseStatusEnum.ERROR) {

        }
      },
      error => alert(error),
      () => this.logMessage.log("updateOrderAssignedTo Successfull.")
    );

  }
  showHidetoggle() {
    this.showHideSearch = false;
  }
}
