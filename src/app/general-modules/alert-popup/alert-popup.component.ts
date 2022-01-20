import { Component, OnInit,Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum, AlertTypeEnum } from '../../shared/enum-util';

@Component({
  selector: 'alert-popup',
  templateUrl: './alert-popup.component.html',
  styleUrls: ['./alert-popup.component.css']
})
export class AlertPopupComponent implements OnInit {

  @Input() promptHeading:string;
  @Input() promptMessage:string;
  @Input() alertType:string=AlertTypeEnum.INFO;

  constructor(public activeModal: NgbActiveModal) { 
  }
  
  ngOnInit() {
  }

  okClicked(){
   this.activeModal.close(PromptResponseEnum.OK); 
  }
}
