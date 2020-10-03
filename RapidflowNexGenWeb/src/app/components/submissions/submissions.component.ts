/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SubmissionsComponent
Description: Provide functionality to view workflow submissions which are related to the current user.
Location: ./components/submissions.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/

import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { RapidflowService } from './../../services/rapidflow.service';
import { ActivatedRoute, ParamMap,Router } from '@angular/router';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { DataFilterDialogComponent } from '../data-filter-dialog/data-filter-dialog.component';
import { MatDialog } from '@angular/material';
import { TileListComponent } from '../tile-list/tile-list.component';
import { EventEmiterService } from '../../services/event-emiters.service';
import * as moment from 'moment';
import { SocketProvider } from '../../services/socket.service';

declare var $: any;


@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.css']
})
export class SubmissionsComponent implements OnInit {
  @ViewChild('tileListRef')
  public tileListRef: TileListComponent;//tile list component reference to call its functions on filter change
  public workflows: any;//all workflows of the selected process
  public submissionsObject: any = [];//submissions object returned from api call
  public selectedWorkflowID: number = 0;//current selected workflow id
  public currentFilterObject: any = {};//filter object to store initiated by and status based on which submissions are retrieved
  public currentLoggedInUser;//current logged in user object
  public submissionsLoading: boolean;//submissions loading or loaded flag
  public currentProcessId: number;//current selected process id
  public currentWorkflow: any;//current selected workflow from dropdown object
  public filteredData: boolean = false;//data is trimmed flag to show or hide advisory icon
  public pageNumber: number = 1;//starting page number to retrieve from api call
  public rowsToReturn: number = 15;//default page size
  public sortStringSubmissions: string = "desc";//deafult sorting of retrieved submissions
  public searchStringSubmission: string = "";//search string to filter submissions
  public allSubmissionsLoaded: boolean = false;//all submissions loaded for workflow flag
  public moreSubmissionsLoading: boolean = false;//more submissions loading to show loading while scrolling
  public debounceTimeout: any;//timeout between key press and api call
  public dataIsFiltered: boolean = false;//data is filtered flag
  public paramSubscription:any;//parameter subscription to be destroyed
  public retrieveSubmissionsSubscription:any;
  public workflowSet:boolean=false;
  /**
   * Default constructor with dependency injection of all required services and references
   * @param rapidflowService 
   * @param route 
   * @param dataFilterDialog 
   * @param eventEmitterService 
   * @param socket 
   */
  constructor(private rapidflowService: RapidflowService, private route: ActivatedRoute, private dataFilterDialog: MatDialog, private eventEmitterService: EventEmiterService, private socket: SocketProvider,private rtr:Router) { }

  /**
   * Component initialization lifecycle hook
   */
  ngOnInit() {
    //refresh submissions subscription
    if(window.localStorage['User']==undefined)
    {        this.rapidflowService.loggedOut=window.location.href;
      
        this.rtr.navigate(['login']);
    }
    else{
        this.currentLoggedInUser= JSON.parse(window.localStorage['User'])
    }
    this.eventEmitterService.currentMessage.subscribe(message => this.refreshSubmissionOnAction(message))
    this.submissionsLoading = true;
    this.currentFilterObject.SubmittedBy = "me";//default submitted  by filter
    this.currentFilterObject.Status = "PENDING";//default status filter
    //get current process id from parameters
   this.paramSubscription=this.route.parent.parent.paramMap
      .subscribe((params: ParamMap) => {
        this.currentProcessId = +params.get('ProcessID');
        this.generateWorkflowSubmissionView(true);
      });
    this.setSearchAndSortEvents();
  }


