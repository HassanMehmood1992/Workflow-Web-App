/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PlatformSettingsComponent
Description: Provide functionality to render the platform setting in conterxt of application settings. This component also provide functionality to paltform admins to update the platform settings.
Location: ./platform-settings.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RapidflowService } from './../../services/rapidflow.service';
import * as $ from 'jquery'
import { MatDialog } from '@angular/material';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ProcessDataService } from '../../services/process-data.service';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { Router } from '@angular/router';
@Component({
    selector: 'app-platform-settings',
    templateUrl: './platform-settings.component.html',
    styleUrls: ['./platform-settings.component.css']
})
export class PlatformSettingsComponent implements OnInit {
    operationAdministrationSettings: any = [];//operations administrations settings model object
    currentPlatformSettings: any;//current retrieved platform settings
    newPlatformSettings: any;//platform settings after changes
    settingsUpdateAllowed: boolean = false;//user is allowed to update platform settings
    editMode: boolean = false;//flag to inidicate if form is in edit mode
    currentLoggedInUser:any; //current logged in user object
    diagnosticLoggingJSON: any;//current diagnostic logging json
    platformSettingsLoading: boolean = true;//flag to show loading of plaform settings loading
    progressDialogRef: any;//reference of progress dialog
    successDialogRef: any;//reference of success dialog
    peoplePickerChanges: boolean = true;//flag to show if people picker is updating for resetting values
    noPermission: boolean = true;//flag to show no permssion message if user dont have permissions to view this page

    //platform settings people picker options
    platformSettingsPeoplePicker: any = {
        "defaultValue": "",
        "disabled": true,
        "readonly": true,
        "visible": true,
        "required": false,
        "validationText": "Please enter out of office assignee"
    }
    /**
     * Default constructor with dependency injection of all required services
     * @param rapidflowService
     * @param loadingDialog 
     * @param confirmationDialog 
     * @param processDataService 
     */
    constructor(private rapidflowService: RapidflowService, private loadingDialog: MatDialog, private confirmationDialog: MatDialog, private processDataService: ProcessDataService,private rtr:Router) { }

