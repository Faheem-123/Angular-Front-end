import { Component, OnInit, Inject, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FaxService } from 'src/app/services/fax.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { NgbModal, NgbModalOptions, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { InlineFaxContactSearchComponent } from 'src/app/general-modules/inline-fax-contact-search/inline-fax-contact-search.component';
import { ListFilterContainsAnyGeneral } from 'src/app/shared/filter-pipe-contains-any-general';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PhonePipe } from 'src/app/shared/phone-pipe';
import { SendFaxAttachmentsFromClient } from 'src/app/models/fax/send-fax-attachments-from-client';
import { FaxAttachemntsTypeEnum, AlertTypeEnum, ServiceResponseStatusEnum, OperationType } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { WrapperSendFax } from 'src/app/models/fax/wrapper-send-fax';
import { FaxParam } from './fax-parm';
import { AddEditFaxContactComponent } from '../../setting/general-setup/fax-contacts-setup/add-edit-fax-contact/add-edit-fax-contact.component';
import { FaxResendModel } from 'src/app/models/fax/fax-resend-model';


@Component({
  selector: 'new-fax',
  templateUrl: './new-fax.component.html',
  styleUrls: ['./new-fax.component.css']
})
export class NewFaxComponent implements OnInit {

  @Input() operation: string; // new_fax | resend_fax
  @Input() faxParam: FaxParam;
  @Input() callingFrom: string;
  @Input() lstAttachments: Array<any>;

  //@Output() onFaxSent = new EventEmitter<any>();

  subTitle: string = ""


  recepientFaxNo: string = '';
  recepientName: string = '';
  recepientOrganization: string = '';
  recepientPhone: string = '';
  senderFaxNo: string = '';
  senderName: string = '';
  senderOrganization: string = '';
  senderPhone: string = '';
  faxSubject: string = '';
  faxNotes: string = '';



  sendFaxFormGroup: FormGroup;
  loadingCount: number = 0;
  isLoading: boolean = false;
  showContactSearchByFaxNo: boolean = false;
  showContactSearchByOrg: boolean = false;

  lstFaxContactsFiltered: Array<any>;

  patientId: number;
  moduleReferenceId: string = "";
  faxReferenceId: string = "";
  faxSentIdMain: number;

  isSending: boolean = false;
  showDocuments: boolean = false;

  
  @ViewChild('txtRecFaxNumber') txtRecFaxNumber: ElementRef;
  @ViewChild('txtRecOrgNumber') txtRecOrgNumber: ElementRef;

  @ViewChild('inlineFaxContactSearchByFaxNo') inlineFaxContactSearchByFaxNo: InlineFaxContactSearchComponent;
  @ViewChild('inlineFaxContactSearchByOrg') inlineFaxContactSearchByOrg: InlineFaxContactSearchComponent;


