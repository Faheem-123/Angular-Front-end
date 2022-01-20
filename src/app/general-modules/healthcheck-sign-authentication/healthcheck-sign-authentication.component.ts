import { Component, OnInit, Inject } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from '../../providers/lookupList.module';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { GeneralService } from '../../services/general/general.service';
import { LogMessage } from '../../shared/log-message';
import { GeneralOperation } from '../../shared/generalOperation';
import { Md5 } from 'ts-md5/dist/md5';
import { SearchCriteria } from '../../models/common/search-criteria';
import { AlertPopupComponent } from '../alert-popup/alert-popup.component';
import { ORMKeyValue } from '../../models/general/orm-key-value';
@Component({
  selector: 'healthcheck-sign-authentication',
  templateUrl: './healthcheck-sign-authentication.component.html',
  styleUrls: ['./healthcheck-sign-authentication.component.css']
})
export class HealthcheckSignAuthenticationComponent implements OnInit {
  filterForm: FormGroup;
  lstProviderUsers:Array<any>;
  chartProviderId:number;
  modalTitle:string;
  constructor(public activeModal: NgbActiveModal,@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private formBuilder: FormBuilder,private generalService:GeneralService,private generalOperation:GeneralOperation,
private logMessage:LogMessage,private modalService:NgbModal) { }

  ngOnInit() {
    this.buildForm();
    this.getProviderUser();
  }
  buildForm(){
    this.filterForm = this.formBuilder.group({
      ctrlproviderSearch: this.formBuilder.control("", Validators.required),
      txt_user: this.formBuilder.control("", Validators.required),
      txt_passowrd: this.formBuilder.control("", Validators.required)
    })
  }
  getProviderUser(){
    this.generalService.getProviderUser(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
      data => {
        debugger;
        this.lstProviderUsers = data as Array<any>;
        (this.filterForm.get('ctrlproviderSearch') as FormControl).setValue(this.chartProviderId);
      },
      error => {
        this.logMessage.log("getProviderUser "+error);
      }
    );
  }
  onProviderChange()
  {
    debugger;
    let listProviderUserFiltered=this.generalOperation.filterArray(this.lstProviderUsers,'provider_id',this.filterForm.get("ctrlproviderSearch").value)
        if(listProviderUserFiltered.length>0)
        {
          (this.filterForm.get('txt_user') as FormControl).setValue(listProviderUserFiltered[0].user_name);
        }
        else
          (this.filterForm.get('txt_user') as FormControl).setValue('');

      (this.filterForm.get('txt_passowrd') as FormControl).setValue('');

  }
  onSubmit(form){
    debugger;
    
    let searchCriteria:SearchCriteria=new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list= [
      { name: "provider_id",value: form.ctrlproviderSearch},
      { name: "password",value: Md5.hashStr(form.txt_passowrd)},
      { name: "practice_id",value: this.lookupList.practiceInfo.practiceId.toString()}
  ];
    this.generalService.AuthenticateProviderUser(searchCriteria).subscribe(
      data => {
        this.AuthenticateProviderUser_result(data,form.ctrlproviderSearch);
      },
      error => {
        this.logMessage.log("AuthenticateProviderUser "+error);
      }
    );
    
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size:'sm'
  };
  AuthenticateProviderUser_result(data,providerId){
    if(data.length>0)
    {
      let lstprovider =this.generalOperation.filterArray(this.lstProviderUsers,'provider_id',providerId);
      let providerName='';
      if(lstprovider.length>0)
      {
        providerName=lstprovider[0].provider_name;
      }
      let keyVlaueList: Array<ORMKeyValue>=[];
      
      keyVlaueList.push(new ORMKeyValue("signType",(this.modalTitle=='Provider 1 Authentication'?'provider1_sign_info':'provider2_sign_info')));
      keyVlaueList.push(new ORMKeyValue("provider_id",providerId));
      keyVlaueList.push(new ORMKeyValue("provider_name",providerName));
      this.activeModal.close(keyVlaueList); 
    }
    else{
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Provider Authentication"
      modalRef.componentInstance.promptMessage = "Invalid Password";
    }
  }

}
