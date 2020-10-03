/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: UpdateErrorlogDialogComponent
Description: Test cases for UpdateErrorlogDialogComponent.
Location: ./update-errorlog-dialog.component.spec.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateErrorlogDialogComponent } from './update-errorlog-dialog.component';

describe('UpdateErrorlogDialogComponent', () => {
  let component: UpdateErrorlogDialogComponent;
  let fixture: ComponentFixture<UpdateErrorlogDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateErrorlogDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateErrorlogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
