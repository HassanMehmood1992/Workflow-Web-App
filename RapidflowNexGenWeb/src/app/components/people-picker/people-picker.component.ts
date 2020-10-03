/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PeoplePickerComponent
Description: Provide functionality to render the people picker field in the form.
Location: ./people-picker.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit, Input, Output, HostListener, ElementRef, EventEmitter, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgModel, FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';
import { PeoplePickerDialogComponent } from './people-picker-dialog/people-picker-dialog.component';

@Component({
  selector: 'app-people-picker',
  templateUrl: './people-picker.component.html',
  styleUrls: ['./people-picker.component.css']
})
export class PeoplePickerComponent implements OnInit {
  @Input('ngModel') ngModel;
  @Input('selfSelection') selfSelection;
  @Input('selectionType') selectionType;
  @Input('groupSelection') groupSelection;
  @Input('ClassName') className;
  @Input('selectorHeading') selectorHeading;
  @Input('controlOptions') controlOptions;
  @Input('fieldName') fieldName;
  @Input('cacheUser') cacheUser;
  

  @Output() ngModelChange = new EventEmitter();

  @Output() onPeoplePickerChange = new EventEmitter();

  public placeHolder:string; // Global variable of the class to store the placeholder for the field
  public clicked:boolean; // Global flag of the class to check if the field has been clicked or not
  
  /**
   * Creates an instance of PeoplePickerComponent.
   * @param {MatDialog} dialog 
   * @param {FormBuilder} formBuilder 
   * @param {RapidflowService} rapidflowService 
   * @memberof PeoplePickerComponent
   */
  constructor(public dialog: MatDialog,@Inject(FormBuilder) formBuilder: FormBuilder,private rapidflowService: RapidflowService) {
    this.clicked = false;
    this.className="form-control"
  }

  /**
   * Triggered when the people picker component is called
   * 
   * @memberof PeoplePickerComponent
   */
  ngOnInit() {
    try{
      this.setPeoplePickerProperties();
      if (this.ngModel == undefined) {
        this.ngModel = [];
      }
      if (this.ngModel.length == undefined) {
        let tempObject = this.ngModel;
        this.ngModel = [];
        this.ngModel.push(tempObject);
      }
      if(this.selectorHeading == undefined || this.selectorHeading == "")
      {
        if(this.groupSelection){
          this.selectorHeading = "Group Selector"
        }
        else{
          this.selectorHeading = "Person Selector"
        }
      }
  
      if(this.groupSelection){
        this.placeHolder = "Enter group name"
      }
      else{
        this.placeHolder = "Enter person name or email address"
      }
  
      if(this.groupSelection == undefined || this.groupSelection == ""){
        this.groupSelection = false;
      }
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("ngOnInit-People picker Component", "Platfrom", "Error occured while initializing people picker", error, error.stack, "N/A",'0',true);
    }
  }

  /**
   * Function called when the people picker field is clicked to select a user
   * calls the people picker dialog component and sets values in the field model
   * @memberof PeoplePickerComponent
   */
  openDialog(): void {
    try{
      if(!this.controlOptions.disabled && !this.controlOptions.readonly){
        this.clicked = true;
        let dialogRef = this.dialog.open(PeoplePickerDialogComponent, {
          width: '30%',
          data: {
            model: this.ngModel,
            selfSelection: this.selfSelection,
            selectionType: this.selectionType,
            selectorHeading: this.selectorHeading,
            groupSelection: this.groupSelection,
            cacheUser: this.cacheUser
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if(result){
            if(result.length == 0 || result.length == undefined){
              if(this.controlOptions.required){
                this.clicked = true;
                this.ngModel = result;
                this.ngModelChange.emit(this.ngModel);
              }
              else{
                this.clicked = false;
              }
            }  
            this.ngModelChange.emit(result);
            this.onPeoplePickerChange.emit(result);
          }
        });
      }
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("openDialog-People picker Component", "Platfrom", "Error occured while opening people picker dialog", error, error.stack, "N/A",'0',true);
    }
  }

  /**
   * Function called when the people picker properties are initialized
   * from the provided properties of the people picker
   * @memberof PeoplePickerComponent
   */
  setPeoplePickerProperties(){
    try{
      if(this.fieldName == undefined || this.fieldName == ""){
        this.fieldName = "myPeoplePicker";
      }
      if (this.controlOptions != undefined) {
        if(this.controlOptions.selectionType != undefined){
          this.selectionType = this.controlOptions.selectionType;
        }
        else if(this.selectionType == undefined){
          this.selectionType = "single";
        }

        if(this.controlOptions.selfSelection != undefined){
          this.selfSelection = this.controlOptions.selfSelection;
        }
        else if(this.selfSelection == undefined){
          this.selfSelection = true;
        }

        if(this.controlOptions.selectorHeading != undefined){
          this.selectorHeading = this.controlOptions.selectorHeading;
        }
        else if(this.selectorHeading == undefined){
          if(this.groupSelection){
            this.selectorHeading = "Group Selector"
          }
          else{
            this.selectorHeading = "Person Selector"
          }
        }
        if(this.controlOptions.placeholder == undefined){
          if(this.groupSelection){
            this.controlOptions.placeholder = "Select group";
          }
          else{
            this.controlOptions.placeholder = "Select person";
          }
        }
      }
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("setPeoplePickerProperties-People picker Component", "Platfrom", "Error occured while setting people picker properties", error, error.stack, "N/A",'0',true);
    }
  }

}
