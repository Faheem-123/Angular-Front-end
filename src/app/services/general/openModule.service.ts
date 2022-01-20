import {  Injectable, Inject,  EventEmitter } from '@angular/core';
import { PatientToOpen } from '../../models/common/patientToOpen';
import { AppointmentToOpen } from '../../models/common/appointment-to-open';

@Injectable()
export class OpenModuleService {    
    navigateToTab= new EventEmitter<String>();   
    openPatient = new EventEmitter<PatientToOpen>();
    openSchedulerAppointment = new EventEmitter<AppointmentToOpen>();    
}
