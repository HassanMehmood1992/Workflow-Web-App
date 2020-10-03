/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: LoginComponent
Description: Provide functionality to log in the user to system.
Location: ./login.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Title } from '@angular/platform-browser';
import { AlertDialogComponent } from './../alert-dialog/alert-dialog.component';
import { browser } from 'protractor';
import { ProgressDialogComponent } from './../progress-dialog/progress-dialog.component';

import { EncryptionService } from './../../services/encryption.service';
import { RapidflowService } from './../../services/rapidflow.service';
import { SocketProvider } from '../../services/socket.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MatProgressBarModule } from '@angular/material';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  UserDeviceInfo: any; // Global variable of the class to store the device information for the current user device
  userNameInput: string=""; // Global variable of the class to store the user name entered by the user 
  userPasswordInput: string=""; // Global variable of the class to store the user password entered by the user
  public userLogingIn: boolean; // Global flag of the class to check if the user is logging in or not 
  pageLoading:boolean=false; // Global flag of the class to check if the page is loading or not
  invalidCredentials: boolean = false; // Global flag of the class to check if the user credientials are valid or not
  userInvalid:boolean=false; // Global flag of the class to check if the user is valid or not 
  public loginAttempts: number; // Global variable of the class to store the number of login attempts by the user

  /**
   * Local function to get the current user and device
   * finger print to be stored in the database
   * @memberof LoginComponent
   */
  public fingerprint = (function (window, screen, navigator) {
    function checksum(str) {
      var hash = 5381,
        i = str.length;
      while (i--) hash = (hash * 33) ^ str.charCodeAt(i);
      return hash >>> 0;
    }
    function map(arr, fn) {
      var i = 0, len = arr.length, ret = [];
      while (i < len) {
        ret[i] = fn(arr[i++]);
      }
      return ret;
    }
    return checksum([
      navigator.userAgent,
      [screen.height, screen.width, screen.colorDepth].join('x'),
      new Date().getTimezoneOffset(),
      !!window['sessionStorage'],
      !!window['localStorage'],
      map(navigator.plugins, function (plugin) {
        return [
          plugin.name,
          plugin.description,
          map(plugin, function (mime) {
            return [mime.type, mime.suffixes].join('~');
          }).join(',')
        ].join("::");
      }).join(';')
    ].join('###'));
  }(this, screen, navigator));

  /**
   * Creates an instance of LoginComponent.
   * @param {Title} titleService 
   * @param {RapidflowService} rapidflowService 
   * @param {Router} rtr 
   * @param {SocketProvider} socket 
   * @param {MatDialog} dialog 
   * @memberof LoginComponent
   */
  constructor(private titleService:Title,private rapidflowService: RapidflowService, private rtr: Router, private socket: SocketProvider, private dialog: MatDialog) {
    this.hideInitLoader();
    this.socket.start();
    this.userLogingIn = false;
    this.loginAttempts = 0;
    try {
      if(window.localStorage['User'] != undefined){
        var loogedinUser = JSON.parse(window.localStorage['User'])
        if (loogedinUser.DisplayName != null && loogedinUser.DisplayName != undefined) {
          this.userLogingIn = true;
          this.rtr.navigate(['main']);
        }
      }
    } catch (ex) {
      
      this.rapidflowService.ShowErrorMessage("constructor-Login Component", "Global", ex.message, ex.stack, "An error occured while initializing login", "N/A", "0", false);
    }
  }
  
  /**
   * Triggered when the login component is called
   * 
   * @memberof LoginComponent
   */
  ngOnInit() {
    this.titleService.setTitle('RapidFlow' );
   }

  /**
   * Function called when the user clicks on login
   * to authenticate the current logged in user
   * @returns 
   * @memberof LoginComponent
   */
  authenticateUser() {
    try {
      // check if the user has entered the correct values
      if (this.userNameInput == "" || this.userNameInput == undefined || this.userPasswordInput == "" || this.userPasswordInput == undefined) {
        this.invalidCredentials = true;
        return;
      }
      this.loginAttempts++;
      this.userLogingIn = true;
      let encryptionService = new EncryptionService();
      if (this.userNameInput.toLowerCase().indexOf('abbvienet') == -1) {
        this.userNameInput = 'abbvienet\\' + this.userNameInput
      }

      //encrypt the user details
      let encryptedUserName = encryptionService.encryptData(this.userNameInput);
      let encryptedPassword = encryptionService.encryptData(this.userPasswordInput);
      this.userLogingIn = true;
      this.invalidCredentials = false;
      this.userInvalid=false;

      //get platform information 
      this.getPlatformInformation();
      var authenticateUser = { logOnId: encryptedUserName, password: encryptedPassword, deviceId: (this.UserDeviceInfo.UserAgent + '-' + this.fingerprint), platform: "Web", deviceInformation: this.UserDeviceInfo.BrowserVersion, operationType : 'APPLICATION', diagnosticLogging: "false" };
      var loginResult = this.socket.callWebSocketService('AuthenticateUser', authenticateUser);
      loginResult.then((result:any) => {
        if (result == "") {
          this.invalidCredentials = true;
          this.userLogingIn = false;
          if (this.loginAttempts >= 3) {
            let dialogRef = this.dialog.open(AlertDialogComponent, {
              data: {
                title: "Unable to Login",
                message: "Your account is disabled, please contact the service desk or your local support.",
              }
            });
            dialogRef.afterClosed().subscribe(result => {
              window.location.reload();
              this.dialog.closeAll();
            });
          }
        }
        else {
          if(result=="UserInvalid")
          {
            this.userInvalid = true;
            this.userLogingIn = false;
            return;
          }
         if(result[0].Active!=undefined&&result[0].Active=="False"){
          let dialogRef = this.dialog.open(AlertDialogComponent, {
            data: {
              title: "Unable to Login",
              message: "Your account is disabled, please contact the service desk or your local support.",
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            this.userLogingIn = false;
            this.dialog.closeAll();
          });
         }
         else{
          window.localStorage["PeoplePickerValues"] = [];
          window.localStorage["User"] = JSON.stringify(result[0]);
          if (RapidflowService.redirectURL != "") {
            var url = ""
            url = RapidflowService.redirectURL
            RapidflowService.redirectURL = ""
            window.location.href = url
          } else {
            if(this.rapidflowService.loggedOut.indexOf('login')==-1&&this.rapidflowService.loggedOut!="")
            {
              this.rtr.navigateByUrl(this.rapidflowService.loggedOut.split('#')[1])
            }
            else{
              this.rtr.navigate(['main']);
            }
            
            
          }
         }
        
        }
      }, (ex) => {
        this.rapidflowService.ShowErrorMessage("AuthenticateUser_Socket call-Login Component", "Global", "Error occured while executing socket call "+ex.message, ex.stack, "An error occured while authenticatig user", "N/A", "0", true);
      })
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("authenticateUser-Login Component", "Global", ex.message, ex.stack, "An error occured while authenticatig user", "N/A", "0", true);
    }
  }

  /**
   * Function called to generate a random guid as token 
   * for the current logged in user
   * @returns random 36 digit guid for the user
   * @memberof LoginComponent
   */
  guidGenerator() {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }

  /**
   * Function called to return the platform information of the device
   * 
   * @returns the device details
   * @memberof LoginComponent
   */
  getPlatformInformation() {
    try {
      this.UserDeviceInfo = {}
      this.UserDeviceInfo.UserAgent = navigator.userAgent
      var browser = ""
      var browserVersion
      if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Opera';
      } else if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        browser = 'MSIE';
      } else if (/Navigator[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Netscape';
      } else if (/Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Chrome';
      } else if (/Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Safari';
        /Version[\/\s](\d+\.\d+)/.test(navigator.userAgent);
        browserVersion = new Number(RegExp.$1);
      } else if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Firefox';
      }
      else {
        browser = "unknown"
        browserVersion = "unknown"
      }
      browserVersion = navigator.userAgent.substr(navigator.userAgent.indexOf(browser));
      browserVersion.substr(0, browserVersion.indexOf(' '));
      this.UserDeviceInfo.Browser = browser
      this.UserDeviceInfo.BrowserVersion = browserVersion
      return this.UserDeviceInfo
    } catch (ex) {
      this.rapidflowService.ShowErrorMessage("getPlatformInformation-Login component", "Global", ex.message, ex.stack, "An error occured while retrieving platform information", "N/A", "0", true);
    }
  }

  hideInitLoader(){
    if(window.location.href.indexOf("login")!=-1)
    {
      document.getElementById("initLoader").style.display="none";
    }
  }
}
