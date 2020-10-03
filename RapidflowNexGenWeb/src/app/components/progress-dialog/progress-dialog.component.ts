/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProgressDialogComponent
Description: Dialog to show user progress spiral when certain action is being performed for the user has to wait.
Location: ./components/progress-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/


import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.css']
})
export class ProgressDialogComponent implements OnInit {

  
  public message: string; // Global variable of the class to store the message for the progress dialog
  
  /**
   * Creates an instance of ProgressDialogComponent.
   * @param {MatDialogRef<ProgressDialogComponent>} dialogRef 
   * @param {*} data 
   * @memberof ProgressDialogComponent
   */
  constructor(public dialogRef: MatDialogRef<ProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    if(data.message!=undefined)
    {
      this.message=data.message;
    }
    else{
      this.message="Please Wait..."
    }
  }

  /**
   * Triggered when the progress dialog is being called
   * 
   * @memberof ProgressDialogComponent
   */
  ngOnInit() {
  }

  /**
   * Function called when the progress dialog is being closed
   * 
   * @memberof ProgressDialogComponent
   */
  closeDialog() {
    this.dialogRef.close();
  }
}
