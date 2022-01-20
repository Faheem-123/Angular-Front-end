import { Component, OnInit, Inject } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { UserService } from 'src/app/services/user/user.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { Md5 } from 'ts-md5';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  inputForm:FormGroup;
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    private userService: UserService,
    private generalOperation: GeneralOperation) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
     
    this.inputForm = this.formBuilder.group({
      currentPassword: this.formBuilder.control(null),
      newPassword: this.formBuilder.control(null, Validators.required),
      confirmPassword: this.formBuilder.control(null, Validators.required),
    })
     
  }
  onSubmit(frm)
  {
    debugger;
    if(Md5.hashStr(frm.currentPassword)!=this.lookupList.logedInUser.password)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Reset Password","Current password is not correct.","warning")
    }
    if(frm.newPassword!=frm.confirmPassword)
    {
      GeneralOperation.showAlertPopUp(this.modalService,"Reset Password","New and Confirm password should be same.","warning")
    }
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "newPwd", value: Md5.hashStr(frm.newPassword), option: "" },
      { name: "user_name", value: this.lookupList.logedInUser.user_name, option: "" },
      { name: "user_id", value: this.lookupList.logedInUser.userId, option: "" },
      { name: "client_Date", value: this.dateTimeUtil.getCurrentDateTimeString(), option: "" }
    ];
    this.userService.resetPassword(searchCriteria).subscribe(
      data => {
        debugger;
          if (data['status'] === ServiceResponseStatusEnum.SUCCESS) 
          {
            GeneralOperation.showAlertPopUp(this.modalService, "Reset Password", "Password Changed Successfully.", 'info')
            this.activeModal.dismiss('Cross click');
          }
      },
      error => {
      }
    );
    
  }
}
