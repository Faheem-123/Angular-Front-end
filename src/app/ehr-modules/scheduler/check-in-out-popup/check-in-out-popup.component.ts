import { Component, OnInit, Input, Inject } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentOperationData } from '../appointment-operation-data';
import { SchedulerService } from '../../../services/scheduler/scheduler.service';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { LogMessage } from '../../../shared/log-message';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { GeneralService } from '../../../services/general/general.service';
import { CustomValidators } from '../../../shared/custome-validators';
import { PhonePipe } from '../../../shared/phone-pipe';
import { RegExEnum, ServiceResponseStatusEnum, PromptResponseEnum } from '../../../shared/enum-util';
import { ORMUpdatePatientContactInfo } from '../../../models/patient/orm-update-patient_contact-info';
import { DateTimeUtil } from '../../../shared/date-time-util';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { GeneralOperation } from '../../../shared/generalOperation';
import { SuperBillPrint } from 'src/app/models/patient/superBill-print';
import { PatientDataOnCheckedinComponent } from '../patient-data-on-checkedin/patient-data-on-checkedin.component';

@Component({
  selector: 'check-in-out-popup',
  templateUrl: './check-in-out-popup.component.html',
  styleUrls: ['./check-in-out-popup.component.css']
})
export class CheckInOutPopupComponent implements OnInit {

  @Input() appOperationData: AppointmentOperationData;

  checkInOutForm: FormGroup;
  contactInfoForm: FormGroup;

  isLoading: boolean = true;
  lstRooms: Array<any>;
  lstCitiesState: Array<any>;
  patientInfoData: any;
  patientName: string;
  gender: string;
  dob: string;
  pid: string;
  patientId: number;
  appointmentId: number;
  appointmentDate: number;
  locationId: number;
  locationName: string;
  provider_id: string;
  providerName: string;
  roomId: number;
  roomIdModified: number;
  isRoomChanged: boolean = false;
  isContactInfoMissing: boolean = false;
  showContactUpdateDiv: boolean = false;
  isTodaysAppointmentExist: boolean = true;
  patientBalanceDue: number;
  primary_insurance_copay: number;
  paymentPromptAppointmentId: number;

  checkedInTime: string;
  checkedOutTime: string;

  saveOperation: string;

  addressL1: string;
  addressL2: string;
  zipCode: string;
  city: string;
  state: string;
  cellPhone: string;
  homePhone: string;
  contactUpdateError: string;
  checkInOutError: string;

  lstSuperBill: Array<string> = ["Pediatric route codes", "Internal med code", "Midwife route", "Annual wellness route", "Immigration route"];

  patPicURL: string;
  constructor(public activeModal: NgbActiveModal,
    private ngbModal: NgbModal,
    private schedulerService: SchedulerService,
    private generalService: GeneralService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation, private superbillPrint: SuperBillPrint) { }

  ngOnInit() {

    debugger;
    this.patientName = this.appOperationData.patientName;
    this.dob = this.appOperationData.dob;
    //this.pid=this.appOperationData.patientId;

    this.patientId = this.appOperationData.patientId;
    this.appointmentId = this.appOperationData.appointmentId;

    this.getCheckInOutInfo();

    this.buildForm();
  }

  buildForm() {
    this.checkInOutForm = this.formBuilder.group({
      cmbRoom: this.formBuilder.control(this.roomId, Validators.required),
      cmbBill: this.formBuilder.control(this.roomId)
    }
    );

    this.contactInfoForm = this.formBuilder.group({
      txtAddressLine1: this.formBuilder.control(this.addressL1, Validators.required),
      txtAddressLine2: this.formBuilder.control(this.addressL2),
      txtZipCode: this.formBuilder.control(this.zipCode, Validators.required),
      txtState: this.formBuilder.control({ value: this.state, disabled: true }),
      cmbCity: this.formBuilder.control(this.city, Validators.required),
      txtCellPhone: this.formBuilder.control(this.cellPhone, Validators.pattern(RegExEnum.PHONE)),
      txtHomePhone: this.formBuilder.control(this.homePhone, Validators.pattern(RegExEnum.PHONE))
    },
      {
        validator: Validators.compose([
          CustomValidators.requiredEither('txtCellPhone', 'txtHomePhone', 'phoneNo')
        ])
      }
    );
  }

