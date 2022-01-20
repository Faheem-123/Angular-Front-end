import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ReferralService } from 'src/app/services/patient/referral.service';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ORMPatientReferral } from 'src/app/models/patient/orm-patient-referral';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { SearchService } from 'src/app/services/search.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum, ServiceResponseStatusEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ReferralStaffNotesComponent } from '../../patient/patient-referral-main/referral-staff-notes/referral-staff-notes.component';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { ImportIcdComponent } from '../lab/import-icd/import-icd.component';
import { ProviderAuthenticationPopupComponent } from 'src/app/general-modules/provider-authentication-popup/provider-authentication-popup.component';


@Component({
  selector: 'referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css']
})
export class ReferralComponent implements OnInit {
  @Input() moduleName:string;
  @Input() objencounterToOpen: EncounterToOpen;
  @Output() dataUpdated = new EventEmitter<any>();
  addEditView: boolean = false;
  lstReferralRequest;
  isLoading = false;
  noRecordFound: boolean = false;
  canView: boolean = false;
  canAddEdit:boolean= false;
  // canDelete: boolean = false;

  lstConsultType;
  public isSearchReferral = false;
  public showDiagnosisSearch = false;
  lstReferralSearch;
  lstchartDiagnosis;
  inputForm: FormGroup;
  referral_to_id = '';
  private obj_patient_referral: ORMPatientReferral;
  operation = '';
  objReferralDetail;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private referralService: ReferralService, private formBuilder: FormBuilder,
    private logMessage: LogMessage, private genoperation: GeneralOperation,
    private dateTimeUtil: DateTimeUtil, private searchService: SearchService, private modalService: NgbModal) {
    
    this.canView = this.lookupList.UserRights.ViewReferral;
    this.canAddEdit = this.lookupList.UserRights.AddModifyReferral;
  }

  ngOnInit() {
    if(this.objencounterToOpen.signed && !this.lookupList.UserRights.CanModifySignChart)
      this.canAddEdit = false;
      
    this.buildForm();
    if(this.canView)
    {
      this.onGetReferral();
      this.onGetConsultType();
    }
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      drpProvider: this.formBuilder.control("", Validators.required),
      drpLocation: this.formBuilder.control("", Validators.required),
      drpConsultType: this.formBuilder.control("", Validators.required),
      chkImportance: this.formBuilder.control(false),
      txtreferralAddress: this.formBuilder.control(""),
      txtreferralPhone: this.formBuilder.control(""),
      txtreferralfax: this.formBuilder.control(""),
      txtcomments: this.formBuilder.control(""),
      txtReferralSearch: this.formBuilder.control("")
    })
  }
  onGetReferral() {
    this.lstReferralRequest = undefined;
    this.isLoading = true;
    this.referralService.getChartReferralsView(this.objencounterToOpen.patient_id).subscribe(
      data => {

        this.isLoading = false;
        this.lstReferralRequest = data;
        if (this.lstReferralRequest == undefined || this.lstReferralRequest.length == 0) {
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "0"));
          this.noRecordFound = true;
        }
        else {
          this.dataUpdated.emit(new ORMKeyValue(this.moduleName, "1"));
          this.noRecordFound = false;
        }

        //if (this.noRecordFound==true) 
        //{
        // this.dataUpdated.emit(new ORMKeyValue("Referral", "0"));
        //}
        //else
        //{
        // this.dataUpdated.emit(new ORMKeyValue("Referral", "1"));
        //}
        // if(this.lstReferralRequest.length>0)
        //   this.OnSelectionChanged(this.lstReferralRequest[0]);
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  getReferralDetail(id) {
    debugger;
    this.isLoading = true;
    this.objReferralDetail = undefined;
    this.referralService.getChartReferralsDetail(id)
      .subscribe(
        data => {
          this.objReferralDetail = data;
          this.assignValues();
          this.isLoading = false;;
        },
        error => {
          this.logMessage.log("An Error Occured while getting chart referral detail.")
          this.isLoading = false;
        }
      );
  }
  assignValues() {
    debugger;
    (this.inputForm.get("drpConsultType") as FormControl).setValue(this.objReferralDetail.consult_type_id);
    (this.inputForm.get("chkImportance") as FormControl).setValue(this.objReferralDetail.high_importance);
    (this.inputForm.get("txtcomments") as FormControl).setValue(this.objReferralDetail.referral_reason);
    (this.inputForm.get("txtReferralSearch") as FormControl).setValue(this.objReferralDetail.referral_provider_name);
    this.referral_to_id = this.objReferralDetail.referral_provider_id;
    (this.inputForm.get("txtreferralAddress") as FormControl).setValue(this.objReferralDetail.referral_provider_address);
    (this.inputForm.get("txtreferralPhone") as FormControl).setValue(this.objReferralDetail.referral_provider_phone);
    (this.inputForm.get("txtreferralfax") as FormControl).setValue(this.objReferralDetail.referral_provider_fax);
    (this.inputForm.get("drpProvider") as FormControl).setValue(this.objReferralDetail.provider_id);
    (this.inputForm.get("drpLocation") as FormControl).setValue(this.objReferralDetail.location_id);

    if(this.objReferralDetail.signed_by!='' && this.objReferralDetail.signed_by!=null)
    {
      this.inputForm.get('drpLocation').disable();
      this.inputForm.get('drpProvider').disable();
    }
    else{
      this.inputForm.get('drpLocation').enable();
      this.inputForm.get('drpProvider').enable();
    }
  }
  OnAddNew() {
    this.addEditView = true;
    this.operation = 'New';

    this.referral_to_id = '';
    (this.inputForm.get("drpConsultType") as FormControl).setValue("");
    (this.inputForm.get("chkImportance") as FormControl).setValue('');
    (this.inputForm.get("txtcomments") as FormControl).setValue('');
    (this.inputForm.get("txtReferralSearch") as FormControl).setValue('');
    (this.inputForm.get("txtreferralAddress") as FormControl).setValue('');
    (this.inputForm.get("txtreferralPhone") as FormControl).setValue('');
    (this.inputForm.get("txtreferralfax") as FormControl).setValue('');
    (this.inputForm.get("drpProvider") as FormControl).setValue(this.objencounterToOpen.provider_id);
    (this.inputForm.get("drpLocation") as FormControl).setValue(this.objencounterToOpen.location_id);
  }
  Oncancel() {
    this.addEditView = false;
    this.operation = '';
    this.referral_to_id = '';
  }
  onGetConsultType() {
    this.lstConsultType = undefined;
    this.isLoading = true;
    this.referralService.getConsultType(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.isLoading = false;
        this.lstConsultType = data;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  OnConsultChange() {
    debugger;
    this.isSearchReferral = false;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "criteria", value: this.inputForm.get("drpConsultType").value, option: "Consult_criteria" }];

    this.referralService.getReferralSearch(searchCriteria).subscribe(
      data => {

        this.isLoading = false;
        this.lstReferralSearch = data;
        if (this.lstReferralSearch.length > 0) {
          this.isSearchReferral = true;
        }
        else
          this.isSearchReferral = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  onReferralSearchKeydown(value) {
    if (value.length > 2) {
      this.lstReferralSearch = null;
      this.isSearchReferral = true;
    }
    else {
      this.isSearchReferral = false;
    }
  }
  closeRefPhysicianSearch() {
    if ((this.inputForm.get("txtReferralSearch") as FormControl).value == "" || (this.inputForm.get("txtReferralSearch") as FormControl).value == undefined) {
      this.referral_to_id = '';
    }
    this.isSearchReferral = false;
  }

  addRefPhysician(refPhy: any) {
    debugger;
    this.isSearchReferral = false;
    (this.inputForm.get('txtReferralSearch') as FormControl).setValue(refPhy.last_name + ', ' + refPhy.first_name);
    (this.inputForm.get('txtreferralAddress') as FormControl).setValue(refPhy.address);
    (this.inputForm.get('txtreferralPhone') as FormControl).setValue(refPhy.phone);
    (this.inputForm.get('txtreferralfax') as FormControl).setValue(refPhy.fax);
    this.isSearchReferral = false;
    this.referral_to_id = refPhy.referral_id;
  }
  OnSave() {
    debugger;

    this.obj_patient_referral = new ORMPatientReferral();

    this.obj_patient_referral.patient_id = Number(this.objencounterToOpen.patient_id);
    this.obj_patient_referral.location_id = (this.inputForm.get('drpLocation') as FormControl).value;
    this.obj_patient_referral.provider_id = (this.inputForm.get('drpProvider') as FormControl).value;
    this.obj_patient_referral.consult_type_id = (this.inputForm.get('drpConsultType')).value;
    this.obj_patient_referral.referral_reason = (this.inputForm.get('txtcomments')).value;
    this.obj_patient_referral.high_importance = (this.inputForm.get('chkImportance')).value
    if (this.referral_to_id != "")
      this.obj_patient_referral.referral_provider_id = Number(this.referral_to_id);

    this.obj_patient_referral.referral_provider_name = (this.inputForm.get('txtReferralSearch')).value;
    this.obj_patient_referral.referral_provider_address = (this.inputForm.get('txtreferralAddress')).value;
    //this.obj_patient_referral.referral_provider_fax=(this.inputForm.get('txtreferralfax')).value;
    this.obj_patient_referral.referral_provider_fax = this.genoperation.ReplaceAll(this.genoperation.ReplaceAll(this.genoperation.ReplaceAll(this.genoperation.ReplaceAll((this.inputForm.get('txtreferralfax')).value, " ", ""), "(", ""), ")", ""), "-", "");
    //this.genoperation.ReplaceAll((this.inputForm.get('txtreferralPhone')).value;
    this.obj_patient_referral.referral_provider_phone = this.genoperation.ReplaceAll(this.genoperation.ReplaceAll(this.genoperation.ReplaceAll(this.genoperation.ReplaceAll(this.inputForm.get('txtreferralPhone').value, " ", ""), "(", ""), ")", ""), "-", "");
    this.obj_patient_referral.referral_status = "Pending";
    this.obj_patient_referral.client_date_modified = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
    this.obj_patient_referral.modified_user = this.lookupList.logedInUser.user_name;
    this.obj_patient_referral.practice_id = this.lookupList.practiceInfo.practiceId;
    this.obj_patient_referral.referral_request = true;
    this.obj_patient_referral.deleted = false;

    if(this.signed_by!=null && this.signed_by!="")
    {
      this.obj_patient_referral.signed_by=this.signed_by;
      this.obj_patient_referral.date_signed=this.dateTimeUtil.getCurrentDateTimeString();
    }
    else if(this.operation != "New" && this.objReferralDetail.signed_by!=null && this.objReferralDetail.signed_by!="")
    {
      this.obj_patient_referral.signed_by=this.objReferralDetail.signed_by;
      this.obj_patient_referral.date_signed=this.objReferralDetail.date_signed;
    }

    if (this.operation == "New") {
      this.obj_patient_referral.client_date_created = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
      this.obj_patient_referral.created_user = this.lookupList.logedInUser.user_name;
      this.obj_patient_referral.chart_id = Number(this.objencounterToOpen.chart_id);
      this.obj_patient_referral.referral_id = undefined;
    }
    else {
      this.obj_patient_referral.referral_id = this.objReferralDetail.referral_id;
      this.obj_patient_referral.client_date_created = this.objReferralDetail.client_date_created;
      this.obj_patient_referral.created_user = this.objReferralDetail.created_user;
      this.obj_patient_referral.date_created = this.objReferralDetail.date_created;
      this.obj_patient_referral.chart_id = this.objReferralDetail.chart_id;
    }

    this.referralService.savePatientReferralRequest(this.obj_patient_referral)
      .subscribe(
        data => this.savedSuccessfull(data),
        error => alert(error),
        () => this.logMessage.log("Save Patient Referral Request.")
      );
  }
  savedSuccessfull(data) {
    this.addEditView = false;
    this.onGetReferral();
    this.operation = '';
  }
  onEdit(obj) {
    this.operation = 'Edit'
    this.addEditView = true;
    this.getReferralDetail(obj.referral_id);

  }
  onImportDx() {
    debugger;
    this.searchService.getChartDiagnosis(this.objencounterToOpen.patient_id.toString(), this.objencounterToOpen.chart_id.toString()).subscribe(
      data => {

        this.isLoading = false;
        this.lstchartDiagnosis = data;
        if (this.lstchartDiagnosis.length > 0) {
          this.showDiagnosisSearch = true;
        }
        else
          this.showDiagnosisSearch = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  closeDiagSearch() {
    this.showDiagnosisSearch = false;
  }
  onDiagnosisSelect(diag: any) {
    debugger;
    var strDiag = 'Active Diagnosis: \n';
    for (let i = 0; i < diag.length; i++) {
      strDiag += diag[i].diag_code + '\t' + diag[i].diag_description + '\n';
    }
    (this.inputForm.get("txtcomments") as FormControl).setValue(strDiag);
    this.showDiagnosisSearch = false;
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  onDelete(rf) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = "danger";
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = rf.referral_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.referralService.deletePatientReferralRequest(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Referral Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {

      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Encounter Referral"
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
      this.onGetReferral();

    }
  }
  onStaffNotes(ref) {

    const modalRef = this.modalService.open(ReferralStaffNotesComponent, this.poupUpOptions);
    modalRef.componentInstance.patient_id = this.objencounterToOpen.patient_id;
    modalRef.componentInstance.status = ref.referral_status;
    modalRef.componentInstance.notes = ref.notes;
    modalRef.componentInstance.referral_id = ref.referral_id;
    modalRef.result.then((result) => {
      debugger;
      if (result === PromptResponseEnum.SUCCESS) {
        this.onGetReferral();
      }
    }
      , (reason) => {
        //alert(reason);
      });
  }

  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  showReferralLog(){
    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("chart_id", this.objencounterToOpen.chart_id));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "referral_log";
    logParameters.logDisplayName = "Referral Log";
    logParameters.logMainTitle = "Referral Log";
    logParameters.patientId = this.objencounterToOpen.patient_id;
    logParameters.PID = this.objencounterToOpen.openPatientInfo.pid;
    logParameters.patientName = this.objencounterToOpen.patient_name;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.ENCOUNTER;
    
    logParameters.lstOtherCriteria = lstOtherCriteria

    const modalRef = this.modalService.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;
  }

  onImport()
  {
    const modalRef = this.modalService.open(ImportIcdComponent, this.poupUpOptions);
      modalRef.componentInstance.patient_id = this.objencounterToOpen.patient_id;
      modalRef.componentInstance.chart_id= this.objencounterToOpen.chart_id;
      let closeResult;

      modalRef.result.then((result) => {
        debugger;
        if (result.length>0) {
          let strICDs='';
          for (let i=0; i<result.length; i++) 
          {
            strICDs+=result[i].diag_code+"\t"+ result[i].diag_description+"\n";
          }
          if(strICDs!="")
          {
            strICDs="Active Diagnosis:\n"+strICDs;
						
						(this.inputForm.get("txtcomments") as FormControl).setValue(strICDs);
          }
          }
      }, (reason) => {
        //alert(reason);
      });
  }
  validate(){
    if((this.inputForm.get('drpConsultType') as FormControl).value=="" || (this.inputForm.get('drpConsultType') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please select Consult Type.",'warning')
      return false;
    }
    if((this.inputForm.get('drpProvider') as FormControl).value=="" || (this.inputForm.get('drpProvider') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please select Provider.",'warning')
      return false;
    }
    if((this.inputForm.get('drpLocation') as FormControl).value=="" || (this.inputForm.get('drpLocation') as FormControl).value==null)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Validation","Please select Location.",'warning')
      return false;
    }
    return true;
   }
   signed_by='';
  OnSignAndSave(){
    debugger;
    if(this.validate()==false)
      return ;
      if (this.lookupList.logedInUser.loginProviderId != 0 && this.lookupList.logedInUser.loginProviderId != null
        && this.lookupList.logedInUser.loginProviderId==(this.inputForm.get('drpProvider') as FormControl).value) 
      {
        this.signed_by= this.lookupList.logedInUser.loginProviderName;
        this.OnSave();
        return;
      }
      
    const modalRef = this.modalService.open(ProviderAuthenticationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.provider_id=(this.inputForm.get('drpProvider') as FormControl).value;
    modalRef.componentInstance.headerTitle = "Confirm Referral Request Sign";
    modalRef.result.then((result) => {
      if (result!=null) {
        debugger;
        this.signed_by=result['user_name'];
        this.OnSave();
      }
    }, (reason) => {
      //alert(reason);
    });
  }
}
