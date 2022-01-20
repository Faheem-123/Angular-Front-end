import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'insurance-main',
  templateUrl: './insurance-main.component.html',
  styleUrls: ['./insurance-main.component.css']
})
export class InsuranceMainComponent implements OnInit {
module_name='ins-type'
  constructor() { }

  ngOnInit() {
  }
  generalOnChange(value)
  {
    debugger;
    this.module_name=value;    
  }
}
