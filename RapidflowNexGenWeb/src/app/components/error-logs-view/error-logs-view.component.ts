/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ErrorLogsViewComponent
Description: Provide functionality to show list of error logs.
Location: ./error-logs-view.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Input } from '@angular/core';
import { RapidflowService } from '../../services/rapidflow.service';
import * as $ from 'jquery'
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { MatDialog } from '@angular/material';
import { UpdateErrorlogDialogComponent } from '../update-errorlog-dialog/update-errorlog-dialog.component';
import 'datatables.net/js/jquery.dataTables.js';
import { ActivatedRoute, Router } from '@angular/router';
import { ExcelExportService } from '../../services/excel-export.service';
/**
  * component decorator
  */
@Component({
    selector: 'app-error-logs-view',
    templateUrl: './error-logs-view.component.html',
    styleUrls: ['./error-logs-view.component.css']
})
export class ErrorLogsViewComponent implements OnInit {
    @Input() renderedFrom: string;//page from which error logs view rendered input
    cols: string[] = ["EventDateTime", "Logs", "Category", "Status", "ProcessName", "EventDate", "Method"];//columns of error logs table
    rows: any[];//array containing all error logs retrieved from api call
    errorLogsTable: any;//datatable object containing error log table
    distinctDates: string[];//array containing distinct dates from all dates of error logs for event date dropdown
    distinctProcessNames: string[];//distinct process names for process dropdown
    selectedCategory: string = "";//current selected catergory of error logs
    selectedDate: string = "";//current selected date of error logs
    selectedProcess: string = "";//current selected process for error logs
    selectedStatus: string = "";//current selected status of error logs
    errorLogsLoaded: boolean = false;//flag to indicate if error logs are loaded or not to show or hide loading bar
    currentProcessID: number;//current selected page's process id
    noPermission: boolean = false;//flag to indicate if user has permission to view error logs
    //columns for exporting to excel
    exportCols = ["EventDateTime", "Logs", "Category", "Status", "ProcessName", "Method", "ResolutionComments", "RCA"];//,"ResolutionComments","ResolvedBy","ResolvedDateTime"];;//columns of error logs
    /**
    * Default constructor with dependency injection of all necessary objects and services 
    */
    constructor(private route: ActivatedRoute, private rapidflowService: RapidflowService, private updateErrorLogDialog: MatDialog, private excelExportService: ExcelExportService) { }
    /**
     * component initialization lifecycle hook which retrieves all or process error logs based on rendered from input
    */
    ngOnInit() {

        //get current process id if called from process error logs page
        if (this.renderedFrom == "processErrorLogsPage" || this.renderedFrom == "processDiagnosticLogsPage") {
            this.route.parent.parent.params.subscribe(params => {

                this.currentProcessID = parseInt(params['ProcessID']);
            });
        }
        else {
            this.currentProcessID = 0;
        }
        this.setErrorLogsDataItems();
        this.setSearchOnOffEvents();
    }
    /**
    * retrieve and parse error all or process error logs and set drop downs 
    */
    setErrorLogsDataItems() {
        this.rapidflowService.retrieveErrorLogs(this.currentProcessID).subscribe((response) => {
            try {
                let allLogs = response.json();
                //replace all json violating characters
                allLogs = allLogs.replace(/'/g, "")
                allLogs = allLogs.replace(/\\/g, "\\\\");
                allLogs = allLogs.replace(/\u000a/g, " ");
                allLogs = allLogs.replace(/\t/g, "");
                allLogs = allLogs.replace(/\r/g, "");
                allLogs = allLogs.replace(/\n/g, "");
                allLogs = allLogs.replace(/`/g, "");
                allLogs = JSON.parse(allLogs);
                //show no permission message
                if (allLogs.length == 1 && allLogs[0].LogID == "No Permission") {
                    this.noPermission = true;
                    this.errorLogsLoaded = true;
                }
                this.rows = allLogs;
                //parse all event dates and times
                for (var i = 0; i < this.rows.length; i++) {
                    this.rows[i].EventDateTime = this.convertDate(new Date(this.rows[i].EventDateTime));
                    this.rows[i].EventDate = this.getDateFromDateTime(new Date(this.rows[i].EventDateTime));
                }

                //get distinct dates and processes
                this.distinctDates = this.getUniqueValues(this.rows, 'EventDate');
                this.distinctProcessNames = this.getUniqueValues(this.rows, 'ProcessName');

                this.generateErrorLogTable();
                this.selectedCategory = "";
                this.selectedDate = "";
                this.selectedProcess = "";
                this.selectedStatus = "";
            }
            catch (ex) {
                this.rapidflowService.ShowErrorMessage("setErrorLogsDataItems-Error logs veiw component", "Global", ex.message, ex.stack, "An error occured while genearting error logs view", "N/A", 0, true);

            }
        });
    }

    /**
    * set error logs datatable parameters and generate error logs datatable 
    */
    generateErrorLogTable() {
        try {
            var colsDatatable = [];

            for (var i = 0; i < this.cols.length; i++) {
                colsDatatable[i] = {};
                colsDatatable[i].data = this.cols[i];
                colsDatatable[i].className = 'details-control'

            }
            //set edit column for diagnostic log page
            if (this.renderedFrom != "diagnosticLogsPage") {
                colsDatatable[colsDatatable.length] = {

                    "orderable": false,
                    "data": null,
                    "defaultContent": '<img src="assets/images/top_level/edit_3.png" style="width:18px;cursor:pointer;"/>'
                }
            }
            else {
                colsDatatable[colsDatatable.length] = {

                    "orderable": false,
                    "data": null,
                    "defaultContent": ''
                }
            }
            let processVisibility = true;
            let statusVisibility = true;
            let updateLogVisibility = true;
            //hide process dropdown if rendered from process error log or diagnostic log page
            if (this.renderedFrom == "processErrorLogsPage" || this.renderedFrom == "processDiagnosticLogsPage") {
                processVisibility = false;
            }

            //hide status and update error log column if rendered from diagnostic log page
            if (this.renderedFrom == "diagnosticLogsPage" || this.renderedFrom == "processDiagnosticLogsPage") {
                statusVisibility = false;
                updateLogVisibility = false;
            }
            let pageLength = 25;
            //initialize error logs table
            this.errorLogsTable = $('#errorLogsTable').DataTable({
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
                    { "width": "25%", "targets": 1 },
                    { "width": "15%", "targets": 2 },
                    { "width": "10%", "targets": 3, visible: statusVisibility },
                    { "width": "15%", "targets": 4, visible: processVisibility },
                    { "width": "20%", "targets": 5 },
                    { "width": "5%", "targets": 7, visible: updateLogVisibility }
                ],

                "order": [[0, "desc"]],
                "initComplete": function () {
                    $("#errorLogsTable").show();
                },
            });
            
            var _currentClassReference = this;

            //unbind error table events in case of reinitialization
            $('#errorLogsTable tbody').unbind();

            //set search event for header search input
            $('#filterSearch').on('input', function () {
                _currentClassReference.errorLogsTable.search(this.value).draw();
            });
            $.fn.dataTable.ext.errMode = 'none';
            //define error log table row click events for viewing stack trace 
            $('#errorLogsTable tbody').on('click', 'td.details-control', function () {

                var tr = $(this).closest('tr');
                var row = _currentClassReference.errorLogsTable.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    // Open this row
                    if (_currentClassReference.renderedFrom == "diagnosticLogsPage" || _currentClassReference.renderedFrom == "processDiagnosticLogsPage") {
                        row.child(_currentClassReference.formatDiagnosticLog(row.data())).show();
                        tr.addClass('shown');
                    }
                    else if (_currentClassReference.renderedFrom == "errorLogsPage" || _currentClassReference.renderedFrom == "processErrorLogsPage") {
                        row.child(_currentClassReference.formatErrorLog(row.data())).show();
                        tr.addClass('shown');
                    }
                }
            });
            // defining error log column click event for opening error resolution recording dialog
            $('#errorLogsTable tbody').on('click', 'td', function () {
                var tr = $(this).closest('tr');
                var row = _currentClassReference.errorLogsTable.row(tr);
                if (_currentClassReference.errorLogsTable.column(this).index() == 7) {
                    _currentClassReference.openUpdateErrorLogDialog(row.data());
                }
            });

            //hide pagination control if rows less than page size
            if (this.rows.length <= pageLength) {
                $("#errorLogsTable_paginate").hide();
            }
            this.setDefaultStylesForTable();
            this.errorLogsLoaded = true;
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("setErrorLogsDataItems-Error logs view component", "Global", ex.message, ex.stack, "An error occured while genearting error logs view", "N/A", 0, true);

        }
    }


    /**
   * generate array from error logs and export to excel 
   */
    exportToExcel() {
        let exportRows = [];
        for (let i = 0; i < this.rows.length; i++) {
            let exportRow = {};
            for (let key in this.rows[i]) {
                if (this.exportCols.indexOf(key) != -1) {
                    exportRow[key] = this.rows[i][key];
                }
            }
            exportRows.push(exportRow);
        }
        this.excelExportService.exportAsExcelFile(exportRows, "Error Logs");
    }

    /**
     * convert date to required format 
     * @param inputFormat 
     */
    convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        var timeString = "";
        if (inputFormat.getHours().toString().length == 1) {
            timeString += '0' + inputFormat.getHours() + ":";
        }
        else {
            timeString += inputFormat.getHours() + ":";
        }

        if (inputFormat.getMinutes().toString().length == 1) {
            timeString += '0' + inputFormat.getMinutes() + ":";
        }
        else {
            timeString += inputFormat.getMinutes() + ":";
        }

        if (inputFormat.getSeconds().toString().length == 1) {
            timeString += '0' + inputFormat.getSeconds();
        }
        else {
            timeString += inputFormat.getSeconds();
        }
        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('/') + " " + timeString;
    }

    /**
     * extract date from datetime 
     * @param inputFormat 
     */
    getDateFromDateTime(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);

        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('/')
    }

    /**
   * set default styles for table if not working due to view encapsulation 
   */
    setDefaultStylesForTable() {
        $("#errorLogsTable thead tr:first").css("box-shadow", "0px 0px 2px 0px black");
    }

    /**
     * get unique values from an array given the key of object 
     * @param itemsArray 
     * @param itemName 
     */
    getUniqueValues(itemsArray, itemName) {
        let tempArray = []
        var flags = [], l = itemsArray.length, i;
        for (i = 0; i < l; i++) {
            if (flags[itemsArray[i][itemName]]) continue;//continue if already exists
            flags[itemsArray[i][itemName]] = true;
            if (itemsArray[i][itemName] != "") {
                tempArray.push(itemsArray[i][itemName]);
            }
        }
        return tempArray;
    }

    /**
     * filter error logs table when dropdowns changed
     * @param currentFilterVal 
     */
    changeFilter(currentFilterVal) {
        try {
            //redraw table based of status filter
            if (currentFilterVal == "Status") {

                var column = this.errorLogsTable.column(3);
                var val = $.fn.dataTable.util.escapeRegex(
                    this.selectedStatus
                );

                column
                    .search(val ? '^' + val + '$' : '', true, false)
                    .draw();
            }
            //redraw table based on date filter
            else if (currentFilterVal == "Date") {
                var column = this.errorLogsTable.column(5);
                var val = $.fn.dataTable.util.escapeRegex(
                    this.selectedDate
                );

                column
                    .search(val ? '^' + val + '$' : '', true, false)
                    .draw();
            }
            //redraw table based on category filter
            else if (currentFilterVal == "Category") {
                var column = this.errorLogsTable.column(2);
                var val = $.fn.dataTable.util.escapeRegex(
                    this.selectedCategory
                );

                column
                    .search(val ? '^' + val + '$' : '', true, false)
                    .draw();
            }
            //redraw table based on process name
            else if (currentFilterVal == "ProcessName") {
                var column = this.errorLogsTable.column(4);
                var val = $.fn.dataTable.util.escapeRegex(
                    this.selectedProcess
                );

                column
                    .search(val ? '^' + val + '$' : '', true, false)
                    .draw();
            }
        }
        catch (ex) {
            this.rapidflowService.ShowErrorMessage("changeFilter-Error logs veiw component", "Global", ex.message, ex.stack, "An error occured while genearting error logs view", "N/A", 0, true);
        }
    }

    /**
     * open error resolution dialog 
     * @param logData 
     */
    openUpdateErrorLogDialog(logData): void {
        let dialogRef = this.updateErrorLogDialog.open(UpdateErrorlogDialogComponent, {
            data: {
                LogID: logData.LogID,
                Status: logData.Status,
                Category: logData.Category,
                Resolution: logData.ResolutionComments,
                RCA: logData.RCA
            }
        });
        //rerender error log table after error resolution and rca recorded
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (let i = 0; i < this.rows.length; i++) {
                    if (this.rows[i].LogID == logData.LogID) {
                        this.rows[i].Status = result.Status;
                        this.rows[i].Category = result.Category;
                        this.rows[i].ResolutionComments = result.Resolution;
                        this.rows[i].RCA = result.RCA;
                    }
                }
                this.errorLogsTable.destroy();
                this.generateErrorLogTable();
            }
        });
    }


    /**
     * expand error logs row to show stack trace 
     * @param d 
     */
    formatErrorLog(d) {
        let errorDetailsHTML = ""
        if (d.ErrorLog == "" || d.ErrorLog == undefined) {
            d.ErrorLog = "Not Available";
        }

        errorDetailsHTML += "<div style='padding:10px;background-color:#f9e8e8;border-radius:5px;'><span style='font-weight:500;color:black;'>Stack Trace</span><br/>" + d.StackTrace + "</div>";

        if (d.ResolutionComments != "" && d.ResolutionComments != undefined) {
            errorDetailsHTML += "<div style='padding:10px;background-color:#f9f4b7;border-radius:5px; margin-top:10px;'><span style='font-weight:500;color:black;'>Resolution Comments</span><br/>" + d.ResolutionComments + "</div>";
        }
        if (d.RCA != "" && d.RCA != undefined) {
            errorDetailsHTML += "<div style='padding:10px;background-color:#cef5c9;border-radius:5px; margin-top:10px;'><span style='font-weight:500;color:black;'>RCA</span><br/>" + d.RCA + "</div>";
        }
        return errorDetailsHTML;
    }
    /**
     * expand error log row to show diagnostic log
     * @param d 
     */
    formatDiagnosticLog(d) {
        let currentDiagnosticLog = decodeURIComponent(d.DiagnosticLog);


        if (currentDiagnosticLog == "" || currentDiagnosticLog == undefined || currentDiagnosticLog.length == 2) {
            currentDiagnosticLog = "Not Available";
        }
        if (d.ErrorLog == "" || d.ErrorLog == undefined) {
            d.ErrorLog = "Not Available";
        }
        //return dynamically generated diagnostic log details 
        return `<div style='padding:10px;background-color:#f9e8e8;border-radius:5px;'><span style="font-weight:500;color:black;">Stack Trace</span><br/>` + d.StackTrace + `</div>
                <div style='padding:10px;background-color:#eeeeee;border-radius:5px;margin-top:8px;'><span style="font-weight:500;color:black;">Diagnostic Log</span><br/>`+ currentDiagnosticLog + `</div>
        `;
    }


    /**
    * Sets jquery events for search toggles
    */
    setSearchOnOffEvents() {
        // assigning jquery click event to  turn on the filter on error logs
        $("#searchOn").click(() => {
            this.errorLogsTable.search("").draw();
        });

        // assigning jquery click event to  turn off the filter on error logs
        $("#searchOff").click(() => {
            this.errorLogsTable.search("").draw();
        });
    }
}