    /**
     * After view initialiaztion lifecycle which sets all platform settings values of form retrieved from process data service
     */
    ngAfterViewInit() {

        try {
            if(window.localStorage['User']==undefined)
            {        
                this.rapidflowService.loggedOut=window.location.href;
                
                this.rtr.navigate(['login']);
            }
            else{
                this.currentLoggedInUser= JSON.parse(window.localStorage['User'])
            }
            
            var timeinterval = setInterval(() => {
                if (this.processDataService.currentPlatformSettings.length > 0) {


                    this.currentPlatformSettings = this.processDataService.currentPlatformSettings;
                    this.newPlatformSettings = this.processDataService.currentPlatformSettings;

                    this.platformSettingsLoading = false;
                    let userHavePermission: boolean = false;
                    //find platform administrators 
                    for (let i = 0; i < this.currentPlatformSettings.length; i++) {
                        //show no permission message if user is not platform administrator
                        if (this.currentPlatformSettings[i].SettingName.toLowerCase() == "platform_administrators") {
                            for (let j = 0; j < this.currentPlatformSettings[i].Value.length; j++) {
                                if (this.currentPlatformSettings[i].Value[j].Email.toLowerCase() == this.currentLoggedInUser.Email.toLowerCase()) {
                                    this.noPermission = false;
                                    break;
                                }
                            }

                        }
                    }
                    if (this.noPermission) {
                        $("#platformSettingsEditButton").hide();
                        return;
                    }

                    //initialize people picker arrays
                    this.operationAdministrationSettings.SUPPORT_OPERATIONS_GROUP = [];
                    this.operationAdministrationSettings.PLATFORM_ADMINISTRATORS = [];
                    this.operationAdministrationSettings.DEVELOPMENT_GROUP = [];
                    this.operationAdministrationSettings.PUBLISHING_GROUP = [];

                    this.setSettingsArray();
                    setTimeout(() => {
                        $(".platformSettingsPeoplePicker textarea").addClass('disabledPeoplePicker');

                    }, 500);



                    //edit platform settings button click event
                    $("#editPlatformSettingsButton").on('click', () => {

                        //turn on edit mode and update default models
                        this.switchEditSaveOptions();
                        this.editMode = true;
                        this.platformSettingsPeoplePicker.readonly = false;
                        this.platformSettingsPeoplePicker.disabled = false;
                        //set people picker style for edit mode
                        $(".platformSettingsPeoplePicker textarea").removeClass('disabledPeoplePicker');
                        $(".platformSettingsPeoplePicker textarea").addClass('editablePeoplePicker');


                    });

                    //save platform settings button click event
                    $("#savePlatformSettingsButton").on('click', () => {
                        //show confirmation dialog
                        let userConfirmation = this.confirmationDialog.open(ConfirmationDialogComponent, {

                            data: { title: 'Save Settings', message: 'Are you sure you want to save these settings?' }
                        });

                        //dialog close subscription
                        userConfirmation.afterClosed().subscribe(result => {

                            if (result) {
                                //check if emails fields contain correct emails string
                                if (!this.validateEmailsField(this.operationAdministrationSettings.SUPPORT_GROUP_EMAIL)) {
                                    this.loadingDialog.open(AlertDialogComponent, {


                                        data: {
                                            title: "Platform Settings",
                                            message: "Support group email field group must be valid comma seperated emails.",

                                        }
                                    });
                                    return;
                                }
                                if (!this.validateEmailsField(this.operationAdministrationSettings.SUPPORT_SYSTEM_EMAIL)) {
                                    this.loadingDialog.open(AlertDialogComponent, {


                                        data: {
                                            title: "Platform Settings",
                                            message: "Support system email field group must be valid comma seperated emails.",

                                        }
                                    });
                                    return;
                                }
                                this.switchEditSaveOptions();

                                this.editMode = false;
                                this.platformSettingsPeoplePicker.readonly = true;
                                this.platformSettingsPeoplePicker.disabled = true;


                                this.updatePlatformSettings();
                                $(".platformSettingsPeoplePicker textarea").removeClass('editablePeoplePicker');

                                $(".platformSettingsPeoplePicker textarea").addClass('disabledPeoplePicker');
                            }

                        });




                    });
                    //cancel platform settings button click event
                    $("#cancelPlatformSettingsButton").on('click', () => {

                        //show confirm discard changes option
                        let userConfirmation = this.confirmationDialog.open(ConfirmationDialogComponent, {

                            data: { title: 'Discard Changes', message: 'Are you sure you want to discard changes?' }
                        });
                        //close subscription
                        userConfirmation.afterClosed().subscribe(result => {

                            if (result) {
                                //reset all fields
                                this.switchEditSaveOptions();

                                this.editMode = false;
                                this.platformSettingsPeoplePicker.readonly = true;
                                this.platformSettingsPeoplePicker.disabled = true;
                                this.peoplePickerChanges = false;
                                this.setSettingsArray();
                                setTimeout(() => { this.peoplePickerChanges = true }, 1);




                                $(".platformSettingsPeoplePicker textarea").removeClass('editablePeoplePicker');

                                $(".platformSettingsPeoplePicker textarea").addClass('disabledPeoplePicker');
                            }

                        });




                    });
                    clearInterval(timeinterval);

                    return;
                }
            }, 1000);

        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("ngAfterViewInit-Platform Settings component", "Global", ex.message, ex.stack, "An error occured while rendering platform settings view", "N/A", 0, true);

        }




    }
    /**
     * Component initialzation lifecycle hook which needs to be overridden
     */
    ngOnInit() { }
    /**
     * Set settings array based to initialized form with platform setttings values
     */
    setSettingsArray() {
        try {
            for (var i = 0; i < this.currentPlatformSettings.length; i++) {

                //if object set people picker values
                if (typeof (this.currentPlatformSettings[i].Value) == "object") {
                    this.operationAdministrationSettings[this.currentPlatformSettings[i].SettingName] = JSON.parse(JSON.stringify(this.currentPlatformSettings[i].Value));
                }
                else if (isNaN(this.currentPlatformSettings[i].Value)) {
                    this.operationAdministrationSettings[this.currentPlatformSettings[i].SettingName] = this.currentPlatformSettings[i].Value;

                }

                else {
                    this.operationAdministrationSettings[this.currentPlatformSettings[i].SettingName] = parseInt(this.currentPlatformSettings[i].Value);
                }
                //if platform administrator allow settings update
                if (this.currentPlatformSettings[i].SettingName == "PLATFORM_ADMINISTRATORS" && JSON.stringify(this.currentPlatformSettings[i].Value).toLowerCase().indexOf(this.currentLoggedInUser.Email.toLowerCase()) != -1) {
                    this.settingsUpdateAllowed = true;
                }
            }
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("setSettingsArray-Platform settings component", "Global", ex.message, ex.stack, "An error occured while rendering platform settings view", "N/A", 0, true);

        }


    }

