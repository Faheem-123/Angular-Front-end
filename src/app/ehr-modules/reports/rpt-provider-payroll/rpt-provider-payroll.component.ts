import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ReportsService } from 'src/app/services/reports.service';
import { LogMessage } from 'src/app/shared/log-message';
import { ORMpayrollObj } from 'src/app/models/reports/ORMpayrollObj';
import { ORMPayrollCategories } from 'src/app/models/reports/ORMPayrollCategories';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { PromptResponseEnum, ServiceResponseStatusEnum, ProcedureSearchType, PatientSubTabsEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ProcedureSearchCriteria } from 'src/app/general-modules/inline-procedure-search/proc-search-criteria';
import { InlineProcedureSearchComponent } from 'src/app/general-modules/inline-procedure-search/inline-procedure-search.component';
import { ORMPayrollCategoryProcedures } from 'src/app/models/reports/ORMPayrollCategoryProcedures';
import { ORMProviderPayrollCategories } from 'src/app/models/reports/ORMProviderPayrollCategories';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'rpt-provider-payroll',
  templateUrl: './rpt-provider-payroll.component.html',
  styleUrls: ['./rpt-provider-payroll.component.css']
})
export class RptProviderPayrollComponent implements OnInit {
  @ViewChild('txtProcSearch') txtProcSearch: ElementRef;
  @ViewChild('chkProcedureSearchAll') chkProcedureSearchAll: ElementRef;
  @ViewChild('inlineClaimProcSearch') inlineClaimProcSearch: InlineProcedureSearchComponent;

  pat_count_cat: number = 0;
  proc_count_cat: number = 0;
  visit_count_cat: number = 0;
  proc_charges_cat: number = 0;
  proc_payment_cat: number = 0;
  pat_count_total: number = 0;
  proc_count_total: number = 0;
  visit_count_totalt: number = 0;
  proc_charges_total: number = 0;
  proc_payment_total: number = 0;

  pat_count_Nettotal: number = 0;
  proc_count_Nettotal: number = 0;
  visit_count_Nettotalt: number = 0;
  proc_charges_Nettotal: number = 0;
  proc_payment_Nettotal: number = 0;

  providerpayrollForm: FormGroup;
  frmCategories: FormGroup;
  frmProcedures: FormGroup;

  lstPayRollReport;
  acPayRoll = [];

  lstPayrollCategories: Array<any>;
  lstCategoryProcedures: Array<any>;
  lstCategoryProviders: Array<any>;
  selectedCategoryID;
  selectedProceduresID;
  selectedProvidersID;
  strCategoryOperation = "ADD";
  editCategoriesRow: any;

  isAddEditCategories: Boolean = false;
  isAddEditProcedures: Boolean = false;
  isEditProviders: Boolean = false;

  procedureSearchCriteria: ProcedureSearchCriteria;
  showProcSearch: boolean = false;
  lstProviderPayrollProcedure: Array<any>;
  selectedDOSYYYYMMDD: string;

  showDetails = "main";
  procedureDetailTitle = "";
  acPayRollVisits: Array<any>;
  acPayRollCharges: Array<any>;
  acPayRollPayment: Array<any>;
  totalProcedurePayments: number = 0;
  totalProcedureCharges: number = 0;

  SearchProviderID;
  SearchLocationID;
  SearchYearMonth;
  SearchIsEnrolled;
  SearchIncludeACA;
  acProcedureSave: Array<any>;
  acProviderSave: Array<any>;

