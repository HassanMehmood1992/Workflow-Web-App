/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: WorkflowRoutingService
Description: Provide functionality to perform workflow related operations on workflow task.
Location: ./services/workflow-routing.service
Author: Sheharyar
Version: 1.0.0
Modification history: none
*/


import { RapidflowService } from './rapidflow.service';
import { Injectable } from '@angular/core';

/**
 * 
 * 
 * @export
 * @class WorkflowRoutingService
 */
@Injectable()
export class WorkflowRoutingService {

  private WorkflowTasksJSON: any[]; // Global variable of the class to store the workflow tasks for the current workflow form
  private ProcessTasksJSON: any[]; // Global variable of the class to store latest workflow tasks for the current workflow form
  public CurrentLoggedInUser: any; // Global variable of the class to store the current logged in user
  private ProcessID:any; // Global variable of the form to store the current process id of the current workflow form

  /**
   * Creates an instance of WorkflowRoutingService.
   * @param {RapidflowService} rapidflowService 
   * @memberof WorkflowRoutingService
   */
  constructor(private rapidflowService: RapidflowService) {
    this.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
  }
  
  /**
   * Function called to set the workflow tasks in the class global variable
   * Also initialize other global variables to be used in the class
   * @param {any} workflowRouting workflow tasks for the current workflow form
   * @param {any} processTasks latest workflow tasks for the current workflow form
   * @param {any} processId process id of the current workflow form 
   * @memberof WorkflowRoutingService
   */
  setWorkflowRouting(workflowRouting, processTasks, processId) {
    this.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
    this.WorkflowTasksJSON = workflowRouting;
    this.ProcessTasksJSON = processTasks;
    this.ProcessID = processId;
  }

  /**
   * Function called to update the workflow tasks retrieved from the server
   * returns the updated workflow tasks as per the workflow form status
   * @param {any} CurrentStatusValue current status of the form
   * @returns {*} returns the updated workflow tasks
   * @memberof WorkflowRoutingService
   */
  getProcessTasksFromServer(CurrentStatusValue): any {
    if (CurrentStatusValue == "INITIATING") {
      return this.generateWorkflowTasksJSON(this.ProcessTasksJSON);
    } else {
      this.WorkflowTasksJSON = this.generateWorkflowRoutingTblForInitiatorReview();
      this.WorkflowTasksJSON = this.updateIterationforInitiatorReview();
      return this.WorkflowTasksJSON;
    }
  }

  /**
   * Function called to update the workflow tasks iteration number
   * in case when the form is being returned to the initiator
   * @returns 
   * @memberof WorkflowRoutingService
   */
  updateIterationforInitiatorReview() {
    try{
      let LastInitiatorReviewIndex: number = 0;
      var tmpIterationNumber = 0;
      for (var k in this.WorkflowTasksJSON) {
        if (this.WorkflowTasksJSON[k].ButtonPressed == "RESUBMIT") {
          tmpIterationNumber = parseInt(this.WorkflowTasksJSON[k].Iteration);
          LastInitiatorReviewIndex = parseInt(k);
        }
      }
      for (var j = LastInitiatorReviewIndex + 1; j < this.WorkflowTasksJSON.length; j++) {
        if (this.WorkflowTasksJSON[j]["Iteration"] != tmpIterationNumber) {
          this.WorkflowTasksJSON[j]["Iteration"] = tmpIterationNumber;
        }
      }
      return this.WorkflowTasksJSON;
    }
    catch(ex)
    {
      this.rapidflowService.ShowErrorMessage("updateIterationforInitiatorReview-Workflow routing service", "Platform", ex.message, ex.stack, "An error occured while updating iteration number for initiator review", "N/A",this.ProcessID,true);
    }
  }

