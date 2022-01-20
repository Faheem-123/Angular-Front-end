import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { LogMessage } from '../../../shared/log-message';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { GeneralOperation } from '../../../shared/generalOperation';
import { ReportsService } from '../../../services/reports.service';
import { GeneralService } from '../../../services/general/general.service'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomValidators, datetimeValidator } from '../../../shared/custome-validators';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { PromptResponseEnum, AlertTypeEnum } from '../../../shared/enum-util';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { EligibilityService } from 'src/app/services/patient/eligibility.service';

@Component({
  selector: 'rpt-patient-eligibility',
  templateUrl: './rpt-patient-eligibility.component.html',
  styleUrls: ['./rpt-patient-eligibility.component.css']
})
export class RptPatientEligibilityComponent implements OnInit {

  lstPatElig;
  patienteligibilityReportForm: FormGroup;
  showPatientSearch: boolean = false;
  patientName: string;
  patientId: number;
  reqcount: number = 0;
  i: number = 0;
  totalCheck;
  ArrDate = [];
  ArrDate1 = [];
  callingfrom: String = "";
  strRespose = [];
  listApp;
  recordCount;
  isTotalCheck;

  //private objEligDetails: ORMEligibilityDetail;
  patEligSearchCriteria: SearchCriteria;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    private reportsService: ReportsService,
    private generalService: GeneralService,
    private modalService: NgbModal,
    private eligibilityService: EligibilityService) { }

  ngOnInit() {
    this.buildForm();
    
    if (this.lookupList.appStatusList == undefined || this.lookupList.appStatusList.length == 0) {
      this.getAppStatus();
    }
    /*
    if (this.lookupList.acProviderEligibility == undefined || this.lookupList.acProviderEligibility.length == 0) {
      this.getProvider_Eligibility();
    }
    */
  }
  /*
    getProvider_Eligibility(){
      this.generalService.getProvider_Eligibility(this.lookupList.practiceInfo.practiceId).subscribe(
        data => {
          debugger;
          this.lookupList.acProviderEligibility =  data as Array<any>;
        },
        error => {
          this.getProvider_EligibilityError(error);
        }
      );
    }
    getProvider_EligibilityError(error){
      this.logMessage.log("getProvider_Eligibility Error." + error);
    }
    */

  getAppStatus() {
    this.generalService.getAppStatus(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.appStatusList = data as Array<any>;
      },
      error => {
        this.getAppStatusError(error);
      }
    );
  }
  getAppStatusError(error) {
    this.logMessage.log("getAppStatus Error.");
  }
  getLocationsList() {
    this.generalService.getLocation(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.locationList = data as Array<any>;
      },
      error => {
        this.getLocationListError(error);
      }
    );
  }
  getLocationListError(error) {
    this.logMessage.log("getLocationList Error." + error);
  }
  getProviderList() {
    this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.providerList = data as Array<any>;
      },
      error => {
        this.getProviderListError(error);
      }
    );
  }
  getProviderListError(error) {
    this.logMessage.log("getProviderList Error." + error);
  }

  buildForm() {
    this.patienteligibilityReportForm = this.formBuilder.group({
      aptDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      eligDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'null':this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'null':this.lookupList.logedInUser.defaultLocation),
      cmbInsType: this.formBuilder.control('Primary'),
      cmbStatus: this.formBuilder.control(null)
    })
    /*,
    {
      validator: Validators.compose([
        CustomValidators.validDate('aptDate', true),
        CustomValidators.validDate('eligDate', true)
      ])
    }
    */
  }
  //pateint search start
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
      this.patienteligibilityReportForm.get("txtPatientIdHidden").setValue(null);
    }
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");
    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.patienteligibilityReportForm.get("txtPatientSearch").setValue(null);
      this.patienteligibilityReportForm.get("txtPatientIdHidden").setValue(null);
    }
  }
  openSelectPatient(patObject) {
    this.logMessage.log(patObject);
    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;
      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) {
          this.closePatientSearch();
        }
      }
        , (reason) => {
          //alert(reason);
        });
      return;
    }
    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;
    (this.patienteligibilityReportForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
    (this.patienteligibilityReportForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  //patient search end
  searchPatientEligibility(formData) {
    debugger;
    var today = new Date();

    //var dt = this.dateTimeUtil.getDateTimeFromString(today,DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    let patEligDate = this.dateTimeUtil.getStringDateFromDateModel(formData.eligDate);
    //    var dateToday = today.getMonth() + 1 +'/'+ today.getDate() +'/'+ today.getFullYear();

    // if(this.dateTimeUtil.dateCompare(patEligDate , dateToday) == 1)
    // {
    //    alert("Eligibility date should be less than or equal to Today date.");
    //  	return ;
    // }
    //let patEligSearchCriteria: SearchCriteria = new SearchCriteria();
    this.patEligSearchCriteria = new SearchCriteria();
    this.patEligSearchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.patEligSearchCriteria.param_list = [];

    let patAptDate = this.dateTimeUtil.getStringDateFromDateModel(formData.aptDate);


    this.patEligSearchCriteria.param_list.push({ name: "aptDate", value: patAptDate == undefined ? null : patAptDate, option: "" });
    this.patEligSearchCriteria.param_list.push({ name: "eligDate", value: patEligDate == undefined ? null : patEligDate, option: "" });

    this.patEligSearchCriteria.param_list.push({ name: "provider_id", value: ((this.patienteligibilityReportForm.get('cmbProvider') as FormControl).value==null?"":(this.patienteligibilityReportForm.get('cmbProvider') as FormControl).value), option: "" });
    this.patEligSearchCriteria.param_list.push({ name: "location_id", value: ((this.patienteligibilityReportForm.get('cmbLocation') as FormControl).value==null?"":(this.patienteligibilityReportForm.get('cmbLocation') as FormControl).value), option: "" });
    this.patEligSearchCriteria.param_list.push({ name: "status_id", value: (this.patienteligibilityReportForm.get('cmbStatus') as FormControl).value, option: "" });
    this.patEligSearchCriteria.param_list.push({ name: "cmbInsType", value: (this.patienteligibilityReportForm.get('cmbInsType') as FormControl).value, option: "" });
    this.patEligSearchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });

    this.callOutSearchReport();
  }
  callOutSearchReport() {
    this.reportsService.getPatEligReport(this.patEligSearchCriteria).subscribe(
      data => {
        debugger;
        this.lstPatElig = data;
        this.recordCount = data['length'];
      },
      error => {
        return;
      }
    );
  }
  checkEligibility() {
    debugger;
    if (this.lstPatElig.length > 0) {
      this.callingfrom = "";
      this.reqcount = 0;
      this.SendEligRequest();
    }
    else {
      GeneralOperation.showAlertPopUp(this.modalService, 'Check Eligibility', "No record found to check eligibility.", AlertTypeEnum.WARNING);
      return;
    }
  }
  SendEligRequest() {
    try {
      if (this.reqcount < this.lstPatElig.length) {
        var i = this.reqcount;
        this.isTotalCheck = true;
        this.totalCheck = this.reqcount + "/" + this.lstPatElig.length;
        this.EligReqProcessing(i);
      }
      if (this.reqcount == this.lstPatElig.length) {
        var strcriteria: String = "";
        //this.searchPatientEligibility('');
        //alert("this.searchPatientEligibility('');");
        //GeneralOperation.showAlertPopUp(this.modalService, 'Check Eligibility', "No record found to check eligibility.", AlertTypeEnum.WARNING);
      }
    } catch (error) {

    }
  }
  EligReqProcessing(i) {


    debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    //searchCriteria.criteria = this.criteria;

    let insType: string = '';
    let dos: string = '';

    if ((this.patienteligibilityReportForm.get('cmbInsType') as FormControl).value != "") {
      insType = (this.patienteligibilityReportForm.get('cmbInsType') as FormControl).value;
    }


    let dateElig = this.dateTimeUtil.getStringDateFromDateModel((this.patienteligibilityReportForm.get('eligDate') as FormControl).value)
    if (dateElig != "") {
      dos = this.dateTimeUtil.convertDateTimeFormat(dateElig, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_YYYYMMDD);
    }


    searchCriteria.param_list = [
      { name: "check_live", value: "true", option: "" },
      { name: "patient_id", value: this.lstPatElig[i].patient_id, option: "" },
      { name: "id", value: this.lstPatElig[i].appointment_id, option: "" },
      { name: "id_type", value: "appointment", option: "" },
      { name: "insurance_type", value: insType, option: "" },
      { name: "dos", value: dos, option: "" }

    ];

    this.eligibilityService.getPatientElibility(searchCriteria).subscribe(
      data => {
        debugger;

        if (this.callingfrom == "individual") {

        }
        else {
          debugger;
          this.callingfrom = "";
          this.reqcount = this.reqcount + 1;
          this.SendEligReq();
        }

      },
      error => {
        return;
      }
    );

    //send orm for this.

    /*
        this.objEligDetails = new ORMEligibilityDetail();
        this.objEligDetails.appointment_id = this.lstPatElig[i].appointment_id;
        this.objEligDetails.patient_id = this.lstPatElig[i].patient_id;
        this.objEligDetails.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        this.objEligDetails.elig_user = this.lookupList.acProviderEligibility[0].user;
        this.objEligDetails.elig_password = this.lookupList.acProviderEligibility[0].password;
        this.objEligDetails.provider_id = 
        this.objEligDetails.provider_fname = this.lookupList.acProviderEligibility[0].provider_fname;
        this.objEligDetails.provider_lname = this.lookupList.acProviderEligibility[0].provider_lname;
        this.objEligDetails.provider_npi = this.lookupList.acProviderEligibility[0].provider_npi;
        this.objEligDetails.insured_fname = this.lstPatElig[i].first_name;
        this.objEligDetails.insured_lname = this.lstPatElig[i].last_name;
        this.objEligDetails.insured_ssn = this.lstPatElig[i].ssn;
        this.objEligDetails.insured_state = this.lstPatElig[i].state;
        
        if(this.lstPatElig[i].dob.toString() != ""){
          this.ArrDate=this.lstPatElig[i].dob.toString().split("/");
        this.objEligDetails.insured_dob = this.ArrDate[2].toString() + this.ArrDate[0].toString() + this.ArrDate[1].toString();
        }else{
          this.objEligDetails.insured_dob = "";
        }
        let dateElig = this.dateTimeUtil.getStringDateFromDateModel((this.patienteligibilityReportForm.get('eligDate') as FormControl).value)
    
        if(dateElig != ""){
          this.ArrDate1 =dateElig.toString().split("/");
          this.objEligDetails.dos = this.ArrDate1[2].toString()+this.ArrDate1[0].toString()+this.ArrDate1[1].toString();
        }else{
          this.objEligDetails.dos = "";
        }
        if((this.patienteligibilityReportForm.get('cmbInsType') as FormControl).value!=""){
            this.objEligDetails.ins_type = (this.patienteligibilityReportForm.get('cmbInsType') as FormControl).value;
        }
        else{
          this.objEligDetails.ins_type = "";
        }
       
        debugger;
        this.reportsService.getPatientEligibility(this.objEligDetails).subscribe(
          data => {
            debugger;
            //this.SendEligReq(data);
            if(this.callingfrom=="individual")
            {
              
            }
            else
            {
              debugger;
              this.callingfrom="";
              this.reqcount=this.reqcount+1;
              this.SendEligReq();
            }
          },
          error => {
            return;
          }
        );
        */
  }

  SendEligReq() {
    debugger;
    try {
      //if(this.reqcount<this.listApp.length)
      if (this.reqcount < this.lstPatElig.length) {
        this.i = this.reqcount;
        //this.totalCheck=this.reqcount+"/"+this.listApp.length; 
        this.totalCheck = this.reqcount + "/" + this.lstPatElig.length;
        this.EligReqProcessing(this.i);
      }
      //if(this.reqcount==this.listApp.length)
      if (this.reqcount == this.lstPatElig.length) {
        this.lstPatElig = null;
        this.lstPatElig.refresh();
        this.isTotalCheck = false;
        this.searchPatientEligibility(this.patEligSearchCriteria);
      }
    } catch (error) {

    }
  }

  // setFUColor(data:Object)  
  // 		{  
  // 			var color:uint=uint("0x0000ff");
  // 			if(data==null) 
  // 				return color;
  // 			if(data.elig_status=="" || data.elig_status==null)
  // 			{

  // 			}
  // 			else
  // 			{
  // 				if(data.elig_status.toString().toUpperCase().substring(0,1)=="A")
  // 				{
  // 					color=  uint("0x14970e");
  // 				}
  // 				else if(data.elig_status.toString().toUpperCase().substring(0,1)=="I")
  // 				{
  // 					color=  uint("0xdf0707");
  // 				}
  // 			}						

  // 			return color;
  // 		}
}
