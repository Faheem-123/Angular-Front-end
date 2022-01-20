import { TreeviewModule } from 'ngx-treeview';
import { DischargeSummary } from './models/encounter/DischargeSummary';
import { Chartreport_Print } from './models/encounter/Chartreport_Print';
import { ReferralService } from './services/patient/referral.service';
import { GeneralOperation } from './shared/generalOperation';
import { LetterService } from './services/general/letter.service';
import { ClaimService } from './services/billing/claim.service';
import { EncounterService } from './services/encounter/encounter.service';
import { DashboardService } from './services/dashboard/dashboard.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';
//import { TreeModule } from 'ng2-tree';
import { QuillModule } from 'ngx-quill';
//ROUTING
import { routing } from './app.routing';

// COMPONENTS
import { AppComponent } from './app.component';
import { EhrMainComponent } from './ehr-main/ehr-main.component';
import { PatientSearchComponent } from './ehr-modules/patient/patient-search/patient-search.component';
import { PatientMainComponent } from './ehr-modules/patient/patient-main/patient-main.component';
import { FileUploadPopupComponent } from './general-modules/file-upload-popup/file-upload-popup.component';
//**************   SERVICES  **************
import { PatientService } from "./services/patient/patient.service";
import { GeneralService } from './services/general/general.service';
import { OpenModuleService } from './services/general/openModule.service';
import { SchedulerService } from './services/scheduler/scheduler.service';
import { InsurancesService } from './services/insurances.service';
// ****************************************

// **** AUTHENTICATION  ***
import { AuthInterceptor } from './authentication/auth-interceptor';
import { AuthService } from './authentication/auth-service';
// ***************************************

import { AppConfigModule } from './providers/app-config.module';
import { LookupListModule } from './providers/lookupList.module';

import { LogMessage } from './shared/log-message';
import { PatientContentComponent } from './ehr-modules/patient/patient-content/patient-content.component';
import { PatientSummaryComponent } from './ehr-modules/patient/patient-summary/patient-summary.component';
import { DynamicTabsDirective } from './ehr-modules/patient/patient-tab/dynamic-tabs.directive';
import { TabsComponent } from './ehr-modules/patient/patient-tab/tabs.component';
import { TabComponent } from './ehr-modules/patient/patient-tab/tab.component';
import { PatientEncounterComponent } from './ehr-modules/patient/patient-encounter/patient-encounter.component';
import { PatientLabsComponent } from './ehr-modules/patient/patient-labs/patient-labs.component';
import { PatientDocumentsComponent } from './ehr-modules/patient/patient-documents/patient-documents.component';
import { PatientReferralComponent } from './ehr-modules/patient/patient-referral-main/patient-referral/patient-referral.component';
import { PatientLettersComponent } from './ehr-modules/patient/patient-letters/patient-letters.component';
import { PatientCorrespondenceComponent } from './ehr-modules/patient/patient-correspondence/patient-correspondence.component';
import { PatientPersonalInjuryComponent } from './ehr-modules/patient/patient-personal-injury/patient-personal-injury.component';
import { PatientAppointmentsComponent } from './ehr-modules/patient/patient-appointments/patient-appointments.component';
import { PatientConsultsComponent } from './ehr-modules/patient/patient-consults/patient-consults.component';
import { DashboardMainComponent } from './ehr-modules/dashboard/dashboard-main/dashboard-main.component';
import { MessagesMainComponent } from './ehr-modules/messages/messages-main/messages-main.component';
import { SchedulerMainComponent } from './ehr-modules/scheduler/scheduler-main/scheduler-main.component';
import { LabsMainComponent } from './ehr-modules/labs/labs-main/labs-main.component';
import { LettersMainComponent } from './ehr-modules/letters/letters-main/letters-main.component';
import { ReportsMainComponent } from './ehr-modules/reports/reports-main/reports-main.component';
import { UserAdminMainComponent } from './ehr-modules/user-admin/user-admin-main/user-admin-main.component';
import { FaxMainComponent } from './ehr-modules/fax/fax-main/fax-main.component';
import { LogMainComponent } from './ehr-modules/log/log-main/log-main.component';
import { DashboardCashregisterComponent } from './ehr-modules/dashboard/dashboard-cashregister/dashboard-cashregister.component';
import { DashboardPendingresultsComponent } from './ehr-modules/dashboard/dashboard-pendingresults/dashboard-pendingresults.component';
import { DashboardCheckedinpatientComponent } from './ehr-modules/dashboard/dashboard-checkedinpatient/dashboard-checkedinpatient.component';
import { DashboardPendingencounterComponent } from './ehr-modules/dashboard/dashboard-pendingencounter/dashboard-pendingencounter.component';

import { SchedulerCardComponent } from './ehr-modules/scheduler/scheduler-card/scheduler-card.component';
import { DashboardUnreadmessagesComponent } from './ehr-modules/dashboard/dashboard-unreadmessages/dashboard-unreadmessages.component';
import { DashboardUnreadfaxesComponent } from './ehr-modules/dashboard/dashboard-unreadfaxes/dashboard-unreadfaxes.component';
import { DashboardPendingclaimsComponent } from './ehr-modules/dashboard/dashboard-pendingclaims/dashboard-pendingclaims.component';
import { DashboardGyneddComponent } from './ehr-modules/dashboard/dashboard-gynedd/dashboard-gynedd.component';
import { DateTimeUtil } from './shared/date-time-util';

// ************ PIPE **************
import { ListFilterPipe } from './shared/list-filter-pipe';
import { PhonePipe } from './shared/phone-pipe';
import { UniquePipe } from './shared/unique-pipe';
import { listFilterWithNumericCondition } from './shared/list-filter-with-numeric-condition';
// *********************************************
//******  Patient Sumamry *****************
import { SummaryMedicationComponent } from './ehr-modules/patient/summary/summary-medication/summary-medication.component';
import { SummaryAllergiesComponent } from './ehr-modules/patient/summary/summary-allergies/summary-allergies.component';
import { SummaryProblemsComponent } from './ehr-modules/patient/summary/summary-problems/summary-problems.component';
import { SummaryAssessmentsComponent } from './ehr-modules/patient/summary/summary-assessments/summary-assessments.component';
import { SummaryVaccinationComponent } from './ehr-modules/patient/summary/summary-vaccination/summary-vaccination.component';
import { SummaryHealthMaintenanceComponent } from './ehr-modules/patient/summary/summary-health-maintenance/summary-health-maintenance.component';
import { SummarySurgeriesComponent } from './ehr-modules/patient/summary/summary-surgeries/summary-surgeries.component';
import { SummaryProceduresComponent } from './ehr-modules/patient/summary/summary-procedures/summary-procedures.component';
import { SummaryConceptionOutcomesComponent } from './ehr-modules/patient/summary/summary-conception-outcomes/summary-conception-outcomes.component';
import { SummaryConsultsComponent } from './ehr-modules/patient/summary/summary-consults/summary-consults.component';
import { SummaryReferralsComponent } from './ehr-modules/patient/summary/summary-referrals/summary-referrals.component';
import { PatientReferralMainComponent } from './ehr-modules/patient/patient-referral-main/patient-referral-main.component';
import { PatientReferralRequestComponent } from './ehr-modules/patient/patient-referral-main/patient-referral-request/patient-referral-request.component';
// ************************************

