import { Injectable } from "@angular/core";

@Injectable()
export class UserApplicationRights {

    ViewReasonforVisit: boolean = false;
    AddModifyReasonforVisit: boolean = false;

    ViewVitalSigns: boolean = false;
    AddModifyVitalSign: boolean = false;
    QuickVitalDefault: boolean = false;

    ViewSurgeries: boolean = false;
    AddModifySurgeries: boolean = false;

    ViewImmunization: boolean = false;
    AddModifyImmunization: boolean = false;

    ViewPMH: boolean = false;
    AddModifyPMH: boolean = false;

    ViewAssessment: boolean = false;
    AddModifyAssessment: boolean = false;

    ViewAllergies: boolean = false;
    AddModifyAllergies: boolean = false;

    ViewProblemList: boolean = false;
    AddModifyProblemList: boolean = false;

    ViewFamilyHx: boolean = false;
    AddModifyFamilyHx: boolean = false;

    ViewSocialHx: boolean = false;
    AddModifySocialHx: boolean = false;

    ViewAnnotation: boolean = false;
    AddModifyAnnotation: boolean = false;

    ViewMedication: boolean = false;
    AddModifyMedication: boolean = false;
    deleteMedication: boolean = false;

    ViewProgressNote: boolean = false;
    AddModifyProgressNote: boolean = false;

    ViewCognitive: boolean = false;
    AddModifyCognitive: boolean = false;

    ViewROS: boolean = false;
    AddModifyROS: boolean = false;

    ViewPE: boolean = false;
    AddModifyPE: boolean = false;

    ViewOfficeTest: boolean = false;
    AddModifyOfficeTest: boolean = false;

    ViewHealthCheck: boolean = false;
    AddModifyHealthCheck: boolean = false;

    ViewChildhoodExam: boolean = false;
    AddModifyChildhoodExam: boolean = false;

    ViewSessionInfo: boolean = false;
    AddModifySessionInfo: boolean = false;

    ViewAnnualWellness: boolean = false;
    AddModifyAnnualWellness: boolean = false;

    ViewCarePlan: boolean = false;
    AddModifyCarePlan: boolean = false;

    ViewDischargeDisposition: boolean = false;
    AddModifyDischargeDisposition: boolean = false;

    ViewReferral: boolean = false;
    AddModifyReferral: boolean = false;

    ViewHealthMaint: boolean = false;
    AddModifyHealthMaint: boolean = false;

    ViewDepressionScreening: boolean = false;
    AddModifyDepressionScreening: boolean = false;

    ViewAmendments: boolean = false;
    AddModifyAmendments: boolean = false;

    CanAddChart: boolean = false;
    CanPrintChart: boolean = false;
    CanSignChart: boolean = false;
    CanCosign: boolean = false;
    CanDeleteChart: boolean = false;
    canViewChart: boolean = false;
    createchart: boolean = false;
    CanModifySignChart: boolean = false;
    CanUnSignChart: boolean = false;

    claim_view: boolean = false;
    claim_edit: boolean = false;
    claim_delete: boolean = false;
    claim_draft_edit: boolean = false;
    claim_edit_billed: boolean = false;
    view_patient_claim: boolean = false;


    claim_status_edit: boolean = false;
    


    payment_view: boolean = false;
    payment_add: boolean = false;
    patient_eob_payment: boolean = false;

    post_full_era: boolean = false;
    mark_era_as_posted: boolean = false;

    claim_batch_new_batch: boolean = false;
    claim_batch_addin_batch: boolean = false;
    claim_batch_upload: boolean = false;
    claim_batch_getresponse: boolean = false;

    era_import: boolean = false;
    era_delete: boolean = false;
    eob_new: boolean = false;
    eob_edit: boolean = false;
    eob_delete: boolean = false;
    eob_markas_posted: boolean = false;


    scheduler_view: boolean = false;
    scheduler_edit: boolean = false;
    scheduler_delete: boolean = false;
    scheduler_view_settings: boolean = false;

    patient_view: boolean = false;
    patient_edit: boolean = false;
    patient_delete: boolean = false;
    phr_access: boolean = false;


    patient_ins_delete: boolean = false;
    patient_ins_edit: boolean = false;
    patient_ins_view: boolean = false;
    patient_ins_add: boolean = false;



    document_delete: boolean = false;
    document_edit: boolean = false;
    document_view: boolean = false;
    document_add: boolean = false;


    message_delete: boolean = false;
    message_send: boolean = false;
    message_view: boolean = false;

    // Lab Order---------------------------------------------------------
    lab_order_search: boolean = false;
    lab_result_search: boolean = false;
    lab_order_view: boolean = false;
    lab_order_add_modify: boolean = false;
    lab_order_delete: boolean = false;
    lab_order_sign: boolean = false;
    lab_order_add_test: boolean = false;
    lab_result_view: boolean = false;
    lab_result_add_modify: boolean = false;
    lab_result_delete: boolean = false;
    lab_results_modify_signed: boolean = false;
    lab_attachments_view_upload: boolean = false;
    lab_result_sign: boolean = false;
    lab_result_cummulative: boolean = false;
    lab_order_modify_info: boolean = false;
    lab_attachment_view: boolean = false;
    lab_attachment_edit: boolean = false;
    //----------------------------------------------------------------------

    viewPlanOfCareNotes: boolean = false;
    AddModifyPlanOfCareNotes: boolean = false;
    AmendCharts: boolean = false;
    viewChartAmendments: boolean = false;


