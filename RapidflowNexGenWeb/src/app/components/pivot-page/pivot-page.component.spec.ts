/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PivotPageComponent
Description: Test cases for PivotPageComponent
Location: ./pivot-page.component.spec.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PivotPageComponent } from '../pivot-page/pivot-page.component';

describe('PivotComponent', () => {
  let component: PivotPageComponent;
  let fixture: ComponentFixture<PivotPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PivotPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PivotPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
