/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProxyApproverDialogComponent
Description: Unit test cases for ProxyApproverDialogComponent.
Location: ./components/proxy-approver-dialog.component.spec.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProxyApproverDialogComponent } from './proxy-approver-dialog.component';

describe('ProxyApproverDialogComponent', () => {
  let component: ProxyApproverDialogComponent;
  let fixture: ComponentFixture<ProxyApproverDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProxyApproverDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProxyApproverDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
