import { Component, OnInit, Inject, Input } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ListFilterGeneral } from 'src/app/shared/filter-pipe-general';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { excelService } from 'src/app/shared/excelService';
import { ExcelColumn } from 'src/app/models/general/excel-column';
@Component({
  selector: 'rpt-aging-payer-wise',
  templateUrl: './rpt-aging-payer-wise.component.html',
  styleUrls: ['./rpt-aging-payer-wise.component.css']
})
export class RptAgingPayerWiseComponent implements OnInit {
  @Input() callingFrom: CallingFromEnum;

  isLoading = false;
  lstClaimDetails;
  lstClaimDetailsDB;

  lstFinal: Array<any>;
  searchCriteria: SearchCriteria;
  constructor(private reportsService: ReportsService, @Inject(LOOKUP_LIST) public lookupList: LookupList
    , private excel: excelService) {

  }

  ngOnInit() {
    this.onSearch();
  }

  grand_total_30 = 0;
  grand_total_60 = 0;
  grand_total_90 = 0;
  grand_total_120 = 0;
  grand_total_120Plus = 0;
  grand_total_amount = 0;

  onSearch() {
    this.isLoading = true;
    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];
    let total_30 = 0;
    let total_60 = 0;
    let total_90 = 0;
    let total_120 = 0;
    let total_120Plus = 0;
    let total_amount = 0;

    this.grand_total_30 = 0;
    this.grand_total_60 = 0;
    this.grand_total_90 = 0;
    this.grand_total_120 = 0;
    this.grand_total_120Plus = 0;
    this.grand_total_amount = 0;

