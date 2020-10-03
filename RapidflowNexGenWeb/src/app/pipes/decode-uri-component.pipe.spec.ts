/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DecodeUriComponentPipe
Description: Test cases for decode uri component pipe.
Location: ./decode-uri-component.pipe.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { DecodeUriComponentPipe } from './decode-uri-component.pipe';

describe('DecodeUriComponentPipe', () => {
  it('create an instance', () => {
    const pipe = new DecodeUriComponentPipe();
    expect(pipe).toBeTruthy();
  });
});
