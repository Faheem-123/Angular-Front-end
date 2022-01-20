import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SuperBillCode } from '../super-bill-code';

@Component({
  selector: 'super-bill-item',
  templateUrl: './super-bill-item.component.html',
  styleUrls: ['./super-bill-item.component.css']
})
export class SuperBillItemComponent implements OnInit {

  @Input() category: any;
  @Input() lstCatDetail: Array<any>;
  @Input() controlUniqueId: any;

  @Output() onItemChange = new EventEmitter<any>();

  categoryName: string = "";

  code1Type: string = "";
  code2Type: string = "";

  code1Exist: boolean = false;
  code2Exist: boolean = false;


  constructor() { }


  ngOnInit() {

    if (this.category != undefined) {

      this.categoryName = this.category.category_name;

      if (this.category.code1_type != undefined && this.category.code1_type != "") {

        this.code1Type = this.category.code1_type;
      }
      if (this.category.code2_type != undefined && this.category.code2_type != "") {

        this.code2Type = this.category.code2_type;
      }
    }

    debugger;
    if (this.lstCatDetail != undefined) {
      this.lstCatDetail.forEach(element => {

        if (element.code1 != undefined && element.code1 != "") {
          this.code1Exist = true;        
        }
        if (element.code2 != undefined && element.code2 != "") {
          this.code2Exist = true;          
        }

      });
    }

  }

  itemCanged(detail: any, type: string, selected: boolean) {

    debugger;
    let superBillCode: SuperBillCode = new SuperBillCode();
    superBillCode.selected = selected;
    superBillCode.description = detail.description;

    

    switch (type) {
      case "code1":
        superBillCode.code = detail.code1;
        superBillCode.codeType = this.code1Type;//detail.code_type1;

        if(this.code1Type.toUpperCase()=="CPT"){
          superBillCode.ndcCode=detail.default_ndc1;
          superBillCode.modifier=detail.default_modifier1;
          superBillCode.charges=detail.default_amt1;
        }

        break;

      case "code2":
        superBillCode.code = detail.code2;
        superBillCode.codeType = this.code2Type;

        if(this.code1Type.toUpperCase()=="CPT"){
          superBillCode.ndcCode=detail.default_ndc2;
          superBillCode.modifier=detail.default_modifier2;
          superBillCode.charges=detail.default_amt2;
        }

        break;

      default:
        break;
    }

    this.onItemChange.emit(superBillCode);


  }

}

