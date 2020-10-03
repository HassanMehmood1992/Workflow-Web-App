/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProgressDialogComponent
Description: Test cases for the progress dialog component.
Location: ./progress-dialog.component.spec.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { ProgressDialogComponent } from './progress-dialog.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';



describe('ProgressDialogComponent', () => {
  let component: ProgressDialogComponent;
  let fixture: ComponentFixture<ProgressDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
