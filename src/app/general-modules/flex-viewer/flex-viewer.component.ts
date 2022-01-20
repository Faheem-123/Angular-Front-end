import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'flex-viewer',
  templateUrl: './flex-viewer.component.html',
  styleUrls: ['./flex-viewer.component.css']
})
export class FlexViewerComponent implements OnInit {

  link="http://localhost:8001/ihc-mu//Main.html";
  constructor(private modalService: NgbModal,public activeModal:NgbActiveModal) { }
  flex_variables;
 
  ngOnInit() {
    
  }


}
