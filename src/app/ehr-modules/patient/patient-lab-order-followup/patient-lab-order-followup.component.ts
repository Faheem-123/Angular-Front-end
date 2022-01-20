import { Component, OnInit, Input, Inject } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LabService } from 'src/app/services/lab/lab.service';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { PhonePipe } from 'src/app/shared/phone-pipe';
import { ORMLabResultNotes } from 'src/app/models/lab/ORMLabResultNotes';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { PatientSubTabsEnum, MainTabsEnum } from 'src/app/shared/enum-util';
import { PatientNotesComponent } from '../patient-notes/patient-notes.component';

@Component({
  selector: 'patient-lab-order-followup',
  templateUrl: './patient-lab-order-followup.component.html',
  styleUrls: ['./patient-lab-order-followup.component.css']
})
export class PatientLabOrderFollowupComponent implements OnInit {
  @Input() patientId;
  searchForm:FormGroup;
  notesForm:FormGroup;
  lstLabCategory
  lstPatient;
  lstPatientTestDetail;
  isLoading=false;
  showPatientSearch=false;
  total_patient=0;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,private dateTimeUtil: DateTimeUtil,
  private formBuilder:FormBuilder,private labService: LabService,private modalService: NgbModal,
  private openModuleService: OpenModuleService) { }

  ngOnInit() {
    this.buildForm();
    this.getLabCategoy();
  }
  getLabCategoy(){
    this.labService.getLabCategoy(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        this.lstLabCategory=data;
      },
      error => {
        //this.logMessage.log("getLabCategoy."+error);
      }
    );
  }
  buildForm() {
		this.searchForm = this.formBuilder.group({
      txtPatient: this.formBuilder.control(""),
      drpProvider: this.formBuilder.control((this.lookupList.logedInUser.defaultProvider>0 && this.lookupList.logedInUser.defaultProvider!=null) ?this.lookupList.logedInUser.defaultProvider:"All"),
      drpCategory: this.formBuilder.control("ALL"),
      chkSigned: this.formBuilder.control(false),
      chkNotesExsist: this.formBuilder.control(true),
      drpFollowupNotes: this.formBuilder.control(""),
      drpFollowupAction: this.formBuilder.control(""),
      drpLocation: this.formBuilder.control((this.lookupList.logedInUser.defaultLocation>0 && this.lookupList.logedInUser.defaultLocation!=null) ?this.lookupList.logedInUser.defaultLocation:"All"),
      txtFromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      txtToDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel())
     }),
     this.notesForm = this.formBuilder.group({
      txtNotes: this.formBuilder.control("",Validators.required),
      drpFollowUp: this.formBuilder.control("", Validators.required),
      drpFollowUpaction: this.formBuilder.control(""),
      chkAlert: this.formBuilder.control(false)
    })
  }
  rowId="";
  rowPatientName="";
  searchCriteria: SearchCriteria;
  onSearch(criteria){
    debugger;
    if((this.searchForm.get('txtFromDate') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Lab Order FollowUp Validation","Please Enter From Date",'warning')
      return;
    }
    if((this.searchForm.get('txtToDate') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Lab Order FollowUp Validation","Please Enter From To",'warning')
      return;
    }
    this.isLoading=true;

    this.searchCriteria=new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];

    if(this.patient_id!='' && criteria.txtPatient!=null && criteria.txtPatient!='')  
      this.searchCriteria.param_list.push( { name: "patient_id", value: this.patient_id, option: ""});

    if(criteria.drpProvider!="" && criteria.drpProvider!="null" && criteria.drpProvider!=null && criteria.drpProvider!="All")  
      this.searchCriteria.param_list.push( { name: "provider_id", value: criteria.drpProvider, option: ""});

    if(criteria.drpLocation!="" && criteria.drpLocation!=null && criteria.drpLocation!="null" && criteria.drpLocation!="All")  
      this.searchCriteria.param_list.push( { name: "location_id", value: criteria.drpLocation, option: ""});

    if(criteria.drpCategory!="" && criteria.drpCategory!="ALL" && criteria.drpCategory!=null && criteria.drpCategory!="0")  
      this.searchCriteria.param_list.push( { name: "lab_category_id", value: criteria.drpCategory, option: ""});

    if(criteria.drpFollowupNotes!=""  && criteria.drpFollowupNotes!=null)  
      this.searchCriteria.param_list.push( { name: "follow_up_notes", value: criteria.drpFollowupNotes, option: ""});

    if(criteria.drpFollowupAction!=""  && criteria.drpFollowupAction!=null)  
      this.searchCriteria.param_list.push( { name: "follow_up_action", value: criteria.drpFollowupAction, option: ""});

    

      this.searchCriteria.param_list.push( { name: "signed", value: criteria.chkSigned, option: ""});
      this.searchCriteria.param_list.push( { name: "notes_exist", value: criteria.chkNotesExsist, option: ""});
      this.searchCriteria.param_list.push( { name: "from_date", value: this.dateTimeUtil.getStringDateFromDateModel(criteria.txtFromDate), option: ""});
      this.searchCriteria.param_list.push( { name: "to_date", value: this.dateTimeUtil.getStringDateFromDateModel(criteria.txtToDate), option: ""});

    this.total_patient=0;
    this.lstPatient=[];
    this.lstPatientTestDetail=[];
    this.acPhysicianNotesFromDB=[];
    this.acStaffNotesFromDB=[];

    this.labService.getLabFollowupPatients(this.searchCriteria).subscribe(
      data => {
        debugger;
        this.isLoading=false;
        this.lstPatient = data;
        this.total_patient=this.lstPatient.length;
        if(this.lstPatient.length>0)
        {
          this.rowId=this.lstPatient[0].patient_id;
          this.rowPatientName=this.lstPatient[0].patient_display_name;
          this.OnPatientSelectionChanged(this.lstPatient[0]);
        }
       // this.OnSelectionChanged(this.lstSearchresult[0]);

      },
      error => {
        this.isLoading=false;
        //this.getPatientLettersError(error);
      }
    );

  }
  patient_id='';
  openSelectPatient(patient){
    this.patient_id=patient.patient_id;
    (this.searchForm.get("txtPatient") as FormControl).setValue(patient.name);
    this.showPatientSearch=false;
  }
  closePatientSearch(){
    this.showPatientSearch = false;
  }
  lblPrimaryContactType="N/A";
  lblCellPhone="N/A";
  lblHomePhone="N/A";
  lblWorkPhone="N/A";
  rowPatientAge="";
  rowPatientLanguage="";

  OnPatientSelectionChanged(pat){
    debugger;
    this.rowId=pat.patient_id;    
    this.rowPatientName=pat.patient_display_name;
    this.rowPatientAge=pat.age;
    this.rowPatientLanguage=pat.patient_language;

    this.lblPrimaryContactType="N/A";
    this.lblCellPhone="N/A";
    this.lblHomePhone="N/A";
    this.lblWorkPhone="N/A";

    this.lblPrimaryContactType=pat.primary_contact_type;
    if (pat.cell_phone != null && pat.cell_phone != "") {
      this.lblCellPhone = new PhonePipe().transform(pat.cell_phone);
    }
    if (pat.home_phone != null && pat.home_phone != "") {
      this.lblHomePhone = new PhonePipe().transform(pat.home_phone);
    }
    if (pat.work_phone != null && pat.work_phone != "") {
      this.lblWorkPhone = new PhonePipe().transform(pat.work_phone);
    }
    for(let i=0;i<this.searchCriteria.param_list.length;i++)
    {
      if(this.searchCriteria.param_list[i].name=="patient_id")
      {
        this.searchCriteria.param_list.splice(i, 1);
        break;
      }
    }
    this.searchCriteria.param_list.push( { name: "patient_id", value: pat.patient_id, option: ""});
    this.isLoading=true;
    this.labService.getLabFollowupPatientTestDetail(this.searchCriteria).subscribe(
      data => {
        debugger;
        this.isLoading=false;
        this.lstPatientTestDetail = data;
        if(this.lstPatientTestDetail.length>0)
        {
         // this.rowId=this.lstPatient[0].patient_id;;
         this.OnTestSelectionChanged(this.lstPatientTestDetail[0]);
        }
       // this.OnSelectionChanged(this.lstSearchresult[0]);

      },
      error => {
        this.isLoading=false;
        //this.getPatientLettersError(error);
      }
    );

   
  }
  acStaffNotesFromDB;
  acPhysicianNotesFromDB;
  selectedOrder_id="";
  OnTestSelectionChanged(tst)
  {
    this.selectedOrder_id=tst.order_id;

    this.labService.getPatientLabsStaffNotes(tst.order_id).subscribe(
      data => {
        debugger;
        this.acStaffNotesFromDB = data;
         
      },
      error => {
        
      }
    );
    this.labService.getPatientLabsPhysicianNotes(tst.order_id).subscribe(
      data => {
        debugger;
        this.acPhysicianNotesFromDB = data;
      },
      error => {
        
      }
    );
  }
  onKeydown(event) 
  {
    if (event.key === "Enter")
    {
      this.showPatientSearch=true;
    }
  }
  onSaveNotes(frm){
    debugger;
  if(frm.txtNotes==null || frm.txtNotes=="")
  {
    GeneralOperation.showAlertPopUp(this.modalService,'Add Notes Validation','Please Enter Notes','warning');
    return;
  }
  if(frm.drpFollowUp==null || frm.drpFollowUp=="")
  {
    GeneralOperation.showAlertPopUp(this.modalService,'Add Notes Validation','Please Select FollowUp Status','warning')
    return;
  }
  if(this.selectedOrder_id==null || this.selectedOrder_id==undefined || this.selectedOrder_id=="")
  {
    GeneralOperation.showAlertPopUp(this.modalService,'Add Notes Validation','Please Select Any Order','warning')
    return;
  }
    let objResultNotes = new ORMLabResultNotes;
    objResultNotes.notes_id = "";
    objResultNotes.test_id = "-1";
    objResultNotes.practice_id=this.lookupList.practiceInfo.practiceId.toString();
    objResultNotes.order_id = this.selectedOrder_id;
    objResultNotes.notes = frm.txtNotes;
    objResultNotes.alert = frm.chkAlert;
    objResultNotes.deleted = false;
    objResultNotes.created_user = this.lookupList.logedInUser.user_name;
    objResultNotes.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    this.labService.saveResultComments(objResultNotes).subscribe(
    data => {

      let searchCriteria:SearchCriteria=new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "follow_up_notes", value:frm.drpFollowUp,option: "" },
      { name: "followup_action", value:frm.drpFollowUpaction,option: "" },
      { name: "user", value: this.lookupList.logedInUser.user_name,option: "" },
      { name: "order_id", value: this.selectedOrder_id,option: "" }
    ];
    this.labService.updateOrderFollowup(searchCriteria).subscribe(
      data => {
        if(data>0)
        {
          const modalRef = this.modalService.open(AlertPopupComponent, { windowClass: 'modal-adaptive' });
          modalRef.componentInstance.promptHeading = 'Add Notes';
          modalRef.componentInstance.promptMessage = "Notes Add Successfully";
          modalRef.componentInstance.alertType = 'info';

          this.OnTestSelectionChanged({order_id:this.selectedOrder_id});
          this.notesForm.reset();
        }
      },
      error => {
      }
    );
    },
    error => {        
    }
    );
  }
  onMenuClick(data,src)
  {
    debugger
    if(src=="Patient")
    {
      this.openDesiredTab(PatientSubTabsEnum.SUMMARY);
    }
    else if(src=="Appointment")
    {
      this.openDesiredTab(PatientSubTabsEnum.APPOINTMENTS);
    }
    else if(src=="Encounters")
    {
      this.openDesiredTab(PatientSubTabsEnum.ENCOUNTER);
    }
    else if(src=="Document")
    {
      this.openDesiredTab(PatientSubTabsEnum.DOCUMENTS);
    }
    else if(src=="Letters")
    {
      this.openDesiredTab(PatientSubTabsEnum.LETTERS);
    }
    else if(src=="Notes")
    {
        const modalRef = this.modalService.open(PatientNotesComponent, this.NotesPoupUp);
    
        modalRef.componentInstance.patientId = this.rowId;
        modalRef.componentInstance.patientName = this.rowPatientName;
        modalRef.componentInstance.dob = "";
        modalRef.componentInstance.callingFrom = 'patient';
    }
    else if(src=='Scheduler')
    {
      this.openModuleService.navigateToTab.emit(MainTabsEnum.SCHEDULER);
    }
  }
  NotesPoupUp: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  openDesiredTab(tab:PatientSubTabsEnum)
  {
    let obj: PatientToOpen = new PatientToOpen();
      obj.patient_id = Number(this.rowId);
      obj.patient_name = this.rowPatientName;
      if(tab!=PatientSubTabsEnum.SUMMARY)
        obj.child_module = tab;
      this.openModuleService.openPatient.emit(obj);
  }
}
