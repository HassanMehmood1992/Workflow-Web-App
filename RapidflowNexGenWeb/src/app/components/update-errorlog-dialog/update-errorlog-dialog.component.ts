/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: UpdateErrorlogDialogComponent
Description: Provides funcationality to update error an error log and provide resolution and rca for the error.
Location: ./update-errorlog-dialog.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { RapidflowService } from '../../services/rapidflow.service';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';

@Component({
  selector: 'app-update-errorlog-dialog',
  templateUrl: './update-errorlog-dialog.component.html',
  styleUrls: ['./update-errorlog-dialog.component.css']
})
export class UpdateErrorlogDialogComponent implements OnInit {

  /**
   * Default contructor with dependency injection of requried services and references
   * @param data 
   * @param dialogRef 
   * @param rapidflowService 
   * @param progressDialog 
   */
  constructor( @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UpdateErrorlogDialogComponent>, public rapidflowService: RapidflowService, public progressDialog: MatDialog) {

  }

  /**
   * Compnenet initialization lifecycle hook
   */
  ngOnInit() {
  }

  /**
   * Update error log information pas
   */
  saveErrorLog() {

    //show progress dialog
    let tempDialogRef = this.progressDialog.open(ProgressDialogComponent, {
      data: {
        message: "Please wait..."
      }
    });
    //update error log api call
    this.rapidflowService.updateErrorLog(this.data.LogID, this.data.Status, this.data.Category, encodeURIComponent(this.data.Resolution), encodeURIComponent(this.data.RCA)).subscribe((response) => {
      setTimeout(() => { tempDialogRef.close() }, 2000)
      this.dialogRef.close(this.data);
    },
      (error) => {
        this.rapidflowService.ShowErrorMessage("saveErrorLog-update error log dialog component", "Global", "Error occured while executing api call", error, "An error occured while updating error log", "", '0', true);

      }
    );

  }
}
