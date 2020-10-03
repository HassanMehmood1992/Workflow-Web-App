/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: NotificationsComponent
Description: Provide functionality to get the notifications for the user in this view. This componet also provide functionality to read, unread or delete the notification. Filter and sorting is also controlled from this view.
Location: ./notifications.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { EventEmiterService } from './../../services/event-emiters.service';
import { SortListsService } from './../../services/sort-lists.service';
import { NotificationDialogComponent } from './notification-dialog/notification-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { FormatdatePipe } from './../../pipes/formatdate.pipe';
import { DecodeUriComponentPipe } from './../../pipes/decode-uri-component.pipe';

declare var jquery: any;//jquery var declaration
declare var $: any;//jquery var declaration

/**
  * component decorator
  */
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})

export class NotificationsComponent implements OnInit {

  dialogRef: MatDialogRef<NotificationDialogComponent>;// to open individual notification in poup 
  public notifications: any[] = []; // contains all notifications
  public notificationsAvailable: boolean// flag to show if no notification is available
  public processId: any // contain current process id
  public notificationloading: boolean // flag to show if notifications are loading
  public pageNumber: number = 1; // contain pagination number
  public rowsToReturn: number = 20; // contain number of notification to receive via api call
  public sortStringNotifications: string = "desc"; // sort notification in decending order
  public searchStringNotifications: string = ""; // conatin notifications filter string
  public allNotificationsLoaded: boolean = false; // flag to check if all notifications are received from server
  public moreNotificationsLoading: boolean = false; // flag to show progress of more notifications are loading
  public debounceTimeout: any; // time out interval before making web server call to retreive filtered notifications
  public dataIsFiltered: boolean = false; // flag to check if data is filtered


  /**
  * Default constructor with dependency injection of all necessary objects and services 
  */
  constructor(private data: EventEmiterService, private RapidflowService: RapidflowService, private notificationDialog: MatDialog, private route: ActivatedRoute, private router: Router, private SortListsService: SortListsService) {
    this.notificationloading = true
    this.notificationsAvailable = true
  }


  /**
  * component initialization lifecycle hook
  */
  ngOnInit() {
    try {

      this.route.parent.parent.paramMap
        .subscribe((params: ParamMap) => {
          // sets current process id in variable
          this.processId = +params.get('ProcessID');
        });

      // sets debounce timeout variable 
      this.setSearchAndSortEvents();

      // makes server call to retreive the notifications
      this.generateNotificationsView();


    } catch (ex) {
      //notification initiation handler error
      this.RapidflowService.ShowErrorMessage("ngOnInit-notifications component", "Platform", ex.message, ex.stack, "An error occured while initiating notifications", "N/A", this.processId, true);
    }
  }

  /**
  * gets and sets notifications via api call. also checks the pagination number and filter string
  */

  generateNotificationsView() {
    this.notificationloading = true;
    if (this.searchStringNotifications != "") {
      this.dataIsFiltered = true;
    }
    else {
      this.dataIsFiltered = false;
    }

    // making api call to receive the notifications with pagination number , filter string and sort flag.
    let ProcessesDetails = this.RapidflowService.retrieveInboxNotificationDetailsWCF(this.processId, this.rowsToReturn, this.pageNumber, this.searchStringNotifications, this.sortStringNotifications)
      .subscribe((response) => {
        try {

          let tempNotifications = JSON.parse(response.json().replace(/\n/g, ""))

          // add new notifications in notifications retrieved before.

          for (let i = 0; i < tempNotifications.length; i++) {
            this.notifications.push(tempNotifications[i]);
          }
          if (tempNotifications.length < this.rowsToReturn) {
            this.allNotificationsLoaded = true;
          }

          if (this.notifications.length > 0) {
            this.notificationsAvailable = true
          } else {
            this.notificationsAvailable = false
          }
          this.notificationloading = false
        }
        catch (error) {
          //notification retrieval api  handler error
          this.RapidflowService.ShowErrorMessage("retrieveInboxNotificationDetailsWCF-Notifications Component", "Process", "Error occured while executing api call", error, error.stack, "N/A", this.processId, true);
        }
      }, (error: any) => {
        //notification generation handler error    
        this.RapidflowService.ShowErrorMessage("retrieveInboxNotificationDetailsWCF-Notifications Component", "Process", "Error occured while executing api call", error, "An error occured while retrieveInboxNotificationDetailsWCF", " RapidflowServices.retrieveInboxNotificationDetailsWCF", this.processId, true);
      });
  }


