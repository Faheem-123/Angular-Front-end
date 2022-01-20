import { Component, OnInit, Inject, Input, ViewChild, ElementRef } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { EobEraTypeEnum, RegExEnum, AlertTypeEnum, ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/custome-validators';
import { DecimalPipe } from '@angular/common';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { OrmClaimPaymentSave } from 'src/app/models/billing/orm-claim-payment-save';
import { OrmClaimPaymentAdjustmentSave } from 'src/app/models/billing/orm-claim-payment-adjustment-save';
import { WrapperClaimPaymentSave } from 'src/app/models/billing/wrapper-claim-payment-save';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { TransferClaimPostedPatientPaymentComponent } from '../transfer-claim-posted-patient-payment/transfer-claim-posted-patient-payment.component';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { ImportCashRegisterPaymentComponent } from '../import-cash-register-payment/import-cash-register-payment.component';
import { PostPatientWriteOffComponent } from '../post-patient-write-off/post-patient-write-off.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ClaimPaymentEobEraInfoComponent } from '../claim-payment-eob-era-info/claim-payment-eob-era-info.component';
import { RefundPatientPaymentComponent } from '../refund-patient-payment/refund-patient-payment.component';
import { AdjustmentCodesGlossarayComponent } from '../adjustment-codes-glossaray/adjustment-codes-glossaray.component';

@Component({
  selector: 'claim-payment',
  templateUrl: './claim-payment.component.html',
  styleUrls: ['./claim-payment.component.css']
})
export class ClaimPaymentComponent implements OnInit {

  @Input() openedClaimInfo: OpenedClaimInfo;

  @ViewChild('ddAdjustmentGroupCode') ddAdjustmentGroupCode: ElementRef;
  @ViewChild('txtAdjustAmount') txtAdjustAmount: ElementRef;
  @ViewChild('ddProcCode') ddProcCode: ElementRef;



  formGroup: FormGroup;

  dataPopulateCount: number = 0;
  isLoading: boolean = false;
  isSaving: boolean = false;
  lstEntryType: Array<string> = ["Payment", "Reversal", "ACA"];

  lstClaimProcedures: Array<any>;
  lstClaimInsurance: Array<any>;
  lstClaimPayment: Array<any>;
  lstClaimPaymentProcedureGroup: Array<any>;

  //lstClaimAdjustments: Array<any>;
  lstPaymentSingleEntryAdjustments: Array<any>;
  lstPaymentAdjustments: Array<any>;

  eobEraType: EobEraTypeEnum = EobEraTypeEnum.ERA;


  tempPaymentEntryId: number = 0;
  tempAdjustmentEntryId: number = 0;
  selectedInsuranceId: number;
  selectedInsurancePayerId: number;
  selectedInsuranceName: string;
  selectedInsuranceType: string;
  selectedInsurancePolicyNo: string;
  selectedPaymentSource: string;

  selectedPaymentAdjustment: number = 0;

  isEobEraLoading: boolean = false;
  entryMode: boolean = false;

  clientDateTime: string;
  controlUniqueId: string = "";


  eraIdToView: number;

  showEra: boolean = false;
  showEob: boolean = false;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  // test
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private paymentService: PaymentService,

    private formBuilder: FormBuilder,
    private logMessage: LogMessage,
    private decimalPipe: DecimalPipe,
    private ngbModal: NgbModal,
    private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {

    //this.lookupList.UserRights.payment_add
    this.isLoading = true;
    this.dataPopulateCount++;
    this.getProceduresForPosting();

    this.dataPopulateCount++;
    this.getPaymentInsurances();

    //this.dataPopulateCount++;
    this.loadPaymentDetails();
    //if (this.dataPopulateCount == 0) {
    //  this.loadPaymentData();
    // }

    this.buildForm();

    this.controlUniqueId = 'cp_' + this.openedClaimInfo.claimId.toString();

    this.lookupList.UserRights.payment_add

  }

  loadPaymentEditData() {
    this.dataPopulateCount = 0;
    this.isLoading = true;



    if (this.lookupList.claimAdjustmentGroupCodesList == undefined || this.lookupList.claimAdjustmentGroupCodesList.length == 0) {
      this.dataPopulateCount++;
      this.getClaimAdjustmentGroupCodesList();
    }

    if (this.lookupList.claimAdjustmentReasonCodesList == undefined || this.lookupList.claimAdjustmentReasonCodesList.length == 0) {
      this.dataPopulateCount++;
      this.getClaimAdjustmentReasonCodesList();
    }

    this.assignEditData();
  }

  assignEditData() {
    if (this.dataPopulateCount > 0)
      return;
    this.entryMode = true;
    this.isLoading = false;
  }

  loadPaymentDetails() {

    this.isLoading = true;

    this.dataPopulateCount++;
    this.getClaimPayment();

    this.dataPopulateCount++;
    this.getClaimPaymentAdjustments();
  }


  claimTotalCharges: number = 0;
  claimTotalPriPaid: number = 0;
  claimTotalSecPaid: number = 0;
  claimTotalOthPaid: number = 0;
  claimTotalPatientPaid: number = 0;

  claimTotalAdjustedAmount: number = 0;
  claimTotalWriteOffAmount: number = 0;
  claimTotalRiskAmount: number = 0;

  claimBalance: number = 0;


  populateData() {

    if (this.dataPopulateCount > 0)
      return;

    this.isLoading = false;

    this.lstClaimPaymentProcedureGroup = undefined;
    this.claimTotalCharges = 0;
    this.claimTotalPriPaid = 0;
    this.claimTotalSecPaid = 0;
    this.claimTotalOthPaid = 0;
    this.claimTotalPatientPaid = 0;
    this.claimTotalAdjustedAmount = 0;
    this.claimTotalWriteOffAmount = 0;
    this.claimTotalRiskAmount = 0;
    this.claimBalance = 0;


    debugger;
    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {
      this.lstClaimProcedures.forEach(proc => {
        proc.cpt_balance = Number(proc.total_charges);
        this.claimTotalCharges += Number(proc.total_charges);
      });
    }


    if (this.lstClaimPayment != undefined && this.lstClaimPayment.length > 0) {

      debugger;

      let tempUnique: Array<any> = new UniquePipe().transform(this.lstClaimPayment, "claim_procedures_id");

      tempUnique.forEach(groupElement => {

        let total_charges: number = Number(groupElement.total_charges);
        let cpt_balance: number = 0;

        let paid_amount: number = 0;
        let risk_amount: number = 0;
        let writeoff_amount: number = 0;
        let adjusted_amount: number = 0;
        let deductable_amount: number = 0;
        let coinsurance_amount: number = 0;
        let copay_amount: number = 0;


        this.lstClaimPayment.forEach(detailElemnt => {

          if (groupElement.claim_procedures_id == detailElemnt.claim_procedures_id) {
            paid_amount += Number(detailElemnt.paid_amount);
            risk_amount += Number(detailElemnt.risk_amount);
            writeoff_amount += Number(detailElemnt.writeoff_amount);
            adjusted_amount += Number(detailElemnt.adjusted_amount);
            deductable_amount += Number(detailElemnt.deductable_amount);
            coinsurance_amount += Number(detailElemnt.coinsurance_amount);
            copay_amount += Number(detailElemnt.copay_amount);
          }

          // populate Adjustments
          let strAdjustments: string = "";
          if (this.lstPaymentAdjustments != undefined && this.lstPaymentAdjustments.length > 0) {

            let lstAdj: Array<any> = new ListFilterPipe().transform(this.lstPaymentAdjustments, "claim_payments_id", detailElemnt.claim_payments_id);

            if (lstAdj != undefined) {

              lstAdj.forEach(adj => {
                if (strAdjustments != "") {
                  strAdjustments += "<br>"
                }
                strAdjustments += adj.adjust_code + "&nbsp;&nbsp;&nbsp;&nbsp; $" + adj.adjust_amount;
              });
            }
          }

          if (strAdjustments == "") {
            strAdjustments = "There is no adjustment."
          }

          detailElemnt.adjustment_details = strAdjustments;

        });


        /*

        // CPT for Posting Balance Update
        if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

          this.lstClaimProcedures.forEach(claimProcedure => {
            if (claimProcedure.claim_procedures_id == groupElement.claim_procedures_id) {
              claimProcedure.cpt_balance=this.runningCptBalance
              cpt_balance = Number(claimProcedure.cpt_balance);
            }
          });
        }
        */


        cpt_balance = Number(total_charges) -
          (Number(paid_amount) + Number(risk_amount) + Number(writeoff_amount) + Number(adjusted_amount));

        debugger;
        // CPT for Posting Balance Update
        if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

          this.lstClaimProcedures.forEach(claimProcedure => {
            if (claimProcedure.claim_procedures_id == groupElement.claim_procedures_id) {
              claimProcedure.cpt_balance = cpt_balance;
            }
          });
        }



        if (this.lstClaimPaymentProcedureGroup == undefined)
          this.lstClaimPaymentProcedureGroup = new Array<any>();

        this.lstClaimPaymentProcedureGroup.push(
          {
            claim_procedures_id: groupElement.claim_procedures_id,
            charged_procedure_with_modifier: groupElement.charged_procedure_with_modifier,
            total_charges: groupElement.total_charges,
            paid_amount: Number(paid_amount),
            risk_amount: Number(risk_amount),
            writeoff_amount: Number(writeoff_amount),
            adjusted_amount: Number(adjusted_amount),
            deductable_amount: Number(deductable_amount),
            coinsurance_amount: Number(coinsurance_amount),
            copay_amount: Number(copay_amount),
            cpt_balance: Number(cpt_balance)
          }
        );
      });

      if (this.lstClaimPayment != undefined) {
        this.lstClaimPayment.forEach(detailElemnt => {

          if (detailElemnt.payment_source.toUpperCase() == "PRIMARY") {
            this.claimTotalPriPaid += Number(detailElemnt.paid_amount);
          }
          if (detailElemnt.payment_source.toUpperCase() == "SECONDARY") {
            this.claimTotalSecPaid += Number(detailElemnt.paid_amount);
          }
          if (detailElemnt.payment_source.toUpperCase() == "OTHER") {
            this.claimTotalOthPaid += Number(detailElemnt.paid_amount);
          }
          if (detailElemnt.payment_source.toUpperCase() == "PATIENT") {
            this.claimTotalPatientPaid += Number(detailElemnt.paid_amount);
          }

          this.claimTotalWriteOffAmount += Number(detailElemnt.writeoff_amount);
          this.claimTotalAdjustedAmount += Number(detailElemnt.adjusted_amount);
          this.claimTotalRiskAmount += Number(detailElemnt.risk_amount);

        });
      }

      this.claimBalance = Number(this.claimTotalCharges) -
        (Number(this.claimTotalPriPaid) + Number(this.claimTotalSecPaid) + Number(this.claimTotalOthPaid) + Number(this.claimTotalPatientPaid)
          + Number(this.claimTotalWriteOffAmount) + Number(this.claimTotalAdjustedAmount) + Number(this.claimTotalRiskAmount)
        );
    }
    else {

    }

    this.isLoading = false;
  }

  runningCptBalance: number = 0;
  calculateCPTRunningBalance(claimProcId: number) {

    debugger;
    let total_charges: number = 0;

    let paid_amount: number = 0;
    let risk_amount: number = 0;
    let writeoff_amount: number = 0;
    let adjusted_amount: number = 0;


    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      this.lstClaimProcedures.forEach(claimProcedure => {
        if (claimProcedure.claim_procedures_id == claimProcId) {
          total_charges = Number(claimProcedure.total_charges);
        }
      });
    }

    // payment in list
    if (this.lstClaimPayment != undefined) {
      this.lstClaimPayment.forEach(payment => {
        if (payment.claim_procedures_id == claimProcId) {
          paid_amount += Number(payment.paid_amount);
          risk_amount += Number(payment.risk_amount);
          writeoff_amount += Number(payment.writeoff_amount);
          adjusted_amount += Number(payment.adjusted_amount);
        }
      });
    }

    // payment in feilds
    // paid_amount += Number(this.formGroup.get('txtPaidAmount').value);
    //risk_amount += Number(this.formGroup.get('txtRiskAmount').value);
    //writeoff_amount += Number(this.formGroup.get('txtWriteOffAmount').value);


    if (!isNaN(GeneralOperation.getCurrencyNumbersOnly(this.formGroup.get('txtPaidAmount').value))) {
      let numericValue: number = GeneralOperation.getCurrencyNumbersOnly(this.formGroup.get('txtPaidAmount').value);
      paid_amount += numericValue;
    }
    if (!isNaN(GeneralOperation.getCurrencyNumbersOnly(this.formGroup.get('txtRiskAmount').value))) {
      let numericValue: number = GeneralOperation.getCurrencyNumbersOnly(this.formGroup.get('txtRiskAmount').value);
      risk_amount += numericValue;
    }

    if (!isNaN(GeneralOperation.getCurrencyNumbersOnly(this.formGroup.get('txtWriteOffAmount').value))) {
      let numericValue: number = GeneralOperation.getCurrencyNumbersOnly(this.formGroup.get('txtWriteOffAmount').value);
      writeoff_amount += numericValue;
    }
    adjusted_amount += this.selectedPaymentAdjustment;


    this.runningCptBalance = Number(total_charges) -
      (Number(paid_amount) + Number(risk_amount) + Number(writeoff_amount) + Number(adjusted_amount));


    /*
  // CPT for Posting Balance Update
  if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {
    this.lstClaimProcedures.forEach(claimProcedure => {
      if (claimProcedure.claim_procedures_id == claimProcId) {
        claimProcedure.cpt_balance = cpt_balance;
      }
    });
  }
  */



  }



  buildForm() {
    this.formGroup = this.formBuilder.group({
      rbEntryType: this.formBuilder.control("Payment", Validators.required),
      ddProcCode: this.formBuilder.control(null, Validators.required),
      ddEobEraType: this.formBuilder.control(this.eobEraType, Validators.required),
      txtEobEraId: this.formBuilder.control(null, Validators.required),
      txtEobEraPageNo: this.formBuilder.control(null, Validators.compose(
        [Validators.min(1), Validators.pattern(RegExEnum.PositiveWholeNumber)])
      ),
      txtAllowedAmount: this.formBuilder.control(null),
      txtPaidAmount: this.formBuilder.control(null),
      txtCoPaymentAmount: this.formBuilder.control(null),
      txtDeductableAmount: this.formBuilder.control(null),
      txtCoInsuranceAmount: this.formBuilder.control(null),
      txtWriteOffAmount: this.formBuilder.control(null),
      txtRiskAmount: this.formBuilder.control(null)
    }
      /*
        ,
        {
          validator: Validators.compose([
            CustomValidators.requiredWhenOneOptionWithValue('txtEobEraPageNo', 'ddEobEraType', 'EOB')
          ])
        }
        */
    )
  }

  getClaimAdjustmentGroupCodesList() {

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.param_list = [
      { name: "group_codes", value: "", option: "" }
    ];

    this.paymentService.getClaimAdjustmentGroupCodesList(searchCriteria).subscribe(
      data => {

        this.lookupList.claimAdjustmentGroupCodesList = data as Array<any>;
        this.dataPopulateCount--;
        this.assignEditData();
      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getClaimAdjustmentGroupCodesListError(error);
      }
    );
  }

  getClaimAdjustmentGroupCodesListError(error) {
    this.logMessage.log("getClaimAdjustmentGroupCodesList Error." + error);
  }


  getClaimAdjustmentReasonCodesList() {
    this.paymentService.getClaimAdjustmentReasonCodesList().subscribe(
      data => {

        this.lookupList.claimAdjustmentReasonCodesList = data as Array<any>;
        this.dataPopulateCount--;
        this.assignEditData();
      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getClaimAdjustmentReasonCodesListError(error);
      }
    );
  }

  getClaimAdjustmentReasonCodesListError(error) {
    this.logMessage.log("getClaimAdjustmentReasonCodesList Error." + error);
  }

  getProceduresForPosting() {

    this.lstClaimProcedures = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.openedClaimInfo.patientId, option: "" },
      { name: "claim_id", value: this.openedClaimInfo.claimId, option: "" },
      { name: "dos", value: "", option: "" },
      { name: "provider_id", value: "", option: "" },
      { name: "location_id", value: "", option: "" },
      { name: "cash_register_id", value: "", option: "" }
    ];


    this.paymentService.getProceduresForPosting(searchCriteria).subscribe(
      data => {

        debugger;
        this.lstClaimProcedures = data as Array<any>;
        this.dataPopulateCount--;
        this.populateData();
      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getProceduresForPostingError(error);
      }
    );
  }

  getProceduresForPostingError(error) {
    this.logMessage.log("getProceduresForPosting Error." + error);
  }

  getPaymentInsurances() {
    this.paymentService.getPaymentInsurances(this.openedClaimInfo.claimId).subscribe(
      data => {

        this.lstClaimInsurance = data as Array<any>;
        this.dataPopulateCount--;
        this.populateData();
      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getPaymentInsurancesError(error);
      }
    );
  }

  getPaymentInsurancesError(error) {
    this.logMessage.log("getPaymentInsurances Error." + error);
  }

  getClaimPayment() {
    this.paymentService.getClaimPayment(this.openedClaimInfo.claimId, this.openedClaimInfo.deleted).subscribe(
      data => {

        this.lstClaimPayment = data as Array<any>;
        this.dataPopulateCount--;
        this.populateData();
      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getClaimPaymentError(error);
      }
    );
  }

  getClaimPaymentError(error) {
    this.logMessage.log("getClaimPayment Error." + error);
  }

  getClaimPaymentAdjustments() {
    this.paymentService.getClaimPaymentAdjustments(this.openedClaimInfo.claimId).subscribe(
      data => {

        this.lstPaymentAdjustments = data as Array<any>;
        this.dataPopulateCount--;
        this.populateData();
      },
      error => {
        this.dataPopulateCount--;
        this.isLoading = false;
        this.getClaimPaymentAdjustmentsError(error);
      }
    );
  }

  getClaimPaymentAdjustmentsError(error) {
    this.logMessage.log("getClaimPaymentAdjustments Error." + error);
  }

  addEobEraPayment(paymentSource: any) {

    debugger;
    this.selectedProcedureElement = undefined;
    this.selectedInsuranceId = undefined;
    this.selectedInsurancePayerId = undefined;
    this.selectedInsuranceName = undefined;
    this.selectedInsuranceType = undefined;
    this.selectedInsurancePolicyNo = undefined;
    this.selectedPaymentSource = undefined;
    this.selectedPaymentAdjustment = 0;
    this.tempPaymentEntryId = -1;
    this.tempAdjustmentEntryId = -1;
    this.clearPaymentFeilds();

    this.formGroup.get('rbEntryType').setValue("Payment");
    this.formGroup.get('ddEobEraType').setValue(this.eobEraType);
    this.formGroup.get('txtEobEraId').setValue(null);
    this.formGroup.get('txtEobEraPageNo').setValue(null);
    this.formGroup.get('ddProcCode').setValue(null);

    this.eobEraIdSearched = "";
    this.checkNo = "";
    this.checkDate = "";
    this.eobEraSourceName = "";
    this.eobEraCheckAmount = undefined;
    this.eobEraPostedAmount = undefined;
    this.eobEraPendingForPostingAmount = undefined;
    this.eobEraPaymentType = "";
    this.paymentPatientId = undefined;
    this.paymentPatientName = "";
    this.lblCheckNo = "Check Number:"
    this.lblCheckDate = "Check Date:"
    this.isValidPaymentSource = true;
    this.isValidEobEraId = false;
    this.isEobEraLoading = false;


    this.loadPaymentEditData();

    //this.formGroup.get('ddProcCode').disable();
    this.enableDisalbePaymentFeilds(false);
    this.clearPaymentFeilds();


    if (paymentSource == "Patient") {
      this.selectedPaymentSource = "Patient";
      this.selectedInsuranceName = "Self";
      this.eobEraType = EobEraTypeEnum.EOB;
      this.formGroup.get("ddEobEraType").setValue(this.eobEraType);
      this.formGroup.get("ddEobEraType").disable();

    } else {
      this.eobEraType = EobEraTypeEnum.ERA;
      this.formGroup.get("ddEobEraType").setValue(this.eobEraType);
      this.formGroup.get("ddEobEraType").enable();
      this.selectedInsuranceId = paymentSource.insurance_id;
      this.selectedInsurancePayerId = paymentSource.payerid;
      this.selectedInsuranceName = paymentSource.name;
      this.selectedInsuranceType = paymentSource.insurace_type;
      this.selectedInsurancePolicyNo = paymentSource.policy_number;
      this.selectedPaymentSource = paymentSource.insurace_type;
    }
    this.selectedPaymentAdjustment = 0;
    this.tempPaymentEntryId = -1;
    this.tempAdjustmentEntryId = -1;

  }

  formateCurrencyInputs(element: HTMLInputElement) {

    debugger
    let value: any = element.value;
    let numericValue: number = GeneralOperation.getCurrencyNumbersOnly(element.value);
    if (!isNaN(numericValue)) {

      let formatedValue = this.decimalPipe.transform(numericValue, ".2-2", "");
      //element.value = formatedValue;
      (this.formGroup.get(element.id) as FormControl).setValue(formatedValue);
    }
    else {
      element.value = "";
    }

    if (element.id == 'txtAllowedAmount') {

      debugger;

      if (this.selectedProcedureElement != undefined && element.value != undefined && element.value != '') {

        if (this.selectedInsuranceType == 'Primary') {
          let cptTotal: number = GeneralOperation.getCurrencyNumbersOnly(this.selectedProcedureElement.total_charges);
          let adjustment: number = cptTotal - numericValue;

          if (adjustment != undefined && adjustment > 0) {
            this.txtAdjustAmount.nativeElement.value = this.decimalPipe.transform(adjustment, ".2-2", "");
          }
          else {
            this.txtAdjustAmount.nativeElement.value = '';
          }
        }
        else {
          this.txtAdjustAmount.nativeElement.value = '';
        }
      }
      else {
        this.txtAdjustAmount.nativeElement.value = '';
      }
    }

    //this.selectedProcedureElement

    this.calculateCPTRunningBalance(this.selectedProcedureElement.claim_procedures_id);
  }

  ddProcCodeChanged(index: number) {
    debugger;

    this.clearPaymentFeilds();

    this.selectedProcedureElement = this.lstClaimProcedures[index];
    this.runningCptBalance = Number(this.selectedProcedureElement.cpt_balance);

    if (this.selectedProcedureElement != undefined) {
      this.enableDisalbePaymentFeilds(true);
    }
    else {
      this.enableDisalbePaymentFeilds(false);
    }


  }


  ddEobEraTypeChanged(type: EobEraTypeEnum) {
    this.eobEraType = type;
    //this.formGroup.get('txtEobEraPageNo').disable();
    this.eobEraType = this.formGroup.get("ddEobEraType").value;
    this.getEobEraCheckDetailsById();
  }



  addProcedureAdjustments(groupCode: string, reasonCode: string, amount: number) {

    debugger;
    let msg: string = "";

    let adjustAmount: number = GeneralOperation.getCurrencyNumbersOnly(amount.toString());

    if (groupCode == undefined || groupCode == "") {
      msg += "Please select Group Code."
    }
    else if (reasonCode == undefined || reasonCode == "") {
      msg += "Please select Reason Code."
    }
    else if (adjustAmount == undefined || Number(adjustAmount) == 0 || Number(adjustAmount) == NaN) {
      msg += "Please enter adjust amount."
    }
    /*
    else if (amount != undefined && Number(amount) < 0 || Number(amount) == NaN) {
      msg += "Adjust amount cannot be negative."
    }
    */

    if (msg != "") {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      modalRef.componentInstance.promptHeading = 'Adjustment';
      modalRef.componentInstance.promptMessage = msg;

      return;
    }


    debugger;

    if (this.lstPaymentSingleEntryAdjustments == undefined) {
      this.lstPaymentSingleEntryAdjustments = new Array<any>();
    }

    debugger;

    this.lstPaymentSingleEntryAdjustments.push(
      {
        adjustment_id: Number(this.tempAdjustmentEntryId),
        claim_payments_id: Number(this.tempPaymentEntryId),
        claim_procedures_id: Number(this.selectedProcedureElement.claim_procedures_id),
        adjust_code: (groupCode + "-" + reasonCode),
        adjust_amount: Number(adjustAmount)
      }
    );

    this.tempAdjustmentEntryId--;
    this.ddAdjustmentGroupCode.nativeElement.focus();
    this.txtAdjustAmount.nativeElement.value = '';


    this.calculateProcedureAdjustment();
    this.calculateCPTRunningBalance(this.selectedProcedureElement.claim_procedures_id);
  }

  removeAdjustment(id: number) {

    debugger;
    if (this.lstPaymentSingleEntryAdjustments != undefined) {

      for (let i: number = this.lstPaymentSingleEntryAdjustments.length - 1; i >= 0; i--) {

        debugger;
        let element = this.lstPaymentSingleEntryAdjustments[i];
        if (element.adjustment_id == id) {
          this.lstPaymentSingleEntryAdjustments.splice(i, 1);
        }
      }
    }

    this.calculateProcedureAdjustment();
    this.calculateCPTRunningBalance(this.selectedProcedureElement.claim_procedures_id);
  }

  calculateProcedureAdjustment() {

    this.selectedPaymentAdjustment = 0;

    if (this.lstPaymentSingleEntryAdjustments != undefined) {

      this.lstPaymentSingleEntryAdjustments.forEach(element => {

        debugger;
        if (element.claim_payments_id == this.tempPaymentEntryId) {
          this.selectedPaymentAdjustment += Number(element.adjust_amount);
        }
      });
    }

  }

  eobEraIdSearched: string = "";
  checkNo: string = "";
  checkDate: string = "";
  eobEraSourceName: string = "";
  eobEraPaymentType: string = "";
  eobEraCheckAmount: number;
  eobEraPostedAmount: number;
  eobEraPendingForPostingAmount: number;

  paymentPatientId: number;
  paymentPatientName: string = "";
  lblCheckNo: string = "Check Number:"
  lblCheckDate: string = "Check Date:"
  isValidPaymentSource: boolean = true;
  isValidEobEraId: boolean = false;

  selectedProcedureElement: any;


  //onEobEraIdKeydown(event: KeyboardEvent) {
  onEobEraIdFocusOut() {
    if (this.formGroup.get("txtEobEraId").value != this.eobEraIdSearched) {
      this.eobEraIdSearched = this.formGroup.get("txtEobEraId").value;
      this.getEobEraCheckDetailsById();
    }
  }

  getEobEraCheckDetailsById() {

    this.isValidEobEraId = false;
    this.clearPaymentFeilds();

    if (this.eobEraIdSearched != undefined && this.eobEraIdSearched != ""
      && this.eobEraType != undefined) {


      this.isEobEraLoading = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;

      searchCriteria.param_list = [
        { name: "id_type", value: this.eobEraType, option: "" },
        { name: "id", value: this.eobEraIdSearched, option: "" }
      ];


      this.paymentService.getEobEraCheckDetailsById(searchCriteria).subscribe(
        data => {
          debugger;
          this.isEobEraLoading = false;
          this.assignCheckDetails(data);

        },
        error => {
          this.isEobEraLoading = false;
          this.getEobEraCheckDetailsByIdError(error);
        }
      );
    }
    else {

      this.isEobEraLoading = false;
      this.isValidPaymentSource = true;

      this.checkNo = undefined;
      this.checkDate = undefined;
      this.eobEraSourceName = undefined;

      this.eobEraPaymentType = undefined;
      this.paymentPatientId = undefined;
      this.paymentPatientName = undefined;
      this.eobEraCheckAmount = undefined;
      this.eobEraPostedAmount = undefined;
      this.eobEraPendingForPostingAmount = undefined;
      this.lblCheckNo = "Check Number:"
      this.lblCheckDate = "Check Date:"

      //this.formGroup.get('ddProcCode').disable();
      this.enableDisalbePaymentFeilds(false);
    }


  }

  getEobEraCheckDetailsByIdError(error) {
    this.logMessage.log("getEobEraCheckDetailsById Error." + error);
  }

  assignCheckDetails(data: any) {

    if (data != undefined) {
      this.isValidEobEraId = true;
      this.checkNo = data.check_number;
      this.checkDate = data.check_date;
      this.eobEraCheckAmount = data.check_amount;
      this.eobEraPostedAmount = data.posted_amount;
      this.eobEraPendingForPostingAmount = this.eobEraCheckAmount - this.eobEraPostedAmount;

      this.eobEraPaymentType = data.payment_type;
      this.paymentPatientId = Number(data.patient_id);

      if (data.patient_name != undefined && data.patient_name != "") {
        this.eobEraSourceName = data.patient_name;
      }
      else {
        this.eobEraSourceName = data.payer_name;
      }

      if (this.selectedPaymentSource == "Patient" && this.openedClaimInfo.patientId != this.paymentPatientId) {
        this.isValidPaymentSource = false;
      }
      else if (this.selectedPaymentSource != "Patient" && this.eobEraPaymentType == "Patient") {
        this.isValidPaymentSource = false;
      }
      else {
        this.isValidPaymentSource = true;
      }

      if (this.isValidPaymentSource) {
        //this.formGroup.get('ddProcCode').enable();
        //this.ddProcCode.nativeElement.focus();
        //document.getElementById("txtEobEraId").focus();
      }
      else {
        //this.formGroup.get('ddProcCode').disable()
        this.enableDisalbePaymentFeilds(false);
      }

    }
    else {
      this.checkNo = undefined;
      this.checkDate = undefined;
      this.eobEraCheckAmount = undefined;
      this.eobEraPostedAmount = undefined;
      this.eobEraPendingForPostingAmount = undefined;
      this.eobEraSourceName = undefined;
      this.eobEraPaymentType = undefined;
      this.paymentPatientId = undefined;
      this.paymentPatientName = undefined;
      this.isValidPaymentSource = true;
      this.isValidEobEraId = false;
      //this.formGroup.get('ddProcCode').disable()
      this.enableDisalbePaymentFeilds(false);
    }
  }

  enableDisalbePaymentFeilds(option: boolean) {

    debugger;
    if (this.selectedPaymentSource == "Patient") {

      //if (option) {
      this.formGroup.get('txtPaidAmount').enable();
      this.formGroup.get('txtWriteOffAmount').enable();
      //}
      //else {
      this.formGroup.get('txtAllowedAmount').disable();
      //this.formGroup.get('txtPaidAmount').disable();
      this.formGroup.get('txtCoPaymentAmount').disable();
      this.formGroup.get('txtDeductableAmount').disable();
      this.formGroup.get('txtCoInsuranceAmount').disable();
      //this.formGroup.get('txtWriteOffAmount').disable();
      this.formGroup.get('txtRiskAmount').disable();
      //}
    }
    else {
      //if (option) {

      this.formGroup.get('txtAllowedAmount').enable();
      this.formGroup.get('txtPaidAmount').enable();
      this.formGroup.get('txtCoPaymentAmount').enable();
      this.formGroup.get('txtDeductableAmount').enable();
      this.formGroup.get('txtCoInsuranceAmount').enable();
      this.formGroup.get('txtWriteOffAmount').enable();
      this.formGroup.get('txtRiskAmount').enable();
      //}
      /*
      else {

        this.formGroup.get('txtAllowedAmount').disable();
        this.formGroup.get('txtPaidAmount').disable();
        this.formGroup.get('txtCoPaymentAmount').disable();
        this.formGroup.get('txtDeductableAmount').disable();
        this.formGroup.get('txtCoInsuranceAmount').disable();
        this.formGroup.get('txtWriteOffAmount').disable();
        this.formGroup.get('txtRiskAmount').disable();
      }
      */
    }
  }

  clearPaymentFeilds() {


    this.formGroup.get('txtAllowedAmount').setValue(null);
    this.formGroup.get('txtPaidAmount').setValue(null);
    this.formGroup.get('txtCoPaymentAmount').setValue(null);
    this.formGroup.get('txtDeductableAmount').setValue(null);
    this.formGroup.get('txtCoInsuranceAmount').setValue(null);
    this.formGroup.get('txtWriteOffAmount').setValue(null);
    this.formGroup.get('txtRiskAmount').setValue(null);


    this.lstPaymentSingleEntryAdjustments = undefined;
    this.selectedPaymentAdjustment = 0;
    if (this.txtAdjustAmount != undefined) {
      this.txtAdjustAmount.nativeElement.value = '';
    }

  }

  cancelClicked() {

    this.entryMode = false;
    this.isEobEraLoading = false;

    this.loadPaymentDetails();
  }


  addPaymentToSaveList_Clicked(formData: any) {


    if (
      (GeneralOperation.getCurrencyNumbersOnly(formData.txtAllowedAmount) == 0)
      && (GeneralOperation.getCurrencyNumbersOnly(formData.txtPaidAmount) == 0)
      && (GeneralOperation.getCurrencyNumbersOnly(formData.txtCoPaymentAmount) == 0)
      && (GeneralOperation.getCurrencyNumbersOnly(formData.txtDeductableAmount) == 0)
      && (GeneralOperation.getCurrencyNumbersOnly(formData.txtCoInsuranceAmount) == 0)
      && (GeneralOperation.getCurrencyNumbersOnly(formData.txtWriteOffAmount) == 0)
      && (GeneralOperation.getCurrencyNumbersOnly(formData.risk_amount) == 0)
      && (this.selectedPaymentAdjustment == 0)
    ) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Claim Payment', "Please enter an amount.", AlertTypeEnum.WARNING);
      return;
    }


    debugger;
    let cpt_balance: number = 0;
    let cpt_paid: number = 0;
    let cpt_risk: number = 0;
    let cpt_WriteOff: number = 0;

    if (formData.txtPaidAmount != undefined && formData.txtPaidAmount != null) {
      cpt_paid = GeneralOperation.getCurrencyNumbersOnly(formData.txtPaidAmount);
    }
    if (formData.risk_amount != undefined && formData.risk_amount != null) {
      cpt_risk = GeneralOperation.getCurrencyNumbersOnly(formData.risk_amount);
    }
    if (formData.txtWriteOffAmount != undefined && formData.txtWriteOffAmount != null) {
      cpt_WriteOff = GeneralOperation.getCurrencyNumbersOnly(formData.txtWriteOffAmount);
    }


    //cpt_balance = Number(this.decimalPipe.transform(this.selectedProcedureElement.cpt_balance, ".2-2", ""));

    cpt_balance = GeneralOperation.getCurrencyNumbersOnly(this.selectedProcedureElement.cpt_balance) -
      (cpt_paid + cpt_risk + cpt_WriteOff + this.selectedPaymentAdjustment);

    if (cpt_balance < 0) {

      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = 'Procdure Negative Balance';
      modalRef.componentInstance.promptMessage = 'Procedure balance will be negative. Do you want to contitue?';
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;

      modalRef.result.then((result) => {

        if (result == PromptResponseEnum.YES) {
          this.addPaymentToSaveList(formData);
        }
      }, (reason) => {
        //alert(reason);
      });

    }
    else {
      this.addPaymentToSaveList(formData);
    }

  }
  addPaymentToSaveList(formData: any) {

    debugger;
    this.clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


    if (this.lstPaymentSingleEntryAdjustments != undefined && this.lstPaymentSingleEntryAdjustments.length > 0) {

      if (this.lstPaymentAdjustments == undefined) {
        this.lstPaymentAdjustments = new Array<any>();
      }

      this.lstPaymentSingleEntryAdjustments.forEach(element => {

        this.lstPaymentAdjustments.push(element);

      });
    }


    debugger;

    let paymentEntry: any = {
      claim_payments_id: this.tempPaymentEntryId,
      claim_procedures_id: Number(formData.ddProcCode),
      source_description: this.selectedPaymentSource == "Patient" ? "Patient" : ("(" + this.selectedPaymentSource + ") " + this.selectedInsuranceName),
      payment_source: this.selectedPaymentSource,
      charged_procedure_with_modifier:
        this.selectedProcedureElement.proc_code +
        (
          (this.selectedProcedureElement.modifier != undefined && this.selectedProcedureElement.modifier != "")
            ? (" (" + this.selectedProcedureElement.modifier + ")") : ""
        ),
      charged_procedure: this.selectedProcedureElement.proc_code,
      paid_procedure: this.selectedProcedureElement.proc_code,
      units: Number(this.selectedProcedureElement.units),
      check_date: this.checkDate,
      check_number: this.checkNo,
      total_charges: GeneralOperation.getCurrencyNumbersOnly(this.selectedProcedureElement.total_charges),
      cpt_balance: 0,
      paid_amount: GeneralOperation.getCurrencyNumbersOnly(formData.txtPaidAmount),
      risk_amount: GeneralOperation.getCurrencyNumbersOnly(formData.txtRiskAmount),
      writeoff_amount: GeneralOperation.getCurrencyNumbersOnly(formData.txtWriteOffAmount),
      adjusted_amount: this.selectedPaymentAdjustment,
      allowed_amount: GeneralOperation.getCurrencyNumbersOnly(formData.txtAllowedAmount),
      deductable_amount: GeneralOperation.getCurrencyNumbersOnly(formData.txtDeductableAmount),
      coinsurance_amount: GeneralOperation.getCurrencyNumbersOnly(formData.txtCoInsuranceAmount),
      copay_amount: GeneralOperation.getCurrencyNumbersOnly(formData.txtCoPaymentAmount),
      eob_era_id: Number(formData.txtEobEraId),
      eob_era_id_type: this.eobEraType,
      eob_page_no: (formData.txtEobEraPageNo == null || formData.txtEobEraPageNo == "" || Number(formData.txtEobEraPageNo) == NaN) ? undefined : Number(formData.txtEobEraPageNo),
      autoposted_era: false,
      client_date_created: this.clientDateTime,
      insurance_id: this.selectedInsuranceId,
      payer_id: this.selectedInsurancePayerId,
      policy_number: this.selectedInsurancePolicyNo,
      entry_type: formData.rbEntryType
    }

    if (this.lstClaimPayment == undefined)
      this.lstClaimPayment = new Array<any>();

    this.lstClaimPayment.push(paymentEntry);

    this.tempPaymentEntryId--;


    this.clearPaymentFeilds();
    //this.formGroup.get('txtEobEraId').setValue(null);
    //this.ddProcCode.nativeElement.focus();
    document.getElementById("txtEobEraId").focus();
    this.enableDisalbePaymentFeilds(false);
    this.populateData();


    debugger;
    // update payment to post
    this.eobEraPendingForPostingAmount = this.eobEraPendingForPostingAmount - GeneralOperation.getCurrencyNumbersOnly(formData.txtPaidAmount);

  }

  removePaymentFromSaveList(paymentId: number) {

    if (this.lstClaimPayment != undefined) {
      for (let i: number = this.lstClaimPayment.length - 1; i >= 0; i--) {
        let element = this.lstClaimPayment[i];
        if (element.claim_payments_id == paymentId && element.claim_payments_id < 0) {

          debugger;
          // update payment to post
          this.eobEraPendingForPostingAmount = this.eobEraPendingForPostingAmount + element.paid_amount;

          this.lstClaimPayment.splice(i, 1);
        }
      }
    }

    if (this.lstPaymentAdjustments != undefined) {
      for (let i: number = this.lstPaymentAdjustments.length - 1; i >= 0; i--) {
        let element = this.lstPaymentAdjustments[i];
        if (element.claim_payments_id == undefined && element.claim_payments_id < 0) {
          this.lstPaymentAdjustments.splice(i, 1);
        }
      }
    }

    this.populateData();
  }


  savePayment() {

    //if (this.eobEraPendingForPostingAmount < 0) {
    //  GeneralOperation.showAlertPopUp(this.ngbModal, 'Save Payment', "Payment can't exceed actual received amount.", AlertTypeEnum.DANGER)
    //  return;
    // }


    let wrapperClaimPaymentSave: WrapperClaimPaymentSave;
    let lstClaimPaymentSave: Array<OrmClaimPaymentSave>;
    let lstClaimPaymentAdjustmentSave: Array<OrmClaimPaymentAdjustmentSave>;

    this.clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    if (this.lstClaimPayment != undefined && this.lstClaimPayment.length > 0) {
      this.isSaving = true;

      this.lstClaimPayment.forEach(payment => {

        if (payment.claim_payments_id < 0) {

          debugger;
          let ormClaimPaymentSave: OrmClaimPaymentSave = new OrmClaimPaymentSave();

          ormClaimPaymentSave.claim_payments_id = payment.claim_payments_id;
          ormClaimPaymentSave.claim_procedures_id = payment.claim_procedures_id;
          ormClaimPaymentSave.patient_id = this.openedClaimInfo.patientId;
          ormClaimPaymentSave.claim_id = this.openedClaimInfo.claimId;
          ormClaimPaymentSave.payment_source = payment.payment_source;
          ormClaimPaymentSave.charged_procedure = payment.charged_procedure;
          ormClaimPaymentSave.paid_procedure = payment.paid_procedure;
          ormClaimPaymentSave.units = payment.units;
          ormClaimPaymentSave.check_date = payment.check_date;
          ormClaimPaymentSave.check_number = payment.check_number;
          ormClaimPaymentSave.paid_amount = payment.paid_amount;
          ormClaimPaymentSave.risk_amount = payment.risk_amount;
          ormClaimPaymentSave.writeoff_amount = payment.writeoff_amount;
          ormClaimPaymentSave.adjusted_amount = payment.adjusted_amount;
          ormClaimPaymentSave.patient_responsibility = payment.patient_responsibility;
          ormClaimPaymentSave.allowed_amount = payment.allowed_amount;
          ormClaimPaymentSave.deductable_amount = payment.deductable_amount;
          ormClaimPaymentSave.coinsurance_amount = payment.coinsurance_amount;
          ormClaimPaymentSave.copay_amount = payment.copay_amount;
          ormClaimPaymentSave.eob_era_id = payment.eob_era_id;
          ormClaimPaymentSave.practice_id = this.lookupList.practiceInfo.practiceId;
          ormClaimPaymentSave.autoposted_era = false;
          ormClaimPaymentSave.created_user = this.lookupList.logedInUser.user_name;
          ormClaimPaymentSave.client_date_created = this.clientDateTime;
          ormClaimPaymentSave.modified_user = this.lookupList.logedInUser.user_name;
          ormClaimPaymentSave.client_date_modified = this.clientDateTime;
          ormClaimPaymentSave.system_ip = this.lookupList.logedInUser.systemIp;
          ormClaimPaymentSave.eob_era_id_type = payment.eob_era_id_type;
          ormClaimPaymentSave.eob_page_no = payment.eob_page_no;
          ormClaimPaymentSave.payer_id = payment.payer_id;
          ormClaimPaymentSave.insurance_id = payment.insurance_id;
          ormClaimPaymentSave.policy_number = payment.policy_number;
          ormClaimPaymentSave.entry_type = payment.entry_type;

          if (lstClaimPaymentSave == undefined) {
            lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
          }

          lstClaimPaymentSave.push(ormClaimPaymentSave);

          if (this.lstPaymentAdjustments != undefined && this.lstPaymentAdjustments.length > 0) {
            this.lstPaymentAdjustments.forEach(adjustment => {

              if (adjustment.claim_payments_id == payment.claim_payments_id) {

                let ormAdjustmentSave: OrmClaimPaymentAdjustmentSave = new OrmClaimPaymentAdjustmentSave();

                ormAdjustmentSave.adjustment_id = adjustment.adjustment_id;
                ormAdjustmentSave.claim_payments_id = payment.claim_payments_id;
                ormAdjustmentSave.claim_id = this.openedClaimInfo.claimId;
                ormAdjustmentSave.claim_procedures_id = adjustment.claim_procedures_id;
                ormAdjustmentSave.client_date_created = this.clientDateTime;
                ormAdjustmentSave.client_date_modified = this.clientDateTime;
                ormAdjustmentSave.created_user = this.lookupList.logedInUser.user_name;
                ormAdjustmentSave.modified_user = this.lookupList.logedInUser.user_name;
                ormAdjustmentSave.practice_id = this.lookupList.practiceInfo.practiceId;
                ormAdjustmentSave.system_ip = this.lookupList.logedInUser.user_name;
                ormAdjustmentSave.adjust_amount = adjustment.adjust_amount;
                ormAdjustmentSave.adjust_code = adjustment.adjust_code;


                if (lstClaimPaymentAdjustmentSave == undefined) {
                  lstClaimPaymentAdjustmentSave = new Array<OrmClaimPaymentAdjustmentSave>();
                }

                lstClaimPaymentAdjustmentSave.push(ormAdjustmentSave);

              }
            });
          }
        }

      });

      wrapperClaimPaymentSave = new WrapperClaimPaymentSave(lstClaimPaymentSave, lstClaimPaymentAdjustmentSave, undefined, undefined);
    }


    if (wrapperClaimPaymentSave != undefined && wrapperClaimPaymentSave.lstClaimPaymentSave != undefined && wrapperClaimPaymentSave.lstClaimPaymentSave.length > 0) {

      this.paymentService.saveClaimPayment(wrapperClaimPaymentSave).subscribe(
        data => {
          this.isSaving = false;
          this.saveClaimPaymentSuccess(data);
        },
        error => {
          this.isSaving = false;
          this.saveClaimPaymentError(error);
        }
      );

    }
    else {
      this.isSaving = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Save Payment', "There is not payment to save.", AlertTypeEnum.INFO)

    }

  }

  saveClaimPaymentSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.isLoading = true;
      this.entryMode = false;
      this.loadPaymentDetails();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Save Payment', data.response, AlertTypeEnum.DANGER)

    }
  }

  saveClaimPaymentError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Save Payment', "An Error Occured while saving claim", AlertTypeEnum.DANGER)

  }


  rectifyPayment_Clicked(claim_payments_id: number, eob_era_id_type: number) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Rectify Payment';
    modalRef.componentInstance.promptMessage = 'Do you want to Rectify selected Payment?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        this.rectifyPayment(claim_payments_id, eob_era_id_type);
      }
    }, (reason) => {
      //alert(reason);
    });


  }

  private rectifyPayment(claim_payments_id: number, eob_era_id_type: number) {



    this.clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    let lstKeyValue: Array<ORMKeyValue> = new Array();

    lstKeyValue.push(new ORMKeyValue("practice_id", this.lookupList.practiceInfo.practiceId));
    lstKeyValue.push(new ORMKeyValue("claim_id", this.openedClaimInfo.claimId));
    lstKeyValue.push(new ORMKeyValue("claim_payment_id", claim_payments_id));
    lstKeyValue.push(new ORMKeyValue("client_date_time", this.clientDateTime));
    lstKeyValue.push(new ORMKeyValue("client_user", this.lookupList.logedInUser.user_name));
    lstKeyValue.push(new ORMKeyValue("client_ip", this.lookupList.logedInUser.systemIp));
    lstKeyValue.push(new ORMKeyValue("eob_era_id_type", eob_era_id_type));

    this.paymentService.rectifyPayment(lstKeyValue).subscribe(
      data => {
        this.rectifyPaymentSuccess(data);
      },
      error => {
        this.rectifyPaymentError(error);
      }
    );


  }

  rectifyPaymentSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.isLoading = true;
      this.loadPaymentDetails();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Rectify Payment', data.response, AlertTypeEnum.DANGER)

    }
  }

  rectifyPaymentError(error: any) {
    this.isLoading = false;

    GeneralOperation.showAlertPopUp(this.ngbModal, 'Rectify Payment', "An Error Occured while saving data", AlertTypeEnum.DANGER)
  }

  transferPatientPayment(paymentDetail: any) {

    const modalRef = this.ngbModal.open(TransferClaimPostedPatientPaymentComponent, this.popUpOptions);
    modalRef.componentInstance.openedClaimInfo = this.openedClaimInfo;
    modalRef.componentInstance.sourcePayment = paymentDetail;//(Number(paymentDetail.paid_amount)==NaN ||  paymentDetail.paid_amount=="") ? 0 : Number(paymentDetail.paid_amount);

    modalRef.result.then((result) => {
      debugger;
      if (result) {
        this.isLoading = true;
        this.loadPaymentDetails();
      }
    }, (reason) => {
      //alert(reason);
    });

  }
  showAdjustmentCodesGlossary() {
    debugger;
    let lstAdjustCodes: Array<string> = [];
    if (this.lstPaymentAdjustments != undefined) {
      this.lstPaymentAdjustments.forEach(adj => {

        lstAdjustCodes.push(adj.adjust_code);
      });

    }
    if (lstAdjustCodes != undefined && lstAdjustCodes.length > 0) {
      const modalRef = this.ngbModal.open(AdjustmentCodesGlossarayComponent, this.popUpOptionsLg);
      modalRef.componentInstance.lstAdjustCodes = lstAdjustCodes;
      modalRef.componentInstance.lstRemarksCodes = [];
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Adjustment Codes Glossary', "There is not adjust code.", AlertTypeEnum.INFO)
    }
  }

  refundPatientPayment() {

    debugger;
    const modalRef = this.ngbModal.open(RefundPatientPaymentComponent, this.popUpOptionsLg);
    modalRef.componentInstance.patientId = this.openedClaimInfo.patientId;
    modalRef.componentInstance.claimId = this.openedClaimInfo.claimId;
    modalRef.componentInstance.callingFrom = CallingFromEnum.CLAIM_PAYMENT;

    modalRef.result.then((result) => {
      debugger;
      if (result) {
        this.isLoading = true;
        this.loadPaymentDetails();
      }
    }, (reason) => {
      //alert(reason);
    });

  }


  importCashRegisterPayment() {

    debugger;
    const modalRef = this.ngbModal.open(ImportCashRegisterPaymentComponent, this.popUpOptionsLg);
    modalRef.componentInstance.openedClaimInfo = this.openedClaimInfo;

    modalRef.result.then((result) => {
      debugger;
      if (result) {
        this.isLoading = true;
        this.loadPaymentDetails();
      }
    }, (reason) => {
      //alert(reason);
    });

  }

  postPatientWreiteOff() {

    debugger;
    const modalRef = this.ngbModal.open(PostPatientWriteOffComponent, this.popUpOptions);
    modalRef.componentInstance.openedClaimInfo = this.openedClaimInfo;

    modalRef.result.then((result) => {
      debugger;
      if (result) {
        this.isLoading = true;
        this.loadPaymentDetails();
      }
    }, (reason) => {
      //alert(reason);
    });

  }

  showClaimPaymentEobEraInfo() {

    const modalRef = this.ngbModal.open(ClaimPaymentEobEraInfoComponent, this.popUpOptionsLg);
    modalRef.componentInstance.openedClaimInfo = this.openedClaimInfo;
  }

  callBack() {
    this.showEra = false;
    this.showEob = false;
  }
  openEOB_ERA(payment: any) {

    if (payment.eob_era_id_type == 'ERA') {
      this.eraIdToView = payment.eob_era_id;
      this.showEra = true;
    }
    else if (payment.eob_era_id_type == 'EOB') {
      this.eraIdToView = payment.eob_era_id;
      this.showEob = true;
    }
  }



  onPaste(event: ClipboardEvent, controlName: string) {
    debugger;
    event.preventDefault();

    var pastedText = '';

    if (event.clipboardData && event.clipboardData.getData) {// Standards Compliant FIRST!
      pastedText = event.clipboardData.getData('text/plain');
    }
    //else if (window.clipboardData && window.clipboardData.getData)
    //{// IE
    //    pastedText = window.clipboardData.getData('Text');
    //}

    this.formGroup.get(controlName).setValue(pastedText.trim());
  }

}
