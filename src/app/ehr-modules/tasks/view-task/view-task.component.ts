import { Component, OnInit, Input, Inject } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TasksService } from 'src/app/services/tasks.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralService } from 'src/app/services/general/general.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { AddTaskComponent } from '../add-task/add-task.component';
import { UpdateRecordModel } from 'src/app/models/general/update-record-model';
import { ServiceResponseStatusEnum, AlertTypeEnum, PromptResponseEnum, PatientSubTabsEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css']
})
export class ViewTaskComponent implements OnInit {

  @Input() taskId: number;
  @Input() taskFlowType: string; // INBOX|OUTBOX

  isLoading: boolean = false;
  isProcessing: boolean = false;
  taskDetail: any;
  lstTaskLog: Array<any>;

  loadingCount: number = 0;
  isUserTaskOwner: boolean = false;

  isCompleted: boolean = false;


  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(public activeModal: NgbActiveModal,
    private tasksService: TasksService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private generalService: GeneralService,
    private dateTimeUtil: DateTimeUtil,
    private openModuleService: OpenModuleService) { }

  ngOnInit() {

    this.loadingCount = 2;
    this.getTask();
    this.getTaskLog();
  }

  getTask() {
    debugger;
    this.isLoading = true;

    this.tasksService.getTaskById(this.taskId).subscribe(
      data => {
        this.taskDetail = data;

        if (this.taskDetail.status.toUpperCase() == 'COMPLETED') {
          this.isCompleted = true;
        }
        else {
          this.isCompleted = false;
        }

        if (this.lookupList.logedInUser.user_name == this.taskDetail.created_user) {
          this.isUserTaskOwner = true;
        }

        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.isLoading = false;
        }

      },
      error => {
        this.isLoading = false;
        this.getTaskError(error);
      }
    );
  }

  getTaskError(error: any) {
    this.logMessage.log("getTask Error." + error);
  }

  getTaskLog() {

    this.tasksService.getTaskLog(this.taskId).subscribe(
      data => {
        debugger;
        this.lstTaskLog = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.getTaskLogError(error);
      }
    );
  }

  getTaskLogError(error: any) {
    this.logMessage.log("getTaskLog Error." + error);
  }

  openPatient() {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = this.taskDetail.patient_id;
    obj.patient_name = this.taskDetail.patient_name;

    if(this.taskDetail.claim_id!=undefined){
      obj.child_module = PatientSubTabsEnum.CLAIM;
      obj.child_module_id = this.taskDetail.claim_id;

    }
    else   if(this.taskDetail.chart_id!=undefined){
      obj.child_module = PatientSubTabsEnum.ENCOUNTER;
      obj.child_module_id = this.taskDetail.chart_id;
    }
    obj.callingFrom=CallingFromEnum.TASK;
    this.openModuleService.openPatient.emit(obj);
    this.activeModal.close();
  }
  
  editTask(operation: string) {

    const modalRef = this.ngbModal.open(AddTaskComponent, this.popUpOptions);

    modalRef.componentInstance.taskId = this.taskId;
    modalRef.componentInstance.taskDetail = this.taskDetail;
    modalRef.componentInstance.opertaionType = operation;


    modalRef.result.then((result) => {
      if (result != undefined) {


      }
    }
      , (reason) => {

        //alert(reason);
      });


  }

  markAsCompleted() {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Action!';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to mark the task as completed ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        this.isProcessing = true;

        let updateRecordModel: UpdateRecordModel = new UpdateRecordModel();
        updateRecordModel.id = this.taskId;
        updateRecordModel.client_datetime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
        updateRecordModel.user_name = this.lookupList.logedInUser.user_name;
        updateRecordModel.client_ip = this.lookupList.logedInUser.systemIp;

        this.tasksService.markTaskAsCompleted(updateRecordModel).subscribe(
          data => {
            this.markTaskAsCompletedSuccess(data);
          },
          error => {
            this.markTaskAsCompletedError(error);
          }
        );
      }
    }, (reason) => {
      //alert(reason);
    });



  }

  markTaskAsCompletedSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);
    }
  }

  markTaskAsCompletedError(error: any) {
    this.logMessage.log("markTaskAsCompleted Error.");
  }

  deleteTask() {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Action!';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to delete task ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        this.isProcessing = true;

        let updateRecordModel: UpdateRecordModel = new UpdateRecordModel();
        updateRecordModel.id = this.taskId;
        updateRecordModel.client_datetime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
        updateRecordModel.user_name = this.lookupList.logedInUser.user_name;
        updateRecordModel.client_ip = this.lookupList.logedInUser.systemIp;

        if(this.taskFlowType=='INBOX'){
          updateRecordModel.option='RECEIVER';
        }
        else  if(this.taskFlowType=='OUTBOX'){
          if(this.isUserTaskOwner){
            updateRecordModel.option='OWNER';
          }
          else{
            updateRecordModel.option='SENDDER';
          }
        }

        this.tasksService.deleteTask(updateRecordModel).subscribe(
          data => {
            this.deleteTaskSuccess(data);
          },
          error => {
            this.deleteTaskError(error);
          }
        );
      }
    }, (reason) => {
      //alert(reason);
    });
  }


  deleteTaskSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);
    }
  }

  deleteTaskError(error: any) {
    this.logMessage.log("deleteTask Error.");
  }

}
