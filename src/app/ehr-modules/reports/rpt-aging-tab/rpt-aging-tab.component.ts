import { Component, OnInit, Input } from '@angular/core';
import { CallingFromEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'rpt-aging-tab',
  templateUrl: './rpt-aging-tab.component.html',
  styleUrls: ['./rpt-aging-tab.component.css']
})
export class RptAgingTabComponent implements OnInit {
  @Input() callingFrom: CallingFromEnum;

  constructor() { 


  }
  //radioForm: FormGroup;

  ngOnInit() {

    debugger;
    //this.buildForm();
  }

  //buildForm() {
  //    this.radioForm = this.formBuilder.group({
  //radioOption: this.formBuilder.control('aging'),
  //}
  //);
  //}
  //showReport = "aging";
  //dataOption = "aging";
  /*
  onRadioOptionChange(value) {
    switch (value.toLowerCase()) {
      case "aging":
        this.dataOption = "aging";
        this.showReport = "aging";

        break;
      case "payer":
        this.dataOption = "payer";
        this.showReport = "payer";
        break;


      default:
        break;
    }

  }
  */
}
