import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LogMessage } from '../../../shared/log-message';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { PatientService } from '../../../services/patient/patient.service';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { ListFilterPipe } from '../../../shared/list-filter-pipe';
import { UniquePipe } from '../../../shared/unique-pipe';
import { GeneralService } from '../../../services/general/general.service';
import { GeneralOperation } from '../../../shared/generalOperation';
import { DocumentViewerComponent } from '../../../general-modules/document-viewer/document-viewer.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomValidators, datetimeValidator } from 'src/app/shared/custome-validators';

import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { LabService } from 'src/app/services/lab/lab.service';
import { OpenedPatientInfo } from 'src/app/models/common/patientInfo';
import { DateModel } from 'src/app/models/general/date-model';
import { AlertTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
@Component({
  selector: 'patient-lab-order-pending',
  templateUrl: './patient-lab-order-pending.component.html',
  styleUrls: ['./patient-lab-order-pending.component.css']
})
export class PatientLabOrderPendingComponent implements OnInit {
  @Input() patientId;
  @Input() openPatientInfo: OpenedPatientInfo;
  @Input() callingFrom;
  pat_name: string = '';
  lstPendingResults;
  lstPendingAttachment;
  frmSearch: FormGroup;
  filterForm: FormGroup;
  lstLabCatehory;
  isAttachment: boolean = false;
  lstPatient;
  lstTest;
  lstResults;
  downloadPath;
  isLoading: boolean = false;
  public showPatientSearch = false;
  constructor(private formBuilder: FormBuilder, private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private labService: LabService,
    private dateutil: DateTimeUtil, private openModuleService: OpenModuleService
    , private generalService: GeneralService, private generalOperation: GeneralOperation
    , private modalService: NgbModal) {

  }

  ngOnInit() {
    if (this.patientId != '' && this.patientId != null) {
      //console.log(this.patientId);
      this.pat_name = this.openPatientInfo.last_name + ', ' + this.openPatientInfo.first_name;
    }
    else {

      this.pat_name = '';
    }
    this.buildForm();
    this.getLabCategoy();
    let lstDocPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
    if (lstDocPath.length > 0)
      this.downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientDocuments";
    else
      this.downloadPath = '';


    debugger;
    // if(this.callingFrom=='patient')
    {
      // this.showCross=false;
      if (this.patientId != '' && this.patientId != null)
        this.onFilter(this.frmSearch.value);
    }
  }
  showCross = true;
  getLabCategoy() {
    this.labService.getLabCategoy(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.lstLabCatehory = data;
      },
      error => {
        this.logMessage.log("getLabCategoy." + error);
      }
    );
  }
  buildForm() {
    debugger;
    let dt: Date = new Date;
    let dateModel: DateModel;


    if (this.patientId != '' && this.patientId != null) {
      dateModel = new DateModel(dt.getFullYear() - 1, dt.getMonth() + 1, dt.getDate());
    }
    else {
      dateModel = this.dateutil.getCurrentDateModel();
    }

    this.frmSearch = this.formBuilder.group({
      txtDateFrom: this.formBuilder.control(dateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtDateTo: this.formBuilder.control(this.dateutil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      drptestcategory: this.formBuilder.control("0", Validators.required),
      drpProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider.toString() == '' ? 'all' : (this.patientId != '' && this.patientId != null) == true ? 'all' : this.lookupList.logedInUser.defaultProvider, Validators.required),
      drpLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation.toString() == '' ? 'all' : (this.patientId != '' && this.patientId != null) == true ? 'all' : this.lookupList.logedInUser.defaultLocation, Validators.required),
      chkAttachmnet: this.formBuilder.control(false)

    })
    /*,
    {
      validator: Validators.compose([
        CustomValidators.validDate('txtDateFrom', false),
        CustomValidators.validDate('txtDateTo', true)
      ])
    }*/
    this.filterForm = this.formBuilder.group({
      cntrlpatientSearch: this.formBuilder.control(this.pat_name, Validators.required),
    })
    if (this.pat_name != '') {
      let patienttxt = this.filterForm.get('cntrlpatientSearch');
      patienttxt.disable();
    }
  }
  onPatientSearchClear() {
    if (this.pat_name == '') {
      (this.filterForm.get("cntrlpatientSearch") as FormControl).setValue("");
      this.patientId = '';
    }
  }

  onKeydown(event) {
    if (event.key === "Enter") {

      this.showPatientSearch = true;
      // this.dynamicAdd();
    }
  }
  openSelectPatient(patient) {
    debugger;
    this.patientId = patient.patient_id;
    this.filterForm = this.formBuilder.group({
      cntrlpatientSearch: this.formBuilder.control(patient.name, Validators.required),
    })
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
  }
  onFilter(criteria) {
    debugger;

    if (criteria.txtDateTo == null) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Pending Result', "Please Enter To Date", AlertTypeEnum.WARNING);
      return;
    }
    if (criteria.txtDateFrom == null) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Pending Result', "Please Enter From Date", AlertTypeEnum.WARNING);
      return;
    }
    this.isLoading = true;
    if (criteria.chkAttachmnet == false) {
      this.isAttachment = false;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.criteria = '';
      searchCriteria.option = '';
      searchCriteria.param_list = [];

      if (this.patientId > '0' && this.filterForm.get('cntrlpatientSearch').value != '')
        searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });

      if (criteria.drpLocation != "all")
        searchCriteria.param_list.push({ name: "location_id", value: criteria.drpLocation, option: "" });
      if (criteria.drpProvider != "all")
        searchCriteria.param_list.push({ name: "provider_id", value: criteria.drpProvider, option: "" });

      if (criteria.drptestcategory != "" && criteria.drptestcategory != "0")
        searchCriteria.param_list.push({ name: "lab_category_id", value: criteria.drptestcategory, option: "" });

      if (criteria.txtDateTo != "" && criteria.txtDateTo != "null")
        searchCriteria.param_list.push({ name: "result_to_date", value: this.dateutil.getStringDateFromDateModel(criteria.txtDateTo), option: "" });

      if (criteria.txtDateFrom != "" && criteria.txtDateFrom != "null")
        searchCriteria.param_list.push({ name: "result_from_date", value: this.dateutil.getStringDateFromDateModel(criteria.txtDateFrom), option: "" });

      this.labService.getPendingResults(searchCriteria).subscribe(
        data => {
          debugger;
          this.lstPendingResults = data;
          this.isLoading = false;
          // this.lstPatient=new UniquePipe().transform(data,"patient_id");
          // this.lstTest=new UniquePipe().transform(data,"test_id");

        },
        error => {
          //this.getPatientLettersError(error);
        }
      );
    }
    else {//atatchemnet
      this.isAttachment = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.criteria = '';
      searchCriteria.option = '';
      searchCriteria.param_list = [];

      if (this.patientId > '0' && this.filterForm.get('cntrlpatientSearch').value != '')
        searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });

      if (criteria.drpLocation != "all")
        searchCriteria.param_list.push({ name: "location_id", value: criteria.drpLocation, option: "" });
      if (criteria.drpProvider != "all")
        searchCriteria.param_list.push({ name: "provider_id", value: criteria.drpProvider, option: "" });

      if (criteria.drptestcategory != "" && criteria.drptestcategory != "0")
        searchCriteria.param_list.push({ name: "lab_category_id", value: criteria.drptestcategory, option: "" });

      if (criteria.txtDateTo != "" && criteria.txtDateTo != "null")
        searchCriteria.param_list.push({ name: "result_to_date", value: this.dateutil.getStringDateFromDateModel(criteria.txtDateTo), option: "" });

      if (criteria.txtDateFrom != "" && criteria.txtDateFrom != "null")
        searchCriteria.param_list.push({ name: "result_from_date", value: this.dateutil.getStringDateFromDateModel(criteria.txtDateFrom), option: "" });

      this.labService.getPendingAttachments(searchCriteria).subscribe(
        data => {
          debugger;
          this.isLoading = false;
          this.lstPendingAttachment = data;
        },
        error => {
        }
      );
    }
  }
  openDocument(row) {
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = this.downloadPath + "/" + row.link;
    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          this.downloafileResponse(data, row.link);
        },
        error => alert(error)
      );
  }
  downloafileResponse(data, doc_link) {
    if (data.byteLength <= 0)
      return;
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
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

  onSign(order) {
    debugger;

    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Sign !';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to Sign the selected Order ?';
    modalRef.componentInstance.alertType = 'info';
    let closeResult;

    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
          { name: "order_id", value: order.order_id, option: "" }
        ];
        this.labService.signLabOrder(searchCriteria).subscribe(
          data => {
            const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
            modalRef.componentInstance.promptHeading = 'Confirm Sign !';
            modalRef.componentInstance.promptMessage = "Patient Order Sign Successfully";
            modalRef.componentInstance.alertType = 'info';

            this.onFilter(this.frmSearch.value);
          },
          error => {
            this.logMessage.log("signLabOrder " + error);
          }
        );
      }
    }, (reason) => {
      //alert(reason);
    });

  }
  onOpenPatient(res) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = res.patient_id;
    obj.patient_name = res.patient_name;
    this.openModuleService.openPatient.emit(obj);

  }
  loadmodule = false;
  module_name = '';
  order_id = ''
  openResult(value, obj) {
    this.module_name = value;
    this.patientId = obj.patient_id;
    this.order_id = obj.order_id;

    this.loadmodule = true;
  }
  navigateBackToSSummary() {
    this.loadmodule = false;
  }
}
