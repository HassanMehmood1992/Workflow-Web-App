/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: BadgeCountPipe
Description: Global pipe to return and integer value for the badge count of the selected process.
Location: ./pipes/badge-count.pipe
Author: Amir
Version: 1.0.0
Modification history: none
*/

import { Pipe, PipeTransform } from '@angular/core';
/**
 * pipe decorator
 * 
 * @export
 * @class BadgeCountPipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'badgeCount'
})
export class BadgeCountPipe implements PipeTransform {
/**
 * Returns the sum of input parameters
 * 
 * @param {*} taskcount 
 * @param {*} notificationCout 
 * @returns {*} 
 * @memberof BadgeCountPipe
 */
transform(taskcount: any, notificationCout: any): any {
    return parseInt(taskcount)+parseInt(notificationCout);
  }

}
