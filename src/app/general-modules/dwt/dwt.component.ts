/// <reference types="dwt" />
/// <reference types="dwt/addon.pdf" />

import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppConfig, APP_CONFIG } from 'src/app/providers/app-config.module';
import { ScanDocumentData } from 'src/app/models/general/scan-document-data';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { AuthService } from 'src/app/authentication/auth-service';
import { AlertTypeEnum, ServiceResponseStatusEnum, ScanDocumentType } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { TreeComponent } from 'angular-tree-component';

@Component({
  selector: 'dwt',
  templateUrl: './dwt.component.html',
  styleUrls: ['./dwt.component.css']
})
export class DwtComponent implements OnInit {



  @Input() docType: string;// = "patient_document";
  @Input() patientId: number;
  @Input() patientInsuranceId: number;
  @Input() docCateogryId: number;


  @ViewChild('tree') tree: TreeComponent;
  lstTreeCategoriesMain: Array<any>;

  DWObject: WebTwain;
  uploadUrl: string;
  //httpServer = location.hostname;
  //httpPort = 4200;

  re: RegExp = /^\d+$/;
  DWTSourceCount: number;
  EnumDWT_ConvertMode: any;
  _iLeft = 0;
  _iTop = 0;
  _iRight = 0;
  _iBottom = 0;
  //_strTempStr;

  docName;
  docDateModel;


  disalbeFeilds: Boolean;
  isDuplex: boolean = false;

  docCategoryOptions = [{ animateExpand: true },
  { animateSpeed: 10 }]
  node = [

  ];



  constructor(public activeModal: NgbActiveModal,
    private calendar: NgbCalendar,
    @Inject(APP_CONFIG) private config: AppConfig,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil: DateTimeUtil,
    private authService: AuthService,
    private ngbModal: NgbModal,
    private generalOperation: GeneralOperation) {

    debugger;
  }

  ngAfterViewInit() {
    //this.tree.treeModel.exp

    if (this.tree != undefined) {
      const root = this.tree.treeModel.getFirstRoot()
      root.expand();


      debugger;
      const defaultNode = this.tree.treeModel.getNodeById(this.docCateogryId);
      if(defaultNode!=undefined){
        defaultNode.setActiveAndVisible();
      }
      else{
        this.docCateogryId = 0;
      }
    }

  }


  ngOnInit() {
    debugger;



    if (this.lookupList.lstCategoriesTreeWithNoLab == undefined || this.lookupList.lstCategoriesTreeWithNoLab.length == 0) {
      this.lookupList.lstCategoriesTreeWithNoLab = this.generalOperation.createDocumentCategory(this.lookupList.lstDocumentCategory, false);
    }



    //this.createDocumentCategory();

    // unload if already loaded;
    try {
      Dynamsoft.WebTwainEnv.Unload();
    } catch (error) {
      //console.log(error);

    }

    Dynamsoft.WebTwainEnv.Load();
    Dynamsoft.WebTwainEnv.RegisterEvent("OnWebTwainReady", () => { this.Dynamsoft_OnReady() });
    /*
    let strhttp = "http://";
    if ("https:" == document.location.protocol)
      strhttp = "https://";      
    this.uploadUrl = strhttp + this.httpServer + ":" + this.httpPort + "/upload";
    */
    //let strhttp = "http://";
    //if ("https:" == document.location.protocol)
    //      strhttp = "https://";
    //this.uploadUrl = strhttp + this.httpServer + ":" + this.httpPort + "/upload";
    this.uploadUrl = this.config.apiEndpoint + "general/uploadScan";

    this.docDateModel = this.calendar.getToday();

    switch (this.docType) {
      case "id_card":
        this.disalbeFeilds = true;
        this.docName = "ID Card"
        break;
      case "driving_license":
        this.disalbeFeilds = true;
        this.docName = "Driving License"
        break;
      case "patient_agreement":
        this.disalbeFeilds = true;
        this.docName = "Patient Agreement"
        break;
      case "primary_insurance":
        this.disalbeFeilds = true;
        this.docName = "Primary Insurance Card"
        break;
      case "secondary_insurance":
        this.disalbeFeilds = true;
        this.docName = "Secondary Insurance Card"
        break;
      case "other_insurance":
        this.disalbeFeilds = true;
        this.docName = "Other Insurance Card"
        break;
      case "patient_document":
        this.disalbeFeilds = false;
        this.docName = "";
        break;
        break;
    }

  }