    this.reportsService.getBillingAgingPayerWiseSummary(this.searchCriteria).subscribe(
      data => {
        debugger;
        this.lstFinal = new Array();

        this.lstClaimDetailsDB = data;
        this.lstClaimDetails = data;
        let uniquePayerType: any = new UniquePipe().transform(this.lstClaimDetails, "pri_payer_type");
        let grand_toal = 0;
        for (let g = 0; g < this.lstClaimDetails.length; g++) {
          grand_toal += Number(this.lstClaimDetails[g].aging_30) + Number(this.lstClaimDetails[g].aging_60) + Number(this.lstClaimDetails[g].aging_90) + Number(this.lstClaimDetails[g].aging_120) + Number(this.lstClaimDetails[g].aging_120_plus)
        }
        for (let a = 0; a < uniquePayerType.length; a++) {
          if (uniquePayerType[a].pri_payer_type == null || uniquePayerType[a].pri_payer_type == '') {
            this.grand_total_30 += Number(uniquePayerType[a].aging_30);
            this.grand_total_60 += Number(uniquePayerType[a].aging_60);
            this.grand_total_90 += Number(uniquePayerType[a].aging_90);
            this.grand_total_120 += Number(uniquePayerType[a].aging_120);
            this.grand_total_120Plus += Number(uniquePayerType[a].aging_120_plus);

            this.lstFinal.push(
              {
                payer_type: ("Self Pay"),
                payer_number: "Self",
                payer_name: "Self Pay",
                aging_30: Number(uniquePayerType[a].aging_30).toFixed(2),
                aging_60: Number(uniquePayerType[a].aging_60).toFixed(2),
                aging_90: Number(uniquePayerType[a].aging_90).toFixed(2),
                aging_120: Number(uniquePayerType[a].aging_120).toFixed(2),
                aging_120_plus: Number(uniquePayerType[a].aging_120_plus).toFixed(2),
                total: Number(uniquePayerType[a].aging_30) + Number(uniquePayerType[a].aging_60) + Number(uniquePayerType[a].aging_90) + Number(uniquePayerType[a].aging_120) + Number(uniquePayerType[a].aging_120_plus)

              }
            );

            let self_total = Number(uniquePayerType[a].aging_30) + Number(uniquePayerType[a].aging_60) + Number(uniquePayerType[a].aging_90) + Number(uniquePayerType[a].aging_120) + Number(uniquePayerType[a].aging_120_plus)
            this.lstFinal.push(
              {
                payer_type: ("Self Pay Totals"),
                payer_number: "",
                payer_name: "",
                aging_30: Number(uniquePayerType[a].aging_30).toFixed(2),
                aging_30_per: ((Number(uniquePayerType[a].aging_30) / self_total) * 100).toFixed(2) + ' %',
                aging_60: Number(uniquePayerType[a].aging_60).toFixed(2),
                aging_60_per: ((Number(uniquePayerType[a].aging_60) / self_total) * 100).toFixed(2) + ' %',
                aging_90: Number(uniquePayerType[a].aging_90).toFixed(2),
                aging_90_per: ((Number(uniquePayerType[a].aging_90) / self_total) * 100).toFixed(2) + ' %',
                aging_120: Number(uniquePayerType[a].aging_120).toFixed(2),
                aging_120_per: ((Number(uniquePayerType[a].aging_120) / self_total) * 100).toFixed(2) + ' %',
                aging_120_plus: Number(uniquePayerType[a].aging_120_plus).toFixed(2),
                aging_120_plus_per: ((Number(uniquePayerType[a].aging_120_plus) / self_total) * 100).toFixed(2) + ' %',
                total: self_total,
                total_per: ((Number(self_total) / grand_toal) * 100).toFixed(2) + ' %',
              }
            );

            continue;
          }
          let filterObj: any;
          filterObj = { pri_payer_type: uniquePayerType[a].pri_payer_type };
          //All record on payer type search
          let lstfilteredPayer = new ListFilterGeneral().transform(this.lstClaimDetails, filterObj);
          total_30 = 0;
          total_60 = 0;
          total_90 = 0;
          total_120 = 0;
          total_120Plus = 0;
          total_amount = 0;
          //loop for total
          let payer_total = 0;
          for (let c = 0; c < lstfilteredPayer.length; c++) {
            payer_total += Number(lstfilteredPayer[c].aging_30) + Number(lstfilteredPayer[c].aging_60) + Number(lstfilteredPayer[c].aging_90) + Number(lstfilteredPayer[c].aging_120) + Number(lstfilteredPayer[c].aging_120_plus);
          }
          for (let c = 0; c < lstfilteredPayer.length; c++) {
            // let uniquePayerNumber: any = new UniquePipe().transform(lstfilteredPayer[c].pri_payer_number, "pri_payer_number");
            // for(let b=0;b<uniquePayerNumber.length;b++)
            {
              // filterObj = { pri_payer_number: uniquePayerNumber[b].pri_payer_number };
              // let lstfiltereddata = new ListFilterGeneral().transform(this.lstClaimDetails, filterObj);

              total_30 += Number(lstfilteredPayer[c].aging_30);
              total_60 += Number(lstfilteredPayer[c].aging_60);
              total_90 += Number(lstfilteredPayer[c].aging_90);
              total_120 += Number(lstfilteredPayer[c].aging_120);
              total_120Plus += Number(lstfilteredPayer[c].aging_120_plus);
              total_amount = total_30 + total_60 + total_90 + total_120 + total_120Plus;

              this.grand_total_30 += Number(lstfilteredPayer[c].aging_30);
              this.grand_total_60 += Number(lstfilteredPayer[c].aging_60);
              this.grand_total_90 += Number(lstfilteredPayer[c].aging_90);
              this.grand_total_120 += Number(lstfilteredPayer[c].aging_120);
              this.grand_total_120Plus += Number(lstfilteredPayer[c].aging_120_plus);

              this.lstFinal.push(
                {
                  payer_type: (c == 0 ? uniquePayerType[a].pri_payer_type : ""),
                  payer_number: lstfilteredPayer[c].pri_payer_number,
                  payer_name: lstfilteredPayer[c].pri_payer_name,
                  aging_30: Number(lstfilteredPayer[c].aging_30).toFixed(2),
                  // aging_30_per:((Number(lstfilteredPayer[c].aging_30)/payer_total)*100).toFixed(2)+' %',
                  aging_60: Number(lstfilteredPayer[c].aging_60).toFixed(2),
                  //aging_60_per:((Number(lstfilteredPayer[c].aging_60)/payer_total)*100).toFixed(2)+' %',
                  aging_90: Number(lstfilteredPayer[c].aging_90).toFixed(2),
                  //aging_90_per:((Number(lstfilteredPayer[c].aging_90)/payer_total)*100).toFixed(2)+' %',
                  aging_120: Number(lstfilteredPayer[c].aging_120).toFixed(2),
                  //aging_120_per:((Number(lstfilteredPayer[c].aging_120)/payer_total)*100).toFixed(2)+' %',
                  aging_120_plus: Number(lstfilteredPayer[c].aging_120_plus).toFixed(2),
                  //aging_120_plus_per:((Number(lstfilteredPayer[c].aging_120_plus)/payer_total)*100).toFixed(2)+' %',
                  total: Number(lstfilteredPayer[c].aging_30) + Number(lstfilteredPayer[c].aging_60) + Number(lstfilteredPayer[c].aging_90) + Number(lstfilteredPayer[c].aging_120) + Number(lstfilteredPayer[c].aging_120_plus)

                }
              );
            }
          }
          // all total of payer type
          this.lstFinal.push(
            {
              payer_type: (uniquePayerType[a].pri_payer_type + " Totals"),
              payer_number: "",
              payer_name: "",
              aging_30: total_30.toFixed(2),
              aging_30_per: ((Number(total_30) / total_amount) * 100).toFixed(2) + ' %',
              aging_60: total_60.toFixed(2),
              aging_60_per: ((Number(total_60) / total_amount) * 100).toFixed(2) + ' %',
              aging_90: total_90.toFixed(2),
              aging_90_per: ((Number(total_90) / total_amount) * 100).toFixed(2) + ' %',
              aging_120: total_120.toFixed(2),
              aging_120_per: ((Number(total_120) / total_amount) * 100).toFixed(2) + ' %',
              aging_120_plus: total_120Plus.toFixed(2),
              aging_120_plus_per: ((Number(total_120Plus) / total_amount) * 100).toFixed(2) + ' %',
              total: total_amount.toFixed(2),
              total_per: ((Number(total_amount) / grand_toal) * 100).toFixed(2) + ' %',
            }
          );
        }
        let client_total = 0;
        client_total = Number(this.grand_total_30) + Number(this.grand_total_60) + Number(this.grand_total_90) + Number(this.grand_total_120) + Number(this.grand_total_120Plus);
        this.lstFinal.push(
          {
            payer_type: ("Client Totals"),
            payer_number: "",
            payer_name: "",
            aging_30: Number(this.grand_total_30).toFixed(2),
            aging_30_per: ((Number(this.grand_total_30) / client_total) * 100).toFixed(2) + ' %',
            aging_60: Number(this.grand_total_60).toFixed(2),
            aging_60_per: ((Number(this.grand_total_60) / client_total) * 100).toFixed(2) + ' %',
            aging_90: Number(this.grand_total_90).toFixed(2),
            aging_90_per: ((Number(this.grand_total_90) / client_total) * 100).toFixed(2) + ' %',
            aging_120: Number(this.grand_total_120).toFixed(2),
            aging_120_per: ((Number(this.grand_total_120) / client_total) * 100).toFixed(2) + ' %',
            aging_120_plus: Number(this.grand_total_120Plus).toFixed(2),
            aging_120_plus_per: ((Number(this.grand_total_120Plus) / client_total) * 100).toFixed(2) + ' %',
            total: client_total,
            total_per: ((Number(client_total) / grand_toal) * 100).toFixed(2) + ' %',
          }
        );
        this.isLoading = false;
      },
      error => {
        //this.logMessage.log(error);
        this.isLoading = false;
      }
    );
  }
  exportAsXLSX() {
    //this.excel.exportAsExcelFile(this.lstFinal,'payer_type,payer_number,payer_name,aging_30,aging_60,aging_90,aging_120,aging_120_plus,total', 'Rpt_Aging_Summary');
    let lstColumns: Array<any> = new Array<any>();
    lstColumns = [
      new ExcelColumn('payer_type', 'Payer Type'),
      new ExcelColumn('payer_number', 'Payer Number'),
      new ExcelColumn('payer_name', 'Payer Name'),

      new ExcelColumn('aging_30', '30 Days', 'number'),
      new ExcelColumn('aging_30_per', '30 Days %'),
      new ExcelColumn('aging_60', '60 Days', 'number'),
      new ExcelColumn('aging_60_per', '60 Days %'),
      new ExcelColumn('aging_90', '90 Days', 'number'),
      new ExcelColumn('aging_90_per', '90 Days %'),
      new ExcelColumn('aging_120', '120 Days', 'number'),
      new ExcelColumn('aging_120_per', '120 Days %'),
      new ExcelColumn('aging_120_plus', '120+ Days', 'number'),
      new ExcelColumn('aging_120_plus_per', '120+ Days %'),
      new ExcelColumn('total', 'Total', 'number'),
      new ExcelColumn('total_per', 'Total %'),
    ]

    this.excel.exportAsExcelFileWithHeaders(this.lstFinal, lstColumns, 'Rpt_Aging_Summary');
  }

}
