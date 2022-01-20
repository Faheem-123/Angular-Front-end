import { Component, OnInit, Input, EventEmitter, Output, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { SchedulerService } from 'src/app/services/scheduler/scheduler.service';
import { LogMessage } from 'src/app/shared/log-message';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { SchedulerViewType } from 'src/app/shared/enum-util';


@Component({
  selector: 'scheduler-provider-view',
  templateUrl: './scheduler-provider-view.component.html',
  styleUrls: ['./scheduler-provider-view.component.css']
})
export class SchedulerProviderViewComponent implements OnInit {

  @Input() providerId: number;
  @Input() appDate: string;
  @Input() patientNameSearched: string;
  @Input() refresh: boolean = false;
  @Output() addAppointment = new EventEmitter<any>();
  @Output() doSchedulerAction = new EventEmitter<any>();
  @Output() loadingIndicator = new EventEmitter<any>();

  isLoading: boolean = false;
  providerIdLoaded: number;
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
    if (this.providerIdLoaded != this.providerId || this.appDateLoaded != this.appDate || this.refresh) {
      this.getAppointmentsProviderView();
      this.refresh = false;
    }
    else {
      this.loaded();
    }
  }


  loading() {
    this.isLoading = true;
    this.loadingIndicator.emit({ schedulerView:SchedulerViewType.PROVIDER_VIEW, isLoading: true, appCount: this.appointmentCount });
    // this.loadingIndicator.emit(true);
  }


  loaded() {
    this.isLoading = false;
    this.loadingIndicator.emit({schedulerView:SchedulerViewType.PROVIDER_VIEW, isLoading: false, appCount: this.appointmentCount });
    // this.loadingIndicator.emit(false);
  }

  lstSchedulerTimingProviderView: Array<string>;
  lstLocationAppointmentsProviderView: Array<any>;
  providerViewNoRecord: boolean = false;
  getAppointmentsProviderView() {

    debugger;

    this.appointmentCount = 0;
    this.loading();
    this.providerViewNoRecord = false;

    this.lstSchedulerTimingProviderView = undefined;
    this.lstLocationAppointmentsProviderView = undefined;

    this.providerIdLoaded = this.providerId;
    this.appDateLoaded = this.appDate;


    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "appointment_date", value: this.appDate, option: "" },
      { name: "provider_id", value: this.providerId, option: "" }
    ];

    this.schedulerService.getAppointmentsByProvider(searchCriteria).subscribe(
      data => {

        //let lstApp: Array<any> = data as Array<any>;

        debugger;

        this.lstLocationAppointmentsProviderView = data['appointments'];
        this.lstSchedulerTimingProviderView = data['timing'];


        if (this.lstLocationAppointmentsProviderView == undefined || this.lstLocationAppointmentsProviderView.length == 0) {
          this.providerViewNoRecord = true;
        }
        else {
          this.appointmentCount=0;
          this.lstLocationAppointmentsProviderView.forEach(pro => {
            if (pro.appointments != undefined) {
              this.appointmentCount += pro.appointments.length;
            }
          });

        }


        this.loaded();

      },
      error => {
        this.onvgetAppointmentsProviderViewError(error);
        this.loaded();
      }
    );
  }


  onvgetAppointmentsProviderViewError(error) {
    this.logMessage.log("getAppointmentsProviderView Error.");
    this.loaded();
  }


}
