/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessAdminPannelComponent
Description: Test cases for ProcessAdminPannelComponent.
Location: ./components/process-admin-panel.component.spec.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessAdminPannelComponent } from './process-admin-pannel.component';

describe('ProcessAdminPannelComponent', () => {
  let component: ProcessAdminPannelComponent;
  let fixture: ComponentFixture<ProcessAdminPannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessAdminPannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessAdminPannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
