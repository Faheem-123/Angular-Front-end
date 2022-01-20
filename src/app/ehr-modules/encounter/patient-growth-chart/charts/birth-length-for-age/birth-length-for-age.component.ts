import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { chartColors } from 'src/app/models/encounter/growth-chart-data-series';
@Component({
  selector: 'birth-length-for-age',
  templateUrl: './birth-length-for-age.component.html',
  styleUrls: ['./birth-length-for-age.component.css']
})
export class BirthLengthForAgeComponent implements OnInit {

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
      this.chart_title='Birth to 24 Months: Girls Length For Age Percentile';
    else
      this.chart_title='Birth to 24 Months: Boys Length For Age Percentile';
    //let vitallstData=[{ x: 0.1, y: 2.75,tooltip:{visit_date:'07/01/2015',age:{year:'0',month:'0',days:'4'},weight:'6.1 lbs'} }, { x: 0.8, y: 3.60 }, { x: 1.6, y: 4.56 }, { x: 2, y: 4.79 }, { x: 4.4, y: 5.93 }, { x: 7.2, y: 6.49 }, { x: 7.4, y: 6.38 }, { x: 10.8, y: 7.48 }, { x: 13.6, y: 8.39 }, { x: 14.8, y: 8.62 }, { x: 15.6, y: 8.67 }, { x: 15.9, y: 9.07 }, { x: 16.2, y: 9.19 }, { x: 18.2, y: 9.24 }, { x: 19, y: 10.21 }, { x: 19.7, y: 10.43 }, { x: 20.7, y: 10.23 }, { x: 21.7, y: 10.66 }, { x: 22, y: 10.55 }, { x: 22.4, y: 10.66 }, { x: 22.9, y: 10.89 }, { x: 24.7, y: 11.11 }, { x: 25, y: 11.11 }, { x: 28.6, y: 12.30 }, { x: 29, y: 12.76 }];
    let vitallstData=[];
    if(this.lstVitalData!=undefined && this.lstVitalData!=null && this.lstVitalData.length>0)
    {
      for(let i=0;i<this.lstVitalData.length;i++)
      {
        vitallstData.push({x:this.lstVitalData[i].final_months,y:this.lstVitalData[i].height_cm,tooltip:{visit_date:this.lstVitalData[i].visit_date,age:{year:this.lstVitalData[i].years,month:this.lstVitalData[i].months,days:this.lstVitalData[i].days},weight:this.lstVitalData[i].height_cm+' cm'}});
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
              min: 34,
              max: 110,
             stepSize:3,
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
            min: 13,
            max: 43,
            stepSize: 2,
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
      , data: [{x:0,y:45.4223043},{x:1,y:49.7787718},{x:2,y:52.9949775},{x:3,y:55.5927758},{x:4,y:57.7609922},{x:5,y:59.5953753},{x:6,y:61.1982833},{x:7,y:62.656588},{x:8,y:64.0198138},{x:9,y:65.3120157},{x:10,y:66.5466965},{x:11,y:67.7294251},{x:12,y:68.8650363},
        {x:13,y:69.9583854},{x:14,y:71.0135941},{x:15,y:72.0315003},{x:16,y:73.016649},{x:17,y:73.9729301},{x:18,y:74.9001595},{x:19,y:75.8018023},{x:20,y:76.6778157},{x:21,y:77.5310529},{x:22,y:78.363609},{x:23,y:79.1728908},{x:24,y:79.9618054},
        ]
    });

