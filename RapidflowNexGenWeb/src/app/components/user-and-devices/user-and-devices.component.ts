/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: UserAndDevicesComponent
Description: Provide functionality activate and deactivate a user and its devices.
Location: ./components/user-and-devices.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/

import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery'
import 'datatables.net/js/jquery.dataTables.js';
import { RapidflowService } from '../../services/rapidflow.service';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-user-and-devices',
    templateUrl: './user-and-devices.component.html',
    styleUrls: ['./user-and-devices.component.css']
})
export class UserAndDevicesComponent implements OnInit {

    cols: string[] = ["UserHtml", "Email", "DateCreated", "LastModified", "iconsHtml", "devicesString"];//columns to show in users in devices table
    rows: any[];//data rows for users and devices
    usersDevicesTable: any;//users devices datatable object
    usersAndDevicesLoading: boolean = true;//users and devices table loading flag
    noPermission: boolean = false;//user has permission to view users and devices flag
    currentSelectedUserIndex = 0;//index for selected user in table
    progressDialogRef: any;//reference to progress dialog
    /**
     * Default constructor with dependency injection of all required services and references
     * @param rapidflowService 
     * @param loadingDialog 
     */
    constructor(private rapidflowService: RapidflowService, public loadingDialog: MatDialog) { }

    /**
     * Component initialization life cycle hook which retrieves users and devices data and renders datatable
     */
    ngOnInit() {
        //retrieves user and deivces api call
        this.rapidflowService.retrieveUserAndDevice("all").subscribe((response) => {

            try {
                this.rows = JSON.parse(response.json());
                //show no permission message
                if (this.rows[0].AuthenticationStatus == "No Permission") {
                    this.noPermission = true;
                    this.usersAndDevicesLoading = false;
                    return;
                }


                this.generateIconsHTML();
                this.generateDataTable();
                this.setSearchOnOffEvents();
            }
            catch (error) {
                this.rapidflowService.ShowErrorMessage("ngOnInit-user and devices component", "Global", "Error occured while initializing user and devices component", error, error.stack, "N/A", "0", true);
            }
        }, (error) => {
            this.rapidflowService.ShowErrorMessage("retrieveUserAndDevice user and devices component", "Global", "Error occured while executing api call", error, "An error occured while retrieveUserAndDevice", " RapidflowService.retrieveUserAndDevice", '0', false);
        });
    }

    /**
     * Generate icons html for devices column 
     */
    generateIconsHTML() {
        try {
            for (var i = 0; i < this.rows.length; i++) {
                this.rows[i].iconsHtml = "";
                this.rows[i].devicesString = "";
                let tempObj: any = {};
                let tempString: any = {};
                tempObj.IOS = "";
                tempObj.Android = "";
                tempObj.Chrome = "";
                tempObj.IE = "";
                tempObj.Windows = "";
                tempObj.Safari = "";

                tempString.IOS = "";
                tempString.Chrome = "";
                tempString.Android = "";
                tempString.IE = "";
                tempString.Windows = "";
                tempString.Safari = "";

                if (this.rows[i].Active == "True") {
                    this.rows[i].UserHtml = '<img src="assets/images/top_level/application_settings/user_devices/login_user.png" style="width:20px;margin-bottom:5px;"/><span style="margin-left:5px">' + this.rows[i].DisplayName + "</span>";
                }
                else {
                    this.rows[i].UserHtml = '<img src="assets/images/top_level/application_settings/user_devices/login_user_red.png" style="width:20px;margin-bottom:5px;"/><span style="margin-left:5px">' + this.rows[i].DisplayName + "</span>";
                }


                for (var j = 0; j < this.rows[i].UserDevices.length; j++) {
                    //for chrome
                    if (this.rows[i].UserDevices[j].DeviceType == "Chrome") {
                        tempObj.Chrome = "<img src='assets/images/top_level/application_settings/user_devices/chromeIcon.png' style='width:25px;margin-left:7px'>"
                        tempString.Chrome = "chrome";
                    }
                    //for ios devices
                    else if (this.rows[i].UserDevices[j].DeviceType == "IOS") {
                        tempObj.IOS = "<img src='assets/images/top_level/application_settings/user_devices/iosIcon.png' style='width:25px;margin-left:7px'>"
                        tempString.IOS = "ios";
                    }
                    //for android devices
                    else if (this.rows[i].UserDevices[j].DeviceType == "Android") {
                        tempObj.Android = "<img src='assets/images/top_level/application_settings/user_devices/androidIcon.png' style='width:25px;margin-left:7px'>"
                        tempString.Android = "android";
                    }
                    //for windows devices
                    else if (this.rows[i].UserDevices[j].DeviceType == "Windows") {
                        tempObj.Windows = "<img src='assets/images/top_level/application_settings/user_devices/windowsIcon.png' style='width:25px;margin-left:7px'>"
                        tempString.Windows = "windows";
                    }
                    //for internet explorer
                    else if (this.rows[i].UserDevices[j].DeviceType == "IE") {
                        tempObj.IE = "<img src='assets/images/top_level/application_settings/user_devices/ieIcon.png' style='width:25px;margin-left:7px'>"
                        tempString.IE = "ie internet explorer";
                    }
                    //for safari
                    else if (this.rows[i].UserDevices[j].DeviceType == "Safari") {
                        tempObj.Safari = "<img src='assets/images/top_level/application_settings/user_devices/safariIcon.png' style='width:25px;margin-left:7px'>"
                        tempString.Safari = "safari";
                    }

                }
                //set icons for each row
                this.rows[i].iconsHtml = tempObj.IOS + tempObj.Chrome + tempObj.Android + tempObj.IE + tempObj.Safari + tempObj.Windows;
                this.rows[i].devicesString = tempString.IOS + tempString.Chrome + tempString.Android + tempString.Safari + tempString.Windows + tempString.IE;
            }
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("generateIconsHTML-Users and devices component", "Global", ex.message, ex.stack, "An error occured while rendering users and devices view", "N/A", 0, true);

        }

    }

