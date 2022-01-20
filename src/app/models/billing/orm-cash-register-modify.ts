export class ORMCashRegisterModify {
    cash_register_id:number;    
    copay_paid:number;
    selfpay_paid:number;    
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
    modification_comments:string;    
    modified_user:string;            
    system_ip:string;    
    client_date_modified:string;    
    write_off_code:string;   
    
    location_id:string;
    provider_id:string;
}