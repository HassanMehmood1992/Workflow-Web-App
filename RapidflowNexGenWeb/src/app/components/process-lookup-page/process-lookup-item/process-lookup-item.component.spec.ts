/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessLooupItemDialogComponent
Description: Test cases for process lookup item component.
Location: ./process-lookup-page/process-lookup-item-component.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessLookupItemComponent } from './process-lookup-item.component';

describe('ProcessLooupItemDialogComponent', () => {
  let component: ProcessLookupItemComponent;
  let fixture: ComponentFixture<ProcessLookupItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessLookupItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessLookupItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
