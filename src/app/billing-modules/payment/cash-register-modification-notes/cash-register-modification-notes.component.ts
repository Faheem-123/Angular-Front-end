import { Component, OnInit, Input, Inject, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { ServiceResponseStatusEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'cash-register-modification-notes',
  templateUrl: './cash-register-modification-notes.component.html',
  styleUrls: ['./cash-register-modification-notes.component.css']
})
export class CashRegisterModificationNotesComponent implements OnInit {

  @Input() cashRegisterId: number;
  @Input() checkNo: number;
  @Input() checkDate: number;
  @Input() operation: string = "";

  title: string;
  footerNote: string;
  okButtonLable: string = "Save";

  errorMsg: string = "";

  formGroup: FormGroup;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private paymentService: PaymentService) { }

  ngOnInit() {

   
    switch (this.operation) {
      case "Void":
        this.title = "Void Cash Register Entry";
        this.footerNote = "All Payment Postings will be rectified."
        this.okButtonLable = "Void";
        break;
      case "CheckBounce":
        this.title = "Check Bounce";
        this.footerNote = "All Payment Postings will be rectified."
        this.okButtonLable = "Check Bounce";
        break;
      case "Resolve":
        this.title = "Reslove Cash Register Entry";
        this.footerNote = "";
        this.okButtonLable = "Mark as Resloved";
        break;

      default:
        break;
    }

    this.buildForm();
  }
  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  buildForm() {
    this.formGroup = this.formBuilder.group({
      txtComments: this.formBuilder.control(undefined, Validators.required),
    }
    );
  }

  onSubmit(formData: any) {


    let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

    let lstKeyValue: Array<ORMKeyValue> = new Array();


    lstKeyValue.push(new ORMKeyValue("cash_register_id", this.cashRegisterId));
    lstKeyValue.push(new ORMKeyValue("client_modified_date", clientDateTime));
    lstKeyValue.push(new ORMKeyValue("modified_user", this.lookupList.logedInUser.user_name));
    lstKeyValue.push(new ORMKeyValue("client_ip", this.lookupList.logedInUser.systemIp));
    lstKeyValue.push(new ORMKeyValue("comments", formData.txtComments));

    switch (this.operation) {
      case "Void":
        this.paymentService.voidCashRegisterEntry(lstKeyValue).subscribe(
          data => {
            debugger;
            this.modificationSuccess(data);
          },
          error => {
            debugger;
            this.modificationError(error);
          }
        );
        break;
      case "CheckBounce":
        this.paymentService.checkBounceCashRegisterEntry(lstKeyValue).subscribe(
          data => {
            this.modificationSuccess(data);
          },
          error => {
            this.modificationError(error);
          }
        );
        break;
      case "Resolve":
        this.paymentService.markAsResolvedCashRegisterEntry(lstKeyValue).subscribe(
          data => {
            this.modificationSuccess(data);
          },
          error => {
            this.modificationError(error);
          }
        );
        break;

      default:
        break;
    }
  }

  modificationSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.errorMsg = data.response;
    }
  }

  modificationError(error: any) {
    debugger;
    this.errorMsg = "An Error Occured while saving data."
  }
}
