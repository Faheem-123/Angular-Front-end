import { SearchCriteria } from './../../../models/common/search-criteria';
import { UniquePipe } from './../../../shared/unique-pipe';
import { ConfirmationPopupComponent } from './../../../general-modules/confirmation-popup/confirmation-popup.component';
import { FileUploadPopupComponent } from './../../../general-modules/file-upload-popup/file-upload-popup.component';
import { ORMDeleteRecord } from './../../../models/general/orm-delete-record';
import { LOOKUP_LIST, LookupList } from './../../../providers/lookupList.module';
import { LogMessage } from './../../../shared/log-message';
import { Component, OnInit, Input, Inject, ViewChild, QueryList, ViewChildren, Output, EventEmitter } from '@angular/core';
import { PatientService } from '../../../services/patient/patient.service';
import { DateTimeUtil } from '../../../shared/date-time-util';

import { GeneralOperation } from '../../../shared/generalOperation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { PromptResponseEnum, ScanDocumentType, AlertTypeEnum, FaxAttachemntsTypeEnum, ServiceResponseStatusEnum, CallingFromEnum } from '../../../shared/enum-util';
//import { TreeModel,NodeEvent, TreeModelSettings  } from 'ng2-tree';
//import { Ng2TreeSettings } from 'ng2-tree/src/tree.types';

