/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DataFilterDialogComponent
Description: Provide functionality to inform the user about the data is trimed from server side.
Location: ./data-filter-dialog.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
/**
  * component decorator
  */
@Component({
  selector: 'app-data-filter-dialog',
  templateUrl: './data-filter-dialog.component.html',
  styleUrls: ['./data-filter-dialog.component.css']
})
export class DataFilterDialogComponent implements OnInit {
  public dialogType:string="dataFilterInEffectMessage"//dialog type to show either data filter in effect or oragnizations filter dialog default is data filter dialog
  organizations:any;//all organizations passed to the dialog to render organizatios table
  selectedOrganization:string="";//current selected organization model

  /**
   * Default constructor with dependency injection of all necessary objects and services 
   * @param dialogRef 
   * @param data 
   */
  constructor( private dialogRef: MatDialogRef<DataFilterDialogComponent>,@Inject(MAT_DIALOG_DATA) public data: any) { 
    if(data!=undefined && JSON.stringify(data) != "{}" && data.DialogType != undefined)
    {
      this.dialogType=data.DialogType;
    }
    if(this.dialogType=='directoryOraganizationFilter'){
      this.organizations=data.Organizations;
      this.selectedOrganization=data.SelectedOrganization;
    }
  }

  /**
  * Component initialization lifecycle hook needed to be overridden 
  */
  ngOnInit() {
  }
 
  /**
  * Close current dialog
  */
  closeDialog(){
    this.dialogRef.close();
  }
/**
 * Apply filter according to selected organization
 * @param organization 
 */
  applyFilter(organization){
    this.dialogRef.close(organization);
  }
  
  /**
  * Clear selected organization filter
  */
  clearFilter(){
    this.dialogRef.close("");
  }

}
