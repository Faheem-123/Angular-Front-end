import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Chart } from 'chart.js';
import { chartColors } from 'src/app/models/encounter/growth-chart-data-series';
@Component({
  selector: 'birth-weight-for-age',
  templateUrl: './birth-weight-for-age.component.html',
  styleUrls: ['./birth-weight-for-age.component.css']
})
export class BirthWeightForAgeComponent implements OnInit {
  @Input() lstVitalData;
  @Input() gender;
  @ViewChild('myCanvas') myCanvas: ElementRef;
  chart:any = [{data:[{datasets:[]}]}];
  color;
  pointToolTip;
  chart_title:string='';
  public barChartData: any[] = [{ data: [{x:'',y:'',
  tooltip:{visit_date:'',age:{year:'',month:'',days:''},weight:''}}],
  label:'',pointRadius:0,pointBackgroundColor:'',pointHoverRadius:0,pointHoverBorderWidth:0,spanGaps:true,showLine:true,borderWidth:1,fill:false,borderColor:'',backgroundColor:''}];

  public context: CanvasRenderingContext2D;

  constructor() { 
    this.color = Chart.helpers.color;
    Chart.defaults.global.legend.labels.usePointStyle = true;
  }

  ngOnInit() {
    this.barChartData.pop();
    this.fillSeries();
    if(this.gender.toLocaleLowerCase()=='female')
      this.chart_title='Birth to 24 Months: Girls Weight For Age Percentile';
    else
      this.chart_title='Birth to 24 Months: Boys Weight For Age Percentile';
    //let vitallstData=[{ x: 0.1, y: 2.75,tooltip:{visit_date:'07/01/2015',age:{year:'0',month:'0',days:'4'},weight:'6.1 lbs'} }, { x: 0.8, y: 3.60 }, { x: 1.6, y: 4.56 }, { x: 2, y: 4.79 }, { x: 4.4, y: 5.93 }, { x: 7.2, y: 6.49 }, { x: 7.4, y: 6.38 }, { x: 10.8, y: 7.48 }, { x: 13.6, y: 8.39 }, { x: 14.8, y: 8.62 }, { x: 15.6, y: 8.67 }, { x: 15.9, y: 9.07 }, { x: 16.2, y: 9.19 }, { x: 18.2, y: 9.24 }, { x: 19, y: 10.21 }, { x: 19.7, y: 10.43 }, { x: 20.7, y: 10.23 }, { x: 21.7, y: 10.66 }, { x: 22, y: 10.55 }, { x: 22.4, y: 10.66 }, { x: 22.9, y: 10.89 }, { x: 24.7, y: 11.11 }, { x: 25, y: 11.11 }, { x: 28.6, y: 12.30 }, { x: 29, y: 12.76 }];
    let vitallstData=[];
    if(this.lstVitalData!=undefined && this.lstVitalData!=null && this.lstVitalData.length>0)
    {
      for(let i=0;i<this.lstVitalData.length;i++)
      {
        vitallstData.push({x:this.lstVitalData[i].final_months,y:this.lstVitalData[i].weight_kg,tooltip:{visit_date:this.lstVitalData[i].visit_date,age:{year:this.lstVitalData[i].years,month:this.lstVitalData[i].months,days:this.lstVitalData[i].days},weight:this.lstVitalData[i].weight_lbs+' lbs'}});
      }
    }
    this.barChartData.push({
      label: 'patient', pointRadius: 3, pointBackgroundColor: '#4da5f7', pointHoverRadius: 4, pointHoverBorderWidth: 3, spanGaps: true, showLine: true, borderWidth: 2, fill: false, borderColor: chartColors['patient'],backgroundColor:chartColors['patient']
      , data: vitallstData
    });

    this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
    this.chart = new Chart(this.context, {
      type: 'line',
      data:{datasets:this.barChartData},       
      options: {
        title: {
          display: true,
          text: this.chart_title,
          fontColor:'#2972ad'
      },
        legend: {
          display: true,
          position: 'right',reverse:true,boxWidth:15
        },
        tooltips: {
          mode: 'label',
          backgroundColor:'#F0F0F0',
          displayColors:false,
          borderWidth:1,
          borderColor:'black',
          bodyFontColor:'black',
          callbacks: {  
                  
            label: function (tooltipItem,data) {
              this.pointToolTip=[];
          debugger;
            //if(data.datasets.length>9)
            if(tooltipItem.datasetIndex==9)
            {
              var focused_point_data = data.datasets[9].data[tooltipItem.index].tooltip;
              this.pointToolTip.push('Visit Date: '+focused_point_data.visit_date);
              var strAge='';
              if(focused_point_data.age.year>0)
              {
                strAge=focused_point_data.age.year + " Y ";
              }
              if(focused_point_data.age.month>0)
              {
                strAge+=focused_point_data.age.month + " M ";
              }
              if(focused_point_data.age.days>0)
              {
                strAge+=focused_point_data.age.days + " D";
              }              
              this.pointToolTip.push('Age at Visit: '+strAge);
              this.pointToolTip.push('Weight: '+focused_point_data.weight);
              return this.pointToolTip;  
            }     
            else return null;   
            }
          }
        },
        scales: {
          xAxes: [{
            type: 'linear',
            ticks: {
                  min: 0,
                  max: 24,
                 stepSize:1,
               },
               scaleLabel: {
                display: true,
                labelString: 'Age (Month)',
              }
          }],
          yAxes: [{
            ticks: {
              min: 1,
              max: 18,
             stepSize:1,
           },
           scaleLabel: {
            display: true,
            labelString: 'Weight (kg)',
          }
          },
          
          {
            position: 'right',
            type: 'linear',
            ticks: {
            min: 1,
            max: 18,
            stepSize: 1,
            callback: function(value, index, values) {
              debugger;
              return (value*2.20462).toPrecision(2);
            }
           },
           gridLines : {
            display : false
       },
           scaleLabel: {
            display: true,
            labelString: 'Weight (lbs)',
          }
          }]
        }
      }
    });
  }
  fillSeries(){
    if(this.gender.toLocaleLowerCase()=="female")
    {
    this.barChartData.push({
      label: '2nd', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Second'],backgroundColor:chartColors['Second']
      , data: [{ x: '0', y: '2.394672' }, { x: '1', y: '3.161067' }, { x: '2', y: '3.941053' }, { x: '3', y: '4.53604' }, { x: '4', y: '5.013368' }, { x: '5', y: '5.403844' }, { x: '6', y: '5.729383' }, { x: '7', y: '6.008387' },
      { x: '8', y: '6.253445' }, { x: '9', y: '6.472906' }, { x: '10', y: '6.673828' }, { x: '11', y: '6.862262' }, { x: '12', y: '7.042612' }, { x: '13', y: '7.217847' }, { x: '14', y: '7.389684' }, { x: '15', y: '7.559527' }, { x: '16', y: '7.727588' }, { x: '17', y: '7.894535' }
        , { x: '18', y: '8.060311' }, { x: '19', y: '8.224599' }, { x: '20', y: '8.387882' }, { x: '21', y: '8.55031' }, { x: '22', y: '8.712397' }, { x: '23', y: '8.8741' }, { x: '24', y: '9.035869' }]
    });

    this.barChartData.push({
      label: '5th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifth'],backgroundColor:chartColors['Fifth']
      , data: [{ x: 0, y: 2.532145 }, { x: 1, y: 3.326209 }, { x: 2, y: 4.13172 }, { x: 3, y: 4.745935 }, { x: 4, y: 5.238858 }, { x: 5, y: 5.642267 }, { x: 6, y: 5.97888 }, { x: 7, y: 6.267836 }, { x: 8, y: 6.522061 }, { x: 9, y: 6.750018 }, { x: 10, y: 6.958886 }, { x: 11, y: 7.15483 }, { x: 12, y: 7.342376 },
      { x: 13, y: 7.524538 }, { x: 14, y: 7.70313 }, { x: 15, y: 7.879566 }, { x: 16, y: 8.054179 }, { x: 17, y: 8.227652 }, { x: 18, y: 8.399952 }, { x: 19, y: 8.570832 }, { x: 20, y: 8.74076 }, { x: 21, y: 8.909946 }, { x: 22, y: 9.078906 }, { x: 23, y: 9.247632 }, { x: 24, y: 9.416516 }]
    });
    this.barChartData.push({
      label: '10th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Tenth'],backgroundColor:chartColors['Tenth']
      , data: [{ x: 0, y: 2.677725 }, { x: 1, y: 3.502477 }, { x: 2, y: 4.335355 }, { x: 3, y: 4.970282 }, { x: 4, y: 5.480078 }, { x: 5, y: 5.897544 }, { x: 6, y: 6.246243 }, { x: 7, y: 6.546104 }, { x: 8, y: 6.810403 }, { x: 9, y: 7.047717 }, { x: 10, y: 7.265345 }, { x: 11, y: 7.46957 }, { x: 12, y: 7.665043 },
      { x: 13, y: 7.854825 }, { x: 14, y: 8.040838 }, { x: 15, y: 8.224501 }, { x: 16, y: 8.406286 }, { x: 17, y: 8.586898 }, { x: 18, y: 8.766325 }, { x: 19, y: 8.944403 }, { x: 20, y: 9.121584 }, { x: 21, y: 9.298148 }, { x: 22, y: 9.474611 }, { x: 23, y: 9.651002 }, { x: 24, y: 9.827655 }]
    });