    /**
     * Upadate platform settings with new values
     */
    updatePlatformSettings() {
        try {
            var settingsParameterString = "";
            var anyValueChanged = false;
            //construct new json array based on updated values
            for (var i = 0; i < this.currentPlatformSettings.length; i++) {
                for (var key in this.operationAdministrationSettings) {
                    if (key == this.currentPlatformSettings[i].SettingName) {
                        if (this.currentPlatformSettings[i].Value != this.operationAdministrationSettings[key]) {
                            //if not diagnostic logging as it is not updated from here
                            if (this.currentPlatformSettings[i].SettingName != "DIAGNOSTIC_LOGGING") {

                                //if object construct people picker
                                if (typeof (this.operationAdministrationSettings[key]) == "object") {
                                    if (JSON.stringify(this.operationAdministrationSettings[key]).replace(/\s/g, '') != JSON.stringify(this.currentPlatformSettings[i].Value).replace(/\s/g, '')) {
                                        settingsParameterString += this.currentPlatformSettings[i].PlatformSettingsID + "-" + encodeURIComponent(JSON.stringify(this.operationAdministrationSettings[key])) + "$"
                                        //value was changed
                                        anyValueChanged = true;

                                    }

                                }
                                else {
                                    settingsParameterString += this.currentPlatformSettings[i].PlatformSettingsID + "-" + encodeURIComponent(this.operationAdministrationSettings[key]) + "$"
                                    //value was chages
                                    anyValueChanged = true;
                                }
                                this.newPlatformSettings[i].Value = this.operationAdministrationSettings[key];

                            }

                        }

                    }
                }

            }
            //if any value is changed, update settings
            if (anyValueChanged) {

                settingsParameterString = settingsParameterString.substring(0, settingsParameterString.length - 1);

                //show saving changes dialog
                this.progressDialogRef = this.showProgressDialog("Saving changes...");
                var UpdatePlatformSettings = this.rapidflowService.updatePlatformSettings(settingsParameterString).subscribe((response) => {

                    //dont allow update if no permissions
                    var result = JSON.parse(response.json()).Result;
                    if (result == "No Permission" || result == "NotAuthenticated") {
                        this.progressDialogRef.close();
                        this.showProgressDialog("No Updated...");
                        //set setting ids
                        for (var i = 0; i < this.currentPlatformSettings.length; i++) {
                            if (isNaN(this.currentPlatformSettings[i].Value)) {
                                this.operationAdministrationSettings[this.currentPlatformSettings[i].SettingName] = this.currentPlatformSettings[i].Value;
                            }
                            else {
                                this.operationAdministrationSettings[this.currentPlatformSettings[i].SettingName] = parseInt(this.currentPlatformSettings[i].Value);
                            }
                        }

                    }

                    //if settings updated
                    else if (result == "Successfully Updated") {

                        //set platform settings to new object
                        this.progressDialogRef.close();
                        this.processDataService.currentPlatformSettings = this.newPlatformSettings;

                    }
                });



            }
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("updatePlatformSettings-Platform Settings component", "Global", ex.message, ex.stack, "An error occured while updating platform settings ", "N/A", 0, true);

        }


    }

    /**
     * Change fields styles based on edit mode on or off
     */
    switchEditSaveOptions() {
        if (this.editMode) {
            $("#platformSettingsSaveCancelButtons").hide();
            $("#platformSettingsEditButton").show();
        }
        else {

            $("#platformSettingsEditButton").hide();
            $("#platformSettingsSaveCancelButtons").show();

        }

    }


    /**
     * Checks if string is comma seperated emails
     * @param emails 
     */
    validateEmailsField(emails) {
        let re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        emails = emails.split(',');
        for (let i = 0; i < emails.length; i++) {
            if (!re.test(emails[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Show progress dialog while updating 
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

}
