import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ExcelColumn } from '../models/general/excel-column';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable()
export class excelService {
  constructor() { }
  public exportAsExcelFile(json: any[], display_columns: string, excelFileName: string): void {
    //Custom as per requirement
    debugger;
    if (display_columns != '') {

      var lstColumns = {} = new Array;
      var lstHeaders = {} = new Array;
      let x: string[] = display_columns.split(",");

      for (let a = 0; a < json.length; a++) {
        let obj = new Object;
        for (let i = 0; i < x.length; i++) {
          let col_name: string = x[i];
          if (isNaN(json[a][col_name]) == false) {
            obj[col_name] = Number(json[a][col_name]);
          } else {
            obj[col_name] = json[a][col_name];
          }

        }
        lstColumns.push(obj);

      }
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(lstColumns);
      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, excelFileName);
    }
    else {

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, excelFileName);
    }
  }

  public exportAsExcelFileWithHeaders(json: any[], lstColumns: Array<ExcelColumn>, excelFileName: string): void {
    //Custom as per requirement
    debugger;
    if (lstColumns != undefined) {

      var lstData = {} = new Array;
      var lstHeadersMain = [];
      var lstHeaders = [];

      for (let a = 0; a < json.length; a++) {
        let obj = new Object;
        for (let i = 0; i < lstColumns.length; i++) {
          let col_name: string = lstColumns[i].col_name;
         
          if (json[a][col_name] != undefined) {
            if (lstColumns[i].data_type=='number' && isNaN(json[a][col_name]) == false) {
              obj[col_name] = Number(json[a][col_name]);
            } else {
              obj[col_name] = json[a][col_name];
            }
          }
          else {
            obj[col_name] = json[a][col_name];
          }
          //obj[col_name] = json[a][col_name];
        }
        lstData.push(obj);
      }

      for (let i = 0; i < lstColumns.length; i++) {
        lstHeaders.push(lstColumns[i].col_header);
      }

      lstHeadersMain.push(lstHeaders); // array of array
      //var Heading = [["Claim Id", "DOS", "Patient Name"]];

      var worksheet = XLSX.utils.aoa_to_sheet(lstHeadersMain);
      XLSX.utils.sheet_add_json(worksheet, lstData, { skipHeader: true, origin: "A2" });


      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, excelFileName);
    }
    else {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, excelFileName);
    }
  }
  public exportAsExcelFileWithHeadersWithoutColumnName(json: any[], lstColumns: Array<ExcelColumn>, excelFileName: string): void {
    //Custom as per requirement
    debugger;
    if (lstColumns != undefined) {

      var lstData = {} = new Array;
      var lstHeadersMain = [];
      var lstHeaders = [];

      for (let a = 0; a < json.length; a++) {
        let obj = new Object;
        for (let i = 0; i < lstColumns.length; i++) {
          let col_name = i;
         
          if (json[a][col_name] != undefined) {
            if (lstColumns[i].data_type=='number' && isNaN(json[a][col_name]) == false) {
              obj[col_name] = Number(json[a][col_name]);
            } else {
              obj[col_name] = json[a][col_name];
            }
          }
          else {
            obj[col_name] = json[a][col_name];
          }
          //obj[col_name] = json[a][col_name];
        }
        lstData.push(obj);
      }

      for (let i = 0; i < lstColumns.length; i++) {
        lstHeaders.push(lstColumns[i].col_header);
      }

      lstHeadersMain.push(lstHeaders); // array of array
      //var Heading = [["Claim Id", "DOS", "Patient Name"]];

      var worksheet = XLSX.utils.aoa_to_sheet(lstHeadersMain);
      XLSX.utils.sheet_add_json(worksheet, lstData, { skipHeader: true, origin: "A2" });


      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, excelFileName);
    }
    else {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, excelFileName);
    }
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}