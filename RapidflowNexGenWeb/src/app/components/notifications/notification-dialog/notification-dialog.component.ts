/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: NotificationDialogComponent
Description: Provide functionality to view the details in a popup view of notification opened from notification list.
Location: ./notification-dialog.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { RapidflowService } from './../../../services/rapidflow.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

import { FormatdatePipe } from './../../../pipes/formatdate.pipe';
import { DecodeUriComponentPipe } from './../../../pipes/decode-uri-component.pipe';

declare var jquery: any;
declare var $: any;

/**
 * component decorator
 * 
 * @export
 * @class NotificationDialogComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.css']
})
export class NotificationDialogComponent implements OnInit {
  statusInbox: any; // conatins status of the notification
  processNotifications: boolean; // flag to know that notification is based on workflow or other notification
  public notification: any // contain notification details
  public notificaitonbody: any // contains notification body
  refreshNotification: boolean // flag to refresh the notification count on close
  public itemDeleted: boolean // flag to set the notification as deleted or not
  /**
  * Creates an instance of NotificationDialogComponent.
  * @param {MatDialogRef<NotificationDialogComponent>} dialogRef 
  * @param {RapidflowService} rapidflowService 
  * @param {*} data 
  * @memberof NotificationDialogComponent
  */
  constructor(public dialogRef: MatDialogRef<NotificationDialogComponent>, public rapidflowService: RapidflowService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    try {

      // setting up the notification details passed to notificaiton dialog
      this.statusInbox = data.notification.NotificationAction
      this.processNotifications = false
      this.itemDeleted = false
      this.notification = data.notification;
      this.refreshNotification = false

      // set the flag to update the notification as workflow notification
      if (this.notification.WorkflowID != null && this.notification.WorkflowID != undefined && this.notification.WorkflowID != "" && this.notification.FormID != null && this.notification.FormID != undefined && this.notification.FormID != "") {
        this.notificaitonbody = decodeURIComponent(this.notification.MessageBody)
        this.processNotifications = true
      } else {
        this.processNotifications = false
        this.notificaitonbody = decodeURIComponent(this.notification.MessageBody)
      }

      // set the flag to refresh the notification count
      if (this.notification.NotificationAction == 'Pending') {
        this.refreshNotification = true
      } else {
        this.refreshNotification = false
      }
    } catch (ex) {
      //notification constructor handler error
      this.rapidflowService.ShowErrorMessage("Constructor-notification dialog component", "Platform", ex.message, ex.stack, "An error occured while initating constructor of notification dialog", "N/A", this.notification.ProcessID, true);
    }
  }

  /**
   * component initialization lifecycle hook
   * 
   * @memberof NotificationDialogComponent
   */
  ngOnInit() {
  }



  /**
   * delete the notification 
   * 
   * @memberof NotificationDialogComponent
   */
  updateNotification() {
    try {

      // calling api to delete the notification
      this.rapidflowService.updateNotificationWCF('Delete', true, this.notification.NotificationID)
        .subscribe((response) => {
          this.notification.DeleteFlag = true
          this.itemDeleted = true
          this.dialogRef.close();

        }, (error: any) => {
          //notification update api handler error
          this.rapidflowService.ShowErrorMessage("updateNotificationWCF-Notification dialog Component", "Platfrom", error, "N/A", "An error occured while updateNotificationWCF", " rapidflowServices.retrieveTODOTasksDetailsWCF", this.notification.ProcessID, true);
        });

    } catch (ex) {
      //notification constructor handler error
      this.rapidflowService.ShowErrorMessage("updateNotification-notification dialog component", "Platform", ex.message, ex.stack, "An error occured while updating notifications", "N/A", this.notification.ProcessID, true);
    }
  }

  /**
   * Navigate to workflow request from notification
   * 
   * @memberof NotificationDialogComponent
   */
  navigateToForm() {
    window.location.href = window.location.origin + window.location.pathname + '#/sharedurl/?route=form&processID=' + this.notification.ProcessID + '&workflowID=' + this.notification.WorkflowID + '&formID=' + this.notification.FormID;
    window.localStorage["srcPath"] = "notifications";
  }
}
