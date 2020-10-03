/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DatabaseLookupDialogComponent
Description: Provide functionality for rendering the db lookup dialog. It contains the workflow data from previous requests.
Location: ./database-lookup/database-lookup-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { ProgressDialogComponent } from './../../progress-dialog/progress-dialog.component';
import { ProcessFormService } from './../../../services/process-form.service';
import { SortListsService } from './../../../services/sort-lists.service';
import { RapidflowService } from './../../../services/rapidflow.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PaginationInstance } from 'ngx-pagination/dist/ngx-pagination.js';
import * as moment from 'moment';
import { FilterArrayLookupDialogPipe } from './../../../pipes/filter-array-lookup-dialog.pipe';

@Component({
  selector: 'app-database-lookup-dialog',
  templateUrl: './database-lookup-dialog.component.html',
  styleUrls: ['./database-lookup-dialog.component.css'],
  providers: [SortListsService]
})
export class DatabaseLookupDialogComponent implements OnInit {
  public lookupData: any[];
  public rows: any[];
  public cols: any[];
  public columnHeadings: any[];
  public p: number;
  public searchString: string;
  public sortKey:any; 
  public sortObjectAscending:any;
  public replacedFilterString:string;
  public processId:string;
  public workflowId:string;
  public isAllSelected: boolean;
  public tempNgModel: any[];
  public loadingRecords:boolean;
  public paginationConfig:PaginationInstance;
  public labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

  /**
   * Creates an instance of DatabaseLookupDialogComponent.
   * @param {RapidflowService} rapidflowService 
   * @param {MatDialogRef<DatabaseLookupDialogComponent>} dialogRef 
   * @param {*} data 
   * @param {SortListsService} SortListsService 
   * @param {ProcessFormService} processFormService 
   * @param {MatDialog} dialog 
   * @memberof DatabaseLookupDialogComponent
   */
  constructor(public rapidflowService: RapidflowService,
    public dialogRef: MatDialogRef<DatabaseLookupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private SortListsService:SortListsService,
    private processFormService:ProcessFormService,
    public dialog: MatDialog ) {
      this.rows = [];
      this.cols = [];
      this.columnHeadings = [];
      this.lookupData = [];
      this.tempNgModel = [];
      this.replacedFilterString = "";
      this.workflowId = "";
      this.processId = "";
      this.p = 1;
      this.searchString = "";
      this.sortKey = "";
      this.loadingRecords = true;
      this.paginationConfig = {
        id: "advanced",
        itemsPerPage: 8,
        currentPage: this.p
      };
  }

  /**
   * Called when the page is changed to view more items in the list
   * 
   * @param {number} number page number
   * @memberof DatabaseLookupDialogComponent
   */
  onPageChange(number: number) {
    this.paginationConfig.currentPage = number;
  }

  /**
   * Triggered when the database lookup dialog is called
   * 
   * @memberof DatabaseLookupDialogComponent
   */
  ngOnInit() {
    try{
      let dialogRef2 = this.dialog.open(ProgressDialogComponent, {
        data: {
          message: "Fetching lookup data please wait ...",
        }
      });
      this.validateLookupDetails();
      this.rapidflowService.retrieveDatabaseLookupFormData(this.processId, this.workflowId, encodeURIComponent(this.data.lookupDetails.query)).subscribe((response) => {
        this.lookupData = this.rapidflowService.parseRapidflowJSON(response);
        dialogRef2.close();
        this.rows = this.lookupData;
        this.loadingRecords = false;
      },(error: any) => {
        this.rapidflowService.ShowErrorMessage("retrieveDatabaseLookupFormData-Database Lookup dialog component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveDatabaseLookupFormData", " RapidflowServices.retrieveDatabaseLookupFormData",this.processId,true);
      });
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("ngOnInit-Database Lookup dialog component", "Platform", "Error occured while executing api call", error, error.stack, "N/A",this.processId,true);
    }
  }

