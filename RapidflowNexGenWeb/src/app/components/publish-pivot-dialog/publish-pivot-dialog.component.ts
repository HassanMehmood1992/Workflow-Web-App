
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PublishPivotDialogComponent
Description: Dialog to allow user to publish and new pivot after modifying an existing pivot and give permisions to roles on that pivot.
Location: ./components/publish-pivot-dialog.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/

import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { RapidflowService } from '../../services/rapidflow.service';
import { ProcessDataService } from '../../services/process-data.service';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import { Router } from '@angular/router';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';


/**
 * Component decorator
 */
@Component({
    selector: 'app-publish-pivot-dialog',
    templateUrl: './publish-pivot-dialog.component.html',
    styleUrls: ['./publish-pivot-dialog.component.css']
})
export class PublishPivotDialogComponent {
    processRolesControl = new FormControl();//process roles multiselect form control
    pivotInfo: any;//current pivot info passed to dialog
    pivotTitle: string = "";//current pivot title to show on dialog
    pivotDescription: string = "";//pivot description text area model
    selectedRoles: any = [];//roles multi dropdown model
    pivotPublishing: boolean = false;//flag set while publishing pivot to show loading
    operationType: string;//operation to perform on pivot i.e. add new, delete or update
    buttonText: string;//button text changed according to operation
    currentPermissions: any;//current pivot permssions
    pivotDialogTitle: string;//dialog title based on operation
    processId: number;//current selected process id
    progressDialogRef: any;//refernce to progress dialog

    /**
     * Default constructor with dependency injection of requried services and references
     * @param dialogRef 
     * @param rapidflowService 
     * @param ProcessDataService 
     * @param progressDialog 
     * @param router 
     * @param alertDialog 
     * @param data 
     */

    constructor(
        public dialogRef: MatDialogRef<PublishPivotDialogComponent>, public rapidflowService: RapidflowService, private ProcessDataService: ProcessDataService, private progressDialog: MatDialog, private router: Router, public alertDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.pivotInfo = data.PivotInfo;
        this.operationType = data.OperationType;
        this.processId = data.ProcessId;

    }

    /**
     * Component initialization lifecycle hook to initialize dialog controls
     */
    ngOnInit() {
        if (this.operationType == "Update") {
            this.buttonText = "Update";
            this.initializeExistingPivotDialog();
            this.pivotDialogTitle = "Update Pivot";
        }
        else {
            this.buttonText = "Publish";
            this.pivotDialogTitle = "Publish As New Pivot";
        }
    }

    /**
     * Performs add or update operation 
     */
    pivotOperation() {
        if (this.pivotTitle == "") {
            this.alertDialog.open(AlertDialogComponent, {

                data: {
                    title: "Rapidflow Nex Gen",
                    message: "Please provide pivot title"
                }
            });
            return;
        }
        if (this.operationType == "New") {
            this.publishNewPivot();
        }
        else if (this.operationType == "Update") {
            this.updateExistingPivot();
        }
    }

    /**
     * Publish a new pivot 
     */
    publishNewPivot() {
        try {
            let objectDescription: any = {};//pivot object description
            let objectValue: any = {};//pivot object value
            //set pivot object settings to add in database
            objectValue.Settings = {};
            objectDescription.Title = this.pivotTitle;
            objectDescription.Description = this.pivotDescription;
            objectDescription.Type = "ProcessPivot";
            objectDescription.Availability = "Both";
            objectDescription.MinimumDimensions = "1300";
            //publisher of pivot
            objectDescription.PublisherEmail = JSON.parse(window.localStorage['User']).Email;
            objectValue.Settings.DataSelection = this.pivotInfo.dataSelection;
            objectValue.Settings.Cols = this.pivotInfo.cols;
            objectValue.Settings.Rows = this.pivotInfo.rows;
            objectValue.Settings.RendererName = this.pivotInfo.rendererName;
            objectValue.Settings.AggregatorName = this.pivotInfo.aggregatorName;
            objectValue.Settings.Inclusions = this.pivotInfo.inclusions;
            objectValue.Settings.Vals = this.pivotInfo.vals;
            this.progressDialogRef = this.showProgressDialog("Publishing pivot...");
            //add pivot api call
            this.rapidflowService.insertProcessObject(this.processId, encodeURIComponent(JSON.stringify(objectDescription)), encodeURIComponent(JSON.stringify(objectValue)))
                .subscribe((response) => {

                    let newPivotID = JSON.parse(response.json()).ProcessObjectId;
                    this.setPivotPermissions(newPivotID, objectDescription);
                }, (error) => {
                    this.progressDialog.closeAll()
                    this.rapidflowService.ShowErrorMessage("insertProcessObject publish pivot dialog component", "Platform", "Error occured while executing api call", error, "An error occured while insertProcessObject", " RapidflowService.insertProcessObject", this.processId, true);
                });
        }
        catch (error) {
            this.rapidflowService.ShowErrorMessage("insertProcessObject publish pivot dialog component", "Platform", "Error occured while publishing new pivot", error, error.stack, "N/A", this.processId, true);
        }
    }

