/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FormComponent
Description: Provide functionality to render process workflow forms dynamically. User can take action on each form based on permissions.
Location: ./form.component.ts
Author: Sheharyar, Nabil, Amir
Version: 1.0.0
Modification history: none
*/
import { EncryptionService } from './../../services/encryption.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { EventEmiterService } from './../../services/event-emiters.service';
import { AlertDialogComponent } from './../alert-dialog/alert-dialog.component';
import { ProcessDataService } from './../../services/process-data.service';
import { ProgressDialogComponent } from './../progress-dialog/progress-dialog.component';
import { KeysPipe } from './../../pipes/keys.pipe';
import { WorkflowRoutingService } from './../../services/workflow-routing.service';
import { ProcessFormService } from './../../services/process-form.service';
import { ProcessLookupComponent } from './../process-lookup/process-lookup.component';
import { PeoplePickerComponent } from './../people-picker/people-picker.component';
import { DatabaseLookupComponent } from './../database-lookup/database-lookup.component';
import { RepeatingTableComponent } from './../repeating-table/repeating-table.component';
import { FileAttachmentComponent } from './../file-attachment/file-attachment.component';
import { UrlComponent } from './../url/url.component';
import { RapidflowService } from './../../services/rapidflow.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Component, Input, OnInit, AfterViewInit, ViewChild, ComponentFactoryResolver, OnDestroy, ChangeDetectorRef, ViewContainerRef, Compiler, NgModule, ElementRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule, MatCardModule, MatExpansionModule, MatSelectModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser/src/browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'moment';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SocketProvider } from '../../services/socket.service';
import MainFlatModule from '../../main-flat/main-flat.module';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AuthenticateUserDialogComponent } from '../authenticate-user-dialog/authenticate-user-dialog.component';
import { CustomDialogComponent } from './../custom-dialog/custom-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormatOffsetDatePipe } from '../../pipes/format-offset-date.pipe';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})


export class FormComponent implements OnInit {
  @ViewChild('createNew', { read: ViewContainerRef }) container: ViewContainerRef;
  @ViewChild('createNew') el: ElementRef;

  public processId: any; // Global variable of the class to store the process id of the current workflow
  public workflowId: any; // Global variable of the class to store the workflow id of the current workflow
  public formId: any; // Global variable of the class to store the form id of the current workflow
  public formObjects: any; // Global variable of the class to store the form objects for the current workflow
  public actualFormId: any; // Global variable of the class to store the actual form id for the current workflow
  public CurrentLoggedInUser: any; // Global variable of the class to store the current logged in user
  public newform: boolean // Global flag to check if a new form is opened or not
  public NavArray: any; // Global variable of the class to store the navigation array for the current view
  public previousURL: any // Global variable of the class to store the previous url for the current view
  public Status: string; // Global variable of the class to store the form status
  public Reference: string; // Global variable of the class to store the refrence number of the current form
  public PDFURL: string; // Global variable of the class to store the pdf download path for the current workflow
  public workflows: any; // Global variable of the class to store the workflow objects
  public paramSubscription:any; // Global variable of the class for subscription

  /**
   * Creates an instance of FormComponent.
   * @param {RapidflowService} RapidflowService 
   * @param {ActivatedRoute} route 
   * @param {ChangeDetectorRef} cdRef 
   * @param {Compiler} compiler 
   * @param {ProcessDataService} ProcessDataService 
   * @param {ProcessFormService} processFormService 
   * @param {MatDialog} dialog 
   * @param {Router} router 
   * @param {EventEmiterService} EventEmiterService 
   * @param {MatDialog} notAuthorizedDialog 
   * @memberof FormComponent
   */
  constructor(private RapidflowService: RapidflowService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private compiler: Compiler,
    private ProcessDataService: ProcessDataService,
    private processFormService: ProcessFormService,
    public dialog: MatDialog, private router: Router, private EventEmiterService: EventEmiterService, private notAuthorizedDialog: MatDialog,
    private invalidFormDialog: MatDialog) {
    this.previousURL = ""
    this.PDFURL = ""
    this.Reference = ""
    this.Status = "INITIATION"
    this.newform = false
    this.paramSubscription = this.route.parent.paramMap // Get process id for the current workflow form 
      .subscribe((params: ParamMap) => {
        this.processId = params.get('ProcessID');
        this.ProcessDataService.setUserPermissions(this.processId);
        this.NavArray = [{ urlBack: ['main', 'process', this.processId, 'home', 'forms'], urlImage: ['main', 'process', this.processId, 'home', 'forms'], imagesrc: 'assets//images//process_menu//Create_Selected.png', text: '' }]
      });
    this.route.paramMap // Get workflow Id for the current workflow form
      .subscribe((params: ParamMap) => {
        this.workflowId = params.get('WorkflowID');
        this.actualFormId = params.get('FormID');
        if (this.actualFormId == "new") {
          this.newform = false
        } else {
          this.newform = false
        }
        var interval = setInterval(() => {
          if (this.ProcessDataService.workflows != undefined) {
            this.workflows = this.ProcessDataService.workflows
            if (this.workflows.length > 0) {
              for (var i = 0; i < this.workflows.length; i++) {
                if (this.workflows[i].WorkflowID == this.workflowId) {
                  this.NavArray[0].text = this.workflows[i].WorkflowDisplayName
                }
              }
            } else {
            }
            clearInterval(interval)
          }
        }, 1000)
      });

  }

  /**
   * Function called to download the form PDF
   * 
   * @memberof FormComponent
   */
  downloadPDF() {
    if (this.PDFURL != "") {
      window.location.href = this.PDFURL
    }
  }

  /**
   * Function called to navigate the user back to the previous view
   * 
   * @memberof FormComponent
   */
  goBack() {
    if (typeof window.localStorage["srcPath"] != "undefined") {
      if (window.localStorage["srcPath"] == "submissions") {
        this.router.navigate(['main', 'process', this.processId, 'home', 'submissions']);
      }
      else if (window.localStorage["srcPath"] == "notifications") {
        this.router.navigate(['main', 'process', this.processId, 'home', 'notifications']);
      }
      else {
        this.router.navigate(['main', 'process', this.processId, 'home', 'tasks']);
      }
    }
    else {
      this.router.navigate(['main', 'process', this.processId, 'home', 'tasks']);
    }
  }

  /**
   * Function called to share the current workflow form
   * 
   * @memberof FormComponent
   */
  shareForm() {
    var formUrl=window.location.origin + window.location.pathname + '#/sharedurl/?route=form&processID=' + this.processId + '&workflowID=' + this.workflowId + '&formID=' + this.actualFormId
    var body = 'Form link : ' + formUrl
    var mailtovairable = "mailto:user@example.com?subject=Sharing " + this.formObjects.ProcessSettingsJSON.PROCESS_NAME + ", Form: " + this.formObjects.WorkflowSettingsJSON[0].Form_Header.FormTitle + " link&body=" + encodeURIComponent(body);
    this.copyTextToClipboard(formUrl);
    window.location.href = mailtovairable
  }

