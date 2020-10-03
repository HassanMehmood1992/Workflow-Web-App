/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DiagnosticLogToggleComponent
Description: Provide functionality to expand the diagnostic log details.
Location: ./diagnostic-log-toggle.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DiagnosticLoggingSetDialogComponent } from '../diagnostic-logging-set-dialog/diagnostic-logging-set-dialog.component';
import * as moment from 'moment';
import { RapidflowService } from '../../../services/rapidflow.service';
import { ProcessDataService } from '../../../services/process-data.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-diagnostic-log-toggle',
  templateUrl: './diagnostic-log-toggle.component.html',
  styleUrls: ['./diagnostic-log-toggle.component.css']
})
export class DiagnosticLogToggleComponent implements OnInit {

  @Input() renderedFrom: string;//rendered from input to set diagostic log for either application or process
  timingDisplayString: string = "";//descriptive string showing current diagnostic log setting 
  diagnosticLoggingChecked: boolean = false;//diagnostic logging toggle button model
  currentDiagnosticLogging: any;//current diagnostic logging setting to see diagnostic loggin string on load
  currentProcessID: number;//current selected process in case rendered from process
  processGlobalSettings: any;//current process global settings used to update diagnostic loggic
  noPermission: boolean = true;//flag to indicate if the user has permission to view this page
  currentLoggedInUser: any;//set current logged in user from local storage

  /**
   * Default constructor with dependency injection of all necessary objects and services 
   * @param dialog 
   * @param rapidflowService 
   * @param ProcessDataService 
   * @param route 
   */

  constructor(private dialog: MatDialog, private rapidflowService: RapidflowService, private ProcessDataService: ProcessDataService, private route: ActivatedRoute, private rtr:Router) {

  }

  /**
   * Default lifecycle hook of view initialization which sets the current diagnostic log string
   */
  ngOnInit() {
    try {
      if(window.localStorage['User']==undefined)
      {
         return;
      }
      else{
        this.currentLoggedInUser=JSON.parse(window.localStorage["User"]);
      }
      
      //if rendered from application diagnostic log
      if (this.renderedFrom == "application") {
        //retrieve diagnostic logging from api call
        this.rapidflowService.retrievePlatformSettings().subscribe((response) => {
          let tempSettings = response.json();
          //replcae json violating characters
          tempSettings = tempSettings.replace(/\\/g, "\\\\")
          tempSettings = tempSettings.replace(/\n/g, "");
          tempSettings = tempSettings.replace(/\r/g, "");
          tempSettings = JSON.parse(tempSettings);
          
          for (let i = 0; i < tempSettings.length; i++) {
            if (tempSettings[i].SettingName.toLowerCase() == "support_operations_group") {
              for (let j = 0; j < tempSettings[i].Value.length; j++) {
                //if current user is support person
                if (tempSettings[i].Value[j].Email.toLowerCase() == this.currentLoggedInUser.Email.toLowerCase()) {
                  this.noPermission = false;
                  break;
                }
              }

            }
          }

          for (let i = 0; i < tempSettings.length; i++) {
            //find current diagnostic logging from platform settings and set diagnostic logging string
            if (tempSettings[i].SettingName == "DIAGNOSTIC_LOGGING") {
              this.currentDiagnosticLogging = tempSettings[i];
              if (JSON.stringify(tempSettings[i].Value) != "{}") {
                this.timingDisplayString = "Starting from ";
                this.timingDisplayString += this.getFormattedDate(new Date(tempSettings[i].Value.StartDate)) + " for ";
                this.timingDisplayString += tempSettings[i].Value.Duration + " minutes";
                this.diagnosticLoggingChecked = true;
              }
              else {
                //if diagnostic logging config empty
                this.timingDisplayString = "";
              }
            }
          }
        }, (error: any) => {
          //error handler retrieve platform settings
          this.rapidflowService.ShowErrorMessage("retrievePlatformSettings-Diagnosting log toggle component", "Platform", "Error occured while executing api call", error, "An error occured while retrievePlatformSettings", " RapidflowServices.retrievePlatformSettings", '0', true);
        });
      }
      //case rendered from process diagnostic log page
      else if (this.renderedFrom == "process") {
        this.route.parent.parent.params.subscribe(params => {
          this.currentProcessID = parseInt(params['ProcessID']);
        });
        //get process global settings from process data service, keep retrying in case of refresh
        var timeintervalGlobalSettings = setInterval(() => {
          if (this.ProcessDataService.processGlobalSettings != undefined && this.ProcessDataService.processGlobalSettings != null) {
            this.processGlobalSettings = this.ProcessDataService.processGlobalSettings[0];
            this.currentDiagnosticLogging = this.processGlobalSettings.Process_Settings.DIAGNOSTIC_LOGGING;
            //set process diagnostic log string
            if (JSON.stringify(this.currentDiagnosticLogging) != "{}") {
              this.timingDisplayString = "Starting from ";
              this.timingDisplayString += this.getFormattedDate(new Date(this.currentDiagnosticLogging.StartDate)) + " for ";
              this.timingDisplayString += this.currentDiagnosticLogging.Duration + " minutes";
              this.diagnosticLoggingChecked = true;
            }
            else {
              //set string empty of if diagnostic log config is empty
              this.timingDisplayString = "";
            }
          }
          clearInterval(timeintervalGlobalSettings);
          return;
        }, 1000);
        var timeintervalDiagnostic = setInterval(() => {
          if (this.ProcessDataService.userProcessSettings != undefined && this.ProcessDataService.userProcessSettings != null) {
            let supportOperationsGroup = this.ProcessDataService.userProcessSettings[0].Support_Operations_Group;
            for (var i = 0; i < supportOperationsGroup.length; i++) {
              if (supportOperationsGroup[i].Email.toLowerCase() == this.currentLoggedInUser.Email.toLowerCase()) {
                this.noPermission = false;
                break;
              }
            }
            clearInterval(timeintervalDiagnostic);
            return;
          }
        }, 1000)
      }
      //get platform settings to see if user has permission if opened from url directly
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("ngOnInit-Diagnostic Loggin set dialog component", "Global", ex.message, ex.stack, "An error occured while rendering diagnostic logging. ", "N/A", 0, true);
    }
  }

