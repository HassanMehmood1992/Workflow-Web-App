/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FormatOffsetDatePipe
Description: Global pipe to return formated date as per local time zone of the process.
Location: ./pipes/format-offset-date.pipe
Author: Sheharyar
Version: 1.0.0
Modification history: none
*/

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'formatOffsetDate'
})
export class FormatOffsetDatePipe implements PipeTransform {

  /**
   * Transforms the provided utc date with local offset 
   * to user's local date time object
   * @param {*} date 
   * @param {*} [args] 
   * @returns {*} 
   * @memberof FormatOffsetDatePipe
   */
  transform(date: any, args?: any): any {
    if(date){
      var targetTime = new Date(date);
      var timeZoneFromDB = args; //time zone value from database
      //get the timezone offset from local time in minutes
      var tzDifference = parseFloat(timeZoneFromDB) * 60;
      //convert the offset to milliseconds, add to targetTime, and make a new Date
      var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
      return moment(offsetTime).format("DD-MMM-YYYY hh:mm A").toUpperCase();
    }
    return null;
  }

}
