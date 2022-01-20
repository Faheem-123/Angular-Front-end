import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CallingFromEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'timely-access',
  templateUrl: './timely-access.component.html',
  styleUrls: ['./timely-access.component.css']
})
export class TimelyAccessComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  @Input() patientId: number;
  @Input() patientName: string;
  canPrint=false;
  constructor(public activeModal: NgbActiveModal) {
     
   }

  ngOnInit() {  
  }
  
}
