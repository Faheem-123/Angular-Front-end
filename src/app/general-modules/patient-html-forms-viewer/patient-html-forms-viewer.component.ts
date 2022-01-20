import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { EncounterService } from '../../services/encounter/encounter.service';
import { LogMessage } from '../../shared/log-message';
import { LookupList, LOOKUP_LIST } from '../../providers/lookupList.module';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import "../../../assets/js/ehr.js";
import { GeneralOperation } from '../../shared/generalOperation';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeUtil, DateTimeFormat } from '../../shared/date-time-util';
import { ORMPatientConsultant } from '../../models/patient/orm-patient-consultant';
import { ORMPatientHealthCheck } from '../../models/encounter/ORMPatientHealthCheck';
import { WrapperObjectSave } from '../../models/general/wrapper-object-save';
import { ORMKeyValue } from '../../models/general/orm-key-value';
import { SearchCriteria } from '../../models/common/search-criteria';
import { HealthcheckSignAuthenticationComponent } from '../healthcheck-sign-authentication/healthcheck-sign-authentication.component';
import { PromptResponseEnum } from 'src/app/shared/enum-util';
import { ORMGYNForm } from 'src/app/models/encounter/ORMGYNForm';
declare var myExtObject: any;
declare var webGlObject: any;
@Component({
  selector: 'app-patient-html-forms-viewer',
  templateUrl: './patient-html-forms-viewer.component.html',
  styleUrls: ['./patient-html-forms-viewer.component.css'],
  encapsulation:ViewEncapsulation.None

})
export class PatientHtmlFormsViewerComponent implements OnInit {

