import { Component, OnInit, ViewChildren, QueryList, Inject, Input } from '@angular/core';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { TasksService } from 'src/app/services/tasks.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ViewTaskComponent } from '../view-task/view-task.component';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AddTaskComponent } from '../add-task/add-task.component';
import { GeneralService } from 'src/app/services/general/general.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  @Input() taskFlowType: string = '';  // INBOX | OUTBOX

  isLoading: boolean = false;
  lstTasks: Array<any>;
  selectedTaskId: number;
  totalRecords: number = 0;
  searchFormGroup: FormGroup;
  dateRangeType: string = 'date_created';
  searchCriteria: SearchCriteria = new SearchCriteria();

  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal,
    private tasksService: TasksService,
    private sortFilterPaginationService: SortFilterPaginationService,
    private formBuilder: FormBuilder,
    private generalService: GeneralService) { }

  ngOnInit() {
    this.buildForm();
    if (this.lookupList.practiceUsersList == undefined || this.lookupList.practiceUsersList.length == 0) {
      this.getPracticeUsersList();
    }

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = this.taskFlowType;
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "user_name", value: this.lookupList.logedInUser.user_name, option: "" });
    this.searchCriteria.param_list.push({ name: "status", value: "In Complete", option: "" });
    this.getTasks();
  }

  getPracticeUsersList() {
    this.generalService.getPracticeUsersList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.practiceUsersList = data as Array<any>;
      },
      error => {
        this.getPracticeUsersListError(error);
      }
    );
  }
  getPracticeUsersListError(error) {
    this.logMessage.log("getPracticeUsersList Error." + error);
  }

  buildForm() {
    this.searchFormGroup = this.formBuilder.group({
      dateRangeType: this.formBuilder.control(this.dateRangeType),
      dpFrom: this.formBuilder.control(null),
      dpTo: this.formBuilder.control(null),
      ddStatus: this.formBuilder.control("In Complete"),
      ddUser: this.formBuilder.control(''),
      ddPriority: this.formBuilder.control('')

    });

  }

  onDateTypeChange(type: string) {
    this.dateRangeType = type;
  }



  taskRowChanged(taskId: number) {
    this.selectedTaskId = taskId;

  }



  searchTasks(formValue: any) {
    debugger;
    if ((formValue.dpFrom == null || formValue.dpFrom == "")
      && (formValue.dpTo == null || formValue.dpTo == "")
      && (formValue.ddStatus == null || formValue.ddStatus == "")
      && (formValue.ddUser == null || formValue.ddUser == "")) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Select at least one Criteria.", 'warning')
      return;
    }
    if (formValue.dpFrom != null && formValue.dpFrom != "") {
      if (!this.dateTimeUtil.isValidDateTime(formValue.dpFrom, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Date From is  invalid.", 'warning')
        return;
      }
    }
    if (formValue.dpTo != null && formValue.dpTo != "") {
      if (!this.dateTimeUtil.isValidDateTime(formValue.dpTo, DateTimeFormat.DATE_MODEL)) {
        GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Date To is  invalid.", 'warning')
        return;
      }
    }

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = this.taskFlowType;

    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "user_name", value: this.lookupList.logedInUser.user_name, option: "" });

    if (formValue.dpFrom != "" && formValue.dpFrom != null) {
      this.searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formValue.dpFrom, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: this.dateRangeType });
    }
    if (formValue.dpTo != "" && formValue.dpTo != null) {
      this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formValue.dpTo, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: this.dateRangeType });
    }
    if (formValue.ddStatus != "" && formValue.ddStatus != null) {
      this.searchCriteria.param_list.push({ name: "status", value: formValue.ddStatus, option: "" });

    }
    if (formValue.ddUser != null && formValue.ddUser != "") {

      if (this.taskFlowType == 'INBOX') {
        this.searchCriteria.param_list.push({ name: "created_user", value: formValue.ddUser, option: "" });
      }
      else if (this.taskFlowType == 'OUTBOX') {
        this.searchCriteria.param_list.push({ name: "assinged_to", value: formValue.ddUser, option: "" });
      }
    }
    if (formValue.ddPriority != null && formValue.ddPriority != "") {
      this.searchCriteria.param_list.push({ name: "priority", value: formValue.ddPriority, option: "" });

    }


    this.getTasks();
  }

  getTasks() {

    debugger;
    this.isLoading = true;
    //let lstParam: Array<ORMKeyValue> = new Array();
    // lstParam.push(new ORMKeyValue('status', 'new'));


    this.tasksService.getTasks(this.searchCriteria).subscribe(
      data => {

        debugger;
        this.lstTasks = data as Array<any>;

        this.isLoading = false;
        this.totalRecords = this.lstTasks.length;

      },
      error => {
        this.isLoading = false;
        this.getMyTasksError(error);
      }
    );

  }
  getMyTasksError(error: any) {
    this.logMessage.log("getMyTasks Error." + error);
  }



  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {

    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstTasks, this.headers, this.sortEvent, null, null, '');
    this.lstTasks = sortFilterPaginationResult.list;
  }

  viewTask(taskId: number) {

    const modalRef = this.ngbModal.open(ViewTaskComponent, this.popUpOptionsLg);

    modalRef.componentInstance.taskId = taskId;
    modalRef.componentInstance.taskFlowType = this.taskFlowType;
    
    modalRef.result.then((result) => {
      if (result) {
        this.getTasks();
      }
    }
      , (reason) => {

        //alert(reason);
      });

  }

  addNewTask() {

    const modalRef = this.ngbModal.open(AddTaskComponent, this.popUpOptions);

    modalRef.componentInstance.taskId = undefined;
    modalRef.componentInstance.opertaionType = 'new';

    modalRef.result.then((result) => {
      if (result != undefined) {
        this.getTasks();
      }
    }
      , (reason) => {

        //alert(reason);
      });

  }
  onDateFocusOut(date: string, controlName: string) {
    debugger;
    let formatedDate = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined && formatedDate != '') {
      this.searchFormGroup.get(controlName).setValue(formatedDate);
    }
  }
 
}
