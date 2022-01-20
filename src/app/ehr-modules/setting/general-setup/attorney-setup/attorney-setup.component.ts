import { Component, OnInit, Inject } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'attorney-setup',
  templateUrl: './attorney-setup.component.html',
  styleUrls: ['./attorney-setup.component.css']
})
export class AttorneySetupComponent implements OnInit {
  inputForm:FormGroup;
  arrAttorney;
  selectedIndex;
  constructor(private setupService: SetupService,@Inject(LOOKUP_LIST) public lookupList: LookupList
  ,private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.getAtorneyList();
    this.buildForm();
  }
  getAtorneyList() {
    this.setupService.getSetupAttorney(this.lookupList.practiceInfo.practiceId.toString()).subscribe(
        data => {
            this.arrAttorney = data as Array<any>;
            if(this.arrAttorney!=undefined && this.arrAttorney!=null)
            {
              this.selectedIndex=0;
              this.assignValues();
            }
        },
        error => {
        }
    );
}
onSelectionChange(index,obj){
this.selectedIndex=index;
this.assignValues();
}
buildForm() {
  this.inputForm = this.formBuilder.group({

    txtfirmName: this.formBuilder.control(null, Validators.required),
    txtlastName: this.formBuilder.control(null, Validators.required),
    txtfirstName: this.formBuilder.control(null, Validators.required),
    txtphone: this.formBuilder.control(null, Validators.required),
    txtfax: this.formBuilder.control(null, Validators.required),
    txtAddress: this.formBuilder.control(null, Validators.required),
    txtzip: this.formBuilder.control(null, Validators.required),
    txtcity: this.formBuilder.control(null, Validators.required),
    txtstate: this.formBuilder.control(null, Validators.required)
  });
}
assignValues(){
  (this.inputForm.get("txtfirmName") as FormControl).setValue(this.arrAttorney[this.selectedIndex].firm_name);
  (this.inputForm.get("txtlastName") as FormControl).setValue(this.arrAttorney[this.selectedIndex].last_name);
  (this.inputForm.get("txtfirstName") as FormControl).setValue(this.arrAttorney[this.selectedIndex].first_name);
  (this.inputForm.get("txtphone") as FormControl).setValue(this.arrAttorney[this.selectedIndex].phone);
  (this.inputForm.get("txtfax") as FormControl).setValue(this.arrAttorney[this.selectedIndex].fax);
  (this.inputForm.get("txtAddress") as FormControl).setValue(this.arrAttorney[this.selectedIndex].address);
  (this.inputForm.get("txtzip") as FormControl).setValue(this.arrAttorney[this.selectedIndex].zip);
  (this.inputForm.get("txtcity") as FormControl).setValue(this.arrAttorney[this.selectedIndex].city);
  (this.inputForm.get("txtstate") as FormControl).setValue(this.arrAttorney[this.selectedIndex].state);
}
}
