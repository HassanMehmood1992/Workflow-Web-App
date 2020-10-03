/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: LookupApprovalDialogComponent
Description: Provide functionality to log in the user to system.
Location: ./lookup-approval-dialog.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { EventEmiterService } from './../../services/event-emiters.service';
import { Router } from '@angular/router';
import { ProgressDialogComponent } from './../progress-dialog/progress-dialog.component';
import { RapidflowService } from './../../services/rapidflow.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

/**
  * component decorator
  */
@Component({
  selector: 'app-lookup-approval-dialog',
  templateUrl: './lookup-approval-dialog.component.html',
  styleUrls: ['./lookup-approval-dialog.component.css']
})
export class LookupApprovalDialogComponent implements OnInit {

  dialogRef: MatDialogRef<ProgressDialogComponent>; // to render the progress dialog
  lookupTask: any; // contain the lookup task information

  /**
 * Default constructor with dependency injection of all necessary objects and services 
 */
  constructor(private eventEmiterService: EventEmiterService, private dialog: MatDialog, private router: Router, @Inject(MAT_DIALOG_DATA) public data: any, private rapidflowService: RapidflowService) {
    this.lookupTask = data.lookupTask; // retieve the lookup data passed to lookup approval dialog while opening the lookup task.
    try {
      // set the daefault label of lookup item columns
      if (typeof this.lookupTask.lookupDispalyAndTitleArray != "object"&&typeof this.lookupTask.lookupDispalyAndTitleArray != "undefined"&&this.lookupTask.lookupDispalyAndTitleArray != "") {
        this.lookupTask.lookupDispalyAndTitleArray = JSON.parse(this.lookupTask.lookupDispalyAndTitleArray);
      }
    } catch (e) {
      //lookup task constructor error handler
      this.rapidflowService.ShowErrorMessage("ngOnInit-lookup approval dialog component", "Global", e.message, e.stack, "An error occured while initiating lookup approval dialog", "N/A", "0", true);
    }

  }
  /**
    * component initialization lifecycle hook
    */
  ngOnInit() {
  }
  /**
   * Refresh other component data.
   */
  RefereshLookupsAndProcessAndTasks() {
    let taskRefreshObject = { "Type": "Referesh", Value: { "Tasks": "true" } }
    //sends data to event emitter for broadcasting the message to reload the components
    this.eventEmiterService.changeMessage(taskRefreshObject);
    let countRefreshObject = { "Type": "AllCounts", Value: { "Count": "true" } }
    //sends data to event emitter for broadcasting the message to reload the counts
    this.eventEmiterService.changeMessage(countRefreshObject);
  }

  /**
    * taking action on ookup approval task.
  */
  completeLookupChangeApprovalTask = (action) => {
    try {
      // shows the progress dialog
      this.dialogRef = this.dialog.open(ProgressDialogComponent, {
        data: {
          message: "Processing task ...",
        },
        disableClose: true
      });
      this.dialogRef.afterClosed().subscribe(result => {
        this.dialog.closeAll();
      });
      switch (action) {
        case 'approved':
          // call the lookup task completion api call for approval
          var completeProcessLookupApprovalRequest = this.rapidflowService.completeProcessLookupApprovalRequestWCF(this.lookupTask.ToUserEmail, this.lookupTask.ToDisplayName, 'approved', this.lookupTask.NotificationID, this.lookupTask.LookupDataID)
          completeProcessLookupApprovalRequest.subscribe((result) => {
            result = JSON.parse(result.json())
            if (result['message'] != undefined) {
            }
            else {
            }
            this.dialog.closeAll();
            // referesh all counts and task on home page
            this.RefereshLookupsAndProcessAndTasks()
          }, (error: any) => {
            //lookup approval api error handler
            this.rapidflowService.ShowErrorMessage("completeProcessLookupApprovalRequestWCF-Lookup approval dialog", "Process", "Error occured while executing api call", error, "An error occured while completeProcessLookupApprovalRequestWCF", " RapidflowServices.completeProcessLookupApprovalRequestWCF", this.lookupTask.ProcessID, true);
          });
          break;
        case 'rejected':
          // call the lookup task completion api call for rejection
          var completeProcessLookupApprovalRequest = this.rapidflowService.completeProcessLookupApprovalRequestWCF(this.lookupTask.ToUserEmail, this.lookupTask.ToUserName, 'rejected', this.lookupTask.NotificationID, this.lookupTask.LookupDataID)
          completeProcessLookupApprovalRequest.subscribe((result) => {
            result = JSON.parse(result.json())
            if (result['message'] != undefined) {
            }
            else {
            }
            this.dialog.closeAll();
            // referesh all counts and task on home page
            this.RefereshLookupsAndProcessAndTasks()
          }, (error: any) => {
            //lookup approval api error handler
            this.rapidflowService.ShowErrorMessage("completeProcessLookupApprovalRequestWCF-Lookup approval dialog", "Process", "Error occured while executing api call", error, "An error occured while completeProcessLookupApprovalRequestWCF", " RapidflowServices.completeProcessLookupApprovalRequestWCF", this.lookupTask.ProcessID, true);
          });
          break;
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("completeLookupChangeApprovalTask-lookup approval dialog component", "Global", error.message, error.stack, "An error occured while initiating lookup approval dialog", "N/A", "0", true);
    }
  }

  /**
  * return string to html if object is found
  */

  retrunstring(value) {
    var itemvalue = ""
    if (typeof value === "object") {
      itemvalue = ""
      for (var m = 0; m < value.length; m++) {
        itemvalue += value[m].DisplayName
        if (m != (value.length - 1)) {
          itemvalue += "; ";
        }
      }
    } else {
      itemvalue = value
    }
    return itemvalue
  }

  /**
* return boolean to html if the task is refering to bulk item entry
*/

  checkBulkInsert(item) {
    if (item.LookupDataID != undefined) {
      if (item.LookupDataID.split(',').length > 1) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  /**
  * return boolean to html if the task is refering to modification of item
  */
  checkModified(item) {
    var jsonobj
    var item = item
    try {
      jsonobj = JSON.parse(item)
    } catch (e) {
      jsonobj = ""
    }
    if (jsonobj == "" || jsonobj == undefined || jsonobj == null) {
      return false
    }
    if (typeof jsonobj === "object") {
      return true
    } else {
      return false
    }
  }

  /**
  * return parsed JSon to html if the value is json string
  */
  parseJSONObject(item) {
    try {
      return JSON.parse(item);
    } catch (e) {
      return item
    }
  }
}
