/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: RapidflowService
Description: Class to perform all HTTP request operations called across the project.
Location: ./services/rapidflow.service
Author: Nabil, Sheharyar, Amir
Version: 1.0.0
Modification history: none
*/


import { ErrorReportingDialogComponent } from './../components/error-reporting-dialog/error-reporting-dialog.component';
import { MatDialog } from '@angular/material';
import { SocketProvider } from './socket.service';
import { Router } from '@angular/router';
import { async } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';
import { ProgressDialogComponent } from '../components/progress-dialog/progress-dialog.component';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';

declare var jquery: any; // Global variable of the class to store the JQuery variable referenced from jquery.min.js 
declare var $: any; // Global variable of the class to store the jQuery variable referenced from jquery.min.js 

@Injectable()
export class RapidflowService {
  static authenticationDialogShown: boolean; // Global flag to check if autentication dialog is shown or not
  static errorDialogShown: boolean; // Global flag to check if the error dialog is shown or not 
  static redirectURL: any; // Global variable of the class to store url to be redirected to 
  static userProcesses: any; // Global variable of the class to store processess for the current user 
  appServer: string; // Global variable of the class to store the app server for the current build
  public CurrentLoggedInUser: any; // Global variable of the class to store the current logged in user
  public internetConnected: boolean; // Global flag to check if the internet has been connected or not
  public serverConnected: boolean; // Global flag to check if the server has been connected or not
  public diagnosticLoggingProcessFlag:boolean=false;//current diagnostic logging process flag
  public diagnosticLoggingApplicationFlag:boolean=false;//current diagnostic logging application flag
  public insecureDialogOpened:boolean=false;
  loggedOut:string="";//
  timeoutVal:number=60000;
  
  /**
   * Creates an instance of RapidflowService.
   * @param {Http} http 
   * @param {Router} rtr 
   * @param {SocketProvider} SocketProvider 
   * @param {MatDialog} errorDialog 
   * @param {MatDialog} progressDialog 
   * @param {MatDialog} alertDialog 
   * @memberof RapidflowService
   */
  constructor(private http: Http, private rtr: Router, private SocketProvider: SocketProvider, private errorDialog: MatDialog, private progressDialog: MatDialog, public alertDialog: MatDialog) {
    RapidflowService.redirectURL = ''
    this.SocketProvider.check();
    RapidflowService.authenticationDialogShown = false
    RapidflowService.errorDialogShown = false
    this.CurrentLoggedInUser = {}
    this.checkcurrentloogedinUser();
  }

  /**
   * Function to check if the connection is established or not
   * 
   * @returns the connection status of the web
   * @memberof RapidflowService
   */
  checkConnecttion() {
    if (navigator.onLine) {
      this.SocketProvider.check()
      setTimeout(() => {
        if (SocketProvider.ServerConnected) {
          $('#ConnectionIntrupted').hide()
          this.serverConnected = true
          this.internetConnected = true;
          return 'Connected';
        } else {
          this.serverConnected = false
          this.internetConnected = true;
          return 'serverDisconnected';
        }
      }, 5000)
    } else {
      this.internetConnected = false;
      this.serverConnected = false;
      return 'noInternetConnection'
    }
  }

  /**
   * Function to set the application server this build is pionting to
   * 
   * @memberof RapidflowService
   */
  verifyUserSession() {
    try {
      this.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
      this.appServer = environment.WEB_SERVER_URL;
    } catch (e) {
         this.loggedOut=window.location.href;
       this.rtr.navigate(['login']).then((result)=>{
         this.errorDialog.closeAll();
        }).catch((err)=>{
          console.log(err);
       });
       
     }
  }


