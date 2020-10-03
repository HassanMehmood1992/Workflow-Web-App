/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ApprovalDialogComponent
Description: Provide functionality to take action on any workflow task from task view via popup dialog.
Location: ./approval-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { AlertDialogComponent } from './../alert-dialog/alert-dialog.component';
import { Router } from '@angular/router';
import { EventEmiterService } from './../../services/event-emiters.service';
import { ProcessFormService } from './../../services/process-form.service';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { WorkflowRoutingService } from '../../services/workflow-routing.service';
import { ProcessDataService } from '../../services/process-data.service';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import * as moment from 'moment';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AuthenticateUserDialogComponent } from '../authenticate-user-dialog/authenticate-user-dialog.component';

@Component({
  selector: 'app-approval-dialog',
  templateUrl: './approval-dialog.component.html',
  styleUrls: ['./approval-dialog.component.css'],
  providers: [ProcessDataService]
})
export class ApprovalDialogComponent implements OnInit {
  private taskDetails: any[]; //Global variable of the class to store the task details the user wants to perform action on
  private listType: string; //Global variable of the class to store the list type either tasks/submissions
  private WorkflowTasksJSON: any[]; //Global variable of the class to store the workflow tasks associated with the current task
  private DefaultButtonsJSON: any[]; //Global variable of the class to store the default buttons available to the user for the current task
  private FormSettings: any[]; //Global variable of the class to store form settings for the current task
  private ActionButtons: any; //Global variable of the class to store action buttons available for the user to perform on this task
  private DelegateActionButton: any; //Global variable of the class to store the delegate button for the user if the user has permissions
  public showDelegateSection: boolean; //Global flag to show the delegate section to the iser if the user has permissions
  private CurrentPendingTasksJSON: any[]; //Global variable of the class to store the current pending task for the current task
  private CurrentUserTaskJSON: any[]; //Global variable of the class to store the current user task for the task
  public TaskName: string; //Global variable of the class to store the name of the current pending task
  public TaskInstructions: string; //Global variable of the class to store the task instructions associated with the current task
  public refrenceNumber: string; //Global variable of the class to store the reference number of the current task
  public workflowName: string; //Global variable of the class to store the workflow name displayed to the user for the current task
  public dateCreated: string; //Global variable of the class to store the date when the task was created for the current user
  public showDelegateButton: boolean; //Global flag to show the delegate button to the user if the user has permissions
  public multipleAssignee: boolean; //Global flag to check if the current pending is assigned to multiple users
  private DelegateDetails: any[]; //Global variable of the class to store to whom the task will be delegated upon delegate action
  public DelegateOptions: any; //Global variable of the class to store delegate options for the user selector
  public delegateFrom: any; //Global variable of the class to store whose task is being delegated
  public userComments:string; //Global variable of the class to store the user comments entered by the user before taking action
  public isDelegateAny:boolean; //Global flag to check if the user has delegate any permissions or not
  public showCommentsBox:boolean; //Global flag to check if the comment box needs to be shown to the user or not

  /**
   * Creates an instance of ApprovalDialogComponent.
   * @param {RapidflowService} rapidflowService 
   * @param {ProcessDataService} processDataService 
   * @param {ProcessFormService} processFormService 
   * @param {WorkflowRoutingService} workflowRoutingService 
   * @param {MatDialogRef<ApprovalDialogComponent>} dialogRef 
   * @param {EventEmiterService} EventEmiterService 
   * @param {MatDialog} notAllowedDialog 
   * @param {Router} router 
   * @param {*} data 
   * @param {MatDialog} dialog 
   * @memberof ApprovalDialogComponent
   */
  constructor(private rapidflowService: RapidflowService,
    private processDataService: ProcessDataService,
    private processFormService: ProcessFormService,
    private workflowRoutingService: WorkflowRoutingService,
    private dialogRef: MatDialogRef<ApprovalDialogComponent>,
    private EventEmiterService:EventEmiterService,
    private notAllowedDialog: MatDialog,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog) {
    this.taskDetails = this.data.taskDetails;
    this.listType = this.data.listType;
    this.ActionButtons = {};
    this.DelegateActionButton = {};
    this.showDelegateSection = false;
    this.showDelegateButton = false;
    this.TaskName = "";
    this.TaskInstructions = "";
    this.refrenceNumber = "";
    this.workflowName = "";
    this.dateCreated = "";
    this.userComments = "";
    this.DelegateDetails = [];
    this.DelegateOptions = {};
    this.DelegateOptions = {
      "defaultValue": "",
      "readonly": false,
      "disabled": false,
      "required": false,
      "visible": true,
      "validationText": "Field cannot be blank"
    };
    this.multipleAssignee = false;
    this.delegateFrom == "";
    this.isDelegateAny = false;
    this.showCommentsBox = true;
  }

