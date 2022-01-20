import { LogMessage } from './../../shared/log-message';
import { GeneralOperation } from './../../shared/generalOperation';
import { EncounterService } from './../../services/encounter/encounter.service';
import { DateTimeUtil, DateTimeFormat } from '../../shared/date-time-util';
import { LookupList, LOOKUP_LIST } from '../../providers/lookupList.module';
import { Inject, Injectable } from '@angular/core';
import { SearchCriteria } from '../common/search-criteria';
import { ReferralService } from '../../services/patient/referral.service';
import { EncounterPrintViewerComponent } from 'src/app/general-modules/encounter-print-viewer/encounter-print-viewer.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
@Injectable()
export class DischargeSummary {
    
    chartId;
    patientId;
    visitDate;

    _patient_age: string = "";
    _patient_gender: string = "";
    strHtmlString: string = "";
    strHTMLReportHeader: string = "";
    strHTMLDemographic: string = "";
    strHTMLAppointment: string = "";
    strHTMLproblem: string = "";
    strHTMLVital: string = "";
    strHTMLMedication: string = "";
    strHTMLAllergy: string = "";
    strHTMLImmunization: string = "";
    strHTMLPlanOfCareNotes: string = "";
    strHTMLReferralReq: string = "";

    acReportHeader;
    acAppointment;
    acProblem;
    acVital;
    acMedication;
    acAllergy;
    acImmunization;
    acPlanofcare;
    acReferrals;
    acOfficeTests;

    print_callBack = 0;

    constructor(private encounterService: EncounterService,
        private referralService: ReferralService,
        private generalOperation: GeneralOperation,
        private logMessage: LogMessage,
        private modalService:NgbModal,
        private dateTimeUtil: DateTimeUtil,
        @Inject(LOOKUP_LIST) public lookupList: LookupList) { }

