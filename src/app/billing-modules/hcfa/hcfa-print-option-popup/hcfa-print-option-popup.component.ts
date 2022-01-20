import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'hcfa-print-option-popup',
  templateUrl: './hcfa-print-option-popup.component.html',
  styleUrls: ['./hcfa-print-option-popup.component.css']
})
export class HcfaPrintOptionPopupComponent implements OnInit {

  printWithBg:boolean=false;

  constructor(public activeModal: NgbActiveModal) { 

  }

  ngOnInit() {

  }

  onChkHcfaPrintWithBGChanged(event:any){

    debugger;
    this.printWithBg=event.currentTarget.checked;

  }

  okClick() {
    this.activeModal.close({ confirmation: PromptResponseEnum.OK , printWithBg :this.printWithBg })
  }
}
