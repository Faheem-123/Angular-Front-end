import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { PatientService } from 'src/app/services/patient/patient.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { GeneralService } from 'src/app/services/general/general.service';
import { ReferralService } from 'src/app/services/patient/referral.service';
import { ReferralViewersComponent } from 'src/app/general-modules/referral-viewers/referral-viewers.component';
import { ORMSavePatientStatement_log } from 'src/app/models/billing/ORMSavePatientStatement_log';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ORMSavePatientAttorney_log } from 'src/app/models/billing/ORMSavePatientAttorney_log';
import { ORMspGetPatientClaims } from 'src/app/models/billing/ORMspGetPatientClaims';
import * as FileSaver from 'file-saver';

@Component({
	selector: 'claim-statement',
	templateUrl: './claim-statement.component.html',
	styleUrls: ['./claim-statement.component.css']
})
export class ClaimStatementComponent implements OnInit {
	@Input() patient_id;
	lstClaim;
	generated_pdf_url_link = "";
	generated_pdf_url_temp = "";
	generated_pdf_path_temp = "";
	strStatementPhone = "";
	claim_message = '';
	inputForm: FormGroup;
	billForm: FormGroup;
	searchForm: FormGroup;
	total_30 = 0;
	total_60 = 0;
	total_90 = 0;
	total_120 = 0;
	total_120Plus = 0;
	total_amount = 0;
	isLoading=false;
	constructor(private claimService: ClaimService, private ngbModal: NgbModal,
		private patientService: PatientService,
		@Inject(LOOKUP_LIST) public lookupList: LookupList, public activeModal: NgbActiveModal,
		private generalService: GeneralService, private formBuilder: FormBuilder,
		private dateTimeUtilL: DateTimeUtil, private generalOperation: GeneralOperation) { }
		@HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
	ngOnInit() {
		this.strStatementPhone = this.lookupList.practiceInfo.statement_phone == "" ? this.lookupList.practiceInfo.phone : this.lookupList.practiceInfo.statement_phone;
		this.claim_message = "YOUR INSURANCE HAS PAID ITS PORTION OF SERVICES SO PLEASE REMIT YOUR BALANCE PROMPTLY.\n";
		this.claim_message += "IN CASE OF ANY CONCERNS PLEASE CONTACT At " + this.strStatementPhone;
		this.getPatientInfo()
		this.onSearch(true);
		this.buildForm();
	}
	listPatientinfo;
	getPatientInfo() {
		this.patientService.getPatient(this.patient_id).subscribe(
			data => {
				debugger;
				this.listPatientinfo = data;
			},
			error => {
			}
		);
	}
	onSearch(bill) {
		let searchCriteria: SearchCriteria = new SearchCriteria();
		searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
		searchCriteria.param_list = [];
		searchCriteria.param_list.push({ name: "patient_id", value: this.patient_id, option: "" });
		if (bill == true)
			searchCriteria.param_list.push({ name: "pat_status", value: "B", option: "" });

		this.claimService.getPatientStatement(searchCriteria).subscribe(
			data => {

				this.lstClaim = data as Array<any>;
			},
			error => {

			}
		);

	}
	onBillFormSelection(event) {
		debugger;
		this.onSearch(event.target.checked)

	}
	lstSelectedClaims
	onSelection(event: any, enc: any) {
		debugger;
		if (event.target.checked) {
			if (this.lstSelectedClaims == undefined)
				this.lstSelectedClaims = new Array<string>();
			this.lstSelectedClaims.push(enc);
		}
		else if (!event.target.checked) {
			if (this.lstSelectedClaims != undefined) {
				for (let i: number = this.lstSelectedClaims.length - 1; i >= 0; i--) {
					if (this.lstSelectedClaims[i].claim_id == enc.claim_id) {
						this.lstSelectedClaims.splice(i, 1);
					}
				}
			}
		}
	}
	listDetail;
	onPrintStatement() {
		debugger;
		this.total_120 = 0;
		this.total_120Plus = 0;
		this.total_30 = 0;
		this.total_60 = 0;
		this.total_90 = 0;
		this.total_amount = 0;

		if (this.lstSelectedClaims != null && this.lstSelectedClaims != undefined && this.lstSelectedClaims.length > 0) {
			let selectedClaimList = "";
			for (let i = 0; i < this.lstSelectedClaims.length; i++) {
				if (selectedClaimList == "")
					selectedClaimList = this.lstSelectedClaims[i].claim_id;
				else
					selectedClaimList += "," + this.lstSelectedClaims[i].claim_id;
			}
			if (selectedClaimList != "") {
				let searchCriteria: SearchCriteria = new SearchCriteria();
				searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
				searchCriteria.param_list = [];
				searchCriteria.param_list.push({ name: "claim_id", value: selectedClaimList, option: "" });
				this.claimService.getStatementDetail(searchCriteria).subscribe(
					data => {
						debugger;
						this.listDetail = data as Array<any>;
						let listDistinct: any = new UniquePipe().transform(this.listDetail, "claim_id");
						for (let i = 0; i < listDistinct.length; i++) {
							this.total_30 += Number(listDistinct[i].aging_30);
							this.total_60 += Number(listDistinct[i].aging_60);
							this.total_90 += Number(listDistinct[i].aging_90);
							this.total_120 += Number(listDistinct[i].aging_120);
							this.total_120Plus += Number(listDistinct[i].aging_120_plus);
						}
						this.total_30 = Number(this.total_30.toFixed(2));
						this.total_60 = Number(this.total_60.toFixed(2));
						this.total_90 = Number(this.total_90.toFixed(2));
						this.total_120 = Number(this.total_120.toFixed(2));
						this.total_120Plus = Number(this.total_120Plus.toFixed(2));

						this.GenerateHtml();
					},
					error => {

					}
				);

			}
		}
		else {
			GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Statement Validation', 'Please select atleast one claim.', 'warning');
		}
	}