  /**
   * Generate submission view with retrieved submissions from api call with applied filters
   * @param initialLoading 
   */
  generateWorkflowSubmissionView(initialLoading: boolean) {
    this.submissionsLoading = true;

    //show advisory icon if data is filtered
    if (this.searchStringSubmission != "") {
      this.dataIsFiltered = true;
    }
    else {
      this.dataIsFiltered = false;
    }
    //update filters if user comes back from form.
    if (initialLoading && window.localStorage["submissionFilters"] != undefined && window.localStorage["submissionFilters"] != "{}") {
      let tempFilterObj = JSON.parse(window.localStorage["submissionFilters"]);
      this.currentFilterObject = tempFilterObj.currentFilterObject;
      this.selectedWorkflowID = tempFilterObj.currentWorkflow.WorkflowID;
      this.workflowSet=true;
      delete window.localStorage["submissionFilters"];

    }
    

    //retreive submissions api call
    if(this.retrieveSubmissionsSubscription)
    {
      this.retrieveSubmissionsSubscription.unsubscribe();
    }
   this.retrieveSubmissionsSubscription= this.rapidflowService.retrieveWorkflowSubmissionDetailsWCF(this.currentProcessId, this.selectedWorkflowID, false, this.currentFilterObject.SubmittedBy, this.currentFilterObject.Status, this.sortStringSubmissions, this.rowsToReturn, this.pageNumber, this.searchStringSubmission)
      .subscribe((response) => {
        try {
          let tempResponseJSON = JSON.parse(response.json());
          let tempSubmissionsArray = JSON.parse(tempResponseJSON[0].WorkflowSubmissions);

          //empty submission object if loaded first time
          if (initialLoading) {
            this.submissionsObject = [];
          }
          for (let i = 0; i < tempSubmissionsArray.length; i++) {
            this.submissionsObject.push(tempSubmissionsArray[i])
          }
          // this.submissionsObject = JSON.parse(tempResponseJSON[0].WorkflowSubmissions);
          if (tempSubmissionsArray.length < this.rowsToReturn) {
            this.allSubmissionsLoaded = true;
          }
          this.workflows = JSON.parse(tempResponseJSON[0].ProcessWorkflows)
          //get first workflow if initial loading 
          if (initialLoading&&!this.workflowSet) {
            this.selectedWorkflowID = this.workflows[0].WorkflowID;
            this.workflowSet=true;
          }


          //get selected workflow object based of workflow dropdown value
          for (let key in this.workflows) {
            let obj = this.workflows[key];
            if (obj.WorkflowID.toString() == this.selectedWorkflowID.toString()) {
              this.currentWorkflow = obj;
              this.currentWorkflow.WorkflowSettingsJSON = JSON.parse(this.currentWorkflow.WorkflowSettingsJSON)
              break;
            }
          }

          //show advisory icon if data is filtered
          if (tempResponseJSON[0].DataIsFiltered == 1) {
            this.filteredData = true;
          }
          else {
            this.filteredData = false;
          }
          this.moreSubmissionsLoading = false;
          this.submissionsObject;
          if (this.currentFilterObject.SubmittedBy == "" && this.currentFilterObject.Status == "") {
            this.currentFilterObject.SubmittedBy = "Me";
            this.currentFilterObject.Status = "PENDING";
          }

          this.setPendingTaskAndPendingSince();
          // this.changeFilter();
          this.submissionsLoading = false;
        }
        catch (ex) {
          this.rapidflowService.ShowErrorMessage("ngOnInit-Submissions component", "Platform", ex.message, ex.stack, "An error occured while processing submissions ", "N/A", this.currentProcessId, true);
        }
      }, (error) => {
        this.rapidflowService.ShowErrorMessage("retrieveWorkflowSubmissionDetailsWCF submissions component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveWorkflowSubmissionDetailsWCF", " RapidflowService.retrieveWorkflowSubmissionDetailsWCF", this.currentProcessId, true);
      });
  }


  /**
   * Refresh submission if action taken from form or approval dialog
   * @param message 
   */
  refreshSubmissionOnAction(message) {
    if (message["Type"] == "Referesh") {
      for (var property in message["Value"]) {
        //if submission refresh called
        if (message["Value"].hasOwnProperty('Submissions')) {
          this.submissionsLoading = true;
          this.submissionsObject = [];
          //refresh submissions
          setTimeout(() => { this.getFilteredSubmissions(true); }, 1000);
          break;

        }
      }
    }
  }

  /**
   * Refetch submissions based on filter change
   */
  changeFilter() {
    try {
      this.submissionsObject = [];
      this.pageNumber = 1;
      this.allSubmissionsLoaded = false;
      this.generateWorkflowSubmissionView(false);
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("changeFilter-Submissions component", "Platform", error.message, error.stack, "An error occured while changing filter", "N/A", this.currentProcessId, true);
    }
  }

