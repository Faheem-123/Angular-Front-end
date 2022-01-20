import { Component, OnInit, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralService } from 'src/app/services/general/general.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ORMClosingSummary } from 'src/app/models/encounter/ORM-Closing-Summary';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum } from 'src/app/shared/enum-util';
import { datetimeValidator } from 'src/app/shared/custome-validators';

@Component({
  selector: 'chart-closing-summary',
  templateUrl: './chart-closing-summary.component.html',
  styleUrls: ['./chart-closing-summary.component.css']
})
export class ChartClosingSummaryComponent implements OnInit {
  patientID: string = '';
  chartID: string = '';
  session_id = "";
  isEditable:Boolean = true;
  closingSessionInfoForm: FormGroup;
  selectedOption="";
  lstClosingSummary: Array<any>;
  showHideSave = true;
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private logMessage: LogMessage,
  public activeModal: NgbActiveModal,
  private modalService: NgbModal,
  private formBuilder: FormBuilder,
  private dateTimeUtil: DateTimeUtil,
  private generalService: GeneralService,
  private encounterService: EncounterService) { }

  ngOnInit() {
    debugger;
    this.buildForm();
    if (this.lookupList.providerList == undefined || this.lookupList.providerList.length == 0) {
      this.getProviderList();
    }
    if(this.session_id!="")
      this.getClosingSummary();

      if(this.lookupList.UserRights.AddModifySessionInfo == false){
        this.closingSessionInfoForm.disable();
        this.showHideSave = false;
      }
  }
  buildForm() {
    this.closingSessionInfoForm = this.formBuilder.group({
      cmbProvider: this.formBuilder.control(""),
      //date: this.formBuilder.control(""),
      date: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([        
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      cmbClosingReason: this.formBuilder.control(""),
      txtspecifyReson: this.formBuilder.control(""),
      txtoutcome: this.formBuilder.control("")
    })
  }
  getProviderList(){
    this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.providerList =  data as Array<any>;
      },
      error => {
        this.getProviderListError(error);
      }
    );
  }
  getProviderListError(error){
    this.logMessage.log("getProviderList Error." + error);
  }
  getClosingSummary(){
    this.encounterService.getClosingSummary(this.chartID, this.patientID, this.session_id).subscribe(
      data => {
        this.lstClosingSummary =  data as Array<any>;
        this.assignValues();
      },
      error => {
        this.getClosingSummaryError(error);
      }
    );
  }
  getClosingSummaryError(error){
    this.logMessage.log("getClosingSummary Error." + error);
  }
  assignValues(){
    (this.closingSessionInfoForm.get('cmbProvider') as FormControl).setValue(this.lstClosingSummary[0].provider_id);
    (this.closingSessionInfoForm.get('date') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.lstClosingSummary[0].closing_date,DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    (this.closingSessionInfoForm.get('cmbClosingReason') as FormControl).setValue(this.lstClosingSummary[0].closing_reason);
    (this.closingSessionInfoForm.get('txtspecifyReson') as FormControl).setValue(this.lstClosingSummary[0].otherreason);
    (this.closingSessionInfoForm.get('txtoutcome') as FormControl).setValue(this.lstClosingSummary[0].outcomes);
  }
  enableSpecifyReason(event){
    this.selectedOption=event.currentTarget.value;
    if(this.selectedOption.toLowerCase()=="other(specify)"){
      this.isEditable = false;
    }else{
      this.isEditable = true;
      (this.closingSessionInfoForm.get('txtspecifyReson') as FormControl).setValue("");
    }
  }
  saveClosingSummery(value){
    debugger;
    if(this.validate()){
      let ormSave: ORMClosingSummary = new ORMClosingSummary();
				
      ormSave.patient_id = this.patientID;
      ormSave.chart_id = this.chartID;
      ormSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      ormSave.provider_id = (this.closingSessionInfoForm.get('cmbProvider') as FormControl).value;
          
      
      let closeDate = this.dateTimeUtil.getStringDateFromDateModel((this.closingSessionInfoForm.get('date') as FormControl).value);

      ormSave.closing_date = closeDate;
      ormSave.closing_reason = (this.closingSessionInfoForm.get('cmbClosingReason') as FormControl).value;
      ormSave.outcomes = (this.closingSessionInfoForm.get('txtoutcome') as FormControl).value;
      ormSave.otherreason = (this.closingSessionInfoForm.get('txtspecifyReson') as FormControl).value;
      ormSave.deleted = false
      ormSave.date_modified = this.dateTimeUtil.getCurrentDateTimeString();
				
				if(this.session_id != "0"){
					ormSave.closing_id = this.lstClosingSummary[0].closing_id;
					ormSave.date_created = this.lstClosingSummary[0].date_created;
					ormSave.created_user = this.lstClosingSummary[0].created_user;
					ormSave.client_date_created = this.lstClosingSummary[0].client_date_created;
					ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
					ormSave.modified_user = this.lookupList.logedInUser.user_name;
				}else{
					ormSave.created_user = this.lookupList.logedInUser.user_name;
					ormSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
					ormSave.modified_user = this.lookupList.logedInUser.user_name;
					ormSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        }
        this.encounterService.saveClosingSummary(ormSave)
        .subscribe(
          data => {
            this.activeModal.close();
          },
          error => {
            this.showError("An error occured while saving Chart session information.");
          }
        );
    }
  }
  showError(errMsg) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Error";
    modalRef.componentInstance.promptMessage = errMsg;
    modalRef.componentInstance.alertType = "error";
    let closeResult;
    modalRef.result.then((result) => {
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
      });
    return;
  }
  validate(): Boolean {
    if((this.closingSessionInfoForm.get('cmbProvider') as FormControl).value == '' || (this.closingSessionInfoForm.get('cmbProvider') as FormControl).value == undefined){
      alert("Please select Provider first.");
      return false;
    }
    if((this.closingSessionInfoForm.get('cmbClosingReason') as FormControl).value == '' || (this.closingSessionInfoForm.get('cmbClosingReason') as FormControl).value == undefined){
      alert("Please select Closing Reason.");
      return false;
    }
    if(this.selectedOption.toLowerCase()=="other(specify)" && (this.closingSessionInfoForm.get('txtspecifyReson') as FormControl).value == ""){
      alert("Please Enter Other Specify Reason.");
      return false;
    }
    return true;
  }
}