  /**
   * Function called when the workflow form is returned back to the initiator
   * updates the workflow tasks as per old and new workflow tasks 
   * @returns the updated workflow tasks after merging the old and new tasks
   * @memberof WorkflowRoutingService
   */
  generateWorkflowRoutingTblForInitiatorReview() {
    try{
      var taskRowNumber = 0;
      var iterationNumber = 0;
      var tempTaskRowNumber =  0;
      // retrieve the latest resubmitted request and its iteration number
      for (var k in this.WorkflowTasksJSON) {
        if (this.WorkflowTasksJSON[k].ButtonPressed == "RESUBMIT") {
          taskRowNumber = parseInt(k);
          tempTaskRowNumber = parseInt(k);
          iterationNumber = parseInt(this.WorkflowTasksJSON[k].Iteration);
        }
      }

      let tempWorkflowTasksJSON = JSON.parse(JSON.stringify(this.WorkflowTasksJSON));
      // retrieve the dynamically added tasks in workflow tasks JSON
      for(let ind:number = 0; ind < this.ProcessTasksJSON.length; ind++)
      {
        for(let subInd:number = 0; subInd < tempWorkflowTasksJSON.length; subInd++){
          if( (this.ProcessTasksJSON[ind]["TaskName"].toLowerCase() == tempWorkflowTasksJSON[subInd]["TaskName"].toLowerCase() 
          && iterationNumber > tempWorkflowTasksJSON[subInd]["Iteration"] ) 
          || tempWorkflowTasksJSON[subInd]["TaskName"].toLowerCase() == this.ProcessTasksJSON[0]["TaskName"].toLowerCase())
          {
            tempWorkflowTasksJSON.splice(subInd,1);
            subInd--;
          }
        }
      }

      if(this.ProcessTasksJSON[0] != undefined){
        if(this.ProcessTasksJSON[0]["TaskName"] != undefined){
          for(let index:number = 1; index < this.ProcessTasksJSON.length; index++)
          {
            for(let subIndex:number = 1; subIndex < this.WorkflowTasksJSON.length; subIndex++){
              if(this.ProcessTasksJSON[index]["TaskName"].toLowerCase() == this.WorkflowTasksJSON[subIndex]["TaskName"].toLowerCase() 
              && (iterationNumber - 1) == this.WorkflowTasksJSON[subIndex]["Iteration"] 
              && this.WorkflowTasksJSON[subIndex]["IsDelegated"] == false){
                if(this.WorkflowTasksJSON[subIndex]["ButtonPressed"] != ""){
                  var taskRow = JSON.parse(JSON.stringify(this.WorkflowTasksJSON[subIndex]));
                  taskRow["Iteration"] = iterationNumber;
                  taskRow["DateInitiated"] = '';
                  taskRow["DateCompleted"] = '';
                  taskRow["Result"] = '';
                  taskRow["Comments"] = '';
                  taskRow["ButtonPressed"] = '';
                  taskRowNumber++
                  this.WorkflowTasksJSON.splice(taskRowNumber,0,taskRow);
                }
                else{
                  var taskRow = JSON.parse(JSON.stringify(this.WorkflowTasksJSON[subIndex]));
                  taskRow["Iteration"] = iterationNumber;
                  taskRow["DateInitiated"] = '';
                  taskRow["DateCompleted"] = '';
                  taskRow["Result"] = '';
                  taskRow["Comments"] = '';
                  taskRow["ButtonPressed"] = '';
                  taskRowNumber++
                  this.WorkflowTasksJSON.splice(taskRowNumber,1,taskRow);
                }
              }
            }
          }
        }
      }
      
      //the dynamic tasks added are stored in the tempWorkflowTasksJSON and will be added in the end
      var initiationTaskRowNumber = tempTaskRowNumber; 
      if(tempWorkflowTasksJSON[0] != undefined){
        if(tempWorkflowTasksJSON[0]["TaskName"] != undefined){
          for(let index:number = 0; index < tempWorkflowTasksJSON.length; index++)
          {
            var isNewTask = true;
            var tempSequenceNumber = 0;
            for(let subIndex:number = tempTaskRowNumber; subIndex < this.WorkflowTasksJSON.length; subIndex++){
              if(tempWorkflowTasksJSON[index]["TaskName"].toLowerCase() == this.WorkflowTasksJSON[subIndex]["TaskName"].toLowerCase() 
              && iterationNumber >= tempWorkflowTasksJSON[index]["Iteration"] ){
                isNewTask = false;
                tempSequenceNumber = this.WorkflowTasksJSON[subIndex]["Sequence"];
              }
            }
            if(isNewTask){
              if(iterationNumber -1 == tempWorkflowTasksJSON[index]["Iteration"]){
                tempSequenceNumber = tempWorkflowTasksJSON[index]["Sequence"];
                var taskRow = JSON.parse(JSON.stringify(tempWorkflowTasksJSON[index]));
                taskRow["Iteration"] = iterationNumber;
                taskRow["DateInitiated"] = '';
                taskRow["DateCompleted"] = '';
                taskRow["Result"] = '';
                taskRow["Comments"] = '';
                taskRow["ButtonPressed"] = '';
                var taskIndex = initiationTaskRowNumber-1;
                taskIndex = taskIndex + tempSequenceNumber;
                this.WorkflowTasksJSON.splice(taskIndex,0,taskRow); 
                tempTaskRowNumber++;
              }
            }
            else{
              if(iterationNumber -1 == tempWorkflowTasksJSON[index]["Iteration"]){
                tempSequenceNumber = tempWorkflowTasksJSON[index]["Sequence"];
                var taskRow = JSON.parse(JSON.stringify(tempWorkflowTasksJSON[index]));
                taskRow["Iteration"] = iterationNumber;
                taskRow["DateInitiated"] = '';
                taskRow["DateCompleted"] = '';
                taskRow["Result"] = '';
                taskRow["Comments"] = '';
                taskRow["ButtonPressed"] = '';
                var taskIndex = initiationTaskRowNumber-1;
                taskIndex = taskIndex + tempSequenceNumber;
                this.WorkflowTasksJSON.splice(taskIndex,1,taskRow); 
                tempTaskRowNumber++;
              }
            }
          }
        }
      }
      return this.WorkflowTasksJSON;
    }
    catch(ex)
    {
      this.rapidflowService.ShowErrorMessage("generateWorkflowRoutingTblForInitiatorReview-Workflow routing service", "Platform", ex.message, ex.stack, "An error occured while generating workflow routing for initiator review", "N/A",this.ProcessID,true);
    }
  }

