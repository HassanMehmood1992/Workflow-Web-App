/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcesWrapperComponent
Description: Provide functionality to render the list of process objects list. This view renders in process context below the header bar. 
Location: ./proces-wrapper.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { EventEmiterService } from './../../services/event-emiters.service';
import { ProcessDataService } from './../../services/process-data.service';
import { RapidflowService } from './../../services/rapidflow.service';


import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

declare var jquery: any;//jquery var declaration
declare var $: any;//jquery var declaration

/**
 * component decorator
 * 
 * @export
 * @class ProcesWrapperComponent
 * @implements {OnInit}
 */
@Component({

  selector: 'app-proces-wrapper',
  templateUrl: './proces-wrapper.component.html',
  styleUrls: ['./proces-wrapper.component.css']
})
export class ProcesWrapperComponent implements OnInit {

  Counts: object // conatins task count and unread notification counts

  public newnotification: boolean //flag for new notification indicator
  public newtask: boolean //flag for task indicator
  public processId: any // contain current process id


  /**
   * Creates an instance of ProcesWrapperComponent.
   * @param {EventEmiterService} data 
   * @param {ActivatedRoute} route 
   * @param {Router} router 
   * @param {RapidflowService} RapidflowService 
   * @param {ProcessDataService} ProcessDataService 
   * @memberof ProcesWrapperComponent
   */
  constructor(private data: EventEmiterService, private route: ActivatedRoute, private router: Router, private RapidflowService: RapidflowService, public ProcessDataService: ProcessDataService) {
    this.Counts = { "ProcessID": 0, "TasKCount": 0, "NotificationCount": 0 };
    this.newnotification = false
    this.newtask = false
    $('.mat-tab-header-pagination').attr('style', 'display:auto')
    $('mat-ink-bar').hide()

    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      // get current processID from activated route
      this.processId = params.get('ProcessID');
    })
  }

  /**
   * navigate to option selected in dropdown menu
   * 
   * @param {any} option 
   * @memberof ProcesWrapperComponent
   */
  moveToOptions(option) {
    if (option == "ProcessSettings") {
      this.router.navigate(['main', 'process', this.processId, option, 'general']);
    }
    else {
      this.router.navigate(['main', 'process', this.processId, option]);
    }
  }

  /**
   * component initialization lifecycle hook
   * 
   * @memberof ProcesWrapperComponent
   */
  ngOnInit() {

    // receive information from event emitter service to update the new notification and task indicator 
    this.data.currentMessage.subscribe(message => this.CalculateCount(message))
  }

  /**
   * parse the message received from event emitter service and update the counts indicator
   * 
   * @param {any} message 
   * @memberof ProcesWrapperComponent
   */
  CalculateCount(message) {
    if (message["Type"] == "ProcessCount") {
      this.Counts = message["Value"]
    } else if (message["Type"] == "NotificationCountCalculation") {

    }
  }
}
