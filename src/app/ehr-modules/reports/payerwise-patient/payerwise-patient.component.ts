import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { ReportsService } from 'src/app/services/reports.service';
import { excelService } from 'src/app/shared/excelService';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'payerwise-patient',
  templateUrl: './payerwise-patient.component.html',
  styleUrls: ['./payerwise-patient.component.css']
})
export class PayerwisePatientComponent implements OnInit {

  showPayerSearch:boolean = false;
  payerId: number;
  payerName;
  payerNumber;
  frmPayerSubmit: FormGroup;
  lstPatientPayer;
  lstPatientPayerDetials;
  recordCount;
  recordCountPayer;
  showHide= true;
  payerDisplayName;
  selectedRow;
  selectedRowDetail;
  isLoading: boolean = false;
  isLoading2: boolean = false;
  constructor(private formBuilder:FormBuilder,private excel: excelService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,private modalService: NgbModal,
  private reportsService:ReportsService,) { 

  }

  ngOnInit() {

    this.buildForm();
  }

  buildForm(){
    this.frmPayerSubmit = this.formBuilder.group({
      txtPayerSearch: this.formBuilder.control(null),
      cmbCriteria: this.formBuilder.control('Primary')
    })
  }

  onPayerSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPayerSearch = true;
    }
    else {
      this.showPayerSearch = false;
    }
  }
  onPayerSearchInputChange(newValue) {
    if (newValue !== this.payerName) {
    
      this.payerId = undefined;
      this.payerNumber = undefined;
    }


    //this.patientName=undefined;
  }
  onPatientSearchBlur() {
    if (this.payerId == undefined && this.showPayerSearch == false) {
      this.payerName = undefined;
      this.frmPayerSubmit.get("txtPayerSearch").setValue(null);
    }
    this.payerId = undefined;
    this.payerName = undefined;
    this.payerNumber = undefined;
  }

  
  openSelectPayer(patObject) { 
    debugger;
    this.payerId = patObject.payerid;
    this.payerName = patObject.name;
    this.payerNumber = patObject.payer_number;
    
    (this.frmPayerSubmit.get('txtPayerSearch') as FormControl).setValue(this.payerName+" ("+this.payerNumber+")");

    this.showPayerSearch = false;
  }

  cmbChagne(event)
  {}

  closePayerSearch(){
    this.showPayerSearch = false;
    this.onPatientSearchBlur();
  }

  searchPatientPayer(formData)
  {
    debugger;
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list=[];
    searchCriteria.param_list.push( { name: "cmbCriteria", value: formData.cmbCriteria , option: "" });
    searchCriteria.param_list.push( { name: "payerId", value: this.payerId , option: "" });
    
    this.reportsService.getPatientPayer(searchCriteria).subscribe(
      data => { this.lstPatientPayer = data;
        this.recordCountPayer=this.lstPatientPayer['length'];
        this.recordCount = this.recordCountPayer;
        this.isLoading = false;
      },        
      error =>{
        debugger;
        this.isLoading = false;
        alert('Error is :'+error.message);});  
  }

  patientDetails(formData,val,detail){
    this.showHide = val;
    debugger;
    if(detail !="")
    {
      this.isLoading2 = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list=[];
      searchCriteria.param_list.push( { name: "cmbCriteria", value: formData.cmbCriteria , option: "" });
      searchCriteria.param_list.push( { name: "payerId", value: detail.payer_id , option: "" });
      this.payerDisplayName = detail.name;
      this.reportsService.getPatientPayerDetails(searchCriteria).subscribe(
        data => { this.lstPatientPayerDetials = data;
          this.recordCount=this.lstPatientPayerDetials['length'];
          this.isLoading2 = false;
        },
        error =>{
          debugger;
          this.isLoading2 = false;
          alert('Error is :'+error.message);});
    }
    else
    {
      this.recordCount = this.recordCountPayer;
    }
  }
  exportAsXLSXmain(){
    if (this.lstPatientPayer != undefined || this.lstPatientPayer != null) {
      this.excel.exportAsExcelFile(this.lstPatientPayer, 'name,total_patient', 'Payerwise Patient Report');
    }
    else {
      GeneralOperation.showAlertPopUp(this.modalService, 'Export To Excel', "Record not found to export.", AlertTypeEnum.WARNING);
      return false;
    }
  }
  exportAsXLSX(){
    if (this.lstPatientPayerDetials != undefined || this.lstPatientPayerDetials != null) {
      this.excel.exportAsExcelFile(this.lstPatientPayerDetials, 'name,dob,ssn,patient_id,home_phone,cell_phone,gender,address', 'Payerwise Patient Detailed Report');
    }
    else {
      GeneralOperation.showAlertPopUp(this.modalService, 'Export To Excel', "Record not found to export.", AlertTypeEnum.WARNING);
      return false;
    }
  }
  onSelectionChangerpt(row){
    this.selectedRow = row.payer_id;
  }
  onSelectionChangeDetail(row){
    this.selectedRowDetail = row.patient_id;
  }
}