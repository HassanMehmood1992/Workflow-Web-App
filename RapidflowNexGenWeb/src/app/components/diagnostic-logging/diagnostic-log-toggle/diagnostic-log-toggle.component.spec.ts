/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DiagnosticLogToggleComponent
Description: Test cases for Diagnostic Log Toggle Component.
Location: ./diagnostic-log-toggle.component.spec.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticLogToggleComponent } from './diagnostic-log-toggle.component';

describe('DiagnosticLogToggleComponent', () => {
  let component: DiagnosticLogToggleComponent;
  let fixture: ComponentFixture<DiagnosticLogToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagnosticLogToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosticLogToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
