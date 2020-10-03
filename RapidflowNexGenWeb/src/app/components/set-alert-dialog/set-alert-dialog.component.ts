/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SetAlertDialogComponent
Description: Dialog to allow user to set process or application alert text and expiration date.
Location: ./components/set-alert-dialog.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { RapidflowService } from '../../services/rapidflow.service';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-set-alert-dialog',
  templateUrl: './set-alert-dialog.component.html',
  styleUrls: ['./set-alert-dialog.component.css']
})
export class SetAlertDialogComponent implements OnInit {

  currentProcessGlobalSettings: any;//current process global settings passed from general settings while opening dialog
  currentProcessID: number;//current selected process id
  alertText: string = "";//alert text to show
  expiryDate: any = new Date().toISOString().slice(0, 16);//default expiry date of alert

  /**
   * Default constructor with dependency injection of required servcies and references
   * @param data 
   * @param rapidflowService 
   * @param dialogRef 
   * @param alertDialog 
   */
  constructor( @Inject(MAT_DIALOG_DATA) public data: any, private rapidflowService: RapidflowService, public dialogRef: MatDialogRef<SetAlertDialogComponent>, public alertDialog: MatDialog) {
    this.currentProcessGlobalSettings = data.CurrentProcessGlobalSettings;
    this.currentProcessID = data.CurrentProcessID;
  }

  /**
   * Component initialization lifecycle hook which needs to be overridden
   */
  ngOnInit() {
  }

  /**
   * Update process global settings to chanage process alert
   */
  updateProcessGlobalSettings() {
    try {
      if (this.alertText != undefined && this.expiryDate != undefined) {
        if (this.alertText != "") {
          //set alert object
          this.currentProcessGlobalSettings.PROCESS_ALERT.AlertText = this.alertText;
          this.currentProcessGlobalSettings.PROCESS_ALERT.ExpiryDate = this.expiryDate;

          //update process global settings api call
          this.rapidflowService.updateProcessGlobalSettings(this.currentProcessID, encodeURIComponent(JSON.stringify(this.currentProcessGlobalSettings))).subscribe((response) => {

            this.dialogRef.close(this.currentProcessGlobalSettings);
          }, (error: any) => {
            this.rapidflowService.ShowErrorMessage("updateProcessGlobalSettings-Diagnosting logging set dialog component", "Platform", "Error occured while executing api call", error, "An error occured while retrievePlatformSettings", " RapidflowServices.updateProcessGlobalSettings", '0', true);
          });
        }
        else {
          //validation dialog
          this.alertDialog.open(AlertDialogComponent, {
            data: {
              title: "Process Alert",
              message: "Please provide valid text."
            }
          })
        }
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("updateProcessGlobalSettings-Diagnosting logging set dialog component", "Platform", "Error occured while updating process global settings", error, error.stack, "N/A", '0', true);
    }
  }
}