  /**
   * Triggered when the approval dialog is called and initializes the values for the approval dialog
   * 
   * @memberof ApprovalDialogComponent
   */
  ngOnInit() {
    try {
      this.setApprovalDialogValues();
      this.processFormService.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
      this.workflowRoutingService.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
      this.CurrentPendingTasksJSON = this.workflowRoutingService.getPendingTasksJSON(this.WorkflowTasksJSON);
      this.CurrentUserTaskJSON = this.workflowRoutingService.getCurrentUserTaskJSON(this.CurrentPendingTasksJSON);
      this.updateCurrentPendingTaskName();
      this.ActionButtons = {};
      this.DelegateActionButton = {};
      this.renderApprovalDialog();
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("ngOnInit-Approval Dialog Component", "Platform", ex.message, ex.stack, "An error occured while rendering component ", "N/A", this.taskDetails["ProcessID"], true);
    }
  }

  /**
   * Function called to render the approval dialog.
   * Controls the buttons for the user and comments box visibility for the user based on permissions
   * @memberof ApprovalDialogComponent
   */
  renderApprovalDialog(){
    try{
      //check action buttons for the user
      this.ActionButtons = this.processFormService.determineUserActionsForApprovalDialog(this.WorkflowTasksJSON, this.CurrentPendingTasksJSON, this.CurrentUserTaskJSON, this);
      var buttonsFound = false;
      for (let key in this.ActionButtons) {
        buttonsFound = true;
        break;
      }

      //check if the task is assigned to multiple users
      if (this.CurrentPendingTasksJSON.length > 1) {
        this.multipleAssignee = true;
        this.isDelegateAny = this.processFormService.getIsDelegateAny(); 
        if(!this.isDelegateAny){
          this.delegateFrom = this.CurrentUserTaskJSON[0].AssignedToEmail;
        }
      }
      else {
        this.multipleAssignee = false;
        this.delegateFrom = this.CurrentPendingTasksJSON[0].AssignedToEmail;
      }

      //check if the comments box should be visibile to the user or not
      if(!buttonsFound || !this.CurrentPendingTasksJSON[0].CommentsFlag){
        this.showCommentsBox = false;
      }

      //check if the current task is delegated or not
      let delegatedTasks = this.workflowRoutingService.checkIsDelegatedTask(this.CurrentPendingTasksJSON);
      for(let i=0;i<delegatedTasks.length;i++){
        if(this.CurrentPendingTasksJSON.length == 1){
        }
        else if(this.CurrentPendingTasksJSON.length > 1){
          this.CurrentPendingTasksJSON.splice(delegatedTasks[i],1);
        }
      }

      //show delegate section in case if the user has delegate permissions
      if(!this.CurrentUserTaskJSON[0].IsDelegated){
        for (let key in this.ActionButtons) {
          let obj = this.ActionButtons[key];
          if (key.toLowerCase() == "delegate") {
            this.showDelegateSection = true;
            this.showDelegateButton = false;
            this.DelegateActionButton[key] = obj;
            delete this.ActionButtons[key];
          }
        }
      }
      else{
        for (let key in this.ActionButtons) {
          let obj = this.ActionButtons[key];
          if (key.toLowerCase() == "delegate") {
            this.showDelegateSection = false;
            this.showDelegateButton = false;
            delete this.ActionButtons[key];
          }
        }
      }
    }
    catch(ex){
      this.rapidflowService.ShowErrorMessage("ngOnInit-Approval Dialog Component", "Platform", ex.message, ex.stack, "An error occured while rendering component ", "N/A", this.taskDetails["ProcessID"], true);
    }
  }
  
