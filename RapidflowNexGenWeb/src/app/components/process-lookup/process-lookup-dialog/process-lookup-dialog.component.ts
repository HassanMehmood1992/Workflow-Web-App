/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessLookupDialogComponent
Description: Dialog to render list of process lookup items and select one or more item. 
Location: ./components/process-lookup-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/


import { ProgressDialogComponent } from './../../progress-dialog/progress-dialog.component';
import { ProcessFormService } from './../../../services/process-form.service';
import { SortListsService } from './../../../services/sort-lists.service';
import { FilterArrayLookupDialogPipe } from './../../../pipes/filter-array-lookup-dialog.pipe';
import { RapidflowService } from './../../../services/rapidflow.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PaginationInstance } from 'ngx-pagination/dist/ngx-pagination.js';
import * as moment from 'moment';
@Component({
  selector: 'app-process-lookup-dialog',
  templateUrl: './process-lookup-dialog.component.html',
  styleUrls: ['./process-lookup-dialog.component.css'],
  providers: [SortListsService]
})
export class ProcessLookupDialogComponent implements OnInit {

  public lookupData: any[]; // Global variable of the class to store the retrived lookup data from process lookups
  public rows: any[]; // Global variable of the class to store rows of the retrieved data from process lookups
  public cols: any[]; // Global variable of the class to store columns of the retrieved data from process lookups
  public columnHeadings: any[]; // Global variable of the class to store column headings for columns retrieved from process lookups
  public isAllSelected: boolean; // Global flag to store if all rows are selected or not
  public tempNgModel: any[]; // Global variable of the class to store the value of the selected rows
  public maxSize: number = 7; // Global variable of the class to store max number of rows displayed per page
  public p: number; // Global variable of the class to store the page number of the data retrieved
  public searchString: string; // Global variable of the class to store the search string when filtering retrieved records
  public sortKey:any;   // Global variable of the class to store the sort key whether asc or desc
  public sortObjectAscending:any; // Global variable of the class to store the object/ column that needs to be sorted
  public replacedFilterString:string; // Global variable of the class to store replaced filter string used to retrieve data from process lookups
  public replacedSortString:string; // Global variable of the class to store replaced sort string used to retrieve data from process lookups
  public replacedLookupColumns:string; // Global variable of the class to store replaced lookup columns displayed to the user
  public processId:string; // Global variable of the class to store the process id for the lookups that needs to be retrieved
  public workflowId:string; // Global variable of the class to store the workflow id of the process from where data is being fetched
  public peoplePickerColumns:any; // Global variable of the class to store if the retrieved columns contain any people picker columns
  public loadingRecords:boolean; // Global flag to check if the records are loading or not
  public paginationConfig:PaginationInstance; // Global variable of the class to store the pagination configuration for the data retrieved
  public labels: any = { // Global variable of the class to store pagination labels for the process lookup dialog control
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

  /**
   * Creates an instance of ProcessLookupDialogComponent.
   * @param {RapidflowService} rapidflowService 
   * @param {MatDialogRef<ProcessLookupDialogComponent>} dialogRef 
   * @param {*} data 
   * @param {SortListsService} SortListsService 
   * @param {ProcessFormService} processFormService 
   * @param {MatDialog} dialog 
   * @memberof ProcessLookupDialogComponent
   */
  constructor(public rapidflowService: RapidflowService,
    public dialogRef: MatDialogRef<ProcessLookupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private SortListsService:SortListsService,
    private processFormService:ProcessFormService,
    public dialog: MatDialog ) {
    this.rows = [];
    this.cols = [];
    this.columnHeadings = [];
    this.lookupData = [];
    this.tempNgModel = [];
    this.p = 1;
    this.searchString = "";
    this.sortKey = "";
    this.replacedFilterString = "";
    this.replacedSortString = "";
    this.replacedLookupColumns = "";
    this.peoplePickerColumns = [];
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
   * @memberof ProcessLookupDialogComponent
   */
  onPageChange(number: number) {
    this.paginationConfig.currentPage = number;
  }

  /**
   * Triggered when the process lookup dialog is called
   * 
   * @memberof ProcessLookupDialogComponent
   */
  ngOnInit() {
    let dialogRef2 = this.dialog.open(ProgressDialogComponent, {
      data: {
        message: "Fetching lookup data please wait ...",
      }
    });
    this.validateLookupDetails();
    this.rapidflowService.retrieveProcessLookupFormData(this.processId, this.data.lookupDetails.lookupName, this.replacedLookupColumns, encodeURIComponent(this.replacedFilterString), encodeURIComponent(this.replacedSortString)).subscribe((response) => {
      this.lookupData = this.rapidflowService.parseRapidflowJSON(response).LookupValues;
      this.loadingRecords = false;
      dialogRef2.close();
      for (var i = 0; i < this.lookupData.length; i++) {
        var obj = this.lookupData[i];
        if ((this.data.lookupDetails.ngModel.indexOf(Object.values(obj)[0])) != -1) {
          obj.isChecked = true;
          var value = Object.values(obj)[0];
          this.tempNgModel.push(obj[this.cols[0].columnName]);
        }
        else {
          obj.isChecked = false;
        } 
        this.rows.push(obj);
      }
    },(error) => {
      this.rapidflowService.ShowErrorMessage("retrieveProcessLookupFormData Lookup  dialog  component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveProcessLookupFormData", " rapidflowService.retrieveProcessLookupFormData", this.processId,true);
    });
  }

  /**
   * Function that validates the properties provided to retrieve data
   * for the process lookup dialog
   * @memberof ProcessLookupDialogComponent
   */
  validateLookupDetails() {
    try {
      this.cols = this.data.lookupDetails.lookupColumns;
      this.replacedLookupColumns = "";
      for(let i:number= 0;i<this.data.lookupDetails.lookupColumns.length;i++){
        if(this.data.lookupDetails.columnTypes[i].toLowerCase() == "peoplepicker"){
          this.replacedLookupColumns += "(SELECT * FROM OPENJSON(PLD.Value) WITH( ["+this.data.lookupDetails.lookupColumns[i]+"]  nvarchar(MAX)  AS JSON )) as "+this.data.lookupDetails.lookupColumns[i] +",";
        }
        else if(this.data.lookupDetails.columnTypes[i].toLowerCase() == "url"){
          this.replacedLookupColumns += "(SELECT * FROM OPENJSON(PLD.Value) WITH( ["+this.data.lookupDetails.lookupColumns[i]+"]  nvarchar(MAX)  AS JSON )) as "+this.data.lookupDetails.lookupColumns[i] +",";
        }
        else{
          this.replacedLookupColumns += "JSON_VALUE(PLD.Value,'$."+this.data.lookupDetails.lookupColumns[i]+"') as "+ this.data.lookupDetails.lookupColumns[i] + ",";
        }
      }
      this.replacedLookupColumns =  this.replacedLookupColumns.substr(0, this.replacedLookupColumns.length-1);
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

      //check if filter string needs data from FormData
      this.replacedFilterString = this.data.lookupDetails.filterString;
      if (this.data.lookupDetails.filterString.indexOf('#') != -1) {
        if (typeof this.data.lookupDetails.formDataJSON != "undefined") {
          for (let key in this.data.lookupDetails.formDataJSON) {
            let value = this.data.lookupDetails.formDataJSON[key];
            if (key != "" && this.data.lookupDetails.filterString.indexOf("#" + key) != -1) {
              this.replacedFilterString = this.replacedFilterString.replace("#" + key, value);
            }
          }
        }
      }

      //update the sort string based on user input
      this.replacedSortString = "";
      for(let i:number= 0;i<this.data.lookupDetails.sortString.length;i++){
        let tempSortString = this.data.lookupDetails.sortString[i].trim();
        if(tempSortString != ""){
          let tempSortStringArray = tempSortString.split(":");
          this.replacedSortString = " order by "; 
          this.replacedSortString += "JSON_VALUE(PLD.Value,'$."+tempSortStringArray[0]+"') "+ tempSortStringArray[1] + ",";
        }
      }
      this.replacedSortString = this.replacedSortString.substr(0, this.replacedSortString.length-1);


      if(typeof this.data.lookupDetails.processId != "undefined"){
        this.processId = this.data.lookupDetails.processId;
      }
      else{
        this.processId = "2";
      }
    }
    catch (err) {
      this.rapidflowService.ShowErrorMessage("retrieveProcessLookupFormData Lookup  dialog  component", "Platform", "Error occured while executing api call", err, "An error occured while retrieveProcessLookupFormData", " rapidflowService.retrieveProcessLookupFormData", this.processId,true);
    }
  }

  /**
   * Function called when an item is selected from the dialog list
   * sets the value in the field along with other form fields
   * @param {any} row the selected row
   * @memberof ProcessLookupDialogComponent
   */
  setLookupValues(row) {
    if (this.data.lookupDetails.selectionType == 'single') {
      this.data.lookupDetails.ngModel = [];
      this.data.lookupDetails.ngModel.push(row[this.cols[0].columnName]);
      this.setFormFields(row);
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

  /**
   * Function called to select all the values from the displayed list
   * 
   * @param {any} evt true/false variable to select all or not
   * @memberof ProcessLookupDialogComponent
   */
  selectAll(evt) {
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

  /**
   * Function called when the user is sure about his/her selection
   * sets the selected rows in the field value
   * @memberof ProcessLookupDialogComponent
   */
  confirmSelection() {
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

  /**
   * Function called when the user wants to clear his /her selection
   * for this field and empty the value
   * @memberof ProcessLookupDialogComponent
   */
  clearSelection() {
    this.data.lookupDetails.ngModel = "";
    for (let i: number = 0; i < this.rows.length; i++) {
      if (this.rows[i].isChecked) {
        this.rows[i].isChecked = false;
      }
    }
    this.dialogRef.close(this.data.lookupDetails.ngModel);
  }

  /**
   * Function called when a column in the displayed needs to be sorted
   * sorting is done based on the provided column 
   * @param {any} column selected column for sorting
   * @memberof ProcessLookupDialogComponent
   */
  sortColumn(column) {
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

  /**
   * Function called to set other form fields after selection
   * of a row from the displayed results in the lookup 
   * @param {any} row selected row
   * @memberof ProcessLookupDialogComponent
   */
  setFormFields(row){
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

  /**
   * Function called to format date time string into the desired format
   * 
   * @param {any} type type of the object
   * @param {any} value value of the object
   * @memberof ProcessLookupDialogComponent
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
