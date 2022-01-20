export class PrescriptionXml {
    practice_id:string;
    patient_id:string;
    prescriber_role:string;
    rxpartnername:string;
    rxusername:string;
    rxuserpassword:string;
    rxproductname:string;
    rxproductversion:string;
    rxsiteid:string;
    practice_name:string;
    address1:string;
    address2:string;
    city:string;
    state:string;
    zip:string;
    phone:string;
    fax:string;
//user info
    user_id:string;
    last_name:string;
    first_name:string;
    mname:string;
    
    providerid:string;
    chartid:string;
    locationid:string;
    addpatientinfo:boolean; 
    sendrxdiagnosis:boolean;
    externalprescriptionid:string;
    prescriptionlink:string;
    msg:string;
    requestedpage:string;
}