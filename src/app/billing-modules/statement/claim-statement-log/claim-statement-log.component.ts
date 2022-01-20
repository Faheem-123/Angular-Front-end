import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ReportsService } from 'src/app/services/reports.service';
import { NgbModal, NgbActiveModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LogMessage } from 'src/app/shared/log-message';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ReferralViewersComponent } from 'src/app/general-modules/referral-viewers/referral-viewers.component';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'claim-statement-log',
  templateUrl: './claim-statement-log.component.html',
  styleUrls: ['./claim-statement-log.component.css']
})
export class ClaimStatementLogComponent implements OnInit {

  constructor( private formBuilder: FormBuilder,@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private dateTimeUtil: DateTimeUtil,private claimService:ClaimService,public activeModal: NgbActiveModal,
  private logMessage: LogMessage,private reportsService: ReportsService,private generalOperation: GeneralOperation,
  private ngbModal: NgbModal) { }
  patient_id;
  logType: string = "statement";
  searchForm: FormGroup;
  listStatementLog;
  ngOnInit() {
    this.buildForm();
    this.getStatementLog();
  }
  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  getStatementLog(){
    this.claimService.getPatientStatementLog(this.patient_id).subscribe(
      data=>{
        this.listStatementLog=data;

        let uniqueStatement: any = new UniquePipe().transform(this.listStatementLog, "statement_date");
        if (uniqueStatement != undefined && uniqueStatement.length > 0) 
        {
          for(let a=0;a<uniqueStatement.length;a++)
          {
            let total_amt_Sent=0;
            for(let b=0;b<this.listStatementLog.length;b++)
            {
              if(uniqueStatement[a].statement_date==this.listStatementLog[b].statement_date)
              {
                total_amt_Sent+= Number(this.listStatementLog[b].amt_sent);
              }
            }
            //update amt in list 
            for(let b=0;b<this.listStatementLog.length;b++)
            {
              if(uniqueStatement[a].statement_date==this.listStatementLog[b].statement_date)
              {
                this.listStatementLog[b].total_amt_sent=total_amt_Sent;
              }
            }
          }
        }
      },error=>{

      }
    );
  }
  onDateTypeChange(type: string) {
    this.logType = type;
  }
  buildForm() {
    this.searchForm = this.formBuilder.group({
      logType: this.formBuilder.control(this.logType)}
      );  
  }
  lgPopUpOptions: NgbModalOptions = {
		backdrop: 'static',
		keyboard: false,
		size: 'lg'
	};
  onShowGeneratedStatement(path)
  {
    debugger;
    let docPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientStatement");
    let generated_pdf_url_temp = this.generalOperation.ReplaceAll((docPath[0].download_path + this.lookupList.practiceInfo.practiceId + "/PatientStatement/" + path).toString(), "\\", "/");
    //this.generated_pdf_path_temp = (docPath[0].upload_path + this.lookupList.practiceInfo.practiceId + "/PatientStatement/" + path).toString();//2019/05/27/456.pdf
          
    const modalRef = this.ngbModal.open(ReferralViewersComponent, this.lgPopUpOptions);
					modalRef.componentInstance.path_doc = generated_pdf_url_temp;//docPath[0].download_path+this.lookupList.practiceInfo.practiceId+"\\PatientDocuments\\temp\\"+data['result'];
					modalRef.componentInstance.width = '800px';
					modalRef.componentInstance.header = 'Patient Statement';
					modalRef.componentInstance.showButtons = false;
  }
}
