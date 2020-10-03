/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AuthenticateUserDialogComponent
Description: Unit test cases for the authenticate user dialog component.
Location: ./authenticate-user-dialog.component.spec.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticateUserDialogComponent } from './authenticate-user-dialog.component';

describe('AuthenticateUserDialogComponent', () => {
  let component: AuthenticateUserDialogComponent;
  let fixture: ComponentFixture<AuthenticateUserDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthenticateUserDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthenticateUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
