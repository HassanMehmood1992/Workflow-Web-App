import { AlertDialogComponent } from './../alert-dialog/alert-dialog.component';
import { MatListModule, MatInputModule, MatDatepickerModule } from '@angular/material';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ReportPageComponent
Description: Renders and views the selected report and provides the fucntionality to sort search and export in excel or pdf.
.
Location: ./components/report-page.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/


import { ProcessDataService } from './../../services/process-data.service';
import { RapidflowService } from './../../services/rapidflow.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Component, Inject, Input, OnInit, AfterViewInit, ViewChild, ComponentFactoryResolver, OnDestroy, ChangeDetectorRef, ViewContainerRef, Compiler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatToolbarModule, MatCardModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatExpansionModule, MatButton, MatButtonModule } from '@angular/material';
import { EscapehtmlPipe } from '../../pipes/escapehtml.pipe'
import { DataFilterDialogComponent } from '../data-filter-dialog/data-filter-dialog.component';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import * as $ from 'jquery'
import { MatProgressBarModule } from '@angular/material';
import { ExcelExportService } from './../../services/excel-export.service';
import 'datatables.net/js/jquery.dataTables.js';
import * as jsPDF from 'jspdf/dist/jspdf.min.js'
import 'jspdf-autotable'
import * as moment from 'moment';
import { lang } from 'moment';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import MainFlatModule from '../../main-flat/main-flat.module';
let reportObject: Report;//global report object to share between parent and child component
let currentProcessID: number;//current selected process id
let currentReportID: number;//current selected report id

/**
 * Component decorator
 */
@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.css']
})
export class ReportPageComponent implements OnInit {
  reports: any;//all report object definitions to find and show title of current report
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;//child component reference
  reportLoading: boolean = true;//report loading or loaded flag to show loading
  generatePDF: boolean = false;//generate pdf allowed flag
  currentProcessID: number;//current selected process id
  currentReportID: number;//current selected report id
  navArray: any;//back navigation array containing previous states information
  allDataAccess: boolean = true;//all data access flag to show or hide advisory icon
  noPermission: boolean = false;//user has permission to view report or not to show no permission message if opened directly from url

  /**
   * Default constructor to initialize all required services via dependency injection
   * @param ProcessDataService 
   * @param rapidflowService 
   * @param compiler 
   * @param matDialog 
   * @param router 
   * @param route 
   * @param dataFilterDialog 
   * @param excelExportService 
   */
  constructor(private ProcessDataService: ProcessDataService, private rapidflowService: RapidflowService, private compiler: Compiler, private matDialog: MatDialog, private router: Router, private route: ActivatedRoute, private dataFilterDialog: MatDialog, private excelExportService: ExcelExportService) { }
  /**
   * Show data filter in effect dialog
   */
  showDataFilterDialog(): void {
    let dialogRef = this.dataFilterDialog.open(DataFilterDialogComponent, {
      width: '300px',
      height: '145px',
      data: {}
    });

    /**
     * Dialog close event
     */
    dialogRef.afterClosed().subscribe(result => {


    });

    

  }

  /**
   * Move to previous state
   */
  goback(to) {
    if (to == "process") {
      this.router.navigate(['main', 'process', currentProcessID, 'home', 'tasks']);
    } else {
      this.router.navigate(['main', 'process', currentProcessID, 'home', 'reports']);
    }

  }