  /**
   * main entry for initializing dwt related settings
   */
  Dynamsoft_OnReady(): void {
    debugger;
    if (typeof (EnumDWT_ConvertMode) != "undefined") {
      this.EnumDWT_ConvertMode = EnumDWT_ConvertMode;
    }
    else if (typeof (EnumDWT_ConverMode) != "undefined") {
      this.EnumDWT_ConvertMode = EnumDWT_ConverMode;
    }
    let liNoScanner = document.getElementById("pNoScanner");
    this.DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer');
    // If the ErrorCode is 0, it means everything is fine for the control. It is fully loaded.
    if (this.DWObject) {
      if (this.DWObject.ErrorCode == 0) {
        this.DWObject.LogLevel = 0;
        this.DWObject.IfAllowLocalCache = true;
        this.DWObject.ImageCaptureDriverType = 3;
        this.DWObject.RegisterEvent("OnMouseClick", this.Dynamsoft_OnMouseClick);
        this.DWObject.RegisterEvent("OnTopImageInTheViewChanged", this.Dynamsoft_OnTopImageInTheViewChanged);
        let twainsource = <HTMLSelectElement>document.getElementById("source");
        if (!twainsource) {
          twainsource = <HTMLSelectElement>document.getElementById("webcamsource");
        }

        let vCount = this.DWObject.SourceCount;
        this.DWTSourceCount = vCount;
        let vTWAINCount = 0;

        if (twainsource) {
          twainsource.options.length = 0;
          for (let i = 0; i < vCount; i++) {
            if (Dynamsoft.Lib.env.bMac) {
              twainsource.options.add(new Option("ICA_" + this.DWObject.GetSourceNameItems(i), i.toString()));
            }
            else {
              twainsource.options.add(new Option(this.DWObject.GetSourceNameItems(i), i.toString()));
            }
          }

          if (Dynamsoft.Lib.env.bMac) {
            this.DWObject.CloseSourceManager();
            this.DWObject.ImageCaptureDriverType = 0;
            this.DWObject.OpenSourceManager();
            vTWAINCount = this.DWObject.SourceCount;

            for (let j = vCount; j < vCount + vTWAINCount; j++) {
              twainsource.options.add(new Option(this.DWObject.GetSourceNameItems(j - vCount), j.toString()));
            }
          }
        }

        // If source list need to be displayed, fill in the source items.
        if ((vCount + vTWAINCount) == 0) {
          if (liNoScanner) {
            if (Dynamsoft.Lib.env.bWin) {

              liNoScanner.style.display = "block";
              liNoScanner.style.textAlign = "center";
            }
            else
              liNoScanner.style.display = "none";
          }
        }

        if ((vCount + vTWAINCount) > 0) {
          this.source_onchange();
        }

        if (Dynamsoft.Lib.env.bWin)
          this.DWObject.MouseShape = false;

        let btnScan = <HTMLInputElement>document.getElementById("btnScan");
        if (btnScan) {
          if ((vCount + vTWAINCount) == 0)
            btnScan.disabled = true;
          else {
            btnScan.disabled = false;
            btnScan.style.color = "#fff";
            btnScan.style.backgroundColor = "#50a8e1";
            btnScan.style.cursor = "pointer";
          }
        }

        /*
        if (!Dynamsoft.Lib.env.bWin && vCount > 0) {
          if (document.getElementById("lblShowUI"))
            document.getElementById("lblShowUI").style.display = "none";
          if (document.getElementById("ShowUI"))
            document.getElementById("ShowUI").style.display = "none";
        }
        else {
          if (document.getElementById("lblShowUI"))
            document.getElementById("lblShowUI").style.display = "";
          if (document.getElementById("ShowUI"))
            document.getElementById("ShowUI").style.display = "";
        }
        */

        this.initDllForChangeImageSize();

        for (let i = 0; i < document.links.length; i++) {
          if (document.links[i].className == "ShowtblLoadImage") {
            document.links[i].onclick = this.showtblLoadImage_onclick;
          }
          if (document.links[i].className == "ClosetblLoadImage") {
            document.links[i].onclick = this.closetblLoadImage_onclick;
          }
        }
        if ((vCount + vTWAINCount) == 0) {
          if (Dynamsoft.Lib.env.bWin) {

            if (document.getElementById("aNoScanner") && window['bDWTOnlineDemo']) {
              if (document.getElementById("div_ScanImage").style.display == "")
                this.showtblLoadImage_onclick();
            }
          }

        }
        else {
          let divBlank = document.getElementById("divBlank");
          if (divBlank)
            divBlank.style.display = "none";
        }
        this.updatePageInfo();

        this.DWObject.RegisterEvent("OnPostTransfer", this.Dynamsoft_OnPostTransfer);
        this.DWObject.RegisterEvent("OnPostLoad", this.Dynamsoft_OnPostLoadfunction);
        this.DWObject.RegisterEvent("OnPostAllTransfers", this.Dynamsoft_OnPostAllTransfers);
        this.DWObject.RegisterEvent("OnImageAreaSelected", this.Dynamsoft_OnImageAreaSelected);
        this.DWObject.RegisterEvent("OnImageAreaDeSelected", this.Dynamsoft_OnImageAreaDeselected);
        this.DWObject.RegisterEvent("OnGetFilePath", this.Dynamsoft_OnGetFilePath);
      }
    }
  }
  /**
   * events for page elements
   */
  source_onchange(): void {
    if (document.getElementById("divTwainType"))
      document.getElementById("divTwainType").style.display = "";
    if (document.getElementById("source")) {
      let cIndex = (<HTMLSelectElement>document.getElementById("source")).selectedIndex;
      if (Dynamsoft.Lib.env.bMac) {
        if (cIndex >= this.DWTSourceCount) {
          if (document.getElementById("lblShowUI"))
            document.getElementById("lblShowUI").style.display = "";
          if (document.getElementById("ShowUI"))
            document.getElementById("ShowUI").style.display = "";
        } else {
          if (document.getElementById("lblShowUI"))
            document.getElementById("lblShowUI").style.display = "none";
          if (document.getElementById("ShowUI"))
            document.getElementById("ShowUI").style.display = "none";
        }
      }
      else
        if (this.DWObject)
          this.DWObject.SelectSourceByIndex(cIndex);
    }
  }
  initDllForChangeImageSize(): void {
    let vInterpolationMethod = <HTMLSelectElement>document.getElementById("InterpolationMethod");
    vInterpolationMethod.options.length = 0;
    vInterpolationMethod.options.add(new Option("NearestNeighbor", "1"));
    vInterpolationMethod.options.add(new Option("Bilinear", "2"));
    vInterpolationMethod.options.add(new Option("Bicubic", "3"));
  }
  showtblLoadImage_onclick(): boolean {
    switch (document.getElementById("tblLoadImage").style.visibility) {
      case "hidden": document.getElementById("tblLoadImage").style.visibility = "visible";
        document.getElementById("Resolution").style.visibility = "hidden";
        break;
      case "visible":
        document.getElementById("tblLoadImage").style.visibility = "hidden";
        document.getElementById("Resolution").style.visibility = "visible";
        break;
      default: break;
    }
    return false;
  }
  closetblLoadImage_onclick(): boolean {
    document.getElementById("tblLoadImage").style.visibility = "hidden";
    document.getElementById("Resolution").style.visibility = "visible";
    return false;
  }

