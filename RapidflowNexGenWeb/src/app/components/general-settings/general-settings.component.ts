/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: GeneralSettingsComponent
Description: Provide functionality to render the user application settings.
Location: ./general-settings.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { OutOfOfficeDialogComponent } from './../out-of-office-dialog/out-of-office-dialog.component';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProxyApproverDialogComponent } from '../proxy-approver-dialog/proxy-approver-dialog.component';
import { RapidflowService } from '../../services/rapidflow.service';
import * as moment from 'moment';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ProcessDataService } from '../../services/process-data.service';



@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.css']
})
export class GeneralSettingsComponent implements OnInit {

  public currentLoggedInUser: any[];//current logged in user 
  public outOfOfficeDetails: any[];//application level out of office deatails 
  public outOfOfficeChecked: boolean;//out of office toggle model
  public proxyApproverDetails: any[];//applicaton level proxy approver details
  public proxyApproverChecked: boolean;//proxy approver toggle model
  public emailNotificationsChecked: boolean;//email notifications toggle model
  public helpLink: string;//help page url
  public currentUserDevices: any;//current logged in user devices
  public alertDisplayString = "N/A";//alert dispaly string default to N/A
  public generalSettingsRendering: number = 0;//general settings rendering number incremented by each type of settings loaded

  /**
   * Default constructor with dependency injection of all necessary objects and services 
   * @param rtr 
   * @param dialog 
   * @param rapidflowService 
   * @param confirmationDialog 
   * @param processDataService 
   */
  constructor(private rtr: Router,
    public dialog: MatDialog,
    private rapidflowService: RapidflowService, private confirmationDialog: MatDialog, private processDataService: ProcessDataService) {
    this.outOfOfficeDetails = [];
    this.proxyApproverDetails = [];
  }

  /**
* Component initialization lifecycle hook which retrieves current selected addon definition and data
*/
  ngOnInit() {
    this.checkcurrentloogedinUser();
    this.setUserApplicationSettings();
    this.setApplicationAlertString();
    this.setUserDevices();
    setTimeout(() => { this.generalSettingsRendering = 2; }, 7000)//auto hide loading if something goes wrong with the calls
  }

  /**
   * Logoff current user if not valid
   */
  checkcurrentloogedinUser() {
    try {
      this.currentLoggedInUser = JSON.parse(window.localStorage['User']);
      if (this.currentLoggedInUser != null)
      {
        return true
      }
        
      else {
        this.rapidflowService.loggedOut=window.location.href;
        
        this.rtr.navigate(['login']);
      }
    } catch (e) {
      this.rapidflowService.loggedOut=window.location.href;
      
      this.rtr.navigate(['login']);
    }

  }

  /**
   * Set application settings values using data retrieved from api calls
   */
  setUserApplicationSettings() {
    //retrieve current user applicaiton settings api call
    this.rapidflowService.retrieveUserApplicationSettings().subscribe(response => {
      try {
        let userApplicationSettings = this.rapidflowService.parseRapidflowJSON(response);
        //set email notificaitons toggle
        if (typeof userApplicationSettings["Email_Notification"] != "undefined") {
          if (userApplicationSettings["Email_Notification"]["Allow"].toLowerCase() == "true") {
            this.emailNotificationsChecked = true;
          }
          else {
            this.emailNotificationsChecked = false;
          }
        }
        else {
          this.emailNotificationsChecked = false;
        }

        //set out of office toggle and string
        if (typeof userApplicationSettings["Out_of_Office"] != "undefined") {
          this.outOfOfficeDetails = userApplicationSettings["Out_of_Office"];
          if (this.outOfOfficeDetails["Delegated_To"] != undefined) {
            this.outOfOfficeChecked = true;
          }
          else {
            this.outOfOfficeChecked = false;
          }
        }

        //set proxy approver toggle and string
        if (typeof userApplicationSettings["Proxy_Approver"] != "undefined") {
          this.proxyApproverDetails = userApplicationSettings["Proxy_Approver"];
          if (this.proxyApproverDetails["DisplayName"] != undefined) {
            this.proxyApproverChecked = true;
          }
          else {
            this.proxyApproverChecked = false;
          }
        }

        //set help link url
        if (typeof userApplicationSettings["HelpLink"] != "undefined") {
          this.helpLink = userApplicationSettings["HelpLink"];
        }
        else {
          this.helpLink = "";
        }
        //increment call number
        this.generalSettingsRendering++;
      }
      catch (ex) {
        this.rapidflowService.ShowErrorMessage("setUserApplicationSettings-general settings component", "Global", ex.message, ex.stack, "An error occured while setting application settings", " RapidflowServices.retrieveUserApplicationSettings", '0', true);
      }
    }, (error: any) => {
      this.rapidflowService.ShowErrorMessage("retrieveUserApplicationSettings-general settings component", "Global", "Error occured while executing api call", error, "An error occured while retrieveUserApplicationSettings", " RapidflowServices.retrieveUserApplicationSettings", '0', true);
    });
  }