  /**
   * Component initialization lifecycle hook which retrieves report data and definition and creates child component for report rendering
   */
  ngOnInit() {
    //get current report id from parameters
    this.route.params.subscribe(params => {
      currentReportID = parseInt(params['ReportID']);
    });
    //get current process id from parameters
    this.route.parent.params.subscribe(params => {
      currentProcessID = parseInt(params['ProcessID']);
      this.navArray = [{ urlBack: ['main', 'process', currentProcessID, 'home', 'reports'], urlImage: "", imagesrc: 'assets\\images\\process_menu\\reports_filled.png', text: 'Reports' }, { urlBack: ['main', 'process', currentProcessID, 'home', 'reports'], urlImage: "", imagesrc: '', text: '' }]
      var interval = setInterval(() => {
        if (this.ProcessDataService.reports != undefined) {
          this.reports = this.ProcessDataService.reports
          //set report title on navigation bar
          if (this.reports.length > 0) {
            for (var i = 0; i < this.reports.length; i++) {
              if (this.reports[i].ProcessObjectID == currentReportID) {
                this.navArray[1].text = this.reports[i].Title
              }
            }
          } else {
          }
          clearInterval(interval)
        }
      }, 1000)
    });
    //retrieve process report data api call
    this.rapidflowService.retrieveProcessReportData(currentProcessID, currentReportID, '',0,0,'','asc')
      .subscribe((response) => {
        try {
          let reportObjectJSON = JSON.parse(response.json());
          //show no permission message 
          if (reportObjectJSON.Definition == "NoPermission") {
            this.noPermission = true;
            this.reportLoading = false;
            return;
          }
          //initilize report object
          reportObject = new Report(reportObjectJSON, this.matDialog, this.rapidflowService);
          if (reportObjectJSON.Definition.Settings.GeneratePDF) {
            this.generatePDF = true;
          }

          //hide all data access flag.
          if (reportObjectJSON.AllDataAccess == 0) {
            this.allDataAccess = false;
          }
          //parameters div html for parameterized report
          let parametersDiv = `
              <mat-expansion-panel (opened)="panelOpenState = true"
              (closed)="panelOpenState = false; " >
              <mat-expansion-panel-header>
                <mat-panel-title>
                  Parameters
                </mat-panel-title>
              </mat-expansion-panel-header>
              `+ decodeURIComponent(reportObjectJSON.Definition.ParametersHTML) + `
                <div style="text-align:right;">
                  <button mat-button style="color: #007aff; background-color: #eeeeee;" (click)="reloadParameterizedReport()">Apply</button>
                </div>                
              </mat-expansion-panel>
            `;
          //report headers and footers html with dynamic content returned from api call
          let template: string = `
                <mat-card class="reportCard">
                    <div id="parametersDiv" *ngIf="reportObject.parametersHTML!=''&&reportObject.parametersHTML!=undefined">
                      `+ parametersDiv + `
                    </div>
                    
                    <div id="headerTable">
                    <div class="row">

                      <div class="col-xs-4 infoCell">`+ reportObject.reportHeader.Header_Line1_Left + `</div>
                      <div class="col-xs-4 infoCell">`+ reportObject.reportHeader.Header_Line1_Center + `</div>
                      <div class="col-xs-4 infoCell">`+ reportObject.reportHeader.Header_Line1_Right + `</div>
                      
                    </div>
                  <div class="row">

                      <div class="col-xs-4 infoCell">`+ reportObject.reportHeader.Header_Line2_Left + `</div>
                      <div class="col-xs-4 infoCell">`+ reportObject.reportHeader.Header_Line2_Center + `</div>
                      <div class="col-xs-4 infoCell">`+ reportObject.reportHeader.Header_Line2_Right + `</div>

                    </div>
                  <div class="row">

                    <div class="col-xs-4 infoCell">`+ reportObject.reportHeader.Header_Line3_Left + `</div>
                    <div class="col-xs-4 infoCell">`+ reportObject.reportHeader.Header_Line3_Center + `</div>
                    <div class="col-xs-4 infoCell">`+ reportObject.reportHeader.Header_Line3_Right + `</div>

                    </div>
                </div>
                <br />
                <table id="reportTable" class="mdl-data-table">
                    <tfoot></tfoot>
                    
                </table>
                <div id="headerTable" style="padding:20px;"  width="100%">
                <div class="row">

                  <div class="col-xs-4 infoCell">`+ reportObject.reportFooter.Footer_Line1_Left + `</div>
                  <div class="col-xs-4 infoCell">`+ reportObject.reportFooter.Footer_Line1_Center + `</div>
                  <div class="col-xs-4 infoCell">`+ reportObject.reportFooter.Footer_Line1_Right + `</div>
                  
                </div>
              <div class="row">

                  <div class="col-xs-4 infoCell">`+ reportObject.reportFooter.Footer_Line2_Left + `</div>
                  <div class="col-xs-4 infoCell">`+ reportObject.reportFooter.Footer_Line2_Center + `</div>
                  <div class="col-xs-4 infoCell">`+ reportObject.reportFooter.Footer_Line2_Right + `</div>

                </div>
              
            </div>
        </mat-card>

      `;
          //child component
          let component: string = "";
         



          this.reportLoading = false;

          //add child component
          this.addComponent(
            template,
            component
          );
        }

        catch (ex) {
          this.rapidflowService.ShowErrorMessage("ngOnInit-Report Page component", "Platform", ex.message, ex.stack, "An error occured while rendering report ", "N/A", this.currentProcessID, true);

        }


      }, (error) => {
        this.rapidflowService.ShowErrorMessage("retrieveProcessReportData report page component", "Platform", "N/A", error, "An error occured while retrieveProcessReportData", " RapidflowService.retrieveProcessReportData", this.currentProcessID, true);

      });


  }