  getDiagnosticLoggingFlag(diagnosticLoggingObject) {
    try {
      //if diagnostic logging not invalid
      if (diagnosticLoggingObject != undefined && JSON.stringify(diagnosticLoggingObject) != "{}") {
        let diagnosticLoggingStartDate = new Date(diagnosticLoggingObject.StartDate);
        let diagnosticLoggingEndDate = new Date(diagnosticLoggingObject.StartDate);
        if (diagnosticLoggingStartDate.toString() != "Invalid Date" && !isNaN(parseInt(diagnosticLoggingObject.Duration))) {

          //add specified duration 
          diagnosticLoggingEndDate.setMinutes(diagnosticLoggingEndDate.getMinutes() + diagnosticLoggingObject.Duration)
          
          let currentDate = new Date();

          //remove offset 
          currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());

          //if current date between start and end data
          if (currentDate >= diagnosticLoggingStartDate && currentDate <= diagnosticLoggingEndDate) {
            return true;
          }

        }

      }
      return false;
    } catch (ex) {

    }

  }


  /**
   * Function to check if the current logged in user is populated 
   * or not
   * @returns true if the current logged in user is populated 
   * @memberof RapidflowService
   */
  checkcurrentloogedinUser() {
    try {
      this.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
      if (this.CurrentLoggedInUser != "" && this.CurrentLoggedInUser != null)
        return true
      else {
        this.loggedOut=window.location.href;
        
        this.rtr.navigate(['login']);
      }
    } catch (e) {
      this.loggedOut=window.location.href;
      
      this.rtr.navigate(['login']);
    }
  }


 

  /**
   * Function to check if the provided string is json or not
   * 
   * @param {any} str provided string
   * @returns true if json, false otherwise
   * @memberof RapidflowService
   */
  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * Function called to return JSON object if string is passed
   * 
   * @param {any} JsonStr json string
   * @returns json object parsed
   * @memberof RapidflowService
   */
  parseRapidflowJSON(JsonStr) {
    let JsonString = JsonStr.json()
    let result: any
    try {
      if (JsonString != "") {
        if (this.isJson(JsonString)) {
          try {
            result = JSON.parse(JsonString)
          } catch (e) {
            result = JsonString
          }
          if (Array.isArray(result)) {
            if (result[0] != undefined && result[0].AuthenticationStatus != undefined && result[0].AuthenticationStatus.toString() == "false") {
              window.localStorage.clear();
              result = []
              window.sessionStorage.clear();
              this.loggedOut=window.location.href;
              
              this.rtr.navigate(['login']);
            }
          } else if (result != null) {
            if ("undefined" != typeof result.AuthenticationStatus && result.AuthenticationStatus.toString() == "false") {
              window.localStorage.clear();
              result = {}
              window.sessionStorage.clear();
              this.loggedOut=window.location.href;
              
              this.rtr.navigate(['login']);
            }
          }
        } else {
          result = JsonString
        }
      }
      else {
        result = ""
      }
    }
    catch (err) {
      this.ShowErrorMessage("parseJson-Rapidflow Service", "Platfrom", "Error occured while parsing json : "+JsonString, err, err.stack, "N/A", '0', true);
    }
    return result;
  }

  /**
   * FUnction called to get the current time stamp for the user
   * 
   * @returns the current time stamp
   * @memberof RapidflowService
   */
  getCurrentTimeStamp() {
    var now = new Date;
    var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    return utc_timestamp;
  }

  /**
   * Function called to autheticate user when the user logins
   * 
   * @param {string} loginId login id entered by user
   * @param {string} password password entered by the user
   * @param {string} deviceId device id of the current user
   * @param {string} platform platform of the current user
   * @param {string} deviceInformation device information of the current user
   * @param {boolean} diagnosticLogging flag to check if diagnostic 
   * @returns the server response
   * @memberof RapidflowService
   */
  authenticateUser(loginId: string, password: string, deviceId: string, platform: string, deviceInformation: string, diagnosticLogging: boolean) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFAppService.svc/AuthenticateUser?loginId=" + loginId + "&password=" + password + "&deviceId=" + deviceId + "&platform=" + platform + "&deviceInformation=" + deviceInformation + "&diagnosticLogging=" + diagnosticLogging.toString(), { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve home page details for the current user
   * 
   * @param {number} numberOfRows number of rows requested
   * @param {number} desiredPageNumber number of pages requested
   * @param {string} searchString search string for the current tasks
   * @param {string} sorting sort string for the current tasks
   * @param {number} processId process id for the current process for the user
   * @returns the pending tasks and relevant process objects
   * @memberof RapidflowService
   */
  retrieveHomePageDetails(numberOfRows: number, desiredPageNumber: number, searchString: string, sorting: string, processId: number) {
    this.verifyUserSession();
    this.checkConnecttion()
    return this.http.get(this.appServer + "/WCFAppService.svc/retrieveHomePageDetails?userToken=" + this.CurrentLoggedInUser.AuthenticationToken + "&numberOfRows=" + numberOfRows + "&desiredPageNumber=" + desiredPageNumber + "&searchValue=" + searchString + "&sorting=" + sorting + "&processId=" + processId + "&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function that retrieves all pending tasks for the current user
   * 
   * @param {*} processID process id for the pending tasks
   * @param {*} [notificationID] notification id for the pending tasks
   * @returns the pending tasks for the user to take actions
   * @memberof RapidflowService
   */
  retrieveTODOTasksDetailsWCF(processID: any, notificationID?: any) {
    if (notificationID == null || notificationID == undefined || notificationID == "") {
      notificationID = 0
    } else {
      processID = 0
    }
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFWorkflowService.svc/retrieveTODOTasksDetails?NotificationID=" + notificationID + "&processId=" + processID + "&userToken=" + this.CurrentLoggedInUser.AuthenticationToken + "&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve the process workflows for the
   * selected process
   * @param {string} processID process id of the selected process 
   * @returns the workflow forms for the current process
   * @memberof RapidflowService
   */
  retrieveProcessWorkflowsWCF(processID: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveProcessWorkflows?processId=" + processID + "&userToken=" + this.CurrentLoggedInUser.AuthenticationToken + "&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retieve all process objects for the selected process
   * 
   * @param {string} processID process id of the selected process
   * @returns the process objects for the selected process
   * @memberof RapidflowService
   */
  retrieveProcessObjectsWCF(processID: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveProcessObjectsDefinitions?userToken=" + this.CurrentLoggedInUser.AuthenticationToken + "&processId=" + processID + "&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called t retrieve report data of a selected report
   * for a selected process
   * @param {number} processID current process id 
   * @param {number} processReportID current process report id
   * @param {string} queryString current query string for filtered data in reports
   * @returns the report data for the current report
   * @memberof RapidflowService
   */
  retrieveProcessReportData(processID: number, processReportID: number, queryString: string,startIndex:number,pageLength:number,searchValue:string,sorting:string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveProcessReportData?userToken=" + this.CurrentLoggedInUser.AuthenticationToken + "&processId=" + processID + "&processReportId=" + processReportID + "&queryString=" + queryString+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag+"&startIndex="+startIndex+"&pageLength="+pageLength+"&searchValue="+searchValue+"&sorting="+sorting, { withCredentials: true }).timeout(120000);
  }

  /**
   * Function called to return form objects when a new form is opened
   * for a selected process
   * @param {string} processID current process id 
   * @param {string} workflowID current workflow id
   * @returns the form objects when a new form is opened
   * @memberof RapidflowService
   */
  retrieveInitiationFormObjects(processID: string, workflowID: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveIntiatingFormObjects?processId=" + processID + '&workflowId=' + workflowID+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve the workflow submission details
   * of the selected workflow of the process
   * @param {number} processID process id of the current process
   * @param {number} workflowID workflow id of the current workflow
   * @param {boolean} diagnosticLogging flag to check if diagnostic logging is on or not
   * @param {string} initiatedByFilter initaiated by filter string on workflow submissions
   * @param {string} statusFilter status filter string on workflow submissions
   * @param {string} sorting sort string on workflow submissions
   * @param {number} numberOfRows number of rows on workflow submissions 
   * @param {number} desiredPageNumber desired page number on workflow submissions
   * @param {string} searchString search string for workflow submissions
   * @returns the workflow submissions data
   * @memberof RapidflowService
   */
  retrieveWorkflowSubmissionDetailsWCF(processID: number, workflowID: number, diagnosticLogging: boolean, initiatedByFilter: string, statusFilter: string, sorting: string, numberOfRows: number, desiredPageNumber: number, searchString: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveWorkflowSubmissionDetails?userToken=" + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processID + '&WorkflowID=' + workflowID + '&diagnosticLogging=' +this.diagnosticLoggingProcessFlag + '&initiatedByFilter=' + initiatedByFilter + '&statusFilter=' + statusFilter + '&sorting=' + sorting + '&numberOfRows=' + numberOfRows + '&desiredPageNumber=' + desiredPageNumber + '&searchValue=' + searchString, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to add an error log in the system
   * 
   * @param {number} processId process id of the current process
   * @param {string} method errored out method name
   * @param {string} logs error log
   * @param {string} stackTrace stacktrace of the error
   * @param {string} eventDateTime date time for the error
   * @param {string} status status of the error
   * @param {string} category category of the error
   * @param {string} diagnosticLog flag to check if diagnostic logging is enaled or not
   * @returns the status of the error logged
   * @memberof RapidflowService
   */
  addErrorLog(processId: number, method: string, logs: string, stackTrace: string, eventDateTime: string, status: string, category: string, diagnosticLog: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '//WCFProcessService.svc/addLog?authenticationToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processId + '&method=' + method + '&logs=' + logs + '&stackTrace=' + stackTrace + '&eventDateTime=' + eventDateTime + '&status=' + status + '&category=' + category + '&diagnosticLog=' + diagnosticLog, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to update an error log in the system
   * 
   * @param {number} errorLogId error logged id
   * @param {string} status status of error log
   * @param {string} category category of error
   * @param {string} resolution resolution of error recorded
   * @param {string} rca root cause of the error 
   * @returns status of the updated error
   * @memberof RapidflowService
   */
  updateErrorLog(errorLogId: number, status: string, category: string, resolution: string, rca: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '//WCFAppService.svc/updateErrorLogs?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&errorLogID=' + errorLogId + '&status=' + status + '&category=' + category + '&resolution=' + resolution + '&rootCauseAnalysis=' + rca+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve inbox notifications for the 
   * selected process
   * @param {number} processID process id for the current process 
   * @param {number} numberOfRows number of rows for the notifications
   * @param {number} desiredPageNumber page number for notifications
   * @param {string} searchString search string for the notifications
   * @param {string} sorting sort string for the notifications
   * @returns notification data for the selected process
   * @memberof RapidflowService
   */
  retrieveInboxNotificationDetailsWCF(processID: number, numberOfRows: number, desiredPageNumber: number, searchString: string, sorting: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveInboxNotificationDetails?userToken=" + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processID + '&NotificationID=0&diagnosticLogging='+this.diagnosticLoggingProcessFlag+'&numberOfRows=' + numberOfRows + '&desiredPageNumber=' + desiredPageNumber + '&searchValue=' + searchString + '&sorting=' + sorting, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function to retrieve data for the process add ons
   * of the selected process
   * @param {any} processID process id of the selected process
   * @param {any} processAddonID process addon id for the selected process
   * @returns the addon data for the selected process addon
   * @memberof RapidflowService
   */
  retrieveAddOnDataWCF(processID, processAddonID) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveProcessAddonData?&userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processID + '&processAddonId=' + processAddonID+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to insert process objects for a selected workflow
   * 
   * @param {number} processID process id of the process
   * @param {string} objectDescription object description of the process
   * @param {string} objectValue object value of the process object
   * @returns status of the object that is inserted in the table
   * @memberof RapidflowService
   */
  insertProcessObject(processID: number, objectDescription: string, objectValue: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFProcessService.svc/insertProcessObject?processId=' + processID + '&objectDescription=' + objectDescription + '&value=' + objectValue + '&userToken=' + this.CurrentLoggedInUser.AuthenticationToken+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function callled to add process permissions for the selected roles 
   * for the current process
   * @param {number} processID process id of the current process 
   * @param {string} roleNames role names of the roles for the selected process
   * @param {string} itemType item type of the process
   * @param {number} itemID item id of the process
   * @returns the status of the permissions api
   * @memberof RapidflowService
   */
  addProcessItemPermissions(processID: number, roleNames: string, itemType: string, itemID: number) {
    this.verifyUserSession();
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFProcessService.svc/addProcessItemPermissions?roleNames=' + roleNames + '&processId=' + processID + '&itemType=' + itemType + '&ItemId=' + itemID + '&userToken=' + this.CurrentLoggedInUser.AuthenticationToken+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve process directory processess for the 
   * current logged in user
   * @param {number} numberOfRows number of rows to be displayed 
   * @param {number} desiredPageNumber page number of the records
   * @param {string} searchString search string for the process directory
   * @param {string} sorting sort string for the process directory
   * @param {string} organizationNames organization names for the process directory
   * @returns the number of processess as per desired filters
   * @memberof RapidflowService
   */
  retrieveProcessDirectoryProcesses(numberOfRows: number, desiredPageNumber: number, searchString: string, sorting: string, organizationNames: string) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFAppService.svc/retrieveAllProcesses?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + "&numberOfRows=" + numberOfRows + "&desiredPageNumber=" + desiredPageNumber + "&searchValue=" + searchString + "&sorting=" + sorting + "&organizationNames=" + organizationNames+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve process organizations for the 
   * current user in the process directory
   * @returns organizations for the current processess
   * @memberof RapidflowService
   */
  retrieveAllProcessesOraganizations() {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFAppService.svc/retrieveAllProcessOrganizations?&userToken=' + this.CurrentLoggedInUser.AuthenticationToken+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to remove a process from favorites
   * of the current logged in user
   * @param {any} processId process id of the removed process
   * @returns status of the removed process api call
   * @memberof RapidflowService
   */
  unsubscribeProcess(processId) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFAppService.svc/unSubscribeProcess?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processId + '&action=Remove&diagnosticLogging='+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function call to add a process into favorites from the process directory
   * 
   * @param {any} processId process id of the selected process
   * @returns the status of the subscribed process api call
   * @memberof RapidflowService
   */
  subscribeProcess(processId) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFAppService.svc/subscribeProcess?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processId+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to validate the cmdb id of the selected process
   * 
   * @param {any} processId process id of the selected process
   * @returns returns the status of the api call
   * @memberof RapidflowService
   */
  validateCMDBID(processId) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFAppService.svc/validateCMDBID?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processIdentifier=' + processId+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve process metrics data for the selected process
   * 
   * @param {number} processId process id of the current process
   * @param {number} year selected year 
   * @param {number} workflowID selected workflow
   * @returns the metrics data for the selected year and workflow for the selected process
   * @memberof RapidflowService
   */
  retrieveProcessMetricsData(processId: number, year: number, workflowID: number) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveProcessMetricsData?authenticationToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processID=' + processId + '&workflowID=' + workflowID + '&year=' + year+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to create a notification for the user 
   * in the system
   * @param {any} typeId notification type 
   * @param {any} processId process id
   * @param {any} workflowId workflow id
   * @param {any} formId form id
   * @param {any} processUrl process url of the selected process
   * @param {any} showcaseUrl showcase url for the rapidflow
   * @param {any} dataPayload datapayload for the notification 
   * @param {any} attachmentMode attachment mode of the notification 
   * @returns 
   * @memberof RapidflowService
   */
  createNotification(typeId, processId, workflowId, formId, processUrl, showcaseUrl, dataPayload, attachmentMode) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFWorkflowService.svc/createNotification?fromUserEmail=' + this.CurrentLoggedInUser.Email + '&initiatorEmail=' + this.CurrentLoggedInUser.Email + '&processId=' + processId + '&workflowId=' + workflowId + '&formId=' + formId + '&toUserEmail=hassan.mehmood@abbvie.com&ccUserEmails=&typeId=' + typeId + '&notificationTemplate=&attachmentMode=' + attachmentMode + '&message=&dataPayload=' + dataPayload + '&processUrl=' + processUrl + '&showcaseUrl=' + showcaseUrl+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called retrieve the people picker names for the field
   * 
   * @param {any} query the user input to select the users
   * @param {any} groupSelection flag if the people picker allows group selection or not
   * @returns the people picker names for the query entered by the user
   * @memberof RapidflowService
   */
  getPeoplePickerResult(query, groupSelection) {
    if (groupSelection) {
      this.verifyUserSession(); return this.http.get(this.appServer + '/WCFUserProfileService.svc/getADGroups?query=' + query+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
    }
    else {
      this.verifyUserSession(); return this.http.get(this.appServer + '/WCFUserProfileService.svc/GetADUsers?userNameInfix=' + query+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
    }
  }

  /**
   * Function called to retrieve user application settings 
   * 
   * @returns application settings for the suer
   * @memberof RapidflowService
   */
  retrieveUserApplicationSettings() {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFAppService.svc/retrieveUserApplicationSettings?userToken=' + this.CurrentLoggedInUser.AuthenticationToken+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve process ettings for the user
   * 
   * @param {number} processID process id for the selected process
   * @returns the user process settings
   * @memberof RapidflowService
   */
  retrieveUserProcessSettings(processID: number) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveUserProcessSettings?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processID+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve process global process settings for the
   * selected process
   * @param {number} processID process id of the selected process 
   * @returns the process global settings for the process
   * @memberof RapidflowService
   */
  retrieveGlobalProcessSettings(processID: number) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFAppService.svc/retrieveProcessGlobalSettings?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processID+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true });
  }

  /**
   * Function called to update the user application settings 
   * 
   * @param {any} context context of settings
   * @param {any} processId prcoess id of the selected process
   * @param {any} settingName setting name that is updated
   * @param {any} value value of the settings 
   * @param {any} timeStamp date time of the settings
   * @returns the status of the update call
   * @memberof RapidflowService
   */
  updateUserApplicationSettings(context, processId, settingName, value, timeStamp) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFAppService.svc/updateUserSettings?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&context=' + context + '&processId=' + processId + '&settingName=' + settingName + '&value=' + value + '&timeStamp=' + timeStamp+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Retrieve process lookups for the selected process
   * 
   * @param {any} processID current process id
   * @returns the process lookups for the slected process
   * @memberof RapidflowService
   */
  retrieveProcessLookupsWCF(processID) {
    return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveProcessLookupObjects?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processID+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve the process lookup data for the
   * selected process and lookup id
   * @param {any} lookupId lookup id 
   * @param {any} processId process id of the selected process
   * @returns the process lookup data returned for the lookup
   * @memberof RapidflowService
   */
  retrieveProcessLookupPageDataWCF(lookupId, processId,startIndex,pageLength,searchValue,sorting) {
    return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveProcessLookupData?&userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&lookupId=' + lookupId + '&processId=' + processId+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag+"&startIndex="+startIndex+"&pageLength="+pageLength+"&searchValue="+searchValue+"&sorting="+sorting, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function to retrieve process lookup form data
   * 
   * @param {any} processId process id 
   * @param {any} lookupName lookup name
   * @param {any} lookupColumns lookup columns
   * @param {any} filterString filter string for the lookup
   * @param {any} sortString sort string 
   * @returns process lookup form data for the selected process
   * @memberof RapidflowService
   */
  retrieveProcessLookupFormData(processId, lookupName, lookupColumns, filterString, sortString) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveProcessLookupFormData?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processId + '&lookupTitle=' + lookupName + '&lookupColumns=' + lookupColumns + '&conditionalStatement=' + filterString + '&sortQuery=' + sortString+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve process global settings
   * 
   * @param {number} processId process id
   * @param {string} globalSettings global settings
   * @returns settings for the process
   * @memberof RapidflowService
   */
  updateProcessGlobalSettings(processId: number, globalSettings: string) {
    this.verifyUserSession(); return this.http.get(this.appServer + '//WCFProcessService.svc/updateProcessGlobalSettings?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processId + '&settingName=Process_Settings&value=' + globalSettings+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to validate process for the current user
   * 
   * @param {number} processId process id
   * @returns the status of the api call
   * @memberof RapidflowService
   */
  validateProcessForUser(processId: number) {
    this.verifyUserSession(); return this.http.get(this.appServer + '//WCFUserProfileService.svc/validateProcessForUser?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processId+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve notification counts for the current user
   * 
   * @returns the notification count for the current user
   * @memberof RapidflowService
   */
  retrieveNotificationCounts() {
    this.verifyUserSession(); return this.http.get(this.appServer + '//WCFProcessService.svc/retrieveNotificationCounts?userToken=' + this.CurrentLoggedInUser.AuthenticationToken+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve database lookup form data 
   * 
   * @param {any} processId process id
   * @param {any} workflowId workflow id
   * @param {any} query query for the database lookup
   * @returns the database lookup data
   * @memberof RapidflowService
   */
  retrieveDatabaseLookupFormData(processId, workflowId, query) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveDbLookupFormData?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processId + '&conditionalStatement=' + query+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to get file uploading size for the uploaded file
   * 
   * @param {any} fileName file name
   * @param {any} isCanceled flag if th efile uploading has been canceled or not
   * @returns the uploaded progress for the file
   * @memberof RapidflowService
   */
  getFileUploadProgress(fileName, isCanceled) {
    this.verifyUserSession(); return this.http.get(this.appServer + '/WCFFileAttachmentService.svc/getFileUploadProgress?fileName=' + fileName + '&isCanceled=' + isCanceled+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve process permissions for the current process
   * 
   * @param {number} processID process id 
   * @returns the process permissions for the current process
   * @memberof RapidflowService
   */
  retrieveProcessPermissions(processID: number) {

    this.verifyUserSession();
    
    return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveProcessPermissions?&userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processID+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function to cache a new user in the database
   * 
   * @param {any} loginId user id 
   * @returns the user id of the user that is cached
   * @memberof RapidflowService
   */
  cacheNewUser(loginId) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFUserProfileService.svc/cacheNewUser?logOnId=' + loginId+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to cache new group in the database
   * 
   * @param {any} name the name of the group
   * @param {any} distinguishedName distinguished name of the group
   * @param {any} description decription of the group
   * @returns the status of the api call
   * @memberof RapidflowService
   */
  cacheNewGroup(name, distinguishedName, description) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFUserProfileService.svc/cacheNewGroup?name=' + name + '&distinguishedName=' + distinguishedName + '&description=' + description+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve process form data from the process workflows 
   * 
   * @param {any} processId process id
   * @param {any} workflowId workflow id
   * @param {any} formId form id
   * @returns the data for the requested form 
   * @memberof RapidflowService
   */
  retrieveProcessFormData(processId, workflowId, formId) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFProcessService.svc/RetrieveFormDataWithFreshTemplate?processId=' + processId + '&workflowId=' + workflowId + '&formId=' + formId+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve platform settings for the user
   * 
   * @returns the platform settings
   * @memberof RapidflowService
   */
  retrievePlatformSettings() {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFAppService.svc/retrievePlatformSettings?diagnosticLogging='+this.diagnosticLoggingApplicationFlag, { withCredentials: true });
  }

  /**
   * Function called to update the platform settings 
   * 
   * @param {string} settingsParameterString settings name
   * @returns teh status of api call
   * @memberof RapidflowService
   */
  updatePlatformSettings(settingsParameterString: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFAppService.svc/updatePlatformSettings?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&settingsParametersValue=' + settingsParameterString+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to update the user profile
   * 
   * @param {string} userId user id 
   * @param {string} email email
   * @returns the reposne of the api call
   * @memberof RapidflowService
   */
  updateUserProfile(userId: string, email: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFBackEndService.svc/updateUserProfile?userId=' + userId + '&email=' + email+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve error logs for the slected process
   * 
   * @param {number} processID process id
   * @returns the error logs for the selected process
   * @memberof RapidflowService
   */
  retrieveErrorLogs(processID: number) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFAppService.svc/retrieveErrorLogs?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processID+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Functiion called to retrieve user and devices 
   * 
   * @param {string} currentOrAll filter for the user and devices
   * @returns the number of user and devices
   * @memberof RapidflowService
   */
  retrieveUserAndDevice(currentOrAll: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFAppService.svc/retrieveActiveUsersAndDevices?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + "&currentOrAll=" + currentOrAll+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to complete a process lookup approval request
   * 
   * @param {any} fromUserEmail from user email
   * @param {any} fromUserName from user name
   * @param {any} action action of the user 
   * @param {any} notificationId notification id of the change request
   * @param {any} lookupDataId lookup data id of the changed data
   * @returns the status of th eapi call
   * @memberof RapidflowService
   */
  completeProcessLookupApprovalRequestWCF(fromUserEmail, fromUserName, Action, notificationId, lookupDataId) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFWorkflowService.svc/completeProcessLookupApprovalRequest?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&fromUserEmail=' + fromUserEmail + '&fromUserName=' + fromUserName + '&ToUserEmail=' + this.CurrentLoggedInUser.Email + '&ToUserName=' + this.CurrentLoggedInUser.DisplayName + '&Action=' + Action + '&notificationId=' + notificationId + '&lookupDataId=' + lookupDataId+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve roles for the selected process
   * 
   * @param {any} processId process id
   * @returns the roles for the selected process 
   * @memberof RapidflowService
   */
  retrieveRoles(processId) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveRoles?ProcessID=' + processId+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to complete an access request 
   * 
   * @param {any} notificationId notification id 
   * @param {any} actionTaken action taken 
   * @param {any} comments comments on action
   * @returns the reponse from the api call
   * @memberof RapidflowService
   */
  completeAccessRequest(notificationId, actionTaken, comments) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFWorkflowService.svc/completeAccessRequest?userEmail=' + this.CurrentLoggedInUser.Email + '&notificationId=' + notificationId + '&actionTaken=' + actionTaken + '&comments=' + comments+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to update notification 
   * 
   * @param {any} action action
   * @param {any} value value
   * @param {any} notificationId notification id 
   * @returns 
   * @memberof RapidflowService
   */
  updateNotificationWCF(action, value, notificationId) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFWorkflowService.svc/updateNotification?notificationId=' + notificationId + '&action=' + action + '&value=' + value + '&userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&timeStamp=' + this.getUTCTimestamp()+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to edit role permissions for the selected string
   * 
   * @param {string} permissionsValue permission value
   * @returns the reponse of the api call
   * @memberof RapidflowService
   */
  editRolePermissions(permissionsValue: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFProcessService.svc/editRolePermissions?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&permissionsValue=' + permissionsValue+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to perform pivot operations on a selected pivot
   * 
   * @param {number} processId process id of the process
   * @param {string} operation operation for the pivot
   * @param {number} pivotId pivot id of the selected pivot
   * @param {string} objectDescription object description for the pivot
   * @returns the status of the api call
   * @memberof RapidflowService
   */
  pivotOperations(processId: number, operation: string, pivotId: number, objectDescription: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFProcessService.svc/pivotOperations?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processId + '&operation=' + operation + '&pivotId=' + pivotId + '&objectDescription=' + objectDescription+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to update user and their devices
   * 
   * @param {number} userId user id
   * @param {number} deviceIds device id
   * @param {string} action action performed
   * @returns the status of the api call
   * @memberof RapidflowService
   */
  updateUsersAndDevices(userId: number, deviceIds: number, action: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '//WCFBackEndService.svc/updateUserAndDevices?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&userId=' + userId + '&deviceIds=' + deviceIds + '&action=' + action+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to retrieve process lookup approval tasks
   * 
   * @param {any} notificationID notification id
   * @returns the process lookup approval tasks
   * @memberof RapidflowService
   */
  retrieveLookupApprovalTask(notificationID) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFWorkflowService.svc/retrieveLookupApprovalTask?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&notificationId=' + notificationID+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  } 

  /**
   * Function called to retrieve the timestamp
   * 
   * @returns the time stamp
   * @memberof RapidflowService
   */
  getUTCTimestamp() {
    var now = new Date;
    var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    return utc_timestamp;
  }

  /**
   * Function called to resolve bulk users in the query
   * 
   * @param {any} query query for the api call
   * @returns the bulk users for the field
   * @memberof RapidflowService
   */
  resolveBulkLookupUsers(query) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFUserProfileService.svc/resolveBulkLookupUsers?query=' + query+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to edit groups and users in the role for a selected process
   * 
   * @param {number} processId process id 
   * @param {number} roleId role id
   * @param {string} usersToAdd user to add
   * @param {string} usersToRemove user to remove
   * @param {string} groupsToAdd groups to add
   * @param {string} groupsToRemove groups to remove
   * @returns the status of the api call
   * @memberof RapidflowService
   */
  editGroupsAndUsersInRole(processId: number, roleId: number, usersToAdd: string, usersToRemove: string, groupsToAdd: string, groupsToRemove: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '//WCFAppService.svc/editUsersInRole?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&usersToAdd=' + usersToAdd + '&usersToRemove=' + usersToRemove + '&processId=' + processId + '&roleId=' + roleId + '&groupsToAdd=' + groupsToAdd + '&groupsToRemove=' + groupsToRemove+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to send a custom email
   * 
   * @param {any} processId 
   * @param {any} workflowId 
   * @param {any} formId 
   * @param {any} attachmentMode 
   * @param {any} fromEmail 
   * @param {any} toEmail 
   * @param {any} ccEmail 
   * @param {any} message 
   * @param {any} body 
   * @returns 
   * @memberof RapidflowService
   */
  sendEmailWithCustomTemplate(processId, workflowId, formId, attachmentMode, fromEmail, toEmail, ccEmail, message, body){
    this.verifyUserSession();
    return this.http.get(this.appServer + '//WCFWorkflowService.svc/sendEmailWithCustomTemplate?processId='+processId+'&workflowId='+workflowId+'&formId='+formId+'&attachmentMode='+attachmentMode+'&fromEmail='+fromEmail+'&toEmail='+toEmail+'&ccEmail='+ccEmail+'&message='+message+'&body='+body+'&diagnosticLogging='+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to send a task email
   * 
   * @param {any} processId 
   * @param {any} workflowId 
   * @param {any} formId 
   * @param {any} attachmentMode 
   * @param {any} fromEmail 
   * @param {any} toEmail 
   * @param {any} ccEmail 
   * @param {any} templateName 
   * @returns 
   * @memberof RapidflowService
   */
  sendEmailWithTaskTemplate(processId, workflowId, formId, attachmentMode, fromEmail, toEmail, ccEmail, templateName){
    this.verifyUserSession();
    return this.http.get(this.appServer + '//WCFWorkflowService.svc/sendEmailWithTaskTemplate?processId='+processId+'&workflowId='+workflowId+'&formId='+formId+'&attachmentMode='+attachmentMode+'&fromEmail='+fromEmail+'&toEmail='+toEmail+'&ccEmail='+ccEmail+'&templateName='+templateName+'&diagnosticLogging='+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to send user notification
   * 
   * @param {any} processId 
   * @param {any} workflowId 
   * @param {any} formId 
   * @param {any} notificationId 
   * @param {any} sendPush 
   * @param {any} sendEmail 
   * @param {any} attachmentMode 
   * @param {any} overrideUserEmailSetting 
   * @returns 
   * @memberof RapidflowService
   */
  sendUserNotification(processId, workflowId, formId, notificationId, sendPush, sendEmail, attachmentMode, overrideUserEmailSetting){
    this.verifyUserSession();
    return this.http.get(this.appServer + '//WCFProcessService.svc/sendUserNotification?processId='+processId+'&workflowId='+workflowId+'&formId='+formId+'&notificationId='+notificationId+'&sendPush='+sendPush+'&sendEmail='+sendEmail+'&attachmentMode='+attachmentMode+'&overrideUserEmailSetting='+overrideUserEmailSetting+'&diagnosticLogging='+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to perform user action on any task from pop up
   * 
   * @param {any} processId 
   * @param {any} workflowId 
   * @param {any} formId 
   * @param {any} currentLoggedInUserEmail 
   * @param {any} currentLoggedInUserName 
   * @param {any} buttonId 
   * @param {any} outcome 
   * @param {any} comments 
   * @param {any} delegatedFromEmail 
   * @param {any} delegatedToEmail 
   * @param {any} delegatedToName 
   * @param {any} getCurrentDate 
   * @param {any} workflowTasks 
   * @param {any} diagnosticLogging 
   * @returns 
   * @memberof RapidflowService
   */
  performUserAction(processId, workflowId, formId, currentLoggedInUserEmail, currentLoggedInUserName, buttonId, outcome, comments, delegatedFromEmail, delegatedToEmail, delegatedToName, getCurrentDate, workflowTasks, diagnosticLogging){
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFWorkflowService.svc/performUserAction?processId="+processId+"&workflowId="+workflowId+"&formId="+formId+"&currentLoggedInUserEmail="+currentLoggedInUserEmail+"&currentLoggedInUserName="+currentLoggedInUserName+"&buttonId="+buttonId+"&outcome="+outcome+"&comments="+comments+"&delegatedFromEmail="+delegatedFromEmail+"&delegatedToEmail="+delegatedToEmail+"&delegatedToName="+delegatedToName+"&getCurrentDate="+getCurrentDate+"&workflowTasks="+workflowTasks+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * 
   * 
   * @param {any} processId 
   * @param {any} workflowId 
   * @param {any} formId 
   * @param {any} reference 
   * @param {any} archivePath 
   * @param {any} formhtml 
   * @memberof RapidflowService
   */
  generatePdf(processId, workflowId, formId, reference){
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFWorkflowService.svc/generatePdf?processId="+processId+"&workflowId="+workflowId+"&formId="+formId+"&reference="+reference+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * 
   * 
   * @param {any} processId 
   * @param {any} workflowId 
   * @param {any} formId 
   * @param {any} fileName 
   * @param {any} folderName 
   * @param {any} archivePath 
   * @returns 
   * @memberof RapidflowService
   */
  generatePdfWithCustomParameters(processId, workflowId, formId, fileName, folderName, archivePath){
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFWorkflowService.svc/generatePdfWithCustomParams?processId="+processId+"&workflowId="+workflowId+"&formId="+formId+"&fileName="+fileName+"&folderName="+folderName+"&archivePath="+archivePath+"&diagnosticLogging="+this.diagnosticLoggingProcessFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function to generate pdf from custom html provided by user
   * 
   * @param {any} fileName 
   * @param {any} folderName 
   * @param {any} archivePath 
   * @param {any} html 
   * @param {any} showPageNumbers 
   * @returns 
   * @memberof RapidflowService
   */
  generatePdfWithCustomHtml(fileName,folderName,archivePath,html,showPageNumbers){
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFAppService.svc/generateCustomPdf?fileName="+fileName+"&folderName="+folderName+"&archivePath="+archivePath+"&html="+html+"&showPageNumbers="+showPageNumbers, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * 
   * 
   * @param {any} processId 
   * @param {any} workflowId 
   * @param {any} formId 
   * @param {any} folderName 
   * @param {any} watermarkText 
   * @param {any} watermarkRequired 
   * @param {any} archivePath 
   * @param {any} watermarkTextSize 
   * @memberof RapidflowService
   */
  watermarkPdf(processId, workflowId, formId, folderName, watermarkText, watermarkRequired, archivePath, watermarkTextSize){
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFWorkflowService.svc/watermarkPdfs?processId="+processId+"&workflowId="+workflowId+"&formId="+formId+"&folderName="+folderName+"&watermarkText="+watermarkText+"&watermarkRequired="+watermarkRequired+"&archivePath="+archivePath+"&watermarkSize="+watermarkTextSize, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function to watermark a given pdf file
   * 
   * @param {any} fileName 
   * @param {any} fileNameCopy 
   * @param {any} watermarkText 
   * @param {any} watermarkTextSize 
   * @returns 
   * @memberof RapidflowService
   */
  watermarkCustomFile(fileName, fileNameCopy, watermarkText, watermarkTextSize){
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFAppService.svc/watermarkPdf?fileName="+fileName+"&fileNameCopy="+fileNameCopy+"&watermarkText="+watermarkText+"&watermarkSize="+watermarkTextSize, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function to move files to a custom archieve
   * 
   * @param {any} processId 
   * @param {any} workflowId 
   * @param {any} formId 
   * @param {any} formData 
   * @param {any} sourcePath 
   * @param {any} targetPath 
   * @returns 
   * @memberof RapidflowService
   */
  moveFileToCustomArchieve(processId, workflowId, formId, formData, sourcePath, targetPath){
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFFileAttachmentService.svc/moveFileToCustomArchieve?processId="+processId+"&workflowId="+workflowId+"&formId="+formId+"&formData="+formData+"&sourcePath="+sourcePath+"&targetPath="+targetPath, { withCredentials: true }).timeout(this.timeoutVal);
  }

  retrieveUserDetails(){

  }

  /**
   * Function called to update notifications in the system
   * 
   * @param {any} notificationId notification id
   * @param {any} action action taken 
   * @param {any} value value
   * @returns response from the api call
   * @memberof RapidflowService
   */
  UpdateNotifications(notificationId, action, value) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFWorkflowService.svc/updateNotification?notificationId=' + notificationId + '&action=' + action + '&value=' + value + '&userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&timeStamp=' + this.getUTCTimestamp()+"&diagnosticLogging="+this.diagnosticLoggingApplicationFlag, { withCredentials: true }).timeout(this.timeoutVal);
  }

  /**
   * Function called to show error dialog to the user to reprot an incident
   * 
   * @param {any} methodName method name for the error
   * @param {any} category category of the error
   * @param {any} logs log of the error
   * @param {any} stackTrace stacktrace of the error
   * @param {any} userText user text for the error
   * @param {any} diagnosticLog flag to check diagnostic logs 
   * @param {any} processID process id 
   * @param {any} showDialog show dialog
   * @memberof RapidflowService
   */
  ShowErrorMessage(methodName, category, logs, stackTrace, userText, diagnosticLog, processId, showDialog) {
    

    //close all opened dialogs before showing the message
    this.alertDialog.closeAll();    
    if(!navigator.onLine)
    {
      this.alertDialog.open(AlertDialogComponent, {
        data: {
          title: "RapidFlow server unreachable",
          message: "Please check your vpn/internet connection and try again"
        }
      });
      return;
    }

    if(stackTrace=="TimeoutError"||stackTrace.name=="TimeoutError"||stackTrace=="NoConnection")
    {
      if(navigator.onLine)
      {
        this.alertDialog.open(AlertDialogComponent, {
          data: {
            title: "Connection Error",
            message: "An error occured while connecting to the server."
          }
        });
      }
      
      else{
        this.alertDialog.open(AlertDialogComponent, {
          data: {
            title: "RapidFlow server unreachable",
            message: "Please check your vpn/internet connection and try again"
          }
        });
      }
        
      
      
      return;
    }

    if (RapidflowService.errorDialogShown == false && RapidflowService.authenticationDialogShown == false&&window.localStorage.length!==0) {
      RapidflowService.errorDialogShown = true
      var connectivityCheck = setInterval(() => {
        if (this.serverConnected == true) {
          if (typeof (stackTrace) == "object") {
            if (stackTrace.status == 0 && this.serverConnected&&navigator.onLine) {
              if(!this.insecureDialogOpened)
              {
                this.insecureDialogOpened=true;
                this.openInsecuresponsePopup(stackTrace._body.currentTarget.__zone_symbol__xhrURL)
                let dialogRef = this.errorDialog.open(AlertDialogComponent, {
                  width: '25%',
                  data: { title: 'Insecure Response', message: 'Please follow the instructions to accept the app server certificate on the browser new tab. After that click OK to refresh the page.' }
                });
                dialogRef.afterClosed().subscribe(result => {
                  RapidflowService.errorDialogShown = false
                  RapidflowService.authenticationDialogShown = false;
                  window.location.reload();
                });
              }
              

            } else
              if (navigator.onLine && this.serverConnected) { // true|false
                let dialogRef = this.errorDialog.open(ErrorReportingDialogComponent, {
                  width: '25%',
                  data: { methodName: methodName, category: category, logs: logs, stackTrace: stackTrace._body, userText: userText, diagnosticLog: diagnosticLog, ProcessID: processId }
                });
                dialogRef.afterClosed().subscribe(result => {
                  RapidflowService.errorDialogShown = false
                  RapidflowService.authenticationDialogShown = false
                  if (result) {
                    let progressDialogRef: any;
                    progressDialogRef = this.progressDialog.open(ProgressDialogComponent, {
                      data: {
                        message: "Reporting Error...",
                      }
                    });
                    let singleLineStackTrace = stackTrace._body.replace(/(\r\n|\n|\r)/gm, "");
                    this.addErrorLog(processId, methodName, encodeURIComponent(logs), encodeURIComponent(singleLineStackTrace), new Date().toISOString(), "Reported", category, diagnosticLog).subscribe((response) => {
                     if(response.json()=="False")
                     {
                      this.alertDialog.open(AlertDialogComponent, {
                        data: {
                          title: "RapidFlow",
                          message: "Error in adding error log on server"
                        }
                      });
                     }
                     else if(response.json()=="True")
                     {
                      this.alertDialog.open(AlertDialogComponent, {
                        data: {
                          title: "RapidFlow",
                          message: "Error reported successfully...!!"
                        }
                      }); 
                     }
                      
                      progressDialogRef.close();
                    },
                      (error) => {
                        this.alertDialog.open(AlertDialogComponent, {
                          data: {
                            title: "Rapidflow Nex Gen",
                            message: "Error in adding error log on server"
                          }
                        });
                      }
                    );
                  }
                });
              }
            clearInterval(connectivityCheck);
          }
          else if (typeof (stackTrace) == "string") {
            let dialogRef = this.errorDialog.open(ErrorReportingDialogComponent, {
              width: '25%',
              data: { methodName: methodName, category: category, logs: logs, stackTrace: stackTrace, userText: userText, diagnosticLog: diagnosticLog, ProcessID: processId }
            });
            dialogRef.afterClosed().subscribe(result => {
              RapidflowService.errorDialogShown = false
              RapidflowService.authenticationDialogShown = false
              if (result) {
                let progressDialogRef: any;
                progressDialogRef = this.progressDialog.open(ProgressDialogComponent, {
                  data: {
                    message: "Reporting Error...",
                  }
                });
                let singleLineStackTrace = stackTrace.replace(/(\r\n|\n|\r)/gm, "");
                this.addErrorLog(processId, methodName, encodeURIComponent(logs), encodeURIComponent(stackTrace), new Date().toISOString(), "Reported", category, diagnosticLog).subscribe((response) => {
                  if(response.json()=="False")
                  {
                   this.alertDialog.open(AlertDialogComponent, {
                     data: {
                       title: "RapidFlow",
                       message: "Error in adding error log on server"
                     }
                   });
                  }
                  else if(response.json()=="True")
                  {
                   this.alertDialog.open(AlertDialogComponent, {
                     data: {
                       title: "RapidFlow",
                       message: "Error reported successfully...!!"
                     }
                   }); 
                  }
                  progressDialogRef.close();
                },
                  (error) => {
                    this.alertDialog.open(AlertDialogComponent, {

                      data: {
                        title: "RapidFlow",
                        message: "Error in adding error log on server"
                      }
                    });
                  }
                );
              }
            });
            clearInterval(connectivityCheck);
          }
        } else {
        }
      }, 3000);
    }
    RapidflowService.errorDialogShown=false;
  }

  /**
   * Function called to open insecure response for the user 
   * 
   * @param {any} URL url 
   * @memberof RapidflowService
   */
  openInsecuresponsePopup(URL) {
    
      var win = window.open(URL, '_blank');
      win.focus();
    
    
    

  }

}
