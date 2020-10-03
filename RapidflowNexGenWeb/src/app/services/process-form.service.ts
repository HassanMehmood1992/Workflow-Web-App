/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessFormService
Description: Functionality related to form operations like rendering form and taking action on form.
Location: ./services/process-form.service
Author: Sheharyar, Hassan
Version: 1.0.0
Modification history: none
*/
import { AlertDialogComponent } from './../components/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material';
import { EncryptionService } from './encryption.service';
import { async } from '@angular/core/testing';
import { ProgressDialogComponent } from './../components/progress-dialog/progress-dialog.component';
import { SocketProvider } from './socket.service';
import { KeysPipe } from './../pipes/keys.pipe';
import { Injectable } from '@angular/core';
import { RapidflowService } from './rapidflow.service';
import * as moment from 'moment';
import { ProcessDataService } from './process-data.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgZone } from '@angular/core';
import { FormatOffsetDatePipe } from '../pipes/format-offset-date.pipe';


declare var jQuery: any; // Global varaibale of the class to store the JQuery referenced in jquery.min.js 
declare var $: any; // Global varaibale of the class to store the JQuery referenced in jquery.min.js

@Injectable()
export class ProcessFormService {
  private FormLogicComponent: string; // Global varaibale of the class to store the form component logic
  private FormHtml: string; // Global varaibale of the class to store the form html
  private ProcessSettingsJSON: object; // Global variable of the class to store process settings for the opened workflow
  private FormDataJSON: object; // Global variable for form data of the opened workflow form
  private WorkflowSettingJSON: object; // Global variable of the class to store workflow settings of the opened workflow
  private WorkflowTasksJSON: any[]; // Global variable of the class to store workflow tasks for the opened workflow
  private ProcessTasksJSON: any[]; // Global variable of the class to store the latest workflow tasks for the selected workflow
  private RepeatingTableJSON: any[]; // Global variable of the class to store the repeating tables definitiob for the selected workflow
  public CurrentLoggedInUser: any; // Global variable of the class to store the current logged in user for the workflow
  private UserPermissions: any[]; // Global variable of the class to store the user permissions for the current workflow
  private AllowedActionButtons: any[]; // Global variable of the class to store the allowed action buttons for the user
  private isSavedFormOpen = false; // Global flag of the class to check if a saved form is opened or not
  private PlatFormSettings: any; // Global variable of the class to store the platform settings for the current worklfow
  private ArchivePath: any; // Global variable of the class to store the archive path for the current workflow
  private AndriodRedirect: any; // Global variable of the class to store the andriod redirect path for the selected workflow
  private IosRedirect: any; // Global variable of the class to store the ios redirect path for the selected workflow
  private isFormDeleted: boolean; // Global flag of the class to check if the saved form is deleted or not
  private isDelegateAny: boolean; // Global flag of the class to check if the user has delegate any permissions or not

  /**
   * Creates an instance of ProcessFormService.
   * @param {RapidflowService} rapidflowService 
   * @param {ProcessDataService} processDataService 
   * @param {ActivatedRoute} route 
   * @param {SocketProvider} socket 
   * @param {MatDialog} dialog 
   * @param {NgZone} ngZone 
   * @memberof ProcessFormService
   */
  constructor(private rapidflowService: RapidflowService,
    private processDataService: ProcessDataService,
    private route: ActivatedRoute,
    private socket: SocketProvider,
    private dialog: MatDialog,
    private ngZone: NgZone) {
    if (window.localStorage['User'] == undefined || window.localStorage['User'] == "") {
      this.CurrentLoggedInUser = {};
    }
    else {
      this.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
    }
    this.AllowedActionButtons = [];
    this.PlatFormSettings = [];
    this.setPlatformSettings();
    this.isFormDeleted = false;
    this.isDelegateAny = false;
  }

  /**
   * Function called to initialize the class objects with default values
   * 
   * @memberof ProcessFormService
   */
  initializeObjects() {
    if(window.localStorage['User']==undefined||window.localStorage['User']=="")
    {
      this.CurrentLoggedInUser={};
    }
    else{
      this.CurrentLoggedInUser = JSON.parse(window.localStorage['User']); 
    }
    this.AllowedActionButtons = [];
    this.PlatFormSettings = [];
    this.setPlatformSettings();
    this.isFormDeleted = false;
  }

  /**
   * Function called to set the user permissions if the permissions are not defined
   * 
   * @param {any} permissions user permissions from service
   * @memberof ProcessFormService
   */
  setUserPermissions(permissions) {
    if (permissions == undefined) {
      this.UserPermissions = this.processDataService.userPermissions;
    }
    else {
      this.UserPermissions = permissions;
    }
  }

  /**
   * Function called to set the global flag isFormDeleted
   * 
   * @param {any} deletedOn the date on which the saved form is deleted
   * @memberof ProcessFormService
   */
  setIsFormDeleted(deletedOn) {
    if (deletedOn != null || deletedOn != undefined) {
      if (deletedOn == "") {
        this.isFormDeleted = false;
      }
      else {
        this.isFormDeleted = true;
      }
    }
  }

  /**
   * Function called to retrieve process lookup data from the server
   * 
   * @param {any} processId process id for the process lookup 
   * @param {any} lookupName lookup name for the desired process lookup
   * @param {any} replacedLookupColumns lookup columns for the query
   * @param {any} replacedFilterString filter string for the query
   * @returns the process lookup data
   * @memberof ProcessFormService
   */
  retrieveProcessLookupData(processId, lookupName, replacedLookupColumns, replacedFilterString) {
    let promise = new Promise((resolve, reject) => {
      var rows = []
      try {
        this.rapidflowService.retrieveProcessLookupFormData(processId, lookupName, replacedLookupColumns, replacedFilterString, "").subscribe((response) => {
          var lookupData = this.rapidflowService.parseRapidflowJSON(response).LookupValues;
          var tempNgModel = [];
          try {
            if (lookupData.length) {


              for (var i = 0; i < lookupData.length; i++) {
                var obj = lookupData[i];
                rows.push(obj);
              }
            }
            resolve(rows);
          } catch (error) {
            var tempArray = []
            resolve(tempArray)
          }
        }, (error) => {
          this.rapidflowService.ShowErrorMessage("retrieveProcessLookupFormData Lookup  dialog  component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveProcessLookupFormData", " rapidflowService.retrieveProcessLookupFormData", processId, true);
        });
      } catch (error) {
        this.rapidflowService.ShowErrorMessage("retrieveProcessLookupFormData Lookup  dialog  component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveProcessLookupFormData", " rapidflowService.retrieveProcessLookupFormData", processId, true);

      };
    });
    return promise;
  }

  /**
   * Function called to retrieve process form data from the server
   * 
   * @param {any} processId process id for the data
   * @param {any} workflowId workflow d for the data
   * @param {any} conditionalStatement query for the data
   * @returns the data rows from the server
   * @memberof ProcessFormService
   */
  retrieveProcessFormData(processId, workflowId, conditionalStatement) {
    let promise = new Promise((resolve, reject) => {
      var rows = []
      try {
        this.rapidflowService.retrieveDatabaseLookupFormData(processId, workflowId, conditionalStatement).subscribe((response) => {
          var dbData = this.rapidflowService.parseRapidflowJSON(response);
          rows = dbData
          resolve(rows);
        }, (error) => {
          this.rapidflowService.ShowErrorMessage("retrieveProcessDBLookupData Lookup  dialog  component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveProcessDBLookupData", " rapidflowService.retrieveProcessDBLookupData", processId, true);
        });
      } catch (error) {
        this.rapidflowService.ShowErrorMessage("retrieveProcessDBLookupData Lookup  dialog  component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveProcessDBLookupData", " rapidflowService.retrieveProcessDBLookupData", processId, true);

      };
    });
    return promise;
  }

  /**
   * Function called to retrieve the value of isFormDeleted flag
   * 
   * @returns the value
   * @memberof ProcessFormService
   */
  getIsFormDeleted() {
    return this.isFormDeleted
  }

