/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: RapidflowService
Description: Unit test cases for the rapidflow service class.
Location: ./services/rapidflow.service.spec.ts
Author: Nabil, Sheharyar, Amir
Version: 1.0.0
Modification history: none
*/

import { TestBed, inject } from '@angular/core/testing';

import { RapidflowService } from './rapidflow.service';

describe('RapidflowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RapidflowService]
    });
  });

  it('should be created', inject([RapidflowService], (service: RapidflowService) => {
    expect(service).toBeTruthy();
  }));
});
