import { Injectable, Inject } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { APP_CONFIG, AppConfig } from "src/app/providers/app-config.module";
import { WrapperObjectSave } from "src/app/models/general/wrapper-object-save";
import { SearchCriteria } from "src/app/models/common/search-criteria";

import { Wrapper_UserSave } from "src/app/models/setting/WrapperUserSave";
import { ORMDeleteRecord } from "src/app/models/general/orm-delete-record";
import { ORMRoleModuleSave } from "src/app/models/setting/ORMRoleModuleSave";
import { ORMSaveModuleRule } from "src/app/models/setting/ORMSaveModuleRule";
import { AuthenticationCredentials } from "src/app/authentication/authenticationCredentials";
import { ORMUserInsert } from "src/app/models/billing/ORMUserInsert";
import { ORMUserPractices } from "src/app/models/billing/ORMUserPractices";

@Injectable()
export class UserService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {
  }


  authenticateUser(auth: AuthenticationCredentials) {
    return this.http.post(this.config.apiEndpoint + 'user/authenticate', auth, this.httpOptions);
  }

  /*
  getphrUser(patientid){
   return this.http.get(
     this.config.apiEndpoint+'user/getphrUser/'+patientid,this.httpOptions);
 }
 */

  /*
  checkPHRUserExsist(user_name,practice_id){
    return this.http.get(
      this.config.apiEndpoint+'user/checkPHRUserExsist/'+user_name+'/'+practice_id,this.httpOptions);
  }
  */

  /*
  savephrUserRights(saveObjectWrapper: WrapperObjectSave) {
    return this.http.post(this.config.apiEndpoint + 'user/savephrUserRights', saveObjectWrapper, this.httpOptions);
  }
  */
  getUserSetup(practice_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getAllUsers/' + practice_id, this.httpOptions);
  }
  getUserDetail(user_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getUserDetails/' + user_id, this.httpOptions);
  }
  getuserRole(practice_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getuserRole/' + practice_id, this.httpOptions);
  }
  getchartModuleSetting(practice_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getchartModuleSetting/' + practice_id, this.httpOptions);
  }
  getSuperBills(practice_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getSuperBills/' + practice_id, this.httpOptions);
  }
  getUserAssignProvider(user_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getUserAssignProvider/' + user_id, this.httpOptions);
  }
  getUserProviderAll(user_id: number, practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getUserProviderAll/' + user_id + '/' + practice_id, this.httpOptions);
  }

  checkIfUserExsist(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'user/checkIfUserExsist', searchCriteria, this.httpOptions);
  }

  saveUser(ormSave: Wrapper_UserSave) {
    return this.http.post(this.config.apiEndpoint + 'user/saveUser/', ormSave, this.httpOptions);
  }

  deleteUser(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'user/deleteUser', obj, this.httpOptions);
  }
  deleteUserProvider(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'user/deleteUserProvider', obj, this.httpOptions);
  }
  setDefaultUserProvider(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'user/setDefaultUserProvider', obj, this.httpOptions);
  }

  getRoleList(practice_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getRoleList/' + practice_id, this.httpOptions);
  }
  getModuleDetails(role_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getModuleDetails/' + role_id, this.httpOptions);
  }
  getAllModulesList(practice_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getAllModulesList/' + practice_id, this.httpOptions);
  }

  saveRoleModule(ormSave: Array<ORMRoleModuleSave>) {
    return this.http.post(this.config.apiEndpoint + 'user/saveRoleModule/', ormSave, this.httpOptions);
  }
  saveRole(ormsave: ORMSaveModuleRule) {
    return this.http.post(this.config.apiEndpoint + 'user/saveRole/', ormsave, this.httpOptions);
  }
  deleteRole(obj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'user/deleteRole', obj, this.httpOptions);
  }
  getRoleAdministrationModules(practice_id, role_id) {
    return this.http.get(
      this.config.apiEndpoint + 'user/getRoleAdministrationModules/' + practice_id + '/' + role_id, this.httpOptions);
  }
  resetPassword(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'user/resetPassword', searchCriteria, this.httpOptions);
  }
  AuthenticatePU(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'user/AuthenticatePU', searchCriteria, this.httpOptions);
  }
  // getBillingUserDetails(practice_id) {
  //   return this.http.get(this.config.apiEndpoint + 'user/getBillingUserDetails/' + practice_id, this.httpOptions);
  // }
  getAllPractices() {
    return this.http.get(this.config.apiEndpoint + 'user/getAllPractices/', this.httpOptions);
  }
  getUserPractices() {
    return this.http.get(this.config.apiEndpoint + 'user/getUserPractices/', this.httpOptions);
  }
  getProvider(practice_id) {
    return this.http.get(this.config.apiEndpoint + 'user/getProvider/' + practice_id, this.httpOptions);
  }
  getBillingUserDetails(practice_id) {
    return this.http.get(this.config.apiEndpoint + 'user/getBillingUserDetails/' + practice_id, this.httpOptions);
  }
  deleteBillingUser(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'user/deleteBillingUser', obj, this.httpOptions);
  }
  saveupdateBillingUser(obj: ORMUserInsert) {
    return this.http.post(this.config.apiEndpoint + 'user/saveupdateBillingUser', obj, this.httpOptions);
  }
  SavePracticeList(obj: Array<ORMUserPractices>) {
    return this.http.post(this.config.apiEndpoint + 'user/SavePracticeList', obj, this.httpOptions);
  }
  searchCityZipState(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'user/searchCityZipState/', searchCriteria, this.httpOptions);
  }
  saveCityZipState(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'user/saveCityZipState/', searchCriteria, this.httpOptions);
  }
  EditCityZipState(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'user/EditCityZipState/', searchCriteria, this.httpOptions);
  }
  getIsRecordExist(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'user/getIsRecordExist/', searchCriteria, this.httpOptions);
  }
}