  getRooms() {

    debugger;
    this.schedulerService.getRooms(this.lookupList.practiceInfo.practiceId, this.locationId).subscribe(
      data => {
        debugger;
        this.lstRooms = data as Array<any>;


        if (this.roomId == undefined || this.roomId <= 0) {

          let room = this.generalOperation.getitem(this.lstRooms, "is_default", true);
          debugger;
          if (room != undefined)
            this.roomId = room.rooms_id;
        }

        this.checkInOutForm.get("cmbRoom").setValue(this.roomId);
        this.isLoading = false;
      },
      error => {
        this.getRoomsError(error);
        this.isLoading = false;
      }
    );
  }

  getRoomsError(error) {
    this.logMessage.log("getLocationProviders Error.");
  }

  getCheckInOutInfo() {

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "appointment_id", value: this.appointmentId, option: "" }
    ];


    this.schedulerService.getCheckInOutInfo(searchCriteria).subscribe(
      data => {
        this.patientInfoData = data;

        debugger;
        if (this.patientInfoData != undefined) {
          this.appointmentId = this.patientInfoData.appointment_id;
          this.pid = this.patientInfoData.pid;
          this.appointmentDate = this.patientInfoData.appointment_date;


          //this.gender = this.patientInfoData.gender;

          if (this.patientInfoData.gender_code == 'F') {
            this.gender = "FEMALE";
          }
          else if (this.patientInfoData.gender_code == 'M') {
            this.gender = "MALE";
          }
          else if (this.patientInfoData.gender_code == 'U') {
            this.gender = "UNKNOWN";
          }
          else {
            this.gender = "";
          }


          this.locationName = this.patientInfoData.location_name;
          this.providerName = this.patientInfoData.provider_name;
          this.locationId = this.patientInfoData.location_id;
          this.provider_id = this.patientInfoData.provider_id;
          this.roomId = this.patientInfoData.rooms_id;
          this.patientBalanceDue = this.patientInfoData.patient_due;
          this.primary_insurance_copay = this.patientInfoData.pri_copay;
          this.checkedInTime = this.patientInfoData.checkin_time;
          this.checkedOutTime = this.patientInfoData.checkout_time;
          this.isContactInfoMissing = this.patientInfoData.contact_info_missing;

          this.addressL1 = this.patientInfoData.address1;
          this.addressL2 = this.patientInfoData.address2;
          this.zipCode = this.patientInfoData.zip;
          this.state = this.patientInfoData.state;
          this.city = this.patientInfoData.city;
          this.cellPhone = this.patientInfoData.cell_phone;
          this.homePhone = this.patientInfoData.home_phone;


          if (this.patientInfoData.address1 == undefined || this.patientInfoData.address1 == ""
            || this.patientInfoData.zip == undefined || this.patientInfoData.zip == ""
            || this.patientInfoData.state == undefined || this.patientInfoData.state == ""
            || this.patientInfoData.city == undefined || this.patientInfoData.city == ""
            ||
            ((this.patientInfoData.cell_phone == undefined || this.patientInfoData.cell_phone == "")
              && (this.patientInfoData.home_phone == undefined || this.patientInfoData.home_phone == "")
            )
          ) {
            this.isContactInfoMissing = true;
          }

          //if(this.isContactInfoMissing == true && this.zipCode!=undefined)
          //{
          //  this.getCityState(this.zipCode);
          //}

          if (this.appointmentId != undefined) {
            this.isTodaysAppointmentExist = true;
            this.getRooms();
          }
          else {
            this.isTodaysAppointmentExist = false;
            this.isLoading = false;
          }


          this.patPicURL = this.generalOperation.getPatientPicturePath(this.patientInfoData.pic, this.patientInfoData.gender_code);
        }
      },
      error => {
        this.getCheckInOutInfoError(error);
        this.isLoading = false;
      }
    );
  }

  assignPatientContactInfo() {

    if (this.patientInfoData != undefined) {

      this.addressL1 = this.patientInfoData.address1;
      this.addressL2 = this.patientInfoData.address2;
      this.zipCode = this.patientInfoData.zip;
      this.state = this.patientInfoData.state;
      this.city = this.patientInfoData.city;
      this.cellPhone = this.patientInfoData.cell_phone;
      this.homePhone = this.patientInfoData.home_phone;

      (this.contactInfoForm.get("txtAddressLine1") as FormControl).setValue(this.addressL1);
      (this.contactInfoForm.get("txtAddressLine2") as FormControl).setValue(this.addressL2);
      (this.contactInfoForm.get("txtZipCode") as FormControl).setValue(this.zipCode);
      (this.contactInfoForm.get("txtHomePhone") as FormControl).setValue(new PhonePipe().transform(this.homePhone));
      (this.contactInfoForm.get("txtCellPhone") as FormControl).setValue(new PhonePipe().transform(this.cellPhone));


      this.getCityState(this.zipCode);
    }
  }

  getCheckInOutInfoError(error) {
    this.logMessage.log("getCheckInOutInfo Error.");
  }

  roomChanged(id) {
    this.roomIdModified = id;
    if (this.roomIdModified != this.roomId)
      this.isRoomChanged = true;
    else
      this.isRoomChanged = false;
  }

  roomChangeCancel() {
    this.isRoomChanged = false;
    this.roomIdModified = this.roomId;

    (this.checkInOutForm.get("cmbRoom") as FormControl).setValue(this.roomId);
  }

  saveCheckInOutRoom(operation) {

    debugger;
    this.saveOperation = operation;

    this.checkInOutError = "";

    if (this.isContactInfoMissing) {
      this.assignPatientContactInfo();
      this.showContactUpdateDiv = true;
      return;
    }

    this.roomIdModified = (this.checkInOutForm.get("cmbRoom") as FormControl).value;

    let lstORMKeyValue: Array<ORMKeyValue> = new Array();
    lstORMKeyValue.push(new ORMKeyValue("operation", this.saveOperation));
    lstORMKeyValue.push(new ORMKeyValue("client_date_time", this.dateTimeUtil.getCurrentDateTimeString()));
    lstORMKeyValue.push(new ORMKeyValue("modified_user", this.lookupList.logedInUser.user_name));
    lstORMKeyValue.push(new ORMKeyValue("room_id", this.roomIdModified));
    lstORMKeyValue.push(new ORMKeyValue("appointment_id", this.appointmentId));



    //if (operation === 'update_room') {

    //this.isRoomChanged = false;
    //this.roomIdModified = this.roomId;

    //}
    if (operation === 'check_in') {
      if (this.lookupList.practiceInfo.practiceId === 500 && this.patientBalanceDue > 0 && this.paymentPromptAppointmentId == undefined) {
        alert("Patient has a previous balance of $" + this.patientBalanceDue + "\nDo You want to enter that amount?")
        return;
      }
    }
    //else if (operation === 'check_out') {

    //}

    this.schedulerService.updateCheckInCheckOutRoom(lstORMKeyValue).subscribe(
      data => {

        // if (operation === 'check_out') {
        this.onCheckInCheckOutRoomSaveSuccess(data);
        // }        
      },
      error => {
        this.checkInOutError = error;
      }
    );
  }

  onCheckInCheckOutRoomSaveSuccess(data) {

    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      if (this.saveOperation != 'update_room') {
        this.activeModal.close(PromptResponseEnum.SUCCESS);
        //getpatientData on Check Out
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "patient_id", value: this.patientId, option: "" },
          { name: "appointment_id", value: this.appointmentId, option: "" },
          { name: "visit_date", value: this.appointmentDate, option: "" }
        ];
        if (this.saveOperation == 'check_out') {
          this.schedulerService.getPatientDataonCheckedIn(searchCriteria).subscribe(
            data => {
              this.onPatientDataonCheckedInSuccess(data);
            },
            error => {
              this.checkInOutError = error;
            }
          );
        }
      }
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.checkInOutError = data.response;
    }
  }
  onPatientDataonCheckedInSuccess(data) {
    debugger;
    const modalRef = this.ngbModal.open(PatientDataOnCheckedinComponent, this.poupUpOptions);
    modalRef.componentInstance.lstdata = data;
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,

  };

  saveContactInfo(formValue) {
    this.contactUpdateError = "";
    let ormUpdatePatientContactInfo: ORMUpdatePatientContactInfo = new ORMUpdatePatientContactInfo();
    ormUpdatePatientContactInfo.patientId = this.patientId;
    ormUpdatePatientContactInfo.addressLine1 = formValue.txtAddressLine1;
    ormUpdatePatientContactInfo.addressLine2 = formValue.txtAddressLine2;
    ormUpdatePatientContactInfo.zip = formValue.txtZipCode;
    ormUpdatePatientContactInfo.state = this.state;
    ormUpdatePatientContactInfo.city = formValue.cmbCity;
    ormUpdatePatientContactInfo.cellPhone = formValue.txtCellPhone;
    ormUpdatePatientContactInfo.homePhone = formValue.txtHomePhone;

    if (formValue.txtCellPhone != undefined && formValue.txtCellPhone != "") {
      ormUpdatePatientContactInfo.primaryContactType = "CELL PHONE";
    }
    else if (formValue.txtHomePhone != undefined && formValue.txtHomePhone != "") {
      ormUpdatePatientContactInfo.primaryContactType = "HOME PHONE";
    }

    ormUpdatePatientContactInfo.systemIP = this.lookupList.logedInUser.systemIp;
    ormUpdatePatientContactInfo.logedInUser = this.lookupList.logedInUser.user_name;
    ormUpdatePatientContactInfo.clientDateTime = this.dateTimeUtil.getCurrentDateTimeString();

    this.schedulerService.updatePatientContactInfo(ormUpdatePatientContactInfo).subscribe(
      data => {
        this.onsaveContactInfoSuccess(data);
      },
      error => {
        this.contactUpdateError = error;
      }
    );
  }
  onsaveContactInfoSuccess(data) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.isContactInfoMissing = false;
      this.showContactUpdateDiv = false;
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.contactUpdateError = data.response;
    }
  }

  cancelContactInfoSave() {

    this.contactUpdateError = "";
    this.showContactUpdateDiv = false;
  }

  zipFocusOut(zip) {
    this.lstCitiesState = undefined;
    this.state = undefined;

    (this.contactInfoForm.get("cmbCity") as FormControl).setValue(null);
    (this.contactInfoForm.get("txtState") as FormControl).setValue(null);

    this.getCityState(zip);
  }

  getCityState(zip) {
    this.generalService.getCityState(zip).subscribe(
      data => {
        debugger
        if (data != undefined && data != null) {
          this.lstCitiesState = data as Array<any>;
          this.state = this.lstCitiesState[0].state;
          (this.contactInfoForm.get("txtState") as FormControl).setValue(this.state);
          this.city = this.lstCitiesState[0].city;
          if (this.city != undefined && this.contactInfoForm.get("cmbCity") != undefined) {
            (this.contactInfoForm.get("cmbCity") as FormControl).setValue(this.city);
          }
          else {
            this.city = this.lstCitiesState[0].city;
          }
        }
      },
      error => {
        this.getCityStateError(error);
        this.isLoading = false;
      }
    );
  }

  getCityStateError(error) {
    this.logMessage.log("getCityState Error.");
  }

  cellPhoneFoucusOut(ph) {

    this.cellPhone = new PhonePipe().transform(ph);
    (this.contactInfoForm.get('txtCellPhone') as FormControl).setValue(this.cellPhone);
  }

  homePhoneFoucusOut(ph) {

    this.homePhone = new PhonePipe().transform(ph);

    (this.contactInfoForm.get('txtHomePhone') as FormControl).setValue(this.homePhone);
  }
  onBillPrint() {
    debugger;
    this.superbillPrint.patientID = this.patientId.toString();
    this.superbillPrint.ProviderID = this.provider_id;
    this.superbillPrint.appointmentID = this.appointmentId.toString();
    this.superbillPrint.CheckedTime = this.checkedInTime;
    this.superbillPrint.DropDownValue = (this.checkInOutForm.get("cmbBill") as FormControl).value;
    this.superbillPrint.getSuperBillData();
  }

  patPicErrorHandler(event) {
    event.target.src = this.lookupList.defaultPatPic;;
  }
}
