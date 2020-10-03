/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AppComponent
Description: Starting component of the application
Location: app/app.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/

//requried imports
import { Component } from '@angular/core';
import { environment } from '../environments/environment';

/**
 * Component decorator
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'RFNG';//html title
  /**
   * Default constructor of app component
   */
  constructor(){
    
  }
  
  
}