	GenerateHtml() {
		let lstSave: Array<ORMSavePatientStatement_log> = new Array;
		debugger;
		let address = "";
		let citystateZip = "";
		;
		address = this.lookupList.practiceInfo.address1;
		citystateZip = this.lookupList.practiceInfo.city + ", " + this.lookupList.practiceInfo.state + " " + this.lookupList.practiceInfo.zip;



		let strReport = "<table border='.5' width='100%'> " +
			"<tr bgcolor='white'> " +
			"<td width='40%'> " +
			"<table  border='0'> " +
			"<tr bgcolor=\"0376a8\"> " +
			"<td bgcolor=\"0376a8\" style=\"color:#FFFFFF\"><div align=\"center\" class=\"style19\">Make Checks Payable To: </div></td> " +
			"</tr> " +
			"<tr > " +
			"<td width='424' ><p align='left' style=' font-size: 10pt; font-family:Verdana, Arial, Helvetica, sans-serif'> <span class=\"style20\"><strong>" + this.lookupList.practiceInfo.practiceName + "</strong> <br> " +
			address + "<br>" + citystateZip + "<br>" +
			"</span>           " +
			"<p align='left' style=' font-size: 10pt; font-family:Verdana, Arial, Helvetica, sans-serif'><span class=\"style20\"><br> " +
			"<strong>For All Billing Questions, Please Call<br> " +
			"at: " +
			"" + this.strStatementPhone + " </strong><br> " +
			"<br> " +
			"<span style=\"color: #3C5A84\"><strong>Send To:</strong></span></span><span class=\"style20\"><br> " +
			"<b>" + this.listPatientinfo.last_name.toString().toUpperCase() + ", " + this.listPatientinfo.first_name.toString().toUpperCase() + "<br> " +
			" </b> " + this.listPatientinfo.address + "<br> " +
			"  " + this.listPatientinfo.city + ", " + this.listPatientinfo.state + " " + this.listPatientinfo.zip + "<br> " +
			"   </span> " +
			"  </td> " +
			" </tr> " +
			"</table> " +
			"<td width='60%'> " +
			"<table  width='100%' border='.3' align='left'  style=\"font-family:Verdana, Arial, Helvetica, sans-serif\" style=\"font-size:8px\"  > " +
			"	<tr> " +
			"	  <td colspan=\"4\" style=\"font-family:Verdana, Arial, Helvetica, sans-serif\" style=\"font-size:6px\"><b>IF PAYING BY VISA, MASTERCARD, DISCOVER AND AMERICAN EXPRESS FILL OUT BELOW<b> </td> " +
			"	</tr> " +
			"	<tr  bgcolor=\"cee6f8\"> " +
			"	  <td><span >Visa </span></td> " +
			"	  <td><span >Master Card</span></td> " +
			"	  <td><span >Discover </span></td> " +
			"	  <td><span >American Express </span></td> " +
			"	</tr> " +
			"	<tr> " +
			"	  <td colspan='2'><span class=\"style8\">Card Number<br> " +
			"		<br> " +
			"		</span></td> " +
			"  <td colspan='1'><span class=\"style8\">Exp Date <br>" +
			"	  <br>" +
			"	  </span></td>" +
			"	  <td colspan='1'><span class=\"style8\">Amount <br> " +
			"		<br> " +
			"		</span></td> " +
			"	</tr> " +
			"	<tr> " +
			"	  <td colspan='2' ><span class=\"style8\">Signature<br> " +
			"		<br> " +
			"		</span></td> " +
			" <td colspan='2'><span class=\"style8\">Must Include 3 or 4 <br>Digit Security Code From Front<br>(Amer.Exp) or Back of card" +
			"	 <br> " +
			"	 </span></td> " +
			"	</tr> " +
			"	<tr bgcolor=\"cee6f8\"> " +
			"	  <td colspan='2' align=center style=\"color:#000000\"><span class=\"style18\">Statement Date</span></td> " +
			"	  <td align=center style=\"color:#000000\"><span class=\"style18\">Pay This Amount</span></td> " +
			"	  <td align=center style=\"color:#000000\"><span class=\"style18\">Account No</span></td> " +
			"	</tr> " +
			"	<tr> " +
			"	  <td colspan='2' align=center  ><span class=\"style8\">" + this.dateTimeUtilL.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY) + "</span></td> " +
			"	  <td align=center><span class=\"style8\">@DUE</span></td> " +
			"	  <td   align='center'  ><span class=\"style8\">" + this.listPatientinfo.alternate_account + "</span></td> " +
			"	</tr> " +
			"	<tr> " +
			"	  <td colspan='4'   style=\"color:#FF0000\"><span class=\"style6\">Changes And Credits Made After Statement Date Will Appear On Next Statement</span></td> " +
			"	</tr> " +
			"</table> " +

