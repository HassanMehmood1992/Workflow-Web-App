/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AccessRequestComponent
Description: Dialog to allow user to submit an access request for a private process.
Location: ./components/access-request.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/

import { RapidflowService } from './../../../services/rapidflow.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProgressDialogComponent } from '../../progress-dialog/progress-dialog.component';
import { EventEmiterService } from '../../../services/event-emiters.service';

@Component({
  selector: 'app-access-request',
  templateUrl: './access-request.component.html',
  styleUrls: ['./access-request.component.css']
})
export class AccessRequestComponent implements OnInit {
  public processId: string; // Global variable of the class to store the process id of the process for access request
  public justification: string; // Global variable of the class to store the justification for the access request
  public correctCmdbId: boolean; // Global flag to check if the process cmdb id is correct or not
  public validatingCmdbId: boolean; // Global flag to check if the process cmdb id is validating or not
  public imagePath: string; // Global variable of the class to store the image path for the access request
  public imageMessage: string; // Global variable of the class to store the image message for the access request
  public validationDetails:any;
  /**
   * Creates an instance of AccessRequestComponent.
   * @param {MatDialog} dialog 
   * @param {RapidflowService} rapidflowService 
   * @param {MatDialogRef<AccessRequestComponent>} dialogRef 
   * @param {EventEmiterService} EventEmiterService 
   * @param {*} data 
   * @memberof AccessRequestComponent
   */
  constructor(private dialog: MatDialog,
    private rapidflowService: RapidflowService,
    public dialogRef: MatDialogRef<AccessRequestComponent>,
    private EventEmiterService: EventEmiterService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data.processId == "none") {
      this.processId = "";
    } else {
      this.processId = data.processId;
      this.checkCmdbId()
    }
    this.justification = "";
    this.imagePath = "";
    this.imageMessage = "";
    this.validatingCmdbId = false;
  }

  /**
   * Triggered when the access request component is called
   * 
   * @memberof AccessRequestComponent
   */
  ngOnInit() {
  }

  /**
   * Function called when the access request for a process
   * is submitted by the user
   * @memberof AccessRequestComponent
   */
  submitAccessRequest() {
    try {
      if (this.correctCmdbId == true) {
        let RequestedPID = this.processId;
        let AccessRequestObject = {};
        AccessRequestObject["fromUserEmail"] = "sheharyar.toor@abbvie.com";
        AccessRequestObject["initiatorEmail"] = "sheharyar.toor@abbvie.com";
        AccessRequestObject["processId"] = RequestedPID;
        AccessRequestObject["workflowId"] = '';
        AccessRequestObject["formId"] = '';
        AccessRequestObject["toUserEmail"] = '0';
        AccessRequestObject["ccUserEmails"] = '';
        AccessRequestObject["typeId"] = '3';
        AccessRequestObject["notificationTemplate"] = '';
        AccessRequestObject["attachmentMode"] = 'NONE';
        AccessRequestObject["message"] = '';
        let accessForm = {};
        accessForm["ProcessID"] = RequestedPID;
        accessForm["RoleID"] = "";
        accessForm["RoleName"] = "";
        accessForm["MessageBody"] = '';
        accessForm["Reason"] = this.justification;
        AccessRequestObject["dataPayload"] = JSON.stringify(accessForm);
        AccessRequestObject["processUrl"] = '';
        AccessRequestObject["showcaseUrl"] = '';
        let dialogRef = this.dialog.open(ProgressDialogComponent, {
          data: {
            message: "Submitting Request..."
          }
        });
        this.rapidflowService.createNotification(AccessRequestObject["typeId"], parseInt(this.validationDetails[0].ProcessID), '', '', '', '', JSON.stringify(accessForm), AccessRequestObject["attachmentMode"]).subscribe((response) => {
          let responseDetails = this.rapidflowService.parseRapidflowJSON(response);
          let refreshObject = { "Type": "Referesh", Value: { "Process": "true" } }
          this.EventEmiterService.changeMessage(refreshObject)
          this.dialog.closeAll();
        }, (error: any) => {
          this.dialog.closeAll();
          this.rapidflowService.ShowErrorMessage("createNotification-Access request component", "Platfrom", "Error occured while executing api call", error, "An error occured while createNotification", " RapidflowServices.createNotification", '0', true);
        });
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("createNotification-Access request component", "Platfrom", "Error occured while executing api call", error, error.stack, " RapidflowServices.createNotification", '0', true);
    }
  }

  /**
   * Function called to check if the current process cmdb id
   * is correct or not for the process
   * @memberof AccessRequestComponent
   */
  checkCmdbId() {
    try {
      if (this.processId != "") {
        this.imagePath = "url(assets/images/form_controls/spinner.gif)";
        this.validatingCmdbId = false;
        this.rapidflowService.validateCMDBID(this.processId).subscribe((response) => {
          this.validatingCmdbId = false;
          this.validationDetails = this.rapidflowService.parseRapidflowJSON(response);
          if (this.validationDetails[0].ProcessResolved == "true" && this.validationDetails[0].ProcessID != undefined && this.validationDetails[0].ProcessID != "") {
            this.correctCmdbId = true;
            this.imagePath = "url(assets/images/others/Tick.png)";
            this.imageMessage = "Process validated with the provided ID"
          }
          else {
            this.correctCmdbId = false;
            this.imagePath = "url(assets/images/others/Cross.png)";
            this.imageMessage = "Process does not exist with the provided ID";
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("validateCMDBID-Access request component", "Platfrom", "Error occured while executing api call", error, "An error occured while validateCMDBID", " RapidflowServices.validateCMDBID", '0', true);
        });
      } else {
        this.correctCmdbId = false;
        this.imagePath = "url(assets/images/others/Cross.png)";
        this.imageMessage = "Process does not exist with the provided ID";
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("checkCmdbId-Access request component", "Platfrom", "Error occured while executing api call", error, error.stack, "N/A", '0', true);
    }
  }
}
