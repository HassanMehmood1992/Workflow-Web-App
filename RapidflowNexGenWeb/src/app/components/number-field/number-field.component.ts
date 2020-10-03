/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: NumberFieldComponent
Description: Provide functionality to render the number field on the form.
Location: ./number-field.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-number-field',
  templateUrl: './number-field.component.html',
  styleUrls: ['./number-field.component.css']
})
export class NumberFieldComponent implements OnInit {

  @Input('ngModel') ngModel;
  @Input('ClassName') className;
  @Input('isFooter') isFooter;
  @Input('formDataJSON') formDataJSON; 
  @Input('controlOptions') controlOptions;

  @Output() ngModelChange = new EventEmitter();

  @Output() onNumberFieldChange = new EventEmitter();

  public clicked:boolean; // Global flag to check if the field has been clicked or not

  /**
   * Creates an instance of NumberFieldComponent.
   * @memberof NumberFieldComponent
   */
  constructor() {
    this.className = "form-control"
    this.isFooter = false;
    this.clicked = false;
  }

  /**
   * Triggered when the number field component is called
   * 
   * @memberof NumberFieldComponent
   */
  ngOnInit() {
    if(this.ngModel == undefined){
      this.ngModel = 0;
    }

    if (this.controlOptions == undefined){
      this.controlOptions = {};
      this.controlOptions["align"] =  "right";
      this.controlOptions["allowNegative"] = false;
      this.controlOptions["allowZero"] = false;
      this.controlOptions["decimal"] = ".";
      this.controlOptions["precision"] = 2;
      this.controlOptions["prefix"] = "";
      this.controlOptions["suffix"] = "";
      this.controlOptions["thousands"] = ",";
      this.controlOptions["maxLength"] = 20;
    }
  }

  /**
   * Function called when the field value is changed
   * 
   * @param {any} event 
   * @memberof NumberFieldComponent
   */
  onValueChange(event){
    if(isNaN(this.ngModel))
    {
      this.ngModel = 0;
      this.clicked = true;
      this.ngModelChange.emit(this.ngModel);
    }
    else
    {
      if(this.ngModel == 0 && this.controlOptions.required){
        this.clicked = true;
      }
      else{
        this.clicked = false;
      }
      this.ngModelChange.emit(this.ngModel);
    }
  }

  /**
   * Function called when the number field data is changed
   * Also emits the change event for the number field
   * @memberof NumberFieldComponent
   */
  emitvalue()
  {
    if(isNaN(this.ngModel))
    {
      this.ngModel = 0;
      this.clicked = true;
      this.ngModelChange.emit(this.ngModel);
      this.onNumberFieldChange.emit(0);
    }
    else
    {
      if(this.ngModel == 0 && this.controlOptions.required){
        this.clicked = true;
      }
      else{
        this.clicked = false;
      }
      this.ngModelChange.emit(this.ngModel);
      this.onNumberFieldChange.emit(this.ngModel);
    }
  }
}
