import { Component, OnInit, Input, Inject } from '@angular/core';
import { NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { SchedulerService } from '../../../services/scheduler/scheduler.service';
import { LogMessage } from '../../../shared/log-message';
import { ListFilterPipe } from '../../../shared/list-filter-pipe';
import { GeneralOperation } from '../../../shared/generalOperation';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { CustomValidators } from '../../../shared/custome-validators';
import { ORMSaveProviderTiming } from '../../../models/scheduler/orm-save-provider-timing';
import { ServiceResponseStatusEnum, PromptResponseEnum } from '../../../shared/enum-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'provider-office-timing',
  templateUrl: './provider-office-timing.component.html',
  styleUrls: ['./provider-office-timing.component.css'],
  providers: [NgbTimepickerConfig]
})
export class ProviderOfficeTimingComponent implements OnInit {

  providerTimingForm: FormGroup;
  lstFileredProviders: Array<any>;
  lstLocationProviders: Array<any>;
  lstLocations: Array<any>;
  lstProviderTiming: Array<any>;

  locationId: number;
  providerId: number;

  lstAppointmentsPerSlot: Array<any> = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  editState: boolean = false;
  isLoading: boolean = true;
  isSaving: boolean = false;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(config: NgbTimepickerConfig,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private schedulerService: SchedulerService,
    private logMessage: LogMessage,
    private generalOperation: GeneralOperation,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal) {

    config.spinners = false;
    config.size = 'small';

    //debugger;
    this.lstLocations = lookupList.locationList.slice();
    this.locationId = this.lstLocations[0].id;

    this.isLoading = true;
    this.getLocationProviders();

  }

