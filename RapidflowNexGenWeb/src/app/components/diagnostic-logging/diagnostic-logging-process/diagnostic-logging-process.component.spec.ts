/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DiagnosticLoggingProcessComponent
Description: Unit test cases for Diagnostic Logging Process Component.
Location: ./diagnostic-logging-process.component.spec.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticLoggingProcessComponent } from './diagnostic-logging-process.component';

describe('DiagnosticLoggingProcessComponent', () => {
  let component: DiagnosticLoggingProcessComponent;
  let fixture: ComponentFixture<DiagnosticLoggingProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagnosticLoggingProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosticLoggingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
