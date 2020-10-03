/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessErrorLogsComponent
Description: Renders the error log view for a process.
Location: ./components/process-error-logs.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/

import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

/**
 * Component decorator
 */
@Component({
  selector: 'app-process-error-logs',
  templateUrl: './process-error-logs.component.html',
  styleUrls: ['./process-error-logs.component.css']
})
export class ProcessErrorLogsComponent implements OnInit {
  processId: any;//current selected process id

  /**
   * Default constructor with router and activated route depency injection
   * @param rtr 
   * @param route 
   */
  constructor(private rtr: Router, private route: ActivatedRoute) { }

  /**
   * Component initialization lifecycle hook
   */
  ngOnInit() {
    this.route.parent.paramMap
      .subscribe((params: ParamMap) => {
        //get current process id
        this.processId = +params.get('ProcessID');

      });
  }

  /**
   * Go back to previous route
   */
  goback() {

    this.rtr.navigate(['main', 'process', this.processId, 'home', 'tasks']);
  }
}
