/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SocketService
Description: Test cases for socket service.
Location: ./socket.service.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { TestBed, inject } from '@angular/core/testing';

import { SocketProvider } from '../services/socket.service';

describe('SocketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SocketProvider]
    });
  });

  it('should be created', inject([SocketProvider], (service: SocketProvider) => {
    expect(service).toBeTruthy();
  }));
});
