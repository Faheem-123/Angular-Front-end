import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ReportsService } from 'src/app/services/reports.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { UniquePipe } from 'src/app/shared/unique-pipe';

@Component({
  selector: 'rpt-source-wise-collection',
  templateUrl: './rpt-source-wise-collection.component.html',
  styleUrls: ['./rpt-source-wise-collection.component.css']
})
export class RptSourceWiseCollectionComponent implements OnInit {

  isLoading=false;
  searchForm:FormGroup;
  acCollectionSummary;
  acCollectionDetail;
  constructor( private formBuilder:FormBuilder, private dateTimeUtil:DateTimeUtil,
    private ngbModal: NgbModal, private logMessage: LogMessage,
    private reportsService: ReportsService,@Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm(){
    
    let currentDateModel = this.dateTimeUtil.getCurrentDateModel();
    this.searchForm = this.formBuilder.group({
      txtDateFrom: this.formBuilder.control(currentDateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      txtDateTo: this.formBuilder.control(currentDateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ]))
    })
  }
  validateSearchData(formData: any): boolean {
    let strMsg: string = '';
    if (formData.txtDateFrom != undefined && formData.txtDateFrom != '' && !this.dateTimeUtil.isValidDateTime(formData.txtDateFrom, DateTimeFormat.DATE_MODEL)) {
      strMsg = "Date From is not in correct formate.";
    }
    else if (formData.txtDateTo != undefined && formData.txtDateTo != '' &&strMsg ==''  && !this.dateTimeUtil.isValidDateTime(formData.txtDateTo, DateTimeFormat.DATE_MODEL)) {
      strMsg = "Date To is not in correct formate.";
    }
    if (strMsg != '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Validation', strMsg, AlertTypeEnum.WARNING)
      return false;
    }
    return true;
  }
  searchCriteriaMain: SearchCriteria = new SearchCriteria();
  onSearch(formData)
  {
    this.acCollectionSummary = undefined;
    if (!this.validateSearchData(formData)) {
      return;
    }

    this.isLoading = true;
    this.searchCriteriaMain = new SearchCriteria();

    this.searchCriteriaMain.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteriaMain.param_list = [];
    
    if (formData.txtDateFrom != undefined && formData.txtDateFrom != '') {
      this.searchCriteriaMain.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.txtDateFrom, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: formData.dateType });
    }
    if (formData.txtDateTo != undefined && formData.txtDateTo != '') {
      this.searchCriteriaMain.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModelWithFormat(formData.txtDateTo, DateTimeFormat.DATEFORMAT_YYYY_MM_DD), option: formData.dateType });
    }
    this.reportsService.getSourceWiseCollection(this.searchCriteriaMain).subscribe(
      data => {
        debugger;
        this.acCollectionDetail = data as Array<any>;
        this.acCollectionSummary = new Array<any>();
        if (this.acCollectionDetail.length > 0) {
          let month_name = "";
          let s_no = "";
          let recv_Total: number = 0;
          let posted_rec_Total: number = 0;
          let posted_Total: number = 0;
          let tempUnique: Array<any> = new UniquePipe().transform(this.acCollectionDetail, "month_name");
          tempUnique.forEach(groupElement => {
            month_name = groupElement.month_name;
            s_no=groupElement.s_no;
            recv_Total = 0;
            posted_rec_Total = 0;
            posted_Total = 0;

            this.acCollectionDetail.forEach(detailElemnt => {
              if (groupElement.month_name == detailElemnt.month_name) {
                recv_Total += Number(detailElemnt.received_amount);
                posted_rec_Total += Number(detailElemnt.posted_from_received);
                posted_Total += Number(detailElemnt.total_posted);
              }
            });
           
            this.acCollectionSummary.push({
              s_no:s_no,
              month_name: String(month_name),
              received_amount: Number(recv_Total),
              posted_from_received: Number(posted_rec_Total),
              total_posted: Number(posted_Total)
            }
            );
          });
          
        }
        this.isLoading = false;       
      },
      error => {
        this.isLoading = false;
        this.logMessage.log("getSourceWiseCollection Error." + error);
      }
    );
  }
}
