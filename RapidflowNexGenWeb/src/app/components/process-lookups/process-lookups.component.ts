/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessLookupsComponent
Description: Renders the list of process lookups available to a user for navigating to a process lookup.
Location: ./components/process-lookups.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/

import { SortListsService } from './../../services/sort-lists.service';


import { ProcessDataService } from './../../services/process-data.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit } from '@angular/core';

declare var jquery: any;//jquery var declaration
declare var $: any;//jquery var declaration

/**
 * component decorator
 * 
 * @export
 * @class ProcessLookupsComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-process-lookups',
  templateUrl: './process-lookups.component.html',
  styleUrls: ['./process-lookups.component.css']
})
export class ProcessLookupsComponent implements OnInit {
  paramSubscription: any;
  public navArray: any  //array containing previous states information for navigating back
  public lookups: any // contain list of lookups
  public processId: any // contain list of lookups
  public lookupsAvailable: boolean // flag if the lookups are available for current looged in user
  public searchStr = "" //contain the string to filter the lookups
  public sort: boolean // flag to sort the lookup list
  public lookupLoading: boolean // flag to show the lookup loading progress
  public sortObject = { "LookupID": "asc" }; // object to sort the lookups with respect to lookup id
  public sortObjectAscending = { "LookupTitle": "asc" };// object to sort the lookups with respect to lookup title


  /**
   * Creates an instance of ProcessLookupsComponent.
   * @param {RapidflowService} rapidflowService 
   * @param {ActivatedRoute} route 
   * @param {Router} router 
   * @param {ProcessDataService} processDataService 
   * @param {SortListsService} sortListsService 
   * @memberof ProcessLookupsComponent
   */
  constructor(private rapidflowService: RapidflowService, private route: ActivatedRoute, private router: Router, private processDataService: ProcessDataService, private sortListsService: SortListsService) {

    this.lookupsAvailable = true
    this.lookupLoading = true
    this.sort = false
    this.navArray = []
    this.lookups = []

  }


  /**
   * function to sort the lookup when sort icon is clicked
   * 
   * @memberof ProcessLookupsComponent
   */
  sortArray() {
    if (this.sort) {
      this.lookups = this.sortListsService.sort(this.lookups, this.sortObjectAscending)
    } else {
      this.lookups = this.sortListsService.sort(this.lookups, this.sortObject)
    }
  }


  /**
   * component initialization lifecycle hook
   * 
   * @memberof ProcessLookupsComponent
   */
  ngOnInit() {
    this.lookups = []

    // assigning jquery input event to filter the lookups on key up
    $("#filterSearch").on('input', () => {
      this.searchStr = $("#filterSearch").val()
    });

    // assigning jquery click event to  turn on the filter on lookup list
    $("#searchOn").click(() => {
      this.searchStr = ''
    });

    // assigning jquery click event to  turn off the filter on lookup list
    $("#searchOff").click(() => {
      this.searchStr = ''
    });

    // assigning jquery click event to  turn on the sort on lookup list
    $("#sortOn").click(() => {
      this.sort = true

      this.sortArray()
    });
    // assigning jquery click event to  turn off the sort on lookup list
    $("#sortOff").click(() => {
      this.sort = false
      this.sortArray()
    });

    // retrieving the current process id from route params 
    this.paramSubscription=  this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.processId = params.get('ProcessID');

      // updating the back navigation component based on current process id
      this.navArray = [{ urlBack: ['main', 'process', this.processId, 'home', 'tasks'], urlImage: "", imagesrc: 'assets\\images\\process_menu\\Lookup_Selected.png', text: 'Process Lookups' }]
      try {

        // retrieving the process lookup using api call
        let processlookups = this.rapidflowService.retrieveProcessLookupsWCF(this.processId)
          .subscribe((response) => {
            this.lookups = JSON.parse(response.json())

            //evaluating the lookups availabitly and loading
            if (this.lookups.length > 0) {

              this.lookupsAvailable = true
            } else {

              this.lookupsAvailable = false
            }
            this.lookupLoading = false

          }, (error) => {
            //lookup retrieval api error handler
            this.rapidflowService.ShowErrorMessage("retrieveProcessLookupsWCF Lookups component", "Platform", "Error occured while executing api call", error, "An error occured whileretrieveProcessLookupsWCF", " socket.retrieveProcessLookupsWCF", this.processId, true);

          });
      } catch (error) {
        this.lookupLoading = false
      }
    })
  }

  /**
   * method to navigate to selected process lookup item list view
   * 
   * @param {any} item 
   * @memberof ProcessLookupsComponent
   */
  moveTolookups(item) {
    this.router.navigate(['main', 'process', this.processId, 'Lookup', item.LookupID]);
  }

  ngOnDestroy(){
    try{
      this.paramSubscription.unsubscribe();
    }
    catch(ex)
    {
      
    }
    
   }
}