    /**
     * Generates user and devices table
     */
    generateDataTable() {
        try {
            var colsDatatable = [];

            //set column titles
            for (var i = 0; i < this.cols.length; i++) {
                colsDatatable[i] = {};
                colsDatatable[i].data = this.cols[i];
                colsDatatable[i].className = 'details-control'

            }

            //submenu html for deactive option column
            colsDatatable[this.cols.length] = {

                "orderable": false,
                "data": null,
                "defaultContent": `
                <img src="assets/images/top_level/down_arrow.png" style="width:22px;height:20px;cursor:pointer;" />
                <div class="deactivateSubmenu">
                    <div>
                        <img src="assets/images/top_level/application_settings/Users-Remove-User-icon.png" style="width:15px;" />
                        <span class="activateUser" title="Activate user profile">Activate user</span>
                        <span class="deactivateUser" title="Deactivate user profile">Deactivate user</span>
                    </div>
                    <hr style="margin:7px;"/>
                    <div title="Refresh user profile">
                    <img src="assets/images/others/refreshIcon_on_submissions.png" style="width:14px;cursor:pointer;margin-right:4px;" />
                    Refresh user 
                    </div>
                </div>`
            }

            //default page length
            let pageLength = 25;

            //user devices table initialization call
            this.usersDevicesTable = $('#userDevicesTable').DataTable({
                data: this.rows,
                columns: colsDatatable,
                "autoWidth": false,
                "lengthMenu": [pageLength],
                "columnDefs": [
                    {
                        "targets": [5],
                        "visible": false

                    },

                    { "width": "20%", "targets": 0 },
                    { "width": "20%", "targets": 1 },
                    { "width": "20%", "targets": 2 },
                    { "width": "20%", "targets": 3 },
                    { "width": "20%", "targets": 4 },
                    { "width": "3%", "targets": 5 },

                ],


                "initComplete": function () {




                },
            });

            //hide loading
            this.usersAndDevicesLoading = false;
            var _currentClassReference = this;
            $.fn.dataTable.ext.errMode = 'none';
            //bind table search to filter serach input
            $('#filterSearch').on('input', function () {
                _currentClassReference.usersDevicesTable.search(this.value).draw();
            });
            //click event for row to show devices
            $('#userDevicesTable tbody').on('click', 'td.details-control', function () {
                var tr = $(this).closest('tr');
                var row = _currentClassReference.usersDevicesTable.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    // Open this row
                    let tempUsers = row.data();
                    row.child(_currentClassReference.format(row.data())).show();
                    tr.addClass('shown');
                    //deactive selected device
                    for (let i = 0; i < tempUsers.UserDevices.length; i++) {
                        $("#device" + tempUsers.UserDevices[i].UserDevicesID).on("click", function () {
                            $("#device" + tempUsers.UserDevices[i].UserDevicesID).next().show();

                            $("#device" + tempUsers.UserDevices[i].UserDevicesID).next().on("click", function () {

                                _currentClassReference.progressDialogRef = _currentClassReference.showProgressDialog("Logging off from device...");

                                //log off device api call
                                _currentClassReference.rapidflowService.updateUsersAndDevices(0, tempUsers.UserDevices[i].UserDevicesID, "DeactivateDevices").subscribe((response) => {


                                    _currentClassReference.progressDialogRef.close();
                                    window.location.reload();

                                });
                            });

                        });
                    }




                }
            });

            //device
            $('#userDevicesTable tbody').on('click', 'td', function () {
                $(".deactivateSubmenu").hide();
                if (_currentClassReference.usersDevicesTable.column(this).index() == 6) {

                    $(this).children().first().next().show();

                    //if user is active show deactivate submenu
                    _currentClassReference.currentSelectedUserIndex = _currentClassReference.usersDevicesTable.row(this).index()
                    if (_currentClassReference.rows[_currentClassReference.currentSelectedUserIndex].Active == "True") {
                        $(".deactivateUser").show();
                        $(".activateUser").hide();
                    }
                    else {
                        $(".activateUser").show();
                        $(".deactivateUser").hide();
                    }
                    $(this).children().first().next().children().first().on("click", function () {
                        //log off selected user
                        if (_currentClassReference.rows[_currentClassReference.currentSelectedUserIndex].Active == "True") {
                            _currentClassReference.progressDialogRef = _currentClassReference.showProgressDialog("Logging off user...");

                            //log off user api call
                            _currentClassReference.rapidflowService.updateUsersAndDevices(_currentClassReference.rows[_currentClassReference.currentSelectedUserIndex].UserID, 0, "DeactivateUser").subscribe((response) => {

                                _currentClassReference.progressDialogRef.close();
                                window.location.reload();

                            }, (error) => {
                                this.rapidflowService.ShowErrorMessage("updateUsersAndDevices user and devices component", "Global", "Error occured while executing api call", error, "An error occured while updateUsersAndDevices", " RapidflowService.updateUsersAndDevices", '0', false);

                            });
                        }
                        else {

                            //activate user if not active
                            _currentClassReference.progressDialogRef = _currentClassReference.showProgressDialog("Activating user...");

                            //activate user api call
                            _currentClassReference.rapidflowService.updateUsersAndDevices(_currentClassReference.rows[_currentClassReference.currentSelectedUserIndex].UserID, 0, "ActivateUser").subscribe((response) => {


                                _currentClassReference.progressDialogRef.close();
                                window.location.reload();
                            }, (error) => {
                                this.rapidflowService.ShowErrorMessage("updateUsersAndDevices user and devices component", "Global", "Error occured while executing api call", error, "An error occured while updateUsersAndDevices", " RapidflowService.updateUsersAndDevices", '0', false);

                            });
                        }


                    });

                    //synchonize user api call on refresh user click
                    $(this).children().first().next().children().first().next().next().on("click", function () {
                        _currentClassReference.progressDialogRef = _currentClassReference.showProgressDialog("Synchronizing user...");

                        _currentClassReference.rapidflowService.updateUserProfile(_currentClassReference.rows[_currentClassReference.currentSelectedUserIndex].UserID, _currentClassReference.rows[_currentClassReference.currentSelectedUserIndex].Email).subscribe((response) => {

                            _currentClassReference.progressDialogRef.close();
                            window.location.reload();

                        });
                    });
                }

            });
            $('#userDevicesTable_filter').hide();
            $('#userDevicesTable_length').hide();
            if (this.rows.length <= pageLength) {
                $("#userDevicesTable_paginate").hide();
            }
            this.setDefaultStylesForTable();
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("generateUsersAndDevicesTable-Users and devices component", "Global", ex.message, ex.stack, "An error occured while rendering users and devices view", "N/A", 0, true);

        }


    }

    /**
     * Returns dynamically generated deivecs table for user
     * @param d 
     */
    format(d) {
        try {
            if (d.UserDevices.length == 0) {
                return 'No Devices';
            }
            var dynamicTable = '<table id="tblDevices" style="box-shadow:0px 0px 1px 0px;" cellpadding="5" border="0" width="100%" cellspacing="0" border="0" style="padding-left:50px;">';

            //iterate through all devices to generate devices table html
            for (var i = 0; i < d.UserDevices.length; i++) {
                dynamicTable += '<tr style="background-color:#eeeeee;"><td width="90%"><table style="width:100%;"><tr style="background-color:#eeeeee;"><td style="width:25%;">' +
                    'Device ID:' + d.UserDevices[i].DeviceID + '</td><td style="width:25%;"> ' +
                    'Device Type:' + d.UserDevices[i].DeviceType + '</td><td style="width:25%;">' +
                    'Date Created:' + d.UserDevices[i].DateCreated + '</td><td style="width:25%;">';
                if (typeof (d.UserDevices[i].LastSync) != "undefined") {
                    dynamicTable += 'Last Sync:' + d.UserDevices[i].LastSync + '</td><td style="width:25%;" align="center">';
                }
                else {
                    dynamicTable += '</td><td style="width:25%" align="center">'
                }
                dynamicTable += '<img id="device' + d.UserDevices[i].UserDevicesID + '" src="assets/images/top_level/down_arrow.png" style="width:18px;height:20px;cursor:pointer;"/><div class="deviceDeactivateMenu"><img src="assets/images/top_level/application_settings/Users-Remove-User-icon.png" style="width:14px;margin-right:4px;"/>Log Off Device</div></td><td>';
                dynamicTable += '</td></tr></table></td></tr>'




            }


            dynamicTable += '</table>';

            return dynamicTable;
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("format-Users and devices component", "Global", ex.message, ex.stack, "An error occured while rendering devices", "N/A", 0, true);

        }
    }

    /**
     * Default styles for table due to view encapsulation
     */
    setDefaultStylesForTable() {
        $("#userDevicesTable thead tr:first").css("box-shadow", "0px 0px 2px 0px black");
    }


    /**
     * Show progress dialog
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

    /**
     * Sets jquery events for search toggles
     */
    setSearchOnOffEvents() {
        // assigning jquery click event to  turn on the filter on users and devices
        $("#searchOn").click(() => {
            this.usersDevicesTable.search("").draw();
        });

        // assigning jquery click event to  turn off the filter on users and devices
        $("#searchOff").click(() => {
            this.usersDevicesTable.search("").draw();
        });
    }
}
