/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessGeneralSettingsComponent
Description: Allows the user to edit and view its general settings for the process.
Location: ./components/process-general-settings.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/


import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProxyApproverDialogComponent } from '../proxy-approver-dialog/proxy-approver-dialog.component';
import { RapidflowService } from '../../services/rapidflow.service';
import { OutOfOfficeDialogComponent } from './../out-of-office-dialog/out-of-office-dialog.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ViewPermissionsDialogComponent } from '../process-admin-pannel/process-admin-pannel.component';
import { ProcessDataService } from '../../services/process-data.service';
import { SetAlertDialogComponent } from '../set-alert-dialog/set-alert-dialog.component';
import * as moment from 'moment';

@Component({
  selector: 'app-process-general-settings',
  templateUrl: './process-general-settings.component.html',
  styleUrls: ['./process-general-settings.component.css']
})
export class ProcessGeneralSettingsComponent implements OnInit {
  public currentLoggedInUser: any;//current logged in user 
  public outOfOfficeDetails: any[];//process level out of office deatails 
  public outOfOfficeChecked: boolean;//out of office toggle model
  public proxyApproverDetails: any[];//process level proxy approver details
  public proxyApproverChecked: boolean;//proxy approver toggle model
  public emailNotificationsChecked: boolean;//email notifications toggle model
  public processNotificationsChecked: boolean;//push notifications toggle model
  public helpLink: string;//help page url
  public currentProcessID: number;//current selected process id
  public currentUserIsSupportPerson: boolean = false;//flag to check if current user is support person
  public globalProcessSettings: any;//global process settings object
  public permissions: any;//current user permssion object to render permsission view
  public permissionViewJSON: any;//permission view scheama containting html to show on permission popup
  public alertDisplayString: any = "N/A";//alert dispaly string default to N/A
  public generalSettingsRendering: number = 0;//general settings loading api calls counter
  public processAlertChecked: boolean = false;//process alert toggle model
  public currentUserIsAdmin:boolean=false;//flag to indicate if current user is process administrator
  public currentUserIsOwner:boolean=false;//flag to indicate if current user is process owner

  /**
   * Default constructor with dependency injection of all necessary objects and services 
   * @param rtr 
   * @param dialog 
   * @param rapidflowService 
   * @param route 
   * @param viewPermissionsDialog 
   * @param router 
   * @param ProcessDataService 
   * @param updateAlertDialog 
   */
  constructor(private rtr: Router,
    public dialog: MatDialog,
    private rapidflowService: RapidflowService,
    private route: ActivatedRoute,
    private viewPermissionsDialog: MatDialog,
    private router: Router,
    private ProcessDataService: ProcessDataService,
    private updateAlertDialog: MatDialog
  ) {
    this.outOfOfficeDetails = [];
    this.proxyApproverDetails = [];
  }

  /**
   * Component initialization lifecycle hook. initializes all settings fields on the page
   */
  ngOnInit() {
    this.route.parent.parent.params.subscribe(params => {
      this.currentProcessID = parseInt(params['ProcessID']);

      this.checkcurrentloogedinUser();
      this.setUserProcessSettings();
      this.setGlobalProcessSettings();
 
    });
    //hide loading after 7 seconds
    setTimeout(() => { this.generalSettingsRendering = 2; }, 7000)
  }
  /**
   * Navigate back to previous route
   */
  goback() {
    this.rtr.navigate(['main', 'process', this.currentProcessID, 'home', 'tasks']);
  }

  /**
   * Navigate to a settings tab of process
   * @param page 
   */
  moveToSettings(page) {
    this.router.navigate(['main', 'process', this.currentProcessID, page]);
  }

  /**
   * Logout user if not valid
   */
  checkcurrentloogedinUser() {
    try {
      this.currentLoggedInUser = JSON.parse(window.localStorage['User']);

      if (this.currentLoggedInUser != null)
        return true
      else {
        this.rapidflowService.loggedOut=window.location.href;
        this.rtr.navigate(['login']);
      }
    } catch (e) {
      // No content response..

      this.rapidflowService.loggedOut=window.location.href;
      this.rtr.navigate(['login']);
    }

  }