//*************  POP UPS ******************************/
import { ConfirmationPopupComponent } from './general-modules/confirmation-popup/confirmation-popup.component';
import { AppointmentPopupComponent } from './ehr-modules/scheduler/appointment-popup/appointment-popup.component';
// *************************************************
import { NgbDatepickerConfig, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from "./shared/ngb-date-fr-parser-formatter";
import { AlertPopupComponent } from './general-modules/alert-popup/alert-popup.component';
import { ChartModuleTabsComponent } from './ehr-modules/encounter/chart-module-tabs/chart-module-tabs.component';
import { CheckInOutPopupComponent } from './ehr-modules/scheduler/check-in-out-popup/check-in-out-popup.component';
import { RptAppointmentsComponent } from './ehr-modules/reports/rpt-appointments/rpt-appointments.component';
import { EncounterReportComponent } from './ehr-modules/reports/encounter-report/encounter-report.component';
import { DiagnosticReportComponent } from './ehr-modules/reports/diagnostic-report/diagnostic-report.component';
import { RptEligibilityVerificationComponent } from './ehr-modules/reports/rpt-eligibility-verification/rpt-eligibility-verification.component';
import { RptEncounterProcDiagComponent } from './ehr-modules/reports/rpt-encounter-proc-diag/rpt-encounter-proc-diag.component';
import { ReportsService } from './services/reports.service';
import { SchedulerLoadedObservable } from './services/observable/scheduler-loaded-observable';
import { PatientAnnotationsComponent } from './ehr-modules/encounter/patient-annotations/patient-annotations.component';
import { VitalsComponent } from './ehr-modules/encounter/vitals/vitals.component';
import { ReasonforvisitHpiComponent } from './ehr-modules/encounter/reasonforvisit-hpi/reasonforvisit-hpi.component';
import { PatientProblemsComponent } from './ehr-modules/encounter/patient-problems/patient-problems.component';
import { PhysiciansCareComponent } from './ehr-modules/encounter/physicians-care/physicians-care.component';
import { CognitiveFunctionalHistoryComponent } from './ehr-modules/encounter/cognitive-functional-history/cognitive-functional-history.component';
import { EncounterMainComponent } from './ehr-modules/encounter/encounter-main/encounter-main.component';
import { SchedulerSettingsMainComponent } from './ehr-modules/scheduler/scheduler-settings-main/scheduler-settings-main.component';
import { ProviderOfficeTimingComponent } from './ehr-modules/scheduler/provider-office-timing/provider-office-timing.component';
import { ProviderTempOfficeTimingComponent } from './ehr-modules/scheduler/provider-temp-office-timing/provider-temp-office-timing.component';
import { ChartModuleHistoryComponent } from './general-modules/chart-module-history/chart-module-history.component';
import { UserApplicationRights } from './shared/UserApplicationRights';
import { LoadStartupService } from './services/login/load-startup.service';
import { EncounterSnapshotComponent } from './ehr-modules/encounter/encounter-snapshot/encounter-snapshot.component';
import { LocationProviderSetupComponent } from './ehr-modules/scheduler/location-provider-setup/location-provider-setup.component';
import { AppointmentSourceSettingComponent } from './ehr-modules/scheduler/appointment-source-setting/appointment-source-setting.component';
import { AppointmentTypesSettingComponent } from './ehr-modules/scheduler/appointment-types-setting/appointment-types-setting.component';
import { AppointmentStatusSettingComponent } from './ehr-modules/scheduler/appointment-status-setting/appointment-status-setting.component';
import { RoomsSettingComponent } from './ehr-modules/scheduler/rooms-setting/rooms-setting.component';
import { DocumentViewerComponent } from './general-modules/document-viewer/document-viewer.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { AppointmentRulesComponent } from './ehr-modules/scheduler/appointment-rules/appointment-rules.component';
import { EligibilityService } from './services/patient/eligibility.service';
import { PatientEligibilityComponent } from './ehr-modules/patient/patient-eligibility/patient-eligibility.component';
import { EncounterPrintViewerComponent } from './general-modules/encounter-print-viewer/encounter-print-viewer.component';
import { SocialHistoryComponent } from './ehr-modules/encounter/social-history/social-history.component';
import { PatientHtmlFormsViewerComponent } from './general-modules/patient-html-forms-viewer/patient-html-forms-viewer.component';
import { FollowUpComponent } from './ehr-modules/encounter/follow-up/follow-up.component';
import { HealthCheckSummaryComponent } from './ehr-modules/encounter/health-check-summary/health-check-summary.component';
import { HealthcheckSignAuthenticationComponent } from './general-modules/healthcheck-sign-authentication/healthcheck-sign-authentication.component';
import { PaymentService } from './services/billing/payment.service';

import { CurrencyPipe, DecimalPipe, CommonModule } from '@angular/common';
import { OpenedPatientInfo } from './models/common/patientInfo';
import { PatientDeleteNotesComponent } from './ehr-modules/patient/patient-delete-notes/patient-delete-notes.component';
import { OfficeTestComponent } from './ehr-modules/encounter/office-test/office-test.component';
import { SearchService } from './services/search.service';
import { InlinePatientSearchComponent } from './general-modules/inline-patient-search/inline-patient-search.component';
import { InlineDiagnosisSearchComponent } from './general-modules/inline-diagnosis-search/inline-diagnosis-search.component';
import { InlineLabtestSearchComponent } from './general-modules/inline-labtest-search/inline-labtest-search.component';
import { InlineDocCategorySearchComponent } from './general-modules/inline-doc-category-search/inline-doc-category-search.component';
import { InlineRaceEthnicitySearchComponent } from './general-modules/inline-race-ethnicity-search/inline-race-ethnicity-search.component';
import { InlineGuarantorSearchComponent } from './general-modules/inline-guarantor-search/inline-guarantor-search.component';
import { InlineInsuranceSearchComponent } from './general-modules/insurance/inline-insurance-search/inline-insurance-search.component';

import { FileValidator } from './shared/fileValidator';
import { SafePipe } from './shared/docSafe-pipe';
import { PatientImmunizationComponent } from './ehr-modules/encounter/patient-immunization/patient-immunization.component';
import { PatientInfoComponent } from './ehr-modules/patient/patient-info/patient-info/patient-info.component';
import { InlineRefPhysicianSearchComponent } from './general-modules/inline-ref-physician-search/inline-ref-physician-search.component';
import { NextOfKinPopupComponent } from './ehr-modules/patient/patient-info/next-of-kin-popup/next-of-kin-popup.component';
import { PatientInsuranceAddEditPopupComponent } from './general-modules/insurance/patient-insurance-add-edit-popup/patient-insurance-add-edit-popup.component';
import { PatientCareTeamAddEditPopupComponent } from './ehr-modules/patient/patient-info/patient-care-team-add-edit-popup/patient-care-team-add-edit-popup.component';
import { PatientCareTeamMemberAddEditPopupComponent } from './ehr-modules/patient/patient-info/patient-care-team-member-add-edit-popup/patient-care-team-member-add-edit-popup.component';
import { InlineSpecialitySearchComponent } from './general-modules/inline-speciality-search/inline-speciality-search.component';
import { TreeModule } from 'angular-tree-component';
import { PatientLabOrderSearchComponent } from './ehr-modules/patient/patient-lab-order-search/patient-lab-order-search.component';
import { PatientLabOrderPendingComponent } from './ehr-modules/patient/patient-lab-order-pending/patient-lab-order-pending.component';
import { PatientLabOrderSignedComponent } from './ehr-modules/patient/patient-lab-order-signed/patient-lab-order-signed.component';
import { RptPatientLabOrderCumulativeComponent } from './ehr-modules/reports/rpt-patient-lab-order-cumulative/rpt-patient-lab-order-cumulative.component';
import { PatientLabOrderFollowupComponent } from './ehr-modules/patient/patient-lab-order-followup/patient-lab-order-followup.component';

//import fontawesome from '@fortawesome/fontawesome';
//import {faEye,faPrint,faTrashAlt} from '@fortawesome/fontawesome-free-solid';
//import {faCaretSquareDown} from '@fortawesome/fontawesome-free-regular';
//fontawesome.library.add(faEye,faPrint,faTrashAlt);
//*************  MULTISELECT DROPDOWN ******************************/
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RptPatientEligibilityComponent } from './ehr-modules/reports/rpt-patient-eligibility/rpt-patient-eligibility.component';
import { RptDailyDepositComponent } from './ehr-modules/reports/rpt-daily-deposit/rpt-daily-deposit.component';
import { RptEncounterCountComponent } from './ehr-modules/reports/rpt-encounter-count/rpt-encounter-count.component';
import { LabService } from './services/lab/lab.service';
import { PagerService } from './services/pager.service';
import { UsersComponent } from './ehr-modules/setting/user-setting/users/users.component';

import { UserSettingComponent } from './ehr-modules/setting/user-setting/user-setting.component';
import { GeneralSetupComponent } from './ehr-modules/setting/general-setup/general-setup.component';
import { OtherSetupComponent } from './ehr-modules/setting/other-setup/other-setup.component';
import { BillingSetupComponent } from './ehr-modules/setting/billing-setup/billing-setup.component';
import { CameraCapturePopupComponent } from './general-modules/camera-capture-popup/camera-capture-popup.component';
import { ReminderCallComponent } from './ehr-modules/reports/reminder-call/reminder-call.component';
import { GynMissedVisitComponent } from './ehr-modules/reports/gyn-missed-visit/gyn-missed-visit.component';
import { PregnancyRegisterComponent } from './ehr-modules/reports/pregnancy-register/pregnancy-register.component';
import { AssessmentsComponent } from './ehr-modules/encounter/assessments/assessments.component';
import { SurgeryComponent } from './ehr-modules/encounter/surgery/surgery.component';
import { FamilyHistoryComponent } from './ehr-modules/encounter/family-history/family-history.component';
import { PrescriptionComponent } from './ehr-modules/encounter/prescription/prescription.component';
import { AllergyComponent } from './ehr-modules/encounter/allergy/allergy.component';
import { RosComponent } from './ehr-modules/encounter/ros/ros.component';
import { ProgressNotesComponent } from './ehr-modules/encounter/progress-notes/progress-notes.component';
import { ProcedureComponent } from './ehr-modules/encounter/procedure/procedure.component';
import { PhysicalExamComponent } from './ehr-modules/encounter/physical-exam/physical-exam.component';
import { InjuryTreatmentComponent } from './ehr-modules/encounter/injury-treatment/injury-treatment.component';
import { PreNatalComponent } from './ehr-modules/encounter/pre-natal/pre-natal.component';
import { AwvScreeningComponent } from './ehr-modules/encounter/awv-screening/awv-screening.component';
import { HealthMaintenanceComponent } from './ehr-modules/encounter/health-maintenance/health-maintenance.component';
import { FemaleExamComponent } from './ehr-modules/encounter/female-exam/female-exam.component';
import { AsthmaExamComponent } from './ehr-modules/encounter/asthma-exam/asthma-exam.component';
import { ReferralComponent } from './ehr-modules/encounter/referral/referral.component';
import { PmhComponent } from './ehr-modules/encounter/pmh/pmh.component';
import { LabSummaryComponent } from './ehr-modules/encounter/lab/lab-summary/lab-summary.component';
import { PatientSearchObservable } from './services/observable/patient-search-observable';
import { LabOrderComponent } from './ehr-modules/encounter/lab/lab-order/lab-order.component';
import { LabSpecimenComponent } from './ehr-modules/encounter/lab/lab-specimen/lab-specimen.component';
import { LabResultComponent } from './ehr-modules/encounter/lab/lab-result/lab-result.component';
import { LabAttachmentComponent } from './ehr-modules/encounter/lab/lab-attachment/lab-attachment.component';

