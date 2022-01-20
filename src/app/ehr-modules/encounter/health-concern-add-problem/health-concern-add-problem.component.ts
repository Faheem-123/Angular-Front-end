import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'app-health-concern-add-problem',
  templateUrl: './health-concern-add-problem.component.html',
  styleUrls: ['./health-concern-add-problem.component.css']
})
export class HealthConcernAddProblemComponent implements OnInit {
  @Output() onSelect = new EventEmitter<any>();
  @Input() chart_id;
  listChartProblems;
  isLoading=false;
  noRecordFound=false;
  listSelectedChartProblems;
  constructor(private encounterService: EncounterService,public activeModal: NgbActiveModal
    ,@Inject(LOOKUP_LIST) public lookupList: LookupList,public generalOp:GeneralOperation) { }

  ngOnInit() {
    this.getChartProblem("all");
    this.listSelectedChartProblems = new Array<any>();
  }
  getChartProblem(option) {
    debugger
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "chart_id", value: this.chart_id.toString(), option: "" },
      { name: "diag_option", value: option, option: "" }
    ];

    this.encounterService.getChartProblem(searchCriteria)
      .subscribe(
        data => {
          debugger
          this.listChartProblems = data;

          if (this.listChartProblems == undefined || this.listChartProblems.length == 0) {
            this.noRecordFound = true;
          }
          else
            this.noRecordFound = false;

          this.isLoading = false;;
        },
        error => {
          this.isLoading = false;
        }
      );
  }
  onAddProblems(){
    debugger
    this.activeModal.close(this.listSelectedChartProblems)
  }
  onSelected(event,obj)
  {
    debugger
    if (event.target.checked==true)
    {
      let objP: any = {
        problem_id: obj.problem_id,
        diag_description: obj.diag_description,
        diag_code: obj.diag_code,
      };
      this.listSelectedChartProblems.push(objP);
    }
    else{
      this.listSelectedChartProblems.splice(this.generalOp.getitemIndex(this.listSelectedChartProblems,"problem_id",obj.problem_id));
    }
  }
}
