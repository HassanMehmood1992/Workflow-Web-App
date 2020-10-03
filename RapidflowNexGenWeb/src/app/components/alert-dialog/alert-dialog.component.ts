/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AlertDialogComponent
Description: Provide functionality to show the acknowledgement messages to the user.
Location: ./alert-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnInit {

  /**
   * Creates an instance of AlertDialogComponent.
   * @param {MatDialogRef<AlertDialogComponent>} dialogRef 
   * @param {*} data 
   * @memberof AlertDialogComponent
   */
  constructor(public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  /**
   * Function triggered when the alert dialog is rendered
   * 
   * @memberof AlertDialogComponent
   */
  ngOnInit() {
  }

  /**
   * Closes the alert dialog
   * 
   * @memberof AlertDialogComponent
   */
  closeDialog() {
    this.dialogRef.close();
  }

}
