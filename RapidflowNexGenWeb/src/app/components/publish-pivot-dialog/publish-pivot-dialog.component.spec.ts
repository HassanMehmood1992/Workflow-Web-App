
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PublishPivotDialogComponent
Description: Unit test cases for PublishPivotDialogComponent.
Location: ./components/publish-pivot-dialog.component.spec.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishPivotDialogComponent } from './publish-pivot-dialog.component';

describe('PublishPivotDialogComponent', () => {
  let component: PublishPivotDialogComponent;
  let fixture: ComponentFixture<PublishPivotDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublishPivotDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishPivotDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
