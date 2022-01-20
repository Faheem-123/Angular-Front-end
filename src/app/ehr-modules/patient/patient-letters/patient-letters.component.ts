import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'patient-letters',
  templateUrl: './patient-letters.component.html',
  styleUrls: ['./patient-letters.component.css']
})
export class PatientLettersComponent implements OnInit {
isNewLetter=false;
isLetterTemplate=false;
isSummary=true;
  constructor() { }

  ngOnInit() {
  }
  onNewLetter(){
    this.isNewLetter=true;
    this.isSummary=false;

  }
  onLetterTemplate(){
    this.isLetterTemplate=true;
    this.isSummary=false;
  }

}
