/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: WorkflowRoutingService
Description: Unit test cases for the workflow routing service.
Location: ./services/workflow-routing.service.spec.ts
Author: Sheharyar
Version: 1.0.0
Modification history: none
*/
import { TestBed, inject } from '@angular/core/testing';

import { WorkflowRoutingService } from './workflow-routing.service';

describe('WorkflowRoutingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkflowRoutingService]
    });
  });

  it('should be created', inject([WorkflowRoutingService], (service: WorkflowRoutingService) => {
    expect(service).toBeTruthy();
  }));
});
