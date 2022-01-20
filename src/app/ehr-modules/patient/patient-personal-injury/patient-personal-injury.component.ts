import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ORMPatientInjury } from 'src/app/models/patient/ORMPatientInjury';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { PatientService } from 'src/app/services/patient/patient.service';
import { LogMessage } from 'src/app/shared/log-message';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'patient-personal-injury',
  templateUrl: './patient-personal-injury.component.html',
  styleUrls: ['./patient-personal-injury.component.css']
})
export class PatientPersonalInjuryComponent implements OnInit {
  @Input() patientId;
  public dashboardAddEdit = false;
  isEditRecord:Boolean = false;
  showInsuranceSearch: Boolean = false;
  showFirmSearch: Boolean = false;
  isEdit:Boolean = false;
  selectedRow;
  patPersonalInjury: FormGroup;
  listInjuryResult: Array<any>;
  private obj_PatientInjury: ORMPatientInjury;
  isSelectedRowID;
  constructor(private formBuilder: FormBuilder,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    private patientService: PatientService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  insuranceId:number;
  insuranceName:string;

  attorneyId:number;
  firmName:string;
  attorneyName:string;
  firmAddress:string; 
  phoneNo:string; 
  faxNo:string;

  ngOnInit() {
    this.buildForm();
    this.getPatientInjury(this.patientId);
  }
  buildForm() {
    this.patPersonalInjury = this.formBuilder.group({
      txtfirmname: this.formBuilder.control(null),
      txtattorneyname: this.formBuilder.control(null),
      txtfirmaddress: this.formBuilder.control(null),
      txtphone: this.formBuilder.control(null),
      txtfaxno: this.formBuilder.control(null),
      txtInsuranceName: this.formBuilder.control(null),
      txtstartdate: this.formBuilder.control(null),
      txtenddate: this.formBuilder.control(null),
      txtadjustername: this.formBuilder.control(null),
      txtadjusterphone: this.formBuilder.control(null),
      txtadjusterfax: this.formBuilder.control(null),
      txtclaimno: this.formBuilder.control(null),
      txtaccountdate: this.formBuilder.control(null)
    });
  }
  addNewInjury(){
    this.dashboardAddEdit = true;
    this.isEditRecord = false;
  }
  cancelPersonalInjury(){
    this.dashboardAddEdit = false;
    this.isEditRecord = false;

    (this.patPersonalInjury.get('txtfirmname') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtattorneyname') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtfirmaddress') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtphone') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtfaxno') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtInsuranceName') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtadjustername') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtadjusterphone') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtadjusterfax') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtclaimno') as FormControl).setValue("");
    (this.patPersonalInjury.get("txtstartdate") as FormControl).setValue("");
    (this.patPersonalInjury.get('txtenddate') as FormControl).setValue("");
    (this.patPersonalInjury.get('txtaccountdate') as FormControl).setValue("");
  }

  onFirmSearchKeydown(event){
    if (event.key === "Enter") {
      this.showFirmSearch = true;
    }
    else {
      this.showFirmSearch = false;
    }
  }
  addFirm(obj) {
    debugger;
    //let recordId = obj.attorney_id;
    //let firmObject = obj.insurance;
    this.attorneyId = obj.attorney_id;
    this.attorneyName = obj.name;
    this.firmAddress = obj.address;
    this.phoneNo = obj.phone;
    this.faxNo = obj.fax;
    (this.patPersonalInjury.get("txtfirmname") as FormControl).setValue(obj.firm_name);
    (this.patPersonalInjury.get("txtattorneyname") as FormControl).setValue(obj.name);
    (this.patPersonalInjury.get("txtfirmaddress") as FormControl).setValue(obj.address);
    (this.patPersonalInjury.get("txtphone") as FormControl).setValue(obj.phone);
    (this.patPersonalInjury.get("txtfaxno") as FormControl).setValue(obj.fax);
    this.showFirmSearch = false;
  }
  closeFirmSearch() {
    this.showFirmSearch = false;
  }
  
  //#region searchinsurance
  onInsuranceSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showInsuranceSearch = true;
    }
    else {
      this.showInsuranceSearch = false;
    }
  }
  addInsurance(obj) {
    debugger;
    //let recordId = obj.record_id;
    //let insObject = obj.insurance;
    this.insuranceId = obj.insurance.insurance_id;
    this.insuranceName = obj.insurance.insurance_name;
    (this.patPersonalInjury.get("txtInsuranceName") as FormControl).setValue(this.insuranceName);
    this.showInsuranceSearch = false;
  }
  closeInsuranceSearch() {
    this.showInsuranceSearch = false;
  }
  //#endregion searchinsurance
  savePersonalInjury(values){
    debugger;
    if(values.txtattorneyname != "" &&  this.attorneyId == null){
      alert("Please select a valid Attorney.");
      return false;
    }
    else if(values.txtinsurancename != "" && this.insuranceId == null){
      alert("Please select a valid Insurance.");
      return false;
    }
      this.obj_PatientInjury=new ORMPatientInjury();
      this.obj_PatientInjury.patient_id = this.patientId;
      this.obj_PatientInjury.practice_id = this.lookupList.practiceInfo.practiceId;
      this.obj_PatientInjury.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
      this.obj_PatientInjury.claim_no = values.txtclaimno;
      let accountDate = this.dateTimeUtil.getStringDateFromDateModel(values.txtaccountdate);
      if (accountDate != "") {
        this.obj_PatientInjury.acc_date = accountDate;
      } else {
        this.obj_PatientInjury.acc_date = "";
      }
      //this.obj_PatientInjury.acc_date = String("00" + values.txtaccountdate.month).slice(-2)+'/'+String("00" + values.txtaccountdate.day).slice(-2)+'/'+String("0000" + values.txtaccountdate.year).slice(-4);
      this.obj_PatientInjury.adj_name = values.txtadjustername;
      this.obj_PatientInjury.adj_phone = values.txtadjusterphone;
      this.obj_PatientInjury.adj_fax = values.txtadjusterfax;
      //this.obj_PatientInjury.start_date = String("00" + values.txtstartdate.month).slice(-2)+'/'+String("00" + values.txtstartdate.day).slice(-2)+'/'+String("0000" + values.txtstartdate.year).slice(-4);
      let startDate = this.dateTimeUtil.getStringDateFromDateModel(values.txtstartdate);
      if (startDate != "") {
        this.obj_PatientInjury.start_date = startDate;
      } else {
        this.obj_PatientInjury.start_date = "";
      }
      //this.obj_PatientInjury.end_date = String("00" + values.txtenddate.month).slice(-2)+'/'+String("00" + values.txtenddate.day).slice(-2)+'/'+String("0000" + values.txtenddate.year).slice(-4);
      let endDate = this.dateTimeUtil.getStringDateFromDateModel(values.txtenddate);
      if (endDate != "") {
        this.obj_PatientInjury.end_date = endDate;
      } else {
        this.obj_PatientInjury.end_date = "";
      }
      this.obj_PatientInjury.modified_user = this.lookupList.logedInUser.user_name;
      this.obj_PatientInjury.deleted = false;
      this.obj_PatientInjury.system_ip = this.lookupList.logedInUser.systemIp;

      if(this.isEdit == false)
      {
        this.obj_PatientInjury.attornery_id = this.attorneyId;
        this.obj_PatientInjury.insurance_id = this.insuranceId;
        this.obj_PatientInjury.client_date_created= this.dateTimeUtil.getCurrentDateTimeString();
        this.obj_PatientInjury.created_user = this.lookupList.logedInUser.user_name;
      }
      else
      {
        this.obj_PatientInjury.injury_id = this.selectedRow.injury_id;
        this.obj_PatientInjury.attornery_id = this.attorneyId == null ? this.selectedRow.attornery_id : this.attorneyId;
        this.obj_PatientInjury.insurance_id = this.insuranceId == null ? this.selectedRow.insurance_id : this.insuranceId;
        this.obj_PatientInjury.client_date_created= this.selectedRow.client_date_created;
        this.obj_PatientInjury.created_user = this.selectedRow.created_user;
      }
      this.patientService.saveEditPatInjury(this.obj_PatientInjury)
      .subscribe(
      data => this.savedSuccessfull(data),
      error => alert(error),
      () => this.logMessage.log("Save Patient Injury.")
    );
  }

  savedSuccessfull(data) {
    this.getPatientInjury(this.patientId);
    this.isEdit = false;
    this.cancelPersonalInjury();
  }
  getPatientInjury(patient_id){
    this.patientService.getPatInjury(patient_id)
    .subscribe(
      data=>
      {
        this.listInjuryResult = data as Array<any>;
      },
      error=>alert(error),
      ()=>this.logMessage.log("get Patient Personal Injury Successfull.")
    );
  }
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
  };
  deleteRecord(obj) {
    debugger;
    const modalRef = this.modalService.open(ConfirmationPopupComponent,this.logoutScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    let closeResult;

    modalRef.result.then((result) => {    
      debugger;
      if (result == true || result.toLowerCase() == "yes") {        
         let deleteRecordData = new ORMDeleteRecord();
         deleteRecordData.column_id = obj.injury_id;
         deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
         deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
         deleteRecordData.client_ip=this.lookupList.logedInUser.systemIp;

        this.patientService.deletePatientInjury(deleteRecordData)
          .subscribe(
          data => this.onDeleteSuccessfully(),
          error => alert(error),
          () => this.logMessage.log("delete Personal Injury Successfull.")
          );
      }
    }, (reason) => {
    });
  }
  onDeleteSuccessfully(){
    this.getPatientInjury(this.patientId);
  }
  editRecord(row) {
    debugger;
    this.isEdit = true;
    this.attorneyId = row.attornery_id;
    this.insuranceId = row.insurance_id;
    this.selectedRow = row;
    this.dashboardAddEdit = true;
    this.assignValues(row);
  }
  assignValues(values){
    debugger;
    (this.patPersonalInjury.get('txtfirmname') as FormControl).setValue(values.firm_name);
    (this.patPersonalInjury.get('txtattorneyname') as FormControl).setValue(values.attorney_name);
    (this.patPersonalInjury.get('txtfirmaddress') as FormControl).setValue(values.attorney_address);
    (this.patPersonalInjury.get('txtphone') as FormControl).setValue(values.phone);
    (this.patPersonalInjury.get('txtfaxno') as FormControl).setValue(values.fax);
    (this.patPersonalInjury.get('txtInsuranceName') as FormControl).setValue(values.ins_name);
    (this.patPersonalInjury.get('txtadjustername') as FormControl).setValue(values.adj_name);
    (this.patPersonalInjury.get('txtadjusterphone') as FormControl).setValue(values.adj_phone);
    (this.patPersonalInjury.get('txtadjusterfax') as FormControl).setValue(values.adj_fax);
    (this.patPersonalInjury.get('txtclaimno') as FormControl).setValue(values.claim_no);
    if(values.start_date!=null && values.start_date!="")
      (this.patPersonalInjury.get("txtstartdate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(values.start_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    if(values.end_date!=null && values.end_date!="")
      (this.patPersonalInjury.get('txtenddate') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(values.end_date,DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    if(values.acc_date!=null && values.acc_date!="")
      (this.patPersonalInjury.get('txtaccountdate') as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(values.acc_date,DateTimeFormat.DATEFORMAT_MM_DD_YYYY));   
  }
  selectionChange(row){
    this.isSelectedRowID = row.injury_id;
  }
}