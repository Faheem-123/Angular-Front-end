import { Component, OnInit, Inject,  ElementRef, ViewChild } from '@angular/core';
import { LogMessage } from "../../../shared/log-message";
import { LookupList } from '../../../providers/lookupList.module';
import { LOOKUP_LIST } from './../../../providers/lookupList.module';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { Chart } from 'chart.js';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
@Component({
  selector: 'claim-aging',
  templateUrl: './claim-aging.component.html',
  styleUrls: ['./claim-aging.component.css']
})
export class ClaimAgingComponent implements OnInit {

  
  chart:any = [{data:[{datasets:[]}]}];
  public context: CanvasRenderingContext2D;
  @ViewChild('myCanvas') myCanvas: ElementRef;
  isLoading: boolean = false;
  constructor(private logMessage: LogMessage,@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dashboardService: DashboardService) {
    this.getAging();
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
      //var ctx = document.getElementById("myCanvas");
      this.chart = new Chart(this.context, {
        type: 'bar',
        
        data: {
          labels: ["Aging 30", "Aging 60","Aging 90","Aging 120","Aging 120+"],
          datasets:[
            {
              label: "",

              backgroundColor: ["#3cba9f","#3e95cd", "#8e5ea2","#e8c3b9","#c45850"],
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
                  ctx.fillText('$'+dataset.data[index], bar._model.x, height - ((height - bar._model.y) / 2) - 10);
                }),this)
              }),this);
            }
          }
        }
      });     
         
          
      //this.context.datasets[0].bars[0].fillColor = "green";
    }    
    
    //refresh record
    refreshRecord() {
      document.getElementById("rdoAll")['checked']=true
        this.getAging();
    }
    onOptionChange(event) {
      debugger;
      if(event.currentTarget.value)
      {
        event.currentTarget.value
      }

     
      this.isLoading = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
      { name: "type", value: event.currentTarget.value, option: "" }
      ];
      this.dashboardService.getDashBoardClaimAging(searchCriteria)
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
   
      // if (event == "missing") {
      //   this.selectedOption = "missing";
      // } else {
      //   this.selectedOption = event.currentTarget.value;
      // }
      // if (this.selectedOption == "missing") {
      //   let searchCriteria: SearchCriteria = new SearchCriteria();
      //   searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      //   searchCriteria.param_list = [{ name: "provider_id", value: this.filterForm.get('ctrlproviderSearch').value == 'all' ? '0' : this.filterForm.get('ctrlproviderSearch').value, option: "" },
      //   { name: "location_id", value: this.filterForm.get('ctrllocationSearch').value == "all" ? '0' : this.filterForm.get('ctrllocationSearch').value, option: "" }];
      //   searchCriteria.option = 'missing';
      //   this.getMissingClaims(searchCriteria);
      // }
      // else if (this.selectedOption == "draft") {
      //   let searchCriteria: SearchCriteria = new SearchCriteria();
      //   searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      //   searchCriteria.param_list = [{ name: "attending_physician", value: this.filterForm.get('ctrlproviderSearch').value == 'all' ? '0' : this.filterForm.get('ctrlproviderSearch').value, option: "" },
      //   { name: "location_id", value: this.filterForm.get('ctrllocationSearch').value == "all" ? '0' : this.filterForm.get('ctrllocationSearch').value, option: "" }];
      //   searchCriteria.option = 'draft';
      //   this.getMissingClaims(searchCriteria);
      // }
  
    }
}
