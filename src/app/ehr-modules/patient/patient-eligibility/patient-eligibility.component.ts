import { Component, Inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { EligibilityService } from '../../../services/patient/eligibility.service';
import { LogMessage } from '../../../shared/log-message';
//import { ORMEligibilityDetail } from 'src/app/models/general/ORMEligibilityDetail';

@Component({
  selector: 'app-patient-eligibility',
  templateUrl: './patient-eligibility.component.html',
  styleUrls: ['./patient-eligibility.component.css']
})
export class PatientEligibilityComponent implements OnInit {

  @Input() patientId:number;
  @Input() id:number;
  @Input() idType:string;
  @Input() insuranceType:string;
  @Input() dos:string;
  @Input() checkLive: Boolean;
  @Input() policy_number:string;


  isSuccess:boolean=false;
    
  //@Input() ormEligibilityDetail:ORMEligibilityDetail;

  strPromptMsg:string="";
  msgType:string="";
  lstErrors:Array<any>;


  patientMatched = "Y";
  policyNoMatched = "Y"
  isLoading: boolean = false;

  ehrPatientName:string="";
  ehrPolicyNo:string="";

  insurancePatientName:string="";
  insurancePolicyNo:string="";

  insuranceName:string="";
  eligibilityDate;
  elilgibilityStatus;
  elilgibilityStatusDescription;

  lstCopayment;
  lstDeductable;
  lstBenefitsAndCoverage;
  lstOtherInfo;


  constructor(public activeModal: NgbActiveModal,
    private eligibilityService: EligibilityService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.getPatientElibility();
  }

  getPatientElibility() {
    debugger;
    this.isSuccess=false;
    this.isLoading = true;

    this.ehrPatientName = undefined;
    this.ehrPolicyNo = undefined;

    this.insurancePatientName = undefined;
    this.insurancePolicyNo = undefined;

    this.insuranceName = undefined;
    this.eligibilityDate = undefined;
    this.elilgibilityStatus = undefined;

    this.lstCopayment = undefined;
    this.lstDeductable = undefined;
    this.lstBenefitsAndCoverage = undefined;
    this.lstOtherInfo = undefined;



    //let objEligDetails = new ORMEligibilityDetail();
    //objEligDetails.appointment_id = "";
    //objEligDetails.patient_id = this.patientId.toString();
    //objEligDetails.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    //objEligDetails.elig_user = this.lookupList.acProviderEligibility[0].user;
    //objEligDetails.elig_password = this.lookupList.acProviderEligibility[0].password;
    //objEligDetails.provider_fname = this.lookupList.acProviderEligibility[0].provider_fname;
    //objEligDetails.provider_lname = this.lookupList.acProviderEligibility[0].provider_lname;
    //objEligDetails.provider_npi = this.lookupList.acProviderEligibility[0].provider_npi;    
    //objEligDetails.insured_fname = this.openPatientInfo.first_name;
    //objEligDetails.insured_lname = this.openPatientInfo.last_name;
    //objEligDetails.insured_ssn = this.openPatientInfo.ssn;
    //objEligDetails.insured_state = this.openPatientInfo.state;
if(this.idType=='claim')
{
  let searchCriteria: SearchCriteria = new SearchCriteria();
  searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
  searchCriteria.param_list = [
    { name: "check_live", value: "false", option: "" },
    { name: "patient_id", value: this.patientId, option: "" },
    { name: "claim_id", value: 0, option: "" },
    { name: "id", value:this.id , option: "" },
    { name: "id_type", value: "claim", option: "" },
    { name: "insurance_type", value: this.insuranceType.toString().toUpperCase(), option: "" },
    { name: "policy_no", value: this.policy_number.toString().toUpperCase(), option: "" },      
    { name: "dos", value: this.dos, option: "" }
  ];
  this.eligibilityService.getClaimElibility(searchCriteria).subscribe(
    data => {
      debugger;
      this.getPatientElibilitySuccess(data);
      this.isLoading = false;
    },
    error => {
      debugger;
      this.isSuccess=false;
      this.msgType='error';
      this.strPromptMsg=error.message;
      this.getPatientElibilityError(error.message);
      this.isLoading = false;
    }
  );
}
else{

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    
    searchCriteria.param_list = [
      { name: "check_live", value: this.checkLive.toString(), option: "" },
      { name: "patient_id", value: this.patientId, option: "" } ,           
      { name: "id", value: this.id, option: "" } ,     
      { name: "id_type", value: this.idType, option: "" },
      { name: "insurance_type", value: this.insuranceType, option: "" },
      { name: "dos", value: this.dos, option: "" }
      
    ];

    this.eligibilityService.getPatientElibility(searchCriteria).subscribe(
      data => {
        debugger;

        this.getPatientElibilitySuccess(data);
        this.isLoading = false;
      },
      error => {
        debugger;
        this.isSuccess=false;
        this.msgType='error';
        this.strPromptMsg=error.message;
        this.getPatientElibilityError(error.message);
        this.isLoading = false;
      }
    );
}
  }
  getPatientElibilitySuccess(data:any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.isSuccess=true;
      this.fetchData(data.response_list[0]);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR ) {
      this.isSuccess=false;
      this.strPromptMsg=data.response;
      this.msgType='error';
      //GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Elibibility', data['response'], AlertTypeEnum.DANGER)

      if(data.response_list!=undefined && data.response_list.length>0 ){
        if(data.response_list[0].error_message!=undefined && data.response_list[0].error_message!=''){
          this.strPromptMsg=data.response_list[0].error_message;
          this.lstErrors=data.response_list[0].lst_errors
        }
      }

    }
    else if (data.status === ServiceResponseStatusEnum.NOT_FOUND) {
      this.isSuccess=false;
      this.strPromptMsg=data.response;
      this.msgType='info';
      //GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Elibibility', data['response'], AlertTypeEnum.INFO)
    }
  }
  getPatientElibilityError(error) {
    this.logMessage.log("getPatientElibility Error:"+error);
  }

  fetchData(data) {
    this.patientMatched = "Y";
    this.policyNoMatched = "Y";

    if (data.eligibility_status == "U") {
      this.patientMatched = "U";
      this.policyNoMatched = "U";

      this.insurancePatientName = "";
      this.insurancePolicyNo = "";
    }
    else {
      if (data.ehr_patient_name != data.insurance_patient_name) {
        this.patientMatched = "N";
      }
      if (data.ehr_policy_number != data.insurance_policy_number) {
        this.policyNoMatched = "N";
      }

      this.insurancePatientName = data.insurance_patient_name;
      this.insurancePolicyNo = data.insurance_policy_number;
    }


    this.ehrPatientName = data.ehr_patient_name;
    this.ehrPolicyNo = data.ehr_policy_number;



    this.insuranceName = data.insurance_name;
    this.eligibilityDate = data.validattion_date;
    this.elilgibilityStatus = data.eligibility_status;
    this.elilgibilityStatusDescription = data.eligibility_status_description;

    this.lstCopayment = data.lst_co_payment;
    this.lstDeductable = data.lst_deductable;
    this.lstOtherInfo = data.lst_other_info;
    this.lstBenefitsAndCoverage = data.lst_benefits_coverage;
  }

  closePopUP(){
    if(this.isSuccess && this.checkLive){
      this.activeModal.close(ServiceResponseStatusEnum.SUCCESS);
    }
    else{
      this.activeModal.dismiss();
    }
  }
  

}
