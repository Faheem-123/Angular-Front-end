import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../providers/app-config.module';
import { SearchCriteria } from "../../models/common/search-criteria";
import { ORMLoginVerify } from 'src/app/models/general/ORMLoginVerify';
import { AuthenticationCredentials } from 'src/app/authentication/authenticationCredentials';
import { ORMLoginUserLog } from 'src/app/models/general/ORMLoginUserLog';
import { ORMAuditLog } from 'src/app/models/general/ORMAuditLog';

@Injectable()
export class GeneralService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  private httpPdfOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'arraybuffer'
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) { }

  GetClientIP() {
    
    return this.http.get(
      this.config.apiEndpoint + 'auth/getIp/', { responseType: 'text' });
  }


  getPracticeInfo(practiceId: number) {
    return this.http
      .get(this.config.apiEndpoint + 'general/getPracticeInfo/' + practiceId, this.httpOptions);
  }

  getLogedInUserDetail(userId: number) {
    return this.http
      .get(this.config.apiEndpoint + 'user/getLogedInUserDetail/' + userId, this.httpOptions);
  }

  getOverrideSecuritySettings(practice_id: number, role_id: string) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getOverrideSecuritySettings/' + practice_id + '/' + role_id, this.httpOptions);
  }

  getAllModules(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getAllModules/' + practice_id, this.httpOptions);
  }
  getAppSetting(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getAppSetting/' + practice_id, this.httpOptions);
  }
  getProvider(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getProviderList/' + practice_id, this.httpOptions);
  }
  getBillingProviderList(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getBillingProviderList/' + practice_id, this.httpOptions);
  }
  getLabCategory(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getLabCategory/' + practice_id, this.httpOptions);
  }
  getLocation(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getlocation/' + practice_id, this.httpOptions);
  }
  getPracticeUserName(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getPracticeUserName/' + practice_id, this.httpOptions);
  }

  getCityState(zipCode: String) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getcitystate/' + zipCode, this.httpOptions);
  }
  getUserChartModuleSetting(setting_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getUserChartModuleSetting/' + setting_id, this.httpOptions);
  }
  getDocCategories(practice_id: number) {
    return this.http.get(

      this.config.apiEndpoint + 'general/getDocCategories/' + practice_id, this.httpOptions);
  }
  getDocumentPaths(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getDocumentPaths/' + practice_id, this.httpOptions);
  }
  getPracticeLab(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'lab/getPracticeLab/' + practice_id, this.httpOptions);
  }

  getDocCategoriesList(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getDocCategoriesList/' + practice_id, this.httpOptions);
  }


  getUserRights(user_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getUserRights/' + user_id, this.httpOptions);
  }

  savePatientDocument(formData: FormData) {
    return this.http
      .post(this.config.apiEndpoint + 'general/SaveDocument', formData);
  }
  downloadFile(file_name: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'general/downloadB', file_name, { responseType: 'arraybuffer' });
  }
  getProviderUser(practiceId: string) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getProviderUser/' + practiceId, this.httpOptions);
  }
  AuthenticateProviderUser(searhcrit: SearchCriteria) {
    return this.http
      .post(this.config.apiEndpoint + 'general/AuthenticateProviderUser', searhcrit);
  }
  getAuthorizationUsers(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getauthorizationusers/' + practiceId, this.httpOptions);
  }

  getPatientInsuranceName(searhcrit: SearchCriteria) {
    return this.http
      .post(this.config.apiEndpoint + 'general/getpatientinsurancename', searhcrit);
  }

  getMaritalStatusList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getMaritalStatusList', this.httpOptions);
  }
  getLanguagesList(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getLanguageList/' + practiceId, this.httpOptions);
  }

  getGenderIdentityList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getGenderIdentityList', this.httpOptions);
  }

  getSexualOrientationList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getSexualOrientationList', this.httpOptions);
  }


  getOMBRaceList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getOMBRaceList', this.httpOptions);
  }


  getOMBEthnicityList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getOMBEthnicityList', this.httpOptions);
  }


  getCountryParishCodeByState(state: String) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getCountryParishCodeByState/' + state, this.httpOptions);
  }
  getCityStateByZipCode(zipCode: String) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getCityStateByZip/' + zipCode, this.httpOptions);
  }
  getRelationshipList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getRelationshipList', this.httpOptions);
  }

  getImmRegistryStatusList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getImmRegistryStatusList', this.httpOptions);
  }

  getImmRegistryPublicityCodeList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getImmRegistryPublicityCodeList', this.httpOptions);
  }

  getImmRegistryProcectionIndicatorList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getImmRegistryProcectionIndicatorList', this.httpOptions);
  }

  getProviderInfoById(providerId: Number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getProviderInfoById/' + providerId, this.httpOptions);
  }
  getAppStatus(practiceId) {
    return this.http.get(
      this.config.apiEndpoint + 'scheduler/getstatus/' + practiceId, this.httpOptions);
  }
  //getProvider_Eligibility(practiceId) {
  //  return this.http.get(
  //    this.config.apiEndpoint + 'general/getProvider_Eligibility/' + practiceId, this.httpOptions);
  //}
  getSnomedRelationshipList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getSnomedRelationshipList', this.httpOptions);
  }
  getStatesList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getStatesList', this.httpOptions);
  }
  getBillingUsersList(billing_practice_id: number, practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getBillingUsersList/' + billing_practice_id + '/' + practice_id, this.httpOptions);
  }

  getPracticeUsersList(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getPracticeUsersList/' + practice_id, this.httpOptions);
  }
  getRooms(practice_id: string, location_id: string) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getRooms/' + practice_id + '/' + location_id, this.httpOptions);
  }


  printReport(printContents: string) {
    let popupWin;
    // printContents = document.getElementById('report').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,right=10,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>          
          <link rel="stylesheet" type="text/css" href="./assets/css/bootstrap.min.css" media="screen,print">  
          <link rel="stylesheet" type="text/css" href="./assets/css/fontawesome.min.css" media="screen,print"/>                 
          <link rel="stylesheet" type="text/css" href="./assets/css/table.css" media="screen,print"/>
          <link rel="stylesheet" type="text/css" href="./assets/css/report-print.css" media="screen,print"/>
          
          <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">              
        </head>
    <body style="background-color:white; font-size:110%" onload="window.print();">
    <div class="report">
    ${printContents}
    </div>
    </body>
      </html>`
    );
    popupWin.document.close();

    //<body onload="window.print();window.close()">${printContents}</body>
  }

  printReportWithStyle(printContents: string, style: string) {
    let popupWin;
    // printContents = document.getElementById('report').innerHTML;
    popupWin = window.open('', '_blank', 'top=10,left=10,right=10,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>          
          <link rel="stylesheet" type="text/css" href="./assets/css/bootstrap.min.css" media="screen,print">  
          <link rel="stylesheet" type="text/css" href="./assets/css/fontawesome.min.css" media="screen,print"/>          
          <link rel="stylesheet" type="text/css" href="./assets/css/report-print.css" media="screen,print"/>                     
          <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">              
        </head>`+
      ' <style> ' + style + '</style>' +
      `<body style="background-color:white; font-size:110%" onload="window.print();">${printContents}</body>
      </html>`
    );
    popupWin.document.close();

    //<body onload="window.print();window.close()">${printContents}</body>
  }

  getPhoneFaxDigitsOnly(strPhone: string) {
    if (strPhone != undefined)
      return strPhone.toString().trim().replace(/[^\d]/g, "");
    return undefined;
  }
  getUserAllRoles(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'general/getUserAllRoles/' + practiceId, this.httpOptions);
  }

  getSmokingStatusList() {
    return this.http.get(
      this.config.apiEndpoint + 'general/getSmokingStatusList', this.httpOptions);
  }
  getQRDA() {
    return this.http.get(
      this.config.apiEndpoint + 'test/hello', this.httpOptions);
  }

  getDischargeDispositionList() {
    return this.http.get(this.config.apiEndpoint + 'general/getDischargeDispositionList', this.httpOptions);
  }
  loginUserLog(obj: ORMLoginUserLog) {
    return this.http
      .post(this.config.apiEndpoint + 'general/loginUserLog', obj);
  }
  logoutUserLog(obj: SearchCriteria) {
    return this.http
      .post(this.config.apiEndpoint + 'general/logoutUserLog', obj);
  }
  auditLog(obj: ORMAuditLog) {
    debugger;
    return this.http
      .post(this.config.apiEndpoint + 'general/auditLog', obj);
  }
  ConvertHtmltoPDF(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'general/ConvertHtmltoPDF', searchCriteria, this.httpOptions);
  }
  getBillingPractices(user_id: number) {
    return this.http
      .get(this.config.apiEndpoint + 'general/getBillingPractices/' + user_id, this.httpOptions);
  }

  getLabelPrintData(label_type: string, id: string) {
    return this.http
      .get(this.config.apiEndpoint + 'general/getLabelPrintData/' + label_type + '/' + id, this.httpOptions);
  }
  getPOSList() {
    return this.http
      .get(this.config.apiEndpoint + 'general/getPOSList', this.httpOptions);
  }
  getDocumentBytes(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'general/getDocumentBytes', searchCriteria, { responseType: 'arraybuffer' });
  }

  getUnReadMessagesCount(reciverId: number) {
    return this.http.get(this.config.apiEndpoint + 'general/getUnreadMessageCount/' + reciverId, this.httpOptions);
  }

  getAllChartPrintModule(practiceId: string) {
    return this.http.get(this.config.apiEndpoint + 'encounter/getAllChartPrintModule/' + practiceId, this.httpOptions);
  }
}
