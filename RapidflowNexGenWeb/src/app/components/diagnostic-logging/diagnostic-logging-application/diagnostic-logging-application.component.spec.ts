/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DiagnosticLoggingApplicationComponent
Description: Test cases for Diagnostic Logging Application Component.
Location: ./diagnostic-logging-application.component.spec.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticLoggingApplicationComponent } from './diagnostic-logging-application.component';

describe('DiagnosticLoggingApplicationComponent', () => {
  let component: DiagnosticLoggingApplicationComponent;
  let fixture: ComponentFixture<DiagnosticLoggingApplicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagnosticLoggingApplicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosticLoggingApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
