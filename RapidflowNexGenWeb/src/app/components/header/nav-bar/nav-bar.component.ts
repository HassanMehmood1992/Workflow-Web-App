/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: NavBarComponent
Description: Provide functionality to set the navigation bar for each view.
Location: ./nav-bar.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

/**
  * component decorator
  */
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  @Input() NavArray: any; //array containing previous states information for navigating back 


  /**
  * Default constructor with dependency injection of all necessary objects and services 
  */
  constructor(private router: Router) {

    this.NavArray = []
    this.NavArray.push({ url: '', imagesrc: '', text: '' })
  }
  /**
  * component initialization lifecycle hook
  */
  ngOnInit() {
  }
  /**
  * go back to previous state
  */
  goback(urlto, item) {
    if (urlto == "Back") {
      this.router.navigate(item.urlBack)
    }

  }

}
