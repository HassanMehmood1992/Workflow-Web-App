/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DatabaseLookupComponent
Description: Provide functionality to render the database lookup field on the form.
Location: ./database-lookup.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit, Input, Output, HostListener, ElementRef, EventEmitter, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgModel, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DatabaseLookupDialogComponent } from './database-lookup-dialog/database-lookup-dialog.component';

@Component({
  selector: 'app-database-lookup',
  templateUrl: './database-lookup.component.html',
  styleUrls: ['./database-lookup.component.css']
})
export class DatabaseLookupComponent implements OnInit {
  @Input('ngModel') ngModel;
  @Input('ClassName') className;
  @Input('formDataJSON') formDataJSON;
  @Input('fieldName') fieldName;
  @Input('controlOptions') controlOptions;

  @Output() ngModelChange = new EventEmitter();

  @Output() onDatabaseLookupChange = new EventEmitter();

  public selectionType:any; //Global variable of class to store the selection type for the data whether single or multiple
  public query:any; //Global variable of class to store the Data query requested by the user
  public columnHeadings:any; //Global variable of class to store the column headings of the data requested from the database
  public selectorHeading:any; //Global variable of class to store the selector heading for the database lookup dialog
  private columnNames: any; //Global variable of class to store the column names of the columns that are requested from the database
  private columnTypes: any; //Global variable of class to store the column types for the columns that are requested from the database
  private formFields: any; //Global variable of class to store the form fields in which the data will be stored after selection
  public placeHolder: any; //Global variable of class to store the placeholder for the current field
  public clicked:boolean; //Global flag to check if the field has been clicked or not

  /**
   * Creates an instance of DatabaseLookupComponent.
   * @param {MatDialog} dialog 
   * @param {RapidflowService} rapidflowService 
   * @memberof DatabaseLookupComponent
   */
  constructor(public dialog: MatDialog,public rapidflowService: RapidflowService) {
    this.className = "form-control"
    this.clicked = false;
    this.placeHolder = "Select data";
  }

  /**
   * Triggered when the database lookup component is called
   * 
   * @memberof DatabaseLookupComponent
   */
  ngOnInit() {
    this.setLookupProperties();
    if (this.ngModel == undefined) {
      this.ngModel = "";
    }
  }

  /**
   * Function called to open databse lookup dialog component when clicked on
   * the field. Renders a pop up to select data retrieved from the databse
   * @memberof DatabaseLookupComponent
   */
  openDialog(): void {
    try{
      if(!this.controlOptions.disabled && !this.controlOptions.readonly){
        this.clicked = true;
        let dialogRef = this.dialog.open(DatabaseLookupDialogComponent, {
          width: '30%',
          height: '55%',
          data: {
            lookupDetails: this
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result != undefined) {
            if (result.modelValue != undefined && result.modelRow != undefined) {
              if (result.modelValue.length > 1) {
                this.clicked = false;
                this.ngModel = "";
                for (let i: number = 0; i < result.modelValue.length; i++) {
                  if(this.columnTypes[0].toLowerCase() == "peoplepicker"){
                    this.ngModel += result.modelValue[i][0].DisplayName + "; ";  
                  }
                  else{
                    this.ngModel += result.modelValue[i] + "; ";  
                  }
                }
                this.ngModel = this.ngModel.substr(0, this.ngModel.length - 2);
              }
              else if (result.modelValue.length == 1) {
                if(this.columnTypes[0].toLowerCase() == "peoplePicker"){
                  this.ngModel = result.modelValue[0][0].DisplayName;  
                }
                else{
                  this.ngModel = result.modelValue[0];  
                }
              }
              this.ngModelChange.emit(this.ngModel);
              this.onDatabaseLookupChange.emit(result.modelRow);
            }
            else {
              this.clicked = true;
              this.ngModel = "";
              this.ngModelChange.emit(this.ngModel);
              this.onDatabaseLookupChange.emit(result);
            }
          }
        });
      }
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("openDialog-Database Lookup component", "Platform", "Error occured while opening database lookup dialog", error, error.stack, "N/A","",true);
    }
  }

  /**
   * Function called to initialize the database lookup properties for 
   * the dialog to display data from database
   * @memberof DatabaseLookupComponent
   */
  setLookupProperties() {
    try{
      if(this.fieldName == undefined || this.fieldName == ""){
        this.fieldName = "myProcessLookup";
      }
      if (this.controlOptions != undefined) {
          this.selectionType = this.controlOptions.selectionType;
          this.query = this.controlOptions.query;
          this.columnHeadings = this.controlOptions.columnHeadings.split(",");
          this.columnNames = this.controlOptions.columnNames.split(",");
          this.formFields = this.controlOptions.formFields.split(",");
          this.columnTypes = this.controlOptions.columnTypes.split(",");
  
        if(this.selectorHeading != undefined){
          this.selectorHeading = this.controlOptions.selectorHeading;
        }
        else{
          this.selectorHeading = "Data Selector";
        }
        if (this.controlOptions.placeholder != undefined) {
          this.placeHolder = this.controlOptions.placeholder;
        }
        else {
          this.placeHolder = "";
        }
      }
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("setLookupProperties-Database Lookup component", "Platform", "Error occured while setting lookup properties", error, error.stack, "N/A","",true);
    }
  }
}