  /**
   * Function called to generate the workflow tasks provided with the current workflow form
   * Adds our internal variables to the workflow tasks and updates them
   * @param {any} ProcessTasks latest workflow tasks
   * @returns {any[]} returns the updated workflow tasks
   * @memberof WorkflowRoutingService
   */
  generateWorkflowTasksJSON(ProcessTasks): any[] {
    try{
      // check if the latest workflow tasks is undefined or not
      if (ProcessTasks != "undefined" && ProcessTasks != null) {
        if (ProcessTasks.length > 0) {
          if (typeof ProcessTasks[0].TaskName != "undefined") {
            this.WorkflowTasksJSON = [];
            let TaskRow;
            this.ProcessTasksJSON.forEach(item => {
              let $this = item;
              let ModifiedTitle = $this["TaskName"].split(' ').join('_');
              while (ModifiedTitle.indexOf("'") !== -1) {
                ModifiedTitle = ModifiedTitle.replace("'", "");
              }
              let AssigneesID = "";
              let AssigneesName = "";
              let AssignedToEmail = "";

              // check if the current task has default assignees
              if (typeof $this["DefaultAssignees"].results != "undefined") {
                var DefaultAssigneesLength = $this["DefaultAssignees"].results.length;
                for (var a = 0; a < DefaultAssigneesLength; a++) {
                  AssigneesName = $this["DefaultAssignees"].results[a].Name;
                  AssignedToEmail = $this["DefaultAssignees"].results[a].Email;
                  TaskRow = {};
                  TaskRow["Sequence"] = $this["Sequence"];
                  TaskRow["Iteration"] = 1;
                  TaskRow["TaskName"] = $this["TaskName"];
                  TaskRow["MultipleAssigneeRestriction"] = $this["MultipleAssigneeRestriction"];
                  TaskRow["AssignedToName"] = AssigneesName;
                  TaskRow["AssignedToEmail"] = AssignedToEmail;
                  TaskRow["ExpectedCompletionDays"] = $this["ExpectedCompletionDays"];
                  TaskRow["ReminderSchedule"] = $this["ReminderSchedule"];
                  TaskRow["Escalation"] = $this["Escalation"];
                  TaskRow["NotificationTemplate"] = $this["NotificationTemplate"];
                  TaskRow["CommentsFlag"] = $this["CommentsFlag"];
                  TaskRow["FormActionsRequired"] = $this["FormActionsRequired"];
                  TaskRow["NumberofReminders"] = $this["NumberofReminders"];
                  TaskRow["EditableFields"] = $this["EditableFields"];
                  TaskRow["SkipAssigneeAutomatically"] = $this["SkipAssigneeAutomatically"];
                  TaskRow["Required"] = 'Yes';
                  TaskRow["DateStarted"] = '';
                  TaskRow["DateCompleted"] = '';
                  TaskRow["Result"] = '';
                  TaskRow["ButtonPressed"] = '';
                  TaskRow["Comments"] = '';
                  TaskRow["IsDelegated"] = false;
                  TaskRow["ActionButtons"] = $this["ActionButtons"];
                  TaskRow["TaskInstructions"] = $this["TaskInstructions"];
                  TaskRow["PendingText"] = $this["PendingText"];
                  this.WorkflowTasksJSON.push(TaskRow);
                }
              } else {
                // if the current task has no default assignees
                TaskRow = {};
                TaskRow["Sequence"] = $this["Sequence"];
                TaskRow["Iteration"] = 1;
                TaskRow["TaskName"] = $this["TaskName"];
                TaskRow["MultipleAssigneeRestriction"] = $this["MultipleAssigneeRestriction"];
                TaskRow["AssignedToName"] = AssigneesName;
                TaskRow["AssignedToEmail"] = AssignedToEmail;
                TaskRow["ExpectedCompletionDays"] = $this["ExpectedCompletionDays"];
                TaskRow["ReminderSchedule"] = $this["ReminderSchedule"];
                TaskRow["Escalation"] = $this["Escalation"];
                TaskRow["NotificationTemplate"] = $this["NotificationTemplate"];
                TaskRow["CommentsFlag"] = $this["CommentsFlag"];
                TaskRow["FormActionsRequired"] = $this["FormActionsRequired"];
                TaskRow["NumberofReminders"] = $this["NumberofReminders"];
                TaskRow["EditableFields"] = $this["EditableFields"];
                TaskRow["SkipAssigneeAutomatically"] = $this["SkipAssigneeAutomatically"];
                TaskRow["Required"] = 'Yes';
                TaskRow["DateStarted"] = '';
                TaskRow["DateCompleted"] = '';
                TaskRow["Result"] = '';
                TaskRow["ButtonPressed"] = '';
                TaskRow["Comments"] = '';
                TaskRow["IsDelegated"] = false;
                TaskRow["ActionButtons"] = $this["ActionButtons"];
                TaskRow["TaskInstructions"] = $this["TaskInstructions"];
                TaskRow["PendingText"] = $this["PendingText"];
                this.WorkflowTasksJSON.push(TaskRow);
              }
            });
            this.updateInitiationTask();
          }
        }
      }
      return this.WorkflowTasksJSON;
    }
    catch(ex)
    {
      this.rapidflowService.ShowErrorMessage("generateWorkflowTasksJSON-Workflow routing service", "Platform", ex.message, ex.stack, "An error occured while generating workflow routing", "N/A",this.ProcessID,true);
    }
  }