  /**
   * Exports current report data to excel
   */
  exportToExcel() {
    
    
    try {
      let dialogRef: any;
      dialogRef = this.matDialog.open(ProgressDialogComponent, {
        data: {
          message: "Exporting data please wait...",
        }
      });
       this.rapidflowService.retrieveProcessReportData(currentProcessID,currentReportID,'',0,reportObject.recordsCount,'','desc').subscribe((response)=>{
        let reportObjectJSON = JSON.parse(response.json());
        //show no permission message 
        if (reportObjectJSON.Definition == "NoPermission") {
          this.noPermission = true;
          this.reportLoading = false;
          return;
        }
        //initilize report object
        let exportReportData=reportObjectJSON.Data;
         for (let i = 0; i < exportReportData.length; i++) {
          for (let j = 0; j < reportObject.columns.length; j++) {
            //extract html from anchor links
            let tempVal = exportReportData[i][reportObject.columns[j]];
            if (tempVal != undefined && tempVal.indexOf("href") != -1 && tempVal.indexOf("<") != -1 && tempVal.indexOf(">") != -1) {
              exportReportData[i][reportObject.columns[j]] = tempVal.split('>')[2].split('<')[0].trim();
            }
          }
        }
        //export and download file
        this.excelExportService.exportAsExcelFile(exportReportData, "Reports");
        dialogRef.close();
      });
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("exportToExcel-Report Page component", "Platform", error.message, error.stack, "An error occured while exporting to excel", "N/A", this.currentProcessID, true);
    }
  }

  /**
   * Export current report data to pdf
   */
  exportToPDF() {
    try {
      let headers = []
      let counter = 0;
      for (let i = 0; i < reportObject.columns.length; i++) {
        //set headers
        headers[i] = {};
        headers[i].dataKey = reportObject.columns[i];
        if (reportObject.columnProperties[reportObject.columns[i]] != undefined && reportObject.columnProperties[reportObject.columns[i]].ColumnHeading != "") {
          headers[i].title = reportObject.columnProperties[reportObject.columns[i]].ColumnHeading;
        }
        else {
          headers[i].title = reportObject.columns[i];
        }
      }
      var doc = new jsPDF();
      let dialogRef: any;
      dialogRef = this.matDialog.open(ProgressDialogComponent, {
        data: {
          message: "Exporting data please wait...",
        }
      });
      this.rapidflowService.retrieveProcessReportData(currentProcessID,currentReportID,'',0,reportObject.recordsCount,'','desc').subscribe((response)=>{
        let reportObjectJSON = JSON.parse(response.json());
        //show no permission message 
        if (reportObjectJSON.Definition == "NoPermission") {
          this.noPermission = true;
          this.reportLoading = false;
          return;
        }
        //initilize report object
        
        let newReportData = reportObjectJSON.Data;
        //deriving inner html from url tag.
        for (let i = 0; i < newReportData.length; i++) {
          for (let j = 0; j < reportObject.columns.length; j++) {
            let tempVal = newReportData[i][reportObject.columns[j]];
            if (tempVal != undefined && tempVal.indexOf("href") != -1 && tempVal.indexOf("<") != -1 && tempVal.indexOf(">") != -1) {
              newReportData[i][reportObject.columns[j]] = tempVal.split('>')[2].split('<')[0].trim();
            }
          }
        }
        //calculate footers for pdf
        newReportData = newReportData.sort(function (a, b) { return (a[headers[0].dataKey] > b[headers[0].dataKey]) ? 1 : ((b[headers[0].dataKey] > a[headers[0].dataKey]) ? -1 : 0); });
        if (reportObject.reportFooterValues.length > 1) {
          newReportData[newReportData.length] = {};
          for (let i = 0; i < headers.length; i++) {
            if (reportObject.reportFooterValues[i] != undefined) {
              newReportData[newReportData.length - 1][headers[i].dataKey] = reportObject.reportFooterValues[i].Data;
              if (i > 0) {
                newReportData[newReportData.length - 1][headers[i - 1].dataKey] = reportObject.reportFooterValues[i].Label;
              }
            }
            else {
              newReportData[newReportData.length - 1][headers[i].dataKey] = "";
            }
          }
        }
        //convert json to pdf table and download
        doc.autoTable(headers, newReportData, {
          tableWidth: 'wrap',
          styles: { cellPadding: 0.5, fontSize: 8 },
          margin: { top: 40 },
          addPageContent: function (data) {
            doc.text('Report', 15, 30);
          }
        });
        doc.save('Report.pdf');
        dialogRef.close();
      });

     
    }
    catch (ex) {
      this.rapidflowService.ShowErrorMessage("exportToPDF-Report Page component", "Platform", ex.message, ex.stack, "An error occured while exporting to PDF ", "N/A", this.currentProcessID, true);
    }
  }


