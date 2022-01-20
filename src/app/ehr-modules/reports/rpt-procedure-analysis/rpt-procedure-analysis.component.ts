import { Component, OnInit, Inject } from '@angular/core';
import { NgbDatepickerNavigateEvent } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportsService } from 'src/app/services/reports.service';
import { DateModel } from 'src/app/models/general/date-model';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ExcelColumn } from 'src/app/models/general/excel-column';
import { excelService } from 'src/app/shared/excelService';
@Component({
  selector: 'rpt-procedure-analysis',
  templateUrl: './rpt-procedure-analysis.component.html',
  styleUrls: ['./rpt-procedure-analysis.component.css']
})
export class RptProcedureAnalysisComponent implements OnInit {

  FromyearMonth:string='';
  ToyearMonth:string='';
  yearMonthDisplay:string='';
  lstlaggedCollection;  
  lstCharges;  
  lstBottomSummary;  
  lstlaggedCollectionFinal;
  isLoading: boolean = false;
  LaggedCollectionForm: FormGroup;
  lstHeader: Array<any>;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private logMessage: LogMessage,private excel:excelService,
  private dateTimeUtil: DateTimeUtil,
  private reportsService: ReportsService,
  private modalService: NgbModal,
  private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.isLoading=true;
    this.buildForm();
    this.isLoading=false;
  }
  buildForm() {
debugger;
    let today: DateModel = this.dateTimeUtil.getCurrentDateModel();
    this.FromyearMonth = String("0000" + (today.year-1)).slice(-4) + '-' + String("00" + (today.month-1)).slice(-2);
    this.ToyearMonth = String("0000" + today.year).slice(-4) + '-' + String("00" + today.month).slice(-2);

    this.LaggedCollectionForm = this.formBuilder.group({
      dpFromMonthYear: this.formBuilder.control(this.FromyearMonth),
      dpToMonthYear: this.formBuilder.control(this.ToyearMonth)
    })
  }
  dateFromNavigate($event: NgbDatepickerNavigateEvent) {
    this.FromyearMonth = String("0000" + $event.next.year).slice(-4) + '-' + String("00" + $event.next.month).slice(-2);
  }
  dateToNavigate($event: NgbDatepickerNavigateEvent) {
    this.ToyearMonth = String("0000" + $event.next.year).slice(-4) + '-' + String("00" + $event.next.month).slice(-2);
  }
  onSearch(){
    debugger;    
    if (this.FromyearMonth != undefined && this.FromyearMonth != '' && !this.dateTimeUtil.isValidDateTime(this.FromyearMonth, DateTimeFormat.DATEFORMAT_YYYY_MM)) {      
      GeneralOperation.showAlertPopUp(this.modalService, 'Year Month Selection', "From Month and or Year is invalid.", AlertTypeEnum.WARNING);
      return;
    }
    if (this.ToyearMonth != undefined && this.ToyearMonth != '' && !this.dateTimeUtil.isValidDateTime(this.ToyearMonth, DateTimeFormat.DATEFORMAT_YYYY_MM)) {      
      GeneralOperation.showAlertPopUp(this.modalService, 'Year Month Selection', "To Month and or Year is invalid.", AlertTypeEnum.WARNING);
      return;
    }
    this.isLoading = true; //bloack UI
   
    //this.yearMonthDisplay=this.dateTimeUtil.convertDateTimeFormat(this.yearMonth,DateTimeFormat.DATEFORMAT_YYYY_MM,DateTimeFormat.DATEFORMAT_MMMM_YYYY);


    let providerWiseCollSearch: SearchCriteria = new SearchCriteria();
    providerWiseCollSearch.practice_id = this.lookupList.practiceInfo.practiceId;
    providerWiseCollSearch.param_list = [];

    //providerWiseCollSearch.param_list.push({ name: "dateFromProviderWise", value: this.dateFromProviderWise, option: "" });
    providerWiseCollSearch.param_list.push({ name: "dateFrom", value: this.FromyearMonth, option: "" });
    providerWiseCollSearch.param_list.push({ name: "dateTo", value: this.ToyearMonth, option: "" });
    
    this.lstHeader=new Array();
    this.lstlaggedCollection=new Array();
    this.lstCharges=new Array();
    this.lstBottomSummary=new Array();
    this.reportsService.getProcedureAnalysis(providerWiseCollSearch).subscribe(
      data => {
        debugger;

        this.lstlaggedCollection =  data;   
        this.lstHeader.push(
          {
            header:""
          });
      
        for(let a=0;a<data['length'];a++)
        {
          if(data[a][0]==0)
          {
            if(data[a][1]=="ZTotal")
            {
              this.lstHeader.push(
                {
                  header:"Total"
                });
            }
          }
          else if(data[a][0]<0)
          {
              if(data[a][1].split('-')[1]=="01")
              {
                data[a][1]="Jan "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="02")
              {
                data[a][1]="Feb "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="03")
              {
                data[a][1]="Mar "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="04")
              {
                data[a][1]="Apr "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="05")
              {
                data[a][1]="May "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="06")
              {
                data[a][1]="Jun "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="07")
              {
                data[a][1]="Jul "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="08")
              {
                data[a][1]="Aug "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="09")
              {
                data[a][1]="Sep "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="10")
              {
                data[a][1]="Oct "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="11")
              {
                data[a][1]="Nov "+data[a][1].split('-')[0];
              }
              else if(data[a][1].split('-')[1]=="12")
              {
                data[a][1]="Dec "+data[a][1].split('-')[0];
              }
            this.lstHeader.push(
              {
                header:data[a][1]
              });
            }
        }
        //
        this.lstHeader.push(
          {
            header:"Average"
          });

        for (let i: number = this.lstlaggedCollection.length - 1; i >= 0; i--) {

          if(this.lstlaggedCollection[i][0]<0 ) 
          {
             if(this.lstlaggedCollection[i][0]!='0')
               this.lstlaggedCollection.splice(i, 1);
           
          }
          else if(this.lstlaggedCollection[i][0]=='0')
              this.lstlaggedCollection[i][1]='Total';
          // else if(this.lstlaggedCollection[i][0]==0)
          // {
          //   if(this.lstlaggedCollection[i][1]=="Charges and Collections")
          //   {
          //     this.lstCharges.splice(0,0,this.lstlaggedCollection[i])
          //   }            
          //   if(this.lstlaggedCollection[i][1]=="Procedures")
          //   {
          //     this.lstCharges.splice(1,0,this.lstlaggedCollection[i])
          //   }
          //   else if(this.lstlaggedCollection[i][1]=="Avg. Charge per Procedure")
          //   {
          //     this.lstCharges.splice(2,0,this.lstlaggedCollection[i])
          //   }
          //   else if(this.lstlaggedCollection[i][1]=="Gross Charges")
          //   {
          //     this.lstCharges.splice(3,0,this.lstlaggedCollection[i])
          //   }
          //   else if(this.lstlaggedCollection[i][1]=="Less Adjustments")
          //   {
          //     this.lstlaggedCollection.splice(0,0,this.lstlaggedCollection[i])
          //   }
          //   //Botom Summary
          //   else if(this.lstlaggedCollection[i][1]=="Payment")
          //   {
          //     this.lstBottomSummary.splice(0,0,this.lstlaggedCollection[i])
          //   }
          //   else if(this.lstlaggedCollection[i][1]=="Refund")
          //   {
          //     this.lstBottomSummary.splice(1,0,this.lstlaggedCollection[i])
          //   }
          //   else if(this.lstlaggedCollection[i][1]=="Write-Offs")
          //   {
          //     this.lstBottomSummary.splice(2,0,this.lstlaggedCollection[i])
          //   }
          //   //this.lstCharges.push(this.lstlaggedCollection[i])
            
          //   this.lstlaggedCollection.splice(i, 1);
          // }
        }
        //Top Total        
        // for(let a=0;a<this.lstCharges.length;a++)
        // {
        //   if(this.lstCharges[a][1]=="Charges and Collections" ||this.lstCharges[a][1]== "Less Adjustments")
        //   {
        //     this.lstCharges[a][2]="";
        //     continue;
        //   }
        //   let total=0;
        //   for(let b=2;b<this.lstHeader.length;b++)
        //   {
        //     total+=Number(this.lstCharges[a][b]);
        //   }
        //   //
        //   this.lstCharges[a][this.lstHeader.length]=total
        // }
        
        //Bottom Total        
        // for(let a=0;a<this.lstBottomSummary.length;a++)
        // {
        //   let total=0;
        //   for(let b=2;b<this.lstHeader.length;b++)
        //   {
        //     total+=Number(this.lstBottomSummary[a][b]);
        //   }
        //   //
        //   this.lstBottomSummary[a][this.lstHeader.length]=Number(total);
        // }
debugger;
// for (let i: number = this.lstCharges.length - 1; i >= 0; i--) 
//         {
//           if(this.lstCharges[i][1]=="Less Adjustments")
//           {
//             this.lstCharges.splice(4,0,this.lstCharges[i]);
//             this.lstCharges.splice(3,0);
//           }
//         }
        //Detail Total
        for(let a=0;a<this.lstlaggedCollection.length;a++)
        {
          let total=0;
          for(let b=2;b<this.lstHeader.length-1;b++)
          {
            total+=Number(this.lstlaggedCollection[a][b]);
          }
          //
          this.lstlaggedCollection[a][this.lstHeader.length-1]=Number(total);
        }
        debugger;
         //Average Total        
         for(let a=0;a<this.lstlaggedCollection.length;a++)
         {
           let total=0;
           for(let b=1;b<this.lstHeader.length-2;b++)
           {
             if(this.lstlaggedCollection[a][b+1]>0)
              total++;
             //total+=Number(this.lstlaggedCollection[a][b]);
           }
           this.lstlaggedCollection[a][this.lstHeader.length]=Number(this.lstlaggedCollection[a][this.lstHeader.length-1]/total).toFixed(2);
         }
        debugger;
        // Add Top Data in main list
       // this.lstlaggedCollection.splice(0,0,'Charges and Collections')
        for(let f=0;f<this.lstCharges.length;f++)
        {
          if(this.lstCharges[f][1]=="Less Adjustments")
          {
            this.lstlaggedCollection.splice(4,0,this.lstCharges[f]);
          }
          else
            this.lstlaggedCollection.splice(f,0,this.lstCharges[f]);
        }
        //Bottom Detail()
        //Add Bottom Data in main list
        for(let f=0;f<this.lstBottomSummary.length;f++)
        {
          this.lstlaggedCollection.splice(this.lstlaggedCollection.length,0,this.lstBottomSummary[f]);
        }

        this.isLoading = false;
      },
      error => {
        this.getLaggedCollectionReport(error);
        this.isLoading = false;
        return;
      }
    );
  }
  getLaggedCollectionReport(error) {
    this.logMessage.log("getLaggedCollectionReport Error." + error);
  }
  exportAsXLSX(){
    debugger;
    //this.excel.exportAsExcelFile(this.lstFinal,'payer_type,payer_number,payer_name,aging_30,aging_60,aging_90,aging_120,aging_120_plus,total', 'Rpt_Aging_Summary');
    let lstColumns: Array<any> = new Array<any>();
    for(let c=0;c<this.lstHeader.length;c++)
    {
      if(c==0)
      {
        lstColumns.push( new ExcelColumn('id', 'ID'));
      }
      if(this.lstHeader[c].header=="Total")
      {
        lstColumns.push( new ExcelColumn(this.lstHeader[c].header, this.lstHeader[c].header,'number'));
      }
      else
        lstColumns.push( new ExcelColumn(this.lstHeader[c].header, this.lstHeader[c].header));
      
    }
    this.excel.exportAsExcelFileWithHeadersWithoutColumnName(this.lstlaggedCollection, lstColumns, 'Rpt_laggedCollection');
  }

}
