/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FileUploadProgressDialogComponent
Description: Provide functionality to show the progress of file uploading to server.
Location: ./file-upload-progress-dialog.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SocketProvider } from '../../services/socket.service';

@Component({
  selector: 'app-file-upload-progress-dialog',
  templateUrl: './file-upload-progress-dialog.component.html',
  styleUrls: ['./file-upload-progress-dialog.component.css']
})
export class FileUploadProgressDialogComponent implements OnInit {

  public isCanceled:string; // Global variable to check if the file is canceled or not
  public progressValue:any; // Global variable of the class to store the progress value of the file uploaded
  public uploadInterval:any; // Global variable of the class to store the time interval for the uploaded file

  /**
   * Creates an instance of FileUploadProgressDialogComponent.
   * @param {MatDialogRef<FileUploadProgressDialogComponent>} dialogRef 
   * @param {*} data 
   * @param {SocketProvider} socket 
   * @memberof FileUploadProgressDialogComponent
   */
  constructor(public dialogRef: MatDialogRef<FileUploadProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,public socket:SocketProvider) {
      this.isCanceled = "false";
     }

  /**
   * Triggered when the file upload progress dialog component is called 
   * 
   * @memberof FileUploadProgressDialogComponent
   */
  ngOnInit() {
    this.data.progressValue = 0;
    this.progressValue = 0;
  }

  /**
   * Triggered when the file upload progress dialog is rendered completely
   * Also sets the time interval for the uploaded file
   * @memberof FileUploadProgressDialogComponent
   */
  ngAfterViewInit(){
    var seconds = 0;
    if(this.data.fileSize > 1024*1024){
      seconds = Math.ceil((this.data.fileSize/1024)/20)+ Math.floor(Math.random() * Math.floor(1000));
    }
    else{
      seconds = Math.ceil(this.data.fileSize/512/20)+Math.floor(Math.random() * Math.floor(1000));
    }
    this.uploadInterval = setInterval(()=>{
      this.getProgress();
    },(2000));
  }

  /**
   * Function called to cancel the file upload
   * 
   * @memberof FileUploadProgressDialogComponent
   */
  cancelUpload() {
    this.isCanceled = "true";
  }

  /**
   * Function called to return the progress of the uploaded file
   * 
   * @memberof FileUploadProgressDialogComponent
   */
  getProgress(){
    var param = {
      fileName: this.data.fullFileName,
      isCanceled: this.isCanceled,
      diagnosticLogging: "true",
      operationType: "FILE"
    }
    var actionresultAssesment = this.socket.callWebSocketService('getFileUploadProgress', param).then((result)=>{
      if(result != null && result != undefined && result != ""){
        if(result["size"] != null && result["size"] != undefined && result["size"] != ""){
          if(result["size"] != "0" && result["size"].toLowerCase() != "file canceled"){
            let progress = Math.ceil((parseInt(result["size"])/this.data.fileSize)*100);
            this.progressValue = progress;
          }
          else{
            clearInterval(this.uploadInterval);
            this.dialogRef.close();
          }
        }
      }
    });
    // if(this.progressValue <= 10){
    //   var max = 1;
    //   var min = 0;
    //   this.progressValue += (Math.floor(Math.random() * (max - min + 1)) + min);
    // }
    // else{
      // if(this.progressValue > 20 && this.progressValue < 35){
      //   this.progressValue += (Math.floor(Math.random() * Math.floor(4))+1);
      // }
      // else if(this.progressValue > 35 && this.progressValue < 60){
      //   this.progressValue += (Math.floor(Math.random() * Math.floor(3))+1);
      // }
      // else if(this.progressValue > 60 && this.progressValue < 80){
      //   this.progressValue += (Math.floor(Math.random() * Math.floor(2))+1);
      // }
      // else if(this.progressValue > 80 && this.progressValue < 99){
        
      // }
      // else{
      //   this.progressValue += (Math.floor(Math.random() * Math.floor(5))+1);
      // }
    //}
  }

}
