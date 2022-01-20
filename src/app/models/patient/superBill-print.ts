import { SchedulerService } from "src/app/services/scheduler/scheduler.service";
import { LookupList, LOOKUP_LIST } from "src/app/providers/lookupList.module";
import { Inject, OnInit } from "@angular/core";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { EncounterPrintViewerComponent } from "src/app/general-modules/encounter-print-viewer/encounter-print-viewer.component";

export class SuperBillPrint implements OnInit {
	constructor(private schedulerService: SchedulerService,
		@Inject(LOOKUP_LIST) public lookupList: LookupList,
		private modalService: NgbModal) {
		//  debugger;
		//this.getSuperBillData();
	}
	style =
		'.styleTopSubHeader {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;	font-weight: bold;  font-size: 12px; color:black;}' +
		'.customers{font-family:Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;font-size:11px;}' +
		'.customers td, #customers th {border:1px solid #0376a8;padding:3px 7px 2px 7px;}' +
		'.customers th {font-size:1.4em;text-align:left;padding-top:5px;padding-bottom:4px;background-color:#A7C942;color:#fff;}' +
		'.styleNormal {font-size: 11px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;}  ' +
		'.styleAbnormal {font-family: Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;font-weight: bold; color:red;} ' +
		'.tableMain{font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:12px;font-family:Calibri;border-collapse:collapse;border:.1px solid #333333;}' +
		'.tableMain td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #333333;padding:3px 5px 2px 5px;}' +
		'.tableMain tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #333333; }' +
		'.tableMain tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #333333; }' +
		'.tableNoBorder{font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:12px;font-family:Arial;border-collapse:collapse;border: border:0px;}' +
		'.tableNoBorder td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:0px ;padding:3px 5px 2px 5px;valign:top;}' +
		'.tableNoBorder tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:0px ; } ' +
		'.tableNoBorder th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;valign:center;text-align:left;  background-color: #f4fafd; color:#000000; font-weight:bold;font-size:10px;border:.1px solid #333333;padding:3px 5px 2px 5px;}' +
		'.tabletest{border-collapse: collapse;font-size: 9px; font-family: Verdana;} ' +
		'.tablewrite tr, .tblvitals tr{height:20px;}.tblvitals{border:1px solid black;border-bottom:0;border-collapse: collapse;height:20px;}.tblvitals td{border-left:1px solid black;} ';
	patientID = '';
	ProviderID = '';
	appointmentID = '';
	acReportHeader;
	CheckedTime = '';
	DropDownValue = '';
	acClaimDiagnos
	strHTMLSuperBillHeader: string = "";
	strHTMLCommentsPort: string = "";
	strHTMLClaimDiagnos: string = "";
	strHTMLpediatricroutecodes: string = "";
	strHTMLinternalmedcode: string = "";
	strHTMLmidwiferoute: string = "";
	strHTMLannualwellnessroute: string = "";
	strHTMLimmigrationRoute: string = "";
	strHTMLsamplerouteallcodes: string = "";
	dobFormat: string = "";

	ngOnInit() {
		debugger;
		this.getSuperBillData();
	}
	getSuperBillData() {
		debugger;
		this.getClaimDiagnos();
		this.getReportHeader();
	}
	getReportHeader() {
		this.schedulerService.getSuperbillHeaddertDetails(this.appointmentID).subscribe(
			data => {
				this.acReportHeader = data as Array<any>;
				this.reportHeader();
			},
			error => {
			}
		);
	}

