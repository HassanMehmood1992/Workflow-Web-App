/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AutosizeDirective
Description: Provide functionality to auto expand and resize the provided textarea field.
Location: ./directives/autosize.directive.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { AutosizeDirective } from './autosize.directive';

describe('AutosizeDirective', () => {
  it('should create an instance', () => {
    const directive = new AutosizeDirective();
    expect(directive).toBeTruthy();
  });
});