			"<table  width='100%' border='0' align='right' cellpadding='0' cellspacing='0' > " +
			"<tr>" +
			"<td  align='left'  " +
			"<span style=\"color: #3C5A84\"><strong>Remit To:</strong></span><span class=\"style20\"></span>" +
			"</tr>" +
			"<tr> " +
			" <td style='font-size: 10pt; font-family:Verdana, Arial, Helvetica, sans-serif' align='center'><strong>" + this.lookupList.practiceInfo.practiceName + "</strong></td> " +
			"</tr> " +
			"<tr> " +
			"  <td style='font-size: 10pt; font-family:Verdana, Arial, Helvetica, sans-serif' align='center'  >" + address + "</td> " +
			" </tr> " +
			"  <tr> " +
			"     <td style='font-size: 10pt; font-family:Verdana, Arial, Helvetica, sans-serif' align='center'  >" + citystateZip + "</td> " +
			"    </tr> " +
			"   </table> " +
			"  </td> " +
			" </tr> " +
			"</table> " +
			"<br><table align=\"center\" border='0'>" +
			"<tr bgcolor=\"0376a8\">" +
			"<th  align=\"center\" style=\"color:#FFFFFF\"> <b><span class=\"style25\">STATEMENT </span></b></th>" +
			"</tr>" +
			"</table>" +
			"<br><table width='98%' align='center' border='.8'  cellpadding='0' cellspacing='0' style='font-family:Verdana, Arial, Helvetica, sans-serif'> " +
			" <tr bgcolor=\"cee6f8\">  " +
			"<th style= 'color:#000000' align='center'><span class=\"style24\">&nbsp; Date</span></th> " +
			"<th style= 'color:#000000' align='center'><span class=\"style24\">&nbsp; Physician</span></th> " +
			"<th style= 'color:#000000' align='center'><p class=\"style24\"><b>Procedure</b></p> </th>" +
			// "<p class=\"style24\" ><b>&nbsp; Code </b></p>  "+
			"<th style= 'color:#000000' align='center'><span class=\"style24\"><b>&nbsp; Charges </b></span></th> " +
			"<th style= 'color:#000000' align='center'><span class=\"style24\"><b>&nbsp; Total Fee </b></span></th> " +
			"<th style= 'color:#000000' align='center'><span class=\"style24\"><b>&nbsp; Credit </b></span></th>  " +
			"<th style= 'color:#000000' align='center'><span class=\"style24\"><b>&nbsp; Adjustment </b></span></th>  " +
			"<th style= 'color:#000000' align='center'><span class=\"style24\"><b>&nbsp; Balance </b></span></th>  " +
			"</tr> ";

		let listDistinct: any = new UniquePipe().transform(this.lstSelectedClaims, "claim_id");

		var totalAmtDue: Number = 0;
		for (let j = 0; j < listDistinct.length; j++) {
			var sameclaim: Boolean = false;
			var loopclaim: Boolean = false;
			for (let i = 0; i < this.listDetail.length; i++) {
				if (listDistinct[j].claim_id == this.listDetail[i].claim_id) {
					strReport += "<tr>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>" + this.listDetail[i].dos + "</td>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>" + this.listDetail[i].atten_pro_name + "</td>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>" + this.listDetail[i].proc_code + "</td>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>$" + parseFloat(this.listDetail[i].total_charges).toFixed(2) + "</td>";
					if (sameclaim == false) {
						loopclaim = true;
						strReport += "<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>$" + parseFloat(this.listDetail[i].claim_total).toFixed(2) + "</td>" +
							"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>$" + parseFloat(this.listDetail[i].amt_paid).toFixed(2) + "</td>" +
							"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>$" + parseFloat(this.listDetail[i].adjust_amount).toFixed(2) + "</td>" +
							"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>$" + parseFloat(this.listDetail[i].amt_due).toFixed(2) + "</td>";
						totalAmtDue = Number(totalAmtDue) + Number(this.listDetail[i].amt_due);
					}
					else {
						strReport += "<td align=\"center\"></td>" +
							"<td align=\"center\"></td>" +
							"<td align=\"center\"></td>" +
							"<td align=\"center\"></td>";
					}
					strReport += "</tr>";
				}
				sameclaim = loopclaim;
			}
		}
		strReport += "<tr> " +
			"<td align=\"center\"></td> " +
			"<td align=\"center\"></td> " +
			"<td align=\"center\"></td> " +
			"<td align=\"center\"></td> " +
			// "<td align=\"center\"></td> "+
			// "<td align=\"center\"></td> "+
			"<td colspan=\"3\" align=\"center\" bgcolor=\"0376a8\" style= 'color:#FFFFFF;font-style:normal; font-size:11px'><strong>Please Pay This Amount</strong></td> " +
			"<td align=\"center\" bgcolor=\"0376a8\" style= 'color:#FFFFFF;font-style:normal; font-size:11px'><strong>$ " + parseFloat(totalAmtDue.toString()).toFixed(2) + "</strong></td> " +
			"</tr> ";
		strReport += "</table>";
		strReport += "<br><table width='98%' align='center'>" +
			"<tr bgcolor=\"F5C0C2\">" +
			"<td bgcolor=\"F5C0C2\" style=\"font-family:Arial, Helvetica, sans-serif;font-size:6.5px\">" +
			this.generalOperation.ReplaceAll((this.inputForm.get("txtComments") as FormControl).value, "\n", "<br></br>") + "</br>" +
			//	txtStatementNotes.text + "<br>"+
			//"Your Insurance Has Paid Its Portion For Services Please Remit Balance Promptly.<br><br>"+
			//"Your Account Is Seriously Past Due, Please Call Our Office At "+strphone+""+

			"</td>" +
			"</tr>" +
			"</table>";
		//Aging of Statement
		strReport += "<br></br><table  width='98%' align='center' border='.8'  cellpadding='0' cellspacing='0' style='font-family:Verdana, Arial, Helvetica, sans-serif'>" +

			"<tr bgcolor='cee6f8'>" +
			"<th align=\"center\">Current</th>" +
			"<th align=\"center\">Over 30 Days</th>" +
			"<th align=\"center\">Over 60 Days</th>" +
			"<th align=\"center\">Over 90 Days</th>" +
			"<th align=\"center\">Over 120 Days</th>" +
			"</tr>	" +
			"<tr>" +
			"<td align=\"center\">$ " + parseFloat(this.total_30.toString()).toFixed(2) + "</td>" +
			"<td align=\"center\">$ " + parseFloat(this.total_60.toString()).toFixed(2) + " </td>" +
			"<td align=\"center\">$ " + parseFloat(this.total_90.toString()).toFixed(2) + "</td>" +
			"<td align=\"center\">$ " + parseFloat(this.total_120.toString()).toFixed(2) + "</td>" +
			"<td align=\"center\">$ " + parseFloat(this.total_120Plus.toString()).toFixed(2) + "</td>" +
			"</tr>" +