  /**
   * Function called to return the form HTML for the opened workflow
   * 
   * @param {any} html html from server
   * @returns {string} combined html for the workflow form
   * @memberof ProcessFormService
   */
  getFormHtml(html): string {
    let formHtml: string = `<div class="content hideoverflowverticle"  fxLayout="row wrap" fxLayout.xs="column" fxLayout.md="column" fxLayout.sm="column" style="overflow:hidden;background:#f5f5f5;">
    <div class="MyProcessRow" style="height:100%;">
    <mat-card>
    <p *ngIf="alertUserForFormDeletion" style="width:100%">
    <ngb-alert *ngIf="!closed" (close)="closed=true" type='danger' [dismissible]="true">
    <span [innerHTML]="'Please delete this form as newer version is available.'">
    </span>
    </ngb-alert>
    </p>
    <form #processForm="ngForm" ngNativeValidate>
       <div id="formHtml" class="content" fxLayout="row wrap"
       fxLayout.xs="column"
       fxLayout.md="column"
       fxLayout.sm="column"
       fxLayoutWrap>`; formHtml += decodeURI(html);
    formHtml += `</div></form>
       <div class="content" fxLayout="row wrap"
       fxLayout.xs="column"
       fxLayout.md="column"
       fxLayout.sm="column"
       fxLayoutWrap fxLayoutAlign="space-around">
        <mat-expansion-panel #matExpansionPanel *ngIf="showRouting" style="width:100%;box-shadow:none !important;">
        <mat-expansion-panel-header style="padding:0 !important;">
            <div class="content itemTitle" fxLayout="row wrap"
            fxLayout.xs="column"
            fxLayout.md="column"
            fxLayout.sm="column"
            fxLayoutWrap style="width:100%;text-indext:4px !important;border-bottom:1px solid #071d49; color:#071d49;">
              Workflow Routing
            </div>
        </mat-expansion-panel-header>
        <div class="row">
          <div class="row tasksHeader" style="padding:1%;">
              <div class="col-xs-2" style="top:25%;overflow-wrap: break-word;">Task Name</div>
              <div class="col-xs-2" style="top:25%;overflow-wrap: break-word;">Assigned To</div>
              <div class="col-xs-2" style="top:25%;overflow-wrap: break-word;">Result</div>
              <div class="col-xs-3" style="top:25%;overflow-wrap: break-word;">Date Completed</div>
              <div class="col-xs-3" style="top:25%;overflow-wrap: break-word;">Comments</div>
          </div>
          <div style="padding-left:10px;" class="row" *ngFor="let tasks of WorkflowTasksJSON" [ngClass]="tasks.Required == 'Yes' ? 'tasksRow':''" [hidden]="tasks.Required == 'Yes' ? false : true"  >
            <div *ngIf="tasks.Required == 'Yes'" [style.color]="tasks.Result == 'Pending' ? 'black' : null" class="col-xs-2" style="top:25%;overflow-wrap: break-word;">{{tasks.TaskName}}</div>
            <div *ngIf="tasks.Required == 'Yes'" [style.color]="tasks.Result == 'Pending' ? 'black' : null" class="col-xs-2" style="top:25%;overflow-wrap: break-word;">{{tasks.AssignedToName}}</div>
            <div *ngIf="tasks.Required == 'Yes' && tasks.Result == 'Pending'" [style.color]="tasks.Result == 'Pending' ? 'black' : null" class="col-xs-2" style="top:25%;overflow-wrap: break-word;">{{tasks.PendingText}}</div>
            <div *ngIf="tasks.Required == 'Yes' && tasks.Result != 'Pending'" [style.color]="tasks.Result == 'Pending' ? 'black' : null" class="col-xs-2" style="top:25%;overflow-wrap: break-word;">{{tasks.Result}}</div>
            <div *ngIf="tasks.Required == 'Yes'" [style.color]="tasks.Result == 'Pending' ? 'black' : null" class="col-xs-3" style="top:25%;overflow-wrap: break-word;">{{tasks.DateCompleted | formatOffsetDate: processOffset }}</div>
            <div *ngIf="tasks.Required == 'Yes'" [style.color]="tasks.Result == 'Pending' ? 'black' : null" class="col-xs-3" style="top:25%;overflow-wrap: break-word;">{{tasks.Comments}}</div>
          </div>
        </div>
        </mat-expansion-panel>
        </div>
        </mat-card>
        <mat-card *ngIf="(FormDataJSON.Status == 'INITIATING' || FormDataJSON.Status == 'SAVED' || FormDataJSON.Status == 'PENDING') && (actionPanelVisible || showDelegateButton)" >
        <div class="content" fxLayout="row wrap"
        fxLayout.xs="column"
        fxLayout.md="column"
        fxLayout.sm="column"
        fxLayoutWrap>
        <mat-expansion-panel #matExpansionPanel style="width:100%;box-shadow:none !important;">
        <mat-expansion-panel-header style="padding:0 !important;">
            <div class="content itemTitle" fxLayout="row wrap"
            fxLayout.xs="column"
            fxLayout.md="column"
            fxLayout.sm="column"
            fxLayoutWrap style="width:100%;text-indext:4px !important;border-bottom:1px solid #071d49; color:#071d49;">
              {{currentPendingTask}}
            </div>
        </mat-expansion-panel-header>
        <div class="content" fxLayout="row wrap"
        fxLayout.xs="column"
        fxLayout.md="column"
        fxLayout.sm="column"
        fxLayoutWrap style="" id="taskInstructions">
            {{taskInstructions}}
          </div>
        </mat-expansion-panel>
          <table border="0" style="width:100% !important;" id="RFRapidFlowPanel">
          <tbody>
          <tr id="CommentsPanelRow" name="CommentsPanelRow">
              <td>
              <div fxFlex>
                  <label class="control-label" for="RFUserComments">Comments</label>
                      <textarea class="form-control" id="RFUserComments" name="RFUserComments" rows="3" [(ngModel)]="UserComments" style="width:99.5%;" maxlength="255"></textarea>
              </div>
              </td>
          </tr>
          <tr>
              <td>
              <table *ngIf="FormDataJSON.Status == 'INITIATING' || FormDataJSON.Status == 'SAVED'" border="0" id="RFPanelNotifycheckbox" align="right" style="margin-right:1.5%;margin-top:1%;margin-bottom:-1%;">
                  <tbody>
                  <tr>
                      <td></td>
                      <td>
                          <div class="content">
                              <div fxFlex style="">
                                  <input [(ngModel)]="FormDataJSON.CopyInitiatorOnTaskNotification" style="margin: 0% !important;" type="checkbox" id="chkboxTaskInitiatorNotification" />
                                  <span>Notify me on each task assignment</span><br><br>
                              </div>
                          </div>
                      </td>
                  </tr>
                  </tbody>
              </table>
              </td>
          </tr>
          <tr>
              <td>
              <div border="0" id="RFPanelButtons" align="right" style="margin-right:1.5%;">
              <div align="right">
                  <div id="DelegateActionButton" class="row" style="padding:1%;">
                      <h3 style="text-align:left;font-size: 1.4rem;font-weight: normal; color: #6f6f6f;width:100%;" *ngIf="showDelegateSection">Delegate
                          <span style="float:right">
                              <img (click)="showDelegateButton=!showDelegateButton" [src]="showDelegateButton ? 'assets/images/top_level/up_arrow.png' : 'assets/images/top_level/down_arrow.png'"
                                  style="max-height: 20px;max-width: 20px;height: 20px;width: 20px;">
                          </span>
                      </h3>
                      <div *ngIf="showDelegateButton && multipleAssignee && isDelegateAny">
                      <mat-form-field class="publishFormField roleSelectInput">
                      <mat-select [(ngModel)]="delegateFrom" required placeholder="Select assignee">
                          <mat-option *ngFor="let person of CurrentPendingTasksJSON" [value]="person.AssignedToEmail">{{person.AssignedToName}}</mat-option>
                      </mat-select>
                  </mat-form-field> 
                      </div>
                      <div *ngIf="showDelegateButton" style="padding-top:0.5%;">
                          <app-people-picker [(ngModel)]="DelegateDetails" ngDefaultControl [selfSelection]="'false'" [selectionType]="'single'" [selectorHeading]="'Select Delegate'"
                              [controlOptions]="DelegateOptions" [fieldName]="'DelegateDetails'"></app-people-picker>
                          <br/>
                          <button [disabled]="!processForm.valid && DelegateDetails.length == 0" data-tap-disabled="true" class="btn" [style.color]="DelegateDetails.length == 0 && !processForm.valid && delegateFrom == '' ? '#6d6d6d':'#007aff'" [attr.disabled]="DelegateDetails.length == 0 && delegateFrom == '' ? '':null"
                              style="color: #007aff;background-color:#dadada;border-radius:8px;min-width:120px;margin-bottom:1%;"
                              *ngFor="let button of DelegateActionButton | keys" class="btn" (click)="userAction(button.key,button.value, processForm)" [attr.title]="button.value.tooltip">{{button.value.label}}</button>
                      </div>
                  </div>
              </div>
              <div align="right">
                  <div id="ActionButtons" fxLayout="row" style="float:right;padding:1%;margin-right:3%;"
                      *ngIf="!showDelegateButton">
                      <button [disabled]="(!processForm.valid || !validRepeatingTables) && (button.key != 'SAVE' && button.key != 'RESET' && button.key != 'DELETE' && button.key != 'RESTORE' && button.key != 'TERMINATE')" [style.color]="(processForm.valid && validRepeatingTables) || (button.key == 'SAVE' || button.key == 'RESET' || button.key == 'DELETE' || button.key == 'RESTORE' || button.key == 'TERMINATE') ? '#007aff':'#6d6d6d'" data-tap-disabled="true" class="btn" style="background-color:#dadada;border-radius:8px;min-width:120px;margin-left:1%;margin-right:1%;"
                          *ngFor="let button of ActionButtons | keys" (click)="userAction(button.key,button.value, processForm)" [attr.title]="button.value.tooltip">{{button.value.label}}</button>
                  </div>
              </div>
          </div>
              </td>
          </tr>
          </tbody>
      </table>
      </div>
      </mat-card>
      
        </div>
   </div>`;
    return formHtml;
  }

  /**
   * Function called to return the workflow tasks for the selected workflow
   * 
   * @returns {any[]} workflow tasks
   * @memberof ProcessFormService
   */
  getWorkflowRouting(): any[] {
    if (this.WorkflowTasksJSON != undefined) {
      return this.WorkflowTasksJSON;
    }
    return null;
  }

  /**
   * Function called to return the workflow settings for the current workflow
   * 
   * @returns {*} workflow settings
   * @memberof ProcessFormService
   */
  getWorkflowSettings(): any {
    if (this.WorkflowSettingJSON != undefined) {
      return this.WorkflowSettingJSON;
    }
    return null;
  }

  /**
   * Function called to return the latest workflow tasks for the current workflow
   * 
   * @returns {any[]} workflow tasks
   * @memberof ProcessFormService
   */
  getProcessTasks(): any[] {
    if (this.WorkflowTasksJSON != undefined) {
      return this.WorkflowTasksJSON;
    }
    return null;
  }

  /**
   * Function called to return the repeating table definitions for the current workflow
   * 
   * @returns {any[]} repeating table definitions
   * @memberof ProcessFormService
   */
  getRepeatingTableJson(): any[] {
    if (this.RepeatingTableJSON != undefined) {
      return this.RepeatingTableJSON;
    }
    return null;
  }

  /**
   * FUnction called to return the global flag isDelegateAny
   * 
   * @returns the value of the flag
   * @memberof ProcessFormService
   */
  getIsDelegateAny() {
    return this.isDelegateAny;
  }

  /**
   * Function called to retrieve the form logic for the current workflow
   * 
   * @param {any} formLogic form logic from database
   * @returns {*} form logic 
   * @memberof ProcessFormService
   */
  getFormLogicComponent(formLogic): any {
    if (decodeURIComponent(formLogic) != undefined) {
      return decodeURIComponent(formLogic);
    }
    else {
      let formComponent: string = `comp={
        performFormLoadOperations:function(){return true;},
        performPreWorkflowTaskOperations:function(){return true;},
        performPostWorkflowTaskOperations:function(){return true;}
      }`;
      return formComponent;
    }
  }

  /**
   * Function called to set the platform settings for the current workflow
   * 
   * @memberof ProcessFormService
   */
  setPlatformSettings() {
    this.rapidflowService.retrievePlatformSettings().subscribe((response) => {
      try {
        let tempSettings = response.json();
        tempSettings = tempSettings.replace(/\\/g, "\\\\")
        tempSettings = tempSettings.replace(/\n/g, "");
        tempSettings = tempSettings.replace(/\r/g, "");
        this.PlatFormSettings = JSON.parse(tempSettings);
        for (var i = 0; i < this.PlatFormSettings.length; i++) {
          if (this.PlatFormSettings[i].SettingName == "RAPIDFLOW_ARCHIVE_PATH") {
            this.ArchivePath = this.PlatFormSettings[i].Value;
          }
          else if (this.PlatFormSettings[i].SettingName == "APPLE_APP_STORE") {
            this.IosRedirect = this.PlatFormSettings[i].Value;
          }
          else if (this.PlatFormSettings[i].SettingName == "ANDROID_APP_STORE") {
            this.AndriodRedirect = this.PlatFormSettings[i].Value;
          }
        }
      } catch (ex) {
        this.rapidflowService.ShowErrorMessage("retrieveAndSetProcess-retrievePlatformSettings-Main component", "Platform", ex.message, ex.stack, "An error occured while extracting platform settings", "N/A", '0', true);
      }
    });
  }

