import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import { ORMproviderEncounterCount } from 'src/app/models/reports/ORMproviderEncounterCount';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from './../../../providers/lookupList.module';
import { ORMYearlyCollectionTotal } from 'src/app/models/reports/ORMYearlyCollectionTotal';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rpt-cash-reg-yearly-collection',
  templateUrl: './rpt-cash-reg-yearly-collection.component.html',
  styleUrls: ['./rpt-cash-reg-yearly-collection.component.css']
})
export class RptCashRegYearlyCollectionComponent implements OnInit {

  yearlyCollectionReportForm: FormGroup;
  lstYearlyCollection;
  lstYearlyCollectionTotal = [];
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private modalService: NgbModal,
  private formBuilder:FormBuilder,
    private reportsService: ReportsService) { }

  ngOnInit() {
    this.buildForm();
  }
  buildForm(){
  this.yearlyCollectionReportForm = this.formBuilder.group({
    yearColl: this.formBuilder.control(null)
   })
  }
  searchYearlyCollection(){
    debugger;
    let varYear = (this.yearlyCollectionReportForm.get('yearColl') as FormControl).value;
    if (varYear.length !=4 || varYear == "") {
		GeneralOperation.showAlertPopUp(this.modalService, 'Year Selection', "Please enter 4 digit year.", AlertTypeEnum.WARNING);
		return;
    }

    let srchCriteria: SearchCriteria = new SearchCriteria();
    srchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    srchCriteria.param_list = [];
    srchCriteria.param_list.push({ name: "year", value: varYear, option: "" });

    this.reportsService.getYearlyCollectionDetails(srchCriteria).subscribe(
      data => {
        this.lstYearlyCollection = data;

        let strLocation:String="";
				let month_01:number=0;
				let month_02:number=0;
				let month_03:number=0;
				let month_04:number=0;
				let month_05:number=0;
				let month_06:number=0;
				let month_07:number=0;
				let month_08:number=0;
				let month_09:number=0;
				let month_10:number=0;
				let month_11:number=0;
				let month_12:number=0;
				let location_total:number=0;
				let month_01_total:number=0;
				let month_02_total:number=0;
				let month_03_total:number=0;
				let month_04_total:number=0;
				let month_05_total:number=0;
				let month_06_total:number=0;
				let month_07_total:number=0;
				let month_08_total:number=0;
				let month_09_total:number=0;
				let month_10_total:number=0;
				let month_11_total:number=0;
				let month_12_total:number=0;
        let Grand_total:number=0;

        if(this.lstYearlyCollection!=null && this.lstYearlyCollection.length>0){
          for (var i = 0; i < this.lstYearlyCollection.length; i++) {
            if(this.lstYearlyCollection[i].location_name==strLocation){
              this.lstYearlyCollection[i].location_name="";
							this.lstYearlyCollection[i].is_aggregate=false;
							
							month_01+=Number(this.lstYearlyCollection[i].month_01) ;
							month_02+=Number(this.lstYearlyCollection[i].month_02) ;
							month_03+=Number(this.lstYearlyCollection[i].month_03) ;
							month_04+=Number(this.lstYearlyCollection[i].month_04) ;
							month_05+=Number(this.lstYearlyCollection[i].month_05) ;
							month_06+=Number(this.lstYearlyCollection[i].month_06) ;
							month_07+=Number(this.lstYearlyCollection[i].month_07) ;
							month_08+=Number(this.lstYearlyCollection[i].month_08) ;
							month_09+=Number(this.lstYearlyCollection[i].month_09) ;
							month_10+=Number(this.lstYearlyCollection[i].month_10) ;
							month_11+=Number(this.lstYearlyCollection[i].month_11) ;
							month_12+=Number(this.lstYearlyCollection[i].month_12) ;
							
							location_total+= Number(this.lstYearlyCollection[i].total);
            }
            else
						{	
							if(i==0)
							{
								strLocation=this.lstYearlyCollection[i].location_name;
								
								month_01+=Number(this.lstYearlyCollection[i].month_01) ;
								month_02+=Number(this.lstYearlyCollection[i].month_02) ;
								month_03+=Number(this.lstYearlyCollection[i].month_03) ;
								month_04+=Number(this.lstYearlyCollection[i].month_04) ;
								month_05+=Number(this.lstYearlyCollection[i].month_05) ;
								month_06+=Number(this.lstYearlyCollection[i].month_06) ;
								month_07+=Number(this.lstYearlyCollection[i].month_07) ;
								month_08+=Number(this.lstYearlyCollection[i].month_08) ;
								month_09+=Number(this.lstYearlyCollection[i].month_09) ;
								month_10+=Number(this.lstYearlyCollection[i].month_10) ;
								month_11+=Number(this.lstYearlyCollection[i].month_11) ;
								month_12+=Number(this.lstYearlyCollection[i].month_12) ;
								
								location_total+= Number(this.lstYearlyCollection[i].total);
							}
							
							if(i>0)
							{
                let objYearlyColl: ORMYearlyCollectionTotal = new ORMYearlyCollectionTotal();
                objYearlyColl = new ORMYearlyCollectionTotal();

                strLocation=this.lstYearlyCollection[i].location_name;

                objYearlyColl.location_id="";
                objYearlyColl.location_name=strLocation+" TOTAL";
                objYearlyColl.collection_type="";
                objYearlyColl.month_01= Number(month_01.toFixed(2));
                objYearlyColl.month_02=Number(month_02.toFixed(2));
                objYearlyColl.month_03=Number(month_03.toFixed(2));
                objYearlyColl.month_04=Number(month_04.toFixed(2));
                objYearlyColl.month_05=Number(month_05.toFixed(2));
                objYearlyColl.month_06=Number(month_06.toFixed(2));
                objYearlyColl.month_07=Number(month_07.toFixed(2));
                objYearlyColl.month_08=Number(month_08.toFixed(2));
                objYearlyColl.month_09=Number(month_09.toFixed(2));
                objYearlyColl.month_10=Number(month_10.toFixed(2));
                objYearlyColl.month_11=Number(month_11.toFixed(2));
                objYearlyColl.month_12=Number(month_12.toFixed(2));
                objYearlyColl.total=Number(location_total.toFixed(2));


debugger;
								
								this.lstYearlyCollection.addItemAt(objYearlyColl,i);
								
                i++;
                
								this.lstYearlyCollection.addItemAt(objYearlyColl,i);
								i++;
								
								strLocation=this.lstYearlyCollection[i].location_name;
								
								
								
								month_01_total+=month_01;
								month_02_total+=month_02;
								month_03_total+=month_03;
								month_04_total+=month_04;
								month_05_total+=month_05;
								month_06_total+=month_06;
								month_07_total+=month_07;
								month_08_total+=month_08;
								month_09_total+=month_09;
								month_10_total+=month_10;
								month_11_total+=month_11;
								month_12_total+=month_12;
								Grand_total+=location_total;
								
								month_01=0;
								month_02=0;
								month_03=0;
								month_04=0;
								month_05=0;
								month_06=0;
								month_07=0;
								month_08=0;
								month_09=0;
								month_10=0;
								month_11=0;
								month_12=0;
								location_total=0;
								
								
								month_01+=Number(this.lstYearlyCollection[i].month_01) ;
								month_02+=Number(this.lstYearlyCollection[i].month_02) ;
								month_03+=Number(this.lstYearlyCollection[i].month_03) ;
								month_04+=Number(this.lstYearlyCollection[i].month_04) ;
								month_05+=Number(this.lstYearlyCollection[i].month_05) ;
								month_06+=Number(this.lstYearlyCollection[i].month_06) ;
								month_07+=Number(this.lstYearlyCollection[i].month_07) ;
								month_08+=Number(this.lstYearlyCollection[i].month_08) ;
								month_09+=Number(this.lstYearlyCollection[i].month_09) ;
								month_10+=Number(this.lstYearlyCollection[i].month_10) ;
								month_11+=Number(this.lstYearlyCollection[i].month_11) ;
								month_12+=Number(this.lstYearlyCollection[i].month_12) ;								
								location_total+= Number(this.lstYearlyCollection[i].total);
							}
            }//else end
          }//for end

          
					if(i>0)
					{
            let objYearly: ORMYearlyCollectionTotal = new ORMYearlyCollectionTotal();
            objYearly = new ORMYearlyCollectionTotal();

                strLocation=this.lstYearlyCollection[i].location_name;
								debugger;
                objYearly.location_id="";
                objYearly.location_name=strLocation+" TOTAL";
                objYearly.collection_type="";
                objYearly.month_01= Number(month_01.toFixed(2));
                objYearly.month_02=Number(month_02.toFixed(2));
                objYearly.month_03=Number(month_03.toFixed(2));
                objYearly.month_04=Number(month_04.toFixed(2));
                objYearly.month_05=Number(month_05.toFixed(2));
                objYearly.month_06=Number(month_06.toFixed(2));
                objYearly.month_07=Number(month_07.toFixed(2));
                objYearly.month_08=Number(month_08.toFixed(2));
                objYearly.month_09=Number(month_09.toFixed(2));
                objYearly.month_10=Number(month_10.toFixed(2));
                objYearly.month_11=Number(month_11.toFixed(2));
                objYearly.month_12=Number(month_12.toFixed(2));
                objYearly.total=Number(location_total.toFixed(2));

                this.lstYearlyCollection.addItemAt(objYearly,i);
						
						
						
						
						month_01_total+=month_01;
						month_02_total+=month_02;
						month_03_total+=month_03;
						month_04_total+=month_04;
						month_05_total+=month_05;
						month_06_total+=month_06;
						month_07_total+=month_07;
						month_08_total+=month_08;
						month_09_total+=month_09;
						month_10_total+=month_10;
						month_11_total+=month_11;
						month_12_total+=month_12;
						Grand_total+=location_total;
						
						month_01=0;
						month_02=0;
						month_03=0;
						month_04=0;
						month_05=0;
						month_06=0;
						month_07=0;
						month_08=0;
						month_09=0;
						month_10=0;
						month_11=0;
						month_12=0;
						location_total=0;
					}
          this.lstYearlyCollection.refresh();
        }
				i++;
				debugger;
        let objYear: ORMYearlyCollectionTotal = new ORMYearlyCollectionTotal();
        objYear = new ORMYearlyCollectionTotal();
				objYear.location_id="";
        objYear.location_name="Grand Total";

				objYear.month_01=Number(month_01_total.toFixed(2));
				objYear.month_02=Number(month_02_total.toFixed(2));
				objYear.month_03=Number(month_03_total.toFixed(2));
				objYear.month_04=Number(month_04_total.toFixed(2));
				objYear.month_05=Number(month_05_total.toFixed(2));
				objYear.month_06=Number(month_06_total.toFixed(2));
				objYear.month_07=Number(month_07_total.toFixed(2));
				objYear.month_08=Number(month_08_total.toFixed(2));
				objYear.month_09=Number(month_09_total.toFixed(2));
				objYear.month_10=Number(month_10_total.toFixed(2));								
				objYear.month_11=Number(month_11_total.toFixed(2));
				objYear.month_12=Number(month_12_total.toFixed(2));
				objYear.total=Number(Grand_total.toFixed(2));
				this.lstYearlyCollection.addItemAt(objYear,i);
				this.lstYearlyCollection.refresh();
      },
      error => {
        return;
      }
    );

  }
}
