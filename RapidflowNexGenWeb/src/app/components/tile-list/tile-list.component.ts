
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: TileListComponent
Description: Provide functionality to log in the user to system.
Location: ./components/tile-list.component.ts
Author: Nabil Shahid, Sheharyar Toor
Version: 1.0.0
Modification history: none
*/

import { RapidflowService } from './../../services/rapidflow.service';
import { WorkflowRoutingService } from './../../services/workflow-routing.service';
import { AccessRequestApprovalDialogComponent } from './../access-request-approval-dialog/access-request-approval-dialog.component';
import { LookupApprovalDialogComponent } from './../lookup-approval-dialog/lookup-approval-dialog.component';
import { SortListsService } from './../../services/sort-lists.service';
import { ApprovalDialogComponent } from './../approval-dialog/approval-dialog.component';
import { Component, OnInit, Input, ChangeDetectionStrategy, NgModule, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination/dist/ngx-pagination.js';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry, MatExpansionPanel } from '@angular/material';
import * as $ from 'jquery';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { FormatdatePipe } from '../../pipes/formatdate.pipe';

import { FilterArrayPipe } from './../../pipes/filter-array.pipe';
import * as moment from 'moment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { SocketProvider } from '../../services/socket.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import { ProcessFormService } from '../../services/process-form.service';
import { ProcessDataService } from '../../services/process-data.service';

@Component({
  selector: 'app-tile-list',
  templateUrl: './tile-list.component.html',
  styleUrls: ['./tile-list.component.css']
})
export class TileListComponent implements OnInit {

  sort: boolean; // flag to sort the list items
  searchStr: any; // contain the string to filter the list
  @Input() listItems: any; // list items imported via child view
  @Input() currentFilterObject: any;// list filter object imported via child view
  @Input() listType: string;// list type imported via child view
  @Input() currentWorkflow: any; // workflow details imported via child view
  @Input() listItemsLength: number = 0; // length of items imported via child view
  @Output() savedFormActionTaken: EventEmitter<boolean> = new EventEmitter<boolean>(); // to update the source of list on event emitt

  pendingStatusVal: string = "PENDING"; // to render the item html according to pending status
  public sortObject = { "ItemHeader1": "asc" }; // default sort object of pending tasks list
  public sortObjectAscending = { "PendingSince": "desc" }; // sort object of pending tasks on applying sort
  public sortObjectSubmissions = { "Reference": "asc" }; // default sort object of submissions list
  public sortObjectAscendingSubmissions = { "Reference": "desc" }; // sort object of sumission to sort it after applying sort
  public filter: string = ''; //  filter string to filter the submissions list
  public maxSize: number = 7; // max number of submission item to retrieve in one call
  public directionLinks: boolean = true; // linking towards the soruce of list
  public dialogOpened = false; // flag to show if the dialog is opened
  public autoHide: boolean = false; // flag to auto hide the dialog 

  // pagination object for sumission for each call
  public config: PaginationInstance = {
    id: 'advanced',
    itemsPerPage: 25,
    currentPage: 1
  };

  // label of pagination on submission tile list
  public labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

  private popped = []; // array of submissions items poped up

  /**
   * Creates an instance of TileListComponent.
   * @param {Location} _location 
   * @param {MatDialog} dialog 
   * @param {ActivatedRoute} route 
   * @param {Router} router 
   * @param {SortListsService} sortListsService 
   * @param {MatDialog} lookupApprovalDialog 
   * @param {MatDialog} confirmationDialog 
   * @param {SocketProvider} socket 
   * @param {RapidflowService} rapidflowService 
   * @param {ProcessFormService} processFormService 
   * @param {ProcessDataService} processDataService 
   * @param {WorkflowRoutingService} workflowRoutingService 
   * @memberof TileListComponent
   */
  constructor(private _location: Location, public dialog: MatDialog, private route: ActivatedRoute, private router: Router, private sortListsService: SortListsService, private lookupApprovalDialog: MatDialog, private confirmationDialog: MatDialog, private socket: SocketProvider, private rapidflowService: RapidflowService, private processFormService: ProcessFormService, private processDataService: ProcessDataService, private workflowRoutingService: WorkflowRoutingService) {
    this.socket.start();
    this.sort = false
    this.sortObject['ItemHeader1'] = 'asc'
    this.sortObjectAscending['PendingSince'] = 'desc'
    this.sortObjectSubmissions['Reference'] = 'asc'
    this.sortObjectAscendingSubmissions['Reference'] = 'desc'
  }

  /**
   * component initialization lifecycle hook
   * 
   * @memberof TileListComponent
   */
  ngOnInit() {
    this.sort = false
    // assigning jquery input event to filter the list on key up
    $("#filterSearch").on('input', () => {
      this.searchStr = $("#filterSearch").val()
    });

    // assigning jquery click event to  turn on the filter on list list
    $("#searchOn").click(() => {
      this.searchStr = ''
    });

    // assigning jquery click event to  turn off the filter on list list
    $("#searchOff").click(() => {
      this.searchStr = ''
    });

    // assigning jquery click event to  turn on the sort on list list
    $("#sortOn").click(() => {
      this.sort = true

      this.sortArray()
    });
    // assigning jquery click event to  turn off the sort on list list
    $("#sortOff").click(() => {
      this.sort = false
      this.sortArray()
    });
    this.sortArray();
    // checking permission on list
    this.specialPermissions();
    if (this.listType == 'submissions') {
      window.localStorage["srcPath"] = "submissions";
    }
    else {
      window.localStorage["srcPath"] = "tasks";
    }
  }
  /**
   * Method to sort the lists
   * 
   * @memberof TileListComponent
   */
  sortArray() {
    try {
      if (this.listType == 'myPendingTasks') {
        if (!this.sort) {
          this.listItems = this.sortListsService.sort(this.listItems, this.sortObjectAscending)

        } else {
          this.listItems = this.sortListsService.sort(this.listItems, this.sortObject)
        }
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("sortArray-Tile List component", "Global", "Error occured while sorting array", error, error.stack, "N/A", "0", false);
    }
  }
  /**
   * Sets permission to show the button in action pannel when clicked on pending task to current user
   * 
   * @memberof TileListComponent
   */
  specialPermissions() {
    try {
      if (this.listType == 'submissions') {
        for (let key in this.listItems) {
          var obj = this.listItems[key];
          if (obj["DeletedOn"] && obj["InitiatedByEmail"].toLowerCase() == this.processFormService.CurrentLoggedInUser.Email.toLowerCase()) {
            obj["showRestoreIcon"] = true;
            obj["showDeleteIcon"] = false;
          }
          else if (!obj["DeletedOn"] && obj["Status"] == "SAVED" && obj["InitiatedByEmail"].toLowerCase() == this.processFormService.CurrentLoggedInUser.Email.toLowerCase()) {
            obj["showRestoreIcon"] = false;
            obj["showDeleteIcon"] = true;
          }
        }
        let specialPermissions = this.processFormService.getSpecialPermissions(this.currentWorkflow.WorkflowID);
        if (specialPermissions.indexOf("delete any") != -1) {
          for (let key in this.listItems) {
            var obj = this.listItems[key];
            if (obj["DeletedOn"]) {
              obj["showRestoreIcon"] = true;
              obj["showDeleteIcon"] = false;
            }
            else if (!obj["DeletedOn"] && obj["Status"] == "SAVED") {
              obj["showRestoreIcon"] = false;
              obj["showDeleteIcon"] = true;
            }
          }
        }
      }
    }
    catch (error) {
      // special permission tile list method error handler
      this.rapidflowService.ShowErrorMessage("specialPermissions-Tile List component", "Global", "Error occured while checking permissions", error, error.stack, "N/A", "0", false);
    }
  }
  /**
   * update page number on clicking other then current page number
   * 
   * @param {number} number 
   * @memberof TileListComponent
   */
  onPageChange(number: number) {

    this.config.currentPage = number;
  }
  /**
   * Opens the routing table of current request
   * 
   * @param {number} index 
   * @memberof TileListComponent
   */
  toggleRoutingOn(index: number) {
    this.listItems[index].Expanded = true;
  }

  /**
   * Closes the routing table of current request
   * 
   * @param {number} index 
   * @memberof TileListComponent
   */
  toggleRoutingOff(index: number) {
    this.listItems[index].Expanded = false;
  }
  /**
   * Navigate to previous state
   * 
   * @memberof TileListComponent
   */
  gotPreviousState() {
    this._location.back();
  }
  /**
   * expension panel function to open the current selected item
   * 
   * @param {MatExpansionPanel} matExpansionPanel 
   * @param {Event} event 
   * @memberof TileListComponent
   */
  expandPanel(matExpansionPanel: MatExpansionPanel, event: Event) {
    event.stopPropagation();
    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.close();
    }
  }
  /**
   * return if the indicator is the target expension pannel
   * 
   * @private
   * @param {*} target 
   * @returns {boolean} 
   * @memberof TileListComponent
   */
  private _isExpansionIndicator(target: any): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (target.classList && target.classList.contains(expansionIndicatorClass));
  }

  /**
   * format the date according to utc
   * 
   * @param {any} dateStringISO 
   * @returns 
   * @memberof TileListComponent
   */
  setTaskDateFormat(dateStringISO) {
    if (dateStringISO == "" || dateStringISO == undefined) {
      return "";
    }
    return moment.utc(dateStringISO).format("DD-MMM-YYYY hh:mm A").toUpperCase();
  }



  /**
   * Method to open the approval dialog of any request
   * 
   * @param {any} item 
   * @memberof TileListComponent
   */
  openDialog(item) {
    try {
      // open the dialog for task assignment request
      if (item.TaskType == undefined || item.TaskType == "TaskAssignment") {
        if (this.dialogOpened == false) {
          this.dialogOpened = true;

          //  retreieving the user process settings to read permission and rendering the action buttons acoordingly
          let userpermissions = this.rapidflowService.retrieveUserProcessSettings(item.ProcessID)
            .subscribe((response) => {
              try {
                let permissions = JSON.parse(response.json())[0].Process_User_Permissions;
                this.processFormService.initializeObjects();
                this.processFormService.setUserPermissions(permissions);
                this.workflowRoutingService.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
                let CurrentPendingTasksJSON = this.workflowRoutingService.getPendingTasksJSON(item.FormTasks);
                let CurrentUserTaskJSON = this.workflowRoutingService.getCurrentUserTaskJSON(CurrentPendingTasksJSON);
                // opening workflow form if form actions are required
                if (CurrentUserTaskJSON[0].FormActionsRequired != undefined && CurrentUserTaskJSON[0].FormActionsRequired) {
                  this.router.navigate(['main', 'process', item.ProcessID, 'form', item.WorkflowID, item.FormID]);
                }
                else {
                  // opening approval dialog
                  let dialogRef = this.dialog.open(ApprovalDialogComponent, {
                    width: '30%',
                    data: {
                      taskDetails: item,
                      currentWorkflow: this.currentWorkflow,
                      listType: this.listType
                    }
                  });
                  dialogRef.afterClosed().subscribe(result => {
                    this.dialogOpened = false;
                  });
                }
              }
              catch (error) {
                // user process setting response error handler
                this.rapidflowService.ShowErrorMessage("retrieveUserProcessSettings-Tile List component", "Process", "Error occured while retrieving process settings for user", error, error.stack, "N/A", item.ProcessID, true);
              }
            }, (error: any) => {
              // user process setting api call error handler
              this.rapidflowService.ShowErrorMessage("retrieveUserProcessSettings-Process component", "Process", "Error occured while executing api call", error, "An error occured while retrieveUserProcessSettings", " RapidflowServices.retrieveUserProcessSettings", item.ProcessID, true);
            })
        }
      } else
        // if the item is pending access task
        if (item.TaskType == 'AccessRequest') {
          this.dialogOpened = true;
          this.openAccessApprovalDialog(item);
        } else
          // if the item is lookup approval task
          if (item.TaskType == 'ProcessLookupChangeApproval') {
            this.dialogOpened = true;
            this.openLookupApprovalDialog(item);
          }
    }
    catch (error) {
      // methoid error handler
      this.rapidflowService.ShowErrorMessage("openDialog-Tile List component", "Process", "Error occured while opening approval dialog", error, error.stack, "N/A", item.ProcessID, true);
    }
  }
  /**
   * Open form if clicked on workflow task or open dialog for acces request or lookup approval task
   * 
   * @param {any} item 
   * @memberof TileListComponent
   */
  openForm(item) {
    try {
      if (item.TaskType == undefined || item.TaskType == "TaskAssignment") {
        if (this.dialogOpened == false) {
          this.dialogOpened = true;
          let tempObj = {};
          tempObj["currentFilterObject"] = this.currentFilterObject;
          tempObj["currentWorkflow"] = this.currentWorkflow;
          window.localStorage["submissionFilters"] = JSON.stringify(tempObj);
          this.router.navigate(['main', 'process', item.ProcessID, 'form', item.WorkflowID, item.FormID]);
        }
      }
      else

        if (item.TaskType == 'AccessRequest') {
          if (this.dialogOpened == false) {
            this.dialogOpened = true;
            this.openAccessApprovalDialog(item);
          }
        } else
          // if the item is lookup approval task
          if (item.TaskType == 'ProcessLookupChangeApproval') {
            if (this.dialogOpened == false) {
              this.dialogOpened = true;
              this.openLookupApprovalDialog(item);
            }
          }

    }
    catch (error) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("openForm-Tile List component", "Process", "Error occured while opening form", error, error.stack, "N/A", item.ProcessID, true);
    }
  }

  /**
   * Method to open the access approval dialog
   * 
   * @param {*} item 
   * @returns {*} 
   * @memberof TileListComponent
   */
  openAccessApprovalDialog(item: any): any {
    let dialogRef = this.lookupApprovalDialog.open(AccessRequestApprovalDialogComponent, {
      width: '30%',
      data: { AccessTask: item }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.dialogOpened = false;

    });
  }
  /**
   * Method to open the lookup approval dialog
   * 
   * @param {any} Item 
   * @memberof TileListComponent
   */
  openLookupApprovalDialog(Item): void {
    let dialogRef = this.lookupApprovalDialog.open(LookupApprovalDialogComponent, {
      data: { lookupTask: Item }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.dialogOpened = false;

    });
  }
  /**
   * method used in html to stringify the object into string
   * 
   * @param {any} value 
   * @returns 
   * @memberof TileListComponent
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
   * Method used for lookup approval dialog to return boolean value if the item is refering to bulk insert value
   * 
   * @param {any} item 
   * @returns 
   * @memberof TileListComponent
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
   * Method used for lookup approval dialog to return boolean value if the item is refering to modified item
   * 
   * @param {any} item 
   * @returns 
   * @memberof TileListComponent
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
   * Retrun the object parsed using json parser
   * 
   * @param {any} item 
   * @returns 
   * @memberof TileListComponent
   */
  parseJSONObject(item) {
    try {
      return JSON.parse(item);
    } catch (e) {
      return item
    }
  }

  /**
   * Method to restore or delete the saved form from tile list of submission
   * 
   * @param {any} item 
   * @param {any} currentAction 
   * @memberof TileListComponent
   */
  deleteRestoreSavedForm(item, currentAction) {
    try {
      let currentTitle = "";
      if (currentAction == "delete") {
        currentTitle = "Delete";
      }
      else {
        currentTitle = "Restore";
      }
      let userConfirmation = this.confirmationDialog.open(ConfirmationDialogComponent, {
        data: { title: currentTitle + 'Saved form', message: 'Are you sure you want to ' + currentAction + ' this saved form?' }
      });
      userConfirmation.afterClosed().subscribe(result => {
        if (result) {
          var paramsAssesment = {
            processId: item.ProcessID.toString(),
            workflowId: item.WorkflowID.toString(),
            formId: item.FormID,
            action: currentAction,
            operationType : 'PROCESS',
            diagnosticLogging: this.rapidflowService.diagnosticLoggingProcessFlag.toString()
          };
          var progressRef = this.confirmationDialog.open(ProgressDialogComponent, {
            data: {
              message: "Please wait..."
            }
          }
          );
          // calling socket call to take action of the form
          var actionresultAssesment = this.socket.callWebSocketService('deleteSavedForm', paramsAssesment)
            .then((result) => {
              if (result != null) {
                this.savedFormActionTaken.emit();
                setTimeout(() => { progressRef.close(); },
                  1500)
              }
            });
        }
      });
    }
    catch (error) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("deleteRestoreSavedForm-Tile List component", "Process", "Error occured while deleting/restoring saved form", error, error.stack, "N/A", item.ProcessID, true);
    }
  }
  /**
   * On Destroy Method
   * 
   * @memberof TileListComponent
   */
  ngOnDestroy() {
    this.dialog.closeAll();
  }
}