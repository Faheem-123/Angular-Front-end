import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'rpt-payment-collection',
  templateUrl: './rpt-payment-collection.component.html',
  styleUrls: ['./rpt-payment-collection.component.css']
})
export class RptPaymentCollectionComponent implements OnInit {

  @Input() calling_from='';
  constructor() { }

  ngOnInit() {
  }

}
