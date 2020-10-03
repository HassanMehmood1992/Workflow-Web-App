/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ApplicationErrorLogsComponent
Description: Provide functionality to show the error log view in process context.
Location: ./application-error-logs.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit } from '@angular/core';
/**
  * component decorator
  */
@Component({
  selector: 'app-application-error-logs',
  templateUrl: './application-error-logs.component.html',
  styleUrls: ['./application-error-logs.component.css']
})
export class ApplicationErrorLogsComponent implements OnInit {
  /**
  * Default constructor of class
  */
  constructor() { }
 /**
  * component initialization lifecycle hook which is needed to be overridden
  */
  ngOnInit() {
  }

}
