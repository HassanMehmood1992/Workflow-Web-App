/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessLookupComponent
Description: Renders the process lookup field on the form with the provided data and options
Location: ./components/process-lookup.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/

import { ProcessLookupDialogComponent } from './process-lookup-dialog/process-lookup-dialog.component';
import { Component, OnInit, Input, Output, HostListener, ElementRef, EventEmitter, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgModel, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-process-lookup',
  templateUrl: './process-lookup.component.html',
  styleUrls: ['./process-lookup.component.css']
})
export class ProcessLookupComponent implements OnInit {
  @Input('ngModel') ngModel;
  @Input('ClassName') className;
  @Input('formDataJSON') formDataJSON;
  @Input('fieldName') fieldName;
  @Input('controlOptions') controlOptions;

  @Output() ngModelChange = new EventEmitter();

  @Output() onProcessLookupChange = new EventEmitter();

  private selectionType: any; // Global variable of the class to store the selection type either single or multiple for the current lookup field
  private processId:any; // Global variable of the class to store the process id to retrieve the lookup data for that process 
  private lookupName: any; // Global variable of the class to store the process lookup name from which the data is being retrieved
  private lookupColumns: any; // Global variable of the class to store the lookup up columns that are retrieved from the process lookup data
  private columnHeadings: any; // Global variable of the class to store the column headings displayed to the user for this field
  private columnTypes: any; // Global variable of the class to store the column types that are being retrieved from the process lookup data
  private formFields: any; // Global variable of the class to store the form fields that are required to store data after selection of a row
  private filterString: any; // Global variable of the class to store the filter string for the data that is being retrieved
  private sortString: any; // Global variable of the class to store the sort string for the data that is being retrieved
  private selectorHeading: any; // Global variable of the class to store the selector heading for the process lookup dialog component
  public placeHolder: any; // Global variable of the class to store the place holder for the current field
  public clicked:boolean; // Global flag to check if the current field has been clicked or not

  /**
   * Creates an instance of ProcessLookupComponent.
   * @param {MatDialog} dialog 
   * @param {FormBuilder} formBuilder 
   * @memberof ProcessLookupComponent
   */
  constructor(public dialog: MatDialog,
    @Inject(FormBuilder) formBuilder: FormBuilder
  ) {
    this.clicked = false;
    this.className = "form-control"
  }

  /**
   * Triggered when the process lookup component is being called
   * 
   * @memberof ProcessLookupComponent
   */
  ngOnInit() {
    this.setLookupProperties();
    if (this.ngModel == undefined) {
      this.ngModel = "";
    }
  }

  /**
   * Function called when the field is clicked to select process lookup 
   * data and call the process lookup dialog to retrieve data
   * @memberof ProcessLookupComponent
   */
  openDialog(): void {
    if(!this.controlOptions.disabled && !this.controlOptions.readonly){
      this.clicked = true;
      let dialogRef = this.dialog.open(ProcessLookupDialogComponent, {
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
              if(this.columnTypes[0].toLowerCase() == "peoplepicker"){
                this.ngModel = result.modelValue[0][0].DisplayName;  
              }
              else{
                this.ngModel = result.modelValue[0];  
              }
            }
            this.ngModelChange.emit(this.ngModel);
            this.onProcessLookupChange.emit(result.modelRow);
          }
          else {
            this.clicked = true;
            this.ngModel = "";
            this.ngModelChange.emit(this.ngModel);
            this.onProcessLookupChange.emit(result);
          }
        }
      });
    }
  }

  /**
   * Function called to set up the process lookup properties
   * provided by the user
   * @memberof ProcessLookupComponent
   */
  setLookupProperties() {
    if(this.fieldName == undefined || this.fieldName == ""){
      this.fieldName = "myProcessLookup";
    }
    if (this.controlOptions != "undefined") {
      this.processId = this.controlOptions.processId;
      this.lookupName = this.controlOptions.lookupName;
      this.selectionType = this.controlOptions.selectionType;
      this.columnHeadings = this.controlOptions.columnHeadings.split(",");
      this.columnTypes = this.controlOptions.columnTypes.split(",");
      this.lookupColumns = this.controlOptions.lookupColumns.split(",");
      this.formFields = this.controlOptions.formFields.split(",");
      this.filterString = this.controlOptions.filterString;
      this.sortString = this.controlOptions.sortString.split(",");
      if (this.controlOptions.selectorHeading != undefined) {
        this.selectorHeading = this.controlOptions.selectorHeading;
      }
      else {
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
}
