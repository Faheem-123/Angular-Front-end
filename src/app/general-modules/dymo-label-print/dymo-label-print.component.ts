import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DymoLbelPrintType } from 'src/app/shared/enum-util';
import "../../../assets/js/dymo/LabelPrint.js"
import { LabelPrintTemplates } from 'src/app/shared/label-print-templates.js';
import { GeneralService } from 'src/app/services/general/general.service';
import { PhonePipe } from 'src/app/shared/phone-pipe.js';

declare var dymoLabelPrint: any;

@Component({
  selector: 'dymo-label-print',
  templateUrl: './dymo-label-print.component.html',
  styleUrls: ['./dymo-label-print.component.css']
})
export class DymoLabelPrintComponent implements OnInit {

  @Input() labelType: DymoLbelPrintType;
  @Input() id: string;


  labelData: any;

  header: string = "Label"


  pid: number;
  patientName: string;
  dob: string;
  addressLine1: string;
  addressLine2: string;
  cityStateZip: string;
  orderId: string;
  collectionDateTime: string;
  phoneNo: string;

  errorMsg: string = '';
  isLoading: boolean = false;

  constructor(public activeModal: NgbActiveModal,
    private generalService: GeneralService) { }
  ngOnInit() {

    if (this.labelType == DymoLbelPrintType.LAB_ORDER_SPECIMENT_LABEL) {
      this.header = "Lab Order Specimen Label";
    }
    else if (this.labelType == DymoLbelPrintType.PATIENT_CHART_LABEL) {
      this.header = "Patient Chart Label";
    }
    else if (this.labelType == DymoLbelPrintType.PATIENT_MAILING_LABEL) {
      this.header = "Patient Mailing Label";
    }


    try {

      this.isLoading = true;
      dymoLabelPrint.initializeDymoPrinter();

      this.getLabelPrintData();

    } catch (error) {
      debugger;
      //alert(error)

      this.errorMsg = error;
      this.isLoading = false;
    }

  }
  getLabelPrintData() {

    this.isLoading = true;
    this.generalService.getLabelPrintData(this.labelType, this.id).subscribe(
      data => {

        debugger;
        this.labelData = data;

        if (this.labelData != undefined) {

          this.pid = this.labelData.pid;
          this.patientName = this.labelData.patient_name;
          this.dob = this.labelData.dob;
          this.addressLine1 = this.labelData.address_line1;
          this.addressLine2 = this.labelData.address_line2;

          this.cityStateZip = this.labelData.city + ', ' + this.labelData.state + ' ' + this.labelData.zip;

          this.phoneNo = new PhonePipe().transform(this.labelData.phone);
          if(this.phoneNo!=null && this.phoneNo!="")
          {
            this.phoneNo=", Ph:"+this.phoneNo;
          }

          if (this.labelData.collection_start_datetime != undefined && this.labelData.collection_start_datetime != '') {
            this.collectionDateTime = this.labelData.collection_start_datetime;
          }
          if (this.labelData.collection_end_datetime != undefined && this.labelData.collection_end_datetime != '') {
            this.collectionDateTime += ' - ' + this.labelData.collection_end_datetime;
          }

          if (this.labelType == DymoLbelPrintType.LAB_ORDER_SPECIMENT_LABEL) {
            this.orderId = this.labelData.id;
          }
        }

        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }

  cancelPrint() {
    this.activeModal.close();
  }
  print() {

    try {
      debugger;
      var printerName = "";
      var printers = dymoLabelPrint.getLabelPrinters();
      if (printers == undefined || printers.length == 0) {
        this.errorMsg = "No DYMO printers are installed. Install DYMO printers.";
        //alert("No DYMO printers are installed. Install DYMO printers.");
      }
      else {
        for (var i = 0; i < printers.length; ++i) {
          var printer = printers[i];
          if (printer.printerType == "LabelWriterPrinter") {
            printerName = printer.name;
            break;
          }
        }
        if (printerName == "") {
          this.errorMsg = "No LabelWriter printers found. Install LabelWriter printer."
          //alert("No LabelWriter printers found. Install LabelWriter printer");
        }
      }

      if (printerName != "") {

        let lstParam: Array<any> = [];
        let address: string = '';
        switch (this.labelType) {
          case DymoLbelPrintType.PATIENT_MAILING_LABEL:

            lstParam = [];
            lstParam.push({ key: 'patient', value: this.patientName });

            address = this.addressLine1;
            if (this.addressLine2 != '') {
              address += "\n" + this.addressLine2;
            }
            address += "\n" + this.cityStateZip;

            lstParam.push({ key: 'address', value: address });

            dymoLabelPrint.printDymanic(printerName, LabelPrintTemplates.PATIENT_MAILING_LABEL, lstParam);

            break;
          case DymoLbelPrintType.PATIENT_CHART_LABEL:

            lstParam = [];
            lstParam.push({ key: 'pid', value: this.pid });
            lstParam.push({ key: 'dob', value: this.dob });
            lstParam.push({ key: 'patient', value: this.patientName });

            address = this.addressLine1;
            if (this.addressLine2 != '') {
              address += ", " + this.addressLine2;
            }
            address += "\n" + this.cityStateZip;
            // if (this.phoneNo != '') {
            //   address += "\n" + this.phoneNo;
            // }

              if (this.phoneNo != '') {
               address += this.phoneNo;
             }

            lstParam.push({ key: 'address', value: address });

            dymoLabelPrint.printDymanic(printerName, LabelPrintTemplates.PATIENT_CHART_LABEL, lstParam);

            break;

          case DymoLbelPrintType.LAB_ORDER_SPECIMENT_LABEL:

            lstParam = [];
            lstParam.push({ key: 'patient', value: this.patientName });
            lstParam.push({ key: 'pid', value: this.pid });
            lstParam.push({ key: 'order_id', value: this.orderId });
            lstParam.push({ key: 'collection_date', value: this.collectionDateTime });

            dymoLabelPrint.printDymanic(printerName, LabelPrintTemplates.LAB_ORDER_SPECIMENT_LABEL, lstParam);

            break;

          default:
            break;
        }
      }
    } catch (error) {
      this.errorMsg = error;
    }


  }
}
