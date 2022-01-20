import { Component, OnInit, Inject, Input, OnChanges } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { SetupService } from 'src/app/services/setup.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ORMRoleCDSRules } from 'src/app/models/setting/ORMRoleCDSRules';

@Component({
  selector: 'cdr-rules',
  templateUrl: './cdr-rules.component.html',
  styleUrls: ['./cdr-rules.component.css']
})
export class CdrRulesComponent implements OnChanges {
  @Input() role_id;
  lstCDR
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,private dateTimeUtil:DateTimeUtil
  ,private setupService: SetupService ,  private generalOperation: GeneralOperation,
  private modalService: NgbModal) { }

  ngOnInit() {
  }

  ngOnChanges() {
    debugger
    if(this.role_id!="")
        this.getList() ;
  }
  getList() {
    this.setupService.getPracticeRoleCDSRules(this.lookupList.practiceInfo.practiceId.toString(),this.role_id).subscribe(
        data => {
          debugger;
            this.lstCDR = data as Array<any>;
        },
        error => {
        }
    );
}
IsSelectAll(value) {
  for (var i = 0; i < this.lstCDR.length; i++) {
    this.lstCDR[i].is_active_role = value;
  }
}
onshowRef(value)
{
  for (var i = 0; i < this.lstCDR.length; i++) {
    this.lstCDR[i].show_reference_link = value;
  }
}
IsSelect(value, doc) {
  this.lstCDR[this.generalOperation.getElementIndex(this.lstCDR, doc)].is_active_role = value;
}
arrModuleSave : Array<ORMRoleCDSRules>=new Array;
onSave(){
debugger;
this.arrModuleSave=new Array()
  let objSave:ORMRoleCDSRules;
  for(let i=0;i<this.lstCDR.length;i++)
  {
    objSave=new  ORMRoleCDSRules(); 
    if(this.lstCDR[i].id!=null && this.lstCDR[i].id!="")
    {
      objSave.id=this.lstCDR[i].id;
    }  
      objSave.role_id=this.role_id;
      objSave.rule_id=this.lstCDR[i].rule_id;
      objSave.practice_id=this.lookupList.practiceInfo.practiceId.toString();    
      objSave.is_active=this.lstCDR[i].is_active_role;
      objSave.modified_user=this.lookupList.logedInUser.user_name;    
      objSave.client_date_modified=this.dateTimeUtil.getCurrentDateTimeString();
      objSave.show_reference_link=this.lstCDR[i].show_reference_link ==true?true:false; 

      this.arrModuleSave.push(objSave);

  }
  if(this.arrModuleSave.length>0)
  {
    this.setupService.SaveRoleCDS(this.arrModuleSave).subscribe(
      data => {
        debugger;
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) 
        {
          const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
          modalRef.componentInstance.promptHeading = "CDS Rules"
          modalRef.componentInstance.promptMessage = "Record Save Successfully";
          modalRef.componentInstance.alertType = 'info';
      }},
      error => {
      }
    );
  }
}
poupUpOptions: NgbModalOptions = {
  backdrop: 'static',
  keyboard: false,
  centered: true
};
}
