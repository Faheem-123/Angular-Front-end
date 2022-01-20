import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { GeneralOperation } from '../../shared/generalOperation';
import { LOOKUP_LIST, LookupList } from '../../providers/lookupList.module';
import { GeneralService } from '../../services/general/general.service';
import { LogMessage } from '../../shared/log-message';
import { UniquePipe } from '../../shared/unique-pipe';

@Component({
  selector: 'inline-document-category-search',
  templateUrl: './inline-document-category-search.component.html',
  styleUrls: ['./inline-document-category-search.component.css']
})
export class InlineDocumentCategorySearchComponent implements OnInit {
  @Output() onClose = new EventEmitter<any>();
  @Output() onDiagSelect = new EventEmitter<any>();
  @Output() onDocumentSelect = new EventEmitter<any>();
  @Input() searchValue:string;
  
  isLoading:boolean=true;
  //filterValue;
  //lstDocCategoryList;
  //SublstDocCategoryList;

  constructor(private generalOperation: GeneralOperation,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalService: GeneralService,private logMessage:LogMessage
    ) { }

  ngOnInit() {
    this.searchDocCategory();
  }

  lstParentCategory:Array<any>;
  lstSubParentCategory:Array<any>;
  lstSubCategory:Array<any>;

  searchDocCategory(){
    debugger;
    this.isLoading = true;
    //this.filterValue = this.generalOperation.filterArray(this.lookupList.lstDocumentCategory, "category_name",(this.eligibilityVerificationReportForm.get('category') as FormControl).value);
    if (this.lookupList.lstDocumentCategoryList == undefined || this.lookupList.lstDocumentCategoryList.length == 0) {
      //this.getDocCategoryList();
    }else{

      this.populateCategories();

     // debugger;
     // this.SublstDocCategoryList = this.lookupList.lstDocumentCategoryList.slice();
      //this.lstDocCategoryList = new UniquePipe().transform(this.lookupList.lstDocumentCategoryList,"parent_category");// this.lookupList.lstDocumentCategoryList.slice();
     
      this.isLoading = false;
    }
  }
  populateCategories(){
    debugger;
    this.lstSubParentCategory = this.lookupList.lstDocumentCategoryList.slice();
    this.lstSubCategory = this.lookupList.lstDocumentCategoryList.slice();

    this.lookupList.lstDocumentCategoryList.forEach(cat => {
      debugger;
      if(cat.parent_category==undefined || cat.parent_category==""){

        if( this.lstParentCategory == undefined){
            this.lstParentCategory=new Array();
        }
        this.lstParentCategory.push({document_categories_id:cat.document_categories_id,category_name:cat.category_name});          
      }
    });
  }
  // getDocCategoryList(){
  //   debugger;
  //   //getDocCategories
  //   this.generalService.getDocCategories(this.lookupList.practiceInfo.practiceId).subscribe(
  //     data => {
  //       debugger;
       
  //       this.lookupList.lstDocumentCategoryList =  data as Array<any>;
  //       this.populateCategories();
  //       this.isLoading = false;
  //     },
  //     error => {
  //       this.isLoading = false;
  //       this.logMessage.log("getDocumentCategories:"+error);
  //     }
  //   );
  // }
}