  /**
   * Generate user devices table
   */
  setUserDevices() {
    this.rapidflowService.retrieveUserAndDevice("current").subscribe((response) => {
      try {
        let tempUserDevices = JSON.parse(response.json());
        this.currentUserDevices = tempUserDevices[0].UserDevices;
        this.setDevicesImagePaths();
      }
      catch (error) {
        this.rapidflowService.ShowErrorMessage("retrieveUserAndDevice-general settings component", "Global", "Error occured while executing api call", error, error.stack, "N/A", '0', true);
      }
    }, (error: any) => {
      this.rapidflowService.ShowErrorMessage("retrieveUserAndDevice-general settings component", "Global", "Error occured while executing api call", error, "An error occured while retrieveUserAndDevice", " RapidflowServices.retrieveUserAndDevice", '0', true);
    });
  }

  /**
   * Set devices image paths to view each device type images
   */
  setDevicesImagePaths() {
    try {
      for (let i = 0; i < this.currentUserDevices.length; i++) {
        if (this.currentUserDevices[i].DeviceType.toLowerCase() == "chrome") {
          this.currentUserDevices[i].ImagePath = "assets/images/top_level/application_settings/user_devices/chromeIcon.png";
        }
        else if (this.currentUserDevices[i].DeviceType.toLowerCase() == "ios") {
          this.currentUserDevices[i].ImagePath = "assets/images/top_level/application_settings/user_devices/iosIcon.png";
        }
        else if (this.currentUserDevices[i].DeviceType.toLowerCase() == "android") {
          this.currentUserDevices[i].ImagePath = "assets/images/top_level/application_settings/user_devices/androidIcon.png";
        }
        else if (this.currentUserDevices[i].DeviceType.toLowerCase() == "windows") {
          this.currentUserDevices[i].ImagePath = "assets/images/top_level/application_settings/user_devices/windowsIcon.png";
        }
        else if (this.currentUserDevices[i].DeviceType.toLowerCase() == "ie") {
          this.currentUserDevices[i].ImagePath = "assets/images/top_level/application_settings/user_devices/ieIcon.png";
        }
        else if (this.currentUserDevices[i].DeviceType.toLowerCase() == "safari") {
          this.currentUserDevices[i].ImagePath = "assets/images/top_level/application_settings/user_devices/safariIcon.png";
        }
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("setDevicesImagePaths-general settings component", "Global", "Error occured while setting image paths", error, error.stack, "N/A", '0', true);
    }
  }

  /**
   * Set application alert string and toggle
   */
  setApplicationAlertString() {
    try {
      //interval to keep trying getting current platform settings in case of refresh
      var timeinterval = setInterval(() => {
        if (this.processDataService.currentPlatformSettings.length > 0) {
          let tempSettings = this.processDataService.currentPlatformSettings;
          for (let i = 0; i < tempSettings.length; i++) {
            //set applicaiton alert string
            if (tempSettings[i].SettingName == "APPLICATION_ALERT" && JSON.stringify(tempSettings[i].Value) != "{}") {
              this.alertDisplayString = "";
              this.alertDisplayString += tempSettings[i].Value.AlertText;
              this.alertDisplayString += "<br/>Expiry Date: " + this.getFormattedDate(tempSettings[i].Value.ExpiryDate).toUpperCase() + " UTC";
            }

          }
        }
        //increment call number
        this.generalSettingsRendering++;
        clearInterval(timeinterval);
      }, 1000);
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("setApplicationAlertString-general settings component", "Global", "Error occured while setting application alert", error, error.stack, "N/A", '0', true);
    }
  }

  /**
   * Format iso string to requried format
   * @param dateStringISO 
   */
  getFormattedDate(dateStringISO) {
    return moment.utc(dateStringISO.toLocaleString()).format("DD-MMM-YYYY h:mm a")
  }

  /**
   * Log off selected device from devices table
   * @param deviceId 
   */
  logOffDevice(deviceId) {
    try {
      let userConfirmation = this.confirmationDialog.open(ConfirmationDialogComponent, {
        data: { title: 'Logging Out', message: "Are you sure you want to log out?" }
      });

      userConfirmation.afterClosed().subscribe(result => {
        if (result) {
          let currentUser = JSON.parse(window.localStorage["User"]);
          //deactivate selected device
          this.rapidflowService.updateUsersAndDevices(currentUser.UserID, deviceId, "DeactivateDevices").subscribe((response) => {
            this.ngOnInit();
          }, (error: any) => {
            this.rapidflowService.ShowErrorMessage("retrieveUserAndDevice-general settings component", "Global", "Error occured while executing api call", error, "An error occured while retrieveUserAndDevice", " RapidflowServices.retrieveUserAndDevice", '0', true);
          });
        }
      });
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("logOffDevice-general settings component", "Global", "Error occured while logging off user device", error, error.stack, "N/A", '0', true);
    }
  }

  /**
   * Set iso date string to required format
   * @param dateStringISO 
   * @param type 
   */
  setDateFormat(dateStringISO, type) {
    if (dateStringISO == "" || dateStringISO == undefined) {
      return "NA";
    }
    if (type == "datetime") {
      return moment.utc(dateStringISO).format("DD-MMM-YYYY hh:mm A").toUpperCase();
    }
    else {
      return moment.utc(dateStringISO).format("DD-MMM-YYYY").toUpperCase();
    }
  }

  /**
   * Logout user after confirmation
   */
  logout() {
    try {
      let userConfirmation = this.confirmationDialog.open(ConfirmationDialogComponent, {
        data: { title: 'Logging Out', message: 'Are you sure you want to log out?' }
      });
      userConfirmation.afterClosed().subscribe(result => {
        if (result) {
          //clear local storage and navigate to login page
          window.localStorage.clear();
          window.sessionStorage.clear();
            this.rapidflowService.loggedOut="";

          this.rtr.navigate(['login']);
        }
      });
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("logout-general settings component", "Global", "Error occured while logging out", error, error.stack, "N/A", '0', true);
    }
  }

  /**
   * open out of office dialog and pass current out of office information
   */
  outOfOfficeDialog() {
    try {
      if (this.outOfOfficeChecked == false) {
        //unset out of office if not toggled off
        this.rapidflowService.updateUserApplicationSettings("ApplicationSettings", "0", "Out_Of_Office", "{}", this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings-general settings component", "Global", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " RapidflowServices.updateUserApplicationSettings", '0', true);
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
              this.rapidflowService.updateUserApplicationSettings("ApplicationSettings", "0", "Out_Of_Office", JSON.stringify(this.outOfOfficeDetails), this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
                if (this.rapidflowService.parseRapidflowJSON(response).toLowerCase() == "true") {
                  this.outOfOfficeChecked = true;
                }
                else {
                  //set out of office to false if nothing returned from dialog
                  this.outOfOfficeChecked = false;
                }
              }, (error: any) => {
                this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings-general settings component", "Global", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " RapidflowServices.updateUserApplicationSettings", '0', true);
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
      this.rapidflowService.ShowErrorMessage("outOfOfficeDialog-general settings component", "Global", ex.message, ex.stack, "An error occured while setting out of office", " RapidflowServices.outOfOfficeDialog", '0', true);
    }
  }

  /**
   * Open proxy approver dialog and pass current proxy approver settings
   */
  proxyApproverDialog() {
    try {
      if (this.proxyApproverChecked == false) {
        this.rapidflowService.updateUserApplicationSettings("ApplicationSettings", "0", "Proxy_Approver", "{}", this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings-general settings component", "Global", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " RapidflowServices.updateUserApplicationSettings", '0', true);
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
              this.rapidflowService.updateUserApplicationSettings("ApplicationSettings", "0", "Proxy_Approver", JSON.stringify(this.proxyApproverDetails), this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
                if (this.rapidflowService.parseRapidflowJSON(response).toLowerCase() == "true") {
                  this.proxyApproverChecked = true;
                }
                else {
                  //proxy approver not returned
                  this.proxyApproverChecked = false;
                }
              }, (error: any) => {
                this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings-general settings component", "Global", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " RapidflowServices.updateUserApplicationSettings", '0', true);
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
      this.rapidflowService.ShowErrorMessage("proxyApproverDialog-general settings component", "Global", error.message, error.stack, "An error occured while setting proxy approver", "N/A", '0', true);
    }
  }


  /**
   * Update email notificaiton settings based on toggle change
   */
  updateEmailNotification() {
    try {
      if (this.emailNotificationsChecked == false) {
        //unset email notifications flag toggled off
        let emailNotificationObj = {};
        emailNotificationObj["Allow"] = "False";
        this.rapidflowService.updateUserApplicationSettings("ApplicationSettings", "0", "Email_Notification", JSON.stringify(emailNotificationObj), this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings-general settings component", "Global", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " RapidflowServices.updateUserApplicationSettings", '0', true);
        });
      }
      else {
        //set email notification flag if toggled on
        let emailNotificationObj = {};
        emailNotificationObj["Allow"] = "True";
        this.rapidflowService.updateUserApplicationSettings("ApplicationSettings", "0", "Email_Notification", JSON.stringify(emailNotificationObj), this.rapidflowService.getCurrentTimeStamp()).subscribe(response => {
        }, (error: any) => {
          this.rapidflowService.ShowErrorMessage("updateUserApplicationSettings-general settings component", "Global", "Error occured while executing api call", error, "An error occured while updateUserApplicationSettings", " RapidflowServices.updateUserApplicationSettings", '0', true);
        });
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("updateEmailNotification-general settings component", "Global", error.message, error.stack, "An error occured while setting email notification", "N/A", '0', true);
    }
  }
}
