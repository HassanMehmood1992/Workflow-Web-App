/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AccessRequestApprovalDialogComponent
Description: Test cases for file access request approval dialog component.
Location: ./access-request-approval-dialog.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessRequestApprovalDialogComponent } from './access-request-approval-dialog.component';

describe('AccessRequestApprovalDialogComponent', () => {
  let component: AccessRequestApprovalDialogComponent;
  let fixture: ComponentFixture<AccessRequestApprovalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessRequestApprovalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessRequestApprovalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
