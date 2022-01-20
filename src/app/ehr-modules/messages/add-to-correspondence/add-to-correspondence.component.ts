import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { build$ } from 'protractor/built/element';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ORMHealthInformationCapture } from 'src/app/models/messages/ORMHealthInformationCapture';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMHealthInformationCaptureAttachments } from 'src/app/models/messages/ORMHealthInformationCaptureAttachments';
import { WrapperAddToCorrespondence } from 'src/app/models/messages/WrapperAddToCorrespondence';
import { MessagesService } from 'src/app/services/messages/messages.service';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';

@Component({
  selector: 'add-to-correspondence',
  templateUrl: './add-to-correspondence.component.html',
  styleUrls: ['./add-to-correspondence.component.css']
})
export class AddToCorrespondenceComponent implements OnInit {
  @Output() onCloseNewMessage = new EventEmitter<any>();
  attachmentsList: Array<any>;
  linksList: Array<any>;
  patientName: string = '';
  txtBody: string = '';
  patientID: string = '';
  messageID: string = '';
  messageattachmentID: string = '';

  addtocorrespondenceForm: FormGroup;
  arrHealthInfoAttachments: Array<any> = [];

  ormHealthInfoAttach: ORMHealthInformationCaptureAttachments = new ORMHealthInformationCaptureAttachments();
  ormHealthInfo: ORMHealthInformationCapture = new ORMHealthInformationCapture();

  lstOther: Array<ORMKeyValue> = [];

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    public activeModal: NgbActiveModal,
    private dateTimeUtil: DateTimeUtil,
    private messageService: MessagesService,
    private general: GeneralOperation,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    debugger;
    this.buildForm();
    this.assignValue();
  }
  buildForm() {
    this.addtocorrespondenceForm = this.formBuilder.group({
      txtLabeling: this.formBuilder.control(null),
      details: this.formBuilder.control(null)
    })
  }
  assignValue() {
    this.addtocorrespondenceForm.get("txtLabeling").setValue('');
    this.addtocorrespondenceForm.get("details").setValue(this.txtBody);
  }
  closePopup(value) {
    this.activeModal.close(value);
  }
  SaveToCorrespondence(formValues) {
   
    
    this.ormHealthInfo.health_info_id = ""
    this.ormHealthInfo.patient_id = this.patientID;
    this.ormHealthInfo.practice_id = this.lookupList.practiceInfo.practiceId.toString();

    this.ormHealthInfo.communicate_with = "Patient";
    this.ormHealthInfo.communication = (this.addtocorrespondenceForm.get('details') as FormControl).value;
    this.ormHealthInfo.communicate_date = this.dateTimeUtil.getCurrentDateTimeString();
    this.ormHealthInfo.labeling = (this.addtocorrespondenceForm.get('txtLabeling') as FormControl).value;

    this.ormHealthInfo.created_user = this.lookupList.logedInUser.user_name;
    this.ormHealthInfo.modified_user = this.lookupList.logedInUser.user_name;
    this.ormHealthInfo.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    this.ormHealthInfo.client_modified_date = this.dateTimeUtil.getCurrentDateTimeString();
    this.ormHealthInfo.deleted = "false";
    this.ormHealthInfo.system_ip = this.lookupList.logedInUser.systemIp;

    //var acDestinationPath = this.general.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");

    var acPath = this.general.filterArray(this.lookupList.lstdocumentPath, "category_name", "Messages");
    var sourcePath: String = acPath[0].upload_path + this.lookupList.practiceInfo.practiceId + "/Messages/";

    debugger;
    this.arrHealthInfoAttachments = new Array<any>();

    if (this.attachmentsList != null) {
      for (var i = 0; i < this.attachmentsList.length; i++) {
        this.ormHealthInfoAttach = new ORMHealthInformationCaptureAttachments();
        this.ormHealthInfoAttach.attachment_id = "";
        this.ormHealthInfoAttach.patient_id = this.patientID;
        this.ormHealthInfoAttach.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        this.ormHealthInfoAttach.document_date = "";//GeneralOptions.CurrentDateTimeString();
        this.ormHealthInfoAttach.name = this.attachmentsList[i].name;
        this.ormHealthInfoAttach.original_file_name = this.attachmentsList[i].name; //browseFile.name;
        this.ormHealthInfoAttach.link = this.attachmentsList[i].link;
        this.ormHealthInfoAttach.attach_type = "file";
        this.ormHealthInfoAttach.created_user = this.lookupList.logedInUser.user_name;
        this.ormHealthInfoAttach.modified_user = this.lookupList.logedInUser.user_name;
        this.ormHealthInfoAttach.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        this.ormHealthInfoAttach.client_modified_date = this.dateTimeUtil.getCurrentDateTimeString();
        this.ormHealthInfoAttach.deleted = "false";
        this.arrHealthInfoAttachments.push(this.ormHealthInfoAttach);
      }
    }
    if(this.linksList!=null)
    {
      for (var z = 0; z < this.linksList.length; z++) {
        this.ormHealthInfoAttach = new ORMHealthInformationCaptureAttachments();
        this.ormHealthInfoAttach.attachment_id = "";
        this.ormHealthInfoAttach.patient_id = this.patientID;
        this.ormHealthInfoAttach.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        this.ormHealthInfoAttach.document_date = "";
        this.ormHealthInfoAttach.name = this.linksList[z].link;
        this.ormHealthInfoAttach.original_file_name = "";
        this.ormHealthInfoAttach.link = this.linksList[z].link;
        this.ormHealthInfoAttach.attach_type = "link";
        this.ormHealthInfoAttach.created_user = this.lookupList.logedInUser.user_name;
        this.ormHealthInfoAttach.modified_user = this.lookupList.logedInUser.user_name;
        this.ormHealthInfoAttach.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        this.ormHealthInfoAttach.client_modified_date = this.dateTimeUtil.getCurrentDateTimeString();
        this.ormHealthInfoAttach.deleted = "false";
        this.arrHealthInfoAttachments.push(this.ormHealthInfoAttach);
      }
    }
    
    this.lstOther = new Array<ORMKeyValue>();
    this.lstOther.push(new ORMKeyValue("clientIP", this.lookupList.logedInUser.systemIp));
    this.lstOther.push(new ORMKeyValue("sourcePath", sourcePath));
    this.lstOther.push(new ORMKeyValue("upload_path", acPath[0].upload_path));
    
    let WrapperAddToCorrSave: WrapperAddToCorrespondence = new WrapperAddToCorrespondence();
    WrapperAddToCorrSave.lstHealthInfoCapture = this.ormHealthInfo;
    WrapperAddToCorrSave.lstHealthInfoAttachments = this.arrHealthInfoAttachments;
    WrapperAddToCorrSave.lstOther = this.lstOther;

    this.messageService.SaveCorrespondence(WrapperAddToCorrSave).subscribe(
      data => {
        this.activeModal.close();
      },
      error => {
        return;
      }
    );

  }
  
}