/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessAdminPannelComponent
Description: Allows a user with appropriate permssions to add or remove users from a role.
Location: ./components/process-admin-panel.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/

import { Component, OnInit, Inject } from '@angular/core';
import { RapidflowService } from './../../services/rapidflow.service';
import * as $ from 'jquery'
import 'datatables.net/js/jquery.dataTables.js';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { UserAndDevicesComponent } from '../user-and-devices/user-and-devices.component';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import { ProcessDataService } from '../../services/process-data.service';
/**
 * Component decorator
 */
@Component({
    selector: 'app-process-admin-pannel',
    templateUrl: './process-admin-pannel.component.html',
    styleUrls: ['./process-admin-pannel.component.css']
})
export class ProcessAdminPannelComponent implements OnInit {
    currentProcessID: number;//current selected process id
    allPermissionsRows: any;//all permission rows of the process returned from api call
    groupRoles: any;//groups assinged to roles array
    permissionViewJSON: any;//schema to render access management table
    currentUserIsSupportPerson: boolean = false;//current user in support group flag
    adminPanelTable: any;//datable object to store admin panel datatable
    noPermission: boolean = false;//user dont have permssion on access management flag
    currentLoggedInUser;//current logged in user object
    adminPanelLoading: boolean = true;//admin panel loading flag to show loading
    disntinctRolesWithEveryoneFlag: any;//roles for which everyone is allowed
    adminPanelChanging: boolean = false;//admin panel in changing state
    currentUserIsOwner: boolean = false;//current user is process owner flag
    paramSubscription:any;//parameter subscription to be destroyed

    /**
     * Default constructor with dependency injection of all necessary objects and services 
     * @param rapidflowService 
     * @param route 
     * @param router 
     * @param viewPermissionsDialog 
     * @param editUsersDialog 
     * @param processDataService 
     */
    constructor(private rapidflowService: RapidflowService, private route: ActivatedRoute, private router: Router, private viewPermissionsDialog: MatDialog, private editUsersDialog: MatDialog, private processDataService: ProcessDataService) { }
    /**
     * Navigates back to previous state
     */
    goback() {

        this.router.navigate(['main', 'process', this.currentProcessID, 'home', 'tasks']);
    }
    /**
     * Component initialization lifecycle hook. Retrieves process permissions and renders access management table
     */
    ngOnInit() {
        //get activated route parameters
        if(window.localStorage['User']==undefined)
        {
           return;
        }
        else{
          this.currentLoggedInUser=JSON.parse(window.localStorage["User"]);
        }
        this.paramSubscription=this.route.parent.parent.params.subscribe(params => {

            this.currentProcessID = parseInt(params['ProcessID']);
            
            //retrieve current process permission api call
            this.rapidflowService.retrieveProcessPermissions(this.currentProcessID).subscribe((response) => {
                let tempPermissions = JSON.parse(response.json());


                //show no permission message is not authorized returned from api call
                if (tempPermissions[0].ProcessPermissions[0].Result == "No Permission") {
                    this.noPermission = true;
                    this.adminPanelLoading = false;
                }
                else {

                    //render table according to process permissions
                    this.allPermissionsRows = tempPermissions[0].ProcessPermissions;
                    this.groupRoles = tempPermissions[0].GroupRoles;
                    this.checkIfUserIsSupportPerson(1000);
                    this.generatePermissionViewJSON();
                    this.generatePermissionsTable();

                }

            }, (error: any) => {

                this.rapidflowService.ShowErrorMessage("retrieveProcessPermissions-Admin Panel component", "Process", "Error occured while executing api call", error, "An error occured while retrieveProcessPermissions", " RapidflowServices.retrieveProcessPermissions", this.currentProcessID, false);


            });

            //retrieve roles with everyone flag to allow or not allow to add everyone in a role
            this.rapidflowService.retrieveRoles(this.currentProcessID).subscribe((response) => {
                this.disntinctRolesWithEveryoneFlag = JSON.parse(response.json());

            }, (error: any) => {

                this.rapidflowService.ShowErrorMessage("retrieveRoles-Admin Panel component", "Process", "Error occured while executing api call", error, "An error occured while retrieveRoles", " RapidflowServices.retrieveRoles", this.currentProcessID, false);


            });
        });
    }

