import { Component, OnInit, Input, Inject } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { stat } from 'fs';

@Component({
  selector: 'summary-problems',
  templateUrl: './summary-problems.component.html',
  styleUrls: ['./summary-problems.component.css']
})
export class SummaryProblemsComponent implements OnInit {


  @Input() patientId;
  lstProblems;
  isLoding: boolean = true;

  constructor(private patientService: PatientService,private encounterService: EncounterService,
    private logMessage: LogMessage, private modalService: NgbModal,@Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    this.getProblemsSummary();
  }

  getProblemsSummary() {
    this.isLoding = true;
    this.lstProblems = undefined;
    this.patientService.getProblemsSummary(this.patientId).subscribe(
      data => {
        this.isLoding = false;
        this.lstProblems = data;
      },
      error => {
        this.isLoding = false;
        this.onProblemsSummaryError(error);
      }
    );
  }
  onProblemsSummaryError(error) {
    this.logMessage.log("getAllergiesSummary Error.");
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };
  onResolve(id,status){
    
    let  msg="Are you sure you want to "+status+" selected Problem ?"
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Problem Resolve';
    modalRef.componentInstance.promptMessage = msg;
    modalRef.componentInstance.alertType='info';
    let closeResult;

    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.YES) {
        let searchCriteria:SearchCriteria=new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "user", value: this.lookupList.logedInUser.user_name,option: "" },
          { name: "problem_id", value: id,option: "" },
          { name: "status", value: status,option: "" },
        ];
        this.encounterService.resolveProblem(searchCriteria).subscribe(
          data => {
            const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
            modalRef.componentInstance.promptHeading = 'Confirm Resolve !';
            modalRef.componentInstance.promptMessage = "Problem Resolved Successfully.";
            modalRef.componentInstance.alertType = 'info';
            this.getProblemsSummary();
          },
          error => {
            this.logMessage.log("signLabOrder " + error);
          }
        );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onInactive(){

  }
}
