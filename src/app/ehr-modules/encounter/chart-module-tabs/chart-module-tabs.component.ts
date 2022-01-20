import { ORMKeyValue } from './../../../models/general/orm-key-value';
import { Chartreport_Print } from './../../../models/encounter/Chartreport_Print';
import { GeneralOperation } from './../../../shared/generalOperation';
import { Component, OnInit, Inject, Input } from '@angular/core';
import { LOOKUP_LIST, LookupList } from './../../../providers/lookupList.module';
import { EncounterToOpen } from '../../../models/encounter/EncounterToOpen';
import { UniquePipe } from '../../../shared/unique-pipe';
@Component({
  selector: 'chart-module-tabs',
  templateUrl: './chart-module-tabs.component.html',
  styleUrls: ['./chart-module-tabs.component.css']
})
export class ChartModuleTabsComponent implements OnInit {
  moduleList: String[] = ['annotations', 'vitals', 'cognitive'];
  print_html = "Print Html";
  constructor(
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private generalOperation: GeneralOperation
    , @Inject(Chartreport_Print) private objchartReport: Chartreport_Print,
  ) { }
  @Input() objencounterToOpen: EncounterToOpen;
  //@Input() openPatientInfo;

  //isLoading:boolean=false;
  //modulesLoadedCount: number = 0;
  //loadingPercentage: number = 0;
  //lstLoadedModules:Array<string>=new Array();
  

  personalInfoHeight: number;
  enc_pages;
  pageNoToBeOpened = "1";
  lstchartModulesettingFiltered;
  lstUserModuleSettingsClone;
  ngOnInit() {
    debugger;
    //this.isLoading=true;
    //this.modulesLoadedCount=0;
    //this.loadingPercentage=0;
    this.lstUserModuleSettingsClone = JSON.parse(JSON.stringify(this.lookupList.lstUserChartModuleSetting));    
    this.enc_pages = (new UniquePipe).transform(this.lstUserModuleSettingsClone, "page_no");
    this.lstchartModulesettingFiltered = this.generalOperation.filterArray(this.lstUserModuleSettingsClone, "page_no", this.pageNoToBeOpened);
    // debugger;
    /*var blocks = document.getElementsByClassName("dashboard-3d-container");

    for (var i = 0; i < blocks.length; i++) {
      var height = blocks[i].getElementsByClassName("dashboard-front")["0"].offsetHeight + 300;
      blocks[i].setAttribute('style', `height: ${height}px`);
    }*/
    //alert(this.moduleList.length)
  }
  acPrintSetting;
  printEncounter() {
    this.acPrintSetting = this.lookupList.lstUserChartModuleSetting.slice();
    this.objchartReport.chartId = this.objencounterToOpen.chart_id;
    this.objchartReport.patientId = this.objencounterToOpen.patient_id;
    this.objchartReport.acPrintSetting = this.acPrintSetting;
    this.objchartReport.getReportData();
  }

  dashboardBack(event) {
    let container = event.currentTarget;

    while ((container = container.parentElement) && !container.classList.contains('dashboard-3d-container'));

    let height = container.getElementsByClassName("dashboard-back")["0"].offsetHeight + 4;

    container.setAttribute('style', 'height: ${height}px');
  }

  dashboardFront(event) {
    let container = event.currentTarget;

    while ((container = container.parentElement) && !container.classList.contains('dashboard-3d-container'));

    let height = container.getElementsByClassName("dashboard-front")["0"].offsetHeight + 4;

    container.setAttribute('style', `height: ${height}px`);
  }
  onPageChange(value) {
    //debugger;
    //this.modulesLoadedCount=0;
    //this.loadingPercentage=0;
    //this.lstLoadedModules=new Array();
    this.pageNoToBeOpened = value;
    this.lstchartModulesettingFiltered = this.generalOperation.filterArray(this.lstUserModuleSettingsClone, "page_no", this.pageNoToBeOpened);
    let div_main = document.getElementById('div_modules_main_' + this.objencounterToOpen.chart_id);//Main Div where all modules are added

    div_main.scrollTop = 0;
  }
  dataGet(value) {
    
    //this.modulesLoadedCount++;
    //this.loadingPercentage=this.modulesLoadedCount/this.lstchartModulesettingFiltered.length*100;
    
    let lstData: ORMKeyValue = value;
    
    //this.lstLoadedModules.push(lstData.key);
    //console.log(lstData.key);    
    for (var i = 0; i < this.lstchartModulesettingFiltered.length; i++) {
      if (this.lstchartModulesettingFiltered[i].module_name == lstData.key) {
        this.lstchartModulesettingFiltered[i].oper = lstData.value;
      }

    }
  }
  navigateModule(value) {
    debugger;
    let sumHeight = 0;
    let i = 1;
    let div_main = document.getElementById('div_modules_main_' + this.objencounterToOpen.chart_id);//Main Div where all modules are added
    if (value == '1') {
      div_main.scrollTop = 0;
      return;
    }
    while (i < value) {
      let el = document.getElementById(this.objencounterToOpen.chart_id + '_' + i.toString());//get the child div, where id is set in loop in html
      if (el != null) {
        sumHeight += el.offsetHeight + 10;
      }
      i++;
    }
    //Set the scroll to main div
    div_main.scrollTop = sumHeight;
  }
}