  /**
   * Retrieve process global settings and set alert display string
   */
  setGlobalProcessSettings() {
    var timeintervalGlobalSettings = setInterval(() => {
      if (this.ProcessDataService.processGlobalSettings != undefined && this.ProcessDataService.processGlobalSettings != null) {
        this.globalProcessSettings = this.ProcessDataService.processGlobalSettings[0];
        //if alert object not empty
        if (JSON.stringify(this.globalProcessSettings.Process_Settings.PROCESS_ALERT) != "{}") {
          this.alertDisplayString = "";
          this.alertDisplayString += this.globalProcessSettings.Process_Settings.PROCESS_ALERT.AlertText;
          this.alertDisplayString += "<br/>Expiry Date: " + this.getFormattedDate(this.globalProcessSettings.Process_Settings.PROCESS_ALERT.ExpiryDate, 'datetime') + " ( UTC " + this.globalProcessSettings.Process_Settings.PROCESS_TIMEZONE + " )";
          this.processAlertChecked = true;
          
        }
      }
      this.checkAdmin();
      this.generalSettingsRendering++;
      clearInterval(timeintervalGlobalSettings);
      return;
    }, 1000);
  }


  /**
   * Retrieve user process settings and set email notifications toggle, out of office string, proxy approver string and permissions list
   */
  setUserProcessSettings() {
    try {
      var timeintervalUserSettings = setInterval(() => {
        if (this.ProcessDataService.userProcessSettings != undefined && this.ProcessDataService.userProcessSettings != null) {
          let userProcessSettings = this.ProcessDataService.userProcessSettings[0];
          let supportOperationsGroup = userProcessSettings.Support_Operations_Group
          for (var i = 0; i < supportOperationsGroup.length; i++) {
            if (supportOperationsGroup[i].Email.toLowerCase() == this.currentLoggedInUser.Email.toLowerCase()) {
              this.currentUserIsSupportPerson = true;//this means user has user administration permission
              break;
            }
          }
          //set email notification based on value retrieved from process data service
          if (typeof userProcessSettings["Email_Notification"] != "undefined") {
            if (userProcessSettings["Email_Notification"]["Allow"].toLowerCase() == "true") {
              this.emailNotificationsChecked = true;
            }
            else {
              this.emailNotificationsChecked = false;
            }
          }
          else {
            this.emailNotificationsChecked = false;
          }
          //set out of office based on value retrieved from process data service
          if (typeof userProcessSettings["Out_of_Office"] != "undefined") {
            this.outOfOfficeDetails = userProcessSettings["Out_of_Office"];
            if (this.outOfOfficeDetails["Delegated_To"] != undefined) {
              this.outOfOfficeChecked = true;
            }
            else {
              this.outOfOfficeChecked = false;
            }
          }
          //set proxy approver based on value retrieved from process data service
          if (typeof userProcessSettings["Proxy_Approver"] != "undefined") {
            this.proxyApproverDetails = userProcessSettings["Proxy_Approver"];
            if (this.proxyApproverDetails["DisplayName"] != undefined) {
              this.proxyApproverChecked = true;
            }
            else {
              this.proxyApproverChecked = false;
            }
          }
          //set help link  based on value retrieved from process data service
          if (typeof userProcessSettings["HelpLink"] != "undefined") {
            this.helpLink = userProcessSettings["HelpLink"];
          }
          else {
            this.helpLink = "";
          }

          //set permissions  based on value retrieved from process data service
          if (typeof userProcessSettings["Process_User_Permissions"] != "undefined") {
            this.permissions = userProcessSettings["Process_User_Permissions"];
            this.generatePermissionViewJSON();
          }
          else {
            this.permissions = "";
          }
          this.generalSettingsRendering++;
          clearInterval(timeintervalUserSettings);
          return;
        }
      }, 1000)
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("setUserProcessSettings-process general settings component", "Platform", ex.message, ex.stack, "An error occured while setting process settings", "", this.currentProcessID, true);
    }
  }
  /**
    * open out of office dialog and pass current out of office information
    */
  outOfOfficeDialog() {
    try {

      if (this.outOfOfficeChecked == false) {
        //unset out of office if not toggled off
        this.rapidflowService.updateUserApplicationSettings("ProcessSettings", this.currentProcessID, "Out_Of_Office", "{}", this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
          this.ProcessDataService.userProcessSettings[0]["Out_of_Office"] = {};
        }, (error) => {
          this.dialog.closeAll()
          this.rapidflowService.ShowErrorMessage("ProcessSettings process setting component", "Platform", "Error occured while executing api call", error, "An error occured retreiving ProcessSettings", " rapidflowService.ProcessSettings", this.currentProcessID, true);
        });
      }
      else {
        //render dialog
        let dialogRef = this.dialog.open(OutOfOfficeDialogComponent, {
          width: '492px',
          height: 'auto',
          data: {}
        });
        dialogRef.afterClosed().subscribe(result => {
          if (typeof result != "undefined") {
            if (typeof result["Delegated_To"] != "undefined") {
              //set out of office details returned of dialog
              this.outOfOfficeChecked == true;
              this.outOfOfficeDetails["Delegated_To"] = result["Delegated_To"][0];
              this.outOfOfficeDetails["Start_Date"] = new Date(result["Start_Date"].getTime() - (result["Start_Date"].getTimezoneOffset() * 60000)).toISOString();
              this.outOfOfficeDetails["End_Date"] = new Date(result["End_Date"].getTime() - (result["End_Date"].getTimezoneOffset() * 60000)).toISOString();
              this.rapidflowService.updateUserApplicationSettings("ProcessSettings", this.currentProcessID, "Out_Of_Office", JSON.stringify(this.outOfOfficeDetails), this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
                if (this.rapidflowService.parseRapidflowJSON(response).toLowerCase() == "true") {
                  this.outOfOfficeChecked = true;
                }
                else {
                  //set out of office to false if nothing returned from dialog
                  this.outOfOfficeChecked = false;
                }
                let userpermissions = this.rapidflowService.retrieveUserProcessSettings(this.currentProcessID)
                  .subscribe((response) => {
                    this.ProcessDataService.userProcessSettings = this.rapidflowService.parseRapidflowJSON(response)
                  }, (error: any) => {

                    this.rapidflowService.ShowErrorMessage("retrieveUserProcessSettings process setting component", "Platform", "Error occured while executing api call", error, "An error occured while retrieve", " rapidflowService.retrieveUserProcessSettings", this.currentProcessID, true);

                  });
              }, (error) => {
                this.dialog.closeAll()
                this.rapidflowService.ShowErrorMessage("updateUserProcessSettings process setting component", "Platform", "Error occured while executing api call", error, "An error occured while updateUserProcessSettings", " rapidflowService.updateUserApplicationSettings", this.currentProcessID, true);
              });
            }
            else {
              this.outOfOfficeChecked = false;
            }
          }
          else {
            this.outOfOfficeChecked = false;
          }
        });
      }
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("outOfOfficeDialog-process general settings component", "Platform", ex.message, ex.stack, "An error occured while setting out of office settings", " ", this.currentProcessID, true);
    }
  }
  /**
    * Open proxy approver dialog and pass current proxy approver settings
    */
  proxyApproverDialog() {
    try {
      if (this.proxyApproverChecked == false) {
        this.rapidflowService.updateUserApplicationSettings("ProcessSettings", this.currentProcessID, "Proxy_Approver", "{}", this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
          this.ProcessDataService.userProcessSettings[0]["Proxy_Approver"] = {};
        }, (error) => {
          this.dialog.closeAll()
          this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings process setting component", "Platform", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " rapidflowService.updateUserApplicationSettings", this.currentProcessID, true);
        });
      }
      else {
        let dialogRef = this.dialog.open(ProxyApproverDialogComponent, {
          width: '400px',
          height: 'auto',
          data: {}
        });
        dialogRef.afterClosed().subscribe(result => {
          if (typeof result != "undefined" && result.length > 0) {
            if (typeof result[0]["DisplayName"] != "undefined") {
              //set proxy approver returned from dialog
              this.proxyApproverChecked == true;
              this.proxyApproverDetails = result[0];
              this.rapidflowService.updateUserApplicationSettings("ProcessSettings", this.currentProcessID, "Proxy_Approver", JSON.stringify(this.proxyApproverDetails), this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
                if (this.rapidflowService.parseRapidflowJSON(response).toLowerCase() == "true") {
                  this.proxyApproverChecked = true;
                }
                else {
                  //proxy approver not returned
                  this.proxyApproverChecked = false;
                }
                let userpermissions = this.rapidflowService.retrieveUserProcessSettings(this.currentProcessID)
                  .subscribe((response) => {
                    this.ProcessDataService.userProcessSettings = this.rapidflowService.parseRapidflowJSON(response)
                  }, (error: any) => {

                    this.rapidflowService.ShowErrorMessage("retrieveUserProcessSettings process setting component", "Platform", "Error occured while executing api call", error, "An error occured while retrieve", " rapidflowService.retrieveUserProcessSettings", this.currentProcessID, true);

                  });
              }, (error) => {
                this.dialog.closeAll()
                this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings process setting component", "Platform", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " rapidflowService.updateUserApplicationSettings", this.currentProcessID, true);
              });
            }
            else {
              //proxy approver toggled off
              this.proxyApproverChecked = false;
            }
          }
          else {
            this.proxyApproverChecked = false;
          }
        });
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings process setting component", "Platform", "Error occured while updating proxy approver", error, error.stack, "N/A", this.currentProcessID, true);
    }
  }

  /**
   * Open process alert dialog to edit process alert
   */
  updateProcessAlert() {
    try {
      if (this.processAlertChecked) {
        //open dialog if checked
        let dialogRef: any;
        dialogRef = this.updateAlertDialog.open(SetAlertDialogComponent, {
          data: {
            CurrentProcessGlobalSettings: this.globalProcessSettings.Process_Settings,
            CurrentProcessID: this.currentProcessID
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            //set alert display string based on values returned from dialog
            this.ProcessDataService.processGlobalSettings[0].Process_Settings = result;
            this.globalProcessSettings.Process_Settings = result;
            this.alertDisplayString = "";
            this.alertDisplayString += this.globalProcessSettings.Process_Settings.PROCESS_ALERT.AlertText;
            this.alertDisplayString += "<br/>Expiry Date: " + this.getFormattedDate(this.globalProcessSettings.Process_Settings.PROCESS_ALERT.ExpiryDate, 'datetime');
            this.processAlertChecked = true;
          }
          else {
            //toggle off process alert
            this.processAlertChecked = false;
          }
        });
      }
      else {
        //remove alert api call
        let tempSettings = this.globalProcessSettings.Process_Settings;
        tempSettings.PROCESS_ALERT = {};
        this.rapidflowService.updateProcessGlobalSettings(this.currentProcessID, encodeURIComponent(JSON.stringify(tempSettings))).subscribe((response) => {
          this.ProcessDataService.processGlobalSettings[0].Process_Settings.DIAGNOSTIC_LOGGING = {};
          this.alertDisplayString = "N/A";
        });
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("updateProcessAlert process setting component", "Platform", "Error occured while updating process alert", error, error.stack, "N/A", this.currentProcessID, true);
    }
  }
  /**
   * Get formtted date or time for iso datetime string
   * @param dateStringISO 
   * @param type 
   */
  getFormattedDate(dateStringISO, type) {
    if (dateStringISO == "" || dateStringISO == undefined) {
      return "NA";
    }
    if (type == "datetime") {
      //if datetime
      return moment.utc(dateStringISO).format("DD-MMM-YYYY hh:mm A").toUpperCase();
    }
    else {
      //if date
      return moment.utc(dateStringISO).format("DD-MMM-YYYY").toUpperCase();
    }
  }

  /**
   * Generate permission view schema to show user his roles and permissions of those roles
   */
  generatePermissionViewJSON() {
    try {
      this.permissionViewJSON = [];
      var ItemTypes = [];
      var flags = [];
      var iter = 0;
      //getting unique roleids and rolenames
      for (var i = 0; i < this.permissions.length; i++) {
        if (flags[this.permissions[i].RoleName]) continue;
        if (this.permissions[i].PermissionName != "NA") {
          flags[this.permissions[i].RoleName] = true;
          this.permissionViewJSON[iter] = {};
          this.permissionViewJSON[iter].RoleName = this.permissions[i].RoleName;
          this.permissionViewJSON[iter].RoleID = this.permissions[i].RoleID;
          iter++;
        }
      }
      //get all unique item types
      flags = [];
      iter = 0;
      for (var i = 0; i < this.permissions.length; i++) {
        if (flags[this.permissions[i].ItemType]) continue;
        flags[this.permissions[i].ItemType] = true;
        ItemTypes[iter] = {}
        ItemTypes[iter].ItemType = this.permissions[i].ItemType;
        iter++;
      }


      //get distinct permissions 
      for (var i = 0; i < this.permissionViewJSON.length; i++) {
        this.permissionViewJSON[i].DistinctPermissionRows = [];
        for (var j = 0; j < this.permissions.length; j++) {
          if (this.permissionViewJSON[i].RoleID == this.permissions[j].RoleID) {
            this.permissionViewJSON[i].DistinctPermissionRows.push(this.permissions[j]);
          }
        }
      }
      //genarating permissions html;
      var PermissionVal = "";
      var itemsAdded = [];
      var itemTypeNamesToShow = {
        ProcessWorkflow: "Workflows",
        ProcessPivot: "Pivots",
        ProcessReport: "Reports",
        ProcessAddOn: "Add Ons",
        ProcessLookupObject: "Lookups",
        Process: "Process"
      }
      //generating permissions table for showing in dropdown
      for (var i = 0; i < this.permissionViewJSON.length; i++) {
        this.permissionViewJSON[i].Permission = ""
        var tempItemType = "";
        var hadPermissions = false;
        for (var j = 0; j < ItemTypes.length; j++) {
          if (ItemTypes[j].ItemType != '') {
            for (var k = 0; k < this.permissionViewJSON[i].DistinctPermissionRows.length; k++) {
              //new item type encountered
              if (ItemTypes[j].ItemType == this.permissionViewJSON[i].DistinctPermissionRows[k].ItemType) {
                if (tempItemType != ItemTypes[j].ItemType) {
                  this.permissionViewJSON[i].Permission += "<div style='background-color: #c7cece; border-radius: 4px;'><b style='margin-left:10px'>" + itemTypeNamesToShow[ItemTypes[j].ItemType] + "</b></div><br/>";
                  this.permissionViewJSON[i].Permission += "<table width='500px'>"
                  tempItemType = ItemTypes[j].ItemType;
                  hadPermissions = true;
                }
                //current item type finished
                if (k == 0 || (this.permissionViewJSON[i].DistinctPermissionRows[k].Name != this.permissionViewJSON[i].DistinctPermissionRows[k - 1].Name || this.permissionViewJSON[i].DistinctPermissionRows[k].ItemType != this.permissionViewJSON[i].DistinctPermissionRows[k - 1].ItemType)) {
                  if (k > 0) {
                    this.permissionViewJSON[i].Permission += "</td></tr></tr>";
                  }
                  this.permissionViewJSON[i].Permission += "<tr><td style='padding:5px;border-bottom:1px solid #d0cdcd;border-top:1px solid #d0cdcd' width='50%'>" + this.permissionViewJSON[i].DistinctPermissionRows[k].Name + "</td>";
                  this.permissionViewJSON[i].Permission += "<td style='padding:5px;border-bottom:1px solid #d0cdcd;border-top:1px solid #d0cdcd' width='50%'>" + this.permissionViewJSON[i].DistinctPermissionRows[k].PermissionName;
                }
                //combine items
                else {
                  if (this.permissionViewJSON[i].DistinctPermissionRows[k].ItemType == this.permissionViewJSON[i].DistinctPermissionRows[k - 1].ItemType) {
                    this.permissionViewJSON[i].Permission += ", " + this.permissionViewJSON[i].DistinctPermissionRows[k].PermissionName;
                  }
                }
              }
            }
            //any permission for current item type
            if (hadPermissions) {
              this.permissionViewJSON[i].Permission += "</table><br/>"
            }
          }
        }
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("generatePermissionViewJSON process setting component", "Platform", "Error occured while generating permissions view", error, error.stack, "N/A", this.currentProcessID, true);
    }
  }

  /**
   * Show permission dialog for a role
   * @param permission 
   * @param roleName 
   */
  showPermissionsDialog(permission: any, roleName: any) {
    let dialogRef = this.viewPermissionsDialog.open(ViewPermissionsDialogComponent, {
      width: '545px',
      height: '385px',
      data: { Permission: permission, RoleName: roleName }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  /**
   * Update user email notifications flag
   */
  updateEmailNotification() {
    try {
      if (this.emailNotificationsChecked == false) {
        let emailNotificationObj = {};
        //allow false if empty
        emailNotificationObj["Allow"] = "False";
        this.ProcessDataService.userProcessSettings[0]["Email_Notification"]["Allow"] = "False"
        this.rapidflowService.updateUserApplicationSettings("ProcessSettings", this.currentProcessID.toString(), "Email_Notification", JSON.stringify(emailNotificationObj), this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {

        }, (error) => {
          this.dialog.closeAll()
          this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings process setting component", "Platform", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " rapidflowService.updateUserApplicationSettings", this.currentProcessID, true);
        });
      }
      else {
        //allow true if set
        let emailNotificationObj = {};
        emailNotificationObj["Allow"] = "True";
        this.rapidflowService.updateUserApplicationSettings("ProcessSettings", this.currentProcessID.toString(), "Email_Notification", JSON.stringify(emailNotificationObj), this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
          emailNotificationObj["Allow"] = "True";
        }, (error) => {
          this.dialog.closeAll()
          this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings process setting component", "Platform", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " rapidflowService.updateUserApplicationSettings", this.currentProcessID, true);
        });
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings process setting component", "Platform", "Error occured while updating email notification", error, error.stack, "N/A", this.currentProcessID, true);
    }
  }

  checkAdmin(){
    if(this.currentLoggedInUser.Email.toLowerCase()==this.globalProcessSettings.Process_Admin.Email.toLowerCase())
    {
      this.currentUserIsAdmin=true;
    }
    if(this.currentLoggedInUser.Email.toLowerCase()==this.globalProcessSettings.Process_Owner.Email.toLowerCase())
    {
      this.currentUserIsOwner=true;
    }
  }

}