    /**
     * Compares current user info with support operations group and checks if current user is in support group
     */
    checkIfUserIsSupportPerson(refreshTime) {

        //retrieve userprocess settings from process data service to get support group
        var processUserSettingsInterval = setInterval(() => {
            if (this.processDataService.userProcessSettings != undefined && this.processDataService.userProcessSettings != null) {

                let supportOperationsGroup = this.processDataService.userProcessSettings[0].Support_Operations_Group;



                //iterate through support operations group
                for (var i = 0; i < supportOperationsGroup.length; i++) {
                    if (supportOperationsGroup[i].Email.toLowerCase() == this.currentLoggedInUser.Email.toLowerCase()) {
                        this.currentUserIsSupportPerson = true;//this means user has user administration permission
                        break;
                    }
                }
                //check if current user is process owner
                this.currentUserIsOwner = this.checkIfUserIsOwner();

                //show admin edit button if user is in support group
                if (this.currentUserIsSupportPerson) {
                    $("#adminNoEditButton").show();
                    $("#ownerNoEditButton").show();
                }

                //show owner wdit button if current is support person or owner
                if (this.currentUserIsOwner) {
                    $("#adminNoEditButton").show();
                }

                clearInterval(processUserSettingsInterval);
                return;
            }
        }, refreshTime)
    }