  /**
   * Function called to update the initiator of the workflow tasks 
   * for the current workflow form 
   * @memberof WorkflowRoutingService
   */
  updateInitiationTask() {
    try{
      this.WorkflowTasksJSON[0].AssignedToEmail = this.CurrentLoggedInUser.Email;
      this.WorkflowTasksJSON[0].AssignedToName = this.CurrentLoggedInUser.DisplayName;
      this.WorkflowTasksJSON[0].Result = "Pending";
    }
    catch(ex)
    {
      this.rapidflowService.ShowErrorMessage("updateInitiationTask-Workflow routing service", "Platform", ex.message, ex.stack, "An error occured while updating initiator task", "N/A",this.ProcessID,true);
    }
  }

  /**
   * Function called to calculate the current pending tasks from the
   * workflow tasks for the current workflow form
   * @param {any} workflowTasks workflow tasks for the current form
   * @returns returns the current pending tasks 
   * @memberof WorkflowRoutingService
   */
  getPendingTasksJSON(workflowTasks) {
    try{
      var pendingtaskslist = [];
      for (let key in workflowTasks) {
        let obj = workflowTasks[key];
        if (obj.Result == "Pending") {
          pendingtaskslist.push(obj)
        }
      }
      return pendingtaskslist;
    }
    catch(ex)
    {
      this.rapidflowService.ShowErrorMessage("getPendingTasksJSON-Workflow routing service", "Platform", ex.message, ex.stack, "An error occured while retrieving pending task", "N/A",this.ProcessID,true);
    }
  }