    updateExistingPivot() {
        try {
            let objectDescription: any = {};//pivot object desription 
            objectDescription.Title = this.pivotTitle;//new pivot title
            objectDescription.Description = this.pivotDescription;//new pivot description
            //default pivot properties
            objectDescription.Type = "ProcessPivot";
            objectDescription.Availability = "Both";
            objectDescription.MinimumDimensions = "800";
            objectDescription.PublisherEmail = JSON.parse(window.localStorage['User']).Email;
            this.progressDialogRef = this.showProgressDialog("Saving changes...");
            //update pivot api call
            this.rapidflowService.pivotOperations(this.processId, "UPDATE", this.pivotInfo.ProcessObjectID, encodeURIComponent(JSON.stringify(objectDescription))).subscribe((response) => {
                let returnPivotObject = {
                    PivotID: this.pivotInfo.ProcessObjectID,
                    PivotTitle: this.pivotTitle,
                    PivotDescription: this.pivotDescription,
                    PivotPermissions: ""
                }
                let tempPermissions = JSON.parse(JSON.stringify(this.currentPermissions));

                //update local permission object
                for (let i = 0; i < this.selectedRoles.length; i++) {
                    for (let j = 0; j < tempPermissions.length; j++) {
                        if (this.selectedRoles[i].toLowerCase() == tempPermissions[j].RoleName.toLowerCase()) {
                            if (tempPermissions[j].ViewPermission == "0") {
                                tempPermissions[j].ViewPermission = "1";
                            }
                        }
                    }
                }

                for (let i = 0; i < tempPermissions.length; i++) {
                    if (tempPermissions[i].ViewPermission == "1") {
                        let roleNotRemoved = false;
                        for (let j = 0; j < this.selectedRoles.length; j++) {
                            if (this.selectedRoles[j].toLowerCase() == tempPermissions[i].RoleName.toLowerCase()) {
                                roleNotRemoved = true;
                                break;
                            }
                        }
                        if (!roleNotRemoved) {
                            tempPermissions[i].ViewPermission = "0";
                        }
                    }
                }

                //return new object to pivot list
                returnPivotObject.PivotPermissions = JSON.stringify(tempPermissions);



                this.dialogRef.close(returnPivotObject);

                this.updatePivotPermissions();

            }, (error) => {
                this.progressDialog.closeAll()
                this.rapidflowService.ShowErrorMessage("pivotOperations publish pivot dialog component", "Platform", "Error occured while executing api call", error, "An error occured while pivotOperations", " RapidflowService.pivotOperations", this.processId, true);
            });
        }
        catch (error) {
            this.rapidflowService.ShowErrorMessage("updateExistingPivot publish pivot dialog component", "Platform", "Error occured while updating existing pivot", error, error.stack, "N/A", this.processId, true);
        }
    }

    /**
     * Set control values for existing pivot while updating
     */
    initializeExistingPivotDialog() {
        try {
            this.pivotTitle = this.pivotInfo.Title;
            this.pivotDescription = this.pivotInfo.Description;
            this.currentPermissions = JSON.parse(this.pivotInfo.CurrentPermissions);
            this.pivotInfo.currentProcessRoles = [];
            for (let i = 0; i < this.currentPermissions.length; i++) {
                let roleObject: any = {};
                roleObject.RoleName = this.currentPermissions[i].RoleName;
                this.pivotInfo.currentProcessRoles.push(roleObject);
                if (this.currentPermissions[i].ViewPermission == "1") {
                    this.selectedRoles.push(this.currentPermissions[i].RoleName);
                }
            }
        }
        catch (error) {
            this.rapidflowService.ShowErrorMessage("initializeExistingPivotDialog publish pivot dialog component", "Platform", "Error occured while initializing existing pivot", error, error.stack, "N/A", this.processId, true);
        }
    }

