/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FilterArrayPipe
Description: Global pipe to filter items from the provided json array.
Location: ./pipes/filter-array.pipe
Author: Amir
Version: 1.0.0
Modification history: none
*/

import { Pipe, PipeTransform } from '@angular/core';
/**
 * Pipe Decorator
 * 
 * @export
 * @class FilterArrayPipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'filterArray'
})
export class FilterArrayPipe implements PipeTransform {

  /**
   * Get array and return the filtered array based on input string
   * 
   * @param {*} items 
   * @param {*} searchstring 
   * @returns {*} 
   * @memberof FilterArrayPipe
   */
  transform(items: any, searchstring: any): any {
    //default case if the search string do not contan any thing 
    if (searchstring === undefined) return items;
    if(searchstring=== '') return items;
    if(items === undefined) return [];
 
    // array filter function over ridding to filter if filter string is provided
    return items.filter(function(item) {
      for(let property in item){
        if (item[property] === null){
          continue;
        }
        //return th object if the object property contain the search string
        if(typeof item[property] == "object"){
          for(let i=0;i<item[property].length;i++){
            for(let key in item[property][i]){
              let obj = item[property][i][key];
              if(obj!=null&&obj!=undefined&&obj.toString().toLowerCase().includes(searchstring.toLowerCase())){
                return true;
              }
            }
          }
        }
        else{
          if(item[property]!=null&&item[property]!=undefined&&item[property].toString().toLowerCase().includes(searchstring.toLowerCase())){
            return true;
          }
        }
      }
      return false;
    });
  }

}