    /**
     * 
     */
    generatePermissionViewJSON() {
        try {
            this.permissionViewJSON = [];//reset permission view json
            let ItemTypes = [];//types of items to show permissions
            let flags = [];//used to retrieve unique values from permission data
            let iter = 0;//iteration count

            //getting unique roleids and rolenames
            for (let i = 0; i < this.allPermissionsRows.length; i++) {
                if (flags[this.allPermissionsRows[i].RoleName]) continue;

                if (this.allPermissionsRows[i].PermissionName != "NA") {
                    flags[this.allPermissionsRows[i].RoleName] = true;
                    this.permissionViewJSON[iter] = {};
                    this.permissionViewJSON[iter].RoleName = this.allPermissionsRows[i].RoleName;
                    this.permissionViewJSON[iter].RoleID = this.allPermissionsRows[i].RoleID;
                    iter++;
                }
            }
            //get all unique item types
            flags = [];
            iter = 0;
            for (let i = 0; i < this.allPermissionsRows.length; i++) {
                if (flags[this.allPermissionsRows[i].ItemType]) continue;


                flags[this.allPermissionsRows[i].ItemType] = true;
                ItemTypes[iter] = {}
                ItemTypes[iter].ItemType = this.allPermissionsRows[i].ItemType;
                iter++;

            }


            //generating users html in users string
            // 
            for (let i = 0; i < this.permissionViewJSON.length; i++) {
                this.permissionViewJSON[i].UserID = [];
                this.permissionViewJSON[i].UsersString = "";
                this.permissionViewJSON[i].UserEmails = "";
                for (let j = 0; j < this.allPermissionsRows.length; j++) {

                    if (this.permissionViewJSON[i].RoleName == this.allPermissionsRows[j].RoleName) {
                        if (this.permissionViewJSON[i].UsersString.indexOf(this.allPermissionsRows[j].UserName) == -1) {

                            if (this.allPermissionsRows[j].UserID == 0 && this.permissionViewJSON[i].UsersString.indexOf("Everyone") == -1) {
                                this.permissionViewJSON[i].UsersString += "Everyone" + "<br>";
                                this.permissionViewJSON[i].UserEmails += "Everyone" + "; ";
                            }
                            else if (this.allPermissionsRows[j].Email != null) {

                                this.permissionViewJSON[i].UsersString += this.allPermissionsRows[j].UserName + "<br>";
                                this.permissionViewJSON[i].UserEmails += this.allPermissionsRows[j].Email + "; ";
                                this.permissionViewJSON[i].UserID.push(this.allPermissionsRows[j].UserID);
                            }


                        }

                    }


                }
                this.permissionViewJSON[i].UsersString = this.permissionViewJSON[i].UsersString.substring(0, this.permissionViewJSON[i].UsersString.length - 4);
                this.permissionViewJSON[i].UserEmails = this.permissionViewJSON[i].UserEmails.substring(0, this.permissionViewJSON[i].UserEmails.length - 2);

            }



            //genarating users objects from users strings
            for (let i = 0; i < this.permissionViewJSON.length; i++) {
                this.permissionViewJSON[i].UsersObjects = [];
                let currentUsers = this.permissionViewJSON[i].UsersString.split("<br>");
                let currentEmails = this.permissionViewJSON[i].UserEmails.split("; ");
                for (let j = 0; j < currentEmails.length; j++) {
                    this.permissionViewJSON[i].UsersObjects[j] = {};
                    this.permissionViewJSON[i].UsersObjects[j].DisplayName = currentUsers[j];
                    this.permissionViewJSON[i].UsersObjects[j].Email = currentEmails[j];

                }
                //removing other users from users string if everyone is present
                if (this.permissionViewJSON[i].UsersString.indexOf("Everyone") != -1) {
                    this.permissionViewJSON[i].UsersString = "Everyone";
                }
            }



            //get all permissions for a single user

            for (let i = 0; i < this.permissionViewJSON.length; i++) {

                this.permissionViewJSON[i].DistinctPermissionRows = [];
                for (let j = 0; j < this.allPermissionsRows.length; j++) {

                    if (this.permissionViewJSON[i].RoleID == this.allPermissionsRows[j].RoleID && this.permissionViewJSON[i].UserID[0] == this.allPermissionsRows[j].UserID) {
                        this.permissionViewJSON[i].DistinctPermissionRows.push(this.allPermissionsRows[j]);
                    }
                }

            }



            //genarating permissions html;
            let PermissionVal = "";
            let itemsAdded = [];


            //items types name aliases
            let itemTypeNamesToShow = {

                ProcessWorkflow: "Process Workflows",
                ProcessPivot: "Process Pivots",
                ProcessReport: "Process Reports",
                ProcessAddOn: "Process Add Ons",
                ProcessLookupObject: "Process Lookups",
                Process: "Process"


            }


            //generate permission html to show in popup

            for (let i = 0; i < this.permissionViewJSON.length; i++) {
                this.permissionViewJSON[i].Permission = ""
                let tempItemType = "";

                let hadPermissions = false;

                for (let j = 0; j < ItemTypes.length; j++) {



                    if (ItemTypes[j].ItemType != '') {
                        for (let k = 0; k < this.permissionViewJSON[i].DistinctPermissionRows.length; k++) {
                            if (ItemTypes[j].ItemType == this.permissionViewJSON[i].DistinctPermissionRows[k].ItemType) {


                                //new item type encountered
                                if (tempItemType != ItemTypes[j].ItemType) {
                                    this.permissionViewJSON[i].Permission += "<div style='background-color: #c7cece; border-radius: 4px;'><b style='margin-left:10px'>" + itemTypeNamesToShow[ItemTypes[j].ItemType] + "</b></div><br/>";
                                    this.permissionViewJSON[i].Permission += "<table width='500px'>"
                                    tempItemType = ItemTypes[j].ItemType;
                                    hadPermissions = true;
                                }

                                //current item type finished
                                if (k == 0 || (this.permissionViewJSON[i].DistinctPermissionRows[k].Name != this.permissionViewJSON[i].DistinctPermissionRows[k - 1].Name || this.permissionViewJSON[i].DistinctPermissionRows[k].ItemType != this.permissionViewJSON[i].DistinctPermissionRows[k - 1].ItemType)) {
                                    if (k > 0) {
                                        this.permissionViewJSON[i].Permission += "</td></tr></tr>";
                                    }
                                    this.permissionViewJSON[i].Permission += "<tr><td style='padding:5px;border-bottom:1px solid #d0cdcd;border-top:1px solid #d0cdcd' width='50%'>" + this.permissionViewJSON[i].DistinctPermissionRows[k].Name + "</td>";
                                    this.permissionViewJSON[i].Permission += "<td style='padding:5px;border-bottom:1px solid #d0cdcd;border-top:1px solid #d0cdcd' width='50%'>" + this.permissionViewJSON[i].DistinctPermissionRows[k].PermissionName;

                                }
                                //combine items
                                else {
                                    if (this.permissionViewJSON[i].DistinctPermissionRows[k].ItemType == this.permissionViewJSON[i].DistinctPermissionRows[k - 1].ItemType) {
                                        this.permissionViewJSON[i].Permission += ", " + this.permissionViewJSON[i].DistinctPermissionRows[k].PermissionName;
                                    }
                                }


                            }
                        }
                        //any permission for current item type
                        if (hadPermissions) {
                            this.permissionViewJSON[i].Permission += "</table><br/>"
                        }
                    }

                }
            }

            //set group names in permission view json

            for (let i = 0; i < this.permissionViewJSON.length; i++) {
                this.permissionViewJSON[i].GroupsString = "";

                for (let j = 0; j < this.groupRoles.length; j++) {
                    if (this.groupRoles[j].RoleID == this.permissionViewJSON[i].RoleID) {
                        let tempGroupInfo = JSON.parse(this.groupRoles[j].ADGroup);
                        this.permissionViewJSON[i].GroupsString += tempGroupInfo.Name + "<br>";
                    }
                }
                // this.permissionViewJSON[i].GroupsString = this.permissionViewJSON[i].GroupsString.substring(0, this.permissionViewJSON[i].UsersString.GroupsString - 4);
            }
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("generatePermissionsViewJSON-Admin Panel component", "Platform", ex.message, ex.stack, "An error occured while rendering permissions table view ", "N/A", this.currentProcessID, true);

        }

    }