  ngOnDestroy(){
    $('#filterSearch').unbind();
    $("#searchOn").unbind();
    $("#searchOff").unbind();
    $("#sortOn").unbind();
    $("#sortOff").unbind();
  }

  /**
   * Adds dynamic component with provided template and logic to current component
   * @param templateCurrent 
   * @param component1 
   */
  private addComponent(templateCurrent: string, component1: string) {
    @Component({

      template: templateCurrent
    })
    class TemplateComponent {

      reportGenerated: boolean = false;//report generated once flag
      reportObject: Report;//child class report object
      reportParametersString:string="";
      parameterizedReportLoading: any;//parameterized report loading or loaded flag
      queryParameterString: string;//parameters string for query of retrieve process report data with filter query string parameter
      parametersValues:any={};
       /**
       * Component initialization lifecycle hook with depency inject on required services
       * @param rapidflowService 
       * @param alertDialog 
       */
      constructor(private rapidflowService: RapidflowService, private alertDialog: MatDialog) {

      }
      /**
       * Component initialization lifecycle hook which copies report object from global object to use in bindings
       */
      ngOnInit() {

        this.reportObject = reportObject;

      }

      /**
       * After view initialization lifecycle hook which renders report using definition and data
       */
      ngAfterViewInit() {

        //render report datatable
        reportObject.generateReport();
        this.reportGenerated = true;


      }

      /**
       * Generate query string to pass in api call from parameters
       */
      generateQueryParameterString() {
        try {
          this.reportParametersString='';
          if(JSON.stringify(this.parametersValues)=="{}"||Object.keys(this.parametersValues).length!=Object.keys(this.reportObject.parametersColumns).length)
          {          
            this.alertDialog.open(AlertDialogComponent, {
              data: {
                title: "RapidFlow",
                message: "Please provide all parameters"
              }
            })
            return;
          }
          let reportParamColumns=this.reportObject.parametersColumns;
            
          for(let key in reportParamColumns)
          {
             if(reportParamColumns[key].Type=="Date")
            {
                this.reportParametersString+=key+'-kvdel-'+this.parametersValues[key].toLocaleDateString()+"-pdel-"
            }
            else if(reportParamColumns[key].Type=="PeoplePicker")
            {
              this.reportParametersString+=key+'-kvdel-'+this.parametersValues[key][0]["Email"]+"-pdel-"
              
            }
             
          }
          this.reportParametersString = this.reportParametersString.substring(0, this.reportParametersString.length - 6);
          this.reportObject.parametersString=this.reportParametersString;          
        }
        catch (error) {
          this.rapidflowService.ShowErrorMessage("generateQueryParametersString-Report Page component", "Platform", error.message, error.stack, "An error occured while generating query parameter string", "N/A", "0", true);
        }
      }

      /**
       * Refetch report data with query paramters string
       */
     

      /**
       * Relaod filtered report with new parameters on clicking apply button
       */
      reloadParameterizedReport() {
         this.generateQueryParameterString();
      
         this.reportObject.dataTableObject.draw();
          this.reportObject.setColumnLabelsAndStyles();
          this.reportObject.setDefaultStylesForTable();
          this.reportObject.setFooterValues();
       }


      
    }


    /**
     * Module decorator with requried declarations and imports
     */
    @NgModule({ declarations: [TemplateComponent], imports: [MainFlatModule, FormsModule, FlexLayoutModule, MatExpansionModule, MatProgressBarModule, MatListModule, MatButtonModule, MatInputModule, MatDatepickerModule] })
    class TemplateModule { }

    try {
      //create dynamic component
      const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
      const factory = mod.componentFactories.find((comp) =>
        comp.componentType === TemplateComponent
      );
      let comp = '';

      //evaluate dynamic logc
      eval(component1)
      const component = this.container.createComponent(factory);

      //assigne dynamic object properties to current component
      Object.assign(component.instance, comp);
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("addComponent-Report Page component", "Platform", error.message, error.stack, "An error occured while adding component - Report Page", "N/A", "0", true);
    }
  }
}

