/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessDirectoryComponent
Description: Renders list of all public processes with the functionality to subscribe and share a process.
Location: ./components/process-directory.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/

import { ActivatedRoute } from '@angular/router';
import { ProcessDataService } from './../../services/process-data.service';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AccessRequestComponent } from './access-request/access-request.component';
import { FilterArrayPipe } from './../../pipes/filter-array.pipe';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import { EventEmiterService } from '../../services/event-emiters.service';
import { DataFilterDialogComponent } from '../data-filter-dialog/data-filter-dialog.component';

declare var jquery: any; // Global variable for JQuery referenced from jquery.min.js
declare var $: any; // Global variable for JQuery referenced from jquery.min.js

@Component({
  selector: 'app-process-directory',
  templateUrl: './process-directory.component.html',
  styleUrls: ['./process-directory.component.css']
})

export class ProcessDirectoryComponent implements OnInit {
  public isProcessDirectoryLoading: boolean; // Global flag to check if the process directory is loading or not
  public processDirectory: any[]; // Global variable of the class to store the processes in the directory
  public processDirectoryCount: number; // Global variable of the class to store count of processes in the directory 
  public dialogRef: any; // Global variable of the class to store the dialog reference
  public sharedProcessID: any; // Global variable of the class to store the process id of the shared process 
  public moreProcessesLoading: boolean = false; // Global flag to check if more directory processes are loading or not  
  public pageNumber: number = 1; // Global variable of the class to store the page number for processes 
  public rowsToReturn: number = 10; // Global variable of the class to store process rows returned by database 
  public sortStringDirectory: string = "ASC"; // Global variable of the class to store sorting of the process directory 
  public searchStringDirectory: string = ""; // Global variable of the class to store search query for the process directory 
  public allProcessesLoaded = false; // Global flag to check if all processes are loaded or not 
  public dataIsFiltered: boolean = false; // Global flag to check if the data is filtered for the user 
  public allOrganizations: any; // Global variable of the class to store all organizations for processes
  public organizationsLoaded: boolean = false; // Global flag to check if organizations are loaded or not
  public selectedOrganization: string = ""; // Global variable of the class to store selected organization
  public debounceTimeout: any; // Global variable of the class to store the debounce time before calling the query service

  /**
   * Creates an instance of ProcessDirectoryComponent.
   * @param {RapidflowService} rapidflowService 
   * @param {ActivatedRoute} route 
   * @param {EventEmiterService} EventEmiterService 
   * @param {ProcessDataService} ProcessDataService 
   * @param {MatDialog} dialog 
   * @memberof ProcessDirectoryComponent
   */
  constructor(private rapidflowService: RapidflowService,
    private route: ActivatedRoute,
    public EventEmiterService: EventEmiterService,
    public ProcessDataService: ProcessDataService,
    public dialog: MatDialog) {
    this.isProcessDirectoryLoading = true;
    this.processDirectoryCount = 0;
    this.processDirectory = [];
  }