			"</table>";
		strReport = this.generalOperation.ReplaceAll(strReport, "@DUE", "$" + parseFloat(totalAmtDue.toString()).toFixed(2));
		let docPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientStatement");

		//strpath=docPath.getItemAt(0).upload_path +"\\"+GeneralOptions.practiceID+"\\"+ docPath.getItemAt(0).category_name+"\\";
		//var file_name:String=GeneralOptions.ReplaceAll(GeneralOptions.ReplaceAll(GeneralOptions.CurrentDateTimeString(),"/","-"),":","")+".pdf";
		//	var strinsert:String="";
		// for(var i:int=0;i<listclaims.length;i++)
		// {
		// 	if(listclaims[i].chk.toString().toUpperCase()=="TRUE")
		// 	{
		// 		strinsert+="insert into patient_statement_log(patient_id,claim_id,statement_date,generated_by,date_created,path,amt_sent) "+ 
		// 		"values ('"+patient_id+"','"+listclaims[i].claim_id+"',GETDATE(),'"+GeneralOptions.loginUser+"',GETDATE(),'@File_Name','"+parseFloat(listclaims[i].amt_due.toString()).toFixed(2)+"');";
		// 	}
		// }
		// Roclaim.HTMLTOPDF.send(strReport,strpath,file_name,strinsert,GeneralOptions.practiceID);