  constructor(private encounterService: EncounterService, private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private domSanitizer: DomSanitizer,
    private general: GeneralOperation, public activeModal: NgbActiveModal, private dateUtil: DateTimeUtil
    ,private modalService:NgbModal 
  ) {

    webGlObject.init()
  }
  modalTitle;
  lstHealthCheck;
  chartId;
  patientId;
  provider_name='';
  form_id;
  patient_health_check_id='';
  doc_link='';
  doc_path='';
  print_html;
  operation=''
  printOption='';
  chart_provider_id='';
  sign1button;
  sign2button;
  isLetter = false;
  isLoading: boolean = false;
  isPreviewBtn = true; //used for depression screening. hide these buttons.
  depscrValues: Array<any>;
  @ViewChild('docframe') frame_div;
  ngOnInit() {
    // webGlObject.init()
    debugger;
    //if(this.modalTitle.toLocaleLowerCase()=="depression screening"){
    if(this.form_id == "84" || this.form_id == "88" || this.form_id == "89"){
      this.sign1button = true;
      this.sign2button = true;
      this.isPreviewBtn = false;
      this.isLetter = false;
    }else if(this.form_id == ""){
      this.isLetter = true;
    }
    this.getHealthCheckForm()

  }
  getHealthCheckForm() {
    debugger;
    let searchcrit: SearchCriteria = new SearchCriteria();
    searchcrit.practice_id = this.lookupList.practiceInfo.practiceId;
    searchcrit.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "chart_id", value: this.chartId,option: "" },
      { name: "form_id", value: this.form_id,option: "" },
      { name: "health_check_id", value: this.patient_health_check_id,option: "" },
      { name: "doc_path", value: this.doc_path,option: "" }
    ];

    this.encounterService.getPatientHealthCheckForm(searchcrit).subscribe(
      data => {
        this.lstHealthCheck = data;
        this.processHtml(data);
        debugger;
      },
      error => {
        this.logMessage.log("getHealthCheckForm " + error);
      }
    );

  }
  urlCache = new Map<string, SafeResourceUrl>();
  getLink(): SafeResourceUrl {

    var url = this.urlCache.get("https://instanthealthcare.net/ihc/ExtResources/Prescription/annual_female_exam.html");
    if (!url) {
      url = this.domSanitizer.bypassSecurityTrustResourceUrl(
        "https://instanthealthcare.net/ihc/ExtResources/Prescription/annual_female_exam.html");
      this.urlCache.set("41", url);
    }
    return url;
  }
  processHtml(data) {
    debugger;
    this.print_html = data[0].form_html;
    //if(this.modalTitle.toLocaleLowerCase()=="depression screening"){
   // if(this.form_id == "84"){
   //   this.assignToDepScr(this.print_html);
   // }else{
      this.assignHtmltoDIV(data[0]);
   // }
    //this.print_html="<input  name='txtLMP' id='txt1' style='background-color: #FFFFCC'   type='text' />";
    //this.print_html="<b>Strong</b>";
    //this.print_html+="<input  />";
if(this.operation=="new")
{
  this.sign1button=true;
  this.sign2button=true;
}
  }
  assignHtmltoDIV(acForms) {
    debugger;
    var patient_name = acForms.patient_name;
    var dob = acForms.dob;
    var gender = acForms.gender;
    var visit_date = acForms.visit_date;
    var temperature = acForms.temperature_fahren;

    var pulse = acForms.pulse;
    var bmi = acForms.bmi;
    var height_cm = acForms.height_cm;
    var weight_kg = acForms.weight_kg;
    var headCir = acForms.head_circumference_cm;
    if (acForms.systolic_bp1 != null && acForms.systolic_bp1 != "" && acForms.diastolic_bp1 != null && acForms.diastolic_bp1 != "") {
      var bp = acForms.systolic_bp1 + "/" + acForms.diastolic_bp1;
    }
    else {
      bp = "";
    }

    var language = acForms.language;
    var form_type = acForms.form_type;

    //var CurrentDF: DateFormatter = new DateFormatter();
    //var char_date: Date = new Date(CurrentDF.format(visit_date));
    //var dob_date: Date = new Date(CurrentDF.format(dob));
    var Arrage = this.general.calculateAge(dob, visit_date);
    var strAge: string = "";
    if (Arrage[0] == "0" && Arrage[1] == "0")
      strAge = " < MONTH - 1";
    if (Arrage[0] == "0")
      strAge = Arrage[1] + " MONTH(S)";
    else if (Arrage[1] == "0")
      strAge = Arrage[0] + " YEAR(S)";
    else
      strAge = Arrage[0] + " Y - " + Arrage[1] + " M";

    let provider1_sign_info=acForms.provider1_sign_info;
    let provider2_sign_info=acForms.provider2_sign_info;
    if(this.operation=="edit")
    {
      if(provider1_sign_info=='')
      {
         this.sign1button=false;
      }
      else
      {
        this.sign1button=true;
      }
      if(provider2_sign_info=='')
      {
        this.sign2button=false;
      }
      else
      {
        this.sign2button=false;
      }        
  }
         
       
    this.print_html = this.general.ReplaceAll(this.print_html, "@patient_name", patient_name)
    this.print_html = this.general.ReplaceAll(this.print_html, "@dob", dob);
    this.print_html = this.general.ReplaceAll(this.print_html, "@gender", gender);
    this.print_html = this.general.ReplaceAll(this.print_html, "@patient_id", this.patientId);
    this.print_html = this.general.ReplaceAll(this.print_html, "@age", strAge);

    this.print_html = this.general.ReplaceAll(this.print_html, "@temp", temperature);
    this.print_html = this.general.ReplaceAll(this.print_html, "@pulse", pulse);
    this.print_html = this.general.ReplaceAll(this.print_html, "@bp1", bp);
    this.print_html = this.general.ReplaceAll(this.print_html, "@height", height_cm);//height inch
    this.print_html = this.general.ReplaceAll(this.print_html, "@weight", weight_kg); //Height Lbs
    this.print_html = this.general.ReplaceAll(this.print_html, "@bmi", bmi);
    this.print_html = this.general.ReplaceAll(this.print_html, "@headcircum", headCir);

    this.print_html = this.general.ReplaceAll(this.print_html, "@language", language);
    this.print_html = this.general.ReplaceAll(this.print_html, "@visitdate", visit_date);
    this.print_html = this.general.ReplaceAll(this.print_html, "@date", this.dateUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY));

    this.print_html = this.general.ReplaceAll(this.print_html, "@pcpName", this.provider_name);

    myExtObject.loadHTMLContents(this.print_html);
    myExtObject.setHealthcheckProvidersSignatureInfo(provider1_sign_info,provider2_sign_info);
    myExtObject.setInputTextHeight();
    // myExtObject.GetHTML_doProcess();
    // this.docframe.html;
    //var target=frame_data.document;
    //var iFrameBody = targetIFrame.getElementsByTagName('body');
    //alert(this.frame_div.ownerDocument);
  }
  getHTML() {
    debugger;
    if(this.form_id == "88" || this.form_id == "89"){
      this.isLoading = true;
    }
    myExtObject.GetHTML_doProcess();
    var resposne: string = myExtObject.getHTMLContents();
    this.saveHealthCheck(resposne);
  }
  saveObjectWrapper: WrapperObjectSave;
  saveHealthCheck(strHtml) {
    debugger;
    this.saveObjectWrapper=new WrapperObjectSave();
    //if(this.modalTitle.toLocaleLowerCase() == "depression screening"){
    if(this.form_id == "84"){
      let ormGyn: ORMGYNForm = new ORMGYNForm();
      // if(this.operation == "new"){
			// 		ormGyn.created_user = this.lookupList.logedInUser.user_name;
			// 		ormGyn.date_created = this.dateUtil.getCurrentDateTimeString();
			// 		ormGyn.client_date_created = this.dateUtil.getCurrentDateTimeString();
			// 		ormGyn.chart_id = this.chartId;
      //     ormGyn.form_id = this.form_id;
      //     ormGyn.id = '';
			// 	}
			// 	else{
			// 		 ormGyn.id = this.patient_health_check_id;
      //     if(this.test[0]!=""){
      //       ormGyn.client_date_created = this.test[0].client_date_created[0].val;
      //       ormGyn.created_user = this.test[0].created_user[0].val;
      //       ormGyn.date_created = this.test[0].date_created[0].val;
      //     }          
      //      ormGyn.chart_id = this.chartId;
			// 		 ormGyn.form_id = this.form_id;
			// 		 ormGyn.file_link = this.doc_path;
			// 		 ormGyn.form_date = '';
      //   }




        if(this.operation=='new'){
          ormGyn.id = '';
          ormGyn.created_user = this.lookupList.logedInUser.user_name;
          ormGyn.date_created = '';
          ormGyn.client_date_created = this.dateUtil.getCurrentDateTimeString();
        }
        else{
          ormGyn.id = this.patient_health_check_id;
          ormGyn.file_link=this.doc_link;

          if(this.depscrValues[0]!=""){
            ormGyn.client_date_created = this.depscrValues[0].client_date_created[0].val;
            ormGyn.created_user = this.depscrValues[0].created_user[0].val;
            ormGyn.date_created = this.depscrValues[0].date_created[0].val;
          } 
        }
        ormGyn.pregnancy_id = '';
        ormGyn.patient_id = this.patientId;
        ormGyn.chart_id = this.chartId;
        ormGyn.form_id = this.form_id;
        ormGyn.modified_user = this.lookupList.logedInUser.user_name;
        ormGyn.date_modified = '';
        ormGyn.client_date_modified = this.dateUtil.getCurrentDateTimeString();    
        ormGyn.system_ip = this.lookupList.logedInUser.systemIp;
        ormGyn.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        ormGyn.form_date = this.dateUtil.getCurrentDateTimeString();

        if(!acPath){
          acPath = this.general.filterArray(this.lookupList.lstdocumentPath,"category_name","Health_Check");
				}
        //var uploadpath:String=acPath.getItemAt(0).upload_path;
        var uploadpath:String = acPath[0].upload_path;
        this.saveObjectWrapper.ormSave=ormGyn;
        this.saveObjectWrapper.lstKeyValue=[];
        this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("HTML",strHtml));
        this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("docCategory",uploadpath));
        this.encounterService.SaveDepressionScreeningToFile(this.saveObjectWrapper).subscribe(
          data => {
            debugger;
            this.saveResult(data);
            
          },
          error => {
            
          }
        )
        
    }else{
//    this.saveObjectWrapper=new WrapperObjectSave();
    let ormobj: ORMPatientHealthCheck = new ORMPatientHealthCheck();
    if(this.operation=='new')
    {
      ormobj.health_check_id='';
      ormobj.created_user = this.lookupList.logedInUser.user_name;
      ormobj.date_created = '';
      ormobj.client_date_created = this.dateUtil.getCurrentDateTimeString();
    }
    else{
      ormobj.health_check_id=this.patient_health_check_id;
      ormobj.file_link=this.doc_link;
      ormobj.created_user=this.lstHealthCheck[0].created_user;
      ormobj.client_date_created=this.lstHealthCheck[0].client_date_created;
      ormobj.date_created=this.lstHealthCheck[0].date_created;

    }
    ormobj.patient_id = this.patientId;
    ormobj.chart_id = this.chartId;
    ormobj.form_id = this.form_id;
    ormobj.modified_user = this.lookupList.logedInUser.user_name;
    ormobj.date_modified = '';
    ormobj.client_date_modified = this.dateUtil.getCurrentDateTimeString();    
    ormobj.system_ip = this.lookupList.logedInUser.systemIp;
    ormobj.practice_id = this.lookupList.practiceInfo.practiceId.toString();

    

    var acPath = this.general.filterArray(this.lookupList.lstdocumentPath,"category_name","Health_Check");
    var upload_path:string=acPath[0].upload_path;
    debugger;
    this.saveObjectWrapper.ormSave=ormobj;
    this.saveObjectWrapper.lstKeyValue=[];
    this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("HTML",strHtml));
    this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("docCategory",upload_path));
   
    this.encounterService.SavePatientHealthExamToFile(this.saveObjectWrapper).subscribe(
      data => {
        debugger;
        this.saveResult(data);
        if(this.form_id == "88" || this.form_id == "89"){
          this.isLoading = false;
        }
      },
      error => {
        if(this.form_id == "88" || this.form_id == "89"){
          this.isLoading = false;
        }
      }
    )
    }//esle end here.
  }
  saveResult(data)
  {
    if(data.result>0)
    {
      if(this.printOption=='save&print')
      {
        this.printDiv('');
        //myExtObject.PrintHealthCheckForm();
      }
      this.activeModal.close(PromptResponseEnum.YES)
    }
  }
  printDiv(html) {
    myExtObject.GetHTML_doProcess();
    html = myExtObject.getHTMLContents();
        if(html && html != undefined && html!='') {
            var printContents = html;
    
        if(window){
            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                var popup = window.open('', '_blank', 
                'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,'
                +'location=no,status=no,titlebar=no');
               
                popup.window.focus();
                popup.document.write('<!DOCTYPE html><html><head>  '
        //+'<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css" '
        //+'media="screen,print">'
        //+'<link rel="stylesheet" href="style.css" media="screen,print">'             
        +    '</head><body onload="self.print()"><div class="reward-body">' 
        + printContents + '</div></html>');
                popup.onbeforeunload = function (event) {           
                    popup.close();          
                    return '.\n';
                };
                popup.onabort = function (event) {             
                    popup.document.close();           
                    popup.close();         
                }
            } else {
                var popup = window.open('', '_blank', 'width=800,height=600');
                popup.document.open();
                popup.document.write('<html><head>'+
        +'<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css"'
        +' media="all">'
        +'</head><body onload="window.print()">' + printContents + '</html>');
                popup.document.close();
            }
    
             popup.document.close();
            }
            return true;
        }
    }
    SavePrint(html)
    {
      this.printOption='save&print';
      this.getHTML();     
    }
    resizeTextarea(id) {
      debugger;
      var a = document.getElementById(id);
      a.style.height = 'auto';
      a.style.height = a.scrollHeight+'px';
    }
    onSignProvider1(){
      this.openAuthentication('Provider 1 Authentication');
  }
  onSignProvider2(){
    this.openAuthentication('Provider 2 Authentication');
}
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size:'sm'
  };
  openAuthentication(title){

     const modalRef = this.modalService.open(HealthcheckSignAuthenticationComponent, this.poupUpOptions);
     modalRef.componentInstance.chartProviderId=this.chart_provider_id; 
     modalRef.componentInstance.modalTitle=title;

     let closeResult;
      modalRef.result.then((result) => {
        debugger;
        let keyVlaueList: Array<ORMKeyValue>=result;
        let sign_provider_id;
        let sign_provider_name;
        let sign_provider_type;
        for(var i=0;i<keyVlaueList.length;i++)
        {
          if(keyVlaueList[i].key=='provider_id')
          {
            sign_provider_id=keyVlaueList[i].value;
          }
          if(keyVlaueList[i].key=='provider_name')
          {
            sign_provider_name=keyVlaueList[i].value;
          }
          if(keyVlaueList[i].key=='signType')
          {
            sign_provider_type=keyVlaueList[i].value;
          }
        }
        let searchCriteria:SearchCriteria=new SearchCriteria();
        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "sign_type", value: sign_provider_type, option: "" },
          { name: "sign_info", value: "SIGNED BY : "+sign_provider_name+"    DATED: "+this.dateUtil.getCurrentDateTimeString(),option: "" },
          { name: "user", value: this.lookupList.logedInUser.user_name,option: "" },
          { name: "client_date", value: this.dateUtil.getCurrentDateTimeString(),option: "" },
          { name: "system_ip", value: this.lookupList.logedInUser.systemIp,option: "" },
          { name: "id", value: this.patient_health_check_id,option: "" }
        ];

        this.encounterService.SignHealthCheckForm(searchCriteria).subscribe
        (
          data => {
            debugger;
            this.activeModal.close(PromptResponseEnum.YES); 
          },
          error => {
            this.logMessage.log("getHealthCheckForm " + error);
          }
        );
        // if(sign_provider_type == "Sign1")
        // {
        //   saveFromSign="provider1_sign_info~SIGNED BY : "+sign_provider_name+"    DATED:"+this.dateUtil.getCurrentDateTimeString();
        // }
        // else if(sign_provider_type == "Sign2")
        // {
        //   // if(healthceck_form_type.toString().toUpperCase()=="ANNUAL_FEMALE_EXAM" || healthceck_form_type.toString().toUpperCase()=="ANNUAL WELLNESS VISIT")
        //   //   saveFromSign="provider2_sign_info~CO-SIGNED BY : "+strProvierName+"    DATED:"+GeneralOptions.CurrentDateTimeString();
        //   // else
        //     saveFromSign="provider2_sign_info~SIGNED BY : "+sign_provider_name+"    DATED:"+this.dateUtil.getCurrentDateTimeString();
        // }
      }
        , (reason) => {
        });
  }
  assignToDepScr(values){
    debugger;
    myExtObject.loadHTMLContents(values);
    myExtObject.setInputTextHeight();
  }
}