  /**
   * Check if the provided string is json or not
   * 
   * @param {any} str input string
   * @returns {boolean} true if the string passed is json, false otherwise
   * @memberof DatabaseLookupDialogComponent
   */
  isJson(str): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * Function that validates the properties provided to retrieve data
   * for the database lookup dialog
   * @memberof DatabaseLookupDialogComponent
   */
  validateLookupDetails() {
    try {  
      this.cols = this.data.lookupDetails.columnNames;
      this.columnHeadings = this.data.lookupDetails.columnHeadings;
      let tempColumns = this.cols;
      this.cols = [];
      for (var i = 0; i < tempColumns.length; i++) {
        let obj = {};
        obj["columnHeading"] = this.columnHeadings[i];
        obj["columnName"] = tempColumns[i];
        obj["sortString"] = "";
        obj["sortArrow"] = "";
        obj["type"] = this.data.lookupDetails.columnTypes[i].toLowerCase();
        this.cols.push(obj);
      }

      this.replacedFilterString = this.data.lookupDetails.query;
      if (this.data.lookupDetails.query.indexOf('#') != -1) {
        if (typeof this.data.lookupDetails.formDataJSON != "undefined") {
          for (let key in this.data.lookupDetails.formDataJSON) {
            let value = this.data.lookupDetails.formDataJSON[key];
            if (key != "" && this.data.lookupDetails.query.indexOf("#" + key) != -1) {
              this.replacedFilterString = this.replacedFilterString.replace("#" + key, value);
            }
          }
        }
      }
      
      if(typeof this.data.lookupDetails.formDataJSON != "undefined"){
        this.processId = this.data.lookupDetails.formDataJSON["ProcessID"];
        this.workflowId = this.data.lookupDetails.formDataJSON["WorkflowID"];
      }
    }
    catch (err) {
      this.rapidflowService.ShowErrorMessage("validateLookupDetails-Database Lookup dialog component", "Platform", "Error occured while validating lookup details", err, err.stack, "N/A",this.processId,true);
    }
  }

  /**
   * Function called when an item is selected from the dialog list
   * sets the value in the field along with other form fields
   * @param {any} row the selected row
   * @memberof DatabaseLookupDialogComponent
   */
  setLookupValues(row) {
    try{
      if (this.data.lookupDetails.selectionType == 'single') {
        this.data.lookupDetails.ngModel = [];
        this.data.lookupDetails.ngModel.push(row[this.cols[0].columnName]);
        this.setFromFields(row);
        let response = {};
        response["modelValue"] = this.data.lookupDetails.ngModel;
        response["modelRow"] = row;
        this.dialogRef.close(response);
      }
      else {
        row.isChecked = !row.isChecked;
        if (row.isChecked) {
          this.tempNgModel.push(row[this.cols[0].columnName]);
        }
        else {
          this.tempNgModel.splice(this.tempNgModel.indexOf(row[this.cols[0].columnName]), 1);
        }
  
        if (this.isAllSelected && row.isChecked) { }
        else {
          this.isAllSelected = false;
        }
      }
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("setLookupValues-Database Lookup dialog component", "Platform", "Error occured while setting lookup values", error, error.stack, "N/A",this.processId,true);
    }
  }

  /**
   * Function called to select all the values from the displayed list
   * 
   * @param {any} evt true/false variable to select all or not
   * @memberof DatabaseLookupDialogComponent
   */
  selectAll(evt) {
    try{
      this.isAllSelected = evt;
      let toggleStatus = this.isAllSelected;
      if (this.isAllSelected) {
        for (let i: number = 0; i < this.rows.length; i++) {
          this.rows[i].isChecked = toggleStatus;
          this.tempNgModel.push(this.rows[i][this.cols[0].columnName]);
        }
      }
      else {
        for (let i: number = 0; i < this.rows.length; i++) {
          this.rows[i].isChecked = toggleStatus;
          this.tempNgModel.splice(this.tempNgModel.indexOf(this.rows[i][this.cols[0].columnName]), 1);
        }
      }
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("selectAll-Database Lookup dialog component", "Platform", "Error occured while selectng all lookup values", error, error.stack, "N/A",this.processId,true);
    }
  }