    /**
     * Returns true if current user is in process owner role
     */
    checkIfUserIsOwner() {
        for (let i = 0; i < this.permissionViewJSON.length; i++) {
            if (this.permissionViewJSON[i].RoleName == "Process Owner") {

                for (let j = 0; j < this.permissionViewJSON[i].UsersObjects.length; j++) {
                    if (this.permissionViewJSON[i].UsersObjects[j].Email.toLowerCase() == this.currentLoggedInUser.Email.toLowerCase()) {

                        return true;
                    }
                }

            }
        }
        return false;
    }
    /**
     * Renders datatabel from permissionViewJSON
     */
    generatePermissionsTable() {
        let colsDatatable = [];
        colsDatatable[0] = {
            "defaultContent": '<img src="assets/images/top_level/edit_3.png" style="width:18px;cursor:pointer;"/>',
            "data": "NoEditButton"
        }

        colsDatatable[1] = {

            "data": "RoleName"
        }
        colsDatatable[2] = {
            "data": "UsersString"
        }
        colsDatatable[3] = {
            "data": "GroupsString"
        }
        colsDatatable[4] = {
            "defaultContent": "<a style='cursor:pointer'>View</a>"
        }


        //edit process admin and owner buttons
        for (let i = 0; i < this.permissionViewJSON.length; i++) {
            if (this.permissionViewJSON[i].RoleName == "Process Administrator") {
                this.permissionViewJSON[i].NoEditButton = '<img id="adminNoEditButton" src="assets/images/top_level/edit_3.png" style="width:18px;cursor:pointer;display:none;"/>'
            }
            else if (this.permissionViewJSON[i].RoleName == "Process Owner") {
                this.permissionViewJSON[i].NoEditButton = '<img id="ownerNoEditButton" src="assets/images/top_level/edit_3.png" style="width:18px;cursor:pointer;display:none;"/>'

            }


        }



        let pageLength = 25; //default page length for datatable
        this.adminPanelTable = $('#adminPanelTable').DataTable({
            data: this.permissionViewJSON,
            columns: colsDatatable,
            "lengthMenu": [pageLength],
            "order": [[1, "asc"]],
            "ordering": false,
            "initComplete": function () {
                //post renter function


            },
        });
        //default style for datatable as cannot be set in css file due to view encapsulation
        this.adminPanelLoading = false;
        $("#adminPanelTable thead tr:first").css("box-shadow", "0px 0px 2px 0px black");
        let _currentClassReference = this;//current class reference
        this.adminPanelTable.columns.adjust().draw();

        //unbind previous table events to avoid multiple events binding
        $('#adminPanelTable tbody').unbind();

        //datable columns click events
        $('#adminPanelTable tbody').on('click', 'td', function () {
            //if first column clicked
            if (_currentClassReference.adminPanelTable.column(this).index() == 0) {
                //if edit owenr clicked
                if (_currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()].RoleName == "Process Owner") {
                    if (_currentClassReference.currentUserIsSupportPerson) {
                        //show edit users dialog form owner
                        _currentClassReference.showEditUsersDialog(_currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["UsersObjects"], _currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleID"], _currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleName"], _currentClassReference.adminPanelTable.row(this).index(), _currentClassReference.checkEveryoneFlagForRole(_currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleID"]), _currentClassReference.groupRoles);

                    }
                }
                //if admin edit clicked
                else if (_currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()].RoleName == "Process Administrator") {
                    if (_currentClassReference.currentUserIsSupportPerson || _currentClassReference.currentUserIsOwner) {
                        //show edit users dialog form admin
                        _currentClassReference.showEditUsersDialog(_currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["UsersObjects"], _currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleID"], _currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleName"], _currentClassReference.adminPanelTable.row(this).index(), _currentClassReference.checkEveryoneFlagForRole(_currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleID"]), _currentClassReference.groupRoles);

                    }
                }
                else {
                    //show dialog for other roles 
                    _currentClassReference.showEditUsersDialog(_currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["UsersObjects"], _currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleID"], _currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleName"], _currentClassReference.adminPanelTable.row(this).index(), _currentClassReference.checkEveryoneFlagForRole(_currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleID"]), _currentClassReference.groupRoles);

                }


            }
            //if view permission clicked
            else if (_currentClassReference.adminPanelTable.column(this).index() == 4) {
                //show current role permissions dialog
                _currentClassReference.showPermissionsDialog(_currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["Permission"], _currentClassReference.permissionViewJSON[_currentClassReference.adminPanelTable.row(this).index()]["RoleName"]);
            }




        });
        if (this.permissionViewJSON.length <= pageLength) {
            $("#adminPanelTable_paginate").hide();
        }
    }


    /**
     * Opens dialog to add or remove users from role
     * @param usersObjects 
     * @param roleID 
     * @param roleName 
     * @param currentIndex 
     * @param everyoneFlag 
     * @param groupRoles 
     */

    showEditUsersDialog(usersObjects, roleID, roleName, currentIndex, everyoneFlag, groupRoles) {
        //render dialog
        let dialogRef = this.editUsersDialog.open(EditUsersDialogComponent, {
            width: '545px',
            height: 'auto',
            data: { UsersObjects: usersObjects, RoleID: roleID, RoleName: roleName, EveryoneFlag: everyoneFlag, GroupRoles: groupRoles, CurrentProcessID: this.currentProcessID }
        });
        //dialog close event. Refresh permissions if changes detected from dialog
        dialogRef.afterClosed().subscribe(result => {
            if (result) {

                //destroy admin panel table to reninitialize
                this.adminPanelTable.destroy();
                //reset user process settings based on permission change
                this.rapidflowService.retrieveUserProcessSettings(this.currentProcessID)
                    .subscribe((response) => {

                        this.processDataService.userProcessSettings = JSON.parse(response.json())
                    }, (error: any) => {

                        this.processDataService.userProcessSettings = []
                        this.rapidflowService.ShowErrorMessage("retrieveUserProcessSettings-Process Admin Panel component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveUserProcessSettings", " RapidflowServices.retrieveUserProcessSettings", this.currentProcessID, false);


                    });

                //retrieve process global settings based on permission change
                let processGlobalSettings = this.rapidflowService.retrieveGlobalProcessSettings(this.currentProcessID)
                    .subscribe((response) => {

                        this.processDataService.processGlobalSettings = JSON.parse(response.json());

                    }, (error: any) => {
                        this.processDataService.processGlobalSettings = []
                        this.rapidflowService.ShowErrorMessage("retrieveGlobalProcessSettings-Process Admin Panel component", "Platform", "Error occured while executing api call", error, "An error occured while retrieveGlobalProcessSettings", " RapidflowServices.retrieveGlobalProcessSettings", this.currentProcessID, false);


                    });


                //rerender table
                for (let i = 0; i < this.permissionViewJSON.length; i++) {
                    if (this.permissionViewJSON[i].RoleID == result.RoleID) {
                        this.permissionViewJSON[i].UsersObjects = result.Users.UsersObjects;
                        this.permissionViewJSON[i].UsersString = result.Users.UsersString;
                        this.permissionViewJSON[i].GroupsString = result.Groups.GroupsString;
                    }
                }

                for (let i = 0; i < this.groupRoles.length; i++) {
                    if (this.groupRoles[i].RoleID == result.RoleID) {
                        this.groupRoles[i].ADGroup = result.Groups.GroupObjects;

                    }
                }

                this.generatePermissionsTable();
                this.checkIfUserIsSupportPerson(0);

            }
        });
    }

    /**
     * Open dialog with permissions view
     * @param permission 
     * @param roleName 
     */
    showPermissionsDialog(permission: any, roleName: any) {
        //render dialog
        let dialogRef = this.viewPermissionsDialog.open(ViewPermissionsDialogComponent, {
            width: '545px',
            height: '385px',
            data: { Permission: permission, RoleName: roleName }
        });

        dialogRef.afterClosed().subscribe(result => {
            //close event
        });
    }

    /**
     * Checks if everyone is allowed form  role
     * @param roleId 
     */
    checkEveryoneFlagForRole(roleId) {
        let everyoneFlag: boolean = false;
        for (let i = 0; i < this.disntinctRolesWithEveryoneFlag.length; i++) {
            if (this.disntinctRolesWithEveryoneFlag[i].RoleId == roleId && this.disntinctRolesWithEveryoneFlag[i].Everyone == 1) {
                everyoneFlag = true;
            }
        }
        return everyoneFlag;
    }


    /**
     * Component destroy lifecycle hook
     */
    ngOnDestroy(){
        try{
            this.paramSubscription.unsubscribe();
        }
        catch(ex){

        }
        
        
    }

}



/**
 * View Permissios dialog component decorator
 */
@Component({
    selector: 'dialog-view-permissions',
    template: ` <div class="dialogTitle">
                    {{roleName}}
                </div>
                <div style="height: 85%; overflow-y: scroll; padding:10px;margin-top:5px;"  [innerHTML]="permission|escapehtml">
                
                </div>
                `,
})
export class ViewPermissionsDialogComponent {
    permission: string;//permissions string containing html to render in the dialog passed from the access management table on view link click
    roleName: string;//current role name to show on title
    /**
     * Constructor with data injector
     * @param dialogRef 
     * @param rapidflowService 
     * @param data 
     */
    constructor(
        public dialogRef: MatDialogRef<ViewPermissionsDialogComponent>, public rapidflowService: RapidflowService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        if (data.Permission == "") {   //if not permissions for role
            this.permission = "No permissions assigned to this role."
        }
        else {
            this.permission = data.Permission;
        }

        this.roleName = data.RoleName;

    }

