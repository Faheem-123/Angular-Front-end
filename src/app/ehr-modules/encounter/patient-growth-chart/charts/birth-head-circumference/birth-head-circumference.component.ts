import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { chartColors } from 'src/app/models/encounter/growth-chart-data-series';
@Component({
  selector: 'birth-head-circumference',
  templateUrl: './birth-head-circumference.component.html',
  styleUrls: ['./birth-head-circumference.component.css']
})
export class BirthHeadCircumferenceComponent implements OnInit {

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
      this.chart_title='Birth to 24 Months: Girls Head Circumference-for-age Percentiles';
    else
      this.chart_title='Birth to 24 Months: Boys Head Circumference-for-age Percentiles';
    //let vitallstData=[{ x: 0.1, y: 2.75,tooltip:{visit_date:'07/01/2015',age:{year:'0',month:'0',days:'4'},weight:'6.1 lbs'} }, { x: 0.8, y: 3.60 }, { x: 1.6, y: 4.56 }, { x: 2, y: 4.79 }, { x: 4.4, y: 5.93 }, { x: 7.2, y: 6.49 }, { x: 7.4, y: 6.38 }, { x: 10.8, y: 7.48 }, { x: 13.6, y: 8.39 }, { x: 14.8, y: 8.62 }, { x: 15.6, y: 8.67 }, { x: 15.9, y: 9.07 }, { x: 16.2, y: 9.19 }, { x: 18.2, y: 9.24 }, { x: 19, y: 10.21 }, { x: 19.7, y: 10.43 }, { x: 20.7, y: 10.23 }, { x: 21.7, y: 10.66 }, { x: 22, y: 10.55 }, { x: 22.4, y: 10.66 }, { x: 22.9, y: 10.89 }, { x: 24.7, y: 11.11 }, { x: 25, y: 11.11 }, { x: 28.6, y: 12.30 }, { x: 29, y: 12.76 }];
    let vitallstData=[];
    if(this.lstVitalData!=undefined && this.lstVitalData!=null && this.lstVitalData.length>0)
    {
      for(let i=0;i<this.lstVitalData.length;i++)
      {
        vitallstData.push({x:this.lstVitalData[i].final_months,y:this.lstVitalData[i].head_circumference_cm,tooltip:{visit_date:this.lstVitalData[i].visit_date,age:{year:this.lstVitalData[i].years,month:this.lstVitalData[i].months,days:this.lstVitalData[i].days},weight:this.lstVitalData[i].head_circumference_cm+' cm'}});
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
        scaleShowValues: true,
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
              this.pointToolTip.push('Length: '+focused_point_data.weight);
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
              autoSkip: false,
              min: 28,
              max: 54,
             stepSize:2,
           },
           scaleLabel: {
            display: true,
            labelString: 'Length (cm)',
          }
          },
          
          {
            position: 'right',
            type: 'linear',

            ticks: {
            autoSkip: false,
            min: 11,
            max: 22,
            stepSize: 1,
           },
           gridLines : {
            display : false
       },
           scaleLabel: {
            display: true,
            labelString: 'Length (in)',
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
      , data: [{x:0,y:31.5099},{x:1,y:34.20003},{x:2,y:35.82845},{x:3,y:37.05014},{x:4,y:38.05021},{x:5,y:38.88688},{x:6,y:39.5941},{x:7,y:40.19502},{x:8,y:40.71043},{x:9,y:41.15374},{x:10,y:41.53906},{x:11,y:41.87813},{x:12,y:42.17847},
        {x:13,y:42.44752},{x:14,y:42.69001},{x:15,y:42.91032},{x:16,y:43.11402},{x:17,y:43.30266},{x:18,y:43.47988},{x:19,y:43.647},{x:20,y:43.80672},{x:21,y:43.96027},{x:22,y:44.10877},{x:23,y:44.2525},{x:24,y:44.39184},
        ]
    });

