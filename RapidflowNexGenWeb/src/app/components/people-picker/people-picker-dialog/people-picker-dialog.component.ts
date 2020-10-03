/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PeoplePickerDialogComponent
Description: Provide functionality to render the popup view of people picker dailog. User can search users with id, name or email to select for processing.
Location: ./people-picker-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { Subject, Observable } from 'rxjs';
import { Component, OnInit, Inject, HostListener, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RapidflowService } from '../../../services/rapidflow.service';
import { ProgressDialogComponent } from '../../progress-dialog/progress-dialog.component';
import { AlertDialogComponent } from '../../alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-people-picker-dialog',
  templateUrl: './people-picker-dialog.component.html',
  styleUrls: ['./people-picker-dialog.component.css']
})
export class PeoplePickerDialogComponent implements OnInit {
  name: string; // Global variable of the class to store the field name
  public keyUp = new Subject<string>(); // Global variable of the class to store the key up function for the search feild
  public searchResults: any[]; // Global variable of the class to store the search results for the people picker
  public searchQuery: string; // Global variable of the class to store the search query entered by the user
  public selfSelection: any; // Global variable of the class to store self selection enabled or not
  public selectionType: string; // Global variable of the class to store the selection type for the people picker single or multiple
  public selectorHeading: string; // Global variable of the class to store the selector heading for the people picker pop up
  public groupSelection: boolean; // Global flag to check if the current people picker allows group selection or not
  public placeHolder: string; // Global variable of the class to store the place holder for the people picker field
  public ngModel: any[]; // Global variable of the class to store the model value for the current field
  public closed: boolean; // Global flag to check if the pop up is closed or not
  public loadingRecords: boolean; // Global flag to check if the records have been loaded or not
  public showAlert: boolean; // Global flag to check if the alert needs to be displayed or not
  public cacheUser: boolean; // Global flag to check if the user needs to be cahed or not

/**
 * Function called when the search field is focused
 * 
 * @param {any} event focus event for the field
 * @memberof PeoplePickerDialogComponent
 */
@HostListener('focusin', ['$event'])
  onFocusin(event) {
    if (!this.data.groupSelection) {
      let tempValues = window.localStorage["PeoplePickerValues"];
      tempValues = tempValues.substr(0, tempValues.length - 1);
      tempValues = JSON.parse("[" + tempValues + "]");
      for (let i: number = 0; i < tempValues.length; i++) {
        for (let j: number = 0; j < this.ngModel.length; j++) {
          if(tempValues.length > 0){
            if (tempValues[i].Email.toLowerCase() == this.ngModel[j].Email.toLowerCase()) {
              tempValues.splice(i, 1);
            }
          }
          else{
            break;
          }
        }
      }
      this.searchResults = tempValues;
      for (let i: number = 0; i < this.searchResults.length; i++) {
        if (this.searchResults[i].Email.toLowerCase() == this.rapidflowService.CurrentLoggedInUser.Email.toLowerCase()) {
          this.searchResults.splice(i, 1);
        }
      }
    }
  }

  /**
   * Creates an instance of PeoplePickerDialogComponent.
   * @param {MatDialogRef<PeoplePickerDialogComponent>} dialogRef 
   * @param {*} data 
   * @param {RapidflowService} rapidflowService 
   * @param {MatDialog} dialog 
   * @memberof PeoplePickerDialogComponent
   */
  constructor(public dialogRef: MatDialogRef<PeoplePickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private rapidflowService: RapidflowService, private dialog: MatDialog) {
    this.searchResults = [];
    this.searchQuery = "";
    this.ngModel = [];
    this.closed = false
    this.loadingRecords = false;
    this.showAlert = false;
    if (data.model != undefined && data.model.length > 0) {
      this.ngModel = data.model;
    }
    
    this.selectionType = data.selectionType;
    this.selfSelection = data.selfSelection;
    if(typeof this.selfSelection == "string"){
      if(this.selfSelection == "true"){
        this.selfSelection = true;
      }
      else{
        this.selfSelection = false;
      }
    }
    this.selectorHeading = data.selectorHeading;
    this.groupSelection = data.groupSelection;
    this.cacheUser = data.cacheUser;
    if (this.groupSelection) {
      this.placeHolder = "Enter group name"
    }
    else {
      this.placeHolder = "Enter person name or email address"
    }
    

    // Observale to check if the keyup event is fired on the search or not
    const observable = this.keyUp
      .map(value => this.rapidflowService.getPeoplePickerResult(this.searchQuery, this.groupSelection))
      .debounceTime(1000)
      .distinctUntilChanged()
      .flatMap((search) => {
        return Observable.of(search).delay(500);
      })
      .subscribe((data) => {
        data.subscribe((temp) => {
          try {
            let results = this.rapidflowService.parseRapidflowJSON(temp);
            this.searchResults = results;
            this.checkSelfSelection();
            this.loadingRecords = false;
          }
          catch (error) {
            this.rapidflowService.ShowErrorMessage("getPeoplePickerResult-People picker dialog Component", "Platfrom", "Error occured while executing api call", error, error.stack, "N/A", '0', true);
          }
        });
      }, (error: any) => {
        this.rapidflowService.ShowErrorMessage("getPeoplePickerResult-People picker dialog Component", "Platfrom", "Error occured while executing api call", error, "An error occured while retrieveTODOTasksDetailsWCF", " RapidflowServices.retrieveTODOTasksDetailsWCF", '0', true);
      });
  }

