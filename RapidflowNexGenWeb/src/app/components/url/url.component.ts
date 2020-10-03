/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: UrlComponent
Description: Provide functionality to render the url field in the form.
Location: ./url.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit, Input, Output, HostListener, ElementRef, EventEmitter, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgModel, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UrlDialogComponent } from './url-dialog/url-dialog.component';

@Component({
  selector: 'app-url',
  templateUrl: './url.component.html',
  styleUrls: ['./url.component.css']
})
export class UrlComponent implements OnInit {

  @Input('ngModel') ngModel;
  @Input('className') className;;
  @Input('fieldName') fieldName;
  @Input('formDataJSON') formDataJSON;
  @Input('controlOptions') controlOptions;

  @Output() ngModelChange = new EventEmitter();

  public selectionType: any; // Global variable of the class to store the selection type
  public selectorHeading: any; // Global variable of the class to store the selector heading
  public clicked: boolean; // Global flag of the class to check if the field has been clicked or not
  public myForm: FormGroup; // Global variable of the class to store the url validations as form

  constructor(public dialog: MatDialog, @Inject(FormBuilder) formBuilder: FormBuilder, private rapidflowService: RapidflowService) {
    this.className = "form-control"
    this.clicked = false;
    this.selectionType = 'single';
    this.selectorHeading = 'Add URL';
    this.myForm = formBuilder.group({});
  }

  /**
   * Triggered when url componant is called
   * 
   * @memberof UrlComponent
   */
  ngOnInit() {
    this.setUrlProperties();
    if (this.ngModel == null || this.ngModel == "" || this.ngModel.length == 0 || this.ngModel == undefined) {
      this.ngModel = [];
    }

    if (this.controlOptions.placeholder == null || this.controlOptions.placeholder == undefined) {
      this.controlOptions["placeholder"] = "Select URL ";
    }
  }

  /**
   * Function called when the field is clicked
   * calls the url dialog component to add a url
   * @memberof UrlComponent
   */
  openDialog(): void {
    try {
      if (!this.controlOptions.disabled && !this.controlOptions.readonly) {
        this.clicked = true;
        let dialogRef = this.dialog.open(UrlDialogComponent, {
          width: '30%',
          data: {
            selectorHeading: this.selectorHeading
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (result.length == 0 || result.length == undefined) {
              if (this.ngModel == "") {
                this.ngModel = [];
              }
              if(this.selectionType != undefined){
                if(this.selectionType == "single"){
                  if (this.controlOptions.required) {
                    this.clicked = true;
                    this.ngModel = [];
                    this.ngModel.push(result);
                  }
                  else {
                    this.clicked = false;
                    this.ngModel = [];
                    this.ngModel.push(result);
                  }
                }
                else{
                  if (this.controlOptions.required) {
                    this.clicked = true;
                    this.ngModel.push(result);
                  }
                  else {
                    this.clicked = false;
                    this.ngModel.push(result);
                  }
                }
              }
            }
            this.ngModelChange.emit(this.ngModel);
          }
        });
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("openDialog-People picker Component", "Platfrom", "Error occured while opening people picker dialog", error, error.stack, "N/A", '0', true);
    }
  }

  /**
   * Function called to remove a url from the already added urls
   * 
   * @param {any} url url to be removed
   * @param {any} index index of the item
   * @memberof UrlComponent
   */
  removeUrl(url, index) {
    try {
      for (var i = 0; i < this.ngModel.length; i++) {
        if (this.ngModel[i].title == url.title) {
          this.ngModel.splice(i, 1);
        }
      }
      if (this.ngModel.length == 0) {
        if (this.controlOptions != undefined) {
          if (this.controlOptions.required) {
            this.myForm.controls[this.fieldName] = new FormControl();
            this.myForm.controls[this.fieldName].setValidators(Validators.required);
            this.ngModelChange.emit("");
            this.ngModel = [];
          }
          else {
            this.ngModelChange.emit(this.ngModel);
            this.myForm.controls[this.fieldName] = new FormControl();
            this.myForm.controls[this.fieldName].setValidators(Validators.nullValidator);
          }
        }
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("removeFile-file attachment component", "Platform", error.message, error.stack, "An error occured while removing file", "N/A", this.formDataJSON["ProcessID"], true);
    }
    this.ngModel.splice(index, 1);
  }

  /**
   * Function called when the url component is initialized
   * 
   * @memberof UrlComponent
   */
  setUrlProperties() {
    if (this.fieldName == undefined || this.fieldName == "") {
      this.fieldName = "myUrlField";
    }
    if (this.controlOptions != undefined) {
      if (this.controlOptions.selectionType == undefined) {
        this.selectionType = 'single';
      }
      else {
        this.selectionType = this.controlOptions.selectionType;
      }

      if (this.controlOptions.selectorHeading == undefined) {
        this.selectorHeading = 'Add URL';
      }
      else {
        this.selectorHeading = this.controlOptions.selectorHeading
      }

      if (this.controlOptions.required) {
        this.myForm.controls[this.fieldName] = new FormControl();
        this.myForm.controls[this.fieldName].setValidators(Validators.required);
      }
      else {
        this.myForm.controls[this.fieldName] = new FormControl();
        this.myForm.controls[this.fieldName].setValidators(Validators.nullValidator);
      }
    }
  }
}
