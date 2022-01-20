export enum ServiceResponseStatusEnum {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  NOT_ALLOWED = "NOT_ALLOWED",
  CONFIRMATION_REQUIRED = "CONFIRMATION_REQUIRED",
  NOT_FOUND = "NOT_FOUND",
  AUTHORIZED = "AUTHORIZED",
  UNAUTHORIZED = "UNAUTHORIZED",
}

export enum AlertTypeEnum {
  INFO = "info",
  DANGER = "danger",
  WARNING = "warning",
  PRIMARY = "primary",
  SUCCESS = "success"
}

export enum PromptResponseEnum {
  OK = "OK",
  YES = "YES",
  NO = "NO",
  CANCEL = "CANCEL",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export enum RegExEnum {
  PHONE = "\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}",
  Currency = "^\\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9][0-9])?$",//"([1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|\.[0-9]{1,2})",  
  PositiveWholeNumber = "^(0|[1-9][0-9]*)$",
  //NDC="\d{4}-\d{4}-\d{2}|\d{5}-\d{3}-\d{2}|\d{5}-\d{4}-\d{1}|\d{5}-\*\d{3}-\d{2}",
  NDC = "^[0-9]{4}-[0-9]{4}-[0-9]{2}$|^[0-9]{5}-[0-9]{3}-[0-9]{2}$|^[0-9]{5}-[0-9]{4}-[0-9]{1}$|^[0-9]{5}-\\*[0-9]{3}-[0-9]{2}$|^[0-9]{11}$",
  VACCINE_NDC_11 = "^[0-9]{5}-[0-9]{4}-[0-9]{2}$|^[0-9]{11}$",
  EitherWholeNumberOrDecimalWithTwoPoints="^[0-9]+(\.[0-9]{1,2})?$"
}


export enum MainTabsEnum {
  HOME = "home-tab-main",
  SCHEDULER = "scheduelr-tab-main",
  PATIENT = "patient-tab-main",
  MESSAGES = "messages-tab-main",
  LABS = "labs-tab-main",
  LETTERS = "letters-tab-main",
  REPORTS = "reports-tab-main",
  ADMIN = "admin-tab-main",
  USERADMIN = "user-admin-tab-main",
  FAX = "fax-tab-main",
  LOG = "log-tab-main"
}

export enum PatientSubTabsEnum {
  SUMMARY = "tab-summary",
  ENCOUNTER = "tab-encounter",
  CLAIM = "tab-claim",
  LABS = "tab-results",
  DOCUMENTS = "tab-documents",
  REFERRAL = "tab-referral",
  CONSULTS = "tab-consults",
  LETTERS = "tab-letter",
  CORRESPONDANCE = "tab-correspondance",
  INJURY = "tab-injury",
  APPOINTMENTS = "tab-appointment"
}


export enum CallingFromEnum {
  PATIENT = "patient",
  SCHEDULER = "scheduler",
  SCHEDULER_MONTH_VIEW = "scheduler_month_view",
  PATIENT_SEARCH = "patient_search",
  PATIENT_CLAIM = "patient_claim",
  CALIM_NOTES = "claim_notes",
  CLAIM_ENTRY = "claim_entry",
  CLAIM_PAYMENT = "claim_payment",
  CASH_REGISTER = "cash_register",
  SETTINGS = "settings",
  SCHEDULER_PATIENT_APPOINTMENT_REPORT = "scheduler_patient_appiontment_report",
  ENCOUNTER = "encounter",
  LOG = "log",
  REPORTS = "reports",
  BILLING_REPORTS = "billing_reports",
  DASHBOARD = "dashboard",
  FAX = "fax",
  Billing_Summary = 'billing_summary',
  ERA = 'era',
  EOB = 'eob',
  DENIAL = 'denial',
  TASK = 'task',
  user_admin ='user_admin',
  EDI_CLAIM_STATUS ='edi_claim_status',
  ADMIN_MAIN = "admin_main"
}

export enum ScanDocumentType {
  ID_CARD = "id_card",
  DRIVING_LICENSE = "driving_license",
  PATIENT_AGREEMENT = "patient_agreement",
  INSURANCE_CARD = "insurance_card",
  PATIENT_DOCUMENT = "patient_document",
}

export enum DiagnosisCodeType {
  ICD_10 = "ICD-10",
  ICD_9 = "ICD-9",
  SNOMED_CT = "SnomedCT"
}
export enum ProcedureSearchType {
  ALL = "all",
  SUPER_BILL = "super-bill",
  CPT = "cpt",
  SNOMED_CT = "snomedct"
}

export enum OperationType {
  ADD = "add",
  EDIT = "edit",
  DELETE = "delete",
}

export enum claimType {
  PROFESSIONAL = "P",
  INSTITUTIONAL = "I"
}


export enum EobEraTypeEnum {
  ERA = "ERA",
  EOB = "EOB",
  CASH_REGISTER = "CASH_REGISTER"
}

export enum ImmunizationEntryTypeEnum {
  ADMINISTERED = "administered",
  HISTORICAL = "historical",
  REFUSED = "refused"
}

export enum VitalsUnitEnum {
  US_CUSTOMARY = "us_customary",
  METRIC = "metric"
}

export enum VitalsUnitConversionEnum {
  OZ_TO_LBOZ = "oz_to_lboz",
  G_TO_KGG = "g_to_kgg",
  G_TO_LBOZ = "g_to_lboz",
  OZ_TO_KGG = "oz_to_kgg",
  IN_TO_FTIN = "in_to_ftin",
  FT_TO_CM = "ft_to_cm",
  IN_TO_CM = "in_to_cm",
  CM_TO_IN = "cm_to_in",
  DEGREE_F_TO_DEGREE_C = "degree_f_to_degree_c",
  DEGREE_C_TO_DEGREE_F = "degree_c_to_degree_f",
}

export enum DymoLbelPrintType {
  PATIENT_CHART_LABEL = "PATIENT_CHART_LABEL",
  PATIENT_MAILING_LABEL = "PATIENT_MAILING_LABEL",
  LAB_ORDER_SPECIMENT_LABEL = "LAB_ORDER_SPECIMENT_LABEL",
}

export enum FaxAttachemntsTypeEnum {
  MULTI_PART = "multi_part",
  HTML_STRING = "html_string",
  TEMP_FILE = "temp_file",
  REFERENCED_DOCUMENT = "referenced_document"
}

export enum PaymentPostingOptionEnum {
  CPT_WISE = "cpt_wise",
  FULL_ERA = "full_era"
}

export enum SubmissionMethodEnum {
  HCFA = "HCFA",
  ELECTRONIC = "ELECTRONIC"
}

export enum SchedulerViewType {
  NORMAL_VIEW = "NORMAL_VIEW",
  LOCATION_VIEW = "LOCATION_VIEW",
  PROVIDER_VIEW = "PROVIDER_VIEW",
  MONTH_VIEW = "MONTH_VIEW"  
}

export enum WeekDaysEnum {
  SUNDAY = "Sunday",
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday"
}

export enum FaxServerEnum {
  FAXAGE = "FAXAGE",
  MFAX = "MFAX"
}

export enum CCPaymentServiceNameEnum {
  HEARTLAND_PAYMENT_SYSTEMS = "HEARTLAND PAYMENT SYSTEMS"
}