import { Injectable, Inject } from '@angular/core';
import { ListFilterPipe } from './list-filter-pipe';
import { AlertPopupComponent } from '../general-modules/alert-popup/alert-popup.component';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from '../providers/lookupList.module';
import { ORMAuditLog } from '../models/general/ORMAuditLog';
import { DateTimeUtil } from './date-time-util';
import { balancePreviousStylesIntoKeyframes } from '@angular/animations/browser/src/util';
import { GeneralService } from '../services/general/general.service';
import { UniquePipe } from './unique-pipe';
import { DocumentTreeModel } from '../models/general/document-tree-model';
import { DecimalPipe } from '@angular/common';
import * as FileSaver from 'file-saver';

@Injectable()
export class GeneralOperation {

    constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, private dateTimeUtil: DateTimeUtil
        , private generalService: GeneralService) {

    }

    //Pass Element to array and index will return
    getElementIndex(list, element) {
        if (list == undefined)
            return undefined;

        return list.indexOf(element);
    }
    //Pass key/id to array and index will return
    getitemIndex(list, column, value) {
        if (list == undefined || column == undefined || value == undefined)
            return undefined;

        for (let i = 0; i < list.length; i++) {
            if (list[i][column].toString().toLowerCase() === value.toString().toLowerCase()) {
                return i;
            }
        }
    }

    //Pass key/id to array and index will return
    getitem(list, column, value) {
        if (list == undefined || column == undefined || value == undefined)
            return undefined;
        for (let item of list) {
            if (item[column] == value)
                return item;
        }
    }

    //Filter Array 
    filterArray(list: any, col: any, value: any) {
        let lst = new ListFilterPipe().transform(list, col, value);
        return lst;
    }
    ReplaceAll(mainStr: string, find: string, replace: string) {
        let result: string = "";
        if (mainStr != undefined && mainStr != null) {
            result = mainStr.toString().split(find).join(replace);
            //result= mainStr.replace(find,replace);
        }
        return result;
    }
    ReplaceHTMLReservedWords(str: string): string {
        return this.ReplaceAll(this.ReplaceAll(str, "<", "&#60;"), ">", "&#62;");
    }
    richTextEditorToHtml(str: String) {

        //         debugger;
        //         let  parser, xmlDoc;

        // parser = new DOMParser();
        // xmlDoc = parser.parseFromString("<BODY>"+str+"</BODY>","text/xml");

        // document.getElementById("demo").innerHTML =
        // xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;

        //       //  var xml:XMLDocument = new xml"<BODY>"+str+"</BODY>"; 
        //         let strHtml:String ="";
        //         strHtml=str;

        //         strHtml= this.ReplaceAll(strHtml.toString(),"<TEXTFORMAT LEADING=\"2\">","");
        //         strHtml= this.ReplaceAll(strHtml.toString(),"</TEXTFORMAT>","");
        //         strHtml= this.ReplaceAll(strHtml.toString(),"<P ALIGN=\"LEFT\">","<p style=\"text-align: LEFT; \">");
        //         strHtml= this.ReplaceAll(strHtml.toString(),"<FONT FACE=\"Arial\" SIZE=\"14\" COLOR=\"#000000\" LETTERSPACING=\"0\" KERNING=\"0\">","<font style=\"letter-spacing: 0px; color: #000000; font-size: 14px; font-family: Arial;\">");


        //        return strHtml;
        return str;
    }
    calculateAge(dob: Date, endDate: Date): any {
        var yearThen = parseInt(dob.toString().substring(6, 10), 10);
        var monthThen = parseInt(dob.toString().substring(0, 2), 10);
        var dayThen = parseInt(dob.toString().substring(4, 6), 10);

        var today = new Date();
        var birthday = new Date(yearThen, monthThen - 1, dayThen);

        var differenceInMilisecond = today.valueOf() - birthday.valueOf();

        var year_age = Math.floor(differenceInMilisecond / 31536000000);
        var day_age = Math.floor((differenceInMilisecond % 31536000000) / 86400000);

        if ((today.getMonth() == birthday.getMonth()) && (today.getDate() == birthday.getDate())) {
            alert("Happy B'day!!!");
        }

        var month_age = Math.floor(day_age / 30);

        day_age = day_age % 30;
        let arrresult: Array<any> = new Array();
        arrresult.push(year_age);
        arrresult.push(month_age);
        arrresult.push(day_age);
        return arrresult;


        // var ageDays = 0;
        // var ageYears = 0;
        // var ageRmdr = 0;
        // var ageDaysRet = 0;
        // var diff = endDate.getTime() - dob.getTime();

        // ageDays = diff / 86400000;
        // ageYears = Math.floor(ageDays / 365.25);
        // ageRmdr = Math.floor( (ageDays - (ageYears*365.25)) / 30.4375 );
        // ageDaysRet = Math.floor( (ageDays - (ageYears*365.25)) % 30.4375 );

        // if ( ageRmdr == 12 ) {
        //     ageRmdr = 11;
        // }

        // let arrresult:Array<any>=new Array();
        // arrresult.push(ageYears);
        // arrresult.push(ageRmdr);
        // arrresult.push(ageDaysRet);
        //return arrresult;
    }
    static poupUpOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false
        // centered: true
    };
    sortList(list: any, col: any, sortType: any, sortOn: string): any {
        //sortOn='Numeric','alpha','date'

        if (sortOn.toLowerCase() == 'numeric') {
            if (sortType == "asc") {
                list.sort(function (a, b) {
                    if (Number(a[col]) < Number(b[col])) { return -1; }
                    if (Number(a[col]) > Number(b[col])) { return 1; }
                    return 0;
                })
            }
            if (sortType == "des") {
                list.sort(function (a, b) {
                    if (Number(a[col]) > Number(b[col])) { return -1; }
                    if (Number(a[col]) < Number(b[col])) { return 1; }
                    return 0;
                })
            }
        }
        else if (sortOn.toLowerCase() == "alpha") {
            if (sortType == "asc") {
                list.sort(function (a, b) {
                    if (a[col].toString().toLowerCase() < b[col].toString().toLowerCase()) { return -1; }
                    if (a[col].toString().toLowerCase() > b[col].toString().toLowerCase()) { return 1; }
                    return 0;
                })
            }
            if (sortType == "des") {
                list.sort(function (a, b) {
                    if (a[col].toString().toLowerCase() > b[col].toString().toLowerCase()) { return -1; }
                    if (a[col].toString().toLowerCase() < b[col].toString().toLowerCase()) { return 1; }
                    return 0;
                })
            }
        }
        else if (sortOn.toLowerCase() == "date") {
            if (sortType == "asc") {
                list.sort(function (a: Date, b: Date) {
                    if (a[col].todate < b[col].getTime()) { return -1; }
                    if (a[col].getTime() > b[col].getTime()) { return 1; }
                    return 0;
                })
            }
            if (sortType == "des") {
                list.sort(function (a, b) {
                    if (this.getTime(a[col]) > this.getTime(b[col])) { return -1; }
                    if (this.getTime(a[col]) < this.getTime(b[col])) { return 1; }
                    return 0;
                })
            }
        }
    }
    static showAlertPopUp(modalService: NgbModal, message_heading: string, message_Body: string, message_type: string) {

        const modalRef = modalService.open(AlertPopupComponent, this.poupUpOptions);
        modalRef.componentInstance.promptHeading = message_heading
        modalRef.componentInstance.promptMessage = message_Body;
        modalRef.componentInstance.alertType = message_type;
    }

    static getCurrencyNumbersOnly(strCurrency: string): number {

        let currencNumbers: number = 0;

        if (strCurrency != undefined && strCurrency != null && strCurrency != '') {
            //currencNumbers = Number(strCurrency.toString().split(",").join("").split("$").join(""));

            let val: number = Number(strCurrency.toString().split(",").join("").split("$").join(""));

            if (!isNaN(val)) {
                let formatedValue = new DecimalPipe("en-US").transform(val, ".2-2", "");
                currencNumbers = Number(formatedValue.toString().split(",").join("").split("$").join(""));
            }
        }

        return currencNumbers;
    }


    static dyanmicDownloadByHtmlTag(arg: {
        fileName: string,
        text: string
    }) {

        let setting = {
            element: {
                dynamicDownload: null as HTMLElement
            }
        }

        if (!setting.element.dynamicDownload) {
            setting.element.dynamicDownload = document.createElement('a');
        }
        const element = setting.element.dynamicDownload;
        const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
        element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
        element.setAttribute('download', arg.fileName);

        var event = new MouseEvent("click");
        element.dispatchEvent(event);
    }

    static padLeft(text: string, padChar: string, size: number): string {
        return text.padStart(size, padChar)
    }
    static padRight(text: string, padChar: string, size: number): string {
        return text.padEnd(size, padChar)
    }


    getPatientPicturePath(picPath: string, genderCode: string): string {
        let patPicURL = undefined;

        if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0
            && picPath != null && picPath != undefined && picPath != "") {

            let downloadPath = this.lookupList.lstdocumentPath[0].download_path;
            patPicURL = downloadPath + this.lookupList.practiceInfo.practiceId + "/" + "PatientImages/" + picPath;
        }
        else if (genderCode == 'M') {
            patPicURL = this.lookupList.defaultPatMalePic;// "assets/images/img_male.png"     
        }
        else if (genderCode == 'F') {
            patPicURL = this.lookupList.defaultPatFemalePic;//"assets/images/img_female.png"        
        }
        else {
            patPicURL = this.lookupList.defaultPatPic;
        }

        return patPicURL;
    }
    moduleAccessLog(operation, module_Name, patient_Id, chart_id): ORMAuditLog {
        debugger;
        let objAduditLog: ORMAuditLog = new ORMAuditLog;
        objAduditLog.access = operation;
        objAduditLog.client_access_date = this.dateTimeUtil.getCurrentDateTimeString();
        objAduditLog.log_id = "";
        objAduditLog.user_name = this.lookupList.logedInUser.user_name;
        objAduditLog.module_name = this.getModuleName(module_Name);
        objAduditLog.patient_id = patient_Id;
        objAduditLog.practice_id = this.lookupList.practiceInfo.practiceId.toString();
        objAduditLog.system_ip = this.lookupList.logedInUser.systemIp;
        if (chart_id != "") {
            objAduditLog.chart_id = chart_id;
        }

        return objAduditLog;
    }
    getModuleName(value): string {
        let module_name = "";
        switch (value) {
            case "tab-summary":
                module_name = "Patient Summary";
                break;
            case "tab-encounter":
                module_name = "Encounter";
                break;
            case "tab-claim":
                module_name = "Claim";
                break;
            case "tab-results":
                module_name = "Lab Results";
                break;
            case "tab-documents":
                module_name = "Documents";
                break;
            case "tab-referral":
                module_name = "Referral";
                break;
            case "tab-consults":
                module_name = "Consults";
                break;
            case "tab-letter":
                module_name = "Letter";
                break;
            case "tab-correspondance":
                module_name = "Correspondance";
                break;
            case "tab-injury":
                module_name = "Injury";
                break;
            case "tab-appointment":
                module_name = "Appointment";
                break;
            default:
                module_name = value
                break;

        }
        return module_name;
    }


    static getIndexForNewInsuranceEntry(lst: Array<any>, insType: string): number {

        debugger;
        let index: number = 0;

        if (lst != undefined) {

            if (insType.toString().toLowerCase() == 'primary') {
                index = 0;
            }
            else if (insType.toString().toLowerCase() == 'secondary') {

                let primaryInsIndex: number = -1;
                for (let i = 0; i < lst.length; i++) {
                    const element = lst[i];
                    if (element.insurace_type.toString().toLowerCase() == 'primary') {
                        primaryInsIndex = i;
                        //break;
                    }
                }

                index = primaryInsIndex + 1;
            }
            else if (insType.toString().toLowerCase() == 'other') {
                index = lst.length;
            }
        }
        return index;
    }

    static arrangeInsuranceOrder(lstSource: Array<any>): Array<any> {

        debugger;
        let lst: Array<any> = new Array<any>();

        lstSource.forEach(patIns => {
            if (patIns.insurace_type.toLowerCase() == 'primary') {
                lst.push(patIns);
            }
        });

        lstSource.forEach(patIns => {

            if (patIns.insurace_type.toLowerCase() == 'secondary') {
                lst.push(patIns);
            }

        });

        lstSource.forEach(patIns => {

            if (patIns.insurace_type.toLowerCase() == 'other') {
                lst.push(patIns);
            }

        });

        return lst;
    }


    //*************** DOCUMENT CATEGORY FOR TREE */
    createDocumentCategory(lstCategories: Array<any>, includeLabCategories: boolean): Array<DocumentTreeModel> {
        debugger;

        let lstChildrenMain: Array<DocumentTreeModel> = [];
        let lstUniqueCategory = (new UniquePipe).transform(lstCategories, "parent_category")

        lstUniqueCategory.forEach(element => {

            // loop for Main Parent Categories.
            if (element.category_name == 'Patient Documents') {

                let documentTreeModel: DocumentTreeModel = new DocumentTreeModel(element.document_categories_id,
                    element.category_name,
                    this.getDocumentNodes(lstCategories, element, includeLabCategories), 0);

                lstChildrenMain.push(documentTreeModel);
            }

        });

        return lstChildrenMain;
    }

    private getDocumentNodes(lstCategories: Array<any>, mainParentElement: any, includeLabCategories: boolean) {

        let lstDiagnosticLabNodes: any[] = [];
        let lstDocumentCategoryNodes: any[] = [];


        lstDocumentCategoryNodes = this.getNestedChildNode(lstCategories, mainParentElement);

        if (includeLabCategories) {
            lstDiagnosticLabNodes = this.getDiagnosticLabNodes(lstCategories);
            return lstDiagnosticLabNodes.concat(lstDocumentCategoryNodes);
        }
        else {
            return lstDocumentCategoryNodes;
        }
    }

    private getDiagnosticLabNodes(lstCategories: Array<any>) {
        let lstChildren: Array<DocumentTreeModel> = [];

        lstChildren.push(new DocumentTreeModel(
            "lab",
            "Diagnostic Labs",
            this.getNestedChildNode(lstCategories, { document_categories_id: "lab" }), 0
        ));

        return lstChildren;
    }
    private getNestedChildNode(lstCategories: Array<any>, element: any) {

        let lstChildren: Array<DocumentTreeModel> = [];
        //let lstcatg = this.generalOperation.filterArray(this.lookupList.lstDocumentCategory, "document_categories_id", element.parent_category);
        let lstcatgchild = this.filterArray(lstCategories, "parent_category", element.document_categories_id);

        if (lstcatgchild != undefined && lstcatgchild.length > 0)
            lstcatgchild.forEach(child => {
                lstChildren.push(new DocumentTreeModel(
                    child.document_categories_id,
                    child.category_name,
                    this.getNestedChildNode(lstCategories, child), 0
                ));
            });

        return lstChildren;
    }
    //*************** END DOCUMENT CATEGORY FOR TREE */



    getUnReadMessagesCount() {


        this.generalService.getUnReadMessagesCount(this.lookupList.logedInUser.userId)
            .subscribe(
                data => {
                    this.lookupList.unReadmessageCount = Number(data);
                },
                error => {
                    console.log("getUnReadMessages." + error);
                }
            );
    }

    /**  
     * Deep Clone Array
     * Copy Array By Value (not by reference.)     
    */
    static copyArrayByValue(sourceArray: Array<any>): Array<any> {

        return JSON.parse(JSON.stringify(sourceArray))

    }
    downloaExcelFile(data, doc_link, name) {
        debugger;
        let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
        let file_type: string = '';
        var fileURL;
        var file = new Blob([data], { type: file_type });
        FileSaver.saveAs(file, name + "." + file_ext);
      }

}