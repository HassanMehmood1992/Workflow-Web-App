
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: WorkflowsComponent
Description: Renders all available workflows list of the selected process which a user can open and submit a request.
Location: ./components/workflows.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { SortListsService } from './../../services/sort-lists.service';
import { ProcessDataService } from './../../services/process-data.service';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FilterArrayPipe } from './../../pipes/filter-array.pipe';

declare var jquery: any;//jquery var declaration
declare var $: any;//jquery var declaration

/**
 * component decorator
 * 
 * @export
 * @class WorkflowsComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.css'],
  providers: [SortListsService]
})
export class WorkflowsComponent implements OnInit {
  public workflows: Array<any>;//contains the workflows list
  public processId: any; //contains the current process id
  public workflowsLoading: boolean = true; // flag to show the workflows are loadidng or not
  public workflowsAvailable: boolean;// falg to show availibilty of workflows
  public searchStr = "";// contains the string to filter the workfows
  public sort: boolean // falg to sort the workflows
  public sortObject = { "WorkflowID": "asc" }; // sort object to sort the workflows by default
  public sortObjectAscending = { "WorkflowDisplayName": "asc" };// sort object to sort the workflows after clicking the sort button

  /**
   * Creates an instance of WorkflowsComponent.
   * @param {RapidflowService} rapidflowService 
   * @param {ProcessDataService} ProcessDataService 
   * @param {ActivatedRoute} route 
   * @param {Router} router 
   * @param {SortListsService} sortListsService 
   * @memberof WorkflowsComponent
   */
  constructor(private rapidflowService: RapidflowService, private processDataService: ProcessDataService, private route: ActivatedRoute, private router: Router, private sortListsService: SortListsService) {
    this.workflows = []
    this.sort = false
    this.workflowsAvailable = true
  }

  /**
   * function to sort the workflows when sort icon is clicked
   * 
   * @memberof WorkflowsComponent
   */
  sortArray() {
    if (this.sort) {
      this.workflows = this.sortListsService.sort(this.workflows, this.sortObjectAscending)
    } else {

      this.workflows = this.sortListsService.sort(this.workflows, this.sortObject)
    }
  }

  /**
   * component initialization lifecycle hook
   * 
   * @memberof WorkflowsComponent
   */
  ngOnInit() {
    this.workflows = []

    // assigning jquery input event to filter the workflows on key up
    $("#filterSearch").on('input', () => {
      this.searchStr = $("#filterSearch").val()
    });

    // assigning jquery click event to  turn on the filter on workflows list
    $("#searchOn").click(() => {
      this.searchStr = ''
    });

    // assigning jquery click event to  turn off the filter on workflows list
    $("#searchOff").click(() => {
      this.searchStr = ''
    });

    // assigning jquery click event to  turn on the sort on workflows list
    $("#sortOn").click(() => {
      this.sort = true

      this.sortArray()
    });
    // assigning jquery click event to  turn off the sort on workflows list
    $("#sortOff").click(() => {
      this.sort = false
      this.sortArray()
    });

    // retrieving the current process id from route params 
    this.route.parent.parent.paramMap
      .subscribe((params: ParamMap) => {
        this.processId = +params.get('ProcessID');

        // retrieving the process workflows from process data service
        //interval to try untill the process data services loads the workflows
        var interval = setInterval(() => {
          if (this.processDataService.workflows != undefined && this.processDataService.workflows != null&&this.processDataService.workflowsLoading == false) {
            this.workflows = this.processDataService.workflows
            //evaluating the workflows availabitly and loading
            if (this.workflows.length > 0) {
              this.workflowsAvailable = true
            } else {
              this.workflowsAvailable = false
            }
            clearInterval(interval)
            this.workflowsLoading = false;
          }
        }, 1000)
      });
  }

  /**
   * method to navigate to selected process workflow form
   * 
   * @param {any} form 
   * @memberof WorkflowsComponent
   */
  movetoform(form) {
    this.router.navigate(['main', 'process', this.processId, 'form', form.WorkflowID, 'new']);
  }

}
