/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FileUploadProgressDialogComponent
Description: Test cases for file upload progress dialog component.
Location: ./file-upload-progress-dialog.component.spec.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadProgressDialogComponent } from './file-upload-progress-dialog.component';

describe('FileUploadProgressDialogComponent', () => {
  let component: FileUploadProgressDialogComponent;
  let fixture: ComponentFixture<FileUploadProgressDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadProgressDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
