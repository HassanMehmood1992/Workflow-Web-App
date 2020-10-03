/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PendingAccessDialogComponent
Description: Test cases for pending access dialog component.
Location: ./main/pending-access-dialog-component.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingAccessDialogComponent } from './pending-access-dialog.component';

describe('PendingAccessDialogComponent', () => {
  let component: PendingAccessDialogComponent;
  let fixture: ComponentFixture<PendingAccessDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingAccessDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingAccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
