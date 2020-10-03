/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DateTimePickerComponent
Description: Provide functionality to render the datetime picker field on the form.
Location: ./date-time-picker.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Input, Output, HostListener, ElementRef, EventEmitter, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'moment';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.css']
})
export class DateTimePickerComponent implements OnInit {

  @Input('ngModel') ngModel;
  @Input('ClassName') className;
  @Input('fieldName') fieldName;
  @Input('controlOptions') controlOptions;
  

  @Output() ngModelChange = new EventEmitter();

  @Output() onDatePickerChange = new EventEmitter();

  @Output() afterDateTimePickerOpen = new EventEmitter();

  @Output() afterDateTimePickerClosed = new EventEmitter();

 
  public clicked:boolean; // Global flag of the class to check if the field has been clicked or not
  
  /**
   * Creates an instance of DateTimePickerComponent.
   * @memberof DateTimePickerComponent
   */
  constructor() { 
    this.className = "form-control";
    this.clicked = false;
  }

  /**
   * Function triggered when the date time picker component is called
   * 
   * @memberof DateTimePickerComponent
   */
  ngOnInit() {
    if(this.ngModel == null || this.ngModel == undefined || this.ngModel == ""){
      this.ngModel = "";
    }

    if(this.fieldName == undefined){
      this.fieldName = "myPicker";
    }
  }

  /**
   * Function called when the date time field has changed its value
   * It also emits the change function for the field
   * @memberof DateTimePickerComponent
   */
  dateTimeChange(){
    this.ngModel = moment(this.ngModel).toDate();
    this.ngModelChange.emit(this.ngModel);
  }

  /**
   * Function triggered when the date picker opened
   * It also emits the date time picker after open event for the field
   * @memberof DateTimePickerComponent
   */
  afterPickerOpen(){
    this.ngModel = "";
    this.clicked = true;
    this.afterDateTimePickerOpen.emit(this.ngModel);
  }

  /**
   * Function triggered when the date picker is closed
   * It also emits the date time picker after close event for the field
   * @memberof DateTimePickerComponent
   */
  afterPickerClosed(){
    if(this.ngModel){
      this.clicked = false;
    }
    this.onDatePickerChange.emit(this.ngModel);
    this.afterDateTimePickerClosed.emit(this.ngModel);
  }

  /**
   * Function called to format the current value in the 
   * model of the field to our standard date time based on type
   * @returns 
   * @memberof DateTimePickerComponent
   */
  formatDate(){
    if(this.controlOptions.pickerType.toLowerCase() == "both"){
      return moment.utc(this.ngModel).format("DD-MMM-YYYY hh:mm A");
    }
    else if(this.controlOptions.pickerType.toLowerCase() == "timer"){
      return moment.utc(this.ngModel).format("hh:mm A");
    }
    else{
      return moment.utc(this.ngModel).format("DD-MMM-YYYY");
    }
  }

}
