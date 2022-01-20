import { NgModule, InjectionToken } from '@angular/core';
import { LogedInUser } from './loged-in-user';
import { PracticeInfo } from './practice-info';
import { UserApplicationRights } from '../shared/UserApplicationRights';
import { DocumentTreeModel } from '../models/general/document-tree-model';
import { CCPaymentServiceNameEnum, FaxServerEnum } from '../shared/enum-util';

export let LOOKUP_LIST = new InjectionToken<LookupList>('app.config');

export class LookupList {
  isEhrDataLoad: boolean;
  isEhrLocked: boolean;
  loginWithOverrideRigts: boolean;
  practiceInfo: PracticeInfo;
  logedInUser: LogedInUser;
  providerList: Array<any>;
  locationList: Array<any>;
  listpracticeUserName: Array<any>;
  practiceUsersList: Array<any>;
  appStatusList: Array<any>;
  appTypesList: Array<any>;
  appReasonsList: Array<any>;
  lstUserChartModuleSetting: Array<any>;
  appSourcesList: Array<any>;
  lstDocumentCategory: Array<any>;
  lstDocumentCategoryList: Array<any>;
  lstdocumentPath: Array<any>;
  lstLabCategory: Array<any>;
  UserRights: UserApplicationRights;
  lstPracticeWriteOffCodes: Array<any>;
  authorizationUsers:any; // lstAuthorizationUsers: Array<any>;  
  lstMaritalStatus: Array<any>;
  lstGender: Array<any>;
  arrLabStatus: Array<any>;
  lstLanguages: Array<any>;
  lstGenderIdentity: Array<any>;
  lstSexualOrientation: Array<any>;
  lstOMBRace: Array<any>;
  lstOMBEthnicity: Array<any>;
  lstSubsciberRelationship: Array<any>;
  lstRelationship: Array<any>;
  lstSnomedRelationship: Array<any>;
  lstImmRegStatus: Array<any>;
  lstImmRegPublicityCode: Array<any>;
  lstImmRegProtectionIndicator: Array<any>;
  defaultPatPic: string;
  defaultPatMalePic: string;
  defaultPatFemalePic: string;
  defaultPatPicLg: string;
  defaultPatMalePicLg: string;
  defaultPatFemalePicLg: string;
  listInstype: Array<any>;
  //acProviderEligibility:Array<any>;
  lstMonths: Array<any>;
  lstPracticeLab: Array<any>;
  billingProviderList: Array<any>;
  facilityList: Array<any>;
  practicePOSList: Array<any>;
  modifierList: Array<any>;
  statesList: Array<any>;
  lstrptClaimDetailStatus: Array<any>;
  billingUsersList: Array<any>;
  claimAdjustmentGroupCodesList: Array<any>;
  claimAdjustmentReasonCodesList: Array<any>;
  appSettings: Array<any>;
  isLabInterface: boolean;
  arrFollowNote: Array<any>;
  arrFollowAction: Array<any>;
  roleList: Array<any>;
  lstImmSites: Array<any>;
  lstImmRoutes: Array<any>;
  lstImmRegClinics: Array<any>;
  lstSmokingStatus: Array<any>;
  lstDischargeDisposition: Array<any>;
  lstClosingReason: Array<any>;
  lstOverrideSecurityRights: Array<any>;
  lstAllModulesList: Array<any>;
  lstChartAllModulePrint: Array<any>;
  lstUserRights: Array<any>;
  showClaimProcDescription: boolean;
  lstFaxContactList: Array<any>;
  lstFaxConfigFaxNumbers: Array<any>;
  lstAssignedToUsersList: Array<any>;
  lstCategoriesTree: Array<DocumentTreeModel>;
  lstCategoriesTreeWithNoLab: Array<DocumentTreeModel>;
  arrInsuranceName:Array<any>;
  lstPracticeSelection:Array<any>;
  unReadmessageCount:number;
  faxServer:FaxServerEnum;

  ccPaymentServiceName: CCPaymentServiceNameEnum;
  heartLandPaymentPublicKey: string;
}

