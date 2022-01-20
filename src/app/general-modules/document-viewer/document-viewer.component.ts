import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SafePipe } from './../../shared/docSafe-pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Inject } from '@angular/core';
import { SafeResourceUrl, SafeUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import "../../../assets/js/ehr.js";
import { EncounterService } from '../../services/encounter/encounter.service';
import { LabService } from 'src/app/services/lab/lab.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { AlertPopupComponent } from '../alert-popup/alert-popup.component';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { PromptResponseEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';
declare var myExtObject: any;
declare var webGlObject: any;

@Component({
  selector: 'document-viewer',
  templateUrl: './document-viewer.component.html',

  styleUrls: ['./document-viewer.component.css']

})

export class DocumentViewerComponent implements OnInit {
  fileUploadForm: FormGroup;
  constructor(private domSanitizer: DomSanitizer, public activeModal: NgbActiveModal, private encounterService: EncounterService
    , private formBuilder: FormBuilder, @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalOperation: GeneralOperation,
    private modalService: NgbModal,
    private labService: LabService) {
  }
  drugfilePath;
  healthcheckId;
  path_doc;
  html_iframe;
  current_url: SafeUrl;
  callingModule = '';
  module_id = '';
  lstFollowUp;
  followupForm: FormGroup;
  isAlreadySent;
  isLoading: boolean = false;
  ngOnInit() {
    this.fileUploadForm = this.formBuilder.group({
      RxInput: this.formBuilder.control(null, null)
    });
    this.current_url = this.domSanitizer.bypassSecurityTrustResourceUrl(this.path_doc)
    // myExtObject.loadIrx(this.XML(),"https://secure.newcropaccounts.com/InterfaceV7/RxEntry.aspx");
    webGlObject.init();
    //let secure_path = (new SafePipe(this.domSanitizer)).transform(this.path_doc);
    //let secure_path=this.domSanitizer.bypassSecurityTrustUrl(this.path_doc);
    // this.html_iframe="<iframe  [src]= "+secure_path+" width='100%' height='100%' frameborder='0' >";

    if (this.callingModule == 'order') {
      this.buildForm();
      debugger;
      this.labService.GetOrderFollowUpNotes(this.module_id).subscribe(
        data => {
          debugger;
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
  urlCache = new Map<string, SafeResourceUrl>();
  getLink(): SafeResourceUrl {
    debugger;
    var url = this.urlCache.get(this.path_doc);
    if (!url) {
      url = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.path_doc);
      this.urlCache.set("41", url);
    }
    return url;
  }
  // getPrescLink(): SafeResourceUrl{
  //   myExtObject.loadIrx(this.XML(),"https://secure.newcropaccounts.com/InterfaceV7/RxEntry.aspx");
  //   debugger;
  //   var url = this.urlCache.get("https://secure.newcropaccounts.com/InterfaceV7/RxEntry.aspx");
  //   if (!url) {
  //     url = this.domSanitizer.bypassSecurityTrustResourceUrl(
  //       "https://secure.newcropaccounts.com/InterfaceV7/RxEntry.aspx");
  //     this.urlCache.set("42", url);
  //   }
  //   return url;
  // }
  // openPrescription(){
  //   this.encounterService.openPrescription(this.XML(),this.presc_link)
  //   .subscribe(
  //     data=>this.openPrescriptionResponse(data),
  //     error=>alert(error)
  //   );
  // }
  openPrescriptionResponse(data) {
    debugger;
  }
  //   public loadScript(url) {
  //     url='../../../assets/js/ehr.js';
  //     console.log('preparing to load...')
  //     let node = document.createElement('script');
  //     node.src = url;
  //     node.type = 'text/javascript';
  //     document.getElementsByTagName('head')[0].appendChild(node);
  //  }

  // javaMethod(){
  //   this.fileUploadForm
  //   myExtObject.loadIrx(this.XML(),"https://secure.newcropaccounts.com/InterfaceV7/RxEntry.aspx");
  //   //myExtObject.func1();
  //  //  jsx.call();
  // }

  buildForm() {
    this.followupForm = this.formBuilder.group({
      drpFollowUp: this.formBuilder.control("", Validators.required),
      drpFollowUpaction: this.formBuilder.control("", Validators.required)
    })
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
  
  onSend(){
    this.isLoading = true;
    var acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath,"category_name","Health_Check");
    var upload_path:string=acPath[0].upload_path;
    
    


    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "drugfilePath", value: upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//Health_Check//" + this.drugfilePath, option: "" },
      { name: "healthcheckId", value: this.healthcheckId, option: "" }
    ];

    this.labService.sendDrugAbuse(searchCriteria)
      .subscribe(
        data => {
          this.isLoading = false;
          this.activeModal.dismiss('Cross click');
        },
        error => {
          this.isLoading = false;
        }
      );
  }
}
