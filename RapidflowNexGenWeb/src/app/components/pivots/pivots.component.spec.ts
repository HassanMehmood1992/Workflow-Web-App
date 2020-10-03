/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PivotsComponent
Description: Test cases for pivots component.
Location: ./pivots-component.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PivotsComponent } from './pivots.component';

describe('PivotsComponent', () => {
  let component: PivotsComponent;
  let fixture: ComponentFixture<PivotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PivotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PivotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