  setPendingTaskAndPendingSince() {
    try {
      for (let i: number = 0; i < this.submissionsObject.length; i++) {
        //if task is pending and  pending task name and pending since not set
        if (this.submissionsObject[i].Status == "PENDING" && !this.submissionsObject[i].PendingItemsSet) {
          this.submissionsObject[i].FormTasks = JSON.parse(this.submissionsObject[i].FormTasks)
          this.submissionsObject[i].Expanded = false;

          let pendingTasksCount = 0;

          this.submissionsObject[i].PendingSince = "";
          //find pending task among form tasks and set task name and pending since
          for (let j = 0; j < this.submissionsObject[i].FormTasks.length; j++) {

            if (this.submissionsObject[i].FormTasks[j].Result == "Pending") {
              this.submissionsObject[i].PendingSince = this.submissionsObject[i].FormTasks[j].DateStarted;
              this.submissionsObject[i].PendingTaskName = this.submissionsObject[i].FormTasks[j].TaskName;
              this.submissionsObject[i].PendingTaskAssigneeName = this.submissionsObject[i].FormTasks[j].AssignedToName
              pendingTasksCount++;

            }
          }
          //set multiple assingees if more than one assignee
          if (pendingTasksCount > 1) {
            this.submissionsObject[i].PendingTaskAssigneeName = "Multiple Assignees";
          }
          this.submissionsObject[i].PendingItemsSet = true;
        }

      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("setPendingTaskAndPendingSince-Submissions component", "Platform", error.message, error.stack, "An error occured while setting pending task and pending since", "N/A", this.currentProcessId, true);
    }
  }

  /**
   * Export all retrieved submission to csv
   */
  exportToExcel() {
    try {
      let dataToExport = [];
      for (let i = 0; i < this.submissionsObject.length; i++) {
        dataToExport[i] = {};
        dataToExport[i].Reference = this.submissionsObject[i].Reference;
        dataToExport[i].DisplayStatus = this.submissionsObject[i].DisplayStatus;
        dataToExport[i].Subject = this.submissionsObject[i].Subject;
        dataToExport[i].InitiatedByName = this.submissionsObject[i].InitiatedByName;
        dataToExport[i].PendingTaskName = this.submissionsObject[i].PendingTaskName;
        dataToExport[i].PendingTaskAssigneeName = this.submissionsObject[i].PendingTaskAssigneeName;
        dataToExport[i].DescriptionValue = this.submissionsObject[i].DescriptionValue;
        dataToExport[i].DateInitiated = this.submissionsObject[i].DateInitiated;
        dataToExport[i].DateCompleted = this.submissionsObject[i].DateCompleted;
      }
      //export columns
      let headers = ["Reference", "DisplayStatus", "Subject", "Initiator", "Task Name", "Task Assignee", "Description", "Date Initiated", "Date Completed"]
      new Angular2Csv(dataToExport, 'Submissions', { headers: headers });
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("exportToExcel-Submissions component", "Platform", ex.message, ex.stack, "An error occured while exporting to excel ", "N/A", this.currentProcessId, true);
    }
  }

  /**
   * Show data filter in effect dialog
   */
  showDataFilterDialog(): void {
    let dialogRef = this.dataFilterDialog.open(DataFilterDialogComponent, {
      width: '300px',
      height: '145px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  /**
   * Check if diagnostic logging applicable based on start date time and duration
   */
  checkDiagnostic() {
    try {
      var now = new Date;
      var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
      let duration: number = 180;
      var date = new Date();
      var today = Math.round(utc_timestamp / 1000);
      var currentUTCtimeMilliSeconds = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
      currentUTCtimeMilliSeconds = Math.round(currentUTCtimeMilliSeconds / 1000);
      duration = 180 * 60;

      if (today > currentUTCtimeMilliSeconds && today < currentUTCtimeMilliSeconds + duration) {

      }
      else {

      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("checkDiagnostic-Submissions component", "Platform", error.message, error.stack, "An error occured while checking diagnostics", "N/A", this.currentProcessId, true);
    }
  }

  /**
   * Fetch more submission on scroll down
   */
  onSubmissionsScrollDown() {
    this.pageNumber = (this.submissionsObject.length / this.rowsToReturn) + 1;
    this.pageNumber = Math.floor(this.pageNumber);
    if (!this.allSubmissionsLoaded) {
      this.moreSubmissionsLoading = true;
      setTimeout(() => {
        this.generateWorkflowSubmissionView(false);
      }, 1000)
    }
  }

  /**
   * Refetch submissions based on filter
   * @param initialLoading 
   */
  getFilteredSubmissions(initialLoading) {
    this.submissionsObject = [];
    this.allSubmissionsLoaded = false;
    this.pageNumber = 1;
    this.generateWorkflowSubmissionView(initialLoading);
  }

  /**
   * Define search and sort events for submissions
   */
  setSearchAndSortEvents() {

    //on search input
    $("#filterSearch").on('input', (e) => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.searchStringSubmission = $("#filterSearch").val()
        this.getFilteredSubmissions(true);
      }, 1000);
    });


    //on search toggle off
    $("#searchOff").click(() => {
      this.searchStringSubmission = "";
      if (this.dataIsFiltered) {
        this.getFilteredSubmissions(true);
      }
    });

    //on sort toggle on
    $("#sortOn").click(() => {
      this.sortStringSubmissions = "asc";
      this.getFilteredSubmissions(true);
    });


    //on sort toggle off
    $("#sortOff").click(() => {
      this.sortStringSubmissions = "desc";
      this.getFilteredSubmissions(true);

    });
  }

/**
 * Component destroy lifecycle hook
 */
ngOnDestroy(){
  try{
    this.paramSubscription.unsubscribe();
    $("#filterSearch").unbind();
    $("#sortOn").unbind();


    //on sort toggle off
    $("#sortOff").unbind();

    $("#searchOff").unbind();

  }
  catch(e){}
  
}
}