import { RptCashRegisterComponent } from './ehr-modules/reports/rpt-cash-register/rpt-cash-register.component';
import { RptCashRegYearlyCollectionComponent } from './ehr-modules/reports/rpt-cash-reg-yearly-collection/rpt-cash-reg-yearly-collection.component';

import { InlineDocumentCategorySearchComponent } from './general-modules/inline-document-category-search/inline-document-category-search.component';
import { ListFilterContainPipe } from './shared/list-filter-contain-pipe';
import { DwtComponent } from './general-modules/dwt/dwt.component';
import { LazyForDirective } from './shared/lazyFor.directive';
import { HealthMaintCommontestComponent } from './ehr-modules/encounter/health-maintenance/health-maint-commontest/health-maint-commontest.component';
import { HealthMaintCustomtestComponent } from './ehr-modules/encounter/health-maintenance/health-maint-customtest/health-maint-customtest.component';
import { HealthMaintOthertestComponent } from './ehr-modules/encounter/health-maintenance/health-maint-othertest/health-maint-othertest.component';
import { HealthMaintVaccinationComponent } from './ehr-modules/encounter/health-maintenance/health-maint-vaccination/health-maint-vaccination.component';
import { HealthMaintLipidComponent } from './ehr-modules/encounter/health-maintenance/health-maint-lipid/health-maint-lipid.component';
import { PayerwisePatientComponent } from './ehr-modules/reports/payerwise-patient/payerwise-patient.component';
import { InlinePayerSearchComponent } from './general-modules/inline-payer-search/inline-payer-search.component';
import { PatientClaimComponent } from './ehr-modules/patient/patient-claim/patient-claim.component';
import { ClaimNotesComponent } from './billing-modules/claim/claim-notes/claim-notes.component';
import { ClaimReminderComponent } from './billing-modules/claim/claim-reminder/claim-reminder.component';
import { InlineProcedureSearchComponent } from './general-modules/inline-procedure-search/inline-procedure-search.component';
import { TemplateMainComponent } from './ehr-modules/encounter/chart-template/template-main/template-main.component';
import { TemplateComponent } from './ehr-modules/encounter/chart-template/template/template.component';
import { ProblemBasedTemplateComponent } from './ehr-modules/encounter/chart-template/problem-based-template/problem-based-template.component';
import { TextareaAutosizeModule } from 'ngx-textarea-autosize';
import { InlineImmunizationSearchComponent } from './general-modules/inline-immunization-search/inline-immunization-search.component'
import { RptClaimDetailComponent } from './ehr-modules/reports/rpt-claim-detail/rpt-claim-detail.component';
import { CrossReportComponent } from './ehr-modules/reports/cross-report/cross-report.component';
import { NewPatientComponent } from './ehr-modules/reports/new-patient/new-patient.component';
import { ListFilterGeneral } from './shared/filter-pipe-general';
import { ListFilterContainThreeColumns } from './shared/filter-pipe-three-columns';
import { RptPaymentCategoriesComponent } from './ehr-modules/reports/rpt-payment-categories/rpt-payment-categories.component';
import { ClaimProfessionalComponent } from './billing-modules/claim/claim-professional/claim-professional.component';
import { RptBankdepositComponent } from './ehr-modules/reports/rpt-bankdeposit/rpt-bankdeposit.component';
import { LetterTemplatesComponent } from './ehr-modules/letters/letter-templates/letter-templates.component';
import { LetterTemplatesSettingsComponent } from './ehr-modules/letters/letter-templates-settings/letter-templates-settings.component';
import { ReferralStaffNotesComponent } from './ehr-modules/patient/patient-referral-main/referral-staff-notes/referral-staff-notes.component';
import { ImportIcdCptComponent } from './billing-modules/claim/import-icd-cpt/import-icd-cpt.component';
import { EhrMessageInboxComponent } from './ehr-modules/messages/ehr-message-inbox/ehr-message-inbox.component';
import { EhrMessageComposeComponent } from './ehr-modules/messages/ehr-message-compose/ehr-message-compose.component';
import { PatientMessageComponent } from './ehr-modules/messages/patient-message/patient-message.component';
import { DirectMessageComponent } from './ehr-modules/messages/direct-message/direct-message.component';
import { PatientMessageInboxComponent } from './ehr-modules/messages/patient-message-inbox/patient-message-inbox.component';
import { MessagesService } from './services/messages/messages.service';
import { ClaimSuperBillComponent } from './billing-modules/claim/claim-super-bill/claim-super-bill.component';
import { SuperBillItemComponent } from './billing-modules/claim/claim-super-bill/super-bill-item/super-bill-item.component';
import { AddEditClaimNoteComponent } from './billing-modules/claim/claim-notes/add-edit-claim-note/add-edit-claim-note.component';
import { FaxReceivedComponent } from './ehr-modules/fax/fax-received/fax-received.component';
import { FaxSentComponent } from './ehr-modules/fax/fax-sent/fax-sent.component';
import { NewFaxComponent } from './ehr-modules/fax/new-fax/new-fax.component';
import { NewHealthMaintPopupComponent } from './ehr-modules/encounter/health-maintenance/new-health-maint-popup/new-health-maint-popup.component';
import { InlineLabTestSearchComponent } from './general-modules/inline-lab-test-search/inline-lab-test-search.component';
import { InlineLoincSearchComponent } from './general-modules/inline-loinc-search/inline-loinc-search.component';
import { ImplantableDevicesComponent } from './ehr-modules/encounter/implantable-devices/implantable-devices.component';
import { CashRegisterComponent } from './billing-modules/payment/cash-register/cash-register.component';
import { PatientPaymentComponent } from './billing-modules/payment/patient-payment/patient-payment.component';
import { PatientPaymentMainComponent } from './billing-modules/payment/patient-payment-main/patient-payment-main.component';
import { CashRegisterPrintComponent } from './billing-modules/payment/cash-register-print/cash-register-print.component';
import { ClaimPaymentComponent } from './billing-modules/payment/claim-payment/claim-payment.component';
import { TransferClaimPostedPatientPaymentComponent } from './billing-modules/payment/transfer-claim-posted-patient-payment/transfer-claim-posted-patient-payment.component';
import { PatientRefundsComponent } from './billing-modules/payment/patient-refunds/patient-refunds.component';
import { ClaimPostedPaymentDetailsComponent } from './billing-modules/payment/claim-posted-payment-details/claim-posted-payment-details.component';
import { CashRegisterModificationNotesComponent } from './billing-modules/payment/cash-register-modification-notes/cash-register-modification-notes.component';
import { AmendmentsComponent } from './ehr-modules/encounter/amendments/amendments.component';
import { CashRegisterModifyComponent } from './billing-modules/payment/cash-register-modify/cash-register-modify.component';
import { InlineFirmSearchComponent } from './general-modules/inline-firm-search/inline-firm-search.component';
import { BillingMainComponent } from './billing-modules/billing-main/billing-main.component';
import { BillingSummaryComponent } from './billing-modules/billing-summary/billing-summary.component';
import { EraComponent } from './billing-modules/era/era.component';
import { EobComponent } from './billing-modules/eob/eob.component';
import { AcaComponent } from './billing-modules/aca/aca.component';
import { InsuranceSetupComponent } from './billing-modules/insurance/insurance-setup/insurance-setup.component';
import { BillingReportsComponent } from './billing-modules/reports/reports.component';
import { SettingComponent } from './billing-modules/setting/setting.component';
import { AdministrationComponent } from './billing-modules/administration/administration.component';
import { AdminReportsComponent } from './billing-modules/reports/admin-reports/admin-reports.component';
import { ImportCashRegisterPaymentComponent } from './billing-modules/payment/import-cash-register-payment/import-cash-register-payment.component';
import { PostPatientWriteOffComponent } from './billing-modules/payment/post-patient-write-off/post-patient-write-off.component';
import { growthChartPercentileData } from './models/encounter/growthChartPercentileData';
import { ClaimPaymentEobEraInfoComponent } from './billing-modules/payment/claim-payment-eob-era-info/claim-payment-eob-era-info.component';
import { NewcropComponent } from './general-modules/newcrop/newcrop.component';
import { NewCropXML } from './shared/NewCropXML';
import { MailRecipientComponent } from './ehr-modules/messages/mail-recipient/mail-recipient.component';
import { AddVisComponent } from './ehr-modules/encounter/patient-immunization/add-vis/add-vis.component';
import { ListFilterGeneralNotIn } from './shared/filter-pipe-general-not-in';
import { DashboardRefillsComponent } from './ehr-modules/dashboard/dashboard-refills/dashboard-refills.component';
import { InsuranceTypeComponent } from './billing-modules/insurance/insurance-type/insurance-type.component';
import { InsurancePayerComponent } from './billing-modules/insurance/insurance-payer/insurance-payer.component';
import { InsuranceMainComponent } from './billing-modules/insurance/insurance-main/insurance-main.component';
import { ProviderPayersComponent } from './billing-modules/insurance/provider-payers/provider-payers.component';
import { MapInsuranceComponent } from './billing-modules/insurance/map-insurance/map-insurance.component';
import { PatientGrowthChartComponent } from './ehr-modules/encounter/patient-growth-chart/patient-growth-chart.component';
import { BirthWeightForAgeComponent } from './ehr-modules/encounter/patient-growth-chart/charts/birth-weight-for-age/birth-weight-for-age.component';
import { BirthLengthForAgeComponent } from './ehr-modules/encounter/patient-growth-chart/charts/birth-length-for-age/birth-length-for-age.component';
import { BirthHeadCircumferenceComponent } from './ehr-modules/encounter/patient-growth-chart/charts/birth-head-circumference/birth-head-circumference.component';
import { BirthWeightForLengthComponent } from './ehr-modules/encounter/patient-growth-chart/charts/birth-weight-for-length/birth-weight-for-length.component';
import { AdultWeightForAgeComponent } from './ehr-modules/encounter/patient-growth-chart/charts/adult-weight-for-age/adult-weight-for-age.component';
import { AdultStatureForAgeComponent } from './ehr-modules/encounter/patient-growth-chart/charts/adult-stature-for-age/adult-stature-for-age.component';
import { AdultBmiComponent } from './ehr-modules/encounter/patient-growth-chart/charts/adult-bmi/adult-bmi.component';
import { ImmunizationService } from './services/immunization.service';
import { UserIdleModule } from 'angular-user-idle';
import { SuperBillPrint } from './models/patient/superBill-print';
import { SettingMainComponent } from './ehr-modules/setting/setting-main/setting-main.component';
import { ImmunizationSettingComponent } from './ehr-modules/setting/immunization-setting/immunization-setting.component';
import { ImmunizationSetupComponent } from './ehr-modules/setting/immunization-setting/immunization-setup/immunization-setup.component';
import { ImmunizationInventorySetupComponent } from './ehr-modules/setting/immunization-setting/immunization-inventory-setup/immunization-inventory-setup.component';
import { AddEditInventoryComponent } from './ehr-modules/setting/immunization-setting/immunization-inventory-setup/add-edit-inventory/add-edit-inventory.component';
import { InlineTradeNameSearchComponent } from './general-modules/inline-trade-name-search/inline-trade-name-search.component';
import { ImmunizationRegistryUpdateMessagesComponent } from './ehr-modules/immunization-registry/immunization-registry-update-messages/immunization-registry-update-messages.component';
import { ImmunizationRegistryHistoryForecastMessagesComponent } from './ehr-modules/immunization-registry/immunization-registry-history-forecast-messages/immunization-registry-history-forecast-messages.component';
import { ImmunizationRegistryMessagesMainComponent } from './ehr-modules/immunization-registry/immunization-registry-messages-main/immunization-registry-messages-main.component';
import { AddToCorrespondenceComponent } from './ehr-modules/messages/add-to-correspondence/add-to-correspondence.component';
import { InfoCaptureComponent } from './ehr-modules/messages/info-capture/info-capture.component';
import { PatientNotesComponent } from './ehr-modules/patient/patient-notes/patient-notes.component';
import { TimelyAccessComponent } from './ehr-modules/patient/timely-access/timely-access.component';
import { UserService } from './services/user/user.service';
import { UserRolesComponent } from './ehr-modules/setting/user-setting/user-roles/user-roles.component';
import { EncounterSettingComponent } from './ehr-modules/setting/user-setting/encounter-setting/encounter-setting.component';
import { DashboardSettingComponent } from './ehr-modules/setting/user-setting/dashboard-setting/dashboard-setting.component';
import { AttorneySetupComponent } from './ehr-modules/setting/general-setup/attorney-setup/attorney-setup.component';
import { RefferingPhysicianSetupComponent } from './ehr-modules/setting/general-setup/reffering-physician-setup/reffering-physician-setup.component';
import { GuarantorSetupComponent } from './ehr-modules/setting/general-setup/guarantor-setup/guarantor-setup.component';
import { SuperbillSetupComponent } from './ehr-modules/setting/general-setup/superbill-setup/superbill-setup.component';
import { LabCategorySetupComponent } from './ehr-modules/setting/general-setup/lab-category-setup/lab-category-setup.component';
import { CdsSetupComponent } from './ehr-modules/setting/general-setup/cds-setup/cds-setup.component';
import { PayrollCategorySetupComponent } from './ehr-modules/setting/general-setup/payroll-category-setup/payroll-category-setup.component';
import { EncounterTemplateSetupComponent } from './ehr-modules/setting/general-setup/encounter-template-setup/encounter-template-setup.component';
import { ProviderSetupComponent } from './ehr-modules/setting/billing-setup/provider-setup/provider-setup.component';
import { BillingProviderSetupComponent } from './ehr-modules/setting/billing-setup/billing-provider-setup/billing-provider-setup.component';
import { LocationSetupComponent } from './ehr-modules/setting/billing-setup/location-setup/location-setup.component';
import { FacilitySetupComponent } from './ehr-modules/setting/billing-setup/facility-setup/facility-setup.component';
import { ApplicationSetupComponent } from './ehr-modules/setting/other-setup/application-setup/application-setup.component';
import { MylistSetupComponent } from './ehr-modules/setting/other-setup/mylist-setup/mylist-setup.component';
import { PatientCcdComponent } from './ehr-modules/patient/patient-ccd/patient-ccd.component';
import { GenerateImmRegHistoryForecastQueryMessageComponent } from './ehr-modules/immunization-registry/generate-imm-reg-history-forecast-query-message/generate-imm-reg-history-forecast-query-message.component';
import { GenerateImmRegUpdateMessageComponent } from './ehr-modules/immunization-registry/generate-imm-reg-update-message/generate-imm-reg-update-message.component';
import { GenerateSyndromicSurveillanceMessageComponent } from './ehr-modules/phs/generate-syndromic-surveillance-message/generate-syndromic-surveillance-message.component';
import { PHSService } from './services/phs.service';
import { ListFilterContainsAnyGeneral } from './shared/filter-pipe-contains-any-general';
import { DailyDepositMainComponent } from './ehr-modules/reports/daily-deposit/daily-deposit-main/daily-deposit-main.component';
import { FaxService } from './services/fax.service';
import { FaxContactsSetupComponent } from './ehr-modules/setting/general-setup/fax-contacts-setup/fax-contacts-setup.component';
import { AddEditFaxContactComponent } from './ehr-modules/setting/general-setup/fax-contacts-setup/add-edit-fax-contact/add-edit-fax-contact.component';
import { SortFilterPaginationService, NgbdSortableHeader } from './services/sort-filter-pagination.service';
import { CDSService } from './services/cds.service';
import { AdministrationModulesComponent } from './ehr-modules/setting/user-setting/user-roles/administration-modules/administration-modules.component';
import { PrivilegesComponent } from './ehr-modules/setting/user-setting/user-roles/privileges/privileges.component';
import { CdrRulesComponent } from './ehr-modules/setting/user-setting/user-roles/cdr-rules/cdr-rules.component';
import { SetupService } from './services/setup.service';
import { EncounterUserSettingComponent } from './ehr-modules/setting/user-setting/encounter-setting/encounter-user-setting/encounter-user-setting.component';
import { PatientMessagesComposeComponent } from './ehr-modules/messages/patient-messages-compose/patient-messages-compose.component';
import { FlexViewerComponent } from './general-modules/flex-viewer/flex-viewer.component';
import { CarePlanComponent } from './ehr-modules/encounter/care-plan/care-plan.component';
import { DischargeDispositionComponent } from './ehr-modules/encounter/discharge-disposition/discharge-disposition.component';
import { HelathConcernComponent } from './ehr-modules/encounter/helath-concern/helath-concern.component';
import { HealthConcernAddProblemComponent } from './ehr-modules/encounter/health-concern-add-problem/health-concern-add-problem.component';
import { AssessmentTreatmentPlanComponent } from './ehr-modules/encounter/assessment-treatment-plan/assessment-treatment-plan.component';
import { EncounterFaxObservable } from './services/observable/encounter-fax-observable';
import { ReferralViewersComponent } from './general-modules/referral-viewers/referral-viewers.component';
import { PrintDemographicsComponent } from './ehr-modules/patient/patient-info/print-demographics/print-demographics.component';
import { TemplateModuleComponent } from './ehr-modules/encounter/chart-template/template-module/template-module.component';
import { PatientApiUsersComponent } from './ehr-modules/setting/user-setting/patient-api-users/patient-api-users.component';
import { CqmReportComponent } from './ehr-modules/reports/cqm-report/cqm-report.component';
import { InlinePhrPatientSearchComponent } from './general-modules/inline-phr-patient-search/inline-phr-patient-search.component';
import { PatientMsgUserRecipientComponent } from './ehr-modules/messages/patient-msg-user-recipient/patient-msg-user-recipient.component';
import { ChartSessioninfoComponent } from './ehr-modules/encounter/chart-sessioninfo/chart-sessioninfo.component';
import { ChartClosingSummaryComponent } from './ehr-modules/encounter/chart-closing-summary/chart-closing-summary.component';
import { AddNewInsuranceComponent } from './ehr-modules/setting/general-setup/add-new-insurance/add-new-insurance.component';
import { InsuranceSetupSearchComponent } from './ehr-modules/setting/general-setup/insurance-setup-search/insurance-setup-search.component';
import { DymoLabelPrintComponent } from './general-modules/dymo-label-print/dymo-label-print.component';
import { MylistComponent } from './ehr-modules/setting/general-setup/mylist/mylist.component';
import { MylistIcdComponent } from './ehr-modules/setting/general-setup/mylist/mylist-icd/mylist-icd.component';
import { MylistCptComponent } from './ehr-modules/setting/general-setup/mylist/mylist-cpt/mylist-cpt.component';
import { ResetPasswordComponent } from './ehr-modules/setting/user-setting/reset-password/reset-password.component';
import { AcuCallsLogComponent } from './ehr-modules/scheduler/calls-log/acu-calls-log/acu-calls-log.component';
import { CallsLogComponent } from './ehr-modules/scheduler/calls-log/calls-log.component';
import { AppointmentCallsLogComponent } from './ehr-modules/scheduler/calls-log/appointment-calls-log/appointment-calls-log.component';
import { LogService } from './services/log.service';
import { RptAcuCallsComponent } from './ehr-modules/reports/rpt-acu-calls/rpt-acu-calls.component';
import { MergePatientComponent } from './ehr-modules/patient/merge-patient/merge-patient.component';
import { DepressionScreeningComponent } from './ehr-modules/encounter/depression-screening/depression-screening.component';
import { PatientAccessLogComponent } from './ehr-modules/log/patient-access-log/patient-access-log.component';
import { AuditLogComponent } from './ehr-modules/log/audit-log/audit-log.component';
import { EncounterAccessLogComponent } from './ehr-modules/log/encounter-access-log/encounter-access-log.component';
import { ImportIcdComponent } from './ehr-modules/encounter/lab/import-icd/import-icd.component';
import { LogPopUpComponent } from './ehr-modules/log/log-pop-up/log-pop-up.component';
import { ClaimNotesPopupComponent } from './billing-modules/claim/claim-notes-popup/claim-notes-popup.component';
import { AuthenticationPopupComponent } from './general-modules/authentication-popup/authentication-popup.component';
import { PatientPaymentPlanComponent } from './billing-modules/payment/patient-payment-plan/patient-payment-plan.component';
import { ModifyClaimStatusComponent } from './billing-modules/claim/modify-claim-status/modify-claim-status.component';
import { Rptlabresults_Print } from './models/lab/Rptlabresults_Print';
import { RefundPatientPaymentComponent } from './billing-modules/payment/refund-patient-payment/refund-patient-payment.component';
import { InlineFaxContactSearchComponent } from './general-modules/inline-fax-contact-search/inline-fax-contact-search.component';
import { PatientTaskDataComponent } from './ehr-modules/patient/patient-task-data/patient-task-data.component';
import { AddDocumentsCategoryComponent } from './ehr-modules/patient/add-documents-category/add-documents-category.component';
import { LastNoteComponent } from './ehr-modules/encounter/last-note/last-note.component';
import { FollowUpTaskComponent } from './ehr-modules/encounter/follow-up-task/follow-up-task.component';
import { rptLabRequisition } from './models/lab/rptLabRequisition';
import { excelService } from './shared/excelService';
import { AboutUsComponent } from './general-modules/about-us/about-us.component';
import { AddFaxToPatientDocumentsComponent } from './ehr-modules/fax/add-fax-to-patient-documents/add-fax-to-patient-documents.component';
import { AssignFaxComponent } from './ehr-modules/fax/assign-fax/assign-fax.component';
import { ProviderAuthenticationPopupComponent } from './general-modules/provider-authentication-popup/provider-authentication-popup.component';
import { UserAdminComponent } from './ehr-modules/setting/user-admin/user-admin.component';
import { UsersAdminSettingsComponent } from './ehr-modules/setting/users-admin-settings/users-admin-settings.component';
import { ClaimStatementComponent } from './billing-modules/statement/claim-statement/claim-statement.component';
import { HealthMaintDrugsComponent } from './ehr-modules/encounter/health-maintenance/health-maint-drugs/health-maint-drugs.component';
import { AutofocusDirective } from './shared/auto-focus.directive';
import { RptProviderPayrollComponent } from './ehr-modules/reports/rpt-provider-payroll/rpt-provider-payroll.component';
import { BillingService } from './services/billing/billing.service';
import { ClaimBatchDetailComponent } from './billing-modules/claim-batch-detail/claim-batch-detail.component';
import { RptProviderWiseCollectionComponent } from './billing-modules/reports/rpt-provider-wise-collection/rpt-provider-wise-collection.component';
import { RptDenialComponent } from './billing-modules/denial/rpt-denial/rpt-denial.component';
import { PaymentSummaryComponent } from './billing-modules/dashboard/payment-summary/payment-summary.component';
import { ClaimCountComponent } from './billing-modules/dashboard/claim-count/claim-count.component';
import { ClaimAgingComponent } from './billing-modules/dashboard/claim-aging/claim-aging.component';
import { ClaimDenialComponent } from './billing-modules/dashboard/claim-denial/claim-denial.component';
import { AddEditDenialComponent } from './billing-modules/denial/add-edit-denial/add-edit-denial.component';
import { RptSourceWiseCollectionComponent } from './billing-modules/reports/rpt-source-wise-collection/rpt-source-wise-collection.component';
import { RptAgingComponent } from './ehr-modules/reports/rpt-aging/rpt-aging.component';
import { RptClaimBatchDetailComponent } from './ehr-modules/reports/rpt-claim-batch-detail/rpt-claim-batch-detail.component';
import { RptCptWisePaymentComponent } from './ehr-modules/reports/rpt-cpt-wise-payment/rpt-cpt-wise-payment.component';
import { RptPayerWisePaymentComponent } from './ehr-modules/reports/rpt-payer-wise-payment/rpt-payer-wise-payment.component';
import { BillingUsersComponent } from './billing-modules/administration/billing-users/billing-users.component';
import { RptPaymentCollectionComponent } from './ehr-modules/reports/rpt-payment-collection/rpt-payment-collection.component';
import { RptClaimSummaryComponent } from './ehr-modules/reports/rpt-claim-summary/rpt-claim-summary.component';
import { RptCashregisterEntryComponent } from './ehr-modules/reports/rpt-cashregister-entry/rpt-cashregister-entry.component';
import { RptInvoiceComponent } from './ehr-modules/reports/rpt-invoice/rpt-invoice.component';
import { RptUserPerformanceComponent } from './ehr-modules/reports/rpt-user-performance/rpt-user-performance.component';
import { RptDailyMtdFinancialComponent } from './ehr-modules/reports/rpt-daily-mtd-financial/rpt-daily-mtd-financial.component';
import { ZipcitystateSettingsComponent } from './billing-modules/setting/zipcitystate-settings/zipcitystate-settings.component';
import { RestrictedCodeComponent } from './billing-modules/setup/restricted-code/restricted-code.component';
import { AdjustCodeComponent } from './billing-modules/setup/adjust-code/adjust-code.component';
import { procedureSetupComponent } from './billing-modules/setup/procedure/procedure-Setup.component';
import { DiagnosisSetupComponent } from './billing-modules/setup/diagnosis-setup/diagnosis-setup.component';
import { WriteOffSetupComponent } from './billing-modules/setup/write-off-setup/write-off-setup.component';
import { AdjustmentCodesGlossarayComponent } from './billing-modules/payment/adjustment-codes-glossaray/adjustment-codes-glossaray.component';
import { RptPatientStatementComponent } from './ehr-modules/reports/rpt-patient-statement/rpt-patient-statement.component';
import { PracticeSetupComponent } from './billing-modules/setup/practice-setup/practice-setup.component';
import { EraProviderAdjustmentComponent } from './billing-modules/era/era-provider-adjustment/era-provider-adjustment.component';
import { ClaimStatementLogComponent } from './billing-modules/statement/claim-statement-log/claim-statement-log.component';
import { EOBPatientPaymentComponent } from './billing-modules/payment/eobpatient-payment/eobpatient-payment.component';
import { RptCptWiseSummaryComponent } from './ehr-modules/reports/rpt-cpt-wise-summary/rpt-cpt-wise-summary.component';
import { RptProviderWorkComponent } from './ehr-modules/reports/rpt-provider-work/rpt-provider-work.component';
import { RptPatientNotpaidReasonComponent } from './ehr-modules/reports/rpt-patient-notpaid-reason/rpt-patient-notpaid-reason.component';
import { EncounterTemplateMainComponent } from './ehr-modules/setting/general-setup/encounter-template-main/encounter-template-main.component';
import { ProblemBasedTemplateSetupComponent } from './ehr-modules/setting/general-setup/problem-based-template-setup/problem-based-template-setup.component';
import { PracticeInsuranceComponent } from './billing-modules/insurance/practice-insurance/practice-insurance.component';
import { RptMchcComponent } from './billing-modules/reports/rpt-mchc/rpt-mchc.component';
import { ImportPatientInsuranceComponent } from './general-modules/insurance/import-patient-insurance/import-patient-insurance.component';
import { HcfaViewerComponent } from './billing-modules/hcfa/hcfa-viewer/hcfa-viewer.component';
import { RptHcfaClaimsComponent } from './billing-modules/reports/rpt-hcfa-claims/rpt-hcfa-claims.component';
import { HcfaPrintOptionPopupComponent } from './billing-modules/hcfa/hcfa-print-option-popup/hcfa-print-option-popup.component';
import { RptCssCallLogComponent } from './ehr-modules/reports/rpt-css-call-log/rpt-css-call-log.component';
import { SchedulerCardCompactComponent } from './ehr-modules/scheduler/scheduler-card-compact/scheduler-card-compact.component';
import { SchedulerMonthViewComponent } from './ehr-modules/scheduler/scheduler-month-view/scheduler-month-view.component';
import { SchedulerLocationViewComponent } from './ehr-modules/scheduler/scheduler-location-view/scheduler-location-view.component';
import { SchedulerProviderViewComponent } from './ehr-modules/scheduler/scheduler-provider-view/scheduler-provider-view.component';
import { AddEditEobComponent } from './billing-modules/eob/add-edit-eob/add-edit-eob.component';
import { TasksMainComponent } from './ehr-modules/tasks/tasks-main/tasks-main.component';
import { DashboardTasksComponent } from './ehr-modules/dashboard/dashboard-tasks/dashboard-tasks.component';
import { TasksComponent } from './ehr-modules/tasks/tasks/tasks.component';
import { ViewTaskComponent } from './ehr-modules/tasks/view-task/view-task.component';
import { AddTaskComponent } from './ehr-modules/tasks/add-task/add-task.component';
import { TasksService } from './services/tasks.service';
import { AddEditLocalPrescriptionComponent } from './ehr-modules/encounter/prescription/add-edit-local-prescription/add-edit-local-prescription.component';
import { MentalOfficetestComponent } from './ehr-modules/encounter/mental-officetest/mental-officetest.component';
import { PatientDataOnCheckedinComponent } from './ehr-modules/scheduler/patient-data-on-checkedin/patient-data-on-checkedin.component';
import { AddEditLocalAllergyComponent } from './ehr-modules/encounter/allergy/add-edit-local-allergy/add-edit-local-allergy.component';
import { RptPatientNotSeenComponent } from './ehr-modules/reports/rpt-patient-not-seen/rpt-patient-not-seen.component';
import { RptGeneralComponent } from './ehr-modules/reports/rpt-general/rpt-general.component';
import { RptCorrespondenceComponent } from './ehr-modules/reports/rpt-correspondence/rpt-correspondence.component';
import { EdiClaimStatusComponent } from './billing-modules/edi-claim-status/edi-claim-status.component';
import { EdiClaimStatusDetailComponent } from './billing-modules/edi-claim-status/edi-claim-status-detail/edi-claim-status-detail.component';
import { EdiClaimStatusDetailPopupComponent } from './billing-modules/edi-claim-status/edi-claim-status-detail-popup/edi-claim-status-detail-popup.component';
import { ExtenderTemplateComponent } from './ehr-modules/setting/general-setup/extender-template/extender-template.component';
import { ProviderWiseTemplatesComponent } from './ehr-modules/encounter/chart-template/provider-wise-templates/provider-wise-templates.component';
import { ProviderbaseTemplateMainComponent } from './ehr-modules/setting/general-setup/providerbase-template-main/providerbase-template-main.component';
import { RptMonthWiseChargesPaymentComponent } from './billing-modules/reports/rpt-month-wise-charges-payment/rpt-month-wise-charges-payment.component';
import { ChartDrugAbuseComponent } from './ehr-modules/encounter/chart-drug-abuse/chart-drug-abuse.component';
import { RptAgingTabComponent } from './ehr-modules/reports/rpt-aging-tab/rpt-aging-tab.component';
import { RptAgingPayerWiseComponent } from './ehr-modules/reports/rpt-aging-payer-wise/rpt-aging-payer-wise.component';
import { LaggedCollectionReportComponent } from './ehr-modules/reports/lagged-collection-report/lagged-collection-report.component';
import { RptDailyChargesPaymentSummaryComponent } from './billing-modules/reports/rpt-daily-charges-payment-summary/rpt-daily-charges-payment-summary.component';
import { RptDailyPaymentSummaryComponent } from './billing-modules/reports/rpt-daily-payment-summary/rpt-daily-payment-summary.component';
import { RptChargesPaymentMainComponent } from './billing-modules/reports/rpt-charges-payment-main/rpt-charges-payment-main.component';
import { RptProcedureAnalysisComponent } from './ehr-modules/reports/rpt-procedure-analysis/rpt-procedure-analysis.component';
import { PatientClaimReceiptPrintComponent } from './billing-modules/claim/patient-claim-receipt-print/patient-claim-receipt-print.component';
import { LoginComponent } from './login/login.component';
import { NavMainComponent } from './nav-main/nav-main.component';
import { HeaderMainComponent } from './header-main/header-main.component';
import { CcPaymentComponent } from './billing-modules/payment/cc-payment/cc-payment.component';

