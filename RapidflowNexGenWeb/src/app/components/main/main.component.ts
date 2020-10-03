
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: MainComponent
Description: Provide functionality to render the side navigation bar containing the favourite processes. This component also provide functionality to add or remove the process from favourites.
Location: ./main.component.ts
Author: Amir Hussain , Nabil shahid
Version: 1.0.0
Modification history: none
*/
import { Title } from '@angular/platform-browser';
import { EventEmiterService } from './../../services/event-emiters.service';
import { PendingAccessDialogComponent } from './pending-access-dialog/pending-access-dialog.component';
import { ProcessDataService } from './../../services/process-data.service';
import { EncryptionService } from './../../services/encryption.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatMenuModule, MatDialog } from '@angular/material';
import { MatToolbarModule } from '@angular/material';
import { MatSidenavModule } from '@angular/material';
import { MatIconModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { FormatdatePipe } from './../../pipes/formatdate.pipe';
import { BadgeCountPipe } from './../../pipes/badge-count.pipe';
import { FormControl } from '@angular/forms'
import { FilterArrayPipe } from './../../pipes/filter-array.pipe';

import { MatProgressBarModule, MatSidenav } from '@angular/material';
import { DecodeUriComponentPipe } from './../../pipes/decode-uri-component.pipe';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

declare var jquery: any;
declare var $: any;

/**
 * Component Decorator
 * 
 * @export
 * @class MainComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [ProcessDataService]
})
export class MainComponent implements OnInit {
  settingCount: boolean; // flag to show that setting up counts is in progress
  badgeCount: number; // Overall counts to show in application title
  alertMessage: any; //  contains the application alert message to show in side nav.
  alertfound: boolean; // falg to show the alert
  urlNav: any; //  store the current url as url type
  @ViewChild('sidenav') sidenav: MatSidenav; // for controlling the side navigation view
  sortAlphaNumeric: any; // object containing the key to sort the favourites
  sortdefault: any; // object containing the key to sort the favourites by default
  myProcessLoaded: boolean; // flag to show progress of process loading
  processes: any[]; // contains list of processes 
  searchOn: boolean; // flag to tuen on and off the search in favourites section
  noProcessesAvailable: boolean = false; // falg to show if there is no process availabale
  searchString: string = ""; // contain the search string to filter the processes.
  alphaSort: boolean = false; // flag to sort the processes by alpha numeric order.
  currentProcess: any[];// Contain the current processes if any process is selected
  favouritesOpen: boolean // flag to heighlight favourites icon 
  directoryOpen: boolean // flag to heighlight process directory icon 
  appSettingOpen: boolean // flag to heighlight app setting icon 
  processFound: boolean // flag to check if the current process id present in the url found in the processes retrieved from api call.
  pageNumber: number = 1;// number of scrollable pages retried from server.
  allProcessesLoaded: boolean = false; // flag to show if all the processes are retried
  rowsToReturn = 15; //  number of item to retireve in a single call
  dataIsFiltered: boolean = false; // falg to show if the data is fileterd
  moreProcessesLoading: boolean = false; // flag to show processes if the processes are loading
  currentProcessID: number = 0;// process id provided in url to retrieve in first call in case the url of specific process is refreshed.
  searchControl: FormControl;  // control to show in search input field in the view
  debounceTimeout: any; // to get the filtered processes on a certain time ut of input provided in search filter.
  refreshTimeout: any; //  to reload the process after a certain time out if the message is received to reload all the processes again.
  notificationCountInterval: any; // to update the process counts after a certain amount of time interval
  homePageDetailsInterval: any; // to update the processes after a certain amount of time interval
  platformSettingsInterval: any;//interval id to refresh platform settings
  retrieveHomepageSubscription:any;//subscription of retrievehomepage details api call
  previousProcessCount:number=0;//count of previously loaded processes
  processCountMismatch:boolean=false;
  localMismatch:boolean=false;
  processLoadedInterval:any;
  /**
   * Creates an instance of MainComponent.
   * @param {Title} titleService 
   * @param {EventEmiterService} eventEmiterService 
   * @param {ActivatedRoute} route 
   * @param {RapidflowService} rapidflowService 
   * @param {Router} router 
   * @param {ProcessDataService} processDataService 
   * @param {MatDialog} materialDialog 
   * @memberof MainComponent
   */
  constructor(private titleService: Title, private eventEmiterService: EventEmiterService, private route: ActivatedRoute, private rapidflowService: RapidflowService, private router: Router, private processDataService: ProcessDataService, private materialDialog: MatDialog) {
    this.hideInitLoader();
    this.searchControl = new FormControl();
    this.alertfound = false
    this.myProcessLoaded = false
    this.favouritesOpen = false
    this.directoryOpen = false
    this.appSettingOpen = false
    this.badgeCount = 0
    this.currentProcess = [];
    this.processFound = false
    this.currentProcess["ProcessID"] = '';
    this.searchOn = false;
    this.processes = [];
    this.settingCount = false
    this.sortdefault = { "Status": "asc", "MyProcessLastModifiedProcessOffset": "desc" };;
    this.sortAlphaNumeric = { "ProcessName": "asc" };
  }


  /**
   * Set the navigation details. If a process is opened then updates the header bar accordingly
   * 
   * @param {any} link 
   * @memberof MainComponent
   */
  setHeader(link) {
    try {
      // case if the directory is opened
      if (link == "directory") {
        this.directoryOpen = true
        this.favouritesOpen = false
        this.appSettingOpen = false
        this.router.navigate(['processDirectory'], { relativeTo: this.route });
         this.settitle()
      } else if (link == "favourites") {
        // case if the process is opened
        this.directoryOpen = false
        this.favouritesOpen = true
        this.appSettingOpen = false
        // case if  any processes is selected
         
        if (typeof this.currentProcess['ProcessID'] != "undefined" && this.currentProcess['ProcessID'] != "" && this.currentProcess['ProcessID'] != 0) {
          this.processDataService.sendHeaderDetails(this.currentProcess);
          this.processDataService.setUserPermissions(this.currentProcess['ProcessID']);
          this.sendCountsToProcess(this.currentProcess)
          this.router.navigate(['process', this.currentProcess['ProcessID'], 'home', 'tasks'], { relativeTo: this.route });
           
           this.settitle()
        } else {
          // case if no processes is selected
          for (let i = 0; i < this.processes.length; i++) {
            if (this.processes[i].Status != "Pending Access") {
              this.favouritesOpen = true
              this.processDataService.sendHeaderDetails(this.processes[i]);
              this.currentProcess = this.processes[i];
              this.processes[i].Active = true
              this.router.navigate(['process', this.processes[i].ProcessID, 'home', 'tasks'],{ relativeTo: this.route });
               this.processDataService.setUserPermissions(this.processes[i].ProcessID);
              this.settitle()
              break;
            }
          }
        }
      } else if (link == "appSettings") {
        // case if the application setting is opened
        this.directoryOpen = false
        this.favouritesOpen = false
        this.appSettingOpen = true
        this.router.navigate(['applicationSettings/general'], { relativeTo: this.route });
        this.settitle()
      }
    } catch (ex) {
      // set header details error handler
      this.rapidflowService.ShowErrorMessage("setHeader-Main component", "Platform", ex.message, ex.stack, "An error occured while setting header", "N/A", '0', true);
    }
  }

  /**
   * take decision on message received from event emitter service
   * 
   * @param {any} message 
   * @memberof MainComponent
   */
  checkmessage(message) {
    try {
      //if message is to update all processes counts
      if (message["Type"] == "AllCounts") {
        setTimeout(() => {
          this.setCounts(false);
        }, 3000)

      }
      else if(message["Type"]=="SetTabAndHeader")
      {
        this.favouritesOpen=false;
        this.appSettingOpen=false;
        this.directoryOpen=true;
      this.processDataService.sendHeaderDetails("directory");
      }
      else
        // case if the message is to update the notification count of certain process 
        if (message["Type"] == "NotificationCountCalculation") {
          for (var i = 0; i < this.processes.length; i++) {
            if (this.processes[i].ProcessID == message["Value"]["ProcessID"]) {
              this.processes[i].InboxCount = parseInt(this.processes[i].InboxCount) + parseInt(message["Value"]["Notification"])
              var CountObject = { "Type": "ProcessCount", Value: { "ProcessID": this.processes[i].ProcessID, "TasKCount": this.processes[i].TaskCount, "NotificationCount": this.processes[i].InboxCount } }
              this.eventEmiterService.changeMessage(CountObject)
            }
          }
          this.badgeCount = this.badgeCount + parseInt(message["Value"]["Notification"])
          this.settitle()
        }
        else
          //case if the mesage is to refresh the processes
          if (message["Type"] == "Referesh") {
            for (var property in message["Value"]) {
              if (message["Value"].hasOwnProperty('Process')) {
                this.refreshTimeout = setTimeout(() => {
                  this.pageNumber = 1;
                  window.localStorage["CurrentLoadedProcessIDs"] = "[]";
                  this.processes = [];
                   this.myProcessLoaded = false;
                   this.localMismatch=true;                  
                  this.getHomePageDetails();
                }, 1000);
              }
            }
          }
          else
            //if the message is toggle the side navigation bar containing the favourites
            if (message["Type"] == "ToggleSideNav") {
              for (var property in message["Value"]) {
                if (message["Value"].hasOwnProperty('toggle')) {
                  if (message["Value"]["toggle"]) {
                    this.sidenav.close();
                  }
                  else {
                    this.sidenav.open();
                  }
                }
              }
            }
    }
    catch (error) {
      // check message method error handler
      this.rapidflowService.ShowErrorMessage("checkmessage-Main component", "Platform", error.message, error.stack, "An error occured while updating process objects", "N/A", '0', true);
    }
  }

  /**
   * component initialization lifecycle hook
   * 
   * @memberof MainComponent
   */
  ngOnInit() {
    if (window.localStorage['User'] == undefined || window.localStorage['User'] == "") {
      this.materialDialog.closeAll();
      this.rapidflowService.loggedOut=window.location.href;
      
      this.router.navigate(["login"]);

    }
    // get process id if url contain process id
    if (this.route.children.length > 0) {
      let processParam = this.route.children[0].snapshot.params["ProcessID"]
      if (!isNaN(processParam)) {
        this.currentProcess['ProcessID'] = parseInt(processParam);
        this.currentProcessID = parseInt(processParam);
      }
    }
    // subscribe method of event emitter service to rceive the message broadcaseted by event emitter service
    this.eventEmiterService.currentMessage.subscribe(message => this.checkmessage(message))

    // retrieve the processes using api call
    this.setApplicatonObjects()

    // retrieving the notification count contineously after 15 seconds
    this.notificationCountInterval = setInterval(() => {
      this.setCounts(true);
    }, 15000);
   
    window.localStorage["CurrentLoadedProcessIDs"] = "[]";

  }


  /**
   * Method to refresh the processes. This method is called based on process task counts difference
   * 
   * @memberof MainComponent
   */
  RefereshProcessAndTasks() {
    var CountObject = { "Type": "Referesh", Value: { "Tasks": "true", "Submissions": "true" } }
    this.eventEmiterService.changeMessage(CountObject);
  }

  /**
   * Updates the badge counts and process counts.
   * 
   * @param {boolean} refreshed 
   * @memberof MainComponent
   */
  setCounts(refreshed: boolean) {
    try {
      if (this.settingCount == false) {
        this.badgeCount = 0
        this.settingCount = true
        // retrieves the notification counts via api call
        this.rapidflowService.retrieveNotificationCounts().subscribe((response) => {
          let result = JSON.parse(response.json())

          
          //refresh processes if count mismatch
          if(!this.localMismatch&&this.previousProcessCount!=0&&result.length!=this.previousProcessCount)
          {
            setTimeout(()=>{
              this.allProcessesLoaded = false;
              window.localStorage["CurrentLoadedProcessIDs"] = "[]";
              this.processes = [];
              this.pageNumber = 1;
              this.myProcessLoaded = false;
              this.processCountMismatch=true;
              this.getHomePageDetails();
            },1000)
          }
          //save process count
          this.previousProcessCount=result.length;
          this.localMismatch=false;
          // parsing the counts into int
          for (var i = 0; i < result.length; i++) {
            this.badgeCount += parseInt(result[i].TaskCount) + parseInt(result[i].InboxCount)
          }

          //  comparing the processes and process counts received above
          for (let i = 0; i < result.length; i++) {
            if (result[i] != undefined) {


              for (let j = 0; j < this.processes.length; j++) {
                if (this.processes[j].ProcessID == result[i].ProcessID) {
                  if (this.processes[j].ProcessID == this.currentProcess["ProcessID"]) {
                    if (this.currentProcess)
                      //this.CurrentProcess=this.processes[j];
                      if (refreshed && (this.processes[j].TaskCount != parseInt(result[i].TaskCount) || this.processes[j].InboxCount != parseInt(result[i].InboxCount))) {
                        this.RefereshProcessAndTasks();

                      }
                  }
                  this.processes[j]["TaskCount"] = parseInt(result[i].TaskCount);
                  this.processes[j]["InboxCount"] = parseInt(result[i].InboxCount);
                  // this.sendCountsToProcess(this.processes[j]);

                  if (this.processes[j].ProcessID == this.currentProcess["ProcessID"]) {
                    this.sendCountsToProcess(this.processes[j])
                  }



                }
              }

            }
          }
        },
        (ex)=> {
          // method set counts error handler
          
          this.rapidflowService.ShowErrorMessage("setCounts-Main component", "Platform", ex.message, ex.stack, "An error occured while executing api call", "N/A", '0', true);
        }
      );
        this.settitle();
        this.settingCount = false
      }
    } catch (ex) {
      // method set counts error handler
      this.rapidflowService.ShowErrorMessage("setCounts-Main component", "Platform", ex.message, ex.stack, "An error occured while updating process counts", "N/A", '0', true);
    }
  }

  /**
   * Method to update the page title based on current url opened and badge count calculated in setcounts method
   * 
   * @memberof MainComponent
   */
  settitle() {
    try {
      setTimeout(() => {
        var titleUpdated = false
        var processName = ""
        var currentProcessName = ""
        // set title based on process
        if (this.router.url.indexOf("/main/process/") != -1) {
          this.processLoadedInterval = setInterval(() => {
            if (this.myProcessLoaded && titleUpdated == false) {
              if (this.currentProcess['ProcessName'] == undefined) {
                processName = currentProcessName
                if (processName != undefined && this.badgeCount != undefined) {
                  if (this.badgeCount > 0) {
                    this.titleService.setTitle('(' + this.badgeCount + ') ' + processName + ' RapidFlow');
                  } else {
                    this.titleService.setTitle(processName + ' RapidFlow');
                  }
                }
                else {
                  this.titleService.setTitle('RapidFlow');
                }
              } else {
                processName = this.currentProcess['ProcessName'] + ' | '
                if (processName != undefined && this.badgeCount != undefined) {
                  if (this.badgeCount > 0) {
                    this.titleService.setTitle('(' + this.badgeCount + ') ' + processName + ' RapidFlow');
                  } else {
                    this.titleService.setTitle(processName + ' RapidFlow');
                  }
                }
                else {
                  this.titleService.setTitle('RapidFlow');
                }
              }


              titleUpdated = true
              clearInterval(this.processLoadedInterval);
            }
          }, 2000)

        }
        else
          // set title based on process Directory
          if (this.router.url.indexOf("/main/processDirectory") != -1) {
            processName = 'Process Directory | '
            if (processName != undefined && this.badgeCount != undefined) {
              if (this.badgeCount > 0) {
                this.titleService.setTitle('(' + this.badgeCount + ') ' + processName + ' RapidFlow');
              } else {
                this.titleService.setTitle(processName + ' RapidFlow');
              }
            }
            else {
              this.titleService.setTitle('RapidFlow');
            }
          }
          else // set title based on application setttings
            if (this.router.url.indexOf("/main/applicationSettings") != -1) {
              processName = 'Application Settings | '
              if (processName != undefined && this.badgeCount != undefined) {
                if (this.badgeCount > 0) {
                  this.titleService.setTitle('(' + this.badgeCount + ') ' + processName + ' RapidFlow');
                } else {
                  this.titleService.setTitle(processName + ' RapidFlow');
                }
              }
              else {
                this.titleService.setTitle('RapidFlow');
              }
            }


      }, 2000)



    }
    catch (ex) {
      // set title method error handler
      this.rapidflowService.ShowErrorMessage("settitle-Main component", "Platform", ex.message, ex.stack, "An error occured while updating title", "N/A", '0', true);
    }
  }

  /**
   * Retrteives the processes using api call and checks if the process id is present in url then takes appropriate action on it.
   * 
   * @memberof MainComponent
   */
  setApplicatonObjects() {
    try {
      let validuser = this.rapidflowService.checkcurrentloogedinUser()
      if (validuser) {
        this.myProcessLoaded = false
        //case if the url is pointing towards process
        if (this.router.url.indexOf("/main/process/") != -1) {
          this.route.firstChild.paramMap
            .subscribe((params: ParamMap) => {
              this.directoryOpen = false
              this.favouritesOpen = true
              this.appSettingOpen = false
              this.currentProcess = []
              this.currentProcess["ProcessID"] = +params.get('ProcessID');
              if (this.currentProcess["ProcessID"] == 0) {
                this.currentProcess = []
              }
            });

        }
        //case if the url is pointing towards process directory
        if (this.router.url.indexOf("/main/processDirectory") != -1) {
          this.directoryOpen = true
          this.favouritesOpen = false
          this.appSettingOpen = false
        }
        //case if the url is pointing towards application setting
        if (this.router.url.indexOf("/main/applicationSettings") != -1) {
          this.directoryOpen = false
          this.favouritesOpen = false
          this.appSettingOpen = true
        }

        this.retrievePlatformSettings();
        this.platformSettingsInterval = setInterval(() => {
          this.retrievePlatformSettings()
        }, 300000)

        // Retreiving processes
        this.getHomePageDetails();

        this.homePageDetailsInterval = setInterval(() => {
          this.allProcessesLoaded = false;
          window.localStorage["CurrentLoadedProcessIDs"] = "[]";
          this.processes = [];
          this.pageNumber = 1;
          this.myProcessLoaded = false;
          this.getHomePageDetails();
        }, 900000)
      }

    } catch (ex) {
      // set Application Object method error handler
      this.rapidflowService.ShowErrorMessage("setApplicatonObjects-Main component", "Platform", ex.message, ex.stack, "An error occured while setting details of process", "N/A", '0', true);
    }
  }

  /**
   * Method to retrieve the processes based oninfinite scrolling and reloading or in case of refresh.
   * 
   * @memberof MainComponent
   */
  getHomePageDetails() {
    try {

      // checking sorting activated or filter is activated to pass in retrieval api call.
      let tempSortString = "";
      if (this.alphaSort) {
        tempSortString = "alphabetical"
      }
      if (this.searchString != "") {
        this.dataIsFiltered = true;
      }
      else {
        this.dataIsFiltered = false;
      }
      if (this.pageNumber > 1 || this.searchString != "") {
        this.currentProcessID = 0;
      }

if(this.retrieveHomepageSubscription)
{
  this.retrieveHomepageSubscription.unsubscribe();
}
      // calling api to retrieve all the processes.
    this.retrieveHomepageSubscription = this.rapidflowService.retrieveHomePageDetails(this.rowsToReturn, this.pageNumber, this.searchString, tempSortString, this.currentProcessID)
        .subscribe((response) => {
          try {
            this.myProcessLoaded = true
            let tempProcesses = this.rapidflowService.parseRapidflowJSON(response);
            if(window.localStorage.length===0)
            {
              return;
            }
            if (tempProcesses.length < this.rowsToReturn) {
              this.allProcessesLoaded = true;
            }

            // adding new processes with the processes loaded earlier.
            if(window.localStorage["CurrentLoadedProcessIDs"]==undefined)
            {
              window.localStorage["CurrentLoadedProcessIDs"]="[]";
            }
            let currentLoadedProcessIDs = JSON.parse(window.localStorage["CurrentLoadedProcessIDs"]);
            for (let i = 0; i < tempProcesses.length; i++) {
              let processIndex = this.processes.map(function (d) { return d['ProcessID']; }).indexOf(tempProcesses[i].ProcessID)
              if (processIndex == -1||true) {
                this.processes.push(tempProcesses[i]);
                if(tempProcesses[i].Status=="Active")
                {
                  currentLoadedProcessIDs.push(tempProcesses[i].ProcessID);
                }
                

              }
            }
            window.localStorage["CurrentLoadedProcessIDs"] = JSON.stringify(currentLoadedProcessIDs);
            this.moreProcessesLoading = false;
            if (!this.dataIsFiltered && this.processes.length == 0) {
              this.noProcessesAvailable = true;
              this.setHeader("directory");
              return;
            }
            else {
              this.noProcessesAvailable = false;
            }
            this.processFound = false
            RapidflowService.userProcesses = this.processes;
            
           
            if(this.processCountMismatch)
            {
              // this.processCountMismatch=false;        
              // let processParam = this.route.children[0].snapshot.params["ProcessID"]                   
              //   if(currentLoadedProcessIDs.length>0&&currentLoadedProcessIDs.indexOf(processParam.toString())==-1)
              //   {                  
              //      // this.router.navigate(['main','processDirectory']);                  
              //   }
              
              return;
            }
            
            // Oepning Default process if url pointed towards process page
            for (let i = 0; i < this.processes.length; i++) {
              if (this.processes[i].Status != "Pending Access") {
                if (this.router.url == "/main") {
                  this.favouritesOpen = true
                  this.processDataService.sendHeaderDetails(this.processes[i]);
                  this.currentProcess = this.processes[i];
                  this.processes[i].Active = true
                  this.sendCountsToProcess(this.processes[i])
                  this.router.navigate(['process', this.processes[0].ProcessID, 'home', 'tasks'], { relativeTo: this.route });
                  break;
                }
                else {
                  if (this.router.url.indexOf("/main/process/") != -1) {

                    if (this.currentProcess["ProcessID"] == this.processes[i].ProcessID) {
                      this.favouritesOpen = true
                      this.processes[i].Active = true
                      this.processDataService.sendHeaderDetails(this.processes[i]);
                      this.currentProcess = this.processes[i];
                      this.processFound = true;

                      this.sendCountsToProcess(this.processes[i])
                    }
                  } else {
                    this.processes[i].Active = false
                  }
                }
              } else {
                if (this.router.url.indexOf("/main/process/") != -1) {

                  if (this.currentProcess["ProcessID"] == this.processes[i].ProcessID) {
                    this.materialDialog.closeAll();
                    this.openPendingAccessDialog(this.processes[i])
                    this.processFound = true;
                    this.router.navigate(['main', 'processDirectory']);
                  }
                }
               }
              
               //this.currentProcess = this.processes[i];
               
              // if the process id present in the url and that did not found in process retrieved.
              if (!this.dataIsFiltered && i == (this.processes.length - 1) && this.processFound == false && this.currentProcess["ProcessID"] != undefined && this.currentProcess["ProcessID"] != null && this.currentProcess["ProcessID"] != "") {
                this.rapidflowService.validateProcessForUser(this.currentProcess["ProcessID"]).subscribe((response) => {
                  let result = JSON.parse(response.json());
                  if (result.Status == "NoPermission") {
                    this.materialDialog.closeAll();
                    this.router.navigate(['main', 'processDirectory'], { queryParams: { processID: this.currentProcess["ProcessID"] }, queryParamsHandling: 'merge' });
                  }
                  if (result.Status == "Subscribed") {
                    this.allProcessesLoaded = false;
                    window.localStorage["CurrentLoadedProcessIDs"] = "[]";
                    this.processes = [];
                    this.pageNumber = 1;
                    this.myProcessLoaded = false;
                    this.getHomePageDetails();
                  }
                });
              }
            }
            // if the process id present in the url and there are not process subscribed for that user
            if (!this.dataIsFiltered && this.processes.length == 0 && this.processFound == false && this.currentProcess["ProcessID"] != undefined && this.currentProcess["ProcessID"] != null && this.currentProcess["ProcessID"] != "" && this.rapidflowService.checkcurrentloogedinUser()) {
              this.rapidflowService.validateProcessForUser(this.currentProcess["ProcessID"]).subscribe((response) => {
                let result = JSON.parse(response.json());
                if (result.Status == "NoPermission") {
                  this.materialDialog.closeAll();
                  this.router.navigate(['main', 'processDirectory'], { queryParams: { processID: this.currentProcess["ProcessID"] }, queryParamsHandling: 'merge' });
                }
                if (result.Status == "Subscribed") {
                  this.allProcessesLoaded = false;
                  window.localStorage["CurrentLoadedProcessIDs"] = "[]";
                  this.processes = [];
                  this.pageNumber = 1;
                  this.myProcessLoaded = false;
                  this.getHomePageDetails();
                }
              });
            }
            //setting the counts for processes
            this.setCounts(false)
            //heightlighting the process currently open
            this.setProcessHeighlighted()
            // toggling the side navigation bar
            window.dispatchEvent(new Event('resize'));
          }
          catch (error) {

            // Method set application objects error handler
            this.rapidflowService.ShowErrorMessage("setApplicatonObjects-Main component", "Platform", error.message, error.stack, "An error occured while setting home page details", "N/A", '0', true);
          }
        }, (error: any) => {
          // retrieve all processes api error handler
          this.rapidflowService.ShowErrorMessage("retrieveAllProcessesWCF-Main component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveAllProcesses", " RapidflowServices.retrieveAllProcesses", '0', false);
        })
    }
    catch (error) {
      //  get hopme page details method error handler
      this.rapidflowService.ShowErrorMessage("getHomePageDetails-Main component", "Platform", error.message, error.stack, "An error occured while setting home page details", "N/A", '0', true);
    }
  }

  retrievePlatformSettings() {
    // retrieving the platform setting using api
    this.rapidflowService.retrievePlatformSettings().subscribe((response) => {

      try {
        let tempSettings = response.json();
        tempSettings = tempSettings.replace(/\\/g, "\\\\")
        tempSettings = tempSettings.replace(/\n/g, "");
        tempSettings = tempSettings.replace(/\r/g, "");

        this.processDataService.currentPlatformSettings = JSON.parse(tempSettings);

        this.alertfound = false
        // checking application alert and its expiry date if found
        for (var i = 0; i < this.processDataService.currentPlatformSettings.length; i++) {
          if (this.processDataService.currentPlatformSettings[i].SettingName == "APPLICATION_ALERT" && JSON.stringify(this.processDataService.currentPlatformSettings[i].Value) != "{}") {



            let expiryDate = this.processDataService.currentPlatformSettings[i].Value.ExpiryDate;

            //apply alert based on alert object
            if (this.processDataService.currentPlatformSettings[i].Value) {
              this.alertMessage = this.processDataService.currentPlatformSettings[i].Value.AlertText

              expiryDate = moment.utc(expiryDate).format('DD-MMM-YYYY hh:mm A');
              let thisDate = moment.utc().format('DD-MMM-YYYY hh:mm A');
              if (Date.parse(expiryDate) > Date.parse(thisDate)) {
                if (this.processDataService.currentPlatformSettings[i].Value.AlertText.length > 0) {
                  this.alertMessage = this.processDataService.currentPlatformSettings[i].Value.AlertText
                  this.alertfound = true;
                }
              }
            }
          }

          else if (this.processDataService.currentPlatformSettings[i].SettingName == "DIAGNOSTIC_LOGGING") {

            this.rapidflowService.diagnosticLoggingApplicationFlag = this.rapidflowService.getDiagnosticLoggingFlag(this.processDataService.currentPlatformSettings[i].Value)
          }
        }
      } catch (ex) {
        //Retrieve platform setting api error handler
        this.rapidflowService.ShowErrorMessage("setApplicatonObjects-retrievePlatformSettings-Main component", "Platform", ex.message, ex.stack, "An error occured while extracting platform settings", "N/A", '0', true);
      }
    });
  }

  /**
   * Navigating to selected process page and updating the header details and necessary objects
   * 
   * @param {any} process 
   * @param {any} index 
   * @memberof MainComponent
   */
  movetoProcess(process, index) {
    try {
      if (process.Status == "Active") {
        this.directoryOpen = false
        this.favouritesOpen = true
        this.appSettingOpen = false
        this.currentProcess = process;
        this.processes[index].Active = true
        this.processDataService.sendHeaderDetails(process)
        for (var i = 0; i < this.processes.length; i++) {
          if (i != index) {
            this.processes[i].Active = false
          }
        }

        // sending the counts object to process wrapper component to  show the indicator of the task and new notification if exists
        this.sendCountsToProcess(process)
        this.settitle()
        this.router.navigate(['process', process.ProcessID, 'home', 'tasks'], { relativeTo: this.route });
      } else {

        // oepning the access request details dialog
        this.openPendingAccessDialog(process)
      }
    } catch (ex) {
      // move to processes error handler
      this.rapidflowService.ShowErrorMessage("movetoProcess-Main component", "Platform", ex.message, ex.stack, "An error occured while navigating to process", "N/A", '0', true);
    }
  }

  /**
   * Sort Process method
   * 
   * @memberof MainComponent
   */
  sortProcesses() {
    try {
      this.allProcessesLoaded = false;
      window.localStorage["CurrentLoadedProcessIDs"] = "[]";
      this.processes = [];
      this.pageNumber = 1;
      this.myProcessLoaded = false;
      this.getHomePageDetails();

    } catch (ex) {
      // sort process method error handler
      this.rapidflowService.ShowErrorMessage("sortProcesses-Main component", "Platform", ex.message, ex.stack, "An error occured while sorting processes", "N/A", '0', true);
    }
  }

  /**
   * Method to share the process with respect to redirect url
   * 
   * @param {any} process 
   * @memberof MainComponent
   */
  shareProcess(process) {
    try {
      var body = 'Process link : ' + window.location.origin + window.location.pathname + '#/sharedurl/?route=process&processID=' + process.ProcessID + '\n'
      var mailtovairable = "mailto:user@example.com?subject=Share the process with Process ID " + process.ProcessID + " &body=" + encodeURIComponent(body);
      window.location.href = mailtovairable
    } catch (ex) {
      // Method error handler
      this.rapidflowService.ShowErrorMessage("shareProcess-Main component", "Platform", ex.message, ex.stack, "An error occured while sharing process", "N/A", '0', true);
    }
  }

  /**
   * Method to configure the access request detail dialog
   * 
   * @param {any} process 
   * @memberof MainComponent
   */
  openPendingAccessDialog(process): void {
    try {
      let dialogRef = this.materialDialog.open(PendingAccessDialogComponent, {
        width: '400px',
        height: '200px',
        data: { PendingAccess: process }
      });

      dialogRef.afterClosed().subscribe(result => {


      });
    } catch (ex) {
      // DIALOG ERROR HANDLER
      this.rapidflowService.ShowErrorMessage("openPendingAccessDialog-Main component", "Platform", ex.message, ex.stack, "An error occured while opening pending access dialog", "N/A", '0', true);
    }
  }

  /**
   * Method to remove process from favourites using unsubscribe api call
   * 
   * @param {any} process 
   * @memberof MainComponent
   */
  removeProcessFromFavorites(process) {
    try {
      let dialogRef = this.materialDialog.open(ProgressDialogComponent, {
        data: {
          message: "Removing process…",
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.materialDialog.closeAll();
      });
      this.rapidflowService.unsubscribeProcess(process.ProcessID).subscribe((response) => {
        let result = this.rapidflowService.parseRapidflowJSON(response);
        if (typeof result.Status != "undefined") {
          // if the result return true which means that process is removed. then that process is sliced from the processes
          if (result.Status.toLowerCase() == "true") {
            this.materialDialog.closeAll();
            for (var i = 0; i < this.processes.length; i++) {
              if (this.processes[i].ProcessID == process.ProcessID) {
                this.processes.splice(i, 1);
                this.previousProcessCount--;

                // if remaining processes are greater then 0 
                if (this.processes.length > 0) {
                  this.currentProcess = this.processes[0];
                  this.unheighlightProcess()
                  this.processes[0].Active = true
                  this.setHeader("favourites")
                } else {
                  this.noProcessesAvailable = true;
                  if (this.router.url.indexOf('processDirectory') == -1) {
                    this.setHeader("directory")
                  }
                  else {
                    window.location.reload();
                  }
                }
                break;
              }
            }
          }
          else {
            //alert("Failure During Process UnSubscribtion!");
            this.materialDialog.closeAll();
          }
        }
        else {
          //alert("Failure During Process UnSubscribtion!");
          this.materialDialog.closeAll();
        }
      });
    } catch (ex) {
      // remove process method error handler
      this.rapidflowService.ShowErrorMessage("removeProcessFromFavorites-Main component", "Platform", ex.message, ex.stack, "An error occured while removing process from favourites", "N/A", '0', true);
    }
  }

  /**
   * If the process is not selected the call removal of process heighlight feature
   * 
   * @memberof MainComponent
   */
  setProcessHeighlighted() {
    try {
      this.router.events.subscribe((event) => {
        this.urlNav = event
        if (this.urlNav.url.indexOf('main/process/') == -1) {
          this.unheighlightProcess()
        }
      });
    } catch (ex) {

      this.rapidflowService.ShowErrorMessage("setProcessHeighlighted-Main component", "Platform", ex.message, ex.stack, "An error occured while highlighting active process", "N/A", '0', true);
    }
  }

  /**
   * Mark all the processes as unheighlighted
   * 
   * @memberof MainComponent
   */
  unheighlightProcess() {
    for (var i = 0; i < this.processes.length; i++) {
      this.processes[i].Active = false
    }
  }

  /**
   * Method to pass the counts to proccess wrapper via event emitter service
   * 
   * @param {any} process 
   * @memberof MainComponent
   */
  sendCountsToProcess(process) {
    try {
      var CountObject = { "Type": "ProcessCount", Value: { "ProcessID": process.ProcessID, "TasKCount": process.TaskCount, "NotificationCount": process.InboxCount } }
      this.eventEmiterService.changeMessage(CountObject)
    } catch (ex) {

      this.rapidflowService.ShowErrorMessage("uploadBulkEntries-Main component", "Platform", ex.message, ex.stack, "An error occured while importing the file", "N/A", '0', true);
    }
  }

  /**
   * Retrieve the remaining processes when scrolled down untill all the processes are retrieved
   * 
   * @memberof MainComponent
   */
  OnFavoritesScrollDown() {
    this.pageNumber++;
    //this.pageNumber = Math.ceil(this.pageNumber);
    if (!this.allProcessesLoaded) {
      this.moreProcessesLoading = true;
      setTimeout(() => {
        this.getHomePageDetails();
      }, 1000);
    }
  }
  /**
    * Retrieve the processes filtered 
   * 
   * @memberof MainComponent
   */
  retrieveFilteredProcesses() {
    clearTimeout(this.debounceTimeout)
    this.debounceTimeout = setTimeout(() => {
      this.allProcessesLoaded = false;
      // window.localStorage["CurrentLoadedProcessIDs"] = "[]";
      this.processes = [];
      this.pageNumber = 1;
      this.myProcessLoaded = false;
      this.getHomePageDetails();
    }, 1000);
  }

  hideInitLoader(){
     
      document.getElementById("initLoader").style.display="none";
     
  }

  /**
   * Remove filter from processes
   * 
   * @memberof MainComponent
   */
  removeFilterCurrentSort() {
    if (this.dataIsFiltered) {
      this.sortProcesses();
    }
  }

  /**
   * Desctroying the variable used for interval 
   * 
   * @memberof MainComponent
   */
  ngOnDestroy() {
    clearInterval(this.notificationCountInterval);
    clearInterval(this.homePageDetailsInterval);
    clearInterval(this.platformSettingsInterval);
    clearInterval(this.processLoadedInterval);
    this.currentProcess=[];
     this.rapidflowService.diagnosticLoggingApplicationFlag = false;

  }
}


