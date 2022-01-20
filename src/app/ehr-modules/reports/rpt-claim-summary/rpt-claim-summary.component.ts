import { Component, OnInit, Inject, ViewChildren, QueryList, ElementRef, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportsService } from 'src/app/services/reports.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { excelService } from 'src/app/shared/excelService';
import { Chart } from 'chart.js';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { CallingFromEnum } from 'src/app/shared/enum-util';
@Component({
  selector: 'rpt-claim-summary',
  templateUrl: './rpt-claim-summary.component.html',
  styleUrls: ['./rpt-claim-summary.component.css']
})
export class RptClaimSummaryComponent implements OnInit {
  
  @Input() callingFrom: CallingFromEnum;
  
  isShowDetail=false;
  chart:any = [{data:[{datasets:[]}]}];
  public context: CanvasRenderingContext2D;
  @ViewChild('myCanvas') myCanvas: ElementRef;

  isCollapsed = false;
  searchForm:FormGroup;
  isLoading=false;
  lstClaimDetails;
  acPaidClaims=[];
	acPartialyPaidClaims=[];
	acUnPaidClaims=[];
  acDraftClaims=[];
  lstPieChart: [{ head: "Full Paid", count: 0 },{ head: "Partially Paid", count: 0 },{ head: "Unpaid", count: 0 },{ head: "Draft", count: 0 } ];
  public barChartOptions: any = {
    responsive: true,
  };
  public barChartLabels: string[] = [];
  public barChartType: string = 'bar';


  public barChartData: Array<any> = [
    { data: [], label: '$' }
  ];
   

