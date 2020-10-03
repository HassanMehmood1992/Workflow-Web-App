
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PivotPageComponent
Description: Provide functionality to the pivots inside this view. This component also provide functionality of puplishing the updated pivot if the user have permission.
Location: ./pivot-page.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { forwardRef, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, Component, Inject } from '@angular/core';
import { RapidflowService } from '../../services/rapidflow.service'
import { DataFilterDialogComponent } from '../data-filter-dialog/data-filter-dialog.component';
import * as $ from 'jquery'
import 'jquery-ui-dist/jquery-ui.js'
import 'pivottable/dist/pivot.min.js'
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PublishPivotDialogComponent } from '../publish-pivot-dialog/publish-pivot-dialog.component';
import { ErrorReportingDialogComponent } from '../error-reporting-dialog/error-reporting-dialog.component';
import { ProcessDataService } from '../../services/process-data.service';
import { ExcelExportService } from '../../services/excel-export.service';

/**
 * Component decorator
 */
@Component({
    selector: 'app-pivot',
    templateUrl: './pivot-page.component.html',
    styleUrls: ['./pivot-page.component.css', '../../../../node_modules/pivottable/dist/pivot.css']
})
export class PivotPageComponent implements AfterViewInit {
    pivots: any;//current pivots to set top title of current pivot
    pivotObject: Pivot;//pivot object containing all pivot properties and data
    navArray: any;//back navigation array 
    pivotLoading: boolean = true;//flag to see if pivot is loading or not to show hide loading
    currentProcessID: number;//current selected process id
    currentPivotID: number;//current selected pivot id
    noPermission: boolean = false;//flag to check if user has permssion to view the pivot
    allDataAccess: boolean = true;//all data access flag to show hide advisory icon
    errorDialogRef: any;//error reporting dialog reference
    canPublishPivot: boolean = false;//flag to show publish pivot icon if user has permissio

    /**
     * Default constructor with dependency injection of all necessary objects and services 
     * @param rapidflowService 
     * @param ProcessDataService 
     * @param publishDialog 
     * @param route 
     * @param dataFilterDialog 
     * @param router 
     * @param errorDialog 
     * @param excelExportService 
     */
    constructor(private rapidflowService: RapidflowService, private ProcessDataService: ProcessDataService, private publishDialog: MatDialog, private route: ActivatedRoute, private dataFilterDialog: MatDialog, private router: Router, private errorDialog: MatDialog, private excelExportService: ExcelExportService) {
        this.navArray = []

    }

    /**
 * Component initialization lifecycle hook which needs to be overridden
 */
    ngOnInit() {
        this.route.params.subscribe(params => {
            this.currentPivotID = parseInt(params['PivotID']);
        });
        this.route.parent.params.subscribe(params => {
            this.currentProcessID = parseInt(params['ProcessID']);
            this.navArray = [{ urlBack: ['main', 'process', this.currentProcessID, 'home', 'pivots'], urlImage: ['main', 'process', this.currentProcessID, 'home', 'pivots'], imagesrc: 'assets\\images\\process_menu\\Pivot_Selected.png', text: 'Pivots' }, { urlBack: ['main', 'process', this.currentProcessID, 'home', 'pivots'], urlImage: "", imagesrc: '', text: 'Pivot' }]
        });
    }

    /**
     * Navigate back to previous page
     * @param to 
     */
    goback(to) {
        if (to == "process") {
            this.router.navigate(['main', 'process', this.currentProcessID, 'home', 'tasks']);
        } else {
            this.router.navigate(['main', 'process', this.currentProcessID, 'home', 'pivots']);
        }
    }

    /**
  * After view initialiaztion lifecycyle hook which initilazes pivot with data and settings retrieved from the api call
  */
    ngAfterViewInit() {
        //retrieve pivot data and definition api call
        this.rapidflowService.retrieveProcessReportData(this.currentProcessID, this.currentPivotID, '',0,0,'','')
            .subscribe((response) => {
                try {

                    let pivotObjectJSON = JSON.parse(response.json());
                    //show no permission message if user dont have permission to view the pivot
                    if (pivotObjectJSON.Definition == "NoPermission") {
                        this.noPermission = true;
                        this.pivotLoading = false;
                    }
                    else {
                        this.pivotObject = new Pivot(pivotObjectJSON);
                        if (pivotObjectJSON.CanPublishPivot == 1) {
                            this.canPublishPivot = true;
                        }

                        this.pivotObject.crossApplyPivotData();
                        //render pivot in output div
                        this.pivotObject.gereratePivot("output");
                        this.pivotLoading = false;
                        //hide advisory icon if the user have full access
                        if (pivotObjectJSON.AllDataAccess == 0) {
                            this.allDataAccess = false;
                        }
                    }

                    //retrieve pivots from process data service to set title
                    var interval = setInterval(() => {
                        if (this.ProcessDataService.pivots != undefined) {

                            this.pivots = this.ProcessDataService.pivots
                            if (this.pivots.length > 0) {
                                for (var i = 0; i < this.pivots.length; i++) {
                                    if (this.pivots[i].ProcessObjectID == this.currentPivotID) {

                                        this.navArray[1].text = this.pivots[i].Title
                                    }
                                }
                            } else {
                            }
                            clearInterval(interval)
                        }
                    }, 1000)
                }
                catch (ex) {
                    this.rapidflowService.ShowErrorMessage("ngAfterViewInit-Pivot Page component", "Platform", ex.message, ex.stack, "An error occured while rendering pivot view", "N/A", this.currentProcessID, true);
                }
            }, (error: any) => {
                this.rapidflowService.ShowErrorMessage("retrieveProcessReportData-Pivot Page component", "Process", "Error occured while executing api call", error, "An error occured while retrieving process report data", " N/A", this.currentProcessID, true);
            });
    }


