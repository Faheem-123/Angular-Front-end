import { ORMCashRegisterAdd } from "../billing/orm-cash-register-add";
import { ORMSavePatientNotPaidReason } from "../patient/orm-save-not-paid-reason";

export class WrapperCashRegisterSave {  
    orm_cash_register:ORMCashRegisterAdd; 
    orm_not_paid_reason:ORMSavePatientNotPaidReason; 
    cc_detail: String;
}