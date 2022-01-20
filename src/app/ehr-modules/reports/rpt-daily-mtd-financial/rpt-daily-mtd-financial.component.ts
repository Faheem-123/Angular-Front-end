import { Component, OnInit, Inject, Input } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { CallingFromEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'rpt-daily-mtd-financial',
  templateUrl: './rpt-daily-mtd-financial.component.html',
  styleUrls: ['./rpt-daily-mtd-financial.component.css']
})
export class RptDailyMtdFinancialComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  
  aclocationwisecollectiondaily;
  aclocationwisecollectionmonthly;
  acFinalResult=[];
  isLoading=false;
  constructor(private reportsService: ReportsService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  ,private generalOperation:GeneralOperation) { }

  call_Count=0;
  ngOnInit() {
    this.isLoading=true;
    this.getPaymentCollectionSummaryLocationWiseDaily();
    this.call_Count++;
    this.getPaymentCollectionSummaryLocationWiseMonthly();
    this.call_Count++;
  }
  btnRefreshClicked(){
    this.isLoading=true;
    this.call_Count=0;
    this.getPaymentCollectionSummaryLocationWiseDaily();
    this.call_Count++;
    this.getPaymentCollectionSummaryLocationWiseMonthly();
    this.call_Count++;
    this.acFinalResult=[];
  }
  searchCriteria: SearchCriteria;
  getPaymentCollectionSummaryLocationWiseDaily()
  {
    this.searchCriteria=new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];
    
    this.searchCriteria.param_list.push( { name: "type", value: 'daily', option: ""});
    this.reportsService.getPaymentCollectionSummaryLocationWise(this.searchCriteria).subscribe(
      data=>{
        this.aclocationwisecollectiondaily=data;                 
        this.isDataLoaded();
      },
      error=>{
      }
    );
  }
  getPaymentCollectionSummaryLocationWiseMonthly()
  {
    this.searchCriteria=new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];
    
    this.searchCriteria.param_list.push( { name: "type", value:'monthview' , option: ""});
    this.reportsService.getPaymentCollectionSummaryLocationWise(this.searchCriteria).subscribe(
      data=>{
        this.aclocationwisecollectionmonthly=data;                 
        this.isDataLoaded();
      },
      error=>{
      }
    );
  }
  isDataLoaded(){
    this.call_Count--;
    if(this.call_Count==0)
    {
      this.assignValuetoAC();
      this.isLoading=false;
    }
  }
  assignValuetoAC(){
    debugger;
    for(let i=0;i<this.aclocationwisecollectiondaily.length;i++)
    {
      this.acFinalResult.push({
        location: this.aclocationwisecollectiondaily[i].col8,
        DailyCharges: this.aclocationwisecollectiondaily[i].col3,
        DailyPayments: this.aclocationwisecollectiondaily[i].col6,
        DailyAdjustments: this.aclocationwisecollectiondaily[i].col5,
        DailyPaymentsPercent: this.aclocationwisecollectiondaily[i].col7,
        MonthlyCharges: "",
        MonthlyPayments: "",
        MonthlyAdjustments: "",
        MonthlyPaymentsPercent: "",
      });
    }
      let locationNotFound;
				if(this.acFinalResult != null && this.acFinalResult.length > 0)
				for (let j = 0; j <this.aclocationwisecollectionmonthly.length; j++) 
				{
					locationNotFound= false;
					if(this.aclocationwisecollectionmonthly.length > 0){
						for(let z=0;z<this.acFinalResult.length;z++){ // if location not find then add that location
							if(this.acFinalResult[z].location == this.aclocationwisecollectionmonthly[j].col8){
								this.acFinalResult[z].MonthlyCharges = this.aclocationwisecollectionmonthly[j].col3;
								this.acFinalResult[z].MonthlyPayments = this.aclocationwisecollectionmonthly[j].col6;
								this.acFinalResult[z].MonthlyAdjustments = this.aclocationwisecollectionmonthly[j].col5;
								this.acFinalResult[z].MonthlyPaymentsPercent = this.aclocationwisecollectionmonthly[j].col7;
								locationNotFound = true;
							}
						}
						if(locationNotFound == false)
						{
              this.acFinalResult.push({
                location: this.aclocationwisecollectionmonthly[j].col8,
                DailyCharges: "",
                DailyPayments: "",
                DailyAdjustments: "",
                DailyPaymentsPercent: "",
                MonthlyCharges: this.aclocationwisecollectionmonthly[j].col3,
                MonthlyPayments: this.aclocationwisecollectionmonthly[j].col6,
                MonthlyAdjustments: this.aclocationwisecollectionmonthly[j].col5,
                MonthlyPaymentsPercent: this.aclocationwisecollectionmonthly[j].col7,
              });
						}
					}
        }
        if(this.acFinalResult == null || this.acFinalResult.length == 0)
				{
					for(let z=0;z<this.aclocationwisecollectionmonthly.length;z++){
            this.acFinalResult.push({
              location: this.aclocationwisecollectionmonthly[z].col8,
              DailyCharges: "",
              DailyPayments: "",
              DailyAdjustments: "",
              DailyPaymentsPercent: "",
              MonthlyCharges: this.aclocationwisecollectionmonthly[z].col3,
              MonthlyPayments: this.aclocationwisecollectionmonthly[z].col6,
              MonthlyAdjustments: this.aclocationwisecollectionmonthly[z].col5,
              MonthlyPaymentsPercent: this.aclocationwisecollectionmonthly[z].col7,
            });
					}				
        }
        let strcashdailypayments="";
				let dailypayments=0;
				let strcashdailycharges="";
				let dailycharges=0;
				let strcashdailyadjustments="";
				let dailyadjustments=0;
				
				
				let strcashMonthlypayments="";
				let Monthlypayments=0;
				let strcashMonthlycharges="";
				let Monthlycharges=0;
				let strcashMonthlyadjustments="";
        let Monthlyadjustments=0;
        
        for(let i=0;i<this.acFinalResult.length;i++)
				{
				strcashdailypayments="";
				strcashdailycharges="";
				strcashdailyadjustments="";
				if(this.acFinalResult[i].DailyPayments!=null)
				{
				strcashdailypayments=this.generalOperation.ReplaceAll(this.acFinalResult[i].DailyPayments,"$","");
				dailypayments = dailypayments+Number(strcashdailypayments);
				}
				if(this.acFinalResult[i].DailyCharges!=null)
				{
				strcashdailycharges=this.generalOperation.ReplaceAll(this.acFinalResult[i].DailyCharges,"$","");
				dailycharges=dailycharges+Number(strcashdailycharges);
				}
				
				if(this.acFinalResult[i].DailyAdjustments!=null)
				{
				strcashdailyadjustments=this.generalOperation.ReplaceAll(this.acFinalResult[i].DailyAdjustments,"$","");
				dailyadjustments = dailyadjustments+Number(strcashdailyadjustments);
				}
				//{location:"",:"",:"",:"",DailyPaymentsPercent:"",:"",:"",:"",MonthlyPaymentsPercent:""}]);
				if(this.acFinalResult[i].MonthlyCharges!=null)
				{
					strcashMonthlycharges=this.generalOperation.ReplaceAll(this.acFinalResult[i].MonthlyCharges,"$","");
					Monthlycharges = Monthlycharges+Number(strcashMonthlycharges);
				}
				if(this.acFinalResult[i].MonthlyPayments!=null)
				{
					strcashMonthlypayments=this.generalOperation.ReplaceAll(this.acFinalResult[i].MonthlyPayments,"$","");
					Monthlypayments = Monthlypayments+Number(strcashMonthlypayments);
				}
				if(this.acFinalResult[i].MonthlyAdjustments!=null)
				{
					strcashMonthlyadjustments=this.generalOperation.ReplaceAll(this.acFinalResult[i].MonthlyAdjustments,"$","");
					Monthlyadjustments = Monthlyadjustments+Number(strcashMonthlyadjustments);
				}
				
        }
        if(dailypayments>0 || dailycharges>0 || dailyadjustments>0 || Monthlycharges>0 || Monthlypayments>0 || Monthlyadjustments>0)
				{
          this.acFinalResult.push({
            location: "TOTAL",
            DailyCharges: "$"+parseFloat(dailycharges.toString()).toFixed(2),
            DailyPayments: "$ "+parseFloat(dailypayments.toString()).toFixed(2),
            DailyAdjustments: "$"+parseFloat(dailyadjustments.toString()).toFixed(2),
            DailyPaymentsPercent: "",
            MonthlyCharges: "$ "+parseFloat(Monthlycharges.toString()).toFixed(2),
            MonthlyPayments: "$"+parseFloat(Monthlypayments.toString()).toFixed(2),
            MonthlyAdjustments: "$"+parseFloat(Monthlyadjustments.toString()).toFixed(2),
            MonthlyPaymentsPercent: "",
          });
				} 
  }
}
