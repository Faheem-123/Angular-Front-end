import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { SetupService } from 'src/app/services/setup.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMPractice } from 'src/app/models/setting/ORMPractice';
import { ORMPracticeServices } from 'src/app/models/setting/ORMPracticeServices';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'practice-setup',
  templateUrl: './practice-setup.component.html',
  styleUrls: ['./practice-setup.component.css']
})
export class PracticeSetupComponent implements OnInit {

  inputForm:FormGroup;
  strOperation='';
  lstAllPracticesServices: Array<any>;
  lstAllPractices: Array<any>;
  selectedPracticeID = "";
  selectedRow;
  lstZipCityState: Array<any>;
  acPracticeServicesFiltered;
  acPracticeServicesSave: Array<ORMPracticeServices>;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,private generalService: GeneralService,
  private modalService: NgbModal,private generalOperation: GeneralOperation,
  private dateTimeUtil: DateTimeUtil,
  private formBuilder: FormBuilder,private setupService: SetupService) { }

  ngOnInit() {
    this.buildForm();
    this.inputForm.disable();
    this.getAllPractices();
    this.GetPracticeServices();
  }
   buildForm() {
     this.inputForm = this.formBuilder.group({
       txtPracticeID: this.formBuilder.control(null, Validators.required),
       ddlPracticeStatus: this.formBuilder.control(null, Validators.required),
       txtPracticeZip: this.formBuilder.control(null, Validators.required),
       txtPracticeState: this.formBuilder.control(null, Validators.required),
       txtPracticeName: this.formBuilder.control(null, Validators.required),
       ddlCity: this.formBuilder.control(null, Validators.required),
       txtPracticeAddress: this.formBuilder.control(null, Validators.required),
       txtPracticePhone: this.formBuilder.control(null, Validators.required),
       txtPracticeFax: this.formBuilder.control(null, Validators.required),
       txtPracticeWebsite: this.formBuilder.control(null, Validators.required),
       txtPracticeContactNo: this.formBuilder.control(null, Validators.required),
       txtPracticePerson: this.formBuilder.control(null, Validators.required),
       txtPracticeNPI: this.formBuilder.control(null, Validators.required),
       txtPracticeUserDomain: this.formBuilder.control(null, Validators.required),
       txtPracticeComments: this.formBuilder.control(null, Validators.required)
     });
   }
    getAllPractices() {
     this.setupService.getAllPractices().subscribe(
       data => {
         debugger;
         lstAllPractices: new Array();
         this.lstAllPractices = data as Array<any>;
         if(this.lstAllPractices.length>0)
            this.changePracticeRow(this.lstAllPractices[0]);
       },
       error => {
         return;
       }
     );
   }
   GetPracticeServices() {
     this.setupService.GetPracticeServices('499').subscribe(
       data => {
         debugger;
         lstAllPracticesServices: new Array();
         this.lstAllPracticesServices = data as Array<any>;

         if(this.lstAllPracticesServices!=null || this.lstAllPracticesServices != undefined){
           this.acPracticeServicesFiltered = this.generalOperation.filterArray(this.lstAllPracticesServices,"practice_id", this.selectedPracticeID);
        }
       },
       error => {
         return;
       }
     );
   }
  onAdd(){
    this.strOperation="new";
    this.inputForm.reset();
    this.inputForm.enable();
    this.inputForm.controls.txtPracticeID.disable();
    this.selectedPracticeID = "";
    this.clearCheckBoxServices();
  }
  onEdit(){
    this.strOperation="edit";
    this.inputForm.enable();
  }
  clearCheckBoxServices(){
    for (var i = 0; i < this.acPracticeServicesFiltered.length; i++) {
        this.acPracticeServicesFiltered[i].active = false;
    }
  }
  onSave(){
    if(!this.validateData()){
      return;
    }else{

      let ormPracticeSave: ORMPractice = new ORMPractice();
      if(this.strOperation == "new"){
        ormPracticeSave.practice_id = "";
      }else if(this.strOperation == "edit"){
        ormPracticeSave.practice_id = (this.inputForm.get('txtPracticeID') as FormControl).value;
      }
      
      ormPracticeSave.practice_name = (this.inputForm.get('txtPracticeName') as FormControl).value;
      ormPracticeSave.address1 = (this.inputForm.get('txtPracticeAddress') as FormControl).value;
      ormPracticeSave.contact_person_name = (this.inputForm.get('txtPracticePerson') as FormControl).value;
      ormPracticeSave.phone = (this.inputForm.get('txtPracticePhone') as FormControl).value;
      ormPracticeSave.fax = (this.inputForm.get('txtPracticeFax') as FormControl).value;
      ormPracticeSave.contact_person_number = (this.inputForm.get('txtPracticeContactNo') as FormControl).value;
      ormPracticeSave.notes = (this.inputForm.get('txtPracticeComments') as FormControl).value;
      ormPracticeSave.website = (this.inputForm.get('txtPracticeWebsite') as FormControl).value;
      ormPracticeSave.zip = (this.inputForm.get('txtPracticeZip') as FormControl).value;
      ormPracticeSave.state = (this.inputForm.get('txtPracticeState') as FormControl).value;
      ormPracticeSave.domain_name = (this.inputForm.get('txtPracticeUserDomain') as FormControl).value;
      ormPracticeSave.npi = (this.inputForm.get('txtPracticeNPI') as FormControl).value;
      
      ormPracticeSave.city = (this.inputForm.get("ddlCity") as FormControl).value;

      ormPracticeSave.system_ip = this.lookupList.logedInUser.systemIp;
      ormPracticeSave.deleted = false;
      if((this.inputForm.get("ddlPracticeStatus") as FormControl).value == "INACTIVE"){
        ormPracticeSave.inactive=true;
      }else{
        ormPracticeSave.inactive=false;
      }

      if(this.selectedPracticeID !== null && this.selectedPracticeID != "")
				{
					ormPracticeSave.account_type = this.selectedRow.account_type;
					ormPracticeSave.address2 = this.selectedRow.address2;
					ormPracticeSave.billing_percentage = this.selectedRow.billing_percentage;
					ormPracticeSave.client_date_created = this.selectedRow.client_date_created;
					ormPracticeSave.created_user = this.selectedRow.created_user;
					ormPracticeSave.date_created = this.selectedRow.date_created;					
					ormPracticeSave.fax_password = this.selectedRow.fax_password;
					ormPracticeSave.fax_url = this.selectedRow.fax_url;
					ormPracticeSave.fax_user = this.selectedRow.fax_user;
					ormPracticeSave.noshow_charges = this.selectedRow.noshow_charges;
					ormPracticeSave.taxid = this.selectedRow.taxid;
        }else{
          if(this.strOperation == "new"){
            ormPracticeSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
            ormPracticeSave.created_user = this.lookupList.logedInUser.user_name;
          }
        }
       
        this.setupService.saveupdatePractices(ormPracticeSave)
        .subscribe(
          data => this.saveupdatePracticeSuccessfull(data),
          error => {
            this.saveupdatePracticeError(error);
          }
        );
    }
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  saveupdatePracticeError(error: any) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Practice Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Practice."
  }
  saveupdatePracticeSuccessfull(data){
    this.acPracticeServicesSave = new Array();
    let practObj: ORMPracticeServices = new ORMPracticeServices;

    for (var i = 0; i < this.acPracticeServicesFiltered.length; i++) {
      //if(this.acPracticeServicesFiltered[i].active == true){
      practObj = new ORMPracticeServices();
      if(this.acPracticeServicesFiltered[i].practice_service_id==null || this.acPracticeServicesFiltered[i].practice_service_id==""){						
        practObj.created_user = this.lookupList.logedInUser.user_name;
        practObj.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      }
      else{
        practObj.practice_service_id = this.acPracticeServicesFiltered[i].practice_service_id;
        practObj.created_user = this.acPracticeServicesFiltered[i].created_user;
        practObj.date_created = this.acPracticeServicesFiltered[i].date_created;
        practObj.client_date_created = this.acPracticeServicesFiltered[i].client_date_created;
      }
      
      practObj.practice_id = data.practice_id;//this.selectedPracticeID;
      practObj.active = this.acPracticeServicesFiltered[i].active;
      practObj.deleted = false;
      practObj.service_id = this.acPracticeServicesFiltered[i].service_id;					
      practObj.modified_user = this.lookupList.logedInUser.user_name;
      practObj.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

      this.acPracticeServicesSave.push(practObj);
    //}
    }

    if (this.acPracticeServicesSave.length > 0) {
      this.setupService.saveupdatePracticesServices(this.acPracticeServicesSave)
      .subscribe(
        data => this.saveupdatePracticeServicesSuccessfull(data),
        error => {
          this.saveupdatePracticeServicesError(error);
        }
      );
    }
  }
  saveupdatePracticeServicesSuccessfull(data){
    this.GetPracticeServices();
    this.getAllPractices();
    this.onCancel();
  }
  saveupdatePracticeServicesError(error: any) {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    modalRef.componentInstance.promptHeading = 'Practice Services Save';
    modalRef.componentInstance.promptMessage = "An Error Occured while saving Practice Services."
  }
  validateData(): boolean {
    let strAlertMsg: string = "";
    if (this.inputForm.get("txtPracticeName").value == "" || this.inputForm.get("txtPracticeName").value == undefined) {
      strAlertMsg = "Please enter Practice Name.";
    }else if (this.inputForm.get("txtPracticeAddress").value == "" || this.inputForm.get("txtPracticeAddress").value == undefined){
      strAlertMsg = "Please enter Practice Address."
    }else if (this.inputForm.get("txtPracticeZip").value == "" || this.inputForm.get("txtPracticeZip").value == undefined){
      strAlertMsg = "Please enter Practice Zip Code."
    }else if (this.inputForm.get("ddlCity").value == "" || this.inputForm.get("ddlCity").value == undefined){
      strAlertMsg = "Please enter Select Practice City."
    }else if (this.inputForm.get("txtPracticePhone").value == "" || this.inputForm.get("txtPracticePhone").value == undefined){
      strAlertMsg = "Please enter Enter Practice Phone."
    }else if (this.inputForm.get("txtPracticeFax").value == "" || this.inputForm.get("txtPracticeFax").value == undefined){
      strAlertMsg = "Please enter Select Practice Fax."
    }else if (this.inputForm.get("txtPracticeUserDomain").value == "" || this.inputForm.get("txtPracticeUserDomain").value == undefined){
      strAlertMsg = "Please enter User Domain."
    }
    if (strAlertMsg != ""){
      GeneralOperation.showAlertPopUp(this.modalService, 'Practice Setup', strAlertMsg, AlertTypeEnum.WARNING)
      return false;
    }else{
      return true;
    }
  }
  onCancel(){
    this.strOperation="";
    this.inputForm.reset();
    this.inputForm.disable();
    this.clearCheckBoxServices();

    if(this.lstAllPractices.length>0)
      this.changePracticeRow(this.lstAllPractices[0]);
  }
  serviceCheckBoxChk(id, event){
    for (var i = 0; i < this.acPracticeServicesFiltered.length; i++) {
     // if(this.acPracticeServicesFiltered[i].practice_id == this.selectedPracticeID){
        if (event == true) {
          if (this.acPracticeServicesFiltered[i].service_id == id) {
            this.acPracticeServicesFiltered[i].active = true;
            return;
          }
        } else if (event == false) {
          if (this.acPracticeServicesFiltered[i].service_id == id) {
            this.acPracticeServicesFiltered[i].active = false;
            return;
          }
        }
     // }
    }
  }
  changePracticeRow(row){
    if(this.strOperation!=""){
      return;
    }
    this.selectedPracticeID = row.practice_id;
    //let acUserPractices = this.generalOperation.filterArray(this.lstAllPracticesServices, "practice_id", this.selectedPracticeID);
   
    this.selectedRow = row;
    (this.inputForm.get("txtPracticeID") as FormControl).setValue(row.practice_id);
    if(row.inactive == true){
      (this.inputForm.get('ddlPracticeStatus') as FormControl).setValue("INACTIVE");
    }else{
      (this.inputForm.get('ddlPracticeStatus') as FormControl).setValue("ACTIVE");
    }
    
    (this.inputForm.get("txtPracticeZip") as FormControl).setValue(row.zip);

    (this.inputForm.get("txtPracticeState") as FormControl).setValue(row.state);
    (this.inputForm.get('txtPracticeName') as FormControl).setValue(row.practice_name);
    //(this.inputForm.get("ddlCity") as FormControl).setValue(row.);

    (this.inputForm.get("txtPracticeAddress") as FormControl).setValue(row.address1);
    (this.inputForm.get('txtPracticePhone') as FormControl).setValue(row.phone);
    (this.inputForm.get("txtPracticeFax") as FormControl).setValue(row.fax);

    (this.inputForm.get("txtPracticeWebsite") as FormControl).setValue(row.website);
    (this.inputForm.get('txtPracticeContactNo') as FormControl).setValue(row.contact_person_number);
    (this.inputForm.get("txtPracticePerson") as FormControl).setValue(row.contact_person_name);

    (this.inputForm.get("txtPracticeNPI") as FormControl).setValue(row.npi);
    (this.inputForm.get('txtPracticeUserDomain') as FormControl).setValue(row.domain_name);
    (this.inputForm.get("txtPracticeComments") as FormControl).setValue(row.notes);


let selectedServices;
    if(this.lstAllPracticesServices!=null || this.lstAllPracticesServices != undefined){
      this.acPracticeServicesFiltered = this.generalOperation.filterArray(this.lstAllPracticesServices,"practice_id", this.selectedPracticeID);
      selectedServices = this.generalOperation.filterArray(this.lstAllPracticesServices,"practice_id", this.selectedPracticeID);
    }
    if(selectedServices.length > 0){
      for (var i = 0; i < this.lstAllPracticesServices.length; i++) {
        for (var j = 0; j < selectedServices.length; j++) {
          if (this.lstAllPracticesServices[i].service_id == selectedServices[j].service_id){
            if(selectedServices[j].active == true){
              this.acPracticeServicesFiltered[i].active = true;
            }else{
              this.acPracticeServicesFiltered[i].active = false;
            }
          }
        }
      }
    }

  }
  searchZipCode() {
    
    if ((this.inputForm.get('txtPracticeZip') as FormControl).value.length > 0) {
      if((this.inputForm.get('txtPracticeZip') as FormControl).value.length == 5 || 
      (this.inputForm.get('txtPracticeZip') as FormControl).value.length == 9){
  
        this.generalService.getCityStateByZipCode((this.inputForm.get('txtPracticeZip') as FormControl).value).subscribe(
           data => {
             this.lstZipCityState = data as Array<any>;
             if (this.lstZipCityState != null && this.lstZipCityState.length > 0) {
              (this.inputForm.get("txtPracticeState") as FormControl).setValue(this.lstZipCityState[0].state);
              // if (this.isZipLoading) {
               //     (this.zipcitystateSave.get("txtCity") as FormControl).setValue(this.patient.city);
               // }
               //else
               if (this.lstZipCityState.length > 1) {
                 (this.inputForm.get("ddlCity") as FormControl).setValue(null);
               }
               else if (this.lstZipCityState.length == 1) {
                 (this.inputForm.get("ddlCity") as FormControl).setValue(this.lstZipCityState[0].city);
               }
             }
           },
           error => {
           }
         );
      }else{
        GeneralOperation.showAlertPopUp(this.modalService, 'Zip Code', "Please enter 5/9 digit zip code.", AlertTypeEnum.WARNING);
      }
    }
  }
}