  /**
   * Function called to calculate the current user task from the 
   * current pending tasks for the current workflow form
   * @param {any} currentPendingTasks current pending tasks for the current workflow form
   * @returns the current user task from the current pending tasks
   * @memberof WorkflowRoutingService
   */
  getCurrentUserTaskJSON(currentPendingTasks) {
    try{
      var pendingtaskslist = [];
      for (let key in currentPendingTasks) {
        let obj = currentPendingTasks[key];
        if (obj.Result == "Pending" && obj.AssignedToEmail.toLowerCase() == this.CurrentLoggedInUser.Email.toLowerCase()) {
          pendingtaskslist.push(obj)
        }
      }
      if (pendingtaskslist.length == 0) {
        let obj = {
          TaskName: "",
          AssignedToEmail: "",
          Iteration: -1,
          EditableFields: null,
          MultipleAssigneeRestriction: ""
        }
        pendingtaskslist.push(obj);
      }
      return pendingtaskslist;
    }
    catch(ex)
    {
      this.rapidflowService.ShowErrorMessage("getCurrentUserTaskJSON-Workflow routing service", "Platform", ex.message, ex.stack, "An error occured while retrieving current user task", "N/A",this.ProcessID,true);
    }
  }

  /**
   * Function called to add the provided task in the workflow tasks
   * retrieves the assignee for the task from the people picker field in the workflow form
   * @param {any} formDataJSON form data for the workflow
   * @param {any} taskType type of task update/add
   * @param {any} taskNameToAdd task name to add in the workflow tasks
   * @param {any} taskNameToAddAfter task name to add after in the workflow tasks
   * @param {any} fieldModel field from where the assignee needs to be retrieved 
   * @param {any} taskJSON the task json to be added in the workflow tasks
   * @param {any} taskIns the task instructions for the task
   * @param {any} pendingtxt the pending text that will be displayed in the workflow routing
   * @param {any} buttonsJSON the button json for this task for user actions
   * @returns the updated workflow tasks after adding/updating the task
   * @memberof WorkflowRoutingService
   */
  addPeoplePickerValueInWorkflowTask(formDataJSON, taskType, taskNameToAdd, taskNameToAddAfter, fieldModel, taskJSON, taskIns, pendingtxt, buttonsJSON) {
    try{
      var Iteration = 1;
      var test = JSON.stringify(buttonsJSON)
      buttonsJSON = test.replace(/"/g, '\'');
      for (var k in this.WorkflowTasksJSON) {
        if (this.WorkflowTasksJSON[k].ButtonPressed == "RESUBMIT") {
          Iteration = parseInt(this.WorkflowTasksJSON[k].Iteration);
        }
      }
      taskJSON = JSON.parse(taskJSON);
      if (typeof formDataJSON[fieldModel] != "undefined" && formDataJSON[fieldModel].length > 0) {
        for (var i = 0; i < formDataJSON[fieldModel].length; i++) {
          var ApproverTitle = formDataJSON[fieldModel][i].DisplayName.replace(/;/, "");
          var ApproverEmail = formDataJSON[fieldModel][i].Email.replace(/;/, "");
          var LocalTaskJSON = '{"Sequence":"' + taskJSON["Sequence"] + '",' +
            '"Iteration":"' + Iteration + '", ' +
            '"TaskName":"' + taskNameToAdd + '",' +
            '"MultipleAssigneeRestriction":"' + taskJSON["MultipleAssigneeRestriction"] + '",' +
            '"AssignedToName":"' + ApproverTitle + '",' +
            '"AssignedToEmail":"' + ApproverEmail + '",' +
            '"ExpectedCompletionDays":"' + taskJSON["ExpectedCompletionDays"] + '",' +
            '"NumberofReminders":"' + taskJSON["NumberofReminders"] + '",' +
            '"EditableFields":"' + taskJSON["EditableFields"] + '",' +
            '"SkipAssigneeAutomatically":"' + taskJSON["SkipAssigneeAutomatically"] + '",' +
            '"Required":"' + taskJSON["Required"] + '",' +
            '"ActionButtons":"' + JSON.parse(buttonsJSON) + '",' +
            '"TaskInstructions":"' + taskIns + '",' +
            '"PendingText":"' + pendingtxt + '"}';
          LocalTaskJSON = LocalTaskJSON.replace(/\\/g, "\\\\");
          // check the task type for this task
          if (taskType.toLowerCase() == "add") {
            this.WorkflowTasksJSON = this.addWorkflowTask(taskNameToAdd, LocalTaskJSON)
          }
          else {
            this.WorkflowTasksJSON = this.updateWorkflowTask(taskNameToAdd, LocalTaskJSON)
          }
        }
      }
      else {
        alert('Assignee specified for "' + taskNameToAdd + '" has invalid user details. Please specify a valid user for this task.');
        formDataJSON[fieldModel] = [];
      }
      return this.WorkflowTasksJSON;
    }
    catch(ex)
    {
      this.rapidflowService.ShowErrorMessage("addPeoplePickerValueInWorkflowTask-Workflow routing service", "Platform", ex.message, ex.stack, "An error occured while adding workflow task from people picker", "N/A",this.ProcessID,true);
    }
  }

  /**
   * Function called to add a new task in the workflow tasks for the current workflow form
   * 
   * @param {any} taskNameToAddAfter task name for the task to be added after 
   * @param {any} taskJSON task json for the task that needs to be added
   * @returns 
   * @memberof WorkflowRoutingService
   */
  addWorkflowTask(taskNameToAddAfter, taskJSON) {
    try{
      taskJSON = JSON.parse(taskJSON);
      let TaskRowNumber: number = 0;
      var IsNewRow = 1;
      for (let i: number = 0; i < this.WorkflowTasksJSON.length; i++) {
        var TaskName;
        if (this.WorkflowTasksJSON[i]["TaskName"].toLowerCase() == taskNameToAddAfter.toLowerCase() && (this.WorkflowTasksJSON[i]["Result"] == "" || this.WorkflowTasksJSON[i]["Result"] == "Pending")) {
          TaskRowNumber = i;
          IsNewRow = 0;
        }
      }
      if (IsNewRow == 0) {
        var AssigneesName = "";
        var AssignedToEmail = "";
        var ApproverTitle = taskJSON["AssignedToName"];
        var ApproverEmail = taskJSON["AssignedToEmail"];
        var TaskRow = JSON.parse(JSON.stringify(taskJSON));
        TaskRow["AssignedToName"] = ApproverTitle;
        TaskRow["AssignedToEmail"] = ApproverEmail;
        this.WorkflowTasksJSON.splice(TaskRowNumber + 1, 0, TaskRow);
        TaskRowNumber = TaskRowNumber + 1;
      }
      else if (IsNewRow == 1) {
        var AssigneesName = "";
        var AssignedToEmail = "";
        var ApproverTitle = taskJSON["AssignedToName"];
        var ApproverEmail = taskJSON["AssignedToEmail"];
        var ApproverCount = this.getApproverCount(ApproverEmail);
        var TaskRow = JSON.parse(JSON.stringify(taskJSON));
        TaskRow["AssignedToName"] = ApproverTitle;
        TaskRow["AssignedToEmail"] = ApproverEmail;
        if (taskNameToAddAfter == "") {
          this.WorkflowTasksJSON.splice(0, 0, TaskRow);
        }
        else {
          this.WorkflowTasksJSON.splice(this.WorkflowTasksJSON.length, 0, TaskRow);
        }
      }
      return this.WorkflowTasksJSON;
    }
    catch(ex)
    {
      this.rapidflowService.ShowErrorMessage("addWorkflowTask-Workflow routing service", "Platform", ex.message, ex.stack, "An error occured while adding workflow task", "N/A",this.ProcessID,true);
    }
  }

  /**
   * Function called to update a task in the workflow tasks
   * 
   * @param {any} taskNameToUpdate task name to update in the workflow tasks
   * @param {any} taskJSON task json that needs to be updated
   * @returns 
   * @memberof WorkflowRoutingService
   */
  updateWorkflowTask(taskNameToUpdate, taskJSON) {
    try{
      taskJSON = JSON.parse(taskJSON);
      for (var i = 0; i < this.WorkflowTasksJSON.length; i++) {
        var TaskName;
        if (this.WorkflowTasksJSON[i]["TaskName"].toLowerCase() == taskNameToUpdate.toLowerCase() && this.WorkflowTasksJSON[i]["Result"] == "") {
          for (let key in taskJSON) {
            let value = taskJSON[key]
            if (key != "Iteration") {
              if (key == "Sequence") {
                this.WorkflowTasksJSON[i][key] = parseInt(value);
              }
              else if (key == "ExpectedCompletionDays") {
                this.WorkflowTasksJSON[i][key] = parseInt(value);
              }
              else if (key == "SkipAssigneeAutomatically") {
                if (value == "false") {
                  this.WorkflowTasksJSON[i][key] = false;
                }
                else {
                  this.WorkflowTasksJSON[i][key] = true;
                }
              }
              else if (key == "ActionButtons") {
                if (value == "null") {
                  this.WorkflowTasksJSON[i][key] = null;
                }
                else {
                  this.WorkflowTasksJSON[i][key] = value;
                }
              }
              else {
                this.WorkflowTasksJSON[i][key] = value;
              }
            }
          }
        }
      }
      return this.WorkflowTasksJSON;
    }
    catch(ex)
    {
      this.rapidflowService.ShowErrorMessage("updateWorkflowTask-Workflow routing service", "Platform", ex.message, ex.stack, "An error occured while updating workflow task", "N/A",this.ProcessID,true);
    }
  }

  /**
   * Function called to retrieve the approver count for the current task
   * Checks if the current task is composite or not
   * @param {any} ApproverId the approver ids for the current task
   * @returns the count of approvers for the current task
   * @memberof WorkflowRoutingService
   */
  getApproverCount(ApproverId) {
    var origString = ApproverId;
    var characterToCount = "@";
    var counter = 0;
    var myArray = origString.toLowerCase().split('');
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i] == characterToCount) {
        counter++;
      }
    }
    return counter;
  }

  /**
   * Function called to check if the current pending task is delegated
   * or not in the current workflow form
   * @param {any} currentPendingTaskJson current pending tasks for the workflow form 
   * @returns the task which is delegated
   * @memberof WorkflowRoutingService
   */
  checkIsDelegatedTask(currentPendingTaskJson){
    var obj = [];
    for(let i=0;i<currentPendingTaskJson.length;i++){
      if(currentPendingTaskJson[i].IsDelegated){
        obj.push(i);
      }
    }
    return obj;
  }

  /**
   * Function called to check if the workflow tasks are valid or not
   * 
   * @returns true if valid, false otherwise
   * @memberof WorkflowRoutingService
   */
  checkWorkflowTaskJson(){
    return true;
  }
}