    this.barChartData.push({
      label: '5th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifth'],backgroundColor:chartColors['Fifth']
      , data: [{x:0,y:46.08383},{x:1,y:50.4728},{x:2,y:53.71811},{x:3,y:56.34038},{x:4,y:58.52969},{x:5,y:60.38286},{x:6,y:62.00319},{x:7,y:63.47888},{x:8,y:64.85973},{x:9,y:66.16996},{x:10,y:67.42304},{x:11,y:68.62467},{x:12,y:69.77953},
        {x:13,y:70.89228},{x:14,y:71.96683},{x:15,y:73.00432},{x:16,y:74.00908},{x:17,y:74.98475},{x:18,y:75.93146},{x:19,y:76.8524},{x:20,y:77.74783},{x:21,y:78.62035},{x:22,y:79.47174},{x:23,y:80.3},{x:24,y:81.10777},
        ]
    });
    this.barChartData.push({
      label: '10th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Tenth'],backgroundColor:chartColors['Tenth']
      , data: [{x:0,y:46.76056},{x:1,y:51.18277},{x:2,y:54.45785},{x:3,y:57.10515},{x:4,y:59.31604},{x:5,y:61.18844},{x:6,y:62.82658},{x:7,y:64.32005},{x:8,y:65.71894},{x:9,y:67.0476},{x:10,y:68.31951},{x:11,y:69.54048},{x:12,y:70.71503},
        {x:13,y:71.84762},{x:14,y:72.94195},{x:15,y:73.99947},{x:16,y:75.0243},{x:17,y:76.01981},{x:18,y:76.98644},{x:19,y:77.92712},{x:20,y:78.84242},{x:21,y:79.73466},{x:22,y:80.60531},{x:23,y:81.453},{x:24,y:82.28006},
        ]
    });

    this.barChartData.push({
      label: '25th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['TwentyFive'],backgroundColor:chartColors['TwentyFive']
      , data: [{x:0,y:47.89133},{x:1,y:52.3691},{x:2,y:55.69393},{x:3,y:58.38306},{x:4,y:60.63},{x:5,y:62.53451},{x:6,y:64.20243},{x:7,y:65.72562},{x:8,y:67.15464},{x:9,y:68.51411},{x:10,y:69.81746},{x:11,y:71.07075},{x:12,y:72.2782},
        {x:13,y:73.44396},{x:14,y:74.57133},{x:15,y:75.66234},{x:16,y:76.72069},{x:17,y:77.74936},{x:18,y:78.74927},{x:19,y:79.72293},{x:20,y:80.67144},{x:21,y:81.59662},{x:22,y:82.49946},{x:23,y:83.3796},{x:24,y:84.23889},
        ]
    });
    this.barChartData.push({
      label: '50th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifty'],backgroundColor:chartColors['Fifty']
      , data: [{x:0,y:49.1477},{x:1,y:53.6872},{x:2,y:57.0673},{x:3,y:59.8029},{x:4,y:62.0899},{x:5,y:64.0301},{x:6,y:65.7311},{x:7,y:67.2873},{x:8,y:68.7498},{x:9,y:70.1435},{x:10,y:71.4818},{x:11,y:72.771},{x:12,y:74.015},
        {x:13,y:75.2176},{x:14,y:76.3817},{x:15,y:77.5099},{x:16,y:78.6055},{x:17,y:79.671},{x:18,y:80.7079},{x:19,y:81.7182},{x:20,y:82.7036},{x:21,y:83.6654},{x:22,y:84.604},{x:23,y:85.5202},{x:24,y:86.4153},
        ]
    });
    this.barChartData.push({
      label: '75th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['SeventyFive'],backgroundColor:chartColors['SeventyFive']
      , data: [{x:0,y:50.40407},{x:1,y:55.0053},{x:2,y:58.44067},{x:3,y:61.22274},{x:4,y:63.5498},{x:5,y:65.52569},{x:6,y:67.25977},{x:7,y:68.84898},{x:8,y:70.34496},{x:9,y:71.77289},{x:10,y:73.14614},{x:11,y:74.47125},{x:12,y:75.7518},
        {x:13,y:76.99124},{x:14,y:78.19207},{x:15,y:79.35746},{x:16,y:80.49031},{x:17,y:81.59264},{x:18,y:82.66653},{x:19,y:83.71347},{x:20,y:84.73576},{x:21,y:85.73418},{x:22,y:86.70854},{x:23,y:87.6608},{x:24,y:88.59171},
        ]
    });
    this.barChartData.push({
      label: '90th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Ninty'],backgroundColor:chartColors['Ninty']
      , data: [{x:0,y:51.53484},{x:1,y:56.19163},{x:2,y:59.67675},{x:3,y:62.50065},{x:4,y:64.86376},{x:5,y:66.87176},{x:6,y:68.63562},{x:7,y:70.25455},{x:8,y:71.78066},{x:9,y:73.2394},{x:10,y:74.64409},{x:11,y:76.00152},{x:12,y:77.31497},
        {x:13,y:78.58758},{x:14,y:79.82145},{x:15,y:81.02033},{x:16,y:82.1867},{x:17,y:83.32219},{x:18,y:84.42936},{x:19,y:85.50928},{x:20,y:86.56478},{x:21,y:87.59614},{x:22,y:88.60269},{x:23,y:89.5874},{x:24,y:90.55054},
        ]
    });
    this.barChartData.push({
      label: '95th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyFive'],backgroundColor:chartColors['NintyFive']
      , data: [{x:0,y:52.21157},{x:1,y:56.9016},{x:2,y:60.41649},{x:3,y:63.26542},{x:4,y:65.65011},{x:5,y:67.67734},{x:6,y:69.45901},{x:7,y:71.09572},{x:8,y:72.63987},{x:9,y:74.11704},{x:10,y:75.54056},{x:11,y:76.91733},{x:12,y:78.25047},
        {x:13,y:79.54292},{x:14,y:80.79657},{x:15,y:82.01548},{x:16,y:83.20192},{x:17,y:84.35725},{x:18,y:85.48434},{x:19,y:86.584},{x:20,y:87.65937},{x:21,y:88.71045},{x:22,y:89.73626},{x:23,y:90.7404},{x:24,y:91.72283},
        ]
    });
    this.barChartData.push({
      label: '98th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyEight'],backgroundColor:chartColors['NintyEight']
      , data: [{x:0,y:52.8730957},{x:1,y:57.5956282},{x:2,y:61.1396225},{x:3,y:64.0130242},{x:4,y:66.4188078},{x:5,y:68.4648247},{x:6,y:70.2639167},{x:7,y:71.918012},{x:8,y:73.4797862},{x:9,y:74.9749843},{x:10,y:76.4169035},{x:11,y:77.8125749},{x:12,y:79.1649637},
        {x:13,y:80.4768146},{x:14,y:81.7498059},{x:15,y:82.9882997},{x:16,y:84.1943511},{x:17,y:85.3690699},{x:18,y:86.5156405},{x:19,y:87.6345977},{x:20,y:88.7293843},{x:21,y:89.7997471},{x:22,y:90.844391},{x:23,y:91.8675092},{x:24,y:92.8687946},
        ]
    });
  }
  else{ //Boys
    this.barChartData.push({
      label: '2nd', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Second'],backgroundColor:chartColors['Second']
      , data: [{x:0,y:46.09799},{x:1,y:50.83131},{x:2,y:54.42396},{x:3,y:57.34047},{x:4,y:59.72447},{x:5,y:61.67956},{x:6,y:63.34303},{x:7,y:64.82235},{x:8,y:66.18835},{x:9,y:67.48217},{x:10,y:68.71138},{x:11,y:69.88013},{x:12,y:70.99632},
        {x:13,y:72.06657},{x:14,y:73.09511},{x:15,y:74.08522},{x:16,y:75.04248},{x:17,y:75.96753},{x:18,y:76.86417},{x:19,y:77.73119},{x:20,y:78.5717},{x:21,y:79.3865},{x:22,y:80.17925},{x:23,y:80.95077},{x:24,y:81.70586},
         ]
    });

    this.barChartData.push({
      label: '5th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifth'],backgroundColor:chartColors['Fifth']
      , data: [ {x:0,y:46.77032},{x:1,y:51.52262},{x:2,y:55.13442},{x:3,y:58.06652},{x:4,y:60.46344},{x:5,y:62.42946},{x:6,y:64.10314},{x:7,y:65.5934},{x:8,y:66.97163},{x:9,y:68.27886},{x:10,y:69.52286},{x:11,y:70.70738},{x:12,y:71.84023},
        {x:13,y:72.92816},{x:14,y:73.97491},{x:15,y:74.98384},{x:16,y:75.96033},{x:17,y:76.90533},{x:18,y:77.8221},{x:19,y:78.70973},{x:20,y:79.57106},{x:21,y:80.40724},{x:22,y:81.22133},{x:23,y:82.01447},{x:24,y:82.79087},
        ]
    });
    this.barChartData.push({
      label: '10th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Tenth'],backgroundColor:chartColors['Tenth']
      , data: [{x:0,y:47.45809},{x:1,y:52.2298},{x:2,y:55.8612},{x:3,y:58.80924},{x:4,y:61.21939},{x:5,y:63.19658},{x:6,y:64.88071},{x:7,y:66.38216},{x:8,y:67.77291},{x:9,y:69.09384},{x:10,y:70.35297},{x:11,y:71.55363},{x:12,y:72.70353},
        {x:13,y:73.80954},{x:14,y:74.87492},{x:15,y:75.9031},{x:16,y:76.89925},{x:17,y:77.86466},{x:18,y:78.80202},{x:19,y:79.71074},{x:20,y:80.59338},{x:21,y:81.45143},{x:22,y:82.28734},{x:23,y:83.1026},{x:24,y:83.9008},
         ]
    });

    this.barChartData.push({
      label: '25th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['TwentyFive'],backgroundColor:chartColors['TwentyFive']
      , data: [{x:0,y:48.60732},{x:1,y:53.41147},{x:2,y:57.0756},{x:3,y:60.0503},{x:4,y:62.48254},{x:5,y:64.4784},{x:6,y:66.18},{x:7,y:67.70013},{x:8,y:69.1118},{x:9,y:70.45564},{x:10,y:71.74005},{x:11,y:72.96769},{x:12,y:74.14605},
        {x:13,y:75.28228},{x:14,y:76.37879},{x:15,y:77.43914},{x:16,y:78.46814},{x:17,y:79.46765},{x:18,y:80.43942},{x:19,y:81.38338},{x:20,y:82.30162},{x:21,y:83.19621},{x:22,y:84.06859},{x:23,y:84.92082},{x:24,y:85.75545},
         ]
    });
    this.barChartData.push({
      label: '50th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Fifty'],backgroundColor:chartColors['Fifty']
      , data: [{x:0,y:49.8842},{x:1,y:54.7244},{x:2,y:58.4249},{x:3,y:61.4292},{x:4,y:63.886},{x:5,y:65.9026},{x:6,y:67.6236},{x:7,y:69.1645},{x:8,y:70.5994},{x:9,y:71.9687},{x:10,y:73.2812},{x:11,y:74.5388},{x:12,y:75.7488},
        {x:13,y:76.9186},{x:14,y:78.0497},{x:15,y:79.1458},{x:16,y:80.2113},{x:17,y:81.2487},{x:18,y:82.2587},{x:19,y:83.2418},{x:20,y:84.1996},{x:21,y:85.1348},{x:22,y:86.0477},{x:23,y:86.941},{x:24,y:87.8161},
         ]
    });
    this.barChartData.push({
      label: '75th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['SeventyFive'],backgroundColor:chartColors['SeventyFive']
      , data: [ {x:0,y:51.16108},{x:1,y:56.03733},{x:2,y:59.7742},{x:3,y:62.8081},{x:4,y:65.28946},{x:5,y:67.3268},{x:6,y:69.0672},{x:7,y:70.62887},{x:8,y:72.087},{x:9,y:73.48176},{x:10,y:74.82235},{x:11,y:76.10991},{x:12,y:77.35155},
        {x:13,y:78.55492},{x:14,y:79.72061},{x:15,y:80.85246},{x:16,y:81.95446},{x:17,y:83.02975},{x:18,y:84.07798},{x:19,y:85.10022},{x:20,y:86.09758},{x:21,y:87.07339},{x:22,y:88.02681},{x:23,y:88.96118},{x:24,y:89.87675},
        ]
    });
    this.barChartData.push({
      label: '90th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['Ninty'],backgroundColor:chartColors['Ninty']
      , data: [ {x:0,y:52.31031},{x:1,y:57.219},{x:2,y:60.9886},{x:3,y:64.04916},{x:4,y:66.55261},{x:5,y:68.60862},{x:6,y:70.36649},{x:7,y:71.94684},{x:8,y:73.42589},{x:9,y:74.84356},{x:10,y:76.20943},{x:11,y:77.52397},{x:12,y:78.79407},
        {x:13,y:80.02766},{x:14,y:81.22448},{x:15,y:82.3885},{x:16,y:83.52335},{x:17,y:84.63274},{x:18,y:85.71538},{x:19,y:86.77286},{x:20,y:87.80582},{x:21,y:88.81817},{x:22,y:89.80806},{x:23,y:90.7794},{x:24,y:91.7314},
         ]
    });
    this.barChartData.push({
      label: '95th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyFive'],backgroundColor:chartColors['NintyFive']
      , data: [{x:0,y:52.99808},{x:1,y:57.92618},{x:2,y:61.71538},{x:3,y:64.79188},{x:4,y:67.30856},{x:5,y:69.37574},{x:6,y:71.14406},{x:7,y:72.7356},{x:8,y:74.22717},{x:9,y:75.65854},{x:10,y:77.03954},{x:11,y:78.37022},{x:12,y:79.65737},
        {x:13,y:80.90904},{x:14,y:82.12449},{x:15,y:83.30776},{x:16,y:84.46227},{x:17,y:85.59207},{x:18,y:86.6953},{x:19,y:87.77387},{x:20,y:88.82814},{x:21,y:89.86236},{x:22,y:90.87407},{x:23,y:91.86753},{x:24,y:92.84133},
         ]
    });
    this.barChartData.push({
      label: '98th', pointRadius: 0, pointBackgroundColor: '#4da5f7', pointHoverRadius: 0, pointHoverBorderWidth: 0, spanGaps: true, showLine: true, borderWidth: 1, fill: false, borderColor: chartColors['NintyEight'],backgroundColor:chartColors['NintyEight']
      , data: [{x:0,y:53.67041},{x:1,y:58.61749},{x:2,y:62.42584},{x:3,y:65.51793},{x:4,y:68.04753},{x:5,y:70.12564},{x:6,y:71.90417},{x:7,y:73.50665},{x:8,y:75.01045},{x:9,y:76.45523},{x:10,y:77.85102},{x:11,y:79.19748},{x:12,y:80.50128},
        {x:13,y:81.77063},{x:14,y:83.0043},{x:15,y:84.20638},{x:16,y:85.38012},{x:17,y:86.52987},{x:18,y:87.65323},{x:19,y:88.75241},{x:20,y:89.8275},{x:21,y:90.8831},{x:22,y:91.91615},{x:23,y:92.93123},{x:24,y:93.92634},
         ]
    });
  }
  }

}
