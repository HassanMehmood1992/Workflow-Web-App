/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FormatOffsetDatePipe
Description: Test cases for the format offset date pipe.
Location: ./pipes/format-offset-date.pipe.spec.ts
Author: Sheharyar
Version: 1.0.0
Modification history: none
*/
import { FormatOffsetDatePipe } from './format-offset-date.pipe';

describe('FormatOffsetDatePipe', () => {
  it('create an instance', () => {
    const pipe = new FormatOffsetDatePipe();
    expect(pipe).toBeTruthy();
  });
});
