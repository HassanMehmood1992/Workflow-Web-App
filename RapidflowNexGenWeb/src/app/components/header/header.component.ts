/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: HeaderComponent
Description: Provide functionality to render the header bar of application. The source of data it is based on is retrived from process data service, which is updated via observers.
Location: ./header.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { EventEmiterService } from './../../services/event-emiters.service';
import { RapidflowService } from './../../services/rapidflow.service';
import { ProcessDataService } from './../../services/process-data.service';
import { Router } from '@angular/router';
import { Component, OnInit, HostListener, DoCheck } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';


declare var jquery: any;//jquery var declaration
declare var $: any;//jquery var declaration

/**
  * component decorator
  */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})

export class HeaderComponent implements OnInit, DoCheck {
  public showSearch: boolean; // flag to show search filter icon anf field
  public showSort: boolean;// flag to show sort icon
  public urlNav: any; //stores complete url of current route.
  public showToggle: boolean; //toggle side navigation bar containing the favourites.
  private headerdata; //header details
  public subscription: Subscription; // reactive js variable to read the data from processdata sevice to setup the deader details
  public currentUserName: string; // contains current logged in user name
  public currentUserEmail: string; // contains current logged in user email
  public currentImage: string; // contains current header image source
  public currentHeading: string; // contains current main heading text
  public currentSubHeading: string;// contains current sub heading text
  public searchOn: boolean; // falg to set search is on or not
  public alphaSort: boolean;// falg to set sort is on or not
  public searchString: any; // string to contain search string
  public dateTime: any; // date time variable to show in header bar
  public searcWidth: any; // to set the search width in header bar
  public sideNavOpened: boolean; // falg to check if side bar is opened or not


  /**
  * Default constructor with dependency injection of all necessary objects and services 
  */

  constructor(private rtr: Router, private processDataService: ProcessDataService, private rapidflowService: RapidflowService, private confirmationDialog: MatDialog, private eventEmiterService: EventEmiterService) {

    this.searcWidth = '10px'
    // gets current looged in user details from rapidflowServices  service
    var UserCheck = setInterval(() => {
      if (this.rapidflowService.CurrentLoggedInUser != null && this.rapidflowService.CurrentLoggedInUser != undefined) {
        this.currentUserName = this.rapidflowService.CurrentLoggedInUser.DisplayName;
        this.currentUserEmail=this.rapidflowService.CurrentLoggedInUser.Email;
        clearInterval(UserCheck);
      }
    }, 1000)

    this.sideNavOpened = true;
    this.searchOn = false;
    this.alphaSort = false;
    this.showSearch = false;
    this.showSort = false;
    this.searchString = "";
    this.dateTime = { date: '', time: '' };

    //sets header text based on current page opened
    this.setHeaderDetails();
  }

