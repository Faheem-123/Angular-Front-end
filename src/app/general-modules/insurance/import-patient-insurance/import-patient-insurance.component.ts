import { Component, OnInit, Input } from '@angular/core';
import { CallingFromEnum, PromptResponseEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { NgbModalOptions, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from '../../confirmation-popup/confirmation-popup.component';
import { PatientService } from 'src/app/services/patient/patient.service';
import { LogMessage } from 'src/app/shared/log-message';

@Component({
  selector: 'import-patient-insurance',
  templateUrl: './import-patient-insurance.component.html',
  styleUrls: ['./import-patient-insurance.component.css']
})
export class ImportPatientInsuranceComponent implements OnInit {

  @Input() patientId: number;
  @Input() status: string; // active|inactive
  @Input() callingFrom: CallingFromEnum;

  isLoading: boolean = false;
  lstPatientInsurance: Array<any>;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  //@Output() onImport = new EventEmitter<any>();

  constructor(public activeModal: NgbActiveModal,
    private ngbModal: NgbModal,
    private patientService: PatientService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.isLoading = true;
    this.getInactivePatientInsurance();
  }

  getInactivePatientInsurance() {
    this.patientService.getPatientInsurance(this.patientId, this.status).subscribe(
      data => {
        debugger;
        this.lstPatientInsurance = data as Array<any>;
        this.isLoading = false;

      },
      error => {
        this.isLoading = false;
        this.getPatientInsuranceError(error);
      }
    );
  }

  getPatientInsuranceError(error) {
    this.logMessage.log("getPatientInsurance Error." + error);
  }

  onImportInactiveInsurance(ins: any) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Import Inactive Insurance!';
    modalRef.componentInstance.promptMessage = ins.insurace_type + ' insurance will be replaced. Do you want to continue?';
    modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        ins.patientinsurance_id = null;
        this.activeModal.close(ins);
      }
    }, (reason) => {
      //alert(reason);
    });
  }

}
