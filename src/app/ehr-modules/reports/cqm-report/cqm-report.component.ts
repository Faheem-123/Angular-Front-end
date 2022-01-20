import { Component, OnInit, Inject, ElementRef } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DomSanitizer } from '@angular/platform-browser';
import { APP_CONFIG, AppConfig } from 'src/app/providers/app-config.module';

@Component({
  selector: 'cqm-report',
  templateUrl: './cqm-report.component.html',
  styleUrls: ['./cqm-report.component.css']
})
export class CqmReportComponent implements OnInit {

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,private domSanitizer : DomSanitizer
  ,private hostElement: ElementRef,@Inject(APP_CONFIG) private config: AppConfig) { }

  strLink:string="";
  ngOnInit() {
    debugger;
    this.strLink=this.config.flexApplink;
    this.strLink+="user_id="+this.lookupList.logedInUser.userId;
    this.strLink+="&user_name="+this.lookupList.logedInUser.user_name;
    this.strLink+="&practice_id="+this.lookupList.practiceInfo.practiceId;
    this.strLink+="&calling_from=CQM";

    const iframe = this.hostElement.nativeElement.querySelector('iframe');
    iframe.src = this.strLink;
  }

}