  /**
   * Triggered when the process directory component is called
   * 
   * @memberof ProcessDirectoryComponent
   */
  ngOnInit() {
    this.getAllOrganizations();
    this.getProcessDirectoryProcesses();
    //Event called on input in the filter
    $("#filterSearch").on('input',(e) => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.searchStringDirectory = $("#filterSearch").val()
        this.getFilteredProcesses();
      }, 1000);
      
    });
    //Event called when  search is turned off
    $("#searchOff").click(() => {
      this.searchStringDirectory = "";
      if (this.dataIsFiltered) {
        this.getFilteredProcesses();
      }
    });
    // get query parameters from the window header
     this.setDirectoryTabAndHeader();
    this.route.queryParamMap
      .subscribe(params => {
        this.sharedProcessID = params['params'].processID;
        if (this.sharedProcessID != undefined && this.sharedProcessID != null && this.sharedProcessID != '0' && this.sharedProcessID != 0) {
          var interval = setInterval(() => {
            if (this.isProcessDirectoryLoading == false) {
              var processfound = false
              for (var i = 0; i < this.processDirectory.length; i++) {
                if (this.processDirectory[i].ProcessID == this.sharedProcessID) {
                  processfound = true
                  this.addProcessToFavorites(this.processDirectory[i])
                }
              }
              if (processfound == false) {
                if (this.sharedProcessID != '0' && this.sharedProcessID != 0) {
                  this.accessRequest(this.sharedProcessID)
                }
              }
              clearInterval(interval)
            }
          }, 1000)
        }
      });
  }


  /**
   * Sets Directory header and tab in case of url redirect
   */
  setDirectoryTabAndHeader(){
    let refreshObject = { "Type": "SetTabAndHeader", Value: {} }
    this.EventEmiterService.changeMessage(refreshObject)
  }
  /**
   * Function to retrieve all organizations from the database
   * 
   * @memberof ProcessDirectoryComponent
   */
  getAllOrganizations() {
    this.rapidflowService.retrieveAllProcessesOraganizations().subscribe((response) => {
      try {
        this.allOrganizations = JSON.parse(response.json());
        this.organizationsLoaded = true;
      }
      catch (error) {
        this.rapidflowService.ShowErrorMessage("getAllOrganizations-Process Directory component", "Global", "Error occured while executing api call", error, error.stack, "N/A", '0', true);
      }
    },
    (error) => {
      this.rapidflowService.ShowErrorMessage("retrieveAllProcessesOraganizations-Process Directory component", "Global", "Error occured while executing api call", error, "An error occured while retrieveAllProcessesOraganizations", " RapidflowServices.retrieveProcessDirectoryProcesses", '0', true);
    });
  }

  /**
   * Function called to return the processess for process directory
   * 
   * @memberof ProcessDirectoryComponent
   */
  getProcessDirectoryProcesses() {
    if (this.searchStringDirectory != "") {
      this.dataIsFiltered = true;
    }
    else {
      this.dataIsFiltered = false;
    }
    this.rapidflowService.retrieveProcessDirectoryProcesses(this.rowsToReturn, this.pageNumber, encodeURIComponent(this.searchStringDirectory), this.sortStringDirectory, encodeURIComponent(this.selectedOrganization)).subscribe((response) => {
      try {
        this.isProcessDirectoryLoading = false;
        let tempDirectoryProcesses = this.rapidflowService.parseRapidflowJSON(response);
        if (tempDirectoryProcesses.length < this.rowsToReturn) {
          this.allProcessesLoaded = true;
        }
        for (let i = 0; i < tempDirectoryProcesses.length; i++) {
          this.processDirectory.push(tempDirectoryProcesses[i])
        }
        this.processDirectoryCount = this.processDirectory.length
        this.moreProcessesLoading = false;
      }
      catch (error) {
        this.rapidflowService.ShowErrorMessage("getProcessDirectoryProcesses-Process Directory component", "Global", "Error occured while executing api call", error, error.stack, "N/A", '0', true);
      }
    }, (error: any) => {
      this.rapidflowService.ShowErrorMessage("retrieveProcessDirectoryProcesses-Process Directory component", "Global", "Error occured while executing api call", error, "An error occured while retrieveProcessDirectoryProcesses", " RapidflowServices.retrieveProcessDirectoryProcesses", '0', true);
    });
  }

  /**
   * Function called when a process is shared from process directory
   * 
   * @param {any} process the selected process to be shared
   * @memberof ProcessDirectoryComponent
   */
  shareProcess(process) {
    var body = 'Process link : ' + window.location.origin + window.location.pathname + '#/sharedurl/?route=process&processID=' + process.ProcessID + '\n'
    var mailtovairable = "mailto:user@example.com?subject=Share the process with Process ID " + process.ProcessID + " &body=" + encodeURIComponent(body);
    window.location.href = mailtovairable
  }

  /**
   * Function called when a process is being added to my processess
   * 
   * @param {any} process selected process for adding to my processess
   * @memberof ProcessDirectoryComponent
   */
  addProcessToFavorites(process) {
    try {
      this.dialogRef = this.dialog.open(ProgressDialogComponent, {
        data: {
          message: "Adding to Favourites…",
        }
      });
      this.rapidflowService.subscribeProcess(process.ProcessID).subscribe((response) => {
        let result = this.rapidflowService.parseRapidflowJSON(response);
        if (typeof result.Status != "undefined") {
          if (result.Status.toLowerCase() == "true") {
          process.IsSubscribed = 'Active'
            this.dialogRef.close();
            this.dialog.closeAll();
            let refreshObject = { "Type": "Referesh", Value: { "Process": "true" } }
            this.EventEmiterService.changeMessage(refreshObject)
          }
          else {
            this.dialog.closeAll();
          }
        }
        else {
          this.dialog.closeAll();
        }
      }, (error: any) => {
        this.rapidflowService.ShowErrorMessage("subscribeProcess-Process Directory component", "Global", "Error occured while executing api call", error, "An error occured while subscribeProcess", " RapidflowServices.subscribeProcess", '0', true);
      });
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("addProcessToFavorites-Process Directory component", "Global", "Error occured while adding process", error, error.stack, "N/A", '0', true);
    }
  }

  /**
   * Function called to submit an access request to get 
   * access for a process
   * @param {any} PID process ID for the access request
   * @memberof ProcessDirectoryComponent
   */
  accessRequest(PID) {
    let dialogRef = this.dialog.open(AccessRequestComponent, {
      width: '20%',
      data: { processId: PID, animal: 'test' }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  /**
   * Function called when a user scroll downs on the directory
   * uses server side pagination
   * @memberof ProcessDirectoryComponent
   */
  OnDirectoryScrollDown() {
    this.pageNumber = (this.processDirectory.length / this.rowsToReturn) + 1;
    this.pageNumber = Math.floor(this.pageNumber);
    if (!this.allProcessesLoaded) {
      this.moreProcessesLoading = true;
      setTimeout(() => {
        this.getProcessDirectoryProcesses();
      }, 1000)
    }
  }

  /**
   * Function called to get filtered processess from server
   * 
   * @memberof ProcessDirectoryComponent
   */
  getFilteredProcesses() {
    this.isProcessDirectoryLoading = true;
    this.allProcessesLoaded = false;
    this.processDirectory = [];
    this.pageNumber = 1;
    this.getProcessDirectoryProcesses();
  }

  /**
   * Function called when an organization needs to be filtered
   * 
   * @memberof ProcessDirectoryComponent
   */
  showOrganizationFilterDialog(): void {
    let dialogRef = this.dialog.open(DataFilterDialogComponent, {
      data: { DialogType: 'directoryOraganizationFilter', Organizations: this.allOrganizations, SelectedOrganization: this.selectedOrganization }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result || result == "") {
        this.selectedOrganization = result;
        this.getFilteredProcesses();
      }
    });
  }
}