  /**
   * Function called to retrieve form data for the current workflow
   * 
   * @param {any} processId process id of the process 
   * @param {any} workflowId workflow id of the workflow
   * @param {any} processSettings process setings for the current workflow
   * @param {any} workflowSettings worklfow settings for the current workflow
   * @param {any} formOptions form options for the current workflow
   * @param {any} workflowVersion workflow version of the current workflow
   * @returns {*} form data 
   * @memberof ProcessFormService
   */
  getFormData(processId, workflowId, processSettings, workflowSettings, formOptions, workflowVersion): any {
    try {
      let processOffset = new FormatOffsetDatePipe();
      let processOffsetDate = processOffset.transform(moment.utc(new Date()), processSettings["PROCESS_TIMEZONE"]);
      processOffsetDate = moment(processOffsetDate).format('DD-MMM-YYYY')
      this.FormDataJSON = {
        "ProcessTitle": processSettings.PROCESS_NAME,
        "FormTitle": workflowSettings[0].Form_Header.FormTitle,
        "Reference": "Not Assigned",
        "Status": "INITIATING",
        "DisplayStatus": workflowSettings[0].Workflow_Status_Labels["INITIATING"],
        "WorkflowName": workflowSettings[0].Form_Header.FormName,
        "DateInitiated": processOffsetDate,
        "DateCompleted": "",
        "ProcessID": processId.toString(),
        "WorkflowID": workflowId.toString(),
        "FormID": this.generateGUID(),
        "SavedFormID": "",
        "SavedDateTime":"",
        "CopySavedFormAttachments": false,
        "InitiatedByUserID": this.CurrentLoggedInUser.UserID,
        "InitiatedByName": this.CurrentLoggedInUser.DisplayName,
        "InitiatedByLoginID": this.CurrentLoggedInUser.LoginID.toLowerCase(),
        "InitiatedByEmail": this.CurrentLoggedInUser.Email,
        "CurrentLoggedInUserID": this.CurrentLoggedInUser.UserID,
        "CurrentLoggedInLoginID": this.CurrentLoggedInUser.LoginID.toLowerCase(),
        "CurrentLoggedInName": this.CurrentLoggedInUser.DisplayName,
        "CurrentLoggedInEmail": this.CurrentLoggedInUser.Email,
        "CopyInitiatorOnTaskNotification": workflowSettings[0].Form_Settings.COPY_INITIATOR_ON_TASK_NOTIFICATION,
        "SubmissionEmail": workflowSettings[0].Form_Settings.SUBMISSION_EMAIL,
        "AssignmentEmail": workflowSettings[0].Form_Settings.ASSIGNMENT_EMAIL,
        "NotRequiredEmail": workflowSettings[0].Form_Settings.NOT_REQUIRED_EMAIL,
        "CompletionEmail": workflowSettings[0].Form_Settings.COMPLETION_EMAIL,
        "AllJobReaders": "",
        "AdditionalReaders": "",
        "ManagerID": this.CurrentLoggedInUser.ManagerID,
        "ManagerName": this.CurrentLoggedInUser.ManagerDisplayName,
        "ManagerEmail": this.CurrentLoggedInUser.ManagerEmail,
        "FormUrl": "",
        "ArchivePath": this.ArchivePath,
        "AndriodRedirect": this.AndriodRedirect,
        "IOSRedirect": this.IosRedirect,
        "CCUsersForSubmitNotification": "",
        "CCUsersForAssignmentNotification": "",
        "CCUsersForCompletionnotification": "",
        "WorkflowVersion": workflowVersion,
        "FormOptions": {},
        "InvalidRepeatingTables": [],
        "StartingReferenceNumber": workflowSettings[0].Form_Settings.STARTING_REFERENCE_NUMBER,
        "ReferencePrefix": workflowSettings[0].Form_Settings.REFERENCE_PREFIX,
        "ReferenceSuffix": workflowSettings[0].Form_Settings.REFERENCE_SUFFIX,
        "CompletionAttachments": workflowSettings[0].Form_Settings.COMPLETION_ATTACHMENTS,
        "AdditionalWatermarkAttachmentControls": workflowSettings[0].Form_Settings.ADDITIONAL_WATERMARK_ATTACHMENT_CONTROLS,
        "AdditionalWatermarkAttachmentText": workflowSettings[0].Form_Settings.ADDITIONAL_WATERMARK_ATTACHMENTS_TEXT
      };

      for (let key in formOptions) {
        let obj = formOptions[key];
        this.FormDataJSON["FormOptions"][key] = obj;
        if (typeof obj["defaultValue"] != "undefined" && obj["defaultValue"] != "") {
          this.FormDataJSON[key] = obj["defaultValue"];
        }
      }
      return this.FormDataJSON;
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("getFormData-Process Form service", "Platform", ex.message, ex.stack, "An error occured while generating form data", "N/A", processId, true);
    }
  }

