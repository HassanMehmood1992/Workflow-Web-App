/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessUserSettingComponent
Description: Conatins tabs to allow user to navigate to different sections of process settings.
Location: ./components/process-user-settings.component.ts
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

/**
 * Component decorator
 */
@Component({
  selector: 'app-process-user-setting',
  templateUrl: './process-user-setting.component.html',
  styleUrls: ['./process-user-setting.component.css']
})
export class ProcessUserSettingComponent implements OnInit {
  NavArray: any;

  private currentProcessID: number;//current selected process id
  private currentUserIsAdmin: boolean = false;//current user is process admin flag
  public currentUserIsSupportPerson: boolean = false;//current user is support person flag
  private currentUserPermissions: any;//current user permission object 
  private supportOperationsGroup: any;//current support operations group array

  /**
   * Default constructor with depency injection of router and services
   * @param rtr 
   * @param route 
   * @param ProcessDataService 
   * @param rapidflowService 
   */
  constructor(private rtr: Router,
    private route: ActivatedRoute,
    private ProcessDataService: ProcessDataService,
    public rapidflowService: RapidflowService

  ) {
  }

  /**
   * Component initilization lifecycle hook. show hides settings tabs based on user permissions
   */
  ngOnInit() {
    try {
      this.route.parent.params.subscribe(params => {
        this.currentProcessID = parseInt(params['ProcessID']);
        this.NavArray = [{ urlBack: ['main', 'process', this.currentProcessID, 'home', 'tasks'], urlImage: "", imagesrc: '', text: '' }]
        //retrieve user process settings from process data service
        var timeinterval = setInterval(() => {
          if (this.ProcessDataService.userProcessSettings != undefined && this.ProcessDataService.userProcessSettings != null) {
            this.currentUserPermissions = this.ProcessDataService.userProcessSettings[0].Process_User_Permissions;
            this.supportOperationsGroup = this.ProcessDataService.userProcessSettings[0].Support_Operations_Group;
            for (var i = 0; i < this.currentUserPermissions.length; i++) {
              if (this.currentUserPermissions[i].PermissionName == "User Administration") {
                this.currentUserIsAdmin = true;//this means user has user administration permission
                break;
              }
            }
            if(window.localStorage['User']==undefined)
            {        this.rapidflowService.loggedOut=window.location.href;
              
              this.rtr.navigate(['login']);
            }
            let currentUser = JSON.parse(window.localStorage['User']);
            for (var i = 0; i < this.supportOperationsGroup.length; i++) {
              if (this.supportOperationsGroup[i].Email.toLowerCase() == currentUser.Email.toLowerCase()) {
                this.currentUserIsSupportPerson = true;//this means user is in support operations group
                break;
              }
            }
            clearInterval(timeinterval);
            return;
          }
        }, 1000)
      });
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("ngOnInit process user settings component", "Platform", "Error occured while initializing process user settings component", error, error.stack, "N/A", this.currentProcessID, true);
    }
  }

  goback() {
    this.rtr.navigate(['main', 'process', this.currentProcessID, 'home', 'tasks']);
  }
}