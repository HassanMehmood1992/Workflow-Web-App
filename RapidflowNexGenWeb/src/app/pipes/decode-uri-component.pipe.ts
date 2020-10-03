/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: DecodeUriComponentPipe
Description: Global pipe to perform decode uri component on the provided HTML value.
Location: ./pipes/decode-uri-component.pipe
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/

import { Pipe, PipeTransform } from '@angular/core';
/**
 * Pipe Decorator
 * 
 * @export
 * @class DecodeUriComponentPipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'decodeUriComponent'
})
export class DecodeUriComponentPipe implements PipeTransform {
/**
 * Reads the string and return the string after applying the javascript decodeUriComponent function
 * 
 * @param {*} value 
 * @param {*} [args] 
 * @returns {*} 
 * @memberof DecodeUriComponentPipe
 */
transform(value: any, args?: any): any {
    var decoded = value;
    try{
      decoded = decodeURIComponent(decoded);
      decoded = decodeURIComponent(decoded);
      return decoded;
    }
    catch(error){
      
      return decoded;
    }
  }
}
