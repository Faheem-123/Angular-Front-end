export class LogedInUser {
    userId:number;
    user_name:string;//"arazzaq";
    password:string;
    //userfullname:string;
    userFName:string;
    userLName:string;
    userMname:string;
    userRole:string;   
    
    
    defaultLocation:number;
    defaultProvider:number;
    defaultBillingProvider:number;
    defaultChartSetting:number;  
    defaultSuperBill:number;  

    systemIp:string;
      
    userType:string;
    loginProviderId:number;
    loginProviderName:string;//"RAZZAQ, ANJUM";//"Provider, Name";
    userPracticeId:number;
    userDefaultPrescriptionRole:string;//"Doctor";//"administration only";// if empty then staff
    loginLog_id:number;
}