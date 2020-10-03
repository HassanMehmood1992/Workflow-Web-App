/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ErrorReportingDialogComponent
Description: Provide functionality to get confirmation from user to report the error via popup dialog.
Location: ./error-reporting-dialog.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';


/**
  * component decorator
  */
@Component({
  selector: 'app-error-reporting-dialog',
  templateUrl: './error-reporting-dialog.component.html',
  styleUrls: ['./error-reporting-dialog.component.css']
})
export class ErrorReportingDialogComponent implements OnInit {
  ErrorDialogHeader: string;//error dialog top header text
  ErrorDialogbody: string;//error dialog body text
  userText: string;//text to show to user
  methodName: any;//method name in which error occured

  /**
   * Default constructor with dependency injection of all necessary objects and services 
   * @param data 
   * @param dialogRef 
   */
  constructor( @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ErrorReportingDialogComponent>) {
    this.methodName = data.methodName
    this.userText = data.userText;
    this.ErrorDialogHeader = "Error"//default dialog header
    this.ErrorDialogbody = this.userText



  }

  /**
    * component initialization lifecycle hook which is needed to be overridden
    */
  ngOnInit() {
  }

  /**
   * Closes dialog on ok click button click 
   */

  okClick() {
    this.dialogRef.close(false);

  }

  /**
     * Closes dialog on report error button click
     */

  reportErrorLog() {
    this.dialogRef.close(true);
  }
}
