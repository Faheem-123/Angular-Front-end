import { Component, OnInit, ViewEncapsulation, Input, Inject } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralService } from 'src/app/services/general/general.service';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LabService } from 'src/app/services/lab/lab.service';
import { AlertPopupComponent } from '../alert-popup/alert-popup.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'app-encounter-print-viewer',
  templateUrl: './encounter-print-viewer.component.html',
  styles: [`
  .styleTopHeader {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-weight: bold;font-size: 18px; color:#00000;}
  .styleTopSubHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;	font-weight: bold;font-size: 12px; color:#0f4977;}
  .styleMainHeading {font-family:Trebuchet MS, Arial, Helvetica, sans-serif; font-weight: bold; font-size: 13px; color:#0f4977;}
  .styleNormal {font-size: 11px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;} 
  .styleNormalBold {font-size: 11px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;font-weight: bold;}
  .styleSubHeading {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;	font-size: 12px;font-weight: bold;}
  .tableMain{font-size:11px;font-font-family:Trebuchet MS, Arial, Helvetica, sans-serif; border-collapse:collapse; border:.1px solid #5bb6d0;}
  .tableMain td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:.1px solid #5bb6d0;padding:3px 7px 2px 7px;}
  .tableMain tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:.1px solid #5bb6d0; }
  .tableMain th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; font-size:12px;text-align:left;padding:3px 7px 2px 7px;background-color:#5bb6d0;color:#000000;} 
  .tableNoBorder{font-size:11px;font-family:Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;border: border:0px;}
  .tableNoBorder td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:0px ;padding:3px 5px 2px 5px;valign:top;} 
  .tableNoBorder tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:0px ; }
  .tableNoBorder th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; valign:center;  background-color: #edfbf6; color:#000000; font-weight:bold;font-size:12px;border:.1px solid #5bb6d0;padding:3px 5px 2px 5px;}  
  .styleModuleHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;  font-size: 12px;text-align: left; font-weight: bold;  background-color:#5bb6d0;color:#000000;} 
  .styleModuleSubHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif; font-size: 11px;   valign:center;  background-color: #d4eeee; color:#000000; font-weight:bold;} 
  .styleAlternateRowColor {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; background-color: #f4fafd;}
  .styleTopSubHeader {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;	font-weight: bold;  font-size: 12px; color:black;}
        .customers{font-family:Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;font-size:11px;}
        .customers td, #customers th {border:1px solid #0376a8;padding:3px 7px 2px 7px;}
        .customers th {font-size:1.4em;text-align:left;padding-top:5px;padding-bottom:4px;background-color:#A7C942;color:#fff;}
        .styleNormal {font-size: 11px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;}  
        .styleAbnormal {font-family: Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;font-weight: bold; color:red;} 
        .tableMain{font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:12px;font-family:Calibri;border-collapse:collapse;border:.1px solid #333333;}
        .tableMain td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #333333;padding:3px 5px 2px 5px;}
        .tableMain tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #333333; }
        .tableMain tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #333333; }
        .tableNoBorder{font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:12px;font-family:Arial;border-collapse:collapse;border: border:0px;}
        .tableNoBorder td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:0px ;padding:3px 5px 2px 5px;valign:top;}
        .tableNoBorder tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:0px ; } 
        .tableNoBorder th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;valign:center;text-align:left;  background-color: #f4fafd; color:#000000; font-weight:bold;font-size:10px;border:.1px solid #333333;padding:3px 5px 2px 5px;}
        .tabletest{border-collapse: collapse;font-size: 9px; font-family: Verdana;} 
        .tablewrite tr, .tblvitals tr{height:20px;}.tblvitals{border:1px solid black;border-bottom:0;border-collapse: collapse;height:20px;}.tblvitals td{border-left:1px solid black;} 
  `],
  encapsulation: ViewEncapsulation.None
  //styleUrls: ['./encounter-print-viewer.component.css']

})
export class EncounterPrintViewerComponent implements OnInit {
  @Input('section') section: string;
  followupForm: FormGroup;
  constructor(public activeModal: NgbActiveModal, private generalService: GeneralService
    , private modalService: NgbModal, @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private labService: LabService, private formBuilder: FormBuilder) { }
  print_html;
  print_style = '.styleTopHeader {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-weight: bold;font-size: 18px; color:#00000;}' +
    '.styleTopSubHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;	font-weight: bold;font-size: 12px; color:#0f4977;}' +
    '.styleMainHeading {font-family:Trebuchet MS, Arial, Helvetica, sans-serif; font-weight: bold; font-size: 13px; color:#0f4977;}' +
    '.styleNormal {font-size: 11px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;} ' +
    '.styleNormalBold {font-size: 11px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;font-weight: bold;}' +
    '.styleSubHeading {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;	font-size: 12px;font-weight: bold;}' +
    '.tableMain{font-size:11px;font-font-family:Trebuchet MS, Arial, Helvetica, sans-serif; border-collapse:collapse; border:.1px solid #5bb6d0;}' +
    '.tableMain td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:.1px solid #5bb6d0;padding:3px 7px 2px 7px;}' +
    '.tableMain tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:.1px solid #5bb6d0; }' +
    '.tableMain th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; font-size:12px;text-align:left;padding:3px 7px 2px 7px;background-color:#5bb6d0;color:#000000;} ' +
    '.tableNoBorder{font-size:11px;font-family:Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;border: border:0px;}' +
    '.tableNoBorder td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:0px ;padding:3px 5px 2px 5px;valign:top;} ' +
    '.tableNoBorder tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; border:0px ; }' +
    '.tableNoBorder th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; valign:center;  background-color: #edfbf6; color:#000000; font-weight:bold;font-size:12px;border:.1px solid #5bb6d0;padding:3px 5px 2px 5px;}  ' +
    '.styleModuleHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;  font-size: 12px;text-align: left; font-weight: bold;  background-color:#5bb6d0;color:#000000;} ' +
    '.styleModuleSubHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif; font-size: 11px;   valign:center;  background-color: #d4eeee; color:#000000; font-weight:bold;}' +
    '.styleAlternateRowColor {font-family:Trebuchet MS,Arial,Helvetica, sans-serif; background-color: #f4fafd;}' +
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
    '.tablewrite tr, .tblvitals tr{height:20px;}.tblvitals{border:1px solid black;border-bottom:0;border-collapse: collapse;height:20px;}.tblvitals td{border-left:1px solid black;} ' +
    '.pre {white-space: pre-wrap; font-family: Trebuchet MS,Arial,Helvetica, sans-serif; }'+
    '.pagebreak { page-break-before: always; }';