  /**
   * Refresh the process and task after the user has taken action on the task
   * 
   * @memberof ApprovalDialogComponent
   */
  RefereshProcessAndTasks() {
    let taskRefreshObject = { "Type": "Referesh", Value: { "Tasks": "true","Submissions":"true" } }
    this.EventEmiterService.changeMessage(taskRefreshObject);
    let countRefreshObject = { "Type": "AllCounts", Value: { "Count": "true" } }
    this.EventEmiterService.changeMessage(countRefreshObject);
  }
  
  /**
   * Set the approval dialog details link reference number, date created
   * Also set up the approval dialog based on ;ist type
   * @memberof ApprovalDialogComponent
   */
  setApprovalDialogValues() {
    try {
      this.WorkflowTasksJSON = this.taskDetails["FormTasks"];
      if (this.listType != "submissions") {
        this.DefaultButtonsJSON = JSON.parse(this.taskDetails["DefaultButtonsJSON"]);
        this.FormSettings = JSON.parse(this.taskDetails["FormSettings"]);
        this.refrenceNumber = this.taskDetails["ItemHeader1"];
        this.workflowName = this.taskDetails["ItemHeader2"];
        this.dateCreated = this.taskDetails["DateCreatedProcessOffset"];
      }
      else {
        this.DefaultButtonsJSON = this.data.currentWorkflow.WorkflowSettingsJSON[0].DefaultButtons;
        this.FormSettings = this.data.currentWorkflow.WorkflowSettingsJSON[0].FormSettings;
        this.refrenceNumber = this.taskDetails["Reference"];
        this.workflowName = this.data.currentWorkflow.WorkflowDisplayName;
        this.dateCreated = this.taskDetails["PendingSince"];
      }
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("setApprovalDialogValues-Approval Dialog component", "Platform", ex.message, ex.stack, "An error occured while setting values ", "N/A", this.taskDetails["ProcessID"], true);
    }
  }

  /**
   * Update current pending task and its instructions in the class variable
   * 
   * @memberof ApprovalDialogComponent
   */
  updateCurrentPendingTaskName() {
    try {
        this.TaskName = decodeURI(this.CurrentPendingTasksJSON[0].TaskName);
        this.TaskName = this.TaskName.replace(/\\\\u0027/g, '\'');
        if(this.CurrentPendingTasksJSON[0].AssignedToEmail.toLowerCase() == this.CurrentUserTaskJSON[0].AssignedToEmail.toLowerCase()){
          this.TaskInstructions = decodeURI(this.CurrentPendingTasksJSON[0].TaskInstructions);
        }
        else{
          this.TaskInstructions = "";
        }
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("updateCurrentPendingTaskName-Approval Dialog Component", "Platform", ex.message, ex.stack, "An error occured while updating task name ", "N/A", this.taskDetails["ProcessID"], false);
    }
  }