  /**
   * copies text passed as parameter to clipboard
   * @param text 
   */
  copyTextToClipboard(text) {
    let textArea:any = document.createElement("textarea");  
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      
    } catch (err) {
      
    }
    document.body.removeChild(textArea);
  }
  /**
   * Function triggered when the observale is called
   * 
   * @param {any} message message from observable
   * @memberof FormComponent
   */
  checkmessage(message) {
    if (message["Type"] == "FormHeaderObjects") {
      for (var property in message["Value"]) {
        if (message["Value"].hasOwnProperty('Reference')) {
          this.Reference = message["Value"]['Reference']
        }
        if (message["Value"].hasOwnProperty('PdfUrl')) {
          this.PDFURL = message["Value"]['PdfUrl']
        }
        if (message["Value"].hasOwnProperty('Status')) {
          this.Status = message["Value"]['Status']
        }
      }

    }
  }

  /**
   * Triggered when the form component is called
   * 
   * @memberof FormComponent
   */
  ngOnInit() {
    this.EventEmiterService.currentMessage.subscribe(message => this.checkmessage(message))
    this.renderForm();

  }

  /**
   * Function called to add a dynamic component for the current workflow form
   * 
   * @param {string} formTemplate form HTML from server
   * @param {string} formComponent form logic from server
   * @returns 
   * @memberof FormComponent
   */
  addComponent(formTemplate: string, formComponent: string) {
    try {
      @Component({
        template: formTemplate
      })
      class TemplateComponent {
        public formId: any; // Global variable of the class to store the form id for the current workflow form
        public formObjects: any; // Global variable of the class to store the form objects for the current workflow form
        public actualFormId: any; // Global variable of the class to store the actual form id
        public commentsRequired: boolean; // Global flag to check if the comments are required for the current workflow or not
        public copyInitiatorOnTaskNotifications: boolean; // Global flag of the class to check if the initiator is being copied in emails or not
        public FormDataJSON: object; // Global variable of the class to store the form data for the current workflow
        public CurrentUserTaskJSON = []; // Global variable of the class to store the current user task from the current pending task for the current workflow  
        public CurrentPendingTasksJSON = []; // Global variable of the class to store the current pending task from the current workflow task for the current worklfow
        public CurrentLoggedInUser = []; // Global variable of the class to store the current logged in user 
        public ProcessSettingsJSON = []; // Global variable of the class to store the latest workflow tasks for the current workflow
        public WorkflowTasksJSON: any[]; // Global variable of the class to store the workflow tasks for the current workflow
        public RepeatingTableJSON: any[]; // Global variable of the class to store the repeating table definitions for the current workflow
        public LookupJSON: any[]; // Global variable of the class to store the lookup definitions for the current workflow form
        public WorkflowSettingJSON = [] // Global variable of the class to store the workflow settings
        public FormOptionsJSON = [] // Global variable of the class to store the form options 
        private DelegateActionButton: any; // Global variable of the class to store the delegate action button for the current user
        public showDelegateButton = false; // Global flag of the class to check if the delegate button is visible to the user or not
        public showDelegateSection: boolean; // Global flag of the class to check if the delegate section is visible to the user or not
        public multipleAssignee: boolean; // Global flag of the class to check if the task is being assigned to multiple people or not
        private DelegateDetails: any[]; // Global variable of the class to store the delegate to details for the current task
        public DelegateOptions: any; // Global variable of the class to store the delegate button options
        public delegateFrom: any; // Global variable of the class to store whose task is being delegated
        public allowAccess = false; // Global flag of the class to check if the current user has access or not
        public showPermissionNote = false; // Global flag of the class to check if the current user has permissions or not
        public allOtherUsers = false; // Global flag of the class to check if the form is opened by any other user or not
        public isFormLoading: boolean; // Global flag of the class to check if the form is loading or not
        public shareFormOption: boolean; // Global flag of the class to check if the form can be shared or not
        public showDownloadIcon: boolean; // Global flag of the class to check if the download icon will be visible or not
        public showCreateNewText: boolean; // Global flag of the class to check if the create new text is visible or not
        public currentStatusValue = ''; // Global variable of the class to store the cuurent status of the form
        public ActionButtons: any[]; // Global variable of the class to store the available action buttons for the user
        public taskInstructions: string; // Global variable of the class to store the task instructions for the current pending task
        public isFormDeleted: boolean; // Global flag of the class to check if the form is deleted or not
        public workflowVersion: number; // Global variable of the class to store the workflow version of the current workflow
        public alertUserForFormDeletion: boolean; // Global flag of the class to check if the user needs to be informed for older version of form or not
        public closed: boolean; // Global flag of the class to check if the form is closed or not
        public navigationFlag: Subscription; // Global variable of the class to store the naviagtion of the form
        public currentAction: any; // Global variable of the class to store the current action taken by user
        public currentPendingTask: any; // Global variable of the class to store the current pending task name
        public showRouting: boolean; // Global flag of the class to check if the routing is visible to the user or not
        public isDelegateAny: boolean; // Global flag of the class to check if the user has delegate any permissions or not
        public validRepeatingTables: boolean; // Global flag of the class to check if the repeating tables are valid or not
        public UserComments: string; // Global variable of the class to store the user comments entered by the user
        public processOffset: any; // Global variable of the class to store the process off set for the current workflow
        public actionPanelVisible: boolean; // Global flag of the class to check if the action panel is visible to the user or not
        public postWorkflowActionsCalled: boolean = false; // Global flag of the class to check if the post workflow tasks have been called or not
        public workflowAssesmentFlag: boolean = true; // Global flag of the class to check if the workflow assesment needs to be called or not
        public performActionNowFlag: boolean;
        public dialogRef2: MatDialogRef<ProgressDialogComponent>;
        public customDialogRef: MatDialogRef<CustomDialogComponent>;
        public customProgressDialogRef: MatDialogRef<ProgressDialogComponent>;
        /**
         * Creates an instance of TemplateComponent.
         * @param {FormComponent} a 
         * @param {WorkflowRoutingService} workflowRoutingService 
         * @param {ProcessFormService} processFormService 
         * @param {RapidflowService} rapidflowService 
         * @param {MatDialog} dialog 
         * @param {Router} router 
         * @param {EventEmiterService} EventEmiterService 
         * @param {NgZone} ngZone 
         * @param {SocketProvider} socket 
         * @param {MatDialog} notAllowedDialog 
         * @memberof TemplateComponent
         */
        constructor(private a: FormComponent,
          private workflowRoutingService: WorkflowRoutingService,
          private processFormService: ProcessFormService,
          private rapidflowService: RapidflowService,
          private dialog: MatDialog, public router: Router,
          private EventEmiterService: EventEmiterService,
          private ngZone: NgZone,
          private socket: SocketProvider,
          private notAllowedDialog: MatDialog
        ) {
          this.commentsRequired = false;
          this.isFormLoading = true;
          this.shareFormOption = true;
          this.showDownloadIcon = true;
          this.showCreateNewText = false;
          this.copyInitiatorOnTaskNotifications = true;
          this.actualFormId = a.actualFormId;
          this.ActionButtons = [];
          this.taskInstructions = "";
          this.CurrentLoggedInUser = a.CurrentLoggedInUser;
          this.isFormDeleted = false;
          this.DelegateDetails = [];
          this.DelegateActionButton = {};
          this.showDelegateSection = false;
          this.showDelegateButton = false;
          this.multipleAssignee = false;
          this.alertUserForFormDeletion = false;
          this.closed = false
          this.showRouting = true;
          this.DelegateOptions = {};
          this.workflowVersion = 1;
          this.DelegateOptions = {
            "defaultValue": "",
            "readonly": false,
            "disabled": false,
            "required": false,
            "visible": true,
            "validationText": "Field cannot be blank"
          };
          this.currentPendingTask = "";
          this.currentAction = "";
          this.isDelegateAny = false;
          this.delegateFrom = "";
          this.validRepeatingTables = false;
          this.UserComments = "";
          this.processOffset = "";
          this.actionPanelVisible = false;

          this.navigationFlag = this.socket.navToNotification$ // Handle post workflow operations and navigation 
            .subscribe((response: any) => {
              if (response && !this.postWorkflowActionsCalled) {
                this.handlePostWorkflow();
              }
            });
        }

        /**
         * Triggered when template component is called
         * 
         * @memberof TemplateComponent
         */
        ngOnInit() {
          this.ActionButtons = [];
          this.renderForm();
        }

        /**
         * Function called to handle the post workflow task operations for the current workflow
         * 
         * @memberof TemplateComponent
         */
        handlePostWorkflow() {
          if (this.currentAction != "") {
            this.postWorkflowActionsCalled = true;
          }
          switch (this.currentAction) {
            case "SUBMIT":
              this.performPostWorkflowTaskOperations(this.FormDataJSON["Status"], this.currentPendingTask, this.currentAction).then(response => {
                if (response) {
                  if (this.FormDataJSON["Status"] == "SAVED") {
                    let dialogRef5 = this.dialog.open(AlertDialogComponent, {
                      data: {
                        title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                        message: "The worklfow is not registered in production. Form has been saved successfully. Please contact support for details.",
                      }
                    });
                    dialogRef5.afterClosed().subscribe(result => {
                      this.dialog.closeAll();
                      this.RefereshProcess();
                      this.router.navigate(['main', 'process', this.a.processId, 'home', 'tasks']);
                    });
                  }
                  else {
                    let dialogRef1 = this.dialog.open(AlertDialogComponent, {
                      data: {
                        title: "Task Completed",
                        message: "Form has been submitted successfully and assigned reference number - " + this.FormDataJSON["Reference"],
                      }
                    });
                    dialogRef1.afterClosed().subscribe(result => {
                      this.dialog.closeAll();
                      this.RefereshProcess();
                      this.router.navigate(['main', 'process', this.a.processId, 'home', 'tasks']);
                    });
                  }
                } else {
                  this.dialog.closeAll();
                }
              });
              break;

            case "SAVE":
              let dialogRef1 = this.dialog.open(AlertDialogComponent, {
                data: {
                  title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                  message: "Form has been saved successfully.",
                }
              });
              dialogRef1.afterClosed().subscribe(result => {
                this.dialog.closeAll();
                this.RefereshProcess();
                this.router.navigate(['main', 'process', this.a.processId, 'home', 'tasks']);
              });
              break;

            case "PROCEED_WITH_YES":
            case "PROCEED_WITH_NO":
            case "RESUBMIT":
            case "REJECT":
            case "TERMINATE":
            case "RESTART":
            case "DELEGATE":
            case "CLAIM":
              this.performPostWorkflowTaskOperations(this.FormDataJSON["Status"], this.currentPendingTask, this.currentAction).then(response => {
                if (response) {
                  setTimeout(() => {
                    this.RefereshProcess();
                    this.dialog.closeAll();
                    this.router.navigate(['main', 'process', this.a.processId, 'home', 'tasks']);
                  }, 2000);
                } else {
                  this.dialog.closeAll();
                }
              });
              break;
          }
        }

        /**
         * Function called to set the task date format as per our standards
         * 
         * @param {any} dateStringISO date in string
         * @returns formatted date
         * @memberof TemplateComponent
         */
        setTaskDateFormat(dateStringISO) {
          if (dateStringISO == "" || dateStringISO == undefined) {
            return "";
          }
          return moment.utc(dateStringISO).format("DD-MMM-YYYY hh:mm A")
        }

        /**
         * Function called when a for is being rendered
         * 
         * @memberof TemplateComponent
         */
        renderForm() {
          try {
            this.processFormService.setUserPermissions(this.a.ProcessDataService.userPermissions);
            this.processFormService.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
            this.workflowRoutingService.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
            this.processFormService.initializeObjects();
            // check if the current form is new
            if (this.actualFormId.toLowerCase() == "new") {
              this.WorkflowSettingJSON = this.a.formObjects.WorkflowSettingsJSON;
              this.ProcessSettingsJSON = this.a.formObjects.ProcessSettingsJSON;
              this.processOffset = this.ProcessSettingsJSON["PROCESS_TIMEZONE"];
              this.FormOptionsJSON = this.a.formObjects.FormOptionsJSON;
              this.workflowVersion = this.a.formObjects.Version;
              // Get form data for the current workflow
              this.FormDataJSON = this.getFormData(this.a.processId, this.a.workflowId, this.ProcessSettingsJSON, this.WorkflowSettingJSON, this.FormOptionsJSON, this.workflowVersion);
              this.WorkflowTasksJSON = this.a.formObjects.WorkflowTasksJSON;
              // Set workflow routing for the current workflow 
              this.workflowRoutingService.setWorkflowRouting(this.WorkflowTasksJSON, this.WorkflowTasksJSON, this.a.processId);
              this.WorkflowTasksJSON = this.getProcessTasksFromServer("INITIATING");
              this.RepeatingTableJSON = this.a.formObjects.RepeatingTableJSON;
              // update repeating table status
              this.FormDataJSON = this.updateInvalidRepeatingTables(this.FormDataJSON, this.FormDataJSON["FormOptions"], this.RepeatingTableJSON);

              // check if repeating tables are valid or not
              if (this.FormDataJSON["InvalidRepeatingTables"] != undefined) {
                if (this.FormDataJSON["InvalidRepeatingTables"].length > 0) {
                  this.validRepeatingTables = false;
                }
                else {
                  this.validRepeatingTables = true;
                }
              }

              this.LookupJSON = this.a.formObjects.LookupJSON;
              if (this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY != undefined) {
                this.showRouting = this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY;
              }
              let NewActionButtons = {};

              if (this.WorkflowTasksJSON[0].ActionButtons) {
                NewActionButtons = this.WorkflowTasksJSON[0].ActionButtons;
              } else {
                NewActionButtons = this.WorkflowSettingJSON[0].DefaultButtons;
                this.WorkflowTasksJSON[0].ActionButtons = this.WorkflowSettingJSON[0].DefaultButtons;
              }

              let buttonslist = ["SUBMIT", "SAVE", "CLOSE", "RESET"];
              this.taskInstructions = "";
              this.taskInstructions = this.WorkflowTasksJSON[0].TaskInstructions;
              this.ActionButtons = [];
              // generate action buttons for user
              this.ActionButtons = this.generateActionButtons(this.a.processId, this.a.workflowId, this.WorkflowSettingJSON, NewActionButtons, buttonslist);
              for (let key in this.ActionButtons) {
                this.actionPanelVisible = true;
                break;
              }
              this.currentPendingTask = this.WorkflowTasksJSON[0].TaskName;
              var CountObject = { "Type": "FormHeaderObjects", Value: { "Reference": this.FormDataJSON['Reference'], "PdfUrl": '', "Status": this.FormDataJSON['Status'] } }
              this.EventEmiterService.changeMessage(CountObject)
            }
            // else the current form is pending/saved
            else {
              this.WorkflowSettingJSON = this.a.formObjects.WorkflowSettingsJSON;
              this.ProcessSettingsJSON = this.a.formObjects.ProcessSettingsJSON;
              this.processOffset = this.ProcessSettingsJSON["PROCESS_TIMEZONE"];
              this.FormDataJSON = this.a.formObjects.FormData;
              this.WorkflowTasksJSON = this.a.formObjects.FormTasks;
              // set workflow routing
              this.workflowRoutingService.setWorkflowRouting(this.WorkflowTasksJSON, this.a.formObjects.WorkflowTasksJSON, this.a.processId);
              this.RepeatingTableJSON = [];
              this.RepeatingTableJSON = this.a.formObjects.RepeatingTableJSON;
              this.LookupJSON = [];
              this.LookupJSON = this.a.formObjects.LookupJSON;
              // get pending tasks
              this.CurrentPendingTasksJSON = this.getPendingTasksJSON(this.WorkflowTasksJSON);
              // get current user task
              this.CurrentUserTaskJSON = this.getCurrentUserTaskJSON(this.CurrentPendingTasksJSON);
              this.taskInstructions = "";
              // chech if the form is at initiator review
              if (this.CurrentPendingTasksJSON.length > 0) {
                if (this.FormDataJSON["Status"] == "PENDING" && this.CurrentPendingTasksJSON[0]["TaskName"].toLowerCase() == this.WorkflowTasksJSON[0]["TaskName"].toLowerCase() && this.CurrentPendingTasksJSON[0]["IsDelegated"] == false) {
                  this.WorkflowTasksJSON = this.getProcessTasksFromServer("PENDING");
                }
                this.taskInstructions = this.CurrentPendingTasksJSON[0].TaskInstructions;
                this.currentPendingTask = this.CurrentPendingTasksJSON[0].TaskName;
              }

              if (this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY != undefined) {
                this.showRouting = this.WorkflowSettingJSON[0].Form_Settings.FORM_WORKFLOW_ROUTING_DISPLAY;
              }
              this.ActionButtons = [];
              this.DelegateActionButton = {};
              // set id form deleted or not
              this.processFormService.setIsFormDeleted(this.a.formObjects.DeletedOn);
              this.isFormDeleted = this.processFormService.getIsFormDeleted();
              // generate action buttons for the current user
              this.ActionButtons = this.determineUserActions(this.WorkflowTasksJSON, this.CurrentPendingTasksJSON, this.CurrentUserTaskJSON, this.FormDataJSON, this.WorkflowSettingJSON[0].DefaultButtons, this.WorkflowSettingJSON[0].Form_Settings);

              this.isDelegateAny = this.processFormService.getIsDelegateAny()

              if (this.CurrentPendingTasksJSON.length > 1) {
                this.multipleAssignee = true;
                if (!this.isDelegateAny) {
                  this.delegateFrom = this.CurrentUserTaskJSON[0].AssignedToEmail;
                }
              }
              else if (this.CurrentPendingTasksJSON.length == 1) {
                this.multipleAssignee = false;
                this.delegateFrom = this.CurrentPendingTasksJSON[0].AssignedToEmail;
              }

              // check the current task is delegated or not
              let delegatedTasks = this.checkIsDelegatedTask(this.CurrentPendingTasksJSON);
              for (let i = 0; i < delegatedTasks.length; i++) {
                if (this.CurrentPendingTasksJSON.length == 1) {
                }
                else if (this.CurrentPendingTasksJSON.length > 1) {
                  this.CurrentPendingTasksJSON.splice(delegatedTasks[i], 1);
                }
              }

              if (!this.CurrentUserTaskJSON[0].IsDelegated || this.isDelegateAny) {
                for (let key in this.ActionButtons) {
                  this.actionPanelVisible = true;
                  let obj = this.ActionButtons[key];
                  if (key.toLowerCase() == "delegate") {
                    this.showDelegateSection = true;
                    this.showDelegateButton = false;
                    this.DelegateActionButton[key] = obj;
                    delete this.ActionButtons[key];
                  }
                }
              }
              else {
                for (let key in this.ActionButtons) {
                  this.actionPanelVisible = true;
                  let obj = this.ActionButtons[key];
                  if (key.toLowerCase() == "delegate") {
                    this.showDelegateSection = false;
                    this.showDelegateButton = false;
                    delete this.ActionButtons[key];
                  }
                }
              }

              // render form as per form status
              this.FormDataJSON = this.renderPendingForm(this.FormDataJSON, this.CurrentUserTaskJSON, this.RepeatingTableJSON, this.WorkflowTasksJSON, this.a.formObjects.DefaultValuesJSON);
              if (this.FormDataJSON["InvalidRepeatingTables"] != undefined) {
                if (this.FormDataJSON["InvalidRepeatingTables"].length > 0) {
                  this.validRepeatingTables = false;
                }
                else {
                  this.validRepeatingTables = true;
                }
              }

              //check for new versions
              if (parseInt(this.FormDataJSON["WorkflowVersion"]) < parseInt(this.a.formObjects.LatestVersion) && this.FormDataJSON["Status"] == "SAVED") {
                this.alertUserForFormDeletion = true;
                delete this.ActionButtons["SUBMIT"];
                if (this.isFormDeleted) {
                  this.alertUserForFormDeletion = false;
                  delete this.ActionButtons["RESTORE"];
                }
              }
              let encryptionService = new EncryptionService();
              var CountObject = { "Type": "FormHeaderObjects", Value: { "Reference": this.FormDataJSON['Reference'], "PdfUrl": this.rapidflowService.appServer + "/WCFFileAttachmentService.svc/downloadFile?fPath=" + encryptionService.encryptData(this.FormDataJSON["ArchivePath"] + "\\" + this.FormDataJSON["ProcessID"] + "\\" + this.FormDataJSON["WorkflowID"] + "\\" + this.FormDataJSON["FormID"] + "\\" + this.FormDataJSON["Reference"] + ".pdf"), "Status": this.FormDataJSON['Status'] } }
              this.EventEmiterService.changeMessage(CountObject)
            }

            this.performFormLoadOperations();
            this.FormDataJSON = this.updateAttachmentPath(this.FormDataJSON["Status"], this.FormDataJSON);
          } catch (ex) {

            this.a.RapidflowService.ShowErrorMessage("renderForm- FormSub Component", "Platform", ex.message, ex.stack, "An error occured while rendering form", "N/A", this.a.processId, true);
          }
        }

        /**
         * Function called to refresh the current processess
         * 
         * @memberof TemplateComponent
         */
        RefereshProcess() {
          let countRefreshObject = { "Type": "AllCounts", Value: { "Counts": "true" } }
          this.EventEmiterService.changeMessage(countRefreshObject);
        }

        /**
         * Function called when the user takes action on the form
         * 
         * @param {any} buttonId button id for the current action
         * @param {any} button button details for the current action
         * @param {any} processForm process form
         * @memberof TemplateComponent
         */
        userAction(buttonId, button, processForm) {
          try {
            this.currentAction = buttonId;
            let currentPendingTaskName = "";
            if (this.CurrentPendingTasksJSON.length < 1) {
              currentPendingTaskName = this.WorkflowTasksJSON[0]["TaskName"];
            }
            else {
              currentPendingTaskName = this.CurrentPendingTasksJSON[0]["TaskName"];
            }

            switch (buttonId) {
              case "SUBMIT":
              case "CLAIM":
              case "PROCEED_WITH_YES":
              case "PROCEED_WITH_NO":
              case "RESUBMIT":
              case "REJECT":
              case "TERMINATE":
              case "RESTART":
              case "DELEGATE":
              case "SAVE":
                if (buttonId == "DELEGATE") {
                  if (this.delegateFrom == "") {
                    let dialogRefDelegate1 = this.notAllowedDialog.open(AlertDialogComponent, {
                      data: {
                        title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                        message: "Please select an assignee whose task you want to delegate.",
                      }
                    });
                    dialogRefDelegate1.afterClosed().subscribe(result => {

                    });
                  }
                  else if (this.DelegateDetails.length == 0) {
                    let dialogRefDelegate2 = this.notAllowedDialog.open(AlertDialogComponent, {
                      data: {
                        title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                        message: "Please select an assignee for task delegation.",
                      }
                    });
                    dialogRefDelegate2.afterClosed().subscribe(result => {

                    });
                  }
                  else if (this.delegateFrom.toLowerCase() == this.DelegateDetails[0].Email.toLowerCase()) {
                    let dialogRefDelegate = this.notAllowedDialog.open(AlertDialogComponent, {
                      data: {
                        title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                        message: "Please select another user as the task is already pending with the selected assignee.",
                      }
                    });
                    dialogRefDelegate.afterClosed().subscribe(result => {

                    });
                  }
                  else {
                    this.userActionWithPreWorkflowTasks(buttonId, button, currentPendingTaskName);
                  }
                }
                else {
                  this.userActionWithPreWorkflowTasks(buttonId, button, currentPendingTaskName);
                }
                break;

              case "DELETE":
              case "RESTORE":
                this.promptUserBeforeAction(buttonId, button, currentPendingTaskName);
                break;
            }
          }
          catch (ex) {
            this.a.RapidflowService.ShowErrorMessage("useraction- FormSub Component", "Platform", ex.message, ex.stack, "An error occured while taking user action", "N/A", this.a.processId, true);
          }
        }

        /**
         * Function called when the user action is allowed
         * 
         * @param {any} buttonId button id for the current action
         * @param {any} button button details for the current action
         * 
         * @memberof TemplateComponent
         */
        performActionNow(buttonId, button) {
          try {
            if (button.confirmation.toLowerCase() == "none") {
              this.performWorkflowAssesment(buttonId);
            }
            else if (button.confirmation.toLowerCase() == "warn") {
              let dialogRef: MatDialogRef<ConfirmationDialogComponent>;;
              dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                  message: (button.confirmation.warningtext) ? (button.confirmation.warningtext) : 'Are you sure you want to continue?',
                }
              });
              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  this.performWorkflowAssesment(buttonId);
                }
              });
            }
            else if (button.confirmation.toLowerCase() == "authenticate") {
              let dialogRefAuth: MatDialogRef<AuthenticateUserDialogComponent>;;
              dialogRefAuth = this.dialog.open(AuthenticateUserDialogComponent, {
                data: {
                  title: "Re-Authentication Required",
                  currentUserName: this.CurrentLoggedInUser["LoginID"],
                  currentUserLoginId: this.CurrentLoggedInUser["LoginID"]
                },
                width: "20%"
              });
              dialogRefAuth.afterClosed().subscribe(result => {
                if (result) {
                  this.performWorkflowAssesment(buttonId);
                }
              });
            }
          } catch (ex) {
            this.a.RapidflowService.ShowErrorMessage("userAction-FormSub Component", "Platform", ex.message, ex.stack, "An error occured while performing action", "N/A", this.a.processId, true);

          }
        }

        /**
         * Function called to prompt user before action in case of no preworkflow tasks operations
         * 
         * @param {any} buttonId 
         * @param {any} button 
         * @param {any} currentPendingTaskName 
         * @memberof TemplateComponent
         */
        promptUserBeforeAction(buttonId, button, currentPendingTaskName) {
          try {
            if (button.confirmation.toLowerCase() == "none") {
              this.userActionWithoutPreWorkflowTasks(buttonId, button, currentPendingTaskName);
            }
            else if (button.confirmation.toLowerCase() == "warn") {
              let dialogRef: MatDialogRef<ConfirmationDialogComponent>;;
              dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                data: {
                  title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                  message: (button.confirmation.warningtext) ? (button.confirmation.warningtext) : 'Are you sure you want to continue?',
                }
              });
              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  this.userActionWithoutPreWorkflowTasks(buttonId, button, currentPendingTaskName);
                }
              });
            }
            else if (button.confirmation.toLowerCase() == "authenticate") {
              let dialogRefAuth: MatDialogRef<AuthenticateUserDialogComponent>;;
              dialogRefAuth = this.dialog.open(AuthenticateUserDialogComponent, {
                data: {
                  title: "Re-Authentication Required",
                  currentUserName: this.CurrentLoggedInUser["LoginID"],
                  currentUserLoginId: this.CurrentLoggedInUser["LoginID"]
                },
                width: "20%"
              });
              dialogRefAuth.afterClosed().subscribe(result => {
                if (result) {
                  this.userActionWithoutPreWorkflowTasks(buttonId, button, currentPendingTaskName);
                }
              });
            }
          } catch (ex) {
            this.a.RapidflowService.ShowErrorMessage("userAction-FormSub Component", "Platform", ex.message, ex.stack, "An error occured while performing action", "N/A", this.a.processId, true);

          }
        }

        /**
         * Function called to perform preworkflow tasks before performing action 
         * 
         * @param {any} buttonID button id of the current task
         * @param {any} currentPendingTaskName current pending task name
         * @param {any} popupRef pop up
         * @memberof TemplateComponent
         */
        userActionWithPreWorkflowTasks(buttonID, button, currentPendingTaskName) {
          if (this.checkWorkflowTaskJson()) {
            this.WorkflowTasksJSON = this.updateTaskInstructions(this.FormDataJSON, this.WorkflowTasksJSON);
            this.performPreWorkflowTaskOperations(this.FormDataJSON["Status"], currentPendingTaskName, buttonID).then(response => {
              if (response) {
                this.performActionNow(buttonID, button);
              }
              else {
                this.dialogRef2.close(true);
              }
            });
          }
          else {
            let alertDialog = this.dialog.open(AlertDialogComponent, {
              data: {
                title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                message: "Workflow routing is not valid. Please contact process administrator.",
              }
            });
            alertDialog.afterClosed().subscribe(result => {
              this.dialog.closeAll();
            });
          }
        }

        /**
         * Function called when preworkflow task operations are not required
         * 
         * @param {any} buttonID button id of the current task
         * @param {any} currentPendingTaskName current pending task name
         * @param {any} popupRef pop up
         * @memberof TemplateComponent
         */
        userActionWithoutPreWorkflowTasks(buttonID, button, currentPendingTaskName) {
          this.dialogRef2 = this.dialog.open(ProgressDialogComponent, {
            data: {
              message: "Processing task ...",
            },
            disableClose: true
          });
          this.dialogRef2.afterClosed().subscribe(result => {
            this.dialog.closeAll();
          });
          this.processFormService.performWorkflowAssesment(buttonID, this).then(tempFormComponent => {
            if (tempFormComponent.FormDataJSON["Status"] == "COMPLETED" || tempFormComponent.FormDataJSON["Status"] == "TERMINATED" || tempFormComponent.FormDataJSON["Status"] == "REJECTED") {
              tempFormComponent.FormDataJSON["DateCompleted"] = this.processFormService.formatDate(new Date());
            }
            switch (buttonID) {
              case "DELETE":
              case "RESTORE":
                this.dialogRef2.close(true);
                if (typeof window.localStorage["srcPath"] != "undefined") {
                  if (window.localStorage["srcPath"] == "submissions") {
                    this.router.navigate(['main', 'process', this.a.processId, 'home', 'submissions']);
                  }
                  else if (window.localStorage["srcPath"] == "notifications") {
                    this.router.navigate(['main', 'process', this.a.processId, 'home', 'notifications']);
                  }
                  else {
                    this.router.navigate(['main', 'process', this.a.processId, 'home', 'tasks']);
                  }
                }
                else {
                  this.router.navigate(['main', 'process', this.a.processId, 'home', 'tasks']);
                }
                break;
            }
          });
        }

        /**
         * Function called to perform workflow assesment
         * 
         * @param {any} buttonID 
         * @memberof TemplateComponent
         */
        performWorkflowAssesment(buttonID) {
          try {
            this.dialogRef2 = this.dialog.open(ProgressDialogComponent, {
              data: {
                message: "Processing task ...",
              },
              disableClose: true
            });
            this.dialogRef2.afterClosed().subscribe(result => {
              this.dialog.closeAll();
            });
            if (buttonID != "SAVE") {
              this.FormDataJSON = this.updateFormForPdf(this.FormDataJSON, this.RepeatingTableJSON);
              this.FormDataJSON = this.updateAttachmentPath("COMPLETED", this.FormDataJSON);
            }
            if (this.workflowAssesmentFlag) {
              this.processFormService.performWorkflowAssesment(buttonID, this).then(tempFormComponent => {
                if (typeof tempFormComponent["message"] == "undefined" && typeof tempFormComponent["Error"] == "undefined") {
                  if (tempFormComponent.FormDataJSON["Status"] == "COMPLETED" || tempFormComponent.FormDataJSON["Status"] == "TERMINATED" || tempFormComponent.FormDataJSON["Status"] == "REJECTED") {
                    tempFormComponent.FormDataJSON["DateCompleted"] = this.processFormService.formatDate(new Date());
                  }
                  switch (buttonID) {
                    case "SUBMIT":
                    case "CLAIM":
                    case "PROCEED_WITH_YES":
                    case "PROCEED_WITH_NO":
                    case "RESUBMIT":
                    case "REJECT":
                    case "TERMINATE":
                    case "RESTART":
                    case "DELEGATE":
                      this.WorkflowTasksJSON = tempFormComponent.WorkflowTasksJSON;
                      this.FormDataJSON = tempFormComponent.FormDataJSON;
                      this.FormDataJSON["DisplayStatus"] = this.WorkflowSettingJSON[0].Workflow_Status_Labels[this.FormDataJSON["Status"]];
                      this.processFormService.performWorkflowProgress(buttonID, this);
                      break;

                    case "SAVE":
                      this.WorkflowTasksJSON = tempFormComponent.WorkflowTasksJSON;
                      this.FormDataJSON = tempFormComponent.FormDataJSON;
                      if (this.FormDataJSON["Status"].toLowerCase() == "notsaved") {
                        let dialogRef3 = this.notAllowedDialog.open(AlertDialogComponent, {
                          data: {
                            title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                            message: "You are not allowed to save any more forms. Kindly delete any and try again.",
                          }
                        });
                        dialogRef3.afterClosed().subscribe(result => {
                          this.dialog.closeAll();
                          this.RefereshProcess();
                          this.router.navigate(['main', 'process', this.a.processId, 'home', 'tasks']);
                        });
                      }
                      else {
                        let processOffset = new FormatOffsetDatePipe();
                        var tempDate = new Date();
                        tempDate.setMinutes(tempDate.getMinutes() + tempDate.getTimezoneOffset())
                        let processOffsetDate = processOffset.transform(tempDate, this.ProcessSettingsJSON["PROCESS_TIMEZONE"]);
                        processOffsetDate = moment(processOffsetDate).format('DD-MMM-YYYY hh:mm:A');
                        this.FormDataJSON["SavedDateTime"] = processOffsetDate; 
                        this.processFormService.performWorkflowProgress(buttonID, this);
                      }
                      break;
                  }
                } else {
                  if (buttonID == "DELEGATE") {
                    let alertDialog = this.dialog.open(AlertDialogComponent, {
                      data: {
                        title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                        message: tempFormComponent["message"],
                      }
                    });
                    alertDialog.afterClosed().subscribe(result => {
                      this.dialog.closeAll();
                    });
                  }
                  else if (tempFormComponent["message"] != undefined) {
                    let alertDialog = this.dialog.open(AlertDialogComponent, {
                      data: {
                        title: this.WorkflowSettingJSON[0].Form_Header.FormTitle,
                        message: tempFormComponent["message"],
                      }
                    });
                    alertDialog.afterClosed().subscribe(result => {
                      this.dialog.closeAll();
                      this.RefereshProcess();
                      this.router.navigate(['main', 'process', this.a.processId, 'home', 'tasks']);
                    });
                  }
                  else if (tempFormComponent["Error"] != undefined) {
                    this.rapidflowService.ShowErrorMessage("generateReferenceNumber-Process Form service", "Platfrom", "Error occured while executing api call", tempFormComponent["Error"], "An error occured while generating reference number", "RapidflowServices.workflowAssesment", this.a.processId, true);
                  }
                }
              });
            }
            else {
              this.handlePostWorkflow();
            }
          }
          catch (ex) {
            this.a.RapidflowService.ShowErrorMessage("performingWorkflowAssesment-FormSub Component", "Platform", ex.message, ex.stack, "An error occured while performing assesment", "N/A", this.a.processId, true);
          }
        }

        /**
         * FUnction called when form is loaded
         * 
         * @returns status 
         * @memberof TemplateComponent
         */
        performFormLoadOperations() {
          return true;
        }

        /**
         * Function called before performing workflow operations
         * 
         * @param {any} status status of the form
         * @param {any} currentTaskName task name
         * @param {any} userAction action taken by user
         * @returns 
         * @memberof TemplateComponent
         */
        performPreWorkflowTaskOperations(status, currentTaskName, userAction) {
          let promise = new Promise((resolve, reject) => {
            resolve(true);
          });
          return promise;
        }

        /**
         * Function called after performing workflow operations
         * 
         * @param {any} status status of the form
         * @param {any} currentTaskName task name
         * @param {any} userAction action taken by user
         * @returns 
         * @memberof TemplateComponent
         */
        performPostWorkflowTaskOperations(status, currentTaskName, userAction) {
          let promise = new Promise((resolve, reject) => {
            resolve(true);
          });
          return promise;
        }

        /**
         * Custom dialog for the developer to render HTML in dialog
         * 
         * @param {any} dialogTitle 
         * @param {any} dialogHtml 
         * @param {any} dialogLogic 
         * @memberof TemplateComponent
         */
        openCustomDialog(dialogTitle, dialogHtml, dialogLogic, redirect, refresh) {
          this.customDialogRef = this.dialog.open(CustomDialogComponent, {
            data: {
              title: dialogTitle,
              dialogHtml: dialogHtml,
              dialogLogic: dialogLogic,
              FormDataJSON: this.FormDataJSON
            },
            width: "auto",
            height: "auto"
          });
          this.customDialogRef.afterClosed().subscribe(result => {
            if(redirect){
              this.router.navigate(['main', 'process', this.a.processId, 'home', 'tasks']);
            }
            else if(refresh){
              window.location.reload();
            }
          });
        }


        /**
         * Show custom progress dialog message
         * 
         * @param {any} message 
         * @memberof TemplateComponent
         */
        showCustomProgressDialog(message, clickOutSideToClose){
          if(message == "" || message == undefined){
            message = "Please wait...";
          }
          this.customProgressDialogRef = this.dialog.open(ProgressDialogComponent, {
            data: {
              message: message
            },
            disableClose: clickOutSideToClose
          });
          this.customProgressDialogRef.afterClosed().subscribe(result => {
          });
        }

        /**
         * Hide custom progress dialog
         * 
         * @memberof TemplateComponent
         */
        hideCustomProgressDialog(){
          this.customProgressDialogRef.close();
        }

        /**
         * Function called to update the table valid status
         * 
         * @param {any} event 
         * @memberof TemplateComponent
         */
        updateTableValidation(event) {
          var found = false;
          if (this.FormDataJSON["InvalidRepeatingTables"] != undefined) {
            if (event != undefined) {
              if (event["tableName"] != undefined) {
                for (let i = 0; i < this.FormDataJSON["InvalidRepeatingTables"].length; i++) {
                  if (this.FormDataJSON["InvalidRepeatingTables"][i]["tableName"].toLowerCase() == event["tableName"].toLowerCase()) {
                    found = true;
                    if (event["valid"]) {
                      this.FormDataJSON["InvalidRepeatingTables"].splice(i, 1);
                    }
                  }
                }
                if (!found && !event["valid"]) {
                  this.FormDataJSON["InvalidRepeatingTables"].push(event);
                }
              }
            }
          }
          if (this.FormDataJSON["InvalidRepeatingTables"].length > 0) {
            this.validRepeatingTables = false;
          }
          else {
            this.validRepeatingTables = true;
          }
        }

        /**
         * Function to return formdatajson object from process form service
         * 
         * @param {any} processId 
         * @param {any} workflowId 
         * @param {any} processSettingsJSON 
         * @param {any} workflowSettingJSON 
         * @param {any} formOptionsJSON 
         * @param {any} workflowVersion 
         * @returns 
         * @memberof TemplateComponent
         */
        getFormData(processId, workflowId, processSettingsJSON, workflowSettingJSON, formOptionsJSON, workflowVersion){
          return this.processFormService.getFormData(processId, workflowId, processSettingsJSON, workflowSettingJSON, formOptionsJSON, workflowVersion);
        }

        /**
         * Function to check validation on repeating tables
         * 
         * @param {any} formDataJSON 
         * @param {any} formOptions 
         * @param {any} repeatingTableJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        updateInvalidRepeatingTables(formDataJSON, formOptions, repeatingTableJSON){
          return this.processFormService.updateInvalidRepeatingTables(formDataJSON, formOptions, repeatingTableJSON);
        }

        /**
         * Function to generate action buttons for the user
         * 
         * @param {any} processId 
         * @param {any} workflowId 
         * @param {any} workflowSettingJSON 
         * @param {any} newActionButtons 
         * @param {any} buttonslist 
         * @returns 
         * @memberof TemplateComponent
         */
        generateActionButtons(processId, workflowId, workflowSettingJSON, newActionButtons, buttonslist){
          return this.processFormService.generateActionButtons(processId, workflowId, workflowSettingJSON, newActionButtons, buttonslist)
        }

        /**
         * Function to determine user action for user
         * 
         * @param {any} workflowTasksJSON 
         * @param {any} currentPendingTasksJSON 
         * @param {any} currentUserTaskJSON 
         * @param {any} formDataJSON 
         * @param {any} defaultButtons 
         * @param {any} formSettings 
         * @returns 
         * @memberof TemplateComponent
         */
        determineUserActions(workflowTasksJSON, currentPendingTasksJSON, currentUserTaskJSON, formDataJSON, defaultButtons, formSettings){
          return this.processFormService.determineUserActions(workflowTasksJSON, currentPendingTasksJSON, currentUserTaskJSON, formDataJSON, defaultButtons, formSettings);
        }

        /**
         * Function called to render pending form for user
         * 
         * @param {any} formDataJSON 
         * @param {any} currentUserTaskJSON 
         * @param {any} repeatingTableJSON 
         * @param {any} workflowTasksJSON 
         * @param {any} defaultValuesJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        renderPendingForm(formDataJSON, currentUserTaskJSON, repeatingTableJSON, workflowTasksJSON, defaultValuesJSON){
          return this.processFormService.renderPendingForm(formDataJSON, currentUserTaskJSON, repeatingTableJSON, workflowTasksJSON, defaultValuesJSON);
        }

        /**
         * Function to update attachment path based on form status
         * 
         * @param {any} formStatus 
         * @param {any} formDataJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        updateAttachmentPath(formStatus, formDataJSON){
          return this.processFormService.updateAttachmentPath(formStatus, formDataJSON);
        }

        /**
         * Function to update task instructions in workflow tasks
         * 
         * @param {any} formDataJSON 
         * @param {any} workflowTasksJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        updateTaskInstructions(formDataJSON, workflowTasksJSON){
          return this.processFormService.updateTaskInstructions(formDataJSON, workflowTasksJSON);
        }

        /**
         * Function to update form data for pdf
         * 
         * @param {any} formDataJSON 
         * @param {any} repeatingTableJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        updateFormForPdf(formDataJSON, repeatingTableJSON){
          return this.processFormService.updateFormForPdf(this.FormDataJSON, this.RepeatingTableJSON);
        }

        /**
         * Update workflow routing as per form status
         * 
         * @param {any} status 
         * @returns 
         * @memberof TemplateComponent
         */
        getProcessTasksFromServer(status){
          return this.workflowRoutingService.getProcessTasksFromServer(status);
        }

        /**
         * Function to get current pending tasks from workflow tasks json
         * 
         * @param {any} workflowTasks 
         * @returns 
         * @memberof TemplateComponent
         */
        getPendingTasksJSON(workflowTasks){
          return this.workflowRoutingService.getPendingTasksJSON(workflowTasks);
        }

        /**
         * Function to return current user task from current pending tasks
         * 
         * @param {any} currentPendingTasksJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        getCurrentUserTaskJSON(currentPendingTasksJSON){
          return this.workflowRoutingService.getCurrentUserTaskJSON(currentPendingTasksJSON);
        }

        /**
         * Check if the current pending task is delegated or not
         * 
         * @param {any} currentPendingTasksJSON 
         * @returns 
         * @memberof TemplateComponent
         */
        checkIsDelegatedTask(currentPendingTasksJSON){
          return this.workflowRoutingService.checkIsDelegatedTask(currentPendingTasksJSON);
        }

        /**
         * Function to validate the workflow tasks json
         * 
         * @returns 
         * @memberof TemplateComponent
         */
        checkWorkflowTaskJson(){
          return this.workflowRoutingService.checkWorkflowTaskJson();
        }
      }
      @NgModule({ declarations: [TemplateComponent], imports: [MainFlatModule, FlexLayoutModule, MatExpansionModule, FormsModule, MatToolbarModule, MatCardModule, NgbModule, MatSelectModule, OwlDateTimeModule, OwlMomentDateTimeModule, MatRadioModule, MatCheckboxModule] })
      class TemplateModule { }

      const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
      const factory = mod.componentFactories.find((comp) =>
        comp.componentType === TemplateComponent
      );
      let comp = '';
      eval(formComponent)
      const component = this.container.createComponent(factory);
      Object.assign(component.instance, comp);
    } catch (ex) {
      this.RapidflowService.ShowErrorMessage("addComponent-Form Component", "Platform", ex.message, ex.stack, "An error occured while adding component", "N/A", this.processId, true);
    }
  }

  /**
   * FUnction called to update date format
   * 
   * @param {any} dateStringISO date in string
   * @returns formatted date
   * @memberof FormComponent
   */
  setTaskDateFormat(dateStringISO) {
    if (dateStringISO == "" || dateStringISO == undefined) {
      return "";
    }
    return moment.utc(dateStringISO).format("DD-MMM-YYYY hh:mm A")
  }

  /**
   * Function called when the form is being rendered
   * 
   * @memberof FormComponent
   */
  renderForm() {
    try {
      let dialogRef: MatDialogRef<ProgressDialogComponent>;;
      dialogRef = this.dialog.open(ProgressDialogComponent, {
        data: {
          message: "Loading form...",
        }
      });
      dialogRef.afterClosed().subscribe(result => {
      });
      this.CurrentLoggedInUser = this.RapidflowService.CurrentLoggedInUser;
      if(window.localStorage["User"]==undefined)
      {
        return;
      }
      else{
        this.CurrentLoggedInUser=JSON.parse(window.localStorage["User"]);
        this.processFormService.CurrentLoggedInUser=this.CurrentLoggedInUser;
      }
      
      if (this.actualFormId.toLowerCase() == "new") {
        this.RapidflowService.retrieveInitiationFormObjects(this.processId, this.workflowId)
          .subscribe((response) => {
            this.formObjects = JSON.parse(response.json())[0];
            if (this.formObjects == undefined) {
              setTimeout(() => {
                var popupTitle1 = "Rapidflow";
                let invalidForm: MatDialogRef<AlertDialogComponent>;
                invalidForm = this.invalidFormDialog.open(AlertDialogComponent, {
                  data: {
                    title: popupTitle1,
                    message: "Invalid form details or form doesn't exist. Kindly contact support.",
                  }
                });
                invalidForm.afterClosed().subscribe(result => {
                  if (this.router.url.indexOf("processDirectory") == -1) {
                    this.dialog.closeAll();
                    this.router.navigate(['main', 'process', this.processId, 'home', 'tasks']);
                  }
                });
              }, 1000);
            }
            else if (this.formObjects != undefined) {
              this.formObjects.FormHtml = this.processFormService.getFormHtml(this.formObjects.FormHtml);
              this.formObjects.FormController = this.processFormService.getFormLogicComponent(this.formObjects.FormController);
              this.addComponent(this.formObjects.FormHtml, this.formObjects.FormController);
              dialogRef.close();
            }
          }, (error: any) => {
            this.RapidflowService.ShowErrorMessage("retrieveInitiationFormObjects- Form Component", "Platfrom", "Error occured while executing api call", error, "An error occured while retrieving new form", " RapidflowServices.retrieveInitiationFormObjects", '0', true);
          });
      }
      else {
        this.formId = this.actualFormId;
        this.RapidflowService.retrieveProcessFormData(this.processId, this.workflowId, this.formId)
          .subscribe((response) => {
            this.formObjects = JSON.parse(response.json())[0];
            if (this.formObjects == undefined) {
              setTimeout(() => {
                var popupTitle1 = "Rapidflow";
                let invalidForm: MatDialogRef<AlertDialogComponent>;
                invalidForm = this.invalidFormDialog.open(AlertDialogComponent, {
                  data: {
                    title: popupTitle1,
                    message: "Invalid form details or form doesn't exist. Kindly contact support.",
                  }
                });
                invalidForm.afterClosed().subscribe(result => {
                  if (this.router.url.indexOf("processDirectory") == -1) {
                    this.dialog.closeAll();
                    this.router.navigate(['main', 'process', this.processId, 'home', 'tasks']);
                  }
                });
              }, 1000);
            }
            else if (this.formObjects != undefined) {
              if (this.processFormService.checkFormAuthorization(this.formObjects.FormData["AllJobReaders"], this.formObjects.FormData["ManagerEmail"], this.formObjects.FormData["InitiatedByEmail"], this.ProcessDataService.userPermissions, this.workflowId, this.formObjects.FormData["Status"])) {
                this.formObjects.FormHTML = this.processFormService.getFormHtml(this.formObjects.FormHTML);
                this.formObjects.FormController = this.processFormService.getFormLogicComponent(this.formObjects.FormController);
                this.addComponent(this.formObjects.FormHTML, this.formObjects.FormController);
                dialogRef.close();
              }
              else {
                var popupTitle = "Rapidflow";
                if (this.formObjects.WorkflowSettingJSON != undefined) {
                  if (this.formObjects.WorkflowSettingJSON.length > 0) {
                    if (this.formObjects.WorkflowSettingJSON[0].Form_Header.FormTitle != undefined) {
                      popupTitle = this.formObjects.WorkflowSettingJSON[0].Form_Header.FormTitle;
                    }
                  }
                }
                let notAuthorizedDialogRef = this.notAuthorizedDialog.open(AlertDialogComponent, {
                  data: {
                    title: popupTitle,
                    message: "You are not authorized to open this request.",
                  }
                });
                notAuthorizedDialogRef.afterClosed().subscribe(result => {
                  if (this.router.url.indexOf("processDirectory") == -1) {
                    this.dialog.closeAll();
                    this.router.navigate(['main', 'process', this.processId, 'home', 'tasks']);
                  }
                });
              }
            }
          }, (error: any) => {
            this.RapidflowService.ShowErrorMessage("retrieveProcessFormData- Form Component", "Platfrom", "Error occured while executing api call", error, "An error occured while retrieving pending/saved form", " RapidflowServices.retrieveProcessFormData", '0', true);
          });
      }
    } catch (ex) {
      this.RapidflowService.ShowErrorMessage("renderForm-Form Component", "Platform", ex.message, ex.stack, "An error occured while form rendering ", "N/A", this.processId, true);
    }
  }

  ngOnDestroy(){
    this.paramSubscription.unsubscribe();
  }
}
