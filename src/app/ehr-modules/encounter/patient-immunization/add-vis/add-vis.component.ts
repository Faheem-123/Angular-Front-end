import { Component, OnInit, Input } from '@angular/core';
import { LogMessage } from 'src/app/shared/log-message';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { ImmunizationService } from 'src/app/services/immunization.service';

@Component({
  selector: 'add-vis',
  templateUrl: './add-vis.component.html',
  styleUrls: ['./add-vis.component.css']
})
export class AddVisComponent implements OnInit {

  @Input() cvxCode: string;
  @Input() selectedImmunizationDisplay: string;
  @Input() vaccineVisList: Array<any>;
  @Input() datePresented: string; // YYYY-MM-DD

  formGroup: FormGroup;
  isLoading: boolean = false;
  lstVIS: Array<any>;
  lstVISUnique: Array<any>;
  lstSelectedVIS: Array<any>;

  constructor(public activeModal: NgbActiveModal,
    private immunizationService: ImmunizationService,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder,
    private ngbModal: NgbModal) { }

  ngOnInit() {
    this.getVIS();
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
    });
  }

  getVIS() {

    this.immunizationService.getImmVIS(this.cvxCode).subscribe(
      data => {
        this.lstVIS = data as Array<any>;

        if (this.lstVIS != undefined) {

          // remove VIS from list if already exist in chart.
          if (this.vaccineVisList != undefined) {

            debugger;
            this.vaccineVisList.forEach(chartVIS => {

              for (let i: number = this.lstVIS.length - 1; i >= 0; i--) {

                if (chartVIS.vis_gdti_code == this.lstVIS[i].vis_gdti_code) {
                  this.lstVIS.splice(i, 1);
                }
              }
            });
          }

          debugger;
          this.lstVISUnique = new UniquePipe().transform(this.lstVIS, "vis_gdti_code");
        }
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getVISError(error);
      }
    );
  }

  getVISError(error) {
    this.logMessage.log("getVISError Error.");
  }

  visCheckChanged(event) {

    debugger;
    let id = event.target.id.toString().split("_")[1];

    if (event.target.checked) {

      if ((<HTMLSelectElement>document.getElementById("ddVIS_" + id)) != null) {
        let index = (<HTMLSelectElement>document.getElementById("ddVIS_" + id)).selectedIndex;
        let vis_encoded_text: string = (<HTMLSelectElement>document.getElementById("ddVIS_" + id)).options[index].value;
        this.addVISToSelectedList(vis_encoded_text);
      }
    }
    else {

      if ((<HTMLSelectElement>document.getElementById("ddVIS_" + id)) != null) {
        let index = (<HTMLSelectElement>document.getElementById("ddVIS_" + id)).selectedIndex;
        let vis_encoded_text: string = (<HTMLSelectElement>document.getElementById("ddVIS_" + id)).options[index].value;
        this.removeVISFromSelectedList(vis_encoded_text);
      }

    }
  }

  visSelecttionchange(vis_encoded_text: string, vis_gdti_code: string) {

    debugger;
    if ((<HTMLInputElement>document.getElementById("chk_" + vis_gdti_code)) != null) {

      if ((<HTMLInputElement>document.getElementById("chk_" + vis_gdti_code)).checked) {
        this.addVISToSelectedList(vis_encoded_text);
      }
    }
  }

  addVISToSelectedList(vis_encoded_text: string) {

    if (this.lstSelectedVIS == undefined) {
      this.lstSelectedVIS = new Array<any>();
    }


    let visObject: any;

    this.lstVIS.forEach(vis => {

      if (vis.vis_encoded_text == vis_encoded_text) {
        visObject = {
          vis_name: vis.vis_name,
          vis_encoded_text: vis.vis_encoded_text,
          vis_gdti_code: vis.vis_gdti_code,
          vis_date: vis.vis_date,
          coding_system: vis.coding_system,
          vis_date_presented: this.datePresented
        };
      }

    });

    let found: boolean = false;
    if (visObject != undefined) {
      for (let i: number = 0; i < this.lstSelectedVIS.length; i++) {

        if (this.lstSelectedVIS[i].vis_gdti_code == visObject.vis_gdti_code && !found) {
          found = true;
          this.lstSelectedVIS[i] = visObject;
        }

      }

      if (!found) {
        this.lstSelectedVIS.push(visObject);
      }
    }

  }

  removeVISFromSelectedList(vis_encoded_text: string) {

    if (this.lstSelectedVIS != undefined) {
      for (let i: number = this.lstSelectedVIS.length - 1; i >= 0; i--) {

        if (vis_encoded_text == this.lstSelectedVIS[i].vis_encoded_text) {
          this.lstSelectedVIS.splice(i, 1);
        }
      }
    }
  }

  onSubmit() {

    if (this.lstSelectedVIS == undefined || this.lstSelectedVIS.length == 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Add VIS', "No VIS is selected.", AlertTypeEnum.WARNING)
    }
    else {
      this.activeModal.close(this.lstSelectedVIS);
    }

  }

}