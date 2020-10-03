/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessDataService
Description: Test cases for process data service.
Location: ./process-data.service.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { TestBed, inject } from '@angular/core/testing';

import { ProcessDataService } from './process-data.service';

describe('ProcessDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessDataService]
    });
  });

  it('should be created', inject([ProcessDataService], (service: ProcessDataService) => {
    expect(service).toBeTruthy();
  }));
});
