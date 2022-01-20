import { Component, OnInit, Inject } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'last-note',
  templateUrl: './last-note.component.html',
  styleUrls: ['./last-note.component.css']
})
export class LastNoteComponent implements OnInit {

  header='';
  lstdata;
  callingFrom='';
  patient_id='';
  chart_id='';
  noRecordFound=false;

  constructor(private encounterService:EncounterService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,public activeModal: NgbActiveModal) { }

  ngOnInit() {
    let type='';
    this.encounterService.getChartPreviousData(this.callingFrom,this.patient_id,this.chart_id)
      .subscribe(
        data => {
          debugger;
          this.lstdata = data;
          if (this.lstdata == undefined || this.lstdata.length == 0) {
            debugger;
            this.noRecordFound = true;
          }
          else{
            this.noRecordFound = false;
          }
        },
        error => {
        }
      );
  }
  onNotesAdd(data){
    this.activeModal.close(data);
  }

}
