export class ORMpayrollObj{
    s_no: String;
    cat_sub_sno: String;
    provider_name: String;
    category_name: String;
    proc_code: String;
    proc_description: String;
    patient_count: Number=0;
    visit_count: Number=0;
    proc_count: Number=0;
    proc_charges: String;
    proc_payment: String;
    is_aggregate: Boolean;
}