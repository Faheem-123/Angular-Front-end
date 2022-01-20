import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from './../../../providers/lookupList.module';
import { ReportsService } from '../../../services/reports.service';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ListFilterPipe } from '../../../shared/list-filter-pipe';
import { ORMAddResultRptCashRegister } from 'src/app/models/reports/ORMAddResultRptCashRegister';
import { GeneralOperation } from '../../../shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rpt-cash-register',
  templateUrl: './rpt-cash-register.component.html',
  styleUrls: ['./rpt-cash-register.component.css']
})
export class RptCashRegisterComponent implements OnInit {

  reportType = "user-payment";
  userPaymentReportForm: FormGroup;
  patientPaymentReportForm: FormGroup;
  collectPaymentReportForm: FormGroup;
  yearlyCollectionReportForm: FormGroup;

  rpt_title;

  lstUserPayment;
  lstPatientPayment;
  lstCollectPayment;
  generalReport = "";
  payMethod;
  //arrCashReg: [{"User":"","Cash":"","Check":"","CCard":"","MOrder":"","adjusted":"","Total":""}];
  arrCashReg = [];
  test = [];
  patTotal = [];
  lstCollectPaymentTotal = [];
  arrPrint;
  arrFilterdUser;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    private reportsService: ReportsService) { }

  ngOnInit() {
    this.rpt_title = "Cash Register Report";
    //this.buildFormUserPayment();
    this.generalReportChange("patient-payment");
  }
  buildFormUserPayment() {
    this.userPaymentReportForm = this.formBuilder.group({

      userPaymentDateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      userPaymentDateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      userCmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider == 0 ? 'null' : this.lookupList.logedInUser.defaultProvider),
      userCmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation == 0 ? 'null' : this.lookupList.logedInUser.defaultLocation),
      //userRdoType: this.formBuilder.control(null)
      rdoTypePatPay: this.formBuilder.control('all')
    })
  }
  buildFormPatientPayment() {
    this.patientPaymentReportForm = this.formBuilder.group({
      patPayDateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      patPayDateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      patPayDdlProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider == 0 ? 'null' : this.lookupList.logedInUser.defaultProvider),
      patPayDdlLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation == 0 ? 'null' : this.lookupList.logedInUser.defaultLocation),
      rdoTypePatPay: this.formBuilder.control('all')
    })
  }
  buildFormCollectionPayment() {
    this.collectPaymentReportForm = this.formBuilder.group({
      collPayDateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      collPayDateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      collPayDdlLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation == 0 ? 'null' : this.lookupList.logedInUser.defaultLocation),
      rdoTypePatPay: this.formBuilder.control('all')
    })
  }
  generalReportChange(value) {
    debugger;
    switch (value) {
      case 'user-payment':
        this.buildFormUserPayment();
        this.reportType = 'user-payment';
        this.rpt_title = "Cash Register Report";
        break;

      case 'patient-payment':
        this.buildFormPatientPayment();
        this.reportType = 'patient-payment';
        this.rpt_title = "Cash Register Report";
        break;

      case 'collect-payment':
        this.buildFormCollectionPayment();
        this.reportType = 'collect-payment';
        this.rpt_title = "Collect Payment Report";
        break;

      case 'yearly-payment':
        this.reportType = 'yearly-payment';
        this.rpt_title = "Yearly Collection Report";
        break;

      default:
        this.rpt_title = "Cash Register Report";
        break;
    }
    this.generalReport = "";
    this.generalReport = value;
  }
  searchUserPayment(values) {
    debugger;
    if (this.generalReport == "user-payment") {
      if ((this.userPaymentReportForm.get('userPaymentDateFrom') as FormControl).value == "") {
        GeneralOperation.showAlertPopUp(this.modalService, 'Date From Selection', "Please selected correct From date.", AlertTypeEnum.WARNING);
        return;
      }
      if ((this.userPaymentReportForm.get('userPaymentDateTo') as FormControl).value == "") {
        GeneralOperation.showAlertPopUp(this.modalService, 'Date To Selection', "Please selected correct To date.", AlertTypeEnum.WARNING);
        return;
      }


      if ((this.userPaymentReportForm.get('rdoTypePatPay') as FormControl).value == "all") {
        this.payMethod = "";
      } else if ((this.userPaymentReportForm.get('rdoTypePatPay') as FormControl).value == "cash") {
        this.payMethod = "CASH";
      } else if ((this.userPaymentReportForm.get('rdoTypePatPay') as FormControl).value == "credit") {
        this.payMethod = "CREDIT CARD";
      }
      let strCriteria: SearchCriteria = new SearchCriteria();
      strCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      strCriteria.param_list = [];

      let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(values.userPaymentDateFrom);
      let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(values.userPaymentDateTo);

      strCriteria.param_list.push({ name: "userPaymentDateFrom", value: vardateFrom, option: "" });
      strCriteria.param_list.push({ name: "userPaymentDateTo", value: vardateTo, option: "" });
      strCriteria.param_list.push({ name: "ddlUserLocation", value: (this.userPaymentReportForm.get('userCmbLocation') as FormControl).value == 'null' ? '' : (this.userPaymentReportForm.get('userCmbLocation') as FormControl).value, option: "" });
      strCriteria.param_list.push({ name: "ddlUserProvider", value: (this.userPaymentReportForm.get('userCmbProvider') as FormControl).value == 'null' ? '' : (this.userPaymentReportForm.get('userCmbProvider') as FormControl).value, option: "" });
      strCriteria.param_list.push({ name: "payMethod", value: this.payMethod, option: "" });


      this.reportsService.getCashPaymentDetails(strCriteria).subscribe(
        data => {
          debugger;
          this.lstUserPayment = null;
          this.test = [];
          this.arrCashReg = [];

          this.lstUserPayment = data;
          let disttinctLocation = new UniquePipe().transform(this.lstUserPayment, "created_user");
          for (var i = 0; i < disttinctLocation.length; i++) {
            this.arrFilterdUser = new ListFilterPipe().transform(this.lstUserPayment, "created_user", disttinctLocation[i].created_user.toString());
            let totalCash: number = 0.0;
            let totalCheck: number = 0.0;
            let totalCCard: number = 0.0;
            let totalMOrder: number = 0.0;
            let totalAdjusted: number = 0.0;
            let gTotal: number = 0.0;

            for (var j = 0; j < this.arrFilterdUser.length; j++) {
              totalAdjusted = totalAdjusted + Number(this.arrFilterdUser[j].adjusted.toString().replace("$", ""));
              switch (this.arrFilterdUser[j].payment_method.toString().toLowerCase()) {
                case "cash":
                  {
                    totalCash = totalCash + Number(this.arrFilterdUser[j].amount_paid.toString().replace("$", ""));
                    break;
                  }
                case "check":
                  {
                    totalCheck = totalCheck + Number(this.arrFilterdUser[j].amount_paid.toString().replace("$", ""));
                    break;
                  }
                case "credit card":
                  {
                    totalCCard = totalCCard + Number(this.arrFilterdUser[j].amount_paid.toString().replace("$", ""));
                    break;
                  }
                case "money order":
                  {
                    totalMOrder = totalMOrder + Number(this.arrFilterdUser[j].amount_paid.toString().replace("$", ""));
                    break;
                  }
              }

            }
            gTotal = totalCash + totalCheck + totalCCard + totalMOrder;
            let objProvCount: ORMAddResultRptCashRegister = new ORMAddResultRptCashRegister();
            objProvCount = new ORMAddResultRptCashRegister();

            objProvCount.User = disttinctLocation[i].created_user.toString();
            objProvCount.Cash = parseFloat(totalCash.toString()).toFixed(2);
            objProvCount.Check = parseFloat(totalCheck.toString()).toFixed(2);
            objProvCount.CCard = parseFloat(totalCCard.toString()).toFixed(2);
            objProvCount.MOrder = parseFloat(totalMOrder.toString()).toFixed(2);
            objProvCount.adjusted = parseFloat(totalAdjusted.toString()).toFixed(2);
            objProvCount.Total = parseFloat((gTotal).toString()).toFixed(2);
            this.arrCashReg.push(objProvCount);

          }
          let cash: number = 0;
          let check: number = 0;
          let credit: number = 0;

          let morder: number = 0;
          let gttotal: number = 0;
          let adjusted: number = 0;
          let strcash: String = "";
          let strcheck: String = "";
          let strcredit: String = "";
          let strmorder: String = "";
          let strgtotal: String = "";
          let stradjusted: String = "";

          for (var i = 0; i < this.arrCashReg.length; i++) {
            strcash = "";
            strcheck = "";
            strcredit = "";
            if (this.arrCashReg[i].Cash != null) {
              strcash = this.generalOperation.ReplaceAll(this.arrCashReg[i].Cash, '$', '');
              cash = cash + Number(strcash);
            }
            if (this.arrCashReg[i].Check != null) {
              strcheck = this.generalOperation.ReplaceAll(this.arrCashReg[i].Check, '$', '');
              check = check + Number(strcheck);
            }
            if (this.arrCashReg[i].CCard != null) {
              strcredit = this.generalOperation.ReplaceAll(this.arrCashReg[i].CCard, '$', '');
              credit = credit + Number(strcredit);
            }
            if (this.arrCashReg[i].MOrder != null) {
              strmorder = this.generalOperation.ReplaceAll(this.arrCashReg[i].MOrder, '$', '');
              morder = morder + Number(strmorder);
            }
            if (this.arrCashReg[i].adjusted != null) {
              stradjusted = this.generalOperation.ReplaceAll(this.arrCashReg[i].adjusted, '$', '');
              adjusted = adjusted + Number(stradjusted);
            }
            if (this.arrCashReg[i].Total != null) {
              strgtotal = this.generalOperation.ReplaceAll(this.arrCashReg[i].Total, '$', '');
              gttotal = gttotal + Number(strgtotal);
            }
          }
          if (cash > 0 || check > 0 || credit > 0 || morder > 0 || gttotal > 0 || adjusted > 0) {
            let objProvCount1: ORMAddResultRptCashRegister = new ORMAddResultRptCashRegister();
            objProvCount1 = new ORMAddResultRptCashRegister();
            objProvCount1.User = "TOTAL";
            objProvCount1.Cash = parseFloat(cash.toString()).toFixed(2);
            objProvCount1.Check = parseFloat(check.toString()).toFixed(2);
            objProvCount1.CCard = parseFloat(credit.toString()).toFixed(2);
            objProvCount1.MOrder = parseFloat(morder.toString()).toFixed(2);
            objProvCount1.adjusted = parseFloat(adjusted.toString()).toFixed(2);
            objProvCount1.Total = parseFloat(gttotal.toString()).toFixed(2);
            this.test.push(objProvCount1);
          }
        },
        error => {
          return;
        }
      );
    }//user-payment end
    else {
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      debugger;
      if ((this.patientPaymentReportForm.get('patPayDateFrom') as FormControl).value == "") {
        GeneralOperation.showAlertPopUp(this.modalService, 'Date From Selection', "Please selected correct From date.", AlertTypeEnum.WARNING);
        return;
      }
      if ((this.patientPaymentReportForm.get('patPayDateTo') as FormControl).value == "") {
        GeneralOperation.showAlertPopUp(this.modalService, 'Date To Selection', "Please selected correct To date.", AlertTypeEnum.WARNING);
        return;
      }

      if ((this.patientPaymentReportForm.get('rdoTypePatPay') as FormControl).value == "all") {
        this.payMethod = "";
      } else if ((this.patientPaymentReportForm.get('rdoTypePatPay') as FormControl).value == "cash") {
        this.payMethod = "CASH";
      } else if ((this.patientPaymentReportForm.get('rdoTypePatPay') as FormControl).value == "credit") {
        this.payMethod = "CREDIT CARD";
      }
      let strCriteria: SearchCriteria = new SearchCriteria();
      strCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      strCriteria.param_list = [];

      let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(values.patPayDateFrom);
      let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(values.patPayDateTo);

      strCriteria.param_list.push({ name: "patPayDateFrom", value: vardateFrom, option: "" });
      strCriteria.param_list.push({ name: "patPayDateTo", value: vardateTo, option: "" });
      strCriteria.param_list.push({ name: "patPayDdlLocation", value: (this.patientPaymentReportForm.get('patPayDdlLocation') as FormControl).value == 'null' ? '' : (this.patientPaymentReportForm.get('patPayDdlLocation') as FormControl).value, option: "" });
      strCriteria.param_list.push({ name: "patPayDdlProvider", value: (this.patientPaymentReportForm.get('patPayDdlProvider') as FormControl).value == 'null' ? '' : (this.patientPaymentReportForm.get('patPayDdlProvider') as FormControl).value, option: "" });
      strCriteria.param_list.push({ name: "rdoTypePatPay", value: this.payMethod, option: "" });



      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



      this.lstPatientPayment = [];
      this.patTotal = [];
      this.reportsService.getPatientPaymentDetails(strCriteria).subscribe(
        data => {
          debugger;
          this.lstPatientPayment = data;

          let cash: number = 0;
          let check: number = 0;
          let credit: number = 0;
          let payordr: number = 0;
          let adjusted: number = 0;
          let strcash: String = "";
          let strcheck: String = "";
          let strcredit: String = "";
          let strMonOrder: String = "";
          let stradjusted: String = "";
          let gtotalPatient: number = 0;
          for (var i = 0; i < this.lstPatientPayment.length; i++) {
            strcash = "";
            strcheck = "";
            strcredit = "";
            if (this.lstPatientPayment[i].cash_amt != null) {
              strcash = this.generalOperation.ReplaceAll(this.lstPatientPayment[i].cash_amt, '$', '');
              cash = cash + Number(strcash);
            }
            if (this.lstPatientPayment[i].check_amt != null) {
              strcheck = this.generalOperation.ReplaceAll(this.lstPatientPayment[i].check_amt, '$', '');
              check = check + Number(strcheck);
            }
            if (this.lstPatientPayment[i].credit_amt != null) {
              strcredit = this.generalOperation.ReplaceAll(this.lstPatientPayment[i].credit_amt, "$", "");
              credit = credit + Number(strcredit);
            }
            if (this.lstPatientPayment[i].moneyorder_amt != null) {
              strMonOrder = this.generalOperation.ReplaceAll(this.lstPatientPayment[i].moneyorder_amt, "$", "");
              payordr = payordr + Number(strMonOrder);
            }
            if (this.lstPatientPayment[i].adjustments != null) {
              stradjusted = this.generalOperation.ReplaceAll(this.lstPatientPayment[i].adjustments, "$", "");
              adjusted = adjusted + Number(stradjusted);
            }
          }
          if (cash > 0 || check > 0 || credit > 0 || payordr > 0 || adjusted > 0) {
            gtotalPatient = cash + check + credit + payordr;
            let objPatCount: ORMAddResultRptCashRegister = new ORMAddResultRptCashRegister();
            objPatCount = new ORMAddResultRptCashRegister();
            objPatCount.User = "TOTAL";
            objPatCount.Cash = parseFloat(cash.toString()).toFixed(2);
            objPatCount.Check = parseFloat(check.toString()).toFixed(2);
            objPatCount.CCard = parseFloat(credit.toString()).toFixed(2);
            objPatCount.MOrder = parseFloat(payordr.toString()).toFixed(2);
            objPatCount.adjusted = parseFloat(adjusted.toString()).toFixed(2);
            objPatCount.Total = "$" + parseFloat((gtotalPatient).toString()).toFixed(2)
            this.patTotal.push(objPatCount);
          }
        },
        error => {
          return;
        }
      );
    }
  }

  searchPaymentRpt(val) {
    if ((this.collectPaymentReportForm.get('collPayDateFrom') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.modalService, 'Date From Selection', "Please selected correct From date.", AlertTypeEnum.WARNING);
      return;
    }
    if ((this.collectPaymentReportForm.get('collPayDateTo') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.modalService, 'Date To Selection', "Please selected correct To date.", AlertTypeEnum.WARNING);
      return;
    }

    let srchCriteria: SearchCriteria = new SearchCriteria();
    srchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    srchCriteria.param_list = [];

    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(val.collPayDateFrom);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(val.collPayDateTo);

    srchCriteria.param_list.push({ name: "collPayDateFrom", value: vardateFrom, option: "" });
    srchCriteria.param_list.push({ name: "collPayDateTo", value: vardateTo, option: "" });
    srchCriteria.param_list.push({ name: "collPayDdlLocation", value: (this.collectPaymentReportForm.get('collPayDdlLocation') as FormControl).value == 'null' ? '' : (this.collectPaymentReportForm.get('collPayDdlLocation') as FormControl).value, option: "" });
    this.reportsService.getCollectPaymentDetails(srchCriteria).subscribe(
      data => {
        this.lstCollectPayment = data;
        let cash: number = 0;
        let check: number = 0;
        let credit: number = 0;
        let morder: number = 0;
        let gttotal: number = 0;
        let adjusted: number = 0;

        let strcash: String = "";
        let strcheck: String = "";
        let strcredit: String = "";
        let strmorder: String = "";
        let strgtotal: String = "";
        let stradjusted: String = "";
        for (var i = 0; i < this.lstCollectPayment.length; i++) {
          debugger;
          strcash = this.generalOperation.ReplaceAll(this.lstCollectPayment[i].cash, '$', '');
          cash = cash + Number(strcash);

          strcredit = this.generalOperation.ReplaceAll(this.lstCollectPayment[i].cradit_card, '$', '');
          credit = credit + Number(strcredit);

          strcheck = this.generalOperation.ReplaceAll(this.lstCollectPayment[i].check_amt, '$', '');
          check = check + Number(strcheck);

          strmorder = this.generalOperation.ReplaceAll(this.lstCollectPayment[i].mony_order, '$', '');
          morder = morder + Number(strmorder);

          strgtotal = this.generalOperation.ReplaceAll(this.lstCollectPayment[i].total, '$', '');
          gttotal = gttotal + Number(strgtotal);

          stradjusted = this.generalOperation.ReplaceAll(this.lstCollectPayment[i].adjusted_amt, '$$', '');
          adjusted = adjusted + Number(stradjusted);
        }
        debugger;
        if (cash > 0 || check > 0 || credit > 0 || morder > 0 || gttotal > 0 || adjusted > 0) {
          let objPatCount: ORMAddResultRptCashRegister = new ORMAddResultRptCashRegister();
          objPatCount = new ORMAddResultRptCashRegister();
          objPatCount.User = "TOTAL";
          objPatCount.Cash = "$" + parseFloat(cash.toString()).toFixed(2);
          objPatCount.Check = "$" + parseFloat(check.toString()).toFixed(2);
          objPatCount.CCard = "$" + parseFloat(credit.toString()).toFixed(2);
          objPatCount.MOrder = "$" + parseFloat(morder.toString()).toFixed(2);
          objPatCount.adjusted = "$" + parseFloat(adjusted.toString()).toFixed(2);
          objPatCount.Total = "$" + parseFloat(gttotal.toString()).toFixed(2);
          this.lstCollectPaymentTotal.push(objPatCount);
        }

      },
      error => {
        return;
      }
    );
  }
}