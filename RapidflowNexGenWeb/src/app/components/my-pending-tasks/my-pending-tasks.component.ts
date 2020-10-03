/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: MyPendingTasksComponent
Description: Provide functionality to get the tasks assigned to user. This componet also setup the tasks to render in the list view componet. User can sort and filter in this list
Location: ./my-pending-tasks.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { EventEmiterService } from './../../services/event-emiters.service';
import { SortListsService } from './../../services/sort-lists.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit } from '@angular/core';
import { ProcessComponent } from '../process/process.component';
import { SocketProvider } from '../../services/socket.service';

declare var jquery: any;
declare var $: any;
/**
  * component decorator
  */
@Component({
  selector: 'app-my-pending-tasks',
  templateUrl: './my-pending-tasks.component.html',
  styleUrls: ['./my-pending-tasks.component.css']
})
export class MyPendingTasksComponent implements OnInit {

  public myPendingTasksObject: any[] // contain tasks of current process id
  public tasksLoading: boolean = true; // contain flag either tasks are loading or not
  public searchStr = "" // contain search string to filter the tasks
  public sort: boolean // shows sort icon if required on task screen
  public sortObject = { "FormHeader[0].FormDisplayName": "asc", "Reference": "asc" }; // sort object to sort the pending tasks with respect to form name and reference number
  public sortObjectAscending = { "DateCreated": "desc" };  // sort object to sort the pending tasks with respect to date created.
  public processId: any //contain current process id
  public retrieveTasksInterval:any;
  public paramSubscription:any;//parameter subscription to be destroyed
  public initialRender:boolean=true;
  public retrieveTasksSubscription;
  /**
  * Default constructor with dependency injection of all necessary objects and services 
  */
  constructor(private eventEmiterService: EventEmiterService, private RapidflowService: RapidflowService, private route: ActivatedRoute, private SortListsService: SortListsService, private socket: SocketProvider) {
  }


  /**
  * Reads the message and reload the tasks  
  */
  checkmessage(message) {
    if (message["Type"] == "Referesh") {
      for (var property in message["Value"]) {
        if (message["Value"].hasOwnProperty('Tasks')) {
          this.tasksLoading = true;
          this.myPendingTasksObject = [];
          //reload the tasaks
          setTimeout(() => { this.generateTODOTasksView(); }, 1000);
          break;
        }
      }
    }
  }
  /**
    * component initialization lifecycle hook
    */
  ngOnInit() {

    // reads the message broadcasted from event emitter service 
    this.eventEmiterService.currentMessage.subscribe(message => this.checkmessage(message))

    // gets the current process id to load the task of with respect to it
    this.paramSubscription= this.route.parent.parent.paramMap
      .subscribe((params: ParamMap) => {
        this.processId = params.get('ProcessID');
        this.tasksLoading = true;
        this.myPendingTasksObject = [];
        let timeoutValue=0;
        if(this.initialRender)
        {
          timeoutValue=2500;
          this.initialRender=false;
        }
        setTimeout(() => {
          //this timeout will be removed after implementing back navigation distinguishing logic.
          if(this.retrieveTasksSubscription)
          {
            this.retrieveTasksSubscription.unsubscribe();
          }
          
          this.generateTODOTasksView();

        }, timeoutValue);
      });
   this.retrieveTasksInterval= setInterval(() => {
      this.generateTODOTasksView()
    }, 900000);
  }

