/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: KeysPipe
Description: Global pipe to return the given key value pair in the provided object.
Location: ./pipes/keys.pipe
Author: Sheharyar
Version: 1.0.0
Modification history: none
*/

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keys'
})
export class KeysPipe implements PipeTransform {

  /**
   * Function to transform a json array object to key value pair
   * Returns a key value pair of the provided json array object
   * @param {*} value 
   * @param {string[]} args 
   * @returns {*} 
   * @memberof KeysPipe
   */
  transform(value: any, args: string[]): any {
    let keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    return keys;
  }
}
