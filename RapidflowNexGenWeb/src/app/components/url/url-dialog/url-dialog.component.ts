/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: UrlDialogComponent
Description: Provide functionality to render the url dialog when a url field is clicked in the form.
Location: ./url/url-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Inject, HostListener, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RapidflowService } from '../../../services/rapidflow.service';
import { NgModel, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-url-dialog',
  templateUrl: './url-dialog.component.html',
  styleUrls: ['./url-dialog.component.css']
})
export class UrlDialogComponent implements OnInit {

  public selectorHeading: any; // Global variable of the class to store the selector heading
  public title: any; // Global variable of the class to store the url title
  public url: any; // Global variable of the class to store the url link
  /**
   * Creates an instance of UrlDialogComponent.
   * @param {MatDialogRef<UrlDialogComponent>} dialogRef 
   * @param {*} data 
   * @param {RapidflowService} rapidflowService 
   * @param {MatDialog} dialog 
   * @param {FormBuilder} formBuilder 
   * @memberof UrlDialogComponent
   */
  constructor(public dialogRef: MatDialogRef<UrlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private rapidflowService: RapidflowService, private dialog: MatDialog, private formBuilder: FormBuilder) {
    this.selectorHeading = this.data.selectorHeading;
  }

  /**
   * Triggered when the url dialog is being called
   * 
   * @memberof UrlDialogComponent
   */
  ngOnInit() {
    if (this.selectorHeading == undefined) {
      this.selectorHeading = 'Select URL';
    }
    else {
      this.selectorHeading = this.data.selectorHeading;
    }
  }

  /**
   * Function called when the user confirms the selection of url
   * 
   * @memberof UrlDialogComponent
   */
  confirmSelection() {
    var urlObject = {
      title: this.title.toString(),
      url: this.url.toString()
    }
    this.dialogRef.close(urlObject);
  }

  /**
   * Function called to close the url dialog component
   * 
   * @memberof UrlDialogComponent
   */
  closeDialog() {
    this.dialogRef.close();
  }

}