  header = "Encounter Print View";
  callingModule = '';
  module_id = '';
  lstFollowUp;
  ngOnInit() {
    if (this.callingModule == 'order') {
      this.buildForm();
      this.labService.GetOrderFollowUpNotes(this.module_id).subscribe(
        data => {
          this.lstFollowUp = data;
          if (this.lstFollowUp.length > 0) {
            (this.followupForm.get("drpFollowUp") as FormControl).setValue(this.lstFollowUp[0].col2);
            (this.followupForm.get("drpFollowUpaction") as FormControl).setValue(this.lstFollowUp[0].col3);
          }
        },
        error => {
          //this.logMessage.log("signLabOrder " + error);
        }
      );
    }
  }
  printDiv(html) {

    let printHtml = html;
    // this.generalService.printReportWithStyle(printHtml,this.print_style);   
    this.generalService.printReport(printHtml);

    return;
    /*
    debugger;
        if(html && html != undefined && html!='') {
            var printContents = html;
            var originalContents = document.body.innerHTML;      
    
        if(window){
            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                var popup = window.open('', '_blank', 
                'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,'
                +'location=no,status=no,titlebar=no');
               
                popup.window.focus();
                popup.document.write('<!DOCTYPE html><html><head>  '
        //+'<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css" '
        //+'media="screen,print">'
        //+'<link rel="stylesheet" href="style.css" media="screen,print">'             
        // +'<style>'
        // +this.print_style
        // +'</style>'
        //+'<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>'+
      //  +'<script type=\'text/javascript\'>'+
      +'$(document).ready(function () { window.print(); })</script><style type="text/css"> @media print {thead {display: table-header-group;} } @page{margin:3mm 3mm 3mm 3mm !important;}table{width:100% !important;}.imctable tr{height: 20px;}</style>'
        +'</head><body onload="self.print()"><div class="reward-body">' 
        + printContents + '</div></html>');
                popup.onbeforeunload = function (event) {           
                    popup.close();          
                    return '.\n';
                };
                popup.onabort = function (event) {             
                    popup.document.close();           
                    popup.close();         
                }
            } else {
                var popup = window.open('', '_blank', 'width=800,height=600');
                popup.document.open();
                popup.document.write('<html><head>'+
        +'<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css"'
        +' media="all">'
        //+'<link rel="stylesheet" href="style.css" media="all">'                
        +'<style>'
        +this.print_style
        +'</style>'
        +'</head><body onload="window.print()">' + printContents + '</html>');
                popup.document.close();
            }
    
             popup.document.close();
            }
            return true;
        }
        */
  }
  onSign() {
    if (this.callingModule == 'order') {
      const modalRef = this.modalService.open(ConfirmationPopupComponent, { windowClass: 'modal-adaptive' });
      modalRef.componentInstance.promptHeading = 'Confirm Sign !';
      modalRef.componentInstance.promptMessage = 'Are you sure you want to Sign the selected Order ?';
      modalRef.componentInstance.alertType = 'info';
      let closeResult;

      modalRef.result.then((result) => {
        if (result == PromptResponseEnum.YES) {
          let searchCriteria: SearchCriteria = new SearchCriteria();
          searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
          searchCriteria.param_list = [
            { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
            { name: "order_id", value: this.module_id, option: "" }
          ];
          this.labService.signLabOrder(searchCriteria).subscribe(
            data => {
              const modalRef = this.modalService.open(AlertPopupComponent, { windowClass: 'modal-adaptive' });
              modalRef.componentInstance.promptHeading = 'Confirm Sign !';
              modalRef.componentInstance.promptMessage = "Patient Order Sign Successfully";
              modalRef.componentInstance.alertType = 'info';
            },
            error => {
              //this.logMessage.log("signLabOrder " + error);
            }
          );
        }
      }, (reason) => {
        //alert(reason);
      });
    }
  }
  buildForm() {
    this.followupForm = this.formBuilder.group({
      drpFollowUp: this.formBuilder.control("", Validators.required),
      drpFollowUpaction: this.formBuilder.control("", Validators.required)
    })
  }
  showFollowUp = false;
  onFollowup() {
    this.showFollowUp = true;;
  }
  onSaveFollowUp() {
    if ((this.followupForm.get("drpFollowUp") as FormControl).value == "" || (this.followupForm.get("drpFollowUpaction") as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.modalService, 'Follow-Up Validation', 'Please Select Follow up Notes.', 'warning');
      return;
    }
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "follow_up_notes", value: (this.followupForm.get("drpFollowUp") as FormControl).value, option: "" },
      { name: "followup_action", value: (this.followupForm.get("drpFollowUpaction") as FormControl).value, option: "" },
      { name: "user", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "order_id", value: this.module_id, option: "" }
    ];
    this.labService.updateOrderFollowup(searchCriteria).subscribe(
      data => {
        if (data > 0) {
          const modalRef = this.modalService.open(AlertPopupComponent, { windowClass: 'modal-adaptive' });
          modalRef.componentInstance.promptHeading = 'Follow Up';
          modalRef.componentInstance.promptMessage = "Patient Order Update Successfully";
          modalRef.componentInstance.alertType = 'info';
        }

      },
      error => {
        //this.logMessage.log("signLabOrder " + error);
      }
    );
  }

}