export class Report {
  reportData: any[];//current report data retrieved fom api call
  columnProperties: object;//report column properties object
  columns: string[];//report columns order
  parametersHTML = "";//parameter html for parameterized report
  reportHeader: any;//report header html
  reportFooter: any;//report footer html
  dataTableObject: any;//datatable object reference
  reportFooterValues: any = [];//footer configuration values for report
  reportTableStyle: string = "";//overall table style for datatable
  recordsCount:number=0;//total number of records loaded
  reloadingReport:boolean=false;//flag to show if report is reloading
  debounceTimeout:any;//timeout between key press to start searching
  dataIsFiltered:boolean=false;//flag if data is filtered
  currentSortOrder:string="DESC";//report data order
  footerValues:any;//footer values object for report
  parametersColumns:any//value to store column properties of parameters report
  parametersString:string="";//parameters string from parameterized report
  /**
   * Default constructor with dependency injection of required services which initializes report object properties
   * @param reportObjectJSON 
   * @param dialog 
   * @param rapidflowService 
   */
  constructor(public reportObjectJSON: any, public dialog: MatDialog, private rapidflowService: RapidflowService) {
    this.reportData = reportObjectJSON.Data;
    this.columnProperties = reportObjectJSON.Definition.ColumnProperties;
    this.columns = reportObjectJSON.Definition.Columns;
    this.parametersHTML = reportObjectJSON.Definition.ParametersHTML;
    this.reportHeader = reportObjectJSON.Definition.ReportHeader;
    this.reportFooter = reportObjectJSON.Definition.ReportFooter;
    this.reportTableStyle = reportObjectJSON.Definition.Settings.TableStyle;
    this.recordsCount=parseInt(reportObjectJSON.RecordsCount);
    this.footerValues=reportObjectJSON.FooterValues;
    this.parametersColumns=reportObjectJSON.Definition.ParametersColumns;
    this.setSearchAndSortEvents();
  }

