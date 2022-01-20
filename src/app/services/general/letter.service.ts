import { SearchCriteria } from './../../models/common/search-criteria';
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../providers/app-config.module';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ORMLetterHeaders } from 'src/app/models/letter/ORMLetterHeaders';
import { ORMLetterSections } from 'src/app/models/letter/ORMLetterSections';
import { ORMLetterSubSections } from 'src/app/models/letter/ORMLetterSubSections';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { ORMLetterTemplate } from 'src/app/models/letter/ORMLetterTemplate';
import { ORMLetterTemplateSection } from 'src/app/models/letter/ORMLetterTemplateSection';
import { ORMLetterTemplateSubSection } from 'src/app/models/letter/ORMLetterTemplateSubSection';
import { ORMPatientLetter } from 'src/app/models/letter/ORMPatientLetter';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ORMPatientNote } from 'src/app/models/letter/ORMPatientNote';

@Injectable()
export class LetterService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) { }

  searchPatientLetters(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'letter/searchPatientLetters', searchCriteria, this.httpOptions);
  }
  GetLetterTemplates(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'letter/GetLetterTemplates/' + practiceId, this.httpOptions);
  }
  getLetterSections(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'letter/getLetterSections/' + practiceId, this.httpOptions);
  }
  getLetterSubSections(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'letter/getLetterSubSections/' + practiceId, this.httpOptions);
  }
  getLetterTemplateSections(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'letter/getLetterTemplateSections/' + practiceId, this.httpOptions);
  }
  getLetterTemplateSubSections(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'letter/getLetterTemplateSubSections/' + practiceId, this.httpOptions);
  }
  getSettingsLetterHeaders(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'letter/getLetterHeaders/' + practiceId, this.httpOptions);
  }
  getSettingsLetterSections(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'letter/getSettingsLetterSections/' + practiceId, this.httpOptions);
  }
  getSettingsLetterSubSections(practiceId: number) {
    return this.http.get(
      this.config.apiEndpoint + 'letter/getSettingsLetterSubSections/' + practiceId, this.httpOptions);
  }
  saveupdateLetterHeader(obj: ORMLetterHeaders) {
    return this.http.post(this.config.apiEndpoint + 'letter/saveupdateLetterHeader', obj, this.httpOptions);
  }
  saveupdateLetterSection(obj: ORMLetterSections) {
    return this.http.post(this.config.apiEndpoint + 'letter/saveupdateLetterSection', obj, this.httpOptions);
  }
  saveupdateLetterSubSection(obj: ORMLetterSubSections) {
    return this.http.post(this.config.apiEndpoint + 'letter/saveupdateLetterSubSection', obj, this.httpOptions);
  }
  deleteSelectedHeader(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'letter/deleteSelectedHeader', obj, this.httpOptions);
  }
  deleteSelectedSection(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'letter/deleteSelectedSection', obj, this.httpOptions);
  }
  deleteSeletedSubSection(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'letter/deleteSeletedSubSection', obj, this.httpOptions);
  }
  deleteSelectedTemplate(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'letter/deleteSelectedTemplate', obj, this.httpOptions);
  }
  saveupdateLetterTemplate(obj: ORMLetterTemplate) {
    return this.http.post(this.config.apiEndpoint + 'letter/saveupdateLetterTemplate', obj, this.httpOptions);
  }
  SaveTemplateSections(obj: Array<ORMLetterTemplateSection>) {
    return this.http.post(this.config.apiEndpoint + 'letter/SaveTemplateSections', obj, this.httpOptions);
  }
  SaveTemplateSubSections(obj: Array<ORMLetterTemplateSubSection>) {
    return this.http.post(this.config.apiEndpoint + 'letter/SaveTemplateSubSections', obj, this.httpOptions);
  }
  saveupdatePatientLetter(obj: ORMPatientLetter) {
    return this.http.post(this.config.apiEndpoint + 'letter/saveupdatePatientLetter', obj, this.httpOptions);
  }
  deleteSelectedLetter(obj: ORMDeleteRecord) {
    return this.http.post(this.config.apiEndpoint + 'letter/deleteSelectedLetter', obj, this.httpOptions);
  }
  updateLetterStatus(searchCriteria: SearchCriteria) {
    return this.http.post(this.config.apiEndpoint + 'letter/updateLetterStatus', searchCriteria, this.httpOptions);
  }
  signLetter(lstSignLetterData: Array<ORMKeyValue>) {
    return this.http.post(this.config.apiEndpoint + 'letter/signLetter', lstSignLetterData, this.httpOptions);
  }
  saveNotesonPrint(obj: ORMPatientNote) {
    return this.http.post(this.config.apiEndpoint + 'letter/saveNotesonPrint', obj, this.httpOptions);
  }
}
