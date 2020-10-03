/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: EventEmiterService
Description: Test cases for event emitter service.
Location: ./event-emitters.service.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { TestBed, inject } from '@angular/core/testing';

import { EventEmiterService } from './event-emiters.service';

describe('EventEmitersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventEmiterService]
    });
  });

  it('should be created', inject([EventEmiterService], (service: EventEmiterService) => {
    expect(service).toBeTruthy();
  }));
});