@NgModule({


  declarations: [
    AppComponent,
    LazyForDirective,
    EhrMainComponent,
    PatientSearchComponent, PatientMainComponent, PatientContentComponent, PatientSummaryComponent,
    DynamicTabsDirective, TabsComponent, TabComponent,
    PatientEncounterComponent, PatientLabsComponent, PatientDocumentsComponent,
    PatientReferralComponent, PatientLettersComponent, PatientCorrespondenceComponent,
    PatientPersonalInjuryComponent, PatientAppointmentsComponent, PatientConsultsComponent,
    DashboardMainComponent, MessagesMainComponent, SchedulerMainComponent, LabsMainComponent, LettersMainComponent, ReportsMainComponent, UserAdminMainComponent, FaxMainComponent, LogMainComponent, DashboardCashregisterComponent, DashboardPendingresultsComponent, DashboardCheckedinpatientComponent, DashboardPendingencounterComponent,
    PhonePipe, UniquePipe,
    SchedulerCardComponent,
    ListFilterPipe, ListFilterContainPipe, SummaryMedicationComponent, SummaryAllergiesComponent, SummaryProblemsComponent, SummaryAssessmentsComponent, SummaryVaccinationComponent, SummaryHealthMaintenanceComponent, SummarySurgeriesComponent, SummaryProceduresComponent, SummaryConceptionOutcomesComponent,
    DashboardUnreadmessagesComponent, DashboardUnreadfaxesComponent, DashboardPendingclaimsComponent, DashboardGyneddComponent, SummaryConsultsComponent, SummaryReferralsComponent, ConfirmationPopupComponent, PatientReferralMainComponent, PatientReferralRequestComponent, AppointmentPopupComponent, AlertPopupComponent, CheckInOutPopupComponent, RptAppointmentsComponent, EncounterReportComponent, DiagnosticReportComponent, RptEligibilityVerificationComponent,
    RptEncounterProcDiagComponent,
    ChartModuleTabsComponent, PatientAnnotationsComponent, VitalsComponent, ReasonforvisitHpiComponent, PatientProblemsComponent, PhysiciansCareComponent, CognitiveFunctionalHistoryComponent, EncounterMainComponent,
    FileUploadPopupComponent, SchedulerSettingsMainComponent, ProviderOfficeTimingComponent, ProviderTempOfficeTimingComponent, EncounterSnapshotComponent,
    LocationProviderSetupComponent, AppointmentSourceSettingComponent, AppointmentTypesSettingComponent, AppointmentStatusSettingComponent, RoomsSettingComponent, AppointmentRulesComponent, PatientEligibilityComponent, DocumentViewerComponent, EncounterPrintViewerComponent, FollowUpComponent, SocialHistoryComponent,
    CashRegisterComponent, PatientHtmlFormsViewerComponent, HealthcheckSignAuthenticationComponent, HealthCheckSummaryComponent, PatientDeleteNotesComponent, ChartModuleHistoryComponent, PatientPaymentComponent, PatientPaymentMainComponent, CashRegisterPrintComponent, InlinePatientSearchComponent, InlineDiagnosisSearchComponent,
    FileValidator, SafePipe, PatientImmunizationComponent, PatientInfoComponent, InlineRaceEthnicitySearchComponent, InlineInsuranceSearchComponent, InlineGuarantorSearchComponent, InlineRefPhysicianSearchComponent, NextOfKinPopupComponent, PatientInsuranceAddEditPopupComponent, PatientCareTeamAddEditPopupComponent, PatientCareTeamMemberAddEditPopupComponent, InlineSpecialitySearchComponent,
    OfficeTestComponent, OfficeTestComponent, InlinePatientSearchComponent, InlineDiagnosisSearchComponent,
    InlineLabtestSearchComponent, InlineDocCategorySearchComponent, RptPatientEligibilityComponent, RptDailyDepositComponent, RptEncounterCountComponent,
    LetterTemplatesComponent,
    PatientLabOrderSearchComponent, PatientLabOrderPendingComponent, PatientLabOrderSignedComponent, RptPatientLabOrderCumulativeComponent, PatientLabOrderFollowupComponent, UsersComponent, UserSettingComponent, GeneralSetupComponent, OtherSetupComponent, BillingSetupComponent, CameraCapturePopupComponent, AssessmentsComponent, SurgeryComponent, FamilyHistoryComponent, PrescriptionComponent, AllergyComponent, RosComponent, ProgressNotesComponent, ProcedureComponent, PhysicalExamComponent, InjuryTreatmentComponent, PreNatalComponent, AwvScreeningComponent, HealthMaintenanceComponent, FemaleExamComponent, AsthmaExamComponent, ReferralComponent, PmhComponent, LabSummaryComponent, LabOrderComponent, LabSpecimenComponent, LabResultComponent, LabAttachmentComponent, InlineDocumentCategorySearchComponent, RptCashRegisterComponent, RptCashRegYearlyCollectionComponent,
    InlineLabtestSearchComponent, InlineDocCategorySearchComponent,
    ReminderCallComponent, GynMissedVisitComponent, PregnancyRegisterComponent,
    RptPatientLabOrderCumulativeComponent, PatientLabOrderFollowupComponent, UsersComponent, UserSettingComponent,
    GeneralSetupComponent, OtherSetupComponent, BillingSetupComponent, CameraCapturePopupComponent, AssessmentsComponent,
    SurgeryComponent, FamilyHistoryComponent, PrescriptionComponent, AllergyComponent, RosComponent, ProgressNotesComponent,
    ProcedureComponent, PhysicalExamComponent, InjuryTreatmentComponent, PreNatalComponent, AwvScreeningComponent,
    HealthMaintenanceComponent, FemaleExamComponent, AsthmaExamComponent, ReferralComponent, PmhComponent,
    RptPatientEligibilityComponent, RptDailyDepositComponent, RptEncounterCountComponent,
    LabSummaryComponent, LabOrderComponent, LabSpecimenComponent, LabResultComponent, LabAttachmentComponent,
    DwtComponent,
    HealthMaintCommontestComponent,
    HealthMaintCustomtestComponent,
    HealthMaintOthertestComponent,
    HealthMaintVaccinationComponent,
    HealthMaintLipidComponent,
    PayerwisePatientComponent,
    InlinePayerSearchComponent,
    HealthMaintLipidComponent,
    PatientClaimComponent,
    ClaimPaymentComponent,
    ClaimNotesComponent,
    ClaimReminderComponent,
    RptClaimDetailComponent,
    RptPaymentCategoriesComponent,
    RptClaimDetailComponent,
    RptClaimDetailComponent,
    CrossReportComponent,
    InlineProcedureSearchComponent,
    TemplateMainComponent,
    TemplateComponent,
    ProblemBasedTemplateComponent,
    ProblemBasedTemplateSetupComponent,
    InlineImmunizationSearchComponent,
    RptClaimDetailComponent,
    ClaimProfessionalComponent,
    RptBankdepositComponent,
    LetterTemplatesComponent,
    LetterTemplatesSettingsComponent,
    NewPatientComponent,
    ClaimProfessionalComponent,
    ImportIcdCptComponent,
    ClaimSuperBillComponent,
    SuperBillItemComponent,
    ReferralStaffNotesComponent,
    ImportIcdCptComponent,
    EhrMessageInboxComponent,
    EhrMessageComposeComponent,
    PatientMessageComponent,
    DirectMessageComponent,
    PatientMessageInboxComponent,
    AddEditClaimNoteComponent, FaxReceivedComponent, FaxSentComponent, NewFaxComponent,
    listFilterWithNumericCondition,
    ImplantableDevicesComponent,
    TransferClaimPostedPatientPaymentComponent,
    NewHealthMaintPopupComponent, InlineLabTestSearchComponent, InlineLoincSearchComponent,
    InlineFirmSearchComponent, RefundPatientPaymentComponent, PatientRefundsComponent, ClaimPostedPaymentDetailsComponent, CashRegisterModificationNotesComponent, AmendmentsComponent, CashRegisterModifyComponent, ImportCashRegisterPaymentComponent, PostPatientWriteOffComponent,
    BillingMainComponent, BillingSummaryComponent, EraComponent, EobComponent, AcaComponent, InsuranceSetupComponent, BillingReportsComponent, SettingComponent, AdministrationComponent, AdminReportsComponent,
    MailRecipientComponent, AddVisComponent,
    ImportCashRegisterPaymentComponent, DashboardRefillsComponent, ClaimPaymentEobEraInfoComponent, NewcropComponent, PatientGrowthChartComponent, BirthWeightForAgeComponent, BirthLengthForAgeComponent, BirthHeadCircumferenceComponent, BirthWeightForLengthComponent, AdultWeightForAgeComponent, AdultStatureForAgeComponent, AdultBmiComponent,
    InsuranceTypeComponent, InsurancePayerComponent, InsuranceMainComponent, ProviderPayersComponent, MapInsuranceComponent, SettingMainComponent, ImmunizationSettingComponent, ImmunizationSetupComponent, ImmunizationInventorySetupComponent, AddEditInventoryComponent, InlineTradeNameSearchComponent, ImmunizationRegistryUpdateMessagesComponent, ImmunizationRegistryHistoryForecastMessagesComponent, ImmunizationRegistryMessagesMainComponent, TimelyAccessComponent, UserRolesComponent, EncounterSettingComponent, DashboardSettingComponent, AttorneySetupComponent, RefferingPhysicianSetupComponent, GuarantorSetupComponent, SuperbillSetupComponent, LabCategorySetupComponent, CdsSetupComponent, PayrollCategorySetupComponent, EncounterTemplateSetupComponent, ProviderSetupComponent, BillingProviderSetupComponent, LocationSetupComponent, FacilitySetupComponent, ApplicationSetupComponent, MergePatientComponent, MylistSetupComponent, PatientCcdComponent, GenerateImmRegHistoryForecastQueryMessageComponent, GenerateImmRegUpdateMessageComponent, GenerateSyndromicSurveillanceMessageComponent,
    InlinePhrPatientSearchComponent, PatientMsgUserRecipientComponent, ChartSessioninfoComponent, ChartClosingSummaryComponent, AddNewInsuranceComponent, InsuranceSetupSearchComponent,
    ListFilterGeneral, ListFilterGeneralNotIn, ListFilterContainsAnyGeneral, DailyDepositMainComponent, ListFilterContainThreeColumns, FaxContactsSetupComponent, AddEditFaxContactComponent,
    NgbdSortableHeader, PatientNotesComponent, AdministrationModulesComponent, PrivilegesComponent, CdrRulesComponent, EncounterUserSettingComponent, AddToCorrespondenceComponent, InfoCaptureComponent, PatientMessagesComposeComponent, FlexViewerComponent, CarePlanComponent, DischargeDispositionComponent, HelathConcernComponent, HealthConcernAddProblemComponent, AssessmentTreatmentPlanComponent, PrintDemographicsComponent, TemplateModuleComponent, ReferralViewersComponent, PatientApiUsersComponent, CqmReportComponent, DymoLabelPrintComponent, AcuCallsLogComponent, CallsLogComponent, AppointmentCallsLogComponent, RptAcuCallsComponent,
    MylistComponent, MylistIcdComponent, MylistCptComponent, ResetPasswordComponent, PatientAccessLogComponent, AuditLogComponent, EncounterAccessLogComponent, ImportIcdComponent, DepressionScreeningComponent, LogPopUpComponent, ClaimNotesPopupComponent, AuthenticationPopupComponent, PatientPaymentPlanComponent, ModifyClaimStatusComponent, InlineFaxContactSearchComponent, AddDocumentsCategoryComponent, PatientTaskDataComponent, LastNoteComponent, FollowUpTaskComponent, AboutUsComponent, AddFaxToPatientDocumentsComponent, AssignFaxComponent, ProviderAuthenticationPopupComponent, UsersAdminSettingsComponent, ImportPatientInsuranceComponent, UserAdminComponent, ClaimStatementComponent, HealthMaintDrugsComponent,
    AutofocusDirective, RptProviderPayrollComponent, ClaimBatchDetailComponent, RptProviderWiseCollectionComponent, RptDenialComponent, PaymentSummaryComponent, ClaimCountComponent, ClaimAgingComponent, ClaimDenialComponent, AddEditDenialComponent, RptSourceWiseCollectionComponent, RptAgingComponent, RptClaimBatchDetailComponent, BillingUsersComponent, RptCptWisePaymentComponent, RptPayerWisePaymentComponent, RptPaymentCollectionComponent, RptClaimSummaryComponent, RptCashregisterEntryComponent, RptInvoiceComponent, RptUserPerformanceComponent, RptDailyMtdFinancialComponent, RestrictedCodeComponent, AdjustCodeComponent, procedureSetupComponent, DiagnosisSetupComponent, WriteOffSetupComponent, AdjustmentCodesGlossarayComponent, ZipcitystateSettingsComponent, PracticeSetupComponent,
    AdjustmentCodesGlossarayComponent, EraProviderAdjustmentComponent, RptPatientStatementComponent, ClaimStatementLogComponent, RptCptWiseSummaryComponent, RptProviderWorkComponent,EOBPatientPaymentComponent, RptPatientNotpaidReasonComponent,    
    EncounterTemplateMainComponent, PracticeInsuranceComponent,RptMchcComponent, HcfaViewerComponent, RptHcfaClaimsComponent, HcfaPrintOptionPopupComponent, RptCssCallLogComponent, SchedulerCardCompactComponent, SchedulerMonthViewComponent, SchedulerLocationViewComponent, SchedulerProviderViewComponent, AddEditEobComponent, 
    TasksMainComponent, AddTaskComponent, ViewTaskComponent, AddEditEobComponent, TasksComponent, DashboardTasksComponent, AddEditLocalPrescriptionComponent,MentalOfficetestComponent, AddEditLocalAllergyComponent, PatientDataOnCheckedinComponent, RptPatientNotSeenComponent, RptGeneralComponent,EdiClaimStatusComponent, EdiClaimStatusDetailComponent, EdiClaimStatusDetailPopupComponent, RptCorrespondenceComponent, ProviderWiseTemplatesComponent,ProviderbaseTemplateMainComponent, ExtenderTemplateComponent,RptMonthWiseChargesPaymentComponent, ChartDrugAbuseComponent, RptAgingTabComponent, RptAgingPayerWiseComponent,RptDailyChargesPaymentSummaryComponent, RptDailyPaymentSummaryComponent, RptChargesPaymentMainComponent,LaggedCollectionReportComponent, RptProcedureAnalysisComponent, 
    PatientClaimReceiptPrintComponent, LoginComponent, NavMainComponent, HeaderMainComponent, CcPaymentComponent
  ],
  imports: [
    TreeviewModule.forRoot(),
    UserIdleModule.forRoot({ idle: 10, timeout: 5, ping: 1 }),
    BrowserModule, BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    routing,
    AppConfigModule,
    LookupListModule,
    ChartsModule,
    ColorPickerModule,
    //TreeModule,
    NgMultiSelectDropDownModule,
    NgbModule.forRoot(),
    TreeModule.forRoot(),
    FormsModule, TextareaAutosizeModule,
    QuillModule.forRoot({
      modules: {
        syntax: false,
        toolbar: [['bold', 'italic', 'underline'],
        [{ 'size': ['small', true, 'large', 'huge'] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'font': ['Arial'] }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }]
        ]
      }
    }),
    CommonModule
  ],
  providers: [
    LoadStartupService,
    UserApplicationRights,
    Chartreport_Print,
    SuperBillPrint,
    DischargeSummary,
    ReferralService,
    GeneralOperation,
    LetterService,
    ClaimService,
    EncounterService,
    GeneralService,
    DashboardService,
    PatientService,
    OpenModuleService,
    AuthService,
    SchedulerService,
    ReportsService,
    SchedulerLoadedObservable,
    DateTimeUtil,
    ListFilterPipe,
    ListFilterContainPipe,
    ListFilterContainThreeColumns,
    ListFilterGeneral,
    ListFilterGeneralNotIn,
    LogMessage,
    EligibilityService,
    PaymentService,
    OpenedPatientInfo,
    CurrencyPipe, DecimalPipe,
    SearchService,
    LabService, PagerService,
    PatientInfoComponent,
    MessagesService,
    PatientSearchObservable,
    EncounterFaxObservable,
    growthChartPercentileData,
    NewCropXML,
    listFilterWithNumericCondition,
    CDSService,
    UserService,
    ImmunizationService,
    SetupService,
    PHSService,
    FaxService,
    SortFilterPaginationService,
    Rptlabresults_Print,
    rptLabRequisition,
    excelService,
    InsurancesService,
    LogService, 
    BillingService,
    TasksService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: NgbDateParserFormatter,
      useClass: NgbDateFRParserFormatter
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [TabComponent, ConfirmationPopupComponent, AppointmentPopupComponent, CheckInOutPopupComponent, AlertPopupComponent, FileUploadPopupComponent, EncounterSnapshotComponent, DocumentViewerComponent, PatientEligibilityComponent,
    EncounterPrintViewerComponent, PatientHtmlFormsViewerComponent, HealthcheckSignAuthenticationComponent, CashRegisterComponent, HealthCheckSummaryComponent, PatientDeleteNotesComponent, ChartModuleHistoryComponent, NextOfKinPopupComponent,
    PatientInsuranceAddEditPopupComponent, PatientCareTeamAddEditPopupComponent, PatientCareTeamMemberAddEditPopupComponent, CameraCapturePopupComponent, DwtComponent, TemplateMainComponent, ReferralStaffNotesComponent, AddEditClaimNoteComponent,
    AddEditInventoryComponent,
    TransferClaimPostedPatientPaymentComponent,
    PatientMsgUserRecipientComponent, ChartClosingSummaryComponent,
    NewHealthMaintPopupComponent, RefundPatientPaymentComponent, ClaimPostedPaymentDetailsComponent, CashRegisterModificationNotesComponent, AmendmentsComponent, CashRegisterModifyComponent, ImportCashRegisterPaymentComponent, PostPatientWriteOffComponent, ClaimPaymentEobEraInfoComponent, NewcropComponent, AddVisComponent, TimelyAccessComponent,
    PatientCcdComponent, GenerateImmRegUpdateMessageComponent, GenerateImmRegHistoryForecastQueryMessageComponent, GenerateSyndromicSurveillanceMessageComponent, AddEditFaxContactComponent, PatientNotesComponent, MailRecipientComponent, AddToCorrespondenceComponent, HealthConcernAddProblemComponent, PrintDemographicsComponent, ReferralViewersComponent, DymoLabelPrintComponent, CallsLogComponent,
    ResetPasswordComponent, ImportIcdComponent, LogPopUpComponent, ClaimNotesPopupComponent, AuthenticationPopupComponent, PatientPaymentPlanComponent, ModifyClaimStatusComponent, AddDocumentsCategoryComponent,
    PatientTaskDataComponent, LastNoteComponent, FollowUpTaskComponent, NewFaxComponent, AboutUsComponent, AddFaxToPatientDocumentsComponent, AssignFaxComponent, ClaimSuperBillComponent, ProviderAuthenticationPopupComponent
    , ClaimStatementComponent, ClaimBatchDetailComponent, AddEditDenialComponent, AdjustmentCodesGlossarayComponent, EraProviderAdjustmentComponent,ClaimStatementLogComponent,EOBPatientPaymentComponent,    
    ImportPatientInsuranceComponent,HcfaViewerComponent,HcfaPrintOptionPopupComponent,
    AddEditEobComponent,AddTaskComponent,ViewTaskComponent,AddEditLocalPrescriptionComponent,AddEditLocalAllergyComponent,PatientDataOnCheckedinComponent,EdiClaimStatusDetailPopupComponent,PatientClaimReceiptPrintComponent
  ]
})

export class AppModule {

}

