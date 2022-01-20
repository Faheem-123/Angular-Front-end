import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LogMessage } from 'src/app/shared/log-message';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { TasksService } from 'src/app/services/tasks.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ViewTaskComponent } from '../../tasks/view-task/view-task.component';

@Component({
  selector: 'dashboard-tasks',
  templateUrl: './dashboard-tasks.component.html',
  styleUrls: ['./dashboard-tasks.component.css']
})
export class DashboardTasksComponent implements OnInit {

  lstTasks: Array<any>;
  searchCriteria: SearchCriteria;
  totalRecords: number;
  isLoading: boolean = false;
  selectedTaskId:number;

  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  constructor(private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private tasksService: TasksService,
    private ngbModal: NgbModal) {

  }

  ngOnInit() {

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = 'INBOX';
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "user_name", value: this.lookupList.logedInUser.user_name, option: "" });
    this.searchCriteria.param_list.push({ name: "status", value: "In Complete", option: "" });

    this.getTasks();

  }


  getTasks() {

    debugger;
    this.isLoading = true;
    this.lstTasks = undefined;
    this.totalRecords = 0;

    this.tasksService.getTasks(this.searchCriteria).subscribe(
      data => {

        debugger;
        this.isLoading = false;
        this.lstTasks = data as Array<any>;
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

  taskRowChanged(taskId: number) {
    this.selectedTaskId = taskId;
  }


  viewTask(taskId: number) {

    const modalRef = this.ngbModal.open(ViewTaskComponent, this.popUpOptionsLg);

    modalRef.componentInstance.taskId = taskId;
    modalRef.componentInstance.taskFlowType='INBOX';

    modalRef.result.then((result) => {
      if (result) {
        this.getTasks();
      }
    }
      , (reason) => {

        //alert(reason);
      });

  }
}
