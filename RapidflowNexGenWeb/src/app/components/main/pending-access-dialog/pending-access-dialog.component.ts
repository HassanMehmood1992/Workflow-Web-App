/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PendingAccessDialogComponent
Description: Provide functionality to view the pending access request details of process from favourites view present in side navigaiton bar.
Location: ./main/pending-access-dialog.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { RapidflowService } from './../../../services/rapidflow.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

import { FormatdatePipe } from './../../../pipes/formatdate.pipe';


/**
  * component decorator
  */
@Component({
  selector: 'app-pending-access-dialog',
  templateUrl: './pending-access-dialog.component.html',
  styleUrls: ['./pending-access-dialog.component.css']
})
export class PendingAccessDialogComponent implements OnInit {

  public pendingAccess: any // stores pending access request details

  /**
* Default constructor with dependency injection of all necessary objects and services 
*/
  constructor(public dialogRef: MatDialogRef<PendingAccessDialogComponent>, public rapidflowService: RapidflowService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.pendingAccess = data.PendingAccess; //sets the details of pending access request.


  }
  /**
  * component initialization lifecycle hook
  */

  ngOnInit() {


  }
}
