/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SortListsService
Description: Test cases for sort list service.
Location: ./sort-list.service.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { TestBed, inject } from '@angular/core/testing';

import { SortListsService } from './sort-lists.service';

describe('SortListsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SortListsService]
    });
  });

  it('should be created', inject([SortListsService], (service: SortListsService) => {
    expect(service).toBeTruthy();
  }));
});
