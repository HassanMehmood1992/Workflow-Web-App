import { Router } from '@angular/router';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/
/*
ModuleID: ProcessLookupImportComponent
Description: Dialog to allow user to select and import excel file for adding the rows in excel file to the lookup
Location: ./components/process-lookup-import.component.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { EventEmiterService } from './../../../services/event-emiters.service';
import { ProgressDialogComponent } from './../../progress-dialog/progress-dialog.component';
import { SocketProvider } from './../../../services/socket.service';
import { RapidflowService } from './../../../services/rapidflow.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
declare var jQuery: any;
declare var $: any;
/**
 * Component decorator
 * 
 * @export
 * @class ProcessLookupImportComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-process-lookup-import',
  templateUrl: './process-lookup-import.component.html',
  styleUrls: ['./process-lookup-import.component.css']
})
export class ProcessLookupImportComponent implements OnInit {
  itemUpdated: boolean; // status of import action 
  currentItemWithValues: {};//used to update the values imported one by one based on lookup definition 
  errorObject: {};// contain the details of error found in individual entry
  newData: any[];//  contain the initial list of items that are imported
  errroMessageArray: any[]; // contain the error detail of error found in all new entries
  peoplePickerValidated: boolean;// validation flag of people picker field value if the lookup definition contain people picker field
  peoplePickerFound: any; // flag if the lookup definition contain the people picker field
  duplicateError: boolean; // overall flag to check if the entries contain duplicate values 
  uniqueError: boolean;// item vise flag to check if the entries contain duplicate values 
  requiredError: boolean; // item vise flag if the field is required
  lookup: any; // contain the current lookup definition
  previousData: any; //  contain the previous lookup data list
  newEntries: any[]; // contain the refined new entries with validated values
  hideImportButton: boolean; // flag to hide the import button
  noValuesFound: boolean // flag to show if no values found in import file
  errorFound: boolean // over all error flag to discard the changes
  loadingFile: boolean // flag to show file uploading progress
  public selectedFile = "Choose File ...." // inner text of file upload control
  /**
   * Creates an instance of ProcessLookupImportComponent.
   * @param {MatDialog} dialog 
   * @param {MatDialogRef<ProgressDialogComponent>} dialogRef 
   * @param {RapidflowService} rapidflowService 
   * @param {*} data 
   * @param {SocketProvider} socket 
   * @param {EventEmiterService} eventEmiterService 
   * @memberof ProcessLookupImportComponent
   */
  constructor(private dialog: MatDialog, public dialogRef: MatDialogRef<ProgressDialogComponent>, public rapidflowService: RapidflowService,
    @Inject(MAT_DIALOG_DATA) public data: any, private socket: SocketProvider, private eventEmiterService: EventEmiterService, private router: Router) {
    this.lookup = data.Lookup;
    this.hideImportButton = true
    this.noValuesFound = true;
    this.errorFound = true;
    this.loadingFile = false
    this.previousData = this.data.lookupData
    this.itemUpdated = false
  }
  /**
   * component initialization lifecycle hook
   * 
   * @memberof ProcessLookupImportComponent
   */
  ngOnInit() {
    $("#file-3").click();
    if (this.isAPIAvailable()) {
      // file control chnage event to retreive the data
      $("#file-3").change((event) => {
        this.loadingFile = true
        // checking valid file selection
        try {
          var fileName = '';
          var element = $(event.currentTarget)
          if (element.files && element.files.length > 1)
            fileName = (element.getAttribute('this.newData-multiple-caption') || '').replace('{count}', element.files.length);
          else if (event.target.value)
            fileName = event.target.value.split('\\').pop();
          if (fileName)
            $('#selectedFile').html(fileName);
          else
            $('#selectedFile').html('Choose a file ....');
          this.handleFileSelect(event)
          // alert('ok')
        } catch (err) {
          this.loadingFile = false
        }
      });
    }
  }
  /**
   * Checks the file control validity on browser
   * 
   * @returns 
   * @memberof ProcessLookupImportComponent
   */
  isAPIAvailable() {
    // Check for the various File API support.
    if (window['File'] && window['FileReader'] && window['FileList'] && window['Blob']) {
      // Great success! All the File APIs are supported.
      return true;
    } else {
      // source: File API availability - http://caniuse.com/#feat=fileapi
      // source: <output> availability - http://html5doctor.com/the-output-element/
      document.writeln('The HTML5 APIs used in this form are only available in the following browsers:<br />');
      // 6.0 File API & 13.0 <output>
      document.writeln(' - Google Chrome: 13.0 or later<br />');
      // 3.6 File API & 6.0 <output>
      document.writeln(' - Mozilla Firefox: 6.0 or later<br />');
      // 10.0 File API & 10.0 <output>
      document.writeln(' - Internet Explorer: Not supported (partial support expected in 10.0)<br />');
      // ? File API & 5.1 <output>
      document.writeln(' - Safari: Not supported<br />');
      // ? File API & 9.2 <output>
      document.writeln(' - Opera: Not supported');
      return false;
    }
  }
  /**
   * Reads imported files attributes check that valid file is selected or not
   * 
   * @param {any} evt 
   * @memberof ProcessLookupImportComponent
   */
  handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var file = files[0];
    this.loadingFile = true
    // read the file metathis.newData
    var output = ''
    this.newEntries = []
    this.peoplePickerValidated = false
    // if excel file is selected
    if (file.type == "application/vnd.ms-excel") {
      $('#list').html('')
      $('#message').html('');
      $('#message').attr('style', 'color:red');
      output += '<span style="font-weight:bold;">' + decodeURI(file.name) + '</span><br />\n';
      output += ' - FileType: ' + (file.type || 'n/a') + '<br />\n';
      output += ' - FileSize: ' + file.size + ' bytes<br />\n';
      output += ' - LastModified: ' + (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a') + '<br />\n';
      // read the file contents
      this.printTable(file);
      // post the results
      $('#list').append(output);
    } else {
      $('#errorBody').html('Please Select CSV file')
      file = ''
      $('#selectedFile').html('Choose a file ....');
      this.newEntries = []
      this.peoplePickerValidated = false
      this.loadingFile = false
    }
  }
  /**
   * Reads the file and convert into array of objects
   * 
   * @memberof ProcessLookupImportComponent
   */
  // This will parse a delimited string into an array of
  // arrays. The default delimiter is the comma, but this
  // can be overriden in the second argument.
  CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
      (
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

      // Get the delimiter that was found.
      var strMatchedDelimiter = arrMatches[1];

      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (
        strMatchedDelimiter.length &&
        strMatchedDelimiter !== strDelimiter
      ) {

        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push([]);

      }

      var strMatchedValue;

      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[2]) {

        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        strMatchedValue = arrMatches[2].replace(
          new RegExp("\"\"", "g"),
          "\""
        );

      } else {

        // We found a non-quoted value.
        strMatchedValue = arrMatches[3];

      }


      // Now that we have our value string, let's add
      // it to the data array.

      arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
  }

  printTable = (file) => {
    try {
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = ((event) => {
        let csv = event.target['result'];
        this.newData = []
        var csvData = this.CSVToArray(csv, ",")
        var headerRemoved = false
        for (var i = 0; i < csvData.length; i++) {
          var emptyFound = true
          var tempData = csvData[i]
          for (var k = 0; k < tempData.length; k++) {
            if (tempData[k] != "") {
              emptyFound = false
            }
          }
          if (!emptyFound && headerRemoved) {
            this.newData.push(csvData[i]);
          }

          if (headerRemoved == false && !emptyFound) {
            headerRemoved = true
          }

        }


        // let allTextLines = csv.split(/\r\n|\n/);
        // let headers = allTextLines[0].split(',');
        // let lines = [];
        // this.newData = [];
        // for (let i = 1; i < allTextLines.length; i++) {
        //   // split content based on comma
        //   var emptyFound=true

        //    var tempData=allTextLines[i].split(',')
        //    for(var k=0;k<tempData.length;k++){
        //      if(tempData[k]!="")
        //      {
        //        emptyFound=false
        //      }
        //    }
        //   if (allTextLines[i] != ""&&!emptyFound)
        //      this.newData.push(allTextLines[i].split(','));
        // }
        var html = '';
        var uniquearray = {};
        this.errroMessageArray = []
        this.errorObject = {}
        this.requiredError = false
        this.uniqueError = false
        this.duplicateError = false
        this.peoplePickerFound = false
        this.peoplePickerValidated = false
        /// validate this.newData 
        var mainquery = []
        var query = []
        if (this.newData.length > 500) {
          this.errorObject = {}
          this.peoplePickerValidated = false
          this.errorObject = { RowID: 'undefined', ErrorType: 'Item limit exceeded', Column: ' undefined ', value: 'Error while reading file' }
          this.errroMessageArray.push(this.errorObject)
          this.showImportOrErrorTable()
          return
        }
        // checking people picker field values and genrating query string
        for (var j = 0; j < this.lookup.ColumnDefinitions.length; j++) {
          if (this.lookup.ColumnDefinitions[j].Type == 'PeoplePicker') {
            this.peoplePickerFound = true
            for (var i = 0; i < this.newData.length; i++) {
              var tempObject = {}
              if (this.newData[i][j] != null && this.newData[i][j] != undefined && this.newData[i][j] != "") {
                tempObject["query"] = this.newData[i][j].replace('|', ',')
              } else {
              }
              query.push(tempObject)
            }
          }
          if (this.lookup.ColumnDefinitions[j].Type.toLowerCase() == 'url') {
            for (var i = 0; i < this.newData.length; i++) {
              try {
                if (this.newData[i][j]!=undefined&&this.newData[i][j] != "") {
                  var urlArrayString = this.newData[i][j].replace(/""/g, '"')
                  if(urlArrayString[0]=='"')
                  {
                    urlArrayString=urlArrayString.slice(1, -1)
                  }
                  var urlArray = urlArrayString.split(';')
                  if (urlArray.length > 0) {
                    this.newData[i][j] = []
                    for (var k = 0; k < urlArray.length; k++) {
                      var tempUrlObject = {}
                      var xmlString = urlArray[k]
                        , parser = new DOMParser()
                        , doc = parser.parseFromString(xmlString, "text/xml");
                      tempUrlObject["title"] = doc.firstChild["innerHTML"]
                      tempUrlObject["url"] = doc.firstChild.attributes["href"].value
                      this.newData[i][j].push(tempUrlObject)
                    }
                  }



                }
              } catch (ex) {
                this.rapidflowService.ShowErrorMessage("printTable-Lookup import component", "Platform", ex.message, ex.stack, "An error occured while reading url field value", "N/A", this.lookup.ProcessID, true);

              }

            }
          }
        }
        // if people picker field found then reselving then validating the data
        if (this.peoplePickerFound) {
          query = this.removeDuplicates(query, 'query')
          this.rapidflowService.resolveBulkLookupUsers(JSON.stringify(query))
            .toPromise()
            .then(
            res => {
              try {
                this.newData = this.MapValidatedInfoWithNewData(JSON.parse(res.json()))
                // checking unique and required fields and values
                this.checkUniqueAndRequired()
                this.showImportOrErrorTable()
              } catch (error) {
                this.errorObject = {}
                this.peoplePickerValidated = false
                this.errorObject = { RowID: 'unknown', ErrorType: 'Invalid Person in query', Column: 'People Picker', value: 'Error while validating the person' }
                this.errroMessageArray.push(this.errorObject)
                this.showImportOrErrorTable()
              }
            },
            msg => {
              // incase of other message returned from server
              this.errorObject = {}
              this.peoplePickerValidated = false
              this.errorObject = { RowID: 'undefined', ErrorType: 'Invalid Person in query', Column: ' undefined ', value: 'Error while validating the person' }
              this.errroMessageArray.push(this.errorObject)
              this.showImportOrErrorTable()
            }
            )
        } else {
          // in case if no people picker value found
          this.peoplePickerValidated = true
          this.checkUniqueAndRequired()
          this.showImportOrErrorTable()
        }
        reader.onerror = () => {
          this.peoplePickerValidated = false
          this.errorObject = { RowID: 'undefined', ErrorType: 'FileError', Column: ' undefined ', value: file.fileName }
          this.errroMessageArray.push(this.errorObject)
          this.showImportOrErrorTable()
        };
      });
    } catch (ex) {
      // Print table method error handler
      this.rapidflowService.ShowErrorMessage("printTable-Lookup import component", "Platform", ex.message, ex.stack, "An error occured while reading file and validating fields", "N/A", this.lookup.ProcessID, true);
    }
  }

  /**
   * Remove duplicate query string for validating the peoplepicker values from server
   * 
   * @param {any} originalArray 
   * @param {any} prop 
   * @returns 
   * @memberof ProcessLookupImportComponent
   */
  removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }
  /**
   * Read the response from bulk user validating api against the people picker field value and check if error exists.
   * 
   * @param {any} ValidatedInfo 
   * @returns 
   * @memberof ProcessLookupImportComponent
   */
  MapValidatedInfoWithNewData(ValidatedInfo) {
    try {
      this.peoplePickerValidated = true
      var peoplepickerArray = ValidatedInfo
      var matched = false
      for (var j = 0; j < this.lookup.ColumnDefinitions.length; j++) {
        if (this.lookup.ColumnDefinitions[j].Type == 'PeoplePicker') {
          for (var i = 0; i < this.newData.length; i++) {
            matched = false
            for (var k = 0; k < peoplepickerArray.length; k++) {
              if (matched == false && this.newData[i][j].replace('|', ',') == peoplepickerArray[k].Query) {
                if (peoplepickerArray[k].Response.indexOf('Response Empty') != -1) {
                  this.errorObject = { RowID: i, ErrorType: 'Invalid Person', Column: this.lookup.ColumnDefinitions[j]['ShortName'], value: peoplepickerArray[k].Query }
                  this.errroMessageArray.push(this.errorObject)
                  this.requiredError = true
                  this.peoplePickerValidated = false
                } else {
                  this.newData[i][j] = peoplepickerArray[k].Response
                }
                matched = true
              }
            }
          }
        }
      }
      return this.newData
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("MapValidatedInfoWithNewData-Lookup import component", "Platform", ex.message, ex.stack, "An error occured while mapping existing and new values", "N/A", this.lookup.ProcessID, true);
    }
  }
  /**
   * Method to draw results of input file in dialog
   * 
   * @param {any} array 
   * @memberof ProcessLookupImportComponent
   */
  setErrorBody(array) {
    try {
      var html = '<table class="table">';
      for (var i = 0; i < array.length; i++) {
        html += '<tr><td>'
        if (array[i].ErrorType == 'Invalid Person in query') {
          html += 'Invalid Person found in import item. Please fix them and try again. Note: replace , with |'
        } else if (array[i].ErrorType == "FileError") {
          html += 'Unable to read file : ' + array[i].value
        } else if (array[i].ErrorType == "Item limit exceeded") {
          html += 'Unable to proceed the import: File containing more then 500 items.'
        } else if (array[i].ErrorType != 'required') {
          html += 'At row id ' + array[i].RowID + ' vaule ' + array[i].value + ' of  column ' + array[i].Column + ' is found as ' + array[i].ErrorType
        } else {
          html += 'At row id ' + array[i].RowID + ' vaule of column ' + array[i].Column + ' is required'
        }
        html += '</td></tr>'
      }
      html += '</table>'
      $('#errorBody').html(html)
    } catch (ex) {
    }
  }
  /**
   * Checking Duplicate and Required fields from lookup definitions and validating
   * 
   * @memberof ProcessLookupImportComponent
   */
  checkUniqueAndRequired() {
    try {
      for (var i = 0; i < this.newData.length; i++) {
        this.errorObject = {}
        this.currentItemWithValues = {};
        this.duplicateError = false
        for (var j = 0; j < this.lookup.ColumnDefinitions.length; j++) {
          if (this.newData[i][j] != null && this.newData[i][j] != undefined && this.newData[i][j] != "") {
            // case of unique column found
            if (this.lookup.ColumnDefinitions[j].Options.isUnique == true) {
              this.duplicateError = this.DuplicateFound(this.lookup.ColumnDefinitions[j]['ShortName'], this.newData[i][j], this.newData, i, j, this.lookup.ColumnDefinitions[j]["Type"])
              if (this.duplicateError) {
                this.uniqueError = true
                var displayValue = ""
                if (this.lookup.ColumnDefinitions[j]['Type'].toLowerCase() == "peoplepicker") {
                  for (var o = 0; o < this.newData[i][j].length; o++) {
                    displayValue += this.newData[i][j][o].DisplayName + '; '
                  }
                } else if (this.lookup.ColumnDefinitions[j]['Type'].toLowerCase() == "url") {
                  for (var o = 0; o < this.newData[i][j].length; o++) {
                    displayValue += this.newData[i][j][o].url + '; '
                  }
                } else {
                  displayValue += this.newData[i][j]
                }
                this.errorObject = { RowID: i, ErrorType: 'duplicate', Column: this.lookup.ColumnDefinitions[j]['ShortName'], value: displayValue }
                this.errroMessageArray.push(this.errorObject)
              }
            }
            this.currentItemWithValues[this.lookup.ColumnDefinitions[j]['ShortName']] = this.newData[i][j]
          } else {
            // case if required column found
            if (this.lookup.ColumnDefinitions[j].Options.required == true) {
              this.errorObject = { RowID: i, ErrorType: 'required', Column: this.lookup.ColumnDefinitions[j]['ShortName'], value: "" }
              this.errroMessageArray.push(this.errorObject)
              this.requiredError = true
            } else {
              this.currentItemWithValues[this.lookup.ColumnDefinitions[j]['ShortName']] = ""
            }
          }
        }
        this.newEntries.push(this.currentItemWithValues)
      }
    } catch (ex) {
      //check unique and required columns validation method error handler
      this.rapidflowService.ShowErrorMessage("checkUniqueAndRequired-Lookup import component", "Platform", ex.message, ex.stack, "An error occured while checking unique and required constraints", "N/A", this.lookup.ProcessID, true);
    }
  }
  /**
    * Method to check if the value of passes column is unique in lookup entries already exists.
    * 
    * @param {any} columnIndex 
    * @param {any} value 
    * @param {any} newData 
    * @param {any} currentNewDataIndex 
    * @param {any} currentNewDataColumnIndex 
    * @returns 
    * @memberof ProcessLookupImportComponent
    */
  DuplicateFound(columnIndex, value, newData, currentNewDataIndex, currentNewDataColumnIndex, type) {
    try {
      var uniqueArray = ""
      for (var x = 0; x < currentNewDataIndex; x++) {
        if (type.toLowerCase() == "peoplepicker") {
          if (newData[x][currentNewDataColumnIndex] != undefined && newData[x][currentNewDataColumnIndex] != "") {


            for (var p = 0; p < newData[x][currentNewDataColumnIndex].length; p++) {
              for (var q = 0; q < value.length; q++) {
                if (value[q].Email == newData[x][currentNewDataColumnIndex][p].Email) {
                  return true
                }

              }

            }
          }
        } else if (type.toLowerCase() == "url") {
          if (newData[x][currentNewDataColumnIndex] != undefined && newData[x][currentNewDataColumnIndex] != "") {

            for (var p = 0; p < newData[x][currentNewDataColumnIndex].length; p++) {
              for (var q = 0; q < value.length; q++) {
                if (value[q].url == newData[x][currentNewDataColumnIndex][p].url) {
                  return true
                }
              }
            }
          }
        } else
          if (newData[x][currentNewDataColumnIndex] == value) {
            return true
          } else {
            uniqueArray = uniqueArray + newData[x][currentNewDataColumnIndex] + ";"
          }
      }
      for (var x = 0; x < this.previousData.length; x++) {
        if (this.previousData[x].DateDeleted == "") {
          if (this.previousData[x] == undefined) {
          } else
            if (type.toLowerCase() == "peoplepicker") {
              if (value != undefined && value != "" && this.previousData[x].Value[columnIndex] != undefined && this.previousData[x].Value[columnIndex] != "") {

                for (var p = 0; p < this.previousData[x].Value[columnIndex].length; p++) {
                  for (var q = 0; q < value.length; q++) {
                    if (value[q].Email == this.previousData[x].Value[columnIndex][p].Email) {
                      return true
                    }
                  }
                }
              }
            } else if (type.toLowerCase() == "url") {
              if (value != undefined && value != "" && this.previousData[x].Value[columnIndex] != undefined && this.previousData[x].Value[columnIndex] != "") {

                for (var p = 0; p < this.previousData[x].Value[columnIndex].length; p++) {
                  for (var q = 0; q < value.length; q++) {
                    if (value[q].url == this.previousData[x].Value[columnIndex][p].url) {
                      return true
                    }
                  }
                }
              }
            } else
              if (this.previousData[x].Value[columnIndex] == value) {
                return true
              } else {
                uniqueArray = uniqueArray + this.previousData[x].Value[columnIndex] + ";"
              }
        }
      }
      return false
    } catch (ex) {
      // Dulpicate found method error handler
      this.rapidflowService.ShowErrorMessage("DuplicateFound-Lookup import component", "Platform", ex.message, ex.stack, "An error occured while checking duplicate entries", "N/A", this.lookup.ProcessID, true);
      return false
    }
  }
  /**
   * Method to decide if file data contains logical error or not
   * 
   * @memberof ProcessLookupImportComponent
   */
  showImportOrErrorTable() {
    if (this.uniqueError || this.requiredError || !this.peoplePickerValidated) {
      this.hideImportButton = true
      this.noValuesFound = true;
      this.errorFound = true
      this.loadingFile = false
      this.setErrorBody(this.errroMessageArray)
    } else {
      this.hideImportButton = false
      this.noValuesFound = false;
      this.loadingFile = false
      this.errorFound = false
    }
  }
  /**
   * Bulid string to upload as bulk entries
   * 
   * @returns 
   * @memberof ProcessLookupImportComponent
   */
  getNewEntriesString() {
    try {
      var arrayString = ""
      arrayString = "ImportStart: "
      for (var i = 0; i < this.newEntries.length; i++) {
        arrayString += JSON.stringify(this.newEntries[i])
        arrayString += " RowEnd "
      }
      arrayString = arrayString + " :ImportEnd"
      return arrayString
    } catch (ex) {
    }
  }
  /**
   * upload entries on import action
   * 
   * @memberof ProcessLookupImportComponent
   */
  uploadBulkEntries() {
    try {
      // avoid multiple clicks on import button
      if (this.itemUpdated == false) {
        this.itemUpdated = true
        var paramsAssesment = {}
        paramsAssesment['processId'] = this.lookup.ProcessID
        paramsAssesment['lookupID'] = this.lookup.LookupID;
        paramsAssesment['lookupItems'] = this.getNewEntriesString();
        paramsAssesment['version'] = '0';
        paramsAssesment['approvalStatus'] = this.lookup.ApprovalRequired.toLowerCase();
        paramsAssesment['approvalDetails'] = this.rapidflowService.CurrentLoggedInUser.DisplayName;
        paramsAssesment['operationType'] = 'PROCESS';
        paramsAssesment['authenticationToken'] = this.rapidflowService.CurrentLoggedInUser.AuthenticationToken;
        paramsAssesment['diagnosticLogging'] = this.rapidflowService.diagnosticLoggingProcessFlag.toString();
        // shwoing progress dialog
        if (this.newEntries.length > 0) {
          this.dialogRef = this.dialog.open(ProgressDialogComponent, {
            width: '25%',
            data: {
              message: "Updating …"
            }
          });
          this.dialogRef.afterClosed().subscribe(result => {
          });
          // calling api to update the lookup data
          var loginResult = this.socket.callWebSocketService('createBulkLookupDataItems', paramsAssesment);
          loginResult.then((importResult) => {
            if (importResult[0] != undefined) {
              if (importResult[0].Status == "ChangesCommitted"||importResult[0].Status == "ok") {

                this.dialog.closeAll()
                // refreshing the lookups and tasks
                this.RefereshLookupsAndProcess()
              } else {

                var Result = JSON.parse(importResult[0].Result)
                this.uniqueError = true
                for (var key in Result.DuplicateItem) {

                  for(var lookupIndex=0;lookupIndex<this.lookup.ColumnDefinitions.length;lookupIndex++)
                  {
                    if(this.lookup.ColumnDefinitions[lookupIndex].ShortName==key){
                      if(this.lookup.ColumnDefinitions[lookupIndex].Type.toLowerCase()==   "peoplepicker"  ){
                        this.errorObject = { RowID: Result.DuplicateItemIndex, ErrorType: 'duplicate', Column: key, value: Result.DuplicateItem[key][0].DisplayName}
                      }else if(this.lookup.ColumnDefinitions[lookupIndex].Type.toLowerCase() == "url"  ){
                        this.errorObject = { RowID: Result.DuplicateItemIndex, ErrorType: 'duplicate', Column: key, value: Result.DuplicateItem[key][0].url}
                      }else{
                        this.errorObject = { RowID: Result.DuplicateItemIndex, ErrorType: 'duplicate', Column: key, value: Result.DuplicateItem[key]}
                      }
                    }
                  }
                
                  
                  this.errroMessageArray.push(this.errorObject)
                }
                this.showImportOrErrorTable()
                this.dialogRef.close()
              }
            }
            else {
              this.dialog.closeAll()
              // refreshing the lookups and tasks
              this.RefereshLookupsAndProcess()

            }

          }, (error) => {
            this.dialog.closeAll()
            this.rapidflowService.ShowErrorMessage("createBulkLookupDataItems Lookup import component", "Platform", "Error occured while executing socket call " + error.message, error.stack, "An error occured while createBulkLookupDataItems", " socket.createBulkLookupDataItems", this.lookup.ProcessID, true);
          });
        } else {
          alert('file contain no entry try with another data.')
        }
      }
    } catch (ex) {
      // upload bult entries api call error handler
      this.rapidflowService.ShowErrorMessage("uploadBulkEntries-Lookup import component", "Platform", ex.message, ex.stack, "An error occured while importing the file", "N/A", this.lookup.ProcessID, true);
    }
  }
  /**
   * Refresh the lookups and tasks
   * 
   * @memberof ProcessLookupImportComponent
   */
  RefereshLookupsAndProcess() {
    var CountObject = { "Type": "Referesh", Value: { "Lookup": this.lookup.LookupID, } }
    this.eventEmiterService.changeMessage(CountObject)

    let countRefreshObject = { "Type": "AllCounts", Value: { "Count": "true" } }
    this.eventEmiterService.changeMessage(countRefreshObject);

    this.router.navigate(['main', 'process', this.lookup.ProcessID, 'Lookup', this.lookup.LookupID], { queryParams: { Status: 'Changed' }, queryParamsHandling: 'merge' });
  }
}