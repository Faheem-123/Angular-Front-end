import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomValidators, datetimeValidator } from '../../../shared/custome-validators';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { GeneralService } from '../../../services/general/general.service'
import { LogMessage } from '../../../shared/log-message';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { ReportsService } from '../../../services/reports.service';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'rpt-eligibility-verification',
  templateUrl: './rpt-eligibility-verification.component.html',
  styleUrls: ['./rpt-eligibility-verification.component.css']
})
export class RptEligibilityVerificationComponent implements OnInit {

  eligibilityVerificationReportForm: FormGroup;
  lstEligibiltyVerif;
  recordCount: number = 0;
  errorMsg: string = "";
  showCategSearch: boolean = false;
  vardateFrom;
  vardateTo;
  //CategName;
  //DocCategId;
  patientName;
  isLoading: boolean = false;

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private reportsService: ReportsService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private generalService: GeneralService,
    private generalOperation: GeneralOperation) {

  }

  ngOnInit() {



    this.buildForm();

    debugger;
    //Insurance veri
    this.lookupList.lstDocumentCategoryList
    let insVerifCategory: any = this.generalOperation.filterArray(this.lookupList.lstDocumentCategory, "category_name", 'Insurance veri');
    if (insVerifCategory != undefined && insVerifCategory.length > 0) {
      //this.DocCategId=insVerifCategory[0].document_categories_id;
      //this.CategName=insVerifCategory[0].category_name
      this.eligibilityVerificationReportForm.get("txtCategorySearch").setValue(insVerifCategory[0].category_name);
      this.eligibilityVerificationReportForm.get("txtCategoryIdHidden").setValue(insVerifCategory[0].document_categories_id);
    }

  }
  getProviderList() {
    this.generalService.getProvider(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.providerList = data as Array<any>;
      },
      error => {
        this.getProviderListError(error);
      }
    );
  }
  getProviderListError(error) {
    this.logMessage.log("getProviderList Error." + error);
  }


  getLocationsList() {
    this.generalService.getLocation(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.locationList = data as Array<any>;
      },
      error => {
        this.getLocationListError(error);
      }
    );
  }
  getLocationListError(error) {
    this.logMessage.log("getLocationList Error." + error);
  }
  buildForm() {
    this.eligibilityVerificationReportForm = this.formBuilder.group({
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'':this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'':this.lookupList.logedInUser.defaultLocation),
      txtCategorySearch: this.formBuilder.control(''),
      txtCategoryIdHidden: this.formBuilder.control('')
    })
    /*,
    {
      validator: Validators.compose([
        CustomValidators.validDate('dateFrom', false),
        CustomValidators.validDate('dateTo', true)
      ])
    }*/
  }


  searchEligverifReport(formData) {

    this.isLoading = true;
    this.lstEligibiltyVerif =undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];


    //this.vardateFrom=String("00" + formData.dpDateFrom.month).slice(-2) + '/' + String("00" + formData.dpDateFrom.day).slice(-2) + '/' + String("0000" + formData.dpDateFrom.year).slice(-4);
    //this.vardateTo=String("00" + formData.dpDateTo.month).slice(-2) + '/' + String("00" + formData.dpDateTo.day).slice(-2) + '/' + String("0000" + formData.dpDateTo.year).slice(-4);
    debugger
    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    searchCriteria.param_list.push({ name: "dateFrom", value: vardateFrom, option: "" });
    searchCriteria.param_list.push({ name: "dateTo", value: vardateTo, option: "" });
    searchCriteria.param_list.push({ name: "cmbProvider", value: formData.cmbProvider == undefined ? '' : formData.cmbProvider, option: "" });
    searchCriteria.param_list.push({ name: "cmbLocation", value: formData.cmbLocation == undefined ? '' : formData.cmbLocation, option: "" });

    searchCriteria.param_list.push({ name: "category", value: formData.txtCategoryIdHidden == undefined ? '' : formData.txtCategoryIdHidden, option: "" });


    debugger;
    this.reportsService.getEligibilityVerification(searchCriteria).subscribe(
      data => {
        debugger;
        this.isLoading = false;
        this.lstEligibiltyVerif = data;
        this.recordCount = this.lstEligibiltyVerif.length;
      },
      error => {
        this.isLoading = false;
        this.getEligVerifError(error);
      }
    );
  }
  getEligVerifError(error) {
    this.errorMsg = error;
  }

  onDocCategorySelect(category: any) {

    debugger;
    //this.docCatName = category.name;
    this.eligibilityVerificationReportForm.get("txtCategorySearch").setValue(category.name);
    this.eligibilityVerificationReportForm.get("txtCategoryIdHidden").setValue(category.id);
    this.showCategSearch = false;

  }

  closeDocCategorySearch() {
    this.showCategSearch = false;
  }

  openCateogrySearch() {
    this.showCategSearch = true;
  }

}