  /**
   * Acquire Image
   */
  acquireImage(): void {
    let cIndex = (<HTMLSelectElement>document.getElementById("source")).selectedIndex;
    if (cIndex < 0)
      return;
    if (Dynamsoft.Lib.env.bMac) {
      this.DWObject.CloseSourceManager();
      this.DWObject.ImageCaptureDriverType = 3;
      this.DWObject.OpenSourceManager();
      if (cIndex >= this.DWTSourceCount) {
        cIndex = cIndex - this.DWTSourceCount;
        this.DWObject.CloseSourceManager();
        this.DWObject.ImageCaptureDriverType = 0;
        this.DWObject.OpenSourceManager();
      }
    }

    this.DWObject.SelectSourceByIndex(cIndex);
    this.DWObject.CloseSource();
    this.DWObject.OpenSource();
    this.DWObject.IfShowUI = false;// (<HTMLInputElement>document.getElementById("ShowUI")).checked;

    this.DWObject.PixelType = EnumDWT_PixelType.TWPT_RGB;


    this.DWObject.IfFeederEnabled = true;//bADFChecked;
    this.DWObject.IfDuplexEnabled = this.isDuplex;//false;// bDuplexChecked;
    this.DWObject.Resolution = 200;
    this.DWObject.IfDisableSourceAfterAcquire = true;
    this.DWObject.AcquireImage();
  }

