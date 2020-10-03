/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FileAttachmentComponent
Description: Provide functionality to render the file attachement control in the form.
Location: ./file-attachment.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { FileUploadProgressDialogComponent } from './../file-upload-progress-dialog/file-upload-progress-dialog.component';
import { SocketProvider } from './../../services/socket.service';
import { ProgressDialogComponent } from './../progress-dialog/progress-dialog.component';
import { Observable } from 'rxjs/Observable';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit, Input, Output, HostListener, ElementRef, EventEmitter, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgModel, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { RequestOptions } from '@angular/http/src/base_request_options';
import { Http } from '@angular/http';
import { RequestOptionsArgs } from '@angular/http/src/interfaces';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { setInterval, clearInterval } from 'timers';
import { EncryptionService } from '../../services/encryption.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-file-attachment',
  templateUrl: './file-attachment.component.html',
  styleUrls: ['./file-attachment.component.css']
})
export class FileAttachmentComponent implements OnInit {

  @Input('ngModel') ngModel;
  @Input('formDataJSON') formDataJSON;
  @Input('fieldName') fieldName;
  @Input('controlOptions') controlOptions;

  @Output() ngModelChange = new EventEmitter();

  public FileName = ''; // Global variable of the class to store the file name of the file that needs to be uploaded
  public tempFileName = ''; // Global variable of the class to store the file name of the file as temporary that needs to be uploaded
  public fileSize: any; // Global variable of the class to store the file size of the file that needs to be uploaded
  public currentLoggedInUser: any; // Global variable of the class to store the current logged in user
  public myForm: FormGroup; // Global variable of the class to store the file validations as form
  public fileTypes: any; // Global variable of the class to store the file types that are allowed to upload for the field
  public individualFileSize: any; // Global variable of the class to store the individual file size allowed for the field
  public totalFileSize: any; // Global variable of the class to store the total file size allowed for the field
  public numberOfFiles: any; // Global variable of the class to store the allowed number of files for the field
  public fileNameForProgress: string; // Global variable of the class to store the file name of the file for the progress dialog that needs to be uploaded
  public overWriteFile: boolean; // Global flag to check if the uploaded file should be overwritten or not
  public tempNgModel: any; // Gloabal variable of the class to store the ngModel temporarily

  /**
   * Creates an instance of FileAttachmentComponent.
   * @param {RapidflowService} rapidflowService 
   * @param {SocketProvider} socket 
   * @param {Http} http 
   * @param {ElementRef} el 
   * @param {MatDialog} dialog 
   * @param {FormBuilder} formBuilder 
   * @memberof FileAttachmentComponent
   */
  constructor(public rapidflowService: RapidflowService,
    public socket: SocketProvider,
    public http: Http,
    private el: ElementRef,
    public dialog: MatDialog,
    @Inject(FormBuilder) formBuilder: FormBuilder) {
    this.myForm = formBuilder.group({});
    this.fileNameForProgress = "";

  }

