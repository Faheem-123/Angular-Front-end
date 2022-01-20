import { Injectable, Inject } from "@angular/core";
import { DocumentViewerComponent } from '../../general-modules/document-viewer/document-viewer.component';
import { NgbModalOptions, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LookupList, LOOKUP_LIST } from "src/app/providers/lookupList.module";
import { GeneralOperation } from "src/app/shared/generalOperation";
import { EncounterPrintViewerComponent } from "src/app/general-modules/encounter-print-viewer/encounter-print-viewer.component";
import { LabService } from "src/app/services/lab/lab.service";


@Injectable()
export class Rptlabresults_Print {

    //#region Style
    style =
        '.styleTopHeader {	font-family: Calibri;	font-weight: bold;	font-size: 18px; color:#0376a8;}' +
        '.styleTopSubHeader {	font-family: Calibri;	font-weight: bold;	font-size: 13px; color:#0376a8;}' +
        '.styleMainHeading {font-family: Calibri; font-weight: bold; font-size: 14px; color:#0376a8;} ' +
        '.styleNormal {font-size: 12px; font-family: Calibri;} ' +
        '.styleSubHeading {	font-family: Calibri;	font-size: 13px;	font-weight: bold;} ' +
        '.customers{font-size:11px;font-family:Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;}' +
        '.customers td, .customers th {border:1px solid #0376a8;padding:3px 7px 2px 7px;} ' +
        '.customers th {font-size:1.4em;text-align:left;padding-top:5px;padding-bottom:4px;background-color:#0376a8;color:#fff;}  ' +
        '.el08 {	width:1.2em;	height:1.2em;} ' +
        '.styleAbnormal {font-family: Calibri;font-size: 12px;font-weight: bold; color:#C5381C;}  ';
    //#endregion

    poupUpOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        size: 'lg'
    };


    order_id;
    acRptLabHeader;
    acRptOrderTest;
    acRptResultTest;
    //acRptSpecTest;
    acRptDirTest;
    acRptSourceVolumeTest;

    strHtmlString: string = "";
    strHTMLHeadder: string = "";
    strOrderTest: string = "";
    strSpecTest: string = "";
    strLabDirTest: string = "";
    strSourceVolumeTest: string = "";
    strpid_comment: String = "";
    strorder_comment: String = "";
    Spec_Volume: String = "";

    constructor(private labService: LabService,
        private generalOperation: GeneralOperation,
        @Inject(LOOKUP_LIST) public lookupList: LookupList,
        private modalService: NgbModal) { }

    print_callBack = 0;
    getLabResultRpt() {
        this.print_callBack = 0;
        this.getLabResultRptHeader();
        this.print_callBack++;
        this.getOrderTest();
        this.print_callBack = this.print_callBack + 1;

        this.getResult();
        this.print_callBack = this.print_callBack + 1;
        //this.getSpec();
        //this.print_callBack = this.print_callBack + 1;
        this.getLabDir();
        this.print_callBack = this.print_callBack + 1;
        this.getSourceVolume();
        this.print_callBack = this.print_callBack + 1;
    }
    getLabResultRptHeader() {
        this.labService.getLabResultRptHeader(this.order_id)
            .subscribe(
                data => {
                    this.acRptLabHeader = data;
                    this.isDataLoaded();
                },
                error => alert(error)
            );
    }
    getOrderTest() {
        this.labService.getLabRptOrderTest(this.order_id)
            .subscribe(
                data => {
                    this.acRptOrderTest = data;
                    this.isDataLoaded();
                },
                error => alert(error)
            );
    }
    getResult() {
        this.labService.getLabOrderResult(this.order_id)
            .subscribe(
                data => {
                    this.acRptResultTest = data;
                    this.isDataLoaded();
                },
                error => alert(error)
            );
    }
    // getSpec() {
    //     this.phrService.getLabRptOrderSpec(this.order_id)
    //     .subscribe(
    //         data => {
    //             this.acRptSpecTest = data;
    //                this.isDataLoaded();
    //         },
    //         error => alert(error)
    //     );
    // }
    getLabDir() {
        this.labService.getLabRptOrderDir(this.order_id)
            .subscribe(
                data => {
                    this.acRptDirTest = data;
                    this.isDataLoaded();
                },
                error => alert(error)
            );
    }
    getSourceVolume() {
        this.labService.getLabRptOrderSourceVolume(this.order_id)
            .subscribe(
                data => {
                    this.acRptSourceVolumeTest = data;
                    this.isDataLoaded();
                },
                error => alert(error)
            );
    }


    isDataLoaded() {
        this.print_callBack--;
        if (this.print_callBack == 0) {
            this.ComposeHtml();
            debugger;
            const modalRef = this.modalService.open(EncounterPrintViewerComponent, this.poupUpOptions);
            modalRef.componentInstance.print_html = this.generalOperation.ReplaceAll(this.generalOperation.ReplaceAll(this.generalOperation.ReplaceAll(this.generalOperation.ReplaceAll(this.strHtmlString, "NaN", ""), "undefined", ""), "null", ""), null, "");
            modalRef.componentInstance.print_style = this.style;
            modalRef.componentInstance.header = 'Patient Lab Test Result';
            modalRef.componentInstance.callingModule = 'order';
            modalRef.componentInstance.module_id = this.order_id;
        }

    }
    ComposeHtml() {
        debugger
        if (this.acRptSourceVolumeTest != null && this.acRptSourceVolumeTest.length > 0) {
            this.Spec_Volume = this.acRptSourceVolumeTest[0].id;
        }
        if (this.acRptLabHeader.length > 0) {
            if (this.acRptLabHeader[0].pid_comment != null && this.acRptLabHeader[0].pid_comment != "") {
                this.strpid_comment = this.acRptLabHeader[0].pid_comment;
            }
            if (this.acRptLabHeader[0].order_comment != null && this.acRptLabHeader[0].order_comment != "") {
                this.strorder_comment = this.acRptLabHeader[0].order_comment;
            }
        }
        this.strHTMLHeadder = "";
        this.strHTMLHeadder = this.strHTMLHeadder + "<div>" +
            "<table width='100%' border='0' cellpadding='0' cellspacing='0' >" +
            "<tr>" +
            "<td align='center' colspan='2' width='100%' valign='top'  style='font-size:20px;color:#0376a8;'><b>" + this.lookupList.practiceInfo.practiceName.toUpperCase() + "</b></td>" +//+GeneralOptions.acPracticeInfo.getItemAt(0).practice_name+
            "</tr>";
        if (this.acRptLabHeader[0].lab_name.toString().toUpperCase() == "DYNACARE") {
            this.strHTMLHeadder = this.strHTMLHeadder + "<tr>" +
                "<td  align='left' width='100%' valign='top' style='font-size:28px'><b>Dynacare</b></td>" +
                "</tr>";
        }
        else if (this.acRptLabHeader[0].lab_name.toString().toUpperCase() == "WDL") {
            this.strHTMLHeadder = this.strHTMLHeadder + "<tr>" +
                "<td  align='left' width='100%' valign='top' style='font-size:28px'><b>Wisconsin Diagnostic Laboratories</b></td>" +
                "</tr>";
        }
        else if (this.acRptLabHeader[0].lab_name.toString().toUpperCase() == "LABCORP") {
            this.strHTMLHeadder = this.strHTMLHeadder + "<tr>" +
                "<td  align='left' width='100%' valign='top' style='font-size:28px'><b>LabCorp</b></td>" +
                "</tr>" +
                "<tr>" +
                "<td  align='Left' width='100%' valign='top' style='font-size:8px'><b>Laboratory Corporation of America</b></td>" +
                "</tr>";
        }
        else {
            this.strHTMLHeadder = this.strHTMLHeadder + "<tr>" +
                "<td  align='left' width='100%' valign='top' style='font-size:28px'><b>" + this.acRptLabHeader[0].lab_name.toString().toUpperCase() + "</b></td>" +
                "</tr>";
        }
        this.strHTMLHeadder = this.strHTMLHeadder + "</table>" +
            "</div>" +
            "<table width='100%' border='0' cellpadding='0' cellspacing='0' class='tableMain'> " +
            "<tr>" +
            "<td colspan='2' width='20%' valign='top' ><b>Specimen Number</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].specimen_number + "</span>" +
            "</td>" +
            "<td  colspan='2' width='20%' valign='top' ><b>Patient ID</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].patient_id + "</span>" +
            "</td>" +
            "<td width='20%' valign='top'><b>Order ID</b><br>" +
            "<span class='styleNormal'>" + this.order_id + " </span>" +
            "</td>" +
            "<td width='20%' valign='top'><b>Account #</b><br>";
        if (this.lookupList.practiceInfo.practiceId.toString() == "500")
            this.strHTMLHeadder += "<span class='styleNormal'>90908695</span>";//90908695//66600009
        else if (this.lookupList.practiceInfo.practiceId.toString() == "512")
            this.strHTMLHeadder += "<span class='styleNormal'>48002800</span>";//90908695//66600009
        else
            this.strHTMLHeadder += "<span class='styleNormal'></span>";
        this.strHTMLHeadder += "</td>  " +
            "<td colspan='2' width='20%' valign='top'><b>Account Phone</b><br>" +
            "<span class='styleNormal'>" + this.lookupList.practiceInfo.phone + "</span>" +
            "</td>  " +
            "</tr>" +
            "<tr>" +
            "<td colspan='2' width='50%' valign='top' ><b>Patient Last Name</b><br>" +
            "<span >" + this.acRptLabHeader[0].last_name.toString().toUpperCase() + "</span> </td>" +
            "<td  width='50%' valign='top' ><b>Patient First Name</b><br>" +
            "<span >" + this.acRptLabHeader[0].first_name.toString().toUpperCase() + "</span> </td>" +
            "<td width='50%' valign='top' ><b>Patient MI</b><br>" +
            "<span >" + this.acRptLabHeader[0].mname.toString().toUpperCase() + "</span> </td>" +
            "<td rowspan='3' colspan='4'>" +
            "<b>Account Address</b><br>" +
            "<span >   " + this.lookupList.practiceInfo.practiceName + "<br>" + this.lookupList.practiceInfo.address1 + " <br>" + this.lookupList.practiceInfo.city + ", " + this.lookupList.practiceInfo.state + ", " + this.lookupList.practiceInfo.zip + "</span>" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td width='20%' valign='top'><b>SSN</b><br>" +
            "<span class='styleNormal'></span></td>" +//+GeneralOptions.SSNPrivacyFormatter(arrHeader.getItemAt(0).ssn)+
            "<td  colspan='1'  width='15%' valign='top'><b>Patient Phone</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].home_phone + "</span></td>" +
            "<td  width='15%' valign='top'><b>Total Volume</b><br>" +
            "<span class='styleNormal'>" + this.Spec_Volume + "</span></td>" +//1500 ML
            "</tr>" +
            "<tr>" +
            "<td width='20%' valign='top'><b>Age</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].age + "</span> </td>" +
            "<td width='20%' valign='top'><b>DOB</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].dob + "</span> </td>" +
            "<td  colspan='1' width='10%' colspan='2' valign='top'>" +
            "<b>Gender</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].gender + "</span>" +
            "<td width='20%' valign='top'><b>Fasting</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].fasting + "</span></td>" +
            "</tr>" +
            "<tr>" +
            "<td rowspan='1' colspan='4'>" +
            "<b>Patient Address</b><br>" +
            "<span >   " + this.acRptLabHeader[0].address + " <br>" + this.acRptLabHeader[0].city + ", " + this.acRptLabHeader[0].state + ", " + this.acRptLabHeader[0].zip + " </span>" +
            "</td>" +
            "<td rowspan='1' colspan='4'>" +
            "<b >Additional Information</b><br>" +
            "<span>  " + ((this.acRptLabHeader[0].clinical_info == null || this.acRptLabHeader[0].clinical_info == "null") ? '' : this.acRptLabHeader[0].clinical_info) + "  </span>" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td colspan='1' width='20%' valign='top'><b>Date Collected</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].order_date + "</span></td>" +
            "<td width='20%' valign='top'><b>Date Entered</b><br>";
        if (this.lookupList.practiceInfo.practiceId.toString() == "500")
            this.strHTMLHeadder += "<span class='styleNormal'>" + this.acRptLabHeader[0].entered_date + "</span></td>";
        else
            this.strHTMLHeadder += "<span class='styleNormal'></span></td>";

        this.strHTMLHeadder += "<td width='20%' valign='top'><b>Date Reported</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].reported_date + "</span></td>" +
            "<td colspan='2' width='20%' valign='top'><b>Physician Name</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].providername + "</span></td>" +
            "<td width='20%' valign='top'><b>NPI</b><br>" +
            "<span class='styleNormal'>" + this.acRptLabHeader[0].npi + "</span></td>" +
            "<td width='20%' valign='top'><b>Physician Id</b><br>" +
            "<span class='styleNormal'></span></td>" +
            "</tr>" +
            "</table>" +
            "<br>";

        if (this.strpid_comment != "") {
            this.strHTMLHeadder += "<table width='100%' border='0' cellpadding='0' cellspacing='0' class='tableMain'>" +
                "<thead >" +
                "<th colspan='8'>General Comments</th>" +
                "</thead>" +
                "<tr>" +
                "<td>" + this.strpid_comment + "</td>" +
                "</tr>" +
                "</table>";
        }
        this.strHTMLHeadder += "<table width='100%' border='0' cellpadding='0' cellspacing='0' class='tableMain'>" +
            "<thead >" +
            "<th colspan='8' >" +
            "Result(s) Detail" +
            "</th>" +
            "</thead>" +
            "</table>";

        var resulttableschema: String = "<tr style='background-color: #cee6f8; color:#000000; font-weight:bold;'>" +
            "<td class='width-90'   valign='top' ><b>Date</b></td>" +
            // "<td width='60'   valign='top' ><b>Code</b></td>"+
            "<td valign='top' ><b>Description</b></td>" +
            "<td valign='top' ><b>Result</b></td>" +
            "<td width='60'  valign='top' ><b>Ref.range</b></td>" +
            "<td valign='top' ><b>Flag</b></td>" +
            "<td width='60'   valign='top' ><b>Status</b></td>" +
            "<td width='20' valign='top' ><b>Lab</b></td>" +
            //"<td width='60'  class='styleSubHeading' valign='top' >Lab Dir</td>"+
            "</tr>";


        for (var i = 0; i < this.acRptOrderTest.length; i++) {
            if (this.acRptOrderTest[i].result_id == null)
                continue;

            this.strHTMLHeadder += "<table width='100%' border='0' cellpadding='0' cellspacing='0' class='tableMain'>" +
                "<tr class='styleModuleSubHeader'>" +
                "<td colspan='8' valign='top' align='left'><b>" + this.acRptOrderTest[i].lab_assigned_desc + "(" + this.acRptOrderTest[i].lab_assigned_cpt + ")</b></td>" +
                "</tr>";
            if (this.acRptOrderTest[i].test_instructions != null && this.acRptOrderTest[i].test_instructions != "") {
                this.strHTMLHeadder += "<tr class='styleModuleSubHeader'>" +
                    "<td colspan='8' valign='top' align='left'><b>Test Instruction:</b>" + this.acRptOrderTest[i].test_instructions + "</td>" +//<hr align='left' width='100%' noshade>
                    "</tr>";
            }
            else if (this.strorder_comment != "") {
                this.strHTMLHeadder += "<tr class='styleModuleSubHeader'>" +
                    "<td colspan='8' valign='top' align='left'><b>Test Instruction:</b>" + this.strorder_comment + "</td>" +//<hr align='left' width='100%' noshade>
                    "</tr>";
                this.strorder_comment = "";
            }

            let acRptResultTestFiltered = this.generalOperation.filterArray(this.acRptResultTest, "test_id", this.acRptOrderTest[i].test_id);

            for (var j = 0; j < acRptResultTestFiltered.length; j++) {
                if (j == 0) {
                    this.strHTMLHeadder += resulttableschema;
                }
                if (acRptResultTestFiltered[j].abnormal_range_code.toString().toUpperCase() != "N" && acRptResultTestFiltered[j].abnormal_range_code.toString().toUpperCase() != ""
                    && acRptResultTestFiltered[j].result_type.toString().toUpperCase() != "ANT"
                ) {
                    this.strHTMLHeadder +=
                        "<tr>" +
                        "<td width='60' valign='top' class='styleAbnormal'>" + acRptResultTestFiltered[j].observation_date + "</td>" +
                        "<td   valign='top' class='styleAbnormal'>" + acRptResultTestFiltered[j].result_description + "</td>" +
                        "<td  valign='top' class='styleAbnormal'>" + acRptResultTestFiltered[j].result_value + " " + acRptResultTestFiltered[j].result_value_unit + "</td>" +
                        "<td width='60' valign='top' class='styleAbnormal'>" + acRptResultTestFiltered[j].recomended_value + "</td>" +
                        "<td valign='top' class='styleAbnormal'>" + acRptResultTestFiltered[j].abnormal_range + "</td>" +
                        "<td width='60'  valign='top' class='styleAbnormal'>" + acRptResultTestFiltered[j].result_status_code + "</td>" +
                        "<td width='20' valign='top' class='styleAbnormal'>" + acRptResultTestFiltered[j].lab_dir + "</td>" +
                        "</tr>";
                }
                else {
                    this.strHTMLHeadder +=
                        "<tr>" +
                        "<td width='60' valign='top' class='styleNormal'>" + acRptResultTestFiltered[j].observation_date + " </td>" +
                        "<td   valign='top'  class='styleNormal'>" + acRptResultTestFiltered[j].result_description + "</td>" +
                        "<td  valign='top' class='styleNormal'>" + acRptResultTestFiltered[j].result_value + " " + acRptResultTestFiltered[j].result_value_unit + "</td>" +
                        "<td width='60' valign='top' class='styleNormal'>" + acRptResultTestFiltered[j].recomended_value + "</td>" +
                        "<td  valign='top' class='styleNormal'>" + acRptResultTestFiltered[j].abnormal_range + "</td>" +
                        "<td width='60'  valign='top' class='styleNormal'>" + acRptResultTestFiltered[j].result_status_code + "</td>" +
                        "<td   width='20' valign='top' class='styleNormal'>" + acRptResultTestFiltered[j].lab_dir + "</td>" +
                        "</tr>";
                }

                if (acRptResultTestFiltered[j].lab_comments != null && acRptResultTestFiltered[j].lab_comments != "") {
                    this.strHTMLHeadder += "<tr class='styleModuleSubHeader'><td colspan='8' valign='top' align='left'><b><pre wrap='hard'>" + acRptResultTestFiltered[j].lab_comments + "</b></pre>" +
                        "</td>" +
                        "</tr>";
                }
            }
            this.strHTMLHeadder += "</table>";
        }
        //try
        //{
        //    GeneralOptions.print_Export("Print","Patient Lab Result","Criteria: Patient Name: "+arrHeader[0].last_name+", "+arrHeader[0].first_name+", DOB: "+arrHeader[0].dob+", Order Date :"+arrHeader[0].order_date,patient_ID);
        //} 
        //catch(error:Error) 
        //{

        //}

        if (this.acRptDirTest != null && this.acRptDirTest.length > 0) {
            this.strHTMLHeadder += "<br><table width='100%' border='0' cellpadding='0' cellspacing='0' class='tableMain'>" +
                "<tr class='styleModuleSubHeader'><td colspan='5'><b>Lab Director Information</b></td></tr>" +
                "<tr style='background-color: #cee6f8; color:#000000; font-weight:bold;'>" +
                "<td class='width-80'   valign='top' ><b>Facility id</b></td>" +
                "<td class='width-110'   valign='top' ><b>Facility Name</b></td>" +
                "<td width='220'   valign='top' ><b>Facility Address</b></td>" +
                "<td width='110'    valign='top' ><b>Facility Phone</b></td>" +
                "<td valign='top' ><b>Director Info</b></td>" +
                "</tr>";
            var strData: String = "";

            for (var d = 0; d < this.acRptDirTest.length; d++) {
                strData += "<tr>";
                strData += "<td>" + this.acRptDirTest[d].chk + "</td>";
                strData += "<td>" + this.acRptDirTest[d].name + "</td>";
                strData += "<td>" + this.acRptDirTest[d].address + "</td>";
                strData += "<td>" + this.acRptDirTest[d].phone_number + "</td>";
                strData += "<td>" + this.acRptDirTest[d].dir_name + "</td>";
                strData += "</tr>";
            }
            this.strHTMLHeadder += strData;
        }



        this.strHtmlString = this.strHTMLHeadder;
        this.strHtmlString += "</html>";

        this.strHtmlString = "<div class'report'> " + this.strHtmlString + "</div>";
    }
}