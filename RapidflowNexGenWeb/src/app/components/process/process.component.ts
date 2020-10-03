/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/
/*
ModuleID: ProcessComponent
Description: Loads all necessary data of a process from the server when a user navigates to a process. Also shows alert message if available and valid.
Location: ./components/process.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { MatDialog } from '@angular/material';
import { ProcessFormService } from './../../services/process-form.service';
import { RapidflowService } from './../../services/rapidflow.service';
import { ProcessDataService } from './../../services/process-data.service';
import { Router, NavigationStart, ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit, Output } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
 

declare var jquery: any;//jquery var declaration
declare var $: any;//jquery var declaration

/**
 * component decorator
 * 
 * @export
 * @class ProcessComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css'],

  providers: [ProcessDataService]
})
export class ProcessComponent implements OnInit {
  Reload: boolean; // flag to reload the process context if process id is changed
  previousID: any; // contain the previous process id
  processId: any; // contain the current process id
  alertfound: boolean // flag to show alert message
  alertMessage: any // message to show in alert
  @Output() Reports: any // output the process reports to process data service
  @Output() Addons: any // output the process addons to process data service
  @Output() Pivots: any // output the process pivots to process data service
  @Output() Workflows: any // output the process workflows to process data service
  closed: boolean
  globalSettingsInterval: any;
  apiCallsSubscriptions:any={};
 
 

  /**
   * Creates an instance of ProcessComponent.
   * @param {MatDialog} materialDialog 
   * @param {Router} router 
   * @param {ActivatedRoute} route 
   * @param {RapidflowService} rapidflowService 
   * @param {ProcessDataService} processDataService 
   * @param {processFormService} processFormService 
   * @memberof ProcessComponent
   */
  constructor(private materialDialog: MatDialog, private router: Router, private route: ActivatedRoute, private rapidflowService: RapidflowService, private processDataService: ProcessDataService, private processFormService: ProcessFormService) {
    this.alertfound = false
    this.closed = false
  }

  /**
   * component initialization lifecycle hook
   * 
   * @memberof ProcessComponent
   */
  ngOnInit() {
    try {
      this.previousID = this.processId;
      this.Reload = true
      if (this.route.snapshot['_urlSegment'].segments[3] != undefined && this.route.snapshot['_urlSegment'].segments[3].path != "home") {
        this.Reload = false
      }
      this.route.paramMap.subscribe((params: ParamMap) => {
        
        
        this.closed = false
        this.alertfound = false
        // retriveing current process id
        this.processId = params.get('ProcessID');
        if(window.localStorage["CurrentLoadedProcessIDs"]!=undefined)
        {
          let currentLoadedProcessIDs=JSON.parse(window.localStorage["CurrentLoadedProcessIDs"])
          if(currentLoadedProcessIDs.length>0&&currentLoadedProcessIDs.indexOf(this.processId)==-1)
          {
            setTimeout(()=>{
              this.router.navigate(['main','processDirectory']);
            },1);
          }
        }
        
        

        // comparing the process id with previously process id to reload the process definitions
        if (this.processId == this.previousID) {

        } else {
          if (this.Reload) {
            this.reloadWithNewId(this.previousID);
          }
          this.previousID = this.processId
        }

        this.retrieveProcessGlobalSettings();
        clearInterval(this.globalSettingsInterval);        
        this.globalSettingsInterval = setInterval(() => { this.retrieveProcessGlobalSettings() }, 300000)
        // reseting the process object in process data service
        for(let key in this.apiCallsSubscriptions)
        {
          this.apiCallsSubscriptions[key].unsubscribe();
        }
        this.resetProcessObjects()


        //retrieving the process objects using api and updating in process data service
        this.processDataService.objectsLoading=true;
       this.apiCallsSubscriptions["Objects"]= this.rapidflowService.retrieveProcessObjectsWCF(this.processId)
          .subscribe((response) => {

            try {
              this.processDataService.objectsLoading=false;
              this.processDataService.reports = this.rapidflowService.parseRapidflowJSON(response).ProcessReports
              this.processDataService.pivots = this.rapidflowService.parseRapidflowJSON(response).ProcessPivots
              this.processDataService.addons = this.rapidflowService.parseRapidflowJSON(response).ProcessAddOns
             } catch (error) {
              this.processDataService.reports = []

              this.processDataService.pivots = []

              this.processDataService.addons = []
               //global process object definition handler error  
              this.rapidflowService.ShowErrorMessage("retrieveProcessObjectsWCF-Process component", "Process", "Error occured while executing api call", error, "An error occured while retrieveProcessObjectsWCF", " RapidflowServices.retrieveProcessObjectsWCF", this.processId, false);

            }
            //this.materialDialog.closeAll();
          }, (error: any) => {

            // setting default empty objects of process object in process data service
            this.processDataService.reports = []

            this.processDataService.pivots = []

            this.processDataService.addons = []
 
            //global process object retrieval api handler error  
            this.rapidflowService.ShowErrorMessage("retrieveProcessObjectsWCF-Process component", "Process", "Error occured while executing api call", error, "An error occured while retrieveProcessObjectsWCF", " RapidflowServices.retrieveProcessObjectsWCF", this.processId, false);


          });
        //retrieving the process workflows using api and updating in process data service
        this.processDataService.workflowsLoading=true;
        this.apiCallsSubscriptions["Workflows"]= this.rapidflowService.retrieveProcessWorkflowsWCF(this.processId)
          .subscribe((response) => {

            this.processDataService.workflowsLoading=false;
            this.processDataService.workflows = this.rapidflowService.parseRapidflowJSON(response)
            window.dispatchEvent(new Event('resize'));

          }, (error: any) => {
            this.processDataService.workflows = []

            //global process workflows retrieval api handler error  
            this.rapidflowService.ShowErrorMessage("retrieveProcessWorkflowsWCF-Process component", "Process", "Error occured while executing api call", error, "An error occured while retrieveProcessWorkflowsWCF", " RapidflowServices.retrieveProcessWorkflowsWCF", this.processId, false);


          });


          this.apiCallsSubscriptions["Permissions"]= this.rapidflowService.retrieveUserProcessSettings(this.processId)
          .subscribe((response) => {

            this.processDataService.userProcessSettings = this.rapidflowService.parseRapidflowJSON(response)
          }, (error: any) => {

            //user process settings retrieval api handler error  
           
            this.processDataService.userProcessSettings = []
            this.rapidflowService.ShowErrorMessage("retrieveUserProcessSettings-Process component", "Process", "Error occured while executing api call", error, "An error occured while retrieveUserProcessSettings", " RapidflowServices.retrieveUserProcessSettings", this.processId, false);
          });

      });


    } catch (error) {
      //process component initialization handler error  
      this.rapidflowService.ShowErrorMessage("ngOnInit-Process component", "Process", "Error occured while initating the process Component", error, "An error occured while ng-Init", " ngOnInit", this.processId, false);

    }

  }

  /**
   * to reset the process objects
   * 
   * @memberof ProcessComponent
   */
  resetProcessObjects() {
     this.processDataService.addons = []
    this.processDataService.reports = []
    this.processDataService.lookups = []
    this.processDataService.pivots = []
    this.processDataService.workflows = []
  }


  retrieveProcessGlobalSettings() {
    //retrieving the process global settings from api
    let processGlobalSettings = this.rapidflowService.retrieveGlobalProcessSettings(this.processId)
      .subscribe((response) => {

        this.processDataService.processGlobalSettings = this.rapidflowService.parseRapidflowJSON(response);
        try {

          // setting up the process alert if expiry date is greater then current date
            if(JSON.stringify(this.processDataService.processGlobalSettings["0"].Process_Settings.PROCESS_ALERT)!="{}")
            {
              let processOffset = this.processDataService.processGlobalSettings["0"].Process_Settings.PROCESS_TIMEZONE;
              let expiryDate = this.processDataService.processGlobalSettings["0"].Process_Settings.PROCESS_ALERT.ExpiryDate;
  
              //apply alert based on alert object
              if (this.processDataService.processGlobalSettings["0"].Process_Settings.PROCESS_ALERT) {
                                 this.alertMessage = this.processDataService.processGlobalSettings["0"].Process_Settings.PROCESS_ALERT.AlertText
  
                expiryDate = moment.utc(expiryDate).format('DD-MMM-YYYY hh:mm A');
                let thisDate = moment.utc().zone(processOffset).format('DD-MMM-YYYY hh:mm A');
  
                if (Date.parse(expiryDate) > Date.parse(thisDate)) {
                  if (this.processDataService.processGlobalSettings["0"].Process_Settings.PROCESS_ALERT.AlertText.length > 0) {
                    this.alertMessage = this.processDataService.processGlobalSettings["0"].Process_Settings.PROCESS_ALERT.AlertText                  
                      this.alertfound=true;
                    }
                  }
                }
            }
          
             


          

          this.rapidflowService.diagnosticLoggingProcessFlag = this.rapidflowService.getDiagnosticLoggingFlag(this.processDataService.processGlobalSettings["0"].Process_Settings.DIAGNOSTIC_LOGGING);

        } catch (error) {
          this.alertfound = false
        }

      }, (error: any) => {

        //global process retrieval api handler error  
        this.processDataService.processGlobalSettings = []
        this.rapidflowService.ShowErrorMessage("retrieveGlobalProcessSettings-Process component", "Process", "Error occured while executing api call", error, "An error occured while retrieveGlobalProcessSettings", " RapidflowServices.retrieveGlobalProcessSettings", this.processId, false);


      });
  }

  /**
   * reload the process definitions when page is refreshed or the other process is selected
   * 
   * @param {number} id 
   * @memberof ProcessComponent
   */
  reloadWithNewId(id: number) {

    $('.mat-tab-header-pagination').attr('style', 'display:auto')
    $('mat-ink-bar').hide()

    this.router.navigate(['main', 'process', this.processId, 'home', 'tasks']);
  }
  ngOnDestroy() {
    this.rapidflowService.diagnosticLoggingProcessFlag = false;
    clearInterval(this.globalSettingsInterval);
  }

}