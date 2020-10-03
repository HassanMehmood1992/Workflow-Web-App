/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ConfirmationDialogComponent
Description: Provide functionality to get confirmation of user to take action on any item if needed.
Location: ./confirmation-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {

  /**
   * Creates an instance of ConfirmationDialogComponent.
   * @param {MatDialogRef<ConfirmationDialogComponent>} dialogRef 
   * @param {*} data 
   * @memberof ConfirmationDialogComponent
   */
  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  /**
   * Triggered when the confirmation dialog is being called
   * 
   * @memberof ConfirmationDialogComponent
   */
  ngOnInit() {
  }

  /**
   * Function to return the action of the user which is 
   * either true if the user agrees and false if the user disagrees
   * @param {any} action 
   * @memberof ConfirmationDialogComponent
   */
  closeDialog(action) {
    this.dialogRef.close(action);
  }
}
