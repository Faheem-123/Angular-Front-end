import { Component, OnInit, Input } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'hcfa-viewer',
  templateUrl: './hcfa-viewer.component.html',
  styleUrls: ['./hcfa-viewer.component.css']
})
export class HcfaViewerComponent implements OnInit {

  @Input() url: string;
  safeUrl: SafeUrl;

  constructor(private domSanitizer: DomSanitizer,
    public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.url)
  }

}