  /**
   * Renders report datatable
   */
  generateReport() {
    try {
      let colsDatatable = [];
      for (var i = 0; i < this.columns.length; i++) {
        colsDatatable[i] = {};
        colsDatatable[i].title = this.columns[i];
        colsDatatable[i].data = this.columns[i];
        colsDatatable[i].defaultContent = "";

      }

      //default page lenght
      let pageLength = 30;

      //datatable render call
      var _currClassRef=this;
      this.dataTableObject = reportObject.dataTableObject = $('#reportTable').DataTable({
        serverSide: true,
        "fnServerData": function ( sSource, aoData, fnCallback, oSettings ) {
          let startIndex = 0;
          let pageLength = 0;
          let searchValue="";
          for (let i = 0; i < aoData.length; i++) {
            if (aoData[i].name == "start") {
              startIndex = aoData[i].value;
            }
            else if (aoData[i].name == "length") {
              pageLength = aoData[i].value;
            }
            else if(aoData[i].name=="search")
            {
              searchValue=aoData[i].value.value;
            }

          }
          let dialogRef: any;
          dialogRef = _currClassRef.dialog.open(ProgressDialogComponent, {
            data: {
              message: "Loading...",
            }
          });
          if (searchValue != "") {
            _currClassRef.dataIsFiltered = true;
          }
          else {
            _currClassRef.dataIsFiltered = false;
          }
          _currClassRef.rapidflowService.retrieveProcessReportData(currentProcessID, currentReportID, _currClassRef.parametersString,startIndex,pageLength,searchValue,_currClassRef.currentSortOrder).subscribe((response)=>{
            
            let tempResponseJSON=JSON.parse(response.json());
            let dataTablePaginationObject:any={};
            dataTablePaginationObject.data=tempResponseJSON.Data;
            _currClassRef.reportData=reportObject.reportData=tempResponseJSON.Data;
               dataTablePaginationObject.recordsTotal=tempResponseJSON.RecordsCount;
              dataTablePaginationObject.recordsFiltered=tempResponseJSON.RecordsCount;
            
             
            
           
           
             
              fnCallback(dataTablePaginationObject);
              $("#reportTable tbody tr td").each(function(){
                if($(this).html().trim().indexOf("[object Object]")!=-1){
                  $(this).html("<a style='cursor:pointer;'>View</a>")
                }
                })
                dialogRef.close();
            
          
          });
        },
        pagingType: "simple",
        "autoWidth": false,
        ordering:false,
        columns: colsDatatable,
        dom: 'Bfrtipl',
        "lengthMenu": [[pageLength], [pageLength]],
        buttons: [
          'excel', 'pdf'
        ],
        "initComplete": function () {
        },
      });

      //click event to open details report dialog
      $('#reportTable tbody').on('click', 'td', function () {
        if (typeof (reportObject.reportData[reportObject.dataTableObject.row(this).index()][reportObject.columns[reportObject.dataTableObject.column(this).index()]]) == "object") {
          var detailsObjectName = "";
          if (reportObject.columnProperties[reportObject.columns[reportObject.dataTableObject.column(this).index()]] != undefined && reportObject.columnProperties[reportObject.columns[reportObject.dataTableObject.column(this).index()]].ColumnHeading != "") {
            detailsObjectName = reportObject.columnProperties[reportObject.columns[reportObject.dataTableObject.column(this).index()]].ColumnHeading;

          }
          else {

            detailsObjectName = reportObject.columns[reportObject.dataTableObject.column(this).index()];
          }
          reportObject.openDetailsReportDialog(reportObject.reportData[reportObject.dataTableObject.row(this).index()][reportObject.columns[reportObject.dataTableObject.column(this).index()]], detailsObjectName, reportObject.reportTableStyle);
        }

      });
      //rebind search event to header search input
      $('#filterSearch').on('input', function () {
        clearTimeout(_currClassRef.debounceTimeout);
        _currClassRef.debounceTimeout=setTimeout(()=>{
           reportObject.dataTableObject.search(this.value).draw();
        },1000);
        
      });

      
      //set default styles and footer values for datatable
      this.setColumnLabelsAndStyles();
      this.setFooterValues();
      this.setDefaultStylesForTable();
      $('#reportTable').on('draw.dt', () => {
        this.setColumnLabelsAndStyles();
      });
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("generateReport-Report Page component", "Platform", error.message, error.stack, "An error occured while generating report", "N/A", "0", true);
    }
  }

  /**
   * Set default styles due to view encapsulation
   */
  setDefaultStylesForTable() {
    $("#reportTable thead tr:first").css("box-shadow", "0px 0px 2px 0px black");
    $("#reportTable").attr("style", this.reportTableStyle);
  }

  setColumnLabelsAndStyles() {
    for (var key in this.columnProperties) {
      $("#reportTable tbody td:nth-child(" + (this.columns.indexOf(key) + 1) + ")").attr("style", this.columnProperties[key].dataStyle);
      $("#reportTable thead th:nth-child(" + (this.columns.indexOf(key) + 1) + ")").attr("style", this.columnProperties[key].headerStyle);
      $("#reportTable thead th:nth-child(" + (this.columns.indexOf(key) + 1) + ")").html(this.columnProperties[key].ColumnHeading)
    }
  }

  /**
   * Set footer values for report based of column properties
   */
  setFooterValues() {
    try {
      let footersArray = [];
      for (let i = 0; i < this.columns.length; i++) {
        if (typeof (this.columnProperties[this.columns[i]]) != "undefined") {
          if (typeof (this.columnProperties[this.columns[i]].FooterData) && (this.columnProperties[this.columns[i]].FooterData != "")) {
            //set aggregates for column
            if (this.columnProperties[this.columns[i]].FooterData == "SUM"||this.columnProperties[this.columns[i]].FooterData == "AVG") {
              footersArray[i] = {};
              let aggregate = 0;
              for (let j = 0; j < this.footerValues.length; j++) {
                if(this.footerValues[j].ColumnName==this.columns[i])
                {
                  aggregate=parseInt(this.footerValues[j].Aggregate)
                }
                
              }
              footersArray[i].Data = aggregate;
              footersArray[i].Label = this.columnProperties[this.columns[i]].FooterLabel;
            }
            else if(this.columnProperties[this.columns[i]].FooterData == "COUNT")
            {
              footersArray[i] = {};
              footersArray[i].Data = this.recordsCount;
              footersArray[i].Label = this.columnProperties[this.columns[i]].FooterLabel;
            }
           
          }
        }
      }
      $("#reportTable tfoot").html("");
      //apply columns styles returned from definition
      for (let i = 0; i < this.columns.length; i++) {
        let currentStyle = "";
        if (typeof (this.columnProperties[this.columns[i]]) != "undefined") {
          currentStyle = this.columnProperties[this.columns[i]].FooterStyle;
        }

        if (footersArray[i] != undefined) {
          $("#reportTable tfoot").append("<td style='" + currentStyle + "' align='right'>" + footersArray[i].Data + "</td>");

        }
        else {
          $("#reportTable tfoot").append("<td style='" + currentStyle + "' align='right'></td>");
        }

      }
      for (let i = 0; i < this.columns.length; i++) {
        if (footersArray[i + 1] != undefined) {
          $("#reportTable tfoot td:nth-child(" + (i + 1) + ")").append(footersArray[i + 1].Label);
        }

      }
      this.reportFooterValues = footersArray;
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("setFooterValues-Report Page component", "Platform", error.message, error.stack, "An error occured while setting footer values", "N/A", "0", true);
    }
  }

