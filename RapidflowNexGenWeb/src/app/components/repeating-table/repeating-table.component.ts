/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: RepeatingTableComponent
Description: Renders a repeating table with the according to given input data and options.
.
Location: ./components/repeating-table.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/

import { Component, OnInit, Input, Output, HostListener, ElementRef, EventEmitter, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgModel, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-repeating-table',
  templateUrl: './repeating-table.component.html',
  styleUrls: ['./repeating-table.component.css']
})
export class RepeatingTableComponent implements OnInit {

  @Input('tableJson') tableJson;
  @Input('ngModel') DataJson;
  @Input('formDataJSON') formDataJSON;
  @Input('controlOptions') controlOptions;

  @Output() ngModelChange = new EventEmitter();

  @Output() repeatingTableEvent = new EventEmitter();

  @Output() formDataJsonEvent = new EventEmitter();

  @Output() updateTableValidation = new EventEmitter();
  

  public temp:any; // Global variable of the class to store the temporary data for repeating table
  /**
   * Creates an instance of RepeatingTableComponent.
   * @param {FormBuilder} formBuilder 
   * @memberof RepeatingTableComponent
   */
  constructor(@Inject(FormBuilder) formBuilder: FormBuilder) {
    this.DataJson = [];
    this.tableJson=[];
  }

/**
 * Function triggered when the user clicks on any field in the repeating table
 * Emits a click event to the user for performing any actions on click
 * @param {any} event 
 * @memberof RepeatingTableComponent
 */
@HostListener('click', ['$event'])
  onMouseEvent(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    if(typeof event.currentTarget.tagName != "undefined"){
      if(event.currentTarget.tagName.toLowerCase() == "app-repeating-table"){
        if (event.type == "click") {
          let match = event.target.id.match(/[a-z]+|\d+/ig);
          if (match) {
            rowIndex = match[0] - 1;
            row = this.temp[match[0] - 1];
            for (let key in row) {
              if (key.toLowerCase() == match[1].toLowerCase()) {
                column[key] = row[key];
              }
            }
          }
          this.DataJson = this.temp;  
          let changedAttributes = {};
          changedAttributes["event"] = event.type;
          changedAttributes["rowIndex"] = rowIndex;
          changedAttributes["row"] = row;
          changedAttributes["column"] = column;
          changedAttributes["modelValue"] = this.DataJson;
          this.checkRepeatingTableValidStatus();
          this.repeatingTableEvent.emit(changedAttributes);
        }
      }
    }
  }

/**
 * Function triggered when the user changes a value in any field in the repeating table
 * Emits a change event to the user for performing any actions on field value change
 * @param {any} event 
 * @memberof RepeatingTableComponent
 */
  @HostListener('change', ['$event'])
  onchange(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    let columnName:string;
    if (event.type == "change" && event.event == undefined) {
      let match = event.target.id.match(/[a-z]+|\d+/ig);
      if (match) {
        rowIndex = match[0] - 1;
        row = this.temp[match[0] - 1];
        columnName = match[1];
        for (let key in row) {
          if (key.toLowerCase() == match[1].toLowerCase()) {
            column[key] = row[key];
          }
        }
      }
      this.DataJson = this.temp;
      this.checkFooterColumn("");
      let changedAttributes = {};
      changedAttributes["event"] = event.type;
      changedAttributes["rowIndex"] = rowIndex;
      changedAttributes["row"] = row;
      changedAttributes["column"] = column;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
    }
    else if(event.event == "lookup"){
      this.DataJson = this.temp;
      let changedAttributes = {};
      let columnObj = {};
      columnObj[event.currentColumn] = event.value; 
      changedAttributes["event"] = event.type;
      changedAttributes["rowIndex"] = event.rowIndex;
      changedAttributes["row"] = event.currentRow;
      changedAttributes["column"] = columnObj;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
    }
    else if(event.event == "datetimepicker"){
      this.DataJson = this.temp;
      let changedAttributes = {};
      let columnObj = {};
      columnObj[event.currentColumn] = event.value; 
      changedAttributes["event"] = event.type;
      changedAttributes["rowIndex"] = event.rowIndex;
      changedAttributes["row"] = event.currentRow;
      changedAttributes["column"] = columnObj;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
    }
  }

/**
 * Function triggered when the user enters any data in any field in the repeating table
 * Emits a keyup event to the user for performing any actions on keyup in any field
 * @param {any} event 
 * @memberof RepeatingTableComponent
 */
  @HostListener('keyup', ['$event'])
  onkeyup(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    let columnName:string;
    if (event.type == "keyup" && event.event == undefined) {
      let match = event.target.id.match(/[a-z]+|\d+/ig);
      if (match) {
        rowIndex = match[0] - 1;
        row = this.temp[match[0] - 1];
        columnName = match[1];
        for (let key in row) {
          if (key.toLowerCase() == match[1].toLowerCase()) {
            column[key] = row[key];
          }
        }
      }
      this.DataJson = this.temp;
      this.checkFooterColumn("");
      let changedAttributes = {};
      changedAttributes["event"] = event.type;
      changedAttributes["rowIndex"] = rowIndex;
      changedAttributes["row"] = row;
      changedAttributes["column"] = column;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
    }
  }

/**
 * Function triggered when the user focuses out from any field in the repeating table
 * Emits a focusout event to the user for performing any actions when the user focuses out from any field
 * @param {any} event 
 * @memberof RepeatingTableComponent
 */
  @HostListener('focusout', ['$event'])
  onFocusOut(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    let columnName:string;
    if(typeof event.currentTarget.tagName != "undefined"){
      if(event.currentTarget.tagName.toLowerCase() == "app-repeating-table"){
        if (event.type == "focusout") {
          let match = event.target.id.match(/[a-z]+|\d+/ig);
          if (match) {
            rowIndex = match[0] - 1;
            row = this.temp[match[0] - 1];
            columnName = match[1];
            for (let key in row) {
              if (key.toLowerCase() == match[1].toLowerCase()) {
                column[key] = row[key];
              }
            }
          }
          this.DataJson = this.temp;
          this.checkFooterColumn("");
          let changedAttributes = {};
          changedAttributes["event"] = event.type;
          changedAttributes["rowIndex"] = rowIndex;
          changedAttributes["row"] = row;
          changedAttributes["column"] = column;
          changedAttributes["modelValue"] = this.DataJson;
          this.checkRepeatingTableValidStatus();
          this.repeatingTableEvent.emit(changedAttributes);
        }
      }
    }
  }

/**
 * Function triggered when the user focuses in on any field in the repeating table
 * Emits a focusin event to the user for performing any actions when the user focuses in on any field
 * @param {any} event 
 * @memberof RepeatingTableComponent
 */
  @HostListener('focusin', ['$event'])
  onFocusin(event) {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    if(typeof event.currentTarget.tagName != "undefined"){
      if(event.currentTarget.tagName.toLowerCase() == "app-repeating-table"){
        if (event.type == "focusin") {
          let match = event.target.id.match(/[a-z]+|\d+/ig);
          if (match) {
            rowIndex = match[0] - 1;
            row = this.temp[match[0] - 1];
            for (let key in row) {
              if (key.toLowerCase() == match[1].toLowerCase()) {
                column[key] = row[key];
              }
            }
          }
          this.DataJson = this.temp;  
          let changedAttributes = {};
          changedAttributes["event"] = event.type;
          changedAttributes["rowIndex"] = rowIndex;
          changedAttributes["row"] = row;
          changedAttributes["column"] = column;
          changedAttributes["modelValue"] = this.DataJson;
          this.checkRepeatingTableValidStatus();
          this.repeatingTableEvent.emit(changedAttributes);
        }
      }
    }
  }