    dashboard_result: boolean = false;
    dashboard_checkedin: boolean = false;
    dashboard_cashregster: boolean = false;
    dashboard_claim: boolean = false;
    dashboard_message: boolean = false;
    dashboard_fax: boolean = false;
    dashboard_prescription: boolean = false;

    cashregister_view: boolean = false;
    cashregister_add: boolean = false;
    cashregister_modify: boolean = false;
    cashregister_delete: boolean = false;
    cashregister_void: boolean = false;

    setting: boolean = false;
    administration: boolean = false;
    documentPoral: boolean = false;
    //reports
    rptencounter: boolean = false;
    rptdiagnostic: boolean = false;
    rptCashRegister: boolean = false;
    rptappointment: boolean = false;
    rptnqf: boolean = false;
    rptpatientlist: boolean = false;
    rptphslog: boolean = false;
    rptdymanic: boolean = false;
    rptautomeasure: boolean = false;
    rptcptamt: boolean = false;
    rptworkReport: boolean = false;
    rptHcfa: boolean = false;
    ClaimSummaryReport: boolean = false;
    rptPatientEligibility: boolean = false;
    rptpayroll: boolean = false;
    rptclaimDetail: boolean = false;
    rptSourceWiseCollection: boolean = false;
    rptCrossreport: boolean = false;
    rptEncounterCount: boolean = false;
    rptPaymentCateogry: boolean = false;
    rptPatientLastVisit: boolean = false;
    rptNotPaidReason: boolean = false;
    rptNewPatient: boolean = false;
    rptReminderCall: boolean = false;
    rptGynMissedVisit: boolean = false;
    rptPregnencyRegister: boolean = false;
    rptPayerWisePatient: boolean = false;
    rptACO: boolean = false;


    //docuemnt category
    documentCategory_Add: boolean = false;
    documentCategory_Modify: boolean = false;
    documentCategory_Delete: boolean = false;
    //Fax
    fax_Download: boolean = false;
    fax_enable: boolean = false;
    fax_new: boolean = false;
    fax_sent: boolean = false;
    fax_other_users: boolean = false;
    //Patient Alert
    edit_patient_alerts: boolean = false;
    add_patient_alerts: boolean = false;

    letter_view: boolean = false;
    letter_addmodify: boolean = false;
    letter_delete: boolean = false;

    template_addmodify: boolean = false;
    template_delete: boolean = false;

    patient_log_view: boolean = false;
    view_reports: boolean = false;

    //user administration
    user_adminstration: boolean = false;

    //--Patient Notes
    pat_staffnotes: boolean = false;
    pat_phynotes: boolean = false;
    pat_delnotes: boolean = false;

    //--Others
    canViewOverSecurityButton: boolean = false;
    view_patient_messages: boolean = false;

    

    Add_insurance: boolean = false;
    Edit_insurance: boolean = false;
    insurance_delete: boolean = false;

    insurance_payer_type_add: boolean = false;
    insurance_payer_type_edit: boolean = false;
    insurance_payer_type_delete: boolean = false;

    insurance_payer_add: boolean = false;
    insurance_payer_edit: boolean = false;
    insurance_payer_delete: boolean = false;

    provider_payer_add: boolean = false;
    provider_payer_edit: boolean = false;
    provider_payer_delete: boolean = false;

    provider_add: boolean = false;
    provider_edit: boolean = false;
    provider_delete: boolean = false;

    billing_provider_add: boolean = false;
    billing_provider_edit: boolean = false;
    billing_provider_delete: boolean = false;

    refferring_provider_add: boolean = false;
    refferring_provider_edit: boolean = false;
    refferring_provider_delete: boolean = false;

    location_add: boolean = false;
    location_edit: boolean = false;
    location_delete: boolean = false;

    guarantor_add: boolean = false;
    guarantor_edit: boolean = false;
    guarantor_delete: boolean = false;

    superbill_add: boolean = false;
    superbill_edit: boolean = false;
    superbill_delete: boolean = false;

    facility_add: boolean = false;
    facility_edit: boolean = false;
    facility_delete: boolean = false;

    active_pat_ins: boolean = false;
    denial_resolve: boolean = false;

    //Patient Statement
    patient_statement_view: boolean = false;
    patient_statement_generate: boolean = false;
    patient_statement_download: boolean = false;


    cds_edit: boolean = false;

    view_ticket: boolean = false;
    add_ticket: boolean = false;

    cashregister_check_bounce: boolean = false;

    payment_refund: boolean = false;

    payroll_setting: boolean = false;

    mark_as_created: boolean = false;


    ViewrptBankDeposit: boolean = false;
    ViewrptBillingAging: boolean = false;
    ViewrptClaimBatch: boolean = false;
    ViewrptCPTWisePayment: boolean = false;
    ViewrptDailyDeposit: boolean = false;
    ViewrptDenial: boolean = false;
    ViewrptEligibilityVerification: boolean = false;
    ViewrptPaymentSummary: boolean = false;

    delete_referral: boolean = false;

    view_correspondence: boolean = false;
    view_personal_injury: boolean = false;
    view_consults: boolean = false;

    view_billing: boolean = false;

    immunization_registry: boolean = false;

    add_edit_immunization_inventory: boolean = false;
    Template_setup: boolean = false;
    change_assessment_to_PMH: boolean = false;


    extender_notes_view: boolean = false;
    extender_notes_edit: boolean = false;

    extender_template_view: boolean = false;
    extender_template_edit: boolean = false;

    GeneralReport: boolean = false;
    CorrespondenceReport: boolean = false;

    ViewDrugAbuse: boolean = false;
    AddModifyDrugAbuse: boolean = false;
}