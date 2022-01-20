import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LogMessage } from 'src/app/shared/log-message';
import { PatientService } from 'src/app/services/patient/patient.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LabService } from 'src/app/services/lab/lab.service';
import { OpenedPatientInfo } from 'src/app/models/common/patientInfo';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { DateModel } from 'src/app/models/general/date-model';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertTypeEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'rpt-patient-lab-order-cumulative',
  templateUrl: './rpt-patient-lab-order-cumulative.component.html',
  styleUrls: ['./rpt-patient-lab-order-cumulative.component.css']
})
export class RptPatientLabOrderCumulativeComponent implements OnInit {
  @Input() patientId='';
  @Input() openPatientInfo:OpenedPatientInfo;
  pat_name:string='';
  lstresult;
  filterForm: FormGroup;
  frmSearch: FormGroup;
  public showPatientSearch = false;
  isLoading: boolean = false;
  isAttachment:boolean=false;
  constructor(private formBuilder: FormBuilder,private logMessage: LogMessage,private labService: LabService
    ,@Inject(LOOKUP_LIST) public lookupList: LookupList,private dateTimeUtil: DateTimeUtil,
    private ngbModal:NgbModal) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm(){
    if(this.patientId!='' && this.patientId!=null)
    {
      this.pat_name=this.openPatientInfo.last_name+', '+this.openPatientInfo.first_name;
    }
    else{
      this.pat_name='';
    }
    let dt: Date = new Date;
    let dateModel: DateModel = new DateModel(dt.getFullYear()-1, dt.getMonth() + 1, dt.getDate());
    this.frmSearch = this.formBuilder.group({
      //txtDateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      txtDateFrom: this.formBuilder.control(dateModel, Validators.required),
      txtDateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
  }),
  this.filterForm = this.formBuilder.group({
    cntrlpatientSearch: this.formBuilder.control(this.pat_name, Validators.required),
  })
  if(this.pat_name!='')
  {
    let patienttxt=this.filterForm.get('cntrlpatientSearch');
    patienttxt.disable();
  }
}

onKeydown(event) 
{
  if (event.key === "Enter")
  {
    this.showPatientSearch=true;
  }
}
openSelectPatient(patient){
  debugger;
  this.patientId=patient.patient_id;
  this.filterForm = this.formBuilder.group({
    cntrlpatientSearch: this.formBuilder.control(patient.name, Validators.required),
  })
  this.showPatientSearch=false;
}
closePatientSearch(){
  this.showPatientSearch = false;
}
onFilter(criteria)     
{
  debugger;

  if(this.patientId=='')
  {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Cumulative Report', "Please Select Patient First", AlertTypeEnum.WARNING);
    return;
  }
  if(criteria.txtDateTo==null)
  {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Cumulative Report', "Please Enter To Date", AlertTypeEnum.WARNING);
    return;
  }
  if(criteria.txtDateFrom==null)
  {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Cumulative Report', "Please Enter From Date", AlertTypeEnum.WARNING);
    return;
  }
  this.isLoading=true;
   
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.criteria = '';
    searchCriteria.option = '';
    searchCriteria.param_list=[];

    if(this.patientId   >'0')  
      searchCriteria.param_list.push( { name: "patient_id", value: this.patientId, option: ""});

    if(criteria.txtDateTo!="" && criteria.txtDateTo!="null")  
      searchCriteria.param_list.push( { name: "order_to_date", value: this.dateTimeUtil.getStringDateFromDateModel(criteria.txtDateTo), option: ""});  

    if(criteria.txtDateFrom!="" && criteria.txtDateFrom!="null")  
        searchCriteria.param_list.push( { name: "order_from_date", value: this.dateTimeUtil.getStringDateFromDateModel(criteria.txtDateFrom), option: ""});   

    this.labService.getCumulativeRpt(searchCriteria).subscribe(
      data => {
        debugger;
        this.lstresult = data;
        this.testHeader();
        this.isLoading=false;
      },
      error => {
      }
    );
}
lstFinalReport:Array<any>=new Array();
testHeader(){
  debugger;
  this.lstResultHeader = new Array();
  let notfound=false;
  for(let a=0;a<this.lstresult.length;a++)
  {
      if(this.lstResultHeader.length>0)
      {
        notfound=false;
        for(let index=0;index<this.lstResultHeader.length;index++)
        {									
          if(this.lstResultHeader[index].order_date==this.lstresult[a].order_date)
          {
            notfound=false;
            break;
          }
          else{
            notfound=true;
          }
        }
        if(notfound==true)
        {
          this.lstResultHeader.push({
            order_date: this.lstresult[a].order_date,
          });
        }
    }
    else
    {
      this.lstResultHeader.push({
        order_date: this.lstresult[a].order_date,
      });
    }
  }

  debugger;
  let distinctTest: Array<any> = new UniquePipe().transform(this.lstresult, "result_code");
  
  //dynamic add col

  this.lstFinalReport=new Array();
  let rwCount=0;
  for(let i=0;i<distinctTest.length;i++)
  {
    let strOrderDate='';
    this.prepareSchema();
    let distinctTestResult: Array<any> = new ListFilterPipe().transform(this.lstresult, "result_code",distinctTest[i].result_code);    
    for(let a=0;a<distinctTestResult.length;a++)
    {
      strOrderDate=distinctTestResult[a].order_date;

      this.lstFinalReport[i].result_description=distinctTestResult[a].result_description;
      this.lstFinalReport[i].result_value_unit=distinctTestResult[a].result_unit;
      this.lstFinalReport[i].recomended_value=distinctTestResult[a].recomended_value;
      this.lstFinalReport[i][strOrderDate]=distinctTestResult[a].result_value;
      this.lstFinalReport[i].category_name=distinctTestResult[a].category_name;
      this.lstFinalReport[i].test_description=distinctTestResult[a].test_description;
      this.lstFinalReport[i].test_code=distinctTestResult[a].test_code;
      if (distinctTestResult[a].abnormal_range_code == null || distinctTestResult[a].abnormal_range_code == "" || distinctTestResult[a].abnormal_range_code.toString().toLowerCase() == "n") {
        this.lstFinalReport[i].abnormal_range_code="normal";
      }
      else {
        this.lstFinalReport[i].abnormal_range_code="abnormal";
      }
    }
  }

  
  debugger;
}
assignResultValuetoList(index,date)
{

}
prepareSchema()
{
  this.lstFinalReport.push({

    result_description:"",
    result_value:"",
    result_value_unit:"",
    recomended_value:"",  
    abnormal_range_code:"",
    category_name:"",
    test_description:"",
    test_code:"",

  });
}
//lstResultHeader;
lstResultHeader = new Array();
CreateCumulativeResultList(){

  let colum_num = 1;
  let valueColumnFeild= "";
  let valueColumnHeaderText = "";
  let valueNormal = "0x000000";	
  let obj;
  for(let a=0;a<this.lstresult.length;a++)
  {

    //****
    
  //   for(index=0;index<this.lstResultHeader.length;index++)
  //   {									
  //     if(this.lstResultHeader[index].order_date==this.lstresult[a].order_date)
  //     {
  //       //obj=this.lstResultHeader.getItemAt(index);
  //       continue;
  //     }
  //     else{
  //       this.lstResultHeader.push()
  //       this.lstResultHeader.push({
  //         order_date: this.lstresult[a].order_date,
  //       });
  //     }
  //   }

  //   //end
  //   valueColumnFeild="value_"+colum_num.toString();
  //   valueColumnHeaderText=this.lstresult[a].order_date;
  //   valueNormal="0x000000";
  //   if (this.lstresult[a].abnormal_range_code == null || this.lstresult[a].abnormal_range_code == "" || this.lstresult[a].abnormal_range_code.toString().toLowerCase() == "n") 
  //   {
  //     valueNormal = "0x000000";
  //   }
  //   else 
  //   {
  //     valueNormal = "0xff0000";
  //   }
  //   colum_num++;
  //   let columnExists=false;
	// 	let resultExists=false;	
  //   var index=0;
  //   for(index=0;index<this.lstResultHeader.length;index++)
  //   {									
  //     if(this.lstResultHeader[index].result_code==this.lstresult[a].result_code )//&& listCumulativeReport[index].category_name==listPatientResults[i].category_name
  //     {
  //       obj=this.lstResultHeader.getItemAt(index);
  //       resultExists=true;
  //       break;
  //     }
  //   }
  //   let j = 0;
  //   //var cols:Array = adgCumulativeTrendReport.columns;
  //   for (j = 0; j < this.lstResultHeader.length; j++) {
  //     var adgc: AdvancedDataGridColumn = adgColumns[j];
  //     if (adgc.headerText == valueColumnHeaderText) {
  //       columnExists = true;
  //       valueColumnFeild = adgc.dataField;
  //       valueColumnHeaderText = adgc.headerText;
  //       adgc.styleFunction = dataGrid_styleFunction;
  //     }
  //   }
  //   if (resultExists) {
  //     obj[valueColumnFeild] = listPatientResults[i].result_value;
  //     obj[valueColumnFeild + "_abnormalrange"] = listPatientResults[i].abnormal_range_code;
  //     listCumulativeReport.refresh();
  //   }
  //   else {
  //     if (!columnExists) {
  //       let k = 0;
  //       var objAddedRows: Object;
  //       for (k = 0; k < listCumulativeReport.length; k++) {
  //         objAddedRows = new Object();
  //         objAddedRows = listCumulativeReport.getItemAt(k);
  //         objAddedRows[valueColumnFeild] = null;
  //         listCumulativeReport.refresh();
  //       }
  //     }
  //     obj = new Object();
  //     obj.category_name = this.lstresult[a].category_name;
  //     obj.test_description = this.lstresult[a].test_description;
  //     obj.result_description = this.lstresult[a].result_description;
  //     obj.result_unit = this.lstresult[a].result_unit;
  //     obj.result_code = this.lstresult[a].result_code;
  //     obj.recomended_value = this.lstresult[a].recomended_value;
  //     obj.abnormal_range_code = this.lstresult[a].abnormal_range_code;
  //     obj.observation_date = this.lstresult[a].observation_date;
  //     let v = 1;
  //     for (v = 1; v < a; v++) {
  //       obj["value_" + v.toString()] = null;
  //       obj["value_" + v.toString() + "_abnormalrange"] = null;
  //     }

  //     obj[valueColumnFeild] = this.lstresult[a].result_value;
  //     obj[valueColumnFeild + "_abnormalrange"] = this.lstresult[a].abnormal_range_code;
  //     listCumulativeReport.addItem(obj);
  //   }
   }//end main for
}
}