  /**
   * opens individual notification in dialog
   * 
   * @param {any} notification 
   * @param {any} index 
   * @memberof NotificationsComponent
   */
  openNotificationDialog(notification, index): void {
    try {
      this.dialogRef = this.notificationDialog.open(NotificationDialogComponent, {
        data: { notification: notification }
      });
      this.dialogRef.beforeClose().subscribe(result => {
        if (this.dialogRef.componentInstance.itemDeleted == true) {
          this.notifications.splice(index, 1)
        }
        if (this.notifications.length > 0) {
          this.notificationsAvailable = true
        }
      });

      // updates the notification if the slected notification is unread
      this.updateNotification(notification, 'Read', index)
    } catch (ex) {
      this.RapidflowService.ShowErrorMessage("openNotificationDialog-notifications component", "Platform", ex.message, ex.stack, "An error occured while opening notification dialog", "N/A", this.processId, true);
    }
  }

  /**
   * updates the notification i.e mark the notification as read, unread or delete
   * 
   * @param {any} item 
   * @param {any} Action 
   * @param {any} index 
   * @memberof NotificationsComponent
   */
  updateNotification(item, Action, index) {
    try {
      // variable to update the notification count badge and process count
      var countModification = 0

      if (Action == 'Read') {
        if (this.notifications[index].NotificationAction == 'Pending') {
          this.notifications[index].NotificationAction = "Read"
          countModification = -1
        } else {
          this.notifications[index].NotificationAction = "Read"
          countModification = 0
        }
      } else
        if (Action == 'UnRead') {
          this.notifications[index].NotificationAction = "Pending"

          countModification = 1
        } else
          if (Action == 'Delete') {
            this.notifications[index].DeleteFlag = true

            if (this.notifications[index].NotificationAction == 'Pending') {
              countModification = -1
            } else {
              countModification = 0
            }
            this.notifications.splice(index, 1)
          }
      if (this.notifications.length > 0) {

        this.notificationsAvailable = true
      }

      // sends message to  event emitter service to broadcast to main component to update the notification count
      var countObject = { "Type": "NotificationCountCalculation", Value: { "ProcessID": this.processId, "Notification": countModification } }
      this.data.changeMessage(countObject)

      // calling api to update the notification
      this.RapidflowService.updateNotificationWCF(Action, true, item.NotificationID)
        .subscribe((response) => {

        }, (error: any) => {
          //update notification api handler error    
          this.RapidflowService.ShowErrorMessage("updateNotificationWCF-Notifications Component", "Platform", "Error occured while executing api call", error._body, "An error occured while updateNotificationWCF", " RapidflowServices.updateNotificationWCF", this.processId, true);
        });
    } catch (ex) {
      //update notification method handler error    
      this.RapidflowService.ShowErrorMessage("updateNotification-notifications component", "Platform", ex.message, ex.stack, "An error occured while updating notifications", "N/A", this.processId, true);
    }
  }

  /**
   * retreive the notifications if notifications are scrolled down
   * 
   * @memberof NotificationsComponent
   */
  OnNotificationsScrollDown() {
    this.pageNumber = (this.notifications.length / this.rowsToReturn) + 1;
    this.pageNumber = Math.floor(this.pageNumber);
    if (!this.allNotificationsLoaded) {
      this.moreNotificationsLoading = true;
      setTimeout(() => {
        this.generateNotificationsView();
      }, 1000)
    }
  }

  /**
   * gets the filtered notifications
   * 
   * @memberof NotificationsComponent
   */
  getFilteredNotifications() {
    this.notifications = [];
    this.allNotificationsLoaded = false;
    this.pageNumber = 1;
    this.generateNotificationsView();
  }

  /**
   * binding the search filter event and sort event to gilter out the notifications.
   * 
   * @memberof NotificationsComponent
   */
  setSearchAndSortEvents() {
    // binding the search event filter the notifications with search string
    $("#filterSearch").on('input', (e) => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.searchStringNotifications = $("#filterSearch").val()
        this.getFilteredNotifications();
      }, 1000);
    });


    // unbinding the search event from notifications to remove filter
    $("#searchOff").click(() => {
      this.searchStringNotifications = "";
      if (this.dataIsFiltered) {
        this.getFilteredNotifications();
      }
    });

    // binding the sort event to notifications
    $("#sortOn").click(() => {
      this.sortStringNotifications = "asc";
      this.getFilteredNotifications();
    });
    // unbinding the sort event from notifications
    $("#sortOff").click(() => {
      this.sortStringNotifications = "desc";
      this.getFilteredNotifications();

    });
  }

}