  // deside to toggle the side navigation bar based on screen size
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      if (event.target.innerWidth < 1280) {
        var toggleObject = { "Type": "ToggleSideNav", Value: { "toggle": true } }
        this.eventEmiterService.changeMessage(toggleObject);
        this.showToggle = true;
        this.sideNavOpened = false;
      } else {
        var toggleObject = { "Type": "ToggleSideNav", Value: { "toggle": false } }
        this.eventEmiterService.changeMessage(toggleObject);
        this.showToggle = false;
        this.sideNavOpened = true;
      }
    }, 500);

  }

  // toggle side navigation bar decided from hostlistner
  toggleSideNav() {
    if (this.sideNavOpened) {
      var toggleObject = { "Type": "ToggleSideNav", Value: { "toggle": false } }
      this.eventEmiterService.changeMessage(toggleObject);
      this.sideNavOpened = false;
    }
    else {
      var toggleObject = { "Type": "ToggleSideNav", Value: { "toggle": true } }
      this.eventEmiterService.changeMessage(toggleObject);
      this.sideNavOpened = true;
    }
  }
  // sets the header details based on current route
  setHeaderDetails() {
    try {
      this.rtr.events.subscribe((event) => {
        $('#headerfilters').show()
        this.urlNav = event
        this.searchString = "";
        if (this.urlNav.url.indexOf('home/tasks') != -1) {
          this.showSearch = true
          this.showSort = true
          this.searchOn = false;
          this.alphaSort = false;
        } else if (this.urlNav.url.indexOf('home/forms') != -1) {
          this.showSearch = true
          this.showSort = true
          this.searchOn = false;
          this.alphaSort = false;
        } else if (this.urlNav.url.indexOf('home/submissions') != -1) {
          this.showSearch = true
          this.showSort = true
          this.searchOn = false;
          this.alphaSort = false;
        } else if (this.urlNav.url.indexOf('home/reports') != -1) {
          this.showSearch = true
          this.showSort = true
          this.searchOn = false;
          this.alphaSort = false;
        }
        else if (this.urlNav.url.indexOf('/report/') != -1) {
          this.showSearch = true
          this.showSort = true;
          this.searchOn = false;
          this.alphaSort = false;
        }
        else if (this.urlNav.url.indexOf('home/pivots') != -1) {
          this.showSearch = true
          this.showSort = true
          this.searchOn = false;
          this.alphaSort = false;
        } else if (this.urlNav.url.indexOf('home/addons') != -1) {
          this.showSearch = true
          this.showSort = true
          this.searchOn = false;
          this.alphaSort = false;
        } else if (this.urlNav.url.indexOf('home/notifications') != -1) {
          this.showSearch = true
          this.showSort = true
          this.searchOn = false;
          this.alphaSort = false;
        } else if (this.urlNav.url.indexOf('/Lookups') != -1) {
          this.showSearch = true
          this.showSort = true
          this.searchOn = false;
          this.alphaSort = false;
        } else if (this.urlNav.url.indexOf('/Lookup/') != -1) {
          this.showSearch = true
          this.showSort = true
          this.searchOn = false;
          this.alphaSort = false;
        }
        else if (this.urlNav.url.indexOf('errorlogs') != -1) {
          this.showSearch = true
          this.showSort = false
          this.searchOn = false;
          this.alphaSort = false;
        }
        else if (this.urlNav.url.indexOf('userdevices') != -1) {
          this.showSearch = true
          this.showSort = false
          this.searchOn = false;
          this.alphaSort = false;
        }
        else if (this.urlNav.url.indexOf('diagnostics') != -1) {
          this.showSearch = true
          this.showSort = false
          this.searchOn = false;
          this.alphaSort = false;
        }

        else if (this.urlNav.url.indexOf('processDirectory') != -1) {
          this.currentImage = "assets/images/top_level/Directory_Selected.png"
          this.currentHeading = "Process Directory"
          this.currentSubHeading = "All available processes as per your authorizations"
          this.showSearch = true;
          this.showSort = false;
          this.searchOn = false;
          this.alphaSort = true;
        }
        else if (this.urlNav.url.indexOf('applicationSettings') != -1) {
          this.currentImage = "assets/images/top_level/process_settings_selected.png"
          this.currentHeading = "Application Settings"
          this.currentSubHeading = "Setting applicable across all processes"
          this.showSearch = false
          this.showSort = false
          this.searchOn = false;
          this.alphaSort = false;
        }
        else {
          this.showSearch = false
          this.showSort = false
          this.searchOn = false;
          this.alphaSort = false;
        }

        this.getSearchWidth()
      });
    }
    catch (error) {
      //header evaluation handler error
      this.rapidflowService.ShowErrorMessage("setHeaderDetails-header component", "Global", error.message, error.stack, "An error occured while setting header details", "N/A", "0", true);
    }

  }
  // built in angular function to run the code after 1000 millimeter timeinterval
  // used to update the current date time in header.
  ngDoCheck() {
    this.setDateTime();
  }
  /**
  * component initialization lifecycle hook
  */
  ngOnInit() {
    try {
      // default header details retrieved from process data service.
      this.headerdata = this.processDataService.object;

      // reads the process data service if observer in process data service is changed to update the header
      this.subscription = this.processDataService.getHeaderDetails().subscribe(object => {
        this.headerdata = object;
        if (typeof this.headerdata.object != "undefined") {

          if(this.headerdata.object=="directory")
          {
            this.currentImage = "assets/images/top_level/Directory_Selected.png";
            this.currentHeading = "Process Directory";
            this.currentSubHeading = "All available processes as per your authorizations"
            
          }
          else{
            this.currentHeading = this.headerdata.object.ProcessName
            this.currentSubHeading = this.headerdata.object.OrganizationName
            this.currentImage = this.headerdata.object.ProcessImage
            
          }
        }
        else {
          this.currentHeading = this.headerdata.ProcessName
          this.currentSubHeading = this.headerdata.OrganizationName
          this.currentImage = this.headerdata.ProcessImage
        }
      });

      // sets the search width
      this.getSearchWidth();
      //toggle the side navigation bar after intialization of header  
      if (window.innerWidth < 1280) {
        var toggleObject = { "Type": "ToggleSideNav", Value: { "toggle": true } }
        this.eventEmiterService.changeMessage(toggleObject);
        this.showToggle = true;
      }
      else {
        this.showToggle = false;
        var toggleObject = { "Type": "ToggleSideNav", Value: { "toggle": false } }
        this.eventEmiterService.changeMessage(toggleObject);
      }
      window.dispatchEvent(new Event('resize'));
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("ngOnInit-header component", "Global", error.message, error.stack, "An error occured while initializing header", "N/A", "0", true);
    }
  }

  // function to logout the user from system
  logout() {
    let userConfirmation = this.confirmationDialog.open(ConfirmationDialogComponent, {

      data: { title: 'Logging Out', message: 'Are you sure you want to log out?' }
    });

    // gets confirmation of user on logout
    userConfirmation.afterClosed().subscribe(result => {
      if (result) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        this.rapidflowService.loggedOut="";
        this.rtr.navigate(['login']);
      }
    });
  }
  // function to set the date and time in local variable
  setDateTime() {
    let datetimexyz = this.rapidflowService.getCurrentTimeStamp()
    var dateB = moment(datetimexyz);
    this.dateTime.date = dateB.format('DD-MMM-YYYY')
    this.dateTime.time = dateB.format('hh:mm a')
  }

  // function to update the search input width in  local variable
  getSearchWidth() {
    try {
      var interval = setInterval(() => {
        if ($("#headerCalender").position() != undefined) {
          var cal = $("#headerCalender").position().left
          var ser = $("#headerSearch > span").position().left
          var wid = ser - cal
          var wid = parseInt($("#searchOn").position().left) + (ser - cal) - 2
          var width = parseInt(wid.toString()) + 'px'
          $("#filterSearch").css("width", width)
          this.searcWidth = width
          $("#searchControl").width(this.searcWidth)
          clearInterval(interval);
        }
      }, 1000)
    }
    catch (error) {
      //search width evalution error handler
      this.rapidflowService.ShowErrorMessage("getSearchWidth-header component", "Global", error.message, error.stack, "An error occured while getting search width", "N/A", "0", true);
    }
  }
}
