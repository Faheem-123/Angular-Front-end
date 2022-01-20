import { Component, OnInit, Inject } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { LogMessage } from 'src/app/shared/log-message';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ORMAppSettingsSave } from 'src/app/models/setting/orm-app-settings-save';
import { ServiceResponseStatusEnum, AlertTypeEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'application-setup',
  templateUrl: './application-setup.component.html',
  styleUrls: ['./application-setup.component.css']
})
export class ApplicationSetupComponent implements OnInit {

  lstAppSettings: Array<any>;
  isLoading: boolean = false;
  appSettingFormGroup: FormGroup;
  editView: boolean = false;

  constructor(private setupService: SetupService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalOperation: GeneralOperation,
    private ngbModal: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder) { }


  ngOnInit() {

    this.appSettingFormGroup = this.formBuilder.group({});
    this.getUserConfigurableAppSettings();
  }

  removeFormControlls() {

    if (this.lstAppSettings != undefined) {
      this.lstAppSettings.forEach(setting => {
        this.appSettingFormGroup.removeControl("setting_" + setting.setting_id);
      });

    }
  }
  addFormControlls() {

    if (this.lstAppSettings != undefined) {
      this.lstAppSettings.forEach(setting => {
        this.appSettingFormGroup.addControl("setting_" + setting.setting_id, this.formBuilder.control(null));
      });
    }
  }

  assignFormControllValues() {

    debugger;
    if (this.lstAppSettings != undefined) {
      this.lstAppSettings.forEach(setting => {
        debugger;
        let value: any = "";
        switch (setting.control_type) {
          case "CheckBox":
            if (value == 'true' || value == '1' || value == 'on' || value == 'yes') {
              value = true;
            }
            else {
              value = false;
            }

            break;
          default:
            value = setting.value;
            break;
        }
        this.appSettingFormGroup.get("setting_" + setting.setting_id).setValue(value);
      });
    }
  }

  getUserConfigurableAppSettings() {
    this.isLoading = false;

    this.removeFormControlls();
    this.lstAppSettings = undefined;
    this.setupService.getUserConfigurableAppSettings(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lstAppSettings = data as Array<any>;
        this.addFormControlls();
        this.assignFormControllValues();
        this.isLoading = false;
      },
      error => {

        this.isLoading = false;
        this.getUserConfigurableAppSettingsError(error);
      }
    );
  }
  getUserConfigurableAppSettingsError(error: any) {
    this.logMessage.log("getUserConfigurableAppSettings Error." + error);
  }

  setDefualtValue(settingId: number) {

    if (this.lstAppSettings != undefined) {
      this.lstAppSettings.forEach(setting => {

        debugger;
        if (setting.setting_id == settingId) {
          let value: any = "";
          switch (setting.control_type) {
            case "CheckBox":
              if (value == 'true' || value == '1' || value == 'on' || value == 'yes') {
                value = true;
              }
              else {
                value = false;
              }

              break;
            default:
              value = setting.value;
              break;
          }
          this.appSettingFormGroup.get("setting_" + settingId).setValue(value);
        }


      });
    }
  }

  onCancel() {
    this.editView = false;
    this.appSettingFormGroup.clearValidators();
    this.assignFormControllValues();
  }

  onSave(formData: any) {

    if (this.lstAppSettings != undefined) {

      this.isLoading = true;

      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
      let lstSave: Array<ORMAppSettingsSave>;

      this.lstAppSettings.forEach(setting => {
        if (this.appSettingFormGroup.get("setting_" + setting.setting_id).dirty) {


          let ormSave: ORMAppSettingsSave = new ORMAppSettingsSave();
          ormSave.setting_id = setting.setting_id;
          ormSave.client_date_modified = clientDateTime;
          ormSave.modified_user = this.lookupList.logedInUser.user_name;
          ormSave.practice_id = this.lookupList.practiceInfo.practiceId;

          if (setting.detail_id == undefined) {
            ormSave.client_date_created = clientDateTime;
            ormSave.created_user = this.lookupList.logedInUser.user_name;
          }
          else {
            ormSave.detail_id = setting.detail_id;
            ormSave.client_date_created = setting.client_date_created;
            ormSave.created_user = setting.created_user;
          }


          debugger;
          let value: any = "";
          switch (setting.control_type) {
            case "CheckBox":

              if (this.appSettingFormGroup.get("setting_" + setting.setting_id).value) {
                value = "true";
              }
              else {
                value = "false";
              }
              break;
            default:
              value = this.appSettingFormGroup.get("setting_" + setting.setting_id).value;
              break;
          }

          ormSave.options = value;

          if (lstSave == undefined) {
            lstSave = new Array<ORMAppSettingsSave>();
          }
          lstSave.push(ormSave);
        }
      });


      if (lstSave != undefined && lstSave.length > 0) {
        this.setupService.saveAppSettings(lstSave).subscribe(
          data => {
            this.saveAppSettingsSuccess(data);
          },
          error => {
            this.saveAppSettingsError(error);
          }
        );
      }
      else {
        this.isLoading = false;
      }

    }
  }

  saveAppSettingsSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.editView = false;
      this.isLoading = false;
      this.getUserConfigurableAppSettings();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Application Setting', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveAppSettingsError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Application Setting', error.message, AlertTypeEnum.DANGER)
    //this.logMessage.log("saveAppSettings Error.");
  }

  onEdit() {
    this.editView = true;
  }
}
