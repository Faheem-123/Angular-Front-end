import { Component, OnInit, Inject, ViewChildren, QueryList, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportsService } from 'src/app/services/reports.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { excelService } from 'src/app/shared/excelService';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { PatientSubTabsEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';

@Component({
  selector: 'rpt-user-performance',
  templateUrl: './rpt-user-performance.component.html',
  styleUrls: ['./rpt-user-performance.component.css']
})
export class RptUserPerformanceComponent implements OnInit {
  @Input() callingFrom: CallingFromEnum;
  isCollapsed = false;
  searchForm:FormGroup;
  isLoading=false;
  lstClaimDetails;
  lstClaimDetailsDB;
  constructor(private formBuilder:FormBuilder, private dateTimeUtil:DateTimeUtil,private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage,private excel:excelService,private sortFilterPaginationService: SortFilterPaginationService,
    private reportsService: ReportsService,@Inject(LOOKUP_LIST) public lookupList: LookupList,private generalOperation:GeneralOperation) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    debugger;
		this.searchForm = this.formBuilder.group({
      dptoDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpfromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel())     
     })
  }
  searchCriteria: SearchCriteria;
  total_claim_notes=0;
	total_pat_notes=0;
	total_claims=0;
	total_era_payment=0;
	total_eob_payment=0;
	total_cashregister_payment=0;
	total_denail_posted=0;
	total_denail_resolved=0;
  onSearch(frm)
  {
    debugger;
    if((this.searchForm.get('dpfromDate') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.ngbModal,"Validation","Please Enter From Date",'warning')
      return;
    }
    if((this.searchForm.get('dptoDate') as FormControl).value=="")
    {
      GeneralOperation.showAlertPopUp(this.ngbModal,"Validation","Please Enter To Date",'warning')
      return;
    }
    //this.totalBalance = 0;
    
    this.isLoading=true;

    this.searchCriteria=new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];
    
    this.searchCriteria.param_list.push( { name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpfromDate), option: ""});
    this.searchCriteria.param_list.push( { name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dptoDate), option: ""});
    
    this.total_claim_notes=0;
    this.total_pat_notes=0;
    this.total_claims=0;
    this.total_era_payment=0;
    this.total_eob_payment=0;
    this.total_cashregister_payment=0;
    this.total_denail_posted=0;
    this.total_denail_resolved=0;

    this.reportsService.getUserPerformanceReport(this.searchCriteria).subscribe(
      data=>{
        this.lstClaimDetails=data;
        this.lstClaimDetailsDB=data;
      
        for(let i=0;i<this.lstClaimDetails.length;i++)
						{
							this.total_claim_notes +=	Number(this.lstClaimDetails[i].claim_notes==null ? "0.00" : this.lstClaimDetails[i].claim_notes) ;
							this.total_pat_notes +=		Number(this.lstClaimDetails[i].patient_notes==null ? "0.00" : this.lstClaimDetails[i].patient_notes) ;
							this.total_claims +=		    Number(this.lstClaimDetails[i].claims==null ? "0.00" : this.lstClaimDetails[i].claims) ;
							this.total_era_payment +=	Number(this.lstClaimDetails[i].era_payment==null ? "0.00" : this.lstClaimDetails[i].era_payment) ;
							this.total_eob_payment +=	Number(this.lstClaimDetails[i].eob_payment==null ? "0.00" : this.lstClaimDetails[i].eob_payment) ;
							this.total_cashregister_payment +=	Number(this.lstClaimDetails[i].cashRegister_payment==null ? "0.00" : this.lstClaimDetails[i].cashRegister_payment) ;
							this.total_denail_posted +=		Number(this.lstClaimDetails[i].denail_posted==null ? "0.00" : this.lstClaimDetails[i].denail_posted) ;
							this.total_denail_resolved +=	Number(this.lstClaimDetails[i].denail_resolved==null ? "0.00" : this.lstClaimDetails[i].denail_resolved) ;
						}
						this.total_claim_notes=Number(this.total_claim_notes.toFixed(2));
						this.total_pat_notes=Number(this.total_pat_notes.toFixed(2));
						this.total_claims=Number(this.total_claims.toFixed(2));
						this.total_era_payment=Number(this.total_era_payment.toFixed(2));
						this.total_eob_payment=Number(this.total_eob_payment.toFixed(2));
						this.total_cashregister_payment=Number(this.total_cashregister_payment.toFixed(2));
						this.total_denail_posted=Number(this.total_denail_posted.toFixed(2));
						this.total_denail_resolved=Number(this.total_denail_resolved.toFixed(2));
           
        this.isLoading=false;
      },
      error=>{
        this.isLoading=false;
      }
    );
  }
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstClaimDetailsDB, this.headers, this.sortEvent, null, null,'');
    debugger;
    this.lstClaimDetails = sortFilterPaginationResult.list;
  }

}