    /**
     * Set bew pivot permssions 
     * @param newPivotID 
     * @param objectDescription 
     */
    setPivotPermissions(newPivotID, objectDescription) {
        try {
            let roleParameter = "";
            for (let i = 0; i < this.selectedRoles.length; i++) {
                roleParameter += this.selectedRoles[i] + ",";
            }
            let itemType = "ProcessObject";
            roleParameter = roleParameter.substring(0, roleParameter.length - 1)

            this.rapidflowService.addProcessItemPermissions(this.processId, roleParameter, itemType, newPivotID)
                .subscribe((response) => {
                    let newPivotPermissions = JSON.parse(response.json());
                    objectDescription.CurrentPermissions = newPivotPermissions[0].CurrentPermissions;
                    objectDescription.ProcessObjectID = parseInt(newPivotID);
                    this.progressDialogRef.close(true);
                    this.dialogRef.close(objectDescription);

                }, (error) => {
                    this.progressDialog.closeAll()
                    this.rapidflowService.ShowErrorMessage("addProcessItemPermissions publish pivot dialog component", "Platform", "Error occured while executing api call", error, "An error occured while addProcessItemPermissions", " RapidflowService.addProcessItemPermissions", this.processId, true);
                });
        }
        catch (error) {
            this.rapidflowService.ShowErrorMessage("setPivotPermissions publish pivot dialog component", "Platform", "Error occured while setting pivot permissions", error, error.stack, "N/A", this.processId, true);
        }
    }

    /**
     * Update existing pivot permissions
     */
    updatePivotPermissions() {
        try {
            let viewPermissionID = this.currentPermissions[0].ViewPermissionID;
            let currentPermissionString = "";
            //generate permissions string 
            for (let i = 0; i < this.currentPermissions.length; i++) {
                //remove permssion for role
                if (this.currentPermissions[i].ViewPermission == "1") {
                    if (this.selectedRoles.indexOf(this.currentPermissions[i].RoleName) == -1) {
                        currentPermissionString += "REMOVE;ProcessPivots;" + this.currentPermissions[i].RoleId + ";" + viewPermissionID + ";" + this.pivotInfo.ProcessObjectID + "-op-";
                    }
                }
                else if (this.currentPermissions[i].ViewPermission == "0") {
                    //add permsison for role
                    if (this.selectedRoles.indexOf(this.currentPermissions[i].RoleName) != -1) {
                        currentPermissionString += "ADD;ProcessPivots;" + this.currentPermissions[i].RoleId + ";" + viewPermissionID + ";" + this.pivotInfo.ProcessObjectID + "-op-";
                    }
                }
            }
            currentPermissionString = currentPermissionString.substring(0, currentPermissionString.length - 4);
            //edit permssions api call
            this.rapidflowService.editRolePermissions(currentPermissionString).subscribe((response) => {

                this.progressDialogRef.close();


            }, (error) => {
                this.progressDialog.closeAll()
                this.rapidflowService.ShowErrorMessage("editRolePermissions publish pivot dialog component", "Platform", "Error occured while executing api call", error, "An error occured while editRolePermissions", " RapidflowService.editRolePermissions", this.processId, true);
            });
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("updatePivotPermissions-Pivot publishing dialog component", "Platform", ex.message, ex.stack, "An error occured while updating pivot permissions", "N/A", this.processId, true);
        }
    }

    /**
     * show progress dialog while performing operation
     * @param message 
     */
    showProgressDialog(message) {
        let dialogRef: any;
        dialogRef = this.progressDialog.open(ProgressDialogComponent, {
            data: {
                message: message
            }
        });
        return dialogRef;
    }

    /**
     * Close dialog on click outside
     */
    onNoClick(): void {
        this.dialogRef.close();
    }
}