import { GeneralService } from '../../../services/general/general.service';
import { DocumentViewerComponent } from '../../../general-modules/document-viewer/document-viewer.component';
import { TreeComponent } from 'angular-tree-component';
import { DwtComponent } from 'src/app/general-modules/dwt/dwt.component';
import { DomSanitizer } from '@angular/platform-browser';
import { SortFilterPaginationResult, NgbdSortableHeader, SortEvent, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { APP_CONFIG, AppConfig } from 'src/app/providers/app-config.module';
import { SendFaxAttachmentsFromClient } from 'src/app/models/fax/send-fax-attachments-from-client';
import { AddDocumentsCategoryComponent } from '../add-documents-category/add-documents-category.component';
import { ORMSaveDocCategory } from 'src/app/models/patient/orm-save-doc-category';
import { NewFaxComponent } from '../../fax/new-fax/new-fax.component';
import * as FileSaver from 'file-saver';
import { ListFilterGeneralNotIn } from 'src/app/shared/filter-pipe-general-not-in';
import { DocumentTreeModel } from 'src/app/models/general/document-tree-model';

@Component({
  selector: 'patient-documents',
  templateUrl: './patient-documents.component.html',
  styleUrls: ['./patient-documents.component.css']
})
export class PatientDocumentsComponent implements OnInit {

  @Input() patientId;
  @Input() callingFrom: CallingFromEnum;
  @Output() onDocumentSelectionCallBack = new EventEmitter<any>();

  @ViewChild('tree') tree: TreeComponent;

  lstTreeCategories: Array<DocumentTreeModel> = [];

  lstDocumentsAll;
  lstDocumentsFiltered;
  lstCategories;
  rowId;
  downloadPath;
  uploadPath;
  req_document;
  isLoading = false;
  //defaultCategory: string;
  selectedCategoryId: string;
  selectedNode;


  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  controlUniqueId: string = "";

  ngAfterViewInit() {
    //this.tree.treeModel.exp

    const root = this.tree.treeModel.getFirstRoot()
    root.expand();
  }

  docCatTreeOptions = [{ animateExpand: true },
  { animateSpeed: 10 }]
  constructor(private patientService: PatientService,
    private generalService: GeneralService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    private ngbModal: NgbModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private domSanitizer: DomSanitizer,
    private sortFilterPaginationService: SortFilterPaginationService, @Inject(APP_CONFIG) private config: AppConfig) { }

  //lstChildrenSub = [];

  /*
  createDocumentCategory() {
    debugger;

    this.lookupList.lstDocumentCategory.forEach(element => {
      if (element.is_default_category) {
        //  this.defaultCategory = element.document_categories_id;
        this.selectedCategoryId = element.document_categories_id;
      }
    });

    this.lstChildrenMain = [];
    let lstUniqueCategory = (new UniquePipe).transform(this.lookupList.lstDocumentCategory, "parent_category")

    lstUniqueCategory.forEach(element => {

      // loop for Main Parent Categories.
      if (element.category_name == 'Patient Documents') {
        this.lstChildrenMain.push({
          id: element.document_categories_id,
          name: element.category_name,
          children: this.getDocumentNodes(element)
        }
        )
      }

    });
  }

  getDocumentNodes(mainParentElement: any) {

    let lstDiagnosticLabNodes: any[] = [];
    let lstDocumentCategoryNodes: any[] = [];

    lstDiagnosticLabNodes = this.getDiagnosticLabNodes();
    lstDocumentCategoryNodes = this.getNestedChildNode(mainParentElement);

    return lstDiagnosticLabNodes.concat(lstDocumentCategoryNodes);

  }

  getDiagnosticLabNodes() {
    let lstchildren: any[] = [];
    let node: any = {
      name: "Diagnostic Labs",
      id: "lab",
      children: this.getNestedChildNode({ document_categories_id: "lab" })
    }
    lstchildren.push(node);

    return lstchildren;
  }
  getNestedChildNode(element: any) {

    let lstchildren: any[] = [];
    //let lstcatg = this.generalOperation.filterArray(this.lookupList.lstDocumentCategory, "document_categories_id", element.parent_category);
    let lstcatgchild = this.generalOperation.filterArray(this.lookupList.lstDocumentCategory, "parent_category", element.document_categories_id);

    if (lstcatgchild != undefined && lstcatgchild.length > 0)
      lstcatgchild.forEach(child => {
        let node: any = {
          name: child.category_name,
          id: child.document_categories_id,
          children: this.getNestedChildNode(child)
        }
        lstchildren.push(node);
      });

    return lstchildren;
  }

*/

  ngOnInit() {


    this.controlUniqueId = this.callingFrom + "_" + this.patientId;

    debugger;
    this.isLoading = true;


    this.lookupList.lstDocumentCategory.forEach(element => {
      if (element.is_default_category) {
        this.selectedCategoryId = element.document_categories_id;
      }
    });


    if (this.lookupList.lstCategoriesTree == undefined || this.lookupList.lstCategoriesTree.length == 0) {
      this.lookupList.lstCategoriesTree = this.generalOperation.createDocumentCategory(this.lookupList.lstDocumentCategory, true);

    }

    if (this.lookupList.lstCategoriesTreeWithNoLab == undefined || this.lookupList.lstCategoriesTreeWithNoLab.length == 0) {
      this.lookupList.lstCategoriesTreeWithNoLab = this.generalOperation.createDocumentCategory(this.lookupList.lstDocumentCategory, false);
    }

    debugger;

    this.lstTreeCategories = GeneralOperation.copyArrayByValue(this.lookupList.lstCategoriesTree);

    // this.createDocumentCategory();
    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      let lstDocPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
      if (lstDocPath.length > 0) {
        this.downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientDocuments";
        this.uploadPath = lstDocPath[0].download_path + "//" + this.lookupList.practiceInfo.practiceId + "//PatientDocuments"
      }
      else {
        this.downloadPath = '';
        this.uploadPath = '';
      }
    }
    this.getPatientDocuments();
  }


  getPatientDocuments() {
    this.isLoading = true;
    this.patientService.getPatientDocuments(this.patientId, this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lstDocumentsAll = data;
        this.fetchDocumentExtension();

        this.populateDocumentCount();
        this.isLoading = false;

        if (this.selectedCategoryId != undefined) {
          const defaultNode = this.tree.treeModel.getNodeById(this.selectedCategoryId);
          defaultNode.setActiveAndVisible();
          this.OnCategoryActivate(defaultNode);
        }
      },
      error => {
        this.isLoading = false;
        alert(error)
      }
    );
  }




  OnSelectionChanged(doc) {
    this.rowId = doc.patient_document_id;
  }
  selectedAll: any;
  IsSelect(value, doc) {
    this.lstDocumentsFiltered[this.generalOperation.getElementIndex(this.lstDocumentsFiltered, doc)].check_bx = value;
  }
  IsSelectAll(value) {

    debugger;
    for (var i = 0; i < this.lstDocumentsFiltered.length; i++) {
      this.lstDocumentsFiltered[i].check_bx = value;
    }
  }
  testSelected() {
    debugger;
    var i = 0;
    var j = 0;
    for (var a = 0; a < this.lstDocumentsFiltered.length; a++) {
      if (this.lstDocumentsFiltered[a].check_bx == true)
        i = i + 1;
      else
        j = j + 1;

    }
    alert('True: ' + i + 'And False: ' + j)
  }
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };


  openAttachmentDialog(operation, doc) {
    debugger;
    const modalRef = this.ngbModal.open(FileUploadPopupComponent, this.popUpOptions);
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.docCategory = 'PatientDocuments';
    modalRef.componentInstance.operation = operation;
    if (operation == "Edit") {
      modalRef.componentInstance.selectedDocObj = doc;
    }
    let closeResult;

    modalRef.result.then((result) => {
      if (result == true) {
        this.getPatientDocuments();
      }
    }, (reason) => {
    });
  }
  showDoc = false;
  openDocument(document) {

    debugger;
    this.isLoading = true;
    // let ext =document.link.toString().substr(document.link.toString().lastIndexOf(".")+1,document.link.toString().length);

    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = this.downloadPath + "/" + document.link;

    // if(ext=='docx' || ext=='doc')
    // {
    //       window.open('Patient Documents','','width=810,height=600,resizable=1')
    //       window.document.write("<iframe src='"+this.uploadPath+"\\"+document.link+"' width='100%' height='100%' frameborder='0' > </iframe>")
    //       window.focus()
    //       window.close();
    //   return;

    // }
    // if(ext=='doc')
    // {
    //   this.generalService.convertWordToHtml(searchCriteria)
    //   .subscribe(
    //     data => {
    //       debugger;
    //     const modalRef = this.ngbModal.open(DocumentViewerComponent, this.lgPopUpOptions);
    //     modalRef.componentInstance.wordDocData = data;
    //     modalRef.componentInstance.width = '800px';
    //     },
    //     error => alert(error)
    //   );
    //   return;
    // }
    //const modalRef = this.modalService.open(DocumentViewerComponent, this.lgPopupUpOptions);
    // return;
    // let path = this.downloadPath + "/" + document.link;
    // var myWindow = window.open('', '', 'width=810,height=600,resizable=1');
    // myWindow.document.write("<iframe src='" + path + "' width='100%' height='100%' frameborder='0' > </iframe>");
    // myWindow.focus()
    //this.generalService.downloadFile(new ORMKeyValue("file_name",this.downloadPath + "/" + document.link) ).subscribe(


    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.downloafileResponse(data, document.link);
          this.isLoading = false;
        },
        error => {
          alert(error)
          this.isLoading = false;
        }
      );

  }
  doc_path = '';
  downloafileResponse(data, doc_link) {
    // if (data.byteLength <= 0)
    //   return;
    debugger;
    let file_ext: string = doc_link.substring(doc_link.lastIndexOf('.') + 1, doc_link.length);
    let file_type: string = '';
    switch (file_ext.toLowerCase()) {
      case 'png':
        file_type = 'IMAGE/PNG';
        break;
      case 'jpg':
        file_type = 'IMAGE/JPEG';
        break;
      case 'pdf':
        file_type = 'application/pdf';
        break;
      case 'txt':
        file_type = 'text/plain';
        break;
      case 'doc':
        file_type = 'application/msword';
        break;
      case 'docx':
        file_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;

    }
    var file = new Blob([data], { type: file_type });//, {type: 'application/pdf'}
    var fileURL = URL.createObjectURL(file);

    let path = fileURL;
    // var myWindow = window.open('', '', 'width=810,height=600,resizable=1');
    // myWindow.document.title = "new title";
    // myWindow.document.write("<title>IHC Document Viewer</title><iframe  src='" + path + "' width='100%' height='100%' frameborder='0' > </iframe>");
    // myWindow.focus()



    this.doc_path = path;
    //this.current_url=this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc_path)
    //this.getLink();
    const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = path;
    modalRef.componentInstance.width = '800px';

    // this.req_document=data;
    // String encodedImage = Base64.encode(res);

  }
  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };
  /*
  current_url: SafeUrl;
  urlCache = new Map<string, SafeResourceUrl>();
  getLink(): SafeResourceUrl {
    debugger;
    var url = this.urlCache.get(this.doc_path);
    if (!url) {
      url = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.doc_path);
      this.urlCache.set("41", url);
    }
    return url;
  }
  */
  /*
  navigateBackToMain() {
    this.showDoc = false;
  }
  */
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
  };
  onDelete(doc) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.logoutScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = doc.patient_document_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;


        this.patientService.deletePatientDocument(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data, doc),
            error => alert(error),
            () => this.logMessage.log("delete Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(result, element) {
    if (result > 0) {


      var index = this.generalOperation.getElementIndex(this.lstDocumentsFiltered, element);
      if (index > -1) {
        this.lstDocumentsFiltered.splice(index, 1);
      }

      var index = this.generalOperation.getElementIndex(this.lstDocumentsAll, element);
      if (index > -1) {

        this.lstDocumentsAll.splice(index, 1);
      }

      this.populateDocumentCount();

    }
  }


  public logEvent(e): void {
    debugger;
    //console.log(e);
  }
  OnCategoryActivate(node: any) {
    debugger;
    this.isLoading = true;
    this.lstDocumentsFiltered = [];
    /*
    if (e.node.data.children != undefined && e.node.data.children.length > 0) {
      let selectedCatId = e.node.data.children[0].id;
      const selectedNode = this.tree.treeModel.getNodeById(selectedCatId);
      selectedNode.setActiveAndVisible();
    }
    */
    this.selectedNode = node;
    this.selectedCategoryId = node.data.id;

    if (node.data.name == "Patient Documents") {
      this.lstDocumentsFiltered = this.generalOperation.filterArray(this.lstDocumentsAll, "doc_categories_id", 'all');
    }
    else {
      this.lstDocumentsFiltered = this.getChildNodeDocuments(node);
    }
    /*
        else if (node.data.id == "lab") {
    
          //this.lstDocumentsFiltered = this.generalOperation.filterArray(this.lstDocumentsAll, "doc_type", 'lab');
    
          this.lstDocumentsFiltered = this.getChildNodeDocuments(node);
          // const someNode = this.tree.treeModel.getNodeById("lab");
          // someNode.expand();
          // if(someNode.data.children.length>0)
          // {
          //   const defaultNode = this.tree.treeModel.getNodeById(someNode.data.children[0].id);
          //   defaultNode.setActiveAndVisible();
          //   this.OnCategoryActivate(defaultNode);
          // }
        }
        else {
    
          let selectednodeDetail = this.generalOperation.filterArray(this.lookupList.lstDocumentCategory, "parent_category", node.data.id);
          let parent_doc_Catg_id;
          if (selectednodeDetail != null && selectednodeDetail.length > 1) {
            //   const someNode = this.tree.treeModel.getNodeById(node.data.id);
            //   someNode.expand();
    
            // if(someNode.data.children.length>0)
            // {
            //   const defaultNode = this.tree.treeModel.getNodeById(someNode.data.children[0].id);
            //   defaultNode.setActiveAndVisible();
            //   this.OnCategoryActivate(defaultNode);
            // }
            for (let i = 0; i < selectednodeDetail.length; i++) {
              for (let j = 0; j < this.lstDocumentsAll.length; j++) {
                if (selectednodeDetail[i].document_categories_id == this.lstDocumentsAll[j].doc_categories_id) {
                  this.lstDocumentsFiltered.push(this.lstDocumentsAll[j]);
    
                }
              }
            }
    
          }
          else {
            this.lstDocumentsFiltered = this.generalOperation.filterArray(this.lstDocumentsAll, "doc_categories_id", node.data.id);
          }
          
    
        }
        */
    this.isLoading = false;
  }

  scanDocument() {

    let filterObj: any = { parent_category: "lab" };
    let categoriesList = new ListFilterGeneralNotIn().transform(this.lookupList.lstDocumentCategory, filterObj);

    const modalRef = this.ngbModal.open(DwtComponent, this.lgPopUpOptions);

    //modalRef.componentInstance.docType = "patient_document";
    //modalRef.componentInstance.lstCategories = categoriesList;
    modalRef.componentInstance.docType = ScanDocumentType.PATIENT_DOCUMENT;
    modalRef.componentInstance.patientId = this.patientId;
    modalRef.componentInstance.docCateogryId = this.selectedCategoryId;
    //modalRef.componentInstance.data = data;       

    //let closeResult;
    //let reader = new FileReader();
    modalRef.result.then((result) => {

      debugger;
      if (result != undefined && result.status == ServiceResponseStatusEnum.SUCCESS) {
        this.selectedCategoryId = result.categoryId;
        this.getPatientDocuments();


      }
    }
      , (reason) => {

        //alert(reason);
      });

  }



  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;

  onSort(sortEvent: SortEvent) {

    this.sortEvent = sortEvent;

    this.search();
  }

  private search() {
    debugger;
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstDocumentsFiltered, this.headers, this.sortEvent, null, null, '');
    this.lstDocumentsFiltered = sortFilterPaginationResult.list;

    if (this.lstDocumentsFiltered != null && this.lstDocumentsFiltered.length > 0) {
      this.OnSelectionChanged(this.lstDocumentsFiltered[0]);
    }

  }
  //showFax=false;
  onFax() {
    debugger;

    if (this.populateFaxAttachmentList() == true) {

      const modalRef = this.ngbModal.open(NewFaxComponent, this.lgPopUpOptions);

      modalRef.componentInstance.title = "Send Fax";
      modalRef.componentInstance.lstAttachments = this.lstFaxAttachments;
      modalRef.componentInstance.callingFrom = "documents";
      modalRef.componentInstance.operation = "new_fax";
      modalRef.componentInstance.faxParam = undefined;

      modalRef.result.then((result) => {
        if (result) {

        }
      }, (reason) => {

      });
    }

  }
  /*
  updateSrc(url) {
    this.current_url=this.domSanitizer.bypassSecurityTrustResourceUrl(url)
  }
  */
  /*
  navigateBackFromFax(){    
    this.showDoc=false;
  }
  */
  removeCateg() {
    debugger;
    if (this.selectedNode.data.name.toLowerCase() == "patient documents") {
      alert("Sorry, you can't delete main Category.");
      return;
    }
    if (this.selectedNode.index >= 0) {
      const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.logoutScreenOptions);
      modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
      modalRef.componentInstance.promptMessage = 'Do you want to delete selected Category ?';
      modalRef.componentInstance.alertType = 'danger';
      let closeResult;

      modalRef.result.then((result) => {
        debugger;
        if (result == PromptResponseEnum.YES) {
          let delRecordData = new ORMSaveDocCategory();

          delRecordData.document_categories_id = this.selectedNode.data.id;
          delRecordData.category_name = "";
          delRecordData.parent_category = this.lookupList.logedInUser.systemIp;
          delRecordData.practice_id = this.lookupList.practiceInfo.practiceId.toString();
          delRecordData.category_order = "";
          delRecordData.is_default_category = null;
          delRecordData.deleted = "false";
          delRecordData.date_created = this.dateTimeUtil.getCurrentDateTimeString();
          delRecordData.created_user = this.lookupList.logedInUser.user_name;
          delRecordData.date_modified = this.dateTimeUtil.getCurrentDateTimeString();
          delRecordData.modified_user = this.lookupList.logedInUser.user_name;
          delRecordData.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
          delRecordData.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();



          //let deleteRecordData = new ORMDeleteRecord();
          //deleteRecordData.column_id = this.selectedNode.data.id;
          //deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
          //deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
          //deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;
          //this.patientService.deleteDocumentCategory(deleteRecordData)
          this.patientService.deleteDocumentCategory(delRecordData)
            .subscribe(
              data => {
                debugger;
                if (data == 0) {
                  alert("Sorry, you can't delete because Document exsist against this Category.");
                  return;
                }
                if (data == 1) {
                  alert("Category has been removed successfully.");
                  this.onDeleteCategorySuccessfully(data, this.selectedNode);
                  this.getDocumentCategories();
                }
              },
              error => {
                this.logMessage.log("delete Successfull.")
              }
            );
        }
      }, (reason) => {
        //alert(reason);
      });
    } else {
      alert("Please select the Document Category first.");
      return;
    }
  }
  onDeleteCategorySuccessfully(result, element) {
    debugger;
  }
  modifyCateg() {

    debugger;
    if (this.selectedNode.data.name == 'Diagnostic Labs') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Document Category Edit', 'Sorry, you can`t edit this category.', 'warning');
      return;
    }
    else if (this.selectedNode.parent.data.name == "Diagnostic Labs") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Document Category Edit', 'Sorry, you can`t edit this category.', 'warning');
      return;
    }
    const modalRef = this.ngbModal.open(AddDocumentsCategoryComponent, this.popUpOptions);
    modalRef.componentInstance.patientID = this.patientId;
    //modalRef.componentInstance.parentCategory = this.selectedNode.parent.data.name;
    modalRef.componentInstance.parentCategoryID = this.selectedNode.parent.data.id;//parent category id

    if (this.selectedNode.data.children.length > 0) {
      //this.selectedNode.data.id;
    }
    modalRef.componentInstance.editCategoryID = this.selectedNode.data.id;
    modalRef.componentInstance.editCategoryName = this.selectedNode.data.name;
    modalRef.componentInstance.isDefaultCategory = "";
    modalRef.componentInstance.isEdit = "true";
    modalRef.result.then((result) => {
      this.getDocumentCategories();
    }
      , (reason) => {
        //alert(reason);
      });
  }
  addNewCateg() {
    debugger;
    let parent_doc_Catg_id = '';
    if (this.selectedNode.data.name == 'Diagnostic Labs') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Document Category Add', 'Sorry, you can`t add sub category here.', 'warning');
      return;
    }
    let selectednodeDetail = this.generalOperation.filterArray(this.lookupList.lstDocumentCategory, "document_categories_id", this.selectedNode.data.id);
    if (selectednodeDetail != null && selectednodeDetail.length > 0) {
      if (selectednodeDetail[0].parent_category == "lab") {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Document Category Add', 'Sorry, you can`t add sub category here.', 'warning');
        return;
      }
      parent_doc_Catg_id = selectednodeDetail[0].parent_category;
    }
    selectednodeDetail = this.generalOperation.filterArray(this.lookupList.lstDocumentCategory, "parent_category", this.selectedNode.data.id);
    if (selectednodeDetail != null && selectednodeDetail.length > 0) {
      parent_doc_Catg_id = this.selectedNode.data.id;
    }
    else {
      parent_doc_Catg_id = selectednodeDetail[0].document_categories_id;
    }


    const modalRef = this.ngbModal.open(AddDocumentsCategoryComponent, this.popUpOptions);
    modalRef.componentInstance.patientID = this.patientId;
    modalRef.componentInstance.parentCategoryID = parent_doc_Catg_id;
    // modalRef.componentInstance.parentCategoryID = this.selectedNode.parent.data.id;//parent category id
    modalRef.componentInstance.editCategoryID = this.selectedNode.data.id;
    modalRef.componentInstance.editCategoryName = this.selectedNode.data.name;
    modalRef.componentInstance.isDefaultCategory = "";
    modalRef.componentInstance.isEdit = "false";

    modalRef.result.then((result) => {
      this.getDocumentCategories();
    }
      , (reason) => {
        //alert(reason);
      });
  }
  getDocumentCategories() {
    //getDocCategories
    this.generalService.getDocCategories(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.lstDocumentCategory = data as Array<any>;
        this.lookupList.lstCategoriesTree = this.generalOperation.createDocumentCategory(this.lookupList.lstDocumentCategory, true);
        this.lookupList.lstCategoriesTreeWithNoLab = this.generalOperation.createDocumentCategory(this.lookupList.lstDocumentCategory, false);

      },
      error => {
        this.logMessage.log("getDocumentCategories:" + error);
      }
    );
  }
  onDownload(document) {
    debugger;
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = this.downloadPath + "/" + document.link;
    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.isLoading = false;
          this.downloafile(data, document.link, document.name);
        },
        error => {
          alert(error);
          this.isLoading = false;
        }
      );

  }
  downloafile(data, doc_link, name) {

    let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
    let file_type: string = '';
    switch (file_ext.toLowerCase()) {
      case 'png':
        file_type = 'IMAGE/PNG';
        break;
      case 'jpg':
        file_type = 'IMAGE/JPEG';
        break;
      case 'pdf':
        file_type = 'application/pdf';
        break;
      case 'txt':
        file_type = 'text/plain';
        break;
    }
    var fileURL;
    var file = new Blob([data], { type: file_type });
    FileSaver.saveAs(file, name + "." + file_ext);
  }

  onDocumentSelectionCallBackOK() {
    if (this.populateFaxAttachmentList() == true) {
      this.onDocumentSelectionCallBack.emit(this.lstFaxAttachments);
    }
  }

  lstFaxAttachments: Array<any> = new Array<any>();
  populateFaxAttachmentList(): boolean {

    let isInvalidFormatSelected: boolean = false;
    this.lstFaxAttachments = new Array<any>();
    if (this.lstDocumentsFiltered != undefined && this.lstDocumentsFiltered.length > 0) {
      for (var d = 0; d < this.lstDocumentsFiltered.length; d++) {
        if (this.lstDocumentsFiltered[d].check_bx == true) {

          var ext: string = this.lstDocumentsFiltered[d].link.substr(this.lstDocumentsFiltered[d].link.lastIndexOf('.') + 1);

          if (ext == "pdf" || ext == "txt") {

            let sendFaxAttachmentsFromClient: SendFaxAttachmentsFromClient = new SendFaxAttachmentsFromClient()

            sendFaxAttachmentsFromClient.patient_document_id = this.lstDocumentsFiltered[d].patient_document_id;
            sendFaxAttachmentsFromClient.document_name = this.lstDocumentsFiltered[d].name;
            sendFaxAttachmentsFromClient.document_link = this.lstDocumentsFiltered[d].link;
            sendFaxAttachmentsFromClient.document_source = FaxAttachemntsTypeEnum.REFERENCED_DOCUMENT;
            sendFaxAttachmentsFromClient.read_only = false;// true
            this.lstFaxAttachments.push(sendFaxAttachmentsFromClient);

          }
          else {
            isInvalidFormatSelected = true;
            break;
          }

        }
      }
    }

    if (isInvalidFormatSelected) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Send Fax', "Only .pdf and .txt files are supported for Fax.", AlertTypeEnum.DANGER)
      return false;
    }
    else if (this.lstFaxAttachments == undefined || this.lstFaxAttachments.length == 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Send Fax', "Please select atleast one document to fax.", AlertTypeEnum.DANGER)
      return false;
    }



    return true;
  }

  fetchDocumentExtension() {

    if (this.lstDocumentsAll != undefined) {
      this.lstDocumentsAll.forEach(doc => {
        doc.ext = this.getFileExtension(doc.link);
      });

    }
  }

  getFileExtension(fileName: string) {


    let fileExtension: string = '';
    if (fileName != undefined && fileName != null) {
      if (fileName.includes('.')) {
        fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1));
      }
      //console.log(fileExtension);
    }
    //console.log(fileName + "==>" + fileExtension);
    return fileExtension.toLowerCase();
  }

  populateDocumentCount() {

    if (this.lstTreeCategories != undefined) {

      this.lstTreeCategories.forEach(node => {

        // parent category
        if (node.name == 'Patient Documents') {
          node.count = this.lstDocumentsAll.length;

          if (node.children != undefined) {
            node.children.forEach(child => {
              this.pupulateChildNodeCount(child);
            });
          }

        }

      });

      debugger;
    }

  }

  pupulateChildNodeCount(node: DocumentTreeModel): number {

    let catId: string = node.id.toString();
    let arr: Array<any> = this.generalOperation.filterArray(this.lstDocumentsAll, "doc_categories_id", catId);

    let childeCount: number = 0;
    let count: number = 0;

    if (arr != undefined) {
      count = arr.length;
    }

    if (node.children != undefined) {
      node.children.forEach(child => {
        childeCount += this.pupulateChildNodeCount(child);

      });
    }

    count = count + childeCount
    node.count = count;

    return count;

  }

  getChildNodeDocuments(node: DocumentTreeModel) {

    debugger;
    let lstDoc: Array<any> = [];

    let catId: string = node.id.toString();
    let arr: Array<any> = this.generalOperation.filterArray(this.lstDocumentsAll, "doc_categories_id", catId);

    let lstChildDoc: Array<any> = [];


    if (arr != undefined) {
      lstDoc = lstDoc.concat(arr);
    }

    if (node.children != undefined) {
      node.children.forEach(child => {
        lstChildDoc = lstChildDoc.concat(this.getChildNodeDocuments(child));

      });
    }
    lstDoc = lstDoc.concat(lstChildDoc);
    return lstDoc;

  }
}