  public chartHovered(e: any): void {
    //console.log(e);
  }
  constructor(private formBuilder:FormBuilder, private dateTimeUtil:DateTimeUtil,private openModuleService: OpenModuleService,
    private ngbModal: NgbModal, private logMessage: LogMessage,private excel:excelService,
    private reportsService: ReportsService,@Inject(LOOKUP_LIST) public lookupList: LookupList) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm() {
    debugger;
		this.searchForm = this.formBuilder.group({
      dptoDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpfromDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      drpProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'null':this.lookupList.logedInUser.defaultProvider),
      drpLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'null':this.lookupList.logedInUser.defaultLocation),
      chkPatientBilled: this.formBuilder.control(false),
     })
  }
  fullPaid_SelfPayClaims_count=0;
	fullPaid_insuranceClaims_count=0;
	PartialPaid_SelfPayClaims_count=0;
	PartialPaid_insuranceClaims_count=0;
	Unpaid_SelfPayClaims_count=0;
	Unpaid_insuranceClaims_count=0;
  searchCriteria: SearchCriteria;
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
    
    this.isLoading=true;
    this.barChartData[0].data = [];
    this.acPaidClaims=[];
    this.acPartialyPaidClaims=[];
    this.acUnPaidClaims=[];
    this.acDraftClaims=[];

    this.searchCriteria=new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list=[];
    
    this.searchCriteria.param_list.push( { name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpfromDate), option: ""});
    this.searchCriteria.param_list.push( { name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dptoDate), option: ""});
    if(frm.drpProvider!="" && frm.drpProvider!="null" && frm.drpProvider!=null && frm.drpProvider!="All")  
    {
      this.searchCriteria.param_list.push( { name: "provider_id", value: frm.drpProvider, option: ""});
    }
    if(frm.drpLocation!="" && frm.drpLocation!=null && frm.drpLocation!="null" && frm.drpLocation!="All")  
    {
      this.searchCriteria.param_list.push( { name: "location_id", value: frm.drpLocation, option: ""});
    }     
    this.searchCriteria.param_list.push( { name: "self", value: frm.chkPatientBilled, option: ""});    
    
    this.reportsService.getClaimSummaryReport(this.searchCriteria).subscribe(
      data=>{
        this.lstClaimDetails=data;  

        let  is_drafts=false;
        let   is_selfPay=false;
        let  amt_due=0.00;
        let  amt_paid=0.00;
          
          this.fullPaid_SelfPayClaims_count=0;
					this.fullPaid_insuranceClaims_count=0;
					this.PartialPaid_SelfPayClaims_count=0;
					this.PartialPaid_insuranceClaims_count=0;
					this.Unpaid_SelfPayClaims_count=0;
          this.Unpaid_insuranceClaims_count=0;
          
        for(let i=0;i<this.lstClaimDetails.length;i++)
        {
          is_drafts=this.lstClaimDetails[i].draft=="1"? true : false ;
          is_selfPay=this.lstClaimDetails[i].self_pay=="1"? true : false ;
          amt_due=parseFloat( parseFloat(this.lstClaimDetails[i].amt_due).toFixed(2));
          amt_paid=parseFloat( parseFloat(this.lstClaimDetails[i].amt_paid).toFixed(2));
          //Draft Claims
						if(is_drafts==true)
						{
							this.acDraftClaims.push(this.lstClaimDetails[i]);
						}
						else if(amt_due <= 0.00) // full paid
						{
							this.acPaidClaims.push(this.lstClaimDetails[i]);
							
							if(is_selfPay)
							{
								this.fullPaid_SelfPayClaims_count=this.fullPaid_SelfPayClaims_count+1;
							}
							else
							{
								this.fullPaid_insuranceClaims_count=this.fullPaid_insuranceClaims_count+1;							
							}
							
						}
						else if(amt_due>0 && amt_paid>0) // partial paid
						{
							this.acPartialyPaidClaims.push(this.lstClaimDetails[i]);
							
							if(is_selfPay)
							{
								this.PartialPaid_SelfPayClaims_count=this.PartialPaid_SelfPayClaims_count+1;
							}
							else
							{
								this.PartialPaid_insuranceClaims_count=this.PartialPaid_insuranceClaims_count+1;							
							}
							
						}
						else // unpaid
						{
							this.acUnPaidClaims.push(this.lstClaimDetails[i]);
							
							if(is_selfPay)
							{
								this.Unpaid_SelfPayClaims_count=this.Unpaid_SelfPayClaims_count+1;
							}
							else
							{
								this.Unpaid_insuranceClaims_count=this.Unpaid_insuranceClaims_count+1;							
							}
						}
        }
        this.drawBars(data)
        this.isLoading=false;
      },
      error=>{
        this.isLoading=false;
      }
    );
  }
  public bpLineChartLabels: string[] = [];
  public bpLineChartType: string = 'pie';
  public bpLineChartLegend: boolean = false;
 
  drawBars(values) {
    debugger;
        this.barChartLabels = [];
        this.barChartData[0].data = [];
        this.barChartLabels.push('Full Paid');
        this.barChartData[0].data.push(this.acPaidClaims.length);
        
        this.barChartLabels.push('Partially Paid');
        this.barChartData[0].data.push(this.acPartialyPaidClaims.length);
        
        this.barChartLabels.push('Unpaid');
        this.barChartData[0].data.push(this.acUnPaidClaims.length);
        
        this.barChartLabels.push('Draft');
        this.barChartData[0].data.push(this.acDraftClaims.length);         
       
       
        this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
       
        //var ctx = document.getElementById("myCanvas");
        this.chart = new Chart(this.context, {
          type: 'pie',
          responsive: true,
          maintainAspectRatio:false,
          width:200,
          height:100,
          data: {
            labels: ["Full Paid", "Partially Paid","Unpaid","Draft"],
            datasets:[
              {
                label: "",
  
                backgroundColor: ["#3cba9f","#3e95cd", "#8e5ea2","#e8c3b9"],
                data: this.barChartData[0].data
              }],
            },
  
          options: {
            // animation: {
            //   onComplete: function () {
            //     debugger;
            //     var chartInstance = this.chart;
            //     var ctx = chartInstance.ctx;
            //     console.log(chartInstance);
            //     var height = chartInstance.controller.boxes[0].bottom;
            //     height=10;
            //     ctx.textAlign = "center";            
  
            //     Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
            //       var meta = chartInstance.controller.getDatasetMeta(i);
            //       Chart.helpers.each(meta.data.forEach(function (bar, index) {
            //         ctx.fillText('$'+dataset.data[index], bar._model.x, height - ((height - bar._model.y) / 2) - 10);
            //       }),this)
            //     }),this);
            //   }
            // }
          }
        });     
        debugger;
        //this.chart.resize(300, 200);
        //this.chart.resize();
        this.chart.canvas.parentNode.style.height = '100';
        this.chart.canvas.parentNode.style.width = '200';
        //this.context.datasets[0].bars[0].fillColor = "green";
      }    
}
