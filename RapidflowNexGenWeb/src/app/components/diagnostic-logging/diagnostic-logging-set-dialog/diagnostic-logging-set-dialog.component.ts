/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DiagnosticLoggingSetDialogComponent
Description: Provide functionality to open the diagnostic log details in popup dialog.
Location: ./diagnostic-logging-set-dialog.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { FormControl } from '@angular/forms';
import { RapidflowService } from '../../../services/rapidflow.service';
import { ProgressDialogComponent } from '../../progress-dialog/progress-dialog.component';
declare var moment;// moment variable to store moment functions 

/**
 * Component Decorator
 */
@Component({
  selector: 'app-diagnostic-logging-set-dialog',
  templateUrl: './diagnostic-logging-set-dialog.component.html',
  styleUrls: ['./diagnostic-logging-set-dialog.component.css']
})
export class DiagnosticLoggingSetDialogComponent implements OnInit {
  public diagnosticLoggingDetails: any;//diagnostic logging to initialieze start date time and duration
  public currentDiagnosticLogging: any;//current diagnostic logging information required for updating diagnostic logging
  public renderedFrom: string;//rendered from string to update either process or application diagnostic logging details
  public processGlobalSettings: any;//process global settings to update
  public currentProcessID: number;//current selected process id 


  /**
   * Default contructor with dependency injection or required services
   * @param data 
   * @param rapidflowService 
   */
  constructor( @Inject(MAT_DIALOG_DATA) public data: any, private rapidflowService: RapidflowService,public progressDialog: MatDialog, public dialogRef: MatDialogRef<DiagnosticLoggingSetDialogComponent>) {
    try {
      this.currentDiagnosticLogging = data.CurrentDiagnosticLogging;
      this.renderedFrom = data.RenderedFrom;
      this.processGlobalSettings = data.ProcessGlobalSettings;
      this.currentProcessID = data.CurrentProcessID;

      //set diagnostic logging controls based on current diagnostic loggin detaills
      this.diagnosticLoggingDetails = [];
      this.diagnosticLoggingDetails["StartDate"] = new Date().toISOString().slice(0, 16);
      this.diagnosticLoggingDetails["Duration"] = 5;
      this.diagnosticLoggingDetails["DiagnosticLoggingSet"] = false;
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("constructor-Diagnostic logging set dialog component", "Global", ex.message, ex.stack, "An error occured while rendering diagnostic logging update dialog", "N/A", 0, true);
    }
  }
  /**
   * Component initialization lifecycle hook which needs to be overridden
   */

  ngOnInit() {
  }

  /**
   * Update process or application diagnostic logging based on rendered from
   */
  updateDiagnosticLogging() {
    try {
      //show dialog
      let tempDialogRef = this.progressDialog.open(ProgressDialogComponent, {
        data: {
          message: "Please wait..."
        }
      });
      //if rendered from application
      if (this.renderedFrom == "application") {
        let newDiagnosticLoggingSettings = {
          StartDate: this.diagnosticLoggingDetails.StartDate,
          Duration: this.diagnosticLoggingDetails.Duration
        }
        //constructing new diagnostic logging json string
        let newDiagnosticLoggingUpdateString = this.currentDiagnosticLogging.PlatformSettingsID + '-' + encodeURIComponent(JSON.stringify(newDiagnosticLoggingSettings));
        this.rapidflowService.updatePlatformSettings(newDiagnosticLoggingUpdateString).subscribe((response) => {
          this.diagnosticLoggingDetails["DiagnosticLoggingSet"] = true;
          tempDialogRef.close();          
          this.dialogRef.close(this.diagnosticLoggingDetails);
        });
      }
      //if rendered from process
      else if (this.renderedFrom == "process") {
        //contruct process diagnostic logging json
        this.processGlobalSettings.DIAGNOSTIC_LOGGING.StartDate = this.diagnosticLoggingDetails.StartDate;
        this.processGlobalSettings.DIAGNOSTIC_LOGGING.Duration = this.diagnosticLoggingDetails.Duration;
        this.rapidflowService.updateProcessGlobalSettings(this.currentProcessID, encodeURIComponent(JSON.stringify(this.processGlobalSettings))).subscribe((response) => {
          this.diagnosticLoggingDetails["DiagnosticLoggingSet"] = true;
          tempDialogRef.close();
          this.dialogRef.close(this.diagnosticLoggingDetails);
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("updateProcessGlobalSettings-Diagnosting looging set dialog component", "Platform", "Error occured while executing api call", error, "An error occured while retrievePlatformSettings", " RapidflowServices.updateProcessGlobalSettings", '0', true);
          tempDialogRef.close();
        });
      }
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("updateDiagnosticLogging-Diagnostic logging set dialog component", "Global", ex.message, ex.stack, "An error occured while updating diagnostic logging", "N/A", 0, true);
    }
  }
}