  /**
   * Function called to update the status of the repeating tables
   * 
   * @param {any} formDataJson form data 
   * @param {any} formOptions form options
   * @param {any} repeatingTablesJson repeating table definition
   * @returns the updated form data
   * @memberof ProcessFormService
   */
  updateInvalidRepeatingTables(formDataJson, formOptions, repeatingTablesJson) {
    for (let key in formOptions) {
      for (let j: number = 0; j < repeatingTablesJson.length; j++) {
        if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
          for (let subKey in formOptions[key]) {
            if (typeof formOptions[key][subKey] == "object") {
              var subObj = formOptions[key][subKey];
              if (subObj["required"]) {
                var obj = {};
                obj["tableName"] = repeatingTablesJson[j]["TableSettings"]["name"];
                obj["valid"] = false;
                if (formDataJson["InvalidRepeatingTables"].length == 0) {
                  formDataJson["InvalidRepeatingTables"].push(obj);
                }
                else {
                  var found = false;
                  for (let k: number = 0; k < formDataJson["InvalidRepeatingTables"].length; k++) {
                    if (formDataJson["InvalidRepeatingTables"][k]["tableName"].toLowerCase() == repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase()) {
                      found = true;
                    }
                  }
                  if (!found) {
                    formDataJson["InvalidRepeatingTables"].push(obj);
                  }
                }
                break;
              }
            }
          }
        }
      }
    }
    return formDataJson;
  }

  /**
   * Function called to set form data
   * 
   * @param {any} formData form data from server
   * @memberof ProcessFormService
   */
  setFormData(formData) {
    this.FormDataJSON = formData;
  }

  /**
   * Function called to retrieve special permissions for the current workflow
   * 
   * @param {any} workflowId workflow id
   * @returns permissions for the user
   * @memberof ProcessFormService
   */
  getSpecialPermissions(workflowId) {
    let specialPermissions = [];
    if (typeof this.UserPermissions != "undefined") {
      for (let index = 0; index < this.UserPermissions.length; index++) {
        if (this.UserPermissions[index].ID == parseInt(workflowId) && this.UserPermissions[index].ItemType.toLowerCase() == "processworkflow") {
          switch (this.UserPermissions[index].PermissionName.toLowerCase()) {
            case "restart any":
              specialPermissions.push(this.UserPermissions[index].PermissionName.toLowerCase());
              break;
            case "terminate any":
              specialPermissions.push(this.UserPermissions[index].PermissionName.toLowerCase());
              break;
            case "delete any":
              specialPermissions.push(this.UserPermissions[index].PermissionName.toLowerCase());
              break;
            case "delegate any":
              this.isDelegateAny = true;
              specialPermissions.push(this.UserPermissions[index].PermissionName.toLowerCase());
              break;
          }
        }
      }
    }
    return specialPermissions;
  }

  /**
   * FUnction called to generate a random guid for the workflow form
   * 
   * @returns {*} form guid
   * @memberof ProcessFormService
   */
  generateGUID(): any {
    return (this.generateRandomNumberforGUID() + this.generateRandomNumberforGUID() + "-" + this.generateRandomNumberforGUID() + "-4" + this.generateRandomNumberforGUID().substr(0, 3) + "-" + this.generateRandomNumberforGUID() + "-" + this.generateRandomNumberforGUID() + this.generateRandomNumberforGUID() + this.generateRandomNumberforGUID()).toLowerCase();
  }

  /**
   * Function called to generate the form guid
   * 
   * @returns form guid
   * @memberof ProcessFormService
   */
  generateRandomNumberforGUID() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  /**
   * Function called to get form values
   * 
   * @param {any} descriptionTemplate description template for the current worklfow
   * @returns form data values
   * @memberof ProcessFormService
   */
  getFormDataKeys(descriptionTemplate) {
    try {
      var keys = [];
      var tempKeys = descriptionTemplate.split("<tag>");
      for (var index = 0; index < tempKeys.length; index++) {
        if (tempKeys[index].indexOf("</tag>") != -1) {
          keys.push(tempKeys[index].substring(0, tempKeys[index].indexOf("</tag>")));
        }
      }
      return keys;
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("getFormKeys-Process Form service", "Platform", ex.message, ex.stack, "An error occured while retrieving form keys for description template", "N/A", this.FormDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called to update the description template
   * 
   * @param {any} formDataJson form data
   * @param {any} WorkflowSettingsJson workflow settings
   * @returns the updated description template
   * @memberof ProcessFormService
   */
  updateDescriptionTemplate(formDataJson, WorkflowSettingsJson) {
    try {
      let descriptionTemplate: string = "";
      if (typeof WorkflowSettingsJson.SubmissionsDefinition.DescriptionTemplate != "undefined") {
        descriptionTemplate = WorkflowSettingsJson.SubmissionsDefinition.DescriptionTemplate;
        var keys = this.getFormDataKeys(descriptionTemplate);
        for (var index = 0; index < keys.length; index++) {
          if (keys[index].indexOf("].") != -1) {
            var peoplePickerFieldValues = keys[index].split(".");
            var fieldName = peoplePickerFieldValues[0].replace("[0]", "");
            var fieldValue = peoplePickerFieldValues[1];
            descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[fieldName][0][fieldValue]);
          }
          else if (keys[index].indexOf(".") != -1) {
            var rtFooterValues = keys[index].split(".");
            var rtName = rtFooterValues[0];
            var rtFooter = rtFooterValues[1];
            descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[rtName][rtFooter]);
          }
          else {
            descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[keys[index]]);
          }
        }
        return descriptionTemplate;
      }
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("updateDescriptionTemplate-Process Form service", "Platform", ex.message, ex.stack, "An error occured while updating description template for submissions", "N/A", this.FormDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called to update the tasks instruction for the current task
   * 
   * @param {any} formDataJson form data
   * @param {any} instruction instruction template
   * @returns the updated task instructions
   * @memberof ProcessFormService
   */
  updateTaskInstructionTemplate(formDataJson, instruction) {
    try {
      let descriptionTemplate: string = "";
      if (typeof instruction != "undefined") {
        descriptionTemplate = instruction;
        var keys = this.getFormDataKeys(descriptionTemplate);
        for (var index = 0; index < keys.length; index++) {
          if (keys[index].indexOf("].") != -1) {
            var peoplePickerFieldValues = keys[index].split(".");
            var fieldName = peoplePickerFieldValues[0].replace("[0]", "");
            var fieldValue = peoplePickerFieldValues[1];
            descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[fieldName][0][fieldValue]);
          }
          else if (keys[index].indexOf(".") != -1) {
            var rtFooterValues = keys[index].split(".");
            var rtName = rtFooterValues[0];
            var rtFooter = rtFooterValues[1];
            descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[rtName][rtFooter]);
          }
          else {
            descriptionTemplate = descriptionTemplate.replace("<tag>" + keys[index] + "</tag>", formDataJson[keys[index]]);
          }
        }
        return descriptionTemplate;
      }
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("updateTaskInstructionTemplate-Process Form service", "Platform", ex.message, ex.stack, "An error occured while updating task instructions", "N/A", this.FormDataJSON["ProcessID"], true);

    }
  }

  /**
   * Function called to update the form html before submission
   * 
   * @param {any} html form html
   * @returns the updsted form html
   * @memberof ProcessFormService
   */
  updateFormHtml(html) {
    html = html.replace(/classrow/g, "row");
    html = html.replace(/classcolsm1/g, "col-sm-1");
    html = html.replace(/classcolsm2/g, "col-sm-2");
    html = html.replace(/classcolsm3/g, "col-sm-3");
    html = html.replace(/classcolsm4/g, "col-sm-4");
    html = html.replace(/classcolsm5/g, "col-sm-5");
    html = html.replace(/classcolsm6/g, "col-sm-6");
    html = html.replace(/classcolsm7/g, "col-sm-7");;
    html = html.replace(/classcolsm8/g, "col-sm-8");
    html = html.replace(/classcolsm9/g, "col-sm-9");
    html = html.replace(/classcolsm10/g, "col-sm-10");
    html = html.replace(/classcolsm11/g, "col-sm-11");
    html = html.replace(/classcolsm12/g, "col-sm-12");
    return html;
  }

  /**
   * Function called when the user performs action on the form and the
   * server assesses the workflow and assigns the next task
   * @param {any} buttonID button Id for the user action
   * @param {any} formComponent form objects for the current workflow
   * @returns 
   * @memberof ProcessFormService
   */
  performWorkflowAssesment(buttonID, formComponent) {
    try {
      if (buttonID == "RESET") {
      } else if (buttonID == "CLOSE") {
      } else if (buttonID == "DELETE") {
        formComponent = this.deleteSavedForm(buttonID, formComponent);
      } else if (buttonID == "RESTORE") {
        formComponent = this.restoreDeletedForm(buttonID, formComponent);
      } else {
        formComponent.FormDataJSON["DescriptionValue"] = this.updateDescriptionTemplate(formComponent.FormDataJSON, formComponent.WorkflowSettingJSON[0]);
        switch (buttonID) {
          case "SUBMIT":
            if (formComponent.FormDataJSON["CopyInitiatorOnTaskNotification"]) {
              if (formComponent.FormDataJSON["CCUsersForAssignmentNotification"] != "") {
                formComponent.FormDataJSON["CCUsersForAssignmentNotification"] += "," + this.CurrentLoggedInUser.Email.toLowerCase();
              }
              else {
                formComponent.FormDataJSON["CCUsersForAssignmentNotification"] += this.CurrentLoggedInUser.Email.toLowerCase();
              }
            }
            if (formComponent.FormDataJSON.Status == "SAVED") {
              formComponent.FormDataJSON.SavedFormID = formComponent.FormDataJSON.FormID;
              formComponent.FormDataJSON.FormID = this.generateGUID();
              let processOffset = new FormatOffsetDatePipe();
              let processOffsetDate = processOffset.transform(moment.utc(new Date()), formComponent.ProcessSettingsJSON["PROCESS_TIMEZONE"]);
              processOffsetDate = moment(processOffsetDate).format('DD-MMM-YYYY');
              formComponent.FormDataJSON.DateInitiated = processOffsetDate;
              formComponent.FormDataJSON.FormUrl = window.location.origin + window.location.pathname + '#/sharedurl?route=form&processID=' + formComponent.FormDataJSON.ProcessID + '&workflowID=' + formComponent.FormDataJSON.WorkflowID + '&formID=' + formComponent.FormDataJSON.FormID + '&reference=' + formComponent.FormDataJSON.Reference
              formComponent.FormDataJSON = this.updateAttachmentPathForSavedForm(formComponent.FormDataJSON);
            }
            formComponent = this.generateReferenceNumber(buttonID, formComponent);
            break;

          case "SAVE":
            formComponent = this.saveFormData(buttonID, formComponent);
            break;

          case "CLAIM":
            formComponent = this.claimCurrentTask(buttonID, formComponent);
            break;

          case "PROCEED_WITH_YES":
          case "PROCEED_WITH_NO":
          case "RESUBMIT":
            formComponent = this.reviewCurrentTask(buttonID, formComponent);
            break;

          case "REJECT":
            formComponent = this.rejectCurrentTask(buttonID, formComponent);
            break;

          case "DELEGATE":
            formComponent = this.delegateCurrentTask(buttonID, formComponent);
            break;

          case "TERMINATE":
            formComponent = this.terminateCurrentTask(buttonID, formComponent);
            break;

          case "RESTART":
            formComponent = this.restartCurrentTask(buttonID, formComponent);
            break;
        }
      }
      return formComponent;
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("performWorkflowAssesment-Process Form service", "Platform", ex.message, ex.stack, "An error occured while performing workflow assesment", "N/A", this.FormDataJSON["ProcessID"], true);

    }
  }

  /**
   * Function called to update the date format
   * 
   * @param {any} inputDate provied date
   * @returns formatted date
   * @memberof ProcessFormService
   */
  formatDate(inputDate) {
    if (inputDate) {
      var utcDate = new Date(Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), inputDate.getHours(), inputDate.getMinutes()))
      return utcDate;
    }
    else {
      var utcDate = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes()))
      return utcDate;
    }
  }

  /**
   * FUnction called to generate reference number for the current workflow
   * 
   * @param {any} buttonId button id
   * @param {any} formComponent form objects
   * @returns the generated reference number details
   * @memberof ProcessFormService
   */
  generateReferenceNumber(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        operationType : 'WORKFLOW',
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: formComponent.FormDataJSON.StartingReferenceNumber,
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              if( result["ReferenceNumber"]  == "-1" || result["ReferenceNumber"]  == -1 ){
                formComponent = this.saveFormData("SAVE",formComponent);
                resolve(formComponent);
              }
              else{
                formComponent.FormDataJSON.Status = result["Status"];
                formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
                formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];  
                formComponent.FormDataJSON.Reference = formComponent.FormDataJSON.ReferencePrefix + '-' + result["ReferenceNumber"] + '-' + formComponent.FormDataJSON.ReferenceSuffix;
                formComponent.FormDataJSON.FormUrl = window.location.origin + window.location.pathname + '#/sharedurl?route=form&processID=' + formComponent.FormDataJSON.ProcessID + '&workflowID=' + formComponent.FormDataJSON.WorkflowID + '&formID=' + formComponent.FormDataJSON.FormID + '&reference=' + formComponent.FormDataJSON.Reference
                resolve(formComponent);
              }
            }
            else {
              formComponent = this.saveFormData("SAVE",formComponent);
              resolve(formComponent);
            }
          }
          else{
            resolve(result);
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("generateReferenceNumber-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while generating reference number", "RapidflowServices.workflowAssesment", '0', true);
        });
    });
    return promise;
  }

  /**
   * Function called when a saved form is deleted by user
   * 
   * @param {any} buttonId button id of the the action
   * @param {any} formComponent form objects
   * @returns the status of the api call
   * @memberof ProcessFormService
   */
  deleteSavedForm(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        action: "delete",
        operationType : 'PROCESS',
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('deleteSavedForm', paramsAssesment)
        .then((result) => {
          if (result != null) {

            resolve(formComponent);
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("deleteSavedForm-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while deleting saved form", "RapidflowServices.dalaeteSavedForm", '0', true);
        });
    });
    return promise;
  }

  /**
   * Function called when a deleted saved form is restored
   * 
   * @param {any} buttonId button id for the action
   * @param {any} formComponent form objects
   * @returns the status of the api call
   * @memberof ProcessFormService
   */
  restoreDeletedForm(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        action: "restore",
        operationType : 'PROCESS',
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('deleteSavedForm', paramsAssesment)
        .then((result) => {
          if (result != null) {

            resolve(formComponent);
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("restoreDeletedForm-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while restoring deleted saved form", "RapidflowServices.deleteSavedForm", '0', true);
        });
    });
    return promise;
  }

  /**
   * Function called to save a new form in the system
   * 
   * @param {any} buttonId button id of the action taken
   * @param {any} formComponent form objects
   * @returns the status of the api call
   * @memberof ProcessFormService
   */
  saveFormData(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        operationType : 'WORKFLOW',
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("saveFormData-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while saving form", "RapidflowServices.workflowAssesment", '0', true);
        });
    });
    return promise;
  }

  /**
   * FUnction called to claim a composite assigned task
   * 
   * @param {any} buttonId button id of the action
   * @param {any} formComponent form objects
   * @returns the status of the api call
   * @memberof ProcessFormService
   */
  claimCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        operationType : 'WORKFLOW',
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("claimCurrentTask-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while claiming task", "RapidflowServices.workflowAssesment", '0', true);
        });
    });
    return promise;
  }

  /**
   * Function called when a pending form is reviewed by user
   * 
   * @param {any} buttonId button id of the action 
   * @param {any} formComponent form objects
   * @returns the status of the api call
   * @memberof ProcessFormService
   */
  reviewCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        operationType : 'WORKFLOW',
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("reviewCurrentTask-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while reviewing form", "RapidflowServices.workflowAssesment", '0', true);
        });
    });
    return promise;
  }

  /**
   * Function called when a pending task is delegated by a user
   * 
   * @param {any} buttonId button id of the action
   * @param {any} formComponent form objects
   * @returns the status of the api call
   * @memberof ProcessFormService
   */
  delegateCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      if (formComponent.delegateFrom == "" || formComponent.delegateFrom == null || formComponent.delegateFrom == undefined) {
        resolve({ message: "Please select an assignee" });
      }
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: formComponent.delegateFrom,
        delegatedToEmail: formComponent.DelegateDetails[0].Email,
        delegatedToName: formComponent.DelegateDetails[0].DisplayName,
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        operationType : 'WORKFLOW',
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("rejectCurrentTask-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while rejecting form", "RapidflowServices.workflowAssesment", '0', true);
        });
    });
    return promise;
  }

  /**
   * Function called when a pending task is rejected by the user
   * 
   * @param {any} buttonId button id of the action
   * @param {any} formComponent form objects
   * @returns the status of the api call
   * @memberof ProcessFormService
   */
  rejectCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        operationType : 'WORKFLOW',
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("rejectCurrentTask-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while rejecting form", "RapidflowServices.workflowAssesment", '0', true);
        });
    });
    return promise;
  }

  /**
   * Function called when a pending form is terminated by user
   * 
   * @param {any} buttonId button id of the action
   * @param {any} formComponent form objects
   * @returns the status of the api call
   * @memberof ProcessFormService
   */
  terminateCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        operationType : 'WORKFLOW',
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("terminateCurrentTask-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while terminating form", "RapidflowServices.workflowAssesment", '0', true);
        });
    });
    return promise;
  }

  /**
   * FUnction called when a pending task is returned by the user
   * 
   * @param {any} buttonId button id of the action
   * @param {any} formComponent form objects
   * @returns the status of the api call
   * @memberof ProcessFormService
   */
  restartCurrentTask(buttonId, formComponent) {
    let promise = new Promise((resolve, reject) => {
      var outcome = "";
      if (formComponent.CurrentUserTaskJSON.length > 0) {
        if (formComponent.CurrentUserTaskJSON[0].ActionButtons != null) {
          outcome = formComponent.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
        }
        else {
          outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
        }
      }
      else {
        outcome = formComponent.WorkflowSettingJSON[0].DefaultButtons[buttonId].outcome;
      }
      var userComments = $("#RFUserComments").val();
      var paramsAssesment = {
        processId: formComponent.FormDataJSON.ProcessID,
        workflowId: formComponent.FormDataJSON.WorkflowID,
        formId: formComponent.FormDataJSON.FormID,
        workflowTasksJson: JSON.stringify(formComponent.WorkflowTasksJSON),
        currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
        currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
        buttonId: buttonId,
        outcome: outcome,
        comments: userComments,
        delegatedFromEmail: "",
        delegatedToEmail: "",
        delegatedToName: "",
        getCurrentDate: this.formatDate(new Date()),
        startingReferenceNumber: "",
        operationType : 'WORKFLOW',
        diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
      };
      var actionresultAssesment = this.socket.callWebSocketService('workflowAssesment', paramsAssesment)
        .then((result) => {
          if (result != null) {
            if (typeof result["Status"] != "undefined" && typeof result["WorkflowTasks"] != "undefined" && typeof result["ReferenceNumber"] != "undefined") {
              formComponent.FormDataJSON.Status = result["Status"];
              formComponent.WorkflowTasksJSON = result["WorkflowTasks"];
              formComponent.FormDataJSON.DisplayStatus = formComponent.WorkflowSettingJSON[0].Workflow_Status_Labels[formComponent.FormDataJSON.Status];
              resolve(formComponent);
            }
            else {
              resolve(result);
            }
          }
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("restartCurrentTask-Process Form service", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while returning form", "RapidflowServices.workflowAssesment", '0', true);
        });
    });
    return promise;
  }

  /**
   * FUnction called to send emails and complete the current task in server
   * 
   * @param {any} buttonId button id of the action taken
   * @param {any} formComponent form objects
   * @memberof ProcessFormService
   */
  performWorkflowProgress(buttonId, formComponent) {
    if(formComponent.FormDataJSON["Status"] == "SAVED"){
      buttonId = "SAVE";
    }
    var params = {
      attachmentMode: formComponent.FormDataJSON.CompletionAttachments,
      processId: formComponent.FormDataJSON.ProcessID,
      workflowId: formComponent.FormDataJSON.WorkflowID,
      formId: formComponent.FormDataJSON.FormID,
      currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
      buttonId: buttonId,
      formData: JSON.stringify(formComponent.FormDataJSON),
      formTasks: JSON.stringify(formComponent.WorkflowTasksJSON),
      formHtml: this.updateFormHtml(encodeURI($("#formHtml").html())),
      formRepeatingTables: JSON.stringify(formComponent.RepeatingTableJSON),
      operationType : 'WORKFLOW',
      dataPayloadSubmission: '{"ProcessID":"' + formComponent.FormDataJSON.ProcessID + '","WorkflowID":"' + formComponent.FormDataJSON.WorkflowID + '","FormID":"' + formComponent.FormDataJSON.FormID + '","Subject":"Test","MessageBody":"Form Submitted","TaskName":"Initiation"}',
      dataPayloadAssignment: '{"ProcessID":"' + formComponent.FormDataJSON.ProcessID + '","WorkflowID":"' + formComponent.FormDataJSON.WorkflowID + '","FormID":"' + formComponent.FormDataJSON.FormID + '","Subject":"Test","MessageBody":"Task Assigned","TaskName":"Initiation"}',
      diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
    };
    var actionresult = this.socket.callWebSocketService('workflowProgress', params);
  }

  /**
   * Function called to generate action buttons for the current logged in user
   * based on permissions and allowed actions for this task
   * @param {any} processId process id 
   * @param {any} workflowId workflow id
   * @param {any} workflowSettings workflow settings
   * @param {any} ActionButtons action buttons for the user
   * @param {any} ActionButtonList action buttons list for the user
   * @returns {*} the available buttons for the current user
   * @memberof ProcessFormService
   */
  generateActionButtons(processId, workflowId, workflowSettings, actionButtons, actionButtonList): any {
    try {
      this.AllowedActionButtons = [];
      let DefaultAvailableButtons = ["CLAIM", "PROCEED_WITH_YES", "PROCEED_WITH_NO", "SUBMIT", "SAVE", "RESUBMIT", "REJECT", "DELEGATE", "RESTART", "TERMINATE", "DELETE", "RESTORE", "CLOSE"];
      if (typeof actionButtons == "undefined") {
        actionButtons = workflowSettings[0].DefaultButtons;
      }
      for (let key in actionButtons) {
        let obj = actionButtons[key];
        if (DefaultAvailableButtons.indexOf(key) > -1) {
          if (actionButtonList.indexOf(key) > -1) {
            if (key.toLowerCase() == "close") {
              this.AllowedActionButtons[key] = obj;
              this.AllowedActionButtons[key].disabled = false;
            }
            else if (key.toLowerCase() == "reset") {
              this.AllowedActionButtons[key] = obj;
              this.AllowedActionButtons[key].disabled = false;
            }
            else {
              this.AllowedActionButtons[key] = obj;
              this.AllowedActionButtons[key].disabled = true;
              if (typeof this.UserPermissions != "undefined") {
                for (let index = 0; index < this.UserPermissions.length; index++) {
                  if (this.UserPermissions[index].ID == parseInt(workflowId) && this.UserPermissions[index].ItemType.toLowerCase() == "processworkflow") {
                    switch (this.UserPermissions[index].PermissionName.toLowerCase()) {
                      case "approve":
                        if (key.toLowerCase() == "proceed_with_yes" || key.toLowerCase() == "proceed_with_no" || key.toLowerCase() == "claim") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "add":
                        if (key.toLowerCase() == "submit" || key.toLowerCase() == "save" || key.toLowerCase() == "resubmit") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delete":
                        if (key.toLowerCase() == "delete" || key.toLowerCase() == "restore") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "reject":
                        if (key.toLowerCase() == "reject") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "restart":
                        if (key.toLowerCase() == "restart") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "terminate":
                        if (key.toLowerCase() == "terminate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "restart any":
                        if (key.toLowerCase() == "restart") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "terminate any":
                        if (key.toLowerCase() == "terminate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delete any":
                        if (key.toLowerCase() == "delete" || key.toLowerCase() == "restore") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delegate":
                        if (key.toLowerCase() == "delegate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delegate any":
                        this.isDelegateAny = true;
                        if (key.toLowerCase() == "delegate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                    }
                  }
                }
                if (typeof this.AllowedActionButtons[key].disabled == "undefined") {
                  this.AllowedActionButtons[key].disabled = false;
                }
              }
            }
          }
        } else
          alert("error in key mentioned in process tasks: " + key);
      }
      this.AllowedActionButtons = this.removeDisabledButtons(this.AllowedActionButtons);
      return this.AllowedActionButtons;
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("generateActionButtons-Process Form service", "Platform", ex.message, ex.stack, "An error occured while generating action buttons", "N/A", this.FormDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called to generate action buttons for the current logged in user when the task is opened in action pop up
   * based on permissions and allowed actions for this task
   * @param {any} listType list type of the task 
   * @param {any} workflowId workflow id
   * @param {any} workflowSettings workflow settings
   * @param {any} actionButtons action buttons for the user
   * @param {any} actionButtonList action buttons list for the user
   * @returns {*} the available buttons for the current user
   * @memberof ProcessFormService
   */
  generateActionButtonsForApprovalDialog(listType, workflowId, workflowSettings, actionButtons, actionButtonList): any {
    try {
      this.AllowedActionButtons = [];
      if (listType == "submissions") {
        var DefaultAvailableButtons = ["RESTART", "TERMINATE", "DELEGATE"];
      } else {
        var DefaultAvailableButtons = ["CLAIM", "PROCEED_WITH_YES", "PROCEED_WITH_NO", "REJECT", "DELEGATE", "RESTART", "TERMINATE"];
      }
      if (typeof actionButtons == "undefined") {
        actionButtons = workflowSettings[0].DefaultButtons;
      }
      for (let key in actionButtons) {
        let obj = actionButtons[key];
        if (DefaultAvailableButtons.indexOf(key) > -1) {
          if (actionButtonList.indexOf(key) > -1) {
            if (key.toLowerCase() == "close") {
              this.AllowedActionButtons[key] = obj;
              this.AllowedActionButtons[key].disabled = false;
            }
            else if (key.toLowerCase() == "reset") {
              this.AllowedActionButtons[key] = obj;
              this.AllowedActionButtons[key].disabled = false;
            }
            else {
              this.AllowedActionButtons[key] = obj;
              this.AllowedActionButtons[key].disabled = true;
              if (typeof this.UserPermissions != "undefined") {
                for (let index = 0; index < this.UserPermissions.length; index++) {
                  if (this.UserPermissions[index].ID == parseInt(workflowId) && this.UserPermissions[index].ItemType.toLowerCase() == "processworkflow") {
                    switch (this.UserPermissions[index].PermissionName.toLowerCase()) {
                      case "approve":
                        if (key.toLowerCase() == "proceed_with_yes" || key.toLowerCase() == "proceed_with_no" || key.toLowerCase() == "claim") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "add":
                        if (key.toLowerCase() == "submit" || key.toLowerCase() == "save" || key.toLowerCase() == "resubmit") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delete":
                        if (key.toLowerCase() == "delete") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "reject":
                        if (key.toLowerCase() == "reject") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "restart":
                        if (key.toLowerCase() == "restart") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "terminate":
                        if (key.toLowerCase() == "terminate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "restart any":
                        if (key.toLowerCase() == "restart") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "terminate any":
                        if (key.toLowerCase() == "terminate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delete any":
                        if (key.toLowerCase() == "delete") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delegate":
                        if (key.toLowerCase() == "delegate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                      case "delegate any":
                        this.isDelegateAny = true;
                        if (key.toLowerCase() == "delegate") {
                          this.AllowedActionButtons[key].disabled = false;
                        }
                        break;
                    }
                  }
                }
                if (typeof this.AllowedActionButtons[key].disabled == "undefined") {
                  this.AllowedActionButtons[key].disabled = false;
                }
              }
            }
          }
        } else { }
      }
      this.AllowedActionButtons = this.removeDisabledButtons(this.AllowedActionButtons);
      return this.AllowedActionButtons;
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("generateActionButtonsForApprovalDialog-Process Form service", "Platform", ex.message, ex.stack, "An error occured while generating user actions for approval dialog", "N/A", this.FormDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called to determine ths user role and permissions for the current assigned task
   * 
   * @param {any} workflowTasksJSON workflow tasks
   * @param {any} currentPendingTasksJSON current pending task
   * @param {any} currentUserTaskJSON current user task
   * @param {any} formData form data
   * @param {any} defaultButtonsJSON default available buttons 
   * @param {any} formSettings form settings
   * @returns the available action buttons for the user
   * @memberof ProcessFormService
   */
  determineUserActions(workflowTasksJSON, currentPendingTasksJSON, currentUserTaskJSON, formData, defaultButtonsJSON, formSettings) {
    try {
      var buttonscases = "";
      var buttonslist = [];
      var NewActionButtons = {};
      //claim
      if ((currentPendingTasksJSON.length > 1 && currentPendingTasksJSON[0].MultipleAssigneeRestriction.toLowerCase() == "anyone") && (this.CurrentLoggedInUser.Email.toLowerCase() == currentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
        // claim button always come from default
        NewActionButtons = defaultButtonsJSON;
        buttonslist = ["CLAIM"];
      }
      else {
        //Initiator Review check if the current task is initiator review and current logged in user is assignee
        if ((this.CurrentLoggedInUser.Email.toLowerCase() == currentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (currentUserTaskJSON[0].TaskName.toLowerCase() == workflowTasksJSON[0].TaskName.toLowerCase())) {
          if (currentUserTaskJSON[0].TaskName == "") {
            if (workflowTasksJSON[0].ActionButtons) {
              NewActionButtons = JSON.parse(workflowTasksJSON[0].ActionButtons);
            }
            else {
              NewActionButtons = defaultButtonsJSON
            }
          }
          if (formData.Status == "SAVED" && !this.isFormDeleted) {
            buttonslist = ["SUBMIT", "SAVE", "DELETE"]
            this.isSavedFormOpen = true;
          }
          else if (formData.Status == "SAVED" && this.isFormDeleted) {
            buttonslist = ["RESTORE"]
            NewActionButtons = defaultButtonsJSON;
            this.isSavedFormOpen = true;
          }
          else {
            buttonslist = ["RESUBMIT", "TERMINATE"]
          }
        }
        else {
          //Initiator
          if ((this.CurrentLoggedInUser.Email.toLowerCase() == formData.InitiatedByEmail.toLowerCase()) && (this.CurrentLoggedInUser.Email.toLowerCase() != currentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
            if (formData.Status == "PENDING") {
              buttonslist = ["RESTART", "TERMINATE"];
              if (currentPendingTasksJSON[0]["TaskName"].toLowerCase() == workflowTasksJSON[0]["TaskName"].toLowerCase()) {
                buttonslist = buttonslist.filter((item) => {
                  return item != "RESTART"
                });
              }
            }
          }
          //Approver
          else if ((this.CurrentLoggedInUser.Email.toLowerCase() == currentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (this.CurrentLoggedInUser.Email.toLowerCase() != formData.InitiatedByEmail.toLowerCase())) {
            buttonslist = ["PROCEED_WITH_YES", "PROCEED_WITH_NO", "REJECT", "DELEGATE", "RESTART"]
          }

          //Assignedto and Initiator
          else if ((this.CurrentLoggedInUser.Email.toLowerCase() == formData.InitiatedByEmail.toLowerCase()) && (this.CurrentLoggedInUser.Email.toLowerCase() == currentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
            buttonslist = ["TERMINATE", "RESTART", "REJECT", "DELEGATE", "PROCEED_WITH_NO", "PROCEED_WITH_YES"]
          }
          //Other all users
          else {
            buttonslist = [];
          }
        }
      }

      let specialPermissions = this.getSpecialPermissions(formData.WorkflowID);
      if (formData.Status == "PENDING") {
        if (specialPermissions.indexOf("terminate any") != -1 && buttonslist.indexOf("TERMINATE") == -1) {
          buttonslist.push("TERMINATE");
        }
        if (specialPermissions.indexOf("restart any") != -1 && buttonslist.indexOf("RESTART") == -1) {
          if (currentUserTaskJSON[0].TaskName.toLowerCase() != workflowTasksJSON[0].TaskName.toLowerCase()) {
            if (currentPendingTasksJSON[0].TaskName.toLowerCase() != workflowTasksJSON[0].TaskName.toLowerCase()) {
              buttonslist.push("RESTART");
            }
          }
        }
        if (specialPermissions.indexOf("delegate any") != -1 && buttonslist.indexOf("DELEGATE") == -1) {
          if (currentUserTaskJSON[0].TaskName.toLowerCase() != workflowTasksJSON[0].TaskName.toLowerCase()) {
            this.isDelegateAny = true;
            buttonslist.push("DELEGATE");
          }
        }
      }
      else if (formData.Status == "SAVED" && !this.isFormDeleted) {
        if (specialPermissions.indexOf("delete any") != -1 && buttonslist.indexOf("DELETE") == -1) {
          buttonslist.push("DELETE");
        }
        this.isSavedFormOpen = true;
      }
      else if (formData.Status == "SAVED" && this.isFormDeleted) {
        if (specialPermissions.indexOf("delete any") != -1 && buttonslist.indexOf("RESTORE") == -1) {
          buttonslist.push("RESTORE");
        }
        NewActionButtons = defaultButtonsJSON;
        this.isSavedFormOpen = true;
      }

      if (currentUserTaskJSON[0].ActionButtons && buttonslist.indexOf("CLAIM") == -1) {
        NewActionButtons = currentUserTaskJSON[0].ActionButtons
      }
      else {
        NewActionButtons = defaultButtonsJSON;
      }
      return this.generateActionButtons(formData.ProcessID, formData.WorkflowID, formSettings, NewActionButtons, buttonslist);
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("determineUserActions-Process Form service", "Platform", ex.message, ex.stack, "An error occured while determining user actions", "N/A", this.FormDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called to determine ths user role and permissions for the current assigned task on pop up
   * 
   * @param {any} workflowTasksJSON workflow tasks
   * @param {any} currentPendingTasksJSON current pending task
   * @param {any} currentUserTaskJSON current user task
   * @param {any} task task details for the current task
   * @returns the available action buttons for the user for pop up
   * @memberof ProcessFormService
   */
  determineUserActionsForApprovalDialog(workflowTasksJSON, currentPendingTasksJSON, currentUserTaskJSON, task) {
    try {
      var buttonscases = "";
      var buttonslist = [];
      var NewActionButtons = {};

      //claim
      if ((currentPendingTasksJSON.length > 1 && currentPendingTasksJSON[0].MultipleAssigneeRestriction.toLowerCase() == "anyone") && (this.CurrentLoggedInUser.Email.toLowerCase() == currentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
        // claim button always come from default
        NewActionButtons = task.DefaultButtonsJSON;
        buttonslist = ["CLAIM"];
      }
      else {
        //Initiator Review check if the current task is initiator review and current logged in user is assignee
        if ((this.CurrentLoggedInUser.Email.toLowerCase() == currentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (currentUserTaskJSON[0].TaskName.toLowerCase() == workflowTasksJSON[0].TaskName.toLowerCase())) {
          if (currentUserTaskJSON[0].TaskName == "") {
            if (workflowTasksJSON[0].ActionButtons) {
              NewActionButtons = JSON.parse(workflowTasksJSON[0].ActionButtons);
            }
            else {
              NewActionButtons = task.DefaultButtonsJSON
            }
          }
          buttonslist = ["RESUBMIT", "TERMINATE"]
        }
        else {
          //Initiator
          if ((this.CurrentLoggedInUser.Email.toLowerCase() == task.taskDetails.InitiatedByEmail.toLowerCase()) && (this.CurrentLoggedInUser.Email.toLowerCase() != currentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
            buttonslist = ["RESTART", "TERMINATE"]
            if (currentPendingTasksJSON[0]["TaskName"].toLowerCase() == workflowTasksJSON[0]["TaskName"].toLowerCase()) {
              buttonslist = buttonslist.filter((item) => {
                return item != "RESTART"
              });
            }
          }
          //Approver
          else if ((this.CurrentLoggedInUser.Email.toLowerCase() == currentUserTaskJSON[0].AssignedToEmail.toLowerCase()) && (this.CurrentLoggedInUser.Email.toLowerCase() != task.taskDetails.InitiatedByEmail.toLowerCase())) {
            buttonslist = ["PROCEED_WITH_YES", "PROCEED_WITH_NO", "REJECT", "DELEGATE", "RESTART"]
          }

          //Assignedto and Initiator
          else if ((this.CurrentLoggedInUser.Email.toLowerCase() == task.taskDetails.InitiatedByEmail.toLowerCase()) && (this.CurrentLoggedInUser.Email.toLowerCase() == currentUserTaskJSON[0].AssignedToEmail.toLowerCase())) {
            buttonslist = ["TERMINATE", "RESTART", "REJECT", "DELEGATE", "PROCEED_WITH_NO", "PROCEED_WITH_YES"]
          }
          //Other all users
          else {
            buttonslist = [];
          }
        }
      }

      let specialPermissions = this.getSpecialPermissions(task.taskDetails.WorkflowID);
      if (specialPermissions.indexOf("terminate any") != -1 && buttonslist.indexOf("TERMINATE") == -1) {
        buttonslist.push("TERMINATE");
      }
      if (specialPermissions.indexOf("restart any") != -1 && buttonslist.indexOf("RESTART") == -1) {
        if (currentUserTaskJSON[0].TaskName.toLowerCase() != workflowTasksJSON[0].TaskName.toLowerCase()) {
          if (currentPendingTasksJSON[0].TaskName.toLowerCase() != workflowTasksJSON[0].TaskName.toLowerCase()) {
            buttonslist.push("RESTART");
          }
        }
      }
      if (specialPermissions.indexOf("delegate any") != -1 && buttonslist.indexOf("DELEGATE") == -1) {
        if (currentUserTaskJSON[0].TaskName.toLowerCase() != workflowTasksJSON[0].TaskName.toLowerCase()) {
          this.isDelegateAny = true;
          buttonslist.push("DELEGATE");
        }
      }

      if (currentUserTaskJSON[0].ActionButtons && buttonslist.indexOf("CLAIM") == -1) {
        NewActionButtons = currentUserTaskJSON[0].ActionButtons
      }
      else {
        NewActionButtons = task.DefaultButtonsJSON;
      }
      return this.generateActionButtonsForApprovalDialog(task.listType, task.taskDetails.WorkflowID, task.FormSettings, NewActionButtons, buttonslist);
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("determineUserActionsForApprovalDialog-Process Form service", "Platform", ex.message, ex.stack, "An error occured while determining user actions for approval dialog", "N/A", this.FormDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called to remove disabled action buttons from list 
   * 
   * @param {any} availableButtons availableaction buttons
   * @returns action buttons after removing disabled buttons
   * @memberof ProcessFormService
   */
  removeDisabledButtons(availableButtons) {
    for (let key in availableButtons) {
      let obj = availableButtons[key];
      if (obj["disabled"]) {
        delete availableButtons[key];
      }
    }
    return availableButtons;
  }

  /**
   * Function called when a user taskes action on the task from action pop up
   * 
   * @param {any} buttonId button id of the action taked
   * @param {any} task task details of the current task
   * @param {any} dialogSent dialog of the current task
   * @memberof ProcessFormService
   */
  userActionForApprovalDialog(buttonId, task, dialogSent) {
    try {
      switch (buttonId) {
        case "PROCEED_WITH_YES":
        case "PROCEED_WITH_NO":
          var outcome = "";
          if (task.CurrentUserTaskJSON[0].ActionButtons != null) {
            outcome = task.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
          }
          else {
            outcome = task.DefaultButtonsJSON[buttonId].outcome;
          }
          var paramsAssesment = {
            processId: task.taskDetails.ProcessID.toString(),
            workflowId: task.taskDetails.WorkflowID.toString(),
            formId: task.taskDetails.FormID.toString(),
            currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
            currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
            buttonId: buttonId,
            outcome: outcome,
            comments: task.userComments,
            delegatedFromEmail: "",
            delegatedToEmail: "",
            delegatedToName: "",
            getCurrentDate: this.formatDate(new Date()),
            workflowTasks: JSON.stringify(task.taskDetails.FormTasks),
            operationType : 'WORKFLOW',
            diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
          };

          this.socket.callWebSocketService('userTaskAction', paramsAssesment).then((result) => {
            if (result == '') {
              dialogSent.close();
            }
            else if (typeof result["message"] != "undefined") {
              let alertDialog = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: result["message"],
                }
              });
              alertDialog.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
            else {
              let alertDialog1 = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: "There was an error performing action. Please contact support.",
                }
              });
              alertDialog1.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
          }).catch((error:any) => {
            this.rapidflowService.ShowErrorMessage("userActionForApprovalDialog-Process Directory component", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while taking pop up action", "RapidflowServices.userTaskAction", '0', true);
          });
          break;
        case "CLAIM":
          var outcome = "";
          outcome = task.DefaultButtonsJSON[buttonId].outcome;

          var paramsAssesment = {
            processId: task.taskDetails.ProcessID.toString(),
            workflowId: task.taskDetails.WorkflowID.toString(),
            formId: task.taskDetails.FormID.toString(),
            currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
            currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
            buttonId: buttonId,
            outcome: outcome,
            comments: task.userComments,
            delegatedFromEmail: "",
            delegatedToEmail: "",
            delegatedToName: "",
            getCurrentDate: this.formatDate(new Date()),
            operationType : 'WORKFLOW',
            workflowTasks: JSON.stringify(task.taskDetails.FormTasks),
            diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
          };

          this.socket.callWebSocketService('userTaskAction', paramsAssesment).then((result) => {
            if (result == '') {
              dialogSent.close();
            }
            else if (typeof result["message"] != "undefined") {
              let alertDialog = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: result["message"],
                }
              });
              alertDialog.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
            else {
              let alertDialog1 = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: "There was an error performing action. Please contact support.",
                }
              });
              alertDialog1.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
          }).catch((error:any) => {
            this.rapidflowService.ShowErrorMessage("userActionForApprovalDialog-Process Directory component", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while taking pop up action", "RapidflowServices.userTaskAction", '0', true);
          });
          break;
        case "TERMINATE":
        case "REJECT":
          var outcome = "";
          if (task.CurrentUserTaskJSON[0].ActionButtons != null) {
            outcome = task.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
          }
          else {
            outcome = task.DefaultButtonsJSON[buttonId].outcome;
          }
          var paramsAssesment = {
            processId: task.taskDetails.ProcessID.toString(),
            workflowId: task.taskDetails.WorkflowID.toString(),
            formId: task.taskDetails.FormID.toString(),
            currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
            currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
            buttonId: buttonId,
            outcome: outcome,
            comments: task.userComments,
            delegatedFromEmail: "",
            delegatedToEmail: "",
            delegatedToName: "",
            operationType : 'WORKFLOW',
            getCurrentDate: this.formatDate(new Date()),
            workflowTasks: JSON.stringify(task.taskDetails.FormTasks),
            diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
          };

          this.socket.callWebSocketService('userTaskAction', paramsAssesment).then((result) => {
            if (result == '') {
              dialogSent.close();
            }
            else if (typeof result["message"] != "undefined") {
              let alertDialog = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: result["message"],
                }
              });
              alertDialog.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
            else {
              let alertDialog1 = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: "There was an error performing action. Please contact support.",
                }
              });
              alertDialog1.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
          }).catch((error:any) => {
            this.rapidflowService.ShowErrorMessage("userActionForApprovalDialog-Process Directory component", "Platfrom", "Error occured while executing api call " + error.message, error.stack, "An error occured while taking pop up action", "RapidflowServices.userTaskAction", '0', true);
          });
          break;

        case "RESTART":
          var outcome = "";
          if (task.CurrentUserTaskJSON[0].ActionButtons != null) {
            outcome = task.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
          }
          else {
            outcome = task.DefaultButtonsJSON[buttonId].outcome;
          }
          var paramsAssesment = {
            processId: task.taskDetails.ProcessID.toString(),
            workflowId: task.taskDetails.WorkflowID.toString(),
            formId: task.taskDetails.FormID.toString(),
            currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
            currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
            buttonId: buttonId,
            outcome: outcome,
            comments: task.userComments,
            delegatedFromEmail: "",
            delegatedToEmail: "",
            delegatedToName: "",
            operationType : 'WORKFLOW',
            getCurrentDate: this.formatDate(new Date()),
            workflowTasks: JSON.stringify(task.taskDetails.FormTasks),
            diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
          };

          this.socket.callWebSocketService('userTaskAction', paramsAssesment).then((result) => {
            if (result == '') {
              dialogSent.close();
            }
            else if (typeof result["message"] != "undefined") {
              let alertDialog = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: result["message"],
                }
              });
              alertDialog.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
            else {
              let alertDialog1 = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: "There was an error performing action. Please contact support.",
                }
              });
              alertDialog1.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
          }).catch((error:any) => {
            this.rapidflowService.ShowErrorMessage("userActionForApprovalDialog-Process Directory component", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while taking pop up action", "RapidflowServices.userTaskAction", '0', true);
          });
          break;

        case "DELEGATE":
          var outcome = "";
          if (task.CurrentUserTaskJSON[0].ActionButtons != null) {
            outcome = task.CurrentUserTaskJSON[0].ActionButtons[buttonId].outcome;
          }
          else {
            outcome = task.DefaultButtonsJSON[buttonId].outcome;
          }
          var paramsAssesmentDelegate = {
            processId: task.taskDetails.ProcessID.toString(),
            workflowId: task.taskDetails.WorkflowID.toString(),
            formId: task.taskDetails.FormID.toString(),
            currentLoggedInUserEmail: this.CurrentLoggedInUser.Email,
            currentLoggedInUserName: this.CurrentLoggedInUser.DisplayName,
            buttonId: buttonId,
            outcome: outcome,
            comments: task.userComments,
            delegatedFromEmail: task.delegateFrom.toLowerCase(),
            delegatedToEmail: task.DelegateDetails[0].Email.toLowerCase(),
            delegatedToName: task.DelegateDetails[0].DisplayName,
            getCurrentDate: this.formatDate(new Date()),
            operationType : 'WORKFLOW',
            workflowTasks: JSON.stringify(task.taskDetails.FormTasks),
            diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
          };

          this.socket.callWebSocketService('userTaskAction', paramsAssesmentDelegate).then((result) => {
            if (result == '') {
              dialogSent.close();
            }
            else if (typeof result["message"] != "undefined") {
              let alertDialog = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: result["message"],
                }
              });
              alertDialog.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
            else {
              let alertDialog1 = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: task.taskDetails.WorkFlowDisplyName,
                  message: "There was an error performing action. Please contact support.",
                }
              });
              alertDialog1.afterClosed().subscribe(result => {
                dialogSent.close();
              });
            }
          }).catch((error:any) => {
            this.rapidflowService.ShowErrorMessage("userActionForApprovalDialog-Process Directory component", "Platfrom", "Error occured while executing socket call " + error.message, error.stack, "An error occured while taking pop up action", "RapidflowServices.userTaskAction", '0', true);
          });
          break;
      }
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("userActionForApprovalDialog-Process Form service", "Platform", ex.message, ex.stack, "An error occured while taking action from approval dialog", "N/A", this.FormDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called to set people picker value when a form is loaded
   * 
   * @param {any} fieldModel field id in the form
   * @param {any} selectionType selection type of the field
   * @param {any} displayName display name for the user
   * @param {any} email email for the user
   * @param {any} formDataJson form data
   * @returns the updated form data
   * @memberof ProcessFormService
   */
  setPeoplePickerOnFormLoad(fieldModel, selectionType, displayName, email, formDataJson) {
    try {
      if (displayName == "" || email == "") {
        displayName = this.CurrentLoggedInUser.ManagerDisplayName;
        email = this.CurrentLoggedInUser.ManagerEmail;
      }

      if (fieldModel != "" && displayName != "" && email != "") {
        if (typeof formDataJson[fieldModel] == "undefined") {
          formDataJson[fieldModel] = []
        }
        if (selectionType.toLowerCase() == "single") {
          if (formDataJson[fieldModel].length == 0) {
            var item = { DisplayName: displayName, Email: email };
            formDataJson[fieldModel].push(item);
          }
          else {
            formDataJson[fieldModel][0].DisplayName = displayName;
            formDataJson[fieldModel][0].Email = email;
          }
        }
        else {
          //multiple here
        }
      }
      return formDataJson;
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("setPeoplePickerOnFormLoad-Process Form service", "Platform", ex.message, ex.stack, "An error occured while setting people picker value on form load", "N/A", this.FormDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called to generate action buttons definition for the current task
   * 
   * @param {any} buttonIDs button ids
   * @param {any} buttonLabels button labels
   * @param {any} buttonOutcomes button outcomes
   * @param {any} buttonConfirmations button confirmations
   * @param {any} buttonHelptexts button helper texts
   * @param {any} buttonClasses button classes web
   * @param {any} buttonAppClasses button classed mobile
   * @param {any} buttonWarningText button warning text
   * @returns the action buttons definitions
   * @memberof ProcessFormService
   */
  generateDynamicActionButtonJSON(buttonIDs, buttonLabels, buttonOutcomes, buttonConfirmations, buttonHelptexts, buttonClasses, buttonAppClasses, buttonWarningText) {
    if (buttonIDs) {
      var ButtonJSON = {}
      buttonIDs = buttonIDs.split(',');
      buttonLabels = buttonLabels.split(',');
      buttonOutcomes = buttonOutcomes.split(',');
      buttonConfirmations = buttonConfirmations.split(',');
      buttonHelptexts = buttonHelptexts.split(',');
      buttonClasses = buttonClasses.split(',');
      buttonAppClasses = buttonAppClasses.split(',');
      buttonWarningText = buttonWarningText.split(',');
      try {
        for (var i = 0; i < buttonIDs.length; i++) {
          var singleButton = {}
          singleButton['label'] = buttonLabels[i];
          singleButton['outcome'] = buttonOutcomes[i];
          singleButton['confirmation'] = buttonConfirmations[i];
          singleButton['tooltip'] = buttonHelptexts[i];
          singleButton['webclass'] = buttonClasses[i];
          singleButton['appclass'] = buttonAppClasses[i];
          singleButton['warningtext'] = buttonWarningText[i];
          ButtonJSON[buttonIDs[i]] = singleButton
        };
      } catch (ex) {
        this.rapidflowService.ShowErrorMessage("generateDynamicActionButtonJSON-Process Form service", "Platform", ex.message, ex.stack, "An error occured while parsing button JSON", "N/A", this.FormDataJSON["ProcessID"], true);
      }

      return ButtonJSON
    } else {
      return null
    }
  }

  /**
   * Function called to render a pending/saved form
   * 
   * @param {any} formDataJson form data
   * @param {any} currentUserTaskJson current logged in user
   * @param {any} repeatingTablesJson repeating table definitions
   * @param {any} workflowTaskJson workflow tasks
   * @param {any} defaultOptions default options for the form
   * @returns the updated form data
   * @memberof ProcessFormService
   */
  renderPendingForm(formDataJson, currentUserTaskJson, repeatingTablesJson, workflowTaskJson, defaultOptions) {
    try {
      let formOptions = formDataJson["FormOptions"];
      // check if the current form is not saved 
      if ((!this.isSavedFormOpen && currentUserTaskJson[0]["TaskName"] != workflowTaskJson[0]["TaskName"]) || (this.isSavedFormOpen && currentUserTaskJson[0]["TaskName"] != workflowTaskJson[0]["TaskName"])) {
        for (let key in formOptions) {
          var obj = formOptions[key];
          obj["readonly"] = true;
          obj["disabled"] = true;
          formOptions[key] = obj;
        }
        for (let key in formOptions) {
          for (let j: number = 0; j < repeatingTablesJson.length; j++) {
            if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
              for (let subKey in formOptions[key]) {
                if (typeof formOptions[key][subKey] == "object") {
                  var subObj = formOptions[key][subKey];
                  subObj["readonly"] = true;
                  subObj["disabled"] = true;
                  formOptions[key][subKey] = subObj;
                }
              }
            }
          }
        }
      }
      // check if a saved form is opened and is deleted
      else if (this.isSavedFormOpen && this.isFormDeleted) {
        for (let key in formOptions) {
          var obj = formOptions[key];
          obj["readonly"] = true;
          obj["disabled"] = true;
          obj["required"] = false;
          formOptions[key] = obj;
        }
        for (let key in formOptions) {
          for (let j: number = 0; j < repeatingTablesJson.length; j++) {
            if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
              for (let subKey in formOptions[key]) {
                if (typeof formOptions[key][subKey] == "object") {
                  var subObj = formOptions[key][subKey];
                  subObj["readonly"] = true;
                  subObj["disabled"] = true;
                  subObj["required"] = false;
                  formOptions[key][subKey] = subObj;
                }
              }
            }
          }
        }
      }
      else {
        formOptions = defaultOptions;
      }

      // check editable fields of the current pending task
      let editableFields: any;
      if (typeof currentUserTaskJson[0]["EditableFields"] != "undefined" && currentUserTaskJson[0]["EditableFields"] != null) {
        editableFields = currentUserTaskJson[0]["EditableFields"].split(";");
        for (let i: number = 0; i < editableFields.length; i++) {
          if (editableFields[i].indexOf(":") != -1) { //repeating table fields
            let repeatingTablesArray = editableFields[i].split(":");
            let repeatingTableName = repeatingTablesArray[0];
            let repeatingTableFields = repeatingTablesArray[1].split("#");
            if (repeatingTableFields[0].toLowerCase() == "all") {
              for (let key in formOptions[repeatingTableName]) {
                if (typeof formOptions[repeatingTableName][key] == "object") {
                  var subObj = formOptions[repeatingTableName][key]
                  subObj["readonly"] = false;
                  subObj["disabled"] = false;
                  formOptions[repeatingTableName][key] = subObj;
                }
                else {
                  switch (key) {
                    case "readonly":
                      formOptions[repeatingTableName][key] = true;
                      break;
                    case "disabled":
                      formOptions[repeatingTableName][key] = true;
                      break;
                    case "visible":
                      formOptions[repeatingTableName][key] = true;
                      break;
                    case "required":
                      formOptions[repeatingTableName][key] = false;
                      break;
                  }
                }
              }
            }
            else {
              for (let j: number = 0; j < repeatingTablesJson.length; j++) {
                if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == repeatingTableName.toLowerCase()) {
                  for (let k: number = 0; k < repeatingTableFields.length; k++) {
                    formOptions[repeatingTableName][repeatingTableFields[k]]["readonly"] = false;
                    formOptions[repeatingTableName][repeatingTableFields[k]]["disabled"] = false;
                  }
                }
              }
            }
          }
          else {
            if (editableFields[i] != "" && editableFields[i] != "null") {
              formOptions[editableFields[i]]["readonly"] = false;
              formOptions[editableFields[i]]["disabled"] = false;
            }
          }
        }
      }

      // check if the current form is completed or not
      if (formDataJson["Status"] == "COMPLETED" || formDataJson["Status"] == "REJECTED" || formDataJson["Status"] == "TERMINATED") {
        for (let key in formOptions) {
          var obj = formOptions[key];
          obj["readonly"] = true;
          obj["disabled"] = true;
          obj["required"] = false;
          formOptions[key] = obj;
        }
        for (let key in formOptions) {
          for (let j: number = 0; j < repeatingTablesJson.length; j++) {
            if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
              for (let subKey in formOptions[key]) {
                if (typeof formOptions[key][subKey] == "object") {
                  var subObj = formOptions[key][subKey];
                  subObj["readonly"] = true;
                  subObj["disabled"] = true;
                  subObj["required"] = false;
                  formOptions[key][subKey] = subObj;
                }
              }
            }
          }
        }
      }
      formDataJson["FormOptions"] = formOptions;
      return formDataJson;
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("renderPendingForm-Process Form service", "Platform", ex.message, ex.stack, "An error occured while rendering pending/saved form", "N/A", formDataJson["ProcessID"], true);
    }
  }

  /**
   * Function called to update form for pdf
   * 
   * @param {any} formDataJson form data
   * @param {any} repeatingTablesJson repeating table definitions
   * @returns the form data for pdf
   * @memberof ProcessFormService
   */
  updateFormForPdf(formDataJson, repeatingTablesJson) {
    try {
      let formOptions = formDataJson["FormOptions"];
      for (let key in formOptions) {
        var obj = formOptions[key];
        obj["readonly"] = true;
        obj["disabled"] = true;
        formOptions[key] = obj;
      }
      for (let key in formOptions) {
        for (let j: number = 0; j < repeatingTablesJson.length; j++) {
          if (repeatingTablesJson[j]["TableSettings"]["name"].toLowerCase() == key.toLowerCase()) {
            for (let subKey in formOptions[key]) {
              if (typeof formOptions[key][subKey] == "object") {
                var subObj = formOptions[key][subKey];
                subObj["readonly"] = true;
                subObj["disabled"] = true;
                formOptions[key][subKey] = subObj;
              }
            }
          }
        }
      }
      formDataJson["FormOptions"] = formOptions;
      return formDataJson;
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("updateFormForPdf-Process Form service", "Platform", ex.message, ex.stack, "An error occured while updating form for pdf", "N/A", formDataJson["ProcessID"], true);
    }
  }

  /**
   * Function called to check form authorization for the current logged in user
   * 
   * @param {any} allJobReaders all job readers
   * @param {any} managerEmail manager email
   * @param {any} initiatorEmail initiator email
   * @param {any} userPermissions user permissions
   * @param {any} workflowId workflow id
   * @param {any} formStatus form status
   * @returns the status of the form
   * @memberof ProcessFormService
   */
  checkFormAuthorization(allJobReaders, managerEmail, initiatorEmail, userPermissions, workflowId, formStatus) {
    //check if user in initiator
    if (initiatorEmail.toLowerCase() == this.CurrentLoggedInUser.Email.toLowerCase()) {
      return true;
    }
    //check if user in manager
    if (managerEmail.toLowerCase() == this.CurrentLoggedInUser.Email.toLowerCase()) {
      return true;
    }

    //if not saved request check current user in all job readers
    if (formStatus != "SAVED") {
      if (allJobReaders.indexOf(this.CurrentLoggedInUser.Email.toLowerCase()) != -1) {
        return true;
      }
    }

    //check if user has view permission on process or workflow
    for (let i = 0; i < userPermissions.length; i++) {
      if (((userPermissions[i]["ItemType"] == "ProcessWorkflow" && userPermissions[i]["ID"] == workflowId) || userPermissions[i]["ItemType"] == "Process")) {
        if (userPermissions[i]["PermissionName"] == "View") {
          return true;
        }

      }
    }
    return false;
  }

  /**
   * Function called to update the form attachment paths for opened form
   * 
   * @param {any} status form status
   * @param {any} formDataJson form data
   * @returns updated form data
   * @memberof ProcessFormService
   */
  updateAttachmentPath(status, formDataJson) {
    switch (status) {
      case "PENDING":
      case "SAVED":
        for (let key in formDataJson) {
          let obj = formDataJson[key];
          if (typeof obj == "object" && obj != null && obj != undefined) {
            if (obj.length > 0) {
              for (var i = 0; i < obj.length; i++) {
                if (obj[i].type == "attachment") {
                  formDataJson["CopySavedFormAttachments"] = true;
                  obj[i].url = obj[i].tempArchievePath;
                }
              }
            }
          }
        }
        break;

      case "COMPLETED":
      case "TERMINATED":
      case "REJECTED":
        for (let key in formDataJson) {
          let obj = formDataJson[key];
          if (typeof obj == "object" && obj != null && obj != undefined) {
            if (obj.length > 0) {
              for (var i = 0; i < obj.length; i++) {
                if (obj[i].type == "attachment") {
                  formDataJson["CopySavedFormAttachments"] = true;
                  obj[i].url = obj[i].completeArchievePath;
                }
              }
            }
          }
        }
        break;
    }
    return formDataJson;
  }

  /**
   * Function called to update all task instructions
   * 
   * @param {any} formDataJson form data
   * @param {any} workflowTasksJson workflow tasks
   * @returns the updated workflow tasks
   * @memberof ProcessFormService
   */
  updateTaskInstructions(formDataJson, workflowTasksJson) {
    let instruction = "";
    for (let i = 0; i < workflowTasksJson.length; i++) {
      instruction = "";
      instruction = workflowTasksJson[i]["TaskInstructions"];
      workflowTasksJson[i]["TaskInstructions"] = this.updateTaskInstructionTemplate(formDataJson, instruction);
    }
    return workflowTasksJson;
  }

  /**
   * Funxtion called to update form attachments path when a saved form is submitted
   * 
   * @param {any} formDataJson form data
   * @returns updated form data
   * @memberof ProcessFormService
   */
  updateAttachmentPathForSavedForm(formDataJson) {
    for (let key in formDataJson) {
      let obj = formDataJson[key];
      if (typeof obj == "object" && obj != null && obj != undefined) {
        if (obj.length > 0) {
          for (var i = 0; i < obj.length; i++) {
            if (obj[i].type == "attachment") {
              obj[i] = this.replaceSavedFormIdInAttachments(obj[i], formDataJson);
            }
          }
          formDataJson[key] = obj;
        }
      }
    }
    return formDataJson;
  }

  /**
   * Function called to replace the saved form id with th new one
   * 
   * @param {any} attachment attachment id
   * @param {any} formDataJson form data
   * @returns updated form data
   * @memberof ProcessFormService
   */
  replaceSavedFormIdInAttachments(attachment, formDataJson) {
    let pendingDownloadPath = "";
    let completedDoenloadPath = "";
    let tempDownloadPath = "";
    let tempPath = attachment.tempArchiveName;
    tempPath = tempPath.replace(formDataJson.SavedFormID, formDataJson.FormID);
    attachment.tempArchiveName = tempPath;

    let encrypt = new EncryptionService();
    tempDownloadPath = encrypt.decryptData(attachment.tempArchievePath.substr(attachment.tempArchievePath.indexOf('fPath=') + 6, attachment.tempArchievePath.length));
    tempDownloadPath = tempDownloadPath.replace(formDataJson.SavedFormID, formDataJson.FormID);
    attachment.tempArchievePath = this.rapidflowService.appServer + '//WCFFileAttachmentService.svc/downloadFile?fPath=' + encrypt.encryptData(tempDownloadPath);
    attachment.url = attachment.tempArchievePath;
    tempDownloadPath = encrypt.decryptData(attachment.completeArchievePath.substr(attachment.completeArchievePath.indexOf('fPath=') + 6, attachment.completeArchievePath.length));
    tempDownloadPath = tempDownloadPath.replace(formDataJson.SavedFormID, formDataJson.FormID);
    attachment.completeArchievePath = this.rapidflowService.appServer + '//WCFFileAttachmentService.svc/downloadFile?fPath=' + encrypt.encryptData(tempDownloadPath);

    return attachment;
  }
}
