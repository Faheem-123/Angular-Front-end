import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { PatientService } from '../../../services/patient/patient.service';
import { LogMessage } from '../../../shared/log-message';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { LabService } from 'src/app/services/lab/lab.service';
import { WrapperObjectSave } from 'src/app/models/general/wrapper-object-save';
import { ORMLabOrderComment } from 'src/app/models/lab/ORMLabOrderComment';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'patient-lab-order-search',
  templateUrl: './patient-lab-order-search.component.html',
  styleUrls: ['./patient-lab-order-search.component.css']
})

export class PatientLabOrderSearchComponent implements OnInit {
  patient_id='';
  public showPatientSearch = false;
  @Input() patientId;
  objencounterToOpen:EncounterToOpen;
  frmSearch: FormGroup;
  frmComment: FormGroup;
  filterForm: FormGroup;
  lstLabCatehory;
  lstSearchresult;
  lstSearchtest;
  isLoading:boolean=false;

  constructor(private formBuilder: FormBuilder,private labService: LabService,
    private logMessage: LogMessage, private dateutil:DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,private openModuleService:OpenModuleService
    ,private modalService:NgbModal) { }
    visitDateModel;
  ngOnInit() {
    this.buildForm();
    this.getLabCategoy();

    this.visitDateModel = this.dateutil.getDateModelFromDateString(this.dateutil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY), DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

    (this.frmSearch.get("txtDateFrom") as FormControl).setValue(this.visitDateModel);
    (this.frmSearch.get("txtDateTo") as FormControl).setValue(this.visitDateModel);

    (this.frmComment.get("txtStatusDate") as FormControl).setValue(this.visitDateModel);
    
  }
  getLabCategoy(){
    this.labService.getLabCategoy(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.lstLabCatehory=data;
      },
      error => {
        this.logMessage.log("getLabCategoy."+error);
      }
    );
  }
  buildForm(){
    this.frmSearch = this.formBuilder.group({
      drptestcategory: this.formBuilder.control("", Validators.required),
      txttestcode: this.formBuilder.control("", Validators.required),
      drpProvider: this.formBuilder.control("", Validators.required),
      drpLocation: this.formBuilder.control("", Validators.required),
      txtPatient: this.formBuilder.control("", Validators.required),
      drpLab: this.formBuilder.control("", Validators.required),
      drpAssigned: this.formBuilder.control("", Validators.required),
      drpStatus: this.formBuilder.control("", Validators.required),
      txtStatusFromDate: this.formBuilder.control("", Validators.required),
      txtStatusToDate: this.formBuilder.control("", Validators.required),
      txtDateFrom: this.formBuilder.control("", Validators.required),
      txtDateTo: this.formBuilder.control("", Validators.required),
      cntrlpatientSearch:this.formBuilder.control("", Validators.required) 
  });
  this.frmComment = this.formBuilder.group({
    txtComment: this.formBuilder.control("", Validators.required),
    drpCommentStatus: this.formBuilder.control("", Validators.required),
    txtStatusDate: this.formBuilder.control("", Validators.required),
  });
  }
  onKeydown(event) 
  {
    if (event.key === "Enter")
    {
      this.showPatientSearch=true;
     // this.dynamicAdd();
    }
  }
  openSelectPatient(patient){
    debugger;
    this.patient_id=patient.patient_id;
    // this.frmSearch = this.formBuilder.group({
    //   cntrlpatientSearch: this.formBuilder.control(patient.name, Validators.required),
    // })
    (this.frmSearch.get("cntrlpatientSearch") as FormControl).setValue(patient.name);
    this.showPatientSearch=false;
  }
  closePatientSearch(){
    this.showPatientSearch = false;
  }
  onSearch(criteria)     {
    debugger;
    if(criteria.txtDateFrom==null || criteria.txtDateFrom=='') 
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Order Search','Please Select the Order Date From.','warning');
      return;
    }
    if(criteria.txtDateTo==null || criteria.txtDateTo=='') 
    {
      GeneralOperation.showAlertPopUp(this.modalService,'Order Search','Please Select the Order Date To.','warning');
      return;
    }

    this.isLoading=true;
    this.lstSearchresult = undefined;
    this.lstSearchtest=undefined;
    this.arrOrderComment=undefined;

    this.lstSearchtest=new Array();
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.criteria = '';
    searchCriteria.option = '';
    searchCriteria.param_list=[];

    if(this.patient_id!='' && criteria.cntrlpatientSearch!=null && criteria.cntrlpatientSearch!='')  
      searchCriteria.param_list.push( { name: "patient_id", value: this.patient_id, option: ""});
    if(criteria.drpAssigned!="" && criteria.drpAssigned!=null)  
      searchCriteria.param_list.push( { name: "assigned_to", value: criteria.drpAssigned, option: ""});
    if(criteria.drpLab!="" && criteria.drpLab!=null)  
      searchCriteria.param_list.push( { name: "lab_id", value: criteria.drpLab, option: ""});

    if(criteria.drpLocation!="" && criteria.drpLocation!="All" && criteria.drpLocation!=null)  
      searchCriteria.param_list.push( { name: "location_id", value: criteria.drpLocation, option: ""});
    if(criteria.drpProvider!="" && criteria.drpProvider!=null && criteria.drpProvider!="All")  
      searchCriteria.param_list.push( { name: "provider_id", value: criteria.drpProvider, option: ""});
    if(criteria.drpStatus!="" && criteria.drpStatus!=null)  
      searchCriteria.param_list.push( { name: "status", value: criteria.drpStatus, option: ""});  
    if(criteria.drptestcategory!="" && criteria.drptestcategory!="ALL" && criteria.drptestcategory!=null && criteria.drptestcategory!="0")  
      searchCriteria.param_list.push( { name: "lab_category_id", value: criteria.drptestcategory, option: ""});  

    if(criteria.txttestcode!="" && criteria.txttestcode!=null)  
      searchCriteria.param_list.push( { name: "cpt_code", value: criteria.txttestcode, option: ""});  
      
    if(criteria.txtDateTo!="" && criteria.txtDateTo!=null)  
      searchCriteria.param_list.push( { name: "order_to_date", value: this.dateutil.getStringDateFromDateModel(criteria.txtDateTo), option: ""});  

    if(criteria.txtDateFrom!="" && criteria.txtDateFrom!=null)  
        searchCriteria.param_list.push( { name: "order_from_date", value: this.dateutil.getStringDateFromDateModel(criteria.txtDateFrom), option: ""});  
     

    if(criteria.txtStatusFromDate!="" && criteria.txtStatusFromDate!=null)  
        searchCriteria.param_list.push( { name: "status_from_date", value: this.dateutil.getDateTimeFormatedString(criteria.txtStatusFromDate,DateTimeFormat.DATEFORMAT_MM_DD_YYYY), option: ""});  
    if(criteria.txtStatusToDate!="" && criteria.txtStatusToDate!=null)  
        searchCriteria.param_list.push( { name: "status_to_date", value: this.dateutil.getDateTimeFormatedString(criteria.txtStatusToDate,DateTimeFormat.DATEFORMAT_MM_DD_YYYY), option: ""});  
    

    this.labService.getSearchLabOrder(searchCriteria).subscribe(
      data => {

        this.isLoading=false;
        this.lstSearchresult = data;
        this.OnSelectionChanged(this.lstSearchresult[0]);

      },
      error => {
        this.isLoading=false;
        //this.getPatientLettersError(error);
      }
    );
  }
  rowId="";
  OnSelectionChanged(order){
    debugger;
    this.rowId=order.order_id;    
    this.getTestDetail(order.order_id);
    this.getOrderComments(order.order_id);
  }
  getTestDetail(order_id)
  {
    this.labService.getSearchTest(order_id).subscribe(
      data => {
        debugger;
        this.lstSearchtest = data;
      },
      error => {
        error => alert(error);
      }
    );

  }
  arrOrderComment;
  getOrderComments(order_id)
  {
  this.labService.getOrderComments(order_id)
  .subscribe(
    data => {
      this.arrOrderComment = data;
    },
    error => {
      this.logMessage.log("An Error Occured while getting getOrderComments list.")
    }
  );
  }
  loadmodule=false;
  module_name='';
  order_id=''
  openResult(value,obj){
    this.module_name=value;
    this.patient_id=obj.patient_id;
    this.order_id=obj.order_id;

    if(value=="order")
    {
      this.objencounterToOpen =new EncounterToOpen();
      this.objencounterToOpen.patient_id=obj.patient_id;
      this.objencounterToOpen.provider_id=obj.provider_id;
      this.objencounterToOpen.location_id=obj.location_id;
      this.objencounterToOpen.visit_date=obj.order_date;
    }
    this.loadmodule=true;    
  }
  navigateBackToSSummary(){
    this.loadmodule=false;
   }
   saveObjectWrapper: WrapperObjectSave;
   onSave(){
    debugger;
     if(this.rowId=="")
     {
      return;
     }
     this.saveObjectWrapper = new WrapperObjectSave();
    

     let objLabComment = new ORMLabOrderComment();
     objLabComment.comment_id = "";
     objLabComment.comment = this.frmComment.get("txtComment").value;
     objLabComment.practice_id = this.lookupList.practiceInfo.practiceId.toString();
     objLabComment.deleted = false;
     objLabComment.created_user = this.lookupList.logedInUser.user_name;
     objLabComment.client_date_created = this.dateutil.getCurrentDateTimeString();
    objLabComment.order_id=this.rowId;
     this.saveObjectWrapper.ormSave = objLabComment;
   
     this.saveObjectWrapper.lstKeyValue=[];
     this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("status",this.frmComment.get("drpCommentStatus").value));
     this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("status_date",this.dateutil.getStringDateFromDateModel(this.frmComment.get("txtStatusDate").value)));
       //appointmentSaveObjectWrapper.saveConfirmationList.push(new ORMKeyValue("allow_duplicate","YES"));
   
     this.labService.updateCommentStatus(this.saveObjectWrapper)
             .subscribe(
            data =>  {
              this.getOrderComments(this.rowId);
              this.frmComment.reset();
            },
            // error => alert(error),
             () => this.logMessage.log("Save Successfull.")
             );
     
   }
   
  openPatientSummary(patient){
    let obj:PatientToOpen=new PatientToOpen();
    obj.patient_id=patient.patient_id;
    obj.patient_name=patient.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }
  onFormClear(){
    this.frmSearch.reset();
    this.patientId='';
    this.visitDateModel = this.dateutil.getDateModelFromDateString(this.dateutil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY), DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

    (this.frmSearch.get("txtDateFrom") as FormControl).setValue(this.visitDateModel);
    (this.frmSearch.get("txtDateTo") as FormControl).setValue(this.visitDateModel);

    (this.frmComment.get("txtStatusDate") as FormControl).setValue(this.visitDateModel);

    this.lstSearchresult=[];
    this.lstSearchtest=[];
    this.arrOrderComment=[];

  }
}
