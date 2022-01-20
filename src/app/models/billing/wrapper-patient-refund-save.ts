import { OrmClaimPaymentSave } from "./orm-claim-payment-save";
import { ORMCreditCardPayment } from "./orm-credit-card-payment";
import { ORMKeyValue } from "../general/orm-key-value";
import { ORMPatientRefundSave } from "./orm-patient-refund-save";

export class WrapperPatientRefundSave {

    patientRefundSave: ORMPatientRefundSave;
    creditCardPaymentSave: ORMCreditCardPayment;
    lstClaimPaymentSave: Array<OrmClaimPaymentSave>;
    lstKeyValue: Array<ORMKeyValue>;

    constructor(refund: ORMPatientRefundSave, ccPayment: ORMCreditCardPayment, lstClaimPayment: Array<OrmClaimPaymentSave>, lstKV: Array<ORMKeyValue>) {

        this.patientRefundSave = refund;
        this.creditCardPaymentSave = ccPayment;
        this.lstClaimPaymentSave = lstClaimPayment;
        this.lstKeyValue = lstKV;
    }
}