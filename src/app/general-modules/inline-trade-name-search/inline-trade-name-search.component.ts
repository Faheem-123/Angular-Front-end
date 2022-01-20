import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'inline-trade-name-search',
  templateUrl: './inline-trade-name-search.component.html',
  styleUrls: ['./inline-trade-name-search.component.css']
})
export class InlineTradeNameSearchComponent implements OnInit {

  @Input() lstTradeNames:Array<any>;
  @Output() onSelect = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  
  constructor() { }

  ngOnInit() { 
  }
}