	getClaimDiagnos() {

		this.schedulerService.getSuperBillcodes(this.ProviderID, this.DropDownValue, this.patientID).subscribe(
			data => {
				this.acClaimDiagnos = data as Array<any>;
			},
			error => {
			}
		);
	}
	reportHeader() {
		debugger;
		var PStatusIs: String = "";
		if (this.acReportHeader[0].primary_elig_status.toString().toLowerCase() == "a") {
			PStatusIs = "Active ,&nbsp" + this.acReportHeader[0].primary_elig_date + "";
		} else if (this.acReportHeader[0].primary_elig_status.toString().toLowerCase() == "i") {
			PStatusIs = "Inactive ,&nbsp" + this.acReportHeader[0].primary_elig_date + "";
		} else if (this.acReportHeader[0].primary_elig_status.toString().toLowerCase() == "u") {
			PStatusIs = "Unavailable";
		}
		else {
			PStatusIs = "";
		}
		var sStatusIs: String = "";
		if (this.acReportHeader[0].secondary_elig_status.toString().toLowerCase() == "a") {
			sStatusIs = "Active ,&nbsp" + this.acReportHeader[0].secondary_elig_date + "";
		} else if (this.acReportHeader[0].secondary_elig_status.toString().toLowerCase() == "i") {
			sStatusIs = "Inactive ,&nbsp" + this.acReportHeader[0].secondary_elig_date + "";
		} else if (this.acReportHeader[0].secondary_elig_status.toString().toLowerCase() == "u") {
			sStatusIs = "Unavailable";
		}
		else {
			sStatusIs = "";
		}
		if (this.CheckedTime == "") {
			this.CheckedTime = "_____";
		}
		//
		if (this.DropDownValue.toString().toLowerCase() == "internal med code") {
			this.strHTMLCommentsPort = "<tr><td>" +
				`<table class='tabletest super_bill imctable'>
					<tr>
						<td colspan='2'>BP:</td>
						<td style='width: 12.4%;'>Pulse:</td>
						<td style='width: 12.4%;'>RR:</td>
						<td style='width: 12.4%;'>Temp:</td>
						<td style='width: 12.4%;'>Weight:</td>
						<td style='width: 12.4%;'>Height:</td>
						<td style='width: 9.4%;'>BMI:</td>
						<td style='width: 15.4%;'>LMP:</td>
					</tr>
					<tr>
						<td colspan='2'>Pulse Ox:</td>
						<td>Glucose:</td>
						<td>RSS: POS&nbsp; NEG</td>
						<td colspan='2'>Last Mammogram:</td>
						<td colspan='2'>Smoking: YES&nbsp;&nbsp; NO</td>
						<td>
							<b>Allergies:</b>
						</td>
					</tr>
					<tr>
						<td colspan='3'>Pregnancy: POS&nbsp;&nbsp; NEG</td>
						<td>Vision: Left:</td>
						<td>Right:</td>
						<td>Last Pap:</td>
						<td colspan='2'>Drinking:&nbsp; YES&nbsp;&nbsp; NO</td>
						<td>EKG: Initials:</td>
					</tr>
					<tr>
						<td rowspan='2' style='width: 3%;'>UA</td>
						<td colspan='2'>Glucose:</td>
						<td>Ketone:</td>
						<td>Blood:</td>
						<td colspan='2'>Protein:&nbsp;</td>
						<td colspan='2'>Nitrate:&nbsp;</td>
					</tr>
					<tr>
						<td colspan='2'>Bilirubin:&nbsp;</td>
						<td>Sp.Gravity:</td>
						<td>&nbsp;PH:</td>
						<td colspan='2'>Urobilinogen:&nbsp;</td>
						<td colspan='2'>Leukocytes:</td>
					</tr>
				</table>
				<table style='width:99.5% !important; font-size:9px; font-family: Verdana; margin-left:3px; height:20px;'>
					<tr>
						<td style='vertical-align:top; width:12%;'>
							<b> Chief Complaint </b>(MA Staff): </td>
						<td style='border-bottom:1px solid black;'/>
					</tr>
				</table>
				<table style='width:99.5% !important; font-size:9px; font-family: Verdana; margin-left:3px;'>
					<tr>
						<td style='vertical-align:top;'>
							<b>Notes</b> (Provider): </td>
					</tr>
				</table>`
			/*
			"<table class='tabletest super_bill imctable'>" +
			"<tr>" +
			"<td colspan='2'>BP:</td>" +
			"<td style='width: 12.4%;'>Pulse:</td>" +
			"<td style='width: 12.4%;'>RR:</td>" +
			"<td style='width: 12.4%;'>Temp:</td>" +
			"<td style='width: 12.4%;'>Weight:</td>" +
			"<td style='width: 12.4%;'>Height:</td>" +
			"<td style='width: 9.4%;'>BMI:</td>" +
			"<td style='width: 15.4%;'>LMP:</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'>Pulse Ox:</td>" +
			"<td>Glucose:</td>" +
			"<td>RSS: POS&nbsp; NEG</td>" +
			"<td colspan='2'>Last Mammogram:</td>" +
			"<td colspan='2'>Smoking: YES&nbsp;&nbsp; NO</td>" +
			"<td><b>Allergies:</b></td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='3'>Pregnancy: POS&nbsp;&nbsp; NEG</td>" +
			"<td>Vision: Left:</td>" +
			"<td>Right:</td>" +
			"<td>Last Pap:</td>" +
			"<td colspan='2'>Drinking:&nbsp; YES&nbsp;&nbsp; NO</td>" +
			"<td>EKG: Initials:</td>" +
			"</tr>" +
			"<tr>" +
			"<td rowspan='2' style='width: 3%;'>UA</td>" +
			"<td colspan='2'>Glucose:</td>" +
			"<td>Ketone:</td>" +
			"<td>Blood:</td>" +
			"<td colspan='2'>Protein:&nbsp;</td>" +
			"<td colspan='2'>Nitrate:&nbsp;</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'>Bilirubin:&nbsp;</td>" +
			"<td>Sp.Gravity:</td>" +
			"<td>&nbsp;PH:</td>" +
			"<td colspan='2'>Urobilinogen:&nbsp;</td>" +
			"<td colspan='2'>Leukocytes:</td>" +
			"</tr>" +
			"</table>" +
			"<table style='width:99.5% !important; font-size:9px; font-family: Verdana; margin-left:3px; height:20px;'> " +
			"<tr>" +
			"<td style='vertical-align:top; width:12%;'><b> Chief Complaint </b>(MA Staff): </td>" +
			"<td style='border-bottom:1px solid black;'></td>" +
			"</tr>" +
			"</table> " +
			"<table style='width:99.5% !important; font-size:9px; font-family: Verdana; margin-left:3px;'>" +
			"<tr>" +
			"<td style='vertical-align:top;'> <b>Notes</b> (Provider): </td>" +
			"</tr>" +
			"</table>";
			*/

		} else {
			this.strHTMLCommentsPort = "<tr><td>" +
				`<table class='tabletest super_bill'>
					<tr>
						<td> BP: </td>
						<td> Pulse: </td>
						<td> OFC: </td>
						<td> Temp: </td>
						<td> Weight: </td>
						<td> Hight: </td>
						<td> BMI: </td>
						<td> LMP: </td>
					</tr>
				</table>
				<table class='tabletest super_bill tablewrite' style='width: 100%;'>
					<tr>
						<td colspan='2'> Pulse Ox: </td>
						<td> Glucose: </td>
						<td> RSS:&nbsp;POS&nbsp;&nbsp; NEG </td>
						<td class='text-center'> Level </td>
						<td colspan='4' class='text-center' style='text-align: center;'>
							<input type='checkbox'/>20 db HL &nbsp; &nbsp;<input type='checkbox'/>25 db HL &nbsp; &nbsp;<input type='checkbox'/>40 db HL &nbsp; &nbsp; </td>
					</tr>
					<tr>
						<td colspan='2' style='width: 24.5%;'> Pregnancy:&nbsp;POS&nbsp;&nbsp;NEG </td>
						<td style='width: 17.5%;'> Vision:Left: </td>
						<td style='width: 16.5%;'> Right: </td>
						<td class='text-center' style='text-align: center; width: 6.5%;'> Right Ear </td>
						<td class='text-center' style='text-align: center; width: 8.5%;'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>
						<td class='text-center' style='text-align: center; width: 8.5%;'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>
						<td class='text-center' style='text-align: center; width: 8.5%;'>&nbsp;Y&nbsp;&nbsp;&nbsp; N </td>
						<td class='text-center' style='text-align: center; width: 8.5%;'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>
					</tr>
					<tr>
						<td colspan='2'> Last Mammogram: </td>
						<td> Smoking:&nbsp;Yes&nbsp;&nbsp;No </td>
						<td>
							<b>Allergies:</b>
						</td>
						<td class='text-center'> Left Ear </td>
						<td class='text-center'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>
						<td class='text-center'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>
						<td class='text-center'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>
						<td class='text-center'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>
					</tr>
					<tr>
						<td colspan='2'> Last Pap: </td>
						<td> Drinking:&nbsp;Yes&nbsp;&nbsp;No </td>
						<td>EKG: &nbsp; Initials: </td>
						<td class='text-center'> PH </td>
						<td class='text-center'> 500 </td>
						<td class='text-center'> 1000 </td>
						<td class='text-center'> 2000 </td>
						<td class='text-center'> 4000 </td>
					</tr>
					<tr>
						<td rowspan='2' class='text-center'> UA </td>
						<td>Glucose: </td>
						<td> Ketone: </td>
						<td colspan='2'> Blood: </td>
						<td colspan='2'> Protein: </td>
						<td colspan='2'> Nitrate: </td>
					</tr>
					<tr>
						<td> Bilirubin: </td>
						<td> Sp.Gravity: </td>
						<td colspan='2'> PH: </td>
						<td colspan='2'> Urobilinogen: </td>
						<td colspan='2'> Leukocytes: </td>
					</tr>
				</table>
				</td>
				</tr>
				</table>
				<table style='width:99.5% !important; font-size:9px; font-family: Verdana; margin-left:3px; height:21px;'>
					<tr>
						<td style='vertical-align:top; width:12%;'>
							<b> Chief Complaint </b>(MA Staff): </td>
						<td style='border-bottom:1px solid black;'/>
					</tr>
				</table>
				<table style='width:99.5% !important; font-size:9px; font-family: Verdana; margin-left:3px;'>
					<tr>
						<td style='vertical-align:top;'>
							<b> Notes </b>(Provider): </td>
					</tr>
				</table>`
			/*
			"<table class='tabletest super_bill'>" +
			"<tr>" +
			"<td > BP: </td>" +
			"<td > Pulse: </td>" +
			"<td > OFC: </td>" +
			"<td > Temp: </td>" +
			"<td > Weight: </td>" +
			"<td > Hight: </td>" +
			"<td > BMI: </td>" +
			"<td > LMP: </td>" +
			"</tr>" +
			"</table>" +
			"<table class='tabletest super_bill tablewrite' style='width: 100%;'>" +
			" <tr> " +
			"<td colspan='2'> Pulse Ox: </td>" +
			"<td> Glucose: </td>" +
			"<td> RSS:&nbsp;POS&nbsp;&nbsp; NEG </td><td class='text-center'> Level </td>" +
			"<td colspan='4' class='text-center' style='text-align: center;'> <input type='checkbox'/>20 db HL &nbsp; &nbsp;<input type='checkbox'/>25 db HL &nbsp; &nbsp;<input type='checkbox'/>40 db HL &nbsp; &nbsp; </td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2' style='width: 24.5%;'> Pregnancy:&nbsp;POS&nbsp;&nbsp;NEG </td>" +
			"<td style='width: 17.5%;'> Vision:Left: </td>" +
			"<td style='width: 16.5%;'> Right: </td>" +
			"<td class='text-center' style='text-align: center; width: 6.5%;'> Right Ear </td>" +
			"<td class='text-center' style='text-align: center; width: 8.5%;'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>" +
			"<td class='text-center' style='text-align: center; width: 8.5%;'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>" +
			"<td  class='text-center' style='text-align: center; width: 8.5%;'>&nbsp;Y&nbsp;&nbsp;&nbsp; N </td>" +
			"<td class='text-center' style='text-align: center; width: 8.5%;'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'> Last Mammogram: </td>" +
			"<td> Smoking:&nbsp;Yes&nbsp;&nbsp;No </td>" +
			"<td><b>Allergies:</b> </td>" +
			"<td class='text-center'> Left Ear </td>" +
			"<td class='text-center'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>" +
			"<td class='text-center'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>" +
			"<td class='text-center'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>" +
			"<td class='text-center'> &nbsp;Y&nbsp;&nbsp;&nbsp; N </td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'> Last Pap: </td>" +
			"<td> Drinking:&nbsp;Yes&nbsp;&nbsp;No </td>" +
			"<td>EKG: &nbsp; Initials: </td>" +
			"<td class='text-center'> PH </td>" +
			"<td class='text-center'> 500 </td>" +
			"<td class='text-center'> 1000 </td>" +
			"<td class='text-center'> 2000 </td>" +
			"<td class='text-center'> 4000 </td>" +
			"</tr>" +
			"<tr>" +
			"<td rowspan='2' class='text-center'> UA </td>" +
			"<td>Glucose: </td>" +
			"<td> Ketone: </td>" +
			"<td colspan='2'> Blood: </td>" +
			"<td colspan='2'> Protein: </td>" +
			"<td colspan='2'> Nitrate: </td>" +
			"</tr>" +
			"<tr>" +
			"<td> Bilirubin: </td>" +
			"<td> Sp.Gravity: </td>" +
			"<td colspan='2'> PH: </td>" +
			"<td colspan='2'> Urobilinogen: </td>" +
			"<td colspan='2'> Leukocytes: </td>" +
			"</tr>" +
			"</table>" +
			"</td>" +
			"</tr>" +
			"</table>" +
			"<table style='width:99.5% !important; font-size:9px; font-family: Verdana; margin-left:3px; height:21px;'> " +
			"<tr>" +
			"<td style='vertical-align:top; width:12%;'><b> Chief Complaint </b>(MA Staff): </td>" +
			"<td style='border-bottom:1px solid black;'></td>" +
			"</tr>" +
			"</table>" +
			"<table style='width:99.5% !important; font-size:9px; font-family: Verdana; margin-left:3px;'> " +
			"<tr>" +
			"<td style='vertical-align:top;'><b> Notes </b>(Provider): </td>" +
			"</tr>" +
			"</table> ";
			*/
		}

		if (this.acClaimDiagnos != null && this.acClaimDiagnos.length > 0) {
			debugger;
			let i = 0;
			//<style type='text/css'>.tabletest{border-collapse: collapse;} .tabletest, .tabletest td, .tabletest th{border: 1px solid black;}</style>
			this.strHTMLClaimDiagnos = "<table class='tabletest super_bill' >" +
				"<thead  class='superBillrowHeader text-center'><tr>" +
				"<th style='width:28%;'>Description</th>" +
				"<th style='width:5%;'>Code</th>" +
				"<th style='width:28%;'>Description</th>" +
				"<th style='width:5%;'>Code</th>" +
				"<th style='width:28%;'>Description</th>" +
				"<th style='width:5%;'>Code</th></tr></thead>";
			for (i = 0; i < this.acClaimDiagnos.length; i++) {
				this.strHTMLClaimDiagnos += "<tr><td>" + this.acClaimDiagnos[i].col2 + "</td><td>" + this.acClaimDiagnos[i].col1 + "</td>";
				if (i + 1 < this.acClaimDiagnos.length) {
					this.strHTMLClaimDiagnos += "<td>" + this.acClaimDiagnos[i + 1].col2 + "</td><td>" + this.acClaimDiagnos[i + 1].col1 + "</td>";
				}
				if (i + 2 < this.acClaimDiagnos.length) {
					this.strHTMLClaimDiagnos += "<td>" + this.acClaimDiagnos[i + 2].col2 + "</td><td>" + this.acClaimDiagnos[i + 2].col1 + "</td>";
				}
				this.strHTMLClaimDiagnos += "</tr>";
				i = i + 2;
			}
			this.strHTMLClaimDiagnos += "</table></td></tr><div style='height:2px;'></div>";

		}
		else {
			this.strHTMLClaimDiagnos = "</td></tr>";
		}


		////////////////////
		//var CurrentDF:DateFormatter = new DateFormatter();
		//var dob:Date=new Date(CurrentDF.format(PatientData.getItemAt(0).dob_101));
		this.dobFormat = "";
		var dob: String = this.acReportHeader[0].dob;
		var dobyears: String = dob.split('~')[1];
		var dobmonths: String = dob.split('~')[2];
		var dobdays: String = dob.split('~')[3];

		if (dobyears > "0") {
			this.dobFormat = dobyears + " Y";
		}

		if (dobmonths > "0") {
			if (this.dobFormat != "")
				this.dobFormat += " - ";
			this.dobFormat += dobmonths + " M";
		}
		if (dobdays > "0") {
			if (dobyears <= "0" || dobmonths <= "0") {
				if (this.dobFormat != "")
					this.dobFormat += " - ";
				this.dobFormat += dobdays + " D";
			}
		}
		dob = dob.split('~')[0];
		// "<script src='https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script><script type='text/javascript'>"+
		// 	"$(document).ready(function () { window.print(); })</script><style type='text/css'> @media print {thead {display: table-header-group;} } @page{margin:3mm 3mm 3mm 3mm !important;}table{width:100% !important;}.imctable tr{height: 20px;}</style>";
		this.strHTMLSuperBillHeader = "" +
			"<table border='0' cellpadding='0' cellspacing='0' class='tabletestwoBorder' >" +
			"<tr>" +
			"<td colspan='3'>" +
			"<div  class='float-left'><b>Route #:</b>____________ &nbsp</div>" +
			"<div class='float-right'><b>Room #:</b>__________________&nbsp</div>" +
			"</td></tr>" +
			"<tr>" +
			"<td class='text-left' style='width:32%;'>" +
			"<span style='font-size:9px !important;'>PID: <b>" + this.acReportHeader[0].alternate_account + "<b></span></td>" +
			"<td  class='text-center' style='width:35%;'>" +
			" <span class='styleTopHeader'>" + this.acReportHeader[0].practice_name + "</span></td>" +
			"<td  class='text-right' style='width:33%;  text-align: right;'>" +
			"<span style='font-size:9px !important;'>Apt.Date: <b>" + this.acReportHeader[0].appointmentdate + "</b></span>" +
			"</td></tr>" +
			"<tr><td class='text-left' >" +
			"<span style='font-size:9px !important;'>Provider:<b> " + this.acReportHeader[0].providername + "</b></span></td>" +
			"<td  class='text-center' >" +
			"<span class='styleTopSubHeader'>" + this.DropDownValue.toString().toUpperCase() + "</span></td><td class='text-right'>" +
			"<span style='font-size:9px !important;'>Check In: " + this.CheckedTime + " Chart Up: _____</span>&nbsp;</td></tr>" +
			"<tr><td colspan='3'>" +
			"<div class='float-left' >" +
			"<span class='styleMainHeading'>Location: <b>" + this.acReportHeader[0].locationname + "</b></span></div>" +
			"<div class='float-right'>";
		if (this.acReportHeader[0].primary_ins_name != "") {
			this.strHTMLSuperBillHeader = this.strHTMLSuperBillHeader + "<span>Primary Insurance: </span>" +
				"<span><b>" + this.acReportHeader[0].primary_ins_name + "</b>,&nbsp Policy No:<b>" + this.acReportHeader[0].primary_policy_number + "</b>&nbsp<b>" + PStatusIs + "</b></span>";
		} else {
			this.strHTMLSuperBillHeader = this.strHTMLSuperBillHeader + "<span>Primary Insurance:<b> N/A</b> </span>";
		}
		this.strHTMLSuperBillHeader = this.strHTMLSuperBillHeader + "</div></td></tr><tr><td colspan='3'><div class='float-left' ><span>Patient: <b>" + this.acReportHeader[0].patient_name + "</b>,&nbsp<b>" + dob + "</b>&nbsp-&nbsp<b>" + this.dobFormat + "</b>&nbsp-&nbsp<b>" + this.acReportHeader[0].gender + "</b></span></div><div class='float-right' >";
		if (this.acReportHeader[0].secondary_ins_name != "") {
			this.strHTMLSuperBillHeader = this.strHTMLSuperBillHeader + "<span>Secondary Insurance: </span><span><b>" + this.acReportHeader[0].secondary_ins_name + "</b>,&nbsp Policy No:<b>" + this.acReportHeader[0].secondary_policy_number + "</b>,&nbsp<b>" + sStatusIs + "</b></span>";
		} else {
			this.strHTMLSuperBillHeader = this.strHTMLSuperBillHeader + "<span>Secondary Insurance: <b>N/A</b> </span>";
		}
		this.strHTMLSuperBillHeader = this.strHTMLSuperBillHeader + "</div></td></tr><tr><td colspan='3'>" +
			"<div class='float-left' ><span><b>" + this.acReportHeader[0].patient_address + "</b></span></div>" +
			"<div class='float-right' ><span>" + this.acReportHeader[0].pphonenumber + "</span></div></td></tr><tr><td colspan='3'>" +
			"<hr size='1' width='100%' color='#81c9e9'></td></tr></table>";


		if (this.DropDownValue.toString().toLowerCase() == "pediatric route codes") {
			this.strHTMLpediatricroutecodes =
				`<table class='tabletestwoBorder'>
				<tr>
					<td>
						<table class='tabletest super_bill'>
							<thead>
								<tr class='superBillrowHeader'>
									<th class='text-center'>
										<label>
											<b>Office visit</b>
										</label>
									</th>
									<th class='text-center'>
										<label>
											<b>New</b>
										</label>
									</th>
									<th class='text-center'>
										<label>
											<b>Est</b>
										</label>
									</th>
									<th class='text-center'>
										<label>
											<b>Vaccines</b>
										</label>
									</th>
									<th>&nbsp;</th>
								</tr>
							</thead>
							<tr>
								<td>
									<label>Level I - Minimal</label>
									<label class='float-right mr-5'>05/10 min</label>
								</td>
								<td>
									<label>99201</label>
								</td>
								<td>
									<label>99211</label>
								</td>
								<td>
									<span>Pentacel</span>
								</td>
								<td>
									<span>90698</span>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level II - Low</label>
									<label class='float-right mr-5'>10/20 min</label>
								</td>
								<td>
									<label>99202</label>
								</td>
								<td>
									<label>99212</label>
								</td>
								<td>
									<span>Prevnar (pneumonia valient 13; V03.82)</span>
								</td>
								<td>
									<span>90670</span>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level III - Detailed</label>
									<label class='float-right mr-5'>30/15 min</label>
								</td>
								<td>
									<label>99203</label>
								</td>
								<td>
									<label>99213</label>
								</td>
								<td>
									<span>Hep B, ped/adol 3 dose (V05.3)</span>
								</td>
								<td>
									<span>90744</span>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level IV - Comprehensive</label>
									<label class='float-right mr-5'>25/40 min</label>
								</td>
								<td>
									<label>99204</label>
								</td>
								<td>
									<label>99214</label>
								</td>
								<td>
									<span>Rotavirus</span>
								</td>
								<td>
									<span>90680</span>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level V - High Complex</label>
									<label class='float-right mr-5'>40/60 min</label>
								</td>
								<td>
									<label>99205</label>
								</td>
								<td>
									<label>99215</label>
								</td>
								<td>
									<label>Pediarix (Dtap+Hep+IPV)</label>
									<label class='float-right mr-5'>V06.8</label>
								</td>
								<td>
									<span>90723</span>
								</td>
							</tr>
							<tr>
								<td>
									<label>
										<b>Significant, Separate Service</b>
									</label>
								</td>
								<td>
									<label>
										<b>-25 </b>
									</label>
								</td>
								<td>
									<label>
										<b>-25 </b>
									</label>
								</td>
								<td>Hib, PRP-T</td>
								<td>90648</td>
							</tr>
							<tr>
								<td class='superBillrowHeader'>
									<label>
										<b>Well visit</b>
									</label>
								</td>
								<td class='superBillrowHeader'>
									<label>
										<b>New</b>
									</label>
								</td>
								<td class='superBillrowHeader'>
									<label>
										<b>Est</b>
									</label>
								</td>
								<td>
									<label>MMR (V06.4)</label>
								</td>
								<td>
									<label>90707</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>
										&gt; 1 y</label>
								</td>
								<td>
									<label>99381</label>
								</td>
								<td>
									<label>99391</label>
								</td>
								<td>
									<span>Varicella (V05.4)</span>
								</td>
								<td>
									<span>90716</span>
								</td>
							</tr>
							<tr>
								<td>
									<label>1-4 y</label>
								</td>
								<td>
									<label>99382</label>
								</td>
								<td>
									<label>99392</label>
								</td>
								<td>
									<label>DtaP, &gt; 7 y (V06.1)</label>
								</td>
								<td>
									<label>90700</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>5-11 y</label>
								</td>
								<td>
									<label>99383</label>
								</td>
								<td>
									<label>99393</label>
								</td>
								<td>
									<label>TD, &gt;7 y (V06.5)</label>
								</td>
								<td>
									<label>90702</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>12-17 y</label>
								</td>
								<td>
									<label>99384</label>
								</td>
								<td>
									<label>99394</label>
								</td>
								<td>
									<span>Hep A, ped/adol, 2 dose (V05.3)</span>
								</td>
								<td>
									<span>90633</span>
								</td>
							</tr>
							<tr>
								<td>
									<label>18-39 y</label>
								</td>
								<td>
									<label>99385</label>
								</td>
								<td>
									<label>99395</label>
								</td>
								<td>
									<span>Kinrix</span>
								</td>
								<td>
									<span>90696</span>
								</td>
							</tr>
							<tr>
								<td>
									<label>Tobacco counseling/3-10 min</label>
								</td>
								<td>
									<label>G0436</label>
								</td>
								<td>&nbsp;</td>
								<td>
									<label>Meningococcal</label>
									<label class='float-right mr-5'>V01.84</label>
								</td>
								<td>
									<span>90734</span>
								</td>
							</tr>
							<tr>
								<td>
									<label>Tobacco counseling/>10 min</label>
								</td>
								<td>
									<label>G0437</label>
								</td>
								<td>&nbsp;</td>
								<td>
									<span>Tdap, 7 y + (V06.1)</span>
								</td>
								<td>
									<span>90715</span>
								</td>
							</tr>
							<tr>
								<td colspan='2' class='superBillrowHeader'>
									<label>
										<b>Other services</b>
									</label>
								</td>
								<td class='superBillrowHeader'>&nbsp;</td>
								<td>
									<span>HPV, quadrivalent (V04.89)</span>
								</td>
								<td>
									<span>90651 </span>
								</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Urgent Care</label>
								</td>
								<td>
									<label>99050</label>
								</td>
								<td>
									<label>IPV (V04.0)</label>
								</td>
								<td>
									<label>90713</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>weekend appointment</label>
								</td>
								<td>
									<label>99051</label>
								</td>
								<td>Adult Td &gt;7 yr</td>
								<td>&nbsp;</td>
							</tr>
							<tr>
								<td colspan='2'>BMI Documented</td>
								<td>3008F</td>
								<td>
									<sImmun Admin One Vac</span>Immun Admin One Vac</td><td>
									<span>90471</span>
								</td>
							</tr>
							<tr>
								<td colspan='2'>
									<span>TB, intradermal</span>
								</td>
								<td>86580</td>
								<td>
									<span>Immun Admin Ea Add&#39;tl</span>
								</td>
								<td>
									<span>90472</span>
								</td>
							</tr>
							<tr>
								<td colspan='2' class='superBillrowHeader'>
									<label>
										<b>Screenings</label>
									</td>
									<td class='superBillrowHeader'>&nbsp;</td>
									<td>Trumenba Vaccine</td>
									<td>90621</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Hearing Pure Tone</label>
									</td>
									<td>
										<label>92552</label>
									</td>
									<td>
										<span>Flu, preservative-free, 6-35 months (V04.81)</span>
									</td>
									<td>
										<span>90655</span>
									</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Vision Screening</label>
									</td>
									<td class='style1'>
										<label>99173</label>
									</td>
									<td>
										<span>Flu, preservative-free, 3 y + (V04.81)</span>
									</td>
									<td>
										<span>90656</span>
									</td>
								</tr>
								<tr>
									<td colspan='2' class='superBillrowHeader'>
										<label>
											<b>Waived Lab</b>
										</label>
									</td>
									<td class='superBillrowHeader'>&nbsp;</td>
									<td>
										<span>Flu, quadrivalent, live, intranasal (V04.81)</span>
									</td>
									<td>
										<span>90672</span>
									</td>
								</tr>
								<tr>
									<td colspan='2'>Pregnancy Test</td>
									<td>81025</td>
									<td>
										<span>Flu, inactivated, subunit, adjuvanted, IM (V04.81)</span>
									</td>
									<td>
										<span>90653</span>
									</td>
								</tr>
								<tr>
									<td colspan='2'>Rapid Strep </td>
									<td>87880</td>
									<td>
										<span>
											<label>Bexero</label>
										</span>
									</td>
									<td>
										<span>
											<label>90620</label>
										</span>
									</td>
								</tr>
								<tr>
									<td colspan='2'>Urine Dipstick </td>
									<td>81002</td>
									<td>
										<label>Proquad</label>
									</td>
									<td>90710</td>
								</tr>
								<tr>
									<td colspan='2'>Urine Automated</td>
									<td>81003</td>
									<td>
										<label>Quadracel</label>
									</td>
									<td>
										<label>90696</label>
									</td>
								</tr>
								<tr>
									<td colspan='2'>Rapid Flu</td>
									<td>87502</td>
									<td>
										<label>Flulaval Quadrivalent&nbsp; &gt;6 months</label>
									</td>
									<td>
										<label>90686</label>
									</td>
								</tr>
								<tr>
									<td colspan='2' class='superBillrowHeader'>
										<label>
											<b>Office procedures</b>
										</label>
									</td>
									<td class='superBillrowHeader'>&nbsp;</td>
									<td class='superBillrowHeader'>
										<label>
											<b>Consultation/preop clearance</b>
										</label>
									</td>
									<td class='superBillrowHeader'>
										<label>
											<b>All insurance Except MCR</b>
										</label>
									</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Nebulizer</label>
									</td>
									<td>
										<label>94640</label>
									</td>
									<td>Problem focused  </td>
									<td>99241</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Lab Handling</label>
									</td>
									<td>
										<label>99000</label>
									</td>
									<td>Expanded problem focused</td>
									<td>99242</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Ear Irrigation</label>
									</td>
									<td>
										<label>69210</label>
									</td>
									<td>Detailed  </td>
									<td>99243</td>
								</tr>
								<tr>
									<td colspan='2'> Hemoglobin</td>
									<td> 85018</td>
									<td>Comprehensive/mod complex  </td>
									<td>99244</td>
								</tr>
								<tr>
									<td colspan='2'>  Lead Screening</td>
									<td>83655</td>
									<td class='style1'> Comprehensive/high complex</td>
									<td class='style1'>99245</td>
								</tr>
								<tr>
									<td colspan='2'>Fluoride</td>
									<td>D1208</td>
									<td>Trans care mgmt/mod complex  </td>
									<td>99495</td>
								</tr>
								<tr>
									<td colspan='2'> Silver nitrate cautery</td>
									<td>17250</td>
									<td>Trans care mgmt/high complex  </td>
									<td>99496</td>
								</tr>
								<tr>
									<td colspan='2'>EKG</td>
									<td>93000</td>
									<td class='superBillrowHeader'>
										<label>
											<b>Supplies</b>
										</label>
									</td>
									<td class='superBillrowHeader'/>
								</tr>
								<tr>
									<td colspan='2'>Brief emotional/behavioral assessment</td>
									<td>96127</td>
									<td>
										<label>Albuterol</label>
									</td>
									<td>
										<label>J7618</label>
									</td>
								</tr>
								<tr>
									<td colspan='2'>COVID-19 Test</td>
									<td> &nbsp;</td>
									<td>Suture removal tray</td>
									<td>A4550</td>
								</tr>
								<tr>
									<td colspan='2'>14 Panel Drug Test</td>
									<td>80305</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>`;
			/*
				" <table class='tabletestwoBorder'><tr><td> " +
				" <table class='tabletest super_bill'>" +
				"<thead>" +
				"<tr class='superBillrowHeader'>" +
				"<th class='text-center'><label><b>Office visit</b></label> </th>" +
				"<th class='text-center'><label><b>New</b></label></th>" +
				"<th class='text-center'><label><b>Est</b></label></th>" +
				"<th class='text-center'> <label><b>Vaccines</b></label></th>" +
				"<th >&nbsp;</th>" +
				"</tr>" +
				"</thead>" +

				"<tr>" +
				"<td><label>Level I - Minimal</label><label class='float-right mr-5' >05/10 min</label></td> " +
				" <td><label>99201</label></td>" +
				"<td><label>99211</label></td>" +
				"<td><span>Pentacel</span></td>" +
				"<td><span>90698</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Level II - Low</label><label class='float-right mr-5'>10/20 min</label></td>" +
				"<td><label>99202</label></td>" +
				"<td><label>99212</label></td>" +
				"<td><span>Prevnar (pneumonia valient 13; V03.82)</span></td> " +
				"<td><span>90670</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Level III - Detailed</label><label class='float-right mr-5'>30/15 min</label></td>" +
				"<td><label>99203</label></td>" +
				"<td><label>99213</label></td>" +
				"<td><span>Hep B, ped/adol 3 dose (V05.3)</span></td>" +
				"<td><span>90744</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Level IV - Comprehensive</label><label class='float-right mr-5'>25/40 min</label></td>" +
				"<td><label>99204</label></td>" +
				"<td><label>99214</label></td>" +
				"<td><span>Rotavirus</span></td>" +
				"<td><span>90680</span></td> " +
				" </tr>" +
				"<tr>" +
				"<td><label>Level V - High Complex</label><label class='float-right mr-5'>40/60 min</label></td>" +
				"<td><label>99205</label></td>" +
				"<td><label>99215</label></td>" +
				"<td><label>Pediarix (Dtap+Hep+IPV)</label><label class='float-right mr-5'>V06.8</label></td>" +
				"<td><span>90723</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label><b>Significant, Separate Service</b></label></td>" +
				"<td><label><b>-25 </b> </label></td>" +
				"<td><label><b>-25 </b></label></td>" +
				"<td>Hib, PRP-T</td><td>90648</td>" +
				"</tr>" +
				"<tr>" +
				"<td class='superBillrowHeader'><label><b>Well visit</b></label></td>" +
				"<td class='superBillrowHeader'><label><b>New</b></label></td>" +
				"<td class='superBillrowHeader'><label><b>Est</b></label></td>" +
				"<td><label>MMR (V06.4)</label></td>" +
				"<td><label>90707</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>< 1 y</label></td>" +
				"<td><label>99381</label></td>" +
				"<td><label>99391</label></td>" +
				"<td><span>Varicella (V05.4)</span></td>" +
				"<td><span>90716</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>1-4 y</label></td><td><label>99382</label></td> " +
				"<td><label>99392</label></td>" +
				"<td><label>DtaP, <7 y (V06.1)</label></td>" +
				"<td><label>90700</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>5-11 y</label></td>" +
				"<td><label>99383</label></td>" +
				"<td><label>99393</label></td>" +
				"<td><label>TD, <7 y (V06.5)</label></td>" +
				"<td> <label>90702</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>12-17 y</label></td>" +
				"<td><label>99384</label></td>" +
				"<td><label>99394</label></td>" +
				"<td><span>Hep A, ped/adol, 2 dose (V05.3)</span></td>" +
				"<td><span>90633</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>18-39 y</label></td>" +
				"<td><label>99385</label></td>" +
				"<td> <label>99395</label></td>" +
				"<td><span>Kinrix</span></td>" +
				"<td><span>90696</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Tobacco counseling/3-10 min</label></td>" +
				"<td><label>G0436</label></td>" +
				"<td>&nbsp;</td>" +
				"<td><label>Meningococcal</label><label class='float-right mr-5'>V01.84</label></td>" +
				"<td><span>90734</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Tobacco counseling/>10 min</label></td> " +
				"<td><label>G0437</label></td>" +
				"<td>&nbsp;</td>" +
				"<td><span>Tdap, 7 y + (V06.1)</span></td>" +
				"<td><span>90715</span></td> " +
				"</tr>" +
				"<tr>" +


				"<td colspan='2' class='superBillrowHeader'><label><b>Other services</b></label></td>" +
				"<td class='superBillrowHeader'>&nbsp;</td>" +
				"<td><span>HPV, quadrivalent (V04.89)</span></td>" +
				"<td><span>90651 </span></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Urgent Care</label></td>" +
				"<td><label>99050</label></td>" +
				"<td><label>IPV (V04.0)</label></td><td> <label>90713</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>weekend appointment</label></td>" +
				"<td> <label>99051</label></td> " +
				"<td>Adult Td &gt;7 yr</td>" +
				"<td>&nbsp;</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>BMI Documented</td> " +
				"<td>3008F</td>" +
				"<td><sImmun Admin One Vac</span>Immun Admin One Vac</td>" +
				"<td><span>90471</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><span>TB, intradermal</span></td>" +
				"<td>86580</td>" +
				"<td><span>Immun Admin Ea Add&#39;tl</span></td>" +
				"<td> <span>90472</span></td>" +
				"</tr>" +
				"<tr> " +
				"<td colspan='2' class='superBillrowHeader'><label> <b>Screenings</label></td>" +
				"<td class='superBillrowHeader'>&nbsp;</td>" +
				"<td>Trumenba Vaccine</td>" +
				"<td>90621</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Hearing Pure Tone</label></td>" +
				"<td><label>92552</label></td>" +
				"<td><span>Flu, preservative-free, 6-35 months (V04.81)</span> </td>" +
				"<td><span>90655</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Vision Screening</label></td> " +
				"<td class='style1'><label>99173</label></td>" +
				"<td><span>Flu, preservative-free, 3 y + (V04.81)</span></td>" +
				"<td> <span>90656</span></td>" +
				"</tr>" +
				"<tr> " +
				"<td colspan='2' class='superBillrowHeader'><label><b>Waived Lab</b> </label></td>" +
				"<td class='superBillrowHeader'>&nbsp;</td> " +
				"<td><span>Flu, quadrivalent, live, intranasal (V04.81)</span></td>" +
				"<td> <span>90672</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>Pregnancy Test</td>" +
				"<td>81025</td>" +
				"<td><span>Flu, inactivated, subunit, adjuvanted, IM (V04.81)</span></td>" +
				"<td><span>90653</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>Rapid Strep </td> " +
				"<td>87880</td><td><span><label>Bexero</label></span></td>" +
				"<td><span><label>90620</label></span></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>Urine Dipstick </td> " +
				"<td>81002</td><td><label>Proquad</label></td>" +
				"<td>90710</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>Urine Automated</td> " +
				"<td>81003</td><" +
				"td><label>Quadracel</label></td>" +
				"<td><label>90696</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>Rapid Flu</td>" +
				"<td>87502</td>" +
				"<td><label>Flulaval Quadrivalent&nbsp; &gt;6 months</label></td>" +
				"<td><label>90686</label></td>" +
				"</tr>" +

				"<tr> " +
				"<td colspan='2' class='superBillrowHeader'><label><b>Office procedures</b></label></td>" +
				"<td class='superBillrowHeader'>&nbsp;</td> " +
				"<td class='superBillrowHeader'> <label><b>Consultation/preop clearance</b></label></td> " +
				"<td class='superBillrowHeader'><label><b>All insurance Except MCR</b></label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Nebulizer</label></td>" +
				"<td><label>94640</label></td>" +
				"<td>Problem focused  </td><td>99241</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'> <label>Lab Handling</label></td>" +
				"<td><label>99000</label></td>" +
				"<td>Expanded problem focused</td>" +
				"<td>99242</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Ear Irrigation</label></td>" +
				"<td><label>69210</label></td>" +
				"<td>Detailed  </td>" +
				"<td>99243</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'> Hemoglobin</td> " +
				"<td> 85018</td>" +
				"<td>Comprehensive/mod complex  </td>" +
				"<td>99244</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>  Lead Screening</td><td>83655</td> " +
				"<td class='style1'> Comprehensive/high complex</td>" +
				"<td class='style1'>99245</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>Fluoride</td><td>D1208</td>" +
				"<td>Trans care mgmt/mod complex  </td>" +
				"<td>99495</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'> Silver nitrate cautery</td>" +
				"<td>17250</td>" +
				"<td>Trans care mgmt/high complex  </td>" +
				"<td>99496</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>EKG</td>" +
				"<td>93000</td>" +
				"<td class='superBillrowHeader'> <label><b>Supplies</b></label></td>" +
				"<td class='superBillrowHeader' ></td>" +
				"</tr>" +
				"<tr> " +
				"<td colspan='2'> &nbsp;</td>" +
				"<td>&nbsp;</td>" +
				"<td> <label>Albuterol</label></td>" +
				"<td> <label>J7618</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>&nbsp;</td>" +
				"<td> &nbsp;</td><td>Suture removal tray</td>" +
				"<td>A4550</td>" +
				"</tr>" +
				"</table>" +
				"</td>" +
				"</tr>" +
				"<tr>" +
				"<td> ";
				*/
			this.showReport(this.strHTMLSuperBillHeader + this.strHTMLpediatricroutecodes + this.strHTMLClaimDiagnos + this.strHTMLCommentsPort);
		}
		else if (this.DropDownValue.toString().toLowerCase() == "internal med code") {
			//" <style type='text/css'>.tabletest{border-collapse: collapse;  font-size: 9px; font-family: Verdana;} .tabletest, .tabletest td, .tabletest th{border: 1px solid black;}</style> " +
			this.strHTMLinternalmedcode =
				`<table class='tabletestwoBorder'>
					<tr>
						<td>
							<table class='tabletest super_bill'>
								<tr class='superBillrowHeader'>
									<td class='text-center' style='width: 20%;'>
										<label>
											<b>Office visit</b>
										</label>
									</td>
									<td class='text-center' style='width: 4%; '>
										<label>
											<b>New</b>
										</label>
									</td>
									<td class='text-center' style='width: 4%; '>
										<label>
											<b>Est</b>
										</label>
									</td>
									<td class='text-center' style='width: 20%;'>
										<label>
											<b>Well visit</b>
										</label>
									</td>
									<td class='text-center' style='width: 4%; '>
										<label>
											<b>New</b>
										</label>
									</td>
									<td class='text-center' style='width: 4%; '>
										<label>
											<b>Est</b>
										</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Level I - Minimal</label>
										<label class='float-right mr-5'>05/10 min</label>
									</td>
									<td>
										<label>99201</label>
									</td>
									<td>
										<label>99211</label>
									</td>
									<td>
										<label>18-39 y</label>
									</td>
									<td>
										<label>99385</label>
									</td>
									<td>
										<label>99395</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Level II - Low</label>
										<label class='float-right mr-5'>10/20 min</label>
									</td>
									<td>
										<label>99202</label>
									</td>
									<td>
										<label>99212</label>
									</td>
									<td>
										<label>40-64 y</label>
									</td>
									<td>
										<label>99386</label>
									</td>
									<td>
										<label>99396</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Level III - Detailed</label>
										<label class='float-right mr-5'>30/15 min</label>
									</td>
									<td>
										<label>99203</label>
									</td>
									<td>
										<label>99213</label>
									</td>
									<td>
										<label>65 y +</label>
									</td>
									<td>
										<label>99387</label>
									</td>
									<td>
										<label>99397</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Level IV - Comprehensive</label>
										<label class='float-right mr-5'>25/40 min</label>
									</td>
									<td>
										<label>99204</label>
									</td>
									<td>
										<label>99214</label>
									</td>
									<td colspan='2' class='superBillrowHeader text-center'>
										<label>
											<b>Consultation/preop clearance</b>
										</label>
									</td>
									<td class='superBillrowHeader text-center'>
										<label>
											<b>All insurance Except MCR</b>
										</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Level V - High Complex</label>
										<label class='float-right mr-5'>40/60 min</label>
									</td>
									<td>
										<label>99205</label>
									</td>
									<td>
										<label>99215</label>
									</td>
									<td colspan='2'>
										<label>Problem focused</label>
									</td>
									<td>
										<label>99241</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>
											<b>Significant, Separate Service</b>
										</label>
									</td>
									<td>
										<label>
											<b>-25 </b>
										</label>
									</td>
									<td>
										<label>
											<b>-25 </b>
										</label>
									</td>
									<td colspan='2'>
										<label>Expanded problem focused</label>
									</td>
									<td>
										<label>99242</label>
									</td>
								</tr>
								<tr>
									<td class='superBillrowHeader text-center'>
										<label>
											<b>Injections/Immunizations</b>
										</label>
									</td>
									<td class='superBillrowHeader text-center'>
										<label>
											<b>Dx</b>
										</label>
									</td>
									<td class='superBillrowHeader text-center'>
										<label>
											<b>Code</b>
										</label>
									</td>
									<td colspan='2'>
										<label>Detailed</label>
									</td>
									<td>
										<label>99243</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Hepatitis B(>18 Yrs)</label>
									</td>
									<td>
										<label>V05.31</label>
									</td>
									<td>
										<label>90746</label>
									</td>
									<td colspan='2'>
										<label>Comprehensive/mod complex</label>
									</td>
									<td>
										<label>99244</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>MMR</label>
									</td>
									<td>
										<label>V06.4</label>
									</td>
									<td>
										<label>90707</label>
									</td>
									<td colspan='2'>
										<label>Comprehensive/high complex</label>
									</td>
									<td>
										<label>99245</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Varicella</label>
									</td>
									<td>
										<label>V05.4</label>
									</td>
									<td>
										<label>90716</label>
									</td>
									<td colspan='2'>
										<label>Trans care mgmt/mod complex</label>
									</td>
									<td>
										<label>99495</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Influenza 3Years+</label>
									</td>
									<td>
										<label>V04.81</label>
									</td>
									<td>
										<label>90658</label>
									</td>
									<td colspan='2'>
										<label>Trans care mgmt/high complex</label>
									</td>
									<td>
										<label>99496</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>HEPA(18+)</label>
									</td>
									<td>
										<label>V05.3</label>
									</td>
									<td>
										<label>90632</label>
									</td>
									<td colspan='2' class='superBillrowHeader text-center'>
										<label>
											<b>Office procedures</b>
										</label>
									</td>
									<td class='superBillrowHeader'/>
								</tr>
								<tr>
									<td>
										<label>Pneumovac (Pneumococcal)</label>
									</td>
									<td>
										<label>v03.82</label>
									</td>
									<td>
										<label>90732</label>
									</td>
									<td colspan='2'>Silver nitrate cautery</td>
									<td>17250 </td>
								</tr>
								<tr>
									<td>
										<label>PPD Test</label>
									</td>
									<td>
										<label>V74.1</label>
									</td>
									<td>
										<label>86580</label>
									</td>
									<td colspan='2'>
										<label>Nebulizer</label>
									</td>
									<td>
										<label>94640</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>TD(Adult Use)</label>
									</td>
									<td>
										<label>V06.5</label>
									</td>
									<td>
										<label>90714</label>
									</td>
									<td colspan='2'>
										<label>Lab Handling</label>
									</td>
									<td>
										<label>99000</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Injection Administer Single</label>
									</td>
									<td>
										<label/>
									</td>
									<td>
										<label>90471</label>
									</td>
									<td colspan='2'>
										<label>Ear Irrigation</label>
									</td>
									<td>
										<label>69210</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Injection Administer (>2)</label>
									</td>
									<td>
										<label/>
									</td>
									<td>
										<label>90472</label>
									</td>
									<td colspan='2'>
										<label>Foreign body, skin, simple</label>
									</td>
									<td>
										<label>10120</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Injection Antibiotic</label>
									</td>
									<td>
										<label/>
									</td>
									<td>
										<label>96372</label>
									</td>
									<td colspan='2'>
										<label>Foreign body, skin, complex</label>
									</td>
									<td>
										<label>10121</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Injection Therapeutic</label>
									</td>
									<td>
										<label/>
									</td>
									<td>
										<label>90772</label>
									</td>
									<td colspan='2'>
										<label>I&D, abscess</label>
									</td>
									<td>
										<label>10060</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Tdap</label>
									</td>
									<td>
										<label/>
									</td>
									<td>
										<label>90715</label>
									</td>
									<td colspan='2'>Hemoglobin</td>
									<td>85018</td>
								</tr>
								<tr>
									<td>
										<label>Botox</label>
									</td>
									<td/>
									<td/>
									<td colspan='2'>Fluoride</td>
									<td>D1208</td>
								</tr>
								<tr>
									<td>
										<label>Kenalog</label>
									</td>
									<td/>
									<td/>
									<td colspan='2'>
										<label>Removal/Foreign Body</label>
									</td>
									<td>&nbsp;</td>
								</tr>
								<tr>
									<td>
										<label>Median nerve block</label>
									</td>
									<td/>
									<td/>
									<td colspan='2'>
										<label>Location</label>
									</td>
									<td>&nbsp;</td>
								</tr>
								<tr>
									<td>b12 </td>
									<td/>
									<td/>
									<td colspan='2' class='superBillrowHeader text-center'>
										<label>
											<b>Laboratory</b>
										</label>
									</td>
									<td class='superBillrowHeader'>&nbsp;</td>
								</tr>
								<tr>
									<td>rocepehin </td>
									<td/>
									<td>&nbsp;</td>
									<td colspan='2'>
										<label>One Touch-Blood Glucose</label>
									</td>
									<td>
										<label>82962</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Bexero</label>
									</td>
									<td>&nbsp;</td>
									<td>
										<label>90620</label>
									</td>
									<td colspan='2'>
										<label>Pregnancy Test - Urine</label>
									</td>
									<td>
										<label>81025</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Quadracel</label>
									</td>
									<td>&nbsp;</td>
									<td>
										<label>90696</label>
									</td>
									<td colspan='2'>
										<label>Rapid Strep Test</label>
									</td>
									<td>
										<label>87880</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Proquad</label>
									</td>
									<td>&nbsp;</td>
									<td>
										<label>90710</label>
									</td>
									<td colspan='2'>
										<label>Pulse Oximetry</label>
									</td>
									<td>
										<label>94760</label>
									</td>
								</tr>
								<tr>
									<td>
										<label>Flulaval Quadrivalent >6 months</label>
									</td>
									<td>&nbsp;</td>
									<td>
										<label>90686</label>
									</td>
									<td colspan='2'>
										<label>Urinalysis</label>
									</td>
									<td>
										<label>81002</label>
									</td>
								</tr>
								<tr>
									<td class='superBillrowHeader text-center' colspan='2'>
										<label>
											<b>Medicare preventive services</b>
										</label>
									</td>
									<td class='superBillrowHeader'>&nbsp;</td>
									<td colspan='2'>Urine Automated</td>
									<td>81003</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Papsmear speciman collection MCR only</label>
									</td>
									<td>
										<label>Q0091</label>
									</td>
									<td colspan='2'>
										<label>Wet Prep</label>
									</td>
									<td>
										<label>87210</label>
									</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Pelvic & breast</label>
									</td>
									<td>
										<label>G0101</label>
									</td>
									<td colspan='2'>
										<label>Lab Handling>1</label>
									</td>
									<td>
										<label>99000</label>
									</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Tobacco counseling/3-10 min</label>
									</td>
									<td>
										<label>G0436</label>
									</td>
									<td colspan='2'>
										<label>Single Venipuncture</label>
									</td>
									<td>
										<label>36415</label>
									</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Tobacco counseling/>10 min</label>
									</td>
									<td>
										<label>G0437</label>
									</td>
									<td colspan='2'>Rapid Flu</td>
									<td>87502</td>
								</tr>
								<tr>
									<td class='superBillrowHeader text-center' colspan='2'>
										<label>
											<b>Other services</b>
										</label>
									</td>
									<td class='superBillrowHeader'>&nbsp;</td>
									<td colspan='2'>EKG</td>
									<td>93000</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Urgent Care</label>
									</td>
									<td>
										<label>99050</label>
									</td>
									<td colspan='2' class='superBillrowHeader text-center'>
										<label>
											<b>Covid-19</b>
										</label>
									</td>
									<td class='superBillrowHeader'/>
								</tr>
								<tr>
									<td colspan='2'>
										<label>weekend appointment</label>
									</td>
									<td>
										<label>99051</label>
									</td>
									<td colspan='2'>COVID-19 Vaccine Pfizer</td>
									<td>91300</td>
								</tr>
								<tr>
									<td colspan='2'>
										<label>Brief emotional/behavioral assessment</label>
									</td>
									<td>
										<label>96127</label>
									</td>
									<td colspan='2'>COVID-19 Vaccine Moderna</td>
									<td>91301</td>
								</tr>
								<tr>
									<td colspan='2'>
										14 Panel Drug Test
									</td>
									<td>
										80305
									</td>
									<td colspan='2'>COVID-19 Test</td>
									<td>&nbsp;</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>`
			/*
			" <table class='tabletest super_bill' >" +
			"<tr class='superBillrowHeader'>" +
			"<td class='text-center' style='width: 20%;'><label><b>Office visit</b></label></td>" +
			"<td class='text-center' style='width: 4%; '><label><b>New</b></label></td>" +
			"<td class='text-center' style='width: 4%; '><label><b>Est</b></label></td>" +
			"<td class='text-center' style='width: 20%;'><label><b>Well visit</b></label></td>" +
			"<td class='text-center' style='width: 4%; '><label><b>New</b></label></td>" +
			"<td class='text-center' style='width: 4%; '><label><b>Est</b></label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Level I - Minimal</label><label class='float-right mr-5' >05/10 min</label></td>" +
			"<td><label>99201</label></td> " +
			"<td><label>99211</label></td>" +
			"<td><label>18-39 y</label></td>" +
			"<td><label>99385</label></td>" +
			"<td><label>99395</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Level II - Low</label><label class='float-right mr-5'>10/20 min</label></td>" +
			"<td><label>99202</label></td>" +
			"<td><label>99212</label></td>" +
			"<td><label>40-64 y</label></td>" +
			"<td><label>99386</label></td>" +
			"<td><label>99396</label></td>" +
			"</tr> " +
			"<tr>" +
			"<td><label>Level III - Detailed</label><label class='float-right mr-5'>30/15 min</label></td>" +
			"<td><label>99203</label></td>" +
			"<td><label>99213</label></td>" +
			"<td><label>65 y +</label></td>" +
			"<td><label>99387</label></td>" +
			"<td><label>99397</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Level IV - Comprehensive</label><label class='float-right mr-5'>25/40 min</label></td>" +
			"<td><label>99204</label></td><td><label>99214</label></td>" +
			"<td colspan='2' class='superBillrowHeader text-center' ><label><b>Consultation/preop clearance</b></label> </td>" +
			"<td class='superBillrowHeader text-center'><label><b>All insurance Except MCR</b></label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Level V - High Complex</label><label class='float-right mr-5'>40/60 min</label></td>" +
			"<td><label>99205</label></td>" +
			"<td><label>99215</label></td>" +
			"<td colspan='2'><label>Problem focused</label></td>" +
			"<td><label>99241</label></td> " +
			"</tr>" +
			"<tr>" +
			"<td><label><b>Significant, Separate Service</b></label></td>" +
			"<td><label><b>-25 </b></label></td>" +
			"<td><label><b>-25 </b></label></td>" +
			"<td colspan='2'><label>Expanded problem focused</label></td>" +
			"<td><label>99242</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td class='superBillrowHeader text-center'><label><b>Injections/Immunizations</b></label></td> " +
			"<td class='superBillrowHeader text-center'><label><b>Dx</b></label></td>" +
			"<td class='superBillrowHeader text-center'><label> " +
			"<b>Code</b></label></td><td colspan='2'><label>Detailed</label></td>" +
			"<td><label>99243</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Hepatitis B(>18 Yrs)</label></td><td><label>V05.31</label></td>" +
			"<td><label>90746</label></td>" +
			"<td colspan='2'><label>Comprehensive/mod complex</label></td>" +
			"<td><label>99244</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>MMR</label></td>" +
			"<td><label>V06.4</label></td>" +
			"<td><label>90707</label></td>" +
			"<td colspan='2'><label>Comprehensive/high complex</label></td>" +
			"<td><label>99245</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Varicella</label></td>" +
			"<td><label>V05.4</label></td>" +
			"<td><label>90716</label></td>" +
			"<td colspan='2'><label>Trans care mgmt/mod complex</label></td>" +
			"<td><label>99495</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Influenza 3Years+</label></td>" +
			"<td><label>V04.81</label></td>" +
			"<td><label>90658</label></td>" +
			"<td colspan='2'><label>Trans care mgmt/high complex</label></td>" +
			"<td><label>99496</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>HEPA(18+)</label></td>" +
			"<td><label>V05.3</label></td>" +
			"<td><label>90632</label></td>" +
			"<td colspan='2' class='superBillrowHeader text-center'><label><b>Office procedures</b></label></td>" +
			"<td class='superBillrowHeader'></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Pneumovac (Pneumococcal)</label></td>" +
			"<td><label>v03.82</label></td>" +
			"<td><label>90732</label></td><td colspan='2'>Silver nitrate cautery</td>" +
			"<td>17250 </td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>PPD Test</label></td>" +
			"<td><label>V74.1</label> </td>" +
			"<td><label>86580</label></td>" +
			"<td colspan='2'><label>Nebulizer</label></td>" +
			"<td><label>94640</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>TD(Adult Use)</label></td>" +
			"<td><label>V06.5</label></td>" +
			"<td><label>90714</label></td> " +
			"<td colspan='2'><label>Lab Handling</label></td>" +
			"<td><label>99000</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Injection Administer Single</label></td>" +
			"<td><label></label></td>" +
			"<td><label>90471</label></td>" +
			"<td colspan='2'><label>Ear Irrigation</label></td>" +
			"<td><label>69210</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Injection Administer (>2)</label></td><td><label></label> </td>" +
			"<td><label>90472</label></td>" +
			"<td colspan='2'><label>Foreign body, skin, simple</label></td>" +
			"<td><label>10120</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Injection Antibiotic</label></td>" +
			"<td> <label></label></td>" +
			"<td><label>96372</label></td>" +
			"<td colspan='2'><label>Foreign body, skin, complex</label></td>" +
			"<td><label>10121</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Injection Therapeutic</label></td>" +
			"<td><label></label></td>" +
			"<td><label>90772</label></td>" +
			"<td colspan='2'><label>I&D, abscess</label></td>" +
			"<td><label>10060</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Tdap</label></td>" +
			"<td><label></label></td>" +
			"<td><label>90715</label></td>" +
			"<td colspan='2'>Hemoglobin</td>" +
			"<td>85018</td></tr>" +
			"<tr>" +
			"<td><label>Botox</label></td> " +
			"<td></td>" +
			"<td></td>" +
			"<td colspan='2'>Fluoride</td>" +
			"<td>D1208</td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Kenalog</label></td>" +
			"<td></td>" +
			"<td></td>" +
			"<td colspan='2'><label>Removal/Foreign Body</label></td>" +
			"<td>&nbsp;</td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Median nerve block</label></td>" +
			"<td></td>" +
			"<td></td>" +
			"<td colspan='2'><label>Location</label></td>" +
			"<td>&nbsp;</td>" +
			"</tr>" +
			"<tr>" +
			"<td>b12 </td>" +
			"<td></td>" +
			"<td></td> " +
			"<td colspan='2' class='superBillrowHeader text-center'><label><b>Laboratory</b></label></td>" +
			"<td class='superBillrowHeader'>&nbsp;</td>" +
			"</tr>" +
			"<tr>" +
			"<td>rocepehin </td>" +
			"<td></td>" +
			"<td>&nbsp;</td>" +
			"<td colspan='2'><label>One Touch-Blood Glucose</label></td>" +
			"<td><label>82962</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td> <label>Bexero</label></td>" +
			"<td>&nbsp;</td>" +
			"<td><label>90620</label></td>" +
			"<td colspan='2'><label>Pregnancy Test - Urine</label></td>" +
			"<td><label>81025</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Quadracel</label></td>" +
			"<td>&nbsp;</td>" +
			"<td><label>90696</label></td>" +
			"<td colspan='2'><label>Rapid Strep Test</label></td>" +
			"<td><label>87880</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Proquad</label></td>" +
			"<td>&nbsp;</td>" +
			"<td><label>90710</label></td>" +
			"<td colspan='2'><label>Pulse Oximetry</label></td>" +
			"<td><label>94760</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Flulaval Quadrivalent >6 months</label></td>" +
			"<td>&nbsp;</td>" +
			"<td><label>90686</label></td>" +
			"<td colspan='2'><label>Urinalysis</label></td>" +
			"<td><label>81002</label></td>" +
			"</tr>" +
			"<tr> " +
			"<td class='superBillrowHeader text-center' colspan='2'><label><b>Other services</b></label></td>" +
			"<td class='superBillrowHeader'>&nbsp;</td>" +
			"<td colspan='2'>Urine Automated</td><td>81003</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'><label>Urgent Care</label></td>" +
			"<td><label>99050</label></td> " +
			"<td colspan='2'><label>Wet Prep</label></td>" +
			"<td><label>87210</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'><label>weekend appointment</label></td>" +
			"<td><label>99051</label></td> " +
			"<td colspan='2'><label>Lab Handling>1</label></td>" +
			"<td><label>99000</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td class='superBillrowHeader text-center' colspan='2'><label><b>Medicare preventive services</b></label></td>" +
			"<td class='superBillrowHeader'>&nbsp;</td><td colspan='2'> <label>Single Venipuncture</label></td>" +
			"<td><label>36415</label></td>" +
			"</tr>" +
			"<tr>" +
			"	<td colspan='2'><label>Papsmear speciman collection MCR only</label></td>" +
			"	<td><label>Q0091</label></td>" +
			"	<td colspan='2'>Rapid Flu</td>" +
			"	<td>87502</td>" +
			"</tr>" +

			"<tr>" +
			"	<td colspan='2'><label>Pelvic & breast</label></td>" +
			"	<td><label>G0101</label></td>" +
			"	<td colspan='2'>EKG</td>" +
			"	<td>93000</td>" +
			"</tr>" +
			"<tr>" +
			"	<td colspan='2'><label>Tobacco counseling/3-10 min</label></td>" +
			"	<td><label>G0436</label></td>" +
			"	<td colspan='2' class='superBillrowHeader text-center'><label><b>Covid-19</b></label></td>" +
			"	<td class='superBillrowHeader'></td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'><label>Tobacco counseling/>10 min</label></td>" +
			"<td><label>G0437</label></td>" +
			"<td colspan='2'>COVID-19 Vaccine Pfizer</td>" +
			"<td>91300</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'></td>" +
			"<td></td> " +
			"<td colspan='2'>COVID-19 Vaccine Moderna</td>" +
			"<td>91301</td>" +
			"</tr>" +
			"</table> " +
			
			+" </td></tr><tr><td>";
			*/
			this.showReport(this.strHTMLSuperBillHeader + this.strHTMLinternalmedcode + this.strHTMLClaimDiagnos + this.strHTMLCommentsPort)

		}
		else if (this.DropDownValue.toString().toLowerCase() == "midwife route") {
			//" <style type='text/css'>.tabletest{border-collapse: collapse; font-size: 9px; font-family: Verdana;} .tablewrite tr, .tblvitals tr{height:20px;}.tblvitals{border:1px solid black;border-bottom:0;border-collapse: collapse;height:20px;}.tblvitals td{border-left:1px solid black;} " +
			//" .tabletest, .tabletest td, .tabletest th{border: 1px solid black;}</style> " +
			this.strHTMLmidwiferoute = `
			<table class='tabletestwoBorder'>
				<tr>
					<td>
						<table class='tabletest super_bill'>
							<tr class='superBillrowHeader'>
								<td>
									<label>
										<b>Office visit</b>
									</label>
								</td>
								<td>
									<label>New</label>
								</td>
								<td>
									<label>Est</label>
								</td>
								<td class='text-center'>
									<label>
										<b>Female GYN Exam</b>
									</label>
								</td>
								<td>
									<label>New</label>
								</td>
								<td>
									<label>Est</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level I - Minimal</label>
									<label class='float-right mr-5'>05/10 min</label>
								</td>
								<td>
									<label>99201</label>
								</td>
								<td>
									<label>99211</label>
								</td>
								<td>
									<label>12-17 y</label>
								</td>
								<td>
									<label>99384</label>
								</td>
								<td>
									<label>99394</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level II - Low</label>
									<label class='float-right mr-5'>10/20 min</label>
								</td>
								<td>
									<label>99202</label>
								</td>
								<td>
									<label>99212</label>
								</td>
								<td>
									<label>18-39 y</label>
								</td>
								<td>
									<label>99385</label>
								</td>
								<td>
									<label>99395</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level III - Detailed</label>
									<label class='float-right mr-5'>30/15 min</label>
								</td>
								<td>
									<label>99203</label>
								</td>
								<td>
									<label>99213</label>
								</td>
								<td>
									<label>40-64 y *** <b>(For MCD bill OV)</b>
									</label>
								</td>
								<td>
									<label>99386</label>
								</td>
								<td>
									<label>99396</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level IV - Comprehensive</label>
									<label class='float-right mr-5'>25/40min</label>
								</td>
								<td>
									<label>99204</label>
								</td>
								<td>
									<label>99214</label>
								</td>
								<td colspan='2' class='superBillrowHeader text-center'>
									<label>
										<b>INJECTIONS/MEDICATIONS</b>
									</label>
								</td>
								<td class='superBillrowHeader'>&nbsp;</td>
							</tr>
							<tr>
								<td>
									<label>Level V - High Complex</label>
									<label class='float-right mr-5'>40/60min</label>
								</td>
								<td>
									<label>99205</label>
								</td>
								<td>
									<label>99215</label>
								</td>
								<td colspan='2'>
									<label>Depo Provera - Office Dep</label>
								</td>
								<td>
									<label>J1050</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>
										<b>Significant, Separate Service</b>
									</label>
								</td>
								<td>
									<label>
										<b>-25 </b>
									</label>
								</td>
								<td>
									<label>
										<b>-25 </b>
									</label>
								</td>
								<td colspan='2'>
									<label>Depo Pharmacy</label>
								</td>
								<td>&nbsp;</td>
							</tr>
							<tr>
								<td class='superBillrowHeader text-center'>
									<label>
										<b>OB Services</b>
									</label>
								</td>
								<td class='superBillrowHeader '>
									<label>New</label>
								</td>
								<td class='superBillrowHeader '>
									<label> Est</label>
								</td>
								<td colspan='2'>
									<label>TDAP></label>
								</td>
								<td>
									<label>90715</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>New OB</label>
								</td>
								<td>
									<label>99204</label>
								</td>
								<td>
									<label>99214</label>
								</td>
								<td colspan='2'>
									<label>Varicella</label>
								</td>
								<td>
									<label>90716</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Return OB</label>
								</td>
								<td>
									<label>NC</label>
								</td>
								<td>
									<label>NC</label>
								</td>
								<td colspan='2'>
									<label>MMR</label>
								</td>
								<td>
									<label>90707</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Post Partum If oth DX please use E&M</label>
								</td>
								<td>
									<label>NC</label>
								</td>
								<td>
									<label>NC</label>
								</td>
								<td colspan='2'>
									<label>HPV</label>
								</td>
								<td>
									<label>90651</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Fetal Non Stress Test</label>
								</td>
								<td>&nbsp;</td>
								<td>
									<label>59025</label>
								</td>
								<td colspan='2'>
									<label>TD</label>
								</td>
								<td>
									<label>90714</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Non-global postpartum</label>
								</td>
								<td/>
								<td>59430</td>
								<td colspan='2'>
									<label>Flu Vaccine</label>
								</td>
								<td>
									<label>90658</label>
								</td>
							</tr>
							<tr>
								<td class='superBillrowHeader text-center' colspan='2'>
									<label>
										<b>Medicare GYN Exam</b>
									</label>
								</td>
								<td class='superBillrowHeader '>&nbsp;</td>
								<td colspan='2'>
									<label>Hepatitis B</label>
								</td>
								<td>
									<label>90746</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Papsmear speciman collection MCR only</label>
								</td>
								<td>
									<label>Q0091</label>
								</td>
								<td colspan='2'>
									<label>Polio</label>
								</td>
								<td>90713</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Wet Mount</label>
								</td>
								<td>
									<label>Q0111</label>
								</td>
								<td colspan='2'>
									<span>Injection Administer Single</span>
								</td>
								<td>
									<span>90471</span>
								</td>
							</tr>
							<tr>
								<td colspan='2'>Pelvic & breast</td>
								<td>G0101</td>
								<td colspan='2'>
									<span>Injection Administer (&gt;2)</span>
								</td>
								<td>
									<span>90472</span>
								</td>
							</tr>
							<tr>
								<td class='superBillrowHeader text-center' colspan='2'>
									<label>
										<b>Office procedures</b>
									</label>
								</td>
								<td class='superBillrowHeader'>&nbsp;</td>
								<td colspan='2'>Nexplanon</td>
								<td>J7307</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Lab Handling</label>
								</td>
								<td>
									<label>99000</label>
								</td>
								<td colspan='2'>Injection Therapeutic</td>
								<td>96372</td>
							</tr>
							<tr>
								<td colspan='2'>TB, intradermal</td>
								<td>86580</td>
								<td class='superBillrowHeader text-center' colspan='2'>
									<label>
										<b>Immunizations & Injections</b>
									</label>
								</td>
								<td class='superBillrowHeader '>
									<label>Units</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Tobacco counseling/3-10 min</label>
								</td>
								<td>
									<label>G0436</label>
								</td>
								<td colspan='2'>Makena Injection</td>
								<td>j1725</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Tobacco counseling/>10 min</label>
								</td>
								<td>
									<label>G0437</label>
								</td>
								<td colspan='2'>
									<label>b12 </label>
								</td>
								<td>
									<span/>
								</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Nebulizer</label>
								</td>
								<td>
									<label>94640</label>
								</td>
								<td colspan='2'>rocepehin </td>
								<td>
								</td>
							</tr>
							<tr>
								<td colspan='2' class='style1'>
									<label>Ear Irrigation</label>
								</td>
								<td class='style1'>
									<label>69210</label>
								</td>
								<td colspan='2'>
									<label>Bexero</label>
								</td>
								<td>
									<label>90620</label>
								</td>
							</tr>
							<tr>
								<td colspan='2' class='style1'>Hemoglobin</td>
								<td class='style1'>85018</td>
								<td colspan='2'>
									<label>Quadracel</label>
								</td>
								<td>
									<label>90696</label>
								</td>
							</tr>
							<tr>
								<td colspan='2' class='style1'>Fluoride</td>
								<td class='style1'>D1208</td>
								<td colspan='2'>
									<label>Proquad</label>
								</td>
								<td>
									<label>90710</label>
								</td>
							</tr>
							<tr>
								<td colspan='2' class='style1'>Silver nitrate cautery</td>
								<td class='style1'>17250 </td>
								<td colspan='2'>
									<label>Flulaval Quadrivalent >6 months</label>
								</td>
								<td>90686</td>
							</tr>
							<tr>
								<td colspan='2' class='style1'>Brief emotional/behavioral assessment</td>
								<td class='style1'>96127</td>
								<td colspan='2' class='superBillrowHeader text-center'>
									<label>
										<b>Laboratory</b>
									</label>
								</td>
								<td class='superBillrowHeader '>&nbsp;</td>
							</tr>
							<tr>
								<td colspan='2' class='superBillrowHeader text-center'>
									<label>
										<b>Contraceptive Procedures</b>
									</label>
								</td>
								<td class='superBillrowHeader '>&nbsp;</td>
								<td colspan='2'>
									<label>One Touch-Blood Glucose </label>
								</td>
								<td>
									<label>82962</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>IUD Removal</td>
								<td>58301</td>
								<td colspan='2'>Pregnancy Test - Urine  </td>
								<td>
									<label>81025</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Nexplanon Insertion</label>
								</td>
								<td>11981</td>
								<td colspan='2' class='style1'>Rapid Strep Test  </td>
								<td class='style1'>
									<label>87880</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Removal Implant</label>
								</td>
								<td>11982</td>
								<td colspan='2'>Pulse Oximetry </td>
								<td>
									<label>94760</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Implant Removal with Reinsertion</label>
								</td>
								<td>
									<label>11983</label>
								</td>
								<td colspan='2'>Urinalysis  </td>
								<td>
									<label>81002</label>
								</td>
							</tr>
							<tr>
								<td colspan='2' class='superBillrowHeader text-center'>
									<label>
										<b>Covid-19</b>
									</label>
								</td>
								<td class='superBillrowHeader '>&nbsp;</td>
								<td colspan='2'>Urine Automated</td>
								<td>81003</td>
							</tr>
							<tr>
								<td colspan='2'>COVID-19 Vaccine Pfizer</td>
								<td>91300</td>
								<td colspan='2'>Wet Prep</td>
								<td>87210</td>
							</tr>
							<tr>
								<td colspan='2'>COVID-19 Vaccine Moderna</td>
								<td>91301</td>
								<td colspan='2'>Lab Handling>1 </td>
								<td>99000</td>
							</tr>
							<tr>
								<td colspan='2'>COVID-19 Test</td>
								<td>&nbsp;</td>
								<td colspan='2'>Rapid Flu</td>
								<td>87502</td>
							</tr>
							<tr>
								<td colspan='3' rowspan='2' class='align-top'>
									<b>Comments:</b>
								</td>
								<td colspan='2'>EKG</td>
								<td>93000</td>
							</tr>
							
							<tr>
								<td colspan='2'>
									14 Panel Drug Test
								</td>
								<td>
									80305
								</td>							
							</tr>
						</table>
					</td>
				</tr>
			</table>
			`
			/*
				" <table class='tabletest super_bill'>" +
				"<tr class='superBillrowHeader'>" +
				"<td ><label><b>Office visit</b></label></td>" +
				"<td ><label>New</label></td>" +
				"<td ><label>Est</label></td>" +
				"<td class='text-center'><label><b>Female GYN Exam</b></label></td>" +
				"<td ><label>New</label></td>" +
				"<td ><label>Est</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Level I - Minimal</label><label class='float-right mr-5'>05/10 min</label></td>" +
				"<td><label>99201</label></td>" +
				"<td><label>99211</label></td>" +
				"<td><label>12-17 y</label></td>" +
				"<td><label>99384</label></td>" +
				"<td><label>99394</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Level II - Low</label><label class='float-right mr-5'>10/20 min</label></td>" +
				"<td><label>99202</label></td>" +
				"<td><label>99212</label></td>" +
				"<td><label>18-39 y</label></td>" +
				"<td><label>99385</label></td>" +
				"<td><label>99395</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td> <label>Level III - Detailed</label><label class='float-right mr-5'>30/15 min</label></td>" +
				"<td><label>99203</label></td>" +
				"<td><label>99213</label></td>" +
				"<td><label>40-64 y *** <b>(For MCD bill OV)</b></label></td>" +
				"<td><label>99386</label></td>" +
				"<td><label>99396</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Level IV - Comprehensive</label><label class='float-right mr-5'>25/40min</label></td>" +
				"<td><label>99204</label></td>" +
				"<td><label>99214</label></td>" +
				"<td colspan='2' class='superBillrowHeader text-center'><label><b>INJECTIONS/MEDICATIONS</b></label></td>" +
				"<td class='superBillrowHeader'>&nbsp;</td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Level V - High Complex</label><label class='float-right mr-5'>40/60min</label></td>" +
				"<td><label>99205</label></td>" +
				"<td><label>99215</label></td>" +
				"<td colspan='2'><label>Depo Provera - Office Dep</label></td>" +
				"<td><label>J1050</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label><b>Significant, Separate Service</b></label> </td>" +
				"<td><label><b>-25 </b></label></td>" +
				"<td><label><b>-25 </b></label></td>" +
				"<td colspan='2'><label>Depo Pharmacy</label></td><td>&nbsp;</td>" +
				"</tr>" +
				"<tr>" +
				"<td class='superBillrowHeader text-center'><label><b>OB Services</b></label></td>" +
				"<td class='superBillrowHeader '><label>New</label></td>" +
				"<td class='superBillrowHeader '><label> Est</label></td>" +
				"<td colspan='2'><label>TDAP></label></td>" +
				"<td><label>90715</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>New OB</label></td>" +
				"<td><label>99204</label></td>" +
				"<td><label>99214</label> </td>" +
				"<td colspan='2'><label>Varicella</label></td>" +
				"<td><label>90716</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Return OB</label></td>" +
				"<td><label>NC</label></td>" +
				"<td><label>NC</label></td> " +
				"<td colspan='2'><label>MMR</label></td>" +
				"<td><label>90707</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Post Partum If oth DX please use E&M</label></td>" +
				"<td><label>NC</label></td>" +
				"<td><label>NC</label></td>" +
				"<td colspan='2'><label>HPV</label></td>" +
				"<td><label>90651</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Fetal Non Stress Test</label></td>" +
				"<td>&nbsp;</td>" +
				"<td><label>59025</label></td>" +
				"<td colspan='2'><label>TD</label></td>" +
				"<td><label>90714</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td><label>Non-global postpartum</label></td>" +
				"<td></td>" +
				"<td>59430</td> " +
				"<td colspan='2'><label>Flu Vaccine</label></td>" +
				"<td><label>90658</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td class='superBillrowHeader text-center' colspan='2'><label><b>Medicare GYN Exam</b></label></td>" +
				"<td class='superBillrowHeader ' >&nbsp;</td><td colspan='2'><label>Hepatitis B</label></td> " +
				"<td><label>90746</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Papsmear speciman collection MCR only</label></td>" +
				"<td><label>Q0091</label></td>" +
				"<td colspan='2'><label>Polio</label></td>" +
				"<td>90713</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Wet Mount</label></td>" +
				"<td><label>Q0111</label></td>" +
				"<td colspan='2'><span>Injection Administer Single</span></td> " +
				"<td><span>90471</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>Pelvic & breast</td>" +
				"<td>G0101</td>" +
				"<td colspan='2'><span>Injection Administer (&gt;2)</span></td>" +
				"<td><span>90472</span></td>" +
				"</tr>" +
				"<tr>" +
				"<td class='superBillrowHeader text-center' colspan='2'><label><b>Office procedures</b></label></td>" +
				"<td class='superBillrowHeader'>&nbsp;</td>" +
				"<td colspan='2'>Nexplanon</td><td>J7307</td>" +
				"</tr>" +
				"<tr>" +
				"	<td colspan='2'><label>Lab Handling</label></td>" +
				"	<td><label>99000</label></td>" +
				"<td colspan='2'>Injection Therapeutic</td> " +
				"<td>96372</td></tr><tr><td colspan='2'>TB, intradermal</td>" +
				"<td>86580</td>" +
				"<td class='superBillrowHeader text-center' colspan='2'><label><b>Immunizations & Injections</b></label></td>" +
				"<td class='superBillrowHeader '><label>Units</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'> " +
				"<label>Tobacco counseling/3-10 min</label></td>" +
				"<td><label>G0436</label></td>" +
				"<td colspan='2'>Makena Injection</td>" +
				"<td>j1725</td></tr>" +
				"<tr>" +
				"<td colspan='2'><label>Tobacco counseling/>10 min</label></td> " +
				"<td><label>G0437</label></td>" +
				"<td colspan='2'><label>b12 </label></td>" +
				"<td><span></span></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Nebulizer</label></td>" +
				"<td><label>94640</label></td> " +
				"<td colspan='2'>rocepehin </td>" +
				"<td>" +
				"</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2' class='style1'><label>Ear Irrigation</label></td>" +
				"<td class='style1'><label>69210</label></td>" +
				"<td colspan='2'><label>Bexero</label></td>" +
				"<td><label>90620</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2' class='style1'>Hemoglobin</td>" +
				"<td class='style1'>85018</td><td colspan='2'> <label>Quadracel</label></td>" +
				"<td><label>90696</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2' class='style1'>Fluoride</td><td class='style1'>D1208</td>" +
				"<td colspan='2'><label>Proquad</label></td>" +
				"<td><label>90710</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2' class='style1'>Silver nitrate cautery</td>" +
				"<td class='style1'>17250 </td>" +
				"<td colspan='2'><label>Flulaval Quadrivalent >6 months</label></td>" +
				"<td>90686</td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2' class='style1'> &nbsp;</td>" +
				"<td class='style1'>&nbsp;</td>" +
				"<td colspan='2' class='superBillrowHeader text-center'><label><b>Laboratory</b></label></td>" +
				"<td class='superBillrowHeader '>&nbsp;</td>" +
				"</tr>" +
				"<tr> " +
				"<td colspan='2' class='superBillrowHeader text-center'><label><b>Contraceptive Procedures</b> </label></td><td style='background-color: #c0c0c0; border: 1px solid black;'>&nbsp;</td> " +
				"<td colspan='2'><label>One Touch-Blood Glucose </label> </td>" +
				"<td><label>82962</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'>IUD Removal</td>" +
				"<td>58301</td> " +
				"<td colspan='2'>Pregnancy Test - Urine  </td><td><label>81025</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Nexplanon Insertion</label></td>" +
				"<td>11981</td>" +
				"<td colspan='2' class='style1'>Rapid Strep Test  </td>" +
				"<td class='style1'> " +
				"<label>87880</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Removal Implant</label></td>" +
				"<td>11982</td>" +
				"<td colspan='2'>Pulse Oximetry </td>" +
				"<td><label>94760</label></td>" +
				"</tr>" +
				"<tr>" +
				"<td colspan='2'><label>Implant Removal with Reinsertion</label> </td>" +
				"<td><label>11983</label></td>" +
				"<td colspan='2'>Urinalysis  </td>" +
				"<td><label>81002</label></td>" +
				"</tr>" +


				"<tr><td colspan='2' class='superBillrowHeader text-center'><label><b>Covid-19</b></label></td>" +
				"<td class='superBillrowHeader '>&nbsp;</td>" +
				"<td colspan='2'>Urine Automated</td><td>81003</td></tr>" +
				"<tr><td colspan='2'>COVID-19 Vaccine Pfizer</td><td>91300</td><td colspan='2'>Wet Prep</td><td>87210</td></tr>" +
				"<tr><td colspan='2'>COVID-19 Vaccine Moderna</td><td>91301</td><td colspan='2'>Lab Handling>1 </td><td>99000</td></tr>" +

				"<tr>" +
				"	<td colspan='3' rowspan='2' class='align-top'><b>Comments:</b></td>" +
				"	<td colspan='2'>Rapid Flu</td><td>87502</td>" +
				"</tr>" +
				"<tr>" +
				"	<td colspan='2'>EKG</td><td>93000</td>" +
				"</tr>" +

				"</table> " +
				
				+" </td></tr><tr><td>";
				*/
			this.showReport(this.strHTMLSuperBillHeader + this.strHTMLmidwiferoute + this.strHTMLClaimDiagnos + this.strHTMLCommentsPort)
		}
		else if (this.DropDownValue.toString().toLowerCase() == "annual wellness route") {
			//<style type='text/css'>.tabletest{border-collapse: collapse; width: 100%; font-size: 9px; font-family: Verdana;}.tablewrite tr, .tblvitals tr{height:20px;}.tblvitals{border:1px solid black;border-bottom:0;border-collapse: collapse;height:20px;}.tblvitals td{border-left:1px solid black;} " +
			//	" .tabletest, .tabletest td, .tabletest th{border: 1px solid black;}</style> "
			this.strHTMLannualwellnessroute =
				`
			<table class='tabletestwoBorder'>
				<tr>
					<td>
						<table class='tabletest super_bill'>
							<tr class='superBillrowHeader'>
								<td class='text-center'>
									<label>
										<b>Office visit</b>
									</label>
								</td>
								<td class='text-center'>
									<label>
										<b>New</b>
									</label>
								</td>
								<td class='text-center'>
									<label>
										<b>Est</b>
									</label>
								</td>
								<td class='text-center'>
									<label>
										<b>For Medicare Annual Visit Not Billable</b>
									</label>
								</td>
								<td class='text-center'>&nbsp;</td>
							</tr>
							<tr>
								<td>
									<label>Level I - Minimal</label>
									<label class='float-right mr-5'>05/10 min</label>
								</td>
								<td>
									<label>99201</label>
								</td>
								<td>
									<label>99211</label>
								</td>
								<td>EKG Screening with Welcome to MCR</td>
								<td>G0403</td>
							</tr>
							<tr>
								<td>
									<label>Level II - Low</label>
									<label class='float-right mr-5'>10/20 min</label>
								</td>
								<td>
									<label>99202</label>
								</td>
								<td>
									<label>99212</label>
								</td>
								<td>Audiometry</td>
								<td>92551</td>
							</tr>
							<tr>
								<td>
									<label>Level III - Detailed</label>
									<label class='float-right mr-5'>30/15 min</label>
								</td>
								<td>
									<label>99203</label>
								</td>
								<td>
									<label>99213</label>
								</td>
								<td>
									<label>Pulse oximetry</label>
								</td>
								<td>
									<label>94760</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level IV - Comprehensive</label>
									<label class='float-right mr-5'>25/40 min</label>
								</td>
								<td>
									<label>99204</label>
								</td>
								<td>
									<label>99214</label>
								</td>
								<td>
									<label> Annual wellness visit, initial</label>
								</td>
								<td>
									<label>G0438</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>Level V - High Complex</label>
									<label class='float-right mr-5'>40/60min</label>
								</td>
								<td>
									<label>99205</label>
								</td>
								<td>
									<label>99215</label>
								</td>
								<td>
									<label> Annual wellness visit, subsequent</label>
								</td>
								<td>
									<label>G0439</label>
								</td>
							</tr>
							<tr>
								<td>
									<label>
										<b>Significant, Separate Service</b>
									</label>
								</td>
								<td>
									<label>
										<b>-25 </b>
									</label>
								</td>
								<td>
									<label>
										<b>-25</b>
									</label>
								</td>
								<td>
									<label>Welcome to Medicare exam </label>
								</td>
								<td>
									<label>G0402</label>
								</td>
							</tr>
							<tr>
								<td class='superBillrowHeader text-center' colspan='2'>
									<label>
										<b>Medicare flu vaccines</b>
									</label>
								</td>
								<td class='superBillrowHeader'>&nbsp;</td>
								<td>Vision Screening </td>
								<td>99173</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Afluria, 3 yrs and older (V04.81)</label>
								</td>
								<td>
									<label>Q2035</label>
								</td>
								<td class='superBillrowHeader text-center'>
									<label>
										<b>Diagnosis</b>
									</label>
								</td>
								<td class='superBillrowHeader'/>
							</tr>
							<tr>
								<td colspan='2'>
									<label>FluLaval, 3 yrs and older (V04.81</label>
								</td>
								<td>
									<label>Q2036</label>
								</td>
								<td>Physical </td>
								<td>V70.0</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Flyvirin, 3 yrs and older (V04.81)</label>
								</td>
								<td>
									<label>Q2037</label>
								</td>
								<td>Flu vaccination </td>
								<td>V04.81</td>
							</tr>
							<tr>
								<td colspan='2'>
									<label>Fluzone, 3 yrs and older (V04.81)</label>
								</td>
								<td>
									<label>Q2038</label>
								</td>
								<td>Rapid Flu</td>
								<td>87502</td>
							</tr>
							<tr>
								<td colspan='2' class='superBillrowHeader text-center'>
									<label>
										<b>Office procedures</b>
									</label>
								</td>
								<td class='superBillrowHeader'>&nbsp;</td>
								<td class='superBillrowHeader text-center'>
									<label>
										<b>Injections/Immunizations</b>
									</label>
								</td>
								<td class='superBillrowHeader '>&nbsp;</td>
							</tr>
							<tr>
								<td colspan='2'>Hemoglobin</td>
								<td>85018</td>
								<td>
									<label>Pneumovac > 2 yrs</label>
									<label class='float-right mr-5'>V03.82</label>
								</td>
								<td>90732</td>
							</tr>
							<tr>
								<td colspan='2'>Fluoride</td>
								<td>D1208</td>
								<td>Immun Admin One Vac  </td>
								<td>90471</td>
							</tr>
							<tr>
								<td colspan='2'>Silver nitrate cautery</td>
								<td>17250 </td>
								<td>Immun Admin Ea Add&#39;tl</td>
								<td>90472</td>
							</tr>
							<tr>
								<td colspan='2' class='superBillrowHeader text-center'>
									<label>
										<b>Covid-19</b>
									</label>
								</td>
								<td class='superBillrowHeader'/>
								<td>b12</td>
								<td>&nbsp;</td>
							</tr>
							<tr>
								<td colspan='2'>COVID-19 Vaccine Pfizer</td>
								<td>91300</td>
								<td>rocepehin</td>
								<td>&nbsp;</td>
							</tr>
							<tr>
								<td colspan='2'>COVID-19 Vaccine Moderna</td>
								<td>91301</td>
								<td>
									<label>Bexero</label>
								</td>
								<td>
									<label>90620</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>COVID-19 Test</td>
								<td>&nbsp;</td>
								<td>
									<label>Quadracel</label>
								</td>
								<td>
									<label>90696</label>
								</td>
							</tr>

							<tr>
								<td colspan='2' class='superBillrowHeader text-center'>
									<label>
										<b>Laboratory</b>
									</label>
								</td>
								<td class='superBillrowHeader'/>
								<td>
									<label>Proquad</label>
								</td>
								<td>
									<label>90710</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>EKG</td>
								<td>93000</td>
								<td>
									<label>Flulaval Quadrivalent >6 months</label>
								</td>
								<td>
									<label>90686</label>
								</td>
							</tr>
							<tr>
								<td colspan='2'>Brief emotional/behavioral assessment</td>
								<td>96127</td>
								<td>
									&nbsp;
								</td>
								<td>
									&nbsp;
								</td>
							</tr>
							<tr>
								<td colspan='2'>14 Panel Drug Test</td>
								<td>80305</td>
								<td>
									&nbsp;
								</td>
								<td>
									&nbsp;
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			`


			/*
			<table class='tabletestwoBorder'><tr><td>
			"<table class='tabletest super_bill' >" +
			"<tr class='superBillrowHeader'>" +
			"<td class='text-center'><label><b>Office visit</b></label></td>" +
			"<td class='text-center'><label><b>New</b></label></td>" +
			"<td class='text-center'><label><b>Est</b></label> </td>" +
			"<td class='text-center'><label><b>For Medicare Annual Visit Not Billable</b></label></td>" +
			"<td class='text-center'>&nbsp;</td>" +
			"</tr>" +
			"<tr>" +
			"<td> <label>Level I - Minimal</label><label class='float-right mr-5'>05/10 min</label></td>" +
			"<td><label>99201</label></td>" +
			"<td><label>99211</label></td> " +
			"<td>EKG Screening with Welcome to MCR</td>" +
			"<td>G0403</td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Level II - Low</label><label class='float-right mr-5'>10/20 min</label></td>" +
			"<td><label>99202</label></td>" +
			"<td><label>99212</label></td>" +
			"<td>Audiometry</td><td>92551</td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Level III - Detailed</label><label class='float-right mr-5'>30/15 min</label></td>" +
			"<td><label>99203</label></td>" +
			"<td><label>99213</label></td> " +
			"<td><label>Pulse oximetry</label></td>" +
			"<td><label>94760</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label>Level IV - Comprehensive</label><label class='float-right mr-5'>25/40 min</label></td>" +
			"<td><label>99204</label></td>" +
			"<td><label>99214</label></td>" +
			"<td><label> Annual wellness visit, initial</label></td>" +
			"<td><label>G0438</label></td>" +
			"</tr> " +
			"<tr>" +
			"<td><label>Level V - High Complex</label><label class='float-right mr-5'>40/60min</label></td>" +
			"<td><label>99205</label></td>" +
			"<td><label>99215</label></td> " +
			"<td><label> Annual wellness visit, subsequent</label></td>" +
			"<td><label>G0439</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td><label><b>Significant, Separate Service</b></label></td>" +
			"<td><label><b>-25 </b></label></td>" +
			"<td><label><b>-25</b></label></td>" +
			"<td><label>Welcome to Medicare exam </label></td>" +
			"<td><label>G0402</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td class='superBillrowHeader text-center' colspan='2'><label><b>Medicare flu vaccines</b></label></td>" +
			"<td class='superBillrowHeader'>&nbsp;</td>" +
			"<td>Vision Screening </td>" +
			"<td>99173</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'><label>Afluria, 3 yrs and older (V04.81)</label></td>" +
			"<td><label>Q2035</label></td>" +
			"<td class='superBillrowHeader text-center'><label><b>Diagnosis</b></label></td> " +
			"<td class='superBillrowHeader'></td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'><label>FluLaval, 3 yrs and older (V04.81</label></td><td><label>Q2036</label></td>" +
			"<td>Physical </td><td>V70.0</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'><label>Flyvirin, 3 yrs and older (V04.81)</label></td>" +
			"<td><label>Q2037</label></td>" +
			"<td>Flu vaccination </td> " +
			"<td>V04.81</td></tr>" +
			"<tr>" +
			"<td colspan='2'><label>Fluzone, 3 yrs and older (V04.81)</label></td>" +
			"<td><label>Q2038</label></td>" +
			"<td>Rapid Flu</td><td>87502</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2' class='superBillrowHeader text-center'><label><b>Office procedures</b></label></td> " +
			"<td class='superBillrowHeader'>&nbsp;</td>" +
			"<td class='superBillrowHeader text-center'><label><b>Injections/Immunizations</b></label></td>" +
			"<td class='superBillrowHeader '>&nbsp;</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'>Hemoglobin</td>" +
			"<td>85018</td>" +
			"<td><label>Pneumovac > 2 yrs</label><label class='float-right mr-5'>V03.82</label></td>" +
			"<td>90732</td>" +
			"<tr>" +
			"<td colspan='2'>Fluoride</td><td>D1208</td>" +
			"<td>Immun Admin One Vac  </td><td>90471</td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'>Silver nitrate cautery</td>" +
			"<td>17250 </td>" +
			"<td>Immun Admin Ea Add&#39;tl</td>" +
			"<td>90472</td>" +
			"</tr>" +

			"<tr>" +
			"<td colspan='2' class='superBillrowHeader text-center'><label><b>Covid-19</b></label></td> " +
			"<td class='superBillrowHeader'></td>" +
			"<td>b12</td>" +
			"<td>&nbsp;</td>" +
			"</tr>" +

			"<tr>" +
			"	<td colspan='2'>COVID-19 Vaccine Pfizer</td>" +
			"	<td>91300</td>" +
			"	<td>rocepehin</td><td>&nbsp;</td>" +
			"	</tr>" +
			"<tr>" +

			"<tr>" +
			"	<td colspan='2'>COVID-19 Vaccine Moderna</td>" +
			"	<td>91301</td>" +
			"	<td><label>Bexero</label></td>" +
			"	<td><label>90620</label></td>" +
			"</tr>" +



			"<tr>" +
			"<td colspan='2' class='superBillrowHeader text-center'><label><b>Laboratory</b></label></td> " +
			"<td class='superBillrowHeader'></td>" +
			"<td><label>Quadracel</label></td>" +
			"<td><label>90696</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'>EKG</td>" +
			"<td>93000</td>" +
			"<td><label>Proquad</label></td>" +
			"<td><label>90710</label></td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2'>&nbsp;</td><td>&nbsp;</td><td><label>Flulaval Quadrivalent >6 months</label></td>" +
			"<td><label>90686</label></td>" +
			"</tr>" +
			"</table> " +
			
			+" </td></tr><tr><td> ";
			*/
			this.showReport(this.strHTMLSuperBillHeader + this.strHTMLannualwellnessroute + this.strHTMLClaimDiagnos + this.strHTMLCommentsPort)
		}
		else if (this.DropDownValue.toString().toLowerCase() == "immigration route") {
			//"<style type='text/css'>.tabletest{border-collapse: collapse; width: 100%; font-size: 9px; font-family: Verdana;}.tablewrite tr, .tblvitals tr{height:20px;}.tblvitals{border:1px solid black;border-bottom:0;border-collapse: collapse;height:20px;}.tblvitals td{border-left:1px solid black;}" +
			//" .tabletest, .tabletest td, .tabletest th{border: 1px solid black;}</style>" +
			this.strHTMLimmigrationRoute =
				`<table class='tabletestwoBorder'>
				<tr>
					<td>
						<table class='tabletest super_bill'>
							<tr>
								<td colspan='5'>Payment: _________________________________________________________ Cash Only at time of Service</td>
							</tr>
							<tr class='superBillrowHeader text-center'>
								<td class='text-center'>
								</td>
								<td class='text-center'>
									<label>
										<b>PROC.</b>
									</label>
								</td>
								<td class='text-center'>
									<label>
										<b>OUR CHG</b>
									</label>
								</td>
								<td class='text-center'>
									<label>
										<b>Date</b>
									</label>
								</td>
								<td class='text-center'>
									<label>
										<b> Amt. Paid</b>
									</label>
								</td>
							</tr>
							<tr>
								<td>IV000</td>
								<td>PHYSICAL</td>
								<td>$195.00</td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td/>
								<td>Includes Physical Exam, PPD,RPR, (no bloodwork for titers are included in this price)</td>
								<td/>
								<td/>
								<td/>
							</tr>
							<tr>
								<td/>
								<td>Follow up Physical Visit  No Charge for second visit.</td>
								<td>$0.00</td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90714</td>
								<td>DT/TD</td>
								<td>$60.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90700</td>
								<td>DTAP</td>
								<td>$100.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90713</td>
								<td>IPV</td>
								<td>$45.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90707</td>
								<td>MMR</td>
								<td>$75.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90647</td>
								<td>ACT Hib</td>
								<td>$45.00</td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90632</td>
								<td>HEP A</td>
								<td>$50.00</td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90746</td>
								<td>HEP B</td>
								<td>$75.00</td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90716</td>
								<td>VARICELLA</td>
								<td>$125.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90658</td>
								<td>FLU</td>
								<td>$25.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90680</td>
								<td>ROTAVIRUS</td>
								<td>$135.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90734</td>
								<td>MENINGIOCOCAL</td>
								<td>$150.00</td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90651</td>
								<td>HPV</td>
								<td>$175.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>Shingles vaccine</td>
								<td>ZOSTAR</td>
								<td>$150.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>90732</td>
								<td>PNEUMOCOCCAL/PNEMOVAX</td>
								<td>$75.00 </td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>71020</td>
								<td>CHEST X RAY</td>
								<td>$100.00</td>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>93000</td>
								<td>EKG</td>
								<td/>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>96127</td>
								<td>Brief emotional/behavioral assessment</td>
								<td/>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>&nbsp;</td>
								<td>COVID-19 Test</td>
								<td/>
								<td/>
								<td/>
							</tr>
							<tr>
								<td>80305</td>
								<td>14 Panel Drug Test</td>
								<td/>
								<td/>
								<td/>
							</tr>

						
						</table>
					</td>
				</tr>
			</table>`
			/*
				"<table class='tabletestwoBorder'>" +
				"<tr>" +
				"<td>" +
				"<table class='tabletest super_bill' >" +
				"<tr>" +
				"<td colspan='5'>Payment: _________________________________________________________ Cash Only at time of Service</td>" +
				"</tr>" +
				"<tr class='superBillrowHeader text-center'>" +
				"<td class='text-center'>" +
				"</td>" +
				"<td class='text-center'><label><b>PROC.</b></label></td>" +
				"<td  class='text-center'><label><b>OUR CHG</b> </label></td>" +
				"<td  class='text-center'><label><b>Date</b></label></td>" +
				"<td class='text-center'><label><b> Amt. Paid</b></label></td>" +
				"</tr>" +
				"<tr>" +
				"<td >IV000</td><td >PHYSICAL</td><td>$195.00</td><td ></td><td></td></tr>" +
				"<tr><td ></td><td >Includes Physical Exam, PPD,RPR, (no bloodwork for titers are included in this price)</td><td ></td><td ></td><td></td></tr>" +
				"<tr><td></td><td>Follow up Physical Visit  No Charge for second visit.</td><td >$0.00</td><td></td><td></td></tr>" +
				"<tr ><td >90714</td><td >DT/TD</td><td >$60.00 </td><td ></td><td></td></tr>" +
				"<tr><td >90700</td><td >DTAP</td><td >$100.00 </td><td ></td><td></td></tr>" +
				"<tr><td>90713</td><td >IPV</td><td >$45.00 </td><td ></td><td></td></tr>" +
				"<tr><td >90707</td><td >MMR</td><td >$75.00 </td><td></td><td></td></tr>" +
				"<tr ><td >90647</td><td >ACT Hib</td><td >$45.00</td><td ></td><td></td></tr>" +
				"<tr ><td >90632</td><td >HEP A</td><td >$50.00</td><td ></td><td></td></tr>" +
				"<tr><td >90746</td><td >HEP B</td><td >$75.00</td><td ></td><td></td></tr>" +
				"<tr ><td >90716</td><td >VARICELLA</td><td >$125.00 </td><td ></td><td></td></tr>" +
				"<tr ><td >90658</td><td >FLU</td><td >$25.00 </td><td ></td><td></td></tr>" +
				"<tr ><td >90680</td><td >ROTAVIRUS</td><td >$135.00 </td><td ></td><td></td></tr>" +
				"<tr ><td >90734</td><td >MENINGIOCOCAL</td><td >$150.00</td><td ></td><td></td></tr>" +
				"<tr ><td >90651</td><td >HPV</td><td >$175.00 </td><td ></td><td></td></tr>" +
				"<tr ><td >Shingles vaccine</td><td >ZOSTAR</td><td >$150.00 </td><td ></td><td></td></tr>" +
				"<tr ><td >90732</td><td >PNEUMOCOCCAL/PNEMOVAX</td><td >$75.00 </td><td ></td><td></td></tr>" +
				"<tr ><td >71020</td><td >CHEST X RAY</td><td >$100.00</td><td ></td><td></td></tr>"+
				"<tr ><td>93000</td><td>EKG</td><td></td><td></td><td></td></tr>" +
				"</table>"
				+"</td></tr><tr><td>";
				*/

			this.showReport(this.strHTMLSuperBillHeader + this.strHTMLimmigrationRoute + this.strHTMLClaimDiagnos + this.strHTMLCommentsPort)
		}
	}
	showReport(strHtmlString) {
		const modalRef = this.modalService.open(EncounterPrintViewerComponent, this.poupUpOptions);
		modalRef.componentInstance.print_html = strHtmlString;
		modalRef.componentInstance.print_style = this.style;
	}
	poupUpOptions: NgbModalOptions = {
		backdrop: 'static',
		keyboard: false,
		size: 'lg'
	};

}