  /**
   * Function triggered when a people picker field in the repeating table gets its value changed
   * Emits a change event on the people picker field in the repeating table
   * @param {any} event type of event
   * @param {any} columnName name of the column
   * @param {any} index row index of the repeating table
   * @memberof RepeatingTableComponent
   */
  peoplePickerChange(event, columnName, index){
    let rowIndex: any;
    let row: any;
    let column: any = {};
    rowIndex = index;
    row = this.temp[index];
    for (let key in row) {
      if (key.toLowerCase() == columnName.toLowerCase()) {
        column[key] = row[key];
      }
    }      
    this.checkFooterColumn("");
    this.DataJson = this.temp;
      let changedAttributes = {};
      changedAttributes["event"] = "change";
      changedAttributes["rowIndex"] = rowIndex;
      changedAttributes["row"] = row;
      changedAttributes["column"] = column;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
  }

  /**
   * Function triggered when a number field in the repeating table gets its value changed
   * Emits a change event on the number field in the repeating table
   * @param {any} event type of event
   * @param {any} columnName name of the column
   * @param {any} index row index of the repeating table
   * @memberof RepeatingTableComponent
   */
  numberFieldChange(event, columnName, index)
  {
    let rowIndex: any;
    let row: any;
    let column: any = {};
    this.temp[index][columnName]= event;
    rowIndex = index;
    row = this.temp[index];
    for (let key in row) {
      if (key.toLowerCase() == columnName.toLowerCase()) {
        column[key] = row[key];
      }
    }
    this.checkFooterColumn("");
    this.DataJson = this.temp;
      let changedAttributes = {};
      changedAttributes["event"] = "change";
      changedAttributes["rowIndex"] = rowIndex;
      changedAttributes["row"] = row;
      changedAttributes["column"] = column;
      changedAttributes["modelValue"] = this.DataJson;
      this.checkRepeatingTableValidStatus();
      this.repeatingTableEvent.emit(changedAttributes);
  }

