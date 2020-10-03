/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: KeysPipe
Description: Test cases for the keys pipe.
Location: ./pipes/keys.pipe.spec.ts
Author: Sheharyar
Version: 1.0.0
Modification history: none
*/
import { KeysPipe } from './keys.pipe';

describe('KeysPipe', () => {
  it('create an instance', () => {
    const pipe = new KeysPipe();
    expect(pipe).toBeTruthy();
  });
});