  lstMultiPart: Array<any>;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private faxService: FaxService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal,
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal) {

    
  }

  ngOnInit() {

    this.isLoading = true;

    if (this.operation == 'new_fax') {
      this.subTitle = 'New Fax';
    }
    else if (this.operation == 'resend_fax') {
      this.subTitle = 'Resend Fax';
    }

    debugger;

    if (this.faxParam != undefined) {
      this.faxReferenceId = this.faxParam.faxReferenceId;
      this.patientId = this.faxParam.patientId;
      this.moduleReferenceId = this.faxParam.moduleReferenceId;
      this.faxSentIdMain = this.faxParam.faxSentId;

      this.recepientFaxNo = this.faxParam.recepientFaxNo;
      this.recepientName = this.faxParam.recepientName;
      this.recepientOrganization = this.faxParam.recepientOrganization;
      this.recepientPhone = this.faxParam.recepientPhone;
      this.senderFaxNo = this.faxParam.senderFaxNo;
      this.senderName = this.faxParam.senderName;
      this.senderOrganization = this.faxParam.senderOrganization;
      this.senderPhone = this.faxParam.senderPhone;
      this.faxSubject = this.faxParam.faxSubject;
      this.faxNotes = this.faxParam.faxNotes;
    }


    this.buildForm();

    if (this.lookupList.lstFaxContactList == undefined || this.lookupList.lstFaxContactList.length == 0) {
      this.loadingCount++;
      this.getFaxContactList();
    }

    if (this.lookupList.lstFaxConfigFaxNumbers == undefined || this.lookupList.lstFaxConfigFaxNumbers.length == 0) {
      this.loadingCount++;
      this.getFaxConfigFaxNumbersList();
    }
    else {
      this.sendFaxFormGroup.get('ddSenderFaxNo').setValue(this.lookupList.lstFaxConfigFaxNumbers[0].id);
    }

    if (this.loadingCount == 0) {
      this.isLoading = false;

    }
  }


  refreshContactList() {
    this.isLoading = true;
    this.loadingCount = 1;
    this.getFaxContactList();
  }
  buildForm() {
    this.sendFaxFormGroup = this.formBuilder.group({
      txtRecFaxNumber: this.formBuilder.control({ value: this.recepientFaxNo, disabled: this.operation == 'resend_fax' }),
      txtRecName: this.formBuilder.control({ value: this.recepientName, disabled: this.operation == 'resend_fax' }),
      txtRecOrganization: this.formBuilder.control({ value: this.recepientOrganization, disabled: this.operation == 'resend_fax' }),
      txtRecPhoneNo: this.formBuilder.control({ value: this.recepientPhone, disabled: this.operation == 'resend_fax' }),
      ddSenderFaxNo: this.formBuilder.control({ value: null, disabled: this.operation == 'resend_fax' }),
      txtSenderName: this.formBuilder.control({ value: this.lookupList.logedInUser.userFName + ' ' + this.lookupList.logedInUser.userLName, disabled: this.operation == 'resend_fax' }),
      txtSenderOrganization: this.formBuilder.control({ value: this.lookupList.practiceInfo.practiceName, disabled: this.operation == 'resend_fax' }),
      txtSenderPhoneNo: this.formBuilder.control({ value: new PhonePipe().transform(this.lookupList.practiceInfo.phone), disabled: this.operation == 'resend_fax' }),
      txtSubject: this.formBuilder.control({ value: null, disabled: this.operation == 'resend_fax' }),
      txtNotes: this.formBuilder.control({ value: null, disabled: this.operation == 'resend_fax' })
    }
    );
  }

  getFaxConfigFaxNumbersList() {
    debugger;
    this.faxService.getFaxConfigFaxNumbersList(this.lookupList.practiceInfo.practiceId, this.lookupList.faxServer).subscribe(
      data => {

        debugger;
        this.lookupList.lstFaxConfigFaxNumbers = data as Array<any>;

        if (this.lookupList.lstFaxConfigFaxNumbers != undefined && this.lookupList.lstFaxConfigFaxNumbers.length > 0) {
          this.sendFaxFormGroup.get('ddSenderFaxNo').setValue(this.lookupList.lstFaxConfigFaxNumbers[0].id);
        }

        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
        }

      },
      error => {
        this.isLoading = false;
        this.getFaxConfigError(error);
      }
    );
  }
  getFaxConfigError(error: any) {
    this.logMessage.log("getFaxConfig Error." + error);
  }

  getFaxContactList() {

    this.faxService.getFaxContactList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        debugger;
        this.lookupList.lstFaxContactList = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
        }

      },
      error => {
        this.isLoading = false;
        this.getFaxContactListError(error);
      }
    );
  }
  getFaxContactListError(error: any) {
    this.logMessage.log("getFaxContactList Error." + error);
  }

  shiftFocusToConctactSearch() {
    if (this.showContactSearchByFaxNo) {
      this.inlineFaxContactSearchByFaxNo.focusFirstIndex();
    }
    else if (this.showContactSearchByOrg) {
      this.inlineFaxContactSearchByOrg.focusFirstIndex();
    }
  }


  onContactSearchInputChange(event: any, option: string) {

    debugger;
    this.lstFaxContactsFiltered = undefined;

    let val: string = event.currentTarget.value;
    switch (option) {
      case "fax_no":
        this.showContactSearchByOrg = false;
        if (val != undefined && val != "") {
          //let filterObjFaxNo: any = { fax_no: val, phone_no: val };
          let filterObjFaxNo: any = { fax_no: val };
          this.lstFaxContactsFiltered = new ListFilterContainsAnyGeneral().transform(this.lookupList.lstFaxContactList, filterObjFaxNo);

          if (this.lstFaxContactsFiltered != undefined && this.lstFaxContactsFiltered.length > 0) {
            this.showContactSearchByFaxNo = true;
          }
        }
        else {
          this.showContactSearchByFaxNo = false;
        }


        break;
      case "organization":
        this.showContactSearchByFaxNo = false;
        if (val != undefined && val != "") {
          let filterObjOrg: any = { organization_name: val };
          this.lstFaxContactsFiltered = new ListFilterContainsAnyGeneral().transform(this.lookupList.lstFaxContactList, filterObjOrg);

          if (this.lstFaxContactsFiltered != undefined && this.lstFaxContactsFiltered.length > 0) {
            this.showContactSearchByOrg = true;
          }
        }
        else {
          this.showContactSearchByOrg = false;
        }

        break;

      default:
        break;
    }

  }


  closeSearch() {
    if (this.showContactSearchByFaxNo) {
      this.showContactSearchByFaxNo = false;
      this.txtRecFaxNumber.nativeElement.focus();
    }
    else if (this.showContactSearchByOrg) {

      this.showContactSearchByOrg = false;
      this.txtRecOrgNumber.nativeElement.focus();
    }

  }

  addDataFromSearch(contact: any) {
    debugger;
    this.showContactSearchByFaxNo = false;
    this.showContactSearchByOrg = false;

    this.sendFaxFormGroup.get('txtRecFaxNumber').setValue(new PhonePipe().transform(contact.fax_no));
    this.sendFaxFormGroup.get('txtRecName').setValue(contact.contact_person);
    this.sendFaxFormGroup.get('txtRecOrganization').setValue(contact.organization_name);
    this.sendFaxFormGroup.get('txtRecPhoneNo').setValue(new PhonePipe().transform(contact.phone_no));

  }

  onFileChange(event: any) {

    debugger;
    if (event.target.files != undefined && event.target.files.length > 0) {
      if (this.lstMultiPart == undefined) {
        this.lstMultiPart = new Array<any>();
      }
      let file: File = event.target.files[0];
      this.lstMultiPart.push(file);

      if (this.lstAttachments == undefined) {
        this.lstAttachments = new Array<any>();
      }

      let sendFaxAttachmentsFromClient: SendFaxAttachmentsFromClient = new SendFaxAttachmentsFromClient()

      sendFaxAttachmentsFromClient.document_name = file.name;
      sendFaxAttachmentsFromClient.document_source = FaxAttachemntsTypeEnum.MULTI_PART;
      sendFaxAttachmentsFromClient.multipart_index = this.lstMultiPart.length - 1;
      sendFaxAttachmentsFromClient.read_only = false;// true;

      this.lstAttachments.push(sendFaxAttachmentsFromClient);

      /*
      this.ormListHealthInfoAttachments = new ORM_HealthInformationCaptureAttachments();
      if (this.arrAttachments == undefined) {
        this.arrAttachments = new Array<any>();
      }
      this.arrAttachmentCopy = new Array<any>();
      if (this.listInfoCaptureAttachments == undefined) {
        this.listInfoCaptureAttachments = new Array<any>();
      }
      this.ormListHealthInfoAttachments.link = "";
      this.ormListHealthInfoAttachments.attach_type = "file";
      this.ormListHealthInfoAttachments.attachment_id = "";
      this.ormListHealthInfoAttachments.name = event.target.files[0].name;
      this.arrAttachments.push(this.ormListHealthInfoAttachments);
      this.arrAttachmentCopy.push(this.ormListHealthInfoAttachments);
     
      this.listInfoCaptureAttachments.push(this.arrAttachmentCopy[0]);
      
      if (this.arrMultiFiles == undefined) {
        this.arrMultiFiles = new Array<any>();
      }
      this.arrMultiFiles.push(event.target.files[0]);
      */
    }
  }

  sendFax(formValue: any) {
    debugger;
    if (this.validateData(formValue)) {

      this.isSending = true;
      let wrapperSendFax: WrapperSendFax = new WrapperSendFax();
      wrapperSendFax.fax_server=this.lookupList.faxServer;
      wrapperSendFax.practice_id = this.lookupList.practiceInfo.practiceId;
      wrapperSendFax.patient_id = this.patientId;


      wrapperSendFax.recipientFaxNo = formValue.txtRecFaxNumber;
      wrapperSendFax.recipientName = formValue.txtRecName;
      wrapperSendFax.recipientOrganization = formValue.txtRecOrganization;
      wrapperSendFax.recipientPhoneNo = formValue.txtRecPhoneNo;

      wrapperSendFax.senderFaxNo = formValue.ddSenderFaxNo;
      wrapperSendFax.senderName = formValue.txtSenderName;
      wrapperSendFax.senderOrganization = formValue.txtSenderOrganization;
      wrapperSendFax.senderPhoneNo = formValue.txtSenderPhoneNo;

      wrapperSendFax.faxSubject = formValue.txtSubject;
      wrapperSendFax.faxNotes = formValue.txtNotes;

      //wrapperSendFax.coverPage=formData. ;	
      wrapperSendFax.userName = this.lookupList.logedInUser.user_name;
      wrapperSendFax.moduleName = this.callingFrom;
      wrapperSendFax.moduleReferenceId = this.moduleReferenceId;
      wrapperSendFax.faxSentIdMain = this.faxSentIdMain;

      wrapperSendFax.sentDate = this.dateTimeUtil.getCurrentDateTimeString();


      let html: string = "";
      // attachments      
      const formData: FormData = new FormData();
      let multiPartIndex: number = 0;
      let lstSendFaxAttachmentsFromClient: Array<SendFaxAttachmentsFromClient>;
      if (this.lstAttachments != undefined && this.lstAttachments.length > 0) {
        lstSendFaxAttachmentsFromClient = new Array<SendFaxAttachmentsFromClient>();

        this.lstAttachments.forEach(att => {

          debugger;
          //if (att.checked == true) {

          let sendFaxAttachmentsFromClient: SendFaxAttachmentsFromClient = new SendFaxAttachmentsFromClient();
          sendFaxAttachmentsFromClient.document_id = att.document_id;
          sendFaxAttachmentsFromClient.document_name = att.document_name;
          //sendFaxAttachmentsFromClient.document_path = att.document_path;
          sendFaxAttachmentsFromClient.document_link = att.document_link;
          sendFaxAttachmentsFromClient.patient_document_id = att.patient_document_id;
          sendFaxAttachmentsFromClient.document_source = att.document_source;
          sendFaxAttachmentsFromClient.html_string = att.html_string;

          if (att.multipart_index != undefined) {
            if (this.lstMultiPart != undefined || this.lstMultiPart != null) {
              formData.append('attachments', this.lstMultiPart[att.multipart_index]);
              sendFaxAttachmentsFromClient.multipart_index = multiPartIndex;
              multiPartIndex++;
            }
          }

          lstSendFaxAttachmentsFromClient.push(sendFaxAttachmentsFromClient);
          //}

        });
        wrapperSendFax.lstAttachments = lstSendFaxAttachmentsFromClient;
      }


      debugger;

      /*
      if (this.lstMultiPart != undefined || this.lstMultiPart != null) {

        this.lstMultiPart.forEach(multipartFile => {
          formData.append('attachments', multipartFile);
        });
      } else {
        formData.append('attachments', null);
      }
      */

      formData.append('wrapperSendFax', JSON.stringify(wrapperSendFax));

      
      debugger;
      this.faxService.sendFax(formData).subscribe(
        data => {
          this.sendFaxSuccess(data);
          this.isSending = false;
        },
        error => {
          this.sendFaxError(error);
          this.isSending = false;
        }
      );


    }
  }

  sendFaxSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Send Fax', "Fax has been sent successfully.", AlertTypeEnum.SUCCESS)

      //if (this.callingFrom != 'fax') {
      this.activeModal.close(true)
      //}
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Send Fax', data.response, AlertTypeEnum.DANGER)
    }
  }

  sendFaxError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Send Fax', "An Error Occured while sending Fax.", AlertTypeEnum.DANGER)
  }

  /*
      txtRecFaxNumber: this.formBuilder.control(null),
      txtRecName: this.formBuilder.control(null),
      txtRecOrganization: this.formBuilder.control(null),
      txtRecPhoneNo: this.formBuilder.control(null),
      ddSenderFaxNo: this.formBuilder.control(null),
      txtSenderName: this.formBuilder.control(this.lookupList.logedInUser.userFName + ' ' + this.lookupList.logedInUser.userLName),
      txtSenderOrganization: this.formBuilder.control(this.lookupList.practiceInfo.practiceName),
      txtSenderPhoneNo: this.formBuilder.control(new PhonePipe().transform(this.lookupList.practiceInfo.phone)),
      txtSubject: this.formBuilder.control(null),
      txtNotes: this.formBuilder.control(null)
  */

  validateData(formValue: any): boolean {

    debugger;
    let isValid: boolean = true;

    let msg: string = "";
    //let regExpPhone = new RegExp(RegExEnum.PHONE);

    if (formValue.txtRecFaxNumber == null || formValue.txtRecFaxNumber == undefined || formValue.txtRecFaxNumber == '') {
      msg = "Please enter recipient fax number."
    }
    //else if (!regExpPhone.test(formData.txtRecFaxNumber)) {
    //  msg = "Recipient fax number is not valid."
    //}
    else if (formValue.ddSenderFaxNo == null || formValue.ddSenderFaxNo == undefined || formValue.ddSenderFaxNo == '') {
      msg = "Please enter receiver fax number."
    }
    //else if (!regExpPhone.test(formData.ddSenderFaxNo)) {
    //  msg = "Sender fax number is not valid."
    // }
    else if (formValue.txtSenderName == null || formValue.txtSenderName == undefined || formValue.txtSenderName == '') {
      msg = "Please enter sender name."
    }
    else if (formValue.txtSenderOrganization == null || formValue.txtSenderOrganization == undefined || formValue.txtSenderOrganization == '') {
      msg = "Please enter sender organization."
    }
    else if (formValue.txtNotes == null || formValue.txtNotes == undefined || formValue.txtNotes == '') {
      msg = "Please enter sender fax notes."
    }

    if (msg != "") {
      isValid = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Send Fax', msg, AlertTypeEnum.DANGER)
    }

    return isValid;
  }

  onAddContact(formValue: any) {

    const modalRef = this.ngbModal.open(AddEditFaxContactComponent, this.popUpOptions);
    modalRef.componentInstance.operationType = OperationType.ADD;
    modalRef.componentInstance.orgName = formValue.txtRecOrganization;
    modalRef.componentInstance.contactPerson = formValue.txtRecName;
    modalRef.componentInstance.faxNumber = formValue.txtRecFaxNumber;
    modalRef.componentInstance.phoneNumber = formValue.txtRecPhoneNo;

    modalRef.result.then((result) => {
      if (result) {
        this.refreshContactList()
      }
    }, (reason) => {

    });

  }

  /*
  checkBoxCheckChanged(checked: boolean, row: number) {
    debugger;
    this.lstAttachments[row].checked = checked;
  }
  */



  validateResendData(): boolean {

    debugger;
    let isValid: boolean = true;

    let msg: string = "";
    //let regExpPhone = new RegExp(RegExEnum.PHONE);

    if (this.senderFaxNo == undefined || this.senderFaxNo == '') {
      msg = "Sender Fax No is required."
    }
    if (this.faxReferenceId == undefined || this.faxReferenceId == '') {
      msg = "Fax Reference Id is missing."
    }
    if (this.faxSentIdMain == undefined) {
      msg = "Fax Send Id is missing."
    }



    if (msg != "") {
      isValid = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Re-Send Fax', msg, AlertTypeEnum.DANGER)
    }

    return isValid;
  }

  reSendFax() {

    debugger;
    if (this.validateResendData()) {

      this.isSending = true;
      
      let faxResendModel: FaxResendModel = new FaxResendModel();

      faxResendModel.practiceId = this.lookupList.practiceInfo.practiceId;
      faxResendModel.systemIp = this.lookupList.logedInUser.systemIp;
      faxResendModel.logedInUser = this.lookupList.logedInUser.user_name;
      faxResendModel.faxSentIdMain = this.faxSentIdMain;
      faxResendModel.faxReferenceId = this.faxReferenceId;
      faxResendModel.clientFaxNo = this.senderFaxNo;
      faxResendModel.clientDateTime = this.dateTimeUtil.getCurrentDateTimeString();
      faxResendModel.clientFaxServer=this.lookupList.faxServer;

      this.faxService.reSendFax(faxResendModel).subscribe(
        data => {
          this.reSendFaxSuccess(data);
          this.isSending = false;
        },
        error => {
          this.reSendFaxError(error);
          this.isSending = false;
        }
      );
    }
  }

  reSendFaxSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Re-Send Fax', "Fax has been re-sent successfully.", AlertTypeEnum.SUCCESS)
      //if (this.callingFrom != 'fax') {
      this.activeModal.close(true);
      //}
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Re-Send Fax', data.response, AlertTypeEnum.DANGER)
    }
  }

  reSendFaxError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Re-Send Fax', "An Error Occured while re-sending Fax.", AlertTypeEnum.DANGER)
  }

  clearFeilds() {

    this.sendFaxFormGroup.get('txtSubject').setValue(null);
    this.sendFaxFormGroup.get('txtNotes').setValue(null);

    this.sendFaxFormGroup.get('txtRecFaxNumber').setValue(null);
    this.sendFaxFormGroup.get('txtRecName').setValue(null);
    this.sendFaxFormGroup.get('txtRecOrganization').setValue(null);
    this.sendFaxFormGroup.get('txtRecPhoneNo').setValue(null);

    this.sendFaxFormGroup.get('txtSenderName').setValue(this.lookupList.logedInUser.userFName + ' ' + this.lookupList.logedInUser.userLName);
    this.sendFaxFormGroup.get('txtSenderOrganization').setValue(this.lookupList.practiceInfo.practiceName);
    this.sendFaxFormGroup.get('txtSenderPhoneNo').setValue(new PhonePipe().transform(this.lookupList.practiceInfo.phone));

    this.lstAttachments = undefined;
    this.lstMultiPart = undefined;
  }

  onDocumentClicked() {
    this.showDocuments = true;
  }

  onDocumentSelectionCallBack(event: any) {

    if (event == 'cancel') {
      this.showDocuments = false;
    }
    else if (event != undefined && event.length > 0) {

      if (this.lstAttachments == undefined) {
        this.lstAttachments = new Array<any>();
      }
      event.forEach(att => {
        this.lstAttachments.push(att);
      });

      this.showDocuments = false;
    }
  }

  onRemoveAttachment(row: number) {
    this.lstAttachments.splice(row, 1);
  }


  moveAttachmentUpsDown(option: string,index:number) {

    if (this.lstAttachments != undefined && this.lstAttachments != undefined && this.lstAttachments.length > 0) {
      switch (option) {
        case "down":
          if ((index + 1) < this.lstAttachments.length) {
            var source = this.lstAttachments[index];
            var toBeSwaped = this.lstAttachments[index + 1];

            source.diag_sequence = index + 2;
            source.add_edit_flag = true;
            toBeSwaped.diag_sequence = index + 1;
            toBeSwaped.add_edit_flag = true;

            this.lstAttachments[index] = toBeSwaped;
            this.lstAttachments[index + 1] = source;            
          }

          break;
        case "up":
          if ((index) > 0) {

            var source = this.lstAttachments[index];
            var toBeSwaped = this.lstAttachments[index - 1];

            source.diag_sequence = index;
            source.add_edit_flag = true;
            toBeSwaped.diag_sequence = index + 1;
            toBeSwaped.add_edit_flag = true;

            this.lstAttachments[index] = toBeSwaped;
            this.lstAttachments[index - 1] = source
          }
          break;

        default:
          break;
      }
    }
  }
}