  /**
   * Opens diagnostic logging set unset dialog to configure diagnostic logging
   */
  showChangeDignosticLoggingDialog() {
    try {
      if (this.diagnosticLoggingChecked) {
        let tempGlobalSettings = {};
        if (this.renderedFrom == "process") {
          tempGlobalSettings = this.processGlobalSettings.Process_Settings;
        }
        let dialogRef = this.dialog.open(DiagnosticLoggingSetDialogComponent, {
          width: '500px',
          height: '238px',
          data: { CurrentDiagnosticLogging: this.currentDiagnosticLogging, RenderedFrom: this.renderedFrom, ProcessGlobalSettings: tempGlobalSettings, CurrentProcessID: this.currentProcessID }
        });
        dialogRef.afterClosed().subscribe(result => {
          //set diagnostic logging based of values returned by he dialgog
          if (result != undefined && result["StartDate"] != undefined && result["DiagnosticLoggingSet"]) {
            this.timingDisplayString = "Starting from ";
            this.timingDisplayString += this.getFormattedDate(new Date(result["StartDate"]));
            this.timingDisplayString += " for ";
            this.timingDisplayString += result["Duration"] + " minutes";

            //if rendered form process set locally saved process global settings
            if (this.renderedFrom == "process") {
              this.ProcessDataService.processGlobalSettings[0].Process_Settings.DIAGNOSTIC_LOGGING = result;
              this.rapidflowService.diagnosticLoggingProcessFlag = this.rapidflowService.getDiagnosticLoggingFlag(result);
            }
            else {
              this.rapidflowService.diagnosticLoggingApplicationFlag = this.rapidflowService.getDiagnosticLoggingFlag(result)
            }
          }
          else {
            this.diagnosticLoggingChecked = false;
          }
        });
      }
      else {
        this.timingDisplayString = "";
        if (this.renderedFrom == "application") {
          //update diagnostic log application if rendered from applciation
          this.updateDiagnosticLoggingApplication();
          this.rapidflowService.diagnosticLoggingApplicationFlag = false;
        }
        else if (this.renderedFrom == "process") {
          //update diagnostic log process if rendered from processs
          this.updateDiagnosticLoggingProcess();
          this.rapidflowService.diagnosticLoggingProcessFlag = false;
        }
      }
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("showChangeDignosticLoggingDialog-Diagnostic logging set dailog Settings component", "Global", ex.message, ex.stack, "An error occured while rendering diagnostic loggin update dialog ", "N/A", 0, true);
    }
  }
  /**
   * 
   * @param dateStringISO 
   */
  getFormattedDate(dateStringISO) {
    return moment.utc(dateStringISO.toLocaleString()).format("DD-MMM-YYYY h:mm a")
  }

  /**
   * Update applicaiton platfrom settings by calling update platform settings api call
   */
  updateDiagnosticLoggingApplication() {
    let newDiagnosticLoggingSettings = {}
    let newDiagnosticLoggingUpdateString = this.currentDiagnosticLogging.PlatformSettingsID + '-' + encodeURIComponent(JSON.stringify(newDiagnosticLoggingSettings));
    this.rapidflowService.updatePlatformSettings(newDiagnosticLoggingUpdateString).subscribe((response) => {
    });
  }

  /**
   * Update diagnostic logging process by calling update process global settings api call
   */
  updateDiagnosticLoggingProcess() {
    let tempGlobalSettings = JSON.parse(JSON.stringify(this.processGlobalSettings.Process_Settings))
    tempGlobalSettings.DIAGNOSTIC_LOGGING = {};
    this.rapidflowService.updateProcessGlobalSettings(this.currentProcessID, encodeURIComponent(JSON.stringify(tempGlobalSettings))).subscribe((response) => {
      this.ProcessDataService.processGlobalSettings[0].Process_Settings.DIAGNOSTIC_LOGGING = {};
    }, (error: any) => {
      this.rapidflowService.ShowErrorMessage("updateProcessGlobalSettings-Diagnosting log toggle component", "Platform", "Error occured while executing api call", error, "An error occured while retrievePlatformSettings", " RapidflowServices.updateProcessGlobalSettings", '0', true);
    });
  }
}
