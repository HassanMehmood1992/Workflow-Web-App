/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DiagnosticLoggingApplicationComponent
Description: Provide functionality to render the diagnostic log view in application context.
Location: ./diagnostic-logging-application.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit } from '@angular/core';

  /**
 * Component decorator 
 */
@Component({
  selector: 'app-diagnostic-logging-application',
  templateUrl: './diagnostic-logging-application.component.html',
  styleUrls: ['./diagnostic-logging-application.component.css']
})
export class DiagnosticLoggingApplicationComponent implements OnInit {

  /**
   * Default constructor 
   */
  constructor() { }

  /**
   * Component initialization lifecycle hook which needs to be overridden
   */
  ngOnInit() {
  }

}
