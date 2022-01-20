import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ORM_HealthMaintenance } from 'src/app/models/encounter/ORMHealthMaintenance';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'new-health-maint-popup',
  templateUrl: './new-health-maint-popup.component.html',
  styleUrls: ['./new-health-maint-popup.component.css']
})
export class NewHealthMaintPopupComponent implements OnInit {

  @Input() patient_id;
  @Input() chart_id;
  @Input() default_Provider;
  @Input() default_Location;
  @Input() visit_Date;
  @Output() dataUpdated = new EventEmitter<any>();
  formInput : FormGroup;  
  constructor(private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil, @Inject(LOOKUP_LIST) public lookupList: LookupList,
    public activeModal: NgbActiveModal,private encounterService:EncounterService) { }

  ngOnInit() {
    this.buildForm();
    debugger;
    (this.formInput.get("drpProvider") as FormControl).setValue(this.default_Provider);
    (this.formInput.get("drpLocation") as FormControl).setValue(this.default_Location);
    (this.formInput.get("txtDate") as FormControl).setValue(this.dateTimeUtil.getDateModelFromDateString(this.visit_Date.substring(0,10),DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
  }
  buildForm(){
    this.formInput = this.formBuilder.group({
      txtDate : this.formBuilder.control( null,Validators.required),
      drpProvider : this.formBuilder.control(null,Validators.required),
      drpLocation: this.formBuilder.control(null,Validators.required)
     })
  }
  private objNew: ORM_HealthMaintenance;
  onSubmit(objDetail)
  {
    this.objNew = new ORM_HealthMaintenance();
    this.objNew.patient_id=this.patient_id;
    this.objNew.chart_id=this.chart_id;

    this.objNew.provider_id=objDetail.drpProvider;
    this.objNew.location_id=objDetail.drpLocation;
    this.objNew.visit_date=this.dateTimeUtil.getStringDateFromDateModel(objDetail.txtDate==""?undefined:objDetail.txtDate);

    this.objNew.created_user=this.lookupList.logedInUser.user_name;
    this.objNew.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();

    this.objNew.modified_user = this.lookupList.logedInUser.user_name;
    this.objNew.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString()

    this.objNew.practice_id = this.lookupList.practiceInfo.practiceId.toString();

    this.encounterService.saveHealthMaint(this.objNew).subscribe(
      data => {
        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) 
        {
          debugger;
         //this.dataUpdated.emit(data['result']);
         this.activeModal.close(data['result']);
        }
        else if (data['error'] === ServiceResponseStatusEnum.ERROR) 
        {

        }
      },
      error => {
        //this.showError("An error occured while saving Chart Assessments.");
      }
    );
  }
}
