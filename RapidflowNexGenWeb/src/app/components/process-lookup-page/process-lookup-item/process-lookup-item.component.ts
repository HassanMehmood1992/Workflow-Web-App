import { ProcessDataService } from './../../../services/process-data.service';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/
/*
ModuleID: ProcessLookupItemComponent
Description: Renders the process lookup item add or delete form.
Location: ./components/process-lookup-item.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { EventEmiterService } from './../../../services/event-emiters.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { SocketProvider } from './../../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { AppModule } from './../../../app.module';
import { RapidflowService } from './../../../services/rapidflow.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatButtonModule } from '@angular/material';
import { Component, OnInit, Inject, NgModule, Compiler, ViewContainerRef, ViewChild, Input } from '@angular/core';
import * as $ from 'jquery'
import { ProgressDialogComponent } from '../../progress-dialog/progress-dialog.component';
import MainFlatModule from '../../../main-flat/main-flat.module';
import * as moment from 'moment';
import { FormatOffsetDatePipe } from '../../../pipes/format-offset-date.pipe';
//Global variables: because we can not pass object to dynamic component generated at runtime. dynamic component can read global variables
var lookupItem; // to store the lookup item for rendering in dynamic component
var lookupDefinition;// to store the lookup definition for rendering in dynamic component
var existingItem;  // to store the lookup item status for rendering in dynamic component
var permissionArray; // to store the lookup permission array for rendering in dynamic component
var processLookupData;// to store the all lookup items array for rendering in dynamic component
var processOffset;
/**
 *  component decorator
 * 
 * @export
 * @class ProcessLookupItemComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-process-lookup-item',
  templateUrl: './process-lookup-item.component.html',
  styleUrls: ['./process-lookup-item.component.css']
})
export class ProcessLookupItemComponent implements OnInit {
  //data passed as input to child view
  @Input() exists: boolean // flag if item is new or existing
  @Input() currentItem: any;// contains selected lookup item
  @Input() Lookup: any; // contains lookup definition
  @Input() permissionArray: any // contain current lookup permission 
  @Input() processLookupData: any // contain all lookup data 
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef; // html tag to generate the dynamic lookup item component inside of it
  /**
   * Creates an instance of ProcessLookupItemComponent.
   * @param {Compiler} compiler 
   * @param {RapidflowService} rapidflowService 
   * @param {MatDialog} dialog 
   * @memberof ProcessLookupItemComponent
   */
  constructor(private compiler: Compiler, public rapidflowService: RapidflowService, public ProcessDataService:  ProcessDataService,
    private dialog: MatDialog) {
  }
  ngOnInit() {
    lookupItem = this.currentItem; // replicating the lookup item into global vairable
    lookupDefinition = this.Lookup // replicating the lookup definition into global vairable
    existingItem = this.exists; // replicating the lookup item status into global vairable
    permissionArray = this.permissionArray // replicating the lookup item permission into global vairable
    processLookupData = this.processLookupData  // replicating the all lookup items into global vairable
    
    // generating the html for item
    var temphtml = '<form (ngSubmit)="action(\'save\')" #myLookupForm="ngForm"  id="form1">' +
      decodeURIComponent(this.Lookup.LookupHTML) +
      '<br/> <div *ngFor="let item of duplicateValuesArray" style="color:red"> <p> Duplicate Value {{item.Value}} found at {{item.Column}}</p></div> <div class="" [hidden]="!approved" style="    float: right;"> ' +
      '<button mat-button *ngIf="!editItem&&existingItem&&(permissionArray.Edit)"(click)="editItem=!editItem;setItemForEditableState()" style="margin: 7px;background: lightgrey; color: blue;">  Edit    </button>' +
      '<button mat-button type="submit" class="btn btn-success" [disabled]="!myLookupForm.form.valid" *ngIf="(editItem||!existingItem)&&(permissionArray.Edit||permissionArray.Add)" (click)="action(\'save\')" style="margin: 7px;background: lightgrey; color: blue;">  Save    </button>' +
      ' <button mat-button  class="btn btn-success" [disabled]="!myLookupForm.form.valid&&itemupdated"  *ngIf="existingItem&&(permissionArray.Delete)" (click)="action(\'delete\')"  style="margin: 7px;background: lightgrey; color: blue;">  Delete </button>' +
      '</div>' +
      ' <div class="" [hidden]="approved" style="float: right;">Pending with: {{pendingWith}} <br/>Pending Since : {{pendingSince}}</div>' +
      '</form><style>ng:deep.ng-invalid{ border-color: none !important;border-bootom-color: red !important; border-radius: 0px; } , textarea:disabled {color: #dddddd !important;} ::ng-deep.myCustomLookup{width: 100%; margin: 0.5%; border-color: transparent !important; background-color: white !important; box-shadow: none; border-bottom: 0.5px solid darkgray !important; border-radius: 0px; margin: 0px !important; padding: 0px !important; } label { display: inline-block; max-width: 100%; margin-bottom: 5px; font-weight: 300; font-size: 12px; color: darkgray; }.itemTitle { font-size: 17px; color: #000000; } .itemDescription { font-size: 12px; color: #95989A; } .mat-list-item-border { border-bottom: 1px solid lightgray; } .hideoverflowverticle { overflow: hidden; display: flex; flex-flow: column; height: 100%; } .topRow { border-right: 0.5px solid lightgrey; flex: 0 1 auto; } .MyProcessBottomRow { height: 50px; flex: 0 1 auto; padding-left: 3%; border-top: 0.5px solid lightgrey !important; } .MyProcessRow { flex: 1 1 auto; overflow: auto; }</style>';
    // passing html and controller for dynamic component
    this.addComponent(temphtml, decodeURIComponent(this.Lookup.LookupController));
  }
  /**
   * defining dynamic component
   * 
   * @private
   * @param {string} templateCurrent 
   * @param {string} component1 
   * @returns 
   * @memberof ProcessLookupItemComponent
   */
  private addComponent(templateCurrent: string, component1: string) {
    /**
     * LookupItemComponent decorator
     * 
     * @class LookupItemComponent
     * @implements {OnInit}
     */
    @Component({
      template: templateCurrent
    })
    class LookupItemComponent implements OnInit {
      duplicateValuesArray: any[]; // contains duplicate column values
      dialogRef: MatDialogRef<ProgressDialogComponent>; // to show progress dialog on action
      pendingSince: any; // showing the pending since value if the item is in pending state
      ProcessOffset:any;
      pendingWith: any; //  showing the pending with value if the item is in pending state
      currentItemDetails: any;// contain the current values inserted in the item
      processId: number;// contain current process id
      currentLoogedInUser: boolean; // contains current looged in user details
      existingItem: any; // contain the status of the item
      lookupDefinitions: any; // contains lookup definition
      lookupDispalyAndTitleArray: any // lookup display and title values to show in lookup approval values
      lookupitem: any;// reads the lookup item from global values
      permissionArray: any; // contains the current user permission on item
      processLookupData: any //  contain all lookup items
      dataPayLoad = {}; // variables to pass in socket call
      approved: boolean; // flag if the item is approved or not
      itemupdated: boolean // flag if the item values are changed
      @Input('numInt') numInt;
      editItem = false; // flag if item is editted
      LookupFormOption: any; // to contain the lookup column definitions
      /**
       * Creates an instance of LookupItemComponent.
       * @param {RapidflowService} rapidflowService 
       * @param {EventEmiterService} data 
       * @param {SocketProvider} socket 
       * @param {ActivatedRoute} route 
       * @param {Router} router 
       * @param {MatDialog} dialog 
       * @memberof LookupItemComponent
       */
      constructor(private rapidflowService: RapidflowService, private data: EventEmiterService,private ProcessDataService:ProcessDataService,
        private socket: SocketProvider,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog) {
        this.itemupdated = false
        this.LookupFormOption = {}
        this.lookupitem = {}
        this.currentItemDetails = JSON.parse(JSON.stringify(lookupItem))
        this.currentLoogedInUser = this.rapidflowService.CurrentLoggedInUser
        this.socket.start();
        this.approved = false
        this.ProcessOffset=0
        // updating lookup item status
        if (lookupItem != undefined) {
          if (lookupItem.ApprovalStatus == "Approved" && lookupItem.DateDeleted == "") {
            this.approved = true
          } else {
            this.approved = false
          }
          this.lookupitem = lookupItem.Value
          if (lookupItem.taskDetails != undefined) {
            this.pendingWith = lookupItem.ToUserEmail;
            let processOffset = new FormatOffsetDatePipe();
            var tempDate = new Date(lookupItem.taskDetails.DateCreated);
            tempDate.setMinutes(tempDate.getMinutes() + tempDate.getTimezoneOffset())
            let processOffsetDate = processOffset.transform(tempDate, this.ProcessDataService.processGlobalSettings[0]['Process_Settings'].PROCESS_TIMEZONE);
            this.pendingSince  = moment(processOffsetDate).format('DD-MMM-YYYY hh:mm:A');
          }
        } else {
          this.lookupitem = {}
        }
        this.permissionArray = permissionArray
        this.lookupDefinitions = lookupDefinition
        this.processLookupData = processLookupData
        this.setLookupFormFielOptions()
        this.existingItem = existingItem;
        this.currentItemDetails = JSON.parse(JSON.stringify(lookupItem))
        this.dataPayLoad['PushNotificationMessage'] = "test";
        this.dataPayLoad['AssignmentEmailSubject'] = "test";
        this.dataPayLoad['AssignmentEmailBody'] = "test";
        this.dataPayLoad['AssignmentAppSubject'] = "test";
        this.dataPayLoad['AssignmentAppBody'] = "test";
        this.dataPayLoad['AssignmentAppBody'] = "test";
        this.dataPayLoad['LookupItem'] = ""
        if (!this.existingItem) {
          this.setAllFieldsValuesInJSON()
          this.setItemForEditableState()
        } else {
          this.setItemForReadonlyState()
        }
      }
      /**
       * component initialization lifecycle hook
       * 
       * @memberof LookupItemComponent
       */
      ngOnInit() {
        try {
          this.itemupdated = false
          this.route.parent.paramMap
            .subscribe((params: ParamMap) => {
              this.processId = +params.get('ProcessID');
            })
          // starting the socket
          this.socket.start();
          if (lookupItem.ApprovalStatus == "Approved") {
            this.approved = true
          } else {
            this.approved = false
          }
          if (lookupItem != undefined&&lookupItem!=[]) {
            this.lookupitem = lookupItem.Value
            if (lookupItem.taskDetails != undefined) {
              this.pendingWith = lookupItem.taskDetails.ToDisplayName;
              // this.pendingSince = lookupItem.taskDetails.DateCreated;
              let processOffset = new FormatOffsetDatePipe();
              var tempDate = new Date(lookupItem.taskDetails.DateCreated);
              tempDate.setMinutes(tempDate.getMinutes() + tempDate.getTimezoneOffset())
              let processOffsetDate = processOffset.transform(tempDate, this.ProcessDataService.processGlobalSettings[0]['Process_Settings'].PROCESS_TIMEZONE);
              this.pendingSince  = moment(processOffsetDate).format('DD-MMM-YYYY hh:mm:A');
            }
          } else {
            this.lookupitem = {}
          }
          this.permissionArray = permissionArray
          this.lookupDefinitions = lookupDefinition
          this.duplicateValuesArray = []
          this.processLookupData = processLookupData
          // updating the lookup form field options
          this.setLookupFormFielOptions()
          this.existingItem = existingItem;
          // setting date pay load to update the lookup item
          this.dataPayLoad['PushNotificationMessage'] = "test";
          this.dataPayLoad['AssignmentEmailSubject'] = "test";
          this.dataPayLoad['AssignmentEmailBody'] = "test";
          this.dataPayLoad['AssignmentAppSubject'] = "test";
          this.dataPayLoad['AssignmentAppBody'] = "test";
          this.dataPayLoad['AssignmentAppBody'] = "test";
          this.dataPayLoad['LookupItem'] = ""
          // decisions if item is editted or in case of new item
          if (this.existingItem) {
            if (lookupItem != undefined) {
              this.lookupitem = lookupItem.Value
            } else {
              this.lookupitem = {}
              this.approved = true
            }
            this.setItemForReadonlyState()
          } else {
            this.lookupitem = {}
            this.setAllFieldsValuesInJSON()
            this.approved = true
            this.setItemForEditableState()
          }
        } catch (ex) {
          this.rapidflowService.ShowErrorMessage("ngOnInit-Lookup item component", "Platform", ex.message, ex.stack, "An error occured while initiating the lookup item", "N/A", this.lookupDefinitions.ProcessID, true);
        }
      }
      /**
       * Refresh the tasks and processes on action
       * 
       * @memberof LookupItemComponent
       */
      RefereshLookupsAndProcess() {
        let countRefreshObject = { "Type": "AllCounts", Value: { "Count": "true" } }
        this.data.changeMessage(countRefreshObject);
        this.router.navigate(['main', 'process', this.processId, 'Lookup', this.lookupDefinitions.LookupID], { queryParams: { Status: 'Changed' }, queryParamsHandling: 'merge' });
      }
      // makng field readonly  based on lookup item state i.e editable or readonly
      mapReadonlyfields(state) {
        try {
          var interval = setInterval(() => {
            if ($('#form1').html() != undefined) {
              for (var i = 0; i < this.lookupDefinitions.ColumnDefinitions.length; i++) {
                if (state == "editable") {
                  if (this.lookupDefinitions.ColumnDefinitions[i].Type == "PeoplePicker" || this.lookupDefinitions.ColumnDefinitions[i].Type == "ProcessLookup") {
                    this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName].disabled = (this.lookupDefinitions.ColumnDefinitions[i].Options.readonly == true);
                    this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName].readonly = (this.lookupDefinitions.ColumnDefinitions[i].Options.readonly == true)
                  } else {
                    this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName].readonly = (this.lookupDefinitions.ColumnDefinitions[i].Options.readonly == true);
                    this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName].disabled = (this.lookupDefinitions.ColumnDefinitions[i].Options.readonly == true);
                  }
                } else {
                  this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName].readonly = true
                  this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName].disabled = true;
                  this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName].readonly = true;
                  this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName].disabled = true;
                }
              }
              clearInterval(interval)
            }
          }, 500)
        } catch (ex) {
          // Method error handler
          this.rapidflowService.ShowErrorMessage("mapReadonlyfields-Lookup item component", "Platform", ex.message, ex.stack, "An error occured while making lookup field validation", "N/A", this.lookupDefinitions.ProcessID, true);
        }
      }
      /**
       * Reset the current item and mark all the fields as readonly
       * 
       * @memberof LookupItemComponent
       */
      setItemForReadonlyState() {
        try {
          this.mapReadonlyfields('readonly')
          if (this.currentItemDetails.Value != undefined && this.currentItemDetails.Value != null && this.currentItemDetails.Value != "") {
            this.lookupitem = JSON.parse(JSON.stringify(this.currentItemDetails.Value));
          }
        } catch (ex) {
          this.rapidflowService.ShowErrorMessage("setItemForReadonlyState-Lookup item component", "Platform", ex.message, ex.stack, "An error occured while making item readonly", "N/A", this.lookupDefinitions.ProcessID, true);
        }
      }
      /**
      * set the current item and mark all the fields as editable based on lookup definitions
      * 
      * @memberof LookupItemComponent
      */
      setItemForEditableState() {
        this.mapReadonlyfields('editable')
      }
      /**
       * Add defult value to lookup item
       * 
       * @memberof LookupItemComponent
       */
      setAllFieldsValuesInJSON() {
        this.lookupDispalyAndTitleArray = {}
        if(this.lookupitem==undefined){
          this.lookupitem={}
        }
        for (var i = 0; i < this.lookupDefinitions.ColumnDefinitions.length; i++) {
          if (this.lookupitem[this.lookupDefinitions.ColumnDefinitions[i].ShortName] == undefined || this.lookupitem[this.lookupDefinitions.ColumnDefinitions[i].ShortName] == undefined) {
            this.lookupitem[this.lookupDefinitions.ColumnDefinitions[i].ShortName] = ""
          }
          this.lookupDispalyAndTitleArray[this.lookupDefinitions.ColumnDefinitions[i].ShortName] = this.lookupDefinitions.ColumnDefinitions[i].DisplayName
        }
      }
      /**
       * User action on lookup item
       * 
       * @param {any} actions 
       * @returns 
       * @memberof LookupItemComponent
       */
      action(actions) {
        try {
          if (actions != "delete") {
            let duplicate = this.checkDuplicates()
            if (duplicate == true) {
              return false
            }
          }
          this.setAllFieldsValuesInJSON()
         
          if (this.itemupdated == false) {
            this.itemupdated = true
            //  alert('test run')
            this.dataPayLoad['ProcessName'] = $('#heading').html().toString().trim()
            this.dataPayLoad['ProcessOrganization'] = $('#subHeading').html().toString().trim()
            this.dataPayLoad['LookupItem'] = this.lookupitem;
            this.dataPayLoad['lookupDispalyAndTitleArray'] = JSON.stringify(this.lookupDispalyAndTitleArray);
            delete this.dataPayLoad['LookupItem']["TakeAction"];
            //decision based on new or existing item
            if (!this.existingItem) {
              this.dataPayLoad['LookupDataID'] = "0";
              this.dataPayLoad['PreviousItem'] = ''
            } else {
              this.dataPayLoad['LookupDataID'] = this.currentItemDetails.LookupDataID;
              this.dataPayLoad['PreviousItem'] = JSON.parse(JSON.stringify(this.currentItemDetails.Value))
            }
            this.dataPayLoad['LookupName'] = this.lookupDefinitions.LookupTitle
            this.dataPayLoad['ApprovalRequired'] = this.lookupDefinitions.ApprovalRequired.toLowerCase();
            //data pay load decisions based on action and item status
            if (actions == "save" && !this.existingItem) {
              this.dataPayLoad['ItemStatus'] = "created";
            } else if (actions == "save" && this.existingItem) {
              this.dataPayLoad['ItemStatus'] = "modified";
            } else if (actions == "delete") {
              this.dataPayLoad['ItemStatus'] = "delete";
              this.dataPayLoad['LookupItem'] = JSON.parse(JSON.stringify(this.currentItemDetails.Value))
            } else if (actions == "restore") {
              this.dataPayLoad['ItemStatus'] = "restore";
            }
            // data pay load configurations
            var paramsAssesment = {}
            paramsAssesment['fromUserEmail'] = this.currentLoogedInUser['Email']
            paramsAssesment['fromUserName'] = this.currentLoogedInUser['DisplayName']
            paramsAssesment['processId'] = this.processId.toString()
            paramsAssesment['lookupName'] = this.lookupDefinitions.LookupID;
            paramsAssesment['dataPayload'] = JSON.stringify(this.dataPayLoad);
            paramsAssesment['operationType'] = 'WORKFLOW';
            paramsAssesment['diagnosticLogging'] = this.rapidflowService.diagnosticLoggingProcessFlag.toString();
            // progress dialog
            this.dialogRef = this.dialog.open(ProgressDialogComponent, {
              data: {
                message: "Updating …"
              }
            });
            this.dialogRef.afterClosed().subscribe(result => { });
            // socket call to update the item
            var taskResult = this.socket.callWebSocketService('createProcessLookupApprovalTask', paramsAssesment);
            taskResult.then((result) => {
              if(result['message']!=undefined){
                if(typeof result['message'] =='string'){
                  this.dialog.closeAll();
                  this.RefereshLookupsAndProcess()
                }else{
                 var duplicateobject = {}
                 for(var key in result['message']){
                  duplicateobject['Column'] = key
                  duplicateobject['Value'] =  result['message'][key]
                  this.duplicateValuesArray.push(duplicateobject)
                  this.itemupdated=false
                  this.dialog.closeAll();
                 }
                
                }
              }
            
            }, (error) => {
              this.dialog.closeAll()
              //createProcessLookupApprovalTask api call error handler
              this.rapidflowService.ShowErrorMessage("createProcessLookupApprovalTask Lookup item component", "Platform", "Error occured while executing socket call " + error.message, error.stack, "An error occured while createProcessLookupApprovalTask", " socket.createProcessLookupApprovalTask", this.processId, true);
            });
          }
        } catch (ex) {
          // lookup action error handler
          this.rapidflowService.ShowErrorMessage("action-Lookup item component", "Platform", ex.message, ex.stack, "An error occured while taking action on the item", "N/A", this.lookupDefinitions.ProcessID, true);
        }
      }
      /**
       * Method to check if item values if duplicated with other lookup items already present
       * 
       * @returns 
       * @memberof LookupItemComponent
       */
      checkDuplicates() {
        try {
          this.duplicateValuesArray = []
          var duplicatefound = false
          for (var j = 0; j < this.lookupDefinitions.ColumnDefinitions.length; j++) {
            var duplicateobject = {}
            if (this.lookupDefinitions.ColumnDefinitions[j].Options.isUnique == true) {
              for (var i = 0; i < this.processLookupData.length; i++) {
                if (this.processLookupData[i].DateDeleted == "") {
                  if (this.lookupDefinitions.ColumnDefinitions[j].Type.toLowerCase() == "url") {
                    if (this.existingItem && this.currentItemDetails.LookupDataID == this.processLookupData[i].LookupDataID) {

                    } else {

                      var urlfound = false
                      var previousData = this.processLookupData[i].Value[this.lookupDefinitions.ColumnDefinitions[j].ShortName]
                      if (previousData != undefined) {
                        for (var k = 0; k < this.lookupitem[this.lookupDefinitions.ColumnDefinitions[j].ShortName].length; k++) {
                          for (var l = 0; l < previousData.length; l++) {
                            if (previousData[k].url == this.lookupitem[this.lookupDefinitions.ColumnDefinitions[j].ShortName][k].url) {
                              duplicateobject = {}
                              duplicatefound = true
                              duplicateobject['Column'] = this.lookupDefinitions.ColumnDefinitions[j].DisplayName
                              duplicateobject['Value'] = this.lookupitem[this.lookupDefinitions.ColumnDefinitions[j].ShortName][k].url
                              this.duplicateValuesArray.push(duplicateobject)
                              break;
                            }

                          }
                        }
                      }

                    }

                  } else if (this.lookupDefinitions.ColumnDefinitions[j].Type.toLowerCase() == "peoplepicker") {
                    if (this.existingItem && this.currentItemDetails.LookupDataID == this.processLookupData[i].LookupDataID) {

                    } else {

                      var urlfound = false
                      var previousData = this.processLookupData[i].Value[this.lookupDefinitions.ColumnDefinitions[j].ShortName]
                      if (previousData != undefined) {
                        for (var k = 0; k < this.lookupitem[this.lookupDefinitions.ColumnDefinitions[j].ShortName].length; k++) {
                          for (var l = 0; l < previousData.length; l++) {
                            if (previousData[k].DisplayName == this.lookupitem[this.lookupDefinitions.ColumnDefinitions[j].ShortName][k].DisplayName) {
                              duplicateobject = {}
                              duplicatefound = true
                              duplicateobject['Column'] = this.lookupDefinitions.ColumnDefinitions[j].DisplayName
                              duplicateobject['Value'] = this.lookupitem[this.lookupDefinitions.ColumnDefinitions[j].ShortName][k].DisplayName
                              this.duplicateValuesArray.push(duplicateobject)
                              break;
                            }

                          }
                        }
                      }
                    }
                  } else
                    if (this.lookupitem[this.lookupDefinitions.ColumnDefinitions[j].ShortName] == this.processLookupData[i].Value[this.lookupDefinitions.ColumnDefinitions[j].ShortName]) {
                      if (this.existingItem && this.currentItemDetails.LookupDataID == this.processLookupData[i].LookupDataID) {
                      } else {
                        duplicateobject = {}
                        duplicatefound = true
                        duplicateobject['Column'] = this.lookupDefinitions.ColumnDefinitions[j].DisplayName
                        duplicateobject['Value'] = this.lookupitem[this.lookupDefinitions.ColumnDefinitions[j].ShortName]
                        this.duplicateValuesArray.push(duplicateobject)
                        break;
                      }
                    }
                }
              }
            }
          }
          return duplicatefound
        } catch (ex) {
          // Method erro handler
          duplicatefound = true
          duplicateobject['Column'] = 'error'
          duplicateobject['Value'] = ex.message
          this.duplicateValuesArray.push(duplicateobject)
          this.rapidflowService.ShowErrorMessage("checkDuplicates-Lookup item component", "Platform", ex.message, ex.stack, "An error occured while checking duplicate constraint", "N/A", this.lookupDefinitions.ProcessID, true);
          return false
        }
      }
      /**
       * Populating lookup form field option in an object
       * 
       * @memberof LookupItemComponent
       */
      setLookupFormFielOptions() {
        try {
          this.LookupFormOption = {}
          for (var i = 0; i < this.lookupDefinitions.ColumnDefinitions.length; i++) {
            this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName] = {}
            this.LookupFormOption[this.lookupDefinitions.ColumnDefinitions[i].ShortName] = JSON.parse(JSON.stringify(this.lookupDefinitions.ColumnDefinitions[i].Options))
          }
        } catch (ex) {
          // Method error handler
          this.rapidflowService.ShowErrorMessage("setLookupFormFielOptions-Lookup item component", "Platform", ex.message, ex.stack, "An error occured while mapping constraints against each field", "N/A", this.lookupDefinitions.ProcessID, true);
        }
      }
    }
    @NgModule({ declarations: [LookupItemComponent], imports: [MainFlatModule, FormsModule, MatListModule, MatButtonModule, MatInputModule, MatDatepickerModule] })
    class TemplateModule { }
    const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory = mod.componentFactories.find((comp) =>
      comp.componentType === LookupItemComponent
    );
    let comp = '';
    eval(component1)
    const component = this.container.createComponent(factory);
    Object.assign(component.instance, comp);
  }
}