import { Component, OnInit, Inject,  ElementRef, ViewChild } from '@angular/core';
import { LogMessage } from "../../../shared/log-message";
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'claim-denial',
  templateUrl: './claim-denial.component.html',
  styleUrls: ['./claim-denial.component.css']
})
export class ClaimDenialComponent implements OnInit {

  chart:any = [{data:[{datasets:[]}]}];
  public context: CanvasRenderingContext2D;
  @ViewChild('myCanvas') myCanvas: ElementRef;
  isLoading: boolean = false;
  constructor(private logMessage: LogMessage,@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dashboardService: DashboardService) {
    this.getDenial();
     }  
    ngOnInit() {
       
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
    getDenial() {
      this.isLoading = true;
      this.dashboardService.getDashBoardDenial(this.lookupList.practiceInfo.practiceId)
        .subscribe(
          data => {
            debugger;
            //this.listPendingLabResult = data
            //this.drawBars(data)
            this.drawBarspayer(data)
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
            this.logMessage.log("getcash register Successfull" + error);
          }
        );
    }


    drawBarspayer(values) {
      debugger;
      this.barChartLabels = [];
      this.barChartData[0].data = [];
      
      for (let i = 0; i < 8; i++) {
        this.barChartLabels.push('Commercial');
        this.barChartLabels.push('Medicare');
        this.barChartLabels.push('SelfPay');
        this.barChartLabels.push('Humana');
        this.barChartLabels.push('Medicare Advantage');
        this.barChartLabels.push('Other Commercial');
        this.barChartLabels.push('Medicaid Advantage');
        this.barChartLabels.push('Healthcare Exchange');
        
        
        this.barChartData[0].data.push(78672);
        this.barChartData[0].data.push(59084);
        this.barChartData[0].data.push(32584);
        this.barChartData[0].data.push(89084);
        this.barChartData[0].data.push(78672);
        this.barChartData[0].data.push(59084);
        this.barChartData[0].data.push(32584);
        this.barChartData[0].data.push(89084);
  
  
      }
  
      this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
      //var ctx = document.getElementById("myCanvas");
     
      this.chart = new Chart(this.context, {
        type: 'bar',
  
        data: {
          labels: ["Commercial", "Medicare", "SelfPay", "Humana","Medicare Advantage","Other Commercial", "Medicaid Advantage","Healthcare Exchange"],
          datasets: [
            {
              label: "",
              backgroundColor: ["#3e95cd", "#3e95cd", "#3e95cd", "#3e95cd","#3e95cd","#3e95cd","#3e95cd","#3e95cd"],
              data: this.barChartData[0].data
            }],
        },
  
        options: {
  
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
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
              height = 10;
              ctx.textAlign = "center";
  
              Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                var meta = chartInstance.controller.getDatasetMeta(i);
                Chart.helpers.each(meta.data.forEach(function (bar, index) {
                  ctx.fillText('$'+dataset.data[index] , bar._model.x, height - ((height - bar._model.y) / 2) - 10);
                }), this)
              }), this);
            }
          },
          plugins: [{
            beforeDraw: function (chart) {
              debugger;
              var labels = chart.data.labels;
              labels.forEach(function (e, i) {
                var bar = chart.data.datasets[0]._meta[0].data[i]._model;
                var dataPoint = e.split(/\s/)[1];
                if (dataPoint >= '2') bar.backgroundColor = 'blue';
               
              });
            }
          }]
        }
      });
  
    }//end og draw chart bars fucntion


    drawBars(values) {
  debugger;
      this.barChartLabels = [];
      this.barChartData[0].data = [];
      for (let att of values) 
      {
        if(att.col2=='Active')
        {
          this.barChartLabels.push('Active');
          this.barChartData[0].data.push(att.col3);
        }
        else if(att.col2=='Resolved')
        {
          this.barChartLabels.push('Resolved');
          this.barChartData[0].data.push(att.col3);
        }
      }
     
      this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
      //var ctx = document.getElementById("myCanvas");
      this.chart = new Chart(this.context, {
        type: 'bar',
        
        data: {
          labels: ["Active", "Resolved"],
          datasets:[
            {
              label: "",
              backgroundColor: ["#e8c3b9", "#3cba9f"],
              data: this.barChartData[0].data
            }],
          },

        options: {
         
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero:true
              }
            }],
            xAxes: [{
              barPercentage: 0.4
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
    //     this.getDenial();
    // }

}
