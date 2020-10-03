/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AuthenticateUserDialogComponent
Description: Provide functionality to authenticate the user before taking action on the workflow form if needed.
Location: ./authenticate-user-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EncryptionService } from '../../services/encryption.service';
import { SocketProvider } from '../../services/socket.service';
import { RapidflowService } from '../../services/rapidflow.service';

@Component({
  selector: 'app-authenticate-user-dialog',
  templateUrl: './authenticate-user-dialog.component.html',
  styleUrls: ['./authenticate-user-dialog.component.css']
})
export class AuthenticateUserDialogComponent implements OnInit {

  /**
   * Creates an instance of AuthenticateUserDialogComponent.
   * @param {MatDialogRef<AuthenticateUserDialogComponent>} dialogRef 
   * @param {*} data 
   * @param {SocketProvider} socket 
   * @memberof AuthenticateUserDialogComponent
   */
  constructor(public dialogRef: MatDialogRef<AuthenticateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private socket:SocketProvider,public rapidflowService:RapidflowService) { }

  userPasswordInput: string=""; //Global variable of the class to store the user entered password for authetication
  public userLogingIn: boolean; //Global flag to check if the current user is loggin in 
  public invalidUser:boolean; //Global flag to check if the credientials entered by user are valid or not
  public validatingUser:boolean; //Global flag to check if the user is being validated or not
  
  /**
   * Triggered when the dialog is being initialized
   * 
   * @memberof AuthenticateUserDialogComponent
   */
  ngOnInit() {
    this.invalidUser = false;
    this.validatingUser = false;
  }

  /**
   * Function to re authenticate the current user
   * and check if the user taking action is valid or not
   * @param {any} authenticate flag to autheticate or not
   * @memberof AuthenticateUserDialogComponent
   */
  autheticateUser(authenticate){
    if(authenticate){
      if(this.userPasswordInput.length > 0){
        this.validatingUser = true;
        let encryptionService = new EncryptionService();
        let encryptedUserName = encryptionService.encryptData(this.data.currentUserLoginId);
        let encryptedPassword = encryptionService.encryptData(this.userPasswordInput);
        var authenticateObj = {
          loginId: encryptedUserName,
          password: encryptedPassword,
          operationType : 'WORKFLOW',
          diagnosticLogging:this.rapidflowService.diagnosticLoggingProcessFlag.toString()
        }
        this.socket.callWebSocketService('validateCredentials',authenticateObj).then((result)=>{
          this.validatingUser = false;
          if (result == 'false') {
            this.invalidUser = true;
          }
          else if ( result == 'true') {
            this.dialogRef.close(true);
            this.invalidUser = false;
          }
        });
      }
    }
    else{
      this.dialogRef.close(false);
    }
  }
}
