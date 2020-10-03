/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: OutOfOfficeDialogComponent
Description: Unit test cases for OutOfOfficeDialogComponent.
Location: ./out-of-office-dialog.component.spec.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutOfOfficeDialogComponent } from './out-of-office-dialog.component';

describe('OutOfOfficeDialogComponent', () => {
  let component: OutOfOfficeDialogComponent;
  let fixture: ComponentFixture<OutOfOfficeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutOfOfficeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutOfOfficeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