    this.barChartData.push({
      label: '25th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['TwentyFive'],backgroundColor:chartColors['TwentyFive']
      , data: [{ x: 0, y: 2.932331 }, { x: 1, y: 3.814261 }, { x: 2, y: 4.695944 }, { x: 3, y: 5.368044 }, { x: 4, y: 5.90832 }, { x: 5, y: 6.351329 }, { x: 6, y: 6.72212 }, { x: 7, y: 7.042017 }, { x: 8, y: 7.324907 }, { x: 9, y: 7.579535 }, { x: 10, y: 7.813398 }, { x: 11, y: 8.032975 }, { x: 12, y: 8.24313 },
      { x: 13, y: 8.446994 }, { x: 14, y: 8.646697 }, { x: 15, y: 8.843658 }, { x: 16, y: 9.038616 }, { x: 17, y: 9.232317 }, { x: 18, y: 9.424795 }, { x: 19, y: 9.616043 }, { x: 20, y: 9.806487 }, { x: 21, y: 9.996544 }, { x: 22, y: 10.18672 }, { x: 23, y: 10.37713 }, { x: 24, y: 10.56799 }]
    });
    this.barChartData.push({
      label: '50th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifty'],backgroundColor:chartColors['Fifty']
      , data: [{ x: 0, y: 3.2322 }, { x: 1, y: 4.1873 }, { x: 2, y: 5.1282 }, { x: 3, y: 5.8458 }, { x: 4, y: 6.4237 }, { x: 5, y: 6.8985 }, { x: 6, y: 7.297 }, { x: 7, y: 7.6422 }, { x: 8, y: 7.9487 }, { x: 9, y: 8.2254 }, { x: 10, y: 8.48 }, { x: 11, y: 8.7192 }, { x: 12, y: 8.9481 },
      { x: 13, y: 9.1699 }, { x: 14, y: 9.387 }, { x: 15, y: 9.6008 }, { x: 16, y: 9.8124 }, { x: 17, y: 10.0226 }, { x: 18, y: 10.2315 }, { x: 19, y: 10.4393 }, { x: 20, y: 10.6464 }, { x: 21, y: 10.8534 }, { x: 22, y: 11.0608 }, { x: 23, y: 11.2688 }, { x: 24, y: 11.4775 }]
    });
    this.barChartData.push({
      label: '75th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['SeventyFive'],backgroundColor:chartColors['SeventyFive']
      , data: [{ x: 0, y: 3.55035 }, { x: 1, y: 4.590075 }, { x: 2, y: 5.596104 }, { x: 3, y: 6.364222 }, { x: 4, y: 6.984281 }, { x: 5, y: 7.495018 }, { x: 6, y: 7.925102 }, { x: 7, y: 8.299352 }, { x: 8, y: 8.633118 }, { x: 9, y: 8.935413 }, { x: 10, y: 9.214115 }, { x: 11, y: 9.476145 }, { x: 12, y: 9.726833 },
      { x: 13, y: 9.969431 }, { x: 14, y: 10.20666 }, { x: 15, y: 10.43988 }, { x: 16, y: 10.67062 }, { x: 17, y: 10.89976 }, { x: 18, y: 11.12747 }, { x: 19, y: 11.3542 }, { x: 20, y: 11.58033 }, { x: 21, y: 11.80669 }, { x: 22, y: 12.03376 }, { x: 23, y: 12.26184 }, { x: 24, y: 12.49092 }]
    });
    this.barChartData.push({
      label: '90th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Ninty'],backgroundColor:chartColors['Ninty']
      , data: [{ x: 0, y: 3.852667 }, { x: 1, y: 4.979539 }, { x: 2, y: 6.049862 }, { x: 3, y: 6.868317 }, { x: 4, y: 7.530756 }, { x: 5, y: 8.077933 }, { x: 6, y: 8.540297 }, { x: 7, y: 8.94444 }, { x: 8, y: 9.306424 }, { x: 9, y: 9.63531 }, { x: 10, y: 9.939115 }, { x: 11, y: 10.22495 }, { x: 12, y: 10.49835 },
      { x: 13, y: 10.76258 }, { x: 14, y: 11.02071 }, { x: 15, y: 11.27403 }, { x: 16, y: 11.52454 }, { x: 17, y: 11.77319 }, { x: 18, y: 12.02024 }, { x: 19, y: 12.26642 }, { x: 20, y: 12.51209 }, { x: 21, y: 12.75831 }, { x: 22, y: 13.00554 }, { x: 23, y: 13.25422 }, { x: 24, y: 13.50419 }]
    });
    this.barChartData.push({
      label: '95th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyFive'],backgroundColor:chartColors['NintyFive']
      , data: [{ x: 0, y: 4.040959 }, { x: 1, y: 5.225436 }, { x: 2, y: 6.337067 }, { x: 3, y: 7.188096 }, { x: 4, y: 7.87815 }, { x: 5, y: 8.449225 }, { x: 6, y: 8.93289 }, { x: 7, y: 9.356859 }, { x: 8, y: 9.737639 }, { x: 9, y: 10.08429 }, { x: 10, y: 10.4049 }, { x: 11, y: 10.7067 }, { x: 12, y: 10.99531 },
      { x: 13, y: 11.27401 }, { x: 14, y: 11.54612 }, { x: 15, y: 11.81285 }, { x: 16, y: 12.07652 }, { x: 17, y: 12.33814 }, { x: 18, y: 12.59804 }, { x: 19, y: 12.85712 }, { x: 20, y: 13.11573 }, { x: 21, y: 13.37511 }, { x: 22, y: 13.6357 }, { x: 23, y: 13.89801 }, { x: 24, y: 14.16181 }]
    });
    this.barChartData.push({
      label: '98th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyEight'],backgroundColor:chartColors['NintyEight']
      , data: [{ x: 0, y: 4.23043022 }, { x: 1, y: 5.4754539 }, { x: 2, y: 6.62967897 }, { x: 3, y: 7.51447955 }, { x: 4, y: 8.23331075 }, { x: 5, y: 8.82941522 }, { x: 6, y: 9.33549062 }, { x: 7, y: 9.78039888 }, { x: 8, y: 10.1810939 }, { x: 9, y: 10.5466186 }, { x: 10, y: 10.8851054 }, { x: 11, y: 11.2038881 }, { x: 12, y: 11.5086985 },
      { x: 13, y: 11.8028109 }, { x: 14, y: 12.0897773 }, { x: 15, y: 12.3707367 }, { x: 16, y: 12.6483665 }, { x: 17, y: 12.9237235 }, { x: 18, y: 13.1972107 }, { x: 19, y: 13.4699234 }, { x: 20, y: 13.7422028 }, { x: 21, y: 14.0154884 }, { x: 22, y: 14.2901756 }, { x: 23, y: 14.5668755 }, { x: 24, y: 14.8452857 }]
    });
  }
  else{ //Boys
    this.barChartData.push({
      label: '2nd', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Second'],backgroundColor:chartColors['Second']
      , data: [{x:0,y:2.459312},{x:1,y:3.39089},{x:2,y:4.31889},{x:3,y:5.018434},{x:4,y:5.561377},{x:5,y:5.996672},{x:6,y:6.352967},{x:7,y:6.653301},{x:8,y:6.913126},{x:9,y:7.144822},{x:10,y:7.356558},{x:11,y:7.55441},{x:12,y:7.742219},
        {x:13,y:7.922091},{x:14,y:8.095984},{x:15,y:8.265127},{x:16,y:8.430734},{x:17,y:8.593128},{x:18,y:8.752902},{x:19,y:8.909889},{x:20,y:9.065209},{x:21,y:9.219037},{x:22,y:9.371554},{x:23,y:9.522741},{x:24,y:9.672527},
        ]
    });

    this.barChartData.push({
      label: '5th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifth'],backgroundColor:chartColors['Fifth']
      , data: [{x:0,y:2.603994},{x:1,y:3.566165},{x:2,y:4.522344},{x:3,y:5.240269},{x:4,y:5.797135},{x:5,y:6.244465},{x:6,y:6.611702},{x:7,y:6.922131},{x:8,y:7.19127},{x:9,y:7.431644},{x:10,y:7.651572},{x:11,y:7.857229},{x:12,y:8.052577},
        {x:13,y:8.239848},{x:14,y:8.421033},{x:15,y:8.597424},{x:16,y:8.770274},{x:17,y:8.939942},{x:18,y:9.107002},{x:19,y:9.27136},{x:20,y:9.434095},{x:21,y:9.595435},{x:22,y:9.755556},{x:23,y:9.914417},{x:24,y:10.07194},
        ]
    });
    this.barChartData.push({
      label: '10th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Tenth'],backgroundColor:chartColors['Tenth']
      , data: [{x:0,y:2.757621},{x:1,y:3.752603},{x:2,y:4.738362},{x:3,y:5.475519},{x:4,y:6.046988},{x:5,y:6.507016},{x:6,y:6.885864},{x:7,y:7.207057},{x:8,y:7.486158},{x:9,y:7.735837},{x:10,y:7.964565},{x:11,y:8.178615},{x:12,y:8.382077},
        {x:13,y:8.577324},{x:14,y:8.76637},{x:15,y:8.950586},{x:16,y:9.13126},{x:17,y:9.308795},{x:18,y:9.483736},{x:19,y:9.656076},{x:20,y:9.826848},{x:21,y:9.996335},{x:22,y:10.16471},{x:23,y:10.33191},{x:24,y:10.49784},
        ]
    });

    this.barChartData.push({
      label: '25th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['TwentyFive'],backgroundColor:chartColors['TwentyFive']
      , data: [{x:0,y:3.027282},{x:1,y:4.080792},{x:2,y:5.117754},{x:3,y:5.888058},{x:4,y:6.484777},{x:5,y:6.966941},{x:6,y:7.366195},{x:7,y:7.706413},{x:8,y:8.003205},{x:9,y:8.26946},{x:10,y:8.5139},{x:11,y:8.742959},{x:12,y:8.960956},
        {x:13,y:9.170505},{x:14,y:9.373665},{x:15,y:9.571948},{x:16,y:9.7667},{x:17,y:9.958406},{x:18,y:10.14755},{x:19,y:10.33431},{x:20,y:10.51961},{x:21,y:10.70383},{x:22,y:10.88716},{x:23,y:11.06946},{x:24,y:11.25065},
        ]
    });
    this.barChartData.push({
      label: '50th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifty'],backgroundColor:chartColors['Fifty']
      , data: [{x:0,y:3.3464},{x:1,y:4.4709},{x:2,y:5.5675},{x:3,y:6.3762},{x:4,y:7.0023},{x:5,y:7.5105},{x:6,y:7.934},{x:7,y:8.297},{x:8,y:8.6151},{x:9,y:8.9014},{x:10,y:9.1649},{x:11,y:9.4122},{x:12,y:9.6479},
        {x:13,y:9.8749},{x:14,y:10.0953},{x:15,y:10.3108},{x:16,y:10.5228},{x:17,y:10.7319},{x:18,y:10.9385},{x:19,y:11.143},{x:20,y:11.3462},{x:21,y:11.5486},{x:22,y:11.7504},{x:23,y:11.9514},{x:24,y:12.1515},
        ]
    });
    this.barChartData.push({
      label: '75th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['SeventyFive'],backgroundColor:chartColors['SeventyFive']
      , data: [{x:0,y:3.686659},{x:1,y:4.889123},{x:2,y:6.048448},{x:3,y:6.897306},{x:4,y:7.554286},{x:5,y:8.090161},{x:6,y:8.539707},{x:7,y:8.927371},{x:8,y:9.268678},{x:9,y:9.5769},{x:10,y:9.861313},{x:11,y:10.12867},{x:12,y:10.38387},
        {x:13,y:10.63014},{x:14,y:10.86959},{x:15,y:11.10416},{x:16,y:11.33528},{x:17,y:11.5637},{x:18,y:11.7897},{x:19,y:12.01396},{x:20,y:12.23713},{x:21,y:12.45983},{x:22,y:12.6823},{x:23,y:12.90424},{x:24,y:13.12555},
        ]
    });
    this.barChartData.push({
      label: '90th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Ninty'],backgroundColor:chartColors['Ninty']
      , data: [{x:0,y:4.011499},{x:1,y:5.290726},{x:2,y:6.509323},{x:3,y:7.395936},{x:4,y:8.082087},{x:5,y:8.644384},{x:6,y:9.119041},{x:7,y:9.530656},{x:8,y:9.894622},{x:9,y:10.22433},{x:10,y:10.5293},{x:11,y:10.81641},{x:12,y:11.09087},
        {x:13,y:11.35618},{x:14,y:11.61449},{x:15,y:11.86797},{x:16,y:12.11808},{x:17,y:12.36571},{x:18,y:12.61101},{x:19,y:12.855},{x:20,y:13.09811},{x:21,y:13.3411},{x:22,y:13.58426},{x:23,y:13.82718},{x:24,y:14.06979},
        ]
    });
    this.barChartData.push({
      label: '95th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyFive'],backgroundColor:chartColors['NintyFive']
      , data: [{x:0,y:4.214527},{x:1,y:5.542933},{x:2,y:6.798348},{x:3,y:7.708329},{x:4,y:8.412602},{x:5,y:8.991445},{x:6,y:9.481939},{x:7,y:9.908738},{x:8,y:10.28713},{x:9,y:10.63055},{x:10,y:10.94868},{x:11,y:11.24845},{x:12,y:11.53526},
        {x:13,y:11.81281},{x:14,y:12.08325},{x:15,y:12.34891},{x:16,y:12.61125},{x:17,y:12.87128},{x:18,y:13.12906},{x:19,y:13.38579},{x:20,y:13.64181},{x:21,y:13.89795},{x:22,y:14.15453},{x:23,y:14.41108},{x:24,y:14.66753},
        ]
    });
    this.barChartData.push({
      label: '98th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyEight'],backgroundColor:chartColors['NintyEight']
      , data: [{x:0,y:4.419354},{x:1,y:5.798331},{x:2,y:7.090758},{x:3,y:8.024169},{x:4,y:8.746662},{x:5,y:9.342238},{x:6,y:9.848832},{x:7,y:10.29113},{x:8,y:10.68428},{x:9,y:11.04177},{x:10,y:11.37341},{x:11,y:11.6862},{x:12,y:11.98574},
        {x:13,y:12.27589},{x:14,y:12.55884},{x:15,y:12.83707},{x:16,y:13.11206},{x:17,y:13.38491},{x:18,y:13.65558},{x:19,y:13.92552},{x:20,y:14.19492},{x:21,y:14.46469},{x:22,y:14.7352},{x:23,y:15.0059},{x:24,y:15.27674},
        ]
    });
  }
  }

}
