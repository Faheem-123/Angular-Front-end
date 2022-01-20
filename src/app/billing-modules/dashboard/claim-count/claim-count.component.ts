import { Component, OnInit, Inject,  ElementRef, ViewChild } from '@angular/core';
import { LogMessage } from "../../../shared/log-message";
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { Chart } from 'chart.js';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
@Component({
  selector: 'claim-count',
  templateUrl: './claim-count.component.html',
  styleUrls: ['./claim-count.component.css']
})
export class ClaimCountComponent implements OnInit {
  showHideSearch = true;
  filterForm: FormGroup;
  chart:any = [{data:[{datasets:[]}]}];
  public context: CanvasRenderingContext2D;
  @ViewChild('myCanvas') myCanvas: ElementRef;
  isLoading: boolean = false;
  constructor(private logMessage: LogMessage,@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dashboardService: DashboardService,private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil) {
     
     }  
    ngOnInit() {
      this.buildForm();
      //this.getClaim()
      this.getAging()
    }
    buildForm() {

      this.filterForm = this.formBuilder.group({
        ctrlproviderSearch: this.formBuilder.control('all', Validators.required),
        ctrllocationSearch: this.formBuilder.control('all', Validators.required),
        datefrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
        dateto: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required)
  
      })
  
    }
    /////
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
    ////

    getAging() {
      this.isLoading = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
      { name: "type", value: "all", option: "" }
      ];
      this.dashboardService.getDashBoardClaimAging(searchCriteria)
        .subscribe(
          data => {
            debugger;
            //this.listPendingLabResult = data
            //this.drawBars(data)
            this.drawdonut(data)
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
            this.logMessage.log("getcash register Successfull" + error);
          }
        );
    }

    getClaim() {
      debugger;
      this.isLoading = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
      { name: "attending_physician", value: this.filterForm.get('ctrlproviderSearch').value, option: "" },
      { name: "location_id", value: this.filterForm.get('ctrllocationSearch').value, option: "" },
      { name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(this.filterForm.get('datefrom').value), option: "" },
      { name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(this.filterForm.get('dateto').value), option: "" }
      ];
      this.dashboardService.getDashBoardClaimCount(searchCriteria)
        .subscribe(
          data => {
            debugger;
            //this.listPendingLabResult = data
            this.drawBars(data)
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
            this.logMessage.log("getcash register Successfull" + error);
          }
        );
    }
    public doughnutChartLabels = [];
    public doughnutChartData = [];
    public doughnutChartType = '';
  
  
  
    drawdonut(values)
    {
      debugger;
       this.doughnutChartLabels = ['Sales Q1', 'Sales Q2', 'Sales Q3', 'Sales Q4'];
       this.doughnutChartData = [120, 150, 180, 90];
       this.doughnutChartType = 'doughnut';
       for (let att of values) 
      {
        if(att.col2=='Aging 30')
        {
          this.barChartLabels.push('Aging 30');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Aging 60')
        {
          this.barChartLabels.push('Aging 60');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Aging 90')
        {
          this.barChartLabels.push('Aging 90');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Aging 120')
        {
          this.barChartLabels.push('Aging 120');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Aging 120+')
        {
          this.barChartLabels.push('Aging 120+');
          this.barChartData[0].data.push(att.col3);
        }
      }
     
       this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
       this.chart = new Chart(this.context,{
        type:'doughnut',
        data: {
          labels: ["Aging 30", "Aging 60","Aging 90","Aging 120","Aging 120+"],
          datasets:[
            {
              label: "",

              backgroundColor: ["#3cba9f","#3e95cd", "#8e5ea2","#e8c3b9","#c45850"],
              data: this.barChartData[0].data
            }],
          }
      });
    }
    drawBars(values) {
  debugger;
      this.barChartLabels = [];
      this.barChartData[0].data = [];
      for (let att of values) 
      {
        if(att.col2=='Total Claims')
        {
          this.barChartLabels.push('Total Claims');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Draft')
        {
          this.barChartLabels.push('Draft');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Un-Processed')
        {
          this.barChartLabels.push('Un-Processed');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Processed')
        {
          this.barChartLabels.push('Processed');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Self')
        {
          this.barChartLabels.push('Self');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Do Not Bill')
        {
          this.barChartLabels.push('Do Not Bill');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='HCFA')
        {
          this.barChartLabels.push('HCFA');
          this.barChartData[0].data.push(att.col3);
        }
      }
     
      this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
      //var ctx = document.getElementById("myCanvas");
      this.chart = new Chart(this.context, {
        type: 'bar',
        
        data: {
          labels: ["Claims", "Draft","Un-Proc","Processed","Self","Do Not Bill","HCFA"],
          datasets:[
            {
              label: "",
              backgroundColor: ["#3cba9f","#3e95cd","#3cba9f","#3e95cd","#3cba9f","#3e95cd","#3cba9f"],
              data: this.barChartData[0].data
            }],
          },

        options: {
         
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero:true
              }
            }]
          },
          animation: {
            onComplete: function () {
              debugger;
              var chartInstance = this.chart;
              var ctx = chartInstance.ctx;
              console.log(chartInstance);
              var height = chartInstance.controller.boxes[0].bottom;
              height=10;
              ctx.textAlign = "center";            

              Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                var meta = chartInstance.controller.getDatasetMeta(i);
                Chart.helpers.each(meta.data.forEach(function (bar, index) {
                  ctx.fillText(dataset.data[index], bar._model.x, height - ((height - bar._model.y) / 2) - 10);
                }),this)
              }),this);
            }
          }
        }
      });     
         
          
      //this.context.datasets[0].bars[0].fillColor = "green";
    }    
    
    //refresh record
    // refreshRecord() {
    //    // this.getClaim();
    //    document.getElementById("rdoAll")['checked']=true
    //    this.getAging();
       
    // }
    showHidetoggle(){
      this.showHideSearch = false;
    }
}
