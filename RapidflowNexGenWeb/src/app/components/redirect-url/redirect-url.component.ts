/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: RedirectUrlComponent
Description: Provides the funationlity to redirct user to request form using url with request paremeters.
Location: ./components/redirect-url.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/

import { RapidflowService } from './../../services/rapidflow.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
/**
 * component decorator
 * 
 * @export
 * @class RedirectUrlComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-redirect-url',
  templateUrl: './redirect-url.component.html',
  styleUrls: ['./redirect-url.component.css']
})
export class RedirectUrlComponent implements OnInit {
  referenceNumber: any;// to store the reference number present in url paramater
  shareType: any;// to store the destination of requested url
  processID: any;// to store the process id present in url parameter
  workflowID: any;// to store the workflow id present in url parameter
  formID: any;// to store the form id present in url parameter
  /**
   * Creates an instance of RedirectUrlComponent.
   * @param {ActivatedRoute} route 
   * @param {RapidflowService} rapidflowService 
   * @param {Router} rtr 
   * @memberof RedirectUrlComponent
   */
  constructor(private route: ActivatedRoute, private rapidflowService: RapidflowService, private rtr: Router) { }

  /**
   * component initialization lifecycle hook
   * 
   * @memberof RedirectUrlComponent
   */
  ngOnInit() {
    RapidflowService.redirectURL = window.location.href
    this.rapidflowService.checkcurrentloogedinUser()

    //reading url parameters
    this.route.queryParamMap
      .subscribe(params => {
        this.shareType = params['params'].route;
        this.processID = params['params'].processID;
        this.workflowID = params['params'].workflowID;
        this.referenceNumber = params['params'].reference;
        this.formID = params['params'].formID;

        // decision if the shared url is pointing towards the process or the process form
        if (this.shareType == 'process') {
          // in case the android or ios application is installed 
          window.location.href = 'rfng://about-us?route=processRedirect&processId=' + this.processID;
          setTimeout(() => {
            this.rtr.navigate(['main', 'process', this.processID]);
          }, 1000);
        }
        else {
          // in case the android or ios application is installed 
          window.location.href = 'rfng://about-us?route=formRedirect&processId=' + this.processID + '&workflowId=' + this.workflowID + '&formId=' + this.formID + '&reference=' + this.referenceNumber;
          setTimeout(() => {
            this.rtr.navigate(['main', 'process', this.processID, 'form', this.workflowID, this.formID]);
          }, 1000);
        }
      });
  }
}
