import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild } from '@angular/core';
import { LOOKUP_LIST, LookupList } from '../../providers/lookupList.module';
import { ListFilterContainPipe } from '../../shared/list-filter-contain-pipe';
import { ListFilterPipe } from '../../shared/list-filter-pipe';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ListFilterGeneralNotIn } from 'src/app/shared/filter-pipe-general-not-in';
import { DocumentTreeModel } from 'src/app/models/general/document-tree-model';
import { TreeComponent } from 'angular-tree-component';

@Component({
  selector: 'inline-doc-category-search',
  templateUrl: './inline-doc-category-search.component.html',
  styleUrls: ['./inline-doc-category-search.component.css']
})
export class InlineDocCategorySearchComponent implements OnInit {


  @Input() searchValue: string;
  @Output() onClose = new EventEmitter<any>();
  @Output() onCategorySelect = new EventEmitter<any>();

  @ViewChild('tree') tree: TreeComponent;

  isLoading: boolean = true;
  lstDocumentCategory: Array<any>;
  lstDocCategoryList: Array<any>;





  lstTreeCategoriesMain: Array<DocumentTreeModel> = [];
  selectedDocCategoryId: number;
  selectedDocCategoryName: string;
  lstCategory: Array<any>;

  docCategoryOptions = [{ animateExpand: true },
  { animateSpeed: 10 }]
  node = [

  ];

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalOperation: GeneralOperation) { }

  ngOnInit() {

    if (this.lookupList.lstCategoriesTreeWithNoLab == undefined || this.lookupList.lstCategoriesTreeWithNoLab.length == 0) {
      this.lookupList.lstCategoriesTreeWithNoLab = this.generalOperation.createDocumentCategory(this.lookupList.lstDocumentCategory, false);
    }    

   // this.lstTreeCategoriesMain = this.generalOperation.createDocumentCategory(this.lookupList.lstDocumentCategory, false);

    this.isLoading = false;
  }

  ngAfterViewInit() {
    const root = this.tree.treeModel.getFirstRoot()
    root.expand();

  }

  OnCategoryChange(e) {
    this.selectedDocCategoryId = e.node.data.id;
    this.selectedDocCategoryName = e.node.data.name;
  }

  doubleClick() {
    this.onCategorySelect.emit({ id: this.selectedDocCategoryId, name: this.selectedDocCategoryName })

  }


}
