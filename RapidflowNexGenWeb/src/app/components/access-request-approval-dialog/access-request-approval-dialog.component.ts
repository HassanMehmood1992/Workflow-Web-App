/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AccessRequestApprovalDialogComponent
Description: Provide functionality to approve the access request from task view. Administrators can accept or reject the access request for processes via this view.
Location: ./AccessRequestApprovalDialogComponent.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/

import { EventEmiterService } from './../../services/event-emiters.service';
import { ProgressDialogComponent } from './../progress-dialog/progress-dialog.component';
import { FormControl } from '@angular/forms';
import { RapidflowService } from './../../services/rapidflow.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

/**
  * component decorator
  */
@Component({
  selector: 'app-access-request-approval-dialog',
  templateUrl: './access-request-approval-dialog.component.html',
  styleUrls: ['./access-request-approval-dialog.component.css']
})
export class AccessRequestApprovalDialogComponent implements OnInit {

  processRolesControl = new FormControl();// used to render the input field in access approval dialog
  accessTask: any;//  stores the access request retried from tasks section.
  userComments:any;
 /**
  * Default constructor with dependency injection of all necessary objects and services 
  */
  constructor(private eventEmiterService: EventEmiterService, private dialog: MatDialog, public progressDialogReference: MatDialogRef<ProgressDialogComponent>, public dialogRef: MatDialogRef<AccessRequestApprovalDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private rapidflowService: RapidflowService) {
    try {
      // set the access request task data 
      this.accessTask = data.AccessTask;
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("constructor-access request approval dialog", "Process", "Error occured while initializing access-request-approval-dialog", error, error.stack, " rapidflowServices.retrieveRoles", this.accessTask.ProcessID, false);
    }

  }
  
  /**
  * component initialization lifecycle hook
  */
  ngOnInit() {
  }

  /**
  * action on access request.
  */
  accessRequestAction(value) {
    try {
      var title = '';
      var msg = '';
      var result = ""
      if (value != "close" && this.userComments != undefined && this.userComments != "") {
        // showing progress dialog
        this.progressDialogReference = this.dialog.open(ProgressDialogComponent, {
          data: {
            message: "Processing task ...",
          },
          disableClose: true
        });
        switch (value) {
          // if the request is approved.
          case 'yes':
            title = 'Access Request';
            msg = 'Access request has been approved';
             //Calling the api call to approve the request.
            var completeAccessRequest = this.rapidflowService.completeAccessRequest(this.accessTask.NotificationID, 'Approved', this.userComments)
              .subscribe((response) => {
                response = JSON.parse(response.json());
                if (response['message'] == "true") {
                }
                this.dialog.closeAll()
                // referesh all counts and task on home page
                this.RefereshProcessAndTasks();
              }, (error: any) => {
                // referesh all counts and task on home page
                this.RefereshProcessAndTasks()
                
                //access dialog rendering api error handler
                this.rapidflowService.ShowErrorMessage("completeAccessRequest-access request approval dialog", "Process", "Error occured while executing api call", error, "An error occured while completeAccessRequest", " rapidflowServices.completeAccessRequest", this.accessTask.ProcessID, true);
              });
            break;
          case 'no':
             // if the request is rejected.
            title = 'Access Request';
            msg = 'Access request has been rejected';
               //Calling the api call to reject the request.
            var completeAccessRequest = this.rapidflowService.completeAccessRequest(this.accessTask.NotificationID, 'Rejected', this.userComments)
              .subscribe((response) => {
                response = JSON.parse(response.json());
                if (response['message'] == "true") {
                }
                this.dialog.closeAll()
                // referesh all counts and task on home page
                this.RefereshProcessAndTasks()
              }, (error: any) => {
                // referesh all counts and task on home page
                this.RefereshProcessAndTasks()
                
                //access dialog rendering api error handler
                this.rapidflowService.ShowErrorMessage("completeAccessRequest-access request approval dialog", "Process", "Error occured while executing api call", error, "An error occured while completeAccessRequest", " rapidflowServices.completeAccessRequest", this.accessTask.ProcessID, true);
              });
            break;
          case 'close':
            break;
        }
      } else {
        if(value == "close"){
          this.dialog.closeAll()
        }
      }
    }
    catch (error) {
      //access dialog rendering logic error handler
      this.rapidflowService.ShowErrorMessage("completeAccessRequest-access request approval dialog", "Process", "Error occured while completing access request", error, error.stack, "An error occured while completing access request", this.accessTask.ProcessID, true);
    }
  }
 /**
  * Refresh other component data.
  */
  RefereshProcessAndTasks() {
    let taskRefreshObject = { "Type": "Referesh", Value: { "Tasks": "true" } }
    //sending the data to eventEmitter service to broadcast to other components
    this.eventEmiterService.changeMessage(taskRefreshObject);
    let countRefreshObject = { "Type": "AllCounts", Value: { "Count": "true" } }
        //sending the data to eventEmitter service to broadcast to other components
    this.eventEmiterService.changeMessage(countRefreshObject);
  }
}
