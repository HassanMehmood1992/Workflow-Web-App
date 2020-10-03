/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: BadgeCountPipe
Description: Test cases for bage count pipe.
Location: ./badge-count.pipe.spec.ts
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/
import { BadgeCountPipe } from './badge-count.pipe';

describe('BadgeCountPipe', () => {
  it('create an instance', () => {
    const pipe = new BadgeCountPipe();
    expect(pipe).toBeTruthy();
  });
});
