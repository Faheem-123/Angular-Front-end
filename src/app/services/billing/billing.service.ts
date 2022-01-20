import { Injectable, Inject } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { APP_CONFIG, AppConfig } from "src/app/providers/app-config.module";
import { SearchCriteria } from "src/app/models/common/search-criteria";
import { ORMSaveBatch } from "src/app/models/billing/ORMSaveBatch";
import { ORMSaveClaimBatchDetail } from "src/app/models/billing/ORMSaveClaimBatchDetail";
import { ORMDeleteRecord } from "src/app/models/general/orm-delete-record";
import { ORMDenialMessagesSave } from "src/app/models/billing/orm-denial-messages-save";

@Injectable()
export class BillingService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) {
  }
  getClaimBillingSummary(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/getClaimBillingSummary', searchCriteria, this.httpOptions);

  }
  addUpdateBatch(obj: ORMSaveBatch) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/addUpdateBatch', obj, this.httpOptions);
  }
  getUnlockBatch(practice_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getUnlockBatch/' + practice_id, this.httpOptions);
  }
  getClaimBatchCount(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/getClaimBatchCount', searchCriteria, this.httpOptions);
  }
  getBatchClaimList(batch_id: string) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getBatchClaimList/' + batch_id, this.httpOptions);
  }
  saveClaimBatchDetail(ormSave: Array<ORMSaveClaimBatchDetail>) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/saveClaimBatchDetail', ormSave, this.httpOptions);
  }
  getBatchDetail(practice_id: string, batch_id: string) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getBatchDetail/' + practice_id + '/' + batch_id, this.httpOptions);
  }
  deleteClaimBatch(deleteobj: ORMDeleteRecord) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/deleteClaimBatch', deleteobj, this.httpOptions);
  }
  lockBatch(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/lockBatch', searchCriteria, this.httpOptions);
  }
  generateBatch_5010_P(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/generateBatch_5010_P', searchCriteria, this.httpOptions);
  }
  getBatchPath(batch_id: string) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getBatchPath/' + batch_id, this.httpOptions);
  }
  IgnoreError(error_id: string, user_name: string) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/IgnoreError/' + error_id + '/' + user_name, this.httpOptions);
  }
  deleteClaimFromBatch(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/deleteClaimFromBatch', searchCriteria, this.httpOptions);
  }
  uploadBatchToGatewayEDI(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/uploadBatchToGatewayEDI', searchCriteria, this.httpOptions);
  }
  downloadBatchResponse(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/downloadBatchResponse', searchCriteria, this.httpOptions);
  }

  deleteDenialMessage(deleteobj: ORMDeleteRecord) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/deleteDenialMessage', deleteobj, this.httpOptions);
  }

  saveDenialMessage(ormDenialMessagesSave: ORMDenialMessagesSave) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/saveDenialMessage', ormDenialMessagesSave, this.httpOptions);
  }

  resolveDenialMessage(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/resolveDenialMessage', searchCriteria, this.httpOptions);
  }


  getEraList(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/getEraList', searchCriteria, this.httpOptions);

  }

  getEraDetails(eraId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getEraDetails/' + eraId, this.httpOptions);
  }

  getEraClaimList(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/getEraClaimList', searchCriteria, this.httpOptions);

  }


  getEraClaimDetail(practiceId: number,eraClaimId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getEraClaimDetail/' +practiceId+'/'+ eraClaimId, this.httpOptions);
  }

  getEraClaimServices(eraClaimId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getEraClaimServices/' + eraClaimId, this.httpOptions);
  }
  checkEOBPostedRecords(eob_id: number) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/checkEOBPostedRecords/' + eob_id, this.httpOptions);
  } 

  getAdjustCodesGlossary(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/getAdjustCodesGlossary', searchCriteria, this.httpOptions);
  }
  getEOB(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/getEOB', searchCriteria, this.httpOptions);
  } 
  getEOBAttachment(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/getEOBAttachment', searchCriteria, this.httpOptions);

  } 
  
  uploadEOB(formData: FormData) {
    return this.http
      .post(this.config.apiEndpoint + 'billing/uploadEOB', formData);
  } 
  deleteEOB(deleteobj: ORMDeleteRecord) {
    return this.http
      .post(this.config.apiEndpoint + 'billing/deleteEOB', deleteobj);
  } 

  getERAProviderAdjustment(eraId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getERAProviderAdjustment/' + eraId, this.httpOptions);
  }

  mapEraClaimServicesIds(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/mapEraClaimServicesIds', searchCriteria, this.httpOptions);
  }

  mapEraClaimPaymentInsurance(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/mapEraClaimPaymentInsurance', searchCriteria, this.httpOptions);
  }

  markAsPosted(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/markAsPosted', searchCriteria, this.httpOptions);
  }


  importERAFromGatewayEdi(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/importERAFromGatewayEdi', searchCriteria, this.httpOptions);
  }

  deleteERA(deleteobj: ORMDeleteRecord) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/deleteERA', deleteobj, this.httpOptions);
  }

  postERAPayment(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/postERAPayment', searchCriteria, this.httpOptions);
  }

  importERAFromTextString(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/importERAFromTextString', searchCriteria, this.httpOptions);
  }

  moveEraToOtherPractice(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/moveEraToOtherPractice', searchCriteria, this.httpOptions);
  }

  generateHCFA(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/generateHCFA', searchCriteria, this.httpOptions);
  }


  updateProcessedClaims(submissionProccessedClaimInfo: any) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/updateProcessedClaims', submissionProccessedClaimInfo, this.httpOptions);
  }

  getEobById(eobId:number) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getEobById/' + eobId, this.httpOptions);
  }

  downloadClaimResponse(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/downloadClaimResponse', searchCriteria, this.httpOptions);
  }

  getEdiClaimStatus(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/getEdiClaimStatus', searchCriteria, this.httpOptions);
  }

  getEdiClaimStatusDetailByClaimId(claimId:number) {
    return this.http.get(
      this.config.apiEndpoint + 'billing/getEdiClaimStatusDetailByClaimId/' + claimId, this.httpOptions);
  }

  markEdiClaimStatusAsWorked(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/markEdiClaimStatusAsWorked', searchCriteria, this.httpOptions);
  }

  getEOBIdByCriteria(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'billing/getEobIdByCriteria', searchCriteria, this.httpOptions);

  }

}

