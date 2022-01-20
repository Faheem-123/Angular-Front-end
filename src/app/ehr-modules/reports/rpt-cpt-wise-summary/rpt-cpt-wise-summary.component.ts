import { Component, OnInit, Inject } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ReportsService } from 'src/app/services/reports.service';
import { LogMessage } from 'src/app/shared/log-message';
import { excelService } from 'src/app/shared/excelService';

@Component({
  selector: 'rpt-cpt-wise-summary',
  templateUrl: './rpt-cpt-wise-summary.component.html',
  styleUrls: ['./rpt-cpt-wise-summary.component.css']
})
export class RptCptWiseSummaryComponent implements OnInit {
  CPTwiseSummaryReportForm:FormGroup;
  dateFromCPTWise;
  dateToCPTWise;
  cptSearchValue;
  selectedRow;
  
  lstCPTwiseSummary: Array<any>;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,private logMessage: LogMessage,
  private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil,private reportsService: ReportsService,
  private modalService: NgbModal,private excel: excelService) { }

  ngOnInit(){
    this.buildForm();
  }
  buildForm() {
    debugger;
		this.CPTwiseSummaryReportForm = this.formBuilder.group({
      cmbMonthsdaywise: this.formBuilder.control(null, Validators.required),
      txtYeardaywise: this.formBuilder.control(this.dateTimeUtil.getDateTimeFormatedString(this.dateTimeUtil.getCurrentDateTimeDate(),DateTimeFormat.DATEFORMAT_YYYY))
     })
  }
  ngAfterViewInit(){
    let month = this.dateTimeUtil.getCurrentDateTimeDate();
    let fmonth;
    if(Number(month.getMonth())+Number(1) < 10)
      fmonth = "0"+ month.getMonth();
    else
      fmonth = Number(month.getMonth()) + Number(1);

    (this.CPTwiseSummaryReportForm.get("cmbMonthsdaywise") as FormControl).setValue(fmonth.toString());
  }
  searchEncCountRpt(){
    if ((this.CPTwiseSummaryReportForm.get('cmbMonthsdaywise') as FormControl).value < 0) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Month Selection', "Pleae select Month.", AlertTypeEnum.WARNING);
      return;
    }
    if ((this.CPTwiseSummaryReportForm.get('txtYeardaywise') as FormControl).value == "" || (this.CPTwiseSummaryReportForm.get('txtYeardaywise') as FormControl).value == null || (this.CPTwiseSummaryReportForm.get('txtYeardaywise') as FormControl).value.length != 4) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Year Selection', "Please enter 4 digit Year.", AlertTypeEnum.WARNING);
      return;
    }
    if ((this.CPTwiseSummaryReportForm.get('cmbMonthsdaywise') as FormControl).value == 0)
      this.cptSearchValue = (this.CPTwiseSummaryReportForm.get('txtYeardaywise') as FormControl).value
    else
      this.cptSearchValue = (this.CPTwiseSummaryReportForm.get('txtYeardaywise') as FormControl).value + (this.CPTwiseSummaryReportForm.get('cmbMonthsdaywise') as FormControl).value;

    //var d: Date = new Date((this.CPTwiseSummaryReportForm.get('txtYeardaywise') as FormControl).value, (this.CPTwiseSummaryReportForm.get('cmbMonthsdaywise') as FormControl).value, 0);
    //var toNoOfDays = d.getDate();
    //this.dateToCPTWise = (this.CPTwiseSummaryReportForm.get('cmbMonthsdaywise') as FormControl).value + "/" + toNoOfDays + "/" + (this.CPTwiseSummaryReportForm.get('txtYeardaywise') as FormControl).value; // get to date
    //this.dateFromCPTWise = (this.CPTwiseSummaryReportForm.get('cmbMonthsdaywise') as FormControl).value + "/01/" + (this.CPTwiseSummaryReportForm.get('txtYeardaywise') as FormControl).value; // get from date

    let CPTWiseCollSearch: SearchCriteria = new SearchCriteria();
    CPTWiseCollSearch.practice_id = this.lookupList.practiceInfo.practiceId;
    CPTWiseCollSearch.param_list = [];
    CPTWiseCollSearch.param_list.push({ name: "cptSearchValue", value: this.cptSearchValue, option: "" });
    if ((this.CPTwiseSummaryReportForm.get('cmbMonthsdaywise') as FormControl).value == 0)
        CPTWiseCollSearch.param_list.push({ name: "fullyear", value: "1", option: "" });
    else
      CPTWiseCollSearch.param_list.push({ name: "fullyear", value: "0", option: "" });

    //CPTWiseCollSearch.param_list.push({ name: "dateFromCPTWise", value: this.dateFromCPTWise, option: "" });
    //CPTWiseCollSearch.param_list.push({ name: "dateToCPTWise", value: this.dateToCPTWise, option: "" });
    debugger;
    this.reportsService.getProcedureSummaryReport(CPTWiseCollSearch).subscribe(
      data => {
        debugger;
        this.lstCPTwiseSummary = data as Array<any>;
      },
      error => {
        this.getProcedureSummaryReportError(error);
        return;
      }
    );

  }
  getProcedureSummaryReportError(error) {
    this.logMessage.log("getProcedureSummaryReportError Error." + error);
  }
  onSelectionChange(row){
    this.selectedRow = row.proc_code;
  }
  print() {
    debugger;
    let strCriteria="";
    if ((this.CPTwiseSummaryReportForm.get('cmbMonthsdaywise') as FormControl).value == 0)
    {
      strCriteria="Year To Date";
    }
    else{
      strCriteria = (this.CPTwiseSummaryReportForm.get('txtYeardaywise') as FormControl).value + (this.CPTwiseSummaryReportForm.get('cmbMonthsdaywise') as FormControl).value;
    }
    if(this.lstCPTwiseSummary!=undefined && this.lstCPTwiseSummary.length>0){
      
      
      let strHtml: string = "";
      let sNo:String = "0";
  
      strHtml += "<html>" +
        "<head>" +
        "<title>CPT Wise Summary Report</title>" +
        "<style>" +
        ".styleTopHeader {	font-family: Calibri;	font-weight: bold;	font-size: 18px; color:#0376a8;}" +
        ".styleTopSubHeader {	font-family: Calibri;	font-weight: bold;	font-size: 13px; color:#0376a8;}" +
        "#customers{font-size:11px;font-family:Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;}" +
        "#customers td, #customers th {border:1px solid #0376a8;padding:3px 7px 2px 7px;}" +
        "#customers th {font-size:1.4em;text-align:left;padding-top:5px;padding-bottom:4px;background-color:#A7C942;color:#fff;}" +
        "#el08 {	width:1.2em;	height:1.2em;} " +
        "</style>" +
        "</head>" +
        "<body>" +
        "<table width='750' border='0' cellpadding='0' cellspacing='0'>" +
        "<tr>" +
        "	<td colspan='2' width='100%' align='center' valign='top'><span class='styleTopHeader'>" + this.lookupList.practiceInfo.practiceName + "</span></td>" +
        "  </tr>" +
        "  </table>" +
        "<table width='750' border='0' cellpadding='0' cellspacing='0' id='customers'>" +
        "<tbody>" +
        "	<td align='center' colspan='6' style='background-color: #0376a8; color:#ffffff; font-weight:bold;font-size:16px'>CPT Wise Payment Summary  "+strCriteria+"</td>" +
        " </tbody>" +
        "</table>" +
        "<table id='customers' width='750' border='0' cellpadding='0' cellspacing='0'>" +
        "<tr style='background-color: #cee6f8; color:#000000; font-weight:bold;'>" +
        "<td width='20'></td>" +
        "<td width='45'>Procedure</td>" +
        "<td>Description</td>" +
        "<td>Procedure Count</td>" +
        "<td>Charges</td>" +
        "<td>Paid</td>" +
        "</tr>" +
        "<tbody>";
      for (let i = 0; i < this.lstCPTwiseSummary.length; i++) {
        sNo = (i+1).toString();
        strHtml += "<tr>";
        strHtml += "<td>" + sNo + "</td>";
        strHtml += "<td>" + this.lstCPTwiseSummary[i].proc_code + "</td>";
        strHtml += "<td>" + this.lstCPTwiseSummary[i].description + "</td>";
        strHtml += "<td>" + this.lstCPTwiseSummary[i].proc_count + "</td>";
        strHtml += "<td>" + this.lstCPTwiseSummary[i].total_charges + "</td>";
        strHtml += "<td>" + this.lstCPTwiseSummary[i].paid_amount + "</td>";
        strHtml += "</tr>";
      }
      strHtml += "</tbody>";
      strHtml += "</table>";
      strHtml += "</body>";
      strHtml += "</html>";
  
      let disp_setting = "toolbar=yes,location=no,directories=yes,menubar=yes,";
      disp_setting += "scrollbars=yes,width=790,  left=100, top=25";
      var w = window.open("", "", disp_setting);
      w.document.open();
      w.document.write(strHtml);
      w.document.close();
      w.focus();
    }else{
      GeneralOperation.showAlertPopUp(this.modalService, 'Print', "No record to print.", AlertTypeEnum.WARNING);
      return;
    }
  }
  exportAsXLSX(){
    this.excel.exportAsExcelFile(this.lstCPTwiseSummary, 'proc_code,description,proc_count,total_charges,paid_amount', 'rptCptWiseSummary')
  }
}