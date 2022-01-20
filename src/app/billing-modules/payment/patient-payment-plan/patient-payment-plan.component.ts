import { Component, OnInit, Input, Inject, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';


@Component({
  selector: 'patient-payment-plan',
  templateUrl: './patient-payment-plan.component.html',
  styleUrls: ['./patient-payment-plan.component.css']
})
export class PatientPaymentPlanComponent implements OnInit {

  @Input() patientId: number;
  @Input() editable: boolean = false;

  paymentPlanFormGroup: FormGroup;

  isLoading: boolean = false;

  paymentPlan: string;
  PlanId: number;
  modifidUser: string;
  dateModified: string;


  constructor(private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.buidlForm();
    this.getPaymentPlan();
  }
  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  buidlForm() {
    this.paymentPlanFormGroup = this.formBuilder.group({
      txtPlan: this.formBuilder.control({
        value: null,
        disabled: !this.editable
      }, Validators.required)
    }
    );

  }

  getPaymentPlan() {
    this.isLoading = true;
    this.paymentPlan = undefined;
    this.PlanId = undefined;
    this.modifidUser = undefined;
    this.dateModified = undefined;

    this.paymentService.getPaymentPlan(this.patientId).subscribe(
      data => {
        if (data['length'] > 0) {
          this.PlanId = data[0]['col1'];
          this.paymentPlan = data[0]['col2'];
          this.modifidUser = data[0]['col3'];
          this.dateModified = data[0]['col4'];
        }

        this.paymentPlanFormGroup.get("txtPlan").setValue(this.paymentPlan);

        this.isLoading = false;

      },
      error => {
        this.isLoading = false;
        this.ongetPaymentPlanError(error);
      }
    );
  }


  ongetPaymentPlanError(error) {
    this.logMessage.log("getPaymentPlan Error.");
  }

  savePaymentPlan(formData: any) {

    debugger;
    if (formData.txtPlan == undefined || formData.txtPlan == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Payment Plan', "Please enter a plan.", AlertTypeEnum.DANGER)
    }
    else {

      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


      let lstKV: Array<ORMKeyValue> = new Array<ORMKeyValue>();
      lstKV.push(new ORMKeyValue("practice_id", this.lookupList.practiceInfo.practiceId));
      lstKV.push(new ORMKeyValue("patient_id", this.patientId));
      lstKV.push(new ORMKeyValue("payment_plan_id", this.PlanId));
      lstKV.push(new ORMKeyValue("payment_plan", formData.txtPlan));
      lstKV.push(new ORMKeyValue("user_name", this.lookupList.logedInUser.user_name));
      lstKV.push(new ORMKeyValue("system_ip", this.lookupList.logedInUser.systemIp));
      lstKV.push(new ORMKeyValue("client_date_time", clientDateTime));


      this.paymentService.savePatientPaymentPlan(lstKV).subscribe(
        data => {

          this.savePatientPaymentPlanSuccess(data);
        },
        error => {
          debugger;
          this.savePatientPaymentPlanError(error);
        }
      );
    }



  }


  savePatientPaymentPlanSuccess(data: any) {

    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Payment Plan', data.response, AlertTypeEnum.DANGER)
    }
  }

  savePatientPaymentPlanError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Payment Plan', "An Error Occured while saving payment plan.", AlertTypeEnum.DANGER)
  }


}
