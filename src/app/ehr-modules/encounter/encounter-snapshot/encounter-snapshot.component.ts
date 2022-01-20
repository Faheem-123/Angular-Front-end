import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EncounterService } from './../../../services/encounter/encounter.service';
import { Component, OnInit, Inject } from '@angular/core';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from '../../../providers/lookupList.module';
import { PatientService } from 'src/app/services/patient/patient.service';

@Component({
  selector: 'encounter-snapshot',
  templateUrl: './encounter-snapshot.component.html',
  styleUrls: ['./encounter-snapshot.component.css']
})
export class EncounterSnapshotComponent implements OnInit {

  lstdata;
  lstTaskData;
  haveTaskData=false;
  constructor(private encounterService:EncounterService,private patientService:PatientService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,public activeModal: NgbActiveModal) { }

  ngOnInit() {

  }

  getPatientVisitSnapShot(data){
    
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
        { name: "chart_id", value: data.chart_id, option: "" },
        { name: "patient_id", value: data.patient_id, option: "" },
        { name: "visit_date", value: data.visit_date, option: "" },
        { name: "appointment_id", value: data.appointment_id, option: "" }
    ];
    this.encounterService.getPatientVisitSnapShot(searchcrit).subscribe(
      data => {
        this.lstdata = data;
      },
      error => {
        
      }
    );  
    this.onTaskClick(data);
  }
  onTaskClick(data) {
    debugger;
    
      let searchcrit: SearchCriteria = new SearchCriteria();
      searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
      searchcrit.param_list = [
        { name: "patient_id", value: data.patient_id, option: "" },
        { name: "visit_date", value: data.visit_date, option: "" },
        { name: "appointment_id", value: data.appointment_id, option: "" }
      ];
      this.patientService.getPatientTaskData(searchcrit).subscribe(
        data => {
          debugger;
          this.lstTaskData = data;
          if (this.lstTaskData.length > 0) {
            this.haveTaskData=true;
            //GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Followup Notes', 'No Followup Task Found.', 'warning');
            return;
          }
          // const modalRef = this.ngbModal.open(PatientTaskDataComponent, this.poupUpOptions);
          // modalRef.componentInstance.lstData = this.lstTaskData;
        },
        error => {
          //this.logMessage.log(error);
        }
      );
  }

}