  /**
   * Function called when the user takes action on the task
   * Returns to outcome of the performed action
   * @param {any} buttonId button id of the button that the user performed action
   * @param {any} button button object containing button details of the current action
   * @memberof ApprovalDialogComponent
   */
  userAction(buttonId, button) {
    try{
      if(button.confirmation.toLowerCase() == "none")
      {
        this.performActionNow(buttonId, button); 
      }
      else if(button.confirmation.toLowerCase() == "warn")
      {
        let popupTitle = "Rapidflow";
        if(this.data.taskDetails.WorkFlowDisplyName != undefined){
          popupTitle = this.data.taskDetails.WorkFlowDisplyName;
        }
        else if(this.data.taskDetails.FormTitle != undefined){
          popupTitle = this.data.taskDetails.FormTitle;
        }

        let dialogRef: MatDialogRef<ConfirmationDialogComponent>;;
        dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: popupTitle,
            message: (button.confirmation.warningtext)?(button.confirmation.warningtext):'Are you sure you want to continue?',
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if(result){
            this.performActionNow(buttonId, button);
          }
        });
      }
      else if(button.confirmation.toLowerCase() == "authenticate")
      {
        let dialogRefAuth: MatDialogRef<AuthenticateUserDialogComponent>;;
        dialogRefAuth = this.dialog.open(AuthenticateUserDialogComponent, {
          data: {
            title: "Re-Authentication Required",
            currentUserName: this.workflowRoutingService.CurrentLoggedInUser["LoginID"],
            currentUserLoginId: this.workflowRoutingService.CurrentLoggedInUser["LoginID"]
          },
          width:"20%"
        });
        dialogRefAuth.afterClosed().subscribe(result => {
          if(result){
            this.performActionNow(buttonId, button);
          }
        });
      }
    }
    catch(error){
      this.rapidflowService.ShowErrorMessage("userAction-Approval Dialog Component", "Platform", error.message,error.stack, "An error occured while taking action on task", "N/A", this.taskDetails["ProcessID"], true);
    }
  }

  /**
   * Function called after the user has been prompted for verification 
   * on action on the task
   * @param {any} buttonId button id of the button that the user performed action 
   * @param {any} button button object containing button details of the current action
   * @memberof ApprovalDialogComponent
   */
  performActionNow(buttonId, button) {
    try {
      let dialogRef = this.dialog.open(ProgressDialogComponent, {
        data: {
          message: "Processing task..."
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result != false){
          this.dialog.closeAll();
          this.RefereshProcessAndTasks();
        }
      });
      if(buttonId == "DELEGATE"){
        if(this.delegateFrom == ""){
          let popupTitle = "Rapidflow";
          if(this.data.taskDetails.WorkFlowDisplyName != undefined){
            popupTitle = this.data.taskDetails.WorkFlowDisplyName;
          }
          else if(this.data.taskDetails.FormTitle != undefined){
            popupTitle = this.data.taskDetails.FormTitle;
          }
          let dialogRefDelegate1 = this.notAllowedDialog.open(AlertDialogComponent, {
            data: {
              title: popupTitle,
              message: "Please select an assignee whose task you want to delegate.",
            }
          });
          dialogRefDelegate1.afterClosed().subscribe(result => {
            dialogRef.close(false);
          });
        }
        else if(this.DelegateDetails.length == 0){
          let popupTitle = "Rapidflow";
          if(this.data.taskDetails.WorkFlowDisplyName != undefined){
            popupTitle = this.data.taskDetails.WorkFlowDisplyName;
          }
          else if(this.data.taskDetails.FormTitle != undefined){
            popupTitle = this.data.taskDetails.FormTitle;
          }
          let dialogRefDelegate2 = this.notAllowedDialog.open(AlertDialogComponent, {
            data: {
              title: popupTitle,
              message: "Please select an assignee for task delegation.",
            }
          });
          dialogRefDelegate2.afterClosed().subscribe(result => {
            dialogRef.close(false);
          });
        }
        else if(this.delegateFrom.toLowerCase() == this.DelegateDetails[0].Email.toLowerCase()){
          let popupTitle = "Rapidflow";
          if(this.data.taskDetails.WorkFlowDisplyName != undefined){
            popupTitle = this.data.taskDetails.WorkFlowDisplyName;
          }
          else if(this.data.taskDetails.FormTitle != undefined){
            popupTitle = this.data.taskDetails.FormTitle;
          }
          let dialogRefDelegate = this.notAllowedDialog.open(AlertDialogComponent, {
            data: {
              title: popupTitle,
              message: "The task has been already assigned to the selected user.",
            }
          });
          dialogRefDelegate.afterClosed().subscribe(result => {
            dialogRef.close(false);
          });
        }
        else{
          this.processFormService.userActionForApprovalDialog(buttonId, this, dialogRef);
        }
      }
      else{
        this.processFormService.userActionForApprovalDialog(buttonId, this, dialogRef);
      }
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("userAction-Approval Dialog Component", "Platform", ex.message, ex.stack, "An error occured while performing user action", "N/A", this.taskDetails["ProcessID"], true);
    }
  }

  /**
   * Set the date format of the current task the user has opened
   * 
   * @param {any} dateStringISO string that needs to be formated 
   * @returns formated date as per our standards
   * @memberof ApprovalDialogComponent
   */
  setTaskDateFormat(dateStringISO) {
    if (dateStringISO == "" || dateStringISO == undefined) {
      return "";
    }
    return moment.utc(dateStringISO).format("DD-MMM-YYYY hh:mm A")
  }
}
