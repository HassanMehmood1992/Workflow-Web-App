/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ApplicationSettingsComponent
Description: Provide functionality to read the platform setting from processData service. This view enables the composite views of application setting i.e Platform settings, Error logs, diagnostic log etc.
Location: ./application-settings.component.ts
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
import { ProcessDataService } from '../../services/process-data.service';
/**
  * component decorator
  */
@Component({
  selector: 'app-application-settings',
  templateUrl: './application-settings.component.html',
  styleUrls: ['./application-settings.component.css']
})
export class ApplicationSettingsComponent implements OnInit {
  urlNav: any;
  private currentLoggedInUser: any;//current logged in user object
  private platformSettingsSelected: boolean = false; //flag to indicate if current selected tab is platform settings based on which platform settings is shown to the user
  private currentUserIsPlatformAdministrator: boolean = false;//flag to show if current user is platform administrator
  public currentUserIsSupportPerson: boolean = false;//flg to show if current user is support person based of which settings tabs are shown or hidden
  /**
   * Default constructor with dependency injection of all necessary objects and services 
   * @param rtr 
   * @param processDataService 
   * @param dialog 
   * @param rapidflowService 
   */

  constructor(private rtr: Router, private processDataService: ProcessDataService,
    public dialog: MatDialog,
    private rapidflowService: RapidflowService) {
    this.rtr.events.subscribe((event) => {
      this.urlNav = event
      //check if current selected tab is platform settings to show edit button
      if (this.urlNav.url.indexOf('platform') != -1) {
        this.platformSettingsSelected = true;
      }
    });
  }

  /**
 * component initialization lifecycle hook. hides shows platform settings,users and devices, error logs and diagnostic log tabs based on user permission
 */
  ngOnInit() {
    try {
      let timeinterval = setInterval(() => {
        if (this.processDataService.currentPlatformSettings.length > 0) {
          let tempSettings = this.processDataService.currentPlatformSettings;
          for (let i = 0; i < tempSettings.length; i++) {

            if (tempSettings[i].SettingName == "PLATFORM_ADMINISTRATORS") {
              for (let j = 0; j < tempSettings[i].Value.length; j++) {
                //if current user is platform administrator show platform settings tab
                if (this.currentLoggedInUser.Email.toLowerCase() == tempSettings[i].Value[j].Email.toLowerCase()) {
                  this.currentUserIsPlatformAdministrator = true;
                }
              }
            }
            if (tempSettings[i].SettingName == "SUPPORT_OPERATIONS_GROUP") {
              for (let j = 0; j < tempSettings[i].Value.length; j++) {
                //if current user is support person show error log,dignostic logs and user devices tab
                if (this.currentLoggedInUser.Email.toLowerCase() == tempSettings[i].Value[j].Email.toLowerCase()) {
                  this.currentUserIsSupportPerson = true;
                }
              }
            }
          }
          clearInterval(timeinterval);
          return;
        }
      }, 1000);
      this.checkcurrentloggedinUser();
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("ngOnInit - Application-settings-component", "Global", "Error occured while rendering application-settings-component", error, error.stack, "N/A", "Platform", false);
    }
  }

  /**
 * logout current user if he/she is not authenticated
 */
  checkcurrentloggedinUser() {
    try {
      this.currentLoggedInUser = JSON.parse(window.localStorage['User']);
      if (this.currentLoggedInUser != null)
        return true
      else {
        this.rapidflowService.loggedOut=window.location.href;
        
        this.rtr.navigate(['login']);
      }
    } catch (e) {
      this.rapidflowService.loggedOut=window.location.href;
      
      this.rtr.navigate(['login']);
    }
  }
}