    /**
     * init lifecycle hook which needs to be overridden
     */
    ngOnInit() {

    }



    /**
     * close dialog on ok button click
     */
    onNoClick(): void {
        this.dialogRef.close();
    }

}

/**
 * Component decorator edit users dialog
 */

@Component({
    selector: 'dialog-edit-users',
    template: ` <div class="dialogTitle">
                   Edit Users
                </div>
                <div id="permissionDiv" class="dialogBody">
                <mat-checkbox *ngIf="everyoneFlag" (change)="enableDisablePeoplePickers()" class="everyoneCheckBox" [(ngModel)]="everyoneChecked">Everyone</mat-checkbox>
                <div class="roleUsers"  *ngIf="roleName!='Process Administrator'&&roleName!='Process Owner'">
                 <label>Users:</label> <app-people-picker [controlOptions]="accessManagePeoplePickerOptions" [fieldName]="'UsersPeoplePicker'"  [(ngModel)]="usersPeoplePickerObject"  ngDefaultControl [selfSelection]="true" [cacheUser]="true" [selectionType]="'multiple'" [selectorHeading]="'Select Users'"></app-people-picker>  
                </div>
                <div class="roleAdminOwner"  *ngIf="roleName=='Process Administrator'||roleName=='Process Owner'">
                <label>User:</label> <app-people-picker [controlOptions]="accessManagePeoplePickerOptions" [fieldName]="'UsersPeoplePicker'"  [(ngModel)]="usersPeoplePickerObject"  ngDefaultControl [selfSelection]="true" [selectionType]="'single'" [cacheUser]="true" [selectorHeading]="'Select Users'"></app-people-picker>  
               </div>
                <div class="roleGroups" *ngIf="roleName!='Process Administrator'&&roleName!='Process Owner'">
                <label>Groups:</label> <app-people-picker [controlOptions]="accessManagePeoplePickerOptionsGroup" [fieldName]="'GroupsPeoplePicker'" [(ngModel)]="groupsPeoplePickerObject"  ngDefaultControl [selfSelection]="true" [selectionType]="'multiple'" [cacheUser]="true" [groupSelection]="true" [selectorHeading]="'Select Groups'"></app-people-picker>  
               </div>
               
                 
                </div>
                <div class="dialogButtons">
                <mat-divider></mat-divider>
                
                    <button (click)="editUserGroupsInRoles()" class="singleDialogButton" > Update </button>
                 
            </div>

                `,
})
export class EditUsersDialogComponent {
    roleID: string;//role id of whose edit dialog is openent
    roleName: string;//role name whose dialgo opened
    usersObjects: any;//object containg current role user information
    usersPeoplePickerObject: any = [];//people picker model for users
    groupsPeoplePickerObject: any = []//people picker model form groups
    groupsObject: any = [];//object containing current role group info
    everyoneChecked: boolean = false;//boolean model for everyone checkbox. checked when everyone present in user
    everyoneFlag: boolean = false;//everyone allowed in user. show hides checkbox based on this
    groupRoles: any = [];//groups present in role
    everyoneWasInRole: boolean = false;//role had everyone used to construct edit user role parameters string
    currentProcessID: number;//current selected process id
    progressDialogRef: any;//reference of progress dialog object