  /**
   * Function called when the people picker dialog is closed
   * 
   * @memberof PeoplePickerDialogComponent
   */
  onNoClick(): void {
    this.dialogRef.close(this.ngModel);
  }

  /**
   * Triggered when the people picker dialog component is called
   * 
   * @memberof PeoplePickerDialogComponent
   */
  ngOnInit() {
  }

  /**
   * Function called to check if the current logged in user
   * can select themselves in the current people picker field
   * @memberof PeoplePickerDialogComponent
   */
  checkSelfSelection() {
    if (typeof this.selfSelection != "undefined") {
      if (this.selfSelection == false && !this.groupSelection) {
        if (this.searchResults.length > 0) {
          for (let i: number = 0; i < this.searchResults.length; i++) {
            if (this.searchResults[i].Email.toLowerCase() == this.rapidflowService.CurrentLoggedInUser.Email.toLowerCase()) {
              this.searchResults.splice(i, 1);
              this.showAlert = true;
              this.closed = false;
              break;
            }
            else{
              this.showAlert = false;
            }
          }
        }
      }else{
        this.showAlert = false;
      }
    }
  }

  /**
   * Function called when a person is selected from
   * the people picker search results
   * @param {any} person 
   * @memberof PeoplePickerDialogComponent
   */
  selectPerson(person) {
    try {
      // Empty the local storage for the people picker values
      if (typeof window.localStorage["PeoplePickerValues"] == "undefined") {
        window.localStorage["PeoplePickerValues"] = "";
      }

      // check if the user needs to be cached or not
      if (this.cacheUser != undefined) {
        if (this.cacheUser) {
          if (this.groupSelection) {
            let dialogRefGroup = this.dialog.open(ProgressDialogComponent, {
              data: {
                message: "Verifying group ...",
              },
              disableClose: true
            });
            dialogRefGroup.afterClosed().subscribe(result => {
            });
            // cache selected group
            this.rapidflowService.cacheNewGroup(person.Name, person.DistinguishedName, person.Description).subscribe((result) => {
              if(result != undefined){
                var response = this.rapidflowService.parseRapidflowJSON(result);
                if( response.toLowerCase() == "true"){
                  if (typeof this.selectionType != "undefined") {
                    if (this.selectionType.toLowerCase() == "single") {
                      if (this.ngModel.length < 1) {
                        this.ngModel.push(person);
                        if (this.searchResults.indexOf(person) != -1) {
                          this.searchResults.splice(this.searchResults.indexOf(person), 1);
                        }
                        this.dialogRef.close(this.ngModel);
                      }
                      else {
                        this.ngModel.pop();
                        this.ngModel.push(person);
                        if (this.searchResults.indexOf(person) != -1) {
                          this.searchResults.splice(this.searchResults.indexOf(person), 1);
                        }
                      }
                    }
                    else {
                      if (this.ngModel.indexOf(person) == -1) {
                        this.ngModel.push(person);
                      }
                      if (this.searchResults.indexOf(person) != -1) {
                        this.searchResults.splice(this.searchResults.indexOf(person), 1);
                      }
                    }
                  }
                }
                else{
                  let dialogRefGroupInvalid = this.dialog.open(AlertDialogComponent, {
                    data: {
                      title: "Group Invalid",
                      message: "The selected group is not valid. Please contact support",
                    },
                    disableClose: true
                  });
                  dialogRefGroupInvalid.afterClosed().subscribe(result => {
                  });
                  dialogRefGroup.close();
                  this.onFocusin(null);
                }
              }
              dialogRefGroup.close();
            });
          }
          else {
            let dialogRefUser = this.dialog.open(ProgressDialogComponent, {
              data: {
                message: "Verifying user ...",
              },
              disableClose: true
            });
            dialogRefUser.afterClosed().subscribe(result => {
            });
            // cache selected user
            this.rapidflowService.cacheNewUser(person.Email.toLowerCase()).subscribe((result) => {
              if(result != undefined){
                var response = this.rapidflowService.parseRapidflowJSON(result);
                if(typeof response != "string"){
                  if (typeof this.selectionType != "undefined") {
                    if (this.selectionType.toLowerCase() == "single") {
                      if (this.ngModel.length < 1) {
                        this.ngModel.push(person);
                        if (this.searchResults.indexOf(person) != -1) {
                          this.searchResults.splice(this.searchResults.indexOf(person), 1);
                        }
                        this.dialogRef.close(this.ngModel);
                      }
                      else {
                        this.ngModel.pop();
                        this.ngModel.push(person);
                        if (this.searchResults.indexOf(person) != -1) {
                          this.searchResults.splice(this.searchResults.indexOf(person), 1);
                        }
                      }
                    }
                    else {
                      let userFound=false;
                      for(let co=0;co<this.ngModel.length;co++){
                        if(this.ngModel[co]["Email"].toLowerCase() == person.Email.toLowerCase()){
                          userFound = true;
                          break;
                        }
                      }
    
                      if(!userFound){
                        this.ngModel.push(person);
                      }
                      if (this.searchResults.indexOf(person) != -1) {
                        this.searchResults.splice(this.searchResults.indexOf(person), 1);
                      }
                    }
                  }
                  dialogRefUser.close();
                  if (window.localStorage["PeoplePickerValues"].indexOf(JSON.stringify(person)) == -1) {
                    window.localStorage["PeoplePickerValues"] += JSON.stringify(person) + ",";
                  }
                  else {
                    this.onFocusin(null);
                  }
                }
                else{
                  let dialogRefUserInvalid = this.dialog.open(AlertDialogComponent, {
                    data: {
                      title: "User Invalid",
                      message: "The selected user is not valid. Please contact support",
                    },
                    disableClose: true
                  });
                  dialogRefUserInvalid.afterClosed().subscribe(result => {
                  });
                  dialogRefUser.close();
                  this.onFocusin(null);
                }
              }
            });
          }
        }
      }
      else {
        // select the user in the field
        if (typeof this.selectionType != "undefined") {
          if (this.selectionType.toLowerCase() == "single") {
            if (this.ngModel.length < 1) {
              this.ngModel.push(person);
              if (this.searchResults.indexOf(person) != -1) {
                this.searchResults.splice(this.searchResults.indexOf(person), 1);
              }
              this.dialogRef.close(this.ngModel);
            }
            else {
              this.ngModel.pop();
              this.ngModel.push(person);
              if (this.searchResults.indexOf(person) != -1) {
                this.searchResults.splice(this.searchResults.indexOf(person), 1);
              }
            }
          }
          else {
            let userFound=false;
            for(let co=0;co<this.ngModel.length;co++){
              if(this.ngModel[co]["Email"].toLowerCase() == person.Email.toLowerCase()){
                userFound = true;
                break;
              }
            }

            if(!userFound){
              this.ngModel.push(person);
            }
            if (this.searchResults.indexOf(person) != -1) {
              this.searchResults.splice(this.searchResults.indexOf(person), 1);
            }
          }
        }
        if (!this.groupSelection) {
          if (window.localStorage["PeoplePickerValues"].indexOf(JSON.stringify(person)) == -1) {
            window.localStorage["PeoplePickerValues"] += JSON.stringify(person) + ",";
          }
          else {
            this.onFocusin(null);
          }
        }
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("selectPerson-People picker dialog Component", "Platfrom", "Error occured while selecting person", error, error.stack, "N/A", '0', true);
    }
  }

  /**
   * Function called when the selected user is removed from the field
   * 
   * @param {any} person selected person
   * @memberof PeoplePickerDialogComponent
   */
  removePerson(person) {
    try {
      if (this.ngModel != null) {
        var itemIndex = this.ngModel.indexOf(person);
        if (itemIndex != -1) {
          this.searchResults.push(this.ngModel.splice(itemIndex, 1)[0]);
        }
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("removePerson-People picker dialog Component", "Platfrom", "Error occured while removing person", error, error.stack, "N/A", '0', true);
    }
  }
}