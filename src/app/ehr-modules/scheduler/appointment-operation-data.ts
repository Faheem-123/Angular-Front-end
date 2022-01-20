export enum AppointmentOptions {
    ADD = "add",
    EDIT = "edit",
    DELETE = "delete" ,
    CHECKIN_CHECKOUT = "checkin_checkout",
    SHOW_ELIGIBLITY = "show_eligibility",
    CHECK_LIVE_ELIGIBLITY = "check_live_eligibility",
    CASH_REGISTER = "cash_register",
    MODIFY_PATIENT = "modify_patient",
    PRINT_DEMOGRAPHICS = "print_demographics",
    CREATE_ENCOUNTER = "create_encounter",
    ENCOUNTER_SNAPSHOT = "encounter_snapshot",
    SCHEDULER_PATIENT_APPOINTMENT_REPORT = "scheduler_patient_appiontment_report",
    PATIENT_NOTES = "patient_notes",
    CALL_LOG = "call_log",
    APPOINTMENT_LOG = "appt_log"

  }
  
export class AppointmentOperationData {
    appointmentId:number;
    patientId:number;    
    patientName:string;
    providerId:number;
    locationId:number;
    appDate:string;
    appTime:string;
    appOption:AppointmentOptions;
    appDuration:number;
    appStatusId:number;
    comments:string;
    dob:string;
    phone:string;    
}