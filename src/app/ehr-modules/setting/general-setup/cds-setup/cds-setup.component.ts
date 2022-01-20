import { Component, OnInit, Inject } from '@angular/core';
import { CDSService } from 'src/app/services/cds.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { TreeComponent, ITreeOptions } from 'angular-tree-component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertTypeEnum, OperationType, ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { ORMCDSSave } from 'src/app/models/setting/orm-cds-save';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';

@Component({
  selector: 'cds-setup',
  templateUrl: './cds-setup.component.html',
  styleUrls: ['./cds-setup.component.css']
})
export class CdsSetupComponent implements OnInit {
  //@ViewChild('tree') tree: TreeComponent;

  formGroup: FormGroup;

  rulesTreeNodes = [];

  lstCDSRules: Array<any>;
  isTreeDataLoading: boolean = true;
  isLoadingRuleData: boolean = false;
  ruleDetails: any;

  selectedRuleId: number;

  addEditView: boolean = false;
  addEditOperation: OperationType;

  rulesTreeOptions: ITreeOptions = {
    animateExpand: true,
    animateSpeed: 10
  }
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private cdsService: CDSService,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private dateTimeUtil: DateTimeUtil) { }


  ngOnInit() {
    this.rulesTreeNodes = [];
    this.buildForm();
    this.getCDCRulesList();
  }

  /*
  ngAfterViewInit() {
    debugger;
    this.tree.treeModel.expandAll();
  }
  */

  buildForm() {
    this.formGroup = this.formBuilder.group({
      txtRuleGoupName: this.formBuilder.control(null, Validators.required),
      txtRuleName: this.formBuilder.control(null, Validators.required),
      txtDisplayMsg: this.formBuilder.control(null, Validators.required),
      txtRefDescription: this.formBuilder.control(null),
      txtRefLink: this.formBuilder.control(null),
      txtDiagTherapeuticLink: this.formBuilder.control(null),
      txtInterDeveloper: this.formBuilder.control(null),
      txtFundingSource: this.formBuilder.control(null),
      txtReleaseVersion: this.formBuilder.control(null),
      txtSPName: this.formBuilder.control(null, Validators.required),
      txtComments: this.formBuilder.control(null),

      txtCriteria: this.formBuilder.control(null),
      txtCitation: this.formBuilder.control(null),
      chkDemographics: this.formBuilder.control(null),
      chkDiagnosis: this.formBuilder.control(null),
      chkVitals: this.formBuilder.control(null),
      chkProcedures: this.formBuilder.control(null),
      chkImmunization: this.formBuilder.control(null),
      chkMedication: this.formBuilder.control(null),
      chkHealthMaintenance: this.formBuilder.control(null),
      chkAllergy: this.formBuilder.control(null),
      chkLifeStyle: this.formBuilder.control(null),
      chkLabs: this.formBuilder.control(null)

    }
    );

  }

  onRefreshRules() {
    this.selectedRuleId = undefined;
    this.getCDCRulesList();
  }

  getCDCRulesList() {

    this.isTreeDataLoading = true;
    this.lstCDSRules = undefined;
    this.rulesTreeNodes = [];

    this.isLoadingRuleData = false;
    //this.isLoading = true;

    this.cdsService.getCDCRulesList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lstCDSRules = data as Array<any>;
        if (this.selectedRuleId == undefined) {
          this.selectedRuleId = this.lstCDSRules[0].id;
        }

        this.populateRulesList();
        this.getCDSRuleById();

        this.isTreeDataLoading = false;
      },
      error => {

        this.isTreeDataLoading = false;
        this.getCDCRulesListError(error);
      }
    );
  }
  getCDCRulesListError(error: any) {
    this.logMessage.log("getCDCRulesList Error." + error);
  }


  getCDSRuleById() {
    this.ruleDetails = undefined;
    this.isLoadingRuleData = true;
    this.cdsService.getCDSRuleById(this.selectedRuleId).subscribe(
      data => {
        this.ruleDetails = data as Array<any>;
        // this.assignRuleFeildsData();
        this.isLoadingRuleData = false;
      },
      error => {

        this.isLoadingRuleData = false;
        this.getCDSRuleByIdError(error);
      }
    );
  }
  getCDSRuleByIdError(error: any) {
    this.logMessage.log("getCDSRuleById Error." + error);
  }

  populateRulesList() {
    debugger;
    this.rulesTreeNodes = [];

    let lstUniqueCategory = (new UniquePipe).transform(this.lstCDSRules, "type")


    for (let a = 0; a < lstUniqueCategory.length; a++) {
      let lstcatg = new ListFilterPipe().transform(this.lstCDSRules, "type", lstUniqueCategory[a].type);
      let ruleChildrenNodes = [];

      if (lstcatg != null) {

        //isSelected: true


        lstcatg.forEach(submCatg => {

          debugger;
          let selected: boolean = false;

          //if (submCatg.id == this.selectedRuleId) {
          //  selected = true;
          //}

          ruleChildrenNodes.push({ id: submCatg.id, name: submCatg.name });
        });

        this.rulesTreeNodes.push({
          id: a + 1,
          name: lstcatg[0].type,
          children: ruleChildrenNodes,
        }
        )
      }
    }
    this.isTreeDataLoading = false;
  }
  onUpdateData(treeComponent: TreeComponent, $event) {
    console.log("onUpdateData", treeComponent, $event);
    treeComponent.treeModel.expandAll();

    const selectedNode = treeComponent.treeModel.getNodeById(this.selectedRuleId);
    selectedNode.setActiveAndVisible();


  }


  onTreeNodeActivate(treeComponent: TreeComponent, event) {
    debugger;

    if (this.addEditView) {
      if (treeComponent.treeModel.activeNodes[0].id !== this.selectedRuleId) {
        const selectedNode = treeComponent.treeModel.getNodeById(this.selectedRuleId);
        selectedNode.setActiveAndVisible();
      }
      else {
        return;
      }
    }
    else {
      //this.clearRuleFeildsData();
      if (event.node.data.children != undefined && event.node.data.children.length > 0) {
        
        this.selectedRuleId = event.node.data.children[0].id;
        const selectedNode = treeComponent.treeModel.getNodeById(this.selectedRuleId);
        selectedNode.setActiveAndVisible();
        
        //this.selectedRuleId = undefined;
        //this.ruleDetails = undefined;
      }
      else {
        this.selectedRuleId = event.node.data.id;
        //this.getCDSRuleById();
      }

      this.getCDSRuleById();
    }
  }

  clearRuleFeildsData() {

    this.formGroup.get("txtRuleGoupName").setValue(null);
    this.formGroup.get("txtRuleName").setValue(null);
    this.formGroup.get("txtDisplayMsg").setValue(null);
    this.formGroup.get("txtRefDescription").setValue(null);
    this.formGroup.get("txtRefLink").setValue(null);
    this.formGroup.get("txtDiagTherapeuticLink").setValue(null);
    this.formGroup.get("txtInterDeveloper").setValue(null);
    this.formGroup.get("txtFundingSource").setValue(null);
    this.formGroup.get("txtReleaseVersion").setValue(null);
    this.formGroup.get("txtSPName").setValue(null);
    this.formGroup.get("txtComments").setValue(null);
    this.formGroup.get("txtCriteria").setValue(null);
    this.formGroup.get("txtCitation").setValue(null);
    this.formGroup.get("chkDemographics").setValue(null);
    this.formGroup.get("chkDiagnosis").setValue(null);
    this.formGroup.get("chkVitals").setValue(null);
    this.formGroup.get("chkProcedures").setValue(null);
    this.formGroup.get("chkImmunization").setValue(null);
    this.formGroup.get("chkMedication").setValue(null);
    this.formGroup.get("chkHealthMaintenance").setValue(null);
    this.formGroup.get("chkAllergy").setValue(null);
    this.formGroup.get("chkLifeStyle").setValue(null);
    this.formGroup.get("chkLabs").setValue(null);

  }
  assignRuleFeildsData() {

    if (this.ruleDetails == undefined)
      return;

    this.formGroup.get("txtRuleGoupName").setValue(this.ruleDetails.rule_group);
    this.formGroup.get("txtRuleName").setValue(this.ruleDetails.rule_name);
    this.formGroup.get("txtDisplayMsg").setValue(this.ruleDetails.notification);
    this.formGroup.get("txtRefDescription").setValue(this.ruleDetails.description);
    this.formGroup.get("txtRefLink").setValue(this.ruleDetails.reference_link);
    this.formGroup.get("txtDiagTherapeuticLink").setValue(this.ruleDetails.diagnostic_therapeutic_link);
    this.formGroup.get("txtInterDeveloper").setValue(this.ruleDetails.intervention_developer);
    this.formGroup.get("txtFundingSource").setValue(this.ruleDetails.funding_source);
    this.formGroup.get("txtReleaseVersion").setValue(this.ruleDetails.release_version);
    this.formGroup.get("txtSPName").setValue(this.ruleDetails.sp_name);
    this.formGroup.get("txtComments").setValue(this.ruleDetails.comments);
    this.formGroup.get("txtCriteria").setValue(this.ruleDetails.criteria_description);
    this.formGroup.get("txtCitation").setValue(this.ruleDetails.citation);
    this.formGroup.get("chkDemographics").setValue(this.ruleDetails.is_demographics);
    this.formGroup.get("chkDiagnosis").setValue(this.ruleDetails.is_diagnosis);
    this.formGroup.get("chkVitals").setValue(this.ruleDetails.is_vitals);
    this.formGroup.get("chkProcedures").setValue(this.ruleDetails.is_procedures);
    this.formGroup.get("chkImmunization").setValue(this.ruleDetails.is_immunization);
    this.formGroup.get("chkMedication").setValue(this.ruleDetails.is_medication);
    this.formGroup.get("chkHealthMaintenance").setValue(this.ruleDetails.is_healthmaintenance);
    this.formGroup.get("chkAllergy").setValue(this.ruleDetails.is_allergy);
    this.formGroup.get("chkLifeStyle").setValue(this.ruleDetails.is_lifestyle);
    this.formGroup.get("chkLabs").setValue(this.ruleDetails.is_labs);
  }

  addRule() {
    this.clearRuleFeildsData();
    this.addEditOperation = OperationType.ADD;
    this.addEditView = true;
  }
  editRule() {
    this.clearRuleFeildsData();
    this.addEditOperation = OperationType.EDIT;
    this.assignRuleFeildsData();
    this.addEditView = true;
  }
  cancelAddEdit() {
    this.clearRuleFeildsData();
    this.addEditOperation = undefined;
    this.addEditView = false;
  }
  saveRule(formData: any) {

    this.isLoadingRuleData = true;

    if (this.validateData(formData)) {

      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
      let ormCDSSave: ORMCDSSave = new ORMCDSSave();

      ormCDSSave.modified_user = this.lookupList.logedInUser.user_name;
      ormCDSSave.client_date_modified = clientDateTime;

      if (this.addEditOperation == OperationType.ADD) {
        ormCDSSave.client_date_created = clientDateTime;
        ormCDSSave.created_user = this.lookupList.logedInUser.user_name;
        //ormCDSSave.practice_id=this.lookupList.logedInUser.practiceId;
      }
      else if (this.addEditOperation == OperationType.EDIT) {
        ormCDSSave.rule_id = this.ruleDetails.rule_id;
        ormCDSSave.date_created = this.ruleDetails.date_created;
        ormCDSSave.client_date_created = this.ruleDetails.client_date_created;
        ormCDSSave.created_user = this.ruleDetails.created_user;
        //ormCDSSave.practice_id=this.ruleDetails.practice_id;
      }

      ormCDSSave.rule_group = formData.txtRuleGoupName;
      ormCDSSave.rule_name = formData.txtRuleName;
      ormCDSSave.notification = formData.txtDisplayMsg;
      ormCDSSave.description = formData.txtRefDescription;
      ormCDSSave.reference_link = formData.txtRefLink;
      ormCDSSave.diagnostic_therapeutic_link = formData.txtDiagTherapeuticLink;
      ormCDSSave.intervention_developer = formData.txtInterDeveloper;
      ormCDSSave.funding_source = formData.txtFundingSource;
      ormCDSSave.release_version = formData.txtReleaseVersion;
      ormCDSSave.sp_name = formData.txtSPName;
      ormCDSSave.comments = formData.txtComments;
      ormCDSSave.criteria_description = formData.txtCriteria;
      ormCDSSave.citation = formData.txtCitation;
      ormCDSSave.is_demographics = formData.chkDemographics;
      ormCDSSave.is_diagnosis = formData.chkDiagnosis;
      ormCDSSave.is_vitals = formData.chkVitals;
      ormCDSSave.is_procedures = formData.chkProcedures;
      ormCDSSave.is_immunization = formData.chkImmunization;
      ormCDSSave.is_medication = formData.chkMedication;
      ormCDSSave.is_healthmaintenance = formData.chkHealthMaintenance;
      ormCDSSave.is_allergy = formData.chkAllergy;
      ormCDSSave.is_lifestyle = formData.chkLifeStyle;
      ormCDSSave.is_labs = formData.chkLabs;
      ormCDSSave.built_in = true;
      ormCDSSave.practice_id = this.lookupList.practiceInfo.practiceId; // will be saved -1 at server side.


      this.cdsService.saveCDSRule(ormCDSSave).subscribe(
        data => {
          this.saveCDSRuleSuccess(data);
        },
        error => {
          this.saveCDSRuleError(error);
        }
      );
    }
    else {
      this.isLoadingRuleData = false;
    }


  }

  saveCDSRuleSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.selectedRuleId = Number(data.result);
      //this.getCDSRuleById();
      this.getCDCRulesList();
      this.addEditView = false;
      this.isLoadingRuleData = false;
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoadingRuleData = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'CDS Rules', data.response, AlertTypeEnum.DANGER)

    }
  }

  saveCDSRuleError(error: any) {
    this.isLoadingRuleData = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'CDS Rules', "An Error Occured while saving CDS Rule.", AlertTypeEnum.DANGER)

  }
  validateData(formData: any): boolean {

    let strErrorMsg: string = "";

    if (formData.txtRuleGoupName == undefined || formData.txtRuleGoupName == "") {
      strErrorMsg = "Please enter rule group name.";
    }
    else if (formData.txtRuleName == undefined || formData.txtRuleName == "") {
      strErrorMsg = "Please enter rule name.";
    }
    else if (formData.txtDisplayMsg == undefined || formData.txtDisplayMsg == "") {
      strErrorMsg = "Please enter display message.";
    }
    else if (formData.txtSPName == undefined || formData.txtSPName == "") {
      strErrorMsg = "Please enter Store Procedure Name.";
    }


    if (strErrorMsg !== "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry Messages', strErrorMsg, AlertTypeEnum.WARNING)

      return false;
    }
    else {
      return true;
    }

  }


  deleteRule() {

    this.addEditOperation = OperationType.DELETE;    

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;


    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {

        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = this.selectedRuleId.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.cdsService.deleteCDSRule(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("Rule has been Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data: any) {

    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.promptHeading = "CDS Rule"
      modalRef.componentInstance.promptMessage = data.response;
    }
    else {
      this.onRefreshRules();
    }
  }


}
