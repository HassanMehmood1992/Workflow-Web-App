/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DatabaseLookupDialogComponent
Description: Unit test cases for database lookup component.
Location: ./database-lookup.component.spec.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseLookupComponent } from './database-lookup.component';

describe('DatabaseLookupComponent', () => {
  let component: DatabaseLookupComponent;
  let fixture: ComponentFixture<DatabaseLookupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatabaseLookupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
