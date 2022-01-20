import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../providers/app-config.module';
import { ORMKeyValue } from '../models/general/orm-key-value';
import { ORMTaskSave } from '../models/tasks/orm-task-save';
import { SearchCriteria } from '../models/common/search-criteria';
import { UpdateRecordModel } from '../models/general/update-record-model';
import { ORMDeleteRecord } from '../models/general/orm-delete-record';

@Injectable()
export class TasksService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig) { }


  /*
getTasks(practicdId: number, userName: string, inOutOption: string, lstParams: Array<ORMKeyValue>) {

  let queryParams: string = "";

  lstParams.forEach(param => {
    if (queryParams != '') {
      queryParams += ","
    }
    queryParams += param.key + "=" + param.value;
  });
  if (queryParams != '') {
    queryParams = "?" + queryParams
  }

  return this.http.get(this.config.apiEndpoint + 'tasks/getTasks/' + practicdId + '/' + userName + '/' + inOutOption + queryParams, this.httpOptions);
}
*/

  getTasks(searchCriteria: SearchCriteria) {
    return this.http.post(
      this.config.apiEndpoint + 'tasks/getTasks', searchCriteria, this.httpOptions);
  }

  saveTask(ormTask: ORMTaskSave) {
    return this.http.post(
      this.config.apiEndpoint + 'tasks/saveTask', ormTask, this.httpOptions);

  }

  getTaskById(taskId: number) {
    return this.http.get(this.config.apiEndpoint + 'tasks/getTaskById/' + taskId, this.httpOptions);
  }

  getTaskLog(taskId: number) {
    return this.http.get(this.config.apiEndpoint + 'tasks/getTaskLog/' + taskId, this.httpOptions);
  }

  markTaskAsCompleted(updateRecordModel: UpdateRecordModel) {
    return this.http.post(
      this.config.apiEndpoint + 'tasks/markAsCompleted', updateRecordModel, this.httpOptions);
  }

  deleteTask(updateRecordModel: UpdateRecordModel) {
    return this.http.post(
      this.config.apiEndpoint + 'tasks/deleteTask', updateRecordModel, this.httpOptions);
  }
}
