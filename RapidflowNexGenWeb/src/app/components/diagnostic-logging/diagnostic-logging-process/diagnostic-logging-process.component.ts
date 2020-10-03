/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DiagnosticLoggingProcessComponent
Description: Provide functionality to render the diagnostic log view in process context.
Location: ./diagnostic-logging-process.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit } from '@angular/core';

/**
 * Component Decorator
 */
@Component({
  selector: 'app-diagnostic-logging-process',
  templateUrl: './diagnostic-logging-process.component.html',
  styleUrls: ['./diagnostic-logging-process.component.css']
})
export class DiagnosticLoggingProcessComponent implements OnInit {

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
