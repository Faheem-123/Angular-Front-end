import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TasksService } from 'src/app/services/tasks.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralService } from 'src/app/services/general/general.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ORMTaskSave } from 'src/app/models/tasks/orm-task-save';
import { ServiceResponseStatusEnum ,CallingFromEnum} from 'src/app/shared/enum-util';

@Component({
  selector: 'add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {

  @Input() taskId: number;
  @Input() callingFrom = CallingFromEnum;
  @Input() opertaionType: string = 'new';
  @Input() taskDetail: any;

  @Input() patientId: number;
  @Input() claimId: number;
  @Input() chartId: number;

  @Input() patientName: number;
  @Input() encounterDate: string;
  @Input() dos: string;


  taskForm: FormGroup;
  showPatientSearch: boolean = false;

  isLoading: boolean = false;
  title: string = 'Task';


  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private tasksService: TasksService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private generalService: GeneralService,
    private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {


    debugger;
    
    if (this.opertaionType == 'new') {
      this.title = 'New Task';
    }
    else if (this.opertaionType == 'edit') {
      this.title = 'Edit Task';
    }
    else if (this.opertaionType == 'forward') {
      this.title = 'Forward Task';
    }


    if (this.lookupList.practiceUsersList == undefined || this.lookupList.practiceUsersList.length == 0) {
      this.getPracticeUsersList();
    }

    this.buildForm();

    if (this.opertaionType == 'edit' || this.opertaionType == 'forward') {
      //  this.getTask();
      this.assignData();
    }
  }

  buildForm() {

    this.taskForm = this.formBuilder.group({
      txtTitle: this.formBuilder.control(null, Validators.required),
      ddUsers: this.formBuilder.control(null, Validators.required),
      ddStatus: this.formBuilder.control('New', Validators.required),
      ddPriority: this.formBuilder.control('Normal', Validators.required),
      dpDateDue: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      txtDetail: this.formBuilder.control(null),
      txtPatientSearch: this.formBuilder.control(this.patientName)
    }
    )
  }



  assignData() {

    debugger;


    /*
    this.taskForm = this.formBuilder.group({
      txtTitle: this.formBuilder.control(null, Validators.required),
      ddUsers: this.formBuilder.control(null, Validators.required),
      ddStatus: this.formBuilder.control('new', Validators.required),
      ddPriority: this.formBuilder.control('normal', Validators.required),
      dpDateDue: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      txtDetail: this.formBuilder.control(null),
      txtPatientSearch: this.formBuilder.control(null)
    }
    */

    this.taskForm.get('txtTitle').setValue(this.taskDetail.title);
    this.taskForm.get('ddStatus').setValue(this.taskDetail.status);
    this.taskForm.get('ddPriority').setValue(this.taskDetail.priority);
    this.taskForm.get('dpDateDue').setValue(this.dateTimeUtil.getDateModelFromDateString(this.taskDetail.due_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
    this.taskForm.get('txtDetail').setValue(this.taskDetail.detail);
    this.taskForm.get('txtPatientSearch').setValue(this.taskDetail.patient_name);
    this.patientId = this.taskDetail.patient_id;
    this.claimId = this.taskDetail.claim_id;
    this.chartId = this.taskDetail.chart_id;
    this.patientName = this.taskDetail.patient_name;

    this.dos = this.taskDetail.dos;
    this.encounterDate = this.taskDetail.visit_date;
    
    if (this.opertaionType == 'edit') {
      this.taskForm.get('ddUsers').setValue(this.taskDetail.assigned_to);
    }
    else {
      this.taskForm.get('ddUsers').setValue(null);
    }
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


  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {
      this.patientId = undefined;
    }

  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.taskForm.get("txtPatientSearch").setValue(null);
    }

  }

  openSelectPatient(patObject) {

    debugger;
    this.logMessage.log(patObject);

    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;


    this.taskForm.get("txtPatientSearch").setValue(this.patientName);
    this.showPatientSearch = false;
  }

  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  errorMsg: string = '';
  validateData(formVal: any) {

    this.errorMsg = '';


    if (this.opertaionType != 'forward' && formVal.txtTitle == undefined || formVal.txtTitle == null || formVal.txtTitle == '') {
      this.errorMsg = 'Please enter title';
    }
    else if (formVal.ddUsers == undefined || formVal.ddUsers == null || formVal.ddUsers == '') {
      this.errorMsg = 'Please selected user.';
    }
    else if (this.opertaionType != 'forward' && formVal.dpDateDue == undefined || formVal.dpDateDue == null || formVal.dpDateDue == '') {
      this.errorMsg = 'Please enter Due Date.';
    }
    else if (this.opertaionType != 'forward' && !this.dateTimeUtil.isValidDateTime(formVal.dpDateDue, DateTimeFormat.DATE_MODEL)) {
      this.errorMsg = 'Due Date is invalid.';
    }
    else if (this.opertaionType != 'forward' && formVal.ddStatus == undefined || formVal.ddStatus == null || formVal.ddStatus == '') {
      this.errorMsg = 'Please select status.';
    }
    else if (this.opertaionType != 'forward' && formVal.txtDetail == undefined || formVal.txtDetail == null || formVal.txtDetail == '') {
      this.errorMsg = 'Please enter detail.';
    }

    if (this.errorMsg == '') {
      return true;
    }
    else {
      return false;
    }
  }

  onSubmit(formVal: any) {

    if (this.validateData(formVal)) {

      let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

      debugger;
      let ormTask: ORMTaskSave = new ORMTaskSave();

      if (this.taskDetail != undefined) {
        ormTask.task_id = this.taskDetail.task_id;
        ormTask.created_user = this.taskDetail.created_user;
        ormTask.date_created = this.taskDetail.date_created;
        ormTask.client_date_created = this.taskDetail.client_date_created;
        ormTask.operation_performed='Modified';
      }
      else {
        ormTask.operation_performed='Created';
        ormTask.created_user = this.lookupList.logedInUser.user_name;
        ormTask.client_date_created = clientDateTime;
      }

      if (this.opertaionType == 'forward') {
        ormTask.claim_id = this.taskDetail.claim_id;;
        ormTask.patient_id = this.taskDetail.patient_id;;
        ormTask.chart_id = this.taskDetail.chart_id;
        ormTask.title = this.taskDetail.title;
        ormTask.status = this.taskDetail.status;
        ormTask.priority = this.taskDetail.priority;
        ormTask.due_date = this.taskDetail.due_date;
        ormTask.operation_performed='Forwarded';
      }
      else {
        ormTask.claim_id = this.claimId;
        ormTask.patient_id = this.patientId;
        ormTask.chart_id = this.chartId;
        ormTask.title = formVal.txtTitle;
        ormTask.status = formVal.ddStatus;
        ormTask.priority = formVal.ddPriority;
        ormTask.due_date = this.dateTimeUtil.getStringDateFromDateModel(formVal.dpDateDue);
        
      }

      ormTask.modified_user = this.lookupList.logedInUser.user_name;
      ormTask.client_date_modified = clientDateTime;
      ormTask.practice_id = this.lookupList.practiceInfo.practiceId;
      ormTask.detail = formVal.txtDetail;
      ormTask.assigned_to = formVal.ddUsers;
      ormTask.assigned_from = this.lookupList.logedInUser.user_name;
      ormTask.practice_id = this.lookupList.practiceInfo.practiceId;
      ormTask.system_ip = this.lookupList.logedInUser.systemIp;      

      this.tasksService.saveTask(ormTask).subscribe(
        data => {
          this.saveTaskSuccess(data);
        },
        error => {
          this.saveTaskError(error);
        }
      );
    }
  }

  saveTaskSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);
    }
  }

  saveTaskError(error: any) {
    this.logMessage.log("saveTask Error.");
  }

}
