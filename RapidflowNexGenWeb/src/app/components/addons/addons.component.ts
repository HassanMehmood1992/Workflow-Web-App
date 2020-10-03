/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AddonsComponent
Description: Provide functionality to view the list of addons available for the current logged in user.
Location: ./addons.component.ts
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
  */
@Component({
  selector: 'app-addons',
  templateUrl: './addons.component.html',
  styleUrls: ['./addons.component.css']
})
export class AddonsComponent implements OnInit {

  public addOns: any //current list of addons of selected process id
  public processId: any //current selected process id
  public addonsLoading: boolean = true; //loading state of addons
  public addOnsAvailable: boolean //if no is present in addons
  public searchStr = "" // string to filter with search string
  public sort: boolean // flag to sort the addons
  public sortObject = { "ProcessObjectID": "asc" };// sort object to sort the addons with respect to addon internal id
  public sortObjectAscending = { "Title": "asc" };// sort object to sort the addons with respect to addon name in asending order


  /**
  * Default constructor with dependency injection of all necessary objects and services 
  */
  constructor(private RapidflowService: RapidflowService, private route: ActivatedRoute, private router: Router, private ProcessDataService: ProcessDataService, private SortListsService: SortListsService) {
    this.addOnsAvailable = true
    this.addOns = []
    this.sort = false
  }

  // sorting the addons.
  sortArray() {
    if (this.sort) {
      //send and receive the sorted addon object with addon name in assending order
      this.addOns = this.SortListsService.sort(this.addOns, this.sortObjectAscending)
    } else {
      //send and receive the sorted addon object with default internal Addon ids
      this.addOns = this.SortListsService.sort(this.addOns, this.sortObject)
    }
  }

  /**
  * component initialization lifecycle hook
  */
 ngOnInit() {
    try {
      this.addOns = []
      // assigning jquery event to record search string from header component to filter
      $("#filterSearch").on('input', () => {
        this.searchStr = $("#filterSearch").val()

      });
     // assigning jquery event to record the flag to apply filter on addons from header component
      $("#searchOn").click(() => {
        this.searchStr = ''
      });
     // assigning jquery event to record the flag to remove filter on addons from header component
      $("#searchOff").click(() => {
        this.searchStr = ''

      });
     // assigning jquery event to apply the sort on addons from header component
      $("#sortOn").click(() => {
        this.sort = true

        this.sortArray()

      });

       // assigning jquery event to remove the sort on addons from header component
      $("#sortOff").click(() => {
        this.sort = false
        this.sortArray()

      });

      this.route.parent.parent.paramMap
        .subscribe((params: ParamMap) => {
        //retrieving current process id from route provider.
          this.processId = +params.get('ProcessID');
          //retrieving addons from processData service.
          var timeinterval = setInterval(() => {
            if (this.ProcessDataService.addons != undefined && this.ProcessDataService.addons != null && this.ProcessDataService.objectsLoading == false) {

              this.addOns = this.ProcessDataService.addons;
              if (this.addOns.length > 0) {
                this.addOnsAvailable = true
            
              } else {

                this.addOnsAvailable = false
              }

              this.sort = false;
            //default sorting on addons
              this.sortArray();
              clearInterval(timeinterval);
              this.addonsLoading = false;
              return;
            }
          }, 1000);
        });
    } catch (ex) {
      this.RapidflowService.ShowErrorMessage("ngOnInit-addons component", "Platform", ex.message, ex.stack, "An error occured while initiang addons view", "N/A", this.processId, true);
    }
  }
  /**
  * navigate to selected addon-page
  */
  moveToAddons(item) {
    this.router.navigate(['main', 'process', this.processId, 'addOn', item.ProcessObjectID]);
  }
 

}