/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DiagnosticLoggingSetDialogComponent
Description: Test cases for DiagnosticLoggingSetDialogComponent.
Location: ./diagnostic-logging-set-dialog.component.spec.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticLoggingSetDialogComponent } from './diagnostic-logging-set-dialog.component';

describe('DiagnosticLoggingSetDialogComponent', () => {
  let component: DiagnosticLoggingSetDialogComponent;
  let fixture: ComponentFixture<DiagnosticLoggingSetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagnosticLoggingSetDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosticLoggingSetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