  /**
    * get and setting the pending tasks using api call
    */
  generateTODOTasksView() {
    try {
      this.myPendingTasksObject = []

      // if process is become undefined
      if (this.processId == undefined) {
        this.route.parent.parent.paramMap
          .subscribe((params: ParamMap) => {
            this.processId = +params.get('ProcessID');
          });
      }

      // calling api to receive the process tasks for current logged in user
      this.retrieveTasksSubscription= this.RapidflowService.retrieveTODOTasksDetailsWCF(this.processId)
        .subscribe((response) => {
          try {

            let tempTasks = this.RapidflowService.parseRapidflowJSON(response);
            // setting up the images based on task type

            for (let i = 0; i < tempTasks.length; i++) {
              if (tempTasks[i].TaskType == "TaskAssignment") {
                let taskIndex = this.myPendingTasksObject.map(function (d) { return d['Reference']; }).indexOf(tempTasks[i].Reference)
                if (taskIndex == -1) {
                  this.myPendingTasksObject.push(tempTasks[i]);
                }
              }
              else {
                this.myPendingTasksObject.push(tempTasks[i]);
              }
            }
            this.setItemNamesAndImages();
            this.tasksLoading = false;
          }
          catch (ex) {
            //tasks api error handler
            this.RapidflowService.ShowErrorMessage("retrieveTODOTasksDetailsWCF-My pending task Component", "Process", "Error occured while executing api call", ex, ex.stack, "N/A", this.processId, true);
          }
        }, (error: any) => {
          //tasks rendering logic error handler
          this.RapidflowService.ShowErrorMessage("retrieveTODOTasksDetailsWCF-My pending task Component", "Process", "Error occured while executing api call", error, "An error occured while retrieveTODOTasksDetailsWCF", " RapidflowServices.retrieveTODOTasksDetailsWCF", this.processId, true);
        });
    }
    catch (error) {
      this.RapidflowService.ShowErrorMessage("retrieveTODOTasksDetailsWCF-My pending task Component", "Process", "Error occured while executing api call", error, error.stack, "N/A", this.processId, true);
    }
  }

  /**
    * setting the task name and images in pending tasks based on task type to set up according to list view component
    */
  setItemNamesAndImages() {
    try {
      for (let i: number = 0; i < this.myPendingTasksObject.length; i++) {
        this.myPendingTasksObject[i].DescriptionValue = this.myPendingTasksObject[i].Subject;
        // task details for lookup approval task
        if (this.myPendingTasksObject[i].TaskType == "ProcessLookupChangeApproval") {
          this.myPendingTasksObject[i].ImageRelativePath = 'process_menu/Tasks/Change Approval';
          this.myPendingTasksObject[i].ItemHeader1 = this.myPendingTasksObject[i].FromUserDisplayName;
          this.myPendingTasksObject[i].ItemHeader2 = this.myPendingTasksObject[i].LookupName;
          this.myPendingTasksObject[i].PendingSince = this.myPendingTasksObject[i].DateCreated
        }
        else
          // task details for Access Request task
          if (this.myPendingTasksObject[i].TaskType == "AccessRequest") {
            this.myPendingTasksObject[i].ImageRelativePath = 'top_level/directory/access_request_display';
            this.myPendingTasksObject[i].ItemHeader1 = this.myPendingTasksObject[i].FromDisplayName;
            this.myPendingTasksObject[i].ItemHeader2 = "";
            this.myPendingTasksObject[i].PendingSince = this.myPendingTasksObject[i].DateCreated
            this.myPendingTasksObject[i].TaskName = "Access Request";
          }
          else if (this.myPendingTasksObject[i].TaskType == "TaskAssignment" && typeof (this.myPendingTasksObject[i].FormTasks) != "object")
        // task details for workflow approval task
        {
          this.myPendingTasksObject[i].ImageRelativePath = 'process_menu/Form';
          this.myPendingTasksObject[i].ItemHeader2 = this.myPendingTasksObject[i].WorkFlowDisplyName;
          this.myPendingTasksObject[i].ItemHeader1 = this.myPendingTasksObject[i].Reference;
          this.myPendingTasksObject[i].Expanded = false;


          this.myPendingTasksObject[i].FormTasks = JSON.parse(this.myPendingTasksObject[i].FormTasks)


          // setting up pending since according to last approved task
          for (let j = 0; j < this.myPendingTasksObject[i].FormTasks.length; j++) {
            if (this.myPendingTasksObject[i].FormTasks[j].Result == "Pending") {
              this.myPendingTasksObject[i].PendingSince = this.myPendingTasksObject[i].FormTasks[j].DateStarted;
              break;
            }
          }
        }
      }
    }
    catch (ex) {
      //tasks images rendering logic error handler
      this.RapidflowService.ShowErrorMessage("setItemNamesAndImages-My Pending Tasks component", "Platform", ex.message, ex.stack, "An error occured while rendering my pending tasks view ", "N/A", this.processId, true);
    }
  }

  ngOnDestroy(){
    try{
      clearInterval(this.retrieveTasksInterval);
      this.paramSubscription.unsubscribe();
    }
    catch(ex)
    {
      
    }
    
   }
}