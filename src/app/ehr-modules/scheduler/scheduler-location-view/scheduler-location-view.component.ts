import { Component, OnInit, OnChanges, Input, Output, EventEmitter, Inject } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { SchedulerService } from 'src/app/services/scheduler/scheduler.service';
import { LogMessage } from 'src/app/shared/log-message';
import { SchedulerViewType } from 'src/app/shared/enum-util';

@Component({
  selector: 'scheduler-location-view',
  templateUrl: './scheduler-location-view.component.html',
  styleUrls: ['./scheduler-location-view.component.css']
})
export class SchedulerLocationViewComponent implements OnInit, OnChanges {

  @Input() locationId: number;
  @Input() appDate: string;
  @Input() patientNameSearched: string;
  @Input() refresh: boolean = false;
  @Output() addAppointment = new EventEmitter<any>();
  @Output() doSchedulerAction = new EventEmitter<any>();
  @Output() loadingIndicator = new EventEmitter<any>();



  isLoading: boolean = false;
  locationIdLoaded: number;
  appDateLoaded: string;
  appointmentCount: number = 0;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private schedulerService: SchedulerService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    //this.getAppointmentsLocationView();
  }

  ngOnChanges() {

    debugger;
    if (this.locationIdLoaded != this.locationId || this.appDateLoaded != this.appDate || this.refresh) {
      this.getAppointmentsLocationView();
      this.refresh = false;
    }
    else {
      this.loaded();
    }
  }

  loading() {
    this.isLoading = true;
    //this.loadingIndicator.emit(true);
    this.loadingIndicator.emit({ schedulerView: SchedulerViewType.LOCATION_VIEW, isLoading: true, appCount: this.appointmentCount });
  }


  loaded() {
    this.isLoading = false;
    //this.loadingIndicator.emit(false);
    this.loadingIndicator.emit({ schedulerView: SchedulerViewType.LOCATION_VIEW, isLoading: false, appCount: this.appointmentCount });
  }

  lstSchedulerTimingLocationView: Array<string>;
  lstProviderAppointmentsLocationView: Array<any>;
  locationViewNoRecord: boolean = false;
  getAppointmentsLocationView() {

    debugger;
    this.appointmentCount = 0
    this.loading();
    this.locationViewNoRecord = false;
    this.lstProviderAppointmentsLocationView = undefined;
    this.lstSchedulerTimingLocationView = undefined;

    this.locationIdLoaded = this.locationId;
    this.appDateLoaded = this.appDate;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "appointment_date", value: this.appDate, option: "" },
      { name: "location_id", value: this.locationId, option: "" }
    ];

    this.schedulerService.getAppointmentsByLocation(searchCriteria).subscribe(
      data => {

        //let lstApp: Array<any> = data as Array<any>;

        debugger;

        this.lstProviderAppointmentsLocationView = data['appointments'];
        this.lstSchedulerTimingLocationView = data['timing'];


        if (this.lstProviderAppointmentsLocationView == undefined || this.lstProviderAppointmentsLocationView.length == 0) {
          this.locationViewNoRecord = true;
        }
        else {
          this.appointmentCount = 0;
          this.lstProviderAppointmentsLocationView.forEach(loc => {
            if (loc.appointments != undefined) {
              this.appointmentCount += loc.appointments.length;
            }
          });

          // this.appointmentCount = this.lstProviderAppointmentsLocationView.length;
        }

        this.loaded();


      },
      error => {
        this.ongetAppointmentsByLocationError(error);
        this.loaded();
      }
    );
  }


  ongetAppointmentsByLocationError(error) {
    this.logMessage.log("getAppointmentsByLocation Error.");
    this.loaded();
  }


}