  /**
   * Function triggered when a date picker value is changed in the repeating table 
   * Emits a change event on the date time picker field 
   * @param {any} event 
   * @memberof RepeatingTableComponent
   */
  datePickerFunctions(event)
  {
    this.checkFooterColumn("");
    this.DataJson = this.temp;
    let changedAttributes = {};
    let columnObj = {};
    columnObj[event.currentColumn] = event.value; 
    changedAttributes["event"] = event.type;
    changedAttributes["rowIndex"] = event.rowIndex;
    changedAttributes["row"] = event.currentRow;
    changedAttributes["column"] = columnObj;
    changedAttributes["modelValue"] = this.DataJson;
    this.checkRepeatingTableValidStatus();
    this.repeatingTableEvent.emit(changedAttributes);
  }

  /**
   * Triggered when the repeating table component is being called
   * 
   * @memberof RepeatingTableComponent
   */
  ngOnInit() {
    if (typeof this.DataJson == "undefined" || this.DataJson.length == 0 || typeof this.DataJson.length == "undefined") {
        this.temp = [];
        let inserted = '{';
        for (let i = 0; i < this.tableJson.Columns.length; i++) {
          let defaultValueFound = false;
          if(this.controlOptions != undefined){
            if(this.controlOptions[this.tableJson.Columns[i].name].defaultValue != ""){
              defaultValueFound = true;
            }
          }
          if(defaultValueFound){
            inserted += '"' + this.tableJson.Columns[i].name + '":"'+this.controlOptions[this.tableJson.Columns[i].name].defaultValue+'",';
          }
          else{
            inserted += '"' + this.tableJson.Columns[i].name + '":"",';
          }
        }
        inserted = inserted.substr(0, inserted.length - 1);
        inserted += '}';
        inserted = JSON.parse(inserted);
  
        this.temp.push(inserted);
    }
    else{
      this.temp = this.DataJson;
    }
  }

  /**
   * Function called to add a new row in the repeating table
   * 
   * @memberof RepeatingTableComponent
   */
  addNewRow() {
    //pre add row function
    this.DataJson = this.temp;
    let changedAttributes = {};
    changedAttributes["event"] = "preRowAdd";
    changedAttributes["rowIndex"] = this.temp.length-1;
    changedAttributes["row"] = this.temp[this.temp.length-1];
    changedAttributes["column"] = "";
    changedAttributes["modelValue"] = this.temp;
    
    this.repeatingTableEvent.emit(changedAttributes);

    //add new row
    let inserted = '{';
    for (let i = 0; i < this.tableJson.Columns.length; i++) {
      inserted += '"' + this.tableJson.Columns[i].name + '":"",';
    }
    inserted = inserted.substr(0, inserted.length - 1);
    inserted += '}';
    inserted = JSON.parse(inserted);

    this.temp.push(inserted);

    //post add row functions
    this.DataJson = this.temp;
    changedAttributes = {};
    changedAttributes["event"] = "postRowAdd";
    changedAttributes["rowIndex"] = this.temp.length-1;
    changedAttributes["row"] = this.temp[this.temp.length-1];
    changedAttributes["column"] = "";
    changedAttributes["modelValue"] = this.temp;

    this.DataJson = this.temp;
    this.checkFooterColumn("");
    this.checkRepeatingTableValidStatus();
    this.repeatingTableEvent.emit(changedAttributes);
  }