    isDataLoaded() {

        this.print_callBack--;
        if (this.print_callBack == 0) {
            this.createHtml();
           // var myWindow = window.open('', '', 'width=810,height=600,resizable=1');

    let script = '.styleTopSubHeader {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;	font-weight: bold;  font-size: 12px; color:black;}';
	script = script + '.customers{font-family:Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;font-size:11px;}';
	script = script + '.customers td, .customers th {border:1px solid #0376a8;padding:3px 7px 2px 7px;}';
	script = script + '.customers th {font-size:1.4em;text-align:left;padding-top:5px;padding-bottom:4px;background-color:#A7C942;color:#fff;} ';
	
	script = script + '.styleNormal {font-size: 11px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;}  ';
	script = script + '.styleAbnormal {font-family: Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;font-weight: bold; color:red;} ';
	
	script = script + '.tableMain{font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:12px;font-family:Calibri;border-collapse:collapse;border:.1px solid #333333;}';
	script = script + '.tableMain td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #333333;padding:3px 5px 2px 5px;}';
	script = script + '.tableMain tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #333333; }';
	script = script + '.tableMain th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:10px;text-align:left;padding:3px 5px 2px 5px;background-color:#f4fafd;color:#000000;}';

	script = script + '.tableNoBorder{font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:12px;font-family:Arial;border-collapse:collapse;border: border:0px;}'; 
	script = script + '.tableNoBorder td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:0px ;padding:3px 5px 2px 5px;valign:top;}'; 
	script = script + '.tableNoBorder tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:0px ; } ';
	script = script + '.tableNoBorder th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;valign:center;text-align:left;  background-color: #f4fafd; color:#000000; font-weight:bold;font-size:10px;border:.1px solid #333333;padding:3px 5px 2px 5px;}';
	
    //myWindow.document.write("<html><head></head><script>"+script+"</script><body>" + this.strHtmlString + "</body></html>");
    //myWindow.focus();

    const modalRef = this.modalService.open(EncounterPrintViewerComponent, this.poupUpOptions);
            modalRef.componentInstance.print_html = this.strHtmlString ;
            modalRef.componentInstance.print_style = script ;
        }

    }
    poupUpOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        size:'lg'
      };
    getData() {
        this.print_callBack++;
        this.getChartReportDetails();
        this.print_callBack++;
        this.getPastMedHistory();
        this.print_callBack++;
        this.getPatVitals();
        this.print_callBack++;
        this.getPatImmunizations();
        this.print_callBack++;
        this.getPatPrescription();
        this.print_callBack++;
        this.getPatAllergies();
        this.print_callBack++;
        this.getFutureAppointments();
        this.print_callBack++;
        this.getPatProgressNotes();
        this.print_callBack++;
        this.getPatientReferrals();
        this.print_callBack++;
        this.getChartOfficeTestCodeAmt();
    }
    getChartReportDetails() {
        this.encounterService.getChartReportDetails(this.chartId)
            .subscribe(
            data => {
                debugger;
                this.acReportHeader = data;
                this.isDataLoaded();
            },
            error => alert(error)
            );
    }
    getPastMedHistory() {
        this.encounterService.getAssessments(this.chartId)
            .subscribe(
            data => {
                this.acProblem = data;
                this.isDataLoaded();
            },
            error => this.logMessage.log("getPastMedHistory-Result" + error)
            );
    }
    getPatVitals() {
        this.encounterService.getChartVital(this.chartId)
            .subscribe(
            data => {
                this.acVital = data;
                this.isDataLoaded();
            },
            error => this.logMessage.log("getPatVitals-Result" + error)
            );
    }
    getPatImmunizations() {
        let searchCriteria: SearchCriteria = new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "patient_id", value: this.patientId, option: "" },
          { name: "chart_id", value: this.chartId, option: "" },
          { name: "chart_immunization_ids", value: "", option: "" },  // chart_immunization_ids empty to get all      
          { name: "include_deleted", value: true, option: "" }
        ];
    
        this.encounterService.getChartImmunizationSummary(searchCriteria)
          .subscribe(
            data => {
                this.acImmunization = data;
                this.isDataLoaded();
            },
            error => this.logMessage.log("getPatImmunizations-Result" + error)
            );
    }
    getPatPrescription() {
        let searchcrit: SearchCriteria = new SearchCriteria();
        searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
        searchcrit.param_list = [
            { name: "practice_id", value: this.lookupList.practiceInfo.practiceId, option: "" },
            { name: "patient_id", value: this.patientId, option: "" },
            { name: "criteria", value: "and ISNULL(archive,'') = 'N' and modified_user <> 'CCD'", option: "" }
        ];
        this.encounterService.getPatPrescription(searchcrit)
            .subscribe(
            data => {
                this.acMedication = data;
                this.isDataLoaded();
            },
            error => this.logMessage.log("getPatPrescription-Result" + error)
            );
    }
    getPatAllergies() {
        let searchcrit: SearchCriteria = new SearchCriteria();
        searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
        searchcrit.param_list = [
            //{ name: "practice_id", value: this.lookupList.practiceInfo.practiceId, option: "" },
            { name: "patient_id", value: this.patientId, option: "" },
            { name: "criteria", value: "and modified_user <> 'CCD'", option: "" }
        ];
        this.encounterService.getPatAllergies(searchcrit)
            .subscribe(
            data => {
                this.acAllergy = data;
                this.isDataLoaded();
            },
            error => this.logMessage.log("getPatAllergies-Result" + error)
            );
    }
    getFutureAppointments() {
        this.encounterService.getFutureAppointments(this.patientId, this.chartId)
            .subscribe(
            data => {
                this.acAppointment = data;
                this.isDataLoaded();
            },
            error => this.logMessage.log("getFutureAppointments-Result" + error)
            );
    }
    getPatProgressNotes() {
        this.encounterService.getPatProgressNotes(this.chartId)
            .subscribe(
            data => {
                this.acPlanofcare = data;
                this.isDataLoaded();
            },
            error => this.logMessage.log("getPatProgressNotes-Result" + error)
            );
    }
    getPatientReferrals() {
        let criteria: SearchCriteria = new SearchCriteria();
        criteria.practice_id = this.lookupList.practiceInfo.practiceId;
        criteria.param_list = [{ name: "patient_id", value: this.patientId }];
        this.referralService.getPatientReferral(criteria).subscribe(
            data => {
                this.acReferrals = data;
                this.isDataLoaded();
            },
            error => {
                error => this.logMessage.log("getPatientReferrals-Result" + error)
            }
        );
    }
    getChartOfficeTestCodeAmt() {
        
        this.encounterService.getChartOfficeTestCodeAmt(this.chartId).subscribe(
            data => {
                this.acOfficeTests = data;
                this.isDataLoaded();
            },
            error => {
                error => this.logMessage.log("getChartOfficeTestCodeAmt-Result" + error)
            }
        );
    }
    
    createHtml() {
        this.Header();
        //this.strHtmlString += "<br>";
        this.Demographic();
        this.strHtmlString += "<br>";
        this.Appointment();
        this.strHtmlString += "<br>";
        this.ReferralRequest();
        this.strHtmlString += "<br>";
        this.ProblemList();
        this.strHtmlString += "<br>";
        this.Vital();
        this.strHtmlString += "<br>";
        this.Medicine();
        this.strHtmlString += "<br>";
        this.Allergies();
        this.strHtmlString += "<br>";
        this.Immunization();
        this.strHtmlString += "<br>";
        this.PlanOfCareNotes();
        this.strHtmlString += "<br>";
        this.officeTest();
        this.strHtmlString += "<br>";
    }
    Header() {
        try {
            let acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PracticeLogo");
            var logoPath: string = "";
            if (acPath != null && acPath.length > 0) {
                logoPath = acPath[0].download_path + "/" + this.lookupList.practiceInfo.practiceId + "/PracticeLogo/logo-small.png";
            }
            logoPath = logoPath.replace("\\", "/");
            // var dob: Date = this.dateTimeUtil.getDateTimeFromString(this.acReportHeader[0].dob, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
            // var today: Date = this.dateTimeUtil.getDateTimeFromString(this.acReportHeader[0].visit_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
            // var Arrage: any = this.generalOperation.calculateAge(dob, today);
            // this._patient_age = "";
            // if (Arrage.length > 0) {
            //     var Years: Number = Number(Arrage[0]);
            //     var Months: Number = Number(Arrage[1]);

            //     if (Years > 0 || Months > 0) {
            //         if (Years > 0) {
            //             this._patient_age += Years.toString() + " year(s)";
            //         }

            //         if (Years < 2) {
            //             if (Years > 0 && Months > 0) {
            //                 this._patient_age += " and ";

            //             }
            //             if (Months > 0) {
            //                 this._patient_age += Months.toString() + " month(s)";
            //             }
            //         }
            //     }
            // }
            this.strHTMLReportHeader = "<title>" + this.acReportHeader[0].patient_name + "</title>";
            this._patient_gender = this.acReportHeader[0].gender == null ? "" : this.acReportHeader[0].gender.toString().toLocaleLowerCase() == "male" ? "M" : this.acReportHeader[0].gender.toString().toLocaleLowerCase() == "female" ? "F" : this.acReportHeader[0].gender.toString().toUpperCase();
            this.strHTMLReportHeader += " <table width='750' border='0' cellpadding='0' cellspacing='0'> " +
                "<tr>" +
                "	   <td rowspan='4' width='205' align='center' valign='top'><img src='" + logoPath + "'  width='200'/></td>" +
                "	   <td height='20' align='right' valign='top'><b><span class='styleNormal'>Visit Date:</span></b><span class='styleMainHeading'>" + this.acReportHeader[0].visit_date + "</span></td>" +
                "	</tr>" +

                "<tr>	" +
                "  <td colspan='2' width='100%' align='center' valign='top'><span class='styleTopHeader'>" + this.acReportHeader[0].practice_name + "</span></td>" +
                "</tr>" +
                "<tr>	" +
                "  <td colspan='2' align='center' valign='top'><span class='styleTopSubHeader'>" + this.acReportHeader[0].location_address + "</span></td>" +
                "</tr>" +
                "<tr>	" +
                "  <td colspan='2' align='center' valign='top'><span class='styleTopSubHeader'>Phone: &nbsp; " + this.acReportHeader[0].location_phone + "&nbsp;&nbsp;&nbsp;&nbsp; Fax:&nbsp;" + this.acReportHeader[0].location_fax + "</span></td>" +
                "</tr>" +
                "</table>";
            this.strHtmlString = this.strHTMLReportHeader;
            //this.strHtmlString += "<br>";
            this.strHtmlString += "<hr size='2' width='100%' color='#009140'>";
        }
        catch (error) {
            this.logMessage.log("Header-HTML" + error);
        }
    }
    Demographic() {
        try {
            this.strHTMLDemographic = "<table width=750 c>" +
                "<thead>" +
                "<tr>" +
                "<td colspan='3' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Your Demographic Information</td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>" +
                "<tr>" +
                "<td class='styleTopSubHeader'><b>Patient Name</b></td>" +
                "<td class='styleTopSubHeader'><b>Gender</b></td>" +
                "<td class='styleTopSubHeader'><b>DOB</b></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='styleNormal'>" + this.acReportHeader[0].patient_name + "</td>" +
                "<td class='styleNormal'>" + this.acReportHeader[0].gender + "</td>" +
                "<td class='styleNormal'>" + this.acReportHeader[0].dob + "</td>" +
                "</tr>" +
                "<tr>" +
                "<td colspan='3'></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='styleTopSubHeader'><b>Ethnicity Group</b></td>" +
                "<td class='styleTopSubHeader'><b>Race</b></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='styleNormal'>" + (this.acReportHeader[0].ethnicity == null ? "" : this.acReportHeader[0].ethnicity) + "</td>" +
                "<td class='styleNormal'>" + (this.acReportHeader[0].race = null ? "" : this.acReportHeader[0].race) + "</td>" +
                "</tr>" +
                "</tbody>" +
                "</table>";
            this.strHtmlString += this.strHTMLDemographic;
            this.strHtmlString += "<br>";
            this.strHtmlString += "<table width=750 >" +
                "<thead>" +
                "<tr>" +
                "<td colspan='2' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Your Visit Detail</td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>" +
                "<tr>" +
                "<td class='styleTopSubHeader'><b>Date</b></td>" +
                "<td class='styleTopSubHeader'><b>Provider</b></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='styleNormal'>" + this.acReportHeader[0].visit_date + "</td>" +
                "<td class='styleNormal'>" + this.acReportHeader[0].provider_name + "</td>" +
                "</tr>" +
                "</tbody>" +
                "</table>";
        }
        catch (error) {
            this.logMessage.log("Demographic-HTML" + error);
        }
    }
    Appointment() {
        try {
            this.strHTMLAppointment = "<table width=750 >" +
                "<thead>" +
                "<tr>" +
                "<td colspan='8' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Your Upcoming Appointments</td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";
            for (var i = 0; i < this.acAppointment.length; i++) {
                this.strHTMLAppointment += "<tr>" +
                    "<td class='styleNormal'><b>" + this.acAppointment[i].appointment_date + " " + this.acAppointment[i].appointment_time + "</b></td>" +
                    "<td class='styleNormal'>" + this.acAppointment[i].loc_name + ", " + this.acAppointment[i].loc_address + "</td>" + //Downtown Milwaukee WI 53215  414-000-1111
                    "</tr>";
            }
            if (this.acAppointment.length == 0) {
                this.strHTMLAppointment += "<tr><td class='styleNormal'>No Upcoming Appointment.</td></tr>"
            }
            this.strHTMLAppointment += "</tbody></table>";
            this.strHtmlString += this.strHTMLAppointment;
        }
        catch (error) {
            this.logMessage.log("Appointment-HTML" + error);
        }
    }
    ProblemList() {
        try {
            this.strHTMLproblem = "<table width=750 >" +
                "<thead>" +
                "<tr>" +
                "<td colspan='8' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Assessments</td>" +//Condition Discussed Today or Order-Related Diagnoses
                "</tr>" +
                "</thead>" +
                "<tbody>";
            for (var i = 0; i < this.acProblem.length; i++) {
                var strPrimary: string = "";
                this.strHTMLproblem += "<tr><td class='styleNormal'>" + this.acProblem[i].description + "";
                if (this.acProblem[i].notes.trim() != "") {
                    this.strHTMLproblem += " <b>Notes:&nbsp;</b>" + this.generalOperation.ReplaceHTMLReservedWords(this.acProblem[i].notes.trim());
                }
                this.strHTMLproblem += "</td></tr>";
            }
            if (this.acProblem.length == 0) {
                this.strHTMLproblem += "<tr><td class='styleNormal'>None.</td></tr>"
            }
            this.strHTMLproblem += "</tbody> </table>";
            this.strHtmlString += this.strHTMLproblem;
        }
        catch (error) {
            this.logMessage.log("ProblemList-HTML" + error);
        }
    }
    Vital() {
        try {
            this.strHTMLVital = "<table width=750 >" +
                "<thead>" +
                "<tr>" +
                "<td colspan='8' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Your Vitals Were </td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";

            for (var i = 0; i < this.acVital.length; i++) {
                var _heightUnit: String = "feet";
                var strHeight: String = _heightUnit == "feet" ? (this.acVital[0].height_feet != null ? this.acVital[0].height_feet : "") : _heightUnit == "meter" ? (this.acVital[0].height_meters != null ? this.acVital[0].height_meters : "") : "";
                var strbp: String = "";
                if ((this.acVital[0].systolic_bp1 != "" && this.acVital[0].systolic_bp1 != null) || (this.acVital[0].diastolic_bp1 != "" && this.acVital[0].diastolic_bp1 != null)) {
                    strbp = this.acVital[i].systolic_bp1 + "/" + this.acVital[i].diastolic_bp1;
                }
                this.strHTMLVital += " <tr>" +
                    "<td class='styleTopSubHeader'><b>Weight</b></td>" +
                    "<td class='styleTopSubHeader'><b>Height</b></td>" +
                    "<td class='styleTopSubHeader'><b>BMI</b></td>" +
                    "<td class='styleTopSubHeader'><b>BP</b></td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td class='styleNormal'>" + this.acVital[i].weight_lbs + " lbs</td>" +
                    "<td class='styleNormal'>" + strHeight + " " + _heightUnit + "</td>" +
                    "<td class='styleNormal'>" + this.acVital[i].bmi + " </td>" +
                    "<td class='styleNormal'>" + strbp + "</td>" +
                    "</tr>";
                break;
            }
            this.strHTMLVital += "</tbody></table>";
            this.strHtmlString += this.strHTMLVital;
        }
        catch (error) {
            this.logMessage.log("Vital-HTML" + error);
        }
    }
    Medicine() {
        try {
            this.strHTMLMedication += "<table width=750 >" +
                "<thead>" +
                "<tr>" +
                "<td colspan='8' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Medication Prescribed or Re-ordered Today </td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";
            var i = 0;
            this.acMedication = this.generalOperation.filterArray(this.acMedication, "archive", "N");
            var strtodaysMed: String = "";
            for (; i < this.acMedication.length; i++) {
                if (this.acMedication[i].start_date == this.acReportHeader[0].visit_date) {
                    strtodaysMed += "<tr>" +
                        "<td class='styleNormal'><b>" + this.generalOperation.ReplaceAll(this.acMedication[i].drug_info, "<", "&#60;") + "</b></td>" +
                        "<td class='styleNormal'>" + this.acMedication[i].quantity + "</td>" +
                        "<td class='styleNormal'></td>" +
                        "<td class='styleNormal'>" + this.acMedication[i].start_date + "</td>" +
                        "<td class='styleNormal'>" + this.acMedication[i].end_date + "</td>" +
                        "</tr>";

                    strtodaysMed += "<tr><td colspan='5' class='styleNormal'>" + this.acMedication[i].sig_text + "</td></tr>";
                }
            }
            if (strtodaysMed == "") {
                this.strHTMLMedication += "<tr><td class='styleNormal'>None</td></tr>";
            }
            else {
                this.strHTMLMedication += "<tr>" +
                    "<td></td>" +
                    "<td class='styleTopSubHeader'><b>Disp</b></td>" +
                    "<td class='styleTopSubHeader'><b>Refill</b></td>" +
                    "<td class='styleTopSubHeader'><b>Start</b></td>" +
                    "<td class='styleTopSubHeader'><b>End</b></td>" +
                    "</tr>";
                this.strHTMLMedication += strtodaysMed;
            }

            this.strHTMLMedication += "</tbody></table>";
            this.strHtmlString += this.strHTMLMedication;

            //curent med

            this.strHTMLMedication = "<br><table width=750 >" +
                "<thead>" +
                "<tr>" +
                "<td colspan='8' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Your current Medications are </td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";
            var strcurrentMed: String = "";
            i = 0;
            for (; i < this.acMedication.length; i++) {
                if (this.acMedication[i].start_date != this.acReportHeader[0].visit_date) {
                    strcurrentMed += "<tr>" +
                        "<td class='styleNormal'><b>" + this.generalOperation.ReplaceAll(this.acMedication[i].drug_info, "<", "&#60;") + "</b></td>" +
                        "<td class='styleNormal'>" + this.acMedication[i].quantity + "</td>" +
                        "<td class='styleNormal'></td>" +
                        "<td class='styleNormal'>" + this.acMedication[i].start_date + "</td>" +
                        "<td class='styleNormal'>" + this.acMedication[i].end_date + "</td>" +
                        "</tr>";

                    strcurrentMed += "<tr><td colspan='5' class='styleNormal'>" + this.acMedication[i].sig_text + "</td></tr>";
                }
            }
            if (strcurrentMed == "") {
                this.strHTMLMedication += "<tr><td class='styleNormal'>None</td></tr>";
            }
            else {
                this.strHTMLMedication += "<tr>" +
                    "<td></td>" +
                    "<td class='styleTopSubHeader'><b>Disp</b></td>" +
                    "<td class='styleTopSubHeader'><b>Refill</b></td>" +
                    "<td class='styleTopSubHeader'><b>Start</b></td>" +
                    "<td class='styleTopSubHeader'><b>End</b></td>" +
                    "</tr>";
                this.strHTMLMedication += strcurrentMed;
            }
            this.strHTMLMedication += "</tbody> </table>";
            this.strHtmlString += this.strHTMLMedication;
        }
        catch (error) {
            this.logMessage.log("Medicine-HTML" + error);
        }
    }
    Allergies() {
        try {

            this.strHTMLAllergy = "<table width=750 >" +
                "<thead>" +
                "<tr>" +
                "<td colspan='8' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Allergies </td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";
            for (var i = 0; i < this.acAllergy.length; i++) {
                this.strHTMLAllergy += "<tr>" +
                    "<td class='styleNormal'><b>" + this.acAllergy[i].description + "</b></td>" +
                    "<td class='styleNormal'>" + this.acAllergy[i].notes + "</td>" +
                    "</tr>";

            }
            if (this.acAllergy.length == 0) {
                this.strHTMLAllergy += "<tr><td class='styleNormal'>No Known Allergy</td></tr>";
            }
            this.strHTMLAllergy += "</tbody> </table>";
            this.strHtmlString += this.strHTMLAllergy;
        }
        catch (error) {
            this.logMessage.log("Allergies-HTML" + error);
        }
    }
    Immunization() {
        try {
            this.strHTMLImmunization = "<table width=750 >" +
                "<thead>" +
                "<tr>" +
                "<td colspan='8' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Immunization History </td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";
            if (this.acImmunization.length > 0) {
                this.strHTMLImmunization += "<tr>" +
                    "<td class='styleTopSubHeader'><b>Name</b></td>" +
                    "<td class='styleTopSubHeader'><b>Date</b></td>" +
                    "</tr>";
            }
            for (var i = 0; i < this.acImmunization.length; i++) {
                this.strHTMLImmunization += "<tr>" +
                    "<td class='styleNormal'><b>" + this.acImmunization[i].immunization_name + "</b></td>" +
                    "<td class='styleNormal'>" + this.acImmunization[i].datetime_administered + "</td>" +
                    "</tr>";
            }
            if (this.acImmunization.length == 0) {
                this.strHTMLImmunization += "<tr><td class='styleNormal'>None.</td></tr>"
            }
            this.strHTMLImmunization += "</tbody> </table>";
            this.strHtmlString += this.strHTMLImmunization;
        }
        catch (error) {
            this.logMessage.log("Immunization-HTML" + error);
        }
    }
    PlanOfCareNotes() {
        try {
            this.strHTMLPlanOfCareNotes = " <table width='750' ><thead>" +
                "<tr><td colspan='8' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Plan Of Care & Patient Instruction</td></tr></thead><tbody>";
            if (this.acPlanofcare != null && this.acPlanofcare.length > 0) {

                for (var i = 0; i < this.acPlanofcare.length; i++) {
                    if (this.acPlanofcare[i].notes_text != null && this.acPlanofcare[i].notes_text != "") {
                        if (i % 2 == 1)
                            this.strHTMLPlanOfCareNotes += "<tr >";
                        else
                            this.strHTMLPlanOfCareNotes += "<tr>";
                        this.strHTMLPlanOfCareNotes += "<td valign='center'>" + this.generalOperation.richTextEditorToHtml(this.acPlanofcare[i].notes_html) + "</td>" +
                            "</tr>";
                    }
                }
            }
            this.strHTMLPlanOfCareNotes += " </tbody> </table>";
            this.strHtmlString += this.strHTMLPlanOfCareNotes;
            this.strHtmlString += "<br>";
        }
        catch (error) {
            this.logMessage.log("PlanOfCareNotes-HTML" + error);
        }
    }
    officeTest() {
        try {
            
            if (this.acOfficeTests != null && this.acOfficeTests.length > 0) 
            {
                let stroffice:string;
                stroffice = " <table width='750' class='customers'><thead>" +
                    "<tr><td colspan='8' style='text-align: left; font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'>Self-Pay Patient Clinic Fee</td></tr></thead><tbody>";
                for (var i = 0; i < this.acOfficeTests.length; i++) 
                {
                    if (this.acOfficeTests[i].col4 != null && this.acOfficeTests[i].col4 != "") {
                        if (i % 2 == 1)
                        stroffice += "<tr >";
                        else
                        stroffice += "<tr>";

                        stroffice += "<td class='styleNormal' valign='center'>" + this.acOfficeTests[i].col3 + "</td>" +
                                                        "<td class='styleNormal' valign='center'>" + this.acOfficeTests[i].col4 + " $ </td>"
                            "</tr>";
                    }
                }
                stroffice += " </tbody> </table>";
                this.strHtmlString += stroffice;
                this.strHtmlString += "<br>";
            }
           
        }
        catch (error) {
            this.logMessage.log("officeTest-HTML" + error);
        }
    }
    ReferralRequest() {
        try {
            for (var i = 0; i < this.acReferrals.length; i++) {
                if (i == 0) {
                    this.strHTMLReferralReq = "<table width='750' class='tableMain'>" +
                        "<tr >" +
                        "  <td colspan='2' height='20' align='center' valign='middle' style='font-weight: bold; border-bottom:1px solid black;'><span class='styleTopSubHeader'>Referral Information</span></td>" +
                        "</tr>" +
                        "<tr height='20'>" +
                        "  <td height='20' align='center' valign='middle' style='font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'><span >FROM</span></td>" +
                        "  <td height='20' align='center' valign='middle' style='font-weight: bold; border-bottom:1px solid black;' class='styleTopSubHeader'><span >TO</span></td>" +
                        "</tr>";
                }
                this.strHTMLReferralReq += "<tr valign='top'>" +
                    "  <td width='50%'><table width='100%' class='tableNoBorder'>" +
                    "	  <tr>" +
                    "		<td width='60' align='left' >&nbsp;&nbsp;<span class='styleTopSubHeader' >Provider:</span></td>" +
                    "		<td  width='300' ><span  valign='top' class='styleNormal'>" + this.acReferrals[i].provider_name.toString().toUpperCase() + "</span></td>" +
                    "	  </tr>" +
                    "	  <tr >" +
                    "		<td align='left' >&nbsp;&nbsp;<span class='styleTopSubHeader'>Address:</span></td>" +
                    "		<td ><span  valign='top' class='styleNormal'>" + this.acReportHeader[0].location_address + "</span></td>" +
                    "	  </tr>" +
                    "	  <tr >" +
                    "		<td align='left' >&nbsp;&nbsp;<span class='styleTopSubHeader'>Phone:</span></td>" +
                    "		<td ><span  valign='top' class='styleNormal'>" + this.acReportHeader[0].location_phone + "</span></td>" +
                    "	  </tr>" +
                    "	  <tr >" +
                    "		<td align='left' >&nbsp;&nbsp;<span class='styleTopSubHeader'>Fax:</span></td>" +
                    "		<td ><span  valign='top' class='styleNormal'>" + this.acReportHeader[0].location_fax + "</span></td>" +
                    "	  </tr>" +

                    "	</table></td>" +
                    "  <td  width='50%'><table width='100%' class='tableNoBorder'>" +
                    "	  <tr >" +
                    "		<td width='60' align='left' >&nbsp;&nbsp;<span class='styleTopSubHeader'>Provider:</span></td>" +
                    "		<td width='300' ><span  valign='top' class='styleNormal'>" + this.acReferrals[i].referral_provider_name + "</span></td>" +
                    "	  </tr>" +
                    "	  <tr >" +
                    "		<td align='left' >&nbsp;&nbsp;<span class='styleTopSubHeader'>Address:</span></td>" +
                    "		<td ><span  valign='top' class='styleNormal'>" + this.acReferrals[i].referral_provider_address + "</span></td>" +
                    "	  </tr>" +
                    "	  <tr>" +
                    "		<td align='left' >&nbsp;&nbsp;<span class='styleTopSubHeader'>Phone:</span></td>" +
                    "		<td ><span  valign='top' class='styleNormal'>" + this.acReferrals[i].referral_provider_phone + "</span></td>" +
                    "	  </tr>" +
                    "	  <tr >" +
                    "		<td align='left' >&nbsp;&nbsp;<span class='styleTopSubHeader'>Fax:</span></td>" +
                    "		<td ><span  valign='top' class='styleNormal'>" + this.acReferrals[i].referral_provider_fax + "</span></td>" +
                    "	  </tr>" +
                    "	</table></td>" +
                    "</tr>";
                    this.strHtmlString += this.strHTMLReferralReq;
                    this.strHTMLReferralReq = "";
            }
            this.strHtmlString += "</table><br>";
        }
        catch (error) {
            this.logMessage.log("ReferralRequest-HTML" + error);           
        }
    }
}