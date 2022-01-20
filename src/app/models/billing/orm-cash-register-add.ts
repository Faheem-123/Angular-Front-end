export class ORMCashRegisterAdd {
    cash_register_id:number;
    patient_id:number;
    appointment_id:number;
    provider_id:number;
    location_id:number;
    practice_id:number;    
    dos:string;
    copay_due:number;
    copay_paid:number;
    selfpay_due:number;
    selfpay_paid:number;
    previous_balance_due:number;
    previous_balance_paid:number;
    copay_write_off:number;
    selfpay_write_off:number;
    prev_balance_write_off:number;
    other_paid:number;
    advance_paid:number;
    copay_advance_adjusted:number;
    selfpay_advance_adjusted:number;
    prev_balance_advance_adjusted:number;
    other_advance_adjusted:number;
    payment_method:string;
    check_date:string;
    check_number:string;
    receipt_no:string;    
    comments:string;
    modification_comments:string;
    resolved:boolean;
    resolved_by:string;
    date_resolved:string;
    created_user:string;
    modified_user:string;
    date_created:string;
    date_modified:string;
    voided:boolean;
    deleted:boolean;
    system_ip:string;
    client_date_created:string;
    client_date_modified:string;
    check_bounce:boolean;
    is_refund:boolean;
    refund_amount:number;
    write_off_code:string;
    refund_main_id:number;
}