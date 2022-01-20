import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { AddTaskComponent } from '../add-task/add-task.component';

@Component({
  selector: 'tasks-main',
  templateUrl: './tasks-main.component.html',
  styleUrls: ['./tasks-main.component.css']
})
export class TasksMainComponent implements OnInit {

  @Output() backToMain = new EventEmitter<any>();

  constructor(private ngbModal: NgbModal) { }

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  ngOnInit() {
  }

  addNewTask() {

    const modalRef = this.ngbModal.open(AddTaskComponent, this.popUpOptions);

    modalRef.componentInstance.taskId = undefined;
    modalRef.componentInstance.opertaionType = 'new';

    modalRef.result.then((result) => {
      if (result != undefined) {


      }
    }
      , (reason) => {

        //alert(reason);
      });

  }

  selectedTab: string = "tab_my_tasks";
  onTabChange(event: NgbTabChangeEvent) {

    switch (event.nextId) {
      case "tab_back":
        this.backToMain.emit();
      case "tab_my_tasks":
        this.selectedTab = "tab_my_tasks";
      case "tab_send_taks":
        this.selectedTab = "tab_send_taks";
      default:
        break;
    }

  }




}