		//let footerText: string = "Patient: " + PatientName + "  |    DOB:" + PatientDOB;
		debugger;
		if (docPath != null && docPath.length > 0) {
			let criteria: SearchCriteria = new SearchCriteria();
			criteria.practice_id = this.lookupList.practiceInfo.practiceId;
			criteria.param_list = [
				{ name: "path", value: docPath[0].upload_path, option: "" },
				{ name: "category", value: "PatientStatement", option: "" },
				{ name: "footer", value: "", option: "" },
				{ name: "html", value: strReport, option: "" }
			];
			debugger
			this.generalService.ConvertHtmltoPDF(criteria).subscribe(
				data => {
					debugger;
					this.generated_pdf_url_temp = this.generalOperation.ReplaceAll((docPath[0].download_path + this.lookupList.practiceInfo.practiceId + "/PatientStatement/" + data['result']).toString(), "\\", "/");
					this.generated_pdf_path_temp = (docPath[0].upload_path + this.lookupList.practiceInfo.practiceId + "/PatientStatement/" + data['result']).toString();//2019/05/27/456.pdf
					this.generated_pdf_url_link = data['result'];
					for (let s = 0; s < this.lstSelectedClaims.length; s++) {
						lstSave.push(this.prepareSaveList(this.lstSelectedClaims[s], this.generated_pdf_url_link));
					}
					if (lstSave.length > 0) {
						this.claimService.saveStatementLog(lstSave).subscribe(
							data => {
							});
					}
					const modalRef = this.ngbModal.open(ReferralViewersComponent, this.lgPopUpOptions);
					modalRef.componentInstance.path_doc = this.generated_pdf_url_temp;//docPath[0].download_path+this.lookupList.practiceInfo.practiceId+"\\PatientDocuments\\temp\\"+data['result'];
					modalRef.componentInstance.width = '800px';
					modalRef.componentInstance.header = 'Patient Statement';
					modalRef.componentInstance.showButtons = false;
					let closeResult;
					modalRef.result.then((result) => {
						if (result != '') {
						}
					}, (reason) => {

					});
				},
				error => {

					error => alert(error);
				}
			)

		}
	}
	lgPopUpOptions: NgbModalOptions = {
		backdrop: 'static',
		keyboard: false,
		size: 'lg'
	};
	prepareSaveList(obj, path): ORMSavePatientStatement_log {
		let ormSave: ORMSavePatientStatement_log = new ORMSavePatientStatement_log();
		ormSave.patient_id = obj.patient_id;
		ormSave.claim_id = obj.claim_id;
		ormSave.generated_by = this.lookupList.logedInUser.user_name;
		ormSave.amt_sent = obj.amt_due;
		ormSave.path = path;

		return ormSave;

	}
	buildForm() {
		this.inputForm = this.formBuilder.group({
			txtComments: this.formBuilder.control(this.claim_message),
		}),
			this.billForm = this.formBuilder.group({
				chkbill: this.formBuilder.control(true),
			}),
			this.searchForm = this.formBuilder.group({
				txtAttorneySearch: this.formBuilder.control(""),
				txtAttorneyName: this.formBuilder.control(""),
				txtAttorneyAddress: this.formBuilder.control(""),
				txtPhoneNo: this.formBuilder.control(""),
				txtFaxNo: this.formBuilder.control(""),
			})
	}
	onPrintAttorney() {
		if (this.lstSelectedClaims != null && this.lstSelectedClaims != undefined && this.lstSelectedClaims.length > 0) {
			let selectedClaimList = "";
			for (let i = 0; i < this.lstSelectedClaims.length; i++) {
				if (selectedClaimList == "")
					selectedClaimList = this.lstSelectedClaims[i].claim_id;
				else
					selectedClaimList += "," + this.lstSelectedClaims[i].claim_id;
			}
			if (selectedClaimList != "") {
				this.showAttorneyInfo = true;
			}
		}
		else {
			GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Attorney Validation', 'Please select atleast one claim.', 'warning');
		}


	}
	showAttorneySearch = false;
	showAttorneyInfo = false;
	onAttorneySearchKeydown(event, id) {

		debugger;
		if (event.key === "Enter") {
			this.showAttorneySearch = true;
		}
		else {
			this.showAttorneySearch = false;
		}
	}
	attorneyId = '';
	addFirm(obj) {
		debugger;
		this.attorneyId = obj.attorney_id;
		(this.searchForm.get("txtAttorneySearch") as FormControl).setValue(obj.firm_name);
		(this.searchForm.get("txtAttorneyName") as FormControl).setValue(obj.name);
		(this.searchForm.get("txtAttorneyAddress") as FormControl).setValue(obj.address);
		(this.searchForm.get("txtPhoneNo") as FormControl).setValue(obj.phone);
		(this.searchForm.get("txtFaxNo") as FormControl).setValue(obj.fax);
		this.showAttorneySearch = false;
	}
	closeFirmSearch() {
		this.showAttorneySearch = false;
	}
	printAttorney() {
		if (this.attorneyId == "") {
			GeneralOperation.showAlertPopUp(this.ngbModal, 'Attorney Validation', 'Please select Attorney first.', 'warning');
			return;
		}
		this.showAttorneyInfo = false;
		if (this.lstSelectedClaims != null && this.lstSelectedClaims != undefined && this.lstSelectedClaims.length > 0) {
			let selectedClaimList = "";
			for (let i = 0; i < this.lstSelectedClaims.length; i++) {
				if (selectedClaimList == "")
					selectedClaimList = this.lstSelectedClaims[i].claim_id;
				else
					selectedClaimList += "," + this.lstSelectedClaims[i].claim_id;
			}
			if (selectedClaimList != "") {
				this.showAttorneyInfo = true;
			}

			let searchCriteria: SearchCriteria = new SearchCriteria();
			searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
			searchCriteria.param_list = [];
			searchCriteria.param_list.push({ name: "claim_id", value: selectedClaimList, option: "" });
			this.claimService.getPrintAttorneyDetail(searchCriteria).subscribe(
				data => {
					debugger;
					this.listDetail = data as Array<any>;
					this.Generate_Attorney();
				},
				error => {

				}
			);
		}
	}
	Generate_Attorney() {

		let address = "";
		let citystateZip = "";
		address = this.lookupList.practiceInfo.address1;
		citystateZip = this.lookupList.practiceInfo.city + ", " + this.lookupList.practiceInfo.state + " " + this.lookupList.practiceInfo.zip;

		let strAttorney = ''
		totalAmtDue = 0;
		strAttorney = "<table border='0' width='100%'><tr bgcolor=\"0376a8\"><th style= 'color:#FFFFFF' align='center'><p class=\"style24\" style='font-family:Trebuchet MS, Arial, Helvetica, sans-serif;'>Patient Claim Information</p></th></tr></table><table border='0' width='100%'> " +
			"<tr bgcolor='White'>" +
			"<td width='50%'>" +
			"<table  border='0'>" +
			"<tr>" +
			"<td width='424' ><p align='left'style=' font-size: 10pt; font-family:Verdana, Arial, Helvetica, sans-serif'>" +
			"<span class=\"style20\">" +
			"<strong>" + this.lookupList.practiceInfo.practiceName + "</strong> <br>" +
			"" + address + "<br>" +
			"" + citystateZip + "<br>" +
			"</span>" +
			"<br><br><p align='left' style=' font-size: 10pt; font-family:Verdana, Arial, Helvetica, sans-serif'><b>" + this.listPatientinfo.last_name.toString().toUpperCase() + ", " + this.listPatientinfo.first_name.toString().toUpperCase() + "<br>" +
			"</b>" + this.listPatientinfo.address + "<br>" + this.listPatientinfo.city + ", " + this.listPatientinfo.state + " " + this.listPatientinfo.zip +
			"</p>" +
			"</td>" +
			"</tr>" +
			"<tr>" +
			"<td width='424' ><p align='left'style=' font-size: 10pt; font-family:Verdana, Arial, Helvetica, sans-serif'>" +
			"<span class=\"style20\">" +
			"<strong>To:</strong><br><b>" +
			(this.searchForm.get("txtAttorneySearch") as FormControl).value + "</b><br>" + (this.searchForm.get("txtAttorneyAddress") as FormControl).value + "<br>" + ((this.searchForm.get("txtPhoneNo") as FormControl).value == "" ? "" : "Phone: " + (this.searchForm.get("txtPhoneNo") as FormControl).value) +
			"</span>" +
			"</td>" +
			"</tr>" +
			"</table>" +
			"</td>" +
			"<td width='50%'>" +
			"<table  width='100%' border='.3' align='left'  style=\"font-family:Verdana, Arial, Helvetica, sans-serif\" style=\"font-size:8px\"  >" +
			"<tr bgcolor=\"cee6f8\">" +
			"<td colspan='2' align=center style=\"color:#000000\"><span class=\"style18\"><b>Account No.</b></span></td>" +
			"<td align=center style=\"color:#000000\"><span class=\"style18\"><b>Amount Due</b></span></td>" +
			"<td align=center style=\"color:#000000\"><span class=\"style18\"><b>Date</b></span></td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='2' align=center  >" +
			"<span class=\"style8\">" + this.listPatientinfo.alternate_account + "</span></td>" +
			"<td  align=center  ><span class=\"style8\">@DUE</span></td>" +
			"<td   align='center'  >" +
			"<span class=\"style8\">" + this.dateTimeUtilL.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY) + "</span></td>" +
			"</tr>" +
			"<tr bgcolor=\"cee6f8\">" +
			"<td colspan='6' align=left style=\"color:#000000\"><span class=\"style18\"><b>Primary Physician</b></span></td>" +
			"</tr>" +
			"<tr>" +
			"<td colspan='6' align=left ><span class=\"style8\">" + (this.listDetail[0].primary_provider == null ? "--" : this.listDetail[0].primary_provider) + "</span></td>" +
			"</tr>" +
			//							  "<tr bgcolor=\"7896C1\">"+
			//							    "<td colspan='6' align=left style=\"color:#FFFFFF\"><span class=\"style18\"><b>Insurance</b></span></td>"+
			//							  "</tr>"+
			//							  "<tr>"+
			//							    "<td colspan='6' align=left  ><span class=\"style8\">"+listDetail[0].insurance+"</span></td>"+
			//							  "</tr>"+
			"</table>" +
			"</td>" +
			"</tr>" +
			"</table>" +
			"<br>" +
			"<table width='100%' align='center' border='.8'  cellpadding='0' cellspacing='0' style='font-family:Verdana, Arial, Helvetica, sans-serif'>" +
			"<tr bgcolor=\"0376a8\">" +
			"<th style= 'color:#FFFFFF' align='center'><span class=\"style24\"><b>Detail</b></span></th>" +
			"</tr>" +
			"</table>" +
			"<table width='100%' align='center' border='.8'  cellpadding='0' cellspacing='0' style='font-family:Verdana, Arial, Helvetica, sans-serif'>" +
			"<tr bgcolor=\"cee6f8\">    " +
			"<th style= 'color:#000000' align='center'><span class=\"style24\">&nbsp; Date</span></th>" +
			"<th style= 'color:#000000' align='center'><span class=\"style24\">&nbsp; Physician</span></th>" +
			"<th style= 'color:#000000' align='center'><p class=\"style24\">Proc Code</p></th>" +
			"<th style= 'color:#000000' align='center'><p class=\"style24\">Proc Desc</p></th>" +
			"<th style= 'color:#000000' align='center'><p class=\"style24\">Diag</p></th>" +
			"<th style= 'color:#000000' align='center'><span class=\"style24\">&nbsp; Charges </span></th>" +
			"<th style= 'color:#000000' align='center'><span class=\"style24\">&nbsp; Total Fee </span></th>" +
			//As Per Waqar
			//							"<th style= 'color:#FFFFFF' align='center'><span class=\"style24\">&nbsp; Credit </span></th>"+
			//							"<th style= 'color:#FFFFFF' align='center'><span class=\"style24\">&nbsp; Adjustment </span></th>"+
			"<th style= 'color:#000000' align='center'><span class=\"style24\">&nbsp; Balance </span></th>" +
			"</tr>";


		let listDistinct: any = new UniquePipe().transform(this.lstSelectedClaims, "claim_id");
		var totalAmtDue: Number = 0;
		for (var j = 0; j < listDistinct.length; j++) {
			var sameclaim: Boolean = false;
			var loopclaim: Boolean = false;
			for (let i = 0; i < this.listDetail.length; i++) {
				if (listDistinct[j].claim_id == this.listDetail[i].claim_id) {
					strAttorney += "<tr>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>" + this.listDetail[i].dos + "</td>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>" + this.listDetail[i].atten_pro_name + "</td>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>" + this.listDetail[i].proc_code + "</td>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>" + this.listDetail[i].proc_desc + "</td>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'>" + this.listDetail[i].diag_code + "</td>" +
						"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'> $" + parseFloat(this.listDetail[i].total_charges).toFixed(2) + "</td>";
					if (sameclaim == false) {
						loopclaim = true;
						strAttorney += "<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'> $" + parseFloat(this.listDetail[i].claim_total).toFixed(2) + "</td>" +
							//								    "<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'> $"+parseFloat(listDetail[i].amt_paid).toFixed(2)+"</td>"+
							//								    "<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'> $"+parseFloat(listDetail[i].adjust_amount).toFixed(2)+"</td>"+
							"<td align=\"center\" style= 'color:10294E;font-style:normal; font-size:9px'> $" + parseFloat(this.listDetail[i].amt_due).toFixed(2) + "</td>";
						totalAmtDue = Number(totalAmtDue) + Number(this.listDetail[i].amt_due);
					}
					else {
						strAttorney += "<td align=\"center\"></td>" +
							"<td align=\"center\"></td>";
					}
					strAttorney += "</tr>";
				}
				sameclaim = loopclaim;
			}
		}
		strAttorney += "<tr>" +
			"<td align=\"center\"></td>" +
			"<td align=\"center\"></td>" +
			"<td align=\"center\"></td>" +
			"<td align=\"center\"></td>" +
			"<td align=\"center\"></td>" +
			"<td align=\"center\"></td>" +
			"<td align=\"center\" bgcolor=\"0376a8\" style= 'color:#FFFFFF;font-style:normal; font-size:9px'><strong>Amount Due:</strong></td>" +
			"<td align=\"center\" bgcolor=\"0376a8\" style= 'color:#FFFFFF;font-style:normal; font-size:9px'><strong>$ " + parseFloat(totalAmtDue.toString()).toFixed(2) + "</strong></td>" +
			"</tr>" +
			"</table>" +
			"<br>";
		var aging_30: Number = 0;
		var aging_60: Number = 0;
		var aging_90: Number = 0;
		var aging_120: Number = 0;
		var aging_120Plus: Number = 0;

		listDistinct = new UniquePipe().transform(this.lstSelectedClaims, "claim_id");
		for (j = 0; j < listDistinct.length; j++) {
			sameclaim = false;
			loopclaim = false;
			for (var ag = 0; ag < this.listDetail.length; ag++) {
				if (listDistinct[j].claim_id == this.listDetail[ag].claim_id) {
					if (sameclaim == false) {
						loopclaim = true;
						aging_30 = Number(aging_30) + Number(this.listDetail[ag].aging_30);
						aging_60 = Number(aging_60) + Number(this.listDetail[ag].aging_60);
						aging_90 = Number(aging_90) + Number(this.listDetail[ag].aging_90);
						aging_120 = Number(aging_120) + Number(this.listDetail[ag].aging_120);
						aging_120Plus = Number(aging_120Plus) + Number(this.listDetail[ag].aging_120_plus);
					}
				}
				sameclaim = loopclaim;
			}
		}
		strAttorney += "<table width='100%' align='left' border='.8'  >" +
			"<tr bgcolor=\"F5C0C2\">" +
			"<th  align='center'><span class=\"style24\">&nbsp; Account No</span></th>" +
			"<th  align='center'><span class=\"style24\">&nbsp; Current</span></th>  " +
			"<th  align='center'><span class=\"style24\">&nbsp; 31-60</span></th>  " +
			"<th  align='center'><span class=\"style24\">&nbsp; 61-90</span></th>  " +
			"<th  align='center'><span class=\"style24\">&nbsp; 91-120</span></th>  " +
			"<th  align='center'><span class=\"style24\">&nbsp; Over 120</span></th>  " +
			"</tr>" +
			"<tr>" +
			"<td align=\"center\">" + this.listPatientinfo.alternate_account + "</td>" +
			"<td align=\"center\"> $" + parseFloat(aging_30.toString()).toFixed(2) + "</td>" +
			"<td align=\"center\"> $" + parseFloat(aging_60.toString()).toFixed(2) + "</td>" +
			"<td align=\"center\"> $" + parseFloat(aging_90.toString()).toFixed(2) + "</td>" +
			"<td align=\"center\"> $" + parseFloat(aging_120.toString()).toFixed(2) + "</td>" +
			"<td align=\"center\"> $" + parseFloat(aging_120Plus.toString()).toFixed(2) + "</td>" +
			"</tr>" +
			"</table>";
		if ((this.inputForm.get("txtComments") as FormControl).value != "") {
			strAttorney += "<br><table width='50%' align='left'>" +
				"<tr bgcolor=\"F5C0C2\">" +
				"<td bgcolor=\"F5C0C2\" style=\"font-family:Arial, Helvetica, sans-serif;font-size:6.5px\">" +
				this.generalOperation.ReplaceAll((this.inputForm.get("txtComments") as FormControl).value, "\n", "<br></br>") +
				"</td>" +
				"</tr>" +
				"</table>";
		}

		strAttorney = this.generalOperation.ReplaceAll(strAttorney, "@DUE", "$" + parseFloat(totalAmtDue.toString()).toFixed(2));
		let docPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientStatement");
		let lstSave: Array<ORMSavePatientAttorney_log> = new Array;
		debugger;
		if (docPath != null && docPath.length > 0) {
			let criteria: SearchCriteria = new SearchCriteria();
			criteria.practice_id = this.lookupList.practiceInfo.practiceId;
			criteria.param_list = [
				{ name: "path", value: docPath[0].upload_path, option: "" },
				{ name: "category", value: "PatientStatement", option: "" },
				{ name: "footer", value: "", option: "" },
				{ name: "html", value: strAttorney, option: "" }
			];
			debugger
			this.generalService.ConvertHtmltoPDF(criteria).subscribe(
				data => {
					debugger;
					this.generated_pdf_url_temp = this.generalOperation.ReplaceAll((docPath[0].download_path + this.lookupList.practiceInfo.practiceId + "/PatientStatement/" + data['result']).toString(), "\\", "/");
					this.generated_pdf_path_temp = (docPath[0].upload_path + this.lookupList.practiceInfo.practiceId + "/PatientStatement/" + data['result']).toString();//2019/05/27/456.pdf
					this.generated_pdf_url_link = data['result'];
					for (let s = 0; s < this.lstSelectedClaims.length; s++) {
						lstSave.push(this.prepareAttorneyLog(this.lstSelectedClaims[s], this.generated_pdf_url_link));
					}
					if (lstSave.length > 0) {
						this.claimService.saveAttorneyLog(lstSave).subscribe(
							data => {
							});
					}
					this.activeModal.dismiss('Cross click')
					const modalRef = this.ngbModal.open(ReferralViewersComponent, this.lgPopUpOptions);
					modalRef.componentInstance.path_doc = this.generated_pdf_url_temp;//docPath[0].download_path+this.lookupList.practiceInfo.practiceId+"\\PatientDocuments\\temp\\"+data['result'];
					modalRef.componentInstance.width = '800px';
					modalRef.componentInstance.header = 'Patient Attorney';
					modalRef.componentInstance.showButtons = false;
					let closeResult;
					modalRef.result.then((result) => {
						if (result != '') {
						}
					}, (reason) => {

					});
				},
				error => {

					error => alert(error);
				}

			)

		}

		// var iframe: mIframe = new mIframe();
		// iframe.CallingFrom = "PatientStatement";
		// iframe.PatientStatement(strAttorney);
		// strpath = docPath.getItemAt(0).upload_path + "\\" + GeneralOptions.practiceID + "\\" + docPath.getItemAt(0).category_name + "\\";
		// var file_name: String = GeneralOptions.ReplaceAll(GeneralOptions.ReplaceAll(GeneralOptions.CurrentDateTimeString(), "/", "-"), ":", "") + ".pdf";
		// for (var i: int = 0; i < listclaims.length; i++) {
		// 	if (listclaims[i].chk.toString().toUpperCase() == "TRUE") {
		// 		var strinsert: String = "insert into claim_attorney_log (patient_id,claim_id,attorney_id,date,created_user,path) " +
		// 			"values ('" + patient_id + "','" + listclaims[i].claim_id + "','" + AttorneryID + "',GETDATE(),'" + GeneralOptions.loginUser + "','@File_Name')";


		// 	}
		// }
		// Roclaim.HTMLTOPDF.send(strAttorney, strpath, file_name, strinsert, GeneralOptions.practiceID);
	}


	prepareAttorneyLog(obj, path): ORMSavePatientAttorney_log {
		let ormSave: ORMSavePatientAttorney_log = new ORMSavePatientAttorney_log();
		ormSave.patient_id = obj.patient_id;
		ormSave.claim_id = obj.claim_id;
		ormSave.attorney_id = this.attorneyId;
		ormSave.created_user = this.lookupList.logedInUser.user_name;
		ormSave.path = path;
		return ormSave;
	}
	strStatement_path = '';
	showDownload = false;
	onGateWayStatement() {
		this.strStatement_path = '';
		this.showDownload = false;
		debugger;
		if (this.lstSelectedClaims != null && this.lstSelectedClaims != undefined && this.lstSelectedClaims.length > 0) {
		}
		else{
			GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Statement Validation', 'Please select atleast one claim.', 'warning')
			return;
		}
		let listStatementClaim = new Array<any>();
		if (this.lstClaim != null && this.lstClaim != undefined && this.lstClaim.length > 0) {
			for (let i = 0; i < this.lstSelectedClaims.length; i++) {
				for (var jj = 0; jj < this.lstClaim.length; jj++) {
					if (this.lstSelectedClaims[i].claim_id == this.lstClaim[jj].claim_id) {
						//if (this.lstClaim[jj].chk == true) 
						{
							let objOrm = new ORMspGetPatientClaims;
							objOrm.claim_id = this.lstClaim[jj].claim_id;
							objOrm.patient_id = this.lstClaim[jj].patient_id;
							objOrm.alternate_account = this.lstClaim[jj].alternate_account;
							objOrm.pat_name = this.lstClaim[jj].pat_name;
							objOrm.last_name = this.lstClaim[jj].last_name;
							objOrm.first_name = this.lstClaim[jj].first_name;
							objOrm.pat_address = this.lstClaim[jj].pat_address;
							objOrm.pat_zip = this.lstClaim[jj].pat_zip;
							objOrm.pat_city = this.lstClaim[jj].pat_city;
							objOrm.pat_state = this.lstClaim[jj].pat_state;

							objOrm.practice_name = this.lstClaim[jj].practice_name;
							objOrm.practice_id = this.lookupList.practiceInfo.practiceId.toString();
							objOrm.prac_address = this.lstClaim[jj].prac_address;
							objOrm.prac_zip = this.lstClaim[jj].prac_zip;
							objOrm.prac_city = this.lstClaim[jj].prac_city;
							objOrm.prac_state = this.lstClaim[jj].prac_state;
							objOrm.prac_phone = this.strStatementPhone;//this.lstClaim[jj].prac_phone;
							objOrm.chk = this.lstClaim[jj].chk;
							objOrm.dos = this.lstClaim[jj].dos;
							objOrm.claim_total = this.lstClaim[jj].claim_total;
							objOrm.pri_paid = this.lstClaim[jj].pri_paid;
							objOrm.sec_paid = this.lstClaim[jj].sec_paid;
							objOrm.write_off = this.lstClaim[jj].write_off;
							objOrm.discount = this.lstClaim[jj].discount;
							objOrm.amt_paid = this.lstClaim[jj].amt_paid;
							objOrm.risk_amount = this.lstClaim[jj].risk_amount;
							objOrm.adjust_amount = this.lstClaim[jj].adjust_amount;
							objOrm.patient_paid = this.lstClaim[jj].patient_paid;
							objOrm.amt_due = this.lstClaim[jj].amt_due;
							objOrm.statement_date = this.lstClaim[jj].statement_date;
							objOrm.patient_statement_days = this.lstClaim[jj].patient_statement_days;
							objOrm.statement_count = this.lstClaim[jj].statement_count;
							objOrm.pat_due = this.lstClaim[jj].pat_due;
							objOrm.facility_name = this.lstClaim[jj].facility_name;
							objOrm.pos_name = this.lstClaim[jj].pos_name;
							objOrm.billing_first_name = this.lstClaim[jj].billing_first_name;

							objOrm.billing_last_name = this.lstClaim[jj].billing_last_name;
							objOrm.prov_name = this.lstClaim[jj].prov_name;
							objOrm.billing_physician = this.lstClaim[jj].billing_physician;
							objOrm.facility_id = this.lstClaim[jj].facility_id;
							objOrm.insurance_name = this.lstClaim[jj].insurance_name;
							objOrm.statement_message =  (this.inputForm.get("txtComments") as FormControl).value;
							objOrm.adv_paid = this.lstClaim[jj].adv_paid;
							objOrm.deductable_amt = this.lstClaim[jj].deductable_amt;
							objOrm.coinsurance_amt = this.lstClaim[jj].coinsurance_amt;
							objOrm.copay_amt = this.lstClaim[jj].copay_amt;
							objOrm.loc_name = this.lstClaim[jj].loc_name;
							objOrm.pat_statement = this.lstClaim[jj].pat_statement;
							objOrm.atten_pro_name = this.lstClaim[jj].atten_pro_name;
							objOrm.self_pay = this.lstClaim[jj].self_pay;
							objOrm.user = this.lookupList.logedInUser.user_name;
							objOrm.system_ip = this.lookupList.logedInUser.systemIp;
							listStatementClaim.push(objOrm);
						}
					}
				}
			}
			this.isLoading=true;
			this.claimService.generateStatement(listStatementClaim).subscribe(
				data => {
					debugger;
					if (data != '') {
						this.strStatement_path = data['result'].toString();
						this.showDownload = true;
					}
					this.isLoading=false;
				},
				error => {
					this.isLoading=false;
				}
			);
		}
		else {
			GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Statement Validation', 'Please select atleast one claim.', 'warning')
		}
	}
	downloadPath = '';
	uploadPath = '';
	onDownload() {
		if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
			let lstDocPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientStatement");
			if (lstDocPath.length > 0) {
				this.downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientStatement";
				this.uploadPath = lstDocPath[0].download_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientStatement";
			}
			else {
				this.downloadPath = '';
			}
		}
		let searchCriteria: SearchCriteria = new SearchCriteria;
		searchCriteria.criteria = this.downloadPath + "/" + this.strStatement_path;
		this.generalService.downloadFile(searchCriteria)
			.subscribe(
				data => {
					debugger;
					//this.isLoading = false;
					this.downloafile(data, this.strStatement_path, "PatientStatement_" + this.dateTimeUtilL.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
				},
				error => {
					alert(error);
					/// this.isLoading = false;
				}
			);
	}
	downloafile(data, doc_link, name) {
		let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
		let file_type: string = '';
		switch (file_ext.toLowerCase()) {

			case 'xml':
				file_type = 'text/plain';
				break;
		}
		var fileURL;
		var file = new Blob([data], { type: file_type });
		FileSaver.saveAs(file, name + "." + file_ext);
	}
}
