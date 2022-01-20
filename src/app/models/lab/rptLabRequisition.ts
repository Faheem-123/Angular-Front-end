import { LabService } from "src/app/services/lab/lab.service";
import { LOOKUP_LIST, LookupList } from "src/app/providers/lookupList.module";
import { Inject } from "@angular/core";
import { GeneralOperation } from "src/app/shared/generalOperation";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { EncounterPrintViewerComponent } from "src/app/general-modules/encounter-print-viewer/encounter-print-viewer.component";
import { DateTimeUtil } from "src/app/shared/date-time-util";

export class rptLabRequisition {
	constructor(private labService: LabService,
		private generalOperation: GeneralOperation,
		@Inject(LOOKUP_LIST) public lookupList: LookupList, private dateTimeUtil: DateTimeUtil
		, private modalService: NgbModal) { }

	print_callBack = 0;
	arrHeader;
	arrInsurance;
	arrLabCode;
	arrDiagCode;
	order_id;
	patient_id;
	lab_draw: String = ""
	getReportData() {
		this.print_callBack = 0
		this.getHeaderInfo();
		this.print_callBack++;
		this.getInsuranceInfo();
		this.print_callBack++;
		this.getTestInfo();
		this.print_callBack++;
	}
	getHeaderInfo() {
		this.labService.getReqReport(this.order_id)
			.subscribe(
				data => {
					this.arrHeader = data;
					this.isDataLoaded();
				},
				error => alert(error)
			);
	}
	getInsuranceInfo() {
		this.labService.getReqReportIns(this.patient_id)
			.subscribe(
				data => {
					this.arrInsurance = data;
					this.isDataLoaded();
				},
				error => alert(error)
			);
	}
	getTestInfo() {
		this.labService.getReqReportLabCode(this.order_id)
			.subscribe(
				data => {
					this.arrLabCode = data;
					this.isDataLoaded();
				},
				error => alert(error)
			);
	}
	isDataLoaded() {
		this.print_callBack--;
		if (this.print_callBack == 0) {
			this.prePairReport();
			debugger



		}

	}
	poupUpOptions: NgbModalOptions = {
		backdrop: 'static',
		keyboard: false,
		size: 'lg'
	};

