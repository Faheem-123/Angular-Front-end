import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { PrescriptionXml } from '../models/encounter/PrescriptionXml';
import { GetPrescriptionAllergies } from '../models/encounter/GetPrescriptionAllergies';

export class NewCropXML {

    // private dateTimeUtil: DateTimeUtil;

    prepareObject(prescripXML: PrescriptionXml, objencounterToOpen, lookupList) {
        debugger;
        prescripXML.patient_id = objencounterToOpen.patient_id;
        prescripXML.practice_id = lookupList.practiceInfo.practiceId.toString();
        prescripXML.prescriber_role = lookupList.logedInUser.userDefaultPrescriptionRole.toString();
        prescripXML.chartid = objencounterToOpen.chart_id;

        let ProductionOption: String = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxProduction")[0].options.toString();

        if (ProductionOption.toLocaleUpperCase() == "YES") {
            prescripXML.rxusername = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxLiveUserName")[0].options;
            prescripXML.rxuserpassword = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxLivePassword")[0].options;
            prescripXML.prescriptionlink = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxLiveLink")[0].options;
        }
        else {
            prescripXML.rxusername = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxDemoUserName")[0].options;
            prescripXML.rxuserpassword = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxDemoPassword")[0].options;
            prescripXML.prescriptionlink = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxDemoLink")[0].options;
        }
        prescripXML.rxpartnername = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxPartnerName")[0].options;
        prescripXML.rxproductname = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxProductName")[0].options;
        prescripXML.rxproductversion = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxProductVersion")[0].options;
        prescripXML.rxsiteid = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxSiteId")[0].options;

        if ((prescripXML.rxpartnername == null || prescripXML.rxpartnername == "")
            || (prescripXML.rxusername == null || prescripXML.rxusername == "")
            || (prescripXML.rxuserpassword == null || prescripXML.rxuserpassword == "")
            || (prescripXML.rxpartnername == null || prescripXML.rxpartnername == "")
            || (prescripXML.rxproductversion == null || prescripXML.rxproductversion == "")
        ) {
            prescripXML.msg = "Rx Credentials are not correct, Please contact Administrator.";
            // alert("Rx Credentials are not correct, Please contact Administrator.");
            // return false; 
        }
        else {
            prescripXML.msg = "";
        }
        prescripXML.practice_name = lookupList.practiceInfo.practiceName;
        prescripXML.address1 = lookupList.practiceInfo.address1;
        prescripXML.address2 = lookupList.practiceInfo.address2;
        prescripXML.city = lookupList.practiceInfo.city;
        prescripXML.state = lookupList.practiceInfo.state;
        prescripXML.zip = lookupList.practiceInfo.zip;
        prescripXML.phone = lookupList.practiceInfo.phone;
        prescripXML.fax = lookupList.practiceInfo.fax;
        //user info
        prescripXML.user_id = lookupList.logedInUser.userId.toString();
        prescripXML.last_name = lookupList.logedInUser.userLName;
        prescripXML.first_name = lookupList.logedInUser.userFName;
        prescripXML.mname = lookupList.logedInUser.userMname;
        prescripXML.addpatientinfo = true; ////from newCrop_Prescription_Allergy function
        prescripXML.sendrxdiagnosis = true;// or false from general confg
        if (objencounterToOpen.externalprescriptionid != undefined)
            prescripXML.externalprescriptionid = objencounterToOpen.externalprescriptionid;//""; //from newCrop_Prescription_Allergy function
        else
            prescripXML.externalprescriptionid = "";

        prescripXML.requestedpage = "compose";//requested page in case of renew and pre med
        prescripXML.providerid = objencounterToOpen.provider_id;
        prescripXML.locationid = objencounterToOpen.location_id;

        return prescripXML;
    }

    prepareGetObject(ObjPresAllerg: GetPrescriptionAllergies, objencounterToOpen, lookupList, option) {
        debugger;
        let dateTimeUtil: DateTimeUtil = new DateTimeUtil();
        ObjPresAllerg.patientid = objencounterToOpen.patient_id;
        ObjPresAllerg.practiceid = lookupList.practiceInfo.practiceId.toString();

        ObjPresAllerg.loginuserid = lookupList.logedInUser.userId.toString();
        ObjPresAllerg.loginuser = lookupList.logedInUser.user_name.toString();

        ObjPresAllerg.rxpartnername = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxPartnerName")[0].options;
        ObjPresAllerg.rxsiteid = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxSiteId")[0].options;
        if (option == "Allergies") {
            ObjPresAllerg.prescreqstatus = "%";
            ObjPresAllerg.presreqsubstatus = "S";
        }
        else //if(option == "prescription") 
        {
            ObjPresAllerg.prescreqstatus = "C";
            ObjPresAllerg.presreqsubstatus = "%";
        }
        ObjPresAllerg.patinfousertype = "";
        debugger;
        ObjPresAllerg.clientdatetimestring = dateTimeUtil.getCurrentDateTimeString();

        let ProductionOption: String = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxProduction")[0].options.toString();
        if (ProductionOption.toLocaleUpperCase() == "YES") {
            ObjPresAllerg.rxproduction = true;
            ObjPresAllerg.rxusername = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxLiveUserName")[0].options;
            ObjPresAllerg.rxuserpassword = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxLivePassword")[0].options;
        }
        else {
            ObjPresAllerg.rxproduction = false;
            ObjPresAllerg.rxusername = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxDemoUserName")[0].options;
            ObjPresAllerg.rxuserpassword = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxDemoPassword")[0].options;
        }
        return ObjPresAllerg;
    }

    prepareGetObjectRefills(ObjPresAllerg: GetPrescriptionAllergies, lookupList) {
        debugger;
        let dateTimeUtil: DateTimeUtil = new DateTimeUtil();
        ObjPresAllerg.practiceid = lookupList.practiceInfo.practiceId.toString();

        ObjPresAllerg.loginuserid = lookupList.logedInUser.userId.toString();
        ObjPresAllerg.loginuser = lookupList.logedInUser.user_name.toString();

        ObjPresAllerg.rxpartnername = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxPartnerName")[0].options;
        ObjPresAllerg.rxsiteid = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxSiteId")[0].options;
        ObjPresAllerg.patinfousertype = "";
        ObjPresAllerg.clientdatetimestring = dateTimeUtil.getCurrentDateTimeString();

        let ProductionOption: String = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxProduction")[0].options.toString();
        if (ProductionOption.toLocaleUpperCase() == "YES") {
            ObjPresAllerg.rxproduction = true;
            ObjPresAllerg.rxusername = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxLiveUserName")[0].options;
            ObjPresAllerg.rxuserpassword = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxLivePassword")[0].options;
        }
        else {
            ObjPresAllerg.rxproduction = false;
            ObjPresAllerg.rxusername = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxDemoUserName")[0].options;
            ObjPresAllerg.rxuserpassword = new ListFilterPipe().transform(lookupList.appSettings, "description", "rxDemoPassword")[0].options;
        }
        return ObjPresAllerg;
    }
}