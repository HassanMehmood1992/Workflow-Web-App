/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: ProcessFormService
Description: Unit test cases for the process form service class.
Location: ./services/process-form.service.spec.ts
Author: Sheharyar, Hassan
Version: 1.0.0
Modification history: none
*/
import { TestBed, inject } from '@angular/core/testing';

import { ProcessFormService } from './process-form.service';

describe('ProcessFormService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessFormService]
    });
  });

  it('should be created', inject([ProcessFormService], (service: ProcessFormService) => {
    expect(service).toBeTruthy();
  }));
});
