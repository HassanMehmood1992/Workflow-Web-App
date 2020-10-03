/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProxyApproverDialogComponent
Description: Dialog to set proxy approver for application or process.
Location: ./components/proxy-approver-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl } from '@angular/forms';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
/**
 * Component decorator
 */
@Component({
  selector: 'app-proxy-approver-dialog',
  templateUrl: './proxy-approver-dialog.component.html',
  styleUrls: ['./proxy-approver-dialog.component.css']
})
export class ProxyApproverDialogComponent implements OnInit {
  public proxyApproverDetails: any = [];//proxy approver details model object
  //proxy apprver people picker options 
  public proxyAssigneeOptionsJSON: any = {
    "defaultValue": "",
    "disabled": false,
    "readonly": false,
    "visible": true,
    "required": false,
    "validationText": "Please enter out of office assignee"
  }

  /**
   * Default construtor with dependency injection of requried services and references
   * @param dialogRef 
   * @param alertDialog 
   * @param data 
   */
  constructor(public dialogRef: MatDialogRef<ProxyApproverDialogComponent>, public alertDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {


  }

  /**
   * Component initialization lifecycle hook
   */
  ngOnInit() {
  }

  /**
   * Update proxy with selected user
   */
  saveProxyApproverDetails() {
    if (this.proxyApproverDetails.length == 0) {
      this.alertDialog.open(AlertDialogComponent, {

        data: {
          title: "Rapidflow Nex Gen",
          message: "Please select proxy assignee"
        }
      });
      return;
    }
    this.dialogRef.close(this.proxyApproverDetails);
  }
}
