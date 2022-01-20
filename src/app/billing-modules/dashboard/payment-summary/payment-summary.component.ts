import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { LogMessage } from "../../../shared/log-message";
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { Chart } from 'chart.js';
@Component({
  selector: 'payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrls: ['./payment-summary.component.css']
})
export class PaymentSummaryComponent implements OnInit {
  chart: any = [{ data: [{ datasets: [] }] }];
  public context: CanvasRenderingContext2D;
  @ViewChild('myCanvas') myCanvas: ElementRef;
  isLoading: boolean = false;
  constructor(private logMessage: LogMessage, @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dashboardService: DashboardService) {
    this.getCashPayment();
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
  getCashPayment() {
    this.isLoading = true;
    this.dashboardService.getPaymentSummary(this.lookupList.practiceInfo.practiceId)
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
  drawBars(values) {
    debugger;
    this.barChartLabels = [];
    this.barChartData[0].data = [];
    for (let att of values) {
      if (att.col2 == 'charges') {
        this.barChartLabels.push('Charges');
        this.barChartData[0].data.push(att.col3);
      }
      else if (att.col2 == 'received') {
        this.barChartLabels.push('Received');
        this.barChartData[0].data.push(att.col4);
      }
      else if (att.col2 == 'posted') {
        debugger;
        this.barChartLabels.push('Posted');
        let postedAmount:number= Number(att.col4)+ Number(att.col6);
        this.barChartData[0].data.push(postedAmount.toFixed(2));
      }
      else if (att.col2 == 'adjustment') {
        this.barChartLabels.push('Adjustment');
        this.barChartData[0].data.push(att.col7);
      }
    }

    this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
    //var ctx = document.getElementById("myCanvas");
    this.chart = new Chart(this.context, {
      type: 'bar',

      data: {
        labels: ["Charges", "Received", "Posted", "Adjustment"],
        datasets: [
          {
            label: "",
            backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9"],
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
              if (dataPoint === '13') bar.backgroundColor = 'red';
              else if (dataPoint === '14') bar.backgroundColor = 'green';
            });
          }
        }]
      }
    });


    //this.context.datasets[0].bars[0].fillColor = "green";
  }

  //refresh record
  refreshRecord() {
    this.getCashPayment();
  }


}
