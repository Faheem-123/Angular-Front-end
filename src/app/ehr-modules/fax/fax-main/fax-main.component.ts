import { Component, OnInit, Inject } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbTabChangeEvent, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FaxParam } from '../new-fax/fax-parm';
import { NewFaxComponent } from '../new-fax/new-fax.component';

@Component({
  selector: 'fax-main',
  templateUrl: './fax-main.component.html',
  styleUrls: ['./fax-main.component.css']
})
export class FaxMainComponent implements OnInit {


  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };


  selectedTab: string = "tab_fax_received";
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private ngbModal: NgbModal) {

  }
  strLink: string = "";

  ngOnInit() {

    /*
    this.strLink = this.config.flexApplink;
    this.strLink += "user_id=" + this.lookupList.logedInUser.userId;
    this.strLink += "&user_name=" + this.lookupList.logedInUser.user_name;
    this.strLink += "&practice_id=" + this.lookupList.practiceInfo.practiceId;
    this.strLink += "&calling_from=Fax_Main";

    const iframe = this.hostElement.nativeElement.querySelector('iframe');
    iframe.src = this.strLink;
    */
  }

  onTabChange(event: NgbTabChangeEvent) {

    switch (event.nextId) {
      case "tab_fax_received":
      case "tab_fax_sent":
        this.selectedTab = event.nextId;
        break;
      case "tab_fax_new":
        event.preventDefault();
        this.openSendFaxPopUp();
        break;


      default:
        break;
    }

  }


  openSendFaxPopUp() {

    const modalRef = this.ngbModal.open(NewFaxComponent, this.lgPopUpOptions);

    modalRef.componentInstance.title = "New Fax";
    modalRef.componentInstance.lstAttachments = undefined;
    modalRef.componentInstance.callingFrom = "fax";
    modalRef.componentInstance.operation = "new_fax";
    modalRef.componentInstance.faxParam = undefined;

    modalRef.result.then((result) => {
      if (result) {
      }
    }, (reason) => {

    });
  }

}