	prePairReport() {

		let ReportHeader;
		let ClinicalInfo;
		let InsuranceInfo;
		let Tests;
		let Diagnosis;
		let ReportTxt;
		let location_code = "";
		//location name
		// var arrsitecode:ArrayCollection=GeneralOptions.filterArrayCollection(GeneralOptions.acLocationLab,"address",arrHeader.getItemAt(0).location_name.toString().toUpperCase());
		// if(arrsitecode.length>0)
		// 	location_code=arrsitecode[0].phone;
		// else
		// 	location_code="";


		ReportHeader = "<table width='100%' border='0' cellpadding='0' cellspacing='0'> ";
		debugger;
		if (this.arrHeader[0].lab_name.toLowerCase() == "wdl") {
			ReportHeader += "<tr>" +
				"<td colspan='4' width='100%' valign='top'> <img src=https://instanthealthcare.net/ihcDocs/Documents/Lab_Logo/WDL_Logo_WEB.png' ></td>" +
				"</tr>";
			ReportHeader += "<tr>" +
				"<td colspan='4' width='100%' align='center' valign='top'><span class='styleTopHeader'>Wisconson Diagnostic Laboratories</span></td></tr>";
		}
		else if (this.arrHeader[0].lab_name.toString().toLowerCase() == "labcorp") {
			ReportHeader += "<tr>" +
				"<td colspan='4' width='100%' valign='top'> <img src='https://instanthealthcare.net/ihcDocs/Documents/Lab_Logo/LabCorp_Logo.png' ></td>" +
				"</tr>";
			ReportHeader += "<tr>" +
				"<td colspan='4' width='100%' align='center' valign='top'><span class='styleTopHeader'>" + this.arrHeader[0].lab_name + "</span></td></tr>";
		}
		else {
			ReportHeader += "<tr>" +
				"<td colspan='4' width='100%' align='center' valign='top'><span class='styleTopHeader'>" + this.arrHeader[0].lab_name + "</span></td></tr>";
		}

		ReportHeader += "<tr></tr>" +
			"<tr></tr>" +
			"<tr> <td colspan='4' align='center' valign='top'><span class='styleTopHeader'>" + this.lookupList.practiceInfo.practiceName + "</span><p><p/></td></tr>" +
			" <tr>" +
			"<td  width='14%' valign='top' class='styleSubHeading'>Lab Account </td>" +
			"<td  width='55%' valign='top'  class='styleNormal'>" + this.arrHeader[0].lab_acc_number + "</td>" +
			"<td  width='12%' valign='top'  class='styleSubHeading'>Provider	</td>" +
			"<td  width='38%' valign='top'  class='styleNormal'>" + this.arrHeader[0].providername + "</td></tr>" +
			"<tr>" +
			"<td  width='17%' valign='top'  class='styleNormal'><b>REQ # : </b>" + this.order_id + "</td>" +
			"<td  width='55%' valign='top'  class='styleNormal'><b>Status</b>  : " + this.arrHeader[0].status + "</td>" +
			"<td  width='12%' valign='top'  class='styleSubHeading' >Phone	</td>" +
			"<td  width='38%' valign='top'  class='styleNormal'>" + this.arrHeader[0].providerphone + "</td> </tr>" +
			"<tr>" +
			"<td colspan='2' width='50%' valign='top' class='styleSubHeading'>" + this.lookupList.practiceInfo.practiceName + "	</td>" +
			"<td  width='12%' valign='top' class='styleSubHeading'>Fax	</td>" +
			"<td  width='38%' valign='top' class='styleNormal'>" + this.arrHeader[0].fax + "</td> </tr>" +
			"<tr>" +
			"<td colspan='2' width='50%' valign='top' class='styleSubHeading'>" + this.lookupList.practiceInfo.address1 + "	</td>" +
			"<td  width='12%' valign='top' class='styleSubHeading'>NPI	</td>" +
			"<td  width='38%' valign='top'  class='styleNormal'>" + this.arrHeader[0].npi + " </td> </tr>" +
			"<tr>" +
			"<td colspan='2' width='50%' valign='top' class='styleSubHeading'>" + this.lookupList.practiceInfo.zip + " " + this.lookupList.practiceInfo.city + " " + this.lookupList.practiceInfo.state + "</td>" +
			"<td  width='12%' valign='top' class='styleSubHeading'>Location</td>" +
			"<td  width='38%' valign='top'  class='styleNormal'>" + this.arrHeader[0].location_name + "(" + location_code + ")</td>" +
			"<td> </td>" +
			"<td></td>" +
			"</tr>" +
			"<tr>" +
			"<td  width='14%' valign='top' class='styleSubHeading'>Phone practice	</td>" +
			"<td  width='36%' valign='top'  class='styleNormal'>" + this.lookupList.practiceInfo.phone + "</td>" +
			"<td  width='12%' valign='top' align='left' class='styleSubHeading'>" + this.lab_draw + "</td>" +
			"<td  width='38%' valign='top' ></td></tr>" +
			"<tr>";
		if (this.arrHeader[0].facility_name != null && this.arrHeader[0].facility_name != "") {
			ReportHeader += "<tr><td  width='14%' valign='top' class='styleSubHeading'>Outside Facility</td>" +
				"<td  colspan='3' width='100%' valign='top'  class='styleNormal'>" + this.arrHeader[0].facility_name + "</td></tr>";
		}

		ReportHeader += "<td height='1' colspan='4' align='center' valign='top'>		<hr width='100%' noshade></td></tr> " +
			"</table>";
		var dob: Date = new Date(this.arrHeader[0].dob);
		var patient_age: String = "";

		if (Number(this.arrHeader[0].age) > 0) {
			patient_age = this.arrHeader[0].age + " Y"
		}
		if (Number(this.arrHeader[0].age_month) > 0) {
			if (patient_age != "")
				patient_age += " - ";
			patient_age += this.arrHeader[0].age_month + " M"
		}

		if (patient_age != "")
			patient_age = " ( " + patient_age + " )";

		ClinicalInfo = "<table width='100%' border='1' cellpadding='2' cellspacing='0' >" +
			"<td width='20%' valign='top' ><span class='styleSubHeading'>Patient ID</span><br><span class='styleNormal'>" + this.arrHeader[0].pid + " </span></td>" +
			"<td colspan='1' width='25%' valign='top' ><span class='styleSubHeading'>Last Name</span><br><span class='styleSubHeading'>" + this.arrHeader[0].last_name.toString().toUpperCase() + "</span> </td>" +
			"<td colspan='1' width='25%' valign='top' ><span class='styleSubHeading'>First Name</span><br><span class='styleSubHeading'>" + this.arrHeader[0].first_name.toString().toUpperCase() + "  </span></td>" +
			"<td  width='5%' valign='top'><span class='styleSubHeading'>MI</span><br><span class='styleNormal'>" + this.arrHeader[0].mname + "</span> </td>" +
			"<td  colspan='2' width='10%' colspan='2' valign='top'><span class='styleSubHeading'>Gender</span><br><span class='styleNormal'>" + this.arrHeader[0].gender + " </span> </td>" +
			"</tr>" +
			"<tr>" +
			"<tr>" +
			"<td width='20%' valign='top'><span class='styleSubHeading'>Age</span><br><span class='styleNormal'>" + patient_age + "</span> </td>" +
			"<td width='20%' valign='top'><span class='styleSubHeading'>DOB</span><br><span class='styleNormal'>" + this.arrHeader[0].dob + "</span> </td>" +
			"<td width='20%' valign='top'><span class='styleSubHeading'>SSN</span><br><span class='styleNormal'>********** </span></td>" +
			"<td  width='15%' valign='top'><span class='styleSubHeading'>Home Phone</span><br><span class='styleNormal'>" + this.arrHeader[0].home_phone + " </span></td>" +
			"<td  width='25%' valign='top' colspan= '2'><span class='styleSubHeading'>Cell Phone</span><br><span class='styleNormal'>" + this.arrHeader[0].work_phone + "</span></td>" +
			"</tr>" +


			"<tr>" +
			"<td colspan='2' width='60%'valign='top' ><span class='styleSubHeading'>Address</span><br><span class='styleNormal'>" + this.arrHeader[0].address + "  </span></td>" +
			"<td  width='20%' valign='top' ><span class='styleSubHeading'>City</span><br><span class='styleNormal'>" + this.arrHeader[0].city + " </span> </td>" +
			"<td  width='10%' valign='top'><span class='styleSubHeading'>State</span><br><span class='styleNormal'>" + this.arrHeader[0].state + " </span></td>" +
			"<td  width='20%' valign='top' ><span class='styleSubHeading'>ZIP</span><br><span class='styleNormal'>" + this.arrHeader[0].zip + " </span></td>" +
			"</tr>" +

			"<tr>" +
			"<td width='20%' valign='top' ><span class='styleSubHeading'>Collection Date</span><br><span class='styleNormal'>" + this.arrHeader[0].order_date + "</span></td>" +
			"<td  width='10%' valign='top'><span class='styleSubHeading'>Time</span><br><span class='styleNormal'>" + this.arrHeader[0].ordertime + "</span></td>" +
			"<td  width='10%' valign='top'><span class='styleSubHeading'>Fasting</span><br><span class='styleNormal'>" + this.arrHeader[0].fasting + "</span> </td>" +
			"<td  width='10%' valign='top'><span class='styleSubHeading'>Stat</span><br><span class='styleNormal'>" + this.arrHeader[0].stat + "</span></td>" +
			"<td  width='50%' valign='top' colspan= '4'><span class='styleSubHeading'>Bill Type</span><br><span class='styleNormal'>" + this.arrHeader[0].bill_type + "</span></td>" +
			//					"<td  width='40%' valign='top' colspan= '3'><span class='styleSubHeading'>Fax Result To</span> <br><span class='styleNormal'>faxresulttoVal</span></td>" +
			"</tr>" +
			"</table>";


		InsuranceInfo = "<br/><span class='styleSubHeading'>Insurance Informations</span>" +
			"<table width='100%' border='1' cellpadding='2' cellspacing='0' >"
		if (this.arrInsurance != null && this.arrInsurance.length > 0) {
			InsuranceInfo += "<tr>" +
				"<td width='80%' colspan='6'valign='top'  ><span class='styleSubHeading'>Primary</span><br><span class='styleNormal'>" + this.arrInsurance[0].insname + "</span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>LCA Ins Code</span><br><span class='styleNormal'>lcainsVal</span></td>" +
				"<td  width='10%' valign='top' ><span class='styleSubHeading'>Policy No</span><br><span class='styleNormal'>" + this.arrInsurance[0].policy_number + "</span></td>" +
				"</tr> <tr>" +
				"<td  width='20%' valign='top' ><span class='styleSubHeading'>Group No</span><br><span class='styleNormal'>" + this.arrInsurance[0].group_number + " </span></td>" +
				"<td width='30%' colspan='2'  valign='top' ><span class='styleSubHeading'>Address</span><br><span class='styleNormal'>" + this.arrInsurance[0].inaddress + " </span></td>" +
				"<td width='20%' colspan='3'  valign='top' ><span class='styleSubHeading'>City</span><br><span class='styleNormal'>" + this.arrInsurance[0].inscity + "</span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>State</span><br><span class='styleNormal'>" + this.arrInsurance[0].insstate + " </span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>Zip</span><br><span class='styleNormal'>" + this.arrInsurance[0].inszip + " </span></td>" +
				"</tr> <tr>" +
				"<td width='20%' valign='top'  ><span class='styleSubHeading'>Gurantor</span><br><span class='styleNormal'>" + this.arrInsurance[0].guarantorname + "</span></td>" +
				"<td width='30%' colspan= '2' valign='top' ><span class='styleSubHeading'>Address</span><br><span class='styleNormal'>" + this.arrInsurance[0].address + "</span></td>" +
				"<td width='10%' colspan= '2' valign='top'  ><span class='styleSubHeading'>City</span><br><span class='styleNormal'>" + this.arrInsurance[0].city + "</span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>State</span><br><span class='styleNormal'>" + this.arrInsurance[0].state + "</span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>Zip</span><br><span class='styleNormal'>" + this.arrInsurance[0].zip + " </span></td>" +
				"<td width='20%' valign='top'  ><span class='styleSubHeading'>Relation</span><br><span class='styleNormal'>" + this.arrInsurance[0].guarantor_relationship + "</span></td>" +
				"</tr>";
		}
		else {
			InsuranceInfo += "<tr>" +
				"<td width='80%' colspan='6' valign='top'  ><span class='styleSubHeading'>Primary</span><br><span class='styleNormal'></span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>LCA Ins Code</span><br><span class='styleNormal'></span></td>" +
				"<td  width='10%' valign='top' ><span class='styleSubHeading'>Policy No</span><br></td>" +
				"</tr><tr>" +
				"<td  width='20%' valign='top' ><span class='styleSubHeading'>Group No</span><br></td>" +
				"<td width='30%' colspan='2'  valign='top' ><span class='styleSubHeading'>Address</span><br><span class='styleNormal'></span></td>" +
				"<td width='20%' colspan='3'  valign='top' ><span class='styleSubHeading'>City</span><br><span class='styleNormal'></span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>State</span><br><span class='styleNormal'> </span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>Zip</span><br><span class='styleNormal'> </span></td>" +
				"</tr><tr>" +
				"<td width='20%' valign='top'  ><span class='styleSubHeading'>Gurantor</span><br><span class='styleNormal'></span></td>" +
				"<td width='30%' colspan= '2' valign='top' ><span class='styleSubHeading'>Address</span><br></td>" +
				"<td width='10%' colspan= '2' valign='top'  ><span class='styleSubHeading'>City</span><br></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>State</span><br></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>Zip</span><br></td>" +
				"<td width='20%' valign='top'  ><span class='styleSubHeading'>Relation</span><br></td>" +
				"</tr>";
		}

		if (this.arrInsurance != null && this.arrInsurance.length > 1) {
			InsuranceInfo += "<tr>" +
				"<td width='80%' colspan='6'valign='top'   ><span class='styleSubHeading'>Secondary</span><br><span class='styleNormal'>" + this.arrInsurance[1].insname + "</span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>LCA Ins Code</span><br><span class='styleNormal'>lcainsVal</span></td>" +
				"<td  width='10%' valign='top' ><span class='styleSubHeading'>Policy No</span><br><span class='styleNormal'>" + this.arrInsurance[1].policy_number + "</span></td>" +
				"</tr><tr>" +
				"<td  width='20%' valign='top' ><span class='styleSubHeading'>Group No</span><br><span class='styleNormal'>" + this.arrInsurance[1].group_number + " </span></td>" +
				"<td width='40%' colspan='2'  valign='top' ><span class='styleSubHeading'>Address</span><br><span class='styleNormal'>" + this.arrInsurance[1].inaddress + "</span></td>" +
				"<td width='20%' colspan='3'  valign='top' ><span class='styleSubHeading'>City</span><br><span class='styleNormal'>" + this.arrInsurance[1].inscity + "</span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>State</span><br><span class='styleNormal'>" + this.arrInsurance[1].insstate + " </span></td>" +
				"<td width='10%' valign='top' ><span class='styleSubHeading'>Zip</span><br><span class='styleNormal'>" + this.arrInsurance[1].inszip + " </span></td>" +
				"</tr><tr>" +
				"<td width='20%' valign='top'  ><span class='styleSubHeading'>Gurantor</span><br><span class='styleNormal'>" + this.arrInsurance[1].guarantorname + "</span></td>" +
				"<td  width='30%' valign='top' colspan= '2'><span class='styleSubHeading'>Address</span><br><span class='styleNormal'>" + this.arrInsurance[1].address + "</span></td>" +
				"<td  width='10%' valign='top' colspan= '2'><span class='styleSubHeading'>City</span><br><span class='styleNormal'>" + this.arrInsurance[1].city + "</span></td>" +
				"<td  width='10%' valign='top' ><span class='styleSubHeading'>State</span><br><span class='styleNormal'>" + this.arrInsurance[1].state + "</span></td>" +
				"<td  width='10%' valign='top'  ><span class='styleSubHeading'>Zip</span><br><span class='styleNormal'>" + this.arrInsurance[1].zip + " </span></td>" +
				"<td  width='20%' valign='top' ><span class='styleSubHeading'>Relation</span><br><span class='styleNormal'>" + this.arrInsurance[1].guarantor_relationship + "</span></td>" +
				"</tr>" +
				"</table>";
		}
		else {
			InsuranceInfo += "<tr>" +
				"<td width='80%' colspan='6'  valign='top'  ><span class='styleSubHeading'>Secondary</span><br><span class='styleNormal'></span></td>" +
				"<td width='20%' valign='top'  ><span class='styleSubHeading'>LCA Ins Code</span><br><span class='styleNormal'></span></td>" +
				"<td  width='10%' valign='top'  ><span class='styleSubHeading'>Policy No</span><br></td>" +
				"</tr><tr>" +
				"<td  width='10%' valign='top' ><span class='styleSubHeading'>Group No</span><br></td>" +
				"<td width='40%' colspan='2'  valign='top' ><span class='styleSubHeading'>Address</span><br><span class='styleNormal'></span></td>" +
				"<td width='20%' colspan='3'  valign='top' ><span class='styleSubHeading'>City</span><br><span class='styleNormal'></span></td>" +
				"<td width='10%' valign='top'  ><span class='styleSubHeading'>State</span><br><span class='styleNormal'> </span></td>" +
				"<td width='10%' valign='top' ><span class='styleSubHeading'>Zip</span><br><span class='styleNormal'> </span></td>" +
				"</tr><tr>" +
				"<td width='20%' valign='top'  ><span class='styleSubHeading'>Gurantor</span><br><span class='styleNormal'></span></td>" +
				"<td  width='30%' valign='top' colspan= '2'><span class='styleSubHeading'>Address</span><br></td>" +
				"<td  width='10%' valign='top' colspan= '2'><span class='styleSubHeading'>City</span><br></td>" +
				"<td  width='10%' valign='top' ><span class='styleSubHeading'>State</span><br></td>" +
				"<td  width='10%' valign='top'  ><span class='styleSubHeading'>Zip</span><br></td>" +
				"<td  width='20%' valign='top'  ><span class='styleSubHeading'>Relation</span><br></td>" +
				"</tr>" +
				"</table>";
		}

		let strTestHtml = "";
		if (this.arrLabCode != null)
			for (let i = 0; i < this.arrLabCode.length; i++) {
				let count = i + 1;

				strTestHtml += "<tr>" +
					"<td width='10%' valign='top'><p align='left' class='styleNormal'>" + count + "</p></td>" +
					"<td width='10%'  valign='top'  ><p align='left' class='styleNormal'>" + this.arrLabCode[i].proc_code + "</td>" +
					"<td width='10%'valign='top' ><p align='left' class='styleNormal'>" + this.arrLabCode[i].lab_assigned_cpt + "</td>" +
					"<td width='40%' valign='top' ><p align='justify' class='styleNormal'>" + this.arrLabCode[i].proc_description + "</td>" +
					//"<td width='5%' valign='top' ><p align='center' class='styleNormal'>"+arrLabCode[i].units+"</td>" +
					"<td width='20%' valign='top' ><p align='justify' class='styleNormal'>" + this.arrLabCode[i].test_instructions + "</td>" +
					"<td width='10%' valign='top' ><p align='left' class='styleNormal'>" + this.arrLabCode[i].source + "</td>" +
					//"<td width='5%' valign='top' ><p align='left' class='styleNormal'>"+arrLabCode[i].volume+"</td>" +
					"</tr>"
			}


		Tests = " <hr align='left' width='100%' noshade>" +
			"<span class='styleSubHeading'>Test(s)</span>" +
			" <hr align='left' width='100%' noshade>" +
			"<table width='100%' border='0' cellpadding='2' cellspacing='0'>" +
			"<tr>" +
			"<td class='styleSubHeading' width='10%' valign='top'  >S No.</td>" +
			"<td  class='styleSubHeading' width='10%' valign='top'  >CPT Code</td>" +
			"<td  class='styleSubHeading' width='10%' valign='top'>Lab Code</td>" +
			"<td  class='styleSubHeading' width='40%' valign='top' >Description</td>" +
			//"<td  class='styleSubHeading' width='5%' valign='center' >Units</td>" +
			"<td  class='styleSubHeading' width='20%' valign='top' >Instructions</td>" +
			"<td  class='styleSubHeading' width='20%' valign='top' >Spec Source</td>" +
			//"<td  class='styleSubHeading' width='5%' valign='top' >Volume</td>" +
			"</tr>";
		Tests = Tests + strTestHtml + "</table> ";
		//-----------------------------------------------
		var strDiagHtml: String = "";
		if (this.arrDiagCode != null)
			for (let i = 0; i < this.arrDiagCode.length; i++) {
				strDiagHtml += " <tr>" +
					"<td width='10%' valign='top'><p align='left' class='styleNormal'>" + this.arrDiagCode[i].sequence + "</p></td>" +
					"<td width='20%' valign='top'><p align='left' class='styleNormal'>" + this.arrDiagCode[i].diag_code + "</p></td>" +
					"<td width='70%'  valign='top'><p align='justify' class='styleNormal'>" + this.arrDiagCode[i].diag_description + "</p></td>" +
					"</tr> ";
			}

		Diagnosis = "<br><hr align='left' width='100%' noshade>" +
			"<span class='styleSubHeading'>Diagnosis(s)</span>" +
			" <hr align='left' width='100%' noshade>" +
			"<table width='100%' border='0' cellpadding='2' cellspacing='0'>" +
			"<tr>" +
			"<td class='styleSubHeading' width='10%' valign='top'  >S No.</td>" +
			"<td class='styleSubHeading' width='20%' valign='top' >Diagnosis Code</td>" +
			"<td class='styleSubHeading' width='70%' valign='top' >Diagnosis Description</td>" +
			"</tr>";
		Diagnosis = Diagnosis + strDiagHtml + "</table> ";

		//Question ANswer
		var QueAns: String = "";
		QueAns += "<br><hr align='left' width='100%' noshade> " +
			"<span class='styleSubHeading'>Prompt(s)</span> " +

			"<table width='100%' border='0' cellpadding='2' cellspacing='0'> ";

		QueAns += this.QuestionAnswer() + "</table>";

		ReportTxt = ReportHeader + ClinicalInfo + InsuranceInfo + Tests + Diagnosis + QueAns;

		//				Alert.show(ReportTxt);
		// if(GeneralOptions.practiceID=="500" && arrLabCode!=null)
		// {
		// 	for( i=0;i<arrLabCode.length;i++)
		// 	{
		// 		if(arrLabCode[i].lab_category_id=="5001018")
		// 		{
		// 			ReportTxt+=MRIText();
		// 			break;
		// 		}
		// 	}
		// }
		this.printReport(ReportTxt);


	}
	QuestionAnswer() {
		return "";
	}
	printReport(strContent) {

		strContent += "<div class='report'>";
		strContent += "<footer><hr align='left' width='100%' noshade> " +
			"<table width='100%' border='0' cellpadding='2' cellspacing='0'>" +
			" <tr>" +
			"  <td colspan='2' align='left'><b>Electronically Signed BY:</b> " + this.arrHeader[0].providername + "</td>" +
			" </tr>" +
			" <tr>" +
			"  <td  align='left'><b>Printed By:</b> " + this.lookupList.logedInUser.user_name + "</td>" +
			" <td  align='right' ><b>Date:</b> " + this.dateTimeUtil.getCurrentDateTimeString() + "</td>" +
			" </tr>" +
			"</table>" +
			"</footer>";
		strContent += "</div>";

		const modalRef = this.modalService.open(EncounterPrintViewerComponent, this.poupUpOptions);
		modalRef.componentInstance.print_html = strContent;
		//modalRef.componentInstance.print_style = this.style;

	}

}