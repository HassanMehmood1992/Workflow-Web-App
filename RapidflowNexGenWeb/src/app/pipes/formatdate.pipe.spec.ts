/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FormatdatePipe
Description: Test cases for format date pipe.
Location: ./formatdate.pipe.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { FormatdatePipe } from './formatdate.pipe';

describe('FormatdatePipe', () => {
  it('create an instance', () => {
    const pipe = new FormatdatePipe();
    expect(pipe).toBeTruthy();
  });
});
