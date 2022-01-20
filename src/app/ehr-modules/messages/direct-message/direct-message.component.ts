import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MessagesService } from 'src/app/services/messages/messages.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.css']
})
export class DirectMessageComponent implements OnInit {
  @Output() BackToMainMessage = new EventEmitter<any>();

  directMessageList: Array<any>;
  directMessageLinks: Array<ORMKeyValue> = [];
  messageID;
  dMsgFrom;
  dMsgSent;
  dMsgTo;
  dMsgSubject;
  attfiledescription;
  selectedURL;
  import_Type;
  importCCDAList: Array<any>;

  directMessageFormView: FormGroup;
  public directMessageView: AbstractControl;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private general: GeneralOperation,
    private messageService: MessagesService) {
    this.directMessageFormView = formBuilder.group({
      'directMessageView': [''],
    });
    this.directMessageView = this.directMessageFormView.controls['directMessageView'];
  }

  ngOnInit() {
    this.onGetDirectMessages();
  }
  onGetDirectMessages() {
    this.messageService.onGetDirectMessages(this.lookupList.practiceInfo.practiceId)
      .subscribe(
        data => {
          this.directMessageList = data as Array<any>;
          this.onDirectMessageSelect(this.directMessageList[0]);
        },
        error => {
          this.logMessage.log("An Error Occured while getting onGetDirectMessages list.")
        }
      );
  }
  onDirectMessageSelect(row) {
    this.messageID = row.message_id;
    this.directMessageFormView = this.formBuilder.group({
      'directMessageView': [row.body],
    });
    this.directMessageView = this.directMessageFormView.controls['directMessageView'];
    this.dMsgFrom = row.from_user;
    this.dMsgSent = row.message_date;
    this.dMsgTo = row.to_user;
    this.dMsgSubject = row.subject;
    this.attfiledescription = row.att_file_description;
    if (row.url.includes("\\") == true) {
      this.selectedURL = row.url.replace('\\', '');
    } else
      this.selectedURL = row.url;
  }
  importCCDA() {
    debugger;
    try {
      var acPathCCDA = this.general.filterArray(this.lookupList.lstdocumentPath, "category_name", "otherResources");
      var strPathCCDA: String = acPathCCDA[0].upload_path + "otherResources/DirectMessages/" + this.selectedURL;
      this.import_Type = "CCD";

      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [];
      searchCriteria.param_list.push({ name: "strPath", value: strPathCCDA, option: "" });

      this.messageService.importCCDA(searchCriteria)
        .subscribe(
          data => {
            debugger;
            this.OpenCCDA(data);
          },
          error => {
            this.logMessage.log("An Error Occured while getting importCCDA.")
          }
        );


    } catch (error) {
      this.logMessage.log("importCCDA-strPath" + error);
    }
  }
  OpenCCDA(value) {

  }
  importCCR() {
    try {
      var acPathCCR = this.general.filterArray(this.lookupList.lstdocumentPath, "category_name", "otherResources");
      var strPathCCR: String = acPathCCR[0].upload_path + "otherResources/DirectMessages/" + this.selectedURL;
      this.import_Type = "CCR";

      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [];
      searchCriteria.param_list.push({ name: "strPath", value: strPathCCR, option: "" });

      this.messageService.importCCR(searchCriteria)
        .subscribe(
          data => {
            debugger;
            var a = "";
          },
          error => {
            this.logMessage.log("An Error Occured while getting importCCR.")
          }
        );

    } catch (error) {

    }
  }
}