  /**
   * edit features
   */
  btnShowImageEditor_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.ShowImageEditor();
  }
  btnRotateRight_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.RotateRight(this.DWObject.CurrentImageIndexInBuffer);
    if (this.checkErrorString()) {
      return;
    }
  }
  btnRotateLeft_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.RotateLeft(this.DWObject.CurrentImageIndexInBuffer);
    if (this.checkErrorString()) {
      return;
    }
  }
  btnRotate180_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.Rotate(this.DWObject.CurrentImageIndexInBuffer, 180, true);
    if (this.checkErrorString()) {
      return;
    }
  }
  btnMirror_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.Mirror(this.DWObject.CurrentImageIndexInBuffer);
    if (this.checkErrorString()) {
      return;
    }
  }
  btnFlip_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.Flip(this.DWObject.CurrentImageIndexInBuffer);
    if (this.checkErrorString()) {
      return;
    }
  }
  btnCrop_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    if (this._iLeft != 0 || this._iTop != 0 || this._iRight != 0 || this._iBottom != 0) {
      this.DWObject.Crop(
        this.DWObject.CurrentImageIndexInBuffer,
        this._iLeft, this._iTop, this._iRight, this._iBottom
      );
      this._iLeft = 0;
      this._iTop = 0;
      this._iRight = 0;
      this._iBottom = 0;
      if (this.checkErrorString()) {
        return;
      }
      return;
    } else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Scan', "<strong>Crop: </strong>failed. Please first select the area you'd like to crop.", AlertTypeEnum.WARNING);
      //alert("<strong>Crop: </strong>failed. Please first select the area you'd like to crop.");      
    }
  }
  btnChangeImageSize_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    switch (document.getElementById("ImgSizeEditor").style.visibility) {
      case "visible": document.getElementById("ImgSizeEditor").style.visibility = "hidden"; break;
      case "hidden": document.getElementById("ImgSizeEditor").style.visibility = "visible"; break;
      default: break;
    }
    let iWidth = this.DWObject.GetImageWidth(this.DWObject.CurrentImageIndexInBuffer);
    if (iWidth != -1)
      (<HTMLInputElement>document.getElementById("img_width")).value = iWidth.toString();
    let iHeight = this.DWObject.GetImageHeight(this.DWObject.CurrentImageIndexInBuffer);
    if (iHeight != -1)
      (<HTMLInputElement>document.getElementById("img_height")).value = iHeight.toString();
  }
  btnCancelChange_onclick(): void {
    document.getElementById("ImgSizeEditor").style.visibility = "hidden";
  }
  btnChangeImageSizeOK_onclick(): void {
    document.getElementById("img_height").className = "";
    document.getElementById("img_width").className = "";
    if (!this.re.test((<HTMLInputElement>document.getElementById("img_height")).value)) {
      document.getElementById("img_height").className += " invalid";
      document.getElementById("img_height").focus();
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Scan', "Please input a valid <strong>height</strong>.", AlertTypeEnum.WARNING);
      //alert("Please input a valid <strong>height</strong>.");      
      return;
    }
    if (!this.re.test((<HTMLInputElement>document.getElementById("img_width")).value)) {
      document.getElementById("img_width").className += " invalid";
      document.getElementById("img_width").focus();
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Scan', "Please input a valid <strong>width</strong>.<br />", AlertTypeEnum.WARNING);
      //alert("Please input a valid <strong>width</strong>.<br />")      
      return;
    }
    this.DWObject.ChangeImageSize(
      this.DWObject.CurrentImageIndexInBuffer,
      parseInt((<HTMLInputElement>document.getElementById("img_width")).value),
      parseInt((<HTMLInputElement>document.getElementById("img_height")).value),
      (<HTMLSelectElement>document.getElementById("InterpolationMethod")).selectedIndex + 1
    );
    if (this.checkErrorString()) {
      document.getElementById("ImgSizeEditor").style.visibility = "hidden";
      return;
    }
  }
  /** 
   * navigation
   */
  btnFirstImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.CurrentImageIndexInBuffer = 0;
    this.updatePageInfo();
  }

  btnPreImage_wheel(): void {
    if (this.DWObject.HowManyImagesInBuffer != 0)
      this.btnPreImage_onclick()
  }

  btnNextImage_wheel(): void {
    if (this.DWObject.HowManyImagesInBuffer != 0)
      this.btnNextImage_onclick()
  }

  btnPreImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    else if (this.DWObject.CurrentImageIndexInBuffer == 0) {
      return;
    }
    this.DWObject.CurrentImageIndexInBuffer = this.DWObject.CurrentImageIndexInBuffer - 1;
    this.updatePageInfo();
  }
  btnNextImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    else if (this.DWObject.CurrentImageIndexInBuffer == this.DWObject.HowManyImagesInBuffer - 1) {
      return;
    }
    this.DWObject.CurrentImageIndexInBuffer = this.DWObject.CurrentImageIndexInBuffer + 1;
    this.updatePageInfo();
  }
  btnLastImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.CurrentImageIndexInBuffer = this.DWObject.HowManyImagesInBuffer - 1;
    this.updatePageInfo();
  }
  btnRemoveCurrentImage_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.RemoveAllSelectedImages();
    if (this.DWObject.HowManyImagesInBuffer == 0) {
      (<HTMLInputElement>document.getElementById("DW_TotalImage")).value = this.DWObject.HowManyImagesInBuffer.toString();
      (<HTMLInputElement>document.getElementById("DW_CurrentImage")).value = "";
      return;
    }
    else {
      this.updatePageInfo();
    }
  }
  btnRemoveAllImages_onclick(): void {
    if (!this.checkIfImagesInBuffer()) {
      return;
    }
    this.DWObject.RemoveAllImages();
    (<HTMLInputElement>document.getElementById("DW_TotalImage")).value = "0";
    (<HTMLInputElement>document.getElementById("DW_CurrentImage")).value = "";
  }
  setlPreviewMode(): void {
    let varNum: number = (<HTMLSelectElement>document.getElementById("DW_PreviewMode")).selectedIndex + 1;
    let btnCrop = <HTMLImageElement>document.getElementById("btnCrop");
    if (btnCrop) {
      let tmpstr = btnCrop.src;
      if (varNum > 1) {
        tmpstr = tmpstr.replace('Crop.', 'Crop_gray.');
        btnCrop.src = tmpstr;
        btnCrop.onclick = () => { };
      }
      else {
        tmpstr = tmpstr.replace('Crop_gray.', 'Crop.');
        btnCrop.src = tmpstr;
        btnCrop.onclick = () => { this.btnCrop_onclick(); };
      }
    }

    this.DWObject.SetViewMode(varNum, varNum);
    if (Dynamsoft.Lib.env.bMac || Dynamsoft.Lib.env.bLinux) {
      return;
    }
    else if ((<HTMLSelectElement>document.getElementById("DW_PreviewMode")).selectedIndex != 0) {
      this.DWObject.MouseShape = true;
    }
    else {
      this.DWObject.MouseShape = false;
    }
  }

  /**
   * upload
   */
  upload(): void {
    debugger;
    if (!this.checkIfImagesInBuffer()) {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Scan', "No Scan Document found to upload.", AlertTypeEnum.DANGER);
      //alert("No Scan Document found to upload.");
      return;
    }
    if (this.docType == ScanDocumentType.PATIENT_DOCUMENT) {
      if (this.docCateogryId == undefined || this.docCateogryId <= 0) {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Scan', "Please select category.", AlertTypeEnum.DANGER);
        return
      }
    }



    let i, strHTTPServer, strActionPage, strImageType;

    let _txtFileName = <HTMLInputElement>document.getElementById("txt_fileName");

    if (_txtFileName)
      _txtFileName.className = "";

    let fileName = _txtFileName.value;
    let replaceStr = "<";
    fileName = fileName.replace(new RegExp(replaceStr, 'gm'), '&lt;');

    if (fileName == undefined || fileName == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Scan', "Please enter document name.", AlertTypeEnum.DANGER);
      return
    }
    let uploadfilename = fileName + ".pdf";

    let _aryIndicesToUpload = [];

    let _EnumDWT_ImageTypeToUpload = EnumDWT_ImageType.IT_PDF;
    if ((this.DWObject.SelectedImagesCount == 1) || (this.DWObject.SelectedImagesCount == this.DWObject.HowManyImagesInBuffer)) {
      for (let i = 0; i < this.DWObject.HowManyImagesInBuffer; i++)
        _aryIndicesToUpload.push(i);
    }
    else {
      for (let i = 0; i < this.DWObject.SelectedImagesCount; i++)
        _aryIndicesToUpload.push(this.DWObject.GetSelectedImageIndex(i));
    }

    let scanDocumentData: ScanDocumentData = new ScanDocumentData();
    scanDocumentData.document_name = uploadfilename;
    scanDocumentData.document_date = this.dateTimeUtil.getStringDateFromDateModel(this.docDateModel);// "12/03/2018";
    scanDocumentData.practice_id = this.lookupList.practiceInfo.practiceId;
    scanDocumentData.patient_id = this.patientId;
    if (this.docType == "primary_insurance"
      || this.docType == "secondary_insurance"
      || this.docType == "other_insurance") {
      scanDocumentData.document_type = "insurance_card";
      scanDocumentData.patientinsurance_id = this.patientInsuranceId;
    }
    else {
      scanDocumentData.document_type = this.docType;
      scanDocumentData.patientinsurance_id = undefined;
    }
    scanDocumentData.client_date = this.dateTimeUtil.getCurrentDateTimeString();
    scanDocumentData.client_ip = this.lookupList.logedInUser.systemIp;
    scanDocumentData.client_user = this.lookupList.logedInUser.user_name;
    scanDocumentData.category_id = this.docCateogryId;


    /**
     * the upload method is called here
     */
    this.DWObject.ClearAllHTTPFormField();
    this.DWObject.SetHTTPFormField('docData', JSON.stringify(scanDocumentData));
    this.DWObject.SetHTTPHeader('Authorization', this.authService.getAuthorizationHeader());


    this.DWObject.HTTPUpload(
      this.uploadUrl,
      _aryIndicesToUpload,
      _EnumDWT_ImageTypeToUpload,
      EnumDWT_UploadDataFormat.Binary,
      (httpResponse) => {
        Dynamsoft.WebTwainEnv.Unload();

        let status: string = ServiceResponseStatusEnum.SUCCESS;
        let docType: string = this.docType;
        let catId: number = this.docCateogryId;

        let resp: any = { status: status, docType: docType, categoryId: catId };

        this.activeModal.close(resp);
      }
      // OnHttpUploadSuccess
      ,
      (errorCode, errorString, httpResponse) => {
        this.checkErrorStringWithErrorCode(errorCode, errorString, httpResponse);
      }
      //OnHttpUploadFailure
    );

    /*
  function OnHttpUploadSuccess(httpResponse) {
  
    //if (this.DWObject.SelectedImagesCount == this.DWObject.HowManyImagesInBuffer)
    //  this.DWObject.SelectedImagesCount = 1;
    //this.appendMessage(' <strong>uploaded successfully!</strong><br />');
    Dynamsoft.WebTwainEnv.Unload();     
    let status: string = ServiceResponseStatusEnum.SUCCESS;
    let docType: string = this.docType;
    let catId: number = this.docCateogryId;

    let resp: any = { status: status, docType: docType, categoryId: catId };

    this.activeModal.close(resp);
  }

    function OnHttpUploadFailure(errorCode, errorString, httpResponse) {
      debugger;
      this.checkErrorStringWithErrorCode(errorCode, errorString, httpResponse);
    }
    */

  }





  /** 
   * Dynamic Web TWAIN Events handlers 
   * */
  Dynamsoft_OnTopImageInTheViewChanged = (index: number) => {
    this._iLeft = 0;
    this._iTop = 0;
    this._iRight = 0;
    this._iBottom = 0;
    this.DWObject.CurrentImageIndexInBuffer = index;
    this.updatePageInfo();
  }
  Dynamsoft_OnImageAreaSelected = (index: number, left: number, top: number, right: number, bottom: number) => {
    this._iLeft = left;
    this._iTop = top;
    this._iRight = right;
    this._iBottom = bottom;
  }
  Dynamsoft_OnMouseClick = (index: number) => {
    this.updatePageInfo();
  }
  Dynamsoft_OnPostTransfer = () => {
    this.updatePageInfo();
  }

  Dynamsoft_OnPostLoadfunction = (path, name, type) => {
    this.updatePageInfo();
  }
  Dynamsoft_OnPostAllTransfers = () => {
    this.DWObject.CloseSource();
    this.updatePageInfo();
    this.checkErrorString();
  }
  Dynamsoft_OnMouseRightClick = (index) => {
  }
  Dynamsoft_OnImageAreaDeselected = (index) => {
    this._iLeft = 0;
    this._iTop = 0;
    this._iRight = 0;
    this._iBottom = 0;
  }
  Dynamsoft_OnMouseDoubleClick = () => {
  }
  Dynamsoft_OnGetFilePath = (bSave: boolean, count: number, index: number, path: string, name: string) => {
  }
  checkIfImagesInBuffer(): boolean {
    if (this.DWObject.HowManyImagesInBuffer == 0) {
      return false;
    }
    else
      return true;
  }
  checkErrorStringWithErrorCode(errorCode: number, errorString: string, responseString?: string): boolean {
    debugger;
    if (errorCode == 0) {

      //GeneralOperation.showAlertPopUp(this.ngbModal, 'Scan', errorString, AlertTypeEnum.DANGER);
      //alert(errorString);
      return true;
    }
    if (errorCode == -2115) //Cancel file dialog
      return true;
    else {
      if (errorCode == -2003) {
        let ErrorMessageWin = window.open("", "ErrorMessage", "height=500,width=750,top=0,left=0,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no");
        ErrorMessageWin.document.writeln(responseString);
      }
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Scan', errorString, AlertTypeEnum.DANGER);
      //alert(errorString);
      return false;
    }
  }
  checkErrorString(): boolean {
    return this.checkErrorStringWithErrorCode(this.DWObject.ErrorCode, this.DWObject.ErrorString);
  }
  updatePageInfo(): void {
    let DW_TotalImage: HTMLInputElement = <HTMLInputElement>document.getElementById("DW_TotalImage");
    let DW_CurrentImage: HTMLInputElement = <HTMLInputElement>document.getElementById("DW_CurrentImage");
    if (DW_TotalImage)
      DW_TotalImage.value = (this.DWObject.HowManyImagesInBuffer).toString();
    if (DW_CurrentImage)
      DW_CurrentImage.value = (this.DWObject.CurrentImageIndexInBuffer + 1).toString();
  }

  closeScan() {
    Dynamsoft.WebTwainEnv.Unload();
    this.activeModal.dismiss('Cross click');

  }


  OnCategoryChange(e) {
    debugger;
    this.docCateogryId = e.node.data.id;
    //alert(e.node.data.id + ":" + e.node.data.name);
  }

  onChkChangeDuplex(e: any) {
    debugger;
    var checked = e.target.checked;
    console.log(checked); // {}, true || false
    if (checked) {
      this.isDuplex = true;
    }
    else {
      this.isDuplex = false;
    }
  }

}