  /**
   * Function called when the user is sure about his/her selection
   * sets the selected rows in the field value
   * @memberof DatabaseLookupDialogComponent
   */
  confirmSelection() {
    try{
      this.data.lookupDetails.ngModel = [];
      let modelValues = [];
      let modelRows = [];
      for (let i: number = 0; i < this.rows.length; i++) {
        if (this.rows[i].isChecked) {
          modelRows.push(this.rows[i]);
          modelValues.push(this.rows[i][this.cols[0].columnName]);
        }
      }
      let response = {};
      response["modelValue"] = modelValues;
      response["modelRow"] = modelRows;
      this.dialogRef.close(response);
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("confirmSelection-Database Lookup dialog component", "Platform", "Error occured while confirming selection", error, error.stack, "N/A",this.processId,true);
    }
  }

  /**
   * Function called when the user wants to clear his /her selection
   * for this field and empty the value
   * @memberof DatabaseLookupDialogComponent
   */
  clearSelection() {
    try{
      this.data.lookupDetails.ngModel = "";
      for (let i: number = 0; i < this.rows.length; i++) {
        if (this.rows[i].isChecked) {
          this.rows[i].isChecked = false;
        }
      }
      this.dialogRef.close(this.data.lookupDetails.ngModel);
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("clearSelection-Database Lookup dialog component", "Platform", "Error occured while clearing selection", error, error.stack, "N/A",this.processId,true);
    }
  }

  /**
   * Function called when a column in the displayed needs to be sorted
   * sorting is done based on the provided column 
   * @param {any} column selected column for sorting
   * @memberof DatabaseLookupDialogComponent
   */
  sortColumn(column) {
    try{
      this.sortKey = column.columnName;
      this.sortObjectAscending = {};
      if(column.sortString == ""){
        this.sortObjectAscending[column.columnName]  = "asc";
        column.sortString = "asc";
        column.sortArrow = true;
      }
      else if(column.sortString == "asc"){
        this.sortObjectAscending[column.columnName]  = "desc";
        column.sortString = "desc";
        column.sortArrow = false;
      }
      else if(column.sortString == "desc")
      {
        this.sortObjectAscending[column.columnName]  = "asc";
        column.sortString = "asc";
        column.sortArrow = true;
      }
      this.rows = this.SortListsService.sort(this.rows, this.sortObjectAscending);
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("sortColumn-Database Lookup dialog component", "Platform", "Error occured while sorting column", error, error.stack, "N/A",this.processId,true);
    }
  }

  /**
   * Function called to set other form fields after selection
   * of a row from the displayed results in the lookup 
   * @param {any} row selected row
   * @memberof DatabaseLookupDialogComponent
   */
  setFromFields(row){
    try{
      if(this.data.lookupDetails.formDataJSON != undefined){
        if(this.data.lookupDetails.formFields != undefined){
          if(this.data.lookupDetails.formFields.length > 0){
            let tempFormFields = this.data.lookupDetails.formFields;
            for(let i:number = 0;i<tempFormFields.length;i++)
            {
              this.data.lookupDetails.formDataJSON[tempFormFields[i]] = row[this.cols[i].columnName];
            }
          }
        }
      }
      this.processFormService.setFormData(this.data.lookupDetails.formDataJSON);
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("setFromFields-Database Lookup dialog component", "Platform", "Error occured while setting form fields", error, error.stack, "N/A",this.processId,true);
    }
  }

  /**
   * Function called to format date time string into the desired format
   * 
   * @param {any} type type of the object
   * @param {any} value value of the object
   * @returns 
   * @memberof DatabaseLookupDialogComponent
   */
  formatDateTime(type, value){
    if (value == "" || value == undefined) {
      return "";
    }
    if(type.toLowerCase() == "date"){
      return moment.utc(value).format("DD-MMM-YYYY");
    }
    else if(type.toLowerCase() == "datetime"){
      return moment.utc(value).format("DD-MMM-YYYY hh:mm A");
    }
    else if(type.toLowerCase() == "time") {
      return moment.utc(value).format("hh:mm A");
    }
    else{
      return "";
    }
  }
}
