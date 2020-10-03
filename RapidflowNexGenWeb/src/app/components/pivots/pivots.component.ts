
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PivotsComponent
Description: Provide functionality to render the list of pivots of current openned process for user based on view permission.
Location: ./pivot-page.component.ts
Author: Amir  Hussain
Version: 1.0.0
Modification history: none
*/
import { SortListsService } from './../../services/sort-lists.service';

import { ProcessDataService } from './../../services/process-data.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material';
import { PublishPivotDialogComponent } from '../publish-pivot-dialog/publish-pivot-dialog.component';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

declare var jquery: any;//jquery var declaration
declare var $: any;//jquery var declaration

/**
 * component decorator
 * 
 * @export
 * @class PivotsComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-pivots',
  templateUrl: './pivots.component.html',
  styleUrls: ['./pivots.component.css']
})
export class PivotsComponent implements OnInit {
  progressDialogRef: any; // to show the progress if pivot is delted or updated
  static pivotName: any;// contain current pivot name
  public Pivots: any;// contain list of pivots
  public processId: any;// contain current process id
  public pivotsAvailabe: boolean; // flag if the pivots are available or not
  public searchStr = "" // contain the search string to filter the pivots
  public sort: boolean // flag to set sort on the pivot lists
  public pivotsLoading: boolean = true; // flag to set the progress bar if the pivots are loading
  public sortObject = {}; // default sort object
  public sortObjectAscending = {}; // sort object to sort list after applyig the sort
  public currentUser: any = JSON.parse(window.localStorage['User']);// contain current looged in user information

  /**
   * Creates an instance of PivotsComponent.
   * @param {RapidflowService} RapidflowService 
   * @param {ActivatedRoute} route 
   * @param {Router} router 
   * @param {MatDialog} progressDialog 
   * @param {ProcessDataService} ProcessDataService 
   * @param {SortListsService} SortListsService 
   * @param {MatDialog} publishDialog 
   * @param {MatDialog} confirmationDialog 
   * @memberof PivotsComponent
   */
  constructor(private RapidflowService: RapidflowService, private route: ActivatedRoute, private router: Router, private progressDialog: MatDialog, private ProcessDataService: ProcessDataService, private SortListsService: SortListsService, private publishDialog: MatDialog, private confirmationDialog: MatDialog) {
    this.pivotsAvailabe = true
    this.Pivots = []
    this.sort = false
    this.sortObject['Title'] = 'asc'
    this.sortObjectAscending['ProcessObjectID'] = 'asc'

  }

  /**
   * method to sort the pivots
   * 
   * @memberof PivotsComponent
   */
  sortArray() {

    if (this.sort) {


      this.Pivots = this.SortListsService.sort(this.Pivots, this.sortObject)
    } else {

      this.Pivots = this.SortListsService.sort(this.Pivots, this.sortObjectAscending)
    }
  }
  /**
   *  component initialization lifecycle hook
   * 
   * @memberof PivotsComponent
   */
  ngOnInit() {

    this.Pivots = []
    try {

      // assigning the search filter input event to filter the pivots list
      $("#filterSearch").on('input', () => {
        this.searchStr = $("#filterSearch").val()
        //  alert('ok')
      });

      // assigning the search filter ON event on the pivots list
      $("#searchOn").click(() => {
        this.searchStr = ''
        // alert('ok')    
      });
      // assigning the search filter Off event on the pivots list
      $("#searchOff").click(() => {
        this.searchStr = ''
        // alert('ok')
      });

      // assigning the sort ON event on the pivots list
      $("#sortOn").click(() => {
        this.sort = true

        this.sortArray()
        // alert('ok')
      });

      // assigning the sort Off event on the pivots list
      $("#sortOff").click(() => {
        this.sort = false
        this.sortArray()
        // alert('ok')
      });

      this.route.parent.parent.paramMap
        .subscribe((params: ParamMap) => {

          // gets current process id    
          this.processId = +params.get('ProcessID');
          var timeinterval = setInterval(() => {

            // finding the pivots from process data service continueously untill it found.
            if (this.ProcessDataService.pivots != undefined && this.ProcessDataService.pivots != null && this.ProcessDataService.objectsLoading == false) {

              this.Pivots = this.ProcessDataService.pivots

              // checking pivots availibity
              if (this.Pivots.length > 0) {
                this.pivotsAvailabe = true
              } else {
                this.pivotsAvailabe = false
              }

              this.sort = false;

              //sorting the pivots by default       
              this.sortArray();
              clearInterval(timeinterval);

              this.pivotsLoading = false;

              setTimeout(() => {
                this.checkPivotItemPermissions();
              }, 100)

              return;
            }
          }, 1000);
        });
    } catch (ex) {
      //pivots initiation handler error
      this.RapidflowService.ShowErrorMessage("ngOnInit-pivots component", "Platform", ex.message, ex.stack, "An error occured while initializing pivots view", "N/A", this.processId, true);
    }

  }

  /**
   * Navigating to pivot page
   * 
   * @param {any} item 
   * @memberof PivotsComponent
   */
  moveToPivots(item) {
    this.router.navigate(['main', 'process', this.processId, 'pivot', item.ProcessObjectID]);
  }

  /**
   * opening dialog to update the pivot details
   * 
   * @param {any} pivotItem 
   * @memberof PivotsComponent
   */
  openUpdatePivotDialog(pivotItem): void {
    try {
      // opening the dialog to update th epivot information
      let dialogRef = this.publishDialog.open(PublishPivotDialogComponent, {
        width: '420px',
        height: 'auto',
        data: { PivotInfo: pivotItem, OperationType: 'Update' }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          // updating the process objects
          this.updatePivotInfo(result);
        }

      });
    } catch (ex) {
      //update pivot method error handler 
      this.RapidflowService.ShowErrorMessage("openUpdatePivotDialog-Pivots component", "Platform", ex.message, ex.stack, "An error occured while opening pivot update dialog", "N/A", this.processId, true);
    }
  }

  /**
   * delte the process pivot from pivots list
   * 
   * @param {any} pivotId 
   * @memberof PivotsComponent
   */
  deletePivot(pivotId) {
    try {
      //gets confirmation from user to take action
      let userConfirmation = this.confirmationDialog.open(ConfirmationDialogComponent, {

        data: { title: 'Delete Pivot', message: 'Are you sure you want to delete this pivot?' }
      });

      userConfirmation.afterClosed().subscribe(result => {

        if (result) {
          //showing the progress dialog for before deleting the pivot
          this.progressDialogRef = this.showProgressDialog("Deleting pivot", true, false);

          //calling api to delete the pivot
          this.RapidflowService.pivotOperations(this.processId, "DELETE", pivotId, '').subscribe((response) => {

            // updating the process objects after successfull delete operation
            for (let i = 0; i < this.Pivots.length; i++) {
              if (this.Pivots[i].ProcessObjectID == pivotId) {
                this.Pivots.splice(i, 1);
              }
            }
            this.progressDialogRef.close();

          }, (error: any) => {

            //pivot operation api handler error
            this.RapidflowService.ShowErrorMessage("pivotOperations-Pivots component", "Platform", "Error occured while executing api call", error, "An error occured while performing pivot operations", "RapidflowServices.pivotOperations", this.processId, false);
          });
        }
      });
    } catch (ex) {
      //delete pivot method error handler
      this.RapidflowService.ShowErrorMessage("deletePivot-Pivot component", "Platform", ex.message, ex.stack, "An error occured while deleting pivot", "N/A", this.processId, true);
    }
  }


  /**
   * Updates Pivot title and description in the view according to the changes from publish pivot dialog
   */
  updatePivotInfo(newPivotInfo) {
    for (let i = 0; i < this.ProcessDataService.pivots.length; i++) {
      if (this.ProcessDataService.pivots[i].ProcessObjectID == newPivotInfo.PivotID) {

        this.Pivots[i].Description = newPivotInfo.PivotDescription;


        this.Pivots[i].Title = newPivotInfo.PivotTitle;


        this.Pivots[i].CurrentPermissions = newPivotInfo.PivotPermissions;
      }
    }
  }

  /**
   * shows progress dialog
   * 
   * @param {any} message 
   * @param {any} progressBar 
   * @param {any} actionButton 
   * @returns 
   * @memberof PivotsComponent
   */
  showProgressDialog(message, progressBar, actionButton) {
    let dialogRef: any;
    dialogRef = this.progressDialog.open(ProgressDialogComponent, {
      data: {
        message: message,
      }
    });
    return dialogRef;
  }

  /**
   * Checks if edit or delete operation is allowed on the pivot the current logged in user
   */

  checkPivotItemPermissions() {
    var permissionsIntervalPivotsList = setInterval(() => {
      try {
        if (this.ProcessDataService.userPermissions != undefined && this.ProcessDataService.userPermissions != null && this.ProcessDataService.userPermissions.length > 0) {
          let tempUserPermissions = this.ProcessDataService.userPermissions;
          //for all pivots
          for (let i = 0; i < this.Pivots.length; i++) {
            let tempPivotPermissions = JSON.parse(this.Pivots[i].CurrentPermissions);
            let tempPivotID = this.Pivots[i].ProcessObjectID;
            //for all pivot permissions
            for (let j = 0; j < tempPivotPermissions.length; j++) {
              let tempRoleID = tempPivotPermissions[j].RoleId;
              //for all user permissions
              for (let k = 0; k < tempUserPermissions.length; k++) {
                if (tempPivotID == tempUserPermissions[k].ID && tempRoleID == tempUserPermissions[k].RoleID && tempUserPermissions[k].ItemType == "ProcessPivot") {

                  //if role has edit permission
                  if (tempUserPermissions[k].PermissionName == "Edit") {
                    this.Pivots[i].EditAllowed = true;
                  }
                  //if role has delete permission
                  if (tempUserPermissions[k].PermissionName == "Delete") {
                    this.Pivots[i].DeleteAllowed = true;
                  }


                }
                //break current loop if both allowed
                if (this.Pivots[i].EditAllowed && this.Pivots[i].DeleteAllowed) {
                  break;
                }

              }
            }

          }
          clearInterval(permissionsIntervalPivotsList);
        }
      }
      catch (ex) {
        clearInterval(permissionsIntervalPivotsList);
      }

    }, 1000)
  }


}