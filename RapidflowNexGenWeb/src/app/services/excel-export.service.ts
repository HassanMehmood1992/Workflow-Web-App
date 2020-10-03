/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ExportExcelService
Description: Global service to export the given data to an excel sheet format.
Location: ./services/excel-export.service
Author: Nabil
Version: 1.0.0
Modification history: none
*/

import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx/xlsx.js';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';//excel format type
const EXCEL_EXTENSION = '.xlsx';//file extension
@Injectable()
export class ExcelExportService {

  /**
   * 
   * Default constructor
   */
  constructor() { }

  /**
   * Create excel from json with given filename
   * @param json 
   * @param excelFileName 
   */
  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  /**
   * Download excel file to client 
   * @param buffer 
   * @param fileName 
   */
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
   FileSaver.saveAs(data, fileName);
  }
}
