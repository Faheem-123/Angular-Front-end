import { Component, OnInit, Inject,Input } from '@angular/core';
//import {MD_DIALOG_DATA} from '@angular/material';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum } from '../../shared/enum-util';

@Component({
  selector: 'confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.css']
})
export class ConfirmationPopupComponent implements OnInit {

  @Input() promptHeading:string;
  @Input() promptMessage:string;
  @Input() alertType:string="info";
  //@input() promptHeading;
  //promptMessage;

  constructor(public activeModal: NgbActiveModal) { 
    //this.promptMessage=data.prompt_message;
    //this.promptHeading=data.prompt_heading;    
  }

  yesClick(){
    this.activeModal.close(PromptResponseEnum.YES)
  }

  noClick(){
    this.activeModal.close(PromptResponseEnum.NO)
    this.activeModal.dismiss();
  }
  
  ngOnInit() {
  }

}