  dataOption = "";
  showReport = "";
  title = "";
  radioForm: FormGroup;
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private reportsService: ReportsService,
    private dateTimeUtil: DateTimeUtil,
    private logMessage: LogMessage,
    private openModuleService: OpenModuleService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) { }

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  ngOnInit() {
    this.buildForm();
    this.getPayrollCategories();
    this.onRadioOptionChange("provider payroll report");
  }
  ngAfterViewInit(){
    debugger;
    let month = this.dateTimeUtil.getCurrentDateTimeDate();
    let fmonth;
    if(Number(month.getMonth())+Number(1) < 10)
      fmonth = "0"+ month.getMonth();
    else
      fmonth = Number(month.getMonth()) + Number(1);

    (this.providerpayrollForm.get("cmbMonthsdaywise") as FormControl).setValue(fmonth.toString());
  }
  buildForm() {
    this.providerpayrollForm = this.formBuilder.group({
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'null':this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'null':this.lookupList.logedInUser.defaultLocation),
      chkbox_Enrolled: this.formBuilder.control(null),
      cmbMonthsdaywise: this.formBuilder.control(null),
      txtYeardaywise: this.formBuilder.control(this.dateTimeUtil.getDateTimeFormatedString(this.dateTimeUtil.getCurrentDateTimeDate(),DateTimeFormat.DATEFORMAT_YYYY)),
      chkbox_aca: this.formBuilder.control(null)
    })
    this.frmCategories = this.formBuilder.group({
      txt_categoryName: this.formBuilder.control(null)
    })
    this.frmProcedures = this.formBuilder.group({
      txt_procedureCode: this.formBuilder.control(null)
    })
    this.radioForm = this.formBuilder.group({
      radioOption: this.formBuilder.control('payroll'),
    }
    );
  }
  getPayrollCategories() {
    this.reportsService.GetPayrollCategories(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        lstPayrollCategories: new Array();
        this.lstPayrollCategories = data as Array<any>;
        if (this.lstPayrollCategories.length > 0)
          this.categorychange(this.lstPayrollCategories[0]);
      },
      error => {
        return;
      }
    );
  }
  categorychange(value) {
    this.selectedCategoryID = value.category_id;
    if (this.selectedCategoryID != "") {
      this.getPayRollCategoryProviders(this.selectedCategoryID);
      this.getPayRollCategoryProcedures(this.selectedCategoryID);
    }
  }
  ProceduresChange(value) {
    this.selectedProceduresID = value.category_procedure_id;

  }
  providerschange(value) {
    this.selectedProvidersID = value.provider_id;
  }
  getPayRollCategoryProviders(category_id) {
    this.reportsService.getPayRollCategoryProviders(category_id, this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        lstCategoryProviders: new Array();
        this.lstCategoryProviders = data as Array<any>;
        if (this.lstCategoryProviders.length > 0)
          this.providerschange(this.lstCategoryProviders[0]);
      },
      error => {
        return;
      }
    );
  }
  getPayRollCategoryProcedures(category_id) {
    this.reportsService.getPayRollCategoryProcedures(category_id).subscribe(
      data => {
        lstCategoryProcedures: new Array();
        this.lstCategoryProcedures = data as Array<any>;
        if (this.lstCategoryProcedures.length > 0)
          this.ProceduresChange(this.lstCategoryProcedures[0]);
      },
      error => {
        return;
      }
    );
  }

  searchPayRoll() {
    if (this.validate()) {

      let payRollSearch: SearchCriteria = new SearchCriteria();
      payRollSearch.practice_id = this.lookupList.practiceInfo.practiceId;
      payRollSearch.param_list = [];

      payRollSearch.param_list.push({ name: "cmbProvider", value: (this.providerpayrollForm.get('cmbProvider') as FormControl).value, option: "" });
      payRollSearch.param_list.push({ name: "chkbox_Enrolled", value: (this.providerpayrollForm.get('chkbox_Enrolled') as FormControl).value, option: "" });

      payRollSearch.param_list.push({ name: "cmbLocation", value: (this.providerpayrollForm.get('cmbLocation') as FormControl).value, option: "" });
      payRollSearch.param_list.push({ name: "cmbMonthsdaywise", value: (this.providerpayrollForm.get('txtYeardaywise') as FormControl).value + (this.providerpayrollForm.get('cmbMonthsdaywise') as FormControl).value, option: "" });
      payRollSearch.param_list.push({ name: "chkbox_aca", value: (this.providerpayrollForm.get('chkbox_aca') as FormControl).value, option: "" });

      this.SearchProviderID = (this.providerpayrollForm.get('cmbProvider') as FormControl).value;
      this.SearchLocationID = (this.providerpayrollForm.get('cmbLocation') as FormControl).value;
      this.SearchYearMonth = (this.providerpayrollForm.get('txtYeardaywise') as FormControl).value + (this.providerpayrollForm.get('cmbMonthsdaywise') as FormControl).value;
      this.SearchIsEnrolled = (this.providerpayrollForm.get('chkbox_Enrolled') as FormControl).value;
      this.SearchIncludeACA = (this.providerpayrollForm.get('chkbox_aca') as FormControl).value;


      this.reportsService.searchPayRoll(payRollSearch).subscribe(
        data => {

          this.lstPayRollReport = data;// as Array<any>;
          let objPayRoll: ORMpayrollObj = new ORMpayrollObj();
          let categoryType = "";
          let s_no = 0;
          let s_noChanged = "";
          this.pat_count_total = 0;
          this.proc_count_total = 0;
          this.visit_count_totalt = 0;
          this.proc_charges_total = 0;
          this.proc_payment_total = 0;


          this.pat_count_Nettotal = 0;
          this.proc_count_Nettotal = 0;
          this.visit_count_Nettotalt = 0;
          this.proc_charges_Nettotal = 0;
          this.proc_payment_Nettotal = 0;

          //if(this.acPayRoll==undefined){
          this.acPayRoll = [];
          //}
          if (this.lstPayRollReport != null && this.lstPayRollReport.length > 0) {
            categoryType = this.lstPayRollReport[0].category_name;
            for (let i = 0; i < this.lstPayRollReport.length; i++) {
              if (this.lstPayRollReport[i].category_name.toLowerCase() == categoryType.toLowerCase()) {

                //for rows
                objPayRoll = new ORMpayrollObj();
                objPayRoll.s_no = "";
                objPayRoll.cat_sub_sno = "";
                objPayRoll.provider_name = "";
                //if(s_noChanged == "changed" || s_noChanged=="" || s_noChanged==undefined){
                objPayRoll.category_name = "";
                //}
                objPayRoll.proc_code = "";
                objPayRoll.proc_description = "";
                objPayRoll.patient_count = 0;
                objPayRoll.visit_count = 0;
                objPayRoll.proc_count = 0;
                objPayRoll.proc_charges = "";
                objPayRoll.proc_payment = "";
                objPayRoll.is_aggregate = false;

                objPayRoll.s_no = s_no.toString();
                objPayRoll.cat_sub_sno = i.toString();
                objPayRoll.provider_name = this.lstPayRollReport[i].provider_name;
                if (s_noChanged == "changed" || s_noChanged == "" || s_noChanged == undefined) {
                  s_no = s_no + 1;
                  objPayRoll.category_name = " (" + s_no + ")   " + this.lstPayRollReport[i].category_name;
                } else {
                  objPayRoll.category_name = "";
                }
                objPayRoll.proc_code = this.lstPayRollReport[i].proc_code;
                objPayRoll.proc_description = this.lstPayRollReport[i].proc_description;
                objPayRoll.patient_count = this.lstPayRollReport[i].patient_count;
                objPayRoll.visit_count = this.lstPayRollReport[i].visit_count;
                objPayRoll.proc_count = this.lstPayRollReport[i].proc_count;
                objPayRoll.proc_charges = "$" + this.lstPayRollReport[i].proc_charges;//.toFixed(2);
                objPayRoll.proc_payment = "$" + this.lstPayRollReport[i].proc_payment;//.toFixed(2);
                objPayRoll.is_aggregate = false;

                this.acPayRoll.push(objPayRoll);


                // Assign to Totals
                this.pat_count_total = (Number(this.pat_count_total) + Number(this.lstPayRollReport[i].patient_count));
                this.proc_count_total = (Number(this.proc_count_total) + Number(this.lstPayRollReport[i].proc_count));
                this.visit_count_totalt = (Number(this.visit_count_totalt) + Number(this.lstPayRollReport[i].visit_count));
                this.proc_charges_total = (Number(this.proc_charges_total) + Number(this.lstPayRollReport[i].proc_charges));
                this.proc_payment_total = (Number(this.proc_payment_total) + Number(this.lstPayRollReport[i].proc_payment));


                //Assign to Net Total
                this.pat_count_Nettotal = (Number(this.pat_count_Nettotal) + Number(this.lstPayRollReport[i].patient_count));
                this.proc_count_Nettotal = (Number(this.proc_count_Nettotal) + Number(this.lstPayRollReport[i].proc_count));
                this.visit_count_Nettotalt = (Number(this.visit_count_Nettotalt) + Number(this.lstPayRollReport[i].visit_count));
                this.proc_charges_Nettotal = (Number(this.proc_charges_Nettotal) + Number(this.lstPayRollReport[i].proc_charges));
                this.proc_payment_Nettotal = (Number(this.proc_payment_Nettotal) + Number(this.lstPayRollReport[i].proc_payment));





                debugger;
                if (i == this.lstPayRollReport.length - 1) {
                  //for Net total Row
                  objPayRoll = new ORMpayrollObj();
                  objPayRoll.s_no = "";
                  objPayRoll.cat_sub_sno = "";
                  objPayRoll.provider_name = "";
                  objPayRoll.category_name = "";
                  objPayRoll.proc_code = "";
                  objPayRoll.proc_description = "TOTAL";
                  objPayRoll.patient_count = this.pat_count_total;
                  objPayRoll.visit_count = this.visit_count_totalt;
                  objPayRoll.proc_count = this.proc_count_total;
                  objPayRoll.proc_charges = "$" + this.proc_charges_total.toFixed(2);
                  objPayRoll.proc_payment = "$" + this.proc_payment_total.toFixed(2);
                  objPayRoll.is_aggregate = true;
                  this.acPayRoll.push(objPayRoll);



                  //Empty Row
                  objPayRoll = new ORMpayrollObj();
                  objPayRoll.s_no = "";
                  objPayRoll.cat_sub_sno = "";
                  objPayRoll.provider_name = "";
                  objPayRoll.category_name = "";
                  objPayRoll.proc_code = "";
                  objPayRoll.proc_description = "EMPTY";
                  objPayRoll.patient_count = 0;
                  objPayRoll.visit_count = 0;
                  objPayRoll.proc_count = 0;
                  objPayRoll.proc_charges = "";
                  objPayRoll.proc_payment = "";
                  objPayRoll.is_aggregate = false;
                  this.acPayRoll.push(objPayRoll);

                  //for total Row
                  objPayRoll = new ORMpayrollObj();
                  objPayRoll.s_no = "";
                  objPayRoll.cat_sub_sno = "";
                  objPayRoll.provider_name = "";
                  objPayRoll.category_name = "";
                  objPayRoll.proc_code = "";
                  objPayRoll.proc_description = "NET TOTAL";
                  objPayRoll.patient_count = this.pat_count_Nettotal;
                  objPayRoll.visit_count = this.visit_count_Nettotalt;
                  objPayRoll.proc_count = this.proc_count_Nettotal;
                  objPayRoll.proc_charges = "$" + this.proc_charges_Nettotal.toFixed(2);
                  objPayRoll.proc_payment = "$" + this.proc_payment_Nettotal.toFixed(2);
                  objPayRoll.is_aggregate = true;
                  this.acPayRoll.push(objPayRoll);



                  this.pat_count_Nettotal = 0;
                  this.proc_count_Nettotal = 0;
                  this.visit_count_Nettotalt = 0;
                  this.proc_charges_Nettotal = 0;
                  this.proc_payment_Nettotal = 0;
                } else {
                  categoryType = this.lstPayRollReport[i + 1].category_name;
                  if (this.lstPayRollReport[i].category_name.toLowerCase() == categoryType.toLowerCase()) {
                    s_noChanged = "notchanged";
                  } else {
                    //for total Row
                    objPayRoll = new ORMpayrollObj();
                    objPayRoll.s_no = "";
                    objPayRoll.cat_sub_sno = "";
                    objPayRoll.provider_name = "";
                    objPayRoll.category_name = "";
                    objPayRoll.proc_code = "";
                    objPayRoll.proc_description = "TOTAL";
                    objPayRoll.patient_count = this.pat_count_total;
                    objPayRoll.visit_count = this.visit_count_totalt;
                    objPayRoll.proc_count = this.proc_count_total;
                    objPayRoll.proc_charges = "$" + this.proc_charges_total.toFixed(2);
                    objPayRoll.proc_payment = "$" + this.proc_payment_total.toFixed(2);
                    objPayRoll.is_aggregate = true;
                    this.acPayRoll.push(objPayRoll);



                    //Empty Row
                    objPayRoll = new ORMpayrollObj();
                    objPayRoll.s_no = "";
                    objPayRoll.cat_sub_sno = "";
                    objPayRoll.provider_name = "";
                    objPayRoll.category_name = "";
                    objPayRoll.proc_code = "";
                    objPayRoll.proc_description = "EMPTY";
                    objPayRoll.patient_count = 0;
                    objPayRoll.visit_count = 0;
                    objPayRoll.proc_count = 0;
                    objPayRoll.proc_charges = "";
                    objPayRoll.proc_payment = "";
                    objPayRoll.is_aggregate = false;
                    this.acPayRoll.push(objPayRoll);



                    s_noChanged = "changed";

                    this.pat_count_total = 0;
                    this.proc_count_total = 0;
                    this.visit_count_totalt = 0;
                    this.proc_charges_total = 0;
                    this.proc_payment_total = 0;

                    //categoryType = this.lstPayRollReport[i].category_name;
                  }
                }





              }//if cat end




              // if (i == this.lstPayRollReport.length-1) {

              // }
            }//for end

          }


          // ********************************

          // if(this.lstPayRollReport!=null && this.lstPayRollReport.length>0){
          // let s_no = 1;
          // this.pat_count_cat=0;
          // this.proc_count_cat=0;
          // this.visit_count_cat=0;
          // this.proc_charges_cat=0;
          // this.proc_payment_cat=0;	

          // this.pat_count_total=0;
          // this.proc_count_total=0;
          // this.visit_count_totalt=0;
          // this.proc_charges_total=0;
          // this.proc_payment_total=0;

          // if (this.acPayRoll == undefined)
          //   this.acPayRoll = [];

          // for(let i=0;i<this.lstPayRollReport.length;i++){
          //   if(this.lstPayRollReport[i].cat_sub_sno == "1"){
          //     if( i > 0 ){
          //       objPayRoll = new ORMpayrollObj();
          //       objPayRoll.s_no = "";
          //       objPayRoll.cat_sub_sno = "";
          //       objPayRoll.provider_name = "";
          //       objPayRoll.category_name = "";
          //       objPayRoll.proc_code = "";
          //       objPayRoll.proc_description = "TOTAL";
          //       objPayRoll.patient_count = this.pat_count_cat;
          //       objPayRoll.visit_count = this.visit_count_cat;
          //       objPayRoll.proc_count = this.proc_count_cat;
          //       objPayRoll.proc_charges = "$"+this.proc_charges_cat.toFixed(2);
          //       objPayRoll.proc_payment = "$"+this.proc_payment_cat.toFixed(2);
          //       objPayRoll.is_aggregate = true;
          //       this.acPayRoll.addItemAt(objPayRoll,i);

          //       i++

          //       objPayRoll = new ORMpayrollObj();
          //       objPayRoll.s_no="";
          //       objPayRoll.cat_sub_sno="";							
          //       objPayRoll.provider_name="";							
          //       objPayRoll.category_name="";							
          //       objPayRoll.proc_code="";
          //       objPayRoll.proc_description="";
          //       objPayRoll.patient_count=0;
          //       objPayRoll.visit_count=0;
          //       objPayRoll.proc_count=0;
          //       objPayRoll.proc_charges="";
          //       objPayRoll.proc_payment="";
          //       objPayRoll.is_aggregate=false;
          //       this.acPayRoll.addItemAt(objPayRoll,i);


          //       // Assign to Net Totals
          //         this.pat_count_total += this.pat_count_cat;
          //         this.proc_count_total += this.proc_count_cat;
          //         this.visit_count_totalt += this.visit_count_cat;
          //         this.proc_charges_total += this.proc_charges_cat;
          //         this.proc_payment_total += this.proc_payment_cat;

          //         // Clear for Next Category
          //         this.pat_count_cat = 0;
          //         this.proc_count_cat = 0;
          //         this.visit_count_cat = 0;
          //         this.proc_charges_cat = 0;
          //         this.proc_payment_cat = 0;

          //         // Move to Next Index
          //         i++
          //     }
          //     objPayRoll = new ORMpayrollObj();
          // 		objPayRoll.s_no=s_no.toString();
          // 		objPayRoll.cat_sub_sno=i.toString();							
          // 		objPayRoll.provider_name=this.lstPayRollReport[i].provider_name;							
          // 		objPayRoll.category_name=" ("+s_no+")   "+this.lstPayRollReport[i].category_name;							
          // 		objPayRoll.proc_code="";
          // 		objPayRoll.proc_description="";
          // 		objPayRoll.patient_count=0;
          // 		objPayRoll.visit_count=0;
          // 		objPayRoll.proc_count=0;
          // 		objPayRoll.proc_charges="";
          // 		objPayRoll.proc_payment="";
          // 		objPayRoll.is_aggregate=false;
          // 		this.acPayRoll.addItemAt(objPayRoll,i);


          //     i++;	

          // 		// Summ Up Category Totals
          // 		this.pat_count_cat+=Number(this.acPayRoll[i].patient_count);
          // 		this.proc_count_cat+=Number(this.acPayRoll[i].proc_count);
          // 		this.visit_count_cat+=Number(this.acPayRoll[i].visit_count);
          // 		this.proc_charges_cat+= Number(this.acPayRoll[i].proc_charges);
          // 		this.proc_payment_cat+=Number(this.acPayRoll[i].proc_payment)


          // 		this.acPayRoll[i].s_no="";
          // 		this.acPayRoll[i].cat_sub_sno="";
          // 		this.acPayRoll[i].provider_name="";
          // 		this.acPayRoll[i].category_name="";
          // 		this.acPayRoll[i].proc_charges="$"+this.acPayRoll[i].proc_charges;
          // 		this.acPayRoll[i].proc_payment="$"+this.acPayRoll[i].proc_payment;


          //     s_no++;


          //   }//if(this.lstPayRollReport[i].cat_sub_sno == "1"){ end

          //   else
          // 	{
          // 		// Summ Up Category Totals
          // 		this.pat_count_cat+=Number(this.acPayRoll[i].patient_count);
          // 		this.proc_count_cat+=Number(this.acPayRoll[i].proc_count);
          // 		this.visit_count_cat+=Number(this.acPayRoll[i].visit_count);
          // 		this.proc_charges_cat+= Number(this.acPayRoll[i].proc_charges);
          // 		this.proc_payment_cat+=Number(this.acPayRoll[i].proc_payment)


          // 		this.acPayRoll[i].s_no="";
          // 		this.acPayRoll[i].cat_sub_sno="";
          // 		this.acPayRoll[i].provider_name="";
          // 		this.acPayRoll[i].category_name="";


          // 		this.acPayRoll[i].proc_charges="$"+this.acPayRoll[i].proc_charges;
          // 		this.acPayRoll[i].proc_payment="$"+this.acPayRoll[i].proc_payment;
          // 	}


          // }//for end




          // }//this.lstPayRollReport!=null
        },
        error => alert(error),
        () => this.logMessage.log("Save Provider PayRoll.")
      );
    }
  }
  validate(): Boolean {

    if ((this.providerpayrollForm.get('cmbProvider') as FormControl).value == '' ||
      (this.providerpayrollForm.get('cmbProvider') as FormControl).value == undefined) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Provider selection', "Please select Provider.", AlertTypeEnum.WARNING);
      return false;
    }
    if ((this.providerpayrollForm.get('cmbMonthsdaywise') as FormControl).value <= 0) {
      GeneralOperation.showAlertPopUp(this.modalService, 'Month selection', "Pleae select Month.", AlertTypeEnum.WARNING);
      return false;
    }
    if ((this.providerpayrollForm.get('txtYeardaywise') as FormControl).value == "" ||
      (this.providerpayrollForm.get('txtYeardaywise') as FormControl).value == null ||
      (this.providerpayrollForm.get('txtYeardaywise') as FormControl).value.length != 4) {
        GeneralOperation.showAlertPopUp(this.modalService, 'Year selection', "Please enter 4 digit year.", AlertTypeEnum.WARNING);
        return false;
    }
    return true;
  }
  addNewCategories() {
    // isAddEditCategories:Boolean = false;
    // isAddEditProcedures:Boolean = false;
    this.isAddEditCategories = true;
  }
  cancelCategories() {
    this.isAddEditCategories = false;
    this.getPayrollCategories();
    (this.frmCategories.get("txt_categoryName") as FormControl).setValue("");
    this.strCategoryOperation = "ADD";
  }
  editCategory(val) {
    this.editCategoriesRow = val;
    this.isAddEditCategories = true;
    (this.frmCategories.get("txt_categoryName") as FormControl).setValue(val.category_name);
    this.strCategoryOperation = "EDIT";
  }
  saveCategories() {
    if ((this.frmCategories.get('txt_categoryName') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.modalService, 'Category Name', "Please enter Category Name.", AlertTypeEnum.WARNING);
      return;
    }
    let ormCatSave: ORMPayrollCategories = new ORMPayrollCategories();
    ormCatSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    ormCatSave.modified_user = this.lookupList.logedInUser.user_name;
    ormCatSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    ormCatSave.system_ip = this.lookupList.logedInUser.systemIp;
    ormCatSave.category_name = (this.frmCategories.get('txt_categoryName') as FormControl).value;
    if (this.strCategoryOperation == "ADD") {
      ormCatSave.category_id = "";
      ormCatSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      ormCatSave.created_user = this.lookupList.logedInUser.user_name;
    }
    else if (this.strCategoryOperation == "EDIT") {
      ormCatSave.category_id = this.editCategoriesRow.category_id;
      ormCatSave.client_date_created = this.editCategoriesRow.client_date_created;
      ormCatSave.created_user = this.editCategoriesRow.created_user;
      ormCatSave.date_created = this.editCategoriesRow.date_created;
    }
    this.reportsService.saveupdateCategories(ormCatSave)
      .subscribe(
        data => this.savedSuccessfull(),
        error => alert(error),
        () => this.logMessage.log("Save letter header.")
      );

  }
  savedSuccessfull() {
    this.cancelCategories();
  }
  deleteSeletedCategory(val) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected record ?';
    let closeResult;
    modalRef.result.then((result) => {
      if (result == PromptResponseEnum.OK) {
        debugger;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = val.category_id.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
        this.reportsService.deleteSeletedCategory(deleteRecordData)
          .subscribe(
            data => this.onDeleteSelectedCategory(data),
            error => alert(error),
            () => this.logMessage.log("Selected Header Deleted Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }

  onDeleteSelectedCategory(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Category";
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      this.getPayrollCategories();
    }
  }


  addNewProcedures() {
    this.isAddEditProcedures = true;
  }
  cancelProcedures() {
    this.isAddEditProcedures = false;
    if (this.lstPayrollCategories.length > 0)
      this.categorychange(this.lstPayrollCategories[0]);
  }
  saveProcedures() {
    debugger;
    if (this.lstCategoryProcedures != null && this.lstCategoryProcedures.length > 0) {
      for (let i = 0; i < this.lstCategoryProcedures.length; i++) {
        if (this.lstCategoryProcedures[i].category_procedure_id == null || this.lstCategoryProcedures[i].category_procedure_id == "") {
          let ormProcSave: ORMPayrollCategoryProcedures = new ORMPayrollCategoryProcedures();
          ormProcSave.category_id = this.selectedCategoryID;
          ormProcSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
          ormProcSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
          ormProcSave.created_user = this.lookupList.logedInUser.user_name;
          ormProcSave.modified_user = this.lookupList.logedInUser.user_name;
          ormProcSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
          ormProcSave.system_ip = this.lookupList.logedInUser.systemIp;
          ormProcSave.proc_code = this.lstCategoryProcedures[i].proc_code;
          ormProcSave.proc_description = this.lstCategoryProcedures[i].proc_description;

          if (this.acProcedureSave == undefined)
            this.acProcedureSave = new Array<any>();

          this.acProcedureSave.push(ormProcSave);
        }
      }
      if (this.acProcedureSave != null && this.acProcedureSave.length > 0) {
        this.reportsService.SavePayRollCategoryProcedures(this.acProcedureSave)
          .subscribe(
            data => this.savedProceduresSuccessfull(),
            error => alert(error),
            () => this.logMessage.log("Save PayRoll Category Procedures.")
          );
      }
      else {
        GeneralOperation.showAlertPopUp(this.modalService, 'Procedure Selection', "No new procedure is entered to Save.", AlertTypeEnum.WARNING);
        return;
      }
    }
  }
  savedProceduresSuccessfull() {
    this.isAddEditProcedures = false;
  }
  editProviders() {
    this.isEditProviders = true;
  }
  cancelProviders() {
    this.isEditProviders = false;
    if (this.lstPayrollCategories.length > 0)
      this.categorychange(this.lstPayrollCategories[0]);
  }
  saveProviders() {
    debugger;
    if (this.lstCategoryProviders != null && this.lstCategoryProviders.length > 0) {
      for (var i = 0; i < this.lstCategoryProviders.length; i++) {
        if (this.lstCategoryProviders[i].chk == true || (this.lstCategoryProviders[i].provider_category_id != null && this.lstCategoryProviders[i].provider_category_id != "")) {
          let ormProvSave: ORMProviderPayrollCategories = new ORMProviderPayrollCategories();
          ormProvSave.provider_id = this.lstCategoryProviders[i].provider_id;
          ormProvSave.category_id = this.selectedCategoryID;

          if (this.lstCategoryProviders[i].provider_category_id != null && this.lstCategoryProviders[i].provider_category_id != "") {
            ormProvSave.provider_category_id = this.lstCategoryProviders[i].provider_category_id;
            ormProvSave.client_date_created = this.lstCategoryProviders[i].client_date_created;
            ormProvSave.date_created = this.lstCategoryProviders[i].date_created;
            ormProvSave.created_user = this.lstCategoryProviders[i].created_user;
          }
          else {
            ormProvSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
            ormProvSave.date_created = this.dateTimeUtil.getCurrentDateTimeString();
            ormProvSave.created_user = this.lookupList.logedInUser.user_name;
          }

          ormProvSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
          ormProvSave.modified_user = this.lookupList.logedInUser.user_name;
          ormProvSave.practice_id = this.lookupList.practiceInfo.practiceId.toString();
          ormProvSave.system_ip = this.lookupList.logedInUser.systemIp;

          ormProvSave.deleted = !this.lstCategoryProviders[i].chk;

          if (this.acProviderSave == undefined)
            this.acProviderSave = new Array<any>();

          this.acProviderSave.push(ormProvSave);
        }
      }
      if (this.acProviderSave != null && this.acProviderSave.length > 0) {
        this.reportsService.SavePayRollCategoryProviders(this.acProviderSave)
          .subscribe(
            data => this.savedProvidersSuccessfull(),
            error => alert(error),
            () => this.logMessage.log("Save provider.")
          );
      } else {
        GeneralOperation.showAlertPopUp(this.modalService, 'Provider Selection', "No new provider is selected to Save.", AlertTypeEnum.WARNING);
        return false;
      }
    } else {
      GeneralOperation.showAlertPopUp(this.modalService, 'Provider Selection', "There is no Provider to Save.", AlertTypeEnum.WARNING);
      return;
    }
  }
  savedProvidersSuccessfull() {
    this.isEditProviders = false;
  }
  /******* Procedure Search ******* */
  onchkProcedureChanged() {
    if (this.showProcSearch == true) {
      this.searchProcedure((this.frmProcedures.get('txtProcedure') as FormControl).value);
    }
  }
  onProcedureSearhBlur(event: any) {
    if (this.showProcSearch == false) {
      event.currentTarget.value = "";
    }
  }

  onProcedureSearcInputChange(event: any) {
    this.logMessage.log("onProcedureSearcInputChange");
    this.searchProcedure(event.currentTarget.value);
  }

  searchProcedure(searchVal: string) {
    debugger;
    if (searchVal.length >= 3) {


      this.procedureSearchCriteria = new ProcedureSearchCriteria();
      this.procedureSearchCriteria.criteria = searchVal;

      // if (!this.chkProcedureSearchAll.nativeElement.checked) {
      this.procedureSearchCriteria.searchType = ProcedureSearchType.ALL;
      // }
      // else {
      //   this.procedureSearchCriteria.searchType = ProcedureSearchType.SUPER_BILL;
      // }
      this.showProcSearch = true;
    }
    else {
      this.showProcSearch = false;
    }
  }

  closeProcedureSearch() {
    this.showProcSearch = false;
    //this.txtProcSearch.nativeElement.value = "";
    //this.txtProcSearch.nativeElement.focus();
  }

  addProcedureFromSearch(proc: any) {
    debugger;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "proc_code", value: proc.code, option: "" }
    ];
    this.reportsService.CheckIfCPTExists(searchCriteria).subscribe(
      data => {
        if (data == "1" || data == 1) {
          GeneralOperation.showAlertPopUp(this.modalService, 'CPT Selection', "Selected CPT is already inlcuded in an other Category.", AlertTypeEnum.WARNING);
          this.showProcSearch = false;
          return false;
        } else {
          if (this.lstCategoryProcedures == undefined)
            this.lstCategoryProcedures = new Array();

          this.lstCategoryProcedures.push({ proc_code: proc.code, proc_description: proc.description });
          this.showProcSearch = false;
        }
        (this.frmProcedures.get("txt_procedureCode") as FormControl).setValue("");
      },
      error => {
        return;
      }
    );
    // if(this.CheckIfCPTExists(proc.code)){

    // }


    // if (this.lstCategoryProcedures == undefined)
    //   this.lstCategoryProcedures = new Array();

    // this.lstCategoryProcedures.push({ proc_code: proc.code, proc_description: proc.description });

    // this.showProcSearch = false;

  }
  /******* END Procedure Search  ******* */

  payRollSettings() {
    this.showDetails = "settings";
  }
  onBackToPayrollReport() {
    this.showDetails = "main";
  }
  onShowDetail(value) {
    debugger;
    this.showDetails = "details";
    this.procedureDetailTitle = "Procedure : " + value.proc_description;
    this.acPayRollVisits = new Array();
    this.acPayRollCharges = new Array();
    this.acPayRollPayment = new Array();


    this.totalProcedurePayments = 0;
    this.totalProcedureCharges = 0;

    this.getProviderPayrollVisits(value);
    this.getProviderPayrollCharges(value);
    this.getProviderPayrollPayments(value);
  }

  getProviderPayrollVisits(value) {
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "SearchProviderID", value: this.SearchProviderID, option: "" },
      { name: "SearchLocationID", value: this.SearchLocationID, option: "" },
      { name: "SearchYearMonth", value: this.SearchYearMonth, option: "" },
      { name: "proc_code", value: value.proc_code, option: "" },
      { name: "SearchIsEnrolled", value: this.SearchIsEnrolled, option: "" }
    ];
    this.reportsService.getProviderPayrollVisits(searchCriteria).subscribe(
      data => {
        debugger;
        this.acPayRollVisits = data as Array<any>;
      },
      error => {
        this.getProviderPayrollVisitsError(error);
        return;
      }
    );
  }
  getProviderPayrollVisitsError(error) {
    this.logMessage.log("getProviderPayrollVisits Error." + error);
  }
  getProviderPayrollCharges(value) {
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "SearchProviderID", value: this.SearchProviderID, option: "" },
      { name: "SearchLocationID", value: this.SearchLocationID, option: "" },
      { name: "SearchYearMonth", value: this.SearchYearMonth, option: "" },
      { name: "proc_code", value: value.proc_code, option: "" },
      { name: "SearchIsEnrolled", value: this.SearchIsEnrolled, option: "" }
    ];

    this.reportsService.getProviderPayrollCharges(searchCriteria).subscribe(
      data => {
        debugger;
        this.acPayRollCharges = data as Array<any>;
      },
      error => {
        this.getProviderPayrollChargesError(error);
        return;
      }
    );
  }
  getProviderPayrollChargesError(error) {
    this.logMessage.log("getProviderPayrollCharges Error." + error);
  }

  getProviderPayrollPayments(value) {
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "SearchProviderID", value: this.SearchProviderID, option: "" },
      { name: "SearchLocationID", value: this.SearchLocationID, option: "" },
      { name: "SearchYearMonth", value: this.SearchYearMonth, option: "" },
      { name: "proc_code", value: value.proc_code, option: "" },
      { name: "SearchIncludeACA", value: this.SearchIncludeACA, option: "" },
      { name: "SearchIsEnrolled", value: this.SearchIsEnrolled, option: "" }
    ];
    this.reportsService.getProviderPayrollPayments(searchCriteria).subscribe(
      data => {
        debugger;
        this.acPayRollPayment = data as Array<any>;
      },
      error => {
        this.getProviderPayrollPaymentsError(error);
        return;
      }
    );
  }
  getProviderPayrollPaymentsError(error) {
    this.logMessage.log("getProviderPayrollPayments Error." + error);
  }
  deleteSeletedProcedures(value, index) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected Procedure?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        debugger;
        if (value.category_procedure_id == null || value.category_procedure_id == "" || value.category_procedure_id == undefined) {
          this.lstCategoryProcedures.splice(index, 1);
        } else {
          let deleteRecordData = new ORMDeleteRecord();
          deleteRecordData.column_id = value.detail_id.toString();
          deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
          deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
          deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
          this.reportsService.deleteSeletedProcedures(deleteRecordData)
            .subscribe(
              data => this.onDeleteSuccessfully(data),
              error => alert(error),
              () => this.logMessage.log("PayRoll Procedures Deleted Successfull.")
            );
        }
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {
    if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Rpt PayRoll Procedures."
      modalRef.componentInstance.promptMessage = data.response;
      let closeResult;
      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      //this.getViewData();
    }
  }

  checkProviderChkBox(id, event) {
    debugger;
    for (var i = 0; i < this.lstCategoryProviders.length; i++) {
      if (event == true) {
        if (this.lstCategoryProviders[i].provider_id == id) {
          this.lstCategoryProviders[i].chk = true;
          return;
        }
      } else if (event == false) {
        this.lstCategoryProviders[i].chk = false;
        return;
      }
    }
  }
  openPatientSummary(patient) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }
  openClaim(claim) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = claim.patient_id;
    obj.patient_name = claim.pname;
    obj.child_module = PatientSubTabsEnum.CLAIM;
    obj.child_module_id = claim.claim_id;
    this.openModuleService.openPatient.emit(obj);
  }
  onRadioOptionChange(value) {
    debugger;
    switch (value.toLowerCase()) {
      case "provider payroll report":
        this.dataOption = "payroll";
        this.showReport = "payroll";
        this.title = "Provider Payroll Report";
        break;
      case "provider wise collection":
        this.dataOption = "providerwisecollection";
        this.showReport = "providerwisecollection";
        this.title = "Provider Wise Collection";
        break;

      default:
        break;
    }
  }
}