  /**
   * Show details report dialog on details column click to show details table data
   * @param tableData 
   * @param tableName 
   * @param tableStyle 
   */
  openDetailsReportDialog(tableData, tableName, tableStyle): void {
    let dialogRef = this.dialog.open(DetailsReportDialogComponent, {
      width: 'auto',
      height: 'auto',
      data: { TableName: tableName, TableData: tableData, TableStyle: tableStyle }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  /**
* Sets jquery events for search toggles
*/
  setSearchAndSortEvents() {
    
    // assigning jquery click event to  turn off the filter on error logs
    $("#searchOff").click(() => {
      if(this.dataIsFiltered)
      {
        this.dataTableObject.search("").draw();
      }
      
    });
    $("#sortOn").click(() => {
      this.currentSortOrder="ASC";
     this.dataTableObject.order( [ 0, 'asc' ] ).draw();;
    });
    $("#sortOff").click(() => {
      this.currentSortOrder="DESC";
      this.dataTableObject.order( [ 0, 'desc' ] ).draw();;
     });
  }
}

/**
 * Details table dialog component decorator
 */
@Component({
  selector: 'dialog-details-report',
  template: ` 
              <div class="dialogTitle">
              {{tableName}}
              </div>
              <table id="detailsTable" class="mdl-data-table">
              </table>
               
              
              `,
})


export class DetailsReportDialogComponent {
  tableData: object[];//details table data
  tableName: string;//details table name
  tableStyle: string;//details table default styles

  /**
   * Default constructor with dependency injection of required services and references
   * @param dialogRef 
   * @param data 
   * @param rapidflowService 
   */
  constructor(
    public dialogRef: MatDialogRef<DetailsReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private rapidflowService: RapidflowService) {
    this.tableName = data.TableName;
    this.tableData = data.TableData;
    this.tableStyle = data.TableStyle;
  }
  /**
   * Component initialzation lifecycle hook which initializes details report
   */
  ngOnInit() {
    try {

      let colsDetailsTable = [];
      let index = 0;
      for (let key in this.tableData[0]) {
        colsDetailsTable[index] = {};
        colsDetailsTable[index].data = key;
        colsDetailsTable[index].title = key;
        colsDetailsTable[index].defaultContent = "";
        index++;
      }

      let pageLengthDetails = 5;//default page length

      //render details datatable
      $('#detailsTable').DataTable({
        data: this.tableData,
        "order": [[0, "desc"]],
        columns: colsDetailsTable,
        language: {
          "search": "<img src='assets/images/top_level/filter_selected_web.png' style='width:22px;margin-bottom:5px;'/>"
        },
        lengthMenu: [[pageLengthDetails], [pageLengthDetails]],

      });
      this.setDetailsTableDefaultStyles();
      //hide pagination control if rows less than page size
      if (this.tableData.length <= pageLengthDetails) {
        $("#detailsTable_paginate").hide();
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("ngOnInit-Report Page component", "Platform", error.message, error.stack, "An error occured while opening dialog", "N/A", "0", true);
    }
  }

  /**
   * Set default styles due to view encapsulation
   */
  setDetailsTableDefaultStyles() {
    $("#detailsTable thead tr:first").css("box-shadow", "0px 0px 2px 0px black");
    $("#detailsTable").attr("style", this.tableStyle);
  }


  /**
   * Close deatails report dialog on no click
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

}