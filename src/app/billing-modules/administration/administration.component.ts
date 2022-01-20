import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.css']
})
export class AdministrationComponent implements OnInit {
  callingFrom='';
  constructor() { }

  ngOnInit() {
    this.callingFrom ="billing";
  }

}
