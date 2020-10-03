/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ReportsComponent
Description: Renders list of all available reports of a process which is used to navigate to a report
Location: ./components/reports.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/


import { SortListsService } from './../../services/sort-lists.service';
import { ProcessDataService } from './../../services/process-data.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit } from '@angular/core';

declare var jquery: any; //jquery var declaration
declare var $: any;//jquery var declaration

/**
 * component decorator
 * 
 * @export
 * @class ReportsComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  public reports = [];// contains the lists of reports
  public processId: any; // contain current process id
  public reportsAvailable: boolean; // flag to show the availibity of reports
  public searchStr = "";// contain the search string to filter the lookups
  public sort: boolean; // flag to sort the reports
  public reportsLoading: boolean = true; // flag to show the loading progress of reports
  public sortObject = {}; // object to  sort the lookups by default
  public sortObjectAscending = {}; // object  to sort the lookups after applying sort
  /**
   * Creates an instance of ReportsComponent.
   * @param {RapidflowService} rapidflowService 
   * @param {ActivatedRoute} route 
   * @param {Router} router 
   * @param {ProcessDataService} processDataService 
   * @param {SortListsService} sortListsService 
   * @memberof ReportsComponent
   */
  constructor(private rapidflowService: RapidflowService, private route: ActivatedRoute, private router: Router, private processDataService: ProcessDataService, private sortListsService: SortListsService) {
    this.reportsAvailable = true
    this.sort = false
    this.sortObject['ProcessObjectID'] = 'asc'
    this.sortObjectAscending['Title'] = 'asc'
  }

  /**
   * function to sort the reports when sort icon is clicked
   * 
   * @memberof ReportsComponent
   */
  sortArray() {
    if (this.sort) {
      this.reports = this.sortListsService.sort(this.reports, this.sortObject)
    } else {
      this.reports = this.sortListsService.sort(this.reports, this.sortObjectAscending)
    }
  }

  /**
   * component initialization lifecycle hook
   * 
   * @memberof ReportsComponent
   */
  ngOnInit() {
    try {
      // assigning jquery input event to filter the reports on key up
      $("#filterSearch").on('input', () => {
        this.searchStr = $("#filterSearch").val()
      });
      // assigning jquery click event to  turn on the filter on reports list
      $("#searchOn").click(() => {
        this.searchStr = ''
      });
      // assigning jquery click event to  turn off the filter on reports list
      $("#searchOff").click(() => {
        this.searchStr = ''
      });
      // assigning jquery click event to  turn off the sort on reports list
      $("#sortOn").click(() => {
        this.sort = true

        this.sortArray()
      });
      // assigning jquery click event to  turn off the sort on reports list
      $("#sortOff").click(() => {
        this.sort = false
        this.sortArray()
      });

      // retrieving the current process id from route params 
      this.route.parent.parent.paramMap
        .subscribe((params: ParamMap) => {
          this.processId = +params.get('ProcessID');
          // retrieving the process report from process data service
          //interval to try untill the process data services loads the reports
          var timeinterval = setInterval(() => {
            if (this.processDataService.reports != undefined && this.processDataService.reports != null && this.processDataService.objectsLoading == false) {
              this.reports = this.processDataService.reports
              //evaluating the reports availabitly and loading
              if (this.reports.length > 0) {
                this.reportsAvailable = true
              } else {
                this.reportsAvailable = false
              }
              this.sort = false;

              // sroting the reports by default
              this.sortArray()
              clearInterval(timeinterval)

              this.reportsLoading = false;
            }
          }, 1000)

        });
    } catch (ex) {
      //reports intialization error handler
      this.rapidflowService.ShowErrorMessage("ngOnInit-Reports component", "Platform", ex.message, ex.stack, "An error occured while initiang reports view", "N/A", this.processId, true);
    }

  }

  /**
   * method to navigate to selected process report page
   * 
   * @param {any} item 
   * @memberof ReportsComponent
   */
  moveToreport(item) {
    this.router.navigate(['main', 'process', this.processId, 'report', item.ProcessObjectID]);
  }

}