  lstSlotSize: Array<number> = [5, 10, 15, 20, 25, 30]

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.providerTimingForm = this.formBuilder.group({
      cmbLocation: this.formBuilder.control(this.locationId),
      cmbProvider: this.formBuilder.control(null),

      chkDayOnD1: this.formBuilder.control(null),
      tpTimeFromD1: this.formBuilder.control(null),
      tpTimeToD1: this.formBuilder.control(null),
      tpBreakFromD1: this.formBuilder.control(null),
      tpBreakToD1: this.formBuilder.control(null),
      chkBreakEnabledD1: this.formBuilder.control(null),
      cmbSlotSizeD1: this.formBuilder.control(15),

      chkDayOnD2: this.formBuilder.control(null),
      tpTimeFromD2: this.formBuilder.control(null),
      tpTimeToD2: this.formBuilder.control(null),
      tpBreakFromD2: this.formBuilder.control(null),
      tpBreakToD2: this.formBuilder.control(null),
      chkBreakEnabledD2: this.formBuilder.control(null),
      cmbSlotSizeD2: this.formBuilder.control(15),

      chkDayOnD3: this.formBuilder.control(null),
      tpTimeFromD3: this.formBuilder.control(null),
      tpTimeToD3: this.formBuilder.control(null),
      tpBreakFromD3: this.formBuilder.control(null),
      tpBreakToD3: this.formBuilder.control(null),
      chkBreakEnabledD3: this.formBuilder.control(null),
      cmbSlotSizeD3: this.formBuilder.control(15),

      chkDayOnD4: this.formBuilder.control(null),
      tpTimeFromD4: this.formBuilder.control(null),
      tpTimeToD4: this.formBuilder.control(null),
      tpBreakFromD4: this.formBuilder.control(null),
      tpBreakToD4: this.formBuilder.control(null),
      chkBreakEnabledD4: this.formBuilder.control(null),
      cmbSlotSizeD4: this.formBuilder.control(15),

      chkDayOnD5: this.formBuilder.control(null),
      tpTimeFromD5: this.formBuilder.control(null),
      tpTimeToD5: this.formBuilder.control(null),
      tpBreakFromD5: this.formBuilder.control(null),
      tpBreakToD5: this.formBuilder.control(null),
      chkBreakEnabledD5: this.formBuilder.control(null),
      cmbSlotSizeD5: this.formBuilder.control(15),

      chkDayOnD6: this.formBuilder.control(null),
      tpTimeFromD6: this.formBuilder.control(null),
      tpTimeToD6: this.formBuilder.control(null),
      tpBreakFromD6: this.formBuilder.control(null),
      tpBreakToD6: this.formBuilder.control(null),
      chkBreakEnabledD6: this.formBuilder.control(null),
      cmbSlotSizeD6: this.formBuilder.control(15),

      chkDayOnD7: this.formBuilder.control(null),
      tpTimeFromD7: this.formBuilder.control(null),
      tpTimeToD7: this.formBuilder.control(null),
      tpBreakFromD7: this.formBuilder.control(null),
      tpBreakToD7: this.formBuilder.control(null),
      chkBreakEnabledD7: this.formBuilder.control(null),
      cmbSlotSizeD7: this.formBuilder.control(15)
    },
      {
        validator: Validators.compose([
          CustomValidators.requiredWhenBoolean('tpTimeFromD1', 'chkDayOnD1'),
          CustomValidators.requiredWhenBoolean('tpTimeToD1', 'chkDayOnD1'),
          CustomValidators.requiredWhenBoolean('cmbSlotSizeD1', 'chkDayOnD1'),
          CustomValidators.requiredWhenBoolean('tpTimeFromD2', 'chkDayOnD2'),
          CustomValidators.requiredWhenBoolean('tpTimeToD2', 'chkDayOnD2'),
          CustomValidators.requiredWhenBoolean('cmbSlotSizeD2', 'chkDayOnD2'),
          CustomValidators.requiredWhenBoolean('tpTimeFromD3', 'chkDayOnD3'),
          CustomValidators.requiredWhenBoolean('tpTimeToD3', 'chkDayOnD3'),
          CustomValidators.requiredWhenBoolean('cmbSlotSizeD3', 'chkDayOnD3'),
          CustomValidators.requiredWhenBoolean('tpTimeFromD4', 'chkDayOnD4'),
          CustomValidators.requiredWhenBoolean('tpTimeToD4', 'chkDayOnD4'),
          CustomValidators.requiredWhenBoolean('cmbSlotSizeD4', 'chkDayOnD4'),
          CustomValidators.requiredWhenBoolean('tpTimeFromD5', 'chkDayOnD5'),
          CustomValidators.requiredWhenBoolean('tpTimeToD5', 'chkDayOnD5'),
          CustomValidators.requiredWhenBoolean('cmbSlotSizeD5', 'chkDayOnD5'),
          CustomValidators.requiredWhenBoolean('tpTimeFromD6', 'chkDayOnD6'),
          CustomValidators.requiredWhenBoolean('tpTimeToD6', 'chkDayOnD6'),
          CustomValidators.requiredWhenBoolean('cmbSlotSizeD6', 'chkDayOnD6'),
          CustomValidators.requiredWhenBoolean('tpTimeFromD7', 'chkDayOnD7'),
          CustomValidators.requiredWhenBoolean('tpTimeToD7', 'chkDayOnD7'),
          CustomValidators.requiredWhenBoolean('cmbSlotSizeD7', 'chkDayOnD7'),

          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakFromD1', 'chkDayOnD1', true, 'chkBreakEnabledD1', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakToD1', 'chkDayOnD1', true, 'chkBreakEnabledD1', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakFromD2', 'chkDayOnD2', true, 'chkBreakEnabledD2', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakToD2', 'chkDayOnD2', true, 'chkBreakEnabledD2', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakFromD3', 'chkDayOnD3', true, 'chkBreakEnabledD3', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakToD3', 'chkDayOnD3', true, 'chkBreakEnabledD3', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakFromD4', 'chkDayOnD4', true, 'chkBreakEnabledD4', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakToD4', 'chkDayOnD4', true, 'chkBreakEnabledD4', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakFromD5', 'chkDayOnD5', true, 'chkBreakEnabledD5', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakToD5', 'chkDayOnD5', true, 'chkBreakEnabledD5', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakFromD6', 'chkDayOnD6', true, 'chkBreakEnabledD6', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakToD6', 'chkDayOnD6', true, 'chkBreakEnabledD6', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakFromD7', 'chkDayOnD7', true, 'chkBreakEnabledD7', true),
          CustomValidators.requiredWhenTwoOptionWithValue('tpBreakToD7', 'chkDayOnD7', true, 'chkBreakEnabledD7', true),
        ])
      }
    );
  }

  getLocationProviders() {
    this.lstLocationProviders = undefined;
    this.schedulerService.getLocationProviders(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstLocationProviders = data as Array<any>;
        this.filterProviders();
        this.isLoading = false;
        this.getProviderTiming();

      },
      error => {
        this.isLoading = false;
        this.ongetLocationProvidersError(error);
      }
    );
  }

  ongetLocationProvidersError(error) {
    this.logMessage.log("getLocationProviders Error.");
  }

  filterProviders() {
    debugger;
    if (this.lstLocationProviders == undefined)
      return;

    this.lstFileredProviders = undefined;

    if (this.locationId != undefined) {
      let listFilterPipe: ListFilterPipe;
      this.lstFileredProviders = new ListFilterPipe().transform(this.lstLocationProviders, "location_id", this.locationId);
      let index: number = this.generalOperation.getitemIndex(this.lstFileredProviders, "provider_id", this.providerId);
      //this.providerId=undefined;
      if (index == undefined && this.lstFileredProviders != undefined && this.lstFileredProviders.length > 0) {
        this.providerId = this.lstFileredProviders[0].provider_id;
      }
    }

    if (this.lstFileredProviders == undefined || this.lstFileredProviders.length == 0) {
      this.providerId = undefined;
    }
    (this.providerTimingForm.get("cmbProvider") as FormControl).setValue(this.providerId);
    //    console.log(this.lstFileredProviders.length);
  }

  locationChanged(locId) {

    this.locationId = locId;//this.providerTimingForm.get("cmbLocation").value;
    this.filterProviders();
    this.getProviderTiming();
  }

  providerChanged(proId) {

    this.providerId = proId;//this.providerTimingForm.get("cmbProvider").value;
    //this.filterProviders();
    this.getProviderTiming();
  }

  getProviderTiming() {

    this.lstProviderTiming = undefined;
    if (this.locationId == undefined || this.providerId == undefined) {
      return;
    }

    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "location_id", value: this.locationId, option: "" },
      { name: "provider_id", value: this.providerId, option: "" }
    ];

    this.schedulerService.getProviderTimingSettings(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstProviderTiming = data as Array<any>;

        this.isLoading = false;
      },
      error => {
        debugger;
        this.getProviderTimingError(error);
        this.isLoading = false;
      }
    );
  }

  getProviderTimingError(error) {
    this.logMessage.log("getProviderTiming Error.");
  }

  assignEditValues() {

    let timeFromModel;
    let timeToModel;
    let timeBreakFromModel;
    let timeBreakToModel;
    if (this.lstProviderTiming != undefined && this.lstProviderTiming.length > 0) {

      for (let t of this.lstProviderTiming) {

        timeFromModel = this.dateTimeUtil.getTimeModelFromTimeString(t.time_start, DateTimeFormat.DATEFORMAT_hh_mm_a);
        timeToModel = this.dateTimeUtil.getTimeModelFromTimeString(t.time_end, DateTimeFormat.DATEFORMAT_hh_mm_a);
        timeBreakFromModel = this.dateTimeUtil.getTimeModelFromTimeString(t.break_start, DateTimeFormat.DATEFORMAT_hh_mm_a);
        timeBreakToModel = this.dateTimeUtil.getTimeModelFromTimeString(t.break_end, DateTimeFormat.DATEFORMAT_hh_mm_a);

        (this.providerTimingForm.get('chkDayOnD' + t.week_day_id) as FormControl).setValue(t.day_on);
        (this.providerTimingForm.get('cmbSlotSizeD' + t.week_day_id) as FormControl).setValue(t.slot_size);
        (this.providerTimingForm.get('tpTimeFromD' + t.week_day_id) as FormControl).setValue(timeFromModel);
        (this.providerTimingForm.get('tpTimeToD' + t.week_day_id) as FormControl).setValue(timeToModel);
        (this.providerTimingForm.get('tpBreakFromD' + t.week_day_id) as FormControl).setValue(timeBreakFromModel);
        (this.providerTimingForm.get('tpBreakToD' + t.week_day_id) as FormControl).setValue(timeBreakToModel);

        (this.providerTimingForm.get('chkBreakEnabledD' + t.week_day_id) as FormControl).setValue(t.break_on);
      }
    }
  }

  dayOnChanged(event, id) {
    this.lstProviderTiming[id - 1]["day_on"] = event;
  }

  breakOnChanged(event, id) {
    this.lstProviderTiming[id - 1]["break_on"] = event;
  }

  onEdit() {
    this.editState = true;

    (this.providerTimingForm.get('cmbLocation') as FormControl).disable();
    (this.providerTimingForm.get('cmbProvider') as FormControl).disable();

    this.assignEditValues();
  }

  onCancel() {
    this.editState = false;
    this.getProviderTiming();

    (this.providerTimingForm.get('cmbLocation') as FormControl).enable();
    (this.providerTimingForm.get('cmbProvider') as FormControl).enable();
  }
  onSubmit(formValue) {

   
    let lstProviderTiming: Array<ORMSaveProviderTiming> = [];

    if (this.lstProviderTiming != undefined && this.lstProviderTiming.length > 0) {

      this.isSaving=true;
      for (let t of this.lstProviderTiming) {
        debugger;
        let obj: ORMSaveProviderTiming = new ORMSaveProviderTiming();

        obj.week_day = t.week_day;
        obj.timing_id = t.timing_id;
        obj.location_id = this.locationId;
        obj.provider_id = this.providerId;
        obj.practice_id = this.lookupList.practiceInfo.practiceId;
        obj.modified_user = this.lookupList.logedInUser.user_name;
        obj.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
        obj.system_ip = this.lookupList.logedInUser.systemIp;

        if (t.timing_id == undefined) {
          obj.created_user = this.lookupList.logedInUser.user_name;
          obj.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        }
        else {
          obj.created_user = t.created_user;
          obj.client_date_created = t.client_date_created;
          obj.date_created = t.client_date_created;
        }

        if ((this.providerTimingForm.get('chkDayOnD' + t.week_day_id) as FormControl).value) {
          obj.day_on = true;

          obj.time_start = (String("00" + (this.providerTimingForm.get('tpTimeFromD' + t.week_day_id) as FormControl).value.hour).slice(-2) + ':' + String("00" + (this.providerTimingForm.get('tpTimeFromD' + t.week_day_id) as FormControl).value.minute).slice(-2));
          obj.time_end = (String("00" + (this.providerTimingForm.get('tpTimeToD' + t.week_day_id) as FormControl).value.hour).slice(-2) + ':' + String("00" + (this.providerTimingForm.get('tpTimeToD' + t.week_day_id) as FormControl).value.minute).slice(-2));


          obj.slot_size = (this.providerTimingForm.get('cmbSlotSizeD' + t.week_day_id) as FormControl).value;

          obj.break_on = (this.providerTimingForm.get('chkBreakEnabledD' + t.week_day_id) as FormControl).value;

          if (obj.break_on) {
            obj.break_start = (String("00" + (this.providerTimingForm.get('tpBreakFromD' + t.week_day_id) as FormControl).value.hour).slice(-2) + ':' + String("00" + (this.providerTimingForm.get('tpBreakFromD' + t.week_day_id) as FormControl).value.minute).slice(-2));
            obj.break_end = (String("00" + (this.providerTimingForm.get('tpBreakToD' + t.week_day_id) as FormControl).value.hour).slice(-2) + ':' + String("00" + (this.providerTimingForm.get('tpBreakToD' + t.week_day_id) as FormControl).value.minute).slice(-2));
          }
        }
        else {
          obj.day_on = false;
        }
        lstProviderTiming.push(obj);
      }

      this.saveTiming(lstProviderTiming);
    }
  }

  saveTiming(lstProviderTiming: Array<ORMSaveProviderTiming>) {
    this.schedulerService.saveprovidertimingsettings(lstProviderTiming).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          this.isSaving = false;
          this.editState = false;
          this.getProviderTiming();
          (this.providerTimingForm.get('cmbLocation') as FormControl).enable();
          (this.providerTimingForm.get('cmbProvider') as FormControl).enable();
        }
        else if (data['error'] === ServiceResponseStatusEnum.SUCCESS) {
          this.onSaveTimingError(data['response']);
        }

      },
      error => {
        this.isSaving = false;
        this.onSaveTimingError("An error occured while saving provider timing.");
      }
    );
  }
  onSuccess(error) {
    this.logMessage.log("onSaveTiming Error.");
  }
  onSaveTimingError(error) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Provider Timing"
    modalRef.componentInstance.promptMessage = error;

    let closeResult;

    modalRef.result.then((result) => {
      //alert(result);
      if (result === PromptResponseEnum.OK) { }
    }
      , (reason) => {
        //alert(reason);
      });
  }
}
