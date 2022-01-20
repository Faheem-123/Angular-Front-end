import { Component, OnInit, Input, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LogMessage } from 'src/app/shared/log-message';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { BillingService } from 'src/app/services/billing/billing.service';

@Component({
  selector: 'adjustment-codes-glossaray',
  templateUrl: './adjustment-codes-glossaray.component.html',
  styleUrls: ['./adjustment-codes-glossaray.component.css']
})
export class AdjustmentCodesGlossarayComponent implements OnInit {
  @Input() lstAdjustCodes: Array<string> = [];
  @Input() lstRemarksCodes: Array<string> = [];

  isLoading: boolean = false;

  lstAdjustmentCodesGlossary: Array<any>;
  lstAdjustmentCodesGlossaryProcessing: Array<any> = [];
  lstAdjustGroupCodesUnique: Array<any>;

  strRemarksCodes: string = '';
  strAdjustCodes: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private billingService: BillingService,
    private paymentService: PaymentService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.isLoading = true;
    this.fetchCodes();
  }

  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  fetchCodes() {

    debugger;
    this.lstAdjustmentCodesGlossary = [];
    this.lstAdjustmentCodesGlossaryProcessing = [];
    this.lstAdjustGroupCodesUnique = [];
    this.strRemarksCodes = '';
    this.strAdjustCodes = '';

    if (this.lstAdjustCodes != undefined) {
      this.lstAdjustCodes.forEach(code => {

        if (code != undefined && code != '') {

          let lstAdjCodeSplit: Array<string> = code.split("-");

          let groupCode: string = lstAdjCodeSplit[0];
          let reasonCodeCode: string = lstAdjCodeSplit[1];

          let adjCodeFound: boolean = false;
          this.lstAdjustmentCodesGlossaryProcessing.forEach(code => {
            if (code.group_code.trim() == groupCode.trim() && code.code.trim() == reasonCodeCode.trim()) {
              adjCodeFound = true;
            }
          });
          if (!adjCodeFound) {
            this.lstAdjustmentCodesGlossaryProcessing.push({ type: 'Adjust Codes', group_code: groupCode.trim(), code: reasonCodeCode.trim() });
          }
        }
      });
    }

    if (this.lstRemarksCodes != undefined) {

      this.lstRemarksCodes.forEach(rCode => {

        debugger;
        if (rCode != undefined && rCode != '') {
          let remCodeFound: boolean = false;
          this.lstAdjustmentCodesGlossaryProcessing.forEach(code => {
            if (code.code.trim() == rCode.trim()) {
              remCodeFound = true;
            }
          });
          if (!remCodeFound) {
            this.lstAdjustmentCodesGlossaryProcessing.push({ type: 'Remark Codes', group_code: '', code: rCode.trim() });
          }
        }

      });
    }


    this.lstAdjustmentCodesGlossaryProcessing.forEach(code => {

      if (code.type == 'Adjust Codes') {

        if (this.strAdjustCodes != '') {
          this.strAdjustCodes += ","
        }
        this.strAdjustCodes += code.code.trim();

      }
      else if (code.type == 'Remark Codes') {

        if (this.strRemarksCodes != '') {
          this.strRemarksCodes += ","
        }
        this.strRemarksCodes += code.code.trim();
      }

    });

    this.getAdjustCodesGlossary();
  }


  getAdjustCodesGlossary() {


    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.param_list = [
      { name: "adjust_codes", value: this.strAdjustCodes, option: "" },
      { name: "remark_codes", value: this.strRemarksCodes, option: "" }
    ];

    this.billingService.getAdjustCodesGlossary(searchCriteria).subscribe(
      data => {

        let lst: Array<any> = data as Array<any>;;
        this.lstAdjustmentCodesGlossary = [];
        this.lstAdjustGroupCodesUnique = [];

        this.lstAdjustmentCodesGlossaryProcessing.forEach(proccesdCode => {

          lst.forEach(codeDesc => {

            if (proccesdCode.code.trim() == codeDesc.code.trim() && codeDesc.type == proccesdCode.type) {

              if (proccesdCode.type == 'Adjust Codes') {
                this.lstAdjustmentCodesGlossary.push(
                  {
                    group_code: proccesdCode.group_code.trim(),
                    code: proccesdCode.group_code.trim() + '-' + proccesdCode.code.trim(),
                    description: codeDesc.description,
                    type: codeDesc.type
                  })


                let groupCodeFound: boolean = false;
                this.lstAdjustGroupCodesUnique.forEach(unique => {
                  if (unique.trim() == proccesdCode.group_code.trim()) {
                    groupCodeFound = true;
                  }

                });

                if (!groupCodeFound) {
                  this.lstAdjustGroupCodesUnique.push(proccesdCode.group_code.trim());
                }

              }
              else if (proccesdCode.type == 'Remark Codes') {

                this.lstAdjustmentCodesGlossary.push(
                  {
                    group_code: '',
                    code: proccesdCode.code.trim(),
                    description: codeDesc.description,
                    type: codeDesc.type
                  })
              }
            }
          });
        });

        this.isLoading = false;

      },
      error => {
        this.isLoading = false;
        this.getAdjustCodesGlossaryError(error);
      }
    );
  }

  getAdjustCodesGlossaryError(error) {
    this.logMessage.log("getAdjustCodesGlossary Error." + error);
  }
}