    //users people picker options
    accessManagePeoplePickerOptions: any = {
        "defaultValue": "",
        "disabled": false,
        "readonly": false,
        "visible": true,
        "required": false,
        "validationText": ""
    }
    //group people picker options
    accessManagePeoplePickerOptionsGroup: any = {
        "defaultValue": "",
        "disabled": false,
        "readonly": false,
        "visible": true,
        "required": false,
        "validationText": ""
    }

    /**
     * Constructor with data injector
     * @param dialogRef 
     * @param rapidflowService 
     * @param loadingDialog 
     * @param data 
     */
    constructor(
        public dialogRef: MatDialogRef<ViewPermissionsDialogComponent>, public rapidflowService: RapidflowService, public loadingDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        //set properties for object
        this.roleID = data.RoleID;
        this.roleName = data.RoleName;
        this.usersObjects = data.UsersObjects;
        this.everyoneFlag = data.EveryoneFlag;
        this.groupRoles = data.GroupRoles;
        this.currentProcessID = data.CurrentProcessID;

    }

    /**
     * Component initialization lifecycle. sets people pickers fields
     */
    ngOnInit() {

        this.setUsersPeoplePicker();
        this.setGroupsPeoplePicker();
    }

    /**
     * Enable or disable people picker based on everyone checkbox value
     */
    enableDisablePeoplePickers() {
        if (this.everyoneChecked) {
            this.accessManagePeoplePickerOptions.readonly = true;
            this.accessManagePeoplePickerOptions.disabled = true;
            this.accessManagePeoplePickerOptionsGroup.readonly = true;
            this.accessManagePeoplePickerOptionsGroup.disabled = true;
        }
        else {
            this.accessManagePeoplePickerOptions.readonly = false;
            this.accessManagePeoplePickerOptions.disabled = false;
            this.accessManagePeoplePickerOptionsGroup.readonly = false;
            this.accessManagePeoplePickerOptionsGroup.disabled = false;
        }
    }
    /**
     * Set users people picker model with users object
     */
    setUsersPeoplePicker() {
        try {
            let usersCounter = 0;
            for (let i = 0; i < this.usersObjects.length; i++) {
                if (this.usersObjects[i].DisplayName == "") {
                    break;
                }
                //set users if everyone not selected
                if (this.usersObjects[i].DisplayName != "Everyone") {
                    this.usersPeoplePickerObject[usersCounter] = {};
                    this.usersPeoplePickerObject[usersCounter].Email = this.usersObjects[i].Email;
                    this.usersPeoplePickerObject[usersCounter].DisplayName = this.usersObjects[i].DisplayName;
                    usersCounter++;
                }
                else {
                    this.everyoneChecked = true;
                    this.everyoneWasInRole = true;

                }

            }
            this.enableDisablePeoplePickers();
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("setUsersPeoplePicker-Admin Panel component", "Platform", ex.message, ex.stack, "An error occured rendering edit users view ", "N/A", this.currentProcessID, true);


        }

    }


