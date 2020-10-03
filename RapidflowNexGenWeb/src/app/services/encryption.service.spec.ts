/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: EncryptionService
Description: Test cases for ecryption service.
Location: ./ecryption.service.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { TestBed, inject } from '@angular/core/testing';

import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EncryptionService]
    });
  });

  it('should be created', inject([EncryptionService], (service: EncryptionService) => {
    expect(service).toBeTruthy();
  }));
});