    this.barChartData.push({
      label: '5th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifth'],backgroundColor:chartColors['Fifth']
      , data: [{x:0,y:31.93054},{x:1,y:34.61666},{x:2,y:36.25882},{x:3,y:37.49099},{x:4,y:38.49974},{x:5,y:39.34362},{x:6,y:40.05675},{x:7,y:40.66274},{x:8,y:41.18218},{x:9,y:41.62897},{x:10,y:42.01724},{x:11,y:42.35869},{x:12,y:42.66112},
        {x:13,y:42.93188},{x:14,y:43.17594},{x:15,y:43.39772},{x:16,y:43.60252},{x:17,y:43.79225},{x:18,y:43.97043},{x:19,y:44.13856},{x:20,y:44.2992},{x:21,y:44.45359},{x:22,y:44.60287},{x:23,y:44.74733},{x:24,y:44.88734},
        ]
    });
    this.barChartData.push({
      label: '10th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Tenth'],backgroundColor:chartColors['Tenth']
      , data: [{x:0,y:32.36083},{x:1,y:35.04287},{x:2,y:36.69908},{x:3,y:37.94197},{x:4,y:38.95958},{x:5,y:39.81085},{x:6,y:40.53002},{x:7,y:41.14121},{x:8,y:41.66477},{x:9,y:42.11512},{x:10,y:42.50639},{x:11,y:42.85029},{x:12,y:43.15485},
        {x:13,y:43.42737},{x:14,y:43.67302},{x:15,y:43.89631},{x:16,y:44.10224},{x:17,y:44.29309},{x:18,y:44.47224},{x:19,y:44.6414},{x:20,y:44.80299},{x:21,y:44.95824},{x:22,y:45.10832},{x:23,y:45.25352},{x:24,y:45.39421},
        ]
    });

    this.barChartData.push({
      label: '25th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['TwentyFive'],backgroundColor:chartColors['TwentyFive']
      , data: [{x:0,y:33.07983},{x:1,y:35.75503},{x:2,y:37.43474},{x:3,y:38.69554},{x:4,y:39.72797},{x:5,y:40.59157},{x:6,y:41.32084},{x:7,y:41.9407},{x:8,y:42.47115},{x:9,y:42.92745},{x:10,y:43.32375},{x:11,y:43.67172},{x:12,y:43.97986},
        {x:13,y:44.2553},{x:14,y:44.50363},{x:15,y:44.72944},{x:16,y:44.93725},{x:17,y:45.12997},{x:18,y:45.31075},{x:19,y:45.48164},{x:20,y:45.64479},{x:21,y:45.80149},{x:22,y:45.95291},{x:23,y:46.09933},{x:24,y:46.24117},
        ]
    });
    this.barChartData.push({
      label: '50th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifty'],backgroundColor:chartColors['Fifty']
      , data: [{x:0,y:33.8787},{x:1,y:36.5463},{x:2,y:38.2521},{x:3,y:39.5328},{x:4,y:40.5817},{x:5,y:41.459},{x:6,y:42.1995},{x:7,y:42.829},{x:8,y:43.3671},{x:9,y:43.83},{x:10,y:44.2319},{x:11,y:44.5844},{x:12,y:44.8965},
        {x:13,y:45.1752},{x:14,y:45.4265},{x:15,y:45.6551},{x:16,y:45.865},{x:17,y:46.0598},{x:18,y:46.2424},{x:19,y:46.4152},{x:20,y:46.5801},{x:21,y:46.7384},{x:22,y:46.8913},{x:23,y:47.0391},{x:24,y:47.1822},
        ]
    });
    this.barChartData.push({
      label: '75th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['SeventyFive'],backgroundColor:chartColors['SeventyFive']
      , data: [{x:0,y:34.67757},{x:1,y:37.33757},{x:2,y:39.06946},{x:3,y:40.37006},{x:4,y:41.43543},{x:5,y:42.32643},{x:6,y:43.07816},{x:7,y:43.7173},{x:8,y:44.26305},{x:9,y:44.73255},{x:10,y:45.14005},{x:11,y:45.49708},{x:12,y:45.81314},
        {x:13,y:46.0951},{x:14,y:46.34937},{x:15,y:46.58076},{x:16,y:46.79275},{x:17,y:46.98963},{x:18,y:47.17405},{x:19,y:47.34876},{x:20,y:47.51541},{x:21,y:47.67531},{x:22,y:47.82969},{x:23,y:47.97887},{x:24,y:48.12323},
        ]
    });
    this.barChartData.push({
      label: '90th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Ninty'],backgroundColor:chartColors['Ninty']
      , data: [{x:0,y:35.39657},{x:1,y:38.04973},{x:2,y:39.80512},{x:3,y:41.12363},{x:4,y:42.20382},{x:5,y:43.10715},{x:6,y:43.86898},{x:7,y:44.51679},{x:8,y:45.06943},{x:9,y:45.54488},{x:10,y:45.95741},{x:11,y:46.31851},{x:12,y:46.63815},
        {x:13,y:46.92303},{x:14,y:47.17998},{x:15,y:47.41389},{x:16,y:47.62776},{x:17,y:47.82651},{x:18,y:48.01256},{x:19,y:48.189},{x:20,y:48.35721},{x:21,y:48.51856},{x:22,y:48.67428},{x:23,y:48.82468},{x:24,y:48.97019},
        ]
    });
    this.barChartData.push({
      label: '95th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyFive'],backgroundColor:chartColors['NintyFive']
      , data: [{x:0,y:35.82686},{x:1,y:38.47594},{x:2,y:40.24538},{x:3,y:41.57461},{x:4,y:42.66366},{x:5,y:43.57438},{x:6,y:44.34225},{x:7,y:44.99526},{x:8,y:45.55202},{x:9,y:46.03103},{x:10,y:46.44656},{x:11,y:46.81011},{x:12,y:47.13188},
        {x:13,y:47.41852},{x:14,y:47.67706},{x:15,y:47.91248},{x:16,y:48.12748},{x:17,y:48.32735},{x:18,y:48.51437},{x:19,y:48.69184},{x:20,y:48.861},{x:21,y:49.02321},{x:22,y:49.17973},{x:23,y:49.33087},{x:24,y:49.47706},
        ]
    });
    this.barChartData.push({
      label: '98th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyEight'],backgroundColor:chartColors['NintyEight']
      , data: [{x:0,y:36.2474987},{x:1,y:38.8925725},{x:2,y:40.6757531},{x:3,y:42.0154598},{x:4,y:43.1131864},{x:5,y:44.0311164},{x:6,y:44.8048971},{x:7,y:45.4629835},{x:8,y:46.0237685},{x:9,y:46.5062598},{x:10,y:46.9247381},{x:11,y:47.2906731},{x:12,y:47.6145341},
        {x:13,y:47.9028786},{x:14,y:48.1629924},{x:15,y:48.3998846},{x:16,y:48.6159827},{x:17,y:48.8169396},{x:18,y:49.004921},{x:19,y:49.1834025},{x:20,y:49.3534792},{x:21,y:49.5165305},{x:22,y:49.6738297},{x:23,y:49.8256963},{x:24,y:49.9725553},
        ]
    });
  }
  else{ //Boys
    this.barChartData.push({
      label: '2nd', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Second'],backgroundColor:chartColors['Second']
      , data: [{x:0,y:31.92128},{x:1,y:34.94019},{x:2,y:36.78314},{x:3,y:38.14913},{x:4,y:39.24371},{x:5,y:40.14288},{x:6,y:40.88935},{x:7,y:41.51388},{x:8,y:42.03988},{x:9,y:42.48701},{x:10,y:42.8715},{x:11,y:43.20496},{x:12,y:43.49653},
        {x:13,y:43.75468},{x:14,y:43.98406},{x:15,y:44.19235},{x:16,y:44.38101},{x:17,y:44.55604},{x:18,y:44.71832},{x:19,y:44.87085},{x:20,y:45.01543},{x:21,y:45.15215},{x:22,y:45.28376},{x:23,y:45.40901},{x:24,y:45.52915},
        ]
    });

    this.barChartData.push({
      label: '5th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifth'],backgroundColor:chartColors['Fifth']
      , data: [{x:0,y:32.37241},{x:1,y:35.35495},{x:2,y:37.19961},{x:3,y:38.56898},{x:4,y:39.66775},{x:5,y:40.57167},{x:6,y:41.32285},{x:7,y:41.95185},{x:8,y:42.48206},{x:9,y:42.93322},{x:10,y:43.3214},{x:11,y:43.65819},{x:12,y:43.95282},
        {x:13,y:44.21368},{x:14,y:44.44581},{x:15,y:44.65647},{x:16,y:44.84763},{x:17,y:45.02487},{x:18,y:45.18938},{x:19,y:45.34405},{x:20,y:45.4907},{x:21,y:45.62958},{x:22,y:45.76313},{x:23,y:45.89043},{x:24,y:46.01257},
        ]
    });
    this.barChartData.push({
      label: '10th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Tenth'],backgroundColor:chartColors['Tenth']
      , data: [{x:0,y:32.83389},{x:1,y:35.77923},{x:2,y:37.62565},{x:3,y:38.99847},{x:4,y:40.10153},{x:5,y:41.01031},{x:6,y:41.76631},{x:7,y:42.39988},{x:8,y:42.93439},{x:9,y:43.38967},{x:10,y:43.78163},{x:11,y:44.12182},{x:12,y:44.41958},
        {x:13,y:44.68321},{x:14,y:44.91816},{x:15,y:45.13124},{x:16,y:45.32497},{x:17,y:45.50445},{x:18,y:45.67126},{x:19,y:45.82813},{x:20,y:45.97688},{x:21,y:46.11798},{x:22,y:46.2535},{x:23,y:46.3829},{x:24,y:46.50708},
        ]
    });

    this.barChartData.push({
      label: '25th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['TwentyFive'],backgroundColor:chartColors['TwentyFive']
      , data: [{x:0,y:33.60502},{x:1,y:36.48819},{x:2,y:38.33754},{x:3,y:39.71613},{x:4,y:40.82636},{x:5,y:41.74325},{x:6,y:42.5073},{x:7,y:43.14851},{x:8,y:43.69022},{x:9,y:44.15237},{x:10,y:44.55065},{x:11,y:44.89654},{x:12,y:45.19953},
        {x:13,y:45.46778},{x:14,y:45.70745},{x:15,y:45.92456},{x:16,y:46.12259},{x:17,y:46.30582},{x:18,y:46.47646},{x:19,y:46.63699},{x:20,y:46.78927},{x:21,y:46.93407},{x:22,y:47.07289},{x:23,y:47.2058},{x:24,y:47.3334},
        ]
    });
    this.barChartData.push({
      label: '50th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifty'],backgroundColor:chartColors['Fifty']
      , data: [{x:0,y:34.4618},{x:1,y:37.2759},{x:2,y:39.1285},{x:3,y:40.5135},{x:4,y:41.6317},{x:5,y:42.5576},{x:6,y:43.3306},{x:7,y:43.9803},{x:8,y:44.53},{x:9,y:44.9998},{x:10,y:45.4051},{x:11,y:45.7573},{x:12,y:46.0661},
        {x:13,y:46.3395},{x:14,y:46.5844},{x:15,y:46.806},{x:16,y:47.0088},{x:17,y:47.1962},{x:18,y:47.3711},{x:19,y:47.5357},{x:20,y:47.6919},{x:21,y:47.8408},{x:22,y:47.9833},{x:23,y:48.1201},{x:24,y:48.2515},
        ]
    });
    this.barChartData.push({
      label: '75th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['SeventyFive'],backgroundColor:chartColors['SeventyFive']
      , data: [{x:0,y:35.31858},{x:1,y:38.06361},{x:2,y:39.91946},{x:3,y:41.31087},{x:4,y:42.43704},{x:5,y:43.37195},{x:6,y:44.1539},{x:7,y:44.81209},{x:8,y:45.36978},{x:9,y:45.84723},{x:10,y:46.25955},{x:11,y:46.61806},{x:12,y:46.93267},
        {x:13,y:47.21122},{x:14,y:47.46135},{x:15,y:47.68744},{x:16,y:47.89501},{x:17,y:48.08658},{x:18,y:48.26574},{x:19,y:48.43441},{x:20,y:48.59453},{x:21,y:48.74753},{x:22,y:48.89371},{x:23,y:49.0344},{x:24,y:49.1696},
        ]
    });
    this.barChartData.push({
      label: '90th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Ninty'],backgroundColor:chartColors['Ninty']
      , data: [{x:0,y:36.08971},{x:1,y:38.77257},{x:2,y:40.63135},{x:3,y:42.02853},{x:4,y:43.16187},{x:5,y:44.10489},{x:6,y:44.89489},{x:7,y:45.56072},{x:8,y:46.12561},{x:9,y:46.60993},{x:10,y:47.02857},{x:11,y:47.39278},{x:12,y:47.71262},
        {x:13,y:47.99579},{x:14,y:48.25064},{x:15,y:48.48076},{x:16,y:48.69263},{x:17,y:48.88795},{x:18,y:49.07094},{x:19,y:49.24327},{x:20,y:49.40692},{x:21,y:49.56362},{x:22,y:49.7131},{x:23,y:49.8573},{x:24,y:49.99592},
        ]
    });
    this.barChartData.push({
      label: '95th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyFive'],backgroundColor:chartColors['NintyFive']
      , data: [{x:0,y:36.55119},{x:1,y:39.19685},{x:2,y:41.05739},{x:3,y:42.45802},{x:4,y:43.59565},{x:5,y:44.54353},{x:6,y:45.33835},{x:7,y:46.00875},{x:8,y:46.57794},{x:9,y:47.06638},{x:10,y:47.4888},{x:11,y:47.85641},{x:12,y:48.17938},
        {x:13,y:48.46532},{x:14,y:48.72299},{x:15,y:48.95553},{x:16,y:49.16997},{x:17,y:49.36753},{x:18,y:49.55282},{x:19,y:49.72735},{x:20,y:49.8931},{x:21,y:50.05202},{x:22,y:50.20347},{x:23,y:50.34977},{x:24,y:50.49043},
        ]
    });
    this.barChartData.push({
      label: '98th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyEight'],backgroundColor:chartColors['NintyEight']
      , data: [{x:0,y:37.0023239},{x:1,y:39.6116079},{x:2,y:41.4738623},{x:3,y:42.8778679},{x:4,y:44.0196943},{x:5,y:44.9723182},{x:6,y:45.771846},{x:7,y:46.4467152},{x:8,y:47.0201176},{x:9,y:47.5125888},{x:10,y:47.9387046},{x:11,y:48.3096422},{x:12,y:48.6356671},
        {x:13,y:48.9243173},{x:14,y:49.1847412},{x:15,y:49.419647},{x:16,y:49.6365919},{x:17,y:49.8363554},{x:18,y:50.0238816},{x:19,y:50.2005513},{x:20,y:50.3683694},{x:21,y:50.529453},{x:22,y:50.6828405},{x:23,y:50.8311864},{x:24,y:50.9738496},
        ]
    });
  }
  }

}