export const LookupListData: LookupList = {
  isEhrDataLoad: false,
  isEhrLocked: false,
  loginWithOverrideRigts: false,
  practiceInfo: new PracticeInfo(),
  UserRights: new UserApplicationRights(),
  //logedInUser:{}
  logedInUser: new LogedInUser(),
  providerList: new Array(),
  locationList: new Array(),
  listpracticeUserName: new Array(),
  practiceUsersList: new Array(),
  appStatusList: new Array(),
  appTypesList: new Array(),
  lstUserChartModuleSetting: new Array(),
  appSourcesList: new Array(),
  appReasonsList: new Array<any>(),
  lstDocumentCategory: new Array(),
  lstDocumentCategoryList: new Array(),
  lstdocumentPath: new Array(),
  lstLabCategory: new Array(),
  lstPracticeWriteOffCodes: new Array(),
  //lstAuthorizationUsers: new Array(),
  authorizationUsers:{lstAuthorizationUsers:new Array(), isLoaded:false},
  lstMaritalStatus: new Array(),
  lstGender: [{ code: "", description: "" }, { code: "M", description: "Male" }, { code: "F", description: "Female" }, { code: "UNK", description: "Unknown" }],
  arrLabStatus: [{ value: "" }, { value: "PENDING" }, { value: "PRE AUTH" }, { value: "PERFORMED" }, { value: "READY TO PERFORM" }, { value: "COMPLETED" }, { value: "PA DENIED" }, { value: "CANCELED" }],
  lstLanguages: new Array(),
  lstGenderIdentity: new Array(),
  lstSexualOrientation: new Array(),
  lstOMBRace: new Array(),
  lstOMBEthnicity: new Array(),
  lstSubsciberRelationship: ['SELF', 'CHILD', 'SPOUSE', 'OTHER'],
  lstRelationship: new Array(),
  lstSnomedRelationship: new Array(),
  lstImmRegStatus: new Array(),
  lstImmRegPublicityCode: new Array(),
  lstChartAllModulePrint: new Array(),
  
  defaultPatPic: "assets/images/img_default_sm.png",
  defaultPatPicLg: "assets/images/img_default_lg.png",

  defaultPatMalePic: "assets/images/img_male_sm.png",
  defaultPatMalePicLg: "assets/images/img_male_lg.png",

  defaultPatFemalePic: "assets/images/img_female_sm.png",  
  defaultPatFemalePicLg: "assets/images/img_female_lg.png",

  lstImmRegProtectionIndicator: new Array(),
  listInstype: ['Primary', 'Secondary'],
  //acProviderEligibility:new Array(),
  lstMonths: [{ month_no: "01", month_name: "January" }, { month_no: "02", month_name: "Feburary" }, { month_no: "03", month_name: "March" }, { month_no: "04", month_name: "April" }, { month_no: "05", month_name: "May" }, { month_no: "06", month_name: "June" }, { month_no: "07", month_name: "July" }, { month_no: "08", month_name: "August" }, { month_no: "09", month_name: "September" }, { month_no: "10", month_name: "October" }, { month_no: "11", month_name: "November" }, { month_no: "12", month_name: "December" }],
  billingProviderList: new Array(),
  facilityList: new Array(),
  practicePOSList: new Array(),
  modifierList: new Array(),
  statesList: new Array(),
  lstPracticeLab: new Array(),
  lstrptClaimDetailStatus: [{ status: "All" }, { status: "Unprocessed" }, { status: "Processed" }, { status: "Self" }, { status: "Draft" }, { status: "Follow Up" }, { status: "Don't Bill" }, { status: "EAP" }],
  billingUsersList: new Array(),
  claimAdjustmentGroupCodesList: new Array(),
  claimAdjustmentReasonCodesList: new Array(),
  appSettings: new Array(),
  isLabInterface: false,
  arrFollowNote: ["", "Follow Up Required", "Follow Up Completed", "Letter Sent", "Appointment Made", "Provider Sign Off Required"],
  arrFollowAction: ["", "ASAP", "1 Wk", "2 Wk", "3 Wk", "1 Month", "Other"],
  roleList: new Array(),
  lstImmSites: new Array(),
  lstImmRoutes: new Array(),
  lstImmRegClinics: new Array(),
  lstSmokingStatus: new Array(),
  lstDischargeDisposition: new Array(),
  lstClosingReason: [{ reson: "" }, { reson: "Termination by mutual agreement(no further treatment needed at this time.)" }, { reson: "Patient desires no further treatment at this time." }, { reson: "Referred for treatment elsewhere (document below)" }, { reson: "Clinical assessment/evaluation only --- no treatment started" }, { reson: "Other(specify)" }],
  lstOverrideSecurityRights: new Array(),
  lstAllModulesList: new Array(),
  lstUserRights: new Array(),
  showClaimProcDescription: true,
  lstFaxContactList: new Array(),
  lstFaxConfigFaxNumbers: new Array(),
  lstAssignedToUsersList: new Array(),
  lstCategoriesTree: new Array(),
  lstCategoriesTreeWithNoLab: new Array(),
  lstPracticeSelection:new Array(),
  arrInsuranceName: [{ value: "" }, { value: "MCD" }, { value: "CCHP" }, { value: "ICARE" }, { value: "ICARE MCR" }, { value: "COMNTY" }, { value: "S/B ANTHEM T19" }, { value: "MHS" },{ value: "MCD" }, { value: "MHS T19" }, { value: "MHS MCR" }, { value: "ABRI MCR" }, { value: "MDINA MCR" }, { value: "ABRI" }, { value: "MOLINA T19" }, { value: "UHCT19" }, { value: "MCR" }, { value: "MCRHMO" }, { value: "BCBS" }, { value: "HUM" },{ value: "UHC" }, { value: "UHC COM" }, { value: "COMM" }, { value: "MCD" }, { value: "MR" }, { value: "COLL" },{ value: "ATT" }, { value: "MIS" }, { value: "DISSA" }],
  unReadmessageCount:0,
  faxServer:undefined,
  
  ccPaymentServiceName: undefined,
  heartLandPaymentPublicKey: ''
};

  
@NgModule({
  providers: [{
    provide: LOOKUP_LIST,
    useValue: LookupListData
  }]
})
export class LookupListModule { }