  /**
   * Triggered when the file attachment component is called
   * 
   * @memberof FileAttachmentComponent
   */
  ngOnInit() {
    try {
      this.setAttachmentProperties();
      if (this.ngModel == null || this.ngModel == "" || this.ngModel.length == 0 || this.ngModel == undefined || typeof this.ngModel == "string") {
        this.tempNgModel = [];
        this.ngModel = [];
      }
      else {
        this.tempNgModel = this.ngModel;
      }
      this.currentLoggedInUser = JSON.parse(window.localStorage['User']);
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("ngOnInit-file attachment component", "Platform", error.message, error.stack, "An error occured while initializing file attachment", "N/A", this.formDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called when a file is being selected in the file attachment control
   * uploads the file to the server along with progress of the file
   * @returns 
   * @memberof FileAttachmentComponent
   */
  setFiles() {
    try {
      // Get file name and size for the upload service
      let inputEl = this.el.nativeElement.firstElementChild.firstElementChild.lastElementChild;
      if (inputEl.files.length == 0) return;
      let files: FileList = inputEl.files;
      this.FileName = files[0].name;
      this.tempFileName = files[0].name;
      this.fileSize = files[0].size;
      this.fileNameForProgress = this.FileName;

      //Check file validation before uploading the file
      if (this.checkValidationOnFile(inputEl)) {
        const formData = new FormData();
        for (var i = 0; i < files.length; i++) {
          formData.append(files[i].name, files[i]);
        }

        // Construct the file path and filename for the upload service
        let filePath = this.formDataJSON["ArchivePath"] + "TemporaryArchives\\" + this.formDataJSON["ProcessID"] + "\\";
        if (typeof this.currentLoggedInUser.UserID != "undefined") {
          this.FileName = this.currentLoggedInUser.UserID + "RFNGDL" + this.formDataJSON["FormID"] + "RFNGDL" + inputEl.id + "RFNGDL" + this.FileName;
        }
        else {
          this.FileName = "e12RFNGDL" + this.formDataJSON["FormID"] + "RFNGDL" + inputEl.id + "RFNGDL" + this.FileName;
        }

        // Show progress dialog for the file
        let dialogRef = this.dialog.open(FileUploadProgressDialogComponent, {
          data: {
            message: "Uploading file ...",
            fileName: this.fileNameForProgress,
            fullFileName: this.FileName,
            fileSize: this.fileSize
          },
          width: "30%",
          disableClose: true
        });
        dialogRef.afterClosed().subscribe(result => {
        });
        
        // Create file reader and parameters for the upload service
        let tempURL = this.rapidflowService.appServer + "/WCFFileAttachmentService.svc/uploadFileToFileShare?fPath=" + filePath + "&fileName=" + this.FileName + "&diagnosticLogging=true";

        jQuery.ajax({
          url: tempURL,
          data: formData,
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',
          async: true,
          xhrFields: {
            withCredentials: true
          },

          beforeSend: function () {
            return true;
          },
          success: (data) => {
            // After successful upload store the file i data along with download links
            if (data == "File Uploaded") {
              let downloadPath = this.showFileShareAttachmentOnPage(this.formDataJSON["ArchivePath"], inputEl.id);
              let completedDownloadPath = this.showFileShareAttachmentOnPageCompleted(this.formDataJSON["ArchivePath"], inputEl.id);//showFileShareAttachmentOnPageCompleted
              this.tempNgModel.push({ 'name': this.tempFileName, 'size': this.fileSize, 'url': downloadPath, 'tempArchiveName': this.FileName, 'type': 'attachment', 'tempArchievePath': downloadPath, 'completeArchievePath': completedDownloadPath });
              inputEl.value = "";
              if (this.controlOptions.required) {
                if (this.tempNgModel.length > 0) {
                  this.ngModel = this.tempNgModel;
                  this.ngModelChange.emit(this.ngModel);
                }
                else {
                  this.ngModelChange.emit("");
                }
              }
              else {
                if (this.tempNgModel.length > 0) {
                  this.ngModel = this.tempNgModel;
                  this.ngModelChange.emit(this.ngModel);
                }
                else {
                  this.ngModelChange.emit("");
                }
              }
              dialogRef.close();
            }
          },
          complete: function () {
          },
          error: function (data) {
            let dialogRef = this.dialog.open(AlertDialogComponent, {
              data: {
                title: "Unable to Upload File",
                message: "There was an error uploading the file. Please contact support.",
              }
            });
            dialogRef.afterClosed().subscribe(result => {
              this.dialog.closeAll();
            });
          }
        });

        // var reader = new FileReader();
        // reader.onload = (e) => {
        //   var rawData = e.target["result"];
        //   var param = {
        //     fileName: this.FileName,
        //     uploadPath: filePath,
        //     operationType: 'FILE',
        //     fileData: rawData.substr(rawData.indexOf(',') + 1),
        //     diagnosticLogging: this.rapidflowService.diagnosticLoggingApplicationFlag.toString()
        //   };
        //   this.socket.callWebSocketService('socketFileSave', param)
        //     .then((result) => {
        //       // After successful upload store the file i data along with download links
        //       if (result == "File Uploaded") {
        //         let downloadPath = this.showFileShareAttachmentOnPage(this.formDataJSON["ArchivePath"], inputEl.id);
        //         let completedDownloadPath = this.showFileShareAttachmentOnPageCompleted(this.formDataJSON["ArchivePath"], inputEl.id);//showFileShareAttachmentOnPageCompleted
        //         this.tempNgModel.push({ 'name': this.tempFileName, 'size': this.fileSize, 'url': downloadPath, 'tempArchiveName': this.FileName, 'type': 'attachment', 'tempArchievePath': downloadPath, 'completeArchievePath': completedDownloadPath });
        //         inputEl.value = "";
        //         if (this.controlOptions.required) {
        //           if (this.tempNgModel.length > 0) {
        //             this.ngModel = this.tempNgModel;
        //             this.ngModelChange.emit(this.ngModel);
        //           }
        //           else {
        //             this.ngModelChange.emit("");
        //           }
        //         }
        //         else {
        //           if (this.tempNgModel.length > 0) {
        //             this.ngModel = this.tempNgModel;
        //             this.ngModelChange.emit(this.ngModel);
        //           }
        //           else {
        //             this.ngModelChange.emit("");
        //           }
        //         }
        //         dialogRef.close();
        //       }
        //     }).catch((err) => {
        //       console.log(err);
        //       // In case of error show user the error dialog
        //       let dialogRef = this.dialog.open(AlertDialogComponent, {
        //         data: {
        //           title: "Unable to Upload File",
        //           message: "There was an error uploading the file. Please contact support.",
        //         }
        //       });
        //       dialogRef.afterClosed().subscribe(result => {
        //         this.dialog.closeAll();
        //       });
        //     });
        // }
        // reader.readAsDataURL(files[0]);
      }
      else {
        this.ngModel = this.tempNgModel;
        this.ngModelChange.emit(this.ngModel);
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("setFiles-file attachment component", "Platform", error.message, error.stack, "An error occured while uploading file", "N/A", this.formDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function to return the file download path for the uploaded file in case of pending saved or new form
   * 
   * @param {any} fileSharelinks link for the file
   * @param {any} AttachmentID file attachment control ID
   * @returns the download path for the file
   * @memberof FileAttachmentComponent
   */
  showFileShareAttachmentOnPage(fileSharelinks, AttachmentID) {
    let encryptionService = new EncryptionService();
    var fileshareurl = '';
    fileSharelinks = fileSharelinks + "TemporaryArchives\\" + this.formDataJSON["ProcessID"] + "\\" + this.FileName;
    fileshareurl = this.rapidflowService.appServer + '//WCFFileAttachmentService.svc/downloadFile?fPath=' + encryptionService.encryptData(fileSharelinks.replace(/\\/g, "\\\\"));
    return fileshareurl;
  }

  /**
   * Function to return the file download path for the uploaded file in case of completed form
   * 
   * @param {any} fileSharelinks link for the file
   * @param {any} AttachmentID file attachment control ID
   * @returns the download path for the file
   * @memberof FileAttachmentComponent
   */
  showFileShareAttachmentOnPageCompleted(fileSharelinks, AttachmentID) {
    let encryptionService = new EncryptionService();
    var fileshareurl = '';
    fileSharelinks = fileSharelinks + this.formDataJSON["ProcessID"] + "\\" + this.formDataJSON["WorkflowID"] + "\\" + this.formDataJSON["FormID"] + "\\" + AttachmentID + "\\" + this.tempFileName;
    fileshareurl = this.rapidflowService.appServer + '//WCFFileAttachmentService.svc/downloadFile?fPath=' + encryptionService.encryptData(fileSharelinks.replace(/\\/g, "\\\\"));
    return fileshareurl;
  }

  /**
   * Function called when a file is being removed from the form
   * 
   * @param {any} file file that needs to be removed
   * @memberof FileAttachmentComponent
   */
  removeFile(file) {
    try {
      for (var i = 0; i < this.tempNgModel.length; i++) {
        if (this.tempNgModel[i].name == file.name) {
          this.tempNgModel.splice(i, 1);
        }
      }
      if (this.tempNgModel.length == 0) {
        if (this.controlOptions != undefined) {
          if (this.controlOptions.required) {
            this.myForm.controls[this.fieldName] = new FormControl();
            this.myForm.controls[this.fieldName].setValidators(Validators.required);
            this.ngModelChange.emit("");
          }
          else {
            this.ngModel = this.tempNgModel;
            this.ngModelChange.emit(this.ngModel);
            this.myForm.controls[this.fieldName] = new FormControl();
            this.myForm.controls[this.fieldName].setValidators(Validators.nullValidator);
          }
        }
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("removeFile-file attachment component", "Platform", error.message, error.stack, "An error occured while removing file", "N/A", this.formDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called when the file attachment is being initialized
   * 
   * @memberof FileAttachmentComponent
   */
  setAttachmentProperties() {
    try {
      if (this.fieldName == undefined || this.fieldName == "") {
        this.fieldName = "myFileAttachment";
      }
      if (this.controlOptions != undefined) {
        if (this.controlOptions.fileTypes != undefined) {
          this.fileTypes = this.controlOptions.fileTypes;
        }
        else {
          this.fileTypes = "pdf,docx,xls";
        }

        if (this.controlOptions.individualFileSize != undefined) {
          this.individualFileSize = this.controlOptions.individualFileSize;
        }
        else {
          this.individualFileSize = 10;
        }

        if (this.controlOptions.totalFileSize != undefined) {
          this.totalFileSize = this.controlOptions.totalFileSize;
        }
        else {
          this.totalFileSize = 25;
        }

        if (this.controlOptions.numberOfFiles != undefined) {
          this.numberOfFiles = this.controlOptions.numberOfFiles;
        }
        else {
          this.numberOfFiles = 1;
        }

        if (this.controlOptions.overWriteFile != undefined) {
          this.overWriteFile = this.controlOptions.overWriteFile;
          this.overWriteFile = false;
        }
        else {
          this.overWriteFile = false;
        }

        if (this.controlOptions.required) {
          this.myForm.controls[this.fieldName] = new FormControl();
          this.myForm.controls[this.fieldName].setValidators(Validators.required);
        }
        else {
          this.myForm.controls[this.fieldName] = new FormControl();
          this.myForm.controls[this.fieldName].setValidators(Validators.nullValidator);
        }
      }
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("setAttachmentProperties-file attachment component", "Platform", error.message, error.stack, "An error occured while setting attchment properties", "N/A", this.formDataJSON["ProcessID"], true);
    }

  }

  /**
   * Function called to calculate the size of the file in KBs
   * 
   * @param {any} size Size of the uploaded file in bytes
   * @returns the size of the file in kilo bytes
   * @memberof FileAttachmentComponent
   */
  calculateSizeKb(size) {
    size = size / 1024;
    return Math.round(size * 100) / 100
  }

  /**
   * Function called to calculate the size of the file in MBs
   * 
   * @param {any} size Size of the uploaded file in bytes
   * @returns the size of the file in mega bytes
   * @memberof FileAttachmentComponent
   */
  calculateSizeMb(size) {
    size = size / 1024 / 1024;
    return Math.round(size * 100) / 100
  }

  /**
   * Function called to check validation on the file uploaded
   * 
   * @param {any} element file that is being uploaded
   * @returns true if the file uploaded is validated, false otherwise
   * @memberof FileAttachmentComponent
   */
  checkValidationOnFile(element) {
    try {
      var validatedFile = false;
      validatedFile = this.checkFileExtension(element);
      if (validatedFile) {
        validatedFile = this.checkFileName(element);
        if (validatedFile) {
          validatedFile = this.checkNumberofFiles(element);
          if (validatedFile) {
            validatedFile = this.checkFileSize(element);
            if (validatedFile) {
              validatedFile = this.checkTotalFileSize(element);
              if (validatedFile) {
                validatedFile = this.checkOverWriteFile(element);
              }
            }
          }
        }
      }
      return validatedFile;
    }
    catch (error) {
      this.rapidflowService.ShowErrorMessage("checkValidationOnFile-file attachment component", "Platform", error.message, error.stack, "An error occured while validating attached file", "N/A", this.formDataJSON["ProcessID"], true);
    }
  }

  /**
   * Function called to check if the extension of the uploaded file
   * is allowed by the current field or not
   * @param {any} element file that is being uploaded
   * @returns true if the file uploaded is validated, false otherwise
   * @memberof FileAttachmentComponent
   */
  checkFileExtension(element) {
    var validatedFile = false;
    var fileExtension = "";
    var basename = this.tempFileName.split(/[\\/]/).pop(),
      pos = basename.lastIndexOf(".");
    if (basename === "" || pos < 1) {
      fileExtension = "";
    }
    else {
      fileExtension = basename.slice(pos + 1);
    }
    if (fileExtension != "") {
      if (this.fileTypes != undefined) {
        if (this.fileTypes == "" || this.fileTypes.toLowerCase() == "all") {
          validatedFile = true;
          return validatedFile;
        }
        else if (this.fileTypes.indexOf(fileExtension) == -1) {
          let dialogRef = this.dialog.open(AlertDialogComponent, {
            data: {
              title: "Unable to Upload File",
              message: "The file type uploaded is not allowed, kindly upload a file with " + this.fileTypes + " as extensions.",
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            this.dialog.closeAll();
            validatedFile = false;
            element.value = "";
            return validatedFile;
          });
        }
        else {
          validatedFile = true;
          return validatedFile;
        }
      }
      else {
        validatedFile = true;
        return validatedFile;
      }
    }
    else {
      let dialogRef = this.dialog.open(AlertDialogComponent, {
        data: {
          title: "Unable to Upload File",
          message: "The file type uploaded is not allowed, kindly upload a file with " + this.fileTypes + " as extensions.",
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.dialog.closeAll();
        validatedFile = false;
        element.value = "";
        return validatedFile;
      });
    }
  }

  /**
   * Function called to check the length of the file name of 
   * the file that is being uploaded
   * @param {any} element file that is being uploaded
   * @returns true if the file uploaded is validated, false otherwise
   * @memberof FileAttachmentComponent
   */
  checkFileName(element) {
    var validatedFile = false;
    if (this.tempFileName.length >= 200) {
      let dialogRef = this.dialog.open(AlertDialogComponent, {
        data: {
          title: "Unable to Upload File",
          message: "File name is too long while trying to attach file. Please shorten the file name.",
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.dialog.closeAll();
        validatedFile = false;
        element.value = "";
        return validatedFile;
      });
    }
    else {
      validatedFile = true;
      return validatedFile;
    }
  }

  /**
   * Function called to check the limit on the number of files 
   * that have been uploaded for the field
   * @param {any} element file that is being uploaded
   * @returns true if the file uploaded is validated, false otherwise 
   * @memberof FileAttachmentComponent
   */
  checkNumberofFiles(element) {
    var validatedFile = false;
    if (this.tempNgModel.length + 1 > this.numberOfFiles) {
      let dialogRef = this.dialog.open(AlertDialogComponent, {
        data: {
          title: "Unable to Upload File",
          message: "You can not upload anymore files. Please delete a file and try again.",
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.dialog.closeAll();
        validatedFile = false;
        element.value = "";
        return validatedFile;
      });
    }
    else {
      validatedFile = true;
      return validatedFile;
    }
  }

  /**
   * Function called to check the allowed individual file 
   * size for the uploaded file for the field
   * @param {any} element file that is being uploaded
   * @returns true if the file uploaded is validated, false otherwise
   * @memberof FileAttachmentComponent
   */
  checkFileSize(element) {
    var validatedFile = false;
    if (this.individualFileSize < (this.fileSize / 1024 / 1024)) {
      let dialogRef = this.dialog.open(AlertDialogComponent, {
        data: {
          title: "Unable to Upload File",
          message: "The file size of the uploaded file is too large. Please upload a file less than " + this.individualFileSize + " MB.",
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.dialog.closeAll();
        validatedFile = false;
        element.value = "";
        return validatedFile;
      });
    }
    else {
      validatedFile = true;
      return validatedFile;
    }
  }

  /**
   * Function called to check the allowed total file size
   * for all the uploaded files for the field
   * @param {any} element file that is being uploaded
   * @returns true if the file uploaded is validated, false otherwise
   * @memberof FileAttachmentComponent
   */
  checkTotalFileSize(element) {
    var validatedFile = false;
    if (this.tempNgModel.length > 0) {
      var totalFileSizeUploaded = 0;
      for (var index = 0; index < this.tempNgModel.length; index++) {
        totalFileSizeUploaded += this.tempNgModel[index].size;
      }
      if ((totalFileSizeUploaded / 1024 / 1024) > this.totalFileSize) {
        let dialogRef = this.dialog.open(AlertDialogComponent, {
          data: {
            title: "Unable to Upload File",
            message: "The total file size of the uploaded files is too large. You cannot upload any more files. Please remove a file and try again.",
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          this.dialog.closeAll();
          validatedFile = false;
          element.value = "";
          return validatedFile;
        });
      }
      else {
        validatedFile = true;
        return validatedFile;
      }
    }
    else {
      validatedFile = true;
      return validatedFile;
    }
  }

  /**
   * Function called to check if the uploaded file is being 
   * allowed to overwrite an existing file or not
   * @param {any} element file that is being uploaded
   * @returns true if the file uploaded is validated, false otherwise
   * @memberof FileAttachmentComponent
   */
  checkOverWriteFile(element) {
    var validatedFile = false;
    var fileFound = false;
    if (!this.overWriteFile) {
      for (var index = 0; index < this.tempNgModel.length; index++) {
        if (this.tempNgModel[index]["name"].toLowerCase() == this.tempFileName.toLowerCase()) {
          fileFound = true;
          break;
        }
      }
      if (fileFound) {
        let dialogRef = this.dialog.open(AlertDialogComponent, {
          data: {
            title: "Unable to Upload File",
            message: "A file with the same name already exists. Kindly remove the already existing file or rename the current file and try again.",
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          this.dialog.closeAll();
          validatedFile = false;
          element.value = "";
          return validatedFile;
        });
      }
      else {
        validatedFile = true;
        return validatedFile;
      }
    }
    else {
      validatedFile = true;
      return validatedFile;
    }
  }
}