    /**
     * Open data filter in effect dialog upon clicking advisory icon
     */
    showDataFilterDialog(): void {
        let dialogRef = this.dataFilterDialog.open(DataFilterDialogComponent, {
            width: '300px',
            height: 'auto',
            data: {}
        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }

    /**
  * Open publish pivot dialog upon clicking publish pivot icon
  */
    openPublishDialog(): void {
        try {
            let dialogRef = this.publishDialog.open(PublishPivotDialogComponent, {
                width: '420px',
                height: 'auto',
                data: { PivotInfo: this.pivotObject, OperationType: 'New', ProcessId: this.currentProcessID }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    //navigate to pivots list if pivot published
                    this.ProcessDataService.pivots.push(result);
                    this.router.navigate(['main', 'process', this.currentProcessID, 'home', 'pivots']);

                }

            });
        }
        catch (error) {
            this.rapidflowService.ShowErrorMessage("openPublishDialog-Pivot Page component", "Process", "Error occured while opening publish dialog", error, error.stack, "N/A", this.currentProcessID, true);
        }
    }

    exportToExcel() {
        this.excelExportService.exportAsExcelFile(this.pivotObject.data, "Pivots");
    }
}
export class Pivot {
    /**
     * Pivot default constructor to initialize pivot properties
     * @param pivotObjectJSON 
     */
    constructor(public pivotObjectJSON) {
        this.data = pivotObjectJSON.Data;
        this.pivotPublishableForUser = pivotObjectJSON.CanPublishPivot;
        this.currentProcessRoles = pivotObjectJSON.CurrentProcessRoles;
        this.aggregatorName = pivotObjectJSON.Definition.Settings.AggregatorName;
        this.rendererName = pivotObjectJSON.Definition.Settings.RendererName;
        this.rows = pivotObjectJSON.Definition.Settings.Rows;
        this.cols = pivotObjectJSON.Definition.Settings.Cols;
        this.inclusions = pivotObjectJSON.Definition.Settings.Inclusions;
        this.vals = pivotObjectJSON.Definition.Settings.Vals;
        this.dataSelection = pivotObjectJSON.Definition.Settings.DataSelection;
    }
    private rows: string[];//rows to show for pivot
    private cols: string[];//columns to show for pivot
    private aggregatorName: string;//pivot aggregator
    private rendererName: string;//pivot renderer
    private inclusions: object;//value inclusions for pivot
    private vals: string[];//pivot aggregator and renderer values
    public data: object[];//pivot data
    private currentProcessRoles: object[];//current process roles to apply permission while publishing pivot
    private pivotPublishableForUser: boolean = false;//flag to check if user has publish pivot permissions
    private dataSelection: string;//pivot data selection query string
    /**
     * Generate deatils table view for pivot cell
     */
    crossApplyPivotData() {
        for (let i = 0; i < this.data.length; i++) {
            for (let key in this.data[i]) {
                if (typeof (this.data[i][key]) == "object") {
                    this.data[i][key] = JSON.stringify(this.data[i][key]).replace(/{/g, "(").replace(/"/g, '').replace(/}/g, ')').replace('[', '').replace(']', '');

                }
            }
        }
    }

    /**
     * Render pivot in the passed div id 
     * @param divID 
     */
    gereratePivot(divID: string) {
        $.pivotUtilities.tipsData = this.data;
        $("#" + divID).pivotUI(
            $.pivotUtilities.tipsData, {
                rows: this.rows,
                cols: this.cols,
                vals: this.vals,
                aggregatorName: this.aggregatorName,
                rendererName: this.rendererName,
                inclusions: this.inclusions,

                onRefresh: (pivotUIOptions) => {
                    //update current pivot properties with each pivot event
                    this.rows = pivotUIOptions.rows;
                    this.cols = pivotUIOptions.cols;
                    this.aggregatorName = pivotUIOptions.aggregatorName;
                    this.rendererName = pivotUIOptions.rendererName;
                    this.vals = pivotUIOptions.vals;
                    this.inclusions = pivotUIOptions.inclusions;

                },
            });
    }
}

