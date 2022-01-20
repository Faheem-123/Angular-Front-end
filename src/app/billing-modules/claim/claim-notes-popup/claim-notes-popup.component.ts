import { Component, OnInit, Input } from '@angular/core';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'claim-notes-popup',
  templateUrl: './claim-notes-popup.component.html',
  styleUrls: ['./claim-notes-popup.component.css']
})
export class ClaimNotesPopupComponent implements OnInit {

  @Input() openedClaimInfo: OpenedClaimInfo;
    
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

}
