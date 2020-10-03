/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: OutOfOfficeDialogComponent
Description: Provide functionality to view and setup the out of office details in both process and application context.
Location: ./out-of-office-dialog.component.ts
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
  selector: 'app-out-of-office-dialog',
  templateUrl: './out-of-office-dialog.component.html',
  styleUrls: ['./out-of-office-dialog.component.css']
})
export class OutOfOfficeDialogComponent implements OnInit {
  public outOfOfficeDetails: any = {
    Delegated_To: []
  }
  public startDate: any;//out of office delegation start date
  public endDate: any;//out of office delegation end date

  //out of office assigneee people picker options
  public outOfOfficeAssigneeOptionsJSON: any = {
    "defaultValue": "",
    "disabled": false,
    "readonly": false,
    "visible": true,
    "required": false,
    "validationText": "Please enter out of office assignee"
  }

  //out of office assignee end date picker options
  public endDateOptions: any = {
    "defaultValue": "",
    "disabled": false,
    "readonly": false,
    "visible": true,
    "required": true,
    "validationText": "End Date cannot be blank",
    "pickerType": "calendar",
    "pickerMode": "popup",
    "startView": "month",
    "startAt": null,
    "hour12Timer": null,
    "stepHour": null,
    "stepSecond": null,
    "minDate": null,
    "maxDate": null,
    "selectMode": "single",
    "rangeSeparator": ""
  }
  //out of office assignee start date picker options
  public startDateOptions: any = {
    "defaultValue": "",
    "disabled": false,
    "readonly": false,
    "visible": true,
    "required": true,
    "validationText": "Start Date cannot be blank",
    "pickerType": "calendar",
    "pickerMode": "popup",
    "startView": "month",
    "startAt": null,
    "hour12Timer": null,
    "stepHour": null,
    "stepSecond": null,
    "minDate": null,
    "maxDate": null,
    "selectMode": "single",
    "rangeSeparator": ""
  }
  /**
   * Default constructor with dependency injection of all necessary objects and services 
   * @param dialogRef 
   * @param alertDialog 
   * @param data 
   */
  constructor(public dialogRef: MatDialogRef<OutOfOfficeDialogComponent>, public alertDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.outOfOfficeDetails["Start_Date"] = new Date();
    this.outOfOfficeDetails["End_Date"] = new Date();

  }

  /**
  * Component initialization lifecycle hook which needs to be overridden
  */
  ngOnInit() {
  }

  /**
   * Save current out of office start end dates and assignee name if clicked on save
   */
  saveOutOfOfficeDetails() {
    if (this.outOfOfficeDetails["Delegated_To"] == undefined || this.outOfOfficeDetails["Delegated_To"].length == 0) {
      //show message if out of office assignee not selected
      this.alertDialog.open(AlertDialogComponent, {
        data: {
          title: "Rapidflow Nex Gen",
          message: "Please select out of office assignee"
        }
      });
      return;
    }
    //if start date greater than end date
    if (this.outOfOfficeDetails["Start_Date"].toISOString() > this.outOfOfficeDetails["End_Date"].toISOString()) {
      this.alertDialog.open(AlertDialogComponent, {
        data: {
          title: "Rapidflow Nex Gen",
          message: "Start date should be less than End date"
        }
      });
      return;
    }
    this.dialogRef.close(this.outOfOfficeDetails);
  }
}
