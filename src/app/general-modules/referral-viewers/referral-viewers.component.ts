import { Component, OnInit, Input, HostListener } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'referral-viewers',
  templateUrl: './referral-viewers.component.html',
  styleUrls: ['./referral-viewers.component.css']
})
export class ReferralViewersComponent implements OnInit {

  showButtons=true;
  current_url: SafeUrl;
  path_doc;
  header='Document Viewer';
  constructor(private domSanitizer : DomSanitizer,public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.current_url=this.domSanitizer.bypassSecurityTrustResourceUrl(this.path_doc)
  }
  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  onSave(){
    this.activeModal.close("SAVE");
  }
  onSaveFax(){
    this.activeModal.close("SAVEFAX");
  }
  onSaveDownload(){
    this.activeModal.close("SAVEDOWNLOAD");
  }

}
