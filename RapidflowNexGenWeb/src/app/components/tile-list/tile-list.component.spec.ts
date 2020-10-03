/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: TileListComponent
Description: Test cases for tile list component.
Location: ./tile-list-component.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileListComponent } from './tile-list.component';

describe('TileListComponent', () => {
  let component: TileListComponent;
  let fixture: ComponentFixture<TileListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
