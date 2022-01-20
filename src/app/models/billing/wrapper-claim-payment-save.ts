import { ORMKeyValue } from "../general/orm-key-value";
import { OrmClaimPaymentAdjustmentSave } from "./orm-claim-payment-adjustment-save";
import { OrmClaimPaymentSave } from "./orm-claim-payment-save";
import { ORMCashRegisterAdd } from "./orm-cash-register-add";

export class WrapperClaimPaymentSave {

    cashRegisterAdd: ORMCashRegisterAdd;
    lstClaimPaymentSave: Array<OrmClaimPaymentSave>;
    lstClaimPaymentAdjustmentSave: Array<OrmClaimPaymentAdjustmentSave>;
    lstKeyValue: Array<ORMKeyValue>;


    constructor(lstPayment: Array<OrmClaimPaymentSave>,
        lstAdjustment: Array<OrmClaimPaymentAdjustmentSave>,
        lstKV: Array<ORMKeyValue>,
        cashReg: ORMCashRegisterAdd) {

        this.lstClaimPaymentSave = lstPayment;
        this.lstClaimPaymentAdjustmentSave = lstAdjustment;
        this.lstKeyValue = lstKV;
        this.cashRegisterAdd=cashReg;
    }
}