  /**
   * Function called to remove a row from the repeating table
   * 
   * @param {any} index index of the row to be removed
   * @memberof RepeatingTableComponent
   */
  removeRow(index) {
    //pre row remove function
    let changedAttributes = {};
    changedAttributes["event"] = "preRowRemove";
    changedAttributes["rowIndex"] = index;
    changedAttributes["row"] = this.temp[index];
    changedAttributes["column"] = "";
    changedAttributes["modelValue"] = this.temp;

    this.DataJson = this.temp;
    this.repeatingTableEvent.emit(changedAttributes);


    //remove row
    var removedItem = this.temp.splice(index, 1);
    if (this.temp.length == 0) {
      this.addNewRow();
    }

    this.DataJson = this.temp;
    //post row remove function
    changedAttributes = {};
    changedAttributes["event"] = "postRowRemove";
    changedAttributes["rowIndex"] = index;
    changedAttributes["row"] = removedItem;
    changedAttributes["column"] = "";
    changedAttributes["modelValue"] = this.temp;

    this.DataJson = this.temp;
    this.checkFooterColumn("");
    this.checkRepeatingTableValidStatus();
    this.repeatingTableEvent.emit(changedAttributes);
  }

  /**
   * Function called when the data needs to be calculated for the footer
   * 
   * @param {any} columnName name of the column for which the sum needs to be calculated
   * @memberof RepeatingTableComponent
   */
  checkFooterColumn(columnName){
    let calculation = "";
    // calculate sum for the provided column
    if(columnName != ""){
      for (let i = 0; i < this.tableJson.Columns.length; i++) {
        if(this.tableJson.Columns[i].name == columnName){
          if(this.tableJson.Columns[i].footer != "" && this.tableJson.Columns[i].footer != undefined){
            calculation = this.tableJson.Columns[i].footer;
            break;
          }
        }
      }
      switch(calculation){
        case "sum":
        let footerSum = 0;
          for(let i = 0; i < this.temp.length; i++){
            if(this.temp[i][columnName] != undefined){
              if(this.temp[i][columnName] == ""){
                footerSum = footerSum + 0;
              }else{
                footerSum = footerSum + parseFloat(this.temp[i][columnName]); //parseFloat(yournumber.replace(/,/g, ''));
              }
            }
          }
          if(this.controlOptions[columnName]["precision"] != undefined){
            this.formDataJSON[this.tableJson.TableSettings.name+"Footer"+columnName] = parseFloat(footerSum.toFixed(this.controlOptions[columnName]["precision"]));
          }
          else{
            this.formDataJSON[this.tableJson.TableSettings.name+"Footer"+columnName] = parseFloat(footerSum.toFixed(2));
          }
        break;
      }
    }
    else{
      // calculate sum for all the columns in the table
      for (let i = 0; i < this.tableJson.Columns.length; i++) {
          if(this.tableJson.Columns[i].footer != "" && this.tableJson.Columns[i].footer != undefined){
            calculation = this.tableJson.Columns[i].footer;
            columnName = this.tableJson.Columns[i].name;
            switch(calculation){
              case "sum":
              let footerSum = 0;
                for(let i = 0; i < this.temp.length; i++){
                  if(this.temp[i][columnName] != undefined){
                    if(this.temp[i][columnName] == ""){
                      footerSum = footerSum + 0;
                    }
                    else{
                      footerSum = footerSum + parseFloat(this.temp[i][columnName]);
                    }
                  }
                }
                if(this.controlOptions[columnName]["precision"] != undefined){
                  this.formDataJSON[this.tableJson.TableSettings.name+"Footer"+columnName] = parseFloat(footerSum.toFixed(this.controlOptions[columnName]["precision"]));
                }
                else{
                  this.formDataJSON[this.tableJson.TableSettings.name+"Footer"+columnName] = parseFloat(footerSum.toFixed(2));
                }
              break;
            }
          }
      }
    }
    this.formDataJsonEvent.emit(this.formDataJSON);
  }

  /**
   * Function called to check if the current status of repeating table is valid or not
   * Checks if all the required fields have been filled out correctly
   * @memberof RepeatingTableComponent
   */
  checkRepeatingTableValidStatus(){
    let validFlag = true;
    for(let i=0;i<this.temp.length;i++){
      if (this.controlOptions != undefined) {
        for(let key in this.controlOptions){
          let obj = this.controlOptions[key];
          if(obj.required){
            if(this.temp[i][key] == "" || this.temp[i][key] == null){
              validFlag = false;
              break;
            }
          }
        }
      }
    }

    let obj = {};
    obj["tableName"] = this.tableJson.TableSettings.name;
    obj["valid"] = validFlag; 
    this.updateTableValidation.emit(obj);
    this.DataJson = this.temp;
    this.ngModelChange.emit(this.DataJson);
  }
}
