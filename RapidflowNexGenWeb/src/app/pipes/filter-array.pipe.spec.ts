/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FilterArrayPipe
Description: Test cases for filter array pipe.
Location: ./filter-array.pipe.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { FilterArrayPipe } from './filter-array.pipe';

describe('FilterArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new FilterArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
