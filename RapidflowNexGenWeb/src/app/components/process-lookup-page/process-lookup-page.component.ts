import { AlertDialogComponent } from './../alert-dialog/alert-dialog.component';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/
/*
ModuleID: ProcessLookupPageComponent
Description: Renders the selected lookup with sort, search, add, edit, delete import and export functionality for the user with appropriate permissions.
Location: ./components/process-lookups.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { EventEmiterService } from './../../services/event-emiters.service';
import { ErrorReportingDialogComponent } from './../error-reporting-dialog/error-reporting-dialog.component';
import { SocketProvider } from './../../services/socket.service';
import { ProgressDialogComponent } from './../progress-dialog/progress-dialog.component';
import { LookupApprovalDialogComponent } from './../lookup-approval-dialog/lookup-approval-dialog.component';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { ProcessLookupItemComponent } from './process-lookup-item/process-lookup-item.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { RapidflowService } from './../../services/rapidflow.service';
import { ProcessDataService } from './../../services/process-data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import * as $ from 'jquery'
import 'datatables.net/js/jquery.dataTables.js';
import { ExcelExportService } from '../../services/excel-export.service';
import * as moment from 'moment';
import { ProcessLookupImportComponent } from './process-lookup-import/process-lookup-import.component';
var allLookupData=[]
/**
 * Component Decorator
 * 
 * @export
 * @class ProcessLookupPageComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-process-lookup-page',
  templateUrl: './process-lookup-page.component.html',
  styleUrls: ['./process-lookup-page.component.css']
})
export class ProcessLookupPageComponent implements OnInit {
  searchValue: any;
  recordsTotal: any;
  paramLIDSubscription: any;
  paramQuerySubscription: any;
  paramPIDSubscription: any;
  duplicateValuesArray: any; // to check duplicate item issues on restore function
  permissionSetted: boolean; // flag to check that permissions are setted
  exportItems: any; // contains list of item needed to be exported
  deletedFound: boolean; // check if the item is deleted approval
  pendingapprovalfound: boolean; // check if item is in pending state
  dialogRef: MatDialogRef<ProgressDialogComponent>; // to show progress dialog
  alertDialogRef: MatDialogRef<AlertDialogComponent>//to show alert dialog
  errordialogRef: MatDialogRef<ErrorReportingDialogComponent>; // to show error dialog
  errorDialog: MatDialog // to show error dialog
  lookupDispalyAndTitleArray: any; // to show display names in lookup approval task
  dataPayLoad: any; // to contain the details of datapayload to pass in update call
  navArray: any; // to configure navigation bar on lookup page
  processPermission: any; // contain the permission on process for user
  userProcessSettings: any; // contain the overall user settings in the process
  exists: any; // flag to pass in lookup item that new item is added or existing lookup item is aditted
  activatedItem: boolean; // flag if the item view is activated or over all item view is activated
  lookup: any; //contain the current lookup definition
  refreshDataTable: boolean // flag to refresh the table
  tableColumnDisplay: any; // array of columns to display in lookup table
  lookupTable: any; // Data table variable containing lookup items
  headers = [] // array of headers to be exported in excel
  lookupLoading: boolean // flag if the lookup are loading
  lookupsAvailable: boolean; // flag if the lookup is availabloe or not
  lookups: any; // contain all the lookups and their definitions
  errorfound: boolean // flag if the error found in any action
  lookupId: number; // Contain current lookup id
  processId: number; // contain current process id
  processLookupData; // contain the lookup data to be displayed in table
  displayedColumns = []; // array of columns to be displayed
  itemName: any; // contain first coulmn value to be displayed in nav bar when item view is displayed
  currentItem: any; // contain current selected item details
  permissionArray: any // contains user permission array on current lookup
  dataSource: any; // contain the valid data to be displayed in table
  currentlookupDefinitions: any // contain thelookup definition to be forwarded in lookup item view
  noPermission: boolean = false; // flag if user having no permission
   debounceTimeout:any;
  dataIsFiltered:boolean=false;//flag if data is filtered
  currentSortOrder:string='DESC';
  totalSize:any
  /**
   * Creates an instance of ProcessLookupPageComponent.
   * @param {EventEmiterService} eventEmiterService 
   * @param {MatDialog} dialog 
   * @param {ProcessDataService} processDataService 
   * @param {SocketProvider} socket 
   * @param {RapidflowService} rapidflowService 
   * @param {MatDialog} lookupItemDialog 
   * @param {MatDialog} lookupImportDialog 
   * @param {Router} router 
   * @param {ActivatedRoute} route 
   * @param {MatDialog} lookupApprovalDialog 
   * @param {ExcelExportService} excelExportService 
   * @memberof ProcessLookupPageComponent
   */
  constructor(private eventEmiterService: EventEmiterService, private dialog: MatDialog, private processDataService: ProcessDataService, private socket: SocketProvider, private rapidflowService: RapidflowService, private lookupItemDialog: MatDialog, private lookupImportDialog: MatDialog, private router: Router, private route: ActivatedRoute, private lookupApprovalDialog: MatDialog, private excelExportService: ExcelExportService) {
    this.lookupLoading = true
    this.errorfound = false
    this.lookup = []
    this.refreshDataTable = false
    this.activatedItem = false
    this.itemName = ""
    this.totalSize=0
    this.navArray = [];
    this.permissionSetted = false
    this.currentItem = [];
    this.permissionArray = { Add: false, Edit: false, View: false, Delete: false, Approve: false, Reject: false }
  }

  /**
   * Read message from event emitter service to refresh the lookup
   * 
   * @param {any} message 
   * @memberof ProcessLookupPageComponent
   */
  checkmessage(message) {
    try {
      if (message["Type"] == "Referesh") {
        for (var property in message["Value"]) {
          if (message["Value"].hasOwnProperty('Lookup')) {
            if (this.refreshDataTable == false) {
              this.GetProcessLookupsAndData()
              this.hideItem()
              this.refreshDataTable = true
            }
          }
          if (message["Value"].hasOwnProperty('ProcessLookup')) {
            if (this.refreshDataTable == false) {
              this.GetProcessLookupsAndData()
              this.hideItem()
              this.refreshDataTable = true
            }
          }
        }
      }
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("ngAfterViewInit-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while rendering pivot view", "N/A", this.processId, true);
    }
  }
  /**
   * component initialization lifecycle hook
   * 
   * @memberof ProcessLookupPageComponent
   */
  ngOnInit() {
    try {
      this.permissionSetted = false
      // set observer to receive message from event emitter service
      this.eventEmiterService.currentMessage.subscribe(message => this.checkmessage(message))
      $(document).click(function () {
        $(".dropdown-menu").parent().removeClass("open")
      });
    this.paramPIDSubscription = this.route.parent.paramMap
        .subscribe((params: ParamMap) => {
          this.processId = +params.get('ProcessID');
        })

      //get process lookup data uising api call
      this.GetProcessLookupsAndData()
      this.setSearchAndSortEvents();
      // retrieving lookup data if the lookup id is changed
      this.paramQuerySubscription =   this.route.queryParamMap
        .subscribe(params => {
          if (params['params'].Status != null && params['params'].Status != undefined && params['params'].Status != "") {
            this.hideItem()
            this.refreshDataTable = true
            this.router.navigate(['main', 'process', this.processId, 'Lookup', this.lookupId])
            this.RefereshLookupsAndProcess()
          }
        })
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("ngOnInit-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while initation of process lookup page", "N/A", this.processId, true);
    }
  }
  /**
   * Retrieve lookup definition and lookup data
   * 
   * @returns 
   * @memberof ProcessLookupPageComponent
   */
  GetProcessLookupsAndData() {
    try {
      this.paramLIDSubscription =   this.route.paramMap.subscribe((params: ParamMap) => {
        this.lookupId = +params.get('LookupID');
        this.navArray = [{ urlBack: ['main', 'process', this.processId, 'home', 'tasks'], urlImage: ['main', 'process', this.processId, 'Process Lookups'], imagesrc: 'assets\\images\\process_menu\\Lookup_Selected.png', text: 'Process Lookups' }, { urlBack: ['main', 'process', this.processId, 'Lookups'], urlImage: "", imagesrc: '', text: 'Process Lookup' }]
        // retrieving process lookup definition
        this.lookupLoading=true;
        let processlookups = this.rapidflowService.retrieveProcessLookupsWCF(this.processId)
          .subscribe((response) => {
            this.lookups = JSON.parse(response.json())
            let lookupAvailable = false;
            if (this.lookups.length > 0) {
              for (var l = 0; l < this.lookups.length; l++) {
                if (this.lookups[l].LookupID == this.lookupId) {
                  lookupAvailable = true;
                  this.lookup = this.lookups[l]
                  this.getandSetPermissions(this.lookup)

                  this.currentlookupDefinitions = this.lookups[l].ColumnDefinitions
                  this.navArray[1].text = this.lookups[l].LookupTitle
                 // retrieving process lookup data
                  this.rapidflowService.retrieveProcessLookupPageDataWCF(this.lookupId, this.processId,0,1,'','')
                    .subscribe((response2) => {
                      this.processLookupData = JSON.parse(response2.json());
                      this.setTableDetails()
                    }, (error) => {
                      this.dialog.closeAll()
                      // pai error handler
                      this.rapidflowService.ShowErrorMessage("retrieveProcessLookupPageDataWCF Lookup page component", "Platform", error, "N/A", "An error occured while retrieveProcessLookupPageDataWCF", " rapidflowService.retrieveProcessLookupPageDataWCF", this.processId, true);
                    });
                  break;
                }
              }
              // decision if lookup data is available
              if (!lookupAvailable) {
                this.noPermission = true;
                this.lookupLoading = false;
              }
            }
            else {
              this.noPermission = true;
              this.lookupLoading = false;
            }
          });
      }, (error) => {
        this.dialog.closeAll()
        // api error handler
        this.rapidflowService.ShowErrorMessage("retrieveProcessLookupsWCF Lookup page component", "Platform", error, "N/A", "An error occured while retrieveProcessLookupsWCF", " rapidflowService.retrieveProcessLookupsWCF", this.processId, true);
      });
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("GetProcessLookupsAndData-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while rendering mapping lookup dafination and data", "N/A", this.processId, true);
    }
  }

  /**
   * Set variable according to datatable standared
   * 
   * @memberof ProcessLookupPageComponent
   */
  setTableDetails() {
    try {
      this.dataSource = []
      this.tableColumnDisplay = []
      let currentlookupDisplayData = {}
      let itemvalue = []
      this.exportItems = []
      this.pendingapprovalfound = false
      this.deletedFound = false
      for (var i = 0; i < this.processLookupData.length; i++) {
        itemvalue = []
        if (this.processLookupData[i].ApprovalStatus == "Approved") {
          var actioncolumn = '' + i + '';
          itemvalue["ItemID"] = actioncolumn;
          itemvalue["Status"] = ""
          itemvalue['Deleted'] = ""
          itemvalue["ItemMenu"] = ""
          // setting up lookup item status icons
          if (this.processLookupData[i].DateDeleted != undefined && this.processLookupData[i].DateDeleted != null && this.processLookupData[i].DateDeleted != "") {
            var html2 = ' <div class="dropdown"><span id="' + i + 'dropdown" class="mydropdown" class="" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-option-vertical"></span><ul class="dropdown-menu pull-right" style="min-width: 80px !important"> <li><a id="' + i + 'actionButton" style="padding:0px 13px 0px 8px"  class="actionButton restore"><img src="assets/images/process_menu/notifications/restore_from_trash.png" style="width: 20px; margin-right: 5px; margin-top: -3px;" />Restore</a></li> </ul>  </div>'
            this.deletedFound = true
            itemvalue["Deleted"] = ' <img src="assets/images/process_menu/Process Lookups/Delete.png"style="width:15px;height:20px;padding-bottom:4px"/> '
          } else {
            var html2 = '<div class="dropdown"> <span id="' + i + 'dropdown" class="mydropdown" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-option-vertical"></span><ul class="dropdown-menu pull-right" style="min-width: 80px !important"> <li><a id="' + i + 'actionButton" style="padding:0px 16px 0px 10px;" class="actionButton delete" ><img src="assets/images/top_level/Remove_1.png" style="width:16px;margin-right:6px;margin-top:-2px;"/>Delete</a></li> </ul> </div>'
            itemvalue["Deleted"] = ''
          }
          itemvalue["ItemMenu"] = '<div style="    max-width: 1px;">' + html2 + '</div>';
        } else {
          this.pendingapprovalfound = true
          itemvalue['Deleted'] = ""
          itemvalue["ItemMenu"] = ""
          var actioncolumn = '' + i + '';
          itemvalue["ItemID"] = actioncolumn;
          var html = ""
          var title = ""
          if (this.processLookupData[i].NotificationDetails.ItemStatus == 'delete') {
            title = "Pending Approval: Item Deleted"
            html = '<img src="assets/images/others/stopwatch.png" style="width:15px;height:15px; "/>'
          } else if (this.processLookupData[i].NotificationDetails.ItemStatus == 'modified') {
            html = '<img src="assets/images/others/stopwatch.png" style="width:15px;height:15px; "/>'
            title = "Pending Approval: Item Modified"
          } else {
            html = '<img src="assets/images/others/stopwatch.png" style="width:15px;height:15px; "/>'
            title = "Pending Approval: Item Created"
          }
          itemvalue["Status"] = '<div title="' + title + '" style="max-width: 20px;">' + html + '</div>';
        }

        // formating data to be displayed in table

        for (var k = 0; k < this.currentlookupDefinitions.length; k++) {
          if (this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName] == null || this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName] == undefined) {
            itemvalue[this.currentlookupDefinitions[k].ShortName] = ""
          } else {
            if (typeof this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName] === "object" && this.currentlookupDefinitions[k].Type.toLowerCase() == "peoplepicker") {
              itemvalue[this.currentlookupDefinitions[k].ShortName] = ""
              for (var m = 0; m < this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName].length; m++) {
                itemvalue[this.currentlookupDefinitions[k].ShortName] += this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName][m].DisplayName
                if (m != (this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName].length - 1)) {
                  itemvalue[this.currentlookupDefinitions[k].ShortName] += "; ";
                }
              }
            } else if (this.currentlookupDefinitions[k].Type.toLowerCase() == "url") {
              itemvalue[this.currentlookupDefinitions[k].ShortName] = ""
              for (var m = 0; m < this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName].length; m++) {
                itemvalue[this.currentlookupDefinitions[k].ShortName] += '<a target="_blank" href="' + this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName][m].url + '" >' + this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName][m].title + '</a>'
                if (m != (this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName].length - 1)) {
                  itemvalue[this.currentlookupDefinitions[k].ShortName] += "; ";
                }
              }
            } else {
              if (this.currentlookupDefinitions[k].Type.toLowerCase() == "date") {
                var dateB = moment(this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName]);
                itemvalue[this.currentlookupDefinitions[k].ShortName] = dateB.format('DD-MMM-YYYY');
              } else if (this.currentlookupDefinitions[k].Type.toLowerCase() == "datetime") {
                var dateB = moment(this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName]);
                itemvalue[this.currentlookupDefinitions[k].ShortName] = dateB.format('DD-MMM-YYYY hh:mm A');
              } else if (this.currentlookupDefinitions[k].Type.toLowerCase() == "time") {
                var dateB = moment(this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName]);
                itemvalue[this.currentlookupDefinitions[k].ShortName] = dateB.format('hh:mm A');
              } else
                itemvalue[this.currentlookupDefinitions[k].ShortName] = this.processLookupData[i].Value[this.currentlookupDefinitions[k].ShortName]
            }
          }
        }

        // populating variable to export and display the lookup items
        this.exportItems.push(itemvalue)
        this.dataSource.push(itemvalue)
      }

      // setting up display columns based on permission and item status
      this.tableColumnDisplay.push({ 'data': 'ItemID', 'title': 'Take Action', 'visible': false })
      for (var k = 0; k < this.currentlookupDefinitions.length; k++) {
        if (this.currentlookupDefinitions[k].ShortName && this.currentlookupDefinitions[k].Options.visible == true) {
          this.headers.push(this.currentlookupDefinitions[k].ShortName)
          this.tableColumnDisplay.push({ 'data': this.currentlookupDefinitions[k].ShortName, 'title': this.currentlookupDefinitions[k].DisplayName })
        }
      }
     // if (this.pendingapprovalfound) {
        this.tableColumnDisplay.push({ 'data': 'Status', 'title': '', "width": '18px' })
    //  } else {
     //   this.tableColumnDisplay.push({ 'data': 'Status', 'title': '', "width": '18px', 'visible': false })
     // }
     // if (this.deletedFound) {
        this.tableColumnDisplay.push({ 'data': 'Deleted', 'title': '', "width": '18px' })
    //  }
    //  else {
      //  this.tableColumnDisplay.push({ 'data': 'Deleted', 'title': '', "width": '18px', 'visible': false })
     // }

      // setting up restore or delete menu if the permissions are found
      var deletepermissionInterval = setInterval(() => {
        if (this.processDataService.userProcessSettings != undefined && this.processDataService.userProcessSettings != null && this.permissionSetted == true) {
         // if (this.permissionArray.Delete == true) {
            this.tableColumnDisplay.push({ 'data': 'ItemMenu', 'title': '', "width": '18px' })
         // } else {
         //   this.tableColumnDisplay.push({ 'data': 'ItemMenu', 'title': '', "width": '18px', 'visible': false })
         // }
          this.lookupLoading = false
          this.generateLookupTable()
          clearInterval(deletepermissionInterval)
        }
      }, 100)
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("setTableDetails-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while setting up valid data in lookup table", "N/A", this.processId, true);
    }
  }

  /**
   * assigning click event to open item drop down menu
   * 
   * @memberof ProcessLookupPageComponent
   */
  assignClickEventOnDropDownMenu() {
    $('.mydropdown').on('click', (event) => {
      event.stopPropagation();
      $(".dropdown-menu").parent().removeClass("open")
      $('#' + event.currentTarget.id).toggleClass('open');
    });
    $('.actionButton').unbind();
    $('.actionButton').on('click', (event) => {
      var index = event.target.id.replace('actionButton', '')
      if ($(event.target).hasClass("restore")) {
        this.actionFromItemMenu('restore', index)
      } else if ($(event.target).hasClass('delete')) {
        this.actionFromItemMenu('delete', index)
      }
    });
  }


  /**
   * Generating the table from data received for current lookup
   * 
   * @memberof ProcessLookupPageComponent
   */
  generateLookupTable() {
    try {
      
      if (this.refreshDataTable) {
        // if(this.pendingapprovalfound)
        // {
        //   this.lookupTable.columns(this.tableColumnDisplay.length-3).visible(true)
        // }
        // else{
        //   this.lookupTable.columns(this.tableColumnDisplay.length-3).visible(false)
          
        // }
        // if(this.deletedFound)
        // {
        //   this.lookupTable.columns(this.tableColumnDisplay.length-2).visible(true)
        // }
        // else{
        //   this.lookupTable.columns(this.tableColumnDisplay.length-2).visible(false)
          
        // }
        
        // this.lookupTable.clear()
        // this.lookupTable.rows.add(this.dataSource);
        // this.lookupTable.columns.adjust().draw();
        // this.assignClickEventOnDropDownMenu()
        // this.refreshDataTable = false
      } else {
        let pageLength=30;
        var _currentClassReference=this;
        this.lookupTable = $('#LookupTable').DataTable({
          serverSide: true,
          "fnServerData": function ( sSource, aoData, fnCallback, oSettings ) {
            let startIndex = 0;
            let pageLength = 0;
            _currentClassReference.searchValue="";
            for (let i = 0; i < aoData.length; i++) {
              if (aoData[i].name == "start") {
                startIndex = aoData[i].value;
              }
              else if (aoData[i].name == "length") {
                pageLength = aoData[i].value;
              }
              else if(aoData[i].name=="search")
              {
                _currentClassReference.searchValue=aoData[i].value.value;
              }

         
  
            }
            if (_currentClassReference.searchValue != "") {
              _currentClassReference.dataIsFiltered = true;
            }
            else {
              _currentClassReference.dataIsFiltered = false;
            }
            let dialogRef: any;
            dialogRef = _currentClassReference.dialog.open(ProgressDialogComponent, {
              data: {
                message: "Loading...",
              }
            });
            _currentClassReference.rapidflowService.retrieveProcessLookupPageDataWCF(_currentClassReference.lookupId, _currentClassReference.processId,startIndex,pageLength,_currentClassReference.searchValue,_currentClassReference.currentSortOrder)
            .subscribe((response2) => {
              _currentClassReference.processLookupData = JSON.parse(response2.json());
              _currentClassReference.setTableDetails()
              let dataTablePaginationObject:any={};
              dataTablePaginationObject.data=_currentClassReference.dataSource;
              allLookupData=_currentClassReference.processLookupData
              if(_currentClassReference.processLookupData[0]!=undefined&&!isNaN(_currentClassReference.processLookupData[0].ItemsCount))
              {
                _currentClassReference.recordsTotal=_currentClassReference.processLookupData[0].ItemsCount;
                dataTablePaginationObject.recordsTotal=_currentClassReference.processLookupData[0].ItemsCount;
                dataTablePaginationObject.recordsFiltered=_currentClassReference.processLookupData[0].ItemsCount;
              }
              else{
                dataTablePaginationObject.recordsTotal=0;
                dataTablePaginationObject.recordsFiltered=0;
              }
  
              fnCallback(dataTablePaginationObject)
              dialogRef.close();
            }, (error) => {
              _currentClassReference.dialog.closeAll()
              // pai error handler
              dialogRef.close();
              _currentClassReference.rapidflowService.ShowErrorMessage("retrieveProcessLookupPageDataWCF Lookup page component", "Platform", error, "N/A", "An error occured while retrieveProcessLookupPageDataWCF", " rapidflowService.retrieveProcessLookupPageDataWCF", this.processId, true);
            });
            
          },
          pagingType: "simple",
          ordering:false,
          columns: this.tableColumnDisplay,
          "columnDefs": [{ "width": "0.5em", "targets": 0 },
          { "orderable": false, "targets": this.tableColumnDisplay.length - 1 }
          ],
          dom: 'frtlip',
          "lengthMenu": [[pageLength], [pageLength]],
          "language": {
            "infoFiltered": " - filtered from _MAX_ items",
            "info": "Displaying results _START_ to _END_ of _TOTAL_ items"
          },

          // assigning row call back event 
          rowCallback: (row, data, index) => {
            this.assignClickEventOnDropDownMenu()
            row.style.cursor = "pointer"
            this.currentItem = this.processLookupData[parseInt(data.ItemID)]
            if (this.currentItem.ApprovalStatus != "Approved") {
              row.style.background = 'lightgrey'
            } else {
            }
          }
        });

         $.fn.dataTable.ext.errMode = 'none';
        
        $('#LookupTable_filter').hide();
        $('#LookupTable_length').hide();
        var lookupReference = this;
        $('.mydropdown').on('click', (event) => {
          event.stopPropagation();
          $(".dropdown-menu").parent().removeClass("open")
          $('#' + event.currentTarget.id).toggleClass('open');
        });
        $('.actionButton').unbind();
        $('.actionButton').on('click', (event) => {
          var index = event.target.id.replace('actionButton', '')
          if ($(event.target).hasClass("restore")) {
            this.actionFromItemMenu('restore', index)
          } else if ($(event.target).hasClass('delete')) {
            this.actionFromItemMenu('delete', index)
          }
        });

        // assigning row click event
        $('#LookupTable tbody').unbind();
        $('#LookupTable tbody').on('click', 'tr', (event) => {
          this.assignClickEventOnDropDownMenu()
          var data = table.row($(event.target)).data();
          let $cell = $(event.target).closest('td');
          if ($cell.index() < (this.tableColumnDisplay.length - 3)) {
            var text = $(event.currentTarget).html()
            var abc = new DOMParser()
            text = abc.parseFromString(text, "text/xml");
            this.currentItem = allLookupData[parseInt(data.ItemID)]
            if (this.currentItem.NotificationDetails.NotificationID != null && this.currentItem.NotificationDetails.NotificationID != undefined && this.currentItem.NotificationDetails.NotificationID != "") {
              if (this.currentItem.ApprovalStatus == "Pending Approval" || this.currentItem.ApprovalStatus == "Delete Pending Approval" || this.currentItem.ApprovalStatus == "Restore Pending Approval") {
                // opening the process lookup approval task if item is in pending state
                this.rapidflowService.retrieveLookupApprovalTask(this.currentItem.NotificationDetails.NotificationID)
                  .subscribe((response) => {
                    var currentTask = JSON.parse(response.json().replace(/":,/g, '":"",').replace(/\\/g, "\\\\"));
                    this.currentItem.taskDetails = currentTask
                    if (currentTask.ToUserEmail == this.rapidflowService.CurrentLoggedInUser.Email) {
                      currentTask.ItemHeader1 = this.rapidflowService.CurrentLoggedInUser.DisplayName
                      currentTask.ItemHeader2 = this.lookup.LookupTitle
                      this.openLookupApprovalDialog(currentTask)
                    } else {
                      this.openLookupItem(this.currentItem, this.lookup, true)
                    }
                  }, (error) => {
                    this.dialog.closeAll()
                    // api call back error handler
                    this.rapidflowService.ShowErrorMessage("retrieveLookupApprovalTask Lookup page component", "Platform", error, "N/A", "An error occured while retrieveLookupApprovalTask", " rapidflowService.retrieveLookupApprovalTask", this.processId, true);
                  });
              } else {
                // opening lookup item for pending approval view
                this.openLookupItem(this.currentItem, this.lookup, true)
              }
            } else {

              if (this.currentItem.DateDeleted != undefined && this.currentItem.DateDeleted != null && this.currentItem.DateDeleted != "") {

              } else
                this.openLookupItem(this.currentItem, this.lookup, true)
            }
          } else {
            var data = table.row($(event.target)).data();
            if (data != undefined) {
              event.stopPropagation();
              $(".dropdown-menu").parent().removeClass("open")
              $('#' + data.ItemID + 'dropdown').toggleClass('open');
            }
          }
        });
        var table = $('#LookupTable').DataTable();
        $.fn.dataTable.ext.errMode = 'none';
        // $('#filterSearch').on('input', function () {
        //   table.search(this.value).draw();
        // });

        $('#filterSearch').on('input', function () {
          clearTimeout(_currentClassReference.debounceTimeout);
          _currentClassReference.debounceTimeout=setTimeout(()=>{
            _currentClassReference.lookupTable.search(this.value).draw();
          },1000);
          
        });
       

        $('tr').css('cursor', 'pointer')
      }
    }
    catch (ex) {
      this.errorfound = true
      // method error handler
      this.rapidflowService.ShowErrorMessage("generateLookupTable-Lookup page component", "Platform", ex.message, ex.stack, "An error occured while generating lookup datatble", "N/A", this.processId, true);
    }
  }
  /**
   * Methoid to opend the process lookup item approval 
   * 
   * @param {any} Item 
   * @memberof ProcessLookupPageComponent
   */
  openLookupApprovalDialog(Item): void {
    try {
      let dialogRef = this.lookupApprovalDialog.open(LookupApprovalDialogComponent, {
        data: { lookupTask: Item }
      });
      dialogRef.afterClosed().subscribe(result => {
      });
    } catch (ex) {
      // method error handler  
    }
  }

  /**
   * function to open the item view for new item creation
   * 
   * @memberof ProcessLookupPageComponent
   */
  addNewItem() {

    try {
      this.itemName = "New item"
      this.openLookupItem([], this.lookup, false)
      this.exists = false
    } catch (ex) {
      // method error handler  
    }
  }


  setExportData(DataForExport){
    var itemvalue=[]
    this.exportItems=[]
    for (var i = 0; i < DataForExport.length; i++) {
      itemvalue = []
  
      // formating data to be displayed in excel

      for (var k = 0; k < this.currentlookupDefinitions.length; k++) {
        if (DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName] == null || DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName] == undefined) {
          itemvalue[this.currentlookupDefinitions[k].ShortName] = ""
        } else {
          if (typeof DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName] === "object" && this.currentlookupDefinitions[k].Type.toLowerCase() == "peoplepicker") {
            itemvalue[this.currentlookupDefinitions[k].ShortName] = ""
            for (var m = 0; m < DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName].length; m++) {
              itemvalue[this.currentlookupDefinitions[k].ShortName] += DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName][m].DisplayName
              if (m != (DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName].length - 1)) {
                itemvalue[this.currentlookupDefinitions[k].ShortName] += "; ";
              }
            }
          } else if (this.currentlookupDefinitions[k].Type.toLowerCase() == "url") {
            itemvalue[this.currentlookupDefinitions[k].ShortName] = ""
            for (var m = 0; m < DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName].length; m++) {
              itemvalue[this.currentlookupDefinitions[k].ShortName] += '<a target="_blank" href="' + DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName][m].url + '" >' + DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName][m].title + '</a>'
              if (m != (DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName].length - 1)) {
                itemvalue[this.currentlookupDefinitions[k].ShortName] += "; ";
              }
            }
          } else {
            if (this.currentlookupDefinitions[k].Type.toLowerCase() == "date") {
              var dateB = moment(DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName]);
              itemvalue[this.currentlookupDefinitions[k].ShortName] = dateB.format('DD-MMM-YYYY');
            } else if (this.currentlookupDefinitions[k].Type.toLowerCase() == "datetime") {
              var dateB = moment(DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName]);
              itemvalue[this.currentlookupDefinitions[k].ShortName] = dateB.format('DD-MMM-YYYY hh:mm A');
            } else if (this.currentlookupDefinitions[k].Type.toLowerCase() == "time") {
              var dateB = moment(DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName]);
              itemvalue[this.currentlookupDefinitions[k].ShortName] = dateB.format('hh:mm A');
            } else
              itemvalue[this.currentlookupDefinitions[k].ShortName] = DataForExport[i].Value[this.currentlookupDefinitions[k].ShortName]
          }
        }
      }

      // populating variable to export and display the lookup items
      this.exportItems.push(itemvalue)
     
    }
    try {
      var abc
      var reportObjectJSON = $.extend(true, [], this.exportItems);
      
      this.excelExportService.exportAsExcelFile(reportObjectJSON, this.lookup.LookupTitle)
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("exportToExcel-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while exporting data in csv format", "N/A", this.processId, true);
    }
  }

  /**
   * Method to export the lookup view data into excel
   * 
   * @memberof ProcessLookupPageComponent
   */
  exportToExcel() {

    this.rapidflowService.retrieveProcessLookupPageDataWCF(this.lookupId, this.processId,0,this.recordsTotal,this.searchValue,this.currentSortOrder)
    .subscribe((response2) => {
      var DataForExport = JSON.parse(response2.json());
      this.setExportData(DataForExport) 
    }, (error) => {
      this.dialog.closeAll()
      // pai error handler
      this.rapidflowService.ShowErrorMessage("retrieveProcessLookupPageDataWCF Lookup page component", "Platform", error, "N/A", "An error occured while retrieveProcessLookupPageDataWCF", " rapidflowService.retrieveProcessLookupPageDataWCF", this.processId, true);
    });
   
  }
  /**
   * Open the selected item into lookup item view 
   * 
   * @param {any} lookupitem 
   * @param {any} lookupdefinitions 
   * @param {any} existingItem 
   * @memberof ProcessLookupPageComponent
   */
  openLookupItem(lookupitem, lookupdefinitions, existingItem): void {
    try {
      this.activatedItem = true
      if (lookupitem.Value != undefined && lookupitem.Value != null && lookupitem.Value != "") {
        if (typeof lookupitem.Value[this.lookup.ListColumn] === "object") {
          this.itemName = ""
          for (var m = 0; m < lookupitem.Value[this.lookup.ListColumn].length; m++) {
            this.itemName += lookupitem.Value[this.lookup.ListColumn][m].DisplayName
            if (m != (lookupitem.Value[this.lookup.ListColumn].length - 1)) {
              this.itemName += "; ";
            }
          }
        } else {
          this.itemName = lookupitem.Value[this.lookup.ListColumn]
        }

      } else {
        this.itemName = "New Item"
      }
      this.exists = existingItem
      $('#headerfilters').hide()
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("openLookupItem-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while opening lookup item", "N/A", this.processId, false);
    }
  }
  /**
   * to close the lookup item view and opening the lookup table
   * 
   * @param {any} to 
   * @memberof ProcessLookupPageComponent
   */
  hideItem() {
    this.activatedItem = false;
    this.currentItem = []
    this.exists = false
    $('#headerfilters').show()
  }


  /**
   * function to read the user permissions and render the action buttons 
   * 
   * @param {any} currentLookup 
   * @memberof ProcessLookupPageComponent
   */
  getandSetPermissions(currentLookup) {
    try {
      var timeinterval = setInterval(() => {
        if (this.processDataService.userProcessSettings != undefined && this.processDataService.userProcessSettings != null) {
          if (this.processDataService.userProcessSettings == undefined) {
          }
          this.userProcessSettings = this.processDataService.userProcessSettings[0].Process_User_Permissions
          if (this.userProcessSettings != undefined) {
            this.processPermission = this.userProcessSettings
            for (var i = 0; i < this.processPermission.length; i++) {
              if (this.processPermission[i].ItemType == "ProcessLookupObject" && this.processPermission[i].Name == currentLookup.LookupTitle) {
                if (this.processPermission[i].PermissionName == "Add") {
                  this.permissionArray.Add = true
                }
                if (this.processPermission[i].PermissionName == "Edit") {
                  this.permissionArray.Edit = true
                }
                if (this.processPermission[i].PermissionName == "View") {
                  this.permissionArray.View = true
                }
                if (this.processPermission[i].PermissionName == "Approve") {
                  this.permissionArray.Approve = true
                }
                if (this.processPermission[i].PermissionName == "Delete") {
                  this.permissionArray.Delete = true
                } if (this.processPermission[i].PermissionName == "Reject") {
                  this.permissionArray.Reject = true
                }
              }

            }
          } else {
            this.permissionArray = { Add: false, Edit: false, View: false, Delete: false, Approve: false, Reject: false }
          }
          this.permissionSetted = true
          clearInterval(timeinterval);
          return;
        }
      }, 1000)
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("getandSetPermissions-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while setting the permission on table", "N/A", this.processId, true);
    }
  }
  /**
   * Method to opend the import dialog
   * 
   * @memberof ProcessLookupPageComponent
   */
  OpenImportDialog(): void {
    try {
      let dialogRef = this.lookupImportDialog.open(ProcessLookupImportComponent, {
        width: '600px',
        data: { lookupData: this.processLookupData, Lookup: this.lookup }
      });
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("getandSetPermissions-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while setting the permission on table", "N/A", this.processId, true);
    }
  }

  /**
   * set default value in lookup item if one of the coulmn is missing
   * 
   * @param {any} item 
   * @param {any} lookupdefinition 
   * @returns 
   * @memberof ProcessLookupPageComponent
   */
  setDefaultValues(item, lookupdefinition) {
    try {
      this.lookupDispalyAndTitleArray = {}
      for (var i = 0; i < lookupdefinition.ColumnDefinitions.length; i++) {
        if (item[lookupdefinition.ColumnDefinitions[i].ShortName] == undefined || item[lookupdefinition.ColumnDefinitions[i].ShortName] == undefined) {
          item[lookupdefinition.ColumnDefinitions[i].ShortName] = ""
        }
        this.lookupDispalyAndTitleArray[lookupdefinition.ColumnDefinitions[i].ShortName] = lookupdefinition.ColumnDefinitions[i].DisplayName
      }
      return item
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("setDefaultValues-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while setting default values", "N/A", this.processId, true);
    }
  }

  /**
   * Action of restore or delete from item menu
   * 
   * @param {any} action 
   * @param {any} index 
   * @memberof ProcessLookupPageComponent
   */
  actionFromItemMenu(action, index) {
    try {
      this.dataPayLoad = {}
      var item = this.processLookupData[index]
      item = this.setDefaultValues(item, this.lookup)


      if (action == "restore") {
        if (this.checkDuplicates(item)) {
          this.alertDialogRef = this.dialog.open(AlertDialogComponent, {
            width: '25%',
            data: {
              title: "Unable to restore",
              message: "Duplicate values are found in existing items.",
            }
          });
          this.alertDialogRef.afterClosed().subscribe(result => {
          });
          return false
        } else {

        }

      }
      this.dataPayLoad['ProcessName'] = $('#heading').html().toString().trim()
      this.dataPayLoad['ProcessOrganization'] = $('#subHeading').html().toString().trim()
      this.dataPayLoad['LookupItem'] = item.Value;
      this.dataPayLoad['lookupDispalyAndTitleArray'] = JSON.stringify(this.lookupDispalyAndTitleArray);
      delete this.dataPayLoad['LookupItem']["ItemID"];
      this.dataPayLoad['LookupDataID'] = item.LookupDataID;
      this.dataPayLoad['PreviousItem'] = JSON.parse(JSON.stringify(item.Value))
      this.dataPayLoad['LookupName'] = this.lookup.LookupTitle
      this.dataPayLoad['ApprovalRequired'] = this.lookup.ApprovalRequired.toLowerCase();
      if (action == "delete") {
        this.dataPayLoad['ItemStatus'] = "delete";
      } else if (action == "restore") {
        this.dataPayLoad['ItemStatus'] = "restore";
      }
      var paramsAssesment = {}
      paramsAssesment['fromUserEmail'] = this.rapidflowService.CurrentLoggedInUser['Email']
      paramsAssesment['fromUserName'] = this.rapidflowService.CurrentLoggedInUser['DisplayName']
      paramsAssesment['processId'] = this.processId.toString()
      paramsAssesment['lookupName'] = this.lookup.LookupID;
      paramsAssesment['operationType'] = 'WORKFLOW';
      paramsAssesment['dataPayload'] = JSON.stringify(this.dataPayLoad);
      paramsAssesment['diagnosticLogging'] = this.rapidflowService.diagnosticLoggingProcessFlag.toString();

      // showing progress dialog
      this.dialogRef = this.dialog.open(ProgressDialogComponent, {
        width: '25%',
        data: {
          message: "Updating …"
        }
      });
      this.dialogRef.afterClosed().subscribe(result => {
      });

      // calling socket call to update the item based on action
      var taskResult = this.socket.callWebSocketService('createProcessLookupApprovalTask', paramsAssesment);
      taskResult.then((result) => {

        if(result['message']!=undefined){
          if(typeof result['message'] =='string'){
            this.dialog.closeAll();
            this.RefereshLookupsAndProcess()
          }else{
           var duplicateobject = {}
           for(var key in result['message']){

            this.alertDialogRef = this.dialog.open(AlertDialogComponent, {
              width: '25%',
              data: {
                title: "Unable to restore",
                message: "Duplicate values are found in existing items.",
              }
            });
            this.alertDialogRef.afterClosed().subscribe(result => {
            });            this.dialog.closeAll();
           }
          }
        }
      }, (error) => {
        this.dialog.closeAll()

        // socket call error handler
        this.rapidflowService.ShowErrorMessage("createProcessLookupApprovalTask Lookup page component", "Process", "Error occured while executing socket call " + error.message, error.stack, "An error occured while " + action + ' action on item', " socket.createProcessLookupApprovalTask", this.processId, true);
      });
    } catch (ex) {
      // method error handler
      this.rapidflowService.ShowErrorMessage("actionFromItemMenu-Process Lookup Page", "Platform", ex.message, ex.stack, "An error occured while taking action on item", "N/A", this.processId, true);
    }
  }
  /**
   * Method to refresh the tasks and lookup data using ecent emitter service observer
   * 
   * @memberof ProcessLookupPageComponent
   */
  RefereshLookupsAndProcess() {
    // var CountObject = { "Type": "Referesh", Value: { "Lookup": this.lookup.LookupID, } }
    // this.eventEmiterService.changeMessage(CountObject)
    // let countRefreshObject = { "Type": "AllCounts", Value: { "Count": "true" } }
    // this.eventEmiterService.changeMessage(countRefreshObject);
    this.lookupTable.draw();
    
  }


  /**
   * Method to check if item values if duplicated with other lookup items already present
   * 
   * @returns 
   * @memberof TemplateComponent
   */
  checkDuplicates(item) {
    try {
      this.duplicateValuesArray = []
      var duplicatefound = false
      for (var j = 0; j < this.lookup.ColumnDefinitions.length; j++) {
        var duplicateobject = {}
        if (this.lookup.ColumnDefinitions[j].Options.isUnique == true) {
          for (var i = 0; i < this.processLookupData.length; i++) {
            if (this.processLookupData[i].DateDeleted == "") {
              if (this.lookup.ColumnDefinitions[j].Type.toLowerCase() == "url") {
                if (this.lookup.LookupDataID == this.processLookupData[i].LookupDataID) {

                } else {

                  var urlfound = false
                  var previousData = this.processLookupData[i].Value[this.lookup.ColumnDefinitions[j].ShortName]
                  if (previousData != undefined) {
                    for (var k = 0; k < item.Value[this.lookup.ColumnDefinitions[j].ShortName].length; k++) {
                      for (var l = 0; l < previousData.length; l++) {
                        if (previousData[k].url == item.Value[this.lookup.ColumnDefinitions[j].ShortName][k].url) {
                          duplicateobject = {}
                          duplicatefound = true
                          duplicateobject['Column'] = this.lookup.ColumnDefinitions[j].DisplayName
                          duplicateobject['Value'] = item.Value[this.lookup.ColumnDefinitions[j].ShortName][k].url
                          this.duplicateValuesArray.push(duplicateobject)
                          break;
                        }

                      }
                    }
                  }

                }

              } else if (this.lookup.ColumnDefinitions[j].Type.toLowerCase() == "peoplepicker") {
                if (item.LookupDataID == this.processLookupData[i].LookupDataID) {

                } else {

                  var urlfound = false
                  var previousData = this.processLookupData[i].Value[this.lookup.ColumnDefinitions[j].ShortName]
                  if (previousData != undefined) {
                    for (var k = 0; k < item.Value[this.lookup.ColumnDefinitions[j].ShortName].length; k++) {
                      for (var l = 0; l < previousData.length; l++) {
                        if (previousData[k].DisplayName == item.Value[this.lookup.ColumnDefinitions[j].ShortName][k].DisplayName) {
                          duplicateobject = {}
                          duplicatefound = true
                          duplicateobject['Column'] = this.lookup.ColumnDefinitions[j].DisplayName
                          duplicateobject['Value'] = item.Value[this.lookup.ColumnDefinitions[j].ShortName][k].DisplayName
                          this.duplicateValuesArray.push(duplicateobject)
                          break;
                        }

                      }
                    }
                  }
                }
              } else
                if (item.Value[this.lookup.ColumnDefinitions[j].ShortName] == this.processLookupData[i].Value[this.lookup.ColumnDefinitions[j].ShortName]) {
                  if (item.LookupDataID == this.processLookupData[i].LookupDataID) {
                  } else {
                    duplicateobject = {}
                    duplicatefound = true
                    duplicateobject['Column'] = this.lookup.ColumnDefinitions[j].DisplayName
                    duplicateobject['Value'] = item.Value[this.lookup.ColumnDefinitions[j].ShortName]
                    this.duplicateValuesArray.push(duplicateobject)
                    break;
                  }
                }
            }
          }
        }
      }
      return duplicatefound
    } catch (ex) {
      // Method erro handler
      duplicatefound = true
      duplicateobject['Column'] = 'error'
      duplicateobject['Value'] = ex.message
      this.duplicateValuesArray.push(duplicateobject)
      this.rapidflowService.ShowErrorMessage("checkDuplicates-Lookup page restore function", "Platform", ex.message, ex.stack, "An error occured while checking duplicate constraint", "N/A", this.lookup.ProcessID, true);
      return false
    }
  }

  setSearchAndSortEvents(){
    $("#searchOff").click(() => {
      if(this.dataIsFiltered)
      {
        this.lookupTable.search("").draw();
      }
      
    });
    $("#sortOn").click(() => {
      this.currentSortOrder="ASC";
     this.lookupTable.order( [ 0, 'asc' ] ).draw();;
    });
    $("#sortOff").click(() => {
      this.currentSortOrder="DESC";
      this.lookupTable.order( [ 0, 'desc' ] ).draw();;
     });
  }
  ngOnDestroy(){
   try{
    $('#filterSearch').unbind();
    $("#searchOn").unbind();
    $("#searchOff").unbind();
    $("#sortOn").unbind();
    $("#sortOff").unbind();
    this.paramPIDSubscription.unsubscribe();
    this.paramLIDSubscription.unsubscribe();
    this.paramQuerySubscription.unsubscribe();
   }
   catch(ex)
   {
     
   }
    
  }

  
}