    /**
     * Set groups people picker model with groups object
     */
    setGroupsPeoplePicker() {
        for (let i = 0; i < this.groupRoles.length; i++) {
            if (this.groupRoles[i].RoleID == this.roleID) {
                this.groupsPeoplePickerObject.push(JSON.parse(this.groupRoles[i].ADGroup));
            }
        }

        this.groupsObject = JSON.parse(JSON.stringify(this.groupsPeoplePickerObject));
    }

    editUserGroupsInRoles() {
        try {
            let userEmailsToAdd = "";
            let userEmailsToRemove = "";
            let groupsToAdd = "";
            let groupsToRemove = "";

            let newReturnObject = {
                RoleID: this.roleID,
                Users: {

                    UsersObjects: [],
                    UsersString: ""
                },
                Groups: {
                    GroupObjects: "",
                    GroupsString: ""
                }

            };


            //generating users strings
            for (let i = 0; i < this.usersPeoplePickerObject.length; i++) {
                let userAlreadyPresent = false;

                for (let j = 0; j < this.usersObjects.length; j++) {
                    if (this.usersPeoplePickerObject[i].Email == this.usersObjects[j].Email) {
                        userAlreadyPresent = true;
                        break;
                    }

                }
                if (!userAlreadyPresent && this.usersPeoplePickerObject[i].Email != "Everyone") {
                    userEmailsToAdd += this.usersPeoplePickerObject[i].Email + ';';
                }

            }

            for (let i = 0; i < this.usersObjects.length; i++) {

                let userNotPresentAnymore = true;
                for (let j = 0; j < this.usersPeoplePickerObject.length; j++) {
                    if (this.usersObjects[i].Email == this.usersPeoplePickerObject[j].Email) {
                        userNotPresentAnymore = false;
                        break;
                    }

                }

                if (userNotPresentAnymore && this.usersObjects[i].Email != "Everyone") {
                    userEmailsToRemove += this.usersObjects[i].Email + ';';
                }
            }

            //generating groups strings
            for (let i = 0; i < this.groupsPeoplePickerObject.length; i++) {
                let groupAlreadyPresent = false;

                for (let j = 0; j < this.groupsObject.length; j++) {
                    if (this.groupsPeoplePickerObject[i].DistinguishedName == this.groupsObject[j].DistinguishedName) {
                        groupAlreadyPresent = true;
                        break;
                    }

                }
                if (!groupAlreadyPresent) {
                    groupsToAdd += this.groupsPeoplePickerObject[i].DistinguishedName + ';';
                }

            }
            for (let i = 0; i < this.groupsObject.length; i++) {

                let groupNotPresentAnymore = true;
                for (let j = 0; j < this.groupsPeoplePickerObject.length; j++) {
                    if (this.groupsObject[i].DistinguishedName == this.groupsPeoplePickerObject[j].DistinguishedName) {
                        groupNotPresentAnymore = false;
                        break;
                    }

                }

                if (groupNotPresentAnymore) {
                    groupsToRemove += this.groupsObject[i].DistinguishedName + ';';
                }
            }

            //generating new return object
            if (this.everyoneChecked) {
                newReturnObject.Users.UsersString = "Everyone"
                newReturnObject.Users.UsersObjects.push(
                    {
                        DisplayName: "Everyone",
                        Email: "Everyone"
                    }
                );
            }
            for (let i = 0; i < this.usersPeoplePickerObject.length; i++) {


                newReturnObject.Users.UsersObjects.push(

                    {
                        DisplayName: this.usersPeoplePickerObject[i].DisplayName,
                        Email: this.usersPeoplePickerObject[i].Email,
                    }

                );
                if (newReturnObject.Users.UsersString != "Everyone") {
                    newReturnObject.Users.UsersString += this.usersPeoplePickerObject[i].DisplayName + "<br>";
                }

            }
            if (newReturnObject.Users.UsersString != "Everyone") {
                newReturnObject.Users.UsersString = newReturnObject.Users.UsersString.substring(0, newReturnObject.Users.UsersString.length - 4);
            }

            //generating new groups string and object
            let tempGroupObject = [];
            for (let i = 0; i < this.groupsPeoplePickerObject.length; i++) {


                tempGroupObject.push(

                    {
                        Name: this.groupsPeoplePickerObject[i].Name,
                        DistinguishedName: this.groupsPeoplePickerObject[i].DistinguishedName,
                    }


                );
                newReturnObject.Groups.GroupsString += this.groupsPeoplePickerObject[i].Name + "<br>";


            }

            newReturnObject.Groups.GroupsString = newReturnObject.Groups.GroupsString.substring(0, newReturnObject.Groups.GroupsString.length - 4);
            newReturnObject.Groups.GroupObjects = JSON.stringify(tempGroupObject);
            //remove last characters from all strings
            userEmailsToAdd = userEmailsToAdd.substring(0, userEmailsToAdd.length - 1);
            userEmailsToRemove = userEmailsToRemove.substring(0, userEmailsToRemove.length - 1);
            groupsToAdd = groupsToAdd.substring(0, groupsToAdd.length - 1);
            groupsToRemove = groupsToRemove.substring(0, groupsToRemove.length - 1);

            //add or remove everyone from users strings
            if (this.everyoneChecked) {
                if (!this.everyoneWasInRole) {
                    if (userEmailsToAdd == "") {
                        userEmailsToAdd = "0";
                    }
                    else {
                        userEmailsToAdd += ";0";

                    }
                }
            }
            else {
                if (this.everyoneWasInRole) {
                    if (userEmailsToRemove == "") {
                        userEmailsToRemove = "0";
                    }
                    else {
                        userEmailsToRemove += ";0";

                    }
                }
            }

            if(userEmailsToAdd==""&&userEmailsToRemove==""&&groupsToAdd==""&&groupsToRemove==""){
                this.dialogRef.close(false);
                return;
            }

            this.progressDialogRef = this.showProgressDialog("Please wait while editing users");


            //edit users in roles api call
            this.rapidflowService.editGroupsAndUsersInRole(this.currentProcessID, parseInt(this.roleID), userEmailsToAdd, userEmailsToRemove, groupsToAdd, groupsToRemove).subscribe((response) => {

                this.progressDialogRef.close();
                this.dialogRef.close(newReturnObject);

            }, (error: any) => {

                this.rapidflowService.ShowErrorMessage("editGroupsAndUsersInRole-Admin Panel component", "Process", "Error occured while executing api call", error, "An error occured while editGroupsAndUsersInRole", " RapidflowServices.editGroupsAndUsersInRole", this.currentProcessID, true);


            });
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("editUsersInRoles-Admin Panel component", "Platform", ex.message, ex.stack, "An error occured while editing users ", "N/A", this.currentProcessID, true);

        }


    }
    /**
     * Show progress dialog with message
     * @param message 
     */
    showProgressDialog(message) {
        let dialogRef = this.loadingDialog.open(ProgressDialogComponent, {

            data: {
                message: message,

            }
        });

        return dialogRef;
    }
    onNoClick(): void {
        this.dialogRef.close();
    }

}
