/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessDataService
Description: Global service to store data related to form objects and form permissions. It also provide functionality to update the header details.
Location: ./services/process-form.service
Author: Amir, Nabil, Sheharyar
Version: 1.0.0
Modification history: none
*/

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { RapidflowService } from './rapidflow.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

/**
 * Service Decorator
 * 
 * @export
 * @class ProcessDataService
 */
@Injectable()
export class ProcessDataService {
  // Lists which are populated from process components and read in multiple components
  public reports: any;  // stores report list
  public pivots: any; // stores pivots list
  public addons: any; // stores addon list
  public workflows: any; // stores workflows
  public lookups: any; // stores lookup lists
  public userProcessSettings: any;// stores process user settings



  // other variables
  public currentPlatformSettings: any; // stores platform settings populated from main component
  public processGlobalSettings: any;// stores global settings populated from main component
   public object; // to store the data shared to header component
  public userPermissions; //stores user permissions
  public workflowsLoading:boolean=false;
  public objectsLoading:boolean=false;
  private subject = new Subject<any>(); // to receive the message and broadcast to observers

  /**
   * Creates an instance of ProcessDataService.
   * @param {RapidflowService} rapidflowService 
   * @param {ActivatedRoute} route 
   * @param {Router} router 
   * @memberof ProcessDataService
   */
  constructor(private rapidflowService: RapidflowService, private route: ActivatedRoute, private router: Router) {
     this.currentPlatformSettings = [];
    this.route.paramMap
      .subscribe((params: ParamMap) => {
        if (params.get('ProcessID') != undefined) {
          this.setUserPermissions(params.get('ProcessID'));
        }
      });

  }

  /**
   * Passes the header object to observer used in header component to update the header details
   * 
   * @param {Array<1>} headerObject 
   * @memberof ProcessDataService
   */
  sendHeaderDetails(headerObject: any) {
    // subject variable sending the updated message
    this.subject.next({ object: headerObject });
    this.object = headerObject;
    //updating the user permission on each message changed
    this.setUserPermissions(this.object.ProcessID);
  }
  /**
   * Method used as observe the subject variable. this function is used to header component to recevie the updated header details
   * 
   * @returns {Observable<any>} 
   * @memberof ProcessDataService
   */
  getHeaderDetails(): Observable<any> {
    return this.subject.asObservable();
  }

  /**
   * Update the user permission based on current process
   * 
   * @param {any} processId 
   * @memberof ProcessDataService
   */
  setUserPermissions(processId) {
    if (processId != undefined) {
      //calling api to receive the permission of current looged in user
      let userPermissionsCall = this.rapidflowService.retrieveUserProcessSettings(processId)
        .subscribe((response) => {
          this.userPermissions = JSON.parse(response.json())[0].Process_User_Permissions;
        }, (error: any) => {
          //user permission api error handler
          this.rapidflowService.ShowErrorMessage("getUserPermissions-Process Form service", "Platfrom", "Error occured while executing api call", error, "An error occured while getting user permissions", "RapidflowServices.retrieveUserProcessSettings", '0', true);
        });

    }

  }

}
